/**
 * PurchaseLineInfo - 需求维护行维护
 * @date: 2018-10-24
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
// import { connect } from 'dva';
import { Bind, Throttle } from 'lodash-decorators';
import { isNumber, sum, isArray, isEmpty, round, omit, isFunction } from 'lodash';
import { Form, Input, Button, DatePicker, Checkbox, Modal, Tooltip } from 'hzero-ui';
import moment from 'moment';
import { NumberField, Currency } from 'choerodon-ui/pro';
import { withRouter } from 'react-router-dom';
import { NOT_CHINA_PHONE } from 'utils/regExp';
// import { PRIVATE_BUCKET } from '_utils/config';
// import { routerRedux } from 'dva/router';
// import { stringify } from 'querystring';
import CommentImport from 'hzero-front-himp/lib/components/CommonImport';
// import CommonImport from 'hzero-front/lib/components/Import';
import { useModal } from 'components/Import';
import intl from 'utils/intl';
import {
  getCurrentOrganizationId,
  createPagination,
  filterNullValueObject,
  addItemToPagination,
  delItemsToPagination,
  addItemsToPagination,
  getResponse,
} from 'utils/utils';
import Lov from 'components/Lov';
import uuid from 'uuid/v4';
import { SRM_SPRM, PRIVATE_BUCKET } from '_utils/config';
import { yesOrNoRender, dateRender } from 'utils/renderer';
import notification from 'utils/notification';
import UploadModal from 'srm-front-boot/lib/components/Upload';
import EditTable from 'components/EditTable';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import { queryMapIdpValue } from 'services/api';

import { thousandBitSeparator, precisionParams, numberPrecision } from '@/routes/utils.js';
import {
  fetchDoExecute,
  fetchUomControl,
  fetchSettings,
  fetchCategory,
  bindLineAttachmentUuid,
  fetchOtherInfo,
  fetchAutoGetCompany,
  queryAllDetailList,
  fetchQuantity,
  getImportTemplate,
} from '@/services/purchaseRequisitionCreationService';

import { Button as PermissionButton } from 'components/Permission';

import styles from './Line.less';
import { PriceModal } from '../../components/priceModal';
import { ItemCustom } from '../../components/ItemCustom';
// import Icons from '../../components/Icons';
import MultipleLov from '../../components/MultipleLov';
import TooltipLov from './../../components/TooltipLov';
import TooltipInput from './../../components/TooltipInput';
import CustomSpecModal from '../../components/CustomSpecModal';
import PhoneRender from './../../components/PhoneRender';
import PriceListModal from '../../components/PriceListModal';
import BatchModal from './BatchModal';

const FormItem = Form.Item;
const modelPrompt = 'sprm.purchaseReqCreation.model.common';
const buttonPrompt = 'sprm.purchaseReqCreation.view.button';
const commonPrompt = 'sprm.common.model.common';

const { openModal } = useModal();
/**
 * PurchaseLineInfo - 需求维护行维护
 * @extends {Component} - React.Component
 * @reactProps {!Object} [processing={}] - dispatch处理过程
 * @reactProps {Array<Object>} [dataSource=[]] - 数据源
 * @reactProps {object} [pagination={}]
 * @reactProps {function} [assignDataSource= (e => e)] - 合并数据
 * @reactProps {function} [openBOMModal= (e => e)] 打开BOM
 * @reactProps {function} [onChange= (e => e)] - 表格onChange事件
 * @return React.element
 */

@withRouter
@Form.create({ fieldNameProp: null })
export default class PurchaseLineInfo extends Component {
  constructor(props) {
    super(props);
    if (props.onRef) {
      props.onRef(this);
    }
    this.state = {
      selectedRowKeys: [],
      selectedRows: [],
      batchMaintains: [], // 批量维护字段
      invOrganizationName: undefined,
      tenantId: getCurrentOrganizationId(),
      selectOptionKey: 'neededDate',
      internationalTelCode: [],
      prSourcePlatform: 'SRM',
      listDataSource: [],
      tableLoading: false,
      customVisable: false,
      customData: [],
      specsJsonType: 'custom',
      priceListModalVisible: false,
      priceData: [],
      dualUnitSetting: 0,
      batchVisible: false,
    };
  }

  /**
   * 生命周期 componentDidMount
   */
  componentDidMount() {
    Promise.all([
      fetchSettings(),
      fetchDoExecute([{ fullPathCode: 'SITE.SMDM.UOM_DISPLAY_CONFIGURATION' }]),
      fetchUomControl(),
    ]).then((res) => {
      if (res) {
        const [resulut1 = {}, result3 = [], res4] = res;
        this.setState({
          setting: resulut1['000112'],
          dualUnitSetting: res4?.SPRM || 0,
          uomCodeAndNameRule: result3[0] ? JSON.parse(result3[0]) : 0,
        });
      }
    });
    // 查询批量维护字段
    queryMapIdpValue({
      batchMaintains: 'SPUC.PR_LINE_BATCH_MAINTAIN',
      internationalTelCode: 'HPFM.IDD',
    }).then((res) => {
      if (res) {
        const { internationalTelCode = [], batchMaintains = [] } = res;
        this.setState({ internationalTelCode, batchMaintains });
        if (res.batchMaintains.length > 0) {
          this.setState({ selectOptionKey: res.batchMaintains[0].value });
        }
      }
    });
  }

  componentDidUpdate(prevProps) {
    const { purchaseRequisitionCreation: prePurchaseRequisitionCreation } = prevProps;
    const { purchaseRequisitionCreation } = this.props;
    const { lineDataSource: preLineDataSource } = prePurchaseRequisitionCreation;
    const { lineDataSource } = purchaseRequisitionCreation;
    if (preLineDataSource !== lineDataSource) {
      this.fetchDetailList();
    }
  }

  tableLoadingSetting() {
    this.setState({ tableLoading: true });
  }

  /**
   * fetchDetailList - 查询行明细数据
   * @param {object} params - 查询条件
   */
  @Bind()
  fetchDetailList(page = {}, params = {}) {
    const { onChangeLineUpdate } = this.props;
    this.setState({ tableLoading: true });
    const { prHeaderId, prSourcePlatform, dualUnitSetting, prStatusCode } = {
      ...this.state,
      ...params,
    };
    const { listDataSource = [] } = this.state;
    listDataSource.forEach((ele) => {
      if (ele.$form) {
        ele.$form.resetFields();
      }
    });
    if (prHeaderId) {
      queryAllDetailList({
        page,
        prHeaderId,
        code:
          prSourcePlatform !== 'E-COMMERCE'
            ? 'SPRM.PURCHASE_REQUISITION_CREATION.DETAIL_LINE'
            : 'SPRM.PURCHASE_REQUISITION_CREATION.DETAIL.LINE_ECOMMERCE',
      }).then((res) => {
        const renderFlag = ['PENDING', 'REJECTED', 'SEND_BACK'].includes(prStatusCode);
        if (res && res.content) {
          this.setState({
            prHeaderId,
            prSourcePlatform,
            prStatusCode,
            renderFlag,
            listDataSource: renderFlag
              ? res.content?.map((n) => ({
                  ...n,
                  secondaryUomIdMeaning: n.secondaryUomCodeAndName,
                  dualUnitSetting,
                  _status: 'update',
                }))
              : res.content,
            tableLoading: false,
            listPage: { ...createPagination(res), pageSizeOptions: ['10', '20'] },
          });
          onChangeLineUpdate();
        }
      });
    }
  }

  /**
   * 改变申请人带出name值
   */
  @Bind()
  changeRequestedBy(val, dataList, record) {
    record.$form.registerField('prRequestedName');
    record.$form.setFieldsValue({
      requestedBy: dataList.userId,
      prRequestedName: dataList.userName,
      prRequestedString: dataList.loginName
        ? `${dataList.loginName}-${dataList.userName}`
        : dataList.userName,
    });
  }

  /**
   * 改变采购员带出name值
   */
  @Bind()
  agentNameCenter(val, dataList, record) {
    record.$form.setFieldsValue({
      purchaseAgentId: dataList.purchaseAgentId,
      agentName: dataList.purchaseAgentName,
    });
  }

  /**
   * 添加采购申请行
   */
  @Bind()
  handleAdd({ extraData = [], batchAdd = false }) {
    const {
      headerForm: { getFieldValue, getFieldsValue },
      headerRef,
    } = this.props;
    const { listDataSource, listPage, internationalTelCode = [] } = this.state;
    const {
      purchaseAgentId,
      purchaseAgentName,
      requestedBy,
      prRequestedNum,
      prRequestedName,
      originalCurrency,
      financialPrecision,
      defaultPrecision,
      localFinancialPrecision,
      localDefaultPrecision,
    } = { ...headerRef.getInfo(), ...getFieldsValue() };
    Promise.all([
      fetchOtherInfo(getFieldsValue()),
      fetchAutoGetCompany({ ouId: getFieldValue('ouId') }),
    ]).then((res) => {
      if (res[1] && res[0]) {
        const {
          organizationId: invOrganizationId,
          organizationName: invOrganizationName,
          address: receiveAddress,
          ...otherRes
        } = res[1];
        const { unitCode, unitId, unitName, userId, userName, ...otherInfo } = res[0];
        const newList = {
          currencyCode: originalCurrency,
          purchaseAgentId,
          prRequestedName,
          requestedBy,
          prRequestedNum,
          agentName: purchaseAgentName,
          _status: 'create',
          prLineId: uuid(),
          invOrganizationId,
          invOrganizationName,
          receiveAddress,
          ...filterNullValueObject(otherRes),
          ...filterNullValueObject(otherInfo),
          internationalTelCode: internationalTelCode[0]?.value || '',
          expBearDep: unitName,
          expBearDepId: unitId,
          expBearDepCode: unitCode,
          expBearDepMeaning: unitName,
          accepterUserName: userName,
          accepterUserId: userId,
          accepterUserIdMeaning: userName,
          financialPrecision,
          defaultPrecision,
          localFinancialPrecision,
          localDefaultPrecision,
        };
        // 二开： 批量新增
        if (batchAdd) {
          const extraList =
            extraData?.map((item) =>
              // prLineId是表格的rowKey，此处一定要重置不能相等
              filterNullValueObject({ ...newList, ...item, prLineId: uuid() })
            ) ?? [];
          this.setState({
            listDataSource: [...extraList, ...listDataSource],
            listPage: {
              ...addItemsToPagination(extraData.length, listDataSource.length, listPage),
            },
          });
          return;
        }
        this.setState({
          listDataSource: [filterNullValueObject(newList), ...listDataSource],
          listPage: { ...addItemToPagination(listDataSource.length, listPage) },
        });
      }
    });
  }

  // 获取行信息.用于头行联动
  @Bind()
  handleLineData() {
    return this.state.listDataSource;
  }

  // 获取行信息.用于头行联动
  @Bind()
  handleSetLineData(lineData) {
    return this.setState({
      listDataSource: lineData,
    });
  }

  @Bind()
  @Throttle(1000)
  getlistUpdate() {
    this.setState({ tableLoading: false });
  }

  /**
   * 删除采购申请行
   */
  @Bind()
  handleDelete() {
    const { selectedRowKeys, listDataSource, prHeaderId, listPage } = this.state;
    const { dispatch, headerRef } = this.props;
    const newDataSource = [];
    const deleteList = [];
    Modal.confirm({
      title: intl.get(`sprm.purchaseReqCreation.view.message.deletePurchaseLines`).d('是否删除'),
      onOk: () => {
        listDataSource.forEach((item) => {
          if (!selectedRowKeys.includes(item.prLineId)) {
            newDataSource.push(item);
          } else if (item._status !== 'create') {
            deleteList.push(omit(item, ['$form']));
          }
        });
        if (!isEmpty(deleteList)) {
          dispatch({
            type: 'purchaseRequisitionCreation/deleteLines',
            payload: {
              prHeaderId,
              prLines: deleteList,
            },
          }).then((res) => {
            if (res) {
              this.setState({
                listDataSource: newDataSource,
                selectedRowKeys: [],
              });
              notification.success();
              this.fetchDetailList();
              headerRef.fetchDetailHeader();
            }
          });
        } else {
          this.setState({
            listDataSource: newDataSource,
            selectedRowKeys: [],
            listPage: delItemsToPagination(selectedRowKeys.length, listDataSource.length, listPage),
          });
        }
      },
    });
  }

  /**
   * 选中行回调
   * @param {Array} selectedRowKeys
   */
  @Bind()
  handleChangeSelectRowKeys(selectedRowKeys, selectedRows) {
    this.setState({
      selectedRowKeys,
      selectedRows,
    });
  }

