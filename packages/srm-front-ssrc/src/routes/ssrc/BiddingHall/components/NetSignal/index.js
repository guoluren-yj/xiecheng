/**
 * 竞价大厅-网络信息
 * @date: 2023-5-09
 */
import React, { useState, useEffect, useCallback } from 'react';
import { observer } from 'mobx-react';

import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import request from 'utils/request';
import { isObject, isNil } from 'lodash';
import classNames from 'classnames';
import { filterNullValueObject } from 'utils/utils';

import { getWorker, getCountDown } from '@/routes/ssrc/BiddingHall/utils/MonitorWork';

import grid0Svg from '@/assets/biddingHall/grid0.svg';
import grid1Svg from '@/assets/biddingHall/grid1.svg';
import grid2Svg from '@/assets/biddingHall/grid2.svg';
import grid3Svg from '@/assets/biddingHall/grid3.svg';
import grid4Svg from '@/assets/biddingHall/grid4.svg';

import style from './index.less';

const NetSignal = (props = {}) => {
  const {
    intervalTime = 15000, // 默认15秒查询一次网络情况
    label = intl.get('ssrc.common.view.title.netSignal').d('网络状况'),
    requestUrl = '',
    requestPrams = {},
  } = props || {};

  // 网络状况分类
  const netWorkCondition = {
    grid0: grid0Svg,
    grid1: grid1Svg,
    grid2: grid2Svg,
    grid3: grid3Svg,
    grid4: grid4Svg,
  };

  const [curNetWork, setCurNetWork] = useState(null); // 记录当前网络信号

  let monitorWork = null;

  useEffect(() => {
    document.addEventListener('visibilitychange', chromeTabVisibilityChange);

    return () => {
      clearTimer();
      document.removeEventListener('visibilitychange', chromeTabVisibilityChange);
    };
  }, []);

  const chromeTabVisibilityChange = () => {
    const HiddenChromeTabFlag = document?.hidden;
    if (!HiddenChromeTabFlag) {
      getNetSignal();
      openTimer();
    } else {
      // clearTimer();
    }
  };

  useEffect(() => {
    getNetSignal();
    // openTimer();
  }, [requestUrl, getNetSignal]);

  useEffect(() => {
    monitorWork = getWorker(getCountDown, { name: 'BIDDING_HALL_MONITOR_WORKER' });

    openTimer();
  }, []);

  // 请求网络信号
  const getNetSignal = useCallback(() => {
    if (!requestUrl || (requestPrams && !isObject(requestPrams))) {
      return;
    }

    const curTime = new Date().getTime();
    request(requestUrl, {
      method: 'POST',
      body: filterNullValueObject(requestPrams || {}),
    })
      .then((res) => {
        if (res && !res.failed) {
          const resTime = new Date().getTime();
          const diffTime = resTime - curTime;
          console.log(diffTime, 'diffTime');

          // 【信号强弱展示】：根据前端返回的消息时间判断：0.5s以内是4格，0.5s-1s是3格，1s-1.5s是2格，1.5s-5s是1格, 大于5无信号
          if (diffTime <= 500) {
            setCurNetWork(netWorkCondition.grid4);
          } else if (diffTime > 500 && diffTime <= 1000) {
            setCurNetWork(netWorkCondition.grid3);
          } else if (diffTime > 1000 && diffTime <= 1500) {
            setCurNetWork(netWorkCondition.grid2);
          } else if (diffTime > 1500 && diffTime <= 5000) {
            setCurNetWork(netWorkCondition.grid1);
          } else {
            setCurNetWork(netWorkCondition.grid0);
          }
        } else {
          // 没返回或者请求失败 则无信号
          setCurNetWork(netWorkCondition.grid0);
        }
      })
      .catch((err) => {
        throw err;
      });
  }, [requestUrl, requestPrams]);

  // 开启定时器
  const openTimer = () => {
    if (isNil(intervalTime)) return;

    monitorWork.postMessage({ type: 'RESTART', interval: intervalTime });
    monitorWork.onmessage = (e) => {
      const { type, workCount } = e?.data || {};

      if (workCount > 1000) {
        monitorWork.postMessage({ type: 'RESTART', interval: intervalTime });
      }

      if (type === 'NEXT') {
        getNetSignal();
      }

      if (type === 'END' || workCount > 10000) {
        clearTimer();
      }
    };
  };

  // 清除定时器
  const clearTimer = () => {
    // clearTimeout(timeRef.current);
    // timeRef.current = null;
    monitorWork.postMessage({ type: 'END' });
    monitorWork.terminate();
  };

  return (
    <div className={classNames(style['net-signal-wrapper'])}>
      {label && <span className={classNames(style['net-signal-label'])}>{label}</span>}
      <img
        alt={intl.get('ssrc.common.view.title.netSignal').d('网络状况')}
        className={classNames(style['net-signal-image'])}
        src={curNetWork}
      />
    </div>
  );
};

export default formatterCollections({ code: ['ssrc.common'] })(observer(NetSignal));
