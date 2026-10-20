/**
 * Chart - 历史价格趋势图
 * @date: 2020-09-16
 * @author: Goku<xu.pan01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */

import React, { Component, Fragment } from 'react';
import { observer } from 'mobx-react-lite';
import {
  Tooltip,
  DataSet,
  Form,
  TextField,
  NumberField,
  Lov,
  Switch,
  DatePicker,
  DateTimePicker,
  Button,
  Select as SelectPro,
  Spin,
} from 'choerodon-ui/pro';
import { Row, Col, Icon, Modal } from 'choerodon-ui';
import { math } from 'choerodon-ui/dataset';
import echarts from 'echarts';
import { Bind, debounce } from 'lodash-decorators';
import { isEmpty, isFunction, map, toString, compose } from 'lodash';
import moment from 'moment';
import ssrcRemote from 'utils/remote';
import qs from 'querystring';
import classnames from 'classnames';

import intl from 'utils/intl';
import { Header, Content } from 'components/Page';
import { getCurrentUserId, getResponse } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import CollapseForm from '_components/CollapseForm';

import {
  fetchViewSwitchData,
  fetchPriceLibHeaderConfig,
  fetchQueryChartData,
  saveViewSwitch,
} from '@/services/priceLibraryNewService';
import commonStyle from '../index.less';
import style from './index.less';

const userId = getCurrentUserId();
const promptCode = 'ssrc.priceLibraryNew';

const colors = ['#29B8c8', '#ED9F24', '#47B883', '#F56649', '#3091F2', '#3F5BB5', '#FF0000'];
const symbolSize = 6;
const { Sidebar } = Modal;

class Chart extends Component {
  constructor(props) {
    super(props);
    const routerParams = this.props.match.params;
    const searchParams = qs.parse(this.props.location.search.substr(1));
    this.state = {
      viewCode: searchParams.viewCode, // 当前视图
      routerParams,
      viewSwitchData: [], // 切换视图数据
      formItemList: [], // 表单元素集合
      showCompareForm: true, // 展示对比维度表单

      queryFields: [], // 查询条件fields
      compareData: [], // 对比维度数据源
      compareCode: '', // 对比维度code
      curCompareField: '', // 当前对比维度列
      generateChartLoading: false,
      drawerVisible: false, // 侧弹窗
      xAxisDimensionData: [], // x轴下拉数据
      yAxisDimensionData: [], // y轴下拉数据
      // xAxis

      // ecchart 数据源
      // dataSource: [
      //   [[15, 0], [-50, 110], [-56.5, 20], [-46.5, 35], [-22.1, 40]],
      //   [[35, -50], [-15, 90], [-45.5, 20], [-76.5, 30], [-52.1, 50]],
      //   [[135, -70], [-55, 40], [-35.5, 20], [-56.5, 60], [-72.1, 20]],
      //   [[235, -20], [-25, 20], [-5.5, 20], [-36.5, 70], [-72.1, 100]],
      //   [[75, -10], [-15, 70], [-75.5, 20], [-26.5, 80], [-12.1, 90]],
      // ],

      // dataset使用如下数据格式 - 暂时未用
      // dataSource: [
      //   ['creationDate', 'lineChart0', 'lineChart1', 'lineChart2', 'lineChart3'],
      //   ['2020-09-01 19:56:24', '100', '200', '300', '400'],
      //   ['2020-09-02 19:56:24', '110', '210', '310', '410'],
      //   ['2020-09-03 19:56:24', '120', '220', '320', '420'],
      //   ['2020-09-04 19:56:24', '130', '230', '330', '430'],
      // ],

      dataSource: [], // 格式化后的数据
      responseData: [],
      legendList: [], // 图例数据源
      loading: true,
    };
  }

  myChart;

  // echart图表实例
  queryFormDs = new DataSet();

  compareFormDs = new DataSet();

  drawerFormDs = new DataSet(); // 侧弹窗

  componentDidMount() {
    this.fetchViewSwitch();
    // this.fetchPriceLibHeaderConfig();
    window.addEventListener('resize', this.updatePosition);
  }

