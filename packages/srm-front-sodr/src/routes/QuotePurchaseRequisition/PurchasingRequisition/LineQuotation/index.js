import React, { Component, Fragment } from 'react';
import { Form, Col, Row, Button, Input, DatePicker, Select, Tooltip, InputNumber } from 'hzero-ui';
import moment from 'moment';
import DocFlow from '_components/DocFlow';
import { isNumber, sum, isArray, isEmpty, isNil } from 'lodash';
import EditTable from 'components/EditTable';

import { Bind } from 'lodash-decorators';
import cacheComponent from 'components/CacheComponent';
import Lov from 'components/Lov';
import intl from 'utils/intl';
import {
  getCurrentOrganizationId,
  getUserOrganizationId,
  getDateFormat,
  getDateTimeFormat,
} from 'utils/utils';
import { dateRender, yesOrNoRender } from 'utils/renderer';
import notification from 'utils/notification';

import urgentImg from '@/assets/icon-expedited.svg';
import abnormal from '@/assets/abnormal.svg';
import styles from './index.less';
import PriceModle from './PriceModle';
import { formatAumont, parseAumont, getDynamicLabel } from '@/routes/components/utils';
import LovModal from '../../../components/MultipleLov';

const FormItem = Form.Item;

const { Option } = Select;

const formItemLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};

/**
 * LineQuotation - 引用采购申请 按行引用组件
 * @export {Component} React.Component
 * @reactProps {object} form - 表单对象
 */
@Form.create({ fieldNameProp: null })
@cacheComponent({ cacheKey: '/sodr/purchase-line-quotation' })
export default class LineQuotation extends Component {
  constructor(props) {
    super(props);
    this.state = {
      expandForm: false,
      companyId: null,
      // productNumVisible: false,
      organizationId: getUserOrganizationId(),
      tenantId: getCurrentOrganizationId(),
      priceModalVisible: false, // 参考价格是否可见
      priceModal: {}, // 需要带入到参考价格里的参数
    };
    const { onRef } = props;
    onRef(this);
  }

  /**
   * 查询
   * @param {*} [page={}]
   */
  @Bind()
  handleSearch(page = {}, buttonFlag, sorter) {
    const { onSearch } = this.props;
    onSearch(page, buttonFlag, sorter);
  }

  /**
   * 重置表单
   */

  @Bind()
  handleReset() {
    const { form, updateState = () => {} } = this.props;
    form.resetFields();
    updateState({
      requisitionLovCache: {},
    });
    this.setState({
      companyId: null,
    });
  }

  /**
   * 弹窗更多按钮弹窗
   */
  @Bind()
  toggleForm() {
    const { expandForm } = this.state;
    this.setState({
      expandForm: !expandForm,
    });
  }

  /**
   * 列表选择供应商触发
   */
  @Bind()
  handleSupplierCompanyChange(val, dataList, record) {
    const { doubleUnitEnabled, dataSource = [], lineQuotationDataChange = (e) => e } = this.props;
    const {
      $form: { setFieldsValue, getFieldValue },
    } = record;
    const {
      supplierCompanyId,
      supplierTenantId,
      supplierCompanyNum,
      supplierCompanyName,
      unitPrice,
      uomId,
      uomCode,
      uomName,
      currencyCode,
      taxId,
      taxRate,
      netPrice,
      priceLibId,
      taxIncludedPrice,
      unitPriceBatch,
      holdPcHeaderId,
      holdPcLineId,
      contractNum,
      benchmarkPriceType,
      ladderPriceLibId,
      ladderQuotationFlag,
      supplierId,
      supplierName,
      supplierNum,
    } = dataList;
    setFieldsValue({
      selectSupplierCompanyId: supplierCompanyId,
      selectSupplierTenantId: supplierTenantId,
      selectSupplierCode: supplierCompanyNum,
      selectSupplierCompanyName: supplierCompanyName,
      noUnitPrice: unitPrice,
      unitPrice: netPrice,
      originUnitPrice: benchmarkPriceType === 'NET_PRICE' ? netPrice : taxIncludedPrice,
      enteredTaxIncludedPrice: taxIncludedPrice,
      ladderQuotationFlag,
      ladderPriceLibId,
      contractNum,
      holdPcLineId,
      holdPcHeaderId,
      unitPriceBatch,
      taxIncludedPrice,
      priceLibId,
      uomId,
      uomName,
      currencyCode,
      taxId,
      taxRate,
      benchmarkPriceType,
      selectLocalSupplierCode: isNil(supplierCompanyId) ? null : supplierNum,
      selectLocalSupplierId: isNil(supplierId) ? null : supplierId,
      selectLocalSupplierName: isNil(supplierCompanyId) ? null : supplierName,
    });
    let lineQuotationData;
    const sodrEnabled = doubleUnitEnabled !== 0;
    if (!isEmpty(dataList) && sodrEnabled && getFieldValue('uomId') !== uomId) {
      notification.error({
        message: intl
          .get(`sodr.common.view.message.validateUomId`)
          .d(
            '该物料在价格库的单位与物料主数据中的基本单位不一致，请检查价格库或物料主数据后重新操作'
          ),
      });
      return false;
    }
    if (!sodrEnabled) {
      setFieldsValue({
        secondaryUomId: uomId,
        secondaryUomCode: uomCode,
        secondaryUomName: uomName,
      });
    }
    if (priceLibId) {
      lineQuotationData = dataSource.map((item) => {
        if (item.prLineId === record.prLineId) {
          const itemObj = {
            ...item,
            uomId,
            uomCode,
            uomName,
            currencyCode,
            taxId,
            taxRate,
            noUnitPrice: netPrice,
            unitPrice: netPrice,
            priceLibId,
            taxIncludedPrice,
            unitPriceBatch,
            holdPcHeaderId,
            holdPcLineId,
            contractNum,
            benchmarkPriceType,
            ladderPriceLibId,
            ladderQuotationFlag,
            originUnitPrice: benchmarkPriceType === 'NET_PRICE' ? netPrice : taxIncludedPrice,
            enteredTaxIncludedPrice: taxIncludedPrice,
            selectSupplierCompanyId: supplierCompanyId,
            selectSupplierCode: supplierCompanyNum,
            selectSupplierCompanyName: supplierCompanyName,
          };
          if (!sodrEnabled) {
            Object.assign(itemObj, {
              secondaryUomId: uomId,
              secondaryUomCode: uomCode,
              secondaryUomName: uomName,
            });
          }
          return itemObj;
        }
        return item;
      });
    } else {
      lineQuotationData = dataSource.map((item) => {
        if (item.prLineId === record.prLineId) {
          return {
            ...item,
            selectSupplierCompanyId: supplierCompanyId,
            selectSupplierCode: supplierCompanyNum,
            selectSupplierCompanyName: supplierCompanyName,
            noUnitPrice: unitPrice,
          };
        }
        return item;
      });
    }
    // updateState({ lineQuotationData });
    lineQuotationDataChange(lineQuotationData);
  }

