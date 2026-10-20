import pkg from '../package.json';

const testDist = process.env.LIB_DIR === 'dist';

describe('hzero-ui dist files', () => {
  it('exports modules correctly', () => {
    const hzero = testDist ? require('../dist/hzero-ui') : require('../components'); // eslint-disable-line global-require
    expect(Object.keys(hzero)).toMatchSnapshot();
  });

  if (testDist) {
    it('should have hzero-ui.version', () => {
      const hzero = require('../dist/hzero-ui'); // eslint-disable-line global-require
      expect(hzero.version).toBe(pkg.version);
    });
  }
});
