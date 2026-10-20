/**
 * 工作台卡片-接口调用指标统计通用组件
 * @author baitao.huang@hand-china.com
 * @date 2021/01/26
 * @version: 0.0.1
 * @copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import { DataSet, DateTimePicker, Form, Lov, Radio, Spin } from 'choerodon-ui/pro';
import { Card, Icon } from 'choerodon-ui';
import 'echarts/lib/chart/tree';
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/title';
import ReactEcharts from 'echarts-for-react';
import echarts from 'echarts/lib/echarts';
import { Bind } from 'lodash-decorators';
import { dateTimeRender } from 'hzero-front/lib/utils/renderer';
import { isEmpty, camelCase, isFunction } from 'lodash';
import { getCodeMeaning, isTenantRoleLevel } from 'hzero-front/lib/utils/utils';
import { DATETIME_MIN, DATETIME_MAX } from 'hzero-front/lib/utils/constants';
import moment from 'moment';
import { basicInfoDS, queryFormDS, formDS } from '@/stores/customize/interfaceInvokeTimesCardDS';
import getLang from '@/langs/cardLang';
import styles from './index.less';

class InterfaceIndicatorChart extends React.Component {
  timeInterval = 10000;

  constructor(props) {
    super(props);
    this.basicInfoDS = new DataSet(basicInfoDS());
    this.queryFormDS = new DataSet(
      queryFormDS({
        onFieldUpdate: this.handleFieldUpdate,
      })
    );
    this.formDS = new DataSet(
      formDS({
        onLoad: this.handleLoad,
      })
    );

    this.state = {
      typeList: [],
      indicatorList: [],
      manualRefresh: false,
      timeGaps: [],
    };
  }

  async componentDidMount() {
    await this.fetchLookupData();
    this.handleFetchData();
    this.refreshTimer = setInterval(() => {
      const { type, timeGap } = this.state;
      this.setTimeTange(type, timeGap, true);
      this.formDS.query();
    }, this.timeInterval);
  }

  componentWillUnmount() {
    clearInterval(this.refreshTimer);
  }

  async handleFetchData() {
    const { typeList = [], timeGaps = [] } = this.state;
    const { value } = typeList[0] || {};
    const { value: timeGap } = timeGaps.filter((item) => item.parentValue === value)[0] || {};
    this.formDS.setQueryParameter('statisticsType', value);
    this.setTimeTange(value, timeGap);
    this.setState({ timeGap, type: value });
  }

  async fetchLookupData() {
    const results = await Promise.all([
      this.basicInfoDS.getField('statisticsType').fetchLookup(),
      this.basicInfoDS.getField('statisticsIndicator').fetchLookup(),
      this.basicInfoDS.getField('timeGap').fetchLookup(),
    ]);
    const typeList = results[0] || [];
    const indicatorList = results[1] || [];
    const timeGaps = results[2] || [];
    this.setState({
      typeList,
      indicatorList,
      timeGaps,
    });
  }

  @Bind()
  handleLoad({ dataSet }) {
    const { indicators, onTransformYValue } = this.props;
    const legendData = [];
    const data = dataSet.records[0]?.toData() || {};
    const summaryFlag = this.isSummary();
    const name = summaryFlag ? 'tenantName' : 'interfaceCode';
    const series = indicators.map((indicator) => {
      const { statistics = [], summaries = [] } = data;
      const showList = summaryFlag ? summaries : statistics;
      if (!summaryFlag) {
        legendData.push(data[name]);
      }
      return {
        name: data[name],
        type: 'line',
        itemStyle:
          indicators.length > 1
            ? {}
            : {
                color: 'rgb(255, 70, 131)',
              },
        areaStyle:
          indicators.length > 1
            ? {}
            : {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  {
                    offset: 0,
                    color: 'rgb(255, 158, 68)',
                  },
                  {
                    offset: 1,
                    color: 'rgb(255, 70, 131)',
                  },
                ]),
              },
        data: showList.map((temp) => {
          const { statisticsLevel, interfaceCode, statisticsTime } = temp;
          const yValue = temp[this.getIndicatorName(indicator)] || null;
          return {
            name: summaryFlag ? statisticsLevel : interfaceCode,
            value: [
              statisticsTime,
              isFunction(onTransformYValue) ? onTransformYValue(yValue) : yValue,
            ],
          };
        }),
      };
    });
    this.echart.setOption(this.getOption(series, legendData), true);
  }

  /**
   * 判断是汇总数据还是明细数据
   * 根据【serviceInterfaceLov】判断
   * 有值为详细数据，否则为汇总
   */
  isSummary() {
    if (isTenantRoleLevel()) {
      return false;
    }
    const { tenantLov, serviceInterfaceLov } = (this.queryFormDS.records[0] || {}).toData();
    if (isEmpty(serviceInterfaceLov) && isEmpty(tenantLov)) {
      return true;
    }
    return false;
  }

  /**
   *  indicator参数转换为驼峰式命名
   */
  getIndicatorName(indicator) {
    const formatName = camelCase(indicator);
    return formatName;
  }

  @Bind()
  async handleFieldUpdate({ name, value }) {
    this.setState({ manualRefresh: true });
    switch (name) {
      case 'timeRange':
        {
          const { startTime, endTime } = value || {};
          this.formDS.setQueryParameter(
            'startTime',
            isEmpty(value) ? undefined : dateTimeRender(startTime)
          );
          this.formDS.setQueryParameter(
            'endTime',
            isEmpty(value) ? undefined : dateTimeRender(endTime)
          );
        }
        break;
      case 'tenantLov':
        {
          const { tenantId } = value || {};
          this.formDS.setQueryParameter('tenantId', tenantId);
        }
        break;
      case 'serviceInterfaceLov':
        if (!isEmpty(value)) {
          const { serverCode, interfaceCode } = value;
          this.formDS.setQueryParameter('interfaceCode', `${serverCode}##${interfaceCode}`);
        } else {
          this.formDS.setQueryParameter('interfaceCode', null);
        }
        break;
      default:
        this.formDS.setQueryParameter(name, value);
    }
    await this.formDS.query();
    this.setState({ manualRefresh: false });
  }

  /**
   * option配置项
   */
  @Bind()
  getOption(series = [], legendData = []) {
    const { indicators, yUnit = '' } = this.props;
    const { indicatorList } = this.state;
    return {
      series,
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
        },
        formatter: (params) => {
          let tooltipHtml = '';
          params.forEach((param, index) => {
            const { marker = '', value = [] } = param;
            if (index === 0) {
              tooltipHtml += `${value[0]} <br>`;
            }
            tooltipHtml += `${marker + getCodeMeaning(indicators[index], indicatorList)}: ${
              value[1]
            } <br>`;
          });
          return tooltipHtml;
        },
      },
      xAxis: {
        type: 'time',
        splitLine: {
          show: false,
        },
      },
      yAxis: {
        type: 'value',
        minInterval: 1,
        splitLine: {
          show: false,
        },
        axisLabel: {
          show: true,
          formatter: `{value} ${yUnit}`,
        },
      },
      legend: {
        top: 15,
        left: 'center',
        data: legendData,
      },
    };
  }

  @Bind()
  onChartReady(echart) {
    this.echart = echart;
  }

  @Bind()
  handleTypeChange(value) {
    const { timeGaps } = this.state;
    const { value: timeGap } = timeGaps.filter((item) => item.parentValue === value)[0] || {};
    this.formDS.setQueryParameter('statisticsType', value);
    this.setTimeTange(value, timeGap);
    this.setState({ timeGap, type: value });
  }

  @Bind()
  handleTimeGapChange(value) {
    const { type } = this.state;
    this.setTimeTange(type, value);
    this.setState({ timeGap: value });
  }

  setTimeTange(type, timeGap, autoFlag = false) {
    const value = Number(timeGap);
    const gap = this.transformTimeGap(value);
    const unit = this.transformUnit(type);
    let endTime = moment();
    let startTime = moment().subtract(gap, unit);
    /**
     * 特殊处理，
     * 9：今天
     * 10:昨天
     * 13:本月
     */
    if (value === 9) {
      startTime = moment().format(DATETIME_MIN);
      endTime = moment().format(DATETIME_MAX);
    } else if (value === 10) {
      startTime = moment().subtract(1, 'days').format(DATETIME_MIN);
      endTime = moment().subtract(1, 'days').format(DATETIME_MAX);
    } else if (value === 13) {
      startTime = moment().startOf('month');
      endTime = moment().endOf('month');
    }
    if (autoFlag) {
      this.queryFormDS.current.init('timeRange', { startTime, endTime });
    } else {
      this.queryFormDS.current.set('timeRange', { startTime, endTime });
    }
  }

  /**
   * 日期格式转换
   */
  @Bind()
  transformTimeFormat(value) {
    const { type } = this.state;
    switch (type) {
      case 'DAY':
        return moment(value).format('YYYY-MM-DD');
      case 'MONTH':
        return moment(value).format('YYYY-MM');
      default:
        return moment(value).format('YYYY-MM-DD HH:mm:ss');
    }
  }

  /**
   * 单位转换
   */
  transformUnit(type) {
    switch (type) {
      case 'MINUTE':
        return 'minutes';
      case 'HOUR':
        return 'hours';
      case 'DAY':
        return 'days';
      case 'MONTH':
        return 'months';
      default:
        return 'minutes';
    }
  }

  /**
   * 实际间隔值转换
   */
  transformTimeGap(value) {
    switch (value) {
      case 1:
        return 5;
      case 2:
        return 10;
      case 3:
        return 30;
      case 4:
        return 60;
      case 5:
        return 1;
      case 6:
        return 3;
      case 7:
        return 12;
      case 8:
        return 24;
      case 9:
        return 0;
      case 10:
        return -1;
      case 11:
        return 7;
      case 12:
        return 30;
      case 13:
        return 0;
      case 14:
        return 3;
      case 15:
        return 7;
      case 16:
        return 12;
      default:
        return 5;
    }
  }

  @Bind()
  handleTimeRangeChange(val) {
    if (isEmpty(val)) {
      this.handleFetchData();
    }
  }

  render() {
    const { title } = this.props;
    const { type, timeGap, typeList, timeGaps, manualRefresh } = this.state;
    return (
      <Card
        className={styles['indicator-card']}
        title={<h3>{title}</h3>}
        bordered={false}
        extra={
          <a onClick={() => this.handleFetchData()}>
            {getLang('RELOAD')}
            <Icon type="refresh" />
          </a>
        }
      >
        <Form dataSet={this.queryFormDS} columns={2}>
          {!isTenantRoleLevel() && <Lov name="tenantLov" />}
          <Lov name="serviceInterfaceLov" />
        </Form>
        <Spin dataSet={manualRefresh ? this.formDS : new DataSet()}>
          <div className={styles.tool}>
            <div className={styles['right-tool']}>
              {timeGaps
                .filter((item) => item.parentValue === type)
                .map((item) => (
                  <Radio
                    name="timeGap"
                    mode="button"
                    value={item.value}
                    key={item.value}
                    checked={timeGap === item.value}
                    onChange={this.handleTimeGapChange}
                  >
                    {item.meaning}
                  </Radio>
                ))}
              <DateTimePicker
                name="timeRange"
                dataSet={this.queryFormDS}
                style={{ marginLeft: 10, marginRight: 10 }}
                placeholder={[getLang('START_TIME'), getLang('END_TIME')]}
                onChange={this.handleTimeRangeChange}
              />
              {typeList.map((item) => (
                <Radio
                  name="type"
                  mode="button"
                  value={item.value}
                  key={item.value}
                  checked={type === item.value}
                  onChange={this.handleTypeChange}
                >
                  {item.meaning}
                </Radio>
              ))}
            </div>
          </div>
          <ReactEcharts
            option={this.getOption()}
            opts={{ renderer: 'canvas' }}
            style={{ height: 500 }}
            onChartReady={this.onChartReady}
          />
        </Spin>
      </Card>
    );
  }
}

export default InterfaceIndicatorChart;