  /**
   * 批量维护
   */
  @Bind()
  handleMaintain(listData, ouChangeFlag, fieldsMap) {
    const { headerRef, prSourcePlatform, itemLimitRule } = this.props;
    const headerData = headerRef.getInfo();
    const { listDataSource } = this.state;
    const receiveAddress = prSourcePlatform === 'CATALOGUE' ? undefined : listData.receiveAddress;
    const { __id, _status, ...othersLineData } = listData;

    const attributeLovList = {};

    for (const i in fieldsMap) {
      if (Object.prototype.hasOwnProperty.call(fieldsMap, i) && fieldsMap[i]) {
        const value = fieldsMap[i].getValue();
        const lovCode = fieldsMap[i].get('lovCode');
        if (
          value &&
          lovCode &&
          ![
            'remark',
            'budgetAccountId',
            'projectCategory',
            'expBearDepId',
            'expBearDep',
            'accountSubjectId',
            'inventoryId',
            'neededDate',
            'invOrganizationId',
            'batchAddress',
            'costId',
            'wbsCode',
          ].includes(i)
        ) {
          const textField = fieldsMap[i].getText();
          attributeLovList[`${i}Meaning`] = textField;
        }
      }
    }

    const newDataSource = listDataSource?.map((item) => {
      if (listData.neededDate) {
        item.$form.setFieldsValue({
          ...othersLineData,
          neededDate: moment(listData.neededDate, DEFAULT_DATE_FORMAT),
        });
      } else {
        item.$form.setFieldsValue({
          ...listData,
          receiveAddress:
            prSourcePlatform === 'CATALOGUE'
              ? item.receiveAddress
              : listData.receiveAddress || receiveAddress,
        });
      }
      if (
        (listData.invOrganizationId || ouChangeFlag) &&
        itemLimitRule.find((rule) => rule === 'invOrganizationId') &&
        listData.invOrganizationId !== item.invOrganizationId &&
        item.itemId
      ) {
        this.handleItemOnChange(null, {}, item);
      }
      return {
        ...item,
        ...listData,
        ...attributeLovList,
        _status: item._status,
        // _status: 'update',
      };
    });
    headerRef.setState({
      headerInfo: {
        ...headerData,
        batchEditFieldMap: {
          ...othersLineData,
          unitCode:
            prSourcePlatform !== 'SRM'
              ? 'SPRM.PURCHASE_REQUISITION_CREATION.BATCH_EDIT'
              : 'SPRM.PURCHASE_REQUISITION_CREATION.BATCH_SRMEDIT',
        },
      },
    });
    this.setState({ listDataSource: newDataSource }, () => {
      this.setState({ batchVisible: false });
    });
  }

  /**
   * 申请行导入
   */
  @Bind()
  handleImport() {
    const { cuxTemplateCode } = this.props?.remote?.props?.process || {};
    const templateCode = cuxTemplateCode || 'SPRM.PR_LINE';
    const { tenantId, prHeaderId } = this.state;
    this.importProps = {
      code: templateCode,
      sync: false,
      auto: false,
      refreshButton: 'true',
      historyButton: 'true',
      prefixPatch: undefined,
      args: JSON.stringify({
        tenantId,
        templateCode,
        prHeaderId,
      }),
      autoRefreshInterval: 5000,
      backPath: undefined,
      tenantId, // 租户的传
      action: intl.get('hzero.common.viewtitle.batchImport').d('批量导入'),
      key: `/sprm/purchase-requisition-creation/data-import/${templateCode}`,
    };
    this.setState({
      importVisible: !this.state.importVisible,
    });
  }

  /**
   * 库存组织Lov修改回调
   * @param {String} value
   * @param {Object} record
   */
  @Bind()
  handleChangeFormInv(value, record) {
    this.setState({ invOrganizationName: record.invOrganizationId });
  }

  /**
   * 建议供应商改变回调
   * @param {String} value
   * @param {Object} lovRecord
   */
  @Bind()
  handleChangeSupplier(value, lovRecord, record) {
    const {
      supplierCompanyId,
      supplierTenantId,
      supplierCompanyNum,
      supplierCompanyName,
      displaySupplierName,
      supplierId,
      supplierNum,
      supplierName,
    } = lovRecord;
    const { listDataSource: dataSource } = this.state;
    const listDataSource = dataSource?.map((item) => {
      if (item.prLineId === record.prLineId) {
        return {
          ...item,
          supplierCompanyId,
          supplierTenantId,
          supplierCompanyNum,
          supplierId,
          supplierNum,
          supplierCompanyName,
          displaySupplierName,
          supplierName,
        };
      }
      return item;
    });
    this.setState({ listDataSource });
  }

  /**
   * 获取查询物料的参数
   * @param {物料限定规则} itemLimitRule
   * @param {行记录} record
   */
  @Bind()
  getQueryItemParams(itemLimitRule, record) {
    const { tenantId } = this.state;
    const {
      headerForm: { getFieldValue },
    } = this.props;
    // 公司,采购类型, 头采购品类, 行采购品类,
    const params = {
      enabledFlag: 1,
      tenantId,
      companyId: getFieldValue('companyId'),
      headerCategoryId: getFieldValue('categoryId'),
      lineCategoryId: record.$form.getFieldValue('categoryId'),
      prTypeId: getFieldValue('prTypeId'),
    };
    // 物料分类
    if (itemLimitRule.find((rule) => rule === 'categoryId')) {
      params.categoryId = record.$form.getFieldValue('categoryId');
    }
    // 库存组织
    if (itemLimitRule.find((rule) => rule === 'invOrganizationId')) {
      params.invOrganizationId = record.$form.getFieldValue('invOrganizationId');
    }
    return params;
  }

  @Bind()
  handleToolTipVisible(currentType = '', record = {}) {
    record.$form.registerField('currentType');
    record.$form.setFieldsValue({ currentType });
  }

  /**
   * 物料是否可选
   */
  @Bind()
  itemChangeDisabled(isCatalogOrECom, itemLimitRule, record) {
    const { prSourcePlatform } = this.state;
    if (isCatalogOrECom || prSourcePlatform === 'SHOP') {
      return true;
    }
    // 物料分类
    if (itemLimitRule.find((rule) => rule === 'categoryId')) {
      const categoryId = record.$form.getFieldValue('categoryId');
      if (!categoryId) {
        return true;
      }
    }
    // 库存组织
    if (itemLimitRule.find((rule) => rule === 'invOrganizationId')) {
      const invOrganizationId = record.$form.getFieldValue('invOrganizationId');
      if (!invOrganizationId) {
        return true;
      }
    }
    return false;
  }

  uomNameShow = (code, name) => {
    const { uomCodeAndNameRule = 0 } = this.state;
    return uomCodeAndNameRule ? `${code}/${name}` : name;
  };

  /**
   * 物料改变回调
   * @param {String} value
   * @param {Object} lovRecord
   * @param {Object} record
   */
  @Bind()
  async handleItemOnChange(value, lovRecord, record) {
    // debugger;
    // const { onChangeListData, dataSource, prSourcePlatform, dispatch, setting } = this.props;
    const {
      $form: { setFieldsValue, registerField, getFieldValue },
    } = record;
    const {
      listDataSource: dataSource,
      prSourcePlatform,
      setting,
      uomCodeAndNameRule = 0,
      dualUnitSetting = 0, // 是否开启业务规则-双单位
    } = this.state;
    const {
      itemName,
      primaryUomId,
      taxId,
      taxCode,
      taxRate,
      uomName,
      orderUomId,
      orderUomName,
      orderUomCode,
      uomCode,
      partnerItemId,
      itemAbcClass,
      poLineId, // 订单行id
      lastPurchasePrice, // 上次价格
      specifications, // 规格
      model, // 型号
      chartCode, // 图号
      drawingVersion, // 图号版本
      itemCode,
      secondaryUomId,
      secondaryUomCode,
      secondaryUomName,
      customMadeFlag,
      unitControlEnable,
      uomPrecision,
      orderUomPrecision,
      secondaryUomPrecision,
    } = lovRecord;
    // 叮咚买菜二开pur-18390：查询预估价格
    const { handleQueryPrice = undefined, cuxItemCodeChange = undefined } =
      this.props?.remote?.props?.process || {};
    const cuxBringParams = isFunction(cuxItemCodeChange)
      ? cuxItemCodeChange({ ...lovRecord, getFieldValue })
      : {};
    // 业务规则双单位配置》配置中心单位控制〉基本单位
    const secondaryUomIdProps = dualUnitSetting
      ? {
          secondaryUomId,
          secondaryUomCode,
          secondaryUomPrecision,
          secondaryUomCodeAndName: this.uomNameShow(secondaryUomCode, secondaryUomName),
        }
      : {
          secondaryUomId: unitControlEnable ? orderUomId || primaryUomId : primaryUomId,
          secondaryUomCode: unitControlEnable ? orderUomCode || uomCode : uomCode,
          secondaryUomIdMeaning: this.uomNameShow(uomCode, uomName),
          secondaryUomPrecision: unitControlEnable
            ? orderUomPrecision || uomPrecision
            : uomPrecision,
          secondaryUomCodeAndName: unitControlEnable
            ? this.uomNameShow(orderUomCode || uomCode, orderUomName || uomName)
            : this.uomNameShow(uomCode, uomName),
        };
    registerField('itemId');
    registerField('uomId');
    if (value) {
      const listDataSource = dataSource?.map((item) => {
        if (item.prLineId === record.prLineId) {
          if (['E-COMMERCE', 'CATALOGUE'].includes(prSourcePlatform)) {
            return {
              ...item,
              ...cuxBringParams,
              uomName: unitControlEnable ? orderUomName || orderUomName : uomName,
              uomCode: unitControlEnable ? orderUomCode || uomCode : uomCode,
              customMadeFlag,
              orderUomName,
              itemName,
              itemCode,
              itemAbcClass,
              orderUomId,
              uomCodeAndName: uomCodeAndNameRule ? `${uomCode}/${uomName}` : uomName,
              uomId: unitControlEnable ? orderUomId || primaryUomId : primaryUomId,
              ...secondaryUomIdProps,
              itemId: partnerItemId,
              poLineId,
              lastPurchasePrice,
              itemSpecs: specifications,
              itemModel: model,
              drawingNum: chartCode,
              drawingVersion,
              unitFlag: +setting,
            };
          } else {
            const uoNameList = {
              uomName: unitControlEnable ? orderUomName || uomName : uomName,
              uomCode: unitControlEnable ? orderUomCode || uomCode : uomCode,
              uomId: primaryUomId,
              ...secondaryUomIdProps,
            };
            setFieldsValue({
              ...uoNameList,
              uomCodeAndName: uomCodeAndNameRule
                ? `${uoNameList.uomCode}/${uoNameList.uomName}`
                : uoNameList.uomName,
            });
            return {
              ...item,
              ...cuxBringParams,
              taxRate,
              taxCode,
              uomCode,
              customMadeFlag,
              orderUomName,
              uomName,
              uomId: primaryUomId,
              uomCodeAndName: uomCodeAndNameRule
                ? `${uoNameList.uomCode}/${uoNameList.uomName}`
                : uoNameList.uomName,
              ...secondaryUomIdProps,
              taxId,
              itemCode,
              itemName, // 物料名称
              itemAbcClass,
              customAttributeList: undefined,
              orderUomId,
              itemId: partnerItemId,
              poLineId,
              lastPurchasePrice,
              itemSpecs: specifications,
              itemModel: model,
              drawingNum: chartCode,
              drawingVersion,
              unitFlag: +setting,
            };
          }
        }

        return item;
      });
      const fields = ['E-COMMERCE', 'CATALOGUE'].includes(prSourcePlatform)
        ? {
            itemName,
            uomName,
            uomId: primaryUomId,
            itemId: partnerItemId,
          }
        : {
            itemName,
            taxId,
            taxCode,
            customMadeFlag,
            // uomName,
            // uomId: orderUomId,
            // uoName: orderUomName,
            uomName: setting === '1' && orderUomName ? orderUomName : uomName,
            uomId: setting === '1' && orderUomId ? orderUomId : primaryUomId,
            uomCodeAndName: uomCodeAndNameRule ? `${uomCode}/${uomName}` : uomName,
            itemId: partnerItemId,
            itemSpecs: specifications,
            itemModel: model,
          };
      setFieldsValue(fields);
      if (
        dualUnitSetting === 1 &&
        partnerItemId &&
        secondaryUomIdProps.secondaryUomId &&
        primaryUomId &&
        getFieldValue('secondaryQuantity')
      ) {
        Promise.all([
          fetchCategory({
            itemId: partnerItemId,
            enabledFlag: 1,
            defaultFlag: 1,
            querySourceFrom: 'PR',
          }),
          fetchQuantity([
            {
              businessKey: 1,
              secondaryUomId: secondaryUomIdProps.secondaryUomId,
              secondaryQuantity: getFieldValue('secondaryQuantity'),
              doublePrimaryUomId: primaryUomId,
              itemId: partnerItemId,
            },
          ]),
        ]).then(async (result) => {
          const [res1, res2] = result;
          let updateData = {};
          if (res1 && isArray(res1) && res1.length === 1) {
            const { categoryName, categoryId, categoryCode } = res1[0];
            updateData = { categoryName, categoryId, categoryCode };
          }
          if (res2 && !res2.failed) {
            updateData = { ...updateData, quantity: res2[0]?.primaryQuantity || undefined };
          }
          const newListDataSource = listDataSource?.map((item) => {
            if (item.prLineId === record.prLineId) {
              return {
                ...item,
                ...updateData,
              };
            }
            return item;
          });
          setFieldsValue({ ...updateData });
          this.setState({ listDataSource: newListDataSource });
          // 叮咚买菜二开pur-18390：查询预估价格
          if (typeof handleQueryPrice === 'function') {
            const resList = await handleQueryPrice({
              record,
              newListDataSource,
              setFieldsValue,
              registerField,
              pageProps: this.props,
            });
            if (resList) {
              this.setState({ listDataSource: resList });
            }
          }
        });
      } else {
        fetchCategory({
          itemId: partnerItemId,
          enabledFlag: 1,
          defaultFlag: 1,
          querySourceFrom: 'PR',
        }).then(async (res) => {
          if (res && isArray(res) && res.length === 1) {
            const { categoryName, categoryId, categoryCode } = res[0];
            const newListDataSource = listDataSource?.map((item) => {
              if (item.prLineId === record.prLineId) {
                return {
                  ...item,
                  categoryId,
                  categoryCode,
                  categoryName,
                };
              }
              return item;
            });
            setFieldsValue({ categoryId, categoryName });
            this.setState({ listDataSource: newListDataSource });
            // 叮咚买菜二开pur-18390：查询预估价格
            if (typeof handleQueryPrice === 'function') {
              const resList = await handleQueryPrice({
                record,
                newListDataSource,
                setFieldsValue,
                registerField,
                pageProps: this.props,
              });
              if (resList) {
                this.setState({ listDataSource: resList });
              }
            }
          } else {
            const newListDataSource = listDataSource?.map((item) => {
              if (item.prLineId === record.prLineId) {
                return {
                  ...item,
                  categoryName: undefined,
                };
              }
              return item;
            });
            setFieldsValue({ categoryId: undefined, categoryName: undefined });
            this.setState({ listDataSource: newListDataSource });
            // 叮咚买菜二开pur-18390：查询预估价格
            if (typeof handleQueryPrice === 'function') {
              const resList = await handleQueryPrice({
                record,
                newListDataSource,
                setFieldsValue,
                registerField,
                setState: this.setState,
                pageProps: this.props,
              });
              if (resList) {
                this.setState({ listDataSource: resList });
              }
            }
          }
        });
      }
    } else {
      // 当单据来源为 SRM，删除物料编码删除本行所有，除了 库房和库存组织
      const resetIndex = [
        'itemId',
        'itemName',
        'itemAbcClass',
        'uomId',
        'uomName',
        'categoryId',
        'categoryName',
        // 'quantity',//数量
        'taxId',
        'taxCode',
        'taxRate',
        'secondaryUomId',
        'secondaryUomCode',
        'secondaryUomCodeAndName',
        // 'currencyCode',
        // 'taxIncludedUnitPrice',
        'jdPrice',
        // 'neededDate',需求日期
        'itemCode',
        'supplierCompanyId',
        'displaySupplierName',
        'prRequestedName',
        'agentName',
        'expBearDep',
        // 'costId',
        // 'costName',
        // 'accountSubjectId',
        // 'accountSubjectName',
        // 'wbsCode',
        // 'wbs',
        // 'projectNum',
        // 'projectName',
        'craneNum',
        'innerPoNum',
        'itemModel',
        'itemSpecs',
        'drawingNum',
        'drawingVersion',
        // 'remark',
        'customMadeFlag',
        'itemProperties',
        'keeperUserName',
        'customAttributeList',
        'accepterUserName',
        'address',
      ];
      const { itemLimitRule } = this.props;
      if (itemLimitRule.find((rule) => rule !== 'categoryId')) {
        resetIndex.push('categoryId', 'categoryName');
      }
      const resetList = {
        itemId: undefined,
        taxRate: undefined,
        customMadeFlag: undefined,
        customAttributeList: undefined,
        // taxIncludedUnitPrice: undefined,
        // taxIncludedLineAmount: undefined,
        // lineFreight: undefined,
        lastPurPrice: undefined,
        pcNum: undefined,
      };
      const resetFields = {};
      resetIndex.map((item) => {
        resetFields[item] = undefined;
        return item;
      });
      if (prSourcePlatform === 'SRM') {
        record.$form.setFieldsValue(resetFields); // 清空物料编码时清空id
        const listDataSource = dataSource?.map((item) => {
          if (item.prLineId === record.prLineId) {
            return {
              ...item,
              ...resetList,
            };
          }
          return item;
        });
        this.setState({ listDataSource });
      }
    }
  }

