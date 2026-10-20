/**
 * 寻源模板 创建-明细
 * @date: 2018-12-23
 * @author: LC <chao.li03@hand-china>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component, Fragment } from 'react';
import * as routerRedux from 'react-router-redux';
import { Button, Collapse, Form, Icon, Spin } from 'hzero-ui';
import { Bind, Throttle } from 'lodash-decorators';
import { isUndefined, isNil, isEmpty, isArray } from 'lodash';
import { connect } from 'dva';
import classnames from 'classnames';

import remoteHoc from 'hzero-front/lib/utils/remote';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import {
  getCurrentOrganizationId,
  getEditTableData,
  getCurrentTenant,
  getResponse,
} from 'utils/utils';
import notification from 'utils/notification';
import queryString from 'query-string';
import {
  fetchBidConfig,
  fetchSourceMethodConfig,
  fetchConfigSheet,
} from '@/services/inquiryHallService';

import { queryCheckPriceUiDisplayConfig, queryLovInfo } from '@/services/commonService';
// import { fetchNewQuotationConfigSheet } from '@/services/supplierQutationService';
import BasicInfoForm from './BasicInfoForm'; // 基本信息
import QuestionForm from './QuestionForm'; // 流程配置
import RuleForm from './RuleForm'; // 规则配置
import DefaultForm from './DefaultForm'; // 缺省值配置
import KeyFieldModal from './keyFiledModal'; // 关键字段是否显示的弹框
import KeyRFModal from './keyFiledRFModal'; // 询价或竞价时显示Modal弹框
import MatterDetailModal from './MatterDetailModal';
import style from './index.less';

const promptCode = 'ssrc.sourceTemplate';
const { Panel } = Collapse;

@remoteHoc({
  code: 'SSRC_SOURCE_TEMPLATE',
  name: 'remote',
})
@withCustomize({
  unitCode: [
    'SOURCE.TEMPLATE.WORKFLOW_CONFIGURATION',
    'SOURCE.TEMPLATE.DEFINE', // 缺省值配置
    'SOURCE.TEMPLATE.RULE', // 寻源规则配置
    'SOURCE.TEMPLATE.BASIC', // 基础信息配置
  ],
})
@formatterCollections({
  code: ['ssrc.sourceTemplate', 'ssrc.common', 'ssrc.inquiryHall'],
})
@connect(({ sourceTemplate, loading }) => ({
  sourceTemplate,
  loading: {
    fetch: loading.effects['sourceTemplate/templateDetail'],
    save: loading.effects['sourceTemplate/templateSave'],
    release: loading.effects['sourceTemplate/templateRelease'],
  },
  tenantId: getCurrentOrganizationId(),
}))
@Form.create({ fieldNameProp: null })
export default class Detail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      newFlag: isUndefined(props.match.params.templateId),
      collapseKeys: {}, // 打开的折叠面板key
      KeyFieldModalVisible: false, // 定义关键字段是否显示Modal是否可见
      modalRFVisible: false, // 询价或竞价时显示字段
      matterDetailVisible: false, // 寻源事项说明详情
      matterDetail: null, // 富文本内容
      isNew: false, // 配置表判断是否老页面
      checkPriceUiIsNew: true, // 根据配置表判断加载Ui
      isBid: false, // 是否启用新招标
      allOpenSelectable: false, // 全平台公开是否可以选择
      newQuotationFlag: 0, // 租户启用新报价标识, 1 => 启用新报价
      serviceChargeFlag: false, // 租户启用标书下载节点标识, true --- 显示
      taxRateConfigInfo: {}, // 税率值集视图配置
      newScoreFlag: false, // 新分值法
    };
  }

  /**
   * 生命周期初始化查询数据
   */
  componentDidMount() {
    const { dispatch } = this.props;
    // 查询模板详情数据
    this.handleSearch();
    this.fetchConfigSheetRfxPrepare();
    this.fetchBidConfig();
    this.fetchSourceMethodConfig();
    // 查询子集
    dispatch({ type: 'sourceTemplate/templateLov' });
    this.checkPriceUiDisplayConfig();
    this.newQuotationConfig();
    this.fetchTaxRateConfig();
    this.queryNewScoreConfigSheet();
  }

  // 生命周期销毁
  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'sourceTemplate/updateState',
      payload: {
        detail: {},
      },
    });
    dispatch({
      type: 'sourceTemplate/updateEditTableState',
    });
  }

  // 查询税率值集配置
  fetchTaxRateConfig() {
    queryLovInfo({ viewCode: 'SMDM.TAX' }).then((res) => {
      this.setState({
        taxRateConfigInfo: {
          ...(res || {}),
          displayField: res?.displayField || 'taxRate',
        },
      });
    });
  }

  /**
   * 模板详情查询
   */
  @Bind()
  handleSearch() {
    const { dispatch, tenantId, match } = this.props;
    const { templateId } = match.params;
    if (!isUndefined(templateId)) {
      dispatch({
        type: 'sourceTemplate/templateDetail',
        payload: {
          tenantId,
          templateId,
          customizeUnitCode:
            'SOURCE.TEMPLATE.DEFINE,SOURCE.TEMPLATE.RULE,SOURCE.TEMPLATE.WORKFLOW_CONFIGURATION,SOURCE.TEMPLATE.BASIC',
        },
      }).then((res) => {
        if (res) {
          this.setState({
            matterDetail: res.matterDetail,
          });
        }
      });
    }
  }

  @Bind()
  // 配置表配置显示寻源准备节点新老内容
  fetchConfigSheetRfxPrepare() {
    const { tenantId, dispatch } = this.props;

    dispatch({
      type: 'sourceTemplate/fetchConfigSheetRfxPrepare',
      payload: {
        organizationId: tenantId,
        tenant: getCurrentTenant().tenantNum,
      },
    }).then((res) => {
      if (res && res.length === 0) {
        this.setState({
          isNew: true,
        });
      }
    });
  }

  @Bind()
  async fetchBidConfig() {
    const res = getResponse(await fetchBidConfig({ tenant: getCurrentTenant().tenantNum }));
    if (res) {
      this.setState({
        isBid: Number(res[0]?.newBid || 1),
      });
      this.fetchSecondSourceCategory(Number(res[0]?.newBid || 1), Number(res[0]?.oldBid || 0));
    }
  }

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

  /**
   * 查询子集
   */
  @Bind()
  fetchSecondSourceCategory(newBid, oldBid) {
    const { dispatch } = this.props;
    dispatch({
      type: 'sourceTemplate/fetchSecondarySourceCategory',
      payload: {
        code:
          newBid && oldBid
            ? 'SSRC.SECONDARY_SOURCE_CATEGORY_WITH_BID'
            : 'SSRC.SECONDARY_SOURCE_CATEGORY',
      },
    });
  }

  // 查询当前单据 配置表 是否使用新报价
  async newQuotationConfig() {
    const { tenantId } = this.props;
    if (!tenantId) {
      return;
    }

    const param = {
      organizationId: tenantId,
      configCode: 'ssrc_rfq_quotation_old_ui_config',
      data: {
        tenant: getCurrentTenant().tenantNum,
      },
    };

    const serviceChargeParam = {
      organizationId: tenantId,
      configCode: 'ssrc_expenses_online_payment_blacklist',
      data: {
        tenantNum: getCurrentTenant().tenantNum,
      },
    };

    let result = null;
    let res = null;
    try {
      result = await fetchConfigSheet(param);
      result = getResponse(result);
      if (!(!isEmpty(result) && isArray(result) && result[0].id)) {
        this.setState({
          // 即接口返回空是新报价
          newQuotationFlag: 1,
        });
      }

      res = await fetchConfigSheet(serviceChargeParam);
      res = getResponse(res);
      if (!(!isEmpty(res) && isArray(res) && res[0].id)) {
        this.setState({
          // 即接口返回空就展示标书下载节点
          serviceChargeFlag: true,
        });
      }
    } catch (e) {
      throw e;
    }
  }

  // 配置表 是否使用新评分法
  @Bind()
  async queryNewScoreConfigSheet() {
    let data = null;

    try {
      data = await fetchConfigSheet({
        configCode: 'ssrc_new_score_type_config',
        organizationId: getCurrentOrganizationId(),
        data: {
          tenant: getCurrentTenant().tenantNum,
        },
      });
      data = getResponse(data);
      if (isEmpty(data)) {
        this.setState({ newScoreFlag: true });
      }
    } catch (e) {
      throw e;
    }
  }

  /**
   * 查询核价配置表
   */
  async checkPriceUiDisplayConfig() {
    const result = await queryCheckPriceUiDisplayConfig();
    if (result) {
      this.setState({
        checkPriceUiIsNew: !isEmpty(result), // 临时取反，上线还得改回
      });
    }
  }

  /**
   * 保存
   */
  @Bind()
  @Throttle(1200)
  handleSaveTemplate() {
    const {
      form,
      dispatch,
      tenantId,
      match,
      sourceTemplate: { detail = {}, newKeyFiledRFXInfo = [], newKeyFiledBIDInfo = [] },
      remote,
    } = this.props;
    const { templateId } = match.params;
    const { matterDetail, isBid } = this.state;
    if (!detail.subjectMatterRule) {
      detail.subjectMatterRule = 'NONE';
    }
    form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        let saveData = {
          ...detail,
          ...values,
          lackQuotationTriggersTypeMeaning: null, // 后端定义的字符串，但是模板定义没有开发功能，个性化还是对象，导致报错
          leaderNoScoreFlag: isNil(values.leaderNoScoreFlag) ? null : values.leaderNoScoreFlag,
          businessTechSee: isNil(values.businessTechSee) ? null : values.businessTechSee,
          tmplFieldCols: ['RFQ', 'RFA', 'NEW_BID'].includes(
            values[isBid ? 'secondarySourceCategory' : 'sourceCategory']
          )
            ? newKeyFiledRFXInfo
            : newKeyFiledBIDInfo,
          matterDetail,
          fastBidding: values.fastBidding ? 1 : 0,
        };
        saveData = remote
          ? remote.process('SSRC_SOURCE_TEMPLATE_SAVE_DATA', saveData, { that: this })
          : saveData;

        dispatch({
          type: 'sourceTemplate/templateSave',
          payload: {
            tenantId,
            customizeUnitCode:
              'SOURCE.TEMPLATE.WORKFLOW_CONFIGURATION,SOURCE.TEMPLATE.DEFINE,SOURCE.TEMPLATE.RULE,SOURCE.TEMPLATE.BASIC',
            data: saveData || {},
          },
        }).then((res) => {
          if (res) {
            notification.success();
            if (isUndefined(templateId)) {
              dispatch(
                routerRedux.push({
                  pathname: `/ssrc/source-template/update/${res.templateId}`,
                })
              );
            } else {
              this.handleSearch();
            }
          }
        });
      }
    });
  }

  /**
   * 发布
   */
  @Bind()
  @Throttle(1200)
  handleReleaseTemplate() {
    const {
      form,
      dispatch,
      tenantId,
      match,
      sourceTemplate: { detail = {}, newKeyFiledRFXInfo = [], newKeyFiledBIDInfo = [] },
      remote,
    } = this.props;
    const { matterDetail, isBid } = this.state;
    const { templateId } = match.params;
    if (!detail.subjectMatterRule) {
      detail.subjectMatterRule = 'NONE';
    }
    form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        let saveData = [
          {
            ...detail,
            ...values,
            lackQuotationTriggersTypeMeaning: null, // 后端定义的字符串，但是模板定义没有开发功能，个性化还是对象，导致报错
            tmplFieldCols: ['RFQ', 'RFA', 'NEW_BID'].includes(
              values[isBid ? 'secondarySourceCategory' : 'sourceCategory']
            )
              ? newKeyFiledRFXInfo
              : newKeyFiledBIDInfo,
            matterDetail,
            fastBidding: values.fastBidding ? 1 : 0,
          },
        ];

        saveData = remote
          ? remote.process('SSRC_SOURCE_TEMPLATE_RELEASE_DATA', saveData, { that: this })
          : saveData;
        dispatch({
          type: 'sourceTemplate/templateRelease',
          payload: {
            tenantId,
            customizeUnitCode:
              'SOURCE.TEMPLATE.WORKFLOW_CONFIGURATION,SOURCE.TEMPLATE.DEFINE,SOURCE.TEMPLATE.RULE,SOURCE.TEMPLATE.BASIC',
            data: saveData || [],
          },
        }).then((res) => {
          if (res) {
            notification.success();
            if (isUndefined(templateId)) {
              dispatch(
                routerRedux.push({
                  pathname: `/ssrc/source-template`,
                })
              );
            } else {
              dispatch(
                routerRedux.push({
                  pathname: `/ssrc/source-template`,
                })
              );
            }
          }
        });
      }
    });
  }

  /**
   * onCollapseChange - 折叠面板onChange
   * @param {Array<string>} collapseKeys - Panels key
   */
  @Bind()
  onCollapseChange(arr, key) {
    const { collapseKeys } = this.state;
    this.setState({
      collapseKeys: {
        ...collapseKeys,
        [key]: arr,
      },
    });
  }

  /**
   * 关键字段控制modal是否可见
   */
  @Bind()
  defineKeyFieldVisibleBID() {
    // const {
    //   history: { location },
    // } = this.props;
    // const { search } = location;
    // const { isHistory = false } = queryString.parse(search);
    // if (isHistory) {
    //   return;
    // }
    this.setState({
      KeyFieldModalVisible: true,
    });
  }

  /**
   * 关键字段控制modal是否可见
   */
  @Bind()
  defineKeyFieldVisibleRF() {
    // const {
    //   history: { location },
    // } = this.props;
    // const { search } = location;
    // const { isHistory = false } = queryString.parse(search);
    // if (isHistory) {
    //   return;
    // }
    this.setState({
      modalRFVisible: true,
    });
  }

  /**
   * 保存弹框中关键字段控制显示信息
   */
  @Bind()
  handleSaveKeyFiledModal() {
    const {
      dispatch,
      form: { getFieldValue },
      sourceTemplate: { newKeyFiledRFXInfo = [], newKeyFiledBIDInfo = [] },
      history: { location },
    } = this.props;
    const { search } = location;
    const { isBid } = this.state;
    this.setState({
      KeyFieldModalVisible: false,
      modalRFVisible: false,
    });
    const { isHistory = false } = queryString.parse(search);
    // 历史版本改成可以查看不会变更数据
    if (isHistory) {
      return;
    }
    const dataSource = ['RFQ', 'RFA', 'NEW_BID'].includes(
      getFieldValue(isBid ? 'secondarySourceCategory' : 'sourceCategory')
    )
      ? newKeyFiledRFXInfo
      : newKeyFiledBIDInfo;
    const dataKey = ['RFQ', 'RFA', 'NEW_BID'].includes(
      getFieldValue(isBid ? 'secondarySourceCategory' : 'sourceCategory')
    )
      ? 'newKeyFiledRFXInfo'
      : 'newKeyFiledBIDInfo';
    const updateSoure = getEditTableData(dataSource, ['tmplFieldColId']);
    dispatch({
      type: 'sourceTemplate/updateState',
      payload: {
        [dataKey]: updateSoure,
      },
    });
  }

  /**
   * 关闭弹框
   */
  @Bind()
  handleCancelKeyFiledModal() {
    this.setState({
      KeyFieldModalVisible: false,
      modalRFVisible: false,
    });
  }

  /**
   * 切换资格审查
   * @param {string} value - 审查类型
   */
  @Bind()
  handleChangeQualificationType(value) {
    const {
      dispatch,
      form: { getFieldValue },
      sourceTemplate: { newKeyFiledRFXInfo = [], newKeyFiledBIDInfo = [] },
    } = this.props;
    const { isBid } = this.state;
    if (value === 'PRE') {
      const dataSource = ['RFQ', 'RFA', 'NEW_BID'].includes(
        getFieldValue(isBid ? 'secondarySourceCategory' : 'sourceCategory')
      )
        ? newKeyFiledRFXInfo
        : newKeyFiledBIDInfo;
      const dataKey = ['RFQ', 'RFA', 'NEW_BID'].includes(
        getFieldValue(isBid ? 'secondarySourceCategory' : 'sourceCategory')
      )
        ? 'newKeyFiledRFXInfo'
        : 'newKeyFiledBIDInfo';
      // 由无需资格审查 -> 需要资格审查
      const updateSource = dataSource.map((item) => {
        if (!item.prequalVisibleFlag) {
          // const form = item.$form;
          // form.setFieldsValue({
          //   beforeVisibleFlag: 0,
          // });
          return {
            ...item,
            beforeVisibleFlag: 0,
          };
        } else {
          return item;
        }
      });
      dispatch({
        type: 'sourceTemplate/updateState',
        payload: {
          [dataKey]: updateSource,
        },
      });
    }
  }

  /**
   * 打开富文本弹窗
   */
  @Bind()
  handleShowMatterDetailModal() {
    // const {
    //   history: { location },
    // } = this.props;
    // const { search } = location;
    // const { isHistory = false } = queryString.parse(search);
    // if (isHistory) {
    //   return;
    // }
    this.setState({
      matterDetailVisible: true,
    });
  }

  /**
   * 隐藏modal
   * @param {string} matterDetail -富文本内容
   */
  @Bind()
  handleHideMatterDetailModal(matterDetail) {
    const {
      history: { location },
    } = this.props;
    const { search } = location;
    const { isHistory = false } = queryString.parse(search);
    // 历史版本改成可以查看不会变更数据
    if (isHistory) {
      this.setState({
        matterDetailVisible: false,
      });
      return;
    }
    this.setState({
      matterDetail,
      matterDetailVisible: false,
    });
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      form,
      match,
      history: { location },
      loading,
      customizeForm,
      sourceTemplate: {
        sourceGaty = [],
        secondarySourceCategory = [],
        sourceTempStatus = [],
        approve = [],
        bidRule = [],
        sourceQualification = [],
        expertScore = [],
        sourceStage = [],
        openBid = [],
        subjectMater = [],
        validDateInput = [],
        autoDefer = [],
        sourceMd = [],
        quotationType = [],
        sourceAuctionDir = [],
        quotationChange = [],
        detailPriceControlRule = [],
        reaAuction = [],
        reaOpen = [],
        sourcePrice = [],
        sourceTy = [],
        detail = {},
        quotationScope = [],
        roundQuotationRule = [],
        roundQuotationRankRules = [],
        preApproveType = [],
        bargainRule = [],
        rankRules = [],
        expertSources = [],
        budgetControlRules = [],
        scoreTemplateScoreType = [],
        selectionStrategys,
        initialReview = [],
        autoDeferTimeRuleDate = [],
        businessTechSees = [],
        scoringReportGenerationCtrl = [],
        checkRecommendationStrategys = [],
        checkSelectionDimensions = [],
        bidFileDownloadNodeData = [],
        noticeEndNodeCode = [],
        releaseApprove = [],
        scoreHideSupplierRule = [],
        autoScorePriceTypeList = [],
        announcementTypeList = [],
        announcementContentList = [],
        clarifyApprovalTypeList = [],
        expertRequirementsRule = [],
        reviewHidePriceOptions = [],
      },
      remote,
    } = this.props;
    const { search } = location;
    const { isHistory = false, versionNumber, templateNum, type = '' } = queryString.parse(search);
    const {
      newFlag,
      collapseKeys,
      KeyFieldModalVisible,
      modalRFVisible = false,
      matterDetailVisible = false,
      matterDetail,
      isNew,
      checkPriceUiIsNew,
      isBid,
      allOpenSelectable,
      newQuotationFlag = 0,
      serviceChargeFlag = false,
      taxRateConfigInfo,
      newScoreFlag = false,
    } = this.state;
    const basicInfoProps = {
      form,
      isBid,
      sourceGaty,
      sourceTempStatus,
      dataSource: detail,
      customizeForm,
      isHistory,
      secondarySourceCategory,
      remote,
    };
    const questionProps = {
      form,
      remote,
      isNew,
      customizeForm,
      approve,
      bidRule,
      newFlag,
      sourceQualification,
      expertScore,
      sourceStage,
      openBid,
      subjectMater,
      validDateInput,
      autoDefer,
      sourceMd,
      quotationType,
      sourceAuctionDir,
      quotationChange,
      detailPriceControlRule,
      reaAuction,
      reaOpen,
      sourcePrice,
      sourceTy,
      quotationScope,
      roundQuotationRule,
      roundQuotationRankRules,
      bargainRule,
      selectionStrategys,
      preApproveType,
      rankRules,
      expertSources,
      budgetControlRules,
      scoreTemplateScoreType,
      initialReview,
      dataSource: detail,
      autoDeferTimeRuleDate,
      businessTechSees,
      scoringReportGenerationCtrl,
      checkSelectionDimensions,
      checkRecommendationStrategys,
      defineKeyFieldVisibleBID: this.defineKeyFieldVisibleBID,
      defineKeyFieldVisibleRF: this.defineKeyFieldVisibleRF,
      onChangeQualificationType: this.handleChangeQualificationType,
      onShowMatterDetailModal: this.handleShowMatterDetailModal,
      isHistory,
      checkPriceUiIsNew,
      isBid,
      allOpenSelectable,
      newQuotationFlag,
      bidFileDownloadNodeData,
      serviceChargeFlag,
      noticeEndNodeCode,
      releaseApprove,
      taxRateConfigInfo,
      newScoreFlag,
      scoreHideSupplierRule,
      autoScorePriceTypeList,
      announcementTypeList,
      announcementContentList,
      clarifyApprovalTypeList,
      expertRequirementsRule,
      reviewHidePriceOptions,
    };

    const KeyFieldModalProps = {
      match,
      KeyFieldModalVisible,
      handleSaveKeyFiledModal: this.handleSaveKeyFiledModal,
      handleCancelKeyFiledModal: this.handleCancelKeyFiledModal,
      keyFiledcontrolInfo: detail.tmplFieldCols || [],
      qualificationType: form.getFieldValue('qualificationType'), // 资格审查类型
    };

    const modalRFProps = {
      match,
      visible: modalRFVisible,
      handleSaveRFModal: this.handleSaveKeyFiledModal,
      handleCancelKeyFiledModal: this.handleCancelKeyFiledModal,
      keyFiledcontrolInfo: detail.tmplFieldCols || [],
      qualificationType: form.getFieldValue('qualificationType'), // 资格审查类型
    };
    const matterDetailProps = {
      isHistory,
      matterDetail,
      matterDetailVisible,
      dataSource: detail,
      handleModal: this.handleHideMatterDetailModal,
    };
    const headerTitle =
      type === 'view'
        ? intl
            .get(`${promptCode}.view.message.title.sourcingTemplateNum`, { templateNum })
            .d(`寻源模板（${templateNum}）`)
        : intl
            .get(`${promptCode}.view.message.title.sourcingTemplateNum`, { templateNum })
            .d(`寻源模板（${templateNum}）`) +
          intl
            .get(`${promptCode}.model.template.versionNumberAndVar`, { versionNumber })
            .d(`版本${versionNumber}`);
    // 按钮loading
    const buttonLoading = loading.fetch || loading.save || loading.release;
    return (
      <React.Fragment>
        <Header
          title={
            isHistory
              ? headerTitle
              : intl.get(`${promptCode}.view.message.title.sourceTmpEdit`).d('寻源模板维护')
          }
          backPath="/ssrc/source-template"
        >
          {isHistory ? null : (
            <React.Fragment>
              <Button
                icon="rocket"
                type="primary"
                loading={buttonLoading}
                onClick={this.handleReleaseTemplate}
              >
                {intl.get('hzero.common.button.release').d('发布')}
              </Button>
              <Button loading={buttonLoading} icon="save" onClick={this.handleSaveTemplate}>
                {intl.get('hzero.common.button.save').d('保存')}
              </Button>
            </React.Fragment>
          )}
        </Header>
        <Content>
          <Spin
            spinning={newFlag ? false : loading.fetch}
            wrapperClassName={classnames('ued-detail-wrapper', style['template-container'])}
          >
            <Collapse
              className="form-collapse"
              defaultActiveKey={['baseInfo']}
              onChange={(arr) => this.onCollapseChange(arr, 'baseInfo')}
            >
              <Panel
                showArrow={false}
                header={
                  <Fragment>
                    <h3>{intl.get(`${promptCode}.view.message.panel.baseInfos`).d('基本信息')}</h3>
                    <a>
                      {collapseKeys.baseInfo
                        ? collapseKeys.baseInfo.some((o) => o === 'baseInfo')
                          ? intl.get(`hzero.common.button.up`).d('收起')
                          : intl.get(`hzero.common.button.expand`).d('展开')
                        : intl.get(`hzero.common.button.up`).d('收起')}
                    </a>
                    <Icon
                      type={
                        collapseKeys.baseInfo
                          ? collapseKeys.baseInfo.some((o) => o === 'baseInfo')
                            ? 'up'
                            : 'down'
                          : 'up'
                      }
                    />
                  </Fragment>
                }
                key="baseInfo"
              >
                <BasicInfoForm {...basicInfoProps} />
              </Panel>
            </Collapse>
            <Collapse
              className="form-collapse"
              defaultActiveKey={['question']}
              onChange={(arr) => this.onCollapseChange(arr, 'question')}
            >
              <Panel
                showArrow={false}
                header={
                  <Fragment>
                    <h3>
                      {intl.get(`${promptCode}.view.message.panel.processConfig`).d('流程配置')}
                    </h3>
                    <a>
                      {collapseKeys.question
                        ? collapseKeys.question.some((o) => o === 'question')
                          ? intl.get(`hzero.common.button.up`).d('收起')
                          : intl.get(`hzero.common.button.expand`).d('展开')
                        : intl.get(`hzero.common.button.up`).d('收起')}
                    </a>
                    <Icon
                      type={
                        collapseKeys.question
                          ? collapseKeys.question.some((o) => o === 'question')
                            ? 'up'
                            : 'down'
                          : 'up'
                      }
                    />
                  </Fragment>
                }
                key="question"
              >
                <QuestionForm {...questionProps} />
              </Panel>
            </Collapse>
            <Collapse
              className="form-collapse"
              defaultActiveKey={['rule']}
              onChange={(arr) => this.onCollapseChange(arr, 'rule')}
            >
              <Panel
                showArrow={false}
                header={
                  <Fragment>
                    <h3>
                      {intl.get(`${promptCode}.view.message.panel.sourceRuleCon`).d('寻源规则配置')}
                    </h3>
                    <a>
                      {collapseKeys.rule
                        ? collapseKeys.rule.some((o) => o === 'rule')
                          ? intl.get(`hzero.common.button.up`).d('收起')
                          : intl.get(`hzero.common.button.expand`).d('展开')
                        : intl.get(`hzero.common.button.up`).d('收起')}
                    </a>
                    <Icon
                      type={
                        collapseKeys.rule
                          ? collapseKeys.rule.some((o) => o === 'rule')
                            ? 'up'
                            : 'down'
                          : 'up'
                      }
                    />
                  </Fragment>
                }
                key="rule"
              >
                <RuleForm {...questionProps} />
              </Panel>
            </Collapse>
            <Collapse
              className="form-collapse"
              defaultActiveKey={['default']}
              onChange={(arr) => this.onCollapseChange(arr, 'default')}
            >
              <Panel
                showArrow={false}
                header={
                  <Fragment>
                    <h3>
                      {intl.get(`${promptCode}.view.message.panel.defaultConfig`).d('缺省值配置')}
                    </h3>
                    <a>
                      {collapseKeys.default
                        ? collapseKeys.default.some((o) => o === 'default')
                          ? intl.get(`hzero.common.button.up`).d('收起')
                          : intl.get(`hzero.common.button.expand`).d('展开')
                        : intl.get(`hzero.common.button.up`).d('收起')}
                    </a>
                    <Icon
                      type={
                        collapseKeys.default
                          ? collapseKeys.default.some((o) => o === 'default')
                            ? 'up'
                            : 'down'
                          : 'up'
                      }
                    />
                  </Fragment>
                }
                key="default"
              >
                <DefaultForm {...questionProps} />
              </Panel>
            </Collapse>
          </Spin>
        </Content>
        {KeyFieldModalVisible ? <KeyFieldModal {...KeyFieldModalProps} /> : null}
        {modalRFVisible && <KeyRFModal {...modalRFProps} />}
        {matterDetailVisible && <MatterDetailModal {...matterDetailProps} />}
        {/* <MatterDetailModal {...matterDetailProps} /> */}
      </React.Fragment>
    );
  }
}
