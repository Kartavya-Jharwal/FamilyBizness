import { Navigate, useSearchParams } from "react-router-dom";
/** Preserve saved links while office settings live in the donor's Settings route. */
export default function AdministrationPage(){const [params]=useSearchParams();const section=params.get("section");return <Navigate replace to={section==="policy"?"/office/policy?edit=1":section==="backup"?"/settings/records":section==="data"?"/settings/sources":"/settings/office"}/>;}
