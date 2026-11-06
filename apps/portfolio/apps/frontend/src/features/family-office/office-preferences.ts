export const preferenceKey="familybizness:office-preferences";
export const preferenceDefaults={density:"comfortable",motion:"system",focus:"standard",text:"standard"};
export function readPreferences(){try{return {...preferenceDefaults,...JSON.parse(localStorage.getItem(preferenceKey)||"{}")};}catch{return {...preferenceDefaults};}}
export function applyPreferences(){const p=readPreferences(),root=document.documentElement;root.dataset.officeDensity=p.density;root.dataset.officeMotion=p.motion;root.dataset.officeFocus=p.focus;root.dataset.officeText=p.text;}
applyPreferences();
