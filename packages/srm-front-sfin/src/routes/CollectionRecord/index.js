/**
 * RiskAssessmentList -风险评估 列表页
 * @date: 2019-12-4
 * @author guozhiqiang <zhiqiang.guo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import React from 'react';
import { Bind } from 'lodash-decorators';
import { isNumber, sum } from 'lodash';
import { Table } from 'hzero-ui';
import { connect } from 'dva';
import { Link } from 'dva/router';
import moment from 'moment';
import intl from 'utils/intl';
import { filterNullValueObject } from 'utils/utils';
import { DEFAULT_DATETIME_FORMAT, DATETIME_MIN, DATETIME_MAX } from 'utils/constants';
import { Header, Content } from 'components/Page';
import { dateRender } from 'utils/renderer';
import formatterCollections from 'utils/intl/formatterCollections';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { thousandBitSeparator } from '@/routes/utils';

import FilterForm from './FilterForm';

const promptCode = 'sfin.paymentRecord';

@connect(({ loading = {}, collectionRecord = {} }) => ({
  fetchListLoading: loading.effects['collectionRecord/fetchList'],
  enumMap: collectionRecord.enumMap || {},
  collectionRecord,
}))
@formatterCollections({
  code: [
    'sfin.paymentRecord',
    'hzero.common',
    'entity.organization',
    'entity.attachment',
    'entity.company',
    'entity.business',
    'entity.item',
    'entity.roles',
    'sfin.invoiceBill',
    'sfin.payment',
    'entity.supplier',
  ],
})
@withCustomize({
  unitCode: ['SFIN.COLLECTION_RECORD.LIST', 'SFIN.COLLECTION_RECORD.LIST_FILTER_FORM'],
})
export default class extends React.Component {
  form;

  componentDidMount() {
    this.fetchList();
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'collectionRecord/updateState',
      payload: { list: [], pagination: {} },
    });
  }

  // FilterForm绑定到这里
  @Bind()
  bindForm(form) {
    this.form = form;
  }

  /**
   * fetchlist
   */
  @Bind()
  fetchList(page = {}) {
    const { dispatch, riskAssessmentList = {} } = this.props;
    const { pagination = {} } = riskAssessmentList;
    const formValues = this.form ? this.form.getFieldsValue() : {};
    const creationDateFrom = formValues.creationDateFrom
      ? formValues.creationDateFrom.format(DEFAULT_DATETIME_FORMAT)
      : null;
    const creationDateTo = formValues.creationDateTo
      ? formValues.creationDateTo.format(DEFAULT_DATETIME_FORMAT)
      : null;
    const { paymentDateFrom, paymentDateTo } = formValues;
    const searchCondition = filterNullValueObject({
      ...formValues,
      creationDateFrom,
      creationDateTo,
      paymentDateFrom: paymentDateFrom ? moment(paymentDateFrom).format(DATETIME_MIN) : null,
      paymentDateTo: paymentDateTo ? moment(paymentDateTo).format(DATETIME_MAX) : null,
    });
    dispatch({
      type: 'collectionRecord/fetchList',
      payload: {
        page: { ...pagination, ...page },
        ...searchCondition,
        customizeUnitCode: 'SFIN.COLLECTION_RECORD.LIST_FILTER_FORM,SFIN.COLLECTION_RECORD.LIST',
      },
    });
  }

  /**
   * 搜索
   */
  @Bind()
  handleSearch() {
    this.fetchList({ current: 1, pageSize: 10 });
  }

  render() {
    const {
      collectionRecord = {},
      fetchListLoading = false,
      customizeTable,
      customizeFilterForm,
      enumMap = {},
    } = this.props;
    const { list = [], pagination = {} } = collectionRecord;
    const columnsTem = [
      {
        title: intl.get(`${promptCode}.view.message.model.erpReceivedPayNum`).d('ERP收款单号'),
        dataIndex: 'erpPaymentNum',
        key: 'erpPaymentNum',
        width: 150,
      },
      {
        title: intl.get(`${promptCode}.paymentStatusSupplier`).d('收款状态'),
        dataIndex: 'paymentStatusMeaning',
        key: 'paymentStatusMeaning',
        width: 100,
      },
      {
        title: intl.get(`sfin.payment.common.type`).d('类型'),
        dataIndex: 'paymentTypeMeaning',
        key: 'paymentTypeMeaning',
        width: 150,
      },
      {
        title: intl.get(`${promptCode}.view.message.model.paymentRecord.fiscalYear`).d('会计年度'),
        dataIndex: 'fiscalYear',
        key: 'fiscalYear',
        width: 150,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.customer`).d('客户'),
        dataIndex: 'companyName',
        key: 'companyName',
        width: 150,
      },
      {
        title: intl.get(`entity.business.tag`).d('业务实体'),
        dataIndex: 'ouName',
        key: 'ouName',
        width: 150,
      },
      {
        title: intl.get(`${promptCode}.model.supplierNumForSupplier`).d('公司编码'),
        dataIndex: 'supplierNum',
        key: 'supplierNum',
        width: 150,
      },
      {
        title: intl.get(`${promptCode}.model.supplierNameForSupplier`).d('公司名称'),
        dataIndex: 'supplierName',
        key: 'supplierName',
        width: 240,
      },
      {
        title: intl.get(`${promptCode}.model.supplierSiteNameForSupplier`).d('公司地址'),
        dataIndex: 'supplierSiteName',
        key: 'supplierSiteName',
        width: 240,
      },
      {
        title: intl.get(`sfin.payment.common.paymentAmountForSupplier`).d('收款金额'),
        dataIndex: 'paymentAmount',
        key: 'paymentAmount',
        width: 150,
        render: (text, record) => thousandBitSeparator(text, record.amountPrecision),
      },
      {
        title: intl.get(`sfin.payment.common.currencyName`).d('币种'),
        dataIndex: 'currencyCode',
        key: 'currencyCode',
        width: 150,
      },
      {
        title: intl.get(`sfin.payment.common.paymentDateForSupplier`).d('收款日期'),
        dataIndex: 'paymentDate',
        key: 'paymentDate',
        width: 150,
        render: dateRender,
      },
      {
        title: intl.get(`sfin.payment.common.sourceCodeForSupplier`).d('收款款方式'),
        dataIndex: 'paymentWayName',
        key: 'paymentWayName',
        width: 150,
      },
      {
        title: intl.get(`sfin.payment.connectPaymentNumSupplier`).d('关联收款申请'),
        dataIndex: 'paymentNum',
        key: 'paymentNum',
        render: (val, record) => (
          <Link to={`/sfin/collection-record/receive-pay-query/detail/${record.paymentHeaderId}`}>
            {val}
          </Link>
        ),
      },
      {
        title: intl
          .get(`${promptCode}.view.message.model.paymentRecord.associatedInvoice`)
          .d('关联发票'),
        dataIndex: 'paymentRecordId',
        key: 'paymentRecordId',
        render: (val, record) => (
          <Link to={`/sfin/collection-record/detail/${record.paymentRecordId}`}>
            {intl.get(`${promptCode}.view.message.model.paymentRecord.look`).d('查看')}
          </Link>
        ),
      },
      {
        title: intl.get(`sfin.payment.common.remark`).d('备注 '),
        dataIndex: 'remark',
        key: 'remark',
        width: 150,
      },
    ];
    const columns = columnsTem;
    const fiterProps = {
      bindForm: this.bindForm,
      handleSearch: this.handleSearch,
      enumMap,
      customizeFilterForm,
    };
    const scrollX = sum(columns.map((item) => (isNumber(item.width) ? item.width : 0))) + 150;
    const tableProps = {
      columns,
      dataSource: list,
      bordered: true,
      loading: fetchListLoading,
      scroll: { x: scrollX },
      pagination,
      onChange: this.fetchList,
    };
    return (
      <React.Fragment>
        <Header
          title={intl.get(`${promptCode}.view.message.title.myCollectionRecord`).d('我的收款记录')}
        />
        <Content>
          <div className="table-list-search">
            <FilterForm {...fiterProps} />
          </div>
          {customizeTable(
            {
              code: 'SFIN.COLLECTION_RECORD.LIST',
            },
            <Table {...tableProps} />
          )}
        </Content>
      </React.Fragment>
    );
  }
}
