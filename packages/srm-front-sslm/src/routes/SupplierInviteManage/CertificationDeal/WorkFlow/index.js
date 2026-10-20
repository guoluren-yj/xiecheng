/*
 * Detail - 企业认证审批处理
 * @date: 2020/10/27 15:12:06
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component, Fragment } from 'react';
import { DataSet, Spin, Modal, Form, Output, Tooltip, notification } from 'choerodon-ui/pro';
import { Card, Tabs } from 'choerodon-ui';
import queryString from 'querystring';
import { Content } from 'components/Page';
import { Bind } from 'lodash-decorators';
import { isEmpty, camelCase, forEach, isFunction } from 'lodash';

import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import ResultAlert from '@/routes/components/AiApprove/ResultAlert';
import { getResponse, getCurrentOrganizationId, getCurrentLanguage } from 'utils/utils';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { TopSection, SecondSection } from '_components/Section';
import DynamicButtons from '_components/DynamicButtons';
import {
  batchExtractDataSetData,
  batchInitDataSetByPlainData,
  batchSetDataSetByPlainData,
} from '_utils/workflow';

import {
  getLegalDS,
  getBussinessDS,
  getContactDS,
  getAddressDS,
  getBankInfoDS,
  getInvoiceDS,
  getFinanceDS,
  getAttachmentDS,
} from '@/routes/components/EnterpriseCertification/stores/indexDS';
import { AFBasic } from 'srm-front-boot/lib/components/AFCards';
import { fetchApproveStatus, enterpriseTagsConfig } from '@/services/commonService';
import { handleJoinedMointor } from '@/routes/components/utils/utils';
import { renderStatus, getTooltipShow } from '@/routes/components/utils';
import BusinessInfo from '@/routes/components/EnterpriseCertification/components/BusinessInfo';
import ContactInfo from '@/routes/components/EnterpriseCertification/components/ContactInfo';
import AttachmentInfo from '@/routes/components/EnterpriseCertification/components/AttachmentInfo';
import AddressInfo from '@/routes/components/EnterpriseCertification/components/AddressInfo';
import BankAccount from '@/routes/components/EnterpriseCertification/components/BankAccount';
import InvoiceInfo from '@/routes/components/EnterpriseCertification/components/InvoiceInfo';
import FinanceInfo from '@/routes/components/EnterpriseCertification/components/FinanceInfo';
import { operationRecordsModal } from '@/routes/components/OperationRecords';
import EnterpriseTags from '@/routes/components/MemberSupplier/EnterpriseTags';
import { queryTabDataConfig, saveData } from '@/services/supplierInviteManageServices';
import {
  queryCompanyBasic,
  queryBussiness,
  queryContactInfo,
  queryAttachmentInfo,
  queryAddressInfo,
  queryBankInfo,
  queryInvoiceInfo,
  queryFinanceInfo,
  fetchAiApproveData,
} from '@/services/enterpriseCertificationService';
import { transformFields } from '@/routes/components/EnterpriseCertification/utils/utils';
import ManualReviewInfo from '@/routes/SupplierInviteManage/components/ManualReviewInfo';
import OtherInfo from '@/routes/SupplierInviteManage/components/OtherInfo';
import Investigation from '@/routes/components/Investigation';
import { getInvestigationDS } from '@/routes/components/Investigation/stores/getInvestigationDS';
import ComposeTable from '@/routes/components/Investigation/Compose/ComposeTable';

import { investigationTemplateHeaderQueryAll } from '@/services/investigationService';
import { dealConfigData } from '@/routes/components/Investigation/utils';
import { openRelationChart, RiskProfile } from '@/routes/components/EnterpriseRelationSearch';

import RegisterInfo from './components/RegisterInfo';
import InviteInfo from '../../components/InviteInfo';
import RegisterInviteInfo from '../Detail/components/RegisterInviteInfo';
import { inviteHeaderDS, otherInfoDS } from '../Detail/stores/indexDS';
import Supplement from './components/Supplement';

import { approvalResultDS, getManualReviewDS, getHeaderDs } from './stores/indexDS';

import { inviteInfoDS } from '../../InviteQuery/stores/indexDS';

import styles from './index.less';

const organizationId = getCurrentOrganizationId();
const language = getCurrentLanguage();
const isChinese = language === 'zh_CN'; // 中文语言环境

const REGISTER_IN = 'spfm_company_basic_in'; // 境内
const REGISTER_OUT = 'spfm_company_basic_out'; // 境外
const BUSSINESS = 'spfm_company_business';
const BANK_ACCOUNT = 'spfm_company_bank_account';
const CONTANT = 'spfm_company_contact';
const ADDRESS = 'spfm_company_address';
const INVOICE = 'spfm_company_invoice';
const FIN = 'spfm_company_fin';
const ATTACHMENT = 'spfm_company_attachment';
const { TabPane } = Tabs;

const duplicateList = [
  'sslmInvestgContact',
  'sslmInvestgAddress',
  'sslmInvestgBankAccount',
  'sslmInvestgFin',
  'sslmInvestgAttachment',
];

/**
 * 认证处理-详情
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {Object} [history={}]
 * @reactProps {Object} investigationTemDefineOrg - 数据源
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch= e => e] - redux dispatch方法
 * @return React.element
 */

