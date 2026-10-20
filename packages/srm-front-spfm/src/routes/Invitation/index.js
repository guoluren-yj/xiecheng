/**
 * disposeInvite 处理邀约
 * @date: 2018-8-23
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.3
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Fragment, createRef } from 'react';
import { connect } from 'dva';
import {
  Form,
  Modal,
  Input,
  Spin,
  Row,
  Col,
  Icon,
  Select,
  Tooltip,
  Dropdown,
  Menu,
} from 'hzero-ui';
import { Modal as C7nModal } from 'choerodon-ui/pro';
import { Button } from 'components/Permission';
import { isEmpty, isFunction, isArray, isUndefined, values, concat, isBoolean, isNil } from 'lodash';
import { Bind } from 'lodash-decorators';
import querystring from 'querystring';
import { getCurrentOrganizationId, getResponse, getCurrentUserId, getUserOrganizationId } from 'utils/utils';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { closeTab } from 'utils/menuTab';
import { Header, Content } from 'components/Page';
import Lov from 'components/Lov';
import remotes from 'utils/remote';
import ValueList from 'components/ValueList';
import Checkbox from 'components/Checkbox';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { downloadFile } from 'hzero-front/lib/services/api';
import NewLov from '@/routes/components/Lov'; // lov父级不可选
import ResultAlert from '@/routes/components/AiApprove/ResultAlert';
import { ReactComponent as IntelligentReviewIcon } from '@/assets/intelligentReview.svg';
import {aiApprove, fetchApproveStatus, queryAiConfig} from "@/services/commonService";
import ReceivedTop from './components/ReceivedTop';
import RegisterTop from './components/RegisterTop';
import ReceivedCerTop from './components/ReceivedCerTop';
import CertificatedTop from './components/CertificatedTop';
import CertifiTop from './components/CertifiTop';
import SendTop from './components/SendTop';
import CompanyInformation from './components/CompanyInformation';
import RegisterInformation from './components/RegisterInformation';
import CompanyForm from './components/CompanyForm';
import HeaderInfo from './components/HeaderInfo';
import Investigation from '../Investigation/Component/Investigation';
import Approval from './components/Approval';
import InvestigatePreview from './components/InvestigatePreview';
// import styles from './index.less';
import SendCusForm from './components/SendCusForm';
import SendAndCerCusForm from './components/SendAndCerCusForm';
import ReceiveCusForm from './components/ReceiveCusForm';
import MultiSelectModal from './components/MultiSelectModal';
import LovMulti from './components/LovMultiple';

const FormItem = Form.Item;
const { TextArea } = Input;
const { confirm } = Modal;
const { Option } = Select;

const currentUserId = getCurrentUserId();

/**
 * 供应商同意邀约
 * @extends {Component} - PureComponent
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {Object} purchaserCooperation - 数据源
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @reactProps {String} organizationId - 租户Id
 * @reactProps {String} textValue - 拒绝邀约的说明
 * @return React.element
 */
@connect(({ disposeInvite, loading, userMessage }) => ({
  disposeInvite,
  Enums: disposeInvite.Enums,
  userMessage,
  loading: loading.effects['disposeInvite/getInvitingInformation']||loading.effects['disposeInvite/withdrawInvite'],
  modalLoading:
    loading.effects['disposeInvite/sendInvestigate'] ||
    loading.effects['disposeInvite/rejectCoop'] ||
    loading.effects['disposeInvite/approveCoop'],
  refuseLoading: loading.effects['disposeInvite/rejectCoop'],
  approvalLoading: loading.effects['disposeInvite/approveCoop'],
  agree: loading.effects['disposeInvite/handleAgree'],
  reject: loading.effects['disposeInvite/handleReject'],
  investigateRejectLoading: loading.effects['disposeInvite/handleInvestigateReject'],
  printLoading:
    loading.effects['disposeInvite/handlePrint'] ||
    loading.effects['disposeInvite/handleExcelPrint'],
  withdrawLoading: loading.effects['disposeInvite/withdrawInvite'],
  organizationId: getCurrentOrganizationId(),
  userOrganizationId: getUserOrganizationId(),
  // saveOperatorInfoLoading: loading.effects['disposeInvite/saveOperatorInfo'],
}))
@Form.create({ fieldNameProp: null })
@formatterCollections({
  code: [
    'spfm.disposeInvite',
    'entity.customer',
    'entity.supplier',
    'spfm.invitationList',
    'spfm.companySearch',
    'spfm.common',
    'spfm.certificateAuthority',
    'spfm.certificationApproval',
    'spfm.enterprise',
    'entity.attachment',
    'spfm.invitationRegister',
    'sslm.operatingRecord',
    'spfm.contactPerson',
    'spfm.supplierRegister',
    'sslm.common',
    'sslm.investCorrelat',
    'sslm.investigCorrelat',
  ],
})
@withCustomize({
  unitCode: [
    'SPFM.PARTNER_INVITE.CUSTOMER_INVITATION_PROCESSING',
    'SPFM.PARTNER_INVITE.CUSTOMER_INVITATION',
    'SPFM.PARTNER_INVITE.INVESTIGATE_REJECT',
    'SPFM.PARTNER_INVITE.INVITE_REFUSE',
    'SPFM.PARTNER_INVITE.APPROVAL_REJECT',
  ],
})
@remotes({
  code: 'SPFM_INVITATION',
  name: 'remote',
}, {
  cuxDidMount:()=>{}, // 二开增加componentDidMount阶段触发的函数
  cuxWillUnmount:()=>{}, // 二开增加componentWillUnmount阶段触发的函数
})
export default class DisposeInvite extends React.Component {
  constructor(props) {
    super(props);
    const { search = {} } = props.history.location;
    const routerParams = querystring.parse(search.substr(1));
    const {
      match: {
        params: { inviteId },
      },
    } = props;
    this.state = {
      inviteId,
      visible: false,
      modalVisible: false,
      saveLoading: false, // 保存按钮loading
      submitLoading: false, // 提交按钮loading
      modalType: 'refuse', // 模态框的类型
      status: routerParams.status, // 邀约的状态
      back: routerParams.back, // 判断返回的参数
      partnerTenantId: routerParams.partnerTenantId,
      pStatus: routerParams.pStatus,
      privacyPolicyClickVisible: true,
      supplierCategoryDate: {}, // 供应商分类数据
      supplierCategoryIdList: [], // 选择的供应商分类数据
      purchaseSelectedRows: [],
      queryInvestgLoading: false,
      queryPurchaseList: [], // 存放接口查询的当前登录人对应的采购员
      defaultBankInfo: {}, // 调查表银行页签默认带值
      platformPolicyText: [], // 平台静态文本
      mergeCompanyId: '',
      verificationPlatFormText: [],
      purchaserDisabled: false, // 采购方点击消息进入不能操作我发给供应商的邀约
      extraLoading: false,
      aiApproveStatus: null,
      reviewIsClick: false, // 记录【智能预审】按钮是否点击了
      showAiApproveFlag: false, // 是否显示智能预审按钮
    };
  }

  timerRef = createRef(null); // 定时器

  timerTime = createRef(0); // 记录轮询次数

