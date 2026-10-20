/**
 * index.js - 供应商录入
 * @date: 2022-03-22
 * @author: 杨一昊 <yihao.yang@going-link.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */
import { isFunction, compose, round, isEmpty, isBoolean, isArray, sum } from 'lodash';
import { Spin, Steps, Card } from 'choerodon-ui';
import { DataSet, notification, Modal, useDataSet } from 'choerodon-ui/pro';
import React, { Fragment, useState, useMemo, useEffect, useRef, useCallback } from 'react';
import querystring from 'querystring';

import remote from 'utils/remote';
import { getResponse, getCurrentLanguage, getCurrentOrganizationId } from 'utils/utils';
import { routerRedux } from 'dva/router';
import PositionAnchor from '_components/PositionAnchor';
import formatterCollections from 'utils/intl/formatterCollections';
import WithCustomize from 'srm-front-cuz/lib/c7nCustomize';
import intl from 'utils/intl';
import { Header, Content } from 'components/Page';
import { TopSection, SecondSection } from '_components/Section';
import Investigation from '@/routes/components/Investigation';
import ResultAlert from '@/routes/components/AiApprove/ResultAlert';
import EnterpriseTags from '@/routes/components/MemberSupplier/EnterpriseTags';
import {
  handleCompanyLogoUrl,
  getBankAccountTips,
  BANK_ACCOUNT_CONSTANT,
  getTabValidationErrors,
} from '@/routes/components/utils';

import {
  saveBasicInfo,
  saveCompanyInfo,
  saveCooperativeInfo,
  submitApproval,
  // fetchPortal,
  queryCurrentUserPurchaseAgent,
  handleDeleteEntry,
  companyInfoNext,
  fetchPartnerShip,
  checkSwitchInvestigate,
  saveWholeOrderData,
  fetchAiApproveData,
} from '@/services/supplierEntryService';
import { companySearchOwn } from '@/services/supplierInviteManageServices';
import { saveData } from '@/services/investigationService';
import { fetchUserDetail } from '@/services/enterpriseCertificationService';
import { RiskProfile } from '@/routes/components/EnterpriseRelationSearch';
import {
  aiApprove,
  fetchApproveStatus,
  checkBankAccountCommon,
  fetchBusinessRules,
  enterpriseTagsConfig,
} from '@/services/commonService';
import HeaderBtns from './HeaderBtns';
import EntryBaseInfo from './EntryBaseInfo'; // 录入单基础信息
import CompanyBaseInfo from './CompanyBaseInfo'; // 企业基本信息
import BusinessInfo from './BusinessInfo'; // 业务信息
import ContactPerson from './ContactPerson'; // 联系人信息
import AddressInfo from './AddressInfo'; // 地址信息
import BankAccount from './BankAccount'; // 银行信息
import InvoiceInfo from './InvoiceInfo'; // 开票信息
import FinanceInfo from './FinanceInfo'; // 财务信息
import PurchaseInfo from './PurchaseInfo'; // 采购财务信息
import AttachmentInfo from './AttachmentInfo'; // 附件信息
import InvitationInfo from './InvitationInfo'; // 邀约信息
import OtherInfo from './OtherInfo'; // 其它信息

import {
  getEntryBaseInfoDs, // 录入单基础信息Ds
  getCompanyBaseInfoDs, // 企业基本信息Ds
  getBusinessInfoDs, // 业务信息Ds
  getContactDS, // 联系人信息Ds
  getAddressInfoDS, // 地址信息Ds
  getBankInfoDS, // 银行信息Ds
  getInvoiceDS, // 开票信息Ds
  getFinanceDS, // 财务信息Ds
  getAttachmentDS, // 附件信息Ds
  getInvitationInfoDs, // 邀约信息Ds
  getOtherInfoDs, // 其它信息Ds
  getPurchaseHeaderDS, // 采购财务头
  getPurchaseLineDS, // 采购财务行
} from './stores';

import styles from './index.less';

const { Step } = Steps;
const { Link } = PositionAnchor;
const language = getCurrentLanguage();
const sourceKey = 'SUPPLIER_ENTRY';
const isChinese = language === 'zh_CN'; // 中文语言环境
const tenantId = getCurrentOrganizationId();

const customizeUnitCodeList = [
  'SSLM.SUPPLIER_ENTRY_DETAIL.ENTRY_BASIC_INFO',
  'SSLM.SUPPLIER_ENTRY_DETAIL.BASIC_INFO_OVERSEAS',
  'SSLM.SUPPLIER_ENTRY_DETAIL.BUSINESS_INFO',
  'SSLM.SUPPLIER_ENTRY_DETAIL.BUSINESS_INFO_LOGO',
  'SSLM.SUPPLIER_ENTRY_DETAIL.CONTACT_INFO',
  'SSLM.SUPPLIER_ENTRY_DETAIL.ENTRY_ADDRESS_INFO',
  'SSLM.SUPPLIER_ENTRY_DETAIL.BANK_INFO',
  'SSLM.SUPPLIER_ENTRY_DETAIL.INVOICE_FORM',
  'SSLM.SUPPLIER_ENTRY_DETAIL.ATTACHMENT_INFO',
  'SSLM.SUPPLIER_ENTRY_DETAIL.INVITATION_INFO',
  'SSLM.SUPPLIER_ENTRY_DETAIL.OTHER_FORM',
  'SSLM.SUPPLIER_ENTRY_DETAIL.PURCHASE_HEAD',
  'SSLM.SUPPLIER_ENTRY_DETAIL.PURCHASE_LINE',
  'SSLM.SUPPLIER_ENTRY_DETAIL.BASIC_INFO_DOMESTIC',
];
const companyInfoSaveCode = [
  'SSLM.SUPPLIER_ENTRY_DETAIL.CONTACT_INFO',
  'SSLM.SUPPLIER_ENTRY_DETAIL.BUSINESS_INFO',
  'SSLM.SUPPLIER_ENTRY_DETAIL.BUSINESS_INFO_LOGO',
  'SSLM.SUPPLIER_ENTRY_DETAIL.ENTRY_ADDRESS_INFO',
  'SSLM.SUPPLIER_ENTRY_DETAIL.BANK_INFO',
  'SSLM.SUPPLIER_ENTRY_DETAIL.ATTACHMENT_INFO',
  'SSLM.SUPPLIER_ENTRY_DETAIL.PURCHASE_HEAD',
  'SSLM.SUPPLIER_ENTRY_DETAIL.PURCHASE_LINE',
];

const tabCustCodes = {
  companyOtherInfo: 'SSLM.SUPPLIER_ENTRY_DETAIL.SECONDARY_INFO_CARDS',
  entryInfo: 'SSLM.SUPPLIER_ENTRY_DETAIL.ENTRY_INFO_CARDS',
};

