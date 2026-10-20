/**
 * inquiryHall - 寻源服务/询价大厅-维护
 * @date: 2018-12-26
 * @author: CJ <juan.chen01@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import { Button, Form, Modal, Spin, Tabs, Tooltip, Collapse, Icon } from 'hzero-ui';
// import { DataSet } from 'choerodon-ui/pro';
import { Bind, debounce } from 'lodash-decorators';
import { filter, isEmpty, isUndefined, isNull, isObject } from 'lodash';
import uuidv4 from 'uuid/v4';
import { routerRedux } from 'dva/router';
import classnames from 'classnames';
import queryString from 'querystring';

import { Content, Header } from 'components/Page';
import Lov from 'components/Lov';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import notification from 'utils/notification';
import {
  addItemToPagination,
  delItemsToPagination,
  delItemToPagination,
  filterNullValueObject,
  getCurrentOrganizationId,
  getCurrentUserId,
  getEditTableData,
  addItemsToPagination,
  getCurrentTenant,
  getResponse,
} from 'utils/utils';
import {
  DATETIME_MIN,
  DEFAULT_DATETIME_FORMAT,
  EDIT_FORM_ITEM_LAYOUT,
  DATETIME_MAX,
} from 'utils/constants';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { openTab } from 'utils/menuTab';
import { dateFormate, isText, getSupplierRelationUrl } from '@/utils/utils';
import { PRIVATE_BUCKET } from '_utils/config';

import MatterDetail from '@/routes/components/MatterDetail/EditMatterDetail';
import { validatorConfirmModal } from '@/routes/components/ConfirmModal';
import { validateBeforeRelease, fetchConfigSheet } from '@/services/inquiryHallNewService';
import { supplierRelationMapNew } from '@/services/inquiryHallService';
import ExpertSubAccountModal from '@/routes/components/ExpertSubAccount';
import ExpertLibraryModal from '@/routes/components/ExpertLibrary';
import common from '@/routes/ssrc/common.less';
import {
  queryEnableDoubleUnit,
  fetchIndustyType,
  fetchIndustyCategory,
} from '@/services/commonService';
import BasicHeaderForm from './BasicHeaderForm';
import RfxRuleForm from './RfxRuleForm';
import RfxNoticeForm from './RfxNoticeForm';
import BiddingRuleForm from './BiddingRuleForm';
import ItemLineTable from './ItemLineTable';
import SupplierLineTable from './SupplierLineTable';
import QualificationForm from './QualificationForm';
import BidOpenerCartridge from './BidOpenerCartridge';
import BulkAddSupplier from './BulkAddSupplier';
import Attachment from '../../components/Attachment';
import ScoringElementModal from './ScoringElementModal';
import ProfessionalTable from './ProfessionalTable';
import ScoringElementsTable from './ScoringElementsTable';
import SupplierQualificationModal from './SupplierQualificationModal';

// import ItemLineTableDS from './ItemLineTableDS';

import styles from './index.less';

const FormItem = Form.Item;
const { Panel } = Collapse;
const UEDDisplayFormItem = (props) => {
  const { label, value } = props;
  return (
    <FormItem label={label} {...EDIT_FORM_ITEM_LAYOUT}>
      {value}
    </FormItem>
  );
};
const LONG_LABEL_FORM_ITEM_LAYOUT = {
  labelCol: {
    span: 12,
  },
  wrapperCol: {
    span: 12,
  },
};

const addQuoteSymbol = (fields) => {
  const field = `【${fields}】`;
  return field;
};

// eslint-disable-next-line
const urlReg = /(ht|f)tp(s?)\:\/\/[0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*(:(0-9)*)*(\/?)([a-zA-Z0-9\-\.\?\,\'\/\\\+&amp;%\$#_]*)?/;

class Update extends Component {
  constructor(props) {
    super(props);
    // const { queryUnitConfig } = props;
    //
    // queryUnitConfig({}, (res) => {
    //   const unitConfig = res['SSRC.INQUIRY_HALL.EDIT_LINE'];
    //   if (unitConfig) {
    //     const filterDynamicProps = {};
    //     unitConfig.fields.forEach((field) => {
    //       const filters = [];
    //       const { required, conditionHeaderDTOs = [], fieldCode, defaultValue } = field;
    //       if (required !== -1) {
    //         filters.push('required');
    //       }
    //       if (Number(defaultValue)) {
    //         filters.push('defaultValue');
    //       }
    //       conditionHeaderDTOs.forEach((cond) => {
    //         if (!filters.includes(cond.conType)) {
    //           filters.push(cond.conType);
    //         }
    //       });
    //       filterDynamicProps[fieldCode] = filters;
    //     });
    //     this.setConfigs('filterDynamicProps', filterDynamicProps);
    //   }
    // });

    this.ItemLineTable = {};
    this.state = {
      verticalCollapseKeys: ['baseInfos', 'otherInfos', 'biddingRules', 'rfxNotice', 'rfxDetals'], // 竖版折叠面板keys
      isHorizontal: true, // 是否是横/竖排版
      tabsActiveKey: 'baseInfos', // 第一部分切换面板key
      verticalReviewMessageTabsActiveKey: 'preQualification', // 竖版－评审信息－切换面板key
      bidholderVisible: false, // 开标人弹框
      supplierQualificationData: [], // 未处理的供应商资质到期数据
      supplierQualificationVisible: false, // 供应商资质到期提醒模态框可见
      supplierQualificationSelectedRows: [], // 供应商资质到期提醒选中行
      supplierQualificationDataSource: [], // 供应商资质到期数据
      newBidholder: 0, // 新增开标人个数
      itemLineSelectedRows: [], // 物品明细选中行
      itemLineSelectedRowKeys: [], // 物品明细选中id
      ladderLevelSelectedRowKeys: [], // 阶梯报价选中id
      ladderLevelSelectedRows: [], // 阶梯报价选中行
      supplierLineSelectedRowKeys: [], // 供应商列表选中行
      supplierLineSelectedRows: [], // 供应商勾选整条数据
      selectedRowKeys: [], // 开标人选中行
      // businessAttachmentUuid: '', // 打开模态框新建的uuid 自动生成商务附件uuid
      // techAttachmentUuid: '', // 打开模态框新建的uuid 自动生成技术附件uuid
      viewOnly: false, // 是否只读标识位
      endOpen: false,
      bucketDirectory: 'ssrc-rfx-rfxheader',
      bulkAddSupplierVisible: false, // 批量添加供应商模态框可见
      bulkAddSupplierSelectedRows: [], // 批量添加供应商选中行
      bulkAddSupplierSelectedRowKeys: [],
      isQuotationRunningDurationError: false, // 竞价运行时间是否有错
      isStartQuotationRunningDurationError: false, // 报价运行时间是否有错
      scoringElementVisible: false, // 评分要素定义模态框可见
      scoringElementSelectedRows: [], // 评分要素定义选中行
      viewLadderLevelVisible: false, // 阶梯报价模态框
      LadderLevelHeaderData: {}, // 阶梯报价头部数据
      collapseKeys: ['baseInfo'], // 打开的折叠面板key
      expertSaveType: '', // 保存的类型-> BUSINESS/TECHNOLOGY/''
      expertLineSelectedRows: [], // 所选择专家行
      expertLineSelectedRowKeys: [], // 所选专家keys
      evaluateAssignModalVisible: false, // 评分要素分配专家model
      tabScoringElementSelectedRows: [], // 评分要素行
      scoringElementSelectedRowKeys: [], // 评分要素行keys
      itemLineQuotationDetailModalVisible: false, // 物品行报价明细弹窗
      itemRecord: {},
      itemQuotationDetailModalVisible: false,
      itemLineEditoringId: 0, // 物品行当前操作行id
      matterDetail: '', // 寻源事项详情
      matterRequireFlag: 0,
      quotationDetailVisible: false, // 报价明细
      itemLineRecord: {}, // 物品行记录
      expertModalVisible: false, // 专家子账户弹窗
      expertSource: '', // 专家子账户数据来源 - 'EXPERT_LIBRARY'/'SUB_ACCOUNT'
      allowAddItems: 1, // 是否显示新增按钮
      batchMaintainItemLineVisible: false, // 批量维护物料行表单
      doubleUnitFlag: false, // 是否开启双单位flag
      industry: [], // 行内关系
      industryCategory: [], // 主营品类
      releaseConfirmLoading: false, // 发布校验loading
    };
    // const {
    //   match: { params },
    //   organizationId,
    //   userId,
    // } = this.props;
    // const queryParams = {
    //   rfxHeaderId: params.rfxId,
    //   organizationId,
    //   userId,
    //   customizeUnitCode: 'SSRC.INQUIRY_HALL.EDIT_LINE',
    // };
    // this.itemLineTableDS = new DataSet(ItemLineTableDS(queryParams, () => this.configs));
  }

  // configs = {
  //   filterDynamicProps: {},
  // };

  // itemLineTableDS = new DataSet(ItemLineTableDS(() => this.configs));

  MatterDetail;

  componentDidMount() {
    this.initPageAll();
  }

  initPageAll() {
    // this.initAllDS();
    this.fetchRfxDetailLayout();
    this.fetchInquiryHallUpdate();
    this.fetchSetting();
    // this.itemLineTableDS.query();
    this.fetchConfig();
    this.queryDoubleUnit();
  }

  // 查询双单位是否开启
  queryDoubleUnit = async () => {
    const res = await queryEnableDoubleUnit({
      businessModule: 'RFX',
    });
    if (isText(res)) {
      this.setState({
        doubleUnitFlag: !!Number(res),
      });
    }
  };

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

  componentDidUpdate(...isSnap) {
    if (isSnap[2]) {
      this.initPageAll();
    }
  }

  // @Bind()
  // setConfigs(key, v) {
  //   this.configs[key] = v;
  // }
  //
  // initAllDS() {
  //   const {
  //     match: { params },
  //     organizationId,
  //     userId,
  //   } = this.props;
  //   this.itemLineTableDS.addField('commonProps', {
  //     defaultValue: {
  //       rfxHeaderId: params.rfxId,
  //       organizationId,
  //       userId,
  //       customizeUnitCode: 'SSRC.INQUIRY_HALL.EDIT_LINE',
  //     },
  //   });
  // }

  // 查询询价单头信息
  fetchRfxHeader() {
    const {
      match: { params, path },
      dispatch,
      organizationId,
    } = this.props;

    dispatch({
      type: 'inquiryHall/fetchInquiryHeaderDetail',
      payload: {
        organizationId,
        rfxHeaderId: params.rfxId,
        path,
        tenantId: organizationId,
        customizeUnitCode: 'SSRC.INQUIRY_HALL.EDIT_HEADER',
      },
    }).then((res = null) => {
      if (!res) {
        return;
      }

      const { matterDetail = '', matterRequireFlag = 0, objectVersionNumber = null } = res;
      this.setState({
        matterDetail,
        matterRequireFlag,
        objectVersionNumber,
      });
    });
  }

  /**
   * 字段字典
   * */
  fieldConstant() {
    const field = {
      baseInfos: {
        rfxTitle: `【${intl
          .get(`ssrc.inquiryHall.model.inquiryHall.inquiryTitle`)
          .d('询价单标题')}】`,
        companyId: `【${intl.get('ssrc.common.company').d('公司')}】`,
        currencyCode: `【${intl.get(`ssrc.inquiryHall.model.inquiryHall.currency`).d('币种')}】`,
        quotationStartDate: `【${intl
          .get('ssrc.inquiryHall.model.inquiryHall.quotationStartTime')
          .d('报价开始时间')}】`,
        quotationEndDate: `【${intl
          .get(`ssrc.inquiryHall.model.inquiryHall.quotationDeadline`)
          .d('报价截止时间')}】`,
        quoteDay: `【${intl.get('hzero.common.date.unit.day').d('天')}】`,
        quoteHour: `【${intl.get('hzero.common.date.unit.hours').d('小时')}】`,
        quoteMinute: `【${intl.get('hzero.common.date.unit.minutes').d('分钟')}】`,
        startQuotationRunningDuration: `【${intl
          .get(`ssrc.inquiryHall.model.inquiryHall.quotRunningDuration`)
          .d('报价运行时间')}】`,
        bidBond: `【${intl
          .get('ssrc.inquiryHall.model.inquiryHall.bidBondYuan')
          .d('保证金(元)')}】`,
      },
      noticeList: {
        noticeTitle: `【${intl.get('ssrc.bidHall.model.bidHall.noticeTitle').d('公告标题')}】`,
        noticeDays: `【${intl.get('ssrc.bidHall.model.bidHall.noticeDays').d('公告天数')}】`,
        purName: `【${intl.get('ssrc.bidHall.model.bidHall.purchasingContact').d('采购联系人')}】`,
        purPhone: `【${intl.get(`ssrc.bidHall.model.bidHall.contactPhone`).d('联系人电话')}】`,
        purEmail: `【${intl.get(`ssrc.bidHall.model.bidHall.contactMail`).d('联系人邮箱')}】`,
      },
      professional: {
        loginName: `【${intl
          .get(`ssrc.inquiryHall.model.inquiryHall.expertSubAccount`)
          .d('专家子账户')}】`,
      },
      scoringElements: {
        indicateName: `【${intl
          .get(`ssrc.inquiryHall.model.inquiryHall.indicateName`)
          .d('要素名称')}】`,
        indicateType: `【${intl
          .get('ssrc.inquiryHall.view.inquiryHall.scoreIndType')
          .d('要素类型')}】`,
        weight: `【${intl.get(`ssrc.inquiryHall.model.inquiryHall.weight`).d('权重')}】`,
        minScore: `【${intl.get(`ssrc.inquiryHall.model.inquiryHall.minScore`).d('最低分')}】`,
        maxScore: `【${intl.get(`ssrc.inquiryHall.model.inquiryHall.maxScore`).d('最高分')}】`,
      },
      supplierDataList: {
        supplierCompanyId: `【${intl
          .get(`ssrc.inquiryHall.model.inquiryHall.supplierCode`)
          .d('供应商编码')}】`,
        contactName: `【${intl.get(`ssrc.inquiryHall.model.inquiryHall.contacts`).d('联系人')}】`,
      },
      FieldNotInputText: intl
        .get('ssrc.inquiryHall.view.inquiryHall.fieldNotInput')
        .d('需正确填写'),
      otherInfos: {
        templateId: `【${intl
          .get(`ssrc.inquiryHall.model.inquiryHall.sourcingTemplate`)
          .d('寻源模板')}】`,
        quotationScope: `【${intl
          .get(`ssrc.inquiryHall.model.inquiryHall.quotationScope`)
          .d('报价范围')}】`,
        sourceMethod: `【${intl
          .get(`ssrc.inquiryHall.model.inquiryHall.sourcingApproach`)
          .d('寻源方式')}】`,
        quotationType: `【${intl
          .get(`ssrc.inquiryHall.model.inquiryHall.quotationType`)
          .d('报价方式')}】`,
        auctionDirection: `【${intl
          .get(`ssrc.inquiryHall.model.inquiryHall.biddingDirection`)
          .d('报价方向')}】`,
        minQuotedSupplier: `【${intl
          .get('ssrc.inquiryHall.model.inquiryHall.minQuotedSupplier')
          .d('最少报价供应商数')}】`,
      },
      biddingRules: {
        quotationOrderType: `【${intl
          .get(`ssrc.inquiryHall.model.inquiryHall.quotationOrderType`)
          .d('报价次序')}】`,
        quotationRunningDuration: `【${intl
          .get(`ssrc.inquiryHall.model.inquiryHall.biddingRunningTime`)
          .d('竞价运行时间')}】`,
        quotationInterval: `【${intl
          .get(`ssrc.inquiryHall.model.inquiryHall.quotationInterval`)
          .d('报价间隔时间')}】`,
        auctionRule: `【${intl
          .get(`ssrc.inquiryHall.model.inquiryHall.auctionRule`)
          .d('竞价规则')}】`,
        autoDeferDuration: `【${intl
          .get(`ssrc.inquiryHall.model.inquiryHall.autoDeferDuration`)
          .d('延时时长')}】`,
        openRule: `【${intl.get(`ssrc.inquiryHall.model.inquiryHall.openRule`).d('公开规则')}】`,
      },
      preQualification: {
        prequalEndDate: `【${intl
          .get('ssrc.inquiryHall.model.inquiryHall.prequalEndDate')
          .d('预审截止时间')}】`,
        reviewMethod: `【${intl
          .get('ssrc.inquiryHall.model.inquiryHall.reviewMethod')
          .d('审查方式')}】`,
        qualifiedLimit: `【${intl
          .get('ssrc.inquiryHall.model.inquiryHall.qualifiedLimit')
          .d('合格上限')}】`,
        pretrialPanel: `【${intl.get('ssrc.common.pretrialPanel').d('预审小组')}】`,
      },
      itemListFields: {
        ouId: addQuoteSymbol(
          intl.get(`ssrc.inquiryHall.model.inquiryHall.businessUnit`).d('业务实体')
        ),
        itemName: addQuoteSymbol(
          intl.get(`ssrc.inquiryHall.model.inquiryHall.itemName`).d('物料名称')
        ),
        itemCategoryId: addQuoteSymbol(
          intl.get(`ssrc.inquiryHall.model.inquiryHall.itemCategory`).d('物料类别')
        ),
        secondaryQuantity: addQuoteSymbol(
          intl.get(`ssrc.inquiryHall.model.inquiryHall.quantity`).d('需求数量')
        ),
        secondaryUomId: addQuoteSymbol(
          intl.get(`ssrc.inquiryHall.model.inquiryHall.unit`).d('单位')
        ),
        taxId: addQuoteSymbol(
          intl.get(`ssrc.inquiryHall.model.inquiryHall.taxRate`).d('税率（%）')
        ),
      },
      fieldNotInput: intl.get('ssrc.inquiryHall.view.inquiryHall.fieldNotInput').d('需正确填写'),
    };

    return field;
  }

  /**
   * 竞价规则文案描述
   */
  @Bind()
  biddingRuleForm = (type) => {
    let defaultTitle;
    let title;
    switch (type) {
      // 报价次序
      case 'quotationOrderType':
        defaultTitle = `${intl
          .get(`ssrc.inquiryHall.model.inquiryHall.quotationOrderType`)
          .d('报价次序')}`;
        title = `${intl
          .get(`ssrc.inquiryHall.model.inquiryHall.biddingOrderRule`)
          .d(
            '在竞价寻源类别中，用于配置每个物料行的竞价次序。“并行“表示所有物料行同时开始和结束竞价；“序列”表示所有物料行按照行号依次开始竞价，待上一物料行结束之后，下一物料行再开始；“交错”表示所有物料行同时开始竞价，然后按照间隔时间依次结束竞价。'
          )}`;
        break;
      // 密封报价
      case 'sealedQuotation':
        defaultTitle = `${intl
          .get(`ssrc.inquiryHall.model.inquiryHall.sealedQuotation`)
          .d('密封报价')}`;
        title = `${intl
          .get(`ssrc.inquiryHall.model.inquiryHall.informationControl`)
          .d(
            '用于控制在报价期间内，所有报价信息是否对采购员密封保密。勾选表示采购员在报价期间内看不到任何报价信息；不勾选则采购员在报价期间内可以查看所有的'
          )}`;
        break;
      // 最少报价供应商数
      case 'minQuotedSupplier':
        defaultTitle = intl
          .get('ssrc.inquiryHall.model.inquiryHall.minQuotedSupplier')
          .d('最少报价供应商数');
        title = intl
          .get('ssrc.inquiryHall.model.inquiryHall.minQuotedSupplierTitle')
          .d('“当报价供应商数量”小于“最少报价供应商数”时，报价截止后需人工决定询价是否继续进行');
        break;
      default:
        break;
    }
    return (
      <Tooltip title={title} placement="right">
        {defaultTitle}
      </Tooltip>
    );
  };

  /**
   * onRef获取子组件
   */
  @Bind()
  onRef(ref) {
    this.ItemLineTable = ref;
  }

  /**
   * onRef获取子组件
   */
  @Bind()
  onScoringElementRef(ref) {
    this.scoringElementTable = ref;
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'inquiryHall/updateState',
      payload: {
        header: {},
        itemLine: [],
        supplierLine: [],
        itemLineChange: false,
        supplierLineChange: false,
        itemLinePagination: {},
        supplierLinePagination: {},
        bidHolderList: [],
        bidHolderPagination: {},
        supplierData: [],
        bulkSupplierList: [],
        ladderLevelData: [],
        bulkSupplierListPagination: {},
        scoringElement: [],
        itemLineQuotationDetail: [],
        tenderNoticeInfo: {},
      },
    });

    dispatch({
      type: 'bidHall/updateState',
      payload: {
        evaluateExpertList: [], // none/diff 合并
        scoringNoneTempelate: [],
        scoringBusinessTempelate: [],
        scoringTechnologyTempelate: [],
        currentScoringExperts: [],
      },
    });
    // this.itemLineTableDS.reset();
  }

  /**
   * 单位控制配置项查询
   */

  fetchSetting() {
    const { dispatch } = this.props;

    dispatch({
      type: 'inquiryHall/querySetting',
      payload: {
        '000112': '000112', // 单位控制
      },
    }).then(() => {
      // const setting000112 = ((res && res['000112']) || {}).settingValue;
      // this.itemLineTableDS.setQueryParameter('settings', {
      //   setting000112,
      // });
    });
  }

  /**
   * 页面布局横竖版查询
   * */
  @Bind()
  fetchRfxDetailLayout() {
    const { dispatch, organizationId } = this.props;

    dispatch({
      type: `inquiryHall/fetchRfxDetailLayout`,
      payload: {
        organizationId,
        configKey: 'sourceLayout',
      },
    }).then((res) => {
      if (!res) {
        return;
      }

      this.setPageLayoutData(res);
    });
  }

  // 设置页面布局
  setPageLayoutData(result = {}) {
    const { configKey, configValue = '' } = result;

    if (configKey !== 'sourceLayout' || !configValue) {
      return;
    }

    this.setState({
      isHorizontal: configValue === 'HORIZONTAL',
    });
  }

  /**
   * 页面布局横竖版改变
   * */
  @debounce(500)
  @Bind()
  changeRfxDetailLayout(isHorizontalLayout = true) {
    const {
      dispatch,
      organizationId,
      userId,
      inquiryHall: { rfxDetailLayouts = {} },
    } = this.props;

    dispatch({
      type: 'inquiryHall/changeRfxDetailLayout',
      payload: {
        organizationId,
        userId,
        enabledFlag: 1,
        configDesc: 'sourceLayout',
        ...rfxDetailLayouts,
        configKey: 'sourceLayout',
        configValue: isHorizontalLayout ? 'HORIZONTAL' : 'VERTICAL',
      },
    }).then((res = {}) => {
      if (!res) {
        return;
      }

      this.setPageLayoutData(res);
    });
  }

  @Bind()
  changeLayout(e = {}) {
    const layout = e.target.getAttribute('layout') || null;
    const isHorizontalCurrent = layout && layout === 'HORIZONTAL';
    const { isHorizontal = false } = this.state;

    if (isHorizontalCurrent === isHorizontal) {
      return;
    }

    this.changeRfxDetailLayout(isHorizontalCurrent);
  }

  /**
   * 查询维护页面信息
   */
  @Bind()
  fetchInquiryHallUpdate() {
    const {
      match: { params, path },
      dispatch,
      organizationId,
    } = this.props;

    dispatch({
      type: 'inquiryHall/fetchInquiryHeaderDetail',
      payload: {
        organizationId,
        rfxHeaderId: params.rfxId,
        path,
        tenantId: organizationId,
        customizeUnitCode:
          'SSRC.INQUIRY_HALL.EDIT_HEADER,SSRC.INQUIRY_HALL_EDIT.PREQUAL,SSRC.INQUIRY_HALL_EDIT.RFX.RULE,SSRC.INQUIRY_HALL.EDIT_HEADER_EXPERT,SSRC.INQUIRY_HALL.EDIT_HEADER_INDICS,SSRC.INQUIRY_HALL_EDIT.HEADER.SCORE_INDICS_TECHNOLOGY',
      },
    }).then((res = {}) => {
      if (isEmpty(res)) {
        return;
      }
      // this.setQueryParameterDS(res);

      const {
        expertScoreType = '',
        matterDetail = '',
        matterRequireFlag = 0,
        expertSource = '',
        sourceFrom,
        sourceCategory,
        objectVersionNumber = null,
        businessAttachmentUuid,
        techAttachmentUuid = null,
        industryData = '',
        organizationType = null,
      } = res || {};
      this.setState({
        matterDetail,
        matterRequireFlag,
        expertSource,
        objectVersionNumber,
      });

      if (this.attachmentRef) {
        this.attachmentRef.setState({
          businessAttachmentUuid: businessAttachmentUuid || uuidv4(),
          techAttachmentUuid: techAttachmentUuid || uuidv4(),
        });
      }

      if (expertScoreType && expertScoreType === 'ONLINE') {
        this.fetchExpert();
        this.fetchScoring();
      }
      if (sourceFrom === 'DEMAND_POOL') {
        this.fetchAllowAddItems(sourceCategory);
      }
      this.fetchTenderNotice();
      this.fetchItemLine();
      this.fetchSupplierLine();

      if (organizationType) {
        this.fetchIndustyType({
          domesticFlag: this.isDomesTic(organizationType),
        });
      }

      if (industryData) {
        const industryDataParsed = JSON.parse(industryData);
        this.initAndFetchInductryCategory(industryDataParsed);
      }
    });

    const lovCodes = {
      sourceMethod: 'SSRC.SOURCE_METHOD', // 寻源方式
      rfxStatus: 'SSRC.RFX_STATUS', // 询价单状态
      sourceCategory: 'SSRC.SOURCE_CATEGORY', // 寻源类别
      auctionDirection: 'SSRC.SOURCE_AUCTION_DIRECTION', // 报价方向
      sourceType: 'SSRC.SOURCE_TYPE', // 寻源类型
      priceCategory: 'SSRC.SOURCE_PRICE_CATEGORY', // 价格类型
      quotationOrderType: 'SSRC.QUOTATION_ORDER_TYPE', // 报价次序
      auctionRule: 'SSRC.RFA_AUCTION_RULE', // 竞价规则
      openRule: 'SSRC.RFA_OPEN_RULE', // 公开规则
      reviewMethod: 'SSRC.REVIEW_METHOD', // 审查方式
      indicateType: 'SSRC.INDICATE_TYPE', // 要素类型
      quotationType: 'SSRC.QUOTATION_TYPE', // 报价方式
      quotationScope: 'SSRC.QUOTATION_SCOPE_CODE', // 报价范围
      bidType: 'SSRC.BID_TYPE', // 招标类别
      duty: 'SSRC_NUMBER_DUTY', // 职责
      expertTeam: 'SSRC.EXPERT_TEAM', // 评分类别
      expertDuty: 'SSRC.EXPERT_DUTY', // 专家职责
      rankRules: 'SSRC.RANK_RULE', // 排名规则
      calculateType: 'SSRC.CALCULATE_TYPE', // 计算方式
      scoreType: 'SSRC.SCORE_TYPE', // 评分类型
      scoreTemplateScoreType: 'SSRC.TEMPLATE_SCORE_TYPE',
      benchmarkPriceMethod: 'SSRC.BENCHMARK_PRICE_METHOD', // 基准价计算方法
      formula: 'SSRC.INDIC_FORMULA', // 价格计算公式
      rfxRoles: 'SSRC.RFX_ROLE', // 角色
      idd: 'HPFM.IDD', // 国际冠码
      organizationType: 'SSRC.ORGANIZATION_TYPE', // 境内外关系
    };
    dispatch({
      type: 'inquiryHall/batchCode',
      payload: { lovCodes },
    });
  }

  /**
   * 物品明细 - 查询
   */
  @Bind()
  fetchItemLine(page = {}) {
    const {
      match: { params },
      dispatch,
      organizationId,
    } = this.props;

    dispatch({
      type: 'inquiryHall/fetchItemLine',
      payload: {
        page,
        tenantId: organizationId,
        organizationId,
        rfxHeaderId: params.rfxId,
        customizeUnitCode: 'SSRC.INQUIRY_HALL.EDIT_LINE',
      },
    });
  }

  // setQueryParameterDS(header = {}) {
  //   // const {
  //   //   match: { params, path },
  //   //   organizationId,
  //   //   userId,
  //   // } = this.props;
  //   // this.RfxInfoDS.loadData([header]);
  //   this.itemLineTableDS.setQueryParameter('headers', header);
  //   this.itemLineTableDS.setQueryParameter('company', {
  //     companyId: header.companyId,
  //   });
  // }

  fetchAllowAddItems(sourceCategory) {
    const { dispatch } = this.props;
    dispatch({
      type: 'inquiryHall/allowAddItems',
      payload: {
        sourceCategory,
      },
    }).then((res) => {
      if (!isUndefined(res) && !isNull(res)) {
        this.setState({
          allowAddItems: Number(res.allowNewItemsFlag),
        });
      }
    });
  }

  /**
   * 招标公告
   * */
  fetchTenderNotice(data = {}) {
    const {
      dispatch,
      match: { params = {} },
      organizationId,
    } = this.props;

    dispatch({
      type: 'inquiryHall/fetchTenderNotice',
      payload: {
        ...data,
        organizationId,
        sourceFrom: 'RFX',
        sourceType: 'BR',
        sourceHeaderId: params.rfxId,
      },
    });
  }

  /**
   * 获取专家数据
   *
   * @memberof Update
   */
  fetchExpert() {
    const {
      match: { params },
      dispatch,
      organizationId,
    } = this.props;

    dispatch({
      type: 'bidHall/fetchExpertAllocationData',
      payload: {
        organizationId,
        sourceHeaderId: params.rfxId,
        sourceFrom: 'RFX', // 来源是bid/rfx
        expertStatus: 'SUBMITTED', // 查询提交后的专家数据
        customizeUnitCode: 'SSRC.INQUIRY_HALL.EDIT_HEADER_EXPERT',
      },
    });
  }

  /**
   * 获取评分要素数据
   *
   * @memberof Update
   */
  fetchScoring() {
    const {
      match: { params },
      dispatch,
      organizationId,
    } = this.props;

    dispatch({
      type: 'bidHall/fetchTempelateDetailData',
      payload: {
        organizationId,
        sourceHeaderId: params.rfxId,
        sourceFrom: 'RFX',
        indicStatus: 'SUBMITTED', // 查询提交后的评分要素数据
        indicateLevel: 'ONE', // 查询一级评分要素
        customizeUnitCode:
          'SSRC.INQUIRY_HALL.EDIT_HEADER_INDICS,SSRC.INQUIRY_HALL_EDIT.HEADER.SCORE_INDICS_TECHNOLOGY',
      },
    });
  }

  /**
   * 供应商列表 - 查询
   */
  @Bind()
  fetchSupplierLine(page = {}) {
    const {
      match: { params },
      dispatch,
      inquiryHall: { header = {} },
      organizationId,
    } = this.props;

    dispatch({
      type: 'inquiryHall/fetchSupplierLine',
      payload: {
        tenantId: organizationId,
        organizationId,
        page,
        rfxHeaderId: params.rfxId,
        customizeUnitCode: 'SSRC.INQUIRY_HALL.EDIT_LINE_SUPPLIER',
        allowChangeSupplyFlag: header.allowChangeSupplyFlag,
        sourceFrom: header.sourceFrom,
      },
    });
  }

  @Bind()
  changeTabsKey(key = '') {
    if (!key) {
      return;
    }

    this.setState({
      tabsActiveKey: key,
    });
  }

  /**
   * 打开阶梯报价模态框
   */
  @Bind()
  viewLadderLevelModal(record = {}) {
    const {
      itemCode,
      itemName,
      supplierCompanyName,
      rfxLineItemId,
      itemId,
      uomId,
      secondaryUomId,
    } = record || {};
    const { doubleUnitFlag } = this.state;
    if (doubleUnitFlag && itemId) {
      if (!uomId || !secondaryUomId) {
        notification.warning({
          message: intl.get(`ssrc.common.model.inquiryHall.chooseUnit`).d('请先填写单位！'),
        });
        return;
      }
    }
    this.setState({
      viewLadderLevelVisible: true,
      LadderLevelHeaderData: {
        itemCode,
        itemName,
        itemId,
        uomId,
        rfxLineItemId,
        secondaryUomId,
        supplierCompanyName,
      },
    });
    const { dispatch, organizationId } = this.props;
    dispatch({
      type: 'inquiryHall/fetchLadderLevelyTable',
      payload: { rfxLineItemId, organizationId },
    });
  }

  /**
   * hideOperationRecord - 关闭阶梯报价弹窗
   */
  @Bind()
  hideLadderLevelModal() {
    this.setState({ viewLadderLevelVisible: false });
    this.props.dispatch({
      type: 'inquiryHall/updateState',
      payload: {
        ladderLevelData: [],
      },
    });
  }

  // 查询行业类型
  @Bind()
  async fetchIndustyType(params = {}) {
    let result = null;
    try {
      result = await fetchIndustyType({
        ...params,
      });
      result = getResponse(result);
      if (!result || isEmpty(result)) {
        return;
      }
      this.setState({
        industry: result,
      });
    } catch (e) {
      throw e;
    }
  }

  // 主营品类
  @Bind()
  async fetchIndustyCategory(params = {}) {
    let result = null;
    try {
      result = await fetchIndustyCategory({
        ...params,
        enabledFlag: 1,
      });
      result = getResponse(result);
      this.setState({
        industryCategory: result,
      });
    } catch (e) {
      throw e;
    }
  }

  // 获取行业类型 主营品类
  @Bind()
  getIndustryAndCategoryData(headerData = {}) {
    const { industryData = null, industryCategoryData = null, sourceMethod = null } = headerData;
    if (sourceMethod === 'INVITE') {
      return;
    }

    const { industry = [], industryCategory = [] } = this.state || {};

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
  }

  /**
   * 验证行内编辑
   */
  @Bind()
  validateEditTableDataSource(dataSource = [], excludeKeys = [], property = {}) {
    if (dataSource.length === 0) {
      return Promise.resolve(dataSource);
    }
    return new Promise((resolve, reject) => {
      let validateDataSource;
      const allowGetEditTable = Boolean(dataSource[0]?.$form);
      if (allowGetEditTable) {
        if (excludeKeys[0] === 'rfxLineItemId') {
          validateDataSource = this.getItemLineData(excludeKeys, dataSource);
        } else {
          validateDataSource = getEditTableData(dataSource, excludeKeys, property);
        }
        if (validateDataSource.length === 0) {
          reject();
        } else {
          resolve(validateDataSource);
        }
      } else {
        resolve(dataSource);
      }
    });
  }

  @Bind()
  generalData(businessSource = [], technologySource = [], noneSource = [], source = []) {
    let errorList = [];
    businessSource.forEach((data) => {
      if (isEmpty(data.$form)) {
        return;
      }
      data.$form.validateFieldsAndScroll((error) => {
        if (!isEmpty(error)) {
          errorList.push(...Object.keys(error));
        }
      });
    });
    technologySource.forEach((data) => {
      if (isEmpty(data.$form)) {
        return;
      }
      data.$form.validateFieldsAndScroll((error) => {
        if (!isEmpty(error)) {
          errorList.push(...Object.keys(error));
        }
      });
    });
    noneSource.forEach((data) => {
      if (isEmpty(data.$form)) {
        return;
      }
      data.$form.validateFieldsAndScroll((error) => {
        if (!isEmpty(error)) {
          errorList.push(...Object.keys(error));
        }
      });
    });
    // 商务技术组校验
    source.forEach((data) => {
      if (isEmpty(data.$form)) {
        return;
      }
      data.$form.validateFieldsAndScroll((error) => {
        if (!isEmpty(error)) {
          errorList.push(...Object.keys(error));
        }
      });
    });
    // 过滤重复数据
    errorList = errorList.filter((item, index, self) => self.indexOf(item) === index);
    return errorList;
  }

  /**
   * 询价大厅维护页面-保存
   */
  @Bind()
  async saveInquiryHallUpdate() {
    const {
      dispatch,
      form,
      organizationId,
      inquiryHall: { header = {}, supplierLine = [], itemLine = [] },
      bidHall: {
        scoringBusinessTempelate = [],
        scoringTechnologyTempelate = [],
        scoringNoneTempelate = [],
        evaluateExpertList = [], // 商务技术
      },
    } = this.props;
    const {
      itemLineSelectedRowKeys = [],
      supplierLineSelectedRowKeys = [],
      isHorizontal = true,
      matterRequireFlag,
    } = this.state;
    const { objectVersionNumber = undefined } = this.state;
    const {
      baseInfos = {},
      preQualification = {},
      otherInfos = {},
      biddingRules = {},
      scoringElements = {},
      professional = {},
      FieldNotInputText = null,
      supplierDataList = {},
    } = this.fieldConstant();

    // 先验证头，再验证行
    form.validateFieldsAndScroll({ force: true }, async (err, values) => {
      const errDate = !isEmpty(err) ? Object.keys(err) : [];
      const {
        creationDate,
        quotationStartDate,
        quotationEndDate,
        prequalEndDate,
        reviewMethod,
        qualifiedLimit,
        fileFreeFlag,
        prequalFileExpense,
        prequalUserId,
        prequalLocation,
        enableScoreFlag,
        prequalAttachmentUuid,
        prequalRemark,
        manufacturerType,
        estimatedStartTime,
      } = values;
      const sourceNotice = this.getNoticeData(values);
      const baseInfosFlag = Object.keys(baseInfos).some((item) => errDate.indexOf(item) !== -1);
      const otherInfosFlag = Object.keys(otherInfos).some((item) => errDate.indexOf(item) !== -1);
      const biddingRulesFlag = Object.keys(biddingRules).some(
        (item) => errDate.indexOf(item) !== -1
      );
      const preQualificationFlag = Object.keys(preQualification).some(
        (item) => errDate.indexOf(item) !== -1
      );
      // const professionalFlag = Object.keys(professional).some(item => errDate.indexOf(item) !== -1);
      if (this.attachmentRef) {
        if (this.attachmentRef.state.businessAttachmentUuid) {
          header.businessAttachmentUuid = this.attachmentRef.state.businessAttachmentUuid;
        }
        if (this.attachmentRef.state.techAttachmentUuid) {
          header.techAttachmentUuid = this.attachmentRef.state.techAttachmentUuid;
        }
      }
      const {
        allowChangeItemsFlag,
        allowChangeSupplyFlag,
        prequalObjectVersionNumber,
        prequalHeaderId,
        sourceFrom,
      } = header;
      // 专家和评分要素数据
      const {
        errNums = 0,
        ...professionAndScoreElement
      } = this.getRfxProfessionAndScoringElementData(values);
      const { industryData = null, industryCategoryData = null } =
        this.getIndustryAndCategoryData(values) || {};
      const { evaluateIndics = [] } = professionAndScoreElement;
      const rfxHeader = {
        ...header,
        ...values,
        autoDeferFlag: values.autoDeferFlag || header.autoDeferFlag,
        objectVersionNumber: objectVersionNumber || header.objectVersionNumber,
        matterDetail: this.MatterDetail
          ? this.MatterDetail.state.changeFlag
            ? this.MatterDetail.richTextEditor.getContent()
            : header.matterDetail
          : header.matterDetail,
        matterRequireFlag,
        creationDate: dateFormate(creationDate, DEFAULT_DATETIME_FORMAT),
        quotationStartDate: dateFormate(quotationStartDate, DEFAULT_DATETIME_FORMAT),
        quotationEndDate: dateFormate(quotationEndDate, DEFAULT_DATETIME_FORMAT),
        prequalEndDate: dateFormate(prequalEndDate, DEFAULT_DATETIME_FORMAT),
        ...(this.calcHeaderWeight(professionAndScoreElement, evaluateIndics, header) || {}),
        estimatedStartTime: dateFormate(estimatedStartTime, DEFAULT_DATETIME_FORMAT),
        industryData,
        industryCategoryData,
      };
      const prequalHeader = header.preQualificationFlag
        ? {
            prequalEndDate: dateFormate(prequalEndDate, DEFAULT_DATETIME_FORMAT),
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
            objectVersionNumber: prequalObjectVersionNumber,
          }
        : {};
      // 如果是可编辑行去校验必输信息
      const allowChangeItemFlag = allowChangeItemsFlag === 0 && sourceFrom === 'PROJECT'; // 立项转寻源 且不可修改物料信息
      const allowChangeSupplierFlag = allowChangeSupplyFlag === 0 && sourceFrom === 'PROJECT'; // 立项转寻源 且不可修改供应商信息

      const supplierDetailsData = allowChangeSupplierFlag
        ? supplierLine
        : this.generalData(supplierLine);
      const allowItemLineRender = Boolean(itemLine[0]?.$form);
      const allowsupplierLineRender = Boolean(supplierLine[0]?.$form);
      // 寻源立项允许修改供应商信息和物料信息
      if (!err && !errNums && (allowChangeSupplierFlag ? 1 : isEmpty(supplierDetailsData))) {
        // 验证行
        // 增加校验评分要素
        Promise.all([
          allowChangeItemFlag
            ? allowItemLineRender
              ? getEditTableData(itemLine, ['rfxLineItemId'])
              : itemLine
            : this.validateEditTableDataSource(itemLine, ['rfxLineItemId'], { force: true }),
          allowChangeSupplierFlag
            ? allowsupplierLineRender
              ? getEditTableData(supplierLine, ['rfxLineSupplierId'])
              : supplierLine
            : this.validateEditTableDataSource(supplierLine, ['rfxLineSupplierId'], {
                force: true,
              }),
        ]).then(([itemLineParams, supplierLineParams]) => {
          const newItemLineParams =
            itemLineParams &&
            itemLineParams.map((item) => {
              return {
                ...item,
                demandDate: dateFormate(item.demandDate, DATETIME_MIN),
                validExpiryDateFrom: dateFormate(item.validExpiryDateFrom, DATETIME_MIN),
                validExpiryDateTo: dateFormate(item.validExpiryDateTo, DATETIME_MAX),
              };
            });

          if (!rfxHeader?.rfxHeaderId || !organizationId) {
            return;
          }

          dispatch({
            type: 'inquiryHall/saveInquiryHallUpdate',
            payload: {
              tenantId: organizationId,
              customizeUnitCode:
                'SSRC.INQUIRY_HALL.EDIT_HEADER,SSRC.INQUIRY_HALL.EDIT_LINE,SSRC.INQUIRY_HALL_EDIT.PREQUAL,SSRC.INQUIRY_HALL_EDIT.RFX.RULE,SSRC.INQUIRY_HALL.EDIT_HEADER_EXPERT,SSRC.INQUIRY_HALL.EDIT_HEADER_INDICS,SSRC.INQUIRY_HALL_EDIT.HEADER.SCORE_INDICS_TECHNOLOGY',
              rfxHeader,
              prequalHeader,
              rfxLineItemList: newItemLineParams,
              rfxLineSupplierList: supplierLineParams.filter((item) => item.supplierCompanyId), // 过滤出新增的且未选择供应商的数据，不传给后台
              organizationId,
              ...professionAndScoreElement,
              sourceNotice: !isEmpty(sourceNotice) ? sourceNotice : null,
            },
          }).then((res) => {
            if (res) {
              notification.success();
              dispatch({
                type: 'inquiryHall/updateState',
                payload: {
                  supplierLine: [],
                  itemLine: [],
                  itemLineChange: false,
                  supplierLineChange: false,
                },
              });
              this.fetchInquiryHallUpdate();
              if (!isEmpty(itemLineSelectedRowKeys) || !isEmpty(supplierLineSelectedRowKeys)) {
                this.setState({
                  itemLineSelectedRows: [],
                  itemLineSelectedRowKeys: [],
                  supplierLineSelectedRowKeys: [],
                });
              }
              // 有评分要素
              if (!isEmpty(professionAndScoreElement.evaluateIndics)) {
                this.scoringElementTable.setState({ lovBringOutFlag: {}, changeLovFlag: {} });
              }
            }
          });
        });
      } else {
        let tableKeys;
        const professionalHint = [intl.get('ssrc.inquiryHall.view.expertHintOf').d('专家页签的')];
        const scoringElementsHint = [
          intl.get('ssrc.inquiryHall.view.scoreIndicHintOf').d('评分要素页签的'),
        ];
        const supplierLineHint = [
          intl.get('ssrc.inquiryHall.view.supplierListHintOf').d('供应商列表页签的'),
        ];
        let professionalData;
        let scoringElementsData;
        if (errNums) {
          professionalData = this.generalData([], [], [], evaluateExpertList); // 专家评分
          if (header.bidRuleType === 'NONE') {
            scoringElementsData = this.generalData([], [], scoringNoneTempelate);
          } else {
            scoringElementsData = this.generalData(
              scoringBusinessTempelate,
              scoringTechnologyTempelate,
              []
            );
          }
          // 评分要素
        }
        if (!isEmpty(professionalData)) {
          Object.keys(professional).forEach((item) => {
            if (professionalData.indexOf(item) !== -1) {
              professionalHint.push(professional[item]);
            }
          });
        }
        professionalHint.push(FieldNotInputText);
        // 评分要素
        if (!isEmpty(scoringElementsData)) {
          Object.keys(scoringElements).forEach((item) => {
            if (scoringElementsData.indexOf(item) !== -1) {
              scoringElementsHint.push(scoringElements[item]);
            }
          });
        }
        scoringElementsHint.push(FieldNotInputText);
        // 物品明细
        // if (!isEmpty(itemDetailsData)) {
        //   Object.keys(itemList).forEach((item) => {
        //     if (itemDetailsData.indexOf(item) !== -1) {
        //       itemLineHint.push(itemList[item]);
        //     }
        //   });
        // }
        // itemLineHint.push('字段未填写;');
        // 供应商列表
        if (!isEmpty(supplierDetailsData)) {
          Object.keys(supplierDataList).forEach((item) => {
            if (supplierDetailsData.indexOf(item) !== -1) {
              supplierLineHint.push(supplierDataList[item]);
            }
          });
        }
        supplierLineHint.push(FieldNotInputText);

        const FormMessage = this.collectFormErrs(errDate);
        const message = `${FormMessage}${
          professionalHint.length > 2 ? professionalHint.join('') : ''
        }${scoringElementsHint.length > 2 ? scoringElementsHint.join('') : ''}${
          supplierLineHint.length > 2 ? supplierLineHint.join('') : ''
        }`;
        if (baseInfosFlag && isHorizontal) {
          tableKeys = 'baseInfos';
        } else if (otherInfosFlag) {
          tableKeys = 'otherInfos';
        } else if (biddingRulesFlag) {
          tableKeys = 'biddingRules';
        } else if (preQualificationFlag) {
          tableKeys = 'preQualification';
        }
        //  else if (professionalFlag) {
        //   tableKeys = 'professional';
        // } else {
        //   tableKeys = 'scoringElements';
        // }
        if (!isEmpty(tableKeys)) {
          this.setState({ tabsActiveKey: tableKeys });
        }
        if (message) {
          notification.warning({
            message: intl
              .get(`ssrc.inquiryHall.model.inquiryHall.saveFailPromptNew`, { message })
              .d(message),
          });
        }
        // 竞价运行时间
        if (err?.quotationRunningDuration) {
          this.setState({
            isQuotationRunningDurationError: true,
          });
        }
        // 报价运行时间
        if (err?.startQuotationRunningDuration) {
          this.setState({
            isStartQuotationRunningDurationError: true,
          });
        }
      }
    });
  }

  // 收集表单错误信息
  collectFormErrs(errDate = []) {
    const CollectErrMessages = (title = '', baseFields = {}) => {
      const hints = [];
      const TextNoFillOut = intl
        .get('ssrc.inquiryHall.view.message.textNoFillOut')
        .d('字段未填写;');

      Object.keys(baseFields).forEach((item) => {
        if (errDate.indexOf(item) !== -1) {
          hints.push(baseFields[item]);
        }
      });
      const hintLabel = intl.get('ssrc.inquiryHall.view.tabs.hints', { title }).d(`${title}页签的`);
      return [hintLabel, ...hints, TextNoFillOut];
    };

    const {
      baseInfos = {},
      noticeList = {},
      preQualification = {},
      otherInfos = {},
      biddingRules = {},
    } = this.fieldConstant();
    const baseInfosHint = CollectErrMessages(
      intl.get(`ssrc.inquiryHall.view.message.panel.baseInfos`).d('基本信息'),
      baseInfos
    );
    const otherInfosHint = CollectErrMessages(
      intl.get(`ssrc.inquiryHall.view.message.panel.rfxRules`).d('寻源规则'),
      otherInfos
    );
    const biddingRulesHint = CollectErrMessages(
      intl.get(`ssrc.inquiryHall.view.message.panel.biddingRules`).d('竞价规则'),
      biddingRules
    );
    const preQualificationHint = CollectErrMessages(
      intl.get(`ssrc.inquiryHall.view.message.tab.preQualification`).d('资格预审'),
      preQualification
    );
    const NoticeHint = CollectErrMessages(
      intl.get('ssrc.inquiryHall.view.message.panel.rfxNotice').d('寻源公告'),
      noticeList
    );

    return `${baseInfosHint.length > 2 ? baseInfosHint.join('') : ''}${
      otherInfosHint.length > 2 ? otherInfosHint.join('') : ''
    }${biddingRulesHint.length > 2 ? biddingRulesHint.join('') : ''}${
      preQualificationHint.length > 2 ? preQualificationHint.join('') : ''
    }${NoticeHint.length > 2 ? NoticeHint.join('') : ''}`;
  }

  /**
   * 维护界面取消
   */
  @Bind()
  cancelInquiryHallUpdate() {
    const {
      dispatch,
      match: { params },
      organizationId,
    } = this.props;
    Modal.confirm({
      title: intl
        .get(`ssrc.inquiryHall.model.inquiryHall.cancelChange`)
        .d('是否确认取消并关闭该单据？'),
      okText: intl.get('hzero.common.button.ok').d('确定'),
      onOk: () => {
        dispatch({
          type: 'inquiryHall/cancelInquiryHallUpdate',
          payload: {
            organizationId,
            rfxHeaderId: params.rfxId,
          },
        }).then((res) => {
          if (res) {
            notification.success();
            this.props.history.push({
              pathname: '/ssrc/inquiry-hall/list',
            });
          }
        });
      },
      onCancel: () => {},
    });
  }

  /**
   * 操作前统计数据错误
   *
   * @param {*} [dataList=[]]
   * @returns
   * @memberof Update
   */
  getDataErrNums(dataList = []) {
    let errNums = 0;
    if (!dataList.length) {
      return errNums;
    }

    dataList.forEach((data) => {
      if (!data || !data.length) {
        return;
      }

      const formData = getEditTableData(data);
      if (!formData.length) {
        ++errNums;
      }
    });

    return errNums;
  }

  /**
   * 获取专家和评分要素数据
   *
   * @returns
   * @memberof Update
   */
  getRfxProfessionAndScoringElementData() {
    const {
      bidHall: {
        evaluateExpertList = [],
        scoringNoneTempelate = [],
        scoringBusinessTempelate = [],
        scoringTechnologyTempelate = [],
      },
      inquiryHall: { header = {} },
    } = this.props;

    // 专家
    const evaluateExperts = !evaluateExpertList.length
      ? {}
      : {
          evaluateExpertList: getEditTableData(evaluateExpertList, ['evaluateExpertId']).map(
            (item) => ({
              ...item,
              evaluateLeaderFlag: +item.evaluateLeaderFlag,
            })
          ),
        };

    // 评分要素
    const evaluateIndics = [
      ...getEditTableData(scoringBusinessTempelate, ['evaluateIndicId']).map((item) => {
        return { ...item, areaFrom: 'NEW' };
      }),
      ...getEditTableData(scoringTechnologyTempelate, ['evaluateIndicId']).map((item) => {
        return { ...item, areaFrom: 'NEW' };
      }),
      ...getEditTableData(scoringNoneTempelate, ['evaluateIndicId']).map((item) => {
        return { ...item, areaFrom: 'NEW' };
      }),
    ];

    // 依据评标步制筛选需要保存提交数据的校验
    const params =
      header.bidRuleType === 'NONE'
        ? [evaluateExpertList, scoringNoneTempelate]
        : [evaluateExpertList, scoringBusinessTempelate, scoringTechnologyTempelate];

    // 提交错误统计 (新增功能)
    const errNums = this.getDataErrNums(params);

    return {
      evaluateExperts,
      evaluateIndics,
      errNums,
    };
  }

  // 获取公告数据
  getNoticeData(values = {}) {
    const {
      noticeId = null,
      noticeTitle = null,
      noticeDays = null,
      purName = null,
      purEmail = null,
      purPhone = null,
      noticeAttachmentUuid = null,
      sourceMethod = null,
      objectVersionNumber = null,
    } = values;

    return sourceMethod === 'INVITE'
      ? {}
      : {
          noticeId,
          noticeTitle,
          noticeDays,
          purName,
          purEmail,
          purPhone,
          noticeAttachmentUuid,
          objectVersionNumber,
        };
  }

  // 计算头商务技术要素权重
  calcHeaderWeight = (professionAndScoreElement, evaluateIndics = [], header = {}) => {
    let { businessWeight, technologyWeight } = header || {};

    if (!isUndefined(professionAndScoreElement) && !isEmpty(evaluateIndics)) {
      const businessData = [];
      const techData = [];

      evaluateIndics.forEach((item = {}) => {
        const { team } = item || {};

        if (isEmpty(businessData) && team === 'BUSINESS') {
          businessData.push(item);
        }
        if (isEmpty(techData) && team === 'TECHNOLOGY') {
          techData.push(item);
        }
      });

      if (!isEmpty(businessData)) {
        businessWeight = businessData[0].businessWeight ?? businessWeight;
      }

      if (!isEmpty(techData)) {
        technologyWeight = techData[0].technologyWeight ?? technologyWeight;
      }
    }

    return {
      businessWeight,
      technologyWeight,
    };
  };

  /**
   * 询价大厅维护页面-发布
   */
  @Bind()
  async releaseInquiryHall() {
    const {
      dispatch,
      form,
      organizationId,
      inquiryHall: { header = {}, supplierLine = [], itemLine = [] },
      bidHall: {
        scoringBusinessTempelate = [],
        scoringTechnologyTempelate = [],
        scoringNoneTempelate = [],
        evaluateExpertList = [], // 商务技术
      },
    } = this.props;
    const { objectVersionNumber = undefined, isHorizontal = true, matterRequireFlag } = this.state;
    const {
      baseInfos = {},
      preQualification = {},
      otherInfos = {},
      biddingRules = {},
      scoringElements = {},
      professional = {},
      FieldNotInputText = null,
      supplierDataList = {},
    } = this.fieldConstant();

    // 先验证头，再验证行
    form.validateFieldsAndScroll({ force: true }, async (err, values) => {
      const errDate = !isEmpty(err) ? Object.keys(err) : [];
      const {
        creationDate,
        quotationStartDate,
        quotationEndDate,
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
        estimatedStartTime,
      } = values;
      const sourceNotice = this.getNoticeData(values);
      const { industryData = null, industryCategoryData = null } =
        this.getIndustryAndCategoryData(values) || {};
      const baseInfosFlag = Object.keys(baseInfos).some((item) => errDate.indexOf(item) !== -1);
      const otherInfosFlag = Object.keys(otherInfos).some((item) => errDate.indexOf(item) !== -1);
      const biddingRulesFlag = Object.keys(biddingRules).some(
        (item) => errDate.indexOf(item) !== -1
      );
      const preQualificationFlag = Object.keys(preQualification).some(
        (item) => errDate.indexOf(item) !== -1
      );
      // const professionalFlag = Object.keys(professional).some(item => errDate.indexOf(item) !== -1);
      if (this.attachmentRef) {
        if (this.attachmentRef.state.businessAttachmentUuid) {
          header.businessAttachmentUuid = this.attachmentRef.state.businessAttachmentUuid;
        }
        if (this.attachmentRef.state.techAttachmentUuid) {
          header.techAttachmentUuid = this.attachmentRef.state.techAttachmentUuid;
        }
      }
      const {
        allowChangeItemsFlag,
        allowChangeSupplyFlag,
        prequalObjectVersionNumber,
        prequalHeaderId,
        sourceFrom,
      } = header;
      // 专家和评分要素数据
      const {
        errNums = 0,
        ...professionAndScoreElement
      } = this.getRfxProfessionAndScoringElementData(values);
      const { evaluateIndics = [] } = professionAndScoreElement;
      const rfxHeader = {
        ...header,
        ...values,
        objectVersionNumber: objectVersionNumber || header.objectVersionNumber,
        matterDetail: this.MatterDetail
          ? this.MatterDetail.state.changeFlag
            ? this.MatterDetail.richTextEditor.getContent()
            : header.matterDetail
          : header.matterDetail,
        matterRequireFlag,
        creationDate: dateFormate(creationDate, DEFAULT_DATETIME_FORMAT),
        quotationStartDate: dateFormate(quotationStartDate, DEFAULT_DATETIME_FORMAT),
        quotationEndDate: dateFormate(quotationEndDate, DEFAULT_DATETIME_FORMAT),
        ...(this.calcHeaderWeight(professionAndScoreElement, evaluateIndics, header) || {}),
        estimatedStartTime: dateFormate(estimatedStartTime, DEFAULT_DATETIME_FORMAT),
        industryData,
        industryCategoryData,
      };
      const prequalHeader = header.preQualificationFlag
        ? {
            prequalEndDate: dateFormate(prequalEndDate, DEFAULT_DATETIME_FORMAT),
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
            objectVersionNumber: prequalObjectVersionNumber,
          }
        : {};
      const allowChangeItemFlag = allowChangeItemsFlag === 0 && sourceFrom === 'PROJECT'; // 立项转寻源 且不可修改物料信息,则行信息不可编辑
      const allowChangeSupplierFlag = allowChangeSupplyFlag === 0 && sourceFrom === 'PROJECT'; // 立项转寻源 且不可修改供应商信息则行信息不可编辑

      const supplierDetailsData = allowChangeSupplierFlag
        ? supplierLine
        : this.generalData(supplierLine);
      if (!itemLine.length > 0) {
        notification.warning({
          message: intl.get('ssrc.inquiryHall.model.inquiryHall.maintainMaterials').d('请维护物料'),
        });
        return;
      }
      const allowItemLineRender = Boolean(itemLine[0]?.$form);
      const allowsupplierLineRender = Boolean(supplierLine[0]?.$form);
      if (!err && !errNums && (allowChangeSupplierFlag ? 1 : isEmpty(supplierDetailsData))) {
        Promise.all([
          allowChangeItemFlag
            ? allowItemLineRender
              ? getEditTableData(itemLine, ['rfxLineItemId'])
              : itemLine
            : this.validateEditTableDataSource(itemLine, ['rfxLineItemId'], { force: true }),
          allowChangeSupplierFlag
            ? allowsupplierLineRender
              ? getEditTableData(supplierLine, ['rfxLineSupplierId'])
              : supplierLine
            : this.validateEditTableDataSource(supplierLine, ['rfxLineSupplierId'], {
                force: true,
              }),
        ]).then(async ([itemLineParams, supplierLineParams]) => {
          const newItemLineParams =
            itemLineParams &&
            itemLineParams.map((item) => {
              return {
                ...item,
                demandDate: dateFormate(item.demandDate, DATETIME_MIN),
                validExpiryDateFrom: dateFormate(item.validExpiryDateFrom, DATETIME_MIN),
                validExpiryDateTo: dateFormate(item.validExpiryDateTo, DATETIME_MAX),
              };
            });
          const data = {
            customizeUnitCode:
              'SSRC.INQUIRY_HALL.EDIT_HEADER,SSRC.INQUIRY_HALL.EDIT_LINE,SSRC.INQUIRY_HALL_EDIT.PREQUAL,SSRC.INQUIRY_HALL_EDIT.RFX.RULE,SSRC.INQUIRY_HALL.EDIT_HEADER_EXPERT,SSRC.INQUIRY_HALL.EDIT_HEADER_INDICS,SSRC.INQUIRY_HALL_EDIT.HEADER.SCORE_INDICS_TECHNOLOGY',
            rfxHeader,
            prequalHeader,
            rfxLineItemList: newItemLineParams,
            rfxLineSupplierList: supplierLineParams.filter((item) => item.supplierCompanyId), // 过滤出新增的且未选择供应商的数据，不传给后台,
            organizationId,
            ...professionAndScoreElement,
            hostName: location.origin,
            sourceNotice: !isEmpty(sourceNotice) ? sourceNotice : null,
            rfxHeaderId: header.rfxHeaderId,
          };
          const doSubmit = () => {
            dispatch({
              type: 'inquiryHall/releaseInquiryHall',
              payload: data,
            }).then((res) => {
              if (res) {
                notification.success();
                dispatch(
                  routerRedux.push({
                    pathname: `/ssrc/inquiry-hall/list`,
                  })
                );
              }
            });
          };

          this.setState({ releaseConfirmLoading: true });

          const ValidateResult = getResponse(await validateBeforeRelease(data));
          if (!ValidateResult) {
            this.setState({ releaseConfirmLoading: false });
            return;
          }

          this.setState({ releaseConfirmLoading: false });

          validatorConfirmModal({
            response: ValidateResult,
            validatorType: 'highestValidatorType',
            validatorArrName: 'validateResults',
            onOk: () => doSubmit(),
          });
        });
      } else {
        let tableKeys;
        const professionalHint = [intl.get('ssrc.inquiryHall.view.expertHintOf').d('专家页签的')];
        const scoringElementsHint = [
          intl.get('ssrc.inquiryHall.view.scoreIndicHintOf').d('评分要素页签的'),
        ];
        const supplierLineHint = [
          intl.get('ssrc.inquiryHall.view.supplierListHintOf').d('供应商列表页签的'),
        ];

        let professionalData;
        let scoringElementsData;
        if (errNums) {
          professionalData = this.generalData([], [], [], evaluateExpertList); // 专家评分
          if (header.sourceType === 'none') {
            scoringElementsData = this.generalData([], [], scoringNoneTempelate);
          } else {
            scoringElementsData = this.generalData(
              scoringBusinessTempelate,
              scoringTechnologyTempelate,
              []
            );
          }
          // 评分要素
        }
        // 专家
        if (!isEmpty(professionalData)) {
          Object.keys(professional).forEach((item) => {
            if (professionalData.indexOf(item) !== -1) {
              professionalHint.push(professional[item]);
            }
          });
        }
        professionalHint.push(FieldNotInputText);
        // 评分要素
        if (!isEmpty(scoringElementsData)) {
          Object.keys(scoringElements).forEach((item) => {
            if (scoringElementsData.indexOf(item) !== -1) {
              scoringElementsHint.push(scoringElements[item]);
            }
          });
        }
        scoringElementsHint.push(FieldNotInputText);
        // 物品明细
        // if (!isEmpty(itemDetailsData)) {
        //   Object.keys(itemList).forEach((item) => {
        //     if (itemDetailsData.indexOf(item) !== -1) {
        //       itemLineHint.push(itemList[item]);
        //     }
        //   });
        // }
        // itemLineHint.push('字段未填写;');
        // 供应商列表
        if (!isEmpty(supplierDetailsData)) {
          Object.keys(supplierDataList).forEach((item) => {
            if (supplierDetailsData.indexOf(item) !== -1) {
              supplierLineHint.push(supplierDataList[item]);
            }
          });
        }
        supplierLineHint.push(FieldNotInputText);

        const FormMessage = this.collectFormErrs(errDate);
        const message = `${FormMessage}${
          professionalHint.length > 2 ? professionalHint.join('') : ''
        }${scoringElementsHint.length > 2 ? scoringElementsHint.join('') : ''}${
          supplierLineHint.length > 2 ? supplierLineHint.join('') : ''
        }`;

        if (baseInfosFlag && isHorizontal) {
          tableKeys = 'baseInfos';
        } else if (otherInfosFlag) {
          tableKeys = 'otherInfos';
        } else if (biddingRulesFlag) {
          tableKeys = 'biddingRules';
        } else if (preQualificationFlag) {
          tableKeys = 'preQualification';
        }
        // else if (professionalFlag) {
        //   tableKeys = 'professional';
        // } else {
        //   tableKeys = 'scoringElements';
        // }
        if (!isEmpty(tableKeys)) {
          this.setState({ tabsActiveKey: tableKeys });
        }
        if (message) {
          notification.warning({
            message: intl
              .get(`ssrc.inquiryHall.model.inquiryHall.saveFailPromptNew`, { message })
              .d(message),
          });
        }
        // 竞价运行时间
        if (err?.quotationRunningDuration) {
          this.setState({
            isQuotationRunningDurationError: true,
          });
        }
        // 报价运行时间
        if (err?.startQuotationRunningDuration) {
          this.setState({
            isStartQuotationRunningDurationError: true,
          });
        }
      }
    });
  }

  /**
   * 改变寻源模板-获取寻源类别，寻源方式，报价方向等
   */
  @Bind()
  changeTemplateId(val, record) {
    const {
      form,
      match: { params },
      dispatch,
      organizationId,
    } = this.props;

    // 清空报价截止时间
    if (record.sourceCategory === 'RFA') {
      this.props.form.setFieldsValue({ quotationEndDate: undefined });
    }
    dispatch({
      type: 'inquiryHall/fetchChangetemplateHeaderData',
      payload: { organizationId, rfxHeaderId: params.rfxId, templateId: record.templateId },
    }).then((res = {}) => {
      if (res) {
        this.setState({
          matterDetail: res.matterDetail || '',
          expertSource: res.expertSource,
        });
        dispatch({
          type: 'inquiryHall/updateState',
          payload: {
            header: res,
          },
        });
        form.setFieldsValue({
          sourceMethod: res.sourceMethod, // 寻源方式
          quotationType: res.quotationType, // 报价方式
          auctionDirection: res.auctionDirection, // 报价方向
          matchRestrictFlag: res.matchRestrictFlag, // 供应商能力清单匹配限制
          multiCurrencyFlag: res.multiCurrencyFlag, // 允许多币种报价
        });
      }
    });
  }

  // 招标公告预览
  @Bind()
  previewNotice() {
    const {
      match: { params },
    } = this.props;

    openTab({
      key: `/ssrc/inquiry-hall/tender-bid-notice-preview/${params.rfxId}`,
      path: `/ssrc/inquiry-hall/tender-bid-notice-preview/${params.rfxId}`,
      // title: 'ssrc.inquiryHall.view.title.tenderBidNotice',
      title: 'srm.common.tab.title.ssrc.tenderNotice',
      action: 'ssrc.inquiryHall.view.title.tenderBidNotice',
      closable: true,
    });
  }

  /**
   * 改变寻源模板-获取寻源类别，寻源方式，报价方向
   */
  @Bind()
  changeCompany(val, record, header) {
    const {
      form,
      dispatch,
      organizationId,
      match: { params },
      inquiryHall: { supplierLinePagination = {} },
    } = this.props;
    const newRecord = header;

    const changeCompanyValueToOld = () => {
      form.setFieldsValue({
        unitId: undefined,
        companyId: header.companyId,
        companyName: header.companyName,
      });
    };

    Modal.confirm({
      title: intl
        .get('ssrc.inquiryHall.message.confirm.sureChangeCompany')
        .d('切换公司后，将会清空对应物品和供应商数据，是否切换?'),
      onOk: () => {
        form.setFieldsValue({
          unitId: undefined,
          currencyCode: record.currencyCode,
          currencyId: record.currencyId,
        });
        dispatch({
          type: 'inquiryHall/changeCompany',
          payload: {
            organizationId,
            rfxHeaderId: params.rfxId,
            companyId: record.companyId,
            companyName: record.companyName,
          },
        }).then((res) => {
          if (res) {
            this.setState({
              objectVersionNumber: res.objectVersionNumber,
            });
            this.fetchItemLine();
            // this.itemLineTableDS.query(this.itemLineTableDS.currentPage);
            this.fetchSupplierLine(supplierLinePagination);
            newRecord.companyName = record.companyName;
          }
        });
        dispatch({
          type: 'inquiryHall/updateState',
          payload: {
            itemLineChange: false,
            supplierLineChange: false,
          },
        });
        dispatch({
          type: 'inquiryHall/fetchMatterRequireFlag',
          payload: {
            organizationId,
            companyId: record.companyId,
          },
        }).then((res) => {
          if (res) {
            this.setState({
              matterRequireFlag: res.rfxRequireFlag,
            });
          }
        });
      },
      onCancel: () => {
        changeCompanyValueToOld();
      },
    });
  }

  /**
   * 开标人-弹出滑窗
   */
  @Bind()
  openBidholder() {
    const {
      match: { params },
      dispatch,
      organizationId,
    } = this.props;
    dispatch({
      type: 'inquiryHall/fetchBidholderList',
      payload: { organizationId, rfxHeaderId: params.rfxId, rfxRole: 'OPENED_BY' },
    });
    this.setState({
      bidholderVisible: true,
    });
  }

  /**
   * 关闭开标人弹框
   */
  @Bind()
  onCancel() {
    this.setState({
      bidholderVisible: false,
    });
  }

  /**
   * 新增开标人
   */
  @Bind()
  fetchBidholderAdd() {
    const { newBidholder } = this.state;
    const {
      dispatch,
      match: { params },
      tenantId,
      inquiryHall: { bidHolderList = [], bidHolderPagination = {}, header = {} },
    } = this.props;
    dispatch({
      type: 'inquiryHall/updateState',
      payload: {
        bidHolderList: [
          {
            tenantId,
            rfxRole: 'OPENED_BY',
            rfxMemberId: uuidv4(),
            objectVersionNumber: 0,
            newBidholder: newBidholder + 1,
            passwordFlag: header.passwordFlag,
            sourceHeaderId: params.rfxId,
            sourceHeaderType: 'RFX',
            realName: '',
            _status: 'create', // 新建标记位
          },
          ...bidHolderList,
        ],
        pagination: addItemToPagination(bidHolderList.length, bidHolderPagination),
      },
    });
    this.setState({
      newBidholder: newBidholder + 1,
      selectedRowKeys: [],
    });
  }

  /**
   * 保存开标人
   */
  @Bind()
  fetchBidholderUpdate() {
    const {
      dispatch,
      match: { params },
      organizationId,
      inquiryHall: { bidHolderList = [], bidHolderPagination = {} },
    } = this.props;
    const param = getEditTableData(bidHolderList, ['rfxMemberId']);
    const holderData = [];
    param.forEach((value, index) => {
      if (value.userId) {
        holderData.push(value);
      } else {
        param[index].userId = value.loginName;
        holderData.push(value);
      }
      return holderData;
    });
    if (Array.isArray(param) && param.length !== 0) {
      dispatch({
        type: 'inquiryHall/fetchBidholderUpdate',
        payload: {
          holderData,
          organizationId,
          rfxHeaderId: params.rfxId,
        },
      }).then((res) => {
        if (res) {
          notification.success();
          this.handleSearch(bidHolderPagination);
        }
      });
    }
  }

  /**
   * 查询开标人
   */
  @Bind()
  handleSearch(fields = {}) {
    const {
      match: { params },
      dispatch,
      organizationId,
    } = this.props;
    const fieldValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    dispatch({
      type: 'inquiryHall/fetchBidholderList',
      payload: {
        organizationId,
        rfxHeaderId: params.rfxId,
        page: isEmpty(fields) ? {} : fields,
        rfxRole: 'OPENED_BY',
        ...fieldValues,
      },
    });
  }

  /**
   * 批量删除开标人
   */
  @Bind()
  fetchBidholderDelete() {
    const {
      match: { params },
      dispatch,
      organizationId,
      inquiryHall: { bidHolderList = [], bidHolderPagination = {} },
    } = this.props;
    const { selectedRowKeys } = this.state;
    // 过滤出勾选数据
    const newLyBuild = filter(bidHolderList, (item) => {
      return selectedRowKeys.indexOf(item.rfxMemberId) >= 0;
    });
    // 过滤出勾选数据的剩下数据
    const newOriginal = filter(bidHolderList, (item) => {
      return selectedRowKeys.indexOf(item.rfxMemberId) < 0;
    });
    if (selectedRowKeys.length > 0) {
      Modal.confirm({
        title: intl.get('ssrc.inquiryHall.message.confirm.remove').d('确定删除选中数据？'),
        onOk: () => {
          const remoteDelete = [];
          const localDelete = [];
          newLyBuild.forEach((item) => {
            if (item._status === 'create') {
              localDelete.push(item);
            }
            if (item._status === 'update') {
              remoteDelete.push(item);
            }
          });
          if (isEmpty(remoteDelete)) {
            dispatch({
              type: 'inquiryHall/updateState',
              payload: {
                bidHolderList: newOriginal,
                bidHolderPagination: delItemsToPagination(
                  newLyBuild.length,
                  bidHolderList.length,
                  bidHolderPagination
                ),
              },
            });
            this.setState({ selectedRowKeys: [] });
          } else {
            dispatch({
              type: 'inquiryHall/fetchBidholderDelete',
              payload: { remoteDelete, organizationId, rfxHeaderId: params.rfxId },
            }).then((res) => {
              if (res) {
                notification.success();
                dispatch({
                  type: 'inquiryHall/updateState',
                  payload: {
                    bidHolderList: newOriginal,
                    bidHolderPagination: delItemsToPagination(
                      newLyBuild.length,
                      bidHolderList.length,
                      bidHolderPagination
                    ),
                  },
                });
                this.setState({ selectedRowKeys: [] });
              }
            });
          }
        },
      });
    }
  }

  /**
   * 加入当前用户
   */
  @Bind()
  handleAddCurrentUser() {
    const {
      dispatch,
      tenantId,
      user: { currentUser },
      match: { params },
      inquiryHall: { bidHolderList = [], bidHolderPagination = {}, header = {} },
    } = this.props;
    const { newBidholder } = this.state;
    const { email, loginName, id, phone, realName } = currentUser;
    const newArr = bidHolderList.filter((item) => item.loginName === currentUser.loginName);
    if (isEmpty(newArr)) {
      dispatch({
        type: 'inquiryHall/updateState',
        payload: {
          bidHolderList: [
            {
              tenantId,
              rfxMemberId: uuidv4(),
              objectVersionNumber: 0,
              newBidholder: newBidholder + 1,
              passwordFlag: header.passwordFlag,
              sourceHeaderId: params.rfxId,
              email,
              loginName,
              userId: id,
              phone,
              sourceHeaderType: 'RFX',
              realName,
              rfxRole: 'OPENED_BY',
              _status: 'create', // 新建标记位
            },
            ...bidHolderList,
          ],
          pagination: addItemToPagination(bidHolderList.length, bidHolderPagination),
        },
      });
    } else {
      notification.warning({
        message: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.notDefinedRepeat`)
          .d('不能重复定义寻源开标人'),
      });
    }
  }

  /**
   * 获取删除行数据
   */
  onSelectChange = (selectedRowKeys) => {
    this.setState({ selectedRowKeys });
  };

  handleEndOpenChange = (open) => {
    this.setState({ endOpen: open });
  };

  /**
   * 报价运行时间
   * 改变天-设置报价运行时间
   */
  @Bind()
  changeQuoteDay(value) {
    const {
      form: { setFieldsValue, getFieldValue },
    } = this.props;
    const { isStartQuotationRunningDurationError = false } = this.state;
    if (value === '') {
      if (isUndefined(getFieldValue('quoteHour')) && isUndefined(getFieldValue('quoteMinute'))) {
        setFieldsValue({
          startQuotationRunningDuration: undefined,
          quoteHour: null,
          quoteMinute: null,
          quoteDay: null,
        });
      } else {
        setFieldsValue({
          startQuotationRunningDuration:
            (isUndefined(getFieldValue('quoteHour')) ? 0 : getFieldValue('quoteHour') * 60) +
            (isUndefined(getFieldValue('quoteMinute')) ? 0 : getFieldValue('quoteMinute')),
        });
      }
    }
    if (value !== '' && !isUndefined(value)) {
      if (
        (isUndefined(getFieldValue('quoteHour')) && isUndefined(getFieldValue('quoteMinute'))) ||
        (getFieldValue('quoteHour') === 0 && getFieldValue('quoteMinute') === 0)
      ) {
        setFieldsValue({
          startQuotationRunningDuration: value * 1440,
          quoteDay: value === 0 ? null : value,
          quoteHour: null,
          quoteMinute: null,
        });
      } else {
        setFieldsValue({
          startQuotationRunningDuration:
            value * 1440 +
            (isUndefined(getFieldValue('quoteHour')) ? 0 : getFieldValue('quoteHour') * 60) +
            (isUndefined(getFieldValue('quoteMinute')) ? 0 : getFieldValue('quoteMinute')),
        });
      }
      if (isStartQuotationRunningDurationError) {
        this.setState({ isStartQuotationRunningDurationError: false });
      }
      setFieldsValue({
        quotationEndDate: undefined,
      });
    }
  }

  /**
   * 报价运行时间
   * 改变小时-设置报价运行时间
   */
  @Bind()
  changeQuoteHour(value) {
    const {
      form: { setFieldsValue, getFieldValue },
    } = this.props;
    const { isStartQuotationRunningDurationError = false } = this.state;
    if (value === '') {
      if (isUndefined(getFieldValue('quoteDay')) && isUndefined(getFieldValue('quoteMinute'))) {
        setFieldsValue({
          startQuotationRunningDuration: undefined,
        });
      } else {
        setFieldsValue({
          startQuotationRunningDuration:
            (isUndefined(getFieldValue('quoteDay')) ? 0 : getFieldValue('quoteDay') * 1440) +
            (isUndefined(getFieldValue('quoteMinute')) ? 0 : getFieldValue('quoteMinute')),
        });
      }
    }
    if (value !== '' && !isUndefined(value)) {
      if (
        (isUndefined(getFieldValue('quoteDay')) && isUndefined(getFieldValue('quoteMinute'))) ||
        (getFieldValue('quoteDay') === 0 && getFieldValue('quoteMinute') === 0)
      ) {
        setFieldsValue({
          startQuotationRunningDuration: value * 60,
          quoteDay: null,
          quoteHour: value === 0 ? null : value,
          quoteMinute: null,
        });
      } else {
        setFieldsValue({
          startQuotationRunningDuration:
            (isUndefined(getFieldValue('quoteDay')) ? 0 : getFieldValue('quoteDay') * 1440) +
            value * 60 +
            (isUndefined(getFieldValue('quoteMinute')) ? 0 : getFieldValue('quoteMinute')),
        });
      }
      if (isStartQuotationRunningDurationError) {
        this.setState({ isStartQuotationRunningDurationError: false });
      }
      setFieldsValue({
        quotationEndDate: undefined,
      });
    }
  }

  /**
   * 报价运行时间
   * 改变分钟-设置报价运行时间
   */
  @Bind()
  changeQuoteMinute(value) {
    const {
      form: { setFieldsValue, getFieldValue },
    } = this.props;
    const { isStartQuotationRunningDurationError = false } = this.state;
    if (value === '') {
      if (isUndefined(getFieldValue('quoteDay')) && isUndefined(getFieldValue('quoteHour'))) {
        setFieldsValue({
          startQuotationRunningDuration: undefined,
        });
      } else {
        setFieldsValue({
          startQuotationRunningDuration:
            (isUndefined(getFieldValue('quoteDay')) ? 0 : getFieldValue('quoteDay') * 1440) +
            (isUndefined(getFieldValue('quoteHour')) ? 0 : getFieldValue('quoteHour') * 60),
        });
      }
    }
    if (value !== '' && !isUndefined(value)) {
      if (
        (isUndefined(getFieldValue('quoteDay')) && isUndefined(getFieldValue('quoteHour'))) ||
        (getFieldValue('quoteDay') === 0 && getFieldValue('quoteHour') === 0)
      ) {
        setFieldsValue({
          startQuotationRunningDuration: value,
          quoteDay: null,
          quoteHour: null,
          quoteMinute: value === 0 ? null : value,
        });
      } else {
        setFieldsValue({
          startQuotationRunningDuration:
            (isUndefined(getFieldValue('quoteDay')) ? 0 : getFieldValue('quoteDay') * 1440) +
            (isUndefined(getFieldValue('quoteHour')) ? 0 : getFieldValue('quoteHour') * 60) +
            value,
        });
      }
      if (isStartQuotationRunningDurationError) {
        this.setState({ isStartQuotationRunningDurationError: false });
      }
      setFieldsValue({
        quotationEndDate: undefined,
      });
    }
  }

  /**
   * 改变发布即开始
   * 1,清空报价开始时间，报价截止时间
   */
  @Bind()
  changeStartFlag(value) {
    const {
      form: { setFieldsValue },
    } = this.props;
    if (value) {
      setFieldsValue({
        quotationStartDate: undefined,
        quotationEndDate: undefined,
      });
    } else {
      setFieldsValue({
        startQuotationRunningDuration: null,
        quoteDay: null,
        quoteHour: null,
        quoteMinute: null,
        quotationRunningDuration: null,
      });
    }
  }

  /**
   * 验证是否天，小时和分钟都为0
   */
  @Bind()
  validateTime(_, value, callback) {
    const { form } = this.props;
    if (
      form.getFieldValue('quoteDay') === 0 &&
      form.getFieldValue('quoteHour') === 0 &&
      form.getFieldValue('quoteMinute') === 0
    ) {
      callback(
        intl
          .get('ssrc.inquiryHall.view.message.cannotTimeIsZero')
          .d('所选天数，小时，分钟不能同时为零')
      );
    } else {
      callback();
    }
  }

  /**
   * 保证金格式
   * */
  bidBoundFormatter(value = null) {
    const isZero = value === 0 || value === '0' || value === '0.00' || value === '0.0';
    const FREE = intl.get('ssrc.common.view.gratis').d('免费');
    if (isZero) {
      return FREE;
    }

    return value;
  }

  /**
   * 竞价运行时间
   * 改变天-设置竞价运行时间
   */
  @Bind()
  changeDay(value) {
    const {
      form: { setFieldsValue, getFieldValue },
    } = this.props;
    const { isQuotationRunningDurationError = false } = this.state;
    if (value === '') {
      if (isUndefined(getFieldValue('hour')) && isUndefined(getFieldValue('minute'))) {
        setFieldsValue({
          quotationRunningDuration: undefined,
        });
      } else {
        setFieldsValue({
          quotationRunningDuration:
            (isUndefined(getFieldValue('hour')) ? 0 : getFieldValue('hour') * 60) +
            (isUndefined(getFieldValue('minute')) ? 0 : getFieldValue('minute')),
        });
      }
    }
    if (value !== '' && !isUndefined(value)) {
      if (isUndefined(getFieldValue('hour')) && isUndefined(getFieldValue('minute'))) {
        setFieldsValue({
          quotationRunningDuration: value * 1440,
        });
      } else {
        setFieldsValue({
          quotationRunningDuration:
            value * 1440 +
            (isUndefined(getFieldValue('hour')) ? 0 : getFieldValue('hour') * 60) +
            (isUndefined(getFieldValue('minute')) ? 0 : getFieldValue('minute')),
        });
      }
      if (isQuotationRunningDurationError) {
        this.setState({ isQuotationRunningDurationError: false });
      }
    }
  }

  /**
   * 竞价运行时间
   * 改变小时-设置竞价运行时间
   */
  @Bind()
  changeHour(value) {
    const {
      form: { setFieldsValue, getFieldValue },
    } = this.props;
    const { isQuotationRunningDurationError = false } = this.state;
    if (value === '') {
      if (isUndefined(getFieldValue('day')) && isUndefined(getFieldValue('minute'))) {
        setFieldsValue({
          quotationRunningDuration: undefined,
        });
      } else {
        setFieldsValue({
          quotationRunningDuration:
            (isUndefined(getFieldValue('day')) ? 0 : getFieldValue('day') * 1440) +
            (isUndefined(getFieldValue('minute')) ? 0 : getFieldValue('minute')),
        });
      }
    }
    if (value !== '' && !isUndefined(value)) {
      if (isUndefined(getFieldValue('day')) && isUndefined(getFieldValue('minute'))) {
        setFieldsValue({
          quotationRunningDuration: value * 60,
        });
      } else {
        setFieldsValue({
          quotationRunningDuration:
            (isUndefined(getFieldValue('day')) ? 0 : getFieldValue('day') * 1440) +
            value * 60 +
            (isUndefined(getFieldValue('minute')) ? 0 : getFieldValue('minute')),
        });
      }
      if (isQuotationRunningDurationError) {
        this.setState({ isQuotationRunningDurationError: false });
      }
    }
  }

  /**
   * 竞价运行时间
   * 改变分钟-设置竞价运行时间
   */
  @Bind()
  changeMinute(value) {
    const {
      form: { setFieldsValue, getFieldValue },
    } = this.props;
    const { isQuotationRunningDurationError = false } = this.state;
    if (value === '') {
      if (isUndefined(getFieldValue('day')) && isUndefined(getFieldValue('hour'))) {
        setFieldsValue({
          quotationRunningDuration: undefined,
        });
      } else {
        setFieldsValue({
          quotationRunningDuration:
            (isUndefined(getFieldValue('day')) ? 0 : getFieldValue('day') * 1440) +
            (isUndefined(getFieldValue('hour')) ? 0 : getFieldValue('hour') * 60),
        });
      }
    }
    if (value !== '' && !isUndefined(value)) {
      if (isUndefined(getFieldValue('day')) && isUndefined(getFieldValue('hour'))) {
        setFieldsValue({
          quotationRunningDuration: value,
        });
      } else {
        setFieldsValue({
          quotationRunningDuration:
            (isUndefined(getFieldValue('day')) ? 0 : getFieldValue('day') * 1440) +
            (isUndefined(getFieldValue('hour')) ? 0 : getFieldValue('hour') * 60) +
            value,
        });
      }
      if (isQuotationRunningDurationError) {
        this.setState({ isQuotationRunningDurationError: false });
      }
    }
  }

  /**
   * 改变报价次序-并行时，清空报价间隔时间
   */
  @Bind()
  changeQuotationOrderType(value) {
    const { form } = this.props;
    if (value === 'PARALLEL') {
      form.setFieldsValue({ quotationInterval: undefined });
    }
  }

  /**
   * 改变审查方式
   * 选择合格制时，合格上限清空置灰
   */
  @Bind()
  changeReviewMethod(value) {
    const {
      form: { setFieldsValue },
    } = this.props;
    if (value === 'QUALIFIED') {
      setFieldsValue({ qualifiedLimit: undefined });
    }
  }

  /**
   * 改变预审文件免费
   * 勾选时，预审文件费清空
   */
  @Bind()
  changeFileFreeFlag(value) {
    const {
      form: { setFieldsValue },
    } = this.props;
    if (value) {
      setFieldsValue({ prequalFileExpense: undefined });
    }
  }

  /**
   * 点击启用评分细项触发提示
   */
  @Bind()
  onclickScore() {
    Modal.confirm({
      title: intl
        .get(`ssrc.inquiryHall.modal.inquiryHall.cannotEditScore`)
        .d('当前无法编辑评分细项，需要保存询价单后编辑'),
    });
  }

  /**
   * 资格预审文件展开modal后触发的方法
   */
  // @Bind()
  // afterOpenUploadModal(attachmentUUID) {
  //   const { form } = this.props;
  //   if (attachmentUUID) {
  //     form.setFieldsValue({
  //       prequalAttachmentUuid: attachmentUUID,
  //     });
  //   }
  // }

  /**
   * 编辑-打开评分要素定义模态框
   */
  @Bind()
  showScoringElement() {
    const {
      inquiryHall: { header = {} },
    } = this.props;
    if (header.prequalHeaderId) {
      this.setState({
        scoringElementVisible: true,
      });
      this.fetchScoringElementData();
    } else {
      this.onclickScore();
    }
  }

  /**
   * 查询-评分要素定义数据
   */
  @Bind()
  fetchScoringElementData() {
    const {
      dispatch,
      inquiryHall: { header = {} },
      organizationId,
    } = this.props;
    dispatch({
      type: 'inquiryHall/fetchScoringElementData',
      payload: {
        prequalHeaderId: header.prequalHeaderId,
        organizationId,
        templatePurpose: 'PREQUALIFICATION',
      },
    });
  }

  /**
   * 获取选中行-评分要素定义
   */
  @Bind()
  handleScoringElementRowSelectChange(_, selectedRows) {
    this.setState({
      scoringElementSelectedRows: selectedRows,
    });
  }

  /**
   * 新增行-评分要素定义
   */
  @Bind()
  handleCreateScoringElement() {
    const {
      dispatch,
      // organizationId,
      // match: { params },
      inquiryHall: { scoringElement = [], header = {} },
    } = this.props;
    dispatch({
      type: 'inquiryHall/updateState',
      payload: {
        scoringElement: [
          {
            // rfxHeaderId: params.rfxId,
            prequalHeaderId: header.prequalHeaderId,
            prequalScoreAssignId: uuidv4(),
            // tenantId: organizationId,
            indicateId: undefined,
            indicateName: undefined,
            indicateType: undefined,
            minScore: undefined,
            maxScore: undefined,
            mustApprovedFlag: 0,
            qualifiedScore: undefined,
            _status: 'create',
          },
          ...scoringElement,
        ],
      },
    });
  }

  /**
   * 删除-评分要素定义
   */
  @Bind
  handleDeleteScoringElement() {
    const {
      dispatch,
      inquiryHall: { scoringElement = [] },
      organizationId,
    } = this.props;
    const { scoringElementSelectedRows } = this.state;
    // 过滤出勾选数据的剩下数据
    const newScoringElement = filter(scoringElement, (item) => {
      return (
        scoringElementSelectedRows &&
        scoringElementSelectedRows
          .map((r) => r.prequalScoreAssignId)
          .indexOf(item.prequalScoreAssignId) < 0
      );
    });
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.remove').d('确定删除选中数据？'),
      onOk: () => {
        const remoteDelete = [];
        const localDelete = [];
        scoringElementSelectedRows.forEach((item) => {
          if (item._status === 'create') {
            localDelete.push(item);
          }
          if (item._status === 'update') {
            remoteDelete.push(item);
          }
        });
        if (isEmpty(remoteDelete)) {
          dispatch({
            type: 'inquiryHall/updateState',
            payload: {
              scoringElement: newScoringElement,
            },
          });
          this.setState({ scoringElementSelectedRows: [] });
        } else {
          dispatch({
            type: 'inquiryHall/deleteScoringElement',
            payload: { remoteDelete, organizationId },
          }).then((res) => {
            if (res) {
              notification.success();
              dispatch({
                type: 'inquiryHall/updateState',
                payload: {
                  scoringElement: newScoringElement,
                },
              });
              this.setState({ scoringElementSelectedRows: [] });
            }
          });
        }
      },
    });
  }

  /**
   * 保存-评分要素定义
   */
  @Bind()
  handleSaveScoringElement() {
    const {
      dispatch,
      organizationId,
      // match: { params },
      inquiryHall: { scoringElement = [], header = {} },
    } = this.props;
    const { scoringElementSelectedRows = [] } = this.state;
    const params = getEditTableData(scoringElement, ['prequalScoreAssignId']);
    if (!isEmpty(params)) {
      const newParams = params.map((item) => {
        return {
          ...item,
          prequalHeaderId: item.prequalHeaderId,
          prequalScoreAssignId: item.prequalScoreAssignId,
          scoreIndicId: item.indicateId,
          mustApprovedFlag: item.mustApprovedFlag,
          qualifiedScore: item.qualifiedScore,
          objectVersionNumber: item.objectVersionNumber,
        };
      });
      dispatch({
        type: 'inquiryHall/saveScoringElement',
        payload: { newParams, organizationId, prequalHeaderId: header.prequalHeaderId },
      }).then((res) => {
        if (res) {
          notification.success();
          this.fetchScoringElementData();
          if (!isEmpty(scoringElementSelectedRows)) {
            this.setState({
              scoringElementSelectedRows: [],
            });
          }
        }
      });
    }
  }

  /**
   * 关闭-评分要素定义模态框
   */
  @Bind()
  handleCancelScoringElement() {
    this.props.dispatch({
      type: 'inquiryHall/updateState',
      payload: {
        scoringElement: [],
      },
    });
    this.setState({
      scoringElementVisible: false,
      scoringElementSelectedRows: [],
    });
  }

  /**
   * 选择参考模板回调-评分要素
   */
  @Bind()
  handleSelectTemplateOk(value) {
    const {
      dispatch,
      inquiryHall: { header = {} },
      organizationId,
    } = this.props;
    const { scoringElementSelectedRows = [] } = this.state;
    if (value.scoreIndics) {
      dispatch({
        type: 'inquiryHall/saveScoringElement',
        payload: {
          newParams: value.scoreIndics,
          organizationId,
          prequalHeaderId: header.prequalHeaderId,
        },
      }).then((res) => {
        if (res) {
          notification.success();
          if (!isEmpty(scoringElementSelectedRows)) {
            this.setState({
              scoringElementSelectedRows: [],
            });
          }
          this.fetchScoringElementData();
        }
      });
    } else {
      Modal.confirm({
        title: intl
          .get(`ssrc.inquiryHall.view.message.confirm.notDefineSE`)
          .d('该模板未定义评分要素'),
        onOk: () => {},
        onCancel: () => {},
      });
    }
  }

  /**
   * 物品明细-新增行
   */
  @Bind()
  createItemLine() {
    const {
      dispatch,
      organizationId,
      inquiryHall: { itemLine = [], itemLinePagination = {}, header = {} },
      match: { params },
    } = this.props;

    // const rfxLineItemNumList = itemLine && itemLine.map(item => item.rfxLineItemNum);
    // const rfxLineItemNumMax = Math.max(...rfxLineItemNumList);
    dispatch({
      type: 'inquiryHall/updateState',
      payload: {
        itemLine: [
          {
            rfxHeaderId: params.rfxId,
            rfxLineItemId: uuidv4(),
            rfxLineItemNum: undefined,
            tenantId: organizationId,
            ouId: undefined, // 业务实体
            itemCategoryId: undefined, // 物品分类
            secondaryQuantity: undefined, // 需求数量
            rfxQuantity: undefined, // 基本数量
            uomId: undefined, // 基本单位
            secondaryUomId: undefined, // 单位
            itemName: null, // 物品描述
            freightIncludedFlag: header.templateFreightIncludedFlag,
            sampleRequestedFlag: 0,
            roundFlag: 0,
            quotationDetailFlag: 0,
            itemLineQuotationDetail: [],
            currentRoundNumber: 1,
            finishedFlag: 0,
            ladderInquiryFlag: 0,
            taxId: header.templateTaxId,
            taxRate: header.templateTaxRate,
            // 后台暂时必传，因为没有改，先调通
            invOrganizationId: undefined,
            demandDate: null,
            validExpiryDateFrom: null,
            validExpiryDateTo: null,
            // quotationEndDate: "2017-12-28 00:00:00",
            // quotationStartDate: "2017-12-27 00:00:00",
            // 非必传
            itemId: undefined,
            itemRemark: undefined,
            deliveryAddress: undefined,
            taxIncludedFlag: header.templateTaxIncludedFlag,
            quotationRange: undefined,
            minLimitPrice: undefined,
            maxLimitPrice: undefined,
            costPrice: undefined,
            quotationStartDate: undefined,
            quotationEndDate: undefined,
            floatType: 'money',
            // offerDetails: '',
            // requestNumber: '',
            // requestLineNumber: '',
            attachmentUuid: uuidv4(),
            _status: 'create',
          },
          ...itemLine,
        ],
        itemLinePagination: addItemToPagination(itemLine.length, itemLinePagination),
      },
    });
  }

  /**
   * 阶梯报价-新增行
   */
  @Bind()
  createLadderLine(rfxLineItemId = undefined) {
    const {
      dispatch,
      organizationId,
      inquiryHall: { ladderLevelData = [] },
    } = this.props;
    dispatch({
      type: 'inquiryHall/updateState',
      payload: {
        ladderLevelData: [
          ...ladderLevelData,
          {
            rfxLineItemId,
            ladderInquiryId: uuidv4(),
            rfxLadderLineNum: undefined,
            ladderFrom: undefined,
            ladderTo: undefined,
            tenantId: organizationId,
            remark: undefined,
            _status: 'create',
          },
        ],
      },
    });
  }

  /**
   * 阶梯报价-保存
   */
  @Bind()
  saveLadderLevel(rfxLineItemId = undefined) {
    const {
      dispatch,
      organizationId,
      inquiryHall: { ladderLevelData = [] },
    } = this.props;
    const { ladderLevelSelectedRowKeys = [] } = this.state;
    const newParams = getEditTableData(ladderLevelData, ['ladderInquiryId']);
    if (!isEmpty(newParams)) {
      const newParameters = newParams.map((item, index) => {
        return {
          ...item,
          rfxLadderLineNum: index + 1,
        };
      });
      dispatch({
        type: 'inquiryHall/saveLadderLevel',
        payload: { newParameters, organizationId, rfxLineItemId },
      }).then((res) => {
        if (res) {
          dispatch({
            type: 'inquiryHall/updateState',
            payload: {
              LadderLevelChange: false,
            },
          });
          dispatch({
            type: 'inquiryHall/fetchLadderLevelyTable',
            payload: { rfxLineItemId, organizationId },
          });
          notification.success();
          if (!isEmpty(ladderLevelSelectedRowKeys)) {
            this.setState({
              ladderLevelSelectedRows: [],
              ladderLevelSelectedRowKeys: [],
            });
          }
        }
      });
    }
  }

  /**
   * 阶梯报价 - 批量删除
   */
  @Bind()
  deleteLadderLevel(rfxLineItemId) {
    const {
      dispatch,
      inquiryHall: { ladderLevelData = [] },
      organizationId,
    } = this.props;
    const { ladderLevelSelectedRowKeys } = this.state;
    // 过滤出勾选数据
    const newParameters = filter(ladderLevelData, (item) => {
      return ladderLevelSelectedRowKeys.indexOf(item.ladderInquiryId) >= 0;
    });
    // 过滤出勾选数据的剩下数据
    const newLadderLevel = filter(ladderLevelData, (item) => {
      return ladderLevelSelectedRowKeys.indexOf(item.ladderInquiryId) < 0;
    });
    // 过滤出新增未保存数据
    const oldLadderLevelData = filter(ladderLevelData, (item) => {
      return item._status === 'update';
    });
    if (newParameters.length > 0 && newParameters[0].rfxLadderLineNum < oldLadderLevelData.length) {
      notification.warning({
        message: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.onlySelectedLast`)
          .d('只能从最后一行已保存行开始删除!'),
      });
    } else {
      Modal.confirm({
        title: intl.get('hzero.common.message.confirm.remove').d('确定删除选中数据？'),
        onOk: () => {
          const remoteDelete = [];
          const localDelete = [];
          newParameters.forEach((item) => {
            if (item._status === 'create') {
              localDelete.push(item);
            }
            if (item._status === 'update') {
              remoteDelete.push(item);
            }
          });
          if (isEmpty(remoteDelete)) {
            dispatch({
              type: 'inquiryHall/updateState',
              payload: {
                ladderLevelData: newLadderLevel,
              },
            });
            this.setState({ ladderLevelSelectedRowKeys: [], ladderLevelSelectedRows: [] });
          } else {
            dispatch({
              type: 'inquiryHall/deleteLadderLevelLines',
              payload: { remoteDelete, organizationId, rfxLineItemId },
            }).then((res) => {
              if (res) {
                notification.success();
                dispatch({
                  type: 'inquiryHall/updateState',
                  payload: {
                    ladderLevelData: newLadderLevel,
                  },
                });
                this.setState({ ladderLevelSelectedRowKeys: [], ladderLevelSelectedRows: [] });
              }
            });
          }
        },
      });
    }
  }

  /**
   * 物品明细保存整合
   *
   * @param {*} key
   * @param {*} [data=[]]
   * @returns
   * @memberof Update
   */
  getItemLineData(key = [], data = []) {
    if (isEmpty(data)) {
      return [];
    }

    const middleData = data.map((item) => {
      if (!item.quotationDetails || isEmpty(item.quotationDetails)) {
        return item;
      }
      const quotationList = item.quotationDetails.map((quotation) => {
        return {
          ...quotation,
          rfxLineItemId:
            typeof quotation.rfxLineItemId === 'string' ? null : quotation.rfxLineItemId,
        };
      });
      return {
        ...item,
        quotationDetails: quotationList,
      };
    });

    return getEditTableData(middleData, key);
  }

  /**
   * 复制物品明细
   * */
  @Bind()
  copyItemLine() {
    const {
      dispatch,
      inquiryHall: { itemLine = [], itemLinePagination = {} },
    } = this.props;

    const { itemLineSelectedRowKeys = [], itemLineSelectedRows = [] } = this.state;
    if (isEmpty(itemLine) || isEmpty(itemLineSelectedRowKeys)) {
      notification.warning({
        message: intl.get('ssrc.common.pleaseSelectItemLinesToCopy').d('请勾选要复制的行!'),
      });
      return;
    }

    const NewItemLins = itemLineSelectedRows.map((item) => {
      const NewItem = item.$form.getFieldsValue() || {};
      return {
        ...(item || {}),
        ...NewItem,
        rfxLineItemId: uuidv4(),
        rfxLineItemNum: null,
        prNum: null,
        prLineNum: null,
        prHeaderId: null,
        prLineId: null,
        creationDate: null,
        lastUpdateDate: null,
        _status: 'create',
      };
    });

    const CopiedItemLineObj = {
      itemLine: itemLine.concat(NewItemLins),
      itemLinePagination: addItemsToPagination(
        NewItemLins.length,
        itemLine.length,
        itemLinePagination
      ),
    };

    dispatch({
      type: 'inquiryHall/updateState',
      payload: CopiedItemLineObj,
    });
    this.handleItemLineRowSelectChange();
  }

  /**
   * 物品明细-保存
   */
  @Bind(500)
  async saveItemLine() {
    const {
      dispatch,
      organizationId,
      form,
      match: { params },
      inquiryHall: { itemLine = [] },
    } = this.props;
    const { itemLineSelectedRowKeys = [] } = this.state;
    const newParameters = this.getItemLineData(['rfxLineItemId'], itemLine);
    const formatNewParameters = newParameters.map((item) => {
      return {
        ...(item || {}),
        demandDate: dateFormate(item.demandDate, DATETIME_MIN),
        validExpiryDateFrom: dateFormate(item.validExpiryDateFrom, DATETIME_MIN),
        validExpiryDateTo: dateFormate(item.validExpiryDateTo, DATETIME_MAX),
      };
    });
    if (!isEmpty(newParameters)) {
      dispatch({
        type: 'inquiryHall/saveItemLine',
        payload: {
          newParameters: formatNewParameters,
          organizationId,
          rfxHeaderId: params.rfxId,
          customizeUnitCode: 'SSRC.INQUIRY_HALL.EDIT_LINE',
        },
      }).then((res) => {
        if (res) {
          dispatch({
            type: 'inquiryHall/updateState',
            payload: {
              itemLineChange: false,
              itemLineQuotationDetail: [],
              itemLine: [],
            },
          });
          notification.success();
          this.fetchRfxHeader();
          this.fetchItemLine();
          if (form.getFieldValue('matchRestrictFlag')) {
            this.fetchSupplierLine();
          }
          if (!isEmpty(itemLineSelectedRowKeys)) {
            this.setState({
              itemLineSelectedRows: [],
              itemLineSelectedRowKeys: [],
            });
          }
        }
      });
    }
  }

  // 收集表单错误信息
  notificationMessage(dataList = [], title = null) {
    const errs = [title, '--'];
    dataList.forEach((data) => {
      if (!data.$form) {
        return;
      }
      const err = data.$form.getFieldsError() || null;
      if (!err || isEmpty(err)) {
        return;
      }

      Object.keys(err).forEach((key) => {
        const field = err[key] || null;
        if (field && Array.isArray(field)) {
          errs.push(`[${field[0]}]`, ';');
        }
      });
    });

    const message = errs.join('\n\t\r');
    notification.warning({
      message,
    });
  }

  /**
   * 物品明细 - 批量删除
   */
  @Bind()
  async deleteItemLines() {
    const {
      dispatch,
      inquiryHall: { itemLine = [], itemLinePagination = {} },
      organizationId,
    } = this.props;
    const { itemLineSelectedRowKeys } = this.state;
    const newItemLine = itemLine.map((item) => {
      const newItem = item;
      delete newItem.$form;
      return newItem;
    });
    // 过滤出勾选数据
    const newParameters = filter(newItemLine, (item) => {
      return itemLineSelectedRowKeys.indexOf(item.rfxLineItemId) >= 0;
    });
    // 过滤出勾选数据的剩下数据
    const newItemDetails = filter(newItemLine, (item) => {
      return itemLineSelectedRowKeys.indexOf(item.rfxLineItemId) < 0;
    });
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.remove').d('确定删除选中数据？'),
      onOk: () => {
        const remoteDelete = [];
        const localDelete = [];
        newParameters.forEach((item) => {
          if (item._status === 'create') {
            localDelete.push(item);
          }
          if (item._status === 'update') {
            remoteDelete.push(item);
          }
        });
        if (isEmpty(remoteDelete)) {
          dispatch({
            type: 'inquiryHall/updateState',
            payload: {
              itemLine: newItemDetails,
              itemLinePagination: delItemsToPagination(
                newParameters.length,
                itemLine.length,
                itemLinePagination
              ),
            },
          });
          this.setState({ itemLineSelectedRowKeys: [], itemLineSelectedRows: [] });
        } else {
          dispatch({
            type: 'inquiryHall/deleteItemLines',
            payload: { remoteDelete, organizationId },
          }).then((res) => {
            if (res) {
              notification.success();
              dispatch({
                type: 'inquiryHall/updateState',
                payload: {
                  itemLine: newItemDetails,
                  itemLinePagination: delItemsToPagination(
                    newParameters.length,
                    itemLine.length,
                    itemLinePagination
                  ),
                },
              });

              this.fetchRfxHeader();
              this.fetchItemLine();
              this.fetchSupplierLine();
              this.setState({ itemLineSelectedRowKeys: [], itemLineSelectedRows: [] });
            }
          });
        }
      },
    });
  }

  /**
   * 阶梯报价-获取删除选中行
   *
   * @param {*} selectedRowKeys
   * @memberof EditForm
   */
  @Bind()
  handleItemLineRowSelectChange(selectedRowKeys = [], selectedRows = []) {
    this.setState({ itemLineSelectedRowKeys: selectedRowKeys, itemLineSelectedRows: selectedRows });
  }

  /**
   * 物品明细-获取删除选中行
   *
   * @param {*} selectedRowKeys
   * @memberof EditForm
   */
  @Bind()
  handleLadderLevelRowSelectChange(selectedRowKeys, selectedRows) {
    this.setState({
      ladderLevelSelectedRowKeys: selectedRowKeys,
      ladderLevelSelectedRows: selectedRows,
    });
  }

  /**
   * 物品明细-表格内容改变
   */
  @Bind()
  changeItemLineTableData() {
    const {
      dispatch,
      inquiryHall: { itemLineChange = false },
    } = this.props;
    if (!itemLineChange) {
      dispatch({
        type: 'inquiryHall/updateState',
        payload: {
          itemLineChange: true,
        },
      });
    }
  }

  /**
   * 阶梯报价-表格内容改变
   */
  @Bind()
  changeLadderLevelTableData() {
    const {
      dispatch,
      inquiryHall: { LadderLevelChange = false },
    } = this.props;
    if (!LadderLevelChange) {
      dispatch({
        type: 'inquiryHall/updateState',
        payload: {
          LadderLevelChange: true,
        },
      });
    }
  }

  /**
   * 设置报价明细store
   *
   * @memberof Update
   */
  settingQuotationDetailStore(data = []) {
    const { dispatch } = this.props;

    dispatch({
      type: 'inquiryHall/updateState',
      payload: {
        itemLineQuotationDetail: data,
      },
    });
  }

  /**
   * 清除物品行的报价详情数据
   *
   * @memberof Update
   */
  clearCurrentRowQuotationData() {
    const {
      inquiryHall: { itemLineQuotationDetail = [] },
    } = this.props;
    this.settingQuotationDetailStore(itemLineQuotationDetail);

    this.setState({
      itemLineEditoringId: undefined,
    });
  }

  /**
   * 筛选供应商-修改保存
   */
  @Bind()
  saveSupplierRecordLine(itemIds) {
    const { itemLineSelectedRowKeys } = this.state;
    const {
      match: { params },
      dispatch,
      inquiryHall: { supplierData = [] },
      organizationId,
    } = this.props;
    const rfxItemSupAssignList = getEditTableData(supplierData, ['itemSupAssignId']);
    const itemId = itemIds ? [itemIds] : itemLineSelectedRowKeys;
    dispatch({
      type: 'inquiryHall/saveSupplierRecordLine',
      payload: {
        organizationId,
        rfxItemSupAssignList,
        itemIds: itemId,
        headerId: params.rfxId,
        tenantId: organizationId,
      },
    }).then((res) => {
      if (res) {
        notification.success();
        this.handleItemLineRowSelectChange();
        this.fetchItemLine();
      }
    });
    this.ItemLineTable.hideOperationRecord();
  }

  /**
   * 供应商列表-新增行
   */
  @Bind()
  createSupplierLine() {
    const {
      dispatch,
      organizationId,
      match: { params },
      inquiryHall: { supplierLine = [], supplierLinePagination = {} },
    } = this.props;
    dispatch({
      type: 'inquiryHall/updateState',
      payload: {
        supplierLine: [
          {
            rfxHeaderId: params.rfxId,
            rfxLineSupplierId: uuidv4(),
            tenantId: organizationId,
            supplierCompanyNum: undefined,
            supplierCompanyName: undefined,
            // passedQiXinBao: '',
            // lifeCycle: '',
            contactName: undefined,
            contactMobilephone: undefined,
            contactMail: '',
            _status: 'create',
          },
          ...supplierLine,
        ],
        supplierLinePagination: addItemToPagination(supplierLine.length, supplierLinePagination),
      },
    });
  }

  /**
   * 供应商列表-保存
   */
  @Bind()
  saveSupplierLine() {
    const {
      dispatch,
      organizationId,
      match: { params },
      inquiryHall: { supplierLine = [], supplierLinePagination = {} },
    } = this.props;
    const { supplierLineSelectedRowKeys = [] } = this.state;
    const newParams = getEditTableData(supplierLine, ['rfxLineSupplierId']);
    if (!isEmpty(newParams)) {
      dispatch({
        type: 'inquiryHall/saveSupplierLine',
        payload: { newParams, organizationId, rfxHeaderId: params.rfxId },
      }).then((res) => {
        if (res) {
          dispatch({
            type: 'inquiryHall/updateState',
            payload: {
              supplierLineChange: false,
            },
          });
          notification.success();
          this.fetchSupplierLine(supplierLinePagination);
          if (!isEmpty(supplierLineSelectedRowKeys)) {
            this.setState({
              supplierLineSelectedRowKeys: [],
            });
          }
        }
      });
    } else {
      const supplierList = intl.get(`ssrc.inquiryHall.view.message.tab.vendorList`).d('供应商列表');
      this.notificationMessage(supplierLine, supplierList);
    }
  }

  /**
   * 供应商列表-清除
   */
  @Bind()
  cleanSupplierLine(record) {
    const {
      dispatch,
      inquiryHall: { supplierLine = [], supplierLinePagination = {} },
    } = this.props;
    const newSupplierList = supplierLine.filter(
      (item) => item.rfxLineSupplierId !== record.rfxLineSupplierId
    );
    dispatch({
      type: 'inquiryHall/updateState',
      payload: {
        supplierLine: [...newSupplierList],
        supplierLinePagination: delItemToPagination(supplierLine.length, supplierLinePagination),
      },
    });
  }

  /**
   * 查询供应商列表
   * @param {Object} fields 查询字段
   */
  @Bind()
  handleSearchSupplier(itemIds) {
    const {
      match: { params },
      dispatch,
      organizationId,
    } = this.props;
    dispatch({
      type: 'inquiryHall/supplierRecord',
      payload: {
        organizationId,
        itemIds,
        rfxHeaderId: params.rfxId,
      },
    });
  }

  /**
   * 供应商列表 - 批量删除
   */
  @Bind()
  deleteSupplierLines() {
    const {
      dispatch,
      organizationId,
      inquiryHall: { supplierLine = [], supplierLinePagination = {} },
      match: { params },
    } = this.props;
    const { supplierLineSelectedRowKeys = [], supplierLineSelectedRows = [] } = this.state;
    // 过滤出勾选数据
    const newParameters = filter(supplierLine, (item) => {
      return supplierLineSelectedRowKeys.indexOf(item.rfxLineSupplierId) >= 0;
    });
    // 过滤出勾选数据的剩下数据
    const newSupplierList = filter(supplierLine, (item) => {
      return supplierLineSelectedRowKeys.indexOf(item.rfxLineSupplierId) < 0;
    });
    // 跨页远程删除数据组合
    const crossPageNewParams = [];
    supplierLineSelectedRows.forEach((item) => {
      const supplierItem = {
        rfxLineSupplierId: item.rfxLineSupplierId,
        rfxHeaderId: params.rfxId,
        prLineSupplierId: item.prLineSupplierId,
      };
      crossPageNewParams.push(supplierItem);
    });

    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.remove').d('确定删除选中数据？'),
      onOk: () => {
        const remoteDelete = [];
        const localDelete = [];
        newParameters.forEach((item) => {
          if (item._status === 'create') {
            localDelete.push(item);
          }
          if (item._status === 'update') {
            remoteDelete.push(item);
          }
        });
        if (isEmpty(remoteDelete)) {
          dispatch({
            type: 'inquiryHall/updateState',
            payload: {
              supplierLine: newSupplierList,
              supplierLinePagination: delItemsToPagination(
                newParameters.length,
                supplierLine.length,
                supplierLinePagination
              ),
            },
          });
          this.setState({ supplierLineSelectedRowKeys: [] });
        } else {
          dispatch({
            type: 'inquiryHall/deleteSupplierLines',
            payload: { remoteDelete: crossPageNewParams, organizationId },
          }).then((res) => {
            if (res) {
              // 删除成功
              notification.success();

              // dispatch({
              //   type: 'inquiryHall/updateState',
              //   payload: {
              //     supplierLine: newSupplierList,
              //     supplierLinePagination: delItemsToPagination(
              //       newParameters.length,
              //       supplierLine.length,
              //       supplierLinePagination
              //     ),
              //   },
              // });
              this.fetchSupplierLine();
              this.setState({ supplierLineSelectedRowKeys: [] });
            }
          });
        }
      },
    });
  }

  /**
   * 供应商列表-风险监控
   */
  @Bind()
  linkRiskScan(record) {
    const { dispatch } = this.props;

    const handleLinkRisk = () => {
      dispatch({
        type: 'inquiryHall/linkRiskScan',
        payload: {
          enterpriseId: record.supplierCompanyId,
          scanCode: 'rfx_supplier',
        },
      }).then((res) => {
        if (!res || !urlReg.test(res)) {
          notification.error();
          return;
        }

        window.open(res);
      });
    };

    if (record.isMonitor === 0 && record.isShowScan === 1) {
      Modal.confirm({
        title: intl
          .get(`ssrc.inquiryHall.view.message.validate.tureRiskScan`)
          .d('该企业未加入监控，扫描将扣除扫描额度，确认扫描吗?'),
        onOk: () => handleLinkRisk(),
      });
    } else {
      handleLinkRisk();
    }
  }

  /**
   * 供应商列表-获取删除选中行
   *
   * @param {*} selectedRowKeys
   * @memberof EditForm
   */
  @Bind()
  handleSupplierLineRowSelectChange(selectedRowKeys, selectedRows) {
    this.setState({
      supplierLineSelectedRowKeys: selectedRowKeys,
      supplierLineSelectedRows: selectedRows,
    });
  }

  /**
   * 供应商列表-表格内容改变
   */
  @Bind()
  changeSupplierLineTableData() {
    const {
      dispatch,
      inquiryHall: { supplierLineChange = false },
    } = this.props;
    if (!supplierLineChange) {
      dispatch({
        type: 'inquiryHall/updateState',
        payload: {
          supplierLineChange: true,
        },
      });
    }
  }

  /**
   * 供应商关系图谱
   *
   * @memberof Update
   */
  @Bind()
  async supplierRelationMap() {
    const {
      organizationId,
      inquiryHall: { header = {}, supplierLine = [] },
      match: { params },
    } = this.props;

    if (!Array.isArray(supplierLine) || !supplierLine.length) {
      notification.warning({
        message: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.notOpenService`)
          .d('您尚未开通企业风控服务，请前往应用商店开通'),
      });
      return;
    }

    const companyNames = [];
    supplierLine.forEach((item) => {
      const { supplierCompanyName, supplierCompanyId, supplierId } = item || {};
      if (!supplierCompanyId && !supplierId) {
        return;
      }
      const currentLine = {
        supplierCompanyName,
        supplierCompanyId,
        supplierId,
        rfxHeaderId: params.rfxId,
      };
      companyNames.push(currentLine);
    });

    if (!header?.secondarySourceCategory) return;

    supplierRelationMapNew({
      organizationId,
      data: {
        rfxHeaderId: params.rfxId,
        supplierLists: companyNames,
        businessType: header?.secondarySourceCategory,
      },
    }).then((res) => {
      if (isText(res)) {
        const url = getSupplierRelationUrl(res);
        window.open(url);
      }
    });
  }

  /**
   * 供应商列表-分页
   */
  @Bind()
  changeSupplierLinePage(page) {
    const {
      dispatch,
      inquiryHall: { supplierLineChange = false },
    } = this.props;
    if (supplierLineChange) {
      Modal.confirm({
        title: intl
          .get(`ssrc.inquiryHall.view.message.changeDataPageTip`)
          .d('切换分页前请先保存数据！'),
        onOk: () => {
          this.setState({});
        },
        onCancel: () => {
          this.fetchSupplierLine(page);
          dispatch({
            type: 'inquiryHall/updateState',
            payload: {
              supplierLineChange: false,
            },
          });
        },
      });
    } else {
      this.fetchSupplierLine(page);
    }
  }

  @Bind()
  handleBindOnRef(ref = {}) {
    this.attachmentRef = ref;
  }

  /**
   * 打开-批量添加供应商模态框，并且查询数据
   */
  @Bind()
  bulkAddSupplier() {
    this.setState({
      bulkAddSupplierVisible: true,
    });
    this.fetchBulkSupplierData();
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

  /**
   * 查询-批量添加供应商模态框数据
   */
  @Bind()
  fetchBulkSupplierData(page = {}) {
    const {
      dispatch,
      organizationId,
      userId,
      form: { getFieldValue },
      match: { params },
    } = this.props;
    const fieldValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    const companyId = getFieldValue('companyId');
    const templateId = getFieldValue('templateId');
    dispatch({
      type: 'inquiryHall/fetchBulkSupplierData',
      payload: {
        page,
        ...fieldValues,
        organizationId,
        userId,
        companyId,
        templateId,
        sourceHeaderId: params.rfxId,
        sourceFrom: 'RFX',
      },
    });
  }

  /**
   * 取消-关闭批量添加供应商模态框
   */
  @Bind()
  cancelBulkAddSupplier() {
    this.setState({
      bulkAddSupplierVisible: false,
      bulkAddSupplierSelectedRows: [],
      bulkAddSupplierSelectedRowKeys: [],
    });
  }

  /**
   * 获取选中行-批量添加供应商模态框
   */
  @Bind()
  handleBulkAddSupplierRowSelectChange(keys, selectedRows) {
    this.setState({
      bulkAddSupplierSelectedRowKeys: keys,
      bulkAddSupplierSelectedRows: selectedRows,
    });
  }

  /**
   * 批量添加供应商
   */

  @Bind()
  handleBulkAddSupplier() {
    const {
      dispatch,
      organizationId,
      match: { params },
      inquiryHall: { header = {}, supplierLinePagination = {} },
    } = this.props;
    const { companyId = null } = header || {};
    const { bulkAddSupplierSelectedRows } = this.state;
    if (!companyId) {
      return;
    }
    if (!isEmpty(bulkAddSupplierSelectedRows)) {
      const newParams = bulkAddSupplierSelectedRows.map((item) => {
        return {
          ...item,
          rfxHeaderId: params.rfxId,
          tenantId: organizationId,
          contactMail: item.mail,
          contactMobilephone: item.mobilephone,
        };
      });
      dispatch({
        type: 'inquiryHall/supplierAttachment',
        payload: {
          newParams,
          organizationId,
          companyId,
          rfxHeaderId: params.rfxId,
        },
      }).then((res) => {
        if (res) {
          let supplierAttachmentsStatus = false;
          const supplierAttachments = res.map((item) => item.expirAttachmentsDtosLen);
          supplierAttachments.forEach((element) => {
            if (element) {
              supplierAttachmentsStatus = true;
            } else {
              return null;
            }
          });
          if (supplierAttachmentsStatus) {
            this.cancelBulkAddSupplier();
            this.fetchSupplierLine(supplierLinePagination);
            this.openSupplierQualification(this.renderDataSource(res), res);
          } else {
            notification.success();
            this.cancelBulkAddSupplier();
            this.fetchSupplierLine(supplierLinePagination);
            // dispatch({
            //   type: 'inquiryHall/saveSupplierLine',
            //   payload: { newParams, organizationId, rfxHeaderId: params.rfxId },
            // }).then(result => {
            //   if (result) {
            //     notification.success();
            //     this.cancelBulkAddSupplier();
            //     this.fetchSupplierLine(supplierLinePagination);
            //   }
            // });
          }
        }
      });
    }
  }

  /**
   * 保存供应商资质到期数据
   */
  @debounce(500)
  @Bind()
  handleSupplierQualification() {
    let newParams = [];
    const {
      dispatch,
      organizationId,
      match: { params },
      inquiryHall: { supplierLinePagination = {} },
    } = this.props;
    const { supplierQualificationData, supplierQualificationSelectedRows } = this.state;
    const companyArray = [
      ...new Set(supplierQualificationSelectedRows.map((item) => item.companyId)),
    ];
    companyArray.forEach((companyId) => {
      const supplierQualificationList = supplierQualificationData.filter(
        (element) => element.companyId === companyId
      );
      const newSupplierQualificationList = supplierQualificationList.map((supplierItem) => {
        return {
          ...supplierItem,
          rfxHeaderId: params.rfxId,
          tenantId: organizationId,
          contactMail: supplierItem.mail,
          contactMobilephone: supplierItem.mobilephone,
        };
      });
      newParams = [...newParams, ...newSupplierQualificationList];
    });
    dispatch({
      type: 'inquiryHall/saveSupplierLine',
      payload: { newParams, organizationId, rfxHeaderId: params.rfxId },
    }).then((result) => {
      if (result) {
        notification.success();
        this.cancelSupplierQualification();
        this.fetchSupplierLine(supplierLinePagination);
      }
    });
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
            index,
            ...otherItem,
            ...element,
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

  /**
   * 打开-供应商资质到期提醒模态框
   */
  @Bind()
  openSupplierQualification(res, resultItem) {
    this.setState({
      supplierQualificationVisible: true,
      supplierQualificationDataSource: res,
      supplierQualificationData: resultItem,
      supplierQualificationSelectedRows: res,
    });
  }

  /**
   * 取消-关闭供应商资质到期提醒模态框
   */
  @Bind()
  cancelSupplierQualification() {
    this.setState({
      supplierQualificationData: [],
      supplierQualificationDataSource: [],
      supplierQualificationVisible: false,
      supplierQualificationSelectedRows: [],
    });
  }

  /**
   * 获取选中行-供应商资质到期提醒模态框
   */
  @Bind()
  handleQualificationRowSelectChange(_, selectedRows) {
    this.setState({
      supplierQualificationSelectedRows: selectedRows,
    });
  }

  /**
   * 专家行选择
   *
   * @param {*} [keys=[]]
   * @param {*} [rows=[]]
   * @memberof Update
   */
  @Bind()
  onExpertRowChange(keys = [], rows = []) {
    this.setState({
      expertLineSelectedRowKeys: keys,
      expertLineSelectedRows: rows,
    });
  }

  /**
   * 创建专家评分
   *
   * @param {string} [type='']
   * @memberof Update
   */
  @Bind()
  onCreateLine() {
    // add: 为了批量创建子账户, 在新建前增加子账户弹窗, 可多选
    this.setState({
      expertModalVisible: true,
    });
  }

  /**
   * 保存专家评分
   *
   * @param {*} type
   * @returns
   * @memberof Update
   */
  @Bind()
  onSaveExpert(type) {
    const {
      organizationId,
      dispatch,
      bidHall: { evaluateExpertList = [], header = {} },
    } = this.props;

    this.setState({
      expertSaveType: type,
    });

    const tempEvaluateExpertList = getEditTableData(evaluateExpertList, ['evaluateExpertId']).map(
      (item) => ({
        ...item,
        evaluateLeaderFlag: +item.evaluateLeaderFlag,
      })
    );

    const evaluateExperts = {
      evaluateExpertList: tempEvaluateExpertList,
      sourceTemplateId: header.templateId,
    };

    dispatch({
      type: 'bidHall/saveScoringNoneExpert',
      payload: {
        organizationId,
        evaluateExperts,
      },
    }).then((res) => {
      if (res) {
        notification.success();
        this.fetchExpert();
        this.setState({ expertLineSelectedRows: [] });
      }
    });
  }

  /**
   * 评分要素-删除 筛选本地且不删除的数据
   *
   * @param {*} data
   * @returns
   * @memberof Update
   */
  filterExpertsUnSelectedOldData(data) {
    const { expertLineSelectedRows } = this.state;
    const sourceData = filter(data, (item) => {
      return (
        expertLineSelectedRows &&
        expertLineSelectedRows.map((id) => id.evaluateExpertId).indexOf(item.evaluateExpertId) < 0
      );
    });

    return sourceData;
  }

  /**
   * 批量删除专家评分
   *
   * @param {*} types
   * @returns
   * @memberof Update
   */
  @Bind()
  onDeleteExpert() {
    const {
      organizationId,
      dispatch,
      bidHall: { evaluateExpertList = [] },
    } = this.props;

    const { expertLineSelectedRows } = this.state;
    if (isEmpty(expertLineSelectedRows)) {
      return;
    }

    const sourceData = this.filterExpertsUnSelectedOldData(evaluateExpertList);

    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.remove').d('确定删除选中数据？'),
      onOk: () => {
        const remoteDelete = [];
        expertLineSelectedRows.forEach((item) => {
          if (item._status === 'update') {
            remoteDelete.push(item.evaluateExpertId);
          }
        });

        if (isEmpty(remoteDelete)) {
          dispatch({
            type: 'bidHall/updateState',
            payload: {
              evaluateExpertList: sourceData,
            },
          });
          this.setState({ expertLineSelectedRows: [], expertLineSelectedRowKeys: [] });
        } else {
          dispatch({
            type: 'bidHall/deleteScoringNoneExpert',
            payload: { remoteDelete, organizationId },
          }).then((res) => {
            if (res) {
              notification.success();
              this.fetchExpert();
              this.setState({ expertLineSelectedRows: [], expertLineSelectedRowKeys: [] });
            }
          });
        }
      },
      onCancel: () => {
        // this.setState({ expertLineSelectedRows: [], expertLineSelectedRowKeys: [] });
      },
    });
  }

  /**
   * EditTable  选择评分要素
   *
   * @param {*} keys
   * @param {*} rows
   * @memberof Update
   */
  @Bind()
  onScoringLineChange(keys, rows) {
    this.setState({
      scoringElementSelectedRows: rows,
      scoringElementSelectedRowKeys: keys,
      tabScoringElementSelectedRows: rows,
    });
  }

  /**
   * 增加评分要素数据段
   *
   * @param {*} type
   * @memberof Update
   */
  @Bind()
  onCreateScoringElements(type) {
    const {
      organizationId,
      dispatch,
      bidHall: { scoringNoneTempelate, scoringBusinessTempelate, scoringTechnologyTempelate },
      inquiryHall: { header = {} },
    } = this.props;

    const defaultData = {};
    let CurrentWeight = 50;
    if (type === 'BUSINESS') {
      const newScoringBusiness =
        scoringBusinessTempelate.filter((item) => item._status !== 'create')[0] || {};
      if (isEmpty(newScoringBusiness)) {
        CurrentWeight = header.businessWeight ?? CurrentWeight;
      } else {
        CurrentWeight =
          (newScoringBusiness.$form.getFieldsValue() || {}).businessWeight ??
          newScoringBusiness.businessWeight ??
          CurrentWeight;
      }
      defaultData.businessWeight = CurrentWeight;
    } else if (type === 'TECHNOLOGY') {
      const firstLineData =
        scoringTechnologyTempelate.filter((item) => item._status !== 'create')[0] || {};
      if (isEmpty(firstLineData)) {
        CurrentWeight = header.technologyWeight ?? CurrentWeight;
      } else {
        CurrentWeight =
          (firstLineData.$form.getFieldsValue() || {}).technologyWeight ??
          firstLineData.technologyWeight ??
          CurrentWeight;
      }
      defaultData.technologyWeight = CurrentWeight;
    }
    let newPayload = {
      evaluateIndicId: uuidv4(),
      tenantId: header.tenantId,
      indicateId: undefined,
      indicateCode: undefined,
      indicateName: undefined,
      indicateType: 'SCORE',
      indicateRemark: undefined,
      weight: header.templateScoreType === 'SCORE' ? 100 : undefined,
      minScore: header.templateScoreType === 'WEIGHT' ? 0 : undefined,
      maxScore: header.templateScoreType === 'WEIGHT' ? 100 : undefined,
      sourceFrom: 'RFX',
      openBidOrder: header.openBidOrder || 'BUSINESS_FIRST',
      organizationId,
      expertCategory: type,
      sourceHeaderId: header.rfxHeaderId,
      indicStatus: 'SUBMITTED', // 查询提交后的评分要素数据
      team: type,
      detailEnabledFlag: 0,
      _status: 'create',
    };
    newPayload = { ...newPayload, ...defaultData };

    switch (type) {
      case 'BUSINESS':
        dispatch({
          type: 'bidHall/updateState',
          payload: {
            scoringBusinessTempelate: [newPayload, ...scoringBusinessTempelate],
          },
        });
        break;

      case 'TECHNOLOGY':
        dispatch({
          type: 'bidHall/updateState',
          payload: {
            scoringTechnologyTempelate: [newPayload, ...scoringTechnologyTempelate],
          },
        });
        break;

      default:
        dispatch({
          type: 'bidHall/updateState',
          payload: {
            scoringNoneTempelate: [newPayload, ...scoringNoneTempelate],
          },
        });
        break;
    }
  }

  /**
   * 保存评分要素
   *
   * @param {string} [type='']
   * @returns
   * @memberof Update
   */
  @Bind()
  onSaveScoringElements(type = '') {
    const {
      organizationId,
      dispatch,
      bidHall: { scoringNoneTempelate, scoringBusinessTempelate, scoringTechnologyTempelate },
    } = this.props;

    this.setState({
      scoringSaveType: type,
    });

    let newParams = [];

    switch (type) {
      case 'BUSINESS':
        newParams = getEditTableData(scoringBusinessTempelate, ['evaluateIndicId']);
        break;
      case 'TECHNOLOGY':
        newParams = getEditTableData(scoringTechnologyTempelate, ['evaluateIndicId']);
        break;
      default:
        newParams = getEditTableData(scoringNoneTempelate, ['evaluateIndicId']);
        break;
    }

    if (!newParams.length) {
      return;
    }

    dispatch({
      type: 'bidHall/saveScoringNoneTempelate',
      payload: {
        organizationId,
        newParams,
      },
    }).then((res) => {
      if (res) {
        notification.success();
        this.fetchScoring();
      }
    });
  }

  /**
   * 评分要素参考模板
   *
   * @param {*} values
   * @memberof Update
   */
  @Bind()
  onSelectTemplateOk(values) {
    const {
      organizationId,
      dispatch,
      inquiryHall: { header = {} },
    } = this.props;

    const commonFields = {
      tenantId: header.tenantId,
      sourceFrom: 'RFX',
      sourceHeaderId: header.rfxHeaderId,
      openBidOrder: header.openBidOrder || 'SYNC',
    };

    const newParams = values.scoreIndics.map((item) => {
      return { ...item, ...commonFields };
    });

    dispatch({
      type: 'bidHall/saveScoringNoneTempelate',
      payload: {
        organizationId,
        newParams,
      },
    }).then((res) => {
      if (res) {
        notification.success();
        this.fetchScoring();
      }
    });
  }

  /**
   * 保存评分模板
   *
   * @param {*} record
   * @memberof Update
   */
  @Bind()
  saveAllScoringTemplate(record) {
    const {
      organizationId,
      dispatch,
      inquiryHall: { header = {} },
    } = this.props;

    dispatch({
      type: 'bidHall/saveAllScoringTemplate',
      payload: {
        organizationId,
        sourceHeaderId: header.rfxHeaderId,
        sourceFrom: 'RFX',
        templateId: record.templateId,
        indicStatus: 'SUBMITTED',
        templatePurpose: record.templatePurpose,
      },
    }).then((res) => {
      if (res) {
        notification.success();
        this.fetchScoring();
      }
    });
  }

  // 竖版 评审信息切换卡片改变
  @Bind()
  changeVerticalReviewMessageTabsActiveKey(key = null) {
    if (!key) {
      return;
    }

    this.setState({
      verticalReviewMessageTabsActiveKey: key,
    });
  }

  /**
   * 评分要素-专家分配 保存
   *
   * @memberof Update
   */
  @Bind()
  saveScoringAssignExpert() {
    const {
      organizationId,
      dispatch,
      bidHall: { currentScoringExperts = [] },
    } = this.props;

    const newParams = getEditTableData(currentScoringExperts, 'evaluateExpertId');

    if (isEmpty(newParams)) {
      this.cancelAssignExpert();
    } else {
      dispatch({
        type: 'bidHall/saveEvaluateIndicAssign',
        payload: {
          organizationId,
          newParams,
        },
      }).then((res) => {
        if (res) {
          notification.success();
        }
      });
    }
    this.cancelAssignExpert();
  }

  /**
   * 评分要素-专家分配 打开model
   *
   * @param {*} record
   * @memberof Update
   */
  @Bind()
  openAssignExpertModal(record) {
    const { organizationId, dispatch } = this.props;

    this.setState({
      evaluateAssignModalVisible: true,
    });

    dispatch({
      type: 'bidHall/fetchEvaluateIndicAssign',
      payload: {
        organizationId,
        evaluateIndicId: record.evaluateIndicId || '',
        evaluateIndicCategory: record.team || '',
        sourceHeaderId: record.sourceHeaderId,
      },
    });
  }

  /**
   * 评分要素-专家分配 关闭model
   *
   * @memberof Update
   */
  @Bind()
  cancelAssignExpert() {
    const { dispatch } = this.props;

    this.setState({
      evaluateAssignModalVisible: false,
    });

    dispatch({
      type: 'bidHall/updateState',
      payload: {
        currentScoringExperts: [],
      },
    });
  }

  /**
   * 评分要素-删除 筛选本地且不删除的数据
   *
   * @param {*} data
   * @returns 筛选后的数据
   * @memberof Update
   */
  filterScorinUnSelectedOldData(data) {
    const { scoringElementSelectedRows } = this.state;
    const sourceData = filter(data, (item) => {
      return (
        scoringElementSelectedRows &&
        scoringElementSelectedRows.map((id) => id.evaluateIndicId).indexOf(item.evaluateIndicId) < 0
      );
    });

    return sourceData;
  }

  /**
   * 删除评分要素
   *
   * @param {*} types
   * @returns
   * @memberof Update
   */
  @Bind()
  onDeleteScoringElements(types) {
    const { scoringElementSelectedRows } = this.state;
    if (isEmpty(scoringElementSelectedRows)) {
      return;
    }

    const {
      organizationId,
      dispatch,
      bidHall: { scoringNoneTempelate, scoringBusinessTempelate, scoringTechnologyTempelate },
    } = this.props;
    let sourceData = [];

    switch (types) {
      case 'BUSINESS':
        sourceData = this.filterScorinUnSelectedOldData(scoringBusinessTempelate);
        break;
      case 'TECHNOLOGY':
        sourceData = this.filterScorinUnSelectedOldData(scoringTechnologyTempelate);
        break;
      default:
        sourceData = this.filterScorinUnSelectedOldData(scoringNoneTempelate);
        break;
    }

    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.remove').d('确定删除选中数据？'),
      onOk: () => {
        const remoteDelete = [];
        scoringElementSelectedRows.forEach((item) => {
          if (item._status === 'update') {
            remoteDelete.push(item.evaluateIndicId);
          }
        });

        if (isEmpty(remoteDelete)) {
          switch (types) {
            case 'BUSINESS':
              dispatch({
                type: 'bidHall/updateState',
                payload: {
                  scoringBusinessTempelate: sourceData,
                },
              });
              break;
            case 'TECHNOLOGY':
              dispatch({
                type: 'bidHall/updateState',
                payload: {
                  scoringTechnologyTempelate: sourceData,
                },
              });
              break;
            default:
              dispatch({
                type: 'bidHall/updateState',
                payload: {
                  scoringNoneTempelate: sourceData,
                },
              });
              break;
          }
          this.setState({ tabScoringElementSelectedRows: [], scoringElementSelectedRowKeys: [] });
        } else {
          dispatch({
            type: 'bidHall/deleteScoringNoneTempelate',
            payload: { remoteDelete, organizationId },
          }).then((res) => {
            if (res) {
              notification.success();
              this.fetchScoring();
              this.setState({
                tabScoringElementSelectedRows: [],
                scoringElementSelectedRowKeys: [],
              });
            }
          });
        }
      },
      onCancel: () => {
        // this.setState({ tabScoringElementSelectedRows: [], scoringElementSelectedRowKeys: [] });
      },
    });
  }

  /**
   * 批量导入评分要素
   * @param {*} types
   * @returns
   * @memberof import
   */
  @Bind()
  onImportScoringElements(params) {
    const {
      inquiryHall: { header = {} },
    } = this.props;
    const { organizationId: tenantId = null } = this.props;
    const { rfxHeaderId, templateId } = header;
    openTab({
      key: '/ssrc/inquiry-hall/rfx-update/comment-import/SSRC.RFX_EVALUATE_INDIC',
      search: queryString.stringify({
        key: '/ssrc/inquiry-hall/rfx-update/comment-import/SSRC.RFX_EVALUATE_INDIC',
        title: 'hzero.common.title.batchImport',
        action: intl.get('hzero.common.title.batchImport').d('批量导入'),
        backPath: `/ssrc/inquiry-hall/rfx-update/${rfxHeaderId}`,
        args: JSON.stringify({
          sourceHeaderId: rfxHeaderId,
          tenantId,
          templateId,
          expertCategory: params,
          teamWeight: params === 'BUSINESS' || params === 'TECHNOLOGY' ? 50 : 100,
          sourceFrom: 'RFX',
        }),
      }),
    });
  }

  // 批量生成Collapse / Panel
  generateCollapsePanel(options = {}) {
    const {
      title = '',
      key,
      verticalCollapseKeys = [],
      renderComponent = null,
      isShow = true,
      ...others
    } = options;

    if (!isShow) {
      return;
    }

    return (
      <Panel
        showArrow={false}
        header={
          <React.Fragment>
            <h3>{title}</h3>
            <a>
              {verticalCollapseKeys.includes(key)
                ? intl.get(`hzero.common.button.up`).d('收起')
                : intl.get(`hzero.common.button.expand`).d('展开')}
            </a>
            <Icon type={verticalCollapseKeys.includes(key) ? 'up' : 'down'} />
          </React.Fragment>
        }
        key={key}
        {...others}
      >
        {renderComponent}
      </Panel>
    );
  }

  // 竖版折叠面板keys
  @Bind()
  changeVerticalCollapseKeys(keys = []) {
    this.setState({
      verticalCollapseKeys: keys,
    });
  }

  // 参考模板LOV BUTTON
  renderReferenceTemplateLov(header = {}, verticalReviewMessageTabsActiveKey = null) {
    if (verticalReviewMessageTabsActiveKey !== 'scoringElements') {
      return;
    }

    return (
      <Lov
        isButton
        type="default"
        onOk={this.saveAllScoringTemplate}
        queryParams={{
          enabledFlag: 1,
          // expertCategory: type,
          scoreMode: header.bidRuleType,
          templatePurpose: 'EXPERT_SCORE',
          scoreTemplateScoreType: header.templateScoreType,
          // scoreMode: type ? 'DIFF' : 'NONE',
        }}
        code="SSRC.SCORE_TEMPL"
      >
        {intl.get(`ssrc.inquiryHall.view.button.referTemplate`).d('参考模板')}
      </Lov>
    );
  }

  /**
   * 店家物品行报价明细
   *
   * @param {*} [record={}]
   * @memberof Update
   */
  @Bind()
  handleQuotationDetail(record = {}, isShowModal = true) {
    if (!record || !record.$form) {
      this.clearCurrentRowQuotationData();
      return;
    }

    const itemId = record.$form.getFieldValue('itemId') || undefined;
    const itemCategoryId = record.$form.getFieldValue('itemCategoryId') || undefined;
    const currentRfxLineItemId =
      record.rfxLineItemId || record.$form.getFieldValue('rfxLineItemId') || undefined;

    if (!itemId && !itemCategoryId) {
      this.settingQuotationDetailStore();
      this.updateItemLineQuotationData(currentRfxLineItemId, []);
      return;
    }

    this.setState({
      itemLineEditoringId: currentRfxLineItemId,
    });

    this.fetchItemLineQuotationDetail({
      rfxLineItemId: currentRfxLineItemId,
      itemId: itemId || null,
      itemCategoryId: itemCategoryId || null,
      isShowModal,
    });

    if (isShowModal) {
      this.setState({
        itemLineQuotationDetailModalVisible: true,
      });
    }
  }

  /**
   * 物品明细-改变分页
   */
  @Bind()
  changeItemLinePage(page = {}) {
    const {
      dispatch,
      inquiryHall: { itemLineChange = false },
    } = this.props;
    if (itemLineChange) {
      Modal.confirm({
        title: intl
          .get(`ssrc.inquiryHall.view.message.changeDataPageTip`)
          .d('切换分页前请先保存数据！'),
        onOk: () => {
          this.setState({});
        },
        onCancel: () => {
          this.fetchItemLine(page);
          dispatch({
            type: 'inquiryHall/updateState',
            payload: {
              itemLineChange: false,
            },
          });
        },
      });
    } else {
      this.fetchItemLine(page);
    }
  }

  /**
   * 物品行查询报价明细数据
   *
   * @param {*} [page={}]
   * @memberof Update
   */
  fetchItemLineQuotationDetail(record = {}) {
    const {
      match: { params },
      dispatch,
      organizationId,
      inquiryHall: { itemLine = [] },
    } = this.props;

    const curRfxLineItemId = record.rfxLineItemId;
    const CurrentItemLine = itemLine.filter((item) => item.rfxLineItemId === curRfxLineItemId);

    if (record.isShowModal && CurrentItemLine.length === 1 && CurrentItemLine[0].quotationDetails) {
      this.updateItemLineQuotationData(curRfxLineItemId, CurrentItemLine[0].quotationDetails);
      return;
    }

    const sourceFrom = params.rfxId ? 'RFX' : 'BID';
    dispatch({
      type: 'inquiryHall/fetchItemLineQuotationDetail',
      payload: {
        rfxLineItemId: typeof curRfxLineItemId === 'string' ? undefined : curRfxLineItemId,
        itemId: record.itemId || null,
        itemCategoryId: record.itemCategoryId || null,
        sourceFrom,
        organizationId,
        rfxHeaderId: params.rfxId,
      },
    }).then((res) => {
      let result = res;
      if (!res || !Array.isArray(res) || !res.length) {
        result = [];
      }

      this.updateItemLineQuotationData(curRfxLineItemId, result);
    });
  }

  /**
   * 改变行信息 - 报价明细数据变化
   *
   * @returns
   * @memberof Update
   */
  updateItemLineQuotationData(currentRfxLineItemId = '', res = []) {
    const {
      dispatch,
      inquiryHall: { itemLine = [] },
    } = this.props;

    const CurrentItemLineObj = itemLine.map((item) => {
      if (item.rfxLineItemId === currentRfxLineItemId) {
        return {
          ...item,
          quotationDetailFlag: res.length ? 1 : 0,
          quotationDetails: res,
          // rfxLineItemId: currentRfxLineItemId, // todo
        };
      }

      return item;
    });

    dispatch({
      type: 'inquiryHall/updateState',
      payload: {
        itemLine: CurrentItemLineObj,
      },
    });
  }

  // 批量维护
  @Bind()
  startBatchMaintainItemLine() {
    const { itemLineSelectedRows = [] } = this.state;

    const newItemLine = itemLineSelectedRows.some((item) => item._status === 'create');
    if (newItemLine) {
      notification.warning({
        message: intl
          .get('ssrc.inquiryHall.view.inquiryHall.selectedOldData')
          .d('请勾选已保存过的物料数据进行批量维护'),
      });
      return;
    }

    this.setState((preStatus) => {
      return {
        batchMaintainItemLineVisible: !preStatus.batchMaintainItemLineVisible,
      };
    });
  }

  // 批量维护保存
  @Bind()
  saveBatchMaintainItemLine() {
    const {
      match: { params = {} },
      organizationId,
      dispatch,
    } = this.props;
    const { itemLineSelectedRows = [], itemLineSelectedRowKeys = [] } = this.state;

    const itemLineForm = this.ItemLineTable.props.form;
    const data = filterNullValueObject(itemLineForm?.getFieldsValue?.() || {});
    const newItemLine = itemLineSelectedRows.some((item) => item._status === 'create');
    if (isEmpty(data) || newItemLine) {
      notification.warning({
        message: intl
          .get('ssrc.inquiryHall.view.inquiryHall.newItemNoBatchUpdate')
          .d(
            '批量编辑保存失败，是因为批量编辑的信息为空/无法对新建数据进行批量编辑，请先维护批量编辑的内容/保存新建的数据'
          ),
      });
      return;
    }

    dispatch({
      type: 'inquiryHall/batchMaintainItemLine',
      payload: {
        rfxHeaderId: params.rfxId,
        organizationId,
        rfxLineItem: {
          ...data,
          demandDate: dateFormate(data.demandDate, DATETIME_MIN),
          validExpiryDateFrom: dateFormate(data.validExpiryDateFrom, DATETIME_MIN),
          validExpiryDateTo: dateFormate(data.validExpiryDateTo, DATETIME_MAX),
        },
        rfxLineItemIds: itemLineSelectedRowKeys,
        customizeUnitCode: 'SSRC.INQUIRY_HALL_EDIT.LINE_BATCH_FORM',
      },
    }).then((res) => {
      if (res) {
        dispatch({
          type: 'inquiryHall/updateState',
          payload: {
            itemLine: [],
          },
        });

        this.handleItemLineRowSelectChange();
        this.cancelBatchMaintainItemLine();
        this.fetchItemLine();
      }
    });
  }

  // 批量维护取消
  @Bind()
  cancelBatchMaintainItemLine() {
    this.setState({
      batchMaintainItemLineVisible: false,
    });
    this.resetBatchMaintainItemLine();
  }

  // 批量维护重置
  @Bind()
  resetBatchMaintainItemLine() {
    const itemLineForm = this.ItemLineTable.props.form;
    itemLineForm.resetFields();
  }

  /**
   * 专家子账户弹窗-确定
   * @param {Array} selectRowKeys - 返回的勾选行keys
   * @param {Array} selectRows - 返回的勾选行
   */
  @Bind()
  handleOkSubAccountModal(_, selectRows = []) {
    const {
      organizationId,
      dispatch,
      bidHall: { evaluateExpertList = [] },
      inquiryHall: { header = {} },
    } = this.props;
    const { expertSource = '' } = this.state;
    const tempArr = []; // 新建行
    // 循环勾选的子账户列表
    selectRows.forEach((item) => {
      let newPayload = [];
      if (expertSource === 'EXPERT_LIBRARY') {
        const {
          // 专家库来源
          expertName,
          expertId,
          objectVersionNumber,
          loginName,
          expertCategory,
          expertTypeMeaning,
          mobilephone,
          telephone,
          email,
          userId,
        } = item;
        if (header.bidRuleType === 'NONE') {
          newPayload = {
            userName: undefined,
            expertName,
            expertId,
            objectVersionNumber,
            loginName,
            expertCategory,
            expertTypeMeaning,
            email,
            phone: mobilephone || telephone,
            expertUserId: userId,
            tenantId: header.tenantId,
            evaluateExpertId: uuidv4(),
            sourceFrom: 'RFX',
            leaderFlag: 0,
            evaluateLeaderFlag: '0', // 职责
            openBidOrder: header.openBidOrder,
            organizationId,
            sourceHeaderId: header.rfxHeaderId,
            expertStatus: 'SUBMITTED',
            team: '',
            _status: 'create',
          };
        } else {
          newPayload = {
            userName: undefined,
            expertName,
            expertId,
            objectVersionNumber,
            loginName,
            expertCategory,
            expertTypeMeaning,
            email,
            phone: mobilephone || telephone,
            expertUserId: userId,
            tenantId: header.tenantId,
            evaluateExpertId: uuidv4(),
            sourceFrom: 'RFX',
            evaluateLeaderFlag: '0', // 职责
            openBidOrder: header.openBidOrder,
            organizationId,
            sourceHeaderId: header.rfxHeaderId,
            expertStatus: 'SUBMITTED',
            team: expertCategory,
            _status: 'create',
          };
        }
      } else {
        const { objectVersionNumber, loginName, email, id, realName, phone } = item;
        newPayload = {
          userName: undefined,
          expertName: realName,
          objectVersionNumber,
          loginName,
          expertCategory: 'BUSINESS_TECHNOLOGY',
          expertTypeMeaning: intl
            .get(`ssrc.inquiryHall.model.inquiryHall.innerExpert`)
            .d('内部专家'),
          email,
          phone,
          expertUserId: id,
          tenantId: header.tenantId,
          evaluateExpertId: uuidv4(),
          sourceFrom: 'RFX',
          evaluateLeaderFlag: '0', // 职责
          openBidOrder: header.openBidOrder,
          organizationId,
          sourceHeaderId: header.rfxHeaderId,
          expertStatus: 'SUBMITTED',
          team: 'BUSINESS_TECHNOLOGY',
          _status: 'create',
        };
      }
      tempArr.push(newPayload);
    });
    dispatch({
      type: 'bidHall/updateState',
      payload: {
        evaluateExpertList: [...tempArr, ...evaluateExpertList],
      },
    });
    this.setState({
      expertModalVisible: false,
    });
  }

  /**
   * 专家子账户弹窗-取消
   */
  @Bind()
  handleCancelSubAccountModal() {
    this.setState({
      expertModalVisible: false,
    });
  }

  // 查询配置表
  fetchConfig = async () => {
    const {
      organizationId,
      match: {
        params: { rfxId = null },
      },
    } = this.props;
    const { configSheet = {} } = this.state;
    let data = null;
    // 判断单据是否是新建
    if (!rfxId || rfxId === 'null' || rfxId === 'NULL') return;

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

  // 采购申请跳转
  @Bind()
  linktoPrNumDetail(record = {}) {
    const { dispatch } = this.props;
    const { prSourcePlatform, prHeaderId } = record;
    const { configSheet } = this.state;
    const { sprmOldUiConfig = false } = configSheet;
    const isErp = prSourcePlatform && prSourcePlatform.toLowerCase() === 'erp';
    let pathUrl = null;
    if (!sprmOldUiConfig) {
      // 记录一个标识, 实现跳转的采购申请工作台明细后,点击返回按钮，返回采购申请工作台主页面的【整单-全部】页签
      // 需要去采购申请工作台去适配此方案
      // NOTE window.ssrc.directionToPurchasePlatform = 'inquiryHallNewUpdate,inquiryHallNewDetail';
      window.ssrcDirectionToPurchasePlatformSymbol = 'inquiryHallNewUpdate';

      // 采购申请工作台
      pathUrl = isErp
        ? `/sprm/purchase-platform/erp-detail/${prHeaderId}`
        : `/sprm/purchase-platform/noerp-detail/${prHeaderId}`;
    } else {
      pathUrl = isErp
        ? `/sprm/purchase-requisition-inquiry/erp-detail/${prHeaderId}`
        : `/sprm/purchase-requisition-inquiry/not-erp-detail/${prHeaderId}`;
    }

    dispatch(
      routerRedux.push({
        pathname: pathUrl,
      })
    );
  }

  /**
   * 修改报价方向
   */
  onChangeAD = (value) => {
    const { form = {} } = this.props;
    if (value === 'NONE') {
      form.setFieldsValue({
        auctionRule: 'NONE',
      });
    }
  };

  /**
   * 修改竞价规则
   */
  onChangeAR = (value) => {
    const { form = {} } = this.props;
    if (value === 'TOP_ALL') {
      form.setFieldsValue({
        openRule: 'HIDE_IDENTITY_OPEN_QUOTE',
      });
    }
  };

  // 锦江--二开
  renderBulkAddSupplierCompent = (bulkAddSupplierProps) => {
    return <BulkAddSupplier {...bulkAddSupplierProps} />;
  };

  /**
   * 改变寻源方式
   * @param val
   * @param record
   */
  @Bind()
  changeSourceMethod() {
    const { form } = this.props;
    // 清空【境内外关系】【行业类型】【主营类型】
    form.setFieldsValue({
      organizationType: null,
      industryData: null,
      industryCategoryData: null,
    });
  }

  // 判断是境内(1)/境外(0)标识
  @Bind()
  isDomesTic(organizationType = null) {
    return organizationType && organizationType === 'DOMESTIC' ? 1 : 0;
  }

  /**
   * 改变境内外关系
   * @param val
   * @param record
   */
  @Bind()
  changeOrganizationType(value) {
    const { form } = this.props;

    this.setState({
      industryCategory: [],
      industry: [],
    });

    // 清空【行业类型】【主营类型】
    form.setFieldsValue({
      industryData: null,
      industryCategoryData: null,
    });

    const domesticFlag = this.isDomesTic(value);
    this.fetchIndustyType({
      domesticFlag,
    });
  }

  // 改变行业类型-select-change
  @Bind()
  handleChangeIndustry = (data = []) => {
    const { form } = this.props;

    if (isEmpty(data)) {
      this.setState({ industryCategory: [] });
      // 清空【主营类型】
      form.setFieldsValue({
        industryCategoryData: null,
      });
      return;
    }

    const { industryCategory = [] } = this.state;
    const industryCategoryData = form.getFieldValue('industryCategoryData');
    // 所有的industryCategory选项
    let industryCategoryList = [];
    industryCategory.forEach((item) => {
      industryCategoryList = [...industryCategoryList, ...(item.children || [])];
    });
    // 获取industryCategoryData的每一项对象[{}]
    industryCategoryList = industryCategoryList.filter((i) =>
      industryCategoryData?.includes(i?.categoryId)
    );
    const newIndustryCategoryData = industryCategoryList.reduce((groups, item) => {
      if (data.includes(item?.industryId)) {
        groups.push(item?.categoryId);
      }
      return groups;
    }, []);
    // 设置最新的industryCategoryData
    form.setFieldsValue({ industryCategoryData: newIndustryCategoryData });

    this.initAndFetchInductryCategory(data);
  };

  // 查询主营品类
  @Bind()
  initAndFetchInductryCategory(industryData = []) {
    if (isEmpty(industryData)) {
      return;
    }

    const ids = [];
    industryData.forEach((item = {}) => {
      let currentId = item;
      if (isObject(item)) {
        currentId = item?.industryId;
      }
      ids.push(currentId);
    });

    const stringIds = ids.join(',');
    this.fetchIndustyCategory({
      industryIdList: stringIds,
    });
  }

  render() {
    const {
      form,
      inquiryHall: {
        settings = [],
        header = {},
        supplierLine = [],
        itemLine = [],
        itemLinePagination = {},
        supplierLinePagination = {},
        bidHolderList = [],
        bidHolderPagination = {},
        supplierData = [],
        bulkSupplierList = [],
        ladderLevelData = [],
        bulkSupplierListPagination = {},
        scoringElement = [],
        itemLineQuotationDetail = [],
        itemQuotationDetail = [],
        QuotationDetailDataSource = {},
        itemQuotationPagination = {},
        code = {},
        code: {
          indicateType = [],
          reviewMethod = [],
          expertDuty = [],
          expertTeam = [],
          calculateType = [],
          scoreType = [],
          benchmarkPriceMethod = [],
          formula = [],
          idd = [],
        },
        tenderNoticeInfo = {},
      },
      bidHall: {
        scoringNoneTempelate = [],
        scoringBusinessTempelate = [],
        scoringTechnologyTempelate = [],
        currentScoringExperts = [],
        evaluateExpertList = [],
      },
      form: { getFieldValue, getFieldDecorator },
      organizationId,
      userId,
      match,
      dispatch,
      // excel导入所需参数-起始
      match: {
        params: { rfxId },
      },
      allLoading,
      cancelInquiryHallUpdateLoading,
      fetchSupplierLineLoading,
      saveSupplierRecordLineLoading,
      saveItemLineLoading,
      saveLadderLevelLoading,
      saveSupplierLineLoading,
      fetchLadderLevelLoading,
      fetchBulkSupplierDataLoading,
      supplierAttachmentLoading,
      fetchScoringElementLoading,
      saveScoringElementLoading,
      saveBidHolderLoading,
      saveScoringNoneExpertLoading,
      fetchTempelateDetailDataLoading,
      saveScoringNoneTempelateLoading,
      fetchEvaluateIndicAssignLoading,
      deleteScoringNoneTempelateLoading,
      changeRfxDetailLayoutLoading,
      fetchBidholderListLoading,
      batchMaintainItemLineLoading,
      customizeTable,
      customizeForm,
      custLoading,
    } = this.props;
    const {
      itemLineSelectedRows = [],
      itemLineSelectedRowKeys = [],
      ladderLevelSelectedRows = [],
      ladderLevelSelectedRowKeys = [],
      supplierLineSelectedRowKeys = [],
      selectedRowKeys = [],
      viewLadderLevelVisible,
      LadderLevelHeaderData,
      bidholderVisible,
      viewOnly,
      bucketDirectory,
      bulkAddSupplierVisible = false,
      bulkAddSupplierSelectedRows = [],
      bulkAddSupplierSelectedRowKeys = [],
      supplierQualificationVisible = false,
      supplierQualificationSelectedRows = [],
      supplierQualificationDataSource = [],
      scoringElementVisible = false,
      scoringElementSelectedRows = [],
      subjectMatterRule,
      expertLineSelectedRows,
      expertLineSelectedRowKeys,
      tabScoringElementSelectedRows,
      scoringElementSelectedRowKeys,
      evaluateAssignModalVisible,
      scoringSaveType,
      expertSaveType,
      tabsActiveKey,
      itemRecord = {},
      itemQuotationDetailModalVisible,
      isHorizontal = true,
      isStartQuotationRunningDurationError = false,
      isQuotationRunningDurationError = false,
      endOpen = false,
      verticalCollapseKeys = [],
      verticalReviewMessageTabsActiveKey,
      matterDetail = '',
      matterRequireFlag = 0,
      expertModalVisible = false,
      expertSource = '',
      allowAddItems,
      doubleUnitFlag,
      batchMaintainItemLineVisible = false,
      industry = [],
      industryCategory = [],
      releaseConfirmLoading = false,
    } = this.state;
    const currentHeader = form.getFieldsValue() || {};

    const CommonFormProps = {
      organizationId,
      form,
      header,
      code,
      customizeForm,
      FormItem,
      LONG_LABEL_FORM_ITEM_LAYOUT,
      UEDDisplayFormItem,
    };

    // 基本信息头
    const BasicHeaderFormProps = {
      ...CommonFormProps,
      endOpen,
      isStartQuotationRunningDurationError,
      changeCompany: this.changeCompany,
      bidBoundFormatter: this.bidBoundFormatter,
      changeStartFlag: this.changeStartFlag,
      handleEndOpenChange: this.handleEndOpenChange,
      validateTime: this.validateTime,
      changeQuoteDay: this.changeQuoteDay,
      changeQuoteHour: this.changeQuoteHour,
      changeQuoteMinute: this.changeQuoteMinute,
    };

    // 寻源规则
    const RfxRuleFormProps = {
      ...CommonFormProps,
      industry,
      industryCategory,
      biddingRuleForm: this.biddingRuleForm,
      openBidholder: this.openBidholder,
      changeTemplateId: this.changeTemplateId,
      onChangeAD: this.onChangeAD,
      changeSourceMethod: this.changeSourceMethod,
      changeOrganizationType: this.changeOrganizationType,
      handleChangeIndustry: this.handleChangeIndustry,
    };

    // 寻源公告
    const RfxNoticeFormProps = {
      ...CommonFormProps,
      tenderNoticeInfo,
      idd,
      previewNotice: this.previewNotice,
    };

    // 竞价规则props
    const BiddingRuleFormProps = {
      ...CommonFormProps,
      isQuotationRunningDurationError,
      biddingRuleForm: this.biddingRuleForm,
      changeQuotationOrderType: this.changeQuotationOrderType,
      changeDay: this.changeDay,
      changeHour: this.changeHour,
      changeMinute: this.changeMinute,
      onChangeAR: this.onChangeAR,
    };

    const itemLineRowSelection = {
      selectedRows: itemLineSelectedRows,
      selectedRowKeys: itemLineSelectedRowKeys,
      onChange: this.handleItemLineRowSelectChange,
      getCheckboxProps: () => ({
        disabled: header.allowChangeItemsFlag === 0 && header.sourceFrom === 'PROJECT',
      }),
    };
    const ladderLevelRowSelection = {
      selectedRowKeys: ladderLevelSelectedRowKeys,
      onChange: this.handleLadderLevelRowSelectChange,
    };
    const supplierRowSelection = {
      selectedRowKeys: supplierLineSelectedRowKeys,
      onChange: this.handleSupplierLineRowSelectChange,
      getCheckboxProps: () => ({
        disabled: header.allowChangeSupplyFlag === 0 && header.sourceFrom === 'PROJECT',
      }),
    };
    const bidRowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
    };
    const bulkAddSupplierRowSelection = {
      selectedRowKeys: bulkAddSupplierSelectedRowKeys,
      selectedRows: bulkAddSupplierSelectedRows,
      onChange: this.handleBulkAddSupplierRowSelectChange,
    };
    const scoringElementRowSelection = {
      selectedRowKeys:
        scoringElementSelectedRows &&
        scoringElementSelectedRows.map((item) => item.prequalScoreAssignId),
      onChange: this.handleScoringElementRowSelectChange,
    };
    const sourceMethodValue = getFieldValue('sourceMethod');

    // itemLine
    const companyId = getFieldValue('companyId') || header.companyId || null;
    const itemLineTableProps = {
      header,
      // form,
      doubleUnitFlag,
      dataSource: itemLine,
      settings,
      allowAddItems,
      customizeTable,
      custLoading,
      saveSupplierLoading: saveSupplierRecordLineLoading,
      match,
      dispatch,
      organizationId,
      customizeForm,
      ladderLevelData,
      visible: viewLadderLevelVisible,
      LadderLevelHeaderData,
      itemLineRowSelection,
      itemLineSelectedRows,
      itemLineSelectedRowKeys,
      ladderLevelRowSelection,
      ladderLevelSelectedRows,
      ladderLevelSelectedRowKeys,
      saveLadderLevelLoading,
      fetchLadderLevelLoading,
      itemQuotationDetail,
      itemQuotationPagination,
      matchRestrictFlag: getFieldValue('matchRestrictFlag'),
      companyId,
      saveLoading: saveItemLineLoading,
      supplierDataSource: supplierData,
      pagination: itemLinePagination,
      onCreateLine: this.createItemLine,
      onCreateLadderLine: this.createLadderLine,
      searchSupplier: this.handleSearchSupplier,
      viewLadderLevel: this.viewLadderLevelModal,
      hideModal: this.hideLadderLevelModal,
      onSaveLine: this.saveItemLine,
      onSaveLadderLine: this.saveLadderLevel,
      onDeleteLines: this.deleteItemLines,
      onDeleteLadderLines: this.deleteLadderLevel,
      onSaveSupplierRecordLine: this.saveSupplierRecordLine,
      onRef: this.onRef,
      onChangeTableData: this.changeItemLineTableData,
      onChangeLadderTableData: this.changeLadderLevelTableData,
      itemLineQuotationDetail,
      QuotationDetailDataSource,
      itemRecord,
      itemQuotationDetailModalVisible,
      copyItemLine: this.copyItemLine,
      showQuotationDetail: this.showQuotationDetail,
      itemLineTableDS: this.itemLineTableDS,
      linktoPrNumDetail: this.linktoPrNumDetail,
      batchMaintainItemLineLoading,
      batchMaintainItemLineVisible,
      startBatchMaintainItemLine: this.startBatchMaintainItemLine,
      cancelBatchMaintainItemLine: this.cancelBatchMaintainItemLine,
      saveBatchMaintainItemLine: this.saveBatchMaintainItemLine,
      resetBatchMaintainItemLine: this.resetBatchMaintainItemLine,
      fetchItemLine: this.fetchItemLine,
      handleQuotationDetail: this.handleQuotationDetail,
      onSearch: this.changeItemLinePage,
    };

    const supplierLineTableProps = {
      form,
      match,
      userId,
      header,
      companyId,
      customizeTable,
      organizationId,
      supplierRowSelection,
      supplierLineSelectedRowKeys,
      sourceMethodValue,
      loading: fetchSupplierLineLoading,
      saveLoading: saveSupplierLineLoading || fetchSupplierLineLoading,
      dataSource: supplierLine,
      pagination: supplierLinePagination,
      onSearch: this.changeSupplierLinePage,
      onCreateLine: this.createSupplierLine,
      onSaveLine: this.saveSupplierLine,
      onLinkRiskScan: this.linkRiskScan,
      onDeleteLines: this.deleteSupplierLines,
      onBulkAddSupplier: this.bulkAddSupplier,
      onChangeTableData: this.changeSupplierLineTableData,
      supplierRelationMap: this.supplierRelationMap,
      rankRule: getFieldValue('rankRule') || null,
      fetchSupplierLine: this.fetchSupplierLine,
    };
    const BidOpenerCartridgeProps = {
      fetchBidholderListLoading,
      saveBidHolderLoading,
      organizationId,
      dataSource: bidHolderList,
      pagination: bidHolderPagination,
      handleAddBidHolder: this.fetchBidholderAdd,
      fetchBidholderUpdate: this.fetchBidholderUpdate,
      fetchBidholderDelete: this.fetchBidholderDelete,
      handleAddCurrentUser: this.handleAddCurrentUser,
      handleSearch: this.handleSearch,
      getFieldDecorator,
      bidRowSelection,
      passwordFlag: header.passwordFlag,
    };
    const bulkAddSupplierProps = {
      rowSelection: bulkAddSupplierRowSelection,
      loading: fetchBulkSupplierDataLoading || supplierAttachmentLoading,
      pagination: bulkSupplierListPagination,
      dataSource: bulkSupplierList,
      visible: bulkAddSupplierVisible,
      onRef: this.handleBindRef,
      onSearch: this.fetchBulkSupplierData,
      onCancel: this.cancelBulkAddSupplier,
      onChange: this.fetchBulkSupplierData,
      onOk: this.handleBulkAddSupplier,
    };
    const supplierQualificationRowSelection = {
      selectedRowKeys:
        supplierQualificationSelectedRows &&
        supplierQualificationSelectedRows.map((item) => item.companyId),
      onChange: this.handleQualificationRowSelectChange,
    };
    const supplierQualificationProps = {
      organizationId,
      loading: saveSupplierLineLoading,
      rowSelection: supplierQualificationRowSelection,
      dataSource: supplierQualificationDataSource,
      visible: supplierQualificationVisible,
      onCancel: this.cancelSupplierQualification,
      onOk: this.handleSupplierQualification,
    };
    const scoringElementProps = {
      indicateType,
      scoringElementSelectedRows,
      rowSelection: scoringElementRowSelection,
      loading: fetchScoringElementLoading,
      visible: scoringElementVisible,
      dataSource: scoringElement,
      saveScoringElementLoading,
      onCreateLine: this.handleCreateScoringElement,
      onDeleteLine: this.handleDeleteScoringElement,
      onSaveLine: this.handleSaveScoringElement,
      onCancel: this.handleCancelScoringElement,
      onSelectTemplateOk: this.handleSelectTemplateOk,
    };
    const AttachmentsProps = {
      bucketName: PRIVATE_BUCKET,
      bucketDirectory,
      viewOnly,
      businessUuid: header.businessAttachmentUuid,
      techUuid: header.techAttachmentUuid,
      onRef: this.handleBindOnRef,
    };

    // 资格预审props
    const qualificationProps = {
      rfxId,
      header,
      organizationId,
      form,
      reviewMethods: reviewMethod,
      changeReviewMethod: this.changeReviewMethod,
      changeScoreFlag: this.changeReviewMethod,
      showScoringElement: this.showScoringElement,
      customizeForm,
    };

    const expertLineRowSelection = {
      expertLineSelectedRows,
      selectedRowKeys: expertLineSelectedRowKeys,
      onChange: this.onExpertRowChange,
    };

    // 专家
    const ProfessionalTableProps = {
      header,
      customizeTable,
      expertDuty,
      expertTeam,
      expertSaveType,
      evaluateExpertList,
      dispatch,
      organizationId,
      match,
      subjectMatterRule,
      expertLineSelectedRows,
      expertLineSelectedRowKeys,
      expertSource, // 控制专家子账户来源
      saveLoading: saveScoringNoneExpertLoading,
      expertLineRowSelection,
      onSaveExpert: this.onSaveExpert,
      onCreateLine: this.onCreateLine,
      onDeleteExpert: this.onDeleteExpert,
    };

    // 评分要素select
    const scoringLineRowSelection = {
      scoringElementSelectedRows,
      selectedRowKeys: scoringElementSelectedRowKeys,
      onChange: this.onScoringLineChange,
    };
    // 评分要素
    const ScoringElementsTableProps = {
      customizeTable,
      loading: fetchTempelateDetailDataLoading,
      header,
      scoringSaveType,
      scoringNoneTempelate,
      scoringBusinessTempelate,
      scoringTechnologyTempelate,
      dispatch,
      evaluateAssignModalVisible,
      organizationId,
      indicateType,
      calculateType,
      scoreType,
      benchmarkPriceMethod,
      formula,
      match,
      currentScoringExperts,
      scoringLineRowSelection,
      onRef: this.onScoringElementRef,
      saveLoading: saveScoringNoneTempelateLoading,
      tabScoringElementSelectedRows,
      scoringElementSelectedRowKeys,
      scoringElementSelectedRows,
      onSaveScoringElements: this.onSaveScoringElements,
      onCreateScoringElements: this.onCreateScoringElements,
      onDeleteScoringElements: this.onDeleteScoringElements,
      onImportScoringElements: this.onImportScoringElements,
      onSelectTemplateOk: this.onSelectTemplateOk,
      saveAllScoringTemplate: this.saveAllScoringTemplate,
      saveScoringAssignExpert: this.saveScoringAssignExpert,
      openAssignExpertModal: this.openAssignExpertModal,
      cancelAssignExpert: this.cancelAssignExpert,
      fetchEvaluateIndicAssignLoading,
      deleteLoading: deleteScoringNoneTempelateLoading,
    };

    const MatterDetailProps = {
      matterDetail,
      onRef: (ref = {}) => {
        this.MatterDetail = ref;
      },
    };

    // 专家子账户弹窗props
    const expertModalProps = {
      visible: expertModalVisible,
      onOk: this.handleOkSubAccountModal,
      onCancel: this.handleCancelSubAccountModal,
    };

    // 评审信息
    const ReviewMessage = (
      <Tabs
        defaultActiveKey={header.preQualificationFlag ? 'preQualification' : 'professional'}
        animated={false}
        tabBarExtraContent={this.renderReferenceTemplateLov(
          header,
          verticalReviewMessageTabsActiveKey
        )}
        onChange={this.changeVerticalReviewMessageTabsActiveKey}
      >
        {header.preQualificationFlag ? (
          <Tabs.TabPane
            tab={intl.get(`ssrc.inquiryHall.view.message.tab.preQualification`).d('资格预审')}
            key="preQualification"
            forceRender
          >
            <QualificationForm {...qualificationProps} />
          </Tabs.TabPane>
        ) : (
          ''
        )}
        {header.expertScoreType && header.expertScoreType === 'ONLINE' ? (
          <Tabs.TabPane
            tab={intl.get(`ssrc.inquiryHall.view.message.tab.professional`).d('专家')}
            key="professional"
            forceRender
          >
            <ProfessionalTable {...ProfessionalTableProps} />
          </Tabs.TabPane>
        ) : (
          ''
        )}
        {header.expertScoreType && header.expertScoreType === 'ONLINE' ? (
          <Tabs.TabPane
            tab={intl.get(`ssrc.inquiryHall.view.message.tab.scoringElements`).d('评分要素')}
            key="scoringElements"
            forceRender
          >
            <ScoringElementsTable {...ScoringElementsTableProps} />
          </Tabs.TabPane>
        ) : (
          ''
        )}
      </Tabs>
    );

    // 寻源明细
    const RfxDetails = (
      <Tabs defaultActiveKey="itemLine" animated={false} style={{ marginTop: '18px' }}>
        <Tabs.TabPane
          tab={intl.get(`ssrc.inquiryHall.view.message.tab.itemDetails`).d('物品明细')}
          key="itemLine"
        >
          <ItemLineTable {...itemLineTableProps} />
        </Tabs.TabPane>
        <Tabs.TabPane
          tab={intl.get(`ssrc.inquiryHall.view.message.tab.vendorList`).d('供应商列表')}
          key="supplierLine"
          forceRender
        >
          <SupplierLineTable {...supplierLineTableProps} />
        </Tabs.TabPane>
        {matterRequireFlag === 1 && (
          <Tabs.TabPane
            tab={intl.get(`ssrc.inquiryHall.view.message.tab.matterDetail`).d('寻源事项说明')}
            key="matterDetail"
            forceRender
          >
            <MatterDetail {...MatterDetailProps} />
          </Tabs.TabPane>
        )}
        <Tabs.TabPane
          tab={intl.get(`ssrc.inquiryHall.view.message.tab.attachmentList`).d('附件列表')}
          key="attachmentList"
          forceRender
        >
          <Attachment {...AttachmentsProps} />
        </Tabs.TabPane>
      </Tabs>
    );

    return (
      <React.Fragment>
        <Header
          backPath="/ssrc/inquiry-hall/list"
          title={intl.get(`ssrc.inquiryHall.view.message.title.RFXMaintenance`).d('RFX维护')}
        >
          {!isEmpty(header) && (
            <React.Fragment>
              <Button
                icon="rocket"
                type="primary"
                onClick={this.releaseInquiryHall}
                loading={allLoading || releaseConfirmLoading}
              >
                {intl.get('hzero.common.button.release').d('发布')}
              </Button>
              <Button icon="save" onClick={this.saveInquiryHallUpdate} loading={allLoading}>
                {intl.get('hzero.common.button.save').d('保存')}
              </Button>
              <Button
                icon="rollback"
                onClick={this.cancelInquiryHallUpdate}
                loading={cancelInquiryHallUpdateLoading}
              >
                {intl.get('hzero.common.button.cancel').d('取消')}
              </Button>
            </React.Fragment>
          )}
        </Header>
        <Content
          className={classnames(
            common['page-content-custom'],
            common['hzero-ui-override'],
            common['zero-margin-bottom'],
            'ued-detail-wrapper',
            styles['ssrc-rfx-update-page']
          )}
        >
          <Spin spinning={allLoading}>
            <div className="rfx-update-layout-button-group">
              <Button.Group onClick={(e) => this.changeLayout(e)}>
                <Button
                  type={isHorizontal ? 'primary' : ''}
                  layout="HORIZONTAL"
                  loading={changeRfxDetailLayoutLoading}
                >
                  {intl.get('ssrc.inquiryHall.view.button.horizontal').d('横版')}
                </Button>
                <Button
                  type={!isHorizontal ? 'primary' : ''}
                  layout="VERTICAL"
                  loading={changeRfxDetailLayoutLoading}
                >
                  {intl.get('ssrc.inquiryHall.view.button.vertical').d('竖版')}
                </Button>
              </Button.Group>
            </div>

            {isHorizontal ? (
              <div className="form-collapse">
                <Tabs
                  defaultActiveKey={tabsActiveKey}
                  animated={false}
                  activeKey={tabsActiveKey}
                  tabBarExtraContent={this.renderReferenceTemplateLov(header, tabsActiveKey)}
                  onChange={this.changeTabsKey}
                >
                  <Tabs.TabPane
                    tab={intl.get(`ssrc.inquiryHall.view.message.panel.baseInfos`).d('基本信息')}
                    key="baseInfos"
                    forceRender
                  >
                    <BasicHeaderForm {...BasicHeaderFormProps} />
                  </Tabs.TabPane>
                  <Tabs.TabPane
                    tab={intl.get(`ssrc.inquiryHall.view.message.panel.rfxRules`).d('寻源规则')}
                    key="otherInfos"
                    forceRender
                  >
                    <RfxRuleForm {...RfxRuleFormProps} />
                  </Tabs.TabPane>
                  {currentHeader.sourceMethod !== 'INVITE' ? (
                    <Tabs.TabPane
                      tab={intl.get('ssrc.inquiryHall.view.message.panel.rfxNotice').d('寻源公告')}
                      key="rfxNotice"
                      forceRender
                    >
                      <RfxNoticeForm {...RfxNoticeFormProps} />
                    </Tabs.TabPane>
                  ) : null}
                  {header.sourceCategory && header.sourceCategory === 'RFA' ? (
                    <Tabs.TabPane
                      tab={intl
                        .get(`ssrc.inquiryHall.view.message.panel.biddingRules`)
                        .d('竞价规则')}
                      key="biddingRules"
                      forceRender
                    >
                      <BiddingRuleForm {...BiddingRuleFormProps} />
                    </Tabs.TabPane>
                  ) : (
                    ''
                  )}
                  {header.preQualificationFlag ? (
                    <Tabs.TabPane
                      tab={intl
                        .get(`ssrc.inquiryHall.view.message.tab.preQualification`)
                        .d('资格预审')}
                      key="preQualification"
                      forceRender
                    >
                      <QualificationForm {...qualificationProps} />
                    </Tabs.TabPane>
                  ) : (
                    ''
                  )}
                  {header.expertScoreType && header.expertScoreType === 'ONLINE' ? (
                    <Tabs.TabPane
                      tab={intl.get(`ssrc.inquiryHall.view.message.tab.professional`).d('专家')}
                      key="professional"
                      forceRender
                    >
                      <ProfessionalTable {...ProfessionalTableProps} />
                    </Tabs.TabPane>
                  ) : (
                    ''
                  )}
                  {header.expertScoreType && header.expertScoreType === 'ONLINE' ? (
                    <Tabs.TabPane
                      tab={intl
                        .get(`ssrc.inquiryHall.view.message.tab.scoringElements`)
                        .d('评分要素')}
                      key="scoringElements"
                      forceRender
                    >
                      <ScoringElementsTable {...ScoringElementsTableProps} />
                    </Tabs.TabPane>
                  ) : (
                    ''
                  )}
                </Tabs>
                {RfxDetails}
              </div>
            ) : (
              <React.Fragment>
                <Collapse
                  onChange={this.changeVerticalCollapseKeys}
                  className="form-collapse"
                  defaultActiveKey={verticalCollapseKeys}
                >
                  {this.generateCollapsePanel({
                    title: intl.get(`ssrc.inquiryHall.view.message.panel.baseInfos`).d('基本信息'),
                    key: 'baseInfos',
                    verticalCollapseKeys,
                    renderComponent: <BasicHeaderForm {...BasicHeaderFormProps} />,
                  })}
                  {this.generateCollapsePanel({
                    title: intl.get(`ssrc.inquiryHall.view.message.panel.rfxRules`).d('寻源规则'),
                    key: 'otherInfos',
                    verticalCollapseKeys,
                    renderComponent: <RfxRuleForm {...RfxRuleFormProps} />,
                  })}
                  {this.generateCollapsePanel({
                    title: intl.get('ssrc.inquiryHall.view.message.panel.rfxNotice').d('寻源公告'),
                    key: 'rfxNotice',
                    isShow: currentHeader.sourceMethod !== 'INVITE',
                    verticalCollapseKeys,
                    renderComponent: <RfxNoticeForm {...RfxNoticeFormProps} />,
                  })}
                  {this.generateCollapsePanel({
                    title: intl
                      .get(`ssrc.inquiryHall.view.message.panel.biddingRules`)
                      .d('竞价规则'),
                    key: 'biddingRules',
                    isShow: header.sourceCategory && header.sourceCategory === 'RFA',
                    verticalCollapseKeys,
                    renderComponent: <BiddingRuleForm {...BiddingRuleFormProps} />,
                  })}
                  {this.generateCollapsePanel({
                    title: intl
                      .get(`ssrc.inquiryHall.view.message.panel.reviewMessage`)
                      .d('评审信息'),
                    key: 'reviewMessage',
                    verticalCollapseKeys,
                    isShow:
                      header.preQualificationFlag ||
                      (header.expertScoreType && header.expertScoreType === 'ONLINE'),
                    renderComponent: ReviewMessage,
                  })}
                  {this.generateCollapsePanel({
                    title: intl.get(`ssrc.inquiryHall.view.message.panel.rfxDetals`).d('寻源明细'),
                    key: 'rfxDetals',
                    verticalCollapseKeys,
                    renderComponent: RfxDetails,
                  })}
                </Collapse>
              </React.Fragment>
            )}
          </Spin>
        </Content>

        <Modal
          width={800}
          title={intl.get(`ssrc.inquiryHall.view.message.title.defineOpener`).d('定义开标人')}
          visible={bidholderVisible}
          footer={null}
          onCancel={() => this.onCancel()}
        >
          <BidOpenerCartridge {...BidOpenerCartridgeProps} />
        </Modal>
        {this.renderBulkAddSupplierCompent(bulkAddSupplierProps)}
        <ScoringElementModal {...scoringElementProps} />
        <SupplierQualificationModal {...supplierQualificationProps} />
        {/* 专家子账户弹窗 */}
        {expertModalVisible &&
          (expertSource === 'EXPERT_LIBRARY' ? (
            <ExpertLibraryModal {...expertModalProps} />
          ) : (
            <ExpertSubAccountModal {...expertModalProps} />
          ))}
      </React.Fragment>
    );
  }
}

const hocUpdate = (Comp) => {
  return withCustomize({
    unitCode: [
      'SSRC.INQUIRY_HALL.EDIT_HEADER',
      'SSRC.INQUIRY_HALL.EDIT_LINE',
      'SSRC.INQUIRY_HALL_EDIT.LINE_BATCH_FORM',
      'SSRC.INQUIRY_HALL.EDIT_LINE_SUPPLIER',
      'SSRC.INQUIRY_HALL_EDIT.PREQUAL',
      'SSRC.INQUIRY_HALL_EDIT.RFX.RULE', // 寻源规则
      'SSRC.INQUIRY_HALL.EDIT_HEADER_EXPERT', // 专家评分
      'SSRC.INQUIRY_HALL.EDIT_HEADER_INDICS', // 评分要素细项
      'SSRC.INQUIRY_HALL_EDIT.HEADER.SCORE_INDICS_TECHNOLOGY', // 技术评分要素
    ],
    // manualQuery: true,
  })(
    Form.create({ fieldNameProp: null })(
      formatterCollections({
        code: [
          'ssrc.inquiryHall',
          'ssrc.common',
          'ssrc.sourceTemplate',
          'ssrc.bidHall',
          'ssrc.supplierQuotation',
          'ssrc.score',
        ],
      })(
        connect(({ inquiryHall, bidHall, loading, user }) => ({
          user,
          inquiryHall,
          bidHall,
          allLoading: loading.global,
          supplierAttachmentLoading: loading.effects['inquiryHall/supplierAttachment'],
          saveScoringElementLoading: loading.effects['inquiryHall/saveScoringElement'],
          // fetchInquiryHallUpdateLoading: loading.effects['inquiryHall/fetchInquiryHeaderDetail'],
          fetchChangetemplateHeaderDataLoading:
            loading.effects['inquiryHall/fetchChangetemplateHeaderData'],
          fetchSupplierLineLoading: loading.effects['inquiryHall/fetchSupplierLine'],
          saveInquiryHallUpdateLoading: loading.effects['inquiryHall/saveInquiryHallUpdate'],
          releaseInquiryHallLoading: loading.effects['inquiryHall/releaseInquiryHall'],
          saveSupplierRecordLineLoading: loading.effects['inquiryHall/saveSupplierRecordLine'],
          saveItemLineLoading: loading.effects['inquiryHall/saveItemLine'],
          fetchLadderLevelLoading: loading.effects['inquiryHall/fetchLadderLevelyTable'],
          saveLadderLevelLoading: loading.effects['inquiryHall/saveLadderLevel'],
          cancelInquiryHallUpdateLoading: loading.effects['inquiryHall/cancelInquiryHallUpdate'],
          saveSupplierLineLoading: loading.effects['inquiryHall/saveSupplierLine'],
          fetchBulkSupplierDataLoading: loading.effects['inquiryHall/fetchBulkSupplierData'],
          fetchScoringElementLoading: loading.effects['inquiryHall/fetchScoringElementData'],
          saveBidHolderLoading: loading.effects['inquiryHall/fetchBidholderUpdate'],
          saveScoringNoneExpertLoading: loading.effects['bidHall/saveScoringNoneExpert'],
          saveAllScoringTemplateLoading: loading.effects['bidHall/saveAllScoringTemplate'],
          deleteScoringNoneExpertLoading: loading.effects['bidHall/deleteScoringNoneExpert'],
          fetchTempelateDetailDataLoading: loading.effects['bidHall/fetchTempelateDetailData'],
          saveScoringNoneTempelateLoading: loading.effects['bidHall/saveScoringNoneTempelate'],
          deleteScoringNoneTempelateLoading: loading.effects['bidHall/deleteScoringNoneTempelate'],
          fetchEvaluateIndicAssignLoading: loading.effects['bidHall/fetchEvaluateIndicAssign'],
          saveEvaluateIndicAssignLoading: loading.effects['bidHall/saveEvaluateIndicAssign'],
          changeRfxDetailLayoutLoading: loading.effects['inquiryHall/changeRfxDetailLayout'],
          fetchBidholderListLoading: loading.effects['inquiryHall/fetchBidholderList'],
          fetchTenderNoticeLoading: loading.effects['inquiryHall/fetchTenderNotice'],
          batchMaintainItemLineLoading: loading.effects['inquiryHall/batchMaintainItemLine'],
          organizationId: getCurrentOrganizationId(),
          userId: getCurrentUserId(),
        }))(Comp)
      )
    )
  );
};

export default hocUpdate(Update);
export { hocUpdate, Update };
