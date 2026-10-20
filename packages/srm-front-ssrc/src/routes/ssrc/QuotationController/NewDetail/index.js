import React, { Component, Fragment } from 'react';
import { isEmpty, noop, isFunction, uniq } from 'lodash';
import classnames from 'classnames';
import queryString from 'querystring';
import { routerRedux } from 'dva/router';
import WithCustomizeC7N from 'srm-front-cuz/lib/c7nCustomize';
import { Spin, Modal, message, DataSet } from 'choerodon-ui/pro';
import { TopSection, SecondSection } from '_components/Section';
import remoteHoc from 'hzero-front/lib/utils/remote';
import { observer } from 'mobx-react';

import { Header } from 'components/Page';
import DynamicButtons from '_components/DynamicButtons';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import {
  getCurrentUserId,
  getCurrentOrganizationId,
  getResponse,
  getCurrentTenant,
} from 'utils/utils';
import {
  getSourceCategoryName,
  INQUIRY_LOWERCASE,
  BID,
  getQuotationName,
  getDocumentTypeName,
  getOmitName,
  getCheckPriceName,
  getSourceName,
} from '@/utils/globalVariable';
import { validateModal } from '@/routes/components/ConfirmModal';
import OperateSectionPromptModal from '@/routes/ssrc/InquiryHall/SectionPanel/OperateSectionPromptModal';
import { Bind, throttle, debounce } from 'lodash-decorators';
import notification from 'utils/notification';
import { MatchStringEndNumReg } from '@/utils/SsrcRegx';
import { getJumpRoutePrefixUrl, fetchBiddingHallConfigResult } from '@/utils/utils';

import {
  discardAdjust,
  saveAdjust,
  submitAdjust,
  checkPermission,
  fetchConfigSheet,
  submitSectionAdjust,
  fetchControllerData,
  submitAdjustValidate,
  createBeforeDirectController,
  validateBeforeDirectController,
  getControllerQualificationWarn,
  deleteSuppControllerDatas,
  deleteSectionSuppControllerData,
} from '@/services/inquiryHallNewService';

import Style from './index.less';
// import AnchorSsrc from './AnchorSsrc';
import RfxDemandForm from './RfxDemandForm';
import Supplier from './Supplier';
import BaseInfo from './BaseInfo';
import OrganizationAndStaffForm from './OrganizationAndStaffForm';
import SupplierBatchAddExpiredModal from './SupplierBatchAddExpiredModal';
import SectionPanel from '../SectionPanel';
import ItemLineTable from './ItemLineTable';
import AttachmentForm from './AttachmentForm';
import { SupplierBulkExpiredModalDS } from './BulkAddSupplierDS';

class DetailComponent extends Component {
  constructor(props) {
    super(props);
    const {
      location: { search = {} },
    } = this.props;
    const routerParams = queryString.parse(search.substr(1));
    const { projectLineSectionId } = routerParams;
    this.state = {
      header: {},
      userId: getCurrentUserId(),
      organizationId: getCurrentOrganizationId(),
      isSection: Boolean(projectLineSectionId),
      routerParams,
      sectionLoading: false,
      sectionMessageVisible: false,
      operateSectionPromptProps: {},
      isSelectPass: true, // 判断是否启用通过制
      mergeType: '', // 资格预审的合并方式
      prequalGroupHeaderId: '', // 预审分组id
      sourceProjectId: '', // 立项id
      tempSourceHeaderId: '',
      loading: false, // page operate loading
      checkPermissionObject: {}, // 按钮权限集合
      biddingHallFlag: false, // 是否开启竞价大厅
      qualificationWarnInfo: null, // 资质到期提示字段对象
    };
  }

  itemLineRef = {};

  bidFlag = this.props.sourceKey === BID;

  custKey = this.bidFlag ? 'BID_' : '';

  sourceCategoryName = getSourceCategoryName(this.bidFlag);

  documentTypeName = getDocumentTypeName(this.bidFlag);

  sourceName = getSourceName(this.bidFlag);

  quotationName = getQuotationName(this.bidFlag);

  omitName = getOmitName(this.bidFlag);

  checkPriceName = getCheckPriceName(this.bidFlag);

  sourceKeyLowerCase = this.props.sourceKeyLowerCase || INQUIRY_LOWERCASE;

  timers = null;

  activeTabKey = getJumpRoutePrefixUrl(this.props?.location?.pathname);

  SupplierBulkExpiredLineDS = new DataSet(SupplierBulkExpiredModalDS()); // 供应商资质到期行Ds

  componentDidMount() {
    this.fetchControllerData();
    this.fetchPassConfig();
    this.fetchCheckPermission();
    this.fetchBiddingHallConfig();
  }

  // 查询配置表--是否启用竞价大厅
  fetchBiddingHallConfig = async () => {
    const {
      match: { params = {} },
    } = this.props;
    const { rfxId = null } = params || {};
    let biddingHallFlag = null;

    try {
      biddingHallFlag = await fetchBiddingHallConfigResult({
        organizationId: getCurrentOrganizationId(),
        groupCamp: 'PURCHASER', // 阵营。供应商方：SUPPLIER 采购方：PURCHASER
        adjustRecordId: rfxId,
        roleOmitFlag: 1,
      });
      if (biddingHallFlag === null) {
        return;
      }
      this.setState({ biddingHallFlag: !!biddingHallFlag });
    } catch (e) {
      throw e;
    }
  };

  // 查询配置表--是否启用通过制
  fetchPassConfig = async () => {
    let data = null;

    try {
      data = await fetchConfigSheet({
        configCode: 'ssrc_pass_indicate_config',
        organizationId: getCurrentOrganizationId(),
        data: {
          tenant: getCurrentTenant().tenantNum,
        },
      });
      data = getResponse(data);
      if (!isEmpty(data)) {
        this.setState({ isSelectPass: false });
      }
    } catch (e) {
      throw e;
    }
  };

  // 查询按钮权限
  @Bind()
  async fetchCheckPermission() {
    const {
      location: { pathname },
    } = this.props;
    let prefix = '';
    prefix = this.bidFlag
      ? 'new-bid-hall.new-rfx-detail-controller'
      : 'new-inquiry-hall.new-rfx-detail-controller';
    if (pathname.indexOf('/ssrc/quotation-controller/new-rfx-detail') > -1) {
      prefix = 'quotation-controller.new-rfx-detail-controller';
    } else if (pathname.indexOf('/ssrc/bid-quotation-controller/new-rfx-detail') > -1) {
      prefix = 'bid-quotation-controller.new-rfx-detail-controller';
    }
    const params = [
      `${prefix}.button.batch-add-supplier`?.toLowerCase(), // 批量添加供应商
    ];
    const result = getResponse(await checkPermission(params));
    if (result && !result.failed) {
      const checkPermissionObject = {};
      result.forEach((item = {}) => {
        const { code = null } = item;
        if (!code) {
          return;
        }

        let newCode = code;
        newCode = newCode.substr(code.lastIndexOf('.') + 1);
        checkPermissionObject[newCode] = item;
      });
      this.setState({
        checkPermissionObject,
      });
    }
  }

  @Bind()
  async queryMain() {
    try {
      this.toggleLoading(true);
      await this.fetchControllerData();
      if (this.SupplierRef?.supplierListTableDS) {
        await this.SupplierRef.initSupplierDS();
        await this.SupplierRef.supplierListTableDS.query();
      }
      if (this.itemLineRef?.ItemLineTableDS) {
        await this.itemLineRef.initPageQuery();
      }
      await this.refreshRfxDemand();
      this.toggleLoading(false);
    } catch (e) {
      this.toggleLoading(false);
      throw e;
    }
  }

  timeControllerRef = {};

  RfxDemandRef = {};

  @Bind()
  getTimeControllerRef(ref) {
    this.timeControllerRef = ref;
  }

