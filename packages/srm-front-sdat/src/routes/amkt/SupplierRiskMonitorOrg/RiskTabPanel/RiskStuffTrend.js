/* eslint-disable no-unused-expressions */
/**
 * 风险事件趋势卡片
 * @date: 2022-09-02
 * @author: Zip <zepeng.huang@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2022, Hand
 */

import React, { useEffect, useRef, useState } from 'react';
import { Result, Icon, Spin } from 'choerodon-ui';
import intl from 'utils/intl';
import echarts from 'echarts';
import { getRiskStuffTrendData, getMsgByLovCode } from '@/services/supplierRiskMonitorOrgService';

import style from './index.less';

let mil = new Date().getTime();
const xAxias = [];
new Array(7).fill(0).forEach(() => {
  const dateObj = new Date(mil);
  const year = dateObj.getFullYear();
  const month = dateObj.getMonth() + 1;
  const day = dateObj.getDate();
  xAxias.push(`${year}-${month}-${day}`);
  mil -= 86400000;
});
xAxias.reverse();
let milM = new Date().getTime();
const xAxiasM = [];
new Array(30).fill(0).forEach(() => {
  const dateObj = new Date(milM);
  const year = dateObj.getFullYear();
  const month = dateObj.getMonth() + 1;
  const day = dateObj.getDate();
  xAxiasM.push(`${year}-${month}-${day}`);
  milM -= 86400000;
});
xAxiasM.reverse();

let eTable; // echarts对象

export default function RiskStuffTrend(props = {}) {
  const { rangeValue = 'week', canSearch = false } = props;

  const divRef = useRef();
  const [levelMap, setLevelMap] = useState({});
  const [resData, setResData] = useState(null); // resData是接口回传的数据
  const [chartsData, setChartsData] = useState(null); // chartsData是echarts需要的数据
  const [spinning, setSpinning] = useState(false);

  // 加载完毕后初始化echarts对象
  useEffect(() => {
    if (echarts) {
      eTable = echarts?.init(divRef?.current);
    }
  }, [echarts]);

  useEffect(() => {
    // 页面变化时获取浏览器窗口的大小
    window.addEventListener('resize', handleResize);

    return () => {
      // 组件销毁时移除监听事件
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleResize = () => {
    // eslint-disable-next-line no-unused-expressions
    eTable?.resize();
  };

  // 查询等级对应的值集字段
  useEffect(() => {
    // eTable?.showLoading();
    setSpinning(true);
    getMsgByLovCode({ code: 'SDAT.RISK_EVENT_LEVEL' })
      .then((res) => {
        const mapObj = {};
        (res || []).forEach((item) => {
          Object.assign(mapObj, { [item?.value]: item?.meaning });
        });
        setLevelMap(mapObj);
      })
      .finally(() => {
        // eTable?.hideLoading();
        setSpinning(false);
      });
  }, []);

  // 等级对应的值集字段出现后查询数据
  useEffect(() => {
    if (resData?.length !== 0) setResData([]);
    if (Object.keys(levelMap).length === 0 || !canSearch) return;
    // eTable?.showLoading();
    setSpinning(true);
    getRiskStuffTrendData({ reportType: rangeValue === 'week' ? 0 : 1 })
      .then((res) => {
        if (!(res instanceof Array)) return;
        const tempData = []; // 构造临时数据
        Object.keys(levelMap).forEach((ind) => {
          // 检查本ind是否在回传的数据内
          // eslint-disable-next-line eqeqeq
          const indexInRes = (res || []).findIndex((p) => (p?.riskLevel ?? '') == ind);
          if (indexInRes === -1) {
            tempData.push({
              name: levelMap[ind] ?? '',
              data: new Array(rangeValue === 'week' ? 7 : 30).fill(0),
              type: 'bar',
              stack: 'one',
              barWidth: '20%',
            });
          } else {
            tempData.push({
              name: levelMap[ind] ?? '',
              data:
                (res || [])[indexInRes]?.daysNum?.reverse() ??
                new Array(rangeValue === 'week' ? 7 : 30).fill(0),
              type: 'bar',
              stack: 'one',
              barWidth: '20%',
            });
          }
        });
        setResData(res || []);
        setChartsData(tempData);
      })
      .finally(() => {
        // eTable?.hideLoading();
        setSpinning(false);
      });
  }, [levelMap, rangeValue, canSearch]);

  // echarts对象赋值成功则渲染
  useEffect(() => {
    renderChart();
  }, [eTable, chartsData, resData]);

  /**
   * 渲染图表
   */
  const renderChart = () => {
    if (eTable) {
      const option = {
        tooltip: {
          trigger: 'item',
        },
        color: ['#57bf61', '#d0d3d9', '#fbbf34', '#ff8c26', '#f46e53'], // 由良好到高风险的5个color
        dataZoom: rangeValue === 'month' && [
          {
            show: false,
            start: 78,
            end: 100,
          },
          {
            type: 'inside',
            start: 78,
            end: 100,
          },
        ],
        xAxis: {
          data: rangeValue === 'week' ? xAxias : xAxiasM,
          axisLine: { onZero: true },
          splitLine: { show: false },
          splitArea: { show: false },
        },
        yAxis: {},
        grid: {
          top: '16px',
          left: '16px',
          right: '100px',
          bottom: '16px',
          containLabel: true,
        },
        legend: {
          bottom: '16px',
          right: '16px',
          itemWidth: 8,
          itemHeight: 8,
          orient: 'vertical',
          data: Object.keys(levelMap)?.map((i) => levelMap[i]) || [],
        },
        series: chartsData,
      };
      eTable.clear();
      eTable.setOption(option);
    }
  };

  return (
    <>
      {(resData?.length ?? 0) === 0 && (
        <Spin spinning={spinning}>
          <Result
            className={style['no-data-result']}
            icon={<Icon className={style['no-data-icon']} />}
            title={
              <span>
                {intl.get('sdat.supplierRiskMonitor.view.notification.noData').d('暂无数据')}
              </span>
            }
          />
        </Spin>
      )}
      <div
        className={style['canvas-box']}
        ref={divRef}
        style={{
          display: (resData?.length ?? 0) === 0 ? 'none' : 'block',
        }}
      />
    </>
  );
}
