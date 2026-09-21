const fs = require('fs');
let src = fs.readFileSync('sources/moises/questions.js','utf8');
// neutralize browser/module export tails if any, then expose via eval
const sandbox = {};
const code = src + '\n;module.exports={QUESTION_BANK,SCENARIO_META};';
fs.writeFileSync('_moises_tmp.cjs', code);
const {QUESTION_BANK, SCENARIO_META} = require('./_moises_tmp.cjs');

function strip(html){
  return String(html)
    .replace(/<code>/g,'`').replace(/<\/code>/g,'`')
    .replace(/<br\s*\/?>/g,'\n')
    .replace(/<[^>]+>/g,'')
    .replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'")
    .trim();
}

const out = QUESTION_BANK.map(q => ({
  id: q.id,
  source: 'moisesprat',
  domain: q.domain,
  task: q.task || null,
  scenario: (SCENARIO_META[q.scenario] && SCENARIO_META[q.scenario].name) || q.scenario,
  stem: strip(q.stem),
  options: q.options.map(o => strip(o.text)),
  correct: q.correct,          // 0-indexed
  explanation: strip(q.explanation)
}));

fs.writeFileSync('parsed/moises.json', JSON.stringify(out,null,2));
console.log('moises parsed:', out.length);
console.log('domains:', JSON.stringify(out.reduce((a,q)=>{a[q.domain]=(a[q.domain]||0)+1;return a;},{})));
