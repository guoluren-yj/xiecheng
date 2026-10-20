/*
 * @Description: ContractSignDetail - 协议签署详情
 * @Author: HB <bin.huang02@hand-china.com>
 * @Date: 2019-08-16 15:19:28
 * @version: 0.0.1
 */

import React, { Component, Fragment } from 'react';
import { Button, Spin, Form, Row, Col, Anchor, Affix, Card, Icon, Tabs, Modal } from 'hzero-ui';
import { Modal as ModalPro } from 'choerodon-ui/pro';
import { connect } from 'dva';
import { isNumber, isEmpty, compose, isFunction } from 'lodash';
import classnames from 'classnames';
import { Bind, Debounce } from 'lodash-decorators';
import querystring from 'querystring';
// import withCustomize from 'srm-front-cuz';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { routerRedux } from 'dva/router';
import ComUpload from '@/routes/components/ComUpload';
import hocRemote from 'hzero-front/lib/utils/remote';

import { Button as PermissionButton } from 'components/Permission';
import { Header, Content } from 'components/Page';
import {
  createPagination,
  getUserOrganizationId,
  getResponse,
  getCurrentUser,
  getCurrentOrganizationId,
} from 'utils/utils';
import intl from 'utils/intl';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import { DETAIL_DEFAULT_CLASSNAME, DETAIL_CARD_CLASSNAME } from 'utils/constants';
import { isBlackTenant, allSignList, linkList } from '@/utils/util';
import { PRIVATE_BUCKET } from 'srm-front-boot/lib/utils/config';
import { TopSection, SecondSection } from '_components/Section';
import ChatRoom from 'srm-front-mobile/lib/components/Chat/Room';
import DotButton from '@/routes/components/DotButton';
import { confirmContractPURCHASE, batchCheckContractConfirm } from '@/services/contractSignService';
import {
  initChatOnlineRoom,
  queryShareEditConfig,
  previewContractText,
} from '@/services/newContractService';

import { getExtractConfig } from '@/services/workspaceService';

import PrivacyStatement from '@/routes/ContractChapter/Detail/PrivacyStatement';
import PreferentialRule from '@/routes/components/PreferentialRule';
import { operationTextCompareModal } from '@/routes/components/TextCompareModalNew/index';
import { checkOrderSignContract as checkOrderSign } from '@/utils/commonCheck';

import ContractHeader from '../../components/ContractHeader';
// eslint-disable-next-line import/no-named-as-default
import ContractSubject from '../../components/ContractSubject';
import ContractStage from '../../components/ContractStage';
import ContractPartner from '../../components/ContractPartner';
import ContractBusinessTerms from '../../components/ContractBusinessTerms';
import ContractRebate from '../../components/ContractRebate';
import OperationRecordDrawer from '../../components/OperationRecordDrawer';
import RejectModal from './RejectModal';
import ValidateModal from './ValidateModal';
import EditorOnline from '../../components/EditorOnline';
import Attachment from '../../components/Upload';
import TextComparisonModal from '../../components/TextComparisonModal';
import PrintButton from '../../components/PrintButton';
import ContractReplenish from '../../components/ContractReplenish';
import ContractTableExtend from '../../components/ContractTableExtend';
import SealModal from './SealModal';
import SmartAbstract from '../../workspace/Detail/components/SmartContract/SmartAbstract';

import styles from './index.less';

const { Link } = Anchor;
const { TabPane } = Tabs;
const viewMessagePrompt = 'spcm.contractSign.view.message';
const commonViewMessage = 'spcm.common.view.message';

