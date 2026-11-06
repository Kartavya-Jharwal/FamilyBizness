import { useSyncExternalStore } from "react";
const key="familybizness:family-name";
export let FAMILY_NAME = (()=>{try{return localStorage.getItem(key)?.trim()||"Your";}catch{return "Your";}})();
const listeners=new Set<()=>void>();
window.addEventListener("storage",event=>{if(event.key===key){FAMILY_NAME=event.newValue?.trim()||"Your";listeners.forEach(fn=>fn());}});
export function familyTitle(){return `${FAMILY_NAME} Family Office`;}
export function setFamilyName(value:string){FAMILY_NAME=value.trim().slice(0,60)||"Your";localStorage.setItem(key,FAMILY_NAME);document.title=familyTitle();listeners.forEach(fn=>fn());window.dispatchEvent(new Event("familybizness:family-name"));}
export function useFamilyName(){return useSyncExternalStore(fn=>{listeners.add(fn);return()=>{listeners.delete(fn);};},()=>FAMILY_NAME);}
export function FamilyNameField(){const name=useFamilyName();return <label className="family-form-row"><span>Family surname</span><input aria-label="Family surname" value={name} onChange={e=>setFamilyName(e.target.value)} /><span role="status">{familyTitle()} · Saved automatically in this browser</span></label>;}