@formatterCollections({
  code: [
    'sslm.enterpriseInform',
    'sslm.supplierInvite',
    'spfm.disposeInvite',
    'spfm.attachment',
    'entity.attachment',
    'spfm.enterprise',
    'sslm.investigCorrelat',
    'spfm.enterpriseCertification',
    'entity.company',
    'spfm.contactPerson',
    'spfm.supplierManage',
    'spfm.supplierRegister',
    'spfm.enterpriseCertification',
    'sslm.certificationApproval',
    'spfm.certificationApproval',
    'spfm.bank',
    'spfm.address',
    'spfm.finance',
    'spfm.common',
    'sslm.supplierInform',
    'sslm.common',
    'spfm.invitationRegister',
    'spfm.companySearch',
  ],
})
@withCustomize({
  isTemplate: true,
})
export default class Detail extends Component {
  constructor(props) {
    super(props);
    const {
      match: {
        params: { changeReqId },
      },
    } = props;
    const isPub = props.location.pathname.includes('/pub/');
    const routerParam = queryString.parse(props.location.search.substr(1));
    const {
      investigateTemplateId,
      investgHeaderId,
      // dimensionCode,
      allowSupplierInvite,
    } = routerParam;
    this.state = {
      changeReqId,
      investigateTemplateId,
      investgHeaderId,
      basic: {},
      business: {},
      adoptLoading: false,
      AFBasicLoading: true,
      // dimensionCode,
      // configNameList: [], // 展示页签
      allowSupplierInviteFlag: !!Number(allowSupplierInvite),
      showManualReviewFlag: false,
      mainDataTab: {
        bussinessInfoConfig: {},
        bankInfo: {},
        contactInfo: {},
        addressInfo: {},
        invoiceInfo: {},
        finInfo: {},
        attachmentInfo: {},
      }, // 主数据页签字段
      configLoading: false,
      queryLoading: false,
      isPub,
      activeKey: 'registerInfo',
      notDuplicateConfigList: [], // 不重合调查表页签
      duplicateConfigList: [], // 重合的调查表页签
      templateDsList: {}, // 模版ds
      showTagFlag: true, // 默认展示企业标签
      aiApproveDTOList: [],
      aiApproveStatus: null,
    };
  }

  inviteHeaderDs = new DataSet(inviteHeaderDS());

  registerInfoDs = new DataSet(getLegalDS());

  businessInfoDs = new DataSet(getBussinessDS());

  contactInfoDs = new DataSet(getContactDS());

  addressDs = new DataSet(getAddressDS());

  bankInfoDs = new DataSet(getBankInfoDS());

  financeDs = new DataSet(getFinanceDS());

  invoiceDs = new DataSet(getInvoiceDS());

  attachmentDs = new DataSet(getAttachmentDS());

  otherInfoDs = new DataSet(otherInfoDS());

  approvalResultDs = new DataSet(approvalResultDS());

  manualReviewDs = new DataSet(getManualReviewDS());

  headerDs = new DataSet(getHeaderDs());

  inviteInfoDs = new DataSet(inviteInfoDS({ inviteSupplierFlag: false }));

  fieldsConfig = {
    companyName: {
      render: ({ value }) => {
        return `${value}${intl
          .get('sslm.certificationApproval.view.message.certification')
          .d('企业认证')}`;
      },
    },
    certificationStatus: {
      render: ({ value, name, record }) => {
        return value ? (
          <div style={{ backgroundColor: '#fff', zIndex: 99 }}>
            <Tooltip title={record.get('errorMessage')}>
              {renderStatus({ value, name, record, iconType: 'call_split' })}
            </Tooltip>
          </div>
        ) : (
          ' '
        );
      },
      withoutBg: true,
    },
  };

  componentDidMount() {
    // 先查询调查表配置
    this.handleTemplateConfig();
    // 处理工作流审批
    this.handleWorkflow();
    this.handleEnterpriseTags();
    this.handleAiApproveData();
  }

  // 查询智能审核相关数据
  @Bind()
  handleAiApproveData() {
    const { changeReqId } = this.state;
    fetchAiApproveData({
      documentType: 'REGISTER',
      documentId: changeReqId,
    }).then(res => {
      if (getResponse(res)) {
        this.setState({ aiApproveDTOList: res });
      }
    });
    fetchApproveStatus({
      documentType: 'REGISTER',
      documentId: changeReqId,
    }).then(res => {
      if (getResponse(res)) {
        this.setState({ aiApproveStatus: res.status });
      }
    });
  }

  @Bind()
  handleWorkflow() {
    const { onLoad } = this.props;
    if (isFunction(onLoad)) {
      onLoad({
        submit: this.handleSubmit,
      });
    }
  }

  // 查询当前功能是否开启企业标签功能
  @Bind()
  handleEnterpriseTags() {
    enterpriseTagsConfig({ menuNum: '1' }).then(response => {
      const res = getResponse(response);
      if (res === 0) {
        this.setState({ showTagFlag: false });
      }
    });
  }

