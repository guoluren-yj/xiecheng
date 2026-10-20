/**
 * index - 我的收货记录
 * @date: 2018-12-4
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent, Fragment } from 'react';
import { Tabs } from 'hzero-ui';
import { connect } from 'dva';
import { Tooltip } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import moment from 'moment';
// import { routerRedux } from 'dva/router';
import { isFunction } from 'lodash';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { Header, Content } from 'components/Page';
import ExcelExport from 'components/ExcelExport';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';
import { SRM_SPUC } from '_utils/config';
import { filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { DATETIME_MIN } from 'utils/constants';
import DynamicButtons from '_components/DynamicButtons';
import Search from './Search';
import List from './List';

const { TabPane } = Tabs;
function getPastHalfYear(currentDate = moment()) {
  const currentDateTime = isFunction(currentDate.valueOf) ? currentDate.valueOf() : null;
  if (!currentDateTime) {
    return;
  }
  // 将半年的时间单位换算成毫秒
  const halfYear = ((currentDate.isLeapYear() ? 366 : 365) / 4) * 24 * 3600 * 1000;
  const pastResult = currentDateTime - halfYear; // 半年前的时间（毫秒单位）
  return moment(pastResult);
}

@formatterCollections({
  code: [
    'sinv.purchaseReceiptRecord',
    'entity.item',
    'entity.supplier',
    'entity.organization',
    'sinv.common',
    'sinv.purchaseReception',
    'sinv.supplierDelivery',
    'entity.business',
    'sinv.receiptExecution',
  ],
})
@withCustomize({
  unitCode: [
    'SINV.PURCHASE_RECEIPT_RECORD.LINE_BASIC',
    'SINV.PURCHASE_RECEIPT_RECORD.FILTER',
    'SINV.PURCHASE_RECEIPT_RECORD.BUTTONS',
  ],
})
@connect(({ loading = {}, purchaseReceiptRecord }) => ({
  loading: {
    queryList: loading.effects['purchaseReceiptRecord/queryList'],
    queryReceiveTransactionDetails:
      loading.effects['purchaseReceiptRecord/queryReceiveTransactionDetails'],
    queryReceiveTransactionASNDetails:
      loading.effects['purchaseReceiptRecord/queryReceiveTransactionASNDetails'],
  },
  purchaseReceiptRecord,
}))
export default class PurchaseReceiptRecord extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      currentTabKey: 'basicInfo', // 当前tab页的key
      organizationId: getCurrentOrganizationId(),
    };
  }

  componentDidMount() {
    if (this.form) {
      this.form.setFieldsValue({ trxDateFrom: getPastHalfYear() });
    }
    this.handleSearch();
    this.props.dispatch({
      type: 'purchaseReceiptRecord/init',
    });
  }

  /**
   * fetchList - 获取列表数据
   * @param {Object} payload - 查询参数
   */
  @Bind()
  handleSearch(page = {}) {
    const { dispatch } = this.props;
    const filterValues = (this.form && filterNullValueObject(this.form.getFieldsValue())) || {};
    const handleFormValues = this.handleFormQuery(filterValues);
    dispatch({
      type: 'purchaseReceiptRecord/queryList',
      payload: {
        page,
        ...handleFormValues,
        customizeUnitCode:
          'SINV.PURCHASE_RECEIPT_RECORD.LINE_BASIC,SINV.PURCHASE_RECEIPT_RECORD.FILTER',
      },
    });
  }

  /**
   * 处理表单中的查询条件
   * @param {Object} filterValues
   */
  handleFormQuery(filterValues) {
    const dealTime = {};
    const timeArray = [
      'trxDateFrom',
      'trxDateTo',
      'realityReceiveDateStart',
      'realityReceiveDateEnd',
    ];
    timeArray.forEach((item) => {
      dealTime[item] = filterValues[item] ? filterValues[item].format(DATETIME_MIN) : undefined;
    });
    return {
      ...filterValues,
      ...dealTime,
      customizeUnitCode:
        'SINV.PURCHASE_RECEIPT_RECORD.LINE_BASIC,SINV.PURCHASE_RECEIPT_RECORD.FILTER',
    };
  }

  /**
   * fetchReceiveTransactionDetails - 获取列表数据
   * @param {Object} payload - 查询参数
   */
  @Bind()
  fetchReceiveTransactionDetails(page = {}, id) {
    const { dispatch } = this.props;
    return dispatch({
      type: 'purchaseReceiptRecord/queryReceiveTransactionDetails',
      payload: {
        page,
        rcvTrxLineId: id,
      },
    });
  }

  /**
   * fetchReceiveTransactionDetails - 获取列表数据
   * @param {Object} payload - 查询参数
   */
  @Bind()
  fetchReceiveTransactionASNDetails(page = {}, id) {
    const { dispatch } = this.props;
    return dispatch({
      type: 'purchaseReceiptRecord/queryReceiveTransactionASNDetails',
      payload: {
        page,
        rcvTrxLineId: id,
      },
    });
  }

  /**
   * onTableChange - 分页切换
   * @param {page} Object - 分页
   */
  @Bind()
  onTableChange(page) {
    const { getFieldsValue = (e) => e } = this.search;
    this.handleSearch({ page, ...getFieldsValue() });
  }

  @Bind()
  listTabChange(key) {
    this.setState({
      currentTabKey: key,
    });
  }

  render() {
    const {
      loading = {},
      customizeForm = () => {},
      customizeTable = () => {},
      purchaseReceiptRecord: { myList, myPagination, enumMap = {} },
      customizeBtnGroup,
    } = this.props;
    const { specialInventory } = enumMap;
    // const { asnDetailModalVisible, detailModalVisible } = this.state;
    // const { rule } = supplierReceiptRecord;
    const { currentTabKey, organizationId } = this.state;
    // const organizationId = getCurrentOrganizationId();
    const searchProps = {
      customizeForm,
      specialInventory,
      onRef: (node) => {
        this.form = node.props.form;
      },
      onSearch: this.handleSearch,
    };
    const tableProps = {
      loading,
      // ...rule.list,
      customizeTable,
      tabKey: currentTabKey,
      onChange: this.handleSearch,
      dataSource: myList,
      pagination: myPagination,
      fetchReceiveTransactionDetails: this.fetchReceiveTransactionDetails,
      fetchReceiveTransactionASNDetails: this.fetchReceiveTransactionASNDetails,
    };
    const otherButtonProps = {
      type: 'c7n-pro',
      icon: 'export',
    };
    const searchFields = this.form ? filterNullValueObject(this.form.getFieldsValue()) : {};
    const formQueryCondition = this.handleFormQuery(searchFields);
    const toolTitle = intl
      .get(`sinv.purchaseReceiptRecord.view.title.exportTip`)
      .d(
        '当查询条件“事务日期”为空时，默认仅导出六个月内的收货数据。如需导出更多数据，请在查询条件”事务日期从“输入够早的日期，如2000-01-01。'
      );

    const btns = {
      headerBtn: [
        {
          name: 'newExport',
          group: true,
          child: (
            <ExcelExportPro
              otherButtonProps={{
                icon: 'unarchive',
                type: 'c7n-pro',
                permissionList: [
                  {
                    code: 'srm.po-admin.ar.purchase-receipt-record.ps.button.newexport',
                    type: 'c7n-pro',
                    meaning: '(新)导出',
                  },
                ],
              }}
              requestUrl={`${SRM_SPUC}/v1/${organizationId}/rcv-trx-line/for-purchase/export/new`}
              queryParams={formQueryCondition}
              buttonText={
                <Tooltip placement="bottom" title={toolTitle}>
                  {intl.get(`sinv.purchaseReceiptRecord.view.button.newExport`).d('新版导出')}
                </Tooltip>
              }
              templateCode="SPUC_SINV_FOR_PURCHASE_EXPORT"
            />
          ),
        },
        {
          name: 'export',
          group: true,
          child: (
            <ExcelExport
              otherButtonProps={otherButtonProps}
              buttonText={
                <Tooltip placement="bottom" title={toolTitle}>
                  {intl.get('hzero.common.button.export').d('导出')}
                </Tooltip>
              }
              requestUrl={`${SRM_SPUC}/v1/${organizationId}/rcv-trx-line/for-purchase/export`}
              queryParams={formQueryCondition}
            />
          ),
        },
      ],
    };
    return (
      <Fragment>
        <Header
          title={intl
            .get(`sinv.purchaseReceiptRecord.view.title.purchaseReceiptRecord`)
            .d('我的收货记录')}
        >
          {customizeBtnGroup(
            { code: `SINV.PURCHASE_RECEIPT_RECORD.BUTTONS`, pro: true },
            <DynamicButtons buttons={btns.headerBtn} />
          )}
        </Header>
        <Content>
          <Search {...searchProps} />
          <Tabs
            onTabClick={this.listTabChange}
            defaultActiveKey="basicInfo"
            animated={false}
            activeKey={currentTabKey}
          >
            <TabPane
              tab={intl.get(`sinv.purchaseReceiptRecord.view.title.basicInfo`).d('基本信息')}
              key="basicInfo"
            >
              <List {...tableProps} />
            </TabPane>
            <TabPane
              tab={intl.get(`sinv.purchaseReceiptRecord.view.title.deliveryInfo`).d('送货单信息')}
              key="deliveryInfo"
            >
              <List {...tableProps} />
            </TabPane>
            <TabPane
              tab={intl.get(`sinv.purchaseReceiptRecord.view.title.financeInfo`).d('财务信息')}
              key="financeInfo"
            >
              <List {...tableProps} />
            </TabPane>
          </Tabs>
        </Content>
      </Fragment>
    );
  }
}
