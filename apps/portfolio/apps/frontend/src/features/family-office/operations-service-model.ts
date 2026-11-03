import { z } from "zod";
import { validDate } from "./operations-model";
const amount=z.number().finite().min(0).max(1e12);
export const serviceSchema=z.object({id:z.string().min(1),name:z.string().min(1),provider:z.string().min(1),owner:z.string().min(1),model:z.enum(["SFO","MFO","Both"]),annualFixed:amount,aumBps:z.number().min(0).max(10000),setup:amount,reviewDue:z.string().refine(validDate,"Valid review date required"),source:z.string().min(1),status:z.enum(["Proposed","Active","Review","Retired"])});
export const servicesSchema=z.object({schema:z.literal(1),currency:z.enum(["GBP","USD","EUR"]),inflation:z.number().min(-10).max(50),aumGrowth:z.number().min(-100).max(100),years:z.number().int().min(1).max(10),taxPercent:z.number().min(0).max(100),services:z.array(serviceSchema).max(100)}).superRefine((v,c)=>{if(new Set(v.services.map(s=>s.id)).size!==v.services.length)c.addIssue({code:"custom",message:"Service IDs must be unique"});});
export type Services=z.infer<typeof servicesSchema>;
export const servicesKey=(profile:string)=>`familybizness:services:${profile}:1`;
export const initialServices:Services={schema:1,currency:"GBP",inflation:2.5,aumGrowth:3,years:5,taxPercent:0,services:[
 {id:"internal",name:"Office management and reporting",provider:"Illustrative internal team",owner:"Family chair",model:"SFO",annualFixed:220000,aumBps:0,setup:30000,reviewDue:"2027-01-31",source:"Synthetic fully loaded annual staffing assumption",status:"Proposed"},
 {id:"multi",name:"Multi-family office mandate",provider:"Illustrative external provider",owner:"Family chair",model:"MFO",annualFixed:50000,aumBps:40,setup:10000,reviewDue:"2027-01-31",source:"Synthetic quote; replace with provider schedule",status:"Proposed"},
 {id:"advice",name:"Legal, tax and independent valuation",provider:"Illustrative professional advisers",owner:"Finance lead",model:"Both",annualFixed:45000,aumBps:0,setup:0,reviewDue:"2027-01-31",source:"Synthetic professional-services budget",status:"Proposed"},
]};
export function serviceCosts(raw:Services,aum:number){const p=servicesSchema.parse(raw);if(!Number.isFinite(aum)||aum<0)throw new Error("A valid nonnegative AUM is needed");return Array.from({length:p.years},(_,index)=>{
 const year=index+1,assets=aum*Math.pow(1+p.aumGrowth/100,index);
 const cost=(model:"SFO"|"MFO")=>p.services.filter(s=>s.status!=="Retired"&&(s.model===model||s.model==="Both")).reduce((sum,s)=>sum+(s.annualFixed*Math.pow(1+p.inflation/100,index)+assets*s.aumBps/10000+(index===0?s.setup:0))*(1+p.taxPercent/100),0);
 return {year,assets,sfo:cost("SFO"),mfo:cost("MFO")};});}

export type Service = z.infer<typeof serviceSchema>;
