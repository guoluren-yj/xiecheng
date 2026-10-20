/**
 * ReportView 报表图表渲染组件
 * @date: 2019-10-30
 * @author: LiLin <lin.li03@hand-china.com>
 * @copyright Copyright (c) 2019, Hand
 */

import React from 'react';
import { Bind } from 'lodash-decorators';
import { Select } from 'choerodon-ui/pro';
import echarts from 'echarts';

import intl from 'utils/intl';

import { queryReport } from '@/services/hrpt/reportQueryService';
import './index.less';

export default class ReportView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      allDataSource: [], // 所有数据
      checkedList: {}, // 被选择列表
      checkedObj: {}, // 用来筛选被选择x轴的数据
      xAxisOptionsObj: {}, // x轴选择器的所有数据
      dimColumnMap: {}, // x轴选择器的数据列表
      dimColumns: [], // x轴选择器列表
      statColumns: [], // 图表的系列数
      source: [], // 图表的数据
      xAxisName: '', // x轴名称
      chartType: '', // 当前图表类型
      chartOption: {}, // 图表的配置项和数据
    };
    this.ref = React.createRef();
    this.eTable = null;
  }

  componentDidMount() {
    const { code } = this.props;
    queryReport(code).then(res => {
      if (res) {
        const { dataRows, dimColumnMap, dimColumns, statColumns } = res;
        this.setState({
          dimColumns,
          dimColumnMap,
          statColumns,
        });
        this.handleProcessData(dimColumnMap, dataRows);
      }
    });
  }

  /**
   * 处理图表数据
   * @param {object} [dimColumnMap={}]
   * @param {object} [dataRows={}]
   */
  @Bind()
  handleProcessData(dimColumnMap = {}, dataRows = {}) {
    const { type, sign = '$', mark = '|', option = {} } = this.props;
    const { dimColumns = [], statColumns = [] } = this.state;
    const obj = {};
    let chartOption = {};
    const xAxisName = [];
    const checkedObj = {};
    const source = [['product', ...statColumns.map(item => item.name)]];
    for (const prop in dataRows) {
      if (prop) {
        const name = prop.split(sign);
        if (name[name.length - 1] === '') {
          name.pop();
        }
        const newName = name.join(mark);
        const data = statColumns.map(item => dataRows[prop][item.name]);
        source.push([newName, ...data]);
      }
    }
    dimColumns.forEach(item => {
      const { name, text } = item;
      if (text) {
        xAxisName.push(text);
      }
      if (dimColumnMap[name]) {
        const arr = [];
        dimColumnMap[name].forEach(n => {
          if (n.value !== 'all') {
            arr.push(n.value);
          }
        });
        checkedObj[name] = dimColumnMap[name];
        obj[name] = arr;
      }
    });

    chartOption = {
      color: [
        '#c23531',
        '#2f4554',
        '#61a0a8',
        '#d48265',
        '#91c7ae',
        '#749f83',
        '#ca8622',
        '#bda29a',
        '#6e7074',
        '#546570',
        '#c4ccd3',
      ],
      tooltip: {},
      legend: {},
      ...option,
      dataset: {
        source,
      },
    };

    this.setState({
      source,
      checkedObj,
      chartOption,
      allDataSource: source,
      checkedList: { ...obj },
      xAxisOptionsObj: checkedObj,
      xAxisName: xAxisName.join(mark),
    });
    if (this.ref.current) {
      this.eTable = echarts.init(this.ref.current);
      this.renderChart(type);
    }
  }

  /**
   * 渲染图表
   * @param {string} type
   */
  @Bind()
  renderChart(type) {
    if (this.eTable) {
      let option = {};
      if (type === 'pie') {
        option = this.getPieOption();
      } else if (type === 'bar' || type === 'line') {
        option = this.getGridOption(type);
      }
      this.eTable.clear();
      this.eTable.setOption(option);
    }
    this.setState({
      chartType: type,
    });
  }

  /**
   *
   * 生成网格图配置
   * @param {string} type
   */
  @Bind()
  getGridOption(type) {
    const { xAxisName, chartOption, statColumns = [] } = this.state;
    const { rotate = 0 } = this.props; // 刻度标签旋转的角度
    const option = {
      ...chartOption,
      tooltip: {
        trigger: type === 'line' ? 'axis' : 'item',
      },
      xAxis: [
        {
          name: xAxisName,
          type: 'category',
          axisTick: { show: false },
          axisLabel: { rotate },
        },
      ],
      yAxis: { type: 'value' },
      series: statColumns.map(item => ({
        name: item.text,
        type,
        label:
          type === 'bar'
            ? {
                show: true,
                position: 'top',
              }
            : {},
      })),
    };
    return option;
  }

  /**
   * 生成饼状图配置
   */
  @Bind()
  getPieOption() {
    const { chartOption, statColumns = [] } = this.state;
    const {
      radius, // 饼图半径
      minShowLabelAngle = 0, // 小于这个值的扇区，不显示标签
    } = this.props;
    let len = 0;
    let number = 0;
    let interval = 0;
    const pieRadius = radius || 55;
    if (statColumns.length) {
      number = Math.ceil(statColumns.length / 2);
      interval = 0.5 / number;
      len = statColumns.length;
    }
    const option = {
      ...chartOption,
      title: this.createPieTitle(),
      legend: {
        type: 'scroll',
      },
      xAxis: { show: false },
      yAxis: { show: false },
      series: statColumns.map((item, index) => {
        return {
          name: item.text,
          type: 'pie',
          radius: `${pieRadius - 10 * Math.ceil(len / 2)}%`,
          center: this.computeChartLayout(len, interval, index),
          encode: {
            itemName: 'product',
            value: item.name,
          },
          minShowLabelAngle,
        };
      }),
    };
    return option;
  }

  /**
   * 计算饼状图布局
   * @param {number} len
   * @param {number} interval
   * @param {number} index
   * @memberof ReportView
   */
  @Bind()
  computeChartLayout(len, interval, index) {
    const {
      pieCenter = ['50%', '50%'], // 饼图中心位置
    } = this.props;
    if (len === 1) {
      return pieCenter;
    } else if (len > 1) {
      const number = Number.isInteger(index / 2) ? 0 : 1;
      const x = (0.25 + number * 0.5) * 100;
      const upSide = len > 2 ? 0.05 / (Math.ceil(len / 2) - 1) + 0.025 : 0;
      const y = (interval + upSide + (Math.ceil((index + 1) / 2) - 1) * interval * 2) * 100;
      return [`${x}%`, `${y}%`];
    }
  }

  /**
   * 生成饼图标题
   */
  @Bind()
  createPieTitle() {
    const { statColumns = [] } = this.state;
    const len = statColumns.length;
    let titles = [];
    if (len === 1) {
      titles = statColumns.map(item => {
        return {
          text: item.text,
          top: '90%',
          left: '47.5%',
          textStyle: { fontWeight: '500', fontSize: 14 },
        };
      });
    } else if (len > 1) {
      const interval = 100 / Math.ceil(len / 2);
      titles = statColumns.map((item, index) => {
        const n = interval * Math.ceil((index + 1) / 2);
        const num = n === 100 ? (len < 3 ? '90%' : 'bottom') : `${n}%`;
        return {
          text: item.text,
          top: num,
          left: Number.isInteger(index / 2) ? '21.5%' : '72.5%',
          textStyle: { fontWeight: '500', fontSize: 14 },
        };
      });
    }
    return titles;
  }

  /**
   * x轴数据选择器值改变时触发
   * @param {array} value
   * @param {string} name
   */
  @Bind()
  handleChange(value, name) {
    const checkValue = value || [];
    const { checkedList, checkedObj, xAxisOptionsObj } = this.state;
    const obj = { ...checkedList };
    const newObj = { ...checkedObj };
    const newArray = [];
    obj[name] = checkValue;
    checkValue.forEach(item => {
      xAxisOptionsObj[name].forEach(n => {
        if (n.value === item) {
          newArray.push(n);
        }
      });
    });
    newObj[name] = newArray;
    this.setState({
      checkedList: { ...obj },
      checkedObj: { ...newObj },
    });
    this.filterData(newObj);
  }

  /**
   * 柱状图筛选要显示的数据
   * @param {object} obj
   */
  @Bind()
  filterData(obj) {
    const { allDataSource } = this.state;
    const selectList = [];
    let showDataSource = [];
    for (const prop in obj) {
      if (obj[prop].length) {
        selectList.push(obj[prop]);
      }
    }
    if (selectList.length > 0) {
      selectList.forEach(item => {
        const current = [];
        if (showDataSource.length) {
          item.forEach(i => {
            const data = showDataSource.filter(n => n[0].includes(i.text));
            current.push(...data);
          });
        } else {
          item.forEach(i => {
            const data = allDataSource.filter(n => n[0].includes(i.text));
            current.push(...data);
          });
        }
        showDataSource = current;
      });
    } else {
      showDataSource = [];
    }
    if (this.eTable) {
      this.eTable.setOption({
        dataset: {
          source: showDataSource,
        },
      });
    }
  }

  render() {
    const {
      selectView = true,
      selectSize = 'default',
      echartsStyle = {
        width: '100%',
        flexGrow: 1,
      },
      selectStyle = {
        width: '500px',
      },
      className,
      style,
    } = this.props;
    const selectClassName = [className, 'select-item'];
    const { dimColumns = [], dimColumnMap, checkedList, chartType } = this.state;
    return (
      <div className="report-view">
        <div className="select-wrap">
          <div className="x-data-select">
            {chartType === 'bar' &&
              selectView &&
              dimColumns &&
              dimColumns.map(item => {
                const { text, name } = item;
                return (
                  <div key={name} style={style} className={selectClassName.join(' ')}>
                    <div className="echarts-select-text">
                      {intl.get('hzero.common.button.select').d('选择')}
                      {text}：
                    </div>
                    <Select
                      size={selectSize}
                      multiple
                      value={checkedList[name]}
                      onChange={value => {
                        this.handleChange(value, name);
                      }}
                      style={selectStyle}
                    >
                      {dimColumnMap[name] &&
                        dimColumnMap[name].map(
                          n =>
                            n.value !== 'all' && (
                              <Select.Option key={n.value} value={n.value}>
                                {n.text}
                              </Select.Option>
                            )
                        )}
                    </Select>
                  </div>
                );
              })}
          </div>
        </div>
        <div ref={this.ref} style={echartsStyle} />
      </div>
    );
  }
}