  componentDidMount() {
    const {remote} = this.props;
    this.handSendInviteId();
    this.queryCode();
    this.getInvitingInformation();
    // 查询当前登录人对应的采购员
    this.queryCurrentUserPurchaseAgent();
    if (remote && remote.event) {
      remote.event.fireEvent('cuxDidMount', {_this: this});
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const { reviewIsClick } = this.state;
    const { reviewIsClick: prevReviewIsClick } = prevState;
    if (reviewIsClick !== prevReviewIsClick) {
      this.timerRef.current = setInterval(() => this.getAiApproveResult(), 5000);
    }
  }

  componentWillUnmount(){
    const {remote} = this.props;
    if (remote && remote.event) {
      remote.event.fireEvent('cuxWillUnmount', {_this: this});
    }
    this.clearTimerRef();
  }

  // 查询值集
  @Bind()
  queryCode() {
    const { dispatch } = this.props;
    dispatch({ type: 'disposeInvite/fetchEnums' });
    dispatch({ type: 'disposeInvite/queryLifeCycleStage' });
  }

  // 查询当前登录人对应的采购员
  @Bind()
  queryCurrentUserPurchaseAgent() {
    const { dispatch } = this.props;
    dispatch({
      type: 'disposeInvite/queryCurrentUserPurchaseAgent',
    }).then((res) => {
      if (res) {
        this.setState({ purchaseSelectedRows: res, queryPurchaseList: res });
      }
    });
  }

  @Bind()
  handleAiConfig(params){
    queryAiConfig({
      documentType: 'SUPPLIER_INVESTG',
      documentId: params.investgHeaderId,
    }).then(res=>{
      if(res){
        this.setState({showAiApproveFlag: true});
      }
    });
  }

  // 查询供应商分类的数据
  @Bind()
  querySupplierCategoryDate(params) {
    const { dispatch } = this.props;
    dispatch({
      type: `disposeInvite/querySupplierCategoryDate`,
      payload: { ...params },
    }).then((res) => {
      if (res) {
        this.setState({ supplierCategoryDate: res });
      }
    });
  }

  /**
   * 把inviteId传到model里
   */
  @Bind()
  handSendInviteId() {
    const { inviteId } = this.state;
    const { dispatch } = this.props;
    dispatch({ type: 'disposeInvite/updateState', payload: { inviteId } });
  }

  /**
   * 查询调查表审批头信息
   */
  @Bind()
  queryHeadInfo() {
    const { inviteId } = this.state;
    const {
      disposeInvite: {
        [inviteId]: { headerInfo = {} },
      },
      dispatch,
    } = this.props;
    if (!isEmpty(headerInfo) && headerInfo.investgHeaderId) {
      dispatch({
        type: 'disposeInvite/fetchInvestigationHeader',
        payload: {
          investigateHeaderId: headerInfo.investgHeaderId,
          customizeUnitCode: 'SSLM.INVESTIGATION_APPROVAL_DETAIL.HEADER',
        },
      }).then((res) => {
        if (res) {
          this.setState({
            visableSubmitButtons: true,
            aiApproveStatus: res.aiApproveStatus,
          });
        }
      });
    }
  }

  /**
   * 获取邀请信息
   */
  @Bind()
  getInvitingInformation() {
    const { dispatch, match, organizationId, userOrganizationId } = this.props;
    const {
      params: { inviteId },
    } = match;
    dispatch({
      type: 'disposeInvite/getInvitingInformation',
      payload: { inviteId, organizationId },
    }).then((invitingInfo) => {
      if (!isEmpty(invitingInfo)) {
        const {
          investigateTemplateId,
          inviteType,
          processStatus,
          tenantId,
          inviteTenantId,
          companyId,
          inviteCompanyId,
          itemCategorySingleFlag = 0, // srm-133826 多选lov变单选标识拆分控制 1-单选
          purchaseAgentSingleFlag = 0,
          supplierCategorySingleFlag = 0,
        } = invitingInfo;
        const { partnerTenantId, status, back } = this.state;
        // 我收到的邀约，采购方从消息监控进来不能操作自己发出的邀约
        const purchaserDisabled = status === 'received' && back === 'message' && inviteTenantId !== userOrganizationId;
        if (investigateTemplateId) {
          this.fetchHeaderInfo({
            triggerById: inviteId,
            triggerByCode: 'INVITE',
            organizationId,
            customizeUnitCode:
              'SPFM.PARTNER_INVITE.CUSTOMER_INVITATION_PROCESSING,SPFM.PARTNER_INVITE.CUSTOMER_INVITATION,SSLM.INVESTIGATION_WRITE_DETAIL.BASICINFO',
            customizeTenantId: partnerTenantId || tenantId,
          });
        }
        if (inviteType === 'SUPPLIER' || inviteType === 'CUSTOMER') {
          if (
            processStatus === 'INVESTIGATE' ||
            processStatus === 'PENDING' ||
            processStatus === 'REJECT'
          ) {
            // 获取采购方id
            const purchaserId = inviteType === 'SUPPLIER' ? tenantId : inviteTenantId;
            // 获取采购方公司id
            const purchaserCompanyId = inviteType === 'SUPPLIER' ? companyId : inviteCompanyId;
            this.handlePrivacyPolicy(purchaserId, purchaserCompanyId);
            // 查询平台默认静态文本
            this.handlePlatformPolicyText();
          }
        }
        // 采购方同意合作显示供应商填写的分类信息
        const {
          multiSupplierCategoryId = '',
          multiSupplierCategoryDesc = '',
          multiSupplierCategoryDTOS = [],
        } = invitingInfo;

        const itemCategoryFlag = Number(itemCategorySingleFlag); // srm-106903 多选lov变单选标识拆分控制 1-单选
        const purchaseFlag = Number(purchaseAgentSingleFlag);
        const supplierCategoryFlag = Number(supplierCategorySingleFlag);
        this.setState({
          initialSelect: multiSupplierCategoryDTOS || [],
          supplierCategoryCode:
            (multiSupplierCategoryDesc && multiSupplierCategoryDesc.split(',')) || [],
          supplierCategoryIdList:
            (multiSupplierCategoryId && multiSupplierCategoryId.split(',')) || [],
          selectedChildRows: multiSupplierCategoryDTOS || [],
          itemCategoryFlag: itemCategoryFlag === 1,
          purchaseFlag: purchaseFlag === 1,
          supplierCategoryFlag: supplierCategoryFlag === 1,
          purchaserDisabled,
        });
      }
    });
  }

  // /**
  //  * 查询值集
  //  */
  // @Bind()
  // queryValue() {
  //   const { dispatch } = this.props;
  //   dispatch({
  //     type: 'disposeInvite/init',
  //     payload: {
  //       investigateType: 'SSLM.INVESTIGATE_TYPE',
  //     },
  //   });
  // }

  /**
   * 查询调查表头信息
   * @param {String} params.triggerById - 邀约Id
   * @param {String} params.triggerByCode - 邀约编码
   * @param {String} params.organizationId - 租户Id
   */
  fetchHeaderInfo(params) {
    const { dispatch } = this.props;
    dispatch({
      type: 'disposeInvite/fetchHeaderInfo',
      payload: params,
    }).then((res) => {
      if (res) {
        const { processStatus, finalFlag, domesticForeignRelation, partnerCompanyName } = res;
        this.queryHeadInfo(); // 调查表审批头信息
        this.handleAiConfig({investgHeaderId: res.investgHeaderId});
        let defaultBankInfo = {
          domesticForeignRelation,
          partnerCompanyName,
        };
        if (domesticForeignRelation === 1) {
          // 查询默认国家-中国
          dispatch({
            type: 'disposeInvite/getDefaultCountryInfo',
          })
            .then((resp) => {
              if (resp) {
                defaultBankInfo = {
                  ...resp,
                  domesticForeignRelation,
                  partnerCompanyName,
                };
              }
            })
            .finally(() => {
              this.setState({ investigateStatus: processStatus, finalFlag, defaultBankInfo }); // 存储调查表状态
            });
        }
      }
    });
  }

  /**
   * 查询调查表模板信息
   * @param {String} investigateTemplateId - 调查表模板Id
   */
  fetchTemplate(investigateTemplateId) {
    const { dispatch } = this.props;
    if (investigateTemplateId) {
      dispatch({
        type: 'disposeInvite/fetchTemplate',
        payload: { investigateTemplateId },
      });
    }
  }

  /**
   * 获取textarea value
   */
  @Bind()
  getTextValue(e) {
    this.setState({ textValue: e.target.value });
  }

  /**
   * 同意邀约
   */
  @Bind()
  handleAgree(flag = false) {
    const {
      inviteId,
      supplierCategoryIdList,
      supplierCategoryFlag,
      platformPolicyText = [],
      status,
    } = this.state;
    const {
      dispatch,
      organizationId,
      disposeInvite: {
        [inviteId]: { invitingInfo = {}, privacyPolicyText = [] },
      },
      form: { getFieldValue },
      form,
    } = this.props;

    // 是否阅读并同意协议
    const checkedFlag = ((this.policyform&&values(this.policyform.getFieldsValue()))||[]).filter((n) => !n) || [];
    const levelTypeFlag = this.receiveCusForm&&this.receiveCusForm.getFieldValue('levelTypeFlagSupplier');
    form.validateFields((err, formValues) => {
      if (!err) {
        if (isEmpty(checkedFlag)) {
          const {
            purchaseAgentId,
            roleType,
            multiSupplierCategoryId,
            categoryIds,
            ...others
          } = formValues;
          const newMultiSupplierCategoryId = !supplierCategoryFlag
            ? isArray(supplierCategoryIdList)
              ? supplierCategoryIdList.join()
              : null
            : multiSupplierCategoryId;
          // 验证成功
          const payload = {
            ...others,
            organizationId,
            inviteId,
            supplierCategoryIdList,
            purchaseAgentId: getFieldValue('purchaseAgentId'),
            roleType: getFieldValue('roleType'),
            multiSupplierCategoryId: newMultiSupplierCategoryId,
            objectVersionNumber: invitingInfo.objectVersionNumber,
            categoryIds: getFieldValue('categoryIds'),
            levelTypeFlag,
            consentFormProcessor: currentUserId,
          };
          // 我收到的-成为客户待定状态校验
          if(flag){
            // 校验合作伙伴
            const { inviteCompanyId, companyId, inviteTenantId } = invitingInfo;
            const checkData = {
              tenantId: organizationId,
              companyId,
              inviteTenantId,
              inviteCompanyId,
              levelTypeFlag,
            };
            dispatch({
              type: 'disposeInvite/checkPartner',
              payload: checkData,
            }).then((res) => {
              const resFlag = getResponse(res);
              if(isBoolean(resFlag)){
                if(resFlag){
                  // 可以邀约
                  this.handleAgreeCoop(payload);
                }else {
                  // 弹窗提示
                  this.handleTipsPartnerModal(payload, 'inviteCoop');
                }
              }
            });
          }else {
            // 直接合作
            this.handleAgreeCoop(payload);
          }

        } else {
          let allPolicyText = concat(platformPolicyText, privacyPolicyText);
          // 我发出的邀请客户，供应商在填写时不校验平台预制的静态文本协议
          if(status === 'send' && invitingInfo.inviteType === 'CUSTOMER'){
            allPolicyText = privacyPolicyText;
          }
          this.setState({verificationPlatFormText: allPolicyText.filter(n => !this.policyform.getFieldValue(`policy${n.textId}`))}, ()=>{
           this.handlePolicyModal(this.state.verificationPlatFormText[0]);
         });
        }
      }
    });
  }

  /**
   * 同意邀约
   */
   @Bind()
   handleAgreeCoop(payload = {}) {
     const {
       dispatch,
     } = this.props;
     dispatch({
      type: 'disposeInvite/approveCoop',
      payload,
    }).then(res => {
      if (res) {
        this.handleCancel();
        notification.success({
          message: intl
            .get(`spfm.disposeInvite.message.agreeToInvite`)
            .d('您已同意该合作邀约'),
        });
        this.handleCloseTab();
      }
    });
   }

  /**
   * 拒绝邀约
   */
  @Bind()
  handleRefuse() {
    const { inviteId } = this.state;
    const {
      dispatch,
      organizationId,
      disposeInvite: {
        [inviteId]: { invitingInfo = {} },
      },
      form,
    } = this.props;
    const { textValue } = this.state;
    form.validateFields((err, formValues) => {
      if (!err) {
        confirm({
          title: intl.get('hzero.common.message.confirm.reject').d('是否确认拒绝'),
          // content: '',
          onOk: () => {
            dispatch({
              type: 'disposeInvite/rejectCoop',
              payload: {
                textValue: textValue || formValues.refuseReason,
                organizationId,
                inviteId,
                objectVersionNumber: invitingInfo.objectVersionNumber,
              },
            }).then((res) => {
              this.handleCancel();
              if (res) {
                notification.success({
                  message: intl
                    .get(`spfm.disposeInvite.message.refuseToInvite`)
                    .d('您已拒绝该合作邀约'),
                });
                this.handleCloseTab();
              }
            });
          },
        });
      }
    });
  }

  /**
   * 发送调查表
   */
  @Bind()
  handleQuestionnaire() {
    const { inviteId } = this.state;
    const {
      dispatch,
      organizationId,
      form,
      disposeInvite: {
        [inviteId]: {
          invitingInfo: { objectVersionNumber, inviteCompanyId, companyId, inviteTenantId },
        },
      },
    } = this.props;
    const levelTypeFlag = this.receiveCusForm.getFieldValue('levelTypeFlagSupplier');
    form.validateFields((err, fieldsValues) => {
      if (!err) {
        const { categoryId, ...others } = fieldsValues;
         // 校验合作伙伴
         const checkData = {
          tenantId: organizationId,
          companyId,
          inviteTenantId,
          inviteCompanyId,
          levelTypeFlag,
        };
         dispatch({
          type: 'disposeInvite/checkPartner',
          payload: checkData,
        }).then((res) => {
          const flag = getResponse(res);
          const payload = { organizationId, ...others, inviteId, objectVersionNumber, levelTypeFlag };
          if(isBoolean(flag)){
            if(flag){
              // 可以邀约
              this.handleSendInvestigation(payload);
            }else {
              // 弹窗提示
              this.handleTipsPartnerModal(payload);
            }
          }
        });
      }
    });
  }

  /**
   * 弹窗提示
   * @param {*} payload
   */
  @Bind()
  handleTipsPartnerModal(payload = {}, type = '') {
    confirm({
      title: intl.get('sslm.supplierInvite.title.message.tipsPartner').d('邀请方公司与供应商已存在合作伙伴关系，不支持通过邀约途径更新已有合作供应商的相关信息。如您选择了发送调查表，或维护了采购员、品类和分类等，邀约发送后以上信息将被自动删除，仅可通过此邀约为所选销售员分配角色权限。请确认是否发送邀约。'),
      onOk: () => {
        if(type === 'inviteCoop'){
          this.handleAgreeCoop({
            ...payload,
            clearFlag: 1,
          });
        }else {
          this.handleSendInvestigation({
            ...payload,
            clearFlag: 1,
          });
        }
      },
    });
  }

  /**
   * 发送调查表
   */
   @Bind()
   handleSendInvestigation(payload = {}) {
     const {
       dispatch,
     } = this.props;

     dispatch({
      type: 'disposeInvite/sendInvestigate',
      payload,
    }).then(res => {
      if (res) {
        this.handleCancel();
        notification.success();
        this.getInvitingInformation();
      }
    });
   }

  /**
   * 打开拒绝模态框
   */
  @Bind()
  showRefuseModal() {
    this.setState({
      visible: true,
      modalType: 'refuse',
    });
  }

  /**
   * 打开调查表拒绝模态框
   */
  @Bind()
  showInvestigateRefuseModal() {}

  /**
   * 打开同意合作模态框
   */
  @Bind()
  showSuppleModal(
    supplierCategoryIdList = [],
    supplierCategoryCode = [],
    selectedChildRows = [],
    initialSelect = []
  ) {
    const { queryPurchaseList = [] } = this.state;
    const { form: { resetFields = () => {} } = {} } = this.props;
    // 每次打开弹窗，初始化弹窗内容
    this.setState({
      visible: true,
      modalType: 'supplement',
      supplierCategoryIdList,
      supplierCategoryCode,
      selectedChildRows,
      initialSelect,
      purchaseSelectedRows: queryPurchaseList,
    });
    resetFields(['purchaseAgentId', 'purchaseAgentName']);
  }

  /**
   * 关闭模态框
   */
  @Bind()
  handleCancel() {
    // 弹窗取消清空品类，采购员
    this.setState({
      visible: false,
      purchaseSelectedRows: [], // 清空采购员
      selectedCategoryRows: [], // 清空品类
    });
  }

  /**
   * 打开侧边模态框
   */
  @Bind()
  showDrawer() {
    this.setState({
      modalVisible: true,
    });
  }

  /**
   * 关闭侧边模态框
   */
  @Bind()
  hideDrawer() {
    this.setState({
      modalVisible: false,
    });
  }

  /**
   * 打开合并单据侧边模态框
   */
  @Bind()
  showMergeDrawer(id) {
    this.setState({
      mergeModalVisible: true,
      mergeCompanyId: id,
    });
  }

   /**
    * 关闭合并单据侧边模态框
    */
  @Bind()
  hideMergeDrawer() {
    this.setState({
      mergeModalVisible: false,
    });
  }

  /**
   * 改变调查类型
   */
  @Bind()
  handleSelectChange() {
    const { form } = this.props;
    form.resetFields('investigateTemplateId');
  }

  /**
   *  查询是否启用隐私政策
   */
  @Bind()
  handlePrivacyPolicy(tenantId, companyId) {
    const { dispatch } = this.props;
    dispatch({
      type: 'disposeInvite/fetchPrivacyPolicy',
      payload: {
        tenantId,
      },
    }).then((res) => {
      if (res && res.settingValue === '1') {
        // this.setState({
        //   privacyPolicyClickVisible: true,
        // });
        this.handlePrivacyStaticTexts(tenantId, companyId);
      }
    });
  }

  /**
   *  查询隐私政策文档
   */
  @Bind()
  handlePrivacyStaticTexts(tenantId, companyId) {
    const { dispatch } = this.props;
    dispatch({
      type: 'disposeInvite/fetchPrivacyPolicyText',
      payload: {
        partnerTenantId: tenantId,
        companyId,
        textCode: 'SSLM.INVITE.PRIVACY_AGREEMENT',
      },
    });
  }

  /**
   *  查询平台政策文档
   */
  @Bind()
  handlePlatformPolicyText() {
    const { dispatch } = this.props;
    dispatch({
      type: 'disposeInvite/fetchPlatformPolicyText',
      payload: {
        partnerTenantId: 0,
        companyId: 0,
        textCode: 'SRM.SHARE.PERSONAL.INFORMATION',
      },
    }).then((res) => {
      if (res) {
        this.setState({
          platformPolicyText: [res],
        });
      }
    });
  }

  @Bind()
  handleClear() {
    const { form } = this.props;
    form.setFieldsValue({
      supplierCategoryIdList: [],
      supplierCategoryCode: [],
      multiSupplierCategoryId: '',
    });
    this.setState({
      tags: [],
      supplierCategoryIdList: [],
      supplierCategoryCode: [],
      selectedChildRows: [],
      selectedRowKeys: [],
      initialSelect: [],
    });
  }

  searchButton() {
    if (this.state.loading) {
      return <Icon key="search" type="loading" />;
    } else {
      return (
        <Icon
          key="search"
          type="search"
          onClick={() => this.fetchSupplierDate()}
          style={{ cursor: 'pointer', color: '#666' }}
        />
      );
    }
  }

  @Bind()
  fetchSupplierDate(page = {}) {
    // const { onQuerySupplierCategoryDate } = this.props;
    const fieldValues = isUndefined(this.form) ? {} : this.form.getFieldsValue();
    this.querySupplierCategoryDate({
      page,
      ...fieldValues,
    });
    this.setState({ supplierCategoryModal: true });
  }

  /**
   * 更新modal项目采购负责人列表数据
   * @param {Array} record 弹窗中选择的多条采购负责人数据
   */
  @Bind()
  saveRecordRows(selectedRows) {
    const { form } = this.props;
    const { selectedChildRows = [] } = this.state;
    const newSelectedRows = selectedRows || selectedChildRows;
    const supplierCategoryCode = newSelectedRows.map((o) => o.supplierCategoryDescription);
    const supplierCategoryIdList = newSelectedRows.map((o) => o.supplierCategoryId);
    if (supplierCategoryCode) {
      form.registerField('supplierCategoryCode');
      form.setFieldsValue({
        supplierCategoryCode,
        multiSupplierCategoryId: String(supplierCategoryIdList),
      });
    }
    if (supplierCategoryIdList) {
      form.registerField('supplierCategoryIdList');
      form.setFieldsValue({ supplierCategoryIdList });
    }
    this.setState({
      tags: supplierCategoryIdList,
      initialSelect: newSelectedRows,
      supplierCategoryIdList,
      supplierCategoryCode,
      supplierCategoryModal: false,
      selectedChildRows: newSelectedRows,
    });
  }

  @Bind()
  changeSelectRows(selectedRows) {
    this.setState({ purchaseSelectedRows: selectedRows });
    const { form } = this.props;
    const value = selectedRows.map((o) => o.purchaseAgentName).join();
    const rowKeys = selectedRows.map((o) => o.purchaseAgentId).join();
    form.setFieldsValue({ purchaseAgentId: rowKeys, purchaseAgentName: value });
  }

  /**
   * 保存品类多选数据
   * @param {Array} record 弹窗中选择的多条采购负责人数据
   */
  @Bind()
  onSaveRecord(selectedCategoryRows) {
    const { form, dispatch } = this.props;
    const { itemCategoryFlag, purchaseFlag } = this.state;
    const newSelectedCategoryRows = itemCategoryFlag
      ? [selectedCategoryRows]
      : selectedCategoryRows;

    const value = newSelectedCategoryRows.map((o) => o.categoryName);
    const rowKeys = newSelectedCategoryRows.map((o) => o.categoryId);
    form.registerField('categoryIds');
    form.setFieldsValue({ categoryId: rowKeys, categoryIds: rowKeys, categoryName: value });
    if (newSelectedCategoryRows.length !== 0) {
      dispatch({
        type: 'disposeInvite/fetchGetPurchaser',
        payload: newSelectedCategoryRows.map((item) => ({ categoryId: item.categoryId })),
      }).then((res) => {
        if (res && isArray(res)) {
          let newRes = [];
          if (isEmpty(res)) {
            newRes = this.state.queryPurchaseList;
          } else if (!purchaseFlag) {
            newRes = res;
          } else {
            newRes = [res[0]];
          }
          const purchaseAgentName = newRes.map((item) => item.purchaseAgentName).join();
          const purchaseAgentId = newRes.map((item) => item.purchaseAgentId).join();
          form.setFieldsValue({
            purchaseAgentName,
            purchaseAgentId,
          });
          this.setState({
            purchaseSelectedRows: newRes,
          });
        }
      });
    }
    this.setState({
      selectedCategoryRows: newSelectedCategoryRows,
    });
    // 清空准入品类，清空采购员
    if (isEmpty(newSelectedCategoryRows)) {
      const { queryPurchaseList } = this.state;
      const purchaseAgentName = queryPurchaseList.map((item) => item.purchaseAgentName).join();
      const purchaseAgentId = queryPurchaseList.map((item) => item.purchaseAgentId).join();
      form.setFieldsValue({
        purchaseAgentName,
        purchaseAgentId,
      });
    }
  }

  // 邀约拒绝 | 同意合作按钮 modal
  renderForm(isChange) {
    const {
      inviteId,
      purchaseSelectedRows,
      selectedCategoryRows = [],
      itemCategoryFlag,
      purchaseFlag,
      supplierCategoryFlag,
    } = this.state;
    const {
      form,
      organizationId,
      customizeForm,
      Enums = {},
      disposeInvite: { lifeCycleList = [], [inviteId]: {invitingInfo = {},
      } = {} },
    } = this.props;
    const {inviteType, companyId, inviteCompanyId, inviteCompanyIds} = invitingInfo;
    const { roleTypeSet = [], investigateTypeList = [] } = Enums;
    const { getFieldDecorator, getFieldValue } = form;
    const isSend = getFieldValue('flag') === 1; // true 发送
    const formLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 18 },
    };
    const formLayout2 = {
      labelCol: { span: 9 },
      wrapperCol: { span: 15 },
    };
    const { selectedChildRows } = this.state;
    const lovClassNames = ['lov-input'];
    lovClassNames.push('lov-suffix');

