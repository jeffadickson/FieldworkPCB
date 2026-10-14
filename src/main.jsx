import {ProjectOverview} from "./ProjectOverview.jsx";
import {conductorLoss} from "./models/conductor-loss.mjs";
import {microstripDielectricLoss} from "./models/dielectric-loss.mjs";
import {interpolateDielectric} from "./models/material-dispersion.mjs";
import {StackupWorkspace,ViaWorkspace} from "./BoardWorkspaces.jsx";
import {starterStackup,surfaceMicrostripGeometry} from "./models/stackup.mjs";
import React,{useState,useEffect} from "react";
import {loadLocalStackup,saveLocalStackup,shouldAutoSave} from "./models/local-project.mjs";
import {createRoot} from "react-dom/client";
import "@mantine/core/styles.css";
import "./fieldwork.css";
import {MantineProvider,AppShell,Group,Title,Text,Paper,SimpleGrid,NumberInput,Select,Stack,Alert,Badge,Burger,NavLink,Box} from "@mantine/core";
import {microstrip,synthesizeMicrostrip} from "./models/microstrip-synthesis.mjs";
import {temperatureRise,currentForRise,widthForRise,fitIds,BROOKS_ADAM_REFERENCE} from "./models/brooks-adam-thermal.mjs";
function Calculator(){
 const [fit,setFit]=useState("external-air"),[width,setWidth]=useState(2.54),[thickness,setThickness]=useState(71.12),[current,setCurrent]=useState(10),[limit,setLimit]=useState(40);
 let calc,error;try{calc={
  rise:temperatureRise({widthMm:width,thicknessUm:thickness,currentA:current,fitId:fit}),
  max:currentForRise({widthMm:width,thicknessUm:thickness,temperatureRiseC:limit,fitId:fit}),
  required:widthForRise({currentA:current,thicknessUm:thickness,temperatureRiseC:limit,fitId:fit})
 }}catch(e){error=e.message}
 return <Stack gap="lg"><div className="fieldwork-hero"><Text size="xs" fw={800} tt="uppercase" style={{letterSpacing:".15em",color:"#9ad6d2"}}>Power · Thermal engineering</Text><Title order={2}>Conductor thermal</Title><Text>Estimate copper temperature rise, current limits and required geometry.</Text><Badge color="yellow" variant="light" mt="sm">Empirical · Preliminary</Badge></div>
 <SimpleGrid cols={{base:1,md:2}}>
 <Paper withBorder p="lg" radius="lg"><Stack>
 <Text fw={800} size="lg">Design inputs</Text>
 <Select label="Published data fit" value={fit} onChange={setFit} data={fitIds.map(x=>({value:x,label:x.replaceAll("-"," · ")}))}/>
 <NumberInput label="Trace width" suffix=" mm" value={width} min={0.001} onChange={setWidth}/>
 <NumberInput label="Finished copper thickness" suffix=" µm" value={thickness} min={0.01} onChange={setThickness}/>
 <NumberInput label="Current" suffix=" A" value={current} min={0} onChange={setCurrent}/>
 <NumberInput label="Allowed temperature rise" suffix=" °C" value={limit} min={0.01} onChange={setLimit}/>
 </Stack></Paper>
 <Stack>
 <Paper withBorder p="lg" radius="lg"><Text fw={700}>Copper geometry</Text><svg viewBox="0 0 400 146" width="100%" role="img" aria-label="PCB conductor section"><rect x="15" y="65" width="370" height="65" rx="6" fill="#b5d3ce"/><rect x="115" y="50" width="170" height="20" fill="#c99554"/><text x="200" y="38" textAnchor="middle" fill="#234e52">W = {Number(width).toFixed(3)} mm</text><text x="295" y="63" fill="#234e52">t</text><text x="28" y="111" fill="#234e52">Dielectric</text></svg></Paper>
 <Paper withBorder p="lg" radius="lg"><Text fw={800} size="lg">Thermal results</Text>{error?<Alert color="red">{error}</Alert>:<Stack gap="xs"><Text size="sm" c="dimmed">Estimated temperature rise</Text><Title order={2}>{calc.rise.toFixed(2)} °C</Title><Text size="sm">Current at allowed rise: <strong>{calc.max.toFixed(3)} A</strong></Text><Text size="sm">Width at allowed rise: <strong>{calc.required.toFixed(3)} mm</strong></Text></Stack>}</Paper>
 </Stack></SimpleGrid>
 <Alert color="yellow" title="Applicability">Published fitted curves, not IPC-2152 certification. No layer-plane spreading, board thermal simulation, material changes or airflow corrections. Copper-weight-specific fits should use their corresponding finished copper thickness.</Alert>
 <Paper withBorder p="lg"><Title order={4}>Model and references</Title><Text ff="monospace" mt="sm">ΔT = K × I^a × W^b × t^c</Text><Text size="sm" mt="sm">Width and finished thickness in mil, current in A, ΔT in °C. Coefficients: source Eq. 3-2, Table 3-1 and Appendix 6.</Text><Text size="sm" mt="sm"><a href={BROOKS_ADAM_REFERENCE.url} target="_blank" rel="noreferrer">{BROOKS_ADAM_REFERENCE.authors} (2015), {BROOKS_ADAM_REFERENCE.title}</a></Text></Paper>
 </Stack>;
}

