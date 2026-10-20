import { overWriteConfig } from 'hzero-boot';

overWriteConfig({
  // 在 dva 对象实例化之后调用，可以在这里添加 dva 插件
  dvaAppInit: (app) => {
    app.model(require('../models/global').default);

    // 4. Router
    app.router(require('../router').default);
  },
});
