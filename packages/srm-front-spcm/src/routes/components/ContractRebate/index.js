import React, { Component, Fragment } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'dva';
import { Form, Input, DatePicker, Button, InputNumber, Modal } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import moment from 'moment';
import formatterCollections from 'utils/intl/formatterCollections';
import { isArray, isEmpty, isUndefined, difference } from 'lodash';
import querystring from 'querystring';

import intl from 'utils/intl';
import TransferLov from 'srm-front-cuz/lib/components/Customize/LovMulti/index';
import { dateRender } from 'utils/renderer';
import {
  tableScrollWidth,
  filterNullValueObject,
  createPagination,
  addItemsToPagination,
  delItemsToPagination,
  getEditTableData,
  getCurrentOrganizationId,
} from 'utils/utils';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import notification from 'utils/notification';
import EditTable from 'components/EditTable';
import CommonImport from 'hzero-front/lib/components/Import';
import PrecisionInputNumber from '@/routes/components/Precision/PrecisionInputNumber';
import { renderThousandthNum, validateBits } from '@/utils/util';

import CompanyModal from '../../PurchaseContactType/components/CompanyModal';

import styles from './index.less';

const FormItem = Form.Item;
const commonPrompt = 'spcm.common.model.common';

/**
 * ContractSubject - 采购协议返利信息
 * @extends {Component} - React.Component
 * @reactProps {Object} form - 表单对象
 * @reactProps {Array} collapseKeys - 折叠面板数组
 * @reactProps {Boolean} editable - 编辑状态
 * @reactProps {Object} dataSource - 数据源
 * @return React.element
 */
@connect(({ loading = {} }) => ({
  queryCompanyLoading: loading.effects['contractCommon/fetchCompany'],
  addCompanyLoading: loading.effects['contractCommon/fetchAddCompany'],
}))
@formatterCollections({
  code: ['sodr.common', 'spcm.common', 'entity.company', 'spcm.purchaseContactType'],
})
@withRouter
export default class ContractRebate extends Component {
  constructor(props) {
    super(props);
    if (props.onRef) {
      props.onRef(this);
    }
    this.state = {
      companyVisible: false, // 公司modal
      companyDataSource: [], // 公司数据
      companyPagination: {}, // 公司分页
      clearCompanyRowsKeys: [], // 公司清除列表key
      clearCompanyRows: [], // 公司清除列
      companyAddDataSource: [], // 新建公司数据
      companyAddPagination: {}, // 新建公司分页
      sureAddCompanyRowsKeys: [], // 新建公司列表key
      sureAddCompanyRows: [], // 新建公司列
      rebateInformationId: null,
      tenantId: getCurrentOrganizationId(),
    };
  }

  /**
   * 改变设置已编辑标识
   */
  @Bind()
  handleChangeFormItem() {
    const { onChangeState } = this.props;
    onChangeState({ pcRebateEdited: true });
  }

  /**
   * handleCompany - 处理公司查看/新增
   */
  @Bind()
  handleOpenCompanyModal(rebateInformationId) {
    this.setState(
      {
        companyVisible: true,
        rebateInformationId,
      },
      () => this.fetchCompany()
    );
  }

  /**
   * 关闭公司模态框
   */
  @Bind()
  hideCompanyModal() {
    this.setState({
      companyVisible: false,
      sureAddCompanyRowsKeys: [],
    });
  }

  /**
   fetchCompany - 查询公司(子账号权限下的公司)
   */
  @Bind()
  fetchCompany(page = {}) {
    const { dispatch } = this.props;
    const { rebateInformationId } = this.state;
    const filterValues = isUndefined(this.companyForm)
      ? {}
      : filterNullValueObject(this.companyForm.getFieldsValue());
    dispatch({
      type: 'contractCommon/fetchCompany',
      payload: {
        rebateInformationId,
        page,
        ...filterValues,
      },
    }).then((res) => {
      if (res) {
        this.setState({
          companyDataSource: res.content.map((n) => ({ ...n, _status: 'update' })), // 公司列表数据
          companyPagination: createPagination(res),
        });
      }
    });
  }

