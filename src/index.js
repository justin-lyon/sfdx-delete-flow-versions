const sfdx = require('./sfdx.service');
const { mkdir, writeJson } = require('./file.service');
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

// Find any Flows that do NOT have Active versions
// Running the script will delete these entirely
const findAtRiskFlows = aggResults => {
  const summary = {};
  for (const agg of aggResults) {
    if (!summary[agg.name]) {
      summary[agg.name] = {
        active: 0,
        inactive: 0
      };
    }
    const item = summary[agg.name];

    if (agg.status === 'Active') {
      item.active++;
    } else {
      item.inactive++;
    }
  }
  return [...new Set(aggResults.filter(f => summary[f.name].active === 0).map(f => f.name))]
};

const init = () => {
  return mkdir();
}

init()
  .then(sfdx.login)
  .then(sfdx.queryFlowsByNameAndStatus)
  .then(flowCountsByStatus => {
    console.info('flowCountsByStatus count', flowCountsByStatus.length);
    const atRiskFlows = findAtRiskFlows(flowCountsByStatus);
    console.info('atRiskFlows count', atRiskFlows.length);
    return Promise.allSettled([
      writeJson('flows-by-status.json', flowCountsByStatus),
      writeJson('at-risk-flows.json', atRiskFlows)
    ]);
  })
  .then(sfdx.queryInactiveFlows)
  .then(flows => {
    console.info('flows count', flows.length);

    return writeJson('inactive-flows.json', flows);
  })
  .then(flows => {
    if (checkonly) return;
    if (flows.length === 0) return [];

    const flowIds = flows.map(f => f.id);
    return deleteAllObsoleteFlows(flowIds);
  })
  .catch(error => {
    console.error('error', error);
  });