  BiddingRulesFormRef = {};

  @Bind()
  getBiddingRulesFormRef(ref) {
    this.BiddingRulesFormRef = ref;
  }

  SupplierRef = {};

  @Bind()
  getSupplierRef(ref) {
    this.SupplierRef = ref || {};
  }

  preQualificationRef = {};

  @Bind()
  getPreQualificationRef(ref) {
    this.preQualificationRef = ref || {};
  }

  getItemLineRef = (node = null) => {
    this.itemLineRef = node;
  };

  BaseInfoRef = {};

  @Bind
  getBaseRef(ref) {
    this.BaseInfoRef = ref || {};
  }

  // 采购组织及人员
  OrganizationAndStaffFormRef = {};

  @Bind
  getOrganizationRef(ref) {
    this.OrganizationAndStaffFormRef = ref || {};
  }

  AttachmentFormRef = {};

  @Bind
  getAttachmentFormRef(ref) {
    this.AttachmentFormRef = ref || {};
  }

  // 刷新询价要求
  refreshRfxDemand = () => {
    const { initPage = () => {} } = this.RfxDemandRef;
    initPage();
  };

  // 获取资质到期提示
  @Bind()
  async fetchQualificationWarnController() {
    const {
      match: { params = {} },
    } = this.props;
    const { rfxId = null } = params;
    if (!rfxId) return undefined;
    const res = await getControllerQualificationWarn(rfxId);
    if (getResponse(res)) this.setState({ qualificationWarnInfo: res });
  }

  fetchControllerData = async () => {
    const { organizationId } = this.state;
    const {
      match: { params = {} },
    } = this.props;
    const { rfxId = null } = params;
    try {
      const result = getResponse(
        await fetchControllerData({
          organizationId,
          adjustRecordId: rfxId,
          customizeUnitCode: `SSRC.${this.custKey}QUOTATION_CONTROLLER_DETAIL.SUPPLIER,SSRC.${
            this.custKey
          }QUOTATION_CONTROLLER_DETAIL.TIMEADJUST,SSRC.${
            this.custKey
          }QUOTATION_CONTROLLER_DETAIL.PREQUALIFICATION,SSRC.${
            this.custKey
          }QUOTATION_CONTROLLER_DETAIL.BASE_INFO,SSRC.${
            this.custKey
          }QUOTATION_CONTROLLER_DETAIL.ITEMLINE,SSRC.${
            this.custKey
          }QUOTATION_CONTROLLER_DETAIL.ORGANIZATION_STAFF,SSRC.${
            this.custKey
          }QUOTATION_CONTROLLER_DETAIL.ATTACHMENT_FORM,${this.getControllerCustomizeCodes()},SSRC.${
            this.custKey
          }QUOTATION_CONTROLLER_DETAIL.SCORE_DETAIL_TEMPLATE_FORM`,
        })
      );
      this.fetchQualificationWarnController();
      if (result) {
        this.setState({
          header: result,
        });
        this.initData(result);
      }
    } catch (error) {
      throw error;
    }
  };

  @Bind()
  initData(result = {}) {
    // const { isSection } = this.state;
    this.timers = setTimeout(() => {
      if (this.BaseInfoRef.initDSFields) {
        this.BaseInfoRef.initDSFields([result.rfxHeaderBaseInfoAdjustDTO]);
        if (result?.rfxHeaderBaseInfoAdjustDTO?.prequalGroupHeader) {
          const {
            mergeType = '',
            prequalGroupHeaderId = '',
            sourceProjectId = '',
            tempSourceHeaderId = '',
          } = result?.rfxHeaderBaseInfoAdjustDTO?.prequalGroupHeader;
          this.setState({ mergeType, prequalGroupHeaderId, sourceProjectId, tempSourceHeaderId });
        }
      }
      // 初始化表单数据
      if (this.OrganizationAndStaffFormRef.initDSFields) {
        this.OrganizationAndStaffFormRef.initDSFields([result.memberAndPurAdjustInfoDTO]);
      }
      if (this.timeControllerRef.initDSFields) {
        this.timeControllerRef.clearTimerField(); // manual reView dom
        this.timeControllerRef.initDSFields(result.rfxRequireQuotationAdjustDTO);
      }
      if (this.preQualificationRef.initDSFields) {
        this.preQualificationRef.initDSFields(result.rfxRequirePrequalHeaderAdjustDTO);
      }
      if (this.AttachmentFormRef.initDSFields) {
        this.AttachmentFormRef.initDSFields([result.rfxAttachmentAdjustDTO]);
      }
      this.forceUpdate();
    }, 800); // 时间太短触发时间组件渲染有问题，设置800
  }

  componentWillUnmount() {
    if (this.BaseInfoRef.FormDS) {
      this.BaseInfoRef.FormDS.reset();
    }
    // 组件将要卸载时重置表单
    if (this.OrganizationAndStaffFormRef.OrganizationAndStaffFormDS) {
      this.OrganizationAndStaffFormRef.OrganizationAndStaffFormDS.reset();
    }
    if (this.timeControllerRef.timeControlDS) {
      this.timeControllerRef.timeControlDS.reset();
    }
    if (this.preQualificationRef.prequalificationDS) {
      this.preQualificationRef.prequalificationDS.reset();
    }
    if (this.AttachmentFormRef.AttachmentDS) {
      this.AttachmentFormRef.AttachmentDS.reset();
    }
  }

