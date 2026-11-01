// Run each service without relying on the shell's current directory or PORT variable.
const path = require('path');
const root = path.join(__dirname, '..');
const service = process.argv[2];

if (service === 'api') {
  process.chdir(path.join(root, 'backend'));
  process.env.PORT = '5000';
  process.env.NODE_ENV = 'development';
  require('../backend/server');
} else if (service === 'web') {
  process.chdir(path.join(root, 'frontend'));
  process.env.PORT = '3000';
  process.env.HOST = 'localhost';
  process.env.HTTPS = 'false';
  process.env.NODE_ENV = 'development';
  process.env.BROWSER = 'none';
  process.env.CI = 'true';
  process.env.REACT_APP_API_URL = 'http://localhost:5000/api';
  process.env.REACT_APP_SOCKET_URL = 'http://localhost:5000';
  // CRA 5 leaves allowedHosts undefined for explicit loopback hosts when a proxy
  // is configured. Supply the loopback name, keeping host checks enabled.
  const devServerUtils = require('../frontend/node_modules/react-dev-utils/WebpackDevServerUtils');
  const prepareUrls = devServerUtils.prepareUrls;
  devServerUtils.prepareUrls = (...args) => {
    const urls = prepareUrls(...args);
    return { ...urls, lanUrlForConfig: urls.lanUrlForConfig || 'localhost' };
  };
  require('../frontend/node_modules/react-scripts/scripts/start');
} else {
  console.error('Expected api or web. Use npm start from the project root.');
  process.exitCode = 1;
}