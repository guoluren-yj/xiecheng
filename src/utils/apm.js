import raf from 'raf';
import qs from 'querystring';
import { getCurrentTenant, getCurrentUser } from 'utils/utils/user';
import { getEnvConfig } from 'utils/iocUtils';

const { DATA_RANGERS_APP_ID: dataRangersAppId, ENV_NAME: envName, BASE_PATH } = getEnvConfig();
const publicKey = 'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCCWTOLtJViofuNSQUhvOAu97pLesU7WZfNIY4KAWbs5sw/SMkRuZAwVcN6B4emfbu51ilITMJRAaEaMuBfJWrmp9lRNsNz5/44meseR3NAWyAFY2rGak1rzjGtBhyY9gZy5+/prSY2cGzR4bjl3qE0uHyhZRVbay6hncPSpn8TvwIDAQAB';
const { collectBrowserEvent } = window;

class RequestError extends Error {
  constructor(message) {
    super(message);
    this.name = 'RequestError';
  }
}

class UIError extends Error {
  constructor(message, stack) {
    super(message);
    this.name = 'UIError';
    this.stack = stack;
  }
}


let inited = false;
let started = false;
let paused = false;
let rafId;
let oldMenuInfo;
let getMenus;

const apm = [];
window.$$apm = apm;

function findMenuPath(menus, pathname, paths = []) {
  const found = menus.find(menu => {
    const { path, children } = menu;
    if (children && children.length) {
      return !!findMenuPath(children, pathname, paths).length;
    } else if (pathname.startsWith(path)) {
      paths.push(menu);
      return true;
    }
    return false;
  });
  if (found) {
    return paths;
  }
  return [];
}

function onPageView(pathname) {
  if (rafId) {
    raf.cancel(rafId);
    rafId = null;
  }
  if (getMenus) {
    const { menus, getPath } = getMenus();
    pathname = pathname ? pathname.replace(new RegExp(`^${BASE_PATH}`), '/') : '/workplace';
    const path = getPath(pathname);
    if (!path) {
      if (!paused) {
        paused = true;
        collectBrowserEvent('pause');
      }
      rafId = raf(() => {
        onPageView(pathname);
      });
    }
    if (menus && menus.length && path) {
      const context = {};
      const menuInfo = {
        pathname,
        path,
      };
      if (pathname === '/workplace') {
        menuInfo['menu'] = '工作台';
        menuInfo['page'] = '工作台';
      } else {
        const menuPath = findMenuPath(menus, pathname);
        // 未找到菜单
        if (!menuPath.length) {
          return;
        }
        const menuNameArr = menuPath[0] && menuPath[0].menuItem && menuPath[0].menuItem.flex && menuPath[0].menuItem.flex.levelName ? menuPath[0].menuItem.flex.levelName.split('|') : [];

        menuInfo['page'] = menuNameArr.pop();
        menuInfo['menu'] = menuNameArr.join(' > ');
      }
      if (oldMenuInfo) {
        if (oldMenuInfo.page !== menuInfo.page && menuInfo.menu !== oldMenuInfo.menu) {
          menuInfo.forwardPage = oldMenuInfo.page;
          menuInfo.forwardMenu = oldMenuInfo.menu;
        } else {
          menuInfo.forwardPage = oldMenuInfo.forwardPage;
          menuInfo.forwardMenu = oldMenuInfo.forwardMenu;
        }
      }
      Object.assign(context, menuInfo);
      collectBrowserEvent('context.clear');
      collectBrowserEvent('context.merge', context);
      if (inited && !started) {
        started = true;
        const {
          loginName,
          realName,
          id,
          // currentRoleName,
          // language,
          // additionInfo: { organizationName, organizationNum },
        } = getCurrentUser();
        const {
          tenantNum,
          // tenantName
        } = getCurrentTenant();
        // const userTenant = organizationName ? `${organizationNum}-${organizationName}` : 'unknown';
        const user_unique_id = (loginName && realName) ? `${loginName}-${realName}` : 'unknown';
        const newApmConfig = {
          aid: dataRangersAppId,
          userId: id,
          user: user_unique_id,
          env: envName,
          tenant: tenantNum,
          publicKey,
        };
        collectBrowserEvent('config', newApmConfig);
        collectBrowserEvent('start');
      } else if (paused) {
        paused = false;
        collectBrowserEvent('start');
      }
      oldMenuInfo = menuInfo;
    }
  }
}

