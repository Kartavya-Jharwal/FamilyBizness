import { SimulationDonorLab } from "./simulation-lab-workspace";
import { FamilyOfficeShell } from "./family-office-shell";
import InvestmentWorkspace from "./investment-workspace";
export default function SimulationPage(){return <FamilyOfficeShell title="Portfolio allocation & multi-generation scenarios"><InvestmentWorkspace/><SimulationDonorLab/></FamilyOfficeShell>;}
