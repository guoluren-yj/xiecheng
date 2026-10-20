/*
 * @Description: ContractChapter - 协议用章详情
 * @Author: zhutian <tian.zhu@hand-china.com>
 * @Date: 2019-08-13 11:16:24
 * @LastEditTime: 2024-12-19 10:11:25
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component, Fragment } from 'react';
import {
  Button,
  Spin,
  Form,
  Row,
  Col,
  Anchor,
  Affix,
  Card,
  Icon,
  Tabs,
  Tooltip,
  Dropdown,
  Menu,
  Modal,
} from 'hzero-ui';
import { DataSet, Modal as ModalPro } from 'choerodon-ui/pro';
import { connect } from 'dva';
import { isNumber, isEmpty, compose } from 'lodash';
import classnames from 'classnames';
import { Bind } from 'lodash-decorators';
import queryString from 'querystring';
// import withCustomize from 'srm-front-cuz';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import Upload from 'srm-front-boot/lib/components/Upload';
import ComUpload from '@/routes/components/ComUpload';

import { Header, Content } from 'components/Page';
import { Button as PermissionButton } from 'components/Permission';
import { createPagination, getUserOrganizationId, getResponse } from 'utils/utils';
import hocRemote from 'utils/remote';
import intl from 'utils/intl';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import { DETAIL_DEFAULT_CLASSNAME, DETAIL_CARD_CLASSNAME } from 'utils/constants';
import { openTab } from 'utils/menuTab';
import { routerRedux } from 'dva/router';
import { PRIVATE_BUCKET } from 'srm-front-boot/lib/utils/config';
import { checkPermission } from 'services/api';
import { rollbackToSupplier } from '@/services/contractChapterService';
import { getExtractConfig } from '@/services/workspaceService';
import { allSignList, linkList } from '@/utils/util';
import PreferentialRule from '@/routes/components/PreferentialRule';
import { checkOrderSignContract as checkOrderSign } from '@/utils/commonCheck';

import ContractHeader from '../../components/ContractHeader';
// import Iconfont from '../../components/Icons'; // 下载至本地的icon
// eslint-disable-next-line import/no-named-as-default
import ContractSubject from '../../components/ContractSubject';
import ContractStage from '../../components/ContractStage';
import ContractPartner from '../../components/ContractPartner';
import ContractBusinessTerms from '../../components/ContractBusinessTerms';
import ContractRebate from '../../components/ContractRebate';
import OperationRecordDrawer from '../../components/OperationRecordDrawer';
import EditorOnline from '../../components/EditorOnline';
import Attachment from '../../components/Upload';
import TextComparisonModal from '../../components/TextComparisonModal';
import ValidateModal from './ValidateModal';
import styles from './index.less';
import ApproveRecord from '../../components/ApproveRecord';
import ContractReplenish from '../../components/ContractReplenish';
import SealModal from './SealModal';
import RollBackModal from './RollBackModal';
import PrivacyStatement from './PrivacyStatement';

const { Link } = Anchor;
const { TabPane } = Tabs;
const commonViewMessage = 'spcm.common.view.message.title';
const messagePrompt = 'spcm.contractChapter.view.message';
const buttonPrompt = 'spcm.contractChapter.view.button';
const CONTRACT_CHAPTER = 'srm.pc-admin.pc-purchaser.chapter';

class Detail extends Component {
  constructor(props) {
    super(props);
    const {
      location: { search, hash },
    } = this.props;
    const { pcHeaderId, companyId } = queryString.parse(search.substr(1));
    this.state = {
      hash,
      pcHeaderId,
      companyId,
      currentPic: 0,
      headerInfo: {}, // 头form数据源
      listDataSource: [], // 表格数据源
      headerFetchedFlag: false, // 锚点
      isClearListCacheDataSource: true, // 是否清除表格缓存数据源
      operationRecordVisible: false,
      mobileModalVisible: false, // 获取验证码模态框
      partnerDataSource: [], // 合作伙伴数据
      partnerPagination: {}, // 合作伙伴分页
      pcStageDataSource: [],
      partnerSelectedRows: [],
      pcSubjectDataSource: [],
      pcSubjectPagination: {},
      pcSubjectSelectedRows: [],
      pcStagePagination: {},
      termDataSource: [],
      termPagination: {},
      termSelectedRows: [],
      templateList: [],
      picDataSource: [], // 印章图片
      focusStatus: '', // 选中印章图片标识
      sealId: '', // 选中印章图片ID
      signatureId: '', // 选中印章标识
      chapterFlag: true, // 是否已经盖章
      templateListFlag: false,
      activeKey: 'contractSubjectInfo', // tab切换
      verifyPhoneNum: '',
      sealType: undefined, // 协议签署套餐类型
      rollBackVisible: false, // 退回弹框
      rollbackPermission: false, // 退回至供应商按钮权限
      statementVisible: false, // 隐私声明弹窗
      rollbackToSupplierLoading: false, // 返回供应商loading
      cuxLoading: false, // 二开loading
      enabledSmartOrOnlineFlag: false, // 启用智能合同
    };
    this.maintainContentRef = React.createRef();
    this.partnerRef = React.createRef();
    this.pcSubjectRef = React.createRef();
    this.pcStageRef = React.createRef();
    this.termRef = React.createRef();
    this.editorOnlineRef = React.createRef();
  }

  async componentDidMount() {
    const { pcHeaderId } = this.state;
    if (pcHeaderId && isNumber(+pcHeaderId)) {
      this.fetchList();
      this.fetchPermission();
      const sealType = await this.fetchSealType();
      this.setState({ sealType }, () => {
        this.fetchHeader();
      });
    }
    this.fetchConfigSetting();
  }

  getSnapshotBeforeUpdate() {
    const { headerInfo, headerFetchedFlag } = this.state;
    if (
      !headerFetchedFlag &&
      headerInfo.editStep === 1 &&
      !['ATTACHMENT_FRAMEWORK', 'ATTACHMENT'].includes(headerInfo.pcKindCode)
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

  // 获取权限集
  @Bind()
  fetchPermission() {
    // 权限code
    const permissionList = [
      'srm.pc-admin.pc-purchaser.chapter.button.back.supplier.button', // 退回至供应商
    ];
    checkPermission(permissionList).then((res) => {
      if (getResponse(res)) {
        this.setState({
          rollbackPermission: res[0].approve,
        });
      }
    });
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
   * 获取印章图片
   */
  @Bind()
  fetchSealPictures(headerInfo) {
    const { dispatch, remote } = this.props;
    const {
      companyId,
      sealType,
      // headerInfo: { pcKindCode },
    } = this.state;
    const { pcKindCode } = headerInfo;
    const fetchPictures = () =>
      dispatch({
        type: 'contractChapter/fetchSealPictures',
        payload: {
          lovCode: 'SPFM.COMPANY_SEAL',
          companyId,
          tenantId: getUserOrganizationId(),
          sealType,
        },
      });
    const response = remote
      ? remote.process('SPCM_CONTRACT_CHAPTER_DETAIL_FETCH_SEAL_PICTURES_URL', fetchPictures, {
          companyId,
          headerInfo,
        })
      : fetchPictures();
    if (!response || !response.then) return;
    response.then((res) => {
      if (res) {
        const picDataSource = res.filter((item) => {
          return item.sealFileUrl !== null && item.enabledFlag !== 0;
        });
        this.setState({
          picDataSource,
        });
        if (
          !['ATTACHMENT_FRAMEWORK', 'ATTACHMENT'].includes(pcKindCode) &&
          picDataSource.length > 0
        ) {
          const eachPicDom = document.getElementsByClassName('eachPic')[0];
          if (eachPicDom) {
            const imgHeight = eachPicDom.clientWidth;
            this.setState({ imgHeight });
          }
        }
      }
    });
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
   * fetchHeader - 查询头明细数据
   */
  @Bind()
  fetchHeader() {
    const { dispatch, remote } = this.props;
    const { pcHeaderId, companyId, sealType } = this.state;
    const payload = {
      pcHeaderId,
      companyId,
      customizeUnitCode: 'SPCM.PURCHASE_CONTRACT_MAINTAIN.DETAIL.READONLY',
    };
    if (sealType) {
      payload.authType = sealType;
    }
    dispatch({
      type: 'contractChapter/fetchHeader',
      payload,
    }).then((res) => {
      if (res) {
        this.handleFetchConfigAttachment();
        let chapterFlag = ['APPROVED', 'CONFIRMED', 'PURCHASER_SIGN_CONTRACT'].includes(
          res?.pcStatusCode
        );
        if (remote) {
          // src-37405 伊品生物埋点
          chapterFlag = remote.process('SPCM_CONTRACT_CHAPTER_DETAIL_CHAPTERFLAG', chapterFlag, {
            current: this,
            headerInfo: res,
          });
        }
        if (!isEmpty(sealType)) {
          this.fetchSealPictures(res);
        }
        this.setState({ headerInfo: res }, () => {
          this.setState({
            headerFetchedFlag: true,
            chapterFlag,
          });
        });
        if (res.rebateFlag) {
          this.fetchContractRebate();
        }
      }
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
   * 刷新头信息和附件列表
   */
  @Bind()
  handleRefresh() {
    this.fetchHeader();
    this.handleFetchConfigAttachment();
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
      headerInfo: { companyId },
    } = this.state;
    dispatch(
      routerRedux.push({
        pathname: `/spcm/contract-chapter/detail`,
        search: pcHeaderId ? queryString.stringify({ pcHeaderId, companyId }) : null,
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
   * 查询操作记录列表
   * @param {Object} fields 查询字段
   */
  @Bind()
  handleOperationRecordSearch(page = {}) {
    const { dispatch } = this.props;
    const { pcHeaderId } = this.state;
    dispatch({
      type: 'contractChapter/fetchOperationRecordList',
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
  handleChangeSelection(selectedRows, field) {
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
   * handleClickImg 印章点击样式改变
   * @param {string} index
   */
  @Bind()
  handleClickImg(index) {
    const { focusStatus, picDataSource } = this.state;
    this.setState({
      focusStatus: focusStatus === index + 1 ? '' : index + 1,
      sealPictureUrl: picDataSource[index].sealPictureUrl,
      sealId: picDataSource[index].sealId,
      signatureId: picDataSource[index].signatureId,
    });
  }

  /**
   * handleClickSeal 点击用章 非手机验证签章
   */
  @Bind()
  async handleClickSeal() {
    const { dispatch, remote } = this.props;
    const {
      pcHeaderId,
      sealPictureUrl,
      sealId,
      signatureId,
      companyId,
      sealType,
      headerInfo: { mobileVerifyFlag, supplierCompanyId, silentSealFlag },
    } = this.state;

    const notAllowedFlag = this.checkOrderSignContract();
    if (notAllowedFlag) {
      return;
    }
    if (remote?.event) {
      const res = await remote.event.fireEvent('handleCuxClickSeal', { current: this });
      if (!res) {
        return;
      }
    }
    if (mobileVerifyFlag && sealType === 'ESIGN') {
      dispatch({
        type: 'contractCommon/fetchVerifyPhoneNum',
        payload: {
          authType: sealType,
          companyId,
          supplierCompanyId,
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
        type: 'contractChapter/confirmChapter',
        payload: {
          pcHeaderId,
          sealPictureUrl,
          sealId,
          signatureId,
          companyId,
          signCamp: 'P',
          authType: sealType,
        },
      }).then((res) => {
        if (res) {
          notification.success();
          // this.goToContractOnlineEdit('#spcm-contract-sign-detail-contract-online-edit');
          if (res.sealLink || silentSealFlag === '1') {
            // 静默签:silentSealFlag === "1" 回到列表页
            if (res.sealLink) {
              window.open(res.sealLink);
            }
            this.setState({ statementVisible: false });
            dispatch(
              routerRedux.push({
                pathname: `/spcm/contract-chapter/list`,
              })
            );
          } else {
            this.setState({ chapterFlag: false });
            this.fetchHeader();
            setTimeout(() => {
              if (this.editorOnlineRef?.fetchEditorOnlineHTML) {
                // eslint-disable-next-line no-unused-expressions
                this.editorOnlineRef?.fetchEditorOnlineHTML();
              }
            }, 0);
          }
        }
      });
    }
  }

  /**
   * 关闭手机验证modal
   */
  @Bind()
  handleCloseModal() {
    this.setState({
      mobileModalVisible: false,
    });
    this.modalForm.resetFields();
  }

  /**
   * 获取手机验证码
   */
  @Bind()
  getVerifyCode() {
    const { dispatch } = this.props;
    const {
      companyId,
      headerInfo: { certificateResId, pcHeaderId },
    } = this.state;
    const mobile = this.modalForm.getFieldValue('mobile');
    this.modalForm.validateFields(['mobile'], (err) => {
      if (!err) {
        dispatch({
          type: 'contractChapter/getVerifyCode',
          payload: {
            companyId,
            mobile,
            certificateResId,
            pcHeaderId,
          },
        });
      }
    });
  }

  /**
   * 确认手机验证并签章
   */
  @Bind()
  async handleOk(values = {}) {
    const { dispatch, remote } = this.props;
    const {
      pcHeaderId,
      sealPictureUrl,
      sealId,
      signatureId,
      companyId,
      sealType,
      headerInfo: { certificateResId, silentSealFlag },
    } = this.state;
    if (remote?.event) {
      const res = await remote.event.fireEvent('handleCuxValidatePhone', { current: this, values });
      if (!res) {
        return;
      }
    }
    if (!isEmpty(values)) {
      dispatch({
        type: 'contractChapter/confirmMobileChapter',
        payload: {
          pcHeaderId,
          companyId,
          sealPictureUrl,
          sealId,
          signatureId,
          signCamp: 'P',
          authType: sealType,
          certificateResId,
          ...values,
        },
      }).then((res) => {
        if (res) {
          this.handleCloseModal();
          notification.success();
          // this.goToContractOnlineEdit('#spcm-contract-sign-detail-contract-online-edit');
          if (res.sealLink || silentSealFlag === '1') {
            // 静默签:silentSealFlag === "1" 回到列表页
            if (res.sealLink) {
              window.open(res.sealLink);
            }
            dispatch(
              routerRedux.push({
                pathname: `/spcm/contract-change/list`,
              })
            );
          } else {
            this.setState({ chapterFlag: false });
            this.fetchHeader();
            setTimeout(() => {
              if (this.editorOnlineRef?.fetchEditorOnlineHTML) {
                // eslint-disable-next-line no-unused-expressions
                this.editorOnlineRef?.fetchEditorOnlineHTML();
              }
            }, 0);
          }
        }
      });
    }
  }

  /**
   * 点击按钮图片移动
   */
  @Bind()
  goToPictureSign(type) {
    const { currentPic, imgHeight } = this.state;
    this.setState({
      currentPic: type === 'up' ? currentPic - (imgHeight + 16) : currentPic + (imgHeight + 16),
    });
  }

  /**
   * 跳转到印章管理
   */
  @Bind()
  skipToSealManage() {
    openTab({
      key: '/spfm/seal-mange',
      title: 'srm.bg.manager.seal.manage',
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

  @Bind()
  handleControlComparison() {
    const { textComparisonVisible } = this.state;
    this.setState({ textComparisonVisible: !textComparisonVisible });
  }

  /**
   * 退回弹框
   */
  @Bind()
  handleControlModal(rollBackType) {
    const notAllowedFlag = this.checkOrderSignContract();
    if (notAllowedFlag) {
      return;
    }
    const rollBackDs = () => ({
      fields: [
        {
          name: 'backReason',
          type: 'string',
          label: intl.get('spcm.purchaseContractView.pb.returnCause').d('退回原因'),
        },
      ],
    });
    const RollBackDs = new DataSet(rollBackDs());
    ModalPro.open({
      drawer: true,
      title: intl.get('hzero.common.button.rollback').d('退回'),
      children: <RollBackModal ds={RollBackDs} />,
      style: {
        width: 380,
      },
      onOk: async () => {
        const { dispatch, history } = this.props;
        const { pcHeaderId } = this.state;
        const pcHeaderIds = [pcHeaderId];
        if (rollBackType === 'supplier') {
          this.setState({ rollbackToSupplierLoading: true });
          rollbackToSupplier({
            pcHeaderIds,
            backReason: RollBackDs.toData()[0]?.backReason,
          }).then((res) => {
            if (getResponse(res)) {
              notification.success();
              history.push('/spcm/contract-chapter/list');
            }
            this.setState({ rollbackToSupplierLoading: false });
          });
        } else {
          dispatch({
            type: 'contractChapter/rollbackContract',
            payload: {
              pcHeaderIds,
              backReason: RollBackDs.toData()[0]?.backReason,
            },
          }).then((res) => {
            if (getResponse(res)) {
              notification.success();
              history.push('/spcm/contract-chapter/list');
            }
          });
        }
      },
    });
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
        // 启用智能合同
        enabledSmartOrOnlineFlag: enableOnlineAttachmentContract || enableSmartContract,
      });
    }
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
      mobileChapterLoading = false,
      chapterLoading = false,
      rollbackLoading,
      global,
      remote,
    } = this.props;
    const {
      templateList = [],
      headerInfo = {},
      picDataSource = [],
      focusStatus,
      currentPic,
      chapterFlag,
      templateListFlag,
      rollbackPermission,
      rollbackToSupplierLoading,
      cuxLoading,
      enabledSmartOrOnlineFlag,
    } = this.state;
    const {
      attachmentUuid,
      supplierAttachmentUuid,
      signatureType,
      electricSignFlag,
      authType,
      electronicSignatureAttachmentDisplayFlag,
      pcStatusCode,
    } = headerInfo;
    // 创建签署任务失败
    const createSignTaskFailedFlag = pcStatusCode === 'CREATE_SIGNING_TASK_FAILED';
    const { search = {} } = location;
    const { pcHeaderId = headerInfo.pcHeaderId } = queryString.parse(search.substr(1));
    const { menuLeafNode } = global;
    const sealMenuFlag = menuLeafNode.some((item) => {
      return item.path === '/spfm/seal-mange';
    });
    const attachmentProps = {
      remote,
      accept: '.docx',
      fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      headerInfo,
      templateList,
      supplierAttachmentUuid,
      attachmentUUID: attachmentUuid,
      onFetchHeader: this.fetchHeader,
      isTemplateContract: true,
      supplierParams: { supplierViewFlag: true },
      showRemoveIcon: false,
      onRefresh: this.handleFetchConfigAttachment,
    };
    const uploadProps = {
      viewOnly: true,
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: 'purchaser-attachment',
      btnText: intl.get('spcm.common.view.spcm.btn.purchaserAttachment').d('采购方附件'),
      title: intl.get('spcm.common.view.spcm.btn.purchaserAttachment').d('采购方附件'),
      attachmentUUID: headerInfo.purchaserAttachmentUuid,
    };
    const sealModalProps = {
      remote,
      headerInfo,
      cuxLoading,
      mobileChapterLoading,
      picDataSource,
      sealMenuFlag,
      chapterLoading,
      focusStatus,
      chapterFlag,
      currentPic,
      onRef: (node) => {
        this.sealModalRef = node;
      },
      onModalOk: this.handleClickSeal,
      onSkipToSealManage: this.skipToSealManage,
      onHandleClickImg: this.handleClickImg,
      onGoToPictureSign: this.goToPictureSign,
    };
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
    const isAttachmentSignUpload =
      signatureType === 'ANNEX_SIGNATURE' &&
      electricSignFlag === 1 &&
      allSignList.includes(authType); // 是否附件签章
    const isAttachmentSignAndText =
      (signatureType === 'TEXT_AND_ANNEX_SIGNATURE' &&
        electricSignFlag === 1 &&
        allSignList.includes(authType)) ||
      electronicSignatureAttachmentDisplayFlag === 'Y'; // 是否附件签章
    // 文本签章
    const isTextSignFlag =
      signatureType === 'TEXT_SIGNATURE' &&
      electricSignFlag === 1 &&
      ['ATTACHMENT_FRAMEWORK', 'ATTACHMENT'].includes(headerInfo.pcKindCode) &&
      !enabledSmartOrOnlineFlag; // 不在智能合同提取且不在附件合同在线编辑配置表

    const rollbackSupplier = (
      <Menu>
        <Menu.Item>
          <a onClick={() => this.handleControlModal('purchaser')}>
            {intl.get('spcm.common.button.rollback.purchaser').d('退回至采购方拟制')}
          </a>
        </Menu.Item>
        <Menu.Item>
          <a onClick={() => this.handleControlModal('supplier')}>
            {intl.get('spcm.common.button.rollback.supplier').d('退回至供应商签署')}
          </a>
        </Menu.Item>
      </Menu>
    );

    const buttons = [
      pcHeaderId &&
        (isAttachmentSignUpload || isAttachmentSignAndText || isTextSignFlag) &&
        (linkList.includes(authType) ? (
          <Button
            key="chapter"
            type="primary"
            loading={mobileChapterLoading || chapterLoading || cuxLoading}
            onClick={this.handleClickSeal}
          >
            {intl.get(`${buttonPrompt}.chapter`).d('用章')}
          </Button> // 11.12迭代暂不处理签章逻辑的声明
        ) : (
          <SealModal key="signChapter" {...sealModalProps}>
            {intl.get(`${buttonPrompt}.chapter`).d('用章')}
          </SealModal>
        )),
      !isEmpty(headerInfo) && (isAttachmentSignUpload || isAttachmentSignAndText) && (
        <Button key="electricSignAttachment" className={styles.purchaseHeaderNumber}>
          <ComUpload viewOnly {...electricSignAttachmentProps} />
        </Button>
      ),
      !isEmpty(headerInfo) && templateListFlag && <Attachment {...attachmentProps} />,
      pcHeaderId && (
        <PermissionButton
          key="attachment"
          permissionList={[
            {
              code: 'srm.pc-admin.pc-purchaser.chapter.ps.attachment',
              type: 'button',
              meaning: '采购方附件',
            },
          ]}
          className={styles.purchaseHeaderNumber}
        >
          <Upload {...uploadProps} />
        </PermissionButton>
      ),
      <Button
        icon="clock-circle-o"
        key="operating"
        onClick={() => this.handleModalVisible('operationRecordVisible', true, { pcHeaderId })}
      >
        {intl.get(`hzero.common.button.operating`).d('操作记录')}
      </Button>,
      chapterFlag &&
        (headerInfo.electricSignOrder === 'PURCHASE_FIRST' ||
          !rollbackPermission ||
          createSignTaskFailedFlag) && (
          <Tooltip title={intl.get('spcm.common.button.rollback.purchaser').d('退回至采购方拟制')}>
            <PermissionButton
              icon="rollback"
              key="purchaserBack"
              loading={
                rollbackLoading ||
                queryingHeader ||
                queryingPartner ||
                queryingSubject ||
                queryingStage ||
                queryingTerm
              }
              disabled={!pcHeaderId || isEmpty(headerInfo)}
              onClick={() => this.handleControlModal('purchaser')}
              permissionList={[
                {
                  code: 'srm.pc-admin.pc-purchaser.chapter.ps.back.button',
                  type: 'button',
                  meaning: '退回',
                },
              ]}
            >
              {intl.get('hzero.common.button.rollback').d('退回')}
            </PermissionButton>
          </Tooltip>
        ),
      chapterFlag &&
        headerInfo.electricSignOrder === 'SUPPLIER_FIRST' &&
        !createSignTaskFailedFlag && (
          <PermissionButton
            key="rollback"
            loading={
              queryingHeader || queryingPartner || queryingSubject || queryingStage || queryingTerm
            }
            disabled={!pcHeaderId || isEmpty(headerInfo)}
            permissionList={[
              {
                code: 'srm.pc-admin.pc-purchaser.chapter.button.back.supplier.button',
                type: 'button',
                meaning: '退回至供应商签署',
              },
            ]}
            funcType="link"
            type="c7n-pro"
          >
            <Dropdown overlay={rollbackSupplier} trigger={['hover']}>
              <Button
                loading={rollbackLoading || rollbackToSupplierLoading}
                icon="rollback"
                style={{ marginLeft: '8px' }}
              >
                {intl.get('hzero.common.button.rollback').d('退回')}
                <Icon type="down" />
              </Button>
            </Dropdown>
          </PermissionButton>
        ),
      !isEmpty(headerInfo) &&
        !isAttachmentSignUpload &&
        !['ATTACHMENT_FRAMEWORK', 'ATTACHMENT'].includes(headerInfo.pcKindCode) && (
          <PermissionButton
            key="textComparison"
            permissionList={[
              {
                code: 'srm.pc-admin.pc-purchaser.chapter.ps.text.comparison',
                type: 'button',
                meaning: '文本对比',
              },
            ]}
            onClick={this.handleControlComparison}
          >
            {intl.get('spcm.common.view.title.textComparison').d('文本对比')}
          </PermissionButton>
        ),
    ].filter(Boolean);

    const buttonList = remote
      ? remote.process('SPCM_CONTRACT_CHAPTER_DETAIL_HEADER_BUTTONS', buttons, {
          current: this,
          rollbackSupplier,
        })
      : buttons;
    return (
      <Header
        title={intl.get(`${messagePrompt}.title.contractChapter`).d('协议用章')}
        backPath="/spcm/contract-chapter/list"
      >
        {buttonList}
      </Header>
    );
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
          .get('spcm.common.view.message.chapterFDD')
          .d('点击"用章"，在法大大中执行选章签署操作');
      case 'QYS':
      case 'QYS_SAAS':
        return intl
          .get('spcm.common.view.message.chapterQYS')
          .d('点击"用章"，在契约锁中执行选章签署操作');
      default:
        return intl
          .get('spcm.common.view.message.chapterESIGN')
          .d('点击"用章"，在E签宝中执行选章签署操作');
    }
  };

  render() {
    const {
      form,
      location,
      dispatch,
      deletingLines,
      queryingHeader = false,
      queryingPartner = false,
      queryingSubject = false,
      queryingStage = false,
      queryingTerm = false,
      mobileChapterLoading = false,
      chapterLoading = false,
      rollbackLoading,
      global,
      customizeForm,
      customizeTable,
      custLoading,
      contractCommon: { configSetting = {} },
      remote,
    } = this.props;
    const {
      sealType,
      isClearListCacheDataSource,
      operationRecordVisible,
      pcSubjectDataSource = [],
      pcStageDataSource = [],
      pcSubjectPagination = {},
      pcStagePagination = {},
      pcSubjectSelectedRows = [],
      partnerDataSource = [],
      partnerPagination = {},
      partnerSelectedRows = [],
      headerInfo = {},
      termPagination = {},
      termDataSource = [],
      termSelectedRows = [],
      picDataSource = [],
      focusStatus,
      mobileModalVisible,
      currentPic,
      imgHeight,
      chapterFlag,
      activeKey,
      pcRebateDataSource = [],
      pcRebatePagination = {},
      textComparisonVisible,
      verifyPhoneNum = '',
      rollBackVisible,
      cuxLoading,
    } = this.state;
    const {
      prStatusCode,
      rebateFlag,
      supplementFlag,
      signatureType,
      electricSignFlag,
      authType,
      // contractValidation = '',
      sealShowFlag, // 美亚特别的字段
      electronicSignatureAttachmentDisplayFlag,
      enableRule,
      pcNum,
      version,
    } = headerInfo;
    const { search = {} } = location;
    const {
      prSourcePlatform = headerInfo.prSourcePlatform,
      pcHeaderId = headerInfo.pcHeaderId,
    } = queryString.parse(search.substr(1));
    const editable = false;
    const { menuLeafNode } = global;
    const sealMenuFlag = menuLeafNode.some((item) => {
      return item.path === '/spfm/seal-mange';
    });
    /**
     * editable 根据头id
     * dataSource 数据源
     * pagination 分页
     * selectedRowKeys 选中的行
     * onSelectionChange 分页变化回调
     * onSearch 分页改变回调
     * loading 查询状态
     */
    const headerInfoFormProps = {
      remote,
      form,
      purchaseFlag: true, // 是否来自采购方
      prSourcePlatform,
      editable,
      customizeForm,
      dataSource: headerInfo,
    };
    const contractSubjectListProps = {
      remote,
      editable,
      customizeTable,
      loading: queryingSubject,
      showOperationLadderQuote: true, // 是否加载阶梯价格弹窗模块
      pagination: pcSubjectPagination,
      dataSource: pcSubjectDataSource,
      onSearch: this.fetchPartner,
      onSelectionChange: this.handleChangeSelection,
      selectedRows: pcSubjectSelectedRows,

      ref: this.partnerRef,
      onPrePaginationChange: this.fetchSubject,
      dispatch,
      headerInfo,
      prStatusCode,
      prSourcePlatform,
      deletingLines,
      isClearListCacheDataSource,
      fetchList: this.fetchPartner,
      setDataSource: this.setItemInfoListDataSource,
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

      ref: this.partnerRef,
      dispatch,
      headerInfo,
      prStatusCode,
      prSourcePlatform,
      deletingLines,
      isClearListCacheDataSource,
      fetchList: this.fetchPartner,
      setDataSource: this.setItemInfoListDataSource,
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

      ref: this.termRef,
      isClearListCacheDataSource,
      fetchList: this.fetchPartner,
      setDataSource: this.setItemInfoListDataSource,
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

    const validateModalProps = {
      cuxLoading,
      verifyPhoneNum,
      mobileModalVisible,
      mobileChapterLoading,
      onClose: this.handleCloseModal,
      onModalOk: this.handleOk,
      onRef: (node) => {
        this.modalForm = node.props.form;
      },
      getVerifyCode: this.getVerifyCode,
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

    const rollBackProps = {
      rollbackLoading,
      visible: rollBackVisible,
      onOk: (values) => this.handleRollback(values.backReason),
      onCancel: this.handleControlModal,
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
          handleOk={this.handleClickSeal}
          authType={authType}
          loading={mobileChapterLoading || chapterLoading || cuxLoading}
        />
      </Modal>
    );
    return (
      <Fragment>
        {this.renderHeaderButton()}

        <Content>
          <div id="spcm-contract-sign-detail-content-inner-wrapper">
            <Spin
              spinning={queryingHeader || queryingPartner || queryingSubject || queryingTerm}
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
                          .get(`${commonViewMessage}.contractHeaderInformation`)
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
                          tab={intl.get(`${commonViewMessage}.contractSubject`).d('协议标的')}
                          key="contractSubjectInfo"
                        >
                          <ContractSubject {...contractSubjectListProps} />
                        </TabPane>
                        <TabPane
                          tab={intl.get(`${commonViewMessage}.contractStage`).d('协议阶段')}
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
                      key="contractPartnerInformation"
                      id="spcm-maintain-detail-contract-partner"
                      bordered={false}
                      className={DETAIL_CARD_CLASSNAME}
                      title={
                        <h3>
                          {intl
                            .get(`${commonViewMessage}.contractPartnerInformation`)
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
                      id="spcm-contract-chapter-detail-approve-record"
                      bordered={false}
                      className={DETAIL_CARD_CLASSNAME}
                      title={
                        <h3>
                          {intl.get(`${commonViewMessage}.approveRecordInformation`).d('审批记录')}
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
                    !['ATTACHMENT_FRAMEWORK', 'ATTACHMENT'].includes(headerInfo.pcKindCode) &&
                    !isAttachmentSignUpload && (
                      <Card
                        key="contractOnlineEdit"
                        id="spcm-contract-sign-detail-contract-online-edit"
                        bordered={false}
                        className={DETAIL_CARD_CLASSNAME}
                        title={
                          <h3>
                            {intl.get(`spcm.common.title.contractOnlineEdit`).d('采购协议文本编辑')}
                          </h3>
                        }
                      >
                        <Row>
                          <Col span={(!sealShowFlag ? !isAttachmentSignAndText : false) ? 21 : 24}>
                            {!isEmpty(headerInfo) && (
                              <EditorOnline
                                iframeStyle={{
                                  width: '100%',
                                  height: `${(document?.body?.clientHeight - 96) * 0.9}px`,
                                }}
                                onRef={(node) => {
                                  this.editorOnlineRef = node;
                                }}
                                menuCode={CONTRACT_CHAPTER}
                                pcHeaderId={pcHeaderId}
                                headerInfo={headerInfo}
                                permissionCode={
                                  sealShowFlag === 'meyerSignatureFlag' ? 'EDIT' : null
                                }
                              />
                            )}
                          </Col>
                          {sealShowFlag === 'meyerSignatureFlag' && (
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
                                  type="primary"
                                  loading={mobileChapterLoading || chapterLoading || cuxLoading}
                                  onClick={this.handleClickSeal}
                                  style={{ width: '80%' }}
                                  disabled={!chapterFlag}
                                >
                                  {intl.get(`${buttonPrompt}.chapter`).d('用章')}
                                </Button>
                              </div>
                            </Col>
                          )}
                          {(!sealShowFlag ? !isAttachmentSignAndText : false) &&
                            !linkList.includes(sealType) && (
                              <Col span={3}>
                                {picDataSource.length > 0 ? (
                                  <div
                                    className={styles.signet}
                                    style={{ marginTop: picDataSource.length > 3 ? 0 : '-16px' }}
                                  >
                                    <Button
                                      disabled={!currentPic}
                                      onClick={() => this.goToPictureSign('up')}
                                      style={{
                                        display: picDataSource.length > 3 ? 'block' : 'none',
                                        width: imgHeight,
                                      }}
                                    >
                                      <Icon type="up" />
                                    </Button>
                                    <div
                                      className="img-box"
                                      style={{ maxHeight: (imgHeight + 16) * 3 }}
                                    >
                                      {picDataSource.map((el, index) => (
                                        <div
                                          key={el.sealId}
                                          className="eachPic"
                                          style={{ bottom: `${currentPic}px`, height: imgHeight }}
                                        >
                                          <img
                                            src={el.sealFileUrl}
                                            title={el.sealName}
                                            alt={el.sealName}
                                            onClick={() => this.handleClickImg(index)}
                                          />
                                          <Icon
                                            type="check-circle-o"
                                            style={{
                                              display: focusStatus === index + 1 ? 'block' : 'none',
                                            }}
                                          />
                                        </div>
                                      ))}
                                    </div>
                                    <Button
                                      type="primary"
                                      loading={mobileChapterLoading || chapterLoading || cuxLoading}
                                      onClick={this.handleClickSeal}
                                      style={{ marginBottom: 16, marginTop: 16, width: imgHeight }}
                                      disabled={!focusStatus || !chapterFlag}
                                    >
                                      {intl.get(`${buttonPrompt}.chapter`).d('用章')}
                                    </Button>
                                    <Button
                                      onClick={() => this.goToPictureSign('down')}
                                      disabled={
                                        currentPic >=
                                        picDataSource.length * (imgHeight + 16) -
                                          ((imgHeight + 16) * 3 + 16)
                                      }
                                      style={{
                                        display: picDataSource.length > 3 ? 'block' : 'none',
                                        marginBottom: 0,
                                        width: imgHeight,
                                      }}
                                    >
                                      <Icon type="down" />
                                    </Button>
                                  </div>
                                ) : (
                                  <div className={styles.noSealImg}>
                                    <p>
                                      {intl
                                        .get(`${commonViewMessage}.goChapter`)
                                        .d('您尚未设置印章，请前往')}
                                      {sealMenuFlag ? (
                                        <strong onClick={this.skipToSealManage}>
                                          {intl
                                            .get(`${commonViewMessage}.companyChapter`)
                                            .d('集团管理-印章管理')}
                                        </strong>
                                      ) : (
                                        <span>
                                          {intl
                                            .get(`${commonViewMessage}.companyChapter`)
                                            .d('集团管理-印章管理')}
                                        </span>
                                      )}
                                      {intl
                                        .get(`${commonViewMessage}.setChapter`)
                                        .d('功能设置您的签署印章。')}
                                    </p>
                                  </div>
                                )}
                              </Col>
                            )}
                          {/* 法大大/契约锁签章只需要一个按钮跳转外部 */}
                          {!(isAttachmentSignUpload || isAttachmentSignAndText) &&
                            linkList.includes(sealType) && (
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
                                  type="primary"
                                  loading={mobileChapterLoading || chapterLoading || cuxLoading}
                                  // onClick={() => {
                                  //   this.setState({ statementVisible: true });
                                  // }}
                                  // 11.12迭代暂不处理签章逻辑的声明
                                  onClick={this.handleClickSeal}
                                  style={{
                                    marginLeft: 25,
                                    marginTop: 15,
                                    width: '80%',
                                    height: 30,
                                  }}
                                >
                                  {intl.get(`${buttonPrompt}.chapter`).d('用章')}
                                </Button>
                              </Col>
                            )}
                        </Row>
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
                        title={intl.get(`${commonViewMessage}.basicInformation`).d('基本信息')}
                      />
                      <Link
                        href="#spcm-maintain-detail-contract-subject"
                        title={intl.get(`${commonViewMessage}.subjectInformation`).d('标的信息')}
                      />
                      <Link
                        href="#spcm-maintain-detail-contract-partner"
                        title={intl.get(`${commonViewMessage}.partnerInformation`).d('伙伴信息')}
                      />{' '}
                      {pcHeaderId &&
                        !['ATTACHMENT_FRAMEWORK', 'ATTACHMENT'].includes(headerInfo.pcKindCode) && (
                          <Link
                            href="#spcm-maintain-detail-contract-business-terms"
                            title={intl
                              .get(`${commonViewMessage}.businessTermsInformation`)
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
                      {configSetting['010601'] === '1' && (
                        <Link
                          href="#spcm-contract-chapter-detail-approve-record"
                          title={intl
                            .get(`${commonViewMessage}.approveRecordInformation`)
                            .d('审批记录')}
                        />
                      )}
                      {pcHeaderId && !supplementFlag && (
                        <Link
                          href="#spcm-contract-approval-detail-contract-replenish"
                          title={intl.get(`spcm.common.title.contractReplenish`).d('补充协议')}
                        />
                      )}
                      {pcHeaderId &&
                        !['ATTACHMENT_FRAMEWORK', 'ATTACHMENT'].includes(headerInfo.pcKindCode) &&
                        !isAttachmentSignUpload && (
                          <Link
                            href="#spcm-contract-sign-detail-contract-online-edit"
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
        <ValidateModal {...validateModalProps} />
        <OperationRecordDrawer {...operationRecordProps} />
        {textComparisonVisible && <TextComparisonModal {...textComparisonProps} />}
        {rollBackVisible && <RollBackModal {...rollBackProps} />}
        {statementModal}
      </Fragment>
    );
  }
}

const hocFunc = (com) =>
  compose(
    Form.create({ fieldNameProp: null }),
    connect(({ loading, contractChapter, global, contractCommon }) => ({
      queryingHeader: loading.effects['contractCommon/fetchHeader'],
      queryingPartner: loading.effects['contractCommon/fetchPartner'],
      queryingSubject: loading.effects['contractCommon/fetchSubject'],
      queryingStage: loading.effects['contractCommon/fetchStage'],
      queryingTerm: loading.effects['contractCommon/fetchTerm'],
      chapterLoading: loading.effects['contractChapter/confirmChapter'],
      mobileChapterLoading: loading.effects['contractChapter/confirmMobileChapter'],
      rollbackLoading: loading.effects['contractChapter/rollbackContract'],
      contractChapter,
      contractCommon,
      global,
    })),
    formatterCollections({
      code: [
        'spcm.contractChapter',
        'spcm.common',
        'entity.roles',
        'entity.company',
        'entity.business',
        'entity.item',
        'spcm.purchaseRequisitionCreation',
        'spcm.purchaseContractView',
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
    hocRemote(
      {
        code: 'SPCM_CONTRACT_CHAPTER_DETAIL',
        name: 'remote', // 默认 'remote'， 如有属性冲突可以改此属性
      },
      {
        process: {
          SPCM_CONTRACT_CHAPTER_DETAIL_FETCH_SEAL_PICTURES_URL(fun) {
            return fun();
          },
        },
        events: {
          // 用章
          handleCuxClickSeal() {},
          // 手机校验并用章
          handleCuxValidatePhone() {},
          // 选章
          handleCuxClickSealModal() {},
        },
      }
    )
  )(com);
export { Detail, hocFunc };
export default hocFunc(Detail);