export default function init() {
  if (collectBrowserEvent) {
    inited = true;
    collectBrowserEvent('init', {
      aid: dataRangersAppId,
      senderSize: 100,
      plugins: {
        ignoreUrls: [/\/hpfm\/v1\/\d+\/prompt\/[^/]+/, /\/spfm\/v1\/\d+\/personal-tables/],
        breadcrumb: false,
        fmp: false,
        tti: false,
        pageview: {
          onPidUpdate(pathname) {
            onPageView(pathname);
          },
        },
        performance: {
          fp: false,
          fcp: false,
          fid: false,
          cls: false,
          mpfid: false,
          timing: false,
          longtask: false,
        },
      },
      fetch: {
        ignoreUrls: [/\/hpfm\/v1\/\d+\/prompt\/[^/]+/, /\/spfm\/v1\/\d+\/personal-tables/],
      },
      // integrations: [
      // SPALoadPlugin(),
      // actionPlugin({ types: ['click'] })
      // ],
    });

    const reportedSpa = new Set();

    collectBrowserEvent('on', 'report', (event) => {
      if (event && event.eventType === 'performance') {
        const path = event.extra?.context?.path;
        if (path) {
          if (reportedSpa.has(path)) {
            return;
          } else {
            reportedSpa.add(path);
          }
        }
        if (envName === '华为云DEV' || window.$$apmDebug === true) {
          apm.push(event);
        }
      }
      return event;
    });
    // configure({
    //   performanceEnabled: { Table: true },
    //   onPerformance(type, event) {
    //     switch (type) {
    //       case 'Table': {
    //         const { timing, url, size, name } = event;
    //         const renderTime = timing.renderEnd - timing.renderStart;
    //         const fetchTime = timing.fetchEnd - timing.fetchStart;
    //         const loadTime = timing.loadEnd - timing.loadStart;
    //         RangersSiteSDK('emit', 'custom', {
    //           event_name: 'table_render',
    //           metrics: { renderTime, fetchTime, loadTime, size },
    //           tags: {
    //             url,
    //             code: name,
    //           },
    //         });
    //         // 新apm测试版 only dev
    //         browserClient('sendEvent', {
    //           name: 'table_render',
    //           metrics: { renderTime, fetchTime, loadTime, size },
    //           categories: {
    //             url,
    //             code: name,
    //           },
    //         });
    //         break;
    //       }
    //       default:
    //     }
    //   },
    //   // onTabsChange({ title, groupTitle }) {
    //   //   const tabName = groupTitle ? `${groupTitle}-${title}` : title;
    //   //   eventContext.set('tab_name', tabName);
    //   //   const pathname = eventContext.get('route');
    //   //   if (pathname) {
    //   //     tabsMap.set(pathname, tabName);
    //   //   }
    //   //   reportTab();
    //   // },
    //   onButtonClick({ title, icon }) {
    //     const eventProps = Object.fromEntries(eventContext);
    //     delete eventProps.route;
    //     eventProps.btnName = title || `icon[type=${icon}]`;
    //     window.collectEvent('button_active', eventProps);
    //   },
    // });
  }
}

export function config(getConfig) {
  if (inited && collectBrowserEvent) {
    getMenus = getConfig;
    const { menus, pathname, getPath } = getMenus();
    const path = getPath(pathname);
    if (menus && menus.length && (path || pathname === '/workplace') && !started) {
      onPageView(pathname);
    }
  }
}

export function processRequestError({ url, status, responseBody, method, requestBody, requestQuery }) {
  if (
    status === 200 &&
    responseBody &&
    responseBody.failed &&
    responseBody.type &&
    String(responseBody.type).toLowerCase() === 'error'
  ) {
    setTimeout(() => {
      const message = JSON.stringify({
        URL: url,
        METHOD: method,
        BODY: JSON.stringify(responseBody),
        REQUEST_BODY: requestBody ? JSON.stringify(requestBody) : null,
        REQUEST_QUERY: requestQuery ? qs.stringify(requestQuery) : null,
      });

      if (
        [
          'error.error',
          'error.db.column_violation',
          'error.db.locktimeout',
          'error.db.timeout',
        ].includes(responseBody.code)
      ) {
        throw new URIError(message);
      } else {
        throw new RequestError(message);
      }
    }, 0);
  }
}

export function processUIError(error) {
  setTimeout(() => {
    throw new UIError(error.message, error.stack);
  }, 0);
}
