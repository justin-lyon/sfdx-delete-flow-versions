const args = require('minimist')(process.argv.slice(2));

const username = args.u || args.username;
const checkonly = args.c || args.checkonly;

console.log('config', { username, checkonly });

module.exports = {
  username,
  checkonly
};
