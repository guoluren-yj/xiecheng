/*
 * ContractApprovalDetail - 协议审批详情
 * @date: 2019-05-14
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component, Fragment } from 'react';
import { Button, Spin, Modal, Form, Row, Col, Anchor, Affix, Input, Card, Tabs } from 'hzero-ui';
import { connect } from 'dva';
import { isNumber, isEmpty, omit, compose } from 'lodash';
import classnames from 'classnames';
import { Bind, Debounce } from 'lodash-decorators';
import uuid from 'uuid/v4';
import querystring from 'querystring';
// import withCustomize from 'srm-front-cuz';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import Upload from 'srm-front-boot/lib/components/Upload';

import { routerRedux } from 'dva/router';
import ComUpload from '@/routes/components/ComUpload';
import PreferentialRule from '@/routes/components/PreferentialRule';
import { Header, Content } from 'components/Page';
import { Button as PermissionButton } from 'components/Permission';
import {
  // getCurrentOrganizationId,
  addItemToPagination,
  createPagination,
  delItemToPagination,
} from 'utils/utils';
import intl from 'utils/intl';
import hocRemote from 'utils/remote';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import { DETAIL_DEFAULT_CLASSNAME, DETAIL_CARD_CLASSNAME } from 'utils/constants';
import { PRIVATE_BUCKET } from 'srm-front-boot/lib/utils/config';

import { allSignList } from '@/utils/util';
import ContractHeader from '../../components/ContractHeader';
// eslint-disable-next-line import/no-named-as-default
import ContractSubject from '../../components/ContractSubject';
import ContractStage from '../../components/ContractStage';
import ContractPartner from '../../components/ContractPartner';
import ContractBusinessTerms from '../../components/ContractBusinessTerms';
import ContractRebate from '../../components/ContractRebate';
import OperationRecordDrawer from '../../components/OperationRecordDrawer';
import styles from './index.less';
import Attachment from '../../components/Upload';
import EditorOnline from '../../components/EditorOnline';
import ApproveRecord from '../../components/ApproveRecord';
import TextComparisonModal from '../../components/TextComparisonModal';
import ContractReplenish from '../../components/ContractReplenish';

const { Link } = Anchor;
const { TabPane } = Tabs;
const { TextArea } = Input;
const FormItem = Form.Item;
const viewMessagePrompt = 'spcm.contractApproval.view.message';
const commonPrompt = 'spcm.common.view.message.title';
// const viewTitlePrompt = 'spcm.contractApproval.view.title';

/**
 * ContractApprovalDetail - 协议审批详情
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {!Object} [contractApproval={}] - 数据源
 * @reactProps {boolean} [getHeaderAttachmentUuidLoading=false] - 获取附件uuid处理中
 * @reactProps {boolean} [deleteDetailLinesLoading=false] - 删除明细行处理中
 * @reactProps {boolean} [submitDeliveryLoading=false] - 提交送货单处理中
 * @reactProps {boolean} [deleteDeliveryLoading=false] - 删除送货单处理中
 * @reactProps {boolean} [queryCreateListLoading=false] - 查询可创建行处理中
 * @reactProps {boolean} [queryMaintenanceListLoading=false] - 查询可审批行处理中
 * @reactProps {boolean} [fetchingDetailHeader=false] - 查询明细头处理中
 * @reactProps {boolean} [queryDetailListLoading=false] - 查询明细行处理中
 * @reactProps {Function} [dispatch= e => e] - redux dispatch方法
 * @return React.element
 */