  renderEcharts() {
    const { compareCode, curCompareField, responseData = [], queryFields = [] } = this.state;
    const searchParams = qs.parse(this.props.location.search.substr(1));
    const { itemId, supplierCompanyId } = searchParams;
    const axisData = this.drawerFormDs.current.toData();
    const xAxisRow =
      this.queryFormDs.current.getState('headerConfigList') &&
      this.queryFormDs.current
        .getState('headerConfigList')
        .find((item) => item.dimensionCode === axisData.xAxis);
    const yAxisRow =
      this.queryFormDs.current.getState('headerConfigList') &&
      this.queryFormDs.current
        .getState('headerConfigList')
        .find((item) => item.dimensionCode === axisData.yAxis);
    const xAxisName = xAxisRow && xAxisRow.dimensionName;
    const yAxisName = yAxisRow && yAxisRow.dimensionName;
    const option = {
      title: {
        text: intl.get(`${promptCode}.view.message.trendChart`).d('趋势图'),
      },
      legend: {
        // 使用自定义图例
        type: 'scroll',
        show: false,
        bottom: 150,
        right: 0,
        // padding: [0, -100, 150, 0],
        orient: 'vertical',
        data: (() => {
          const list = [];
          for (let i = 0; i <= responseData.length; i++) {
            // eslint-disable-next-line no-unused-expressions
            !isEmpty(responseData[i]) &&
              list.push(
                responseData[i][0] &&
                  responseData[i][0][
                    curCompareField &&
                    (curCompareField.fieldWidget === 'LOV' ||
                      curCompareField.fieldWidget === 'SELECT')
                      ? `${compareCode}Meaning`
                      : compareCode
                  ]
              );
          }
          return list;
        })(),
      },
      tooltip: {
        // triggerOn: 'none',
        // triggerOn: 'mousemove|click',
        hideDelay: 250,
        formatter: (params) => {
          // 需要考虑是否是基线 showTip seriesIndex/dataIndex
          const { seriesIndex, dataIndex } = params;
          // 根据2个下标可以确定点 => 映射到返回数据中
          const point = responseData[seriesIndex][dataIndex];
          const queryParams = this.queryFormDs.current.toData();
          // 删除__dirty属性
          delete queryParams.__dirty;
          for (const key in queryParams) {
            if (
              queryParams[key] === undefined ||
              queryParams[key] === null ||
              queryParams[key].length === 0
            ) {
              delete queryParams[key]; // 如果值不存在, 则删除该属性
            }
          }
          if (!isEmpty(itemId) || !isEmpty(supplierCompanyId)) {
            // 针对默认的物料供应商处理
            delete queryParams.itemIdCopy;
            delete queryParams.itemIdMeaning;
            delete queryParams.supplierCompanyIdCopy;
            delete queryParams.supplierCompanyIdMeaning;
          }
          if (params.componentType === 'markLine') {
            return `${intl.get(`${promptCode}.view.message.minPrice`).d('最低价')}: ${math.toFixed(
              params.data.coord[1],
              2
            )}<br>
              ${intl.get(`${promptCode}.view.message.currencyType`).d('币种')}: ${
              point.currencyCodeMeaning || '-'
            }`;
          } else {
            // 需要把查询条件的值一起展示 根据{compareCode}Meaning => 映射label
            let tips = '';
            Object.entries(queryParams).forEach(([key, value]) => {
              if (key !== 'itemId' && key !== compareCode && key !== 'dateArea' && value !== null) {
                // 物品做为固定展示, 需要从queryParams中过滤
                // 过滤对比维度的查询条件
                // 先找到对应field
                const field = queryFields.find((item) => item.dimensionCode === key); // 根据维度key, 先找到field
                // 判断是否是值集
                const isLov = field.fieldWidget === 'LOV' || field.fieldWidget === 'SELECT';
                tips += `${field.dimensionName}: ${
                  isLov ? point[`${key}Meaning`] || '-' : point[key] || '-'
                }<br>`;
              }
            });
            return `${tips}${intl.get(`${promptCode}.view.message.item`).d('物品')}: ${
              point.itemIdMeaning || '-'
            }<br>${intl.get(`${promptCode}.view.message.quotationDate`).d('报价时间')}: ${
              params.data[0]
            }<br>${intl.get(`${promptCode}.view.message.unitPrice`).d('单价')}: ${math.toFixed(
              params.data[1],
              2
            )} ${point.currencyCodeMeaning || '-'}/${point.uomIdMeaning || '-'}`;
          }
        },
      },
      grid: {},
      xAxis: {
        // min: -100,
        // max: 80,

        // name: intl.get(`${promptCode}.view.message.date`).d('时间'),
        name: xAxisName,
        type: 'time',
        axisLine: { onZero: false },
        nameTextStyle: {
          padding: [55, 15, 15, 10],
        },
      },
      yAxis: {
        // min: -30,
        // max: 60,

        // min: 'dataMin',
        // max: 'dataMax',
        // max: value => {
        //   return value.max + parseInt(value.max/10, 10);
        // },
        name: yAxisName,
        type: 'value',
        axisLine: { onZero: false },
        axisLabel: {
          formatter: (value) => {
            const strValue = toString(value);
            if (strValue.length > 10) {
              return `${strValue.substr(0, 10)}
              ${strValue.substr(10)}`;
            }
            return value;
          },
        },
      },
      dataZoom: [
        {
          type: 'slider',
          xAxisIndex: 0,
          filterMode: 'filter',
          height: 6.5,
          bottom: 5,
          backgroundColor: 'rgba(245, 245, 245)',
          fillerColor: 'rgba(41,190,206,0.55)',
          handleIcon:
            'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
          handleSize: 12,
          handleStyle: {
            color: '#29bece',
            shadowBlur: 3,
            shadowColor: 'rgba(0, 0, 0, 0.6)',
            shadowOffsetX: 2,
            shadowOffsetY: 2,
          },
        },
        {
          type: 'slider',
          yAxisIndex: 0,
          filterMode: 'filter',
          width: 6.5,
          backgroundColor: '#5cb4c761',
          fillerColor: 'rgba(41,190,206,0.55)',
          handleIcon:
            'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
          handleSize: 12,
          handleStyle: {
            color: '#29bece',
            shadowBlur: 3,
            shadowColor: 'rgba(0, 0, 0, 0.6)',
            shadowOffsetX: 2,
            shadowOffsetY: 2,
          },
        },
        {
          type: 'inside',
          xAxisIndex: 0,
          filterMode: 'filter',
        },
        {
          type: 'inside',
          yAxisIndex: 0,
          filterMode: 'filter',
        },
      ],
      // dataset: {
      //   source: dataSource,
      // },
      series: this.generateChartSeries(),
    };
    if (!this.myChart) {
      this.myChart = echarts.init(this.chartRef);
      this.myChart.on('dataZoom', this.updatePosition);
    }
    this.myChart.setOption(option, true);
    setTimeout(() => {
      // Add shadow circles (which is not visible) to enable drag.
      this.myChart.setOption({
        graphic: this.processGraphicGroup(),
      });
    }, 0);
  }

  /**
   * 生成图表数据
   * @returns series - 系列数据
   */
  @Bind()
  generateChartSeries() {
    const { compareCode, curCompareField, dataSource = [], responseData = [] } = this.state;
    // name为了映射legend 根据compareCode 找到{compareCode}Meaning
    if (!responseData || !responseData[0]) return [];
    return dataSource.map((item, index) => ({
      id: `line${index}`,
      name:
        responseData[index][0] &&
        responseData[index][0][
          curCompareField &&
          (curCompareField.fieldWidget === 'LOV' || curCompareField.fieldWidget === 'SELECT')
            ? `${compareCode}Meaning`
            : compareCode
        ],
      type: 'line',
      areaStyle: dataSource.length === 1 ? { color: colors[index] } : null, // 设置为 `null` 才可以
      smooth: true,
      showAllSymbol: true, // 标注所有点
      symbolSize,
      // ds映射
      // encode: {
      //   // Map the "creationDate" column to X axis.
      //   x: 'creationDate',
      //   // Map the "unitPrice" column to Y axis
      //   y: 'unitPrice',
      // },
      data: map(item, (r) => [r[0], math.isBigNumber(r[1]) ? math.toFixed(r[1]) : r[1]]), // 兼容大数据升级
      itemStyle: {
        // 折线样式
        normal: {
          color: colors[index % 7],
          lineStyle: {
            color: colors[index % 7],
            width: 1,
          },
        },
      },
      markLine: {
        silent: false, // 响应鼠标事件
        lineStyle: {
          normal: {
            color: colors[index % 7], // 基准线颜色
          },
        },
        data: [
          {
            // yAxis: 30,
            // 0: {
            //   type: "min",
            // },
            type: 'min',
          },
        ],
        label: {
          normal: {
            formatter: (params) => {
              const { value } = params;
              return `${intl.get(`${promptCode}.view.message.minPrice`).d('最低价')}: ${value}`; // 这儿设置安全基线
            },
          },
        },
      },
    }));
  }

