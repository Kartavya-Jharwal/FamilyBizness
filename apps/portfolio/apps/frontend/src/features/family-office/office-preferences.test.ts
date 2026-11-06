import {afterEach,expect,it} from "vitest";
import {preferenceKey,readPreferences,applyPreferences} from "./office-preferences";
afterEach(()=>{localStorage.removeItem(preferenceKey);applyPreferences();});
it("restores density motion and accessibility preferences on startup",()=>{localStorage.setItem(preferenceKey,JSON.stringify({density:"compact",motion:"reduce",focus:"enhanced",text:"large"}));applyPreferences();expect(readPreferences().motion).toBe("reduce");expect(document.documentElement.dataset.officeDensity).toBe("compact");expect(document.documentElement.dataset.officeFocus).toBe("enhanced");expect(document.documentElement.dataset.officeText).toBe("large");});
it("uses defaults when saved preferences cannot be parsed",()=>{localStorage.setItem(preferenceKey,"invalid");applyPreferences();expect(document.documentElement.dataset.officeDensity).toBe("comfortable");});