    // const suffix = (
    //   <React.Fragment>
    //     <Icon key="clear" className="lov-clear" type="close-circle" onClick={this.handleClear} />
    //     {this.searchButton()}
    //   </React.Fragment>
    // );

    if (isChange) {
      return customizeForm(
        {
          code: 'SPFM.PARTNER_INVITE.INVESTIGATE_REJECT', // 必传，和unitCode一一对应
          form,
        },
        <Form layout="horizontal">
          <Row>
            <Col md={24} span={24}>
              <FormItem
                label={
                  <Tooltip
                    title={intl
                      .get(`spfm.disposeInvite.view.message.tab.investigateDescribe`)
                      .d('变更调查表模板后，原调查表将被取消作废，供应商需重新填写新调查表的内容')}
                  >
                    {intl
                      .get(`spfm.disposeInvite.view.message.investigationisChange`)
                      .d('是否变更调查表')}
                    <Icon style={{ marginLeft: '6px' }} type="question-circle-o" />
                  </Tooltip>
                }
                {...formLayout}
              >
                {getFieldDecorator('flag', {
                  initialValue: 0,
                })(<Checkbox />)}
              </FormItem>
            </Col>
          </Row>
          {isSend && (
            <Row>
              <Col md={24} span={24}>
                <FormItem
                  label={intl
                    .get(`spfm.disposeInvite.model.purchaserCooperation.type`)
                    .d('调查类型')}
                  {...formLayout}
                >
                  {getFieldDecorator('investigateType', {
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get(`spfm.disposeInvite.model.purchaserCooperation.type`)
                            .d('调查类型'),
                        }),
                      },
                    ],
                  })(
                    <ValueList
                      allowClear
                      lovCode="SSLM.INVESTIGATE_TYPE"
                      onChange={this.handleSelectChange}
                    />
                  )}
                </FormItem>
              </Col>
            </Row>
          )}
          {isSend && (
            <Row>
              <Col md={24} span={24}>
                <FormItem
                  label={intl
                    .get(`spfm.disposeInvite.model.purchaserCooperation.template`)
                    .d('调查表模板')}
                  {...formLayout}
                >
                  {getFieldDecorator('investigateTemplateId', {
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get(`spfm.disposeInvite.model.purchaserCooperation.template`)
                            .d('调查表模板'),
                        }),
                      },
                    ],
                  })(
                    <Lov
                      disabled={isEmpty(getFieldValue('investigateType'))}
                      code="SSLM.INVESTIGATE_TEMPLATE_ID"
                      queryParams={{
                        organizationId,
                        enabledFlag: 1,
                        investigateType: getFieldValue('investigateType'),
                        assignMenuScope: "srm.partner.my-partner.invitation-list",
                        companyIds: inviteCompanyIds|| (inviteType === 'CUSTOMER' ? inviteCompanyId : companyId),
                      }}
                    />
                  )}
                </FormItem>
              </Col>
            </Row>
          )}
          {isSend && (
            <Row>
              <Col md={24} span={24}>
                <FormItem
                  label={intl.get(`spfm.disposeInvite.view.message.remark`).d('调查说明')}
                  {...formLayout}
                >
                  {getFieldDecorator('remark', {})(<Input />)}
                </FormItem>
              </Col>
            </Row>
          )}
          <Row>
            <Col md={24} span={24}>
              <FormItem
                label={intl.get(`spfm.disposeInvite.view.message.refuseReason`).d('拒绝原因')}
                {...formLayout}
              >
                {form.getFieldDecorator('rejectRemark', {})(
                  <TextArea
                    rows={16}
                  />
                )}
              </FormItem>
            </Col>
          </Row>
        </Form>
      );
    } else {
      // 同意合作
      return customizeForm(
        {
          code: 'SPFM.PARTNER_INVITE.CUSTOMER_INVITATION', // 必传，和unitCode一一对应
          form, // 无论个性化单元是否只读，均必传
          dataSource: invitingInfo, // 必传，从后端接口获取到的数据
          isCreate: true,
        },
        <Form layout="horizontal">
          <Row>
            <Col span={12}>
              <FormItem
                label={intl
                  .get(`spfm.disposeInvite.view.message.sendInvestigation`)
                  .d('发送调查表')}
                {...formLayout2}
              >
                {getFieldDecorator('flag', {
                  initialValue: 0,
                })(<Checkbox />)}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                label={intl
                  .get(`spfm.invitationRegister.model.invitation.purchaseAgentId`)
                  .d('采购员')}
                {...formLayout2}
              >
                {!purchaseFlag
                  ? getFieldDecorator('purchaseAgentId', {
                      initialValue: !isEmpty(purchaseSelectedRows)
                        ? purchaseSelectedRows.map((item) => item.purchaseAgentId).join()
                        : '',
                    })(
                      <LovMulti
                        textField="purchaseAgentName"
                        code="SPFM.PURCHASE_AGENT_NOUSER"
                        queryParams={{ tenantId: organizationId }}
                        selectedRows={purchaseSelectedRows}
                        changeSelectRows={this.changeSelectRows}
                      />
                    )
                  : getFieldDecorator('purchaseAgentId', {
                      initialValue: !isEmpty(purchaseSelectedRows)
                        ? (purchaseSelectedRows[0] || {}).purchaseAgentId
                        : '',
                    })(
                      <Lov
                        textField="purchaseAgentName"
                        code="SPFM.PURCHASE_AGENT_NOUSER"
                        queryParams={{ tenantId: organizationId }}
                      />
                    )}
                {getFieldDecorator('purchaseAgentName', {
                  initialValue: !isEmpty(purchaseSelectedRows)
                    ? !purchaseFlag
                      ? purchaseSelectedRows.map((item) => item.purchaseAgentName).join()
                      : (purchaseSelectedRows[0] || {}).purchaseAgentName
                    : '',
                })}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span={12}>
              <FormItem
                label={intl
                  .get('spfm.invitationRegister.model.invitation.supplierRole')
                  .d('供应商角色')}
                style={{ width: '100%', marginTop: 5 }}
              >
                {getFieldDecorator('roleType', {
                  initialValue: 'SALES',
                })(
                  <Select>
                    {(roleTypeSet || []).map((n) => (
                      <Option key={n.value} value={n.value}>
                        {n.meaning}
                      </Option>
                    ))}
                  </Select>
                )}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                label={intl
                  .get(`spfm.invitationRegister.model.invitation.supplierCategoryCode`)
                  .d('供应商分类')}
              >
                {!supplierCategoryFlag
                  ? getFieldDecorator('multiSupplierCategoryId', {
                      initialValue: (selectedChildRows || [])
                        .map((i) => i.supplierCategoryId)
                        .join(),
                    })(
                      <LovMulti
                        code="SSLM.SUPPLIER_CATEGORY_TREE"
                        textValue={selectedChildRows
                          .map((i) => i.supplierCategoryDescription)
                          .join()}
                        textField="supplierCategoryDescription"
                        lovOptions={{
                          valueField: 'supplierCategoryId',
                          displayField: 'supplierCategoryDescription',
                        }}
                        queryParams={{ tenantId: organizationId }}
                        selectedRows={selectedChildRows}
                        checkData={this.checkClassify}
                        changeSelectRows={this.saveRecordRows}
                        getCheckboxProps={(record) => ({ disabled: record.hasChild })}
                      />
                    )
                  : getFieldDecorator('multiSupplierCategoryId', {
                      initialValue: !isEmpty(selectedChildRows)
                        ? (selectedChildRows[0] || {}).supplierCategoryId
                        : '',
                    })(
                      <NewLov
                        parentNodeDisable
                        textField="supplierCategoryDescription"
                        code="SSLM.SUPPLIER_CATEGORY_TREE"
                        checkData={this.checkClassify}
                        lovOptions={{
                          valueField: 'supplierCategoryId',
                          displayField: 'supplierCategoryDescription',
                        }}
                        queryParams={{ tenantId: organizationId }}
                      />
                    )}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <FormItem
                label={intl
                  .get('spfm.invitationRegister.model.invitation.categoryCode')
                  .d('准入品类')}
                {...formLayout2}
              >
                {!itemCategoryFlag
                  ? getFieldDecorator('categoryId')(
                    <LovMulti
                      textField="categoryName"
                      code="SMDM.CATEGORY.LEVEL_CONTROL_TREE"
                      queryParams={{hzeroUIFlag: 1, tenantId: organizationId, businessObjectCode: "SRM_C_SRM_SPFM_PARTNER_INVITE" }}
                      selectedRows={selectedCategoryRows}
                      changeSelectRows={this.onSaveRecord}
                    />
                    )
                  : getFieldDecorator('categoryId')(
                    <NewLov
                      textField="categoryName"
                      code="SMDM.CATEGORY.LEVEL_CONTROL_TREE"
                      queryParams={{hzeroUIFlag: 1, tenantId: organizationId, businessObjectCode: "SRM_C_SRM_SPFM_PARTNER_INVITE" }}
                      onOk={this.onSaveRecord}
                    />
                    )}
              </FormItem>
            </Col>
            <Col span={24}>
              <FormItem
                label={intl.get(`spfm.invitationRegister.model.invitation.lifeCycle`).d('生命周期')}
              >
                {getFieldDecorator('toCycleStageId')(
                  <Select allowClear>
                    {lifeCycleList.map((item) => (
                      <Option value={item.value} key={item.value}>
                        {item.meaning}
                      </Option>
                    ))}
                  </Select>
                )}
              </FormItem>
            </Col>
          </Row>
          <Row style={{ display: isSend ? 'block' : 'none' }}>
            <Col span={12}>
              <FormItem
                label={intl.get(`spfm.disposeInvite.model.purchaserCooperation.type`).d('调查类型')}
                {...formLayout2}
              >
                {getFieldDecorator('investigateType', {
                  rules: [
                    {
                      required: isSend,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`spfm.disposeInvite.model.purchaserCooperation.type`)
                          .d('调查类型'),
                      }),
                    },
                  ],
                })(
                  <Select allowClear onChange={this.handleSelectChange}>
                    {investigateTypeList.map((item) => {
                      return (
                        <Option key={item.value} value={item.value}>
                          {item.meaning}
                        </Option>
                      );
                    })}
                  </Select>
                )}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                label={intl
                  .get(`spfm.disposeInvite.model.purchaserCooperation.template`)
                  .d('调查表模板')}
                {...formLayout2}
              >
                {getFieldDecorator('investigateTemplateId', {
                  rules: [
                    {
                      required: isSend,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`spfm.disposeInvite.model.purchaserCooperation.template`)
                          .d('调查表模板'),
                      }),
                    },
                  ],
                })(
                  <Lov
                    disabled={isEmpty(getFieldValue('investigateType'))}
                    code="SSLM.INVESTIGATE_TEMPLATE_ID"
                    queryParams={{
                      organizationId,
                      enabledFlag: 1,
                      investigateType: getFieldValue('investigateType'),
                        assignMenuScope: "srm.partner.my-partner.invitation-list",
                        companyIds: inviteCompanyIds|| (inviteType === 'CUSTOMER' ? inviteCompanyId : companyId),
                    }}
                  />
                )}
              </FormItem>
            </Col>
          </Row>
          {isSend && (
            <Row>
              <Col span={24}>
                <FormItem
                  label={intl.get(`spfm.disposeInvite.view.message.remark`).d('调查说明')}
                  {...formLayout2}
                >
                  {getFieldDecorator('remark', {})(<Input />)}
                </FormItem>
              </Col>
            </Row>
          )}
        </Form>
      );
    }
  }

  // 审批通过回调
  @Bind()
  approvalCallback(payload) {
    const { dispatch } = this.props;
    dispatch({
      type: 'disposeInvite/handleAgree',
      payload,
    }).then((result) => {
      if (result) {
        notification.success();
        // this.getInvitingInformation();
        this.handleCloseTab();
      }
    });
  }

  // 审批通过
  @Bind()
  handleApprovalAgree() {
    const { inviteId } = this.state;
    const {
      disposeInvite: {
        [inviteId]: { headerInfo = {}, invitingInfo = {}, detail = {} },
      },
    } = this.props;

    if (this.inviteForm) {
      this.inviteForm.validateFields((errs, formValues) => {
        if (!errs) {
          const payload = {
            ...invitingInfo,
            ...formValues,
            investgHeaderId: headerInfo.investgHeaderId,
            partnerInviteDTO: {
              ...invitingInfo,
              ...formValues,
              investgHeaderId: headerInfo.investgHeaderId,
            },
          };
          if (!this.approvalRef) {
            this.approvalCallback(payload);
          } else {
            this.approvalRef.props.form.validateFields((err, fieldsVals) => {
              if (!err) {
                this.approvalCallback({
                  ...payload,
                  ...detail,
                  ...fieldsVals,
                  partnerInviteDTO: {
                    ...invitingInfo,
                    ...formValues,
                    investgHeaderId: headerInfo.investgHeaderId,
                  },
                });
              }
            });
          }
        }
      });
    } else if (this.receiveCusForm) {
      this.receiveCusForm.validateFields((errs, formValues) => {
        if (!errs) {
          const payload = {
            ...invitingInfo,
            ...formValues,
            investgHeaderId: headerInfo.investgHeaderId,
            partnerInviteDTO: {
              ...invitingInfo,
              ...formValues,
              investgHeaderId: headerInfo.investgHeaderId,
            },
          };
          if (!this.approvalRef) {
            this.approvalCallback(payload);
          } else {
            this.approvalRef.props.form.validateFields((err, fieldsVals) => {
              if (!err) {
                this.approvalCallback({
                  ...payload,
                  ...detail,
                  ...fieldsVals,
                  partnerInviteDTO: {
                    ...invitingInfo,
                    ...formValues,
                    investgHeaderId: headerInfo.investgHeaderId,
                  },
                });
              }
            });
          }
        }
      });
    } else {
      const payload = {
        investgHeaderId: headerInfo.investgHeaderId,
        partnerInviteDTO: {
          investgHeaderId: headerInfo.investgHeaderId,
        },
      };
      if (!this.approvalRef) {
        this.approvalCallback(payload);
      } else {
        this.approvalRef.props.form.validateFields((errs, fieldsVals) => {
          if (!errs) {
            this.approvalCallback({
              ...payload,
              ...detail,
              ...fieldsVals,
              partnerInviteDTO: {
                investgHeaderId: headerInfo.investgHeaderId,
              },
            });
          }
        });
      }
    }
  }

  /**
   * 审批拒绝
   * @param {String} rejectRemark - 拒绝说明
   */
  @Bind()
  handleApprovalReject(rejectRemark) {
    const { inviteId } = this.state;
    const {
      disposeInvite: {
        [inviteId]: { headerInfo = {} },
      },
      dispatch,
    } = this.props;
    confirm({
      title: intl.get('hzero.common.message.confirm.reject').d('是否确认拒绝'),
      // content: '',
      onOk: () => {
        dispatch({
          type: 'disposeInvite/handleReject',
          payload: {
            investgHeaderId: headerInfo.investgHeaderId,
            rejectRemark,
          },
        }).then((result) => {
          if (result) {
            notification.success();
            // this.getInvitingInformation();
            this.handleCloseTab();
          }
        });
      },
    });
  }

  /**
   * 获取Investigation的保存方法
   */
  @Bind()
  getSaveValidateData(getSaveValidate) {
    this.saveData = getSaveValidate;
  }

  /**
   * 获取Investigation的提交方法
   */
  @Bind()
  onSubmitHook(submit) {
    this.onSubmitInvestigation = submit;
  }

  /**
   * 保存按钮方法
   */
  @Bind()
  handleSave() {
    const { inviteId } = this.state;
    const {
      disposeInvite: {
        [inviteId]: { headerInfo = {} },
      },
    } = this.props;
    const { partnerRemark } = this.state;
    const newHeaderInfo = { ...headerInfo, partnerRemark };
    if (isFunction(this.saveData)) {
      this.HeaderInfo.props.form.validateFields((err, fieldsValues) => {
        if (!err) {
          this.saveData({
            ...newHeaderInfo,
            ...fieldsValues,
          });
        }
      });
    }
  }

  /**
   * 提交按钮
   */
  @Bind()
   handleSubmit() {
    // 是否阅读并同意协议
    const checkedFlag = ((this.policyform&&values(this.policyform.getFieldsValue()))||[]).filter((n) => !n) || [];
    if (isEmpty(checkedFlag)) {
      this.HeaderInfo.props.form.validateFields((err, fieldsValues) => {
        if (!err) {
          confirm({
            title: intl.get('hzero.common.message.confirm.submit').d('是否确认提交'),
            // content: '',
            onOk: () => {
              const { inviteId } = this.state;
              const {
                disposeInvite: {
                  [inviteId]: { headerInfo = {} },
                },
              } = this.props;
              const { partnerRemark } = this.state;
              const newHeaderInfo = { ...headerInfo, ...fieldsValues, partnerRemark };
              if (isFunction(this.onSubmitInvestigation)) {
                if (partnerRemark !== undefined && partnerRemark !== headerInfo.partnerRemark) {
                  this.onSubmitInvestigation(this.handleCloseTab, newHeaderInfo);
                } else {
                  this.onSubmitInvestigation(this.handleCloseTab, headerInfo);
                }
              }
            },
          });
        }
      });
    } else {
      const { inviteId, platformPolicyText, status } = this.state;
      const {
        disposeInvite: { [inviteId]: { privacyPolicyText = [], invitingInfo = {} } = {} },
        form,
      } = this.props;
      let allPolicyText = concat(platformPolicyText, privacyPolicyText);
       // 我发出的邀请客户，供应商在填写时不校验平台预制的静态文本协议
      if(status === 'send' && invitingInfo.inviteType === 'CUSTOMER'){
        allPolicyText = privacyPolicyText;
      }
    this.setState({verificationPlatFormText: allPolicyText.filter(n => !this.policyform.getFieldValue(`policy${n.textId}`))}, ()=>{
      this.handlePolicyModal(this.state.verificationPlatFormText[0]);
    });
    }
  }

  /**
   * 打开tab并关闭当前页
   */
  @Bind()
  handleCloseTab() {
    const { inviteId } = this.state;
    const { history } = this.props;
    // openTab({
    //   title: intl.get('spfm.invitationList.view.message.title').d('企业邀约汇总'),
    //   key: '/spfm/invitation/list',
    //   path: '/spfm/invitation/list',
    //   icon: 'form',
    //   closable: true,
    // });
    history.push('/spfm/invitation/list');

    closeTab(`/spfm/dispose-invite/${inviteId}`);
  }

  /**
   * 把调查说明存到state里
   * @param {String} partnerRemark - 调查说明
   */
  @Bind()
  getHeaderInfo(partnerRemark) {
    this.setState({ partnerRemark });
  }

  /**
   * 改变 Save loading true false
   */
  @Bind()
  handleChangeSaveLoading(boolean) {
    this.setState({ saveLoading: boolean });
  }

  /**
   * 改变 Submit loading true false
   */
  @Bind()
  handleChangeSubmitLoading(boolean) {
    this.setState({ submitLoading: boolean });
  }

  /**
   * 保存完之后查询的loading
   */
  @Bind()
  handleChangeQueryInvestgLoading(boolean) {
    this.setState({ queryInvestgLoading: boolean });
  }

  @Bind()
  handleInvestigateCancel() {
    this.setState({
      investigateVisible: false,
    });
  }

  @Bind()
  handleInvestigateModal() {
    this.setState({
      investigateVisible: true,
    });
  }

  @Bind()
  handleInvestigateAgree() {
    const { inviteId } = this.state;
    const {
      dispatch,
      // organizationId,
      form,
      disposeInvite: {
        [inviteId]: {
          headerInfo: { investgHeaderId },
        },
      },
    } = this.props;
    form.validateFields({ force: true }, (err, fieldsValues) => {
      if (!err) {
        dispatch({
          type: 'disposeInvite/handleInvestigateReject',
          payload: { ...fieldsValues, investgHeaderId },
        }).then((res) => {
          if (res) {
            this.handleInvestigateCancel();
            notification.success();
            this.getInvitingInformation();
          }
        });
      }
    });
  }

  // 多选框
  @Bind()
  handleRowSelect(selectedRowKeys, selectedChild, rowSelect) {
    if (rowSelect) {
      const includeFlag = selectedRowKeys.indexOf(rowSelect.supplierCategoryId);
      if (includeFlag >= 0) {
        selectedRowKeys.splice(includeFlag, 1);
        selectedChild.splice(includeFlag, 1);
      } else {
        selectedRowKeys.push(rowSelect.supplierCategoryId);
        selectedChild.push(rowSelect);
      }
    }
    const rowIds = selectedChild.map((ele) => ele.supplierCategoryId);
    const { selectedChildRows = [] } = this.state;
    const newRows = selectedChildRows.filter(
      (obj) => selectedRowKeys.findIndex((ele) => obj.supplierCategoryId === ele) !== -1
    );
    const dataSource = newRows.filter((ele) => !rowIds.includes(ele.supplierCategoryId));
    this.setState({
      changedFlag: true,
      selectedRowKeys,
      selectedChildRows: [...dataSource, ...selectedChild],
    });
  }

  @Bind()
  handleFecthRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  @Bind()
  handleCancelModal() {
    this.setState({ supplierCategoryModal: false, changedFlag: false });
  }

  /**
   * 校验供应商分类
   */
  @Bind()
  async checkClassify(selectedClassifyRows) {
    const { dispatch } = this.props;
    // const { selectedChildRows = [] } = this.state;
    const supplierCategoryIdList = selectedClassifyRows.map((o) => o.supplierCategoryId);
    const validateFlag = await dispatch({
      type: 'disposeInvite/checkClassify',
      payload: {
        supplierCategoryIdList,
      },
    });
    if (validateFlag) {
      this.saveRecordRows();
      // this.handleCancelModal();
    }
    return validateFlag;
  }

  // 政策回调
  _modal;

  @Bind()
  modalCallback(n, value, platformPolicyflag) {
    const { inviteId, verificationPlatFormText } = this.state;
    const { dispatch } = this.props;
    if (platformPolicyflag && value) {
      // 保存操作人信息
      dispatch({
        type: 'disposeInvite/saveOperatorInfo',
        payload: [
          {
            consentFormProcessor: currentUserId,
            inviteId,
          },
        ],
      }).then((res) => {
        if (res) {
          this._modal.close();
          this.policyform.setFieldsValue({ [`policy${n.textId}`]: value });
        }
      });
    } else {
      this._modal.close();
      this.policyform.setFieldsValue({ [`policy${n.textId}`]: value });
    }
    if(verificationPlatFormText.length > 1 && value) {
      const dataList = verificationPlatFormText.filter(v => v.textId !== n.textId);
      this.setState({verificationPlatFormText: dataList}, ()=>{
        this.handlePolicyModal(dataList[0]);
      });
    }
  }

  /**
   *
   * @param {*} n
   * @param {*} platformPolicyflag 是否平台预定义静态文本
   */
  @Bind()
  handlePolicyModal(n, platformPolicyflag = 0) {
    this._modal = C7nModal.open({
      key: C7nModal.key(),
      title: n.title,
      autoCenter: true,
      closable: true,
      footer: null,
      style: { width: 1200 },
      bodyStyle: { paddingBottom: 0 },
      children: (
        <Fragment>
          <div dangerouslySetInnerHTML={{ __html: n.text || '' }} />
          <div
            style={{
              textAlign: 'right',
              padding: '12px 24px',
              margin: '0 -24px',
              borderTop: 'solid 1px #e0e0e0',
            }}
          >
            <Button style={{ marginRight: 8 }} onClick={() => this.modalCallback(n, 0)}>
              {intl.get(`hzero.common.button.notAgree`).d('不同意')}
            </Button>
            <Button type="primary" onClick={() => this.modalCallback(n, 1, platformPolicyflag)}>
              {intl.get(`hzero.common.button.agree`).d('同意')}
            </Button>
          </div>
        </Fragment>
      ),
    });
  }

  /**
   * 打印功能
   */
  @Bind()
  handlePrint({ key }) {
    const { inviteId } = this.state;
    const {
      dispatch,
      disposeInvite: {
        [inviteId]: {
          headerInfo: { investgHeaderId, tenantId },
        },
      },
    } = this.props;

    switch (key) {
      case 'PDF':
        dispatch({
          type: 'disposeInvite/handlePrint',
          payload: {
            investgHeaderId,
            tenantId,
          },
        }).then(res => {
          if (res) {
            if (res.type.indexOf('application/json') > -1) {
              notification.warning({
                description: intl
                  .get(`sslm.common.view.printwarning.noTemplate`)
                  .d('未设置打印模板，不可打印'),
              });
              return;
            }
            const file = new Blob([res], { type: 'application/pdf' });
            const fileURL = URL.createObjectURL(file);
            const printWindow = window.open(fileURL);
            if (printWindow) {
              printWindow.print();
            }
          }
        });
        break;
      case 'EXCEL':
        dispatch({
          type: 'disposeInvite/handleExcelPrint',
          payload: {
            investgHeaderId,
            tenantId,
          },
        }).then(res => {
          if (res) {
            downloadFile({ requestUrl: res });
          }
        });
        break;
      default:
        break;
    }
  }

  // 撤回邀约
  @Bind()
  handleWithdraw(){
    const {dispatch} = this.props;
    const { inviteId } = this.state;
    Modal.confirm({
      title: intl.get(`hzero.common.message.confirm.title`).d('提示'),
      content: intl.get("spfm.disposeInvite.view.message.tag.withdrawMsg").d("确认取消此次邀约？取消后状态更新为已撤回"),
      onOk: ()=>{
        dispatch({
          type: 'disposeInvite/withdrawInvite',
          payload: {
            inviteId,
          },
        }).then(response=>{
          if(isBoolean(response)){
            notification.success();
            this.handleCloseTab();
          }
        });
      },
    });
  }

  // 清除轮循计时器
  @Bind()
  clearTimerRef = () => {
    if (this.timerRef.current) {
      clearInterval(this.timerRef.current);
    }
  };

   // 轮询【智能审核】结果
  @Bind()
  async getAiApproveResult() {
    const {inviteId} = this.state;
    const {
      disposeInvite: {
        [inviteId]: { headerInfo = {} },
      },
    } = this.props;
    const res = getResponse(
      await fetchApproveStatus({ documentType: 'SUPPLIER_INVESTG', documentId: headerInfo.investgHeaderId })
    );
    if (res) {
      this.setState({aiApproveStatus: res.status});
      this.timerTime.current++;
      if (this.timerTime.current > 4 || res.status !== 'APPROVING') {
        this.timerTime.current = 0;
        this.clearTimerRef();
        this.setState({ reviewIsClick: false });
      }
    } else {
      this.clearTimerRef();
    }
 };

  // 智能预审
  @Bind()
  handleIntelligentReview(){
    const {inviteId} = this.state;
    const {
      disposeInvite: {
        [inviteId]: { headerInfo = {} },
      },
    } = this.props;
    this.handleSave();
    this.setState({
      extraLoading: true,
    });
    aiApprove({
      documentType: 'SUPPLIER_INVESTG',
      documentId: headerInfo.investgHeaderId,
    }).then(response => {
      const resp = getResponse(response);
      if (resp) {
        this.queryHeadInfo();
        this.setState({ reviewIsClick: true });
      }
    }).finally(()=>{
        this.setState({
          extraLoading: false,
        });
    });
  }

  render() {
    const {
      visible,
      modalVisible,
      modalType,
      status,
      saveLoading,
      submitLoading,
      inviteId,
      back,
      pStatus,
      aiApproveStatus,
      showAiApproveFlag,
      privacyPolicyClickVisible,
      supplierCategoryDate = {},
      investigateStatus,
      finalFlag,
      investigateVisible = false,
      supplierCategoryModal = false,
      changedFlag,
      extraLoading,
      selectedChildRows = [],
      initialSelect = [],
      selectedRowKeys = [],
      queryInvestgLoading,
      visableSubmitButtons = false,
      partnerTenantId,
      defaultBankInfo,
      platformPolicyText,
      mergeCompanyId,
      mergeModalVisible,
      purchaserDisabled = false,
    } = this.state;
    const {
      loading = false,
      modalLoading,
      agree,
      reject,
      form,
      remote,
      refuseLoading,
      approvalLoading,
      printLoading,
      organizationId,
      withdrawLoading,
      userMessage: { messageId },
      disposeInvite: {
        [inviteId]: {
          invitingInfo = {},
          headerInfo = {},
          detail = {},
          privacyPolicyText = [],
        } = {},
      },
      Enums: { idd = [], yesOrNoFlag = [], printType = [] },
      customizeForm,
      investigateRejectLoading,
    } = this.props;
    const isSend = form.getFieldValue('flag') === 1; // true 发送

    const backPath =
      back === 'invitation'
        ? '/spfm/invitation/list'
        : isEmpty(messageId)
        ? true
        : `/hmsg/user-message/detail/${messageId}`;

    const footer = [
      form.getFieldValue('investigateTemplateId') && (
        <Button onClick={this.handleShowModal}>
          {intl.get(`spfm.disposeInvite.view.message.templatePreview`).d('预览模板')}
        </Button>
      ),
      <Button onClick={this.handleCancel}>
        {intl.get('hzero.common.status.cancel').d('取消')}
      </Button>,
      <Button type="primary" onClick={this.handleQuestionnaire}>
        {intl.get(`spfm.disposeInvite.view.option.sendOut`).d('发送')}
      </Button>,
    ];

    const previewTitle = intl.get(`spfm.disposeInvite.view.message.templateDetail`).d('模板明细');
    const previewProps = {
      previewTitle,
      organizationId,
      investigateTemplateId: form.getFieldValue('investigateTemplateId'),
      onRef: (ref) => {
        this.handleShowModal = ref;
      },
    };

    const buttonLoading =
      submitLoading || saveLoading || queryInvestgLoading || printLoading || loading || extraLoading||false;
    const submitButtonProps = {
      style: { marginLeft: 8 },
      loading: buttonLoading,
      icon: 'check',
      onClick: this.handleSubmit,
    };
    const saveButtonProps = {
      type: 'primary',
      style: { marginLeft: 8 },
      loading: buttonLoading,
      icon: 'save',
      onClick: this.handleSave,
    };

    const sendTopProps = {
      agree,
      reject,
      invitingInfo,
      isSupplier: !!(invitingInfo.inviteType === 'CUSTOMER'),
      onShowDrawer: this.showDrawer,
      onHandleApprovalAgree: this.handleApprovalAgree,
      onHandleApprovalReject: this.handleApprovalReject,
      onHandleInvestigateModal: this.handleInvestigateModal,
      CusForm: SendCusForm,
      onRef: (node) => {
        this.inviteForm = node;
      },
      onPolicyRef: (ref = {}) => {
        this.policyform = (ref.props || {}).form;
      },
      status,
      pStatus,
      detail,
      visableSubmitButtons,
      customizeForm,
      privacyPolicyText,
      privacyPolicyClickVisible,
      onHandlePolicyModal: this.handlePolicyModal,
    };
    const registerTopProps = {
      agree,
      reject,
      invitingInfo,
      inviteReg: invitingInfo.inviteReg,
      isSupplier: !!(invitingInfo.inviteType === 'CUSTOMER'),
      onShowDrawer: this.showDrawer,
      onHandleApprovalAgree: this.handleApprovalAgree,
      onHandleApprovalReject: this.handleApprovalReject,
      CusForm: SendCusForm,
      status,
      pStatus,
    };
    const certifiTopTopProps = {
      agree,
      reject,
      invitingInfo,
      invitedUser: invitingInfo.invitedUser,
      inviteReg: invitingInfo.inviteReg,
      isSupplier: !!(invitingInfo.inviteType === 'CUSTOMER'),
      onShowDrawer: this.showDrawer,
      onHandleApprovalAgree: this.handleApprovalAgree,
      onHandleApprovalReject: this.handleApprovalReject,
      CusForm: SendAndCerCusForm,
      status,
      pStatus,
    };
    const receivedTopProps = {
      agree,
      reject,
      loading,
      headerInfo,
      invitingInfo,
      refuseLoading,
      approvalLoading,
      supplierCategoryDate,
      isSupplier: !!(invitingInfo.inviteType === 'CUSTOMER'),
      onAgree: this.handleAgree,
      onShowRefuseModal: this.showRefuseModal,
      onShowDrawer: this.showDrawer,
      onShowMergeDrawer: this.showMergeDrawer,
      onShowSuppleModal: this.showSuppleModal,
      onQuerySupplierCategoryDate: this.querySupplierCategoryDate,
      onHandleApprovalReject: this.handleApprovalReject,
      onHandleApprovalAgree: this.handleApprovalAgree,
      // onHandlePrivacyPolicy: this.handlePrivacyPolicy,
      // onHandlePrivacyStaticTexts: this.handlePrivacyStaticTexts,
      onHandlePolicyModal: this.handlePolicyModal,
      privacyPolicyClickVisible,
      customizeForm,
      header: headerInfo,
      finalFlag,
      investigateStatus,
      onHandleInvestigateModal: this.handleInvestigateModal,
      CusForm: ReceiveCusForm,
      status,
      pStatus,
      inviteId,
      privacyPolicyText,
      platformPolicyText,
      detail,
      visableSubmitButtons,
      yesOrNoFlag,
      onRef: (ref = {}) => {
        this.receiveCusForm = (ref.props || {}).form;
      },
      onPolicyRef: (ref = {}) => {
        this.policyform = (ref.props || {}).form;
      },
      purchaserDisabled,
    };

    const headerInfoProps = {
      headerInfo,
      isEdit:
        invitingInfo.processStatus === 'INVESTIGATE' ||
        (invitingInfo.processStatus === 'REJECT' && investigateStatus === 'REJECT' && finalFlag),
      remarkEdit: invitingInfo.processStatus === 'INVESTIGATE',
      onGetHeaderInfo: this.getHeaderInfo,
      partnerTenantId,
      onRef: (node) => {
        this.HeaderInfo = node;
      },
      purchaserDisabled,
    };
    const registerProps = {
      idd,
      invitingInfo,
      dataSource: invitingInfo.inviteReg,
    };
    const investigationSendProps = {
      remote,
      saveType: "NO_CHECK",
      purchaserTenantNum: invitingInfo.tenantNum,
      key: invitingInfo.investigateTemplateId,
      isQueryData: true, // invitingInfo.processStatus === 'REJECT',
      isEdit: invitingInfo.processStatus === 'INVESTIGATE',
      organizationId: invitingInfo.inviteTenantId,
      investigateTemplateId: invitingInfo.investigateTemplateId,
      investgHeaderId: headerInfo.investgHeaderId,
      onRefresh: this.getInvitingInformation,
      onSaveData: this.handleSave,
      onSaveValidateDataHook: this.getSaveValidateData,
      onSubmitHook: this.onSubmitHook,
      onChangeSaveLoading: this.handleChangeSaveLoading,
      onChangeSubmitLoading: this.handleChangeSubmitLoading,
      onChangeQueryInvestgLoading: this.handleChangeQueryInvestgLoading,
      partnerTenantId,
      defaultBankInfo,
      processStatus: invitingInfo.processStatus,
    };

    const investigationReceivedProps = {
      remote,
      saveType: "NO_CHECK",
      purchaserTenantNum: invitingInfo.tenantNum,
      key: invitingInfo.investigateTemplateId,
      isQueryData: true, // invitingInfo.processStatus === 'REJECT',
      isEdit:
        invitingInfo.processStatus === 'INVESTIGATE' ||
        (invitingInfo.processStatus === 'REJECT' && investigateStatus === 'REJECT' && finalFlag),
      organizationId: invitingInfo.tenantId,
      investigateTemplateId: invitingInfo.investigateTemplateId,
      investgHeaderId: headerInfo.investgHeaderId,
      onRefresh: this.getInvitingInformation,
      onSaveValidateDataHook: this.getSaveValidateData,
      onSubmitHook: this.onSubmitHook,
      onChangeSaveLoading: this.handleChangeSaveLoading,
      onChangeSubmitLoading: this.handleChangeSubmitLoading,
      onChangeQueryInvestgLoading: this.handleChangeQueryInvestgLoading,
      partnerTenantId,
      defaultBankInfo,
      processStatus: invitingInfo.processStatus,
      purchaserDisabled,
    };

    const approvalProps = {
      detail,
      investigateTemplateId: invitingInfo.investigateTemplateId,
      investgHeaderId: headerInfo.investgHeaderId,
      processStatus: invitingInfo.processStatus,
      onRef: (node = {}) => {
        this.approvalRef = node;
      },
    };

    const modalProps = isSend
      ? {
          visible,
          footer,
          destroyOnClose: true,
          width: 600,
          title:
            modalType === 'refuse'
              ? intl.get(`spfm.disposeInvite.view.message.title.modal.refuse`).d('拒绝说明')
              : intl.get(`spfm.disposeInvite.view.message.title.modal.supplement`).d('补充调查'),
          confirmLoading: modalLoading,
          onOk: modalType === 'refuse' ? this.handleRefuse : () => this.handleAgree(true),
          onCancel: this.handleCancel,
          okText:
            modalType === 'refuse'
              ? intl.get(`spfm.disposeInvite.view.option.refuse`).d('拒绝')
              : intl.get(`spfm.disposeInvite.view.option.agree`).d('同意合作'),
          cancelText: intl.get('hzero.common.status.cancel').d('取消'),
        }
      : {
          visible,
          destroyOnClose: true,
          width: 600,
          title:
            modalType === 'refuse'
              ? intl.get(`spfm.disposeInvite.view.message.title.modal.refuse`).d('拒绝说明')
              : intl.get(`spfm.disposeInvite.view.message.title.modal.supplement`).d('补充调查'),
          confirmLoading: modalLoading,
          onOk: modalType === 'refuse' ? this.handleRefuse : () => this.handleAgree(true),
          onCancel: this.handleCancel,
          okText:
            modalType === 'refuse'
              ? intl.get(`spfm.disposeInvite.view.option.refuse`).d('拒绝')
              : intl.get(`spfm.disposeInvite.view.option.agree`).d('同意合作'),
          cancelText: intl.get('hzero.common.status.cancel').d('取消'),
        };
    const investigateModalProps = {
      visible: investigateVisible,
      destroyOnClose: true,
      width: 640,
      title: intl.get(`spfm.disposeInvite.view.button.investigateReject`).d('调查表拒绝'),
      onOk: this.handleInvestigateAgree,
      onCancel: this.handleInvestigateCancel,
      confirmLoading: investigateRejectLoading,
      // okText:
      // cancelText: intl.get('hzero.common.status.cancel').d('取消'),
    };
    const purAgentModel = {
      selectedChildRows: changedFlag ? selectedChildRows : initialSelect,
      supplierCategoryModal,
      supplierCategoryDate,
      onRef: this.handleFecthRef,
      checkClassify: this.checkClassify,
      // onChange: this.handleShowPurAgent,
      handleCancelModal: this.handleCancelModal,
      onSaveRecord: this.saveRecordRows,
      fetchSupplierDate: this.fetchSupplierDate,
      handleRowSelect: this.handleRowSelect,
      selectedRowKeys: changedFlag
        ? selectedRowKeys
        : initialSelect.map((ele) => ele.supplierCategoryId),
    };

    const printMenu = (
      <Menu onClick={this.handlePrint}>
        {printType.map(n => (
          <Menu.Item key={n.value}>{n.meaning}</Menu.Item>
        ))}
      </Menu>
    );

    return (
      <React.Fragment>
        <Header
          backPath={backPath}
          title={intl.get(`spfm.disposeInvite.view.message.title`).d('合作邀约')}
        >
          {status === 'send'
            ? invitingInfo.inviteType === 'CUSTOMER' &&
              invitingInfo.processStatus === 'INVESTIGATE' &&
              !isEmpty(headerInfo) && (
                <React.Fragment>
                  <Button
                    {...saveButtonProps}
                    permissionList={[
                      {
                        code: `srm.partner.my-partner.invitation-list.ps.button.agree`,
                        type: 'button',
                        meaning: '企业合作邀约-按钮组',
                      },
                    ]}
                  >
                    {intl.get(`hzero.common.button.save`).d('保存')}
                  </Button>
                  <Button
                    {...submitButtonProps}
                    permissionList={[
                      {
                        code: `srm.partner.my-partner.invitation-list.ps.button.agree`,
                        type: 'button',
                        meaning: '企业合作邀约-按钮组',
                      },
                    ]}
                  >
                    {intl.get(`spfm.disposeInvite.view.button.submit`).d('提交')}
                  </Button>
                  <Button
                    icon="close"
                    style={{ marginLeft: 8 }}
                    loading={refuseLoading || buttonLoading}
                    onClick={this.showRefuseModal}
                    permissionList={[
                      {
                        code: `srm.partner.my-partner.invitation-list.ps.button.agree`,
                        type: 'button',
                        meaning: '企业合作邀约-按钮组',
                      },
                    ]}
                  >
                    {intl.get(`spfm.disposeInvite.view.option.inviteRefuse`).d('邀约拒绝')}
                  </Button>
                  <Dropdown overlay={printMenu} placement="bottomLeft">
                    <Button icon="printer" loading={buttonLoading}>
                      {intl.get('hzero.common.button.print').d('打印')}
                      {!buttonLoading && <Icon type="down" />}
                    </Button>
                  </Dropdown>
                </React.Fragment>
              )
            : invitingInfo.processStatus === 'REJECT' && investigateStatus === 'REJECT' && finalFlag
            ? invitingInfo.inviteType === 'SUPPLIER' &&
              !isEmpty(headerInfo) && !purchaserDisabled && (
                <React.Fragment>
                  <Button {...saveButtonProps}>
                    {intl.get(`hzero.common.button.save`).d('保存')}
                  </Button>
                  <Button {...submitButtonProps}>
                    {intl.get(`spfm.disposeInvite.view.button.submit`).d('提交')}
                  </Button>
                </React.Fragment>
              )
            : invitingInfo.inviteType === 'SUPPLIER' &&
              invitingInfo.processStatus === 'INVESTIGATE' &&
              !isEmpty(headerInfo) && !purchaserDisabled &&(
                <React.Fragment>
                  <Button
                    {...saveButtonProps}
                    permissionList={[
                      {
                        code: `srm.partner.my-partner.invitation-list.ps.button.agree`,
                        type: 'button',
                        meaning: '企业合作邀约-按钮组',
                      },
                    ]}
                  >
                    {intl.get(`hzero.common.button.save`).d('保存')}
                  </Button>
                  <Button
                    {...submitButtonProps}
                    permissionList={[
                      {
                        code: `srm.partner.my-partner.invitation-list.ps.button.agree`,
                        type: 'button',
                        meaning: '企业合作邀约-按钮组',
                      },
                    ]}
                  >
                    {intl.get(`spfm.disposeInvite.view.button.submit`).d('提交')}
                  </Button>
                  <Button
                    icon="close"
                    style={{ marginLeft: 8 }}
                    loading={refuseLoading || buttonLoading}
                    onClick={this.showRefuseModal}
                    permissionList={[
                      {
                        code: `srm.partner.my-partner.invitation-list.ps.button.agree`,
                        type: 'button',
                        meaning: '企业合作邀约-按钮组',
                      },
                    ]}
                  >
                    {intl.get(`spfm.disposeInvite.view.option.inviteRefuse`).d('邀约拒绝')}
                  </Button>
                  {showAiApproveFlag && (
                    <Button
                      loading={buttonLoading}
                      onClick={this.handleIntelligentReview}
                      disabled={aiApproveStatus === 'APPROVING'}
                    >
                      <span style={{ display: !buttonLoading ? 'flex' : 'initial', alignItems: 'center' }}>
                        {!buttonLoading && <IntelligentReviewIcon style={{ marginRight: '4px' }} />}
                        {intl.get('sslm.common.button.intelligentReview').d('智能预审')}
                      </span>
                    </Button>
                  )}
                  <Dropdown overlay={printMenu} placement="bottomLeft">
                    <Button icon="printer" loading={buttonLoading}>
                      {intl.get('hzero.common.button.print').d('打印')}
                      {!buttonLoading && <Icon type="down" />}
                    </Button>
                  </Dropdown>
                </React.Fragment>
              )}
          {status === "send" && invitingInfo.processStatus === "PENDING" && invitingInfo.inviteType === 'CUSTOMER'&&(
            <Button type="primary" icon="rollback" loading={withdrawLoading} onClick={this.handleWithdraw}>
              {intl.get("spfm.disposeInvite.view.option.revocation").d("撤回邀约")}
            </Button>
          )}
          {remote?remote.render("SPFM_INVITATION_DETAIL_HEADER_BTNS", null, {_this: this}):null}
        </Header>
        {remote?remote.render("SPFM_INVITATION_DETAIL_EXTRA_NODE", null, {_this: this}):null}
        {showAiApproveFlag && (
          <ResultAlert params={detail.aiApproveDTOList} aiApproveStatus={aiApproveStatus} />
        )}
        <Content>
          <Spin spinning={loading && !isEmpty(invitingInfo)}>
            {/* 我发出的邀约，注册状态 */}
            {status === 'send' && (pStatus === 'REGISTERED' || pStatus === 'DISABLED') ? (
              <div>
                <RegisterTop {...registerTopProps} />
                {invitingInfo.inviteType === 'CUSTOMER' ? (
                  // 填写调查表
                  // borderBottom: '1px solid #e8e8e8', paddingBottom: 15
                  !isEmpty(headerInfo) &&
                  invitingInfo.investigateTemplateId && (
                    <div>
                      <HeaderInfo {...headerInfoProps} />
                      <Investigation {...investigationSendProps} />
                    </div>
                  )
                ) : (
                  <div>
                    <RegisterInformation {...registerProps} />
                    {(invitingInfo.processStatus === 'SUBMIT' ||
                      invitingInfo.processStatus === 'APPROVED' ||
                      invitingInfo.processStatus === 'REJECT' ||
                      invitingInfo.processStatus === 'INVESTIGATE_APPROVING') &&
                      invitingInfo.investigateTemplateId &&
                      !isEmpty(headerInfo) &&
                      headerInfo.investgHeaderId && <Approval {...approvalProps} />}
                  </div>
                )}
              </div>
            ) : (
              ''
            )}
            {/* 我发出的邀约，认证状态 */}
            {status === 'send' && pStatus === 'CERTIFICATION' ? (
              <div>
                <CertifiTop {...certifiTopTopProps} />
                {invitingInfo.inviteType === 'CUSTOMER' ? (
                  // 填写调查表
                  // borderBottom: '1px solid #e8e8e8', paddingBottom: 15
                  !isEmpty(headerInfo) &&
                  invitingInfo.investigateTemplateId && (
                    <div>
                      <HeaderInfo {...headerInfoProps} />
                      <Investigation {...investigationSendProps} />
                    </div>
                  )
                ) : (
                  <div>
                    <RegisterInformation {...registerProps} />
                    {(invitingInfo.processStatus === 'SUBMIT' ||
                      invitingInfo.processStatus === 'APPROVED' ||
                      invitingInfo.processStatus === 'REJECT' ||
                      invitingInfo.processStatus === 'INVESTIGATE_APPROVING') &&
                      invitingInfo.investigateTemplateId &&
                      headerInfo.investgHeaderId && <Approval {...approvalProps} />}
                  </div>
                )}
              </div>
            ) : (
              ''
            )}
            {/* 我发出的邀约，已认证状态 */}
            {status === 'send' && pStatus === 'CERTIFICATED' ? (
              <div>
                <CertificatedTop {...certifiTopTopProps} />
                {invitingInfo.inviteType === 'CUSTOMER' ? (
                  // 填写调查表
                  // borderBottom: '1px solid #e8e8e8', paddingBottom: 15
                  !isEmpty(headerInfo) &&
                  invitingInfo.investigateTemplateId && (
                    <div>
                      <HeaderInfo {...headerInfoProps} />
                      <Investigation {...investigationSendProps} />
                    </div>
                  )
                ) : (
                  <div>
                    <CompanyInformation
                      key={
                        status === 'send' ? invitingInfo.inviteCompanyId : invitingInfo.companyId
                      }
                      inviteId={inviteId}
                      companyId={
                        status === 'send' ? invitingInfo.inviteSourceKey : invitingInfo.sourceKey
                      }
                      status={status}
                    />
                    {(invitingInfo.processStatus === 'SUBMIT' ||
                      invitingInfo.processStatus === 'APPROVED' ||
                      invitingInfo.processStatus === 'REJECT' ||
                      invitingInfo.processStatus === 'INVESTIGATE_APPROVING') &&
                      invitingInfo.investigateTemplateId &&
                      headerInfo.investgHeaderId && <Approval {...approvalProps} />}
                  </div>
                )}
              </div>
            ) : (
              ''
            )}
            {/* 我发出的邀约，非注册、认证、已认证状态 */}
            {status === 'send' &&
            pStatus !== 'REGISTERED' &&
            pStatus !== 'DISABLED' &&
            pStatus !== 'CERTIFICATION' &&
            pStatus !== 'CERTIFICATED' ? (
              <div>
                <SendTop {...sendTopProps} />
                {invitingInfo.inviteType === 'CUSTOMER' ? (
                  // 填写调查表
                  // borderBottom: '1px solid #e8e8e8', paddingBottom: 15
                  !isEmpty(headerInfo) &&
                  invitingInfo.investigateTemplateId && (
                    <div>
                      <HeaderInfo {...headerInfoProps} />
                      <Investigation {...investigationSendProps} />
                    </div>
                  )
                ) : (
                  <div>
                    <CompanyInformation
                      key={
                        status === 'send' ? invitingInfo.inviteCompanyId : invitingInfo.companyId
                      }
                      inviteId={inviteId}
                      companyId={
                        status === 'send' ? invitingInfo.inviteSourceKey : invitingInfo.sourceKey
                      }
                    />
                    {(invitingInfo.processStatus === 'SUBMIT' ||
                      invitingInfo.processStatus === 'APPROVED' ||
                      invitingInfo.processStatus === 'REJECT' ||
                      invitingInfo.processStatus === 'INVESTIGATE_APPROVING') &&
                      invitingInfo.investigateTemplateId &&
                      headerInfo.investgHeaderId && <Approval {...approvalProps} />}
                  </div>
                )}
              </div>
            ) : (
              ''
            )}
            {/* 我收到的邀约，非已认证状态 */}
            {status !== 'send' && pStatus !== 'CERTIFICATED' ? (
              <div>
                <ReceivedTop {...receivedTopProps} />
                {invitingInfo.inviteType === 'SUPPLIER' ? (
                  // 填写调查表
                  // borderBottom: '1px solid #e8e8e8', paddingBottom: 15
                  !isEmpty(headerInfo) &&
                  invitingInfo.investigateTemplateId && (
                    <div>
                      <HeaderInfo {...headerInfoProps} />
                      <Investigation {...investigationReceivedProps} />
                    </div>
                  )
                ) : (
                  <div>
                    <CompanyInformation
                      key={
                        status === 'send' ? invitingInfo.inviteCompanyId : invitingInfo.companyId
                      }
                      inviteId={inviteId}
                      companyId={
                        status === 'send' ? invitingInfo.inviteSourceKey : invitingInfo.sourceKey
                      }
                      // status={status}
                      noContact
                    />
                    {(invitingInfo.processStatus === 'SUBMIT' ||
                      invitingInfo.processStatus === 'APPROVED' ||
                      invitingInfo.processStatus === 'REJECT' ||
                      invitingInfo.processStatus === 'INVESTIGATE_APPROVING') &&
                      invitingInfo.investigateTemplateId &&
                      !isEmpty(headerInfo) &&
                      headerInfo.investgHeaderId && <Approval {...approvalProps} />}
                  </div>
                )}
              </div>
            ) : (
              ''
            )}
            {/* 我收到的邀约，已认证状态 */}
            {status !== 'send' && pStatus === 'CERTIFICATED' ? (
              <div>
                <ReceivedCerTop {...receivedTopProps} />
              </div>
            ) : (
              ''
            )}
          </Spin>
        </Content>
        {/* 模态框 */}
        {visible && (
          <Modal
            {...modalProps}
            // footer={[<Button key="back" onClick={this.handleCancel}>Return</Button>]}
          >
            {modalType === 'refuse' ? (
              customizeForm(
                {
                  code: 'SPFM.PARTNER_INVITE.INVITE_REFUSE', // 必传，和unitCode一一对应
                  form,
                },
                <Form layout="horizontal">
                  <Row>
                    <Col md={24} span={24}>
                      <FormItem
                        // label={intl.get(`spfm.disposeInvite.view.message.refuseReason`).d('拒绝原因')}
                        labelCol={{ span: 0 }}
                        wrapperCol={{ span: 24 }}
                      >
                        {form.getFieldDecorator(
                          'refuseReason',
                          {}
                        )(
                          <TextArea
                            rows={16}
                            placeholder={intl
                              .get(`spfm.disposeInvite.view.message.placeholder`)
                              .d('请输入拒绝说明')}
                            onChange={this.getTextValue}
                          />
                        )}
                      </FormItem>
                    </Col>
                  </Row>
                </Form>
              )
            ) : (
              <React.Fragment>
                <p style={{ color: '#999' }}>
                  {intl
                    .get(`spfm.disposeInvite.view.message.tab.describe`)
                    .d(
                      '如果选择给对方发送调查表，则当对方提交的调查表通过您的审核后，才会建立合作伙伴关系。'
                    )}
                </p>
                {this.renderForm()}
              </React.Fragment>
            )}
          </Modal>
        )}
        {/* 侧边模态框 */}
        <CompanyForm
          sideBar
          width="1000px"
          footer={null}
          inviteId={inviteId}
          companyId={status === 'send' ? invitingInfo.inviteSourceKey : invitingInfo.sourceKey}
          handleAdd={this.handleAdd}
          modalVisible={modalVisible}
          hideModal={this.hideDrawer}
        />
        {/* 合并单据侧边模态框 */}
        <CompanyForm
          sideBar
          width="1000px"
          footer={null}
          inviteId={inviteId}
          companyId={mergeCompanyId}
          handleAdd={this.handleAdd}
          modalVisible={mergeModalVisible}
          hideModal={this.hideMergeDrawer}
        />
        <InvestigatePreview {...previewProps} />
        {investigateVisible && (
          <Modal
            {...investigateModalProps}
            // footer={[<Button key="back" onClick={this.handleCancel}>Return</Button>]}
          >
            <React.Fragment>{this.renderForm(true)}</React.Fragment>
          </Modal>
        )}
        {supplierCategoryModal && <MultiSelectModal {...purAgentModel} Key="new" />}
      </React.Fragment>
    );
  }
}