  @Bind()
  handleSubmit(approveResult) {
    return new Promise(async (resolve, reject) => {
      if (approveResult === 'Approved') {
        const payload = await this.getSaveParam();
        if (payload) {
          this.setState({
            queryLoading: true,
          });
          saveData(payload)
            .then(res => {
              if (getResponse(res)) {
                resolve(res);
              } else {
                reject();
              }
            })
            .finally(() => {
              this.setState({
                queryLoading: false,
              });
            });
        } else {
          notification.error({
            placement: 'bottomRight',
            message: intl
              .get('sslm.common.view.message.requiredMsg')
              .d('请检查是否有必填项未填写！'),
          });
          reject();
        }
      } else {
        resolve();
      }
    });
  }

  @Bind
  async getSaveParam() {
    const { changeReqId, allowSupplierInviteFlag } = this.state;
    const otherInfoValidateFlag = await this.otherInfoDs?.current.validate(true);
    const inviteValidateFlag = allowSupplierInviteFlag
      ? await this.inviteHeaderDs?.current.validate(true)
      : true;
    if (otherInfoValidateFlag && inviteValidateFlag) {
      const otherInfoData = this.otherInfoDs?.current.toData() || {};
      const inviteData = this.inviteHeaderDs?.current.toData() || {};
      const firmEnteringParent = allowSupplierInviteFlag ? inviteData : null;
      const supChangeOther = otherInfoData;
      return {
        firmEnteringParent,
        supChangeOther,
        changeReqId,
        customizeUnitCode:
          'SSLM.ENT_CER_PRO.OTHER_INFO_NEW,SSLM_CERTIFICATION_DEAL_DOCUMENT.POLICY_INVITE_INFO',
        dataSource: 4,
      };
    } else {
      return false;
    }
  }

  @Bind()
  handleTemplateConfig() {
    const { investigateTemplateId, investgHeaderId } = this.state;
    let notDuplicateConfigList = [];
    let duplicateConfigList = [];
    if (!investgHeaderId || !investigateTemplateId) {
      this.handleQueryTabConfig();
      return;
    }
    this.setState({
      configLoading: true,
    });
    investigationTemplateHeaderQueryAll({
      investigateTemplateId,
      organizationId,
      investgHeaderId,
    })
      .then(res => {
        if (getResponse(res)) {
          const { configList = [] } = dealConfigData(res) || {};
          // 过滤出重合页签
          duplicateConfigList = (configList || []).filter(item =>
            duplicateList.includes(item.configName)
          );
          // 过滤出不重合的
          notDuplicateConfigList = (configList || []).filter(
            item => !duplicateList.includes(item.configName)
          );
          this.handelTemplateDs(duplicateConfigList);
        }
      })
      .finally(() => {
        this.handleQueryTabConfig();
        this.setState({
          notDuplicateConfigList,
          duplicateConfigList,
        });
      });
  }

  // 生成调查表模版ds
  @Bind()
  handelTemplateDs(config) {
    const dsList = {};
    forEach(config, item => {
      const { configName } = item;
      const { dataSet } = this.handleDataSet(item) || {};
      dsList[configName] = dataSet;
    });
    this.setState({
      templateDsList: dsList,
    });
  }

  // 根据配置生成DataSet
  @Bind()
  handleDataSet(config) {
    const { configName } = config;
    const { investgHeaderId } = this.state;
    if (configName) {
      const dataSet = new DataSet(getInvestigationDS({ config }));
      dataSet.setQueryParameter('queryParam', {
        investgHeaderId,
        tenantId: organizationId,
      });
      dataSet.query();
      return { dataSet };
    }
  }