  /**
   * 公司lov改变时触发
   */
  @Bind()
  handleLovChange(lovValue, lovRecord) {
    const { form } = this.props;
    this.setState({
      companyId: lovRecord.companyId,
    });
    form.resetFields('productNum');
  }

  /**
   * 查询条件提示
   * @param {string} tip - 提示组件
   * @param {boolean} visible - 是否可见
   */
  @Bind()
  handleToolTipVisible(tip, visible) {
    this.setState({
      [tip]: visible,
    });
  }

  /**
   * 供应商改变回调
   * @param {string} value - 当前值
   * @param {object} record - 当前行
   */
  @Bind()
  handleChangeSupplier(value, record) {
    const {
      form: { registerField, setFieldsValue },
    } = this.props;
    registerField('supplierId');
    registerField('supplierCompanyId');
    registerField('supplierTenantId');
    setFieldsValue({
      supplierId: record.supplierId,
      supplierCompanyId: record.supplierCompanyId,
      supplierTenantId: record.supplierTenantId,
    });
  }

  @Bind()
  handlePrice(record) {
    const priceModal = {
      supplierCompanyId: record.supplierCompanyId,
      itemId: record.itemId,
      purchaseOrgId: record.purchaseOrgId,
      companyId: record.companyId,
      ouId: record.ouId,
      invOrganizationId: record.invOrganizationId,
      uomId: record.uomId,
      prLineId: record.prLineId,
      orderTypeCode: record.orderTypeCode,
      currencyCode: record.currencyCode,
      categoryId: record.categoryId,
    };
    this.setState({ priceModalVisible: true, priceModal });
  }

  // 缓存 Lov 显示值
  updateLovState = (lov) => {
    const {
      quotePurchaseRequisition: { requisitionLovCache },
      updateState = () => {},
    } = this.props;
    const _cacheLov = {
      ...requisitionLovCache,
      ...lov,
    };
    updateState({
      requisitionLovCache: _cacheLov,
    });
  };

  // 自定义表单校验
  @Bind()
  validator(record, value, callback) {
    const { restPoQuantity, orderExcessRuleCode } = record;
    if (
      value <= 0 ||
      (value > restPoQuantity &&
        !['DISPOSABLE_EXCESS', 'INFINITY_EXCESS'].includes(orderExcessRuleCode))
    ) {
      callback(intl.get(`sodr.orderType.view.message.numberError`).d('大于0小于剩余可下单数量'));
    }
    callback();
  }