  /**
   * 处理数据分组
   * @returns graphicGroup - 图表集合
   */
  @Bind()
  processGraphicGroup() {
    const { dataSource = [] } = this.state;
    const graphicGroup = [];
    dataSource.forEach((item, index) => {
      const tempArr =
        item &&
        echarts.util.map(item, (dataItem, dataIndex) => {
          return {
            type: 'circle',
            position: this.myChart.convertToPixel('grid', dataItem),
            shape: {
              cx: 0,
              cy: 0,
              r: symbolSize / 2,
            },
            invisible: true,
            // draggable: true,
            // ondrag: echarts.util.curry(this.onPointDragging, dataIndex),
            onmousemove: echarts.util.curry(() => this.showTooltip(index, dataIndex), dataIndex),
            onmouseout: echarts.util.curry(this.hideTooltip, dataIndex),
            z: 100,
          };
        });
      graphicGroup.push(...tempArr);
    });
    return graphicGroup;
  }

  /**
   * 更新坐标
   */
  @Bind()
  updatePosition() {
    const { dataSource = [] } = this.state;
    const tempArr = [];
    dataSource.forEach((item) => tempArr.push(...item));
    // eslint-disable-next-line no-unused-expressions
    this.myChart &&
      this.myChart.setOption({
        graphic: echarts.util.map(tempArr, (item) => {
          return {
            position: this.myChart.convertToPixel('grid', item),
          };
        }),
      });
  }

  /**
   * 展示toolTip
   * @param {number} index - series下标
   * @param {number} dataIndex - 对应series下数据下标
   */
  @Bind()
  showTooltip(index, dataIndex) {
    this.myChart.dispatchAction({
      type: 'showTip',
      seriesIndex: index,
      dataIndex,
    });
  }

  /**
   * 隐藏toolTip
   */
  @Bind()
  hideTooltip() {
    this.myChart.dispatchAction({
      type: 'hideTip',
    });
  }

  /**
   * 拖拽坐标轴
   */
  @Bind()
  onPointDragging(dataIndex) {
    const { compareCode, curCompareField, dataSource = [], responseData = [] } = this.state;
    dataSource.forEach((item) => {
      // eslint-disable-next-line no-param-reassign
      item[dataIndex] = this.myChart.convertFromPixel('grid', this.position);
    });
    const series =
      !responseData || !responseData[0]
        ? []
        : dataSource.map((item, index) => ({
            id: `line${index}`,
            name:
              responseData[index][0] &&
              responseData[index][0][
                curCompareField &&
                (curCompareField.fieldWidget === 'LOV' || curCompareField.fieldWidget === 'SELECT')
                  ? `${compareCode}Meaning`
                  : compareCode
              ],
            type: 'line',
            smooth: true,
            symbolSize,
            // ds映射
            // encode: {
            //   // Map the "creationDate" column to X axis.
            //   x: 'creationDate',
            //   // Map the "unitPrice" column to Y axis
            //   y: 'unitPrice',
            // },
            data: map(item, (r) => [r[0], math.isBigNumber(r[1]) ? math.toFixed(r[1]) : r[1]]), // 兼容大数据升级
            itemStyle: {
              // 折线样式
              normal: {
                color: colors[index % 7],
                lineStyle: {
                  color: colors[index % 7],
                  width: 1,
                },
              },
            },
            markLine: {
              silent: false, // 响应鼠标事件
              lineStyle: {
                normal: {
                  color: colors[index % 7], // 基准线颜色
                },
              },
              data: [
                {
                  // yAxis: 30,
                  // 0: {
                  //   type: "min",
                  // },
                  type: 'min',
                },
              ],
              label: {
                normal: {
                  formatter: (params) => {
                    const { value } = params;
                    return `${intl
                      .get(`${promptCode}.view.message.minPrice`)
                      .d('最低价')}: ${value}`; // 这儿设置安全基线
                  },
                },
              },
            },
          }));
    // Update data
    this.myChart.setOption(
      {
        series,
      },
      true
    );
  }

  // 查询视图配置选项
  @Bind()
  async fetchViewSwitch() {
    const { viewCode } = this.state;
    const result = getResponse(
      await fetchViewSwitchData({
        templateCode: this.state.routerParams.templateCode,
        userId,
      })
    );
    if (result && Array.isArray(result) && result.length > 0) {
      this.setState(
        {
          viewSwitchData: result,
          viewCode: viewCode || result.find((item) => item.currentViewFlag).viewCode,
        },
        () => {
          this.fetchPriceLibHeaderConfig();
        }
      );
    } else {
      this.closeLoading();
    }
  }

  /**
   * 查询头
   */
  @Bind()
  closeLoading() {
    this.setState({ loading: false });
  }