  /**
   * 公司信息
   */
  @Bind()
  handelCompanyInfo() {
    const { changeReqId, allowSupplierInviteFlag } = this.state;
    const routerParam = queryString.parse(this.props.location.search.substr(1));
    const { templateCode, templateVersion, stageCode } = routerParam;
    const pageCode = 'DEFAULT';

    this.inviteHeaderDs.setQueryParameter('queryParams', {
      changeReqId,
      customizeUnitCode: 'SSLM_CERTIFICATION_DEAL_DOCUMENT.POLICY_INVITE_INFO',
      cuszTplStageCode: stageCode,
      cuszTplPageCode: pageCode,
      cuszTplTemplateCode: templateCode,
      cuszTplVersion: templateVersion,
    });
    this.manualReviewDs.setQueryParameter('changeReqId', changeReqId);
    this.otherInfoDs.setQueryParameter('queryParam', {
      customizeUnitCode: 'SSLM.ENT_CER_PRO.OTHER_INFO_NEW',
      changeReqId,
    });

    const payload = {
      changeReqId,
      dataSource: 4,
    };
    const commonPayLoad = {
      // 审批头表单
      changeReqId,
      dataSource: 4,
      customizeUnitCode: 'SSLM.ENT_CER_PRO.HEADER_INFO_AF_BASIC',
      cuszTplStageCode: stageCode,
      cuszTplPageCode: pageCode,
      cuszTplTemplateCode: templateCode,
      cuszTplVersion: templateVersion,
    };
    this.otherInfoDs.setQueryParameter('cuszTplStageCode', stageCode);
    this.otherInfoDs.setQueryParameter('cuszTplPageCode', pageCode);
    this.otherInfoDs.setQueryParameter('cuszTplTemplateCode', templateCode);
    this.otherInfoDs.setQueryParameter('cuszTplVersion', templateVersion);
    this.setState({
      queryLoading: true,
    });
    Promise.all([
      // 头表单信息
      queryCompanyBasic(commonPayLoad),
      // 登记信息
      queryCompanyBasic(payload),
      // 业务信息
      queryBussiness(payload),
      // 联系人
      queryContactInfo(payload),
      // 地址
      queryAddressInfo(payload),
      // 银行
      queryBankInfo(payload),
      // 开票
      queryInvoiceInfo(payload),
      // 财务
      queryFinanceInfo(payload),
      // 附件
      queryAttachmentInfo(payload),
      this.manualReviewDs.query(),
      // 邀约
      this.inviteHeaderDs.query(),
      this.otherInfoDs.query(),
    ])
      .then(res => {
        const [
          commonInfo,
          basicInfo,
          businessInfo,
          contactInfo,
          addressInfo,
          bankInfo,
          invoiceInfo,
          financeInfo,
          attachmentInfo,
          manualReviewInfo,
        ] = res;
        let basic = {};
        let business = {};
        let showManualReviewFlag = false;
        let inviteRegister = false;
        if (getResponse(commonInfo)) {
          const {
            certificationStatus,
            certificationStatusMeaning,
            errorMessage,
            companyName,
            registeredCountryName,
            registeredCapital,
            currencyName,
            buildDate,
          } = commonInfo;
          const noNeedCertificationTips = intl
            .get(`sslm.certificationApproval.view.message.noNeedCertificationTips`)
            .d(
              '当前企业已和采购方建立合作伙伴关系，企业信息不支持在认证过程中修改，故不进行三方验证。如企业信息有误，请引导供应商在认证通过后进行企业信息变更。'
            );
          const noNeedFlag = certificationStatus === 'NO_NEED';
          const showText = errorMessage || noNeedFlag;
          this.headerDs.loadData([
            {
              companyName,
              certificationStatus,
              certificationStatusMeaning,
              registeredCountryName,
              registeredCapital,
              currencyName,
              buildDate,
              errorMessage: showText ? (noNeedFlag ? noNeedCertificationTips : errorMessage) : null,
              ...commonInfo,
            },
          ]);
        }
        if (getResponse(basicInfo)) {
          basic = basicInfo;
          this.registerInfoDs.loadData([basic]);
          const {
            certificationStatus,
            certificationStatusMeaning,
            appealReason,
            errorMessage,
            supRegisteredSource,
          } = basicInfo;
          this.approvalResultDs.loadData([
            {
              certificationStatus,
              certificationStatusMeaning,
              appealReason,
              errorMessage,
            },
          ]);
          this.inviteInfoDs.setState('inviteType', supRegisteredSource);
        }
        if (getResponse(businessInfo)) {
          business = businessInfo;
        }
        if (getResponse(contactInfo)) {
          this.contactInfoDs.loadData(contactInfo);
        }
        if (getResponse(addressInfo)) {
          this.addressDs.loadData(addressInfo);
        }
        if (getResponse(bankInfo)) {
          this.bankInfoDs.loadData(bankInfo);
        }
        if (getResponse(invoiceInfo)) {
          this.invoiceDs.loadData([invoiceInfo]);
        }
        if (getResponse(financeInfo)) {
          this.financeDs.loadData(financeInfo);
        }
        if (getResponse(attachmentInfo)) {
          this.attachmentDs.loadData(attachmentInfo);
        }
        if (getResponse(manualReviewInfo)) {
          const { attestationType, invitationCode } = manualReviewInfo;
          showManualReviewFlag = attestationType === 'MANPOWER';
          inviteRegister = !!invitationCode;
        }
        this.setState({
          basic,
          business,
          showManualReviewFlag,
          allowSupplierInviteFlag: inviteRegister ? false : allowSupplierInviteFlag,
        });
      })
      .finally(() => {
        this.setState({
          queryLoading: false,
        });
      });
  }

  // 查询表格配置
  @Bind()
  handleQueryTabConfig() {
    const { changeReqId } = this.state;
    this.setState({
      configLoading: true,
    });
    queryTabDataConfig({
      changeReqId,
    })
      .then(res => {
        if (getResponse(res)) {
          this.setState({ AFBasicLoading: true });
          const routerParam = queryString.parse(this.props.location.search.substr(1));
          const { templateCode, templateVersion, stageCode } = routerParam;
          const queryParams = new Promise(resolve => {
            resolve({
              templateCode,
              templateVersion,
            });
          });
          this.props
            .queryTemplateConfig(queryParams, {
              // 阶段编码，页面编码
              stageCode,
              pageCode: 'DEFAULT', // 审批表单页面编码
            })
            .then(() => {
              this.setState({ AFBasicLoading: false });
            });

          this.handleTabFields(res);
          // todo 查询数据
          this.handelCompanyInfo();
        }
      })
      .finally(() => {
        this.setState({
          configLoading: false,
        });
      });
  }

