/**
 * ⻛险级别分布
 */
import React, { useEffect, useState } from 'react';
import * as echarts from 'echarts';
import intl from 'utils/intl';
import { getCurrentOrganizationId, getCurrentUser } from 'utils/utils';

import { ReactComponent as NoContent } from '@/assets/risk/no_result.svg';
import { getResponse } from '@/utils/utils';
import { fetchLevelChartData } from '@/services/riskNewWorkPlaceService';

import styles from './index.less';

let riskLevelDistributionNode = null;
let riskLevelDistributionChart = null;

export default function RiskLevelDistribution(props) {
  const { filterParams, levelList, searchContent = {} } = props;

  const [dataObj, setData] = useState({});

  useEffect(() => {
    const dom = document.getElementById('risk-workplace-new-risk-level-distribution-chart-panel');
    refreshChart();
    dom.addEventListener('resize', refreshChartResize);

    return () => {
      riskLevelDistributionNode = null;
      riskLevelDistributionChart = null;
      dom.removeEventListener('resize', refreshChartResize);
    };
  }, []);

  useEffect(() => {
    setChartOption(dataObj);
  }, [levelList]);

  useEffect(() => {
    if (filterParams && Object.keys(filterParams).length) {
      queryRefreshChart({
        ...filterParams,
        ...searchContent,
        emptyFlag:
          !filterParams?.statusList?.length ||
          !filterParams?.levelList?.length ||
          !filterParams?.codeList?.length,
      });
    }
  }, [filterParams, searchContent]);

  const refreshChartResize = () => {
    if (riskLevelDistributionChart) {
      const heig = document.getElementById('sdat-risk-level-new-distribution-chart').height;
      const wid = document.getElementById('sdat-risk-level-new-distribution-chart').width;
      riskLevelDistributionChart.getDom().style.height = `${heig}px`;
      riskLevelDistributionChart.getDom().style.width = `${wid}px`;
      riskLevelDistributionChart.resize();
    }
  };

  const queryRefreshChart = (params) => {
    fetchLevelChartData({
      ...params,
      tenantId: getCurrentOrganizationId(),
      userId: getCurrentUser().id,
    }).then((res) => {
      if (getResponse(res) && Array.isArray(res) && res.length) {
        const map = {};
        res.forEach((item) => {
          map[item.level] = item.riskCount;
        });
        setData(map || {});
        setChartOption(map);
      } else {
        setData({});
        setChartOption({});
      }
    });
  };

  // 设置option
  const setChartOption = (data = {}) => {
    const option = chartOption(data || {});
    if (riskLevelDistributionChart) {
      riskLevelDistributionChart.setOption(option);
      const heig = document.getElementById('sdat-risk-level-new-distribution-chart').height;
      const wid = document.getElementById('sdat-risk-level-new-distribution-chart').width;
      riskLevelDistributionChart.getDom().style.height = `${heig}px`;
      riskLevelDistributionChart.getDom().style.width = `${wid}px`;
      riskLevelDistributionChart.resize();
    }
  };

  const refreshChart = () => {
    riskLevelDistributionNode = document.getElementById('sdat-risk-level-new-distribution-chart');
    riskLevelDistributionChart = echarts.init(riskLevelDistributionNode);
  };

  /**
   * 配置option
   */
  const chartOption = (obj = {}) => {
    const data = [];
    const colors = [];
    const colorMap = {
      1: '#45A976',
      2: '#FEA804',
      3: '#EB694E',
    };

    if (levelList.length) {
      levelList.forEach((item) => {
        if (obj[item.value]) {
          data.push({
            value: obj[item.value] || 0,
            name: item.meaning,
          });
          colors.push(colorMap[String(item.value)]);
        }
      });
    }

    return {
      color: colors.reverse(),
      tooltip: {
        trigger: 'item',
      },
      animation: false,
      legend: {
        left: 0,
        top: 10,
        itemWidth: 10,
        itemHeight: 10,
      },
      series: [
        {
          name: intl.get('sdat.riskControl.view.title.riskLevelDistribution').d('⻛险级别'),
          type: 'pie',
          top: 60,
          radius: ['40%', '80%'],
          avoidLabelOverlap: false,
          label: {
            show: true,
            position: 'inside',
            color: '#fff',
            formatter: (params) => {
              return params.value;
            },
          },
          // emphasis: {
          //   label: {
          //     show: true,
          //     fontSize: 40,
          //     fontWeight: 'bold',
          //   },
          // },
          hoverAnimation: false,
          labelLine: {
            show: false,
          },
          data: data.reverse(),
        },
      ],
    };
  };

  return (
    <>
      <div
        className={styles['risk-level-distribution-chart']}
        id="risk-workplace-new-risk-level-distribution-chart-panel"
      >
        <span
          style={{
            fontSize: '16px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {intl.get('sdat.riskControl.view.title.riskLevelDistribution').d('⻛险级别')}
        </span>
      </div>

      <div
        id="sdat-risk-level-new-distribution-chart"
        style={{
          // minWidth: '160px',
          minHeight: '160px',
          flex: '1 1 auto',
          display: dataObj && Object.keys(dataObj).length ? 'inline-block' : 'none',
        }}
      />

      {!(dataObj && Object.keys(dataObj).length) ? (
        <div
          style={{
            // minWidth: '160px',
            minHeight: '160px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ textAlign: 'center', height: '40px' }}>
              <NoContent style={{ width: '40px', height: '40px' }} />
            </div>
            <div className={styles['chart-no-content-message']}>
              {intl.get('hzero.common.message.data.none').d('暂无数据')}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
