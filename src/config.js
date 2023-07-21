const args = require('minimist')(process.argv.slice(2));

const username = args.u || args.username;
const checkonly = args.c || args.checkonly;
const includeManaged = args.m || args['include-managed'];

console.log('config', { username, checkonly, includeManaged });

module.exports = {
  username,
  checkonly,
  includeManaged
};
