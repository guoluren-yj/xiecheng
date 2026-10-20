/**
 * bidHall - 招标服务/详情
 * @date: 2019-6-10
 * @author: HZL <zili.hou@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2019, Hand
 */

import React, { Component } from 'react';
import { Form, Row, Col, Tabs, Modal, Table, Spin } from 'hzero-ui';
import { sum, isNumber, isEmpty } from 'lodash';
import { routerRedux } from 'dva/router';
import classnames from 'classnames';
import { Bind } from 'lodash-decorators';
import querystring from 'querystring';

import formatterCollections from 'utils/intl/formatterCollections';
// import { numberRender } from 'utils/renderer';
import Upload from 'components/Upload';
import intl from 'utils/intl';
import Checkbox from 'components/Checkbox';
import { FORM_COL_3_LAYOUT, EDIT_FORM_ITEM_LAYOUT } from 'utils/constants';
import { Header, Content } from 'components/Page';

import ItemLineTable from './ItemLineTable';
import ProfessionalTable from './ProfessionalTable';
import ScoringElementsTable from './ScoringElementsTable';
import SupplierLineTable from './SupplierLineTable';
import ScoringElementModal from './ScoringElementModal';
import TenderNoticeForm from './TenderNoticeForm';
import SSU from '../SessionStorageUrl';
import { BUCKET_NAME } from '@/routes/components/utils/constant';
import common from '@/routes/sbid/common.less';
import { formatNumber } from '@/routes/components/utils';

const FormItem = Form.Item;
const promptCode = 'ssrc.bidHall';
const UEDDisplayFormItem = (props) => {
  const { label, value } = props;
  return (
    <FormItem label={label} {...EDIT_FORM_ITEM_LAYOUT}>
      {value}
    </FormItem>
  );
};

@Form.create({ fieldNameProp: null })
@formatterCollections({ code: ['ssrc.bidHall', 'ssrc.bidTask', 'ssrc.common'] })
export default class Detail extends Component {
  constructor(props) {
    super(props);
    this.ItemLineTable = {};

    const { backRecommend = '' } = querystring.parse(this.props.location.search.substr(1));

    this.state = {
      backRecommend, // 专家评分跳转标记
      subjectMatterRule: '', // 标的规则
      sourceMethod: '', // “寻源方式”是“合作伙伴公开”或“全平台公开”，供应商列表Tab页禁用
      editBidMembersFlag: false, // 招标小组
      distributeModalVisible: false, // 物品明细分配供应商
      evaluateAssignModalVisible: false, // 评分要素分配专家modal
      scoringElementVisible: false, // 招标评分细项modal
    };
  }

  componentDidMount() {
    this.fetchbidHallUpdate();
  }

  /**
   * onRef获取子组件
   */
  @Bind()
  onRef(ref) {
    this.ItemLineTable = ref;
  }

  componentWillUnmount() {
    const { dispatch, modelName = 'bidHall' } = this.props;
    dispatch({
      type: `${modelName}/updateState`,
      payload: {
        header: {},
        bidMembersList: [],
        itemLine: [],
        itemLinePagination: {},
        supplierLine: [],
        scoringElement: [], // 评分要素数据
        scoringNoneTempelate: [], // 模板明细不区分数据
        scoringBusinessTempelate: [], // 模板明细商务组数据
        scoringTechnologyTempelate: [], // 模板明细技术组数据
        scoringNoneExpert: [], // 专家分配不区分数据
        scoringBusinessExpert: [], // 专家分配商务组数据
        scoringTechnologyExpert: [], // 专家分配技术组数据
        itemLineChange: false,
        itemLineExpandedKeys: [],
        historys: '',
      },
    });

    SSU.clear();
  }

  /**
   * 获取回退路径
   * */
  getBackPath() {
    const { backRecommend } = this.state;
    let backPath;
    if (
      backRecommend === 'BidEvaluateBidHallDetail' ||
      backRecommend === 'expertDetailToBidHallDetail'
    ) {
      backPath = null;
    } else {
      backPath = '/ssrc/bid-hall/list';
    }
    return backPath;
  }