function ImpedanceSynthesis({stackup}){
 const [target,setTarget]=useState(50),[h,setH]=useState(0.18),[t,setT]=useState(35),[er,setEr]=useState(4.2),[width,setWidth]=useState(0.35);
 const [stackupSide,setStackupSide]=useState("manual");const [freqGHz,setFreqGHz]=useState(1);const [lengthMm,setLengthMm]=useState(100);const [manualDf,setManualDf]=useState(0.02);const [rho,setRho]=useState(1.724e-8);
 let linked=null,linkedError=null;
 if(stackupSide!=="manual"){try{linked=surfaceMicrostripGeometry(stackup,stackupSide,freqGHz)}catch(e){linkedError=e.message}}
 const params=linked??{heightMm:Number(h),thicknessUm:Number(t),er:Number(er)};
 let analysis,synthesis,error,loss,lossNote,copperLoss;
 try{
   if(linkedError) throw new Error(linkedError);
   analysis=microstrip({widthMm:Number(width),...params});
   copperLoss=conductorLoss({frequencyGHz:Number(freqGHz),widthMm:Number(width),heightMm:params.heightMm,impedanceOhms:analysis.impedanceOhms,lengthMm:Number(lengthMm),rho:Number(rho),thicknessUm:params.thicknessUm});
   synthesis=synthesizeMicrostrip({targetOhms:Number(target),...params});
   const seq=stackupSide==="bottom"?[...stackup.layers].reverse():stackup.layers;
   const layer=stackupSide==="manual"?null:seq[1];
   const df=layer?.dielectricCurve?interpolateDielectric(layer.dielectricCurve,Number(freqGHz)).df:(stackupSide==="manual"?Number(manualDf):null);
   if(df===null)lossNote="No characterized Df for selected dielectric; loss result disabled.";
   else loss=microstripDielectricLoss({frequencyGHz:Number(freqGHz),er:params.er,effectiveEr:analysis.effectivePermittivity,lossTangent:df,lengthMm:Number(lengthMm)});
 }catch(e){error=e.message}
 return <Stack gap="lg"><div className="fieldwork-hero"><Text size="xs" fw={800} tt="uppercase" style={{letterSpacing:".15em",color:"#9ad6d2"}}>Signal integrity · RF</Text><Title order={2}>Microstrip design</Title><Text>Design by impedance or trace geometry, with linked material properties and loss estimates.</Text><Badge color="cyan" variant="light" mt="sm">Hammerstad–Jensen · Quasi-static</Badge></div>
 <SimpleGrid cols={{base:1,md:2}}>
 <Paper withBorder p="lg"><Stack gap="sm">
 <Text fw={800} size="lg">Geometry & materials</Text>
 <NumberInput label="Analysis frequency" suffix=" GHz" value={freqGHz} min={0.001} onChange={setFreqGHz}/>
 <Select label="Geometry source" value={stackupSide} onChange={setStackupSide} data={[{value:"manual",label:"Manual values"},{value:"top",label:"Active stackup · top signal"},{value:"bottom",label:"Active stackup · bottom signal"}]}/>
 {linked&&<Text size="xs" c="teal">Linked to {stackup.name}; edits to the stackup update impedance automatically.</Text>}
 {linkedError&&<Alert color="red">{linkedError}</Alert>}

 <NumberInput label="Trace width" value={width} onChange={setWidth} suffix=" mm" min={0.01}/>
 <NumberInput label="Reference plane distance" value={params.heightMm} onChange={setH} suffix=" mm" min={0.001} disabled={!!linked}/>
 <NumberInput label="Copper thickness" value={params.thicknessUm} onChange={setT} suffix=" µm" min={0} disabled={!!linked}/>
 <NumberInput label="Relative permittivity (Dk)" value={params.er} onChange={setEr} min={1} decimalScale={3} disabled={!!linked}/>
 <NumberInput label="Copper resistivity (Ω·m)" value={rho} onChange={setRho} min={1e-10} step={1e-9} precision={12}/>
 <NumberInput label="Trace length" suffix=" mm" value={lengthMm} min={0} onChange={setLengthMm}/>
 {stackupSide==="manual"&&<NumberInput label="Dissipation factor (Df)" value={manualDf} min={0} max={0.2} decimalScale={5} onChange={setManualDf}/>}
 <NumberInput label="Target impedance" value={target} onChange={setTarget} suffix=" Ω" min={1}/>
 </Stack></Paper>
 <Stack gap="md">
 <Paper withBorder p="lg"><Text fw={800} size="lg" mb="xs">Transmission-line cross-section</Text>
 <svg width="100%" viewBox="0 0 400 165" role="img" aria-label="Microstrip geometry above reference plane">
 <rect x="12" y="58" width="376" height="86" rx="5" fill="#bfdad4"/>
 <rect x="12" y="138" width="376" height="7" fill="#c8954a"/>
 <rect x="160" y="49" width="80" height="9" rx="1" fill="#c8954a"/>
 <text x="200" y="32" fill="#204956" textAnchor="middle" fontSize="14">W = {Number(width).toFixed(3)} mm</text>
 <text x="30" y="98" fill="#204956" fontSize="13">Dk = {Number(params.er).toFixed(2)}</text>
 <text x="265" y="107" fill="#204956" fontSize="13">h = {Number(params.heightMm).toFixed(3)} mm</text>
 </svg></Paper>
 <Paper withBorder p="lg"><Text fw={800} size="lg">Calculated results</Text>{error?<Alert color="red" title="Invalid geometry">{error}</Alert>:<>
 <Text size="sm" mt="sm" c="dimmed">Impedance of entered geometry</Text><Title order={2}>{analysis.impedanceOhms.toFixed(3)} Ω</Title>
 <Text size="sm">Effective Dk: {analysis.effectivePermittivity.toFixed(4)}</Text>
 <Text size="sm" mt="sm" c="dimmed">Width for {Number(target).toFixed(1)} Ω</Text>
 <Title order={2}>{synthesis.widthMm.toFixed(4)} mm</Title>
 <Text size="xs" c="dimmed">Achieved: {synthesis.achievedOhms.toFixed(4)} Ω; constrained to 0.025–10 mm width</Text>
 {copperLoss&&<><Text size="sm" mt="sm" c="dimmed">Preliminary conductor attenuation</Text><Title order={3}>{copperLoss.totalDb.toFixed(4)} dB</Title><Text size="xs">Skin depth {copperLoss.skinDepthUm.toFixed(3)} µm · {copperLoss.dbPerMeter.toFixed(3)} dB/m</Text>{!copperLoss.thickEnough&&<Text size="xs" c="red">Copper thickness below 3 skin depths; high-frequency approximation unreliable</Text>}</>}
 {loss?<><Text size="sm" mt="sm" c="dimmed">Approximate dielectric attenuation</Text><Title order={3}>{loss.totalDb.toFixed(4)} dB</Title><Text size="xs">{loss.dbPerMeter.toFixed(3)} dB/m · excludes copper, roughness, radiation and mismatch</Text></>:<Text size="xs" c="dimmed">{lossNote}</Text>}
 </>}</Paper>
 </Stack></SimpleGrid>
 <Alert color="yellow" title="Engineering limitations">Quasi-static single microstrip impedance model; preliminary conductor and dielectric loss estimates are separate. No soldermask, causal broadband dispersion, roughness, or full-wave field effects. Dk(f) uses source-attributed samples and bounded interpolation if defined in stackup JSON. Synthesis is limited to a finite manufacturable search interval.</Alert>
 <Paper withBorder p="lg"><Text fw={700}>Equation provenance</Text><Text size="sm">Hammerstad & Jensen (1980), finite-copper-thickness microstrip equations; <a href="https://qucs.github.io/tech/node75.html" target="_blank" rel="noreferrer">Qucs theory reference</a>. Numerical verification covers inverse consistency; independent EM comparison remains outstanding.</Text></Paper>
 </Stack>
}

