export function generateMarkdown(data: any) {
  return `---
title: ${data.title}
source: Codeforces
---
# ${data.title}

**Time Limit:** ${data.timeLimit} | **Memory Limit:** ${data.memoryLimit}

## Description
${data.description}

## Input Specification
${data.inputSpec}

## Output Specification
${data.outputSpec}

## Tests
${data.inputs
  .map(
    (input: string, i: number) => `
**Input ${i + 1}**
\`\`\`text
${input}
\`\`\`
**Output ${i + 1}**
\`\`\`text
${data.outputs[i]}
\`\`\`
`,
  )
  .join("\n")}

${data.note ? `## Note\n${data.note}` : ""}
`;
}
