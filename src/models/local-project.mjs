import {parseStackup,serializeStackup,starterStackup} from "./stackup.mjs";
export const PROJECT_STORAGE_KEY="fieldwork.stackup.v1";
/** Storage is injected so tests require no browser globals. */
export function loadLocalStackup(storage){
 try{
  const raw=storage?.getItem(PROJECT_STORAGE_KEY);
  return raw?{stackup:parseStackup(raw),warning:null}:{stackup:starterStackup(),warning:null};
 }catch(e){
  return {stackup:starterStackup(),warning:"Saved stackup could not be loaded; the example board is shown. Re-import a valid JSON backup if needed."};
 }
}
export function saveLocalStackup(storage,stackup){
 const json=serializeStackup(stackup);
 if(!storage?.setItem)return {ok:false,error:"Local storage is unavailable; use Save JSON to preserve this project."};
 try{storage.setItem(PROJECT_STORAGE_KEY,json);return {ok:true,error:null}}
 catch(e){return {ok:false,error:"Local storage failed; export your stackup as JSON."}}
}
