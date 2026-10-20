/**
 * LineCreation - 按行引用采购申请 ERP SRM
 * @date: 2020-03-19
 * @author: chao.li03 <chao.li03@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import { withRouter } from 'react-router-dom';
import { Bind, Debounce } from 'lodash-decorators';
import { isArray, isEmpty, isNumber, sum, isNil } from 'lodash';
import {
  Form,
  Input,
  Button,
  InputNumber,
  Tooltip,
  DatePicker,
  Checkbox,
  Modal,
  Icon,
  // Select,
} from 'hzero-ui';
import moment from 'moment';
import { math } from 'choerodon-ui/dataset';
import BigNumber from 'bignumber.js';

import Lov from 'components/Lov';
import EditTable from 'components/EditTable';
import UploadModal from 'components/Upload';
import intl from 'utils/intl';
import {
  getDateFormat,
  getCurrentUserId,
  getCurrentOrganizationId,
  getUserOrganizationId,
} from 'utils/utils';
// import { numberRender } from 'utils/renderer';
// import notification from 'utils/notification';
import { NOT_CHINA_PHONE, PHONE } from 'utils/regExp';
import { amountCalculation } from 'srm-front-boot/lib/utils/utils';

import {
  formatAumont,
  parseAumont,
  redirectToOther,
  formatNumber,
  getDynamicLabel,
  conversionUpdateForH0,
  getSecondaryUomFormItem,
  conversionUpdateUomIdForH0,
} from '@/routes/components/utils';
import CustomSpecModal from '@/routes/QuotePurchaseRequisition/components/CustomSpecModal';
import { TooltipInput, TooltipLov } from '@/routes/components/TooltipFormItem';
import { BUCKET_NAME, MAX_QUAN_NUMBER } from '@/routes/components/utils/constant';
import PhoneRender from '../../components/PhoneRender';
import ItemInfo from '../CatDetail/ItemInfo';
import styles from './Header.less';
import BatchEditModal from '../../components/BatchEditModal';

const FormItem = Form.Item;
// const { Option } = Select;
const { TextArea } = Input;

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

// @Form.create({ fieldNameProp: null })
@withRouter
@connect(({ loading, quotePurchaseRequisition }) => ({
  priceListloading: loading.effects['quotePurchaseRequisition/priceList'],
  fetchSettingsLoading: loading.effects['quotePurchaseRequisition/fetchSettings'],
  updateStateLoading: loading.effects['quotePurchaseRequisition/updateState'],
  fetchNewPriceLibDataLoading: loading.effects['quotePurchaseRequisition/fetchNewPriceLibData'],
  quotePurchaseRequisition,
}))
export default class PurchaseLineInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      invInventoryVisible: new Map(),
      invLocationVisible: new Map(),
      userId: getCurrentUserId(),
      tenantId: getCurrentOrganizationId(),
      organizationId: getUserOrganizationId(),
      // selectOptionKey: 'needByDate', // 批量维护选中字段
      customVisable: false,
      customData: [],
      batchModalVisible: false,
      calcLoading: false,
    };
    props.onRef(this);
  }

  /**
   * componentDidMount 生命周期函数
   * render后请求页面数据
   */
  componentDidMount() {
    const {
      form: { setFieldsValue },
    } = this.props;
    setFieldsValue({ invInventoryId: undefined });
    setFieldsValue({ invLocationId: undefined });
  }

  @Bind()
  calculateDoubleUom(payload) {
    const { dispatch } = this.props;
    return dispatch({
      type: 'quotePurchaseRequisition/calculateDoubleUom',
      payload,
    });
  }

  /**
   * 改变账户分配类别进行必输校验
   */
  @Bind()
  handleAssignTypeChange(val, dataList, record) {
    const { requiredFieldNames = [], accountAssignTypeId, accountAssignTypeCode } = dataList;
    const {
      $form: { setFieldsValue, validateFields, getFieldValue },
    } = record;
    // 获取上次必填列表
    const oldRequiredFieldList = getFieldValue('requiredFieldNames') || [];
    setFieldsValue({ requiredFieldNames, accountAssignTypeId, accountAssignTypeCode });
    this.setState({}, () => {
      validateFields([...oldRequiredFieldList], { force: true });
    });
  }

  /**
   * 改变对应Lov提示文字显隐
   * @param {String} field 字段
   * @param {String} value 值
   */
  @Bind()
  handleInventoryVisible(poLineId, value) {
    this.setState((prevState) => ({
      invInventoryVisible: prevState.invInventoryVisible.set(poLineId, !!value),
    }));
  }

  /**
   * 改变对应Lov提示文字显隐
   * @param {String} field 字段
   * @param {String} value 值
   */
  @Bind()
  handleLocationVisible(poLineId, value) {
    this.setState((prevState) => ({
      invLocationVisible: prevState.invLocationVisible.set(poLineId, !!value),
    }));
  }

  /**
   * 改变协议编号
   * @param {String} field 字段
   * @param {String} value 值
   */
  @Bind()
  handleContractNum(value, list, record) {
    const { onChangeListData, dataSource } = this.props;
    const {
      holdPcHeaderId, // 占用采购协议头id
      holdPcLineId, // 占用采购协议行id
      holdPcNum, // 占用采购协议号
      holdPcLineNum, // 占用采购协议行号
      canHoldPcQuantity, // 协议行可占用数量
      contractNum, // 协议行号+编号
    } = list;
    // 判断是否为目录化商城||电商商城
    const listCommonDataSource = dataSource.map((item) => {
      if (item.poLineId === record.poLineId) {
        return {
          ...item,
          holdPcHeaderId, // 占用采购协议头id
          holdPcLineId, // 占用采购协议行id
          holdPcNum, // 占用采购协议号
          holdPcLineNum, // 占用采购协议行号
          canHoldPcQuantity, // 协议行可占用数量
          contractNum,
        };
      } else {
        return item;
      }
    });
    onChangeListData(listCommonDataSource);
  }

  /**
   * 物料改变回调
   * @param {String} value
   * @param {Object} lovRecord
   * @param {Object} record
   */
  @Bind()
  handleItemOnChange(value, dataList, record) {
    const {
      headerInfo,
      onChangeListData,
      dataSource,
      newPriceLibFlag, // 是否引用新价格库
      doubleUnitEnabled, // 双单位开启
      // priceShieldFlag, // 配置中心是否引用物料价格信息记录
    } = this.props;
    const { setFieldsValue } = record.$form;
    const sodrEnabled = doubleUnitEnabled !== 0;
    const {
      itemId,
      itemCode,
      itemName,
      categoryName,
      categoryId,
      uomName,
      uomId,
      // uomCode,
      uomCodeAndName,
      currencyCode,
      taxRate,
      taxId,
      unitPrice,
      enteredTaxIncludedPrice,
      ladderInquiryFlag,
      priceLibraryId,
      lastPurchasePrice,
      commonName,
      model,
      specifications,
      brand,
      chartCode,
      drawingVersion,
      pricePcNumAndLineNum,
      pricePcLineId,
      pricePcHeaderId,
    } = dataList;
    const secondaryUomObj = getSecondaryUomFormItem({
      record,
      sodrEnabled,
      lov: dataList,
    });
    const callback = async () => {
      if (sodrEnabled) {
        // 计算双单位报错
        setFieldsValue({ itemId });
        const result = await conversionUpdateForH0({
          record,
          doubleUnitEnabled,
          field: 'quantity',
          businessKeyField: 'prLineId',
          query: this.calculateDoubleUom,
        });
        if (!result) return false;
      }
    };
    if (newPriceLibFlag === 1) {
      const newDataSource = dataSource.map((item) => {
        if (item.poLineId === record.poLineId) {
          return {
            ...item,
            ...secondaryUomObj,
            priceLibraryId: null,
            benchmarkPriceType: headerInfo.benchmarkPriceType,
            commonName,
            model,
            specifications,
            brand,
          };
        }
        return item;
      });
      setFieldsValue({
        itemCode,
        itemName,
        categoryId,
        categoryName,
        uomId,
        uomName,
        uomCodeAndName,
        ...secondaryUomObj,
        currencyCode: record.currencyCode || undefined,
        taxId: undefined,
        taxRate: undefined,
        unitPrice: undefined,
        enteredTaxIncludedPrice: undefined,
        priceLibraryId: undefined,
        commonName,
        model,
        specifications,
        brand,
      });
      onChangeListData(newDataSource);
      callback();
    } else {
      const currencyCodeJson = currencyCode ? { currencyCode } : null;
      const listCommonDataSource = dataSource.map((item) => {
        if (item.poLineId) {
          if (item.poLineId === record.poLineId) {
            return {
              ...item,
              itemCode,
              // itemId,
              itemName,
              uomName,
              uomId,
              ...secondaryUomObj,
              categoryId,
              categoryName,
              ...currencyCodeJson,
              taxRate,
              taxId,
              priceTaxId: taxId,
              unitPrice,
              enteredTaxIncludedPrice,
              ladderInquiryFlag,
              priceLibraryId,
              lastPurchasePrice,
              commonName,
              model,
              specifications,
              brand,
              chartCode,
              holdPcHeaderId: pricePcHeaderId, // 占用采购协议头id
              holdPcLineId: pricePcLineId, // 占用采购协议行id
              holdPcNum: null, // 占用采购协议号
              holdPcLineNum: null, // 占用采购协议行号
              canHoldPcQuantity: null, // 协议行可占用数量
              contractNum: pricePcNumAndLineNum, // 协议行号+编号
              chartVersion: drawingVersion,
              priceContractFlag: pricePcLineId && pricePcHeaderId ? 1 : 0,
            };
          }
          return item;
        } else {
          return item;
        }
      });
      onChangeListData(listCommonDataSource);
      setFieldsValue({
        itemName,
        itemCode,
        priceLibraryId,
        categoryId,
        categoryName,
        taxId,
        taxRate,
        priceTaxId: taxId || 0,
        ...currencyCodeJson,
        uomId,
        uomName,
        uomCodeAndName,
        ...secondaryUomObj,
        enteredTaxIncludedPrice,
        contractNum: pricePcNumAndLineNum,
        drawingVersion,
        chartVersion: drawingVersion,
      });
      callback();
    }
    setFieldsValue({
      unitPriceBatch: value ? dataList.priceBatchQuantity : null,
    });
  }

  @Bind()
  calcLoading(calcLoading) {
    this.setState({ calcLoading });
  }

  /**
   * 物料改变回调
   * @param {String} value
   * @param {Object} lovRecord
   * @param {Object} record
   */
  @Bind()
  itemOnChange(value, dataList, record) {
    const {
      onChangeListData,
      dataSource,
      // priceShieldFlag, // 配置中心是否引用物料价格信息记录
    } = this.props;
    const { setFieldsValue } = record.$form;
    const {
      itemId,
      itemCode,
      itemName,
      categoryName,
      categoryId,
      uomName,
      uomId,
      currencyCode,
      taxRate,
      taxId,
      commonName,
      model,
      specifications,
      uomCodeAndName,
    } = dataList;
    const currencyCodeJson = currencyCode ? { currencyCode } : null;
    const listCommonDataSource = dataSource.map((item) => {
      if (item.poLineId) {
        if (item.poLineId === record.poLineId) {
          return {
            ...item,
            itemId,
            itemCode,
            itemName,
            uomName,
            uomId,
            categoryId,
            categoryName,
            ...currencyCodeJson,
            taxRate,
            taxId,
            commonName,
            model,
            specifications,
          };
        }
        return item;
      } else if (item.poLineId) {
        if (item.poLineId === record.poLineId) {
          return {
            ...item,
            itemId,
            itemCode,
            itemName,
            categoryName,
            categoryId,
            uomName,
            uomId,
            ...currencyCodeJson,
            taxRate,
            taxId,
            commonName,
            model,
            specifications,
          };
        }
        return item;
      } else {
        return item;
      }
    });
    onChangeListData(listCommonDataSource);
    setFieldsValue({
      itemName,
      itemCode,
      categoryId,
      categoryName,
      taxId,
      taxRate,
      ...currencyCodeJson,
      uomId,
      uomName,
      uomCodeAndName,
      // enteredTaxIncludedPrice,
    });
  }

  /**
   * 送达方LOV修改回调
   * @param {String} value
   * @param {Object} record
   */
  @Bind()
  handleThirdPartyOnChange(value, lovRecord, record) {
    const { onChangeListData, dataSource } = this.props;
    const { shipToThirdPartyContact } = lovRecord;
    const listCommonDataSource = dataSource.map((item) => {
      if (item.poLineId === record.poLineId) {
        return {
          ...item,
          shipToThirdPartyContact,
        };
      }
      return item;
    });
    onChangeListData(listCommonDataSource);
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
      if (item.poLineId === record.poLineId) {
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
   * 分包供应商改变回调
   * @param {*} value
   * @param {*} lovRecord
   * @param {*} record
   */
  @Bind()
  handleSubSupplierOnchange(value, lovRecord, record) {
    const {
      supplierId,
      supplierName,
      supplierNum,
      supplierCompanyId,
      supplierCompanyNum,
      supplierCompanyName,
      supplierTenantId,
    } = lovRecord;
    const { onChangeListData, dataSource } = this.props;
    const listDataSource = dataSource.map((item) => {
      if (item.poLineId === record.poLineId) {
        return {
          ...item,
          subSupplierId: supplierCompanyId,
          subSupplierCode: supplierCompanyNum,
          subSupplierName: supplierCompanyName,
          subErpSupplierId: supplierId,
          subErpSupplierCode: supplierNum,
          subErpSupplierName: supplierName,
          subSupplierTenantId: supplierTenantId,
        };
      }
      return item;
    });
    onChangeListData(listDataSource);
  }

  /**
   * 总账科目改变回调
   * @param {String} value
   * @param {Object} lovRecord
   * @param {Object} record
   */
  @Bind()
  handleLedgerAccount(value, lovRecord, record) {
    const { accountSubjectNum, accountSubjectName, accountSubjectId } = lovRecord;
    const {
      $form: { setFieldsValue },
    } = record;
    setFieldsValue({ accountSubjectId, accountSubjectName });
    const { onChangeListData, dataSource } = this.props;
    const listDataSource = dataSource.map((item) => {
      if (item.poLineId === record.poLineId) {
        return {
          ...item,
          accountSubjectNum,
          accountSubjectName,
          accountSubjectId,
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
    const { wbsCode = '', wbsName = '' } = lovRecord;
    const {
      $form: { setFieldsValue },
    } = record;
    setFieldsValue({ wbsCode: wbsCode || '', wbs: wbsName });
    const { onChangeListData, dataSource } = this.props;
    const listDataSource = dataSource.map((item) => {
      if (item.poLineId === record.poLineId) {
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

  /**
   * 收货组织级联改变回调函数
   * @param {*} value
   * @param {*} field
   * @param {*} record - 表格行信息
   */
  @Bind()
  handleOriginationLovChange(value, field, record, dataList) {
    const {
      form: { setFieldsValue, resetFields },
      dataSource,
      selectedListRows = [],
    } = this.props;
    const { setFieldsValue: recordSetFieldsValue } = record.$form || {};
    const { receiveToleranceQuantity, receiveToleranceQuantityType } = dataList || {};
    recordSetFieldsValue({
      receiveToleranceQuantity,
      receiveToleranceQuantityType,
    });
    const { [field]: oldValue } = dataSource;
    if (oldValue !== value) {
      setFieldsValue({ invInventoryId: undefined });
      setFieldsValue({ invLocationId: undefined });
    }
    if (
      (isEmpty(selectedListRows) && value !== dataSource[0]?.invOrganizationId) ||
      value !==
        dataSource.filter((i) => i.poLineId === selectedListRows[0]?.poLineId)[0]?.invOrganizationId
    ) {
      resetFields('invInventoryId');
    }
    if (recordSetFieldsValue) {
      recordSetFieldsValue({
        tmpOrganizationId: value,
        invInventoryId: undefined,
        invLocationId: undefined,
      });
    }
    record.$form.resetFields('invInventoryId');
  }

  /**
   * 收货库房级联改变回调函数
   * @param {*} value
   * @param {*} field
   */
  @Bind()
  handleInvInventoryLovChange(value, field, record) {
    const {
      form: { setFieldsValue },
      dataSource,
    } = this.props;
    const { [field]: oldValue } = dataSource;
    const fieldsValue =
      field === 'invOrganizationId' ? { invInventoryId: undefined } : { invLocationId: undefined };
    if (oldValue !== value) {
      setFieldsValue(fieldsValue);
    }
    // record.$form.setFieldsValue({ invLocationId: '' });
    record.$form.resetFields('invLocationId');
    // record.$form.setFieldsValue('invInventoryId');
  }

  /**
   * 批量维护
   */
  // @Bind()
  // handleMaintain() {
  //   const {
  //     form: { getFieldsValue },
  //     dataSource,
  //     onChangeListData,
  //     selectedListRows = [],
  //   } = this.props;
  //   const { selectOptionKey, selectOptionValues } = this.state;
  //   const fieldsValue = getFieldsValue();
  //   const key = selectedListRows.map((n) => n.poLineId);
  //   const { needByDate, taxId, invInventoryId } = fieldsValue;
  //   const flagValue =
  //     selectOptionKey === 'needByDate'
  //       ? needByDate
  //       : selectOptionKey === 'taxId'
  //       ? taxId
  //       : invInventoryId;
  //   let newDataSource;
  //   if (flagValue) {
  //     if (selectOptionKey === 'needByDate') {
  //       newDataSource = dataSource.map((item) => {
  //         const { invOrganizationName = item.invOrganizationName } = this.state;
  //         if (!isEmpty(selectedListRows) && !key.includes(item.poLineId)) {
  //           return item;
  //         } else {
  //           item.$form.setFieldsValue({ needByDate });
  //           return {
  //             ...item,
  //             invOrganizationName,
  //           };
  //         }
  //       });
  //     } else if (selectOptionKey === 'taxId') {
  //       newDataSource = dataSource.map((item) => {
  //         const priceFlag =
  //           item.$form.getFieldValue('priceLibraryId') &&
  //           item.$form.getFieldValue('taxRate') &&
  //           !math.isZero(item.$form.getFieldValue('taxRate')) &&
  //           item.$form.getFieldValue('priceTaxId');
  //         if ((isEmpty(selectedListRows) || key.includes(item.poLineId)) && !priceFlag) {
  //           item.$form.setFieldsValue({
  //             taxId,
  //             taxRate: selectOptionValues.taxRate,
  //           });
  //           return {
  //             ...item,
  //             ...selectOptionValues,
  //           };
  //         } else {
  //           return {
  //             ...item,
  //           };
  //         }
  //       });
  //     } else if (selectOptionKey === 'invInventoryId') {
  //       const selectArr = selectedListRows.map((i) => i.$form.getFieldValue('invOrganizationId'));
  //       const dataSourceArr = dataSource.map((i) => i.$form.getFieldValue('invOrganizationId'));
  //       if (
  //         (isEmpty(selectedListRows) && [...new Set(dataSourceArr)].length > 1) ||
  //         [...new Set(selectArr)].length > 1
  //       ) {
  //         notification.error({
  //           message: intl
  //             .get(`sodr.quotePurchase.model.quotePurchase.invErrorMsg`)
  //             .d('库存组织不一致，请检查'),
  //         });
  //         return;
  //       }
  //       newDataSource = dataSource.map((i) => {
  //         if (isEmpty(selectedListRows) || key.includes(i.poLineId)) {
  //           i.$form.setFieldsValue({
  //             invInventoryId: selectOptionValues.inventoryId,
  //             inventoryName: selectOptionValues.inventoryName,
  //           });
  //           return { ...i, ...selectOptionValues, invInventoryId: selectOptionValues.inventoryId };
  //         } else {
  //           return i;
  //         }
  //       });
  //     }
  //     onChangeListData(newDataSource);
  //   }
  // }

  /**
   * 表面处理/是否免费改变回调函数
   * @param {Object} e
   * @param {Object} record
   */
  @Bind()
  handleChangeCheck(e, record, val) {
    const { onChangeListData, dataSource } = this.props;
    let listCommonDataSource = [];
    listCommonDataSource = dataSource.map((item) => {
      if (item.poLineId === record.poLineId) {
        return {
          ...item,
          [val]: e.target.checked ? 1 : 0,
        };
      }
      return item;
    });
    onChangeListData(listCommonDataSource);
  }

  /**
   * 退货标示改变回调函数
   * @param {Object} e
   * @param {Object} record
   */
  @Bind()
  handleChangeReturn(e, record) {
    const { onChangeListData, dataSource } = this.props;
    let listCommonDataSource = [];
    listCommonDataSource = dataSource.map((item) => {
      if (item.poLineId === record.poLineId) {
        return {
          ...item,
          returnedFlag: e.target.checked ? 1 : 0,
        };
      }
      return item;
    });
    onChangeListData(listCommonDataSource);
  }

  @Bind()
  handlePrice(record) {
    const { showPriceModal } = this.props;
    showPriceModal(record);
  }

  @Bind()
  @Debounce(800)
  handleSecondaryNumChange(value, record) {
    const { doubleUnitEnabled } = this.props;
    const itemCode = record.$form.getFieldValue('itemCode');
    if (!value) return;
    if (!(doubleUnitEnabled && itemCode)) {
      record.$form.setFieldsValue({ quantity: value });
    } else {
      conversionUpdateForH0({
        record,
        doubleUnitEnabled,
        fieldInfo: value,
        businessKeyField: 'poLineId',
        query: this.calculateDoubleUom,
      });
    }
  }

  @Bind()
  getColumns() {
    const {
      handTaxDate,
      headerInfo,
      supplierCompanyId,
      poSourcePlatform,
      tieredPricingFlag,
      ouId,
      companyId,
      conractFlag,
      handleTranslate,
      setting,
      checkContract,
      returnOrderFlag,
      afterOpenUploadModal,
      handleIncludedPriceFcous,
      newPriceLibFlag,
      priceUpdateList = [],
      changeBomVisibel = (e) => e,
      doubleUnitEnabled,
      amountCalcRule,
      enumMap: { internationalTelCode = [] },
    } = this.props;
    const { sourceBillTypeCode, unSaveEnable = 1 } = headerInfo;
    const {
      userId,
      tenantId,
      organizationId,
      invInventoryVisible,
      invLocationVisible,
    } = this.state;
    const sodrEnabled = doubleUnitEnabled !== 0;
    const isRequest = sourceBillTypeCode === 'PURCHASE_REQUEST'; // 引用采购申请
    const Modifiable = !(isRequest && [1, 2].includes(unSaveEnable));
    const columns = {
      base: [
        {
          title: intl.get(`sodr.quotePurchase.model.quotePurchase.displayLineNum`).d('行号'),
          dataIndex: 'displayLineNum',
          width: 80,
          render: (val, record) =>
            ['create', 'update'].includes(record._status) && Modifiable ? (
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
          width: 90,
          render: (val, record) =>
            ['create', 'update'].includes(record._status) && Modifiable ? (
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
          title: intl
            .get(`sodr.quotePurchaseRequisition.view.message.projectCategory`)
            .d('项目类别'),
          dataIndex: 'projectCategory',
          width: 200,
          render: (_, record) =>
            ['create', 'update'].includes(record._status) && Modifiable ? (
              <FormItem>
                {record.$form.getFieldDecorator('projectCategory', {
                  initialValue: record.projectCategory,
                })(
                  <Lov
                    code="SPUC.PR_LINE_PROJECT_CATEHORY"
                    textValue={record.projectCategoryMeaning}
                    lovOptions={{
                      valueField: 'value',
                      displayField: 'meaning',
                    }}
                  />
                )}
              </FormItem>
            ) : (
              record.projectCategoryMeaning
            ),
        },
        {
          title: intl.get(`sodr.quotePurchase.model.quotePurchase.organizationName`).d('收货组织'),
          dataIndex: 'invOrganizationId',
          width: 200,
          render: (val, record) =>
            ['create', 'update'].includes(record._status) && Modifiable ? (
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
                    onChange={(value, dataList) =>
                      this.handleOriginationLovChange(value, 'invOrganizationId', record, dataList)
                    }
                    code="SPUC.SMDM.INV_ORG"
                    textValue={record.invOrganizationName}
                    queryParams={{
                      enabledFlag: 1,
                      tenantId,
                      ouId,
                      itemId: record.$form.getFieldValue('itemId'),
                    }}
                  />
                )}
              </FormItem>
            ) : (
              val
            ),
        },
        {
          title: intl.get(`sodr.quotePurchase.model.quotePurchase.itemCode`).d('物料编码'),
          width: 150,
          dataIndex: 'itemId',
          render: (val, record) =>
            ['create', 'update'].includes(record._status) && Modifiable ? (
              <FormItem>
                {record.$form.getFieldDecorator('itemId', {
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`sodr.quotePurchase.model.quotePurchase.itemCode`)
                          .d('物料编码'),
                      }),
                    },
                  ],
                  initialValue: val,
                })(
                  <Lov
                    code="SPUC.ITEM_PRICE_CODE"
                    onChange={(value, dataList) => {
                      this.handleItemOnChange(value, dataList, record);
                    }}
                    originTenantId={getCurrentOrganizationId()}
                    lovOptions={{ valueField: 'itemId', displayField: 'itemCode' }}
                    textValue={record.$form.getFieldValue('itemCode') || record.itemCode}
                    queryParams={{
                      organizationId,
                      tenantId,
                      supplierCompanyId,
                      priceShieldFlag:
                        (record.returnedFlag !== 1 ||
                          record.$form.getFieldValue('returnedFlag') !== 1) &&
                        returnOrderFlag !== 1
                          ? tieredPricingFlag
                          : null,
                      companyId,
                      ouId,
                      invOrganizationId: record.$form.getFieldValue('invOrganizationId'),
                    }}
                    disabled={record.prLineItemId && isRequest}
                  />
                )}
                {record.$form.getFieldDecorator('itemCode', { initialValue: record.itemCode })}
              </FormItem>
            ) : (
              record.itemCode
            ),
        },
        {
          title: intl.get(`sodr.quotePurchase.model.quotePurchase.itemName`).d('物料名称'),
          dataIndex: 'itemName',
          width: 120,
          render: (val, record) =>
            ['create', 'update'].includes(record._status) && Modifiable ? (
              <FormItem>
                {record.$form.getFieldDecorator('itemName', {
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
                  initialValue: record.itemName,
                })(
                  <TooltipInput
                    tipValue={record.$form.getFieldValue('itemName')}
                    disabled={
                      record.priceLibraryId ||
                      record.$form.getFieldValue('priceLibraryId') ||
                      (record.$form.getFieldValue('itemId') && isRequest)
                    }
                  />
                )}
              </FormItem>
            ) : (
              <Tooltip title={val}>{val}</Tooltip>
            ),
        },
        {
          title: intl.get(`sodr.common.model.common.categoryName`).d('物料分类'),
          width: 130,
          dataIndex: 'categoryId',
          render: (val, record) => {
            return ['create', 'update'].includes(record._status) && Modifiable ? (
              <FormItem>
                {record.$form.getFieldDecorator('categoryId', {
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`sodr.common.model.common.categoryName`).d('物料分类'),
                      }),
                    },
                  ],
                  initialValue: val,
                })(
                  <TooltipLov
                    tipValue={record.$form.getFieldValue('categoryName')}
                    code="SMDM.CATEGORY.LEVEL_CONTROL_TREE"
                    textField="categoryName"
                    lovOptions={{ valueField: 'categoryId', displayField: 'categoryName' }}
                    queryParams={{
                      tenantId,
                      enabledFlag: 1,
                      hzeroUIFlag: 1,
                      itemId: record.$form.getFieldValue('itemId'),
                      businessObjectCode: 'SRM_C_SRM_SODR_PO_HEADER',
                    }}
                    tableDsProps={{
                      record: {
                        dynamicProps: {
                          selectable: (_record) => _record.get('isCheck') !== false,
                        },
                      },
                    }}
                  />
                )}
                {record.$form.getFieldDecorator('categoryName', {
                  initialValue: record.categoryName,
                })}
              </FormItem>
            ) : (
              <Tooltip title={record.categoryName}>{record.categoryName}</Tooltip>
            );
          },
        },
        {
          title: intl.get(`sodr.common.model.common.commonName`).d('通用名'),
          dataIndex: 'commonName',
          width: 120,
        },
        {
          title: intl.get(`sprm.purchaseReqCreation.model.common.skuTypeMark`).d('定制品标识'),
          width: 150,
          dataIndex: 'skuType',
        },
        {
          title: intl.get(`sprm.purchaseReqCreation.model.common.customUomName`).d('定制单位'),
          width: 150,
          dataIndex: 'customUomName',
        },
        {
          title: intl.get(`sprm.purchaseReqCreation.model.common.customQuantity`).d('定制数量'),
          width: 150,
          dataIndex: 'customQuantity',
        },
        {
          title: intl.get(`sprm.purchaseReqCreation.model.common.packageQuantity`).d('份数'),
          width: 150,
          dataIndex: 'packageQuantity',
        },
        {
          title: intl.get(`sprm.purchaseReqCreation.model.common.customSpecsJson`).d('定制品属性'),
          width: 150,
          dataIndex: 'customSpecsJson',
          render: (val) => (
            <a
              onClick={() => {
                this.setState({
                  customData: val ? JSON.parse(val) : [],
                  customVisable: true,
                });
              }}
            >
              {intl.get(`sprm.purchaseReqCreation.model.common.customSpecsJson`).d('定制品属性')}
            </a>
          ),
        },
        {
          title: intl.get(`sprm.purchaseReqCreation.model.common.customSpecs`).d('定制品属性'),
          width: 150,
          dataIndex: 'customSpecs',
          render: (val) => (
            <TextArea disabled value={val} style={{ resize: 'vertical' }} rows={1} />
          ),
        },
      ],
      mall: [
        {
          title: intl.get(`sodr.quotePurchase.model.quotePurchase.productNum`).d('商品编码'),
          dataIndex: 'productNum',
          width: 120,
          render: (val, record) =>
            ['create', 'update'].includes(record._status) ? (
              <FormItem>
                {record.$form.getFieldDecorator(`productNum`, {
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`sodr.quotePurchase.model.quotePurchase.productNum`)
                          .d('商品编码'),
                      }),
                    },
                    {
                      max: 30,
                      message: intl.get('hzero.common.validation.max', {
                        max: 30,
                      }),
                    },
                  ],
                  initialValue: record.productNum,
                })(<Input disabled typeCase="upper" inputChinese={false} />)}
              </FormItem>
            ) : (
              val
            ),
        },
        {
          title: intl.get(`sodr.quotePurchase.model.quotePurchase.productName`).d('商品名称'),
          width: 120,
          dataIndex: 'productName',
          render: (val, record) =>
            ['create', 'update'].includes(record._status) ? (
              <FormItem>
                {record.$form.getFieldDecorator(`productName`, {
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`sodr.quotePurchase.model.quotePurchase.productName`)
                          .d('商品名称'),
                      }),
                    },
                    {
                      max: 30,
                      message: intl.get('hzero.common.validation.max', {
                        max: 30,
                      }),
                    },
                  ],
                  initialValue: record.productName,
                })(<Input typeCase="upper" inputChinese={false} />)}
              </FormItem>
            ) : (
              val
            ),
        },
        {
          title: intl.get(`sodr.quotePurchase.model.quotePurchase.catalogName`).d('商品目录'),
          width: 120,
          dataIndex: 'catalogName',
          render: (val, record) =>
            ['create', 'update'].includes(record._status) ? (
              <FormItem>
                {record.$form.getFieldDecorator(`catalogName`, {
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`sodr.quotePurchase.model.quotePurchase.catalogName`)
                          .d('商品目录'),
                      }),
                    },
                    {
                      max: 30,
                      message: intl.get('hzero.common.validation.max', {
                        max: 30,
                      }),
                    },
                  ],
                  initialValue: record.catalogName,
                })(<Input disabled typeCase="upper" inputChinese={false} />)}
              </FormItem>
            ) : (
              val
            ),
        },
      ],
      other: [
        sodrEnabled && {
          title: intl.get(`sodr.quotePurchase.model.quotePurchase.quantity`).d('数量'),
          dataIndex: 'secondaryQuantity',
          width: 120,
          render: (val, record) =>
            ['create', 'update'].includes(record._status) && Modifiable ? (
              <FormItem>
                {record.$form.getFieldDecorator(`secondaryQuantity`, {
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`sodr.quotePurchase.model.quotePurchase.quantity`).d('数量'),
                      }),
                    },
                  ],
                  initialValue: record.secondaryQuantity,
                })(
                  <InputNumber
                    min={0}
                    max={MAX_QUAN_NUMBER}
                    allowThousandth="true"
                    style={{ width: '100%' }}
                    parser={(value) =>
                      parseAumont(value, record.$form.getFieldValue('secondaryUomPrecision'))
                    }
                    disabled={!sodrEnabled}
                    onChange={(value) => this.handleSecondaryNumChange(value, record)}
                  />
                )}
              </FormItem>
            ) : (
              formatAumont(val)
            ),
        },
        sodrEnabled && {
          title: intl.get(`sodr.quotePurchase.model.quotePurchase.uomName`).d('单位'),
          width: 140,
          dataIndex: 'secondaryUomId',
          render: (val, record) => {
            return ['create', 'update'].includes(record._status) && Modifiable ? (
              <FormItem>
                {record.$form.getFieldDecorator('secondaryUomId', {
                  rules: [
                    {
                      // required: !record.priceLibraryId,  // 不知谁使用价格库判断必输，改回！
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`sodr.quotePurchase.model.quotePurchase.uomName`).d('单位'),
                      }),
                    },
                  ],
                  initialValue: record.secondaryUomId,
                })(
                  <Lov
                    code="SMDM_ITEM_ORG_UOM"
                    lovOptions={{ valueField: 'uomId', displayField: 'uomCodeAndName' }}
                    textField="secondaryUomCodeAndName"
                    queryParams={{
                      itemId: record.$form.getFieldValue('itemId'),
                      primaryUomId: record.$form.getFieldValue('uomId'),
                    }}
                    disabled={!sodrEnabled}
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
                {record.$form.getFieldDecorator('secondaryUomCodeAndName', {
                  initialValue: record.secondaryUomCodeAndName,
                })}
                {record.$form.getFieldDecorator('secondaryUomPrecision', {
                  initialValue: record.secondaryUomPrecision,
                })}
              </FormItem>
            ) : (
              record.secondaryUomCodeAndName
            );
          },
        },
        {
          title: getDynamicLabel(sodrEnabled, 'quantity'),
          width: 120,
          dataIndex: 'quantity',
          render: (val, record) =>
            ['create', 'update'].includes(record._status) && Modifiable ? (
              <FormItem>
                {record.$form.getFieldDecorator(`quantity`, {
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`sodr.quotePurchase.model.quotePurchase.quantity`).d('数量'),
                      }),
                    },
                  ],
                  initialValue: record.quantity,
                })(
                  <InputNumber
                    min={0}
                    disabled={sodrEnabled}
                    max={MAX_QUAN_NUMBER}
                    precision={record.$form.getFieldValue('uomPrecision')}
                    onChange={(value) => {
                      if (!sodrEnabled) {
                        record.$form.setFieldsValue({ secondaryQuantity: value });
                      }
                    }}
                    allowThousandth="true"
                  />
                )}
                {!sodrEnabled &&
                  record.$form.getFieldDecorator('secondaryQuantity', {
                    initialValue: record.secondaryQuantity,
                  })}
              </FormItem>
            ) : (
              val
            ),
        },
        {
          title: getDynamicLabel(sodrEnabled, 'uom'),
          width: 140,
          dataIndex: 'uomId',
          render: (val, record) => {
            return ['create', 'update'].includes(record._status) && Modifiable ? (
              <FormItem>
                {record.$form.getFieldDecorator('uomId', {
                  rules: [
                    {
                      // required: !record.priceLibraryId,
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`sodr.quotePurchase.model.quotePurchase.uomName`).d('单位'),
                      }),
                    },
                  ],
                  initialValue: record.uomId,
                })(
                  <Lov
                    code="SMDM.UOM"
                    lovOptions={{ valueField: 'uomId', displayField: 'uomCodeAndName' }}
                    textField="uomCodeAndName"
                    disabled={
                      sodrEnabled ||
                      (setting === '1' && record.$form.getFieldValue('itemId')) ||
                      (setting === '0' &&
                        record.$form.getFieldValue('priceLibraryId') &&
                        record.$form.getFieldValue('uomId'))
                    }
                    onChange={(_, { uomPrecision, uomId }) => {
                      record.$form.setFieldsValue({ uomPrecision });
                      if (!doubleUnitEnabled) {
                        record.$form.setFieldsValue({ secondaryUomId: uomId });
                      }
                    }}
                  />
                )}
                {record.$form.getFieldDecorator('uomName', { initialValue: record.uomName })}
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
                  record.$form.getFieldDecorator('secondaryUomId', {
                    initialValue: record.secondaryUomId,
                  })}
                {!sodrEnabled &&
                  record.$form.getFieldDecorator('secondaryUomName', {
                    initialValue: record.secondaryUomName,
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
            ) : (
              record.uomCodeAndName
            );
            //  (
            //   formatUom(record.uomCode, record.uomName)
            // );
          },
        },
        {
          title: intl.get(`sodr.quotePurchase.model.quotePurchase.currencyCode`).d('币种'),
          width: 120,
          dataIndex: 'currencyCode',
          render: (val, record) => {
            return ['create', 'update'].includes(record._status) && Modifiable ? (
              <FormItem>
                {record.$form.getFieldDecorator('currencyCode', {
                  rules: [
                    {
                      // required: !record.priceLibraryId,
                      // 价格库带出的币种为空导致无法提交
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`sodr.quotePurchase.model.quotePurchase.currencyCode`)
                          .d('币种'),
                      }),
                    },
                  ],
                  initialValue: val || record.headerCurrencyCode,
                })(
                  <Lov
                    code="SPRM.EXCHANGE_RATE.CURRENCY"
                    lovOptions={{ valueField: 'currencyCode', displayField: 'currencyCode' }}
                    textField="currencyCode"
                    textValue={
                      record.$form.getFieldValue('currencyCode') ||
                      record.currencyCode ||
                      record.headerCurrencyCode
                    }
                    disabled={
                      record.$form.getFieldValue('priceLibraryId') &&
                      record.$form.getFieldValue('currencyCode')
                    }
                    onChange={(_, { defaultPrecision }) => {
                      record.$form.setFieldsValue({ defaultPrecision });
                    }}
                  />
                )}
                {record.$form.getFieldDecorator('defaultPrecision', {
                  initialValue: isNil(record.defaultPrecision)
                    ? headerInfo.defaultPrecision
                    : record.defaultPrecision,
                })}
              </FormItem>
            ) : (
              record.currencyCode || record.headerCurrencyCode
            );
          },
        },
        {
          title: intl.get(`sodr.quotePurchase.model.quotePurchase.taxRate`).d('税率（%）'),
          width: 120,
          dataIndex: 'taxId',
          render: (val, record) => {
            return ['create', 'update'].includes(record._status) && Modifiable ? (
              <FormItem>
                {record.$form.getFieldDecorator('taxId', {
                  rules: [
                    {
                      required:
                        !record.priceLibraryId ||
                        poSourcePlatform === 'SRM' ||
                        poSourcePlatform === 'ERP' ||
                        poSourcePlatform === 'SHOP',
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
                    disabled={
                      // (record.priceLibraryId && record.taxRate && record.priceTaxId) || // 当税率从价格库带出且不为空
                      record.$form.getFieldValue('priceLibraryId') &&
                      record.$form.getFieldValue('taxRate') &&
                      !math.isZero(record.$form.getFieldValue('taxRate')) &&
                      record.$form.getFieldValue('priceTaxId')
                    }
                    onChange={(text, values) => {
                      // const value =
                      //   isNumber(getFieldValue('unitPrice')) &&
                      //   getFieldValue('unitPrice') * (1 + (values.taxRate || 0) / 100);
                      // const unitPrice =
                      //   isNumber(getFieldValue('enteredTaxIncludedPrice')) &&
                      //   getFieldValue('enteredTaxIncludedPrice') /
                      //     (1 + (values.taxRate || 0) / 100);
                      // const benchmarkPriceType =
                      //   newPriceLibFlag && record.benchmarkPriceType !== null
                      //     ? record.benchmarkPriceType
                      //     : headerInfo.benchmarkPriceType;
                      // if (benchmarkPriceType === 'NET_PRICE' && isNumber(value)) {
                      //   setFieldsValue({
                      //     enteredTaxIncludedPrice: value.toFixed(10),
                      //   });
                      // } else if (benchmarkPriceType !== 'NET_PRICE' && isNumber(unitPrice)) {
                      //   setFieldsValue({
                      //     unitPrice: unitPrice.toFixed(10),
                      //   });
                      // }
                      const { setFieldsValue, getFieldsValue } = record.$form;
                      const benchmarkPriceType =
                        newPriceLibFlag && record.benchmarkPriceType !== null
                          ? record.benchmarkPriceType
                          : headerInfo.benchmarkPriceType;
                      const { taxRate } = values;
                      const { quantity, unitPrice, enteredTaxIncludedPrice } = getFieldsValue();
                      const {
                        taxRateType,
                        financialPrecision,
                        defaultPrecision,
                        unitPriceBatch: each,
                        lineAmount: netAmount,
                        taxIncludedLineAmount: taxAmount,
                        unitPrice: netUnitPrice,
                        enteredTaxIncludedPrice: taxUnitPrice,
                      } = record;
                      const _taxUnitPrice =
                        math.isZero(enteredTaxIncludedPrice) || enteredTaxIncludedPrice
                          ? enteredTaxIncludedPrice
                          : netUnitPrice;
                      const _netUnitPrice =
                        math.isZero(unitPrice) || unitPrice ? unitPrice : taxUnitPrice;
                      const calculate = amountCalculation({
                        hasTax: benchmarkPriceType !== 'NET_PRICE',
                        hasMount: true,
                        each,
                        taxRate,
                        taxUnitPrice: _taxUnitPrice,
                        netUnitPrice: _netUnitPrice,
                        taxAmount,
                        netAmount,
                        quantity,
                        financialPrecision,
                        defaultPrecision,
                        caclRule: amountCalcRule,
                        taxRateType,
                      });
                      const { calcTaxUnitPrice, calcNetUnitPrice } = calculate;
                      const isNumberPro = (number) =>
                        isNumber(number || math.isBigNumber(number)) && !math.isNaN(number);
                      if (benchmarkPriceType !== 'NET_PRICE' && isNumberPro(calcNetUnitPrice)) {
                        setFieldsValue({
                          unitPrice: calcNetUnitPrice
                            ? math.toFixed(calcNetUnitPrice, 10)
                            : calcNetUnitPrice,
                        });
                      } else if (
                        benchmarkPriceType === 'NET_PRICE' &&
                        isNumberPro(calcTaxUnitPrice)
                      ) {
                        setFieldsValue({
                          enteredTaxIncludedPrice: calcTaxUnitPrice
                            ? math.toFixed(calcTaxUnitPrice, 10)
                            : calcTaxUnitPrice,
                        });
                      }
                      handTaxDate(text, values, record);
                    }}
                  />
                )}
                {record.$form.getFieldDecorator('taxRate', { initialValue: record.taxRate })}
                {record.$form.getFieldDecorator('priceTaxId', { initialValue: record.priceTaxId })}
                {record.$form.getFieldDecorator('priceLibraryId', {
                  initialValue: record.priceLibraryId,
                })}
              </FormItem>
            ) : (
              record.taxRate
            );
          },
        },
        {
          title: intl.get(`sodr.common.model.common.currentPurchasePrice`).d('最近一次采购价'),
          width: 120,
          align: 'right',
          dataIndex: 'lastPurchasePrice',
          render: (val) => formatNumber(val),
        },
      ],
      request: [
        {
          title: intl
            .get(`sodr.quotePurchase.model.quotePurchase.displayPrNum`)
            .d('采购申请号|行号'),
          width: 150,
          dataIndex: 'displayPrNumAndDisplayPrLineNum',
          render: (val, record) => <a onClick={() => redirectToOther('purchase', record)}>{val}</a>,
        },
        {
          title: intl.get(`sodr.quotePurchase.model.quotePurchase.purReqAppliedName`).d('申请人'),
          width: 120,
          dataIndex: 'prRequestedName',
          render: (_, record) =>
            ['create', 'update'].includes(record._status) && Modifiable ? (
              <FormItem>
                {record.$form.getFieldDecorator('purReqAppliedName', {
                  initialValue: record.purReqAppliedName,
                })(<Input disabled />)}
              </FormItem>
            ) : (
              record.purReqAppliedName
            ),
        },
      ],
      remark: [
        {
          title: intl.get(`sodr.quotePurchase.model.quotePurchase.accountType`).d('账户分配类别'),
          width: 150,
          dataIndex: 'accountAssignTypeId',
          render: (val, record) =>
            ['create', 'update'].includes(record._status) && Modifiable ? (
              <FormItem>
                {record.$form.getFieldDecorator('accountAssignTypeId', {
                  initialValue: val,
                  rules: [
                    {
                      required: (record.$form.getFieldValue('requiredFieldNames') || []).includes(
                        'accountAssignTypeId'
                      ),
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`sodr.quotePurchase.model.quotePurchase.accountType`)
                          .d('账户分配类别'),
                      }),
                    },
                  ],
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
                    onChange={(value, dataList) => {
                      this.handleAssignTypeChange(value, dataList, record);
                    }}
                  />
                )}
                {record.$form.getFieldDecorator('accountAssignTypeCode', {
                  initialValue: record.accountAssignTypeCode,
                })}
                {record.$form.getFieldDecorator('requiredFieldNames', {
                  initialValue: record.assignTypeRequiredFieldNames || [],
                })}
              </FormItem>
            ) : (
              record.accountAssignTypeCode
            ),
        },
        {
          title: intl.get(`hzero.common.remark`).d('备注'),
          dataIndex: 'remark',
          width: 160,
          render: (val, record) =>
            ['create', 'update'].includes(record._status) && Modifiable ? (
              <FormItem>
                {record.$form.getFieldDecorator(`remark`, {
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
                    {
                      max: 160,
                      message: intl.get('hzero.common.validation.max', {
                        max: 160,
                      }),
                    },
                  ],
                })(<TooltipInput tipValue={record.$form.getFieldValue('remark')} />)}
              </FormItem>
            ) : (
              <Tooltip title={val}>{val}</Tooltip>
            ),
        },
        {
          title: intl.get(`sodr.common.model.common.lineAttachmentUuid`).d('行附件'),
          dataIndex: 'attachmentUuid',
          width: 100,
          render: (value, record) =>
            ['create', 'update'].includes(record._status) && Modifiable ? (
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
      ],
      erpNormalPrice: [
        {
          title: intl.get(`sodr.common.model.common.unitPrice`).d('不含税单价'),
          width: 150,
          dataIndex: 'unitPrice',
          align: 'right',
          render: (val, record) => {
            if (['create', 'update'].includes(record._status) && Modifiable) {
              const benchmarkPriceType = record.benchmarkPriceType ?? headerInfo.benchmarkPriceType;
              return (
                <FormItem>
                  {record.$form.getFieldDecorator('unitPrice', {
                    initialValue: record.unitPrice,
                    rules: [
                      {
                        required:
                          record.$form.getFieldValue('priceLibraryId') &&
                          record.benchmarkPriceType !== null
                            ? record.benchmarkPriceType === 'NET_PRICE'
                            : headerInfo.benchmarkPriceType === 'NET_PRICE',
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`sodr.common.model.common.unitPrice`).d('不含税单价'),
                        }),
                      },
                    ],
                  })(
                    <InputNumber
                      min={0}
                      max={
                        record.benchmarkPriceType === 'NET_PRICE' &&
                        record.$form.getFieldValue('priceLibraryId') &&
                        headerInfo.modifyablePriceFlag === -1
                          ? !math.isZero(record.originUnitPrice) && record.originUnitPrice
                            ? record.originUnitPrice
                            : record.unitPrice
                          : MAX_QUAN_NUMBER
                      }
                      disabled={
                        benchmarkPriceType !== 'NET_PRICE' ||
                        (benchmarkPriceType === 'NET_PRICE' &&
                          headerInfo.modifyablePriceFlag === 0 &&
                          record.$form.getFieldValue('priceLibraryId'))
                      }
                      onFocus={() => handleIncludedPriceFcous(record)}
                      style={{ width: '100%' }}
                      parser={(value) =>
                        parseAumont(value, record.$form.getFieldValue('defaultPrecision'))
                      }
                    />
                  )}
                </FormItem>
              );
            } else {
              return formatAumont(val);
            }
          },
        },
        {
          title: intl.get(`sodr.common.model.common.taxedEnteredUnitPrice`).d('原币含税单价'),
          dataIndex: 'enteredTaxIncludedPrice',
          align: 'right',
          width: 140,
          render: (val, record) => {
            if (['create', 'update'].includes(record._status) && Modifiable) {
              const benchmarkPriceType = record.benchmarkPriceType ?? headerInfo.benchmarkPriceType;
              return (
                <FormItem>
                  {record.$form.getFieldDecorator('enteredTaxIncludedPrice', {
                    initialValue:
                      record.defaultPrecision && val && !math.isZero(val)
                        ? new BigNumber(math.toFixed(val, Number(record.defaultPrecision)))
                        : val,
                    rules: [
                      {
                        required:
                          record.$form.getFieldValue('priceLibraryId') &&
                          record.benchmarkPriceType !== null
                            ? record.benchmarkPriceType !== 'NET_PRICE'
                            : headerInfo.benchmarkPriceType !== 'NET_PRICE',
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get(`sodr.common.model.common.taxedEnteredUnitPrice`)
                            .d('原币含税单价'),
                        }),
                      },
                    ],
                  })(
                    <InputNumber
                      min={0}
                      max={
                        record.$form.getFieldValue('priceLibraryId') &&
                        record.benchmarkPriceType !== 'NET_PRICE' &&
                        headerInfo.modifyablePriceFlag === -1
                          ? !math.isZero(record.originUnitPrice) && record.originUnitPrice
                            ? record.originUnitPrice
                            : record.enteredTaxIncludedPrice
                          : MAX_QUAN_NUMBER
                      }
                      disabled={
                        benchmarkPriceType === 'NET_PRICE' ||
                        (benchmarkPriceType === 'TAX_INCLUDED_PRICE' &&
                          headerInfo.modifyablePriceFlag === 0 &&
                          record.$form.getFieldValue('priceLibraryId'))
                      }
                      onFocus={() => handleIncludedPriceFcous(record)}
                      style={{ width: '100%' }}
                      parser={(value) =>
                        parseAumont(value, record.$form.getFieldValue('defaultPrecision'))
                      }
                    />
                  )}
                  {priceUpdateList.includes(record.poLineId) && (
                    <div style={{ display: 'inline-block' }}>
                      <Tooltip
                        title={intl
                          .get(`sodr.quotePurchaseRequisition.view.message.quoteTheLatestPrice`)
                          .d(
                            '订单行价格与价格库返回的最新价格不一致，可点击右上角“引用最新价格按钮”获取最新价格'
                          )}
                      >
                        <Icon type="exclamation-circle" style={{ color: 'red', marginLeft: 4 }} />
                      </Tooltip>
                    </div>
                  )}
                </FormItem>
              );
            } else {
              return formatAumont(val);
            }
          },
        },
        {
          title: intl.get(`sodr.common.model.common.unitPriceBatch`).d('每'),
          dataIndex: 'unitPriceBatch',
          width: 140,
          render: (val, record) =>
            ['create', 'update'].includes(record._status) && Modifiable ? (
              <FormItem>
                {record.$form.getFieldDecorator('unitPriceBatch', {
                  rules: [
                    {
                      required: (record.$form.getFieldValue('requiredFieldNames') || []).includes(
                        'unitPriceBatch'
                      ),
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get('sodr.common.model.common.unitPriceBatch').d('每'),
                      }),
                    },
                    {
                      pattern: /^([1-9]\d*(\.\d*[1-9])?)|(0\.\d*[1-9])$/,
                      message: intl.get(`sodr.common.model.common.sumZero`).d('数值需大于零'),
                    },
                  ],
                  initialValue: record.unitPriceBatch,
                })(
                  <InputNumber
                    min={0}
                    max={MAX_QUAN_NUMBER}
                    disabled={record.priceLibraryId && record.currencyCode}
                    style={{ width: '100%' }}
                    // className={styles['number-input']}
                  />
                )}
              </FormItem>
            ) : (
              val
            ),
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
          title: intl
            .get(`sodr.common.model.common.domesticTaxIncludedLineAmount`)
            .d('本币含税金额'),
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
            ['create', 'update'].includes(record._status) && Modifiable ? (
              <FormItem>
                {record.$form.getFieldDecorator(`budgetAccountId`, {
                  initialValue: record.budgetAccountId,
                })(
                  <Lov
                    code="SMDM.BUDGET_ACCOUNT_ORDER"
                    textValue={record.budgetAccountName}
                    textField="budgetAccountName"
                    lovOptions={{
                      valueField: 'budgetAccountId',
                      displayField: 'budgetAccountName',
                    }}
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
      ],
      commonBase: [
        {
          title: intl.get('sodr.common.model.common.department').d('部门'),
          dataIndex: 'departmentId',
          width: 150,
          render: (val, record) =>
            ['create', 'update'].includes(record._status) && Modifiable ? (
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
          title: intl.get(`sodr.quotePurchase.model.quotePurchase.invInventoryName`).d('收货库房'),
          dataIndex: 'invInventoryId',
          width: 200,
          render: (val, record) =>
            ['create', 'update'].includes(record._status) && Modifiable ? (
              <FormItem>
                {record.$form.getFieldDecorator(`invInventoryId`, {
                  initialValue: record.invInventoryId,
                  rules: [
                    {
                      required: (record.$form.getFieldValue('requiredFieldNames') || []).includes(
                        'invInventoryId'
                      ),
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get('sodr.quotePurchase.model.quotePurchase.invInventoryName')
                          .d('收货库房'),
                      }),
                    },
                  ],
                })(
                  <Lov
                    onChange={(value) =>
                      this.handleInvInventoryLovChange(value, 'invInventoryId', record)
                    }
                    code="SODR.INVENTORY"
                    textValue={record.inventoryName}
                    disabled={!record.$form.getFieldValue('invOrganizationId')}
                    queryParams={{
                      enabledFlag: 1,
                      tenantId,
                      organizationId:
                        record.$form.getFieldValue('tmpOrganizationId') || record.tmpOrganizationId,
                    }}
                    onMouseEnter={() => this.handleInventoryVisible(record.poLineId, true)}
                    onMouseLeave={() => this.handleInventoryVisible(record.poLineId, false)}
                  />
                )}
                <Tooltip
                  visible={
                    invInventoryVisible.get(record.poLineId) &&
                    !record.$form.getFieldValue('invOrganizationId')
                  }
                  title={intl
                    .get(`sodr.quotePurchase.view.message.shouldChooseOrganization`)
                    .d('请先选择收货组织')}
                />
              </FormItem>
            ) : (
              record.inventoryName
            ),
        },
        {
          title: intl.get(`sodr.quotePurchase.model.quotePurchase.locationName`).d('收货库位'),
          dataIndex: 'invLocationName',
          width: 200,
          render: (val, record) =>
            ['create', 'update'].includes(record._status) && Modifiable ? (
              <FormItem>
                {record.$form.getFieldDecorator(`invLocationId`, {
                  initialValue: record.invLocationId,
                  rules: [
                    {
                      required: (record.$form.getFieldValue('requiredFieldNames') || []).includes(
                        'invLocationId'
                      ),
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get('sodr.quotePurchase.model.quotePurchase.locationName')
                          .d('收货库位'),
                      }),
                    },
                  ],
                })(
                  <Lov
                    code="SRPM.LOCATION_BY_ORG_INV"
                    textValue={record.locationName}
                    disabled={
                      !record.$form.getFieldValue('invInventoryId') ||
                      !record.$form.getFieldValue('invOrganizationId')
                    }
                    queryParams={{
                      enabledFlag: 1,
                      inventoryId: record.$form.getFieldValue('invInventoryId'),
                      tenantId,
                      // organizationId: tenantId,
                    }}
                    onMouseEnter={() => this.handleLocationVisible(record.poLineId, true)}
                    onMouseLeave={() => this.handleLocationVisible(record.poLineId, false)}
                  />
                )}
                <Tooltip
                  visible={
                    invLocationVisible.get(record.poLineId) &&
                    !record.$form.getFieldValue('invInventoryId')
                  }
                  title={intl
                    .get(`sodr.quotePurchase.view.message.shouldChooseInvInventory`)
                    .d('请先选择收货库房')}
                />
              </FormItem>
            ) : (
              val
            ),
        },
        {
          title: intl.get(`sodr.quotePurchase.model.quotePurchase.needByDate`).d('需求日期'),
          width: 150,
          dataIndex: 'needByDate',
          render: (val, record) =>
            ['create', 'update'].includes(record._status) && Modifiable ? (
              <FormItem>
                {record.$form.getFieldDecorator('needByDate', {
                  initialValue: record.needByDate ? moment(record.needByDate) : undefined,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get('sodr.quotePurchase.model.quotePurchase.needByDate')
                          .d('需求日期'),
                      }),
                    },
                  ],
                })(<DatePicker format={getDateFormat()} placeholder={null} />)}
              </FormItem>
            ) : val ? (
              moment(val).format(getDateFormat())
            ) : undefined,
        },
        {
          title: intl.get(`sodr.common.view.message.title.bom`).d('外协BOM'),
          width: 110,
          dataIndex: 'bom',
          render: (text, record) => (
            <a
              disabled={record.$form.getFieldValue('projectCategory') !== 'L' || !Modifiable}
              onClick={() => changeBomVisibel(record)}
            >
              {intl.get(`hzero.common.button.maintain`).d('维护')}
            </a>
          ),
        },
        {
          title: intl
            .get(`sodr.quotePurchase.model.quotePurchase.shipToThirdPartyName`)
            .d('送达方'),
          dataIndex: 'shipToThirdPartyName',
          width: 120,
          render: (val, record) =>
            ['create', 'update'].includes(record._status) && Modifiable ? (
              <FormItem>
                {record.$form.getFieldDecorator(`shipToThirdPartyName`, {
                  initialValue: record.shipToThirdPartyName,
                  rules: [
                    {
                      max: 120,
                      message: intl.get('hzero.common.validation.max', {
                        max: 120,
                      }),
                    },
                    {
                      required: (record.$form.getFieldValue('requiredFieldNames') || []).includes(
                        'shipToThirdPartyName'
                      ),
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get('sodr.quotePurchase.model.quotePurchase.shipToThirdPartyName')
                          .d('送达方'),
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
          title: intl.get(`sodr.common.model.common.shipToThirdPartyAddress`).d('送货地址'),
          dataIndex: 'shipToThirdPartyAddress',
          width: 200,
          render: (val, record) =>
            ['create', 'update'].includes(record._status) && Modifiable ? (
              <FormItem>
                {record.$form.getFieldDecorator(`shipToThirdPartyAddress`, {
                  initialValue: record.shipToThirdPartyAddress,
                  rules: [
                    {
                      max: 120,
                      message: intl.get('hzero.common.validation.max', {
                        max: 120,
                      }),
                    },
                    {
                      required: (record.$form.getFieldValue('requiredFieldNames') || []).includes(
                        'shipToThirdPartyAddress'
                      ),
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get('sodr.common.model.common.shipToThirdPartyAddress')
                          .d('送货地址'),
                      }),
                    },
                  ],
                })(
                  <TooltipInput tipValue={record.$form.getFieldValue('shipToThirdPartyAddress')} />
                )}
              </FormItem>
            ) : (
              <Tooltip title={val}>{val}</Tooltip>
            ),
        },
        {
          title: intl
            .get(`sodr.quotePurchase.model.quotePurchase.shipPartyContact`)
            .d('联系人信息'),
          dataIndex: 'shipToThirdPartyContact',
          width: 200,
          render: (val, record) =>
            ['create', 'update'].includes(record._status) && Modifiable ? (
              <FormItem>
                {record.$form.getFieldDecorator('shipToThirdPartyContact', {
                  initialValue: record.shipToThirdPartyContact,
                  rules: [
                    {
                      max: 120,
                      message: intl.get('hzero.common.validation.max', {
                        max: 120,
                      }),
                    },
                    {
                      required: (record.$form.getFieldValue('requiredFieldNames') || []).includes(
                        'shipToThirdPartyContact'
                      ),
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get('sodr.quotePurchase.model.quotePurchase.shipPartyContact')
                          .d('联系人信息'),
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
          title: intl.get(`sodr.quotePurchase.model.quotePurchase.receiveTelNum`).d('联系人电话'),
          width: 300,
          dataIndex: 'receiveTelNum',
          render: (val, record) =>
            ['create', 'update'].includes(record._status) && Modifiable ? (
              <FormItem>
                {record.$form.getFieldDecorator('receiveTelNum', {
                  initialValue: record.receiveTelNum,
                  rules: [
                    {
                      pattern:
                        record.$form.getFieldValue('internationalTelCode') === '+86'
                          ? PHONE
                          : NOT_CHINA_PHONE,
                      message: intl
                        .get(`sodr.common.model.common.phoneErrMsg`)
                        .d('手机号格式不正确'),
                    },
                  ],
                })(
                  <PhoneRender
                    record={record}
                    internationalTelCodeValue={record.internationalTelCode}
                    disabled={poSourcePlatform !== 'SRM'}
                    internationalTelCode={internationalTelCode}
                  />
                )}
                {record.$form.getFieldDecorator(`internationalTelCode`, {
                  initialValue: record.internationalTelCode,
                })}
              </FormItem>
            ) : (
              // <FormItem>
              //   {record.$form.getFieldDecorator(`internationalTelCode`, {
              //     initialValue: record.internationalTelCode,
              //   })(
              //     <Select style={{ width: 100 }} disabled={poSourcePlatform !== 'SRM'}>
              //       {internationalTelCode.map((n) => (
              //         <Select.Option key={n.value} value={n.value}>
              //           {n.meaning}
              //         </Select.Option>
              //       ))}
              //     </Select>
              //   )}
              //   {record.$form.getFieldDecorator(`receiveTelNum`, {
              //     initialValue: record.receiveTelNum,
              //   })(
              //     <TooltipInput
              //       tipValue={
              //         record.$form
              //           ? record.$form.getFieldValue('receiveTelNum')
              //           : record.receiveTelNum
              //       }
              //       style={{ width: 150 }}
              //       disabled={poSourcePlatform !== 'SRM'}
              //     />
              //   )}
              // </FormItem>
              <Tooltip title={record.receiveTelNum}>
                <span>{val || ''}</span>
              </Tooltip>
            ),
        },
        {
          title: intl.get(`hpfm.employee.model.employee.costCenterCode`).d('成本中心'),
          width: 120,
          dataIndex: 'costId',
          render: (val, record) =>
            ['create', 'update'].includes(record._status) && Modifiable ? (
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
          title: intl.get(`sodr.quotePurchase.model.quotePurchase.sumProject`).d('总账科目'),
          width: 120,
          dataIndex: 'accountSubjectId',
          render: (val, record) =>
            ['create', 'update'].includes(record._status) && Modifiable ? (
              <FormItem>
                {record.$form.getFieldDecorator(`accountSubjectId`, {
                  rules: [
                    {
                      required: (record.$form.getFieldValue('requiredFieldNames') || []).includes(
                        'accountSubjectId'
                      ),
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get('sodr.quotePurchase.model.quotePurchase.sumProject')
                          .d('总账科目'),
                      }),
                    },
                  ],
                  initialValue: val,
                })(
                  <Lov
                    disabled={!companyId}
                    code="SPRM.ACCOUNT_SUBJECT"
                    textValue={record.accountSubjectName}
                    textField="accountSubjectName"
                    lovOptions={{
                      valueField: 'accountSubjectId',
                      displayField: 'accountSubjectName',
                    }}
                    queryParams={{
                      companyId,
                      tenantId,
                    }}
                    onChange={(value, lovRecord) =>
                      this.handleLedgerAccount(value, lovRecord, record)
                    }
                  />
                )}
                {record.$form.getFieldDecorator('accountSubjectName', {})}
              </FormItem>
            ) : (
              record.accountSubjectName
            ),
        },
        {
          title: intl.get(`sodr.quotePurchase.model.quotePurchase.wbs`).d('WBS元素'),
          width: 165,
          dataIndex: 'wbsCode',
          render: (val, record) =>
            ['create', 'update'].includes(record._status) && Modifiable ? (
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
          title: intl.get(`sodr.quotePurchase.model.isFree`).d('是否免费'),
          width: 100,
          dataIndex: 'freeFlag',
          render: (val, record) =>
            ['create', 'update'].includes(record._status) && Modifiable ? (
              <FormItem>
                {record.$form.getFieldDecorator('freeFlag', {
                  initialValue: val,
                })(
                  <Checkbox
                    checkedValue={1}
                    unCheckedValue={0}
                    onChange={(e) => this.handleChangeCheck(e, record, 'freeFlag')}
                  />
                )}
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
                  disabled={returnOrderFlag === 1}
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
            ['create', 'update'].includes(record._status) && Modifiable ? (
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
            ['create', 'update'].includes(record._status) && Modifiable ? (
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
            ['create', 'update'].includes(record._status) && Modifiable ? (
              <FormItem>
                {record.$form.getFieldDecorator('model', {
                  initialValue: record.model,
                })(<Input />)}
              </FormItem>
            ) : (
              val
            ),
        },
      ],
      conract: [
        {
          title: intl.get(`sodr.common.model.common.tranOrder`).d('申请可占用数量'),
          width: 200,
          dataIndex: 'canHoldPrQuantity',
        },
        {
          title: intl.get(`sodr.common.model.common.comtrOrder`).d('协议可占用数量'),
          width: 150,
          dataIndex: 'canHoldPcQuantity',
        },
        {
          title: intl.get(`sodr.common.model.common.unitPrice`).d('不含税单价'),
          width: 150,
          dataIndex: 'unitPrice',
          align: 'right',
          render: (val, record) => {
            if (['create', 'update'].includes(record._status) && Modifiable) {
              const benchmarkPriceType =
                record.$form.getFieldValue('priceLibraryId') && record.benchmarkPriceType !== null
                  ? record.benchmarkPriceType
                  : headerInfo.benchmarkPriceType;
              return (
                <FormItem>
                  {record.$form.getFieldDecorator('unitPrice', {
                    initialValue: record.unitPrice,
                    rules: [
                      {
                        required:
                          record.$form.getFieldValue('priceLibraryId') &&
                          record.benchmarkPriceType !== null
                            ? record.benchmarkPriceType === 'NET_PRICE'
                            : headerInfo.benchmarkPriceType === 'NET_PRICE',
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`sodr.common.model.common.unitPrice`).d('不含税单价'),
                        }),
                      },
                    ],
                  })(
                    <InputNumber
                      min={0}
                      max={
                        record.benchmarkPriceType === 'NET_PRICE' &&
                        record.$form.getFieldValue('priceLibraryId') &&
                        headerInfo.modifyablePriceFlag === -1
                          ? !math.isZero(record.originUnitPrice) && record.originUnitPrice
                            ? record.originUnitPrice
                            : record.unitPrice
                          : MAX_QUAN_NUMBER
                      }
                      disabled={
                        benchmarkPriceType !== 'NET_PRICE' ||
                        (benchmarkPriceType === 'NET_PRICE' &&
                          headerInfo.modifyablePriceFlag === 0 &&
                          record.$form.getFieldValue('priceLibraryId'))
                      }
                      onFocus={() => handleIncludedPriceFcous(record)}
                      style={{ width: '100%' }}
                      parser={(value) => parseAumont(value, record.defaultPrecision)}
                      // precision={record.$form.getFieldValue('defaultPrecision')}
                    />
                  )}
                </FormItem>
              );
            } else {
              return formatAumont(val);
            }
          },
        },
        {
          title: intl.get(`sodr.common.model.common.taxedEnteredUnitPrice`).d('原币含税单价'),
          dataIndex: 'enteredTaxIncludedPrice',
          align: 'right',
          width: 140,
          render: (val, record) => {
            if (['create', 'update'].includes(record._status) && Modifiable) {
              const benchmarkPriceType =
                record.$form.getFieldValue('priceLibraryId') && record.benchmarkPriceType !== null
                  ? record.benchmarkPriceType
                  : headerInfo.benchmarkPriceType;
              return (
                <FormItem>
                  {record.$form.getFieldDecorator('enteredTaxIncludedPrice', {
                    initialValue:
                      record.defaultPrecision && val && !math.isZero(val)
                        ? new BigNumber(math.toFixed(val, Number(record.defaultPrecision)))
                        : val,
                    rules: [
                      {
                        required:
                          record.$form.getFieldValue('priceLibraryId') &&
                          record.benchmarkPriceType !== null
                            ? record.benchmarkPriceType !== 'NET_PRICE'
                            : headerInfo.benchmarkPriceType !== 'NET_PRICE',
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get(`sodr.common.model.common.taxedEnteredUnitPrice`)
                            .d('原币含税单价'),
                        }),
                      },
                    ],
                  })(
                    <InputNumber
                      min={0}
                      max={
                        record.$form.getFieldValue('priceLibraryId') &&
                        record.benchmarkPriceType !== 'NET_PRICE' &&
                        headerInfo.modifyablePriceFlag === -1
                          ? !math.isZero(record.originUnitPrice) && record.originUnitPrice
                            ? record.originUnitPrice
                            : record.enteredTaxIncludedPrice
                          : MAX_QUAN_NUMBER
                      }
                      disabled={
                        benchmarkPriceType === 'NET_PRICE' ||
                        (benchmarkPriceType === 'TAX_INCLUDED_PRICE' &&
                          headerInfo.modifyablePriceFlag === 0 &&
                          record.$form.getFieldValue('priceLibraryId'))
                      }
                      onFocus={() => handleIncludedPriceFcous(record)}
                      style={{ width: '100%' }}
                      parser={(value) => parseAumont(value, record.defaultPrecision)}
                      // precision={record.$form.getFieldValue('defaultPrecision')}
                    />
                  )}
                  {priceUpdateList.includes(record.poLineId) && (
                    <div style={{ display: 'inline-block' }}>
                      <Tooltip
                        title={intl
                          .get(`sodr.quotePurchaseRequisition.view.message.quoteTheLatestPrice`)
                          .d(
                            '订单行价格与价格库返回的最新价格不一致，可点击右上角“引用最新价格按钮”获取最新价格'
                          )}
                      >
                        <Icon type="exclamation-circle" style={{ color: 'red', marginLeft: 4 }} />
                      </Tooltip>
                    </div>
                  )}
                </FormItem>
              );
            } else {
              return formatAumont(val);
            }
          },
        },
        {
          title: intl.get(`sodr.quotePurchase.model.quotePurchase.number`).d('采购协议号|行号'),
          width: 180,
          dataIndex: 'contractNum',
          render: (val, record) => {
            return ['create', 'update'].includes(record._status) && Modifiable ? (
              <FormItem>
                {record.$form.getFieldDecorator('contractNum', {
                  initialValue: val,
                  rules: [
                    {
                      required: (record.$form.getFieldValue('requiredFieldNames') || []).includes(
                        'contractNum'
                      ),
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get('sodr.quotePurchase.model.quotePurchase.number')
                          .d('采购协议号|行号'),
                      }),
                    },
                  ],
                })(
                  <Lov
                    code="SPUC.PO_HOLD_PR"
                    lovOptions={{ valueField: 'contractNum', displayField: 'contractNum' }}
                    textField="contractNum"
                    disabled={record.priceContractFlag === 1}
                    onChange={(value, list) => this.handleContractNum(value, list, record)}
                    queryParams={{
                      tenantId,
                      supplierCompanyId,
                      companyId,
                      ouId,
                      itemId: record.$form.getFieldValue('itemId') || record.itemId,
                      holdPcLineId: record.holdPcLineId,
                    }}
                  />
                )}
              </FormItem>
            ) : (
              record.contractNum
            );
          },
        },
        {
          title: intl.get(`sodr.common.model.common.unitPriceBatch`).d('每'),
          dataIndex: 'unitPriceBatch',
          width: 140,
          render: (val, record) =>
            ['create', 'update'].includes(record._status) && Modifiable ? (
              <FormItem>
                {record.$form.getFieldDecorator('unitPriceBatch', {
                  rules: [
                    {
                      required: (record.$form.getFieldValue('requiredFieldNames') || []).includes(
                        'unitPriceBatch'
                      ),
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get('sodr.common.model.common.unitPriceBatch').d('每'),
                      }),
                    },
                    {
                      pattern: /^([1-9]\d*(\.\d*[1-9])?)|(0\.\d*[1-9])$/,
                      message: intl.get(`sodr.common.model.common.sumZero`).d('数值需大于零'),
                    },
                  ],
                  initialValue: record.unitPriceBatch,
                })(
                  <InputNumber
                    min={0}
                    max={MAX_QUAN_NUMBER}
                    disabled={record.priceLibraryId && record.currencyCode}
                    style={{ width: '100%' }}
                    className={styles['number-input']}
                  />
                )}
              </FormItem>
            ) : (
              val
            ),
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
          title: intl
            .get(`sodr.common.model.common.domesticTaxIncludedLineAmount`)
            .d('本币含税金额'),
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
            ['create', 'update'].includes(record._status) && Modifiable ? (
              <FormItem>
                {record.$form.getFieldDecorator(`budgetAccountId`, {
                  initialValue: record.budgetAccountId,
                })(
                  <Lov
                    code="SMDM.BUDGET_ACCOUNT_ORDER"
                    textValue={record.budgetAccountName}
                    textField="budgetAccountName"
                    lovOptions={{
                      valueField: 'budgetAccountId',
                      displayField: 'budgetAccountName',
                    }}
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
      ],
    };
    // 引用采购申请
    const request = [
      {
        title: intl.get(`sodr.common.model.common.referPrice`).d('参考价格'),
        width: 90,
        dataIndex: 'priceLibraryId',
        render: (val, record) => (
          <a disabled={!Modifiable} onClick={() => this.handlePrice(record)}>
            {intl.get(`sodr.common.model.common.referPrice`).d('参考价格')}
          </a>
        ),
      },
      {
        title: intl.get(`sodr.common.model.common.subSupplierId`).d('分包供应商'),
        width: 180,
        dataIndex: 'subSupplierId',
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('tempKey', {
                initialValue: record.subErpSupplierName || record.subSupplierName,
              })(
                <Lov
                  code="SODR.AUTH_SUPPLIER_LIFE_CYCLE"
                  textValue={record.subErpSupplierName || record.subSupplierName}
                  queryParams={{ userId, tenantId, organizationId, companyId }}
                  onChange={(value, lovRecord) =>
                    this.handleSubSupplierOnchange(value, lovRecord, record)
                  }
                />
              )}
            </FormItem>
          ) : (
            record.subErpSupplierName || record.subSupplierName
          ),
      },
    ];

    const translate = [
      {
        title: intl.get(`sodr.common.model.common.translate`).d('拆分'),
        dataIndex: 'translate',
        width: 60,
        // fixed: 'left',
        render: (__, record) => (
          <a
            disabled={!Modifiable || !checkContract || !record.displayLineNum}
            onClick={() => handleTranslate(record)}
          >
            {intl.get(`sodr.common.model.common.translate`).d('拆分')}
          </a>
        ),
      },
    ];
    if (conractFlag) {
      if (checkContract) {
        columns.base.splice(0, 0, ...translate);
      }
      columns.other.splice(7, 0, ...request);
      return columns.base
        .concat(columns.other, columns.conract, columns.commonBase, columns.request, columns.remark)
        .filter((i) => i);
    } else {
      if (checkContract) {
        columns.base.splice(0, 0, ...translate);
      }
      columns.other.splice(7, 0, ...request);
      return columns.base
        .concat(
          columns.other,
          columns.erpNormalPrice,
          columns.commonBase,
          columns.request,
          columns.remark
        )
        .filter((i) => i);
    }
  }

  // 检查表格内容值发生变化
  hasChangeData = (record, changeValues) => {
    const { hasChangeData } = this.props;
    if (!isEmpty(changeValues) && record.poLineId) {
      hasChangeData(true);
    }
  };

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

  // @Bind()
  // handleTaxAll(field, lovRecord) {
  //   const { taxId, taxRate, inventoryId, inventoryName } = lovRecord;
  //   this.setState({
  //     selectOptionValues:
  //       field === 'taxId'
  //         ? { taxId, wbs: taxRate, taxRate }
  //         : { [field]: inventoryId, inventoryName },
  //   });
  // }
  @Bind()
  handleBatchMaintenance() {
    this.setState({
      batchModalVisible: true,
    });
  }

  // @Bind()
  // getMaintenanceCom(key) {
  //   const {
  //     form: { getFieldDecorator },
  //     selectedListRows = [],
  //     dataSource = [],
  //     headerInfo,
  //   } = this.props;
  //   const { tenantId } = this.state;
  //   const { unSaveEnable } = headerInfo;
  //   const invOrganizationId =
  //     (selectedListRows[0] || dataSource[0])?.$form?.getFieldValue('invOrganizationId') ||
  //     dataSource[0]?.invOrganizationId;
  //   switch (key) {
  //     case 'taxId':
  //       return (
  //         <FormItem label=":">
  //           {getFieldDecorator(`taxId`)(
  //             <Lov
  //               code="SMDM.TAX"
  //               textField="taxRate"
  //               lovOptions={{ valueField: 'taxId', displayField: 'taxRate' }}
  //               queryParams={{ enabledFlag: 1, tenantId }}
  //               onChange={(_, lovRecord) => this.handleTaxAll('taxId', lovRecord)}
  //             />
  //           )}
  //         </FormItem>
  //       );
  //     case 'invInventoryId':
  //       return (
  //         <FormItem label=":">
  //           {getFieldDecorator(`invInventoryId`)(
  //             <Lov
  //               code="SODR.INVENTORY"
  //               disabled={!invOrganizationId}
  //               queryParams={{
  //                 enabledFlag: 1,
  //                 tenantId,
  //                 organizationId: invOrganizationId,
  //               }}
  //               textField="inventoryName"
  //               lovOptions={{ valueField: 'inventoryId', displayField: 'inventoryName' }}
  //               onChange={(_, lovRecord) => this.handleTaxAll('invInventoryId', lovRecord)}
  //             />
  //           )}
  //         </FormItem>
  //       );
  //     default:
  //       return (
  //         <Form.Item label=":">
  //           {getFieldDecorator(`needByDate`)(
  //             <DatePicker
  //               disabled={[1, 2].includes(unSaveEnable)}
  //               placeholder={null}
  //               format={getDateFormat()}
  //             />
  //           )}
  //         </Form.Item>
  //       );
  //   }
  // }
  @Bind()
  closeModel() {
    this.setState({ batchModalVisible: false });
  }

  render() {
    const columns = this.getColumns();
    const code = this.getCustomizeTableCode();
    const {
      loading,
      priceListloading,
      fetchSettingsLoading,
      deleteDetailLinesLoading,
      deleteLineRemoteLoaing,
      queryCreateListLoading,
      fetchNewPriceLibDataLoading,
      validating,
      pagination = {},
      dataSource = [],
      headerInfo,
      fetchDetailCreateList,
      customizeTable,
      handleRowSelectedChange = (e) => e,
      handleCancelLines = (e) => e,
      selectedListRows = [],
      handleChangePagination = (e) => e,
      priceUpdate = (e) => e,
      priceUpdateLoading,
      priceUpdateList = [],
      onChangeListData,
      customizeForm,
      validateItemAndInv,
    } = this.props;
    const { visible, batchModalVisible, customVisable, customData, calcLoading } = this.state;
    const { sourceBillTypeCode, poSourcePlatform, unSaveEnable } = headerInfo;
    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0)));
    // const maintenanceCom = this.getMaintenanceCom(selectOptionKey);
    const rowSelection = {
      selectedRowKeys: selectedListRows.map((n) => n.poLineId),
      onChange: handleRowSelectedChange,
    };
    const editTableProps = {
      loading:
        loading ||
        priceListloading ||
        fetchSettingsLoading ||
        calcLoading ||
        fetchNewPriceLibDataLoading,
      columns,
      dataSource,
      pagination,
      rowSelection,
      bordered: true,
      rowKey: 'poLineId',
      onDataChange: this.hasChangeData,
      onChange: (page) => handleChangePagination(page),
      scroll: { x: scrollX },
    };
    const itemInfoProps = {
      visible,
      lineList: dataSource,
      width: 900,
      onRef: (node) => {
        this.itemInfo = node;
      },
      loading: queryCreateListLoading,
      fetchDetailList: fetchDetailCreateList,
    };
    // const batchMaintainOpts = [
    //   {
    //     meaning: intl.get(`sodr.quotePurchase.model.quotePurchase.needByDate`).d('需求日期'),
    //     value: 'needByDate',
    //   },
    //   {
    //     meaning: intl.get(`sodr.quotePurchase.model.quotePurchase.taxRate`).d('税率（%）'),
    //     value: 'taxId',
    //   },
    //   {
    //     meaning: intl.get(`sodr.quotePurchase.model.quotePurchase.invInventory`).d('库房'),
    //     value: 'invInventoryId',
    //   },
    // ];
    const CustomSpecProps = {
      visible: customVisable,
      dataSource: customData,
      hideModal: () => {
        this.setState({ customVisable: false });
      },
    };
    return (
      <div className={styles['purchase-application']}>
        {!isEmpty(priceUpdateList) && (
          <p className={styles['order-top-title']}>
            <span />
            {intl
              .get(`sodr.quotePurchase.view.message.priceUpdate`)
              .d('价格库价格有更新，可点击下方右上角“引用最新价格”按钮获取最新价格')}
          </p>
        )}
        {sourceBillTypeCode === 'PURCHASE_REQUEST' &&
          (poSourcePlatform === 'SRM' ||
            poSourcePlatform === 'ERP' ||
            poSourcePlatform === 'SHOP') && (
            // 此form存在仅仅为了页面按钮样式,无实际表单功能
            <Form layout="inline">
              <Button
                type="primary"
                onClick={handleCancelLines}
                loading={deleteDetailLinesLoading || deleteLineRemoteLoaing}
                disabled={isArray(selectedListRows) && isEmpty(selectedListRows)}
              >
                {intl.get(`hzero.common.button.delete`).d('删除')}
              </Button>
              <Button
                onClick={priceUpdate}
                loading={priceUpdateLoading}
                disabled={isEmpty(priceUpdateList)}
              >
                {intl
                  .get(`sodr.quotePurchaseRequisition.view.button.quoteTheLatestPrice`)
                  .d('引用最新价格')}
              </Button>
              <span className="split-border" />
              <Form.Item>
                <Tooltip
                  title={
                    selectedListRows.length > 0
                      ? intl
                          .get('sodr.quotePurchase.view.nStripTickaBtchEdit', {
                            n: selectedListRows.length,
                          })
                          .d(`已勾选${selectedListRows.length}条数据进行批量编辑`)
                      : intl
                          .get('sodr.quotePurchase.view.allBatchMaintain')
                          .d('批量编辑当前页全部数据')
                  }
                >
                  <Button
                    data-code="search"
                    htmlType="submit"
                    type="primary"
                    onClick={this.handleBatchMaintenance}
                    disabled={dataSource.length === 0 || [1, 2].includes(unSaveEnable)}
                  >
                    <Tooltip
                      title={intl
                        .get(`sodr.quotePurchase.model.quotePurchase.batchMaintainTip`)
                        .d('一键修改需求日期')}
                    >
                      {selectedListRows.length > 0
                        ? intl.get(`sodr.quotePurchase.view.button.tickaBtchEdit`).d('勾选批量编辑')
                        : intl
                            .get(`sodr.quotePurchase.model.quotePurchase.batchMaintain`)
                            .d('批量编辑')}
                    </Tooltip>
                  </Button>
                </Tooltip>
              </Form.Item>
              {/* {maintenanceCom}
              <Form.Item>
                <Select
                  defaultValue="needByDate"
                  style={{ width: 120 }}
                  disabled={[1, 2].includes(unSaveEnable)}
                  onChange={(val) => {
                    this.setState({
                      selectOptionKey: val,
                    });
                  }}
                >
                  {batchMaintainOpts.map((n) => (
                    <Option key={n.value} value={n.value}>
                      {n.meaning}
                    </Option>
                  ))}
                </Select>
              </Form.Item> */}
            </Form>
          )}
        {code && customizeTable ? (
          customizeTable(
            {
              code,
            },
            <EditTable {...editTableProps} />
          )
        ) : (
          <EditTable {...editTableProps} />
        )}
        <Modal
          title={intl.get(`sodr.quotePurchase.view.message.addOrderLines`).d('新增订单行')}
          destroyOnClose
          width={900}
          visible={visible}
          onCancel={this.closeItemInfoModal}
          footer={
            <Button type="primary" loading={validating} onClick={this.onItemInfoModalOk}>
              {intl.get('hzero.common.button.ok').d('确定')}
            </Button>
          }
        >
          <ItemInfo {...itemInfoProps} />
        </Modal>
        {customVisable && <CustomSpecModal {...CustomSpecProps} />}
        <BatchEditModal
          closeModel={this.closeModel}
          selectedListRows={selectedListRows}
          headerInfo={headerInfo}
          batchModalVisible={batchModalVisible}
          dataSource={dataSource}
          onChangeListData={onChangeListData}
          customizeForm={customizeForm}
          hasPriceLibrary
          validateItemAndInv={validateItemAndInv}
        />
      </div>
    );
  }
}
