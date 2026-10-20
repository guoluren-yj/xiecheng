/* eslint-disable react/no-danger */
/* eslint-disable no-unused-expressions */
/**
 * inquiryHall - 寻源服务/询价大厅(new)-维护
 * @date: 2020-09-08
 */
import React, { Component, useRef } from 'react';
import { connect } from 'dva';
import { action, runInAction } from 'mobx';
import { DataSet, Icon, Modal, ModalProvider, Spin } from 'choerodon-ui/pro';
import { Popover, Spin as ChoerondonSpin } from 'choerodon-ui';
// import { math } from 'choerodon-ui/dataset';
import { Bind, debounce, Throttle } from 'lodash-decorators';
import { isArray, isEmpty, isEqual, isNil, map, noop } from 'lodash';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import querystring from 'querystring';
import moment from 'moment';
import uuidv4 from 'uuid/v4';
import remote from 'hzero-front/lib/utils/remote';
import { Content, Header } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import notification from 'utils/notification';
import {
  getCurrentOrganizationId,
  getCurrentUserId,
  getCurrentUser,
  getResponse,
  getCurrentTenant,
  filterNullValueObject,
} from 'utils/utils';
import {
  dateFormate,
  calculateBasicQty,
  isText,
  getSupplierRelationUrl,
  fetchBiddingHallConfigResult,
  fetchSourceTemplateConfig,
} from '@/utils/utils';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import WithCustomizeC7N from 'srm-front-cuz/lib/c7nCustomize';
import { openTab, getActiveTabKey } from 'utils/menuTab';
import { queryFileListOrg, queryMapIdpValue } from 'services/api';
import { validatorConfirmModal } from '@/routes/components/ConfirmModal';
import {
  INQUIRY,
  INQUIRY_LOWERCASE,
  getSourceCategoryName,
  getOmitName,
  BID,
  getDocumentTypeName,
  getQuotationName,
  getCategoryCode,
  getCheckPriceName,
} from '@/utils/globalVariable';
import { PRIVATE_BUCKET } from '_utils/config';
import { ChunkUploadProps, FilterAttribute } from '@/utils/SsrcRegx';
import ApplicationScope from '@/routes/ssrc/components/ApplicationOrganization';
import { supplierRiskScan } from '@/routes/ssrc/InquiryHallNew/utils';
import {
  fetchInquiryGroup,
  fetchPretrialPanel,
  cancelInquiryHallUpdate,
  fetchTenderNotice,
  fetchInquiryHeaderDetail,
  fetchRfxDetailProcessAll,
  supplierRelationMapNew,
  newChangeCompany,
  fetchSourceMethodConfig,
  fetchOldControllerConfig,
} from '@/services/inquiryHallService';
import { queryEnableDoubleUnit } from '@/services/commonService';
import {
  changeCompanyUnit,
  saveInquiryHallUpdateVTwo,
  releaseInquiryHallVTwo,
  changeSourceTemplateIntegrate,
  saveInitialReviewLines,
  changeSectionNameLov,
  // fetchCreatedUnitName,
  fetchRfxCreateConfig,
  fetchApplyInquiryControl,
  validateBeforeRelease,
  companyConfigCenter,
  queryPrequalGroup,
  fetchConfigSheet,
  fetchInitTemplate,
  fetchCurrencyIsExist,
  getQualificationWarnInfo,
  deleteSupplierDatas,
  fetchExpandSourceResults,
} from '@/services/inquiryHallNewService';
import {
  fetchExpertAllocationData,
  fetchTempelateDetailData,
  saveAllScoringTemplate,
  saveScoringNoneTempelate,
  saveScoringNoneExpert,
  queryReviewElements,
  querySetting,
} from '@/services/bidHallService';
import { expertModalDS } from '@/routes/ssrc/components/AssignExperts/lineDs';
import { fetchNewQuotationConfigSheet } from '@/services/supplierQutationService';
import { idValidation } from '@/routes/components/Widget/dataVerification';

import { EditorSymbol } from './utils/dsUtils';

import RfxInfoDS from './RfxInfoDS';
import ItemLineTableDS from './ItemLineTableDS';
import ExpertTableDS from './ExpertTableDS';
import SupplierListTableDS from './SupplierListTableDS';
import PrequalScoreElementDS from './Prequal/PrequalScoreElementDS';
import { ScoringElementDS } from './ScoringElementDS';
import SourceNoticeDS from './SourceNoticeDS';
import { InitialReviewDS } from './InitialReviewDS';
import BatchCreateItemDS from './BatchCreateItemDS';
import { prequalHeaderDS } from './Prequal/PrequalHeaderDS';

import OperateButtons from './OperateButtons';
import RfxInfoForm from './RfxInfoForm';
import ItemLineTable from './ItemLineTable';
import OrganizationAndStaffForm from './OrganizationAndStaffForm';
import SupplierWithRequestForm from './SupplierWithRequestForm';
import RfxDemandForm from './RfxDemandForm';
import AnchorSsrc from './AnchorSsrc';
import SectionInfo from './SectionInfo';
import AttachmentCard from './AttachmentCard';
import SupplierBatchAddExpiredModal from './SupplierBatchAddExpiredModal';
import { calculateLatterFieldTime } from './utils/utils';
// 引用资格预审下的组件
import SectionTable from './Prequal/SectionTable';
import { sectionTableDS } from './Prequal/SectionTableDS';
import { SupplierBulkExpiredModalDS } from './BulkAddSupplierDS';

import styles from './index.less';

