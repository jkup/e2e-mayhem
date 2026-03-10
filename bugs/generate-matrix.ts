import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

interface BugResult {
  id: string;
  name: string;
  category: string;
  severity: string;
  blind: { detected: boolean; test_file: string | null; failure_message: string | null };
  guided: { detected: boolean; test_file: string | null; failure_message: string | null };
}

const results: { bugs: BugResult[] } = JSON.parse(
  readFileSync(join(__dirname, 'results.json'), 'utf-8')
);

const bugs = results.bugs;

// --- Main detection matrix ---
const lines: string[] = [];
lines.push('# Bug Detection Matrix\n');
lines.push('| # | Bug Name | Category | Severity | Blind | Guided |');
lines.push('|---|----------|----------|----------|-------|--------|');

let blindTotal = 0;
let guidedTotal = 0;

for (const bug of bugs) {
  const blind = bug.blind.detected ? '✅' : '❌';
  const guided = bug.guided.detected ? '✅' : '❌';
  if (bug.blind.detected) blindTotal++;
  if (bug.guided.detected) guidedTotal++;
  const num = bug.id.replace('BUG-', '');
  lines.push(`| ${num} | ${bug.name} | ${bug.category} | ${bug.severity} | ${blind} | ${guided} |`);
}

lines.push(`| | **Detection Rate** | | | **${blindTotal}/${bugs.length}** | **${guidedTotal}/${bugs.length}** |`);
lines.push('');

// --- Per-category breakdown ---
lines.push('## Per-Category Breakdown\n');
lines.push('| Category | Blind | Guided |');
lines.push('|----------|-------|--------|');

const categories = [...new Set(bugs.map(b => b.category))].sort();
for (const cat of categories) {
  const catBugs = bugs.filter(b => b.category === cat);
  const blindCat = catBugs.filter(b => b.blind.detected).length;
  const guidedCat = catBugs.filter(b => b.guided.detected).length;
  lines.push(`| ${cat} | ${blindCat}/${catBugs.length} | ${guidedCat}/${catBugs.length} |`);
}

lines.push('');

// --- Per-severity breakdown ---
lines.push('## Per-Severity Breakdown\n');
lines.push('| Severity | Blind | Guided |');
lines.push('|----------|-------|--------|');

for (const sev of ['high', 'medium', 'low']) {
  const sevBugs = bugs.filter(b => b.severity === sev);
  if (sevBugs.length === 0) continue;
  const blindSev = sevBugs.filter(b => b.blind.detected).length;
  const guidedSev = sevBugs.filter(b => b.guided.detected).length;
  lines.push(`| ${sev} | ${blindSev}/${sevBugs.length} | ${guidedSev}/${sevBugs.length} |`);
}

lines.push('');

// --- Bugs missed by both ---
const missedByBoth = bugs.filter(b => !b.blind.detected && !b.guided.detected);
if (missedByBoth.length > 0) {
  lines.push('## Missed by Both Approaches\n');
  for (const bug of missedByBoth) {
    lines.push(`- **${bug.id}**: ${bug.name} (${bug.category}, ${bug.severity})`);
  }
  lines.push('');
}

// --- Bugs only caught by guided ---
const guidedOnly = bugs.filter(b => !b.blind.detected && b.guided.detected);
if (guidedOnly.length > 0) {
  lines.push('## Caught Only by Guided (Screenshots + Exploration)\n');
  for (const bug of guidedOnly) {
    lines.push(`- **${bug.id}**: ${bug.name} (${bug.category}, ${bug.severity})`);
  }
  lines.push('');
}

// --- Bugs only caught by blind ---
const blindOnly = bugs.filter(b => b.blind.detected && !b.guided.detected);
if (blindOnly.length > 0) {
  lines.push('## Caught Only by Blind\n');
  for (const bug of blindOnly) {
    lines.push(`- **${bug.id}**: ${bug.name} (${bug.category}, ${bug.severity})`);
  }
  lines.push('');
}

const output = lines.join('\n');
const outputPath = join(__dirname, 'MATRIX.md');
writeFileSync(outputPath, output);

// Also print to stdout
console.log(output);
console.log(`\nWritten to ${outputPath}`);