  /**
   * 查询头
   */
  @Bind()
  async fetchPriceLibHeaderConfig() {
    const { remote } = this.props;
    const { viewSwitchData, viewCode } = this.state;
    const searchParams = qs.parse(this.props.location.search.substr(1));
    const { itemId, itemIdMeaning, supplierCompanyId, supplierCompanyIdMeaning } = searchParams;
    const xAxisDimensionData = [];
    const yAxisDimensionData = [];
    const fieldConfig = {
      fieldWidget: ['SELECT', 'LOV'],
    };
    const fieldConfigObject = remote
      ? remote.process('SSRC_PRICE_LIBRARY_NEW_CHART_PROCESS_FIELD_CONFIG', fieldConfig, {
          current: this,
        })
      : fieldConfig;
    const result = getResponse(
      await fetchPriceLibHeaderConfig({
        templateCode: this.state.routerParams.templateCode,
        relevantPriceFlag: 0,
      })
    );
    if (result && Array.isArray(result) && result.length > 0) {
      const list = result;
      const compareData = [];
      const tempFormItemList = [];
      const queryFields = [];
      const memoItem = viewSwitchData && viewSwitchData.find((item) => item.viewCode === viewCode); // 找到用户记忆项
      let xAxisCode = 'creationDate';
      let yAxisCode = 'taxIncludedPrice';
      if (memoItem) {
        const { horizontalAxis, verticalAxis } = memoItem;
        xAxisCode = horizontalAxis || xAxisCode;
        yAxisCode = verticalAxis || yAxisCode;
      }
      const defaultXAxisItem = list.find((item) => item.dimensionCode === xAxisCode); // 先找到默认横轴维度
      if (defaultXAxisItem) {
        this.queryFormDs.addField('dateArea', {
          // 日期区间
          name: 'dateArea',
          dynamicProps: {
            label: ({ record }) => {
              const labelItem =
                record.getState('headerConfigList') &&
                record
                  .getState('headerConfigList')
                  .find((item) => item.dimensionCode === record.getState('dateAreaCode'));
              return labelItem && labelItem.dimensionName;
            },
          },
          ...this.renderQueryFieldType(defaultXAxisItem, true),
        });
        const formItem = this.generateQueryFormItem(
          {
            ...defaultXAxisItem,
            dimensionCode: 'dateArea',
          },
          true
        );
        tempFormItemList.push(formItem);
      }
      this.drawerFormDs.addField('xAxis', {
        name: 'xAxis',
        type: 'string',
        defaultValue: xAxisCode, // 优先取用户记忆接口数据
      });
      this.drawerFormDs.addField('yAxis', {
        name: 'yAxis',
        type: 'string',
        defaultValue: yAxisCode,
      });
      this.drawerFormDs.create({});
      list.forEach((item) => {
        if (item.fieldWidget === 'DATE_PICKER') {
          // x轴
          xAxisDimensionData.push(item);
        } else if (item.fieldWidget === 'INPUT_NUMBER' && item.dimensionCategory === 'PRICE') {
          // y轴
          yAxisDimensionData.push(item);
        }
        if (item.queryFlag) {
          // 针对物料和供应商field设置默认值
          if (item.dimensionCode === 'itemId' && !isEmpty(itemId)) {
            this.queryFormDs.addField('itemId', {
              name: 'itemId',
              label: item.dimensionName,
              ...this.renderQueryFieldType(item, true),
            });
            this.queryFormDs.addField('itemIdMeaning', {
              name: 'itemIdMeaning',
              type: 'string',
              bind: `itemId.${item.displayField}`,
              defaultValue: item.multipleFlag === 1 ? [itemIdMeaning] : itemIdMeaning,
            });
            this.queryFormDs.addField('itemIdCopy', {
              name: 'itemIdCopy',
              type: 'string',
              bind: `itemId.${item.valueField}`,
              defaultValue: item.multipleFlag === 1 ? [itemId] : itemId,
            });
          } else if (item.dimensionCode === 'supplierCompanyId' && !isEmpty(supplierCompanyId)) {
            this.queryFormDs.addField('supplierCompanyId', {
              name: 'supplierCompanyId',
              label: item.dimensionName,
              ...this.renderQueryFieldType(item, true),
            });
            this.queryFormDs.addField('supplierCompanyIdMeaning', {
              name: 'supplierCompanyIdMeaning',
              type: 'string',
              bind: `supplierCompanyId.${item.displayField}`,
              defaultValue:
                item.multipleFlag === 1 ? [supplierCompanyIdMeaning] : supplierCompanyIdMeaning,
            });
            this.queryFormDs.addField('supplierCompanyIdCopy', {
              // 备份Id, 避免列名冲突
              name: 'supplierCompanyIdCopy',
              type: 'string',
              bind: `supplierCompanyId.${item.valueField}`,
              defaultValue: item.multipleFlag === 1 ? [supplierCompanyId] : supplierCompanyId,
            });
          } else {
            this.queryFormDs.addField(item.dimensionCode, {
              name: item.dimensionCode,
              label: item.dimensionName,
              ...this.renderQueryFieldType(item, true),
            });
          }
          // 添加到formItemList中
          const formItem = this.generateQueryFormItem(item, true);
          tempFormItemList.push(formItem);
          // 仅把LOV和SELECT加入到对比维度中
          if (fieldConfigObject?.fieldWidget.includes(item.fieldWidget)) {
            compareData.push(item);
          }
          queryFields.push(item);
        }
      });
      this.queryFormDs.create({}); // 创建行
      this.queryFormDs.current.setState('headerConfigList', list);
      this.queryFormDs.current.setState('dateAreaCode', xAxisCode);
      this.compareFormDs.addField('compareCode', {
        name: 'compareCode',
        type: 'string',
        label: intl.get(`${promptCode}.model.library.compareDimension`).d('对比维度'),
      });
      this.compareFormDs.create({}); // 创建行
      if (!isEmpty(itemId) || !isEmpty(supplierCompanyId)) {
        // 自动查询
        this.handleFetchChartData();
      } else {
        // 暂时变更
        this.handleFetchChartData();
      }
      this.setState({
        compareData,
        queryFields,
        xAxisDimensionData,
        yAxisDimensionData,
        formItemList: tempFormItemList,
      });
    }
    this.closeLoading();
  }

  /**
   * 过滤下拉框, 价格库状态为新建的选项
   * @param {Object} record - 下拉框Option值
   * @param {string} lookupCode - 下拉框值集code
   */
  @Bind()
  handleFitlerPriceLibStatus(record, lookupCode) {
    if (lookupCode !== 'SSRC.PRICE_LIB_MAIN_STATUS') return true; // 非价格库状态不需要过滤
    return record.get('value') !== 'NEW';
  }

  /**
   * 渲染queryFieldType
   * 链接，上传，不可作查询条件
   * @param {boolean} isQueryField - 是否是查询列
   */
  @Bind()
  renderQueryFieldType(field, isQueryField) {
    let queryFieldConfig = {};
    switch (field.fieldWidget) {
      case 'INPUT':
        queryFieldConfig = {
          type: 'string',
        };
        break;
      case 'INPUT_NUMBER':
        queryFieldConfig = {
          type: 'number',
          range: ['start', 'end'],
        };
        break;
      case 'SELECT':
        queryFieldConfig = {
          type: 'string',
          lookupCode: field.sourceCode,
          multiple: !isQueryField || field.multipleFlag === 1 ? ',' : false,
          // 设置下拉框查询参数
          lovPara: this.renderQueryParams(field),
        };
        break;
      case 'LOV':
        queryFieldConfig = {
          type: 'object',
          lovCode: field.sourceCode,
          multiple: !isQueryField || field.multipleFlag === 1,
          // 设置下拉框查询参数
          lovPara: this.renderQueryParams(field),
          transformRequest: (value) =>
            value &&
            (!isQueryField || field.multipleFlag === 1
              ? value.map((item) => item[field.valueField])
              : value[field.valueField]),
        };
        break;
      case 'DATE_PICKER':
        queryFieldConfig = {
          type:
            field.dateFormat === 'yyyy/MM/dd hh:mm:ss' || field.dateFormat === 'yyyy-MM-dd hh:mm:ss'
              ? 'dateTime'
              : 'date',
          format: this.renderDateFormat(field.dateFormat),
          range: ['start', 'end'],
          transformRequest: (val) => {
            if (val) {
              Object.assign(val, {
                start:
                  val.start &&
                  moment(val.start).format(
                    field.dateFormat === 'yyyy/MM/dd hh:mm:ss' ||
                      field.dateFormat === 'yyyy-MM-dd hh:mm:ss'
                      ? 'YYYY-MM-DD HH:mm:ss'
                      : 'YYYY-MM-DD 00:00:00'
                  ),
                end:
                  val.end &&
                  moment(val.end).format(
                    field.dateFormat === 'yyyy/MM/dd hh:mm:ss' ||
                      field.dateFormat === 'yyyy-MM-dd hh:mm:ss'
                      ? 'YYYY-MM-DD HH:mm:ss'
                      : 'YYYY-MM-DD 23:59:59'
                  ),
              });
            }
            return val;
          },
        };
        break;
      case 'SWITCH':
        queryFieldConfig = {
          type: 'string',
          lookupCode: 'HPFM.FLAG',
        };
        break;
      default:
        queryFieldConfig = {
          type: 'string',
        };
        break;
    }
    return queryFieldConfig;
  }

