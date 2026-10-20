/* eslint-disable no-unused-expressions */
/**
 * 风险等级分布卡片
 * @date: 2022-09-02
 * @author: Zip <zepeng.huang@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2022, Hand
 */

import React, { useEffect, useRef, useState } from 'react';
import echarts from 'echarts';
import { Result, Icon, Spin } from 'choerodon-ui';
import {
  getRiskLevelDistributionData,
  getMsgByLovCode,
} from '@/services/supplierRiskMonitorOrgService';
import intl from 'utils/intl';

import style from './index.less';

let eTable = null; // echarts对象

export default function RiskLevelDistribution(props = {}) {
  const { rangeValue = 'week', canSearch = false } = props;
  const divRef = useRef();

  const [resData, setResData] = useState(null); // resData是接口回传的数据
  const [chartsData, setChartsData] = useState(null); // chartsData是echarts需要的数据
  const [levelMap, setLevelMap] = useState({});
  const [spinning, setSpinning] = useState(false);

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
    getRiskLevelDistributionData({ reportType: rangeValue === 'week' ? 0 : 1 })
      .then((res) => {
        if (!(res instanceof Array)) return;
        const tempData = []; // 构造临时数据
        Object.keys(levelMap).forEach((ind) => {
          // 检查本ind是否在回传的数据内
          // eslint-disable-next-line eqeqeq
          const indexInRes = (res || []).findIndex((p) => (p?.name ?? '') == ind);
          if (indexInRes === -1) {
            tempData.push({
              name: levelMap[ind] ?? '',
              value: 0,
              labelLine: { show: false },
              label: { show: false },
            });
          } else {
            tempData.push({
              name: levelMap[ind] ?? '',
              value: (res || [])[indexInRes]?.value,
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

  // 加载完毕后初始化echarts对象
  useEffect(() => {
    if (divRef?.current) {
      eTable = echarts?.init(divRef.current);
    }
  }, []);

  // echarts对象赋值成功则渲染
  useEffect(() => {
    renderChart();
  }, [eTable, chartsData]);

  /**
   * 渲染图表
   */
  const renderChart = () => {
    if ((chartsData?.length ?? 0) === 0) return;
    if (eTable) {
      // 计算总数
      const total = (chartsData || []).reduce((prev, current) => {
        return prev + Number(current?.value ?? 0);
      }, 0);
      const option = {
        tooltip: {
          trigger: 'item',
        },
        legend: {
          bottom: '16px',
          right: '16px',
          itemWidth: 8,
          itemHeight: 8,
          orient: 'vertical',
          selectedMode: false, // 取消图例上的点击事件
        },
        grid: {
          top: '16px',
          left: '16px',
          right: '16px',
          bottom: '16px',
          containLabel: true,
        },
        series: [
          {
            name: intl
              .get('sdat.supplierRiskMonitor.view.title.riskLevelDistribution')
              .d('风险级别分布'),
            type: 'pie',
            radius: ['40%', '60%'],
            avoidLabelOverlap: true,
            label: {
              normal: {
                show: true,
                position: 'center',
                color: '#4c4a4a',
                formatter: `{total|${total}}\r{active|${intl
                  .get('sdat.supplierRiskMonitor.view.title.stuffs')
                  .d('件')}}`,
                rich: {
                  total: {
                    fontSize: 35,
                    color: '#454c5c',
                  },
                  active: {
                    fontSize: 14,
                    color: '#6c7a89',
                    padding: [
                      0, // 上
                      0, // 右
                      10, // 下
                      0, // 左
                    ],
                  },
                },
              },
            },
            color: ['#57bf61', '#d0d3d9', '#fbbf34', '#ff8c26', '#f46e53'], // 由良好到高风险的5个color
            data: chartsData,
          },
          {
            name: intl
              .get('sdat.supplierRiskMonitor.view.title.riskLevelDistribution')
              .d('风险级别分布'),
            type: 'pie',
            radius: ['40%', '60%'],
            avoidLabelOverlap: true,
            label: {
              normal: {
                formatter: '{c}',
              },
            },
            color: ['#57bf61', '#d0d3d9', '#fbbf34', '#ff8c26', '#f46e53'], // 由良好到高风险的5个color
            data: chartsData,
          },
        ],
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
