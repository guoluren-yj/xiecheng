/*
 * @Date: 2023-12-28 14:11:42
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import * as echarts from 'echarts';
import React, { useRef, useEffect, useState } from 'react';

import intl from 'utils/intl';
import ChartForm from './ChartForm';

const PieChart = ({ title, titleMeaning, allCount, countList, indicatorType, onTypeChange }) => {
  const chartRef = useRef();
  const [myChart, setMyChart] = useState();

  useEffect(() => {
    if (chartRef.current) {
      const newEcharts = echarts.init(chartRef.current);
      setMyChart(newEcharts);
    }
  }, [chartRef.current]);

  const option = {
    legend: {
      type: 'scroll',
      orient: 'vertical',
      left: 0,
      top: 'middle',
      textStyle: {
        color: '#868D9C',
        lineHeight: 18,
      },
      itemGap: 8,
      itemWidth: 8,
      itemHeight: 8,
      pageIconSize: 10,
    },
    series: [
      {
        type: 'pie',
        radius: ['50%', '70%'],
        avoidLabelOverlap: false,
        label: { show: false },
        left: 140,
        top: 'middle',
        width: 140,
        height: 140,
        emphasis: {
          label: {
            show: false,
          },
        },
        tooltip: {
          show: false,
        },
        labelLine: { show: false },
        data: countList,
      },
    ],
  };

  if (myChart) {
    myChart.setOption(option);
  }

  return (
    <div className="pie-chart-wrap">
      <div className="pie-chart-title">
        {title === 'indicatorLevel' ? (
          <ChartForm indicatorType={indicatorType} onTypeChange={onTypeChange} />
        ) : (
          titleMeaning
        )}
      </div>
      <div ref={chartRef} style={{ height: 130, width: 270 }} />
      <div className="pie-chart-total">
        <div>{allCount}</div>
        <div>{intl.get('sslm.common.view.message.totalCount').d('总数')}</div>
      </div>
    </div>
  );
};

export default PieChart;
