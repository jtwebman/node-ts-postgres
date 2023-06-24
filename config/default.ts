const packageJson = require('../package.json') as { name: string, version: string };

module.exports = {
  appName: packageJson.name,
  appVersion: packageJson.version,
  port: "4000",
  loggerLevel: "info",
};
