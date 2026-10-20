/* eslint-disable no-undef */
import React, { PureComponent, Fragment } from 'react';
import moment from 'moment';
import { Input, Form, DatePicker, InputNumber } from 'hzero-ui';
import { math } from 'choerodon-ui/dataset';

import Lov from 'components/Lov';
import { getDateFormat, getCurrentOrganizationId } from 'utils/utils';
import { Bind } from 'lodash-decorators';
import EditTable from 'components/EditTable';
import { dateRender } from 'utils/renderer';
import { thousandBitSeparator, precisionNum, precisionNumPrice } from '@/routes/utils.js';
import { isNil } from 'lodash';
import intl from 'utils/intl';

const FormItem = Form.Item;
const { TextArea } = Input;
/**
 * 索赔项目数据列表展示
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} onChange - 分页查询
 * @reactProps {Boolean} loading - 数据加载完成标记
 * @reactProps {Array} dataSource - Table数据源
 * @reactProps {Object} pagination - 分页器
 * @reactProps {Number} pagination.current - 当前页码
 * @reactProps {Number} pagination.pageSize - 分页大小
 * @reactProps {Number} pagination.total - 数据总量
 * @return React.element
 */
export default class ListTable extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      taxRateValue: '',
      taxRateMeaning: '',
    };
  }

  /**
   * 物料改变回调
   * @param {String} value
   * @param {Object} lovRecord
   * @param {Object} record
   */
  @Bind()
  itemCodeChange(value, lovRecord, record) {
    const { changeDataSource } = this.props;
    const { $form } = record;
    const { setFieldsValue, registerField, getFieldValue } = $form;
    const {
      itemName,
      itemCode,
      uomId,
      uomCodeAndName,
      taxRate,
      taxId,
      specifications,
      model,
    } = lovRecord;
    const lineAmount = getFieldValue('lineAmount');
    registerField('taxId');
    registerField('itemCode');
    setFieldsValue({ itemName, itemCode, specifications, model });
    if (uomId) {
      setFieldsValue({ uomId, uomCodeAndName });
    }
    if (taxId && taxRate) {
      setFieldsValue({ taxRate, taxId, taxFlag: 1 });
      changeDataSource(record, {
        taxIncludedLineAmount: math.multipliedBy(math.plus(1, math.div(taxRate, 100)), lineAmount),
      });
      this.handleTaxRateChange(taxId, record, { taxRate });
    } else {
      setFieldsValue({ taxRate: undefined, taxId: undefined, taxFlag: 0 });
      changeDataSource(record, { taxIncludedLineAmount: lineAmount });
      this.handleTaxRateChange(taxId, record, { taxRate });
    }
  }

  @Bind()
  claimItemChange(lovRecord, record) {
    const { $form } = record;
    const { claimItemDesc } = lovRecord;
    $form.setFieldsValue({ claimItemDesc });
  }

  /**
   * 税种变化回调
   * @param {String} value
   * @param {Object} lovRecord
   * @param {Object} record
   */
  @Bind()
  handleTaxRateChange(text, record, lovRecord) {
    const { changeDataSource, headerData, basePrice } = this.props;
    const { amountPrecision } = headerData || {};
    const { $form, taxIncludedLineAmount, netPrice, taxIncludedPrice } = record;
    const { getFieldValue, setFieldsValue } = $form;
    const { taxRate } = lovRecord;
    const quantity = getFieldValue('quantity') || 0;
    const unitPrice = getFieldValue('unitPrice');
    const taxFlag = getFieldValue('taxFlag');
    if (['netPrice', 'taxIncludedPrice'].includes(basePrice)) {
      const tax = taxRate || 0;
      const price = getFieldValue('netPrice') || netPrice || 0;

      let lineAmount;
      let taxIncludedLineAmountTotal;
      // 如果基准价是不含税
      if (basePrice === 'netPrice') {
        lineAmount = math.toFixed(math.multipliedBy(price, quantity), amountPrecision);
        taxIncludedLineAmountTotal = math.toFixed(
          math.multipliedBy(lineAmount, math.plus(1, math.div(tax, 100))),
          amountPrecision
        );
      } else {
        const taxIncludedPriceData = getFieldValue('taxIncludedPrice') || taxIncludedPrice || 0;
        taxIncludedLineAmountTotal = math.toFixed(
          math.multipliedBy(taxIncludedPriceData, quantity),
          amountPrecision
        );
        lineAmount = math.toFixed(
          math.div(taxIncludedLineAmountTotal, math.plus(1, math.div(tax, 100))),
          amountPrecision
        );
      }
      record.$form.setFieldsValue({
        taxIncludedLineAmount: taxIncludedLineAmountTotal,
        lineAmount,
        taxFlag: taxRate ? 1 : 0,
      });
      changeDataSource(record, { taxRate, taxIncludedLineAmount: taxIncludedLineAmountTotal });
    } else {
      const ratePlus = math.plus(1, math.div(taxRate, 100));
      changeDataSource(record, {
        taxRate,
        taxIncludedLineAmount:
          quantity && unitPrice && taxFlag && taxRate
            ? math.toFixed(
                math.multipliedBy(math.multipliedBy(quantity, unitPrice), ratePlus),
                amountPrecision
              )
            : taxIncludedLineAmount,
      });
      if (text) {
        const lovRecordRatePlus = math.plus(1, math.div(lovRecord.taxRate, 100));
        if (record.disabledNoTax && record.$form.getFieldValue('taxIncludedLineAmount')) {
          record.$form.setFieldsValue({
            lineAmount: math.toFixed(
              math.div(record.$form.getFieldValue('taxIncludedLineAmount'), lovRecordRatePlus),
              amountPrecision
            ),
          });
        } else if (record.disabledTax && record.$form.getFieldValue('lineAmount')) {
          record.$form.setFieldsValue({
            taxIncludedLineAmount: math.toFixed(
              math.multipliedBy(record.$form.getFieldValue('lineAmount'), lovRecordRatePlus),
              amountPrecision
            ),
          });
        }
      } else {
        if (record.disabledTax) {
          record.$form.setFieldsValue({ taxIncludedLineAmount: null });
        }
        if (record.disabledNoTax) {
          record.$form.setFieldsValue({ lineAmount: null });
        }
      }
      // whetherDisabled({ disabledTax: false, disabledNoTax: false });
      // setFieldsValue({ lineAmount: null, taxIncludedLineAmount: null });
      if (taxRate) {
        setFieldsValue({ taxFlag: 1 });
      } else {
        setFieldsValue({ taxFlag: 0 });
      }
    }
  }

  /**
   * 金额改变
   * @param {String} item
   * @param {Object} e
   * @param {Object} record
   */
  @Bind()
  handleBillChange(item, e, record) {
    const { changeDataSource, ChangeBillReadOnly } = this.props;
    const {
      taxRate,
      $form: { getFieldValue, setFieldsValue },
    } = record;
    const unitPrice = getFieldValue('unitPrice');
    const quantity = getFieldValue('quantity');
    const taxFlag = ChangeBillReadOnly ? getFieldValue('taxFlag') : record.taxFlag;
    let noTaxSum;
    let withTaxSum;
    if (item === 'unitPrice') {
      noTaxSum = e && quantity ? math.multipliedBy(e, quantity) : undefined;
      withTaxSum = math.multipliedBy(
        math.multipliedBy(e, quantity),
        math.plus(1, math.div(taxRate, 100))
      );
    }
    if (item === 'quantity') {
      noTaxSum = e && unitPrice ? math.multipliedBy(e, unitPrice) : undefined;
      withTaxSum = math.multipliedBy(
        math.multipliedBy(e, unitPrice),
        math.plus(1, math.div(taxRate, 100))
      );
    }
    changeDataSource(record, {
      taxIncludedLineAmount: taxFlag ? withTaxSum : noTaxSum,
      lineAmount: noTaxSum,
    });
    setFieldsValue({
      // taxIncludedLineAmount: taxFlag ? withTaxSum : noTaxSum,
      lineAmount: noTaxSum,
    });
  }

  /**
   * 是否含税回调
   * @param {String} value
   * @param {Object} lovRecord
   * @param {Object} record
   */
  @Bind()
  handleTaxFlagChange(e, record) {
    const { changeDataSource } = this.props;
    const { $form } = record;
    const { getFieldValue, setFieldsValue } = $form;
    const taxRate = getFieldValue('taxRate');
    const lineAmount = getFieldValue('lineAmount');
    if (e.target.checked) {
      const rate = taxRate || 0;
      changeDataSource(record, {
        taxIncludedLineAmount: math.multipliedBy(lineAmount, math.plus(1, math.div(rate, 100))),
      });
    } else {
      changeDataSource(record, {
        taxIncludedLineAmount: lineAmount,
      });
      setFieldsValue({ taxId: undefined, taxRate: undefined });
    }
  }

  // 不含税金额改变回调
  @Bind()
  handlelineAmountChange(e, record) {
    const { changeDataSource } = this.props;
    const {
      $form: { getFieldValue },
    } = record;
    const taxFlag = getFieldValue('taxFlag');
    const taxRate = taxFlag ? getFieldValue('taxRate') : 0;
    const val = e || 0;
    const taxIncludedLineAmount = math.multipliedBy(val, math.plus(1, math.div(taxRate, 100)));
    changeDataSource(record, { taxIncludedLineAmount });
  }

  // 连带物料编码改变回调
  @Bind()
  associateItemCodechange(value, lovRecord, record) {
    const { itemId, uomCodeAndName, uomId } = lovRecord;
    const {
      $form: { setFieldsValue, registerField },
    } = record;
    registerField('associateItemId');
    if (value) {
      setFieldsValue({
        associateItemId: itemId,
        associateItemUomId: uomId,
        associateItemUomCodeAndName: uomCodeAndName,
      });
    }
  }

  @Bind()
  handleNetPriceBlur(val, record) {
    // 需要计算含税单价，含税金额，不含税金额
    const value = val || 0;
    const { changeDataSource, headerData } = this.props;
    const { amountPrecision, pricePrecision } = headerData;
    const { $form, taxRate } = record;
    const { getFieldValue, setFieldsValue, isFieldTouched } = $form;
    const quantity = getFieldValue('quantity') || 0;
    const { taxRateMeaning, taxRateValue } = this.state;
    const tax =
      isNil(record.taxId) && !isFieldTouched('taxId') && getFieldValue('taxId') === taxRateValue
        ? taxRateMeaning || 0
        : getFieldValue('taxRate') || taxRate || 0;

    // const taxIncludedPrice = math.toFixed(math.multipliedBy(value, math.plus(1, math.div(tax, 100))), amountPrecision);
    const lineAmount = math.toFixed(math.multipliedBy(value, quantity), amountPrecision);
    const taxIncludedLineAmount = math.toFixed(
      math.multipliedBy(lineAmount, math.plus(1, math.div(tax, 100))),
      amountPrecision
    );
    // const taxIncludedLineAmount = math.toFixed(math.multipliedBy(math.plus(1, math.div(taxRate, 100)), lineAmount), amountPrecision);
    setFieldsValue({
      // taxIncludedPrice,
      lineAmount,
      taxIncludedLineAmount,
      netPrice: math.toFixed(value, pricePrecision),
    });
    changeDataSource(record, { lineAmount, taxIncludedLineAmount });
  }

  @Bind()
  handleTaxPriceBlur(val, record) {
    // 需要计算不含税单价，含税金额，不含税金额
    const value = val || 0;
    const { changeDataSource, headerData } = this.props;
    const { pricePrecision, amountPrecision } = headerData;
    const { $form, taxRate } = record;
    const { getFieldValue, setFieldsValue, isFieldTouched } = $form;
    const quantity = getFieldValue('quantity') || 0;
    const { taxRateMeaning, taxRateValue } = this.state;
    const tax =
      isNil(record.taxId) && !isFieldTouched('taxId') && getFieldValue('taxId') === taxRateValue
        ? taxRateMeaning || 0
        : getFieldValue('taxRate') || taxRate || 0;
    // const netPrice = math.toFixed(math.div(value, math.plus(1, math.div(tax, 100))), amountPrecision);
    const taxIncludedLineAmount = math.toFixed(math.multipliedBy(value, quantity), amountPrecision);
    const lineAmount = math.toFixed(
      math.div(taxIncludedLineAmount, math.plus(1, math.div(tax, 100))),
      amountPrecision
    );
    // const taxIncludedLineAmount = math.toFixed(math.multipliedBy(math.plus(1, math.div(taxRate, 100)), lineAmount), amountPrecision);
    setFieldsValue({
      // netPrice,
      lineAmount,
      taxIncludedLineAmount,
      taxIncludedPrice: math.toFixed(value, pricePrecision),
    });
    changeDataSource(record, { lineAmount, taxIncludedLineAmount });
  }

  // 数量改变回调
  @Bind()
  handleQuantityChange(val, record) {
    const value = val || 0;
    const { taxRateMeaning, taxRateValue } = this.state;
    const { basePrice, changeDataSource, headerData } = this.props;
    if (['netPrice', 'taxIncludedPrice'].includes(basePrice)) {
      const { amountPrecision } = headerData;
      const { $form, taxRate } = record;
      const { getFieldValue, setFieldsValue, isFieldTouched } = $form;
      const tax =
        isNil(record.taxId) && !isFieldTouched('taxId') && getFieldValue('taxId') === taxRateValue
          ? taxRateMeaning || 0
          : getFieldValue('taxRate') || taxRate || 0;
      const netPriceData = getFieldValue('netPrice') || 0;
      const taxIncludedPriceData = getFieldValue('taxIncludedPrice') || 0;
      let lineAmount;
      let taxIncludedLineAmount;
      // 如果基准价是不含税
      if (basePrice === 'netPrice') {
        lineAmount = math.toFixed(math.multipliedBy(netPriceData, value), amountPrecision);
        taxIncludedLineAmount = math.toFixed(
          math.multipliedBy(lineAmount, math.plus(1, math.div(tax, 100))),
          amountPrecision
        );
      } else {
        taxIncludedLineAmount = math.toFixed(
          math.multipliedBy(taxIncludedPriceData, value),
          amountPrecision
        );
        lineAmount = math.toFixed(
          math.div(taxIncludedLineAmount, math.plus(1, math.div(tax, 100))),
          amountPrecision
        );
      }
      setFieldsValue({
        lineAmount,
        taxIncludedLineAmount,
      });
      changeDataSource(record, { lineAmount, taxIncludedLineAmount });
    }
  }

  render() {
    const {
      ListLoading,
      dataSource = [],
      pagination = {},
      onChange,
      tenantId,
      ChangeItemReadOnly,
      ChangeBillReadOnly,
      claimTypeId,
      customizeTable,
      whetherDisabled,
      rowSelection = null,
      ChangeFormItem,
      headerData,
      basePrice,
      form,
      payMentType = [],
    } = this.props;
    const { taxRateValue, taxRateMeaning } = this.state;
    const {
      pricePrecision,
      amountPrecision,
      expenseProcessTypeDescription,
      expenseProcessType,
    } = headerData;
    const formExpenseProcessType = form?.getFieldValue('expenseProcessType') || '';
    const formExpenseProcessTypeDescArr = payMentType.filter(
      (elem) => formExpenseProcessType === elem.value
    );
    const isFormOffline = formExpenseProcessTypeDescArr.length
      ? formExpenseProcessTypeDescArr[0].description === 'offline'
      : false;
    // 如果用户选择了下拉框，则以下拉框中的费用方式为准，否则，以初始的方式为准
    const isOffline =
      expenseProcessType !== formExpenseProcessType
        ? isFormOffline
        : ['offline'].includes(expenseProcessTypeDescription);
    const columns = [
      {
        title: intl.get(`sqam.common.model.common.displayNumber`).d('行号'),
        dataIndex: 'displayLineNum',
        width: 80,
        // fixed: true,
      },
      {
        title: intl.get(`sqam.common.model.claimItemCode`).d('索赔项目编码'),
        dataIndex: 'claimItemNum',
        width: 150,
        // fixed: true,
        render: (value, record) =>
          ChangeItemReadOnly ? (
            value
          ) : (
            <FormItem>
              {record.$form.getFieldDecorator('claimItemId', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`sqam.common.model.claimItemCode`).d('索赔项目编码'),
                    }),
                  },
                ],
                initialValue: record.claimItemId,
              })(
                <Lov
                  code="SQAM.CLAIM_ITEM"
                  textValue={record.claimItemNum}
                  lovOptions={{ valueField: 'claimItemId', displayField: 'claimItemNum' }}
                  queryParams={{
                    tenantId,
                    claimTypeId,
                    enabledFlag: 1,
                  }}
                  onChange={(val, lovRecord) => this.claimItemChange(lovRecord, record)}
                />
              )}
            </FormItem>
          ),
      },
      {
        title: intl.get(`sqam.common.model.claimItemDesc`).d('索赔项目描述'),
        dataIndex: 'claimItemDesc',
        width: 180,
        // fixed: true,
        render: (value, record) =>
          ChangeItemReadOnly ? (
            value
          ) : (
            <FormItem>
              {record.$form.getFieldDecorator('claimItemDesc', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`sqam.common.model.claimItemDesc`).d('索赔项目描述'),
                    }),
                  },
                ],
                initialValue: record.claimItemDesc,
              })(<Input />)}
            </FormItem>
          ),
      },
      {
        title: intl.get(`sqam.common.date.happenDate`).d('发生日期'),
        dataIndex: 'occurDate',
        width: 150,
        render: (value, record) =>
          ChangeItemReadOnly ? (
            dateRender(value)
          ) : (
            <FormItem>
              {record.$form.getFieldDecorator('occurDate', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`sqam.common.model.happenDate`).d('发生日期'),
                    }),
                  },
                ],
                initialValue: record.occurDate ? moment(record.occurDate) : null,
              })(<DatePicker format={getDateFormat()} />)}
            </FormItem>
          ),
      },
      {
        title: intl.get('entity.item.code').d('物料编码'),
        dataIndex: 'itemCode',
        width: 120,
        render: (val, record) =>
          ChangeItemReadOnly ? (
            val
          ) : (
            <FormItem>
              {record.$form.getFieldDecorator('itemId', {
                initialValue: record.itemId,
              })(
                <Lov
                  code="SQAM.ITEM"
                  onChange={(value, lovRecord) => this.itemCodeChange(value, lovRecord, record)}
                  lovOptions={{ valueField: 'itemId', displayField: 'itemCode' }}
                  textValue={record.itemCode}
                  queryParams={{ enabledFlag: 1, tenantId }}
                />
              )}
            </FormItem>
          ),
      },
      {
        title: intl.get('entity.item.name').d('物料名称'),
        dataIndex: 'itemName',
        width: 150,
        render: (value, record) =>
          ChangeItemReadOnly ? (
            value
          ) : (
            <FormItem>
              {record.$form.getFieldDecorator('itemName', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`entity.item.name`).d('物料名称'),
                    }),
                  },
                ],
                initialValue: record.itemName,
              })(<Input />)}
            </FormItem>
          ),
      },
      {
        title: intl.get(`sqam.common.model.unit`).d('单位'),
        dataIndex: 'uomCodeAndName',
        width: 120,
        render: (value, record) =>
          ChangeItemReadOnly ? (
            value
          ) : (
            <FormItem>
              {record.$form.getFieldDecorator('uomId', {
                // rules: [
                //   {
                //     required: true,
                //     message: intl.get('hzero.common.validation.notNull', {
                //       name: intl.get(`sqam.common.model.unit`).d('单位'),
                //     }),
                //   },
                // ],
                initialValue: record.uomId,
              })(
                <Lov
                  code="SPRM.UOM"
                  lovOptions={{ valueField: 'uomId', displayField: 'uomCodeAndName' }}
                  textValue={record.uomCodeAndName}
                  textField="uomCodeAndName"
                  queryParams={{ tenantId }}
                />
              )}
            </FormItem>
          ),
      },
      {
        title: intl.get('sqam.common.model.common.quantity').d('数量'),
        dataIndex: 'quantity',
        width: 150,
        render: (value, record) =>
          ChangeBillReadOnly && ChangeItemReadOnly ? (
            // value
            thousandBitSeparator(value)
          ) : (
            <FormItem>
              {record.$form.getFieldDecorator('quantity', {
                rules: [
                  {
                    required: ['netPrice', 'taxIncludedPrice'].includes(basePrice),
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`sqam.common.model.common.quantity`).d('数量'),
                    }),
                  },
                ],
                initialValue: record.quantity,
              })(
                <InputNumber
                  min={0}
                  allowThousandth
                  onChange={(val) => {
                    this.handleQuantityChange(val, record);
                  }}
                />
              )}
            </FormItem>
          ),
      },
      {
        title: intl.get('sqam.common.model.claimState').d('索赔说明'),
        dataIndex: 'lineExplain',
        width: 140,
        render: (value, record) =>
          ChangeItemReadOnly ? (
            value
          ) : (
            <FormItem>
              {record.$form.getFieldDecorator('lineExplain', {
                initialValue: record.lineExplain,
              })(<Input.TextArea rows={1} />)}
            </FormItem>
          ),
      },
      {
        title: intl.get(`sqam.common.model.common.taxRate`).d('税率(%)'),
        dataIndex: 'taxRate',
        width: 120,
        render: (val, record) =>
          ChangeBillReadOnly && ChangeItemReadOnly ? (
            val
          ) : (
            <Fragment>
              <FormItem>
                {record.$form.getFieldDecorator('taxId', {
                  initialValue: record.taxId,
                })(
                  <Lov
                    code="SMDM.TAX"
                    textField="taxRate"
                    textValue={val}
                    lovOptions={{ valueField: 'taxId', displayField: 'taxRate' }}
                    queryParams={{ enabledFlag: 1, tenantId: getCurrentOrganizationId() }}
                    onChange={(text, lovRecord) =>
                      this.handleTaxRateChange(text, record, lovRecord)
                    }
                  />
                )}
              </FormItem>
              <FormItem style={{ display: 'none' }}>
                {record.$form.getFieldDecorator('taxRate', {
                  initialValue: record.taxRate,
                })}
              </FormItem>
            </Fragment>
          ),
      },
      basePrice === 'netPrice' && {
        title: intl.get(`sqam.common.model.claimInvoiceBill.netPrice`).d('索赔单价（不含税）'),
        dataIndex: 'netPrice',
        align: 'right',
        width: 180,
        render: (value, record) => {
          const { getFieldDecorator } = record.$form;
          return ChangeBillReadOnly && ChangeItemReadOnly ? (
            thousandBitSeparator(value, pricePrecision)
          ) : (
            <FormItem>
              {getFieldDecorator('netPrice', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`sqam.common.model.claimInvoiceBill.netPrice`)
                        .d('索赔单价（不含税）'),
                    }),
                  },
                  {
                    // eslint-disable-next-line
                    validator: (_, value, callback) => {
                      const currentLength = math.dp(value);
                      if (currentLength > pricePrecision) {
                        callback(intl.get(`sqam.common.model.errMsg`).d(`精度校验不通过`));
                      } else {
                        callback();
                      }
                    },
                  },
                ],
                initialValue: value,
              })(
                <InputNumber
                  style={{ width: '100%' }}
                  precision={
                    record._status === 'create'
                      ? pricePrecision
                      : precisionNumPrice(value, record, 'netPrice')
                  }
                  min={0}
                  allowThousandth
                  disabled={basePrice !== 'netPrice'}
                  onChange={(val) => this.handleNetPriceBlur(val, record)}
                />
              )}
            </FormItem>
          );
        },
      },
      {
        title: intl.get(`sqam.common.model.claimInvoiceBill.noTaxBill`).d('索赔行金额（不含税）'),
        dataIndex: 'lineAmount',
        width: 120,
        align: 'right',
        render: (value, record) => {
          const { getFieldDecorator } = record.$form;
          return ChangeBillReadOnly && ChangeItemReadOnly ? (
            // numberRender(value, 2)
            thousandBitSeparator(value, amountPrecision)
          ) : (
            <ChangeFormItem record={record}>
              {getFieldDecorator(`lineAmount`, {
                initialValue: record.lineAmount,
                rules: [
                  {
                    required: isOffline ? false : !record.disabledNoTax,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`sqam.common.model.claimInvoiceBill.noTaxBill`)
                        .d('索赔行金额（不含税）'),
                    }),
                  },
                  {
                    // eslint-disable-next-line
                    validator: (_, value, callback) => {
                      const currentLength = math.dp(value);
                      if (currentLength > amountPrecision) {
                        callback(intl.get(`sqam.common.model.errMsg`).d(`精度校验不通过`));
                      } else {
                        callback();
                      }
                    },
                  },
                ],
              })(
                <InputNumber
                  disabled={
                    record.disabledNoTax || ['netPrice', 'taxIncludedPrice'].includes(basePrice)
                  }
                  // precision={(value, record, 'lineAmount')}
                  precision={
                    record._status === 'create'
                      ? amountPrecision
                      : precisionNum(value, record, 'lineAmount')
                  }
                  min={0}
                  allowThousandth
                  onChange={(val) => {
                    const {
                      getFieldValue,
                      isFieldTouched,
                      registerField,
                      setFieldsValue,
                      setFields,
                      validateFields,
                    } = record.$form;
                    if (val) {
                      const taxRate =
                        isNil(record.taxId) &&
                        !isFieldTouched('taxId') &&
                        getFieldValue('taxId') === taxRateValue
                          ? taxRateMeaning
                          : getFieldValue('taxRate') || record.taxRate;
                      if (!isNil(taxRate)) {
                        setFieldsValue({
                          taxIncludedLineAmount: math.toFixed(
                            math.multipliedBy(val, math.plus(1, math.div(taxRate, 100))),
                            amountPrecision
                          ),
                        });
                      }
                      registerField('amountFieldFlag');
                      setFieldsValue({ amountFieldFlag: 0 });
                      whetherDisabled({ disabledTax: true, disabledNoTax: false }, record);
                      setFields({
                        taxIncludedLineAmount: {
                          value: record.$form.getFieldValue('taxIncludedLineAmount'),
                          errors: null,
                        },
                      });
                      // record.$form.validateFields(['lineAmount', 'taxIncludedLineAmount'], {
                      //   force: true,
                      // });
                    } else {
                      setFieldsValue({ taxIncludedLineAmount: null });
                      whetherDisabled({ disabledTax: false, disabledNoTax: false }, record);
                      validateFields(['lineAmount', 'taxIncludedLineAmount']);
                    }
                  }}
                />
              )}
            </ChangeFormItem>
          );
        },
      },
      basePrice === 'taxIncludedPrice' && {
        title: intl
          .get(`sqam.common.model.claimInvoiceBill.taxIncludedPrice`)
          .d('索赔单价（含税）'),
        dataIndex: 'taxIncludedPrice',
        align: 'right',
        width: 180,
        render: (value, record) => {
          const { getFieldDecorator } = record.$form;
          return ChangeBillReadOnly && ChangeItemReadOnly ? (
            thousandBitSeparator(value, pricePrecision)
          ) : (
            <FormItem>
              {getFieldDecorator('taxIncludedPrice', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`sqam.common.model.claimInvoiceBill.taxIncludedPrice`)
                        .d('索赔单价（含税）'),
                    }),
                  },
                  {
                    // eslint-disable-next-line
                    validator: (_, value, callback) => {
                      const currentLength = math.dp(value);
                      if (currentLength > pricePrecision) {
                        callback(intl.get(`sqam.common.model.errMsg`).d(`精度校验不通过`));
                      } else {
                        callback();
                      }
                    },
                  },
                ],
                initialValue: value,
              })(
                <InputNumber
                  style={{ width: '100%' }}
                  precision={
                    record._status === 'create'
                      ? pricePrecision
                      : precisionNumPrice(value, record, 'taxIncludedPrice')
                  }
                  disabled={basePrice !== 'taxIncludedPrice'}
                  min={0}
                  allowThousandth
                  onChange={(val) => this.handleTaxPriceBlur(val, record)}
                />
              )}
            </FormItem>
          );
        },
      },
      {
        title: intl.get(`sqam.common.model.claimInvoiceBill.hasTaxBill`).d('索赔行金额（含税）'),
        dataIndex: 'taxIncludedLineAmount',
        width: 130,
        align: 'right',
        render: (value, record) => {
          return ChangeBillReadOnly && ChangeItemReadOnly ? (
            thousandBitSeparator(value, amountPrecision)
          ) : (
            <FormItem record={record}>
              {record.$form.getFieldDecorator(`taxIncludedLineAmount`, {
                initialValue: record.taxIncludedLineAmount,
                rules: [
                  {
                    required: isOffline ? false : !record.disabledTax,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`sqam.common.model.claimInvoiceBill.hasTaxBill`)
                        .d('索赔行金额（含税）'),
                    }),
                  },
                  {
                    // eslint-disable-next-line
                    validator: (_, value, callback) => {
                      const currentLength = math.dp(value);

                      if (currentLength > amountPrecision) {
                        callback(intl.get(`sqam.common.model.errMsg`).d(`精度校验不通过`));
                      } else {
                        callback();
                      }
                    },
                  },
                ],
              })(
                <InputNumber
                  disabled={
                    record.disabledTax || ['netPrice', 'taxIncludedPrice'].includes(basePrice)
                  }
                  min={0}
                  precision={
                    record._status === 'create'
                      ? amountPrecision
                      : precisionNum(value, record, 'lineAmount')
                  }
                  allowThousandth
                  onChange={(val) => {
                    const {
                      getFieldValue,
                      isFieldTouched,
                      // registerField,
                      // setFieldsValue,
                      // setFields,
                      // validateFields,
                    } = record.$form;
                    if (val) {
                      const taxRate =
                        isNil(record.taxId) &&
                        !isFieldTouched('taxId') &&
                        getFieldValue('taxId') === taxRateValue
                          ? taxRateMeaning
                          : getFieldValue('taxRate') || record.taxRate;
                      if (!isNil(taxRate)) {
                        record.$form.setFieldsValue({
                          lineAmount: math.toFixed(
                            math.div(val, math.plus(1, math.div(taxRate, 100))),
                            amountPrecision
                          ),
                        });
                      }
                      whetherDisabled({ disabledTax: false, disabledNoTax: true }, record);
                      record.$form.registerField('amountFieldFlag');
                      record.$form.setFieldsValue({ amountFieldFlag: 1 });
                      record.$form.setFields({
                        lineAmount: {
                          value: record.$form.getFieldValue('lineAmount'),
                          errors: null,
                        },
                      });
                      // record.$form.validateFields(['lineAmount', 'taxIncludedLineAmount'], {
                      //   force: true,
                      // });
                    } else {
                      record.$form.setFieldsValue({ lineAmount: null });
                      whetherDisabled({ disabledTax: false, disabledNoTax: false }, record);
                      record.$form.validateFields(['lineAmount', 'taxIncludedLineAmount']);
                    }
                  }}
                />
              )}
            </FormItem>
          );
        },
      },
      {
        title: intl.get('sqam.common.model.common.jointCode').d('连带物品编码'),
        dataIndex: 'associateItemCode',
        width: 120,
        render: (val, record) =>
          ChangeItemReadOnly ? (
            val
          ) : (
            <FormItem>
              {record.$form.getFieldDecorator('associateItemId', {
                initialValue: record.associateItemId,
              })(
                <Lov
                  code="SQAM.ITEM"
                  onChange={(value, lovRecord) =>
                    this.associateItemCodechange(value, lovRecord, record)
                  }
                  lovOptions={{ valueField: 'itemId', displayField: 'itemCode' }}
                  textValue={val}
                  queryParams={{ enabledFlag: 1, tenantId }}
                />
              )}
            </FormItem>
          ),
      },
      {
        title: intl.get(`sqam.common.model.common.jointUnit`).d('连带物品单位'),
        dataIndex: 'associateItemUomCodeAndName',
        width: 120,
        render: (value, record) =>
          ChangeItemReadOnly ? (
            record.associateItemUomCodeAndName
          ) : (
            <FormItem>
              {record.$form.getFieldDecorator('associateItemUomId', {
                initialValue: record.associateItemUomId,
              })(
                <Lov
                  code="SPRM.UOM"
                  lovOptions={{ valueField: 'uomId', displayField: 'uomCodeAndName' }}
                  textValue={record.associateItemUomCodeAndName}
                  textField="associateItemUomCodeAndName"
                  queryParams={{ tenantId }}
                />
              )}
            </FormItem>
          ),
      },
      {
        title: intl.get('sqam.common.model.common.jointNum').d('连带物品数量'),
        dataIndex: 'associateItemQuantity',
        width: 120,
        render: (value, record) =>
          ChangeItemReadOnly ? (
            // value
            thousandBitSeparator(value)
          ) : (
            <FormItem>
              {record.$form.getFieldDecorator('associateItemQuantity', {
                initialValue: record.associateItemQuantity,
              })(<InputNumber min={0} allowThousandth />)}
            </FormItem>
          ),
      },
      {
        title: intl.get(`hzero.common.remark`).d('备注'),
        dataIndex: 'lineRemark',
        render: (value, record) =>
          ChangeItemReadOnly ? (
            value
          ) : (
            <FormItem>
              {record.$form.getFieldDecorator('lineRemark', {
                initialValue: record.lineRemark,
              })(<TextArea rows={1} />)}
            </FormItem>
          ),
      },
      {
        title: intl.get(`sqam.common.model.common.inspection`).d('关联质检单'),
        dataIndex: 'fromInspectionNum',
        width: 150,
      },
      {
        title: intl.get(`sqam.common.model.qualityRectification.specifications`).d('规格'),
        dataIndex: 'specifications',
        width: 180,
        render: (value, record) =>
          ChangeItemReadOnly ? (
            value
          ) : (
            <Form.Item>
              {record.$form.getFieldDecorator('specifications', {
                initialValue: record.specifications,
              })(<Input />)}
            </Form.Item>
          ),
      },
      {
        title: intl.get(`sqam.common.model.qualityRectification.model`).d('型号'),
        dataIndex: 'model',
        width: 180,
        render: (value, record) =>
          ChangeItemReadOnly ? (
            value
          ) : (
            <Form.Item>
              {record.$form.getFieldDecorator('model', {
                initialValue: record.model,
              })(<Input />)}
            </Form.Item>
          ),
      },
    ].filter((v) => v);
    return customizeTable(
      {
        code: 'SQAM.CLAIM_STATEMENT_DEATIL.ITEM',
      },
      <EditTable
        bordered
        scroll={{ x: 2600 }}
        rowKey="rowKey"
        loading={ListLoading}
        columns={columns}
        dataSource={dataSource}
        pagination={pagination}
        rowSelection={rowSelection}
        onChange={(page) => onChange(page)}
      />
    );
  }
}