const SupplierEntryDetail = props => {
  const {
    custLoading,
    customizeForm,
    customizeTable,
    match: {
      params: { changeReqId, editStatus },
    },
    dispatch,
    getHocInstance,
    custConfig = {},
    onLoad,
    location,
    entryDetailRemote,
    customizeBtnGroup,
  } = props;
  const isPub = location.pathname.includes('/pub/'); // 判断是否为pub页面
  const routerParam = useMemo(() => querystring.parse(location.search.substr(1)), [location]);
  const { pubEdit = 0 } = routerParam;

  const pubEditFlag = useMemo(() => !!Number(pubEdit), [pubEdit]); // 判断工作流是否可编辑

  const [currentStep, setCurrentStep] = useState(0);
  const [currentStepCode, setCurrentStepCode] = useState('entryInfo');
  const [loading, setLoading] = useState(false);
  const [checkLoading, setCheckLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(editStatus !== 'view' && !isPub);
  const [companyBaseInfo, setCompanyBaseInfo] = useState({});
  const [entryBaseInfo, setEntryBaseInfo] = useState({});
  const [purchaseSelectedRows, setPurchaseSelectedRows] = useState([]);
  const [showSurveyFlag, setShowSurveyFlag] = useState(false);
  const [userInfo, setUserInfo] = useState({});
  const [disabledObj, setDisabledObj] = useState({
    filterCompanyLovFlag: false, // 部分合作新建关系 合作信息节点需过滤已合作的子公司
    invoiceInitFlag: 1, // 开票信息可编辑且需把录单头部分信息更新至开票信息
    allDisabled: false, // 所有供应商主数据不可编辑, 且合作信息页签不展示
    companyLogoUrl: '', // 业务信息公司logo配置表的值
    partnerType: '',
  }); // 带出已认证的某些页签不让编辑
  // 平台展示页签集合
  const [configNameList, setConfigNameList] = useState([]);
  // 定位轴
  const [anchorRef, setAnchorRef] = useState(null);
  // 前置脚本 物品分类、采购员、供应商分类 单选/多选配置值
  const [supplierCategorySingleFlag, setSupplierCategorySingleFlag] = useState(false);
  const [showTagsFlag, setShowTagsFlag] = useState(true);
  const [aiApproveDTOList, setAiApproveDTOList] = useState([]);
  const [aiApproveStatus, setAiApproveStatus] = useState(null);
  const [reviewIsClick, setReviewIsClick] = useState(false);

  const remoteRef = useRef({}); // 存储埋点增加的页签ref
  const timerRef = useRef(null); // 定时器
  const timerTime = useRef(0); // 记录轮询次数

  const {
    invoiceInitFlag = 1,
    allDisabled = false,
    filterCompanyLovFlag = false,
    partnerType,
  } = disabledObj;

  const { domesticForeignRelation = 1 } = companyBaseInfo;

  const allLoading = loading || checkLoading;

  const businessInfoRef = useRef(null);
  const contactRef = useRef(null);
  const addressRef = useRef(null);
  const investigRef = useRef(null);

  const [mustCompanyTabObj, setMustCompanyTabObj] = useState({});

  const entryBaseInfoDs = useMemo(() => new DataSet(getEntryBaseInfoDs({ changeReqId })), []);
  const companyBaseInfoDs = useMemo(() => new DataSet(getCompanyBaseInfoDs({ changeReqId })), []);
  const businessInfoDs = useMemo(() => new DataSet(getBusinessInfoDs({ changeReqId })), [
    currentStep,
  ]);
  const contactPersonDs = useMemo(() => new DataSet(getContactDS({ changeReqId })), [currentStep]);
  const addressInfoDS = useMemo(() => new DataSet(getAddressInfoDS({ changeReqId })), [
    currentStep,
  ]);
  const bankInfoDsProps = entryDetailRemote.process(
    'SSLM_SUPPLIER_ENTRY_DETAIL_BANK_INFO_DS_PROPS',
    getBankInfoDS({ changeReqId })
  );
  const bankInfoDS = useMemo(() => new DataSet(bankInfoDsProps), [currentStep]);
  const invoiceDS = useMemo(
    () => new DataSet(getInvoiceDS({ changeReqId, domesticForeignRelation })),
    [currentStep]
  );
  const financeDS = useMemo(() => new DataSet(getFinanceDS({ changeReqId })), [currentStep]);
  const purchaseHeaderDS = useDataSet(() => getPurchaseHeaderDS({ changeReqId }), [changeReqId]);
  const purchaseLineDS = useDataSet(() => getPurchaseLineDS({ changeReqId }), [changeReqId]);
  const attachmentDS = useMemo(() => new DataSet(getAttachmentDS({ changeReqId })), [currentStep]);

  // 合作信息ds
  const invitInfoDsProps = getInvitationInfoDs({
    changeReqId,
    supplierCategorySingleFlag,
  });
  // 其他信息ds
  const otherInfoDsProps = getOtherInfoDs({ changeReqId });
  // 埋点修改后的ds属性
  const newInvitInfoDsProps = entryDetailRemote
    ? entryDetailRemote.process(
        'SSLM_SUPPLIER_ENTRY_DETAIL.INVITE_DS_PROCESS',
        invitInfoDsProps,
        {}
      )
    : invitInfoDsProps;
  const newOtherInfoDsProps = entryDetailRemote
    ? entryDetailRemote.process('SSLM_SUPPLIER_ENTRY_DETAIL.OTHER_DS_PROCESS', otherInfoDsProps, {})
    : otherInfoDsProps;

  const invitationInfoDs = useMemo(
    () => new DataSet(newInvitInfoDsProps),
    [currentStep, supplierCategorySingleFlag] // 这里加 currentStep 保证每次切换下一页的时候，重置DataSet, 主要是为了兼容个性化默认值不生效的问题
  );
  const otherInfoDs = useMemo(() => new DataSet(newOtherInfoDsProps), [currentStep]);

  companyBaseInfoDs.setState('isEdit', isEdit);

  const { companyName: curCompanyName, zhimaLabels } =
    companyBaseInfoDs?.current?.get(['companyName', 'zhimaLabels']) || {};

  // 页面操作展示title集合
  const optionsName = {
    create: intl.get('sslm.supplierEntryDetail.view.options.create').d('新建'),
    edit: intl.get('sslm.supplierEntryDetail.view.options.edit').d('编辑'),
    view: intl.get('sslm.supplierEntryDetail.view.options.view').d('查看'),
    pub: intl.get('sslm.supplierEntryDetail.view.options.pub').d('审批'),
  };

  // 取个性化隐藏页签配置，隐藏的页签ds不校验
  const companyInfoCustFields = (custConfig[tabCustCodes.companyOtherInfo] || {}).fields || [];
  const entryInfoCustFields = (custConfig[tabCustCodes.entryInfo] || {}).fields || [];
  const custFields = [...companyInfoCustFields, ...entryInfoCustFields];
  const custHiddenTabs = custFields.filter(item => item.visible === 0).map(item => item.fieldCode);
  const custShowTabs = companyInfoCustFields
    .filter(item => item.visible === -1 || item.visible === 1)
    .map(item => item.fieldCode);

  // 查询智能审核相关数据
  const handleAiApproveData = () => {
    fetchAiApproveData({
      documentType: 'ENTERING',
      documentId: changeReqId,
    }).then(res => {
      if (getResponse(res)) {
        setAiApproveDTOList(res);
      }
    });
    fetchApproveStatus({
      documentType: 'ENTERING',
      documentId: changeReqId,
    }).then(res => {
      if (getResponse(res)) {
        setAiApproveStatus(res.status);
      }
    });
  };
  // 进度条配置信息
  const stepsConfig = () => {
    const config = [
      {
        key: 'entryInfo',
        title: intl.get('sslm.supplierEntryDetail.view.steps.entryInfo').d('录入单信息'),
      },
      {
        key: 'companyOtherInfo',
        title: intl.get('sslm.supplierEntryDetail.view.steps.companyOtherInfo').d('企业其它信息'),
        hidden: isEmpty(custShowTabs),
      },
      {
        key: 'cooperativeInfo',
        title: intl.get('sslm.supplierEntryDetail.view.steps.cooperativeInfo').d('合作信息'),
        hidden: !!allDisabled,
      },
      {
        key: 'questionnaireInformation',
        title: intl.get('sslm.supplierEntryDetail.view.steps.investigInfo').d('调查表信息'),
        hidden: !showSurveyFlag,
      },
      {
        key: 'preview',
        title: intl.get('sslm.supplierEntryDetail.view.steps.preview').d('预览'),
      },
    ];
    return config.filter(i => !i.hidden);
  };

  const options = isPub ? 'pub' : editStatus;

  const title = `${intl
    .get('sslm.supplierEntryDetail.view.title.entryDetail', { name: optionsName[options] })
    .d(`${optionsName[options]}录入单`)}`;

  // 下一步
  const handlerNextStep = () => {
    handleSave(true);
  };

  // 上一步
  const handlerPreStep = () => {
    if (currentStepCode === 'preview' || currentStepCode === 'questionnaireInformation') {
      setIsEdit(true);
    }
    setCurrentStep(currentStep - 1);
  };

  // 提交
  const handlerSubmit = async () => {
    const notCheckFlag = allDisabled; // 已在平台存在的企业,登记信息业务信息不校验
    let checkedCompanyBaseInfo = true;
    let bussinessValidateFlag = true;
    let licenceUrlValidateFlag = true;
    let questionnaireInformationFlag = true;
    let idFrontValidateFlag = true;
    let idBackValidateFlag = true;
    const currentRecord = companyBaseInfoDs?.current;
    if (!notCheckFlag) {
      // 校验登记信息和业务信息，防止个性化配置必填字段不填
      // 营业执照
      const licenceUrlField = companyBaseInfoDs.getField('licenceUrl', currentRecord);
      licenceUrlValidateFlag = await licenceUrlField.checkValidity(currentRecord);
      // 校验个人注册身份证附件
      const idFrontField = companyBaseInfoDs.getField('idFrontUuid', currentRecord);
      idFrontValidateFlag = await idFrontField.checkValidity(currentRecord);
      const idBackField = companyBaseInfoDs.getField('idBackUuid', currentRecord);
      idBackValidateFlag = await idBackField.checkValidity(currentRecord);

      checkedCompanyBaseInfo = await companyBaseInfoDs?.current?.validate();
      // 业务信息配置隐藏不校验必填
      bussinessValidateFlag = configNameList.includes('businessInfo')
        ? await businessInfoDs?.current?.validate()
        : true;
      if (investigRef?.current) {
        questionnaireInformationFlag = await investigRef?.current.handleSaveParams();
      }
    }
    if (checkedCompanyBaseInfo && bussinessValidateFlag && questionnaireInformationFlag) {
      const cuxRes = await entryDetailRemote.event.fireEvent('cuxSubmitBefore', {
        changeReqId,
        setLoading,
        entryBaseInfoDs,
        companyBaseInfoDs,
        businessInfoDs,
        contactPersonDs,
        addressInfoDS,
        bankInfoDS,
        invoiceDS,
        financeDS,
        purchaseHeaderDS,
        purchaseLineDS,
        attachmentDS,
        invitationInfoDs,
        otherInfoDs,
      });
      if (!cuxRes) {
        return;
      }
      // 银行校验
      return handleCheckBankAccount(handleSubmit);
    } else if (!licenceUrlValidateFlag) {
      const errorMesg =
        currentRecord && Number(currentRecord.get('domesticForeignRelation')) === 0
          ? intl
              .get('sslm.supplierEntryDetail.view.message.upload.enterpriseCertificate')
              .d('请上传企业注册证书')
          : intl
              .get('sslm.supplierEntryDetail.view.message.upload.businessLicense')
              .d('请上传营业执照');
      notification.error({
        placement: 'bottomRight',
        message: errorMesg,
      });
    } else if (!idFrontValidateFlag || !idBackValidateFlag) {
      notification.error({
        placement: 'bottomRight',
        message: intl
          .get('sslm.supplierEntryDetail.view.message.upload.identityDocument')
          .d('请上传身份证件'),
      });
    } else {
      // 获取报错字段
      const errorList = [
        {
          dataSet: companyBaseInfoDs,
          tabName: intl
            .get('sslm.supplierEntryDetail.view.entry.companyBaseInfo')
            .d('企业基本信息'),
        },
        {
          dataSet: businessInfoDs,
          tabName: intl.get('sslm.supplierEntryDetail.view.entry.businessInfo').d('基础业务信息'),
        },
      ];
      getTabValidationErrors(errorList);
    }
  };

  // 提交
  const handleSubmit = () => {
    const { hostname } = window.location;
    return submitApproval({ changeReqId, hostname }).then(async res => {
      const result = getResponse(res);
      if (result) {
        const cuxRes = await entryDetailRemote.event.fireEvent('cuxSubmitAfter', {
          changeReqId,
          hostname,
          setLoading,
        });
        if (!cuxRes) {
          return;
        }
        notification.success({
          placement: 'bottomRight',
          message: intl.get('hzero.common.notification.success').d('操作成功'),
        });
        dispatch(
          routerRedux.push({
            pathname: `/sslm/supplier-entry/list`,
          })
        );
      }
    });
  };

  const handleCheckBankAccount = async (submit = () => {}) => {
    const companyName = companyBaseInfoDs.current?.get('companyName');
    const checkMode = entryBaseInfoDs.current?.get('checkMode');
    return new Promise(async () => {
      const payload = {
        documentId: changeReqId,
        documentSource: 'ENTERING',
        companyName,
      };
      setLoading(true);
      const res = await checkBankAccountCommon(payload);
      if (getResponse(res)) {
        const { bankDataFlag = true, bankNameFlag = true } = res || {};
        const checkRepeat = isBoolean(bankDataFlag) && !bankDataFlag;
        // 银行名称不一致需要前端校验的场景
        const checkDifferent =
          isBoolean(bankNameFlag) && !bankNameFlag && checkMode === 'weakCheck';
        // 埋点增加弱校验提醒
        const remoteConfirmMsg = entryDetailRemote?.process(
          'SSLM_SUPPLIER_ENTRY_DETAIL_SUBMIT_CONFIRM_MSG',
          null,
          {
            entryBaseInfoDs,
          }
        );
        if (checkRepeat || checkDifferent || remoteConfirmMsg) {
          const bankRepeatMsg = checkRepeat
            ? getBankAccountTips(BANK_ACCOUNT_CONSTANT.DUPLICATE)
            : '';
          const bankAccountDifferentMsg = checkDifferent ? getBankAccountTips() : '';
          Modal.confirm({
            title: intl.get('hzero.common.message.confirm.title').d('提示'),
            children: (
              <Fragment>
                <div>{bankRepeatMsg}</div>
                <div>{bankAccountDifferentMsg}</div>
                <div>{remoteConfirmMsg}</div>
              </Fragment>
            ),
            onOk: async () => {
              // 提交
              try {
                await submit();
              } finally {
                setLoading(false);
              }
            },
            onClose: () => {
              setLoading(false);
            },
            onCancel: () => {
              setLoading(false);
            },
          });
        } else {
          // 直接提交
          try {
            await submit();
          } finally {
            setLoading(false);
          }
        }
      } else {
        setLoading(false);
      }
    });
  };

  const getBasicInfoParam = async () => {
    const notCheckFlag = allDisabled;
    // 校验数据变更情况
    const currentRecord = companyBaseInfoDs.current;
    let payload = {};
    const firmChangeReq = entryBaseInfoDs?.current?.toJSONData();
    const comBasicReqDTO = companyBaseInfoDs?.current?.toJSONData() || {};
    const { currencyObj, registeredCountryObj, registeredCapital, ...other } = comBasicReqDTO;
    payload = {
      ...other,
      businessRegistrationNumber:
        comBasicReqDTO.domesticForeignRelation === '0'
          ? comBasicReqDTO.businessRegistrationNumber
          : null,
      registeredCapital:
        language === 'en_US'
          ? registeredCapital
            ? round(registeredCapital * 100, 6)
            : registeredCapital
          : registeredCapital,
    };
    let checkedCompanyBaseInfo = true;
    let licenceUrlValidateFlag = true;
    let idFrontValidateFlag = true;
    let idBackValidateFlag = true;
    if (!notCheckFlag) {
      checkedCompanyBaseInfo = await companyBaseInfoDs?.current?.validate();
      // 营业执照
      const licenceUrlField = companyBaseInfoDs.getField('licenceUrl', currentRecord);
      licenceUrlValidateFlag = await licenceUrlField.checkValidity(currentRecord);

      // 校验个人注册身份证附件
      const idFrontField = companyBaseInfoDs.getField('idFrontUuid', currentRecord);
      idFrontValidateFlag = await idFrontField.checkValidity(currentRecord);
      const idBackField = companyBaseInfoDs.getField('idBackUuid', currentRecord);
      idBackValidateFlag = await idBackField.checkValidity(currentRecord);
    }

    const checkedEntryBasicInfo = await entryBaseInfoDs?.current?.validate();
    if (checkedEntryBasicInfo && checkedCompanyBaseInfo) {
      if (payload.domesticForeignRelation === '0') {
        const {
          unifiedSocialCode,
          companyType,
          taxpayerType,
          licenceEndDate,
          longTermFlag,
          institutionalType,
          idType,
          idNum,
          passport,
          email,
          internationalTelCode,
          phone,
          idFrontUuid,
          idBackUuid,
          ...otherFieldValues
        } = payload;
        payload = otherFieldValues;
      }
      if (payload.domesticForeignRelation === '1') {
        const {
          businessRegistrationNumber,
          idType,
          idNum,
          passport,
          email,
          internationalTelCode,
          phone,
          idFrontUuid,
          idBackUuid,
          ...otherFieldValues
        } = payload;
        payload = otherFieldValues;
      }
      if (payload.domesticForeignRelation === '2') {
        const {
          unifiedSocialCode,
          companyType,
          taxpayerType,
          institutionalType,
          organizingInstitutionCode,
          dunsCode,
          businessRegistrationNumber,
          licenceUrl,
          ...otherFieldValues
        } = payload;
        payload = otherFieldValues;
      }
      if (isEmpty(payload.dunsCode)) {
        payload.dunsCode = null;
      }
      if (isEmpty(payload.organizingInstitutionCode)) {
        payload.organizingInstitutionCode = null;
      }
      const params = {
        firmChangeReq,
        comBasicReqDTO: {
          ...payload,
          invoiceInitFlag,
        },
        customizeUnitCode:
          'SSLM.SUPPLIER_ENTRY_DETAIL.ENTRY_BASIC_INFO,SSLM.SUPPLIER_ENTRY_DETAIL.BASIC_INFO_OVERSEAS,SSLM.SUPPLIER_ENTRY_DETAIL.BASIC_INFO_DOMESTIC',
      };
      return params;
    } else if (!licenceUrlValidateFlag) {
      const errorMesg =
        payload.domesticForeignRelation === '0'
          ? intl
              .get('sslm.supplierEntryDetail.view.message.upload.enterpriseCertificate')
              .d('请上传企业注册证书')
          : intl
              .get('sslm.supplierEntryDetail.view.message.upload.businessLicense')
              .d('请上传营业执照');
      notification.error({
        placement: 'bottomRight',
        message: errorMesg,
      });
    } else if (!idFrontValidateFlag || !idBackValidateFlag) {
      notification.error({
        placement: 'bottomRight',
        message: intl
          .get('sslm.supplierEntryDetail.view.message.upload.identityDocument')
          .d('请上传身份证件'),
      });
    } else {
      // 获取报错字段
      const errorList = [
        {
          dataSet: entryBaseInfoDs,
          tabName: intl
            .get('sslm.supplierEntryDetail.view.entry.entryBaseInfo')
            .d('录入单基础信息'),
        },
        {
          dataSet: companyBaseInfoDs,
          tabName: intl
            .get('sslm.supplierEntryDetail.view.entry.companyBaseInfo')
            .d('企业基本信息'),
        },
      ];
      getTabValidationErrors(errorList);
    }
  };

  // 保存第一个页签的数据
  const handleSaveBasicInfo = async nextFlag => {
    const params = await getBasicInfoParam();
    if (params) {
      const { comBasicReqDTO, firmChangeReq, ...others } = params;
      const payload = {
        changeReqId,
        firmChangeReq,
        comBasicReqDTO: {
          ...comBasicReqDTO,
          checkFlag: nextFlag ? true : undefined,
        },
        ...others,
        partnerType,
      };
      setLoading(true);
      saveBasicInfo(payload)
        .then(async res => {
          const result = getResponse(res);
          if (result && !res.failed) {
            notification.success({
              placement: 'bottomRight',
              message: intl.get('hzero.common.notification.success').d('操作成功'),
            });
            setCompanyBaseInfo(comBasicReqDTO);
            setEntryBaseInfo(firmChangeReq);
            await entryDetailRemote.event.fireEvent('cuxSaveBasicInfoAfter', {
              nextFlag,
              payload,
              handleQueryPartnerShip,
            });
            await Promise.all([entryBaseInfoDs.query(), companyBaseInfoDs.query()]);
            if (nextFlag) {
              // 下一步
              setCurrentStep(currentStep + 1);
            }
          }
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  const getCompanyInfoParam = async () => {
    const allTabNotCheckFlag = allDisabled;
    const businessData = businessInfoDs?.current?.toJSONData() || {};
    const contactData = contactPersonDs.toData();
    const addressData = addressInfoDS.toJSONData();
    const bankData = bankInfoDS.toData();
    const financeData = financeDS.toJSONData();
    const supChangeSync = purchaseHeaderDS?.current?.toJSONData();
    const supChangeSyncPf = purchaseLineDS.toJSONData();
    const supChangeSyncPfCount = sum([purchaseLineDS.totalCount, supChangeSyncPf.length]);
    // 处理语言环境切换
    const newFinanceData = financeData.map(n => {
      const {
        totalAssets,
        totalLiabilities,
        currentAssets,
        currentLiabilities,
        revenue,
        netProfit,
      } = n;
      const obj = {
        totalAssets: language === 'en_US' ? totalAssets * 100 : totalAssets,
        totalLiabilities: language === 'en_US' ? totalLiabilities * 100 : totalLiabilities,
        currentAssets: language === 'en_US' ? currentAssets * 100 : currentAssets,
        currentLiabilities: language === 'en_US' ? currentLiabilities * 100 : currentLiabilities,
        revenue: language === 'en_US' ? revenue * 100 : revenue,
        netProfit: language === 'en_US' ? netProfit * 100 : netProfit,
      };
      return {
        ...n,
        ...obj,
      };
    });
    const {
      industryReqList,
      industryCategoryReqList,
      serviceAreaReqList,
      ...others
    } = businessData;
    const params = {
      comBusinessReqDTO: !isEmpty(businessData)
        ? {
            ...others,
            industryReqs: industryReqList,
            industryCategoryReqs: industryCategoryReqList,
            serviceAreaReqs: serviceAreaReqList,
          }
        : null,
      comContactsReqs: (!isEmpty(contactData) && contactData) || null,
      comAddressReqs: (!isEmpty(addressData) && addressData) || null,
      comBankAccReqs: (!isEmpty(bankData) && bankData) || null,
      invoiceReq:
        (!isEmpty(invoiceDS?.current?.toJSONData()) && invoiceDS?.current?.toJSONData()) || null,
      financeReqs: (!isEmpty(newFinanceData) && newFinanceData) || null,
      comAttachmentReqs: (!isEmpty(attachmentDS.toJSONData()) && attachmentDS.toJSONData()) || null,
      dataSource: 3,
      sourceKey: 1,
      changeReqId,
      supChangeSync,
      supChangeSyncPf,
      supChangeSyncPfCount,
      checkFlag: allTabNotCheckFlag ? 0 : undefined,
      customizeUnitCode: companyInfoSaveCode.join(),
    };
    const resultValidate = await handleValidateCompanyInfo();
    const { requiredValidateFlag, contactLineValidateFlag, bankInfoLineValidateFlag } =
      resultValidate || {};
    if (requiredValidateFlag) {
      if (contactLineValidateFlag && bankInfoLineValidateFlag) {
        const remoteParams = entryDetailRemote
          ? entryDetailRemote.process(
              'SSLM_SUPPLIER_ENTRY_DETAIL_COMPANY_OTHER_INFO_SAVE_PARAMS',
              params,
              { remoteRef }
            )
          : params;
        return remoteParams;
      }
    } else {
      // 获取报错字段
      const errorList = [
        {
          dataSet: businessInfoDs,
          tabName: intl.get('sslm.supplierEntryDetail.view.entry.businessInfo').d('基础业务信息'),
        },
        {
          dataSet: contactPersonDs,
          tabName: intl.get('sslm.supplierEntryDetail.view.entry.contactPerson').d('联系人'),
        },
        {
          dataSet: addressInfoDS,
          tabName: intl.get('sslm.supplierEntryDetail.view.entry.address').d('地址'),
        },
        {
          dataSet: bankInfoDS,
          tabName: intl.get('sslm.supplierEntryDetail.view.entry.bankInfo').d('银行信息'),
        },
        {
          dataSet: invoiceDS,
          tabName: intl.get('sslm.supplierEntryDetail.view.entry.billingInfo').d('开票信息'),
        },
        {
          dataSet: financeDS,
          tabName: intl.get('sslm.supplierEntryDetail.view.entry.financialInfo').d('财务信息'),
        },
        {
          dataSet: [
            {
              subDataSet: [purchaseHeaderDS],
              subTabName: intl.get('sslm.common.view.title.purchaseHeaderInfo').d('采购财务头信息'),
            },
            {
              subDataSet: [purchaseLineDS],
              subTabName: intl.get('sslm.common.view.title.purchaseLineInfo').d('采购财务行信息'),
            },
          ],
          tabName: intl.get('sslm.common.view.title.purchaseInfo').d('采购财务信息'),
        },
        {
          dataSet: attachmentDS,
          tabName: intl.get('sslm.supplierEntryDetail.view.entry.attachmentInfo').d('附件信息'),
        },
      ];
      getTabValidationErrors(errorList);
    }
  };

  // 保存企业信息
  const handleCompanyInfo = async nextFlag => {
    const allTabNotCheckFlag = allDisabled;
    const params = await getCompanyInfoParam();
    if (params) {
      const payload = {
        ...params,
        nextFlag: nextFlag ? 1 : undefined,
      };
      const cuxRes = await entryDetailRemote.event.fireEvent('cuxHandleCompanyInfo', { payload });
      if (!cuxRes) {
        return;
      }
      setLoading(true);
      // 保存时后端无需校验门户配置的必输，下一步时需要校验
      if (nextFlag) {
        companyInfoNext(payload)
          .then(res => {
            const result = getResponse(res);
            if (result) {
              notification.success({
                placement: 'bottomRight',
                message: intl.get('hzero.common.notification.success').d('操作成功'),
              });
              if (allTabNotCheckFlag) {
                setIsEdit(false);
              }
              setCurrentStep(currentStep + 1);
            }
          })
          .finally(() => {
            setLoading(false);
          });
      } else {
        saveCompanyInfo(payload)
          .then(async res => {
            const result = getResponse(res);
            if (result) {
              // 页签隐藏current不存在所以判空处理
              await Promise.all([
                businessInfoRef.current && businessInfoRef.current.handleQueryBussiness(),
                contactRef.current && contactRef.current.handleQuery(),
                addressRef.current && addressRef.current.handleQuery(),
                bankInfoDS.query(),
                invoiceDS.query(),
                financeDS.query(),
                attachmentDS.query(),
                purchaseHeaderDS.query(),
                purchaseLineDS.query(),
              ]);

              notification.success({
                placement: 'bottomRight',
                message: intl.get('hzero.common.notification.success').d('操作成功'),
              });
            }
          })
          .finally(() => {
            setLoading(false);
          });
      }
    }
  };

  const handleValidateCompanyInfo = async () => {
    let bussinessValidateFlag = true;
    let contactValidateFlag = true;
    let addressValidateFlag = true;
    let bankValidateFlag = true;
    let invoiceValidateFlag = true;
    let financeValidateFlag = true;
    let attachmentValidateFlag = true;
    let purchaseHeaderValidateFlag = true;
    let purchaseLineValidateFlag = true;
    const contactNeedValidate = !allDisabled && configNameList.includes('spfmCompanyContact');
    const bankNeedValidate = !allDisabled && configNameList.includes('spfmCompanyBankAccount');

    if (!allDisabled) {
      bussinessValidateFlag = configNameList.includes('businessInfo')
        ? await businessInfoDs?.current?.validate()
        : true;
      contactValidateFlag = contactNeedValidate ? await contactPersonDs.validate() : true;
      addressValidateFlag = configNameList.includes('spfmCompanyAddress')
        ? await addressInfoDS.validate()
        : true;
      bankValidateFlag = bankNeedValidate ? await bankInfoDS.validate() : true;
      invoiceValidateFlag = configNameList.includes('spfmCompanyInvoice')
        ? await invoiceDS?.current?.validate()
        : true;
      financeValidateFlag = configNameList.includes('spfmCompanyFin')
        ? await financeDS.validate()
        : true;
      attachmentValidateFlag = configNameList.includes('spfmCompanyAttachment')
        ? await attachmentDS.validate()
        : true;
      purchaseHeaderValidateFlag = await purchaseHeaderDS.validate();
      purchaseLineValidateFlag = await purchaseLineDS.validate();
    }
    const requiredValidateFlag =
      bussinessValidateFlag &&
      contactValidateFlag &&
      addressValidateFlag &&
      bankValidateFlag &&
      invoiceValidateFlag &&
      financeValidateFlag &&
      attachmentValidateFlag &&
      purchaseHeaderValidateFlag &&
      purchaseLineValidateFlag;

    let contactLineValidateFlag = true;
    let bankInfoLineValidateFlag = true;
    const contactData = contactPersonDs.toData();
    const bankData = bankInfoDS.toData();
    // 必填通过在行数据
    if (requiredValidateFlag) {
      // 校验当存在启用行时，默认联系人只有一个是在启用行上
      if (contactNeedValidate) {
        // 启用行数据
        const enabledData = contactData.filter(e => e.enabledFlag);
        if (!isEmpty(enabledData)) {
          // 启用行的默认标识
          const enabledDataDefaultFlag = enabledData.filter(e => e.defaultFlag).length !== 1;
          // 所有行的默认标识
          const allDataDefaultFlag = contactData.filter(e => e.defaultFlag).length !== 1;
          if (enabledDataDefaultFlag || allDataDefaultFlag) {
            notification.warning({
              placement: 'bottomRight',
              message: intl
                .get('sslm.supplierEntryDetail.model.contactPerson.onlyDefault')
                .d('公司默认联系人必须有且仅有一个,请及时修改'),
            });
            contactLineValidateFlag = false;
          }
        }
      }
      // 校验银行账号启用时，只能有一个启用的的主账号
      if (bankData.length > 0 && bankNeedValidate) {
        // 所有行主账号
        const allDataMasterFlag = bankData.filter(b => b.masterFlag).length !== 1;
        const enabledData = bankData.filter(item => item.enabledFlag);
        // 启用行主账号
        const enabledDataMasterFlag = enabledData.filter(b => b.masterFlag).length !== 1;
        if (!isEmpty(enabledData)) {
          if (allDataMasterFlag || enabledDataMasterFlag) {
            notification.warning({
              placement: 'bottomRight',
              message: intl
                .get(`spfm.bank.view.message.warn.onlyMasterFlag`)
                .d('必须有且仅有一条银行主账户信息'),
            });
            bankInfoLineValidateFlag = false;
          }
        }
      }
    }
    return {
      requiredValidateFlag,
      contactLineValidateFlag,
      bankInfoLineValidateFlag,
    };
  };

  // 保存合作信息
  const onSaveCooperativeInfo = async (params = {}) => {
    const { nextFlag, ...payload } = params;
    setLoading(true);
    saveCooperativeInfo(payload)
      .then(async res => {
        const result = getResponse(res);
        if (result) {
          await Promise.all([invitationInfoDs.query(), otherInfoDs.query()]);
          notification.success({
            placement: 'bottomRight',
            message: intl.get('hzero.common.notification.success').d('操作成功'),
          });
          if (nextFlag) {
            const { firmEnteringParent } = result;
            const { investgHeaderId, investigateTemplateId, investigateFlag, investigateWrite } =
              firmEnteringParent || {};
            // 下一步
            if (investigateWrite === 'PURCHASE' && !!Number(investigateFlag)) {
              setIsEdit(true);
              entryBaseInfoDs.setState('investgateObj', {
                investgHeaderId,
                investigateTemplateId,
              });
              setShowSurveyFlag(true);
            } else {
              setShowSurveyFlag(false);
              setIsEdit(false);
            }
            setCurrentStep(currentStep + 1);
          }
          setLoading(false);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // 保存调查表信息
  const handleSaveQuestionnaireInformation = async nextFlag => {
    if (investigRef.current) {
      const saveParams = await investigRef.current.handleSaveParams();

      if (saveParams) {
        setLoading(true);
        const payload = {
          ...saveParams,
          checkFlag: nextFlag ? 1 : 0,
        };
        const { investgHeaderId } = entryBaseInfoDs.getState('investgateObj');
        saveData(payload, investgHeaderId)
          .then(async response => {
            const res = getResponse(response);
            if (res) {
              notification.success({
                placement: 'bottomRight',
                message: intl.get('hzero.common.notification.success').d('操作成功'),
              });
              if (nextFlag) {
                // 预览页
                setIsEdit(false);
                setCurrentStep(currentStep + 1);
                investigRef.current.handleQuery();
              } else {
                await investigRef.current.handleQuery();
              }
            }
          })
          .finally(() => {
            setLoading(false);
          });
      }
    }
  };

  // 获取合作信息参数
  const getCooperativeInfoParam = async () => {
    const notCheckFlag = allDisabled; // 已在平台存在的企业
    const {
      categoryIds,
      itemCategoryIds,
      purchaseAgentIds,
      investigateTemplateObj,
      investigateTemplateId,
      companyId,
      companyName,
      companyNum,
      investigateWrite,
      investigateFlag,
      investigateType,
      ...others
    } = invitationInfoDs?.current?.toJSONData() || {};
    let checkedInvitation = true;
    let checkedOtherInfoDs = true;
    if (!notCheckFlag) {
      // 校验信息
      checkedInvitation = await invitationInfoDs?.current?.validate();
      checkedOtherInfoDs = await otherInfoDs?.current?.validate();
    }
    if (checkedInvitation && checkedOtherInfoDs) {
      const payload = {
        changeReqId,
        firmEnteringParent: {
          ...others,
          investigateWrite,
          investigateTemplateId,
          investigateType,
          investigateFlag,
          categoryIds: isArray(categoryIds)
            ? categoryIds.map(({ categoryId }) => categoryId).join(',')
            : categoryIds && categoryIds.categoryId,
          companyIds: typeof companyName === 'object' ? companyId.join(',') : companyId,
          companyId: typeof companyName === 'object' ? companyId[0] : companyId,
          companyName: typeof companyName === 'object' ? companyName.join(',') : companyName,
          companyNum: typeof companyNum === 'object' ? companyNum.join(',') : companyNum,
          itemCategoryIds: itemCategoryIds.map(({ categoryId }) => categoryId).join(','),
          purchaseAgentIds: purchaseAgentIds
            .map(({ purchaseAgentId }) => purchaseAgentId)
            .join(','),
        },
        supChangeOther:
          (!isEmpty(otherInfoDs?.current?.toJSONData()) && otherInfoDs?.current?.toJSONData()) ||
          {},
        customizeUnitCode:
          'SSLM.SUPPLIER_ENTRY_DETAIL.OTHER_FORM,SSLM.SUPPLIER_ENTRY_DETAIL.INVITATION_INFO',
      };
      return payload;
    } else {
      // 获取报错字段
      const errorList = [
        {
          dataSet: invitationInfoDs,
          tabName: intl.get('sslm.supplierEntryDetail.view.entry.invitationInfo').d('邀请信息'),
        },
        {
          dataSet: otherInfoDs,
          tabName: intl.get('sslm.supplierEntryDetail.view.entry.otherInfo').d('其它信息'),
        },
      ];
      getTabValidationErrors(errorList);
    }
  };

  const handleCooperativeInfo = async nextFlag => {
    const saveParam = await getCooperativeInfoParam();
    if (saveParam) {
      const { firmEnteringParent, ...others } = saveParam;
      const payload = {
        firmEnteringParent: {
          ...firmEnteringParent,
          nextFlag: +nextFlag,
        },
        ...others,
      };
      const param = {
        ...payload,
        nextFlag,
      };
      // 下一步校验调查表切换
      if (nextFlag) {
        setCheckLoading(true);
        try {
          const checkRes = await checkSwitchInvestigate(payload);
          if (isBoolean(checkRes)) {
            if (checkRes) {
              Modal.confirm({
                title: intl.get('sslm.supplierEntryDetail.view.title').d('提示'),
                children: intl
                  .get('sslm.supplierEntryDetail.view.message.modifyQuestionnaire')
                  .d('您修改了发送调查表相关的字段，请确认是否取消或切换调查表。'),
                onOk: () => {
                  onSaveCooperativeInfo(param);
                },
              });
            } else {
              onSaveCooperativeInfo(param);
            }
          } else {
            getResponse(checkRes);
          }
        } finally {
          setCheckLoading(false);
        }
      } else {
        onSaveCooperativeInfo(param);
      }
    }
  };

  // 查询录入单基础信息
  const queryEntryBaseInfo = () => {
    Promise.all([entryBaseInfoDs.query(), otherInfoDs.query()]);
  };

  // 保存按钮
  const handleSave = nextFlag => {
    switch (currentStepCode) {
      case 'entryInfo':
        handleSaveBasicInfo(nextFlag);
        break;
      case 'companyOtherInfo':
        handleCompanyInfo(nextFlag);
        break;
      case 'cooperativeInfo':
        handleCooperativeInfo(nextFlag);
        break;
      case 'questionnaireInformation':
        handleSaveQuestionnaireInformation(nextFlag);
        break;
      default:
        handleSaveBasicInfo(nextFlag);
        break;
    }
  };

  const handleDelete = () => {
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      children: intl.get('sslm.supplierEntryDetail.view.message.deleteReqConfirm').d('确认删除？'),
      onOk: () => {
        setLoading(true);
        handleDeleteEntry([changeReqId])
          .then(res => {
            if (getResponse(res)) {
              notification.success({
                placement: 'bottomRight',
                message: intl.get('hzero.common.notification.success').d('操作成功'),
              });
              dispatch(
                routerRedux.push({
                  pathname: `/sslm/supplier-entry/list`,
                })
              );
            }
          })
          .finally(() => {
            setLoading(false);
          });
      },
    });
  };

  const handleEdit = () => {
    setIsEdit(true);
    setCurrentStep(0);
    dispatch(
      routerRedux.push({
        pathname: `/sslm/supplier-entry/detail/${changeReqId}/edit`,
      })
    );
  };

  const tagShowFlag = !isEmpty(zhimaLabels) && showTagsFlag && isChinese;

  const entryInfoLinkList = [
    {
      key: 'enterpriseTag',
      title: curCompanyName,
      cuzTab: true,
      hidden: !tagShowFlag || custHiddenTabs.includes('enterpriseTag'),
      cuzCode: 'enterpriseTag',
      render: () => (
        <div style={{ marginTop: 8 }}>
          <EnterpriseTags
            key={sourceKey}
            tagList={zhimaLabels}
            parentId="sslmSupplierEntry"
            tagClassName="sslm-supplier-entry"
          />
        </div>
      ),
    },
    {
      key: 'entryBaseInfo',
      cuzTab: true,
      cuzCode: 'entryBaseInfo',
      hidden: custHiddenTabs.includes('entryBaseInfo'),
      title: intl.get('sslm.supplierEntryDetail.view.entry.entryBaseInfo').d('录入单基础信息'),
      anchorTitle: intl
        .get('sslm.supplierEntryDetail.view.entry.entryBaseInfo')
        .d('录入单基础信息'),
      render: () => (
        <EntryBaseInfo
          dataSet={entryBaseInfoDs}
          custLoading={custLoading}
          customizeForm={customizeForm}
          isEdit={isEdit}
          pubEditFlag={pubEditFlag}
          customizeUnitCode="SSLM.SUPPLIER_ENTRY_DETAIL.ENTRY_BASIC_INFO"
        />
      ),
    },
    {
      key: 'riskProfile',
      cuzTab: true,
      cuzCode: 'riskProfile',
      hidden: custHiddenTabs.includes('riskProfile'),
      anchorTitle: intl.get('sslm.common.view.title.riskProfile').d('风险档案'),
      render: () => (
        <div
          style={{
            margin: isPub ? '-48px -16px -16px' : showCuzTabs ? '-56px -16px -16px' : '-16px',
          }}
        >
          <RiskProfile params={{ companyName: curCompanyName, organizationId: tenantId }} />
        </div>
      ),
    },
    {
      key: 'companyBaseInfo',
      cuzTab: true,
      cuzCode: 'companyBaseInfo',
      hidden: custHiddenTabs.includes('companyBaseInfo'),
      title: intl.get('sslm.supplierEntryDetail.view.entry.companyBaseInfo').d('企业基本信息'),
      anchorTitle: intl
        .get('sslm.supplierEntryDetail.view.entry.companyBaseInfo')
        .d('企业基本信息'),
      render: () => (
        <CompanyBaseInfo
          dataSet={companyBaseInfoDs}
          isEdit={isEdit}
          disabledObj={disabledObj}
          changeReqId={changeReqId}
          custLoading={custLoading}
          customizeForm={customizeForm}
          customizeUnitCode={
            isEmpty(companyBaseInfo)
              ? ''
              : Number(domesticForeignRelation) === 0
              ? 'SSLM.SUPPLIER_ENTRY_DETAIL.BASIC_INFO_OVERSEAS'
              : Number(domesticForeignRelation) === 1
              ? 'SSLM.SUPPLIER_ENTRY_DETAIL.BASIC_INFO_DOMESTIC'
              : ''
          }
          licenseFormcode="SSLM.SUPPLIER_ENTRY_DETAIL.BASIC_INFO_LICENSE"
        />
      ),
    },
  ].filter(item => !item.hidden);

  const newCompanyOtherInfoList = [
    {
      key: 'businessInfo',
      title: intl.get('sslm.supplierEntryDetail.view.entry.businessInfo').d('基础业务信息'),
      anchorTitle: intl.get('sslm.supplierEntryDetail.view.entry.businessInfo').d('基础业务信息'),
      cuzTab: true,
      cuzCode: 'businessInfo',
      render: () => (
        <BusinessInfo
          ref={businessInfoRef}
          dataSet={businessInfoDs}
          isEdit={isEdit}
          changeReqId={changeReqId}
          personalFlag={+domesticForeignRelation === 2}
          domesticFlag={+domesticForeignRelation}
          readOnly={!isEdit && (currentStep === 3 || editStatus === 'view')}
          customizeForm={customizeForm}
          custLoading={custLoading}
          companyBaseInfo={companyBaseInfo}
          disabledObj={disabledObj}
          customizeUnitCode="SSLM.SUPPLIER_ENTRY_DETAIL.BUSINESS_INFO"
          logoCode="SSLM.SUPPLIER_ENTRY_DETAIL.BUSINESS_INFO_LOGO"
        />
      ),
      hidden: !configNameList.includes('businessInfo'),
    },
    {
      key: 'contactPerson',
      title: intl.get('sslm.supplierEntryDetail.view.entry.contactPerson').d('联系人'),
      anchorTitle: intl.get('sslm.supplierEntryDetail.view.entry.contactPerson').d('联系人'),
      isRequired: mustCompanyTabObj.CONTACT || 1,
      cuzTab: true,
      cuzCode: 'spfmCompanyContact',
      render: () => (
        <ContactPerson
          ref={contactRef}
          changeReqId={changeReqId}
          dataSet={contactPersonDs}
          entryBaseInfo={entryBaseInfo}
          domesticForeignRelation={domesticForeignRelation}
          isEdit={isEdit}
          customizeTable={customizeTable}
          custLoading={custLoading}
          customizedCode="SSLM.SUPPLIER_ENTRY_DETAIL.CONTACT_INFO"
          disabledObj={disabledObj}
        />
      ),
      hidden: !configNameList.includes('spfmCompanyContact'),
    },
    {
      key: 'address',
      title: intl.get('sslm.supplierEntryDetail.view.entry.address').d('地址'),
      anchorTitle: intl.get('sslm.supplierEntryDetail.view.entry.address').d('地址'),
      cuzTab: true,
      cuzCode: 'spfmCompanyAddress',
      render: () => (
        <AddressInfo
          ref={addressRef}
          dataSet={addressInfoDS}
          isEdit={isEdit}
          companyBaseInfo={companyBaseInfo}
          businessInfoDs={businessInfoDs}
          domesticForeignRelation={domesticForeignRelation}
          custLoading={custLoading}
          customizeTable={customizeTable}
          customizeUnitCode="SSLM.SUPPLIER_ENTRY_DETAIL.ENTRY_ADDRESS_INFO"
          disabledObj={disabledObj}
        />
      ),
      isRequired: mustCompanyTabObj.ADDRESS,
      hidden: !configNameList.includes('spfmCompanyAddress'),
    },
    {
      key: 'bankInfo',
      title: intl.get('sslm.supplierEntryDetail.view.entry.bankInfo').d('银行信息'),
      anchorTitle: intl.get('sslm.supplierEntryDetail.view.entry.bankInfo').d('银行信息'),
      cuzTab: true,
      cuzCode: 'spfmCompanyBankAccount',
      render: () => (
        <BankAccount
          dataSet={bankInfoDS}
          isEdit={isEdit}
          companyBaseInfo={companyBaseInfo}
          customizeTable={customizeTable}
          custLoading={custLoading}
          customizedCode="SSLM.SUPPLIER_ENTRY_DETAIL.BANK_INFO"
          disabledObj={disabledObj}
          entryDetailRemote={entryDetailRemote}
        />
      ),
      isRequired: mustCompanyTabObj.BANK,
      hidden: !configNameList.includes('spfmCompanyBankAccount'),
    },
    {
      key: 'billingInfo',
      title: intl.get('sslm.supplierEntryDetail.view.entry.billingInfo').d('开票信息'),
      anchorTitle: intl.get('sslm.supplierEntryDetail.view.entry.billingInfo').d('开票信息'),
      cuzTab: true,
      cuzCode: 'spfmCompanyInvoice',
      render: () => (
        <InvoiceInfo
          dataSet={invoiceDS}
          isEdit={isEdit}
          custLoading={custLoading}
          customizeForm={customizeForm}
          disabledObj={disabledObj}
          customizeUnitCode="SSLM.SUPPLIER_ENTRY_DETAIL.INVOICE_FORM"
        />
      ),
      hidden: !configNameList.includes('spfmCompanyInvoice'),
    },
    {
      key: 'financialInfo',
      title: intl.get('sslm.supplierEntryDetail.view.entry.financialInfo').d('财务信息'),
      anchorTitle: intl.get('sslm.supplierEntryDetail.view.entry.financialInfo').d('财务信息'),
      cuzTab: true,
      cuzCode: 'spfmCompanyFin',
      render: () => (
        <FinanceInfo
          dataSet={financeDS}
          isEdit={isEdit}
          companyBaseInfo={companyBaseInfo}
          disabledObj={disabledObj}
        />
      ),
      isRequired: mustCompanyTabObj.FIN,
      hidden: !configNameList.includes('spfmCompanyFin'),
    },
    {
      key: 'purchaseInfo',
      title: intl.get('sslm.common.view.title.purchaseInfo').d('采购财务信息'),
      anchorTitle: intl.get('sslm.common.view.title.purchaseInfo').d('采购财务信息'),
      requiredTitle: intl.get('sslm.common.view.title.purchaseLineInfo').d('采购财务行信息'),
      cuzTab: true,
      cuzCode: 'purchaseInfo',
      isRequired: mustCompanyTabObj.FINPF,
      render: () => (
        <PurchaseInfo
          isEdit={isEdit}
          purchaseHeaderDS={purchaseHeaderDS}
          purchaseLineDS={purchaseLineDS}
          custLoading={custLoading}
          customizeForm={customizeForm}
          customizeTable={customizeTable}
          headerCustCode="SSLM.SUPPLIER_ENTRY_DETAIL.PURCHASE_HEAD"
          lineCustCode="SSLM.SUPPLIER_ENTRY_DETAIL.PURCHASE_LINE"
        />
      ),
      hidden: !configNameList.includes('purchaseInfo'),
    },
    {
      key: 'attachmentInfo',
      title: intl.get('sslm.supplierEntryDetail.view.entry.attachmentInfo').d('附件信息'),
      anchorTitle: intl.get('sslm.supplierEntryDetail.view.entry.attachmentInfo').d('附件信息'),
      cuzTab: true,
      cuzCode: 'spfmCompanyAttachment',
      render: () => (
        <AttachmentInfo
          dataSet={attachmentDS}
          isEdit={isEdit}
          disabledObj={disabledObj}
          custLoading={custLoading}
          customizeTable={customizeTable}
          customizeUnitCode="SSLM.SUPPLIER_ENTRY_DETAIL.ATTACHMENT_INFO"
        />
      ),
      isRequired: mustCompanyTabObj.ATTACHMENT,
      hidden: !configNameList.includes('spfmCompanyAttachment'),
    },
  ].filter(item => !item.hidden);
  const companyOtherInfoList = entryDetailRemote
    ? entryDetailRemote.process(
        'SSLM_SUPPLIER_ENTRY_DETAIL_COMPANY_OTHER_INFO_CARDS',
        newCompanyOtherInfoList,
        { isEdit, changeReqId, remoteRef }
      )
    : newCompanyOtherInfoList;

  const cooperativeInfoList = [
    {
      key: 'invitationInfo',
      title: intl.get('sslm.supplierEntryDetail.view.entry.invitationInfo').d('邀请信息'),
      anchorTitle: intl.get('sslm.supplierEntryDetail.view.entry.invitationInfo').d('邀请信息'),
      render: () => (
        <InvitationInfo
          dataSet={invitationInfoDs}
          custLoading={custLoading}
          customizeForm={customizeForm}
          isEdit={isEdit}
          pubEditFlag={pubEditFlag}
          remote={entryDetailRemote}
          otherInfoDs={otherInfoDs}
          companyBaseInfo={companyBaseInfo}
          purchaseSelectedRows={purchaseSelectedRows}
          filterCompanyLovFlag={filterCompanyLovFlag}
          customizeUnitCode="SSLM.SUPPLIER_ENTRY_DETAIL.INVITATION_INFO"
        />
      ),
    },
    {
      key: 'otherInfo',
      title: intl.get('sslm.supplierEntryDetail.view.entry.otherInfo').d('其它信息'),
      anchorTitle: intl.get('sslm.supplierEntryDetail.view.entry.otherInfo').d('其它信息'),
      render: () => (
        <OtherInfo
          dataSet={otherInfoDs}
          custLoading={custLoading}
          customizeForm={customizeForm}
          pubEditFlag={pubEditFlag}
          isEdit={isEdit}
          customizeUnitCode="SSLM.SUPPLIER_ENTRY_DETAIL.OTHER_FORM"
        />
      ),
    },
  ];

  const questionnaireInformationList = [
    entryBaseInfoDs.getState('investgateObj')?.investgHeaderId &&
      entryBaseInfoDs.getState('investgateObj')?.investigateTemplateId && {
        key: 'questionnaireInformation',
        anchorTitle: intl
          .get('sslm.supplierEntryDetail.view.entry.questionnaireInformation')
          .d('调查表信息'),
        render: () => {
          const { investgHeaderId, investigateTemplateId } = entryBaseInfoDs.getState(
            'investgateObj'
          );
          return (
            <div style={isEdit ? { minHeight: 'calc(100vh - 270px)' } : {}}>
              <Investigation
                ref={investigRef}
                editable={isEdit}
                investigateSource="supplierEntry"
                investgHeaderId={investgHeaderId}
                investigateTemplateId={investigateTemplateId}
                organizationId={getCurrentOrganizationId()}
                userInfo={userInfo}
                changeReqId={changeReqId}
                tableStyle={{ maxHeight: 'calc(100vh - 400px)' }}
                defaultBankCompanyName={companyBaseInfo.companyName}
                investgRemote={entryDetailRemote}
                otherRemoteProps={handleBurialPoint()}
              />
            </div>
          );
        },
      },
  ].filter(Boolean);

  const handleBurialPoint = () => {
    return {
      type: 'supplierEntry',
      otherProps: {
        companyBaseInfo: { ...companyBaseInfo },
      },
    };
  };

  // 根据当前步骤返回不同的定位器配置和Card配置
  const confirmShowInfo = activeStep => {
    if ((!isEdit && editStatus === 'view') || isPub) {
      return showSurveyFlag
        ? [
            ...entryInfoLinkList,
            ...companyOtherInfoList,
            ...cooperativeInfoList,
            ...questionnaireInformationList,
          ]
        : [...entryInfoLinkList, ...companyOtherInfoList, ...cooperativeInfoList];
    } else {
      switch (activeStep) {
        case 'entryInfo':
          return entryInfoLinkList;
        case 'companyOtherInfo':
          return companyOtherInfoList;
        case 'cooperativeInfo':
          return cooperativeInfoList;
        case 'preview':
          if (allDisabled) {
            return [...entryInfoLinkList, ...companyOtherInfoList];
          } else if (showSurveyFlag) {
            return [
              ...entryInfoLinkList,
              ...companyOtherInfoList,
              ...cooperativeInfoList,
              ...questionnaireInformationList,
            ];
          } else {
            return [...entryInfoLinkList, ...companyOtherInfoList, ...cooperativeInfoList];
          }
        case 'questionnaireInformation':
          return questionnaireInformationList;
        default:
          return entryInfoLinkList;
      }
    }
  };

  // 清除轮循计时器
  const clearTimerRef = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  // 轮询【智能审核】结果
  const getAiApproveResult = async () => {
    const res = getResponse(
      await fetchApproveStatus({ documentType: 'ENTERING', documentId: changeReqId })
    );
    if (res) {
      setAiApproveStatus(res.status);
      timerTime.current++;
      if (timerTime.current > 4 || res.status !== 'APPROVING') {
        timerTime.current = 0;
        clearTimerRef();
      }
    } else {
      clearTimerRef();
    }
  };

  // 【智能审核】回调
  const handleIntelligentReview = () => {
    setLoading(true);
    aiApprove({
      documentType: 'ENTERING',
      documentId: changeReqId,
    })
      .then(async response => {
        const res = getResponse(response);
        if (res) {
          notification.success({
            placement: 'bottomRight',
            message: intl.get('hzero.common.notification.success').d('操作成功'),
          });
          handleAiApproveData();
          setReviewIsClick(true);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    if (aiApproveStatus === 'APPROVING') {
      clearTimerRef();
      timerRef.current = setInterval(() => getAiApproveResult(), 5000);
      return () => {
        setReviewIsClick(false);
        clearTimerRef();
      };
    }
  }, [reviewIsClick]);

  // 操作按钮Props
  const OperationButtonsProps = {
    allLoading,
    isPub,
    isEdit,
    currentStep,
    editStatus,
    changeReqId,
    companyBaseInfo,
    customizeBtnGroup,
    stepsConfig,
    setLoading,
    handlerNextStep,
    handlerPreStep,
    handleSave,
    handlerSubmit,
    handleEdit,
    handleDelete,
    aiApproveStatus,
    entryBaseInfoDs,
    currentStepCode,
    onIntelligentReview: handleIntelligentReview,
  };
  useEffect(() => {
    const stepCode = stepsConfig()[currentStep].key;
    setCurrentStepCode(stepCode);
    // 企业其他信息和预览页重新查询要展示的平台页签
    if (['entryInfo', 'companyOtherInfo', 'preview'].includes(stepCode)) {
      entryBaseInfoDs.query().then(res => {
        if (getResponse(res)) {
          const { configNameList: tabNameList = [] } = res;
          // 标准展示的页签，个性化配置隐藏也需隐藏
          const showTabs = (tabNameList || []).filter(item => !custHiddenTabs.includes(item));
          setConfigNameList(showTabs || []);
        }
      });
    }
  }, [currentStep, showSurveyFlag]);

  useEffect(() => {
    // 前置脚本设置 物品分类、采购员、供应商分类 单选/多选配置
    companySearchOwn().then(res => {
      if (getResponse(res)) {
        const { supplierCategorySingleFlag: supplierCategoryFlag = 0 } = res;
        setSupplierCategorySingleFlag(Number(supplierCategoryFlag) === 1);
      }
    });
    // 查询合作伙伴关系标识
    handleQueryPartnerShip();
    // 查询业务规则配置
    fetchBusinessRules({ documentType: 3 }).then(resp => {
      const res = getResponse(resp);
      if (res) {
        setMustCompanyTabObj(res);
      }
    });
    companyBaseInfoDs.setQueryParameter('queryParams', {
      customizeUnitCode:
        'SSLM.SUPPLIER_ENTRY_DETAIL.BASIC_INFO_OVERSEAS,SSLM.SUPPLIER_ENTRY_DETAIL.BASIC_INFO_DOMESTIC',
    });
    // 查询企业基本信息供其它地方使用
    companyBaseInfoDs.query().then(res => {
      if (getResponse(res)) {
        setCompanyBaseInfo(res);
      }
    });

    // 查询录入单信头息供其它地方使用
    entryBaseInfoDs.query().then(res => {
      if (getResponse(res)) {
        const { configNameList: tabNameList = [] } = res;
        // 标准展示的页签，个性化配置隐藏也需隐藏
        const showTabs = (tabNameList || []).filter(item => !custHiddenTabs.includes(item));
        setConfigNameList(showTabs || []);
        setEntryBaseInfo(res);
      }
    });
    // 查询当前登陆人对应的采购员
    queryCurrentUserPurchaseAgent().then(res => {
      if (res) {
        setPurchaseSelectedRows(res);
      }
    });
    handleUserInfo();
    invitationInfoDs.query().then(res => {
      const result = getResponse(res);
      if (result) {
        const { investigateTemplateId, investgHeaderId } = result;
        if (editStatus === 'view' || isPub) {
          entryBaseInfoDs.setState('investgateObj', { investgHeaderId, investigateTemplateId });
        }
        // 以后端的调查表头id来判断是否展示调查表节点
        setShowSurveyFlag(!!investgHeaderId);
      }
    });
    handleTagsConfig();
    handleAiApproveData();
  }, []);

  useEffect(() => {
    // 处理工作流审批保存
    if (isFunction(onLoad)) {
      onLoad({
        submit: workflowSubmit,
      });
    }
    if (entryDetailRemote) {
      entryDetailRemote.event.fireEvent('cuxHandleInitValue', { entryBaseInfoDs, editStatus });
    }
  }, [companyBaseInfo.upstageFlag]);

  const workflowSubmit = approveResult => {
    return new Promise(async (resolve, reject) => {
      if (approveResult === 'Approved') {
        const basicInfo = await getBasicInfoParam();
        const companyInfo = await getCompanyInfoParam();
        const cooperativeInfo = await getCooperativeInfoParam();
        if (basicInfo && companyInfo && cooperativeInfo) {
          const { firmChangeReq, comBasicReqDTO } = basicInfo;
          const { customizeUnitCode, comBusinessReqDTO, ...others } = companyInfo;
          const { customizeUnitCode: cooperativeCode, ...otherCooperativeInfo } = cooperativeInfo;
          // 还原业务信息部分字段
          let newComBusinessReqDTO = comBusinessReqDTO;
          if (!isEmpty(comBusinessReqDTO)) {
            const {
              industryReqs,
              industryCategoryReqs,
              serviceAreaReqs,
              ...otherBusinessInfo
            } = comBusinessReqDTO;
            newComBusinessReqDTO = {
              ...otherBusinessInfo,
              industryReqList: (industryReqs || []).map(id => ({ industryId: id })),
              industryCategoryReqList: (industryCategoryReqs || []).map(id => ({
                industryCategoryId: id,
              })),
              serviceAreaReqList: (serviceAreaReqs || []).map(id => ({ serviceAreaCode: id })),
            };
          }
          const payload = {
            firmChangeReq,
            comBasicReqDTO,
            companyChangeReqDTO: {
              ...others,
              comBusinessReqDTO: newComBusinessReqDTO,
            },
            firmChangeApplyDTO: {
              ...otherCooperativeInfo,
            },
            customizeUnitCode: customizeUnitCodeList.join(','),
          };
          setLoading(true);
          saveWholeOrderData(payload)
            .then(res => {
              if (getResponse(res)) {
                resolve();
              } else {
                reject();
              }
            })
            .finally(() => {
              setLoading(false);
            });
        } else {
          reject();
        }
      } else {
        resolve();
      }
    });
  };

  const handleQueryPartnerShip = () => {
    const payload = {
      changeReqId,
      dataSource: 3,
    };
    setLoading(true);
    fetchPartnerShip(payload)
      .then(res => {
        if (getResponse(res)) {
          const { partnerType: partnerMethod, logoUrl } = res;
          // NONE_PARTNER 完全未合作  ALL_PARTNER 完全合作 PART_PARTNER_NEW 部分合作新建关系 PART_PARTNER_NO 部分合作不新建关系
          // 完全合作，部分合作选不新增关系不可编公司平台所有信息
          const allDisabledFlag = ['ALL_PARTNER', 'PART_PARTNER_NO'].includes(partnerMethod);
          const invoiceEditFlag = !allDisabled; // 开票信息可编辑且需把录单头部分信息更新至开票信息
          // 部分合作新建关系 合作信息节点需过滤已合作的子公司
          const filterCompanyLov = ['PART_PARTNER_NEW'].includes(partnerMethod);
          // 处理业务信息公司logo
          const companyLogoUrl = handleCompanyLogoUrl(logoUrl);
          setDisabledObj({
            invoiceInitFlag: invoiceEditFlag ? 1 : 0,
            filterCompanyLovFlag: filterCompanyLov,
            allDisabled: allDisabledFlag,
            companyLogoUrl,
            partnerType: partnerMethod,
          });
        }
      })
      .finally(() => setLoading(false));
  };

  // 采购方是否展示企业标签
  const handleTagsConfig = () => {
    enterpriseTagsConfig({ menuNum: '2' }).then(response => {
      const res = getResponse(response);
      if (res === 0) {
        setShowTagsFlag(false);
      }
    });
  };

  // 查询当前用户信息
  const handleUserInfo = useCallback(() => {
    // setSpinning(true);
    fetchUserDetail()
      .then(res => {
        if (getResponse(res)) {
          setUserInfo(res);
        }
      })
      .finally(() => {
        // setSpinning(false);
      });
  }, []);

  const showLink = currentStepCode === 'companyOtherInfo' || currentStepCode === 'preview';

  // 企业其他信息tab
  const companyOtherInfoTabs = confirmShowInfo(currentStepCode).filter(
    i => i.cuzTab && currentStepCode === 'companyOtherInfo'
  );
  // 录入单信息tab
  const entryInfoTabs = confirmShowInfo(currentStepCode).filter(
    i => i.cuzTab && currentStepCode === 'entryInfo'
  );
  const showCuzTabs =
    (!isEmpty(companyOtherInfoTabs) || !isEmpty(entryInfoTabs)) && editStatus !== 'view' && !isPub;
  // 当前步骤下的个性化单元
  const curCustomizeCode = useMemo(() => tabCustCodes[currentStepCode], [currentStepCode]);
  // 当前步骤下需展示的tab
  const curCustomizeTabs =
    currentStepCode === 'companyOtherInfo'
      ? companyOtherInfoTabs
      : currentStepCode === 'entryInfo'
      ? entryInfoTabs
      : [];

  const headerBtnProps = {
    isPub,
    changeReqId,
    currentStepCode,
    loading: allLoading,
    queryEntryBaseInfo,
  };

  return (
    <Fragment>
      <Header backPath={isPub ? '' : '/sslm/supplier-entry/list'} title={title}>
        <HeaderBtns {...OperationButtonsProps} />
        {entryDetailRemote &&
          entryDetailRemote.render('SSLM_SUPPLIER_ENTRY_DETAIL_HEADER_BTN', <></>, headerBtnProps)}
      </Header>
      <ResultAlert params={aiApproveDTOList} aiApproveStatus={aiApproveStatus} />
      <Content className={styles.entry}>
        <Spin spinning={allLoading}>
          <div id="supplierEntryAnchor">
            <div>
              {!isPub && editStatus !== 'view' && (
                <Content className={styles.entryStepContent}>
                  <Steps className={styles.supplierEntryDetailSteps} current={currentStep}>
                    {stepsConfig().map(({ key, title: stepTitle }) => (
                      <Step key={key} title={stepTitle} />
                    ))}
                  </Steps>
                </Content>
              )}
            </div>
            <div
              className={
                !showCuzTabs ? styles.supplierEntryDetailContent : styles['entry-cuz-tab-card']
              }
            >
              {showCuzTabs && (
                <TopSection
                  code={curCustomizeCode}
                  getHocInstance={getHocInstance}
                  getPositionAnchor={() => {
                    return anchorRef;
                  }}
                >
                  {curCustomizeTabs.map(
                    ({ key, cuzCode, title: cardTitle, render, isRequired, requiredTitle }) => {
                      const finTitle = requiredTitle || cardTitle;
                      return (
                        <div className={styles['second-section-wrap']}>
                          <SecondSection
                            title={
                              <div id={key} className={styles.supplierEntryCardTitle}>
                                {cardTitle}
                                {isEdit && !allDisabled && (
                                  <span>
                                    {isRequired
                                      ? `${intl
                                          .get(
                                            'sslm.supplierEntryDetail.view.tooltip.leastOneLine',
                                            {
                                              name: finTitle,
                                              number: isRequired,
                                            }
                                          )
                                          .d(`请至少填写${isRequired}条${finTitle}`)}`
                                      : ''}
                                  </span>
                                )}
                              </div>
                            }
                            code={cuzCode}
                          >
                            {isFunction(render) && render()}
                          </SecondSection>
                        </div>
                      );
                    }
                  )}
                </TopSection>
              )}
              {!showCuzTabs &&
                confirmShowInfo(currentStepCode).map(
                  ({ key, title: linkItemTitle, tooltip, render, isRequired }, index) => {
                    // 次要信息个性化卡片
                    return (
                      <Content
                        className={styles.entryContent}
                        style={
                          index === confirmShowInfo(currentStepCode).length - 1
                            ? { marginBottom: '8px' }
                            : {}
                        }
                        key={key}
                      >
                        <Card className={styles.supplierEntryCard} id={key} bordered={false}>
                          {linkItemTitle && (
                            <div className={styles.supplierEntryCardTitle}>
                              {linkItemTitle}
                              {isEdit && !allDisabled && (
                                <span>
                                  {isRequired
                                    ? `${intl
                                        .get('sslm.supplierEntryDetail.view.tooltip.leastOneLine', {
                                          name: linkItemTitle,
                                          number: isRequired,
                                        })
                                        .d(`请至少填写${isRequired}条${linkItemTitle}`)}`
                                    : ''}
                                </span>
                              )}
                            </div>
                          )}
                          {tooltip && (
                            <div className={styles.supplierEntryCardTooltip}>{tooltip}</div>
                          )}
                          {isFunction(render) && render()}
                        </Card>
                      </Content>
                    );
                  }
                )}
            </div>
          </div>
          {showLink && (
            <PositionAnchor
              getContainer={() => document.getElementById('supplierEntryAnchor')}
              onRef={ref => {
                setAnchorRef(ref);
              }}
            >
              {confirmShowInfo(currentStepCode).map(link => (
                <Link href={`#${link.key}`} title={link.anchorTitle} />
              ))}
            </PositionAnchor>
          )}
        </Spin>
      </Content>
    </Fragment>
  );
};

export default compose(
  formatterCollections({
    code: [
      'sslm.supplierEntryDetail',
      'sslm.common',
      'spfm.supplierRegister',
      'spfm.attachment',
      'spfm.bank',
      'spfm.importErp',
      'sslm.enterpriseInform',
      'sslm.supplierInform',
    ],
  }),
  remote(
    {
      code: 'SSLM_SUPPLIER_ENTRY_DETAIL', // 对应二开模块暴露的Expose的编码
      name: 'entryDetailRemote', // 默认 'remote'， 如有属性冲突可以改此属性
    },
    {
      events: {
        cuxHandleInvitInit() {}, // 邀请信息增加额外的初始化
        cuxSubmitAfter() {}, // 提交成功后的回调
        cuxSubmitBefore() {}, // 提交前的回调
        cuxSaveBasicInfoAfter() {}, // 保存基础信息后的回调
        cuxHandleCompanyInfo() {}, // 其他信息步骤条下保存、提交逻辑
      },
    }
  ),
  WithCustomize({
    unitCode: [
      'SSLM.SUPPLIER_ENTRY_DETAIL.HEADER_BTNS',
      'SSLM.SUPPLIER_ENTRY_DETAIL.ENTRY_BASIC_INFO', // 录入单基础信息
      'SSLM.SUPPLIER_ENTRY_DETAIL.INVOICE_FORM', // 开票信息
      'SSLM.SUPPLIER_ENTRY_DETAIL.INVITATION_INFO', // 邀约信息
      'SSLM.SUPPLIER_ENTRY_DETAIL.OTHER_FORM', // 其它信息
      'SSLM.SUPPLIER_ENTRY_DETAIL.CONTACT_INFO', // 联系人信息
      'SSLM.SUPPLIER_ENTRY_DETAIL.BUSINESS_INFO', // 业务信息
      'SSLM.SUPPLIER_ENTRY_DETAIL.BUSINESS_INFO_LOGO', // 业务信息（logo）
      'SSLM.SUPPLIER_ENTRY_DETAIL.ENTRY_ADDRESS_INFO', // 地址信息
      'SSLM.SUPPLIER_ENTRY_DETAIL.BANK_INFO', // 银行信息
      'SSLM.SUPPLIER_ENTRY_DETAIL.ATTACHMENT_INFO', // 附件信息
      'SSLM.SUPPLIER_ENTRY_DETAIL.BASIC_INFO_OVERSEAS', // 基本信息（境外）
      'SSLM.SUPPLIER_ENTRY_DETAIL.SECONDARY_INFO_CARDS', // 企业其他信息标题卡片
      'SSLM.SUPPLIER_ENTRY_DETAIL.ENTRY_INFO_CARDS', // 录入信息标题卡片
      'SSLM.SUPPLIER_ENTRY_DETAIL.PURCHASE_HEAD', // 采购财务头
      'SSLM.SUPPLIER_ENTRY_DETAIL.PURCHASE_LINE', // 采购财务行
      'SSLM.SUPPLIER_ENTRY_DETAIL.BASIC_INFO_LICENSE', // 基本信息-证件
      'SSLM.SUPPLIER_ENTRY_DETAIL.BASIC_INFO_DOMESTIC', // 基本信息（境内）
    ],
  })
)(SupplierEntryDetail);
