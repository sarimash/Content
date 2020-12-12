
const fs = require('fs');
const fetch = require('node-fetch');

const { gitDescribeSync } = require('git-describe');

async function getData() {
  let baseData = { hash: 'invalid' };
  try {
    baseData = gitDescribeSync({ dirtyMark: false, dirtySemver: false });
  } catch {
    const data = await fetch('https://api.github.com/repos/LandOfTheRair/Content/commits/master');
    const json = await data.json();
  
    baseData = { hash: json.sha.substring(0, 7) };
  }

  fs.writeFileSync('_output/meta.json', JSON.stringify(baseData));
}

getData();