  @Bind()
  getIntegrateData() {
    const { header, biddingHallFlag } = this.state; // 查出来的数据
    const {
      match: { params = {} },
      remote,
    } = this.props;
    const { rfxId = null } = params;
    const supplierData = this.SupplierRef?.supplierListTableDS?.toJSONData();
    let timeControllerData = this.timeControllerRef?.timeControlDS?.current?.toJSONData() || {};
    const preQualificationData = this.preQualificationRef?.prequalificationDS?.current?.toJSONData();
    const baseInfoData = this.BaseInfoRef?.FormDS?.current?.toJSONData();
    const organizationAndStaffData = this.OrganizationAndStaffFormRef?.rfxMemberListData?.(); // 采购组织及人员
    const rfxLineItemAdjustList = this.itemLineRef?.ItemLineTableDStoData?.();
    // 多轮的数据的DTO
    const { rfxRoundHeaderDateAdjustDTOList = [] } = timeControllerData;

    const { rfxHeaderBaseInfoAdjustDTO = {} } = header;
    const {
      tenantId = null,
      templateId: sourceTemplateId = null,
      adjustRecordId,
      rfxHeaderAdjustId: sourceHeaderAdjustId = null,
      rfxHeaderId: sourceHeaderId = null,
      rfxHeaderBaseInfoDTO = {},
    } = rfxHeaderBaseInfoAdjustDTO;

    // 处理新竞价数据
    const biddingTimeControlData =
      this.dealNewBiddingFieldsData({
        timeControllerData,
        biddingHallFlag,
        rfxHeaderBaseInfoDTO,
      }) || {};

    timeControllerData = {
      ...(timeControllerData || {}),
      ...(biddingTimeControlData || {}),
    };

    // 多轮报价数据整合，默认查出来的数据rfxRoundHeaderDateAdjustDTOList
    let newRfxRoundHeaderDateAdjustDTOList = rfxRoundHeaderDateAdjustDTOList;

    if (rfxRoundHeaderDateAdjustDTOList?.length) {
      const { adjustFields } = timeControllerData;
      if (adjustFields?.length) {
        newRfxRoundHeaderDateAdjustDTOList = rfxRoundHeaderDateAdjustDTOList.map((item) => {
          const newAdjustFields = [];
          const newItemValue = item;
          const { quotationRound = null } = newItemValue;
          if (adjustFields.includes(`roundQuotationStart${quotationRound}`)) {
            // 如果是多轮报价的，把timeControllerData中的adjustFields移到对应的轮次的DTO中
            const position = adjustFields.indexOf(`roundQuotationStart${quotationRound}`);
            timeControllerData.adjustFields.splice(position, 1);
            newAdjustFields.push('roundQuotationStartDate');
          }
          newItemValue.roundQuotationStartDate =
            timeControllerData[`roundQuotationStart${quotationRound}`];

          if (adjustFields.includes(`roundQuotationEnd${quotationRound}`)) {
            // 如果是多轮报价的，把timeControllerData中的adjustFields移到对应的轮次的DTO中
            const position = adjustFields.indexOf(`roundQuotationEnd${quotationRound}`);
            timeControllerData.adjustFields.splice(position, 1); // 删掉原本的
            newAdjustFields.push('roundQuotationEndDate');
          }
          newItemValue.roundQuotationEndDate =
            timeControllerData[`roundQuotationEnd${quotationRound}`];

          let currentRoundNowFields = timeControllerData[`nowAdjustedField${quotationRound}`];
          currentRoundNowFields = currentRoundNowFields
            ? currentRoundNowFields.replace(MatchStringEndNumReg, '$1')
            : null;

          return {
            ...newItemValue,
            adjustFields: newAdjustFields,
            nowAdjustedField: currentRoundNowFields,
          };
        });
      }
    }

    // 报价时间调整  rfxRoundHeaderDateAdjustDTOList
    const rfxRequireQuotationAdjustDTO = {
      ...header.rfxRequireQuotationAdjustDTO,
      ...timeControllerData,
      rfxRoundHeaderDateAdjustDTOList: newRfxRoundHeaderDateAdjustDTOList,
    };

    // 资格预审
    const rfxRequirePrequalHeaderAdjustDTO = {
      ...header.rfxRequirePrequalHeaderAdjustDTO,
      ...preQualificationData,
    };
    // 供应商
    const rfxLineSupplierAdjustInfoDTO = {
      rfxLineSupplierAdjustList: supplierData,
    };

    // 基础信息
    const baseInfoDTO = {
      // ...header.rfxHeaderBaseInfoAdjustDTO,
      ...baseInfoData,
    };

    // 采购组织及人员
    const memberAndPurAdjustInfoDTO = {
      ...header.memberAndPurAdjustInfoDTO,
      ...organizationAndStaffData,
    };

    // 专家
    const AllExpertTable = this.RfxDemandRef?.AllExpertTableDS.toData();
    const NoneExpertTableDS = this.RfxDemandRef?.NoneExpertTableDS.toData();
    let evaluateExpertList = [...AllExpertTable, ...NoneExpertTableDS];
    evaluateExpertList = evaluateExpertList.map((item = {}) => {
      if (isEmpty(item)) {
        return;
      }

      return {
        ...item,
        tenantId,
        adjustRecordId,
        sourceHeaderAdjustId,
        sourceFrom: 'RFX',
        sourceHeaderId,
        expertStatus: 'SUBMITTED',
      };
    });

    // 评分要素
    const BusinessScoringElement = this.RfxDemandRef?.BusinessScoringElementDS.toJSONData();
    const TechnologyScoringElement = this.RfxDemandRef?.TechnologyScoringElementDS.toJSONData();
    const AllScoringElement = this.RfxDemandRef?.AllScoringElementDS.toJSONData();
    const preEvaluateIndicList = [
      ...BusinessScoringElement,
      ...TechnologyScoringElement,
      ...AllScoringElement,
    ];
    let evaluateIndicList = remote
      ? remote.process('SSRC_QUOTATION_CONTROLLER_UPDATE_PROCESS_SAVE_DATA', preEvaluateIndicList, {
          bidFlag: this.bidFlag,
          header: rfxHeaderBaseInfoAdjustDTO,
          PriceScoringElement: this.RfxDemandRef?.PriceScoringElementDS.toJSONData(),
        })
      : preEvaluateIndicList;
    evaluateIndicList = evaluateIndicList.map((evaluateIndic = {}) => {
      if (isEmpty(evaluateIndic)) {
        return;
      }

      const { evaluateIndicDetail = null } = evaluateIndic;

      return {
        ...evaluateIndic,
        evaluateIndicDetail: !evaluateIndicDetail
          ? null
          : { ...evaluateIndicDetail, adjustRecordId, sourceHeaderAdjustId },
        sourceFrom: 'RFX',
        tenantId,
        sourceHeaderId,
        sourceHeaderAdjustId,
        adjustRecordId,
        sourceTemplateId,
      };
    });

    let initialReviewIndicList = this.RfxDemandRef?.InitialReviewDS.toJSONData();

    initialReviewIndicList = initialReviewIndicList.map((evaluateIndic = {}) => {
      if (isEmpty(evaluateIndic)) {
        return;
      }

      return {
        ...evaluateIndic,
        sourceFrom: 'RFX',
        tenantId,
        sourceHeaderId,
        sourceHeaderAdjustId,
        adjustRecordId,
        sourceTemplateId,
      };
    });

    const AttachmentFormDStoData = this.AttachmentFormRef?.AttachmentFormDStoData?.();

    const rfxAttachmentAdjustDTO = {
      ...header.rfxAttachmentAdjustDTO,
      ...AttachmentFormDStoData,
    };

    const integrateData = {
      adjustRecordId: rfxId,
      tenantId,
      rfxHeaderId: rfxHeaderBaseInfoAdjustDTO.rfxHeaderId,
      sourceFrom: 'RFX',
      rfxHeaderBaseInfoAdjustDTO: baseInfoDTO,
      memberAndPurAdjustInfoDTO, // 采购组织及人员数据
      rfxLineItemAdjustList,
      rfxRequireQuotationAdjustDTO: isEmpty(rfxRequireQuotationAdjustDTO)
        ? null
        : rfxRequireQuotationAdjustDTO,
      rfxRequirePrequalHeaderAdjustDTO: isEmpty(rfxRequirePrequalHeaderAdjustDTO)
        ? null
        : rfxRequirePrequalHeaderAdjustDTO,
      rfxLineSupplierAdjustInfoDTO: isEmpty(rfxLineSupplierAdjustInfoDTO.rfxLineSupplierAdjustList)
        ? null
        : rfxLineSupplierAdjustInfoDTO,
      customizeUnitCode: `SSRC.${this.custKey}QUOTATION_CONTROLLER_DETAIL.SUPPLIER,SSRC.${
        this.custKey
      }QUOTATION_CONTROLLER_DETAIL.TIMEADJUST,SSRC.${
        this.custKey
      }QUOTATION_CONTROLLER_DETAIL.ITEMLINE,SSRC.${
        this.custKey
      }QUOTATION_CONTROLLER_DETAIL.EXPERT_NONE,SSRC.${
        this.custKey
      }QUOTATION_CONTROLLER_DETAIL.EXPERT_DIFF,SSRC.${
        this.custKey
      }QUOTATION_CONTROLLER_DETAIL.SCORE_NONE,SSRC.${
        this.custKey
      }QUOTATION_CONTROLLER_DETAIL.SCORE_TECHNOLOFY,SSRC.${
        this.custKey
      }QUOTATION_CONTROLLER_DETAIL.EXPERT_ASSIGN,SSRC.${
        this.custKey
      }QUOTATION_CONTROLLER_DETAIL.ORGANIZATION_STAFF,SSRC.${
        this.custKey
      }QUOTATION_CONTROLLER_DETAIL.ATTACHMENT_FORM,SSRC.${
        this.custKey
      }QUOTATION_CONTROLLER_DETAIL.BASE_INFO,SSRC.${
        this.custKey
      }QUOTATION_CONTROLLER_DETAIL.PREQUALIFICATION,SSRC.${
        this.custKey
      }QUOTATION_CONTROLLER_DETAIL.EXPERT_ASSIGN_V2,${this.getControllerCustomizeCodes()},SSRC.${
        this.custKey
      }QUOTATION_CONTROLLER_DETAIL.SCORE_DETAIL_TEMPLATE_FORM`,
      evaluateAdjustDTO: {
        evaluateExpertList,
        evaluateIndicList,
        initialReviewIndicList,
      },
      rfxAttachmentAdjustDTO,
    };
    const remoteIntegrateData = remote
      ? remote.process(
          'SSRC_QUOTATION_CONTROLLER_UPDATE_PROCESS_INTEGRATE_PAGE_DATA',
          integrateData,
          { sourceHeader: header, bidFlag: this.bidFlag, that: this }
        )
      : integrateData;
    return remoteIntegrateData;
  }

