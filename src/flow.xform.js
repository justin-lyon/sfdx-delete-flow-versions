const xform = (item) => {
  return {
    id: item.Id,
    name: item.Definition.DeveloperName,
    versionNumber: item.VersionNumber,
    status: item.Status
  };
};

module.exports = xform;