/**
 * index.js - 供应商扣款录入列表
 * @date: 2019-11-13
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */
import React from 'react';
import { Form, Input, Select, DatePicker, Tag, Tooltip, InputNumber } from 'hzero-ui';
import EditTable from 'components/EditTable';
import { yesOrNoRender, valueMapMeaning } from 'utils/renderer';
import moment from 'moment';
import { math } from 'choerodon-ui/dataset';

import intl from 'utils/intl';
import { isNumber } from 'lodash';
import Lov from 'components/Lov';
import { getCurrentOrganizationId, getDateFormat, tableScrollWidth } from 'utils/utils';
import { Bind } from 'lodash-decorators';
import UploadModal from '_components/Upload/index';

import warning from '@/assets/icons/warning.svg';
import { thousandBitSeparator, precisionNum } from '@/routes/utils';
import SearchDrawer from '../components/SourceComponent'; // 引入抽屉面板
import HistoryList from '../components/SupplierActionHistory';


const { Option } = Select;

const commonPrompt = 'sfin.supplierChargeEntry.model';

const FormItem = Form.Item;

export default class List extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tenantId: getCurrentOrganizationId(),
      recordModal: false,
      updateFlag: false,
    };
  }

  /**
   * openOperationRecord - 打开操作记录弹窗
   */
  @Bind()
  openOperationRecord(record) {
    this.setState({
      recordModal: true,
      data: record,
      sourceVisible: false,
      sourceData: {},
    });
  }

  /**
   * hideOperationRecord - 关闭操作记录弹窗
   */

  @Bind()
  hideOperationRecord() {
    this.setState({
      recordModal: false,
    });
  }

  @Bind()
  onRef(ref) {
    this.historyModal = ref;
  }

  @Bind()
  renderHistoryTitle(statusCode) {
    let title;
    if (statusCode === 'RETURNED') {
      title = intl.get(`${commonPrompt}.returnRemark`).d('查看退回说明');
    } else if (statusCode === 'REJECTED') {
      title = intl.get(`${commonPrompt}.rejectRemark`).d('查看拒绝说明');
    } else {
      title = intl.get(`${commonPrompt}.history`).d('操作记录');
    }
    return title;
  }

  @Bind()
  // 通过税率计算
  handleTaxRateValue(val, dataList, record) {
    const { amountEditFlag } = this.props;
    const { taxRate = 0 } = dataList; // 获取当前税率
    const initAmount = record.$form.getFieldValue('amount'); // 获取当前不含税扣款金额 amount
    const initIncludedAmount = record.$form.getFieldValue('taxIncludedAmount'); // 获取当前含税金额 taxIncludedAmount
    if (initAmount && initIncludedAmount) {
      // 反算
      // const amount = (
      //   initIncludedAmount /
      //   (1 + (taxRate !== undefined ? taxRate : 0) / 100)
      // ).toFixed(2);
      // const taxIncludedAmount = (initAmount * (1 + taxRate / 100)).toFixed(2); // 含税金额
      // const taxAmount = (
      //   (amountEditFlag ? initAmount : amount) * (taxRate !== undefined ? taxRate / 100 : 0)
      // ).toFixed(2); // 计算出的税额
      // 修复按2位计算
      const financialPrecision =
        record._status === 'create'
          ? record.$form.getFieldValue('financialPrecision') || 2
          : precisionNum(val, record, 'amount');
      const initIncludedAmountDivRate = math.plus(1, math.div(taxRate, 100));
      const amount = math.toFixed(
        math.div(initIncludedAmount, initIncludedAmountDivRate),
        financialPrecision
      );
      const taxIncludedAmount = math.toFixed(
        math.multipliedBy(initAmount, initIncludedAmountDivRate),
        financialPrecision
      ); // 含税金额

      const amountEditAmount = amountEditFlag ? initAmount : amount;
      const taxAmount = math.toFixed(
        math.multipliedBy(amountEditAmount, math.div(taxRate, 100)),
        financialPrecision
      ); // 计算出的税额
      record.$form.setFieldsValue({
        taxAmount,
        amount: amountEditFlag ? initAmount : amount,
        taxIncludedAmount: amountEditFlag ? taxIncludedAmount : initIncludedAmount,
      });
    }
  }

  // 含税扣款金额正算
  @Bind()
  taxValues(record, e) {
    // const values = e.target.value;

    const values = e;

    const taxRate = record.$form.getFieldValue('taxRate')
      ? record.$form.getFieldValue('taxRate')
      : 0; // 税率
    const financialPrecision =
      record._status === 'create'
        ? record.$form.getFieldValue('financialPrecision') || 2
        : precisionNum(values, record, 'amount');
    // const taxIncludedAmount = (values * (1 + taxRate / 100)).toFixed(2); // 含税金额
    // const taxAmount = ((values * taxRate) / 100).toFixed(2); // 税额
    // 去掉按2位小数计算
    const taxIncludedAmountDivRate = math.plus(1, math.div(taxRate, 100));
    const taxIncludedAmount = math.toFixed(
      math.multipliedBy(values, taxIncludedAmountDivRate),
      financialPrecision
    ); // 含税金额
    const taxAmount = math.toFixed(
      math.div(math.multipliedBy(values, taxRate), 100),
      financialPrecision
    ); // 税额
    record.$form.setFieldsValue({ taxAmount, taxIncludedAmount });
  }

  // 含税扣款金额反算
  @Bind()
  taxRateValue(record, values) {
    const taxRate = record.$form.getFieldValue('taxRate')
      ? record.$form.getFieldValue('taxRate')
      : 0; // 税率
    const financialPrecision =
      record._status === 'create'
        ? record.$form.getFieldValue('financialPrecision') || 2
        : precisionNum(values, record, 'taxIncludedAmount');
    // const amount = (values / (1 + taxRate / 100)).toFixed(2); // 不含税金额
    // const taxAmount = (values - amount).toFixed(2); // 税额
    // 修复按2位金额计算
    const amountDivRate = math.plus(1, math.div(taxRate, 100));
    const amount = math.toFixed(math.div(values, amountDivRate), financialPrecision); // 不含税金额
    const taxAmount = math.toFixed(math.minus(values, amount), financialPrecision); // 税额
    record.$form.setFieldsValue({ amount, taxAmount });
  }

  @Bind()
  handleChangeVisible(flag, record, updateFlag) {
    this.setState({
      sourceVisible: flag,
      sourceData: record,
      updateFlag,
    });
  }

  @Bind()
  sourceRef(ref) {
    this.sourceForm = ref;
  }

  @Bind()
  handleOnChangeCommon(val, list, record, flag) {
    // console.log(val, list, record, flag);
    const { dataSource, dispatch } = this.props;
    const { setFieldsValue, registerField } = record.$form;
    if (flag === 'supplier') {
      registerField('supplierId');
      if (!val) {
        setFieldsValue({
          companyId: null,
          accountSubjectNum: null,
          ouId: null,
        });
      } else {
        if (!list.erpSupplierNum) {
          setFieldsValue({
            erpSupplierNum: list.supplierNum,
          });
        }
        setFieldsValue({
          supplierId: list.supplierId,
        });
      }
    }
    if (flag === 'company') {
      // const { currencyCode } = list;

      const newDataSource = dataSource.map((item) => {
        if (item.supplierDeductionsId === record.supplierDeductionsId) {
          return {
            ...item,
            // currencyCode,
          };
        }
        return item;
      });
      dispatch({
        type: 'supplierChargeEntry/updateState',
        payload: {
          dataSource: newDataSource,
        },
      });
      if (!val) {
        setFieldsValue({
          ouId: null,
          accountSubjectNum: null,
        });
      }
    }
    if (flag === 'ouName') {
      if (!val) {
        setFieldsValue({
          accountSubjectNum: null,
        });
      }
    }
  }

  @Bind()
  handleDefault(value, record) {
    const { setFieldsValue } = record.$form;
    if (value === 'INVOICE_DEDUCTION') {
      setFieldsValue({ ticketDeductionFlag: '1' });
    } else {
      setFieldsValue({ ticketDeductionFlag: '0' });
    }
  }

  render() {
    const {
      loading,
      dataSource,
      onSearch,
      pagination,
      selectedRows,
      enumMap,
      dispatch,
      handerSubjectNum = (e) => e,
      handerNum = (e) => e,
      onRowSelectChange = (e) => e,
      handleRecordChange = (e) => e,
      // eslint-disable-next-line
      customizeTable,
      amountEditFlag,
    } = this.props;
    const { tenantId, recordModal, data, sourceVisible, sourceData, updateFlag } = this.state;
    const { bank = [], paymentMethod = [], type = [] } = enumMap;
    const selectedRowKeys = selectedRows.map((item) => item.supplierDeductionsId);
    const rowSelection = {
      selectedRowKeys,
      onChange: onRowSelectChange,
    };
    const operationRecordProps = {
      dispatch,
      visible: recordModal,
      data,
      onRef: this.onRef,
      hideModal: this.hideOperationRecord,
    };
    const sourceRecordProps = {
      chargeEntryQuery: onSearch,
      dispatch,
      pagination,
      visible: sourceVisible,
      data: sourceData,
      handleChangeVisible: this.handleChangeVisible,
      onRef: this.sourceRef,
      updateFlag,
    };
    const uploadProps = {
      icon: false,
      showFilesNumber: true,
      bucketName: window.$$env.PRIVATE_BUCKET || 'private-bucket',
      bucketDirectory: 'sfin-supplier',
    };

    const tableProps = {
      columns: [
        {
          title: intl.get(`${commonPrompt}.statusCode`).d('状态'),
          dataIndex: 'statusCode',
          width: 100,
          fixed: 'left',
          render: (val) => valueMapMeaning(type, val),
        },
        {
          title: intl.get(`${commonPrompt}.deductionsNum`).d('扣款单号'),
          dataIndex: 'deductionsNum',
          width: 140,
          fixed: 'left',
        },
        {
          title: intl.get(`${commonPrompt}.supplierNum`).d('供应商编码'),
          dataIndex: 'supplierCompanyId',
          width: 180,
          render: (val, record) =>
            ['create'].includes(record._status) ? (
              <FormItem>
                {record.$form.getFieldDecorator(`supplierCompanyId`, {
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`${commonPrompt}.supplierNum`).d('供应商编码'),
                      }),
                    },
                  ],
                  initialValue: record.supplierCompanyId,
                })(
                  <Lov
                    code="SPUC.DEDUCTION_SUPPLIER"
                    textField="erpSupplierNum"
                    lovOptions={{
                      valueField: 'supplierCompanyId',
                      displayField: 'erpSupplierNum',
                    }}
                    textValue={record.supplierCompanyNum}
                    queryParams={{ tenantId }}
                    onChange={(text, values) => {
                      handleRecordChange(record, values);
                      handerNum(text, record, values);
                      this.handleOnChangeCommon(text, values, record, 'supplier');
                    }}
                  />
                )}
              </FormItem>
            ) : (
              record.supplierCompanyNum
            ),
        },
        {
          title: intl.get(`${commonPrompt}.supplierName`).d('供应商名称'),
          dataIndex: 'supplierCompanyName',
          width: 180,
          render: (val, record) => record.erpSupplierName || val,
        },
        {
          title: intl.get(`${commonPrompt}.companyName`).d('公司'),
          dataIndex: 'companyId',
          width: 180,
          render: (val, record) =>
            ['create'].includes(record._status) ? (
              <FormItem>
                {record.$form.getFieldDecorator(`companyId`, {
                  initialValue: record.companyId,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`${commonPrompt}.supplierName`).d('公司'),
                      }),
                    },
                  ],
                })(
                  <Lov
                    code="SQAM.SUPPLIER_PARTNER_COMPANY"
                    textField="companyName"
                    textValue={record.companyName}
                    onChange={(text, values) => {
                      // console.log(text, values)
                      handleRecordChange(record, values);
                      this.handleOnChangeCommon(text, values, record, 'company');
                    }}
                    disabled={!record.$form.getFieldValue('supplierCompanyId')}
                    queryParams={{
                      tenantId,
                      partnerCompanyId: record.$form.getFieldValue('supplierCompanyId'),
                    }}
                  />
                )}
              </FormItem>
            ) : (
              <FormItem>
                {record.$form.getFieldDecorator(`companyId`, {
                  initialValue: record.companyId,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`${commonPrompt}.supplierName`).d('公司'),
                      }),
                    },
                  ],
                })(<span style={{ display: 'none' }} />)}
                {record.companyName}
              </FormItem>
            ),
        },
        {
          title: intl.get(`${commonPrompt}.ouName`).d('业务实体'),
          dataIndex: 'ouId',
          width: 180,
          render: (val, record) =>
            ['create'].includes(record._status) ? (
              <FormItem>
                {record.$form.getFieldDecorator(`ouId`, {
                  initialValue: record.ouId,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`${commonPrompt}.ouName`).d('业务实体'),
                      }),
                    },
                  ],
                })(
                  <Lov
                    code="SODR.USER_AUTH.OU"
                    textField="ouName"
                    textValue={record.ouName}
                    onChange={(text, values) => {
                      handleRecordChange(record, values);
                      this.handleOnChangeCommon(text, values, record, 'ouName');
                    }}
                    disabled={!record.$form.getFieldValue('companyId')}
                    queryParams={{
                      tenantId,
                      companyId: record.$form.getFieldValue('companyId'),
                    }}
                  />
                )}
              </FormItem>
            ) : (
              record.ouName
            ),
        },
        {
          title: intl.get(`${commonPrompt}.currencyCode`).d('币种'),
          dataIndex: 'currencyCode',
          width: 180,
          render: (val, record) =>
            ['create', 'update'].includes(record._status) ? (
              <FormItem style={{paddingTop: '8px', paddingBottom: '8px'}}>
                {record.$form.getFieldDecorator('currencyCode', {
                  initialValue: record.currencyCode,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`${commonPrompt}.currencyCode`).d('币种'),
                      }),
                    },
                  ],
                })(
                  <Lov
                    code="SPRM.EXCHANGE_RATE.CURRENCY"
                    textField="currencyName"
                    textValue={record.currencyCode}
                    queryParams={{ tenantId }}
                    onChange={(value, i) => {
                      const { registerField } = record.$form;
                      registerField('financialPrecision');
                      record.$form.setFieldsValue({
                        financialPrecision: i.financialPrecision,
                      });
                      handleRecordChange(record, value);
                    }}
                  />
                )}
              </FormItem>
            ) : (
              record.currencyCode
            ),
        },
        {
          title: intl.get(`${commonPrompt}.accountSubjectNum`).d('总账科目编码'),
          dataIndex: 'accountSubjectNum',
          width: 180,
          render: (val, record) =>
            !['SUBMITTED', 'APPROVED'].includes(record.statusCode) ? (
              <FormItem style={{paddingTop: '8px', paddingBottom: '8px'}}>
                {record.$form.getFieldDecorator(`accountSubjectNum`, {
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`${commonPrompt}.accountSubjectNum`).d('总账科目编码'),
                      }),
                    },
                  ],
                  initialValue: record.accountSubjectNum,
                })(
                  <Lov
                    code="SPUC.ACCOUNT_SUBJECT"
                    textField="accountSubjectNum"
                    textValue={record.accountSubjectNum}
                    disabled={!record.$form.getFieldValue('ouId')}
                    queryParams={{
                      tenantId,
                      companyId: record.$form.getFieldValue('companyId') || record.companyId,
                      ouId: record.$form.getFieldValue('ouId') || record.ouId,
                    }}
                    onChange={(text, values) => {
                      handleRecordChange(record, values);
                      handerSubjectNum(text, record, values);
                      this.handleOnChangeCommon(text, values, record, 'subject');
                    }}
                    lovOptions={{
                      valueField: 'accountSubjectNum',
                    }}
                  />
                )}
              </FormItem>
            ) : (
              val
            ),
        },
        {
          title: intl.get(`${commonPrompt}.accountSubjectId`).d('总账科目名称'),
          dataIndex: 'accountSubjectName',
          width: 180,
        },
        {
          title: intl.get(`${commonPrompt}.remberDate`).d('记账日期'),
          dataIndex: 'billingDate',
          width: 180,
          render: (val, record) =>
            ['create', 'update'].includes(record._status) ? (
              <FormItem>
                {record.$form.getFieldDecorator(`billingDate`, {
                  initialValue:
                    (record.billingDate && moment(record.billingDate)) || moment(new Date()),
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`${commonPrompt}.remberDate`).d('记账日期'),
                      }),
                    },
                  ],
                })(
                  <DatePicker
                    format={getDateFormat()}
                    onChange={(text, values) => {
                      handleRecordChange(record, values);
                    }}
                    placeholder={null}
                  />
                )}
              </FormItem>
            ) : (
              val
            ),
        },
        {
          title: intl.get(`${commonPrompt}.debitCreditCode`).d('借贷方'),
          dataIndex: 'debitCreditCode',
          width: 150,
          render: (val, record) =>
            !['SUBMITTED', 'APPROVED'].includes(record.statusCode) ? (
              <FormItem>
                {record.$form.getFieldDecorator(`debitCreditCode`, {
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`${commonPrompt}.debitCreditCode`).d('借贷方'),
                      }),
                    },
                  ],
                  initialValue: record.debitCreditCode,
                })(
                  <Select
                    style={{ width: '100%' }}
                    onChange={() => handleRecordChange(record)}
                    allowClear
                  >
                    {bank.map((n) => (
                      <Option key={n.value} value={n.value}>
                        {n.meaning}
                      </Option>
                    ))}
                  </Select>
                )}
              </FormItem>
            ) : (
              record.debitCreditCodeMeaning
            ),
        },
        {
          title: intl.get(`${commonPrompt}.amount`).d('不含税扣款额'),
          dataIndex: 'amount',
          width: 120,
          render: (val, record) =>
            !['SUBMITTED', 'APPROVED'].includes(record.statusCode) ? (
              <FormItem>
                {record.$form.getFieldDecorator(`amount`, {
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`${commonPrompt}.amount`).d('不含税扣款额'),
                      }),
                    },
                    // {
                    //   validator: (i, value, callback) => {
                    //     const currentLength = Number(value).toString().split('.')[1]
                    //       ? Number(value).toString().split('.')[1].length
                    //       : 0;

                    //     if (currentLength > record.amountPrecision) {
                    //       callback(intl.get(`${commonPrompt}.msgError`).d(`精度校验不通过`));
                    //     } else {
                    //       callback();
                    //     }
                    //   },
                    // },
                  ],
                  initialValue: record.amount,
                })(
                  <InputNumber
                    style={{ width: '100%' }}
                    precision={
                      record._status === 'create'
                        ? record.$form.getFieldValue('financialPrecision') || 2
                        : precisionNum(val, record, 'amount')
                    }
                    // precision={precisionNum(val, record, 'amount')}
                    // {...precisionParams(val, true)}
                    allowThousandth
                    disabled={!amountEditFlag}
                    onChange={(e) => {
                      handleRecordChange(record);
                      this.taxValues(record, e);
                    }}
                  />
                )}
              </FormItem>
            ) : (
              thousandBitSeparator(val, record.amountPrecision)
            ),
        },
        {
          title: intl.get(`${commonPrompt}.taxIncludedAmount`).d('含税扣款额'),
          dataIndex: 'taxIncludedAmount',
          width: 120,
          render: (val, record) => {
            return !['SUBMITTED', 'APPROVED'].includes(record.statusCode) ? (
              <FormItem>
                {record.$form.getFieldDecorator(`taxIncludedAmount`, {
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`${commonPrompt}.taxIncludedAmount`).d('含税扣款额'),
                      }),
                    },
                    {
                      validator: (rule, value, callback) => {
                        // const currentLength = Number(value).toString().split('.')[1]
                        //   ? Number(value).toString().split('.')[1].length
                        //   : 0;

                        // if (currentLength > record.amountPrecision) {
                        //   callback(
                        //     intl.get(`${commonPrompt}.message.msgError`).d(`精度校验不通过`)
                        //   );
                        // }
                        if (value === 0) {
                          callback(
                            intl
                              .get(`${commonPrompt}.message.notZeroTaxIncludedAmount`)
                              .d('含税扣款额不能等于零')
                          );
                        } else {
                          callback();
                        }
                      },
                    },
                  ],
                  initialValue: record.taxIncludedAmount,
                })(
                  <InputNumber
                    style={{ width: '100%' }}
                    precision={
                      record._status === 'create'
                        ? record.$form.getFieldValue('financialPrecision') || 2
                        : precisionNum(val, record, 'taxIncludedAmount')
                    }
                    allowThousandth
                    // {...precisionParams(val, true)}
                    step={0.01}
                    disabled={amountEditFlag}
                    onChange={(e) => {
                      handleRecordChange(record);
                      this.taxRateValue(record, e);
                    }}
                  />
                )}
              </FormItem>
            ) : (
              // val
              thousandBitSeparator(val, record.amountPrecision)
            );
          },
        },
        {
          title: intl.get(`${commonPrompt}.taxRate`).d('税率(%)'),
          dataIndex: 'taxId',
          width: 150,
          render: (val, record) =>
            !['SUBMITTED', 'APPROVED'].includes(record.statusCode) ? (
              <React.Fragment>
                <FormItem>
                  {record.$form.getFieldDecorator(`taxId`, {
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`${commonPrompt}.taxRate`).d('税率%'),
                        }),
                      },
                    ],
                    initialValue: record.taxId,
                  })(
                    <Lov
                      code="SPCM.TAX"
                      textField="taxRate"
                      textValue={record.taxRate}
                      queryParams={{ tenantId }}
                      onChange={(value, dataList) => {
                        handleRecordChange(record);
                        this.handleTaxRateValue(value, dataList, record);
                        record.$form.setFieldsValue({
                          taxRate: dataList.taxRate,
                        });
                      }}
                    />
                  )}
                </FormItem>
                <FormItem style={{ display: 'none' }}>
                  {record.$form.getFieldDecorator(`taxRate`, {
                    initialValue: record.taxRate,
                  })(<div />)}
                </FormItem>
              </React.Fragment>
            ) : (
              record.taxRate
            ),
        },
        {
          title: intl.get(`${commonPrompt}.taxAmount`).d('税额'),
          dataIndex: 'taxAmount',
          width: 150,
          render: (val, record) =>
            !['SUBMITTED', 'APPROVED'].includes(record.statusCode) ? (
              <FormItem>
                {record.$form.getFieldDecorator(`taxAmount`, {
                  initialValue: record.taxAmount,
                  rules: [
                    // {
                    //   validator: (i, value, callback) => {
                    //     const currentLength = Number(value).toString().split('.')[1]
                    //       ? Number(value).toString().split('.')[1].length
                    //       : 0;
                    //     if (currentLength > record.amountPrecision) {
                    //       callback(intl.get(`${commonPrompt}.msgError`).d(`精度校验不通过`));
                    //     } else {
                    //       callback();
                    //     }
                    //   },
                    // },
                  ],
                })(
                  <InputNumber
                    style={{ width: '100%' }}
                    precision={
                      record._status === 'create'
                        ? record.$form.getFieldValue('financialPrecision') || 2
                        : precisionNum(val, record, 'taxAmount')
                    }
                    // precision={precisionNum(val, record, 'taxAmount')}
                    // {...precisionParams(val, true)}
                    allowThousandth
                    disabled
                    onChange={() => handleRecordChange(record)}
                  />
                )}
              </FormItem>
            ) : (
              // val
              thousandBitSeparator(val, record.amountPrecision) || 0
            ),
        },
        {
          title: intl.get(`${commonPrompt}.paymentType`).d('费用处理方式'),
          dataIndex: 'costDealWayCode',
          width: 150,
          render: (val, record) =>
            !['SUBMITTED', 'APPROVED'].includes(record.statusCode) ? (
              <FormItem>
                {record.$form.getFieldDecorator(`costDealWayCode`, {
                  initialValue: record.costDealWayCode,
                })(
                  <Select
                    onChange={(e) => {
                      handleRecordChange(record);
                      this.handleDefault(e, record);
                    }}
                    style={{ width: '100%' }}
                    allowClear
                  >
                    {paymentMethod.map((n) => (
                      <Option key={n.value} value={n.value}>
                        {n.meaning}
                      </Option>
                    ))}
                  </Select>
                )}
              </FormItem>
            ) : (
              record.costDealWayCodeMeaning
            ),
        },
        {
          title: (
            <Tooltip
              title={intl
                .get(`${commonPrompt}.tipFlag`)
                .d('是否票扣为是,为空时,扣款单可在对账时被引用')}
              placement="topLeft"
            >
              {intl.get(`${commonPrompt}.tickFlag`).d('是否票扣')}
            </Tooltip>
          ),
          dataIndex: 'ticketDeductionFlag',
          width: 150,
          render: (val, record) =>
            !['SUBMITTED', 'APPROVED'].includes(record.statusCode) ? (
              <FormItem>
                {record.$form.getFieldDecorator(`ticketDeductionFlag`, {
                  initialValue: isNumber(record.ticketDeductionFlag)
                    ? record.ticketDeductionFlag.toString()
                    : record.ticketDeductionFlag,
                })(
                  <Select
                    style={{ width: '100%' }}
                    allowClear
                    onChange={() => handleRecordChange(record)}
                  >
                    <Option value="0">{intl.get('hzero.common.status.no').d('否')}</Option>
                    <Option value="1">{intl.get('hzero.common.status.yes').d('是')}</Option>
                  </Select>
                )}
              </FormItem>
            ) : (
              yesOrNoRender(val)
            ),
        },
        // {
        //   title: intl.get(`${commonPrompt}.taxIncludedAmount`).d('含税扣款额'),
        //   dataIndex: 'taxIncludedAmount',
        //   width: 150,
        //   render: (val, record) =>
        //     !['SUBMITTED', 'APPROVED'].includes(record.statusCode) ? (
        //       <FormItem>
        //         {record.$form.getFieldDecorator(`taxIncludedAmount`, {
        //           rules: [
        //             {
        //               required: true,
        //               message: intl.get('hzero.common.validation.notNull', {
        //                 name: intl.get(`${commonPrompt}.taxIncludedAmount`).d('含税扣款额'),
        //               }),
        //             },
        //           ],
        //           initialValue: record.taxIncludedAmount,
        //         })(
        //           <Input
        //             // disabled={!record.$form.getFieldValue('taxId')}
        //             onChange={e => {
        //               handleRecordChange(record);
        //               this.taxRateValue(record, e);
        //             }}
        //           />
        //         )}
        //       </FormItem>
        //     ) : (
        //       val
        //     ),
        // },
        {
          title: intl.get(`${commonPrompt}.deductionRemark`).d('扣款说明'),
          dataIndex: 'remark',
          width: 150,
          render: (val, record) =>
            !['SUBMITTED', 'APPROVED'].includes(record.statusCode) ? (
              <FormItem>
                {record.$form.getFieldDecorator(`remark`, {
                  initialValue: record.remark,
                })(<Input onChange={() => handleRecordChange(record)} />)}
              </FormItem>
            ) : (
              val
            ),
        },
        {
          title: intl.get(`${commonPrompt}.attachmentUuid`).d('附件'),
          dataIndex: 'attachmentUuid',
          width: 100,
          render: (val, record) => (
            <FormItem>
              {record.$form.getFieldDecorator(`attachmentUuid`, {
                initialValue: record.attachmentUuid,
              })(
                <UploadModal
                  attachmentUUID={record.attachmentUuid}
                  viewOnly={record.statusCode === 'SUBMITTED' || record.statusCode === 'APPROVED'}
                  {...uploadProps}
                />
              )}
            </FormItem>
          ),
        },
        {
          title: intl.get(`${commonPrompt}.sourceNum`).d('来源单据'),
          dataIndex: 'sourceNum',
          width: 140,
          render: (val, record) =>
            record.deductionsNum ? (
              <span>
                <a onClick={() => this.handleChangeVisible(true, record, 'update')}>
                  {intl.get(`${commonPrompt}.connectNum`).d('关联单据')}
                </a>
                {record.deductionRelationNumber > 0 && (
                  <Tag
                    color="#108ee9"
                    style={{
                      height: 'auto',
                      lineHeight: '15px',
                      marginLeft: '4px',
                    }}
                  >
                    {record.deductionRelationNumber}
                  </Tag>
                )}
                {/* <span style={{ color: 'red' }}>{record.deductionRelationNumber}</span> */}
              </span>
            ) : (
              <Tooltip
                title={intl
                  .get(`sfin.supplierChargeEntry.model.supplier.saveCreateNum`)
                  .d('请点击保存，生成扣款单号后关联来源单据')}
                placement="topLeft"
              >
                <img src={warning} alt="img" />
              </Tooltip>
            ),
        },
        {
          title: intl.get(`${commonPrompt}.createByName`).d('创建人'),
          dataIndex: 'createByName',
          width: 100,
        },
        {
          title: intl.get(`${commonPrompt}.sourceCode`).d('数据来源'),
          dataIndex: 'sourceCode',
          width: 100,
          render: (_, record) => record.sourceCodeMeaning,
        },
        {
          title: intl.get(`${commonPrompt}.history`).d('操作记录'),
          dataIndex: 'history',
          width: 120,
          fixed: 'right',
          render: (_, record) => {
            return (
              record._status !== 'create' && (
                <a onClick={() => this.openOperationRecord(record)}>
                  {this.renderHistoryTitle(record.statusCode)}
                </a>
              )
            );
          },
        },
      ],
      loading,
      dataSource,
      rowSelection,
      bordered: true,
      rowKey: 'supplierDeductionsId',
      onChange: (page) => onSearch(page),
      pagination,
    };
    tableProps.scroll = { x: tableScrollWidth(tableProps.columns) };

    return (
      <React.Fragment>
        {customizeTable({ code: 'SFIN.SUPPLIER_CHARGE_ENTRY.LIST' }, <EditTable {...tableProps} />)}
        {recordModal && <HistoryList {...operationRecordProps} />}
        {sourceVisible && <SearchDrawer {...sourceRecordProps} />}
      </React.Fragment>
    );
  }
}
