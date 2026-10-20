/**
 * LineCreation - 按行引用创建
 * @date: 2019-02-20
 * @author: guochaochao <chaochao.guo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import { withRouter } from 'react-router-dom';
import { Bind, Debounce } from 'lodash-decorators';
import { stringify } from 'querystring';
import { isArray, isEmpty, isNumber, sum, isNil } from 'lodash';
import {
  Form,
  Input,
  Button,
  Modal,
  InputNumber,
  Tooltip,
  DatePicker,
  Checkbox,
  Select,
} from 'hzero-ui';
import moment from 'moment';

import Lov from 'components/Lov';
import DocFlow from '_components/DocFlow';
import EditTable from 'components/EditTable';
// import UploadModal from 'components/Upload';
import UploadModal from 'srm-front-boot/lib/components/Upload';
import intl from 'utils/intl';
import {
  getDateFormat,
  getCurrentOrganizationId,
  getEditTableData,
  getUserOrganizationId,
  getCurrentUserId,
} from 'utils/utils';
import { DATETIME_MIN } from 'utils/constants';
import { dateRender } from 'utils/renderer';
// import notification from 'utils/notification';
import { math } from 'choerodon-ui/dataset';
import BigNumber from 'bignumber.js';

import {
  formatAumont,
  parseAumont,
  redirectToOther,
  getDynamicLabel,
  conversionUpdateForH0,
  getSecondaryUomFormItem,
  conversionUpdateUomIdForH0,
} from '@/routes/components/utils';
import { NOT_CHINA_PHONE, PHONE } from 'utils/regExp';
import { TooltipInput, TooltipLov } from '@/routes/components/TooltipFormItem';
import { BUCKET_NAME, MAX_QUAN_NUMBER, LINE_DIRECTORY } from '@/routes/components/utils/constant';
import ItemInfo from './ItemInfo';
import PhoneRender from '../../components/PhoneRender';
import BatchEditModal from '../../components/BatchEditModal';
import styles from './Header.less';

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
@Form.create({ fieldNameProp: null })
@withRouter
@connect(({ loading, quotePurchaseRequisition }) => ({
  priceListloading: loading.effects['quotePurchaseRequisition/priceList'],
  fetchSettingsLoading: loading.effects['quotePurchaseRequisition/fetchSettings'],
  updateStateLoading: loading.effects['quotePurchaseRequisition/updateState'],
  calculateDoubleUomLoading: loading.effects['quotePurchaseRequisition/calculateDoubleUom'],
  quotePurchaseRequisition,
}))
export default class PurchaseLineInfo extends Component {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      invInventoryVisible: new Map(),
      invLocationVisible: new Map(),
      visible: false,
      // selectedListRows: [],
      userId: getCurrentUserId(),
      tenantId: getCurrentOrganizationId(),
      organizationId: getUserOrganizationId(),
      //  selectOptionKey: 'needByDate', // 批量维护选中字段
      batchModalVisible: false,
    };
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
      if (item.prLineId === record.prLineId) {
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

  /**
   * handleCancelLines - 取消行
   */
  // @Bind()
  // handleCancelLines() {
  //   // const { selectedListRows = [] } = this.state;
  //   const { dataSource, handleDeleteLines, selectedListRows = [] } = this.props;
  //   Modal.confirm({
  //     title: intl.get(`sodr.common.model.common.confirmDestroy`).d('是否确认取消行'),
  //     onOk: () => {
  //       const selectedRowKeys = selectedListRows.map(item => item.prLineId);
  //       const filtered = dataSource.filter(item => !selectedRowKeys.includes(item.prLineId));
  //       handleDeleteLines(filtered, selectedListRows);
  //       this.setState({
  //         selectedListRows: [...selectedListRows.map(n => ({ ...n, poLineLocationDeleteFlag: 1 }))],
  //       });
  //     },
  //   });
  // }

  /**
   * add - 新增信息行事件
   */
  @Bind()
  add() {
    this.setState({
      visible: true,
    });
  }

  /**
   * onItemInfoModalOk - 新增信息行弹窗确定按钮事件
   */
  @Bind()
  onItemInfoModalOk() {
    const { handleAddLines, dataSource, onHandleAppendValidate, selectedListRows } = this.props;
    if (this.itemInfo && !isEmpty((this.itemInfo.state || {}).selectedListRows)) {
      // const { selectedListRows } = this.state;
      const { selectedListRows: modalList } = this.itemInfo.state;
      const transLines = getEditTableData(dataSource).map((item) => {
        const { needByDate } = item;
        return {
          ...item,
          needByDate: needByDate ? moment(needByDate).format(DATETIME_MIN) : undefined,
        };
      });
      const poLineDetailDTOList = [...transLines, ...selectedListRows, ...modalList].map((item) => {
        if (item._status === 'update') {
          const { poLineId, invOrganizationId } = item;
          return { poLineId, invOrganizationId };
        }
        const { prLineId, prHeaderId } = item;
        return { prLineId, prHeaderId };
      });
      onHandleAppendValidate(poLineDetailDTOList).then((res) => {
        if (res) {
          handleAddLines(this.itemInfo.state.selectedListRows);
          this.closeItemInfoModal();
        }
      });
    }
  }

  /**
   * closeItemInfoModal - 关闭弹窗
   */
  @Bind()
  closeItemInfoModal() {
    this.setState({
      visible: false,
    });
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

  // /**
  //  * 选中行改变回调
  //  * @param {Array} newSelectedRowKeys
  //  * @param {Object} newSelectedRows
  //  */
  // @Bind()
  // handleRowSelectedChange(_, selectedRows) {
  //   this.setState({ selectedListRows: selectedRows });
  // }

  /**
   * 物料改变回调
   * @param {String} value
   * @param {Object} lovRecord
   * @param {Object} record
   */
  @Bind()
  handleItemOnChange(value, dataList, record, isMall) {
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
    } = dataList;
    // 判断是否为目录化商城||电商商城
    if (isMall) {
      setFieldsValue({
        itemCode,
        itemName,
        categoryId,
        categoryName,
        uomId,
        uomName,
        specifications,
        model,
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
              categoryId,
              categoryName,
              ...currencyCodeJson,
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
              chartVersion: drawingVersion,
            };
          }
          return item;
        } else if (item.prLineId) {
          if (item.prLineId === record.prLineId) {
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
              chartVersion: drawingVersion,
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
        ...currencyCodeJson,
        uomId,
        uomName,
        enteredTaxIncludedPrice,
        drawingVersion,
        chartVersion: drawingVersion,
      });
    }
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
      doubleUnitEnabled,
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
      uomCode,
      uomCodeAndName,
      currencyCode,
      taxRate,
      taxId,
      commonName,
      model,
      specifications,
      brand,
      receiveToleranceQuantity,
      receiveToleranceQuantityType,
    } = dataList;
    const sodrEnabled = doubleUnitEnabled !== 0;
    const currencyCodeJson = currencyCode ? { currencyCode } : null;
    const basicUomObj = { uomId, uomCode, uomName, uomCodeAndName };
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
          businessKeyField: 'poLineId',
          query: this.calculateDoubleUom,
        });
        if (!result) return false;
      }
    };
    const listCommonDataSource = dataSource.map((item) => {
      if (item.poLineId) {
        if (item.poLineId === record.poLineId) {
          return {
            ...item,
            // itemId,
            itemCode,
            itemName,
            uomName,
            uomId,
            uomCodeAndName,
            ...secondaryUomObj,
            categoryId,
            categoryName,
            ...currencyCodeJson,
            taxRate,
            taxId,
            commonName,
            model,
            specifications,
            brand,
          };
        }
        return item;
      } else if (item.prLineId) {
        if (item.prLineId === record.prLineId) {
          return {
            ...item,
            // itemId,
            itemCode,
            itemName,
            categoryName,
            categoryId,
            uomName,
            uomId,
            uomCodeAndName,
            ...secondaryUomObj,
            ...currencyCodeJson,
            taxRate,
            taxId,
            commonName,
            model,
            specifications,
            brand,
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
      ...secondaryUomObj,
      receiveToleranceQuantity,
      receiveToleranceQuantityType,
      // enteredTaxIncludedPrice,
    });
    callback();
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
        dataSource.filter((i) => i.prLineId === selectedListRows[0]?.prLineId)[0]?.invOrganizationId
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
    record.$form.setFieldsValue({
      invInventoryId: value,
      inventoryName: lovRecord.inventoryName,
      invLocationId: undefined,
    });
    const listDataSource = dataSource.map((item) => {
      if (item.poLineId === record.poLineId) {
        return {
          ...item,
          invLocationId: undefined,
          locationName: undefined,
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
  // async handleMaintain() {
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
  //   const {
  //     needByDate,
  //     [selectOptionKey]: selectOptionIndex,
  //     lineRemark,
  //     // receiveToleranceQuantity,
  //   } = fieldsValue;
  //   let newDataSource;
  //   if (selectOptionIndex || lineRemark) {
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
  //       if (await validateItemAndInv(selectOptionIndex, selectedListRows)) return;
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
  //         // batchMaintainSelectOptionIndex: selectOptionIndex,
  //         // batchMaintainSelectOptionName: selectOptionValues.organizationName,
  //       });
  //     } else if (selectOptionKey === 'enteredTaxIncludedPrice') {
  //       newDataSource = dataSource.map((item) => {
  //         const priceFlag =
  //           item.$form.getFieldValue('priceLibraryId') && item.$form.getFieldValue('priceTaxId');
  //         if ((isEmpty(selectedListRows) || key.includes(item.poLineId)) && !priceFlag) {
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
  //         if ((isEmpty(selectedListRows) || key.includes(item.poLineId)) && !priceFlag) {
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

  // @Bind()
  // resetFieldsForm(record) {
  //   const { form } = this.props;
  //   const { resetFields } = form;
  //   recorder
  //   resetFields('invInventoryName');
  // }

  // /**
  //  * 不含税单价显示
  //  */
  // @Bind()
  // showUnitPrice(record) {
  //   const { headerInfo } = this.props;
  //   const { sourceBillTypeCode } = headerInfo;
  //   console.log('sourceBillTypeCode', sourceBillTypeCode);
  //   if (sourceBillTypeCode === 'PURCHASE_ORDER') {
  //     // 引用价格库
  //     if (record.$form.getFieldValue('priceLibraryId') || record.priceLibraryId) {
  //       return record.unitPrice;
  //     } else {
  //       return numberRender(record.unitPrice, 2);
  //     }
  //   } else {
  //     return record.unitPrice;
  //   }
  // }

  // /**
  //  * 含税单价显示
  //  */
  // @Bind()
  // showEnterPrice(record) {
  //   const { headerInfo } = this.props;
  //   const { sourceBillTypeCode } = headerInfo;
  //   console.log('sourceBillTypeCode', sourceBillTypeCode);
  //   if (sourceBillTypeCode === 'PURCHASE_ORDER') {
  //     if (record.$form.getFieldValue('priceLibraryId') || record.priceLibraryId) {
  //       return numberRender(record.enteredTaxIncludedPrice, 2);
  //     } else {
  //       return record.enteredTaxIncludedPrice;
  //     }
  //   } else {
  //     return record.enteredTaxIncludedPrice;
  //   }
  // }

  /**
   * 表面处理lov改变回调函数
   * @param {Object} e
   * @param {Object} record
   */
  @Bind()
  handleChangeSurface(e, record) {
    const { onChangeListData, dataSource } = this.props;
    let listCommonDataSource = [];
    listCommonDataSource = dataSource.map((item) => {
      if (item.poLineId === record.poLineId) {
        return {
          ...item,
          surfaceTreatFlag: e.target.checked ? 1 : 0,
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
    // const { sourceBillTypeCode } = headerInfo;
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
    // if (sourceBillTypeCode === 'SOURCE') {
    //   onChangeListDataFlag(listCommonDataSource);
    // } else {
    //   onChangeListData(listCommonDataSource);
    // }
    onChangeListData(listCommonDataSource);
  }

  @Bind()
  handlePrice(record) {
    const { showPriceModal } = this.props;
    showPriceModal(record);
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
        action: intl.get('hzero.common.viewtitle.batchImport').d('批量导入'),
        backPath: `/sodr/purchase-order-maintain/quote-purchase-requisition/line-creation?poHeaderId=${poHeaderId}&source=maintain`,
        args: JSON.stringify({
          poHeaderId,
        }),
      }),
    };
    this.props.history.push(option);
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
      returnOrderFlag,
      doubleUnitEnabled,
      afterOpenUploadModal,
      // fetchFlag, // 用来判断头信息改变供应商lov或者业务实体lov时调用接口返回值为空的情况
      enumMap: { internationalTelCode = [], excessOrderType = [], purchaseLineType = [] },
      handleTranslate,
      form,
    } = this.props;
    const { getFieldValue } = form;
    const { sourceBillTypeCode, ouCode } = headerInfo;
    const {
      userId,
      tenantId,
      organizationId,
      invInventoryVisible,
      invLocationVisible,
    } = this.state;
    const isCatalogue = poSourcePlatform === 'CATALOGUE'; // 目录化商城
    const isOtherPlatform =
      poSourcePlatform !== 'CATALOGUE' &&
      poSourcePlatform !== 'ERP' &&
      poSourcePlatform !== 'SRM' &&
      poSourcePlatform !== 'SHOP' &&
      poSourcePlatform !== 'E-COMMERCE';
    // const isHandCreate = sourceBillTypeCode === 'PURCHASE_ORDER'; // 手工创建订单
    const isRequest = sourceBillTypeCode === 'PURCHASE_REQUEST';
    const isContract = sourceBillTypeCode === 'CONTRACT_ORDER';
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
    const columns = {
      contract: [
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
        {
          title: intl.get(`sodr.quotePurchase.model.quotePurchase.displayLineNum`).d('行号'),
          dataIndex: 'displayLineNum',
          width: 80,
        },
        {
          title: intl.get(`sodr.quotePurchase.model.quotePurchase.displayNum`).d('发运号'),
          dataIndex: 'displayLineLocationNum',
          width: 90,
        },
        {
          title: intl.get(`sodr.quotePurchase.model.quotePurchase.organizationName`).d('收货组织'),
          dataIndex: 'invOrganizationId',
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
                    onChange={(value, dataList) =>
                      this.handleOriginationLovChange(value, 'invOrganizationId', record, dataList)
                    }
                    code="SPUC.SMDM.INV_ORG"
                    textValue={record.invOrganizationName}
                    textField="invOrganizationName"
                    queryParams={{
                      enabledFlag: 1,
                      tenantId,
                      ouId: form.getFieldValue('ouId'),
                      itemId: record.$form.getFieldValue('itemId'),
                    }}
                    disabled={
                      record.invOrganizationId && !this.props?.headerForm?.isFieldTouched('ouId')
                    }
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
            ['create', 'update'].includes(record._status) ? (
              <FormItem>
                {record.$form.getFieldDecorator('itemId', {
                  rules: [
                    {
                      required: !(
                        poSourcePlatform === 'CATALOGUE' || poSourcePlatform === 'E-COMMERCE'
                      ),
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
                    code="SPUC.ITEM_PRICE_LIBRARY"
                    onChange={(value, dataList) => {
                      this.itemOnChange(value, dataList, record);
                    }}
                    lovOptions={{ valueField: 'itemId', displayField: 'itemCode' }}
                    textValue={record.$form.getFieldValue('itemCode') || record.itemCode}
                    queryParams={{
                      organizationId,
                      tenantId,
                      supplierCompanyId,
                      priceShieldFlag:
                        record.returnedFlag !== 1 ||
                        record.$form.getFieldValue('returnedFlag') !== 1
                          ? tieredPricingFlag
                          : null,
                      companyId,
                      ouId,
                      ouCode,
                      companyCode: getFieldValue('companyCode'),
                      orderTypeCode: getFieldValue('orderTypeCode'),
                      invOrganizationId: record.$form.getFieldValue('invOrganizationId'),
                    }}
                    originTenantId={getCurrentOrganizationId()}
                    disabled={isCatalogue || record.itemId || isRequest}
                  />
                )}
                {record.$form.getFieldDecorator('itemCode', {
                  initialValue: record.itemCode,
                })}
              </FormItem>
            ) : (
              val
            ),
        },
        {
          title: intl.get(`sodr.quotePurchase.model.quotePurchase.itemName`).d('物料名称'),
          dataIndex: 'itemName',
          width: 120,
          render: (val) => <Tooltip title={val}>{val}</Tooltip>,
        },
        {
          title: intl.get(`sodr.common.model.common.categoryName`).d('物料分类'),
          width: 130,
          dataIndex: 'categoryId',
          render: (val, record) => (
            <FormItem>
              {record.$form.getFieldDecorator('categoryId', {
                rules: [
                  {
                    required: !isCatalogue,
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
                  textValue={record.$form.getFieldValue('categoryName') || record.categoryName}
                  textField="categoryName"
                  lovOptions={{ valueField: 'categoryId', displayField: 'categoryName' }}
                  queryParams={{
                    tenantId,
                    enabledFlag: 1,
                    hzeroUIFlag: 1,
                    itemId: record.$form.getFieldValue('itemId'),
                    businessObjectCode: 'SRM_C_SRM_SODR_PO_HEADER',
                  }}
                  // disabled={isCatalogue || isOtherPlatform}
                  tableDsProps={{
                    record: {
                      dynamicProps: {
                        selectable: (_record) => _record.get('isCheck') !== false,
                      },
                    },
                  }}
                  disabled={record.categoryId && record.itemId}
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
          width: 120,
        },
        doubleUnitEnabled && {
          title: intl.get(`sodr.quotePurchase.model.quotePurchase.quantity`).d('数量'),
          dataIndex: 'secondaryQuantity',
          width: 120,
          render: (val, record) => (
            <FormItem>
              {record.$form.getFieldDecorator('secondaryQuantity', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`sodr.quotePurchase.model.quotePurchase.quantity`).d('数量'),
                    }),
                  },
                ],
                initialValue: val,
              })(
                <InputNumber
                  style={{ width: '100%' }}
                  inputChinese={false}
                  max={MAX_QUAN_NUMBER}
                  disabled={!doubleUnitEnabled}
                  parser={(value) => parseAumont(value, record.secondaryUomPrecision)}
                  allowThousandth="true"
                  onChange={(value) => this.handleSecondaryNumChange(value, record)}
                />
              )}
            </FormItem>
          ),
        },
        doubleUnitEnabled && {
          title: intl.get(`sodr.quotePurchase.model.quotePurchase.uomName`).d('单位'),
          width: 140,
          dataIndex: 'secondaryUomId',
          render: (val, record) => {
            return doubleUnitEnabled === 2 && ['create', 'update'].includes(record._status) ? (
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
                    lovOptions={{ valueField: 'uomId', displayField: 'uomCodeAndName' }}
                    textField="secondaryUomCodeAndName"
                    queryParams={{
                      itemId: record.$form.getFieldValue('itemId'),
                      primaryUomId: record.$form.getFieldValue('uomId'),
                    }}
                    disabled={!doubleUnitEnabled}
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
              <FormItem>
                {record.$form.getFieldDecorator('secondaryUomId', {
                  initialValue: val,
                })(<span>{record.secondaryUomCodeAndName}</span>)}
              </FormItem>
            );
          },
        },
        {
          title: getDynamicLabel(doubleUnitEnabled, 'quantity'),
          dataIndex: 'quantity',
          width: 120,
          render: (val, record) => (
            <FormItem>
              {record.$form.getFieldDecorator('quantity', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`sodr.quotePurchase.model.quotePurchase.quantity`).d('数量'),
                    }),
                  },
                ],
                initialValue: val,
              })(
                <InputNumber
                  disabled={doubleUnitEnabled}
                  max={MAX_QUAN_NUMBER}
                  style={{ width: '100%' }}
                  inputChinese={false}
                  parser={(value) => parseAumont(value, record.uomPrecision)}
                  allowThousandth="true"
                  onChange={(value) => {
                    if (!doubleUnitEnabled) {
                      record.$form.setFieldsValue({ secondaryQuantity: value });
                    }
                  }}
                />
              )}
              {!doubleUnitEnabled &&
                record.$form.getFieldDecorator('secondaryQuantity', {
                  initialValue: record.secondaryQuantity,
                })}
            </FormItem>
          ),
        },
        {
          title: getDynamicLabel(doubleUnitEnabled, 'uom'),
          width: 120,
          dataIndex: 'uomId',
          render: (val, record) => (
            <FormItem>
              {record.$form.getFieldDecorator('uomId', {
                initialValue: val,
              })(<span>{record.uomCodeAndName}</span>)}
            </FormItem>
          ),
        },
        {
          title: intl.get(`sodr.quotePurchase.model.quotePurchase.currencyCode`).d('币种'),
          width: 120,
          dataIndex: 'currencyCode',
        },
        {
          title: intl.get(`sodr.quotePurchase.model.quotePurchase.taxRate`).d('税率（%）'),
          width: 120,
          dataIndex: 'taxId',
          render: (val, record) => (
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
                  // textValue={record.$form.getFieldValue('taxRate') || record.taxRate}
                  lovOptions={{ valueField: 'taxId', displayField: 'taxRate' }}
                  queryParams={{ enabledFlag: 1, tenantId }}
                  // disabled={
                  //   record.taxId ||
                  //   isCatalogue ||
                  //   isOtherPlatform ||
                  //   record.priceLibraryId ||
                  //   record.$form.getFieldValue('priceLibraryId')
                  // }
                  disabled={
                    isContract || (!isNil(record.taxRate) && !record.$form.isFieldTouched('taxId'))
                  }
                  onChange={(text, values) => handTaxDate(text, values, record)}
                />
              )}
              {record.$form.getFieldDecorator('taxRate', { initialValue: record.taxRate })}
            </FormItem>
          ),
        },
        {
          title: intl.get(`sodr.common.model.common.unitPrice`).d('不含税单价'),
          width: 150,
          dataIndex: 'unitPrice',
          align: 'right',
          render: (val, record) => {
            if (['create', 'update'].includes(record._status)) {
              return (
                <FormItem>
                  {record.$form.getFieldDecorator('unitPrice', {
                    initialValue:
                      record.defaultPrecision && val && !math.isZero(val)
                        ? new BigNumber(
                            math.toFixed(new BigNumber(val), Number(record.defaultPrecision))
                          )
                        : val,
                    rules: [
                      {
                        required:
                          !['E-COMMERCE', 'CATALOGUE'].includes(poSourcePlatform) ||
                          !record.priceLibraryId,
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
                      max={MAX_QUAN_NUMBER}
                      disabled={
                        !isNil(record.unitPrice) && !record.$form.isFieldTouched('unitPrice')
                      }
                      style={{ width: '100%' }}
                      parser={(value) => parseAumont(value, record.defaultPrecision)}
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
            // if (sourceBillTypeCode === 'PURCHASE_REQUEST') {
            //   record.$form.resetFields();
            // }
            if (['create', 'update'].includes(record._status) && !isContract) {
              return (
                <FormItem>
                  {record.$form.getFieldDecorator('enteredTaxIncludedPrice', {
                    initialValue:
                      record.defaultPrecision && val && !math.isZero(val)
                        ? math.toFixed(new BigNumber(val), Number(record.defaultPrecision))
                        : val,
                    rules: [
                      {
                        required:
                          !['E-COMMERCE', 'CATALOGUE'].includes(poSourcePlatform) ||
                          !record.priceLibraryId,
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
                      max={MAX_QUAN_NUMBER}
                      disabled={
                        ['E-COMMERCE', 'CATALOGUE'].includes(poSourcePlatform) ||
                        isOtherPlatform ||
                        record.priceLibraryId ||
                        record.$form.getFieldValue('priceLibraryId') ||
                        record.referPrice === 1 ||
                        (!isNil(val) && !record.$form.isFieldTouched('enteredTaxIncludedPrice'))
                      }
                      style={{ width: '100%' }}
                      parser={(value) => parseAumont(value, record.defaultPrecision)}
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
          title: intl.get(`sodr.common.model.common.unitPriceBatch`).d('每'),
          dataIndex: 'unitPriceBatch',
          width: 140,
          render: (val, record) =>
            ['create', 'update'].includes(record._status) && !isContract ? (
              <FormItem>
                {record.$form.getFieldDecorator('unitPriceBatch', {
                  rules: [
                    {
                      pattern: /^([1-9]\d*(\.\d*[1-9])?)|(0\.\d*[1-9])$/,
                      message: intl.get(`sodr.common.model.common.sumZero`).d('数值需大于零'),
                    },
                    {
                      required: (record.$form.getFieldValue('requiredFieldNames') || []).includes(
                        'unitPriceBatch'
                      ),
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get('sodr.common.model.common.unitPriceBatch').d('每'),
                      }),
                    },
                  ],
                  initialValue: record.unitPriceBatch,
                })(
                  <InputNumber
                    min={0}
                    max={MAX_QUAN_NUMBER}
                    disabled={
                      (record.priceLibraryId && record.currencyCode) ||
                      (!isNil(val) &&
                        !isNil(record.$form.isFieldTouched('unitPriceBatch')) &&
                        !math.isZero(record.$form.isFieldTouched('unitPriceBatch')))
                    }
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
          title: intl.get(`sodr.quotePurchase.model.quotePurchase.invInventoryName`).d('收货库房'),
          dataIndex: 'invInventoryId',
          width: 200,
          render: (val, record) =>
            ['create', 'update'].includes(record._status) ? (
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
                      invOrganizationId: record.$form.getFieldValue('invOrganizationId'),
                      organizationId:
                        record.$form.getFieldValue('tmpOrganizationId') || record.tmpOrganizationId,
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
            ['create', 'update'].includes(record._status) ? (
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
            ['create', 'update'].includes(record._status) ? (
              <FormItem>
                {record.$form.getFieldDecorator('needByDate', {
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`sodr.quotePurchase.model.quotePurchase.needByDate`)
                          .d('需求日期'),
                      }),
                    },
                  ],
                  initialValue: record.needByDate ? moment(record.needByDate) : undefined,
                })(<DatePicker format={getDateFormat()} placeholder={null} />)}
              </FormItem>
            ) : (
              dateRender(val)
            ),
        },
        {
          title: intl
            .get(`sodr.quotePurchase.model.quotePurchase.shipToThirdPartyName`)
            .d('送达方'),
          dataIndex: 'shipToThirdPartyName',
          width: 120,
          render: (val, record) =>
            ['create', 'update'].includes(record._status) ? (
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
            ['create', 'update'].includes(record._status) ? (
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
            ['create', 'update'].includes(record._status) ? (
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
          title: intl.get(`sodr.quotePurchase.model.quotePurchase.sumProject`).d('总账科目'),
          width: 120,
          dataIndex: 'accountSubjectId',
          render: (val, record) =>
            ['create', 'update'].includes(record._status) ? (
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
                {record.$form.getFieldDecorator('wbs', {
                  initialValue: record.wbs,
                })}
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
          title: intl.get(`sodr.orderMaintain.sourceFrom.displayPrNum`).d('采购申请号|行号'),
          width: 150,
          dataIndex: 'displayPrNumAndDisplayPrLineNum',
          // render: (val, record) => (val ? `${record.displayPrNum}|${record.displayPrLineNum}` : ''),
        },
        {
          title: intl.get(`sodr.orderMaintain.sourceFrom.contractNum`).d('采购协议号|行号'),
          width: 150,
          dataIndex: 'contractNum',
          render: (val, record) => (
            <FormItem>
              {record.$form.getFieldDecorator('contractNum', {
                initialValue: val === '|' ? '' : val,
              })(
                <Lov
                  code="SPUC.PO_HOLD_PR"
                  lovOptions={{ valueField: 'contractNum', displayField: 'contractNum' }}
                  textField="contractNum"
                  disabled
                  // onChange={(value, list) => this.handleContractNum(value, list, record)}
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
          ),
        },
        {
          title: intl.get(`sodr.orderMaintain.sourceFrom.sourceCodeNum`).d('寻源单号|行号'),
          width: 150,
          dataIndex: 'sourceNumAndLine',
          render: (val, record) => (
            <a onClick={() => redirectToOther('source', record)}>
              {val === '|' ? '' : record.sourceNumAndLine || record.sourceCodeNum}
            </a>
          ),
        },

        {
          title: intl.get(`sodr.quotePurchase.model.quotePurchase.purReqAppliedName`).d('申请人'),
          width: 120,
          dataIndex: 'prRequestedName',
          render: (_, record) => record.purReqAppliedName,
        },
        {
          title: intl.get(`sodr.quotePurchase.model.quotePurchase.accountType`).d('账户分配类别'),
          width: 150,
          dataIndex: 'accountAssignTypeId',
          render: (val, record) => (
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
          ),
        },
        {
          title: intl.get(`hzero.common.remark`).d('备注'),
          dataIndex: 'remark',
          width: 120,
          render: (val, record) => (
            <FormItem>
              {record.$form.getFieldDecorator('remark', {
                initialValue: val,
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
                    max: 480,
                    message: intl.get('hzero.common.validation.max', {
                      max: 480,
                    }),
                  },
                ],
              })(<TooltipInput tipValue={record.$form.getFieldValue('remark')} />)}
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
              icon={false}
              afterOpenUploadModal={(uuid) => afterOpenUploadModal(uuid, record)}
            />
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
          title: intl.get(`sodr.quotePurchase.model.quotePurchase.receiveTelNum`).d('联系人电话'),
          width: 300,
          dataIndex: 'receiveTelNum',
          render: (val, record) => {
            return ['create', 'update'].includes(record._status) ? (
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
        {
          title: intl.get(`sodr.common.model.common.receiveToleranceQuantityType`).d('允差类型'),
          width: 150,
          dataIndex: 'receiveToleranceQuantityType',
          render: (val, record) => (
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
          ),
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
              record.subSupplierName
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
    };
    if (sourceBillTypeCode === 'CONTRACT_ORDER' || sourceBillTypeCode === 'SOURCE') {
      return columns.contract.filter((i) => i);
    } else {
      return [];
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
  @Bind()
  handleBatchMaintenance() {
    this.setState({
      batchModalVisible: true,
    });
  }

  // @Bind()
  // getMaintenanceCom(key, benchmarkPriceType) {
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
  closeModel() {
    this.setState({ batchModalVisible: false });
  }

  render() {
    const columns = this.getColumns();
    const code = this.getCustomizeTableCode();
    const {
      loading,
      remote,
      priceListloading,
      fetchSettingsLoading,
      // fetchList,
      // handcraftAdd,
      fetchDetailCreateList,
      queryCreateListLoading,
      // addDetailLinesLoading,
      deleteLineRemoteLoaing,
      calculateDoubleUomLoading,
      validating,
      pagination = {},
      dataSource = [],
      headerInfo,
      customizeTable,
      // form: { getFieldDecorator },
      handleRowSelectedChange = (e) => e,
      handleCancelLines = (e) => e,
      selectedListRows = [],
      handleChangePagination = (e) => e,
      // onDataChange = e => e,
      // enumMap: { batchMaintain = [] },
      checkInvOrganizationLoading,
      onChangeListData,
      customizeForm,
      validateItemAndInv,
    } = this.props;
    // const { sourceBillTypeCode } = headerInfo;
    const { visible, batchModalVisible } = this.state;
    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0))) + 300;
    const rowSelection = {
      selectedRowKeys: selectedListRows.map((n) => n.poLineId),
      onChange: handleRowSelectedChange,
    };
    const editTableProps = {
      loading: loading || priceListloading || fetchSettingsLoading || calculateDoubleUomLoading,
      columns,
      dataSource,
      pagination,
      rowSelection,
      bordered: true,
      rowKey: 'poLineId',
      onChange: (page) => handleChangePagination(page),
      // onDataChange,
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
    // const { benchmarkPriceType } = headerInfo;
    // const maintenanceCom = this.getMaintenanceCom(selectOptionKey, benchmarkPriceType);
    // const batchMaintainOpts = batchMaintain.map((item) => {
    //   return {
    //     meaning: item.meaning,
    //     value: item.value,
    //   };
    // });
    // const batchMaintainFilOpts = batchMaintainOpts.filter(
    //   (item) => item.value !== 'enteredTaxIncludedPrice' && item.value !== 'unitPrice'
    // );
    return (
      <div className={styles['purchase-application']}>
        {/* {sourceBillTypeCode === 'PURCHASE_ORDER' && ( */}
        <Form layout="inline">
          {/* <Button
              type="primary"
              onClick={sourceBillTypeCode === 'PURCHASE_ORDER' ? handcraftAdd : this.add}
              loading={addDetailLinesLoading}
            >
              {intl.get(`hzero.common.button.create`).d('新建')}
            </Button>
            <Button
              onClick={handleCancelLines}
              loading={deleteDetailLinesLoading}
              disabled={isArray(selectedListRows) && isEmpty(selectedListRows)}
            >
              {intl.get(`hzero.common.button.delete`).d('删除')}
            </Button>
            <Button icon="download" onClick={this.handleImport}>
              {intl.get('hzero.common.viewtitle.batchImport').d('批量导入')}
            </Button> */}
          <FormItem>
            {remote ? (
              remote.render(
                'SODR.ORDER_MAINTENANCE_SEARCHFORTHESOURCE_RENDER_DEL_BTN',
                <Button
                  type="primary"
                  onClick={handleCancelLines}
                  loading={deleteLineRemoteLoaing}
                  disabled={isArray(selectedListRows) && isEmpty(selectedListRows)}
                >
                  {intl.get(`hzero.common.button.delete`).d('删除')}
                </Button>
              )
            ) : (
              <Button
                type="primary"
                onClick={handleCancelLines}
                loading={deleteLineRemoteLoaing}
                disabled={isArray(selectedListRows) && isEmpty(selectedListRows)}
              >
                {intl.get(`hzero.common.button.delete`).d('删除')}
              </Button>
            )}
          </FormItem>
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
          {/* {maintenanceCom}
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
              {batchMaintainFilOpts.map((n) => (
                <Option key={n.value} value={n.value}>
                  {n.meaning}
                </Option>
              ))}
            </Select>
          </Form.Item> */}
          {/* <Form.Item
              label={intl.get(`sodr.quotePurchase.model.quotePurchase.needByDate`).d('需求日期')}
            >
              {getFieldDecorator(`needByDate`)(
                <DatePicker placeholder={null} format={getDateFormat()} />
              )}
            </Form.Item> */}
        </Form>
        {/* )} */}
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
          hasPriceLibrary={false}
          validateItemAndInv={validateItemAndInv}
        />
      </div>
    );
  }
}
