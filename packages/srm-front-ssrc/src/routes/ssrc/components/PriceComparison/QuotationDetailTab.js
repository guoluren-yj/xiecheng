import React, { PureComponent } from 'react';
import { Tabs, Table, Spin, Dropdown, Icon, Menu, Tooltip } from 'hzero-ui';
import { isEmpty, difference, without } from 'lodash';
import { Bind } from 'lodash-decorators';

import Checkbox from 'components/Checkbox';
import uuid from 'uuid/v4';
import intl from 'utils/intl';

import { ReactComponent as NoQuotationDetail } from '@/assets/no-quotation-detail.svg';
import style from './index.less';

const { TabPane } = Tabs;

export default class QuotationDetailTab extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      columnVisible: false, // 列筛选框
      columnSelected: [], // 列选中项
      supplierVisible: false, // 供应商选中框
      supplierSelected: [], // 供应商选中项
    };
  }

  /**
   * 全选列、供应商
   */
  @Bind()
  changeKeyAll(dataSource, type) {
    const { columnSelected = [], supplierSelected = [] } = this.state;
    const key = type === 'column' ? 'quotationColumnId' : 'quotationHeaderId';
    const selectedData = type === 'item' ? columnSelected : supplierSelected;
    const keys = dataSource.map((item) => item[key]);
    // 反选
    if (isEmpty(difference(keys, selectedData))) {
      this.setState({
        [`${type}Selected`]: [],
      });
    } else {
      // 全选
      this.setState({
        [`${type}Selected`]: keys,
      });
    }
  }

  /**
   * 改变列/供应商勾选
   */
  @Bind()
  changeSelected(checked, code, type) {
    // 勾选
    if (checked) {
      const currentSelected = this.state[`${type}Selected`] || [];

      this.setState({
        [`${type}Selected`]: [...currentSelected, code],
      });
    } else {
      // 取消勾选
      const otherCode = without(this.state[`${type}Selected`], code);
      this.setState({
        [`${type}Selected`]: otherCode || [],
      });
    }
  }

  /**
   * 筛选框 - 打开
   */
  @Bind()
  showModal(type) {
    this.setState({
      [`${type}Visible`]: true,
    });
  }

  /**
   * 筛选框 - 关闭
   */
  @Bind()
  hideModal(type) {
    this.setState({
      [`${type}Visible`]: false,
    });
  }

  /**
   * 渲染报价明细数据
   * @ overide 追觅
   */
  renderDataSource(data) {
    const { remote } = this.props;
    const { level, supQuotationDetails = [] } = data;
    const getSource = (source = [], lev = 1) => {
      if (isEmpty(source)) return [];
      let dataSource = [];
      if (lev === 1 || lev === 0) {
        dataSource = source.map((item) => {
          let eleItem = {};
          const { supQuoColumnAttrs = [], ...otherN } = item;
          supQuoColumnAttrs.forEach((i) => {
            eleItem = {
              ...eleItem,
              [`${i.columnCode}#${i.quotationHeaderId}`]: i.supQuotationColumnValue,
            };
            eleItem = remote
              ? remote.process(
                  'PRICE_COMPARISON_PROCESS_QUOTATION_DETAIL_DATA_SOURCE_RENDER',
                  eleItem,
                  { data: i }
                )
              : eleItem;
          });
          return {
            ...otherN,
            ...eleItem,
            rowLength: 0, // 用于判断行合并
            position: 0, // 用于判断行合并
            rowKey: uuid(), // 用于表格每一行的key
          };
        });
      } else if (lev === 2) {
        source.forEach((item) => {
          const { children = [], ...otherI } = item;
          const newDataSource = children.map((n, eleIndex) => {
            let eleItem = {};
            const { supQuoColumnAttrs = [], configName, ...otherN } = n;
            supQuoColumnAttrs.forEach((i) => {
              eleItem = {
                ...eleItem,
                [`${i.columnCode}#${i.quotationHeaderId}`]: i.supQuotationColumnValue,
              };
              eleItem = remote
                ? remote.process(
                    'PRICE_COMPARISON_PROCESS_QUOTATION_DETAIL_DATA_SOURCE_RENDER',
                    eleItem,
                    { data: i }
                  )
                : eleItem;
            });
            return {
              ...otherI,
              ...otherN,
              ...eleItem,
              configNameTWO: configName, // 二级明细名
              rowLength: children.length, // 用于判断行合并
              position: eleIndex + 1, // 用于判断行合并
              rowKey: uuid(), // 用于表格每一行的key
            };
          });
          dataSource = [...dataSource, ...newDataSource];
        });
      }
      return dataSource;
    };
    return getSource(supQuotationDetails, level);
  }

  /**
   * 渲染报价明细列供应商
   * @override 追觅
   */
  renderChildren(data) {
    const { remote } = this.props;
    const { supQuoColumnAttrs = [], columnCode } = data;
    const children = supQuoColumnAttrs.map((item) => {
      return {
        title: item.supplierCompanyName,
        dataIndex: `${columnCode}#${item.quotationHeaderId}`,
        width: 200,
      };
    });
    return remote
      ? remote.process('PRICE_COMPARISON_PROCESS_QUOTATION_DETAIL_RENDER_CHILDREN', children, {
          data,
        })
      : children;
  }

  renderConfigName(data, value, record) {
    let name = value;
    if (data.level === 0) {
      if (record.level === 1) {
        name = <span style={{ fontWeight: '600' }}>{value}</span>;
      } else if (record.level === 2) {
        name = <span style={{ marginLeft: '12px' }}>{value}</span>;
      }
    }
    return name;
  }

  /**
   * 渲染报价明细列
   */
  renderColumns(data) {
    const { remote, bidFlag = false } = this.props;
    const { level, supQuotationDetails = [] } = data;
    let detailsColumns = [];
    if (isEmpty(supQuotationDetails)) return [];
    detailsColumns = supQuotationDetails[0].quotationColumns.map((item) => {
      return {
        title: item.columnName,
        children: this.renderChildren(item),
      };
    });
    const columns = [
      {
        title:
          data.level === 0
            ? intl.get('ssrc.priceComparison.model.comparison.detailSum').d('明细项汇总')
            : intl.get('ssrc.priceComparison.model.comparison.levelOne').d('一级明细项'),
        dataIndex: 'configName',
        width: 150,
        render: (value, record) => {
          const obj = {
            children: this.renderConfigName(data, value, record),
            props: {},
          };
          // 只有一级
          if (record.position === 0) {
            obj.props.rowSpan = 1;
          } else if (record.position === 1) {
            // 有二级
            obj.props.rowSpan = record.rowLength;
          } else {
            obj.props.rowSpan = 0;
          }
          return obj;
        },
      },
      level === 2 && {
        title: intl.get('ssrc.priceComparison.model.comparison.levelTWO').d('二级明细项'),
        dataIndex: 'configNameTWO',
        width: 150,
      },
      ...(remote
        ? remote.process(
            'srm-front-ssrc/priceComparison_PROCESS_QUOTATION_COLUMNS',
            detailsColumns,
            {
              bidFlag,
              supQuotationDetails,
            }
          )
        : detailsColumns),
    ].filter(Boolean);
    return remote
      ? remote.process('srm-front-ssrc/priceComparison_PROCESS_QUOTATION_ALL_COLUMNS', columns, {
          bidFlag,
        })
      : columns;
  }

  /**
   * 渲染标题
   */
  renderTitle(data) {
    let title = '';
    switch (data.level) {
      case 0:
        title = intl.get('ssrc.priceComparison.model.comparison.detailSumTable').d('明细汇总表');
        break;
      case 1:
        title = intl
          .get('ssrc.priceComparison.model.comparison.levelOneCompare')
          .d('一级明细项对比');
        break;
      case 2:
        title = intl
          .get('ssrc.priceComparison.model.comparison.levelTWOCompare')
          .d('二级明细项对比');
        break;
      case 3: // 未完待续
        title = intl
          .get('ssrc.priceComparison.model.comparison.levelTHREECompare')
          .d('三级明细项对比');
        break;
      default:
        break;
    }
    return title;
  }

  @Bind()
  handleVisibleChange(visible) {
    const { fetchQuotationDetailData = () => {} } = this.props;
    const { supplierSelected = [] } = this.state;
    if (visible) {
      return;
    }
    fetchQuotationDetailData({
      // quotationColumnIds: columnSelected,
      quotationHeaderIds: supplierSelected,
    });
  }

  render() {
    const {
      sideMenu = [],
      dataSource = [],
      filterData = {},
      onChangeTab,
      loading = false,
      tableLoading = false,
      remote,
      bidFlag = false,
    } = this.props;
    const {
      // columnSelected = [],
      supplierSelected = [],
      // columnVisible = false,
    } = this.state;

    const { supplierSelectList = [] } = filterData;

    // const itemMenu = (
    //   <React.Fragment>
    //     <Menu className="quotationDetail-filter-column">
    //       <a onClick={() => this.changeKeyAll(columnSelectList, 'column')}>
    //         {intl.get('ssrc.priceComparison.view.message.chooseAll').d('全选')}
    //       </a>
    //       {columnSelectList.map((item) => (
    //         <Menu.Item key={item.quotationColumnId}>
    //           <Checkbox
    //             checked={columnSelected.includes(item.quotationColumnId)}
    //             onChange={(e) =>
    //               this.changeSelected(e.target.checked, item.quotationColumnId, 'column')
    //             }
    //           >
    //             {item.columnName}
    //           </Checkbox>
    //         </Menu.Item>
    //       ))}
    //     </Menu>
    //   </React.Fragment>
    // );
    const supplierMenu = (
      <React.Fragment>
        <Menu className="quotationDetail-filter-supplier">
          <a onClick={() => this.changeKeyAll(supplierSelectList, 'supplier')}>
            {intl.get('ssrc.priceComparison.view.message.chooseAll').d('全选')}
          </a>
          {supplierSelectList.map((item) => (
            <Menu.Item key={item.quotationHeaderId}>
              <Checkbox
                checked={supplierSelected.includes(item.quotationHeaderId)}
                onChange={(e) =>
                  this.changeSelected(e.target.checked, item.quotationHeaderId, 'supplier')
                }
              >
                {item.supplierCompanyName}
              </Checkbox>
            </Menu.Item>
          ))}
        </Menu>
      </React.Fragment>
    );

    return (
      <Spin spinning={loading || tableLoading}>
        {isEmpty(sideMenu) && !loading && !tableLoading ? (
          <div className={style['no-content-wrapper']}>
            <span className={style['no-content-img']}>
              <NoQuotationDetail />
            </span>
            <span className={style['no-content-text']}>
              {intl.get('ssrc.priceComparison.view.message.noDetail').d('暂无明细内容')}
            </span>
          </div>
        ) : (
          <Tabs
            onChange={(key) => onChangeTab({ activeKey: key })}
            tabPosition="left"
            className={style['quotation-detail-tabpane']}
          >
            {sideMenu.map((item) => {
              let tabpaneTab = (
                <Tooltip title={item.itemName} placement="topLeft">
                  {item.itemName}
                </Tooltip>
              );

              tabpaneTab = remote
                ? remote.process(
                    'srm-front-ssrc/priceComparison_PROCESS_QUOTATION_DETAIL_TABPANE_TAB_RENDER',
                    tabpaneTab,
                    {
                      bidFlag,
                      that: this,
                      item,
                      sideMenu,
                    }
                  )
                : tabpaneTab;

              return (
                <TabPane
                  key={item.sourceLineItemId}
                  tab={tabpaneTab}
                >
                  {dataSource?.[0]?.children?.[0]?.sourceLineItemId ===
                  item.sourceLineItemId /**  只渲染当前tab页内容 */ ? (
                    <React.Fragment>
                      <div className="quotationDetail-filter">
                        {/* <Dropdown
                      overlay={itemMenu}
                      trigger={['click']}
                      visible={columnVisible}
                      getPopupContainer={() =>
                      document.getElementsByClassName('quotationDetail-filter')[0]
                    }
                      onClick={() => this.showModal('column')}
                    >
                      <a
                        className="ant-dropdown-link dropdown-column"
                        href="#"
                        style={{ marginRight: '16px' }}
                      >
                        {intl.get('ssrc.priceComparison.view.message.columnFilter').d('筛选列')}{' '}
                        <Icon type="down" />
                      </a>
                    </Dropdown> */}
                        {remote
                          ? remote.render(
                              'srm-front-ssrc/priceComparison_RENDER_COLUMN_FILTER',
                              null,
                              {
                                bidFlag,
                                that: this,
                              }
                            )
                          : null}
                        <Dropdown
                          overlay={supplierMenu}
                          trigger={['click']}
                          onVisibleChange={this.handleVisibleChange}
                        >
                          <a
                            className="ant-dropdown-link quotation-dropdown-supplier"
                            href="#"
                            style={{ marginRight: '16px' }}
                          >
                            {intl
                              .get('ssrc.priceComparison.view.message.supplierFilter')
                              .d('筛选供应商')}{' '}
                            <Icon type="down" />
                          </a>
                        </Dropdown>
                      </div>
                      {dataSource?.map((n) => {
                        const { children = [] } = n;
                        const node = children?.map((i) => {
                          if (i.childrenExist) {
                            return (
                              <React.Fragment>
                                <h4 style={{ marginTop: '8px' }}>{this.renderTitle(i)}</h4>
                                <Table
                                  bordered
                                  dataSource={this.renderDataSource(i)}
                                  columns={this.renderColumns(i)}
                                  roeKey="uuid"
                                  pagination={false}
                                />
                              </React.Fragment>
                            );
                          } else {
                            return null;
                          }
                        });
                        return (
                          <React.Fragment>
                            <h3 className={style['template-info']}>{n.templateName}</h3>
                            {node}
                          </React.Fragment>
                        );
                      })}
                    </React.Fragment>
                  ) : (
                    !tableLoading && (
                      <div className={style['no-content-wrapper']}>
                        <span className={style['no-content-img']}>
                          <NoQuotationDetail />
                        </span>
                        <span className={style['no-content-text']}>
                          {intl.get('ssrc.priceComparison.view.message.noDetail').d('暂无明细内容')}
                        </span>
                      </div>
                    )
                  )}
                </TabPane>
              );
            })}
          </Tabs>
        )}
      </Spin>
    );
  }
}