  /**
   * 设置lov,select查询参数
   */
  @Bind()
  renderQueryParams(field) {
    let queryParams = {};
    if (!isEmpty(field.priceLibLovParamList)) {
      field.priceLibLovParamList.forEach((item) => {
        if (item.applyQueryFlag) {
          queryParams = { ...queryParams, [item.paramName]: item.paramValue };
        }
      });
    }
    return queryParams;
  }

  /**
   * 渲染时间日期渲染格式
   */
  @Bind()
  renderDateFormat(dateFormat) {
    let format;
    switch (dateFormat) {
      case 'yyyy-MM-dd':
        format = 'YYYY-MM-DD';
        break;
      case 'yyyy/MM/dd':
        format = 'YYYY/MM/DD';
        break;
      case 'yyyy-MM-dd hh:mm:ss':
        format = 'YYYY-MM-DD HH:mm:ss';
        break;
      case 'yyyy/MM/dd hh:mm:ss':
        format = 'YYYY/MM/DD HH:mm:ss';
        break;
      default:
        break;
    }
    return format;
  }

  /**
   * 切换Lov和Select
   * @param {string|Object} value - 选择后回调的值
   * @param {boolean} isQueryField - 是否查询列标识
   */
  @Bind()
  handleChange(_, isQueryField) {
    if (isQueryField) {
      setTimeout(() => {
        // // eslint-disable-next-line react/no-find-dom-node
        // const form = ReactDOM.findDOMNode(this.collapseFormRef.form.current);
        // // eslint-disable-next-line react/no-find-dom-node
        // const formWrapper = ReactDOM.findDOMNode(this.collapseFormRef.formWrapper.current);
        // const rect = form.getBoundingClientRect();
        // formWrapper.style.height = `${rect.height}px`;
        if (isFunction(this.collapseFormRef?.computeHeight)) {
          // eslint-disable-next-line no-unused-expressions
          this.collapseFormRef?.computeHeight(this.collapseFormRef.state.expand);
        }
      }, 300);
    } else {
      this.handleFetchChartData();
    }
  }

  /**
   * 渲染查询组件
   * @param {Object} field - 渲染item
   * @param {boolean} isQueryField - 是否查询field标识
   */
  generateQueryFormItem(field, isQueryField) {
    let formItem = '';
    const { fieldWidget, dimensionCode, dimensionName } = field;
    switch (fieldWidget) {
      case 'INPUT':
        formItem = <TextField name={dimensionCode} />;
        break;
      case 'INPUT_NUMBER':
        formItem = <NumberField name={dimensionCode} />;
        break;
      case 'SELECT':
        formItem = (
          <SelectPro
            name={dimensionCode}
            label={dimensionName}
            optionsFilter={(record) => this.handleFitlerPriceLibStatus(record, field.sourceCode)}
            onChange={(value) => this.handleChange(value, isQueryField)}
          />
        ); // hack: 当compareFormDs动态设置列时, label第一次未显示
        break;
      case 'LOV':
        formItem = (
          <Lov
            name={dimensionCode}
            label={dimensionName}
            onChange={(value) => this.handleChange(value, isQueryField)}
          />
        );
        break;
      case 'DATE_PICKER':
        formItem =
          field.dateFormat === 'yyyy/MM/dd hh:mm:ss' ||
          field.dateFormat === 'yyyy-MM-dd hh:mm:ss' ? (
            <DateTimePicker
              name={field.dimensionCode}
              defaultTime={[moment('00:00:00', 'HH:mm:ss'), moment('23:59:59', 'HH:mm:ss')]}
            />
          ) : (
            <DatePicker name={field.dimensionCode} />
          );
        break;
      case 'SWITCH':
        formItem = <Switch name={dimensionCode} />;
        break;
      default:
        formItem = <TextField name={dimensionCode} />;
        break;
    }
    return formItem;
  }

  /**
   * 切换视图
   */
  @Bind()
  async handleViewSelectChange(value) {
    const { viewSwitchData = [] } = this.state;
    if (!this.drawerFormDs.current) return;
    if (value) {
      // 同时保存横纵轴
      const axisData = this.drawerFormDs.current.toData();
      const { xAxis: horizontalAxis, yAxis: verticalAxis } = axisData;
      const params = viewSwitchData.find((item) => item.viewCode === value);
      const res = await getResponse(
        saveViewSwitch({ ...params, userId, horizontalAxis, verticalAxis })
      );
      if (res && !res.failed) {
        this.setState({
          viewCode: value,
        });
        // 全量视图下，价格库状态查询条件，默认为有效 add: 当查询条件不为空时, 才执行查询 或者 对比维度有值才自动查询
        this.handleFetchChartData(value);
      }
    }
  }

  /**
   * 切换时间维度
   * @param {!string} dateType - 日期维度类型
   */
  @Bind()
  handleClickTimeBtn(dateType) {
    // 需要清空 queryFormDs 中 `dateArea`
    if (!this.queryFormDs.current) {
      return;
    }
    switch (dateType) {
      case 'all': // 直接清空
        this.queryFormDs.current.set('dateArea', null);
        break;
      case 'nearThreeMonth': // 当前时间推前三个月
        this.queryFormDs.current.set('dateArea', {
          start: moment().subtract(3, 'months').format('YYYY-MM-DD 00:00:00'),
          end: moment().format('YYYY-MM-DD 23:59:59'),
        });
        break;
      case 'nearOneYear': // 当前时间推前一年
        this.queryFormDs.current.set('dateArea', {
          start: moment().subtract(1, 'years').format('YYYY-MM-DD 00:00:00'),
          end: moment().format('YYYY-MM-DD 23:59:59'),
        });
        break;
      default:
        break;
    }
  }

