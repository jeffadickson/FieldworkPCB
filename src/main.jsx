import React,{useState} from "react";
import {createRoot} from "react-dom/client";
import "@mantine/core/styles.css";
import {MantineProvider,AppShell,Group,Title,Text,Paper,SimpleGrid,NumberInput,Select,Stack,Alert,Badge,Burger,NavLink,Box} from "@mantine/core";
import {temperatureRise,currentForRise,widthForRise,fitIds,BROOKS_ADAM_REFERENCE} from "./models/brooks-adam-thermal.mjs";
function Calculator(){
 const [fit,setFit]=useState("external-air"),[width,setWidth]=useState(2.54),[thickness,setThickness]=useState(71.12),[current,setCurrent]=useState(10),[limit,setLimit]=useState(40);
 let calc,error;try{calc={
  rise:temperatureRise({widthMm:width,thicknessUm:thickness,currentA:current,fitId:fit}),
  max:currentForRise({widthMm:width,thicknessUm:thickness,temperatureRiseC:limit,fitId:fit}),
  required:widthForRise({currentA:current,thicknessUm:thickness,temperatureRiseC:limit,fitId:fit})
 }}catch(e){error=e.message}
 return <Stack gap="md">
 <Group justify="space-between"><div><Title order={2}>Conductor thermal</Title><Text size="sm" c="dimmed">Brooks–Adam empirical trace-heating model</Text></div><Badge color="orange" variant="light">Preliminary</Badge></Group>
 <SimpleGrid cols={{base:1,md:2}}>
 <Paper withBorder p="lg" radius="lg"><Stack>
 <Text fw={700}>Parameters</Text>
 <Select label="Published data fit" value={fit} onChange={setFit} data={fitIds.map(x=>({value:x,label:x.replaceAll("-"," · ")}))}/>
 <NumberInput label="Trace width" suffix=" mm" value={width} min={0.001} onChange={setWidth}/>
 <NumberInput label="Finished copper thickness" suffix=" µm" value={thickness} min={0.01} onChange={setThickness}/>
 <NumberInput label="Current" suffix=" A" value={current} min={0} onChange={setCurrent}/>
 <NumberInput label="Allowed temperature rise" suffix=" °C" value={limit} min={0.01} onChange={setLimit}/>
 </Stack></Paper>
 <Stack>
 <Paper withBorder p="lg" radius="lg"><Text fw={700}>Copper geometry</Text><svg viewBox="0 0 400 146" width="100%" role="img" aria-label="PCB conductor section"><rect x="15" y="65" width="370" height="65" rx="6" fill="#b5d3ce"/><rect x="115" y="50" width="170" height="20" fill="#c99554"/><text x="200" y="38" textAnchor="middle" fill="#234e52">W = {Number(width).toFixed(3)} mm</text><text x="295" y="63" fill="#234e52">t</text><text x="28" y="111" fill="#234e52">Dielectric</text></svg></Paper>
 <Paper withBorder p="lg" radius="lg"><Text fw={700}>Analysis</Text>{error?<Alert color="red">{error}</Alert>:<Stack gap="xs"><Text size="sm" c="dimmed">Estimated temperature rise</Text><Title order={2}>{calc.rise.toFixed(2)} °C</Title><Text size="sm">Current at allowed rise: <strong>{calc.max.toFixed(3)} A</strong></Text><Text size="sm">Width at allowed rise: <strong>{calc.required.toFixed(3)} mm</strong></Text></Stack>}</Paper>
 </Stack></SimpleGrid>
 <Alert color="yellow" title="Applicability">Published fitted curves, not IPC-2152 certification. No layer-plane spreading, board thermal simulation, material changes or airflow corrections. Copper-weight-specific fits should use their corresponding finished copper thickness.</Alert>
 <Paper withBorder p="lg"><Title order={4}>Model and references</Title><Text ff="monospace" mt="sm">ΔT = K × I^a × W^b × t^c</Text><Text size="sm" mt="sm">Width and finished thickness in mil, current in A, ΔT in °C. Coefficients: source Eq. 3-2, Table 3-1 and Appendix 6.</Text><Text size="sm" mt="sm"><a href={BROOKS_ADAM_REFERENCE.url} target="_blank" rel="noreferrer">{BROOKS_ADAM_REFERENCE.authors} (2015), {BROOKS_ADAM_REFERENCE.title}</a></Text></Paper>
 </Stack>;
}
function App(){const [open,setOpen]=useState(false);return <AppShell header={{height:64}} navbar={{width:240,breakpoint:"sm",collapsed:{mobile:!open}}} padding="lg"><AppShell.Header><Group h="100%" px="lg" justify="space-between"><Group><Burger opened={open} onClick={()=>setOpen(!open)} hiddenFrom="sm" size="sm"/><Box bg="teal" c="white" fw={900} px="sm" py={5} style={{borderRadius:8}}>F</Box><div><Text fw={800} lh="xs">FIELDWORK PCB</Text><Text size="xs" c="dimmed">ENGINEERING STUDIO</Text></div></Group><Badge variant="light" color="teal">v0.14</Badge></Group></AppShell.Header><AppShell.Navbar p="md" style={{background:"#102b33",color:"white"}}><Text fw={700} size="xs" c="gray.4">WORKSPACES</Text><NavLink mt="sm" active label="Conductor thermal"/><Text size="xs" mt="xl" c="gray.4">Remaining calculators will migrate after parity testing. Existing standalone app is distributed in the v0.14 package.</Text></AppShell.Navbar><AppShell.Main><Box maw={1150} mx="auto"><Calculator/></Box></AppShell.Main></AppShell>}
createRoot(document.getElementById("root")).render(<MantineProvider theme={{primaryColor:"teal",defaultRadius:"md"}}><App/></MantineProvider>);