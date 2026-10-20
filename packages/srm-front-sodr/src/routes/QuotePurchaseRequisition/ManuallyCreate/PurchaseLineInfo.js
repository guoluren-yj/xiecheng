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
  InputNumber,
  Tooltip,
  DatePicker,
  // Checkbox,
  Modal,
  Icon,
  Select,
} from 'hzero-ui';
import moment from 'moment';
import { math } from 'choerodon-ui/dataset';
import BigNumber from 'bignumber.js';
import { stringify } from 'querystring';

import Checkbox from 'components/Checkbox';
import { Button } from 'components/Permission';
import CommonImport from 'components/Import';
import DocFlow from '_components/DocFlow';
import { SRM_SPUC } from '_utils/config';
import Lov from 'components/Lov';
import EditTable from 'components/EditTable';
// import UploadModal from 'components/Upload';
import UploadModal from 'srm-front-boot/lib/components/Upload';
import intl from 'utils/intl';
import {
  getDateFormat,
  getCurrentOrganizationId,
  getUserOrganizationId,
  getCurrentUserId,
} from 'utils/utils';
// import { numberRender } from 'utils/renderer';
// import notification from 'utils/notification';
// import { DATETIME_MIN } from 'utils/constants';
import {
  formatUom,
  formatAumont,
  parseAumont,
  formatNumber,
  getDynamicLabel,
  conversionUpdateForH0,
  getSecondaryUomFormItem,
  conversionUpdateUomIdForH0,
} from '@/routes/components/utils';
import { amountCalculation } from 'srm-front-boot/lib/utils/utils';
import { TooltipInput, TooltipLov } from '@/routes/components/TooltipFormItem';
import TooltipButton from '@/routes/components/TooltipButton';
import { NOT_CHINA_PHONE, PHONE } from 'utils/regExp';
import { BUCKET_NAME, MAX_QUAN_NUMBER, LINE_DIRECTORY } from '@/routes/components/utils/constant';
import ItemInfo from '@/routes/QuotePurchaseRequisition/PurchasingRequisition/CatDetail/ItemInfo';
import styles from './Header.less';
import PhoneRender from '../components/PhoneRender';
import BatchEditModal from '../components/BatchEditModal';

