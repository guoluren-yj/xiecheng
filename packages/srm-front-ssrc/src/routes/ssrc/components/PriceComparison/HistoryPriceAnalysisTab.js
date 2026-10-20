import React, { PureComponent } from 'react';
import { Row, Col, Table, Select, Switch, Popover } from 'hzero-ui';
import { Chart, Geom, Axis, Tooltip, Guide } from 'bizcharts';
import { Bind } from 'lodash-decorators';
import { isEmpty, minBy, sum, isNumber } from 'lodash';
import { Collapse, Icon } from 'choerodon-ui';
import {
  Spin as C7nSpin,
  Menu,
  Dropdown,
  Button as C7nButton,
  Icon as C7nIconPro,
} from 'choerodon-ui/pro';
import { getResponse } from 'utils/utils';
import intl from 'utils/intl';

import { numberSeparatorRender } from '@/utils/renderer';
import {
  fetchItemSubRelation,
  fetchItemSubRelationTable,
  exportItemSubRelation,
} from '@/services/priceComparisonService';
import style from './index.less';
import SidebarMenu from './SidebarMenu';

import SubRelationComparePrice from './SubRelationComparePrice';
import { panelHeaderRender } from './utils/renderer';

const { Line, DataMarker } = Guide;

const { Panel } = Collapse;

