import { writeFileSync } from 'fs';

const SPARQL = `
SELECT DISTINCT ?name ?city WHERE {
  ?h wdt:P31/wdt:P279* wd:Q16917 ;
     wdt:P17 ?country ;
     rdfs:label ?name .
  FILTER(?country IN (wd:Q38, wd:Q29))
  FILTER(LANG(?name) IN ("it","es","en"))
  OPTIONAL {
    ?h wdt:P131 ?cityEntity .
    ?cityEntity rdfs:label ?city .
    FILTER(LANG(?city) IN ("it","es","en"))
  }
}
ORDER BY ?name
`;

const url = `https://query.wikidata.org/sparql?query=${encodeURIComponent(SPARQL)}&format=json`;

console.log('Fetching from Wikidata...');
const res = await fetch(url, {
  headers: { 'User-Agent': 'LemoTraining/1.0 (hospital list builder)' }
});
if (!res.ok) throw new Error(`HTTP ${res.status}`);
const data = await res.json();

const seen = new Set();
const hospitals = [];

for (const row of data.results.bindings) {
  const name = row.name?.value?.trim();
  if (!name || name.length < 4) continue;
  const key = name.toLowerCase();
  if (seen.has(key)) continue;
  seen.add(key);
  hospitals.push({ name, city: row.city?.value?.trim() || '' });
}

// Ospedali importanti mancanti da Wikidata
const manual = [
  { name: 'Ospedale San Jacopo', city: 'Pistoia' },
  { name: 'Istituto di Candiolo - FPO IRCCS', city: 'Candiolo' },
  { name: 'Ospedale di Pistoia', city: 'Pistoia' },
  { name: 'Ospedale San Donato', city: 'Arezzo' },
  { name: 'Ospedale della Misericordia', city: 'Grosseto' },
  { name: 'Ospedale Versilia', city: 'Camaiore' },
  { name: 'Ospedale San Luca', city: 'Lucca' },
  { name: 'Presidio Ospedaliero di Livorno', city: 'Livorno' },
  { name: 'Ospedale di Portoferraio', city: 'Portoferraio' },
];
for (const h of manual) {
  const key = h.name.toLowerCase();
  if (!seen.has(key)) { seen.add(key); hospitals.push(h); }
}

hospitals.sort((a, b) => a.name.localeCompare(b.name, 'it'));

writeFileSync('public/hospitals.json', JSON.stringify(hospitals), 'utf-8');
console.log(`Done. ${hospitals.length} hospitals saved to public/hospitals.json`);