  // 整合维护页面个性化编码
  getControllerCustomizeCodes() {
    return [`SSRC.${this.custKey}QUOTATION_CONTROLLER_DETAIL.BIDDING_RULE`].join(',');
  }

  // 处理新竞价时间
  @Bind()
  dealNewBiddingFieldsData(payload) {
    const { rfxHeaderBaseInfoDTO, timeControllerData = {}, biddingHallFlag } = payload || {};
    const newTimeControllerData = {};
    // 如果是新竞价，则特殊处理 发布即截止 发布即开始
    const {
      biddingFlag, // 竞价单
      secondarySourceCategory,
    } = rfxHeaderBaseInfoDTO || {};
    const newBiddingFlag = biddingHallFlag && biddingFlag && secondarySourceCategory === 'RFA';
    if (newBiddingFlag) {
      if (timeControllerData.nowAdjustedField) {
        // 将timeControllerData.nowAdjustedFieldTimeSelectFlagField字段置为0
        if (timeControllerData.nowAdjustedFieldTimeSelectFlagField) {
          newTimeControllerData[timeControllerData.nowAdjustedFieldTimeSelectFlagField] = 0;
        }
        const newFields = timeControllerData.nowAdjustedField?.split(',')?.filter(Boolean) || [];
        newTimeControllerData.adjustFields = uniq([
          ...(timeControllerData.adjustFields || []),
          ...newFields,
        ]);
      }
      newTimeControllerData.adjustFields = this.dealNewBiddingAdjustFields(
        newTimeControllerData.adjustFields || timeControllerData.adjustFields || []
      );
      return newTimeControllerData;
    }
    return {};
  }

  // 处理新竞价调整时间字段
  dealNewBiddingAdjustFields(adjustFields) {
    const newAdjustFields = [];
    if (!isEmpty(adjustFields)) {
      adjustFields.forEach((filed) => {
        // 签到
        if (['signInRunningDay', 'signInRunningHour', 'signInRunningMinute'].includes(filed)) {
          if (!newAdjustFields.includes('signInRunningDuration')) {
            newAdjustFields.push('signInRunningDuration');
          }
        } else if (
          [
            'startingBiddingRunningDay',
            'startingBiddingRunningHour',
            'startingBiddingRunningMinute',
          ].includes(filed)
        ) {
          // 试竞价
          if (!newAdjustFields.includes('startingTrialBiddingRunningDuration')) {
            newAdjustFields.push('startingTrialBiddingRunningDuration');
          }
        } else if (
          ['biddingRunnintDay', 'biddingRunnintHour', 'biddingRunnintMinute'].includes(filed)
        ) {
          // 竞价
          if (!newAdjustFields.includes('quotationRunningDuration')) {
            newAdjustFields.push('quotationRunningDuration');
          }
        } else if (
          [
            'biddingSupplementPriceRunnintDay',
            'biddingSupplementPriceRunnintHour',
            'biddingSupplementPriceRunnintMinute',
          ].includes(filed)
        ) {
          // 补充单价
          if (!newAdjustFields.includes('biddingSupplementPriceRunningDuration')) {
            newAdjustFields.push('biddingSupplementPriceRunningDuration');
          }
        } else {
          newAdjustFields.push(filed);
        }
      });
    }
    return newAdjustFields;
  }

  @Bind
  async validate() {
    const { remote, header = {} } = this.props;
    // const { isSection } = this.state;
    const supplierValidate = this.SupplierRef?.supplierListTableDS?.validate();
    const timeControllerValididate = this.timeControllerRef?.timeControlDS?.validate();
    const preQualificationData = this.preQualificationRef?.prequalificationDS?.validate();
    const BaseInfoData = this.BaseInfoRef?.FormDS?.validate();
    const attachmentValidate = await this.AttachmentFormRef?.AttachmentDS?.validate();

    // organizationAndStaff
    const organizationAndStaffValidate = this.OrganizationAndStaffFormRef?.OrganizationAndStaffFormDS?.validate();

    // score
    const scoreBusinessValidate = this.RfxDemandRef?.BusinessScoringElementDS.validate();
    const scoreTechnologyValidate = this.RfxDemandRef?.TechnologyScoringElementDS.validate();
    const scoreAllValidate = this.RfxDemandRef?.AllScoringElementDS.validate();
    // expert
    const expertAllValidate = this.RfxDemandRef?.AllExpertTableDS.validate();
    const expertNoneValidate = this.RfxDemandRef?.NoneExpertTableDS.validate();
    const data = [
      timeControllerValididate,
      preQualificationData,
      supplierValidate,
      BaseInfoData,
      organizationAndStaffValidate, // 采购组织及人员验证
      scoreBusinessValidate,
      scoreTechnologyValidate,
      scoreAllValidate,
      expertAllValidate,
      expertNoneValidate,
      attachmentValidate,
    ];

    return Promise.all(
      remote
        ? remote.process('SSRC_QUOTATION_CONTROLLER_UPDATE_PROCESS_SAVE_VALIDATE', data, {
            bidFlag: this.bidFlag,
            header: header.rfxHeaderBaseInfoAdjustDTO,
            scorePriceValidate: this.RfxDemandRef?.PriceScoringElementDS.validate(),
            that: this,
          })
        : data
    ).then((value) => {
      return value.every((item) => item || item === undefined);
    });
  }

  @Bind()
  toggleLoading = (loading = false) => {
    this.setState({ loading });
  };

  @Bind()
  toggleSectionLoading = (loading = false) => {
    this.setState({ sectionLoading: loading });
  };

  @Bind()
  async validateAttachment() {
    const attachmentValidateObj =
      this.AttachmentFormRef?.AttachmentDS?.getValidationErrors()?.[0]?.errors[0]?.errors?.filter(
        (item) => item.ruleName === 'attachmentError'
      )[0] || {};
    const baseInfoAttachmentValidateObj =
      this.BaseInfoRef?.FormDS?.getValidationErrors()?.[0]?.errors[0]?.errors?.filter(
        (item) => item.ruleName === 'attachmentError'
      )[0] || {};
    const messageInfo =
      attachmentValidateObj.$validationMessage || baseInfoAttachmentValidateObj.$validationMessage;
    if (messageInfo) {
      notification.error({ message: messageInfo });
      return false;
    }
    return true;
  }

  /**
   * 保存
   * @param {*} noNotificationFlag 不需要提示操作成功
   * @returns Promise
   */
  @throttle(500)
  @Bind()
  async handleSave(noNotificationFlag = false) {
    const { organizationId } = this.state;

    const integrateData = this.getIntegrateData();
    let allValidate = false;

    if (!noNotificationFlag) {
      allValidate = await this.validate();
    } else {
      allValidate = true;
    }
    if (!allValidate) {
      const validateAttachment = await this.validateAttachment();
      if (!validateAttachment) {
        return;
      }

      message.warning(
        intl
          .get('ssrc.inquiryHall.view.inquiryHall.inputCorrectInformation')
          .d('请正确填写信息后，再进行下一步操作')
      );
      return;
    }
    this.setState({ sectionLoading: true });
    try {
      const result = getResponse(await saveAdjust({ organizationId, ...integrateData }));
      if (result) {
        if (!noNotificationFlag) {
          notification.success();
        }
        await this.fetchControllerData();
        if (!isEmpty(this.SupplierRef)) {
          await this.SupplierRef.supplierListTableDS.query();
        }
        if (this.itemLineRef && this.itemLineRef.ItemLineTableDS) {
          await this.itemLineRef.ItemLineTableDS.query();
        }
        await this.refreshRfxDemand();
      }
      return result;
    } catch (error) {
      throw error;
    } finally {
      this.setState({
        sectionLoading: false,
      });
    }
  }

