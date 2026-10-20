/**
 * quotationController - 寻源服务/询报价控制
 * @date: 2018-12-29
 * @author: <baocheng.li@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Fragment, PureComponent } from 'react';
import { routerRedux } from 'dva/router';
import queryString from 'querystring';
import {
  Button,
  Form,
  Row,
  Col,
  Input,
  Collapse,
  Tabs,
  Modal,
  Spin,
  DatePicker,
  InputNumber,
  Icon,
} from 'hzero-ui';
import { DataSet, Icon as C7NIcon, Lov, ModalProvider } from 'choerodon-ui/pro';
import { Bind, Debounce } from 'lodash-decorators';
import { isUndefined, isEmpty } from 'lodash';
import { Header, Content } from 'components/Page';
import Upload from 'srm-front-boot/lib/components/Upload';
import intl from 'utils/intl';
import moment from 'moment';
import DynamicButtons from '_components/DynamicButtons';
import { yesOrNoRender } from 'utils/renderer';
import { DEFAULT_DATETIME_FORMAT, FORM_COL_3_LAYOUT, EDIT_FORM_ITEM_LAYOUT } from 'utils/constants';
import QuotationDirectLable from '@/routes/ssrc/components/QuotationDirectLable';
import classnames from 'classnames';
import { PRIVATE_BUCKET } from '_utils/config';
import { queryMapIdpValue } from 'services/api';
import { getActiveTabKey } from 'utils/menuTab';
import {
  filterNullValueObject,
  getDateTimeFormat,
  getEditTableData,
  disabledTime,
  getResponse,
  getCurrentTenant,
} from 'utils/utils';
import notification from 'utils/notification';
// import { Button as PermissionButton } from 'components/Permission';
import renderBiddingOtherInfo from '@/routes/ssrc/components/renderBiddingOtherInfo';
import FixExpertScore from '@/routes/ssrc/components/FixExpertScore';
import { numberSeparatorRender } from '@/utils/renderer';
import {
  fetchExpertAllocationData,
  saveAllScoringTemplate,
  queryReviewElements,
} from '@/services/bidHallService';
import { saveInitialReviewLines, fetchConfigSheet } from '@/services/inquiryHallNewService';
import terminationImg from '@/assets/termination-quotation.png';
import common from '@/routes/ssrc/common.less';
import ItemDetailsTable from './ItemDetailsTable';
import SupplierListTable from './SupplierListTable';
import AddSupplier from './AddSupplier';
import styles from './index.less';
import PriceFloatingDrawer from './PriceFloatingDrawer';
import OperationRecord from '../../components/OperationRecord';
import Attachment from '../../components/Attachment';
import ScoringElementModal from '../../components/ScoringElementModal';
import InquiryGroupModal from './InquiryGroupModal';
import BidOpenerCartridge from './BidOpenerCartridge';
import TimeControl from './TimeControl';
import ExpertTable from './ExpertTable';
import ExpertTableDS from './ExpertTableDS';
import InitialReviewTable from './InitialReviewTable'; // 初步评审 - 符合性检查
import TimeControlView from './TimerControlViewl';

import { InitialReviewDS, ReviewReferenceTemplateDS } from './InitialReviewDS';

import { withStandardCompEnhancer } from './standardCompEnhancerCreator';

const { TextArea } = Input;
const { Panel } = Collapse;

const FormItem = Form.Item;
const UEDDisplayFormItem = (props) => {
  const { label, value } = props;
  return (
    <FormItem label={label} {...EDIT_FORM_ITEM_LAYOUT}>
      {value}
    </FormItem>
  );
};

const formLayout = {
  labelCol: { span: 9 },
  wrapperCol: { span: 15 },
};

const promptCode = 'ssrc.quoController';
class Detail extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      operationRecordModalVisible: false, // 操作记录模态框
      previewVisible: false,
      previewFileName: '',
      previewImage: '',
      viewOnly: true, // 是否只读标识位
      bucketDirectory: 'ssrc-rfx-rfxheader',
      adjustTimeModalVisible: false,
      addSupplierModalVisible: false,
      controllerModalVisible: false,
      type: 0,
      priceFloatingVisible: false, // 价格浮动模态框
      scoringElementVisible: false, // 评分要素定义模态框可见
      collapseKeys: ['timeAdjustment', 'baseInfos', 'otherInfos'], // 打开的折叠面板key
      itemLineQuotationDetailModalVisible: false, // 物品行报价明细弹窗
      inquiryGroupVisibleFlag: false, // 寻源小组是否可见
      quotationDetailVisible: false, // 报价明细
      itemLineRecord: {}, // 物品行记录
      bidholderVisible: false, // 开标人是否可见
      fixExpertInfoVisible: false, // 修改专家评分的信息是否可见
      openTimeControlFlag: false, // 是否自动打开时间调整
      exportVisibleStatusList: [
        'IN_PREQUAL',
        'PENDING_PREQUAL',
        'PREQUAL_CUTOFF',
        'NOT_START',
        'IN_QUOTATION',
        'LACK_QUOTED',
        'OPEN_BID_PENDING',
      ],
      code: {},
      saveReviewLoading: false,
      configSheet: {}, // 配置表配置
    };
  }

  NoneExpertTableDS = new DataSet(ExpertTableDS());

  AllExpertTableDS = new DataSet(ExpertTableDS());

  InitialReviewDS = new DataSet(InitialReviewDS());

  ReviewReferenceTemplateDS = new DataSet(ReviewReferenceTemplateDS());

  /**
   * render()调用后获取数据
   */
  componentDidMount() {
    const {
      location: { pathname },
    } = this.props;
    const isPub = pathname && pathname.includes('/pub'); // 工作流审批标识
    if (!isPub) {
      this.handleSearch(true);
      this.initDS();
      this.initLovCode();
      this.fetchConfig();
    }
  }

  initLovCode() {
    const code = {
      benchmarkPriceMethod: 'SSRC.BENCHMARK_PRICE_METHOD', // 基准价计算方法
      formula: 'SSRC.INDIC_FORMULA', // 价格计算公式
    };

    queryMapIdpValue(code).then((res) => {
      const result = getResponse(res);
      if (!res) {
        return;
      }
      this.setState({
        code: result,
      });
    });
  }

  @Bind()
  initDS() {
    const {
      match: { params = {} },
      quotationController: { header = {} },
    } = this.props;
    const { organizationId = null, userId = null } = this.props;
    const commons = {
      rfxHeaderId: params.rfxId,
      organizationId,
      userId,
    };
    if (header.bidRuleType === 'NONE') {
      this.NoneExpertTableDS.setQueryParameter('commonProps', {
        ...commons,
      });
    } else {
      this.AllExpertTableDS.setQueryParameter('commonProps', {
        ...commons,
      });
    }
    this.InitialReviewDS.setQueryParameter('commonProps', {
      ...commons,
    });
    this.ReviewReferenceTemplateDS.create({}); // 用于绑定符合性检查, 引用模板的ds
  }

  componentWillUnmount() {
    this.props.dispatch({
      type: 'quotationController/updateState',
      payload: {
        header: {},
        itemLine: [],
        supplierLine: [],
      },
    });
  }

  /**
   * 打开操作记录模态框
   */
  @Bind()
  playView() {
    this.setState({
      operationRecordModalVisible: true,
    });
  }

  /**
   * onCollapseChange - 折叠面板onChange
   * @param {Array<string>} collapseKeys - Panels key
   */
  @Bind()
  onCollapseChange(collapseKeys) {
    this.setState({
      collapseKeys,
    });
  }

  /**
   * hideOperationRecord - 关闭操作记录弹窗
   */
  @Bind()
  hideOperationRecord() {
    this.setState({ operationRecordModalVisible: false });
    this.props.dispatch({
      type: 'quotationController/updateState',
      payload: {
        operationPagination: {},
        operationData: [],
      },
    });
  }

  /**
   * 整体所有查询
   * @param {*} mountFlag 是否是第一次挂载
   */
  @Bind()
  handleSearch(mountFlag) {
    const { dispatch, organizationId, match } = this.props;
    const { rfxId } = match.params;
    const { path = null } = match;
    // 询价单表头数据
    dispatch({
      type: 'quotationController/fetchInquiryHeaderDetail',
      payload: {
        organizationId,
        rfxHeaderId: rfxId,
        path,
        customizeUnitCode:
          'SSRC.QUOTATION_CONTROLLER_DETAIL.HEADER,SSRC.QUOTATION_CONTROLLER_DETAIL.OTHER,SSRC.QUOTATION_CONTROLLER_DETAIL.OTHER.INFO',
      },
    }).then((res) => {
      if (res) {
        if (mountFlag) {
          const {
            location: { search = {} },
          } = this.props;
          const { openTimeControlFlag } = queryString.parse(search.substr(1));
          if (openTimeControlFlag) {
            this.setState({
              openTimeControlFlag: true,
            });
          }
        }
        if (res.bidRuleType === 'NONE') {
          this.AllExpertTableDS.setQueryParameter('header', res);
        } else {
          this.NoneExpertTableDS.setQueryParameter('header', res);
        }
      }
    });
    // 物料行数据
    dispatch({
      type: 'quotationController/fetchItemLine',
      payload: {
        organizationId,
        rfxHeaderId: rfxId,
        customizeUnitCode: 'SSRC.QUOTATION_CONTROLLER_DETAIL.ITEM_LINE',
      },
    });
    // 供应商数据
    dispatch({
      type: 'quotationController/fetchSupplierLine',
      payload: {
        organizationId,
        rfxHeaderId: rfxId,
        customizeUnitCode: 'SSRC.QUOTATION_CONTROLLER_DETAIL.SUPPLIERLIST',
      },
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
      type: 'quotationController/fetchItemLine',
      payload: {
        page,
        organizationId,
        rfxHeaderId: params.rfxId,
      },
    });
  }

  /**
   * 编辑-打开评分要素定义模态框
   */
  @Bind()
  showScoringElement(header) {
    this.setState({
      scoringElementVisible: true,
    });
    this.fetchScoringElementData(header);
  }

  /**
   * 打开阶梯报价模态框
   */
  @Bind()
  viewLadderLevelModal(record = {}) {
    const { itemCode, itemName, supplierCompanyName, rfxLineItemId, quotationLineStatus } = record;
    this.setState({
      viewLadderLevelVisible: true,
      LadderLevelHeaderData: {
        itemCode,
        itemName,
        rfxLineItemId,
        supplierCompanyName,
        quotationLineStatus,
      },
    });
    const { dispatch, organizationId } = this.props;
    dispatch({
      type: 'queryRfq/fetchLadderLevelyTable',
      payload: { rfxLineItemId, organizationId },
    });
  }

  /**
   * hideLadderLevelModal - 关闭阶梯报价弹窗
   */
  @Bind()
  hideLadderLevelModal() {
    this.setState({ viewLadderLevelVisible: false });
    this.props.dispatch({
      type: 'queryRfq/updateState',
      payload: {
        quotaLadderLevelData: [],
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
      type: 'quotationController/supplierRecord',
      payload: {
        organizationId,
        itemIds,
        rfxHeaderId: params.rfxId,
        customizeUnitCode: 'SSRC.QUOTATION_CONTROLLER_DETAIL.ITEM_FILTER_SUPPLIER',
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
      organizationId,
    } = this.props;
    dispatch({
      type: 'quotationController/fetchSupplierLine',
      payload: {
        page,
        organizationId,
        rfxHeaderId: params.rfxId,
      },
    });
  }

  /**
   * 表单头
   */
  renderHeaderForm(dataSource) {
    const { form = {}, customizeForm, remote } = this.props;
    const { getFieldDecorator } = form;
    const renderProps = {
      dataSource,
      form,
    };
    return customizeForm(
      {
        code: 'SSRC.QUOTATION_CONTROLLER_DETAIL.HEADER',
        form,
        dataSource,
        readOnly: true,
      },
      <Form>
        <Row gutter={48} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`${promptCode}.model.quoController.RFxNo.`).d('RFx单号')}
              {...formLayout}
            >
              {getFieldDecorator('rfxNum', {
                initialValue: dataSource.rfxNum,
              })(<span>{dataSource.rfxNum}</span>)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`${promptCode}.model.quoController.sourcingTemplate`).d('寻源模板')}
              {...formLayout}
            >
              {getFieldDecorator('templateId', {
                initialValue: dataSource.templateId,
              })(<span>{dataSource.templateName}</span>)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`${promptCode}.model.quoController.sourcingCategory`).d('寻源类别')}
              {...formLayout}
            >
              {getFieldDecorator('sourceCategory', {
                initialValue: dataSource.sourceCategory,
              })(<span>{dataSource.sourceCategoryMeaning}</span>)}
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={48} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`${promptCode}.model.quoController.purchOrgName`).d('采购组织名称')}
              {...formLayout}
            >
              {getFieldDecorator('purOrganizationId', {
                initialValue: dataSource.purOrganizationId,
              })(<span>{dataSource.purOrganizationName}</span>)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item label={intl.get('ssrc.common.company').d('公司')} {...formLayout}>
              {getFieldDecorator('companyName', {
                initialValue: dataSource.companyName,
              })(<span>{dataSource.companyName}</span>)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`${promptCode}.model.quoController.createdUnitName`).d('创建人部门')}
              {...formLayout}
            >
              {getFieldDecorator('createdUnitName', {
                initialValue: dataSource.createdUnitName,
              })(<span>{dataSource.createdUnitName}</span>)}
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={48} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`${promptCode}.model.quoController.sourcingApproach`).d('寻源方式')}
              {...formLayout}
            >
              {getFieldDecorator('sourceMethod', {
                initialValue: dataSource.sourceMethod,
              })(<span>{dataSource.sourceMethodMeaning}</span>)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`${promptCode}.model.quoController.quotationType`).d('报价方式')}
              {...formLayout}
            >
              {getFieldDecorator('quotationType', {
                initialValue: dataSource.quotationType,
              })(<span>{dataSource.quotationTypeMeaning}</span>)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item label={<QuotationDirectLable />} {...formLayout}>
              {getFieldDecorator('auctionDirection', {
                initialValue: dataSource.auctionDirection,
              })(<span>{dataSource.auctionDirectionMeaning}</span>)}
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={48} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`${promptCode}.model.quoController.budgetAmount`).d('预算金额')}
              {...formLayout}
            >
              {getFieldDecorator('budgetAmount', {
                initialValue: dataSource.budgetAmount,
              })(<span>{numberSeparatorRender(dataSource.budgetAmount)}</span>)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`${promptCode}.model.quoController.currency`).d('币种')}
              {...formLayout}
            >
              {getFieldDecorator('currencyCode', {
                initialValue: dataSource.currencyCode,
              })(<span>{dataSource.currencyCode}</span>)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`${promptCode}.model.quoController.creationDate`).d('创建时间')}
              {...formLayout}
            >
              {getFieldDecorator('creationDate', {
                initialValue: dataSource.creationDate,
              })(<span>{dataSource.creationDate}</span>)}
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={48} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.purchaseAgentName`).d('采购员')}
              {...formLayout}
            >
              {getFieldDecorator('purchaserId', {
                initialValue: dataSource.purchaserId,
              })(<span>{dataSource.purchaserName}</span>)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`${promptCode}.model.quoController.remark`).d('备注')}
              {...formLayout}
            >
              {getFieldDecorator('rfxRemark', {
                initialValue: dataSource.rfxRemark,
              })(<span>{dataSource.rfxRemark}</span>)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`ssrc.common.model.common.documentCreationDate`).d('单据创建时间')}
              {...formLayout}
            >
              {getFieldDecorator('sourceCreationDate', {
                initialValue: dataSource.sourceCreationDate,
              })(<span>{dataSource.sourceCreationDate}</span>)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            {remote
              ? remote.render('SSRC_QUOTATION_CONTROLLER_DETAIL_QUESTION_TIME', <></>, renderProps)
              : null}
          </Col>
        </Row>
      </Form>
    );
  }

  /**
   * 竞价规则
   */
  renderBiddingRulesForm(tempRfxHeaderDetails) {
    const dataSource = tempRfxHeaderDetails;
    const day = Math.floor(tempRfxHeaderDetails.quotationRunningDuration / 1440);
    const remainder = tempRfxHeaderDetails.quotationRunningDuration % (24 * 60);
    const hour = Math.floor(remainder / 60);
    const minute = remainder % 60;
    // const hour =
    //   day > 0
    //     ? Math.floor((tempRfxHeaderDetails.quotationRunningDuration - day * 1440) / 60)
    //     : Math.floor(tempRfxHeaderDetails.quotationRunningDuration / 60);
    // const minute =
    //   hour > 0
    //     ? Math.floor(tempRfxHeaderDetails.quotationRunningDuration - day * 1440 - hour * 60)
    //     : tempRfxHeaderDetails.quotationRunningDuration;
    return (
      <Form>
        <Row gutter={48} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`${promptCode}.model.quoController.quotationOrderType`).d('报价次序')}
              value={dataSource.quotationOrderTypeMeaning}
            />
          </Col>
          <Col span={8}>
            <FormItem
              label={intl.get(`${promptCode}.model.quoController.quoRunTime`).d('竞价运行时间')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {day}
              {intl.get('hzero.common.date.unit.day').d('天')}
              {hour}
              {intl.get('hzero.common.date.unit.hours').d('小时')}
              {minute}
              {intl.get('hzero.common.date.unit.minutes').d('分钟')}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label={intl
                .get(`${promptCode}.model.quoController.quotationInterval`)
                .d('报价间隔时间')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {dataSource.quotationInterval}
              {intl.get('hzero.common.date.unit.minutes').d('分钟')}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`${promptCode}.model.quoController.auctionRule`).d('竞价规则')}
              value={dataSource.auctionRuleMeaning}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`${promptCode}.model.quoController.autoDeferFlag`).d('启用自动延时')}
              value={yesOrNoRender(dataSource.autoDeferFlag)}
            />
          </Col>
          <Col span={8}>
            <FormItem
              label={intl.get(`${promptCode}.model.quoController.autoDeferDuration`).d('延时时长')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {dataSource.autoDeferDuration}
              {intl.get('hzero.common.date.unit.minutes').d('分钟')}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`${promptCode}.model.quoController.openRule`).d('公开规则')}
              value={dataSource.openRuleMeaning}
            />
          </Col>
        </Row>
      </Form>
    );
  }

  /**
   * 资格预审
   */
  renderPreQualificationForm(header) {
    const { organizationId } = this.props;
    return (
      <Form>
        <Row gutter={48} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl
                .get(`${promptCode}.model.quoController.prequalEndDate`)
                .d('预审申请截止时间')}
              value={header.prequalEndDate}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`${promptCode}.model.quoController.reviewMethod`).d('审查方式')}
              value={header.reviewMethodMeaning}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`${promptCode}.model.quoController.qualifiedLimit`).d('合格上限')}
              value={header.qualifiedLimit}
            />
          </Col>
        </Row>
        <Row gutter={48} className="read-row">
          {/* <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`${promptCode}.model.quoController.fileFreeFlag`).d('预审文件免费')}
              value={yesOrNoRender(header.fileFreeFlag)}
            />
          </Col> */}
          {/* <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl
                .get(`${promptCode}.model.quoController.prequalFileExpense`)
                .d('预审文件费')}
              value={header.fileFreeFlag === 0 ? header.prequalFileExpense : 0}
            />
          </Col> */}
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`${promptCode}.model.quoController.prequalUser`).d('审查员')}
              value={header.realName}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl
                .get(`${promptCode}.model.quoController.prequalLocation`)
                .d('申请提交地点')}
              value={header.prequalLocation}
            />
          </Col>
          <Col span={8}>
            <FormItem
              label={intl
                .get(`${promptCode}.model.quoController.enableScoreFlag`)
                .d('启用评分细项')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {yesOrNoRender(header.enableScoreFlag)}
              {header.enableScoreFlag ? (
                <span style={{ marginLeft: 10 }}>
                  <a onClick={() => this.showScoringElement(header)}>
                    {intl.get('hzero.common.button.view').d('查看')}
                  </a>
                </span>
              ) : null}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl
                .get(`${promptCode}.model.quoController.prequalAttachment`)
                .d('资格预审文件')}
              value={
                <Upload
                  filePreview
                  bucketName={PRIVATE_BUCKET}
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
              label={intl.get(`${promptCode}.model.queryRfq.prequalRemark`).d('资格预审备注')}
              value={header.prequalRemark}
            />
          </Col>
        </Row>
        {/* <Row gutter={48} className="read-row">
          <Col span={24}>
            <Row>
              <Col span={3}>
                {intl.get(`${promptCode}.model.quoController.prequalRemark`).d('资格预审备注')}
              </Col>
              <Col span={21} style={{ marginLeft: '-12px' }}>
                <pre className="remark-context">{header.prequalRemark}</pre>
              </Col>
            </Row>
          </Col>
        </Row> */}
      </Form>
    );
  }

  /**
   * 暂停 关闭 开启确认框
   * showQuotationControllModal
   */
  showQuotationControllModal(type) {
    this.setState({ controllerModalVisible: true });
    if (type === 1) {
      this.setState({
        type: 1,
      });
    } else if (type === 2) {
      this.setState({
        type: 2,
      });
    } else if (type === 3) {
      this.setState({
        type: 3,
      });
    } else if (type === 4) {
      this.setState({
        type: 4,
      });
    }
  }

  /**
   * 开启-按钮
   * handleOpen
   */
  handleOpen() {
    const {
      organizationId,
      dispatch,
      match: {
        params: { rfxId },
      },
    } = this.props;
    const { validateFields } = this.props.form;
    const field = '';
    const remark = '';
    Modal.confirm({
      content: intl.get('ssrc.quoController.view.message.confirm.open').d('确定开启吗?'),
      okText: intl.get('hzero.common.button.ok').d('确定'),
      cancelText: intl.get('hzero.common.button.cancel').d('取消'),
      onOk: () => {
        validateFields([`${field}`], (err) => {
          if (!err) {
            dispatch({
              type: 'quotationController/resume',
              payload: {
                organizationId,
                rfxHeaderIds: [rfxId],
                type: 3,
                remark,
              },
            }).then((res) => {
              if (res) {
                notification.success();
                this.handleSearch();
              }
            });
          }
        });
      },
    });
  }

  /**
   * hideControllModal
   */
  @Bind()
  hideControllModal() {
    this.setState({ controllerModalVisible: false });
  }

  /**
   * renderChildren
   * 渲染开启 关闭 暂停确定框
   */
  renderChildren(type) {
    const { getFieldDecorator } = this.props.form;
    let content;
    if (type === 1) {
      content = (
        <FormItem
          label={intl.get(`${promptCode}.model.quoController.pauseReason`).d('暂停理由')}
          {...formLayout}
          className={styles.explainStyle}
        >
          {getFieldDecorator('pauseReason', {
            rules: [
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get(`${promptCode}.model.quoController.pauseReason`).d('暂停理由'),
                }),
              },
            ],
          })(<TextArea style={{ marginTop: '10px' }} autosize={{ minRows: 3, maxRows: 6 }} />)}
        </FormItem>
      );
    } else if (type === 2) {
      content = (
        <FormItem
          label={intl.get(`${promptCode}.model.quoController.closeReason`).d('关闭理由')}
          {...formLayout}
          className={styles.explainStyle}
        >
          {getFieldDecorator('closeReason', {
            rules: [
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get(`${promptCode}.model.quoController.closeReason`).d('关闭理由'),
                }),
              },
            ],
          })(<TextArea style={{ marginTop: '10px' }} autosize={{ minRows: 3, maxRows: 6 }} />)}
        </FormItem>
      );
    } else if (type === 3) {
      content = (
        <div style={{ textAlign: 'center', fontSize: '15px', fontWeight: 500 }}>
          {intl.get(`${promptCode}.view.message.confirm.open`).d('确定开启吗?')}
        </div>
      );
    } else if (type === 4) {
      content = (
        <FormItem
          label={intl.get(`${promptCode}.model.quoController.overReason`).d('结束理由')}
          {...formLayout}
          className={styles.explainStyle}
        >
          {getFieldDecorator('overReason', {
            rules: [
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get(`${promptCode}.model.quoController.overReason`).d('结束理由'),
                }),
              },
            ],
          })(<TextArea style={{ marginTop: '10px' }} autosize={{ minRows: 3, maxRows: 6 }} />)}
        </FormItem>
      );
    }
    return content;
  }

  /**
   * 暂停 关闭 开启询报价
   */
  quotationControll(type) {
    const {
      // inquiryHall: { stageData = [] },
      organizationId,
      dispatch,
      match: {
        params: { rfxId },
      },
    } = this.props;
    const { getFieldValue, validateFields } = this.props.form;
    // const currentProgress = stageData.filter(s => s.nodeFlag === 0);
    // const [{ stopStatus }] = currentProgress;
    let opeType;
    let remark;
    let field;
    if (type === 1) {
      opeType = 'quotationController/pause';
      field = 'pauseReason';
      remark = getFieldValue('pauseReason');
      // if (stopStatus === 'PAUSED' && stopStatus === 'CLOSED') {
      //   return;
      // }
    } else if (type === 2) {
      opeType = 'quotationController/close';
      field = 'closeReason';
      remark = getFieldValue('closeReason');
      // if (stopStatus === 'CLOSED') {
      //   return;
      // }
    } else if (type === 3) {
      opeType = 'quotationController/resume';
      field = '';
      remark = '';
      // if (stopStatus !== 'PAUSED') {
      //   return;
      // }
    } else if (type === 4) {
      opeType = 'quotationController/over';
      field = 'overReason';
      remark = getFieldValue('overReason');
    }
    validateFields([`${field}`], (err) => {
      if (!err) {
        dispatch({
          type: opeType,
          payload: {
            organizationId,
            rfxHeaderIds: [rfxId],
            type,
            remark,
          },
        }).then((res) => {
          if (res) {
            notification.success();
            this.handleSearch();
          }
        });
        this.setState({ controllerModalVisible: false });
      }
    });
  }

  // /**
  //  * 显示时间调整弹窗
  //  */
  // @Bind()
  // showAdjustTimeModal() {
  //   this.setState({
  //     adjustTimeModalVisible: true,
  //   });
  // }

  /**
   * 隐藏调整弹窗
   */
  @Bind()
  hideAdjustTimeModal() {
    const { resetFields } = this.props.form;
    resetFields(['quotationStartDate', 'quotationEndDate', 'timeAdjustedRemark']);
    this.setState({
      adjustTimeModalVisible: false,
    });
  }

  /**
   * 调整报价时间
   */
  @Bind()
  handleAdjustTime() {
    const {
      dispatch,
      organizationId,
      match: { params },
      quotationController: {
        header: {
          objectVersionNumber,
          bargainStatus,
          bargainClosedFlag,
          quotationEndDate,
          quotationEndDateChangeFlag,
          currentQuotationRound,
          roundHeaderDates,
          tenantId,
        },
      },
    } = this.props;
    const { getFieldsValue, getFieldValue, validateFields } = this.props.form;

    const adjustQuotationTime = (values = {}) => {
      const filterValues = filterNullValueObject(values);
      let day;
      let hour;
      let minute;
      const currentRoundHeaderDates =
        roundHeaderDates && roundHeaderDates.length
          ? roundHeaderDates.map((item) => {
              const roundQuotationStartDate =
                values[`roundQuotationStartDate${item.quotationRound}`] &&
                moment(values[`roundQuotationStartDate${item.quotationRound}`]).format(
                  DEFAULT_DATETIME_FORMAT
                );
              const roundQuotationEndDate =
                values[`roundQuotationEndDate${item.quotationRound}`] &&
                moment(values[`roundQuotationEndDate${item.quotationRound}`]).format(
                  DEFAULT_DATETIME_FORMAT
                );
              return {
                ...item,
                autoFlag: null,
                roundQuotationStartDate,
                roundQuotationEndDate,
              };
            })
          : [];
      if (isUndefined(getFieldValue('day'))) {
        day = 0;
      } else {
        day = parseInt(getFieldValue('day'), 10);
      }
      if (isUndefined(getFieldValue('hour'))) {
        hour = 0;
      } else {
        hour = parseInt(getFieldValue('hour'), 10);
      }
      if (isUndefined(getFieldValue('minute'))) {
        minute = 0;
      } else {
        minute = parseFloat(getFieldValue('minute'));
      }
      const quotationRunningDuration = day * 1440 + hour * 60 + minute;
      const result = filterNullValueObject(
        getFieldsValue([
          'quotationStartDates',
          'quotationEndDates',
          'quotationStartDate',
          'quotationEndDate',
          'bargainEndDate',
          'prequalEndDate',
          'roundQuotationEndDate',
          'quotationInterval',
          'day',
          'hour',
          'minute',
          'estimatedStartTime',
        ])
      );
      const isGo = Object.keys(result);
      if (isGo.length > 0) {
        validateFields(
          ['timeAdjustedRemark', 'day', 'hour', 'minute', 'quotationInterval'],
          (err) => {
            if (!err) {
              dispatch({
                type: 'quotationController/handleAdjustTime',
                payload: {
                  ...filterValues,
                  quotationStartDate:
                    filterValues.quotationStartDates &&
                    filterValues.quotationStartDates.format(DEFAULT_DATETIME_FORMAT),
                  quotationEndDate:
                    quotationEndDateChangeFlag === 1
                      ? filterValues.quotationEndDates &&
                        moment(filterValues.quotationEndDates).format(DEFAULT_DATETIME_FORMAT)
                      : bargainStatus === 'BARGAIN_ONLINE' && bargainClosedFlag === 0
                      ? quotationEndDate
                      : filterValues.quotationEndDates &&
                        moment(filterValues.quotationEndDates).format(DEFAULT_DATETIME_FORMAT),
                  bargainEndDate:
                    filterValues.bargainEndDate &&
                    moment(filterValues.bargainEndDate).format(DEFAULT_DATETIME_FORMAT),
                  prequalEndDate:
                    filterValues.prequalEndDate &&
                    moment(filterValues.prequalEndDate).format(DEFAULT_DATETIME_FORMAT),
                  roundQuotationEndDate:
                    filterValues.roundQuotationEndDate &&
                    moment(filterValues.roundQuotationEndDate).format(DEFAULT_DATETIME_FORMAT),
                  estimatedStartTime:
                    filterValues.estimatedStartTime &&
                    moment(filterValues.estimatedStartTime).format(DEFAULT_DATETIME_FORMAT),
                  organizationId,
                  objectVersionNumber,
                  quotationRunningDuration,
                  rfxHeaderId: params.rfxId,
                  quotationEndDateChangeFlag,
                  currentQuotationRound,
                  roundHeaderDates: currentRoundHeaderDates,
                  tenantId,
                },
              }).then((res) => {
                if (res) {
                  notification.success();
                  this.setState({ adjustTimeModalVisible: false });
                  this.handleSearch();
                }
              });
            } else {
              notification.warning({
                message: intl
                  .get(`${promptCode}.view.quoController.inputAdjustmentTime`)
                  .d('请至少输入一种需要调整的时间'),
              });
            }
          }
        );
      }
    };

    validateFields((errs, values) => {
      if (errs) {
        return;
      }

      adjustQuotationTime(values);
    });
  }

  /**
   * 渲染时间调整Modal的children
   */
  renderAdjustTimeChildren() {
    const {
      quotationController: { header = {} },
      fetchInquiryHallUpdateLoading,
      fetchItemLineLoading,
      fetchSupplierLineLoading,
    } = this.props;
    const {
      sourceCategory,
      quotationInterval,
      quotationRunningDuration,
      quotationOrderType,
      roundHeaderStatus,
      roundHeaderDates = [],
      currentQuotationRound,
      fastBidding,
    } = header;
    const loading =
      fetchInquiryHallUpdateLoading || fetchItemLineLoading || fetchSupplierLineLoading;
    const curTime = new Date().getTime();
    // 为解决IE浏览器new Date()函数兼容处理
    const iePrequalEndDate = header.prequalEndDate && header.prequalEndDate.replace(/-/g, '/');
    const ieQuotationEndDate =
      header.quotationEndDate && header.quotationEndDate.replace(/-/g, '/');
    const ieQuotationStartDate =
      header.quotationStartDate && header.quotationStartDate.replace(/-/g, '/');
    const ieNow = header.now && header.now.replace(/-/g, '/');
    const ieRoundQuotationEndDate =
      header.roundQuotationEndDate && header.roundQuotationEndDate.replace(/-/g, '/');
    const prequalEndDate = new Date(iePrequalEndDate).getTime();
    const quotationEndDate = new Date(ieQuotationEndDate).getTime();
    const quotationStartDate = new Date(ieQuotationStartDate).getTime();
    const nowTime = new Date(ieNow).getTime();
    const roundQuotationEndDate = new Date(ieRoundQuotationEndDate).getTime();
    const { getFieldDecorator, getFieldValue, getFieldsValue } = this.props.form;
    const l = Object.keys(filterNullValueObject(getFieldsValue(['hour', 'minute']))).length;
    const timeObj = {
      marginRight: '9px',
      marginLeft: '30px',
      fontWeight: 800,
      height: '38px',
      lineHeight: '38px',
    };
    const tipTitle = {
      lineHeight: '38px',
      height: '38px',
      color: '#999',
      display: 'inline-block',
    };
    const disableStartTime =
      (sourceCategory === 'RFQ' && nowTime >= quotationStartDate) ||
      (sourceCategory === 'RFA' && nowTime >= quotationStartDate);
    const disabledRunTime =
      sourceCategory === 'RFQ' || (sourceCategory === 'RFA' && nowTime >= quotationStartDate);
    const disabledGapTime =
      sourceCategory === 'RFQ' ||
      (sourceCategory === 'RFA' && nowTime >= quotationStartDate) ||
      quotationOrderType === 'PARALLEL';
    const disabledEndTime = !(
      sourceCategory === 'RFQ' &&
      nowTime >= quotationStartDate &&
      nowTime < quotationEndDate
    );
    const disabledRoundEndTime =
      roundQuotationEndDate &&
      roundQuotationEndDate < nowTime &&
      (roundHeaderStatus === 'ROUND_CHECKING' || roundHeaderStatus === 'ROUND_SCORING');
    const isRequiredRunTime = !disabledRunTime && l === 0;
    const isRequiredGapTime =
      !disabledGapTime && (quotationOrderType === 'SEQUENCE' || quotationOrderType === 'STAGGER');
    const day = Math.floor(quotationRunningDuration / (24 * 60));
    const leave1 = quotationRunningDuration % (24 * 60);
    const hour = Math.floor(leave1 / 60);
    const minute = leave1 % 60;
    const runDateVD = (
      <React.Fragment>
        <Spin spinning={loading}>
          <Row>
            <Col span={6}>
              <FormItem>
                {getFieldDecorator('day', {
                  rules: [
                    {
                      required: isRequiredRunTime,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`${promptCode}.model.quoController.quotationRunTime`)
                          .d('竞价运行时间'),
                      }),
                    },
                  ],
                  initialValue: quotationRunningDuration ? day : '',
                })(<InputNumber min={0} disabled={disabledRunTime} />)}
              </FormItem>
            </Col>
            <Col span={2}>
              <div style={tipTitle}>
                {intl.get(`${promptCode}.model.quoController.day`).d('天')}
              </div>
            </Col>
            <Col span={6}>
              <FormItem>
                {getFieldDecorator('hour', {
                  rules: [
                    {
                      required: isRequiredRunTime,
                      message: ' ',
                    },
                  ],
                  initialValue: quotationRunningDuration ? hour : '',
                })(<InputNumber min={0} max={1000} disabled={disabledRunTime} />)}
              </FormItem>
            </Col>
            <Col span={2}>
              <div style={tipTitle}>
                {intl.get(`${promptCode}.model.quoController.hours`).d('时')}
              </div>
            </Col>
            <Col span={6}>
              <FormItem>
                {getFieldDecorator('minute', {
                  rules: [
                    {
                      required: isRequiredRunTime,
                      message: ' ',
                    },
                  ],
                  initialValue: quotationRunningDuration ? minute : '',
                })(<InputNumber min={0} max={1000} step={0.1} disabled={disabledRunTime} />)}
              </FormItem>
            </Col>
            <Col span={2}>
              <div style={tipTitle}>
                {intl.get(`${promptCode}.model.quoController.minute`).d('分')}
              </div>
            </Col>
          </Row>
        </Spin>
      </React.Fragment>
    );
    const showEstimatedflag =
      fastBidding && (!quotationStartDate || moment().isBefore(header.quotationStartDate));
    return (
      <Form>
        {showEstimatedflag ? (
          <Row>
            <Col span={6}>
              <span style={timeObj}>
                {intl
                  .get(`ssrc.inquiryHall.model.inquiryHall.estimatedStartTime`)
                  .d('预计开始时间')}
                :
              </span>
            </Col>
            <Col span={6}>
              <FormItem>
                {getFieldDecorator('estimatedStartTime', {
                  initialValue:
                    header.estimatedStartTime &&
                    moment(header.estimatedStartTime, 'YYYY-MM-DD HH:mm:ss'),
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`ssrc.inquiryHall.model.inquiryHall.estimatedStartTime`)
                          .d('预计开始时间'),
                      }),
                    },
                  ],
                })(
                  <DatePicker
                    showTime
                    disabledDate={(currentDate) => moment().isAfter(currentDate, 'day')}
                    format={getDateTimeFormat()}
                    placeholder={intl
                      .get(`ssrc.inquiryHall.model.inquiryHall.estimatedStartTime`)
                      .d('预计开始时间')}
                  />
                )}
              </FormItem>
            </Col>
          </Row>
        ) : (
          ''
        )}
        {!currentQuotationRound && !showEstimatedflag ? (
          <Row>
            <Col span={6}>
              <span style={timeObj}>
                {intl.get(`${promptCode}.model.quoController.quotationStartTime`).d('报价开始时间')}
                :
              </span>
            </Col>
            <Col span={6}>
              <FormItem>
                {getFieldDecorator('quotationStartDates', {
                  initialValue: moment(header.quotationStartDate, 'YYYY-MM-DD HH:mm:ss'),
                })(
                  <DatePicker
                    disabled={disableStartTime}
                    showTime
                    disabledDate={(currentDate) =>
                      getFieldValue('quotationEndDate') &&
                      moment(getFieldValue('quotationEndDate')).isBefore(currentDate, 'time')
                    }
                    format={getDateTimeFormat()}
                    placeholder={intl
                      .get(`${promptCode}.model.quoController.quotationStartTime`)
                      .d('报价开始时间')}
                  />
                )}
              </FormItem>
            </Col>
          </Row>
        ) : null}
        {sourceCategory !== 'RFQ' && (
          <Row>
            <Col span={6}>
              {!disabledRunTime && l === 0 && (
                <span style={{ color: '#f5222d', marginLeft: '24px' }}>*</span>
              )}
              <span style={{ ...timeObj, marginLeft: isRequiredRunTime ? '0px' : '30px' }}>
                {intl
                  .get(`${promptCode}.model.quoController.quotRunningDuration`)
                  .d('报价运行时间')}
                :
              </span>
            </Col>
            <Col span={6}>{runDateVD}</Col>
          </Row>
        )}
        {sourceCategory !== 'RFQ' && (
          <Row>
            <Col span={6}>
              {isRequiredGapTime && <span style={{ color: '#f5222d', marginLeft: '24px' }}>*</span>}
              <span style={{ ...timeObj, marginLeft: isRequiredGapTime ? '0px' : '30px' }}>
                {intl.get(`${promptCode}.model.quoController.quotationInterval`).d('报价间隔时间')}:
              </span>
            </Col>
            <Col span={6}>
              <Row>
                <Col span={6}>
                  <FormItem>
                    {getFieldDecorator('quotationInterval', {
                      rules: [
                        {
                          required: isRequiredGapTime,
                        },
                      ],
                      initialValue: quotationInterval,
                    })(<InputNumber min={0} step={0.1} disabled={disabledGapTime} />)}
                  </FormItem>
                </Col>
                <Col span={2}>
                  <div style={tipTitle}>
                    {intl.get(`${promptCode}.model.quoController.minute`).d('分')}
                  </div>
                </Col>
              </Row>
            </Col>
          </Row>
        )}
        {(header.quotationEndDateChangeFlag === 1 ||
          (header.bargainStatus !== 'BARGAIN_ONLINE' &&
            header.bargainClosedFlag !== 0 &&
            nowTime <= quotationEndDate &&
            roundHeaderStatus !== 'ROUND_CHECKING' &&
            roundHeaderStatus !== 'ROUND_SCORING') ||
          header.rfxStatus === 'LACK_QUOTED' ||
          (!header.quotationEndDate &&
            header.bargainStatus !== 'BARGAIN_ONLINE' &&
            header.bargainClosedFlag !== 0 &&
            nowTime > quotationEndDate &&
            header.roundQuotationRule === 'NONE')) &&
          !currentQuotationRound &&
          !showEstimatedflag && (
            <Row>
              <Col span={6}>
                <span style={timeObj}>
                  {intl
                    .get(`${promptCode}.model.quoController.quotationDeadline`)
                    .d('报价截止时间')}
                  :
                </span>
              </Col>
              <Col span={6}>
                <FormItem>
                  {getFieldDecorator('quotationEndDates', {
                    initialValue:
                      header.quotationEndDate !== null
                        ? moment(header.quotationEndDate, 'YYYY-MM-DD HH:mm:ss')
                        : '',
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get(`ssrc.inquiryHall.model.inquiryHall.quotationDeadline`)
                            .d('报价截止时间'),
                        }),
                      },
                    ],
                  })(
                    <DatePicker
                      disabled={
                        (disabledEndTime &&
                          header.rfxStatus !== 'LACK_QUOTED' &&
                          header.quotationEndDateChangeFlag === 0) ||
                        sourceCategory === 'RFA'
                      }
                      showTime
                      disabledDate={(currentDate) =>
                        getFieldValue('quotationStartDates') &&
                        moment(getFieldValue('quotationStartDates')).isAfter(currentDate, 'time')
                      }
                      format={getDateTimeFormat()}
                      placeholder={intl
                        .get(`${promptCode}.model.quoController.quotationDeadline`)
                        .d('报价截止时间')}
                    />
                  )}
                </FormItem>
              </Col>
            </Row>
          )}
        {((header.bargainStatus === 'BARGAINING_ONLINE' && header.bargainClosedFlag === 0) ||
          header.rfxStatus === 'BARGAINING') && (
          <Row>
            <Col span={6}>
              <span style={timeObj}>
                {intl.get(`${promptCode}.model.quoController.bargainEndDate`).d('议价截止时间')}:
              </span>
            </Col>
            <Col span={6}>
              <FormItem>
                {getFieldDecorator('bargainEndDate', {
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`${promptCode}.model.quoController.bargainEndDate`)
                          .d('当前议价截止时间'),
                      }),
                    },
                  ],
                  initialValue:
                    header.bargainEndDate !== null
                      ? moment(header.bargainEndDate, 'YYYY-MM-DD HH:mm:ss')
                      : '',
                })(
                  <DatePicker
                    showTime
                    disabledDate={(currentDate) =>
                      getFieldValue('quotationStartDate') &&
                      (moment(getFieldValue('quotationStartDate')).isAfter(currentDate, 'time') ||
                        currentDate < moment().subtract(1, 'days'))
                    }
                    format={getDateTimeFormat()}
                    placeholder={intl
                      .get(`${promptCode}.model.quoController.bargainEndDate`)
                      .d('议价截止时间')}
                  />
                )}
              </FormItem>
            </Col>
          </Row>
        )}
        {((header.bargainStatus !== 'BARGAIN_ONLINE' && header.bargainClosedFlag !== 0) ||
          (quotationEndDate && nowTime > quotationEndDate)) &&
        (header.roundHeaderStatus === 'ROUND_CHECKING' ||
          header.roundHeaderStatus === 'ROUND_SCORING') ? (
          <Row>
            <Col span={6}>
              <span style={timeObj}>
                {intl
                  .get(`${promptCode}.model.quoController.roundQuotationEndDate`)
                  .d('当前轮次截止时间')}
                :
              </span>
            </Col>
            <Col span={6}>
              <FormItem>
                {getFieldDecorator('roundQuotationEndDate', {
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`${promptCode}.model.quoController.roundQuotationEndDate`)
                          .d('当前轮次截止时间'),
                      }),
                    },
                  ],
                  initialValue:
                    header.roundQuotationEndDate !== null
                      ? moment(header.roundQuotationEndDate, 'YYYY-MM-DD HH:mm:ss')
                      : '',
                })(
                  <DatePicker
                    disabled={disabledRoundEndTime}
                    // disabledDate={current => current && current <= moment().endOf('second') - 86400}
                    showTime
                    format={getDateTimeFormat()}
                    placeholder={intl
                      .get(`${promptCode}.model.quoController.roundQuotationEndDate`)
                      .d('当前轮次截止时间')}
                  />
                )}
              </FormItem>
            </Col>
          </Row>
        ) : null}
        {(header.qualificationType === 'PRE' || header.qualificationType === 'PRE_POST') && (
          <Row>
            <Col span={6}>
              <span style={timeObj}>
                {intl.get(`${promptCode}.model.quoController.pretrialDeadline`).d('预审截止时间')}:
              </span>
            </Col>
            <Col span={6}>
              <FormItem>
                {getFieldDecorator('prequalEndDate', {
                  initialValue:
                    header.prequalEndDate !== null
                      ? moment(header.prequalEndDate, 'YYYY-MM-DD HH:mm:ss')
                      : '',
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`${promptCode}.model.quoController.pretrialDeadline`)
                          .d('预审截止时间'),
                      }),
                    },
                  ],
                })(
                  <DatePicker
                    disabled={curTime > prequalEndDate}
                    showTime
                    disabledTime={disabledTime(getFieldValue('quotationStartDate'), 'end')}
                    disabledDate={(currentDate) =>
                      getFieldValue('quotationStartDate') &&
                      moment(getFieldValue('quotationStartDate')).isBefore(currentDate, 'time')
                    }
                    format={getDateTimeFormat()}
                    placeholder={intl
                      .get(`${promptCode}.model.quoController.pretrialDeadline`)
                      .d('预审截止时间')}
                  />
                )}
              </FormItem>
            </Col>
          </Row>
        )}
        {currentQuotationRound && roundHeaderDates.length
          ? roundHeaderDates.map((item) => (
              <Row>
                <Col span={6}>
                  <span style={timeObj}>
                    {`${
                      intl.get('ssrc.common.the').d('第') +
                      item.quotationRound +
                      intl.get('ssrc.common.roundStartTime').d('轮报价开始时间')
                    }`}
                    :
                  </span>
                </Col>
                <Col span={6}>
                  <FormItem>
                    {getFieldDecorator(`roundQuotationStartDate${item.quotationRound}`, {
                      rules: [
                        {
                          required: true,
                          message: intl.get('hzero.common.validation.notNull', {
                            name: `${
                              intl.get('ssrc.common.the').d('第') +
                              item.quotationRound +
                              intl.get('ssrc.common.roundStartTime').d('轮报价开始时间')
                            }`,
                          }),
                        },
                      ],
                      initialValue:
                        item.roundQuotationStartDate !== null
                          ? moment(item.roundQuotationStartDate, 'YYYY-MM-DD HH:mm:ss')
                          : '',
                    })(
                      <DatePicker
                        disabled={
                          item.quotationRound < currentQuotationRound ||
                          moment().isAfter(item.roundQuotationStartDate)
                        }
                        showTime
                        format={getDateTimeFormat()}
                        placeholder={`${
                          intl.get('ssrc.common.the').d('第') +
                          item.quotationRound +
                          intl.get('ssrc.common.roundStartTime').d('轮报价开始时间')
                        }`}
                        disabledDate={(currentDate) =>
                          getFieldValue(`roundQuotationEndDate${item.quotationRound}`) &&
                          moment(
                            getFieldValue(`roundQuotationEndDate${item.quotationRound}`)
                          ).isBefore(currentDate, 'time')
                        }
                      />
                    )}
                  </FormItem>
                </Col>
                <Col span={6}>
                  <span style={timeObj}>
                    {`${
                      intl.get('ssrc.common.the').d('第') +
                      item.quotationRound +
                      intl.get('ssrc.common.roundEndTime').d('轮报价截止时间')
                    }`}
                    :
                  </span>
                </Col>
                <Col span={6}>
                  <FormItem>
                    {getFieldDecorator(`roundQuotationEndDate${item.quotationRound}`, {
                      rules: [
                        {
                          required: true,
                          message: intl.get('hzero.common.validation.notNull', {
                            name: `${
                              intl.get('ssrc.common.the').d('第') +
                              item.quotationRound +
                              intl.get('ssrc.common.roundEndTime').d('轮报价截止时间')
                            }`,
                          }),
                        },
                      ],
                      initialValue:
                        item.roundQuotationEndDate !== null
                          ? moment(item.roundQuotationEndDate, 'YYYY-MM-DD HH:mm:ss')
                          : '',
                    })(
                      <DatePicker
                        disabled={item.quotationRound < currentQuotationRound}
                        showTime
                        format={getDateTimeFormat()}
                        disabledDate={(currentDate) =>
                          getFieldValue(`roundQuotationStartDate${item.quotationRound}`) &&
                          moment(
                            getFieldValue(`roundQuotationStartDate${item.quotationRound}`)
                          ).isAfter(currentDate, 'time')
                        }
                        placeholder={`${
                          intl.get('ssrc.common.the').d('第') +
                          item.quotationRound +
                          intl.get('ssrc.common.roundEndTime').d('轮报价截止时间')
                        }`}
                      />
                    )}
                  </FormItem>
                </Col>
              </Row>
            ))
          : ''}
        <Row>
          <Col span={6}>
            <span style={{ color: '#f5222d', marginLeft: '66px' }}>*</span>
            <span style={{ ...timeObj, marginLeft: '5px' }}>
              {intl.get(`${promptCode}.model.quoController.remarks`).d('备注')}:
            </span>
          </Col>
          <Col span={18}>
            <FormItem className={styles.explainStyle}>
              {getFieldDecorator('timeAdjustedRemark', {
                initialValue: header.timeAdjustedRemark,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${promptCode}.model.quoController.remarks`).d('备注'),
                    }),
                  },
                ],
              })(<TextArea autosize={{ minRows: 3, maxRows: 6 }} />)}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }

  /**
   * 查询-评分要素定义数据
   */
  @Bind()
  fetchScoringElementData() {
    const {
      dispatch,
      quotationController: { header = {} },
      organizationId,
    } = this.props;
    dispatch({
      type: 'quotationController/fetchScoringElementData',
      payload: { prequalHeaderId: header.prequalHeaderId, organizationId },
    });
  }

  /**
   * 关闭-评分要素定义模态框
   */
  @Bind()
  handleCancelScoringElement() {
    this.props.dispatch({
      type: 'quotationController/updateState',
      payload: {
        scoringElement: [],
      },
    });
    this.setState({
      scoringElementVisible: false,
    });
  }

  /**
   * 隐藏添加供应商modal
   * @returns {*}
   */
  @Bind()
  hideAddSupplierModal() {
    this.setState({
      addSupplierModalVisible: false,
    });
  }

  /**
   * 显示添加供应商modal，并且查询分配可见物品
   */
  @Bind()
  showAddSupplierModal() {
    this.setState({
      addSupplierModalVisible: true,
    });
    this.fetchMaterial();
  }

  /**
   * fetchMaterial
   * 获取物料
   */
  fetchMaterial() {
    const {
      dispatch,
      organizationId,
      match: { params },
    } = this.props;
    dispatch({
      type: 'quotationController/fetchMaterial',
      payload: {
        organizationId,
        rfxHeaderId: params.rfxId,
      },
    });
  }

  /**
   * 关闭新增供应商模态框
   */
  @Bind()
  handelCancelAddSupplierDrawer() {
    this.setState({ addSupplierModalVisible: false });
    this.props.dispatch({
      type: 'quotationController/updateState',
      payload: {
        materialLine: [],
      },
    });
  }

  /**
   * 保存添加供应商
   */
  @Bind()
  handleSaveSupplier(values) {
    const {
      dispatch,
      organizationId,
      match: { params, path = null },
      quotationController: { materialLine = [] },
    } = this.props;
    const parameter = getEditTableData(materialLine, ['rfxLineItemId']);
    if (isEmpty(parameter)) {
      return;
    }

    let rfxItemSupAssigns;
    if (parameter.length > 0) {
      rfxItemSupAssigns = parameter.map((item) => {
        return {
          inviteFlag: item.inviteFlag,
          minLimitPrice: item.minLimitPrice,
          maxLimitPrice: item.maxLimitPrice,
          rfxLineItemId: item.rfxLineItemId,
        };
      });
    }
    dispatch({
      type: 'inquiryHall/saveSupplier',
      payload: {
        organizationId,
        rfxHeaderId: params.rfxId,
        rfxItemSupAssigns,
        ...values,
      },
    }).then((res) => {
      if (res) {
        notification.success();
        this.handelCancelAddSupplierDrawer();
        // 询价单表头数据
        dispatch({
          type: 'quotationController/fetchInquiryHeaderDetail',
          payload: {
            organizationId,
            rfxHeaderId: params.rfxId,
            path,
          },
        });
        this.fetchItemLine();
        this.fetchSupplierLine();
      }
    });
  }

  /**
   * 查询物品行报价明细
   */
  @Bind()
  handleQuotationDetail(record = {}) {
    const {
      match: { params },
      dispatch,
      organizationId,
    } = this.props;

    const { rfxLineItemId = null } = record;
    dispatch({
      type: 'inquiryHall/fetchItemLineQuotationDetail',
      payload: {
        organizationId,
        rfxLineItemId,
        rfxHeaderId: params.rfxId,
      },
    });

    this.setState({
      itemLineQuotationDetailModalVisible: true,
    });
  }

  /**
   * 报价明细modal确认
   *
   * @memberof Update
   */
  @Bind()
  sureItemLineQutationDetail() {
    this.cancelItemLineQutationDetail();
  }

  /**
   * 报价明细modal取消
   *
   * @memberof Update
   */
  @Bind()
  cancelItemLineQutationDetail() {
    const { dispatch } = this.props;

    this.setState({
      itemLineQuotationDetailModalVisible: false,
    });

    dispatch({
      type: 'inquiryHall/updateState',
      payload: {
        itemLineQuotationDetail: [],
      },
    });
  }

  @Bind()
  handleSearchPriceFloating() {
    const {
      dispatch,
      match: { params },
      organizationId,
    } = this.props;
    dispatch({
      type: 'inquiryHall/fetchInquiryItemLine',
      payload: {
        organizationId,
        rfxHeaderId: params.rfxId,
      },
    });
  }

  /**
   * 打开价格浮动弹框
   */
  @Bind()
  showPriceFloatingModal() {
    this.handleSearchPriceFloating();
    this.setState({
      priceFloatingVisible: true,
    });
  }

  /**
   * 关闭价格浮动弹框
   */
  @Bind()
  closePriceFloatingModal() {
    this.setState({
      priceFloatingVisible: false,
    });
  }

  /**
   * 价格浮动弹框按钮时间逻辑判断
   */
  @Bind
  handlePriceFloatingButton() {
    const {
      quotationController: { header = {} },
    } = this.props;
    const ieQuotationEndDate =
      header.quotationEndDate && header.quotationEndDate.replace(/-/g, '/');
    const quotationEndDate = new Date(ieQuotationEndDate).getTime();
    const ieNow = header.now && header.now.replace(/-/g, '/');
    const nowTime = new Date(ieNow).getTime();
    return nowTime > quotationEndDate;
  }

  /**
   * 寻源小组打开
   */
  @Bind()
  openInquiryGroup() {
    this.setState({
      inquiryGroupVisibleFlag: true,
    });
  }

  /**
   * 寻源小组关闭
   */
  @Bind()
  closeInquiryGroup() {
    this.setState({
      inquiryGroupVisibleFlag: false,
    });
  }

  /**
   * 开标人-弹出滑窗
   */
  @Bind()
  openBidholder() {
    this.setState({
      bidholderVisible: true,
    });

    this.fetchOpenBidHolder();
  }

  // 查询开标人
  @Bind()
  fetchOpenBidHolder(page = {}) {
    const {
      match: { params },
      dispatch,
      organizationId,
      modelName = 'inquiryHall',
    } = this.props;
    dispatch({
      type: `${modelName}/fetchBidholderList`,
      payload: { page, organizationId, rfxHeaderId: params.rfxId, rfxRole: 'OPENED_BY ' },
    });
  }

  /**
   * 关闭开标人弹框
   */
  @Bind()
  onCancel() {
    const { dispatch, modelName = 'inquiryHall' } = this.props;

    dispatch({
      type: `${modelName}/updateState`,
      payload: {
        bidHolderList: [],
        bidHolderPagination: {},
      },
    });
    this.setState({
      bidholderVisible: false,
    });
  }

  // 查询配置表
  fetchConfig = async () => {
    const { organizationId } = this.props;
    const { configSheet = {} } = this.state;
    let data = null;

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
  linktoPrNumDetail(record) {
    const { dispatch } = this.props;
    const { prSourcePlatform = null, prHeaderId } = record;
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
   * 点击修改专家评分的回调
   */
  @Bind()
  changeExpertInfo() {
    this.setState({
      collapseKeys: ['expert'],
      fixExpertInfoVisible: true,
    });
    this.fetchExpert();
    // 查询初步评审评分要素列表 - 符合性检查
    this.fetchQueryReviewElements();
  }

  async fetchQueryReviewElements() {
    const {
      organizationId,
      match: { params },
    } = this.props;
    const data = await queryReviewElements({
      organizationId,
      sourceHeaderId: params.rfxId,
      sourceFrom: 'RFX',
      indicStatus: 'SUBMITTED', // 查询提交后的评分要素数据
      indicateLevel: 'ONE', // 查询一级评分要素
      customizeUnitCode: 'SSRC.INQUIRY_HALL.NEW_EDIT.HEADER.SCORE_INDICS',
    });
    const { initialReviewIndicList = [] } = data;
    this.InitialReviewDS.loadData(initialReviewIndicList);
  }

  /**
   * 获取专家数据
   *
   * @memberof Update
   */
  @Bind()
  async fetchExpert() {
    const {
      match: { params },
      organizationId,
    } = this.props;
    const { rfxId = null } = params;

    if (!rfxId || rfxId === 'null') {
      return;
    }

    try {
      const experts = await fetchExpertAllocationData({
        organizationId,
        sourceHeaderId: rfxId,
        sourceFrom: 'RFX',
        expertStatus: 'SUBMITTED',
        customizeUnitCode: 'SSRC.QUOTATION_CONTROLLER.EXPERT_SCORE',
      });

      const data = experts.evaluateExpertList || [];
      // const business = data.filter((item) => item.expertCategory === 'BUSINESS') || [];
      // const technology = data.filter((item) => item.expertCategory === 'TECHNOLOGY') || [];
      // const all = data.filter((item) => item.expertCategory === 'BUSINESS_TECHNOLOGY') || [];
      this.NoneExpertTableDS.loadData(data);
      this.AllExpertTableDS.loadData(data);
    } catch (e) {
      throw e;
    }
  }

  // 专家表格
  renderExpertTable() {
    const {
      quotationController: { header = {} },
    } = this.props;
    const { bidRuleType } = header;

    if (!bidRuleType) {
      return;
    }
    return (
      <div>
        {bidRuleType === 'NONE' &&
          this._renderTableList('', 'BUSINESS_TECHNOLOGY', this.AllExpertTableDS)}
        {bidRuleType !== 'NONE' && this._renderTableList('', 'TECHNOLOGY', this.NoneExpertTableDS)}
      </div>
    );
  }

  _renderTableList(title = null, type = null, ds = {}) {
    const {
      distributeExpert,
      quotationController: { header = {} },
    } = this.props;
    const ExpertProps = {
      distributeExpert,
      ds,
      type,
      refresh: this.fetchExpert,
      header,
    };
    return (
      <div>
        {title}
        <ExpertTable {...ExpertProps} />
      </div>
    );
  }

  getBackPath() {
    const {
      match: { path = null },
    } = this.props;
    const isPub = path && path.includes('/pub');
    if (isPub) return null;
    return `${getActiveTabKey()}/list`;
  }

  /**
   * 一键终止报价
   */
  @Debounce(500)
  @Bind()
  finishQuotation() {
    const {
      dispatch,
      match: { params },
      // location: { pathname },
    } = this.props;
    dispatch({
      type: 'quotationController/finishQuotation',
      payload: {
        rfxHeaderIds: [params.rfxId],
      },
    }).then((res) => {
      if (res && !res.failed) {
        notification.success();
        this.handleSearch();
        this.initDS();
      }
    });
  }

  handleFinishQuotation = () => {
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      content: intl
        .get('ssrc.common.quoController.view.message.confirm.finish')
        .d('是否确认一键终止该单据?'),
      // okText: intl.get('hzero.common.button.ok').d('确定'),
      // cancelText: intl.get('hzero.common.button.cancel').d('取消'),
      onOk: () => this.finishQuotation(),
    });
  };

  /**
   * 创建初步评审行
   */
  @Bind()
  handleCreateReviewLine() {
    const {
      organizationId,
      match: { params },
      quotationController: { header = {} },
    } = this.props;
    const { openBidOrder } = header;
    const line = {
      evaluateIndicId: null,
      indicateId: null,
      indicateCode: null,
      indicateName: null,
      indicateType: 'PASS',
      // passFlag: 0,
      expertDistribute: null,
      indicStatus: 'SUBMITTED', // 查询提交后的评分要素数据
      sourceHeaderId: params.rfxId,
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
    this.InitialReviewDS.create(line, 0);
  }

  /**
   * 保存初步评审行
   */
  @Debounce(500)
  @Bind()
  async handleSaveReviewLine() {
    const {
      organizationId,
      match: { params },
    } = this.props;
    const validateFlag = await this.InitialReviewDS.validate();
    if (!validateFlag) {
      return;
    }

    let newParams = this.InitialReviewDS.toData() || [];
    if (!newParams.length) {
      return;
    }
    this.setState({ saveReviewLoading: true });
    newParams = newParams.map((item) => {
      return {
        ...item,
        organizationId,
        tenantId: organizationId,
        sourceFrom: 'RFX',
        team: 'INITIAL_REVIEW',
        sourceHeaderId: params.rfxId,
      };
    });

    saveInitialReviewLines({
      organizationId,
      otherParams: newParams,
    })
      .then((res) => {
        this.setState({ saveReviewLoading: false });
        if (getResponse(res)) {
          notification.success();
          this.fetchQueryReviewElements();
        }
      })
      .catch(() => {
        this.setState({ saveReviewLoading: false });
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
        await this.InitialReviewDS.delete(remoteDelete);
        this.InitialReviewDS.unSelectAll();
        this.fetchQueryReviewElements();
      } catch (e) {
        throw e;
      }
    } else {
      this.InitialReviewDS.remove(localDelete);
    }
  }

  // 评分要素/初步评审 -- 选择评分模板
  @Bind()
  async selectScoreElementTemplate(record = {}) {
    const {
      organizationId,
      match: { params = {} },
    } = this.props;
    const { rfxId = null } = params || {};
    const { templatePurpose, templateId = null } = record || {};

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
        indicStatus: 'SUBMITTED',
      });
      result = getResponse(result);
      // eslint-disable-next-line no-unused-expressions
      this.ReviewReferenceTemplateDS?.current?.set('reviewTemplateLov', null);
      if (!result) {
        return;
      }
      notification.success();
      this.fetchQueryReviewElements();
    } catch (e) {
      // eslint-disable-next-line no-unused-expressions
      this.ReviewReferenceTemplateDS?.current?.set('reviewTemplateLov', null); // 防止更新失败后, 再选择同一条记录, 触发不了onChange
      throw e;
    }
  }

  /**
   * 渲染时间调整按钮 - 此方法被 [华友钴业] 二开, 严禁他人, 删除/修改 方法名
   * @protected
   */
  renderTimeControlBtn() {
    const {
      quotationController: { header = {} },
      organizationId,
      match,
      userId,
    } = this.props;
    const { openTimeControlFlag } = this.state;
    // 时间控制按钮-new
    const TimeControlProps = {
      header,
      match,
      organizationId,
      userId,
      openTimeControlFlag,
      handleSearch: this.handleSearch,
    };
    return {
      name: 'timeAdjustment',
      btnComp: TimeControl,
      btnProps: {
        name: 'timeAdjustment',
        ...TimeControlProps,
      },
    };
  }

  /**
   * 渲染时间调整按钮view - 此方法被 [华友钴业] 二开, 严禁他人, 删除/修改 方法名
   * @protected
   */
  renderTimeControlViewBtn() {
    const {
      quotationController: { header = {} },
      history,
      organizationId,
      match,
      userId,
    } = this.props;
    // 工作流时间查看对比
    const timerViewProps = {
      header,
      match,
      organizationId,
      userId,
      history,
    };
    return <TimeControlView {...timerViewProps} />;
  }

  /**
   * 渲染初步评审容器
   */
  renderInitialReviewWrapper() {
    const {
      bidRuleType,
      organizationId,
      templateScoreType,
      quotationController: { header = {} },
    } = this.props;
    const { saveReviewLoading = false } = this.state;

    const initialReviewProps = {
      header,
      organizationId,
      ds: this.InitialReviewDS,
      sourceHeaderId: header.rfxHeaderId,
      deleteScoreElement: this.handleDeleteScoreElement,
      onDeleteReviewLine: this.handleDeleteReviewLine,
      onCreateReviewLine: this.handleCreateReviewLine,
      onSaveReviewLine: this.handleSaveReviewLine,
      saveReviewLoading,
    };

    return (
      <div>
        <h3 className={styles['m-t-m']}>
          <span style={{ marginRight: '16px' }}>
            {intl
              .get(`ssrc.inquiryHall.view.message.tab.complianceCheckElement`)
              .d('符合性检查评分要素')}
          </span>
          <Lov
            name="reviewTemplateLov"
            mode="button"
            noCache
            clearButton={false}
            icon="check"
            onChange={(data) => this.selectScoreElementTemplate(data)}
            dataSet={this.ReviewReferenceTemplateDS}
            tableProps={{
              alwaysShowRowBox: true,
            }}
            queryParams={{
              enabledFlag: 1,
              // expertCategory: type,
              scoreMode: bidRuleType,
              templatePurpose: 'INITIAL_REVIEW',
              scoreTemplateScoreType: templateScoreType,
            }}
            disabled={!header.rfxHeaderId || header.rfxHeaderId === 'null'}
          >
            {intl.get(`ssrc.inquiryHall.view.button.referTemplate`).d('参考模板')}
          </Lov>
        </h3>
        <InitialReviewTable {...initialReviewProps} />
      </div>
    );
  }

  renderFixExpertScore(fixExpertScoreProp) {
    return <FixExpertScore {...fixExpertScoreProp} />;
  }

  isClosingOfferVisible(header = {}) {
    let result = true;
    if (isEmpty(header)) {
      return false;
    }

    const {
      rfxStatus = null,
      roundQuotationRule = null,
      quotationEndDate = null,
      sourceCategory = null,
    } = header;

    // 评审发起的多轮报价
    const scoreRoundVisible =
      rfxStatus === 'ROUND_QUOTATION' &&
      (roundQuotationRule === 'SCORE' || roundQuotationRule === 'AUTO_SCORE') &&
      quotationEndDate &&
      moment().isAfter(quotationEndDate);
    if (scoreRoundVisible) {
      return !scoreRoundVisible;
    }

    result =
      rfxStatus === 'IN_QUOTATION' ||
      rfxStatus === 'ROUND_QUOTATION' ||
      rfxStatus === 'ROUND_SCORING' ||
      rfxStatus === 'BARGAINING';
    return result && sourceCategory !== 'RFA';
  }

  render() {
    const {
      operationRecordModalVisible,
      previewVisible,
      previewFileName,
      previewImage,
      viewOnly,
      bucketDirectory,
      adjustTimeModalVisible,
      addSupplierModalVisible,
      controllerModalVisible,
      type,
      scoringElementVisible,
      LadderLevelHeaderData,
      viewLadderLevelVisible,
      collapseKeys,
      priceFloatingVisible,
      itemLineQuotationDetailModalVisible = false,
      inquiryGroupVisibleFlag,
      bidholderVisible,
      fixExpertInfoVisible,
      exportVisibleStatusList,
      code = {},
    } = this.state;
    const {
      quotationController: {
        header = {},
        itemLine = [],
        supplierLine = [],
        itemLinePagination = {},
        supplierLinePagination = {},
        supplierData = [],
        materialLine = [],
        scoringElement = [],
      },
      inquiryHall: {
        operationPagination = {},
        operationData = [],
        itemLineQuotationDetail = [],
        bidHolderList = [],
        bidHolderPagination = {},
      },
      location: { pathname },
      queryRfq: { quotaLadderLevelData = [] },
      organizationId,
      dispatch,
      match,
      form,
      userId,
      fetchItemLineLoading,
      fetchSupplierLineLoading,
      fetchInquiryHallUpdateLoading,
      fetchMaterialLoading,
      saveSupplierLoading,
      closeLoading,
      stopLoading,
      fetchScoringElementLoading,
      fetchLadderLevelTableLoading,
      fetchItemLineQuotationDetailLoading,
      saveAdjustTimeLoading,
      customizeTable = () => {},
      customizeForm = () => {},
      remote,
      customizeBtnGroup = () => {},
    } = this.props;
    const { params } = match;
    // const { openTimeControlFlag } = this.state;

    const AttachmentsProps = {
      bucketName: PRIVATE_BUCKET,
      bucketDirectory,
      viewOnly,
      businessUuid: header.businessAttachmentUuid,
      techUuid: header.techAttachmentUuid,
    };
    const operationRecordProps = {
      dispatch,
      match,
      organizationId,
      visible: operationRecordModalVisible,
      hideModal: this.hideOperationRecord,
      pagination: operationPagination,
      dataSource: operationData,
    };
    const itemDetailsTableProps = {
      form,
      organizationId,
      customizeTable,
      dataSource: itemLine,
      pagination: itemLinePagination,
      loading: fetchItemLineLoading,
      supplierDataSource: supplierData,
      searchSupplier: this.handleSearchSupplier,
      onSearch: this.fetchItemLine,
      quotaLadderLevelData,
      viewLadderLevelVisible,
      LadderLevelHeaderData,
      fetchLadderLevelTableLoading,
      viewLadderLevel: this.viewLadderLevelModal,
      hideModal: this.hideLadderLevelModal,
      fetchItemLineQuotationDetailLoading,
      itemLineQuotationDetail,
      cancelItemLineQutationDetail: this.cancelItemLineQutationDetail,
      sureItemLineQutationDetail: this.sureItemLineQutationDetail,
      itemLineQuotationDetailModalVisible,
      handleQuotationDetail: this.handleQuotationDetail,
      showQuotationDetail: this.showQuotationDetail,
      linktoPrNumDetail: this.linktoPrNumDetail,
    };
    const supplierListTableProps = {
      dataSource: supplierLine,
      pagination: supplierLinePagination,
      loading: fetchSupplierLineLoading,
      onSearch: this.fetchSupplierLine,
      handleAllot: this.handleAllot,
      customizeTable,
    };
    const adjustTimeModalProps = {
      visible: adjustTimeModalVisible,
      title: intl.get(`${promptCode}.model.quoController.timeAdjustment`).d('时间调整'),
      onCancel: this.hideAdjustTimeModal,
      onOk: this.handleAdjustTime,
      width: 760,
      confirmLoading: saveAdjustTimeLoading,
    };
    let controllerTitle;
    if (type === 1) {
      controllerTitle = intl.get(`${promptCode}.view.message.button.paused`).d('暂停');
    } else if (type === 2) {
      controllerTitle = intl.get(`${promptCode}.view.message.button.closed`).d('关闭');
    } else if (type === 3) {
      controllerTitle = intl.get(`${promptCode}.view.message.button.open`).d('开启');
    } else if (type === 4) {
      controllerTitle = intl.get(`${promptCode}.view.message.button.finished`).d('结束');
    }
    const controllModalProps = {
      visible: controllerModalVisible,
      title: controllerTitle,
      width: '420px',
      onOk: () => {
        this.quotationControll(type);
      },
      onCancel: () => {
        this.hideControllModal();
      },
    };
    const addSupplierProps = {
      header,
      userId,
      organizationId,
      confirmLoading: saveSupplierLoading,
      loading: fetchMaterialLoading,
      title: intl.get(`${promptCode}.view.message.panel.addSupplier`).d('添加供应商'),
      visible: addSupplierModalVisible,
      dataSource: materialLine,
      companyId: header.companyId,
      rfxHeaderId: params.rfxId,
      onCancel: this.handelCancelAddSupplierDrawer,
      onSave: this.handleSaveSupplier,
      sourceHeaderId: header.rfxHeaderId,
      templateId: header.templateId,
      remote,
    };
    const previewModalStyle = {
      maxWidth: '50vw',
      maxHeight: '50vh',
    };
    const previewImageStyle = {
      maxWidth: '100%',
      maxHeight: '100%',
    };
    const scoringElementProps = {
      loading: fetchScoringElementLoading,
      visible: scoringElementVisible,
      dataSource: scoringElement,
      onCancel: this.handleCancelScoringElement,
    };
    const priceFloatingProps = {
      match,
      anchor: 'right',
      visibleModal: priceFloatingVisible,
      onCancel: this.closePriceFloatingModal,
    };
    const openerChooseFlag = header.openerFlag === 1 && header.sealedQuotationFlag === 1;
    // 寻源小组props
    const inquiryGroupModalProps = {
      inquiryGroupVisibleFlag,
      closeInquiryGroup: this.closeInquiryGroup,
      rfxHeaderId: header.rfxHeaderId,
      openerChooseFlag,
      rfxStatus: header.rfxStatus,
      // readOnly: true,
    };
    const otherInfoProps = {
      form,
      customizeForm,
    };
    // 密封报价,查看开标人
    const BidOpenerCartridgeProps = {
      bidholderVisible,
      dataSource: bidHolderList,
      pagination: bidHolderPagination,
      onCancel: this.onCancel,
      fetchOpenBidHolder: this.fetchOpenBidHolder,
    };
    const fixExpertScoreProp = {
      match,
      header,
      code,
    };

    const IsPublicUrl = pathname && pathname.includes('/pub'); // 工作流审批标识
    const IsClosingOfferVisible = this.isClosingOfferVisible(header);

    const renderHeaderButtons = () => {
      const addSupplierDisabledFlag =
        (header.rfxStatus &&
          header.sourceMethod &&
          header.sourceMethod !== 'INVITE' &&
          !(
            header.rfxStatus === 'IN_QUOTATION' ||
            header.rfxStatus === 'NOT_START' ||
            header.rfxStatus === 'IN_PREQUAL' ||
            header.rfxStatus === 'PENDING_PREQUAL'
          )) ||
        (moment().isAfter(header.prequalEndDate) &&
          (header.qualificationType === 'PRE' || header.qualificationType === 'PRE_POST')) ||
        header.rfxStatus === 'BARGAINING' ||
        (header.sourceMethod && header.sourceMethod !== 'INVITE');

      const buttons = [
        {
          name: 'viewMore',
          group: true,
          // 按钮组显示内容
          child: (
            <Button>
              <Icon type="ellipsis" />
              {intl.get('hzero.common.basicLayout.viewMore').d('查看更多')}
            </Button>
          ),
          children: [
            {
              name: 'operationRecord',
              child: intl.get(`${promptCode}.view.message.button.record`).d('操作记录'),
              btnProps: {
                onClick: () => this.playView(),
              },
            },
            {
              name: 'paused',
              child: intl.get(`${promptCode}.view.message.button.paused`).d('暂停'),
              btnProps: {
                onClick: () => this.showQuotationControllModal(1),
                className: !(
                  (header.rfxStatus === 'IN_QUOTATION') /* || header.rfxStatus === 'NOT_START' */
                )
                  ? styles.disabledElementA
                  : '',
              },
            },
            {
              name: 'closed',
              child: intl.get(`${promptCode}.view.message.button.closed`).d('关闭'),
              btnProps: {
                icon: 'close',
                type: 'text',
                loading: closeLoading,
                onClick: () => this.showQuotationControllModal(2),
                className:
                  header.rfxStatus === 'NEW' ||
                  header.rfxStatus === 'CLOSED' ||
                  header.rfxStatus === 'FINISHED' ||
                  header.rfxStatus === 'RELEASE_APPROVING' ||
                  header.rfxStatus === 'CHECK_APPROVING'
                    ? styles.disabledElementA
                    : '',
                otherButtonProps: {
                  permissionList: [
                    {
                      code: `${this.props.match.path}.button.closed`.toLowerCase(),
                      type: 'button',
                      meaning:
                        intl.get(`${promptCode}.view.message.panel.RFxControl`).d('询报价控制') -
                        intl.get(`${promptCode}.view.message.button.closed`).d('关闭'),
                    },
                  ],
                },
              },
            },
            {
              name: 'open',
              child: intl.get(`${promptCode}.view.message.button.open`).d('开启'),
              btnProps: {
                onClick: () => this.handleOpen(),
              },
            },
          ],
        },
        IsClosingOfferVisible && {
          name: 'closingOffer',
          child: (
            <>
              <img src={terminationImg} style={{ width: '13px', marginRight: '6px' }} alt="" />
              {intl.get(`${promptCode}.view.message.button.closingOffer`).d('一键终止报价')}
            </>
          ),
          btnProps: {
            type: 'default',
            style: { maxWidth: '160px' },
            loading: stopLoading,
            onClick: () => this.handleFinishQuotation(),
            otherButtonProps: {
              permissionList: [
                {
                  code: `${this.props.match.path}.button.closingOffer`.toLowerCase(),
                  type: 'button',
                  meaning:
                    intl.get(`${promptCode}.view.message.panel.RFxControl`).d('询报价控制') -
                    intl.get(`${promptCode}.view.message.button.closingOffer`).d('一键终止报价'),
                },
              ],
            },
          },
        },
        this.renderTimeControlBtn(),
        {
          name: 'priceFloating',
          child: intl.get(`${promptCode}.view.message.button.priceFloating`).d('价格浮动'),
          btnProps: {
            icon: 'line-chart',
            type: 'default',
            disabled: this.handlePriceFloatingButton() && header.rfxStatus !== 'BARGAINING',
            onClick: () => this.showPriceFloatingModal(),
          },
        },
        {
          name: 'addSupplier',
          child: intl.get(`${promptCode}.view.message.button.addSupplier`).d('添加供应商'),
          btnProps: {
            icon: 'user-add',
            type: 'default',
            disabled: remote
              ? remote.process(
                  'SSRC_QUOTATION_CONTROLLER_DETAIL_PROCESS_ADD_SUPPLIER_DISABLED',
                  addSupplierDisabledFlag,
                  {
                    header,
                    addSupplierDisabledFlag,
                  }
                )
              : addSupplierDisabledFlag,
            onClick: () => this.showAddSupplierModal(),
            otherButtonProps: {
              permissionList: [
                {
                  code: `${this.props.match.path}.button.addsupplier`.toLowerCase(),
                  type: 'button',
                  meaning:
                    intl.get(`${promptCode}.view.message.panel.RFxControl`).d('询报价控制') -
                    intl.get(`${promptCode}.view.message.button.addSupplier`).d('添加供应商'),
                },
              ],
            },
          },
        },
        header.quotationEndDateFlag === 0 &&
          header.rfxStatus === 'IN_QUOTATION' && {
            name: 'finished',
            child: intl.get(`${promptCode}.view.message.button.finished`).d('结束'),
            btnProps: {
              icon: 'logout',
              type: 'default',
              onClick: () => this.showQuotationControllModal(4),
            },
          },
        exportVisibleStatusList.includes(header.rfxStatus) &&
          header.expertScoreType !== 'NONE' &&
          header.rfxStatus !== 'BARGAINING' && {
            name: 'fixExpertInfo',
            child: (
              <>
                <a href="#expert">
                  <C7NIcon
                    type="record_test"
                    style={{ paddingRight: '4px', fontSize: '0.16rem', color: '#555' }}
                  />
                  {intl
                    .get(`${promptCode}.view.message.button.fixExpertInfo`)
                    .d('修改专家评分信息')}
                </a>
              </>
            ),
            btnProps: {
              onClick: () => this.changeExpertInfo(),
            },
          },
      ].filter(Boolean);
      const processButtons = () => {
        return remote.process(
          'SSRC_QUOTATION_CONTROLLER_DETAIL_HEADER_BUTTONS',
          buttons,
          otherProps
        );
      };
      if (!remote) {
        return customizeBtnGroup(
          { code: 'SSRC.QUOTATION_CONTROLLER_DETAIL.HEADER_BUTTONS', pro: true },
          <DynamicButtons buttons={buttons} />
        );
      }
      const otherProps = {
        rfxHeaderId: params.rfxId,
        form,
        dataSource: header,
      };
      return customizeBtnGroup(
        { code: 'SSRC.QUOTATION_CONTROLLER_DETAIL.HEADER_BUTTONS', pro: true },
        <DynamicButtons buttons={processButtons()} />
        // remote.process(
        //   'SSRC_QUOTATION_CONTROLLER_DETAIL_HEADER_BUTTONS',
        //   buttons,
        //   otherProps
        // )
      );
    };

    return (
      <ModalProvider>
        {!IsPublicUrl ? (
          <Header
            backPath={this.getBackPath()}
            title={intl.get(`${promptCode}.view.message.panel.RFxControl`).d('询报价控制')}
          >
            {renderHeaderButtons()}
          </Header>
        ) : (
          <Header title={intl.get(`${promptCode}.view.message.panel.RFxControl`).d('询报价控制')} />
        )}

        <Content>
          <Spin
            spinning={!IsPublicUrl ? fetchInquiryHallUpdateLoading : false}
            wrapperClassName={classnames('ued-detail-wrapper', common['hzero-ui-override'])}
          >
            {IsPublicUrl ? (
              this.renderTimeControlViewBtn()
            ) : (
              <>
                <Collapse
                  className="form-collapse"
                  onChange={this.onCollapseChange}
                  activeKey={collapseKeys}
                >
                  <Panel
                    showArrow={false}
                    header={
                      <Fragment>
                        <h3>
                          {intl
                            .get(`${promptCode}.view.message.panel.basicInformation`)
                            .d('基本信息')}
                        </h3>
                        <a>
                          {collapseKeys.includes('baseInfos')
                            ? intl.get(`hzero.common.button.up`).d('收起')
                            : intl.get(`hzero.common.button.expand`).d('展开')}
                        </a>
                        <Icon type={collapseKeys.includes('baseInfos') ? 'up' : 'down'} />
                      </Fragment>
                    }
                    key="baseInfos"
                  >
                    {this.renderHeaderForm(header)}
                  </Panel>
                  <Panel
                    showArrow={false}
                    header={
                      <Fragment>
                        <h3>
                          {intl.get(`${promptCode}.view.message.panel.otherInfos`).d('其他信息')}
                        </h3>
                        <a>
                          {collapseKeys.includes('otherInfos')
                            ? intl.get(`hzero.common.button.up`).d('收起')
                            : intl.get(`hzero.common.button.expand`).d('展开')}
                        </a>
                        <Icon type={collapseKeys.includes('otherInfos') ? 'up' : 'down'} />
                      </Fragment>
                    }
                    key="otherInfos"
                  >
                    {renderBiddingOtherInfo(
                      otherInfoProps,
                      header,
                      true,
                      this.openInquiryGroup,
                      this.openBidholder
                    )}
                  </Panel>
                  {header.sourceCategory === 'RFA' ? (
                    <Panel
                      showArrow={false}
                      header={
                        <Fragment>
                          <h3>
                            {intl
                              .get(`${promptCode}.view.message.panel.biddingRules`)
                              .d('竞价规则')}
                          </h3>
                          <a>
                            {collapseKeys.includes('biddingRules')
                              ? intl.get(`hzero.common.button.up`).d('收起')
                              : intl.get(`hzero.common.button.expand`).d('展开')}
                          </a>
                          <Icon type={collapseKeys.includes('biddingRules') ? 'up' : 'down'} />
                        </Fragment>
                      }
                      key="biddingRules"
                    >
                      {this.renderBiddingRulesForm(header)}
                    </Panel>
                  ) : null}
                  {header.preQualificationFlag ? (
                    <Panel
                      showArrow={false}
                      header={
                        <Fragment>
                          <h3>
                            {intl
                              .get(`${promptCode}.view.message.panel.preQualification`)
                              .d('资格预审')}
                          </h3>
                          <a>
                            {collapseKeys.includes('preQualification')
                              ? intl.get(`hzero.common.button.up`).d('收起')
                              : intl.get(`hzero.common.button.expand`).d('展开')}
                          </a>
                          <Icon type={collapseKeys.includes('preQualification') ? 'up' : 'down'} />
                        </Fragment>
                      }
                      key="preQualification"
                    >
                      {this.renderPreQualificationForm(header)}
                    </Panel>
                  ) : null}
                  {fixExpertInfoVisible && (
                    <Panel
                      id="expert"
                      showArrow={false}
                      header={
                        <Fragment>
                          <h3>
                            {intl
                              .get(`${promptCode}.view.message.panel.exportAndScoringElements`)
                              .d('专家及评分要素')}
                          </h3>
                          <a>
                            {collapseKeys.includes('expert')
                              ? intl.get(`hzero.common.button.up`).d('收起')
                              : intl.get(`hzero.common.button.expand`).d('展开')}
                          </a>
                          <Icon type={collapseKeys.includes('expert') ? 'up' : 'down'} />
                        </Fragment>
                      }
                      key="expert"
                    >
                      {this.renderExpertTable()}
                      {header.initialReview === 'NEED' && this.renderInitialReviewWrapper()}
                      {this.renderFixExpertScore(fixExpertScoreProp)}
                    </Panel>
                  )}
                </Collapse>
                <Tabs defaultActiveKey="itemDetails" onChange={this.changeTabs} animated={false}>
                  <Tabs.TabPane
                    tab={intl.get(`${promptCode}.view.message.tab.itemDetails`).d('物品明细')}
                    key="itemDetails"
                  >
                    <ItemDetailsTable type={0} {...itemDetailsTableProps} />
                  </Tabs.TabPane>
                  <Tabs.TabPane
                    tab={intl.get(`${promptCode}.view.message.tab.vendorList`).d('供应商列表')}
                    key="supplierList"
                  >
                    <SupplierListTable type={0} {...supplierListTableProps} />
                  </Tabs.TabPane>
                  <Tabs.TabPane
                    tab={intl.get(`${promptCode}.view.message.tab.attachmentInfo`).d('附件列表')}
                    key="attachmentList"
                  >
                    <Attachment {...AttachmentsProps} />
                  </Tabs.TabPane>
                </Tabs>
              </>
            )}
          </Spin>
        </Content>
        {operationRecordModalVisible && <OperationRecord {...operationRecordProps} />}
        <Modal
          visible={previewVisible}
          footer={null}
          onCancel={this.handlePreviewCancel}
          style={previewModalStyle}
        >
          <img alt={previewFileName} style={previewImageStyle} src={previewImage} />
        </Modal>
        {adjustTimeModalVisible && (
          <Modal {...adjustTimeModalProps}>{this.renderAdjustTimeChildren()}</Modal>
        )}
        {controllerModalVisible && (
          <Modal {...controllModalProps}>{this.renderChildren(type)}</Modal>
        )}
        <AddSupplier {...addSupplierProps} />
        <PriceFloatingDrawer {...priceFloatingProps} />
        <ScoringElementModal {...scoringElementProps} />
        {inquiryGroupVisibleFlag && <InquiryGroupModal {...inquiryGroupModalProps} />}
        {bidholderVisible && <BidOpenerCartridge {...BidOpenerCartridgeProps} />}
      </ModalProvider>
    );
  }
}

export default withStandardCompEnhancer(Detail);
export { Detail };
