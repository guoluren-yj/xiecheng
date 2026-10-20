/**
 * inquiryHall - 寻源服务-明细
 * @date: 2020-10-16
 */
import React, { Component } from 'react';
import { Modal, DataSet, Spin } from 'choerodon-ui/pro';
import { Spin as ChoerodonSpin } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';
import { isEmpty } from 'lodash';
import classnames from 'classnames';
import { action } from 'mobx';
import { observer } from 'mobx-react';

import { Content } from 'components/Page';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { getResponse } from 'utils/utils';
import WithCustomizeC7N from 'srm-front-cuz/lib/c7nCustomize';
import { openTab } from 'utils/menuTab';
import AnchorSsrc from '@/routes/ssrc/InquiryHallNew/Update/AnchorSsrc';
import ApplicationScopeDetail from '@/routes/ssrc/components/ApplicationOrganization/Detail';
import { fetchInquiryHeaderDetails, queryPrequalGroup } from '@/services/inquiryHallNewService';
import { fetchExpertAllocationData, fetchTempelateDetailData } from '@/services/bidHallService';
import maintainStyles from '@/routes/ssrc/InquiryHallNew/Update/index.less';
import { supplierRiskScan } from '@/routes/ssrc/InquiryHallNew/utils';
import { calculateLatterFieldTime } from '@/routes/ssrc/InquiryHallNew/Update/utils/utils';

import detailStyles from './index.less';

import ReleasePrepareAttachment from './ReleasePrepareAttachment';
import RfxInfoDS from './RfxInfoDS';
import ItemLineTableDS from './ItemLineTableDS';
import ExpertTableDS from './ExpertTableDS';
import SupplierListTableDS from './SupplierListTableDS';
import PrequalScoreElementDS from './PrequalScoreElementDS';
import { prequalHeaderDS } from './Prequal/PrequalHeaderDS';
import { ScoringElementDS } from './ScoringElementDS';
import SourceNoticeDS from './SourceNoticeDS';
import { InitialReviewDS } from './InitialReviewDS';
import SectionInfo from './SectionInfo';
import RfxInfoForm from './RfxInfoForm';
import ItemLineTablePrepare from './ItemLineTablePrepare';
import OrganizationAndStaffForm from './OrganizationAndStaffForm';
import SupplierCompanyForm from './SupplierCompanyForm';
import SupplierWithRequestForm from './SupplierWithRequestForm';
import RfxDemandForm from './RfxDemandForm';
import { SectiontableDS } from './SectionTableDS';
import ReleasePrepareAttachmentDS from './ReleasePrepareAttachmentDS';
import { BiddingBusinessRequestDS, BiddingTimeDS, BiddingRuleDS } from './BiddingDS';