  /**
   * 渲染日期维度表单
   */
  renderDateForm() {
    const DateSelectBox = observer(({ queryFormDs }) => {
      // 需要判断 `dateArea` 是否有值, 假设
      let dateType = 'all'; // 是否是自定义日期区间
      if (queryFormDs.current && queryFormDs.current.toData().dateArea) {
        const { dateArea = {} } = queryFormDs.current.toData();
        const { start, end } = dateArea;
        const dateStart = start && moment(start);
        const dateEnd = end && moment(end);
        const dateDiffByYear = dateStart && dateEnd && dateEnd.diff(dateStart, 'years');
        const dateDiffByMonth = dateStart && dateEnd && dateEnd.diff(dateStart, 'months');

        if (dateDiffByYear === 1) {
          // 3个月/1年
          dateType = 'nearOneYear';
        } else if (dateDiffByMonth === 3) {
          dateType = 'nearThreeMonth';
        } else if (!start && !end) {
          // 未设置区间 - 全部
          dateType = 'all';
        } else {
          dateType = '';
        }
      }
      return (
        <div style={{ width: '100%', 'padding-left': '7px' }}>
          <div
            onClick={() => this.handleClickTimeBtn('all')}
            style={{
              padding: '5px 16px',
              borderBottom: dateType === 'all' && '1px solid #29BECE',
              display: 'inline-block',
              cursor: 'pointer',
            }}
          >
            {intl.get(`${promptCode}.view.message.button.all`).d('全部')}
          </div>
          <div
            onClick={() => this.handleClickTimeBtn('nearThreeMonth')}
            style={{
              padding: '5px 16px',
              borderBottom: dateType === 'nearThreeMonth' && '1px solid #29BECE',
              display: 'inline-block',
              cursor: 'pointer',
            }}
          >
            {intl.get(`${promptCode}.view.message.button.nearThreeMonth`).d('近3个月')}
          </div>
          <div
            onClick={() => this.handleClickTimeBtn('nearOneYear')}
            style={{
              padding: '5px 16px',
              borderBottom: dateType === 'nearOneYear' && '1px solid #29BECE',
              display: 'inline-block',
              cursor: 'pointer',
            }}
          >
            {intl.get(`${promptCode}.view.message.button.nearOneYear`).d('近1年')}
          </div>
        </div>
      );
    });
    return <DateSelectBox queryFormDs={this.queryFormDs} />;
  }

  /**
   * 渲染动态日期列   eg: 按照不同时间维度
   */
  renderDynamicDateCol() {
    const { formItemList = [] } = this.state;
    return (
      <Form dataSet={this.queryFormDs} columns={1} labelLayout="float">
        {formItemList[0]}
      </Form>
    );
  }

