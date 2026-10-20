/*
 * purchaseContractViewDetail - 我发起的协议详情
 * @date: 2019-05-14
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component, Fragment } from 'react';
import { Button, Spin, Form, Row, Col, Anchor, Affix, Card, Tabs, Modal } from 'hzero-ui';
import { connect } from 'dva';
import { isNumber, isEmpty, compose } from 'lodash';
import classnames from 'classnames';
import { Bind, Debounce } from 'lodash-decorators';
import querystring from 'querystring';
// import withCustomize from 'srm-front-cuz';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import hocRemote from 'utils/remote';
import Upload from 'srm-front-boot/lib/components/Upload';
import { routerRedux } from 'dva/router';
import ComUpload from '@/routes/components/ComUpload';
import { PRIVATE_BUCKET } from 'srm-front-boot/lib/utils/config';

import { Header, Content } from 'components/Page';
import IMChatDraggable from '_components/IMChatDraggable';
import { Button as PermissionButton } from 'components/Permission';
import {
  createPagination,
  getCurrentOrganizationId,
  getAccessToken,
  getResponse,
} from 'utils/utils';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import {
  DETAIL_DEFAULT_CLASSNAME,
  DETAIL_CARD_CLASSNAME,
  DEFAULT_DATETIME_FORMAT,
} from 'utils/constants';
import notification from 'utils/notification';
import { HZERO_FILE } from 'utils/config';
import { downloadFile } from 'services/api';
import moment from 'moment';

import { refreshTab } from 'utils/menuTab';
import { allSignList, getParentDocumentSafe } from '@/utils/util';
import { fetchContractOnlineHTMLType, fetchWpsV5TextPreView } from '@/services/editorOnlineService';
import PreferentialRule from '@/routes/components/PreferentialRule';
import { breakOffContract } from '@/services/purchaseContractViewService';
import { queryAiApproveResult } from '@/services/workspaceService';

import { operationTextCompareModal } from '@/routes/components/TextCompareModalNew/index';
import IntelligentPreReview from '@/routes/components/IntelligentPreReview/index';

import ContractHeader from '../../components/ContractHeader';
// eslint-disable-next-line import/no-named-as-default
import ContractSubject from '../../components/ContractSubject';
import ContractStage from '../../components/ContractStage';
import ContractPartner from '../../components/ContractPartner';
import ContractBusinessTerms from '../../components/ContractBusinessTerms';
import ContractRebate from '../../components/ContractRebate';
import OperationRecordDrawer from '../../components/OperationRecordDrawer';
import Attachment from '../../components/Upload';
import EditorOnline from '../../components/EditorOnline';
import TextComparisonModal from '../../components/TextComparisonModal';
import styles from './index.less';
import FileModal from '../Modal/FileModal';
import ApproveRecord from '../../components/ApproveRecord';
import PrintButton from '../../components/PrintButton/index';
import ContractApprovalButton from '../../components/PrintButton/contractApproval';
import ContractReplenish from '../../components/ContractReplenish';
import CustomButton from '../components/CustomButton';

const { Link } = Anchor;
const { TabPane } = Tabs;
const viewMessagePrompt = 'spcm.purchaseContractView.view.message';
const commonViewPrompt = 'spcm.common.view.message.title';
const modelPrompt = 'spcm.purchaseContractView.model';

const CONTRACT_VIEW = 'srm.pc-admin.pc-purchaser.view';

/**
 * purchaseContractViewDetail - 我发起的协议详情
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {!Object} [purchaseContractView={}] - 数据源
 * @reactProps {boolean} [getHeaderAttachmentUuidLoading=false] - 获取附件uuid处理中
 * @reactProps {boolean} [deleteDetailLinesLoading=false] - 删除明细行处理中
 * @reactProps {boolean} [submitDeliveryLoading=false] - 提交送货单处理中
 * @reactProps {boolean} [deleteDeliveryLoading=false] - 删除送货单处理中
 * @reactProps {boolean} [queryCreateListLoading=false] - 查询可创建行处理中
 * @reactProps {boolean} [queryMaintenanceListLoading=false] - 查询可维护行处理中
 * @reactProps {boolean} [fetchingDetailHeader=false] - 查询明细头处理中
 * @reactProps {boolean} [queryDetailListLoading=false] - 查询明细行处理中
 * @reactProps {Function} [dispatch= e => e] - redux dispatch方法
 * @return React.element
 */

class Detail extends Component {
  constructor(props) {
    const routerParams = querystring.parse(props.location.search.substr(1));
    const isPub = props.location.pathname.includes('/pub'); // 判断是否为pub页面
    const isLegal = props.location.pathname.includes('legal'); // 判断是否为法务审批节点页面
    const pathNames = props.history.location ? props.history.location.pathname : '';
    const statementFlag = pathNames.search('contract-statement') !== -1 || false;
    const { libFlag = '', purchase = '', isProcessEdit } = routerParams;
    super(props);
    const {
      match = {},
      location: { search, hash },
    } = this.props;
    const { params } = match;
    const { pcHeaderId, sourceFlag } = querystring.parse(search.substr(1));
    this.state = {
      statementFlag,
      sourceFlag,
      purchase,
      libFlag,
      hash,
      pcHeaderId: params.id || params.pcHeaderId || pcHeaderId,
      headerInfo: {}, // 头form数据源
      listDataSource: [], // 表格数据源
      headerFetchedFlag: false, // 锚点跳转取值
      operationRecordVisible: false,
      partnerDataSource: [], // 合作伙伴数据
      partnerPagination: {}, // 合作伙伴分页
      partnerSelectedRows: [],
      pcSubjectDataSource: [],
      pcSubjectPagination: {},
      pcStageDataSource: [],
      pcStagePagination: {},
      pcSubjectSelectedRows: [],
      termDataSource: [],
      termPagination: {},
      termSelectedRows: [],
      templateListFlag: false,
      activeKey: 'contractSubjectInfo',
      textComparisonVisible: false,
      contractModalVisible: false,
      isPub,
      isProcessEdit,
      isLegal,
      drawerVisible: false,
      fetchTextPreViewLoading: false,
      aiApproveParam: {},
    };
    this.maintainContentRef = React.createRef();
    this.partnerRef = React.createRef();
    this.pcSubjectRef = React.createRef();
    this.pcStageRef = React.createRef();
    this.termRef = React.createRef();
    this.aiResultTimer = null;
  }

  initCount = true;

  componentDidMount() {
    const { pcHeaderId, isPub, isProcessEdit } = this.state;
    const { onLoad } = this.props;
    if (pcHeaderId && isNumber(+pcHeaderId)) {
      this.fetchAiApproveResult(true);
      this.fetchEnum();
      this.fetchHeader();
      this.fetchList();
    }
    this.fetchConfigSetting();

    if (isPub && onLoad && isProcessEdit) {
      onLoad({
        submit: this.handleWorkflowApprove,
      });
    }
  }

  componentWillUnmount() {
    this.clearAIResultTimer();
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const nextState = { ...prevState };
    const params = querystring.parse(nextProps.location.search.substr(1));
    let { pcHeaderId } = params;
    if (!pcHeaderId) {
      const { pcHeaderId: id } = nextProps.match.params;
      pcHeaderId = id;
    }
    if (pcHeaderId && pcHeaderId !== prevState.pcHeaderId) {
      nextState.pcHeaderId = pcHeaderId;
    }
    return nextState;
  }

  getSnapshotBeforeUpdate(_, prevState) {
    const params = querystring.parse(this.props.location.search.substr(1));
    let { pcHeaderId } = params;
    if (!pcHeaderId) {
      const { pcHeaderId: id } = this.props.match.params;
      pcHeaderId = id;
    }

    const { headerInfo, headerFetchedFlag } = this.state;
    if (
      !headerFetchedFlag &&
      headerInfo.editStep === 1 &&
      !['ATTACHMENT_FRAMEWORK', 'ATTACHMENT'].includes(headerInfo.pcKindCode)
    ) {
      return headerInfo.editStep;
    }
    return pcHeaderId && pcHeaderId !== prevState.pcHeaderId ? 'CHANGE' : null;
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    this.handleProccessEditLoad();
    if (snapshot && snapshot === 'CHANGE') {
      this.fetchEnum();
      this.fetchHeader();
      this.fetchList();
      this.fetchConfigSetting();
    } else if (snapshot) {
      const { hash } = this.state;
      if (hash === '') {
        return null;
      } else {
        const n = document.querySelector(`a[href="${hash}"]`);
        if (n) {
          n.click();
        }
      }
    }
  }

  /**
   * 控制工作流的批准/拒绝按钮不可点击
   */
  @Bind()
  handleProccessEditLoad() {
    const { isPub, isProcessEdit } = this.state;
    const {
      queryingHeader,
      queryingPartner,
      queryingSubject,
      queryingStage,
      queryingTerm,
      onFormLoaded,
    } = this.props;
    if (
      isPub &&
      isProcessEdit &&
      onFormLoaded &&
      !(queryingHeader || queryingPartner || queryingSubject || queryingStage || queryingTerm) &&
      this.initCount
    ) {
      this.initCount = false;
      onFormLoaded(true); // 工作流里表单如果可编辑，那么要等页面加载完毕，才允许批准/拒绝按钮点击
    }
  }