  /**
   * fetchAddCompany - 查询需要新增的公司
   */
  @Bind()
  fetchAddCompany(page = {}) {
    const { companyDataSource = [] } = this.state;
    const { dispatch } = this.props;
    const filterValues = isUndefined(this.companyForm)
      ? {}
      : filterNullValueObject(this.companyForm.getFieldsValue());
    const companyIds = companyDataSource.map((c) => c.companyId).join(',');
    dispatch({
      type: 'contractCommon/fetchAddCompany',
      payload: {
        ...filterValues,
        companyIds,
        page,
      },
    }).then((res) => {
      if (res) {
        this.setState({
          companyAddDataSource: res.content,
          companyAddPagination: createPagination(res),
        });
      }
    });
  }

  /**
   * 删除新建未保存的公司
   */
  @Bind()
  handleClearCompany() {
    const {
      clearCompanyRows,
      companyDataSource,
      companyPagination,
      sureAddCompanyRowsKeys,
    } = this.state;
    Modal.confirm({
      title: intl.get(`spcm.purchaseContactType.view.message.removePurchaseLines`).d('是否清除'),
      onOk: () => {
        const selectedRowKeys = clearCompanyRows.map((item) => item.companyId);
        const filtered = companyDataSource.filter(
          (item) => !selectedRowKeys.includes(item.companyId)
        );
        // 获取删除后未保存数据的key
        const differenceKeys = difference(sureAddCompanyRowsKeys, selectedRowKeys);
        // 需要处理什么时候不能删除
        this.setState({
          sureAddCompanyRowsKeys: differenceKeys,
          clearCompanyRowsKeys: [],
          companyDataSource: filtered,
          companyPagination: delItemsToPagination(
            selectedRowKeys.length,
            companyDataSource.length,
            companyPagination
          ),
        });
      },
    });
    // 进行清除
  }

  /**
   * 确认添加新建未保存的公司
   */
  @Bind()
  handleSureAddCompany() {
    const { companyDataSource, companyPagination, sureAddCompanyRows } = this.state;
    if (sureAddCompanyRows.length > 0) {
      const sureAddCompany =
        sureAddCompanyRows.map((n) => ({ ...n, _status: 'create', enabledFlag: 1 })) || []; // 协议类型确认添加公司
      this.setState({
        companyDataSource: [...companyDataSource, ...sureAddCompany],
        companyPagination: addItemsToPagination(
          sureAddCompany.length,
          companyDataSource.length,
          companyPagination
        ),
        sureAddCompanyRows: [],
      });
    }
  }

  /**
   * 确认保存新建的公司
   */
  @Bind()
  handleSureSaveCompany() {
    const { dispatch, onFetchContractRebate } = this.props;
    const { companyDataSource, rebateInformationId } = this.state;
    const companyData = getEditTableData(companyDataSource, ['_status']);
    dispatch({
      type: 'contractCommon/saveCompany',
      payload: { companyDataSource: companyData, rebateInformationId },
    }).then((res) => {
      if (res) {
        this.setState(
          {
            companyVisible: false,
            sureAddCompanyRowsKeys: [],
          },
          notification.success(),
          onFetchContractRebate()
        );
      }
    });
  }

  /**
   * 公司列表清除勾选回调
   * @param {*}
   * @param {Array} selectedRowKeys - 选中的列表项
   */
  @Bind()
  handleClearCompanyRows(selectedRowKeys, selectedRows) {
    this.setState({
      clearCompanyRowsKeys: selectedRowKeys,
      clearCompanyRows: selectedRows,
    });
  }

  /**
   * 公司列表新增勾选回调
   * @param {*}
   * @param {Array} selectedRowKeys - 选中的列表项
   */
  @Bind()
  handleAddCompanyRows(selectedRowKeys, selectedRows) {
    this.setState({
      sureAddCompanyRowsKeys: selectedRowKeys,
      sureAddCompanyRows: selectedRows,
    });
  }

