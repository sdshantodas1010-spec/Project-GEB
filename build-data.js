/* data/db.json (না থাকলে seed.json) থেকে public/data.json বানায়।
   Vercel-এর মতো স্ট্যাটিক হোস্টিংয়ে সাইট এই ফাইল পড়ে। কনটেন্ট বদলালে: node build-data.js */
const fs = require('fs'), path = require('path');
const src = ['data/db.json', 'data/seed.json'].map(f => path.join(__dirname, f)).find(f => fs.existsSync(f));
const db = JSON.parse(fs.readFileSync(src, 'utf8'));
const out = {
  subjects: db.subjects, topics: db.topics || [], papers: db.papers || [], curriculum: db.curriculum, details: db.details || {}, program: db.program,
  notices: db.notices || [], routine: db.routine || null, library: db.library || {}, resources: db.resources || [], quiz: db.quiz || [], viva: [],
  settings: { ...(db.settings || {}), community: { open: false } }, visits: 0, updated: new Date().toISOString()
};
fs.writeFileSync(path.join(__dirname, 'public', 'data.json'), JSON.stringify(out));
console.log('public/data.json লেখা হয়েছে, উৎস:', path.relative(__dirname, src));