  // 查询ai预审结果
  @Bind()
  fetchAiApproveResult(initQueryFlag = false) {
    const { pcHeaderId } = this.state;
    const payload = {
      headerDataId: pcHeaderId,
    };
    queryAiApproveResult(payload).then((res) => {
      if (getResponse(res)) {
        const { result: resultStatus, aiApproveResultQueryDTOList } = res;
        const aiApproveParam = {
          aiApproveReslultParams: aiApproveResultQueryDTOList,
          resultStatus,
        };
        this.setState({ aiApproveParam });
        // 页面初始化查询，并且resultStatus是审核中就继续轮询查询
        if(initQueryFlag && resultStatus === "APPROVING"){
          this.rollingFetchAiResult();
        }
      }
    });
  }

  // 轮询查询ai预审结果
  @Bind()
  rollingFetchAiResult() {
    this.clearAIResultTimer();
    this.aiResultTimer = setInterval(() => {
      this.fetchAiApproveResult();
    }, 10000);
  }

  // 清空定时器
  @Bind()
  clearAIResultTimer() {
    if (this.aiResultTimer) {
      clearInterval(this.aiResultTimer);
      this.aiResultTimer = null;
    }
  }

  /**
   * 查询列表
   */
  @Bind()
  fetchList() {
    this.fetchPartner();
    this.fetchSubject();
    this.fetchStage();
    this.fetchTerm();
  }

  /**
   * 查询详情值集
   */
  @Bind()
  fetchEnum() {
    const { dispatch } = this.props;
    dispatch({
      type: 'purchaseContractView/fetchDetailEnum',
    });
    dispatch({
      type: 'purchaseContractView/init',
    });
  }

  /**
   * 查询配置中心配置
   */
  @Bind()
  fetchConfigSetting() {
    const { dispatch } = this.props;
    dispatch({
      type: 'contractCommon/fetchConfigSetting',
    });
  }

  /**
   * fetchHeader - 查询头明细数据
   */
  @Bind()
  fetchHeader() {
    const { dispatch } = this.props;
    const { pcHeaderId } = this.state;
    return dispatch({
      type: 'contractCommon/fetchHeader',
      pcHeaderId,
      customizeUnitCode: 'SPCM.PURCHASE_CONTRACT_MAINTAIN.DETAIL.READONLY',
    }).then((res) => {
      if (res) {
        this.handleFetchConfigAttachment();
        this.setState({ headerInfo: res }, () => {
          this.setState({ headerFetchedFlag: true });
        });
        if (res.rebateFlag) {
          this.fetchContractRebate();
        }
      }
    });
  }

  /**
   * fetchPartner - 查询合作伙伴数据
   * @param {object} params - 查询条件
   */
  @Bind()
  fetchPartner(page = {}) {
    const { dispatch } = this.props;
    const { pcHeaderId } = this.state;
    if (pcHeaderId) {
      dispatch({
        type: 'contractCommon/fetchPartner',
        payload: {
          page,
          pcHeaderId,
          customizeUnitCode: 'SPCM.PURCHASE_CONTRACT_MAINTAIN.PARTNER.READONLY',
        },
      }).then((res) => {
        if (res) {
          this.setState({
            partnerDataSource: res.map((n) => ({ ...n, _status: 'update' })),
            partnerPagination: createPagination(res),
          });
        }
      });
    }
  }

  /**
   * fetchSubject - 查询合作伙伴数据
   * @param {object} params - 查询条件
   * @param {object} itemName - 标的信息筛选查询条件
   * @param {object} itemCode - 标的信息筛选查询条件
   */
  @Bind()
  fetchSubject(page = {}, ...args) {
    const [itemName = null, itemCode = null] = args;
    const { dispatch } = this.props;
    const { pcHeaderId, isPub } = this.state;
    if (pcHeaderId) {
      dispatch({
        type: 'contractCommon/fetchSubject',
        payload: {
          page,
          itemName,
          itemCode,
          pcHeaderId,
          customizeUnitCode: 'SPCM.PURCHASE_CONTRACT_MAINTAIN.SUBJECT.READONLY',
          isPub,
        },
      }).then((res) => {
        if (res) {
          this.setState({
            pcSubjectDataSource: res.content.map((n) => ({ ...n, _status: 'update', isPub })),
            pcSubjectPagination: {
              ...createPagination(res),
              onShowSizeChange: this.onShowSizeChange,
            },
          });
        }
      });
    }
  }

  /**
   * fetchStage - 查询标的协议阶段
   * @param {object} page - 协议阶段分页条件
   * @override 海亮
   */
  @Bind()
  fetchStage(page = {}) {
    const { dispatch } = this.props;
    const { pcHeaderId } = this.state;
    if (pcHeaderId) {
      dispatch({
        type: 'contractCommon/fetchStage',
        payload: {
          page,
          pcHeaderId,
          customizeUnitCode: 'SPCM.PURCHASE_CONTRACT_MAINTAIN.STAGE.READONLY',
        },
      }).then((res) => {
        if (res) {
          this.setState({
            pcStageDataSource: res.content.map((n) => ({ ...n, _status: 'update' })),
            pcStagePagination: createPagination(res),
          });
        }
      });
    }
  }

  /**
   * fetchSubject - 查询业务条款数据
   * @param {object} params - 查询条件
   */
  @Bind()
  fetchTerm(page = {}) {
    const { dispatch } = this.props;
    const { pcHeaderId } = this.state;
    if (pcHeaderId) {
      dispatch({
        type: 'contractCommon/fetchTermPage',
        payload: {
          page,
          pcHeaderId,
        },
      }).then((res) => {
        if (res) {
          this.setState({
            termDataSource: (res.content || []).map((n) => ({ ...n, _status: 'update' })),
            termPagination: createPagination(res),
          });
        }
      });
    }
  }

  /**
   * 查询返利信息
   * @param {*} page
   */
  @Bind()
  fetchContractRebate(page = {}) {
    const { dispatch } = this.props;
    const { pcHeaderId } = this.state;
    dispatch({
      type: 'contractCommon/fetchContractRebate',
      payload: {
        page,
        pcHeaderId,
      },
    }).then((res) => {
      if (res) {
        this.setState({
          pcRebateDataSource: res.content && res.content.map((r) => ({ ...r, _status: 'update' })),
          pcRebatePagination: createPagination(res),
        });
      }
    });
  }