  // 删除当前寻源过程单据
  @Bind()
  handleDelete() {
    const { organizationId, header = {} } = this.state;
    const { rfxHeaderBaseInfoAdjustDTO: { adjustRecordId } = {} } = header;

    Modal.confirm({
      title: intl.get('ssrc.common.message.tip').d('提示'),
      children: intl
        .get('ssrc.quoController.view.deleteQuoController.tipMessage')
        .d('是否废弃当前寻源过程控制单据'),
      onOk: async () => {
        this.toggleLoading(true);
        discardAdjust({ organizationId, adjustRecordId })
          .then((res) => {
            if (getResponse(res)) {
              notification.success();
              this.props.history.push(`${this.activeTabKey}/list`);
            }
          })
          .finally(() => {
            this.toggleLoading(false);
          });
      },
    });
  }

  // 删除供应商行数据
  @Bind()
  async handleDeleteSupplierData(delData) {
    if (!delData || isEmpty(delData)) return;
    const { isSection, header = {} } = this.state;
    const supplierListTableDS = this.SupplierRef?.supplierListTableDS;
    const {
      rfxHeaderBaseInfoAdjustDTO: { rfxHeaderId, adjustRecordId: headerAdjustRecordId } = {},
    } = header;

    let res;
    if (isSection) {
      res = await deleteSectionSuppControllerData({
        rfxHeaderId,
        adjustRecordId: headerAdjustRecordId,
        sourceLineSupplierDTOS: delData,
      });
    } else {
      const datas = delData.map((item) => {
        const { rfxLineSupplierAdjustId, adjustRecordId } = item;
        return {
          rfxLineSupplierAdjustId,
          adjustRecordId,
        };
      });
      res = await deleteSuppControllerDatas(datas);
    }

    if (getResponse(res)) {
      // 重新刷新供应商行数据
      if (supplierListTableDS) supplierListTableDS.query();
      this.fetchQualificationWarnController();
      this.toggleLoading(false);
      return true;
    }
    return false;
  }

  /**
   * 铺平供应商资质到期提醒数据
   */
  @Bind()
  renderDataSource(dataSource) {
    const arrayItem = [];
    const attachmentsItem = dataSource.map((item) => {
      const { expirAttachmentsDtos = [], ...otherItem } = item;
      if (expirAttachmentsDtos && expirAttachmentsDtos.length) {
        const attachmentsElement = expirAttachmentsDtos.map((element, index) => {
          return {
            index: `${otherItem.supplierCompanyId}#${index}`, // 用作唯一主键
            ...otherItem,
            ...element,
            supplierCompanyId: otherItem.supplierCompanyId,
          };
        });
        return attachmentsElement;
      } else {
        return otherItem;
      }
    });
    attachmentsItem.forEach((item) => {
      if (Array.isArray(item)) {
        arrayItem.push(...item);
      } else {
        arrayItem.push(item);
      }
    });
    return arrayItem;
  }

  // 资质弹窗内容渲染
  @Bind()
  renderQualificationExpir(qualifyExpiredData) {
    const { remote } = this.props;
    const { isSection } = this.state;

    const { checkValue } = qualifyExpiredData || {};
    const { expired } = checkValue || {};
    if (!expired?.length) return false;
    // 解析数据
    let flatData = [];
    const supplierAttachments = expired.filter((item) => item.expirAttachmentsDtosLen);
    if (!isEmpty(supplierAttachments)) {
      flatData = this.renderDataSource(expired);
    }
    // 加载资质到期行数据
    this.SupplierBulkExpiredLineDS.loadData(flatData);
    const supplierExpiredProps = {
      organizationId: this.organizationId,
      remote,
      supplierBulkExpiredModalDS: this.SupplierBulkExpiredLineDS,
      tip: intl
        .get('ssrc.inquiryHall.view.qualificationWarning')
        .d('以下供应商在供应商360资质认证已到期，无法邀请，是否删除以下供应商'),
      selectionMode: 'none',
      isSection, // 是否是多标段
    };

    Modal.open({
      destroyOnClose: true,
      key: Modal.key(),
      title: intl.get('ssrc.inquiryHall.view.title.tips').d('提示'),
      children: <SupplierBatchAddExpiredModal {...supplierExpiredProps} />,
      style: { width: '800px' },
      bodyStyle: { maxHeight: 400 },
      onOk: () => this.handleDeleteSupplierData(expired),
      onCancel: () => this.toggleLoading(false),
    });
  }

  @debounce(500)
  @Bind()
  async handleSubmit() {
    const { organizationId, isSection } = this.state;
    const {
      history,
      location: { search = {} },
      closeRoleWorkBenchModal,
      remote,
    } = this.props;

    const integrateData = this.getIntegrateData();
    const allValidate = await this.validate();
    if (!allValidate) {
      const validateAttachment = this.validateAttachment();
      if (!validateAttachment) {
        return;
      }

      message.warning(
        intl
          .get('ssrc.inquiryHall.view.inquiryHall.inputCorrectInformation')
          .d('请正确填写信息后，再进行下一步操作')
      );
      return;
    }

    try {
      this.toggleLoading(true);
      const validateRes = getResponse(
        await submitAdjustValidate({ organizationId, ...integrateData })
      );
      const createCopyAgain = async () => {
        const createRes = await createBeforeDirectController({
          organizationId,
          sourceHeaderId: integrateData.rfxHeaderId,
          sourceFrom: 'RFX',
        });
        this.toggleLoading(false);
        if (createRes && !createRes.failed) {
          const url = `/ssrc/new-${this.sourceKeyLowerCase}-hall/new-rfx-detail-controller/${createRes.adjustRecordId}`;
          history.push({
            pathname: url,
            search,
          });
          this.updateSectionList(createRes);
        } else {
          message.warning(createRes.message);
        }
      };

      if (validateRes) {
        if (validateRes.createAdjustAgain) {
          Modal.confirm({
            key: Modal.key(),
            title: intl
              .get(`ssrc.inquiryHall.view.message.title.commonAdjustagain`, {
                documentTypeName: this.documentTypeName,
                sourceName: this.sourceName,
              })
              .d(`{documentTypeName}中的部分信息已变更，是否重新发起{sourceName}过程控制？`),
            onOk: () => createCopyAgain(),
          });
        } else {
          // 校验过后提交
          const doSubmit = async (payload) => {
            let result;
            if (isSection) {
              result = getResponse(
                await submitSectionAdjust({ organizationId, ...integrateData, ...(payload || {}) })
              );
            } else {
              result = getResponse(
                await submitAdjust({ organizationId, ...integrateData, ...(payload || {}) })
              );
            }
            this.toggleLoading(false);
            if (result && !Array.isArray(result)) {
              notification.success();
              if (closeRoleWorkBenchModal && isFunction(closeRoleWorkBenchModal)) {
                // 来源于角色工作台 提交后关闭侧弹框
                closeRoleWorkBenchModal();
                return;
              }
              history.push(`${this.activeTabKey}/list`);
            } else if (!Array.isArray(result)) {
              this.queryMain();
            } else {
              this.setState({
                sectionMessageVisible: true,
                operateSectionPromptProps: {
                  visible: true,
                  handleCancel: () => {
                    this.setState({
                      sectionMessageVisible: false,
                    });
                    this.queryMain();
                  },
                  handleOk: () => {
                    this.setState({
                      sectionMessageVisible: false,
                    });
                    this.queryMain();
                  },
                  dataList: result,
                },
              });
            }
          };

          // 二开埋点
          const remoteSubmit = (payload) => {
            if (remote?.event) {
              return remote.event.fireEvent('handleRemoteSubmit', {
                that: this,
                integrateData,
                doSubmit: (submitParams) => {
                  return doSubmit({ ...(payload || {}), ...(submitParams || {}) });
                }, // 解决this指向问题
                toggleButtonsLoading: (...params) => {
                  this.toggleLoading(...params);
                },
                queryMain: (...params) => {
                  this.queryMain(...params);
                },
              });
            } else {
              return doSubmit({ ...(payload || {}) });
            }
          };

          if (Object.keys(validateRes).length === 0) {
            remoteSubmit();
            return;
          }
          validateModal({
            response: validateRes,
            successCallBack: remoteSubmit,
            warningOk: () => remoteSubmit({ confirmFlag: 1 }),
            errorOk: () => this.toggleLoading(false),
            warningCancel: () => {
              this.toggleLoading(false);
              this.queryMain();
            },
            openQualificationModal: this.renderQualificationExpir,
          });
        }
      } else {
        this.toggleLoading(false);
        // this.queryMain();
      }
    } catch (error) {
      this.toggleLoading(false);
      throw error;
    }
  }

