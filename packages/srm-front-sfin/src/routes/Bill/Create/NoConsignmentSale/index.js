/**
 * CreateIndex - 非寄销开票单创建
 * @date: 2018-12-3
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Tooltip, Icon } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isUndefined, isEmpty } from 'lodash';

import intl from 'utils/intl';
import EditTable from 'components/EditTable';
import {
  filterNullValueObject,
  getCurrentOrganizationId,
  getUserOrganizationId,
} from 'utils/utils';
import { yesOrNoRender, dateRender } from 'utils/renderer';
import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';

import { thousandBitSeparator, thousandBitSeparatorCut } from '@/routes/utils';
import FilterForm from './FilterForm';
import ActionHistory from '../../../CreateInvoiceNotification/actionHistory';

const promptCode = 'sfin.invoiceBill';
@connect(({ loading, bill, user: { currentUser } }) => ({
  bill,
  currentUser,
  organizationId: getCurrentOrganizationId(),
  supplierOrganizationId: getUserOrganizationId(),
  loading: loading.effects['bill/fetchWork'],
}))
export default class NoConsignmentSale extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      data: {},
      businessTypeValueDefault: '',
      businessTypeMeaningDefault: '',
      initedLoading: true,
      initLoadData: true,
    };
  }

  componentDidMount() {
    this.queryFlagList();
    this.querydateRange();
    this.chooseInterface();
    const { onRef } = this.props;
    if (onRef) onRef(this);
    window.addEventListener('message', this.customizeBtnRefresh);
  }

  componentDidUpdate(prevProps, prevState) {
    const { custConfig } = this.props;
    const { businessTypeValueDefault, businessTypeMeaningDefault } = this.state;
    // 业务规则查询完成时触发
    const initChanged = this.state.initedLoading === false && prevState.initedLoading === true;
    // 个性化完成时触发
    const custChanged = prevProps.custLoading === true && this.props.custLoading === false;
    const { fields = [] } = custConfig?.['SFIN.BILL_CREATE_LIST.FILTER'] || {};
    if (
      (initChanged && this.props.custLoading === false && !isEmpty(fields)) ||
      (custChanged && this.state.initedLoading === false)
    ) {
      // 获取业务类别默认值
      const businessTypeObj = fields.find((item) => item.fieldCode === 'businessType');
      const { defaultValue, defaultValueMeaning } = businessTypeObj || {};
      const { defaultValue: cuszDateRangeDefault } =
        fields.find((item) => item.fieldCode === 'dateRange') || {};
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState(
        {
          cuszDateRangeDefault,
          businessTypeValueDefault: defaultValue || businessTypeValueDefault,
          businessTypeMeaningDefault: defaultValueMeaning || businessTypeMeaningDefault,
        },
        () => {
          this.handleSearchWork();
        }
      );
    }
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({ type: 'bill/updateState', payload: { createRowKeys: [], createRows: [] } });
    window.removeEventListener('message', this.customizeBtnRefresh);
  }

  // 接收二开项目监听事件的刷新
  customizeBtnRefresh = (e) => {
    if (e?.origin === window.location.origin) {
      if (e?.data === 'create_bill_refresh') {
        this.handleSearchWork();
      } else if (e?.data === 'create_bill_forceUpdate') {
        this.forceUpdate();
      }
    }
  };

  /**
   * 保存选中的行
   * @param {Array} selectedRowKeys
   * @param {Array} selectedRows 行数据
   */
  @Bind()
  onSelectChange(selectedRowKeys, selectedRows) {
    const {
      dispatch,
      bill: { workData },
    } = this.props;
    const { content = [] } = workData;
    const { form } = this.filterForm.props;
    const businessType = form?.getFieldValue('businessType');
    const rowKey = businessType === 'ACCEPT' ? 'acceptListLineId' : 'rcvTrxLineId';
    const newContent = content.map((item) => {
      const { _status, ...record } = item;
      return selectedRowKeys.includes(item[rowKey]) ? { ...record, _status: 'update' } : record;
    });
    dispatch({
      type: 'bill/updateState',
      payload: {
        createRowKeys: selectedRowKeys,
        createRows: selectedRows,
        workData: { ...workData, content: newContent },
      },
    });
  }

  /**
   * 查询是否值集
   */
  @Bind()
  queryFlagList() {
    const { dispatch } = this.props;
    dispatch({ type: 'bill/queryFlagList' });
  }

  /**
   * 查询对账事务日期范围值集
   */
  @Bind()
  querydateRange() {
    const { dispatch } = this.props;
    dispatch({ type: 'bill/fetchdateRange' });
  }

  @Bind()
  chooseInterface() {
    const { dispatch, organizationId } = this.props;
    dispatch({
      type: 'bill/defaultFetchBusinessType',
      payload: { organizationId },
    }).then((res = {}) => {
      if (res) {
        this.setState({
          businessTypeValueDefault: res.businessType,
          businessTypeMeaningDefault: res.businessTypeMeaning,
          initedLoading: false,
        });
        // form.setFieldsValue({
        //   businessType: res.businessType,
        //   businessTypeMeaning: res.businessTypeMeaning,
        // });
        // this.handleSearchWork();
      }
    });
  }

  /**
   * 查询事务行数据
   * @param {object} params - 查询参数
   */
  @Bind()
  handleSearchWork(params = {}, _, sort = {}, clearSort = false) {
    if (clearSort) {
      const notes = Array.from(document.getElementsByClassName('on'));
      for (const v of notes) {
        v.className = v.className.replace('on', 'off');
      }
    }
    const {
      dispatch,
      organizationId,
      bill: { workPagination = {}, workData = {} },
    } = this.props;
    const { form } = this.filterForm.props;
    const { dateRange, businessType, trxDateFrom, trxDateTo, ...formValues } = isUndefined(form)
      ? {}
      : filterNullValueObject(form.getFieldsValue());
    const filterValues = {
      ...formValues,
      businessType,
      trxDateFrom: trxDateFrom ? trxDateFrom.format(DATETIME_MIN) : undefined,
      trxDateTo: trxDateTo ? trxDateTo.format(DATETIME_MAX) : undefined,
    };
    dispatch({
      type: businessType === 'ACCEPT' ? 'bill/fetchAcceptanceForm' : 'bill/fetchWork',
      payload: {
        sort,
        organizationId,
        page: isEmpty(params) ? workPagination : params,
        ...filterValues,
        businessType,
        customizeUnitCode: 'SFIN.BILL_CREATE_LIST.GRID,SFIN.BILL_CREATE_LIST.FILTER',
      },
    }).then((res = {}) => {
      if (res) {
        const newContent = (res.content || []).map((item) => {
          return {
            ...item,
            trxType:
              businessType === 'ACCEPT'
                ? `${intl.get('sfin.invoiceBill.model.invoiceBill.AcceptHeader').d('验收单')}`
                : item.trxType,
            orderTypeName:
              businessType === 'ACCEPT'
                ? `${intl.get('sfin.invoiceBill.model.invoiceBill.agreement').d('协议')}`
                : item.orderTypeName,
          };
        });
        dispatch({
          type: 'bill/updateState',
          payload: {
            workData: { ...workData, content: newContent },
          },
        });
        this.setState({ initLoadData: false });
      }
    });
  }

  /**
   * 计算table列宽度
   * @param {Array} columns 列
   * @param {Number} fixWidth 固定列宽度
   */
  @Bind()
  scrollWidth(columns, fixWidth) {
    const total = columns.reduce((prev, current) => prev + (current.width ? current.width : 0), 0);
    return total + fixWidth + 1;
  }

  @Bind
  handleOperationRecord(record) {
    this.setState({
      visible: true,
      data: record,
    });
  }

  @Bind
  hideModal(flag) {
    this.setState({
      visible: flag,
    });
  }

  render() {
    const {
      loading,
      customizeTable,
      organizationId,
      supplierOrganizationId,
      currentUser: { id },
      bill: {
        workData: { content = [] },
        workPagination = {},
        createRowKeys,
        flagList = [],
        dateRange,
      },
      customizeFilterForm,
    } = this.props;
    const {
      businessTypeValueDefault,
      businessTypeMeaningDefault,
      cuszDateRangeDefault,
      initLoadData,
    } = this.state;
    const { form } = isUndefined(this.filterForm) ? {} : this.filterForm.props;
    const businessType = isUndefined(form) ? {} : form.getFieldValue('businessType');
    const filterProps = {
      dateRange,
      userId: id,
      organizationId,
      supplierOrganizationId,
      flagList,
      onSearch: this.handleSearchWork,
      onRef: (ref) => {
        this.filterForm = ref;
      },
      customizeFilterForm,
      businessTypeValueDefault,
      businessTypeMeaningDefault,
      cuszDateRangeDefault,
      initLoadData,
    };
    const rowSelection = {
      selectedRowKeys: createRowKeys,
      onChange: this.onSelectChange,
    };
    const { visible, data } = this.state;
    const columns = [
      {
        title: intl.get(`${promptCode}.model.invoiceBill.trxAndLineNum`).d('事务编号|行号'),
        dataIndex: 'trxAndLineNum',
        width: 180,
        fixed: 'left',
        sorter: true,
      },
      {
        title: intl.get('entity.item.code').d('物料编码'),
        dataIndex: 'itemCode',
        width: 120,
        fixed: 'left',
        sorter: true,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.itemName`).d('物料描述'),
        dataIndex: 'itemName',
        width: 150,
        fixed: 'left',
        sorter: true,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.supplierItemNum`).d('供应商料号'),
        dataIndex: 'supplierItemNum',
        width: 150,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.supplierItemDesc`).d('供应商料号描述'),
        dataIndex: 'supplierItemDesc',
        width: 180,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.specificationsAndModel`).d('规格型号'),
        dataIndex: 'specificationsAndModel',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.unit`).d('单位'),
        dataIndex: 'unit',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.supplier.invoiceTitle`).d('开票主体'),
        dataIndex: 'invoiceTitle',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.invoiceQuantityAvailable`).d('可开票数量'),
        dataIndex: 'invoiceQuantityAvailable',
        width: 120,
        render: (text) => thousandBitSeparator(text),
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.businessType`).d('业务类别'),
        dataIndex: 'businessTypeMeaning',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.netPrice`).d('不含税单价'),
        dataIndex: 'netPrice',
        align: 'right',
        render: (text, record) =>
          record.priceShieldFlag === 1
            ? record.netPriceMeaning
            : thousandBitSeparatorCut(record.netPrice, record.pricePrecision),
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.unitPriceBatch`).d('每'),
        dataIndex: 'unitPriceBatch',
        width: 75,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.netAmount`).d('不含税金额'),
        dataIndex: 'netAmount',
        align: 'right',
        render: (text, record) =>
          record.priceShieldFlag === 1
            ? record.netAmountMeaning
            : thousandBitSeparator(record.netAmount, record.amountPrecision),
      },
      {
        title: `${intl.get(`${promptCode}.model.invoiceBill.taxRate`).d('税率')}（%）`,
        dataIndex: 'taxRate',
        width: 120,
        sorter: true,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.taxIncludedPrice`).d('含税单价'),
        dataIndex: 'taxIncludedPrice',
        align: 'right',
        render: (text, record) =>
          record.priceShieldFlag === 1
            ? record.taxIncludedPriceMeaning
            : thousandBitSeparatorCut(record.taxIncludedPrice, record.pricePrecision),
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.taxIncludedAmount`).d('含税金额'),
        dataIndex: 'taxIncludedAmount',
        align: 'right',
        render: (text, record) =>
          record.priceShieldFlag === 1
            ? record.taxIncludedAmountMeaning
            : thousandBitSeparator(record.taxIncludedAmount, record.amountPrecision),
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.taxAmount`).d('税额'),
        dataIndex: 'taxAmount',
        align: 'right',
        render: (text, record) =>
          record.priceShieldFlag === 1
            ? record.taxAmountMeaning
            : thousandBitSeparator(record.taxAmount, record.amountPrecision),
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.currencyCode`).d('币种'),
        dataIndex: 'currencyCode',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.trxType`).d('事务类型'),
        dataIndex: 'trxType',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.parentNumber`).d('父事务编号|行号'),
        dataIndex: 'parentNumber',
        width: 130,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.asnNumAndAsnLineNum`).d('送货单号|行号'),
        dataIndex: 'asnNumAndAsnLineNum',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.poNumAndLineNum`).d('订单号|行号'),
        dataIndex: 'poNumAndLineNum',
        width: 120,
        sorter: true,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.displayLine`).d('发运行'),
        dataIndex: 'displayLineLocationNum',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.displayReleaseNum`).d('发放号'),
        dataIndex: 'displayReleaseNum',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.orderTypeName`).d('订单类型'),
        dataIndex: 'orderTypeName',
        width: 100,
        sorter: true,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.companyName`).d('客户公司'),
        dataIndex: 'companyName',
        width: 120,
        sorter: true,
      },
      {
        title: intl.get('entity.business.tag').d('业务实体'),
        dataIndex: 'ouName',
        width: 120,
        sorter: true,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.purchaseOrgName`).d('采购组织'),
        dataIndex: 'purchaseOrgName',
        width: 120,
        sorter: true,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.organizationName`).d('库存组织'),
        dataIndex: 'organizationName',
        width: 120,
        sorter: true,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.inventoryName`).d('库房'),
        dataIndex: 'inventoryName',
        width: 120,
        sorter: true,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.purAgentName`).d('采购员'),
        dataIndex: 'purAgentName',
        width: 120,
        sorter: true,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.supplierNum`).d('供应商编码'),
        dataIndex: 'supplierNum',
        width: 120,
        sorter: true,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.supplierName`).d('供应商名称'),
        dataIndex: 'supplierName',
        // width: 150,
        sorter: true,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.supplierSiteName`).d('供应商地点'),
        dataIndex: 'supplierSiteName',
        width: 120,
      },
      // {
      //   title: intl.get(`${promptCode}.model.invoiceBill.trxDate`).d('事务日期'),
      //   dataIndex: 'trxDate',
      //   width: 150,
      // },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.trxYear`).d('事务年度'),
        dataIndex: 'trxYear',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.partnerName`).d('出票方'),
        dataIndex: 'partnerName',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.sourceCode`).d('数据来源代码'),
        dataIndex: 'sourceCode',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.externalSystemCode`).d('外部来源系统代码'),
        dataIndex: 'externalSystemCode',
        width: 140,
      },
      {
        title: intl
          .get(`${promptCode}.model.invoiceBill.sourceOrderTypeName`)
          .d('对账数据来源单据类型'),
        dataIndex: 'sourceOrderTypeNameMeaing',
        width: 140,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.trxDate`).d('事务日期'),
        dataIndex: 'trxDate',
        width: 120,
        render: dateRender,
        sorter: true,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.needInvoiceFlag`).d('移除标识'),
        dataIndex: 'needInvoiceFlag',
        width: 90,
        render: (text, { undoRemoveFlag }) => {
          if (!undoRemoveFlag) {
            return text === 1 ? yesOrNoRender(0) : yesOrNoRender(1);
          }
          return (
            <span>
              {text === 1 ? yesOrNoRender(0) : yesOrNoRender(1)}
              &nbsp;&nbsp;&nbsp;&nbsp;
              <Tooltip
                placement="topRight"
                title={intl
                  .get(`${promptCode}.model.invoiceBill.undoRemoveFlag`)
                  .d('该数据进行过移除，请注意！')}
              >
                <Icon type="exclamation-circle-o" style={{ color: 'red' }} />
              </Tooltip>
            </span>
          );
        },
      },
      {
        title: intl.get(`hzero.common.button.operating`).d('操作记录'),
        width: 100,
        fixed: 'right',
        name: 'taxInvoiceLineId',
        render: (record) => {
          if (!record.rcvTrxLineId) {
            return '-';
          }
          return (
            <a color="#29BECE" onClick={() => this.handleOperationRecord(record)}>
              {intl.get(`hzero.common.button.operating`).d('操作记录')}
            </a>
          );
        },
      },
    ];

    const actionHistory = {
      visible,
      data,
      hideModal: this.hideModal,
    };
    return (
      <React.Fragment>
        <div className="table-list-search">
          <FilterForm {...filterProps} />
        </div>
        {customizeTable(
          {
            code: 'SFIN.BILL_CREATE_LIST.GRID',
          },
          <EditTable
            bordered
            loading={loading}
            rowKey={businessType === 'ACCEPT' ? 'acceptListLineId' : 'rcvTrxLineId'}
            columns={columns}
            dataSource={content}
            pagination={workPagination}
            rowSelection={rowSelection}
            onChange={this.handleSearchWork}
            scroll={{ x: this.scrollWidth(columns, 900) }}
            // scroll={{ x: 5000 }}
          />
        )}
        {visible && <ActionHistory {...actionHistory} />}
      </React.Fragment>
    );
  }
}