export default class HistoryPriceAnalysisTab extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      itemList: [], // 历史价格分析根据输入框过滤出物品的值
      itemValue: undefined, // 历史价格分析搜索物品框值
      itemSubRelationList: [], // 替代组比价方案列表
      itemSubRelationLoading: false, // 替代组loading
    };
  }

  componentDidMount() {
    this.fetchItemSubRelationList();
  }

  getSnapshotBeforeUpdate(prevProps) {
    const { activeItemId: preActiveItemId } = prevProps;
    const { activeItemId } = this.props;
    return preActiveItemId !== activeItemId;
  }

  componentDidUpdate(...params) {
    if (params[2]) {
      this.fetchItemSubRelationList();
    }
  }

  /**
   * 文本框变化时回调
   * @param {string} searchValue 输入的物品
   */
  @Bind()
  handleItemSearch(searchValue) {
    const { sideBarMenuList } = this.props;
    if (searchValue === '') {
      return null;
    }
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

  /**
   * 渲染历史分析提示框内容
   */
  renderHistoryAnalysisTooltip(
    creationDate,
    supplierCompanyName,
    unitPrice,
    itemName,
    ouName,
    uomName,
    companyName
  ) {
    return {
      name: `<div>${intl
        .get('ssrc.priceComparison.model.comparison.supplierCompany')
        .d('供应商')}：${supplierCompanyName ?? '-'}</div>
    <div>${intl.get('ssrc.priceComparison.model.comparison.item').d('物品')}：${
        itemName ?? '-'
      }</div>
    <div>${intl.get('ssrc.priceComparison.model.comparison.unitPrice').d('单价')}：${
        unitPrice ?? '-'
      }${intl.get('ssrc.priceComparison.model.comparison.yuan').d('元')}/${uomName ?? '-'}</div>
    <div>${intl.get('ssrc.priceComparison.model.comparison.company').d('公司')}：${
        companyName ?? '-'
      }</div>
    <div>${intl.get('ssrc.priceComparison.model.comparison.ouName').d('业务实体')}：${
        ouName ?? '-'
      }</div>
    <div>${intl
      .get('ssrc.priceComparison.model.HistoryPriceAnalysisTab.quotationTime')
      .d('报价时间')}：${creationDate ?? '-'}</div>
    `,
    };
  }

  // 查询替代组比价方案 subRelationDisplayFlag-false 不展示替代料
  fetchItemSubRelationList() {
    const { activeItemId, subRelationDisplayFlag } = this.props;
    if (!activeItemId || !subRelationDisplayFlag) return;

    this.setState({
      itemSubRelationLoading: true,
    });
    fetchItemSubRelation({ itemId: activeItemId })
      .then((res) => {
        const result = getResponse(res);
        if (result) {
          this.fetchSubRelationChildrenList(result);
        }
      })
      .catch(() => {
        this.setState({ itemSubRelationLoading: false });
      });
  }

  // 处理替代组每个表格数据
  fetchSubRelationChildrenList(list) {
    const { rfxHeaderId, activeRfxLineItemId } = this.props;
    if (!rfxHeaderId || !activeRfxLineItemId) {
      this.setState({
        itemSubRelationLoading: false,
      });
      return;
    }
    const promiseArray = [];
    list.forEach((item) => {
      const p = new Promise((resolve, reject) => {
        fetchItemSubRelationTable({
          rfxHeaderId,
          subRelationId: item.subRelationId,
          rfxLineItemId: activeRfxLineItemId,
        })
          .then((res) => {
            if (getResponse(res)) {
              resolve({ [item.subRelationId]: res });
            }
            reject(res);
          })
          .catch((err) => {
            reject(err);
          });
      });
      promiseArray.push(p);
    });
    Promise.all(promiseArray)
      .then((childrenRes) => {
        let childrenObj = {};
        childrenRes.forEach((children) => {
          childrenObj = { ...childrenObj, ...children };
        });
        const newItemSubRelationList = list.map((item) => {
          return { ...item, childrenList: childrenObj[item.subRelationId] };
        });
        this.setState({
          itemSubRelationList: newItemSubRelationList,
          itemSubRelationLoading: false,
        });
      })
      .catch(() => {
        this.setState({
          itemSubRelationList: list,
          itemSubRelationLoading: false,
        });
      });
  }

  // 导出替代方案物料
  @Bind()
  exportItemSubRelationEvt(e) {
    const { rfxHeaderId, activeRfxLineItemId } = this.props;
    if (!rfxHeaderId) return;
    const downloadName = `${intl
      .get('ssrc.inquiryHall.view.message.subRelationItem.comparePrice')
      .d('替代料比价')}.xls`;
    exportItemSubRelation({
      rfxHeaderId,
      rfxLineItemId: e.key === 'current' ? activeRfxLineItemId : '',
    }).then((url) => {
      if (url) {
        // 创建a标签，用于跳转至下载链接
        const tempLink = document.createElement('a');
        tempLink.style.display = 'none';
        tempLink.href = url;
        tempLink.setAttribute('download', decodeURIComponent(downloadName));
        // 兼容：某些浏览器不支持HTML5的download属性
        if (typeof tempLink.download === 'undefined') {
          tempLink.setAttribute('target', '_blank');
        }
        // 挂载a标签
        document.body.appendChild(tempLink);
        tempLink.click();
        document.body.removeChild(tempLink);
      }
    });
  }

  render() {
    const {
      rfxHeaderId,
      activeItemName = undefined,
      dateFlag = 'allTime',
      chartDataSource = [],
      tableList = [],
      pagination = {},
      sideBarMenuList = [],
      activeItemId = undefined,
      activeRfxLineItemId = undefined,
      loading,
      tableLoading,
      onClickItemBar,
      onClickTimeBtn,
      onChangePagination,
      onChangeTaxFlag,
      taxPriceFlag,
      doubleUnitFlag,
      remote,
      history,
      sourceKey,
      state,
    } = this.props;
    const {
      itemList = [],
      itemValue = undefined,
      itemSubRelationList = [],
      itemSubRelationLoading,
    } = this.state;
    const hcols = {
      creationDate: {
        type: 'time',
        range: [0.1, 0.9],
        tickCount: 10,
        mask: 'YYYY-MM-DD HH:mm:ss',
      },
    };
    // 替代组比价入参
    const subRelationComparePriceProps = {
      rfxHeaderId,
      itemSubRelationList,
    };
    const columns = [
      {
        title: intl.get(`ssrc.priceComparison.model.comparison.num`).d('序号'),
        dataIndex: 'lineNum',
        width: 80,
      },
      {
        title: intl.get(`ssrc.priceComparison.model.comparison.itemCode`).d('物料编码'),
        dataIndex: 'itemCode',
        width: 120,
      },
      {
        title: intl.get(`ssrc.priceComparison.model.comparison.itemMean`).d('物料名称'),
        dataIndex: 'itemName',
        width: 120,
        render: (val) => <Popover content={val}>{val}</Popover>,
      },
      {
        title: intl.get(`ssrc.priceComparison.model.comparison.supplierCode`).d('供应商编码'),
        dataIndex: 'supplierCompanyNum',
        width: 120,
      },
      {
        title: intl.get(`ssrc.priceComparison.model.comparison.supplierDesc`).d('供应商描述'),
        dataIndex: 'supplierCompanyName',
        width: 120,
        render: (val) => <Popover content={val}>{val}</Popover>,
      },
      {
        title: intl.get(`ssrc.priceComparison.model.comparison.hisMinPrice`).d('历史最低单价'),
        dataIndex: 'unitPrice',
        width: 120,
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`ssrc.priceComparison.model.comparison.uomName`).d('单位'),
        dataIndex: 'uomName',
        width: 120,
        align: 'right',
      },
      {
        title: intl.get(`ssrc.priceComparison.model.comparison.creationTime`).d('创建时间'),
        dataIndex: 'creationDate',
        width: 120,
      },
    ];
    const LineTooltip = [
      'creationDate*supplierCompanyName*unitPrice*itemName*ouName*uomName*companyName*secondaryUnitPrice',
      (
        creationDate,
        supplierCompanyName,
        unitPrice,
        itemName,
        ouName,
        uomName,
        companyName,
        secondaryUnitPrice
      ) =>
        this.renderHistoryAnalysisTooltip(
          creationDate,
          supplierCompanyName,
          doubleUnitFlag ? secondaryUnitPrice : unitPrice,
          itemName,
          ouName,
          uomName,
          companyName
        ),
    ];
    const PointTooltip = [
      'creationDate*supplierCompanyName*unitPrice*itemName*ouName*uomName*companyName*secondaryUnitPrice',
      (
        creationDate,
        supplierCompanyName,
        unitPrice,
        itemName,
        ouName,
        uomName,
        companyName,
        secondaryUnitPrice
      ) =>
        this.renderHistoryAnalysisTooltip(
          creationDate,
          supplierCompanyName,
          doubleUnitFlag ? secondaryUnitPrice : unitPrice,
          itemName,
          ouName,
          uomName,
          companyName
        ),
    ];
    // 替代方案物料导出
    const downLoadMenu = (
      <Menu onClick={this.exportItemSubRelationEvt} style={{ padding: '6px 0', minWidth: '100px' }}>
        <Menu.Item key="current">
          <a>{intl.get('ssrc.priceComparison.view.button.exportCurrentItem').d('当前物料')}</a>
        </Menu.Item>
        <Menu.Item key="all">
          <a>{intl.get('ssrc.priceComparison.view.button.exportAllItem').d('全部物料')}</a>
        </Menu.Item>
      </Menu>
    );
    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0)));
    const taxFlagClassName = taxPriceFlag === 1 ? 'ant-switch-checked' : 'ant-switch-unChecked';

    const renderChart = (
      <Chart
        height={300}
        data={chartDataSource}
        scale={hcols}
        forceFit
        padding="auto"
        style={{
          marginBottom: '100px',
        }}
      >
        <Axis name="creationDate" />
        <Axis name={doubleUnitFlag ? 'secondaryUnitPrice' : 'unitPrice'} />

        <Tooltip showTitle={false} enterable />
        <Geom
          type="line"
          position="creationDate*unitPrice"
          size={2}
          tooltip={
            remote
              ? remote.process(
                  'srm-front-ssrc/priceComparison/HistoryPriceAnalysisTab/PROCESS_LineTooltip',
                  LineTooltip,
                  {
                    doubleUnitFlag,
                    history,
                    sourceKey,
                  }
                )
              : LineTooltip
          }
        />
        <Geom
          type="point"
          position="creationDate*unitPrice"
          tooltip={
            remote
              ? remote.process(
                  'srm-front-ssrc/priceComparison/HistoryPriceAnalysisTab/PROCESS_PointTooltip',
                  PointTooltip,
                  {
                    doubleUnitFlag,
                    history,
                    sourceKey,
                  }
                )
              : PointTooltip
          }
          size={3}
          shape="circle"
          style={{
            stroke: '#fff',
            lineWidth: 1,
          }}
        />
        <Guide>
          <Line
            top
            start={(xScale, yScale) => {
              return ['start', Math.min(...yScale.unitPrice.values)];
            }}
            end={(xScale, yScale) => {
              return ['end', Math.min(...yScale.unitPrice.values)];
            }}
            lineStyle={{
              stroke: '#F3A1A0',
            }}
          />
          <DataMarker
            position={(xScale, yScale) => {
              return [
                minBy(chartDataSource, (item) => item?.unitPrice)?.creationDate,
                Math.min(...yScale.unitPrice.values),
              ];
            }}
            content={`${intl
              .get('ssrc.priceComparison.model.comparison.lowestPrice')
              .d('最低价')}：${
              minBy(chartDataSource, (item) => item?.unitPrice)?.unitPrice || '-'
            }${intl.get('ssrc.priceComparison.model.comparison.yuan').d('元')}`}
            style={{
              text: {
                textAlign: 'right',
              },
            }}
          />
        </Guide>
      </Chart>
    );
    return (
      <C7nSpin spinning={loading || itemSubRelationLoading}>
        <div
          className={style['ssrc-history-price-analysis-tab-wrapper']}
          style={{ display: 'flex', height: '100%', marginTop: '-17px' }}
        >
          <div className={style['left-sidebar-menu-wrapper']}>
            <SidebarMenu
              activeId={activeRfxLineItemId}
              onClickItemBar={onClickItemBar}
              dataSource={sideBarMenuList}
              isShowItemNum
              remote={remote}
              bidFlag={sourceKey === 'BID'}
              currentProps={this.props}
            />
          </div>
          <Collapse
            expandIconPosition="right"
            defaultActiveKey={['subRelationKey', 'historyAnalysisKey']}
            ghost
            expandIcon={(panelProps) => {
              if (panelProps.isActive) {
                return <Icon type="keyboard_arrow_down" />;
              }
              return <Icon type="keyboard_arrow_up" />;
            }}
            className={style['ssrc-history-price-analysis-collapse']}
          >
            {activeItemId && activeRfxLineItemId && !isEmpty(itemSubRelationList) && (
              <Panel
                header={panelHeaderRender(
                  intl
                    .get('ssrc.priceComparison.model.comparison.subRelationGroup.comparePrice')
                    .d('替代组比价')
                )}
                key="subRelationKey"
              >
                <div style={{ marginBottom: '10px' }}>
                  <Dropdown overlay={downLoadMenu}>
                    <C7nButton funcType="link" icon="unarchive">
                      {intl.get('hzero.common.export').d('导出')}
                      <C7nIconPro type="keyboard_arrow_down" />
                    </C7nButton>
                  </Dropdown>
                </div>
                <SubRelationComparePrice {...subRelationComparePriceProps} />
              </Panel>
            )}
            <Panel
              header={panelHeaderRender(
                intl
                  .get('ssrc.priceComparison.view.message.button.historyPriceAnalysis')
                  .d('历史价格分析')
              )}
              key="historyAnalysisKey"
            >
              {/* <C7nSpin spinning={loading}> */}
              <div span={18} className={style['affix-menu-divider']}>
                <Row>
                  <Col span={13}>
                    <span className={style['history-analysis-title']}>
                      {activeItemName}
                      {intl
                        .get(`ssrc.priceComparison.model.comparison.historicalPrice`)
                        .d('的历史价格')}
                    </span>
                  </Col>
                  <Col span={6}>
                    <div className={style['historyAnalysis-time']}>
                      <span
                        onClick={() => onClickTimeBtn('allTime')}
                        className={`${style['time-subitem']} ${
                          dateFlag === 'allTime' && style['time-allTime']
                        }`}
                      >
                        {intl.get(`ssrc.priceComparison.view.message.button.allTime`).d('全部时间')}
                      </span>
                      <span
                        onClick={() => onClickTimeBtn('almostYear')}
                        className={`${style['time-subitem']} ${
                          dateFlag === 'almostYear' && style['time-almostYear']
                        }`}
                      >
                        {intl
                          .get(`ssrc.priceComparison.view.message.button.almostYear`)
                          .d('近一年')}
                      </span>
                      <span
                        onClick={() => onClickTimeBtn('nearThMonth')}
                        className={`${style['time-subitem']} ${
                          dateFlag === 'nearThMonth' && style['time-nearThMonth']
                        }`}
                      >
                        {intl
                          .get(`ssrc.priceComparison.view.message.button.nearThMonth`)
                          .d('近三个月')}
                      </span>
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
                <Row>
                  <Col style={{ marginTop: '10px', marginRight: '45px', float: 'right' }}>
                    {remote ? (
                      remote.render(
                        'srm-front-ssrc/priceComparison_RENDER_HIS_SWITCH',
                        <Switch
                          checkedChildren={intl
                            .get('ssrc.priceComparison.model.comparison.taxFlag')
                            .d('含税价')}
                          unCheckedChildren={intl
                            .get('ssrc.priceComparison.model.comparison.unTaxFlag')
                            .d('未税价')}
                          className={style[taxFlagClassName]}
                          checked={taxPriceFlag}
                          checkedValue={1}
                          unCheckedValue={0}
                          onChange={onChangeTaxFlag}
                        />,
                        {
                          sourceKey,
                        }
                      )
                    ) : (
                      <Switch
                        checkedChildren={intl
                          .get('ssrc.priceComparison.model.comparison.taxFlag')
                          .d('含税价')}
                        unCheckedChildren={intl
                          .get('ssrc.priceComparison.model.comparison.unTaxFlag')
                          .d('未税价')}
                        className={style[taxFlagClassName]}
                        checked={taxPriceFlag}
                        checkedValue={1}
                        unCheckedValue={0}
                        onChange={onChangeTaxFlag}
                      />
                    )}
                  </Col>
                </Row>
                <Row style={{ marginTop: '16px' }}>
                  <Col span={24}>
                    {chartDataSource.length > 0 ? (
                      remote ? (
                        remote.render(
                          'srm-front-ssrc/priceComparison_RENDER_HIS_CHART',
                          renderChart,
                          {
                            chartDataSource,
                            state,
                            bidFlag: sourceKey === 'BID',
                          }
                        )
                      ) : (
                        renderChart
                      )
                    ) : (
                      <div className={style['chart-empty']}>
                        {intl
                          .get(`ssrc.priceComparison.model.comparison.temporarilyNoData`)
                          .d('暂无数据')}
                      </div>
                    )}
                  </Col>
                </Row>
              </div>
              {/* </C7nSpin> */}
            </Panel>
            {tableList && tableList.length > 0 && (
              <Panel
                header={panelHeaderRender(
                  intl
                    .get(`ssrc.priceComparison.model.comparison.similarItemMinPrice`)
                    .d('相似物品最低价一览')
                )}
                key="similarItemMinPriceKey"
              >
                <div className={style['history-analysis-table']}>
                  <Table
                    bordered
                    rowKey="itemId"
                    loading={tableLoading}
                    columns={columns}
                    scroll={{ x: scrollX }}
                    dataSource={tableList}
                    pagination={pagination}
                    onChange={(page) => onChangePagination(page)}
                  />
                </div>
              </Panel>
            )}
          </Collapse>
        </div>
      </C7nSpin>
    );
  }
}
