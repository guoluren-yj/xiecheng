/* eslint-disable no-unused-expressions */
/**
 * 风险事件趋势卡片
 * @date: 2022-09-02
 * @author: Zip <zepeng.huang@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2022, Hand
 */

import React, { useEffect, useRef, useState } from 'react';
import echarts from 'echarts';
import { Result, Icon, Spin } from 'choerodon-ui';
import intl from 'utils/intl';
import {
  getRiskTypeDistributionData,
  getMsgByLovCode,
} from '@/services/supplierRiskMonitorOrgService';

import style from './index.less';

let eTable = null; // echarts对象
export default function RiskTypeDistrubution(props) {
  const { rangeValue = 'week', canSearch = false } = props;
  const divRef = useRef();
  const [codeMap, setCodeMap] = useState({});
  const [chartsData, setChartsData] = useState(null); // chartsData是echarts需要的数据
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
    getMsgByLovCode({ code: 'SDAT.EVENT_DIMENSION_LEVEL_FOUR' })
      .then((res) => {
        const mapObj = {};
        (res || []).forEach((item) => {
          Object.assign(mapObj, { [item?.value]: item?.meaning });
        });
        setCodeMap(mapObj);
      })
      .finally(() => {
        // eTable?.hideLoading();
        setSpinning(false);
      });
  }, []);

  useEffect(() => {
    if (chartsData?.length !== 0) setChartsData([]);
    if (Object.keys(codeMap).length === 0 || !canSearch) return;
    // eTable?.showLoading();
    setSpinning(true);
    getRiskTypeDistributionData({ reportType: rangeValue === 'week' ? 0 : 1 })
      .then((res) => {
        const dealData =
          res?.map((item) => {
            const { name = '' } = item;
            return { ...item, name: codeMap[name] || '' };
          }) || [];
        setChartsData(dealData);
      })
      .finally(() => {
        // eTable?.hideLoading();
        setSpinning(false);
      });
  }, [codeMap, rangeValue, canSearch]);

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
    if (eTable) {
      const option = {
        tooltip: {
          trigger: 'item',
          formatter: (params) => (params.name ? `${params.name}: ${params.value}` : ''),
        },
        // 颜色眉五个一循环
        color: [
          '#f5c2b4',
          '#f3af7a',
          '#78a6dd',
          '#7df387',
          '#63cbd6',
          '#f5c2b4',
          '#f3af7a',
          '#78a6dd',
          '#7df387',
          '#63cbd6',
          '#f5c2b4',
          '#f3af7a',
          '#78a6dd',
          '#7df387',
          '#63cbd6',
        ],
        series: [
          {
            type: 'treemap',
            nodeClick: false, // 点击节点无反应
            roam: false, // 关闭拖拽缩放
            right: '16px',
            bottom: '16px',
            top: '16px',
            left: '16px',
            breadcrumb: { show: false },
            colorSaturation: [0.8, 1],
            itemStyle: {
              borderColor: '#fff',
              gapWidth: 4,
            },
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
      {(chartsData?.length ?? 0) === 0 && (
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
          display: (chartsData?.length ?? 0) === 0 ? 'none' : 'block',
        }}
      />
    </>
  );
}
