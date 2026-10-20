/**
 * inquiryHall - 寻源服务/寻源大厅
 * @date: 2018-12-25
 * @author: CJ <juan.chen01@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import { Modal } from 'hzero-ui';
import { Modal as C7nModal, DataSet } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import { isUndefined, isNil } from 'lodash';
import { routerRedux } from 'dva/router';
import querystring from 'querystring';
import withCustomize from 'srm-front-cuz/lib/h0Customize';

import notification from 'utils/notification';
import { Button as PermissionButton } from 'components/Permission';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import {
  filterNullValueObject,
  getCurrentOrganizationId,
  getCurrentUserId,
  getCurrentTenant,
} from 'utils/utils';

import FilterForm from './FilterForm';
import TableList from './TableList';
import Drawer from './Drawer';
import OpeningBid from './OpeningBid';
import OperationBid from './OperationBid';
import ProjectToInquiry from './ProjectApprovalToInquiry';
import CreateModal from './CreateModal';
import QuoFeedBackLackModal from './QuoFeedBackLackModal';
import HistoryOrderModal from './HistoryOrderModal';
import { listLineDS } from './store/historyModalDataSet';

@formatterCollections({ code: ['ssrc.inquiryHall', 'ssrc.common', 'ssrc.queryRfq'] })
@withCustomize({
  unitCode: [
    'SSRC.INQUIRY_HALL.LIST', // 寻源大厅列表
    'SSRC.INQUIRY_HALL.FILTER', // 寻源大厅查询
  ],
})
@connect(({ inquiryHall, commonModel, loading }) => ({
  inquiryHall,
  commonModel,
  resendPasswordLoading: loading.effects['inquiryHall/resendPassword'],
  openingBidLoading: loading.effects['inquiryHall/openingBid'],
  fetchDataLoading: loading.effects['inquiryHall/fetchDataList'],
  fetchQuotationFeedBackLoading: loading.effects['inquiryHall/quotationFeedBack'],
  fetchQuotationFeedBackLackLoading: loading.effects['inquiryHall/quotationFeedBackLack'],
  creteLoading: loading.effects['inquiryHall/sourcingCreate'],
  closeRfxLoading: loading.effects['inquiryHall/closeRfx'], // 关闭询价单
  sendExpertScoreLoading: loading.effects['inquiryHall/sendExpertScore'], // 下发专家评分
  startNextRfxStatusLoading: loading.effects['inquiryHall/startNextRfxStatus'], // 开始下一个状态
  organizationId: getCurrentOrganizationId(),
}))
export default class InquiryHall extends Component {
  form;

  tableDs = new DataSet(listLineDS());

  constructor(props) {
    super(props);

    this.state = {
      visible: false, // 报价响应模态框
      openingBidVisible: false, // 开标模态框
      record: {}, // 点击操作行数据
      currentRecord: {}, // 当前操作行数据
      operationBidVisible: false, // 操作模态框
      originSourceStatus: [], // 工作台跳转带的状态参数
      createModalVisible: false, // 选择寻源模板模态框
      quoLackModalVisible: false, // 报价响应不足模态框
    };
  }

  getSnapshotBeforeUpdate(prevProps = {}) {
    const sourceStatus = this.getSourceStatus(this.props);
    const originSourceStatus = this.getSourceStatus(prevProps);
    if (JSON.stringify(sourceStatus) !== JSON.stringify(originSourceStatus)) {
      return true;
    }
    return false;
  }

  componentDidUpdate(...params) {
    if (params[2]) {
      this.initStatusQuery();
    }
  }

  currentTenantNum() {
    const data = getCurrentTenant();
    const { tenantNum = null } = data;
    return tenantNum;
  }

  /**
   * render()调用后获取数据
   */
  componentDidMount() {
    this.initStatusQuery();
  }

  /**
   * 初始化状态并查询
   * */
  initStatusQuery() {
    const sourceStatus = this.getSourceStatus(this.props);
    this.setState({ originSourceStatus: sourceStatus }, () => {
      this.initQuery({
        rfxStatusSet: sourceStatus,
      });
    });
  }

  /**
   * 工作台跳转
   * 获取状态sourceStatus from url
   */
  getSourceStatus(props = {}) {
    const {
      location: { search = {} },
    } = props;
    let { sourceStatus = null } = querystring.parse(search.substr(1));
    sourceStatus = sourceStatus ? sourceStatus.replace(/'/g, '') : null; // 工作台跳转带的状态参数
    const sourceStatusList = sourceStatus ? sourceStatus.split(',') : [];
    return sourceStatusList;
  }

  /**
   * 初始查询
   */
  initQuery(data = {}) {
    const {
      dispatch,
      inquiryHall: { pagination = {} },
    } = this.props;
    this.handleSearch(pagination, data);
    const lovCodes = {
      sourceMethod: 'SSRC.SOURCE_METHOD', // 寻源方式
      rfxStatus: 'SSRC.RFX_STATUS', // 询价单状态
      auctionDirection: 'SSRC.SOURCE_AUCTION_DIRECTION', // 报价方向
      sourceCategory: 'SSRC.SOURCE_CATEGORY', // 寻源类别
      quotationType: 'SSRC.QUOTATION_TYPE', // 报价方式
    };
    dispatch({
      type: 'inquiryHall/batchCode',
      payload: { lovCodes },
    });
  }

  /**
   * 初始化状态
   * */
  initStatus() {
    const sourceStatus = this.getSourceStatus(this.props);
    this.setState({ originSourceStatus: sourceStatus });
  }

  /**
   * 查询
   * @param {object} fields - 查询参数
   */
  @Bind()
  handleSearch(page = {}, data = {}) {
    const {
      dispatch,
      organizationId,
      match: { path = null },
    } = this.props;
    const fieldValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    const rfxStatusSet = fieldValues.rfxStatusSet || [];
    dispatch({
      type: 'inquiryHall/fetchDataList',
      payload: {
        page,
        ...fieldValues,
        ...data,
        rfxStatusSet: rfxStatusSet || data.rfxStatus, // 理论上查询条件中覆盖url上参数
        organizationId,
        path,
        customizeUnitCode: 'SSRC.INQUIRY_HALL.LIST,SSRC.INQUIRY_HALL.FILTER',
      },
    });
  }

  /**
   * 设置Form
   * @param {object} ref - FilterForm组件引用
   */
  @Bind()
  handleBindRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  /**
   * 设置开标Form
   * @param {object} ref - FilterForm组件引用
   */
  @Bind()
  onRef(ref = {}) {
    this.openingBidForm = (ref.props || {}).form;
  }

  /**
   * 跳转到维护页面
   */
  @Bind()
  inquiryUpdate(record = {}) {
    const { dispatch } = this.props;

    dispatch(
      routerRedux.push({
        pathname: `/ssrc/inquiry-hall/rfx-update/${record.rfxHeaderId}`,
      })
    );
  }

  /**
   * 跳转到初审页面
   */
  @Bind()
  openPreliminary(record) {
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `/ssrc/inquiry-hall/Pretrial/${record.rfxHeaderId}`,
      })
    );
  }

  /**
   * 跳转到明细页面
   */
  @Bind()
  inquiryDetail(record = {}) {
    const { dispatch } = this.props;
    const { rfxHeaderId = null, projectLineSectionId = null } = record;
    if (!rfxHeaderId) {
      return;
    }

    const search = querystring.stringify({
      projectLineSectionId,
    });

    dispatch(
      routerRedux.push({ pathname: `/ssrc/inquiry-hall/rfx-detail/${rfxHeaderId}`, search })
    );
  }

  /**
   * 跳转到创建页面
   */
  @Bind()
  inquiryCreate() {
    const { dispatch } = this.props;

    dispatch(
      routerRedux.push({
        pathname: `/ssrc/inquiry-hall/rfx-create`,
      })
    );
  }

  /**
   * 跳转到申请转询价
   */
  @Bind()
  jumpApplyToInquiry() {
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `/ssrc/inquiry-hall/apply-to-inquiry`,
      })
    );
  }

  /**
   * 中标公告
   * */
  @Bind()
  directBidWinnerNotice(record = {}) {
    const { dispatch } = this.props;

    dispatch(
      routerRedux.push({
        pathname: `/ssrc/inquiry-hall/accept-rfx-notice/${record.rfxHeaderId}`,
      })
    );
  }

  /**
   * 跳转到核价页面
   */
  @Bind()
  inquiryCheckPrice(record) {
    const { dispatch } = this.props;
    const search = querystring.stringify({
      projectLineSectionId: record.projectLineSectionId,
    });
    dispatch(
      routerRedux.push({
        pathname: `/ssrc/inquiry-hall/check-price/${record.rfxHeaderId}`,
        search,
      })
    );
  }

  /**
   *跳转到还比价页面
   *
   * @param {*} record
   * @memberof InquiryHall
   */
  @Bind()
  inquiryFeedbackBargain(record) {
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `/ssrc/inquiry-hall/feedback-bargain/${record.rfxHeaderId}`,
      })
    );
  }

  /**
   * 跳转到评标管理评分结果确认页面
   * @param {Object} record
   */
  @Bind()
  rfxEvaluation(record = {}) {
    const { dispatch } = this.props;
    const userId = getCurrentUserId() || null;

    const {
      rfxHeaderId = null,
      subjectMatterRule = null,
      currentSequenceNum = null,
      rfxTitle,
      scoreStatus,
      rfxStatus,
      rfxNum,
      evaluateLeaderFlag = 0,
      evaluateExpertId = null,
      projectLineSectionId,
      sourceProjectId,
      multiSectionFlag,
    } = record;
    const search = querystring.stringify({
      sourceTitle: rfxTitle,
      scoredStatus: scoreStatus,
      sourceStatus: rfxStatus,
      sourceNum: rfxNum,
      evaluateLeaderFlag,
      sourcePage: 'RFXLIST',
      sourceFrom: 'RFX',
      cachTabKey: 'scoreing',
      evaluateExpertId,
      projectLineSectionId,
      sourceProjectId,
      multiSectionFlag,
    });

    dispatch(
      routerRedux.push({
        pathname: `/ssrc/expert-scoring/${rfxHeaderId}/${userId}/${subjectMatterRule}/${currentSequenceNum}/RFX/update`,
        search,
      })
    );
  }

  /**
   * 跳转到评分管理页面
   *
   * @param {*} record
   * @memberof inquiryHall
   */
  @Bind()
  directScoreManager(record = {}) {
    const { dispatch } = this.props;
    const { rfxHeaderId = null, scoreStatus, rfxStatus, evaluateLeaderFlag } = record;
    const search = querystring.stringify({
      evaluateLeaderFlag,
      cachTabKey: 'scoreing',
      sourceFrom: 'RFX',
      sourceHeaderId: rfxHeaderId,
      sourceStatus: rfxStatus,
      sourcePage: 'RFXList',
      backRecommend: 'recommend',
    });

    if (scoreStatus === 'SCORING' || scoreStatus === 'ROUND_QUOTATION') {
      dispatch(
        routerRedux.push({
          pathname: `/ssrc/expert-scoring/rfx-evaluation-proc-manage/${rfxHeaderId}`,
          search,
        })
      );
    }

    if (scoreStatus === 'RFX_EVALUATION_PENDING') {
      dispatch(
        routerRedux.push({
          pathname: `/ssrc/expert-scoring/rfx-evaluation/${rfxHeaderId}`,
          search,
        })
      );
    }

    if (
      scoreStatus === 'PRE_EVALUATION_PENDING_REJECT' ||
      scoreStatus === 'PRE_EVALUATION_PENDING'
    ) {
      dispatch(
        routerRedux.push({
          pathname: `/ssrc/expert-scoring/confirm-candidate/${rfxHeaderId}`,
          search,
        })
      );
    }
  }

  /**
   * 跳转到资格预审
   * */
  @Bind()
  directPrequalification(record = {}) {
    const { history } = this.props;
    const { prequalHeaderId, sourceProjectId, prequalGroupHeaderId } = record;
    const search = this.getDirectSearch(record);
    if (isNil(prequalGroupHeaderId)) {
      // 非立项标段合并
      return history.push({
        pathname: `/ssrc/qualification-examination/detail/${prequalHeaderId}`,
        search,
      });
    }
    history.push({
      pathname: `/ssrc/qualification-examination/section-detail/${prequalGroupHeaderId}`,
      search: `${search}&sourceProjectId=${sourceProjectId}`,
    });
  }

  // /**
  //  * 跳转到待定标，确认候选人页面
  //  * @param {Object} record = {}
  //  */
  // @Bind()
  // confirmCandidate(record) {
  //   const { dispatch } = this.props;
  //   const search = this.getDirectSearch(record);
  //   dispatch(
  //     routerRedux.push({
  //       pathname: `/ssrc/inquiry-hall/confirm-candidate/${record.rfxHeaderId}`,
  //       search,
  //     })
  //   );
  // }

  /**
   * 跳转到澄清答疑详情
   */
  @Bind()
  directQuestionAnswer(record) {
    const { dispatch } = this.props;

    const { rfxHeaderId, rfxNum, companyId, sourceCategory } = record;
    const url = `/ssrc/inquiry-hall/inter-question/${rfxHeaderId}/${rfxNum}/sourceTitle/${companyId}/1`;
    const search = querystring.stringify({
      createFlag: record.createFlag,
      sourceCategory,
    });
    dispatch(
      routerRedux.push({
        pathname: url,
        search,
      })
    );
  }

  /**
   * 展示报价响应不足modal
   * @param {!Object} record - 行记录
   */
  @Bind()
  handleShowQuoFeedBackLackModal(record = {}) {
    const { dispatch, organizationId } = this.props;
    this.setState(
      {
        quoLackModalVisible: true,
        currentRecord: record,
      },
      () => {
        dispatch({
          type: 'inquiryHall/quotationFeedBackLack',
          payload: { organizationId, rfxHeaderId: record.rfxHeaderId },
        });
      }
    );
  }

  /**
   * 隐藏报价响应不足modal
   */
  @Bind()
  handleQuoFeedBackLackModalHide() {
    this.setState({
      quoLackModalVisible: false,
    });
  }

  /**
   * 调整时间
   */
  @Bind()
  handleAdjustTime() {
    const { dispatch } = this.props;
    const { currentRecord = {} } = this.state;
    const search = querystring.stringify({
      openTimeControlFlag: true,
    });
    dispatch(
      routerRedux.push({
        pathname: `/ssrc/inquiry-hall/rfx-detail-controller/${currentRecord.rfxHeaderId}`,
        search,
      })
    );
  }

  /**
   * 关闭询价单
   */
  @Bind()
  handleCloseRfx() {
    const {
      dispatch,
      organizationId,
      inquiryHall: { pagination = {} },
    } = this.props;
    const { currentRecord = {} } = this.state;
    dispatch({
      type: 'inquiryHall/closeRfx',
      payload: {
        organizationId,
        rfxHeaderId: currentRecord.rfxHeaderId,
      },
    }).then((res) => {
      if (res) {
        notification.success();
        this.setState({
          quoLackModalVisible: false,
          currentRecord: {},
        });
        this.handleSearch(pagination);
      }
    });
  }

  /**
   * 下发专家评分
   */
  @Bind()
  handleSendExpertScore() {
    const {
      dispatch,
      organizationId,
      inquiryHall: { pagination = {} },
    } = this.props;
    const { currentRecord = {} } = this.state;
    dispatch({
      type: 'inquiryHall/sendExpertScore',
      payload: {
        organizationId,
        rfxHeaderId: currentRecord.rfxHeaderId,
      },
    }).then((res) => {
      if (res) {
        notification.success();
        this.setState({
          quoLackModalVisible: false,
          currentRecord: {},
        });
        this.handleSearch(pagination);
      }
    });
  }

  /**
   * 开始-进入下一个状态
   */
  @Bind()
  handleStartNextRfxStatus() {
    const {
      dispatch,
      organizationId,
      inquiryHall: { pagination = {} },
    } = this.props;
    const { currentRecord = {} } = this.state;
    dispatch({
      type: 'inquiryHall/startNextRfxStatus',
      payload: {
        organizationId,
        rfxHeaderId: currentRecord.rfxHeaderId,
        rfxStatus: currentRecord.nextRfxStatus,
      },
    }).then((res) => {
      if (res) {
        notification.success();
        this.setState({
          quoLackModalVisible: false,
          currentRecord: {},
        });
        this.handleSearch(pagination);
      }
    });
  }

  /**
   * 跳转到招投标时带参
   *
   * @param {*} [record={}]
   * @returns
   * @memberof InquiryHall
   */
  getDirectSearch(record = {}) {
    const { rfxHeaderId = '' } = record;
    const search = querystring.stringify({
      sourceFrom: 'RFX',
      sourceHeaderId: rfxHeaderId,
      sourcePage: 'RFXList',
    });

    return search;
  }

  /**
   * 点击开标校验
   */
  @Bind()
  openingBidModel(record) {
    if (record) {
      this.setState({
        rfxHeaderId: record.rfxHeaderId,
      });
      if (record.openedFlag === 1) {
        notification.warning({
          message: intl
            .get(`ssrc.inquiryHall.view.message.confirm.notOpenAgain`)
            .d('已开标,不允许再次开标!'),
        });
      } else if (record.passwordFlag === 0) {
        Modal.confirm({
          title: intl
            .get(`ssrc.inquiryHall.view.message.confirm.sureOpeningBid`)
            .d('是否确认开标?'),
          onOk: () => {
            const { dispatch } = this.props;
            dispatch({
              type: 'inquiryHall/openingBid',
              payload: {
                rfxHeaderId: record.rfxHeaderId,
              },
            }).then((res) => {
              if (res) {
                const {
                  inquiryHall: { pagination = {} },
                } = this.props;
                this.handleSearch(pagination);
              }
            });
          },
        });
      } else if (record.passwordFlag === null) {
        notification.warning({
          message: intl
            .get(`ssrc.inquiryHall.view.message.confirm.notAllowedOpen`)
            .d('当前用户不在开标人列表中,不允许开标!'),
        });
      } else {
        this.setState({
          openingBidVisible: true,
        });
      }
    }
  }

  /**
   * confirmOpeningBid - 开标
   */
  @Bind()
  confirmOpeningBid() {
    const { rfxHeaderId } = this.state;
    const fieldValues = isUndefined(this.openingBidForm)
      ? {}
      : filterNullValueObject(this.openingBidForm.getFieldsValue());
    const { dispatch } = this.props;
    this.openingBidForm.validateFields((err) => {
      if (!err) {
        dispatch({
          type: 'inquiryHall/openingBid',
          payload: {
            ...fieldValues,
            rfxHeaderId,
          },
        }).then((res) => {
          if (res) {
            const {
              inquiryHall: { pagination = {} },
            } = this.props;
            this.handleSearch(pagination);
            this.setState({ openingBidVisible: false });
          }
        });
      }
    });
  }

  @Bind()
  resendPassword() {
    const { rfxHeaderId } = this.state;
    const { dispatch } = this.props;
    dispatch({
      type: 'inquiryHall/resendPassword',
      payload: {
        rfxHeaderId,
      },
    }).then((res) => {
      if (res) {
        // Modal.confirm({
        //   title: intl
        //     .get(`ssrc.inquiryHall.view.message.confirm.GetTheOpeningPassword`)
        //     .d('获取开标密码?'),
        //   content: res.openPassword,
        // });
        notification.success();
      }
    });
  }

  /**
   * 点击操作
   */
  @Bind()
  onOperateBidModel(record) {
    // 查询操作入口list数据
    const { dispatch, organizationId, rfxStatus = 'OPENED' } = this.props;
    dispatch({
      type: 'inquiryHall/quotationFeedBack',
      payload: { organizationId, rfxHeaderId: record.rfxHeaderId, rfxStatus },
    });
    this.setState({
      operationBidVisible: true,
      record,
    });
  }

  /**
   * hideOpeningBid - 关闭开标弹窗
   */
  @Bind()
  hideOpeningBid() {
    this.setState({ openingBidVisible: false });
  }

  /**
   * hideoOperationBid - 关闭操作弹窗
   */
  @Bind()
  hideoOperationBid() {
    this.setState({ operationBidVisible: false });
  }

  /**
   * sendExpertScore - 下发专家评分
   */
  @Bind()
  sendExpertScore() {
    const { dispatch, organizationId } = this.props;
    const { record } = this.state;
    dispatch({
      type: 'inquiryHall/sendExpertScore',
      payload: { organizationId, rfxHeaderId: record.rfxHeaderId },
    }).then((res) => {
      if (res) {
        this.setState({ operationBidVisible: false, record: {} });
        const {
          inquiryHall: { pagination = {} },
        } = this.props;
        this.handleSearch(pagination);
      }
    });
  }

  /**
   * closeRfx - 关闭询价单
   */
  @Bind()
  closeRfx() {
    const { dispatch, organizationId } = this.props;
    const { record } = this.state;
    dispatch({
      type: 'inquiryHall/closeRfx',
      payload: { organizationId, rfxHeaderId: record.rfxHeaderId },
    }).then((res) => {
      if (res) {
        this.setState({ operationBidVisible: false, record: {} });
        const {
          inquiryHall: { pagination = {} },
        } = this.props;
        this.handleSearch(pagination);
      }
    });
  }

  /**
   * startPretrial - 开始初审
   */
  @Bind()
  startPretrial() {
    const { dispatch, organizationId } = this.props;
    const { record } = this.state;
    dispatch({
      type: 'inquiryHall/startPretrial',
      payload: { organizationId, rfxHeaderId: record.rfxHeaderId, rfxStatus: 'PRETRIAL_PENDING' },
    }).then((res) => {
      if (res) {
        this.setState({ operationBidVisible: false, record: {} });
        const {
          inquiryHall: { pagination = {} },
        } = this.props;
        this.handleSearch(pagination);
      }
    });
  }

  /**
   * startPretrial - 开始核价
   */
  @Bind()
  startCheckPrice() {
    const { dispatch, organizationId } = this.props;
    const { record } = this.state;
    dispatch({
      type: 'inquiryHall/startCheckPrice',
      payload: { organizationId, rfxHeaderId: record.rfxHeaderId, rfxStatus: 'CHECK_PENDING' },
    }).then((res) => {
      if (res) {
        this.setState({ operationBidVisible: false, record: {} });
        const {
          inquiryHall: { pagination = {} },
        } = this.props;
        this.handleSearch(pagination);
      }
    });
  }

  /**
   * 报价响应
   */
  @Bind()
  quotationFeedBack(record) {
    const { dispatch, organizationId } = this.props;
    dispatch({
      type: 'inquiryHall/quotationFeedBack',
      payload: { organizationId, rfxHeaderId: record.rfxHeaderId },
    }).then((res) => {
      if (res) {
        this.setState({ visible: true });
      }
    });
  }

  /**
   * 报价响应-确定关闭模态框
   */
  @Bind()
  handleOkModal() {
    this.setState({ visible: false });
  }

  // 清空筛选表单
  @Bind()
  resetFormFields() {
    this.setState({
      originSourceStatus: [],
    });
  }

  /**
   * 跳转到监控台
   */
  @Bind()
  goMonitor(record) {
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `/ssrc/inquiry-hall/quotation-monitor/${record.rfxHeaderId}`,
        state: record.rfxHeaderId,
      })
    );
  }

  @Bind()
  projectToInquiryOpen() {
    const { dispatch } = this.props;
    dispatch({
      type: 'commonModel/updateState',
      payload: {
        inquiryHallProjectModalVisible: true,
      },
    });
  }

  @Bind()
  projectToInquiryClose() {
    const { dispatch } = this.props;
    dispatch({
      type: 'commonModel/updateState',
      payload: {
        inquiryHallProjectModalVisible: false,
      },
    });
  }

  @Bind()
  createModalHide() {
    this.setState({ createModalVisible: false });
  }

  @Bind()
  createModalShow(selectedRows) {
    this.setState({
      createModalVisible: true,
      projectApprovalToBiddingRows: selectedRows,
    });
  }

  /**
   * 选择寻源模板,申请转询价
   * @param params
   */
  @Bind()
  createInquiry(params = {}) {
    const { projectApprovalToBiddingRows } = this.state;
    const { dispatch, organizationId } = this.props;

    dispatch({
      type: 'inquiryHall/sourcingCreate',
      payload: {
        organizationId,
        ...projectApprovalToBiddingRows[0],
        ...params,
      },
    }).then((res) => {
      if (res) {
        notification.success();
        this.handleSearch();
        this.setState({ createModalVisible: false, projectApprovalToBiddingRows: [] });
        const { rfxHeaderId } = res;
        dispatch(
          routerRedux.push({
            pathname: `/ssrc/inquiry-hall/rfx-update/${rfxHeaderId}`,
          })
        );
      }
    });
  }

  /**
   * 复制历史单据确定的回调
   */
  @Bind()
  copyHistoryOrderModal() {
    const { selected } = this.tableDs;
    const { dispatch, organizationId, history } = this.props;
    if (selected && selected.length > 0) {
      this.tableDs.unSelect(this.tableDs.selected[0]);
      dispatch({
        type: 'inquiryHall/copyHistoryOrderModal',
        payload: { rfxHeaderId: selected[0].data.rfxHeaderId, organizationId },
      }).then((res) => {
        if (res) {
          history.push(`/ssrc/inquiry-hall/rfx-update/${res.rfxHeaderId}`);
        }
      });
    } else {
      notification.warning({
        message: intl
          .get('ssrc.inquiryhall.message.pleaseSelectAtleastOne')
          .d('请至少选择一条数据进行复制'),
      });
      return false;
    }
  }

  /**
   * 复制历史单据
   */
  @Bind()
  copyHistoryOrder() {
    this.tableDs.query();
    const historyOrderModalProps = {
      tableDs: this.tableDs,
    };
    const modalKey = C7nModal.key();
    C7nModal.open({
      destroyOnClose: true,
      key: modalKey,
      title: intl.get(`ssrc.inquiryHall.view.message.button.copyRFX`).d('复制历史单据'),
      children: <HistoryOrderModal {...historyOrderModalProps} />,
      style: { width: '80%' },
      onOk: this.copyHistoryOrderModal,
      onCancel: () => {},
      afterClose: () => {
        this.tableDs.queryDataSet.current.reset();
      },
    });
  }

  // temporary
  @Bind()
  copyHistoryOrderModalNew() {
    const { selected } = this.tableDs;
    const { dispatch, organizationId, history } = this.props;
    if (selected && selected.length > 0) {
      this.tableDs.unSelect(this.tableDs.selected[0]);
      dispatch({
        type: 'inquiryHall/copyHistoryOrderModal',
        payload: { rfxHeaderId: selected[0].data.rfxHeaderId, organizationId },
      }).then((res) => {
        if (res && Number(res)) {
          history.push(`/ssrc/inquiry-hall/rfx-update/${res}`);
        }
      });
    } else {
      notification.warning({
        message: intl
          .get('ssrc.inquiryhall.message.pleaseSelectAtleastOne')
          .d('请至少选择一条数据进行复制'),
      });
      return false;
    }
  }

  render() {
    const {
      customizeTable,
      customizeFilterForm,
      closeRfxLoading,
      sendExpertScoreLoading,
      startNextRfxStatusLoading,
      openingBidLoading,
      fetchDataLoading,
      resendPasswordLoading,
      fetchQuotationFeedBackLoading,
      fetchQuotationFeedBackLackLoading,
      inquiryHall: {
        list = [],
        pagination = {},
        quotationFeedBackList = [],
        quotationFeedBackLackList = [],
        code: {
          sourceMethod = [],
          rfxStatus = [],
          auctionDirection = [],
          sourceCategory = [],
          quotationType = [],
        },
      },
      commonModel: { inquiryHallProjectModalVisible = false },
      match: { path = null },
      creteLoading,
    } = this.props;
    const {
      visible = false,
      openingBidVisible,
      operationBidVisible,
      createModalVisible,
      quoLackModalVisible,
      record,
      originSourceStatus = [],
      currentRecord = {},
      projectApprovalToBiddingRows,
    } = this.state;

    const formProps = {
      customizeFilterForm,
      sourceMethod,
      rfxStatus,
      auctionDirection,
      sourceCategory,
      quotationType,
      onSearch: this.handleSearch,
      onRef: this.handleBindRef,
      originSourceStatus,
      resetFormFields: this.resetFormFields,
    };
    const tableProps = {
      path,
      customizeTable,
      sourceMethod,
      rfxStatus,
      auctionDirection,
      pagination,
      dataSource: list,
      loading: fetchDataLoading,
      onChange: this.handleSearch,
      onInquiryUpdate: this.inquiryUpdate,
      onPreliminary: this.openPreliminary,
      onInquiryDetail: this.inquiryDetail,
      onQuotationFeedBack: this.quotationFeedBack,
      onInquiryCheckPrice: this.inquiryCheckPrice,
      onOperateBidModel: this.onOperateBidModel,
      onInquiryFeedbackBargain: this.inquiryFeedbackBargain,
      onOpeningBid: this.openingBidModel,
      onGoMonitor: this.goMonitor,
      rfxEvaluation: this.rfxEvaluation,
      directScoreManager: this.directScoreManager,
      directPrequalification: this.directPrequalification,
      directQuestionAnswer: this.directQuestionAnswer,
      onShowQuoFeedBackLackModal: this.handleShowQuoFeedBackLackModal,
      directBidWinnerNotice: this.directBidWinnerNotice,
    };

    const drawerProps = {
      visible,
      loading: fetchQuotationFeedBackLoading,
      dataSource: quotationFeedBackList,
      onOk: this.handleOkModal,
      onCancel: this.handleOkModal,
    };
    const OpeningBidProps = {
      openingBidLoading,
      resendPasswordLoading,
      visible: openingBidVisible,
      hideModal: this.hideOpeningBid,
      confirmOpeningBid: this.confirmOpeningBid,
      resendPassword: this.resendPassword,
      onRef: this.onRef,
    };
    const operationBidProps = {
      loading: fetchQuotationFeedBackLoading,
      dataSource: quotationFeedBackList,
      record,
      visible: operationBidVisible,
      hideModal: this.hideoOperationBid,
      closeRfx: this.closeRfx,
      sendExpertScore: this.sendExpertScore,
      startPretrial: this.startPretrial,
      startCheckPrice: this.startCheckPrice,
    };
    const projectToInquiryProps = {
      visible: inquiryHallProjectModalVisible,
      onCancel: this.projectToInquiryClose,
      createModalShow: this.createModalShow,
    };

    const createModalProps = {
      visible: createModalVisible,
      loading: creteLoading,
      projectApprovalToBiddingRows,
      createInquiry: this.createInquiry,
      onCancel: this.createModalHide,
    };

    const quoLackModalProps = {
      path,
      closeRfxLoading,
      sendExpertScoreLoading,
      startNextRfxStatusLoading,
      record: currentRecord,
      visible: quoLackModalVisible,
      loading: fetchQuotationFeedBackLackLoading,
      dataSource: quotationFeedBackLackList,
      onAdjustTime: this.handleAdjustTime,
      onCloseRfx: this.handleCloseRfx,
      onSendExpertScore: this.handleSendExpertScore,
      onCancel: this.handleQuoFeedBackLackModalHide,
      onStartNextRfxStatus: this.handleStartNextRfxStatus,
    };

    return (
      <React.Fragment>
        <Header title={intl.get(`ssrc.inquiryHall.view.message.title.inquiryHall`).d('寻源大厅')}>
          <PermissionButton
            icon="check"
            type="primary"
            onClick={this.inquiryCreate}
            permissionList={[
              {
                code: `${this.props.match.path}.button.create`,
                type: 'button',
                meaning:
                  intl.get(`ssrc.inquiryHall.view.message.title.inquiryHall`).d('寻源大厅') -
                  intl
                    .get(`ssrc.inquiryHall.view.message.button.creatRFXManually`)
                    .d('手工创建询价'),
              },
            ]}
          >
            {intl.get(`ssrc.inquiryHall.view.message.button.creatRFXManually`).d('手工创建询价')}
          </PermissionButton>
          <PermissionButton
            icon="book"
            type="default"
            onClick={this.jumpApplyToInquiry}
            permissionList={[
              {
                code: `${this.props.match.path}.button.applytoinquiry`,
                type: 'button',
                meaning:
                  intl.get(`ssrc.inquiryHall.view.message.title.inquiryHall`).d('寻源大厅') -
                  intl.get(`ssrc.inquiryHall.view.message.button.ApplyToInquiry`).d('申请转询价'),
              },
            ]}
          >
            {intl.get(`ssrc.inquiryHall.view.message.button.ApplyToInquiry`).d('申请转询价')}
          </PermissionButton>
          <PermissionButton
            icon="copy"
            onClick={this.copyHistoryOrder}
            permissionList={[
              {
                code: `${this.props.match.path}.button.copy`,
                type: 'button',
                meaning:
                  intl.get(`ssrc.inquiryHall.view.message.title.inquiryHall`).d('寻源大厅') -
                  intl.get(`ssrc.inquiryHall.view.message.button.copyRFX`).d('复制历史单据'),
              },
            ]}
          >
            {intl.get(`ssrc.inquiryHall.view.message.button.copyRFX`).d('复制历史单据')}
          </PermissionButton>
          <PermissionButton
            icon="book"
            onClick={this.projectToInquiryOpen}
            permissionList={[
              {
                code: `${this.props.match.path}.button.projectapprovaltoinquiry`,
                type: 'button',
                meaning:
                  intl.get(`ssrc.inquiryHall.view.message.title.inquiryHall`).d('寻源大厅') -
                  intl.get(`ssrc.inquiryHall.view.message.button.projAppInquiry`).d('立项转询价'),
              },
            ]}
          >
            {intl.get(`ssrc.inquiryHall.view.message.button.projAppInquiry`).d('立项转询价')}
          </PermissionButton>
        </Header>
        <Content>
          <div className="table-list-search">
            <FilterForm {...formProps} />
          </div>
          <TableList {...tableProps} />
        </Content>
        <Drawer {...drawerProps} />
        {/* modal */}
        {openingBidVisible && <OpeningBid {...OpeningBidProps} />}
        {operationBidVisible && <OperationBid {...operationBidProps} />}
        {inquiryHallProjectModalVisible && <ProjectToInquiry {...projectToInquiryProps} />}
        {createModalVisible && <CreateModal {...createModalProps} />}
        {quoLackModalVisible && <QuoFeedBackLackModal {...quoLackModalProps} />}
      </React.Fragment>
    );
  }
}