  /**
   * 判断区间输入是否正确
   */
  @Bind()
  handelCheckRange(form, field) {
    if (field === 'saleRangeFrom') {
      const saleRangeTo = form.getFieldValue('saleRangeTo');
      if (form.getFieldValue('saleRangeFrom') >= saleRangeTo) {
        form.setFieldsValue({ saleRangeFrom: undefined });
      }
    } else if (field === 'saleRangeTo') {
      const saleRangeFrom = form.getFieldValue('saleRangeFrom');
      if (form.getFieldValue('saleRangeTo') <= saleRangeFrom) {
        form.setFieldsValue({ saleRangeTo: undefined });
      }
    }
  }

  // /**
  //  * 判断区间输入是否正确
  //  */
  // @Bind()
  // handelCheckRange(value, form, callback, field) {
  //   if (!isNaN(value) && value) {
  //     if (field === 'saleRangeFrom' && value > form.getFieldValue('saleRangeTo')) {
  //       callback(
  //         intl.get('hzero.c7nProUI.Validator.range_overflow', {
  //           label: intl.get(`spcm.common.model.common.saleRangeFrom`).d('销售额区间从'),
  //           max: intl.get(`spcm.common.model.common.saleRangeTo`).d('销售额区间至'),
  //         })
  //       );
  //     } else if (field === 'saleRangeTo' && value < form.getFieldValue('saleRangeFrom')) {
  //       callback(
  //         intl.get('hzero.c7nProUI.Validator.range_underflow', {
  //           label: intl.get(`spcm.common.model.common.saleRangeTo`).d('销售额区间至'),
  //           min: intl.get(`spcm.common.model.common.saleRangeFrom`).d('销售额区间从'),
  //         })
  //       );
  //     }
  //   }
  // }

  @Bind()
  handleGetCode() {
    const { unitCodeList } = this.props;
    const {
      match: { path },
      location: { search },
    } = this.props?.parentRoute || this.props;
    const routerParams = querystring.parse(search.substr(1));
    if (path === '/spcm/contract-maintain/detail' || routerParams.hasChanged === 'true') {
      return 'SPCM.PURCHASE_CONTRACT_MAINTAIN.REBATE';
    } else {
      // 解耦协议签署和我收到的协议个性化单元，以unitCodeList作为参数进行判断
      if (unitCodeList) {
        return unitCodeList.REBATE;
      }
      return 'SPCM.PURCHASE_CONTRACT_MAINTAIN.REBATE.READONLY';
    }
  }

  /**
   * 表单域监听
   */
  @Bind()
  handleDataChange() {
    const { dispatch = () => {}, formChanged } = this.props;
    if (!formChanged) {
      dispatch({
        type: 'contractCommon/updateState',
        payload: {
          formChanged: true,
        },
      });
    }
  }

