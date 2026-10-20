/**
 * SheetCreation - 整单引用创建
 * @date: 2019-02-20
 * @author: guochaochao <chaochao.guo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Bind } from 'lodash-decorators';
import { isNumber, sum } from 'lodash';
import { Form, Input, Checkbox } from 'hzero-ui';
import moment from 'moment';

import Lov from 'components/Lov';
import intl from 'utils/intl';
// import UploadModal from 'components/Upload';
import UploadModal from 'srm-front-boot/lib/components/Upload';
import EditTable from 'components/EditTable';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import { getCurrentOrganizationId, getUserOrganizationId } from 'utils/utils';
// import { numberRender } from 'utils/renderer';

import styles from './Header.less';
import { formatAumont, formatNumber } from '@/routes/components/utils';
import { BUCKET_NAME, MAX_QUAN_NUMBER } from '@/routes/components/utils/constant';

const FormItem = Form.Item;

// function numberFormat(val) {
//   if (val) {
//     const count = countDecimals(val);
//     return isNumber(val) && !isNaN(val) ? numberRender(val, count <= 2 ? 2 : count) : val;
//   }
// }

// function countDecimals(val) {
//   return isNaN(+val) || (isNumber(val) && Math.floor(val) !== val)
//     ? `${val}`.split('.')[1].length || 0
//     : 0;
// }

@Form.create({ fieldNameProp: null })
export default class PurchaseLineInfo extends Component {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      tenantId: getCurrentOrganizationId(),
      organizationId: getUserOrganizationId(),
    };
  }

  /**
   * 成本中心改变回调
   * @param {String} value
   * @param {Object} lovRecord
   * @param {Object} record
   */
  @Bind()
  handleCostCenter(value, lovRecord, record) {
    const { costCode, costName, costId } = lovRecord;
    const {
      $form: { setFieldsValue },
    } = record;
    setFieldsValue({ costId, costName });
    const { onChangeListData, dataSource } = this.props;
    const listDataSource = dataSource.map((item) => {
      if (item.prLineId === record.prLineId) {
        return {
          ...item,
          costCode,
          costName,
          costId,
        };
      }
      return item;
    });
    onChangeListData(listDataSource);
  }

  /**
   * 预算科目改变回调
   * @param {*} value
   * @param {*} lovRecord
   * @param {*} record
   */
  handleBudgetAccount(value, lovRecord, record) {
    const { budgetAccountId, budgetAccountName } = lovRecord;
    const {
      $form: { setFieldsValue },
    } = record;
    setFieldsValue({ budgetAccountId, budgetAccountName });
    const { onChangeListData, dataSource } = this.props;
    const listDataSource = dataSource.map((item) => {
      if (item.poLineId === record.poLineId) {
        return {
          ...item,
          budgetAccountId,
          budgetAccountName,
        };
      }
      return item;
    });
    onChangeListData(listDataSource);
  }

  /**
   * WBS改变回调
   * @param {String} value
   * @param {Object} lovRecord
   * @param {Object} record
   */
  @Bind()
  handleWbs(value, lovRecord, record) {
    const { wbsCode, wbsName } = lovRecord;
    const {
      $form: { setFieldsValue },
    } = record;
    setFieldsValue({ wbsCode: wbsCode || '', wbs: wbsName });
    const { onChangeListData, dataSource } = this.props;
    const listDataSource = dataSource.map((item) => {
      if (item.prLineId === record.prLineId) {
        return {
          ...item,
          wbsCode: wbsCode || '',
          wbs: wbsName,
        };
      }
      return item;
    });
    onChangeListData(listDataSource);
  }

  // 物料编码改变回调
  @Bind()
  handleItemOnChange(value, dataList, record, isCatalogOrECom) {
    const { itemId, itemCode, itemName, categoryId, categoryCode, categoryName } = dataList;
    const { setFieldsValue, registerField } = record.$form;
    registerField('categoryCode');
    registerField('categoryId');
    if (isCatalogOrECom) {
      setFieldsValue({
        itemId,
        itemCode,
        itemName,
        categoryId,
        categoryCode,
        categoryName,
      });
    }
  }

  // 获取个性化表格编码
  @Bind()
  getCustomizeTableCode() {
    const { headerInfo = {} } = this.props;
    const { poSourcePlatform } = headerInfo;
    let code;
    switch (poSourcePlatform) {
      case 'ERP':
        code = 'SODR.ORDER_CREATE_LINE_LIST.LINE_BY_ERP';
        break;
      case 'E-COMMERCE':
        code = 'SODR.ORDER_CREATE_LINE_LIST.LINE_BY_EC';
        break;
      case 'SRM':
        code = 'SODR.ORDER_CREATE_LINE_LIST.PO_LINE_LOCATION';
        break;
      case 'SHOP':
        code = 'SODR.ORDER_CREATE_LINE_LIST.PO_LINE_LOCATION';
        break;
      case 'CATALOGUE':
        code = 'SODR.ORDER_CREATE_LINE_LIST.LINE_BY_CATALOGUE';
        break;
      default:
        code = null;
        break;
    }
    return code;
  }

  render() {
    const code = this.getCustomizeTableCode();
    const { tenantId, organizationId } = this.state;
    const {
      prSourcePlatform,
      statusCode,
      customizeTable,
      orderHeaderFormDataSource,
      returnOrderFlag,
      afterOpenUploadModal,
      headerInfo,
      // form: { getFieldValue },
    } = this.props;
    const { supplierCompanyId, companyId, ouId, tieredPricingFlag } = orderHeaderFormDataSource;
    const isEComAndReject = prSourcePlatform === 'E-COMMERCE' && statusCode === 'REJECTED';
    const isCatalogOrECom = ['E-COMMERCE', 'CATALOGUE'].includes(prSourcePlatform);
    const columns = [
      {
        title: intl.get(`sodr.quotePurchase.model.quotePurchase.displayLineNum`).d('行号'),
        dataIndex: 'displayLineNum',
        fixed: 'left',
        width: 80,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('displayLineNum', {
                initialValue: record.displayLineNum,
              })(<Input disabled />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`sodr.quotePurchase.model.quotePurchase.displayNum`).d('发运号'),
        dataIndex: 'displayLineLocationNum',
        fixed: 'left',
        width: 90,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('displayLineLocationNum', {
                initialValue: record.displayLineLocationNum,
              })(<Input disabled />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`sodr.quotePurchase.model.quotePurchase.productNum`).d('商品编码'),
        dataIndex: 'productNum',
        width: 200,
        fixed: 'left',
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('productNum', {
                initialValue: record.productNum,
              })(<Input disabled />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`sodr.quotePurchase.model.quotePurchase.productName`).d('商品名称'),
        width: 200,
        dataIndex: 'productName',
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('productName', {
                initialValue: record.productName,
              })(<Input disabled />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`sodr.quotePurchase.model.quotePurchase.catalogName`).d('商品目录'),
        width: 200,
        dataIndex: 'catalogName',
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('catalogName', {
                initialValue: record.catalogName,
              })(<Input disabled />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`sodr.quotePurchase.model.quotePurchase.organizationName`).d('收货组织'),
        dataIndex: 'invOrganizationName',
        width: 200,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`invOrganizationId`, {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`sodr.quotePurchase.model.quotePurchase.organizationName`)
                        .d('收货组织'),
                    }),
                  },
                ],
                initialValue: record.invOrganizationId,
              })(
                <Lov
                  onChange={(value) =>
                    this.handleOriginationLovChange(value, 'invOrganizationId', record)
                  }
                  code="SPUC.SMDM.INV_ORG"
                  textValue={record.invOrganizationName}
                  queryParams={{
                    enabledFlag: 1,
                    tenantId,
                    ouId,
                    itemId: record.$form.getFieldValue('itemId'),
                  }}
                  disabled={record.invOrganizationId}
                />
              )}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`sodr.quotePurchase.model.quotePurchase.itemCode`).d('物料编码'),
        dataIndex: 'itemId',
        width: 120,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('itemId', {
                initialValue: val,
                rules: [
                  {
                    required: (record.$form.getFieldValue('requiredFieldNames') || []).includes(
                      'itemId'
                    ),
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get('sodr.quotePurchase.model.quotePurchase.itemCode')
                        .d('物料编码'),
                    }),
                  },
                ],
              })(
                <Lov
                  code="SPUC.ITEM_PRICE_LIBRARY"
                  onChange={(value, dataList) => {
                    this.handleItemOnChange(value, dataList, record, isCatalogOrECom);
                  }}
                  originTenantId={getCurrentOrganizationId()}
                  lovOptions={{ valueField: 'itemId', displayField: 'itemCode' }}
                  textValue={record.$form.getFieldValue('itemCode') || record.itemCode}
                  queryParams={{
                    organizationId,
                    tenantId,
                    supplierCompanyId,
                    priceShieldFlag:
                      record.returnedFlag !== 1 || record.$form.getFieldValue('returnedFlag') !== 1
                        ? tieredPricingFlag
                        : null,
                    companyId,
                    ouId,
                    invOrganizationId: record.$form.getFieldValue('invOrganizationId'),
                  }}
                  disabled={!isCatalogOrECom}
                />
              )}
              {record.$form.getFieldDecorator('itemCode', { initialValue: record.itemCode })}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`sodr.quotePurchase.model.quotePurchase.itemName`).d('物料名称'),
        dataIndex: 'itemName',
        width: 120,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('itemName', {
                initialValue: record.itemName,
              })(<Input disabled />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`sodr.common.model.common.categoryName`).d('物料分类'),
        dataIndex: 'categoryName',
        width: 120,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('categoryName', {
                initialValue: record.categoryName,
              })(<Input disabled />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`sodr.common.model.common.referPrice`).d('参考价格'),
        width: 90,
        dataIndex: 'priceLibraryId',
        render: () => <a>{intl.get(`sodr.common.model.common.referPrice`).d('参考价格')}</a>,
      },
      {
        title: intl.get(`sodr.quotePurchase.model.quotePurchase.quantity`).d('数量'),
        dataIndex: 'quantity',
        width: 120,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('quantity', {
                initialValue: record.quantity,
              })(<Input disabled max={MAX_QUAN_NUMBER} />)}
            </FormItem>
          ) : (
            formatAumont(val)
          ),
      },
      {
        title: intl.get(`sodr.quotePurchase.model.quotePurchase.uomName`).d('单位'),
        dataIndex: 'uomName',
        width: 100,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('uomCodeAndName', {
                initialValue: record.uomCodeAndName,
              })(<Input disabled />)}
            </FormItem>
          ) : (
            record.uomCodeAndName
          ),
        // (
        //   formatUom(record.uomCode, record.uomName)
        // ),
      },
      {
        title: intl.get(`sodr.quotePurchase.model.quotePurchase.currencyCode`).d('币种'),
        dataIndex: 'currencyCode',
        width: 120,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('currencyCode', {
                initialValue: record.currencyCode,
                rules: [
                  {
                    required: (record.$form.getFieldValue('requiredFieldNames') || []).includes(
                      'currencyCode'
                    ),
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get('sodr.quotePurchase.model.quotePurchase.currencyCode')
                        .d('币种'),
                    }),
                  },
                ],
              })(
                <Lov
                  code="SPRM.EXCHANGE_RATE.CURRENCY"
                  disabled={isEComAndReject || isCatalogOrECom}
                  textValue={record.currencyCode}
                  queryParams={{ tenantId }}
                />
              )}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`sodr.quotePurchase.model.quotePurchase.taxRate`).d('税率（%）'),
        dataIndex: 'taxRate',
        width: 120,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('taxRate', {
                initialValue: record.taxRate,
              })(<Input disabled max={MAX_QUAN_NUMBER} />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`sodr.common.model.common.unitPrice`).d('不含税单价'),
        width: 140,
        align: 'right',
        dataIndex: 'unitPrice',
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('unitPrice', {
                initialValue: record.unitPrice,
              })(<Input disabled max={MAX_QUAN_NUMBER} />)}
            </FormItem>
          ) : (
            formatAumont(val)
          ),
      },
      {
        title: intl.get(`sodr.common.model.common.taxedEnteredUnitPrice`).d('原币含税单价'),
        dataIndex: 'enteredTaxIncludedPrice',
        align: 'right',
        width: 140,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('enteredTaxIncludedPrice', {
                initialValue: record.enteredTaxIncludedPrice,
              })(<Input disabled max={MAX_QUAN_NUMBER} />)}
            </FormItem>
          ) : (
            formatAumont(val)
          ),
      },
      {
        title: intl.get('sodr.common.model.common.department').d('部门'),
        dataIndex: 'departmentId',
        width: 150,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('departmentId', {
                initialValue: record.departmentId,
                rules: [
                  {
                    required: (record.$form.getFieldValue('requiredFieldNames') || []).includes(
                      'departmentId'
                    ),
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('sodr.common.model.common.department').d('部门'),
                    }),
                  },
                ],
              })(
                <Lov
                  code="SPRM.USER_UNIT"
                  textValue={record.departmentName}
                  queryParams={{ tenantId }}
                />
              )}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`hpfm.employee.model.employee.costCenterCode`).d('成本中心'),
        width: 120,
        dataIndex: 'costId',
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`costId`, {
                rules: [
                  {
                    required: (record.$form.getFieldValue('requiredFieldNames') || []).includes(
                      'costId'
                    ),
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('hpfm.employee.model.employee.costCenterCode').d('成本中心'),
                    }),
                  },
                ],
                initialValue: record.costId,
              })(
                <Lov
                  disabled={!companyId}
                  code="SPRM.COST_CENTER"
                  textValue={record.costName}
                  textField="costName"
                  lovOptions={{ valueField: 'costId', displayField: 'costName' }}
                  queryParams={{
                    companyId,
                    tenantId,
                    ouId,
                  }}
                  onChange={(value, lovRecord) => this.handleCostCenter(value, lovRecord, record)}
                />
              )}
              {record.$form.getFieldDecorator('costName', {
                initialValue: record.costName,
              })}
            </FormItem>
          ) : (
            record.costName
          ),
      },
      {
        title: intl.get(`sodr.quotePurchase.model.quotePurchase.wbs`).d('WBS元素'),
        width: 165,
        dataIndex: 'wbsCode',
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`wbsCode`, {
                rules: [
                  {
                    required: (record.$form.getFieldValue('requiredFieldNames') || []).includes(
                      'wbsCode'
                    ),
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('sodr.quotePurchase.model.quotePurchase.wbs').d('WBS元素'),
                    }),
                  },
                ],
                initialValue: val,
              })(
                <Lov
                  code="SMDM.WBS"
                  onChange={(value, lovRecord) => this.handleWbs(value, lovRecord, record)}
                  lovOptions={{ valueField: 'wbsCode' }}
                  textValue={record.wbs}
                  queryParams={{
                    tenantId,
                    companyId,
                    ouId,
                  }}
                />
              )}
              {record.$form.getFieldDecorator('wbs', {})}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`sodr.quotePurchase.model.quotePurchase.returnedFlag`).d('是否退回'),
        dataIndex: 'returnedFlag',
        width: 100,
        // render: this.yesOrNoRender,
        render: (val, record) => (
          <FormItem>
            {record.$form.getFieldDecorator('returnedFlag', {
              initialValue: record.returnedFlag,
              // rules: [
              //   {
              //     required: (record.$form.getFieldValue('requiredFieldNames') || []).includes(
              //       'returnedFlag'
              //     ),
              //     message: intl.get('hzero.common.validation.notNull', {
              //       name: intl.get(`sodr.quotePurchase.model.quotePurchase.returnedFlag`).d('是否退回'),
              //     }),
              //   },
              // ],
            })(
              <Checkbox
                checked={returnOrderFlag === 1 || record.returnedFlag === 1}
                onChange={(e) => this.handleChangeReturn(e, record)}
                disabled={returnOrderFlag === 1 || record.returnedFlag === 1}
              />
            )}
          </FormItem>
        ),
      },
      {
        title: intl.get(`sodr.quotePurchase.model.quotePurchase.brand`).d('品牌'),
        dataIndex: 'brand',
        width: 120,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('brand', {
                initialValue: record.brand,
              })(<Input />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`sodr.quotePurchase.model.quotePurchase.specifications`).d('规格'),
        dataIndex: 'specifications',
        width: 120,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('specifications', {
                initialValue: record.specifications,
              })(<Input />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`sodr.quotePurchase.model.quotePurchase.model`).d('型号'),
        dataIndex: 'model',
        width: 120,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('model', {
                initialValue: record.model,
              })(<Input />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get('sodr.common.model.common.jdPrice').d('划线价'),
        dataIndex: 'jdPrice',
        align: 'right',
        width: 120,
        render: (val) => formatNumber(val),
      },
      {
        title: intl.get(`sodr.quotePurchase.model.quotePurchase.needByDate`).d('需求日期'),
        width: 120,
        dataIndex: 'needByDate',
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('needByDate', {
                initialValue: record.needByDate
                  ? moment(record.needByDate).format(DEFAULT_DATE_FORMAT)
                  : undefined,
              })(<Input disabled />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`sodr.common.model.common.accountAssignment`).d('科目分配'),
        width: 150,
        dataIndex: 'keMu',
      },
      {
        title: intl.get(`sodr.quotePurchase.model.quotePurchase.displayPrNum`).d('采购申请号|行号'),
        width: 180,
        dataIndex: 'displayPrNumAndDisplayPrLineNum',
      },
      {
        title: intl.get(`sodr.quotePurchase.model.quotePurchase.purReqAppliedName`).d('申请人'),
        width: 120,
        dataIndex: 'prRequestedName',
        render: (_, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('purReqAppliedName', {
                initialValue: record.purReqAppliedName,
              })(<Input disabled />)}
            </FormItem>
          ) : (
            record.purReqAppliedName
          ),
      },
      {
        title: intl.get(`hzero.common.remark`).d('备注'),
        dataIndex: 'remark',
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('remark', {
                initialValue: record.remark,
                rules: [
                  {
                    required: (record.$form.getFieldValue('requiredFieldNames') || []).includes(
                      'remark'
                    ),
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('hzero.common.remark').d('备注'),
                    }),
                  },
                ],
              })(<Input />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`sodr.common.model.common.lineAttachmentUuid`).d('行附件'),
        dataIndex: 'attachmentUuid',
        width: 100,
        render: (value, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`attachmentUuid`, {
                initialValue: record.attachmentUuid,
              })(
                <UploadModal
                  bucketName={BUCKET_NAME}
                  bucketDirectory="sodr-order"
                  attachmentUUID={record.attachmentUuid}
                  icon={false}
                  afterOpenUploadModal={(uuid) => afterOpenUploadModal(uuid, record)}
                />
              )}
            </FormItem>
          ) : null,
      },
      {
        title: intl.get(`sodr.common.model.common.domesticTaxIncludedPrice`).d('本币含税单价'),
        width: 120,
        dataIndex: 'domesticTaxIncludedPrice',
        render: (val) => formatAumont(val, headerInfo.domesticDefaultPrecision),
      },
      {
        title: intl.get(`sodr.common.model.common.domesticUnitPrice`).d('本币不含税单价'),
        width: 120,
        dataIndex: 'domesticUnitPrice',
        render: (val) => formatAumont(val, headerInfo.domesticDefaultPrecision),
      },
      {
        title: intl.get(`sodr.common.model.common.domesticTaxIncludedLineAmount`).d('本币含税金额'),
        width: 120,
        dataIndex: 'domesticTaxIncludedLineAmount',
        render: (val) => formatAumont(val, headerInfo.domesticFinancialPrecision, true),
      },
      {
        title: intl.get(`sodr.common.model.common.domesticLineAmount`).d('本币不含税金额'),
        width: 120,
        dataIndex: 'domesticLineAmount',
        render: (val) => formatAumont(val, headerInfo.domesticFinancialPrecision, true),
      },
      {
        title: intl.get(`sodr.common.model.common.budgetAccount`).d('预算科目'),
        width: 180,
        dataIndex: 'budgetAccountId',
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`budgetAccountId`, {
                initialValue: record.budgetAccountId,
              })(
                <Lov
                  code="SMDM.BUDGET_ACCOUNT_ORDER"
                  textValue={record.budgetAccountName}
                  textField="budgetAccountName"
                  lovOptions={{ valueField: 'budgetAccountId', displayField: 'budgetAccountName' }}
                  queryParams={{
                    tenantId,
                  }}
                  onChange={(value, lovRecord) =>
                    this.handleBudgetAccount(value, lovRecord, record)
                  }
                />
              )}
              {record.$form.getFieldDecorator('budgetAccountName', {})}
            </FormItem>
          ) : (
            record.budgetAccountName
          ),
      },
    ];
    const { loading, onSearch, pagination = {}, dataSource = [] } = this.props;
    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0))) + 300;
    const editTableProps = {
      loading,
      columns,
      dataSource,
      pagination,
      bordered: true,
      rowKey: 'poLineId',
      onChange: (page) => onSearch(page),
      scroll: { x: scrollX },
    };
    return (
      <div className={styles['purchase-application']}>
        {code ? (
          customizeTable(
            {
              code,
              clearCache: () => {},
            },
            <EditTable {...editTableProps} />
          )
        ) : (
          <EditTable {...editTableProps} />
        )}
      </div>
    );
  }
}
