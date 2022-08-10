const fs = require('fs');
const path = require('path');

const filename = 'obsolete-flows.json';
const folder = path.join(__dirname, '..', 'data');
const filepath = path.join(folder, filename);

const mkdir = () => {
  return new Promise((resolve, reject) => {
    fs.mkdir(folder, { recursive: true }, error => {
      if (error) {
        reject(error)
      }
      resolve();
    });
  });
}

const writeJson = (data) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(filepath, JSON.stringify(data, null, 2), err => {
      if (err) reject(err);

      resolve(data);
    });
  });
};

const writeFlows = (flows) => {
  return mkdir()
    .then(() => writeJson(flows));
};

module.exports = {
  writeFlows
};