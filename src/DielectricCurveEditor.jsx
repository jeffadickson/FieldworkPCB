import React,{useState} from "react";
import {Button,NumberInput,TextInput,Stack,Text,Alert,Group} from "@mantine/core";
import {validateDielectricCurve} from "./models/material-dispersion.mjs";
export function DielectricCurveEditor({curve,onSave,onRemove}){
 const [source,setSource]=useState(curve?.source??"");
 const [points,setPoints]=useState(curve?.points??[{frequencyGHz:1,er:4.2,df:0.02},{frequencyGHz:10,er:4.0,df:0.025}]);
 const [error,setError]=useState("");
 const update=(i,key,val)=>setPoints(p=>p.map((v,j)=>j===i?{...v,[key]:val}:v));
 return <Stack mt="sm">
 <Text fw={700}>Material frequency samples</Text>
 <Text size="xs" c="dimmed">Illustrative starting numbers are not manufacturer measurements. Record actual source before applying.</Text>
 <TextInput label="Measurement or datasheet source" value={source} onChange={e=>setSource(e.currentTarget.value)}/>
 {points.map((p,i)=><Group key={i} grow align="end">
 <NumberInput label={"GHz "+(i+1)} value={p.frequencyGHz} onChange={v=>update(i,"frequencyGHz",v)}/>
 <NumberInput label={"Dk "+(i+1)} value={p.er} onChange={v=>update(i,"er",v)}/>
 <NumberInput label={"Df "+(i+1)} value={p.df} onChange={v=>update(i,"df",v)}/>
 <Button variant="subtle" disabled={points.length<=2} onClick={()=>setPoints(a=>a.filter((_,j)=>j!==i))}>Delete</Button>
 </Group>)}
 <Button variant="outline" disabled={points.length>=100} onClick={()=>setPoints(a=>[...a,{frequencyGHz:a.at(-1).frequencyGHz*2,er:a.at(-1).er,df:a.at(-1).df}])}>Add sample</Button>
 {error&&<Alert color="red">{error}</Alert>}
 <Group><Button onClick={()=>{try{const data={source,points};validateDielectricCurve(data);onSave(data);setError("");}catch(e){setError(e.message)}}}>Apply curve</Button>{curve&&<Button variant="outline" color="red" onClick={onRemove}>Clear curve</Button>}</Group>
 </Stack>;
}