// eslint-disable-next-line
const urlReg = /(ht|f)tp(s?)\:\/\/[0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*(:(0-9)*)*(\/?)([a-zA-Z0-9\-\.\?\,\'\/\\\+&amp;%\$#_]*)?/;

class ReleasePrepareNewComponent extends Component {
  constructor(props = {}) {
    super(props);
    if (props.onRef) {
      props.onRef(this);
    }

    const {
      rfx = {},
      match: { path = null },
    } = props;

    this.ItemLineTable = {};
    this.state = {
      sectionFlag: false, // 是否是分标段
      prequalHeaderDsMap: {}, // 资格预审_头 标段维度分组/组别分组
      prequalScoreElementDsMap: {}, // 资格预审_要素细项 标段维度分组/组别分组
    };

    this.RfxInfoDS = new DataSet(
      props.remote
        ? props.remote.process('SSRC_INQUIRY_HALL_DETAIL_PROCESS_RFXINFODS', RfxInfoDS(rfx), {
            bidFlag: props.bidFlag,
            that: this,
          })
        : RfxInfoDS(rfx)
    );

    this.ItemLineTableDS = new DataSet(
      props.remote
        ? props.remote.process(
            'SSRC_INQUIRY_HALL_DETAIL_PROCESS_ITEM_TABLE_DS',
            ItemLineTableDS(rfx.documentTypeName, { rfxInfoDS: this.RfxInfoDS }),
            {
              bidFlag: props.bidFlag,
            }
          )
        : ItemLineTableDS(rfx.documentTypeName, { rfxInfoDS: this.RfxInfoDS })
    );
    this.SupplierListTableDS = new DataSet(
      props.remote
        ? props.remote.process(
            'SSRC_INQUIRY_HALL_DETAIL_PROCESS_SUPPLIER_TABLE_DS',
            SupplierListTableDS(),
            {
              bidFlag: props.bidFlag,
              isPub: path && path.includes('/pub'),
            }
          )
        : SupplierListTableDS()
    );
    this.PrequalScoreElementDS = new DataSet(PrequalScoreElementDS());
    this.BusinessScoringElementDS = new DataSet(ScoringElementDS({ team: 'BUSINESS' }));
    this.TechnologyScoringElementDS = new DataSet(ScoringElementDS({ team: 'TECHNOLOGY' }));
    /** ********* 协鑫二开新增价格要素-勿动!!! *********** */
    this.PriceScoringElementDS = new DataSet(ScoringElementDS({ team: 'BUSINESS' }));
    this.AllScoringElementDS = new DataSet(ScoringElementDS({ team: 'BUSINESS_TECHNOLOGY' }));
    this.NoneExpertTableDS = new DataSet(ExpertTableDS());
    this.AllExpertTableDS = new DataSet(ExpertTableDS());
    this.SourceNoticeDS = new DataSet(SourceNoticeDS());
    this.InitialReviewDS = new DataSet(InitialReviewDS());
    this.SectionInfoDS = new DataSet(SectiontableDS());
    this.ReleasePrepareAttachmentDS = new DataSet(ReleasePrepareAttachmentDS());
    // 商务要求
    this.BiddingBusinessRequestDS = new DataSet(BiddingBusinessRequestDS());
    // 竞价时间
    this.BiddingTimeDS = new DataSet(BiddingTimeDS());
    // 竞价规则
    this.BiddingRuleDS = new DataSet(BiddingRuleDS());
  }

  getSnapshotBeforeUpdate(prevProps = {}) {
    if (!prevProps) {
      return;
    }

    const {
      match: { params: prevParams = {} },
    } = prevProps;
    const {
      match: { params = {} },
    } = this.props || {};
    const { rfxId: prevId = null } = prevParams;
    const { rfxId = null } = params;
    const RefreshFlag = rfxId && prevId !== rfxId;

    return RefreshFlag;
  }

  componentDidUpdate(...params) {
    if (params[2]) {
      this.fetchPageMain();
    }
  }

  componentDidMount() {
    this.fetchPages();
  }

  fetchPages = () => {
    const { isSection = false, queryParams = {} } = this.props;
    if (isSection) {
      this.fetchPageMain(queryParams);
      return;
    }

    this.fetchPageMain();
  };

  fetchPageMain = (queryParams = {}) => {
    this.initAllDS(queryParams);
    this.fetchInquiryHallUpdate(queryParams);
    this.ItemLineTableDS.query();
  };

  // 判断是否/pub 页面
  isPubPage = () => {
    const {
      match: { path = null },
    } = this.props;
    const IsPublic = path && path.includes('/pub');
    return IsPublic;
  };

  // init all ds
  initAllDS(queryParams = {}) {
    const {
      organizationId = null,
      userId = null,
      match,
      history,
      match: { params = {} },
      rfx = {},
      pubRouterAddParams = () => {},
      remote,
      bidFlag,
      onLoad,
      biddingHallFlag = false,
    } = this.props;
    const { rfxId } = params || {};
    const { unitCodeSymbol } = rfx || {};
    const isPubPage = this.isPubPage();
    const common = {
      rfxHeaderId: rfxId,
      organizationId,
      userId,
      isPubPage,
      biddingHallFlag,
      ...pubRouterAddParams(),
      ...queryParams,
    };

    this.RfxInfoDS.setQueryParameter('commonProps', {
      ...common,
      customizeUnitCode: `SSRC.${unitCodeSymbol}_DETAIL.INFO_PREPARE,SSRC.${unitCodeSymbol}_DETAIL.LINE_ORGANIZATION_DEMAND,SSRC.${unitCodeSymbol}_DETAIL.LINE_ORGANIZATION_EXECUTOR,SSRC.${unitCodeSymbol}_DETAIL.RFX_DEMAND_PREQUAL,SSRC.${unitCodeSymbol}_DETAIL.RFX_DEMAND_QUOTATION,SSRC.${unitCodeSymbol}_DETAIL.RFXPREPARE`,
    });
    this.ItemLineTableDS.setQueryParameter('commonProps', {
      ...common,
      customizeUnitCode: `SSRC.${unitCodeSymbol}_DETAIL.LINE_ITEM`,
    });
    this.SupplierListTableDS.setQueryParameter('commonProps', {
      ...common,
      customizeUnitCode: `SSRC.${unitCodeSymbol}_DETAIL.LINE_SUPPLIER`,
    });
    this.PrequalScoreElementDS.setQueryParameter('commonProps', {
      ...common,
    });
    this.SourceNoticeDS.setQueryParameter('commonProps', {
      ...common,
    });
    this.BusinessScoringElementDS.setQueryParameter('commonProps', {
      ...common,
    });
    this.TechnologyScoringElementDS.setQueryParameter('commonProps', {
      ...common,
    });
    this.AllScoringElementDS.setQueryParameter('commonProps', {
      ...common,
    });
    this.NoneExpertTableDS.setQueryParameter('commonProps', {
      ...common,
    });
    this.AllExpertTableDS.setQueryParameter('commonProps', {
      ...common,
    });
    this.InitialReviewDS.setQueryParameter('commonProps', {
      ...common,
    });
    if (remote?.event) {
      remote.event.fireEvent('remotePrepareInitDsEvent', {
        match,
        history,
        RfxInfoDS: this.RfxInfoDS,
        priceScoringElementDS: this.PriceScoringElementDS,
        ReleasePrepareAttachmentDS: this.ReleasePrepareAttachmentDS,
        commonProps: {
          onLoad,
          ...common,
        },
        bidFlag,
      });
    }
  }

  // 竞价大厅-新竞价进入页面需要重新计算所有时间值
  initCalculateBiddingTime = (header) => {
    const { rfxStatus } = header || {};
    // 单据如果是以下状态，则询价单维护啥明细显示啥，否则代表单子已成功发布，显示具体时间
    const newRfxStatus = [
      'NEW',
      'RELEASE_APPROVING',
      'RELEASE_REJECTED',
      'ROUNDED',
      'CANCELED',
    ].includes(rfxStatus);
    if (newRfxStatus) {
      calculateLatterFieldTime({ record: this.BiddingTimeDS?.current, name: 'signInStartDate' });
    }
  };

  /**
   * onRef获取子组件
   */
  @Bind()
  onRef(ref) {
    this.ItemLineTable = ref;
  }

  @Bind()
  onScoringElementRef(ref) {
    this.scoringElementTable = ref;
  }

  componentWillUnmount() {
    this.unmountPage();
  }

  unmountPage = () => {
    const { remote, bidFlag } = this.props;
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

    if (remote?.event) {
      remote.event.fireEvent('remotePrepareComponentWillUnmountEvent', {
        priceScoringElementDS: this.PriceScoringElementDS,
        bidFlag,
      });
    }
  };

  /**
   * 单位控制配置项查询
   */
  // fetchSetting() {
  //   const { dispatch } = this.props;

  //   dispatch({
  //     type: 'inquiryHall/querySetting',
  //     payload: {
  //       '000112': '000112', // 单位控制
  //     },
  //   }).then((res) => {
  //     if (isEmpty(res)) {
  //       return;
  //     }
  //     const setting000112 = (res['000112'] || {}).settingValue;
  //     this.ItemLineTableDS.setQueryParameter('settings', {
  //       setting000112,
  //     });
  //   });
  // }

  // all ds set query Parameter
  setQueryParameterDS(oldHeader = {}, rfxMember = []) {
    const { doubleUnitFlag = false, remote } = this.props;
    let passwordFlag = null;
    rfxMember.forEach((item) => {
      if (item.rfxRole === 'OPENED_BY') {
        passwordFlag = { item };
        // eslint-disable-next-line prefer-destructuring
        passwordFlag = item.passwordFlag;
      }
    });
    let header = { ...oldHeader, passwordFlag } || {};
    header = remote
      ? remote.process('SSRC_INQUIRY_HALL_DETAIL_PROCESS_SETDS_HEADER', header, { that: this })
      : header;
    header = header || {};

    this.RfxInfoDS.loadData([header]);
    this.loadNewBiddingDSData(header);
    this.ItemLineTableDS.setQueryParameter('headers', header);
    this.SupplierListTableDS.setQueryParameter('headers', header);
    this.NoneExpertTableDS.setQueryParameter('headers', header);
    this.AllExpertTableDS.setQueryParameter('headers', header);
    this.SourceNoticeDS.setQueryParameter('headers', header);
    this.PrequalScoreElementDS.setQueryParameter('headers', header);
    this.ReleasePrepareAttachmentDS.loadData([header]);

    this.SupplierListTableDS.setQueryParameter('company', {
      companyId: header.companyId,
    });
    this.ItemLineTableDS.setQueryParameter('company', {
      companyId: header.companyId,
    });
    this.ItemLineTableDS.setState('doubleUnitFlag', doubleUnitFlag);
  }

  // 加载新竞价数据
  @Bind()
  loadNewBiddingDSData(header) {
    if (this.judgeNewBiddingFlag(header)) {
      const newHeader = { ...(header || {}) };
      const { autoDeferFlag, rfxStatus, biddingAutoDeferStartDate, quotationEndDate } = newHeader;
      // 单据如果是以下状态，则代表单子是发布之前，否则代表单子已成功发布；
      const newRfxStatusFlag = [
        null,
        undefined,
        'null',
        'undefined',
        'NEW',
        'RELEASE_APPROVING',
        'RELEASE_REJECTED',
        'ROUNDED',
        'CANCELED',
      ].includes(rfxStatus);
      if (autoDeferFlag && !newRfxStatusFlag) {
        // 启用了自动延时，则竞价结束时间显示为延时竞价开始时间（不包含延时时长）
        newHeader.quotationEndDate = biddingAutoDeferStartDate;
        this.BiddingTimeDS.setState('quotationEndDate', quotationEndDate);
      }
      // 竞价时间
      this.BiddingTimeDS.loadData([newHeader]);
      // 商务要求
      this.BiddingBusinessRequestDS.loadData([newHeader]);
      // 竞价规则
      this.BiddingRuleDS.loadData([newHeader]);
    }
  }

  // fetch header
  async fetchInquiryHeaderDetails(queryParams = {}) {
    const {
      match: { params, path },
      organizationId,
      rfx = {},
      pubRouterAddParams = () => {},
    } = this.props;
    const rfxHeaderId = params.rfxId || null;
    const isPubPage = this.isPubPage();
    const { unitCodeSymbol } = rfx;
    try {
      let result = await fetchInquiryHeaderDetails({
        organizationId,
        rfxHeaderId,
        path,
        tenantId: organizationId,
        isPubPage,
        customizeUnitCode: `SSRC.${unitCodeSymbol}_DETAIL.INFO_PREPARE,SSRC.${unitCodeSymbol}_DETAIL.LINE_ORGANIZATION_DEMAND,SSRC.${unitCodeSymbol}_DETAIL.LINE_ORGANIZATION_EXECUTOR,SSRC.${unitCodeSymbol}_DETAIL.RFX_DEMAND_PREQUAL,SSRC.${unitCodeSymbol}_DETAIL.RFX_DEMAND_QUOTATION,SSRC.${unitCodeSymbol}_DETAIL.RFXPREPARE,SSRC.${unitCodeSymbol}_DETAIL.ATTACHMENT,${this.getRfxDetailCustomizeCodes()},SSRC.${unitCodeSymbol}_DETAIL.NOTICE,SSRC.${unitCodeSymbol}_DETAIL.SOURCE_METHOD`,
        ...queryParams,
        ...pubRouterAddParams(),
      });
      result = getResponse(result) || {};
      return result;
    } catch (e) {
      throw e;
    }
  }

  // 整合明细页面个性化编码
  @Bind()
  getRfxDetailCustomizeCodes() {
    const { rfx = {} } = this.props;
    const { unitCodeSymbol } = rfx;

    return [
      `SSRC.${unitCodeSymbol}_DETAIL.BUSINESS_REQUEST`, // 商务要求
      `SSRC.${unitCodeSymbol}_DETAIL.BIDDING_TIME`, // 竞价时间
      `SSRC.${unitCodeSymbol}_DETAIL.BIDDING_RULE`, // 竞价规则
    ].join(',');
  }

  /**
   * 查询维护页面信息
   */
  @Bind()
  async fetchInquiryHallUpdate(queryParams = {}) {
    const { remote, onFormLoaded, workflowFormCode } = this.props;
    let newHeader = {};

    try {
      let headers = await this.fetchInquiryHeaderDetails(queryParams);
      const isPubPage = this.isPubPage();
      headers = getResponse(headers);
      if (onFormLoaded && isPubPage) {
        onFormLoaded(true);
      }
      if (!headers) {
        return;
      }
      const {
        preMember = [],
        sourceNotice = {},
        rfxMember = [],
        rfxHeader: header = {},
        projectLineSections = [],
      } = headers || {};
      const { rfxStatus } = header;
      this.SectionInfoDS.loadData(projectLineSections || []);
      if (projectLineSections && projectLineSections.length > 1) {
        this.setState({
          sectionFlag: true,
        });
      }

      const members = this.getBidMemberList(rfxMember);
      const pretrials = this.integrationPretrialMember(preMember);
      newHeader = {
        ...header,
        ...members,
        ...pretrials,
        workflowFormCode,
      };

      this.setQueryParameterDS(newHeader, rfxMember);

      const {
        preQualificationFlag = 0,
        expertScoreType = null,
        sourceMethod = null,
        roundQuotationRule = null,
        mergeType = null,
      } = header || {};

      const autoRoundQuotationFlag =
        roundQuotationRule === 'AUTO' ||
        roundQuotationRule === 'AUTO_CHECK' ||
        roundQuotationRule === 'AUTO_SCORE';

      if (autoRoundQuotationFlag) {
        this.addRFXField(header);
      }
      this.initRoundQuotationDuration(header);

      if (preQualificationFlag) {
        const VisibleOnlyForm =
          rfxStatus === 'NEW' ||
          rfxStatus === 'RELEASE_REJECTED' ||
          rfxStatus === 'RELEASE_APPROVING';
        if (!mergeType || !VisibleOnlyForm) {
          this.setState({ header }, () => {
            this.generatePrequalHeaderMapDs(newHeader);
          });
        } else {
          this.fetchPrequalGroup(newHeader);
        }
      }

      const industryVisible = remote
        ? remote.process(
            'SSRC_INQUIRY_HALL_DETAIL_PROCESS_INDUSTRYVISIBLE',
            sourceMethod && sourceMethod !== 'INVITE',
            { sourceMethod, inviteNoticeFlag: header.inviteNoticeFlag }
          )
        : sourceMethod && sourceMethod !== 'INVITE';

      if (industryVisible) {
        this.SourceNoticeDS.loadData([sourceNotice]);
      }
      if (sourceMethod === 'INVITE') {
        this.SupplierListTableDS.query();
      }
      if (expertScoreType && expertScoreType === 'ONLINE') {
        this.fetchExpert();
        this.fetchScoring();
      }

      // 如果是新竞价 进行以下处理
      if (this.judgeNewBiddingFlag(header)) {
        // 初始化计算竞价大厅竞价时间
        this.initCalculateBiddingTime(header);
      }

      this.forceUpdate();
    } catch (e) {
      throw e;
    }
  }

  // mergeType 为 null, 即不分组情况
  generatePrequalHeaderMapDs(header = {}) {
    const { organizationId } = this.props;
    const { userId = null } = this.state;
    const { rfxHeaderId, preQualificationFlag } = header || {};
    const config = {
      userId,
      rfxHeaderId,
      organizationId,
      preQualificationFlag,
      tenantId: organizationId,
    };
    const prequalHeaderDs = new DataSet(prequalHeaderDS(config));
    prequalHeaderDs.loadData([header || {}]);
    const prequalHeaderDsMap = {
      NONE: prequalHeaderDs,
    };
    this.PrequalScoreElementDS.query();
    this.setState({
      prequalHeaderDsMap,
    });
  }

  /**
   * 查询资格预审分组 - `mergeType` !== `NONE`
   */
  async fetchPrequalGroup(header = {}) {
    const { organizationId } = this.props;
    const {
      mergeType,
      rfxHeaderId,
      sourceProjectId,
      preQualificationFlag,
      multiSectionFlag = 0,
    } = header;
    const { userId = null } = this.state;

    if (!preQualificationFlag || !multiSectionFlag) {
      return;
    }

    const params = {
      organizationId,
      sourceProjectId,
      tempSourceHeaderId: rfxHeaderId,
    };

    const common = {
      rfxHeaderId,
      organizationId,
      tenantId: organizationId,
      userId,
    };
    const prequalHeaderDsMap = {};
    const prequalScoreElementDsMap = {};
    try {
      const result = getResponse(await queryPrequalGroup(params));
      if (Array.isArray(result) && !isEmpty(result)) {
        result.forEach((r) => {
          const prequalHeaderDs = new DataSet(prequalHeaderDS());
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
    } catch (e) {
      throw e;
    } finally {
      this.setState(
        {
          prequalHeaderDsMap,
          prequalScoreElementDsMap,
        },
        this.generatePrequalMemberGroups
      );
    }
    this.forceUpdate();
  }

  // 整合预审小组数据 - 预审 `ALL`
  @Bind()
  @action
  integrationPrequalMembers(data = [], ds = this.state.prequalHeaderDsMap.NONE) {
    const newData = {};
    if (isEmpty(data)) {
      return newData;
    }

    const preGroupMemberLov = data
      .filter((item) => !item.leaderFlag)
      .map((item) => item.realName)
      .join(',');
    const preGroupLeaderLov = data
      .filter((item) => item.leaderFlag)
      .map((item) => item.realName)
      .join(',');

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
      const prequalGroupMemberList = ds.current.get('prequalGroupMemberList');
      this.integrationPrequalMembers(prequalGroupMemberList, ds);
    });
  }

  addRFXField(result = {}) {
    const currentQuotationRounds = [];
    if (result.quotationRounds && result.quotationRounds > 0) {
      for (let i = 1; i < result.quotationRounds + 1; i++) {
        currentQuotationRounds.push(i);
      }
    }
    currentQuotationRounds.forEach((item) => {
      this.RfxInfoDS.addField(`quotationTime${item}`, {
        name: `quotationTime${item}`,
        type: 'string',
        showType: 'dateTime',
        // format: DEFAULT_DATETIME_FORMAT,
        range: [`quotationStartTime${item}`, `quotationEndTime${item}`],
      });
      this.RfxInfoDS.addField(`roundQuotationRunningDurationMeaning${item}`, {
        name: `roundQuotationRunningDurationMeaning${item}`,
        type: 'string',
      });
    });
  }

  @Bind()
  // 多轮报价时间init
  initRoundQuotationDuration(header = {}) {
    const { roundHeaderDates = [], quotationRounds } = header;
    if (isEmpty(roundHeaderDates)) {
      return;
    }

    if (roundHeaderDates && roundHeaderDates.length > 0) {
      this.RfxInfoDS.current.set('quotationRounds', quotationRounds);
      roundHeaderDates.forEach((item) => {
        const {
          quotationRound,
          roundQuotationRunningDuration = 0,
          roundQuotationStartDate,
          roundQuotationEndDate,
          // roundHeaderDateId,
          // objectVersionNumber,
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
        const roundQuotationRunningDurationMeaning = `${quoteDay || 0}${intl
          .get('hzero.common.date.unit.day')
          .d('天')}${quoteHour || 0}${intl.get('hzero.common.date.unit.hours').d('小时')}${
          quoteMinute || 0
        }${intl.get('hzero.common.date.unit.minutes').d('分钟')}`;

        quotationTime[`quotationStartTime${quotationRound}`] = roundQuotationStartDate;
        quotationTime[`quotationEndTime${quotationRound}`] = roundQuotationEndDate;
        // this.RfxInfoDS.current.set(`roundDay${quotationRound}`, quoteDay);
        // this.RfxInfoDS.current.set(`roundHour${quotationRound}`, quoteHour);
        // this.RfxInfoDS.current.set(`roundMinute${quotationRound}`, quoteMinute);
        this.RfxInfoDS.current.set(`quotationTime${quotationRound}`, quotationTime);
        this.RfxInfoDS.current.set(
          `roundQuotationRunningDurationMeaning${quotationRound}`,
          roundQuotationRunningDurationMeaning
        );
        this.RfxInfoDS.current.set(
          `roundQuotationRunningDuration${quotationRound}`,
          roundQuotationRunningDuration
        );
        // this.RfxInfoDS.current.set(`roundHeaderDateId${quotationRound}`, roundHeaderDateId);
        // this.RfxInfoDS.current.set(`objectVersionNumber${quotationRound}`, objectVersionNumber);
      });
    }
  }

  integrationPretrialMember(data = []) {
    let member = {};
    if (Array.isArray(data) && !isEmpty(data)) {
      let preGroupMemberLov = data.filter((item) => !item.leaderFlag);
      let preGroupLeaderLov = data.filter((item) => item.leaderFlag);

      preGroupMemberLov = preGroupMemberLov.map((item) => item.realName).join(',');
      preGroupLeaderLov = preGroupLeaderLov.map((item) => item.realName).join(',');

      member = {
        preGroupMemberLov,
        preGroupLeaderLov,
      };
    }
    return member;
  }

  // 查询预审小组
  // @Bind()
  // async fetchPretrialPanel() {
  //   const {
  //     organizationId,
  //     match: {
  //       params: { rfxId = null },
  //     },
  //   } = this.props;
  //   let data = null;
  //   if (!rfxId || rfxId === 'null') {
  //     return;
  //   }

  //   try {
  //     data =
  //       (await fetchPretrialPanel({
  //         sourceHeaderId: rfxId,
  //         organizationId,
  //         sourceFrom: 'RFX',
  //       })) || [];

  //     if (Array.isArray(data) && !isEmpty(data)) {
  //       let preGroupMemberLov = data.filter((item) => !item.leaderFlag);
  //       let preGroupLeaderLov = data.filter((item) => item.leaderFlag);

  //       preGroupMemberLov = preGroupMemberLov.map((item) => item.realName).join(',');
  //       preGroupLeaderLov = preGroupLeaderLov.map((item) => item.realName).join(',');

  //       data = {
  //         preGroupMemberLov,
  //         preGroupLeaderLov,
  //       };
  //     }
  //   } catch (e) {
  //     throw e;
  //   }

  //   return data;
  // }

  // // 寻源小组
  // @Bind()
  // async fetchInquiryGroup() {
  //   const {
  //     organizationId,
  //     match: {
  //       params: { rfxId = null },
  //     },
  //   } = this.props;
  //   let data = null;

  //   if (!rfxId || rfxId === 'null') {
  //     return;
  //   }

  //   try {
  //     data =
  //       (await fetchInquiryGroup({
  //         rfxHeaderId: rfxId,
  //         organizationId,
  //       })) || [];

  //     if (isEmpty(data)) {
  //       return;
  //     }

  //     data = this.getBidMemberList(data);
  //   } catch (e) {
  //     throw e;
  //   }

  //   return data;
  // }

  // 更新招标小组
  getBidMemberList(data = []) {
    const openBidLov = [];
    const prequalCheckerLov = [];
    const inquierLov = [];
    const checkPriceLov = [];
    const observeLov = [];

    if (!Array.isArray(data) || isEmpty(data)) {
      return {};
    }

    data.forEach((item) => {
      const { rfxRole = null } = item || {};
      if (rfxRole === 'OPENED_BY') {
        openBidLov.push(item);
      }
      if (rfxRole === 'PRETRIAL_BY') {
        prequalCheckerLov.push(item);
      }
      if (rfxRole === 'RFX_BY') {
        inquierLov.push(item);
      }
      if (rfxRole === 'CHECKED_BY') {
        checkPriceLov.push(item);
      }
      if (rfxRole === 'OBSERVE_BY') {
        observeLov.push(item);
      }
    });

    const OpenBidLovData = this.integrateMemberData(openBidLov);
    const prequalCheckerLovData = this.integrateMemberData(prequalCheckerLov);
    const inquierLovData = this.integrateMemberData(inquierLov);
    const checkPriceLovData = this.integrateMemberData(checkPriceLov);
    const observeLovData = this.integrateMemberData(observeLov);
    return {
      openBidLov: OpenBidLovData,
      prequalCheckerLov: prequalCheckerLovData,
      inquierLov: inquierLovData,
      checkPriceLov: checkPriceLovData,
      observeLov: observeLovData,
    };
  }

  // 整合寻源小组数据
  integrateMemberData(old = []) {
    if (isEmpty(old)) {
      return null;
    }
    const newData = old.map((item) => item.realName).join(',');
    return newData;
  }

  // 更新招标小组字段
  updateBidMemberFields(result = []) {
    const {
      openBidLov = [],
      prequalCheckerLov = [],
      inquierLov = [],
      checkPriceLov = [],
      observeLov = [],
    } = this.getBidMemberList(result) || {};
    const openBidLovData = this.integrateMemberData(openBidLov);

    this.RfxInfoDS.current.set('openBidLov', openBidLovData);
    this.RfxInfoDS.current.set('prequalCheckerLov', prequalCheckerLov);
    this.RfxInfoDS.current.set('inquierLov', inquierLov);
    this.RfxInfoDS.current.set('checkPriceLov', checkPriceLov);
    this.RfxInfoDS.current.set('observeLov', observeLov);
  }

  /**
   * 招标公告
   * */
  // async fetchTenderNotice() {
  //   const {
  //     match: { params = {} },
  //     organizationId,
  //   } = this.props;
  //   const { rfxId = null } = params;
  //   let data = null;

  //   if (!rfxId || rfxId === 'null') {
  //     return;
  //   }

  //   try {
  //     data = await fetchTenderNotice({
  //       organizationId,
  //       sourceFrom: 'RFX',
  //       sourceType: 'BR',
  //       sourceHeaderId: rfxId,
  //     });
  //     data = getResponse(data) || {};
  //     if (isEmpty(data)) {
  //       return;
  //     }

  //     this.SourceNoticeDS.loadData([data]);
  //   } catch (e) {
  //     throw e;
  //   }
  // }

  /**
   * 获取专家数据
   *
   * @memberof Update
   */
  async fetchExpert() {
    const {
      match: { params },
      organizationId,
      rfx = {},
      pubRouterAddParams = () => {},
    } = this.props;
    const { rfxId = null } = params;
    const { unitCodeSymbol } = rfx;
    let data = [];
    const bidRuleType = this.RfxInfoDS.current.get('bidRuleType');
    const isPubPage = this.isPubPage();
    if (!rfxId || rfxId === 'null') {
      return;
    }

    try {
      const experts = await fetchExpertAllocationData({
        organizationId,
        sourceHeaderId: rfxId,
        sourceFrom: 'RFX',
        expertStatus: 'SUBMITTED',
        customizeUnitCode: `SSRC.${unitCodeSymbol}_DETAIL.EXPERT`,
        isPubPage,
        ...pubRouterAddParams(),
      });
      if (isEmpty(experts) || isEmpty(experts.evaluateExpertList)) {
        return;
      }

      data = experts.evaluateExpertList || [];
    } catch (e) {
      throw e;
    } finally {
      if (bidRuleType === 'NONE') {
        this.AllExpertTableDS.loadData(data);
      } else {
        this.NoneExpertTableDS.loadData(data);
      }
    }
  }

  /**
   * 获取评分要素数据
   *
   * @memberof Update
   */
  async fetchScoring() {
    const {
      match: { params = {} },
      organizationId,
      rfx = {},
      pubRouterAddParams = () => {},
      remote,
      bidFlag,
    } = this.props;
    const { rfxId = null } = params;
    const { unitCodeSymbol } = rfx || {};
    const isPubPage = this.isPubPage();
    if (!rfxId || rfxId === 'null') {
      return;
    }

    try {
      const data = await fetchTempelateDetailData({
        organizationId,
        sourceHeaderId: rfxId,
        sourceFrom: 'RFX',
        indicStatus: 'SUBMITTED', // 查询提交后的评分要素数据
        indicateLevel: 'ONE', // 查询一级评分要素
        customizeUnitCode: `SSRC.${unitCodeSymbol}_DETAIL.SCORE_INDICS,SSRC.${unitCodeSymbol}_DETAIL.SCORE_INDICS_TECH,SSRC.${unitCodeSymbol}_DETAIL.INITIAL_REVIEW_TABLE`,
        isPubPage,
        ...pubRouterAddParams(),
      });
      if (isEmpty(data)) {
        return;
      }
      const {
        otherIndicList = [],
        businessIndicList = [],
        technologyIndicList = [],
        initialReviewIndicList = [],
      } = data || {};

      const loadBusinessData = (props) => {
        const { dataSource = [] } = props || {};
        this.BusinessScoringElementDS.loadData(dataSource);
      };

      const eventProps = {
        bidFlag,
        rfxInfoDS: this.RfxInfoDS,
        dataSource: businessIndicList,
        priceScoringElementDS: this.PriceScoringElementDS,
        businessScoringElementDS: this.BusinessScoringElementDS,
        loadBusinessData,
      };
      if (remote?.event) {
        remote.event.fireEvent('remotePrepareLoadDataBusinessData', eventProps);
      } else {
        loadBusinessData(eventProps);
      }

      this.TechnologyScoringElementDS.loadData(technologyIndicList);
      this.AllScoringElementDS.loadData(otherIndicList);
      this.InitialReviewDS.loadData(initialReviewIndicList); // 符合性检查

      // this.forceUpdate();
    } catch (e) {
      throw e;
    }
  }

  // 招标公告预览
  @Bind()
  previewNotice() {
    const {
      bidFlag = false,
      match: { params = {} },
    } = this.props;
    const { rfxId = null } = params || {};

    const noticeRecord = this.SourceNoticeDS.current || null;
    if (!noticeRecord) {
      return;
    }

    const noticeId = noticeRecord.get ? noticeRecord.get('noticeId') : null;

    if (!rfxId || !noticeId) {
      notification.warning({
        message: intl.get('hzero.common.components.noticeIcon.null').d('暂无数据'),
      });
      return;
    }

    openTab({
      key: `/ssrc/inquiry-hall/tender-bid${bidFlag ? '-hall' : ''}-notice-preview/${rfxId}`,
      path: `/ssrc/inquiry-hall/tender-bid${bidFlag ? '-hall' : ''}-notice-preview/${rfxId}`,
      // title: intl.get(`ssrc.inquiryHall.view.title.tenderBidNotice`).d('招标公告'),
      title: 'srm.common.tab.title.ssrc.tenderNotice',
      closable: true,
    });
  }

  // 判断是否是竞价大厅-新竞价
  @Bind()
  judgeNewBiddingFlag(header) {
    const { biddingHallFlag } = this.props;
    const { sourceCategory, biddingFlag } = header || {};
    // 竞价大厅标识
    const newBiddingFlag =
      !!biddingHallFlag && sourceCategory === 'RFA' && (biddingFlag === 1 || biddingFlag === '1');
    return newBiddingFlag;
  }

  // 是否是新竞价
  isNewBiddingFlag = () => {
    const { biddingHallFlag } = this.props;
    const { sourceCategory, biddingFlag } =
      this.RfxInfoDS?.current?.get(['sourceCategory', 'biddingFlag']) || {};
    return sourceCategory === 'RFA' && biddingFlag && biddingHallFlag;
  };

  @Bind()
  judgeNewBiddingUnitPriceFlag(header) {
    const { biddingMode, biddingTarget } = header || {};
    // 竞价大厅标识
    const newBiddingFlag =
      this.judgeNewBiddingFlag(header) &&
      biddingMode === 'BRITISH_BIDDING' &&
      biddingTarget === 'UNIT_PRICE';
    return newBiddingFlag;
  }

  /**
   * 供应商列表-风险监控
   */
  @Bind()
  linkRiskScan(record = {}) {
    const { current } = this.RfxInfoDS || {};
    const { rfxHeaderId } = current?.get(['rfxHeaderId']) || {};

    const supplierCompanyId = record.get('supplierCompanyId');
    if (!supplierCompanyId || !rfxHeaderId) {
      return;
    }
    supplierRiskScan({ supplierCompanyId, rfxHeaderId });
  }

  // file list ref
  @Bind()
  handleBindOnRef(ref = {}) {
    this.attachmentRef = ref;
  }

  form;

  /**
   * 设置Form
   * @param {object} ref - BulkAddSupplier组件引用
   */
  @Bind()
  handleBindRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  preQualificationFormRef = null;

  // 资格预审form ref
  setPreQualificationFormRef = (el) => {
    this.preQualificationFormRef = el;
  };

  // temporay override custom and ui bugs
  proxyDsCreate = {
    createNow: true,
    // proxyQuery: this.fetchPages,
  };

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

  // 查看适用范围
  viewApplicationOrgModal = (param = {}) => {
    const handleViewApplicationModal = (params = {}) => {
      const { organizationId, rfxHeaderId, applicationScopeFlag, queryParams = {} } = params || {};
      const Props = {
        queryParams: {
          organizationId,
          sourceHeaderId: rfxHeaderId,
          sourceFrom: 'RFX',
          applicationScopeFlag,
          ...(queryParams || {}),
        },
        sourceHeaderId: rfxHeaderId,
        organizationId,
      };

      const modalKey = Modal.key();
      Modal.open({
        destroyOnClose: true,
        closable: true,
        key: modalKey,
        drawer: true,
        bodyStyle: {
          padding: 0,
        },
        title: intl.get(`ssrc.inquiryHall.view.title.applicationScope`).d('适用范围'),
        children: <ApplicationScopeDetail {...Props} />,
        style: { width: '1090px' },
        okCancel: false,
        okText: intl.get('hzero.common.button.close').d('关闭'),
      });
    };

    const { organizationId, remote } = this.props;
    const { rfxHeaderId = null, applicationScopeFlag = null } =
      this.RfxInfoDS.current?.get(['rfxHeaderId', 'applicationScopeFlag']) || {};

    const props = {
      rfxHeaderId,
      organizationId,
      applicationScopeFlag,
      bidFlag: this.bidFlag,
      queryParams: { ...(param || {}) },
      handleViewApplicationModal,
    };

    if (remote?.event) {
      remote.event.fireEvent('remoteViewApplicationModalEvent', props);
    } else {
      handleViewApplicationModal(props);
    }
  };

  /**
   * 在【对供应商要求】后面, 埋点
   */
  renderCuxAfterSupplierWithRequest = () => {
    const { remote } = this.props;
    let dom = '';

    // 原有数量
    dom = remote
      ? remote.process('SSRC_INQUIRY_HALL_DETAIL_PROCESS_CUX_AFTERSUPPLIERWITHREQUEST_DOM', dom, {
          that: this,
          maintainStyles,
        })
      : dom;
    return dom;
  };

  /**
   * 采购组织及人员
   *
   * 后边埋点
   *
   */
  renderCuxAfterOrganizationAndStaffForm = () => {
    const { remote } = this.props;
    let dom = '';

    // 原有数量
    dom = remote
      ? remote.process('SSRC_INQUIRY_HALL_DETAIL_PROCESS_CUX_AFTERORGANIZATIONANDSTAFF_DOM', dom, {
          that: this,
          maintainStyles,
        })
      : dom;
    return dom;
  };

  render() {
    const {
      settings = [],
      organizationId,
      userId,
      btnFlag = false,
      match,
      match: {
        params: { rfxId = null, rfxLineSupplierSnapId = null },
      },
      location,
      itemDetailsTableProps: { linktoPrNumDetail = () => {} },
      viewLadderLevelPrepare,
      customizeTable = () => {},
      customizeCollapseForm = () => {},
      custLoading = false,
      fetchInquiryHallUpdateLoading = false,
      custConfig,
      rfx = {},
      isSection = false,
      getHocInstance,
      history,
      doubleUnitFlag = false,
      disabledAllLinkFlag = false,
      dispatch,
      bidFlag = false,
      remote,
      serviceChargeFlag,
      sslmLifeCycleNewUser,
      routerParam,
      fileTemplateManageFlag,
      currentStep,
    } = this.props;
    const { omitName, sourceCategoryName = null, unitCodeSymbol } = rfx || {};
    const { sectionFlag, prequalHeaderDsMap, prequalScoreElementDsMap } = this.state;
    const header = this.RfxInfoDS.current ? this.RfxInfoDS.current.toData() : {};

    // 竞价大厅标识
    const newBiddingFlag = this.judgeNewBiddingFlag(header);

    // 竞价大厅-单价竞价 起竞价显示标识 【寻源类别】为【竞价】且【竞价模式】为【英式竞价】且【报价类型】是【单价竞价】，任一不满足时隐藏
    const biddingUnitPrice = this.judgeNewBiddingUnitPriceFlag(header);

    const CommonProps = {
      match,
      location,
      history,
      proxyDsCreate: this.proxyDsCreate,
      rfx,
      header,
      currentStep,
      remote,
      disabledAllLinkFlag,
      newBiddingFlag,
      biddingUnitPrice,
      judgeNewBiddingFlag: this.judgeNewBiddingFlag,
      britishBidding: this.britishBidding,
      japanBiddingTotalPrice: this.japanBiddingTotalPrice,
      japOrDutchBiddingTotalPrice: this.japOrDutchBiddingTotalPrice,
      dutchBiddingTotalPrice: this.dutchBiddingTotalPrice,
    };

    const RfxInfoFormProps = {
      ...CommonProps,
      rfxInfoDS: this.RfxInfoDS,
      customizeCollapseForm,
      custLoading,
      header,
      rfx,
      history,
      remote,
      isPubPage: this.isPubPage(),
      routerParam,
    };

    // 组织及人员props
    const OrganizationAndStaffProps = {
      ...CommonProps,
      organizationId,
      customizeTable,
      getHocInstance,
      customizeCollapseForm,
      rfxInfoDS: this.RfxInfoDS,
      viewApplicationOrgModal: this.viewApplicationOrgModal,
    };
    // 对供应商要求
    const SupplierWithRequestProps = {
      ...CommonProps,
      // riskScanFlag,
      rfx,
      rfxId,
      userId,
      btnFlag,
      organizationId,
      customizeTable,
      customizeCollapseForm,
      rfxInfoDS: this.RfxInfoDS,
      supplierListTableDS: this.SupplierListTableDS,
      sourceNoticeDS: this.SourceNoticeDS,
      biddingBusinessRequestDS: this.BiddingBusinessRequestDS,
      previewNotice: this.previewNotice,
      custLoading,
      onLinkRiskScan: this.linkRiskScan,
      dispatch,
      remote,
      serviceChargeFlag,
      sslmLifeCycleNewUser,
    };
    // 询价要求
    const RfxDemandProps = {
      rfx,
      ...CommonProps,
      organizationId,
      customizeCollapseForm,
      customizeTable,
      sourceHeaderId: rfxId,
      rfxInfoDS: this.RfxInfoDS,
      businessScoringElementDS: this.BusinessScoringElementDS,
      technologyScoringElementDS: this.TechnologyScoringElementDS,
      /** ********* 协鑫二开新增价格要素-勿动!!! *********** */
      priceScoringElementDS: this.PriceScoringElementDS,
      allScoringElementDS: this.AllScoringElementDS,
      noneExpertTableDS: this.NoneExpertTableDS,
      allExpertTableDS: this.AllExpertTableDS,
      prequalScoreElementDS: this.PrequalScoreElementDS,
      initialReviewDS: this.InitialReviewDS,
      biddingTimeDS: this.BiddingTimeDS,
      biddingRuleDS: this.BiddingRuleDS,
      custConfig: custConfig[`SSRC.${unitCodeSymbol}_DETAIL.RFXPREPARE`]?.fields,
      prequalHeaderDsMap,
      prequalScoreElementDsMap,
      bidFlag,
      remote,
      preQualificationFormRef: this.setPreQualificationFormRef,
      serviceChargeFlag,
    };

    // itemLine
    const itemLineTableProps = {
      ...CommonProps,
      rfx,
      rfxInfoDS: this.RfxInfoDS,
      itemLineTableDS: this.ItemLineTableDS,
      rfxId,
      settings,
      doubleUnitFlag,
      customizeTable,
      custLoading,
      header,
      organizationId,
      onRef: this.onRef,
      showQuotationDetail: this.showQuotationDetail,
      viewLadderLevelPrepare,
      linktoPrNumDetail,
      btnFlag,
      viewApplicationOrgModal: this.viewApplicationOrgModal,
      remote,
      bidFlag,
    };

    // 标段props
    const SetctionInfoProps = {
      ...CommonProps,
      rfx,
      header,
      rfxId,
      settings,
      doubleUnitFlag,
      rfxInfoDS: this.RfxInfoDS,
      sectionInfoDS: this.SectionInfoDS,
      customizeTable,
      custLoading,
      organizationId,
      onRef: this.onSectionRef,
      showQuotationDetail: this.showQuotationDetail,
      viewLadderLevelPrepare,
      linktoPrNumDetail,
    };

    // file props
    const AttachmentsProps = {
      customizeCollapseForm,
      rfx,
      viewOnly: true,
      getHocInstance,
      ReleasePrepareAttachmentDS: this.ReleasePrepareAttachmentDS,
      isSection,
      header,
      fileTemplateManageFlag,
      customizeTable,
    };

    const supplierCompanyFormProps = {
      rfxLineSupplierSnapId,
      organizationId,
    };

    const baseInfo = {
      name: 'baseInfo',
      title: (
        <h3 id="rfxBasicInfo" className={maintainStyles['rfx-card-item-title']}>
          {intl
            .get('ssrc.inquiryHall.view.inquiryHall.rfxBasicInfoRFX', {
              omitName,
            })
            .d(`{omitName}基础信息`)}
        </h3>
      ),
      content: (
        <Spin dataSet={this.RfxInfoDS}>
          <RfxInfoForm {...RfxInfoFormProps} />
        </Spin>
      ),
    };

    const orgStaff = {
      name: 'orgStaff',
      content: <OrganizationAndStaffForm {...OrganizationAndStaffProps} />,
    };

    const sectionItem = {
      name: 'sectionItem',
      title: (
        <h3 id="organizationAndStaff" className={maintainStyles['rfx-card-item-title']}>
          {intl.get('ssrc.inquiryHall.view.inquiryHall.section').d('标段')}
        </h3>
      ),
      content: <SectionInfo {...SetctionInfoProps} />,
    };

    const item = {
      name: 'item',
      title: (
        <h3 id="rfxItemLines" className={maintainStyles['rfx-card-item-title']}>
          {intl
            .get('ssrc.inquiryHall.view.inquiryHall.rfxItemLinesRFX', {
              omitName,
            })
            .d(`{omitName}标的物`)}
        </h3>
      ),
      content: <ItemLineTablePrepare {...itemLineTableProps} />,
    };

    const supplier = {
      name: 'supplier',
      title: (
        <h3 id="supplierWithRequest" className={maintainStyles['rfx-card-item-title']}>
          {intl.get('ssrc.inquiryHall.view.inquiryHall.supplierWithRequest').d('对供应商要求')}
        </h3>
      ),
      content: <SupplierWithRequestForm {...SupplierWithRequestProps} />,
    };

    const demand = {
      name: 'demand',
      title: (
        <h3 id="rfxDeamnd" className={maintainStyles['rfx-card-item-title']}>
          {newBiddingFlag
            ? intl.get('ssrc.common.view.biddingRequest').d('竞价要求')
            : intl
                .get('ssrc.inquiryHall.view.inquiryHall.rfxDeamndRFX', {
                  sourceCategoryName,
                })
                .d(`{sourceCategoryName}要求`)}
        </h3>
      ),
      content: <RfxDemandForm {...RfxDemandProps} />,
    };

    const supplierSnap = {
      name: 'supplierSnap',
      title: (
        <h3 id="newAddSupplierCompany" className={maintainStyles['rfx-card-item-title']}>
          {intl.get('ssrc.inquiryHall.view.inquiryHall.newAddSupplierCompany').d('新添加供应商')}
        </h3>
      ),
      content: <SupplierCompanyForm {...supplierCompanyFormProps} />,
    };

    const file = {
      name: 'file',
      content: remote ? (
        remote.render(
          'SSRC_INQUIRY_HALL_DETAIL_RENDER_PREPARE_ATTACHMENT_CARD',
          <ReleasePrepareAttachment {...AttachmentsProps} />,
          {
            rfx,
            rfxId,
            bidFlag,
            that: this,
            rfxInfoDS: this.RfxInfoDS,
          }
        )
      ) : (
        <ReleasePrepareAttachment {...AttachmentsProps} />
      ),
    };

    const allRenderData = {
      baseInfo,
      orgStaff,
      sectionItem,
      item,
      supplier,
      demand,
      supplierSnap,
      file,
    };
    // ({ baseInfo, sectionItem, item, supplier, demand, supplierSnap } = remote
    //   ? remote.process('SSRC_INQUIRY_HALL_DETAIL_PROCESS_RENDER_DATA_OBJECT', allRenderData, {
    //       that: this,
    //       maintainStyles,
    //     })
    //   : allRenderData);

    let mainContent = (
      <div className={classnames(maintainStyles['rfx-detail-list-card'])}>
        {rfxLineSupplierSnapId ? (
          <Content className={maintainStyles['custom-page-content']}>
            {supplierSnap.title}
            {supplierSnap.content}
          </Content>
        ) : null}
        <Content
          className={maintainStyles['custom-page-content']}
          style={{ marginTop: this.isPubPage() ? '8px' : '0' }}
        >
          {baseInfo.title}
          {baseInfo.content}
        </Content>
        {orgStaff.content}
        {this.renderCuxAfterOrganizationAndStaffForm()}
        {sectionFlag ? (
          <Content className={maintainStyles['custom-page-content']}>
            {sectionItem.title}
            {sectionItem.content}
          </Content>
        ) : (
          <Content className={maintainStyles['custom-page-content']}>
            {item.title}
            {item.content}
          </Content>
        )}
        <Content className={maintainStyles['custom-page-content']}>
          {supplier.title}
          {supplier.content}
        </Content>

        {this.renderCuxAfterSupplierWithRequest()}

        <Content className={maintainStyles['custom-page-content']}>
          {demand.title}
          {demand.content}
        </Content>
        {file.content}
      </div>
    );

    mainContent = remote
      ? remote.process('SSRC_INQUIRY_HALL_DETAIL_PROCESS_MAIN_CONTENT', mainContent, {
          that: this,
          maintainStyles,
          allRenderData,
        })
      : mainContent;

    return (
      <React.Fragment>
        <div
          className={classnames(
            'ued-detail-wrapper',
            maintainStyles['update-container'],
            detailStyles['rfx-detail-new-conteiner']
          )}
          style={isSection ? {} : { height: 'initial' }}
          id="ssrc-inquiry-hall-new-release-node-approval-wrap-id"
        >
          <ChoerodonSpin spinning={fetchInquiryHallUpdateLoading}>
            <div className={maintainStyles['ued-detail-container']}>
              <AnchorSsrc
                rfx={rfx}
                rfxLineSupplierSnapId={rfxLineSupplierSnapId}
                newBiddingFlag={newBiddingFlag}
                currentAnchorContainer={() =>
                  document.getElementsByClassName(maintainStyles['update-container'])[0] ||
                  document.body
                }
              />

              {mainContent}
            </div>
          </ChoerodonSpin>
        </div>
      </React.Fragment>
    );
  }
}

const hocReleasePrepareNew = (Com, { currentPageSymbol = 'INQUIRY_HALL' } = {}) => {
  return WithCustomizeC7N({
    unitCode: [
      `SSRC.${currentPageSymbol}_DETAIL.INFO_PREPARE`, // 基本信息
      `SSRC.${currentPageSymbol}_DETAIL.LINE_ORGANIZATION_DEMAND`, // 采购组织及人员-需求方
      `SSRC.${currentPageSymbol}_DETAIL.LINE_ORGANIZATION_EXECUTOR`, // 采购组织及人员-采购执行人
      `SSRC.${currentPageSymbol}_DETAIL.LINE_ITEM`, // 物品行
      `SSRC.${currentPageSymbol}_DETAIL.LINE_SUPPLIER`, // 供应商行
      `SSRC.${currentPageSymbol}_DETAIL.RFX_DEMAND_PREQUAL`, // 询价要求-资格预审
      `SSRC.${currentPageSymbol}_DETAIL.RFX_DEMAND_QUOTATION`, // 询价要求-报价
      `SSRC.${currentPageSymbol}_DETAIL.SCORE_INDICS`, // 发布准备-评分要素
      `SSRC.${currentPageSymbol}_DETAIL.SCORE_INDICS_TECH`, // 发布准备-评分要素-技术
      `SSRC.${currentPageSymbol}_DETAIL.EXPERT`, // 发布准备-专家评分
      `SSRC.${currentPageSymbol}_DETAIL.INITIAL_REVIEW_TABLE`, // 发布准备-询价要求-符合性检查
      `SSRC.${currentPageSymbol}_DETAIL.SCORE.EXPERT_ASSIGN`, // 发布准备-评分要素-专家分配
      `SSRC.${currentPageSymbol}_DETAIL.SECTION_ITEM`, // 发布准备-多标段
      `SSRC.${currentPageSymbol}_DETAIL.SOURCE_METHOD`, // 发布准备-对供应商要求-寻源方式
      `SSRC.${currentPageSymbol}_DETAIL.NOTICE`, // 发布准备-对供应商要求-公告
      `SSRC.${currentPageSymbol}_DETAIL.ALLOW_SUPPLIERSTAGE`, // 发布准备-对供应商要求-可参与寻源供应商阶段
      `SSRC.${currentPageSymbol}_DETAIL.RFXPREPARE`, // 发布准备-询价要求-寻源准备
      `SSRC.${currentPageSymbol}_DETAIL.ATTACHMENT`, // 发布准备-询价要求-附件表单
      `SSRC.${currentPageSymbol}_DETAIL.ATTACHMENT_CARD`, // 发布准备-询价要求-附件-CARD
      `SSRC.${currentPageSymbol}_DETAIL.BUSINESS_REQUEST`, // 商务要求
      `SSRC.${currentPageSymbol}_DETAIL.BIDDING_TIME`, // 竞价时间
      `SSRC.${currentPageSymbol}_DETAIL.BIDDING_RULE`, // 竞价规则
      `SSRC.${currentPageSymbol}_DETAIL.SUPPLIER_ALLOT_ITEM`, // 发布准备-对供应商要求-分配物料
      `SSRC.${currentPageSymbol}_DETAIL.ORGANIZATION_AND_STAFF_CARD`, // 发布准备-采购组织人员-卡片标题
      `SSRC.${currentPageSymbol}_DETAIL.ATTACHMENT_REQUIREMENT_TABLE`, // 文件管理-表格行
    ],
  })(observer(Com));
};

const ReleasePrepareNew = hocReleasePrepareNew(ReleasePrepareNewComponent);
export default ReleasePrepareNew;

export { ReleasePrepareNewComponent, hocReleasePrepareNew };