  render() {
    const {
      expandForm,
      // companyId,
      // productNumVisible,
      organizationId,
      tenantId,
      priceModalVisible,
      priceModal,
    } = this.state;
    const {
      form,
      enumMap: { source = [], flag = [] },
      customizeTable,
      customizeFilterForm,
      dataSource,
      pagination,
      rowSelection,
      loading,
      doubleUnitEnabled,
      fetchSettingsLoading,
      lineQuoSelectedRowKeys,
      // thisOrderQuantityChange,
      quotePurchaseRequisition: { requisitionLovCache = {} },
    } = this.props;
    const { getFieldDecorator, getFieldValue } = form;
    const {
      itemCodes,
      // itemNames,
      prTypeIds,
      prTypeNames,
    } = requisitionLovCache;
    // console.log('itemCodes', itemCodes);
    const priceModalProps = {
      visible: priceModalVisible,
      supplierCompanyId: priceModal.supplierCompanyId,
      companyId: priceModal.companyId,
      ouId: priceModal.ouId,
      purchaseOrgId: priceModal.purchaseOrgId,
      itemId: priceModal.itemId,
      invOrganizationId: priceModal.invOrganizationId,
      uomId: priceModal.uomId,
      prLineId: priceModal.prLineId,
      hideModal: this.handleToolTipVisible,
      orderTypeCode: priceModal.orderTypeCode,
      currencyCode: priceModal.currencyCode,
      categoryId: priceModal.categoryId,
      customizeTable,
      customizeFilterForm,
    };
    const columns = [
      {
        title: intl.get(`sodr.quotePurchaseRequisition.view.message.prNum`).d('申请编号'),
        dataIndex: 'prNum',
        fixed: 'left',
        width: 150,
        render: (val, record) => (
          <div className={styles['row-agent-column']}>
            {record.incorrectFlag === 1 ? (
              <Tooltip title={record.incorrectMsg}>
                <img src={abnormal} alt="img" />
              </Tooltip>
            ) : (
              val
            )}
            {record.urgentFlag === 1 ? (
              <Tooltip
                title={intl.get(`sodr.orderMaintenanceEntry.model.common.urgent`).d('订单加急')}
              >
                <img src={urgentImg} alt="img" />
              </Tooltip>
            ) : (
              ''
            )}
          </div>
        ),
      },
      {
        title: intl.get(`sodr.common.model.common.lineNum`).d('行号'),
        dataIndex: 'displayLineNum',
        fixed: 'left',
        width: 100,
      },
      {
        title: intl.get(`sodr.quotePurchaseRequisition.view.message.itemCode`).d('物料编码'),
        dataIndex: 'itemCode',
        width: 120,
      },
      {
        title: intl.get(`sodr.quotePurchaseRequisition.view.message.itemName`).d('物料名称'),
        dataIndex: 'itemName',
        width: 120,
      },
      {
        title: intl.get(`sodr.quotePurchaseRequisition.view.message.itemCatalog`).d('物料分类'),
        dataIndex: 'categoryName',
        width: 120,
      },
      {
        title: intl.get(`sodr.quotePurchaseRequisition.view.message.referencePrice`).d('参考价格'),
        dataIndex: 'referencePrice',
        width: 90,
        render: (_, record) => {
          const { itemCode, prSourcePlatform, referencePriceDisplayFlag } = record;
          if (itemCode && prSourcePlatform !== 'CATALOGUE' && referencePriceDisplayFlag) {
            return (
              <a onClick={() => this.handlePrice(record)}>
                {intl
                  .get(`sodr.quotePurchaseRequisition.view.message.referencePrice`)
                  .d('参考价格')}
              </a>
            );
          }
        },
      },
      {
        title: intl
          .get(`sodr.quotePurchaseRequisition.model.quotePurchaseRequisition.supplierName`)
          .d('供应商'),
        dataIndex: 'priceLibraryId',
        width: 150,
        render: (val, record) =>
          record.prSourcePlatform === 'SRM' ||
          record.prSourcePlatform === 'ERP' ||
          record.prSourcePlatform === 'SHOP' ? (
            <FormItem>
              {record.$form.getFieldDecorator(`priceLibraryId`, {
                initialValue: val,
              })(
                <Lov
                  code="SODR.PR_SUGGEST_SUPPLIER"
                  queryParams={{
                    itemId: record.itemId,
                    companyId: record.companyId,
                    ouId: record.ouId,
                    priceSortFlag: 1,
                    purchaseOrgId: record.purchaseOrgId,
                    invOrganizationId: record.invOrganizationId,
                    uomId: record.uomId,
                    prLineId: record.prLineId,
                    currencyCode: record.currencyCode,
                    categoryId: record.categoryId,
                  }}
                  textValue={
                    isNil(record.selectSupplierCompanyName)
                      ? record.selectLocalSupplierName
                      : record.selectSupplierCompanyName
                  }
                  // lovOptions={{
                  //   displayField: 'supplierCompanyName',
                  //   valueField: 'priceLibraryId',
                  // }}
                  onChange={(value, dataList) => {
                    this.handleSupplierCompanyChange(value, dataList, record);
                  }}
                />
              )}
              {record.$form.getFieldDecorator('selectSupplierCompanyId', {
                initialValue: record.selectSupplierCompanyId,
              })}
              {record.$form.getFieldDecorator('selectSupplierTenantId', {
                initialValue: record.selectSupplierTenantId,
              })}
              {record.$form.getFieldDecorator('selectSupplierCode', {
                initialValue: record.selectSupplierCode,
              })}
              {record.$form.getFieldDecorator('selectSupplierCompanyName', {
                initialValue: record.selectSupplierCompanyName,
              })}
              {record.$form.getFieldDecorator('unitPrice', {
                initialValue: record.unitPrice,
              })}
              {record.$form.getFieldDecorator('originUnitPrice', {
                initialValue: record.originUnitPrice,
              })}
              {record.$form.getFieldDecorator('enteredTaxIncludedPrice', {
                initialValue: record.enteredTaxIncludedPrice,
              })}
              {record.$form.getFieldDecorator('ladderQuotationFlag', {
                initialValue: record.ladderQuotationFlag,
              })}
              {record.$form.getFieldDecorator('ladderPriceLibId', {
                initialValue: record.ladderPriceLibId,
              })}
              {record.$form.getFieldDecorator('contractNum', {
                initialValue: record.contractNum,
              })}
              {record.$form.getFieldDecorator('holdPcLineId', {
                initialValue: record.holdPcLineId,
              })}
              {record.$form.getFieldDecorator('holdPcHeaderId', {
                initialValue: record.holdPcHeaderId,
              })}
              {record.$form.getFieldDecorator('unitPriceBatch', {
                initialValue: record.unitPriceBatch,
              })}
              {record.$form.getFieldDecorator('taxIncludedPrice', {
                initialValue: record.taxIncludedPrice,
              })}
              {record.$form.getFieldDecorator('priceLibId', {
                initialValue: record.priceLibId,
              })}
              {record.$form.getFieldDecorator('uomId', {
                initialValue: record.uomId,
              })}
              {record.$form.getFieldDecorator('uomName', {
                initialValue: record.uomName,
              })}
              {record.$form.getFieldDecorator('currencyCode', {
                initialValue: record.currencyCode,
              })}
              {record.$form.getFieldDecorator('taxId', {
                initialValue: record.taxId,
              })}
              {record.$form.getFieldDecorator('taxRate', {
                initialValue: record.taxRate,
              })}
              {record.$form.getFieldDecorator('selectLocalSupplierCode', {
                initialValue: record.selectLocalSupplierCode,
              })}
              {record.$form.getFieldDecorator('selectLocalSupplierId', {
                initialValue: record.selectLocalSupplierId,
              })}
              {record.$form.getFieldDecorator('selectLocalSupplierName', {
                initialValue: record.selectLocalSupplierName,
              })}
              {record.$form.getFieldDecorator('benchmarkPriceType', {
                initialValue: record.benchmarkPriceType,
              })}
            </FormItem>
          ) : (
            record.supplierName
          ),
      },
      {
        title: intl.get(`sodr.common.model.common.unitPrice`).d('不含税单价'),
        dataIndex: 'noUnitPrice',
        width: 120,
        render: (val, record) =>
          record.prSourcePlatform === 'SRM' ||
          record.prSourcePlatform === 'ERP' ||
          record.prSourcePlatform === 'SHOP' ? (
            <FormItem>
              {record.$form.getFieldDecorator(`noUnitPrice`, {
                initialValue: val,
              })(
                <div>
                  {formatAumont(record.$form.getFieldValue('noUnitPrice'), record.defaultPrecision)}
                </div>
              )}
            </FormItem>
          ) : (
            formatAumont(record.unitPrice, record.defaultPrecision)
          ),
      },
      doubleUnitEnabled && {
        title: intl.get(`sodr.quotePurchaseRequisition.view.message.quantity`).d('数量'),
        dataIndex: 'secondaryQuantity',
        width: 100,
        render: (text) => text && formatAumont(text),
      },
      {
        title: intl
          .get(`sodr.quotePurchaseRequisition.view.message.thisOrderQuantity`)
          .d('本次下单数量'),
        dataIndex: 'thisOrderQuantity',
        width: 150,
        render: (val, record) => {
          const { prLineId, transactionMode } = record;
          const fieldTouched = record.$form.isFieldTouched('thisOrderQuantity');
          return !lineQuoSelectedRowKeys.includes(prLineId) ? (
            formatAumont(val)
          ) : (
            <FormItem>
              {record.$form.getFieldDecorator(`thisOrderQuantity`, {
                initialValue: val,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`sodr.quotePurchaseRequisition.view.message.thisQuantity`)
                        .d('本次下单数量'),
                    }),
                  },
                  {
                    validator: (_, value, callback) => this.validator(record, value, callback),
                  },
                ],
              })(
                <InputNumber
                  style={{ width: '100%' }}
                  inputChinese={false}
                  disabled={transactionMode === 'TRIPARTITE'}
                  formatter={(value) =>
                    fieldTouched
                      ? value
                      : formatAumont(
                          value,
                          doubleUnitEnabled ? record.secondaryUomPrecision : record.uomPrecision,
                          true
                        )
                  }
                  parser={(value) =>
                    parseAumont(
                      value,
                      doubleUnitEnabled ? record.secondaryUomPrecision : record.uomPrecision
                    )
                  }
                  allowThousandth="true"
                  // onBlur={(item) => {
                  //   thisOrderQuantityChange(item, record);
                  // }}
                />
              )}
            </FormItem>
          );
        },
      },
      {
        title: intl
          .get(`sodr.quotePurchaseRequisition.view.message.occupiedOrderQuantity`)
          .d('已创建单据数量'),
        dataIndex: 'occupiedQuantity',
        width: 120,
        render: (text) => formatAumont(text),
      },
      {
        title: intl
          .get(`sodr.quotePurchaseRequisition.view.message.restPoQuantity`)
          .d('剩余可下单数量'),
        dataIndex: 'restPoQuantity',
        width: 120,
        render: (text) => formatAumont(text),
      },
      doubleUnitEnabled && {
        title: intl.get(`sodr.quotePurchaseRequisition.view.message.uomCode`).d('单位'),
        dataIndex: 'secondaryUomName',
        width: 100,
        render: (_, { secondaryUomCodeAndName }) => secondaryUomCodeAndName,
      },
      {
        title: getDynamicLabel(doubleUnitEnabled, 'quantity'),
        dataIndex: 'quantity',
        width: 100,
        render: (text) => formatAumont(text),
      },
      {
        title: getDynamicLabel(doubleUnitEnabled, 'uom'),
        dataIndex: 'uomName',
        width: 100,
        render: (_, { uomCodeAndName }) => uomCodeAndName,
      },

      {
        title: intl.get(`sodr.quotePurchaseRequisition.view.message.neededDate`).d('需求日期'),
        dataIndex: 'neededDate',
        width: 120,
        sorter: true,
        render: dateRender,
      },
      {
        title: intl.get(`sodr.quotePurchaseRequisition.view.message.projectCategory`).d('项目类别'),
        dataIndex: 'projectCategoryMeaning',
        width: 100,
      },
      {
        title: intl
          .get('sodr.quotePurchaseRequisition.view.message.accountAssignType')
          .d('账户分配类别'),
        dataIndex: 'accountAssignTypeCode',
        width: 120,
      },
      {
        title: intl.get('sodr.common.model.common.applicationType').d('申请类型'),
        dataIndex: 'prTypeName',
        width: 100,
      },
      {
        title: intl.get(`sodr.common.model.common.commonName`).d('通用名'),
        dataIndex: 'commonName',
        width: 120,
      },
      {
        title: intl.get(`sodr.quotePurchaseRequisition.view.message.currencyCode`).d('币种'),
        dataIndex: 'currencyCode',
        width: 100,
      },
      {
        title: intl
          .get(`sodr.quotePurchase.model.quotePurchase.includedPrice`)
          .d('预估单价（含税）'),
        dataIndex: 'taxIncludedUnitPrice',
        width: 140,
        align: 'right',
        render: (text, record) => formatAumont(text, record.defaultPrecision),
      },
      {
        title: intl
          .get(`sodr.quotePurchaseRequisition.view.message.supplierCode`)
          .d('建议供应商编码'),
        dataIndex: 'supplierCode',
        width: 120,
      },
      {
        title: intl
          .get(`sodr.quotePurchaseRequisition.view.message.supplierName`)
          .d('建议供应商名称'),
        dataIndex: 'supplierName',
        width: 120,
        render: (val, record) => record.supplierName || record.supplierCompanyName,
      },

      {
        title: intl.get(`sodr.quotePurchaseRequisition.view.message.companyName`).d('公司'),
        dataIndex: 'companyName',
        width: 120,
      },
      {
        title: intl.get(`sodr.quotePurchaseRequisition.view.message.entity`).d('业务实体'),
        dataIndex: 'ouName',
        width: 120,
      },
      {
        title: intl.get(`sodr.quotePurchaseRequisition.view.message.purchaseOrgName`).d('采购组织'),
        dataIndex: 'purchaseOrgName',
        width: 180,
      },
      {
        title: intl.get(`sodr.quotePurchaseRequisition.view.message.inventory`).d('库存组织'),
        dataIndex: 'invOrganizationName',
        width: 120,
      },
      {
        title: intl.get(`sodr.quotePurchaseRequisition.view.message.productCode`).d('商品编码'),
        dataIndex: 'productNum',
        width: 120,
      },
      {
        title: intl.get(`sodr.quotePurchaseRequisition.view.message.productName`).d('商品名称'),
        dataIndex: 'productName',
        width: 120,
      },
      {
        title: intl.get(`sodr.quotePurchaseRequisition.view.message.productCatalog`).d('商品目录'),
        dataIndex: 'catalogName',
        width: 120,
      },
      {
        title: intl.get(`sodr.quotePurchaseRequisition.view.message.applyPerson`).d('申请人'),
        dataIndex: 'prRequestedName',
        width: 120,
      },
      {
        title: intl.get(`sodr.quotePurchaseRequisition.view.message.phoneNum`).d('联系电话'),
        dataIndex: 'contactTelNum',
        width: 120,
      },
      {
        title: intl.get(`sodr.quotePurchaseRequisition.view.message.address`).d('收货方地址'),
        dataIndex: 'receiverAddress',
        width: 120,
      },
      {
        title: intl.get('sodr.common.model.common.surfaceManage').d('表面处理'),
        dataIndex: 'surfaceTreatFlag',
        width: 100,
        render: (val) => (val === '1' ? '是' : '否'),
      },
      {
        title: intl.get('sodr.common.model.common.contractNumber').d('协议编号'),
        dataIndex: 'pcNum',
        width: 160,
      },
      {
        title: intl.get('sodr.common.model.common.modelNumber').d('型号'),
        dataIndex: 'itemModel',
        width: 100,
      },
      {
        title: intl.get('sodr.common.model.common.specification').d('规格'),
        dataIndex: 'itemSpecs',
        width: 100,
      },
      {
        title: intl.get('hzero.common.remark').d('备注'),
        dataIndex: 'remark',
        width: 150,
        render: (val) => (
          <Tooltip title={val}>
            <span
              style={{
                width: '100%',
                display: 'inline-block',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {val}
            </span>
          </Tooltip>
        ),
      },
      {
        title: intl.get(`sodr.quotePurchaseRequisition.view.message.orderSource`).d('来源平台'),
        dataIndex: 'prSourcePlatformMeaning',
        width: 120,
      },
      {
        title: intl.get(`sodr.quotePurchaseRequisition.view.message.urgentFlag`).d('是否加急'),
        dataIndex: 'urgentFlag',
        width: 100,
        render: (val) => yesOrNoRender(val),
      },
      {
        title: intl.get(`sodr.quotePurchaseRequisition.view.message.urgentDate`).d('加急时间'),
        dataIndex: 'urgentDate',
        width: 180,
      },
      {
        width: 100,
        dataIndex: 'docFlow',
        title: intl.get(`sodr.common.model.common.docFlow`).d('单据流'),
        render: (_, record) => (
          <DocFlow tableName="sodr_po_line_location" tablePk={record.poLineLocationId} />
        ),
      },
    ].filter((i) => i);
    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0))) + 60;
    return (
      <Fragment>
        {customizeFilterForm(
          {
            form,
            expand: expandForm,
            code: 'SODR.PURCHASE_REQUISITION_LIST.FILTER_LINE',
          },
          <Form layout="inline" className="more-fields-search-form">
            <Row>
              <Col span={18}>
                <Row>
                  <Col span={8}>
                    <FormItem
                      label={intl
                        .get(`sodr.quotePurchaseRequisition.view.message.prNum`)
                        .d('申请编号')}
                      {...formItemLayout}
                    >
                      {getFieldDecorator('prNum')(<Input inputChinese={false} />)}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem
                      label={intl
                        .get(`sodr.quotePurchaseRequisition.view.message.lineNum`)
                        .d('申请行号')}
                      {...formItemLayout}
                    >
                      {getFieldDecorator('lineNum')(<Input inputChinese={false} />)}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem
                      label={intl.get('sodr.common.model.common.applicationType').d('申请类型')}
                      {...formItemLayout}
                    >
                      {getFieldDecorator('prTypeIds', { initialValue: prTypeIds })(
                        <LovModal
                          code="SPUC.PR_DEMAND_TYPE"
                          queryParams={{ tenantId }}
                          textValue={prTypeNames}
                          onChange={(_, record) => {
                            const _record = !isEmpty(record) && isArray(record) ? record : [];
                            const _prTypeNames = _record?.map((i) => i.prTypeName).join(', ');
                            const _prTypeIds = _record?.map((i) => i.prTypeId).join(', ');
                            this.updateLovState({
                              prTypeNames: _prTypeNames,
                              prTypeIds: _prTypeIds,
                            });
                          }}
                        />
                      )}
                    </FormItem>
                  </Col>
                </Row>
                <Row style={{ display: expandForm ? 'block' : 'none' }}>
                  <Col span={8}>
                    <FormItem
                      label={intl
                        .get(`sodr.quotePurchaseRequisition.view.message.companyName`)
                        .d('公司')}
                      {...formItemLayout}
                    >
                      {getFieldDecorator('companyIds')(
                        <LovModal
                          code="SPFM.USER_AUTH.COMPANY"
                          textField="companyName"
                          onChange={(lovValue, lovRecord) =>
                            this.handleLovChange(lovValue, lovRecord)
                          }
                          queryParams={{ organizationId }}
                        />
                      )}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem
                      label={intl.get(`sodr.common.model.common.requestDateFrom`).d('申请日期从')}
                      {...formItemLayout}
                    >
                      {getFieldDecorator('requestDateFrom')(
                        <DatePicker
                          format={getDateTimeFormat()}
                          placeholder={null}
                          disabledDate={(currentDate) =>
                            getFieldValue('requestDateTo') &&
                            moment(getFieldValue('requestDateTo')).isBefore(currentDate, 'day')
                          }
                        />
                      )}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem
                      label={intl.get(`sodr.common.model.common.requestDateTo`).d('申请日期至')}
                      {...formItemLayout}
                    >
                      {getFieldDecorator('requestDateTo')(
                        <DatePicker
                          format={getDateFormat()}
                          placeholder={null}
                          disabledDate={(currentDate) =>
                            getFieldValue('requestDateFrom') &&
                            moment(getFieldValue('requestDateFrom')).isAfter(currentDate, 'day')
                          }
                        />
                      )}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem
                      label={intl
                        .get(`sodr.quotePurchaseRequisition.view.message.purchaseOrgName`)
                        .d('采购组织')}
                      {...formItemLayout}
                    >
                      {getFieldDecorator('purchaseOrgId')(
                        <Lov
                          code="SPFM.USER_AUTH.PURORG_CODE"
                          queryParams={{ organizationId }}
                          textField="purchaseOrgName"
                        />
                      )}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem
                      label={intl
                        .get(`sodr.quotePurchaseRequisition.view.message.entity`)
                        .d('业务实体')}
                      {...formItemLayout}
                    >
                      {getFieldDecorator('ouIds')(
                        <LovModal
                          code="SPFM.USER_AUTH.OU"
                          queryParams={{ organizationId }}
                          textField="ouName"
                        />
                      )}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem
                      label={intl
                        .get(`sodr.quotePurchaseRequisition.view.message.creator`)
                        .d('申请人')}
                      {...formItemLayout}
                    >
                      {getFieldDecorator('createdBy')(
                        <Lov
                          code="SPUC.APPLY.USER"
                          queryParams={{ organizationId: tenantId }}
                          lovOptions={{ displayField: 'realName' }}
                          textField="realName"
                        />
                      )}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem
                      label={intl
                        .get(`sodr.quotePurchaseRequisition.view.message.reqUserName`)
                        .d('申请人查询')}
                      {...formItemLayout}
                    >
                      {getFieldDecorator('reqUserName')(<Input />)}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem
                      label={intl
                        .get(`sodr.quotePurchaseRequisition.view.message.purchaseAgent`)
                        .d('采购员')}
                      {...formItemLayout}
                    >
                      {getFieldDecorator('purchaseAgentIds')(
                        <LovModal
                          code="SPFM.USER_AUTH.PURCHASE_AGENT"
                          queryParams={{ organizationId }}
                          textField="purchaseAgentName"
                        />
                      )}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem
                      label={intl
                        .get(`sodr.quotePurchaseRequisition.view.message.orderSource`)
                        .d('来源平台')}
                      {...formItemLayout}
                    >
                      {getFieldDecorator('prSourcePlatform')(
                        <Select allowClear>
                          {source.map((n) => (
                            <Option key={n.value} value={n.value}>
                              {n.meaning}
                            </Option>
                          ))}
                        </Select>
                      )}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem
                      label={intl.get(`entity.supplier.tag`).d('供应商')}
                      {...formItemLayout}
                    >
                      {getFieldDecorator('tempKey')(
                        <Lov
                          code="SPRM.SUPPLIER"
                          textField="displaySupplierName"
                          queryParams={{
                            tenantId,
                            companyId: getFieldValue('companyId'),
                          }}
                          onChange={this.handleChangeSupplier}
                        />
                      )}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem
                      label={intl
                        .get(`sodr.quotePurchaseRequisition.view.message.itemCode`)
                        .d('物料编码')}
                      {...formItemLayout}
                    >
                      {getFieldDecorator('itemCodes', { initialValue: itemCodes })(
                        <LovModal
                          code="SPRM.ITEM"
                          queryParams={{ organizationId, tenantId }}
                          lovOptions={{ valueField: 'itemCode', displayField: 'itemCode' }}
                          // textField="itemName" //
                          textValue={itemCodes}
                          onChange={(_, record) => {
                            const _record = !isEmpty(record) && isArray(record) ? record : [];
                            const _itemCodes = _record.map((t) => t.itemCode).join(', ');
                            const _itemNames = _record.map((t) => t.itemName).join(', ');
                            const query = { itemCodes: _itemCodes, itemNames: _itemNames };
                            this.updateLovState(query);
                          }}
                        />
                      )}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem
                      label={intl
                        .get(`sodr.quotePurchaseRequisition.view.message.itemName`)
                        .d('物料名称')}
                      {...formItemLayout}
                    >
                      {getFieldDecorator('itemName')(<Input />)}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem
                      label={intl.get(`sodr.common.model.common.categoryName`).d('物料分类')}
                      {...formItemLayout}
                    >
                      {getFieldDecorator('categoryIds')(
                        <LovModal
                          code="SPRM.ITEM_CATEGOR"
                          textField="categoryName"
                          lovOptions={{ valueField: 'categoryId', displayField: 'categoryName' }}
                          queryParams={{
                            tenantId,
                            // enabledFlag: 1,
                            // itemId: getFieldValue('itemId'),
                          }}
                        />
                      )}
                    </FormItem>
                  </Col>
                  {/* <Col span={8}>
                  <Tooltip
                    title={intl
                      .get(`sodr.quotePurchaseRequisition.view.message.tipCompany`)
                      .d('请先选择公司')}
                    visible={productNumVisible && !companyId}
                  >
                    <FormItem
                      label={intl
                        .get(`sodr.quotePurchaseRequisition.view.message.productNum`)
                        .d('商品编码')}
                      {...formItemLayout}
                    >
                      {getFieldDecorator('productNum')(
                        <Lov
                          code="SCEC.COMPANY_PRODUCT"
                          queryParams={{ companyId }}
                          disabled={!companyId}
                          onMouseEnter={() => this.handleToolTipVisible('productNumVisible', true)}
                          onMouseLeave={() => this.handleToolTipVisible('productNumVisible', false)}
                        />
                      )}
                    </FormItem>
                  </Tooltip>
                </Col> */}
                  <Col span={8}>
                    <FormItem
                      label={intl
                        .get(`sodr.quotePurchaseRequisition.view.message.neededDateFrom`)
                        .d('需求日期从')}
                      {...formItemLayout}
                    >
                      {getFieldDecorator('neededDateFrom')(
                        <DatePicker
                          format={getDateFormat()}
                          placeholder={null}
                          disabledDate={(currentDate) =>
                            getFieldValue('neededDateTo') &&
                            moment(getFieldValue('neededDateTo')).isBefore(currentDate, 'day')
                          }
                        />
                      )}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem
                      label={intl
                        .get(`sodr.quotePurchaseRequisition.view.message.neededDateTo`)
                        .d('需求日期至')}
                      {...formItemLayout}
                    >
                      {getFieldDecorator('neededDateTo')(
                        <DatePicker
                          format={getDateFormat()}
                          placeholder={null}
                          disabledDate={(currentDate) =>
                            getFieldValue('neededDateFrom') &&
                            moment(getFieldValue('neededDateFrom')).isAfter(currentDate, 'day')
                          }
                        />
                      )}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem
                      label={intl
                        .get(`sodr.quotePurchaseRequisition.view.message.urgentFlag`)
                        .d('是否加急')}
                      {...formItemLayout}
                    >
                      {getFieldDecorator('urgentFlag')(
                        <Select allowClear>
                          {flag.map((n) => (
                            <Option key={n.value} value={n.value}>
                              {n.meaning}
                            </Option>
                          ))}
                        </Select>
                      )}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem
                      label={intl
                        .get(`sodr.quotePurchaseRequisition.view.message.executedByName`)
                        .d('需求执行人')}
                      {...formItemLayout}
                    >
                      {getFieldDecorator('executedByName')(
                        <Lov
                          code="SSLM.KPI_USER"
                          onChange={(lovValue, lovRecord) =>
                            this.handleLovChange(lovValue, lovRecord)
                          }
                          queryParams={{ tenantId }}
                          textField="loginName"
                        />
                      )}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem
                      label={intl
                        .get(`sodr.quotePurchaseRequisition.view.message.invOrganizationIds`)
                        .d('库存组织')}
                      {...formItemLayout}
                    >
                      {getFieldDecorator('invOrganizationIds')(
                        <LovModal
                          defaultWidth={600}
                          code="HPFM.INV_ORG"
                          queryParams={{ tenantId, enabledFlag: 1 }}
                          textField="organizationName"
                        />
                      )}
                    </FormItem>
                  </Col>
                </Row>
              </Col>
              <Col span={6} className="search-btn-more">
                <FormItem>
                  <Button onClick={this.toggleForm}>
                    {expandForm
                      ? intl.get('hzero.common.button.collected').d('收起查询')
                      : intl.get(`hzero.common.button.viewMore`).d('更多查询')}
                  </Button>
                  <Button data-code="reset" onClick={this.handleReset}>
                    {intl.get('hzero.common.button.reset').d('重置')}
                  </Button>
                  <Button
                    data-code="search"
                    type="primary"
                    htmlType="submit"
                    onClick={() => this.handleSearch({}, 1)}
                  >
                    {intl.get('hzero.common.button.search').d('查询')}
                  </Button>
                </FormItem>
              </Col>
            </Row>
          </Form>
        )}

        {customizeTable(
          {
            code: 'SODR.PURCHASE_REQUISITION_LIST.LINE',
          },
          <EditTable
            bordered
            loading={loading || fetchSettingsLoading}
            columns={columns}
            scroll={{ x: scrollX, y: 'calc(100vh - 390px)' }}
            dataSource={dataSource}
            pagination={{ ...pagination, showQuickJumper: true }}
            rowSelection={rowSelection}
            onChange={(page, _, sorter) => this.handleSearch(page, false, sorter)}
            rowKey="prLineId"
            className={styles.rowSelectionAlign}
          />
        )}
        {priceModalVisible && <PriceModle {...priceModalProps} />}
      </Fragment>
    );
  }
}
