/**
 * 新增风险事件图表
 */
import React, { useEffect, useState } from 'react';
import * as echarts from 'echarts';
import intl from 'utils/intl';
import { getCurrentOrganizationId, getCurrentUser } from 'utils/utils';

import { ReactComponent as NoContent } from '@/assets/risk/no_result.svg';
import { getResponse } from '@/utils/utils';
import { fetchBarChartData } from '@/services/riskWorkPlaceService';

import styles from './index.less';

let incidentTypeNode = null;
let incidentTypeChart = null;

export default function DangerousIncidentChart(props) {
  const { filterParams, searchContent = {} } = props;

  const [hasContent, setContent] = useState(true);

  useEffect(() => {
    const dom = document.getElementById('risk-control-dangerous-incident-chart-container');
    dom.addEventListener('resize', refreshChartResize);

    refreshChart();
    return () => {
      incidentTypeNode = null;
      incidentTypeChart = null;
      dom.removeEventListener('resize', refreshChartResize);
    };
  }, []);

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
    if (incidentTypeChart) {
      const heig = document.getElementById('sdat-risk-control-incident-type').height;
      const wid = document.getElementById('sdat-risk-control-incident-type').width;
      incidentTypeChart.getDom().style.height = `${heig}px`;
      incidentTypeChart.getDom().style.width = `${wid}px`;
      incidentTypeChart.resize();
    }
  };

  const queryRefreshChart = (params) => {
    fetchBarChartData({
      ...params,
      tenantId: getCurrentOrganizationId(),
      userId: getCurrentUser().id,
    }).then((res) => {
      if (getResponse(res)) {
        setContent(res && res.length);
        setChartOption(res);
      } else {
        setContent(false);
        setChartOption([]);
      }
    });
  };

  // 设置option
  const setChartOption = (list = []) => {
    const option = chartOption(list);
    if (incidentTypeChart) {
      incidentTypeChart.setOption(option);
    }
  };

  const refreshChart = () => {
    incidentTypeNode = document.getElementById('sdat-risk-control-incident-type');
    incidentTypeChart = echarts.init(incidentTypeNode);

    const heig = document.getElementById('sdat-risk-control-incident-type').height;
    const wid = document.getElementById('sdat-risk-control-incident-type').width;
    incidentTypeChart.getDom().style.height = `${heig}px`;
    incidentTypeChart.getDom().style.width = `${wid}px`;
    incidentTypeChart.resize();
  };

  /**
   * 配置option
   * @param {*} type
   */
  const chartOption = (list) => {
    const xAxisList = [];
    const data = [];

    if (list.length) {
      list.forEach((item) => {
        xAxisList.push(item.themeName);
        data.push(item?.riskCount ?? 0);
      });
    }

    return {
      color: ['#5B9AD5'],
      legend: {
        left: '0',
      },
      tooltip: {
        trigger: 'item',
      },
      grid: {
        left: '3%',
        right: '3%',
        bottom: '5%',
        top: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: xAxisList,
        axisTick: {
          alignWithLabel: true,
        },
        axisLabel: {
          interval: 0,
          width: 50,
          overflow: 'truncate',
          ellipsis: '...',
          truncate: '...',
          rotate: 30,
          formatter: (value) => {
            return value && value.length > 5 ? `${value.substring(0, 4)}...` : value;
          },
        },
      },
      yAxis: {
        type: 'value',
        minInterval: 1,
      },
      series: [
        {
          data,
          type: 'bar',
          barGap: '50%',
          barWidth: 30,
        },
      ],
      dataZoom:
        data.length > 6
          ? [
              {
                type: 'slider',
                show: true, // 显示滚动条
                zoomLock: true,
                bottom: 5,
                showDataShadow: false, // 是否显示数据阴影 默认auto
                borderColor: 'transparent', // 边框和背景颜色一致，（因为无法做到无边框，只能跟随页面背景）
                height: 8, // 滚动条高度
                showDetail: false, // 关闭：拖拽时候显示详细数值信息。
                fillerColor: 'rgba(221, 225, 229, 1)', // 滚动条颜色
                filterMode: 'filter',
                realtime: true, // 实时更新
                handleStyle: {
                  borderWidth: 0,
                  color: 'rgba(221, 225, 229, 1)',
                }, // SVG图形填充颜色
                textStyle: {
                  color: 'transparent',
                },
                handleIcon: 'path://M512,512m-448,0a448,448,0,1,0,896,0a448,448,0,1,0,-896,0Z', // 直接画一个圆形SVG矢量路径
                startValue: -6, // 重点在这   -- 开始的值
                endValue: -1, // 重点在这   -- 结束的值
                dataBackground: {
                  lineStyle: {
                    opacity: 0,
                  },
                  areaStyle: {
                    opacity: 0,
                  },
                },
                brushSelect: false,
                selectedDataBackground: {
                  lineStyle: {
                    opacity: 0,
                  },
                  areaStyle: {
                    opacity: 0,
                  },
                  brushStyle: {
                    borderColor: '#f00',
                  },
                },
              },
              {
                type: 'inside', // 滚动条内置在坐标系中
                zoomLock: true,
                xAxisIndex: [0],
                startValue: -6, // 重点在这   -- 开始的值
                endValue: -1, // 重点在这   -- 结束的值
              },
            ]
          : [],
    };
  };

  return (
    <>
      <div
        id="risk-control-dangerous-incident-chart-container"
        className={styles['dangerous-incident-chart']}
      >
        <span
          style={{
            fontSize: '16px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            marginBottom: '16px',
          }}
        >
          {intl.get('sdat.riskControl.view.title.riskType').d('风险类型')}
        </span>
      </div>
      <div
        id="sdat-risk-control-incident-type"
        style={{
          minHeight: '100px',
          minWidth: '200px',
          marginTop: '8px',
          flex: '1 1 auto',
          display: hasContent ? 'block' : 'none',
        }}
      />

      {!hasContent ? (
        <div
          style={{
            width: '100%',
            height: '100%',
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
