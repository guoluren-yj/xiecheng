/* eslint-disable no-undef */
import React, { Component, Fragment } from 'react';
import { Form, DatePicker, InputNumber, Input } from 'hzero-ui';
import { Button as PermissionButton } from 'components/Permission';
import intl from 'utils/intl';
import { math } from 'choerodon-ui/dataset';
import { precisionNum, decimalPointAccuracy, precisionNumPrice } from '@/routes/utils.js';
import ExcelExportPro from 'components/ExcelExportPro';
import { SRM_SQAM } from '_utils/config';
import DynamicButtons from '_components/DynamicButtons';

import Lov from 'components/Lov';
import Import from 'components/Import';
import EditTable from 'components/EditTable';
import { getCurrentOrganizationId, getDateFormat, getResponse } from 'utils/utils';
import { sum, isEmpty, isNil, throttle } from 'lodash';
import { Bind } from 'lodash-decorators';
import moment from 'moment';

const FormItem = Form.Item;
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
      const unitConfig = res['SQAM.CREATE_CLAIM.DETAIL.LINES'];
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

  @Bind()
  claimItemChange(lovRecord, record) {
    const { $form } = record;
    const { claimItemDesc, claimItemNum } = lovRecord || {};
    if (!$form) return;
    $form.registerField('claimItemNum');
    $form.setFieldsValue({ claimItemDesc, claimItemNum });
  }

  // 价格改变回调
  @Bind()
  handlePriceChange(e, record) {
    const { changeDataSource } = this.props;
    const { $form, taxRate } = record;
    const { getFieldValue, setFieldsValue } = $form;
    const quantity = getFieldValue('quantity');
    const taxFlag = getFieldValue('taxFlag');
    const lineAmount = math.multipliedBy(e, quantity);
    if (e && quantity) {
      if (taxRate && taxFlag) {
        changeDataSource(record, {
          lineAmount,
          taxIncludedLineAmount: math.multipliedBy(
            math.plus(1, math.div(taxRate, 100)),
            lineAmount
          ),
        });
        setFieldsValue({
          lineAmount,
          taxIncludedLineAmount: math.multipliedBy(
            math.plus(1, math.div(taxRate, 100)),
            lineAmount
          ),
        });
      } else {
        changeDataSource(record, { lineAmount, taxIncludedLineAmount: lineAmount });
        setFieldsValue({ lineAmount, taxIncludedLineAmount: lineAmount });
      }
    } else {
      changeDataSource(record, { lineAmount: undefined, taxIncludedLineAmount: undefined });
      setFieldsValue({ lineAmount: undefined, taxIncludedLineAmount: undefined });
    }
  }

  // 税种改变回调
  @Bind()
  handleTaxRateChange(text, record, lovRecord) {
    const { changeDataSource, headerData, basePrice } = this.props;
    const { amountPrecision } = headerData || {};
    const { $form, taxIncludedLineAmount, netPrice, taxIncludedPrice } = record;
    const { getFieldValue, setFieldsValue } = $form;
    const { taxRate } = lovRecord || {};
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
      // 如果没有设置基准价，保持原有逻辑
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
      const lovRecordRatePlus = math.plus(1, math.div(lovRecord.taxRate, 100));
      if (text) {
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

  // 是否含税税改变回调
  @Bind()
  handleTaxFlagChange(e, record) {
    const { changeDataSource } = this.props;
    const { $form, taxRate, lineAmount } = record;
    const { getFieldValue, setFieldsValue } = $form;
    const quantity = getFieldValue('quantity');
    const unitPrice = getFieldValue('unitPrice');
    const taxIncludedLineAmount =
      quantity && unitPrice && taxRate && e.target.checked
        ? math.multipliedBy(math.plus(1, math.div(taxRate, 100)), lineAmount)
        : lineAmount;
    if (!e.target.checked) {
      setFieldsValue({ taxRate: null, taxId: null, taxCode: null });
      changeDataSource(record, { taxRate: null, taxId: null, taxCode: null });
    }
    changeDataSource(record, { taxIncludedLineAmount });
  }

  // 物料编码改变回调
  @Bind()
  itemCodeChange(value, lovRecord, record) {
    const { changeDataSource } = this.props;
    const { $form } = record;
    const { setFieldsValue, registerField } = $form || {};
    const {
      itemId,
      itemCode,
      itemName,
      uomId,
      uomCodeAndName,
      taxId,
      taxCode,
      taxRate,
      uomPrecision,
      specifications,
      model,
    } = lovRecord || {};
    registerField('itemId');
    record.$form.getFieldDecorator(`uomPrecision`, {
      initialValue: uomPrecision,
    });
    record.$form.setFieldsValue({
      uomPrecision,
      quantity: decimalPointAccuracy(record.$form.getFieldsValue().quantity, uomPrecision),
    });
    if (value) {
      setFieldsValue({
        itemId,
        itemCode,
        itemName,
        uomId,
        uomCodeAndName,
        uomPrecision,
        specifications,
        model,
      });
    } else {
      setFieldsValue({ specifications, model });
    }
    if (taxId) {
      setFieldsValue({ taxId, taxCode, taxRate, taxFlag: 1 });
      changeDataSource(record, { taxRate, taxFlag: 1 });
      // 如果存在税率重新计算一下价格
      this.handleTaxRateChange(taxId, record, { taxRate, taxCode, taxId });
    }
  }

  // 连带物料编码改变回调
  @Bind()
  associateItemCodechange(value, lovRecord, record) {
    const { itemId, itemCode, uomCodeAndName, uomId, uomPrecision } = lovRecord || {};
    const {
      $form: { setFieldsValue, registerField },
    } = record;
    registerField('associateItemId');
    record.$form.getFieldDecorator(`associateItemUomPrecision`, {
      initialValue: uomPrecision,
    });
    record.$form.setFieldsValue({
      associateItemUomPrecision: uomPrecision,
      associateItemQuantity: decimalPointAccuracy(
        record.$form.getFieldsValue().associateItemQuantity,
        uomPrecision
      ),
    });
    if (value) {
      setFieldsValue({
        associateItemId: itemId,
        associateItemCode: itemCode,
        associateItemUomId: uomId,
        associateItemUomCodeAndName: uomCodeAndName,
        associateItemUomPrecision: uomPrecision,
      });
    }
  }

  // 单价，数量都填写时，不含税金额为只读-disabled === true
  @Bind()
  getLineAmount(record) {
    const {
      $form: { getFieldValue },
    } = record;
    const unitPrice = getFieldValue('unitPrice');
    const quantity = getFieldValue('quantity');
    if (
      [null, undefined, '', false].includes(unitPrice) ||
      [null, undefined, '', false].includes(quantity)
    ) {
      return false;
    }
    return true;
  }

  @Bind()
  handleNetPriceBlur(val, record) {
    // 需要计算含税单价，含税金额，不含税金额
    const value = val || 0;
    const { changeDataSource, headerData } = this.props;
    const { amountPrecision } = headerData;
    const { pricePrecision } = headerData;
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
    // const isZero = math.eq(value, 0);
    setFieldsValue({
      // taxIncludedPrice: isZero ? null : taxIncludedPrice,
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
    const { pricePrecision } = headerData;
    const { amountPrecision } = headerData;
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
    const isZero = math.eq(value, 0);
    setFieldsValue({
      // netPrice: isZero ? null : netPrice,
      lineAmount: isZero ? null : lineAmount,
      taxIncludedLineAmount: isZero ? null : taxIncludedLineAmount,
      taxIncludedPrice: isZero ? null : math.toFixed(value, pricePrecision),
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

  @Bind()
  headerBtnsRender() {
    const {
      addLine,
      fetchLines,
      deleteLine,
      onImport,
      selectedRowKeys,
      selectedRows,
      formHeaderId,
      isLoading,
      remoteProps,
      headerData,
      lineDataSource,
    } = this.props;
    const { sourceCode } = headerData;
    const btns = [
      {
        name: 'create',
        child: intl.get(`hzero.common.button.create`).d('新建'),
        btnProps: {
          onClick: throttle(addLine, 1500, { trailing: false }),
          loading: isLoading,
        },
      },
      {
        name: 'delete',
        child: intl.get(`hzero.common.button.delete`).d('删除'),
        btnProps: {
          onClick: throttle(deleteLine, 1500, { trailing: false }),
          loading: isLoading,
          disabled: isEmpty(selectedRowKeys),
        },
      },
      sourceCode !== 'INSPECTION' && {
        name: 'newImport',
        btnComp: Import,
        childFor: 'buttonText',
        child: intl.get(`hzero.common.button.newLineImports`).d('(新)项目行导入'),
        btnProps: {
          businessObjectTemplateCode: 'SQAM.CLAIM_ITEM',
          buttonProps: {
            funcType: 'flat',
            style: { border: '1px solid #d9d9d9' },
            icon: 'archive',
            permissionList: [
              {
                code: `srm.sqam.business.claim.sqam.create.claim.list.ps.newimport`,
                type: 'button',
              },
            ],
          },
          prefixPatch: '/sqam',
          args: {
            tenantId: getCurrentOrganizationId(),
            templateCode: 'SQAM.CLAIM_ITEM',
            formHeaderId,
          },
          successCallBack: () => {
            if (fetchLines) fetchLines();
          },
        },
      },
      sourceCode !== 'INSPECTION' && {
        name: 'import',
        btnComp: PermissionButton,
        child: intl.get(`sqam.createClaim.view.button.LineImport`).d('项目行导入'),
        btnProps: {
          icon: 'archive',
          onClick: throttle(() => onImport(), 1500, { trailing: false }),
          permissionList: [
            {
              code: `srm.sqam.business.claim.sqam.create.claim.list.ps.import`,
              type: 'button',
            },
          ],
          loading: isLoading,
        },
      },
      {
        name: 'newExport',
        btnComp: ExcelExportPro,
        buttonText: intl.get('hzero.common.button.newExport').d('(新)导出'),
        btnProps: {
          templateCode: 'SQAM_CLAIM_LINE_CREATE_EXPORT',
          allBody: true,
          method: 'POST',
          requestUrl: `${SRM_SQAM}/v1/${getCurrentOrganizationId()}/claim-form-lines/detail/create-export/${formHeaderId}/new`,
          queryParams: {
            formLineIds: !isEmpty(selectedRows) ? selectedRows.map((v) => v.formLineId) : undefined,
            customizeUnitCode: 'SQAM.CREATE_CLAIM.DETAIL.LINES',
          },
          otherButtonProps: {
            icon: 'unarchive',
            type: 'c7n-pro',
            funcType: 'raised',
            style: {
              marginRight: '5px',
            },
            permissionList: [
              {
                code: `srm.sqam.business.claim.sqam.create.claim.list.button.newLineExport`,
                type: 'button',
              },
            ],
            loading: isLoading,
          },
        },
      },
    ];
    return remoteProps
      ? remoteProps.process('SQAM_CREATE_CLAIM_DETAIL_CUX_LINE_LIST_BTN', btns, {
          headerData,
          lineDataSource,
        })
      : btns;
  }

  render() {
    const {
      fetchLines,
      headerData,
      selectedRowKeys,
      selectedRows,
      onSelectChange,
      ChangeFormItem,
      linepagination,
      lineDataSource,
      whetherDisabled,
      customizeTable = () => {},
      form,
      basePrice,
      remoteProps,
      addLineBatch,
      state,
      handleSetState,
      fetchHeader,
    } = this.props;
    const { taxRateValue, taxRateMeaning } = this.state;
    const { pricePrecision } = headerData;

    const columns = [
      {
        title: intl.get(`sqam.common.model.common.displayNumber`).d('行号'),
        dataIndex: 'displayLineNum',
        width: 80,
        // fixed: true,
      },
      {
        title: intl.get(`sqam.common.model.claimItemCode`).d('索赔项目编码'),
        dataIndex: 'claimItemId',
        width: 180,
        // fixed: true,
        render: (_, record) => (
          <ChangeFormItem record={record}>
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
                  tenantId: getCurrentOrganizationId(),
                  claimTypeId: form.getFieldValue('claimTypeId'),
                  enabledFlag: 1,
                  supplierTenantId: headerData.supplierTenantId,
                  supplierCompanyId: headerData.supplierCompanyId,
                  customizeUnitCode: 'SQAM.CLAIM_TYPE_DEFINITION_LIST.ITEM_GRID',
                }}
                onChange={(val, lovRecord) => this.claimItemChange(lovRecord, record)}
              />
            )}
          </ChangeFormItem>
        ),
      },
      {
        title: intl.get(`sqam.common.model.claimItemDesc`).d('索赔项目描述'),
        dataIndex: 'claimItemDesc',
        width: 150,
        // fixed: true,
        render: (_, record) => (
          <ChangeFormItem record={record}>
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
          </ChangeFormItem>
        ),
      },
      {
        title: intl.get(`sqam.common.date.happenDate`).d('发生日期'),
        dataIndex: 'occurDate',
        width: 180,
        render: (_, record) => (
          <ChangeFormItem record={record}>
            {record.$form.getFieldDecorator('occurDate', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`sqam.common.date.happenDate`).d('发生日期'),
                  }),
                },
              ],
              initialValue: record.occurDate ? moment(record.occurDate) : null,
            })(
              <DatePicker
                format={getDateFormat()}
                disabledDate={(currentDate) => moment().isBefore(currentDate, 'day')}
              />
            )}
          </ChangeFormItem>
        ),
      },
      {
        title: intl.get(`entity.item.code`).d('物料编码'),
        dataIndex: 'itemCode',
        width: 180,
        render: (val, record) => (
          <ChangeFormItem record={record}>
            {record.$form.getFieldDecorator('itemCode', {
              initialValue: record.itemCode,
            })(
              <Lov
                code="SQAM.ITEM"
                textValue={val}
                onChange={(value, lovRecord) => this.itemCodeChange(value, lovRecord, record)}
                lovOptions={{ displayField: 'itemCode' }}
                queryParams={{ enabledFlag: 1, tenantId: getCurrentOrganizationId() }}
              />
            )}
          </ChangeFormItem>
        ),
      },
      {
        title: intl.get(`entity.item.name`).d('物料名称'),
        dataIndex: 'itemName',
        width: 180,
        render: (_, record) => (
          <Form.Item>
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
          </Form.Item>
        ),
      },
      {
        title: intl.get(`sqam.common.model.unit`).d('单位'),
        dataIndex: 'uomCodeAndName',
        width: 150,
        render: (val, record) => (
          <ChangeFormItem record={record}>
            {record.$form.getFieldDecorator('uomId', {
              initialValue: record.uomId,
            })(
              <Lov
                code="SPRM.UOM"
                lovOptions={{ valueField: 'uomId' }}
                textValue={val}
                textField="uomCodeAndName"
                queryParams={{ tenantId: getCurrentOrganizationId() }}
                onChange={(vals, lovRecord) => {
                  const { uomPrecision } = lovRecord;
                  record.$form.getFieldDecorator(`uomPrecision`, {
                    initialValue: uomPrecision,
                  });
                  record.$form.setFieldsValue({
                    uomPrecision,
                    quantity: decimalPointAccuracy(
                      record.$form.getFieldsValue().quantity,
                      uomPrecision
                    ),
                  });
                }}
              />
            )}
          </ChangeFormItem>
        ),
      },
      {
        title: intl.get(`sqam.common.model.common.quantity`).d('数量'),
        dataIndex: 'quantity',
        width: 120,
        render: (val, record) => {
          return (
            <ChangeFormItem record={record}>
              {record.$form.getFieldDecorator(`quantity`, {
                rules: [
                  {
                    required: ['netPrice', 'taxIncludedPrice'].includes(basePrice),
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`sqam.common.model.common.quantity`).d('数量'),
                    }),
                  },
                ],
                initialValue: decimalPointAccuracy(val, record.uomPrecision),
                getValueFromEvent: (event) => {
                  const precision = record.$form.getFieldsValue().uomPrecision;
                  return decimalPointAccuracy(
                    event,
                    typeof precision === 'number' ? precision : record.uomPrecision
                  );
                },
              })(
                <InputNumber
                  min={0}
                  allowThousandth
                  onChange={(value) => {
                    this.handleQuantityChange(value, record);
                  }}
                />
              )}
            </ChangeFormItem>
          );
        },
      },
      {
        title: intl.get(`sqam.common.model.claimState`).d('索赔说明'),
        dataIndex: 'lineExplain',
        width: 180,
        render: (_, record) => (
          <ChangeFormItem record={record}>
            {record.$form.getFieldDecorator(`lineExplain`, {
              initialValue: record.lineExplain,
            })(<Input.TextArea rows={1} />)}
          </ChangeFormItem>
        ),
      },
      {
        title: intl.get(`sqam.common.model.common.taxRate`).d('税率(%)'),
        dataIndex: 'taxRate',
        width: 120,
        render: (val, record) => {
          return (
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
                  })(<div />)}
            </ChangeFormItem>
          );
        },
      },
      basePrice === 'netPrice' && {
        title: intl.get(`sqam.common.model.claimInvoiceBill.netPrice`).d('索赔单价（不含税）'),
        dataIndex: 'netPrice',
        align: 'right',
        width: 180,
        render: (value, record) => {
          const { getFieldDecorator } = record.$form;
          return (
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
                      if (value === 0) {
                        callback(intl.get(`sqam.common.view.message.zero`).d(`请输入大于0的数字`));
                      }
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
        width: 180,
        align: 'right',
        render: (value, record) => {
          const { amountPrecision, expenseProcessTypeDescription } = headerData || {};
          return (
            <ChangeFormItem record={record}>
              {record.$form.getFieldDecorator(`lineAmount`, {
                initialValue: value,

                rules: [
                  {
                    required:
                      expenseProcessTypeDescription === 'offline'
                        ? !expenseProcessTypeDescription
                        : !record.disabledNoTax,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`sqam.common.model.claimInvoiceBill.noTaxBill`)
                        .d('索赔行金额（不含税）'),
                    }),
                  },

                  {
                    // eslint-disable-next-line
                    validator: (_, value, callback) => {
                      if (value === 0) {
                        callback(intl.get(`sqam.common.view.message.zero`).d(`请输入大于0的数字`));
                      }
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
                  style={{ width: '100%' }}
                  min={0}
                  precision={
                    record._status === 'create'
                      ? amountPrecision
                      : precisionNum(value, record, 'lineAmount')
                  }
                  allowThousandth
                  // {...precisionParams(_, true)}
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
          return (
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
                      if (value === 0) {
                        callback(intl.get(`sqam.common.view.message.zero`).d(`请输入大于0的数字`));
                      }
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
        width: 180,
        align: 'right',
        render: (value, record) => {
          const { amountPrecision, expenseProcessTypeDescription } = headerData || {};
          return (
            <FormItem record={record}>
              {record.$form.getFieldDecorator(`taxIncludedLineAmount`, {
                initialValue: value,
                rules: [
                  {
                    required:
                      expenseProcessTypeDescription === 'offline'
                        ? !expenseProcessTypeDescription
                        : !record.disabledTax,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`sqam.common.model.claimInvoiceBill.hasTaxBill`)
                        .d('索赔行金额（含税）'),
                    }),
                  },
                  {
                    // eslint-disable-next-line
                    validator: (_, value, callback) => {
                      if (value === 0) {
                        callback(intl.get(`sqam.common.view.message.zero`).d(`请输入大于0的数字`));
                      }
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
                  style={{ width: '100%' }}
                  min={0}
                  precision={
                    record._status === 'create'
                      ? amountPrecision
                      : precisionNum(value, record, 'lineAmount')
                  }
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
                      if (!isNil(taxRate)) {
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
                      validateFields(['lineAmount', 'taxIncludedLineAmount']);
                    }
                  }}
                />
              )}
            </FormItem>
          );
        },
      },
      {
        title: intl.get(`sqam.common.model.common.jointCode`).d('连带物品编码'),
        dataIndex: 'associateItemCode',
        width: 180,
        render: (val, record) => (
          <ChangeFormItem record={record}>
            {record.$form.getFieldDecorator(`associateItemCode`, {
              initialValue: record.associateItemCode,
            })(
              <Lov
                code="SQAM.ITEM"
                onChange={(value, lovRecord) =>
                  this.associateItemCodechange(value, lovRecord, record)
                }
                lovOptions={{ displayField: 'itemCode' }}
                textValue={val}
                queryParams={{ enabledFlag: 1, tenantId: getCurrentOrganizationId() }}
              />
            )}
          </ChangeFormItem>
        ),
      },
      {
        title: intl.get(`sqam.common.model.common.jointUnit`).d('连带物品单位'),
        dataIndex: 'associateItemUomCodeAndName',
        width: 150,
        render: (val, record) => (
          <ChangeFormItem record={record}>
            {record.$form.getFieldDecorator('associateItemUomId', {
              initialValue: record.associateItemUomId,
            })(
              <Lov
                code="SPRM.UOM"
                lovOptions={{ valueField: 'uomId' }}
                textValue={val}
                textField="associateItemUomCodeAndName"
                queryParams={{ tenantId: getCurrentOrganizationId() }}
                onChange={(vals, lovRecord) => {
                  const { uomPrecision } = lovRecord;
                  record.$form.getFieldDecorator(`associateItemUomPrecision`, {
                    initialValue: uomPrecision,
                  });
                  record.$form.setFieldsValue({
                    associateItemUomPrecision: uomPrecision,
                    associateItemQuantity: decimalPointAccuracy(
                      record.$form.getFieldsValue().associateItemQuantity,
                      uomPrecision
                    ),
                  });
                }}
              />
            )}
          </ChangeFormItem>
        ),
      },
      {
        title: intl.get(`sqam.common.model.common.jointNum`).d('连带物品数量'),
        dataIndex: 'associateItemQuantity',
        width: 150,
        render: (_, record) => {
          return (
            <ChangeFormItem record={record}>
              {record.$form.getFieldDecorator(`associateItemQuantity`, {
                initialValue: decimalPointAccuracy(_, record.uomPrecision),
                getValueFromEvent: (event) => {
                  const precision = record.$form.getFieldsValue().associateItemUomPrecision;
                  return decimalPointAccuracy(
                    event,
                    typeof precision === 'number' ? precision : record.associateItemUomPrecision
                  );
                },
              })(<InputNumber min={0} allowThousandth />)}
            </ChangeFormItem>
          );
        },
      },
      {
        title: intl.get(`hzero.common.remark`).d('备注'),
        dataIndex: 'lineRemark',
        width: 180,
        render: (_, record) => (
          <ChangeFormItem record={record}>
            {record.$form.getFieldDecorator(`lineRemark`, {
              initialValue: record.lineRemark,
            })(<Input.TextArea rows={1} />)}
          </ChangeFormItem>
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
        render: (_, record) => (
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
        render: (_, record) => (
          <Form.Item>
            {record.$form.getFieldDecorator('model', {
              initialValue: record.model,
            })(<Input />)}
          </Form.Item>
        ),
      },
    ].filter((v) => v);
    const rowSelection = {
      selectedRowKeys,
      onChange: onSelectChange,
    };
    const tableColumns = remoteProps
      ? remoteProps.process('SQAM_CREATE_CLAIM_DETAIL_CUX_LINE_COLUMNS', columns, {
          form,
          headerData,
          lineDataSource,
        })
      : columns;
    const lineData = remoteProps
      ? remoteProps.process('SQAM_CREATE_CLAIM_DETAIL_CUX_LINE_DATA', lineDataSource, {
          form,
          headerData,
          state,
        })
      : lineDataSource;
    const tableProps = {
      bordered: true,
      columns: tableColumns,
      rowKey: 'rowKey',
      rowSelection,
      pagination: { ...linepagination, pageSizeOptions: ['10', '20', '50', '100', '500', '1000'] },
      onChange: fetchLines,
      dataSource: lineData,
      scroll: { x: sum(columns.map((n) => n.width)) },
    };
    return (
      <Fragment>
        <Form layout="inline">
          <DynamicButtons buttons={this.headerBtnsRender()} />
          {remoteProps
            ? remoteProps.process('SQAM_CREATE_CLAIM_DETAIL_CUX_LINE_BTN', '', {
                form,
                headerData,
                addLineBatch,
                taxRateValue,
                taxRateMeaning,
                lineData,
                handleSetState,
                selectedRowKeys,
                selectedRows,
                fetchLines,
                fetchHeader,
              })
            : null}
        </Form>
        {customizeTable(
          {
            code: 'SQAM.CREATE_CLAIM.DETAIL.LINES',
          },
          <EditTable {...tableProps} />
        )}
      </Fragment>
    );
  }
}
