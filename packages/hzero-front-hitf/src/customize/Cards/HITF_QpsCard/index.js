import React from 'react';
import { Card } from 'choerodon-ui';
import 'echarts/lib/chart/line';
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/title';
import ReactEcharts from 'echarts-for-react';
import { Bind } from 'lodash-decorators';
import { isEmpty } from 'lodash';
import webSocketManager from 'hzero-front/lib/utils/webSoket';
import getLang from '@/langs/cardLang';

class QpsCard extends React.Component {
  legendData = [
    { name: 'rps', value: getLang('QPS'), yAxisIndex: 0 },
    { name: 'totalTimePercent', value: getLang('TOTAL_TIME_PERCENT'), yAxisIndex: 0 },
    { name: 'avgTime', value: getLang('AVG_TIME'), yAxisIndex: 1 },
    { name: 'minTime', value: getLang('MIN_TIME'), yAxisIndex: 1 },
    { name: 'maxTime', value: getLang('MAX_TIME'), yAxisIndex: 1 },
    { name: 'stdDev', value: getLang('STD_DEV'), yAxisIndex: 0 },
    { name: 'totalCount', value: getLang('TOTAL_COUNT'), yAxisIndex: 0 },
    { name: 'tp50', value: getLang('TP_50'), yAxisIndex: 1 },
    { name: 'tp90', value: getLang('TP_90'), yAxisIndex: 1 },
    { name: 'tp95', value: getLang('TP_95'), yAxisIndex: 1 },
    { name: 'tp99', value: getLang('TP_99'), yAxisIndex: 1 },
    { name: 'tp999', value: getLang('TP_999'), yAxisIndex: 1 },
    { name: 'tp9999', value: getLang('TP_9999'), yAxisIndex: 1 },
  ];

  constructor(props) {
    super(props);
    this.state = {
      xAxisData: [],
      // y轴系列的数据，为一个Map对象
      yAxisDataMap: {},
    };
  }

  componentDidMount() {
    webSocketManager.initWebSocket();
    webSocketManager.addListener('HZERO_INTERFACE_METRICS_QPS', this.updateData);
  }

  componentWillUnmount() {
    // webSocketManager.destroyWebSocket();
    webSocketManager.removeListener('HZERO_INTERFACE_METRICS_QPS', this.updateData);
  }

  /**
   * 根据websocket消息更新图状态
   * 指标：
   * totalTimePercent 度量时间占比
   * rps 度量RPS，亦即QPS，每秒中请求数量 （默认图上显示它）
   * avgTime 度量平均请求时间 毫秒
   * minTime 度量最小时间，及请求最小的时间，毫秒
   * maxTime 度量最大时间，即请求最大的时间，毫秒
   * stdDev 度量标准差
   * totalCount 度量时间内总请求数量
   * tp50 满足百分之五十的网络请求所需要的最低耗时
   * tp90 满足百分之九十的网络请求所需要的最低耗时
   * tp95 满足百分之九十五的网络请求所需要的最低耗时
   * tp99 满足百分之九十九的网络请求所需要的最低耗时
   * tp999 满足百分之九十九点九的网络请求所需要的最低耗时
   * tp9999 满足百分之九十九点九九的网络请求所需要的最低耗时
   */
  @Bind()
  updateData({ message }) {
    const { xAxisData, yAxisDataMap } = this.state;
    const messageData = (isEmpty(message) ? {} : JSON.parse(message)) || {};
    if (isEmpty(messageData)) {
      return;
    }
    const { startMillisDesc, stopMillisDesc } = messageData;
    if (isEmpty(xAxisData)) {
      xAxisData.push(startMillisDesc);
      this.legendData.forEach((item) => {
        const prevData = yAxisDataMap[item.name] || [];
        yAxisDataMap[item.name] = { ...prevData, [startMillisDesc]: messageData[item.name] };
      });
    }
    if (!xAxisData.includes(stopMillisDesc)) {
      xAxisData.push(stopMillisDesc);
      this.legendData.forEach((item) => {
        const prevData = yAxisDataMap[item.name] || [];
        yAxisDataMap[item.name] = { ...prevData, [stopMillisDesc]: messageData[item.name] };
      });
    }
    this.echart.setOption({
      series: this.legendData.map((item) => ({
        data: xAxisData.map((time) => [time, yAxisDataMap[item.name][time]]),
      })),
      dataZoom: this.getDataZoom(xAxisData),
    });

    this.setState({ xAxisData, yAxisDataMap });
  }

  /**
   * 窗口期大小，默认15分钟
   */
  getDataZoom(xAxisData = []) {
    // websock每5秒刷新一次，窗口期为15分钟
    const count = (5 * 60) / 5;
    if (xAxisData.length <= count) {
      return undefined;
    }
    const lastIndex = xAxisData.length - 1;
    const startIndex = lastIndex + 1 - count;
    return [
      {
        xAxisIndex: 0,
        zoomLock: true,
        startValue: new Date(xAxisData[startIndex]),
        endValue: new Date(xAxisData[lastIndex]),
      },
    ];
  }

  @Bind()
  onChartReady(echart) {
    this.echart = echart;
  }

  @Bind()
  getOption() {
    return {
      tooltip: {
        trigger: 'axis',
      },
      legend: {
        bottom: 45,
        selected: this.initUnSelectedLegend(),
        data: this.legendData.map((item) => item.value),
      },
      grid: {
        left: '3%',
        right: '4%',
        top: 40,
        bottom: 70,
        containLabel: true,
      },
      xAxis: {
        type: 'time',
        boundaryGap: false,
      },
      yAxis: [
        {
          name: getLang('COUNT_UNIT'),
          type: 'value',
          axisLabel: {
            formatter: '{value}',
          },
        },
        {
          name: getLang('TIME_UNIT'),
          type: 'value',
          axisLabel: {
            formatter: '{value} ms',
          },
        },
      ],
      series: this.legendData.map((item) => ({
        name: item.value,
        type: 'line',
        areaStyle: {},
        yAxisIndex: item.yAxisIndex,
        emphasis: {
          focus: 'series',
        },
      })),
    };
  }

  initUnSelectedLegend() {
    let unSelectedLegend = {};
    this.legendData
      .filter((item) => item.name !== 'rps')
      .forEach((item) => {
        unSelectedLegend = {
          ...unSelectedLegend,
          [item.value]: false,
        };
      });
    return unSelectedLegend;
  }

  render() {
    const { name } = this.props;
    return (
      <Card title={name} bordered={false}>
        <ReactEcharts
          option={this.getOption()}
          opts={{ renderer: 'canvas' }}
          style={{ height: '540px' }}
          onChartReady={this.onChartReady}
        />
      </Card>
    );
  }
}
export default QpsCard;
