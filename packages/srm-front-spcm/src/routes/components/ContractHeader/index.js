/*
 * ContractHeader - 采购协议头信息
 * @date: 2019-05-14
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Form, Row, Col, Input, Select, DatePicker, InputNumber, Tooltip, Icon } from 'hzero-ui';
import moment from 'moment';
import { isFunction, isEmpty, isNil } from 'lodash';
import { Bind } from 'lodash-decorators';
import querystring from 'querystring';
import Upload from 'srm-front-boot/lib/components/Upload';
import { PRIVATE_BUCKET } from 'srm-front-boot/lib/utils/config';
import { queryLovData } from 'services/api';

import intl from 'utils/intl';
import Lov from 'components/Lov';
import ValueList from 'components/ValueList';
import {
  FORM_COL_3_LAYOUT,
  EDIT_FORM_ROW_LAYOUT,
  FORM_COL_2_LAYOUT,
  EDIT_FORM_ITEM_LAYOUT,
} from 'utils/constants';
import {
  getDateFormat,
  getCurrentOrganizationId,
  getCurrentUserId,
  getCurrentUser,
} from 'utils/utils';
import Switch from 'components/Switch';
import { dateRender, yesOrNoRender } from 'utils/renderer';
import formatterCollections from 'utils/intl/formatterCollections';
import { fetchContractTemplates } from '@/services/contractCommonService';
import { renderThousandthNum, openTermsModal, tirmSpecialCode } from '@/utils/util';
import styles from './index.less';

const { TextArea } = Input;
const FormItem = Form.Item;
const commonPrompt = 'spcm.purchaseRequisitionCreation.model';
const common = 'spcm.common.model';

/**
 * ContractHeader - 采购协议头信息
 * @extends {Component} - React.Component
 * @reactProps {Object} form - 表单对象
 * @reactProps {Array} collapseKeys - 折叠面板数组
 * @reactProps {Boolean} editable - 编辑状态
 * @reactProps {Object} dataSource - 数据源
 * @return React.element
 */
