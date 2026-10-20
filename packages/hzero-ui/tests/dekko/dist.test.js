const $ = require('dekko');

$('dist')
  .isDirectory()
  .hasFile('hzero-ui.css')
  // .hasFile('hzero-ui.min.css')
  .hasFile('hzero-ui.js')
  .hasFile('hzero-ui.min.js');

// eslint-disable-next-line
console.log('`dist` directory is valid.');
