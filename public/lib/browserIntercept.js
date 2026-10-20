/**
 * 识别是否处于应用内嵌浏览器
 */
const clientIdReg = /(wxwork|MicroMessenger|DingTalk|Lark)(\/|\()/;

/*
 * @Author: Danica <ke.wang01@gonig-link.com>
 * @Date: 2022-02-21 16:55:12
 * @LastEditTime: 2022-02-21 21:22:23
 * @Copyright: Copyright (c) 2022, Hand
 */
// 获取浏览器信息
function getBrowserInfo() {
  const ua = window.navigator.userAgent;
  let browserInfo = {
    browser: 'unknown',
    version: 'unknown',
    standard: false,
  };
  if (/trident.+rv[: ]([\w.]{1,9})\b.+like Gecko/i.test(ua)) {
    browserInfo = {
      browser: 'IE',
      version: 11,
      standard: false,
    };
  } else if (/QQBrowser\/(\S+)/i.test(ua)) {
    browserInfo = {
      browser: 'QQBrowser',
      version: RegExp.$1,
      standard: parseFloat(RegExp.$1) >= 9.3,
    };
  } else if (/Yach\/([^\s;]+)/.test(ua)) {
    browserInfo = {
      browser: 'yach',
      version: RegExp.$1,
      standard: true,
    };
  } else if (/MicroMessenger\/(\S+)/i.test(ua)) {
    browserInfo = {
      browser: 'WeChart',
      version: RegExp.$1,
      standard: parseFloat(RegExp.$1) >= 6.0,
    };
  } else if (/metasr[\s|/]([\w.]+)/i.test(ua)) {
    if (/SE[\s|/](\w)/i.test(ua)) {
      browserInfo = {
        browser: 'Sougou',
        version: RegExp.$1,
        standard: parseFloat(RegExp.$1) >= 2,
      };
    }
  } else if (/QQBrowser\/(\S+)/i.test(ua)) {
    browserInfo = {
      browser: 'QQBrowser',
      version: RegExp.$1,
      standard: parseFloat(RegExp.$1) >= 9.3,
    };
  } else if (/rv:([^)]+)\) Gecko\/\d{8}/i.test(ua)) {
    if (/Firefox\/(\S+)/.test(ua)) {
      browserInfo = {
        browser: 'Firefox',
        version: RegExp.$1,
        standard: parseFloat(RegExp.$1) >= 68,
      };
    }
  } else if (/edge\/(\S+)/i.test(ua)) {
    browserInfo = {
      browser: 'Edge',
      version: RegExp.$1,
      standard: false,
    };
  } else if (/edg\/(\S+)/i.test(ua)) {
    browserInfo = {
      browser: 'Edg',
      version: RegExp.$1,
      standard: true,
    };
  } else if (/SLBChan\/(\S+)/i.test(ua)) {
    browserInfo = {
      browser: 'Lenovo',
      version: RegExp.$1,
      standard: parseFloat(RegExp.$1) >= 6.0,
    };
  } else if (/OPR\/(\S+)/i.test(ua)) {
    browserInfo = {
      browser: 'Opera',
      version: RegExp.$1,
      standard: parseFloat(RegExp.$1) >= 60,
    };
  } else if (/UBrowser\/(\S+)/i.test(ua)) {
    browserInfo = {
      browser: 'UC',
      version: RegExp.$1,
      standard: parseFloat(RegExp.$1) >= 6.2,
    };
  } else if (
    /\(KHTML, like Gecko\) Chrome\/(\S+)/i.test(ua) ||
    /\(KHTML, like Gecko\) HeadlessChrome\/(\S+)/i.test(ua) ||
    /\(KHTML, like Gecko\) CriOS\/(\S+)/i.test(ua)
  ) {
    browserInfo = {
      browser: 'Chrome',
      version: RegExp.$1,
      standard: parseFloat(RegExp.$1) >= 72,
    };
  } else if (
    /\(KHTML, like Gecko\)( Version.+)* Chrome\/(\S+)/i.test(ua) ||
    /\(KHTML, like Gecko\)( Version.+)* HeadlessChrome\/(\S+)/i.test(ua)
  ) {
    browserInfo = {
      browser: 'Chrome',
      version: RegExp.$2,
      standard: parseFloat(RegExp.$2) >= 72,
    };
  } else if (/Safari\/(\S+)/i.test(ua) && /Version\/(\S+)/i.test(ua)) {
    browserInfo = {
      browser: 'Safari',
      version: RegExp.$1,
      standard: parseFloat(RegExp.$1) >= 13,
    };
  }

  browserInfo.isAppBrowser = clientIdReg.test(ua);
  // 新场景需要再ipad下打开pc页面，所以只要最终识别为非标准浏览器但包含iPad关键字的直接放行
  // 只要识别到mobile关键字，则认为是移动端，不在进行拦截。
  if (!browserInfo.standard && (/iPad/i.test(ua) || /Mobile/i.test(ua) || /mobile/i.test(ua))) {
    browserInfo.standard = true;
    browserInfo.browser = "iPad";
    browserInfo.version = 999;
  }
  return browserInfo;
}

(function browserIntercept() {
  if (
    window.sessionStorage.getItem('browserStandard') !== 'true' &&
    window.location.href.indexOf('/oauth/public/default/browser-blocking.html') === -1
  ) {
    const browserInfo = getBrowserInfo();
    if (!browserInfo.standard && browserInfo.browser !== 'unknown') {
      window.sessionStorage.setItem('browserName', browserInfo.browser);
      window.sessionStorage.setItem('browserVersion', browserInfo.version);
      window.sessionStorage.setItem('browserStandard', false);
      window.sessionStorage.setItem('browserRedirectUrl', window.location.href);
      if (browserInfo.isAppBrowser) {
        window.location.replace('/oauth/public/default/app-browser-blocking.html');
      } else {
        window.location.replace('/oauth/public/default/browser-blocking.html');
      }
    }
  }
})();
