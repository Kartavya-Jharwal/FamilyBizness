import{o as n,k as s,t as o,j as t,_ as i}from"./main-Dh2Pe5oe.js";const c=n({id:t().trim().min(1).max(80),assignment:t().trim().min(1).max(200),section:t().trim().min(1).max(200),excerpt:t().trim().min(1).max(12e3),interpretation:t().trim().min(1).max(4e3),target:i(["governance","constitution","estate","finance","simulation","operations"]),parameter:t().trim().min(1).max(200),basis:i(["source-principle","operational-interpretation","modelling-assumption"]),status:i(["draft","reviewed"]),reviewer:t().max(200)}).superRefine((r,e)=>{r.status==="reviewed"&&!r.reviewer.trim()&&e.addIssue({code:"custom",message:"Name a reviewer before recording review",path:["reviewer"]})}),m=n({schema:o(1),sources:s(c).max(200)}).superRefine((r,e)=>{new Set(r.sources.map(a=>a.id)).size!==r.sources.length&&e.addIssue({code:"custom",message:"Source IDs must be unique",path:["sources"]})}),u=r=>`profile:${r}:office-source-register:v1`;function p(r){return m.parse(JSON.parse(r))}function l(r,e){const a=r.getItem(u(e));return a===null?{schema:1,sources:[]}:p(a)}function g(r){return`# Constitution To Tool Trace

Review records are local prototype evidence, not legal approval. Bindings document intended use; activation and numerical inputs are reviewed in their owning modules.

`+r.map(e=>`## ${e.id}

Source: ${e.assignment}, ${e.section}

Basis: ${e.basis}; status: ${e.status}; reviewer: ${e.reviewer||"pending"}

Excerpt:
${e.excerpt}

Interpretation: ${e.interpretation}

Target: ${e.target} / ${e.parameter}
`).join(`
`)}export{m as S,g as a,c as b,l,p,u as s};
