/**
 * bidHall - 寻源服务/招标大厅
 * @date: 2018-12-25
 * @author: CJ <juan.chen01@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { connect } from 'dva';
// import { Button } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isUndefined, isEmpty } from 'lodash';
import { routerRedux } from 'dva/router';
import querystring from 'querystring';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { Button as PermissionButton } from 'components/Permission';

import notification from 'utils/notification';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';
import intl from 'utils/intl';
import { filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';

import FilterForm from './FilterForm';
import TableList from './TableList';
import Drawer from './Drawer';
import OpeningBid from './OpeningBid';
import OperationBid from './OperationBid';
import OperationRecord from '../components/OperationRecord';
import QuoteApproval from './ProjectApprovalToBidding';
import CreateModal from './CreateModal';

@formatterCollections({ code: ['ssrc.bidHall', 'ssrc.common'] })
@withCustomize({
  unitCode: [
    'SSRC.BID_HALL.LIST', // 招标大厅列表
  ],
})
@connect(({ bidHall, commonModel, loading }) => ({
  bidHall,
  commonModel,
  resendPasswordLoading: loading.effects['bidHall/resendPassword'],
  fetchDataLoading: loading.effects['bidHall/fetchDataList'],
  bidOpenDataLoading: loading.effects['bidHall/bidOpenList'],
  operateBidDataLoading: loading.effects['bidHall/operateBidList'],
  fetchQuotationFeedBackLoading: loading.effects['bidHall/quotationFeedBack'],
  closeScalingLoading: loading.effects['bidHall/closeScaling'],
  openScalingLoading: loading.effects['bidHall/openScaling'],
  sendExpertScoreLoading: loading.effects['bidHall/sendExpertScore'],
  creteLoading: loading.effects['bidHall/sourcingItemCreate'],
  organizationId: getCurrentOrganizationId(),
}))
export default class BidHall extends Component {
  form;

  constructor(props) {
    super(props);
    this.state = {
      visible: false, // 投标响应模态框
      // approvalToBiddingVisible: false, // 立项转招标模态框
      openingBidVisible: false, // 开标模态框
      operationBidVisible: false, // 操作模态框
      operationRecordModalVisible: false, // 操作记录模态框
      createModalVisible: false, // 选择寻源模板模态框
      bidHeaderId: null,
      tableRecord: {}, // 表格中的一条记录
      expertScoreType: '',
      preQualificationFlag: true, // 行数据上是否有资格预审
      originSourceStatus: [], // 工作台跳转带的状态参数
      projectApprovalToBiddingRows: [],
    };
  }

  getSnapshotBeforeUpdate(prevProps = {}) {
    const sourceStatus = this.getSourceStatus(this.props);
    const originSourceStatus = this.getSourceStatus(prevProps);
    const { sourceHeaderId = '' } = querystring.parse(this.props.location.search.substr(1));
    const { sourceHeaderId: originSourceHeaderId = '' } = querystring.parse(
      prevProps.location.search.substr(1)
    );
    if (
      JSON.stringify(sourceStatus) !== JSON.stringify(originSourceStatus) ||
      sourceHeaderId !== originSourceHeaderId
    ) {
      return true;
    }
    return false;
  }

  componentDidUpdate(...params) {
    if (params[2]) {
      this.initStatusQuery();
    }
  }

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
        bidStatusSet: sourceStatus,
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
   *
   * @memberof BidHall
   */
  initQuery(data = {}) {
    const {
      dispatch,
      bidHall: { bidPagination = {} },
    } = this.props;
    this.handleSearch(bidPagination, data);
    const lovCodes = {
      sourceMethod: 'SSRC.SOURCE_METHOD', // 寻源方式
      bidStatus: 'SSRC.BID_STATUS', // 询价单状态
      auctionDirection: 'SSRC.SOURCE_AUCTION_DIRECTION', // 投标方向
      quotationType: 'SSRC.QUOTATION_TYPE', // 投标方式
      bidType: 'SSRC.BID_TYPE', // 招标类别
    };
    dispatch({
      type: 'bidHall/batchCode',
      payload: { lovCodes },
    });
    // 查询配置中心, ip重合率
    dispatch({
      type: `bidHall/querySetting`,
      payload: {
        '011107': '011107', // ip校验
      },
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
   * 操作记录
   */
  @Bind()
  operationRender(record) {
    const { organizationId, dispatch } = this.props;
    const page = {};
    this.setState({
      operationRecordModalVisible: true,
      bidHeaderId: record.bidHeaderId,
    });
    dispatch({
      type: 'commonModel/operationRecord',
      payload: {
        page,
        organizationId,
        bidHeaderId: record.bidHeaderId,
      },
    });
  }

  /**
   * 跳转到澄清答疑详情
   */
  @Bind()
  directQuestionAnswer(record) {
    const { dispatch } = this.props;

    const { bidHeaderId, bidNum, companyId } = record;
    const url = `/ssrc/bid-hall/inter-question/${bidHeaderId}/${bidNum}/sourceTitle/${companyId}/1`;
    const search = querystring.stringify({
      quotationEndDateFlag: record.quotationEndFlag,
      isClarificationFlag: record.isClarificationFlag,
      createFlag: record.createFlag,
    });
    dispatch(
      routerRedux.push({
        pathname: url,
        search,
      })
    );
  }

  /**
   * 查询
   * @param {object} fields - 查询参数
   */
  @Bind()
  handleSearch(page = {}, data = {}) {
    const { dispatch, organizationId, location } = this.props;
    const { sourceHeaderId } = querystring.parse(location.search.substr(1));
    const fieldValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    const handleFormValues = this.handleFormQuery(fieldValues);
    const bidStatusSet = fieldValues.bidStatusSet || [];
    // 解决bidStatus被覆盖的问题
    const params =
      isEmpty(data) || (!isEmpty(data) && data.bidStatusSet && isEmpty(data.bidStatusSet))
        ? {
            page,
            organizationId,
            ...handleFormValues,
            bidStatusSet,
          }
        : {
            page,
            organizationId,
            ...handleFormValues,
            bidStatusSet,
            ...data,
          };
    dispatch({
      type: 'bidHall/fetchDataList',
      payload: filterNullValueObject({
        ...params,
        bidHeaderId: sourceHeaderId,
        customizeUnitCode: 'SSRC.BID_HALL.LIST',
      }),
    });
  }

  /**
   * 处理表单中的查询条件
   * @param {Object} filterValues
   * @param {String} radioTab
   */
  handleFormQuery(filterValues) {
    const dealFromTime = {};
    const dealToTime = {};
    const timeFromArray = ['bidCreateStartDate'];
    const timeToArray = ['bidCreateEndDate'];
    timeFromArray.forEach((item) => {
      dealFromTime[item] = filterValues[item] ? filterValues[item].format(DATETIME_MIN) : undefined;
    });
    timeToArray.forEach((item) => {
      dealToTime[item] = filterValues[item] ? filterValues[item].format(DATETIME_MAX) : undefined;
    });
    return {
      ...filterValues,
      ...dealFromTime,
      ...dealToTime,
    };
  }

  // 清空筛选表单
  @Bind()
  resetFormFields() {
    this.setState({
      originSourceStatus: [],
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
  onBidUpdate(record) {
    const { dispatch } = this.props;
    const { bidRuleType = '', subjectMatterRule = '' } = record;
    const search = querystring.stringify({
      bidRuleType,
      subjectMatterRule,
    });

    dispatch(
      routerRedux.push({
        pathname: `/ssrc/bid-hall/bid-update/${record.bidHeaderId}`,
        search,
      })
    );
  }

  /**
   * 跳转到预评标页面
   */
  @Bind()
  preBid(record) {
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `/ssrc/bid-hall/pre-detail/${record.bidHeaderId}`,
      })
    );
  }

  /**
   * 跳转到中标结果确认页面
   */
  @Bind()
  openPreliminary(record) {
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `/ssrc/bid-hall/Pretrial/${record.bidHeaderId}`,
      })
    );
  }

  /**
   * 跳转到明细页面
   */
  @Bind()
  inquiryDetail(record) {
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `/ssrc/bid-hall/bid-detail/${record.bidHeaderId}`,
        search: `?source=${record.subjectMatterRule}`,
      }),
      {
        type: 'bidHall/updateState',
        payload: {
          historys: `/ssrc/bid-hall/bid-detail/${record.bidHeaderId}`,
        },
      }
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
        pathname: `/ssrc/bid-hall/create`,
      })
    );
  }

  /**
   * 跳转到申请转招标
   */
  @Bind()
  jumpApplyToInquiry() {
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `/ssrc/bid-hall/apply-to-inquiry`,
      })
    );
  }

  /**
   * 跳转到评标页面
   */
  @Bind()
  inquiryCheckPrice(record) {
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `/ssrc/bid-hall/bid-evaluation/${record.bidHeaderId}`,
      })
    );
  }

  /**
   * 点击开标校验
   */
  @Bind()
  openingBidModel(record) {
    if (record) {
      this.setState({
        bidHeaderId: record.bidHeaderId,
      });
      if (record.openedFlag === 1) {
        notification.warning({
          message: intl
            .get(`ssrc.bidHall.view.message.confirm.noReBiding`)
            .d('已开标,不允许再次开标!'),
        });
      } else if (record.passwordFlag === null) {
        notification.warning({
          message: intl
            .get(`ssrc.bidHall.view.message.confirm.notAllowedOpen`)
            .d('当前用户不在开标人列表中,不允许开标!'),
        });
      } else {
        // 查询开标入口list数据
        const { dispatch, organizationId } = this.props;
        dispatch({
          type: 'bidHall/bidOpenList',
          payload: {
            bidHeaderId: record.bidHeaderId,
            organizationId,
          },
        });
        this.setState({
          openingBidVisible: true,
          tableRecord: record,
        });
      }
    }
  }

  /**
   * 点击操作
   */
  @Bind()
  onOperateBidModel(record) {
    // 查询操作入口list数据
    const { dispatch, organizationId } = this.props;
    dispatch({
      type: 'bidHall/operateBidList',
      payload: {
        bidHeaderId: record.bidHeaderId,
        organizationId,
      },
    });
    this.setState({
      operationBidVisible: true,
      bidHeaderId: record.bidHeaderId,
      expertScoreType: record.expertScoreType,
    });
  }

  /**
   * 关闭定标
   */
  @Bind()
  closeScaling(values) {
    const { dispatch, organizationId } = this.props;
    const { bidHeaderId } = this.state;
    dispatch({
      type: 'bidHall/closeScaling',
      payload: {
        bidHeaderId,
        organizationId,
        ...values,
      },
    }).then((res) => {
      if (res) {
        this.operationBidRef.hideBiddingReason();
        this.setState({ operationBidVisible: false, bidHeaderId: null });
        const {
          bidHall: { bidPagination = {} },
        } = this.props;
        this.handleSearch(bidPagination);
      }
    });
  }

  /**
   * 开始定标
   */
  @Bind()
  openScaling() {
    const { dispatch, organizationId } = this.props;
    const { bidHeaderId } = this.state;

    dispatch({
      type: 'bidHall/openScaling',
      payload: {
        bidHeaderId,
        organizationId,
      },
    }).then((res) => {
      if (res) {
        this.setState({ operationBidVisible: false, bidHeaderId: null });
        const {
          bidHall: { bidPagination = {} },
        } = this.props;
        this.handleSearch(bidPagination);
      }
    });
  }

  /**
   * confirmOpeningBid - 开标
   */
  @Bind()
  confirmOpeningBid() {
    const { bidHeaderId } = this.state;
    const fieldValues = isUndefined(this.openingBidForm)
      ? {}
      : filterNullValueObject(this.openingBidForm.getFieldsValue());
    const { dispatch } = this.props;
    dispatch({
      type: 'bidHall/openingBid',
      payload: {
        ...fieldValues,
        bidHeaderId,
      },
    }).then((res) => {
      if (res) {
        const {
          bidHall: { bidPagination = {} },
        } = this.props;
        this.handleSearch(bidPagination);
      }
    });
    this.setState({ openingBidVisible: false });
  }

  @Bind()
  resendPassword() {
    const { bidHeaderId } = this.state;
    const { dispatch } = this.props;
    dispatch({
      type: 'bidHall/resendPassword',
      payload: {
        bidHeaderId,
      },
    }).then((res) => {
      if (res) {
        // Modal.confirm({
        //   title: intl
        //     .get(`ssrc.bidHall.view.message.confirm.GetTheOpeningPassword`)
        //     .d('获取开标密码?'),
        //   content: res.password,
        // });
        notification.success();
      }
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

  @Bind()
  sendExpertScore() {
    const { bidHeaderId } = this.state;
    const { dispatch } = this.props;
    dispatch({
      type: 'bidHall/sendExpertScore',
      payload: {
        bidHeaderId,
      },
    }).then((res) => {
      if (res) {
        this.setState({ operationBidVisible: false, bidHeaderId: null });
        const {
          bidHall: { bidPagination = {} },
        } = this.props;
        this.handleSearch(bidPagination);
      }
    });
  }

  /**
   * 投标响应
   */
  @Bind()
  quotationFeedBack(record) {
    const { dispatch, organizationId } = this.props;
    dispatch({
      type: 'bidHall/quotationFeedBack',
      payload: { organizationId, bidHeaderId: record.bidHeaderId },
    }).then((res) => {
      if (res) {
        const { preQualificationFlag } = record;
        this.setState({ visible: true, preQualificationFlag });
      }
    });
  }

  /**
   * 投标响应-确定关闭模态框
   */
  @Bind()
  handleOkModal() {
    this.setState({ visible: false });
  }

  /**
   * 跳转到监控台
   */
  @Bind()
  goMonitor(record) {
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `/ssrc/bid-hall/quotation-monitor/${record.bidHeaderId}`,
        state: record.bidHeaderId,
      })
    );
  }

  /**
   * hideOperationRecord - 关闭操作记录弹窗
   */
  @Bind()
  hideOperationRecord() {
    this.setState({ operationRecordModalVisible: false });
    this.props.dispatch({
      type: 'commonModel/updateState',
      payload: {
        operationPagination: {},
        operationData: [],
      },
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
    const { bidHeaderId = '' } = record;
    const search = querystring.stringify({
      sourceFrom: 'BID',
      sourceHeaderId: bidHeaderId,
    });

    return search;
  }

  // /**
  //  * 跳转到评标管理评分结果确认页面
  //  * @param {Object} record
  //  */
  // @Bind()
  // bidEvaluation(record) {
  //   const { dispatch } = this.props;
  //   const search = this.getDirectSearch(record);

  //   dispatch(
  //     routerRedux.push({
  //       pathname: `/ssrc/bid-hall/bid-evaluation/${record.bidHeaderId}`,
  //       search,
  //     })
  //   );
  // }

  // /**
  //  * 跳转到评标管理页面
  //  *
  //  * @param {*} record
  //  * @memberof BidHall
  //  */
  // @Bind()
  // bidEvaluationProcess(record) {
  //   const { dispatch } = this.props;
  //   const search = this.getDirectSearch(record);

  //   dispatch(
  //     routerRedux.push({
  //       pathname: `/ssrc/bid-hall/bid-evaluation-proc-manage/${record.bidHeaderId}`,
  //       query: {
  //         SourceFrom: 'BID',
  //       },
  //       search,
  //     })
  //   );
  // }

  // /**
  //  * 跳转到待定标，确认候选人页面
  //  * @param {Object} record = {}
  //  */
  // @Bind()
  // confirmBidCandidate(record) {
  //   const { dispatch } = this.props;
  //   const search = this.getDirectSearch(record);

  //   dispatch(
  //     routerRedux.push({
  //       pathname: `/ssrc/bid-hall/confirm-bid-candidate/${record.bidHeaderId}`,
  //       search,
  //     })
  //   );
  // }

  /**
   * 完成时,跳转查看中标公告详情
   *
   * @param {*} record
   * @memberof BidHall
   */
  @Bind()
  viewAcceptBidNotice(record) {
    const { dispatch } = this.props;
    const search = querystring.stringify({
      sourceHeaderId: record.bidHeaderId,
    });

    dispatch(
      routerRedux.push({
        pathname: `/ssrc/bid-hall/accept-bid-notice`,
        search,
      })
    );
  }

  /*
   * 跳转到不区分标段定标管理页面
   * @param {Object} record
   */
  @Bind()
  BidCheckPendingNot(record) {
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `/ssrc/bid-hall/calibration-managementnot/${record.bidHeaderId}`,
      })
    );
  }

  /**
   * 跳转到区分标段定标管理页面
   * @param {Object} record
   */
  @Bind()
  BidCheckPendingYes(record) {
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `/ssrc/bid-hall/calibration-managementyes/${record.bidHeaderId}`,
      })
    );
  }

  /**
   * 立项转招标
   */
  @Bind()
  projectApprovalToBidding() {
    const { dispatch } = this.props;
    dispatch({
      type: 'commonModel/updateState',
      payload: {
        bidHallProjectModalVisible: true,
      },
    });
    // this.setState({ approvalToBiddingVisible: true });
  }

  @Bind()
  approvalToBiddingHide() {
    // this.setState({ approvalToBiddingVisible: false });
    const { dispatch } = this.props;
    dispatch({
      type: 'commonModel/updateState',
      payload: {
        bidHallProjectModalVisible: false,
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
      type: 'bidHall/sourcingItemCreate',
      payload: {
        organizationId,
        ...projectApprovalToBiddingRows[0],
        ...params,
      },
    }).then((res) => {
      if (res) {
        notification.success();
        this.setState({ createModalVisible: false, projectApprovalToBiddingRows: [] });
        this.approvalToBiddingHide();
        const { bidHeaderId, subjectMatterRule } = res;
        const search = querystring.stringify({
          bidRuleType: 'DIFF',
          subjectMatterRule,
        });
        dispatch(
          routerRedux.push({
            pathname: `/ssrc/bid-hall/bid-update/${bidHeaderId}`,
            search,
          })
        );
      }
    });
  }

  render() {
    const {
      customizeTable,
      fetchDataLoading,
      bidOpenDataLoading,
      resendPasswordLoading,
      operateBidDataLoading,
      fetchQuotationFeedBackLoading,
      closeScalingLoading,
      openScalingLoading,
      sendExpertScoreLoading,
      dispatch,
      organizationId,
      bidHall: {
        bidList = [],
        bidPagination = {},
        bidOpenData = [],
        operateBidData = [],
        quotationFeedBackList = [],
        settings = {},
        code: {
          sourceMethod = [],
          bidStatus = [],
          auctionDirection = [],
          quotationType = [],
          bidType = [],
        },
      },
      commonModel: {
        operationPagination = {},
        operationData = [],
        bidHallProjectModalVisible = false,
      },
      match: { path = null },
      creteLoading,
      match,
    } = this.props;
    const {
      visible = false,
      openingBidVisible,
      operationBidVisible,
      operationRecordModalVisible,
      bidHeaderId,
      tableRecord = {},
      expertScoreType,
      preQualificationFlag,
      originSourceStatus = [],
      createModalVisible,
      projectApprovalToBiddingRows,
    } = this.state;
    const formProps = {
      originSourceStatus,
      sourceMethod,
      bidStatus,
      auctionDirection,
      quotationType,
      bidType,
      onSearch: this.handleSearch,
      onRef: this.handleBindRef,
      resetFormFields: this.resetFormFields,
    };
    const tableProps = {
      path,
      sourceMethod,
      bidStatus,
      auctionDirection,
      bidPagination,
      customizeTable,
      dataSource: bidList,
      loading: fetchDataLoading,
      onChange: this.handleSearch,
      onBidUpdate: this.onBidUpdate,
      onPreBid: this.preBid,
      onPreliminary: this.openPreliminary,
      onInquiryDetail: this.inquiryDetail,
      onQuotationFeedBack: this.quotationFeedBack,
      onInquiryCheckPrice: this.inquiryCheckPrice,
      onOperateBid: this.onOperateBidModel,
      onOpeningBid: this.openingBidModel,
      onGoMonitor: this.goMonitor,
      operationRender: this.operationRender,
      directQuestionAnswer: this.directQuestionAnswer,
      // onBidEvaluation: this.bidEvaluation,
      // bidEvaluationProcess: this.bidEvaluationProcess,
      // onConfirmBidCandidate: this.confirmBidCandidate,
      onViewAcceptBidNotice: this.viewAcceptBidNotice,
      BidCheckPendingNot: this.BidCheckPendingNot,
      BidCheckPendingYes: this.BidCheckPendingYes,
    };
    const drawerProps = {
      visible,
      loading: fetchQuotationFeedBackLoading,
      dataSource: quotationFeedBackList,
      onOk: this.handleOkModal,
      preQualificationFlag,
    };
    const OpeningBidProps = {
      tableRecord,
      onRef: this.onRef,
      dataSource: bidOpenData,
      bidOpenDataLoading,
      resendPasswordLoading,
      visible: openingBidVisible,
      hideModal: this.hideOpeningBid,
      confirmOpeningBid: this.confirmOpeningBid,
      resendPassword: this.resendPassword,
    };
    const operationBidProps = {
      settings,
      match,
      expertScoreType,
      operateBidDataLoading,
      closeScalingLoading,
      openScalingLoading,
      sendExpertScoreLoading,
      dataSource: operateBidData,
      visible: operationBidVisible,
      openScaling: this.openScaling,
      closeScaling: this.closeScaling,
      hideModal: this.hideoOperationBid,
      sendExpertScore: this.sendExpertScore,
      onRef: (ref) => {
        this.operationBidRef = ref;
      },
    };
    // 操作记录
    const operationRecordProps = {
      dispatch,
      organizationId,
      visible: operationRecordModalVisible,
      hideModal: this.hideOperationRecord,
      pagination: operationPagination,
      dataSource: operationData,
      bidHeaderId,
    };

    const approvalToBiddingProps = {
      visible: bidHallProjectModalVisible,
      onCancel: this.approvalToBiddingHide,
      createModalShow: this.createModalShow,
      createModalHide: this.createModalHide,
    };

    const createModalProps = {
      visible: createModalVisible,
      loading: creteLoading,
      createInquiry: this.createInquiry,
      onCancel: this.createModalHide,
      projectApprovalToBiddingRows,
    };
    return (
      <React.Fragment>
        <Header title={intl.get(`ssrc.bidHall.view.title.bidHall`).d('招标大厅')}>
          {/* <Button icon="check" type="primary" onClick={this.inquiryCreate}>
            {intl.get(`ssrc.bidHall.view.button.creatRFXManually`).d('手工创建标书')}
          </Button> */}
          <PermissionButton
            icon="check"
            type="primary"
            onClick={this.inquiryCreate}
            permissionList={[
              {
                code:
                  'srm.ssrc.source.manage.bidding.hall.ps.ssrc.bid-hall.list.button.manually.create.button',
                type: 'button',
                meaning: intl.get(`ssrc.bidHall.view.button.creatRFXManually`).d('手工创建标书'),
              },
            ]}
          >
            {intl.get(`ssrc.bidHall.view.button.creatRFXManually`).d('手工创建标书')}
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
                  intl.get(`ssrc.bidHall.view.message.title.bidHall`).d('招标大厅') -
                  intl.get(`ssrc.bidHall.view.button.ApplyToInquiry`).d('申请转招标'),
              },
            ]}
          >
            {intl.get(`ssrc.bidHall.view.button.ApplyToInquiry`).d('申请转招标')}
          </PermissionButton>
          <PermissionButton
            icon="book"
            type="default"
            onClick={this.projectApprovalToBidding}
            permissionList={[
              {
                code: `${this.props.match.path}.button.projectapprovaltoinquiry`,
                type: 'button',
                meaning:
                  intl.get(`ssrc.bidHall.view.message.title.bidHall`).d('招标大厅') -
                  intl.get(`ssrc.bidHall.view.button.projectApprovalToBidding`).d('立项转招标'),
              },
            ]}
          >
            {intl.get(`ssrc.bidHall.view.button.projectApprovalToBidding`).d('立项转招标')}
          </PermissionButton>
        </Header>
        <Content>
          <div className="table-list-search">
            <FilterForm {...formProps} />
          </div>
          <TableList {...tableProps} />
        </Content>
        <Drawer {...drawerProps} />
        {openingBidVisible && <OpeningBid {...OpeningBidProps} />}
        {operationBidVisible && <OperationBid {...operationBidProps} />}
        {operationRecordModalVisible && <OperationRecord {...operationRecordProps} />}
        {createModalVisible && <CreateModal {...createModalProps} />}
        {bidHallProjectModalVisible && <QuoteApproval {...approvalToBiddingProps} />}
      </React.Fragment>
    );
  }
}