  @Bind()
  handleCategoryOnChange(value, lovRecord, record) {
    // eslint-disable-next-line no-param-reassign
    record.categoryId = value;
    const { itemLimitRule = [], remote } = this.props;
    const { listDataSource } = this.state;

    let newListDataSource = [];
    if (value) {
      const { categoryName, categoryCode } = lovRecord;
      // eslint-disable-next-line no-param-reassign
      record.categoryName = categoryName;
      record.$form.setFieldsValue({
        categoryId: lovRecord.categoryId,
        categoryName,
        categoryCode,
      });
      const { getRemoteParams } = remote?.props?.process || {};
      const remoteParams = isFunction(getRemoteParams)
      ? getRemoteParams({ value, lovRecord, record }) : {};

      newListDataSource = listDataSource?.map((item) => {
        if (item.prLineId === record.prLineId) {
          return {
            ...item,
            categoryId: lovRecord.categoryId,
            categoryCode,
            categoryName,
            ...remoteParams,
          };
        }
        return item;
      });
      this.setState({ listDataSource: newListDataSource });
    } else {
      newListDataSource = listDataSource?.map((item) => {
        if (item.prLineId === record.prLineId) {
          return {
            ...item,
            categoryName: undefined,
          };
        }
        return item;
      });
      record.$form.setFieldsValue({
        categoryId: undefined,
        categoryName: undefined,
        categoryCode: undefined,
      });
      this.setState({ listDataSource: newListDataSource });
    }
    if (itemLimitRule.find((rule) => rule === 'categoryId')) {
      const resetFields = {
        itemId: undefined,
        itemName: undefined,
        itemCode: undefined,
        taxRate: undefined,
        taxIncludedUnitPrice: undefined,
        taxIncludedLineAmount: undefined,
        lineFreight: undefined,
        lastPurchasePrice: undefined,
        poLineId: undefined,
        uomId: undefined,
        uomCode: undefined,
        pcNum: undefined,
        itemCodeLov: null,
        itemModel: undefined,
        primaryUomId: undefined,
        itemSpecs: undefined,
      };
      record.$form.setFieldsValue(resetFields);
      // this.handleItemOnChange(null, {}, record);
    }
  }

