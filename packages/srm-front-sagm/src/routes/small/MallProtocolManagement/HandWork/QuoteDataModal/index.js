import React, { Component } from 'react';
import { Modal } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { connect } from 'dva';
// import uuidv4 from 'uuid/v4';

import intl from 'utils/intl';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import { DATETIME_MAX, DATETIME_MIN } from 'utils/constants';
import notification from 'utils/notification';

import { getUnitListByMatchIds } from '@/services/mallProtocolManagementService';
import FormList from '../../../QuotePriceLib/FormList';
import TableList from '../../../QuotePriceLib/TableList';
import { isCustomNumber } from '@/utils/precision';
import styles from './index.less';

const organizationId = getCurrentOrganizationId();

@connect(({ mallProtocolManagement, loading }) => ({
  mallProtocolManagement,
  loading: loading.effects['mallProtocolManagement/fetchQuoteData'],
}))
export default class QuoteDataModal extends Component {
  constructor(props) {
    super(props);
    const { quoteType = 'PRICE' } = props;
    const _type = quoteType === 'PRICE' ? 'price' : 'purchase';
    this.state = {
      selectedRowKeys: [],
      selectedRows: [],
      type: _type,
      rowKey: _type === 'price' ? 'matchId' : 'agreementProductMatchId',
    };
  }

  queryKeyMap = {
    'price-sourceNum': {
      field: 'sourceNum',
      title: intl.get(`small.common.model.sourceNum`).d('寻源单号'),
    },
    'purchase-sourceNum': {
      field: 'pcNum',
      title: intl.get(`small.common.model.AgreementNameCode`).d('协议编码/名称'),
    },
    'price-dateFrom': { field: 'validDateFrom' },
    'purchase-dateFrom': { field: 'startDateActive' },
    'price-dateTo': { field: 'validDateTo' },
    'purchase-dateTo': { field: 'endDateActive' },
    'price-taxRate': { field: 'taxRate' },
    'purchase-taxRate': { field: 'tax' },
    'price-taxPrice': { field: 'taxPrice' },
    'price-unitPrice': { field: 'unitPrice' },
    'purchase-taxPrice': { field: 'taxIncludedUnitPrice' },
    'price-itemCategory': { field: 'itemCategoryName' },
    'purchase-itemCategory': { field: 'categoryName' },
    'price-itemCategoryId': { field: 'itemCategoryId' },
    'purchase-itemCategoryId': { field: 'categoryId' },
    'price-ladderList': { field: 'priceLibMatchLadderList' },
    'purchase-ladderList': { field: 'agreementLadders' },
  };

  form;

  @Bind()
  handleBindRef(ref = {}) {
    this.form = ref.props.form || {};
  }

  // 查询当前数据
  @Bind()
  fetchListData(page = { page: 0, size: 10 }) {
    const { tableDs, dispatch, priceLibParams = {}, mallProtocolManagement = {} } = this.props;
    const { initData = {} } = mallProtocolManagement;
    const { type, rowKey, selectedRowKeys } = this.state;
    const existMatchIds = tableDs ? tableDs.toData().map((m) => m.sourceFromId) : [];
    const params = this.form
      ? this.form.getFieldsValue()
      : {
          effectiveFlag: 1,
          // companyName: initData.companyName,
          // supplierCompanyName: initData.supplierCompanyName,
          companyId: initData.companyId || priceLibParams.companyId,
          supplierCompanyId: initData.supplierCompanyId || priceLibParams.supplierCompanyId,
        };
    dispatch({
      type: 'mallProtocolManagement/fetchQuoteData',
      payload: {
        page,
        tenantId: organizationId,
        ...params,
        [this.queryKeyMap[`${type}-dateFrom`].field]: params[
          this.queryKeyMap[`${type}-dateFrom`].field
        ]
          ? params[this.queryKeyMap[`${type}-dateFrom`].field].format(DATETIME_MIN)
          : undefined,
        [this.queryKeyMap[`${type}-dateTo`].field]: params[this.queryKeyMap[`${type}-dateTo`].field]
          ? params[this.queryKeyMap[`${type}-dateTo`].field].format(DATETIME_MAX)
          : undefined,
        existMatchIds,
      },
    }).then((res) => {
      if (
        res &&
        res.content &&
        selectedRowKeys.length > 0 &&
        selectedRowKeys.some((s) => res.content.map((c) => c[rowKey]).some((c) => c === s))
      ) {
        this.isFull();
      }
    });
  }

  @Bind()
  handleSearch() {
    this.setState({
      selectedRowKeys: [],
      selectedRows: [],
    });
    this.fetchListData();
  }

  // 勾选事件
  @Bind()
  handleSelectChange(keys, rows) {
    const { selectedRows, rowKey } = this.state;
    const newRows = [...selectedRows];

    // 将勾选行存储
    rows.forEach((row) => {
      if (selectedRows.every((r) => r[rowKey] !== row[rowKey])) {
        newRows.push(row);
      }
    });
    this.setState({
      selectedRowKeys: keys,
      selectedRows: newRows.filter((f) => keys.includes(f[rowKey])), // 将取消勾选的行过滤
    });
  }

