const fetch = require("node-fetch")
const fs = require("fs")

async function main() {
  const res = await fetch('https://register.geonorge.no/api/subregister/sosi-kodelister/kartverket/kommunenummer-alle.json');
  const json = await res.json();

  const data = json.containeditems
    .filter(i => i.status === 'Gyldig')
    .map(i => ({ id: i.label, name: i.description }));

  fs.writeFileSync('./municipalities.json', JSON.stringify(data));
}

main();