  // 处理字段
  @Bind()
  handleTabFields(configList = []) {
    const mainDataTab = {};
    if (!isEmpty(configList)) {
      (configList || []).forEach(item => {
        const { strategyCfLineList, configName } = item || {};
        // 登记信息（境内）
        if (configName === REGISTER_IN) {
          const { enableList } = this.handleFields(strategyCfLineList);
          const registerInConfig = {
            enableFieldList: enableList,
            configName: REGISTER_IN,
          };
          mainDataTab[REGISTER_IN] = registerInConfig;
        }
        // 登记信息（境外）
        if (configName === REGISTER_OUT) {
          const { enableList } = this.handleFields(strategyCfLineList);
          const registerOutConfig = {
            enableFieldList: enableList,
            configName: REGISTER_OUT,
          };
          mainDataTab[REGISTER_OUT] = registerOutConfig;
        }
        // 业务信息
        if (configName === BUSSINESS) {
          const { enableList } = this.handleFields(strategyCfLineList);
          const bussinessInfoConfig = {
            enableFieldList: enableList,
            configName: BUSSINESS,
          };
          mainDataTab.bussinessInfoConfig = bussinessInfoConfig;
        }
        // 银行
        if (configName === BANK_ACCOUNT) {
          const { enableList } = this.handleFields(strategyCfLineList);
          const bankInfo = {
            enableFieldList: enableList,
            configName: BANK_ACCOUNT,
          };
          mainDataTab.bankInfo = bankInfo;
        }
        // 联系人
        if (configName === CONTANT) {
          const { enableList } = this.handleFields(strategyCfLineList);
          const contactInfo = {
            enableFieldList: enableList,
            configName: CONTANT,
          };
          mainDataTab.contactInfo = contactInfo;
        }
        // 地址
        if (configName === ADDRESS) {
          const { enableList } = this.handleFields(strategyCfLineList);
          const addressInfo = {
            enableFieldList: enableList,
            configName: ADDRESS,
          };
          mainDataTab.addressInfo = addressInfo;
        }
        // 开票
        if (configName === INVOICE) {
          const { enableList } = this.handleFields(strategyCfLineList);
          const invoiceInfo = {
            enableFieldList: enableList,
            configName: INVOICE,
          };
          mainDataTab.invoiceInfo = invoiceInfo;
        }
        // 财务
        if (configName === FIN) {
          const { enableList } = this.handleFields(strategyCfLineList);
          const finInfo = {
            enableFieldList: enableList,
            configName: FIN,
          };
          mainDataTab.finInfo = finInfo;
        }
        // 附件
        if (configName === ATTACHMENT) {
          const { enableList } = this.handleFields(strategyCfLineList);
          const attachmentInfo = {
            enableFieldList: enableList,
            configName: ATTACHMENT,
          };
          mainDataTab.attachmentInfo = attachmentInfo;
        }
      });
    }
    this.setState({
      mainDataTab,
    });
  }

  @Bind()
  handleFields(lineList = []) {
    const requiredList = [];
    const enableList = [];
    (lineList || []).forEach(item => {
      // 只传启用的字段
      const { fieldCode, requiredFlag } = item;
      const formatFieldCode = camelCase(fieldCode);
      const transformField = transformFields.find(n => n.name === formatFieldCode) || {};
      const finalFieldCode = transformField.code || formatFieldCode;
      if (requiredFlag) {
        requiredList.push(finalFieldCode);
      }
      enableList.push(finalFieldCode);
    });
    return {
      requiredList,
      enableList,
    };
  }

  // 操作记录
  @Bind()
  handleOperate() {
    const { changeReqId } = this.state;
    operationRecordsModal({
      documentType: 'ENTERPRISE_APPROVAL_TENANT',
      changeReqId,
      documentId: changeReqId,
    });
  }

  @Bind()
  handleTabsChange(activeKey) {
    this.setState({ activeKey });
  }

  // 信息补录弹框
  @Bind()
  async handleSupplement() {
    const { allowSupplierInviteFlag } = this.state;
    const routerParam = queryString.parse(this.props.location.search.substr(1));
    const { templateCode, templateVersion, stageCode } = routerParam;
    // 补录其他信息
    const modalOtherInfoDs = new DataSet(this.otherInfoDs.props);
    // 补录邀约信息
    const modalInviteInfoDs = new DataSet(this.inviteHeaderDs.props);
    // 提取当前页面ds的数据
    const externalInfoData = await batchExtractDataSetData([this.otherInfoDs, this.inviteHeaderDs]);
    // 用提取的数据初始化内部表单ds，并返回初始化前后record.id的对应关系
    const mappings = batchInitDataSetByPlainData(externalInfoData, [
      modalOtherInfoDs,
      modalInviteInfoDs,
    ]);
    // 将初始化后的record.id与当前页面ds中record的对应关系转成map结构
    const initMappings = [new Map(), new Map()];
    mappings[0].forEach(([fromRecordId, targetRecordId]) => {
      initMappings[0].set(targetRecordId, fromRecordId);
    });
    mappings[1].forEach(([fromRecordId, targetRecordId]) => {
      initMappings[1].set(targetRecordId, fromRecordId);
    });
    Modal.open({
      drawer: true,
      key: Modal.key(),
      style: { width: 742 },
      title: intl.get('sslm.common.model.field.infoSupplement').d('信息补录'),
      children: (
        <Supplement
          otherInfoDs={modalOtherInfoDs}
          inviteInfoDs={modalInviteInfoDs}
          stageCode={stageCode}
          pageCode="INFO_SUPPLEMENT"
          templateCode={templateCode}
          templateVersion={templateVersion}
          allowSupplierInviteFlag={allowSupplierInviteFlag}
        />
      ),
      onOk: async () => {
        const validatorOtherFlag = await modalOtherInfoDs.validate();
        const validatorInviteFlag = allowSupplierInviteFlag
          ? await modalInviteInfoDs.validate()
          : true;
        if (validatorOtherFlag && validatorInviteFlag) {
          // 提取信息补录表单ds的数据
          const modalFromData = await batchExtractDataSetData([
            modalOtherInfoDs,
            modalInviteInfoDs,
          ]);
          // 将所提取数据中的来源recordId按照记录的对应关系，替换成当前页面ds的recordId，并过滤掉对应关系不存在的数据
          const mappingData1 = modalFromData[0].data
            .filter(r => initMappings[0].has(r[0]))
            .map(r => [initMappings[0].get(r[0]), r[1]]);
          const mappingData2 = modalFromData[1].data
            .filter(r => initMappings[1].has(r[0]))
            .map(r => [initMappings[1].get(r[0]), r[1]]);
          // 使用替换后的提取数据设置当前页面ds
          batchSetDataSetByPlainData(
            [{ data: mappingData1 }, { data: mappingData2 }],
            [[this.otherInfoDs], [this.inviteHeaderDs]]
          );
        } else {
          return false;
        }
      },
    });
  }