const CONTRACT_SIGN = 'srm.pc-admin.pc-supplier.sign';

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
 * ContractSignDetail - 协议签署详情
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {!Object} [contractSign={}] - 数据源
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
    const {
      location: { search },
    } = this.props;
    const { pcHeaderId, supplierCompanyId, editShare, supplierId } = querystring.parse(
      search.substr(1)
    );

    const isPub = props.location.pathname.includes('/pub'); // 判断是否为pub页面
    this.state = {
      pcHeaderId,
      supplierCompanyId,
      supplierId,
      editShare, // 工作流区分表单标识
      headerInfo: {}, // 头form数据源
      currentPic: 0,
      listDataSource: [], // 表格数据源
      headerFetchedFlag: false, // 锚点
      isClearListCacheDataSource: true, // 是否清除表格缓存数据源
      operationRecordVisible: false,
      partnerDataSource: [], // 合作伙伴数据
      partnerPagination: {}, // 合作伙伴分页
      partnerSelectedRows: [],
      pcSubjectDataSource: [],
      pcSubjectPagination: {},
      pcSubjectSelectedRows: [],
      pcStagePagination: {},
      pcStageDataSource: [],
      termDataSource: [],
      termPagination: {},
      termSelectedRows: [],
      rejectModalVisible: false, // 审批拒绝弹窗
      templateList: [],
      mobileModalVisible: false, // 手机验证弹窗
      picArray: [], // 所有公司印章图片信息
      focusStatus: undefined, // 当前选中的印章图片
      sealPictureUrl: '', // 选中印章图片url
      sealId: '', // 选中印章图片ID
      signatureId: '', // 选中印章标识
      signFlag: false, // 是否已经盖章
      templateListFlag: false,
      activeKey: 'contractSubjectInfo',
      isPub,
      pcKindAttachList: ['ATTACHMENT_FRAMEWORK', 'ATTACHMENT'],
      verifyPhoneNum: '',
      sealType: undefined, // 协议签署套餐类型
      notPrintAuthority: true, // 是否没有打印按钮权限
      fetchSignLoading: false, // 签章类型获取loading
      enableEditShare: null, // 是否启用在线编辑协同
      onlyEditReplaceWildcardBefore: null, // 是否仅编辑通配符替换前的文件
      PURCHASELoading: false,
      unitCodeList: {},
      statementVisible: false, // 隐私声明弹窗
      enableSmartContract: false, // 智能提取
      enableOnlineAttachmentContract: false, // 附件合同在线编辑白名单
    };
    this.maintainContentRef = React.createRef();
    this.partnerRef = React.createRef();
    this.pcSubjectRef = React.createRef();
    this.pcStageRef = React.createRef();
    this.termRef = React.createRef();
    this.editorOnlineRef = React.createRef();
  }

  async componentDidMount() {
    const isBlackTenantFlag = await isBlackTenant(['srm.pc-admin.pc-supplier.new-sign.ps.default']);
    // 不是黑名单中的租户，采用新的自定义
    this.setState({
      unitCodeList: {
        ...(isBlackTenantFlag ? oldUnitCodeList : newUnitCodeList),
      },
    });
    const { pcHeaderId, isPub } = this.state;
    const { onLoad } = this.props;
    if (pcHeaderId && isNumber(+pcHeaderId)) {
      this.fetchEnum();
      this.fetchHeader(true);
      this.fetchList();
      this.queryPrintAuthority();
      this.fetchShareEditConfig();
      this.handleSmartContractConfig();
      if (isPub && onLoad) {
        onLoad({
          submit: this.handleWpsSave,
        });
      }
    }
  }

  getSnapshotBeforeUpdate() {
    const { headerInfo, headerFetchedFlag, pcKindAttachList = [] } = this.state;
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
      const { hash } = location;
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
      type: 'contractSign/fetchDetailEnum',
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

  // 审批时手动保存WPS文档
  @Bind()
  handleWpsSave(approvalResult) {
    const { remote } = this.props;
    return new Promise(async (resolve, reject) => {
      if (remote?.event) {
        const cuxFlag = await remote.event.fireEvent('handleCuxWpsSave', {
          approvalResult,
          resolve,
          reject,
          current: this,
        });
        if (!cuxFlag) {
          return false;
        }
      }
      // 文本模式，手动保存编辑文档
      if (this.editorOnlineRef && isFunction(this.editorOnlineRef.saveDocument)) {
        this.editorOnlineRef.saveDocument({ data: 'saveDocument' }).then((res) => {
          if (res) {
            resolve(); // 文件保存成功继续执行
          } else {
            reject(); // 文件保存失败中断审批
          }
        });
      } else {
        resolve();
      }
    });
  }

  /**
   * fetchHeader - 查询头明细数据
   * @param isDidMount
   */
  @Bind()
  fetchHeader(isDidMount) {
    const { dispatch, onFormLoaded, remote } = this.props;
    const { pcHeaderId, supplierCompanyId, supplierId, editShare } = this.state;
    if (supplierCompanyId || supplierId) {
      return dispatch({
        type: 'contractSign/fetchHeader',
        payload: {
          companyId: supplierCompanyId || supplierId,
          pcHeaderId,
          customizeUnitCode: 'SPCM.CONTRACT.SIGN.DETAIL.READONLY',
        },
      }).then((res) => {
        if (onFormLoaded && editShare) onFormLoaded(true);
        if (res) {
          const pcKindAttachList = remote
            ? remote.process(
                'SPCM_CONTRACT_SIGN_DETAIL_PCKINDATTACHLSIT',
                ['ATTACHMENT_FRAMEWORK', 'ATTACHMENT'],
                { current: this, headerInfo: res }
              )
            : ['ATTACHMENT_FRAMEWORK', 'ATTACHMENT'];
          this.handleFetchConfigAttachment();
          this.setState({ headerInfo: res, pcKindAttachList }, () => {
            this.setState({
              headerFetchedFlag: true,
              signFlag: ['PUBLISHED', 'TERMINATION_CONFIRM', 'SUPPLIER_SIGN_CONTRACT'].includes(
                res.pcStatusCode
              ),
            });
          });

          if (isDidMount) {
            // 在页面初始化过程中，查询签署相关的配置信息
            this.fetchSealData(res);
          }

          if (res.rebateFlag) {
            this.fetchContractRebate();
          }
        }
      });
    } else {
      notification.warning({
        message: intl.get('hzero.common.validation.notNull', {
          name: intl.get(`entity.supplier.tag`).d('供应商'),
        }),
      });
    }
  }

  /**
   * fetchSealData - 查询签署相关配置信息
   */
  @Bind()
  async fetchSealData(headerInfo) {
    if (headerInfo.electricSignFlag) {
      this.setState({ fetchSignLoading: true });
      const sealType = await this.fetchSealType();
      if (!isEmpty(sealType)) {
        this.setState({ sealType }, () => {
          this.fetchSignImg(headerInfo);
        });
      }
      this.setState({ fetchSignLoading: false });
    }
  }

  /**
   * 获取签署套餐
   */
  @Bind()
  async fetchSealType() {
    const { dispatch } = this.props;
    const {
      pcHeaderId,
      headerInfo: { supplierTenantId },
    } = this.state;
    const response = await dispatch({
      type: 'contractCommon/querySealType',
      payload: {
        supplierTenantId,
        pcHeaderId,
      },
    });
    return response ? response.sealType : undefined;
  }

  /**
   * 刷新头信息和附件列表
   */
  @Bind()
  handleRefresh() {
    // this.fetchHeader();
    this.handleFetchConfigAttachment();
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
    const { pcHeaderId, isPub, unitCodeList } = this.state;
    if (pcHeaderId) {
      dispatch({
        type: 'contractCommon/fetchSubject',
        payload: {
          page,
          pcHeaderId,
          customizeUnitCode:
            unitCodeList?.SUBJECT || 'SPCM.PURCHASE_CONTRACT_MAINTAIN.SUBJECT.READONLY',
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
    const {
      headerInfo: { supplierCompanyId },
    } = this.state;
    dispatch(
      routerRedux.push({
        pathname: `/spcm/contract-sign/detail`,
        search: pcHeaderId ? querystring.stringify({ pcHeaderId, supplierCompanyId }) : null,
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
   * handleVisible - 拒绝协议
   */
  @Bind()
  async handleVisible(field, flag) {
    const { dispatch } = this.props;
    const { headerInfo = {} } = this.state;

    const notAllowedFlag = this.checkOrderSignContract();
    if (notAllowedFlag) {
      return;
    }

    if (this.editorOnlineRef && isFunction(this.editorOnlineRef.saveDocument)) {
      const res = await this.editorOnlineRef.saveDocument({ data: 'saveDocument' });
      if (!res) {
        return false;
      }
    }
    if (headerInfo.pcStatusCode === 'TERMINATION_CONFIRM') {
      // const pcHeaderStatus = headerInfo.electricSignFlag ? 'EFFECTED' : 'CONFIRMED';
      dispatch({
        type: 'contractSign/sureRejectContract',
        payload: { pcHeaderList: [headerInfo] },
      }).then((res) => {
        if (res) {
          notification.success();
          this.props.history.push('/spcm/contract-sign/list');
        }
      });
    } else {
      this.setState({ [field]: !!flag });
    }
  }

  /**
   * 跳转版本对比页
   */
  @Bind()
  toContractHistoryCompare() {
    const {
      headerInfo: { mainContractId, pcHeaderId, supplierCompanyId, electricSignFlag },
    } = this.state;
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `/spcm/contract-sign/contract-history-compare`,
        search: querystring.stringify({
          mainContractId,
          pcHeaderId,
          supplierCompanyId,
          electricSignFlag,
        }),
      })
    );
  }

  confirmDispatch = (pcHeaderList) => {
    this.props
      .dispatch({
        type: 'contractSign/confirmContract',
        payload: { pcHeaderList },
      })
      .then((res) => {
        if (res) {
          notification.success();
          this.props.history.push('/spcm/contract-sign/list');
        }
      });
  };

  /**
   * confirmContract - 确认协议
   */
  @Bind()
  @Debounce(500)
  async confirmContract(isAttachmentSign) {
    const { headerInfo = {} } = this.state;
    const { dispatch, remote } = this.props;
    const { pcHeaderESignHaveCA, pcHeaderId, authType, pcStatusCode } = headerInfo;
    try {
      this.setState({
        PURCHASELoading: true,
      });
      const notAllowedFlag = this.checkOrderSignContract();
      if (notAllowedFlag) {
        return;
      }
      if (!this.headerRef?.props?.form) {
        return;
      }
      if (this.editorOnlineRef && isFunction(this.editorOnlineRef.saveDocument)) {
        const res = await this.editorOnlineRef.saveDocument({ data: 'saveDocument' });
        if (!res) {
          return false;
        }
      }
      // 校验是否可以确认协议
      const payload = {
        pcHeaderList: [{ pcHeaderId }],
      };
      const checkResult = await batchCheckContractConfirm(payload);
      if (getResponse(checkResult)) {
        const { checkResultFlag } = checkResult;
        if (!checkResultFlag) {
          notification.error({
            description: intl
              .get('spcm.common.view.message.supplierEditTips')
              .d('您已修改过协议文本，请点击确认拒绝协议按钮，采购方将对调整后的合同文本重新审核'),
          });
          return;
        }
      } else {
        return;
      }
    } finally {
      this.setState({
        PURCHASELoading: false,
      });
    }
    this.headerRef.props.form.validateFieldsAndScroll(
      { force: true },
      async (errs, { paperDeliveryMethod, paperDeliveryInfo }) => {
        if (!errs && this.attachmentRequiredCheck()) {
          const pcHeaderList = [
            {
              ...headerInfo,
              paperDeliveryMethod,
              paperDeliveryInfo,
            },
          ];
          if (remote?.event) {
            const res = await remote.event.fireEvent('handleCuxConfirmContract', {
              confirmDispatch: this.confirmDispatch,
              pcHeaderList,
              current: this,
            });
            if (!res) {
              return;
            }
          }
          if (!headerInfo.electricSignFlag) {
            if (headerInfo.pcStatusCode === 'TERMINATION_CONFIRM') {
              dispatch({
                type: 'contractSign/sureContract',
                payload: { pcHeaderList },
              }).then((res) => {
                if (res) {
                  notification.success();
                  this.props.history.push('/spcm/contract-sign/list');
                }
              });
            } else {
              this.confirmDispatch(pcHeaderList);
            }
          } else {
            // eslint-disable-next-line no-lonely-if
            if (headerInfo.pcStatusCode === 'TERMINATION_CONFIRM') {
              // 协议已终止
              dispatch({
                type: 'contractSign/sureContract',
                payload: { pcHeaderList },
              }).then((res) => {
                if (res) {
                  notification.success();
                  this.props.history.push('/spcm/contract-sign/list');
                }
              });
            } else if (pcStatusCode === 'TERMINATION') {
              this.signContract();
            } else if (
              headerInfo.contractValidation === 'CONTRACT_VALIDATION_AFTER' &&
              pcStatusCode !== 'SUPPLIER_SIGN_CONTRACT'
            ) {
              // 协议拒绝生效 协议确认后
              this.confirmDispatch(pcHeaderList);
            } else if (this.sealModalRef && this.sealModalRef.openCloseSealModal) {
              this.sealModalRef.openCloseSealModal(true);
            } else if (pcHeaderId && isAttachmentSign && linkList.includes(authType)) {
              // this.setState({ statementVisible: true });
              // 11.12迭代暂不处理签章逻辑的声明
              this.signContract();
            } else {
              // eslint-disable-next-line
              if (pcHeaderESignHaveCA === 'ONLY_PURCHASE') {
                this.setState({
                  PURCHASELoading: true,
                });
                confirmContractPURCHASE({ pcHeaderList })
                  .then((res) => {
                    if (getResponse(res)) {
                      notification.success();
                      this.props.history.push('/spcm/contract-sign/list');
                    }
                  })
                  .finally(() => {
                    this.setState({
                      PURCHASELoading: false,
                    });
                  });
              } else {
                const hash = '#spcm-contract-sign-detail-contract-online-edit';
                const n = document.querySelector(`a[href="${hash}"]`);
                if (n) {
                  n.click();
                }
              }
            }
          }
        }
      }
    );
  }

  /**
   * 获取公司印章图片
   * @param {*} values
   */
  @Bind()
  fetchSignImg(headerInfo) {
    const { dispatch, remote } = this.props;
    const { supplierCompanyId, sealType, pcKindAttachList = [] } = this.state;
    const fetchPictures = (params = {}) =>
      dispatch({
        type: 'contractSign/fetchSignImgList',
        payload: {
          companyId: supplierCompanyId,
          tenantId: getUserOrganizationId(),
          lovCode: 'SPFM.COMPANY_SEAL',
          sealType,
          ...params,
        },
      });
    const response = remote
      ? remote.process('SPCM_CONTRACT_SIGN_DETAIL_FETCH_SEAL_PICTURES', fetchPictures, {
          current: this,
          headerInfo,
        })
      : fetchPictures();
    if (!response || !response.then) return;
    response.then((res) => {
      if (res) {
        const {
          headerInfo: { editStep, pcKindCode },
        } = this.state;
        const picArray = res.filter((item) => {
          return item.sealFileUrl !== null && item.enabledFlag !== 0;
        });
        this.setState({ picArray }, () => {
          if (
            this.state.picArray.length > 0 &&
            editStep === 1 &&
            !pcKindAttachList.includes(pcKindCode)
          ) {
            setTimeout(() => {
              const imgHeight =
                document.getElementsByClassName &&
                document.getElementsByClassName('eachPic') &&
                document.getElementsByClassName('eachPic')[0] &&
                document.getElementsByClassName('eachPic')[0].clientWidth &&
                document.getElementsByClassName('eachPic')[0].clientWidth;
              this.setState({ imgHeight });
            }, 0);
          }
        });
      }
    });
  }

  /**
   * 拒绝协议
   * @param {*} values
   */
  @Bind()
  async handleReject(processRemark) {
    const { headerInfo = {} } = this.state;
    const { dispatch, remote } = this.props;
    const { pcHeaderIdSet, ...otherParams } = headerInfo;
    const afterRejectCallback = () => {
      this.props.history.push('/spcm/contract-sign/list');
    };
    if (remote?.event) {
      const res = await remote.event.fireEvent('handleCuxReject', {
        pcHeaderList: [otherParams],
        processRemark,
        afterRejectCallback,
        that: this,
      });
      if (!res) {
        return;
      }
    }
    dispatch({
      type: 'contractSign/rejectContract',
      payload: { pcHeaderList: [otherParams], processRemark },
    }).then((res) => {
      if (res) {
        notification.success();
        afterRejectCallback();
      }
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
      type: 'contractSign/bindHeaderAttachmentUuid',
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
      type: 'contractSign/bindLineAttachmentUuid',
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
      type: 'contractSign/fetchOperationRecordList',
      payload: {
        pcHeaderId,
        page,
      },
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
   * 提交的时候校验头上附件必输
   */
  @Bind()
  attachmentRequiredCheck() {
    const { headerInfo = {}, templateList = [], pcKindAttachList = [] } = this.state;
    const { remote } = this.props;
    const msg = [];
    templateList.forEach((item) => {
      if (item.nullableFlag === 0 && item.supAttachmentFlag && !item.attachmentUrl) {
        msg.push(item.attachmentTypeName);
      }
    });
    let attachmentUrlValidFlag =
      pcKindAttachList.includes(headerInfo.pcKindCode) && !headerInfo.contractAttachmentUrl;
    if (remote) {
      attachmentUrlValidFlag = remote.process(
        'SPCM_CONTRACT_SIGN_DETAIL_ATTACHMENT_URL_VALID',
        attachmentUrlValidFlag,
        {
          current: this,
        }
      );
    }
    if (attachmentUrlValidFlag) {
      msg.push(intl.get(`${viewMessagePrompt}.contractAttachment`).d('协议文本'));
    }
    if (msg.length > 0) {
      notification.warning({
        message: intl.get('hzero.common.validation.notNull', {
          name: msg.join(','),
        }),
      });
      return null;
    } else {
      return 1;
    }
  }

  /**
   * 显示手机验证签署弹窗,没有手机校验的直接电签
   * @param {*} values
   */
  @Bind()
  async signContract() {
    const {
      pcHeaderId,
      sealPictureUrl,
      sealId,
      signatureId,
      supplierCompanyId,
      sealType,
      headerInfo,
      headerInfo: { mobileVerifyFlag, companyId },
    } = this.state;
    const { dispatch, remote } = this.props;
    const notAllowedFlag = this.checkOrderSignContract();
    if (notAllowedFlag) {
      return;
    }
    const beforRes =
      !remote ||
      (await remote.process('SPCM_CONTRACT_SIGN_DETAIL_BEFOR_SIGNCONTRACT', {
        headerInfo,
        current: this,
      }));
    if (!beforRes) return;
    if (this.attachmentRequiredCheck()) {
      if (mobileVerifyFlag && sealType === 'ESIGN') {
        dispatch({
          type: 'contractCommon/fetchVerifyPhoneNum',
          payload: {
            authType: sealType,
            companyId: supplierCompanyId,
            supplierCompanyId: companyId,
          },
        }).then((res) => {
          if (res) {
            this.setState({
              mobileModalVisible: true,
              verifyPhoneNum: res.phone,
            });
          }
        });
      } else {
        dispatch({
          type: 'contractSign/contractSign',
          payload: {
            pcHeaderId,
            sealPictureUrl,
            sealId,
            signatureId,
            companyId: supplierCompanyId,
            authType: sealType,
            signCamp: 'S',
          },
        }).then((res) => {
          if (res) {
            notification.success();
            if (res.sealLink) {
              window.open(res.sealLink);
              this.setState({ statementVisible: false });
              dispatch(
                routerRedux.push({
                  pathname: `/spcm/contract-sign/list`,
                })
              );
            } else {
              this.setState({ signFlag: false });
              this.fetchHeader();
              if (this.editorOnlineRef?.fetchEditorOnlineHTML) {
                // eslint-disable-next-line no-unused-expressions
                this.editorOnlineRef?.fetchEditorOnlineHTML();
              }
            }
          }
        });
      }
    }
  }

  /**
   * 手机验证确认签署
   */
  @Bind()
  async handleOk(values = {}) {
    const {
      pcHeaderId,
      sealPictureUrl,
      sealId,
      signatureId,
      supplierCompanyId,
      sealType,
      headerInfo: { certificateResId },
    } = this.state;
    const { dispatch, remote } = this.props;
    if (remote?.event) {
      const res = await remote.event.fireEvent('handleCuxValidatePhoneOk', { current: this, values });
      if (!res) {
        return;
      }
    }
    if (!isEmpty(values)) {
      dispatch({
        type: 'contractSign/confirmMobile',
        payload: {
          pcHeaderId,
          sealPictureUrl,
          sealId,
          signatureId,
          signCamp: 'S',
          companyId: supplierCompanyId,
          authType: sealType,
          certificateResId,
          ...values,
        },
      }).then((res) => {
        if (res) {
          this.handleModalVisible('mobileModalVisible', false);
          notification.success();
          if (res.sealLink) {
            window.open(res.sealLink);
            dispatch(
              routerRedux.push({
                pathname: `/spcm/contract-sign/list`,
              })
            );
          } else {
            this.setState({ signFlag: false });
            this.fetchHeader();
            if (this.editorOnlineRef?.fetchEditorOnlineHTML) {
              // eslint-disable-next-line no-unused-expressions
              this.editorOnlineRef?.fetchEditorOnlineHTML();
            }
            if (this.sealModalRef && this.sealModalRef.openCloseSealModal) {
              this.sealModalRef.openCloseSealModal(false);
            }
          }
        }
      });
    }
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
   * 点击图片样式修改
   */
  @Bind()
  handleClickImg(index) {
    const { focusStatus, picArray } = this.state;
    this.setState({
      focusStatus: focusStatus === index ? undefined : index,
      sealPictureUrl: picArray[index].sealPictureUrl,
      sealId: picArray[index].sealId,
      signatureId: picArray[index].signatureId,
    });
  }

  /**
   * 获取验证码
   * @param {*} [values={}]
   * @memberof Detail
   */
  @Bind()
  handleCheckCode(values = {}) {
    const { dispatch } = this.props;
    const {
      supplierCompanyId,
      headerInfo: { certificateResId, pcHeaderId },
    } = this.state;
    this.modalForm.validateFields(['mobile'], (err) => {
      if (!err) {
        dispatch({
          type: 'contractSign/getCheckCode',
          payload: {
            mobile: values,
            certificateResId,
            companyId: supplierCompanyId,
            pcHeaderId,
          },
        });
      }
    });
  }

  /**
   * 点击向上按钮图片向上移动
   *
   * @returns
   * @memberof Detail
   */
  @Bind()
  goToPictureSign(type) {
    const { currentPic, imgHeight } = this.state;
    this.setState({
      currentPic: type === 'up' ? currentPic - (imgHeight + 16) : currentPic + (imgHeight + 16),
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
   * 防抖，减少渲染频率
   * @param {Function} fun 回调函数
   * @param {number} delay 延时
   */
  @Bind()
  debounce(fun, delay) {
    let timeout = null;
    // eslint-disable-next-line
    return function () {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        fun.call(this, arguments); // eslint-disable-line
      }, delay);
    };
  }

  @Bind()
  handleChangeHeader(headerInfo) {
    this.setState({ headerInfo });
  }

  @Bind()
  handleControlComparison() {
    const { textComparisonVisible } = this.state;
    this.setState({ textComparisonVisible: !textComparisonVisible });
  }

  /**
   * queryPrintAuthority - 查询打印按钮权限
   */
  @Bind()
  queryPrintAuthority() {
    const { dispatch } = this.props;
    const { pcHeaderId } = this.state;
    dispatch({
      type: 'contractSign/queryButtonAuthority',
      payload: {
        pcHeaderId,
      },
    }).then((res) => {
      if (Array.isArray(res)) {
        this.setState({
          notPrintAuthority: !!res.includes('CONTRACT_DETAIL'),
        });
      }
    });
  }

  // src-4038 为了58的补充协议列表二开
  @Bind()
  renderContractReplenish(contractReplenishProps) {
    const { remote } = this.props;
    const { headerInfo } = this.state;
    const { supplementFlag, pcHeaderId } = headerInfo || {};
    const replenishFlag = remote
      ? remote.process('SPCM_CONTRACT_SIGN_DETAIL_REPLENISHFLAG', pcHeaderId && !supplementFlag, {
          ...contractReplenishProps,
          pcHeaderId,
          current: this,
        })
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

  handleChatRoom = async () => {
    const { headerInfo } = this.state;
    const { pcHeaderId, supplierCompanyId, supplierTenantId } = headerInfo;
    const res = getResponse(await initChatOnlineRoom({ pcHeaderId, camp: 'supplier' }));
    if (res) {
      this.setState({ headerInfo: { ...headerInfo, msgNum: 0 } });
      const chatRoomModal = ModalPro.open({
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

  /**
   * 预览合同文本
   */
  @Bind()
  async previewContract() {
    const { pcHeaderId } = this.state;
    this.setState({ previewContractLoading: true });
    if (this.editorOnlineRef && isFunction(this.editorOnlineRef.saveDocument)) {
      const res = await this.editorOnlineRef.saveDocument({ data: 'saveDocument' });
      if (!res) {
        return false;
      }
    }
    const res = await previewContractText({ pcHeaderId, menuCode: CONTRACT_SIGN });
    this.setState({ previewContractLoading: false });
    if (getResponse(res) && window?.open && res?.url) {
      if (res.version === 'V7' && res.componentType === 'new_wps') {
        window.open(
          `${window.$$env.BASE_PATH}pub/spcm/contract-workspace/wps-v7-preview/${pcHeaderId}?previewUrl=${res?.url}`
        );
      } else {
        window.open(res?.url);
      }
    }
  }

  // 文本对比
  @Bind()
  async handleTextCompare() {
    const { headerInfo } = this.state;
    await this.handleWpsSave();
    this.setState({
      PURCHASELoading: true,
    });
    operationTextCompareModal({
      headerInfo,
    }).finally(() => {
      this.setState({
        PURCHASELoading: false,
      });
    });
  }

  // 校验订单签署的合同
  @Bind()
  checkOrderSignContract() {
    const { headerInfo } = this.state;
    const res = checkOrderSign(headerInfo);
    return res;
  }

  // @overide网易
  renderHeaderButton() {
    const {
      location,
      queryingHeader = false,
      queryingPartner = false,
      queryingSubject = false,
      queryingStage = false,
      queryingTerm = false,
      confirmLoading = false,
      submitDeliveryLoading = false,
      remote,
      history,
      customizeBtnGroup,
    } = this.props;
    const {
      templateList = [],
      headerInfo = {},
      signFlag,
      templateListFlag,
      isPub,
      notPrintAuthority,
      PURCHASELoading,
      pcKindAttachList = [],
      fetchSignLoading,
      enableEditShare,
      onlyEditReplaceWildcardBefore,
      previewContractLoading,
    } = this.state;
    const {
      attachmentUuid,
      supplierAttachmentUuid,
      electricSignFlag,
      editStep,
      signatureType,
      authType,
      electronicSignatureAttachmentDisplayFlag,
      supplementFlag,
      msgNum,
      supplierCompanyId,
      pcKindCode,
    } = headerInfo;
    const { search = {} } = location;
    const { pcHeaderId = headerInfo.pcHeaderId } = querystring.parse(search.substr(1));
    const commonLoading =
      queryingHeader ||
      queryingPartner ||
      queryingSubject ||
      queryingStage ||
      queryingTerm ||
      PURCHASELoading ||
      fetchSignLoading;
    const attachmentProps = {
      remote,
      headerInfo,
      templateList,
      supplierAttachmentUuid,
      onUpdateHeader: this.save,
      attachmentUUID: attachmentUuid,
      onFetchHeader: this.fetchHeader,
      isTemplateContract: true,
      onRefresh: this.handleFetchConfigAttachment,
      onChangeState: (state) => this.setState(state),
      supplierParams: { supplierUploadFlag: true },
      className: isPub ? 'spcm-pub-modal' : null,
      // custViewContainerId: 'purComAttachViewerContainer',
      fileViewerClassName: isPub ? 'spcm-pub-viewer' : null,
      btnProps: {
        disabled: commonLoading,
        loading: confirmLoading,
        permissionList: [
          {
            code: 'srm.pc-admin.pc-supplier.sign.ps.attachment.button',
            type: 'button',
            meaning: '协议签署—附件',
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
      fileMaxNum: 4,
    };

    // 文本编辑相关按钮是否展示
    const isShowEditOnlineBtns = !pcKindAttachList.includes(pcKindCode) && enableEditShare === '1';

    const buttons = [
      !isPub && (
        <Button
          data-name="confirm"
          loading={confirmLoading || commonLoading || PURCHASELoading}
          icon="check"
          disabled={
            !pcHeaderId ||
            isEmpty(headerInfo) ||
            !['PUBLISHED', 'TERMINATION_CONFIRM', 'SUPPLIER_SIGN_CONTRACT', 'TERMINATION'].includes(
              headerInfo.pcStatusCode
            )
          }
          key="confirm"
          onClick={this.confirmContract}
          type="primary"
        >
          {intl.get(`${viewMessagePrompt}.confirmTheAgreement`).d('确认协议')}
        </Button>
      ),
      !isPub && (
        <Button
          data-name="reject"
          loading={submitDeliveryLoading || commonLoading}
          key="reject"
          icon="close"
          onClick={() => this.handleVisible('rejectModalVisible', true)}
          disabled={!pcHeaderId || !signFlag}
        >
          {intl.get(`${viewMessagePrompt}.refusedToDeal`).d('拒绝协议')}
        </Button>
      ),
      !isEmpty(headerInfo) && templateListFlag && (
        <Attachment data-name="attachment" key="attachment" {...attachmentProps} />
      ),
      supplementFlag ? (
        <Button
          data-name="contractHistoryCompare"
          icon="clock-circle-o"
          key="contractHistoryCompare"
          onClick={this.toContractHistoryCompare}
        >
          {intl.get(`hzero.common.button.contractHistoryCompare`).d('历史版本对比')}
        </Button>
      ) : null,
      <Button
        data-name="operating"
        key="operating"
        loading={submitDeliveryLoading}
        icon="clock-circle-o"
        onClick={() => this.handleModalVisible('operationRecordVisible', true, { pcHeaderId })}
      >
        {intl.get(`hzero.common.button.operating`).d('操作记录')}
      </Button>,
      !isEmpty(headerInfo) && (isAttachmentSignUpload || isAttachmentSignAndText) && (
        <Button
          data-name="uploadESignAttachment"
          key="upload"
          className={styles.purchaseHeaderNumber}
        >
          <ComUpload viewOnly {...electricSignAttachmentProps} />
        </Button>
      ),
      !isEmpty(headerInfo) &&
        !isAttachmentSignUpload &&
        !pcKindAttachList.includes(headerInfo.pcKindCode) && (
          <PermissionButton
            data-name="comparison"
            key="comparison"
            permissionList={[
              {
                code: 'srm.pc-admin.pc-supplier.sign.ps.text.comparison',
                type: 'button',
                meaning: '文本对比',
              },
            ]}
            onClick={this.handleControlComparison}
          >
            {intl.get('spcm.common.view.title.textComparison').d('文本对比')}
          </PermissionButton>
        ),
      !isEmpty(headerInfo) && isShowEditOnlineBtns && onlyEditReplaceWildcardBefore === '1' && (
        <Button
          data-name="previewContract"
          key="previewContract"
          icon="eye-o"
          loading={previewContractLoading}
          onClick={this.previewContract}
        >
          {intl.get('spcm.common.view.button.previewContract').d('预览合同文本')}
        </Button>
      ),
      supplierCompanyId && (
        <DotButton
          permissionList={[
            {
              code: 'srm.pc-admin.pc-supplier.sign.button.online.communication',
              type: 'button',
              meaning: '在线沟通',
            },
          ]}
          key="chatRoom"
          data-name="chatRoom"
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
      pcHeaderId &&
        editStep === 1 &&
        !pcKindAttachList.includes(headerInfo.pcKindCode) &&
        !isAttachmentSignUpload && (
          <PrintButton
            data-name="print"
            key="print"
            pcHeaderId={pcHeaderId}
            disabled={notPrintAuthority}
          />
        ),
      isPub && !['PENDING', 'DELETED'].includes(headerInfo.pcStatusCode) && (
        <Button
          data-name="onlineTextCompare"
          loading={submitDeliveryLoading || commonLoading}
          key="onlineTextCompare"
          icon="profile"
          onClick={() => this.handleTextCompare()}
        >
          {intl.get('spcm.common.button.contractTextComparison').d('合同文本对比')}
        </Button>
      ),
    ].filter(Boolean);
    // src-6760 大全集团二开埋点改造，此埋点需求在个性化按钮组添加需求之前
    const buttonList = remote
      ? remote.process('SPCM_CONTRACT_SIGN_DETAIL_PROCESS_HEADER_BUTTONS', buttons, {
          headerInfo,
          isPub,
          history,
          current: this,
        })
      : buttons;
    return (
      <Header
        title={intl.get(`${viewMessagePrompt}.title.contractSign`).d('协议签署')}
        backPath={isPub ? null : '/spcm/contract-sign/list'}
      >
        {customizeBtnGroup(
          {
            code: 'SPCM.CONTRACT.SIGN.DETAIL.BTN_GROUP',
          },
          buttonList
        )}
      </Header>
    );
  }

  /**
   * 根据用章类型显示提示信息
   * @param {string} authType 用章类型
   * @returns
   */
  getAuthTypeTip = (authType) => {
    switch (authType) {
      case 'FDD':
      case 'FDD_SAAS':
        return intl
          .get('spcm.common.view.message.signFDD')
          .d('点击"签署"，在法大大中执行选章签署操作');
      case 'QYS':
      case 'QYS_SAAS':
        return intl
          .get('spcm.common.view.message.signQYS')
          .d('点击"签署"，在契约锁中执行选章签署操作');
      default:
        return intl
          .get('spcm.common.view.message.signESIGN')
          .d('点击"签署"，在E签宝中执行选章签署操作');
    }
  };

  render() {
    const {
      form,
      location,
      dispatch,
      deletingLines,
      contractSign,
      queryingHeader = false,
      queryingPartner = false,
      queryingSubject = false,
      queryingStage = false,
      queryingTerm = false,
      rejectLoading = false,
      contractLoading = false,
      bindingUuid = false,
      loadingPaymentCode = false,
      submitDeliveryLoading = false,
      contractSignLoading = false,
      customizeForm,
      remote,
      custLoading,
      customizeTable,
      getHocInstance,
    } = this.props;
    const {
      sealType,
      editShare,
      rejectModalVisible = false,
      mobileModalVisible = false,
      isClearListCacheDataSource,
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
      focusStatus = undefined,
      picArray,
      currentPic,
      imgHeight,
      signFlag: newSignFlag,
      activeKey,
      pcRebateDataSource = [],
      pcRebatePagination = {},
      isPub,
      textComparisonVisible,
      verifyPhoneNum = '',
      pcKindAttachList = [],
      unitCodeList,
      onlyEditReplaceWildcardBefore,
      enableEditShare,
      enableSmartContract,
      enableOnlineAttachmentContract,
      cuxRejectLoading,
    } = this.state;
    const {
      prStatusCode,
      electricSignFlag,
      editStep,
      rebateFlag,
      supplementFlag,
      contractValidation = '',
      pcStatusCode,
      sealShowFlag, // 对亚美的特殊字段处理 不要给默认值
      signatureType,
      authType,
      electronicSignatureAttachmentDisplayFlag,
      enableRule,
      pcNum,
      version,
      showAttachmentFlag,
    } = headerInfo;
    const { search = {} } = location;
    const { detailEnumMap } = contractSign;
    const {
      prSourcePlatform = headerInfo.prSourcePlatform,
      pcHeaderId = headerInfo.pcHeaderId,
    } = querystring.parse(search.substr(1));
    const editable = false;
    const currentPicPx = String(currentPic).concat('px');

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
      ? remote.process('SPCM_CONTRACT_SIGN_DETAIL_CONFIGFLAGOBJ', configFlagObj, { current: this })
      : configFlagObj;

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
      remote,
      contractPath: !isPub ? 'sign' : null,
      dataSource: headerInfo,
      terminateReasonFlag: headerInfo.pcStatusCode === 'TERMINATION_CONFIRM',
      onChangeHeader: this.handleChangeHeader,
      afterOpenUploadModal: this.afterOpenLineUploadModal,
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

      dispatch,
      prStatusCode,
      prSourcePlatform,
      deletingLines,
      onChangeListData: this.handleChangeList,
      onChangeHeader: this.handleChangeHeader,
      isClearListCacheDataSource,
      fetchList: this.fetchPartner,
      deleteLines: this.deleteDetailLines,
      setDataSource: this.setItemInfoListDataSource,
      afterOpenUploadModal: this.afterOpenLineUploadModal,
      handleLadderQuote: this.handleLadderQuote,
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

      dispatch,
      headerInfo,
      prStatusCode,
      prSourcePlatform,
      deletingLines,

      onChangeListData: this.handleChangeList,
      onChangeHeader: this.handleChangeHeader,
      isClearListCacheDataSource,
      fetchList: this.fetchPartner,
      deleteLines: this.deleteDetailLines,
      setDataSource: this.setItemInfoListDataSource,
      afterOpenUploadModal: this.afterOpenLineUploadModal,
    };
    const contractBusinessTermsListProps = {
      editable,
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
      ref: this.termRef,

      onChangeListData: this.handleChangeList,
      onChangeHeader: this.handleChangeHeader,
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
      role: 'supplier',
      onHandleCancel: () => this.handleModalVisible('operationRecordVisible', false),
    };

    const rejectModalProps = {
      rejectLoading: rejectLoading || cuxRejectLoading,
      visible: rejectModalVisible,
      onOk: this.handleReject,
      onCancel: () => this.handleModalVisible('rejectModalVisible', false),
    };

    const validateModalProps = {
      verifyPhoneNum,
      contractLoading,
      mobileModalVisible,
      onClose: () => this.handleModalVisible('mobileModalVisible', false),
      onModalOk: this.handleOk,
      onGetCheckCode: this.handleCheckCode,
      onRef: (node) => {
        this.modalForm = node.props.form;
      },
      dispatch: this.props.dispatch,
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

    const isAttachmentSignAndText =
      (signatureType === 'TEXT_AND_ANNEX_SIGNATURE' &&
        electricSignFlag === 1 &&
        allSignList.includes(authType)) ||
      electronicSignatureAttachmentDisplayFlag === 'Y'; // 是否附件签章

    let showSignButton =
      !isAttachmentSignAndText &&
      (contractValidation !== 'CONTRACT_VALIDATION_AFTER' || // 签署阶段不等于协议确认后
        headerInfo.pcStatusCode === 'SUPPLIER_SIGN_CONTRACT') &&
      pcStatusCode !== 'TERMINATION_CONFIRM'; // 终止确认 不允许签署

    // 二开通用五菱隐藏供应商印章提醒
    const hiddenNoteText = remote
      ? remote?.process('SPCM_CONTRACT_SIGN_DETAIL_SUPPLIERLINK_NOTE', isAttachmentSignAndText, {})
      : isAttachmentSignAndText;

    let signFlag = newSignFlag;

    if (remote) {
      // src-37405 伊品生物埋点
      const newSignInfo = remote.process(
        'SPCM_CONTRACT_SIGN_DETAIL_SIGNPROPS',
        { showSignButton, signFlag },
        {
          current: this,
        }
      );
      showSignButton = newSignInfo?.showSignButton;
      signFlag = newSignInfo?.signFlag;
    }

    const sealModalProps = {
      mobileChapterLoading: contractLoading,
      picDataSource: picArray,
      contractSignLoading,
      focusStatus,
      signFlag,
      currentPic,
      onRef: (node) => {
        this.sealModalRef = node;
      },
      onModalOk: this.signContract,
      onHandleClickImg: this.handleClickImg,
    };

    const statementModal = (
      <Modal
        key={authType}
        width={600}
        visible={this.state.statementVisible}
        className={styles['theme-config-protocol']}
        onCancel={() => {
          this.setState({ statementVisible: false });
        }}
        destroyOnClose
        footer={null}
      >
        <PrivacyStatement
          onCancel={() => {
            this.setState({ statementVisible: false });
          }}
          handleOk={this.signContract}
          authType={authType}
          loading={contractSignLoading}
        />
      </Modal>
    );

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
                          .get(`${commonViewMessage}.title.contractHeaderInformation`)
                          .d('采购协议头信息')}
                      </h3>
                    }
                  >
                    <ContractHeader {...headerInfoFormProps} />
                  </Card>
                  {pcHeaderId && (
                    <div
                      key="subjectInformation"
                      id="spcm-contract-maintain-detail-contract-subject"
                    >
                      <Tabs activeKey={activeKey} animated={false} onChange={this.handleSaveKey}>
                        <TabPane
                          tab={intl.get(`${commonViewMessage}.title.contractSubject`).d('协议标的')}
                          key="contractSubjectInfo"
                        >
                          <ContractSubject {...contractSubjectListProps} />
                        </TabPane>
                        <TabPane
                          tab={intl.get(`${commonViewMessage}.title.contractStage`).d('协议阶段')}
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
                  {/* 智能摘要 */}
                  <SmartAbstract showFlag={isPub} h0StyleFlag pcHeaderId={pcHeaderId} />
                  <TopSection
                    code="SPCM.CONTRACT.SIGN.CARD.READONLY"
                    getHocInstance={getHocInstance}
                  >
                    {remote?.render('SPCM_CONTRACT_SIGN_DETAIL_EXTRA_DOM', null, {
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
                                .get(`${commonViewMessage}.title.contractPartnerInformation`)
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
                      id="spcm-contract-sign-detail-contract-online-edit"
                      bordered={false}
                      className={DETAIL_CARD_CLASSNAME}
                      title={
                        <h3>
                          {intl
                            .get(`${commonViewMessage}.title.contractOnlineEdit`)
                            .d('采购协议文本编辑')}
                        </h3>
                      }
                    >
                      {electricSignFlag === 1 && !isPub ? (
                        <Row>
                          <Col span={sealShowFlag || showSignButton ? 21 : 24}>
                            <EditorOnline
                              menuCode={CONTRACT_SIGN}
                              iframeStyle={{
                                width: '100%',
                                height: `${(document?.body?.clientHeight - 96) * 0.9}px`,
                              }}
                              onRef={(node) => {
                                this.editorOnlineRef = node;
                              }}
                              // 是协议签署功能
                              isContractSign
                              // 开启在线编辑协同，开启是否仅编辑通配符替换前的文件，使用新的获取url的接口
                              isNewAPIUrlFlag={
                                onlyEditReplaceWildcardBefore === '1' && enableEditShare === '1'
                              }
                              editShare={editShare}
                              pcHeaderId={pcHeaderId}
                              headerInfo={headerInfo}
                              supplierFlag={1}
                              permissionCode={sealShowFlag === 'meyerSignatureFlag' ? 'EDIT' : null}
                              isOtherPageEdit={smartFileContractFlag}
                            />
                          </Col>
                          {sealShowFlag === 'meyerSignatureFlag' &&
                            pcStatusCode !== 'PURCHASER_SIGN_CONTRACT' && (
                              <Col span={3}>
                                <div
                                  style={{
                                    marginBottom: 16,
                                    marginTop: 16,
                                    width: '100%',
                                    textAlign: 'right',
                                  }}
                                >
                                  <Button
                                    loading={contractSignLoading}
                                    type="primary"
                                    onClick={this.signContract}
                                    style={{ width: '80%' }}
                                  >
                                    {intl.get(`${viewMessagePrompt}.title.sign`).d('签署')}
                                  </Button>
                                </div>
                              </Col>
                            )}
                          {!sealShowFlag && showSignButton && !linkList.includes(sealType) && (
                            <Col span={3}>
                              {picArray.length > 0 ? (
                                <div
                                  className={styles.signet}
                                  style={{
                                    marginTop: picArray.length <= 3 ? '-16px' : 0,
                                  }}
                                >
                                  <Button
                                    style={{
                                      display: picArray.length > 3 ? 'block' : 'none',
                                      width: imgHeight,
                                    }}
                                    disabled={currentPic === 0}
                                    onClick={() => {
                                      this.goToPictureSign('up');
                                    }}
                                  >
                                    <Icon type="up" />
                                  </Button>
                                  <div
                                    className="img-box"
                                    style={{ maxHeight: (imgHeight + 16) * 3 }}
                                  >
                                    {picArray.map((ele, index) => {
                                      return (
                                        <p
                                          key={ele.sealId}
                                          className="eachPic"
                                          style={{
                                            bottom: currentPicPx,
                                            height: imgHeight,
                                          }}
                                        >
                                          <img
                                            alt={ele.sealName}
                                            src={ele.sealFileUrl}
                                            title={ele.sealName}
                                            onClick={() => {
                                              this.handleClickImg(index);
                                            }}
                                          />
                                          <Icon
                                            type="check-circle-o"
                                            style={{
                                              fontSize: 14,
                                              display: focusStatus === index ? 'block' : 'none',
                                            }}
                                            className={focusStatus === index ? 'focusImg' : ''}
                                          />
                                        </p>
                                      );
                                    })}
                                  </div>
                                  <Button
                                    loading={contractSignLoading}
                                    type="primary"
                                    onClick={this.signContract}
                                    style={{
                                      marginTop: 16,
                                      marginBottom: 16,
                                      width: imgHeight,
                                    }}
                                    disabled={focusStatus === undefined || !signFlag}
                                  >
                                    {intl.get(`${viewMessagePrompt}.title.sign`).d('签署')}
                                  </Button>
                                  <Button
                                    style={{
                                      display: picArray.length > 3 ? 'block' : 'none',
                                      width: imgHeight,
                                    }}
                                    onClick={() => this.goToPictureSign('down')}
                                    disabled={
                                      currentPic >=
                                      picArray.length * (imgHeight + 16) -
                                        ((imgHeight + 16) * 3 + 16)
                                    }
                                  >
                                    <Icon type="down" />
                                  </Button>
                                </div>
                              ) : (
                                (!sealShowFlag ? !hiddenNoteText : false) && (
                                  <div className={styles.noSealImg}>
                                    {intl
                                      .get(`${commonViewMessage}.title.notSetChapter`)
                                      .d('您尚未设置印章，请切换至')}
                                    <strong>
                                      {intl
                                        .get(`${commonViewMessage}.title.supplierTenant`)
                                        .d('供应商租户')}
                                    </strong>
                                    {intl
                                      .get(`${commonViewMessage}.title.goToSetChapter`)
                                      .d('下，前往')}
                                    <strong>
                                      {intl
                                        .get(`${commonViewMessage}.title.groupChapterManage`)
                                        .d('集团管理·印章管理')}
                                    </strong>
                                    {intl
                                      .get(`${commonViewMessage}.title.setChapter`)
                                      .d('功能设置您的签署印章。')}
                                  </div>
                                )
                              )}
                            </Col>
                          )}
                          {/* 法大大/契约锁签章只需要一个按钮跳转外部 */}
                          {!isAttachmentSignUpload &&
                            showSignButton &&
                            linkList.includes(sealType) && (
                              // 签署阶段不等于协议确认后
                              <Col span={3}>
                                <div
                                  style={{
                                    marginLeft: 25,
                                    width: '80%',
                                    minHeight: 100,
                                    border: '1px solid #d5dae0',
                                    textAlign: 'center',
                                    lineHeight: '20px',
                                    padding: 10,
                                  }}
                                >
                                  <span
                                    style={{
                                      fontWeight: 400,
                                      fontSize: 12,
                                      color: 'rgba(0,0,0,0.45)',
                                    }}
                                  >
                                    {this.getAuthTypeTip(sealType)}
                                  </span>
                                </div>
                                <Button
                                  loading={contractSignLoading}
                                  type="primary"
                                  // onClick={() => {
                                  //   this.setState({ statementVisible: true });
                                  // }}
                                  // 11.12迭代暂不处理签章逻辑的声明
                                  onClick={this.signContract}
                                  style={{
                                    marginLeft: 25,
                                    marginTop: 15,
                                    width: '80%',
                                    height: 30,
                                  }}
                                >
                                  {intl.get(`${viewMessagePrompt}.title.sign`).d('签署')}
                                </Button>
                              </Col>
                            )}
                        </Row>
                      ) : (
                        <Row>
                          <Col span={24}>
                            <EditorOnline
                              menuCode={CONTRACT_SIGN}
                              iframeStyle={{
                                width: '100%',
                                height: `${
                                  ((isPub
                                    ? window?.parent?.parent?.document?.body?.clientHeight
                                    : document?.body?.clientHeight) -
                                    96) *
                                  0.9
                                }px`,
                              }}
                              onRef={(node) => {
                                this.editorOnlineRef = node;
                              }}
                              // 是协议签署功能
                              isContractSign
                              // 协议确认审批时，开启在线编辑协同，开启是否仅编辑通配符替换前的文件，使用新的获取url的接口
                              isNewAPIUrlFlag={
                                onlyEditReplaceWildcardBefore === '1' && enableEditShare === '1'
                              }
                              editShare={editShare}
                              pcHeaderId={pcHeaderId}
                              headerInfo={headerInfo}
                              supplierFlag={1}
                              permissionCode={sealShowFlag === 'meyerSignatureFlag' ? 'EDIT' : null}
                              isOtherPageEdit={smartFileContractFlag}
                            />
                          </Col>
                        </Row>
                      )}
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
                        title={intl
                          .get(`${commonViewMessage}.title.basicInformation`)
                          .d('基本信息')}
                      />
                      <Link
                        href="#spcm-contract-maintain-detail-contract-subject"
                        title={intl
                          .get(`${commonViewMessage}.title.subjectInformation`)
                          .d('标的信息')}
                      />
                      <Link
                        href="#spcm-maintain-detail-contract-partner"
                        title={intl
                          .get(`${commonViewMessage}.title.partnerInformation`)
                          .d('伙伴信息')}
                      />{' '}
                      {configFlagObj?.businessTermsFlag && (
                        <Link
                          href="#spcm-maintain-detail-contract-business-terms"
                          title={intl
                            .get(`${commonViewMessage}.title.businessTermsInformation`)
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
                          href="#spcm-contract-sign-detail-contract-online-edit"
                          title={intl.get(`spcm.common.title.onlineEdit`).d('文本编辑')}
                        />
                      )}
                      {remote?.render('SPCM_CONTRACT_SIGN_DETAIL_EXTRA_LINK', null, {
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
        <ValidateModal {...validateModalProps} />
        <RejectModal {...rejectModalProps} />
        <OperationRecordDrawer {...operationRecordProps} />
        {pcHeaderId &&
          (isAttachmentSignUpload || isAttachmentSignAndText) &&
          authType === 'ESIGN' && <SealModal {...sealModalProps} />}
        {textComparisonVisible && <TextComparisonModal {...textComparisonProps} />}
        {statementModal}
      </Fragment>
    );
  }
}

const hocFunc = (com) =>
  compose(
    Form.create({ fieldNameProp: null }),
    connect(({ loading, contractSign }) => ({
      queryingHeader: loading.effects['contractCommon/fetchHeader'],
      queryingPartner: loading.effects['contractCommon/fetchPartner'],
      queryingSubject: loading.effects['contractCommon/fetchSubject'],
      queryingStage: loading.effects['contractCommon/fetchStage'],
      queryingTerm: loading.effects['contractCommon/fetchTerm'],
      confirmLoading:
        loading.effects['contractSign/sureContract'] ||
        loading.effects['contractSign/confirmContract'],
      rejectLoading: loading.effects['contractSign/rejectContract'],
      contractLoading: loading.effects['contractSign/confirmMobile'],
      contractSignLoading: loading.effects['contractSign/contractSign'],
      contractSign,
    })),
    formatterCollections({
      code: [
        'spcm.contractSign',
        'spcm.common',
        'spcm.contractChapter',
        'spcm.purchaseRequisitionCreation',
        'spcm.purchaseContractView',
        'entity.roles',
        'entity.company',
        'entity.business',
        'entity.item',
        'entity.supplier',
        'component.docFlow',
        'spfp.ruleMaintenance',
        'spfp.common',
        'scux.spcm',
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
        'SPCM.CONTRACT.SIGN.DETAIL.BTN_GROUP',
        'SPCM.CONTRACT.SIGN.TABLEEXTEND.READONLY', // 协议自定义行表信息-只读
        'SPCM.CONTRACT.SIGN.CARD.READONLY', // 协议签署-卡片只读
        ...Object.values(oldUnitCodeList),
        ...Object.values(newUnitCodeList),
      ],
    }),
    hocRemote(
      {
        code: 'SPCM_CONTRACT_SIGN_DETAIL', // 对应二开模块暴露的Expose的编码， 命名规范：模块编码+功能编码
        name: 'remote', // 默认 'remote'， 如有属性冲突可以改此属性
      },
      {
        events: {
          // 协议确认
          handleCuxConfirmContract() {},
          // 查询补充协议
          fetchCuxReplenish() {},
          // 审批过程中wps保存
          handleCuxWpsSave() {},
          // 拒绝协议确认
          handleCuxReject() {
            return true;
          },
          // 手机验证签署
          handleCuxValidatePhoneOk() {},
        },
        process: {
          SPCM_CONTRACT_SIGN_DETAIL_FETCH_SEAL_PICTURES(fun) {
            return fun();
          },
        },
      }
    )
  )(com);
export { Detail, hocFunc };
export default hocFunc(Detail);
