const sfdx = require('./sfdx.service');
const { mkdir, writeJson } = require('./file.service');
const { checkonly } = require('./config');

const deleteFlowInterviews = async (interviewIds) => {
  const fulfillments = [];
  for (const interviewId of interviewIds) {
    console.log('deleting interview: ', interviewId);
    const result = await sfdx.deleteFlowInterview(interviewId);
    console.log('done', result);
    fulfillments.push(result);
  }
  return fulfillments;
};

const deleteAllObsoleteFlows = async (flowIds) => {
  const fulfillments = [];
  for (const flowId of flowIds) {
    console.log('deleting flow version: ', flowId);
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

const main = async () => {
  try {
    await init();
    await sfdx.login();
    const flowCountsByStatus = await sfdx.queryFlowsByNameAndStatus();
    console.info('flowCountsByStatus count', flowCountsByStatus.length);

    const atRiskFlows = findAtRiskFlows(flowCountsByStatus);
    console.info('atRiskFlows count', atRiskFlows.length);

    await writeJson('flows-by-status.json', flowCountsByStatus);
    await writeJson('at-risk-flows.json', atRiskFlows);

    const inactiveFlows = await sfdx.queryInactiveFlows();
    console.info('inactiveFlows count', inactiveFlows.length);

    if (inactiveFlows.length === 0) {
      console.info('✅ no inactive flows found');
      return;
    }

    await writeJson('inactive-flows.json', inactiveFlows);

    const flowViewIds = inactiveFlows.map(f => f.id.slice(0, 15));
    const interviews = await sfdx.queryInterviewsByFlowVersion(flowViewIds);
    await writeJson('flow-interviews.json', interviews);

    const interviewIds = interviews.map(i => i.id);
    console.info(`found ${interviews.length} FlowInterviews for ${inactiveFlows.length} FlowVersions`);

    if (checkonly) {
      console.info('✅ check only complete');
      return;
    };

    console.info('⛔️ WARNING begin destructive changes');

    console.info('begin deleting interviews');
    await deleteFlowInterviews(interviewIds);

    console.info('begin deleting flow versions');
    await deleteAllObsoleteFlows(flowViewIds);

    console.info('✅ all done');

  } catch(error) {
    console.error(error);
  }
};

main();