  getBackPath() {
    const {
      location,
      match: { path = null },
    } = this.props;
    const { search } = location;
    const routerParams = queryString.parse(search.substr(1));
    const { sourcePath = null } = routerParams || {};

    const isPub = path && path.includes('/pub');
    if (isPub) return null;

    if (sourcePath) {
      return sourcePath;
    }
    return `${this.activeTabKey}/list`;
  }

  @Bind()
  beforeOpenSection() {
    this.setState({
      sectionLoading: true,
    });
    return this.validate();
  }

  // 更新标段数据集
  updateSectionList = (result = {}) => {
    const { outUpdateSectionList = () => {} } = this.sectionInfo;
    outUpdateSectionList(result);
  };

  sectionInfo = {};

  @Bind()
  async afterOpenSection(sourceHeaderId, saveFlag) {
    const {
      dispatch,
      location: { pathname },
    } = this.props;
    const { routerParams, organizationId } = this.state;
    const integrateData = this.getIntegrateData();
    const search = queryString.stringify({
      ...routerParams,
    });
    // if (saveFlag) {
    try {
      const saveRes = saveFlag
        ? getResponse(await saveAdjust({ organizationId, ...integrateData }))
        : null;
      if (saveRes || !saveFlag) {
        const result = getResponse(
          await validateBeforeDirectController({
            organizationId,
            sourceHeaderId,
            sourceFrom: 'RFX',
          })
        );
        if (result) {
          const onOk = async () => {
            const createRes = await createBeforeDirectController({
              organizationId,
              sourceHeaderId,
              sourceFrom: 'RFX',
            });
            if (createRes && !createRes.failed) {
              let url = '';
              if (pathname.indexOf('new-rfx-detail-controller') > 0) {
                url = `${this.activeTabKey}/new-rfx-detail-controller/${createRes.adjustRecordId}`;
              } else {
                url = `${this.activeTabKey}/new-rfx-detail/${createRes.adjustRecordId}`;
              }
              await this.updateBiddingTimer();

              await dispatch(
                routerRedux.replace({
                  pathname: url,
                  search,
                })
              );
              await this.queryMain();
              await this.updateSectionList(createRes);
            } else {
              message.warning(createRes.message);
            }
          };
          if (result.validateResult === 'createAdjustAgain') {
            Modal.confirm({
              key: Modal.key(),
              title: intl
                .get(`ssrc.inquiryHall.view.message.title.commonAdjustagain`, {
                  documentTypeName: this.documentTypeName,
                  sourceName: this.sourceName,
                })
                .d(`{documentTypeName}中的部分信息已变更，是否重新发起{sourceName}过程控制？`),
              onOk: () => onOk(),
              onCancel: () => {
                this.queryMain();
              },
            });
          } else if (result.validateResult === 'createAdjust') {
            onOk();
          } else if (result.validateResult === 'openAdjust') {
            let url = '';
            if (pathname.indexOf('new-rfx-detail-controller') > 0) {
              url = `${this.activeTabKey}/new-rfx-detail-controller/${result.adjustRecordId}`;
            } else {
              url = `${this.activeTabKey}/new-rfx-detail/${result.adjustRecordId}`;
            }
            await this.updateBiddingTimer();

            await dispatch(
              routerRedux.replace({
                pathname: url,
                search,
              })
            );
            await this.queryMain();
          }
        }
      }
    } catch (error) {
      throw error;
    } finally {
      await this.setState({
        sectionLoading: false,
      });
    }
    // }
  }

  /**
   * 清空页面数据重新渲染
   * 多标段下，页面渲染问题，会出现串配置
   * */
  updateBiddingTimer = () => {
    const { timeControlDS, clearTimerField } = this.timeControllerRef || {};

    if (timeControlDS) {
      this.setState(
        {
          header: {},
        },
        () => {
          clearTimerField();
          timeControlDS.reset();
          timeControlDS.clear();
          timeControlDS.loadData();
        }
      );
    }
  };

  @Bind()
  saveRfxDemandRef(node) {
    this.RfxDemandRef = node;
  }

  /**
   * @override   // 【屈臣氏】二开寻源过程控制-询价要求-评分要素-评分要素细项弹框
   * 乐成教育继承二开
   */
  @Bind()
  renderRfxDemandForm(RfxDemandProps) {
    return <RfxDemandForm {...RfxDemandProps} />;
  }

  /**
   * 页面卡片属性埋点
   * 首次埋点-使用项目：华创（ps：若后续加新的卡片，需要注意下二开埋点的此属性是否需要加上）
   */
  @Bind()
  getTopSectionProps(payload = {}) {
    const { remote } = this.props;
    const { header } = this.state;
    return remote
      ? remote.process(
          'SSRC_QUOTATION_CONTROLLER_UPDATE_PROCESS_TOP_SECTION_CARD_PROPS',
          {},
          { header, bidFlag: this.bidFlag, ...(payload || {}) }
        )
      : {};
  }

  getHeaderButtons = () => {
    const { customizeBtnGroup } = this.props;
    const { header = {}, sectionLoading = false, loading = false } = this.state;

    const buttons = [
      {
        name: 'discard',
        btnType: 'c7n-pro',
        child: intl.get('ssrc.common.button.discard').d('废弃'),
        btnProps: {
          icon: 'delete',
          funcType: 'flat',
          loading: isEmpty(header) || sectionLoading || loading,
          onClick: () => this.handleDelete(),
        },
      },
      {
        name: 'save',
        btnType: 'c7n-pro',
        child: intl.get('hzero.common.button.save').d('保存'),
        btnProps: {
          icon: 'save',
          funcType: 'flat',
          loading: isEmpty(header) || sectionLoading || loading,
          onClick: () => this.handleSave(false),
        },
      },
      {
        name: 'submit',
        btnType: 'c7n-pro',
        child: intl.get('hzero.common.button.submit').d('提交'),
        btnProps: {
          color: 'primary',
          icon: 'check',
          loading: isEmpty(header) || sectionLoading || loading,
          onClick: () => this.handleSubmit(),
        },
      },
    ];

    return (
      <>
        {customizeBtnGroup(
          {
            code: `SSRC.${this.custKey}QUOTATION_CONTROLLER_DETAIL.HEADER_BUTTONS_NEW`,
            pro: true,
          },
          <DynamicButtons
            // trigger="click"
            // maxNum={7}
            buttons={buttons}
            defaultBtnType="c7n-pro"
          />
        )}
      </>
    );
  };

