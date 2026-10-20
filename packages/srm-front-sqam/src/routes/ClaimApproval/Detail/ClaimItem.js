import React, { Component, Fragment } from 'react';
import { Form, InputNumber, Input } from 'hzero-ui';
import intl from 'utils/intl';
import { math } from 'choerodon-ui/dataset';
// import { numberRender } from 'utils/renderer';
import { dateRender } from 'utils/renderer';
import EditTable from 'components/EditTable';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import { sum, isNil } from 'lodash';
import { thousandBitSeparator, precisionNum } from '@/routes/utils.js';
import Lov from 'components/Lov';
import { Bind } from 'lodash-decorators';

const FormItem = Form.Item;

// function numberFormat(val) {
//   const count = countDecimals(val);
//   return isNumber(val) && !isNaN(val) ? numberRender(val, count <= 2 ? 2 : count) : val;
// }

// function countDecimals (val) {
//   return isNaN(+val) || (isNumber(val) && Math.floor(val) !== val)
//     ? `${val}`.split('.')[1].length || 0
//     : 0;
// }
export default class ClaimItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      taxRateValue: '',
      taxRateMeaning: '',
    };
    const { queryUnitConfig } = props;
    // 修复拿不到lov的默认meaning问题
    queryUnitConfig({}, (res) => {
      if (!getResponse(res)) return;
      const unitConfig = res['SQAM.CLAIM_APPROVAL_DETAIL.CLIAM_ITEM'];
      if (unitConfig) {
        const { fields } = unitConfig;
        const taxRateField = fields.find((item) => item.fieldCode === 'taxRate');
        if (taxRateField && taxRateField.defaultValue && taxRateField.defaultValueMeaning) {
          this.setState({
            taxRateValue: taxRateField.defaultValue,
            taxRateMeaning: taxRateField.defaultValueMeaning,
          });
        }
      }
    });
  }

  // 税种改变回调
  @Bind()
  handleTaxRateChange(text, record, lovRecord) {
    const { changeDataSource, headerData } = this.props;
    const { amountPrecision } = headerData || {};
    const { $form, taxIncludedLineAmount } = record;
    const { getFieldValue, setFieldsValue } = $form;
    const { taxRate } = lovRecord;
    const quantity = getFieldValue('quantity');
    const unitPrice = getFieldValue('unitPrice');
    const taxFlag = getFieldValue('taxFlag');
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

  render() {
    const {
      remote,
      fetchLines,
      pagination,
      lineDateSource,
      fetchLinesLoading,
      customizeTable,
      ChangeFormItem,
      headerData,
      whetherDisabled,
      editFlag,
    } = this.props;
    const { taxRateValue, taxRateMeaning } = this.state;
    const { claimAmountMaintainMode = '' } = headerData;
    const newColumns = [
      {
        title: intl.get(`sqam.common.model.common.displayNumber`).d('行号'),
        dataIndex: 'displayLineNum',
        width: 100,
        // fixed: true,
      },
      {
        title: intl.get(`sqam.common.model.claimItemCode`).d('索赔项目编码'),
        dataIndex: 'claimItemNum',
        width: 180,
        // fixed: true,
      },
      {
        title: intl.get(`sqam.common.model.claimItemDesc`).d('索赔项目描述'),
        dataIndex: 'claimItemDesc',
        width: 150,
        // fixed: true,
      },
      {
        title: intl.get(`sqam.common.date.happenDate`).d('发生日期'),
        dataIndex: 'occurDate',
        width: 180,
        render: dateRender,
      },
      {
        title: intl.get(`entity.item.code`).d('物料编码'),
        dataIndex: 'itemCode',
        width: 180,
      },
      {
        title: intl.get(`entity.item.name`).d('物料名称'),
        dataIndex: 'itemName',
        width: 180,
      },
      {
        title: intl.get(`sqam.common.model.unit`).d('单位'),
        dataIndex: 'uomCodeAndName',
        width: 100,
      },
      // {
      //   title: intl.get(`sqam.common.model.unitPrice`).d('单价'),
      //   dataIndex: 'unitPrice',
      //   align: 'right',
      //   width: 120,
      // },
      {
        title: intl.get(`sqam.common.model.common.quantity`).d('数量'),
        dataIndex: 'quantity',
        width: 120,
        render: (text) => {
          return text?thousandBitSeparator(Number(text)):null;
        },
      },
      claimAmountMaintainMode === 'netPrice' && {
        title: intl.get(`sqam.common.model.claimInvoiceBill.netPrice`).d('索赔单价（不含税）'),
        dataIndex: 'netPrice',
        width: 120,
        render: (text, record) => thousandBitSeparator(text, record.pricePrecision),
      },
      claimAmountMaintainMode === 'taxIncludedPrice' && {
        title: intl
          .get(`sqam.common.model.claimInvoiceBill.taxIncludedPrice`)
          .d('索赔单价（含税）'),
        dataIndex: 'taxIncludedPrice',
        width: 120,
        render: (text, record) => thousandBitSeparator(text, record.pricePrecision),
      },
      {
        title: intl.get(`sqam.common.model.claimState`).d('索赔说明'),
        dataIndex: 'lineExplain',
        width: 180,
        render: (_, record) => {
          return headerData.approvalMethod === 'FUC_AND_EXTERNAL_APPROVE' ? (
            <ChangeFormItem record={record}>
              {record.$form.getFieldDecorator(`lineExplain`, {
                initialValue: record.lineExplain,
              })(<Input.TextArea rows={1} />)}
            </ChangeFormItem>
          ) : (
            record.$form.getFieldDecorator(`lineExplain`, {
              initialValue: record.lineExplain,
            })(<div>{record.lineExplain}</div>)
          );
        },
      },
      // {
      //   title: intl.get(`sqam.common.model.isIncludeTax`).d('是否含税'),
      //   dataIndex: 'taxFlag',
      //   width: 90,
      //   render: val => yesOrNoRender(val),
      // },
      {
        title: intl.get(`sqam.common.model.common.taxRate`).d('税率(%)'),
        dataIndex: 'taxRate',
        width: 120,
        render: (val, record) => {
          return headerData.approvalMethod === 'FUC_AND_EXTERNAL_APPROVE' || editFlag ? (
            <ChangeFormItem record={record}>
              {['create', 'update'].includes(record._status)
                ? record.$form.getFieldDecorator('taxId', {
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
                  )
                : record.$form.getFieldDecorator('taxRate', {
                    initialValue: record.taxRate,
                  })(<div>{record.taxRate}</div>)}
            </ChangeFormItem>
          ) : (
            record.$form.getFieldDecorator('taxRate', {
              initialValue: record.taxRate,
            })(<div>{record.taxRate}</div>)
          );
        },
      },
      {
        title: intl.get(`sqam.common.model.claimInvoiceBill.noTaxBill`).d('索赔行金额（不含税）'),
        dataIndex: 'lineAmount',
        width: 120,
        align: 'right',
        // render: (val) => (val ? numberFormat(val) : null),
        // render: (val, record) => thousandBitSeparator(val, record.amountPrecision),
        render: (value, record) => {
          const { amountPrecision } = headerData || {};
          return (headerData.approvalMethod === 'FUC_AND_EXTERNAL_APPROVE' || editFlag) &&
            !['netPrice', 'taxIncludedPrice'].includes(claimAmountMaintainMode) ? (
              <ChangeFormItem record={record}>
                {record.$form.getFieldDecorator(`lineAmount`, {
                initialValue: record.lineAmount,
                rules: [
                  {
                    required: !record.disabledNoTax,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`sqam.common.model.claimInvoiceBill.noTaxBill`)
                        .d('索赔行金额（不含税）'),
                    }),
                  },
                  {
                    // eslint-disable-next-line
                    validator: (_, value, callback) => {
                      const currentLength = Number(value).toString().split('.')[1]
                        ? Number(value).toString().split('.')[1].length
                        : 0;
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
                  autoFocus
                  disabled={record.disabledNoTax}
                  min={0}
                  precision={precisionNum(value, record, 'lineAmount')}
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
                    // setFieldsValue({
                    //   lineAmount: Number(val).toFixed(record.amountPrecision),
                    // });
                    if (val) {
                      // 因为 lov默认值暂时拿不到displayField，则没有编辑过、没有税率后端传值,默认值有值时使用个性化税率值
                      const taxRate =
                        isNil(record.taxId) &&
                        !isFieldTouched('taxId') &&
                        getFieldValue('taxId') === taxRateValue
                          ? taxRateMeaning
                          : getFieldValue('taxRate') || record.taxRate;
                      if (taxRate) {
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
                    } else {
                      setFieldsValue({ taxIncludedLineAmount: null });
                      whetherDisabled({ disabledTax: false, disabledNoTax: false }, record);
                      validateFields(['lineAmount', 'taxIncludedLineAmount'], {
                        force: true,
                      });
                    }
                  }}
                />
              )}
              </ChangeFormItem>
          ) : (
            record.$form.getFieldDecorator(`lineAmount`, {
              initialValue: record.lineAmount,
            })(<div>{thousandBitSeparator(record.lineAmount, record.amountPrecision)}</div>)
          );
        },
      },
      {
        title: intl.get(`sqam.common.model.claimInvoiceBill.hasTaxBill`).d('索赔行金额（含税）'),
        dataIndex: 'taxIncludedLineAmount',
        width: 120,
        align: 'right',
        // render: (val) => (val ? numberFormat(val) : null),
        // render: (val, record) => thousandBitSeparator(val, record.amountPrecision),
        render: (value, record) => {
          const { amountPrecision } = headerData || {};
          // return headerData.approvalMethod === 'FUC_AND_EXTERNAL_APPROVE' ? 1 : 2
          return (headerData.approvalMethod === 'FUC_AND_EXTERNAL_APPROVE' || editFlag) &&
            !['netPrice', 'taxIncludedPrice'].includes(claimAmountMaintainMode) ? (
              <FormItem record={record}>
                {record.$form.getFieldDecorator(`taxIncludedLineAmount`, {
                initialValue: record.taxIncludedLineAmount,
                rules: [
                  {
                    required: !record.disabledTax,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`sqam.common.model.claimInvoiceBill.hasTaxBill`)
                        .d('索赔行金额（含税）'),
                    }),
                  },
                  {
                    // eslint-disable-next-line
                    validator: (_, value, callback) => {
                      const currentLength = Number(value).toString().split('.')[1]
                        ? Number(value).toString().split('.')[1].length
                        : 0;

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
                  disabled={record.disabledTax}
                  min={0}
                  precision={precisionNum(value, record, 'lineAmount')}
                  allowThousandth
                  // {...precisionParams(record.localFinancialPrecision, true)}
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
                      // 因为 lov默认值暂时拿不到displayField，则没有编辑过、没有税率后端传值,默认值有值时使用个性化税率值
                      const taxRate =
                        isNil(record.taxId) &&
                        !isFieldTouched('taxId') &&
                        getFieldValue('taxId') === taxRateValue
                          ? taxRateMeaning
                          : getFieldValue('taxRate') || record.taxRate;
                      if (taxRate) {
                        record.$form.setFieldsValue({
                          lineAmount: math.toFixed(
                            math.div(val, math.plus(1, math.div(taxRate, 100))),
                            amountPrecision
                          ),
                        });
                      }
                      whetherDisabled({ disabledTax: false, disabledNoTax: true }, record);
                      registerField('amountFieldFlag');
                      setFieldsValue({ amountFieldFlag: 1 });
                      setFields({
                        lineAmount: {
                          value: getFieldValue('lineAmount'),
                          errors: null,
                        },
                      });
                    } else {
                      setFieldsValue({ lineAmount: null });
                      whetherDisabled({ disabledTax: false, disabledNoTax: false }, record);
                      validateFields(['lineAmount', 'taxIncludedLineAmount'], {
                        force: true,
                      });
                    }
                  }}
                />
              )}
              </FormItem>
          ) : (
            record.$form.getFieldDecorator(`taxIncludedLineAmount`, {
              initialValue: record.taxIncludedLineAmount,
            })(
              <div>
                {thousandBitSeparator(record.taxIncludedLineAmount, record.amountPrecision)}
              </div>
            )
          );
        },
      },
      {
        title: intl.get(`sqam.common.model.common.jointCode`).d('连带物品编码'),
        dataIndex: 'associateItemCode',
        width: 180,
      },
      {
        title: intl.get(`sqam.common.model.common.jointUnit`).d('连带物品单位'),
        dataIndex: 'associateItemUomCodeAndName',
        width: 150,
      },
      {
        title: intl.get(`sqam.common.model.common.jointNum`).d('连带物品数量'),
        dataIndex: 'associateItemQuantity',
        width: 150,
        render: (text) => thousandBitSeparator(text),
      },
      {
        title: intl.get(`hzero.common.remark`).d('备注'),
        dataIndex: 'lineRemark',
        width: 180,
      },
      {
        title: intl.get(`sqam.common.model.common.inspection`).d('关联质检单'),
        dataIndex: 'fromInspectionNum',
        width: 150,
      },
      {
        title: intl.get(`sqam.common.model.qualityRectification.specifications`).d('规格'),
        dataIndex: 'specifications',
        width: 150,
      },
      {
        title: intl.get(`sqam.common.model.qualityRectification.model`).d('型号'),
        dataIndex: 'model',
        width: 150,
      }, 
    ].filter((v) => v);
    const columns = remote
    ?remote.process("SQAM_CLAIM_APPROVAL_DETAIL_CLAIM_ITEM_COLUMNS",newColumns,{_this:this})
    :newColumns;
    const tableProps = {
      bordered: true,
      columns,
      rowKey: 'rowKey',
      onChange: fetchLines,
      pagination,
      dataSource: lineDateSource,
      loading: fetchLinesLoading,
      scroll: { x: sum(columns.map((n) => n.width)) },
    };
    return (
      <Fragment>
        {customizeTable(
          {
            code: 'SQAM.CLAIM_APPROVAL_DETAIL.CLIAM_ITEM',
          },
          <EditTable {...tableProps} />
        )}
      </Fragment>
    );
  }
}
