const packageJson = require('../package.json');

module.exports = {
  appName: packageJson.name,
  appVersion: packageJson.version,
  port: "4000",
  loggerLevel: "info",
};