  render() {
    const {
      match,
      history,
      custLoading,
      customizeTable,
      customizeForm,
      match: {
        params: { rfxId = null },
      },
      remote,
      location,
      customizeBtnGroup,
    } = this.props;

    const {
      header = {},
      userId,
      organizationId,
      isSection,
      isSelectPass,
      sectionLoading = false,
      sectionMessageVisible,
      operateSectionPromptProps,
      mergeType,
      prequalGroupHeaderId,
      sourceProjectId,
      tempSourceHeaderId,
      loading = false,
      checkPermissionObject = {},
      biddingHallFlag,
      qualificationWarnInfo,
    } = this.state;

    // 竞价大厅-竞价单标识
    const { rfxHeaderBaseInfoAdjustDTO = {} } = header || {};
    const { rfxHeaderBaseInfoDTO = {} } = rfxHeaderBaseInfoAdjustDTO || {};
    const { secondarySourceCategory, biddingFlag } = rfxHeaderBaseInfoDTO || {};
    const newBiddingFlag =
      !!biddingHallFlag &&
      secondarySourceCategory === 'RFA' &&
      (biddingFlag === 1 || biddingFlag === '1');

    const CommonProps = {
      rfxId,
      history,
      userId,
      header,
      custLoading,
      organizationId,
      customizeTable,
      custKey: this.custKey,
      bidFlag: this.bidFlag,
      biddingHallFlag,
      newBiddingFlag,
    };

    // 对供应商要求
    const SupplierProps = {
      ...CommonProps,
      remote,
      rfxId,
      history,
      userId,
      header,
      isSection,
      custLoading,
      organizationId,
      customizeTable,
      checkPermissionObject,
      custKey: this.custKey,
      bidFlag: this.bidFlag,
      handleSave: this.handleSave,
      onRef: this.getSupplierRef,
      toggleLoading: this.toggleLoading,
      toggleSectionLoading: this.toggleSectionLoading,
      location,
      fetchQualificationWarnController: this.fetchQualificationWarnController,
      qualificationWarnInfo,
    };

    const RfxDemandProps = {
      ...CommonProps,
      remote,
      header,
      match,
      rfxId,
      isSelectPass,
      organizationId,
      userId,
      isSection,
      custLoading,
      customizeForm,
      custKey: this.custKey,
      bidFlag: this.bidFlag,
      quotationName: this.quotationName,
      handleSave: this.handleSave,
      getTimeController: this.getTimeControllerRef,
      getPreQualification: this.getPreQualificationRef,
      getBiddingRuleSForm: this.getBiddingRulesFormRef,
      renderOtherSection: this.renderOtherSection,
      fetchOtherSectionInfo: this.fetchOtherSectionInfo,
      customizeTable,
      onRef: this.saveRfxDemandRef,
      mergeType,
      prequalGroupHeaderId,
      sourceProjectId,
      tempSourceHeaderId,
      preQualificationRef: this.preQualificationRef,
      RfxInfoDS: this.BaseInfoRef.FormDS,
      customizeBtnGroup,
    };

    const BaseInfoProps = {
      ...CommonProps,
      rfxId,
      header,
      organizationId,
      customizeForm,
      custLoading,
      custKey: this.custKey,
      bidFlag: this.bidFlag,
      onRef: this.getBaseRef,
      documentTypeName: this.documentTypeName,
    };

    const OrganizationAndStaffProps = {
      ...CommonProps,
      rfxId,
      header,
      organizationId,
      customizeForm,
      custLoading,
      custKey: this.custKey,
      bidFlag: this.bidFlag,
      onRef: this.getOrganizationRef,
      checkPriceName: this.checkPriceName,
      sourceCategoryName: this.sourceCategoryName,
      handleSave: this.handleSave,
      isSection,
      remote,
    };

    const SectionPanelProps = {
      isSection,
      sectionLoading,
      parentPage: {
        // name: 'quotationControllerUpdate',
        queryParams: {
          adjustRecordId: rfxId,
        },
      },
      onRef: (ref) => {
        this.sectionInfo = ref;
      },
      beforeOpenSection: this.beforeOpenSection,
      afterOpenSection: this.afterOpenSection,
      toggleSectionLoading: this.toggleSectionLoading,
      switchNotification: intl
        .get('ssrc.inquiryHall.view.message.verifyTheSwitchLabel')
        .d('当前标段的调整存在必输校验不通过，切换标段此次调整内容将无法保存，请确认是否切换'),
    };

    const itemLineTableProps = {
      ...CommonProps,
      onRef: this.getItemLineRef,
    };

    const AttachmentProps = {
      onRef: this.getAttachmentFormRef,
      customizeForm,
      custKey: this.custKey,
      remote,
      queryMain: this.queryMain,
      bidFlag: this.bidFlag,
      header,
    };

    const controllerTitle = this.bidFlag
      ? intl.get('ssrc.common.title.BID').d('招投标')
      : intl.get('ssrc.common.title.RFX').d('询报价');

    const sourceHeaderTitle = `${intl
      .get('ssrc.quoController.view.message.panel.commonRFxControl', { controllerTitle })
      .d('{controllerTitle}控制')}-${header?.rfxHeaderBaseInfoAdjustDTO?.rfxNum || ''}`;

    const headerTitle = remote
      ? remote.process('SSRC_QUOTATION_CONTROLLER_UPDATE_PROCESS_HEADER_TITLE', sourceHeaderTitle, {
          bidFlag: this.bidFlag,
          header,
        })
      : sourceHeaderTitle;

    return (
      <Fragment>
        {/* <Spin spinning={isEmpty(header) || sectionLoading || loading}> */}
        <div className={Style.rfxControlParentEle}>
          <Header backPath={this.getBackPath()} title={headerTitle}>
            {this.getHeaderButtons()}
          </Header>
          <Spin spinning={isEmpty(header) || sectionLoading || loading}>
            <SectionPanel {...SectionPanelProps}>
              {/* <AnchorSsrc header={header} /> */}
              <div
                className={
                  isSection ? Style['rfx-control-section'] : Style['rfx-control-no-section']
                }
              >
                {!isEmpty(header) && (
                  <div
                    className={classnames(
                      Style.rfxControlContainer,
                      Style.rfxControlWrap,
                      Style['rfx-controller-control']
                    )}
                  >
                    <div
                      className={
                        isSection
                          ? Style['controller-content']
                          : Style['controller-content-no-section']
                      }
                    >
                      <TopSection
                        title={intl.get('ssrc.inquiryHall.view.inquiryHall.commonRfxBasicInfo', {
                          sourceCategoryName: this.omitName,
                        })}
                        className={Style['rfx-control-top-section']}
                        {...(this.getTopSectionProps({ key: 'rfxBasicInfo' }) || {})}
                      >
                        <BaseInfo {...BaseInfoProps} />
                      </TopSection>
                      <TopSection
                        title={intl
                          .get('ssrc.inquiryHall.view.inquiryHall.purOrganizationAndStaff')
                          .d('采购组织及人员')}
                        className={Style['rfx-control-top-section']}
                        {...(this.getTopSectionProps({ key: 'purOrganizationAndStaff' }) || {})}
                      >
                        <OrganizationAndStaffForm {...OrganizationAndStaffProps} />
                      </TopSection>
                      <TopSection
                        title={intl
                          .get('ssrc.inquiryHall.view.inquiryHall.commonRfxItemLines', {
                            sourceCategoryName: this.omitName,
                          })
                          .d('{sourceCategoryName}标的物')}
                        className={Style['rfx-control-top-section']}
                        {...(this.getTopSectionProps({ key: 'rfxItemLines' }) || {})}
                      >
                        <ItemLineTable {...itemLineTableProps} />
                      </TopSection>
                      {header.rfxHeaderBaseInfoAdjustDTO?.sourceMethod === 'INVITE' && (
                        <TopSection
                          code={`SSRC.${this.custKey}QUOTATION_CONTROLLER_DETAIL.HEADER_CARD`}
                          getHocInstance={this.props.getHocInstance}
                          className={Style['rfx-control-top-section']}
                          title={intl
                            .get('ssrc.inquiryHall.view.inquiryHall.supplierWithRequest')
                            .d('对供应商要求')}
                          {...(this.getTopSectionProps({ key: 'supplierWithRequest' }) || {})}
                        >
                          <SecondSection
                            code={`SSRC.${this.custKey}QUOTATION_CONTROLLER_DETAIL.BULK_ADD_SUPPLIER`}
                          >
                            <Supplier {...SupplierProps} />
                          </SecondSection>
                        </TopSection>
                      )}
                      <TopSection
                        title={
                          !newBiddingFlag
                            ? intl
                                .get('ssrc.inquiryHall.view.inquiryHall.commonRfxDeamnd', {
                                  sourceCategoryName: this.sourceCategoryName,
                                })
                                .d('{sourceCategoryName}要求')
                            : intl.get('ssrc.common.view.biddingRequest').d('竞价要求')
                        }
                        className={Style['rfx-control-top-section']}
                        {...(this.getTopSectionProps({ key: 'rfxDemand' }) || {})}
                      >
                        {this.renderRfxDemandForm(RfxDemandProps)}
                      </TopSection>
                      <TopSection
                        title={intl.get('ssrc.common.model.common.attachment').d('附件')}
                        className={Style['rfx-control-top-section']}
                        {...(this.getTopSectionProps({ key: 'attachment' }) || {})}
                      >
                        <AttachmentForm {...AttachmentProps} />
                      </TopSection>
                    </div>
                  </div>
                )}
              </div>
              {sectionMessageVisible && (
                <OperateSectionPromptModal {...operateSectionPromptProps} />
              )}
            </SectionPanel>
          </Spin>
        </div>
        {/* </Spin> */}
      </Fragment>
    );
  }
}