const FormItem = Form.Item;
// const { Option } = Select;

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
  // priceListloading: loading.effects['quotePurchaseRequisition/priceList'],
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
      doubleUnitEnabled, // 双单位开启
      newPriceLibFlag, // 是否引用新价格库
      itemChangePriceFlag, // 是否通过物料引用新价格库
      // priceShieldFlag, // 配置中心是否引用物料价格信息记录
    } = this.props;
    const sodrEnabled = doubleUnitEnabled !== 0;
    const { setFieldsValue } = record.$form;
    const {
      itemId,
      itemCode,
      itemName,
      categoryName,
      categoryId,
      uomName,
      uomId,
      uomCode,
      uomPrecision,
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
      receiveToleranceQuantityType,
      receiveToleranceQuantity,
      uomCodeAndName,
    } = dataList;
    // console;
    const basicUomObj = {
      uomId,
      uomCode,
      uomName,
      uomCodeAndName: formatUom(uomCode, uomName),
      uomPrecision,
    };
    const secondaryUomObj = getSecondaryUomFormItem({
      record,
      sodrEnabled,
      basicUomObj,
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
            itemCode,
            itemName,
            categoryId,
            categoryName,
            uomId,
            uomName,
            uomCodeAndName,
            ...secondaryUomObj,
            currencyCode: record.currencyCode || undefined,
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
        receiveToleranceQuantityType,
        receiveToleranceQuantity,
        commonName,
        model,
        specifications,
        brand,
      });
      callback();
      onChangeListData(newDataSource, () => {
        if (itemChangePriceFlag === 1) {
          this.props.handleIncludedPriceFcous(record, dataList);
        }
      });
    } else {
      const currencyCodeJson = currencyCode ? { currencyCode } : null;
      const listCommonDataSource = dataSource.map((item) => {
        if (item.poLineId) {
          if (item.poLineId === record.poLineId) {
            return {
              ...item,
              itemCode,
              itemId,
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
        receiveToleranceQuantity,
        receiveToleranceQuantityType,
      });
      callback();
    }
    setFieldsValue({
      unitPriceBatch: value ? dataList.priceBatchQuantity : null,
    });
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
      onChangeListData,
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
      recordSetFieldsValue({ tmpOrganizationId: value, invOrganizationId: value });
    }
    record.$form.resetFields('invInventoryId');
    record.$form.resetFields('invLocationId');
    const listDataSource = dataSource.map((item) => {
      if (item.poLineId === record.poLineId) {
        return {
          ...item,
          invOrganizationId: value,
          invInventoryId: undefined,
          invLocationId: undefined,
        };
      }
      return item;
    });
    onChangeListData(listDataSource);
  }

  /**
   * 收货库房级联改变回调函数
   * @param {*} value
   * @param {*} field
   */
  @Bind()
  handleInvInventoryLovChange(value, field, record, lovRecord) {
    const {
      form: { setFieldsValue },
      dataSource,
      onChangeListData,
    } = this.props;
    const { [field]: oldValue } = dataSource;
    const fieldsValue =
      field === 'invOrganizationId' ? { invInventoryId: undefined } : { invLocationId: undefined };
    if (oldValue !== value) {
      setFieldsValue(fieldsValue);
    }
    // record.$form.setFieldsValue({ invLocationId: '' });
    record.$form.resetFields('invLocationId');
    record.$form.setFieldsValue({ invInventoryId: value, inventoryName: lovRecord.inventoryName });
    const listDataSource = dataSource.map((item) => {
      if (item.poLineId === record.poLineId) {
        return {
          ...item,
          invInventoryId: value,
          inventoryName: lovRecord.inventoryName,
        };
      }
      return item;
    });
    onChangeListData(listDataSource);
  }

  /**
   * 批量维护
   */
  // @Bind()
  // async handleMaintain(benchmarkPriceType) {
  //   const {
  //     form: { getFieldsValue },
  //     dataSource,
  //     onChangeListData,
  //     selectedListRows = [],
  //     onChangeHeader,
  //     headerInfo,
  //     validateItemAndInv,
  //   } = this.props;
  //   const { selectOptionKey, selectOptionValues } = this.state;
  //   const fieldsValue = getFieldsValue();
  //   const key = selectedListRows.map((n) => n.poLineId);
  //   const { needByDate, [selectOptionKey]: selectOptionIndex, lineRemark } = fieldsValue;
  //   let newDataSource;
  //   if (
  //     selectOptionIndex ||
  //     lineRemark ||
  //     selectOptionKey === 'enteredTaxIncludedPrice' ||
  //     selectOptionKey === 'unitPrice'
  //   ) {
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
  //       onChangeHeader({
  //         ...headerInfo,
  //         batchMaintainDemandDate: moment(needByDate).format(DATETIME_MIN),
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
  //             taxId: selectOptionIndex,
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
  //       onChangeHeader({
  //         ...headerInfo,
  //         batchMaintainTaxRate: selectOptionValues.taxRate,
  //         batchMaintainTaxId: selectOptionIndex,
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
  //       onChangeHeader({
  //         ...headerInfo,
  //         batchMaintainInvInventoryId: selectOptionValues.inventoryId,
  //       });
  //     } else if (selectOptionKey === 'costId') {
  //       newDataSource = dataSource.map((item) => {
  //         if (isEmpty(selectedListRows) || key.includes(item.poLineId)) {
  //           item.$form.setFieldsValue({
  //             costId: selectOptionIndex,
  //             costName: selectOptionValues.costName,
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
  //       onChangeHeader({
  //         ...headerInfo,
  //         batchMaintainCostId: selectOptionIndex,
  //         batchMaintainCostCode: selectOptionValues.costName,
  //       });
  //     } else if (selectOptionKey === 'remark') {
  //       newDataSource = dataSource.map((item) => {
  //         if (isEmpty(selectedListRows) || key.includes(item.poLineId)) {
  //           item.$form.setFieldsValue({ [selectOptionKey]: lineRemark });
  //         }
  //         return item;
  //       });
  //     } else if (selectOptionKey === 'invOrganizationId') {
  //       if (await validateItemAndInv(selectOptionIndex)) return;
  //       newDataSource = dataSource.map((item) => {
  //         if (isEmpty(selectedListRows) || key.includes(item.poLineId)) {
  //           item.$form.setFieldsValue({
  //             invOrganizationId: selectOptionIndex,
  //             invOrganizationName: selectOptionValues.organizationName,
  //           });
  //           return {
  //             ...item,
  //             ...selectOptionValues,
  //             invOrganizationId: selectOptionIndex,
  //             invOrganizationName: selectOptionValues.organizationName,
  //           };
  //         } else {
  //           return {
  //             ...item,
  //           };
  //         }
  //       });
  //       onChangeHeader({
  //         ...headerInfo,
  //       });
  //     } else if (selectOptionKey === 'enteredTaxIncludedPrice') {
  //       newDataSource = dataSource.map((item) => {
  //         const priceFlag =
  //           item.$form.getFieldValue('priceLibraryId') && item.$form.getFieldValue('priceTaxId');
  //         if (
  //           (isEmpty(selectedListRows) || key.includes(item.poLineId)) &&
  //           !priceFlag &&
  //           (benchmarkPriceType === 'TAX_INCLUDED_PRICE' || benchmarkPriceType === undefined)
  //         ) {
  //           item.$form.setFieldsValue({
  //             enteredTaxIncludedPrice: selectOptionIndex,
  //           });
  //         }
  //         return {
  //           ...item,
  //         };
  //       });
  //     } else if (selectOptionKey === 'unitPrice') {
  //       newDataSource = dataSource.map((item) => {
  //         const priceFlag =
  //           item.$form.getFieldValue('priceLibraryId') && item.$form.getFieldValue('priceTaxId');
  //         if (
  //           (isEmpty(selectedListRows) || key.includes(item.poLineId)) &&
  //           !priceFlag &&
  //           benchmarkPriceType === 'NET_PRICE'
  //         ) {
  //           item.$form.setFieldsValue({
  //             unitPrice: selectOptionIndex,
  //           });
  //         }
  //         return {
  //           ...item,
  //         };
  //       });
  //     } else {
  //       newDataSource = dataSource.map((item) => {
  //         if (isEmpty(selectedListRows) || key.includes(item.poLineId)) {
  //           item.$form.setFieldsValue({ [selectOptionKey]: selectOptionIndex });
  //         }
  //         return item;
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

  @Bind()
  @Debounce(800)
  handleSecondaryNumChange(value, record) {
    const { doubleUnitEnabled } = this.props;
    const itemCode = record.$form.getFieldValue('itemCode');
    if (!value) return;
    if (!(doubleUnitEnabled && itemCode)) {
      record.$form.getFieldDecorator('quantity', { initialValue: record.quantity });
      record.$form.setFieldsValue({ quantity: value });
    } else {
      conversionUpdateForH0({
        record,
        doubleUnitEnabled,
        businessKeyField: 'poLineId',
        query: this.calculateDoubleUom,
      });
    }
  }

  @Bind()
  calcLoading(calcLoading) {
    this.setState({ calcLoading });
  }

  @Bind()
  getColumns() {
    const {
      handTaxDate,
      headerInfo,
      priceUpdateList = [],
      supplierCompanyId,
      poSourcePlatform,
      tieredPricingFlag,
      ouId,
      companyId,
      conractFlag,
      setting,
      returnOrderFlag,
      newPriceLibFlag,
      afterOpenUploadModal,
      // fetchFlag, // 用来判断头信息改变供应商lov或者业务实体lov时调用接口返回值为空的情况
      handleIncludedPriceFcous,
      changeBomVisibel,
      defaultProjectCategory,
      defaultProjectCategoryMeaning,
      enumMap: { internationalTelCode = [], excessOrderType = [], purchaseLineType = [] },
      itemChangePriceFlag,
      handleTranslate,
      amountCalcRule,
      doubleUnitEnabled,
      form: { getFieldValue },
    } = this.props;
    const {
      sourceBillTypeCode,
      unSaveEnable = 1,
      domesticFinancialPrecision,
      companyCode,
      ouCode,
    } = headerInfo;
    const {
      userId,
      tenantId,
      organizationId,
      invInventoryVisible,
      invLocationVisible,
    } = this.state;
    const isRequest = sourceBillTypeCode === 'PURCHASE_REQUEST'; // 引用采购申请
    const Modifiable = !(isRequest && [1, 2].includes(unSaveEnable));
    const excessOrderTypes = excessOrderType.map((item) => {
      return {
        meaning: item.meaning,
        value: item.value,
      };
    });
    const purchaseLineTypes = purchaseLineType.map((item) => {
      return {
        meaning: item.meaning,
        value: item.value,
      };
    });
    const sodrEnabled = doubleUnitEnabled !== 0;
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
                  initialValue: record.projectCategory || defaultProjectCategory,
                })(
                  <Lov
                    code="SPUC.PR_LINE_PROJECT_CATEHORY"
                    textField="projectCategoryMeaning"
                    lovOptions={{
                      valueField: 'value',
                      displayField: 'meaning',
                    }}
                  />
                )}
                {record.$form.getFieldDecorator('projectCategoryMeaning', {
                  initialValue: record.projectCategoryMeaning || defaultProjectCategoryMeaning,
                })}
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
                    textField="invOrganizationName"
                    queryParams={{
                      enabledFlag: 1,
                      tenantId,
                      ouId,
                      itemId: record.$form.getFieldValue('itemId'),
                    }}
                  />
                )}
                {record.$form.getFieldDecorator('invOrganizationName', {
                  initialValue: record.invOrganizationName,
                })}
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
                      ouCode,
                      companyCode,
                      orderTypeCode: getFieldValue('orderTypeCode'),
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
                      // categoryId: record.$form.getFieldValue('categoryId'),
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
            // 若个性化配置newLovCode，则特殊处理参数逻辑
            const originLovCode = 'SMDM.CATEGORY.LEVEL_CONTROL_TREE';
            const newLovCode = 'SMDM.TREE_ITEM_CATEGORY_TILED_NEW';
            const targeUnitCode = 'SODR.ORDER_CREATE_LINE_LIST.PO_LINE_LOCATION';
            const { custConfig = {} } = this.props;
            const { fields = [] } = custConfig[targeUnitCode] || {};
            const { lovCode = originLovCode } =
              fields.find((i) => i.fieldCode === 'categoryId') || {};
            const params = {
              tenantId,
              enabledFlag: 1,
              itemId: record.$form.getFieldValue('itemId'),
            };
            let queryParams = {};
            if (lovCode === newLovCode) {
              queryParams = { ...params, module: 'PR' };
            } else {
              queryParams = {
                ...params,
                hzeroUIFlag: 1,
                businessObjectCode: 'SRM_C_SRM_SODR_PO_HEADER',
              };
            }
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
                    code={originLovCode}
                    textField="categoryName"
                    lovOptions={{ valueField: 'categoryId', displayField: 'categoryName' }}
                    queryParams={queryParams}
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
                    parser={(value) =>
                      parseAumont(value, record.$form.getFieldValue('secondaryUomPrecision'))
                    }
                    disabled={!sodrEnabled}
                    allowThousandth="true"
                    onChange={(value) => {
                      this.handleSecondaryNumChange(value, record);
                    }}
                  />
                )}
              </FormItem>
            ) : (
              val
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
                    lovOptions={{ valueField: 'uomId' }}
                    textField="secondaryUomCodeAndName"
                    disabled={!sodrEnabled}
                    queryParams={{
                      itemId: record.$form.getFieldValue('itemId'),
                      primaryUomId: record.$form.getFieldValue('uomId'),
                    }}
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
            ) : (
              record.secondaryUomCodeAndName
            );
          },
        },
        {
          title: getDynamicLabel(sodrEnabled, 'quantity'),
          dataIndex: 'quantity',
          width: 120,
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
                    parser={(value) =>
                      parseAumont(value, record.$form.getFieldValue('uomPrecision'))
                    }
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
                    lovOptions={{ valueField: 'uomId' }}
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
            ) : (
              record.uomCodeAndName
            );
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
                {
                  // 单价精度
                  record.$form.getFieldDecorator('defaultPrecision', {
                    initialValue: isNil(record.defaultPrecision)
                      ? headerInfo.defaultPrecision
                      : record.defaultPrecision,
                  })
                }
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
                      const { setFieldsValue, getFieldsValue } = record.$form;
                      const benchmarkPriceType =
                        newPriceLibFlag && record.benchmarkPriceType !== null
                          ? record.benchmarkPriceType
                          : headerInfo.benchmarkPriceType;
                      const { taxRate } = values;
                      const { quantity, unitPrice, enteredTaxIncludedPrice } = getFieldsValue();
                      const {
                        taxRateType,
                        financialPrecision = 0,
                        defaultPrecision = 0,
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
                        (isNumber(number) || math.isBigNumber(number)) && !math.isNaN(number);
                      if (benchmarkPriceType !== 'NET_PRICE' && isNumberPro(calcNetUnitPrice)) {
                        setFieldsValue({
                          unitPrice: calcNetUnitPrice
                            ? new BigNumber(math.toFixed(calcNetUnitPrice, 10))
                            : calcNetUnitPrice,
                        });
                      } else if (
                        benchmarkPriceType === 'NET_PRICE' &&
                        isNumberPro(calcTaxUnitPrice)
                      ) {
                        setFieldsValue({
                          enteredTaxIncludedPrice: calcNetUnitPrice
                            ? new BigNumber(math.toFixed(calcTaxUnitPrice, 10))
                            : calcNetUnitPrice,
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
        {
          title: intl.get(`sodr.common.model.common.receiveToleranceQuantityType`).d('允差类型'),
          width: 150,
          dataIndex: 'receiveToleranceQuantityType',
          render: (val, record) => {
            return (
              <FormItem>
                {record.$form.getFieldDecorator(`receiveToleranceQuantityType`, {
                  initialValue: val,
                  rules: [
                    {
                      required:
                        record.$form.getFieldValue('receiveToleranceQuantity') &&
                        !record.$form.getFieldValue('receiveToleranceQuantityType'),
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`sodr.common.model.common.receiveToleranceQuantityType`)
                          .d('允差类型'),
                      }),
                    },
                  ],
                })(
                  <Select
                    allowClear
                    style={{ width: '100%' }}
                    onChange={() => {
                      setTimeout(() => {
                        record.$form.validateFields(
                          ['receiveToleranceQuantity', 'receiveToleranceQuantityType'],
                          {
                            force: true,
                          }
                        );
                      }, 0);
                    }}
                  >
                    {excessOrderTypes.map((item) => (
                      <Select.Option key={item.value}>{item.meaning}</Select.Option>
                    ))}
                  </Select>
                )}
              </FormItem>
            );
          },
        },
        {
          title: intl.get(`sodr.common.model.common.receiveToleranceQuantity`).d('接收允差(%)'),
          width: 150,
          dataIndex: 'receiveToleranceQuantity',
          render: (val, record) =>
            ['create', 'update'].includes(record._status) ? (
              <FormItem>
                {record.$form.getFieldDecorator(`receiveToleranceQuantity`, {
                  initialValue: val,
                  rules: [
                    {
                      required:
                        record.$form.getFieldValue('receiveToleranceQuantityType') &&
                        !record.$form.getFieldValue('receiveToleranceQuantity'),
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`sodr.common.model.common.receiveToleranceQuantity`)
                          .d('接收允差(%)'),
                      }),
                    },
                  ],
                })(
                  <InputNumber
                    min={0}
                    max={MAX_QUAN_NUMBER}
                    allowThousandth="true"
                    onChange={() => {
                      setTimeout(() => {
                        record.$form.validateFields(
                          ['receiveToleranceQuantity', 'receiveToleranceQuantityType'],
                          {
                            force: true,
                          }
                        );
                      }, 0);
                    }}
                  />
                )}
              </FormItem>
            ) : (
              val
            ),
        },
        {
          title: intl.get(`sodr.common.model.common.purchaseLineTypes`).d('采购行类型'),
          width: 150,
          dataIndex: 'purchaseLineTypeId',
          render: (val, record) => (
            <FormItem>
              {record.$form.getFieldDecorator(`purchaseLineTypeId`, {
                initialValue: !isNil(val) ? val.toString() : null,
              })(
                <Select allowClear style={{ width: '100%' }}>
                  {purchaseLineTypes.map((item) => (
                    <Select.Option key={item.value}>{item.meaning}</Select.Option>
                  ))}
                </Select>
              )}
            </FormItem>
          ),
        },
        {
          title: intl.get(`sodr.quotePurchase.model.quotePurchase.receiveTelNum`).d('联系人电话'),
          width: 300,
          dataIndex: 'receiveTelNum',
          render: (val, record) => {
            return ['create', 'update'].includes(record._status) && Modifiable ? (
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
              // <div style={{ display: 'flex' }}>
              //   <FormItem>
              //     {record.$form.getFieldDecorator(`internationalTelCode`, {
              //       initialValue: record.internationalTelCode,
              //     })(
              //       <Select style={{ width: 110 }} disabled={poSourcePlatform !== 'SRM'}>
              //         {internationalTelCode.map((n) => (
              //           <Select.Option key={n.value} value={n.value}>
              //             {n.meaning}
              //           </Select.Option>
              //         ))}
              //       </Select>
              //     )}
              //   </FormItem>
              //   <FormItem>
              //     {record.$form.getFieldDecorator(`receiveTelNum`, {
              //       initialValue: record.receiveTelNum,
              //       rules: [
              //         {
              //           pattern:
              //             record.$form.getFieldValue('internationalTelCode') === '+86'
              //               ? PHONE
              //               : NOT_CHINA_PHONE,
              //           message: intl
              //             .get(`sodr.common.model.common.phoneErrMsg`)
              //             .d('手机号格式不正确'),
              //         },
              //       ],
              //     })(
              //       <TooltipInput
              //         tipValue={
              //           record.$form
              //             ? record.$form.getFieldValue('receiveTelNum')
              //             : record.receiveTelNum
              //         }
              //         style={{ width: 160 }}
              //         disabled={poSourcePlatform !== 'SRM'}
              //       />
              //     )}
              //   </FormItem>
              // </div>
              <Tooltip title={record.receiveTelNum}>
                <span>{val || ''}</span>
              </Tooltip>
            );
          },
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
                      message: intl.get('hzero.common.validation.max', {
                        max: 480,
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
                    bucketDirectory={LINE_DIRECTORY}
                    attachmentUUID={record.attachmentUuid}
                    icon={false}
                    afterOpenUploadModal={(uuid) => afterOpenUploadModal(uuid, record)}
                  />
                )}
              </FormItem>
            ) : null,
        },
        {
          title: intl.get(`sodr.common.model.common.subSupplierId`).d('分包供应商'),
          width: 180,
          dataIndex: 'subSupplierId',
          render: (val, record) =>
            ['create', 'update'].includes(record._status) && Modifiable ? (
              <FormItem>
                {record.$form.getFieldDecorator('tempKey', {
                  initialValue: record.subErpSupplierName || record.subSupplierName,
                })(
                  <Lov
                    disabled={unSaveEnable === 2}
                    code="SODR.AUTH_SUPPLIER_LIFE_CYCLE"
                    // textField="subSupplierName"
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
        {
          width: 100,
          dataIndex: 'docFlow',
          title: intl.get(`sodr.common.model.common.docFlow`).d('单据流'),
          render: (_, record) => (
            <DocFlow tableName="sodr_po_line_location" tablePk={record.poLineLocationId} />
          ),
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
                      onFocus={() =>
                        itemChangePriceFlag === 1 ? null : handleIncludedPriceFcous(record)
                      }
                      style={{ width: '100%' }}
                      parser={(value) =>
                        parseAumont(
                          value,
                          record.$form.getFieldValue('defaultPrecision') ||
                            domesticFinancialPrecision
                        )
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
              // const benchmarkPriceType =
              //   newPriceLibFlag && record.benchmarkPriceType !== null
              //     ? record.benchmarkPriceType
              //     : headerInfo.benchmarkPriceType;
              const benchmarkPriceType = record.benchmarkPriceType ?? headerInfo.benchmarkPriceType;
              return (
                <FormItem>
                  {record.$form.getFieldDecorator('enteredTaxIncludedPrice', {
                    initialValue: record.enteredTaxIncludedPrice,
                    rules: [
                      {
                        required:
                          // newPriceLibFlag && record.benchmarkPriceType !== null
                          //   ? record.benchmarkPriceType !== 'NET_PRICE'
                          //   : headerInfo.benchmarkPriceType !== 'NET_PRICE',
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
                        // newPriceLibFlag
                        //   ? benchmarkPriceType === 'NET_PRICE' ||
                        //     (benchmarkPriceType === 'TAX_INCLUDED_PRICE' &&
                        //       headerInfo.modifyablePriceFlag === 0 &&
                        //       record.$form.getFieldValue('priceLibraryId'))
                        //   : headerInfo.benchmarkPriceType === 'NET_PRICE'
                        benchmarkPriceType === 'NET_PRICE' ||
                        (benchmarkPriceType === 'TAX_INCLUDED_PRICE' &&
                          headerInfo.modifyablePriceFlag === 0 &&
                          record.$form.getFieldValue('priceLibraryId'))
                      }
                      onFocus={() =>
                        itemChangePriceFlag === 1 ? null : handleIncludedPriceFcous(record)
                      }
                      style={{ width: '100%' }}
                      parser={(value) =>
                        parseAumont(
                          value,
                          record.$form.getFieldValue('defaultPrecision') ||
                            domesticFinancialPrecision
                        )
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
                    allowThousandth="true"
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
                {record.$form.getFieldDecorator('budgetAccountName', {
                  initialValue: record.budgetAccountName,
                })}
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
                    textField="departmentName"
                    queryParams={{ tenantId }}
                  />
                )}
                {record.$form.getFieldDecorator('departmentName', {
                  initialValue: record.departmentName,
                })}
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
                    onChange={(value, lovRecord) =>
                      this.handleInvInventoryLovChange(value, 'invInventoryId', record, lovRecord)
                    }
                    code="SODR.INVENTORY"
                    textValue={record.inventoryName}
                    disabled={!record.$form.getFieldValue('invOrganizationId')}
                    queryParams={{
                      enabledFlag: 1,
                      tenantId,
                      organizationId:
                        record.$form.getFieldValue('tmpOrganizationId') || record.tmpOrganizationId,
                      invOrganizationId: record.$form.getFieldValue('invOrganizationId'),
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
                {record.$form.getFieldDecorator('accountSubjectName', {
                  initialValue: record.accountSubjectName,
                })}
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
                {record.$form.getFieldDecorator('wbs', {
                  initialValue: record.wbs,
                })}
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
        {
          title: intl.get(`sodr.orderMaintain.sourceFrom.sourceCodeNum`).d('寻源单号|行号'),
          width: 150,
          dataIndex: 'sourceNumAndLine',
        },
      ],
      contract: [
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
      ],
    };
    // 引用采购申请
    const request = [
      {
        title: intl.get(`sodr.common.model.common.referPrice`).d('参考价格'),
        width: 90,
        dataIndex: 'priceLibraryId',
        render: (_, record) => (
          <a disabled={!Modifiable} onClick={() => this.handlePrice(record)}>
            {intl.get(`sodr.common.model.common.referPrice`).d('参考价格')}
          </a>
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
          <a disabled={!record.displayLineNum} onClick={() => handleTranslate(record)}>
            {intl.get(`sodr.common.model.common.translate`).d('拆分')}
          </a>
        ),
      },
    ];
    columns.other.splice(0, 0, ...translate);
    columns.other.splice(7, 0, ...request);
    const columnArr = columns.base.concat(
      columns.other,
      columns.erpNormalPrice,
      columns.commonBase,
      columns.remark
    );
    if (conractFlag) {
      columnArr.push(...columns.contract);
    }
    return columnArr.filter((i) => i);
  }

  // 检查表格内容值发生变化
  hasChangeData = (record, changeValues) => {
    const { hasChangeData } = this.props;
    if (!isEmpty(changeValues) && record.poLineId) {
      hasChangeData(true);
    }
  };

  // @Bind()
  // handleTaxAll(field, lovRecord) {
  //   const {
  //     taxId,
  //     taxRate,
  //     inventoryId,
  //     inventoryName,
  //     costId,
  //     costCode,
  //     costName,
  //     organizationId,
  //     organizationName,
  //     enteredTaxIncludedPrice,
  //     unitPrice,
  //   } = lovRecord;
  //   switch (field) {
  //     case 'taxId':
  //       this.setState({ selectOptionValues: { taxId, wbs: taxRate, taxRate } });
  //       break;
  //     case 'invInventoryId':
  //       this.setState({ selectOptionValues: { inventoryId, inventoryName } });
  //       break;
  //     case 'costId':
  //       this.setState({ selectOptionValues: { costId, costCode, costName } });
  //       break;
  //     case 'invOrganizationId':
  //       this.setState({ selectOptionValues: { organizationId, organizationName } });
  //       break;
  //     case 'enteredTaxIncludedPrice':
  //       this.setState({ selectOptionValues: { enteredTaxIncludedPrice } });
  //       break;
  //     case 'unitPrice':
  //       this.setState({ selectOptionValues: { unitPrice } });
  //       break;
  //     default:
  //   }
  // }

  // @Bind()
  // getMaintenanceCom(key, benchmarkPriceType, defaultPrecision) {
  //   const {
  //     form: { getFieldDecorator },
  //     selectedListRows = [],
  //     dataSource = [],
  //     companyId,
  //     ouId,
  //   } = this.props;
  //   const { tenantId } = this.state;
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
  //     case 'needByDate':
  //       return (
  //         <Form.Item label=":">
  //           {getFieldDecorator(`needByDate`)(
  //             <DatePicker placeholder={null} format={getDateFormat()} />
  //           )}
  //         </Form.Item>
  //       );
  //     case 'costId':
  //       return (
  //         <FormItem label=":">
  //           {getFieldDecorator(`costId`)(
  //             <Lov
  //               disabled={!companyId}
  //               code="SPRM.COST_CENTER"
  //               textField="costName"
  //               lovOptions={{ valueField: 'costId', displayField: 'costName' }}
  //               queryParams={{
  //                 companyId,
  //                 tenantId,
  //                 ouId,
  //               }}
  //               onChange={(_, lovRecord) => this.handleTaxAll('costId', lovRecord)}
  //             />
  //           )}
  //         </FormItem>
  //       );
  //     case 'remark':
  //       return <Form.Item label=":">{getFieldDecorator(`lineRemark`)(<Input />)}</Form.Item>;
  //     case 'invOrganizationId':
  //       return (
  //         <FormItem label=":">
  //           {getFieldDecorator(`invOrganizationId`)(
  //             <Lov
  //               code="SPUC.SMDM.INV_ORG"
  //               // disabled={!organizationId}
  //               queryParams={{
  //                 enabledFlag: 1,
  //                 tenantId,
  //                 ouId,
  //               }}
  //               onChange={(_, lovRecord) => this.handleTaxAll('invOrganizationId', lovRecord)}
  //             />
  //           )}
  //         </FormItem>
  //       );
  //     case 'enteredTaxIncludedPrice':
  //       return (
  //         <FormItem label=":">
  //           {getFieldDecorator(`enteredTaxIncludedPrice`)(
  //             <InputNumber
  //               min={0}
  //               max={MAX_QUAN_NUMBER}
  //               precision={getPrecision(defaultPrecision)}
  //               disabled={benchmarkPriceType === 'NET_PRICE'}
  //               onChange={(enteredTaxIncludedPrice) =>
  //                 this.handleTaxAll('enteredTaxIncludedPrice', { enteredTaxIncludedPrice })
  //               }
  //             />
  //           )}
  //         </FormItem>
  //       );
  //     case 'unitPrice':
  //       return (
  //         <FormItem label=":">
  //           {getFieldDecorator(`unitPrice`)(
  //             <InputNumber
  //               min={0}
  //               max={MAX_QUAN_NUMBER}
  //               precision={getPrecision(defaultPrecision)}
  //               disabled={
  //                 benchmarkPriceType === 'TAX_INCLUDED_PRICE' || benchmarkPriceType === undefined
  //               }
  //               onChange={(unitPrice) => this.handleTaxAll('unitPrice', { unitPrice })}
  //             />
  //           )}
  //         </FormItem>
  //       );
  //     default:
  //       return <Form.Item label=":">{getFieldDecorator(key)(<Input />)}</Form.Item>;
  //   }
  // }

  @Bind()
  handleBatchMaintenance() {
    this.setState({
      batchModalVisible: true,
    });
  }

  @Bind()
  closeModel() {
    this.setState({ batchModalVisible: false });
  }

  /**
   * 批量导入
   */
  @Bind()
  handleImport() {
    const { poHeaderId = '' } = this.props.headerInfo;
    const option = {
      pathname: '/sodr/purchase-order-maintain/line-creation/data-import/SPUC.PO_LINE_IMPORT',
      search: stringify({
        action: intl.get('sodr.common.view.button.batchImport').d('批量导入'),
        backPath: `/sodr/purchase-order-maintain/quote-purchase-requisition/line-manuall-create?poHeaderId=${poHeaderId}&source=newRequisition&entrance=maintain`,
        args: JSON.stringify({
          poHeaderId,
        }),
      }),
    };
    this.props.history.push(option);
  }

  render() {
    const columns = this.getColumns();
    const {
      loading,
      fetchSettingsLoading,
      deleteDetailLinesLoading,
      deleteLineRemoteLoaing,
      addDetailLinesLoading,
      queryCreateListLoading,
      fetchNewPriceLibDataLoading,
      validating,
      pagination = {},
      dataSource = [],
      fetchDetailCreateList,
      customizeTable,
      handleRowSelectedChange = (e) => e,
      handleCancelLines = (e) => e,
      selectedListRows = [],
      handleChangePagination = (e) => e,
      handcraftAdd,
      // form: { getFieldDecorator },
      priceUpdateList = [],
      priceUpdateLoading,
      fetchPriceUpdateListLoading,
      priceUpdate = (e) => e,
      saveLoading,
      queryDetailHeaderLoading,
      submitDetailLoading,
      deleteDeliveryLoading,
      //  enumMap: { batchMaintain = [] },
      checkInvOrganizationLoading,
      headerInfo,
      // statusCode,
      fetchDetailHeader,
      onChangeListData,
      customizeForm,
      validateItemAndInv,
    } = this.props;
    const { poHeaderId } = headerInfo;
    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0)));
    const { visible, batchModalVisible, calcLoading } = this.state;
    const rowSelection = {
      selectedRowKeys: selectedListRows.map((n) => n.poLineId),
      onChange: handleRowSelectedChange,
    };
    const editTableProps = {
      loading:
        loading ||
        // priceListloading ||
        fetchSettingsLoading ||
        calcLoading ||
        fetchNewPriceLibDataLoading ||
        fetchPriceUpdateListLoading,
      columns,
      dataSource,
      pagination,
      rowSelection,
      bordered: true,
      rowKey: 'poLineId',
      onDataChange: this.hasChangeData,
      onChange: (page) => handleChangePagination(page),
      scroll: { x: scrollX, y: 'calc(100vh - 390px)' },
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
    // const maintenanceCom = this.getMaintenanceCom(
    //   selectOptionKey,
    //   benchmarkPriceType,
    //   defaultPrecision
    // );
    const code = 'SODR.ORDER_CREATE_LINE_LIST.PO_LINE_LOCATION';
    // const batchMaintainOpts = batchMaintain.map((item) => {
    //   return {
    //     meaning: item.meaning,
    //     value: item.value,
    //   };
    // });
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
        <Form layout="inline">
          <Button type="primary" onClick={handcraftAdd} loading={addDetailLinesLoading}>
            {intl.get(`hzero.common.button.create`).d('新建')}
          </Button>
          <TooltipButton
            tipTitle={intl
              .get(`sodr.common.view.message.deleteSelectedLine`)
              .d('仅可删除勾选的订单行')}
            buttonText={intl.get(`hzero.common.button.delete`).d('删除')}
            btnProps={{
              onClick: handleCancelLines,
              loading:
                deleteDetailLinesLoading ||
                deleteLineRemoteLoaing ||
                saveLoading ||
                loading ||
                queryDetailHeaderLoading ||
                submitDetailLoading ||
                deleteDeliveryLoading,
              disabled: isArray(selectedListRows) && isEmpty(selectedListRows),
            }}
          />
          <Button
            onClick={priceUpdate}
            loading={priceUpdateLoading}
            disabled={isEmpty(priceUpdateList)}
          >
            {intl
              .get(`sodr.quotePurchaseRequisition.view.button.quoteTheLatestPrice`)
              .d('引用最新价格')}
          </Button>
          <CommonImport
            businessObjectTemplateCode="SPUC.PO_LINE_IMPORT"
            prefixPatch={SRM_SPUC}
            refreshButton
            buttonText={intl.get(`hzero.common.button.newBatchImport`).d('(新)批量导入')}
            args={{ poHeaderId }} // 上传参数
            buttonProps={{
              icon: 'archive',
              disabled: !poHeaderId,
              permissionList: [
                {
                  code: `srm.po-admin.po.po-change.ps.button.purchaseline.newimport`,
                  type: 'button',
                  meaning: '订单维护-手工创建-明细行新版导入按钮',
                },
              ],
            }} // 导入按钮属性
            successCallBack={(page) => {
              handleChangePagination(page);
              fetchDetailHeader();
            }} // 导入成功的回调
          />
          <Button
            icon="download"
            onClick={this.handleImport}
            permissionList={[
              {
                code: `srm.po-admin.po.po-change.ps.button.purchaseline.import`,
                type: 'button',
                meaning: '订单维护-手工创建-明细行导入按钮',
              },
            ]}
          >
            {intl.get('sodr.common.view.button.batchImport').d('批量导入')}
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
                  : intl.get('sodr.quotePurchase.view.allBatchMaintain').d('批量编辑当前页全部数据')
              }
            >
              <Button
                data-code="search"
                htmlType="submit"
                type="primary"
                onClick={this.handleBatchMaintenance}
                disabled={dataSource.length === 0}
                loading={checkInvOrganizationLoading}
              >
                {selectedListRows.length > 0
                  ? intl.get(`sodr.quotePurchase.view.button.tickaBtchEdit`).d('勾选批量编辑')
                  : intl.get(`sodr.quotePurchase.model.quotePurchase.batchMaintain`).d('批量编辑')}
              </Button>
            </Tooltip>
          </Form.Item>
          {/* {maintenanceCom} */}
          {/* <Form.Item>
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
                <Option key={n.value} value={n.value}>
                  {n.meaning}
                </Option>
              ))}
            </Select>
          </Form.Item> */}
        </Form>
        {code && customizeTable ? (
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