class Detail extends Component {
  constructor(props) {
    super(props);
    const {
      location: { search },
    } = this.props;
    const { pcHeaderId } = querystring.parse(search.substr(1));
    this.state = {
      pcHeaderId,
      headerInfo: {}, // 头form数据源
      listDataSource: [], // 表格数据源
      isClearListCacheDataSource: true, // 是否清除表格缓存数据源
      operationRecordVisible: false,
      requireApprovedRemark: false,
      // tenantId: getCurrentOrganizationId(),
      partnerDataSource: [], // 合作伙伴数据
      partnerPagination: {}, // 合作伙伴分页
      pcStagePagination: {}, // 标的阶段分页
      partnerSelectedRows: [],
      pcSubjectDataSource: [],
      pcStageDataSource: [],
      pcSubjectPagination: {},
      pcSubjectSelectedRows: [],
      termDataSource: [],
      termPagination: {},
      termSelectedRows: [],
      templateList: [],
      templateListFlag: false,
      activeKey: 'contractSubjectInfo', // tab切换
    };
    this.maintainContentRef = React.createRef();
    this.pcStageRef = React.createRef();
  }

  componentDidMount() {
    const { pcHeaderId } = this.state;
    if (isNumber(+pcHeaderId)) {
      this.fetchEnum();
      this.fetchHeader();
      this.fetchList();
    }
    this.fetchConfigSetting();
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
      type: 'contractApproval/fetchDetailEnum',
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
        this.setState({ headerInfo: res });
        this.handleFetchConfigAttachment();
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
   */
  @Bind()
  fetchSubject(page = {}) {
    const { dispatch } = this.props;
    const { pcHeaderId } = this.state;
    if (pcHeaderId) {
      dispatch({
        type: 'contractCommon/fetchSubject',
        payload: {
          page,
          pcHeaderId,
          customizeUnitCode: 'SPCM.PURCHASE_CONTRACT_MAINTAIN.SUBJECT.READONLY',
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
   * preReject - 协议拒绝前置modal弹窗
   */
  @Bind()
  preReject() {
    const {
      form: { validateFieldsAndScroll },
    } = this.props;
    Modal.confirm({
      title: intl.get(`${viewMessagePrompt}.preReject`).d(`确定审批拒绝吗？`),
      onOk: () => {
        this.setState(
          {
            requireApprovedRemark: true,
          },
          () => this.reject()
        );
      },
      onCancel: () =>
        this.setState({ requireApprovedRemark: false }, () =>
          validateFieldsAndScroll({ force: true })
        ),
    });
  }

  /**
   * reject - 采购申请拒绝
   */
  @Bind()
  @Debounce(200)
  reject() {
    const {
      dispatch,
      form: { validateFieldsAndScroll },
    } = this.props;
    const { headerInfo = {} } = this.state;
    const { pcHeaderIdSet, ...otherHeaderInfo } = headerInfo;
    validateFieldsAndScroll({ force: true }, (errs, values) => {
      if (!errs) {
        dispatch({
          type: 'contractApproval/rejectApprovalList',
          payload: {
            pcHeaderList: [otherHeaderInfo],
            approvedRemark: values.approvedRemark,
          },
        }).then((res) => {
          if (res) {
            notification.success();
            this.props.history.push('/spcm/contract-approval/list');
          } else {
            this.fetchHeader();
            this.fetchList();
          }
        });
      }
    });
  }

  /**
   * 审批通过协议
   */
  @Bind()
  approve() {
    const {
      dispatch,
      form: { getFieldValue, validateFieldsAndScroll },
    } = this.props;
    const { headerInfo = {} } = this.state;
    const approvedRemark = getFieldValue('approvedRemark');
    this.setState({ requireApprovedRemark: false }, () => validateFieldsAndScroll({ force: true }));
    const { pcHeaderIdSet, ...otherHeaderInfo } = headerInfo;
    dispatch({
      type: 'contractApproval/approveList',
      payload: {
        pcHeaderList: [otherHeaderInfo],
        approvedRemark,
      },
    }).then((res) => {
      if (res) {
        notification.success();
        this.props.history.push('/spcm/contract-approval/list');
      } else {
        this.fetchHeader();
        this.fetchList();
      }
    });
  }

  /**
   * handleAddLines - 新增行
   * @param {String} key - 新增对应的行数据
   */
  @Bind()
  handleAddLines(key) {
    const sourceField = `${key}DataSource`;
    const paginationField = `${key}Pagination`;
    const rowKey = `${key}Id`;
    const { [sourceField]: dataSource = [], [paginationField]: pagination = {} } = this.state;
    const newItem = { _status: 'create', [rowKey]: uuid() };
    const params = {
      [sourceField]: [newItem, ...dataSource],
      [paginationField]: addItemToPagination(dataSource.length + 1, pagination),
    };
    this.setState({ ...params });
  }

  /**
   * handleDeleteLines - 删除采购申请行
   */
  @Bind()
  handleDeleteLines(key) {
    const sourceField = `${key}DataSource`;
    const paginationField = `${key}Pagination`;
    const selectedField = `${key}SelectedRows`;
    const actionField = `${key}LinesDelete`;
    const rowKey = `${key}Id`;
    const { dispatch } = this.props;
    const {
      [sourceField]: dataSource = [],
      [paginationField]: pagination = {},
      [selectedField]: selectedRows = [],
    } = this.state;
    const newDataSource = [];
    const deleteList = [];
    Modal.confirm({
      title: intl.get(`${viewMessagePrompt}.deletePurchaseLines`).d('是否删除'),
      onOk: () => {
        const selectedRowKeys = selectedRows.map((n) => n[rowKey]);
        dataSource.forEach((item) => {
          if (!selectedRowKeys.includes(item[rowKey])) {
            newDataSource.push(item);
          } else if (item._status !== 'create') {
            deleteList.push(omit(item, ['$form']));
          }
        });
        if (!isEmpty(deleteList)) {
          dispatch({
            type: `contractApproval/${actionField}`,
            payload: deleteList,
          }).then((res) => {
            if (res) {
              if (res) {
                this.setState({ [selectedField]: [] });
                notification.success();
                this.fetchHeader();
                this.fetchList();
              }
            }
          });
        } else {
          this.setState({
            [sourceField]: newDataSource,
            [paginationField]: delItemToPagination(newDataSource.length, pagination),
          });
          this.setState({ [selectedField]: [] });
        }
      },
    });
  }

  /**
   * 修改头数据
   * @param {*} headerInfo
   */
  @Bind()
  handleChangeHeader(headerInfo) {
    this.setState({ headerInfo });
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
      type: 'contractApproval/bindHeaderAttachmentUuid',
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
      type: 'contractApproval/bindLineAttachmentUuid',
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
      type: 'contractApproval/fetchOperationRecordList',
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
      document.getElementById('spcm-contract-approval-detail-content-inner-wrapper')
    );
    return parent || document.body;
  }

  /**
   * 选中行回调
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
   * fetchStage - 查询标的协议阶段
   * @param {object} page - 协议阶段分页条件
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
   * 跳转到明细页
   * @param {String} pcHeaderId
   */
  @Bind()
  redirectDetail(pcHeaderId) {
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `/spcm/contract-approval/detail`,
        search: pcHeaderId
          ? querystring.stringify({ pcHeaderId })
          : querystring.stringify({ prSourcePlatform: 'SRM' }),
      })
    );
    const headerNode = document.querySelector(
      '#spcm-contract-approval-detail-contract-header-information'
    );
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

  @Bind()
  handleControlComparison() {
    const { textComparisonVisible } = this.state;
    this.setState({ textComparisonVisible: !textComparisonVisible });
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

  // @overide网易
  renderHeaderButton() {
    const {
      location,
      queryingHeader = false,
      approving = false,
      rejecting = false,
      queryingPcAttachmentList = false,
      queryDetailListLoading = false,
      submitDeliveryLoading = false,
      fetchingDetailHeader = false,
      remote,
    } = this.props;
    const { headerInfo = {}, templateList = [], templateListFlag } = this.state;
    const {
      attachmentUuid,
      supplierAttachmentUuid,
      signatureType,
      electricSignFlag,
      authType,
      electronicSignatureAttachmentDisplayFlag,
    } = headerInfo;
    const { search = {} } = location;
    const { pcHeaderId = headerInfo.pcHeaderId } = querystring.parse(search.substr(1));
    const attachmentProps = {
      remote,
      accept: '.docx',
      fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      headerInfo,
      templateList,
      onChangeState: (state) => {
        this.setState(state);
      },
      supplierAttachmentUuid,
      supplierParams: { supplierViewFlag: true },
      attachmentUUID: attachmentUuid,
      onUpdateHeader: this.save,
      onFetchHeader: this.fetchHeader,
      onRefresh: this.handleFetchConfigAttachment,
      // purchaserParams: { purchaserUploadFlag: true },
      btnProps: {
        disabled: !pcHeaderId || queryingPcAttachmentList || queryingHeader,
        btnText: intl.get(`entity.attachment.tag.spcm`).d('附件'),
      },
      showRemoveIcon: false,
    };
    const uploadProps = {
      viewOnly: true,
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: 'purchaser-attachment',
      btnText: intl.get('spcm.common.view.spcm.btn.purchaserAttachment').d('采购方附件'),
      title: intl.get('spcm.common.view.spcm.btn.purchaserAttachment').d('采购方附件'),
      attachmentUUID: headerInfo.purchaserAttachmentUuid,
    };
    const arr = [
      'approvalMethod',
      'confirmApproveMethod',
      'changeApproveMethod',
      'archiveApproveMethod',
      'invalidApproveMethod',
      'terminationApproveMethod',
    ];
    // 针对于工作流审批和功能审批（协议审批）
    const isAttachmentSignUpload =
      arr.some((item) => {
        return headerInfo[item] === 'WORKFLOW' || headerInfo[item] === 'FUNCTIONAL';
      }) &&
      signatureType === 'ANNEX_SIGNATURE' &&
      electricSignFlag === 1 &&
      allSignList.includes(authType); // 是否附件签章
    // 针对于工作流审批和功能审批（协议审批）
    const isAttachmentSignAndText =
      (arr.some((item) => {
        return headerInfo[item] === 'WORKFLOW' || headerInfo[item] === 'FUNCTIONAL';
      }) &&
        signatureType === 'TEXT_AND_ANNEX_SIGNATURE' &&
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
      afterOpenUploadModal: (electricSignUuid) => this.handleSaveElectricSignUuid(electricSignUuid),
      fileSize: 25 * 1024 * 1024,
    };
    return (
      <Header
        title={intl.get(`${viewMessagePrompt}.title.purchaseMaintain`).d('协议审批')}
        backPath="/spcm/contract-approval/list"
      >
        <Button
          loading={approving || rejecting || queryingHeader}
          onClick={this.approve}
          icon="check"
          type="primary"
          disabled={fetchingDetailHeader || queryDetailListLoading || submitDeliveryLoading}
        >
          {intl.get('spcm.common.button.approval').d('审批通过')}
        </Button>
        <Button
          loading={rejecting || approving || queryingHeader}
          onClick={this.preReject}
          icon="close"
          disabled={fetchingDetailHeader || queryDetailListLoading || submitDeliveryLoading}
        >
          {intl.get(`spcm.common.button.reject`).d('审批拒绝')}
        </Button>
        <Button
          loading={submitDeliveryLoading}
          icon="clock-circle-o"
          // disabled={
          //   saveDetailLoading || fetchingDetailHeader || queryDetailListLoading || !pcHeaderId
          // }
          onClick={() => this.handleModalVisible('operationRecordVisible', true, { pcHeaderId: 1 })}
        >
          {intl.get(`hzero.common.button.operating`).d('操作记录')}
        </Button>
        {!isEmpty(headerInfo) && (isAttachmentSignUpload || isAttachmentSignAndText) && (
          <Button>
            <ComUpload viewOnly {...electricSignAttachmentProps} />
          </Button>
        )}
        {!isEmpty(headerInfo) && templateListFlag && (
          <PermissionButton
            permissionList={[
              {
                code: 'srm.pc-admin.pc-purchaser.approval.ps.attachment.upload',
                type: 'button',
                meaning: '附件',
              },
            ]}
            className={styles['contract-approval-upload-files']}
          >
            <Attachment {...attachmentProps} />
          </PermissionButton>
        )}
        {pcHeaderId && (
          <PermissionButton
            permissionList={[
              {
                code: 'srm.pc-admin.pc-purchaser.approval.ps.attachment',
                type: 'button',
                meaning: '采购方附件',
              },
            ]}
            className={styles.purchaseHeaderNumber}
          >
            <Upload {...uploadProps} />
          </PermissionButton>
        )}
        {!isEmpty(headerInfo) &&
          !isAttachmentSignUpload &&
          !['ATTACHMENT_FRAMEWORK', 'ATTACHMENT'].includes(headerInfo.pcKindCode) && (
            <PermissionButton
              permissionList={[
                {
                  code: 'srm.pc-admin.pc-purchaser.approval.ps.text.comparison',
                  type: 'button',
                  meaning: '文本对比',
                },
              ]}
              onClick={this.handleControlComparison}
            >
              {intl.get('spcm.common.view.title.textComparison').d('文本对比')}
            </PermissionButton>
          )}
      </Header>
    );
  }

  render() {
    const {
      form,
      location,
      dispatch,
      deletingLines,
      contractApproval,
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
      contractCommon: { configSetting = {} },
      remote,
    } = this.props;
    const {
      isClearListCacheDataSource,
      operationRecordVisible,
      requireApprovedRemark = false,
      pcSubjectDataSource = [],
      pcStageDataSource = [],
      pcStagePagination = {},
      pcSubjectPagination = {},
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
    } = this.state;
    const { getFieldDecorator } = form;
    const {
      prStatusCode,
      editStep,
      rebateFlag,
      supplementFlag,
      signatureType,
      electricSignFlag,
      authType,
      enableRule,
      pcNum,
      version,
    } = headerInfo;
    const { search = {} } = location;
    const { detailEnumMap } = contractApproval;
    const {
      prSourcePlatform = headerInfo.prSourcePlatform,
      pcHeaderId = headerInfo.pcHeaderId,
    } = querystring.parse(search.substr(1));
    const editable = false;
    const check = false;

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
     * form 表单 // 父组件的form不穿下去，个性化显示会有问题(未找到原因)
     * dataSource 数据源
     * enumMap 值集
     */
    const headerInfoFormProps = {
      remote,
      form,
      detailEnumMap,
      loadingPaymentCode,
      editable,
      customizeForm,
      purchaseFlag: true, // 是否来自采购方
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
      remote,
      editable,
      check,
      headerInfo,
      customizeTable,
      loading: queryingSubject,
      showOperationLadderQuote: true, // 是否加载阶梯价格弹窗模块
      pagination: pcSubjectPagination,
      dataSource: pcSubjectDataSource,
      onSearch: this.fetchSubject,
      onSelectionChange: this.handleChangeSelection,
      selectedRows: pcSubjectSelectedRows,
      onAdd: () => this.handleAddLines('pcSubject'),
      onDelete: () => this.handleDeleteLines('pcSubject'),
      onPrePaginationChange: this.fetchSubject,
      handleLadderQuote: this.handleLadderQuote,
      dispatch,
      prStatusCode,
      prSourcePlatform,
      deletingLines,
      onChangeListData: this.handleChangeList,
      onChangeHeader: this.handleChangeHeader,
      wrappedComponentRef: (node) => {
        this.list = node;
      },
      isClearListCacheDataSource,
      fetchList: this.fetchPartner,
      deleteLines: this.deleteDetailLines,
      setDataSource: this.setItemInfoListDataSource,
      afterOpenUploadModal: this.afterOpenLineUploadModal,
    };
    // 新增 tab 协议阶段相关数据
    const contractStageListProps = {
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
      editable,
      customizeTable,
      dataSource: pcRebateDataSource,
      pagination: pcRebatePagination,
      onPrePaginationChange: this.fetchContractRebate,
    };
    const partnerListProps = {
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

      dispatch,
      headerInfo,
      prStatusCode,
      prSourcePlatform,
      deletingLines,

      onChangeListData: this.handleChangeList,
      onChangeHeader: this.handleChangeHeader,
      wrappedComponentRef: (node) => {
        this.list = node;
      },
      isClearListCacheDataSource,
      fetchList: this.fetchPartner,
      deleteLines: this.deleteDetailLines,
      setDataSource: this.setItemInfoListDataSource,
      afterOpenUploadModal: this.afterOpenLineUploadModal,
    };
    const contractBusinessTermsListProps = {
      editable,
      check,
      loading: queryingTerm,
      pagination: termPagination,
      dataSource: termDataSource,
      onSearch: this.fetchTerm,
      onSelectionChange: this.handleChangeSelection,
      selectedRows: termSelectedRows,

      dispatch,
      headerInfo,
      prStatusCode,
      prSourcePlatform,
      deletingLines,
      onAdd: () => this.handleAddLines('term'),
      onDelete: () => this.handleDeleteLines('term'),
      onChangeListData: this.handleChangeList,
      onChangeHeader: this.handleChangeHeader,
      wrappedComponentRef: (node) => {
        this.list = node;
      },
      isClearListCacheDataSource,
      fetchList: this.fetchPartner,
      deleteLines: this.deleteDetailLines,
      setDataSource: this.setItemInfoListDataSource,
      afterOpenUploadModal: this.afterOpenLineUploadModal,
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
    };

    const textComparisonProps = {
      pcHeaderId,
      visible: textComparisonVisible,
      onCancel: this.handleControlComparison,
    };

    const contractReplenishProps = {
      pcHeaderId,
      redirectDetail: this.redirectDetail,
      customizeTable,
      custLoading,
    };
    // approvalMethod
    // archiveApproveMethod
    // changeApproveMethod
    // confirmApproveMethod
    // invalidApproveMethod
    // paperDeliveryMethod
    // paperDeliveryMethodMeaning
    // terminationApproveMethod
    const arr = [
      'approvalMethod',
      'confirmApproveMethod',
      'changeApproveMethod',
      'archiveApproveMethod',
      'invalidApproveMethod',
      'terminationApproveMethod',
    ];
    // 针对于工作流审批和功能审批（协议审批）
    const isAttachmentSignUpload =
      arr.some((item) => {
        return headerInfo[item] === 'WORKFLOW' || headerInfo[item] === 'FUNCTIONAL';
      }) &&
      signatureType === 'ANNEX_SIGNATURE' &&
      electricSignFlag === 1 &&
      allSignList.includes(authType); // 是否附件签章

    return (
      <Fragment>
        {this.renderHeaderButton()}

        <Content>
          <div id="spcm-contract-approval-detail-content-inner-wrapper">
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
              <Row className="approve-header" gutter={48}>
                <Col>{intl.get(`${viewMessagePrompt}.approvalOpinion`).d('审批意见')}</Col>
              </Row>
              <Row className="approve-option">
                <Col span={12}>
                  <FormItem className={styles['approval-remark-form-item']}>
                    {getFieldDecorator('approvedRemark', {
                      rules: [
                        {
                          max: 160,
                          message: intl
                            .get(`hzero.common.validation.max`, {
                              max: 160,
                            })
                            .d(`长度不能超过${160}个字符`),
                        },
                        {
                          required: requireApprovedRemark,
                          message: intl.get('hzero.common.validation.notNull', {
                            name: intl.get(`${viewMessagePrompt}.approvalOpinion`).d('审批意见'),
                          }),
                        },
                      ],
                    })(<TextArea rows={2} />)}
                  </FormItem>
                </Col>
              </Row>
              <Row gutter={24}>
                <Col span={21}>
                  <Card
                    key="contractHeaderInformation"
                    id="spcm-contract-approval-detail-contract-header-information"
                    bordered={false}
                    className={DETAIL_CARD_CLASSNAME}
                    title={
                      <h3>
                        {intl.get(`${commonPrompt}.contractHeaderInformation`).d('采购协议头信息')}
                      </h3>
                    }
                  >
                    <ContractHeader {...headerInfoFormProps} />
                  </Card>
                  {pcHeaderId && (
                    <div
                      key="subjectInformation"
                      id="spcm-contract-approval-detail-contract-subject"
                    >
                      <Tabs activeKey={activeKey} animated={false} onChange={this.handleSaveKey}>
                        <TabPane
                          tab={intl.get(`${commonPrompt}.title.contractSubject`).d('协议标的')}
                          key="contractSubjectInfo"
                        >
                          <ContractSubject {...contractSubjectListProps} />
                        </TabPane>
                        <TabPane
                          tab={intl.get(`${commonPrompt}.title.contractStage`).d('协议阶段')}
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

                  {pcHeaderId && (
                    <Card
                      key="contractPartner"
                      id="spcm-contract-approval-detail-contract-partner"
                      bordered={false}
                      className={DETAIL_CARD_CLASSNAME}
                      title={
                        <h3>
                          {intl
                            .get(`${commonPrompt}.contractPartnerInformation`)
                            .d('采购协议伙伴信息')}
                        </h3>
                      }
                    >
                      <ContractPartner {...partnerListProps} />
                    </Card>
                  )}
                  {pcHeaderId &&
                    !['ATTACHMENT_FRAMEWORK', 'ATTACHMENT'].includes(headerInfo.pcKindCode) && (
                      <Card
                        key="contractBusinessTerms"
                        id="spcm-contract-approval-detail-contract-business-terms"
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
                      id="spcm-contract-approval-detail-approve-record"
                      bordered={false}
                      className={DETAIL_CARD_CLASSNAME}
                      title={
                        <h3>
                          {intl.get(`${commonPrompt}.approveRecordInformation`).d('审批记录')}
                        </h3>
                      }
                    >
                      <ApproveRecord pcHeaderId={pcHeaderId} />
                    </Card>
                  )}
                  {pcHeaderId && !supplementFlag && (
                    <Card
                      key="contractReplenishList"
                      id="spcm-contract-approval-detail-contract-replenish"
                      bordered={false}
                      className={DETAIL_CARD_CLASSNAME}
                      title={
                        <h3>
                          {intl
                            .get(`spcm.common.view.message.title.contractReplenishList`)
                            .d('补充协议列表')}
                        </h3>
                      }
                    >
                      {this.renderContractReplenish(contractReplenishProps)}
                    </Card>
                  )}
                  {pcHeaderId &&
                    editStep === 1 &&
                    !['ATTACHMENT_FRAMEWORK', 'ATTACHMENT'].includes(headerInfo.pcKindCode) &&
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
                        <EditorOnline
                          iframeStyle={{
                            width: '100%',
                            height: `${(document?.body?.clientHeight - 96) * 0.9}px`,
                          }}
                          pcHeaderId={pcHeaderId}
                          headerInfo={headerInfo}
                        />
                      </Card>
                    )}
                </Col>
                <Col span={3}>
                  <Affix
                    style={{ top: '200px', width: 'calc( 100% - 11px )', position: 'absolute' }}
                    offsetTop={224}
                    target={this.getAffixContainer}
                  >
                    <Anchor
                      className={styles['anchor-wrapper']}
                      getContainer={this.getAffixContainer}
                      offsetTop={138}
                    >
                      <Link
                        href="#spcm-contract-approval-detail-contract-header-information"
                        title={intl.get(`${commonPrompt}.basicInformation`).d('基本信息')}
                      />
                      <Link
                        href="#spcm-contract-approval-detail-contract-subject"
                        title={intl.get(`${commonPrompt}.subjectInformation`).d('标的信息')}
                      />
                      <Link
                        href="#spcm-contract-approval-detail-contract-partner"
                        title={intl.get(`${commonPrompt}.partnerInformation`).d('伙伴信息')}
                      />
                      {pcHeaderId &&
                        !['ATTACHMENT_FRAMEWORK', 'ATTACHMENT'].includes(headerInfo.pcKindCode) && (
                          <Link
                            href="#spcm-contract-approval-detail-contract-business-terms"
                            title={intl
                              .get(`${commonPrompt}.businessTermsInformation`)
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
                          href="#spcm-contract-approval-detail-approve-record"
                          title={intl.get(`${commonPrompt}.approveRecordInformation`).d('审批记录')}
                        />
                      )}
                      {pcHeaderId && !supplementFlag && (
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
        <OperationRecordDrawer {...operationRecordProps} />
        {textComparisonVisible && <TextComparisonModal {...textComparisonProps} />}
      </Fragment>
    );
  }
}

const hocFunc = (com) =>
  compose(
    Form.create({ fieldNameProp: null }),
    connect(({ loading, contractApproval, contractCommon }) => ({
      queryingHeader: loading.effects['contractCommon/fetchHeader'],
      queryingPartner: loading.effects['contractCommon/fetchPartner'],
      queryingSubject: loading.effects['contractCommon/fetchSubject'],
      queryingStage: loading.effects['contractCommon/fetchStage'],
      queryingTerm: loading.effects['contractCommon/fetchTermPage'],
      approving: loading.effects['contractApproval/approveList'],
      rejecting: loading.effects['contractApproval/rejectApprovalList'],
      queryingPcAttachmentList: loading.effects['contractCommon/fetchPcAttachmentList'],
      contractApproval,
      contractCommon,
    })),
    formatterCollections({
      code: [
        'spcm.contractApproval',
        'spcm.common',
        'spcm.purchaseRequisitionCreation',
        'entity.organization',
        'entity.attachment',
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
        'SPCM.PURCHASE_CONTRACT_MAINTAIN.DETAIL',
        'SPCM.PURCHASE_CONTRACT_MAINTAIN.DETAIL.READONLY',
        'SPCM.PURCHASE_CONTRACT_MAINTAIN.SUBJECT',
        'SPCM.PURCHASE_CONTRACT_MAINTAIN.SUBJECT.READONLY',
        'SPCM.PURCHASE_CONTRACT_MAINTAIN.PARTNER',
        'SPCM.PURCHASE_CONTRACT_MAINTAIN.PARTNER.READONLY',
        'SPCM.PURCHASE_CONTRACT_MAINTAIN.STAGE',
        'SPCM.PURCHASE_CONTRACT_MAINTAIN.STAGE.READONLY',
        'SPCM.PURCHASE_CONTRACT_MAINTAIN.REBATE',
        'SPCM.PURCHASE_CONTRACT_MAINTAIN.REBATE.READONLY',
        'SPCM.PURCHASE_CONTRACT_MAINTAIN.CONTRACTREPLENISH',
      ],
    }),
    hocRemote({
      code: 'SPCM_CONTRACT_APPROVAL_DETAIL',
      name: 'remote', // 默认 'remote'， 如有属性冲突可以改此属性
    })
  )(com);
export { Detail, hocFunc };
export default hocFunc(Detail);
