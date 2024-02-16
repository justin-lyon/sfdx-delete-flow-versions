const xform = (item) => {
  return {
    id: item.Id,
    flowVersionId: item.FlowVersionViewId
  };
};

module.exports = xform;