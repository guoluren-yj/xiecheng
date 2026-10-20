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
import { Bind } from 'lodash-decorators';
import { stringify } from 'querystring';
import { isArray, isEmpty, isNumber, sum } from 'lodash';
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
import EditTable from 'components/EditTable';
// import UploadModal from 'components/Upload';
import UploadModal from 'srm-front-boot/lib/components/Upload';
import intl from 'utils/intl';
import {
  getDateFormat,
  getCurrentOrganizationId,
  getEditTableData,
  getUserOrganizationId,
} from 'utils/utils';
import { DATETIME_MIN } from 'utils/constants';
import { dateRender } from 'utils/renderer';
import { math } from 'choerodon-ui/dataset';

import { formatAumont, formatNumber } from '@/routes/components/utils';
import { TooltipInput } from '@/routes/components/TooltipFormItem';
// import ItemInfo from './ItemInfo';
import ItemInfo from '../CatDetail/ItemInfo';
import CustomSpecModal from '@/routes/QuotePurchaseRequisition/components/CustomSpecModal';
import { BUCKET_NAME, MAX_QUAN_NUMBER } from '@/routes/components/utils/constant';
import styles from './Header.less';

const FormItem = Form.Item;
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
      visible: false,
      // selectedListRows: [],
      tenantId: getCurrentOrganizationId(),
      organizationId: getUserOrganizationId(),
      customVisable: false,
      customData: [],
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
    setFieldsValue({ wbsCode, wbs: wbsName });
    const { onChangeListData, dataSource } = this.props;
    const listDataSource = dataSource.map((item) => {
      if (item.prLineId === record.prLineId) {
        return {
          ...item,
          wbsCode,
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
      uomCodeAndName,
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
        uomCodeAndName,
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
        uomCodeAndName,
        enteredTaxIncludedPrice,
        drawingVersion,
        chartVersion: drawingVersion,
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
      uomCodeAndName,
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
      form: { setFieldsValue },
      dataSource,
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
    if (recordSetFieldsValue) {
      recordSetFieldsValue({ tmpOrganizationId: value });
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
  @Bind()
  handleMaintain() {
    const {
      form: { getFieldsValue },
      dataSource,
      onChangeListData,
    } = this.props;
    const fieldsValue = getFieldsValue();
    if (fieldsValue.needByDate) {
      const newDataSource = dataSource.map((item) => {
        const { needByDate = item.needByDate } = fieldsValue;
        const { invOrganizationName = item.invOrganizationName } = this.state;
        item.$form.setFieldsValue({ needByDate });
        return {
          ...item,
          invOrganizationName,
        };
      });
      onChangeListData(newDataSource);
    }
  }

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
      setting,
      returnOrderFlag,
      afterOpenUploadModal,
      // fetchFlag, // 用来判断头信息改变供应商lov或者业务实体lov时调用接口返回值为空的情况
      enumMap: { internationalTelCode = [] },
    } = this.props;
    const { sourceBillTypeCode, unSaveEnable } = headerInfo;
    const { tenantId, organizationId, invInventoryVisible, invLocationVisible } = this.state;
    const isCatalogue = poSourcePlatform === 'CATALOGUE'; // 目录化商城
    const isMall = poSourcePlatform === 'CATALOGUE' || poSourcePlatform === 'E-COMMERCE';
    const isOtherPlatform =
      poSourcePlatform !== 'CATALOGUE' &&
      poSourcePlatform !== 'ERP' &&
      poSourcePlatform !== 'SRM' &&
      poSourcePlatform !== 'SHOP' &&
      poSourcePlatform !== 'E-COMMERCE';
    // const isHandCreate = sourceBillTypeCode === 'PURCHASE_ORDER'; // 手工创建订单
    const isRequest = sourceBillTypeCode === 'PURCHASE_REQUEST';
    const isContract = sourceBillTypeCode === 'CONTRACT_ORDER';
    const Modifiable = !(isRequest && [1, 2].includes(unSaveEnable));
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
                      invOrganizationId: record.$form.getFieldValue('invOrganizationId'),
                    }}
                    disabled={record.itemId && isRequest && !isMall}
                  />
                )}
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
                  <Input
                    disabled={
                      isCatalogue ||
                      isOtherPlatform ||
                      record.priceLibraryId ||
                      record.$form.getFieldValue('priceLibraryId') ||
                      (record.itemId && isRequest)
                    }
                  />
                )}
              </FormItem>
            ) : (
              val
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
                  <Lov
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
                    disabled={isCatalogue || isOtherPlatform}
                  />
                )}
                {record.$form.getFieldDecorator('categoryName', {
                  initialValue: record.categoryName,
                })}
              </FormItem>
            ) : (
              record.categoryName
            );
          },
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
                      required: !isCatalogue,
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
                      max: 300,
                      message: intl.get('hzero.common.validation.max', {
                        max: 300,
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
        {
          title: intl.get(`sodr.quotePurchase.model.quotePurchase.quantity`).d('数量'),
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
                      isCatalogue ||
                      record.referPrice === 1 ||
                      sourceBillTypeCode === 'PURCHASE_REQUEST'
                    }
                    allowThousandth="true"
                  />
                )}
              </FormItem>
            ) : (
              val
            ),
        },
        {
          title: intl.get(`sodr.quotePurchase.model.quotePurchase.uomName`).d('单位'),
          width: 140,
          dataIndex: 'uomId',
          render: (val, record) => {
            // record.$form.resetFields();
            // record.$form.resetFields(['uomName']);
            return ['create', 'update'].includes(record._status) ? (
              <FormItem>
                {record.$form.getFieldDecorator('uomId', {
                  rules: [
                    {
                      required: !isCatalogue || !record.priceLibraryId,
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
                      // isCatalogue ||
                      isOtherPlatform ||
                      // (record.priceLibraryId && record.uomId) ||
                      // (record.$form.getFieldValue('priceLibraryId') && record.uomId)||
                      (isCatalogue && setting === '1' && record.$form.getFieldValue('itemId')) ||
                      (setting === '0' && record.priceLibraryId && record.uomId) ||
                      (setting === '0' &&
                        record.$form.getFieldValue('priceLibraryId') &&
                        record.uomId)
                    }
                    onChange={(_, { uomPrecision }) => {
                      record.$form.setFieldsValue({ uomPrecision });
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
              </FormItem>
            ) : (
              record.uomCodeAndName
            );

            // (
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
                      isOtherPlatform ||
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
                      isOtherPlatform ||
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
          title: intl.get(`sodr.common.model.common.unitPrice`).d('不含税单价'),
          width: 150,
          dataIndex: 'unitPrice',
          align: 'right',
          render: (val, record) =>
            ['create', 'update'].includes(record._status) ? (
              <FormItem>
                {record.$form.getFieldDecorator('unitPrice', {
                  initialValue: record.unitPrice,
                })(
                  <Input
                    min={0}
                    max={MAX_QUAN_NUMBER}
                    disabled
                    className={styles['number-input']}
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
                    initialValue: record.enteredTaxIncludedPrice,
                    rules: [
                      {
                        required:
                          (!math.isZero(record.$form.getFieldValue('unitPrice')) &&
                            record.$form.getFieldValue('unitPrice') &&
                            [1, -1].includes(headerInfo.modifyablePriceFlag)) ||
                          (poSourcePlatform === 'CATALOGUE' &&
                            [1, -1].includes(headerInfo.modifyablePriceFlag)) ||
                          !['E-COMMERCE'].includes(poSourcePlatform),
                        // !record.priceLibraryId,
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
                              : Infinity)
                          : MAX_QUAN_NUMBER
                      }
                      disabled={
                        (!math.isZero(record.$form.getFieldValue('unitPrice')) &&
                          record.$form.getFieldValue('unitPrice') &&
                          record.priceLibraryId &&
                          headerInfo.modifyablePriceFlag === 0) ||
                        (poSourcePlatform === 'CATALOGUE' &&
                          headerInfo.modifyablePriceFlag === 0) ||
                        ['E-COMMERCE'].includes(poSourcePlatform) ||
                        isOtherPlatform
                        // record.priceLibraryId ||
                        // record.$form.getFieldValue('priceLibraryId')
                      }
                      style={{ width: '100%' }}
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
                })(<Input />)}
              </FormItem>
            ) : (
              val
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
          title: intl.get(`sodr.quotePurchase.model.quotePurchase.receiveTelNum`).d('联系人电话'),
          width: 300,
          dataIndex: 'receiveTelNum',
          render: (val, record) =>
            ['create', 'update'].includes(record._status) && Modifiable ? (
              <FormItem>
                {record.$form.getFieldDecorator(`internationalTelCode`, {
                  initialValue: record.internationalTelCode,
                })(
                  <Select style={{ width: 100 }} disabled={poSourcePlatform !== 'SRM'}>
                    {internationalTelCode.map((n) => (
                      <Select.Option key={n.value} value={n.value}>
                        {n.meaning}
                      </Select.Option>
                    ))}
                  </Select>
                )}
                {record.$form.getFieldDecorator(`receiveTelNum`, {
                  initialValue: record.receiveTelNum,
                })(
                  <TooltipInput
                    tipValue={
                      record.$form
                        ? record.$form.getFieldValue('receiveTelNum')
                        : record.receiveTelNum
                    }
                    style={{ width: 150 }}
                    disabled={poSourcePlatform !== 'SRM'}
                  />
                )}
              </FormItem>
            ) : (
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
                })(<Input disabled />)}
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
                })(<Input disabled />)}
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
                })(<Input disabled />)}
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
      ],
      money: [
        {
          title: intl.get(`sodr.orderMaintain.sourceFrom.displayPrNum`).d('采购申请号|行号'),
          width: 150,
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
      ],
      remark: [
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
      ],
      contract: [
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
                      invOrganizationId: record.$form.getFieldValue('invOrganizationId'),
                    }}
                    originTenantId={getCurrentOrganizationId()}
                    disabled={isCatalogue || record.itemId || isRequest}
                  />
                )}
              </FormItem>
            ) : (
              val
            ),
        },
        {
          title: intl.get(`sodr.quotePurchase.model.quotePurchase.itemName`).d('物料名称'),
          dataIndex: 'itemName',
          width: 120,
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
                <Lov
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
          title: intl.get(`sodr.quotePurchase.model.quotePurchase.quantity`).d('数量'),
          dataIndex: 'quantity',
          width: 120,
          render: (text) => formatAumont(text),
        },
        {
          title: intl.get(`sodr.quotePurchase.model.quotePurchase.uomName`).d('单位'),
          width: 140,
          dataIndex: 'uomName',
          render: (_, { uomCodeAndName }) => uomCodeAndName,
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
                  disabled={isContract}
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
          render: (val) => formatAumont(val),
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
                    initialValue: record.enteredTaxIncludedPrice,
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
                        record.referPrice === 1
                      }
                      style={{ width: '100%' }}
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
            ['create', 'update'].includes(record._status) && !val ? (
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
                })(<Input />)}
              </FormItem>
            ) : (
              val
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
          title: intl.get(`sodr.quotePurchase.model.quotePurchase.receiveTelNum`).d('联系人电话'),
          width: 300,
          dataIndex: 'receiveTelNum',
          render: (val, record) =>
            ['create', 'update'].includes(record._status) && Modifiable ? (
              <FormItem>
                {record.$form.getFieldDecorator(`internationalTelCode`, {
                  initialValue: record.internationalTelCode,
                })(
                  <Select style={{ width: 100 }} disabled={poSourcePlatform !== 'SRM'}>
                    {internationalTelCode.map((n) => (
                      <Select.Option key={n.value} value={n.value}>
                        {n.meaning}
                      </Select.Option>
                    ))}
                  </Select>
                )}
                {record.$form.getFieldDecorator(`receiveTelNum`, {
                  initialValue: record.receiveTelNum,
                })(
                  <TooltipInput
                    tipValue={
                      record.$form
                        ? record.$form.getFieldValue('receiveTelNum')
                        : record.receiveTelNum
                    }
                    style={{ width: 150 }}
                    disabled={poSourcePlatform !== 'SRM'}
                  />
                )}
              </FormItem>
            ) : (
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
        },
        {
          title: intl.get(`sodr.quotePurchase.model.quotePurchase.specifications`).d('规格'),
          dataIndex: 'specifications',
          width: 120,
        },
        {
          title: intl.get(`sodr.quotePurchase.model.quotePurchase.model`).d('型号'),
          dataIndex: 'model',
          width: 120,
        },
        {
          title: intl.get(`sodr.quotePurchase.model.quotePurchase.chartVersion`).d('图纸版本'),
          dataIndex: 'chartVersion',
          width: 120,
        },
        {
          title: intl.get(`sodr.common.model.common.accountAssignment`).d('科目分配'),
          width: 150,
          dataIndex: 'keMu',
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
          render: (val) => (val === '|' ? '' : val),
        },
        {
          title: intl.get(`sodr.orderMaintain.sourceFrom.sourceCodeNum`).d('寻源单号|行号'),
          width: 150,
          dataIndex: 'sourceNumAndLine',
          render: (val, record) =>
            val === '|' ? '' : record.sourceNumAndLine || record.sourceCodeNum,
        },
        {
          title: intl.get(`sodr.quotePurchase.model.quotePurchase.purReqAppliedName`).d('申请人'),
          width: 120,
          dataIndex: 'prRequestedName',
          render: (_, record) => record.purReqAppliedName,
        },
        {
          title: intl.get(`hzero.common.remark`).d('备注'),
          dataIndex: 'remark',
          width: 120,
        },
        {
          title: intl.get(`sodr.common.model.common.lineAttachmentUuid`).d('行附件'),
          dataIndex: 'attachmentUuid',
          width: 100,
          render: (value, record) => (
            <UploadModal
              bucketName={BUCKET_NAME}
              bucketDirectory="sodr-order"
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
      ],
    };
    if (sourceBillTypeCode === 'PURCHASE_REQUEST') {
      // 引用采购申请
      if (isCatalogue) {
        return columns.base.concat(columns.mall, columns.other, columns.money, columns.remark);
      } else {
        const request = [
          {
            title: intl.get(`sodr.common.model.common.referPrice`).d('参考价格'),
            width: 90,
            dataIndex: 'priceLibraryId',
            render: (val, record) => (
              <a onClick={() => this.handlePrice(record)}>
                {intl.get(`sodr.common.model.common.referPrice`).d('参考价格')}
              </a>
            ),
          },
        ];
        columns.other.splice(7, 0, ...request);
        return columns.base.concat(columns.other, columns.money, columns.remark);
      }
    } else if (sourceBillTypeCode === 'CONTRACT_ORDER' || sourceBillTypeCode === 'SOURCE') {
      return columns.contract;
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

  render() {
    const columns = this.getColumns();
    const code = this.getCustomizeTableCode();
    const {
      loading,
      priceListloading,
      fetchSettingsLoading,
      fetchDetailCreateList,
      queryCreateListLoading,
      deleteDetailLinesLoading,
      validating,
      pagination = {},
      dataSource = [],
      headerInfo,
      customizeTable,
      handleRowSelectedChange = (e) => e,
      handleCancelLines = (e) => e,
      selectedListRows = [],
      handleChangePagination = (e) => e,
      // onDataChange = e => e,
    } = this.props;
    const { sourceBillTypeCode, poSourcePlatform } = headerInfo;
    const { visible, customVisable, customData } = this.state;
    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0))) + 300;
    const rowSelection = {
      selectedRowKeys: selectedListRows.map((n) => n.prLineId),
      onChange: handleRowSelectedChange,
    };
    const editTableProps = {
      loading: loading || priceListloading || fetchSettingsLoading,
      columns,
      dataSource,
      pagination,
      rowSelection,
      bordered: true,
      rowKey: 'prLineId',
      onChange: (page) => handleChangePagination(page),
      // onDataChange,
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

    const CustomSpecProps = {
      visible: customVisable,
      dataSource: customData,
      hideModal: () => {
        this.setState({ customVisable: false });
      },
    };

    return (
      <div className={styles['purchase-application']}>
        {sourceBillTypeCode === 'PURCHASE_REQUEST' &&
          (poSourcePlatform === 'SRM' ||
            poSourcePlatform === 'ERP' ||
            poSourcePlatform === 'SHOP') && (
            // 此form存在仅仅为了页面按钮样式,无实际表单功能
            <Form layout="inline">
              <Button
                type="primary"
                onClick={handleCancelLines}
                loading={deleteDetailLinesLoading}
                disabled={isArray(selectedListRows) && isEmpty(selectedListRows)}
              >
                {intl.get(`hzero.common.button.delete`).d('删除')}
              </Button>
            </Form>
          )}
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
        {customVisable && <CustomSpecModal {...CustomSpecProps} />}
      </div>
    );
  }
}