// 引用类型函数
const hocComponent = (Com) => {
  return WithCustomizeC7N({
    unitCode: [
      'SSRC.QUOTATION_CONTROLLER_DETAIL.SUPPLIER', // 供应商
      'SSRC.QUOTATION_CONTROLLER_DETAIL.BULK_ADD_SUPPLIER', // 对供应商要求 -> 批量添加供应商
      'SSRC.QUOTATION_CONTROLLER_DETAIL.TIMEADJUST', // 时间调整
      'SSRC.QUOTATION_CONTROLLER_DETAIL.PREQUALIFICATION', // 资格预审
      'SSRC.QUOTATION_CONTROLLER_DETAIL.BASE_INFO', //
      'SSRC.QUOTATION_CONTROLLER_DETAIL.ORGANIZATION_STAFF', // 采购组织及人员
      'SSRC.QUOTATION_CONTROLLER_DETAIL.ITEMLINE', // 标的物
      'SSRC.QUOTATION_CONTROLLER_DETAIL.EXPERT_NONE', // 专家不区分
      'SSRC.QUOTATION_CONTROLLER_DETAIL.EXPERT_DIFF', // 专家区分
      'SSRC.QUOTATION_CONTROLLER_DETAIL.SCORE_NONE', // 评分要素-商务或者不区分
      'SSRC.QUOTATION_CONTROLLER_DETAIL.SCORE_TECHNOLOFY', // 评分要素技术
      'SSRC.QUOTATION_CONTROLLER_DETAIL.EXPERT_ASSIGN', // 评分要素分配专家
      'SSRC.QUOTATION_CONTROLLER_DETAIL.EXPERT_ASSIGN_V2', // 评分要素专家分配
      'SSRC.QUOTATION_CONTROLLER_DETAIL.BULK_ADD_SUPPLIER_QUERY', // 添加供应商查询条件
      'SSRC.QUOTATION_CONTROLLER_DETAIL.ATTACHMENT_FORM', // 附件表单
      'SSRC.QUOTATION_CONTROLLER_DETAIL.HEADER_CARD', // 标题卡片
      'SSRC.QUOTATION_CONTROLLER_DETAIL.INTIALREVIEW_TABLE', // 符合性检查
      'SSRC.QUOTATION_CONTROLLER_DETAIL.SUPPLIER_BUTTONS', // 批量添加供应商表格按钮
      'SSRC.QUOTATION_CONTROLLER_DETAIL.BIDDING_RULE', // 竞价规则
      'SSRC.QUOTATION_CONTROLLER_DETAIL.SUPPLIER_ALLOT_ITEM', // 对供应商要求-分配物料
      'SSRC.QUOTATION_CONTROLLER_DETAIL.SCORE_INDICS_TECHNOLOGY_BTN', // 评分要素技术按钮组
      `SSRC.QUOTATION_CONTROLLER_DETAIL.SCORE_INDICS_BTN`, // 评分要素-商务或者不区分按钮组
      `SSRC.QUOTATION_CONTROLLER_DETAIL.EXPERT_SCORE_BUTTONS`, // 专家表格按钮组
      `SSRC.QUOTATION_CONTROLLER_DETAIL.SCORE_DETAIL_TEMPLATE_FORM`, // 要素选择模板
      'SSRC.QUOTATION_CONTROLLER_DETAIL.HEADER_BUTTONS_NEW', // HEADER BUTTONS
    ],
  })(
    formatterCollections({
      code: [
        'ssrc.quoController',
        'ssrc.inquiryHall',
        'ssrc.common',
        'scux.ssrc',
        'ssrc.biddingHall',
      ],
    })(
      remoteHoc(
        {
          code: 'SSRC_QUOTATION_CONTROLLER_UPDATE',
          name: 'remote',
        },
        {
          events: {
            handleScoreFormulaRender(props = {}) {
              const {
                evaluateIndicDetail = {},
                scoreFormula = noop,
                customizeRenderFn = noop,
              } = props;
              const params = {
                ...evaluateIndicDetail,
                customizeRenderFn,
              };
              scoreFormula(params);
            },
            handleSaveScoreWeight(props = {}) {
              const { sureScoreWeightEvent = noop } = props || {};
              sureScoreWeightEvent(props);
            },
            // 清空价格要素ds
            clearPriceScoringDS() {},
            // 价格要素处理数据
            remoteFetchScoreDetail(props = {}) {
              const { remoteFetchScoreDetail = noop, businessIndicList = [] } = props || {};
              remoteFetchScoreDetail(businessIndicList);
            },
            // 价格
            priceSetQueryParameter() {},
            priceScoreClearDS() {},
            // 要素表格保存
            createFunc(props) {
              const { createFunc = noop } = props || {};
              createFunc();
            },
            // 清空商务附件技术附件UUID
            clearAttachmentUUid(eventProps) {
              const { AttachmentDS } = eventProps || {};
              if (AttachmentDS) {
                AttachmentDS.submit();
              }
            },
            // 提交
            handleRemoteSubmit(eventProps) {
              const { doSubmit = noop } = eventProps || {};
              doSubmit();
            },
            // 多标段：采购组织人员-应用至其他标段弹窗内容默认全选
            defaultAllSelectApplyOther() {},
            // 评分细项 - 基准价计算方法变更埋点
            handleBPriceMethodOnChange() {},
            rfxDemandFormCuxInit() {},
            remoteRfxDemandFormCuxInitPage() {},
          },
        }
      )(observer(Com))
    )
  );
};

const NewDetail = hocComponent(DetailComponent);

export default NewDetail;
export { DetailComponent, hocComponent };