  /**
   * 查询维护页面信息
   */
  @Bind()
  fetchbidHallUpdate() {
    const {
      match: { params, path },
      dispatch,
      organizationId,
      modelName = 'bidHall',
    } = this.props;
    dispatch({
      type: `${modelName}/fetchBidHeaderDetail`,
      payload: { organizationId, bidHeaderId: params.bidId, path },
    });
    dispatch({
      type: `${modelName}/fetchItemLine`,
      payload: { organizationId, bidHeaderId: params.bidId, path },
    });
    dispatch({
      type: `${modelName}/fetchSupplierLine`,
      payload: { organizationId, bidHeaderId: params.bidId },
    });
    dispatch({
      type: `${modelName}/fetchBidMembers`,
      payload: { organizationId, bidHeaderId: params.bidId, path },
    });
    dispatch({
      type: `${modelName}/fetchExpertAllocationData`,
      payload: {
        organizationId,
        sourceHeaderId: params.bidId,
        sourceFrom: 'BID',
        expertStatus: 'SUBMITTED',
      },
    });
    dispatch({
      type: `${modelName}/fetchTempelateDetailData`,
      payload: {
        organizationId,
        sourceHeaderId: params.bidId,
        sourceFrom: 'BID',
        indicStatus: 'SUBMITTED',
      },
    });

    const lovCodes = {
      quotationType: 'SSRC.QUOTATION_TYPE', // 报价方式
      sourceMethod: 'SSRC.SOURCE_METHOD', // 寻源方式
      subjectMatterRule: 'SSRC.SUBJECT_MATTER_RULE', // 标的规则
      reviewMethod: 'SSRC.REVIEW_METHOD', // 审查方式
      bidRole: 'SSRC.BID_MEMBER_ROLE', // 招标角色
      sourceStage: 'SSRC.SOURCE_STAGE', // 招标阶段
      bidStatus: 'SSRC.BID_STATUS', // 招标单状态
      sourceCategory: 'SSRC.SOURCE_CATEGORY', // 寻源类别
      auctionDirection: 'SSRC.SOURCE_AUCTION_DIRECTION', // 投标方向
      sourceType: 'SSRC.SOURCE_TYPE', // 寻源类型
      priceCategory: 'SSRC.SOURCE_PRICE_CATEGORY', // 价格类型
      quotationOrderType: 'SSRC.QUOTATION_ORDER_TYPE', // 投标次序
      auctionRule: 'SSRC.RFA_AUCTION_RULE', // 竞价规则
      openRule: 'SSRC.RFA_OPEN_RULE', // 公开规则
      indicateType: 'SSRC.INDICATE_TYPE', // 要素类型
    };
    dispatch({
      type: `${modelName}/batchCode`,
      payload: { lovCodes },
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
      organizationId,
      modelName = 'bidHall',
    } = this.props;
    dispatch({
      type: `${modelName}/fetchSupplierLine`,
      payload: {
        page,
        organizationId,
        bidHeaderId: params.bidId,
      },
    });
  }

  // 评分要素-专家分配 打开modal
  @Bind()
  openAssignExpertModal(record) {
    const { organizationId, dispatch, modelName = 'bidHall' } = this.props;

    this.setState({
      evaluateAssignModalVisible: true,
    });

    dispatch({
      type: `${modelName}/fetchEvaluateIndicAssign`,
      payload: {
        organizationId,
        evaluateIndicId: record.evaluateIndicId || '',
        evaluateIndicCategory: record.team || '',
      },
    });
  }

  // 评分要素-专家分配 关闭modal
  @Bind()
  cancelAssignExpert() {
    this.setState({
      evaluateAssignModalVisible: false,
    });
  }

  /**
   * 查看-打开评分要素定义模态框
   */
  @Bind()
  showScoringElement() {
    this.setState({
      scoringElementVisible: true,
    });
    this.fetchScoringElementData();
  }

  /**
   * 查询-评分要素定义数据
   */
  @Bind()
  fetchScoringElementData() {
    const { modelName = 'bidHall' } = this.props;
    const {
      dispatch,
      [modelName]: { header = {} },
      organizationId,
    } = this.props;
    dispatch({
      type: `${modelName}/fetchScoringElementData`,
      payload: { prequalHeaderId: header.prequalHeaderId, organizationId },
    });
  }

  /**
   * 关闭-评分要素定义模态框
   */
  @Bind()
  handleCancelScoringElement() {
    const { modelName = 'bidHall' } = this.props;
    this.props.dispatch({
      type: `${modelName}/updateState`,
      payload: {
        scoringElement: [],
      },
    });
    this.setState({
      scoringElementVisible: false,
    });
  }

  /**
   * 物品明细-点击分配按钮
   */
  @Bind()
  onDistributeSupplierForItemLine(record) {
    const { dispatch, organizationId, modelName = 'bidHall' } = this.props;

    if (!record) {
      return;
    }

    dispatch({
      type: `${modelName}/supplierRecord`,
      payload: {
        organizationId,
        bidHeaderId: record.bidHeaderId,
        bidLineItemId: record.bidLineItemId,
      },
    });

    this.setState({ distributeModalVisible: true });
  }

  // 明细取消分配供应商
  @Bind()
  cancelDistribute() {
    this.setState({ distributeModalVisible: false });
  }

  /**
   * 改变币种-人民币时汇率为1.0000000
   */
  @Bind()
  changeCurrencyCode(val) {
    const { form } = this.props;
    if (val === 'CNY') {
      form.setFieldsValue({ exchangeRate: 1.0 });
    } else {
      form.setFieldsValue({ exchangeRate: undefined });
    }
  }

  @Bind()
  editBidMembers() {
    this.setState({
      editBidMembersFlag: true,
    });
  }

  @Bind()
  handleMembersCancel() {
    this.setState({
      editBidMembersFlag: false,
    });
  }

  // 跳转澄清答疑查看页面
  @Bind()
  clarificationView() {
    const {
      dispatch,
      modelName = 'bidHall',
      location: { pathname },
    } = this.props;
    const {
      [modelName]: { header = {} },
    } = this.props;
    const backPath = pathname.split('/bid-detail') && pathname.split('/bid-detail')[0];
    if (backPath === '/ssrc/bid-hall') {
      dispatch(
        routerRedux.push({
          pathname: `/ssrc/bid-hall/clarification-view/${header.bidHeaderId}/${header.bidNum}/${header.bidTitle}/${header.companyId}/1`,
        })
      );
    } else {
      dispatch(
        routerRedux.push({
          pathname: `/ssrc/bid-task/clarification-view/${header.bidHeaderId}/${header.bidNum}/${header.bidTitle}/${header.companyId}/1`,
        })
      );
    }
  }

  /**
   * 表单头
   */
  renderHeaderForm() {
    const { modelName = 'bidHall' } = this.props;
    const {
      organizationId,
      [modelName]: { header = {} },
    } = this.props;
    const formsLayouts = { labelCol: { span: 3 }, wrapperCol: { span: 20 } };

    return (
      <Form className="writable-row-custom">
        <Row gutter={48}>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`${promptCode}.model.bidHall.bidNum.`).d('招标编号')}
              value={header.bidNum}
            />
          </Col>
          <Col span={16}>
            <FormItem
              label={intl.get(`${promptCode}.model.bidHall.bidTitle`).d('招标事项')}
              {...formsLayouts}
            >
              <span style={{ marginLeft: '6%' }}>{header.bidTitle}</span>
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48}>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`${promptCode}.model.bidHall.sourcingTemplate`).d('寻源模板')}
              value={header.templateName}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`${promptCode}.model.bidHall.quotationType`).d('报价方式')}
              value={header.quotationTypeMeaning}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`${promptCode}.model.bidHall.purceOrgName`).d('采购组织名称')}
              value={header.purOrganizationName}
            />
          </Col>
        </Row>
        <Row gutter={48}>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get('ssrc.common.company').d('公司')}
              value={header.companyName}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`${promptCode}.model.bidHall.bidType`).d('招标类别')}
              value={header.bidType}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`${promptCode}.model.bidHall.sourceMethod`).d('寻源方式')}
              value={header.sourceMethodMeaning}
            />
          </Col>
        </Row>
        <Row gutter={48}>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`${promptCode}.model.bidHall.subjectMatterRule`).d('标的规则')}
              value={header.subjectMatterRuleMeaning}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`${promptCode}.model.bidHall.sourceStage`).d('招标阶段')}
              value={header.sourceStageMeaning}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`${promptCode}.model.bidHall.maxBidNumber`).d('最大中标数')}
              value={header.maxBidNumber}
            />
          </Col>
        </Row>
        <Row gutter={48}>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`${promptCode}.model.bidHall.quotationStartDate`).d('投标开始时间')}
              value={header.quotationStartDate}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`${promptCode}.model.bidHall.quotationEndDate`).d('投标截止时间')}
              value={header.quotationEndDate}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`${promptCode}.model.bidHall.bidOpenDate`).d('开标时间')}
              value={header.bidOpenDate}
            />
          </Col>
        </Row>
        <Row gutter={48}>
          <Col span={8}>
            <FormItem
              label={intl.get(`${promptCode}.model.bidHall.bidMembers`).d('招标小组')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              <a onClick={this.editBidMembers}>{intl.get(`hzero.common.button.view`).d('查看')}</a>
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`${promptCode}.model.bidHall.bidFile`).d('招标文件')}
              value={
                <Upload
                  bucketName={BUCKET_NAME}
                  bucketDirectory="ssrc-bid-header"
                  attachmentUUID={
                    isEmpty(header.techAttachmentUuid) ? undefined : header.techAttachmentUuid
                  }
                  tenantId={organizationId}
                  icon="download"
                  viewOnly
                />
              }
            />
          </Col>
          <Col span={8}>
            <FormItem
              label={intl.get(`${promptCode}.model.bidHall.clarification`).d('澄清答疑')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              <a onClick={this.clarificationView}>
                {intl.get(`hzero.common.button.view`).d('查看')}
              </a>
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }

  /**
   * 其他信息
   */
  renderOtherInfosForm() {
    const { modelName = 'bidHall' } = this.props;
    const {
      [modelName]: { header = {} },
    } = this.props;

    return (
      <Form className="writable-row-custom">
        <Row gutter={48}>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`${promptCode}.model.bidHall.bidPlanName`).d('寻源计划')}
              value={header.bidPlanLineName}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`${promptCode}.model.bidHall.projectCode`).d('项目编码')}
              value={header.projectNum}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`${promptCode}.model.bidHall.projectName`).d('项目名称')}
              value={header.projectName}
            />
          </Col>
        </Row>
        <Row gutter={48}>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`${promptCode}.model.bidHall.bidLocation`).d('项目地点')}
              value={header.bidLocation}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`${promptCode}.model.bidHall.currencyType`).d('币种')}
              value={header.currencyCode}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`${promptCode}.model.bidHall.exchangeRate`).d('汇率')}
              value={formatNumber(header.exchangeRate, 8, false)}
            />
          </Col>
        </Row>
        <Row gutter={48}>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`${promptCode}.model.bidHall.roundNumber`).d('轮次')}
              value={header.roundNumber}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`hzero.common.components.dataAudit.version`).d('版本')}
              value={header.versionNumber}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`hzero.common.date.creation`).d('创建时间')}
              value={header.creationDate}
            />
          </Col>
        </Row>
        <Row gutter={48}>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`${promptCode}.model.bidHall.bidFileExpense`).d('招标文件费')}
              value={header.bidFileExpense}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`${promptCode}.model.bidHall.bidBond`).d('保证金')}
              value={header.bidBond}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`${promptCode}.model.bidHall.paymentType`).d('付款方式')}
              value={header.paymentTypeName}
            />
          </Col>
        </Row>
        <Row gutter={48}>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`${promptCode}.model.bidHall.paymentTerm`).d('付款条款')}
              value={header.paymentTerm}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`${promptCode}.model.bidHall.bidOpenLocation`).d('开标地点')}
              value={header.bidOpenLocation}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`${promptCode}.model.bidHall.purchasingContact`).d('采购联系人')}
              value={header.purName}
            />
          </Col>
        </Row>
        <Row gutter={48}>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`${promptCode}.model.bidHall.contactPhone`).d('联系人电话')}
              value={header.purPhone}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`${promptCode}.model.bidHall.contactMail`).d('联系人邮箱')}
              value={header.purEmail}
            />
          </Col>
        </Row>
      </Form>
    );
  }

  /**
   * 资格预审
   */
  renderQualificationForm() {
    const { modelName = 'bidHall' } = this.props;
    const {
      organizationId,
      // eslint-disable-next-line no-unused-vars
      [modelName]: { header = {} },
    } = this.props;
    return (
      <Form className="writable-row-custom">
        <Row gutter={48}>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`${promptCode}.model.bidHall.prequalEndDate`).d('预审截止时间')}
              value={header.prequalEndDate}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`${promptCode}.model.bidHall.reviewMethod`).d('审查方式')}
              value={header.reviewMethodMeaning}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`${promptCode}.model.bidHall.qualifiedLimit`).d('合格上限')}
              value={header.qualifiedLimit}
            />
          </Col>
        </Row>
        <Row gutter={48}>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`${promptCode}.model.bidHall.prequalFileExpense`).d('预审文件费')}
              value={header.prequalFileExpense}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`${promptCode}.model.bidHall.prequalLocation`).d('申请提交地点')}
              value={header.prequalLocation}
            />
          </Col>
          <Col span={8}>
            <FormItem
              label={intl.get(`${promptCode}.model.bidHall.enableScoreFlag`).d('启用评分细项')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              <a onClick={this.showScoringElement}>
                {intl.get('hzero.common.button.view').d('查看')}
              </a>
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48}>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`${promptCode}.model.bidHall.prequalFile`).d('资格预审文件')}
              value={
                <Upload
                  bucketName={BUCKET_NAME}
                  bucketDirectory="ssrc-rfx-prequal"
                  attachmentUUID={header.prequalAttachmentUuid}
                  tenantId={organizationId}
                  icon="download"
                  viewOnly
                />
              }
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`${promptCode}.model.bidHall.bidderDemand`).d('投标人的资格要求')}
              value={header.prequalRemark}
            />
          </Col>
        </Row>
      </Form>
    );
  }

  render() {
    const { modelName = 'bidHall' } = this.props;
    const {
      form,
      dispatch,
      match,
      organizationId,
      userId,
      fetchbidHallUpdateLoading,
      supplierRecordLoading,
      fetchItemLineLoading,
      fetchBidMembersLoading,
      fetchSupplierLineloading,
      fetchTempelateDetailDataLoading,
      fetchScoringElementLoading,
      fetchExpertAllocationDataLoading,
      fetchEvaluateIndicAssignLoading,
      [modelName]: {
        header = {},
        itemLine = [],
        supplierData = [],
        supplierLine = [],
        scoringElement = [],
        bidMembersList = [],
        itemLinePagination = {},
        scoringNoneExpert = [],
        scoringBusinessExpert = [],
        scoringTechnologyExpert = [],
        scoringNoneTempelate = [],
        scoringBusinessTempelate = [],
        scoringTechnologyTempelate = [],
        currentScoringExperts = [],
      },
    } = this.props;

    const {
      subjectMatterRule,
      sourceMethod,
      editBidMembersFlag,
      evaluateAssignModalVisible,
      scoringElementVisible,
      distributeModalVisible,
    } = this.state;

    // 物品明细
    const ItemLineTableProps = {
      match,
      dispatch,
      organizationId,
      supplierRecordLoading,
      subjectMatterRule: subjectMatterRule || header.subjectMatterRule,
      loading: fetchItemLineLoading,
      dataSource: itemLine,
      pagination: itemLinePagination,
      onDistributeSupplierForItemLine: this.onDistributeSupplierForItemLine,
      cancelDistribute: this.cancelDistribute,
      distributeModalVisible,
      supplierData,
      onChangeTableData: this.changeItemLineTableData,
    };
    // 专家
    const ProfessionalTableProps = {
      header,
      scoringNoneExpert,
      scoringBusinessExpert,
      scoringTechnologyExpert,
      dispatch,
      organizationId,
      match,
      fetchExpertAllocationDataLoading,
    };

    // 评分要素
    const ScoringElementsTableProps = {
      loading: fetchTempelateDetailDataLoading,
      header,
      scoringNoneTempelate,
      scoringBusinessTempelate,
      scoringTechnologyTempelate,
      dispatch,
      evaluateAssignModalVisible,
      organizationId,
      match,
      currentScoringExperts,
      fetchEvaluateIndicAssignLoading,
      openAssignExpertModal: this.openAssignExpertModal,
      cancelAssignExpert: this.cancelAssignExpert,
    };

    // 招标公告
    const TenderNoticeProps = {
      header,
      organizationId,
    };

    // 供应商
    const SupplierLineTableProps = {
      dispatch,
      organizationId,
      userId,
      companyId: header.companyId,
      match,
      fetchbidHallUpdateLoading,
      loading: fetchSupplierLineloading,
      dataSource: supplierLine,
      sourceMethod: sourceMethod || header.sourceMethod,
    };

    // 招标细项props
    const scoringElementProps = {
      header,
      loading: fetchScoringElementLoading,
      visible: scoringElementVisible,
      dataSource: scoringElement,
      onCancel: this.handleCancelScoringElement,
    };
    const { getFieldDecorator } = form;
    // 招标小组
    const columnsBidMember = [
      {
        title: intl.get(`${promptCode}.model.bidHall.bidRole`).d('招标角色'),
        dataIndex: 'bidRoleMeaning',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.model.bidHall.userName`).d('用户名'),
        dataIndex: 'loginName',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.model.bidHall.designation`).d('名称'),
        dataIndex: 'userName',
        width: 120,
      },
      {
        title: intl.get(`hzero.common.email`).d('邮箱'),
        dataIndex: 'email',
        width: 170,
        render: (val) => val,
      },
      {
        title: intl.get(`hzero.common.phone`).d('电话'),
        dataIndex: 'phone',
        width: 120,
        render: (val) => val,
      },
      {
        title: intl.get(`${promptCode}.model.bidHall.passwordFlag`).d('启用开标密码'),
        dataIndex: 'passwordFlag',
        width: 120,
        render: (val) => (
          <Form.Item style={{ marginBottom: 0 }}>
            {getFieldDecorator('passwordFlag', {
              initialValue: val,
            })(<Checkbox checkedValue={1} unCheckedValue={0} disabled />)}
          </Form.Item>
        ),
      },
    ];

    const scrollX = sum(columnsBidMember.map((n) => (isNumber(n.width) ? n.width : 0)));

    return (
      <React.Fragment>
        {match.path !== '/pub/ssrc/bid-hall/bid-detail/:bidId' ? (
          <Header
            backPath={this.getBackPath()}
            title={intl.get(`${promptCode}.view.title.bidDetails`).d('招标书明细')}
          />
        ) : (
          ''
        )}
        <Content className={classnames(common['page-content-custom'], 'ued-detail-wrapper')}>
          <Spin spinning={fetchbidHallUpdateLoading}>
            <Tabs defaultActiveKey="baseInfos" animated={false}>
              <Tabs.TabPane
                tab={intl.get(`${promptCode}.view.tab.baseInfos`).d('基本信息')}
                key="baseInfos"
              >
                {this.renderHeaderForm()}
              </Tabs.TabPane>
              <Tabs.TabPane
                tab={intl.get(`${promptCode}.view.tab.otherInfos`).d('其他信息')}
                key="otherInfos"
                forceRender
              >
                {this.renderOtherInfosForm()}
              </Tabs.TabPane>
              {['PRE', 'PRE_POST'].includes(header.qualificationType) ? (
                <Tabs.TabPane
                  tab={intl.get(`${promptCode}.view.tab.preQualification`).d('资格预审')}
                  key="preQualification"
                  forceRender
                >
                  {this.renderQualificationForm()}
                </Tabs.TabPane>
              ) : (
                ''
              )}
              {header.expertScoreType === 'ONLINE' ? (
                <Tabs.TabPane
                  tab={intl.get(`${promptCode}.view.tab.professional`).d('专家')}
                  key="professional"
                  forceRender
                >
                  <ProfessionalTable {...ProfessionalTableProps} />
                </Tabs.TabPane>
              ) : (
                ''
              )}
              {header.expertScoreType === 'ONLINE' ? (
                <Tabs.TabPane
                  tab={intl.get(`${promptCode}.view.tab.scoringElements`).d('评分要素')}
                  key="scoringElements"
                  forceRender
                >
                  <ScoringElementsTable {...ScoringElementsTableProps} />
                </Tabs.TabPane>
              ) : (
                ''
              )}
              <Tabs.TabPane
                tab={intl.get(`${promptCode}.view.tab.supplierList`).d('供应商列表')}
                key="supplierList"
                forceRender
              >
                <SupplierLineTable {...SupplierLineTableProps} />
              </Tabs.TabPane>
              {(header.sourceMethod && header.sourceMethod === 'OPEN') ||
              header.sourceMethod === 'ALL_OPEN' ? (
                <Tabs.TabPane
                  tab={intl.get(`${promptCode}.view.tab.tenderNotice`).d('招标公告')}
                  key="tenderNotice"
                  forceRender
                >
                  <TenderNoticeForm {...TenderNoticeProps} />
                </Tabs.TabPane>
              ) : (
                ''
              )}
            </Tabs>
          </Spin>
          <ItemLineTable {...ItemLineTableProps} />
        </Content>

        <Modal
          visible={editBidMembersFlag}
          width={820}
          title={
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>{intl.get(`${promptCode}.view.modal.title.bidMembers`).d('招标小组')}</span>
            </div>
          }
          footer={null}
          onCancel={this.handleMembersCancel}
        >
          <Table
            bordered
            rowKey="bidMemberId"
            loading={fetchBidMembersLoading}
            columns={columnsBidMember}
            scroll={{ x: scrollX }}
            pagination={false}
            dataSource={bidMembersList}
          />
        </Modal>
        <ScoringElementModal {...scoringElementProps} />
      </React.Fragment>
    );
  }
}