@formatterCollections({
  code: [
    'spcm.purchaseRequisitionCreation',
    'spcm.common',
    'entity.supplier',
    'entity.company',
    'entity.business',
    'entity.organization',
    'entity.roles',
    'hzero.common',
    'sodr.workspace',
    'spcm.amountStrategy',
  ],
})
@withRouter
@Form.create({
  fieldNameProp: null,
  // 监听表单域
  onValuesChange(props) {
    const { dispatch, formChanged, updateSubjectList, updateStageList } = props;
    if (updateSubjectList) {
      updateSubjectList();
    }
    if (updateStageList) {
      updateStageList();
    }
    if (!formChanged) {
      dispatch({
        type: 'contractCommon/updateState',
        payload: {
          formChanged: true,
        },
      });
    }
  },
  onFieldsChange(props, fields) {
    const { dataSource, onChangeHeader } = props;
    const { ouId } = fields;
    // 修改了业务实体，刷新头headerInfo中ouId
    // 保证标的行库存组织业务实体参数永远是最新的
    // 要添加touched和validating条件判断，否者ouId为必输时和ouId修改后点击头上的保存也会触发下面的逻辑
    if (ouId && ouId?.touched && isNil(ouId?.validating)) {
      const { value } = ouId || {};
      onChangeHeader(
        {
          ...dataSource,
          ouId: value,
        },
        'ouId'
      );
    }
  },
})
export default class ContractHeader extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tenantId: getCurrentOrganizationId(),
      userId: getCurrentUserId(),
      acceptFlag: 0,
      userInfo: getCurrentUser(),
      // unitIdVisible: false,
    };
    if (isFunction(props.onRef)) {
      props.onRef(this);
    }
  }

  componentDidMount() {
    this.getSelectedRows();
  }

  /**
   * 改变设置已编辑标识
   */
  @Bind()
  handleChangeFormItem() {
    const { onChangeState } = this.props;
    onChangeState({ headerEdited: true });
  }

  /**
   * 协议性质修改回调
   */
  @Bind()
  handleChangePcKindCode(val) {
    const {
      form: { setFieldsValue },
    } = this.props;
    // 如果协议性质=非系统供应商则isNOT_SYS_SUPPLIER为TRUE 如果isNOT_SYS_SUPPLIER为TRUE就证明他上一个值是非系统供应商
    if (val === 'NOT_SYS_SUPPLIER') {
      this.isNOT_SYS_SUPPLIER = true;
      setFieldsValue({
        supplierCompanyId: null,
        supplierCompanyName: null,
      });
    } else if (this.isNOT_SYS_SUPPLIER) {
      this.isNOT_SYS_SUPPLIER = false;
      setFieldsValue({
        supplierCompanyId: null,
        supplierCompanyName: null,
      });
    }
    if (['ATTACHMENT_FRAMEWORK', 'ATTACHMENT'].includes(val)) {
      setFieldsValue({
        pcTemplateId: null,
      });
    }
    this.handleChangeFormItem();
  }

  /**
   * 供应商Lov修改回调
   * @param {*} value
   * @param {*} record
   */
  @Bind()
  handleChangeSupplier(value, record) {
    const { dataSource, onChangeHeader, form = {}, remote } = this.props;
    const {
      supplierTenantId,
      supplierCompanyId,
      supplierCompanyNum,
      supplierCompanyName,
      supplierCurrencyCode,
      supplierId,
      supplierName,
      supplierNum,
    } = record || {};
    this.handleChangeFormItem();
    // 非系统供应商编码截取前30个字符
    const noSysSupplierCompanyNum = `${supplierCompanyId}@${supplierCompanyName}`.substr(0, 30);
    const newData = {
      ...dataSource,
      supplierTenantId,
      supplierCompanyId,
      supplierCompanyName,
      supplierCompanyNum: supplierCompanyId === -1 ? noSysSupplierCompanyNum : supplierCompanyNum,
      supplierCurrencyCode,
      supplierId,
      supplierName,
      supplierNum,
    };
    const { setFieldsValue } = form;
    if (remote?.event) {
      remote.event.fireEvent('handleCuxChangeSupplier', {
        value,
        newData,
        record,
        eventProps: this.props,
      });
    } else {
      onChangeHeader(newData, 'supplier');
    }
    setFieldsValue({
      supplierCompanyId,
      supplierCompanyName,
      /**
       * platSupplierCompanyId字段说明：
       * 当协议头选择的供应商是纯本地的时候，supplierCompanyId的initialValue是供应商Name而不是id,
       * 此刻如果supplierCompanyId作为其他字段值集入参查，那么传递的是name就会导致查询报错。
       * 考虑到二开项目和已有租户配置，添加这个虚拟字段专门暂存平台供应商ID。以后其他字段值集需要用平台
       * 作为查询条件，就可以用platSupplierCompanyId。
       */
      platSupplierCompanyId: supplierCompanyId === -1 ? null : supplierCompanyId,
    });
  }

  /**
   * 跳转到明细页
   * @param {String} pcHeaderId
   */
  @Bind()
  redirectDetail(pcHeaderId) {
    const { history } = this.props;
    history.push({
      pathname: `/spcm/purchase-contract-view/detail`,
      search: pcHeaderId ? querystring.stringify({ pcHeaderId }) : querystring.stringify({}),
    });
  }

  /**
   * 改变对应Lov提示文字显隐
   * @param {String} field 字段
   * @param {String} value 值
   */
  @Bind()
  handleToolTipVisible(field, value) {
    this.setState({
      [field]: !!value,
    });
  }

  /**
   * 公司改变回调
   */
  @Bind()
  handleChangeCompany(val, record) {
    const {
      form: { resetFields, setFieldsValue },
    } = this.props;
    setFieldsValue({
      companyName: record.companyName,
    });
    resetFields(['pcTypeId', 'pcTemplateId', 'ouId']);
    this.handleChangeFormItem();
    this.queryOuId(
      {
        companyId: record.companyId,
      },
      setFieldsValue
    );
  }

  /**
   * 查询业务实体值集的值
   */
  @Bind()
  async queryOuId(data, setFieldsValue) {
    const res = await queryLovData(
      `/spfm/v1/${this.state.tenantId}/user-authority-data/ou?customizeUnitCode=SPFM_ORG-INFO_OPERATION-UNIT.LIST`,
      {
        ...data,
        tenantId: this.state.tenantId,
      },
      'GET'
    );
    const setData = res?.content || [];
    if (setData.length === 1) {
      setFieldsValue({
        ouId: setData[0]?.ouId,
        ouName: setData[0]?.ouName,
        ouCode: setData[0]?.ouCode,
      });
    }
  }

  /**
   * 协议类型改变回调
   */
  @Bind()
  async handleChangePcTypeId(_, lovRecord) {
    const {
      form: { getFieldValue, setFieldsValue },
      dataSource,
      onChangeHeader,
      _linkFlag,
      quoteType,
      isQuoteSource,
    } = this.props;
    const { pcSourceCode, executionStrategyCode, supplementFlag = 0 } = dataSource;
    const {
      effectiveTimeFlag,
      acceptType = null,
      acceptFlag = 1,
      /* 协议类型里有模板就带出模板，没有就清空。
        （src-24122）直接在标准里面改造更简单快捷，以后其他项目需要协议类型带出协议模板，直接让后端二开一个能返回pcTemplateId, pcTemplateName的协议类型值集即可，减少前端二开负担 */
      pcTemplateId,
      pcTemplateName,
      pcTypeId,
    } = lovRecord;
    let newPcTemplate = { pcTemplateId, templateName: pcTemplateName };
    if (
      !newPcTemplate.pcTemplateId &&
      !isEmpty(lovRecord) &&
      !['ATTACHMENT_FRAMEWORK', 'ATTACHMENT'].includes(getFieldValue('pcKindCode'))
    ) {
      const temRes = await fetchContractTemplates({
        lovCode: 'SPCM.PC_TEMPLATE',
        enabledFlag: 1,
        pcTypeId,
        companyId: getFieldValue('companyId'),
        templateStatus: 'END_APPROVAL',
        supplementFlag,
      });
      const tempList = temRes?.content || [];
      if (tempList?.length === 1 && !temRes?.failed) {
        newPcTemplate = {
          pcTemplateId: tempList[0].pcTemplateId,
          templateName: tempList[0].templateName,
        };
      }
    } else if (isEmpty(lovRecord)) {
      newPcTemplate = { pcTemplateId: null, templateName: null };
    }
    this.setState({ acceptFlag }, () => {
      onChangeHeader({
        ...dataSource,
        effectiveTimeFlag,
        // ...newPcTemplate,
      });
      setFieldsValue({
        ...newPcTemplate,
        startDateActive: getFieldValue('startDateActive'),
        endDateActive: getFieldValue('endDateActive'),
        // 来源订单且新链路=null不带出验收类型  来源寻源/申请且新链路且一级策略为仅寻源=不转下游
        acceptType:
          (pcSourceCode === 'PURCHASE_ORDER' || quoteType === 'PO') && _linkFlag
            ? null
            : (pcSourceCode === 'SEARCH_SOURCE_RESULT' ||
                isQuoteSource === '1' ||
                pcSourceCode === 'PURCHASE_NEED') &&
              _linkFlag &&
              executionStrategyCode === 'SOURCE'
            ? 'contract'
            : acceptType,
      });
      this.handleChangeFormItem();
    });
  }

  /**
   * 校验显示的默认值
   */
  @Bind()
  getSelectedRows() {
    const { sourceResultDTOs = [], templateDate = {}, isQuoteSource, quoteType } = this.props;

    const supplierCompanyIds = Array.from(
      new Set(sourceResultDTOs.map((item) => item.supplierCompanyId))
    );
    const supplierCompanyNames = Array.from(
      new Set(sourceResultDTOs.map((item) => item.supplierCompanyName))
    );
    const supplierTenantIds = Array.from(
      new Set(sourceResultDTOs.map((item) => item.supplierTenantId))
    );

    const ouIds = Array.from(new Set(sourceResultDTOs.map((item) => item.ouId)));
    const ouNames = Array.from(new Set(sourceResultDTOs.map((item) => item.ouName)));

    const purchaseOrganizatioIds = Array.from(
      new Set(sourceResultDTOs.map((item) => item.purOrganizationId))
    );
    const purchaseOrganizatioNames = Array.from(
      new Set(sourceResultDTOs.map((item) => item.purchaseOrganizatioName))
    );

    const purchaseAgentIds = Array.from(
      new Set(sourceResultDTOs.map((item) => item.purchaseAgentId))
    );
    const purchaseAgentNames = Array.from(
      new Set(sourceResultDTOs.map((item) => item.purchaseAgentName))
    );

    const companyIds = Array.from(new Set(sourceResultDTOs.map((item) => item.companyId)));
    const companyNames = Array.from(new Set(sourceResultDTOs.map((item) => item.companyName)));

    let mergeItems = {};
    const mergeList = [
      ['defaultSupplierCompanyId', supplierCompanyIds],
      ['defaultSupplierCompanyName', supplierCompanyNames],
      ['defaultSupplierTenantId', supplierTenantIds],
      ['defaultOuId', ouIds],
      ['defaultOuName', ouNames],
      ['defaultPurchaseOrgId', purchaseOrganizatioIds],
      ['defaultPurchaseOrgName', purchaseOrganizatioNames],
      ['defaultPurchaseAgentId', purchaseAgentIds],
      ['defaultPurchaseAgentName', purchaseAgentNames],
      ['defaultCompanyId', companyIds],
      ['defaultCompanyName', companyNames],
    ];

    mergeList.forEach((item) => {
      const [key, value] = item;
      if (value.length === 1) {
        mergeItems = { ...mergeItems, [key]: value[0] };
      } else if (value.length === 2 && (!value[0] || !value[1])) {
        mergeItems = { ...mergeItems, [key]: value[0] || value[1] };
      } else {
        mergeItems = { ...mergeItems, [key]: null };
      }
    });
    const defaultValues = {
      ...templateDate,
      // defaultSupplierCompanyId: supplierCompanyIds.length === 1 ? supplierCompanyIds[0] : null,
      // defaultSupplierCompanyName:
      //   supplierCompanyNames.length === 1 ? supplierCompanyNames[0] : null,
      // defaultSupplierTenantId: supplierTenantIds.length === 1 ? supplierTenantIds[0] : null,

      // defaultOuId: ouIds.length === 1 ? ouIds[0] : null,
      // defaultOuName: ouNames.length === 1 ? ouNames[0] : null,

      // defaultPurchaseOrgId: purchaseOrganizatioIds.length === 1 ? purchaseOrganizatioIds[0] : null,
      // defaultPurchaseOrgName:
      //   purchaseOrganizatioNames.length === 1 ? purchaseOrganizatioNames[0] : null,

      // defaultPurchaseAgentId: purchaseAgentIds.length === 1 ? purchaseAgentIds[0] : null,
      // defaultPurchaseAgentName: purchaseAgentNames.length === 1 ? purchaseAgentNames[0] : null,

      // defaultCompanyId: companyIds.length === 1 ? companyIds[0] : null,
      // defaultCompanyName: companyNames.length === 1 ? companyNames[0] : null,

      ...mergeItems,
      defaultProtocolSource:
        isQuoteSource === '1'
          ? 'SEARCH_SOURCE_RESULT'
          : quoteType === 'PO'
          ? 'PURCHASE_ORDER'
          : null,
      defaultProtocolSourceMeaning:
        isQuoteSource === '1'
          ? intl.get(`spcm.common.model.common.sourceResult`).d('寻源结果')
          : quoteType === 'PO'
          ? intl.get(`spcm.common.model.common.purchaseOrder`).d('采购订单')
          : null,
    };
    this.setState({ defaultValues });
  }

  @Bind()
  /**
   * 根据条件判断返回个性化单元编码
   * @params routerParams 路由传参
   */
  handleGetCode(routerParams) {
    const {
      match: { path },
    } = this.props?.parentRoute || this.props;
    // 供应商路由
    const supplierPath = [
      '/spcm/contract-sign/detail',
      '/spcm/supplier-contract-view/detail',
      '/pub/spcm/contract-sign/detail',
    ];
    if (path === '/spcm/contract-maintain/detail' || routerParams.hasChanged === 'true') {
      return 'SPCM.PURCHASE_CONTRACT_MAINTAIN.DETAIL';
    } else if (supplierPath.includes(path)) {
      return 'SPCM.CONTRACT.SIGN.DETAIL.READONLY';
    } else {
      return 'SPCM.PURCHASE_CONTRACT_MAINTAIN.DETAIL.READONLY';
    }
  }

  /**
   * 校验显示的默认值
   */
  @Bind()
  handleExpUnitChange(value, record) {
    const { handleExpenseUnitChange = (e) => e } = this.props;
    this.handleChangeFormItem();
    handleExpenseUnitChange(value, record);
  }

  /**
   * 采购员Lov修改回调
   * @param {*} value
   * @param {*} record
   */
  @Bind()
  handleChangeAgent(value, record) {
    const { companyId } = this.props.dataSource;
    const {
      userInfo: { realName, email },
    } = this.state;
    if (value) {
      const {
        purchaseAgentFax,
        purchaseAgentName,
        purchaseAgentPhone,
        purchaseAgentEmail,
        userRealNames,
      } = record || {};
      // 当前操作人若为采购员指定用户，则取操作人子账户邮箱；否则为空
      const isPurUser = (userRealNames?.split(',') || []).includes(realName);
      this.handleChangeFormItem();
      this.handleFieldsValueChange(
        {
          purchaseAgentFax,
          purchaseAgentName,
          purchaseAgentPhone,
          purchaseAgentEmail: isPurUser ? email : purchaseAgentEmail,
        },
        'changeAgent'
      );
    } else if (companyId) {
      this.props
        .dispatch({
          type: 'contractCommon/fetchContactByCompany',
          payload: companyId,
        })
        .then((res) => {
          const { mail, telNum, contacts } = res;
          this.handleFieldsValueChange(
            {
              purchaseAgentName: contacts,
              purchaseAgentPhone: telNum,
              purchaseAgentEmail: mail,
              purchaseAgentFax: null,
            },
            'changeAgent'
          );
        });
    }
  }

  /**
   * 协议起始日期与协议终止日期修改回调
   * 补充协议起始（终止）日期修改方式：
   * 1，编辑框操作修改日期
   * 2，受协议即签署字段的约束，当该字段为true时，清空协议起始（终止）日期的值
   * 3，从主协议字段选择项中带出（可参考回调函数handleChangeMainContract）
   * 补充说明：此处单独定义一个函数，是为了将相关业务逻辑进行集中注释
   * @param {*} newValues 需要更新的相关字段
   */
  @Bind()
  handleChangeContractDate(newValues) {
    this.handleFieldsValueChange(newValues, 'ContractDate');
  }

  /**
   * 协议头信息改变回调（多个字段修改或有额外的逻辑判断）
   * @param {*} newValues 需要更新的字段
   * @param {*} callbackType 协议头信息改变回调需要进行的额外操作类型
   */
  @Bind()
  handleFieldsValueChange(newValues, callbackType) {
    const { dataSource, onChangeHeader } = this.props;
    onChangeHeader(
      {
        ...dataSource,
        ...newValues,
      },
      callbackType
    );
  }

  /**
   * 协议头信息改变回调（单个字段修改）
   * @param {*} value 当前改变字段的值
   * @param {*} key 当前改变字段的key
   */
  @Bind()
  handleFieldChange(value, key) {
    const { dataSource, onChangeHeader } = this.props;
    onChangeHeader({
      ...dataSource,
      [key]: value,
    });
  }

  /**
   * 主协调带出协议起始/终止日期
   */
  @Bind()
  handleChangeMainContract(_, lovRecord) {
    const {
      form: { getFieldValue, setFieldsValue },
    } = this.props;
    const { startDateActive, endDateActive, attribute1 } = lovRecord;
    if (!getFieldValue('signEffectFlag') && getFieldValue('pcKindCode') === 'QUOTATION_AGREEMENT') {
      const contractDate = {
        startDateActive: startDateActive ? moment(startDateActive) : undefined,
        endDateActive: endDateActive ? moment(endDateActive) : undefined,
      };
      setFieldsValue(contractDate);
      this.handleChangeContractDate(contractDate);
    }
    setFieldsValue({ attribute1 });
    this.handleChangeFormItem();
  }

  render() {
    const {
      match: { path },
    } = this.props?.parentRoute || this.props;
    const { tenantId, defaultValues = {}, acceptFlag, userId } = this.state;
    const {
      defaultCompanyName,
      defaultCompanyId,
      defaultOuId,
      defaultOuName,
      defaultPurchaseAgentId,
      defaultPurchaseAgentName,
      defaultPurchaseOrgId,
      defaultPurchaseOrgName,
      defaultSupplierCompanyId,
      defaultSupplierCompanyName,
      defaultProtocolSource,
      defaultProtocolSourceMeaning,
    } = defaultValues;
    const {
      remote,
      pageSourceKey,
      editable = false,
      maintainEditable = false,
      alterationFlag = 0,
      form = {},
      dataSource = {},
      detailEnumMap = {},
      newEnumMap = {},
      customizeForm,
      purchaseFlag,
      terminateReasonFlag,
      createPurchaseOrderInfo = {},
      quoteType,
      hiddenDataSourceKey,
      contractPath,
      // handleExpenseUnitChange = e => e,
      custLoading,
      supplementFlag, // 该标识传参需要由外部传入（从内部读取headerInfo的弊端是，它是基于单据类型的维度判断的，无法收束因模块不同产生的控制需求）
      isShowArchiveUpload = false,
      purchaseArchiveUploadProps,
      isLegal = false,
      isQuoteSource,
      sourceResultDTOs,
      _linkFlag,
    } = this.props;
    const {
      location: { search },
    } = this.props?.parentRoute || this.props;
    const { contractPurposeList = [], paperDeliveryMethodList = [] } = detailEnumMap;
    let { kinds = [] } = detailEnumMap;
    let { acceptTypeList = [] } = newEnumMap;
    const { getFieldDecorator = (e) => e, getFieldValue, setFieldsValue } = form;
    const {
      pcName,
      taxIncludeAmount,
      taxIncludeAmountChinese,
      amountChinese,
      pcHeaderTaxAmountChinese,
      pcNum,
      creationDate,
      createByRealName,
      pcKindCodeMeaning,
      pcKindCode,
      companyName,
      companyId,
      pcTypeId,
      pcTypeName,
      pcTemplateId,
      templateName,
      supplierCompanyId,
      supplierCompanyName,
      supplierName,
      startDateActive,
      endDateActive,
      mainContractId,
      mainPcNum,
      acceptType,
      acceptTypeMeaning,
      archiveCode,
      pcSourceCode,
      pcSourceCodeMeaning,
      remark,
      pcHeaderId,
      internalPostil,
      ouId,
      ouName,
      effectiveTime,
      signEffectFlag,
      purchaseOrgId,
      purchaseOrgName,
      purchaseAgentId,
      purchaseAgentName,
      companyOrgId,
      companyOrgName,
      costAnchDepId,
      costAnchDepDesc,
      overseasProcurement,
      globalFlag,
      pcStatusCode,
      terminationReason,
      contractPurpose,
      contractPurposeMeaning,
      signDescription,
      signAddress, // 签署地点
      paperFlag,
      paperDeliveryMethod,
      paperDeliveryMethodMeaning,
      paperDeliveryInfo,
      termsName,
      unitId,
      unitName,
      creatorUnitId,
      creatorUnitName,
      effectiveTimeFlag, // 协议类型明细里-控制协议有效期字段
      acceptFlag: primeAcceptFlag = 0,
      legalContractNum, // 法务合同编号
      archiveDate, // 归档日期
      signatureTypeMeaning,
      authType,
      signatureType,
      electricSignFlag,
      executionStrategyCode,
      secondLevelStrategyCode,
      orderSecondLevelStrategyCode,
      terminationAttachmentUuid,
      contractCalculateMethod,
      contractCalculateMethodMeaning,
      totalQuantity, // 基本总数量
      totalSecondaryQuantity, // 辅助总数量
      cnfApplicability,
      cnfApplicabilityMeaning,
      controlApplicability,
      controlApplicabilityMeaning,
      payPlanNum,
      version,
      purchaseCurrencyCode,
    } = dataSource;
    let pcStatusFlag;
    if (supplementFlag) {
      pcStatusFlag = 3;
    } else if (!supplementFlag && mainContractId && version > 1) {
      pcStatusFlag = 1;
    } else if (['PENDING', 'REJECTED', 'SUPPLIER_REJECTED'].includes(pcStatusCode)) {
      pcStatusFlag = 0;
    } else {
      pcStatusFlag = 2;
    }
    const data = {
      pcHeaderId,
      pcNum,
      mainPcNum: supplementFlag ? mainPcNum : null,
      pcStatusFlag, // 协议状态标识(0新建&审批拒绝&拒绝生效/1变更协议/2生效和其他状态/3补充协议)
    };
    // 新链路
    if (_linkFlag) {
      // 来源寻源 ->（一级策略）仅寻源 ->（协议性质）框架 ->（验收类型）除订单
      if (
        (pcSourceCode === 'SEARCH_SOURCE_RESULT' || isQuoteSource === '1') &&
        executionStrategyCode === 'SOURCE'
      ) {
        kinds = kinds.filter((item) =>
          ['ATTACHMENT_FRAMEWORK', 'FRAMEWORK_AGREEMENT'].includes(item.value)
        );
        acceptTypeList = acceptTypeList.filter((item) => item.value !== 'none');
      }
      // 来源订单 ->（协议性质）普通+附件 ->（验收类型）不转下游
      if (pcSourceCode === 'PURCHASE_ORDER' || quoteType === 'PO') {
        kinds = kinds.filter((item) => ['NORMAL', 'ATTACHMENT'].includes(item.value));
        acceptTypeList = acceptTypeList.filter((item) => item.value === 'contract');
      }
      // 来源申请
      if (pcSourceCode === 'PURCHASE_NEED') {
        // （一级策略）仅寻源 ->（协议性质）框架 ->（验收类型）除订单
        if (executionStrategyCode === 'SOURCE') {
          kinds = kinds.filter((item) =>
            ['ATTACHMENT_FRAMEWORK', 'FRAMEWORK_AGREEMENT'].includes(item.value)
          );
          acceptTypeList = acceptTypeList.filter((item) => item.value !== 'none');
        }
        // （一级策略）仅订单 ->（协议性质）除框架
        if (executionStrategyCode === 'ORDER') {
          kinds = kinds.filter(
            (item) => !['ATTACHMENT_FRAMEWORK', 'FRAMEWORK_AGREEMENT'].includes(item.value)
          );
        }
        // （一级策略）寻源&订单/先寻源再订单
        if (['SOURCE_AND_ORDER', 'BEFORE_SOURCE_AFTER_ORDER'].includes(executionStrategyCode)) {
          // （寻源二级策略）框架协议/全部 ->（履约二级策略）订单/不转单 ->（协议性质）框架
          if (
            ['CONTRACT_FRAMEWORK', 'ALL'].includes(secondLevelStrategyCode) &&
            ['PO', 'NO_ACCESS'].includes(orderSecondLevelStrategyCode)
          ) {
            kinds = kinds.filter((item) =>
              ['ATTACHMENT_FRAMEWORK', 'FRAMEWORK_AGREEMENT'].includes(item.value)
            );
          }
          // （寻源二级策略）非框架协议&&非全部 ->（协议性质）除框架
          if (!['CONTRACT_FRAMEWORK', 'ALL'].includes(secondLevelStrategyCode)) {
            kinds = kinds.filter(
              (item) => !['ATTACHMENT_FRAMEWORK', 'FRAMEWORK_AGREEMENT'].includes(item.value)
            );
          }
        }
      }
    }
    const routerParams = querystring.parse(search.substr(1));
    const isPub = window.location.href.includes('/pub/'); // 判断是否为pub页面
    // 【协议总额上限】判断标识
    const maxContractAmountFlag =
      getFieldValue('amountControlDimension') === 'HEAD' &&
      getFieldValue('manuallyModifyAmount') === '1';
    // 页面来源-协议拟制、我发起的协议
    const agreementAmountRows = ['CONTRACT_MAINTAIN', 'PURCHASE_CONTRACT_VIEW'].includes(
      pageSourceKey
    );
    // 页面来源-协议拟制，协议金额控制维度=头展示 订单已占用金额比例（%）
    const showOrderAmountRatio =
      dataSource?.amountControlDimension === 'HEAD' && pageSourceKey === 'CONTRACT_MAINTAIN';
    // 引用寻源结果isQuoteSource 有一些数据据不能编辑
    let isEditisQuoteSource =
      isQuoteSource === '1' && Array.isArray(sourceResultDTOs) && sourceResultDTOs.length > 0;
    // 引用寻源不能编辑供应商
    isEditisQuoteSource = isEditisQuoteSource || pcSourceCode === 'SEARCH_SOURCE_RESULT';

    let signatureTypeMeaning2 = signatureTypeMeaning;
    // 签署方式
    if (electricSignFlag === 1 && authType === 'ESIGN') {
      if (
        ['ATTACHMENT_FRAMEWORK', 'ATTACHMENT'].includes(pcKindCode) &&
        signatureType === 'TEXT_SIGNATURE'
      ) {
        signatureTypeMeaning2 = '';
      }
    } else {
      signatureTypeMeaning2 = '';
    }
    const electricAndSaasSignFlag =
      electricSignFlag === 1 && ['ESIGN_SAAS', 'FDD_SAAS'].includes(authType);
    // 供应商路由
    const supplierPath = [
      '/spcm/contract-sign/detail',
      '/spcm/supplier-contract-view/detail',
      '/pub/spcm/contract-sign/detail',
    ];
    const dataSourceKeyObj = hiddenDataSourceKey
      ? {}
      : {
          // dataSourceKey: pcHeaderId,
        };
    return customizeForm(
      {
        code: this.handleGetCode(routerParams),
        form,
        dataSource,
        readOnly: !editable && !maintainEditable,
        dataSourceLoading: isEmpty(dataSource),
        isCreate: !pcHeaderId,
        ...dataSourceKeyObj,
      },
      <Form custLoading={custLoading} className={styles['header-form']}>
        <Row
          {...EDIT_FORM_ROW_LAYOUT}
          className={editable || maintainEditable ? 'half-row' : 'read-half-row'}
        >
          <Col {...FORM_COL_2_LAYOUT}>
            <FormItem label={intl.get(`${commonPrompt}.pcName`).d('协议名称')}>
              {getFieldDecorator('pcName', {
                initialValue: pcName,
                rules: [
                  {
                    required: editable || maintainEditable,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${commonPrompt}.pcName`).d('协议名称'),
                    }),
                  },
                  {
                    max: 120,
                    message: intl.get('hzero.common.validation.max', { max: 120 }),
                  },
                ],
              })(
                editable || maintainEditable ? (
                  <Input
                    onChange={this.handleChangeFormItem}
                    // 去除协议名称的特殊字符
                    onBlur={(e) => setFieldsValue({ pcName: tirmSpecialCode(e.target.value) })}
                  />
                ) : (
                  <span>{pcName}</span>
                )
              )}
              {getFieldDecorator('isPub', {
                initialValue: isPub ? '1' : '0',
              })}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${commonPrompt}.pcNum`).d('协议编号')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('pcNum', {
                initialValue: pcNum,
              })(<span>{pcNum}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`hzero.common.date.creation`).d('创建时间')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('creationDate', {
                initialValue: creationDate,
              })(<span>{dateRender(creationDate)}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${commonPrompt}.amount`).d('协议总额')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('taxIncludeAmount', {
                initialValue: taxIncludeAmount,
              })(
                <span>
                  {taxIncludeAmountChinese
                    ? `${renderThousandthNum(taxIncludeAmount, 2)}${
                        taxIncludeAmountChinese === '-' ||
                        !['RMB', 'CNY', 'BB01'].includes(purchaseCurrencyCode)
                          ? ''
                          : `（${taxIncludeAmountChinese}）`
                      }`
                    : ''}
                </span>
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`spcm.common.legalContractNum`).d('法务合同编号')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('legalContractNum', {
                initialValue: legalContractNum,
                rules: [
                  {
                    required: isLegal || false,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`spcm.common.legalContractNum`).d('法务合同编号'),
                    }),
                  },
                ],
              })(
                editable || maintainEditable || isLegal ? (
                  <Input />
                ) : (
                  <span className="ant-textarea" word-warp="break-word">
                    {legalContractNum}
                  </span>
                )
              )}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="inclusion-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`entity.roles.creator`).d('创建人')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('createByRealName', {
                initialValue: createByRealName,
              })(<span>{createByRealName}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${commonPrompt}.pcKindCode`).d('协议性质')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('pcKindCode', {
                initialValue: pcKindCode, // TODO 默认为普通合同
                rules: [
                  {
                    required: editable,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${commonPrompt}.pcKindCode`).d('协议性质'),
                    }),
                  },
                ],
              })(
                editable ? (
                  <Select
                    allowClear
                    style={{ minWidth: 150 }}
                    onChange={(val) => this.handleChangePcKindCode(val)}
                  >
                    {kinds
                      .filter(
                        (item) =>
                          item.value !== 'NOT_SYS_SUPPLIER' ||
                          !['SEARCH_SOURCE_RESULT', 'PURCHASE_NEED', 'PURCHASE_ORDER'].includes(
                            pcSourceCode || defaultProtocolSource
                          )
                      )
                      .map((n) => (
                        <Select.Option key={n.value} value={n.value}>
                          {n.meaning}
                        </Select.Option>
                      ))}
                  </Select>
                ) : (
                  <span>{pcKindCodeMeaning}</span>
                )
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem label={intl.get(`entity.company.tag`).d('公司')} {...EDIT_FORM_ITEM_LAYOUT}>
              {getFieldDecorator('companyId', {
                initialValue: companyId || defaultCompanyId || createPurchaseOrderInfo.companyId,
                rules: [
                  {
                    required: editable || maintainEditable,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`entity.company.tag`).d('公司'),
                    }),
                  },
                ],
              })(
                editable || maintainEditable ? (
                  <Lov
                    code="SPCM.USER_AUTH.COMPANY"
                    disabled={pcHeaderId || getFieldValue('supplierCompanyId')}
                    textValue={
                      companyName || defaultCompanyName || createPurchaseOrderInfo.companyName
                    }
                    queryParams={{
                      enabledFlag: 1,
                      supplierCompanyId: dataSource?.supplierCompanyId,
                    }}
                    onChange={this.handleChangeCompany}
                  />
                ) : (
                  <span>{companyName}</span>
                )
              )}
              {getFieldDecorator('companyName', {
                initialValue:
                  companyName || defaultCompanyName || createPurchaseOrderInfo.companyName,
              })}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="writable-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get('entity.business.tag').d('业务实体')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('ouId', {
                initialValue: ouId || defaultOuId || createPurchaseOrderInfo.ouId,
              })(
                editable || maintainEditable ? (
                  <Lov
                    disabled={pcHeaderId}
                    code="SPFM.USER_AUTH.OU"
                    textValue={ouName || defaultOuName || createPurchaseOrderInfo.ouName}
                    textField="ouName"
                    queryParams={{ tenantId, companyId: getFieldValue('companyId') }}
                    onChange={this.handleChangeFormItem}
                  />
                ) : (
                  <span>{ouName}</span>
                )
              )}
              {getFieldDecorator('ouName', {
                initialValue: ouName,
              })}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get('entity.organization.class.purchase').d('采购组织')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('purchaseOrgId', {
                initialValue:
                  purchaseOrgId || defaultPurchaseOrgId || createPurchaseOrderInfo.purchaseOrgId,
              })(
                editable || maintainEditable ? (
                  <Lov
                    // code="HPFM.PURCHASE_ORGANIZATION"
                    code="SPFM.USER_AUTH.PURORG"
                    textValue={
                      purchaseOrgName ||
                      defaultPurchaseOrgName ||
                      createPurchaseOrderInfo.purOrganizationName
                    }
                    queryParams={{ tenantId }}
                    onChange={this.handleChangeFormItem}
                  />
                ) : (
                  <span>{purchaseOrgName}</span>
                )
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get('spcm.common.model.common.agentName').d('采购员')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('purchaseAgentId', {
                initialValue:
                  purchaseAgentId ||
                  defaultPurchaseAgentId ||
                  createPurchaseOrderInfo.purchaseAgentId,
              })(
                editable || maintainEditable ? (
                  <Lov
                    code="SPFM.USER_AUTH.PURCHASE_AGENT"
                    textValue={
                      purchaseAgentName ||
                      defaultPurchaseAgentName ||
                      createPurchaseOrderInfo.purchaseAgentName
                    }
                    queryParams={{ tenantId }}
                    onChange={this.handleChangeAgent}
                  />
                ) : (
                  <span>{purchaseAgentName}</span>
                )
              )}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="writable-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${commonPrompt}.pcType`).d('协议类型')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('pcTypeId', {
                initialValue: pcTypeId,
                rules: [
                  {
                    required: editable && getFieldValue('companyId'),
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${commonPrompt}.pcType`).d('协议类型'),
                    }),
                  },
                ],
              })(
                editable ? (
                  <Lov
                    disabled={!getFieldValue('companyId')}
                    code="SPCM.PC_TYPE"
                    textValue={pcTypeName}
                    queryParams={{
                      enabledFlag: 1,
                      companyId: getFieldValue('companyId'),
                      tenantId,
                    }}
                    onChange={(_, lovRecord) => {
                      this.handleChangePcTypeId(_, lovRecord);
                    }}
                  />
                ) : (
                  <span>{pcTypeName}</span>
                )
              )}
            </FormItem>
          </Col>
          {!['ATTACHMENT_FRAMEWORK', 'ATTACHMENT'].includes(
            getFieldValue('pcKindCode') || pcKindCode
          ) && (
            <Col {...FORM_COL_3_LAYOUT}>
              <FormItem
                label={intl.get(`${common}.pcTemplateId`).d('协议模板')}
                {...EDIT_FORM_ITEM_LAYOUT}
              >
                {getFieldDecorator('pcTemplateId', {
                  initialValue: pcTemplateId,
                  rules: [
                    {
                      // 协议拟制：pcHeader为空，或者supplementFlag存在的时候允许修改协议模板。
                      required:
                        (editable || (maintainEditable && supplementFlag)) &&
                        getFieldValue('pcTypeId'),
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`${common}.pcTemplateId`).d('协议模板'),
                      }),
                    },
                  ],
                })(
                  editable || (maintainEditable && supplementFlag) ? (
                    <Lov
                      disabled={!getFieldValue('pcTypeId')}
                      code="SPCM.PC_TEMPLATE"
                      textValue={getFieldValue('templateName') || templateName}
                      queryParams={{
                        enabledFlag: 1,
                        pcTypeId: getFieldValue('pcTypeId'),
                        companyId: getFieldValue('companyId'),
                        templateStatus: 'END_APPROVAL',
                        supplementFlag: supplementFlag === 1 ? 1 : 0, // 后端接收参数要求为数字类型的布尔值
                      }}
                    />
                  ) : (
                    <span>{templateName}</span>
                  )
                )}
              </FormItem>
            </Col>
          )}
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`entity.supplier.tag`).d('供应商')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {
                {
                  true: getFieldDecorator('supplierCompanyName', {
                    initialValue:
                      supplierCompanyName ||
                      defaultSupplierCompanyName ||
                      createPurchaseOrderInfo.supplierCompanyName ||
                      createPurchaseOrderInfo.supplierName ||
                      supplierName,
                    rules: [
                      {
                        required:
                          (editable || maintainEditable) &&
                          createPurchaseOrderInfo.supplierCompanyName !== null,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`entity.supplier.tag`).d('供应商'),
                        }),
                      },
                    ],
                  })(
                    editable || (maintainEditable && !supplementFlag) ? (
                      <Input
                        disabled={
                          (createPurchaseOrderInfo.supplierCompanyId && quoteType === 'PO') ||
                          isEditisQuoteSource
                        }
                        onChange={(e) =>
                          this.handleChangeSupplier(e.target.value, {
                            supplierTenantId: -1,
                            supplierCompanyId: -1,
                            supplierCompanyNum: e.target.value,
                            supplierCompanyName: e.target.value,
                            supplierCurrencyCode: 'CNY',
                          })
                        }
                      />
                    ) : (
                      <span>{supplierCompanyName || supplierName}</span>
                    )
                  ),
                  false: getFieldDecorator('supplierCompanyId', {
                    initialValue:
                      supplierCompanyId ||
                      defaultSupplierCompanyId ||
                      createPurchaseOrderInfo.supplierCompanyId ||
                      createPurchaseOrderInfo.supplierName ||
                      supplierName,
                    rules: [
                      {
                        required:
                          (editable || maintainEditable) &&
                          supplierCompanyId !== null &&
                          createPurchaseOrderInfo.supplierCompanyId !== null,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`entity.supplier.tag`).d('供应商'),
                        }),
                        // validator: this.verifySupplier,
                      },
                    ],
                  })(
                    editable || (maintainEditable && !supplementFlag) ? (
                      <Lov
                        code="SPCM.AUTH_SUPPLIER_LIFE_CYCLE"
                        disabled={createPurchaseOrderInfo.supplierCompanyId && quoteType === 'PO'}
                        onChange={this.handleChangeSupplier}
                        textField="supplierCompanyName"
                        allowClear={!isEditisQuoteSource}
                        textValue={
                          supplierCompanyName ||
                          defaultSupplierCompanyName ||
                          createPurchaseOrderInfo.supplierCompanyName ||
                          createPurchaseOrderInfo.supplierName ||
                          supplierName
                        }
                        queryParams={{
                          enabledFlag: 1,
                          companyId: getFieldValue('companyId'),
                          supplierCompanyId: isEditisQuoteSource ? supplierCompanyId : null,
                          tenantId,
                          userId,
                          organizationId: tenantId,
                        }}
                      />
                    ) : (
                      <span>{supplierCompanyName || supplierName}</span>
                    )
                  ),
                }[(getFieldValue('pcKindCode') || pcKindCode) === 'NOT_SYS_SUPPLIER']
              }
              {getFieldDecorator('platSupplierCompanyId', {
                initialValue: supplierCompanyId || createPurchaseOrderInfo.supplierCompanyId,
              })}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="writable-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${common}.signedEffect`).d('签署即生效')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('signEffectFlag', {
                initialValue: signEffectFlag || 0,
              })(
                editable || maintainEditable ? (
                  <Switch
                    onChange={(e) => {
                      this.handleChangeContractDate({
                        signEffectFlag: e,
                        /**
                         * 下述字段不判断直接赋值的原因是：若签署即生效为true，则会置空且禁止操作该字段；
                         * 若取反，因上一次操作的缘故，初始值依旧是上一次的值
                         */
                        startDateActive: undefined,
                        endDateActive: undefined,
                      });
                      if (e === 1) {
                        setFieldsValue({ startDateActive: null, endDateActive: null });
                      } else {
                        setFieldsValue({ effectiveTime: null });
                      }
                    }}
                  />
                ) : (
                  yesOrNoRender(signEffectFlag)
                )
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${common}.effectiveTime`).d('有效时长')}
              className={styles['effective-time']}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('effectiveTime', {
                initialValue: effectiveTime,
                rules: [
                  {
                    required: getFieldValue('signEffectFlag') && (editable || maintainEditable),
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${common}.effectiveTime`).d('有效时长'),
                    }),
                  },
                ],
              })(
                editable || maintainEditable ? (
                  <InputNumber
                    min={0}
                    // style={{ width: '100px', marginRight: '8px' }}
                    allowThousandth
                    disabled={getFieldValue('signEffectFlag') !== 1}
                    onChange={this.handleChangeFormItem}
                  />
                ) : (
                  <span>{effectiveTime}</span>
                )
              )}
              <span>{intl.get(`${common}.days`).d('天')}</span>
            </FormItem>
          </Col>
          {(primeAcceptFlag || !!acceptFlag) && (
            <Col {...FORM_COL_3_LAYOUT}>
              <FormItem
                label={intl.get(`spcm.common.model.checkType`).d('验收类型')}
                {...EDIT_FORM_ITEM_LAYOUT}
              >
                {getFieldDecorator('acceptType', {
                  initialValue: acceptType,
                  rules: [
                    {
                      required: editable || maintainEditable,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`spcm.common.model.checkType`).d('验收类型'),
                      }),
                    },
                  ],
                })(
                  (editable || maintainEditable) && !supplementFlag ? (
                    <Select
                      allowClear
                      style={{ minWidth: 150 }}
                      onChange={this.handleChangeFormItem}
                    >
                      {acceptTypeList.map((n) => (
                        <Select.Option key={n.value} value={n.value}>
                          {n.meaning}
                        </Select.Option>
                      ))}
                    </Select>
                  ) : (
                    <span>{acceptTypeMeaning}</span>
                  )
                )}
              </FormItem>
            </Col>
          )}
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="writable-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${common}.startDateActive`).d('协议起始日期')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('startDateActive', {
                initialValue: startDateActive ? moment(startDateActive) : null,
                rules: [
                  {
                    required:
                      effectiveTimeFlag && !signEffectFlag && (editable || maintainEditable),
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${common}.startDateActive`).d('协议起始日期'),
                    }),
                  },
                ],
              })(
                editable || maintainEditable ? (
                  <DatePicker
                    disabled={getFieldValue('signEffectFlag') === 1}
                    format={getDateFormat()}
                    placeholder={null}
                    disabledDate={(currentDate) =>
                      getFieldValue('endDateActive') &&
                      moment(getFieldValue('endDateActive')).isBefore(currentDate, 'day')
                    }
                    onChange={(value) => {
                      this.handleChangeFormItem();
                      this.handleChangeContractDate({
                        startDateActive: value,
                      });
                    }}
                  />
                ) : (
                  <span>{dateRender(startDateActive)}</span>
                )
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${common}.endDateActive`).d('协议终止日期')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('endDateActive', {
                initialValue: endDateActive ? moment(endDateActive) : null,
                rules: [
                  {
                    required:
                      effectiveTimeFlag && !signEffectFlag && (editable || maintainEditable),
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${common}.endDateActive`).d('协议终止日期'),
                    }),
                  },
                ],
              })(
                editable || maintainEditable ? (
                  <DatePicker
                    disabled={getFieldValue('signEffectFlag') === 1}
                    format={getDateFormat()}
                    placeholder={null}
                    disabledDate={(currentDate) =>
                      getFieldValue('startDateActive') &&
                      moment(getFieldValue('startDateActive')).isAfter(currentDate, 'day')
                    }
                    onChange={(value) => {
                      this.handleChangeFormItem();
                      this.handleChangeContractDate({
                        endDateActive: value,
                      });
                    }}
                  />
                ) : (
                  <span>{dateRender(endDateActive)}</span>
                )
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${commonPrompt}.mainContractId`).d('主协议')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('mainContractId', {
                initialValue: mainContractId,
              })(
                (editable || maintainEditable) && alterationFlag === 0 ? (
                  <Lov
                    code="SPCM.CONTRACT"
                    textValue={mainPcNum}
                    lovOptions={{ displayField: 'pcNum' }}
                    queryParams={{ enabledFlag: 1, pcHeaderIdSet: pcHeaderId }}
                    onChange={this.handleChangeMainContract}
                  />
                ) : isPub ||
                  mainPcNum === pcNum ||
                  ['/spcm/contract-sign/detail', '/spcm/supplier-contract-view/detail'].includes(
                    path
                  ) ? (
                    <span>{mainPcNum}</span>
                ) : (
                  <a onClick={() => this.redirectDetail(mainContractId)}>{mainPcNum}</a>
                )
              )}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="writable-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`spcm.common.model.companyOrgName`).d('公司组织')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('companyOrgId', {
                initialValue: companyOrgId,
              })(
                (editable || maintainEditable) && alterationFlag === 0 ? (
                  <Lov
                    code="SPFM.UNIT_G_C"
                    textValue={companyOrgName}
                    queryParams={{
                      organizationId: tenantId,
                      levelPathFrom: 0,
                      levelPathTo: 99999,
                      unitTypeCode: 'G,C',
                    }}
                    onChange={this.handleChangeFormItem}
                  />
                ) : (
                  <span>{companyOrgName}</span>
                )
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`spcm.common.model.costAnchDepDesc`).d('费用挂靠部门')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('costAnchDepId', {
                initialValue: costAnchDepId,
              })(
                (editable || maintainEditable) && alterationFlag === 0 ? (
                  <Lov
                    code="SPFM.UNIT_G_C"
                    textValue={costAnchDepDesc}
                    queryParams={{
                      organizationId: tenantId,
                      levelPathFrom: 0,
                      levelPathTo: 1,
                      unitTypeCode: 'D',
                      unitCompanyId: getFieldValue('companyOrgId'),
                    }}
                    disabled={!getFieldValue('companyOrgId')}
                    onChange={(value, record) => this.handleExpUnitChange(value, record)}
                    onMouseEnter={() => this.handleToolTipVisible('unitIdVisible', true)}
                    onMouseLeave={() => this.handleToolTipVisible('unitIdVisible', false)}
                  />
                ) : (
                  <span>{costAnchDepDesc}</span>
                )
              )}
              {/* <Tooltip
                visible={unitIdVisible && !getFieldValue('companyOrgId')}
                title={intl
                  .get(`spcm.common.confim.model.pleaseChooseCompanyFirst`)
                  .d('请先选择公司组织')}
              /> */}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`spcm.common.model.overseasProcurement`).d('境外采购')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('overseasProcurement', {
                initialValue: overseasProcurement,
              })(
                (editable || maintainEditable) && alterationFlag === 0 ? (
                  <Switch onChange={this.handleChangeFormItem} />
                ) : (
                  yesOrNoRender(overseasProcurement)
                )
              )}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="writable-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`spcm.common.archiveCode`).d('归档码')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('archiveCode', {
                initialValue: archiveCode,
                rules: [
                  {
                    max: 120,
                    message: intl.get('hzero.common.validation.max', { max: 120 }),
                  },
                ],
              })(
                editable || maintainEditable ? (
                  <Input onChange={this.handleChangeFormItem} maxLength={30} />
                ) : (
                  <span>{archiveCode}</span>
                )
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get('spcm.common.model.pcSourceCode').d('协议来源')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('pcSourceCode', {
                initialValue: pcSourceCode || '' || defaultProtocolSource,
              })(<span>{pcSourceCodeMeaning || '' || defaultProtocolSourceMeaning}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="writable-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`spcm.common.model.common.globalFlag`).d('是否全局协议')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('globalFlag', {
                initialValue: globalFlag || 0,
              })(
                ((pcStatusCode === 'PENDING' || pcStatusCode === 'REJECTED') && editable) ||
                  maintainEditable ? (
                  // eslint-disable-next-line react/jsx-indent
                  <Switch />
                ) : (
                  yesOrNoRender(globalFlag)
                )
              )}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="writable-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`spcm.common.model.contractPurpose`).d('协议用途')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('contractPurpose', {
                initialValue: contractPurpose,
                rules: [
                  {
                    required: editable || maintainEditable,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${commonPrompt}.contractPurpose`).d('协议用途'),
                    }),
                  },
                ],
              })(
                editable || maintainEditable ? (
                  <Select allowClear style={{ minWidth: 150 }} onChange={this.handleChangeFormItem}>
                    {contractPurposeList.map((n) => (
                      <Select.Option key={n.value} value={n.value}>
                        {n.meaning}
                      </Select.Option>
                    ))}
                  </Select>
                ) : (
                  <span>{contractPurposeMeaning}</span>
                )
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`spcm.common.model.signDescription`).d('签订原因')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('signDescription', {
                initialValue: signDescription,
              })(
                editable || maintainEditable ? (
                  <Input onChange={this.handleChangeFormItem} />
                ) : (
                  <span className="ant-textarea" word-warp="break-word">
                    {signDescription}
                  </span>
                )
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`spcm.common.model.signAddress`).d('签署地点')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('signAddress', {
                initialValue: signAddress,
              })(
                editable || maintainEditable ? (
                  <Input onChange={this.handleChangeFormItem} />
                ) : (
                  <span className="ant-textarea" word-warp="break-word">
                    {signAddress}
                  </span>
                )
              )}
            </FormItem>
          </Col>
          {terminateReasonFlag && (
            <Col {...FORM_COL_3_LAYOUT}>
              <FormItem
                label={intl.get(`spcm.common.model.terminationReason`).d('终止原因')}
                {...EDIT_FORM_ITEM_LAYOUT}
              >
                {getFieldDecorator('terminationReason', {
                  initialValue: terminationReason,
                })(
                  editable || maintainEditable ? (
                    <Input onChange={this.handleChangeFormItem} />
                  ) : (
                    <span className="ant-textarea" word-warp="break-word">
                      {terminationReason}
                    </span>
                  )
                )}
              </FormItem>
            </Col>
          )}
          {terminateReasonFlag && (
            <Col {...FORM_COL_3_LAYOUT}>
              <FormItem
                label={intl.get(`spcm.common.model.terminationAttachment`).d('终止文件')}
                {...EDIT_FORM_ITEM_LAYOUT}
              >
                {getFieldDecorator('terminationAttachmentUuid')(
                  <Upload
                    viewOnly
                    attachmentUUID={terminationAttachmentUuid}
                    icon={false}
                    bucketName={PRIVATE_BUCKET}
                    bucketDirectory="purchaser-attachment"
                  />
                )}
              </FormItem>
            </Col>
          )}
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="writable-row">
          {(pcSourceCode === 'PURCHASE_ORDER' || quoteType === 'PO') && (
            <Col {...FORM_COL_3_LAYOUT}>
              <FormItem
                label={intl.get('spcm.common.model.common.termId').d('付款条款')}
                {...EDIT_FORM_ITEM_LAYOUT}
              >
                {getFieldDecorator('termsName', {
                  initialValue: termsName || createPurchaseOrderInfo.termsName,
                })(<span>{termsName || createPurchaseOrderInfo.termsName}</span>)}
              </FormItem>
            </Col>
          )}
          {paperFlag && (
            <Col {...FORM_COL_3_LAYOUT}>
              <FormItem
                label={intl.get(`spcm.common.model.paperDeliveryMethod`).d('合同配送方式')}
                {...EDIT_FORM_ITEM_LAYOUT}
              >
                {getFieldDecorator('paperDeliveryMethod', {
                  initialValue: paperDeliveryMethod,
                  rules: [
                    {
                      required: contractPath === 'sign',
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`${commonPrompt}.paperDeliveryMethod`).d('合同配送方式'),
                      }),
                    },
                  ],
                })(
                  contractPath === 'sign' ? (
                    <Select
                      allowClear
                      style={{ minWidth: 150 }}
                      onChange={(value) => this.handleFieldChange(value, 'paperDeliveryMethod')}
                    >
                      {paperDeliveryMethodList.map((n) => (
                        <Select.Option key={n.value} value={n.value}>
                          {n.meaning}
                        </Select.Option>
                      ))}
                    </Select>
                  ) : (
                    <span>{paperDeliveryMethodMeaning}</span>
                  )
                )}
              </FormItem>
            </Col>
          )}
          {paperFlag && (
            <Col {...FORM_COL_3_LAYOUT}>
              <FormItem
                label={intl.get(`spcm.common.model.paperDeliveryInfo`).d('合同配送信息')}
                {...EDIT_FORM_ITEM_LAYOUT}
              >
                {getFieldDecorator('paperDeliveryInfo', {
                  initialValue: paperDeliveryInfo,
                  rules: [
                    {
                      required: contractPath === 'sign',
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`${commonPrompt}.paperDeliveryInfo`).d('合同配送信息'),
                      }),
                    },
                  ],
                })(
                  contractPath === 'sign' ? (
                    <Input
                      onChange={(e) => this.handleFieldChange(e.target.value, 'paperDeliveryInfo')}
                    />
                  ) : (
                    <span className="ant-textarea" word-warp="break-word">
                      {paperDeliveryInfo}
                    </span>
                  )
                )}
              </FormItem>
            </Col>
          )}
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="writable-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get('spcm.common.model.common.unitId').d('所属部门')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('unitId', {
                initialValue: unitId,
              })(
                editable || maintainEditable ? (
                  <Lov
                    code="SPRM.USER_UNIT"
                    disabled={!getFieldValue('companyId')}
                    textValue={unitName}
                    queryParams={{ tenantId, companyId: getFieldValue('companyId') }}
                  />
                ) : (
                  <span>{unitName}</span>
                )
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get('spcm.common.model.common.creatorUnitId').d('创建人所属部门')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('creatorUnitId', {
                initialValue: creatorUnitId,
              })(
                editable || maintainEditable ? (
                  <Lov
                    code="SPRM.USER_EMPLOYEE_ALL_UNIT"
                    textValue={creatorUnitName}
                    disabled={!pcHeaderId}
                  />
                ) : (
                  <span>{creatorUnitName}</span>
                )
              )}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="writable-row">
          {purchaseFlag && (
            <Col {...FORM_COL_3_LAYOUT}>
              <FormItem
                label={intl.get(`spcm.common.innerRemark`).d('内部批注')}
                {...EDIT_FORM_ITEM_LAYOUT}
              >
                {getFieldDecorator('internalPostil', {
                  initialValue: internalPostil,
                  rules: [
                    {
                      max: 480,
                      message: intl.get('hzero.common.validation.max', { max: 480 }),
                    },
                  ],
                })(
                  editable || maintainEditable ? (
                    <TextArea onChange={this.handleChangeFormItem} autoSize={{ minRows: 1 }} />
                  ) : (
                    <span className="ant-textarea" word-warp="break-word">
                      {internalPostil}
                    </span>
                  )
                )}
              </FormItem>
            </Col>
          )}
          {editable || maintainEditable ? (
            ''
          ) : (
            <Col {...FORM_COL_3_LAYOUT}>
              <FormItem
                label={intl.get(`spcm.common.archiveDate`).d('归档日期')}
                {...EDIT_FORM_ITEM_LAYOUT}
              >
                {getFieldDecorator('archiveDate', {
                  initialValue: archiveDate,
                })(<span>{archiveDate}</span>)}
              </FormItem>
            </Col>
          )}
          {isShowArchiveUpload && (
            <Col {...FORM_COL_3_LAYOUT}>
              <FormItem
                label={intl.get(`spcm.common.attachmentUuid`).d('归档文件')}
                {...EDIT_FORM_ITEM_LAYOUT}
              >
                {getFieldDecorator('archiveAttachmentUuid')(
                  <Upload {...purchaseArchiveUploadProps} />
                )}
              </FormItem>
            </Col>
          )}
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem label={intl.get(`hzero.common.remark`).d('备注')} {...EDIT_FORM_ITEM_LAYOUT}>
              {getFieldDecorator('remark', {
                initialValue: remark,
                rules: [
                  {
                    max: 480,
                    message: intl.get('hzero.common.validation.max', { max: 480 }),
                  },
                ],
              })(
                editable || maintainEditable ? (
                  <TextArea onChange={this.handleChangeFormItem} rows={2} />
                ) : (
                  <span className="ant-textarea" word-warp="break-word">
                    {remark}
                  </span>
                )
              )}
            </FormItem>
          </Col>
        </Row>
        {!maintainEditable && (
          <Row {...EDIT_FORM_ROW_LAYOUT} className="writable-row">
            <Col {...FORM_COL_3_LAYOUT}>
              {pcHeaderId && (
                <FormItem
                  label={intl.get(`spcm.common.signatureTypeMeaning`).d('签署方式')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('signatureTypeMeaning', {
                    initialValue: signatureTypeMeaning,
                  })(<span>{signatureTypeMeaning2}</span>)}
                </FormItem>
              )}
            </Col>
          </Row>
        )}
        <Row {...EDIT_FORM_ROW_LAYOUT} className="writable-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get('spcm.common.model.taxIncludeAmount.chinese').d('大写协议总额')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('taxIncludeAmountChinese', {
                initialValue: taxIncludeAmountChinese,
              })(<span>{taxIncludeAmountChinese}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get('spcm.common.model.amount.chinese').d('大写不含税总额')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('amountChinese', {
                initialValue: amountChinese,
              })(<span>{amountChinese}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get('spcm.common.model.pcHeaderTaxAmount.chinese').d('大写头税额')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('pcHeaderTaxAmountChinese', {
                initialValue: pcHeaderTaxAmountChinese,
              })(<span>{pcHeaderTaxAmountChinese}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="writable-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get('spcm.common.model.total.basicQuantity').d('基本总数量')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('totalQuantity', {
                initialValue: totalQuantity,
              })(<span>{totalQuantity}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get('spcm.common.model.total.auxiliaryQuantity').d('辅助总数量')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('totalSecondaryQuantity', {
                initialValue: totalSecondaryQuantity,
              })(<span>{totalSecondaryQuantity}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get('spcm.common.model.contractCalculateMethod').d('协议阶段计算方式')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('contractCalculateMethod', {
                initialValue: contractCalculateMethod,
              })(<span>{contractCalculateMethodMeaning}</span>)}
            </FormItem>
          </Col>
          {payPlanNum && !supplierPath.includes(path) && (
            <Col {...FORM_COL_3_LAYOUT}>
              <FormItem
                label={intl.get(`sodr.workspace.model.common.newPaymentPlanNum`).d('付款计划编号')}
                {...EDIT_FORM_ITEM_LAYOUT}
              >
                {getFieldDecorator('payPlanNum', {
                  initialValue: payPlanNum,
                })(
                  <a
                    onClick={() => {
                      return openTermsModal({ record: dataSource }, data);
                    }}
                    // 原协议（未发生过变更、升版本、补充），在新建、审批拒绝、拒绝生效（可编辑的状态下），付款计划不可点击
                    disabled={!supplementFlag && version === 1 && pcStatusFlag === 0}
                  >
                    {payPlanNum}
                  </a>
                )}
              </FormItem>
            </Col>
          )}
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="writable-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl
                .get('spcm.common.model.cnfApplicability')
                .d('适用多组织协议标的可转订单策略')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('cnfApplicability', {
                initialValue: cnfApplicability,
              })(
                editable || maintainEditable ? (
                  <ValueList
                    lovCode="SPCM.APPLICABILITY_CONTROL"
                    lazyLoad={false}
                    style={{ width: '100%' }}
                    allowClear
                  />
                ) : (
                  <span>{cnfApplicabilityMeaning}</span>
                )
              )}
            </FormItem>
          </Col>
          {cnfApplicability === '2' && (
            <Col {...FORM_COL_3_LAYOUT}>
              <FormItem
                label={intl
                  .get('spcm.common.model.controlApplicability')
                  .d('标的有其他适用范围是否可转订单')}
                help={intl
                  .get('spcm.common.view.message.controlApplicability')
                  .d('包含其他适用组织的标的行转订单时，订单公司不支持更换，仅与协议头公司一致')}
                {...EDIT_FORM_ITEM_LAYOUT}
              >
                {getFieldDecorator('controlApplicability', {
                  initialValue: controlApplicability,
                  rules: [
                    {
                      required: editable || maintainEditable,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get('spcm.common.model.controlApplicability')
                          .d('标的有其他适用范围是否可转订单'),
                      }),
                    },
                  ],
                })(
                  editable || maintainEditable ? (
                    <ValueList
                      lovCode="SPCM.APPLICABILITY_NO_CONTROL"
                      lazyLoad={false}
                      style={{ width: '100%' }}
                      allowClear
                    />
                  ) : (
                    <span>{controlApplicabilityMeaning}</span>
                  )
                )}
              </FormItem>
            </Col>
          )}
        </Row>
        {agreementAmountRows && (
          <Row {...EDIT_FORM_ROW_LAYOUT} className="writable-row">
            <Col {...FORM_COL_3_LAYOUT}>
              <FormItem
                label={intl
                  .get('spcm.common.model.field.amountControlDimension')
                  .d('协议金额控制维度')}
                {...EDIT_FORM_ITEM_LAYOUT}
              >
                {getFieldDecorator('amountControlDimension', {
                  initialValue: dataSource.amountControlDimension,
                })(<span>{dataSource.amountControlDimensionMeaning || '-'}</span>)}
              </FormItem>
            </Col>
            <Col {...FORM_COL_3_LAYOUT}>
              <FormItem
                label={intl
                  .get('spcm.common.model.field.manuallyModifyAmount')
                  .d('是否允许手工维护协议金额上限')}
                {...EDIT_FORM_ITEM_LAYOUT}
              >
                {getFieldDecorator('manuallyModifyAmount', {
                  initialValue: dataSource.manuallyModifyAmount,
                })(
                  <span>
                    {isNil(dataSource.manuallyModifyAmount)
                      ? '-'
                      : yesOrNoRender(+dataSource.manuallyModifyAmount)}
                  </span>
                )}
              </FormItem>
            </Col>
            <Col {...FORM_COL_3_LAYOUT}>
              <FormItem
                label={intl.get('spcm.common.field.limitAmountField').d('协议金额上限取值字段')}
                {...EDIT_FORM_ITEM_LAYOUT}
              >
                {getFieldDecorator('limitAmountField', {
                  initialValue: dataSource.limitAmountField,
                })(<span>{dataSource.limitAmountFieldMeaning || '-'}</span>)}
              </FormItem>
            </Col>
          </Row>
        )}
        {agreementAmountRows && (
          <Row {...EDIT_FORM_ROW_LAYOUT} className="writable-row">
            <Col {...FORM_COL_3_LAYOUT}>
              <FormItem
                label={intl.get('spcm.common.model.field.amountControlType').d('协议金额控制类型')}
                {...EDIT_FORM_ITEM_LAYOUT}
              >
                {getFieldDecorator('amountControlType', {
                  initialValue: dataSource.amountControlType,
                })(<span>{dataSource.amountControlTypeMeaning || '-'}</span>)}
              </FormItem>
            </Col>
            <Col {...FORM_COL_3_LAYOUT}>
              <FormItem
                label={intl.get('spcm.common.model.field.strategyNum').d('协议金额控制策略编码')}
                {...EDIT_FORM_ITEM_LAYOUT}
              >
                {getFieldDecorator('strategyNum', {
                  initialValue: dataSource.strategyNum,
                })(<span>{dataSource.strategyNum || '-'}</span>)}
              </FormItem>
            </Col>
            {maxContractAmountFlag && (
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl.get('spcm.common.field.maxContractAmount').d('协议总额上限')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('maxContractAmount', {
                    initialValue: dataSource.maxContractAmount,
                    rules: [
                      {
                        required:
                          pageSourceKey !== 'PURCHASE_CONTRACT_VIEW' && maxContractAmountFlag,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get('spcm.common.field.maxContractAmount').d('协议总额上限'),
                        }),
                      },
                    ],
                  })(
                    pageSourceKey !== 'PURCHASE_CONTRACT_VIEW' ? (
                      <InputNumber min={0} allowThousandth />
                    ) : (
                      <span>{dataSource.maxContractAmount || '-'}</span>
                    )
                  )}
                </FormItem>
              </Col>
            )}
          </Row>
        )}
        {agreementAmountRows && (
          <Row {...EDIT_FORM_ROW_LAYOUT} className="writable-row">
            <Col {...FORM_COL_3_LAYOUT}>
              <FormItem
                label={intl
                  .get('spcm.common.model.field.maxContractAmountChinese')
                  .d('协议总额上限（大写）')}
                {...EDIT_FORM_ITEM_LAYOUT}
              >
                {getFieldDecorator('maxContractAmountChinese', {
                  initialValue: dataSource.maxContractAmountChinese,
                })(<span>{dataSource.maxContractAmountChinese || '-'}</span>)}
              </FormItem>
            </Col>
            {getFieldValue('amountControlDimension') === 'HEAD' && (
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl
                    .get('spcm.common.model.field.taxIncludeOccupiedAmount')
                    .d('协议头订单已占用金额（含税）')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('taxIncludeOccupiedAmount', {
                    initialValue: dataSource.taxIncludeOccupiedAmount,
                  })(<span>{dataSource.taxIncludeOccupiedAmount || '-'}</span>)}
                </FormItem>
              </Col>
            )}
            {getFieldValue('amountControlDimension') === 'HEAD' && (
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl
                    .get('spcm.common.field.occupiedAmount')
                    .d('协议头订单已占用金额（未税）')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('occupiedAmount', {
                    initialValue: dataSource.occupiedAmount,
                  })(<span>{dataSource.occupiedAmount || '-'}</span>)}
                </FormItem>
              </Col>
            )}
          </Row>
        )}
        <Row {...EDIT_FORM_ROW_LAYOUT} className="writable-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get('spcm.common.model.field.contractTemplateLang').d('协议模板语言环境')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('contractTemplateLang', {
                initialValue: dataSource.contractTemplateLang,
              })(<span>{dataSource.contractTemplateLangMeaning || '-'}</span>)}
            </FormItem>
          </Col>
          {agreementAmountRows && (
            <Col {...FORM_COL_3_LAYOUT}>
              <FormItem
                label={intl
                  .get('spcm.amountStrategy.model.valueRules.amountField')
                  .d('金额取值字段')}
                {...EDIT_FORM_ITEM_LAYOUT}
              >
                {getFieldDecorator('amountField', {
                  initialValue: dataSource.amountField,
                })(<span>{dataSource.amountFieldMeaning || '-'}</span>)}
              </FormItem>
            </Col>
          )}
          {showOrderAmountRatio && (
            <Col {...FORM_COL_3_LAYOUT}>
              <FormItem
                label={
                  <span>
                    {intl
                      .get('spcm.common.model.field.orderOccupiedAmountRatio')
                      .d('订单已占用金额比例（%）')}
                    <Tooltip
                      title={intl
                        .get('spcm.common.model.field.orderOccupiedAmountRatioTip')
                        .d('该字段计算逻辑为：（协议头订单已占用金额/协议总额上限）*100%')}
                    >
                      <Icon type="question-circle-o" />
                    </Tooltip>
                  </span>
                }
                {...EDIT_FORM_ITEM_LAYOUT}
              >
                {getFieldDecorator('orderOccupiedAmountRatio', {
                  initialValue: dataSource.orderOccupiedAmountRatio,
                })(<InputNumber disabled precision={2} />)}
              </FormItem>
            </Col>
          )}
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="writable-row">
          {(pageSourceKey === 'CONTRACT_MAINTAIN' && electricAndSaasSignFlag) &&(
            <Col {...FORM_COL_3_LAYOUT}>
              <FormItem
                label={
                  <span>
                    {intl
                      .get('spcm.common.model.field.orderOccupiedAmountRatio')
                      .d('静默签骑缝章坐标')}
                    <Tooltip
                      title={intl
                        .get('spcm.common.model.field.orderOccupiedAmountRatioTip')
                        .d('A4纸，Y坐标建议60–732，不填默认500')}
                    >
                      <Icon type="question-circle-o" />
                    </Tooltip>
                  </span>
                }
                {...EDIT_FORM_ITEM_LAYOUT}
              >
                {getFieldDecorator('silentSealPositionY', {
                  initialValue: dataSource.silentSealPositionY,
                })(
                  electricAndSaasSignFlag ? (
                    <InputNumber precision={0} min={0} />
                  ) : (
                    <span>{dataSource.maxContractAmount || '-'}</span>
                  )
                )}
              </FormItem>
            </Col>
          )}
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="writable-row">
          {/* {remote
            ? remote.render('SPCM_CONTRACT_HEADER_OTHER_FORM', <></>, {
              form,
              dataSource,
            }) : null} */}
          {remote
            ? remote.process('SPCM_CONTRACT_HEADER_OTHER_FORM', null, {
                form,
                dataSource,
                parentProps: this.props,
                current: this,
              })
            : null}
        </Row>
      </Form>
    );
  }
}