  @Bind()
  bindLineAttachmentUuid(attachmentUuid, record) {
    const { prHeaderId, listPage } = this.state;
    const { prLineId } = record;
    bindLineAttachmentUuid({ prHeaderId, prLineId, attachmentUuid }).then((res) => {
      if (res) {
        this.fetchDetailList(listPage);
      }
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
    const { listDataSource: dataSource } = this.state;
    const listDataSource = dataSource?.map((item) => {
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
    this.setState({ listDataSource });
  }

  @Bind()
  handleCostCenterAll(_, lovRecord) {
    const { costCode, costName, costId } = lovRecord;
    this.setState({ selectOptionValues: { costCode, costName, costId } });
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
    const { listDataSource: dataSource } = this.state;
    const listDataSource = dataSource?.map((item) => {
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
    this.setState({ listDataSource });
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
    const { listDataSource: dataSource } = this.state;
    const listDataSource = dataSource?.map((item) => {
      if (item.prLineId === record.prLineId) {
        return {
          ...item,
          wbsCode,
          wbs: wbsName,
        };
      }
      return item;
    });
    this.setState({ listDataSource });
  }

  /**
   * 改变库存组织清空库房
   */
  @Bind()
  orgOnChange(val, lovRecord = {}, record) {
    const { itemLimitRule } = this.props;
    if (itemLimitRule.find((rule) => rule === 'invOrganizationId')) {
      this.handleItemOnChange(null, {}, record);
    }
    const { prSourcePlatform } = this.state;
    record.$form.setFieldsValue({
      inventoryId: undefined,
      inventoryName: undefined,
      invOrganizationName: lovRecord.organizationName,
      receiveAddress:
        prSourcePlatform === 'CATALOGUE'
          ? record.receiveAddress
          : lovRecord
          ? lovRecord.address
          : undefined,
    });
    this.props.notificationForMaterial();
  }

  @Bind()
  changeBatchModal() {
    this.setState({ batchVisible: !this.state.batchVisible });
  }

  /**
   * 单位
   */
  @Bind()
  handleUomChange(lovRecord, record) {
    // 当业务规则开启双单位的时候，需要根据 物料id,单位id,数量=》查出 基本数量
    // 当没有
    const { dualUnitSetting, listDataSource: dataSource } = this.state;
    const { uomCode, uomCodeAndName, uomId, secondaryUomPrecision } = lovRecord || {};
    record.$form.registerField('uomId');
    const { secondaryQuantity, uomId: doublePrimaryUomId, itemId } = record.$form.getFieldsValue();
    const baseUomProps = {
      secondaryUomPrecision,
      secondaryUomCode: uomCode,
      secondaryUomCodeAndName: uomCodeAndName,
      secondaryQuantity: secondaryQuantity
        ? round(+secondaryQuantity, secondaryUomPrecision).toFixed(secondaryUomPrecision)
        : undefined,
    };
    if (
      dualUnitSetting &&
      itemId &&
      (doublePrimaryUomId || record.uomId) &&
      uomId &&
      secondaryQuantity
    ) {
      fetchQuantity([
        {
          businessKey: 1,
          secondaryUomId: uomId,
          secondaryQuantity,
          doublePrimaryUomId: doublePrimaryUomId || record.uomId,
          itemId,
        },
      ]).then((res) => {
        const result = getResponse(res);
        if (result && !res.failed) {
          record.$form.setFieldsValue({
            quantity: res[0]?.primaryQuantity,
          });
          const listDataSource = dataSource?.map((item) => {
            if (item.prLineId === record.prLineId) {
              return {
                ...item,
                ...baseUomProps,
                quantity: res[0]?.primaryQuantity,
              };
            }
            return item;
          });
          this.setState({ listDataSource });
        }
      });
    } else if (!itemId && dualUnitSetting) {
      record.$form.setFieldsValue({
        ...baseUomProps,
        uomId,
        uomPrecision: secondaryUomPrecision,
        uomCode,
        uomName: uomCodeAndName,
        uomCodeAndName,
        quantity: secondaryQuantity
          ? round(+secondaryQuantity, secondaryUomPrecision).toFixed(secondaryUomPrecision)
          : undefined,
      });
      const listDataSource = dataSource?.map((item) => {
        if (item.prLineId === record.prLineId) {
          return {
            ...item,
            ...baseUomProps,
            uomId,
            uomPrecision: secondaryUomPrecision,
            uomCode,
            uomName: uomCodeAndName,
            uomCodeAndName,
            quantity: secondaryQuantity,
          };
        }
        return item;
      });
      this.setState({ listDataSource });
    } else {
      record.$form.setFieldsValue({
        ...baseUomProps,
      });
      const listDataSource = dataSource?.map((item) => {
        if (item.prLineId === record.prLineId) {
          return {
            ...item,
            ...baseUomProps,
          };
        }
        return item;
      });
      this.setState({ listDataSource });
    }
  }

  /**
   * 获取列
   */
  @Bind()
  getColumns() {
    const {
      tenantId,
      internationalTelCode = [],
      prSourcePlatform,
      prStatusCode,
      listDataSource = [],
      dualUnitSetting,
    } = this.state;
    const {
      isMatch,
      setting,
      headerForm: { getFieldValue },
      dispatch,
      basePriceFlag,
      remote,
      itemLimitRule,
    } = this.props;
    const { getCuxLineCols } = remote?.props?.process || {};
    const cuxCols = isFunction(getCuxLineCols)
      ? getCuxLineCols({ getFieldValue, listDataSource })
      : [];
    const isEComAndReject = prSourcePlatform === 'E-COMMERCE' && prStatusCode === 'REJECTED';
    const isCatalogOrECom = ['E-COMMERCE', 'CATALOGUE'].includes(prSourcePlatform);
    const uploadProps = {
      icon: false,
      btnText: intl.get('entity.attachment.upload').d('附件上传'),
      showFilesNumber: true,
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: 'sprm-pr',
    };
    const priceItem = [
      {
        title: intl.get(`${commonPrompt}.includingTaxAndFreightPrice`).d('预估单价(含税含运费)'),
        width: 165,
        dataIndex: 'taxIncludedUnitPrice',
        align: 'right',
        render: (val, record) =>
          record.linelinePriceHiddenFlag === 1 ? (
            record.taxIncludedUnitPriceMeaning
          ) : ['create', 'update'].includes(record._status) && !isMatch ? (
            <FormItem>
              {record.$form.getFieldDecorator(`taxIncludedUnitPrice`, {
                rules: [
                  {
                    required: (record.$form.getFieldValue('requiredFieldNames') || []).includes(
                      'taxIncludedUnitPrice'
                    ),
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`${commonPrompt}.includingTaxAndFreightPrice`)
                        .d('预估单价(含税含运费)'),
                    }),
                  },
                ],
                initialValue: val,
              })(
                <NumberField
                  min={0}
                  disabled={isEComAndReject || isCatalogOrECom || !basePriceFlag}
                  numberGrouping
                  precision={
                    record.defaultPrecision && prSourcePlatform === 'SRM'
                      ? record.defaultPrecision
                      : 10
                  }
                />
              )}
            </FormItem>
          ) : (
            thousandBitSeparator(val, record.defaultPrecision, prSourcePlatform !== 'SRM')
          ),
      },
      {
        title: intl.get(`${commonPrompt}.taxExcludedFreightPrice`).d('预估单价(含税不含运费)'),
        dataIndex: 'taxWithoutFreightPrice',
        width: 180,
        align: 'right',
        render: (val, record) =>
          thousandBitSeparator(val, record.defaultPrecision, prSourcePlatform !== 'SRM'),
      },
    ];
    const columnArray = [
      {
        title: intl.get(`${commonPrompt}.localCurrencyTaxUnit`).d('本币单价(含税)'),
        width: 165,
        dataIndex: 'localCurrencyTaxUnit',
        render: (val, record) =>
          record.linelinePriceHiddenFlag === 1 ? (
            record.localCurrencyTaxUnitMeaning
          ) : ['create', 'update'].includes(record._status) && !isMatch ? (
            <FormItem>
              {record.$form.getFieldDecorator(`localCurrencyTaxUnit`, {
                initialValue: val,
              })(
                <NumberField
                  min={0}
                  disabled
                  numberGrouping
                  precision={
                    record.localDefaultPrecision && prSourcePlatform === 'SRM'
                      ? record.localDefaultPrecision
                      : 10
                  }
                />
              )}
            </FormItem>
          ) : (
            thousandBitSeparator(val, record.localDefaultPrecision, prSourcePlatform !== 'SRM')
          ),
      },
      {
        title: intl.get(`${commonPrompt}.localCurrencyTaxSum`).d('本币金额(含税)'),
        width: 165,
        dataIndex: 'localCurrencyTaxSum',
        render: (val, record) =>
          record.linePriceHiddenFlag === 1 ? (
            record.localCurrencyTaxSumMeaning
          ) : ['create', 'update'].includes(record._status) && !isMatch ? (
            <FormItem>
              {record.$form.getFieldDecorator(`localCurrencyTaxSum`, {
                initialValue: val,
              })(
                prSourcePlatform !== 'SRM' ? (
                  <NumberField
                    min={0}
                    disabled
                    numberGrouping
                    {...precisionParams(record.localFinancialPrecision, prSourcePlatform !== 'SRM')}
                  />
                ) : (
                  <Currency
                    min={0}
                    disabled
                    numberGrouping
                    {...precisionParams(record.localFinancialPrecision, prSourcePlatform !== 'SRM')}
                  />
                )
              )}
            </FormItem>
          ) : (
            thousandBitSeparator(val, record.localFinancialPrecision, prSourcePlatform !== 'SRM')
          ),
      },
      {
        title: intl.get(`${commonPrompt}.localCurrencyNoTaxUnit`).d('本币单价(不含税)'),
        width: 165,
        dataIndex: 'localCurrencyNoTaxUnit',
        render: (val, record) =>
          record.linePriceHiddenFlag === 1 ? (
            record.localCurrencyNoTaxUnitMeaning
          ) : ['create', 'update'].includes(record._status) && !isMatch ? (
            <FormItem>
              {record.$form.getFieldDecorator(`localCurrencyNoTaxUnit`, {
                initialValue: val,
              })(
                <NumberField
                  min={0}
                  disabled
                  precision={
                    record.localDefaultPrecision && prSourcePlatform === 'SRM'
                      ? record.localDefaultPrecision
                      : 10
                  }
                  numberGrouping
                />
              )}
            </FormItem>
          ) : (
            thousandBitSeparator(val, record.localDefaultPrecision, prSourcePlatform !== 'SRM')
          ),
      },
      {
        title: intl.get(`${commonPrompt}.localCurrencyNoTaxSum`).d('本币金额(不含税)'),
        width: 165,
        dataIndex: 'localCurrencyNoTaxSum',
        render: (val, record) =>
          record.linePriceHiddenFlag === 1 ? (
            record.localCurrencyNoTaxSumMeaning
          ) : ['create', 'update'].includes(record._status) && !isMatch ? (
            <FormItem>
              {record.$form.getFieldDecorator(`localCurrencyNoTaxSum`, {
                initialValue: val,
              })(
                prSourcePlatform !== 'SRM' ? (
                  <NumberField
                    min={0}
                    disabled
                    numberGrouping
                    {...precisionParams(record.localFinancialPrecision, prSourcePlatform !== 'SRM')}
                  />
                ) : (
                  <Currency
                    min={0}
                    disabled
                    numberGrouping
                    {...precisionParams(record.localFinancialPrecision, prSourcePlatform !== 'SRM')}
                  />
                )
              )}
            </FormItem>
          ) : (
            thousandBitSeparator(val, record.localFinancialPrecision, prSourcePlatform !== 'SRM')
          ),
      },
      {
        title: intl.get(`${commonPrompt}.lineNumber`).d('行号'),
        dataIndex: 'displayLineNum',
        width: 80,
      },
      {
        title: intl.get('entity.organization.class.inventory').d('库存组织'),
        dataIndex: 'invOrganizationId',
        width: 150,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) && !isMatch ? (
            <FormItem>
              {record.$form.getFieldDecorator(`invOrganizationName`, {
                initialValue: record.invOrganizationName,
              })}
              {record.$form.getFieldDecorator(`invOrganizationId`, {
                rules: [
                  {
                    required: !isEComAndReject,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('entity.organization.class.inventory').d('库存组织'),
                    }),
                  },
                ],
                initialValue: val,
              })(
                <TooltipLov
                  tipValue={
                    record.$form.getFieldValue('invOrganizationName') || record.invOrganizationName
                  }
                  code="SPFM.USER_AUTH.INVORG"
                  textValue={record.invOrganizationName}
                  queryParams={{
                    tenantId,
                    enabledFlag: 1,
                    ouId: getFieldValue('ouId'),
                  }}
                  // lovOptions={{ displayField: 'organizationName' }}
                  disabled={isEComAndReject}
                  // textField="invOrganizationName"
                  onChange={(value, lovRecord) => this.orgOnChange(value, lovRecord, record)}
                />
              )}
            </FormItem>
          ) : (
            <Tooltip title={record.invOrganizationName}>
              <span>{record.invOrganizationName}</span>
            </Tooltip>
          ),
      },
      {
        title: intl.get(`${commonPrompt}.productNum`).d('商品编码'),
        dataIndex: 'productNum',
        width: 120,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`productNum`, {
                initialValue: record.productNum,
              })(<Input disabled />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${commonPrompt}.productName`).d('商品名称'),
        width: 120,
        dataIndex: 'productName',
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`productName`, {
                initialValue: record.productName,
              })(<Input disabled />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${commonPrompt}.catalogName`).d('商品目录'),
        width: 120,
        dataIndex: 'catalogName',
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`catalogName`, {
                initialValue: record.catalogName,
              })(<Input disabled />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`sprm.common.model.common.thirdSkuCode`).d('第三方商品编码'),
        width: 120,
        dataIndex: 'thirdSkuCode',
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`thirdSkuCode`, {
                initialValue: record.thirdSkuCode,
              })(<Input disabled />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`sprm.common.model.common.thirdSkuName`).d('第三方商品名称'),
        width: 120,
        dataIndex: 'thirdSkuName',
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`thirdSkuName`, {
                initialValue: record.thirdSkuName,
              })(<Input disabled />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`sprm.common.shoppingMall.model.productBrand`).d('商品品牌'),
        dataIndex: 'productBrand',
        width: 120,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`productBrand`, {
                initialValue: record.productBrand,
              })(<Input disabled />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`sprm.common.shoppingMall.model.productModel`).d('商品型号'),
        dataIndex: 'productModel',
        width: 120,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`productModel`, {
                initialValue: record.productModel,
              })(<Input disabled />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`sprm.common.shoppingMall.model.packingList`).d('商品规格'),
        dataIndex: 'packingList',
        width: 120,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`packingList`, {
                initialValue: record.packingList,
              })(<Input disabled />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`entity.item.code`).d('物料编码'),
        dataIndex: 'itemCode',
        width: 120,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) && !isMatch ? (
            <FormItem>
              {record.$form.getFieldDecorator(`itemCode`, {
                initialValue: record.itemCode,
              })}

              {record.$form.getFieldDecorator(`itemId`, {
                rules: [
                  {
                    required: (record.$form.getFieldValue('requiredFieldNames') || []).includes(
                      'itemId'
                    ),
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('entity.item.code').d('物料编码'),
                    }),
                  },
                ],
                initialValue: record.itemId,
              })(
                <TooltipLov
                  tipValue={record.$form.getFieldValue('itemCode') || record.itemCode}
                  code="SPRM.ITEM_RELATE_PUR_PRICE"
                  onChange={(value, lovRecord) => {
                    this.handleItemOnChange(value, lovRecord, record);
                  }}
                  lovOptions={{ valueField: 'itemId', displayField: 'itemCode' }}
                  textValue={val}
                  textField="itemCode"
                  queryParams={this.getQueryItemParams(itemLimitRule, record)}
                  originTenantId={getCurrentOrganizationId()}
                  disabled={this.itemChangeDisabled(isCatalogOrECom, itemLimitRule, record)}
                />
              )}
            </FormItem>
          ) : (
            <Tooltip title={val}>
              <span>{val}</span>
            </Tooltip>
          ),
      },
      {
        title: intl.get(`entity.item.name`).d('物料名称'),
        dataIndex: 'itemName',
        width: 120,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) && !isMatch ? (
            <FormItem>
              {record.$form.getFieldDecorator(`itemName`, {
                rules: [
                  {
                    required: !isCatalogOrECom,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`entity.item.name`).d('物料名称'),
                    }),
                  },
                  {
                    max: 360,
                    message: intl.get('hzero.common.validation.max', {
                      max: 360,
                    }),
                  },
                ],
                initialValue: record.itemName,
              })(
                <TooltipInput
                  tipValue={record.$form.getFieldValue('itemName')}
                  disabled={isEComAndReject}
                />
              )}
              {/* </Tooltip> */}
            </FormItem>
          ) : (
            <Tooltip title={val}>
              <span>{val}</span>
            </Tooltip>
          ),
      },
      {
        title: intl.get(`${commonPrompt}.categoryName`).d('物料分类'),
        dataIndex: 'categoryId',
        width: 120,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) && !isMatch ? (
            <FormItem>
              {record.$form.getFieldDecorator(`categoryName`, {
                initialValue: record.categoryName,
              })}
              {record.$form.getFieldDecorator(`categoryId`, {
                rules: [
                  {
                    required: (record.$form.getFieldValue('requiredFieldNames') || []).includes(
                      'categoryId'
                    ),
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${commonPrompt}.categoryName`).d('物料分类'),
                    }),
                  },
                ],
                initialValue: val,
              })(
                <TooltipLov
                  tipValue={record.$form.getFieldValue('categoryName')}
                  // code="SMDM.TREE_ITEM_CATEGORY_TILED_NEW"
                  code="SMDM.CATEGORY.LEVEL_CONTROL_TREE"
                  // extSetMap="categoryName"
                  textValue={record.categoryName}
                  textField="categoryName"
                  disabled={isEComAndReject}
                  purchaseOrgId={getFieldValue('purchaseOrgId')}
                  queryParams={{
                    tenantId,
                    enabledFlag: 1,
                    module: 'PR',
                    purchaseOrgId: getFieldValue('purchaseOrgId'),
                    queryCategoryId: getFieldValue('categoryId'),
                    itemId: record.$form.getFieldValue('itemId'),
                    prTypeId: getFieldValue('prTypeId'),
                    businessObjectCode: 'SRM_C_SRM_SPRM_PR_HEADER',
                    hzeroUIFlag: 1,
                  }}
                  onChange={(value, lovRecord) => {
                    this.handleCategoryOnChange(value, lovRecord, record);
                  }}
                  tableDsProps={{
                    record: {
                      dynamicProps: {
                        selectable: (_record) => _record.get('isCheck') !== false,
                      },
                    },
                  }}
                  tableProps={{
                    virtual: true,
                    style: { maxHeight: '500px' },
                  }}
                />
              )}
            </FormItem>
          ) : (
            <Tooltip title={record.categoryName}>
              <span>{record.categoryName}</span>
            </Tooltip>
          ),
      },
      {
        title: intl.get(`${commonPrompt}.customMadeFlag`).d('是否定制物料'),
        dataIndex: 'customMadeFlag',
        width: 180,
        render: (value, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {
                (record.$form.getFieldDecorator(`customMadeFlag`, {
                  initialValue: record.customMadeFlag,
                }),
                (<span>{yesOrNoRender(value)}</span>))
              }
            </FormItem>
          ) : (
            yesOrNoRender(value)
          ),
      },
      {
        title: intl.get(`${commonPrompt}.customAttributeList`).d('定制属性'),
        dataIndex: 'customAttributeList',
        width: 180,
        render: (value, record) => {
          const customMadeFlag = record.$form
            ? record.$form.getFieldValue('customMadeFlag')
            : record.customMadeFlag;
          return (
            customMadeFlag === 1 && (
              <ItemCustom
                {...{
                  dispatch,
                  customAttributeList: value,
                  record,
                  customMadeFlag,
                }}
              />
            )
          );
        },
      },
      {
        title: intl.get(`${commonPrompt}.uomName`).d('单位'),
        dataIndex: 'secondaryUomId',
        width: 180,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) && !isMatch ? (
            <FormItem>
              {record.$form.getFieldDecorator('secondaryUomPrecision', {
                initialValue: record.secondaryUomPrecision,
              })}
              {record.$form.getFieldDecorator('secondaryUomCodeAndName', {
                initialValue: record.secondaryUomCodeAndName,
              })}
              {record.$form.getFieldDecorator(`secondaryUomId`, {
                rules: [
                  {
                    required:
                      record.freightLineFlag === 1
                        ? false
                        : !(setting === '1'
                            ? isEComAndReject ||
                              (prSourcePlatform === 'SRM' && record.$form.getFieldValue('itemCode'))
                            : isEComAndReject),
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${commonPrompt}.uomName`).d('单位'),
                    }),
                  },
                ],
                initialValue: record.secondaryUomId,
              })(
                // setting === '1' ? (
                <Lov
                  code="SMDM_ITEM_ORG_UOM"
                  lovOptions={{ displayField: 'uomCodeAndName' }}
                  textValue={record.secondaryUomCodeAndName || record.secondaryUomName}
                  disabled={
                    isEComAndReject ||
                    (prSourcePlatform === 'SRM' &&
                      setting === '1' &&
                      record.$form.getFieldValue('itemCode'))
                  }
                  queryParams={{
                    tenantId,
                    itemId: record.$form.getFieldValue('itemId') || record.itemId,
                    invOrganizationId: record.$form.getFieldValue('invOrganizationId'),
                  }}
                  onChange={(_, lovRecord) => this.handleUomChange(lovRecord, record)}
                />
              )}
            </FormItem>
          ) : (
            record.secondaryUomCodeAndName
          ),
      },
      {
        title: intl.get(`${commonPrompt}.quantity`).d('数量'),
        dataIndex: 'secondaryQuantity',
        width: 120,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) && !isMatch ? (
            <FormItem>
              {record.$form.getFieldDecorator(`secondaryQuantity`, {
                rules: [
                  {
                    required: !(isEComAndReject || isCatalogOrECom),
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${commonPrompt}.quantity`).d('数量'),
                    }),
                  },
                  {
                    validator: (_, value, callback) => {
                      if (value <= 0) {
                        callback(
                          intl.get(`sprm.common.message.quantityMustExceedZero`).d('数量必须大于零')
                        );
                      } else {
                        callback();
                      }
                    },
                  },
                ],
                initialValue: record.secondaryQuantity,
              })(
                <NumberField
                  numberGrouping
                  min={0}
                  precision={
                    record.$form.getFieldValue('secondaryUomPrecision') ??
                    record.secondaryUomPrecision ??
                    10
                  }
                  onChange={(value) => {
                    if (dualUnitSetting) {
                      const { getFieldValue: getRecordFieldValue } = record ? record.$form : {};
                      if (
                        record.prLineId &&
                        getRecordFieldValue('secondaryUomId') &&
                        value &&
                        getRecordFieldValue('uomId') &&
                        getRecordFieldValue('itemId')
                      ) {
                        fetchQuantity([
                          {
                            businessKey: 1,
                            secondaryUomId: getRecordFieldValue('secondaryUomId'),
                            secondaryQuantity: value,
                            doublePrimaryUomId: getRecordFieldValue('uomId'),
                            itemId: getRecordFieldValue('itemId'),
                          },
                        ]).then((res) => {
                          const result = getResponse(res);
                          if (result && !res.failed) {
                            this.setState({
                              listDataSource: listDataSource?.map((item) => {
                                if (item.prLineId === record.prLineId) {
                                  return {
                                    ...item,
                                    quantity: res[0]?.primaryQuantity,
                                  };
                                }
                                return item;
                              }),
                            });
                          }
                        });
                      } else {
                        this.setState({
                          listDataSource: listDataSource?.map((item) => {
                            if (item.prLineId === record.prLineId) {
                              return {
                                ...item,
                                quantity: value || item.quantity,
                              };
                            }
                            return item;
                          }),
                        });
                      }
                    }
                  }}
                  disabled={isEComAndReject || isCatalogOrECom}
                />
              )}
            </FormItem>
          ) : (
            numberPrecision(val, record.uomPrecision)
          ),
      },
      {
        title:
          dualUnitSetting === 1
            ? intl.get(`${commonPrompt}.baseUom`).d('基本单位')
            : intl.get(`${commonPrompt}.uomName`).d('单位'),
        dataIndex: 'uomId',
        width: 180,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) && !isMatch && !dualUnitSetting ? (
            <FormItem>
              {record.$form.getFieldDecorator('uomPrecision', {
                initialValue: record.uomPrecision,
              })}
              {record.$form.getFieldDecorator('uomCodeAndName', {
                initialValue: record.uomCodeAndName,
              })}
              {record.$form.getFieldDecorator('uomName', {
                initialValue: record.uomName,
              })}
              {record.$form.getFieldDecorator('uomCode', {
                initialValue: record.uomCode,
              })}
              {record.$form.getFieldDecorator(`uomId`, {
                rules: [
                  {
                    required:
                      record.freightLineFlag === 1
                        ? false
                        : !(setting === '1'
                            ? isEComAndReject ||
                              (prSourcePlatform === 'SRM' &&
                                setting === '1' &&
                                record.$form.getFieldValue('itemCode'))
                            : isEComAndReject),
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${commonPrompt}.baseUomName`).d('单位'),
                    }),
                  },
                ],
                initialValue: record.uomId,
              })(
                // setting === '1' ? (
                <Lov
                  code="SMDM.DUAL_UOM_ID"
                  lovOptions={{
                    valueField: 'uomId',
                  }}
                  textField="uomCodeAndName"
                  textValue={record.uomCodeAndName}
                  disabled={
                    isEComAndReject ||
                    dualUnitSetting ||
                    (prSourcePlatform === 'SRM' &&
                      setting === '1' &&
                      record.$form.getFieldValue('itemCode'))
                  }
                  queryParams={{
                    tenantId,
                    itemId: record.$form.getFieldValue('itemId') || record.itemId,
                    invOrganizationId: record.$form.getFieldValue('invOrganizationId'),
                  }}
                  onChange={(_, lovRecord = {}) => {
                    // eslint-disable-next-line no-param-reassign
                    record.uomPrecision = lovRecord.uomPrecision;
                    record.$form.setFieldsValue({
                      uomPrecision: lovRecord.uomPrecision,
                      unitFlag: +setting,
                      uomCode: lovRecord.uomCode,
                    });
                    if (
                      isNumber(lovRecord.uomPrecision) &&
                      record.$form.getFieldValue('quantity')
                    ) {
                      record.$form.setFieldsValue({
                        quantity: round(
                          +record.$form.getFieldValue('quantity'),
                          lovRecord.uomPrecision
                        ).toFixed(lovRecord.uomPrecision),
                      });
                    }
                    this.props.notificationForMaterial();
                  }}
                />
              )}
            </FormItem>
          ) : (
            <FormItem>{record.uomCodeAndName}</FormItem>
          ),
      },
      {
        title:
          dualUnitSetting === 1
            ? intl.get(`${commonPrompt}.baseQuantity`).d('基础数量')
            : intl.get(`${commonPrompt}.quantity`).d('数量'),
        dataIndex: 'quantity',
        width: 120,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) && !isMatch && !dualUnitSetting ? (
            <FormItem>
              {record.$form.getFieldDecorator(`quantity`, {
                rules: [
                  {
                    required: !(isEComAndReject || isCatalogOrECom),
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${commonPrompt}.baseQuantity`).d('基础数量'),
                    }),
                  },
                  {
                    validator: (_, value, callback) => {
                      if (value <= 0) {
                        callback(
                          intl.get(`sprm.common.message.quantityMustExceedZero`).d('数量必须大于零')
                        );
                      } else {
                        callback();
                      }
                    },
                  },
                ],
                initialValue: record.quantity,
              })(
                <NumberField
                  numberGrouping
                  min={0}
                  precision={
                    record.$form.getFieldValue('uomPrecision')
                      ? record.$form.getFieldValue('uomPrecision') || record.uomPrecision
                      : 10
                  }
                  disabled={isEComAndReject || dualUnitSetting || isCatalogOrECom}
                />
              )}
            </FormItem>
          ) : (
            numberPrecision(val, record.uomPrecision)
          ),
      },
      {
        title: intl.get(`${commonPrompt}.neededDate`).d('需求日期'),
        width: 150,
        dataIndex: 'neededDate',
        render: (val, record) =>
          ['create', 'update'].includes(record._status) && !isMatch ? (
            <FormItem>
              {record.$form.getFieldDecorator(`neededDate`, {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${commonPrompt}.neededDate`).d('需求日期'),
                    }),
                  },
                ],
                initialValue: record.neededDate
                  ? moment(record.neededDate, DEFAULT_DATE_FORMAT)
                  : undefined,
              })(
                <DatePicker
                  disabled={isEComAndReject}
                  placeholder={null}
                  format={DEFAULT_DATE_FORMAT}
                  disabledDate={(current) =>
                    current && current < moment('1970-01-01').startOf('day')
                  }
                />
              )}
            </FormItem>
          ) : (
            dateRender(val)
          ),
      },
      {
        title: intl.get(`${commonPrompt}.taxType`).d('税种'),
        dataIndex: 'taxId',
        width: 120,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) && !isMatch ? (
            <FormItem>
              {record.$form.getFieldDecorator(`taxId`, {
                rules: [
                  {
                    required: (record.$form.getFieldValue('requiredFieldNames') || []).includes(
                      'taxId'
                    ),
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${commonPrompt}.taxType`).d('税种'),
                    }),
                  },
                ],
                initialValue: record.taxId,
              })(
                <Lov
                  code="SPRM.TAX"
                  textField="taxCode"
                  textValue={record.taxCode}
                  disabled={isEComAndReject || isCatalogOrECom}
                  queryParams={{ tenantId, taxFrom: 'RATIO' }}
                  onChange={(value, { taxRate, taxId, includedTaxFlag }) => {
                    record.$form.registerField('includedTaxFlag');
                    record.$form.setFieldsValue({ taxRate, taxId, includedTaxFlag });
                  }}
                />
              )}
              {record.$form.getFieldDecorator(`taxRate`, { initialValue: record.taxRate })}
            </FormItem>
          ) : (
            record.taxCode
          ),
      },
      {
        title: intl.get(`${commonPrompt}.taxRate`).d('税率'),
        dataIndex: 'taxRate',
        width: 120,
        render: (_, record) =>
          ['create', 'update'].includes(record._status) && !isMatch ? (
            <FormItem>
              {record.$form.getFieldDecorator(`taxRate`, {
                initialValue: record.taxRate,
              })(<span>{record.$form.getFieldValue('taxRate')}</span>)}
            </FormItem>
          ) : (
            record.taxRate
          ),
      },
      {
        title: intl.get(`${commonPrompt}.currencyCode`).d('币种'),
        dataIndex: 'currencyCode',
        width: 120,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) && !isMatch ? (
            <FormItem>
              {record.$form.getFieldDecorator(`currencyCode`, {
                rules: [
                  {
                    required: (record.$form.getFieldValue('requiredFieldNames') || []).includes(
                      'currencyCode'
                    ),
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${commonPrompt}.currencyCode`).d('币种'),
                    }),
                  },
                ],
                initialValue: record.currencyCode,
              })(
                <Lov
                  code="SPRM.EXCHANGE_RATE.CURRENCY"
                  disabled // isEComAndReject || isCatalogOrECom srm-39599
                  textValue={record.currencyCode}
                  textField="currencyCode"
                  queryParams={{ tenantId }}
                />
              )}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${commonPrompt}.taxIncludedUnitPrice`).d('预估单价(含税)'),
        width: 165,
        dataIndex: 'secondaryTaxInUnitPrice',
        align: 'right',
        render: (val, record) =>
          record.linePriceHiddenFlag === 1 ? (
            record.taxIncludedUnitPriceMeaning
          ) : ['create', 'update'].includes(record._status) && !isMatch ? (
            <FormItem>
              {record.$form.getFieldDecorator(`secondaryTaxInUnitPrice`, {
                rules: [
                  {
                    required: (record.$form.getFieldValue('requiredFieldNames') || []).includes(
                      'secondaryTaxInUnitPrice'
                    ),
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${commonPrompt}.taxIncludedUnitPrice`).d('预估单价(含税)'),
                    }),
                  },
                ],
                initialValue: val,
              })(
                <NumberField
                  min={0}
                  numberGrouping
                  precision={
                    record.defaultPrecision && prSourcePlatform === 'SRM'
                      ? record.defaultPrecision
                      : 10
                  }
                  disabled={isEComAndReject || isCatalogOrECom || !basePriceFlag}
                />
              )}
            </FormItem>
          ) : (
            thousandBitSeparator(val, record.defaultPrecision, prSourcePlatform !== 'SRM')
          ),
      },
      {
        title:
          dualUnitSetting === 1
            ? intl.get(`${commonPrompt}.baseTaxIncludedUnitPrice`).d('预估单价(含税)-基本单位')
            : intl.get(`${commonPrompt}.taxIncludedUnitPrice`).d('预估单价(含税)'),
        width: 165,
        dataIndex: 'taxIncludedUnitPrice',
        align: 'right',
        render: (val, record) =>
          record.linePriceHiddenFlag === 1 ? (
            record.taxIncludedUnitPriceMeaning
          ) : ['create', 'update'].includes(record._status) && !isMatch && !dualUnitSetting ? (
            <FormItem>
              {record.$form.getFieldDecorator(`taxIncludedUnitPrice`, {
                initialValue: record.taxIncludedUnitPrice,
              })(
                <NumberField
                  min={0}
                  numberGrouping
                  precision={
                    record.defaultPrecision && prSourcePlatform === 'SRM'
                      ? record.defaultPrecision
                      : 10
                  }
                  disabled={isEComAndReject || dualUnitSetting || isCatalogOrECom || !basePriceFlag}
                />
              )}
            </FormItem>
          ) : (
            thousandBitSeparator(val, record.defaultPrecision, prSourcePlatform !== 'SRM')
          ),
      },
      {
        title: intl.get(`${commonPrompt}.lineAmount`).d('行金额'),
        dataIndex: 'taxIncludedLineAmount',
        width: 120,
        align: 'right',
        render: (val, record) =>
          record.linePriceHiddenFlag === 1
            ? record.taxIncludedLineAmountMeaning
            : thousandBitSeparator(val, record.financialPrecision, prSourcePlatform !== 'SRM'),
      },
      {
        title: intl.get(`${commonPrompt}.lineFreight`).d('行运费'),
        dataIndex: 'lineFreight',
        width: 120,
        align: 'right',
        render: (val, record) =>
          record.linePriceHiddenFlag === 1
            ? record.lineFreightMeaning
            : thousandBitSeparator(val, record.financialPrecision, prSourcePlatform !== 'SRM'),
      },
      {
        title: intl.get(`${commonPrompt}.taxIncludedBudgetUnitPrice`).d('预算单价(含税)'),
        dataIndex: 'taxIncludedBudgetUnitPrice',
        width: 120,
        align: 'right',
        render: (val, record) =>
          record.linePriceHiddenFlag === 1 ? (
            record.taxIncludedBudgetUnitPriceMeaning
          ) : ['create', 'update'].includes(record._status) && !isMatch ? (
            <FormItem>
              {record.$form.getFieldDecorator(`taxIncludedBudgetUnitPrice`, {
                initialValue: val,
              })(
                <NumberField
                  numberGrouping
                  precision={
                    record.$form.getFieldValue('uomPrecision') && prSourcePlatform === 'SRM'
                      ? record.uomPrecision
                      : 10
                  }
                />
              )}
            </FormItem>
          ) : (
            thousandBitSeparator(val, record.defaultPrecision, prSourcePlatform !== 'SRM')
          ),
      },
      {
        title: intl.get(`${commonPrompt}.budgetAccountName`).d('预算科目'),
        dataIndex: 'budgetAccountId',
        width: 120,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) && !isMatch ? (
            <FormItem>
              {record.$form.getFieldDecorator('budgetAccountNum', {
                initialValue: record.budgetAccountNum,
              })}
              {record.$form.getFieldDecorator('budgetAccountId', {
                initialValue: record.budgetAccountId,
              })(
                <Lov
                  code="SMDM.BUDGET_ACCOUNT"
                  textValue={record.budgetAccountName}
                  queryParams={{ tenantId, companyId: getFieldValue('companyId') }}
                  lovOptions={{ displayField: 'budgetAccountName', valueField: 'budgetAccountId' }}
                  onChange={(_, data) => {
                    record.$form.setFieldsValue({
                      budgetAccountNum: data.budgetAccountNum,
                    });
                  }}
                />
              )}
            </FormItem>
          ) : (
            record.budgetAccountName
          ),
      },
      {
        title: intl.get(`${commonPrompt}.budgetIoFlag`).d('预算外标识'),
        dataIndex: 'budgetIoFlag',
        width: 120,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) && !isMatch ? (
            <FormItem>
              {record.$form.getFieldDecorator('budgetIoFlag', {
                initialValue: record.budgetIoFlag,
              })(<Checkbox checkedValue={1} unCheckedValue={0} />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${modelPrompt}.supplierCompanyId`).d('建议供应商'),
        width: 120,
        dataIndex: 'supplierCompanyLists',
        render: (_, record) =>
          ['create', 'update'].includes(record._status) && !isMatch ? (
            <FormItem>
              {record.$form.getFieldDecorator(`displaySupplierName`, {
                rules: [
                  {
                    required: (record.$form.getFieldValue('requiredFieldNames') || []).includes(
                      'displaySupplierName'
                    ),
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${modelPrompt}.supplierCompanyId`).d('建议供应商'),
                    }),
                  },
                ],
                initialValue: record.supplierName || record.supplierCompanyName,
              })(
                <MultipleLov
                  code="SPRM.SUPPLIER"
                  textValue={record.supplierName || record.supplierCompanyName}
                  disabled={isEComAndReject || isCatalogOrECom}
                  queryParams={{ tenantId, companyId: getFieldValue('companyId') }}
                  allowClear
                  lovOptions={{ displayField: 'displaySupplierName' }}
                  oldValueField="supplierList"
                  oldValue={record.supplierList}
                />
              )}
              {record.$form.getFieldDecorator('newSupplierList', {
                initialValue: record.supplierList,
              })}
            </FormItem>
          ) : (
            <Tooltip title={record.displaySupplierName}>
              <span>{record.displaySupplierName}</span>
            </Tooltip>
          ),
      },
      {
        title: intl.get(`${modelPrompt}.supplierCompanyId`).d('建议供应商'),
        width: 120,
        dataIndex: 'supplierCompanyId',
        render: (_, record) =>
          ['create', 'update'].includes(record._status) && !isMatch ? (
            <FormItem>
              {record.$form.getFieldDecorator(`displaySupplierName`, {
                rules: [
                  {
                    required: (record.$form.getFieldValue('requiredFieldNames') || []).includes(
                      'displaySupplierName'
                    ),
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${modelPrompt}.supplierCompanyId`).d('建议供应商'),
                    }),
                  },
                ],
                initialValue: record.supplierName || record.supplierCompanyName,
              })(
                <TooltipLov
                  tipValue={record.supplierName || record.supplierCompanyName}
                  code="SPRM.SUPPLIER"
                  textValue={record.supplierName || record.supplierCompanyName}
                  disabled={isEComAndReject || isCatalogOrECom}
                  queryParams={{ tenantId, companyId: getFieldValue('companyId') }}
                  lovOptions={{ displayField: 'displaySupplierName' }}
                  onChange={(value, lovRecord) =>
                    this.handleChangeSupplier(value, lovRecord, record)
                  }
                />
              )}
              {record.$form.getFieldDecorator('supplierCompanyId', {
                initialValue: record.supplierCompanyId,
              })}
            </FormItem>
          ) : (
            <Tooltip title={record.displaySupplierName}>
              <span>{record.displaySupplierName}</span>
            </Tooltip>
          ),
      },
      {
        title: intl.get(`${modelPrompt}.lastPurPrice`).d('上次采购单价'),
        width: 120,
        dataIndex: 'lastPurPrice',
        render: (_, record) => (
          <PriceModal
            {...{
              dispatch,
              item: listDataSource.find(({ prLineId }) => record.prLineId === prLineId),
            }}
          />
        ),
      },
      {
        title: intl.get(`${modelPrompt}.xyNum`).d('协议编号'),
        dataIndex: 'pcNum',
        width: 150,
      },
      {
        title: intl.get(`${modelPrompt}.prMan`).d('申请人'),
        dataIndex: 'prRequestedName',
        width: 150,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) && !isMatch ? (
            <FormItem>
              {record.$form.getFieldDecorator(`requestedBy`, {
                rules: [
                  {
                    required: (record.$form.getFieldValue('requiredFieldNames') || []).includes(
                      'requestedBy'
                    ),
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${modelPrompt}.prMan`).d('申请人'),
                    }),
                  },
                ],
                initialValue: record.requestedBy,
              })(
                <Lov
                  code="SPCM.ACCEPT_USER"
                  textValue={
                    record.prRequestedNum
                      ? `${record.prRequestedNum}-${record.prRequestedName}`
                      : record.prRequestedName
                  }
                  queryParams={{ tenantId }}
                  textField="prRequestedString"
                  onChange={(value, dataList) => this.changeRequestedBy(value, dataList, record)}
                />
              )}
              {/* {record.$form.getFieldDecorator('prRequestedName', {
                initialValue: record.prRequestedName,
              })} */}
            </FormItem>
          ) : (
            <span>
              {record.prRequestedNum
                ? `${record.prRequestedName}-${record.prRequestedNum}`
                : record.prRequestedName}
            </span>
          ),
      },
      {
        title: intl.get(`${commonPrompt}.purchaseAgentName`).d('采购员'),
        dataIndex: 'agentName',
        width: 150,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) && !isMatch ? (
            <FormItem>
              {record.$form.getFieldDecorator(`purchaseAgentId`, {
                rules: [
                  {
                    required: (record.$form.getFieldValue('requiredFieldNames') || []).includes(
                      'purchaseAgentId'
                    ),
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${commonPrompt}.purchaseAgentName`).d('采购员'),
                    }),
                  },
                ],
                initialValue: record.purchaseAgentId,
              })(
                <Lov
                  code="SMDM.PURCHASE_AGENT"
                  textValue={val}
                  textField="agentName"
                  queryParams={{ tenantId }}
                  onChange={(value, lovRecord) => this.agentNameCenter(value, lovRecord, record)}
                />
              )}
              {record.$form.getFieldDecorator('agentName', {
                initialValue: record.agentName,
              })}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${commonPrompt}.handlePerson`).d('需求执行人'),
        dataIndex: 'executorName',
        width: 150,
      },
      {
        title: intl.get(`${commonPrompt}.moneyPayPart`).d('费用承担部门'),
        dataIndex: 'expBearDep',
        width: 150,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) && !isMatch ? (
            <FormItem>
              {record.$form.getFieldDecorator(`expBearDepId`, {
                rules: [
                  {
                    required: (record.$form.getFieldValue('requiredFieldNames') || []).includes(
                      'expBearDepId'
                    ),
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${commonPrompt}.moneyPayPart`).d('费用承担部门'),
                    }),
                  },
                ],
                initialValue: record.expBearDepId,
              })(
                <Lov
                  code="SPFM.UNIT_G_C"
                  textValue={val}
                  textField="expBearDep"
                  queryParams={{
                    organizationId: tenantId,
                    // levelPathFrom: 0,
                    // levelPathTo: 3,
                    unitTypeCode: 'D',
                    unitCompanyId: getFieldValue('parentUnitId'),
                  }}
                  onChange={(_, data) => {
                    record.$form.setFieldsValue({
                      budgetAccountNum: data.expBearDep,
                    });
                  }}
                />
              )}
              {record.$form.getFieldDecorator('expBearDep', {
                initialValue: record.expBearDep,
              })}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`sprm.common.model.costCenter`).d('成本中心'),
        width: 120,
        dataIndex: 'costId',
        render: (val, record) =>
          ['create', 'update'].includes(record._status) && !isMatch ? (
            <FormItem>
              {record.$form.getFieldDecorator(`costId`, {
                rules: [
                  {
                    required: (record.$form.getFieldValue('requiredFieldNames') || []).includes(
                      'costId'
                    ),
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`sprm.common.model.costCenter`).d('成本中心'),
                    }),
                  },
                ],
                initialValue: record.costId,
              })(
                <Lov
                  disabled={!getFieldValue('companyId')}
                  code="SPRM.COST_CENTER"
                  textValue={record.costName}
                  textField="costName"
                  lovOptions={{ valueField: 'costId', displayField: 'costName' }}
                  queryParams={{
                    companyId: getFieldValue('companyId'),
                    tenantId,
                    ouId: getFieldValue('ouId'),
                  }}
                  onChange={(value, lovRecord) => this.handleCostCenter(value, lovRecord, record)}
                />
              )}
              {record.$form.getFieldDecorator('costName', {})}
            </FormItem>
          ) : (
            record.costName
          ),
      },
      {
        title: intl.get(`sprm.common.model.sumProject`).d('总帐科目'),
        width: 120,
        dataIndex: 'accountSubjectId',
        render: (val, record) =>
          ['create', 'update'].includes(record._status) && !isMatch ? (
            <FormItem>
              {record.$form.getFieldDecorator(`accountSubjectId`, {
                rules: [
                  {
                    required: (record.$form.getFieldValue('requiredFieldNames') || []).includes(
                      'accountSubjectId'
                    ),
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`sprm.common.model.sumProject`).d('总帐科目'),
                    }),
                  },
                ],
                initialValue: val,
              })(
                <Lov
                  disabled={!getFieldValue('companyId')}
                  code="SPRM.ACCOUNT_SUBJECT"
                  textValue={record.accountSubjectName}
                  textField="accountSubjectName"
                  lovOptions={{
                    valueField: 'accountSubjectId',
                    displayField: 'accountSubjectName',
                  }}
                  queryParams={{ tenantId, companyId: getFieldValue('companyId') }}
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
        title: intl.get(`sprm.common.model.wbs`).d('WBS元素'),
        width: 165,
        dataIndex: 'wbsCode',
        align: 'left',
        render: (val, record) =>
          ['create', 'update'].includes(record._status) && !isMatch ? (
            <FormItem>
              {record.$form.getFieldDecorator(`wbsCode`, {
                rules: [
                  {
                    required: (record.$form.getFieldValue('requiredFieldNames') || []).includes(
                      'wbsCode'
                    ),
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`sprm.common.model.wbs`).d('WBS元素'),
                    }),
                  },
                ],
                initialValue: val,
              })(
                <Lov
                  code="SMDM.WBS"
                  onChange={(value, lovRecord) => this.handleWbs(value, lovRecord, record)}
                  lovOptions={{ valueField: 'wbsCode' }}
                  textValue={record.wbs || record.wbsName}
                  queryParams={{
                    tenantId,
                    companyId: getFieldValue('companyId'),
                    ouId: getFieldValue('ouId'),
                  }}
                />
              )}
              {record.$form.getFieldDecorator('wbs', { initialValue: record.wbs })}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${commonPrompt}.projectNum`).d('项目号'),
        width: 165,
        dataIndex: 'projectNum',
        align: 'left',
        render: (val, record) =>
          ['create', 'update'].includes(record._status) && !isMatch ? (
            <FormItem>
              {record.$form.getFieldDecorator(`projectNum`, {
                rules: [
                  {
                    max: 60,
                    message: intl.get('hzero.common.validation.max', { max: 60 }),
                  },
                  {
                    required: (record.$form.getFieldValue('requiredFieldNames') || []).includes(
                      'projectNum'
                    ),
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${commonPrompt}.projectNum`).d('项目号'),
                    }),
                  },
                ],
                initialValue: val,
              })(<Input />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${commonPrompt}.projectName`).d('项目名称'),
        width: 165,
        dataIndex: 'projectName',
        align: 'left',
        render: (val, record) =>
          ['create', 'update'].includes(record._status) && !isMatch ? (
            <FormItem>
              {record.$form.getFieldDecorator(`projectName`, {
                rules: [
                  {
                    max: 240,
                    message: intl.get('hzero.common.validation.max', { max: 240 }),
                  },
                  {
                    required: (record.$form.getFieldValue('requiredFieldNames') || []).includes(
                      'projectName'
                    ),
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${commonPrompt}.projectName`).d('项目名称'),
                    }),
                  },
                ],
                initialValue: val,
              })(<Input />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${commonPrompt}.itemModel`).d('型号'),
        width: 165,
        dataIndex: 'itemModel',
        align: 'left',
        render: (val, record) =>
          ['create', 'update'].includes(record._status) && !isMatch ? (
            <FormItem>
              {record.$form.getFieldDecorator(`itemModel`, {
                initialValue: val,
              })(<Input disabled />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${commonPrompt}.itemSpecs`).d('规格'),
        width: 165,
        dataIndex: 'itemSpecs',
        align: 'left',
        render: (val, record) =>
          ['create', 'update'].includes(record._status) && !isMatch ? (
            <FormItem>
              {record.$form.getFieldDecorator(`itemSpecs`, {
                initialValue: val,
              })(<Input disabled />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get('hzero.common.remark').d('备注'),
        dataIndex: 'remark',
        width: 300,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) && !isMatch ? (
            <FormItem>
              {record.$form.getFieldDecorator(`remark`, {
                rules: [
                  {
                    required: (record.$form.getFieldValue('requiredFieldNames') || []).includes(
                      'remark'
                    ),
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`hzero.common.remark`).d('备注'),
                    }),
                  },
                ],
                initialValue: record.remark,
              })(
                <Input
                  style={{ minWidth: '250px' }}
                  disabled={isEComAndReject || isEComAndReject}
                />
              )}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get('entity.attachment.tag').d('附件'),
        dataIndex: 'attachment',
        width: 130,
        render: (val, record) =>
          ['update'].includes(record._status) && !isMatch ? (
            <FormItem>
              {record.$form.getFieldDecorator(`attachmentUuid`, {
                initialValue: record.attachmentUuid,
              })(
                <UploadModal
                  attachmentUUID={record.attachmentUuid}
                  afterOpenUploadModal={(attachmentUuid) =>
                    this.bindLineAttachmentUuid(attachmentUuid, record)
                  }
                  {...uploadProps}
                />
              )}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`sprm.purchaseReqCreation.view.message.priceList`).d('比价单'),
        dataIndex: 'priceList',
        width: 130,
        render: (_, record) => {
          return (
            <a
              onClick={() => {
                const priceData =
                  (record && record?.productCompareJson && JSON.parse(record.productCompareJson)) ??
                  [];
                this.setState({ priceListModalVisible: true, priceData });
              }}
            >
              {intl.get(`sprm.purchaseReqCreation.view.message.priceList`).d('比价单')}
            </a>
          );
        },
      },
      {
        title: intl.get(`${commonPrompt}.projectCategory`).d('项目类别'),
        width: 165,
        dataIndex: 'projectCategory',
        render: (val, record) =>
          ['create', 'update'].includes(record._status) && !isMatch ? (
            <FormItem>
              {record.$form.getFieldDecorator(`projectCategory`, {
                rules: [
                  {
                    required: (record.$form.getFieldValue('requiredFieldNames') || []).includes(
                      'projectCategory'
                    ),
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${commonPrompt}.projectCategory`).d('项目类别'),
                    }),
                  },
                ],
                initialValue: record.projectCategory,
              })(
                <Lov
                  code="SPUC.PR_LINE_PROJECT_CATEHORY"
                  textValue={record.projectCategoryMeaning}
                  queryParams={{ tenantId: 0 }}
                />
              )}
            </FormItem>
          ) : (
            record.projectCategoryMeaning
          ),
      },
      {
        title: intl.get(`${commonPrompt}.unitPriceBatch`).d('每'),
        width: 120,
        dataIndex: 'unitPriceBatch',
        render: (val, record) =>
          ['create', 'update'].includes(record._status) && !isMatch ? (
            <FormItem>
              {record.$form.getFieldDecorator(`unitPriceBatch`, {
                initialValue: val,
                rules: [
                  {
                    required: (record.$form.getFieldValue('requiredFieldNames') || []).includes(
                      'unitPriceBatch'
                    ),
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${commonPrompt}.unitPriceBatch`).d('每'),
                    }),
                  },
                ],
              })(
                <NumberField
                  min={0}
                  style={{ width: '100%' }}
                  precision={
                    record.defaultPrecision && prSourcePlatform === 'SRM'
                      ? record.defaultPrecision
                      : 10
                  }
                  numberGrouping
                />
              )}
            </FormItem>
          ) : (
            thousandBitSeparator(val)
          ),
      },
      // {
      //   title: intl.get(`${modelPrompt}.estimatedArrivalDate`).d('预计到货日期'),
      //   dataIndex: 'attributeDate1',
      //   width: 150,
      // },
      // {
      //   title: intl.get(`${commonPrompt}.deliveryAddress`).d('送货地址'),
      //   dataIndex: 'attributeLongtext1',
      //   width: 150,
      //   render: (val, record) =>
      //     ['create', 'update'].includes(record._status) && !isMatch ? (
      //       <FormItem>
      //         {record.$form.getFieldDecorator(`unitPriceBatch`, {
      //           initialValue: val,
      //           rules: [
      //             {
      //               required: true,
      //               message: intl.get('hzero.common.validation.notNull', {
      //                 name: intl.get(`${commonPrompt}.deliveryAddress`).d('送货地址'),
      //               }),
      //             },
      //           ],
      //         })(<InputNumber min={0} precision="2" style={{ width: '100%' }} />)}
      //       </FormItem>
      //     ) : (
      //       val
      //     ),
      // },
      {
        title: intl.get(`${modelPrompt}.receiveContactName`).d('收货联系人'),
        width: 150,
        dataIndex: 'receiveContactName',
        render: (val, record) =>
          ['create', 'update'].includes(record._status) && !isMatch ? (
            <FormItem>
              {record.$form.getFieldDecorator(`receiveContactName`, {
                initialValue: record.receiveContactName,
                rules: [{}],
              })(
                <TooltipInput
                  tipValue={record.$form.getFieldValue(`receiveContactName`)}
                  disabled={prSourcePlatform !== 'SRM'}
                />
              )}
            </FormItem>
          ) : (
            <Tooltip title={val}>
              <span>{val}</span>
            </Tooltip>
          ),
      },
      {
        title: intl.get(`${modelPrompt}.receiveTelNum`).d('收货人联系方式'),
        width: 300,
        dataIndex: 'receiveTelNum',
        render: (val, record) => {
          return ['create', 'update'].includes(record._status) && !isMatch ? (
            <FormItem>
              {record.$form.getFieldDecorator(`internationalTelCode`, {
                initialValue: record.internationalTelCode,
              })}
              {record.$form.getFieldDecorator(`receiveTelNum`, {
                initialValue: record.receiveTelNum,
                rules: [
                  {
                    pattern:
                      record.$form.getFieldValue('internationalTelCode') === '+86' &&
                      prSourcePlatform === 'SRM'
                        ? /^1\d{10}$/
                        : NOT_CHINA_PHONE,
                    message: intl.get(`sprm.common.model.common.phoneErrMsg`).d('手机号格式不正确'),
                  },
                ],
              })(
                <PhoneRender
                  record={record}
                  internationalTelCodeValue={record.internationalTelCode}
                  disabled={prSourcePlatform !== 'SRM'}
                  internationalTelCode={internationalTelCode}
                />
              )}
            </FormItem>
          ) : (
            <Tooltip title={record.receiveTelNum}>
              <span>{val || ''}</span>
            </Tooltip>
          );
        },
      },
      {
        title: intl.get(`sprm.common.model.common.mallLineNum`).d('商城行号'),
        width: 150,
        dataIndex: 'mallLineNum',
      },
    ];
    if (cuxCols && cuxCols?.length > 0) {
      columnArray.push(...cuxCols);
    }
    const specialReference = [
      {
        title: intl.get(`${modelPrompt}.skuTypeMark`).d('定制品标识'),
        width: 150,
        dataIndex: 'skuType',
      },
      {
        title: intl.get(`${modelPrompt}.customUomName`).d('定制单位'),
        width: 150,
        dataIndex: 'customUomName',
      },
      {
        title: intl.get(`${modelPrompt}.customQuantity`).d('定制数量'),
        width: 150,
        dataIndex: 'customQuantity',
      },
      {
        title: intl.get(`${modelPrompt}.packageQuantity`).d('份数'),
        width: 150,
        dataIndex: 'packageQuantity',
      },
      {
        title: intl.get(`${modelPrompt}.customSpecsJson`).d('定制品属性'),
        width: 150,
        dataIndex: 'customSpecsJson',
        render: (val) => (
          <a
            onClick={() => {
              this.setState({
                customData: val ? JSON.parse(val) : [],
                specsJsonType: 'custom',
                customVisable: true,
              });
            }}
          >
            {intl.get(`${modelPrompt}.customSpecsJson`).d('定制品属性')}
          </a>
        ),
      },
    ];

    const receiveInfo = [
      {
        title: intl.get(`${modelPrompt}.receiveAddress`).d('收货地址'),
        width: 150,
        dataIndex: 'receiveAddress',
        render: (val, record) =>
          ['create', 'update'].includes(record._status) && !isMatch ? (
            <FormItem>
              {record.$form.getFieldDecorator(`receiveAddress`, {
                initialValue: record.receiveAddress,
              })(
                <TooltipInput
                  tipValue={record.$form.getFieldValue(`receiveAddress`)}
                  style={{ minWidth: '120px' }}
                  disabled={prSourcePlatform === 'CATALOGUE'}
                />
              )}
            </FormItem>
          ) : (
            <Tooltip title={val}>
              <span>{val}</span>
            </Tooltip>
          ),
      },
    ];

    const productSpec = [
      {
        title: intl.get(`${modelPrompt}.productSpecsJson`).d('商品属性'),
        width: 150,
        dataIndex: 'productSpecsJson',
        render: (val) => (
          <a
            onClick={() => {
              this.setState({
                customData: val ? JSON.parse(val) : [],
                specsJsonType: 'product',
                customVisable: true,
              });
            }}
          >
            {intl.get(`${modelPrompt}.productSpecsJson`).d('商品属性')}
          </a>
        ),
      },
    ];

    // return isCatalogOrECom
    //   ? prSourcePlatform === 'CATALOGUE'
    //     ? columnArray.filter(item => item.dataIndex !== 'lineFreight')
    //     : columnArray
    //   : columnArray.filter(
    //       item =>
    //         !['lineFreight', 'productNum', 'productName', 'catalogName'].includes(item.dataIndex)
    //     );
    if (!dualUnitSetting) {
      columnArray.splice(
        columnArray.findIndex(({ dataIndex }) => dataIndex === 'secondaryUomId'),
        1
      );
      columnArray.splice(
        columnArray.findIndex(({ dataIndex }) => dataIndex === 'secondaryQuantity'),
        1
      );
      columnArray.splice(
        columnArray.findIndex(({ dataIndex }) => dataIndex === 'secondaryTaxInUnitPrice'),
        1
      );
    }
    if (prSourcePlatform !== 'SRM' && prSourcePlatform !== 'SHOP') {
      columnArray.splice(
        columnArray.findIndex(({ dataIndex }) => dataIndex === 'unitPriceBatch'),
        1
      );
    }

    if (prSourcePlatform === 'SHOP') {
      columnArray.splice(
        columnArray.findIndex(({ dataIndex }) => dataIndex === 'remark'),
        1,
        [
          {
            title: intl.get(`sprm.common.model.common.mallLineNum`).d('商城行号'),
            width: 150,
            dataIndex: 'mallLineNum',
          },
        ]
      );
    }

    if (prSourcePlatform === 'E-COMMERCE') {
      columnArray.splice(-2, 2);
      columnArray.splice(
        columnArray.findIndex(({ dataIndex }) => dataIndex === 'taxIncludedUnitPrice'),
        1,
        ...priceItem,
        ...specialReference,
        ...productSpec
      );
      columnArray.splice(
        columnArray.findIndex(({ dataIndex }) => dataIndex === 'lastPurPrice'),
        1
      );
    }
    if (isCatalogOrECom) {
      if (prSourcePlatform === 'CATALOGUE') {
        columnArray.splice(
          columnArray.findIndex(({ dataIndex }) => dataIndex === 'supplierCompanyId'),
          0,
          ...receiveInfo,
          ...specialReference,
          ...productSpec
        );
        return columnArray.filter(
          (item) =>
            ![
              'itemAbcClass',
              'projectNum',
              'projectName',
              'craneNum',
              'drawingNum',
              'customMadeFlag',
              'customAttributeList',
            ].includes(item.dataIndex)
        );
        // return columnArray.filter(
        //   item => item.dataIndex !== 'lineFreight',
        //   'itemAbcClass',
        //   'projectNum',
        //   'projectName',
        //   'craneNum',
        //   'drawingNum'
        // );
      } else if (prSourcePlatform === 'SRM') {
        return columnArray.filter((e) => ['mallLineNum'].includes(e.dataIndex));
      } else {
        return columnArray.filter(
          (item) =>
            ![
              'itemAbcClass',
              'projectNum',
              'projectName',
              'craneNum',
              'drawingNum',
              'customMadeFlag',
              'customAttributeList',
            ].includes(item.dataIndex)
        );
      }
    } else {
      if (prSourcePlatform === 'SRM') {
        columnArray.splice(
          columnArray.findIndex(({ dataIndex }) => dataIndex === 'supplierCompanyId'),
          0,
          ...receiveInfo
        );
      }
      return columnArray.filter(
        (item) =>
          ![
            'lineFreight',
            'productNum',
            'productName',
            'thirdSkuCode',
            'productModel',
            'packingList',
            'productBrand',
            'thirdSkuName',
            'catalogName',
          ].includes(item.dataIndex)
      );
    }
  }

  // 行导入新
  @Bind()
  async handleImportNew(cuxTemplateCode) {
    const { headerRef } = this.props;
    const { prHeaderId } = this.state;
    const headerInfo = headerRef ? headerRef.getInfo() : {};
    const data = await getImportTemplate(headerInfo);
    const { lineImportTplCode = 'SPRM.PR_LINE' } = data || {};
    openModal({
      refreshButton: true,
      prefixPatch: SRM_SPRM,
      args: {
        tenantId: getCurrentOrganizationId(),
        templateCode: cuxTemplateCode || lineImportTplCode || 'SPRM.PR_LINE',
        prHeaderId,
      },
      businessObjectTemplateCode: cuxTemplateCode || lineImportTplCode || 'SPRM.PR_LINE',
      successCallBack: () => {
        notification.success();
        this.fetchDetailList();
        headerRef.fetchDetailHeader();
      },
    });
  }

  render() {
    const {
      deletingLines,
      headerRef,
      customizeTable,
      headerForm: { getFieldValue },
      customizeBtnGroup,
    } = this.props;
    const { addHeaderBtn = undefined, deleteCuxBtnFunc = undefined, cuxTemplateCode = undefined } =
      this.props?.remote?.props?.process || {};
    const {
      selectedRowKeys = [],
      // selectOptionKey,
      listDataSource,
      prSourcePlatform,
      prHeaderId,
      renderFlag,
      batchMaintains,
      listPage = {},
      tableLoading,
      customVisable,
      customData,
      specsJsonType,
      // tenantId,
      selectedRows = [],
    } = this.state;

    // const isCatalogOrECom = ['CATALOGUE', 'E-COMMERCE'].includes(prSourcePlatform); // 来源是电商或目录化
    const columns = this.getColumns();
    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0))) + 300;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.handleChangeSelectRowKeys,
    };
    const deleteBtnFlag = isFunction(deleteCuxBtnFunc) ? deleteCuxBtnFunc(selectedRows) : false;
    const editTableProps = {
      loading: tableLoading,
      columns:
        prSourcePlatform !== 'E-COMMERCE'
          ? columns.filter(
              (item) => !['benchmarkPrice', 'changePercent', 'jdPrice'].includes(item.dataIndex)
            )
          : columns,
      dataSource: listDataSource,
      rowSelection,
      bordered: true,
      rowKey: 'prLineId',
      onChange: (page) => this.fetchDetailList(page),
      pagination: listPage,
      scroll: { x: scrollX }, // y: 'calc(100vh - 320px)' todo页面增加固定头
    };
    // const renderFlag = ['PENDING', 'REJECTED', 'SEND_BACK'].includes(prStatusCode);
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
        {prHeaderId && (
          <Form layout="inline">
            {customizeBtnGroup({ code: 'SPRM.PURCHASE_REQUISITION_CREATION.LINE_BTNS' }, [
              prSourcePlatform === 'SRM' && renderFlag && (
                <Button data-name="new" type="primary" onClick={this.handleAdd}>
                  {intl.get(`hzero.common.button.create`).d('新建')}
                </Button>
              ),
              prSourcePlatform === 'SRM' && renderFlag && (
                <Button
                  data-name="delete"
                  type="c7n-pro"
                  onClick={this.handleDelete}
                  loading={deletingLines}
                  disabled={(isArray(selectedRowKeys) && isEmpty(selectedRowKeys)) || deleteBtnFlag} // 三生界面有删除行特殊逻辑
                  className={styles.delBtn}
                >
                  {intl.get(`hzero.common.button.delete`).d('删除')}
                </Button>
              ),
              prSourcePlatform === 'SRM' && renderFlag && (
                <PermissionButton
                  data-name="import"
                  key="import"
                  // funcType="flat"
                  icon="archive"
                  type="c7n-pro"
                  onClick={this.handleImport}
                  permissionList={[
                    {
                      code: `hzero.srm.requirement.prm.pr-creation.ps.pr-line.import`,
                      type: 'button',
                      meaning: '申请行导入',
                    },
                  ]}
                >
                  {/* <Icons type="main-import" style={{ marginRight: '8px' }} /> */}
                  {intl.get(`${buttonPrompt}.lineImport`).d('申请行导入')}
                </PermissionButton>
              ),
              prSourcePlatform === 'SRM' && renderFlag && (
                <PermissionButton
                  data-name="newImport"
                  key="newImport"
                  // funcType="flat"
                  icon="archive"
                  type="c7n-pro"
                  onClick={() => this.handleImportNew(cuxTemplateCode)}
                  permissionList={[
                    {
                      code: `hzero.srm.requirement.prm.pr-creation.ps.new.pr-line.import`,
                      type: 'button',
                      meaning: '申请行导入-新',
                    },
                  ]}
                >
                  {/* <Icons type="main-import" style={{ marginRight: '8px' }} /> */}
                  {intl.get(`${buttonPrompt}.lineImport`).d('申请行导入')}
                  <span className="srm-common-import-button-tag">NEW</span>
                </PermissionButton>
              ),
              !isEmpty(batchMaintains) && (
                // <>
                //   {(prSourcePlatform !== 'E-COMMERCE' || !isCatalogOrECom) && renderFlag && (
                //     <span className="split-border" />
                //   )}
                //   <Form.Item>
                <Button
                  data-name="batch"
                  data-code="search"
                  htmlType="submit"
                  type="primary"
                  // onClick={this.handleMaintain}
                  onClick={() => this.changeBatchModal()}
                  disabled={
                    listDataSource.length === 0 || batchMaintains.length === 0 || !renderFlag
                  }
                >
                  <a>{intl.get(`${buttonPrompt}.batchMaintain`).d('批量维护')}</a>
                </Button>
              ),
              typeof addHeaderBtn === 'function' ? (
                addHeaderBtn({ handleAdd: this.handleAdd })
              ) : (
                <></>
              ),
            ])}
          </Form>
        )}
        {customizeTable(
          {
            code:
              prSourcePlatform !== 'E-COMMERCE'
                ? 'SPRM.PURCHASE_REQUISITION_CREATION.DETAIL_LINE'
                : 'SPRM.PURCHASE_REQUISITION_CREATION.DETAIL.LINE_ECOMMERCE',

            useNewValid: true,
          },
          <EditTable {...editTableProps} />
        )}
        {this.state.priceListModalVisible && (
          <PriceListModal
            visible={this.state.priceListModalVisible}
            onClose={() => {
              this.setState({ priceListModalVisible: false });
            }}
            data={this.state.priceData}
          />
        )}
        {this.state.importVisible && (
          <Modal
            width={1200}
            destroyOnClose
            visible
            closable={false}
            onCancel={() => {
              this.setState({ importVisible: false });
            }}
            // afterClose={() => this.creation.current.handleFetchList()}
            footer={
              <Button
                onClick={() => {
                  this.setState({ importVisible: false });
                  headerRef.fetchDetailHeader(true);
                }}
                type="primary"
              >
                {intl.get('hzero.common.button.ok')}
              </Button>
            }
          >
            <CommentImport {...this.importProps} />
          </Modal>
        )}
        {customVisable && <CustomSpecModal {...CustomSpecProps} />}
        {this.state.batchVisible ? (
          <BatchModal
            visible={this.state.batchVisible}
            onClose={this.changeBatchModal}
            getFieldValue={getFieldValue}
            handleSubmit={this.handleMaintain}
            prSourcePlatform={prSourcePlatform}
          />
        ) : null}
      </div>
    );
  }
}

// const HOCComponent = Form.create({ fieldNameProp: null })(withRouter(PurchaseLineInfo));

// const HOCComponent = (Comp) => {
//   return compose(
//     Form.create({ fieldNameProp: null }),
//     connect(({ purchaseRequisitionCreation }) => ({
//       purchaseRequisitionCreation,
//     })),
//     withRouter(Comp)
//   )(Comp);
// };

// export default HOCComponent(PurchaseLineInfo);
// export { PurchaseLineInfo, HOCComponent as hocPurchaseLineInfo };
