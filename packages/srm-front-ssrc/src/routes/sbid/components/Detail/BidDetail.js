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
import { getActiveTabKey } from 'utils/menuTab';
import withCustomize from 'srm-front-cuz/lib/h0Customize';

import formatterCollections from 'utils/intl/formatterCollections';
import Upload from 'srm-front-boot/lib/components/Upload';
import intl from 'utils/intl';
import Checkbox from 'components/Checkbox';
import {
  FORM_COL_3_LAYOUT,
  EDIT_FORM_ITEM_LAYOUT,
  EDIT_FORM_ROW_LAYOUT,
  FORM_COL_2_LAYOUT,
  EDIT_FORM_ITEM_LAYOUT_COL_2,
} from 'utils/constants';
import { Header, Content } from 'components/Page';
import { yesOrNoRender } from 'utils/renderer';
import { phoneRender, numberSeparatorRender } from '@/utils/renderer';
import { PRIVATE_BUCKET } from '_utils/config';

import PretrialPanelModal from '@/routes/components/PretrialPanelModal/index';
import SSU from '@/routes/components/SessionStorageUrl';
import MatterDetail from '@/routes/components/MatterDetail/MatterDetail';
import common from '@/routes/sbid/common.less';
import ItemLineTable from './ItemLineTable';
import ProfessionalTable from './ProfessionalTable';
import ScoringElementsTable from './ScoringElementsTable';
import SupplierLineTable from './SupplierLineTable';
import ScoringElementModal from './ScoringElementModal';
import TenderNoticeForm from './TenderNoticeForm';

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
@formatterCollections({
  code: ['ssrc.bidHall', 'ssrc.bidTask', 'ssrc.inquiryHall', 'ssrc.common', 'component.docFlow'],
})
@withCustomize({
  unitCode: [
    'SSRC.BID_HALL_DETAIL.ITEM_LINE_TAB',
    'SSRC.BID_HALL_DETAIL.HEADER',
    'SSRC.BID_HALL_DETAIL.ITEM_LINE',
    'SSRC.BID_HALL_DETAIL.ITEM_LINE_NONE',
    'SSRC.BID_HALL_DETAIL.OTHER.INFO',
  ],
})
export default class Detail extends Component {
  constructor(props) {
    super(props);
    this.ItemLineTable = {};

    const {
      backRecommend = '',
      typeName = '',
      bidTask = '',
      sourcePage = null,
      subjectMatterRule = '',
    } = querystring.parse(props.location.search.substr(1));

    this.state = {
      sourcePage,
      bidTask, // 判断招标书明细是否由招标作业跳转进入
      backRecommend, // 专家评分跳转标记
      typeName,
      subjectMatterRule, // 标的规则
      sourceMethod: '', // “寻源方式”是“合作伙伴公开”或“全平台公开”，供应商列表Tab页禁用
      editBidMembersFlag: false, // 招标小组
      distributeModalVisible: false, // 物品明细分配供应商
      evaluateAssignModalVisible: false, // 评分要素分配专家modal
      scoringElementVisible: false, // 招标评分细项modal
      pretrialPanelVisible: false, // 预审小组弹框
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
        evaluateExpertList: [],
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
    const { backRecommend, typeName, bidTask, sourcePage = '' } = this.state;
    let backPath;
    const activeTabKey = getActiveTabKey();
    if (
      backRecommend === 'expertDetailToBidHallDetail' ||
      backRecommend === 'recommend' ||
      backRecommend === 'BidEvaluateBidHallDetail'
    ) {
      const key =
        backRecommend === 'recommend'
          ? `sourceRouter+${activeTabKey}`
          : `${backRecommend}+${activeTabKey}`;
      const backPack = JSON.parse(
        sessionStorage.getItem(key) || sessionStorage.getItem('sourceRouter') || '{}'
      ).url;
      if (backPack) {
        backPath = backPack;
      } else {
        backPath = null;
      }
    } else if (typeName === 'examinationDetail') {
      backPath = '/ssrc/qualification-examination/list';
    } else if (bidTask === 'bidTask') {
      backPath = '/ssrc/bid-task/list';
    } else if (sourcePage && sourcePage === 'project-setup') {
      backPath = '/ssrc/project-setup/list'; // 寻源立项
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
    const { subjectMatterRule = '' } = this.state;
    dispatch({
      type: `${modelName}/fetchBidHeaderDetail`,
      payload: {
        organizationId,
        bidHeaderId: params.bidId,
        path,
        customizeUnitCode: 'SSRC.BID_HALL_DETAIL.HEADER,SSRC.BID_HALL_DETAIL.OTHER.INFO',
      },
    });
    dispatch({
      type: `${modelName}/fetchItemLine`,
      payload: {
        organizationId,
        bidHeaderId: params.bidId,
        path,
        customizeUnitCode:
          subjectMatterRule === 'PACK'
            ? 'SSRC.BID_HALL_DETAIL.ITEM_LINE'
            : 'SSRC.BID_HALL_DETAIL.ITEM_LINE_NONE',
      },
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
    } else if (backPath === '/pub/ssrc/bid-hall') {
      dispatch(
        routerRedux.push({
          pathname: `/pub/ssrc/bid-hall/clarification-view/${header.bidHeaderId}/${header.bidNum}/${header.bidTitle}/${header.companyId}/1`,
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
   * 查询物品行报价明细
   */
  // @Bind()
  // handleQuotationDetail(record = {}) {
  //   const {
  //     match: { params },
  //     dispatch,
  //     organizationId,
  //     modelName = 'bidHall',
  //   } = this.props;
  //
  //   const sourceFrom = params.rfxId ? 'RFX' : 'BID';
  //   const { bidLineItemId = null } = record;
  //   dispatch({
  //     type: `${modelName}/fetchItemLineQuotationDetail`,
  //     payload: {
  //       sourceFrom,
  //       organizationId,
  //       rfxLineItemId: bidLineItemId,
  //       rfxHeaderId: params.bidId,
  //     },
  //   });
  //
  //   this.setState({
  //     itemLineQuotationDetailModalVisible: true,
  //   });
  // }

  /**
   * 报价明细model确认
   *
   * @memberof Update
   */
  @Bind()
  sureItemLineQutationDetail() {
    this.cancelItemLineQutationDetail();
  }

  /**
   * 预审小组弹框显隐
   */
  @Bind()
  showPretrialPanel(visible) {
    const {
      dispatch,
      match: { params },
      organizationId,
    } = this.props;
    this.setState({
      pretrialPanelVisible: visible,
    });
    if (visible) {
      dispatch({
        type: 'bidHall/fetchPretrialPanel',
        payload: {
          sourceHeaderId: params.bidId,
          sourceFrom: 'BID',
          organizationId,
        },
      });
    } else {
      dispatch({
        type: 'bidHall/updateState',
        payload: {
          pretrialPanelList: [],
        },
      });
    }
  }

  /**
   * 表单头
   */
  renderHeaderForm() {
    const { modelName = 'bidHall' } = this.props;
    const {
      organizationId,
      customizeForm,
      [modelName]: { header = {} },
      form: { getFieldDecorator },
    } = this.props;
    const formsLayouts = { labelCol: { span: 3 }, wrapperCol: { span: 20 } };

    return customizeForm(
      {
        code: 'SSRC.BID_HALL_DETAIL.HEADER',
        form: this.props.form,
        dataSource: header,
      },
      <Form className="writable-row-custom">
        <Row gutter={48} className="writable-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${promptCode}.model.bidHall.bidNum.`).d('招标编号')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('bidNum', {
                initialValue: header.bidNum,
              })(<span>{header.bidNum}</span>)}
            </FormItem>
          </Col>
          <Col span={16}>
            <FormItem
              label={intl.get(`${promptCode}.model.bidHall.bidTitle`).d('招标事项')}
              {...formsLayouts}
            >
              {getFieldDecorator('bidTitle', {
                initialValue: header.bidTitle,
              })(<span>{header.bidTitle}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="writable-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${promptCode}.model.bidHall.sourcingTemplate`).d('寻源模板')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('templateName', {
                initialValue: header.templateName,
              })(<span>{header.templateName}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${promptCode}.model.bidHall.quotationType`).d('报价方式')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('quotationTypeMeaning', {
                initialValue: header.quotationTypeMeaning,
              })(<span>{header.quotationTypeMeaning}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${promptCode}.model.bidHall.purceOrgName`).d('采购组织名称')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('purOrganizationName', {
                initialValue: header.purOrganizationName,
              })(<span>{header.purOrganizationName}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="writable-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem label={intl.get('ssrc.common.company').d('公司')} {...EDIT_FORM_ITEM_LAYOUT}>
              {getFieldDecorator('companyName', {
                initialValue: header.companyName,
              })(<span>{header.companyName}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${promptCode}.model.bidHall.bidType`).d('招标类别')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('bidTypeMeaning', {
                initialValue: header.bidTypeMeaning,
              })(<span>{header.bidTypeMeaning}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${promptCode}.model.bidHall.sourceMethod`).d('寻源方式')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('sourceMethodMeaning', {
                initialValue: header.sourceMethodMeaning,
              })(<span>{header.sourceMethodMeaning}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="writable-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${promptCode}.model.bidHall.subjectMatterRule`).d('标的规则')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('subjectMatterRuleMeaning', {
                initialValue: header.subjectMatterRuleMeaning,
              })(<span>{header.subjectMatterRuleMeaning}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${promptCode}.model.bidHall.sourceStage`).d('招标阶段')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('sourceStageMeaning', {
                initialValue: header.sourceStageMeaning,
              })(<span>{header.sourceStageMeaning}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${promptCode}.model.bidHall.maxBidNumber`).d('最大中标数')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('maxBidNumber', {
                initialValue: header.maxBidNumber,
              })(<span>{header.maxBidNumber}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="writable-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${promptCode}.model.bidHall.quotationStartDate`).d('投标开始时间')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('quotationStartDate', {
                initialValue: header.quotationStartDate,
              })(<span>{header.quotationStartDate}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${promptCode}.model.bidHall.quotationEndDate`).d('投标截止时间')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('quotationEndDate', {
                initialValue: header.quotationEndDate,
              })(<span>{header.quotationEndDate}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${promptCode}.model.bidHall.bidOpenDate`).d('开标时间')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('bidOpenDate', {
                initialValue: header.bidOpenDate,
              })(<span>{header.bidOpenDate}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="writable-row">
          <Col span={8}>
            <FormItem
              label={intl.get(`${promptCode}.model.bidHall.clarifyEndTime`).d('澄清截止时间')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('clarifyEndTime', {
                initialValue: header.clarifyEndTime,
              })(<span>{header.clarifyEndTime}</span>)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.purchaseAgentName`).d('采购员')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('purchaserName', {
                initialValue: header.purchaserName,
              })(<span>{header.purchaserName}</span>)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label={intl.get(`${promptCode}.model.bidHall.bidMembers`).d('招标小组')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('bidMembers')(
                <a onClick={this.editBidMembers}>
                  {intl.get(`hzero.common.button.view`).d('查看')}
                </a>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="writable-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${promptCode}.model.bidHall.bidTechFile`).d('招标技术文件')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('techAttachmentUuid', {
                initialValue: header.techAttachmentUuid,
              })(
                <Upload
                  bucketName={PRIVATE_BUCKET}
                  bucketDirectory="ssrc-bid-header"
                  attachmentUUID={
                    isEmpty(header.techAttachmentUuid) ? undefined : header.techAttachmentUuid
                  }
                  tenantId={organizationId}
                  icon="download"
                  viewOnly
                  filePreview
                />
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${promptCode}.model.bidHall.bidBusinessFile`).d('招标商务文件')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('businessAttachmentUuid', {
                initialValue: header.businessAttachmentUuid,
              })(
                <Upload
                  bucketName={PRIVATE_BUCKET}
                  bucketDirectory="ssrc-bid-header"
                  attachmentUUID={
                    isEmpty(header.businessAttachmentUuid)
                      ? undefined
                      : header.businessAttachmentUuid
                  }
                  tenantId={organizationId}
                  icon="download"
                  viewOnly
                  filePreview
                />
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${promptCode}.model.bidHall.totalBudget`).d('预算金额')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('totalBudget', {
                initialValue: header.totalBudget,
              })(<span>{numberSeparatorRender(header.totalBudget)}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="writable-row">
          <Col span={8}>
            <FormItem
              label={intl.get(`${promptCode}.model.bidHall.clarification`).d('澄清答疑')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('clarifyAndAnswer', {
                initialValue: null,
              })(
                <a onClick={this.clarificationView}>
                  {intl.get(`hzero.common.button.view`).d('查看')}
                </a>
              )}
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
    const {
      modelName = 'bidHall',
      form,
      customizeForm,
      form: { getFieldDecorator },
    } = this.props;
    const {
      [modelName]: { header = {} },
    } = this.props;

    return customizeForm(
      { code: 'SSRC.BID_HALL_DETAIL.OTHER.INFO', form, dataSource: header },
      <Form className="writable-row-custom">
        <Row gutter={48}>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${promptCode}.model.bidHall.bidPlanName`).d('寻源计划')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('bidPlanLineName', {
                initialValue: header.bidPlanLineName,
              })(<span>{header.bidPlanLineName}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${promptCode}.model.bidHall.projectCode`).d('项目编码')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('projectNum', {
                initialValue: header.projectNum,
              })(<span>{header.projectNum}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${promptCode}.model.bidHall.projectName`).d('项目名称')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('projectName', {
                initialValue: header.projectName,
              })(<span>{header.projectName}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48}>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${promptCode}.model.bidHall.bidLocation`).d('项目地点')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('bidLocation', {
                initialValue: header.bidLocation,
              })(<span>{header.bidLocation}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${promptCode}.model.bidHall.currencyType`).d('币种')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('currencyCode', {
                initialValue: header.currencyCode,
              })(<span>{header.currencyCode}</span>)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label={intl.get('ssrc.bidHall.model.bidHall.allowMuitiCurQuo').d('允许多币种报价')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              <Checkbox
                checked={header.multiCurrencyFlag}
                checkedValue={1}
                unCheckedValue={0}
                disabled
              />
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48}>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${promptCode}.model.bidHall.roundNumber`).d('轮次')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('roundNumber', {
                initialValue: header.roundNumber,
              })(<span>{header.roundNumber}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`hzero.common.components.dataAudit.version`).d('版本')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('versionNumber', {
                initialValue: header.versionNumber,
              })(<span>{header.versionNumber}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`hzero.common.date.creation`).d('创建时间')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('creationDate', {
                initialValue: header.creationDate,
              })(<span>{header.creationDate}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48}>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${promptCode}.model.bidHall.bidFileExpense`).d('招标文件费')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('bidFileExpense', {
                initialValue: header.bidFileExpense,
              })(<span>{numberSeparatorRender(header.bidFileExpense)}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${promptCode}.model.bidHall.bidBond`).d('保证金')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('bidBond', {
                initialValue: header.bidBond,
              })(
                <span>
                  {numberSeparatorRender(header.bidBond) ||
                    intl.get(`${promptCode}.model.bidHall.free`).d('免费')}
                </span>
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${promptCode}.model.bidHall.paymentType`).d('付款方式')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('paymentTypeName', {
                initialValue: header.paymentTypeName,
              })(<span>{header.paymentTypeName}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48}>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${promptCode}.model.bidHall.paymentTerm`).d('付款条款')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('paymentTerm', {
                initialValue: header.paymentTerm,
              })(<span>{header.paymentTerm}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${promptCode}.model.bidHall.bidOpenLocation`).d('开标地点')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('bidOpenLocation', {
                initialValue: header.bidOpenLocation,
              })(<span>{header.bidOpenLocation}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${promptCode}.model.bidHall.purchasingContact`).d('采购联系人')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('purchasingContact', {
                initialValue: header.purName,
              })(<span>{header.purName}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48}>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${promptCode}.model.bidHall.contactPhone`).d('联系人电话')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('contactPhone', {
                initialValue: header.purPhone,
              })(<span>{phoneRender(header.internationalTelCodeMeaning, header.purPhone)}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${promptCode}.model.bidHall.contactMail`).d('联系人邮箱')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('contactMail', {
                initialValue: header.purEmail,
              })(<span>{header.purEmail}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.common.explorationFlag`).d('是否需要现场踏勘')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('explorationFlag', {
                initialValue: header.explorationFlag,
              })(<span>{yesOrNoRender(header.explorationFlag)}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48}>
          {header.explorationFlag ? (
            <Col {...FORM_COL_3_LAYOUT}>
              <FormItem
                label={intl.get(`ssrc.common.explorationDate`).d('踏勘时间')}
                {...EDIT_FORM_ITEM_LAYOUT}
              >
                {getFieldDecorator('explorationDate', {
                  initialValue: header.explorationDate,
                })(<span>{header.explorationDate}</span>)}
              </FormItem>
            </Col>
          ) : (
            ''
          )}
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl
                .get(`ssrc.common.model.common.allowChangePayWayFlag`)
                .d('是否允许供应商修改付款条款&方式')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('allowChangePayWayFlag', {
                initialValue: header.paymentTermFlag,
              })(<span>{yesOrNoRender(header.paymentTermFlag)}</span>)}
            </FormItem>
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
          {/* <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`${promptCode}.model.bidHall.prequalFileExpense`).d('预审文件费')}
              value={header.prequalFileExpense}
            />
          </Col> */}
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
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`${promptCode}.model.bidHall.prequalFile`).d('资格预审文件')}
              value={
                <Upload
                  bucketName={PRIVATE_BUCKET}
                  bucketDirectory="ssrc-rfx-prequal"
                  attachmentUUID={header.prequalAttachmentUuid}
                  tenantId={organizationId}
                  icon="download"
                  viewOnly
                  filePreview
                />
              }
            />
          </Col>
        </Row>
        <Row gutter={48}>
          <Col span={8}>
            <FormItem
              label={intl.get(`ssrc.common.pretrialPanel`).d('预审小组')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              <a onClick={() => this.showPretrialPanel(true)}>
                {intl.get('hzero.common.button.view').d('查看')}
              </a>
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT}>
          <Col {...FORM_COL_2_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.common.qualRequirements`).d('资质要求')}
              {...EDIT_FORM_ITEM_LAYOUT_COL_2}
            >
              <span style={{ marginLeft: '-6px' }}>{header.prequalRemark}</span>
            </FormItem>
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
      customizeTabPane,
      customizeTable,
      fetchbidHallUpdateLoading,
      supplierRecordLoading,
      fetchItemLineLoading,
      fetchBidMembersLoading,
      fetchSupplierLineloading,
      fetchTempelateDetailDataLoading,
      fetchScoringElementLoading,
      fetchExpertAllocationDataLoading,
      fetchEvaluateIndicAssignLoading,
      fetchPretrialPanelLoading,
      [modelName]: {
        header = {},
        itemLine = [],
        supplierData = [],
        supplierLine = [],
        supplierLinePagination = {},
        scoringElement = [],
        bidMembersList = [],
        itemLinePagination = {},
        scoringNoneTempelate = [],
        scoringBusinessTempelate = [],
        scoringTechnologyTempelate = [],
        currentScoringExperts = [],
        evaluateExpertList = [],
      },
      bidHall: { pretrialPanelList = [] },
    } = this.props;

    const {
      subjectMatterRule,
      sourceMethod,
      editBidMembersFlag,
      evaluateAssignModalVisible,
      scoringElementVisible,
      distributeModalVisible,
      pretrialPanelVisible,
    } = this.state;

    // 物品明细
    const ItemLineTableProps = {
      header,
      match,
      dispatch,
      organizationId,
      customizeTabPane,
      customizeTable,
      supplierRecordLoading,
      // handleQuotationDetail: this.handleQuotationDetail,
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
      customizeTable,
      header,
      dispatch,
      organizationId,
      match,
      fetchExpertAllocationDataLoading,
      evaluateExpertList,
    };

    // 评分要素
    const ScoringElementsTableProps = {
      customizeTable,
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

    const pretrialPanelProps = {
      visible: pretrialPanelVisible,
      dataSource: pretrialPanelList,
      loading: fetchPretrialPanelLoading,
      onHideModal: this.showPretrialPanel,
    };

    // 供应商
    const SupplierLineTableProps = {
      dispatch,
      customizeTable,
      organizationId,
      userId,
      companyId: header.companyId,
      match,
      supplierLinePagination,
      fetchbidHallUpdateLoading,
      loading: fetchSupplierLineloading,
      dataSource: supplierLine,
      sourceMethod: sourceMethod || header.sourceMethod,
      onSearch: this.fetchSupplierLine,
    };
    //
    // // 报价详情model props
    // const QuotationDetailModalProps = {
    //   organizationId,
    //   fetchItemLineQuotationDetailLoading,
    //   itemLineQuotationDetail,
    //   cancelItemLineQutationDetail: this.cancelItemLineQutationDetail,
    //   sureItemLineQutationDetail: this.sureItemLineQutationDetail,
    //   itemLineQuotationDetailModalVisible,
    //   isAllQuotation: false,
    // };

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

    const MatterDetailProps = {
      matterDetail: header.matterDetail || '',
    };

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
        render: (_, record) => phoneRender(record.internationalTelCodeMeaning, record.phone),
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
              {header.matterRequireFlag === 1 && (
                <Tabs.TabPane
                  tab={intl.get(`${promptCode}.view.message.tab.matterDetail`).d('寻源事项说明')}
                  key="matterDetail"
                  forceRender
                >
                  <MatterDetail {...MatterDetailProps} />
                </Tabs.TabPane>
              )}
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
        <PretrialPanelModal {...pretrialPanelProps} />
      </React.Fragment>
    );
  }
}
