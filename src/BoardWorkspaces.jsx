import {DielectricCurveEditor} from "./DielectricCurveEditor.jsx";
import React,{useRef,useState} from "react";
import {Alert,Badge,Button,FileButton,Group,NumberInput,Paper,Select,SimpleGrid,Stack,Text,TextInput,Title} from "@mantine/core";
import {starterStackup,validateStackup,serializeStackup,parseStackup,addInnerPair,MATERIALS} from "./models/stackup.mjs";
import {viaDC} from "./models/via.mjs";

function readFile(file,callback){if(!file)return;const reader=new FileReader();reader.onload=()=>callback(String(reader.result));reader.readAsText(file);}
function downloadJson(text,filename){
 const blob=new Blob([text],{type:"application/json"}),url=URL.createObjectURL(blob),a=document.createElement("a");
 a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);
}
export function StackupWorkspace({stackup,setStackup}){
 const [error,setError]=useState("");
 let summary;try{summary=validateStackup(stackup)}catch(e){error ||=e.message}
 const updateLayer=(index,props)=>{setError("");setStackup(prev=>({...prev,layers:prev.layers.map((l,i)=>i===index?{...l,...props}:l)}));};
 const load=(s)=>{try{setStackup(parseStackup(s));setError("")}catch(e){setError(e.message)}};
 return <Stack>
 <Group justify="space-between"><div><Title order={2}>Stackup designer</Title><Text size="sm" c="dimmed">Layer-by-layer design with local JSON save/load</Text></div><Badge color="teal">Offline files</Badge></Group>
 {error&&<Alert color="red">{error}</Alert>}
 <TextInput label="Board name" value={stackup.name} onChange={e=>setStackup({...stackup,name:e.currentTarget.value})}/>
 <Paper withBorder p="md"><Group justify="space-between"><Text fw={700}>Cross-section</Text><Text>{summary?.totalMm.toFixed(3)??"—"} mm total</Text></Group>
 <Stack gap={3} mt="sm">{stackup.layers.map((l,i)=><Group gap="sm" key={l.id} wrap="nowrap">
 <div style={{width:"42%",height:l.type==="copper"?9:Math.min(72,Math.max(12,l.thicknessMm*45)),background:l.type==="copper"?"#bf8b48":"#a9d2ca",borderRadius:3}}/>
 <Text size="xs" style={{flex:1}}>{l.id} · {l.type==="copper"?l.role:l.material} · {l.thicknessMm} mm</Text>
 </Group>)}</Stack></Paper>
 <Stack gap="sm">{stackup.layers.map((l,i)=><Paper key={l.id} withBorder p="sm"><Group justify="space-between" mb="xs"><Text fw={700} size="sm">{l.id} · {l.type}</Text></Group>
 <SimpleGrid cols={{base:1,sm:3}}><NumberInput label="Thickness (mm)" value={l.thicknessMm} decimalScale={5} min={0.0001} onChange={v=>updateLayer(i,{thicknessMm:v})}/>
 {l.type==="copper"?<Select label="Function" value={l.role} data={["signal","ground","power","mixed"]} onChange={v=>updateLayer(i,{role:v})}/>:<>
 <Select label="Material" value={l.material} data={[...Object.keys(MATERIALS)]} onChange={v=>updateLayer(i,{material:v,er:MATERIALS[v]?.er??l.er})}/>
 <NumberInput label="Relative Dk" value={l.er} min={1} max={30} onChange={v=>updateLayer(i,{er:v})}/>
 </>}</SimpleGrid>
 {l.type==="dielectric"&&<DielectricCurveEditor key={l.id+JSON.stringify(l.dielectricCurve??null)} curve={l.dielectricCurve} onSave={data=>updateLayer(i,{dielectricCurve:data})} onRemove={()=>{setStackup(prev=>({...prev,layers:prev.layers.map((old,j)=>{if(j!==i)return old;const {dielectricCurve,...rest}=old;return rest;})}));setError("");}}/>}
 </Paper>)}</Stack>
 <Group><Button variant="light" onClick={()=>{try{setStackup(addInnerPair(stackup));setError("")}catch(e){setError(e.message)}}}>Add inner copper layer</Button>
 <Button variant="default" onClick={()=>setStackup(starterStackup())}>Reset example</Button></Group>
 <Group><Button onClick={()=>{try{downloadJson(serializeStackup(stackup),"fieldwork-stackup.json");setError("")}catch(e){setError(e.message)}}}>Save JSON</Button>
 <FileButton accept=".json,application/json" onChange={f=>readFile(f,load)}><Button variant="outline">Load JSON</Button></FileButton></Group>
 <Alert color="yellow">Generic material Dk presets are illustrative. Frequency, glass weave and manufacturer construction affect actual dielectric properties. Imported files remain local and are validated.</Alert>
 </Stack>;
}
export function ViaWorkspace({stackup}){
 const [useBoard,setUseBoard]=useState(true),[board,setBoard]=useState(1.6),[hole,setHole]=useState(.3),[plating,setPlating]=useState(25),[current,setCurrent]=useState(1),[temp,setTemp]=useState(20);
 let result,error,actual=board;
 try{if(useBoard)actual=validateStackup(stackup).totalMm;result=viaDC({boardMm:actual,holeMm:Number(hole),platingUm:Number(plating),currentA:Number(current),temperatureC:Number(temp)});}catch(e){error=e.message}
 return <Stack>
 <Group justify="space-between"><div><Title order={2}>Via parameters</Title><Text size="sm" c="dimmed">Plated barrel DC resistance and power</Text></div><Badge color="orange">First-order</Badge></Group>
 <SimpleGrid cols={{base:1,md:2}}><Paper withBorder p="lg"><Stack>
 <Button variant={useBoard?"filled":"outline"} onClick={()=>setUseBoard(!useBoard)}>{useBoard?"Using saved stackup":"Use active stackup"}</Button>
 <NumberInput label="Board thickness" suffix=" mm" value={actual} onChange={setBoard} disabled={useBoard} min={.001}/>
 <NumberInput label="Finished hole" suffix=" mm" value={hole} onChange={setHole} min={.01}/>
 <NumberInput label="Via plating thickness" suffix=" µm" value={plating} onChange={setPlating} min={.1}/>
 <NumberInput label="Current" suffix=" A" value={current} onChange={setCurrent}/>
 <NumberInput label="Copper temperature" suffix=" °C" value={temp} onChange={setTemp}/>
 </Stack></Paper>
 <Stack><Paper withBorder p="lg"><Text fw={700}>Plated through-hole via</Text>
 <svg role="img" aria-label="Via barrel through printed circuit board" width="100%" viewBox="0 0 330 210">
 <rect x="26" y="32" width="278" height="146" fill="#b7d6cf" rx="4"/>
 <rect x="130" y="24" width="70" height="162" fill="#c79650"/>
 <rect x="142" y="32" width="46" height="146" fill="#f9fafb"/>
 <rect x="107" y="26" width="116" height="13" fill="#c79650"/>
 <rect x="107" y="171" width="116" height="13" fill="#c79650"/>
 <text x="165" y="15" fontSize="12" textAnchor="middle">Hole {Number(hole)} mm</text>
 <text x="205" y="108" fontSize="12" fill="#25525c">Cu {Number(plating)} µm</text>
 <text x="32" y="199" fontSize="12">Board {Number(actual).toFixed(3)} mm</text>
 </svg></Paper>
 <Paper withBorder p="lg"><Text fw={700}>Electrical results</Text>{error?<Alert color="red">{error}</Alert>:<Stack gap={4} mt="sm"><Title order={2}>{(result.resistanceOhms*1000).toFixed(3)} mΩ</Title><Text>Voltage drop: {(result.voltageDropV*1000).toFixed(3)} mV</Text><Text>Power: {(result.powerW*1000).toFixed(3)} mW</Text><Text>Barrel copper area: {result.areaMm2.toFixed(5)} mm²</Text><Text>Current density: {result.currentDensityAmm2.toFixed(2)} A/mm²</Text></Stack>}</Paper></Stack></SimpleGrid>
 <Alert color="yellow" title="Model scope">DC electrical resistance of a uniform cylindrical copper barrel using R=ρL/A and temperature correction. Not an IPC-2152 ampacity rating, field-solved via impedance, or verified via thermal-rise prediction.</Alert>
 </Stack>;
}