  /**
   * 判断新建后对应协议行数据不可编辑且必输的字段是否有值
   */
  @Bind()
  isFull() {
    const { rowKey, selectedRows, selectedRowKeys } = this.state;
    const {
      dispatch,
      mallProtocolManagement: { quoteData },
    } = this.props;
    const notFull =
      selectedRows.filter((item) => {
        const {
          taxRate,
          ladderFlag,
          itemName,
          validDateTo,
          validDateFrom,
          uomName,
          taxPrice,
          unitPrice,
          currencyName,
        } = item;
        const fieldsList = [
          { field: 'taxRate', value: isCustomNumber(taxRate) ? 1 : 0 },
          { field: 'itemName', value: itemName ? 1 : 0 },
          { field: 'validDateFrom', value: validDateFrom ? 1 : 0 },
          { field: 'validDateTo', value: validDateTo ? 1 : 0 },
          { field: 'uomName', value: uomName ? 1 : 0 },
          { field: 'currencyName', value: currencyName ? 1 : 0 },
          { field: 'unitPrice', value: isCustomNumber(unitPrice) ? 1 : 0 },
          { field: 'taxPrice', value: isCustomNumber(taxPrice) || ladderFlag === 1 ? 1 : 0 },
        ];
        const filterList = fieldsList.filter((f) => f.value === 0);
        const nullFields = filterList.map((f) => f.field);
        const ind = quoteData.findIndex((f) => f[rowKey] === item[rowKey]);
        if (ind !== -1) quoteData[ind] = { ...item, nullFields };
        return filterList.length > 0;
      }).length > 0;
    dispatch({
      type: 'mallProtocolManagement/updateState',
      payload: {
        quoteData: quoteData.map((item) => {
          return selectedRowKeys.includes(item[rowKey]) ? item : { ...item, nullFields: null };
        }),
      },
    });
    return notFull;
  }

  // 将勾选行新建
  @Bind()
  async handleCreate() {
    const { selectedRows } = this.state;
    const {
      onOk = (e) => e,
      mallProtocolManagement: { initData = {} },
    } = this.props;
    const validateCompany = selectedRows.some((s) => s.companyId !== initData.companyId);
    const validateSupplier = selectedRows.some(
      (s) => s.supplierCompanyId !== initData.supplierCompanyId
    );
    if (this.isFull()) {
      notification.warning({
        message: intl
          .get('small.mallProtocolManagement.view.needFullFields')
          .d('存在必填字段无值，不可引用'),
      });
      return false;
    }
    if (validateCompany) {
      notification.warning({
        message: intl
          .get('small.mallProtocolManagement.view.warnByPurCompany')
          .d('存在不同的采购方，无法添加'),
      });
      return false;
    }
    if (validateSupplier) {
      notification.warning({
        message: intl
          .get('small.mallProtocolManagement.view.warnBySupplier')
          .d('存在不同的供应商，无法添加'),
      });
      return false;
    }

    this.setState({ createLoading: true });
    const res = getResponse(await getUnitListByMatchIds(selectedRows));
    this.setState({ createLoading: false });
    if (res) {
      onOk(
        res.map((m) => ({
          ...m,
          allRegionFlag: m.allRegionFlag,
          priceValidDateFrom: m.validDateFrom,
          priceValidDateTo: m.validDateTo,
        }))
      );
      this.handleClose();
    }
  }

  @Bind()
  handleClose() {
    const { dispatch, onCancel = (e) => e } = this.props;
    dispatch({
      type: 'mallProtocolManagement/updateState',
      payload: {
        quoteData: [],
        quotePagination: {},
      },
    });
    onCancel();
  }

  componentDidMount() {
    this.fetchListData();
  }

  render() {
    const { loading, visible, tableDs, mallProtocolManagement = {} } = this.props;
    const {
      quoteData,
      quotePagination,
      initData = {},
      flags = [],
      effectiveCodes = [],
    } = mallProtocolManagement;
    const { selectedRows, selectedRowKeys, type, rowKey, createLoading } = this.state;

    const formProps = {
      type,
      flags,
      initData,
      statusCodes: effectiveCodes,
      queryKeyMap: this.queryKeyMap,
      onRef: this.handleBindRef,
      onSearch: this.handleSearch,
    };
    const tableProps = {
      loading,
      type,
      rowKey,
      tableDs,
      selectedRows,
      selectedRowKeys,
      queryKeyMap: this.queryKeyMap,
      dataSource: quoteData,
      pagination: quotePagination,
      onChange: this.fetchListData,
      onSelect: this.handleSelectChange,
    };

    const title =
      type === 'price'
        ? intl.get('small.mallProtocolManagement.view.quotePriceData').d('引用价格库')
        : intl.get('small.mallProtocolManagement.view.quotePurchaseAgreement').d('引用采购协议');

    return (
      <Modal
        wrapClassName={styles['quote-data-list']}
        destroyOnClose
        title={title}
        width={1200}
        visible={visible}
        onOk={this.handleCreate}
        onCancel={this.handleClose}
        confirmLoading={createLoading}
        okButtonProps={{ disabled: selectedRows === 0 }}
      >
        <div className="table-list-search">
          <FormList {...formProps} />
        </div>
        <TableList {...tableProps} />
      </Modal>
    );
  }
}