  @Bind()
  renderButton() {
    const { customizeBtnGroup } = this.props;
    const { queryLoading, configLoading, adoptLoading, basic } = this.state;
    const { companyName } = basic || {};
    const loading = queryLoading || configLoading || adoptLoading;
    const btns = [
      {
        name: 'infoSupplement',
        child: intl.get('sslm.common.model.field.infoSupplement').d('信息补录'),
        btnProps: {
          loading,
          color: 'primary',
          icon: 'mode_edit',
          onClick: () => this.handleSupplement(),
        },
      },
      {
        name: 'operation',
        child: intl.get(`hzero.common.button.operating`).d('操作记录'),
        btnProps: {
          icon: 'operation_service_request',
          funcType: 'flat',
          loading,
          onClick: () => this.handleOperate(),
        },
      },
      {
        name: 'relationSearch',
        child: intl.get('sslm.common.view.common.relationSearch').d('关系排查'),
        btnProps: {
          icon: 'relate',
          funcType: 'flat',
          onClick: () =>
            openRelationChart({
              supplierCompanyName: companyName,
              businessType: 'SUPPLIER_INVITATION',
            }),
        },
      },
      {
        name: 'riskScan',
        child: intl.get('sslm.common.view.button.isScan').d('风险扫描'),
        btnProps: {
          loading,
          icon: 'document_scanner-o',
          funcType: 'flat',
          onClick: () =>
            handleJoinedMointor({
              companyName,
              documentType: 'SSLM_CERTIFICATION_TENANT_APPROVAL',
              setLoading: flag => this.setState({ queryLoading: flag }),
            }),
        },
      },
    ];
    return customizeBtnGroup(
      {
        code: 'SSLM_CERTIFICATION_DEAL_DOCUMENT.HEADER_BTNS',
        pro: true,
      },
      <DynamicButtons trigger="hover" defaultBtnType="c7n-pro" buttons={btns} />
    );
  }

