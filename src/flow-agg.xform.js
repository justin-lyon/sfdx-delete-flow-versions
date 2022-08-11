const xform = item => {
  return {
    name: item.DeveloperName,
    status: item.Status,
    count: item.expr0
  };
};

module.exports = xform;