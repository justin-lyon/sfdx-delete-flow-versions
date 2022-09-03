const { exec } = require('child_process');
const { username } = require('./config');
const xformFlow = require('./flow.xform');
const xformAgg = require('./flow-agg.xform');

const execute = (cmd, resolve, reject) => {
  const process = exec(cmd, (error, stdout, stderr) => {
    if (error) {
      reject({error, stderr});
    }
    resolve(stdout);

    process.on('exit', code => {
      console.warn('Child Process exited with exit code: ', code);
    });
  });
};

const login = () => {
  if (!username) {
    const message = `username is required`;
    throw new Error(message);
  }

  if (username) {
    console.info('Username received. Searching local force:org:list for: ', username);
    const cmd = `npx sfdx force:org:list | grep ${username}`
    return new Promise((resolve, reject) => execute(cmd, resolve, reject))
      .then(() => {
        console.info('Username confirmed. Proceeding...');
      })
      .catch(errorResult => {
        if (errorResult.error.code === 1) {
          console.error(`Default Username provided but '${username}' not found in 'force:org:list'.`);
          throw new Error(errorResult.error);
        }
      });
  }
};

const queryFlowsByNameAndStatus = () => {
  const queryLines = `
    SELECT Definition.DeveloperName, Status, COUNT(Id)
    FROM Flow
    GROUP BY Definition.DeveloperName, Status
    ORDER BY Definition.DeveloperName `;
  const query = queryLines.split('\n').map(line => line.trim()).join(' ');
  const cmd = `npx sfdx force:data:soql:query -u ${username} -q "${query}" --usetoolingapi -r json`;
  return new Promise((resolve, reject) => execute(cmd, resolve, reject))
    .then(stdout => {
      const queryResult = JSON.parse(stdout);
      return queryResult.result.records.map(xformAgg);
    });
};

const queryInactiveFlows = () => {
  const queryLines = `
    SELECT Definition.DeveloperName, VersionNumber, Id, Status
    FROM Flow
    WHERE Status IN ('Obsolete', 'Draft')
    ORDER BY Definition.DeveloperName, VersionNumber`;
  const query = queryLines.split('\n').map(line => line.trim()).join(' ');
  const cmd = `npx sfdx force:data:soql:query -u ${username} -q "${query}" --usetoolingapi -r json`;
  return new Promise((resolve, reject) => execute(cmd, resolve, reject))
    .then(stdout => {
      const queryResult = JSON.parse(stdout);
      return queryResult.result.records.map(xformFlow);
    });
};

const deleteFlow = (flowId) => {
  const cmd = `npx sfdx force:data:record:delete -u ${username} -s Flow -i ${flowId} --usetoolingapi`;
  return new Promise((resolve, reject) => execute(cmd, resolve, reject));
};

module.exports = {
  login,
  queryFlowsByNameAndStatus,
  queryInactiveFlows,
  deleteFlow
}