  render() {
    const {
      changeReqId,
      basic,
      business,
      adoptLoading,
      investigateTemplateId,
      investgHeaderId,
      // dimensionCode,
      // configNameList = [],
      mainDataTab = {},
      configLoading,
      queryLoading,
      allowSupplierInviteFlag,
      isPub,
      showManualReviewFlag,
      activeKey,
      showTagFlag,
      notDuplicateConfigList,
      templateDsList = {},
      duplicateConfigList,
      AFBasicLoading,
      aiApproveStatus,
      aiApproveDTOList,
    } = this.state;
    const { customizeForm, customizeCommon, getHocInstance } = this.props;

    const {
      bussinessInfoConfig = {},
      bankInfo = {},
      contactInfo = {},
      addressInfo = {},
      invoiceInfo = {},
      finInfo = {},
      attachmentInfo = {},
    } = mainDataTab;
    const loading = queryLoading || configLoading || adoptLoading;
    const {
      reqStatus,
      appealReason,
      inviteId,
      supRegisteredSource,
      zhimaLabels,
      companyName,
    } = basic;
    // 邀请注册展示邀约信息
    const showInviteInfo = supRegisteredSource === 'REGISTER';
    // 状态为 SUBMIT，WFL_REJECT 时显示操作按钮
    const isEdit = ['SUBMIT', 'WFL_REJECT'].includes(reqStatus);
    const tagShowFlag = showTagFlag && !isEmpty(zhimaLabels) && isChinese;
    const isDisable = isPub || !isEdit;
    const enterpriseList = [
      {
        key: 'registerInfo',
        title: intl.get(`spfm.enterprise.view.message.registerInfo`).d('登记信息'),
        hidden: false,
        component: RegisterInfo,
        props: {
          mainDataTab,
          dataSet: this.registerInfoDs,
          basic,
          isTenantApprove: true,
        },
      },
      {
        key: 'bussiness',
        title: intl.get(`spfm.enterprise.view.message.business`).d('基础业务信息'),
        hidden: isEmpty(bussinessInfoConfig),
        component: BusinessInfo,
        props: {
          dataSet: this.businessInfoDs,
          business,
          bussinessInfoConfig,
        },
      },
      // 有调查表展示调查表
      {
        key: 'contactInfo',
        title: intl.get(`spfm.enterprise.view.message.contact`).d('联系人信息'),
        hidden: isEmpty(contactInfo) && !templateDsList.sslmInvestgContact,
        component: templateDsList.sslmInvestgContact ? ComposeTable : ContactInfo,
        props: templateDsList.sslmInvestgContact
          ? {
              dataSet: templateDsList.sslmInvestgContact,
              columns: (duplicateConfigList.find(i => i.configName === 'sslmInvestgContact') || {})
                .lines,
              editable: false,
              configName: 'sslmInvestgAddress',
            }
          : {
              dataSet: this.contactInfoDs,
              contactInfo,
            },
      },
      // 有调查表展示调查表
      {
        key: 'addressInfo',
        title: intl.get(`spfm.enterprise.view.message.page.addressInfo`).d('地址信息'),
        hidden: isEmpty(addressInfo) && !templateDsList.sslmInvestgAddress,
        component: templateDsList.sslmInvestgAddress ? ComposeTable : AddressInfo,
        props: templateDsList.sslmInvestgAddress
          ? {
              dataSet: templateDsList.sslmInvestgAddress,
              columns: (duplicateConfigList.find(i => i.configName === 'sslmInvestgAddress') || {})
                .lines,
              editable: false,
              configName: 'sslmInvestgAddress',
            }
          : {
              dataSet: this.addressDs,
              addressInfo,
            },
      },
      // 有调查表展示调查表
      {
        key: 'bankInfo',
        title: intl.get('spfm.enterprise.view.message.page.bankInfo').d('银行信息'),
        hidden: isEmpty(bankInfo) && !templateDsList.sslmInvestgBankAccount,
        component: templateDsList.sslmInvestgBankAccount ? ComposeTable : BankAccount,
        props: templateDsList.sslmInvestgBankAccount
          ? {
              dataSet: templateDsList.sslmInvestgBankAccount,
              columns: (
                duplicateConfigList.find(i => i.configName === 'sslmInvestgBankAccount') || {}
              ).lines,
              configName: 'sslmInvestgBankAccount',
              editable: false,
            }
          : {
              dataSet: this.bankInfoDs,
              bankInfo,
            },
      },
      {
        key: 'invoiceInfo',
        title: intl.get('spfm.enterprise.view.message.page.invoiceInfo').d('开票信息'),
        hidden: isEmpty(invoiceInfo),
        component: InvoiceInfo,
        props: {
          dataSet: this.invoiceDs,
          invoiceInfo,
        },
      },
      // 有调查表展示调查表
      {
        key: 'finInfo',
        title: intl.get('spfm.enterprise.view.message.page.financeInfo').d('财务信息'),
        hidden: isEmpty(finInfo) && !templateDsList.sslmInvestgFin,
        component: templateDsList.sslmInvestgFin ? ComposeTable : FinanceInfo,
        props: templateDsList.sslmInvestgFin
          ? {
              dataSet: templateDsList.sslmInvestgFin,
              columns: (duplicateConfigList.find(i => i.configName === 'sslmInvestgFin') || {})
                .lines,
              editable: false,
              configName: 'sslmInvestgFin',
            }
          : {
              dataSet: this.financeDs,
              finInfo,
            },
      },
      // 有调查表展示调查表
      {
        key: 'attachmentInfo',
        title: intl.get(`spfm.enterprise.view.message.attachment`).d('附件信息'),
        hidden: isEmpty(attachmentInfo) && !templateDsList.sslmInvestgAttachment,
        component: templateDsList.sslmInvestgAttachment ? ComposeTable : AttachmentInfo,
        props: templateDsList.sslmInvestgAttachment
          ? {
              dataSet: templateDsList.sslmInvestgAttachment,
              columns: (
                duplicateConfigList.find(i => i.configName === 'sslmInvestgAttachment') || {}
              ).lines,
              configName: 'sslmInvestgAttachment',
              editable: false,
            }
          : {
              dataSet: this.attachmentDs,
              attachmentInfo,
            },
      },
      {
        key: 'otherInfo',
        title: intl.get(`spfm.enterprise.view.message.otherInfo`).d('其他信息'),
        hidden: false,
        component: OtherInfo,
        props: {
          dataSet: this.otherInfoDs,
          changeReqId,
          customizeForm,
          isDisable,
          source: 'workFlow',
        },
      },
    ].filter(i => !i.hidden);

    return (
      <Fragment>
        <Content className={styles['invite-certification-work-detail']}>
          {AFBasicLoading ? (
            <Spin spinning={AFBasicLoading} />
          ) : (
            <Spin spinning={loading}>
              <div style={{ margin: '0 8px -8px' }}>
                <ResultAlert params={aiApproveDTOList} aiApproveStatus={aiApproveStatus} />
              </div>
              {customizeCommon(
                {
                  code: 'SSLM.ENT_CER_PRO.HEADER_INFO_AF_BASIC',
                  processUnitTag: 'AF-BASIC',
                },
                <AFBasic
                  dataSet={this.headerDs}
                  titleField="companyName"
                  tagFields={['certificationStatus', 'registeredCountryName']}
                  normalFields={['registeredCapital', 'currencyName', 'buildDate']}
                  fieldsConfig={this.fieldsConfig}
                  contentBottomRender={this.renderButton}
                />
              )}
              {appealReason && (
                <Card bordered={false} className="manual-review">
                  <div className="card-titile">
                    {intl.get(`spfm.enterprise.view.message.appealReason`).d('申诉原因')}
                  </div>
                  <div style={{ padding: '0 20px 20px 20px' }}>
                    {intl
                      .get('spfm.enterprise.view.message.appealReasonTips')
                      .d(
                        '如果供应商填写的某些企业信息无法通过征信的自动校验，且销售员对自动拒绝的原因有疑义，会提交申诉转至人工审批；您需参考供应商的申诉原因人工判断校验结果是否有误。'
                      )}
                  </div>
                  <Form
                    dataSet={this.approvalResultDs}
                    columns={3}
                    labelLayout="vertical"
                    className="c7n-pro-vertical-form-display"
                  >
                    <Output name="appealReason" />
                  </Form>
                </Card>
              )}
              {showManualReviewFlag && (
                <Card bordered={false} className="manual-review">
                  <div className="card-titile">
                    {intl.get(`spfm.enterprise.view.message.manualReview`).d('企业验证-人工材料')}
                  </div>
                  <ManualReviewInfo dataSet={this.manualReviewDs} />
                </Card>
              )}
              {/* 邀约注册单独做个性化tab页 */}
              <TopSection
                code="SSLM_CERTIFICATION_DEAL_DOCUMENT.CARDS"
                getHocInstance={getHocInstance}
                className={styles['detail-cuz-card']}
              >
                {/* 供应商关系排查 */}
                <SecondSection code="riskProfile">
                  <RiskProfile params={{ companyName: basic.companyName, organizationId }} />
                </SecondSection>
                {showInviteInfo && (
                  <SecondSection
                    code="inviteRegisterInfo"
                    title={intl
                      .get('spfm.enterprise.view.message.inviteRegisterInfo')
                      .d('邀请注册信息')}
                  >
                    <div className={styles['cuz-card-second-card']}>
                      <InviteInfo
                        dataSet={this.inviteInfoDs}
                        customizeForm={customizeForm}
                        inviteType="REGISTER"
                        inviteId={inviteId}
                      />
                    </div>
                  </SecondSection>
                )}
              </TopSection>
              {tagShowFlag && (
                <div className={styles['enterprise-tags-wrap']}>
                  <div className={styles['enterprise-tags-title']}>{companyName}</div>
                  <EnterpriseTags
                    tagList={zhimaLabels}
                    key="CERTIFICATION_DEAL_WORKFLOW"
                    parentId="sslmCertificationDealWorkflow"
                    tagClassName="sslm-certification-deal-workflow"
                  />
                </div>
              )}
              <Card
                bordered={false}
                className="enterprise-information"
                title={
                  <div className="card-titile">
                    {intl.get('spfm.enterprise.view.message.enterpriseinformation').d('企业信息')}
                  </div>
                }
              >
                <Tabs
                  tabPosition="left"
                  customizable={false}
                  activeKey={activeKey}
                  onChange={this.handleTabsChange}
                  tabBarStyle={{
                    maxWidth: '180px',
                    margin: '0 -1px 0 0',
                    width: 'auto',
                  }}
                >
                  {enterpriseList.map(item => (
                    <TabPane forceRender tab={getTooltipShow(item.title, 14, 120)} key={item.key}>
                      {React.createElement(item.component, item.props)}
                    </TabPane>
                  ))}
                </Tabs>
              </Card>
              {allowSupplierInviteFlag && (
                <Card
                  bordered={false}
                  className="enterprise-information"
                  title={
                    <div className="card-titile">
                      {intl.get(`sslm.supplierInvite.view.title.inviteInfo`).d('邀约信息')}
                    </div>
                  }
                >
                  <RegisterInviteInfo
                    dataSet={this.inviteHeaderDs}
                    isEdit={false}
                    customizeForm={customizeForm}
                    code="SSLM_CERTIFICATION_DEAL_DOCUMENT.POLICY_INVITE_INFO"
                  />
                </Card>
              )}
              {!isEmpty(notDuplicateConfigList) && (
                <Card
                  bordered={false}
                  className="invest-info"
                  title={
                    <div className="card-titile">
                      {intl.get('sslm.common.view.message.investigInfo').d('调查表信息')}
                    </div>
                  }
                >
                  <Investigation
                    showTabBar={false}
                    editable={false}
                    investgHeaderId={investgHeaderId}
                    investigateTemplateId={investigateTemplateId}
                    organizationId={organizationId}
                    filertDuplicateTabFlag={1}
                    _status="approval"
                  />
                </Card>
              )}
            </Spin>
          )}
        </Content>
      </Fragment>
    );
  }
}
