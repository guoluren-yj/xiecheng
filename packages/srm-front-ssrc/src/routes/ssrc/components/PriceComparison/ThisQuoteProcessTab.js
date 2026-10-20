import React, { PureComponent, createRef } from 'react';
import { Spin, Row, Col, Select, Table, Popover, Button, Icon } from 'hzero-ui';
import { Tabs } from 'choerodon-ui';
import { Tooltip as C7nTooltip } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import { isEmpty, sum, isNumber, noop } from 'lodash';
import { Chart, Geom, Axis, Tooltip, Legend } from 'bizcharts';
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import DynamicButtons from '_components/DynamicButtons';
import * as echarts from 'echarts';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';
import { Button as PermissionButton } from 'components/Permission';

import QuotationDetail from '@/routes/components/QuotationDetailNew/Detail';
import { numberSeparatorRender } from '@/utils/renderer';
import { INQUIRY } from '@/utils/globalVariable';
import style from './index.less';
import SidebarMenu from './SidebarMenu';

const { TabPane } = Tabs;

class ThisQuoteProcessTab extends PureComponent {
  app = {};

  option;

  myChart = {};

  constructor(props) {
    super(props);
    props.onRef(this);

    this.japanDutchChartRef = createRef({});

    this.state = {
      itemList: [], // 本次报价过程根据输入框过滤出物品的值
      itemValue: undefined, // 本次报价过程搜索物品框值
      // activeTab: 'unitPrice', // tab页
    };
  }

  /**
   * 文本框变化时回调
   * @param {string} searchValue 输入的物品
   */
  @Bind()
  handleItemSearch(searchValue) {
    if (searchValue === '') {
      return null;
    }
    const { sideBarMenuList } = this.props;
    let newData = [];
    const value = searchValue ? searchValue.trim() : '';
    if (!isEmpty(value)) {
      newData = sideBarMenuList.filter((item) => {
        if (item.concatName.indexOf(value) >= 0) {
          return true;
        }
        return false;
      });
    }
    this.setState({
      itemList: newData,
    });
  }

  /**
   * 下拉框选择回调函数
   * @param {*} value
   */
  @Bind()
  handleItemSelect(value) {
    const { onSelectItemOk, sideBarMenuList = [] } = this.props;
    // 必定选中 且只能选中一个
    const selectItem = sideBarMenuList.filter((item) => item.rfxLineItemId === value)[0];
    if (!isEmpty(selectItem)) {
      onSelectItemOk(selectItem);
      this.setState({
        itemValue: selectItem.rfxLineItemId,
      });
    }
  }

  /**
   * 失去焦点
   */
  @Bind()
  handleItemBlur() {
    const { itemValue = undefined } = this.state;
    // 搜索物品框没有值
    if (!itemValue) {
      this.setState({
        itemList: [],
      });
    }
  }

  @Bind()
  changeTabs(activeKey) {
    this.setState({
      // eslint-disable-next-line react/no-unused-state
      activeTab: activeKey,
    });
  }

  /**
   * 渲染最新报价提示框内容
   */
  renderLatestQuo(
    quotationDate,
    supplierCompanyName,
    quotationPrice,
    itemName,
    uomName,
    entryMethod,
    quotationName,
    localCurrencyName
  ) {
    const offLine = entryMethod === 'OFFLINE' ? `<div>${quotationName}</div>` : '';
    return {
      name: `<div>${intl
        .get('ssrc.priceComparison.model.comparison.supplierCompany')
        .d('供应商')}：${supplierCompanyName}</div>
    <div>${intl.get('ssrc.priceComparison.model.comparison.item').d('物品')}：${itemName}</div>
    <div>${intl.get('ssrc.priceComparison.model.comparison.unitPrice').d('单价')}：${[
        quotationPrice,
      ]}${localCurrencyName}/${uomName}</div>
    <div>${intl
      .get('ssrc.priceComparison.model.comparison.quotationTime')
      .d('报价时间')}：${quotationDate}</div>
    ${offLine}`,
    };
  }

