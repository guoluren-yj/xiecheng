import React from 'react';
import { Modal } from 'choerodon-ui/pro';
import { Statistic } from 'choerodon-ui';
import { throttle } from 'lodash';
import intl from 'utils/intl';
import webSocketManagener from 'utils/webSoket';
import { getEnvConfig } from 'utils/iocUtils';
import { ACCESS_TOKEN, getAccessToken, removeAccessToken, removeAllCookie } from 'utils/utils';
import { cleanMenuTabs } from 'utils/menuTab';
import { DEBOUNCE_TIME } from 'utils/constants';

const { Countdown } = Statistic;

const EVENT_LISTENER_STAMP = 'EVENT_LISTENER_STAMP';
let eventTimer = null; // 定时器
let autoLogoutDuration = 43200000; // 定时时长
let inCountDown = false;
const countdownDuration = 30000;
const eventEnum = [
  'mousedown',
  'mousemove',
  'touchstart',
];

// 注销计时器
const clearEventTimer = () => {
  clearTimeout(eventTimer);
};

const checkTimeStampAndRestart = (time) => {
  const timeStamp = window.localStorage.getItem(EVENT_LISTENER_STAMP);
  if (timeStamp) {
    const diff = Number(timeStamp) - Date.now() + time;
    if (diff > 0) {
      start(diff);
      return true;
    }
  }
  return false;
};

const countdownStyle = { fontSize: 16 };
const countdownFormatter = (value) => {
  return intl.get('hzero.common.view.message.countdown.unauthorized.expired', {
    count: value,
  }).d(`系统将在${value}s后自动退出`);
};

const LogoutContDown = (props) => {
  const { value, modal } = props;
  const logout = React.useCallback(() => {
    if (checkTimeStampAndRestart(countdownDuration)) {
      modal.close();
    } else {
      const accessToken = getAccessToken();
      const { LOGOUT_URL, AUTH_HOST } = getEnvConfig();
      removeAccessToken();
      // 退出登录后清空cookie
      removeAllCookie();
      cleanMenuTabs(true); // warn 在退出登录后需要清空 menuTabs 信息
      sessionStorage.clear();
      localStorage.setItem('themeConfigCurrent', '');
      localStorage.removeItem(EVENT_LISTENER_STAMP);
      const url = LOGOUT_URL === 'undefined' ? `${AUTH_HOST}/logout` : LOGOUT_URL;
      if (url.includes('?')) {
        window.location = `${url}&${ACCESS_TOKEN}=${accessToken}`;
      } else {
        window.location = `${url}?${ACCESS_TOKEN}=${accessToken}`;
      }
    }
    inCountDown = false;
  }, []);
  return (
    <div>
      <Countdown
        value={value}
        format="s"
        onFinish={logout}
        valueStyle={countdownStyle}
        formatter={countdownFormatter}
      />
    </div>
  );
};

const start = (time) => {
  window.localStorage.setItem(EVENT_LISTENER_STAMP, (Date.now() + time).toString());
  clearEventTimer();
  eventTimer = setTimeout(() => {
    if (!checkTimeStampAndRestart(0)) {
      const countDownValue = Date.now() + countdownDuration; // 倒计时长
      inCountDown = true;
      Modal.open({
        title: intl.get('hzero.common.view.message.expired.title').d('超时提醒'),
        children: (
          <LogoutContDown value={countDownValue} />
        ),
        okButton: false,
        cancelProps: { color: 'primary' },
        onClose: () => {
          inCountDown = false;
          eventDebounce();
        },
      });
    }
  }, time);
};

// // 生成计时器
const eventDebounce = throttle(() => {
  if (!inCountDown) {
    const { AUTO_LOGOUT_METHOD } = getEnvConfig();
    if(AUTO_LOGOUT_METHOD === 'server'){
      if(webSocketManagener.sendOnlyMessage){
        const accessToken = getAccessToken();
        webSocketManagener.sendOnlyMessage(accessToken);
      }
    }else{
      start(autoLogoutDuration - countdownDuration);
    }
  }
}, 10000);

// const websocketDebounce = throttle(() => {
//   if (!inCountDown) {
//     start(autoLogoutDuration - countdownDuration);
//   }
// }, 100000)

const eventsListener = (info) => {
  const { AUTO_LOGOUT_METHOD } = getEnvConfig();
  if(AUTO_LOGOUT_METHOD === 'server'){
    if (webSocketManagener?.socketStatus !== 32) {
      webSocketManagener.initWebSocket();
      if(webSocketManagener.sendOnlyMessage){
        const accessToken = getAccessToken();
        webSocketManagener.sendOnlyMessage(accessToken);
      }
    }
  }
  if (info && typeof info.autoLogoutDuration === 'number') {
    autoLogoutDuration = info.autoLogoutDuration * 60000;
  }
  eventDebounce();
  eventEnum.forEach(event => {
    document.addEventListener(event, eventDebounce);
  });
  document.addEventListener('beforeunload', clearEventTimer);
};

const clearEventsListener = () => {
  const { AUTO_LOGOUT_METHOD } = getEnvConfig();
  if(AUTO_LOGOUT_METHOD === 'server'){
    if (webSocketManagener?.destroyWebSocket) {
      webSocketManagener.destroyWebSocket();
    }
  }
  eventEnum.forEach(event => {
    document.removeEventListener(event, eventDebounce);
  });
  document.removeEventListener('beforeunload', clearEventTimer);
};

export {
  eventsListener,
  clearEventsListener,
};
