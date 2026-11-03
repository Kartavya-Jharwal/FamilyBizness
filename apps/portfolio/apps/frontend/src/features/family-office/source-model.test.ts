import { describe, expect, it } from "vitest";
import { parseSourcePack, SourceSchema } from "./source-model";
const row = {id:"A1-1",assignment:"Member A",section:"4",excerpt:"Preserve capital",interpretation:"Model real spending sustainability",target:"simulation",parameter:"inflation",basis:"source-principle",status:"draft",reviewer:""};
describe("source provenance",()=>{
 it("requires named review and retains excerpts",()=>{expect(SourceSchema.parse(row).excerpt).toBe(row.excerpt); expect(()=>SourceSchema.parse({...row,status:"reviewed"})).toThrow();});
 it("rejects ambiguous duplicate source identities",()=>{expect(()=>parseSourcePack(JSON.stringify({schema:1,sources:[row,row]}))).toThrow();});
 it("rejects malformed imports without inventing source rows",()=>{expect(()=>parseSourcePack('{"schema":1,"sources":[{}]}')).toThrow(); expect(parseSourcePack('{"schema":1,"sources":[]}').sources).toEqual([]);});
});
