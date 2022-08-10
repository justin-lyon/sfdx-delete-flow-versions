const sfdx = require('./sfdx.service');
const { writeFlows } = require('./file.service');
const { checkonly } = require('./config');

const deleteAllObsoleteFlows = async (flowIds) => {
  const fulfillments = [];
  for (const flowId of flowIds) {
    console.log('deleting: ', flowId);
    const result = await sfdx.deleteFlow(flowId);
    console.log('done', result);
    fulfillments.push(result);
  }
  return fulfillments;
};

sfdx.login()
  .then(sfdx.queryObsoleteFlows)
  .then(flows => {
    console.info('flow count', flows.length);

    return writeFlows(flows);
  })
  .then(flows => {
    if (checkonly) return;
    if (flows.length === 0) return [];

    const flowIds = flows.map(f => f.Id);
    return deleteAllObsoleteFlows(flowIds);
  })
  .catch(error => {
    console.error('error', error);
  });