const workspaces=[{id:"overview",title:"Project overview",symbol:"⌂",category:"Project"},{id:"thermal",title:"Conductor thermal",symbol:"◉",category:"Power & thermal"},{id:"microstrip",title:"Microstrip design",symbol:"≈",category:"Signal integrity"},{id:"via",title:"Via parameters",symbol:"◎",category:"Interconnects"},{id:"stackup",title:"Stackup designer",symbol:"▤",category:"Board construction"}];
function getSafeStorage(){try{return typeof window==="undefined"?null:window.localStorage}catch{return null}}
function App(){
 const [open,setOpen]=useState(false),[active,setActive]=useState("overview");
 const [initialProject]=useState(()=>loadLocalStackup(getSafeStorage()));
 const [stackup,setStackupInternal]=useState(initialProject.stackup);
 const [edited,setEdited]=useState(false);
 const [saveWarning,setSaveWarning]=useState(initialProject.warning??"");
 const setStackup=value=>{setEdited(true);setStackupInternal(value);};
 useEffect(()=>{if(!shouldAutoSave(initialProject.warning,edited))return;const result=saveLocalStackup(getSafeStorage(),stackup);setSaveWarning(result.error??"");},[stackup,edited]);
 const navigate=id=>{setActive(id);setOpen(false);};
 const current=workspaces.find(w=>w.id===active);
 return <AppShell header={{height:68}} navbar={{width:256,breakpoint:"sm",collapsed:{mobile:!open}}} padding={{base:"md",md:"xl"}}>
  <AppShell.Header className="fieldwork-header"><Group h="100%" px={{base:"md",md:"xl"}} justify="space-between">
   <Group gap="sm"><Burger aria-label="Toggle navigation" opened={open} onClick={()=>setOpen(!open)} hiddenFrom="sm" size="sm"/>
    <Box style={{width:38,height:38,borderRadius:12,display:"grid",placeItems:"center",background:"#12646a",color:"#fff",fontSize:22,fontWeight:900}}>F</Box>
    <Box><Text fw={900} size="md" lh={1.1} style={{letterSpacing:"-.04em",color:"#173646"}}>FIELDWORK <span style={{color:"#138b8b"}}>PCB</span></Text><Text size="10px" fw={700} c="dimmed" style={{letterSpacing:".17em"}}>ENGINEERING STUDIO</Text></Box>
   </Group>
   <Group gap="xs"><Badge color="teal" variant="light">LOCAL · OFFLINE</Badge><Badge variant="outline" color="gray">v0.32</Badge></Group>
  </Group></AppShell.Header>
  <AppShell.Navbar className="fieldwork-nav" p="md"><Box px="sm" pt="lg" pb="sm"><Text size="10px" fw={800} style={{letterSpacing:".2em",color:"#84a6b1"}}>WORKSPACES</Text></Box>
   {workspaces.map(w=><NavLink key={w.id} active={active===w.id} label={<Group gap="xs"><Text fw={800} size="lg" style={{width:26,textAlign:"center"}}>{w.symbol}</Text><Text fw={700} size="sm">{w.title}</Text></Group>} onClick={()=>navigate(w.id)}/>)}
   <Box className="fieldwork-nav-foot"><Text fw={700} size="sm" c="#d8e7e8" mb="xs">Active design</Text><Text size="sm" c="#d8e7e8">{stackup.name}</Text><Text size="xs" c="#a3bcc3">{stackup.layers.filter(l=>l.type==="copper").length} copper layers · Saved locally</Text><Text mt="lg" size="xs" c="#a3bcc3">Engineering models, assumptions and references remain visible alongside each result.</Text></Box>
  </AppShell.Navbar>
  <AppShell.Main className="fieldwork-main"><Box className="fieldwork-page">
   <Group justify="space-between" mb="lg" align="center"><Box><Text className="fieldwork-kicker">ENGINEERING WORKBENCH / {current.category.toUpperCase()}</Text><Text fw={700} size="xs" c="dimmed" mt="xs">Active project: {stackup.name}</Text></Box><Badge variant="dot" color="teal">Local workspace</Badge></Group>
   <div className="fieldwork-mobile-tabs" aria-label="Calculator navigation"><div>{workspaces.map(w=><button type="button" key={w.id} aria-pressed={active===w.id} onClick={()=>navigate(w.id)}>{w.title}</button>)}</div></div>
   {saveWarning&&<Alert color="yellow" mb="md">{saveWarning}</Alert>}
   {active==="overview"?<ProjectOverview stackup={stackup} navigate={navigate}/>:active==="thermal"?<Calculator/>:active==="microstrip"?<ImpedanceSynthesis stackup={stackup}/>:active==="via"?<ViaWorkspace stackup={stackup}/>:<StackupWorkspace stackup={stackup} setStackup={setStackup}/>}
   <Group mt="xl" justify="space-between"><Text size="xs" c="dimmed">FIELDWORK PCB · Numerical results are model estimates.</Text><Text size="xs" c="dimmed">Sources and validity limits are shown within each workspace.</Text></Group>
  </Box></AppShell.Main>
 </AppShell>;
}
createRoot(document.getElementById("root")).render(<MantineProvider theme={{
 primaryColor:"teal",defaultRadius:"md",fontFamily:"Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
 colors:{teal:["#e8f8f5","#d0f0ed","#a4e2dd","#75d2cb","#4bbeb9","#1b9998","#127c80","#0f656e","#104e59","#113c48"]}
}}><App/></MantineProvider>);
