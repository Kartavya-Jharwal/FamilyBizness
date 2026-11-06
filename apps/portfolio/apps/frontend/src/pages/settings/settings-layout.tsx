import { Outlet,Link,useLocation } from "react-router-dom";
import { settingsNavigation } from "../layouts/navigation/app-navigation";
import "@/features/family-office/navigation-settings.css";
export default function SettingsLayout(){const location=useLocation();return <main className="office-settings"><h1>Settings</h1><div className="settings-master-detail"><nav aria-label="Settings"><ul>{settingsNavigation.map(item=><li key={item.href}><Link to={item.href} aria-current={location.pathname===item.href?"page":undefined}>{item.title}</Link></li>)}</ul></nav><section className="settings-detail"><Link className="settings-back" to="/settings">Back to Settings</Link><Outlet/></section></div></main>;}