  /**
   * EChart图标配置
   */
  @Bind()
  eChartConfig() {
    const {
      sourceCategory,
      totalChartDataSource = [],
      totalChartXList = [],
      remote,
      bidFlag,
    } = this.props;
    this.myChart = echarts.init(this.chartRef);

    this.app.config = {
      rotate: 90,
      align: 'left',
      verticalAlign: 'middle',
      position: 'insideBottom',
      distance: 15,
      onChange() {
        const labelOption = {
          normal: {
            rotate: this.app.config.rotate,
            align: this.app.config.align,
            verticalAlign: this.app.config.verticalAlign,
            position: this.app.config.position,
            distance: this.app.config.distance,
          },
        };
        this.myChart.setOption({
          series: [
            {
              label: labelOption,
            },
            {
              label: labelOption,
            },
            {
              label: labelOption,
            },
            {
              label: labelOption,
            },
          ],
        });
      },
    };

    const labelOption = {
      show: true,
      position: this.app.config.position,
      distance: this.app.config.distance,
      align: this.app.config.align,
      verticalAlign: this.app.config.verticalAlign,
      rotate: this.app.config.rotate,
      formatter: '{c}  {name|{a}}',
      fontSize: 16,
      rich: {
        name: {
          color: '#ffffff',
        },
      },
    };

    // 寻源类别=询价：只展示柱状图; 寻源类别=竞价：只展示折线图
    const showLineChartFlag = remote
      ? remote.process(
          'ssrc/priceComparison_PROCESS_ALL_PRICE_SHOW_LINE_CHART_FLAG',
          sourceCategory === 'RFA',
          { bidFlag }
        )
      : sourceCategory === 'RFA';
    // 寻源类别=询价：只展示柱状图; 寻源类别=竞价：只展示折线图
    const option = {
      grid: { containLabel: true },
      tooltip: {
        trigger: 'axis',
      },
      legend: {
        data: totalChartDataSource?.map((item) => item.name),
      },
      toolbox: {
        show: false, // 是否显示工具栏
      },
      xAxis: [
        {
          type: 'category',
          data: totalChartXList,
          axisLabel: {
            interval: 0,
            rotate: -45, // 倾斜角度
            formatter(value) {
              // 根据文字长度决定是否使用气泡展示完整信息
              if (value.length > 12) {
                return `${value.substring(0, 12)}...`; // 超过8个字符用...代替
              }
              return value;
            },
          },
        },
      ],
      yAxis: [
        {
          type: 'value',
        },
      ],
      series: totalChartDataSource.map((item) => ({
        name: item?.name,
        type: 'line',
        // label: {
        //   show: true,
        //   formatter: '{c}  {name|{a}}',
        //   fontSize: 16,
        //   rich: {
        //     name: {
        //       color: '#ffffff',
        //     },
        //   },
        // },
        emphasis: {
          focus: 'series',
        },
        data: item?.data.map((i) => `${i}`),
      })),
    };
    const remoteOption = remote
      ? remote.process('ssrc/priceComparison_PROCESS_ALL_PRICE_CHART_CONFIG', option, {
          totalChartDataSource,
          totalChartXList,
          bidFlag,
        })
      : option;
    if (showLineChartFlag) {
      this.option = remoteOption;
    } else {
      this.option = {
        grid: { containLabel: true },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow',
          },
        },
        legend: {
          data: totalChartDataSource?.map((item) => item.name),
        },
        toolbox: {
          show: false, // 是否显示工具栏
        },
        xAxis: [
          {
            type: 'category',
            axisTick: { show: false },
            data: totalChartXList,
            axisLabel: {
              interval: 0,
              rotate: -45, // 倾斜角度
              formatter(value) {
                // 根据文字长度决定是否使用气泡展示完整信息
                if (value.length > 12) {
                  return `${value.substring(0, 12)}...`; // 超过8个字符用...代替
                }
                return value;
              },
            },
          },
        ],
        yAxis: [
          {
            type: 'value',
          },
        ],
        series: totalChartDataSource.map((item) => ({
          name: item?.name,
          type: 'bar',
          barGap: 0,
          barWidth: 30, // 设置柱形图柱形宽度 不设置默认自适应
          label: labelOption,
          emphasis: {
            focus: 'series',
          },
          data: item?.data.map((i) => `${i}`),
        })),
      };
    }
  }

  componentDidUpdate() {
    this.initChart();
  }

  initChart = () => {
    // 报价过程 总价图标渲染
    if (this.chartRef) {
      this.eChartConfig();
      this.myChart.setOption(this.option);
      setTimeout(() => {
        window.onresize = () => {
          this.myChart.resize();
        };
      }, 200);
    }
  };

  @Bind()
  renderTotalDataSource() {
    const { totalTableList = [] } = this.props;
    if (isEmpty(totalTableList)) return [];
    return totalTableList.map((item) => {
      const { quotationPrice, validNetPrice, ...otherItems } = item;
      return {
        quotationPrice: numberSeparatorRender(quotationPrice),
        validNetPrice: numberSeparatorRender(validNetPrice),
        ...otherItems,
      };
    });
  }

  @Bind()
  renderLadderQuotation(record) {
    const { tableList = [], remote, bidFlag = false } = this.props;
    const { rfxLadderQuotations = [] } = record;
    if (isEmpty(rfxLadderQuotations)) return;

    const children = rfxLadderQuotations.map((item) => (
      <Row>
        <Col className={style['ladder-style']} span={14}>
          {numberSeparatorRender(item.secondaryLadderFrom || item.ladderFrom)} -{' '}
          {numberSeparatorRender(item.secondaryLadderTo || item.ladderTo)}
        </Col>
        <Col span={2}>|</Col>
        <Col
          className={style['ladder-style']}
          span={8}
          style={
            remote
              ? remote.process(
                  'srm-front-ssrc/priceComparison_PROCESS_LADDER_MIN_PRICE_COLOR',
                  {},
                  {
                    bidFlag,
                    item,
                  }
                )
              : {}
          }
        >
          {tableList?.[0]?.benchmarkPriceType === 'NET_PRICE'
            ? numberSeparatorRender(item.validNetLadderSecPrice || item.validNetLadderPrice)
            : numberSeparatorRender(item.validLadderSecPrice || item.validLadderPrice)}
        </Col>
      </Row>
    ));

    const tmpl = <div>{children}</div>;

    return tmpl;
  }

  // 本币阶梯价
  renderLocalLadderQuotation = (record) => {
    const { priceComparisonHeader, doubleUnitFlag } = this.props;
    const { rfxLadderQuotations = [] } = record || {};
    const { benchmarkPriceType } = priceComparisonHeader || {};

    if (isEmpty(rfxLadderQuotations)) {
      return '';
    }

    // 是否含税标识
    const taxIncludePriceFlag = benchmarkPriceType === 'TAX_INCLUDED_PRICE';

    const children = rfxLadderQuotations.map((item) => {
      const {
        secondaryLadderFrom,
        ladderFrom,
        secondaryLadderTo,
        ladderTo,
        localLadderPrice = null,
        localNetLadderPrice = null,
        localValidLadderSecPrice = null,
        localValidNetLadderSecPrice = null,
      } = item || {};

      let from = ladderFrom;
      let to = ladderTo;
      let price = localLadderPrice;
      let netPrice = localNetLadderPrice;

      if (doubleUnitFlag) {
        from = secondaryLadderFrom;
        to = secondaryLadderTo;
        price = localValidLadderSecPrice;
        netPrice = localValidNetLadderSecPrice;
      }

      const currentPrice = taxIncludePriceFlag ? price : netPrice;

      return (
        <Row>
          <Col className={style['ladder-style']} span={14}>
            {numberSeparatorRender(from)} - {numberSeparatorRender(to)}
          </Col>
          <Col span={2}>|</Col>
          <Col className={style['ladder-style']} span={8}>
            {numberSeparatorRender(currentPrice)}
          </Col>
        </Row>
      );
    });

    const tmpl = <div>{children}</div>;

    return tmpl;
  };

  // 单价图标
  renderUnitPriceChat = () => {
    const {
      sourceCategory,
      chartDataSource = [],
      doubleUnitFlag,
      allQuotationLine = [],
      remote,
      bidFlag,
      sourceKey = '',
    } = this.props;

    // console.log('单价所有 - chartDataSource', chartDataSource, 'chartData:', allQuotationLine);
    // console.log('单价 - xAxis', 'quotationDate');
    // console.log('单价 - series', 'totalChartDataSource');

    const range =
      chartDataSource.length > 1
        ? {
            type: 'time',
            range: [0.05, 0.95],
          }
        : {
            type: 'cat',
            range: [0.5, 1],
          };
    const _cols = {
      quotationDate: {
        ...range,
        tickCount: 10,
        mask: 'YYYY-MM-DD HH:mm:ss',
      },
    };

    const cols = remote
      ? remote.process('srm-front-ssrc/priceComparison_PROCESS_UNIT_PRICE_CHART_COLS', _cols, {
          that: this,
        })
      : _cols;

    const lineTooltip = [
      'quotationDate*supplierCompanyName*quotationPrice*itemName*uomName*entryMethod*quotationName*quotationSecondaryPrice*secondaryUomName*localCurrencyName',
      (
        quotationDate,
        supplierCompanyName,
        quotationPrice,
        itemName,
        uomName,
        entryMethod,
        quotationName,
        quotationSecondaryPrice,
        secondaryUomName,
        localCurrencyName
      ) =>
        this.renderLatestQuo(
          quotationDate,
          supplierCompanyName,
          doubleUnitFlag ? quotationSecondaryPrice : quotationPrice,
          itemName,
          doubleUnitFlag ? secondaryUomName : uomName,
          entryMethod,
          quotationName,
          localCurrencyName
        ),
    ];

    const intervalTooltip = [
      'quotationDate*supplierCompanyName*quotationPrice*itemName*uomName*entryMethod*quotationName*quotationSecondaryPrice*secondaryUomName*localCurrencyName',
      (
        quotationDate,
        supplierCompanyName,
        quotationPrice,
        itemName,
        uomName,
        entryMethod,
        quotationName,
        quotationSecondaryPrice,
        secondaryUomName,
        localCurrencyName
      ) =>
        this.renderLatestQuo(
          quotationDate,
          supplierCompanyName,
          doubleUnitFlag ? quotationSecondaryPrice : quotationPrice,
          itemName,
          doubleUnitFlag ? secondaryUomName : uomName,
          entryMethod,
          quotationName,
          localCurrencyName
        ),
    ];

    const pointTooltip = [
      'quotationDate*supplierCompanyName*quotationPrice*itemName*uomName*entryMethod*quotationName*quotationSecondaryPrice*secondaryUomName*localCurrencyName',
      (
        quotationDate,
        supplierCompanyName,
        quotationPrice,
        itemName,
        uomName,
        entryMethod,
        quotationName,
        quotationSecondaryPrice,
        secondaryUomName,
        localCurrencyName
      ) =>
        this.renderLatestQuo(
          quotationDate,
          supplierCompanyName,
          doubleUnitFlag ? quotationSecondaryPrice : quotationPrice,
          itemName,
          doubleUnitFlag ? secondaryUomName : uomName,
          entryMethod,
          quotationName,
          localCurrencyName
        ),
    ];

    const showLineChartFlag = remote
      ? remote.process(
          'ssrc/priceComparison_PROCESS_UNIT_PRICE_SHOW_LINE_CHART_FLAG',
          sourceCategory === 'RFA',
          { bidFlag }
        )
      : sourceCategory === 'RFA';

    const xAxisObj = remote
      ? remote.process(
          'ssrc/priceComparison_PROCESS_UNIT_PRICE_X_AXIS_CHART_LABEL',
          {},
          { bidFlag, that: this }
        )
      : {};
    const yAxisObj = remote
      ? remote.process(
          'ssrc/priceComparison_PROCESS_UNIT_PRICE_Y_AXIS_CHART_LABEL',
          {},
          { bidFlag, that: this }
        )
      : {};

    const chatProps = remote
      ? remote.process(
          'srm-front-ssrc/priceComparison_THISQUOTEPROCESSTAB_PROCESS_UNIT_CHAT_PROPS',
          {},
          {
            that: this,
            showLineChartFlag,
          }
        )
      : {};

    const chatTooltipProps = remote
      ? remote.process(
          'srm-front-ssrc/priceComparison_THISQUOTEPROCESSTAB_PROCESS_UNIT_CHAT_TOOLTIP_PROPS',
          {},
          {
            that: this,
            showLineChartFlag,
          }
        )
      : {};

    const chatGeomIntervalProps = remote
      ? remote.process(
          'srm-front-ssrc/priceComparison_THISQUOTEPROCESSTAB_PROCESS_UNIT_CHAT_GEOM_INTERVAL_PROPS',
          {},
          {
            that: this,
            showLineChartFlag,
          }
        )
      : {};

    const chatGeomPointVisible = remote
      ? remote.process(
          'srm-front-ssrc/priceComparison_THISQUOTEPROCESSTAB_PROCESS_UNIT_CHAT_GEOM_POINT_VISIBLE',
          true,
          {
            that: this,
            showLineChartFlag,
          }
        )
      : true;

    return (
      <>
        {chartDataSource.length > 0 ? (
          <Chart
            height={300}
            data={allQuotationLine}
            padding="auto"
            scale={cols}
            forceFit
            {...chatProps}
          >
            <Legend />
            <Axis name="quotationDate" {...xAxisObj} />
            <Axis
              name={doubleUnitFlag ? 'quotationSecondaryPrice' : 'quotationPrice'}
              {...yAxisObj}
            />

            <Tooltip showTitle={false} inPlot={false} {...chatTooltipProps} />
            {showLineChartFlag ? ( // 竞价只展示折线图
              <Geom
                type="line"
                position="quotationDate*quotationPrice"
                size={2}
                color="supplierCompanyName"
                tooltip={
                  remote
                    ? remote.process(
                        'srm-front-ssrc/priceComparison_PROCESS_LINE_TOOLTIP',
                        lineTooltip,
                        {
                          sourceKey,
                          doubleUnitFlag,
                        }
                      )
                    : lineTooltip
                }
              />
            ) : (
              <Geom
                type="interval"
                size={20}
                position="quotationDate*quotationPrice"
                color="supplierCompanyName"
                tooltip={
                  remote
                    ? remote.process(
                        'srm-front-ssrc/priceComparison_PROCESS_INTERVAL_TOOLTIP',
                        intervalTooltip,
                        {
                          sourceKey,
                          doubleUnitFlag,
                          that: this,
                        }
                      )
                    : intervalTooltip
                }
                {...chatGeomIntervalProps}
              />
            )}
            {chatGeomPointVisible ? (
              <Geom
                type="point"
                position="quotationDate*quotationPrice"
                size={
                  remote
                    ? remote.process('srm-front-ssrc/priceComparison_PROCESS_POINT_SIZE', 2, {
                        bidFlag,
                        that: this,
                      })
                    : 2
                }
                color="supplierCompanyName"
                shape="circle"
                style={{
                  stroke: '#fff',
                  lineWidth: 1,
                }}
                tooltip={
                  remote
                    ? remote.process(
                        'srm-front-ssrc/priceComparison_PROCESS_POINT_TOOLTIP',
                        pointTooltip,
                        {
                          sourceKey,
                          doubleUnitFlag,
                          that: this,
                        }
                      )
                    : pointTooltip
                }
              />
            ) : (
              ''
            )}
            {remote
              ? remote.process(
                  'srm-front-ssrc/priceComparison_PROCESS_UNIT_PRICE_CHART_OTHER_DOM',
                  null,
                  {
                    that: this,
                  }
                )
              : null}
          </Chart>
        ) : (
          <div className={style['chart-empty']}>
            {intl.get(`ssrc.priceComparison.model.comparison.temporarilyNoData`).d('暂无数据')}
          </div>
        )}
      </>
    );
  };

  // 按钮组
  getButtons = () => {
    const { tableList = [], rfxId = '', activeRfxLineItemId = '' } = this.props;
    return [
      {
        name: 'dropdownBtnList',
        group: true,
        child: (
          <PermissionButton
            type="primary"
            style={{ marginBottom: '8px' }}
            disabled={isEmpty(tableList)}
            permissionList={[
              {
                code: `ssrc.new-inquiry-hall.pricecomparison-thisquoteprocess.button.item-import-new`,
                type: 'button',
                meaning:
                  intl.get(`ssrc.inquiryHall.view.message.title.inquiryHall`).d('询价工作台') -
                  intl.get('ssrc.priceComparison.view.button.itemExport').d('导出物料'),
              },
            ]}
          >
            <Icon type="export" />
            {intl.get('hzero.common.button.export').d('导出')}
            <Icon type="down" />
          </PermissionButton>
        ),
        children: isEmpty(tableList)
          ? []
          : [
              {
                name: 'export',
                btnComp: ExcelExportPro,
                btnProps: {
                  templateCode: 'SRM_C_SRM_SSRC_RFX_BARGAIN_ASSISTANT_THIS_QUOTATION',
                  requestUrl: `/ssrc/v1/${getCurrentOrganizationId()}/rfx/bargain-assistant/table/export-new`,
                  queryParams: { rfxHeaderId: rfxId, rfxLineItemId: activeRfxLineItemId },
                  buttonText: intl
                    .get('ssrc.priceComparison.view.button.currentExport')
                    .d('导出当前物料'),
                  otherButtonProps: {
                    icon: '',
                    className: style.noBtn,
                  },
                },
              },
              {
                name: 'newExport',
                btnComp: ExcelExportPro,
                btnProps: {
                  templateCode: 'SRM_C_SRM_SSRC_RFX_BARGAIN_ASSISTANT_THIS_QUOTATION',
                  requestUrl: `/ssrc/v1/${getCurrentOrganizationId()}/rfx/bargain-assistant/table/export-new`,
                  queryParams: { rfxHeaderId: rfxId },
                  buttonText: intl
                    .get('ssrc.priceComparison.view.button.allExport')
                    .d('导出全部物料'),
                  otherButtonProps: {
                    icon: '',
                    className: style.noBtn,
                  },
                },
              },
            ],
      },
    ];
  };

  @Bind()
  handleEnter(e, name) {
    if (e.target.scrollHeight > e.target.clientHeight) {
      C7nTooltip.show(e.target, {
        title: `${name}${intl
          .get(`ssrc.priceComparison.model.comparison.quotRecord`)
          .d('的报价记录')}`,
        placement: 'top',
      });
    }
  }

  handleLeave = () => {
    C7nTooltip.hide();
  };

  @Bind()
  sortTabs = (tabs) => {
    const { priceComparisonHeader = {}, remote, bidFlag } = this.props;
    const { biddingTarget } = priceComparisonHeader || {};
    let newTabs = tabs;
    if (biddingTarget === 'TOTAL_PRICE') {
      newTabs = tabs.reverse();
    }
    const remoteTabs = remote
      ? remote.process('srm-front-ssrc/priceComparison_PROCESS_SORT_TABS', newTabs, {
          bidFlag,
          that: this,
          biddingTarget,
        })
      : newTabs;
    return remoteTabs;
  };

  setJapanDutchChartRef = (node) => {
    this.japanDutchChartRef = node;
  };

  render() {
    const {
      activeItemName = undefined,
      customizeTable,
      // chartDataSource = [],
      tableList = [],
      pagination = {},
      sideBarMenuList = [],
      activeRfxLineItemId = undefined,
      totalPagination = {},
      loading,
      tableLoading,
      totalTableLoading,
      totalChartDataSource = [],
      onClickItemBar,
      onChangeTable,
      onChangeTotalTable,
      totalTableList = [],
      sourceKey = INQUIRY,
      onExportThisQuoteProcess,
      exportLoading,
      doubleUnitFlag,
      priceComparisonHeader = {},
      remote,
      bidFlag,
      rfxId,
      japOrDutchBiddingTotalPrice = noop,
      rfxHeader = {},
    } = this.props;
    const { itemList = [], itemValue = undefined } = this.state;
    const { multiCurrencyFlag } = rfxHeader || {};

    // 是否含税标识
    const taxIncludePriceFlag = priceComparisonHeader?.benchmarkPriceType === 'TAX_INCLUDED_PRICE';

    const currentUnitTableColumns = [
      {
        title: intl.get(`ssrc.priceComparison.model.comparison.num`).d('序号'),
        dataIndex: 'num',
        width: 60,
      },
      {
        title: intl.get(`ssrc.priceComparison.model.comparison.round`).d('轮次'),
        dataIndex: 'roundNumber',
        width: 60,
      },
      {
        title: intl.get(`ssrc.common.model.common.status`).d('状态'),
        dataIndex: 'lineQuotationStatusMeaning',
        width: 100,
      },
      {
        title: intl.get(`ssrc.priceComparison.model.comparison.itemCode`).d('物料编码'),
        dataIndex: 'itemCode',
        width: 120,
      },
      {
        title: intl.get(`ssrc.priceComparison.model.comparison.itemMean`).d('物料名称'),
        dataIndex: 'itemName',
        width: 150,
        sorter: true,
      },
      {
        title: intl.get(`ssrc.priceComparison.model.comparison.supplierCode`).d('供应商编码'),
        dataIndex: 'supplierCompanyNum',
        width: 120,
      },
      {
        title: intl.get(`ssrc.priceComparison.model.comparison.supplierName`).d('供应商名称'),
        dataIndex: 'supplierCompanyName',
        width: 150,
        sorter: true,
      },
      {
        title: intl.get(`ssrc.priceComparison.model.comparison.quotationTime`).d('报价时间'),
        dataIndex: 'quotationDate',
        width: 200,
        sorter: true,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.currency`).d('币种'),
        dataIndex: 'supplierCurrencyCode',
        width: 130,
      },
      {
        title: tableList?.[0]?.benchmarkPriceTypeMeaning
          ? `${intl.get(`ssrc.priceComparison.model.comparison.price`).d('价格')}(${
              tableList?.[0]?.benchmarkPriceTypeMeaning
            })`
          : intl.get(`ssrc.priceComparison.model.comparison.price`).d('价格'),
        dataIndex: doubleUnitFlag ? 'quotationSecondaryPrice' : 'quotationPrice',
        width: 130,
        align: 'right',
        sorter: true,
        render: numberSeparatorRender,
      },
      {
        title: tableList?.[0]?.benchmarkPriceTypeMeaning
          ? `${intl.get(`ssrc.inquiryHall.model.inquiryHall.baseQuotationPrice`).d('本币单价')}(${
              tableList?.[0]?.benchmarkPriceTypeMeaning
            })`
          : intl.get(`ssrc.inquiryHall.model.inquiryHall.baseQuotationPrice`).d('本币单价'),
        dataIndex: doubleUnitFlag ? 'localLnQuotationSecPrice' : 'localLnQuotationPrice',
        width: 130,
        align: 'right',
        render: numberSeparatorRender,
      },
      {
        title: tableList?.[0]?.benchmarkPriceTypeMeaning
          ? `${intl.get(`ssrc.priceComparison.model.comparison.ladderQuotation`).d('阶梯报价')}(${
              tableList?.[0]?.benchmarkPriceTypeMeaning
            })`
          : intl.get(`ssrc.priceComparison.model.comparison.ladderQuotation`).d('阶梯报价'),
        dataIndex: 'ladderFrom',
        width: 250,
        render: (_, record) => this.renderLadderQuotation(record),
      },
      multiCurrencyFlag === 1
        ? taxIncludePriceFlag
          ? {
              title: intl
                .get('ssrc.inquiryHall.model.comparison.localLadderPriceIncludeTax')
                .d('本币阶梯报价（含税）'),
              dataIndex: 'localLadderPrice',
              width: 250,
              render: (_, record) => this.renderLocalLadderQuotation(record),
            }
          : {
              title: intl
                .get('ssrc.inquiryHall.model.comparison.localLadderPriceExcludeTax')
                .d('本币阶梯报价（不含税）'),
              dataIndex: 'localNetLadderPrice',
              width: 250,
              render: (_, record) => this.renderLocalLadderQuotation(record),
            }
        : null,
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationDetail`).d('报价明细'),
        dataIndex: 'quotationDetailFlag',
        width: 100,
        render: (_, record) => {
          const quotationDetailProps = {
            sourceFrom: 'RFX',
            rowData: record,
            allowBuyerViewFlag: 1,
            bidFlag,
            quotationHistoryFlag: 1,
            exportParas: {
              queryQuotationDetailRecordFlag: 1,
            },
          };

          return <QuotationDetail {...quotationDetailProps} />;
        },
      },
      {
        title: intl.get(`ssrc.priceComparison.model.comparison.quotationNode`).d('报价节点'),
        dataIndex: 'quotationNode',
        width: 100,
        align: 'right',
        render: (_, record) => record.quotationNodeMeaning,
      },
    ].filter(Boolean);
    const totalColumns = [
      {
        title: intl.get(`ssrc.priceComparison.model.comparison.num`).d('序号'),
        dataIndex: 'num',
        width: 60,
      },
      {
        title: intl.get(`ssrc.priceComparison.model.comparison.round`).d('轮次'),
        dataIndex: 'roundNumber',
        width: 60,
      },
      {
        title: intl.get(`ssrc.common.model.common.status`).d('状态'),
        dataIndex: 'lineQuotationStatusMeaning',
        width: 100,
      },
      {
        title: intl.get(`ssrc.priceComparison.model.comparison.supplierCode`).d('供应商编码'),
        dataIndex: 'supplierCompanyNum',
        width: 120,
      },
      {
        title: intl.get(`ssrc.priceComparison.model.comparison.supplierName`).d('供应商名称'),
        dataIndex: 'supplierCompanyName',
        width: 150,
        render: (val) => <Popover content={val}>{val}</Popover>,
      },
      {
        title: intl.get(`ssrc.priceComparison.model.comparison.quotationTime`).d('报价时间'),
        dataIndex: 'quotationDate',
        width: 150,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.currency`).d('币种'),
        dataIndex: 'supplierCurrencyCode',
        width: 130,
      },
      taxIncludePriceFlag
        ? {
            title: intl
              .get(`ssrc.priceComparison.model.comparison.totalTaxAmount`)
              .d('报价总价（含税）'),
            dataIndex: 'totalQuotationTaxAmount',
            width: 130,
            align: 'right',
            render: (val) => numberSeparatorRender(val),
          }
        : {
            title: intl
              .get(`ssrc.priceComparison.model.comparison.totalNetAmount`)
              .d('报价总价(不含税)'),
            dataIndex: 'totalQuotationNetAmount',
            width: 130,
            align: 'right',
            render: (val) => numberSeparatorRender(val),
          },
      taxIncludePriceFlag
        ? {
            title: intl
              .get(`ssrc.priceComparison.model.comparison.totalLocalTaxAmount`)
              .d('本币报价总价（含税）'),
            dataIndex: 'localLnTotalAmount',
            width: 130,
            align: 'right',
            render: (val) => numberSeparatorRender(val),
          }
        : {
            title: intl
              .get(`ssrc.priceComparison.model.comparison.totalLocalNetAmount`)
              .d('本币报价总价(不含税)'),
            dataIndex: 'localLnNetAmount',
            width: 130,
            align: 'right',
            render: (val) => numberSeparatorRender(val),
          },
      {
        title: intl.get(`ssrc.priceComparison.model.comparison.quotationNode`).d('报价节点'),
        dataIndex: 'quotationNodeMeaning',
        width: 100,
      },
    ];

    const columns = remote
      ? remote.process(
          'srm-front-ssrc/priceComparison_PROCESS_UNIT_TABLE_COLUMN',
          currentUnitTableColumns,
          {
            sourceKey,
            doubleUnitFlag,
            tableList,
            bidFlag,
            that: this,
          }
        )
      : currentUnitTableColumns;
    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0)));

    // 本次报价过程-总价表格dom
    const totalPriceQuotationDom = (
      <>
        <div style={{ textAlign: 'right' }}>
          <Button
            loading={exportLoading}
            onClick={() => onExportThisQuoteProcess('totalPrice')}
            style={{ marginBottom: '8px' }}
            type="primary"
            disabled={isEmpty(totalTableList)}
          >
            {intl.get('hzero.common.button.export').d('导出')}
          </Button>
        </div>
        {customizeTable(
          {
            code: `SSRC.${sourceKey}_HALL.PRICE_COMPARISON.THIS_QUOTATION_TOTAL`,
          },
          <Table
            bordered
            rowKey="num"
            loading={totalTableLoading}
            columns={totalColumns}
            scroll={{ x: sum(totalColumns.map((n) => (isNumber(n.width) ? n.width : 0))) }}
            dataSource={this.renderTotalDataSource()}
            pagination={totalPagination}
            onChange={onChangeTotalTable}
          />
        )}
      </>
    );

    const remoteTotalPriceQuotationDom = remote
      ? remote.process(
          'srm-front-ssrc/priceComparison_PROCESS_TOTAL_PRICE_QUOTATION_DOM',
          totalPriceQuotationDom,
          { rfxHeaderId: rfxId }
        )
      : totalPriceQuotationDom;

    const totalPriceChartDom = (
      <>
        {totalChartDataSource.length !== 0 ? (
          <div
            id="eChartsDom"
            style={{ height: 500, width: '1000px' }}
            ref={(node) => {
              this.chartRef = node;
            }}
          />
        ) : (
          <div className={style['chart-empty']}>
            {intl.get(`ssrc.priceComparison.model.comparison.temporarilyNoData`).d('暂无数据')}
          </div>
        )}
      </>
    );

    const remoteTotalPriceChart = remote
      ? remote.process(
          'srm-front-ssrc/priceComparison_PROCESS_TOTAL_PRICE_CHART_DOM',
          totalPriceChartDom,
          {
            that: this,
          }
        )
      : totalPriceChartDom;

    // 日/荷兰 目前只有总价

    const tab1 = !japOrDutchBiddingTotalPrice() ? (
      <TabPane
        tab={
          tableList?.[0]?.benchmarkPriceTypeMeaning
            ? `${intl.get('ssrc.priceComparison.view.tab.unitPrice').d('单价')}(${
                tableList?.[0]?.benchmarkPriceTypeMeaning
              })`
            : intl.get('ssrc.priceComparison.view.tab.unitPrice').d('单价')
        }
        key="unitPrice"
      >
        <Row>
          <Col span={18} className={style['affix-menu-divider']}>
            <Row>
              <Col span={19}>
                <div
                  className={style['history-analysis-title']}
                  onMouseEnter={(e) => this.handleEnter(e, activeItemName)}
                  onMouseLeave={this.handleLeave}
                >
                  {activeItemName}
                  {intl.get(`ssrc.priceComparison.model.comparison.quotRecord`).d('的报价记录')}
                </div>
              </Col>
              <Col span={4}>
                <div className={style['search-item']}>
                  <span className={style['search-icon']} />
                  <Select
                    showSearch
                    showArrow={false}
                    filterOption={false}
                    value={itemValue}
                    placeholder={intl
                      .get('ssrc.priceComparison.model.comparison.searchItem')
                      .d('搜索物品')}
                    onBlur={this.handleItemBlur}
                    onSearch={this.handleItemSearch}
                    onSelect={this.handleItemSelect}
                  >
                    {itemList &&
                      itemList.map((item) => (
                        <Select.Option key={item.rfxLineItemId} value={item.rfxLineItemId}>
                          {item.concatName}
                        </Select.Option>
                      ))}
                  </Select>
                </div>
              </Col>
            </Row>
            <Row style={{ marginTop: '16px' }}>
              <Col span={24} className="priceChartsDom">
                {this.renderUnitPriceChat()}
              </Col>
            </Row>
          </Col>
          <Col span={4}>
            <SidebarMenu
              activeId={activeRfxLineItemId}
              onClickItemBar={onClickItemBar}
              dataSource={sideBarMenuList}
            />
          </Col>
        </Row>
        <div className={style['history-analysis-table']}>
          <div style={{ textAlign: 'right' }}>
            {/* <Button
          loading={exportLoading}
          onClick={() => onExportThisQuoteProcess('unitPrice')}
          style={{ marginBottom: '8px' }}
          type="primary"
          disabled={isEmpty(tableList)}
        >
          {intl.get('hzero.common.button.export').d('导出')}
        </Button> */}
            <DynamicButtons buttons={this.getButtons()} />
          </div>
          {customizeTable(
            {
              code: `SSRC.${sourceKey}_HALL.PRICE_COMPARISON.THIS_QUOTATION`,
            },
            <Table
              bordered
              rowKey="rowKey"
              loading={tableLoading}
              columns={columns}
              scroll={{ x: scrollX }}
              dataSource={tableList}
              pagination={pagination}
              onChange={(page, _, sorter) => onChangeTable(activeRfxLineItemId, page, _, sorter)}
            />
          )}
        </div>
      </TabPane>
    ) : (
      ''
    );
    const tab2 = (
      <TabPane
        tab={
          tableList?.[0]?.benchmarkPriceTypeMeaning
            ? `${intl.get('ssrc.priceComparison.view.tab.totalPrice').d('总价')}(${
                tableList?.[0]?.benchmarkPriceTypeMeaning
              })`
            : intl.get('ssrc.priceComparison.view.tab.totalPrice').d('总价')
        }
        key="totalPrice"
        forceRender
      >
        {remoteTotalPriceChart}
        {remoteTotalPriceQuotationDom}
      </TabPane>
    );
    const tabs = this.sortTabs([tab1, tab2]);

    const tabsProps = remote
      ? remote.process(
          'srm-front-ssrc/priceComparison_THISQUOTEPROCESSTAB_PROCESS_TABS_PROPS',
          {},
          {
            that: this,
          }
        )
      : {};

    return (
      <Spin spinning={loading}>
        <Tabs
          animated={false}
          // activeKey={activeTab}
          onChange={this.changeTabs}
          customizable
          customizedCode="PRICE_COMPARISON_THISQUOTE_PROCESS_TAB"
          {...tabsProps}
        >
          {tabs}
        </Tabs>
      </Spin>
    );
  }
}

export { ThisQuoteProcessTab };
export default ThisQuoteProcessTab;
