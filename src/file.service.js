const fs = require('fs');
const path = require('path');

const folder = path.join(__dirname, '..', 'data');

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

const writeJson = (filename, data) => {
  const filepath = path.join(folder, filename);

  return new Promise((resolve, reject) => {
    fs.writeFile(filepath, JSON.stringify(data, null, 2), err => {
      if (err) reject(err);

      resolve(data);
    });
  });
};

module.exports = {
  writeJson
};