const $ = require('dekko');

$('lib')
  .isDirectory()
  .hasFile('index.js')
  .hasFile('index.d.ts');

$('lib/*')
  .filter((filename) => {
    return !filename.endsWith('index.js') && !filename.endsWith('index.d.ts') && !filename.endsWith('index.js.map');
  })
  .isDirectory()
  .filter((filename) => {
    return !filename.endsWith('style') && !filename.endsWith('_util') && !filename.endsWith('rc-components');
  })
  .hasFile('index.js')
  .hasFile('index.d.ts')
  .hasDirectory('style');

$('lib/*/style')
  .hasFile('css.js')
  .hasFile('index.js');

$('lib/style')
  .hasFile('v2-compatible-reset.css');

// eslint-disable-next-line
console.log('`lib` directory is valid.');
