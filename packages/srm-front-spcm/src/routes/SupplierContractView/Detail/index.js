/*
 * purchaseContractViewDetail - 我收到的协议详情
 * @date: 2019-05-14
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component, Fragment } from 'react';
import { Button, Spin, Form, Row, Col, Anchor, Affix, Card, Tabs } from 'hzero-ui';
import { Modal } from 'choerodon-ui/pro';
import { connect } from 'dva';
import { isNumber, isEmpty, compose } from 'lodash';
import classnames from 'classnames';
import { Bind, Debounce } from 'lodash-decorators';
import querystring from 'querystring';
// import withCustomize from 'srm-front-cuz';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { routerRedux } from 'dva/router';
import notification from 'utils/notification';
import { HZERO_FILE } from 'utils/config';
import { downloadFile } from 'services/api';
import ComUpload from '@/routes/components/ComUpload';
import PreferentialRule from '@/routes/components/PreferentialRule';

import { Button as PermissionButton } from 'components/Permission';
import { Header, Content } from 'components/Page';
import {
  createPagination,
  getCurrentOrganizationId,
  getResponse,
  getCurrentUser,
} from 'utils/utils';
import intl from 'utils/intl';
import hocRemote from 'utils/remote';
import formatterCollections from 'utils/intl/formatterCollections';
import { DETAIL_DEFAULT_CLASSNAME, DETAIL_CARD_CLASSNAME } from 'utils/constants';
import { isBlackTenant, allSignList } from '@/utils/util';
import { PRIVATE_BUCKET } from 'srm-front-boot/lib/utils/config';
import { TopSection, SecondSection } from '_components/Section';
import ChatRoom from 'srm-front-mobile/lib/components/Chat/Room';
import DotButton from '@/routes/components/DotButton';

import { initChatOnlineRoom, queryShareEditConfig } from '@/services/newContractService';
import { getExtractConfig } from '@/services/workspaceService';

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
import PrintButton from '../../components/PrintButton';
import TextComparisonModal from '../../components/TextComparisonModal';
import ContractReplenish from '../../components/ContractReplenish';
import ContractTableExtend from '../../components/ContractTableExtend';

import styles from './index.less';

const { Link } = Anchor;
const { TabPane } = Tabs;
const viewMessagePrompt = 'spcm.supplierContractView.view.message';
const commonViewPrompt = 'spcm.common.view.message';
const CONTRACT_SUPPLIER_VIEW = 'srm.pc-admin.pc-supplier.view';
// const viewTitlePrompt = 'spcm.supplierContractView.view.title';

const organizationId = getCurrentOrganizationId();
const currentUser = getCurrentUser();

const oldUnitCodeList = {
  DETAIL: 'SPCM.PURCHASE_CONTRACT_MAINTAIN.DETAIL.READONLY',
  PARTNER: 'SPCM.PURCHASE_CONTRACT_MAINTAIN.PARTNER.READONLY',
  SUBJECT: 'SPCM.PURCHASE_CONTRACT_MAINTAIN.SUBJECT.READONLY',
  REBATE: 'SPCM.PURCHASE_CONTRACT_MAINTAIN.REBATE.READONLY',
  STAGE: 'SPCM.PURCHASE_CONTRACT_MAINTAIN.STAGE.READONLY',
};

const newUnitCodeList = {
  DETAIL: 'SPCM.CONTRACT.SIGN.DETAIL.READONLY',
  PARTNER: 'SPCM.CONTRACT.NEW-SIGN.PARTNER.READONLY',
  SUBJECT: 'SPCM.CONTRACT.NEW-SIGN.SUBJECT.READONLY',
  REBATE: 'SPCM.CONTRACT.NEW-SIGN.REBATE.READONLY',
  STAGE: 'SPCM.CONTRACT.NEW-SIGN.STAGE.READONLY',
};
/**
 * purchaseContractViewDetail - 我收到的协议详情
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {!Object} [supplierContractView={}] - 数据源
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
    super(props);
    const isPub = props.location.pathname.includes('/pub'); // 判断是否为pub页面
    const {
      location: { search, hash },
    } = this.props;
    const { pcHeaderId, sourceFlag, backVoidPage } = querystring.parse(search.substr(1));
    this.state = {
      hash,
      pcHeaderId,
      sourceFlag,
      backVoidPage,
      headerInfo: {}, // 头form数据源
      listDataSource: [], // 表格数据源
      headerFetchedFlag: false, // 锚点
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
      pcKindAttachList: ['ATTACHMENT_FRAMEWORK', 'ATTACHMENT'],
      activeKey: 'contractSubjectInfo',
      textComparisonVisible: false,
      isPub,
      notPrintAuthority: true, // 是否没有打印按钮权限
      unitCodeList: {},
      customFileFlag: 0,
      enableEditShare: null, // 是否启用在线编辑协同
      onlyEditReplaceWildcardBefore: null, // 是否仅编辑通配符替换前的文件
      enableSmartContract: false, // 智能提取
      enableOnlineAttachmentContract: false, // 附件合同在线编辑白名单
    };
    this.maintainContentRef = React.createRef();
    this.partnerRef = React.createRef();
    this.pcSubjectRef = React.createRef();
    this.pcStageRef = React.createRef();
    this.termRef = React.createRef();
  }

  async componentDidMount() {
    const isBlackTenantFlag = await isBlackTenant(['srm.pc-admin.pc-supplier.new-sign.ps.default']);
    // 不是黑名单中的租户，采用新的自定义
    this.setState({
      unitCodeList: {
        ...(isBlackTenantFlag ? oldUnitCodeList : newUnitCodeList),
      },
    });
    const { pcHeaderId } = this.state;
    if (pcHeaderId && isNumber(+pcHeaderId)) {
      this.fetchEnum();
      this.fetchHeader();
      this.fetchList();
      this.queryPrintAuthority();
      this.fetchShareEditConfig();
    }
    this.handleSmartContractConfig();
  }

  getSnapshotBeforeUpdate() {
    const { headerInfo, headerFetchedFlag, pcKindAttachList } = this.state;
    if (
      !headerFetchedFlag &&
      headerInfo.editStep === 1 &&
      !pcKindAttachList.includes(headerInfo.pcKindCode)
    ) {
      return headerInfo.editStep;
    }
    return null;
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (snapshot !== null) {
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
   * 查询配置表，智能合同
   */
  @Bind()
  async handleSmartContractConfig() {
    const res = getResponse(await getExtractConfig());
    if (res) {
      const { enableSmartContract, enableOnlineAttachmentContract } = res;
      this.setState({
        enableSmartContract,
        enableOnlineAttachmentContract,
      });
    }
  }

  /**
   * 查询详情值集
   */
  @Bind()
  fetchEnum() {
    const { dispatch } = this.props;
    dispatch({
      type: 'supplierContractView/fetchDetailEnum',
    });
  }

  // 在线编辑共享配置
  @Bind()
  fetchShareEditConfig() {
    queryShareEditConfig().then((res) => {
      if (getResponse(res)) {
        const { enableEditShare, onlyEditReplaceWildcardBefore } = res;
        this.setState({
          enableEditShare, // 是否启用在线编辑协同
          onlyEditReplaceWildcardBefore, // 是否仅编辑通配符替换前的文件
        });
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
   * fetchHeader - 查询头明细数据
   */
  @Bind()
  fetchHeader() {
    const { dispatch, remote } = this.props;
    const { pcHeaderId } = this.state;
    return dispatch({
      type: 'contractCommon/fetchHeader',
      pcHeaderId,
      customizeUnitCode: 'SPCM.CONTRACT.SIGN.DETAIL.READONLY',
    }).then((res) => {
      if (res) {
        this.handleFetchConfigAttachment();
        this.setState({ headerInfo: res }, () => {
          const pcKindAttachList = remote
            ? remote.process(
                'SPCM_SUP_CONTRACT_VIEW_DETAIL_PCKINDATTACHLSIT',
                ['ATTACHMENT_FRAMEWORK', 'ATTACHMENT'],
                { current: this, headerInfo: res }
              )
            : ['ATTACHMENT_FRAMEWORK', 'ATTACHMENT'];
          this.setState({ headerFetchedFlag: true, pcKindAttachList });
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
    const { pcHeaderId, unitCodeList } = this.state;
    if (pcHeaderId) {
      dispatch({
        type: 'contractCommon/fetchPartner',
        payload: {
          page,
          pcHeaderId,
          customizeUnitCode:
            unitCodeList?.PARTNER || 'SPCM.PURCHASE_CONTRACT_MAINTAIN.PARTNER.READONLY',
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
   */
  @Bind()
  fetchSubject(page = {}) {
    const { dispatch } = this.props;
    const { pcHeaderId, unitCodeList } = this.state;
    if (pcHeaderId) {
      dispatch({
        type: 'contractCommon/fetchSubject',
        payload: {
          page,
          pcHeaderId,
          customizeUnitCode:
            unitCodeList?.SUBJECT || 'SPCM.PURCHASE_CONTRACT_MAINTAIN.SUBJECT.READONLY',
        },
      }).then((res) => {
        if (res) {
          this.setState({
            pcSubjectDataSource: res.content.map((n) => ({ ...n, _status: 'update' })),
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
      type: 'supplierContractView/confirmContract',
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
      type: 'supplierContractView/confirmContract',
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
      type: 'supplierContractView/bindHeaderAttachmentUuid',
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
      type: 'supplierContractView/bindLineAttachmentUuid',
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
      type: 'supplierContractView/fetchOperationRecordList',
      payload: {
        pcHeaderId,
        page,
      },
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
    const parent = this.getParent(
      document.getElementById('spcm-contract-supplier-detail-content-inner-wrapper')
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
   * fetchStage - 查询标的协议阶段
   * @param {object} page - 协议阶段分页条件
   */
  @Bind()
  fetchStage(page = {}) {
    const { dispatch } = this.props;
    const { pcHeaderId, unitCodeList } = this.state;
    if (pcHeaderId) {
      dispatch({
        type: 'contractCommon/fetchStage',
        payload: {
          page,
          pcHeaderId,
          customizeUnitCode:
            unitCodeList?.STAGE || 'SPCM.PURCHASE_CONTRACT_MAINTAIN.STAGE.READONLY',
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
   * 保存激活的tab的key
   * @param {String} activeKey
   */
  @Bind()
  handleSaveKey(activeKey) {
    this.setState({ activeKey });
  }

  /**
   * 返回父页面
   */
  handleBackParentPath() {
    let routePath;
    const { sourceFlag, backVoidPage } = this.state;
    switch (sourceFlag) {
      case 'supplier-confirm-query': // 返回供应商确认页面
        routePath = '/sfin/supplier-confirm-query/list';
        break;
      case 'my-received-deduction': // 返回我收到的扣款单
        routePath = '/sfin/my-received-deduction/list';
        break;
      default:
        routePath = '/spcm/supplier-contract-view/list';
        break;
    }
    // backVoidPage：NO/YES，是否显示返回按钮
    return backVoidPage === 'NO' ? '' : routePath;
  }

  @Bind()
  handleControlComparison() {
    const { textComparisonVisible } = this.state;
    this.setState({ textComparisonVisible: !textComparisonVisible });
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
        pathname: `/spcm/supplier-contract-view/detail`,
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
      },
      () => {
        this.componentDidMount();
      }
    );
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
   * 下载签章合同
   */
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
   * queryPrintAuthority - 查询打印按钮权限
   */
  @Bind()
  queryPrintAuthority() {
    const { dispatch } = this.props;
    const { pcHeaderId } = this.state;
    dispatch({
      type: 'supplierContractView/queryButtonAuthority',
      payload: {
        pcHeaderId,
      },
    }).then((res) => {
      if (Array.isArray(res)) {
        this.setState({
          notPrintAuthority: !!res.includes('CONTRACT_RECEIVE_PRINT'),
        });
      }
    });
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

  // src-4038 为了58的补充协议列表二开
  @Bind()
  renderContractReplenish(contractReplenishProps) {
    const { remote } = this.props;
    const { headerInfo } = this.state;
    const { supplementFlag, pcHeaderId } = headerInfo || {};
    const replenishFlag = remote
      ? remote.process(
          'SPCM_SUP_CONTRACT_VIEW_DETAIL_REPLENISHFLAG',
          pcHeaderId && !supplementFlag,
          {
            ...contractReplenishProps,
            pcHeaderId,
            current: this,
          }
        )
      : pcHeaderId && !supplementFlag;
    return (
      replenishFlag && (
        <Card
          key="contractReplenishList"
          id="spcm-contract-approval-detail-contract-replenish"
          bordered={false}
          className={DETAIL_CARD_CLASSNAME}
          title={
            <h3>
              {intl.get(`spcm.common.view.message.title.contractReplenishList`).d('补充协议列表')}
            </h3>
          }
        >
          <ContractReplenish key={pcHeaderId} {...contractReplenishProps} />
        </Card>
      )
    );
  }

  @Bind()
  renderContractTableExtend(contractTableExtendProps) {
    return <ContractTableExtend {...contractTableExtendProps} />;
  }

  handleChatRoom = async () => {
    const { headerInfo } = this.state;
    const { pcHeaderId, supplierCompanyId, supplierTenantId } = headerInfo;
    const res = getResponse(await initChatOnlineRoom({ pcHeaderId, camp: 'supplier' }));
    if (res) {
      this.setState({ headerInfo: { ...headerInfo, msgNum: 0 } });
      const chatRoomModal = Modal.open({
        resizable: true,
        style: { width: 742 },
        bodyStyle: { padding: 0 },
        footer: null,
        header: null,
        drawer: true,
        children: (
          <ChatRoom
            contentClass={styles.chatRoom}
            onClose={() => chatRoomModal.close()}
            showClose
            roomParams={{
              businessNo: pcHeaderId,
              businessCode: 'spcm',
              purchaseTenantId: organizationId,
              currentUser: {
                tenantId: supplierTenantId,
                companyId: supplierCompanyId,
                userId: currentUser.id,
              },
            }}
          />
        ),
      });
    }
  };

  // @overide网易
  renderHeaderButton() {
    const {
      location,
      syncAttachmentLoading,
      submitDeliveryLoading = false,
      fetchLockPrintContractLoading = false,
      remote,
    } = this.props;
    const {
      templateList = [],
      headerInfo = {},
      templateListFlag,
      isPub,
      notPrintAuthority,
      pcKindAttachList,
      backVoidPage, // 有值的时候只展示附件、电子签章附件、打印、操作记录
    } = this.state;
    const {
      attachmentUuid,
      supplierAttachmentUuid,
      editStep,
      electricSignFlag,
      contractFileUrl,
      pcStatusCode,
      signatureType,
      authType,
      electronicSignatureAttachmentDisplayFlag,
      msgNum,
      supplierCompanyId,
    } = headerInfo;
    const { search = {} } = location;
    const { pcHeaderId = headerInfo.pcHeaderId } = querystring.parse(search.substr(1));
    const attachmentProps = {
      remote,
      accept: '.docx',
      fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      supplierFilePreview: true,
      supplierViewOnly: true,
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
      btnProps: {
        permissionList: [
          {
            code: 'srm.pc-admin.pc-supplier.view.ps.upload.attachment',
            type: 'button',
            meaning: '附件',
          },
        ],
      },
    };
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

    const buttons = [
      <Button
        loading={submitDeliveryLoading}
        icon="clock-circle-o"
        type="primary"
        onClick={() => this.handleModalVisible('operationRecordVisible', true, { pcHeaderId: 1 })}
      >
        {intl.get(`hzero.common.button.operating`).d('操作记录')}
      </Button>,
      !isEmpty(headerInfo) && templateListFlag && (
        <Attachment key="attachment" {...attachmentProps} />
      ),
      headerInfo && (isAttachmentSignUpload || isAttachmentSignAndText) && (
        <Button>
          <ComUpload viewOnly {...electricSignAttachmentProps} />
        </Button>
      ),
      pcHeaderId &&
        editStep === 1 &&
        !pcKindAttachList.includes(headerInfo.pcKindCode) &&
        !isAttachmentSignUpload && (
          <PrintButton pcHeaderId={pcHeaderId} disabled={notPrintAuthority} />
        ),
      !isEmpty(headerInfo) &&
        !isAttachmentSignUpload &&
        !backVoidPage &&
        !pcKindAttachList.includes(headerInfo.pcKindCode) && (
          <PermissionButton
            permissionList={[
              {
                code: 'srm.pc-admin.pc-supplier.view.ps.text.comparison',
                type: 'button',
                meaning: '文本对比',
              },
            ]}
            onClick={this.handleControlComparison}
          >
            {intl.get('spcm.common.view.title.textComparison').d('文本对比')}
          </PermissionButton>
        ),
      !backVoidPage && (
        <PermissionButton
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
        </PermissionButton>
      ),
      (electricSignFlag &&
        !backVoidPage &&
        contractFileUrl &&
        signatureType !== 'ANNEX_SIGNATURE' && ['EFFECTED', 'ARCHIVE', 'ARCHIVE_TO_APPROVAL'] && (
          <Button icon="download" onClick={this.downloadSignContract}>
            {intl.get(`spcm.common.button.downloadSignContract`).d('下载签章合同')}
          </Button>
        )) ||
        null,
      pcStatusCode === 'EFFECTED' && !backVoidPage && (
        <PermissionButton
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
      supplierCompanyId && (
        <DotButton
          permissionList={[
            {
              code: 'srm.pc-admin.pc-supplier.view.button.online.communication',
              type: 'button',
              meaning: '在线沟通',
            },
          ]}
          name="chatRoom"
          icon="headset"
          type="c7n-pro"
          wait={500}
          notificationDot={msgNum > 0}
          style={{ paddingRight: '1em' }}
          onClick={this.handleChatRoom}
        >
          {intl.get(`spcm.common.view.button.chatRoom`).d('在线沟通')}
        </DotButton>
      ),
    ].filter(Boolean);

    const buttonList = remote
      ? remote.process('SPCM_SUP_CONTRACT_VIEW_DETAIL_PROCESS_HEADER_BUTTONS', buttons, {
          current: this,
        })
      : buttons;

    return (
      <Header
        title={intl.get(`${viewMessagePrompt}.supplierContractView`).d('我收到的协议')}
        backPath={this.handleBackParentPath()}
      >
        {buttonList}
      </Header>
    );
  }

  /**
   * 协议文本编辑标题埋点二开
   * @returns
   */
  @Bind()
  renderEditorOnlineTitle() {
    const { remote } = this.props;
    const titleElement = (
      <h3>{intl.get(`${commonViewPrompt}.title.contractOnlineEdit`).d('采购协议文本编辑')}</h3>
    );
    if (remote) {
      return remote.render('SPCM_SUP_CONTRACT_VIEW_DETAIL_ONLINEEDIT_TITLE', titleElement, {
        current: this,
      });
    }
    return titleElement;
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
      remote,
      supplierContractView,
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
      getHocInstance,
    } = this.props;
    const {
      operationRecordVisible,
      pcSubjectDataSource = [],
      pcSubjectPagination = {},
      pcSubjectSelectedRows = [],
      partnerDataSource = [],
      partnerPagination = {},
      pcStageDataSource = [],
      pcStagePagination = {},
      partnerSelectedRows = [],
      headerInfo = {},
      termPagination = {},
      termDataSource = [],
      termSelectedRows = [],
      activeKey,
      pcRebateDataSource = [],
      pcRebatePagination = {},
      textComparisonVisible,
      pcKindAttachList,
      unitCodeList,
      customFileFlag = 0,
      enableEditShare,
      onlyEditReplaceWildcardBefore,
      enableSmartContract,
      enableOnlineAttachmentContract,
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
      showAttachmentFlag,
    } = headerInfo;
    const { search = {} } = location;
    const { detailEnumMap } = supplierContractView;
    const {
      prSourcePlatform = headerInfo.prSourcePlatform,
      pcHeaderId = headerInfo.pcHeaderId,
    } = querystring.parse(search.substr(1));
    const editable = false;

    const isAttachmentSignUpload =
      signatureType === 'ANNEX_SIGNATURE' &&
      electricSignFlag === 1 &&
      allSignList.includes(authType); // 是否附件签章

    // 智能附件合同
    const smartFileContractFlag =
      (enableSmartContract || enableOnlineAttachmentContract) &&
      pcKindAttachList.includes(headerInfo.pcKindCode) &&
      Number(showAttachmentFlag) !== 1;

    let configFlagObj = {
      businessTermsFlag: pcHeaderId && !pcKindAttachList.includes(headerInfo.pcKindCode),
      editorOnlineFlag:
        pcHeaderId &&
        editStep === 1 &&
        (!pcKindAttachList.includes(headerInfo.pcKindCode) || smartFileContractFlag) &&
        !isAttachmentSignUpload,
    };

    configFlagObj = remote
      ? remote.process('SPCM_SUP_CONTRACT_VIEW_DETAIL_CONFIGFLAGOBJ', configFlagObj, {
          current: this,
        })
      : configFlagObj;

    // 归档附件props(仅在我发起的协议添加)
    const purchaseArchiveUploadProps = {
      viewOnly: true,
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: 'purchaser-attachment',
      btnText: intl.get(`spcm.common.attachmentUuid`).d('归档文件'),
      title: intl.get(`spcm.common.attachmentUuid`).d('归档文件'),
      attachmentUUID: headerInfo.archiveAttachmentUuid,
    };

    /**
     * editable 根据头id
     * form 表单
     * dataSource 数据源
     * enumMap 值集
     */
    const headerInfoFormProps = {
      form,
      prSourcePlatform,
      detailEnumMap,
      loadingPaymentCode,
      editable,
      customizeForm,
      dataSource: headerInfo,
      terminateReasonFlag: [
        'TERMINATION_TO_APPROVAL',
        'TERMINATION_CONFIRM',
        'TERMINATION',
      ].includes(headerInfo.pcStatusCode),
      onChangeHeader: this.handleChangeHeader,
      afterOpenUploadModal: this.afterOpenLineUploadModal,
      isShowArchiveUpload: true,
      purchaseArchiveUploadProps,
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
      editable,
      headerInfo,
      customizeTable,
      unitCodeList,
      loading: queryingSubject,
      showOperationLadderQuote: true, // 是否加载阶梯价格弹窗模块
      pagination: pcSubjectPagination,
      dataSource: pcSubjectDataSource,
      onSearch: this.fetchPartner,
      onSelectionChange: this.handleChangeSelection,
      selectedRows: pcSubjectSelectedRows,
      onAdd: () => this.handleAddLines('pcSubject'),
      onDelete: () => this.handleDeleteLines('pcSubject'),
      ref: this.partnerRef,
      onPrePaginationChange: this.fetchSubject,
      onChangeListData: this.handleChangeList,
      handleLadderQuote: this.handleLadderQuote,
      ...(configFlagObj.cuxSubjectListProps || {}),
    };
    // 新增 tab 协议阶段相关数据
    const contractStageListProps = {
      editable,
      customizeTable,
      unitCodeList,
      loading: queryingStage,
      pagination: pcStagePagination,
      dataSource: pcStageDataSource,
      onRef: (node) => {
        this.pcStageRef = node;
      },
      onPrePaginationChange: this.fetchStage,
    };
    const contractRebateProps = {
      editable,
      customizeTable,
      unitCodeList,
      dataSource: pcRebateDataSource,
      pagination: pcRebatePagination,
      onPrePaginationChange: this.fetchContractRebate,
    };
    const partnerListProps = {
      editable,
      customizeTable,
      unitCodeList,
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
      role: 'supplier',
      onHandleCancel: () => this.handleModalVisible('operationRecordVisible', false),
    };

    const textComparisonProps = {
      pcHeaderId,
      visible: textComparisonVisible,
      onCancel: this.handleControlComparison,
      isSupplier: true,
    };

    const contractReplenishProps = {
      remote,
      pcHeaderId,
      redirectDetail: this.redirectDetail,
      customizeTable,
      // 我收到的协议和协议签署不允许自由选择对比字段
      versionFlag: false,
      custLoading,
      headerInfo,
    };

    const contractTableExtendProps = {
      pcHeaderId,
      customizeTable,
      custLoading,
    };

    return (
      <Fragment>
        {this.renderHeaderButton()}

        <Content>
          <div id="spcm-contract-supplier-detail-content-inner-wrapper">
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
                          .get(`${commonViewPrompt}.title.contractHeaderInformation`)
                          .d('采购协议头信息')}
                      </h3>
                    }
                  >
                    <ContractHeader {...headerInfoFormProps} />
                  </Card>
                  {pcHeaderId && (
                    <div key="subjectInformation" id="spcm-maintain-detail-contract-subject">
                      <Tabs activeKey={activeKey} animated={false} onChange={this.handleSaveKey}>
                        <TabPane
                          tab={intl.get(`${commonViewPrompt}.title.contractSubject`).d('协议标的')}
                          key="contractSubjectInfo"
                        >
                          <ContractSubject {...contractSubjectListProps} />
                        </TabPane>
                        <TabPane
                          tab={intl.get(`${commonViewPrompt}.title.contractStage`).d('协议阶段')}
                          key="contractStage"
                        >
                          <ContractStage {...contractStageListProps} />
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
                  <TopSection
                    code="SPCM.CONTRACT.SIGN.CARD.READONLY"
                    getHocInstance={getHocInstance}
                  >
                    {remote?.render('SPCM_SUP_CONTRACT_VIEW_DETAIL_EXTRA_DOM', null, {
                      styles,
                      current: this,
                    })}
                    <SecondSection code="contractPartnerInformation">
                      {pcHeaderId && (
                        <Card
                          key="contractPartnerInformation"
                          id="spcm-maintain-detail-contract-partner"
                          bordered={false}
                          className={DETAIL_CARD_CLASSNAME}
                          title={
                            <h3>
                              {intl
                                .get(`${commonViewPrompt}.title.contractPartnerInformation`)
                                .d('采购协议伙伴信息')}
                            </h3>
                          }
                        >
                          <ContractPartner {...partnerListProps} />
                        </Card>
                      )}
                    </SecondSection>
                    <SecondSection code="contractBusinessTermsInformation">
                      {configFlagObj?.businessTermsFlag && (
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
                    </SecondSection>
                    <SecondSection code="discountRule">
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
                    </SecondSection>
                    <SecondSection code="rebateRule">
                      {pcHeaderId && !!enableRule && (
                        <Card
                          key="rebateRule"
                          id="spcm-contract-maintain-detail-rebate-rule"
                          bordered={false}
                          className={DETAIL_CARD_CLASSNAME}
                          title={
                            <h3>
                              {intl
                                .get('spcm.common.view.message.title.rebateRule')
                                .d('优惠规则-返利')}
                            </h3>
                          }
                        >
                          {this.renderRebateRule(rebateRuleProps)}
                        </Card>
                      )}
                    </SecondSection>
                    <SecondSection code="contractReplenishList">
                      {this.renderContractReplenish(contractReplenishProps)}
                    </SecondSection>
                    <SecondSection code="contractTableExtend">
                      {pcHeaderId && (
                        <Card
                          key="contractTableExtend"
                          id="spcm-contract-approval-detail-contract-tableExtend"
                          bordered={false}
                          className={DETAIL_CARD_CLASSNAME}
                          title={
                            <h3>
                              {intl
                                .get(`spcm.common.view.message.title.customRowTable`)
                                .d('自定义行表')}
                            </h3>
                          }
                        >
                          {this.renderContractTableExtend(contractTableExtendProps)}
                        </Card>
                      )}
                    </SecondSection>
                  </TopSection>
                  {configFlagObj?.editorOnlineFlag && (
                    <Card
                      key="contractOnlineEdit"
                      id="spcm-contract-approval-detail-contract-online-edit"
                      bordered={false}
                      className={DETAIL_CARD_CLASSNAME}
                      title={this.renderEditorOnlineTitle()}
                    >
                      <EditorOnline
                        key={customFileFlag}
                        menuCode={CONTRACT_SUPPLIER_VIEW}
                        customFileFlag={customFileFlag}
                        iframeStyle={{
                          width: '100%',
                          height: `${(document?.body?.clientHeight - 96) * 0.9}px`,
                        }}
                        // 协议确认审批时，开启在线编辑协同，开启是否仅编辑通配符替换前的文件，使用新的获取url的接口
                        isNewAPIUrlFlag={
                          onlyEditReplaceWildcardBefore === '1' && enableEditShare === '1'
                        }
                        pcHeaderId={pcHeaderId}
                        headerInfo={headerInfo}
                        permissionCode="VIEW"
                        supplierFlag={1}
                        isOtherPageEdit={smartFileContractFlag}
                      />
                    </Card>
                  )}
                </Col>
                <Col span={3}>
                  <Affix
                    style={{ top: '200px', width: 'calc( 100% - 11px )', position: 'absolute' }}
                    offsetTop={224}
                    ref={(node) => {
                      this.positionAnchorRef = node;
                    }}
                    target={this.getAffixContainer}
                  >
                    <Anchor getContainer={this.getAffixContainer} offsetTop={24}>
                      <Link
                        href="#spcm-maintain-detail-contract-header-information"
                        title={intl.get(`${commonViewPrompt}.title.basicInformation`).d('基本信息')}
                      />
                      <Link
                        href="#spcm-maintain-detail-contract-subject"
                        title={intl
                          .get(`${commonViewPrompt}.title.subjectInformation`)
                          .d('标的信息')}
                      />
                      <Link
                        href="#spcm-maintain-detail-contract-partner"
                        title={intl
                          .get(`${commonViewPrompt}.title.partnerInformation`)
                          .d('伙伴信息')}
                      />{' '}
                      {configFlagObj?.businessTermsFlag && (
                        <Link
                          href="#spcm-maintain-detail-contract-business-terms"
                          title={intl
                            .get(`${commonViewPrompt}.title.businessTermsInformation`)
                            .d('业务条款')}
                        />
                      )}{' '}
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
                      {pcHeaderId && !supplementFlag && (
                        <Link
                          href="#spcm-contract-approval-detail-contract-replenish"
                          title={intl.get(`spcm.common.title.contractReplenish`).d('补充协议')}
                        />
                      )}
                      {pcHeaderId && (
                        <Link
                          href="#spcm-contract-approval-detail-contract-tableExtend"
                          title={intl
                            .get(`spcm.common.view.message.title.customRowTable`)
                            .d('自定义行表')}
                        />
                      )}
                      {configFlagObj?.editorOnlineFlag && (
                        <Link
                          href="#spcm-contract-approval-detail-contract-online-edit"
                          title={intl.get(`spcm.common.title.onlineEdit`).d('文本编辑')}
                        />
                      )}
                      {remote?.render('SPCM_SUP_CONTRACT_VIEW_DETAIL_EXTRA_LINK', null, {
                        styles,
                        current: this,
                      })}
                    </Anchor>
                  </Affix>
                </Col>
              </Row>
            </Spin>
          </div>
        </Content>
        <OperationRecordDrawer {...operationRecordProps} />
        {textComparisonVisible && <TextComparisonModal {...textComparisonProps} />}
      </Fragment>
    );
  }
}

const hocFunc = (com) =>
  compose(
    Form.create({ fieldNameProp: null }),
    connect(({ loading, supplierContractView }) => ({
      queryingHeader: loading.effects['contractCommon/fetchHeader'],
      queryingPartner: loading.effects['contractCommon/fetchPartner'],
      queryingSubject: loading.effects['contractCommon/fetchSubject'],
      queryingStage: loading.effects['contractCommon/fetchStage'],
      queryingTerm: loading.effects['contractCommon/fetchTermPage'],
      fetchLockPrintContractLoading: loading.effects['cuxContractCommon/fetchLockPrintContract'],
      confirmLoading: loading.effects['supplierContractView/confirmContract'],
      syncAttachmentLoading: loading.effects['purchaseContractView/syncAttachment'],
      supplierContractView,
    })),
    formatterCollections({
      code: [
        'spcm.supplierContractView',
        'spcm.common',
        'entity.roles',
        'entity.company',
        'entity.business',
        'entity.item',
        'component.docFlow',
        'spfp.ruleMaintenance',
        'spfp.common',
      ],
    }),
    withCustomize({
      unitCode: [
        'SPCM.CONTRACT.SIGN.DETAIL',
        'SPCM.PURCHASE_CONTRACT_MAINTAIN.SUBJECT',
        'SPCM.PURCHASE_CONTRACT_MAINTAIN.PARTNER',
        'SPCM.PURCHASE_CONTRACT_MAINTAIN.STAGE',
        'SPCM.PURCHASE_CONTRACT_MAINTAIN.REBATE',
        'SPCM.PURCHASE_CONTRACT_MAINTAIN.CONTRACTREPLENISH',
        'SPCM.CONTRACT.SIGN.TABLEEXTEND.READONLY', // 协议自定义行表信息-只读
        'SPCM.CONTRACT.SIGN.CARD.READONLY', // 协议签署-卡片只读
        ...Object.values(oldUnitCodeList),
        ...Object.values(newUnitCodeList),
      ],
    }),
    hocRemote(
      {
        code: 'SPCM_SUP_CONTRACT_VIEW_DETAIL',
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
