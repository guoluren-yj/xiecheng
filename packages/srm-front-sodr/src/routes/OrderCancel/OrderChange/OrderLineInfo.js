/**
 * index - 订单变更明细行信息
 * @date: 2020-03-04
 * @author: maojaiqi <jiaqi.mao@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import React, { Component, createRef } from 'react';
import { Form, InputNumber, DatePicker, Tooltip, Select, Input, Button } from 'hzero-ui';
import { Bind, Debounce } from 'lodash-decorators';
import { isNumber, sum, toString, isEmpty, isNil } from 'lodash';
import moment from 'moment';

import intl from 'utils/intl';
import DocFlow from '_components/DocFlow';
import {
  getDateFormat,
  getCurrentOrganizationId,
  getCurrentUserId,
  getUserOrganizationId,
} from 'utils/utils';
import EditTable from 'components/EditTable';
import Lov from 'components/Lov';
import { TooltipLov, TooltipInput } from '@/routes/components/TooltipFormItem';
import UploadModal from 'components/Upload';
import notification from 'utils/notification';
import DynamicButtons from '_components/DynamicButtons';
import { NOT_CHINA_PHONE, PHONE } from 'utils/regExp';

import {
  parseAumont,
  formatAumont,
  redirectToOther,
  getPrecision,
  getDynamicLabel,
  conversionUpdateForH0,
  conversionUpdateUomIdForH0,
} from '@/routes/components/utils';
import { math } from 'choerodon-ui/dataset';
import PhoneRender from '@/routes/QuotePurchaseRequisition/components/PhoneRender';
import { BUCKET_NAME, MAX_QUAN_NUMBER, LINE_DIRECTORY } from '@/routes/components/utils/constant';
import styles from './index.less';

const FormItem = Form.Item;
const tenantId = getCurrentOrganizationId();
const userId = getCurrentUserId();
const userOrganizationId = getUserOrganizationId();

export default class OrderLineInfo extends Component {
  constructor(props) {
    super(props);
    this.table = createRef();
    if (props.onRef) props.onRef(this.table);
    this.state = {
      invInventoryVisible: new Map(),
      invLocationVisible: new Map(),
      requiredFieldNames: [],
      selectOptionKey: 'needByDate', // 批量维护选中字段
      calcLoading: false,
    };
  }

  // 行字段是否配置可修改
  @Bind()
  isDisabledFields(record, item) {
    const { changeFields = [] } = this.props;
    const isDisabled = !changeFields.includes(item);
    if (item === 'subSupplierId') {
      return isDisabled && !changeFields.includes('subErpSupplierId');
    }
    return record.cancelledFlag || record.closedFlag || isDisabled;
  }

  /**
   * 改变对应Lov提示文字显隐
   * @param {String} field 字段
   * @param {String} value 值
   */
  @Bind()
  handleInventoryVisible(prLineId, value) {
    this.setState((prevState) => ({
      invInventoryVisible: prevState.invInventoryVisible.set(prLineId, !!value),
    }));
  }

  /**
   * 改变对应Lov提示文字显隐
   * @param {String} field 字段
   * @param {String} value 值
   */
  @Bind()
  handleLocationVisible(prLineId, value) {
    this.setState((prevState) => ({
      invLocationVisible: prevState.invLocationVisible.set(prLineId, !!value),
    }));
  }

  // @Bind()
  // handleChangeItem() {
  //   const { onHandleChangeItem } = this.props;
  //   onHandleChangeItem();
  // }

  /**
   * 改变账户分配类别进行必输校验
   */
  @Bind()
  handleAssignTypeChange(val, dataList, record) {
    // this.handleChangeItem();
    const { requiredFieldNames = [], accountAssignTypeId, accountAssignTypeCode } = dataList;
    const {
      $form: { setFieldsValue },
    } = record;
    // 获取上次必填列表
    // const oldRequiredFieldList = getFieldValue('requiredFieldNames') || [];
    setFieldsValue({ requiredFieldNames, accountAssignTypeId, accountAssignTypeCode });
    this.setState({
      requiredFieldNames,
    });
    // this.setState({}, () => {
    //   validateFields([...oldRequiredFieldList], { force: true });
    // });
  }

  @Bind()
  handleChangeAccountSubject(record, lovRecord) {
    // this.handleChangeItem();
    record.$form.setFieldsValue({
      accountSubjectNum: lovRecord.accountSubjectNum,
    });
  }

  @Bind()
  handleChangeCost(record, lovRecord) {
    // this.handleChangeItem();
    record.$form.setFieldsValue({
      costCode: lovRecord.costCode,
    });
  }

  @Bind()
  handleChangeWbs(record, lovRecord) {
    // this.handleChangeItem();
    record.$form.setFieldsValue({
      wbs: lovRecord.wbsName,
    });
  }

  /**
   * 收货组织级联改变回调函数
   * @param {*} value
   * @param {*} field
   * @param {*} record - 表格行信息
   */
  @Bind()
  handleOriginationLovChange(value, field, record) {
    record.$form.setFieldsValue({
      invInventoryId: undefined,
      invInventoryName: undefined,
      invLocationId: undefined,
      invLocationName: undefined,
    });
  }

  @Bind()
  calculateDoubleUom(payload) {
    const { dispatch } = this.props;
    return dispatch({
      type: 'quotePurchaseRequisition/calculateDoubleUom',
      payload,
    });
  }

  @Bind()
  @Debounce(800)
  handleSecondaryNumChange(value, record) {
    const { doubleUnitEnabled } = this.props;
    if (!doubleUnitEnabled) return;
    const itemCode = record.$form.getFieldValue('itemCode');
    if (!value) return;
    if (!(doubleUnitEnabled && itemCode && value !== record.secondaryReceiptsOrderQuantity)) {
      record.$form.getFieldDecorator('quantity', { initialValue: record.quantity });
      record.$form.setFieldsValue({ quantity: value });
    } else {
      conversionUpdateForH0({
        record,
        doubleUnitEnabled,
        fieldInfo: value,
        businessKeyField: 'poLineId',
        query: this.calculateDoubleUom,
        clearQuantity: true,
      });
    }
  }

  /**
   * 收货库房级联改变回调函数
   * @param {*} value
   * @param {*} field
   */
  @Bind()
  handleInvInventoryLovChange(value, field, record) {
    record.$form.setFieldsValue({
      invLocationId: undefined,
      invLocationName: undefined,
    });
  }

  @Bind()
  getColumns() {
    const {
      // handleChangeItemList = e => e,
      ouId,
      companyId,
      freeFlag,
      openBOMModal,
      amountFinancialPrecision,
      headerInfo,
      doubleUnitEnabled,
      enumMap: { purchaseLineType = [], internationalTelCode = [] },
      handleTranslate = () => {},
      handleSetChangeFlag = () => {},
    } = this.props;
    const { invInventoryVisible, invLocationVisible } = this.state;
    const sodrEnabled = doubleUnitEnabled !== 0;
    const columns = [
      {
        title: intl.get(`sodr.common.model.common.translate`).d('拆分'),
        dataIndex: 'translate',
        width: 60,
        render: (__, record) => (
          <a
            disabled={record._status === 'create' || record.cancelledFlag || record.closedFlag}
            onClick={() => handleTranslate(record)}
          >
            {intl.get(`sodr.common.model.common.translate`).d('拆分')}
          </a>
        ),
      },
      {
        title: intl.get(`sodr.common.model.common.displayAsnLineNum`).d('行号'),
        dataIndex: 'displayLineNum',
        width: 150,
      },
      {
        title: intl.get(`sodr.common.model.common.displayLineLocationNum`).d('发运号'),
        dataIndex: 'displayLineLocationNum',
        width: 150,
      },
      {
        title: intl.get(`entity.item.code`).d('物料编码'),
        dataIndex: 'itemCode',
        width: 150,
        render: (val, record) => (
          <FormItem>
            {record.$form.getFieldDecorator('itemCode', {
              initialValue: val,
            })(<span>{val}</span>)}
            {record.$form.getFieldDecorator('itemId', {
              initialValue: record.itemId,
            })}
          </FormItem>
        ),
      },
      {
        title: intl.get(`entity.item.name`).d('物料名称'),
        dataIndex: 'itemName',
        width: 150,
        render: (val, record) => {
          const { getFieldDecorator } = record.$form;
          return !(record.itemId || this.isDisabledFields(record, 'itemName')) ? (
            <FormItem>
              {getFieldDecorator('itemName', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`sodr.quotePurchase.model.quotePurchase.itemName`)
                        .d('物料名称'),
                    }),
                  },
                ],
                initialValue: val,
              })(<TooltipInput tipValue={record.$form.getFieldValue('itemName')} />)}
            </FormItem>
          ) : (
            <Tooltip title={val}>{val}</Tooltip>
          );
        },
      },
      {
        title: intl.get(`sodr.common.model.common.categoryName`).d('物料分类'),
        dataIndex: 'categoryId',
        width: 180,
        render: (val, record) => (
          <FormItem>
            {record.$form.getFieldDecorator('categoryId', {
              initialValue: val,
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`sodr.common.model.common.categoryName`).d('物料分类'),
                  }),
                },
              ],
            })(
              <TooltipLov
                tipValue={record.$form.getFieldValue('categoryName')}
                code="SMDM.CATEGORY.LEVEL_CONTROL_TREE"
                textField="categoryName"
                textValue={record.categoryName}
                lovOptions={{ valueField: 'categoryId', displayField: 'categoryName' }}
                queryParams={{
                  tenantId,
                  enabledFlag: 1,
                  hzeroUIFlag: 1,
                  itemId: record.itemId,
                  businessObjectCode: 'SRM_C_SRM_SODR_PO_HEADER',
                }}
                onChange={this.handleChangeItem}
                tableDsProps={{
                  record: {
                    dynamicProps: {
                      selectable: (_record) => _record.get('isCheck') !== false,
                    },
                  },
                }}
                disabled={this.isDisabledFields(record, 'categoryId')}
              />
            )}
            {record.$form.getFieldDecorator('categoryName', {
              initialValue: record.categoryName,
            })}
          </FormItem>
        ),
      },
      {
        title: intl.get(`sodr.common.model.common.commonName`).d('通用名'),
        dataIndex: 'commonName',
        width: 150,
      },
      sodrEnabled && {
        title: intl.get(`sodr.common.model.number`).d('数量'),
        dataIndex: 'secondaryQuantity',
        width: 150,
        render: (val, record) => (
          <FormItem>
            {record.$form.getFieldDecorator('secondaryQuantity', {
              initialValue: val,
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`sodr.common.model.number`).d('数量'),
                  }),
                },
              ],
            })(
              <InputNumber
                max={MAX_QUAN_NUMBER}
                disabled={this.isDisabledFields(record, 'secondaryQuantity')}
                onChange={(value) => this.handleSecondaryNumChange(value, record)}
                parser={(value) => parseAumont(value, record.secondaryUomPrecision)}
                allowThousandth="true"
              />
            )}
          </FormItem>
        ),
      },
      sodrEnabled && {
        title: intl.get(`sodr.common.model.common.uomNames`).d('单位'),
        dataIndex: 'secondaryUomId',
        width: 150,
        render: (val, record) => {
          return (
            <FormItem>
              {record.$form.getFieldDecorator('secondaryUomId', {
                initialValue: record.secondaryUomId,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('sodr.common.model.common.uomNames').d('单位'),
                    }),
                  },
                ],
              })(
                <Lov
                  code="SMDM_ITEM_ORG_UOM"
                  lovOptions={{ valueField: 'uomId' }}
                  textField="secondaryUomCodeAndName"
                  queryParams={{
                    itemId: record.itemId,
                    primaryUomId: record.$form.getFieldValue('uomId'),
                  }}
                  disabled={this.isDisabledFields(record, 'secondaryUomId')}
                  onChange={(_, lov) => {
                    conversionUpdateUomIdForH0({
                      record,
                      fieldName: 'uom',
                      fieldProps: lov,
                      doubleUnitEnabled,
                      loading: this.calcLoading,
                      calc: this.calculateDoubleUom,
                    });
                  }}
                />
              )}
              {record.$form.getFieldDecorator('secondaryUomName', {
                initialValue: record.secondaryUomName,
              })}
              {record.$form.getFieldDecorator('secondaryUomCode', {
                initialValue: record.secondaryUomCode,
              })}
              {record.$form.getFieldDecorator('secondaryUomCodeAndName', {
                initialValue: record.secondaryUomCodeAndName,
              })}
              {record.$form.getFieldDecorator('secondaryUomPrecision', {
                initialValue: record.secondaryUomPrecision,
              })}
            </FormItem>
          );
        },
      },
      {
        title: getDynamicLabel(sodrEnabled, 'quantity'),
        dataIndex: 'quantity',
        width: 150,
        render: (val, record) => (
          <FormItem>
            {record.$form.getFieldDecorator('quantity', {
              initialValue: val,
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`sodr.common.model.number`).d('数量'),
                  }),
                },
              ],
            })(
              <InputNumber
                max={MAX_QUAN_NUMBER}
                disabled={sodrEnabled || this.isDisabledFields(record, 'quantity')}
                onChange={(value) => {
                  if (!sodrEnabled) {
                    record.$form.setFieldsValue({ secondaryQuantity: value });
                  }
                }}
                // onChange={this.handleChangeItem}
                // onChange={(e) => {
                //   handleChangeItemList(e, record);
                // }}
                // precision={record.uomPrecision}
                parser={(value) => parseAumont(value, record.uomPrecision)}
                allowThousandth="true"
              />
            )}
            {!sodrEnabled &&
              record.$form.getFieldDecorator('secondaryQuantity', {
                initialValue: record.secondaryQuantity,
              })}
          </FormItem>
        ),
      },
      {
        title: getDynamicLabel(sodrEnabled, 'uom'),
        dataIndex: 'uomId',
        width: 150,
        render: (val, record) => {
          return (
            <FormItem>
              {record.$form.getFieldDecorator('uomId', {
                initialValue: record.uomId,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('sodr.common.model.common.uomNames').d('单位'),
                    }),
                  },
                ],
              })(
                <Lov
                  code="SMDM.UOM"
                  lovOptions={{ valueField: 'uomId' }}
                  textField="uomCodeAndName"
                  disabled={sodrEnabled || this.isDisabledFields(record, 'uomId')}
                  onChange={(_, { uomPrecision, uomId }) => {
                    record.$form.setFieldsValue({ uomPrecision });
                    if (!sodrEnabled) {
                      record.$form.setFieldsValue({ secondaryUomId: uomId });
                    }
                  }}
                />
              )}
              {record.$form.getFieldDecorator('uomName', { initialValue: record.uomName })}
              {record.$form.getFieldDecorator('uomCode', { initialValue: record.uomCode })}
              {record.$form.getFieldDecorator('uomCodeAndName', {
                initialValue: record.uomCodeAndName,
              })}
              {record.$form.getFieldDecorator('uomPrecision', {
                initialValue: record.uomPrecision,
              })}
              {!sodrEnabled &&
                record.$form.getFieldDecorator('secondaryUomId', {
                  initialValue: record.secondaryUomId,
                })}
              {!sodrEnabled &&
                record.$form.getFieldDecorator('secondaryUomName', {
                  initialValue: record.secondaryUomName,
                })}
              {!sodrEnabled &&
                record.$form.getFieldDecorator('secondaryUomCode', {
                  initialValue: record.secondaryUomCode,
                })}
              {!sodrEnabled &&
                record.$form.getFieldDecorator('secondaryUomCodeAndName', {
                  initialValue: record.secondaryUomCodeAndName,
                })}
              {!sodrEnabled &&
                record.$form.getFieldDecorator('secondaryUomPrecision', {
                  initialValue: record.secondaryUomPrecision,
                })}
            </FormItem>
          );
        },
      },
      {
        title: intl.get(`sodr.common.model.common.needByDate`).d('需求日期'),
        dataIndex: 'needByDate',
        width: 150,
        render: (val, record) => (
          <FormItem>
            {record.$form.getFieldDecorator('needByDate', {
              initialValue: val ? moment(val) : undefined,
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('sodr.common.model.common.needByDate').d('需求日期'),
                  }),
                },
              ],
            })(
              <DatePicker
                format={getDateFormat()}
                placeholder={null}
                disabled={this.isDisabledFields(record, 'needByDate')}
                disabledDate={(currentDate) => moment().isAfter(currentDate, 'day')}
                // onChange={this.handleChangeItem}
              />
            )}
          </FormItem>
        ),
      },
      {
        title: intl.get(`sodr.common.model.common.currencyName`).d('币种'),
        dataIndex: 'currencyCode',
        width: 150,
      },
      {
        title: intl.get(`sodr.common.model.common.taxrate`).d('税率（%）'),
        dataIndex: 'taxId',
        width: 150,
        render: (val, record) => {
          return record.taxRateFlag ? (
            <FormItem>
              {record.$form.getFieldDecorator('taxId', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`sodr.quotePurchase.model.quotePurchase.taxRate`)
                        .d('税率（%）'),
                    }),
                  },
                ],
                initialValue: val,
              })(
                <Lov
                  code="SMDM.TAX"
                  textField="taxRate"
                  lovOptions={{ valueField: 'taxId', displayField: 'taxRate' }}
                  queryParams={{ enabledFlag: 1, tenantId }}
                  // onChange={this.handleChangeItem}
                  disabled={this.isDisabledFields(record, 'taxRate')}
                />
              )}
              {record.$form.getFieldDecorator('taxRate', { initialValue: record.taxRate })}
            </FormItem>
          ) : (
            record.taxRate
          );
        },
      },
      {
        title: intl.get(`sodr.common.model.common.lastPurchasePrice`).d('最近一次采购价'),
        dataIndex: 'lastPurchasePrice',
        width: 150,
        align: 'right',
      },
      {
        title: intl.get(`sodr.common.model.common.unitPrice`).d('不含税单价'),
        dataIndex: 'unitPrice',
        width: 150,
        align: 'right',
        render: (val, record) =>
          record.unitPriceFlag ? (
            <FormItem>
              {record.$form.getFieldDecorator('unitPrice', {
                initialValue: val,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`sodr.common.model.common.unitPrice`).d('不含税单价'),
                    }),
                  },
                ],
              })(
                <InputNumber
                  disabled={this.isDisabledFields(record, 'unitPrice')}
                  max={MAX_QUAN_NUMBER}
                  parser={(value) =>
                    headerInfo.poSourcePlatform === 'ERP'
                      ? value
                      : parseAumont(value, record.defaultPrecision)
                  }
                />
              )}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`sodr.common.model.common.taxedEnteredUnitPrice`).d('原币含税单价'),
        dataIndex: 'enteredTaxIncludedPrice',
        width: 150,
        align: 'right',
        render: (val, record) =>
          record.enteredTaxIncludedPriceFlag ? (
            <FormItem>
              {record.$form.getFieldDecorator('enteredTaxIncludedPrice', {
                initialValue: val,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`sodr.common.model.common.taxedEnteredUnitPrice`)
                        .d('原币含税单价'),
                    }),
                  },
                ],
              })(
                <InputNumber
                  disabled={this.isDisabledFields(record, 'enteredTaxIncludedPrice')}
                  max={MAX_QUAN_NUMBER}
                  parser={(value) =>
                    headerInfo.poSourcePlatform === 'ERP'
                      ? value
                      : parseAumont(value, record.defaultPrecision)
                  }
                />
              )}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`sodr.common.model.common.unitPriceBatch`).d('每'),
        dataIndex: 'unitPriceBatch',
        width: 150,
        align: 'right',
        render: (val, record) =>
          record.unitPriceBatchFlag ? (
            <FormItem>
              {record.$form.getFieldDecorator('unitPriceBatch', {
                initialValue: val,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`sodr.common.model.common.unitPriceBatch`).d('每'),
                    }),
                  },
                ],
              })(
                <InputNumber
                  disabled={this.isDisabledFields(record, 'unitPriceBatch')}
                  parser={(value) => parseAumont(value, record.uomPrecision)}
                  max={MAX_QUAN_NUMBER}
                  allowThousandth="true"
                />
              )}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`sodr.common.model.common.linePrice`).d('不含税行金额'),
        dataIndex: 'lineAmount',
        width: 150,
        align: 'right',
        render: (val, record) => {
          return amountFinancialPrecision(
            val,
            record.financialPrecision,
            headerInfo.poSourcePlatform
          );
        },
      },
      {
        title: intl.get(`sodr.common.model.common.taxIncludedLinePrice`).d('含税行金额'),
        dataIndex: 'taxIncludedLineAmount',
        width: 150,
        align: 'right',
        render: (val, record) => {
          return amountFinancialPrecision(
            val,
            record.financialPrecision,
            headerInfo.poSourcePlatform
          );
        },
      },
      {
        title: intl.get(`sodr.common.model.common.department`).d('部门'),
        dataIndex: 'departmentName',
        width: 150,
      },
      {
        title: intl.get(`sodr.common.model.common.financialOrganization`).d('结算财务组织'),
        dataIndex: 'clearOrganizationName',
        width: 150,
      },
      {
        title: intl.get(`sodr.common.model.common.payableOrganization`).d('应付组织'),
        dataIndex: 'copeOrganizationName',
        width: 150,
      },
      {
        title: intl.get(`sodr.common.model.common.organizationName`).d('收货组织'),
        dataIndex: 'invOrganizationId',
        width: 150,
        render: (val, record) => (
          <FormItem>
            {record.$form.getFieldDecorator('invOrganizationId', {
              initialValue: val,
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`sodr.common.model.common.organizationName`).d('收货组织'),
                  }),
                },
              ],
            })(
              <Lov
                code="SPRM.INV_ORG"
                textField="invOrganizationName"
                // textValue={record.invOrganizationName}
                queryParams={{ enabledFlag: 1, tenantId, ouId, itemId: record.itemId }}
                disabled={this.isDisabledFields(record, 'invOrganizationId')}
                onChange={(value) => {
                  this.handleOriginationLovChange(value, 'invOrganizationId', record);
                  // eslint-disable-next-line no-unused-expressions
                  // this.handleChangeItem();
                }}
              />
            )}
            {record.$form.getFieldDecorator('invOrganizationName', {
              initialValue: record.invOrganizationName,
            })}
          </FormItem>
        ),
      },
      {
        title: intl.get(`sodr.common.model.common.inventoryName`).d('收货库房'),
        dataIndex: 'invInventoryId',
        width: 150,
        render: (val, record) => (
          <FormItem>
            {record.$form.getFieldDecorator(`invInventoryId`, {
              initialValue: record.invInventoryId,
            })(
              <Lov
                onChange={(value) => {
                  this.handleInvInventoryLovChange(value, 'invInventoryId', record);
                  // eslint-disable-next-line no-unused-expressions
                  // this.handleChangeItem();
                }}
                code="SODR.INVENTORY"
                textField="inventoryName"
                // textValue={record.inventoryName}
                disabled={
                  !record.$form.getFieldValue('invOrganizationId') ||
                  this.isDisabledFields(record, 'invInventoryId')
                }
                queryParams={{
                  enabledFlag: 1,
                  tenantId,
                  organizationId:
                    record.$form.getFieldValue('invOrganizationId') || record.invOrganizationId,
                }}
                onMouseEnter={() =>
                  this.handleInventoryVisible('invInventoryVisible', record.prLineId, true)
                }
                onMouseLeave={() =>
                  this.handleInventoryVisible('invInventoryVisible', record.prLineId, false)
                }
              />
            )}
            <Tooltip
              visible={
                invInventoryVisible.get(record.prLineId) &&
                !record.$form.getFieldValue('invOrganizationId')
              }
              title={intl
                .get(`sodr.quotePurchase.view.message.shouldChooseOrganization`)
                .d('请先选择收货组织')}
            />
            {record.$form.getFieldDecorator('inventoryName', {
              initialValue: record.inventoryName,
            })}
          </FormItem>
        ),
      },
      {
        title: intl.get(`sodr.common.model.common.locationName`).d('收货库位'),
        dataIndex: 'invLocationId',
        width: 150,
        render: (val, record) => (
          <FormItem>
            {record.$form.getFieldDecorator(`invLocationId`, {
              initialValue: record.invLocationId,
            })(
              <Lov
                code="SRPM.LOCATION_BY_ORG_INV"
                textField="locationName"
                // textValue={record.locationName}
                disabled={
                  !record.$form.getFieldValue('invInventoryId') ||
                  !record.$form.getFieldValue('invOrganizationId') ||
                  this.isDisabledFields(record, 'invLocationId')
                }
                queryParams={{
                  enabledFlag: 1,
                  inventoryId: record.$form.getFieldValue('invInventoryId'),
                  tenantId,
                  // organizationId: tenantId,
                }}
                // onChange={this.handleChangeItem}
                onMouseEnter={() => this.handleLocationVisible(record.prLineId, true)}
                onMouseLeave={() => this.handleLocationVisible(record.prLineId, false)}
              />
            )}
            <Tooltip
              visible={
                invLocationVisible.get(record.prLineId) &&
                !record.$form.getFieldValue('invInventoryId')
              }
              title={intl
                .get(`sodr.quotePurchase.view.message.shouldChooseInvInventory`)
                .d('请先选择收货库房')}
            />
            {record.$form.getFieldDecorator('locationName', {
              initialValue: record.locationName,
            })}
          </FormItem>
        ),
      },
      {
        title: intl.get(`sodr.common.view.message.title.bom`).d('外协BOM'),
        width: 100,
        dataIndex: 'bom',
        render: (text, record) => (
          <a onClick={() => openBOMModal(record)} disabled={record._status === 'create'}>
            {intl.get(`hzero.common.button.view`).d('查看')}
          </a>
        ),
      },
      {
        title: intl.get(`sodr.common.model.common.shipToThirdPartyName`).d('送达方'),
        dataIndex: 'shipToThirdPartyName',
        width: 150,
      },
      {
        title: intl.get(`sodr.common.model.common.shipToThirdPartyAddress`).d('送货地址'),
        dataIndex: 'shipToThirdPartyAddress',
        width: 150,
        render: (val, record) => (
          <FormItem>
            {record.$form.getFieldDecorator('shipToThirdPartyAddress', {
              initialValue: val,
            })(<Input disabled={this.isDisabledFields(record, 'shipToThirdPartyAddress')} />)}
          </FormItem>
        ),
      },
      {
        title: intl.get(`sodr.common.model.common.shipToThirdPartyContact`).d('联系人信息'),
        dataIndex: 'shipToThirdPartyContact',
        width: 150,
        render: (val, record) => (
          <FormItem>
            {record.$form.getFieldDecorator('shipToThirdPartyContact', {
              initialValue: val,
            })(<Input disabled={this.isDisabledFields(record, 'shipToThirdPartyContact')} />)}
          </FormItem>
        ),
      },
      {
        title: intl.get(`sodr.common.model.common.brand`).d('品牌'),
        dataIndex: 'brand',
        width: 150,
      },
      {
        title: intl.get(`sodr.common.model.common.specifications`).d('规格'),
        dataIndex: 'specifications',
        width: 150,
      },
      {
        title: intl.get(`sodr.common.model.common.model`).d('型号'),
        dataIndex: 'model',
        width: 150,
      },
      {
        title: intl.get(`sodr.common.model.common.chartCode`).d('图号'),
        dataIndex: 'chartCode',
        width: 150,
      },
      {
        title: intl.get(`sodr.common.model.common.surfaceTreatFlag`).d('表面处理'),
        dataIndex: 'surfaceTreatFlag',
        width: 150,
        render: (val) =>
          val ? intl.get('hzero.common.status.yes') : intl.get('hzero.common.status.no'),
      },
      {
        title: intl.get(`sodr.common.model.common.pcNum`).d('协议编号'),
        dataIndex: 'pcNum',
        width: 150,
      },
      {
        title: intl.get(`sodr.common.model.common.accountAssignment`).d('科目分配'),
        dataIndex: 'accountAssignment',
        width: 150,
      },
      {
        title: intl.get(`sodr.common.model.common.displayPrNumOrLineNum`).d('采购申请号|行号'),
        width: 150,
        dataIndex: 'displayPrNum',
        render: (val, record) => (
          <a onClick={() => redirectToOther('purchase', record)}>
            {val || record.displayPrLineNum
              ? `${record.displayPrNum || ''}|${record.displayPrLineNum || ''}`
              : ''}
          </a>
        ),
      },
      {
        title: intl.get(`sodr.common.model.quotePurchase.number`).d('采购协议号|行号'),
        width: 150,
        dataIndex: 'contractNum',
        render: (val, record) => (
          <a onClick={() => redirectToOther('contract', record)}>{val === '|' ? '' : val}</a>
        ),
      },
      {
        title: intl.get(`sodr.common.model.common.sourceNumAndLine`).d('寻源单号|行号'),
        width: 150,
        dataIndex: 'sourceNumAndLine',
        render: (val, record) => (
          <a onClick={() => redirectToOther('source', record)}>
            {val || record.sourceCodeNum
              ? `${record.sourceNumAndLine || ''}|${record.sourceCodeNum || ''}`
              : ''}
          </a>
        ),
      },
      {
        title: intl.get(`sodr.common.model.common.requestBy`).d('申请人'),
        dataIndex: 'prRequestedName',
        width: 150,
        render: (_, record) => record.purReqAppliedName,
      },
      {
        title: intl.get(`sodr.orderType.model.orderType.accountAssignTypeName`).d('账户分配类别'),
        dataIndex: 'accountAssignTypeId',
        width: 150,
        render: (val, record) => (
          <FormItem>
            {record.$form.getFieldDecorator('accountAssignTypeId', {
              initialValue: val,
            })(
              <Lov
                code="SPRM.ACCOUNT_ASSIGN_TYPE"
                lovOptions={{
                  displayField: 'accountAssignTypeCode',
                  valueField: 'accountAssignTypeId',
                }}
                textValue={record.accountAssignTypeCode}
                queryParams={{
                  lineType: 'PO_LINE',
                  tenantId,
                }}
                disabled={this.isDisabledFields(record, 'accountAssignTypeId')}
                onChange={(value, dataList) => {
                  this.handleAssignTypeChange(value, dataList, record);
                }}
              />
            )}
            {record.$form.getFieldDecorator('accountAssignTypeCode', {
              initialValue: record.accountAssignTypeCode,
            })(<Input style={{ display: 'none' }} />)}
            {record.$form.getFieldDecorator('requiredFieldNames', {
              initialValue: record.assignTypeRequiredFieldNames || [],
            })}
          </FormItem>
        ),
      },
      {
        title: intl.get(`sodr.quotePurchaseRequisition.view.message.projectCategory`).d('项目类别'),
        dataIndex: 'projectCategory',
        width: 150,
        render: (val, record) => (
          <FormItem>
            {record.$form.getFieldDecorator('projectCategory', {
              initialValue: record.projectCategory,
            })(
              <Lov
                code="SPUC.PR_LINE_PROJECT_CATEHORY"
                textField="projectCategoryMeaning"
                lovOptions={{
                  valueField: 'value',
                  displayField: 'meaning',
                }}
                disabled={this.isDisabledFields(record, 'projectCategory')}
                // onChange={this.handleChangeItem}
              />
            )}
            {record.$form.getFieldDecorator('projectCategoryMeaning', {
              initialValue: record.projectCategoryMeaning,
            })}
          </FormItem>
        ),
      },
      {
        title: intl.get(`sprm.common.model.costCenter`).d('成本中心'),
        dataIndex: 'costId',
        width: 150,
        render: (val, record) => (
          <FormItem>
            {record.$form.getFieldDecorator('costId', {
              initialValue: val,
            })(
              <Lov
                code="SPRM.COST_CENTER"
                // textValue={record.costName}
                textField="costName"
                lovOptions={{ valueField: 'costId', displayField: 'costName' }}
                queryParams={{
                  companyId,
                  tenantId,
                  ouId,
                }}
                disabled={this.isDisabledFields(record, 'costId')}
                onChange={(_, lovRecord) => this.handleChangeCost(record, lovRecord)}
              />
            )}
            {record.$form.getFieldDecorator('costCode', {
              initialValue: record.costCode,
            })(<Input style={{ display: 'none' }} />)}
            {record.$form.getFieldDecorator('costName', {
              initialValue: record.costName,
            })}
          </FormItem>
        ),
      },
      {
        title: intl.get(`sprm.common.model.sumProject`).d('总账科目'),
        dataIndex: 'accountSubjectId',
        width: 150,
        render: (val, record) => (
          <FormItem>
            {record.$form.getFieldDecorator('accountSubjectId', {
              initialValue: val,
            })(
              <Lov
                disabled={!companyId && this.isDisabledFields(record, 'accountSubjectId')}
                code="SPRM.ACCOUNT_SUBJECT"
                textField="accountSubjectName"
                lovOptions={{
                  valueField: 'accountSubjectId',
                  displayField: 'accountSubjectName',
                }}
                queryParams={{
                  companyId,
                  tenantId,
                }}
                onChange={(_, lovRecord) => this.handleChangeAccountSubject(record, lovRecord)}
              />
            )}
            {record.$form.getFieldDecorator('accountSubjectNum', {
              initialValue: record.accountSubjectNum,
            })(<Input style={{ display: 'none' }} />)}
            {record.$form.getFieldDecorator('accountSubjectName', {
              initialValue: record.accountSubjectName,
            })}
          </FormItem>
        ),
      },
      {
        title: intl.get(`sprm.common.model.wbs`).d('WBS元素'),
        dataIndex: 'wbsCode',
        width: 150,
        render: (val, record) => (
          <FormItem>
            {record.$form.getFieldDecorator('wbsCode', {
              initialValue: val,
            })(
              <Lov
                code="SMDM.WBS"
                textValue={record.wbs}
                textField="wbs"
                lovOptions={{
                  valueField: 'wbsCode',
                  displayField: 'wbs',
                }}
                queryParams={{
                  tenantId,
                  companyId,
                  ouId,
                }}
                disabled={this.isDisabledFields(record, 'wbsCode')}
                onChange={(_, lovRecord) => this.handleChangeWbs(record, lovRecord)}
              />
            )}
            {record.$form.getFieldDecorator('wbs', {
              initialValue: record.wbs,
            })(<Input style={{ display: 'none' }} />)}
          </FormItem>
        ),
      },
      {
        title: intl.get(`sodr.receivedOrder.model.common.wbs.isFreeFlag`).d('是否免费'),
        dataIndex: 'freeFlag',
        width: 150,
        render: (val, record) => (
          <FormItem>
            {record.$form.getFieldDecorator('freeFlag', {
              initialValue: toString(val),
            })(
              <Select
                style={{ width: '100%' }}
                allowClear
                disabled={this.isDisabledFields(record, 'freeFlag')}
              >
                {freeFlag.map((n) => (
                  <Select.Option key={n.value} value={n.value}>
                    {n.meaning}
                  </Select.Option>
                ))}
              </Select>
            )}
          </FormItem>
        ),
      },
      {
        title: intl.get(`hzero.common.remark`).d('备注'),
        dataIndex: 'remark',
        width: 150,
        render: (val, record) =>
          record.remarkFlag ? (
            <FormItem>
              {record.$form.getFieldDecorator('remark', {
                initialValue: val,
              })(<TooltipInput tipValue={record.$form.getFieldValue('remark')} />)}
            </FormItem>
          ) : (
            <Tooltip title={val}>{val}</Tooltip>
          ),
      },
      {
        title: intl.get(`sodr.common.model.common.budgetAccount`).d('预算科目'),
        width: 120,
        dataIndex: 'budgetAccountId',
        render: (_, record) => record.budgetAccountName,
      },
      {
        title: intl.get(`sodr.common.model.common.purchaseLineTypes`).d('采购行类型'),
        width: 150,
        dataIndex: 'purchaseLineTypeId',
        render: (val, record) => {
          return (
            <FormItem>
              {record.$form.getFieldDecorator(`purchaseLineTypeId`, {
                initialValue: !isNil(val) ? val.toString() : null,
              })(
                <Select allowClear style={{ width: '100%' }}>
                  {purchaseLineType.map((item) => (
                    <Select.Option key={item.value}>{item.meaning}</Select.Option>
                  ))}
                </Select>
              )}
            </FormItem>
          );
        },
      },
      {
        title: intl.get(`sodr.quotePurchase.model.quotePurchase.receiveTelNum`).d('联系人电话'),
        width: 300,
        dataIndex: 'receiveTelNum',
        render: (val, record) => (
          <FormItem>
            {record.$form.getFieldDecorator('receiveTelNum', {
              initialValue: record.receiveTelNum,
              rules: [
                {
                  pattern:
                    record.$form.getFieldValue('internationalTelCode') === '+86'
                      ? PHONE
                      : NOT_CHINA_PHONE,
                  message: intl.get(`sodr.common.model.common.phoneErrMsg`).d('手机号格式不正确'),
                },
              ],
            })(
              <PhoneRender
                record={record}
                internationalTelCodeValue={record.internationalTelCode}
                disabled={this.isDisabledFields(record, 'receiveTelNum')}
                internationalTelCode={internationalTelCode}
              />
            )}
            {record.$form.getFieldDecorator(`internationalTelCode`, {
              initialValue: record.internationalTelCode,
            })}
          </FormItem>
        ),
      },
      {
        title: intl.get(`sodr.common.model.common.lineAttachmentUuid`).d('行附件'),
        dataIndex: 'attachmentUuid',
        width: 100,
        render: (value, record) => (
          <UploadModal
            bucketName={BUCKET_NAME}
            bucketDirectory={LINE_DIRECTORY}
            attachmentUUID={record.attachmentUuid}
            viewOnly={this.isDisabledFields(record, 'lineAttachmentUuid')}
            afterOpenUploadModal={(uuid) => {
              // 与头附件逻辑保持一致
              handleSetChangeFlag();
              if (uuid !== value) {
                record.$form.registerField('attachmentUuid');
                record.$form.setFieldsValue({ attachmentUuid: uuid });
              }
            }}
            icon={false}
          />
        ),
      },
      {
        title: intl.get(`sodr.common.model.common.domesticTaxIncludedPrice`).d('本币含税单价'),
        width: 120,
        dataIndex: 'domesticTaxIncludedPrice',
        render: (val) =>
          headerInfo.poSourcePlatform === 'ERP'
            ? formatAumont(val)
            : formatAumont(val, headerInfo.domesticDefaultPrecision),
      },
      {
        title: intl.get(`sodr.common.model.common.domesticUnitPrice`).d('本币不含税单价'),
        width: 120,
        dataIndex: 'domesticUnitPrice',
        render: (val) =>
          headerInfo.poSourcePlatform === 'ERP'
            ? formatAumont(val)
            : formatAumont(val, headerInfo.domesticDefaultPrecision),
      },
      {
        title: intl.get(`sodr.common.model.common.domesticTaxIncludedLineAmount`).d('本币含税金额'),
        width: 120,
        dataIndex: 'domesticTaxIncludedLineAmount',
        render: (val) =>
          amountFinancialPrecision(
            val,
            headerInfo.domesticFinancialPrecision,
            headerInfo.poSourcePlatform
          ),
      },
      {
        title: intl.get(`sodr.common.model.common.domesticLineAmount`).d('本币不含税金额'),
        width: 120,
        dataIndex: 'domesticLineAmount',
        render: (val) =>
          amountFinancialPrecision(
            val,
            headerInfo.domesticFinancialPrecision,
            headerInfo.poSourcePlatform
          ),
      },
      {
        width: 100,
        dataIndex: 'docFlow',
        title: intl.get(`sodr.common.model.common.docFlow`).d('单据流'),
        render: (_, record) => (
          <DocFlow tableName="sodr_po_line_location" tablePk={record.poLineLocationId} />
        ),
      },
      {
        // SODR.AUTH_SUPPLIER_LIFE_CYCLE
        width: 150,
        dataIndex: 'subSupplierId',
        title: intl.get(`sodr.common.model.common.subSupplierId`).d('分包供应商'),
        render: (val, record) => (
          <FormItem>
            {record.$form.getFieldDecorator('subSupplier', {
              initialValue: record.subErpSupplierId || record.subSupplierId,
            })(
              <Lov
                disabled={this.isDisabledFields(record, 'subSupplierId')}
                code="SODR.AUTH_SUPPLIER_LIFE_CYCLE"
                textValue={record.subErpSupplierName || record.subSupplierName}
                queryParams={{ userId, tenantId, organizationId: userOrganizationId, companyId }}
                onChange={(_, lovRecord) => {
                  const {
                    supplierCompanyId,
                    supplierCompanyNum,
                    supplierCompanyName,
                    supplierId,
                    supplierNum,
                    supplierName,
                    supplierTenantId,
                  } = lovRecord;
                  record.$form.setFieldsValue({
                    subSupplierId: supplierCompanyId,
                    subSupplierCode: supplierCompanyNum,
                    subSupplierName: supplierCompanyName,
                    subErpSupplierId: supplierId,
                    subErpSupplierCode: supplierNum,
                    subErpSupplierName: supplierName,
                    subSupplierTenantId: supplierTenantId,
                  });
                }}
              />
            )}
            {record.$form.getFieldDecorator('subSupplierId', {
              initialValue: record.subSupplierId,
            })}
            {record.$form.getFieldDecorator('subSupplierCode', {
              initialValue: record.subSupplierCode,
            })}
            {record.$form.getFieldDecorator('subSupplierName', {
              initialValue: record.subSupplierName,
            })}
            {record.$form.getFieldDecorator('subErpSupplierId', {
              initialValue: record.subErpSupplierId,
            })}
            {record.$form.getFieldDecorator('subErpSupplierCode', {
              initialValue: record.subErpSupplierCode,
            })}
            {record.$form.getFieldDecorator('subErpSupplierName', {
              initialValue: record.subErpSupplierName,
            })}
            {record.$form.getFieldDecorator('subSupplierTenantId', {
              initialValue: record.subSupplierTenantId,
            })}
          </FormItem>
        ),
      },
      {
        title: intl.get(`sodr.common.model.common.netReceivedQuantity`).d('净接收'),
        width: 150,
        dataIndex: 'netReceivedQuantity',
        render: (_, record) => record.netReceivedQuantity,
      },
      {
        title: intl.get(`sodr.common.model.common.netDeliverQuantityPro`).d('净入库'),
        width: 150,
        dataIndex: 'netDeliverQuantity',
        render: (_, record) => record.netDeliverQuantity,
      },
      {
        title: intl.get(`sodr.common.model.common.shippedQuantity`).d('已发货'),
        width: 150,
        dataIndex: 'shippedQuantity',
        render: (_, record) => record.shippedQuantity,
      },
    ];
    return columns;
  }

  @Bind()
  handleTaxAll(field, lovRecord) {
    const {
      taxId,
      taxRate,
      inventoryId,
      inventoryName,
      costId,
      costCode,
      costName,
      organizationId,
      organizationName,
      enteredTaxIncludedPrice,
      unitPrice,
    } = lovRecord;
    switch (field) {
      case 'taxId':
        this.setState({ selectOptionValues: { taxId, wbs: taxRate, taxRate } });
        break;
      case 'invInventoryId':
        this.setState({ selectOptionValues: { inventoryId, inventoryName } });
        break;
      case 'costId':
        this.setState({ selectOptionValues: { costId, costCode, costName } });
        break;
      case 'invOrganizationId':
        this.setState({ selectOptionValues: { organizationId, organizationName } });
        break;
      case 'enteredTaxIncludedPrice':
        this.setState({ selectOptionValues: { enteredTaxIncludedPrice } });
        break;
      case 'unitPrice':
        this.setState({ selectOptionValues: { unitPrice } });
        break;
      default:
    }
  }

  @Bind()
  getMaintenanceCom(key, benchmarkPriceType, defaultPrecision) {
    const {
      form: { getFieldDecorator },
      selectedListRows = [],
      headerInfo,
      dataSource = [],
      companyId,
      ouId,
    } = this.props;
    const { unSaveEnable } = headerInfo;
    const invOrganizationId =
      (selectedListRows[0] || dataSource[0])?.$form?.getFieldValue('invOrganizationId') ||
      dataSource[0]?.invOrganizationId;
    const { changeFields = [] } = this.props;
    switch (key) {
      case 'taxId':
        return (
          <FormItem label=":">
            {getFieldDecorator(`taxId`)(
              <Lov
                code="SMDM.TAX"
                textField="taxRate"
                lovOptions={{ valueField: 'taxId', displayField: 'taxRate' }}
                queryParams={{ enabledFlag: 1, tenantId }}
                onChange={(_, lovRecord) => this.handleTaxAll('taxId', lovRecord)}
                disabled={!changeFields.includes(this.getSelectOptionKey(key))}
              />
            )}
          </FormItem>
        );
      case 'invInventoryId':
        return (
          <FormItem label=":">
            {getFieldDecorator(`invInventoryId`)(
              <Lov
                code="SODR.INVENTORY"
                disabled={!invOrganizationId || !changeFields.includes(key)}
                queryParams={{
                  enabledFlag: 1,
                  tenantId,
                  organizationId: invOrganizationId,
                }}
                textField="inventoryName"
                lovOptions={{ valueField: 'inventoryId', displayField: 'inventoryName' }}
                onChange={(_, lovRecord) => this.handleTaxAll('invInventoryId', lovRecord)}
              />
            )}
          </FormItem>
        );
      case 'costId':
        return (
          <FormItem label=":">
            {getFieldDecorator(`costId`)(
              <Lov
                disabled={!companyId || !changeFields.includes(key)}
                code="SPRM.COST_CENTER"
                textField="costName"
                lovOptions={{ valueField: 'costId', displayField: 'costName' }}
                queryParams={{
                  companyId,
                  tenantId,
                  ouId,
                }}
                onChange={(_, lovRecord) => this.handleTaxAll('costId', lovRecord)}
              />
            )}
          </FormItem>
        );
      case 'needByDate':
        return (
          <Form.Item label=":">
            {getFieldDecorator(`needByDate`)(
              <DatePicker
                disabled={[1, 2].includes(unSaveEnable) || !changeFields.includes(key)}
                placeholder={null}
                format={getDateFormat()}
              />
            )}
          </Form.Item>
        );
      case 'remark':
        return <Form.Item label=":">{getFieldDecorator(`lineRemark`)(<Input />)}</Form.Item>;
      case 'invOrganizationId':
        return (
          <FormItem label=":">
            {getFieldDecorator(`invOrganizationId`)(
              <Lov
                code="SPRM.INV_ORG"
                disabled={!changeFields.includes('invOrganizationId')}
                queryParams={{
                  enabledFlag: 1,
                  tenantId,
                  ouId,
                }}
                onChange={(_, lovRecord) => this.handleTaxAll('invOrganizationId', lovRecord)}
              />
            )}
          </FormItem>
        );
      case 'enteredTaxIncludedPrice':
        return (
          <FormItem label=":">
            {getFieldDecorator(`enteredTaxIncludedPrice`)(
              <InputNumber
                min={0}
                max={MAX_QUAN_NUMBER}
                precision={getPrecision(defaultPrecision)}
                disabled={benchmarkPriceType === 'NET_PRICE'}
                onChange={(enteredTaxIncludedPrice) =>
                  this.handleTaxAll('enteredTaxIncludedPrice', { enteredTaxIncludedPrice })
                }
              />
            )}
          </FormItem>
        );
      case 'unitPrice':
        return (
          <FormItem label=":">
            {getFieldDecorator(`unitPrice`)(
              <InputNumber
                min={0}
                max={MAX_QUAN_NUMBER}
                precision={getPrecision(defaultPrecision)}
                disabled={
                  benchmarkPriceType === 'TAX_INCLUDED_PRICE' || benchmarkPriceType === undefined
                }
                onChange={(unitPrice) => this.handleTaxAll('unitPrice', { unitPrice })}
              />
            )}
          </FormItem>
        );
      default:
        return <Form.Item label=":">{getFieldDecorator(key)(<Input />)}</Form.Item>;
    }
  }

  @Bind()
  calcLoading(calcLoading) {
    this.setState({ calcLoading });
  }

  /**
   * 批量维护
   */
  @Bind()
  async handleMaintain() {
    const {
      form: { getFieldsValue },
      dataSource,
      onChangeListData,
      selectedListRows = [],
      validateItemAndInv,
    } = this.props;
    const { selectOptionKey, selectOptionValues } = this.state;
    const fieldsValue = getFieldsValue();
    const key = selectedListRows.map((n) => n.poLineLocationId);
    const { needByDate, [selectOptionKey]: selectOptionIndex, lineRemark } = fieldsValue;
    let newDataSource;
    if (selectOptionIndex) {
      if (selectOptionKey === 'needByDate') {
        newDataSource = dataSource.map((item) => {
          const { invOrganizationName = item.invOrganizationName } = this.state;
          if (!isEmpty(selectedListRows) && !key.includes(item.poLineLocationId)) {
            return item;
          } else {
            item.$form.setFieldsValue({ needByDate });
            return {
              ...item,
              invOrganizationName,
            };
          }
        });
      } else if (selectOptionKey === 'taxId') {
        newDataSource = dataSource.map((item) => {
          const priceFlag =
            item.$form.getFieldValue('priceLibraryId') &&
            item.$form.getFieldValue('taxRate') &&
            !math.isZero(item.$form.getFieldValue('taxRate')) &&
            item.$form.getFieldValue('priceTaxId');
          if ((isEmpty(selectedListRows) || key.includes(item.poLineLocationId)) && !priceFlag) {
            item.$form.setFieldsValue({
              taxId: selectOptionIndex,
              taxRate: selectOptionValues.taxRate,
            });
            return {
              ...item,
              ...selectOptionValues,
            };
          } else {
            return {
              ...item,
            };
          }
        });
      } else if (selectOptionKey === 'invInventoryId') {
        const selectArr = selectedListRows.map((i) => i.$form.getFieldValue('invOrganizationId'));
        const dataSourceArr = dataSource.map((i) => i.$form.getFieldValue('invOrganizationId'));
        if (
          (isEmpty(selectedListRows) && [...new Set(dataSourceArr)].length > 1) ||
          [...new Set(selectArr)].length > 1
        ) {
          notification.error({
            message: intl
              .get(`sodr.quotePurchase.model.quotePurchase.invErrorMsg`)
              .d('库存组织不一致，请检查'),
          });
          return;
        }
        newDataSource = dataSource.map((i) => {
          if (isEmpty(selectedListRows) || key.includes(i.poLineLocationId)) {
            i.$form.setFieldsValue({
              invInventoryId: selectOptionValues.inventoryId,
              inventoryName: selectOptionValues.inventoryName,
            });
            return { ...i, ...selectOptionValues, invInventoryId: selectOptionValues.inventoryId };
          } else {
            return i;
          }
        });
      } else if (selectOptionKey === 'costId') {
        newDataSource = dataSource.map((item) => {
          if (isEmpty(selectedListRows) || key.includes(item.poLineLocationId)) {
            item.$form.setFieldsValue({
              costId: selectOptionIndex,
              costCode: selectOptionValues.costCode,
              costName: selectOptionValues.costName,
            });
            return {
              ...item,
              ...selectOptionValues,
            };
          } else {
            return {
              ...item,
            };
          }
        });
      } else if (selectOptionKey === 'remark') {
        newDataSource = dataSource.map((item) => {
          if (isEmpty(selectedListRows) || key.includes(item.poLineLocationId)) {
            item.$form.setFieldsValue({ [selectOptionKey]: lineRemark });
          }
          return item;
        });
      } else if (selectOptionKey === 'invOrganizationId') {
        if (await validateItemAndInv(selectOptionIndex)) return;
        newDataSource = dataSource.map((item) => {
          if (isEmpty(selectedListRows) || key.includes(item.poLineLocationId)) {
            item.$form.setFieldsValue({
              invOrganizationId: selectOptionIndex,
              invOrganizationName: selectOptionValues.organizationName,
            });
            return {
              ...item,
              ...selectOptionValues,
              invOrganizationId: selectOptionIndex,
              invOrganizationName: selectOptionValues.organizationName,
            };
          } else {
            return {
              ...item,
            };
          }
        });
        // onChangeHeader({
        //   ...headerInfo,
        //   // batchMaintainSelectOptionIndex: selectOptionIndex,
        //   // batchMaintainSelectOptionName: selectOptionValues.organizationName,
        // });
      } else {
        newDataSource = dataSource.map((item) => {
          if (isEmpty(selectedListRows) || key.includes(item.poLineLocationId)) {
            item.$form.setFieldsValue({ [selectOptionKey]: selectOptionIndex });
          }
          return item;
        });
      }
      onChangeListData(newDataSource);
    }
  }

  @Bind()
  getSelectOptionKey(selectOptionKey) {
    const obj = {
      taxId: 'taxRate',
    };
    return obj[selectOptionKey] || selectOptionKey;
  }

  render() {
    const {
      pagination,
      dataSource = [],
      fetchLine = (e) => e,
      fetchLineLoading,
      // calculateDoubleUomLoading,
      customizeTable,
      enumMap: { batchMaintain = [] },
      handleRowSelectedChange = (e) => e,
      selectedListRows = [],
      headerInfo,
      handleDeleteLines = () => {},
      customizeBtnGroup,
    } = this.props;
    const columns = this.getColumns().filter((i) => i);
    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0)));
    const { selectOptionKey, calcLoading } = this.state;
    const batchMaintainOpts = batchMaintain.map((item) => {
      return {
        meaning: item.meaning,
        value: item.value,
      };
    });
    const { benchmarkPriceType, defaultPrecision } = headerInfo;
    const maintenanceCom = this.getMaintenanceCom(
      selectOptionKey,
      benchmarkPriceType,
      defaultPrecision
    );
    const { changeFields = [] } = this.props;
    const realData = selectedListRows.filter((i) => i.poLineId);
    const buttons = [
      {
        name: 'delete',
        child: intl.get(`hzero.common.button.delete`).d('删除'),
        btnProps: {
          onClick: handleDeleteLines,
          disabled: !isEmpty(realData) || isEmpty(selectedListRows),
        },
      },
    ];
    return (
      <div className={styles['purchase-application']}>
        <Form layout="inline">
          <Form.Item>
            {customizeBtnGroup(
              {
                code: 'SODR.ORDER_CANCEL_CHANGE.LIST_BUTTONS',
                pro: true,
              },
              <DynamicButtons buttons={buttons} />
            )}
          </Form.Item>
          <Form.Item>
            <Button
              data-code="search"
              htmlType="submit"
              type="primary"
              onClick={this.handleMaintain}
              disabled={
                dataSource.length === 0 ||
                !changeFields.includes(this.getSelectOptionKey(selectOptionKey))
              }
            >
              <a>
                {intl.get(`sodr.quotePurchase.model.quotePurchase.batchMaintain`).d('批量维护')}
              </a>
            </Button>
          </Form.Item>
          {maintenanceCom}
          <Form.Item>
            <Select
              defaultValue="needByDate"
              style={{ width: 120 }}
              onChange={(val) => {
                this.setState({
                  selectOptionKey: val,
                });
              }}
            >
              {batchMaintainOpts.map((n) => (
                <Select.Option key={n.value} value={n.value}>
                  {n.meaning}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
        {customizeTable(
          {
            code: 'SODR.ORDER_CANCEL_CHANGE.LIST',
          },
          <EditTable
            bordered
            ref={this.table}
            rowKey="poLineLocationId"
            pagination={pagination}
            dataSource={dataSource}
            prevDataSource={dataSource} // 临时处理，拿到dataHasChange
            onChange={fetchLine}
            loading={fetchLineLoading || calcLoading}
            columns={columns}
            scroll={{ x: scrollX, y: 'calc(100vh - 390px)' }}
            rowSelection={{
              selectedRowKeys: selectedListRows.map((n) => n.poLineLocationId),
              onChange: handleRowSelectedChange,
              // getCheckboxProps: (record) => ({ disabled: record._status !== 'create' }),
            }}
          />
        )}
      </div>
    );
  }
}
