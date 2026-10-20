/**
 * RiskAssessmentList -风险评估 列表页
 * @date: 2019-12-4
 * @author guozhiqiang <zhiqiang.guo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import React from 'react';
import { Bind, Throttle } from 'lodash-decorators';
import { isNumber, sum } from 'lodash';
import { Table, Button, Modal } from 'hzero-ui';
import { connect } from 'dva';
import moment from 'moment';
import { Link, routerRedux } from 'dva/router';
import intl from 'utils/intl';
import { stringify } from 'querystring';
import { dateRender } from 'utils/renderer';
import notification from 'utils/notification';
import { filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';
import { DEFAULT_DATETIME_FORMAT, DATETIME_MIN, DATETIME_MAX } from 'utils/constants';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import withCustomize from 'srm-front-cuz/lib/h0Customize';

import { thousandBitSeparator } from '@/routes/utils';
import FilterForm from './FilterForm';

const promptCode = 'sfin.paymentRecord';

@connect(({ loading = {}, paymentRecord = {} }) => ({
  loading:
    loading.effects['paymentRecord/fetchList'] || loading.effects['paymentRecord/deleteList'],
  enumMap: paymentRecord.enumMap || {},
  paymentRecord,
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
    'ssta.supplySettlePool',
  ],
})
@withCustomize({
  unitCode: ['SFIN.PAYMENT_RECORD.LIST', 'SFIN.PAYMENT_RECORD.LIST_FILTER_FORM'],
})
export default class extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedRows: [],
    };
  }

  form;

  componentDidMount() {
    this.fetchList();
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'paymentRecord/updateState',
      payload: { list: [], pagination: {} },
    });
  }

  // FilterForm绑定到这里
  @Bind()
  bindForm(form) {
    this.form = form;
  }

  @Bind()
  redirectDetail(record) {
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `/sfin/pay-record/pay-query/detail/${record.paymentHeaderId}`,
      })
    );
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
      type: 'paymentRecord/fetchList',
      payload: {
        page: { ...pagination, ...page },
        ...searchCondition,
        customizeUnitCode: 'SFIN.PAYMENT_RECORD.LIST_FILTER_FORM,SFIN.PAYMENT_RECORD.LIST',
      },
    });
    this.setState({ selectedRows: [] });
  }

  /**
   * 搜索
   */
  @Bind()
  handleSearch() {
    this.fetchList({ current: 1, pageSize: 10 });
  }

  @Bind()
  onSelectedRowChange(selectedRowKeys, selectedRows) {
    this.setState({
      selectedRows,
    });
  }

  @Bind()
  @Throttle(1000)
  batchimport() {
    const { history } = this.props;
    history.push({
      pathname: '/sfin/pay-record/data-import/SFIN.PAYMENT_RECORD_IMPORT',
      search: stringify({
        action: intl.get('hzero.common.viewtitle.batchImport').d('批量导入'),
        backPath: '/sfin/pay-record/list',
        args: JSON.stringify({
          tenantId: getCurrentOrganizationId(),
          templateCode: 'SFIN.SUPPLIER_DEDUCTION_IMPORT',
        }),
      }),
    });
  }

  // 删除
  @Bind()
  @Throttle(1000)
  onDelete() {
    const { dispatch } = this.props;
    const { selectedRows = [] } = this.state;
    if (selectedRows.some((item) => item.sourceCode === 'SRM')) {
      Modal.confirm({
        title: intl.get('hzero.common.message.confirm.remove').d('确定删除选中数据？'),
        onOk: () => {
          dispatch({
            type: `paymentRecord/deleteList`,
            payload: selectedRows,
          }).then((res) => {
            if (res) {
              notification.success();
              this.handleSearch();
            }
          });
        },
      });
    } else {
      notification.error({
        message: intl
          .get(`sfin.payment.common.checkSRM`)
          .d('当前勾选的数据来源于外部系统，无法删除，请检查！'),
      });
    }
  }

  render() {
    const {
      paymentRecord = {},
      loading = false,
      enumMap = {},
      customizeTable,
      customizeFilterForm,
    } = this.props;
    const { selectedRows = [] } = this.state;
    const { list = [], pagination = {} } = paymentRecord;
    const selectedRowKeys = selectedRows.map((n) => n.paymentRecordId);
    const rowSelection = { selectedRowKeys, onChange: this.onSelectedRowChange };
    const columnsTem = [
      {
        title: intl
          .get(`${promptCode}.view.message.model.paymentRecord.erpPaymentNum`)
          .d('ERP付款单号'),
        dataIndex: 'erpPaymentNum',
        key: 'erpPaymentNum',
        width: 150,
      },
      {
        title: intl
          .get(`${promptCode}.view.message.model.paymentRecord.paymentStatus`)
          .d('付款状态'),
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
        title: intl.get(`entity.company.tag`).d('公司'),
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
        title: intl.get(`entity.supplier.code`).d('供应商编码'),
        dataIndex: 'supplierNum',
        key: 'supplierNum',
        width: 150,
      },
      {
        title: intl.get(`entity.supplier.name`).d('供应商名称'),
        dataIndex: 'supplierName',
        key: 'supplierName',
        width: 240,
      },
      {
        title: intl.get(`sfin.invoiceBill.model.invoiceBill.supplierSiteName`).d('供应商地点'),
        dataIndex: 'supplierSiteName',
        key: 'supplierSiteName',
        width: 240,
      },
      {
        title: intl.get(`sfin.payment.common.paymentAmount`).d('付款金额'),
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
        title: intl.get(`sfin.payment.common.paymentDate`).d('付款日期'),
        dataIndex: 'paymentDate',
        key: 'paymentDate',
        width: 150,
        render: dateRender,
      },
      {
        title: intl.get(`sfin.payment.common.sourceCode`).d('付款方式'),
        dataIndex: 'paymentWayName',
        key: 'paymentWayName',
        width: 150,
      },
      {
        title: intl.get(`sfin.payment.common.connectPaymentNum`).d('关联付款申请'),
        dataIndex: 'paymentNum',
        key: 'paymentNum',
        width: 150,
        render: (val, record) => <a onClick={() => this.redirectDetail(record)}>{val}</a>,
      },
      {
        title: intl
          .get(`${promptCode}.view.message.model.paymentRecord.associatedInvoice`)
          .d('关联发票'),
        dataIndex: 'paymentRecordId',
        key: 'paymentRecordId',
        render: (val, record) => (
          <Link to={`/sfin/pay-record/detail/${record.paymentRecordId}`}>
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
      {
        title: intl.get(`sfin.payment.common.dataSource`).d('数据来源'),
        dataIndex: 'sourceCode',
        key: 'sourceCode',
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
      loading,
      scroll: { x: scrollX },
      rowSelection,
      pagination,
      rowKey: 'paymentRecordId',
      onChange: this.fetchList,
    };
    return (
      <React.Fragment>
        <Header
          title={intl.get(`${promptCode}.view.message.title.myPaymentRecord`).d('我的付款记录')}
        >
          <Button onClick={() => this.batchimport()} loading={loading}>
            {intl.get('hzero.common.viewtitle.batchImport').d('批量导入')}
          </Button>
          <Button onClick={() => this.onDelete()} loading={loading}>
            {intl.get('hzero.common.button.delete').d('删除')}
          </Button>
        </Header>
        <Content>
          <div className="table-list-search">
            <FilterForm {...fiterProps} />
          </div>
          {customizeTable(
            {
              code: 'SFIN.PAYMENT_RECORD.LIST',
            },
            <Table {...tableProps} />
          )}
        </Content>
      </React.Fragment>
    );
  }
}
