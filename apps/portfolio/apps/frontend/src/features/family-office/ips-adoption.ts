import { officeIpsRules, officeIpsSource } from "./office-ips";
import { activatePolicy, policyKey } from "./policy-engine";
import { readConstitutionRegistry, writeConstitutionRegistry, constitutionRegistryKey } from "./constitution-pack-model";
import { sourceKey } from "./source-model";
import { saveWorkspace, loadWorkspace, workspaceKey } from "@/features/governance/constitution/workspace";
import { investmentSchema } from "./investment-model";
export function adoptOfficeIps(store: Pick<Storage, "getItem" | "setItem" | "removeItem">, profile: string, content: string, reviewer: string) {
    if (!reviewer.trim())
        throw Error("Name the reviewing Board member.");
    const rules = officeIpsRules(content), registry = readConstitutionRegistry(store, profile), active = registry.packs.find(p => p.id === registry.activePackId);
    if (!active)
        throw Error("Adopt the family charter first.");
    const risk = content.match(/within a (\d+(?:\.\d+)?)% annual volatility/i), target = content.match(/Target a (\d+(?:\.\d+)?)% annual net return/i);
    if (!risk || !target)
        throw Error("State target annual net return and annual volatility limit.");
    const keys = [workspaceKey(profile), constitutionRegistryKey(profile), sourceKey(profile), policyKey(profile), `profile:${profile}:family-office:investment:1`], before = new Map(keys.map(k => [k, store.getItem(k)]));
    try {
        const source = { ...officeIpsSource, excerpt: content, reviewer };
        const pack = { ...active, revision: active.revision + 1, reviewer, adoptedAt: new Date().toISOString(), sources: [...active.sources.filter(s => s.id !== source.id), source] };
        writeConstitutionRegistry(store, profile, { ...registry, packs: registry.packs.map(p => p.id === pack.id ? pack : p) });
        saveWorkspace(store, workspaceKey(profile), { ...loadWorkspace(store, workspaceKey(profile)), content });
        const raw = store.getItem(keys[4]);
        if (raw) {
            const p = investmentSchema.parse(JSON.parse(raw));
            store.setItem(keys[4], JSON.stringify(investmentSchema.parse({ ...p, target: Number(target[1]), riskMax: Number(risk[1]) })));
        }
        return activatePolicy(store, profile, { currency: "GBP", rules }, reviewer);
    }
    catch (error) {
        for (const [key, value] of before)
            value === null ? store.removeItem(key) : store.setItem(key, value);
        throw error;
    }
}