// eslint-disable-next-line
const urlReg = /(ht|f)tp(s?)\:\/\/[0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*(:(0-9)*)*(\/?)([a-zA-Z0-9\-\.\?\,\'\/\\\+&amp;%\$#_]*)?/;

class UpdateComponent extends Component {
  constructor(props = {}) {
    super(props);
    const {
      history: { location },
    } = this.props;
    this.organizationId = getCurrentOrganizationId();
    const routerParam = querystring.parse(location.search.substr(1));

    this.rfxInfoRef = null;
    this.demandSideFormRef = null;
    this.purchaseExecuteFormRef = null;
    this.preQualificationFormRef = null;
    this.quotationFormRef = null;
    this.roundQuotationFormRef = null;
    this.templateFormRef = null;
    this.bidFileTemplateAttachmentRef = React.createRef(); // 招标文件管理-
    /** ********* 【协鑫】二开附件列表-勿动!!! *********** */
    this.bidFileTemplateAttachmentCuxPurRef = React.createRef();
    this.bidFileTemplateAttachmentCuxSupRef = React.createRef();
    /** ********* 【万国】二开附件列表-勿动!!! *********** */
    this.attachmentRef = null;
    this.supplierRequestRef = null;
    this.supplierRequestFormRef = null;
    this.businessFormRef = null;
    this.biddingTimeRef = null;
    this.biddingRuleRef = null;
    this.rfxPrepareFormRef = null;
    this.cuxCardFormRef = null;

    // this.ItemLineTable = {};
    this.RfxDemand = {};
    this.OperateButtonRef = {};
    this.operationType = 'RFX_MAINTAIN'; // 维护页面操作标识

    this.state = {
      organizationId: getCurrentOrganizationId(),
      userId: getCurrentUserId(),
      header: {
        sourceFrom: 'MANUAL',
      }, // 头信息查询
      sourceNotice: {}, // 招标公告头信息
      validates: {
        rfxInfoValidate: false, // 采购需求验证标识
        itemLineValidate: false, // 物品
        purchaseValidate: false, // 采购组织
        toSupplierValidate: false, // 对供应商要求
        rfxDemandValidate: false, // 询价要求
        sourceNoticeValidate: false, // 寻源公告
        bTFileValidate: false, // 商务, 技术附件
      },
      inquiryHallLoading: true, // 允许操作询价单据
      applyToInquiryNewFlag: 1, // 申请转寻源允许新增物料
      prequalMergeTypes: [], // 预审变更方式
      // anchorShow: true, // 页面锚点
      // targetOffSetTop: 40,
      prequalHeaderDsMap: {}, // 资格预审_头 标段维度分组/组别分组
      prequalScoreElementDsMap: {}, // 资格预审_要素细项 标段维度分组/组别分组
      configSheet: {}, // 配置表配置
      routerParam: routerParam || {}, // 路径参数
      isLoading: false, // 按钮加载中
      isScoringLoading: false, // 评分要素loading
      isInitialLoading: false, // 商务评分loading
      allOpenSelectable: false, // 全平台公开是否可以选择
      quotationFormRefControl: true, // 控制组件重新挂载
      isSelectPass: true, // 是否启用通过制
      doubleUnitFlag: false, // 是否开启双单位flag
      batchEditRfxLineItemDTO: null, // 物料行批量编辑DTO
      batchEditRfxLineItemData: null, // 物料行批量编辑处理后的data
      batchMaintainItemDS: null, // 物料行编辑DS
      allEditFlag: -1, // 物料行批量编辑标识 全量编辑1/批量编辑0/初始化-1
      newQuotationFlag: 0, // 启用新报价标识
      serviceChargeFlag: false, // 租户启用标书下载节点标识(黑名单), false --- 不显示
      biddingHallFlag: 0, // 规则是否开启竞价大厅
      isNewTemplateConfigFlag: false, // 是否开启新模版
      qualificationWarnInfo: null, // 资质到期提示字段对象
      _timestamp: '', // 风险关系时间戳 目的重新触发风险提示组件渲染
      sourceResultsData: [], // 拓展寻源结果数据 公司与库存组织关联关系
      fileTemplateManageFlag: -1, // 是否启用招标文件管理标识 /** ********* 【协鑫】二开附件列表需求关联使用-勿随意改动!!! *********** */
    };

    this.bidFlag = this.props.sourceKey === BID;

    this.sourceCategoryName = getSourceCategoryName(this.bidFlag);

    this.documentTypeName = getDocumentTypeName(this.bidFlag);

    this.quotationName = getQuotationName(this.bidFlag);

    this.getOmitName = getOmitName(this.bidFlag);

    this.checkPriceName = getCheckPriceName(this.bidFlag);

    this.rfx = {
      sourceKey: this.props.sourceKey || INQUIRY,
      sourceKeyLowerCase: this.props.sourceKeyLowerCase || INQUIRY_LOWERCASE,
      bidFlag: this.bidFlag,
      sourceCategoryName: this.sourceCategoryName,
      documentTypeName: this.documentTypeName,
      checkPriceName: this.checkPriceName,
      quotationName: this.quotationName,
      omitName: this.getOmitName,
      categoryCode: getCategoryCode(this.bidFlag),
      japanBiddingTotalPrice: this.japanBiddingTotalPrice,
    };

    // eslint-disable-next-line no-shadow
    const { remote } = props;

    this.RfxInfoDS = new DataSet(
      remote
        ? remote.process(
            'SSRC_INQUIRYHALLNEW_UPDATE_PROCESS_RFX_DS',
            RfxInfoDS({ ...this.rfx, remote }),
            {
              rfx: this.rfx,
              that: this,
              bidFlag: this.bidFlag,
            }
          )
        : RfxInfoDS(this.rfx)
    );
    this.assignedExpertOptionDs = new DataSet(expertModalDS());
    this.ItemLineTableDS = new DataSet(
      remote
        ? remote.process(
            'SSRC_INQUIRYHALLNEW_UPDATE_PROCESS_ITEMLINE_TABLE_DS',
            ItemLineTableDS(this.RfxInfoDS, this.documentTypeName, {
              remote,
              getBatchUpdateFlag: this.getBatchUpdateFlag,
            }),
            {
              bidFlag: this.bidFlag,
              rfxInfoDS: this.RfxInfoDS,
            }
          )
        : ItemLineTableDS(this.RfxInfoDS, this.documentTypeName, {
            getBatchUpdateFlag: this.getBatchUpdateFlag,
          })
    );
    this.SupplierListTableDS = new DataSet(
      remote
        ? remote.process(
            'SSRC_INQUIRYHALLNEW_UPDATE_PROCESS_SUPPLIER_TABLE_DS',
            SupplierListTableDS({
              rfxInfoDS: this.RfxInfoDS,
            }),
            {
              bidFlag: this.bidFlag,
              fetchInquiryHeader: this.fetchInquiryHeader,
              setQueryParameterDS: this.setQueryParameterDS,
              rfxInfoDS: this.RfxInfoDS,
            }
          )
        : SupplierListTableDS({ rfxInfoDS: this.RfxInfoDS })
    );
    this.PrequalScoreElementDS = new DataSet(PrequalScoreElementDS());
    this.BusinessScoringElementDS = new DataSet(
      remote
        ? remote.process(
            'SSRC_INQUIRYHALLNEW_UPDATE_PROCESS_BUSINESS_SCORE_TABLE_DS',
            ScoringElementDS({
              team: 'BUSINESS',
              rfxInfoDs: this.RfxInfoDS,
              assignedExpertOptionDs: this.assignedExpertOptionDs,
            }),
            { bidFlag: this.bidFlag }
          )
        : ScoringElementDS({
            team: 'BUSINESS',
            assignedExpertOptionDs: this.assignedExpertOptionDs,
          })
    );
    this.TechnologyScoringElementDS = new DataSet(
      remote
        ? remote.process(
            'SSRC_INQUIRYHALLNEW_UPDATE_PROCESS_TECHNOLOGY_SCORE_TABLE_DS',
            ScoringElementDS({
              team: 'TECHNOLOGY',
              assignedExpertOptionDs: this.assignedExpertOptionDs,
            }),
            { bidFlag: this.bidFlag }
          )
        : ScoringElementDS({
            team: 'TECHNOLOGY',
            assignedExpertOptionDs: this.assignedExpertOptionDs,
          })
    );
    /** ********* 协鑫二开新增价格要素-勿动!!! *********** */
    this.PriceScoringElementDS = new DataSet(
      remote
        ? remote.process(
            'SSRC_INQUIRYHALLNEW_UPDATE_PROCESS_PRICE_SCORE_TABLE_DS',
            ScoringElementDS({
              team: 'BUSINESS',
              assignedExpertOptionDs: this.assignedExpertOptionDs,
            }),
            { bidFlag: this.bidFlag }
          )
        : ScoringElementDS({
            team: 'BUSINESS',
            assignedExpertOptionDs: this.assignedExpertOptionDs,
          })
    );
    this.AllScoringElementDS = new DataSet(
      ScoringElementDS({
        team: 'BUSINESS_TECHNOLOGY',
        assignedExpertOptionDs: this.assignedExpertOptionDs,
      })
    );
    this.NoneExpertTableDS = new DataSet(
      remote
        ? remote.process(
            'SSRC_INQUIRYHALLNEW_UPDATE_PROCESS_NONE_EXPERT_TABLE_DS',
            ExpertTableDS(),
            { bidFlag: this.bidFlag }
          )
        : ExpertTableDS()
    );
    this.AllExpertTableDS = new DataSet(ExpertTableDS());
    this.SourceNoticeDS = new DataSet(SourceNoticeDS({ rfxInfoDS: this.RfxInfoDS }));
    this.InitialReviewDS = new DataSet(InitialReviewDS()); // 初步评审
    this.BatchCreateItemDS = new DataSet(BatchCreateItemDS({ rfxInfoDS: this.RfxInfoDS })); // 批量创建
    this.SupplierBulkExpiredLineDS = new DataSet(SupplierBulkExpiredModalDS()); // 供应商资质到期行Ds

    // ds绑定关联关系
    this.ItemLineTableDS.setState('RfxInfoDS', this.RfxInfoDS);
    this.mergeTypeEditorFlag = true; // 资格预审的合并方式在每次切换模板后必须禁用， 必须经过保存查询才能编辑
  }

  // 依据id判断页面是否刷新
  isPageRefresh(prevProps) {
    const {
      match: { params: prevParams },
    } = prevProps;
    const {
      match: { params = {} },
    } = this.props || {};
    const prevId = prevParams.rfxId || null;
    const id = params.rfxId || null;
    return prevId !== id;
  }

  getSnapshotBeforeUpdate(prevProps = {}) {
    return this.isPageRefresh(prevProps);
  }

  componentDidUpdate(prevProps, _, isSnap) {
    const equal = this.isPageRefresh(prevProps);
    if (equal && isSnap) {
      this.initialRfx();
    }
  }

  componentDidMount() {
    this.sourceControllerUpdateOldOrNewConfig();
    this.newQuotationConfigSheet();
    this.queryDoubleUnit();
    this.fetchReadOnly();
    this.initialRfx();
    this.addDsEventListener();
  }

  // 增加ds监听事件
  @Bind()
  addDsEventListener() {
    this.RfxInfoDS.addEventListener('update', this.handleRfxDsUpdateListener);
  }

  // 头ds监听事件
  @Bind()
  handleRfxDsUpdateListener(data = {}) {
    const { remote: remoteBox } = this.props;
    if (!remoteBox.event) {
      return;
    }
    remoteBox.event.fireEvent('remoteRfxDsUpdateEvents', {
      itemLineTableDS: this.ItemLineTableDS,
      bidFlag: this.bidFlag,
      that: this,
      data,
    });
  }

  // 获取资质到期提醒信息
  @Bind()
  async fetchQualificationWarnInfo() {
    const {
      match: { params = {} },
    } = this.props;
    const { rfxId = null } = params;
    if (!rfxId || rfxId === 'null') return undefined;
    const res = await getQualificationWarnInfo(rfxId);
    if (getResponse(res)) {
      this.setState({ qualificationWarnInfo: res });
    }
  }

  // 查询当前单据 配置表 是否使用新报价
  async newQuotationConfigSheet() {
    const {
      organizationId,
      match: { params },
    } = this.props;

    let rfxHeaderId = params?.rfxId || null;

    if (!rfxHeaderId || rfxHeaderId === 'null') {
      rfxHeaderId = null;
    }

    const param = {
      organizationId,
      rfxHeaderId,
    };

    let result = null;
    try {
      result = await fetchNewQuotationConfigSheet(filterNullValueObject(param));
      result = getResponse(result);

      if (result === 1) {
        this.setState({
          newQuotationFlag: result,
        });
      }
    } catch (e) {
      throw e;
    }
  }

  /**
   * 查询使用的新/老过程控制
   */
  sourceControllerUpdateOldOrNewConfig = async () => {
    const { organizationId } = this.props;

    try {
      const res = getResponse(
        await fetchOldControllerConfig({
          organizationId,
          tenant: getCurrentTenant().tenantNum,
        })
      );
      if (!res) {
        return;
      }

      const oldFlag = !isEmpty(res);
      this.RfxInfoDS.setState('sourceControllerOldFlag', oldFlag);
    } catch (e) {
      throw e;
    }
  };

  async initialRfx() {
    this.initAllDS();
    await this.fetchCurrencyIsExist();
    this.fetchInquiryHallUpdate();
    this.queryBatchCode();
    this.fetchConfig();
    this.fetchSourceMethodConfig();
    this.fetchPassConfig();
    this.fetchServiceCharge();
    this.fetchBiddingHallConfig();
    this.fetchExpandSourceResultsData();
    this.queryBidFileTemplateConfig();
    this.queryCuxRemoteData();
  }

  // 查询配置表--是否启用通过制
  fetchPassConfig = async () => {
    const { organizationId } = this.props;
    let data = null;

    try {
      data = await fetchConfigSheet({
        configCode: 'ssrc_pass_indicate_config',
        organizationId,
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

  // 查询配置表--是否启用竞价大厅
  fetchBiddingHallConfig = async () => {
    const {
      // match: { params = {} },
      organizationId,
    } = this.props;
    // const { rfxId = null } = params;
    // const rfxHeaderId = rfxId && rfxId !== 'null' ? rfxId : null;
    let biddingHallFlag = null;

    try {
      biddingHallFlag = await fetchBiddingHallConfigResult({
        organizationId,
        groupCamp: 'PURCHASER', // 阵营。供应商方：SUPPLIER 采购方：PURCHASER
        // rfxHeaderId,
        // roleOmitFlag: 1,
      });
      if (biddingHallFlag === null) {
        return;
      }

      this.setState({ biddingHallFlag });
      this.RfxInfoDS.setState('biddingHallFlag', biddingHallFlag);
    } catch (e) {
      throw e;
    }
  };

  // 查询拓展源结果数据-公司与库存组织关联数据
  fetchExpandSourceResultsData = () => {
    fetchExpandSourceResults().then((res) => {
      const result = getResponse(res);
      if (result) {
        this.setState({ sourceResultsData: result });
      }
    });
  };

  // 查询配置表--是否启用通过制
  fetchPassConfig = async () => {
    const { organizationId } = this.props;
    let data = null;

    try {
      data = await fetchConfigSheet({
        configCode: 'ssrc_pass_indicate_config',
        organizationId,
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

  // 查询配置表--是否展示标书下载节点
  fetchServiceCharge = async () => {
    const { organizationId } = this.props;
    let data = null;

    try {
      data = await fetchConfigSheet({
        organizationId,
        configCode: 'ssrc_expenses_online_payment_blacklist',
        data: {
          tenantNum: getCurrentTenant().tenantNum,
        },
      });
      data = getResponse(data);
      if (!(!isEmpty(data) && isArray(data) && data[0].id)) {
        this.setState({
          // 即接口返回空就展示标书下载节点，有值则不显示
          serviceChargeFlag: true,
        });
        // this.SupplierListTableDS.setState('serviceChargeFlag', true);
      }
    } catch (e) {
      throw e;
    }
  };

  /**
   * 查询CNY币种默认值是否被禁用
   */
  @Bind()
  async fetchCurrencyIsExist() {
    if (this.isNewRfx()) {
      const organizationId = getCurrentOrganizationId();
      const result = await fetchCurrencyIsExist({
        organizationId,
        currencyCode: 'CNY',
        enabledFlag: 1,
      });
      if (getResponse(result) && !isEmpty(result.content)) {
        this.RfxInfoDS.setState('defaultCurrencyLov', {
          currencyCode: result.content[0].currencyCode,
          currencyName: result.content[0].currencyName,
          currencyId: result.content[0].currencyId,
        });
      }
    }
  }

  // 查询双单位是否开启
  queryDoubleUnit = async () => {
    const res = await queryEnableDoubleUnit({
      businessModule: 'RFX',
    });
    if (isText(res)) {
      this.ItemLineTableDS.setState('doubleUnitFlag', !!Number(res));
      this.setState({
        doubleUnitFlag: !!Number(res),
      });
    }
  };

  // 查询配置表判断老模板是否只读
  @Bind()
  fetchReadOnly = async () => {
    const {
      // match: { params = {} },
      organizationId,
    } = this.props;
    // const { rfxId = null } = params;
    // const rfxHeaderId = rfxId && rfxId !== 'null' ? rfxId : null;

    const newTemplateConfig = await fetchSourceTemplateConfig({
      organizationId,
      groupCamp: 'PURCHASER', // 阵营。供应商方：SUPPLIER 采购方：PURCHASER
      // rfxHeaderId,
      // roleOmitFlag: 1,
    });
    if (newTemplateConfig) {
      this.setState({
        isNewTemplateConfigFlag: newTemplateConfig,
      });
    }
  };

  /**
   * 查询寻源方式配置表
   */
  async fetchSourceMethodConfig() {
    const res = getResponse(
      await fetchSourceMethodConfig({ tenant: getCurrentTenant().tenantNum })
    );
    if (res) {
      this.setState({
        allOpenSelectable: !isEmpty(res),
      });
    }
  }

  // 查询招标文件模板是否启用
  async queryBidFileTemplateConfig() {
    let data = null;

    try {
      data = await fetchConfigSheet({
        configCode: 'ssrc_file_template_cnf',
        organizationId: getCurrentOrganizationId(),
        data: {
          tenantNum: getCurrentTenant().tenantNum,
        },
      });
      data = getResponse(data);
      if (!isEmpty(data)) {
        // 黑名单
        this.setState({
          fileTemplateManageFlag: 0,
        });
      } else {
        this.setState({
          fileTemplateManageFlag: 1,
        });
      }
    } catch (e) {
      throw e;
    }
  }

  /**
   * 模板数据初始化
   * @protected 此方法被 [永祥] 二开, 禁止修改方法名, 谨慎修改逻辑
   */
  @Bind()
  getInitTemplate() {
    if (this.bidFlag) {
      return;
    }

    const {
      match: { params = {} },
    } = this.props;
    const { rfxId = null } = params;
    const rfxHeaderId = rfxId && rfxId !== 'null' ? rfxId : null;
    if (rfxHeaderId) {
      return;
    }
    const serviceParams = {
      sourceFrom: 'MANUAL',
    };
    fetchInitTemplate(serviceParams).then((res) => {
      if (getResponse(res) && !isEmpty(res)) {
        this.changeSourceTemplateLov(res);
      }
    });
  }

  // 查询二开埋点数据
  queryCuxRemoteData = () => {
    const { remote: remoteBox } = this.props;
    if (remoteBox && remoteBox.event) {
      remoteBox.event.fireEvent('remoteQueryBatchCodeEvent', {
        rfxInfoDS: this.RfxInfoDS,
        that: this,
      });
    }
  };

  /**
   * 查询值集
   */
  queryBatchCode() {
    queryMapIdpValue({
      prequalMergeTypes: 'SSRC_PREQUAL_MERGE_TYPE',
    }).then((res) => {
      if (getResponse(res)) {
        const { prequalMergeTypes = [] } = res;
        this.setState({
          prequalMergeTypes,
        });
      }
    });
  }

  // init all ds
  initAllDS() {
    const {
      sourceKey,
      match: { params = {} },
      remote: remoteBox,
    } = this.props;
    let { rfxId = null } = params;
    rfxId = rfxId && rfxId !== 'null' ? rfxId : null;
    const { organizationId = null, userId = null } = this.state;
    const common = {
      rfxHeaderId: rfxId,
      organizationId,
      tenantId: organizationId,
      userId,
    };

    const otherProps = {
      operationType: this.operationType, // 来自于rfx维护页面标识
    };

    this.RfxInfoDS.setQueryParameter('commonProps', {
      ...common,
      customizeUnitCode: `SSRC.${sourceKey}_HALL.NEW_EDIT.INFO_V2,SSRC.${sourceKey}_HALL.NEW_EDIT.ORG_DEMAND_V2,SSRC.${sourceKey}_HALL.NEW_EDIT.ORG_EXEC_V2,SSRC.${sourceKey}_HALL.NEW_EDIT.RFX_DEMAND_PREQUAL_V2,SSRC.${sourceKey}_HALL.NEW_EDIT.RFX_DEM_QUOTE_V2,SSRC.${sourceKey}_HALL.NEW_EDIT.RFXPREPARE,SSRC.${sourceKey}_HALL.NEW_EDIT.SOURCE_METHOD,SSRC.${sourceKey}_HALL.NEW_EDIT.SCORE_DETAIL_TEMPLATE_FORM,SSRC.${sourceKey}_HALL.NEW_EDIT.INITIAL_REVIEW_FORM,SSRC.${sourceKey}_HALL.NEW_EDIT.BUSINESS_REQUEST,SSRC.${sourceKey}_HALL.NEW_EDIT.BIDDING_TIME`,
    });
    this.ItemLineTableDS.setQueryParameter('commonProps', {
      ...common,
      customizeUnitCode: `SSRC.${sourceKey}_HALL.NEW_EDIT.LINE_ITEM`,
    });
    this.SupplierListTableDS.setQueryParameter('commonProps', {
      ...common,
      customizeUnitCode: `SSRC.${sourceKey}_HALL.NEW_EDIT.LINE_SUPPLIER`,
    });
    this.PrequalScoreElementDS.setQueryParameter('commonProps', {
      ...common,
      ...otherProps,
    });
    this.SourceNoticeDS.setQueryParameter('commonProps', {
      ...common,
    });
    this.BusinessScoringElementDS.setQueryParameter('commonProps', {
      ...common,
      ...otherProps,
    });
    this.TechnologyScoringElementDS.setQueryParameter('commonProps', {
      ...common,
      ...otherProps,
    });
    if (remoteBox?.event) {
      remoteBox.event.fireEvent('remoteInitDsEvent', {
        priceScoringElementDS: this.PriceScoringElementDS,
        commonProps: {
          ...common,
          ...otherProps,
        },
        bidFlag: this.bidFlag,
      });
    }
    this.AllScoringElementDS.setQueryParameter('commonProps', {
      ...common,
      ...otherProps,
    });
    this.NoneExpertTableDS.setQueryParameter('commonProps', {
      ...common,
      ...otherProps,
    });
    this.AllExpertTableDS.setQueryParameter('commonProps', {
      ...common,
      ...otherProps,
    });
    this.InitialReviewDS.setQueryParameter('commonProps', {
      ...common,
      ...otherProps,
    });
    this.BatchCreateItemDS.setQueryParameter('commonProps', {
      ...common,
      customizeUnitCode: `SSRC.${sourceKey}_HALL.NEW_EDIT.BATCH_CREATE_FORM`,
    });
  }

  @Bind()
  onSectionRef(ref) {
    this.SectionInfo = ref;
  }

  @Bind()
  onRfxDemandRef(ref) {
    this.RfxDemand = ref;
  }

  componentWillUnmount() {
    const { remote: remoteBox } = this.props;
    this.RfxInfoDS.reset();
    this.ItemLineTableDS.reset();
    this.SupplierListTableDS.reset();
    this.BusinessScoringElementDS.reset();
    this.TechnologyScoringElementDS.reset();
    this.AllScoringElementDS.reset();
    this.NoneExpertTableDS.reset();
    this.AllExpertTableDS.reset();
    this.SourceNoticeDS.reset();
    this.PrequalScoreElementDS.reset();
    this.InitialReviewDS.reset();

    if (remoteBox?.event) {
      remoteBox.event.fireEvent('remoteComponentWillUnmountEvent', {
        priceScoringElementDS: this.PriceScoringElementDS,
        bidFlag: this.bidFlag,
      });
    }

    this.removeDsEventListener();

    // clearTimeout(this.lazyFetchTimer || null);
  }

  @Bind()
  removeDsEventListener() {
    this.RfxInfoDS.removeEventListener('update', this.handleRfxDsUpdateListener);
  }

  // removeEventlistener() {
  //   const id = document.getElementsByClassName('page-content-wrap')[0];
  //   if (id) {
  //     if (window.removeEventListener) {
  //       id.removeEventListener('scroll', this.viewScorll);
  //     } else if (window.detachEvent) {
  //       id.detachEvent('onscroll', this.viewScorll);
  //     }
  //   }
  // }

  /**
   * 单位控制配置项查询
   */
  async fetchSetting() {
    try {
      let result = await querySetting({
        organizationId: this.organizationId,
        '000112': '000112', // 单位控制
      });
      result = getResponse(result);
      if (isEmpty(result)) {
        return;
      }

      const setting000112 = (result['000112'] || {}).settingValue;
      this.ItemLineTableDS.setQueryParameter('settings', {
        setting000112,
      });
    } catch (e) {
      throw e;
    }
  }

  // 老数据查询寻源节点
  fetchRfxDetailProcessAll() {
    const {
      organizationId = null,
      match: { params = {} },
    } = this.props;
    const { rfxId = null } = params || {};
    if (this.isNewRfx()) {
      return;
    }
    fetchRfxDetailProcessAll({
      organizationId,
      sourceHeaderId: rfxId,
    }).then((res) => {
      if (isEmpty(res) || !this.RfxInfoDS.current) {
        return;
      }

      this.RfxInfoDS?.current?.set('sourceNodes', res);
    });
  }

  // all ds set query Parameter
  @Bind()
  @action
  setQueryParameterDS(_header = {}) {
    const { remote: remoteBox } = this.props;
    const header =
      remoteBox?.process?.('SSRC_INQUIRYHALLNEW_UPDATE_PROCESS_GET_HEADER', _header, {
        that: this,
        RfxInfoDS: this.RfxInfoDS,
      }) || _header;
    if (isEmpty(header)) {
      return;
    }
    const {
      companyId = null,
      sourceFrom = null,
      allowChangeItemsFlag = 1,
      allowChangeSupplyFlag = 1,
    } = header || {};

    if (this.RfxInfoDS.current) {
      this.RfxInfoDS.loadData([header]);
    } else {
      this.RfxInfoDS.create(header, 0); // HACK loadData会清除个性化的默认值
    }
    this.RfxInfoDS.setQueryParameter('headers', header);
    this.ItemLineTableDS.setQueryParameter('headers', {
      ...header,
      allowChangeItemsFlag: !allowChangeItemsFlag && sourceFrom === 'PROJECT',
    });
    this.SupplierListTableDS.setQueryParameter('headers', {
      ...header,
      allowChangeSupplyFlag: !allowChangeSupplyFlag && sourceFrom === 'PROJECT',
    });
    this.NoneExpertTableDS.setQueryParameter('headers', header);
    this.AllExpertTableDS.setQueryParameter('headers', header);
    this.SourceNoticeDS.setQueryParameter('headers', header);
    this.PrequalScoreElementDS.setQueryParameter('headers', header);
    this.TechnologyScoringElementDS.setQueryParameter('headers', header);
    this.BusinessScoringElementDS.setQueryParameter('headers', header);
    this.AllScoringElementDS.setQueryParameter('headers', header);
    this.InitialReviewDS.setQueryParameter('headers', header);
    this.BatchCreateItemDS.setQueryParameter('headers', header);

    if (remoteBox?.event) {
      remoteBox.event.fireEvent('remoteSetQueryParameterDSEvent', {
        priceScoringElementDS: this.PriceScoringElementDS,
        rfxInfoDS: this.RfxInfoDS,
        header,
        bidFlag: this.bidFlag,
        that: this,
      });
    }

    this.SupplierListTableDS.setQueryParameter('company', {
      companyId,
    });
    this.ItemLineTableDS.setQueryParameter('company', {
      companyId,
    });
    this.BatchCreateItemDS.setQueryParameter('company', {
      companyId,
    });

    this.initQuotationDuration(header);
    this.initBiddingRunningDuration(header);
    this.initRoundQuotationDuration(header);
    this.initCalculateBiddingTime(header);
    this.setCurrentTimeValue();
    this.forceUpdate();
  }

  // fetch header
  @Bind()
  async fetchInquiryHeader() {
    const {
      match: { params, path },
      organizationId,
      sourceKey = 'INQUIRY',
      remote: remoteBox,
    } = this.props;
    const rfxHeaderId = params?.rfxId || null;

    if (!rfxHeaderId || rfxHeaderId === 'null') {
      return;
    }

    try {
      let result = await fetchInquiryHeaderDetail({
        organizationId,
        rfxHeaderId,
        path,
        tenantId: organizationId,
        customizeUnitCode: `SSRC.${sourceKey}_HALL.NEW_EDIT.INFO_V2,SSRC.${sourceKey}_HALL.NEW_EDIT.ORG_DEMAND_V2,SSRC.${sourceKey}_HALL.NEW_EDIT.ORG_EXEC_V2,SSRC.${sourceKey}_HALL.NEW_EDIT.RFX_DEMAND_PREQUAL_V2,SSRC.${sourceKey}_HALL.NEW_EDIT.RFX_DEM_QUOTE_V2,SSRC.${sourceKey}_HALL.NEW_EDIT.RFXPREPARE,SSRC.${sourceKey}_HALL.NEW_EDIT.SOURCE_METHOD,SSRC.${sourceKey}_HALL.NEW_EDIT.RFQ_ATTACHMENT_FORM,SSRC.${sourceKey}_HALL.NEW_EDIT.SCORE_DETAIL_TEMPLATE_FORM,SSRC.${sourceKey}_HALL.NEW_EDIT.BIDDING_RULE,SSRC.${sourceKey}_HALL.NEW_EDIT.INITIAL_REVIEW_FORM,SSRC.${sourceKey}_HALL.NEW_EDIT.BUSINESS_REQUEST,SSRC.${sourceKey}_HALL.NEW_EDIT.BIDDING_TIME`,
      });
      result = getResponse(result) || {};
      if (result) {
        if (remoteBox?.event) {
          remoteBox.event.fireEvent('remoteGetRelationship', {
            bidFlag: this.bidFlag,
            result,
            rfxHeaderId,
          });
        }
      }
      return result;
    } catch (e) {
      throw e;
    }
  }

  /**
   * 查询维护页面信息
   */
  @Bind()
  async fetchInquiryHallUpdate() {
    const {
      match: {
        params: { rfxId: rfxHeaderId = null },
      },
    } = this.props;
    let header = null;

    if (!rfxHeaderId || rfxHeaderId === 'null') {
      try {
        this.togglePageLoading(true);
        await this.newRfxInit();
        this.forceUpdate();
      } catch (e) {
        throw e;
      } finally {
        this.togglePageLoading(false);
      }
      return;
    }

    try {
      let result = await this.fetchInquiryHeader(); // 查询
      this.togglePageLoading();
      result = getResponse(result) || {};
      if (isEmpty(result)) {
        return;
      }

      const runInActionFunc = async () => {
        let prequalGroup;
        if (this.SectionInfo && this.SectionInfo.updateHeaderInfo) {
          this.SectionInfo.updateHeaderInfo(result.projectLineSections);
          this.RfxInfoDS?.current?.set('projectLineSections', result.projectLineSections);
        }

        this.mergeTypeEditorFlag = true;

        const { mergeType, preQualificationFlag, roundQuotationRule = null } = result;
        header = {
          ...result,
          // ...members,
          // ...pretrials,
        };

        this.setQueryParameterDS(header);
        const itemLine = this.ItemLineTableDS.query(); // 查询
        this.fetchQualificationWarnInfo(); // 查询资质过期信息

        const autoRoundQuotationFlag =
          roundQuotationRule === 'AUTO' ||
          roundQuotationRule === 'AUTO_CHECK' ||
          roundQuotationRule === 'AUTO_SCORE';

        if (autoRoundQuotationFlag) {
          this.addRFXField(result);
        }

        // 查询资格预审数据
        if (preQualificationFlag) {
          if (isNil(mergeType)) {
            this.setState({ header }, () => {
              this.generatePrequalHeaderMapDs({ result, isCreate: false });
            });
          } else {
            prequalGroup = this.fetchPrequalGroup(result); // 查询
          }
        } else {
          this.setState({
            header,
          });
        }
        return Promise.all([itemLine, prequalGroup]);
      };

      const mainQuery = runInAction(() => {
        return runInActionFunc();
      });

      const pageOther = this.fetchPageOther(result);

      await Promise.all([mainQuery, pageOther]);
    } catch (e) {
      this.togglePageLoading();
      throw e;
    }
  }

  // 查询配置表
  fetchConfig = async () => {
    const { organizationId } = this.props;
    const { configSheet = {} } = this.state;
    let data = null;

    if (this.isNewRfx()) {
      return;
    }

    try {
      data = await fetchConfigSheet({
        configCode: 'sprm_old_ui_config',
        organizationId,
        data: {
          tenant: getCurrentTenant().tenantNum,
        },
      });
      data = getResponse(data);
      if (!data) {
        return;
      }

      this.setState({
        configSheet: { ...configSheet, sprmOldUiConfig: !isEmpty(data) },
      });
    } catch (e) {
      throw e;
    }
  };

  /**
   * 刷新header, 因为需要改变版本号, 并且刷新组
   */
  @Bind()
  async refreshRfxHeaderAndPrequalGroup() {
    const {
      match: {
        params: { rfxId: rfxHeaderId = null },
      },
    } = this.props;
    let header = null;

    if (!rfxHeaderId || rfxHeaderId === 'null') {
      this.newRfxInit();
      this.forceUpdate();
      return;
    }

    this.togglePageLoading(true);
    try {
      let result = await this.fetchInquiryHeader();
      this.togglePageLoading();
      result = getResponse(result) || {};
      if (isEmpty(result)) {
        return;
      }

      header = {
        ...result,
        // ...members,
        // ...pretrials,
      };
      runInAction(() => {
        this.setQueryParameterDS(header);
        this.generatePrequalMemberGroups();
        this.fetchPrequalGroup(result);
        this.fetchRfxDetailProcessAll();
      });
      this.fetchInquiryGroup().then((members) => {
        // 查询
        this.updateBidMemberFields(members); // 更新核价人员 ps: 注意异步: setQueryParameterDS
      });
    } catch (e) {
      this.togglePageLoading();
      throw e;
    }
  }

  /**
   * 查询资格预审分组 - `mergeType` !== `NONE`
   */
  async fetchPrequalGroup(header = {}) {
    const { organizationId } = this.props;
    const { mergeType, rfxHeaderId, sourceProjectId, preQualificationFlag, multiSectionFlag = 0 } =
      header || {};
    if (!preQualificationFlag || !multiSectionFlag) {
      return;
    }

    const params = {
      organizationId,
      sourceProjectId,
      tempSourceHeaderId: rfxHeaderId,
    };
    const { userId = null } = this.state;
    const config = {
      userId,
      rfxHeaderId,
      organizationId,
      preQualificationFlag,
      tenantId: organizationId,
      rfxInfoDS: this.RfxInfoDS,
    };
    const common = {
      rfxHeaderId,
      organizationId,
      tenantId: organizationId,
      userId,
    };
    const prequalHeaderDsMap = {};
    const prequalScoreElementDsMap = {};
    return queryPrequalGroup(params)
      .then((res) => {
        // 查询
        const result = getResponse(res);
        if (isArray(result) && result[0]) {
          result.forEach((r) => {
            const prequalHeaderDs = new DataSet(prequalHeaderDS(config));
            prequalHeaderDs.loadData([r]);
            prequalHeaderDsMap[r.prequalGroupHeaderId] = prequalHeaderDs;

            // 如果勾选了评分细项再初始化
            if (r.enableScoreFlag) {
              const prequalScoreElementDs = new DataSet(
                PrequalScoreElementDS({
                  mergeType,
                  prequalGroupHeaderId: r.prequalGroupHeaderId,
                })
              );
              prequalScoreElementDs.setQueryParameter('commonProps', {
                ...common,
              });
              prequalScoreElementDs.setQueryParameter('headers', header);
              prequalScoreElementDs.loadData(r.prequalGroupScoreAssignList || []);
              prequalScoreElementDsMap[r.prequalGroupHeaderId] = prequalScoreElementDs;
            }
          });
        }
      })
      .finally(() => {
        this.setState(
          {
            header,
            prequalHeaderDsMap,
            prequalScoreElementDsMap,
          },
          this.generatePrequalMemberGroups
        );
      });
  }

  /**
   * 刷新资格预审组
   */
  @Bind()
  handleRefreshPrequalGroup() {
    const { header } = this.state;
    this.fetchPrequalGroup(header);

    // 更新头标段信息
    this.refreshRfxHeaderSectionInfo();
  }

  /**
   * 刷新头和标段
   */
  async refreshRfxHeaderSectionInfo() {
    const { remote: remoteBox } = this.props;
    try {
      this.togglePageLoading(true);
      const result = getResponse(await this.fetchInquiryHeader());
      if (result) {
        if (this.SectionInfo && this.SectionInfo.updateHeaderInfo) {
          this.SectionInfo.updateHeaderInfo(result.projectLineSections);
        }
        const { objectVersionNumber = null, allowSourceSupplierStages = '' } = result;
        // eslint-disable-next-line
        this.RfxInfoDS?.current?.set('objectVersionNumber', objectVersionNumber);
        // eslint-disable-next-line
        this.RfxInfoDS?.current?.set('projectLineSections', result.projectLineSections);
        // eslint-disable-next-line
        this.RfxInfoDS?.current?.set('allowSourceSupplierStages', allowSourceSupplierStages);
        if (remoteBox?.event) {
          remoteBox.event.fireEvent('remoteRfxInfoFiledEvent', {
            rfxInfoDS: this.RfxInfoDS,
            rfxHeaderInfo: result,
          });
        }

        this.setState({
          header: { ...result },
        });
      }
    } finally {
      this.togglePageLoading();
    }
  }

  async fetchPageOther(header = {}) {
    const {
      expertScoreType = null,
      sourceMethod = null,
      preQualificationFlag = 0,
      sourceFrom = null,
      sourceCategory,
      mergeType,
      industryData = null,
      organizationType,
    } = header;
    const { remote: remoteBox } = this.props;

    let pretrialPanel;
    let prequalScoreElement;
    let tenderNotice;
    let supplierList;
    let expert;
    let scoringElements;
    let reviewElements;

    if (sourceFrom === 'DEMAND_POOL') {
      this.fetchApplyInquiryControl({
        sourceCategory,
        company: null,
        prTypeName: null,
        purchaseOrganization: null,
      });
    }

    this.fetchSetting();
    // this.ItemLineTableDS.query();
    this.fetchRfxDetailProcessAll();
    this.refreshAttachmentTemplateList(header);

    const group = this.fetchInquiryGroup().then((members) => {
      // 查询
      this.updateBidMemberFields(members);
    });

    if (preQualificationFlag && isNil(mergeType)) {
      pretrialPanel = this.fetchPretrialPanel().then((pretrials) => {
        // 查询
        this.integrationPrequalMembers(pretrials);
      });

      prequalScoreElement = this.PrequalScoreElementDS.query(); // 查询
    } else if (preQualificationFlag && !isNil(mergeType)) {
      this.generatePrequalMemberGroups();
    }
    const industryVisible = remoteBox
      ? remoteBox.process(
          'SSRC_INQUIRYHALLNEW_UPDATE_PROCESS_INDUSTRYVISIBLE',
          sourceMethod && sourceMethod !== 'INVITE',
          { sourceMethod, rfxInfoDS: this.RfxInfoDS }
        )
      : sourceMethod && sourceMethod !== 'INVITE';
    // 新增埋点与上面埋点区分：仅做控制
    const isNoticeQueryFlag = remoteBox
      ? remoteBox.process(
          'SSRC_INQUIRYHALLNEW_UPDATE_PROCESS_NOTICE_QUERY_FLAG',
          sourceMethod && sourceMethod !== 'INVITE',
          { sourceMethod, rfxInfoDS: this.RfxInfoDS, sourceNoticeDS: this.SourceNoticeDS }
        )
      : sourceMethod && sourceMethod !== 'INVITE';
    if (industryVisible || isNoticeQueryFlag) {
      tenderNotice = this.fetchTenderNotice(); // 查询
    }
    if (industryVisible) {
      this.initIndustryCategorySelectData({ industryData, organizationType });
    }
    if (sourceMethod === 'INVITE') {
      supplierList = this.SupplierListTableDS.query(); // 查询
    }
    if (expertScoreType && expertScoreType === 'ONLINE') {
      expert = this.fetchExpert(); // 查询
      scoringElements = this.fetchScoring(); // 查询
      reviewElements = this.fetchQueryReviewElements(); // 查询
    }
    return Promise.all([
      group,
      pretrialPanel,
      prequalScoreElement,
      tenderNotice,
      supplierList,
      expert,
      scoringElements,
      reviewElements,
    ]);
  }

  async fetchRfxConfig() {
    const { organizationId } = this.props;

    try {
      let config = await fetchRfxCreateConfig({
        organizationId,
        settingCodes: ['000112'],
      });
      config = getResponse(config);
      if (!config) {
        return {};
      }
      return config;
    } catch (e) {
      throw e;
    }
  }

  // 新建单据初始化
  async newRfxInit() {
    const {
      remote: remoteBox,
      match: {
        params: { rfxId = null },
      },
    } = this.props;
    this.togglePageLoading(true);

    const {
      userCheck = {},
      settings = {},
      userUnit = {},
      supplierStages: allowSourceSupplierStages = null,
    } = await this.fetchRfxConfig();
    const { phone = null, realName = null, email = null, internationalTelCode } =
      getCurrentUser() || {};
    const {
      enabledFlag = 0,
      companyId = null,
      companyName = null,
      purchaseOrgId = null,
      buyOrganizationName = null,
      purchaseAgentId = null,
      purchaseAgentName = null,
      ouId = null,
      ouName = null,
      organizationName = null,
      organizationId: invOrganizationId = null,
    } = userCheck || {};
    const { unitId = null, unitName = null } = userUnit || {};

    const _header = {
      purName: realName,
      purPhone: phone,
      internationalTelCode,
      purEmail: email,
      // startFlag: 1,
      startQuotationRunningDuration: null,
      quotationRunningDuration: null,
      reviewMethod: 'QUALIFIED',
      auctionRule: 'NONE',
      openRule: 'OPEN_IDENTITY_OPEN_QUOTE',
      rankRule: 'UNIT_PRICE',
      sealedQuotationFlag: '1',
      // bidBond: 0,
      // bidFileExpense: 0,
      // currencyCode: 'CNY',
      companyId: enabledFlag ? companyId : null, // 公司id
      companyName: enabledFlag ? companyName : null, // 公司name
      purOrganizationId: enabledFlag ? purchaseOrgId : null, // 采购组织id
      purOrganizationName: enabledFlag ? buyOrganizationName : null, // 采购组织id
      purchaserId: enabledFlag ? purchaseAgentId : null, // 采购员id
      purchaserName: enabledFlag ? purchaseAgentName : null, // 采购员
      ouId: enabledFlag ? ouId : null, // 业务实体id
      ouName: enabledFlag ? ouName : null, // 业务实体
      invOrganizationId: enabledFlag ? invOrganizationId : null, // 库存组织id
      invOrganizationName: enabledFlag ? organizationName : null, // 库存组织
      createdUnitId: unitId, // 创建人部门
      createdUnitName: unitName, // 创建人部门
      unitId,
      unitName,
      allowSourceSupplierStages,
    };

    const header = remoteBox
      ? await remoteBox.process('SSRC_INQUIRYHALLNEW_UPDATE_PROCESS_NEW_RFX_HEADER', _header, {
          rfxHeaderId: rfxId,
          bidFlag: this.bidFlag,
        })
      : _header;

    // 寻源公告
    const SourceNotice = {
      noticeDays: undefined,
    };

    this.ItemLineTableDS.setQueryParameter('settings', {
      setting000112: settings['000112'],
    });

    // this.createNowRFX.createData = header;
    // this.createNowRFX.hasCreated = 0;
    // this.setQueryParameterDS(header);
    // this.SourceNoticeDS.loadData([SourceNotice]);
    this.createNowSourceNotice.createData = SourceNotice;
    this.createNowSourceNotice.hasCreated = 0;
    this.SourceNoticeDS.create(SourceNotice, 0);
    this.getInitTemplate();

    const remoteNewRfxInitEvent = async (allProps = {}) => {
      const { headerData, initHeader = noop } = allProps || {};
      await initHeader(headerData);
    };

    const remoteProps = {
      headerData: header,
      remoteNewRfxInitEvent,
      initHeader: async (headerDto) => {
        this.createNowRFX.createData = headerDto;
        this.createNowRFX.hasCreated = 0;
        await this.setQueryParameterDS(headerDto);
      },
    };

    if (remoteBox?.event) {
      await remoteBox.event.fireEvent('remoteNewRfxInit', remoteProps);
    } else {
      await remoteNewRfxInitEvent(remoteProps);
    }
  }

  // 新建单据处理个性化默认值
  createNowRFX = {};

  // 新建公告单据处理个性化默认值
  createNowSourceNotice = {};

  // after ds created, set now is false
  // toggleCreateNowRFX = (nowFlag = false, header = {}) => {
  //   this.createNowRFX = {
  //     createNow: nowFlag,
  //     createData: header,
  //   };
  // };

  // 查询预审小组
  @Bind()
  async fetchPretrialPanel() {
    const {
      organizationId,
      match: {
        params: { rfxId = null },
      },
    } = this.props;
    if (this.isNewRfx()) {
      return;
    }

    return fetchPretrialPanel({
      // 查询
      sourceHeaderId: rfxId,
      organizationId,
      sourceFrom: 'RFX',
    }).then((res) => {
      const result = getResponse(res);
      if (result) return result;
      return [];
    });
  }

  // 整合预审小组数据 - 预审 `ALL`
  @action
  integrationPrequalMembers(data = [], ds = this.state.prequalHeaderDsMap?.NONE) {
    const newData = {};
    if (isEmpty(data)) {
      return newData;
    }

    const preGroupMemberLov = data.filter((item) => !item.leaderFlag);
    let preGroupLeaderLov = data.filter((item) => item.leaderFlag);
    preGroupLeaderLov = !isEmpty(preGroupLeaderLov) ? preGroupLeaderLov[0] : null;

    // eslint-disable-next-line no-unused-expressions
    ds?.current?.set('preGroupMemberLov', preGroupMemberLov);
    // eslint-disable-next-line no-unused-expressions
    ds?.current?.set('preGroupLeaderLov', preGroupLeaderLov);

    // newData = {
    //   preGroupMemberLov,
    //   preGroupLeaderLov: !isEmpty(preGroupLeaderLov) ? preGroupLeaderLov[0] : null,
    // };
    // return newData;
  }

  // 生成预审小组数据 - 预审 ``
  @action
  generatePrequalMemberGroups() {
    const { prequalHeaderDsMap } = this.state;
    Object.values(prequalHeaderDsMap).forEach((ds) => {
      const prequalGroupMemberList = ds?.current?.get('prequalGroupMemberList');
      this.integrationPrequalMembers(prequalGroupMemberList, ds);
    });
  }

  // 寻源小组
  @Bind()
  async fetchInquiryGroup() {
    const {
      organizationId,
      match: {
        params: { rfxId = null },
      },
    } = this.props;

    if (this.isNewRfx()) {
      return;
    }

    return fetchInquiryGroup({
      rfxHeaderId: rfxId,
      organizationId,
    }).then((res) => {
      const result = getResponse(res);
      if (result) {
        if (isEmpty(result)) return [];
        return result;
      }
      return null;
    });
  }

  // 更新招标小组
  getBidMemberList(data = []) {
    const openBidLov = [];
    let prequalCheckerLov = {};
    let inquierLov = {};
    let checkPriceLov = {};
    const observeLov = [];

    if (!Array.isArray(data) || isEmpty(data)) {
      return {};
    }

    data.forEach((item) => {
      const { rfxRole = null, realName = null } = item;
      if (rfxRole === 'OPENED_BY' && realName) {
        openBidLov.push(item);
      }
      if (rfxRole === 'PRETRIAL_BY' && realName) {
        prequalCheckerLov = Object.assign({}, item);
      }
      if (rfxRole === 'RFX_BY' && realName) {
        inquierLov = Object.assign({}, item);
      }
      if (rfxRole === 'CHECKED_BY' && realName) {
        checkPriceLov = Object.assign({}, item);
      }
      if (rfxRole === 'OBSERVE_BY' && realName) {
        observeLov.push(item);
      }
    });

    return {
      openBidLov,
      prequalCheckerLov,
      inquierLov,
      checkPriceLov,
      observeLov,
    };
  }

  // 更新招标小组字段
  @action
  updateBidMemberFields(result = [], updatePasswordFlag = true) {
    const {
      openBidLov = [],
      prequalCheckerLov = {},
      inquierLov = {},
      checkPriceLov = {},
      observeLov = [],
    } = this.getBidMemberList(result) || {};
    const { current } = this.RfxInfoDS || {};
    if (!current || !current?.set) {
      return;
    }

    if (!isEmpty(openBidLov)) current?.set('openBidLov', openBidLov);
    if (!isEmpty(prequalCheckerLov)) current?.set('prequalCheckerLov', prequalCheckerLov);
    if (!isEmpty(inquierLov)) current?.set('inquierLov', inquierLov);
    if (!isEmpty(checkPriceLov)) current?.set('checkPriceLov', checkPriceLov);
    if (!isEmpty(observeLov)) current?.set('observeLov', observeLov);

    if (updatePasswordFlag && !isEmpty(openBidLov)) {
      const { passwordFlag } = openBidLov[0];
      current?.set('passwordFlag', passwordFlag);
    }
  }

  /**
   * 招标公告
   * */
  async fetchTenderNotice() {
    const {
      match: { params = {} },
      organizationId,
      sourceKey = 'INQUIRY',
    } = this.props;
    const { rfxId = null } = params;

    if (this.isNewRfx()) {
      return;
    }

    return fetchTenderNotice({
      organizationId,
      sourceFrom: 'RFX',
      sourceType: 'BR',
      sourceHeaderId: rfxId,
      customizeUnitCode: `SSRC.${sourceKey}_HALL.NEW_EDIT.NOTICE`,
    }).then((res) => {
      const result = getResponse(res) || {};
      if (result) {
        this.SourceNoticeDS.loadData([result]);
      }
    });
  }

  // 申请转寻源管控
  async fetchApplyInquiryControl(queryParams = {}) {
    const { organizationId } = this.props;

    try {
      let data = await fetchApplyInquiryControl({
        organizationId,
        ...queryParams,
      });
      data = getResponse(data);
      if (isEmpty(data)) {
        return;
      }

      const { allowNewItemsFlag = 1, fields = [] } = data;

      if (!allowNewItemsFlag) {
        this.updateItemLineFieldsProps(fields);
      }

      this.setState({
        applyToInquiryNewFlag: allowNewItemsFlag,
      });
    } catch (e) {
      throw e;
    }
  }

  // 根据申请转寻源管控改变物料行字段属性
  updateItemLineFieldsProps(fields = []) {
    if (isEmpty(fields)) {
      return;
    }

    fields.forEach((field) => {
      let currentName = field;
      const CurrentField = this.ItemLineTableDS?.getField(field);

      if (!CurrentField) {
        return;
      }

      const {
        pristineProps: { bind = null },
      } = CurrentField;

      if (bind) {
        const bindName = bind;
        const dotIndex = bindName.indexOf('.');
        currentName = dotIndex > 0 ? bindName.slice(0, dotIndex) : '';
      }

      if (!currentName) {
        return;
      }

      this.ItemLineTableDS.getField(currentName).set('disabled', true);

      const dynamicProps = this.ItemLineTableDS.getField(currentName).get('dynamicProps');
      this.ItemLineTableDS.getField(currentName).set('dynamicProps', {
        ...(dynamicProps || {}),
        required: () => {
          return false;
        },
        disabled: () => {
          return true;
        },
      });
    });
  }

  /**
   * 获取专家数据
   */
  @Bind()
  async fetchExpert() {
    const {
      match: { params },
      organizationId,
      sourceKey = 'INQUIRY',
    } = this.props;
    const { rfxId = null } = params;
    const { current = null } = this.RfxInfoDS || {};

    if (this.isNewRfx() || !current) {
      return;
    }

    const bidRuleType = current?.get('bidRuleType');
    return fetchExpertAllocationData({
      organizationId,
      sourceHeaderId: rfxId,
      sourceFrom: 'RFX',
      expertStatus: 'SUBMITTED',
      customizeUnitCode: `SSRC.${sourceKey}_HALL.NEW_EDIT.HEADER.EXPERT_SCORE`,
    }).then((res) => {
      const result = getResponse(res);
      if (result) {
        const data = result?.evaluateExpertList || [];
        if (bidRuleType === 'NONE') {
          this.AllExpertTableDS.loadData(data);
        } else {
          this.NoneExpertTableDS.loadData(data);
        }
      }
    });
  }

  /**
   * 获取评分要素数据
   * queryFrom 查询来源 queryAfterTwoElementSave(二级要素保存后查询)
   * 其他查询来源 保持loadData数据 原有逻辑
   * 如有其他缓存需求 提需处理
   */
  @Bind()
  async fetchScoring(param) {
    const { queryFrom = '', elementRecord = {} } = param || {};
    const {
      match: { params = {} },
      organizationId,
      sourceKey = 'INQUIRY',
      remote: remoteBox,
    } = this.props;
    const { rfxId = null } = params || {};

    if (this.isNewRfx()) {
      return;
    }

    return fetchTempelateDetailData({
      organizationId,
      sourceHeaderId: rfxId,
      sourceFrom: 'RFX',
      indicStatus: 'SUBMITTED', // 查询提交后的评分要素数据
      indicateLevel: 'ONE', // 查询一级评分要素
      customizeUnitCode: `SSRC.${sourceKey}_HALL.NEW_EDIT.HEADER.SCORE_INDICS,SSRC.${sourceKey}_HALL.NEW_EDIT.HEADER.SCORE_INDICS_TECHNOLOGY,SSRC.${sourceKey}_HALL.NEW_EDIT.SCORE.EXPERT_ASSIGN_V2`,
    }).then((res) => {
      const result = getResponse(res);
      if (result) {
        const { otherIndicList = [], businessIndicList = [], technologyIndicList = [] } =
          result || {};

        const loadBusinessData = (props) => {
          const { dataSource = [] } = props || {};
          // 二级评分要素细项保存后 要素查询 针对变更和新建的要素增加缓存处理
          if (queryFrom === 'queryAfterTwoElementSave') {
            this.cacheAndLoadScoreElement({
              ds: this.BusinessScoringElementDS,
              data: dataSource,
              elementRecord,
            });
            return;
          }
          this.BusinessScoringElementDS.loadData(dataSource);
        };

        const eventProps = {
          bidFlag: this.bidFlag,
          rfxInfoDS: this.RfxInfoDS,
          dataSource: businessIndicList,
          priceScoringElementDS: this.PriceScoringElementDS,
          businessScoringElementDS: this.BusinessScoringElementDS,
          loadBusinessData,
        };
        if (remoteBox?.event) {
          remoteBox.event.fireEvent('remoteLoadDataBusinessData', eventProps);
        } else {
          loadBusinessData(eventProps);
        }
        // 评分要素细项保存后 要素查询 针对变更和新建的要素增加缓存处理
        if (queryFrom === 'queryAfterTwoElementSave') {
          this.cacheAndLoadScoreElement({
            ds: this.TechnologyScoringElementDS,
            data: technologyIndicList,
            elementRecord,
          });
          this.cacheAndLoadScoreElement({
            ds: this.AllScoringElementDS,
            data: otherIndicList,
            elementRecord,
          });
          return;
        }
        this.TechnologyScoringElementDS.loadData(technologyIndicList);
        this.AllScoringElementDS.loadData(otherIndicList);
      }
    });
  }

  /*
   * 前端开发要素表格行缓存 (避免保存评分要素细项弹框后 变更的和新建的要素数据丢失) 缓存从两方面
   * 1. ds.loadData() 增加cache 缓存变更数据
   * 2. 找出新建create数据(踢出当前二级要素保存的新建一级要素) 在ds.loadData() 后 将create数据再次create
   * createLineKey 新建要素行唯一id 用来处理一级二级要素全是新建行 在处理新建行缓存时 踢出当前行
   * evaluateIndicId 要素行id
   */
  @Bind()
  cacheAndLoadScoreElement(params) {
    const { ds, data = [], elementRecord = {} } = params || {};
    const { createLineKey = '', evaluateIndicId = '' } = elementRecord || {};
    const _data = ds.toData() || [];
    if (_data.length > 0) {
      const currentSavedRecords = []; // 当前已保存行记录
      const otherRecords = []; // 其他行记录
      ds.forEach((r) => {
        if (r.get('evaluateIndicId') === evaluateIndicId) {
          currentSavedRecords.push(r);
        } else {
          otherRecords.push(r);
        }
      });
      // 移出数据 避免create重复数据 (remove 其他记录 保留cache 强制remove 当前记录 采用load后台数据)
      ds.remove(otherRecords);
      ds.remove(currentSavedRecords, true);
      ds.loadData(data, null, true);
      // 还原新创建的数据
      const createData =
        _data.filter((i) => !i.evaluateIndicId && i.createLineKey !== createLineKey) || [];
      if (createData.length > 0) createData.reverse()?.forEach((i) => ds.create(i, 0));
    } else {
      ds.loadData(data, null, true);
    }
  }

  // 查询初步评审评分要素列表 - 符合性检查
  @Bind()
  async fetchQueryReviewElements() {
    const {
      organizationId,
      match: { params },
      sourceKey = 'INQUIRY',
    } = this.props;
    if (this.isNewRfx()) {
      return;
    }
    return queryReviewElements({
      organizationId,
      sourceHeaderId: params?.rfxId,
      sourceFrom: 'RFX',
      indicStatus: 'SUBMITTED', // 查询提交后的评分要素数据
      indicateLevel: 'ONE', // 查询一级评分要素
      customizeUnitCode: `SSRC.${sourceKey}_HALL.NEW_EDIT.INITIAL_REVIEW_TABLE`,
    }).then((res) => {
      const data = getResponse(res);
      if (data) {
        let { initialReviewIndicList = [] } = data;
        initialReviewIndicList = initialReviewIndicList.map((item) => {
          const targetItem = item;
          targetItem.assignedExpertList = null;
          targetItem.assignedExperts = null;
          return targetItem;
        });
        this.InitialReviewDS.loadData(initialReviewIndicList);
      }
    });
  }

  // 查询主营品类数据
  initIndustryCategorySelectData = ({ industryData = '', organizationType = null }) => {
    const { initAndFetchInductryCategory = () => {}, fetchIndustyType = () => {} } =
      this.supplierRequestRef || {};
    if (organizationType) {
      fetchIndustyType({
        domesticFlag: this.isDomesTic(organizationType),
      });
    }

    if (industryData) {
      const industryDataParsed = JSON.parse(industryData);
      initAndFetchInductryCategory(industryDataParsed);
    }
  };

  // 判断是境内/境外标识
  isDomesTic = (organizationType = null) => {
    return organizationType && organizationType === 'DOMESTIC' ? 1 : 0;
  };

  // 设置时间
  setDayHourMinuteTime = (payload = {}) => {
    const { record, runningDurationTime, dayField, hourField, minuteField } = payload || {};
    if ((!runningDurationTime && runningDurationTime !== 0) || runningDurationTime < 0) {
      record.set({
        [dayField]: null,
        [hourField]: null,
        [minuteField]: null,
      });
      return;
    }
    const day = Math.floor(runningDurationTime / 1440);
    const hour =
      day > 0
        ? Math.floor((runningDurationTime - day * 1440) / 60)
        : runningDurationTime
        ? Math.floor(runningDurationTime / 60)
        : runningDurationTime;
    const minute =
      hour > 0 || day > 0 ? runningDurationTime - day * 1440 - hour * 60 : runningDurationTime;
    record.set(dayField, day || null);
    record.set(hourField, hour || null);
    record.set(minuteField, minute || null);
  };

  // 竞价大厅时间初始化
  initBiddingHallRunningDurationTime(header = {}) {
    const {
      sourceCategory,
      biddingFlag,
      biddingOnlineSignInFlag, // 签到
      biddingTrialBiddingFlag, // 试竞价
      signInRunningDuration,
      startingTrialBiddingRunningDuration,
      biddingSupplementPriceRunningDuration,
      biddingIntervalDuration,
    } = header || {};
    const currentRecord = this.RfxInfoDS?.current;
    const newBiddingFlag = sourceCategory === 'RFA' && (biddingFlag === 1 || biddingFlag === '1');
    if (!currentRecord || !newBiddingFlag) return;
    if (biddingOnlineSignInFlag && signInRunningDuration) {
      // 签到时间处理
      this.setDayHourMinuteTime({
        record: currentRecord,
        runningDurationTime: signInRunningDuration,
        dayField: 'signInRunningDay',
        hourField: 'signInRunningHour',
        minuteField: 'signInRunningMinute',
      });
    }
    if (biddingTrialBiddingFlag && startingTrialBiddingRunningDuration) {
      // 试竞价时间处理
      this.setDayHourMinuteTime({
        record: currentRecord,
        runningDurationTime: startingTrialBiddingRunningDuration,
        dayField: 'startingBiddingRunningDay',
        hourField: 'startingBiddingRunningHour',
        minuteField: 'startingBiddingRunningMinute',
      });
    }
    if (biddingSupplementPriceRunningDuration) {
      // 补充单价时间处理
      this.setDayHourMinuteTime({
        record: currentRecord,
        runningDurationTime: biddingSupplementPriceRunningDuration,
        dayField: 'biddingSupplementPriceRunnintDay',
        hourField: 'biddingSupplementPriceRunnintHour',
        minuteField: 'biddingSupplementPriceRunnintMinute',
      });
    }

    this.setDayHourMinuteTime({
      record: currentRecord,
      runningDurationTime: biddingIntervalDuration,
      dayField: 'biddingIntervalDurationDay',
      hourField: 'biddingIntervalDurationHour',
      minuteField: 'biddingIntervalDurationMinute',
    });
  }

  getBiddingMode = () => {
    const { current } = this.RfxInfoDS;

    const { biddingMode } = current ? current.get(['biddingMode']) : {};

    return biddingMode;
  };

  getBiddingTarget = () => {
    const { current } = this.RfxInfoDS;

    const { biddingTarget } = current ? current.get(['biddingTarget']) : {};

    return biddingTarget;
  };

  // 日式
  japanBiddingTotalPrice = () => {
    const biddingMode = this.getBiddingMode();
    const biddingTarget = this.getBiddingTarget();
    const flag =
      biddingMode === 'JAPANESE_BIDDING' &&
      this.isNewBiddingFlag() &&
      biddingTarget === 'TOTAL_PRICE';

    return flag;
  };

  // 荷兰式
  dutchBiddingTotalPrice = () => {
    const biddingMode = this.getBiddingMode();
    const biddingTarget = this.getBiddingTarget();
    const flag =
      biddingMode === 'DUTCH_BIDDING' && this.isNewBiddingFlag() && biddingTarget === 'TOTAL_PRICE';

    return flag;
  };

  // JAPANESE_BIDDING or DUTCH_BIDDING 日式/荷兰
  japOrDutchBiddingTotalPrice = () => {
    const flag = this.dutchBiddingTotalPrice() || this.japanBiddingTotalPrice();
    return flag;
  };

  // BRITISH_BIDDING
  britishBidding = () => {
    const biddingMode = this.getBiddingMode();

    const flag = biddingMode === 'BRITISH_BIDDING' && this.isNewBiddingFlag();
    return flag;
  };

  // 报价运行时间init
  initQuotationDuration(header = {}) {
    const { startQuotationRunningDuration = null } = header || {};

    if (
      (!startQuotationRunningDuration && startQuotationRunningDuration !== 0) ||
      startQuotationRunningDuration < 0
    ) {
      return;
    }

    const quoteDay = Math.floor(startQuotationRunningDuration / 1440);
    const quoteHour =
      quoteDay > 0
        ? Math.floor((startQuotationRunningDuration - quoteDay * 1440) / 60)
        : startQuotationRunningDuration
        ? Math.floor(startQuotationRunningDuration / 60)
        : startQuotationRunningDuration;
    const quoteMinute =
      quoteHour > 0 || quoteDay > 0
        ? startQuotationRunningDuration - quoteDay * 1440 - quoteHour * 60
        : startQuotationRunningDuration;

    this.RfxInfoDS?.current?.set('quotationDay', quoteDay || null);
    this.RfxInfoDS?.current?.set('quotationHour', quoteHour || null);
    this.RfxInfoDS?.current?.set('quotationMinute', quoteMinute || null);
    // this.forceUpdate();
  }

  // 竞价运行时间init
  @action
  initBiddingRunningDuration(header = {}) {
    const { quotationRunningDuration = null } = header || {};

    if (
      (!quotationRunningDuration && quotationRunningDuration !== 0) ||
      quotationRunningDuration < 0
    ) {
      return;
    }

    const quoteDay = Math.floor(quotationRunningDuration / 1440);
    const quoteHour =
      quoteDay > 0
        ? Math.floor((quotationRunningDuration - quoteDay * 1440) / 60)
        : quotationRunningDuration
        ? Math.floor(quotationRunningDuration / 60)
        : quotationRunningDuration;
    const quoteMinute =
      quoteHour > 0 || quoteDay > 0
        ? quotationRunningDuration - quoteDay * 1440 - quoteHour * 60
        : quotationRunningDuration;
    const { current } = this.RfxInfoDS;
    current?.set('biddingRunnintDay', quoteDay || null);
    current?.set('biddingRunnintHour', quoteHour || null);
    current?.set('biddingRunnintMinute', quoteMinute || null);
    // this.forceUpdate();
  }

  // 改变报价运行时间
  @Bind()
  @action
  changeQuotationDuration(value = null, type = 'minute') {
    let data = null;
    const { current } = this.RfxInfoDS;
    const days = current?.get('quotationDay') || null;
    const hours = current?.get('quotationHour') || null;
    const minutes = current?.get('quotationMinute') || null;

    if (!days && !hours && !minutes) {
      current?.set('quotationDay', null);
      current?.set('quotationHour', null);
      current?.set('quotationMinute', null);
      current?.set('startQuotationRunningDuration', data);
      return;
    }

    if (type === 'day') {
      data = value * 1440 + hours * 60 + minutes;
    } else if (type === 'hour') {
      data = days * 1440 + value * 60 + minutes;
    } else {
      data = days * 1440 + hours * 60 + value;
    }

    current?.set('startQuotationRunningDuration', data);
  }

  /**
   * 改变竞价运行时间
   * @param {*} value
   * @param {*} type
   * @protected 跟谁学二开
   */
  @Bind()
  @action
  changeBiddingRunningTime(value = null, type = 'minute') {
    let data = null;
    const { current } = this.RfxInfoDS;
    const days = current?.get('biddingRunnintDay') || null;
    const hours = current?.get('biddingRunnintHour') || null;
    const minutes = current?.get('biddingRunnintMinute') || null;

    if (!days && !hours && !minutes) {
      current?.set('biddingRunnintDay', null);
      current?.set('biddingRunnintHour', null);
      current?.set('biddingRunnintMinute', null);
      current?.set('quotationRunningDuration', data);
      return;
    }

    if (type === 'day') {
      data = value * 1440 + hours * 60 + minutes;
    } else if (type === 'hour') {
      data = days * 1440 + value * 60 + minutes;
    } else {
      data = days * 1440 + hours * 60 + value;
    }

    current?.set('quotationRunningDuration', data);
  }

  // 行业类型 主营品类
  getIndustryAndCategoryData = (headerData = {}) => {
    const { remote: remoteBox } = this.props;
    const { industryData = null, industryCategoryData = null, sourceMethod = null } = headerData;
    const otherFlag = remoteBox
      ? remoteBox.process('SSRC_INQUIRYHALLNEW_UPDATE_PROCESS_DISPLAYFORMFLAG', false, {
          sourceMethod,
          rfxInfoDS: this.RfxInfoDS,
        })
      : false;
    if (sourceMethod === 'INVITE' && !otherFlag) {
      return;
    }

    const { industry = [], industryCategory = [] } = this.supplierRequestRef.state || {};

    const compareAndIntegrateData = (allData = null, currentData = null, idName = '') => {
      let list = [];

      if (!isEmpty(allData) && !isEmpty(currentData)) {
        allData.forEach((item) => {
          const { children = null } = item;
          if (isEmpty(children)) {
            return;
          }
          children.forEach((record) => {
            const { [idName]: dataId = null } = record || {};
            const dataIndex = currentData.findIndex((id) => dataId && id === dataId);
            if (dataIndex >= 0) {
              list.push(record);
            }
          });
        });
      }
      list = JSON.stringify(list);
      return list;
    };

    return {
      industryData: compareAndIntegrateData(industry, industryData, 'industryId'),
      industryCategoryData: compareAndIntegrateData(
        industryCategory,
        industryCategoryData,
        'categoryId'
      ),
    };
  };

  // 查询商务技术附件
  async fetchBusinessTechnologyFile(businessId, technologyId) {
    let businessFiles = null;
    let technolofyFiles = null;

    if (businessId) {
      businessFiles = await queryFileListOrg({
        bucketName: PRIVATE_BUCKET,
        bucketDirectory: 'ssrc-rfx-rfxheader',
        attachmentUUID: businessId,
      });
    }

    if (technologyId) {
      technolofyFiles = await queryFileListOrg({
        bucketName: PRIVATE_BUCKET,
        bucketDirectory: 'ssrc-rfx-rfxheader',
        attachmentUUID: technologyId,
      });
    }

    return {
      technolofyFiles,
      businessFiles,
    };
  }

  // 寻源小组数据整合
  rfxMemberListData(rfxInfo = {}, commonParams = {}) {
    let rfxMemberList = [];
    if (isEmpty(rfxInfo)) {
      return rfxMemberList;
    }

    const {
      openBidLov = [],
      prequalCheckerLov = [],
      inquierLov = [],
      checkPriceLov = [],
      passwordFlag = 0,
      observeLov = [],
    } = rfxInfo || {};

    const getLovData = (data = [], type = null) => {
      if (isEmpty(data) || !type) {
        return [];
      }

      const newData = data.map((item = {}) => {
        return {
          ...item,
          ...commonParams,
          userId: item.userId || item.id,
          passwordFlag,
          rfxRole: item.rfxRole || type,
        };
      });
      return newData;
    };

    const getSingleLovData = (item = [], type = null) => {
      if (isEmpty(item) || !type) {
        return {};
      }

      return {
        ...item,
        ...commonParams,
        userId: item.userId || item.id,
        passwordFlag,
        rfxRole: item.rfxRole || type,
      };
    };

    rfxMemberList = [
      ...getLovData(openBidLov, 'OPENED_BY'),
      getSingleLovData(prequalCheckerLov, 'PRETRIAL_BY'),
      getSingleLovData(inquierLov, 'RFX_BY'),
      getSingleLovData(checkPriceLov, 'CHECKED_BY'),
      ...getLovData(observeLov, 'OBSERVE_BY'),
    ].filter((item) => !isEmpty(item));

    return rfxMemberList;
  }

  // 整合维护页面个性化编码-以后新加的可以放到这里
  getRfxUpdateCustomizeCodes = () => {
    const { sourceKey = 'INQUIRY' } = this.props;
    const { fileTemplateManageFlag } = this.state;
    const commonUnitCodes = [
      fileTemplateManageFlag === 1
        ? `SSRC.${sourceKey}_HALL.NEW_EDIT.ATTACHMENT_REQUIREMENT_TABLE`
        : null, // 文件管理-表格行
      `SSRC.${sourceKey}_HALL.NEW_EDIT.INITIAL_REVIEW_FORM`,
      `SSRC.${sourceKey}_HALL.NEW_EDIT.INITIAL_REVIEW_TABLE`,
    ].filter(Boolean);
    if (!isEmpty(commonUnitCodes)) {
      return `,${commonUnitCodes.join(',')}`;
    }
    return '';
  };

  // 页面数据整合
  /** ********* 【万国】二开调用-勿删!!! *********** */
  @Bind()
  integrationPageData(options = {}) {
    const {
      match: { params = {} },
      sourceKey = 'INQUIRY',
      remote: remoteBox,
    } = this.props;

    const { organizationId, header = {}, prequalHeaderDsMap, fileTemplateManageFlag } = this.state;
    let { rfxId = null } = params;
    rfxId = rfxId && rfxId !== 'null' ? rfxId : null;
    const { finishingRate = 0 } = options || {};
    const commonParams = {
      sourceHeaderId: rfxId,
      rfxHeaderId: rfxId,
      sourceFrom: 'RFX',
      tenantId: organizationId,
    };

    const RfxInfo = this.RfxInfoDS.current?.toData() || {};

    const {
      mergeType,
      preQualificationFlag = 0,
      prequalEndDate,
      reviewMethod,
      manufacturerType,
      qualifiedLimit,
      fileFreeFlag,
      prequalFileExpense,
      prequalUserId,
      prequalLocation,
      enableScoreFlag,
      prequalAttachmentUuid,
      prequalRemark,
      prequalHeaderId,
      prequalObjectVersionNumber,
      sourceMethod = null,
      templateId: sourceTemplateId = null,
      businessWeight = null,
      technologyWeight = null,
      sealedQuotationFlag,
      quotationRunningDurationFlag,
      startQuotationRunningDuration = null,
    } = RfxInfo || {};
    const { industryData = null, industryCategoryData = null } =
      this.getIndustryAndCategoryData(RfxInfo) || {};

    let ItemLineTables = this.ItemLineTableDS.toData();
    const SupplierListTable = sourceMethod === 'INVITE' ? this.SupplierListTableDS.toData() : [];
    const prequalScoreElement =
      enableScoreFlag && preQualificationFlag ? this.PrequalScoreElementDS.toData() : [];

    ItemLineTables = ItemLineTables.map((item) => {
      return {
        ...item,
        ...commonParams,
      };
    });

    const displayFormFlag = remoteBox
      ? remoteBox.process('SSRC_INQUIRYHALLNEW_UPDATE_PROCESS_DISPLAYFORMFLAG', false, {
          rfxInfoDS: this.RfxInfoDS,
        })
      : false;

    // 寻源公告
    const SourceNotice =
      (sourceMethod !== 'INVITE' || displayFormFlag) && this.SourceNoticeDS.current
        ? this.SourceNoticeDS.current.toData()
        : {};

    const prequalHeader =
      preQualificationFlag && isNil(mergeType)
        ? {
            tenantId: organizationId,
            prequalEndDate,
            reviewMethod,
            manufacturerType,
            qualifiedLimit,
            fileFreeFlag,
            prequalFileExpense,
            prequalUserId,
            prequalLocation,
            enableScoreFlag,
            prequalAttachmentUuid,
            prequalRemark,
            prequalHeaderId,
            prequalCategory: 'RFX',
            objectVersionNumber: prequalObjectVersionNumber,
            ...prequalHeaderDsMap?.NONE?.toData()[0],
          }
        : null;

    // attachment
    let { businessAttachmentUuid = null, techAttachmentUuid = null } = header;
    // if (this.attachmentRef) {
    //   const { businessAttachmentUuid: businessUuid, techAttachmentUuid: techUuid } =
    //     this.attachmentRef.state || {};
    //   if (businessUuid) {
    //     businessAttachmentUuid = businessUuid;
    //   }
    //   if (techUuid) {
    //     techAttachmentUuid = techUuid;
    //   }
    // }
    if (!businessAttachmentUuid) {
      // eslint-disable-next-line prefer-destructuring
      businessAttachmentUuid = RfxInfo.businessAttachmentUuid;
    }
    if (!techAttachmentUuid) {
      // eslint-disable-next-line prefer-destructuring
      techAttachmentUuid = RfxInfo.techAttachmentUuid;
    }

    // 专家
    const AllExpertTable = this.AllExpertTableDS.toData();
    const NoneExpertTableDS = this.NoneExpertTableDS.toData();
    const evaluateExperts = {
      evaluateExpertList: [...AllExpertTable, ...NoneExpertTableDS],
      sourceTemplateId,
    };

    // 评分要素
    const BusinessScoringElement = this.BusinessScoringElementDS.toJSONData();
    const TechnologyScoringElement = this.TechnologyScoringElementDS.toJSONData();
    const AllScoringElement = this.AllScoringElementDS.toJSONData();
    const scoringData = [
      ...BusinessScoringElement,
      ...TechnologyScoringElement,
      ...AllScoringElement,
    ];
    const evaluateIndicScore = remoteBox
      ? remoteBox.process('SSRC_INQUIRYHALLNEW_UPDATE_PROCESS_EVALUATE_INDICS_DATA', scoringData, {
          bidFlag: this.bidFlag,
          rfxInfoDS: this.RfxInfoDS,
          priceScoringElementDS: this.PriceScoringElementDS,
        })
      : scoringData;

    const evaluateIndics = evaluateIndicScore.map((evaluateIndic) => {
      return {
        ...evaluateIndic,
        sourceTemplateId,
      };
    });

    // 附件-招标文件模板
    const _attachmentLineList =
      fileTemplateManageFlag === 1
        ? this.bidFileTemplateAttachmentRef?.current?.fileTemplateAttachmentDs?.toJSONData()
        : null;
    const attachmentLineList = remoteBox?.process(
      'SSRC_INQUIRYHALLNEW_UPDATE_PROCESS_ATTACHMENTLINE_LIST_DATA',
      _attachmentLineList,
      { that: this, fileTemplateManageFlag }
    );
    // 取表格上权重更新头数据
    let headerBusinessWeight = null;
    let headerTechnologyWeight = null;
    headerBusinessWeight = !isEmpty(BusinessScoringElement)
      ? (BusinessScoringElement[0] || {}).businessWeight
      : businessWeight;
    headerTechnologyWeight = !isEmpty(TechnologyScoringElement)
      ? (TechnologyScoringElement[0] || {}).technologyWeight
      : technologyWeight;

    // 初步评审
    const initialReviewIndicList = this.InitialReviewDS.toJSONData();

    // 寻源小组
    const rfxMemberList = this.rfxMemberListData(RfxInfo, commonParams);

    // 预审小组
    let preGroupMemberLov = prequalHeaderDsMap?.NONE?.current?.get('preGroupMemberLov') || [];
    if (!isEmpty(preGroupMemberLov)) {
      preGroupMemberLov = preGroupMemberLov.map((item) => {
        const { id = null, userId = null } = item || {};
        return {
          ...item,
          ...commonParams,
          userId: userId || id,
          leaderFlag: 0,
        };
      });
    }

    let preGroupLeaderLov = prequalHeaderDsMap?.NONE?.current?.get('preGroupLeaderLov') || {};
    if (!isEmpty(preGroupLeaderLov)) {
      preGroupLeaderLov = {
        ...preGroupLeaderLov,
        ...commonParams,
        userId: preGroupLeaderLov.userId || preGroupLeaderLov.id,
        leaderFlag: 1,
      };
    }

    const prequalMemberList = [preGroupLeaderLov, ...preGroupMemberLov].filter(
      (item) => !isEmpty(item) && item.userId
    );

    const { currentQuotationRounds = [] } = this.RfxDemand.state;
    const roundHeaderDates = [];

    currentQuotationRounds.forEach((item) => {
      const roundQuotationRunningDuration = RfxInfo[`roundQuotationRunningDuration${item}`] || null;
      const quotationTime = RfxInfo[`quotationTime${item}`];
      const roundQuotationStartDate =
        (quotationTime &&
          quotationTime[`quotationStartTime${item}`] &&
          dateFormate(quotationTime[`quotationStartTime${item}`], DEFAULT_DATETIME_FORMAT)) ||
        null;
      const roundQuotationEndDate =
        (quotationTime &&
          quotationTime[`quotationEndTime${item}`] &&
          dateFormate(quotationTime[`quotationEndTime${item}`], DEFAULT_DATETIME_FORMAT)) ||
        null;
      const roundHeaderDateId = RfxInfo[`roundHeaderDateId${item}`] || null;
      const objectVersionNumber = RfxInfo[`objectVersionNumber${item}`] || null;
      const currentRoundData = {
        roundHeaderDateId,
        quotationRound: item,
        roundQuotationRunningDuration,
        roundQuotationStartDate,
        roundQuotationEndDate,
        objectVersionNumber,
      };
      roundHeaderDates.push(currentRoundData);
    });

    const projectLineSections = this.SectionInfo
      ? this.SectionInfo.sectionInfoDS.toJSONData()
      : null;

    // 批量编辑数据
    const { batchEditRfxLineItemData, allEditFlag } = this.getBatchUpdateFlag() || {};
    const _rfxHeader = {
      ...commonParams,
      sourceFrom: 'MANUAL', // 手工新建
      ...RfxInfo,
      techAttachmentUuid,
      businessAttachmentUuid,
      rfxHeaderId: rfxId,
      // sourceFrom: 'MANUAL',
      finishingRate,
      startQuotationRunningDuration:
        quotationRunningDurationFlag === 1 ? null : startQuotationRunningDuration, // 处理特殊场景：个性化设置quotationDay默认值时无法清空startQuotationRunningDuration。报价运行方式寻选择报价截止时间，必须置null
      newFlag: 1, // 标识-新/老维护界面
      businessWeight: headerBusinessWeight,
      technologyWeight: headerTechnologyWeight,
      sealedQuotationFlag: sealedQuotationFlag === '1' ? 1 : 0,
      industryData,
      industryCategoryData,
    };

    const rfxHeader = remoteBox
      ? remoteBox.process(
          'SSRC_INQUIRYHALLNEW_UPDATE_PROCESS_INTEGRATION_HEADER_DATA',
          _rfxHeader,
          {
            data: _rfxHeader,
            bidFlag: this.bidFlag,
            attachmentRef: this.attachmentRef,
            RfxInfo,
          }
        )
      : _rfxHeader;

    const data = Object.assign(
      {},
      {
        tenantId: organizationId,
        organizationId,
        customizeUnitCode: `SSRC.${sourceKey}_HALL.NEW_EDIT.INFO_V2,SSRC.${sourceKey}_HALL.NEW_EDIT.ORG_DEMAND_V2,SSRC.${sourceKey}_HALL.NEW_EDIT.ORG_EXEC_V2,SSRC.${sourceKey}_HALL.NEW_EDIT.RFX_DEMAND_PREQUAL_V2,SSRC.${sourceKey}_HALL.NEW_EDIT.RFX_DEM_QUOTE_V2,SSRC.${sourceKey}_HALL.NEW_EDIT.LINE_ITEM,SSRC.${sourceKey}_HALL.NEW_EDIT.LINE_SUPPLIER,SSRC.${sourceKey}_HALL.NEW_EDIT.HEADER.SCORE_INDICS,SSRC.${sourceKey}_HALL.NEW_EDIT.HEADER.SCORE_INDICS_TECHNOLOGY,SSRC.${sourceKey}_HALL.NEW_EDIT.HEADER.EXPERT_SCORE,SSRC.${sourceKey}_HALL.NEW_EDIT.RFXPREPARE,SSRC.${sourceKey}_HALL.NEW_EDIT.SECTION_ITEM,SSRC.${sourceKey}_HALL.NEW_EDIT.NOTICE,SSRC.${sourceKey}_HALL.NEW_EDIT.RFQ_ATTACHMENT_FORM,SSRC.${sourceKey}_HALL.NEW_EDIT.HEADER.WEIGHT_TABLE,SSRC.${sourceKey}_HALL.NEW_EDIT.HEADER.SCORE_TABLE,SSRC.${sourceKey}_HALL.NEW_EDIT.SCORE.EXPERT_ASSIGN,SSRC.${sourceKey}_HALL.NEW_EDIT.SCORE.EXPERT_ASSIGN_V2,SSRC.${sourceKey}_HALL.NEW_EDIT.SOURCE_METHOD,SSRC.${sourceKey}_HALL.NEW_EDIT.SCORE_DETAIL_TEMPLATE_FORM,SSRC.${sourceKey}_HALL.NEW_EDIT.BIDDING_RULE${this.getRfxUpdateCustomizeCodes()},SSRC.${sourceKey}_HALL.NEW_EDIT.BUSINESS_REQUEST,SSRC.${sourceKey}_HALL.NEW_EDIT.BIDDING_TIME`,
        rfxHeader,
        prequalHeader,
        rfxLineItemList: header.multiSectionFlag ? [] : ItemLineTables,
        projectLineSections,
        rfxLineSupplierList: SupplierListTable, // 过滤出新增的且未选择供应商的数据，不传给后台
        evaluateExperts,
        evaluateIndics,
        rfxMemberList,
        prequalMemberList,
        sourceNotice: !isEmpty(SourceNotice) ? SourceNotice : null,
        prequalScoreAssigns: prequalScoreElement || [],
        roundHeaderDates,
        initialReviewIndicList,
        rfxHeaderId: rfxId,
        rfxLineItemBatchEditDTO: {
          batchEditRfxLineItemDTO: batchEditRfxLineItemData,
          allEditFlag,
        },
        attachmentLineList,
      },
      preQualificationFlag &&
        !isNil(mergeType) && {
          prequalGroupHeaderList: this.generatePrequalAllData(),
        }
    );

    return data;
  }

  /**
   * 生成资格预审数据
   */
  generatePrequalAllData() {
    // 分组/分标段
    const { organizationId, header = {} } = this.state;
    const { prequalHeaderDsMap = {}, prequalScoreElementDsMap = {} } = this.state;

    const prequalGroupHeaderList = Object.entries(prequalHeaderDsMap).map(([key, ds]) => {
      const {
        prequalEndDate,
        reviewMethod,
        qualifiedLimit,
        prequalFileExpense,
        prequalUserId,
        prequalLocation,
        prequalAttachmentUuid,
        prequalRemark,
        prequalHeaderId,
        manufacturerType,
        fileFreeFlag,
        enableScoreFlag,
        objectVersionNumber,
      } = {
        ...header,
        ...ds.current.toData(),
      }; // 从rfxHeader和prequalHeader并集取值
      return {
        prequalGroupHeaderId: key === 'NONE' ? null : key,
        prequalEndDate,
        reviewMethod,
        manufacturerType,
        qualifiedLimit,
        fileFreeFlag,
        prequalFileExpense,
        prequalUserId,
        prequalLocation,
        enableScoreFlag,
        prequalAttachmentUuid,
        prequalRemark,
        prequalHeaderId,
        prequalCategory: 'RFX',
        tenantId: organizationId,
        objectVersionNumber,
        prequalGroupMemberList: this.generatePrequalMemberData(ds),
        prequalGroupScoreAssignList: enableScoreFlag
          ? this.generatePrequalScoreAssignData(prequalScoreElementDsMap[key])
          : null,
      };
    });
    return prequalGroupHeaderList;
  }

  /**
   * 生成预审小组数据
   */
  generatePrequalMemberData(ds) {
    const {
      match: { params = {} },
    } = this.props;
    const { organizationId } = this.state;
    let { rfxId = null } = params;
    rfxId = rfxId && rfxId !== 'null' ? rfxId : null;
    // 预审小组
    const commonParams = {
      sourceHeaderId: rfxId,
      rfxHeaderId: rfxId,
      sourceFrom: 'RFX',
      tenantId: organizationId,
    };
    let preGroupMemberLov = ds?.current?.get('preGroupMemberLov') || [];
    if (!isEmpty(preGroupMemberLov)) {
      preGroupMemberLov = preGroupMemberLov.map((item) => {
        const { id = null, userId = null } = item || {};
        return {
          ...item,
          ...commonParams,
          userId: userId || id,
          leaderFlag: 0,
        };
      });
    }

    let preGroupLeaderLov = ds?.current?.get('preGroupLeaderLov') || {};
    if (!isEmpty(preGroupLeaderLov)) {
      preGroupLeaderLov = {
        ...preGroupLeaderLov,
        ...commonParams,
        userId: preGroupLeaderLov.userId || preGroupLeaderLov.id,
        leaderFlag: 1,
      };
    }

    const prequalMemberList = [preGroupLeaderLov, ...preGroupMemberLov].filter(
      (item) => !isEmpty(item) && item.userId
    );
    return prequalMemberList;
  }

  /**
   * 生成评分细项数据
   */
  generatePrequalScoreAssignData(ds) {
    const {
      organizationId,
      match: { params = {} },
    } = this.props;
    let { rfxId = null } = params;
    rfxId = rfxId && rfxId !== 'null' ? rfxId : null;
    const prequalScoreElements = ds?.toData().map((r) => ({
      ...r,
      scoreIndicId: r.indicateId,
      tenantId: organizationId,
      sourceFrom: 'RFX',
      sourceHeaderId: rfxId,
    }));
    return prequalScoreElements;
  }

  // 校验form fields
  async validateFormRefFields(formRef = {}) {
    let result = true;
    const { fields = [] } = formRef || {};
    if (isEmpty(formRef) || isEmpty(fields)) {
      return result;
    }

    for (const field of fields) {
      // eslint-disable-next-line no-await-in-loop
      const res = await field.validate();
      if (!res) {
        console.log(res, field);
        result = false;
      }
    }

    return result;
  }

  // 开启表格校验行数
  @action
  setTableDSValidated(header = {}) {
    const { remote: remoteBox } = this.props;
    const {
      sourceMethod = null,
      preQualificationFlag = 0,
      expertScoreType = null,
      bidRuleType = null,
      // scoreIndicFlag = 0, // 模板允许寻源单维护时无专家&评分要素
      noneExpertFlag = 0, // 模板允许寻源单维护时无专家
      noneIndicateFlag = 0, // 模板允许寻源单维护时无评分要素
      multiSectionFlag = 0,
      initialReview,
      mergeType = null,
    } = header;
    const { prequalHeaderDsMap, prequalScoreElementDsMap = {} } = this.state;
    const { permissionListMap = {} } = this.RfxDemand?.state || {};

    if (!multiSectionFlag) {
      this.ItemLineTableDS.setState(EditorSymbol, true);
    }
    if (sourceMethod === 'INVITE') {
      this.SupplierListTableDS.setState(EditorSymbol, true);
    }
    if (expertScoreType && expertScoreType !== 'NONE') {
      if (permissionListMap['expert.view'] && !noneExpertFlag) {
        if (bidRuleType && bidRuleType === 'NONE') {
          this.AllExpertTableDS.setState(EditorSymbol, true);
        }
        if (bidRuleType && bidRuleType !== 'NONE') {
          this.NoneExpertTableDS.setState(EditorSymbol, true);
        }
      }
      if (permissionListMap['score.elements'] && !noneIndicateFlag) {
        if (bidRuleType && bidRuleType === 'NONE') {
          this.AllScoringElementDS.setState(EditorSymbol, true);
        }
        if (bidRuleType && bidRuleType !== 'NONE') {
          this.BusinessScoringElementDS.setState(EditorSymbol, true);
          this.TechnologyScoringElementDS.setState(EditorSymbol, true);
          if (remoteBox?.event) {
            remoteBox.event.fireEvent('remoteSetTableDSValidatedEvent', {
              priceScoringElementDS: this.PriceScoringElementDS,
              rfxInfoDS: this.RfxInfoDS,
              bidFlag: this.bidFlag,
              EditorSymbol,
            });
          }
        }
      }
      if (initialReview === 'NEED') {
        this.InitialReviewDS.setState(EditorSymbol, true);
      }
    }
    if (preQualificationFlag) {
      let currentEnableScoreFlag = 0;
      if (isNil(mergeType)) {
        currentEnableScoreFlag = (prequalHeaderDsMap?.NONE?.toData()[0] || {}).enableScoreFlag;
        if (currentEnableScoreFlag) {
          this.PrequalScoreElementDS.setState(EditorSymbol, true);
        }
      } else {
        currentEnableScoreFlag = Object.values(prequalHeaderDsMap)[0]?.current?.toData()
          ?.enableScoreFlag;
        if (currentEnableScoreFlag && !isEmpty(prequalScoreElementDsMap)) {
          Object.values(prequalScoreElementDsMap)[0].setState(EditorSymbol, true);
        }
      }
    }
  }

  // 保存页面数据校验
  /** ********* 【万国】二开调用-勿删!!! *********** */
  @Bind()
  async validatePage(options = {}) {
    const { remote: remoteBox } = this.props;
    const { header, prequalScoreElementDsMap, fileTemplateManageFlag } = this.state;
    const { validateTableLineFlag = 0 } = options;
    this.setCurrentTimeValue();
    const RfxInfo = this.RfxInfoDS?.current?.toData() || {};
    const {
      sourceMethod = null,
      enableScoreFlag = 0,
      preQualificationFlag = 0,
      expertScoreType = null,
      bidRuleType = null,
      // scoreIndicFlag = 0, // 模板允许寻源单维护时无专家&评分要素
      noneExpertFlag = 0, // 模板允许寻源单维护时无专家
      noneIndicateFlag = 0, // 模板允许寻源单维护时无评分要素
      mergeType = null,
      roundQuotationRule = null,
    } = RfxInfo;
    const autoRoundQuotationFlag =
      roundQuotationRule === 'AUTO' ||
      roundQuotationRule === 'AUTO_CHECK' ||
      roundQuotationRule === 'AUTO_SCORE';
    // const validateMessageSet = new Set();

    if (this.SourceNoticeDS.current) {
      this.SourceNoticeDS?.current?.set('status', 'update');
    }
    this.ItemLineTableDS.forEach((itemLine = {}) => {
      itemLine.set('status', 'update');
    });
    if (this.RfxInfoDS.current) {
      this.RfxInfoDS?.current?.set('status', 'update');
    }

    const infoRefResult = await this.validateFormRefFields(this.rfxInfoRef);
    const demandSideRefResult = await this.validateFormRefFields(this.demandSideFormRef);
    const purchaseExecuteFormRefResult = await this.validateFormRefFields(
      this.purchaseExecuteFormRef
    );
    const preQualificationFormRefResult = await this.validateFormRefFields(
      this.preQualificationFormRef
    );
    const quotationFormRefResult = await this.validateFormRefFields(this.quotationFormRef);
    const roundQuotationFormRefResult = autoRoundQuotationFlag
      ? await this.validateFormRefFields(this.roundQuotationFormRef)
      : true;
    const attachmentCardResult =
      fileTemplateManageFlag !== -1
        ? fileTemplateManageFlag
          ? await this.bidFileTemplateAttachmentRef?.current?.fileTemplateAttachmentDs?.validate()
          : await this.validateFormRefFields(this.attachmentRef)
        : true;
    // 评分要素模板表单
    const templateFormRefResult = await this.validateFormRefFields(this.templateFormRef);

    const _attachmentResult = remoteBox
      ? remoteBox.process(
          'SSRC_INQUIRYHALLNEW_UPDATE_PROCESS_SAVE_VALIDATE_ATTACHMENT_CARD',
          attachmentCardResult,
          {
            that: this,
            bidFlag: this.bidFlag,
            attachmentRef: this.attachmentRef,
          }
        )
      : attachmentCardResult;

    const attachmentResult = await _attachmentResult;

    const supplierRequestFormRefResult = await this.validateFormRefFields(
      this.supplierRequestFormRef
    );

    // 寻源准备
    const rfxPrepareRefResult = await this.validateFormRefFields(this.rfxPrepareFormRef);
    // 竞价大厅 - 竞价时间
    const biddingTimerRefResult = await this.validateFormRefFields(this.biddingTimerRef);
    // 竞价大厅 - 竞价规则
    const biddingRuleRefResult = await this.validateFormRefFields(this.biddingRuleRef);
    // 竞价大厅 - 商务要求
    const businessFormRefResult = await this.validateFormRefFields(this.businessFormRef);

    if (validateTableLineFlag) {
      await this.setTableDSValidated(RfxInfo);
    }

    // CUX CARD VALIDATE
    let cuxCardValidateResult = true;
    cuxCardValidateResult = (await remoteBox)
      ? remoteBox.process(
          'SSRC_INQUIRYHALLNEW_UPDATE_PROCESS_VALIDATE_CUX_CARD_FORM_RESULT',
          cuxCardValidateResult,
          {
            that: this,
          }
        )
      : cuxCardValidateResult;
    cuxCardValidateResult = cuxCardValidateResult ?? true;

    // item line 后续对报错信息优化埋点
    const itemLineValidate = header.multiSectionFlag || (await this.ItemLineTableDS.validate());
    // let itemLineTableError = await this.ItemLineTableDS.getValidationErrors();
    // itemLineTableError = getErrors({
    //   data: itemLineTableError,
    //   groupFieldName: 'itemName',
    //   groupCategory: intl.get('ssrc.inquiryHall.view.inquiryHall.rfxItemLinesRFX', {
    //     omitName: this.omitName,
    //   }).d(`{omitName}标的物`),
    //   // primaryKey: 'rfxLineItemId',

    // });
    // validateMessageSet.add(itemLineTableError);

    // let SectionInfoValidate = true;
    let currentPrequalScoreDS = this.PrequalScoreElementDS;
    if (mergeType && !isEmpty(prequalScoreElementDsMap)) {
      currentPrequalScoreDS = Object.values(prequalScoreElementDsMap)[0] || {};
    }
    // if (header.multiSectionFlag) {
    //   SectionInfoValidate = await this.SectionInfo?.sectionInfoDS?.validate();
    // }
    const supplierValidate = await this.SupplierListTableDS.validate();
    const allExpertValidate = await this.AllExpertTableDS.validate();
    const noneExpertValidate = await this.NoneExpertTableDS.validate();
    const businessScoreElementValidate = await this.BusinessScoringElementDS.validate();
    const technologyScoreElementValidate = await this.TechnologyScoringElementDS.validate();
    const priceElementValidate = await this.PriceScoringElementDS.validate();
    const allScoreElementValidate = await this.AllScoringElementDS.validate();
    const sourceNoticeValidate = await this.SourceNoticeDS.validate();
    const prequalScoreElementDSValidate = await currentPrequalScoreDS.validate();
    const initialReviewDSValidate = await this.InitialReviewDS.validate();

    const uploadingResult = !sourceNoticeValidate || !attachmentResult;

    const uploadingFlag = remoteBox
      ? remoteBox.process(
          'SSRC_INQUIRYHALLNEW_UPDATE_PROCESS_VALIDATE_ATTACHMENT_UPLOADING_FLAG',
          uploadingResult,
          {
            bidFlag: this.bidFlag,
            sourceNoticeValidate,
            attachmentResult,
          }
        )
      : uploadingResult;

    if (uploadingFlag) {
      const sourceNoticeAttachmentValidateObj =
        this.SourceNoticeDS.getValidationErrors()[0]?.errors[0]?.errors?.filter(
          (item) => item.ruleName === 'attachmentError'
        )[0] || {};
      const rfxInfoAttachmentResultObj =
        this.RfxInfoDS.getValidationErrors()[0]?.errors[0]?.errors?.filter(
          (item) => item.ruleName === 'attachmentError'
        )[0] || {};
      const message =
        sourceNoticeAttachmentValidateObj.$validationMessage ||
        rfxInfoAttachmentResultObj.$validationMessage;
      if (message) {
        notification.error({ message });
        return { attachmentUploadingFlag: true };
      }
    }

    // 商务技术附件validate
    const { bUuid, tUuid } = this.getAttachmentUuid();
    const { businessFiles = [], technolofyFiles = [] } = await this.fetchBusinessTechnologyFile(
      bUuid,
      tUuid
    );
    const bTFileValidate = !isEmpty(businessFiles) && !isEmpty(technolofyFiles);

    // 校验专家,评分要素表格
    const expertAndScoreValidation = () => {
      if (!expertScoreType || expertScoreType === 'NONE') {
        return true;
      }

      // 模板允许专家/评分要素控制维护
      const bindScoreIndicFlagValidation = (
        dsValidate = true,
        currentTableDS = {},
        scoreIndicFlag
      ) => {
        const BindFieldsValidateFlag =
          (dsValidate && !!currentTableDS.length && !scoreIndicFlag) ||
          (dsValidate && scoreIndicFlag);
        return BindFieldsValidateFlag;
      };

      // 专家, 评分要素校验
      const expertValidation =
        bidRuleType === 'NONE'
          ? bindScoreIndicFlagValidation(allExpertValidate, this.AllExpertTableDS, noneExpertFlag)
          : bindScoreIndicFlagValidation(
              noneExpertValidate,
              this.NoneExpertTableDS,
              noneExpertFlag
            );

      const AllScoreValidation = bindScoreIndicFlagValidation(
        allScoreElementValidate,
        this.AllScoringElementDS,
        noneIndicateFlag
      );
      const BusinessTechnology =
        bindScoreIndicFlagValidation(
          businessScoreElementValidate,
          this.BusinessScoringElementDS,
          noneIndicateFlag
        ) &&
        bindScoreIndicFlagValidation(
          technologyScoreElementValidate,
          this.TechnologyScoringElementDS,
          noneIndicateFlag
        );

      const BusinessTechnologyValidation = remoteBox
        ? remoteBox.process(
            'SSRC_INQUIRYHALLNEW_UPDATE_PROCESS_BUSINESS_TECHNOLOGY_VALIDATION',
            BusinessTechnology,
            {
              priceElementValidate,
              noneIndicateFlag,
              bidFlag: this.bidFlag,
              rfxInfoDS: this.RfxInfoDS,
              bindScoreIndicFlagValidation,
              priceScoringElementDS: this.PriceScoringElementDS,
              that: this,
            }
          )
        : BusinessTechnology;
      const esValidation =
        bidRuleType === 'NONE' ? AllScoreValidation : BusinessTechnologyValidation;

      let expertAndScoreValidationResult = expertValidation && esValidation;
      expertAndScoreValidationResult = remoteBox
        ? remoteBox.process(
            'SSRC_INQUIRYHALLNEW_UPDATE_PROCESS_EXPERT_AND_SCORE_VALIDATION',
            expertAndScoreValidationResult,
            {
              priceElementValidate,
              priceScoringElementDS: this.PriceScoringElementDS,
              noneIndicateFlag,
              expertValidation,
              esValidation,
              bidFlag: this.bidFlag,
              bindScoreIndicFlagValidation,
              rfxInfoDS: this.RfxInfoDS,
              that: this,
            }
          )
        : expertAndScoreValidationResult;

      return expertAndScoreValidationResult;
    };

    const itemLineValidation = itemLineValidate && !!this.ItemLineTableDS.length;
    let supplierWithRequestValidation =
      sourceMethod && sourceMethod === 'INVITE'
        ? supplierValidate && !!this.SupplierListTableDS.length
        : sourceNoticeValidate && !!sourceMethod;
    if (this.isNewBiddingFlag()) {
      supplierWithRequestValidation = supplierWithRequestValidation && businessFormRefResult;
    }

    const expertScoreValidation = expertAndScoreValidation();
    const rfxDemandValidation =
      (preQualificationFlag ? preQualificationFormRefResult : true) &&
      (preQualificationFormRefResult && enableScoreFlag
        ? prequalScoreElementDSValidate && !!this.PrequalScoreElementDS.length
        : true) &&
      expertScoreValidation &&
      quotationFormRefResult &&
      roundQuotationFormRefResult &&
      biddingTimerRefResult &&
      biddingRuleRefResult &&
      templateFormRefResult &&
      rfxPrepareRefResult;

    this.setState(() => {
      return {
        validates: {
          rfxInfoValidate: infoRefResult, // 采购需求验证标识
          itemLineValidate: itemLineValidation, // 物品
          purchaseValidate: demandSideRefResult && purchaseExecuteFormRefResult, // 采购组织
          toSupplierValidate: supplierWithRequestValidation, // 对供应商要求
          rfxDemandValidate: rfxDemandValidation, // 询价要求
          bTFileValidate, // file attachment
          cuxCardValidateResult,
        },
      };
    });

    const finishingRate =
      infoRefResult +
      itemLineValidation +
      supplierWithRequestValidation +
      rfxDemandValidation +
      (demandSideRefResult && purchaseExecuteFormRefResult) +
      bTFileValidate +
      cuxCardValidateResult;

    // const errorMessage = [...validateMessageSet].filter(Boolean).join();

    const saveValidate =
      supplierRequestFormRefResult &&
      itemLineValidate &&
      supplierValidate &&
      allExpertValidate &&
      noneExpertValidate &&
      businessScoreElementValidate &&
      technologyScoreElementValidate &&
      allScoreElementValidate &&
      prequalScoreElementDSValidate &&
      initialReviewDSValidate &&
      attachmentResult;

    const saveValidateFlag = remoteBox
      ? remoteBox.process('SSRC_INQUIRYHALLNEW_UPDATE_PROCESS_SAVE_VALIDATE_FLAG', saveValidate, {
          bidFlag: this.bidFlag,
          rfxInfoDS: this.RfxInfoDS,
          priceElementValidate,
        })
      : saveValidate;

    return {
      finishingRate,
      // errorMessage,
      saveValidateFlag,
      validateFlag:
        infoRefResult &&
        demandSideRefResult &&
        purchaseExecuteFormRefResult &&
        supplierWithRequestValidation &&
        quotationFormRefResult &&
        roundQuotationFormRefResult &&
        itemLineValidation &&
        rfxDemandValidation &&
        initialReviewDSValidate &&
        // SectionInfoValidate &&
        attachmentResult &&
        cuxCardValidateResult,
    };
  }

  // 附件uuid
  getAttachmentUuid() {
    const { header = {} } = this.state;

    let { businessAttachmentUuid = null, techAttachmentUuid = null } = header || {};
    const RfxInfo = this.RfxInfoDS?.current?.toData();
    if (!businessAttachmentUuid) {
      // eslint-disable-next-line prefer-destructuring
      businessAttachmentUuid = RfxInfo?.businessAttachmentUuid;
    }
    if (!techAttachmentUuid) {
      // eslint-disable-next-line prefer-destructuring
      techAttachmentUuid = RfxInfo?.techAttachmentUuid;
    }

    return {
      bUuid: businessAttachmentUuid,
      tUuid: techAttachmentUuid,
    };
  }

  /**
   * 报价运行时间及竞价运行时间使用个性化默认值时不会计算总运行时间，改为提交或者保存时增加运行时间计算
   */
  /** ********* 【万国】二开调用-勿删!!! *********** */
  @Bind()
  computeRunningDuration() {
    const current = this.RfxInfoDS?.current || null;
    if (!current) {
      return null;
    }
    const {
      preQualificationFlag,
      sourceCategory,
      startFlag,
      roundQuotationRule,
      startQuotationRunningDuration,
      quotationDay,
      quotationRunningDuration,
      biddingRunnintDay,
    } = current.get([
      'preQualificationFlag',
      'sourceCategory',
      'startFlag',
      'roundQuotationRule',
      'startQuotationRunningDuration',
      'quotationDay',
      'quotationRunningDuration',
      'biddingRunnintDay',
    ]);
    const biddingPriceFlag = sourceCategory === 'RFA'; // 竞价标识
    const autoRoundQuotationFlag =
      roundQuotationRule === 'AUTO' ||
      roundQuotationRule === 'AUTO_CHECK' ||
      roundQuotationRule === 'AUTO_SCORE';
    if (
      !preQualificationFlag &&
      startFlag &&
      !biddingPriceFlag &&
      !autoRoundQuotationFlag &&
      !startQuotationRunningDuration &&
      quotationDay
    ) {
      this.changeQuotationDuration(quotationDay, 'day');
    } else if (biddingPriceFlag && !quotationRunningDuration && biddingRunnintDay) {
      this.changeBiddingRunningTime(biddingRunnintDay, 'day');
    }
  }

  /**
   * 询价大厅维护页面-保存=》回调查询
   * await promise.all 处理连续保存版本号不一致的问题
   * 后续有新接口加入(带有版本号概念的) 也按照此逻辑处理
   */
  @Throttle(500)
  @Bind()
  async saveInquiryHallUpdate() {
    const { history = {}, remote: remoteBox } = this.props;
    this.toggleButtonsLoading(true);
    this.togglePageLoading(true);
    const {
      finishingRate = 0,
      saveValidateFlag = false,
      attachmentUploadingFlag = false,
    } = await this.validatePage();

    if (attachmentUploadingFlag) {
      this.toggleButtonsLoading();
      this.togglePageLoading();
      return;
    }

    if (!saveValidateFlag) {
      notification.warning({
        message: intl
          .get('ssrc.inquiryHall.view.inquiryHall.saveNeedValidateAllTable')
          .d('请填写完整表格数据再保存'),
      });
      this.toggleButtonsLoading();
      this.togglePageLoading();
      return;
    }
    // 询价/招标 维护页头保存 - 前置置埋点
    if (remoteBox?.event) {
      const remoteRes = await remoteBox.event.fireEvent('handleSaveInquiryHallUpdateBefore', {
        that: this,
        bidFlag: this.bidFlag,
      });
      if (!remoteRes) return false;
    }
    this.computeRunningDuration();
    const data = await this.integrationPageData({ finishingRate });
    try {
      const result = getResponse(await saveInquiryHallUpdateVTwo(data)); // 保存

      if (isEmpty(result)) {
        this.toggleButtonsLoading();
        this.togglePageLoading();
        return false;
      }

      // 保存后重置ItemLineTableDS,避免物料有缓存数据，重置后查询最新数据，保证数据最新
      this.ItemLineTableDS.reset();
      this.resetBatchMainItems();

      if (this.isNewRfx()) {
        const {
          rfxHeader: { rfxHeaderId = null },
        } = result;

        this.setState({ quotationFormRefControl: false }, () => {
          this.setState({ quotationFormRefControl: true });
        });

        this.toggleButtonsLoading(); // loading
        this.togglePageLoading();
        history.push({
          pathname: this.bidFlag
            ? `/ssrc/new-bid-hall/bid-update/${rfxHeaderId}`
            : `/ssrc/new-inquiry-hall/rfx-update-new/${rfxHeaderId}`,
        });
      } else {
        // 目的重新触发风险提示组件渲染
        this.setState({
          _timestamp: Date.now(),
        });
        if (remoteBox?.event) {
          // 询价/招标 维护页头保存 - 后置埋点
          remoteBox.event.fireEvent('remoteSaveUpdateCallBackEvent', {
            that: this,
            saveRes: result,
            bidFlag: this.bidFlag,
            attachmentRef: this.attachmentRef,
          });
        }
        await this.fetchInquiryHallUpdate();
      }
      notification.success();
    } catch (e) {
      this.toggleButtonsLoading();
      this.togglePageLoading();
      throw e;
    }
    this.toggleButtonsLoading();
    this.togglePageLoading();
  }

  /**
   * 维护界面取消
   */
  @debounce(800)
  @Bind()
  async cancelInquiryHallUpdate() {
    const { remote: remoteBox } = this.props;
    if (this.isNewRfx()) {
      return;
    }
    const message = intl
      .get(`ssrc.inquiryHall.model.inquiryHall.cancelChange`)
      .d('是否确认取消并关闭该单据？');
    await Modal.confirm({
      title: intl.get('ssrc.common.message.tip').d('提示'),
      children: remoteBox
        ? remoteBox.process('SSRC_INQUIRYHALLNEW_UPDATE_PROCESS_CANCEL_MESSAGE', message, {
            bidFlag: this.bidFlag,
          })
        : message,
      okText: intl.get('hzero.common.button.ok').d('确定'),
      onOk: () => this.cancelledRfx(),
      onCancel: () => {},
    });
  }

  @debounce(500)
  @Bind()
  async cancelledRfx() {
    const {
      remote: remoteBox,
      match: { params = {} },
      organizationId,
    } = this.props;
    const { rfxId = null } = params;

    if (remoteBox?.event) {
      const remoteRes = await remoteBox.event.fireEvent('handleCancelInquiryHallUpdateBefore', {
        that: this,
        bidFlag: this.bidFlag,
        rfxInfoDS: this.RfxInfoDS,
      });
      if (!remoteRes) return false;
    }
    this.toggleButtonsLoading(true);
    try {
      let result = await cancelInquiryHallUpdate({
        organizationId,
        rfxHeaderId: rfxId,
      });
      result = getResponse(result);
      this.toggleButtonsLoading();
      if (result) {
        notification.success();
        this.releaseAndCancelPath('cancel'); // 取消路径跳转
      }
    } catch (e) {
      throw e;
    }
  }

  // toggle button loading function
  /** ********* 【万国】二开调用-勿删!!! *********** */
  @Bind()
  toggleButtonsLoading(isLoading = false) {
    const { toggleButtonLoading = () => {} } = this.OperateButtonRef || {};
    toggleButtonLoading(isLoading);
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

  // 删除供应商行数据
  @Bind()
  async handleDeleteSupplierData(datas) {
    const res = await deleteSupplierDatas(datas);
    if (getResponse(res)) {
      // 重新刷新供应商行数据
      this.SupplierListTableDS.query();
      this.fetchQualificationWarnInfo();
      this.toggleButtonsLoading();
      return true;
    }
    return false;
  }

  // 资质弹窗内容渲染
  @Bind()
  renderQualificationExpir(qualifyExpiredData) {
    const { remote: remoteBox } = this.props;
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
      remoteBox,
      supplierBulkExpiredModalDS: this.SupplierBulkExpiredLineDS,
      tip: intl
        .get('ssrc.inquiryHall.view.qualificationWarning')
        .d('以下供应商在供应商360资质认证已到期，无法邀请，是否删除以下供应商'),
      selectionMode: 'none',
    };

    const deleteSupplierData = expired.map((item) => {
      const { sourceHeaderId, sourceLineSupplierId } = item;
      return {
        rfxHeaderId: sourceHeaderId,
        rfxLineSupplierId: sourceLineSupplierId,
      };
    });

    Modal.open({
      destroyOnClose: true,
      key: Modal.key(),
      title: intl.get('ssrc.inquiryHall.view.title.tips').d('提示'),
      children: <SupplierBatchAddExpiredModal {...supplierExpiredProps} />,
      style: { width: '800px' },
      bodyStyle: { maxHeight: 400 },
      onOk: () => this.handleDeleteSupplierData(deleteSupplierData),
      onCancel: () => this.toggleButtonsLoading(),
    });
  }

  /**
   * 询价大厅维护页面-发布
   */
  @debounce(500)
  @Bind()
  async releaseInquiryHall() {
    const { remote: remoteFunc } = this.props;
    this.toggleButtonsLoading(true);
    const {
      validateFlag = false,
      finishingRate = 0,
      errorMessage = null,
      attachmentUploadingFlag = false,
    } = await this.validatePage({
      validateTableLineFlag: 1,
    });

    if (attachmentUploadingFlag) {
      this.toggleButtonsLoading();
      this.togglePageLoading();
      return;
    }

    this.clearAllDSValidateTableLine(); // 清除表格ds规则校验状态标识

    if (!validateFlag) {
      notification.warning({
        message: (
          <div>
            {intl
              .get('ssrc.inquiryHall.view.inquiryHall.inputSubmitRfxUpdate')
              .d('提交前请填写完整相关信息')}
            {errorMessage ? <div dangerouslySetInnerHTML={{ __html: errorMessage || '' }} /> : ''}
          </div>
        ),
      });
      this.toggleButtonsLoading();
      return;
    }
    if (remoteFunc?.event) {
      const remoteRes = await remoteFunc.event.fireEvent('handleReleaseInquiryHallBefore', {
        that: this,
        bidFlag: this.bidFlag,
        rfxInfoDS: this.RfxInfoDS,
      });
      if (!remoteRes) return false;
    }
    this.computeRunningDuration();
    const data = await this.integrationPageData({
      finishingRate,
    });

    const doSubmit = async (payload) => {
      this.toggleButtonsLoading(true);
      try {
        let result = await releaseInquiryHallVTwo({ ...(data || {}), ...(payload || {}) });
        result = getResponse(result);
        if (!result) {
          return;
        }

        notification.success();
        this.releaseAndCancelPath('release'); // 发布路径跳转
      } catch (e) {
        throw e;
      } finally {
        this.toggleButtonsLoading();
      }
    };

    const releaseSubmit = () => {
      if (remoteFunc?.event) {
        remoteFunc.event.fireEvent('doSubmit', {
          data,
          doSubmit,
          releaseInquiryHallVTwo,
          OperateButtonRef: this.OperateButtonRef,
          that: this,
          toggleButtonsLoading: (...params) => {
            this.toggleButtonsLoading(...params);
          },
        });
      } else {
        doSubmit();
      }
    };

    const ValidateResult = getResponse(await validateBeforeRelease(data));
    if (!ValidateResult) {
      this.toggleButtonsLoading();
      return;
    }

    validatorConfirmModal({
      response: ValidateResult,
      validatorType: 'highestValidatorType',
      validatorArrName: 'validateResults',
      onOk: () => releaseSubmit(),
      warningSaveCancel: () => this.saveInquiryHallUpdate(),
      onValidator: () => this.toggleButtonsLoading(),
      refreshPage: this.fetchInquiryHallUpdate,
      openQualificationModal: this.renderQualificationExpir,
      remoteFunc,
      remoteProcessCodePrefix: 'SSRC_INQUIRYHALLNEW_UPDATE',
      componentThat: this,
    });

    // if ((validateCallBack && validateCallBack.type !== 'SUCCESS') || !validateCallBack) {
    //   return;
    // }

    // doSubmit();
  }

  // 取消页面所有表格ds校验行数
  @Bind()
  clearAllDSValidateTableLine() {
    const { remote: remoteBox } = this.props;
    const { prequalScoreElementDsMap } = this.state;
    this.ItemLineTableDS.setState(EditorSymbol, false);
    this.SupplierListTableDS.setState(EditorSymbol, false);
    this.AllExpertTableDS.setState(EditorSymbol, false);
    this.NoneExpertTableDS.setState(EditorSymbol, false);
    this.BusinessScoringElementDS.setState(EditorSymbol, false);
    this.TechnologyScoringElementDS.setState(EditorSymbol, false);
    this.AllScoringElementDS.setState(EditorSymbol, false);
    this.PrequalScoreElementDS.setState(EditorSymbol, false);
    this.InitialReviewDS.setState(EditorSymbol, false);

    if (remoteBox?.event) {
      remoteBox.event.fireEvent('remoteClearTableDSValidatedEvent', {
        priceScoringElementDS: this.PriceScoringElementDS,
        rfxInfoDS: this.RfxInfoDS,
        bidFlag: this.bidFlag,
        EditorSymbol,
      });
    }

    const dsValueFirst = Object.values(prequalScoreElementDsMap);
    if (!isEmpty(dsValueFirst)) {
      dsValueFirst[0].setState(EditorSymbol, false);
    }
  }

  // 发布和取消后的路径跳转
  // @debounce(1200)
  releaseAndCancelPath = async (operateType = 'cancel') => {
    const { history = {}, remote: remoteBox } = this.props;
    const {
      routerParam: { fromPageType },
    } = this.state;

    let handleRemotePath = null;
    if (remoteBox?.event) {
      handleRemotePath = await remoteBox.event.fireEvent('remoteHandleReleaseAndCancelPath', {
        that: this,
        operateType,
      });

      if (handleRemotePath === false) {
        return;
      }
    }

    if (fromPageType === 'applyToInquiry') {
      // 如果父页面来自于申请转询价，则返回路径也是申请转询价
      history.push({
        pathname: `${getActiveTabKey()}/apply-to-inquiry`,
        state: {
          _back: -1,
        },
      });
    } else {
      const ListUrl = this.distinguishUpdatePageUrl();
      history.push({
        pathname: ListUrl,
        search:
          operateType === 'release'
            ? querystring.stringify({
                releaseFinishFlag: 1, // 发布后的单据自动跳转到全部tab标识
              })
            : '',
      });
    }
  };

  // 招标公告预览
  @Bind()
  previewNotice() {
    const {
      match: { params = {} },
    } = this.props;
    const { rfxId = null } = params || {};

    const noticeRecord = this.SourceNoticeDS?.current || null;
    const noticeId = noticeRecord?.get('noticeId');

    if (!rfxId || !noticeId) {
      notification.warning({
        message: intl
          .get(`ssrc.inquiryHall.view.warning.commonSaveRfxAndNoticeToPreview`, {
            documentTypeName: this.documentTypeName,
          })
          .d(`请先保存{documentTypeName}和公告信息`),
      });
      return;
    }

    const path = this.bidFlag
      ? `/ssrc/inquiry-hall/tender-bid-hall-notice-preview/${rfxId}`
      : `/ssrc/inquiry-hall/tender-bid-notice-preview/${rfxId}`;

    openTab({
      key: path,
      path,
      // title: 'ssrc.inquiryHall.view.title.tenderBidNotice',
      title: 'srm.common.tab.title.ssrc.tenderNotice',
      action: 'ssrc.inquiryHall.view.title.tenderBidNotice',
      closable: true,
    });
  }

  // 页面loading状态
  /** ********* 【万国】二开调用-勿删!!! *********** */
  @Bind()
  togglePageLoading(isLoading = false) {
    this.setState({
      inquiryHallLoading: isLoading,
    });
  }

  // 评分要素/初步评审 -- 选择评分模板
  @Bind()
  async selectScoreElementTemplate(record = {}, type) {
    const {
      organizationId,
      match: { params = {} },
    } = this.props;
    const { rfxId = null } = params || {};
    const { templatePurpose, templateId = null } = record || {};
    const sourceTemplateId = this.RfxInfoDS?.current
      ? this.RfxInfoDS?.current?.get('templateId')
      : null;

    if (!rfxId || !templateId || rfxId === 'null') {
      return;
    }

    try {
      let result = await saveAllScoringTemplate({
        organizationId,
        templatePurpose,
        sourceHeaderId: rfxId,
        sourceFrom: 'RFX',
        templateId,
        sourceTemplateId,
        indicStatus: 'SUBMITTED',
        operationType: this.operationType,
      });
      result = getResponse(result);
      this.RfxInfoDS?.current?.set({
        // templateLov: null,
        reviewTemplateLov: null,
      });
      if (!result) {
        return;
      }
      notification.success();
      if (type === 'score') {
        // 避免不必要的刷新
        this.fetchScoring();
        // 选择评分要素模版后 清除当前页面权重值 根据选择后的评分要素模版第一行数据显示权重
        this.RfxDemand?.setState({
          technologyWeight: null,
          businessWeight: null,
        });
      } else {
        this.fetchQueryReviewElements();
      }
    } catch (e) {
      this.RfxInfoDS?.current?.set({
        // templateLov: null,
        reviewTemplateLov: null,
      });
      // 防止更新失败后, 再选择同一条记录, 触发不了onChange
      throw e;
    }
  }

  /**
   * 复制物品明细
   * @protected 此方法被【乐成教育、爱学习】二开，禁止修改、删除此方法名
   * */
  @Bind()
  copyItemLine() {
    const { header } = this.state;
    const { organizationId, remote: { event } = {} } = this.props;
    const selects = this.ItemLineTableDS.selected;
    if (isEmpty(selects)) {
      notification.warning({
        message: intl.get('ssrc.common.pleaseSelectItemLinesToCopy').d('请勾选要复制的行!'),
      });
      return;
    }

    // 复制行 标准逻辑
    const remoteCopyItemLineEvent = (props = {}) => {
      const { selects: selectedRecords = [], itemLineTableDS } = props;
      const itemLines = selectedRecords.map((select) => select.toJSONData());
      itemLines.forEach((itemLine) => {
        const newItemLine = {
          ...itemLine,
          attachmentUuid: null,
          rfxLineItemId: null,
          rfxLineItemNum: null,
          prNum: null,
          prLineNum: null,
          prHeaderId: null,
          prLineId: null,
          prData: null,
          prDisplayLineNum: null,
          creationDate: null,
          organizationId,
          tenantId: organizationId,
          lastUpdateDate: null,
          projectLineSectionId: null,
          projectLineItemId: null,
          itemProjectNum: null,
          copyRfxLineItemId: null,
          rfLineItemId: null,
          rfHeaderId: null,
          sampleRequestedFlag: 0,
          _status: 'create',
          status: 'add',
        };
        itemLineTableDS.create(newItemLine, 0);
      });
      itemLineTableDS.unSelectAll();
      itemLineTableDS.clearCachedSelected();
    };

    /**
     * 二开埋点方法传入参数
     * @protected 二开埋点【山鹰】，请勿删除参数！！！
     */
    const remoteCopyItemLineProps = {
      header,
      organizationId,
      selects,
      that: this,
      bidFlag: this.bidFlag,
      itemLineTableDS: this.ItemLineTableDS,
      remoteCopyItemLineEvent,
    };

    if (event) {
      // remoteCopyItemLine 二开埋点方法名
      event.fireEvent('remoteCopyItemLine', remoteCopyItemLineProps);
    } else {
      remoteCopyItemLineEvent(remoteCopyItemLineProps);
    }
  }

  // 物料行新建
  @Bind()
  createItemLine() {
    const {
      organizationId,
      match: { params },
      remote: remoteBox,
    } = this.props;
    const { isNewTemplateConfigFlag = false } = this.state;
    let { rfxId } = params || {};
    const header = this.RfxInfoDS.current.toData() || {};
    rfxId = rfxId && rfxId !== 'null' ? rfxId : null;

    // 税率值集视图配置的显示字段
    const taxTextField = this.ItemLineTableDS.getField('taxIdLov')?.get('textField');
    const {
      templateFreightIncludedFlag = 0,
      // templateTaxIncludedFlag = 0,
      templateTaxId = null,
      templateTaxRate = null,
      ouId,
      ouName,
      invOrganizationId,
      invOrganizationName,
      taxIdMeaning,
    } = header;

    const newItemLine = Object.assign(
      {
        rfxHeaderId: rfxId,
        rfxLineItemNum: undefined,
        tenantId: organizationId,
        ouId: !rfxId ? ouId : undefined, // 业务实体 新建时会给默认值
        ouName: !rfxId ? ouName : undefined,
        itemCategoryId: undefined, // 物品分类
        rfxQuantity: undefined, // 基本数量
        secondaryQuantity: undefined, // 需求数量
        secondaryUomId: undefined, // 单位
        uomName: undefined, // 基本单位
        secondaryUomName: undefined, // 单位
        itemName: undefined, // 物品描述
        sampleRequestedFlag: 0,
        roundFlag: 0,
        quotationDetailFlag: 0,
        itemLineQuotationDetail: [],
        currentRoundNumber: 1,
        finishedFlag: 0,
        // ladderInquiryFlag: 0,
        // 后台暂时必传，因为没有改，先调通
        invOrganizationId: !rfxId ? invOrganizationId : undefined,
        invOrganizationName: !rfxId ? invOrganizationName : undefined,
        demandDate: null,
        validExpiryDateFrom: null,
        validExpiryDateTo: null,
        // 非必传
        itemId: undefined,
        itemRemark: undefined,
        deliveryAddress: undefined,
        // taxIncludedFlag: templateTaxIncludedFlag,
        quotationRange: undefined,
        minLimitPrice: undefined,
        maxLimitPrice: undefined,
        costPrice: undefined,
        quotationStartDate: undefined,
        quotationEndDate: undefined,
        // floatType: 'money',
        attachmentUuid: null,
        _status: 'create',
      },
      // 新模板 (不从模板上取值 个性化配置默认值生效) 老模板逻辑保持不变
      isNewTemplateConfigFlag
        ? {}
        : {
            freightIncludedFlag: templateFreightIncludedFlag,
            taxId: templateTaxId,
            taxRate: templateTaxRate,
            ...(taxTextField && !['taxRate', 'taxId'].includes(taxTextField)
              ? {
                  [taxTextField]: taxIdMeaning,
                }
              : {}),
          }
    );

    const itemLine = remoteBox
      ? remoteBox.process('SSRC_INQUIRYHALLNEW_UPDATE_PROCESS_CREATE_ITEM_LINE_DATA', newItemLine, {
          bidFlag: this.bidFlag,
          header,
          rfxInfoDS: this.RfxInfoDS,
        })
      : newItemLine;

    const record = this.ItemLineTableDS.create(itemLine, 0);
    record.setState('editing', true);
  }

  // 重置物料行状态及批量编辑DTO数据
  @Bind()
  resetBatchMainItems() {
    this.setState({
      batchEditRfxLineItemDTO: null,
      batchEditRfxLineItemData: null,
      batchMaintainItemDS: null,
      allEditFlag: -1,
    });

    this.ItemLineTableDS.unSelectAll();
    this.ItemLineTableDS.clearCachedSelected();
  }

  // 设置物料行批量编辑DTO
  @Bind()
  setBatchMainItems({
    batchEditRfxLineItemDTO,
    batchEditRfxLineItemData,
    batchMaintainItemDS,
    allEditFlag,
  }) {
    this.setState({
      batchEditRfxLineItemDTO,
      batchEditRfxLineItemData,
      batchMaintainItemDS,
      allEditFlag,
    });
  }

  // 获取物料行数据
  @Bind()
  getBatchUpdateFlag() {
    const {
      batchEditRfxLineItemDTO,
      batchEditRfxLineItemData,
      allEditFlag,
      batchMaintainItemDS,
    } = this.state;
    return {
      batchEditRfxLineItemDTO,
      batchEditRfxLineItemData,
      allEditFlag,
      batchMaintainItemDS,
      integrationPageData: this.integrationPageData,
    };
  }

  // 保存物料
  @Bind()
  async saveItemLine() {
    const { remote: remoteBox } = this.props;
    try {
      this.ItemLineTableDS.forEach((itemLine) => {
        // eslint-disable-next-line no-param-reassign
        itemLine.status = 'update';
      });

      const validateFlag = await this.ItemLineTableDS.validate();
      if (!validateFlag) {
        return;
      }
      if (remoteBox?.event) {
        const remoteProps = {
          that: this,
          bidFlag: this.bidFlag,
          rfxInfoDS: this.rfxInfoDS,
        };
        // 二开埋点 执行某些操作
        const remoteRes = await remoteBox.event?.fireEvent('handleSaveItemLineBefore', remoteProps);
        if (!remoteRes) return false;
      }
      let result = await this.ItemLineTableDS.submit();
      result = getResponse(result);
      if (!result || !result.success) {
        return;
      }
      if (remoteBox?.event) {
        const remoteProps = {
          that: this,
          saveRes: result,
          bidFlag: this.bidFlag,
          rfxInfoDS: this.rfxInfoDS,
        };
        // 二开埋点 执行某些操作
        const remoteRes = await remoteBox.event?.fireEvent('handleSaveItemLineAfter', remoteProps);
        if (!remoteRes) return false;
      }
      await this.afterSaveItemLineUpdateHeader();
    } catch (e) {
      throw e;
    }
  }

  // 保存物料
  @Bind()
  async saveForceItemLine() {
    try {
      this.ItemLineTableDS.forEach((itemLine) => {
        // eslint-disable-next-line no-param-reassign
        itemLine.status = 'update';
      });

      let result = await this.ItemLineTableDS.submit();
      result = getResponse(result);
      if (!result || !result.success) {
        return;
      }
      this.resetBatchMainItems();
      this.afterSaveItemLineUpdateHeader();
    } catch (e) {
      throw e;
    }
  }

  // 物料保存后更新对应数据
  afterSaveItemLineUpdateHeader = async () => {
    await this.ItemLineTableDS.query(undefined, undefined, true);
    this.resetBatchMainItems(); // 重置状态
    const header = await this.fetchInquiryHeader();
    if (isEmpty(header)) {
      return;
    }
    if (this.SectionInfo && this.SectionInfo.updateHeaderInfo) {
      this.SectionInfo.updateHeaderInfo(header.projectLineSections);
    }
    const { objectVersionNumber = null, budgetAmount = null } = header;
    this.RfxInfoDS?.current?.set('objectVersionNumber', objectVersionNumber);
    this.RfxInfoDS?.current?.set('budgetAmount', budgetAmount);
    const sourceMethod = this.RfxInfoDS?.current?.get('sourceMethod');
    // 寻源方式为邀请
    if (sourceMethod === 'INVITE') {
      this.SupplierListTableDS.query();
    }
    this.handleSetHeaderData({ header, rfxInfoDS: this.RfxInfoDS });
  };

  // 二开埋点方法
  handleSetHeaderData = (payload = {}) => {
    const { remote: remoteBox } = this.props || {};
    const { header, rfxInfoDS } = payload || {};
    if (remoteBox?.event) {
      const remoteProps = {
        bidFlag: this.bidFlag,
        headerData: header,
        rfxInfoDS,
      };
      // 二开埋点 执行某些操作
      remoteBox.event?.fireEvent('remoteHandleOperateAfterFetchHeader', remoteProps);
    }
  };

  // 删除物料
  @Bind()
  async destroyItemLine() {
    const {
      remote: remoteBox,
      match: { params = {} },
    } = this.props;
    const { rfxId = null } = params;
    const selectedData = this.ItemLineTableDS.selected;
    if (!rfxId || rfxId === 'null') {
      selectedData.forEach((itemLine) => {
        // eslint-disable-next-line no-param-reassign
        itemLine.status = 'add';
      });
    }
    const addData = selectedData.filter((newItem) => !newItem.get('rfxLineItemId'));
    const oldData = selectedData.filter((newItem) => newItem.get('rfxLineItemId'));
    if (addData.length) {
      this.ItemLineTableDS.remove(addData, 1);
    }
    if (oldData.length) {
      if (remoteBox?.event) {
        const remoteRes = await remoteBox.event.fireEvent('handleDestroyItemLineBefore', {
          that: this,
          data: oldData,
          bidFlag: this.bidFlag,
          rfxHeaderId: this.getRfxHeaderId(),
        });
        if (!remoteRes) return false;
      }
      this.ItemLineTableDS.delete(oldData, {
        title: intl.get('ssrc.common.message.tip').d('提示'),
        children: intl
          .get('hzero.c7nProUI.DataSet.delete_selected_row_confirm')
          .d('确认删除选中行？'),
      }).then(async (res) => {
        if (getResponse(res)) {
          const header = await this.fetchInquiryHeader();
          if (isEmpty(header)) {
            return;
          }
          if (this.SectionInfo && this.SectionInfo.updateHeaderInfo) {
            this.SectionInfo.updateHeaderInfo(header.projectLineSections);
          }
          const { objectVersionNumber = null, budgetAmount = null } = header;
          this.RfxInfoDS?.current?.set('objectVersionNumber', objectVersionNumber);
          this.RfxInfoDS?.current?.set('budgetAmount', budgetAmount);
          const sourceMethod = this.RfxInfoDS?.current?.get('sourceMethod');
          // 寻源方式为邀请
          if (sourceMethod === 'INVITE') {
            this.SupplierListTableDS.query();
          }
          this.handleSetHeaderData({ header, rfxInfoDS: this.RfxInfoDS });
        }
      });
    }
  }

  // 计算头上预估金额
  @Bind()
  async changeRfxQuantity(value, record, name) {
    const { doubleUnitFlag } = this.state;
    const { itemId, secondaryQuantity, secondaryUomId, rfxLineItemId, uomId } = record.get([
      'itemId',
      'secondaryQuantity',
      'secondaryUomId',
      'rfxLineItemId',
      'uomId',
    ]);
    // if (name === 'estimatedPrice') {
    //   record.set(
    //     'estimatedAmount',
    //     math.multipliedBy(record.get('secondaryQuantity'), value) || null
    //   );
    // } else
    if (name === 'secondaryQuantity') {
      // record.set('estimatedAmount', math.multipliedBy(record.get('estimatedPrice'), value) || null);
      // record.set(
      //   'netEstimatedAmount',
      //   math.multipliedBy(record.get('netEstimatedPrice'), value) || null
      // );
      // 在这个地方单独计算数量是因为精度组件会触发两次ds的update
      if (itemId && doubleUnitFlag) {
        if (secondaryUomId) {
          const res = await calculateBasicQty({
            secondaryQuantity,
            itemId,
            businessKey: rfxLineItemId || record.id,
            doublePrimaryUomId: uomId,
            secondaryUomId,
          });
          record.set('rfxQuantity', res ?? '');
        }
      } else {
        // 没有物料或者双单位没开启直接将数量给到基本数量
        record.set('rfxQuantity', value);
      }
    }
    // else if (name === 'netEstimatedPrice') {
    //   record.set(
    //     'netEstimatedAmount',
    //     math.multipliedBy(record.get('secondaryQuantity'), value) || null
    //   );
    // }
    // const data = this.ItemLineTableDS.toData();
    // let totalNetEstimatedAmount = 0;
    // let totalEstimatedAmount = 0;
    // data.forEach((item) => {
    //   const { estimatedAmount = 0, netEstimatedAmount = 0 } = item;
    //   totalEstimatedAmount = math.plus(totalEstimatedAmount, estimatedAmount);
    //   totalNetEstimatedAmount = math.plus(totalNetEstimatedAmount, netEstimatedAmount);
    // });
    // this.RfxInfoDS?.current?.set('totalEstimatedAmount', totalEstimatedAmount);
    // this.RfxInfoDS?.current?.set('totalNetEstimatedAmount', totalNetEstimatedAmount);
  }

  /**
   * 供应商列表-风险监控
   */
  @Bind()
  linkRiskScan(record = {}) {
    const { supplierCompanyId } = record.get(['isMonitor', 'isShowScan', 'supplierCompanyId']);
    const rfxHeaderId = this.getRfxHeaderId();

    // 校验头id
    idValidation(rfxHeaderId);

    if (!supplierCompanyId) {
      return;
    }

    supplierRiskScan({ supplierCompanyId, rfxHeaderId });
  }

  /**
   * 供应商关系图谱
   */
  @Throttle(1000)
  @Bind()
  supplierRelationMap() {
    const { organizationId } = this.props;
    const supplierList = [];

    const { current } = this.RfxInfoDS;

    this.SupplierListTableDS.forEach((record = {}) => {
      const {
        supplierCompanyName,
        supplierCompanyId,
        supplierId,
        supplierCompanyNum,
      } = record.get([
        'supplierCompanyName',
        'supplierCompanyId',
        'supplierId',
        'supplierCompanyNum',
      ]);
      if (!supplierId && !supplierCompanyId) {
        return;
      }
      supplierList.push({
        supplierCompanyNum,
        supplierCompanyName,
        supplierCompanyId,
        supplierId,
        rfxHeaderId: this.getRfxHeaderId(),
        rfxNum: current?.get('rfxNum'),
      });
    });

    // 校验头id
    idValidation(this.getRfxHeaderId());

    const secondarySourceCategory = this.RfxInfoDS?.current?.get('secondarySourceCategory');
    if (!secondarySourceCategory) return;

    supplierRelationMapNew({
      organizationId,
      data: {
        rfxHeaderId: this.getRfxHeaderId(),
        supplierLists: supplierList,
        businessType: secondarySourceCategory,
        rfxNum: current?.get('rfxNum'),
      },
    }).then((res) => {
      if (isText(res)) {
        const url = getSupplierRelationUrl(res);
        window.open(url);
      }
    });
  }

  // file list ref
  @Bind()
  handleBindOnRef(ref = {}) {
    /** ********* 【万国】二开附件列表-勿动!!! *********** */
    this.attachmentRef = ref;
  }

  @Bind()
  getEvaluateIndics() {
    // 评分要素 处理专家分配 评分要素传给后台返回最新的分配关系 前端替换最新的分配关系 要素表不保存
    const BusinessScoringElement = this.BusinessScoringElementDS?.toJSONData() || [];
    const TechnologyScoringElement = this.TechnologyScoringElementDS?.toJSONData() || [];
    const AllScoringElement = this.AllScoringElementDS?.toJSONData() || [];
    const evaluateIndics = [
      ...BusinessScoringElement,
      ...TechnologyScoringElement,
      ...AllScoringElement,
    ];
    return evaluateIndics || [];
  }

  /**
   * 保存专家评分
   *
   * @param {*} type
   * @returns
   * @memberof Update
   */
  @debounce(500)
  @Bind()
  async onSaveExpert(type = null) {
    const {
      organizationId,
      match: { params = {} },
      sourceKey = 'INQUIRY',
    } = this.props;
    const { rfxId = null } = params || {};
    if (!rfxId) {
      notification.warning({
        message: intl.get('ssrc.inquiryHall.view.inquiryHall.firstSaveOrder').d('请先保存单据'),
      });
      return;
    }

    let ds = this.NoneExpertTableDS;
    if (type === 'BUSINESS_TECHNOLOGY') {
      ds = this.AllExpertTableDS;
    }
    const validateFlag = await ds.validate();
    if (!validateFlag) {
      return;
    }
    this.setState({ isLoading: true });

    const sourceTemplateId = this.RfxInfoDS?.current?.get('templateId');
    const data = ds.toData();
    const tableDatas = data.map((item) => {
      return {
        ...item,
        tenantId: organizationId,
        organizationId,
        sourceFrom: 'RFX',
        sourceHeaderId: rfxId,
        expertStatus: 'SUBMITTED',
      };
    });

    const datas = {
      evaluateExpertList: tableDatas,
      sourceTemplateId,
      operationType: this.operationType,
      evaluateIndics: this.getEvaluateIndics(),
    };

    saveScoringNoneExpert({
      organizationId,
      evaluateExperts: datas,
      customizeUnitCode: `SSRC.${sourceKey}_HALL.NEW_EDIT.HEADER.EXPERT_SCORE`,
    })
      .then((res) => {
        const result = getResponse(res);
        this.setState({ isLoading: false });
        if (result) {
          this.handleAssignedExpertInfo(result);
          notification.success();
          this.fetchExpert();
        }
      })
      .catch(() => {
        this.setState({ isLoading: false });
      });
  }

  @Bind()
  handleAssignedExpertInfo(data = {}) {
    const { businessIndicList = [], technologyIndicList = [], otherIndicList = [] } = data || {};
    const { bidRuleType = null } = this.RfxInfoDS?.current?.get(['bidRuleType']) || {};
    if (bidRuleType === 'DIFF') {
      this.handleUpdateAssignedExpert(this.BusinessScoringElementDS, businessIndicList);
      this.handleUpdateAssignedExpert(this.TechnologyScoringElementDS, technologyIndicList);
    } else if (bidRuleType === 'NONE') {
      this.handleUpdateAssignedExpert(this.AllScoringElementDS, otherIndicList);
    }
  }

  /*
   * 前端替换最新的分配关系 要素表格行填写的信息不会保存到后台
   * 替换规则：如果当前商务组要素全是新建行要素，则data为[]，不作替换
   *         只替换已保存的要素行分配关系，用主键id判断
   */
  @Bind()
  handleUpdateAssignedExpert(ds, data = []) {
    if (isEmpty(data)) return;
    const _data = ds.toData().map((item) => {
      // 只替换有要素id的要素行，对于新建的无要素id的要素行不替换分配关系
      if (item?.evaluateIndicId) {
        const { assignedExpertList, assignedExperts } =
          data?.find((i) => i.evaluateIndicId === item.evaluateIndicId) || {};
        return { ...item, assignedExpertList, assignedExperts };
      }
      return item;
    });
    const loadedData = _data.filter((i) => i.evaluateIndicId);
    // 还原新创建的数据
    const createData = _data.filter((i) => !i.evaluateIndicId);
    // loadData同步操作
    ds.loadData(loadedData);
    createData.reverse().forEach((i) => ds.create(i, 0));
  }

  // 获取单据id
  getRfxHeaderId() {
    const {
      match: { params = {} },
    } = this.props;
    let { rfxId = null } = params || {};
    rfxId = rfxId && rfxId !== 'null' ? rfxId : null;
    return rfxId;
  }

  // 评分要素新建行
  @Bind()
  onCreateScoringElements(type = null) {
    let ds = null;
    const defaultData = {};
    let CurrentWeight = 50;
    const { current = null } = this.RfxInfoDS;
    if (!current) {
      return;
    }

    const getBusinessFirstLineWeight = (currentDS = {}) => {
      let weight = null;
      const data = currentDS.toData();
      const firstLineData = data.filter((item) => item._status !== 'create')[0] || {};

      if (isEmpty(firstLineData)) {
        const headBusinessWeight = current?.get('businessWeight');
        weight = !isNil(headBusinessWeight) ? headBusinessWeight : CurrentWeight;
      } else {
        const { businessWeight = null } = firstLineData || {};
        weight = businessWeight ?? CurrentWeight;
      }
      return weight;
    };

    const getTechnolofyFirstLineWeight = (currentDS = {}) => {
      let weight = null;
      const data = currentDS.toData();
      const firstLineData = data.filter((item) => item._status !== 'create')[0] || {};

      if (isEmpty(firstLineData)) {
        const headTechWeight = current?.get('technologyWeight');
        weight = !isNil(headTechWeight) ? headTechWeight : CurrentWeight;
      } else {
        weight = firstLineData?.technologyWeight ?? CurrentWeight;
      }
      return weight;
    };

    if (type === 'BUSINESS') {
      ds = this.BusinessScoringElementDS;
      CurrentWeight = getBusinessFirstLineWeight(ds);
      defaultData.businessWeight = CurrentWeight;
      defaultData.technologyWeight = null;
    } else if (type === 'TECHNOLOGY') {
      ds = this.TechnologyScoringElementDS;
      CurrentWeight = getTechnolofyFirstLineWeight(ds);
      defaultData.technologyWeight = CurrentWeight;
      defaultData.businessWeight = null;
    } else {
      ds = this.AllScoringElementDS;
    }

    const { organizationId } = this.props;
    let headerData = {};
    if (this.RfxInfoDS.current) {
      headerData = this.RfxInfoDS.current.toData() || {};
    }
    const { templateId: sourceTemplateId = null, templateScoreType, openBidOrder } = headerData;

    let line = {
      evaluateIndicId: null,
      tenantId: organizationId,
      indicateId: null,
      indicateCode: null,
      indicateName: null,
      indicateType: null,
      indicateRemark: null,
      weight: ['SCORE', 'SCORE_NEW'].includes(templateScoreType) ? 100 : null,
      sourceFrom: 'RFX',
      openBidOrder: openBidOrder || 'BUSINESS_FIRST',
      organizationId,
      expertCategory: type,
      sourceHeaderId: this.getRfxHeaderId(),
      indicStatus: 'SUBMITTED', // 查询提交后的评分要素数据
      team: type,
      detailEnabledFlag: 0,
      sourceTemplateId,
      isNew: 1,
      _status: 'create',
      createLineKey: uuidv4(), // 新建行唯一id 用来标记新建行
    };
    line = { ...line, ...defaultData };
    ds.create(line, 0);
    this.forceUpdate();
  }

  /**
   * 保存评分要素
   */
  @debounce(500)
  @Bind()
  async onSaveScoringElements() {
    const { organizationId, sourceKey, remote: remoteBox } = this.props;
    const currentHeaderRecord = this.RfxInfoDS?.current;
    const { bidRuleType = null, templateId: sourceTemplateId = null } = currentHeaderRecord
      ? currentHeaderRecord.get(['bidRuleType', 'templateId'])
      : {};

    let validateFlag = false;
    let newParams = [];
    let customizeUnitCode = '';

    if (bidRuleType === 'NONE') {
      validateFlag = await this.AllScoringElementDS.validate();
      newParams = this.AllScoringElementDS.toData() || [];
      customizeUnitCode = `SSRC.${sourceKey}_HALL.NEW_EDIT.HEADER.SCORE_INDICS,SSRC.${sourceKey}_HALL.NEW_EDIT.SCORE.EXPERT_ASSIGN_V2`;
    }

    if (bidRuleType === 'DIFF') {
      const busiessValidateFlag = await this.BusinessScoringElementDS.validate();
      const technologyValidateFlag = await this.TechnologyScoringElementDS.validate();
      const priceValidateFlag = await this.PriceScoringElementDS.validate();

      validateFlag = remoteBox
        ? remoteBox.process(
            'SSRC_INQUIRYHALLNEW_UPDATE_PROCESS_SCORING_ELEMENT_SAVE_BUSINESS_TECHNOLOGY_VALIDATION',
            busiessValidateFlag && technologyValidateFlag,
            {
              bidFlag: this.bidFlag,
              rfxInfoDS: this.RfxInfoDS,
              priceValidateFlag,
            }
          )
        : busiessValidateFlag && technologyValidateFlag;

      const businessData = this.BusinessScoringElementDS.toData() || [];
      const techData = this.TechnologyScoringElementDS.toData() || [];

      newParams = remoteBox
        ? remoteBox.process(
            'SSRC_INQUIRYHALLNEW_UPDATE_PROCESS_SCORING_ELEMENT_SAVE_BUSINESS_TECHNOLOGY_DATA',
            [...businessData, ...techData],
            {
              bidFlag: this.bidFlag,
              rfxInfoDS: this.RfxInfoDS,
              priceScoringElementDS: this.PriceScoringElementDS,
            }
          )
        : [...businessData, ...techData];

      customizeUnitCode = `SSRC.${sourceKey}_HALL.NEW_EDIT.HEADER.SCORE_INDICS_TECHNOLOGY,SSRC.${sourceKey}_HALL.NEW_EDIT.HEADER.SCORE_INDICS,SSRC.${sourceKey}_HALL.NEW_EDIT.SCORE.EXPERT_ASSIGN_V2`;
    }

    if (!validateFlag || !newParams.length) {
      return;
    }

    this.setState({ isScoringLoading: true });
    newParams = newParams.map((item) => {
      return {
        ...item,
        organizationId,
        tenantId: organizationId,
        sourceFrom: 'RFX',
        sourceHeaderId: this.getRfxHeaderId(),
        sourceTemplateId,
      };
    });

    saveScoringNoneTempelate({
      organizationId,
      otherParams: newParams,
      customizeUnitCode,
      operationType: this.operationType,
    })
      .then((res) => {
        this.setState({ isScoringLoading: false });
        const result = getResponse(res);
        if (!result) {
          return;
        }
        notification.success();
        this.fetchScoring();
      })
      .catch(() => {
        this.setState({ isScoringLoading: false });
      });
  }

  // 评分要素删除
  @Bind()
  async deleteScoreElement(ds = {}) {
    const selecteds = ds.selected || [];
    if (isEmpty(selecteds)) {
      return;
    }
    const remoteDelete = selecteds.filter((item) => (item.data || {}).evaluateIndicId);
    const localDelete = selecteds.filter((item) => !(item.data || {}).evaluateIndicId);

    if (!isEmpty(remoteDelete)) {
      try {
        const result = await ds.delete(remoteDelete, {
          title: intl.get('ssrc.common.message.tip').d('提示'),
          children: intl
            .get('hzero.c7nProUI.DataSet.delete_selected_row_confirm')
            .d('确认删除选中行？'),
        });
        if (result && result?.success) {
          ds.unSelectAll();
          this.fetchScoring();
        }
      } catch (e) {
        throw e;
      }
    } else {
      ds.remove(localDelete);
    }
  }

  // expert 删除
  @Bind()
  async deleteExpertLines(ds = {}) {
    const selecteds = ds.selected || [];
    if (isEmpty(selecteds)) {
      return;
    }
    const remoteDelete = selecteds.filter((item) => (item.data || {}).evaluateExpertId);
    const localDelete = selecteds.filter((item) => !(item.data || {}).evaluateExpertId);

    if (!isEmpty(remoteDelete)) {
      const deleteParams = {
        evaluateIndics: this.getEvaluateIndics(),
      };
      // ds.delete()第一个参数 如果接受对象，则走查询接口 非删除接口
      // 用state存储删除数据，transport读取
      ds.setState('deleteParams', deleteParams);
      ds.delete(remoteDelete, {
        title: intl.get('ssrc.common.message.tip').d('提示'),
        children: intl
          .get('hzero.c7nProUI.DataSet.delete_selected_row_confirm')
          .d('确认删除选中行？'),
      }).then((res) => {
        const result = getResponse(res);
        if (result && result.success) {
          this.handleAssignedExpertInfo(result.content?.[0]);
          ds.unSelectAll();
          this.fetchExpert();
        }
      });
    } else {
      ds.remove(localDelete);
    }
  }

  /**
   * 清除ds缓存方法
   * @param {*} ds
   */
  clearDsCached(ds) {
    ds.reset();
    ds.loadData([]);
    ds.clearCachedSelected();
    ds.clearCachedModified();
    ds.clearCachedRecords();
  }

  /**
   * 切换模板 清除表格数据、清除ds缓存
   * @param {object} newHeaderData - 切换模板新数据
   */
  @Bind()
  resetStateAndClearTableData(newHeaderData = {}) {
    const { remote: remoteBox } = this.props;
    const industryVisible = remoteBox
      ? remoteBox.process(
          'SSRC_INQUIRYHALLNEW_UPDATE_PROCESS_INDUSTRYVISIBLE',
          newHeaderData.sourceMethod !== 'INVITE',
          { sourceMethod: newHeaderData.sourceMethod, rfxInfoDS: this.RfxInfoDS }
        )
      : newHeaderData.sourceMethod !== 'INVITE';
    if (industryVisible) {
      this.clearDsCached(this.SupplierListTableDS);
    }

    this.clearDsCached(this.NoneExpertTableDS);
    this.clearDsCached(this.AllExpertTableDS);
    this.clearDsCached(this.BusinessScoringElementDS);
    this.clearDsCached(this.TechnologyScoringElementDS);
    this.clearDsCached(this.AllScoringElementDS);
    this.clearDsCached(this.PrequalScoreElementDS);
    this.clearDsCached(this.InitialReviewDS);

    if (remoteBox?.event) {
      remoteBox.event.fireEvent('remoteResetStateAndClearTableEvent', {
        bidFlag: this.bidFlag,
        priceScoringElementDS: this.PriceScoringElementDS,
        clearDsCached: this.clearDsCached,
        supplierListTableDS: this.SupplierListTableDS,
        newHeaderData,
      });
    }

    this.mergeTypeEditorFlag = false;
  }

  // 是否是新竞价
  isNewBiddingFlag = (newTemplateData) => {
    const { biddingHallFlag } = this.state;
    const { sourceCategory, biddingFlag } =
      newTemplateData || this.RfxInfoDS?.current?.get(['sourceCategory', 'biddingFlag']) || {};
    return sourceCategory === 'RFA' && biddingFlag && biddingHallFlag;
  };

  // 刷新附件列表
  refreshAttachmentTemplateList = (headerData) => {
    const { fileTemplateManageFlag } = this.state;
    const fileTemplateAttachmentDs = this.bidFileTemplateAttachmentRef?.current
      ?.fileTemplateAttachmentDs;
    if (fileTemplateManageFlag === 1 && fileTemplateAttachmentDs) {
      const { templateId, rfxHeaderId } = headerData || {};
      fileTemplateAttachmentDs.setQueryParameter('templateId', templateId);
      fileTemplateAttachmentDs.setQueryParameter('sourceId', rfxHeaderId);
      fileTemplateAttachmentDs.query();
    }
    const { remote: remoteBox } = this.props;
    if (remoteBox?.event) {
      remoteBox.event.fireEvent('remoteRefreshAttachmentTemplateList', {
        that: this,
        headerData,
        fileTemplateManageFlag,
      });
    }
  };

  // 改变寻源模板
  changeSourceTemplate = async (
    queryParams = {},
    newHeaderData = {},
    dynamicData = {},
    optionsData = {}
  ) => {
    const { sourceKey, remote: remoteBox } = this.props;
    const { resetSourceLovData = () => {} } = optionsData || {};
    this.togglePageLoading(true);

    try {
      let result = await changeSourceTemplateIntegrate({
        ...queryParams,
        customizeUnitCode: `SSRC.${sourceKey}_HALL.NEW_EDIT.INFO_V2,SSRC.${sourceKey}_HALL.NEW_EDIT.ORG_DEMAND_V2,SSRC.${sourceKey}_HALL.NEW_EDIT.ORG_EXEC_V2,SSRC.${sourceKey}_HALL.NEW_EDIT.RFX_DEMAND_PREQUAL_V2,SSRC.${sourceKey}_HALL.NEW_EDIT.RFX_DEM_QUOTE_V2,SSRC.${sourceKey}_HALL.NEW_EDIT.RFXPREPARE,SSRC.${sourceKey}_HALL.NEW_EDIT.SOURCE_METHOD,SSRC.${sourceKey}_HALL.NEW_EDIT.RFQ_ATTACHMENT_FORM,SSRC.${sourceKey}_HALL.NEW_EDIT.INITIAL_REVIEW_FORM,SSRC.${sourceKey}_HALL.NEW_EDIT.BUSINESS_REQUEST,SSRC.${sourceKey}_HALL.NEW_EDIT.BIDDING_TIME`,
      });
      result = getResponse(result);
      if (!result) {
        this.togglePageLoading(false);
        resetSourceLovData();
        return;
      }

      runInAction(() => {
        this.resetStateAndClearTableData(newHeaderData);

        const { flowNodeDTOList = [], rfxMemberList = [], rfxHeaderDTO = {}, SourceNotice = {} } =
          result || {};

        // 针对于竞价大厅需要重新设置的一些竞价时间的初始值
        let newBiddingValue = {};
        if (this.isNewBiddingFlag(newHeaderData)) {
          newBiddingValue = this.setNewBiddingValue({
            queryParams,
            newHeaderData,
            rfxHeaderDTOFromInterface: rfxHeaderDTO,
          });
        }

        const headerData = {
          ...newHeaderData,
          ...rfxHeaderDTO,
          ...dynamicData,
          ...(newBiddingValue || {}),
          sourceNodes: flowNodeDTOList,
          projectLineSections: newHeaderData?.projectLineSections,
        };

        this.refreshAttachmentTemplateList(headerData);

        const remoteHeaderData = remoteBox
          ? remoteBox.process(
              'SSRC_INQUIRYHALLNEW_UPDATE_PROCESS_OTHER_HEADER_DATA',
              {},
              {
                optionsData,
                headerObj: headerData,
                rfxInfoDS: this.RfxInfoDS,
              }
            )
          : {};

        const headerObj = {
          ...headerData,
          ...(remoteHeaderData || {}),
          // paymentTermFlag: null,
        };

        const otherFunc = remoteBox
          ? remoteBox.process('SSRC_INQUIRYHALLNEW_UPDATE_PROCESS_OTHER_ACTION_INSERT', null, {
              headerObj,
              optionsData,
              bidFlag: this.bidFlag,
              rfxInfoDS: this.RfxInfoDS,
            })
          : null;
        if (typeof otherFunc === 'function') {
          otherFunc();
        }
        this.setQueryParameterDS(headerObj);
        this.handleTempalteChange(headerObj);
        this.updateBidMemberFields(rfxMemberList, false);
        this.addRFXField(headerObj, 'changeTemplate');
        this.fetchPrequalGroup(headerObj);
        this.SourceNoticeDS.loadData([SourceNotice]);

        this.setQuotationFormRef({});
        this.setState({ quotationFormRefControl: false }, () => {
          this.setState({ quotationFormRefControl: true });
        });
        this.updateBiddingHallValueAfterRerender();
        if (headerObj?.roundQuotationRule?.includes?.('AUTO')) {
          if (headerObj.startQuotationRunningDuration) {
            this.RfxInfoDS?.current?.set('quotationDay', null);
            this.RfxInfoDS?.current?.set('quotationHour', null);
            this.RfxInfoDS?.current?.set('quotationMinute', null);
            this.RfxInfoDS?.current?.set('startQuotationRunningDuration', null);
          }
          if (headerObj.quotationRunningDuration) {
            this.RfxInfoDS?.current?.set('biddingRunnintDay', null);
            this.RfxInfoDS?.current?.set('biddingRunnintHour', null);
            this.RfxInfoDS?.current?.set('biddingRunnintMinute', null);
            this.RfxInfoDS?.current?.set('quotationRunningDuration', null);
          }
        }

        if (!headerObj?.startQuotationRunningDuration) {
          this.RfxInfoDS?.current?.set('quotationDay', null);
          this.RfxInfoDS?.current?.set('quotationHour', null);
          this.RfxInfoDS?.current?.set('quotationMinute', null);
        }

        if (!headerObj?.quotationRunningDuration) {
          this.RfxInfoDS?.current?.set('biddingRunnintDay', null);
          this.RfxInfoDS?.current?.set('biddingRunnintHour', null);
          this.RfxInfoDS?.current?.set('biddingRunnintMinute', null);
          this.RfxInfoDS?.current?.set('quotationRunningDuration', null);
        }
      });

      // 切换模板后二开逻辑
      if (remoteBox?.event) {
        const remoteResult = await remoteBox.event.fireEvent('remoteChangeTemplateLovLateEvent', {
          rfxInfoDS: this.RfxInfoDS,
          bidFlag: this.bidFlag,
          that: this,
          saveInquiryHallUpdateVTwo,
          result,
        });

        if (remoteResult === false) {
          return remoteResult;
        }
      }
    } catch (e) {
      throw e;
    } finally {
      this.togglePageLoading(false);
    }
  };

  updateBiddingHallValueAfterRerender = () => {
    const { current } = this.RfxInfoDS;
    if (!current) {
      return;
    }

    const { biddingMode } = current ? current.get(['biddingMode']) : {};

    if (biddingMode === 'JAPANESE_BIDDING' || biddingMode === 'DUTCH_BIDDING') {
      current.set({
        biddingTotalPricePrinciple: 'TOTAL_PRICE_REQUIRED',
        startingBiddingRunningDurationFlag: 0,
        quotationRunningDurationFlag: 0,
      });
    }
  };

  // 竞价大厅-新竞价进入页面需要重新计算所有时间值
  initCalculateBiddingTime = (header) => {
    this.initBiddingHallRunningDurationTime(header);
    calculateLatterFieldTime({ record: this.RfxInfoDS.current, name: 'signInStartDate' });
    this.validateFormRefFields(this.biddingTimerRef);
  };

  // 设置竞价时间的一些初始值
  setNewBiddingValue = (payload) => {
    const {
      queryParams, // 头id，公司id，模板id等一些字段
      newHeaderData, // 处理后新的整合头数据
      rfxHeaderDTOFromInterface, // 调用切换模板接口之后的
    } = payload || {};
    const { rfxHeaderId } = queryParams || {};
    const {
      // quotationOrderType, // 报价次序
      biddingTarget,
      autoDeferFlag,
      biddingQuotationOrder,
      biddingQuotationOrderMeaning,
    } = newHeaderData || {};
    // 切到新竞价时 后端也清空了一些字段，需要刷新物料行
    this.ItemLineTableDS.query();

    // 如果是新建单子，需要将报价次序特殊处理赋值
    let quotationOrderTypeObj = {};
    if (!rfxHeaderId) {
      quotationOrderTypeObj = {
        quotationOrderType: biddingQuotationOrder,
        quotationOrderTypeMeaning: biddingQuotationOrderMeaning,
      };
    } else {
      // 否则 取切换模板接口里的
      const { quotationOrderType, quotationOrderTypeMeaning } = rfxHeaderDTOFromInterface || {};
      quotationOrderTypeObj = {
        quotationOrderType,
        quotationOrderTypeMeaning,
      };
    }

    return {
      signInStartFlag: 0,
      signInRunningDurationFlag: 1,
      startingTrialBiddingStartFlag: 0,
      startingTrialBiddingRunningDurationFlag: 1,
      startFlag: 0,
      startingBiddingRunningDurationFlag: 1,
      biddingSupplementPriceStartFlag: autoDeferFlag ? 1 : 0,
      biddingSupplementPriceRunningDurationFlag: autoDeferFlag ? 1 : 0,
      floatType: biddingTarget === 'TOTAL_PRICE' ? 'money' : null,
      biddingTotalPricePrinciple: biddingTarget === 'TOTAL_PRICE' ? 'UNIT_PRICE_REQUIRED' : null,
      ...quotationOrderTypeObj,
    };
  };

  // 询价切到新竞价 新竞价切到询价 新竞价切到新竞价 需要清空的字段
  resetRfxInfoFields = (options = {}) => {
    const record = this.RfxInfoDS?.current;
    if (!record) return;

    const {
      oldHeaderInfoData,
      newTemplateData, // 当前模板
      oldTemplateData, // 新模板
    } = options || {};

    // quotationOrderType-模板中使用的这个字段，页面上使用的是quotationOrderType字段
    const { sourceCategory, biddingFlag } = newTemplateData || {};

    const { sourceCategory: oldSourceCategory, biddingFlag: oldBiddingFlag } =
      oldHeaderInfoData || {};

    // 当前模板是否新竞价
    const newBiddingFlagFromCurTemplate =
      sourceCategory === 'RFA' && (biddingFlag === 1 || biddingFlag === '1');

    // 老模板是否新竞价
    const newBiddingFlagFromOldTemplate = oldSourceCategory === 'RFA' && oldBiddingFlag === 1;

    // 清除竞价大厅时间字段
    const resetNewBiddingTimeData = {
      signInStartDate: null,
      signInEndDate: null,
      signInRunningDuration: null,
      signInRunningDay: null,
      signInRunningHour: null,
      signInRunningMinute: null,
      startingTrialBiddingStartDate: null,
      startingTrialBiddingEndDate: null,
      startingTrialBiddingRunningDuration: null,
      startingBiddingRunningDay: null,
      startingBiddingRunningHour: null,
      startingBiddingRunningMinute: null,
      quotationStartDate: null,
      quotationRunningDuration: null,
      quotationEndDate: null,
      startingBiddingRunningDuration: null,
      biddingRunnintDay: null,
      biddingRunnintMinute: null,
      biddingRunnintHour: null,
      quotationInterval: null,
      biddingSupplementPriceStartDate: null,
      biddingSupplementPriceEndDate: null,
      biddingSupplementPriceRunningDuration: null,
      biddingSupplementPriceRunnintDay: null,
      biddingSupplementPriceRunnintHour: null,
      biddingSupplementPriceRunnintMinute: null,
    };

    // 新竞价 -> 询价
    if ((newBiddingFlagFromOldTemplate && !newBiddingFlagFromCurTemplate) || !newTemplateData) {
      // 或者清空模板时
      /**
       * 如果原本是新竞价的寻源模板切换别的寻源模板，需要清空以下字段并带出新模板里维护的对应值：
        基础信息：币种
        对供应商要求：保证金、招标文件费、付款方式、付款条款
        物料行：浮动方式、起竞价、报价幅度、安全价
        竞价要求：签到开始时间、签到截止时间、试竞价开始时间、试竞价截止时间、竞价开始时间、竞价截止时间、报价间隔时间、报价方式、报价类型、报价次序、出价策略、公开规则、竞价规则、排名规则、启用自动延时、延时触发时间段、延时触发规则、延时时间规则、延时时长、延时总时长限制、最大延时次数、允许报价次数、密封报价、匿名报价、浮动方式、起竞价、报价幅度、安全价
       */
      return {
        ...(oldHeaderInfoData || {}),
        ...resetNewBiddingTimeData,
        // 对供应商要求
        paymentTypeLov: null,
        paymentTypeId: null,
        paymentTypeName: null,
        paymentTermLov: null,
        paymentTermName: null,
        paymentTermId: null,
        // 竞价要求
        quotationType: null,
        biddingTarget: null,
        quotationOrderType: null,
        biddingStrategy: null,
        openRule: null,
        auctionRule: null,
        rankRule: null,
        autoDeferFlag: 0,
        autoDeferPeriod: null,
        autoDeferTimeRule: null,
        autoDeferType: null,
        // 延时时间规则 没找到
        autoDeferDuration: null,
        // 延时总时长限制 没找到
        maxDeferCount: null,
        biddingAllowedQuotationCount: null,
        sealedQuotationFlag: 0,
        // 匿名报价 没找到
        floatType: null,
        startingBiddingPrice: null,
        quotationRange: null,
        safePrice: null,
        biddingFlag: 0,
      };
    } else if (
      (!newBiddingFlagFromOldTemplate && newBiddingFlagFromCurTemplate) ||
      (!oldTemplateData && newBiddingFlagFromCurTemplate)
    ) {
      // 询价 -> 新竞价 或者 从没有模板到新竞价
      /**
       * 如果原本是询价，选择的是新竞价的寻源模板，需要清空以下字段并带出新模板里维护的对应值：
        物料行：启用阶梯报价、阶梯报价、报价模板、报价明细
        报价要求：发布即开始、报价运行时间、报价开始时间、报价结束时间、密封报价、启用开标密码、开标员、报价方式、币种、允许多币种报价、报价范围、付款方式、付款条款、最少报价供应商数、允许供应商修改税率、允许修改付款条款方式、招标文件费、是否收取服务费、保证金、是否集采、允许供应商修改可供数量、允许供应商自定义阶梯报价、允许供应商连续报价、寻源事项说明、澄清截止时间
       */
      // 物料行 需要后端清除
      return {
        ...(oldHeaderInfoData || {}),
        ...resetNewBiddingTimeData,
        startQuotationRunningDuration: null,
        quotationDay: null,
        quotationHour: null,
        quotationMinute: null,
        passwordFlag: 0,
        openBidLov: null,
        quotationType: null,
        multiCurrencyFlag: 0,
        quotationScope: null,
        paymentTypeLov: null,
        paymentTypeId: null,
        paymentTypeName: null,
        paymentTermLov: null,
        paymentTermName: null,
        paymentTermId: null,
        minQuotedSupplier: 0,
        taxChangeFlag: 0,
        paymentTermFlag: 0,
        // 字段没找到 是否收取服务费
        centralPurchaseFlag: 0,
        quantityChangeFlag: 0,
        diyLadderQuotationFlag: 0,
        continuousQuotationFlag: 0,
        matterDetail: null,
        clarifyEndDate: null,
        autoDeferType: null,
      };
    } else if (newBiddingFlagFromOldTemplate && newBiddingFlagFromCurTemplate) {
      // 新竞价 -> 新竞价
      /**
       * 如果原本是新竞价的寻源模板切换新竞价的寻源模板，需要将寻源模板的值覆盖原有值，清空以下字段：
         竞价要求：签到开始时间、签到截止时间、试竞价开始时间、试竞价截止时间、竞价开始时间、竞价截止时间、报价间隔时间
       */
      return {
        ...(oldHeaderInfoData || {}),
        ...resetNewBiddingTimeData,
      };
    } else {
      return oldHeaderInfoData;
    }
  };

  // 老数据切换寻源模板-页面操作
  handleTempalteChange(newHeaderData = {}) {
    const { biddingHallFlag } = this.state;
    const record = this.RfxInfoDS?.current;

    let enableScoreFlag = 0;
    const { preQualificationFlag = 0, sourceCategory, biddingFlag } = newHeaderData || {};

    if (record) {
      enableScoreFlag = record.get('enableScoreFlag');
      // 新竞价单 特殊处理报价次序
      const newBiddingFlag = sourceCategory === 'RFA' && biddingFlag && biddingHallFlag;
      if (newBiddingFlag) {
        const { quotationOrderType } = newHeaderData || {};
        record.set({
          quotationOrderType,
          quotationOrderTypeMeaning: null,
        });
      }
    }

    if (preQualificationFlag && enableScoreFlag) {
      this.PrequalScoreElementDS.query(); // 预审-启用评分细项
    }
  }

  // 询价单标题change
  @Bind()
  changeRfxTitle(value = null) {
    if (!this.RfxInfoDS.current || !this.SourceNoticeDS.current) {
      return;
    }

    const oldNoticeTitle = this.SourceNoticeDS?.current?.get('noticeTitle') || null;
    if (oldNoticeTitle) {
      return;
    }

    const Common = intl.get('ssrc.inquiryHall.view.message.panel.rfxNotice').d('寻源公告');
    const noticeTitle = value + Common;

    this.SourceNoticeDS?.current?.set('noticeTitle', noticeTitle);
    this.forceUpdate();
  }

  // FIXED 两个个性化单元同名字段前端无法对比最新值，故先去除，后期方案制定
  // 筛选attribute* value = null field
  filterNullAttributeFields(data = {}) {
    const newData = {};
    if (isEmpty(data)) {
      return newData;
    }

    Object.keys(data).forEach((key = {}) => {
      if (!key) {
        return;
      }
      const isAttributeField = !!key.match(FilterAttribute);
      const value = data[key];

      if (isAttributeField && value === null) {
        return;
      }

      newData[key] = value;
    });

    return newData;
  }

  /**
   * 设置前端自定义时间字段，用于与当前时间的校验
   */
  @Bind()
  setCurrentTimeValue() {
    this.RfxInfoDS?.current?.set('ssrcCustomCurrentNewDateTime', new Date());
  }

  @Bind()
  getChangeTemplateTip() {
    const { fileTemplateManageFlag } = this.state;
    return fileTemplateManageFlag
      ? intl
          .get('ssrc.inquiryHall.view.inquiryHall.changeTemplateFileManageTip')
          .d('是否确认改变寻源模板？确认后附件列表将会被覆盖显示为新模板的附件要求内容。')
      : intl
          .get('ssrc.inquiryHall.view.inquiryHall.confirmChangeTemplate')
          .d('是否确认改变寻源模板');
  }

  /**
   * 切换寻源模板
   * bind 请勿去掉，不然会影响埋点二开调用
   * @protected 此方法被 [永祥] 二开调用, 禁止修改方法名, 谨慎修改逻辑
   */
  @Bind()
  changeSourceTemplateLov(data = {}, oldValue = {}) {
    const { current } = this.RfxInfoDS;
    if (!current) {
      return;
    }
    this.setCurrentTimeValue();

    const {
      organizationId,
      match: { params = {} },
    } = this.props;
    const { rfxId = null } = params || {};
    const {
      templateId = null,
      qualificationType = 'NONE',
      sealedQuotationFlag = '0',
      freightIncludedFlag = 0,
      taxId = null,
      taxRate = null,
      taxIncludedFlag = 0,
      // initialReview = null,
      // sourceMethod = null,
      passwordFlag = 0,
      sourceCategory = null,
      secondarySourceCategory = null,
    } = data || {};
    const { templateId: oldId = null, templateName: oldName = null } = oldValue || {};
    const { header = {}, biddingHallFlag } = this.state;
    // 计算运行时间
    this.computeRunningDuration();
    let oldInfoData = current.toData() || {};
    const { quotationOrderType = null, quotationOrderTypeMeaning = null } = oldInfoData;
    const olderTemplateId = current.getPristineValue('templateId');
    const preQualificationFlag = qualificationType === 'PRE' ? 1 : 0; // 资格预审
    // XXX, 临时字段覆盖, 后续可以优化
    const dynamicData = {
      preQualificationFlag,
      // initialReview, // 控制符合性检查(初审评审)
      // startFlag: preQualificationFlag ? 0 : 1,
      templateFreightIncludedFlag: freightIncludedFlag,
      templateTaxIncludedFlag: taxIncludedFlag,
      templateTaxId: taxId,
      templateTaxRate: taxRate,
    };
    if (preQualificationFlag) {
      dynamicData.startFlag = 0;
    }
    if (sourceCategory === 'RFA' || secondarySourceCategory === 'RFA') {
      dynamicData.quotationOrderType = quotationOrderType;
      dynamicData.quotationOrderTypeMeaning = quotationOrderTypeMeaning;
    }

    if (biddingHallFlag) {
      // 开启竞价大厅-重置一些字段
      oldInfoData = this.resetRfxInfoFields({
        oldHeaderInfoData: oldInfoData,
        newTemplateData: data, // 当前模板
        oldTemplateData: oldValue, // 上一个模板
      });
    }

    const reallyData = this.filterNullAttributeFields(data) || {};
    const temporaryHeader = {
      ...header,
      ...(oldInfoData || {}),
      ...reallyData,
      ...{
        objectVersionNumber: null,
        creationDate: null,
        createdBy: null,
        lastUpdatedBy: null,
        lastUpdateDate: null,
      },
    };
    const unitId = current?.get('unitId') || null;
    const companyId = current?.get('companyId') || null;
    const purOrganizationId = current?.get('purOrganizationId') || null;
    const rfxHeaderId = rfxId && rfxId !== 'null' ? rfxId : null;
    const queryParams = {
      organizationId,
      unitId,
      companyId,
      sealedQuotationFlag,
      templateId,
      rfxHeaderId,
      passwordFlag,
      purOrganizationId,
    };

    // reset lov data
    const resetSourceLovData = () => {
      current?.set('sourceTemplateLov', {
        templateId: oldId,
        templateName: oldName,
      });
    };
    const optionsData = {
      resetSourceLovData,
      newTemplateData: data,
      oldTemplateData: oldInfoData, // 上一个寻源模板数据
    };

    if (!rfxHeaderId) {
      this.changeSourceTemplate(queryParams, temporaryHeader, dynamicData, optionsData);
    } else if (templateId && olderTemplateId && templateId !== olderTemplateId) {
      Modal.confirm({
        title: intl
          .get('ssrc.inquiryHall.view.inquiryHall.TemplateChangeConfirm')
          .d('寻源模板切换'),
        children: this.getChangeTemplateTip(),
        onOk: async () => {
          const handleOkRes = await this.changeSourceTemplate(
            queryParams,
            temporaryHeader,
            dynamicData,
            optionsData
          );
          return handleOkRes;
        },
        onCancel: () => {
          resetSourceLovData();
        },
      });
    } else {
      this.changeSourceTemplate(queryParams, temporaryHeader, dynamicData, optionsData);
    }

    this.forceUpdate();
  }

  // 修改标段编号lov
  @Bind()
  changeSectionNameLov(data = {}, oldValue = {}) {
    if (isEmpty(data)) return;
    const {
      organizationId,
      match: { params = {} },
    } = this.props;
    const { rfxId = null } = params;
    const { header = {} } = this.state;
    const oldInfoData = this.RfxInfoDS.current.toData() || {};
    const { industryData = null, industryCategoryData = null } =
      this.getIndustryAndCategoryData(oldInfoData) || {};
    const rfxHeaderId = rfxId && rfxId !== 'null' ? rfxId : null;
    const olderSectionId = this.RfxInfoDS.current.getPristineValue('projectLineSectionId');
    const temporaryHeader = {
      ...header,
      ...oldInfoData,
      industryData,
      industryCategoryData,
      ...data,
      referenceSectionId: data.projectLineSectionId,
      ...{
        objectVersionNumber: null,
        creationDate: null,
        createdBy: null,
        lastUpdatedBy: null,
        lastUpdateDate: null,
      },
    };
    const newData = {
      organizationId,
      rfxHeaderDTO: temporaryHeader,
    };
    const { projectLineSectionId = null } = data || {};
    const { sectionName, sectionCode } = oldValue || {};
    if (!rfxHeaderId) {
      this.handleChangeSectionNameLov(newData, oldValue);
    } else if (projectLineSectionId && olderSectionId && projectLineSectionId !== olderSectionId) {
      Modal.confirm({
        title: intl.get('ssrc.inquiryHall.view.inquiryHall.changeProjectLineSection').d('切换标段'),
        children: (
          <span>
            {intl
              .get('ssrc.inquiryHall.view.inquiryHall.sureChangeProjLineSec')
              .d('是否确认改变标段')}
            ？
          </span>
        ),
        okProps: {
          // override ui, ok button background color
          style: {
            background: '#29BECE',
          },
        },
        onOk: () => {
          this.handleChangeSectionNameLov(newData, oldValue);
        },
        onCancel: () => {
          this.RfxInfoDS?.current?.set('sectionNameLov', {
            sectionCode,
            sectionName,
          });
        },
      });
    } else {
      this.handleChangeSectionNameLov(newData, oldValue);
    }
  }

  /**
   * 修改标段
   */
  @Bind()
  handleChangeSectionNameLov(data, oldData) {
    const { sectionName, sectionCode } = oldData || {};
    changeSectionNameLov(data).then((res) => {
      const result = getResponse(res);
      if (!result) {
        this.togglePageLoading();
        this.RfxInfoDS?.current?.set('sectionNameLov', {
          sectionCode,
          sectionName,
        });
        return;
      }
      this.fetchInquiryHallUpdate();
    });
  }

  // 改变公司
  @Bind()
  changeCompanyLov(data = {}, oldValue = {}) {
    const {
      remote: remoteBox,
      organizationId,
      match: { params = {} },
    } = this.props;
    const { rfxId = null } = params || {};
    const { companyId = null, companyName = null, currencyCode, currencyId } = data || {};
    const { companyId: oldId = null, companyName: oldName = null } = oldValue || {};
    const { current: rfxInfoCurrent } = this.RfxInfoDS || {};
    const templateId = this.RfxInfoDS?.current?.get('templateId');
    // const oldCompanyId = this.RfxInfoDS.current.getPristineValue('companyId');

    const companyIdDifference = oldId !== companyId;

    if (remoteBox?.event) {
      remoteBox.event.fireEvent('remoteChangeCompanyEvent', {
        companyId,
        oldComPanyId: oldId,
        rfxInfoDS: this.RfxInfoDS,
        bidFlag: this.bidFlag,
        that: this,
      });
    }

    if (!this.RfxInfoDS.current || !companyId) {
      this.RfxInfoDS?.current?.set('matterRequireFlag', 0);
      return;
    }

    // 当询价单为新建时，编辑了公司字段后，对应的币种字段默认值也会随之变为该公司的缺省币种，保存后不再变更
    if (this.isNewRfx() && currencyCode && currencyId) {
      this.RfxInfoDS?.current?.set('currencyLov', {
        currencyCode,
        currencyId,
      });
    }

    if (!templateId) {
      notification.warning({
        message: intl
          .get('ssrc.inquiryHall.view.inquiryHall.view.selectTemplateFirst')
          .d('请先选择寻源模板,保证查询到新公司的寻源小组信息'),
      });

      if (remoteBox?.event) {
        remoteBox.event.fireEvent('remoteChangeCompanyNoTemplateEvent', {
          itemLineTableDS: this.ItemLineTableDS,
          data,
          rfxInfoDS: this.RfxInfoDS,
          bidFlag: this.bidFlag,
          that: this,
        });
      }

      return;
    }

    const {
      sealedQuotationFlag,
      unitId,
      purOrganizationId,
      multiSectionFlag,
      ouId: oldOuId = null,
      ouName: oldOuName = null,
      invOrganizationName: oldInvOrganizationName = null,
      invOrganizationId: oldInvOrganizationId = null,
    } = rfxInfoCurrent
      ? rfxInfoCurrent?.get([
          'sealedQuotationFlag',
          'unitId',
          'purOrganizationId',
          'multiSectionFlag',
          'ouId',
          'ouName',
          'invOrganizationName',
          'invOrganizationId',
        ])
      : {};
    const changeCompanyParams = {
      companyId,
      unitId,
      organizationId,
      templateId,
      rfxHeaderId: rfxId,
      sealedQuotationFlag: sealedQuotationFlag === '1' ? 1 : 0,
      purOrganizationId,
    };

    const newChangeCompanyParams = {
      companyId,
      companyName,
      organizationId,
      rfxHeaderId: rfxId,
    };

    if (!multiSectionFlag) {
      newChangeCompanyParams.rfxLineItemList = this.ItemLineTableDS.toJSONData();
    }

    const handleChangeCompany = () => {
      newChangeCompany(newChangeCompanyParams).then(
        action((res) => {
          const result = getResponse(res);
          if (!result) {
            return;
          } else {
            notification.success();
          }
          const { objectVersionNumber = null, matterRequireFlag = 0 } = res || {};
          const { current } = this.RfxInfoDS;
          current?.set('objectVersionNumber', objectVersionNumber);
          this.changeSourceMemberGroup(changeCompanyParams);
          this.clearDsCached(this.ItemLineTableDS);
          this.clearDsCached(this.SupplierListTableDS);
          current?.set('companyId', companyId);
          current?.set('companyName', companyName);
          if (remoteBox?.event) {
            remoteBox.event.fireEvent('clearUnit', {
              current,
              data,
              bidFlag: this.bidFlag,
            });
          }
          // current?.set('unitId', null);
          // current?.set('unitName', null);
          // current?.set('currencyLov', {
          //   currencyCode,
          //   currencyId,
          // });
          current?.set('matterRequireFlag', matterRequireFlag);

          if (this.isNewBiddingFlag()) {
            current?.set({
              currencyLov: {
                currencyCode,
                currencyId,
              },
            });
          }

          this.SupplierListTableDS.setQueryParameter('company', {
            companyId,
          });
          this.ItemLineTableDS.setQueryParameter('company', {
            companyId,
          });
          this.BatchCreateItemDS.setQueryParameter('company', {
            companyId,
          });
          this.ItemLineTableDS.query();
          if (remoteBox?.event) {
            remoteBox.event.fireEvent('remoteSupplierTableQueryEvent', {
              rfxInfoDS: this.RfxInfoDS,
              supplierListTableDS: this.SupplierListTableDS,
              that: this,
            });
          }
          this.refreshRfxHeaderSectionInfo();
        })
      );
    };

    const handleChangeCompanyNotCreate = () => {
      // 将新建删除物料行方法提取
      const removeItemLine = () => {
        this.ItemLineTableDS.forEach((record) => {
          if (record.get('ouId') || record.get('ouId') === 0) {
            this.ItemLineTableDS.remove(record);
          }
        });
      };

      if (remoteBox?.event) {
        remoteBox.event.fireEvent('removeItemLine', {
          removeItemLine,
        });
      } else {
        removeItemLine();
      }
      if (remoteBox?.event) {
        remoteBox.event.fireEvent('remoteChangeCompanyNotCreateEvent', {
          itemLineTableDS: this.ItemLineTableDS,
          data,
          rfxInfoDS: this.RfxInfoDS,
          bidFlag: this.bidFlag,
          that: this,
        });
      }
    };

    const setItemAndSupplierTable = () => {
      this.SupplierListTableDS.setQueryParameter('company', {
        companyId,
      });
      this.ItemLineTableDS.setQueryParameter('company', {
        companyId,
      });
      this.BatchCreateItemDS.setQueryParameter('company', {
        companyId,
      });
    };

    if (this.isNewRfx()) {
      this.companyConfigCenter(changeCompanyParams);
      this.changeSourceMemberGroup(changeCompanyParams);
      setItemAndSupplierTable();

      /**
       * 切换公司后，不必带出关联业务实体和库存信息信息
       * */
      if (companyIdDifference) {
        const newCompanyRelationData = {
          ouId: null,
          ouName: null,
          invOrganizationId: null,
          invOrganizationName: null,
        };

        rfxInfoCurrent?.set(newCompanyRelationData);
      }

      if (oldId !== companyId && this.ItemLineTableDS?.length) {
        // 切换公司弹框提示
        const newRfxOpenModal = () => {
          Modal.confirm({
            title: intl.get('hzero.common.message.confirm.title').d('提示'),
            children: (
              <span>
                {intl
                  .get('ssrc.inquiryHall.message.confirm.contiueChangeCompany')
                  .d('切换公司后，会将不在该公司下的物料行清空，是否继续切换？')}
              </span>
            ),
            onOk: () => handleChangeCompanyNotCreate(),
            onCancel: () => {
              this.RfxInfoDS?.current?.set('companyLov', {
                companyId: oldId,
                companyName: oldName,
              });
              rfxInfoCurrent?.set({
                ouId: oldOuId,
                ouName: oldOuName,
                invOrganizationId: oldInvOrganizationId,
                invOrganizationName: oldInvOrganizationName,
              });
              if (remoteBox?.event) {
                remoteBox.event.fireEvent('remoteCancelChangeCompanyEvent', {
                  rfxInfoDS: this.RfxInfoDS,
                  that: this,
                });
              }
            },
          });
        };

        if (remoteBox?.event) {
          remoteBox.event.fireEvent('newRfxOpenModal', {
            openModal: newRfxOpenModal,
            handleChangeCompanyNotCreate,
            rfxInfoDS: this.RfxInfoDS,
          });
        } else {
          newRfxOpenModal();
        }
        return;
      }
      if (remoteBox?.event) {
        remoteBox.event.fireEvent('remoteChangeCompanyNoItemEvent', {
          data,
          rfxInfoDS: this.RfxInfoDS,
          bidFlag: this.bidFlag,
          that: this,
        });
      }
    } else if (oldId !== companyId) {
      // 切换公司弹框提示
      const updateRfxOpenModal = () => {
        Modal.confirm({
          title: intl.get('hzero.common.message.confirm.title').d('提示'),
          children: (
            <span>
              {intl
                .get('ssrc.inquiryHall.message.confirm.contiueChangeCompany')
                .d('切换公司后，会将不在该公司下的物料行清空，是否继续切换？')}
            </span>
          ),
          onOk: () => handleChangeCompany(),
          onCancel: () => {
            this.RfxInfoDS?.current?.set('companyLov', {
              companyId: oldId,
              companyName: oldName,
            });
            if (remoteBox?.event) {
              remoteBox.event.fireEvent('remoteCancelChangeCompanyEvent', {
                rfxInfoDS: this.RfxInfoDS,
                that: this,
              });
            }
          },
        });
      };

      if (remoteBox?.event) {
        remoteBox.event.fireEvent('updateRfxOpenModal', {
          openModal: updateRfxOpenModal,
          handleChangeCompany,
          rfxInfoDS: this.RfxInfoDS,
          that: this,
        });
      } else {
        updateRfxOpenModal();
      }
    }

    this.forceUpdate();
  }

  // 配置中心-寻源事项-公司控制
  companyConfigCenter = async (params = {}) => {
    try {
      let result = await companyConfigCenter(params);
      result = getResponse(result);
      if (!result) {
        return;
      }

      const { rfxRequireFlag = 0 } = result || {};
      this.RfxInfoDS?.current?.set('matterRequireFlag', rfxRequireFlag);
    } catch (e) {
      throw e;
    }
  };

  // lov需求部门
  @Bind()
  changeUnitLov(data = {}, oldValue = {}) {
    const { organizationId = null } = this.props;
    const { unitId } = data || {};
    const { current } = this.RfxInfoDS;
    const { companyId, sealedQuotationFlag, templateId, purOrganizationId } = current?.get([
      'companyId',
      'sealedQuotationFlag',
      'templateId',
      'purOrganizationId',
    ]);

    if (!templateId || !companyId) {
      const { unitName = null, unitId: oldUnitId = null } = oldValue || {};
      current?.set('unitLov', {
        unitId: oldUnitId,
        unitName,
      });
      notification.warning({
        message: intl
          .get('ssrc.inquiryHall.view.message.templateCompanySelectedFirst')
          .d('请先选择寻源模板和公司'),
      });
      return;
    }

    this.changeSourceMemberGroup({
      organizationId,
      unitId,
      companyId,
      sealedQuotationFlag: sealedQuotationFlag === '1' ? 1 : 0,
      templateId,
      purOrganizationId,
    });
  }

  // 改变采购组织lov
  @Bind()
  changePurOrganizationLov(data = {}, oldValue = {}) {
    const { organizationId = null } = this.props;
    const { purchaseOrgId, organizationName } = data || {};
    const { current } = this.RfxInfoDS || {};
    const { unitId, companyId, sealedQuotationFlag, templateId } = current?.get([
      'unitId',
      'companyId',
      'sealedQuotationFlag',
      'templateId',
    ]);

    if (!templateId || !companyId) {
      const {
        organizationName: oldOrganizationName = null,
        purchaseOrgId: oldPurchaseOrgId = null,
      } = oldValue || {};
      current?.set({
        purOrganizationIdLov: oldValue,
        purOrganizationId: oldPurchaseOrgId,
        purOrganizationName: oldOrganizationName,
      });
      notification.warning({
        message: intl
          .get('ssrc.inquiryHall.view.message.templateCompanySelectedFirst')
          .d('请先选择寻源模板和公司'),
      });
      return;
    }

    current?.set({
      purOrganizationId: purchaseOrgId,
      purOrganizationName: organizationName,
    });

    this.changeSourceMemberGroup({
      organizationId,
      unitId,
      companyId,
      sealedQuotationFlag: sealedQuotationFlag === '1' ? 1 : 0,
      templateId,
      purOrganizationId: purchaseOrgId,
    });
  }

  // 改变寻源小组
  async changeSourceMemberGroup(params = {}) {
    try {
      let result = await changeCompanyUnit(params);
      result = getResponse(result);
      if (!result || result.failed) {
        notification.error();
        return;
      }

      // /rfx/members/get-default-values 中的password_flag是错的，不能更新
      this.updateBidMemberFields(result, false); // 新建单据切换公司或需求部门，不需要更新passwordFlag
    } catch (e) {
      throw e;
    }
  }

  // 开标员lov
  @Bind()
  changeOpenBidLov(data = {}) {
    this.RfxInfoDS?.current?.set('openBidLov', data);
  }

  // 修改采购执行人电话号码
  @Bind()
  changePurPhone(value) {
    const { current } = this.RfxInfoDS;
    const purPhone = current?.get('purPhone') || null;
    if (!purPhone) {
      current?.set('purPhone', null);
      return;
    }
    current?.set('purPhone', value);
  }

  // mergeType 为 null, 即不分组情况
  generatePrequalHeaderMapDs({ result = {}, isCreate = true }) {
    const { organizationId } = this.props;
    const { userId = null, header = {} } = this.state;
    const { rfxHeaderId, preQualificationFlag } = header || {};
    const config = {
      userId,
      rfxHeaderId,
      organizationId,
      preQualificationFlag,
      tenantId: organizationId,
      rfxInfoDS: this.RfxInfoDS,
    };
    const prequalHeaderDs = new DataSet(prequalHeaderDS(config));
    if (isCreate) {
      prequalHeaderDs.create();
    } else {
      prequalHeaderDs.loadData([result.prequalHeaderDTO || {}]);
    }
    const prequalHeaderDsMap = {
      NONE: prequalHeaderDs,
    };
    this.setState({
      prequalHeaderDsMap,
    });
    // RfxInfoDS 的时间判断需要用到
    this.RfxInfoDS.setQueryParameter('prequalHeaderDsMap', prequalHeaderDsMap);
  }

  // 发布即开始
  @Bind()
  @action
  changeStartFlag(value = 0) {
    const { current } = this.RfxInfoDS;
    if (!value) {
      current?.set('startQuotationRunningDuration', null);
      this.RfxInfoDS?.current?.set('quotationRunningDuration', null);
      current?.set('quotationDay', null);
      current?.set('quotationHour', null);
      current?.set('quotationMinute', null);
      current?.set('biddingRunnintDay', null);
      current?.set('biddingRunnintHour', null);
      current?.set('biddingRunnintMinute', null);
    } else {
      current?.set('quotationStartDate', null);
      current?.set('quotationEndDate', null);
    }
    this.setState({ quotationFormRefControl: false }, () => {
      this.setState({ quotationFormRefControl: true });
    });
    this.forceUpdate();
  }

  /**
   * @param {*} result 数据
   * @param {*} fromWhere 来自于哪个方法的调用 init-初始化数据 changeTemplate-切换模板
   */
  @action
  addRFXField(result = {}, fromWhere = 'init') {
    const currentQuotationRounds = [];
    const { quotationRounds = null, startFlag = 0 } = result;
    const { current } = this.RfxInfoDS;
    const preQualificationFlag = current?.get('preQualificationFlag') || 0; // 资格预审

    if (quotationRounds && quotationRounds > 0) {
      for (let item = 1; item < quotationRounds + 1; item++) {
        currentQuotationRounds.push(item);
        const roundHour =
          current?.get(`roundHour${item}`) > 0 ? current?.get(`roundHour${item}`) : 0;
        const roundMinute =
          current?.get(`roundMinute${item}`) > 0 ? current?.get(`roundMinute${item}`) : 0;
        const roundDay = current?.get(`roundDay${item}`) > 0 ? current?.get(`roundDay${item}`) : 0;
        // const count = roundHour + roundMinute + roundDay;
        // current?.get(`roundHour${item}`) > 0 ? current?.get(`roundHour${item}`) : 0 此代码是为了解决复制单号复制了之前没校验的时候用户可以输入负值的单子直接提交问题
        if (!roundDay && !roundHour && !roundMinute) {
          this.RfxInfoDS?.current?.set(`roundDay${item}`, null);
          this.RfxInfoDS?.current?.set(`roundHour${item}`, null);
          this.RfxInfoDS?.current?.set(`roundMinute${item}`, null);
        }

        this.RfxInfoDS.addField(`roundQuotationRunningDuration${item}`, {
          name: `roundQuotationRunningDuration${item}`,
          type: 'number',
        });
        this.RfxInfoDS.addField(`roundDay${item}`, {
          name: `roundDay${item}`,
          type: 'number',
          placeholder: intl.get('hzero.common.date.unit.day').d('天'),
          labelWidth: 146,
          min: 0,
          step: 1,
          dynamicProps: {
            required({ record }) {
              const timeFlag =
                !record.get(`roundDay${item}`) &&
                !record.get(`roundHour${item}`) &&
                !record.get(`roundMinute${item}`);
              return record.get('startFlag') && !preQualificationFlag && timeFlag;
            },
          },
          // required: startFlag && !preQualificationFlag && !count > 0,
          disabled: preQualificationFlag || !startFlag,
          defaultValidationMessages: { valueMissingNoLabel: '' },
        });
        this.RfxInfoDS.addField(`roundHour${item}`, {
          name: `roundHour${item}`,
          type: 'number',
          min: 0,
          step: 1,
          dynamicProps: {
            required({ record }) {
              const timeFlag =
                !record.get(`roundDay${item}`) &&
                !record.get(`roundHour${item}`) &&
                !record.get(`roundMinute${item}`);
              return record.get('startFlag') && !preQualificationFlag && timeFlag;
            },
          },
          // required: startFlag && !preQualificationFlag && !count > 0,
          disabled: preQualificationFlag || !startFlag,
          defaultValidationMessages: { valueMissingNoLabel: '' },
        });
        this.RfxInfoDS.addField(`roundMinute${item}`, {
          name: `roundMinute${item}`,
          type: 'number',
          min: 0,
          step: 1,
          dynamicProps: {
            required({ record }) {
              const timeFlag =
                !record.get(`roundDay${item}`) &&
                !record.get(`roundHour${item}`) &&
                !record.get(`roundMinute${item}`);
              return record.get('startFlag') && !preQualificationFlag && timeFlag;
            },
          },
          // required: startFlag && !preQualificationFlag && !count > 0,
          disabled: preQualificationFlag || !startFlag,
        });

        this.RfxInfoDS.addField(`quotationTime${item}`, {
          name: `quotationTime${item}`,
          type: 'date',
          format: DEFAULT_DATETIME_FORMAT,
          range: [`quotationStartTime${item}`, `quotationEndTime${item}`],
          min: 'prequalEndDate',
          required: !startFlag,
          disabled: startFlag,
        });
        if (fromWhere === 'changeTemplate') {
          // 多轮切换多轮的时候清空上次id和版本号
          this.RfxInfoDS?.current?.set(`roundHeaderDateId${item}`, null);
          this.RfxInfoDS?.current?.set(`objectVersionNumber${item}`, null);
        }
      }
    }
    this.RfxDemand.setState({
      startFlag,
      currentQuotationRounds,
    });

    // 生成资格预审ds
    if (preQualificationFlag) {
      if (fromWhere !== 'init') {
        // 目前是两种情况 如果是切换模板 则创建新的资格预审
        this.generatePrequalHeaderMapDs({ result, isCreate: true });
      }
    }
  }

  /**
   * 多轮报价时间init
   * */
  @action
  initRoundQuotationDuration(header = {}) {
    const { roundHeaderDates = null } = header;
    if (!roundHeaderDates || isEmpty(roundHeaderDates)) {
      return;
    }

    if (roundHeaderDates.length > 0) {
      roundHeaderDates.forEach((item = {}) => {
        const {
          quotationRound,
          roundQuotationRunningDuration = 0,
          roundQuotationStartDate,
          roundQuotationEndDate,
          roundHeaderDateId,
          objectVersionNumber,
        } = item;
        const quoteDay = Math.floor(roundQuotationRunningDuration / 1440);
        const quoteHour =
          quoteDay > 0
            ? Math.floor((roundQuotationRunningDuration - quoteDay * 1440) / 60)
            : roundQuotationRunningDuration
            ? Math.floor(roundQuotationRunningDuration / 60)
            : roundQuotationRunningDuration;
        const quoteMinute =
          quoteHour > 0 || quoteDay > 0
            ? roundQuotationRunningDuration - quoteDay * 1440 - quoteHour * 60
            : roundQuotationRunningDuration;
        const quotationTime = {};
        quotationTime[`quotationStartTime${quotationRound}`] = roundQuotationStartDate
          ? moment(roundQuotationStartDate)
          : roundQuotationStartDate;
        quotationTime[`quotationEndTime${quotationRound}`] = roundQuotationEndDate
          ? moment(roundQuotationEndDate)
          : roundQuotationEndDate;
        const { current } = this.RfxInfoDS;
        current?.set(`roundDay${quotationRound}`, quoteDay);
        current?.set(`roundHour${quotationRound}`, quoteHour);
        current?.set(`roundMinute${quotationRound}`, quoteMinute);
        current?.set(`quotationTime${quotationRound}`, quotationTime);
        current?.set(
          `roundQuotationRunningDuration${quotationRound}`,
          roundQuotationRunningDuration
        );
        current?.set(`roundHeaderDateId${quotationRound}`, roundHeaderDateId);
        current?.set(`objectVersionNumber${quotationRound}`, objectVersionNumber);
      });
    }
  }

  // 改变多轮报价运行时间
  @Bind()
  @action
  changeRoundQuotationDuration(value = null, type = 'minute', round) {
    let data = null;
    const { current } = this.RfxInfoDS;
    const days = current?.get(`roundDay${round}`) || 0;
    const hours = current?.get(`roundHour${round}`) || 0;
    const minutes = current?.get(`roundMinute${round}`) || 0;

    if (!days && !hours && !minutes) {
      this.RfxInfoDS?.current?.set(`roundDay${round}`, null);
      this.RfxInfoDS?.current?.set(`roundHour${round}`, null);
      this.RfxInfoDS?.current?.set(`roundMinute${round}`, null);
      current?.set(`roundQuotationRunningDuration${round}`, data);
      return;
    }

    if (type === 'day') {
      data = value * 1440 + hours * 60 + minutes;
    } else if (type === 'hour') {
      data = days * 1440 + value * 60 + minutes;
    } else {
      data = days * 1440 + hours * 60 + value;
    }
    current?.set(`roundQuotationRunningDuration${round}`, data);
  }

  /**
   * 发布即开始 多轮报价
   * */
  @Bind()
  @action
  changeRoundStartFlag(value = 0) {
    const { current } = this.RfxInfoDS;
    const { currentQuotationRounds } = this.RfxDemand.state;
    if (!value) {
      currentQuotationRounds.forEach((item) => {
        current?.set(`roundQuotationRunningDuration${item}`, null);
        current?.set(`roundDay${item}`, null);
        current?.set(`roundHour${item}`, null);
        current?.set(`roundMinute${item}`, null);
        const dayField = this.RfxInfoDS.getField(`roundDay${item}`);
        dayField.set('required', false);
        dayField.set('disabled', true);
        const hourField = this.RfxInfoDS.getField(`roundHour${item}`);
        hourField.set('required', false);
        hourField.set('disabled', true);
        const minuteField = this.RfxInfoDS.getField(`roundMinute${item}`);
        minuteField.set('required', false);
        minuteField.set('disabled', true);
        const timeField = this.RfxInfoDS.getField(`quotationTime${item}`);
        timeField.set('disabled', false);
        timeField.set('required', true);
      });
    } else {
      currentQuotationRounds.forEach((item) => {
        const roundHour = current?.get(`roundDay${item}`);
        const roundMinute = current?.get(`roundDay${item}`);
        const roundDay = current?.get(`roundDay${item}`);
        const dayField = this.RfxInfoDS.getField(`roundDay${item}`);
        dayField.get('dynamicProps');
        dayField.set('required', !roundHour && !roundMinute && !roundDay);
        dayField.set('disabled', false);
        const hourField = this.RfxInfoDS.getField(`roundHour${item}`);
        hourField.set('required', !roundHour && !roundMinute && !roundDay);
        hourField.set('disabled', false);
        const minuteField = this.RfxInfoDS.getField(`roundMinute${item}`);
        minuteField.set('required', !roundHour && !roundMinute && !roundDay);
        minuteField.set('disabled', false);
        const timeField = this.RfxInfoDS.getField(`quotationTime${item}`);
        timeField.set('disabled', true);
        timeField.set('required', false);
        current?.set(`quotationTime${item}`, null); // todo
      });
    }
    this.forceUpdate();
  }

  // 改变公司, 需求部门
  async changeCompanyUnit(data = {}) {
    const {
      organizationId = null,
      match: {
        params: { rfxId = null },
      },
    } = this.props;
    const { companyId = null, unitId = null } = data;
    const { current } = this.RfxInfoDS;
    const templateId = current?.get('templateId');
    const sealedQuotationFlag = current?.get('sealedQuotationFlag');
    if (!templateId) {
      Modal.error({
        title: intl.get('ssrc.inquiryHall.view.inquiryHall.selectTemplate').d('请先选择寻源模板'),
      });
    }

    try {
      let result = await changeCompanyUnit({
        organizationId,
        sourceHeaderId: rfxId,
        companyId,
        templateId,
        unitId,
        sealedQuotationFlag: sealedQuotationFlag === '1' ? 1 : 0,
      });
      result = getResponse(result);
      this.updateBidMemberFields(result, false);
    } catch (e) {
      throw e;
    }
  }

  // 改变寻源方式
  // 永祥二开
  @Bind()
  @action
  changeSourceMethod(value = null) {
    const { remote: remoteBox } = this.props;
    const record = this.RfxInfoDS?.current || {};

    record.set('sourceMethod', value);
    record.set('industryData', null);
    record.set('industryCategoryData', null);
    record.set('organizationType', null);

    this.clearDsCached(this.SupplierListTableDS);

    if (remoteBox && remoteBox.event) {
      remoteBox.event.fireEvent('remoteChangeSourceMethod', {
        bidFlag: this.bidFlag,
        rfxInfoDS: this.RfxInfoDS,
      });
    }

    if (value === 'INVITE' && !this.isNewRfx()) {
      this.SupplierListTableDS.query();
    }

    if (value !== 'INVITE' && !this.isNewRfx()) {
      if (!this.SourceNoticeDS.current) {
        const SourceNotice = {
          noticeDays: undefined,
        };
        this.createNowSourceNotice.createData = SourceNotice;
        this.createNowSourceNotice.hasCreated = 0;
        this.SourceNoticeDS.create(SourceNotice, 0);
      }
    }

    this.forceUpdate();
  }

  // 启用评分细项
  @Bind()
  changeEnableScoreFalg(value = 0, ds) {
    const {
      header: { mergeType },
      prequalScoreElementDsMap,
    } = this.state;
    ds?.current?.set('enableScoreFlag', value);
    this.RfxInfoDS?.current?.set('enableScoreFlag', value);

    if (value && isNil(mergeType)) {
      this.PrequalScoreElementDS.query();
    } else if (!isNil(mergeType)) {
      // 动态创建DS
      const prequalGroupHeaderId = ds?.current?.get('prequalGroupHeaderId');
      if (value) {
        const prequalGroupScoreAssignList = ds?.current?.get('prequalGroupScoreAssignList');
        const prequalScoreElementDs = new DataSet(
          PrequalScoreElementDS({
            mergeType,
            prequalGroupHeaderId,
          })
        );
        this.setPrequalQueryParameter(prequalScoreElementDs);
        prequalScoreElementDs.loadData(prequalGroupScoreAssignList || []);
        this.setState({
          prequalScoreElementDsMap: {
            ...prequalScoreElementDsMap,
            [prequalGroupHeaderId]: prequalScoreElementDs,
          },
        });
      } else {
        const copyDsMap = {
          ...prequalScoreElementDsMap,
        };
        delete copyDsMap[prequalGroupHeaderId]; // 删除DS
      }
    }
    this.forceUpdate();
  }

  // 设置资格预审基础的queryParameter
  @action
  setPrequalQueryParameter(ds) {
    const { organizationId } = this.props;
    const { header, userId = null } = this.state;
    const { rfxHeaderId } = header;
    const common = {
      rfxHeaderId,
      organizationId,
      tenantId: organizationId,
      userId,
    };
    ds.setQueryParameter('commonProps', {
      ...common,
    });
    ds.setQueryParameter('headers', header);
  }

  // 展示验证通过标识
  showValidateSymbol(value = false) {
    return value ? (
      <Icon type="check_circle" style={{ color: '#71ab42', marginLeft: '8px' }} />
    ) : null;
  }

  // 基础信息--永祥二开
  renderRfxInfoForm(RfxInfoFormProps) {
    return <RfxInfoForm {...RfxInfoFormProps} />;
  }

  // 采购组织及人员--郑州地铁二开
  renderOrganizationAndStaffForm(OrganizationAndStaffProps) {
    return <OrganizationAndStaffForm {...OrganizationAndStaffProps} />;
  }

  // 判断单据是否是新建
  isNewRfx() {
    const {
      match: {
        params: { rfxId = null },
      },
    } = this.props;

    return !rfxId || rfxId === 'null' || rfxId === 'NULL';
  }

  // 页面标题
  showPageHeader() {
    // const { sourceKey = '' } = this.props;
    const { header = {} } = this.state;
    const { mergeType, rfxNum = null, projectLineSections = [] } = header || {};
    let title = null;
    const { categoryCode } = this.rfx;

    if (this.isNewRfx()) {
      title = intl
        .get(`ssrc.inquiryHall.model.inquiryHall.commonNewRFQ`, {
          sourceCategoryName: categoryCode === 'BID' ? 'BID' : 'RFQ',
        })
        .d(`新建{sourceCategoryName}`);
    } else {
      title = rfxNum ? `-${rfxNum}` : '';
      title =
        intl
          .get(`ssrc.inquiryHall.view.message.title.RFXMaintenanceNew`, { sourceKey: categoryCode })
          .d(`编辑{sourceKey}`) + title;
    }

    return (
      <div className={styles['rfx-header-title']}>
        {title}
        {!isNil(mergeType) && (
          <>
            <Popover content={this.renderMaintainSectionPopover()} placement="bottom">
              <span className={styles['section-sub-title']}>
                <span>
                  <Icon type="apps" className={styles.icon} />
                </span>
                {`${intl
                  .get(`ssrc.inquiryHall.view.message.currentBatchMaintainSection`)
                  .d('当前批量维护标段')}${projectLineSections?.length}${intl
                  .get(`ssrc.inquiryHall.view.message.individual`)
                  .d('个')}`}
              </span>
            </Popover>
            <a onClick={this.handleEditSection}>{intl.get('hzero.common.button.edit').d('编辑')}</a>
          </>
        )}
      </div>
    );
  }

  /**
   * 维护标段
   */
  @Bind()
  async handleEditSection() {
    const { prequalHeaderDsMap = {} } = this.state;
    const { current } = this.RfxInfoDS;
    const sourceProjectId = current?.get('sourceProjectId');
    const rfxHeaderId = current?.get('rfxHeaderId');
    const projectLineSectionId = current?.get('projectLineSectionId');
    const configDs = {
      sourceProjectId,
      projectLineSectionId,
      tempSourceHeaderId: rfxHeaderId,
      prequalGroupHeaderIds: Object.keys(prequalHeaderDsMap)?.join(','),
    };
    this.sectionTableDs = new DataSet(sectionTableDS(configDs));
    const tableProps = {
      rfxHeaderId,
      sourceProjectId,
      onRefreshPrequalGroup: this.handleRefreshPrequalGroup,
      sectionTableDs: this.sectionTableDs,
    };
    Modal.open({
      key: Modal.key(),
      closable: true,
      drawer: true,
      title: intl.get(`ssrc.inquiryHall.view.message.title.selectedSection`).d('已选标段'),
      style: {
        width: '55%',
      },
      children: <SectionTable {...tableProps} />,
      onCancel: () => this.sectionTableDs.reset(),
    });
    const res = getResponse(await this.sectionTableDs.query());
    if (isArray(res) && res[0]) {
      this.sectionTableDs.loadData(res);
    }
  }

  /**
   * 渲染维护标段气泡
   */
  renderMaintainSectionPopover() {
    const { header = {} } = this.state;
    const { projectLineSections = [] } = header || {};
    return (
      <div>
        {map(projectLineSections, (r) => (
          <p>{`${r.sectionCode}-${r.sectionName}`}</p>
        ))}
      </div>
    );
  }

  // 密封报价
  @Bind()
  changeSealedQuotationFlag(value = 0) {
    this.RfxInfoDS?.current?.set('sealedQuotationFlag', value);
    this.forceUpdate();
  }

  // 基本信息form ref
  setRfxInfoRef = (el) => {
    this.rfxInfoRef = el;
  };

  // 需求方form ref
  setDemandSideFormRef = (el) => {
    this.demandSideFormRef = el;
  };

  // 采购执行人form ref
  setPurchaseExecuteFormRef = (el) => {
    this.purchaseExecuteFormRef = el;
  };

  // 资格预审form ref
  setPreQualificationFormRef = (el) => {
    this.preQualificationFormRef = el;
  };

  // 报价form ref
  setQuotationFormRef = (el) => {
    this.quotationFormRef = el;
  };

  // 报价form ref
  setRoundQuotationFormRef = (el) => {
    this.roundQuotationFormRef = el;
  };

  // 评分要素 评分模板form ref
  setTemplateFormRef = (el) => {
    this.templateFormRef = el;
  };

  // 供应商要求
  setSupplierRequestRef = (el) => {
    this.supplierRequestRef = el;
  };

  // 供应商要求
  setSupplierRequestFormRef = (el) => {
    this.supplierRequestFormRef = el;
  };

  // 商务要求
  setBusinessFormRef = (ref = {}) => {
    this.businessFormRef = ref || {};
  };

  // 竞价时间
  setBiddingTimeRef = (ref = {}) => {
    this.biddingTimerRef = ref || {};
  };

  // 竞价规则
  setBiddingRuleRef = (ref = {}) => {
    this.biddingRuleRef = ref || {};
  };

  setRfxPrepareFormRef = (ref = {}) => {
    this.rfxPrepareFormRef = ref || {};
  };

  // 触发锚点展示
  @debounce(500)
  @Bind()
  toggleAnchor() {
    this.setState((preStaus) => {
      return {
        anchorShow: !preStaus.anchorShow,
      };
    });
  }

  getBackPath() {
    // const { sourceKey } = this.props;
    const {
      routerParam: { noBack, fromPageType = '' },
    } = this.state;

    if (noBack) {
      return null;
    }
    // const ListUrl = this.distinguishUpdatePageUrl();
    if (fromPageType === 'applyToInquiry') {
      // 如果父页面来自于申请转询价，则返回路径也是申请转询价
      return `/ssrc/new-${this.rfx.sourceKeyLowerCase}-hall/apply-to-inquiry`;
    } else {
      const ListUrl = this.distinguishUpdatePageUrl();
      return ListUrl;
    }
  }

  /**
   * 创建初步评审行
   */
  @Bind()
  handleCreateReviewLine() {
    const { organizationId, remote: remoteBox } = this.props;
    const openBidOrder = this.RfxInfoDS?.current?.get('openBidOrder');
    const line = {
      evaluateIndicId: null,
      indicateId: null,
      indicateCode: null,
      indicateName: null,
      indicateType: 'PASS',
      // passFlag: 0,
      expertDistribute: null,
      indicStatus: 'SUBMITTED', // 查询提交后的评分要素数据
      sourceHeaderId: this.getRfxHeaderId(),
      team: 'INITIAL_REVIEW',
      _status: 'create',
      tenantId: organizationId,
      indicateRemark: null,
      sourceFrom: 'RFX',
      openBidOrder: openBidOrder || 'BUSINESS_FIRST',
      organizationId,
      expertCategory: '',
      detailEnabledFlag: 0,
    };

    const newLine = remoteBox
      ? remoteBox.process('SSRC_INQUIRYHALLNEW_UPDATE_PROCESS_CREATEREVIEWLINE_DATA', line, {
          bidFlag: this.bidFlag,
          that: this,
        })
      : line;
    if (!newLine) {
      return;
    }

    this.InitialReviewDS.create(newLine, 0);
  }

  /**
   * 保存初步评审行
   */
  @debounce(500)
  @Bind()
  async handleSaveReviewLine() {
    const { organizationId, sourceKey } = this.props;
    const validateFlag = await this.InitialReviewDS.validate();
    if (!validateFlag) {
      return;
    }

    let newParams = this.InitialReviewDS.toData() || [];
    if (!newParams.length) {
      return;
    }
    this.setState({ isInitialLoading: true });
    newParams = newParams.map((item) => {
      return {
        ...item,
        organizationId,
        tenantId: organizationId,
        sourceFrom: 'RFX',
        team: 'INITIAL_REVIEW',
        sourceHeaderId: this.getRfxHeaderId(),
      };
    });

    saveInitialReviewLines({
      organizationId,
      otherParams: newParams,
      operationType: this.operationType,
      customizeUnitCode: `SSRC.${sourceKey}_HALL.NEW_EDIT.INITIAL_REVIEW_TABLE`,
    })
      .then((res) => {
        this.setState({ isInitialLoading: false });
        if (getResponse(res)) {
          notification.success();
          this.fetchQueryReviewElements();
        }
      })
      .catch(() => {
        this.setState({ isInitialLoading: false });
      });
  }

  /**
   * 删除初步评审行
   */
  @Bind()
  async handleDeleteReviewLine() {
    const selecteds = this.InitialReviewDS.selected || [];
    if (isEmpty(selecteds)) {
      return;
    }
    const remoteDelete = selecteds.filter((item) => (item.data || {}).evaluateIndicId);
    const localDelete = selecteds.filter((item) => !(item.data || {}).evaluateIndicId);

    if (!isEmpty(remoteDelete)) {
      try {
        await this.InitialReviewDS.delete(remoteDelete, {
          title: intl.get('ssrc.common.message.tip').d('提示'),
          children: intl
            .get('hzero.c7nProUI.DataSet.delete_selected_row_confirm')
            .d('确认删除选中行？'),
        });
        this.InitialReviewDS.unSelectAll();
        this.fetchQueryReviewElements();
      } catch (e) {
        throw e;
      }
    } else {
      this.InitialReviewDS.remove(localDelete);
    }
  }

  applicationScopeRef = {};

  // 查看适用范围
  @debounce(1500)
  viewApplicationOrgModal = (param = {}) => {
    const handleViewApplicationModal = (params = {}) => {
      const {
        organizationId,
        rfxHeaderId,
        applicationScopeFlag,
        queryParams = {},
        saveApplicationScope,
      } = params || {};
      const Props = {
        queryParams: {
          organizationId,
          sourceHeaderId: rfxHeaderId,
          sourceFrom: 'RFX',
          applicationScopeFlag,
          ...(queryParams || {}),
        },
        onRef: (node) => {
          this.applicationScopeRef = node;
        },
        sourceHeaderId: rfxHeaderId,
        organizationId,
      };

      Modal.open({
        destroyOnClose: true,
        closable: true,
        key: Modal.key(),
        drawer: true,
        title: intl.get(`ssrc.inquiryHall.view.title.applicationScope`).d('适用范围'),
        children: <ApplicationScope {...Props} />,
        bodyStyle: {
          padding: 0,
        },
        style: { width: '1090px' },
        onOk: () => saveApplicationScope(),
      });
    };

    const { organizationId, remote: remoteBox } = this.props;
    const { current } = this.RfxInfoDS;
    const { rfxHeaderId, applicationScopeFlag } =
      current?.get(['rfxHeaderId', 'applicationScopeFlag']) || {};

    const props = {
      rfxHeaderId,
      organizationId,
      applicationScopeFlag,
      bidFlag: this.bidFlag,
      queryParams: { ...(param || {}) },
      handleViewApplicationModal,
      saveApplicationScope: this.saveApplicationScope,
      afterSaveItemLineUpdateHeader: this.afterSaveItemLineUpdateHeader,
    };

    if (remoteBox?.event) {
      remoteBox.event.fireEvent('remoteViewApplicationModalEvent', props);
    } else {
      handleViewApplicationModal(props);
    }
  };

  // 适应范围 - 保存
  saveApplicationScope = async () => {
    const { submitApplicationScopeLine = () => {} } = this.applicationScopeRef;
    const result = await submitApplicationScopeLine();
    if (result === true) {
      this.afterSaveItemLineUpdateHeader();
      return;
    }

    return false;
  };

  // 头部操作按钮ref
  @Bind()
  onButtonsRef(ref) {
    this.OperateButtonRef = ref;
  }

  /**
   * 报价要求
   * @param {Object} RfxDemandProps
   * @protected 东方电缆二开、九坤二开、跟谁学二开、水滴二开、乐成教育二开
   */
  renderRfxDemand = (RfxDemandProps = {}) => {
    return <RfxDemandForm {...RfxDemandProps} />;
  };

  // 对供应商要求(虎牙二开)
  @Bind()
  renderSupplierComponent = (SupplierWithRequestProps = {}) => {
    return <SupplierWithRequestForm {...SupplierWithRequestProps} />;
  };

  /**
   * 物料行批量新建ds初始化
   * 为了处理内部ds初始化一次的问题
   * */
  updateBatchCreateItemDS = (newBatchCreateItemDS = {}) => {
    this.BatchCreateItemDS = newBatchCreateItemDS;
  };

  /**
   * 标的物行
   * @protected 此方法被【永祥、绝味】二开，请勿修改此方法名！
   */
  @Bind()
  renderItemLineTable(itemLineTableProps) {
    return <ItemLineTable {...itemLineTableProps} />;
  }

  // 区分 寻源列表 | 招标列表
  distinguishUpdatePageUrl = () => {
    const { sourceKey } = this.props;

    let url = `/ssrc/new-inquiry-hall/list`;
    if (sourceKey === 'BID') {
      url = `/ssrc/new-bid-hall/list`;
    }

    return url;
  };

  // 通过判断新建 - 处理个性化默认值
  @Bind()
  generatorProxyDsCreate() {
    return this.createNowRFX;
  }

  // 通过判断新建 - 处理个性化默认值
  @Bind()
  generatorProxySourceNoticeDsCreate() {
    return this.createNowSourceNotice;
  }

  hasCustomizedForm = new Set();

  @Bind()
  formRenderCallback(code = '') {
    const { remote: remoteBox } = this.props;
    // HACK 配合个性化处理页面渲染异常
    // 问题： RfxInfoDS ds有七个个性化共用它一个， 导致有某写单元还未进行个性化处理，ds就开始处理create逻辑
    // 处理： 个性化判断所有都渲染完毕才去create
    // 备注(重要): 因为是公用代码，所以直接先判断数字7，后期如果有个性化差异或者变更，需要做差异处理
    this.hasCustomizedForm.add(code);

    let count = 7;

    // 如果是新竞价多了三个个性化 商务要求、竞价时间、竞价规则，隐藏了一个询价要求，相当于比之前多了2个
    // 竞价大厅
    if (this.isNewBiddingFlag()) {
      count = 9;
    }

    if ([1, -1].includes(this.state.fileTemplateManageFlag)) {
      // 如果开启新文件模板管理配置，这里的原附件不展示，需要减去1
      count -= 1;
    }

    // 【0927迭代】标准新增ds为RfxInfoDS的【符合性检查】个性化单元
    if (this.RfxInfoDS?.current?.get('initialReview') === 'NEED') {
      count += 1;
    }

    // 原有数量
    count = remoteBox
      ? remoteBox.process('SSRC_INQUIRYHALLNEW_UPDATE_PROCESS_CUSTOMIZE_COUNT', count, {
          bidFlag: this.bidFlag,
        })
      : count;

    if (this.hasCustomizedForm.size === count && this.createNowRFX.hasCreated === 0) {
      this.createNowRFX.hasCreated = 1;
      setTimeout(() => {
        // 原写法直接修改了proxyDSCreate内的属性
        // 对象本身没有变，相当于子表单的属性没有变，无法触发重新渲染
        // 所以这里用了一次解构，变更了对象的引用，并且createNow赋值为true
        // this.createNowRFX.createNow = true;
        this.createNowRFX = {
          ...this.createNowRFX,
          createNow: true,
        };
        if (remoteBox?.event) {
          remoteBox.event.fireEvent('remoteCuzDefaultValueUpdateCallback', {
            that: this,
            RfxInfoDS: this.RfxInfoDS,
          });
        }
        this.forceUpdate();
      }, 0);
    }
  }

  @Bind()
  sourceNoticeRenderCallback() {
    if (this.createNowSourceNotice.hasCreated === 0) {
      this.createNowSourceNotice.hasCreated = 1;
      this.createNowSourceNotice.createNow = true;
    }
  }

  /**
   * 在【对供应商要求】后面, 埋点
   */
  renderCuxAfterSupplierWithRequest = () => {
    const { remote: remoteBox } = this.props;
    let dom = '';

    // 原有数量
    dom = remoteBox
      ? remoteBox.process(
          'SSRC_INQUIRYHALLNEW_UPDATE_PROCESS_CUX_AFTERSUPPLIERWITHREQUEST_DOM',
          dom,
          {
            that: this,
            styles,
          }
        )
      : dom;
    return dom;
  };

  /**
   * 对 【采购组织人员】 后边， 埋点
   */
  renderCuxAfterPurOrganizationAndStaff = () => {
    const { remote: remoteBox } = this.props;
    let dom = '';

    // 原有数量
    dom = remoteBox
      ? remoteBox.process(
          'SSRC_INQUIRYHALLNEW_UPDATE_PROCESS_CUX_AFTERPURORGANIZATIONANDSTAFF_DOM',
          dom,
          {
            that: this,
            styles,
          }
        )
      : dom;

    return dom;
  };

  render() {
    const {
      organizationId,
      history,
      userId,
      match: {
        params: { rfxId = null },
        path,
      },
      customizeTable = noop,
      customizeForm = noop,
      customizeCollapseForm = noop,
      custLoading = false,
      clearProperties,
      customizeBtnGroup,
      match,
      remote: remoteBox,
    } = this.props;
    const {
      allOpenSelectable,
      header = {},
      validates: {
        rfxInfoValidate = false, // 采购需求验证标识
        itemLineValidate = false, // 物品
        purchaseValidate = false, // 采购组织
        toSupplierValidate = false, // 对供应商要求
        rfxDemandValidate = false, // 询价要求
        bTFileValidate = false,
      },
      inquiryHallLoading = true,
      applyToInquiryNewFlag = 1,
      prequalMergeTypes = [],
      prequalHeaderDsMap = {}, // 资格预审header Map ds
      prequalScoreElementDsMap = {},
      configSheet = {},
      isLoading = false,
      isSelectPass,
      doubleUnitFlag,
      isScoringLoading = false, // 评分要素loading
      isInitialLoading = false, // 商务评分loading
      quotationFormRefControl = true,
      newQuotationFlag = 0,
      serviceChargeFlag = false,
      biddingHallFlag = 0,
      isNewTemplateConfigFlag = false,
      qualificationWarnInfo,
      _timestamp = '',
      sourceResultsData = [],
      fileTemplateManageFlag,
    } = this.state;
    const proxyDsCreate = this.generatorProxyDsCreate();
    const { sourceCategory, biddingFlag, biddingMode, biddingTarget } =
      this.RfxInfoDS?.current?.get([
        'sourceCategory',
        'biddingFlag',
        'biddingMode',
        'biddingTarget',
      ]) || {};
    // 竞价大厅标识
    const newBiddingFlag = biddingHallFlag && sourceCategory === 'RFA' && biddingFlag;

    // 竞价大厅-单价竞价 起竞价显示标识 【寻源类别】为【竞价】且【竞价模式】为【英式竞价】且【报价类型】是【单价竞价】，任一不满足时隐藏
    const biddingUnitPrice =
      newBiddingFlag && biddingMode === 'BRITISH_BIDDING' && biddingTarget === 'UNIT_PRICE';

    const CommonProps = {
      match,
      proxyDsCreate,
      rfx: this.rfx,
      afterCustomizeDs: this.formRenderCallback,
      isNewRfx: this.isNewRfx(),
      ChunkUploadProps,
      customizeBtnGroup,
      remote: remoteBox,
      bidFlag: this.bidFlag,
      newQuotationFlag,
      biddingHallFlag,
      newBiddingFlag,
      customizeForm,
      isNewTemplateConfigFlag,
      biddingUnitPrice,
      customizeTable,
      isNewBiddingFlag: this.isNewBiddingFlag,
      britishBidding: this.britishBidding,
      japanBiddingTotalPrice: this.japanBiddingTotalPrice,
      japOrDutchBiddingTotalPrice: this.japOrDutchBiddingTotalPrice,
      dutchBiddingTotalPrice: this.dutchBiddingTotalPrice,
    };

    const RfxInfoFormProps = {
      ...CommonProps,
      proxyDsCreate,
      header,
      rfxInfoDS: this.RfxInfoDS,
      customizeCollapseForm,
      custLoading,
      history,
      itemLineTableDS: this.ItemLineTableDS,
      changeSourceTemplateLov: this.changeSourceTemplateLov,
      changeSectionNameLov: this.changeSectionNameLov,
      changeRfxTitle: this.changeRfxTitle,
      setRfxInfoRef: this.setRfxInfoRef,
      fetchInquiryHeader: this.fetchInquiryHeader,
      toggleButtonsLoading: this.toggleButtonsLoading,
      togglePageLoading: this.togglePageLoading,
    };

    // 组织及人员props
    const OrganizationAndStaffProps = {
      ...CommonProps,
      organizationId,
      customizeTable,
      customizeCollapseForm,
      rfxInfoDS: this.RfxInfoDS,
      changePurPhone: this.changePurPhone,
      changeCompanyLov: this.changeCompanyLov,
      changeUnitLov: this.changeUnitLov,
      changeOpenBidLov: this.changeOpenBidLov,
      setDemandSideFormRef: this.setDemandSideFormRef,
      setPurchaseExecuteFormRef: this.setPurchaseExecuteFormRef,
      custLoading,
      isNewRfx: this.isNewRfx(),
      viewApplicationOrgModal: this.viewApplicationOrgModal,
      changePurOrganizationLov: this.changePurOrganizationLov,
      sourceResultsData,
      itemLineTableDS: this.ItemLineTableDS,
    };

    // 对供应商要求
    const SupplierWithRequestProps = {
      ...CommonProps,
      rfxId,
      history,
      userId,
      header,
      remoteBox,
      allOpenSelectable,
      organizationId,
      customizeTable,
      customizeCollapseForm,
      rfxInfoDS: this.RfxInfoDS,
      supplierListTableDS: this.SupplierListTableDS,
      sourceNoticeDS: this.SourceNoticeDS,
      previewNotice: this.previewNotice,
      custLoading,
      onLinkRiskScan: this.linkRiskScan,
      supplierRelationMap: this.supplierRelationMap,
      changeSourceMethod: this.changeSourceMethod,
      onRef: this.setSupplierRequestRef,
      businessFormRef: this.setBusinessFormRef,
      onFormRef: this.setSupplierRequestFormRef,
      isDomesTic: this.isDomesTic,
      itemLineTableDS: this.ItemLineTableDS,
      togglePageLoading: this.togglePageLoading,
      serviceChargeFlag,
      isNewBiddingFlag: this.isNewBiddingFlag,
      fetchInquiryHeader: this.fetchInquiryHeader,
      setQueryParameterDS: this.setQueryParameterDS,
      proxyDsSourceNoticeCreate: this.generatorProxySourceNoticeDsCreate(),
      afterCustomizeSourceNoticeDs: this.sourceNoticeRenderCallback,
      fetchQualificationWarnInfo: this.fetchQualificationWarnInfo,
      qualificationWarnInfo,
      _timestamp,
    };

    // 询价要求
    const RfxDemandProps = {
      ...CommonProps,
      // proxyDsCreate,
      path,
      isSelectPass,
      organizationId,
      customizeCollapseForm,
      customizeTable,
      custLoading,
      prequalMergeTypes,
      prequalHeaderDsMap,
      prequalScoreElementDsMap,
      sourceHeaderId: this.getRfxHeaderId(),
      rfxInfoDS: this.RfxInfoDS,
      businessScoringElementDS: this.BusinessScoringElementDS,
      technologyScoringElementDS: this.TechnologyScoringElementDS,
      allScoringElementDS: this.AllScoringElementDS,
      noneExpertTableDS: this.NoneExpertTableDS,
      allExpertTableDS: this.AllExpertTableDS,
      selectScoreElementTemplate: this.selectScoreElementTemplate,
      changeEnableScoreFalg: this.changeEnableScoreFalg,
      changeSealedQuotationFlag: this.changeSealedQuotationFlag,
      changeOpenBidLov: this.changeOpenBidLov,
      changeStartFlag: this.changeStartFlag,
      changeRoundStartFlag: this.changeRoundStartFlag,
      changeRoundQuotationDuration: this.changeRoundQuotationDuration,
      prequalScoreElementDS: this.PrequalScoreElementDS,
      onSaveScoringElements: this.onSaveScoringElements,
      onCreateScoringElements: this.onCreateScoringElements,
      deleteScoreElement: this.deleteScoreElement,
      deleteExpertLines: this.deleteExpertLines,
      onSaveExpert: this.onSaveExpert,
      preQualificationFormRef: this.setPreQualificationFormRef,
      quotationFormRef: this.setQuotationFormRef,
      templateFormRef: this.setTemplateFormRef,
      roundQuotationFormRef: this.setRoundQuotationFormRef,
      fetchScoring: this.fetchScoring,
      onRef: this.onRfxDemandRef,
      changeQuotationDuration: this.changeQuotationDuration,
      changeBiddingRunningTime: this.changeBiddingRunningTime,
      initialReviewDS: this.InitialReviewDS,
      onCreateReviewLine: this.handleCreateReviewLine,
      onDeleteReviewLine: this.handleDeleteReviewLine,
      onSaveReviewLine: this.handleSaveReviewLine,
      onRefreshPrequalGroup: this.handleRefreshPrequalGroup,
      refreshRfxHeaderAndPrequalGroup: this.refreshRfxHeaderAndPrequalGroup,
      proxyDsCreate,
      bidFlag: this.bidFlag,
      isLoading,
      isInitialLoading,
      isScoringLoading,
      mergeTypeEditorFlag: this.mergeTypeEditorFlag,
      operationType: this.operationType,
      quotationFormRefControl,
      fetchExpert: this.fetchExpert,
      serviceChargeFlag,
      /** ********* 协鑫二开新增价格要素-勿动!!! *********** */
      priceScoringElementDS: this.PriceScoringElementDS,
      biddingTimerRef: this.setBiddingTimeRef,
      biddingRuleRef: this.setBiddingRuleRef,
      setRfxPrepareFormRef: this.setRfxPrepareFormRef,
      itemLineTableDS: this.ItemLineTableDS,
      setCurrentTimeValue: this.setCurrentTimeValue,
      isNewTemplateConfigFlag,
      fetchQueryReviewElements: this.fetchQueryReviewElements,
    };

    // itemLine
    const itemLineTableProps = {
      ...CommonProps,
      header,
      doubleUnitFlag,
      itemLineTableDS: this.ItemLineTableDS,
      rfxInfoDS: this.RfxInfoDS,
      batchCreateItemDS: this.BatchCreateItemDS,
      rfxId,
      customizeTable,
      customizeBtnGroup,
      custLoading,
      customizeForm,
      clearProperties,
      applyToInquiryNewFlag,
      organizationId,
      dataSource: ItemLineTableDS.data,
      operationType: this.operationType,
      // onRef: this.onRef,
      copyItemLine: this.copyItemLine,
      createItemLine: this.createItemLine,
      saveItemLine: this.saveItemLine,
      changeRfxQuantity: this.changeRfxQuantity,
      configSheet,
      destroyItemLine: this.destroyItemLine,
      supplierListTableDS: this.SupplierListTableDS,
      viewApplicationOrgModal: this.viewApplicationOrgModal,
      afterSaveItemLineUpdateHeader: this.afterSaveItemLineUpdateHeader,
      updateBatchCreateItemDS: this.updateBatchCreateItemDS,
      saveForceItemLine: this.saveForceItemLine,
      setBatchMainItems: this.setBatchMainItems,
      getBatchUpdateFlag: this.getBatchUpdateFlag,
      isNewBiddingFlag: this.isNewBiddingFlag,
      togglePageLoading: this.togglePageLoading,
      sourceResultsData,
    };

    // 标段props
    const SetctionInfoProps = {
      ...CommonProps,
      header,
      rfxId,
      doubleUnitFlag,
      rfxInfoDS: this.RfxInfoDS,
      customizeTable,
      custLoading,
      customizeForm,
      clearProperties,
      applyToInquiryNewFlag,
      organizationId,
      onRef: this.onSectionRef,
      fetchInquiryHeader: this.fetchInquiryHeader,
      configSheet,
      setBatchMainItems: this.setBatchMainItems,
      getBatchUpdateFlag: this.getBatchUpdateFlag,
      resetBatchMainItems: this.resetBatchMainItems,
      handleSetHeaderData: this.handleSetHeaderData,
      sourceResultsData,
    };

    // file props
    const AttachmentsProps = {
      ...CommonProps,
      customizeForm,
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: 'ssrc-rfx-rfxheader',
      businessUuid: header.businessAttachmentUuid,
      techUuid: header.techAttachmentUuid,
      onRef: this.handleBindOnRef,
      rfxInfoDS: this.RfxInfoDS,
      rfx: this.rfx,
      fileTemplateManageFlag,
      bidFileTemplateAttachmentRef: this.bidFileTemplateAttachmentRef,
      bidFileTemplateAttachmentCuxPurRef: this.bidFileTemplateAttachmentCuxPurRef,
      bidFileTemplateAttachmentCuxSupRef: this.bidFileTemplateAttachmentCuxSupRef,
      fetchInquiryHallUpdate: this.fetchInquiryHallUpdate,
    };

    // 按钮Props
    const ButtonsProps = {
      rfxId,
      organizationId,
      RfxInfoDS: this.RfxInfoDS,
      releaseInquiryHall: this.releaseInquiryHall,
      saveInquiryHallUpdate: this.saveInquiryHallUpdate,
      cancelInquiryHallUpdate: this.cancelInquiryHallUpdate,
      onButtonsRef: this.onButtonsRef,
      customizeBtnGroup,
      rfx: this.rfx,
      inquiryHallLoading,
      remote: remoteBox,
      bidFlag: this.bidFlag,
      integrationPageData: this.integrationPageData,
      supplierListTableDS: this.SupplierListTableDS,
      itemLineTableDS: this.ItemLineTableDS,
      fetchInquiryHallUpdate: this.fetchInquiryHallUpdate,
    };

    // 锚点定位Props
    const preQualificationFlag = this.RfxInfoDS?.current?.get('preQualificationFlag');
    const initialReview = this.RfxInfoDS?.current?.get('initialReview');
    const mergeType = this.RfxInfoDS?.current?.get('mergeType'); // 资格预审-副标题
    // 专家标识
    const expertFlag =
      this.RfxInfoDS?.current?.get('expertScoreType') &&
      this.RfxInfoDS?.current?.get('expertScoreType') !== 'NONE';
    const AnchorSsrcProps = {
      preQualificationFlag,
      initialReview,
      mergeType,
      expertFlag,
      prequalHeaderDsMap,
      rfx: this.rfx,
    };

    let mainContentLists = [
      <Content className={styles['custom-page-content']} name="base">
        <h3 id="rfxBasicInfo" className={styles['rfx-card-item-title']}>
          {intl
            .get('ssrc.inquiryHall.view.inquiryHall.rfxBasicInfoRFX', {
              omitName: this.omitName,
            })
            .d(`{omitName}基础信息`)}
          {this.showValidateSymbol(rfxInfoValidate)}
        </h3>
        <Spin dataSet={this.RfxInfoDS}>{this.renderRfxInfoForm(RfxInfoFormProps)}</Spin>
      </Content>,
      <Content className={styles['custom-page-content']} name="purchase">
        <h3 id="organizationAndStaff" className={styles['rfx-card-item-title']}>
          {intl
            .get('ssrc.inquiryHall.view.inquiryHall.purOrganizationAndStaff')
            .d('采购组织及人员')}
          {this.showValidateSymbol(purchaseValidate)}
        </h3>
        {this.renderOrganizationAndStaffForm(OrganizationAndStaffProps)}
      </Content>,

      this.renderCuxAfterPurOrganizationAndStaff(),

      header.multiSectionFlag && ['RELEASE_REJECTED', 'NEW'].includes(header.rfxStatus) ? (
        <Content className={styles['custom-page-content']} name="sectionItem">
          <h3 id="rfxItemLines" className={styles['rfx-card-item-title']}>
            {intl.get('ssrc.inquiryHall.view.inquiryHall.section').d('标段')}
            {this.showValidateSymbol(itemLineValidate)}
          </h3>
          <SectionInfo {...SetctionInfoProps} />
        </Content>
      ) : (
        <Content className={styles['custom-page-content']} name="item">
          <h3 id="rfxItemLines" className={styles['rfx-card-item-title']}>
            {intl
              .get('ssrc.inquiryHall.view.inquiryHall.rfxItemLinesRFX', {
                omitName: this.omitName,
              })
              .d(`{omitName}标的物`)}
            {this.showValidateSymbol(itemLineValidate)}
          </h3>
          {this.renderItemLineTable(itemLineTableProps)}
        </Content>
      ),
      <Content className={styles['custom-page-content']} name="supplier">
        <h3 id="supplierWithRequest" className={styles['rfx-card-item-title']}>
          {intl.get('ssrc.inquiryHall.view.inquiryHall.supplierWithRequest').d('对供应商要求')}
          {this.showValidateSymbol(toSupplierValidate)}
        </h3>
        {this.renderSupplierComponent(SupplierWithRequestProps)}
      </Content>,

      this.renderCuxAfterSupplierWithRequest(),

      <Content className={styles['custom-page-content']} name="quotation">
        <h3 id="rfxDeamnd" className={styles['rfx-card-item-title']}>
          {!newBiddingFlag
            ? intl
                .get('ssrc.inquiryHall.view.inquiryHall.rfxDeamndRFX', {
                  sourceCategoryName: this.sourceCategoryName,
                })
                .d(`{sourceCategoryName}要求`)
            : intl.get('ssrc.common.view.biddingRequest').d('竞价要求')}
          {this.showValidateSymbol(rfxDemandValidate)}
        </h3>
        {this.renderRfxDemand(RfxDemandProps)}
      </Content>,
      <Content className={styles['custom-page-content']} name="attachment">
        <h3 id="attachments" className={styles['rfx-card-item-title']}>
          {intl.get('ssrc.common.attachment').d('附件')}
          {this.showValidateSymbol(bTFileValidate)}
        </h3>
        {remoteBox ? (
          remoteBox.render(
            'SSRC_INQUIRYHALLNEW_UPDATE_RENDER_ATTACHMENT_CARD',
            <AttachmentCard {...AttachmentsProps} />,
            {
              rfxId,
              history,
              that: this,
              rfxInfoDS: this.RfxInfoDS,
              bidFlag: this.bidFlag,
              saveInquiryHallUpdateVTwo,
              onRef: this.handleBindOnRef,
              toggleButtonsLoading: this.toggleButtonsLoading,
              togglePageLoading: this.togglePageLoading,
              validatePage: this.validatePage,
              computeRunningDuration: this.computeRunningDuration,
              integrationPageData: this.integrationPageData,
            }
          )
        ) : (
          <AttachmentCard {...AttachmentsProps} />
        )}
      </Content>,
    ];

    mainContentLists = remoteBox
      ? remoteBox.process('SSRC_INQUIRYHALLNEW_UPDATE_PROCESS_CONTENT_LIST', mainContentLists, {
          that: this,
          styles,
        })
      : mainContentLists;

    return (
      <ModalProvider>
        <Header backPath={this.getBackPath()} title={this.showPageHeader()}>
          <OperateButtons {...ButtonsProps} />
        </Header>
        <Content className={classnames('ued-detail-wrapper', styles['update-container'])}>
          <ChoerondonSpin spinning={inquiryHallLoading}>
            <div>
              <AnchorSsrc {...AnchorSsrcProps} />
              <div className={styles['rfx-detail-list-card']}>{mainContentLists}</div>
            </div>
          </ChoerondonSpin>
        </Content>
      </ModalProvider>
    );
  }
}

// react router 的 match 对象始终是新实例， 需要进行深比较
const routerMatch = (Target) => {
  return (props) => {
    const ref = useRef(null);
    const { match, ...otherProps } = props;
    if (!ref.current || !isEqual(ref.current, match)) {
      ref.current = match;
      otherProps.match = match;
    } else {
      otherProps.match = ref.current;
    }

    return <Target {...otherProps} />;
  };
};

// SSRC.INQUIRY_HALL.NEW_EDIT
// SSRC.BID_HALL.NEW_EDIT
// hoc function
const hocUpdate = (NewComponent, pageSymbol = INQUIRY) => {
  return WithCustomizeC7N({
    unitCode: [
      `SSRC.${pageSymbol}_HALL.NEW_EDIT.INFO_V2`, // 基本信息
      `SSRC.${pageSymbol}_HALL.NEW_EDIT.ORG_DEMAND_V2`, // 采购组织及人员-需求方
      `SSRC.${pageSymbol}_HALL.NEW_EDIT.ORG_EXEC_V2`, // 采购组织及人员-采购执行人
      `SSRC.${pageSymbol}_HALL.NEW_EDIT.LINE_ITEM`, // 物品行
      `SSRC.${pageSymbol}_HALL.NEW_EDIT.LINE_ITEM_BUTTONS`, // 物品行表格按钮组
      `SSRC.${pageSymbol}_HALL.NEW_EDIT.SECTION_LINE_ITEM`, // 标段物品行
      `SSRC.${pageSymbol}_HALL.NEW_EDIT.LINE_SUPPLIER`, // 供应商行
      `SSRC.${pageSymbol}_HALL.NEW_EDIT.LINE_SUPPLIER_BUTTONS`, // 供应商行---表格按钮组
      `SSRC.${pageSymbol}_HALL.NEW_EDIT.RFX_DEMAND_PREQUAL_V2`, // 询价要求-资格预审
      `SSRC.${pageSymbol}_HALL.NEW_EDIT.RFX_DEM_QUOTE_V2`, // 询价要求-报价
      `SSRC.${pageSymbol}_HALL.NEW_EDIT.RFXPREPARE`, // 寻源准备
      `SSRC.${pageSymbol}_HALL.NEW_EDIT.INITIAL_REVIEW_FORM`, // 询价要求 - 符合性检查 - 表单
      `SSRC.${pageSymbol}_HALL.NEW_EDIT.INITIAL_REVIEW_BUTTONS`, // 询价要求 - 符合性检查 - 按钮
      `SSRC.${pageSymbol}_HALL.NEW_EDIT.INITIAL_REVIEW_TABLE`, // 询价要求 - 符合性检查 - 表格
      `SSRC.${pageSymbol}_HALL.NEW_EDIT.HEADER.SCORE_INDICS`, // 询价要求-评分要素
      `SSRC.${pageSymbol}_HALL.NEW_EDIT.HEADER.SCORE_INDICS_TECHNOLOGY`, // 询价要求-评分要素-技术
      `SSRC.${pageSymbol}_HALL.NEW_EDIT.SCORE_INDICS_BTN`, // 询价要求-评分要素商务或者不区分商务技术-按钮组
      `SSRC.${pageSymbol}_HALL.NEW_EDIT.SCORE_INDICS_TECHNOLOGY_BTN`, // 询价要求-评分要素-技术按钮组
      `SSRC.${pageSymbol}_HALL.NEW_EDIT.SCORE.EXPERT_ASSIGN`, // 评分要素-分配专家
      `SSRC.${pageSymbol}_HALL.NEW_EDIT.SCORE.EXPERT_ASSIGN_V2`, // 评分要素-专家分配
      `SSRC.${pageSymbol}_HALL.NEW_EDIT.HEADER.EXPERT_SCORE`, // 询价要求-评分要素
      `SSRC.${pageSymbol}_HALL.NEW_EDIT.BATCH_CREATE_FORM`, // 物品-批量新增
      `SSRC.${pageSymbol}_HALL.NEW_EDIT.BATCH_ITEM_FORM`, // 物品-批量维护
      `SSRC.${pageSymbol}_HALL.NEW_EDIT.SECTION_ITEM`, // 分标段标段信息行
      `SSRC.${pageSymbol}_HALL.NEW_EDIT.SECTION.LINE`, // 供应商行物料维护
      `SSRC.${pageSymbol}_HALL.NEW_EDIT.SOURCE_METHOD`, // 寻源方式
      `SSRC.${pageSymbol}_HALL.NEW_EDIT.NOTICE`, // 公告
      `SSRC.${pageSymbol}_HALL.NEW_EDIT.ITEM_SUP_ASSIGN`, // 供应商分配物料
      `SSRC.${pageSymbol}_HALL.NEW_EDIT.BUTTON_GROUP`, // 按钮组
      `SSRC.${pageSymbol}_HALL.NEW_EDIT.RFQ_ATTACHMENT_FORM`, // 附件
      `SSRC.${pageSymbol}_HALL.NEW_EDIT.PURCHASEREQUEST_FORM`, // 引用采购申请筛选器
      `SSRC.${pageSymbol}_HALL.NEW_EDIT.PURCHASEREQUEST_TABLE`, // 引用采购申请表格
      `SSRC.${pageSymbol}_HALL.NEW_EDIT.BUSINESS_REQUEST`, // 商务要求
      `SSRC.${pageSymbol}_HALL.NEW_EDIT.BIDDING_TIME`, // 竞价时间
      `SSRC.${pageSymbol}_HALL.NEW_EDIT.BIDDING_RULE`, // 竞价规则
      `SSRC.QUOTATION_CONTROLLER_DETAIL.BULK_ADD_SUPPLIER`, // 对供应商要求 -> 批量添加供应商
      `SSRC.QUOTATION_CONTROLLER_DETAIL.BULK_ADD_SUPPLIER_QUERY`,
      `SSRC.${pageSymbol}_HALL.NEW_EDIT.HEADER.EXPERT_SCORE_BUTTONS`, // 专家表格按钮组
      `SSRC.${pageSymbol}_HALL.NEW_EDIT.SCORE_DETAIL_TEMPLATE_FORM`, // 要素选择模板
      `SSRC.${pageSymbol}_HALL.NEW_EDIT.ATTACHMENT_REQUIREMENT_BUTTONS`, // 文件管理-附件要求表格
      `SSRC.${pageSymbol}_HALL.NEW_EDIT.ATTACHMENT_REQUIREMENT_TABLE`, // 文件管理-表格行
    ],
  })(
    formatterCollections({
      code: [
        'ssrc.inquiryHall',
        'ssrc.common',
        'ssrc.sourceTemplate',
        'ssrc.bidHall',
        'ssrc.supplierQuotation',
        'ssrc.score',
        'ssrc.rf',
        'sodr.workspace',
        'hzero.c7nProUI',
        'sscux.common',
        'scux.ssrc',
        'ssrc.priceComparison',
        'ssrc.biddingHall',
      ],
    })(
      connect(({ inquiryHall, bidHall, user }) => ({
        user,
        inquiryHall,
        bidHall,
        organizationId: getCurrentOrganizationId(),
        userId: getCurrentUserId(),
        sourceKey: pageSymbol,
      }))(
        remote(
          {
            code: 'SSRC_INQUIRYHALLNEW_UPDATE', // 对应二开模块暴露的Expose的编码， 命名规范：模块编码+功能编码
            name: 'remote', // 默认 'remote'， 如有属性冲突可以改此属性
          }, // 默认Expose属性，当没有二开Expose时会走此逻辑
          {
            events: {
              remoteCopyItemLine(remoteCopyItemLineProps) {
                const { remoteCopyItemLineEvent = noop } = remoteCopyItemLineProps || {};
                remoteCopyItemLineEvent(remoteCopyItemLineProps);
              },
              remoteNewRfxInit(remoteProps = {}) {
                const { remoteNewRfxInitEvent = noop } = remoteProps || {};
                remoteNewRfxInitEvent(remoteProps);
              },
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
              // 清除需求部门
              clearUnit() {},
              // 发布提交
              doSubmit(props) {
                const { doSubmit } = props || {};
                doSubmit();
              },
              // 刷新头部数据之后的处理字段埋点方法
              remoteRfxInfoFiledEvent() {},
              // 改变公司之后的处理字段埋点方法
              remoteChangeCompanyEvent() {},
              // 改变公司之后的取消改变处理字段埋点方法
              remoteCancelChangeCompanyEvent() {},
              // 新建改变公司之后确定埋点方法
              remoteChangeCompanyNotCreateEvent() {},
              // 新建改变公司之后无模板情况埋点方法
              remoteChangeCompanyNoTemplateEvent() {},
              // 初始化ds Event
              remoteInitDsEvent() {},
              // 组件卸载清空埋点事件
              remoteComponentWillUnmountEvent() {},
              // 设置ds参数埋点事件
              remoteSetQueryParameterDSEvent() {},
              // load businessData
              remoteLoadDataBusinessData(props = {}) {
                const { loadBusinessData = noop } = props || {};
                loadBusinessData(props);
              },
              // 设置表格行数校验埋点方法
              remoteSetTableDSValidatedEvent() {},
              // 设置取消表格行数校验埋点方法
              remoteClearTableDSValidatedEvent() {},
              // 清除表格数据、清除ds缓存埋点方法
              remoteResetStateAndClearTableEvent() {},
              // 清除新建物料
              removeItemLine(props = {}) {
                const { removeItemLine = noop } = props || {};
                removeItemLine();
              },
              // 新建情况变更公司弹框
              newRfxOpenModal(props = {}) {
                const { openModal = noop } = props || {};
                openModal();
              },
              // 修改情况变更公司弹框
              updateRfxOpenModal(props = {}) {
                const { openModal = noop } = props || {};
                openModal();
              },
              // 山鹰二开查询启信宝关联关系
              remoteGetRelationship() {},
              // 查询头接口之后执行某些操作
              remoteHandleOperateAfterFetchHeader() {},
              // 新增询价单头监听事件埋点方法
              remoteRfxDsUpdateEvents() {},
              // 查看适用范围埋点方法
              remoteViewApplicationModalEvent(props = {}) {
                const { handleViewApplicationModal = noop } = props || {};
                handleViewApplicationModal(props);
              },
              // 清空商务附件技术附件UUID
              clearAttachmentUUid() {},
              // 询价单维护保存后的回调事件
              remoteSaveUpdateCallBackEvent() {},
              // 分标段改变业务实体埋点事件
              remoteHandleSectionOuIdChangeEvent() {},
              // 新建单子改变公司无物料埋点事件
              remoteChangeCompanyNoItemEvent() {},
              // 询价/招标 维护页头保存 - 前置埋点
              handleSaveInquiryHallUpdateBefore() {
                return true;
              },
              // 询价/招标 维护页头取消 - 前置埋点
              handleCancelInquiryHallUpdateBefore() {
                return true;
              },
              // 询价/招标 维护页头发布 - 前置埋点
              handleReleaseInquiryHallBefore() {
                return true;
              },
              // 标的行批量删除 - 前置埋点
              handleDestroyItemLineBefore() {
                return true;
              },
              // 标的行批量保存 - 前置埋点
              handleSaveItemLineBefore() {
                return true;
              },
              // 标的行批量保存 - 后置埋点
              handleSaveItemLineAfter() {
                return true;
              },
              // 个性化默认值更新回掉埋点
              remoteCuzDefaultValueUpdateCallback() {},
              // 改变公司后供应商查询事件埋点
              remoteSupplierTableQueryEvent() {},
              // 附件列表刷新查询事件埋点
              remoteRefreshAttachmentTemplateList() {},
              // 查询完值集 - 后置埋点
              remoteQueryBatchCodeEvent() {},
              // 切换寻源方式埋点
              remoteChangeSourceMethod() {},
              // 切换寻源模板后
              remoteChangeTemplateLovLateEvent() {},
              // 单据发布后跳转cux
              remoteHandleReleaseAndCancelPath() {},
              // 评分细则弹框确认按钮回写埋点
              remoteChangeRemarkModal() {},
            },
          }
        )(routerMatch(observer(NewComponent)))
      )
    )
  );
};

const Update = hocUpdate(UpdateComponent);

export default Update;

export { hocUpdate, UpdateComponent };
