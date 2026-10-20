/**
 * 新增风险事件图表
 */
import React, { useEffect, useState } from 'react';
import * as echarts from 'echarts';
import intl from 'utils/intl';
import { getCurrentOrganizationId, getCurrentUser } from 'utils/utils';

import { ReactComponent as NoContent } from '@/assets/risk/no_result.svg';
import { getResponse } from '@/utils/utils';
import { fetchTypeChartData } from '@/services/riskWorkPlaceService';

import styles from './index.less';

let incidentDistributionNode = null;
let incidentDistributionChart = null;

export default function EventTypeDistribution(props) {
  const { filterParams, statusList = [], searchContent = {} } = props;

  const [dataObj, setData] = useState({});

  useEffect(() => {
    const dom = document.getElementById('risk-workplace-incident-type-distribution-chart-panel');
    refreshChart();
    dom.addEventListener('resize', refreshChartResize);
    return () => {
      incidentDistributionNode = null;
      incidentDistributionChart = null;
      dom.removeEventListener('resize', refreshChartResize);
    };
  }, []);

  useEffect(() => {
    setChartOption(dataObj);
  }, [statusList]);

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
    if (incidentDistributionChart) {
      const heig = document.getElementById('sdat-risk-incident-type-distribution').height;
      const wid = document.getElementById('sdat-risk-incident-type-distribution').width;
      incidentDistributionChart.getDom().style.height = `${heig}px`;
      incidentDistributionChart.getDom().style.width = `${wid}px`;
      incidentDistributionChart.resize();
    }
  };

  // 设置option
  const setChartOption = (data = {}) => {
    const option = chartOption(data || {});
    if (incidentDistributionChart) {
      incidentDistributionChart.setOption(option);
      const heig = document.getElementById('sdat-risk-incident-type-distribution').height;
      const wid = document.getElementById('sdat-risk-incident-type-distribution').width;
      incidentDistributionChart.getDom().style.height = `${heig}px`;
      incidentDistributionChart.getDom().style.width = `${wid}px`;
      incidentDistributionChart.resize();
    }
  };

  const refreshChart = () => {
    incidentDistributionNode = document.getElementById('sdat-risk-incident-type-distribution');
    incidentDistributionChart = echarts.init(incidentDistributionNode);
  };

  const queryRefreshChart = (params) => {
    fetchTypeChartData({
      ...params,
      tenantId: getCurrentOrganizationId(),
      userId: getCurrentUser().id,
    }).then((res) => {
      if (getResponse(res)) {
        setData(res);
        setChartOption(res);
      } else {
        setData({});
        setChartOption({});
      }
    });
  };

  /**
   * 配置option
   */
  const chartOption = (obj = {}) => {
    const data = [];
    const colors = [];
    const colorMap = {
      HANDLING: '#3481DD',
      PENDING: '#F38133',
      FINISH: '#C9CDD4',
    };

    if (statusList.length) {
      statusList.forEach((item) => {
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
      color: colors,
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
          name: intl.get('sdat.riskControl.view.title.riskStatus').d('风险状态'),
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
          data,
        },
      ],
    };
  };

  return (
    <>
      <div
        className={styles['incident-type-distribution-chart']}
        id="risk-workplace-incident-type-distribution-chart-panel"
      >
        <span
          style={{
            fontSize: '16px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {intl.get('sdat.riskControl.view.title.riskStatus').d('风险状态')}
        </span>
      </div>

      <div
        id="sdat-risk-incident-type-distribution"
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