  /**
   * 跳转到明细页
   * @param {String} pcHeaderId
   */
  @Bind()
  redirectDetail(pcHeaderId) {
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `/spcm/purchase-contract-view/detail`,
        search: pcHeaderId ? querystring.stringify({ pcHeaderId }) : querystring.stringify({}),
      })
    );
    const headerNode = document.querySelector('#spcm-maintain-detail-contract-header-information');
    if (headerNode) {
      headerNode.scrollIntoView();
    }
    this.setState(
      {
        pcHeaderId,
        headerFetchedFlag: false,
      },
      () => {
        refreshTab();
        // this.componentDidMount();
      }
    );
  }

  /**
   * 查询配置的附件列表
   */
  @Bind()
  handleFetchConfigAttachment() {
    const { pcHeaderId } = this.state;
    const { dispatch } = this.props;
    dispatch({
      type: 'contractCommon/fetchPcAttachmentList',
      payload: pcHeaderId,
    }).then((templateList) => {
      if (templateList) {
        this.setState({
          templateList,
          templateListFlag: true,
        });
      }
    });
  }

  /**
   * handleVisible - 拒绝协议
   */
  @Bind()
  handleVisible(field, flag) {
    this.setState({ [field]: !!flag });
  }

  /**
   * confirmContract - 确认协议
   */
  @Bind()
  confirmContract() {
    const { headerInfo = {} } = this.state;
    const { dispatch } = this.props;
    dispatch({
      type: 'purchaseContractView/confirmContract',
      payload: {
        pcHeaderList: [headerInfo],
        signFlag: 1,
      },
    });
  }

  /**
   * 拒绝协议
   * @param {*} values
   */
  @Bind()
  handleReject(values) {
    const { headerInfo = {} } = this.state;
    const { dispatch } = this.props;
    dispatch({
      type: 'purchaseContractView/confirmContract',
      payload: {
        pcHeaderList: [{ ...headerInfo, ...values }],
        signFlag: 1,
      },
    });
  }

  /**
   * bindHeaderAttachmentUuid - 绑定头附件id
   * @param {!string} attachmentUuid - 附件uuid返回值
   */
  @Bind()
  bindHeaderAttachmentUuid(attachmentUuid) {
    const { dispatch } = this.props;
    const {
      headerInfo: { pcHeaderId },
    } = this.state;
    dispatch({
      type: 'purchaseContractView/bindHeaderAttachmentUuid',
      payload: {
        pcHeaderId,
        attachmentUuid,
      },
    }).then((res) => {
      if (res) {
        this.fetchHeader();
      }
    });
  }

  /**
   * bindLineAttachmentUuid - 获取头附件uuid
   * @param {!string} attachmentUuid - 附件uuid返回值
   * @param {object} record - 行数据
   */
  @Bind()
  bindLineAttachmentUuid(attachmentUuid, record) {
    const { dispatch } = this.props;
    const {
      headerInfo: { pcHeaderId },
    } = this.state;
    const { prLineId } = record;
    dispatch({
      type: 'purchaseContractView/bindLineAttachmentUuid',
      payload: {
        pcHeaderId,
        prLineId,
        attachmentUuid,
      },
    }).then((res) => {
      if (res) {
        this.fetchHeader();
        this.fetchPartner();
      }
    });
  }

  /**
   * setItemInfoListDataSource - 设置物料信息数据源
   * @param {!Array<object>} dataSource - 数据源
   */
  @Bind()
  setItemInfoListDataSource(dataSource) {
    const { listDataSource = {} } = this.state;
    this.setState({
      listDataSource: {
        ...listDataSource,
        common: dataSource,
      },
    });
  }

  /**
   * afterOpenHeaderUploadModal - 头附件弹窗打开后判断是否获取uuid
   * @param {!Array<object>} attachmentUuid - 附件uuid
   */
  @Bind()
  afterOpenHeaderUploadModal(attachmentUuid) {
    const { headerInfo = {} } = this.state;
    if (isEmpty(headerInfo.attachmentUuid)) {
      this.bindHeaderAttachmentUuid(attachmentUuid);
    }
  }

  /**
   * afterOpenLineUploadModal - 行附件弹窗打开后判断是否获取uuid
   * @param {!Array<object>} attachmentUuid - 附件uuid
   * @param {object} record - 行数据
   */
  @Bind()
  afterOpenLineUploadModal(attachmentUuid, record) {
    if (isEmpty(record.attachmentUuid) && record._status !== 'create') {
      this.bindLineAttachmentUuid(attachmentUuid, record);
    }
  }

  /**
   * 查询操作记录列表
   * @param {Object} fields 查询字段
   */
  @Bind()
  handleOperationRecordSearch(page = {}) {
    const { dispatch } = this.props;
    const { pcHeaderId } = this.state;
    dispatch({
      type: 'purchaseContractView/fetchOperationRecordList',
      payload: {
        pcHeaderId,
        page,
      },
    }).then((result) => {
      if (result) {
        // this.setState({
        //   operationRecordList: result.content,
        //   operationRecordPagination: addItemToPagination(result),
        // });
      }
    });
  }

  @Bind()
  @Debounce(500)
  handleModalVisible(modalVisible, flag, otherParams = {}) {
    this.setState({ [modalVisible]: !!flag, ...otherParams });
  }

  /**
   * getParent-获取 dom 的parent
   * @param {HTMLElement} dom
   * @return {HTMLElement}
   */
  @Bind()
  getParent(dom) {
    const parent = dom && dom.parentNode.parentNode;
    return parent && parent.nodeType !== 11 ? parent : null;
  }

  /**
   * getAffixContainer-获取给 Affix 组件使用的元素
   * @return {HTMLElement}
   */
  @Bind()
  getAffixContainer() {
    const {
      location: { search },
    } = this.props;
    const { isPub } = this.state;
    const { openFrom } = querystring.parse(search.substr(1));
    if (openFrom) {
      const dom = document.getElementById('spcm-contract-sign-detail-content-inner-wrapper');
      const parent = dom && dom.parentNode.parentNode.parentNode;
      return parent && parent.nodeType !== 11 ? parent : null;
    }
    if (isPub) {
      const parentDoc = getParentDocumentSafe();
      if (parentDoc) {
        const dom = window?.parent?.document.querySelector(
          '.swfl-approval-workbench-task-detail > #content-container'
        );
        if (dom) {
          return dom;
        }
        const dom2 = window?.parent?.document.querySelector(
          '.swfl-approval-workbench-task-new-tab > div > #content-container'
        );
        if (dom2) {
          return dom2;
        }
      }
    }
    const parent = this.getParent(
      document.getElementById('spcm-contract-sign-detail-content-inner-wrapper')
    );
    return parent || document.body;
  }

  /**
   * 列表主键改变
   * @param {*} selectedRowKeys
   * @param {*} selectedRows
   * @param {*} field
   */
  @Bind()
  handleChangeSelection(selectedRowKeys, selectedRows, field) {
    this.setState({
      [`${field}SelectedRows`]: selectedRows,
    });
  }

  /**
   * pageSize 变化的回调
   * @param {*} current
   * @param {*} size
   */
  @Bind()
  onShowSizeChange(current, size) {
    const { pcSubjectPagination } = this.state;
    this.fetchSubject({
      ...pcSubjectPagination,
      pageSize: size,
    });
  }

  /**
   * 保存激活的tab的key
   * @param {String} activeKey
   */
  @Bind()
  handleSaveKey(activeKey) {
    this.setState({ activeKey });
  }

  /**
   * 归档
   */
  @Bind()
  archiveContract(values) {
    const { dispatch } = this.props;
    dispatch({
      type: 'purchaseContractView/archiveContract',
      payload: values,
    }).then((res) => {
      if (res) {
        notification.success();
        this.props.history.push('/spcm/purchase-contract-view/list');
      }
    });
  }

  /**
   * 解约
   */
  @Bind()
  handleBreakOffContract() {
    const { headerInfo } = this.state;
    Modal.confirm({
      title: intl.get(`spcm.common.view.message.title.breakOffContract`).d('确认发起解约吗？'),
      onOk: async () => {
        const res = getResponse(await breakOffContract(headerInfo));
        if (res) {
          notification.success();
          this.fetchList();
        }
      },
    });
  }

  /**
   * 返回父页面
   */
  handleBackParentPath() {
    let routePath;
    const {
      location: { pathname },
    } = this.props;
    const { sourceFlag, libFlag, purchase, statementFlag } = this.state;
    const {
      location: { search },
    } = this.props;
    const { backPathHygy, docLinkFlag = 0, openFrom, backVoidPage } = querystring.parse(
      search.substr(1)
    );
    switch (sourceFlag) {
      case 'supplier-deduction-query': // 返回供应商查询页面
        routePath = '/sfin/supplier-deduction-query/list';
        break;
      case 'supplier-deduction-approval': // 返回供应商审批页面
        routePath = '/sfin/supplier-deduction-approval/list';
        break;
      default:
        routePath =
          (purchase === 'purchase' && '/sodr/purchase-order-maintain/purchase/list') ||
          (statementFlag && '/spcm/contract-statement/list') ||
          (libFlag === 'priceLib' ? '' : '/spcm/purchase-contract-view/list');
        break;
    }
    const backPath = pathname.includes('/pub') ? backPathHygy || null : routePath;
    // openFrom：订单跳转过来，不需要返回按钮。
    // backVoidPage: NO：的时候不需要返回按钮，YES：需要返回按，控制返回按钮的显示。
    // docLinkFlag: 单据流时不需要返回按钮。
    return backVoidPage === 'NO' || openFrom || Number(docLinkFlag) ? '' : backPath;
  }

  /**
   * handleVisible - 归档-打开模态框
   */
  @Bind()
  handleContract(field, flag) {
    this.setState({ [field]: !!flag });
  }

  @Bind()
  handleControlComparison() {
    const { textComparisonVisible } = this.state;
    this.setState({ textComparisonVisible: !textComparisonVisible });
  }

  /**
   * 获取打印链接
   */
  @Bind()
  handleFetchPrintContract(pcHeaderId) {
    const { dispatch } = this.props;
    dispatch({
      type: 'contractCommon/fetchLockPrintContract',
      payload: { pcHeaderId },
    }).then((res) => {
      if (res) {
        notification.success();
        this.fetchList();
      }
    });
  }

  /**
   * 同步附件
   */
  @Bind()
  downloadSyncContract(pcHeaderId) {
    const { dispatch } = this.props;
    const {
      headerInfo: { contractFileUrl },
    } = this.state;
    dispatch({
      type: 'purchaseContractView/syncAttachment',
      payload: { pcHeaderId },
    }).then((res) => {
      if (res) {
        if (contractFileUrl) {
          const organizationId = getCurrentOrganizationId();
          const api = `${HZERO_FILE}/v1/${organizationId}
          /files/download?bucketName=${PRIVATE_BUCKET}&url=${contractFileUrl}`;
          downloadFile({
            requestUrl: api,
            queryParams: [
              { name: 'bucketName', value: PRIVATE_BUCKET },
              { name: 'url', value: contractFileUrl },
            ],
          });
        }
      }
    });
  }

  /**
   * 文本预览
   */
  @Bind()
  @Debounce(500)
  async getTextPreViewUrl() {
    const { dispatch } = this.props;
    const {
      headerInfo,
      pcSubjectDataSource,
      pcStageDataSource,
      partnerDataSource,
      termDataSource,
      pcRebateDataSource,
    } = this.state;
    if (!this.headerRef?.props?.form) return;
    this.setState({ fetchTextPreViewLoading: true });
    this.headerRef.props.form.validateFieldsAndScroll({ force: true }, async (errs, values) => {
      if (!errs) {
        const type = await fetchContractOnlineHTMLType();
        const { startDateActive, endDateActive } = values;
        const formatStartDate =
          startDateActive && moment(startDateActive).format(DEFAULT_DATETIME_FORMAT);
        const formatEndDate =
          endDateActive && moment(endDateActive).format(DEFAULT_DATETIME_FORMAT);
        const payload = {
          ...headerInfo, // 采购协议头信息
          ...values,
          startDateActive: formatStartDate,
          endDateActive: formatEndDate,
          pcSubjectDetailDTOList: pcSubjectDataSource,
          pcStageDetailDTOList: pcStageDataSource,
          pcPartnerDetailDTOList: partnerDataSource,
          pcTermDetailDTOList: termDataSource,
          pcRebateInformationlist: pcRebateDataSource,
          customizeUnitCode:
            'SPCM.PURCHASE_CONTRACT_MAINTAIN.DETAIL,SPCM.PURCHASE_CONTRACT_MAINTAIN.SUBJECT,SPCM.PURCHASE_CONTRACT_MAINTAIN.STAGE,SPCM.PURCHASE_CONTRACT_MAINTAIN.PARTNER',
        };
        if (type?.includes('new_wps')) {
          // type为new_wps/new_wps_V7时，使用新版WPS预览
          fetchWpsV5TextPreView(payload)
            .then((url) => {
              if (getResponse(url)) {
                if (type === 'new_wps_V7' && window?.open) {
                  window.open(
                    `${window.$$env.BASE_PATH}pub/spcm/contract-workspace/wps-v7-preview/${headerInfo?.pcHeaderId}?previewUrl=${url}`
                  );
                } else {
                  window.open(url);
                }
              }
            })
            .finally(() => {
              this.setState({ fetchTextPreViewLoading: false });
            });
          return false;
        }
        dispatch({
          type: 'editorOnline/fetchTextPreView',
          payload,
        })
          .then((url) => {
            const hasFailed = url && url.includes('failed'); // 是否接口报错
            if (typeof url === 'string' && url !== '' && !hasFailed) {
              const tenantId = getCurrentOrganizationId();
              const bucketName = PRIVATE_BUCKET;
              const editor = type?.includes('new_wps') ? 'WPS' : 'ONLYOFFICE';
              window.open(
                `${HZERO_FILE}/v1/${tenantId}/file/preview?url=${encodeURIComponent(
                  url
                )}&editor=${editor}&bucketName=${bucketName}&access_token=${getAccessToken()}#toolbar=0`
              );
            } else if (hasFailed) {
              const errorObj = JSON.parse(url);
              notification.error({
                message: errorObj.message,
              });
            } else {
              notification.warning({
                message: intl.get('spcm.common.view.button.getPreViewUrlError').d('Url获取失败！'),
              });
            }
          })
          .finally(() => {
            this.setState({ fetchTextPreViewLoading: false });
          });
      } else {
        this.setState({ fetchTextPreViewLoading: false });
        notification.warning({
          message: intl.get('spcm.common.view.validateHeader.error').d('采购协议头信息校验失败'),
        });
      }
    });
  }

  /**
   * 获取契约锁合同附件
   */
  @Bind()
  handleFetchLockContFile(pcHeaderId) {
    const { dispatch } = this.props;
    dispatch({
      type: 'contractCommon/fetchLockContractFile',
      payload: { pcHeaderId },
    }).then((res) => {
      if (res) {
        notification.success();
        this.fetchList();
      }
    });
  }

  /**
   * 更新协议
   * @param {Object} [params={}] 更细内容
   * @param {Number} [oldEditStep] 协议所处阶段 1重新刷新协议文本 0则不刷新
   */
  @Bind()
  handleUpdateContract(params = {}, oldEditStep, resolve, reject) {
    const {
      headerInfo = {},
      pcStageDataSource = [],
      partnerDataSource = [],
      pcSubjectDataSource = [],
      termDataSource = [],
      pcRebateDataSource = [],
    } = this.state;
    const { dispatch } = this.props;
    if (!this.headerRef?.props?.form) return;
    this.headerRef.props.form.validateFieldsAndScroll({ force: true }, (errs, values) => {
      if (!errs) {
        const { startDateActive, endDateActive, overseasProcurement, signEffectFlag } = values;
        const headerData = {
          ...values,
          ...params,
          startDateActive: startDateActive
            ? moment(startDateActive).format(DEFAULT_DATETIME_FORMAT)
            : undefined,
          endDateActive: endDateActive
            ? moment(endDateActive).format(DEFAULT_DATETIME_FORMAT)
            : undefined,
          overseasProcurement: overseasProcurement ? 1 : 0,
          signEffectFlag: signEffectFlag ? 1 : 0,
        };
        dispatch({
          type: 'contractMaintain/update',
          payload: {
            ...headerInfo,
            ...headerData,
            supplierCompanyId: headerInfo.supplierCompanyId,
            mainContractId: headerData.mainContractId,
            overseasProcurement: headerInfo.overseasProcurement,
            pcPartnerDetailDTOList: partnerDataSource,
            pcSubjectDetailDTOList: pcSubjectDataSource,
            pcStageDetailDTOList: pcStageDataSource,
            pcTermDetailDTOList: termDataSource,
            pcRebateInformationlist: pcRebateDataSource,
            customizeUnitCode:
              'SPCM.PURCHASE_CONTRACT_MAINTAIN.DETAIL,SPCM.PURCHASE_CONTRACT_MAINTAIN.SUBJECT,SPCM.PURCHASE_CONTRACT_MAINTAIN.STAGE,SPCM.PURCHASE_CONTRACT_MAINTAIN.PARTNER',
          },
        }).then((res) => {
          if (res) {
            notification.success();
            this.headerRef.props.form.resetFields();
            this.fetchHeader().then(() => {
              if (oldEditStep === 1) {
                const n = document.querySelector(
                  `a[href="#spcm-contract-maintain-detail-contract-online-edit"]`
                );
                // 由于首次不渲染在线编辑组件而是在弹窗中渲染，所以此处无值，无需重新请求
                // if (pcHeaderId && editStep === 1 && !['ATTACHMENT_FRAMEWORK', 'ATTACHMENT'].includes(pcKindCode)) {
                //   this.editorOnlineRef.fetchEditorOnlineHTML();
                // }
                if (n) n.click();
              }
            });
            this.fetchList();
            partnerDataSource.forEach((i) => i.$form?.resetFields());
            pcStageDataSource.forEach((i) => i.$form && i.$form.resetFields()); // 此处需要判断一下，由于页面初始化时协议阶段行默认不渲染，以至于没有$form属性

            if (resolve) resolve();
            dispatch({
              type: 'contractCommon/updateState',
              payload: {
                formChanged: false,
              },
            });
          } else if (reject) reject();
        });
      } else if (reject) reject();
    });
  }

  /**
   * 重推契约锁
   */
  @Bind()
  reExportContractLock() {
    const {
      headerInfo: { pcHeaderId },
    } = this.state;
    const { dispatch } = this.props;
    dispatch({
      type: 'purchaseContractView/reExportContractLock',
      payload: { pcHeaderId },
    }).then((res) => {
      if (res) {
        this.setState({
          selectedRows: [],
        });
        notification.success();
        this.fetchList();
      }
    });
  }

  /**
   * handleWorkflowApprove 回调函数用于工作流审批界面审批按钮回调
   * @param _approveResult 工作流审批页面的审批结果 approved 审批通过 rejected 审批拒绝
   */
  @Bind()
  // eslint-disable-next-line no-unused-vars
  handleWorkflowApprove(approveResult) {
    return new Promise((resolve, reject) => {
      this.handleUpdateContract({}, 0, resolve, reject);
    });
  }

  @Bind()
  toContractHistoryCompare() {
    const {
      headerInfo: { mainContractId, pcHeaderId },
    } = this.state;
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `/spcm/purchase-contract-view/contract-history-compare`,
        search: querystring.stringify({ mainContractId, pcHeaderId }),
      })
    );
  }

  /**
   * 下载签章合同
   */
  @Debounce(500) // 发现使用Throttle不生效。
  @Bind()
  downloadSignContract() {
    const {
      headerInfo: { contractFileUrl },
    } = this.state;
    if (contractFileUrl) {
      const organizationId = getCurrentOrganizationId();
      const api = `${HZERO_FILE}/v1/${organizationId}
      /files/download?bucketName=${PRIVATE_BUCKET}&url=${contractFileUrl}`;
      downloadFile({
        requestUrl: api,
        queryParams: [
          { name: 'bucketName', value: PRIVATE_BUCKET },
          { name: 'url', value: contractFileUrl },
        ],
      });
    }
  }

  /**
   * 签署盖章
   */
  @Bind()
  handleSignAndSeal({ openModal }) {
    const { headerInfo } = this.state;
    const { dispatch } = this.props;
    if (openModal) {
      notification.success();
      this.fetchHeader();
    } else {
      dispatch({
        type: 'purchaseContractView/postSignAndSeal',
        payload: [headerInfo],
      }).then((res) => {
        if (res) {
          notification.success();
          this.fetchHeader();
        }
      });
    }
  }

  /**
   * pcHeaderElectronicSignatureAttachment
   * @param {*} pcHeaderElectronicSignatureAttachment
   */
  @Bind()
  handleSaveElectricSignUuid(pcHeaderElectronicSignatureAttachment) {
    const { dispatch } = this.props;
    const { headerInfo } = this.state;
    if (!headerInfo.pcHeaderElectronicSignatureAttachment) {
      dispatch({
        type: 'contractMaintain/add',
        payload: {
          ...headerInfo,
          pcHeaderElectronicSignatureAttachment,
        },
      }).then((res) => {
        if (res) {
          this.setState({
            headerInfo: {
              ...headerInfo,
              ...res,
            },
          });
        }
      });
    }
  }

  // 文本对比
  @Bind()
  handleTextCompare() {
    const { headerInfo } = this.state;
    this.setState({ fetchTextPreViewLoading: true });
    operationTextCompareModal({
      headerInfo,
    }).finally(() => this.setState({ fetchTextPreViewLoading: false }));
  }

  renderContractHeader(headerInfoFormProps) {
    return <ContractHeader {...headerInfoFormProps} />;
  }

  // @overide srm-138835
  renderContractSubject(contractSubjectListProps) {
    return <ContractSubject {...contractSubjectListProps} />;
  }

  // @overide 海亮
  renderContractStage(contractStageListProps) {
    return <ContractStage {...contractStageListProps} />;
  }

  // @overide 和记黄埔 src-1966
  renderEditorOnline(EditorOnlineProps) {
    return <EditorOnline {...EditorOnlineProps} />;
  }

  // @overide 追觅
  renderFileModal(contractModalProps) {
    return contractModalProps?.visible && <FileModal {...contractModalProps} />;
  }

  // 济民可信重写
  renderHeaderButton() {
    const {
      queryingHeader,
      // fetchTextPreViewLoading,
      location,
      purchaseContractView,
      submitDeliveryLoading = false,
      fetchLockPrintContractLoading,
      fetchLockContractFileLoading,
      postSignAndSealLoading,
      syncAttachmentLoading,
      customizeBtnGroup,
      remote,
    } = this.props;
    const {
      templateList = [],
      headerInfo = {},
      templateListFlag,
      libFlag,
      statementFlag,
      isPub,
      fetchTextPreViewLoading,
    } = this.state;
    const {
      pcKindCode,
      attachmentUuid,
      supplierAttachmentUuid,
      editStep,
      supplementFlag,
      electricSignFlag,
      contractFileUrl,
      pcStatusCode,
      signatureType,
      authType,
      terminateSignStatus,
      electronicSignatureAttachmentDisplayFlag,
    } = headerInfo;

    const { search = {} } = location;
    const { enumMap } = purchaseContractView;
    const {
      pcHeaderId = headerInfo.pcHeaderId,
      openFrom,
      backVoidPage,
      docLinkFlag = 0,
    } = querystring.parse(search.substr(1));

    const attachmentProps = {
      remote,
      accept: '.docx',
      fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      // width: document.body.clientWidth / 2,
      headerInfo,
      templateList,
      supplierAttachmentUuid,
      onUpdateHeader: this.save,
      attachmentUUID: attachmentUuid,
      onFetchHeader: this.fetchHeader,
      onRefresh: this.handleFetchConfigAttachment,
      isTemplateContract: true,
      supplierParams: { supplierViewFlag: true },
      showRemoveIcon: false,
      className: isPub ? 'spcm-pub-modal' : null,
      // custViewContainerId: 'purComAttachViewerContainer',
      fileViewerClassName: isPub ? 'spcm-pub-viewer' : null,
    };

    const uploadProps = {
      viewOnly: true,
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: 'purchaser-attachment',
      btnText: intl.get('spcm.common.view.spcm.btn.purchaserAttachment').d('采购方附件'),
      title: intl.get('spcm.common.view.spcm.btn.purchaserAttachment').d('采购方附件'),
      attachmentUUID: headerInfo.purchaserAttachmentUuid,
      modalClassName: isPub ? 'spcm-pub-modal' : null,
      // custViewContainerId: 'purAttachViewerContainer',
      fileViewerClassName: isPub ? 'spcm-pub-viewer' : null,
    };

    /**
     * 签署盖章按钮枚举
     */

    const { signSeal = [] } = enumMap;

    const isAttachmentSignUpload =
      signatureType === 'ANNEX_SIGNATURE' &&
      electricSignFlag === 1 &&
      allSignList.includes(authType); // 是否附件签章
    const isAttachmentSignAndText =
      (signatureType === 'TEXT_AND_ANNEX_SIGNATURE' &&
        electricSignFlag === 1 &&
        allSignList.includes(authType)) ||
      electronicSignatureAttachmentDisplayFlag === 'Y'; // 是否附件签章

    const electricSignAttachmentProps = {
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: 'purchase-contract',
      btnText: intl.get(`spcm.common.view.btn.electronicSignatureAttachment`).d('电子签章附件'),
      title: intl.get(`spcm.common.view.btn.electronicSignatureAttachment`).d('电子签章附件'),
      attachmentUUID: headerInfo.pcHeaderElectronicSignatureAttachment,
      rightAttachmentUUID: headerInfo.pcHeaderElectronicSignatureAttachmentIsSigned,
      fileSize: 25 * 1024 * 1024,
    };
    return (
      /* openFrom:判断是不是订单跳进来的 只需要两个附件按钮 */
      <Header
        title={
          statementFlag ? (
            intl.get(`${viewMessagePrompt}.contractStatement`).d('协议报表')
          ) : (
            <IMChatDraggable
              cardCode="PURCHASE_CONTRACT_VIEW"
              icon="baseline-drag_indicator"
              tooltip=""
              showDetail
              requestBody={() => headerInfo}
              dragText={`协议${headerInfo.pcNum || ''}`}
            >
              {intl.get(`${viewMessagePrompt}.purchaseContractView`).d('我发起的协议')}
            </IMChatDraggable>
          )
        }
        backPath={this.handleBackParentPath()}
      >
        {/* 初版不显示按钮 */}
        {pcStatusCode === 'FIRST_EDITION'
          ? null
          : customizeBtnGroup(
              {
                code: 'SPCM.PURCHASE_CONTRACT_VIEW.DETAIL.BTN_GROUP',
              },
              [
                isPub && !['PENDING', 'DELETED'].includes(pcStatusCode) && (
                  <Button
                    data-name="onlineTextCompare"
                    loading={queryingHeader || fetchTextPreViewLoading}
                    icon="profile"
                    onClick={() => this.handleTextCompare()}
                  >
                    {intl.get('spcm.common.button.contractTextComparison').d('合同文本对比')}
                  </Button>
                ),
                /**
                 * docLinkFlag(0/1)：单据流标识docLinkFlag=1，只展示展示附件按钮（采购方、供应商、电子签章附件等）、操作记录按钮。
                 * backVoidPage(NO/YES): backVoidPage显示附件按钮（采购方、供应商、电子签章附件等）、操作记录按钮、打印按钮
                 */
                ...(openFrom || backVoidPage || Number(docLinkFlag)
                  ? [
                      libFlag !== 'priceLib' && !openFrom && (
                        <Button
                          data-name="operating"
                          loading={submitDeliveryLoading}
                          icon="clock-circle-o"
                          type="primary"
                          onClick={() =>
                            this.handleModalVisible('operationRecordVisible', true, {
                              pcHeaderId: 1,
                            })
                          }
                        >
                          {intl.get(`hzero.common.button.operating`).d('操作记录')}
                        </Button>
                      ),
                      !isEmpty(headerInfo) && templateListFlag && (
                        <Attachment {...attachmentProps} data-name="attachment" />
                      ),
                      pcHeaderId && (
                        <PermissionButton
                          data-name="purchaserAttachment"
                          key="purchaserAttachment"
                          permissionList={[
                            {
                              code: 'srm.pc-admin.pc-purchaser.view.ps.attachment',
                              type: 'button',
                              meaning: '采购方附件',
                            },
                          ]}
                          className={styles.purchaseHeaderNumber}
                        >
                          <Upload {...uploadProps} />
                        </PermissionButton>
                      ),
                      pcHeaderId &&
                        !openFrom &&
                        editStep === 1 &&
                        !['ATTACHMENT_FRAMEWORK', 'ATTACHMENT'].includes(headerInfo.pcKindCode) &&
                        !isAttachmentSignUpload && (
                          <PrintButton data-name="print" pcHeaderId={pcHeaderId} />
                        ),
                      headerInfo &&
                        !openFrom &&
                        (isAttachmentSignUpload || isAttachmentSignAndText) && (
                          <Button data-name="electronicSignatureAttachment">
                            <ComUpload viewOnly {...electricSignAttachmentProps} />
                          </Button>
                        ),
                    ]
                  : [
                      libFlag !== 'priceLib' && (
                        <Button
                          data-name="operating"
                          loading={submitDeliveryLoading}
                          icon="clock-circle-o"
                          type="primary"
                          onClick={() =>
                            this.handleModalVisible('operationRecordVisible', true, {
                              pcHeaderId: 1,
                            })
                          }
                        >
                          {intl.get(`hzero.common.button.operating`).d('操作记录')}
                        </Button>
                      ),
                      !isEmpty(headerInfo) && templateListFlag && (
                        <Attachment {...attachmentProps} data-name="attachment" />
                      ),
                      pcHeaderId && (
                        <PermissionButton
                          data-name="purchaserAttachment"
                          key="purchaserAttachment"
                          permissionList={[
                            {
                              code: 'srm.pc-admin.pc-purchaser.view.ps.attachment',
                              type: 'button',
                              meaning: '采购方附件',
                            },
                          ]}
                          className={styles.purchaseHeaderNumber}
                        >
                          <Upload {...uploadProps} />
                        </PermissionButton>
                      ),
                      !isPub && libFlag !== 'priceLib' && !statementFlag && (
                        <PermissionButton
                          data-name="archive"
                          key="archive"
                          permissionList={[
                            {
                              code: 'srm.pc-admin.pc-purchaser.view.ps.archive.contract',
                              type: 'button',
                              meaning: '归档',
                            },
                          ]}
                          onClick={() => this.handleContract('contractModalVisible', true)}
                          icon="look-over"
                          disabled={
                            !(
                              (headerInfo.pcStatusCode === 'EFFECTED' &&
                                headerInfo.electricSignFlag === 1) ||
                              (headerInfo.pcStatusCode === 'CONFIRMED' &&
                                headerInfo.electricSignFlag === 0 &&
                                headerInfo.displayFlag2 !== '1') ||
                              (headerInfo.pcStatusCode === 'EFFECTED' &&
                                headerInfo.electricSignFlag === 0 &&
                                headerInfo.displayFlag3 === '1') ||
                              // 已失效、已终止并且归档状态为未归档
                              (['TERMINATION', 'EXPIRED'].includes(headerInfo.pcStatusCode) &&
                                headerInfo.archiveFlag === 0)
                            )
                          }
                        >
                          {intl.get(`${modelPrompt}.file`).d('归档')}
                        </PermissionButton>
                      ),
                      !isPub &&
                        pcStatusCode === 'TERMINATION' &&
                        authType?.includes('_SAAS') &&
                        electricSignFlag === 1 &&
                        terminateSignStatus === 'NOT_TERMINATED' && (
                          <PermissionButton
                            data-name="breakOff"
                            key="breakOff"
                            permissionList={[
                              {
                                code: 'srm.pc-admin.pc-purchaser.view.button.terminate',
                                type: 'button',
                                meaning: '解约',
                              },
                            ]}
                            onClick={this.handleBreakOffContract}
                          >
                            {intl.get(`spcm.common.view.button.breakOffContract`).d('解约')}
                          </PermissionButton>
                        ),
                      !headerInfo.displayFlag1 && !isEmpty(headerInfo) && (
                        <CustomButton
                          data-name="signSeal"
                          data={signSeal || []}
                          headerInfo={headerInfo}
                          loading={postSignAndSealLoading}
                          handleSubmit={this.handleSignAndSeal}
                          disabled
                        />
                      ),
                      headerInfo && (isAttachmentSignUpload || isAttachmentSignAndText) && (
                        <Button data-name="electronicSignatureAttachment">
                          <ComUpload viewOnly {...electricSignAttachmentProps} />
                        </Button>
                      ),
                      headerInfo.pcStatusCode !== 'PENDING' &&
                        !['ATTACHMENT_FRAMEWORK', 'ATTACHMENT'].includes(headerInfo.pcKindCode) &&
                        !isAttachmentSignUpload && (
                          <PermissionButton
                            data-name="textComparison"
                            key="textComparison"
                            permissionList={[
                              {
                                code: 'srm.pc-admin.pc-purchaser.view.ps.text.comparison',
                                type: 'button',
                                meaning: '文本对比',
                              },
                            ]}
                            onClick={this.handleControlComparison}
                          >
                            {intl.get('spcm.common.view.title.textComparison').d('文本对比')}
                          </PermissionButton>
                        ),
                      pcHeaderId &&
                        editStep === 1 &&
                        !['ATTACHMENT_FRAMEWORK', 'ATTACHMENT'].includes(headerInfo.pcKindCode) &&
                        !isAttachmentSignUpload && (
                          <PrintButton data-name="print" pcHeaderId={pcHeaderId} />
                        ),
                      pcHeaderId && (
                        <ContractApprovalButton
                          data-name="contractApproval"
                          pcHeaderId={pcHeaderId}
                        />
                      ),
                    <PermissionButton
                      data-name="fetchLockPrintContract"
                      key="fetchLockPrintContract"
                      permissionList={[
                          {
                            code: 'srm.pc-admin.pc-purchaser.view.ps.jala.contract.lock.print',
                            type: 'button',
                            meaning: '获取打印链接',
                          },
                        ]}
                      loading={fetchLockPrintContractLoading}
                      style={{ paddingRight: '1em' }}
                      onClick={() => this.handleFetchPrintContract(pcHeaderId)}
                    >
                      {intl
                          .get(`spcm.purchaseContractView.view.button.fetchLockPrintContract`)
                          .d('获取打印链接')}
                    </PermissionButton>,
                    <PermissionButton
                      data-name="fetchLockContractFile"
                      key="fetchLockContractFile"
                      permissionList={[
                          {
                            code: 'srm.pc-admin.pc-purchaser.view.ps.jala.contract.lock.print.file',
                            type: 'button',
                            meaning: '获取合同附件',
                          },
                        ]}
                      loading={fetchLockContractFileLoading}
                      style={{ paddingRight: '1em' }}
                      onClick={() => this.handleFetchLockContFile(pcHeaderId)}
                    >
                      {intl
                          .get(`spcm.purchaseContractView.view.button.fetchLockContractFile`)
                          .d('获取合同附件')}
                    </PermissionButton>,
                      supplementFlag ? (
                        <Button
                          data-name="contractHistoryCompare"
                          icon="clock-circle-o"
                          onClick={this.toContractHistoryCompare}
                        >
                          {intl.get(`hzero.common.button.contractHistoryCompare`).d('历史版本对比')}
                        </Button>
                      ) : null, // 用三目防止初次加载按钮显示成0（supplementFlag的值）
                      electricSignFlag &&
                      signatureType !== 'ANNEX_SIGNATURE' &&
                      contractFileUrl &&
                      ['EFFECTED', 'ARCHIVE', 'ARCHIVE_TO_APPROVAL'].includes(pcStatusCode) ? (
                        <PermissionButton
                          data-name="downloadSignContract"
                          key="downloadSignContract"
                          permissionList={[
                            {
                              code:
                                'srm.pc-admin.pc-purchaser.view.ps.download.signing.contract.button',
                              type: 'button',
                              meaning: '下载签章合同',
                            },
                          ]}
                          icon="download"
                          onClick={this.downloadSignContract}
                        >
                          {intl.get(`spcm.common.button.downloadSignContract`).d('下载签章合同')}
                        </PermissionButton>
                      ) : null, // 用三目防止初次加载按钮显示成0（electricSignFlag的值）
                    <PermissionButton
                      data-name="reExportContractLock"
                      key="reExportContractLock"
                      permissionList={[
                          {
                            code: 'srm.pc-admin.pc-purchaser.view.ps.jala.contract.lock.heavy.push',
                            type: 'button',
                            meaning: '重推契约锁',
                          },
                        ]}
                      disabled={!['PUBLISHED'].includes(headerInfo.pcStatusCode)}
                      onClick={this.reExportContractLock}
                    >
                      {intl
                          .get('spcm.purchaseContractView.view.message.reExportContractLock')
                          .d('重推契约锁')}
                    </PermissionButton>,
                      pcStatusCode === 'EFFECTED' && (
                        <PermissionButton
                          data-name="download"
                          key="download"
                          permissionList={[
                            {
                              code: 'srm.pc-admin.pc-purchaser.view.ps.meyer.download.attachment',
                              type: 'button',
                              meaning: '下载',
                            },
                          ]}
                          loading={syncAttachmentLoading}
                          style={{ paddingRight: '1em' }}
                          onClick={() => this.downloadSyncContract(pcHeaderId)}
                        >
                          {intl.get(`spcm.common.button.download`).d('下载')}
                        </PermissionButton>
                      ),
                      !isAttachmentSignUpload && (
                        <Button
                          data-name="textPreview"
                          loading={queryingHeader || fetchTextPreViewLoading}
                          onClick={this.getTextPreViewUrl}
                          disabled={
                            !pcHeaderId ||
                            ['ATTACHMENT_FRAMEWORK', 'ATTACHMENT'].includes(pcKindCode)
                          }
                        >
                          {intl.get('spcm.common.view.title.textPreview').d('文本预览')}
                        </Button>
                      ),
                    ]),
              ]
            )}
      </Header>
    );
  }

  // 奥雅 srm-124766
  renderOperationRecordDrawer(operationRecordProps) {
    return <OperationRecordDrawer {...operationRecordProps} />;
  }

  // src-4038 为了58的补充协议列表二开
  @Bind()
  renderContractReplenish(contractReplenishProps) {
    return <ContractReplenish {...contractReplenishProps} />;
  }

  /**
   * 优惠规则——折扣
   * @param {object} discountRuleProps 折扣属性
   * @returns
   */
  renderDiscountRule(discountRuleProps) {
    return <PreferentialRule {...discountRuleProps} />;
  }

  /**
   * 优惠规则——返利
   * @param {object} rebateRuleProps 返利属性
   * @returns
   */
  renderRebateRule(rebateRuleProps) {
    return <PreferentialRule {...rebateRuleProps} />;
  }

  render() {
    const {
      form,
      location,
      purchaseContractView,
      queryingHeader = false,
      queryingPartner = false,
      queryingSubject = false,
      queryingStage = false,
      queryingTerm = false,
      bindingUuid = false,
      loadingPaymentCode = false,
      submitDeliveryLoading = false,
      customizeForm,
      customizeTable,
      custLoading,
      archiveContractLoading,
      contractCommon: { configSetting = {} },
      remote,
      history,
    } = this.props;
    const {
      operationRecordVisible,
      pcSubjectDataSource = [],
      pcSubjectPagination = {},
      pcStageDataSource = [],
      pcStagePagination = {},
      pcSubjectSelectedRows = [],
      partnerDataSource = [],
      partnerPagination = {},
      partnerSelectedRows = [],
      headerInfo = {},
      termPagination = {},
      termDataSource = [],
      termSelectedRows = [],
      activeKey,
      pcRebateDataSource = [],
      pcRebatePagination = {},
      textComparisonVisible,
      contractModalVisible = false,
      isPub,
      isProcessEdit,
      isLegal,
      aiApproveParam,
    } = this.state;
    const {
      editStep,
      rebateFlag,
      supplementFlag,
      electricSignFlag,
      signatureType,
      authType,
      enableRule,
      pcNum,
      version,
    } = headerInfo;

    const { search = {} } = location;
    const { detailEnumMap } = purchaseContractView;
    const { pcHeaderId = headerInfo.pcHeaderId, openFrom, docLinkFlag = 0 } = querystring.parse(
      search.substr(1)
    );
    const editable = false;
    const pageSourceKey = 'PURCHASE_CONTRACT_VIEW';

    // 归档附件props(仅在我发起的协议添加)
    const purchaseArchiveUploadProps = {
      viewOnly: true,
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: 'purchaser-attachment',
      btnText: intl.get(`spcm.common.attachmentUuid`).d('归档文件'),
      title: intl.get(`spcm.common.attachmentUuid`).d('归档文件'),
      attachmentUUID: headerInfo.archiveAttachmentUuid,
      modalClassName: isPub ? 'spcm-pub-modal' : null,
    };

    /**
     * editable 根据头id
     * form 表单 // 父组件的form不穿下去，个性化显示会有问题(未找到原因)
     * dataSource 数据源
     * enumMap 值集
     */
    const headerInfoFormProps = {
      isPub,
      isProcessEdit,
      remote,
      history,
      form,
      custLoading,
      pageSourceKey,
      purchaseFlag: true, // 是否来自采购方
      terminateReasonFlag: [
        'TERMINATION_TO_APPROVAL',
        'TERMINATION_CONFIRM',
        'TERMINATION',
      ].includes(headerInfo.pcStatusCode),
      detailEnumMap,
      loadingPaymentCode,
      editable,
      customizeForm,
      dataSource: headerInfo,
      supplementFlag,
      isLegal, // 是否可修改法务合同编号
      onChangeHeader: this.handleChangeHeader,
      afterOpenUploadModal: this.afterOpenLineUploadModal,
      isShowArchiveUpload: true,
      purchaseArchiveUploadProps,
      onRef: (node) => {
        this.headerRef = node;
      },
    };
    /**
     * editable 根据头id
     * enumMap 值集
     * dataSource 数据源
     * pagination 分页
     * selectedRowKeys 选中的行
     * onSelectionChange 分页变化回调
     * onSearch 分页改变回调
     * loading 查询状态
     */
    const contractSubjectListProps = {
      isPub,
      isProcessEdit,
      remote,
      editable,
      headerInfo,
      customizeTable,
      docLinkFlag,
      isPurchaseContract: true,
      loading: queryingSubject,
      showOperationLadderQuote: true, // 是否加载阶梯价格弹窗模块
      showSearchSubject: true, // 是否加载物料查询模块
      pagination: pcSubjectPagination,
      dataSource: pcSubjectDataSource,
      onSelectionChange: this.handleChangeSelection,
      selectedRows: pcSubjectSelectedRows,
      onAdd: () => this.handleAddLines('pcSubject'),
      onDelete: () => this.handleDeleteLines('pcSubject'),
      ref: this.partnerRef,
      onPrePaginationChange: this.fetchSubject,
      onChangeListData: this.handleChangeList,
      handleLadderQuote: this.handleLadderQuote,
      onSearchSubject: ({ itemName, itemCode }) => this.fetchSubject(undefined, itemName, itemCode),
    };

    // 新增 tab 协议阶段相关数据
    const contractStageListProps = {
      isPub,
      isProcessEdit,
      editable,
      customizeTable,
      loading: queryingStage,
      pagination: pcStagePagination,
      dataSource: pcStageDataSource,
      onRef: (node) => {
        this.pcStageRef = node;
      },
      onPrePaginationChange: this.fetchStage,
    };
    const contractRebateProps = {
      isPub,
      isProcessEdit,
      editable,
      customizeTable,
      dataSource: pcRebateDataSource,
      pagination: pcRebatePagination,
      onPrePaginationChange: this.fetchContractRebate,
    };
    const partnerListProps = {
      isPub,
      isProcessEdit,
      editable,
      customizeTable,
      loading: queryingPartner,
      pagination: partnerPagination,
      dataSource: partnerDataSource,
      onSearch: this.fetchPartner,
      onSelectionChange: this.handleChangeSelection,
      selectedRows: partnerSelectedRows,
      onAdd: () => this.handleAddLines('partner'),
      onDelete: () => this.handleDeleteLines('partner'),
      ref: this.partnerRef,
      onChangeListData: this.handleChangeList,
    };
    const contractBusinessTermsListProps = {
      isPub,
      isProcessEdit,
      editable,
      loading: queryingTerm,
      pagination: termPagination,
      dataSource: termDataSource,
      onSearch: this.fetchTerm,
      onSelectionChange: this.handleChangeSelection,
      selectedRows: termSelectedRows,
      ref: this.termRef,
    };

    const discountRuleProps = {
      editable,
      majorPcNum: `${pcNum}|${version}`,
      type: 'discount',
      isH0Type: true,
    };

    const rebateRuleProps = {
      editable,
      majorPcNum: `${pcNum}|${version}`,
      type: 'rebate',
      isH0Type: true,
    };

    const operationRecordProps = {
      pcHeaderId,
      visible: operationRecordVisible,
      onHandleCancel: () => this.handleModalVisible('operationRecordVisible', false),
      otherModalProps: {
        className: isPub ? 'spcm-pub-modal' : null,
      },
    };

    const textComparisonProps = {
      pcHeaderId,
      visible: textComparisonVisible,
      onCancel: this.handleControlComparison,
    };

    const contractModalProps = {
      headerInfo,
      customizeForm,
      archiveContractLoading,
      visible: contractModalVisible,
      onOk: this.archiveContract,
      onCancel: () => this.handleContract('contractModalVisible', false),
      modalClassName: isPub ? 'spcm-pub-modal' : null,
    };

    const contractReplenishProps = {
      openFrom,
      pcHeaderId,
      redirectDetail: this.redirectDetail,
      customizeTable,
      custLoading,
      remote,
    };

    const EditorOnlineProps = {
      menuCode: CONTRACT_VIEW,
      isOtherPageEdit: ['REJECTED', 'SUPPLIER_REJECTED', 'PENDING'].includes(
        headerInfo.pcStatusCode
      ),
      iframeStyle: {
        width: '100%',
        height: `${
          ((isPub ? window.parent?.document?.body?.clientHeight : document?.body?.clientHeight) -
            96) *
          0.9
        }px`,
      },
      pcHeaderId,
      headerInfo,
      permissionCode: 'VIEW',
    };

    const isAttachmentSignUpload =
      signatureType === 'ANNEX_SIGNATURE' &&
      electricSignFlag === 1 &&
      allSignList.includes(authType); // 是否附件签章

    const defaultRenderProps = {
      renderTermsFlag:
        pcHeaderId && !['ATTACHMENT_FRAMEWORK', 'ATTACHMENT'].includes(headerInfo.pcKindCode),
      replenishFlag: pcHeaderId && !supplementFlag,
    };

    /**
     * 注意！！！使用该埋点的时候返回的数据一定要带上defaultRenderProps,
     * 例如 return { ...defaultRenderProps, renderTermsFlag: false,  replenishFlag: true };
     * 切忌直接返回 return { renderTermsFlag: false,  replenishFlag: true };
     * 未来可能还会在 defaultRenderProps添加其他参数。
     */
    const { renderTermsFlag, replenishFlag } = remote
      ? remote?.process('SPCM_PUR_CONTRACT_VIEW_DETAIL_RENDER_PROPS', defaultRenderProps, {
          current: this,
        })
      : defaultRenderProps;

    return (
      <Fragment>
        {this.renderHeaderButton()}

        <Content>
          <div id="spcm-contract-sign-detail-content-inner-wrapper">
            <Spin
              spinning={
                queryingHeader ||
                queryingPartner ||
                submitDeliveryLoading ||
                loadingPaymentCode ||
                bindingUuid
              }
              wrapperClassName={classnames(
                styles['contract-maintain-spin-wrapper'],
                DETAIL_DEFAULT_CLASSNAME
              )}
            >
              <IntelligentPreReview {...aiApproveParam} />
              <Row gutter={24}>
                <Col span={21}>
                  <Card
                    key="contractHeaderInformation"
                    id="spcm-maintain-detail-contract-header-information"
                    bordered={false}
                    className={DETAIL_CARD_CLASSNAME}
                    title={
                      <h3>
                        {intl
                          .get(`${commonViewPrompt}.contractHeaderInformation`)
                          .d('采购协议头信息')}
                      </h3>
                    }
                  >
                    {this.renderContractHeader(headerInfoFormProps)}
                  </Card>

                  {pcHeaderId && (
                    <div key="subjectInformation" id="spcm-maintain-detail-contract-subject">
                      <Tabs activeKey={activeKey} animated={false} onChange={this.handleSaveKey}>
                        <TabPane
                          tab={intl.get(`${commonViewPrompt}.contractSubject`).d('协议标的')}
                          key="contractSubjectInfo"
                        >
                          {this.renderContractSubject(contractSubjectListProps)}
                        </TabPane>
                        <TabPane
                          tab={intl.get(`${commonViewPrompt}.contractStage`).d('协议阶段')}
                          key="contractStage"
                        >
                          {this.renderContractStage(contractStageListProps)}
                        </TabPane>
                        {rebateFlag && (
                          <TabPane
                            tab={intl
                              .get('spcm.common.view.message.title.ContractRebate')
                              .d('返利信息')}
                            key="contractRebate"
                          >
                            <ContractRebate {...contractRebateProps} />
                          </TabPane>
                        )}
                      </Tabs>
                    </div>
                  )}
                  {pcHeaderId && (
                    <Card
                      key="contractPartnerInformation"
                      id="spcm-maintain-detail-contract-partner"
                      bordered={false}
                      className={DETAIL_CARD_CLASSNAME}
                      title={
                        <h3>
                          {intl
                            .get(`${commonViewPrompt}.contractPartnerInformation`)
                            .d('采购协议伙伴信息')}
                        </h3>
                      }
                    >
                      <ContractPartner {...partnerListProps} />
                    </Card>
                  )}
                  {renderTermsFlag && (
                    <Card
                      key="contractBusinessTermsInformation"
                      id="spcm-maintain-detail-contract-business-terms"
                      bordered={false}
                      className={DETAIL_CARD_CLASSNAME}
                      title={
                        <h3>
                          {intl
                            .get(`spcm.common.view.message.title.purcAgreementBusinessTerms`)
                            .d('采购协议业务条款')}
                        </h3>
                      }
                    >
                      <ContractBusinessTerms {...contractBusinessTermsListProps} />
                    </Card>
                  )}
                  {pcHeaderId && !!enableRule && (
                    <Card
                      key="discountRule"
                      id="spcm-contract-maintain-detail-discount-rule"
                      bordered={false}
                      className={DETAIL_CARD_CLASSNAME}
                      title={
                        <h3>
                          {intl
                            .get('spcm.common.view.message.title.dicountRule')
                            .d('优惠规则-折扣')}
                        </h3>
                      }
                    >
                      {this.renderDiscountRule(discountRuleProps)}
                    </Card>
                  )}
                  {pcHeaderId && !!enableRule && (
                    <Card
                      key="rebateRule"
                      id="spcm-contract-maintain-detail-rebate-rule"
                      bordered={false}
                      className={DETAIL_CARD_CLASSNAME}
                      title={
                        <h3>
                          {intl.get('spcm.common.view.message.title.rebateRule').d('优惠规则-返利')}
                        </h3>
                      }
                    >
                      {this.renderRebateRule(rebateRuleProps)}
                    </Card>
                  )}
                  {pcHeaderId && configSetting['010601'] === '1' && (
                    <Card
                      key="approveRecordInformation"
                      id="spcm-purchase-contract-detail-approve-record"
                      bordered={false}
                      className={DETAIL_CARD_CLASSNAME}
                      title={
                        <h3>
                          {intl.get(`${commonViewPrompt}.approveRecordInformation`).d('审批记录')}
                        </h3>
                      }
                    >
                      <ApproveRecord isShowExport pcHeaderId={pcHeaderId} />
                    </Card>
                  )}
                  {replenishFlag && (
                    <Card
                      key="contractReplenishList"
                      id="spcm-contract-approval-detail-contract-replenish"
                      bordered={false}
                      className={DETAIL_CARD_CLASSNAME}
                      title={
                        <h3>
                          {intl.get(`${commonViewPrompt}.contractReplenishList`).d('补充协议列表')}
                        </h3>
                      }
                    >
                      {this.renderContractReplenish(contractReplenishProps)}
                    </Card>
                  )}
                  {pcHeaderId &&
                    editStep === 1 &&
                    !['ATTACHMENT_FRAMEWORK', 'ATTACHMENT'].includes(headerInfo.pcKindCode) &&
                    this.state.headerFetchedFlag &&
                    !isAttachmentSignUpload && (
                      <Card
                        key="contractOnlineEdit"
                        id="spcm-contract-approval-detail-contract-online-edit"
                        bordered={false}
                        className={DETAIL_CARD_CLASSNAME}
                        title={
                          <h3>
                            {intl.get(`spcm.common.title.contractOnlineEdit`).d('采购协议文本编辑')}
                          </h3>
                        }
                      >
                        {this.renderEditorOnline(EditorOnlineProps)}
                      </Card>
                    )}
                </Col>
                <Col span={3}>
                  <Affix
                    style={{ top: '200px', width: 'calc( 100% - 11px )', position: 'absolute' }}
                    offsetTop={224}
                    target={this.getAffixContainer}
                  >
                    <Anchor getContainer={this.getAffixContainer} offsetTop={24}>
                      <Link
                        href="#spcm-maintain-detail-contract-header-information"
                        title={intl.get(`${commonViewPrompt}.basicInformation`).d('基本信息')}
                      />
                      <Link
                        href="#spcm-maintain-detail-contract-subject"
                        title={intl.get(`${commonViewPrompt}.subjectInformation`).d('标的信息')}
                      />
                      <Link
                        href="#spcm-maintain-detail-contract-partner"
                        title={intl.get(`${commonViewPrompt}.partnerInformation`).d('伙伴信息')}
                      />
                      {renderTermsFlag && (
                        <Link
                          href="#spcm-maintain-detail-contract-business-terms"
                          title={intl
                            .get(`${commonViewPrompt}.businessTermsInformation`)
                            .d('业务条款')}
                        />
                      )}
                      {pcHeaderId && !!enableRule && (
                        <Link
                          href="#spcm-contract-maintain-detail-discount-rule"
                          title={intl
                            .get('spcm.common.view.message.title.dicountRule')
                            .d('优惠规则-折扣')}
                        />
                      )}
                      {pcHeaderId && !!enableRule && (
                        <Link
                          href="#spcm-contract-maintain-detail-rebate-rule"
                          title={intl
                            .get('spcm.common.view.message.title.rebateRule')
                            .d('优惠规则-返利')}
                        />
                      )}
                      {configSetting['010601'] === '1' && (
                        <Link
                          href="#spcm-purchase-contract-detail-approve-record"
                          title={intl
                            .get(`${commonViewPrompt}.approveRecordInformation`)
                            .d('审批记录')}
                        />
                      )}
                      {replenishFlag && (
                        <Link
                          href="#spcm-contract-approval-detail-contract-replenish"
                          title={intl.get(`spcm.common.title.contractReplenish`).d('补充协议')}
                        />
                      )}
                      {pcHeaderId &&
                        editStep === 1 &&
                        !['ATTACHMENT_FRAMEWORK', 'ATTACHMENT'].includes(headerInfo.pcKindCode) &&
                        !isAttachmentSignUpload && (
                          <Link
                            href="#spcm-contract-approval-detail-contract-online-edit"
                            title={intl.get(`spcm.common.title.onlineEdit`).d('文本编辑')}
                          />
                        )}
                    </Anchor>
                  </Affix>
                </Col>
              </Row>
            </Spin>
          </div>
        </Content>
        {this.renderOperationRecordDrawer(operationRecordProps)}
        {textComparisonVisible && <TextComparisonModal {...textComparisonProps} />}
        {this.renderFileModal(contractModalProps)}
      </Fragment>
    );
  }
}
const hocFunc = (com) =>
  compose(
    Form.create({ fieldNameProp: null }),
    connect(({ loading, purchaseContractView, contractCommon, contractMaintain }) => ({
      queryingHeader: loading.effects['contractCommon/fetchHeader'],
      queryingPartner: loading.effects['contractCommon/fetchPartner'],
      queryingSubject: loading.effects['contractCommon/fetchSubject'],
      queryingStage: loading.effects['contractCommon/fetchStage'],
      queryingTerm: loading.effects['contractCommon/fetchTermPage'],
      confirmLoading: loading.effects['purchaseContractView/confirmContract'],
      archiveContractLoading: loading.effects['purchaseContractView/archiveContract'],
      syncAttachmentLoading: loading.effects['purchaseContractView/syncAttachment'],
      fetchLockPrintContractLoading: loading.effects['contractCommon/fetchLockPrintContract'],
      fetchLockContractFileLoading: loading.effects['contractCommon/fetchLockContractFile'],
      postSignAndSealLoading: loading.effects['purchaseContractView/postSignAndSeal'],
      fetchTextPreViewLoading: loading.effects['editorOnline/fetchTextPreView'],
      purchaseContractView,
      contractCommon,
      contractMaintain,
    })),
    formatterCollections({
      code: [
        'spcm.purchaseContractView',
        'spcm.common',
        'spcm.purchaseRequisitionCreation',
        'entity.company',
        'entity.supplier',
        'hzero.common',
        'sodr.common',
        'component.docFlow',
        'spfp.ruleMaintenance',
        'spfp.common',
      ],
    }),
    withCustomize({
      unitCode: [
        'SPCM.PURCHASE_CONTRACT_MAINTAIN.DETAIL',
        'SPCM.PURCHASE_CONTRACT_VIEW.DETAIL.BTN_GROUP', // 我发起的协议详情-按钮组
        'SPCM.PURCHASE_CONTRACT_MAINTAIN.DETAIL.READONLY',
        'SPCM.PURCHASE_CONTRACT_MAINTAIN.SUBJECT',
        'SPCM.PURCHASE_CONTRACT_MAINTAIN.SUBJECT.READONLY',
        'SPCM.PURCHASE_CONTRACT_MAINTAIN.PARTNER',
        'SPCM.PURCHASE_CONTRACT_MAINTAIN.PARTNER.READONLY',
        'SPCM.PURCHASE_CONTRACT_MAINTAIN.STAGE',
        'SPCM.PURCHASE_CONTRACT_MAINTAIN.STAGE.READONLY',
        'SPCM.PURCHASE_CONTRACT_MAINTAIN.REBATE',
        'SPCM.PURCHASE_CONTRACT_MAINTAIN.REBATE.READONLY',
        'SPCM.PURCHASE_CONTRACT_VIEW.ARCHIVE',
        'SPCM.PURCHASE_CONTRACT_MAINTAIN.CONTRACTREPLENISH',
      ],
    }),
    hocRemote(
      {
        code: 'SPCM_PUR_CONTRACT_VIEW_DETAIL',
        name: 'remote', // 默认 'remote'， 如有属性冲突可以改此属性
      },
      {
        events: {
          // 查询补充协议
          fetchCuxReplenish() {},
        },
      }
    )
  )(com);
export { Detail, hocFunc };
export default hocFunc(Detail);
