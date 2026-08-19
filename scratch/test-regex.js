const html = `Quick Overview of the Blog Post
| Topic | Key Points |
|-------|------------|
| Current AI Landscape | We’re in the “Chatbot Phase”: single‑turn prompts → responses → evaluation. |
| Next Leap | Transition from Assistants to Autonomous Agents that self‑direct, act, and iterate. |
`;

let result = html.replace(
      /^\|(.+)\|\s*\n\|([- :|]+)\|\s*\n((?:\|.*\|\s*\n?)*)/gm,
      (match) => { return "<TABLE>" }
);
console.log(result);