  /**
   * 渲染查询表单
   */
  renderQueryForm() {
    const {
      compareCode,
      curCompareField,
      formItemList = [],
      generateChartLoading = false,
      viewCode,
      viewSwitchData,
    } = this.state;
    // 判断是展开还是收缩
    const ReactiveButton = observer(({ queryFormDs, compareFormDs }) => {
      const queryParams = queryFormDs.current ? queryFormDs.current.toData() : {};
      const compareRecord = compareFormDs.current ? compareFormDs.current.toData() : {};
      const compareValue =
        curCompareField && curCompareField.fieldWidget === 'LOV'
          ? compareRecord[compareCode] && compareRecord[compareCode].join(',')
          : compareRecord[compareCode];
      // 暂时注释
      // eslint-disable-next-line no-unused-vars
      const isDisabled =
        isEmpty(
          Object.keys(queryParams).filter((key) => queryParams[key] !== null && key !== '__dirty')
        ) && !compareValue;
      return (
        <Button
          onClick={() => {
            this.handleFetchChartData();
          }}
          color="primary"
          loading={generateChartLoading}
        >
          {intl.get(`${promptCode}.view.button.generateChart`).d('生成图表')}
        </Button>
      );
    });

    return (
      <React.Fragment>
        <Row type="flex" style={{ 'margin-left': '-8px', 'margin-bottom': '14px' }}>
          <Col span={5} style={{ padding: '0 3px 0 0' }}>
            {Array.isArray(viewSwitchData) && viewSwitchData.length ? (
              <SelectPro
                value={viewCode}
                onChange={this.handleViewSelectChange}
                dropdownClassName={commonStyle['select-z-index']}
                allowClear={false}
                style={{ width: '100%', padding: '0 8px' }}
              >
                {viewSwitchData.map((item) => (
                  <SelectPro.Option key={item.viewCode} value={item.viewCode}>
                    <Tooltip title={item.viewName} placement="bottom" theme="light">
                      {item.viewName}
                    </Tooltip>
                  </SelectPro.Option>
                ))}
              </SelectPro>
            ) : null}
          </Col>
          <Col span={5} style={{ padding: '0 3px 0 0' }}>
            {this.renderDynamicDateCol()}
          </Col>
          <Col>{this.renderDateForm()}</Col>
        </Row>
        <Row
          type="flex"
          className={style['c7n-form-line-with-btn']}
          gutter={24}
          style={{ 'margin-left': '-20px', 'margin-bottom': '14px' }}
        >
          <Col span={20}>
            <CollapseForm
              ref={(vnode) => {
                this.collapseFormRef = vnode;
              }}
              dataSet={this.queryFormDs}
              columns={4}
              showLines={1}
              labelLayout="float"
              onKeyDown={(e) => {
                if (e.keyCode === 13) return this.handleFetchChartData();
              }}
            >
              {formItemList.slice(1)}
            </CollapseForm>
          </Col>
          <Col span={4} className="c7n-form-btn">
            <div
              style={{
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {/* <Button
              onClick={() => {
                this.setState({
                  expandForm: !expandForm,
                });
              }}
            >
              {expandForm
                ? intl.get('hzero.common.button.collected').d('收起查询')
                : intl.get(`hzero.common.button.viewMore`).d('更多查询')}
            </Button> */}
              <Button
                onClick={() => {
                  // eslint-disable-next-line no-unused-expressions
                  this.queryFormDs.current && this.queryFormDs.current.reset();
                  // 同时需要把默认值, 存在的2列手动清空
                  const searchParams = qs.parse(this.props.location.search.substr(1));
                  const { itemId, supplierCompanyId } = searchParams;
                  if (!isEmpty(itemId)) {
                    // 物料
                    this.queryFormDs.current.set('itemId', {});
                    this.queryFormDs.current.set('itemIdMeaning', '');
                    this.queryFormDs.current.set('itemIdCopy', '');
                  }
                  if (!isEmpty(supplierCompanyId)) {
                    // 供应商
                    this.queryFormDs.current.set('supplierCompanyId', {});
                    this.queryFormDs.current.set('supplierCompanyIdMeaning', '');
                    this.queryFormDs.current.set('supplierCompanyIdCopy', '');
                  }
                }}
              >
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <ReactiveButton queryFormDs={this.queryFormDs} compareFormDs={this.compareFormDs} />
            </div>
          </Col>
        </Row>
      </React.Fragment>
    );
  }

  /**
   * 查询图表数据
   * @param {string} code - 视图code
   */
  @Bind()
  async handleFetchChartData(code) {
    const {
      viewCode,
      compareCode,
      curCompareField,
      routerParams: { templateCode },
    } = this.state;
    // 优先取code || viewCode
    const reqViewCode = code || viewCode;
    if (!this.queryFormDs.current) return;
    // 假设维度为A, 查询条件有A/B/C/D, 用A的维度值覆盖查询条件值
    const queryParams = this.queryFormDs.current.toData();
    // 删除__dirty属性
    delete queryParams.__dirty;
    const compareRecord = this.compareFormDs.current.toData();

    // 针对日期格式处理
    for (const key in queryParams) {
      // eslint-disable-next-line no-continue
      if (queryParams[key] === undefined || queryParams[key] === null) continue; // 如果value不存在, 则跳过
      if (queryParams[key].start || queryParams[key].end) {
        Object.assign(queryParams, {
          [key]: JSON.stringify({
            from: queryParams[key].start,
            to: queryParams[key].end,
          }),
        });
      } else if (
        Object.prototype.hasOwnProperty.call(queryParams[key], 'start') ||
        Object.prototype.hasOwnProperty.call(queryParams[key], 'end')
      ) {
        // 判断是否属于日期格式, 防止日期选择后清空
        Object.assign(queryParams, {
          [key]: JSON.stringify({}),
        });
      }
    }

    // add 添加横轴/纵轴参数 - drawerFormDs
    const axisData = this.drawerFormDs.current.toData();
    const params = {
      compareCode,
      ...queryParams,
      [compareCode]:
        curCompareField && curCompareField.fieldWidget === 'LOV'
          ? compareRecord[compareCode] && compareRecord[compareCode].join(',')
          : compareRecord[compareCode],
      compareAbscissa: axisData.xAxis,
      compareOrdinate: axisData.yAxis,
      [axisData.xAxis]: queryParams.dateArea,
    };
    this.setState({
      generateChartLoading: true,
    });
    // eslint-disable-next-line no-unused-expressions
    this.myChart && this.myChart.showLoading();
    const result = getResponse(
      await fetchQueryChartData({
        templateCode, // 模板code
        viewCode: reqViewCode, // 视图code
        from: reqViewCode && reqViewCode !== 'ALL_VIEW' ? 'VIEW_LIST' : 'LIST', // 来源
        ...params,
      })
    );
    // eslint-disable-next-line no-unused-expressions
    this.myChart && this.myChart.hideLoading();
    this.setState(
      {
        generateChartLoading: false,
      },
      () => this.renderEcharts()
    );
    if (result) {
      const afterProcessData = this.processResponseData(result);
      // 设置图例数据
      const list = [];
      for (let i = 0; i <= result.length; i++) {
        // eslint-disable-next-line no-unused-expressions
        !isEmpty(result[i]) &&
          list.push({
            meaning:
              result[i][0] &&
              result[i][0][
                curCompareField &&
                (curCompareField.fieldWidget === 'LOV' || curCompareField.fieldWidget === 'SELECT')
                  ? `${compareCode}Meaning`
                  : compareCode
              ],
            isChecked: true,
          });
      }
      this.setState(
        {
          legendList: list,
          responseData: result,
          dataSource: afterProcessData,
        },
        () => {
          // 查询完数据重新设置echart
          this.renderEcharts();
        }
      );
    }
  }

  /**
   * 处理接口返回的数据
   */
  processResponseData(result = []) {
    const axisData = this.drawerFormDs.current.toData();
    if (isEmpty(result)) return [];
    const lineArr = []; // 折线集合
    // eslint-disable-next-line no-unused-expressions
    result &&
      result.forEach((item) => {
        // 每条折线
        const line = []; // 单条线
        // eslint-disable-next-line no-unused-expressions
        item &&
          item.forEach((point) => {
            // 每个点
            // line.push([
            //   point.creationDate,
            //   point[priceTypeFlag === '1' ? 'netPrice' : 'taxIncludedPrice'],
            // ]);

            // 变更 11 - 06
            line.push([point[axisData.xAxis], point[axisData.yAxis]]);
          });
        lineArr.push(line);
      });
    return lineArr;
  }

  /**
   * 切换对比维度
   */
  @Bind()
  handleChangeComapreDimension(code) {
    const { compareData = [] } = this.state;
    this.compareFormDs.current.reset(); // 清空其他所有的field
    this.compareFormDs.current.set('compareCode', code);
    const field = compareData.find((item) => item.dimensionCode === code); // 找到对应field
    const fieldExpadProps =
      field && field.fieldWidget === 'LOV'
        ? {
            multiple: true,
            transformRequest: (value) => value && value.map((item) => item[field.valueField]),
          }
        : {
            multiple: ',',
          };

    // eslint-disable-next-line no-unused-expressions
    field &&
      this.compareFormDs.addField(field.dimensionCode, {
        name: field.dimensionCode,
        label: field.dimensionName,
        ...this.renderQueryFieldType(field),
        ...fieldExpadProps,
      });
    this.setState({
      compareCode: code,
      curCompareField: field,
    });
  }

  /**
   * 展示坐标轴弹窗
   */
  @Bind()
  handleShowAxisDimension() {
    this.setState({
      drawerVisible: true,
    });
  }

  /**
   * 侧弹窗确认
   */
  @Bind()
  handleDrawerOk() {
    const { viewSwitchData, viewCode } = this.state;
    this.handleFetchChartData();
    // 同时用户记忆保存横纵轴
    const axisData = this.drawerFormDs.current.toData();
    const { xAxis: horizontalAxis, yAxis: verticalAxis } = axisData;
    const params = viewSwitchData.find((item) => item.viewCode === viewCode);
    saveViewSwitch({ ...params, userId, horizontalAxis, verticalAxis });
    this.setState({
      drawerVisible: false,
    });
  }

  /**
   * 侧弹窗取消
   */
  @Bind()
  handleDrawerCancel() {
    // this.drawerFormDs.current.reset();
    // 取消时需要重新设置外层, 时间维度
    // this.queryFormDs.current.setState('dateAreaCode', this.drawerFormDs.current.toData().xAxis);
    this.setState({
      drawerVisible: false,
    });
  }

  /**
   * 切换X轴
   */
  @Bind()
  handleChangeXAxis(code) {
    this.queryFormDs.current.setState('dateAreaCode', code);
  }

  /**
   * 展示对比维度表单
   */
  @debounce(200)
  @Bind()
  handleToggleCompareForm() {
    const { showCompareForm } = this.state;
    this.setState(
      {
        showCompareForm: !showCompareForm,
      },
      () => {
        // 需要对图表resize
        setTimeout(() => {
          // eslint-disable-next-line no-unused-expressions
          this.myChart && this.myChart.resize();
        }, 300);
      }
    );
  }

  /**
   * 点击图例
   */
  @Bind()
  handleClickLegendItem(item, index) {
    const { legendList = [] } = this.state;
    const tempArr = [...legendList];
    const tempItem = tempArr[index];
    Object.assign(tempItem, {
      isChecked: !item.isChecked,
    });
    // 需要更新state
    this.triggerAction('legendToggleSelect', item.meaning);
    this.setState({
      legendList: tempArr,
    });
  }

  /**
   * 图例事件
   * @param {string} action - 动作类型
   * @param {Obejct} meaning - 当前点击的图例
   */
  triggerAction(action, meaning) {
    this.myChart.dispatchAction({
      type: action,
      name: meaning,
    });
  }

  componentWillMount() {
    // 移除事件监听器
    window.removeEventListener('resize', this.updatePosition);
  }

  /**
   * 渲染图例
   */
  renderLegendList() {
    const { legendList = [] } = this.state;
    return (
      <ul className={style['ul-wrpper']}>
        {legendList &&
          legendList[0] &&
          legendList[0].meaning &&
          legendList.map((item, index) => {
            return (
              <li
                onClick={() => this.handleClickLegendItem(item, index)}
                style={{ color: item.isChecked ? colors[index] : '#acacac' }}
              >
                <div
                  className={style.label}
                  style={{ backgroundColor: item.isChecked ? colors[index] : '#acacac' }}
                />
                <span className={style.content}>{item.meaning}</span>
              </li>
            );
          })}
      </ul>
    );
  }

  /**
   * 渲染对比form
   */
  renderComapreForm() {
    const { compareData = [], compareCode = '', curCompareField = {} } = this.state;
    const CompareFormItem = this.generateQueryFormItem(curCompareField);
    return (
      <Form dataSet={this.compareFormDs} columns={1} labelLayout="float">
        <SelectPro
          name="compareCode"
          label={intl.get(`${promptCode}.view.message.compareDimension`).d('对比维度')}
          placeholder={intl.get(`${promptCode}.view.message.compareDimension`).d('对比维度')}
          allowClear
          // value={compareCode}
          onChange={this.handleChangeComapreDimension}
        >
          {compareData &&
            compareData.map((item) => (
              <SelectPro.Option key={item.dimensionCode} value={item.dimensionCode}>
                {item.dimensionName}
              </SelectPro.Option>
            ))}
        </SelectPro>
        {compareCode && CompareFormItem}
      </Form>
    );
  }

  /**
   * 渲染侧弹窗表单
   */
  @Bind()
  renderDrawerForm() {
    const { xAxisDimensionData, yAxisDimensionData } = this.state;
    return (
      <Form dataSet={this.drawerFormDs} columns={1} labelLayout="float">
        <SelectPro
          name="xAxis"
          label={intl.get(`${promptCode}.view.message.horizontalAxis`).d('横轴')}
          placeholder={intl.get(`${promptCode}.view.message.creationDate`).d('创建时间')}
          onChange={this.handleChangeXAxis}
        >
          {xAxisDimensionData &&
            xAxisDimensionData.map((item) => (
              <SelectPro.Option key={item.dimensionCode} value={item.dimensionCode}>
                {item.dimensionName}
              </SelectPro.Option>
            ))}
        </SelectPro>
        <SelectPro
          name="yAxis"
          label={intl.get(`${promptCode}.view.message.verticalAxis`).d('纵轴')}
          placeholder={intl.get(`${promptCode}.view.message.itemPrice`).d('物品单价')}
        >
          {yAxisDimensionData &&
            yAxisDimensionData.map((item) => (
              <SelectPro.Option key={item.dimensionCode} value={item.dimensionCode}>
                {item.dimensionName}
              </SelectPro.Option>
            ))}
        </SelectPro>
      </Form>
    );
  }

  render() {
    const {
      match: { params },
    } = this.props;

    const { drawerVisible = false, showCompareForm = false, loading } = this.state;

    return (
      <Fragment>
        <Header
          title={intl.get(`${promptCode}.view.title.historyPriceAnalysis`).d('历史价格分析')}
          backPath={`/ssrc/price-library-new/${params.templateCode}/list`}
        />
        <Content className={style['content-wrapper']}>
          <Spin spinning={loading}>
            {this.renderQueryForm()}
            {/* <div style={{ position: 'relative', display: chartVisible ? 'block' : 'none' }}> */}
            <div style={{ position: 'relative', marginTop: '14px' }}>
              <div
                className={classnames(style['toggle-wrapper'], {
                  [style['toggle-show']]: !showCompareForm,
                })}
                onClick={this.handleToggleCompareForm}
              >
                <Icon
                  type="play_arrow"
                  style={{
                    fontSize: '12px',
                    transform: showCompareForm ? 'rotate(0deg)' : 'rotate(180deg)',
                  }}
                />
              </div>
              <Row type="flex" gutter={24} style={{ flexWrap: 'nowrap', marginLeft: 0 }}>
                <Col
                  span={showCompareForm ? 18 : 24}
                  style={{ border: '1px solid #e8e8e8' }}
                  className={classnames(style['toggle-update-wrapper'], {
                    [style['toggle-show']]: !showCompareForm,
                  })}
                >
                  <Icon
                    type="settings-o"
                    style={{
                      position: 'absolute',
                      top: '0.2rem',
                      right: '12px',
                      color: '#29B8c8',
                      cursor: 'pointer',
                      zIndex: 99,
                    }}
                    onClick={this.handleShowAxisDimension}
                  />
                  <div
                    style={{ height: 500, margin: '0.2rem 0' }}
                    ref={(vnode) => {
                      this.chartRef = vnode;
                    }}
                  />
                </Col>
                <Col span={showCompareForm ? 6 : 0}>
                  <div className={style['compare-wrapper']}>
                    <span className={style.title}>
                      {intl.get('ssrc.priceLibraryNew.view.message.compareOption').d('对比项')}
                    </span>
                  </div>
                  {this.renderComapreForm()}
                  {this.renderLegendList()}
                </Col>
              </Row>
            </div>
          </Spin>
        </Content>
        <Sidebar
          closable
          destroyOnClose
          width={450}
          title={intl.get(`${promptCode}.view.title.highLevelSetting`).d('高级设置')}
          visible={drawerVisible}
          onOk={this.handleDrawerOk}
          onCancel={this.handleDrawerCancel}
          maskStyle={{ zIndex: 997 }}
          wrapClassName={style['c7n-modal-price-warp']}
        >
          {this.renderDrawerForm()}
        </Sidebar>
      </Fragment>
    );
  }
}

const HOCComponent = (Comp) =>
  compose(
    ssrcRemote({
      code: 'SSRC_PRICE_LIBRARY_NEW_CHART',
      name: 'remote',
    }),
    formatterCollections({ code: ['ssrc.priceLibraryNew'] })
  )(Comp);

export default HOCComponent(Chart);

export { Chart, HOCComponent };
