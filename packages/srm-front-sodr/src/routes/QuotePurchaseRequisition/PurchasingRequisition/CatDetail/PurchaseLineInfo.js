/**
 * index - 按行引用创建-目录化
 * @date: 2020-11-17
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright 2020, Hand
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import { withRouter } from 'react-router-dom';
import { Bind } from 'lodash-decorators';
import { stringify } from 'querystring';
import { isNumber, sum, isEmpty } from 'lodash';
import { Form, Input, InputNumber, Tooltip, DatePicker, Checkbox, Select, Button } from 'hzero-ui';
import moment from 'moment';
import { math } from 'choerodon-ui/dataset';
import BigNumber from 'bignumber.js';

import Lov from 'components/Lov';
import DocFlow from '_components/DocFlow';
import EditTable from 'components/EditTable';
// import UploadModal from 'components/Upload';
// import notification from 'utils/notification';
import UploadModal from 'srm-front-boot/lib/components/Upload';
import intl from 'utils/intl';
import {
  getDateFormat,
  getCurrentOrganizationId,
  // getEditTableData,
  getUserOrganizationId,
} from 'utils/utils';
// import { DATETIME_MIN } from 'utils/constants';
// import { numberRender } from 'utils/renderer';

// import ItemInfo from './ItemInfo';
import CustomSpecModal from '@/routes/QuotePurchaseRequisition/components/CustomSpecModal';
import {
  formatAumont,
  parseAumont,
  redirectToOther,
  formatNumber,
  getDynamicLabel,
  getSecondaryUomFormItem,
} from '@/routes/components/utils';
import { TooltipInput, TooltipLov } from '@/routes/components/TooltipFormItem';
import { BUCKET_NAME, MAX_QUAN_NUMBER, LINE_DIRECTORY } from '@/routes/components/utils/constant';
import styles from './Header.less';
import BatchEditModal from '../../components/BatchEditModal';

const FormItem = Form.Item;
const { TextArea } = Input;
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
  quotePurchaseRequisition,
}))
export default class PurchaseLineInfo extends Component {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      invInventoryVisible: new Map(),
      invLocationVisible: new Map(),
      // visible: false,
      // selectedListRows: [],
      tenantId: getCurrentOrganizationId(),
      organizationId: getUserOrganizationId(),
      // selectOptionKey: 'needByDate', // 批量维护选中字段
      customVisable: false,
      customData: [],
      specsJsonType: 'custom',
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
      doubleUnitEnabled,
      // priceShieldFlag, // 配置中心是否引用物料价格信息记录
    } = this.props;
    const sodrEnabled = doubleUnitEnabled !== 0;
    const { setFieldsValue, resetFields } = record.$form;
    const {
      itemId,
      itemCode,
      itemName,
      categoryName,
      categoryId,
      uomName,
      uomCode,
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
      uomCodeAndName,
      receiveToleranceQuantity,
      receiveToleranceQuantityType,
    } = dataList;
    const basicUomObj = { uomId, uomCode, uomName, uomCodeAndName };
    const secondaryUomObj = getSecondaryUomFormItem({
      record,
      sodrEnabled,
      basicUomObj,
      lov: dataList,
    });
    // 判断是否为目录化商城||电商商城
    if (isMall) {
      setFieldsValue({
        itemCode,
        itemName,
        categoryId,
        categoryName,
        uomId,
        uomName,
        uomCodeAndName,
        ...secondaryUomObj,
        specifications,
        model,
        receiveToleranceQuantity,
        receiveToleranceQuantityType,
      });
      if (isEmpty(dataList)) {
        resetFields([
          'secondaryUomId',
          'secondaryUomCode',
          'secondaryUomName',
          'secondaryUomPrecision',
          'secondaryUomCodeAndName',
          'uomCodeAndName',
          'uomPrecision',
          'uomCode',
          'uomName',
          'uomId',
        ]);
      }
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
        uomCodeAndName,
        enteredTaxIncludedPrice,
        drawingVersion,
        chartVersion: drawingVersion,
        receiveToleranceQuantity,
        receiveToleranceQuantityType,
      });
    }
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
      // itemId,
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
            // itemId,
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
    const { [field]: oldValue } = dataSource;
    const { receiveToleranceQuantity, receiveToleranceQuantityType } = dataList || {};
    recordSetFieldsValue({
      receiveToleranceQuantity,
      receiveToleranceQuantityType,
    });
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
      recordSetFieldsValue({ tmpOrganizationId: value });
    }
    record.$form.resetFields('invLocationId');
    record.$form.resetFields('invInventoryId');
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
  //     // receiveToleranceQuantity,
  //     lineRemark,
  //   } = fieldsValue;
  //   let newDataSource;
  //   if (
  //     selectOptionIndex ||
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
    const { onChangeListDataFlag, onChangeListData, dataSource, headerInfo } = this.props;
    const { sourceBillTypeCode } = headerInfo;
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
    if (sourceBillTypeCode === 'SOURCE') {
      onChangeListDataFlag(listCommonDataSource);
    } else {
      onChangeListData(listCommonDataSource);
    }
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
  getColumns() {
    const {
      handTaxDate,
      headerInfo,
      supplierCompanyId,
      poSourcePlatform,
      tieredPricingFlag,
      ouId,
      companyId,
      // setting,
      returnOrderFlag,
      doubleUnitEnabled,
      afterOpenUploadModal,
      enumMap: { excessOrderType = [] },
      form: { getFieldValue },
      // fetchFlag, // 用来判断头信息改变供应商lov或者业务实体lov时调用接口返回值为空的情况
    } = this.props;
    const { sourceBillTypeCode, unSaveEnable, ouCode, companyCode } = headerInfo;
    const { tenantId, organizationId, invInventoryVisible, invLocationVisible } = this.state;
    const isCatalogue = poSourcePlatform === 'CATALOGUE'; // 目录化商城
    const isMall = poSourcePlatform === 'CATALOGUE' || poSourcePlatform === 'E-COMMERCE';
    const isRequest = sourceBillTypeCode === 'PURCHASE_REQUEST';
    const Modifiable = ![1, 2].includes(unSaveEnable);
    const excessOrderTypes = excessOrderType.map((item) => {
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
          title: intl
            .get(`sodr.quotePurchaseRequisition.view.message.projectCategory`)
            .d('项目类别'),
          dataIndex: 'projectCategory',
          width: 200,
          render: (_, record) =>
            ['create', 'update'].includes(record._status) ? (
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
          dataIndex: 'itemId',
          width: 150,
          render: (val, record) =>
            ['create', 'update'].includes(record._status) ? (
              <FormItem>
                {record.$form.getFieldDecorator(`itemId`, {
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
                    //  onOk={this.handleItemOnOk} PS：回调事件
                    onChange={(value, dataList) => {
                      this.handleItemOnChange(value, dataList, record, isMall);
                    }}
                    originTenantId={getCurrentOrganizationId()}
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
                      companyCode,
                      orderTypeCode: getFieldValue('poTypeCode'),
                      invOrganizationId: record.$form.getFieldValue('invOrganizationId'),
                    }}
                    disabled={record.itemId && isRequest && !isMall}
                  />
                )}
                {record.$form.getFieldDecorator(`itemCode`, { initialValue: record.itemCode })}
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
                {record.$form.getFieldDecorator(`itemName`, {
                  rules: [
                    {
                      // required: !isCatalogue || !record.priceLibraryId,
                      required: !isCatalogue,
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
                      isCatalogue ||
                      record.priceLibraryId ||
                      record.$form.getFieldValue('priceLibraryId') ||
                      (record.itemId && isRequest)
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
            // record.$form.resetFields(['categoryName']);
            return ['create', 'update'].includes(record._status) ? (
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
                    disabled={isCatalogue}
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
                      required: !isCatalogue,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`sodr.quotePurchase.model.quotePurchase.productNum`)
                          .d('商品编码'),
                      }),
                    },
                    {
                      max: 60,
                      message: intl.get('hzero.common.validation.max', {
                        max: 60,
                      }),
                    },
                  ],
                  initialValue: record.productNum,
                })(<Input disabled={isCatalogue} typeCase="upper" inputChinese={false} />)}
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
                      required: !isCatalogue,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`sodr.quotePurchase.model.quotePurchase.productName`)
                          .d('商品名称'),
                      }),
                    },
                    {
                      max: 360,
                      message: intl.get('hzero.common.validation.max', {
                        max: 360,
                      }),
                    },
                  ],
                  initialValue: record.productName,
                })(<Input disabled={isCatalogue} typeCase="upper" inputChinese={false} />)}
              </FormItem>
            ) : (
              val
            ),
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
          title: intl.get(`sprm.purchaseReqCreation.model.common.productSpecsJson`).d('商品属性'),
          width: 150,
          dataIndex: 'productSpecsJson',
          render: (val) => {
            return (
              <a
                onClick={() => {
                  this.setState({
                    customData: val ? JSON.parse(val) : [],
                    specsJsonType: 'product',
                    customVisable: true,
                  });
                }}
              >
                {intl.get(`sprm.purchaseReqCreation.model.common.productSpecsJson`).d('商品属性')}
              </a>
            );
          },
        },
        {
          title: intl.get(`sprm.purchaseReqCreation.model.common.productSpecs`).d('商品属性'),
          width: 150,
          dataIndex: 'productSpecs',
          render: (val, record) => (
            <FormItem>
              {record.$form.getFieldDecorator(`productSpecs`, {
                initialValue: val,
              })(<TextArea disabled style={{ resize: 'vertical' }} rows={1} />)}
            </FormItem>
          ),
        },
        {
          title: intl.get(`sodr.common.model.common.productBrand`).d('商品品牌'),
          dataIndex: 'productBrand',
          width: 120,
          render: (val, record) =>
            ['create', 'update'].includes(record._status) ? (
              <FormItem>
                {record.$form.getFieldDecorator('productBrand', {
                  initialValue: record.productBrand,
                })(<Input disabled />)}
              </FormItem>
            ) : (
              val
            ),
        },
        {
          title: intl.get(`sodr.common.model.common.productModel`).d('商品规格'),
          dataIndex: 'productModel',
          width: 120,
          render: (val, record) =>
            ['create', 'update'].includes(record._status) ? (
              <FormItem>
                {record.$form.getFieldDecorator('productModel', {
                  initialValue: record.productModel,
                })(<Input disabled />)}
              </FormItem>
            ) : (
              val
            ),
        },
        {
          title: intl.get(`sodr.common.model.common.packingList`).d('商品型号'),
          dataIndex: 'packingList',
          width: 120,
          render: (val, record) =>
            ['create', 'update'].includes(record._status) ? (
              <FormItem>
                {record.$form.getFieldDecorator('packingList', {
                  initialValue: record.packingList,
                })(<Input disabled />)}
              </FormItem>
            ) : (
              val
            ),
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
                  specsJsonType: 'custom',
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
                      required: !isCatalogue,
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
                })(<Input disabled={isCatalogue} typeCase="upper" inputChinese={false} />)}
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
            ['create', 'update'].includes(record._status) ? (
              <FormItem>
                {record.$form.getFieldDecorator(`secondaryQuantity`, {
                  rules: [
                    {
                      required: !isCatalogue,
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
                    precision={record.$form.getFieldValue('secondaryUomPrecision')}
                    disabled={
                      !sodrEnabled ||
                      isCatalogue ||
                      record.referPrice === 1 ||
                      sourceBillTypeCode === 'PURCHASE_REQUEST'
                    }
                    allowThousandth="true"
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
            return ['create', 'update'].includes(record._status) ? (
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
                    disabled
                    code="SMDM_ITEM_ORG_UOM"
                    lovOptions={{ valueField: 'uomId', displayField: 'uomCodeAndName' }}
                    textField="secondaryUomCodeAndName"
                    queryParams={{
                      itemId: record.$form.getFieldValue('itemId'),
                      primaryUomId: record.$form.getFieldValue('uomId'),
                    }}
                    onChange={(_, { uomId, uomCode, uomName, uomCodeAndName, uomPrecision }) => {
                      record.$form.setFieldsValue({
                        secondaryUomId: uomId,
                        secondaryUomCode: uomCode,
                        secondaryUomName: uomName,
                        secondaryUomCodeAndName: uomCodeAndName,
                        secondaryUomPrecision: uomPrecision,
                      }); // 不开双单位,修改后联动覆盖到基本单位
                      if (!sodrEnabled) {
                        record.$form.setFieldsValue({
                          uomId,
                          uomCode,
                          uomName,
                          uomCodeAndName,
                          uomPrecision,
                        });
                      }
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
          dataIndex: 'quantity',
          width: 120,
          render: (val, record) =>
            ['create', 'update'].includes(record._status) ? (
              <FormItem>
                {record.$form.getFieldDecorator(`quantity`, {
                  rules: [
                    {
                      required: !isCatalogue,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`sodr.quotePurchase.model.quotePurchase.quantity`).d('数量'),
                      }),
                    },
                  ],
                  initialValue: record.quantity,
                })(
                  <InputNumber
                    min={0}
                    max={MAX_QUAN_NUMBER}
                    precision={record.$form.getFieldValue('uomPrecision')}
                    disabled={
                      sodrEnabled ||
                      isCatalogue ||
                      record.referPrice === 1 ||
                      sourceBillTypeCode === 'PURCHASE_REQUEST'
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
            return ['create', 'update'].includes(record._status) ? (
              <FormItem>
                {record.$form.getFieldDecorator('uomId', {
                  rules: [
                    {
                      // required: !isCatalogue || !record.priceLibraryId,
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`sodr.quotePurchase.model.quotePurchase.uomName`).d('单位'),
                      }),
                    },
                  ],
                  initialValue: record.uomId,
                })(
                  <Lov
                    disabled
                    code="SMDM.UOM"
                    lovOptions={{ valueField: 'uomId', displayField: 'uomCodeAndName' }}
                    textField="uomCodeAndName"
                    // textValue={record.$form.getFieldValue('uomName') || record.uomName}
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
            return ['create', 'update'].includes(record._status) ? (
              <FormItem>
                {record.$form.getFieldDecorator('currencyCode', {
                  rules: [
                    {
                      required: !isCatalogue || !record.priceLibraryId,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`sodr.quotePurchase.model.quotePurchase.currencyCode`)
                          .d('币种'),
                      }),
                    },
                  ],
                  initialValue: val,
                })(
                  <Lov
                    code="SPRM.EXCHANGE_RATE.CURRENCY"
                    lovOptions={{ valueField: 'currencyCode', displayField: 'currencyCode' }}
                    textField="currencyCode"
                    textValue={record.$form.getFieldValue('currencyCode') || record.currencyCode}
                    disabled={
                      isCatalogue ||
                      // isOtherPlatform ||
                      (record.priceLibraryId && record.currencyCode) ||
                      (record.$form.getFieldValue('priceLibraryId') && record.currencyCode)
                      // (sourceBillTypeCode === 'PURCHASE_REQUEST' &&
                      //   fetchFlag &&
                      //   record.currencyCode)
                    }
                  />
                )}
              </FormItem>
            ) : (
              record.currencyCode
            );
          },
        },
        {
          title: intl.get(`sodr.quotePurchase.model.quotePurchase.taxRate`).d('税率（%）'),
          width: 120,
          dataIndex: 'taxId',
          render: (val, record) => {
            //  record.$form.resetFields(['taxName']);
            return ['create', 'update'].includes(record._status) ? (
              <FormItem>
                {record.$form.getFieldDecorator('taxId', {
                  rules: [
                    {
                      required:
                        !isCatalogue ||
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
                    // textValue={record.$form.getFieldValue('taxRate') || record.taxRate}
                    lovOptions={{ valueField: 'taxId', displayField: 'taxRate' }}
                    queryParams={{ enabledFlag: 1, tenantId }}
                    disabled={
                      isCatalogue ||
                      // isOtherPlatform ||
                      (record.priceLibraryId && !math.isZero(record.taxRate) && record.taxRate) || // 当税率从价格库带出且不为空
                      (record.$form.getFieldValue('priceLibraryId') &&
                        record.taxRate &&
                        !math.isZero(record.taxRate))
                      // (sourceBillTypeCode === 'PURCHASE_REQUEST' && fetchFlag && record.taxRate)
                    }
                    onChange={(text, values) => handTaxDate(text, values, record)}
                  />
                )}
                {record.$form.getFieldDecorator('taxRate', { initialValue: record.taxRate })}
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
          title: intl.get(`sodr.common.model.common.unitPrice`).d('不含税单价'),
          width: 150,
          dataIndex: 'unitPrice',
          align: 'right',
          render: (val, record) =>
            ['create', 'update'].includes(record._status) ? (
              <FormItem>
                {record.$form.getFieldDecorator('unitPrice', {
                  initialValue: record.unitPrice,
                  rules: [
                    {
                      required:
                        (record.benchmarkPriceType || headerInfo.benchmarkPriceType) ===
                          'NET_PRICE' || headerInfo.modifyablePriceFlag === 0,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`sodr.common.model.common.unitPrice`).d('不含税单价'),
                      }),
                    },
                  ],
                })(
                  <InputNumber
                    min={0}
                    max={MAX_QUAN_NUMBER}
                    disabled={
                      (record.benchmarkPriceType || headerInfo.benchmarkPriceType) !== 'NET_PRICE'
                    }
                    // className={styles['number-input']}
                  />
                )}
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
          render: (val, record) => {
            // if (sourceBillTypeCode === 'PURCHASE_REQUEST') {
            //   record.$form.resetFields();
            // }
            if (['create', 'update'].includes(record._status)) {
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
                          (record.benchmarkPriceType || headerInfo.benchmarkPriceType) !==
                          'NET_PRICE',
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
                        headerInfo.modifyablePriceFlag === -1
                          ? (!math.isZero(record.originUnitPrice) && record.originUnitPrice) ||
                            (record.$form.getFieldValue('priceLibraryId')
                              ? record.enteredTaxIncludedPrice
                              : MAX_QUAN_NUMBER)
                          : MAX_QUAN_NUMBER
                      }
                      disabled={
                        (record.benchmarkPriceType || headerInfo.benchmarkPriceType) ===
                          'NET_PRICE' || headerInfo.modifyablePriceFlag === 0
                      }
                      style={{ width: '100%' }}
                      parser={(value) =>
                        (poSourcePlatform === 'CATALOGUE' || poSourcePlatform === 'E-COMMERCE') &&
                        headerInfo.sourceOfTransferOrder === 'AUTOTRANSFER'
                          ? value
                          : parseAumont(value, record.$form.getFieldValue('defaultPrecision'))
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
          title: intl.get(`sodr.common.model.common.unitPriceBatch`).d('每'),
          dataIndex: 'unitPriceBatch',
          width: 140,
          render: (val, record) =>
            ['create', 'update'].includes(record._status) ? (
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
                    // className={styles['number-input']}
                    style={{ width: '100%' }}
                  />
                )}
              </FormItem>
            ) : (
              val
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
                    onChange={(value) =>
                      this.handleInvInventoryLovChange(value, 'invInventoryId', record)
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
              val
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
                  checkedValue={1}
                  unCheckedValue={0}
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
          render: (val, record) => (
            <Tooltip title={record.receiveTelNum}>
              <span>{val || ''}</span>
            </Tooltip>
          ),
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
                {record.$form.getFieldDecorator('budgetAccountName', {})}
              </FormItem>
            ) : (
              record.budgetAccountName
            ),
        },
      ],
      money: [
        {
          title: intl.get(`sodr.orderMaintain.sourceFrom.displayPrNum`).d('采购申请号|行号'),
          width: 150,
          dataIndex: 'displayPrNumAndDisplayPrLineNum',
          render: (val, record) => <a onClick={() => redirectToOther('purchase', record)}>{val}</a>,
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
      ],
      remark: [
        // {
        //   title: intl.get(`sodr.quotePurchase.model.quotePurchase.returnedFlag`).d('是否退回'),
        //   dataIndex: 'returnedFlag',
        //   width: 100,
        //   // render: this.yesOrNoRender,
        //   render: (val, record) => (
        //     <FormItem>
        //       {record.$form.getFieldDecorator('returnedFlag', {
        //         initialValue: record.returnedFlag,
        //         // rules: [
        //         //   {
        //         //     required: (record.$form.getFieldValue('requiredFieldNames') || []).includes(
        //         //       'returnedFlag'
        //         //     ),
        //         //     message: intl.get('hzero.common.validation.notNull', {
        //         //       name: intl.get(`sodr.quotePurchase.model.quotePurchase.returnedFlag`).d('是否退回'),
        //         //     }),
        //         //   },
        //         // ],
        //       })(
        //         <Checkbox
        //           checked={returnOrderFlag === 1 || record.returnedFlag === 1}
        //           onChange={(e) => this.handleChangeReturn(e, record)}
        //           disabled={returnOrderFlag === 1 || record.returnedFlag === 1}
        //         />
        //       )}
        //     </FormItem>
        //   ),
        // },
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
          render: (val, record) =>
            ['create', 'update'].includes(record._status) ? (
              <FormItem>
                {record.$form.getFieldDecorator(`remark`, {
                  initialValue: record.remark,
                  rules: [
                    {
                      max: 160,
                      message: intl.get('hzero.common.validation.max', {
                        max: 160,
                      }),
                    },
                    {
                      required: (record.$form.getFieldValue('requiredFieldNames') || []).includes(
                        'remark'
                      ),
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get('hzero.common.remark').d('备注'),
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
            ['create', 'update'].includes(record._status) ? (
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
          width: 100,
          dataIndex: 'docFlow',
          title: intl.get(`sodr.common.model.common.docFlow`).d('单据流'),
          render: (_, record) => (
            <DocFlow tableName="sodr_po_line_location" tablePk={record.poLineLocationId} />
          ),
        },
      ],
    };
    return columns.base
      .concat(columns.mall, columns.other, columns.money, columns.remark)
      .filter((i) => i);
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
  // getMaintenanceCom(key, headerInfo) {
  //   const {
  //     form: { getFieldDecorator },
  //     selectedListRows = [],
  //     // headerInfo,
  //     dataSource = [],
  //     companyId,
  //     ouId,
  //   } = this.props;
  //   const { tenantId } = this.state;
  //   const { defaultPrecision } = headerInfo;
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
  //               disabled
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
  //     case 'needByDate':
  //       return (
  //         <Form.Item label=":">
  //           {getFieldDecorator(`needByDate`)(
  //             <DatePicker placeholder={null} format={getDateFormat()} />
  //           )}
  //         </Form.Item>
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
  //               disabled
  //               max={MAX_QUAN_NUMBER}
  //               precision={getPrecision(defaultPrecision)}
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
  //               disabled
  //               max={MAX_QUAN_NUMBER}
  //               precision={getPrecision(defaultPrecision)}
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

  // @Bind()
  // handleTaxAll(field, lovRecord) {
  //   const {
  //     // taxId,
  //     // taxRate,
  //     inventoryId,
  //     inventoryName,
  //     costId,
  //     costCode,
  //     costName,
  //     organizationId,
  //     organizationName,
  //     enteredTaxIncludedPrice,
  //     // unitPrice,
  //   } = lovRecord;
  //   switch (field) {
  //     // case 'taxId':
  //     //   this.setState({ selectOptionValues: { taxId, wbs: taxRate, taxRate } });
  //     //   break;
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
  //     // case 'unitPrice':
  //     //   this.setState({ selectOptionValues: { unitPrice } });
  //     //   break;
  //     default:
  //   }
  // }
  @Bind()
  handleBatchMaintenance() {
    this.setState({
      batchModalVisible: true,
    });
  }

  render() {
    const columns = this.getColumns();
    const code = this.getCustomizeTableCode();
    const {
      loading,
      priceListloading,
      fetchSettingsLoading,
      // fetchList,
      pagination = {},
      dataSource = [],
      headerInfo,
      customizeTable,
      handleRowSelectedChange = (e) => e,
      selectedListRows = [],
      handleChangePagination = (e) => e,
      // onDataChange = e => e,
      // enumMap: { batchMaintain = [] },
      checkInvOrganizationLoading,
      onChangeListData,
      customizeForm,
      validateItemAndInv,
    } = this.props;
    const { customVisable, customData, specsJsonType, batchModalVisible } = this.state;
    // const { benchmarkPriceType } = headerInfo;
    // const { sourceBillTypeCode } = headerInfo;
    // const maintenanceCom = this.getMaintenanceCom(selectOptionKey, headerInfo);
    // const batchMaintainOpts = batchMaintain.map((item) => {
    //   return {
    //     meaning: item.meaning,
    //     value: item.value,
    //   };
    // });
    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0))) + 300;
    const rowSelection = {
      selectedRowKeys:
        // sourceBillTypeCode === 'PURCHASE_ORDER'
        //   ? selectedListRows.map(n => n.poLineId)
        //   :
        selectedListRows.map((n) => n.prLineId),
      onChange: handleRowSelectedChange,
    };
    const editTableProps = {
      loading: loading || priceListloading || fetchSettingsLoading,
      columns,
      dataSource,
      pagination,
      rowSelection,
      bordered: true,
      rowKey:
        // sourceBillTypeCode === 'PURCHASE_ORDER' ? 'poLineId' :
        'prLineId',
      onChange: (page) => handleChangePagination(page),
      // onDataChange,
      scroll: { x: scrollX, y: 'calc(100vh - 390px)' },
    };
    const CustomSpecProps = {
      specsJsonType,
      visible: customVisable,
      dataSource: customData,
      hideModal: () => {
        this.setState({ customVisable: false });
      },
    };

    return (
      <div className={styles['purchase-application']}>
        <Form layout="inline">
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
              {batchMaintainOpts.map((n) => (
                <Option key={n.value} value={n.value}>
                  {n.meaning}
                </Option>
              ))}
            </Select>
          </Form.Item> */}
        </Form>
        {customizeTable(
          {
            code,
            clearCache: () => {},
          },
          <EditTable {...editTableProps} />
        )}
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
