let html = `**The Future of Autonomous AI Agents**
*Key take‑aways from the blog post*

| Topic | What the post says |
|-------|--------------------|
| **Current state** | We’re in the “Chatbot Phase” – single‑turn prompts that generate a response. |
| **Next leap** | Moving from *Assistants* to *Autonomous Agents* that can plan, act, evaluate, and iterate on their own. |`;

// Mock replacements that happen before table
html = html.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
html = html.replace(/\*(.*?)\*/g, '<em>$1</em>')

console.log("Before Table Regex:\n" + html + "\n---");

let result = html.replace(
      /^\|(.+)\|\s*\n\|([- :|]+)\|\s*\n((?:\|.*\|\s*\n?)*)/gm,
      (match) => { return "<TABLE MATCHED>" }
);
console.log("After Table Regex:\n" + result);
