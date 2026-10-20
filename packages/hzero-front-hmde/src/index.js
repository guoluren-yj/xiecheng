import '@babel/polyfill';
import 'url-polyfill';
import dva from 'dva';
import { routerRedux } from 'dva/router'; // user BrowserHistory

import { createBrowserHistory as createHistory } from 'history';
import createLoading from 'dva-loading';
import 'moment/locale/zh-cn';
import 'moment/locale/en-gb';
import { getIeVersion } from 'hzero-front/lib/utils/browser';
import 'srm-front-boot/lib/utils/c7nUiConfig';
import 'hzero-front/lib/index.less';
import { persistMenuTabs } from 'hzero-front/lib/utils/menuTab'; // import createHistory from 'history/createHashHistory';

const ieVersion = getIeVersion();
const basePath = process.env.BASE_PATH; // 当 为 ie 且 ie版本小于 11 时 跳转到 推荐浏览器页面

if (ieVersion !== -1 && ieVersion < 11) {
  window.location.href = ''.concat(basePath || '/', 'suggestBrowser.html');
}

const browserHistoryBuildOptions = {};

if (basePath !== '/') {
  browserHistoryBuildOptions.basename = basePath;
} // 1. Initialize

const app = dva({
  history: createHistory(browserHistoryBuildOptions), // onError (error) {
  //   message.error(error.message);
  // },
}); // 1.1 attach dva app to window

window.dvaApp = app; // 2. Plugins

app.use(createLoading()); // 3. Register global model

app.model(require('./models/global').default);
app.model(require('hzero-front/lib/models/user').default);

app.router(require('./router').default); // 5. Start

app.start('#root');
export default app._store; // eslint-disable-line

window.addEventListener('beforeunload', persistMenuTabs); // 存储 tab 信息

if (process.env.NODE_ENV !== 'development') {
  // 只有在非开发模式下才监听全局错误
  // 开发模式 webpack-dev 会自动将错误的显示出来
  window.addEventListener('error', dealGlobalError);
}
console.log('d');
/**
 * 全局错误处理
 * @param {Error} error - 错误
 */

function dealGlobalError(error) {
  const globalExceptionHistory = JSON.parse(
    localStorage.getItem('hzero-global-exception-history') || '[]'
  );
  globalExceptionHistory.push({
    errorMessage: error && error.message,
    errorLocation: window.location.href,
    error,
  });

  if (globalExceptionHistory.length > 100) {
    globalExceptionHistory.shift();
  }

  localStorage.setItem('hzero-global-exception-history', JSON.stringify(globalExceptionHistory));

  app._store.dispatch({
    type: 'error/updateState',
    payload: {
      globalException: {
        history: globalExceptionHistory,
      },
    },
  });

  app._store.dispatch(
    routerRedux.push({
      pathname: '/exception/global',
    })
  ); // TODO: 捕获到 错误后 刷新页面

  window.location.reload();
}
