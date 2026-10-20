/**
 * index-引用采购申请-新
 * @date: 2020-11-17
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright 2020, Hand
 */
import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { isEmpty } from 'lodash';
import { Button, Tabs } from 'hzero-ui';
import { Bind, Throttle } from 'lodash-decorators';
import { Header, Content } from 'components/Page';
import { DATETIME_MIN } from 'utils/constants';
import notification from 'utils/notification';
import intl from 'utils/intl';
import { getEditTableData, getResponse } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import moment from 'moment';
import { THROTTLE_TIME } from '@/routes/components/utils/constant';
import { sourcePage } from '../../components/utils';
import LineQuotation from './LineQuotation/index';
import OrderQuotation from './WholeOrderQuotation';

import { queryDoubleUomConfig } from '@/services/orderWorkspaceService';

const { TabPane } = Tabs;

/**
 * QuotePurchaseRequisition - 引用采购申请组件
 * @export {Component} - React.Component
 * @reactProps {object} quotePurchaseRequisition - 数据源
 */
@formatterCollections({
  code: [
    'sodr.quotePurchaseRequisition',
    'sodr.quotePurchase',
    'sodr.common',
    'entity.supplier',
    'entity.business',
    'entity.organization',
    'entity.applier',
    'entity.company',
    'entity.purchaser',
    'sodr.orderType',
    'ssrc.priceLibrary',
  ],
})
@withCustomize({
  unitCode: [
    'SODR.PURCHASE_REQUISITION_LIST.LINE',
    'SODR.PURCHASE_REQUISITION_LIST.FILTER_LINE',
    'SODR.PURCHASE_REQUISITION_LIST.FILTER_ALL',
    'SODR.PURCHASE_REQUISITION_LIST.ALL',
    'SODR.PURCHASE_REQUISITION_LIST.BUTTONS',
    'SODR.PURCHASE_REQUISITION_LIST.TAB',
    'SODR.PURCHASE_REQUISITION_LIST.PROPOSED.PRICE',
    'SODR.PURCHASE_REQUISITION_LIST.FILTER_PROPOSED_PRICE',
  ],
})
@connect(({ quotePurchaseRequisition, loading }) => ({
  quotePurchaseRequisition,
  loadingWholeList: loading.effects['quotePurchaseRequisition/fetchWholeQuoteList'],
  lineQuotationLoading: loading.effects['quotePurchaseRequisition/fetchLineQuotation'],
  createLoading: loading.effects['quotePurchaseRequisition/create'],
  addLoading: loading.effects['quotePurchaseRequisition/wholeQuoteCreate'],
  checkLoading: loading.effects['quotePurchaseRequisition/check'],
  fetchSettingsLoading: loading.effects['quotePurchaseRequisition/fetchSettings'],
}))
export default class QuotePurchaseRequisition extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tabActiveKey: (props.quotePurchaseRequisition || {}).lastActiveTabKey || 'lineQuotation',
      selectedListRowKeys: [], // 整单引用选中行
      lineQuoSelectedRowKeys: [], // 按行引用选中主键集合
      selectedLineQuotationData: [], // 按行引用已勾选选中行数据
      lineQuotationData: [], // 按行引用行数据
      pageSource: sourcePage(),
      setting: '0',
      doubleUnitEnabled: 0,
    };
  }

  componentDidMount() {
    this.fetchDoubleUom();
  }

  componentDidUpdate(prevProps) {
    const {
      custLoading,
      location: { state: { _back } = {} },
      quotePurchaseRequisition: { wholePagination, linePagination },
    } = this.props;
    if (!custLoading && prevProps.custLoading !== custLoading) {
      const { tabActiveKey } = this.state;
      this.fetchSettings();
      if (_back !== -1) {
        this.fetchEnum();
        this.handleSearch(tabActiveKey === 'orderQuotation' ? wholePagination : linePagination);
        this.handleSearchList();
      } else {
        this.handleSearch(tabActiveKey === 'orderQuotation' ? wholePagination : linePagination);
      }
    }
  }

  /**
   * 页面卸载时触发
   */
  componentWillUnmount() {
    const { dispatch } = this.props;
    // this.resetFields();
    dispatch({
      type: 'quotePurchaseRequisition/updateState',
      payload: {
        lastActiveTabKey: this.state.tabActiveKey,
      },
    });
  }

  /**
   * fetchDetailHeader - 查询配置中心
   */
  @Bind()
  fetchSettings() {
    const { dispatch } = this.props;
    dispatch({
      type: 'quotePurchaseRequisition/fetchSettings',
    }).then((res) => {
      if (res) {
        this.setState({
          setting: res['000112'] || '0',
        });
      }
    });
  }

  /**
   * 业务规则定义 - 双单位开启
   */
  @Bind()
  fetchDoubleUom() {
    queryDoubleUomConfig().then((res) => {
      if (getResponse(res)) {
        this.setState({ doubleUnitEnabled: res });
      }
    });
  }

  /**
   * 查询入口
   * @param {Object} [page={}] 分页
   * @param {number} buttonFlag 查询按钮点击，非翻页查询
   */
  @Bind()
  handleSearch(page = {}, buttonFlag, sorter) {
    const {
      tabActiveKey,
      lineQuoSelectedRowKeys, // 按行引用选中主键集合
      selectedLineQuotationData,
      lineQuotationData,
    } = this.state;
    const {
      quotePurchaseRequisition: { wholeOrderQuery, linePagination = {}, wholePagination = {} },
    } = this.props;
    const lineQuoSelectedRows = lineQuotationData.filter((n) =>
      lineQuoSelectedRowKeys.includes(n.prLineId)
    );
    if (tabActiveKey === 'orderQuotation') {
      const fields = this.listForm ? this.listForm.searchForm.props.form.getFieldsValue() : {};
      const handleFormValues = this.handleFormQuery(fields);
      this.handleSearchList({
        ...wholeOrderQuery,
        page: { pageSize: wholePagination.pageSize, ...page },
        ...handleFormValues,
        buttonFlag,
      });
      this.setState({ selectedListRowKeys: [] });
    } else {
      // 翻页数据校验
      if (this.validateFieldsWhenPaging(lineQuoSelectedRows)) {
        return;
      }
      // 翻页时获得当前页选中行数据
      const newSelectedLineQuotationData = [];
      if (lineQuoSelectedRowKeys.length > 0) {
        // lineQuoSelectedRows.map((n) => newSelectedLineQuotationData.push(n));
        newSelectedLineQuotationData.push(...getEditTableData(lineQuoSelectedRows));
        const newSelectedKeys = newSelectedLineQuotationData.map((n) => n.prLineId);
        selectedLineQuotationData.map((n) => {
          if (
            !newSelectedKeys.includes(n.prLineId) &&
            lineQuoSelectedRowKeys.includes(n.prLineId)
          ) {
            newSelectedLineQuotationData.push(n);
          }
          return n;
        });
      }
      this.setState({ selectedLineQuotationData: newSelectedLineQuotationData });
      if (buttonFlag) {
        this.setState({ lineQuoSelectedRowKeys: [] });
      }

      const fields = this.lineForm ? this.lineForm.props.form.getFieldsValue() : {};
      const { displaySupplierName, tempKey, ...handleFormValues } = this.handleFormQuery(fields);
      this.handleSearchDetailList({
        sort: !isEmpty(sorter) ? sorter : undefined,
        page: { pageSize: linePagination.pageSize, ...page },
        ...handleFormValues,
        buttonFlag,
        customizeUnitCode:
          'SODR.PURCHASE_REQUISITION_LIST.LINE,SODR.PURCHASE_REQUISITION_LIST.FILTER_LINE',
      });
    }
  }

  /**
   * 翻页数据校验
   * @param {Object} lineQuoSelectedRows
   */
  @Bind()
  validateFieldsWhenPaging(lineQuoSelectedRows) {
    let errorFlag = false;
    lineQuoSelectedRows.map((record) => {
      record.$form.validateFields((err, values) => {
        if (err && 'thisOrderQuantity' in err) {
          if (values.thisOrderQuantity === undefined || values.thisOrderQuantity === null) {
            notification.error({
              message: intl
                .get(`sodr.quotePurchaseRequisition.model.quotePurchase.notNullError`)
                .d('当前页勾选数据信息有必输信息未维护，请检查'),
            });
            errorFlag = true;
          } else if (values.thisOrderQuantity > record.restPoQuantity) {
            notification.error({
              message: intl
                .get(`sodr.quotePurchaseRequisition.model.quotePurchase.notGreaterError`)
                .d('勾选行创建订单数量不可大于可创建订单数量，请检查'),
            });
            errorFlag = true;
          }
        }
      });
      return record;
    });
    return errorFlag;
  }

  /**
   * 查询值集
   */
  @Bind()
  fetchEnum() {
    const { dispatch } = this.props;
    dispatch({
      type: 'quotePurchaseRequisition/fetchEnum',
    });
  }

  /**
   * 查询整单引用列表
   * @param {Object} fields 查询条件
   */
  @Bind()
  handleSearchList(fields = {}) {
    const { buttonFlag = true } = fields;
    const {
      dispatch,
      quotePurchaseRequisition: { wholePagination = {} },
    } = this.props;
    const { total } = wholePagination || {};
    dispatch({
      type: 'quotePurchaseRequisition/fetchWholeQuoteList',
      payload: {
        ...fields,
        asyncCountFlag: 'DEFAULT',
        oldTotalElements: buttonFlag ? undefined : total,
        customizeUnitCode:
          'SODR.PURCHASE_REQUISITION_LIST.ALL,SODR.PURCHASE_REQUISITION_LIST.FILTER_ALL',
      },
    }).then((res) => {
      if (res && res.needCountFlag === 'Y') {
        dispatch({
          type: 'quotePurchaseRequisition/fetchWholeQuoteListPage',
          payload: {
            ...fields,
            asyncCountFlag: 'DEFAULT',
            customizeUnitCode:
              'SODR.PURCHASE_REQUISITION_LIST.ALL,SODR.PURCHASE_REQUISITION_LIST.FILTER_ALL',
          },
        });
      }
    });
  }

  /**
   * 处理日期格式
   * @param {*} filterValues
   * @returns {fields} 返回处理后的查询条件
   */
  @Bind()
  handleFormQuery(filterValues) {
    const { tabActiveKey } = this.state;
    const dealTime = {};
    let timeArray = [];
    if (tabActiveKey === 'orderQuotation') {
      timeArray = ['requestDateTo', 'requestDateFrom'];
    } else {
      timeArray = [
        'requestDateFrom',
        'requestDateTo',
        'releasedDateStart',
        'releasedDateEnd',
        'erpCreationDateStart',
        'erpCreationDateEnd',
        'urgentDateStart',
        'urgentDateEnd',
        'needByDateStart',
        'needByDateEnd',
        'promiseDeliveryDateStart',
        'promiseDeliveryDateEnd',
        'neededDateFrom',
        'neededDateTo',
      ];
    }
    timeArray.forEach((item) => {
      dealTime[item] =
        filterValues[item] && filterValues[item].isValid()
          ? filterValues[item].format(DATETIME_MIN)
          : undefined;
    });
    return {
      ...filterValues,
      ...dealTime,
    };
  }

  @Bind()
  tabChange(activeKey) {
    this.setState({
      tabActiveKey: activeKey,
    });
  }

  /**
   * 按行引用采购申请创建
   */
  @Throttle(THROTTLE_TIME, { trailing: false })
  @Bind()
  handleCreate() {
    const {
      pageSource,
      lineQuoSelectedRowKeys,
      selectedLineQuotationData,
      lineQuotationData,
      doubleUnitEnabled,
    } = this.state;
    const { dispatch } = this.props;
    const lineQuoSelectedRows = lineQuotationData.filter((n) =>
      lineQuoSelectedRowKeys.includes(n.prLineId)
    );
    const newSelectedLineQuotationData = [];
    // lineQuoSelectedRows.map((n) => newSelectedLineQuotationData.push(n));
    newSelectedLineQuotationData.push(...getEditTableData(lineQuoSelectedRows));
    const newSelectedKeys = newSelectedLineQuotationData.map((n) => n.prLineId);
    selectedLineQuotationData.map((n) => {
      if (!newSelectedKeys.includes(n.prLineId) && lineQuoSelectedRowKeys.includes(n.prLineId)) {
        newSelectedLineQuotationData.push(n);
      }
      return n;
    });
    this.setState({ selectedLineQuotationData: newSelectedLineQuotationData });
    const lineQuoSelectedRowsData = newSelectedLineQuotationData.map((item) => {
      const {
        uomId,
        uomCode,
        neededDate,
        priceLibId,
        prLineUomId,
        prLineUomCode,
        priceLibraryId,
        secondaryUomCode,
      } = item;
      return {
        ...item,
        uomId: uomId || prLineUomId,
        uomCode: uomCode || prLineUomCode,
        neededDate: moment(neededDate).format(DATETIME_MIN),
        priceLibraryId: priceLibId === null || priceLibId === undefined ? null : priceLibraryId,
        uomCodeTemp: doubleUnitEnabled ? secondaryUomCode : uomCode,
      };
    });
    // 获取来源平台
    // const { prSourcePlatform } = lineQuoSelectedRowsData[0];
    // const lineQuoSelectedRowsData = getEditTableData(lineQuoSelectedRows);
    // const descriptionList = lineQuoSelectedRowsData.map((item) => {
    //   if (item.supplierCompanyId) {
    //     return {
    //       ...item,
    //       selectSupplierCompanyId: item.supplierCompanyId,
    //     };
    //   } else {
    //     return {
    //       ...item,
    //     };
    //   }
    // });
    // const description = descriptionList.filter((n) => !n.selectSupplierCompanyId);
    // const dataList = (
    //   <ul style={{ margin: 0, padding: 0 }}>
    //     {description.map((m) => {
    //       return (
    //         <li key={m.prLineId}>
    //           {`${intl.get(`sodr.quotePurchaseRequisition.view.message.prNum`).d('申请号')}:${
    //             m.prNum || ''
    //           },
    //         ${intl.get(`sodr.common.model.common.lineNum`).d('行')}:${m.lineNum},
    //         ${intl
    //           .get(`sodr.common.model.common.gongyingsahng`)
    //           .d('未选择供应商，请选择后点击新建按钮。')}`}
    //         </li>
    //       );
    //     })}
    //   </ul>
    // );
    dispatch({
      type: 'quotePurchaseRequisition/check',
      payload: {
        sourceCode: 'PURCHASE_REQUEST',
      },
    }).then((rec) => {
      if (rec === 1) {
        if (lineQuoSelectedRowsData.length > 0) {
          dispatch({
            type: 'quotePurchaseRequisition/create',
            payload: lineQuoSelectedRowsData,
          }).then((res) => {
            if (res && !res.failed && res.length > 1) {
              this.props.history.push({
                pathname: `/sodr/purchase-order-maintain/quote-purchase-requisition/tab-line-newCreation`,
                search: `?poHeaderId=${res.map((n) => n.poHeaderId)}&cacheKey=${
                  res[0].cacheKey
                }&source=newRequisition&sourcePage=${pageSource.pageRequest}`,
              });
              notification.success();
            } else if (res && !res.failed && res.length === 1) {
              const poHeaderId = res.map((n) => n.poHeaderId);
              this.handleToDetail(poHeaderId, lineQuoSelectedRowsData[0].prSourcePlatform);
              notification.success();
            }
          });
        }
      } else if (rec === 0) {
        if (lineQuoSelectedRowsData.length > 0) {
          dispatch({
            type: 'quotePurchaseRequisition/create',
            payload: lineQuoSelectedRowsData,
          }).then((res) => {
            if (res && !res.failed) {
              const poHeaderId = res.map((n) => n.poHeaderId);
              this.handleToDetail(poHeaderId, lineQuoSelectedRowsData[0].prSourcePlatform);
              notification.success();
            }
          });
        }
      }
    });
  }

  /**
   * 按行引用查询
   * @param {object} page - 分页
   */
  @Bind()
  handleSearchDetailList(fields) {
    const {
      dispatch,
      quotePurchaseRequisition: { linePagination = {} },
    } = this.props;
    const { total } = linePagination || {};
    const { buttonFlag } = fields;
    const { selectedLineQuotationData } = this.state;
    const erpControlFlag = 1;
    const field = {
      ...fields,
      erpControlFlag,
      asyncCountFlag: 'DEFAULT',
      oldTotalElements: buttonFlag ? undefined : total,
    };
    // console.log('field', field);
    dispatch({
      type: 'quotePurchaseRequisition/fetchLineQuotation',
      payload: field,
    }).then((res) => {
      if (res && !res.failed) {
        const selectedLineQuotationDataKeys = selectedLineQuotationData.map((n) => n.prLineId);
        const lineQuotationData = res.content.map((n) => {
          if (selectedLineQuotationDataKeys.includes(n.prLineId)) {
            return {
              ...selectedLineQuotationData.filter((m) => m.prLineId === n.prLineId)[0],
              _status: 'update',
            };
          } else {
            return { ...n, _status: 'update' };
          }
        });
        this.setState({ lineQuotationData });
      }
    });
  }

  /**
   * 按行引用行数据选择变化
   * @param {object[]} selectedRows -当前选择的行
   */
  @Bind()
  lineQuotationSelectChange(lineQuoSelectedRowKeys) {
    this.setState({ lineQuoSelectedRowKeys });
  }

  /**
   * 整单引用列表选中项改变回调
   * @param {*} selectedListRowKeys
   */
  @Bind()
  handleListRowSelectChange(selectedListRowKeys) {
    this.setState({ selectedListRowKeys });
  }

  /**
   * 创建整单引用
   */
  @Bind()
  handleWholeQuoteCreate() {
    const { selectedListRowKeys } = this.state;
    const { dispatch } = this.props;
    dispatch({
      type: 'quotePurchaseRequisition/wholeQuoteCreate',
      payload: {
        prHeaderId: selectedListRowKeys[0],
      },
    }).then((res) => {
      if (res) {
        notification.success();
        this.handleToDetail(res.poHeaderId);
      }
    });
  }

  /**
   * 跳转到详情页
   * @param {String} headerId
   */
  @Bind()
  handleToDetail(headerId, source) {
    const { tabActiveKey, pageSource } = this.state;
    // 存放首次加载价格库查询标识
    const itemKey = `sodr.quotePurchaseRequisition.${Math.random()}`;
    window.sessionStorage.setItem(itemKey, 1);
    if (tabActiveKey === 'lineQuotation') {
      // 新版采购申请转订单页面跳转逻辑    sourcePage 来源于引用采购申请入口
      if (source === 'ERP' || source === 'SRM' || source === 'SHOP') {
        this.props.history.push({
          pathname: `/sodr/purchase-order-maintain/quote-purchase-requisition/line-newCreation`,
          search: `?poHeaderId=${headerId}&source=newRequisition&sourcePage=${pageSource.pageRequest}&poSourcePlatform=${source}`,
        });
      } else {
        // 旧版采购申请转订单页面跳转逻辑
        this.props.history.push({
          pathname: `/sodr/purchase-order-maintain/quote-purchase-requisition/line-creation`,
          search: `?poHeaderId=${headerId}&source=requisition&itemKey=${itemKey}`,
        });
      }
    } else {
      this.props.history.push({
        pathname: `/sodr/purchase-order-maintain/quote-purchase-requisition/sheet-creation`,
        search: `?poHeaderId=${headerId}&source=requisition`,
      });
    }
  }

  /**
   * 点击采购申请编号跳转到详情页
   * @param {string} headerId - 行数据
   */
  @Bind()
  handleWholeView(headerId) {
    this.props.history.push({
      pathname: `/sodr/purchase-order-maintain/quote-purchase-requisition/detail/${headerId}`,
    });
  }

  // 清空搜索框
  @Bind()
  resetFields() {
    if (this.listForm !== undefined) this.listForm.searchForm.props.form.resetFields();
    if (this.lineForm !== undefined) this.lineForm.props.form.resetFields();
  }

  // 修改数据
  @Bind()
  updateState(payload) {
    const { dispatch } = this.props;
    dispatch({
      type: 'quotePurchaseRequisition/updateState',
      payload,
    });
  }

  @Bind()
  lineQuotationDataChange(lineQuotationData) {
    this.setState({ lineQuotationData });
  }

  /**
   * 本次下单数量失去焦点触发事件
   * @param {*} item
   * @param {*} record
   */
  // @Bind()
  // thisOrderQuantityChange(item, record) {
  //   const { lineQuotationData = [] } = this.state;
  //   const lineQuotationDataRows = lineQuotationData?.map(n => {
  //     if (n.prLineId && n.prLineId === record.prLineId) {
  //       return {
  //         ...n,
  //         thisOrderQuantity: parseFloat(item.target.value.replace(',', '')),
  //       };
  //     } else {
  //       return n;
  //     }
  //   });
  //   this.setState({ lineQuotationData: lineQuotationDataRows });
  // }

  render() {
    const {
      lineQuotationData,
      lineQuoSelectedRowKeys,
      selectedListRowKeys,
      doubleUnitEnabled,
      tabActiveKey,
      setting,
    } = this.state;
    const {
      customizeTable,
      customizeFilterForm,
      quotePurchaseRequisition,
      quotePurchaseRequisition: {
        linePagination,
        wholeDataSource = [],
        wholePagination = {},
        enumMap = {},
        lastActiveTabKey,
      },
      checkLoading,
      lineQuotationLoading,
      fetchSettingsLoading,
      loadingWholeList,
      addLoading,
      createLoading,
      customizeBtnGroup,
      customizeTabPane,
    } = this.props;
    // console.log('page', linePagination, 'whole', wholePagination);
    const lineProps = {
      customizeTable,
      customizeFilterForm,
      enumMap,
      // onLineView: this.handleLineView,
      onSearch: this.handleSearch,
      dataSource: lineQuotationData,
      pagination: linePagination,
      rowSelection: {
        selectedRowKeys: lineQuoSelectedRowKeys,
        onChange: this.lineQuotationSelectChange,
      },
      loading: lineQuotationLoading,
      onRef: (node) => {
        this.lineForm = node;
      },
      lineQuoSelectedRowKeys,
      setting,
      doubleUnitEnabled,
      fetchSettingsLoading,
      quotePurchaseRequisition,
      updateState: this.updateState,
      // thisOrderQuantityChange: this.thisOrderQuantityChange,
      lineQuotationDataChange: this.lineQuotationDataChange,
    };
    const listRowSelection = {
      type: 'radio',
      selectedRowKeys: selectedListRowKeys,
      onChange: this.handleListRowSelectChange,
    };
    const listProps = {
      enumMap,
      customizeTable,
      customizeFilterForm,
      // dispatch,
      onRedirectToDetail: this.handleWholeView,
      onSearchPaging: this.handleSearch,
      handleReset: this.handleResetOrderFields,
      loading: loadingWholeList,
      dataSource: wholeDataSource,
      pagination: wholePagination,
      rowSelection: listRowSelection,
      quotePurchaseRequisition,
      updateState: this.updateState,
      onRef: (node) => {
        this.listForm = node;
      },
    };
    return (
      <Fragment>
        <Header
          title={intl.get(`sodr.quotePurchaseRequisition.view.message.title`).d('引用采购申请')}
          backPath="/sodr/purchase-order-maintain/list"
        >
          {tabActiveKey === 'lineQuotation' && (
            <Fragment>
              {customizeBtnGroup({ code: 'SODR.PURCHASE_REQUISITION_LIST.BUTTONS' }, [
                <Button
                  data-name="lineQuotationCreate"
                  icon="plus"
                  type="primary"
                  onClick={this.handleCreate}
                  loading={checkLoading || createLoading}
                  disabled={!lineQuoSelectedRowKeys.length}
                >
                  {intl.get('hzero.common.button.create').d('新建')}
                </Button>,
              ])}
            </Fragment>
          )}
          {tabActiveKey === 'orderQuotation' && (
            // <Fragment>
            //   {customizeBtnGroup({ code: 'SODR.PURCHASE_REQUISITION_LIST.BUTTONS' }, [
            <Button
              data-name="orderQuotationCreate"
              icon="plus"
              type="primary"
              onClick={this.handleWholeQuoteCreate}
              loading={addLoading}
              disabled={isEmpty(selectedListRowKeys)}
            >
              {intl.get('hzero.common.button.create').d('新建')}
            </Button>
            //   ])}
            // </Fragment>
          )}
        </Header>
        <Content style={{ paddingTop: 0 }}>
          {customizeTabPane(
            {
              code: 'SODR.PURCHASE_REQUISITION_LIST.TAB',
            },
            <Tabs
              defaultActiveKey={lastActiveTabKey}
              onChange={this.tabChange}
              animated={false}
              style={{ paddingTop: 0 }}
            >
              <TabPane
                tab={intl
                  .get(`sodr.quotePurchaseRequisition.view.message.lineQuotation`)
                  .d('按行引用')}
                key="lineQuotation"
              >
                <LineQuotation {...lineProps} />
              </TabPane>
              <TabPane
                tab={intl
                  .get(`sodr.quotePurchaseRequisition.view.message.orderQuotation`)
                  .d('整单引用')}
                key="orderQuotation"
              >
                <OrderQuotation {...listProps} />
              </TabPane>
            </Tabs>
          )}
        </Content>
      </Fragment>
    );
  }
}