  /**
   * 获取列
   */
  @Bind()
  getColumns() {
    const { tenantId } = this.state;
    const {
      editable,
      maintainEditable,
      // headerInfo = {},
      supplierCurrencyCode,
    } = this.props;
    const columnArray = [
      {
        title: intl.get(`spcm.common.model.common.orderSeq`).d('序号'),
        dataIndex: 'lineNum',
        width: 80,
      },
      {
        title: intl.get(`spcm.common.model.common.saleRangeFrom`).d('销售额区间从'),
        dataIndex: 'saleRangeFrom',
        width: 120,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) && (editable || maintainEditable) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`saleRangeFrom`, {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${commonPrompt}.saleRangeFrom`).d('销售额区间从'),
                    }),
                  },
                  {
                    validator: (rule, value, callback) => validateBits(value, callback),
                  },
                ],
                initialValue: record.saleRangeFrom,
              })(
                <PrecisionInputNumber
                  type="hzero"
                  onChange={this.handleChangeFormItem}
                  onBlur={() => this.handelCheckRange(record.$form, 'saleRangeFrom')}
                  currency={supplierCurrencyCode}
                  style={{ width: '100%' }}
                  min={0}
                />
              )}
            </FormItem>
          ) : (
            `${renderThousandthNum(val)}` // 数字0不显示
          ),
      },
      {
        title: intl.get(`spcm.common.model.common.saleRangeTo`).d('销售额区间至'),
        dataIndex: 'saleRangeTo',
        width: 120,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) && (editable || maintainEditable) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`saleRangeTo`, {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${commonPrompt}.saleRangeTo`).d('销售额区间至'),
                    }),
                  },
                  {
                    validator: (rule, value, callback) => validateBits(value, callback),
                  },
                ],
                initialValue: record.saleRangeTo,
              })(
                <PrecisionInputNumber
                  type="hzero"
                  onChange={this.handleChangeFormItem}
                  onBlur={() => this.handelCheckRange(record.$form, 'saleRangeTo')}
                  currency={supplierCurrencyCode}
                  style={{ width: '100%' }}
                  min={0}
                />
              )}
            </FormItem>
          ) : (
            renderThousandthNum(val)
          ),
      },
      {
        title: intl.get(`spcm.common.model.common.annualReturnRate`).d('年度返利率（%）'),
        dataIndex: 'annualReturnRate',
        width: 175,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) && (editable || maintainEditable) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`annualReturnRate`, {
                initialValue: record.annualReturnRate,
                rules: [
                  {
                    required: isNaN(record.$form.getFieldValue('rebateAmount')),
                    validator: (_, value, callback) => {
                      const rebateAmountVal = record.$form.getFieldValue('rebateAmount');
                      if (isNaN(value) && (isNaN(rebateAmountVal) || !rebateAmountVal)) {
                        callback(
                          intl
                            .get('spcm.common.view.message.noAnnualReturnAndrebateAmount')
                            .d('年度返利率和返利金额必填其一')
                        );
                      }
                      callback();
                    },
                  },
                ],
              })(
                <InputNumber
                  onChange={() => {
                    this.handleChangeFormItem();
                    const {
                      $form: { getFieldValue, setFieldsValue },
                    } = record;
                    const rebateAmountVal = getFieldValue('rebateAmount');
                    setFieldsValue({ rebateAmount: rebateAmountVal });
                  }}
                  allowThousandth
                  precision={2}
                  min={0}
                />
                // <InputNumber  onChange={this.handleChangeFormItem} />
              )}
            </FormItem>
          ) : (
            renderThousandthNum(val)
          ),
      },
      {
        title: intl.get(`spcm.common.model.common.rebateAmount`).d('返利金额'),
        dataIndex: 'rebateAmount',
        width: 175,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) && (editable || maintainEditable) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`rebateAmount`, {
                initialValue: record.rebateAmount,
                rules: [
                  {
                    required: isNaN(record.$form.getFieldValue('annualReturnRate')),
                    validator: (_, value, callback) => {
                      const annualReturnVal = record.$form.getFieldValue('annualReturnRate');
                      if (isNaN(value) && (isNaN(annualReturnVal) || !annualReturnVal)) {
                        callback(
                          intl
                            .get('spcm.common.view.message.noAnnualReturnAndrebateAmount')
                            .d('年度返利率和返利金额必填其一')
                        );
                      }
                      callback();
                    },
                  },
                  {
                    validator: (rule, value, callback) => validateBits(value, callback),
                  },
                ],
              })(
                <PrecisionInputNumber
                  type="hzero"
                  onChange={() => {
                    this.handleChangeFormItem();
                    const {
                      $form: { getFieldValue, setFieldsValue },
                    } = record;
                    const annualReturnRateVal = getFieldValue('annualReturnRate');
                    setFieldsValue({ annualReturnRate: annualReturnRateVal });
                  }}
                  currency={supplierCurrencyCode}
                  style={{ width: '100%' }}
                  min={0}
                />
              )}
            </FormItem>
          ) : (
            renderThousandthNum(val)
          ),
      },
      {
        title: intl.get(`spcm.common.model.common.validityDateFrom`).d('有效期从'),
        dataIndex: 'validityDateFrom',
        width: 150,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) && (editable || maintainEditable) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`validityDateFrom`, {
                initialValue:
                  record.validityDateFrom && moment(record.validityDateFrom, DEFAULT_DATE_FORMAT),
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`spcm.common.model.common.validityDateFrom`).d('有效期从'),
                    }),
                  },
                ],
              })(
                <DatePicker
                  // showTime
                  placeholder={null}
                  format={DEFAULT_DATE_FORMAT}
                  onChange={this.handleChangeFormItem}
                  disabledDate={(currentDate) =>
                    record.$form.getFieldValue('validityDateTo') &&
                    moment(record.$form.getFieldValue('validityDateTo')).isBefore(
                      currentDate,
                      'day'
                    )
                  }
                />
              )}
            </FormItem>
          ) : (
            dateRender(val)
          ),
      },
      {
        title: intl.get(`spcm.common.model.common.validityDateTo`).d('有效期至'),
        dataIndex: 'validityDateTo',
        width: 150,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) && (editable || maintainEditable) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`validityDateTo`, {
                initialValue:
                  record.validityDateTo && moment(record.validityDateTo, DEFAULT_DATE_FORMAT),
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`spcm.common.model.common.validityDateTo`).d('有效期至'),
                    }),
                  },
                ],
              })(
                <DatePicker
                  // showTime
                  placeholder={null}
                  format={DEFAULT_DATE_FORMAT}
                  onChange={this.handleChangeFormItem}
                  disabledDate={(currentDate) =>
                    record.$form.getFieldValue('validityDateFrom') &&
                    moment(record.$form.getFieldValue('validityDateFrom')).isAfter(
                      currentDate,
                      'day'
                    )
                  }
                />
              )}
            </FormItem>
          ) : (
            dateRender(val)
          ),
      },
      {
        title: intl.get('spcm.common.model.common.affiliatedCompany').d('关联公司'),
        dataIndex: 'affiliatedCompany',
        width: 120,
        render: (_, record) => (
          <a
            disabled={record._status === 'create'}
            onClick={() => this.handleOpenCompanyModal(record.rebateInformationId)}
          >
            {intl.get('spcm.common.model.common.definitionList').d('定义列表')}
          </a>
        ),
      },
      {
        title: intl.get('spcm.common.model.common.affiliatedSupplier').d('关联供应商'),
        dataIndex: 'supplierIds',
        width: 220,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) && (editable || maintainEditable) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`supplierIds`, {
                initialValue: record.supplierIds,
              })(
                <TransferLov
                  code="SPCM.REBATE_SUPPLIER_CATE"
                  translateData={record.supplierIdsMeaning}
                  queryParams={{ tenantId, enabledFlag: 1 }}
                  onChange={() => this.handleChangeFormItem()}
                />
              )}
            </FormItem>
          ) : (
            <FormItem>
              {record.$form.getFieldDecorator(`supplierIds`, {
                initialValue: record.supplierIds,
              })(
                <TransferLov
                  viewOnly
                  code="SPCM.REBATE_SUPPLIER_CATE"
                  translateData={record.supplierIdsMeaning}
                  queryParams={{ tenantId, enabledFlag: 1 }}
                />
              )}
            </FormItem>
          ),
      },
      {
        title: intl.get('hzero.common.explain').d('说明'),
        dataIndex: 'remark',
        width: 175,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) && (editable || maintainEditable) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`remark`, {
                rules: [
                  // {
                  //   max: 300,
                  //   message: intl.get('hzero.common.validation.max', { max: 300 }),
                  // },
                ],
                initialValue: record.remark ? record.remark : '',
              })(
                <Input
                  onChange={() => {
                    this.handleChangeFormItem();
                  }}
                />
              )}
            </FormItem>
          ) : (
            val
          ),
      },
    ];
    return columnArray;
  }

  render() {
    const {
      loading,
      deleting,
      editable,
      maintainEditable = false,
      checkArtificial = false,
      selectedRows = [],
      dataSource,
      pagination,
      onAdd,
      onDelete,
      onPrePaginationChange,
      onSelectionChange,
      queryCompanyLoading,
      addCompanyLoading,
      customizeTable,
      pcHeaderId,
    } = this.props;
    const {
      companyVisible,
      companyDataSource,
      companyPagination,
      clearCompanyRowsKeys = [],
      companyAddDataSource = [], // 新建公司数据
      companyAddPagination = {}, // 新建公司分页
      sureAddCompanyRowsKeys = [], // 新建公司列表key
      // addCompanyVisible,
    } = this.state;
    const columns = this.getColumns();
    const rowKey = 'rebateInformationId';
    const selectedRowKeys = selectedRows.map((n) => n[rowKey]);
    const rowSelection = {
      selectedRowKeys,
      onChange: (rowKeys, rows) => onSelectionChange(rowKeys, rows, 'pcRebate'),
    };
    const scrollX = tableScrollWidth(columns);
    const editTableProps = {
      loading,
      rowKey,
      columns,
      bordered: true,
      dataSource,
      rowSelection: checkArtificial && rowSelection,
      pagination,
      onChange: (page) => onPrePaginationChange(page),
      scroll: { x: scrollX },
      className: styles['edit-table-wrapper'],
      onDataChange: this.handleDataChange,
    };

    const rowClearCompany = {
      selectedRowKeys: clearCompanyRowsKeys,
      onChange: this.handleClearCompanyRows,
      getCheckboxProps: (record) => ({
        disabled: record._status === 'update' && record.companyId, // Column configuration not to be checked
      }),
    };
    const rowAddCompany = {
      selectedRowKeys: sureAddCompanyRowsKeys,
      onChange: this.handleAddCompanyRows,
    };

    const companyProps = {
      maintainEditable,
      dataSource: companyDataSource,
      pagination: companyPagination,
      companyAddDataSource, // 新建公司数据
      companyAddPagination, // 新建公司分页
      visible: companyVisible,
      hideModal: this.hideCompanyModal,
      loading: queryCompanyLoading,
      addCompanyLoading,
      onSearch: this.fetchCompany,
      fetchAddCompany: this.fetchAddCompany,
      handleCompany: this.fetchCompany,
      handleClearCompany: this.handleClearCompany,
      handleSureAddCompany: this.handleSureAddCompany,
      handleSureSaveCompany: this.handleSureSaveCompany,
      clearCompanyRowsKeys,
      rowSelection: rowClearCompany,
      rowAddCompany,
      onRef: (node) => {
        this.companyForm = node.props.form;
      },
      onAddRef: (node) => {
        this.companyAddForm = node.props.form;
      },
    };
    return (
      <Fragment>
        {editable ||
          (maintainEditable && (
            <div className={styles['btn-wrapper']}>
              <Button type="primary" onClick={onAdd}>
                {intl.get(`hzero.common.button.create`).d('新建')}
              </Button>
              <Button
                onClick={onDelete}
                loading={deleting}
                disabled={isArray(selectedRowKeys) && isEmpty(selectedRowKeys)}
              >
                {intl.get(`hzero.common.button.delete`).d('删除')}
              </Button>
              {pcHeaderId && (
                <CommonImport
                  data-name="newImport"
                  businessObjectTemplateCode="SRM_C_SRM_SPCM_PC_REBATE_INFORMATION_IMPORT"
                  buttonText={intl.get('hzero.common.button.Import').d('导入')}
                  args={{
                    pcHeaderId,
                  }}
                  prefixPatch="/spcm"
                  successCallBack={() => onPrePaginationChange()}
                />
              )}
            </div>
          ))}
        {customizeTable(
          {
            code: this.handleGetCode(),
            clearCache: (a, b, cb) => {
              if (a !== b) cb(a);
            },
            useNewCalid: true,
          },
          <EditTable {...editTableProps} />
        )}
        {companyVisible && <CompanyModal {...companyProps} />}
      </Fragment>
    );
  }
}
