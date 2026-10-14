import React from "react";
import {Badge,Button,Group,Paper,SimpleGrid,Stack,Text,Title} from "@mantine/core";
import {validateStackup} from "./models/stackup.mjs";
import {microstrip} from "./models/microstrip-synthesis.mjs";
export function ProjectOverview({stackup,navigate}){
 let summary,topZ,bottomZ,error;
 try{
 summary=validateStackup(stackup);
 const layer=stackup.layers;
 if(layer[0].role==="signal"&&["ground","power"].includes(layer[2].role))
 topZ=microstrip({widthMm:.2,heightMm:layer[1].thicknessMm,thicknessUm:layer[0].thicknessMm*1000,er:layer[1].er}).impedanceOhms;
 if(layer.at(-1).role==="signal"&&["ground","power"].includes(layer.at(-3).role))
 bottomZ=microstrip({widthMm:.2,heightMm:layer.at(-2).thicknessMm,thicknessUm:layer.at(-1).thicknessMm*1000,er:layer.at(-2).er}).impedanceOhms;
 }catch(e){error=e.message}
 const metrics=[["Copper layers",summary?.copperLayers??"—"],["Board thickness",summary?summary.totalMm.toFixed(3)+" mm":"—"],["Dielectrics",summary?.dielectricLayers??"—"]];
 const work=[{id:"stackup",icon:"▤",name:"Stackup designer",detail:"Layers, materials and reusable project geometry"},{id:"microstrip",icon:"≈",name:"Microstrip design",detail:"Characteristic impedance, synthesis and loss"},{id:"via",icon:"◎",name:"Via parameters",detail:"Barrel resistance, voltage drop and dissipation"},{id:"thermal",icon:"◉",name:"Conductor thermal",detail:"Current limits and estimated copper heating"}];
 return <Stack gap="lg">
 <div className="fieldwork-hero"><Text size="xs" fw={800} tt="uppercase" style={{letterSpacing:".15em",color:"#9ad6d2"}}>Your engineering workspace</Text><Title order={2}>{stackup.name}</Title><Text>One board. Connected calculations. Transparent engineering models.</Text><Badge color="cyan" variant="light" mt="sm">Stored on this device</Badge></div>
 {error&&<Paper withBorder p="md"><Text c="red">{error}</Text></Paper>}
 <SimpleGrid cols={{base:3}} spacing="sm">{metrics.map(([label,value])=><Paper key={label} withBorder p="md" className="fieldwork-metric"><Text size="xs" c="dimmed">{label}</Text><Text fw={800} size="lg">{value}</Text></Paper>)}</SimpleGrid>
 <Paper withBorder p="lg"><Group justify="space-between" mb="md"><div><Title order={3}>Board at a glance</Title><Text size="sm" c="dimmed">Current copper and dielectric construction</Text></div><Button variant="light" onClick={()=>navigate("stackup")}>Edit layers</Button></Group>
 <Stack gap={4}>{stackup.layers.map(l=><Group key={l.id} gap="sm" wrap="nowrap"><div style={{width:"38%",height:l.type==="copper"?10:Math.max(12,Math.min(48,l.thicknessMm*45)),borderRadius:4,background:l.type==="copper"?"#bf8b48":"#a9d2ca"}}/><Text size="xs">{l.id} · {l.type==="copper"?l.role:l.material+" · Dk "+l.er} · {l.thicknessMm} mm</Text></Group>)}</Stack>
 {(topZ!==undefined||bottomZ!==undefined)&&<Text size="xs" c="dimmed" mt="md">Illustrative 0.20 mm surface microstrip: {topZ!==undefined?"Top "+topZ.toFixed(1)+" Ω":""} {bottomZ!==undefined?" · Bottom "+bottomZ.toFixed(1)+" Ω":""}. Quasi-static estimate, not a controlled-impedance specification.</Text>}</Paper>
 <Title order={3}>Calculators</Title>
 <SimpleGrid cols={{base:1,sm:2}}>{work.map(w=><Paper key={w.id} withBorder p="lg"><Group align="flex-start" wrap="nowrap"><Text size="30px" c="teal" style={{width:44}}>{w.icon}</Text><Stack gap={6} style={{flex:1}}><Text fw={800}>{w.name}</Text><Text c="dimmed" size="sm">{w.detail}</Text><Button variant="light" mt="xs" fullWidth onClick={()=>navigate(w.id)}>Open calculator</Button></Stack></Group></Paper>)}</SimpleGrid>
 <Text size="xs" c="dimmed">All calculations are estimates with stated model assumptions. Material presets are illustrative until validated against manufacturer data.</Text>
 </Stack>;
}
