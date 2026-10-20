/*
 * @Date: 2023-08-25
 * @Author: CDJ <dengji.chen@hand-china.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import intl from 'utils/intl';
import { DataSet } from 'choerodon-ui/pro';
import { getCurrentOrganizationId } from 'utils/utils';

import WrapperComponent from '@/routes/components/Investigation/components/WrapperComponent';
import ComposeTable from '@/routes/components/Investigation/Compose/ComposeTable';
import ViewTable from '@/routes/components/Investigation/Compare/CompareTable';
import { INVESTG_CONFIG_NAME } from '@/routes/components/utils';

import { getInvestgProps } from '../../../utils';

import Bank from '../Bank';
import Invoice from '../Invoice';
import Address from '../Address';
import Contact from '../Contact';
import Business from '../Business';
import Register from '../Register';
import OtherInfo from '../OtherInfo';
import Attachment from '../Attachment';
import FinancialInform from '../FinancialInfo';
import SupplierClassify from '../SupplierClassify';

import { getBankDS } from '../../../stores/getBankDS';
import { getContactDS } from '../../../stores/getContactDS';
import { getAddressDS } from '../../../stores/getAddressDS';
import { getInvoiceDS } from '../../../stores/getInvoiceDS';
import { getRegisterDS } from '../../../stores/getRegisterDS';
import { getBusinessDS } from '../../../stores/getBusinessDS';
import { getOtherInfoDS } from '../../../stores/getOtherInfoDS';
import { getAttachmentDS } from '../../../stores/getAttachmentDS';
import { getFinancialDS } from '../../../stores/getFinancialDS';
import { getSupplierClassifyDS } from '../../../stores/getSupplierClassifyDS';

const currentOrganizationId = getCurrentOrganizationId();

const {
  SSLM_INVESTG_CONTACT,
  SSLM_INVESTG_ADDRESS,
  SSLM_INVESTG_BANK_ACCOUNT,
  SSLM_INVESTG_ATTACHMENT,
  SSLM_INVESTG_FIN,
} = INVESTG_CONFIG_NAME;

export const getPanelList = ({
  remote,
  isAllPlatform = true,
  partnerTenantId = '-1',
  readOnlyFlag = false,
  operateType = '',
  configNames = [],
  personalFlag = false, // 个人认证标识
  temptConfig = {},
  changeReqId,
  cusCodeSuorce = 'function',
  hiddenPlatformTabs = [], // 隐藏平台页签
} = {}) => {
  const commonprops = {
    isAllPlatform,
    partnerTenantId,
    readOnlyFlag,
    operateType,
    personalFlag,
  };
  const investgQueryParam = {
    changeReqId,
    purchaserTenantId: partnerTenantId,
    dataSource: 1,
    tenantId: currentOrganizationId,
    changeType: operateType,
  };

  const hiddenTabFlag = operateType === 'MODIFY';
  const investgProps = getInvestgProps({
    remote,
    temptConfig,
    queryParam: investgQueryParam,
    editable: !readOnlyFlag,
  });
  // 调查表页签集合
  const { configNameList = [] } = investgProps;
  const panelList = [
    {
      isForm: true,
      key: 'basicInfo',
      saveParamKey: isAllPlatform ? 'comBasicReq' : 'supBasicReq',
      tab: intl.get('sslm.supplierDetail.view.fixCatalog.registInform').d('登记信息'),
      hidden: !configNames.includes('basicInfo') && hiddenTabFlag,
    },
    {
      isForm: true,
      key: 'businessInfo',
      saveParamKey: isAllPlatform ? 'comBusinessReqDTO' : 'supBusinessReqDTO',
      tab: intl.get('sslm.supplierDetail.view.fixCatalog.businessInform').d('基础业务信息'),
      hidden: !configNames.includes('businessInfo') && hiddenTabFlag,
    },
    {
      key: 'contactInfo',
      saveParamKey: getSaveParamKey({
        configName: SSLM_INVESTG_CONTACT,
        configNameList,
        isAllPlatform,
      }),
      tab: intl.get('sslm.supplierDetail.view.fixCatalog.contactInform').d('联系人信息'),
      investgProps: getComponentInvestgProps({ investgProps, configName: SSLM_INVESTG_CONTACT }),
      hidden:
        (!configNames.includes('contactInfo') && hiddenTabFlag) ||
        getHiddenPlatformTabFlag({
          investTabList: configNameList,
          hiddenPlatformTabs,
          configName: SSLM_INVESTG_CONTACT,
        }),
    },
    {
      key: 'addressInfo',
      saveParamKey: getSaveParamKey({
        configName: SSLM_INVESTG_ADDRESS,
        configNameList,
        isAllPlatform,
      }),
      tab: intl.get('sslm.supplierDetail.view.fixCatalog.addressInform').d('地址信息'),
      investgProps: getComponentInvestgProps({ investgProps, configName: SSLM_INVESTG_ADDRESS }),
      hidden: !configNames.includes('addressInfo') && hiddenTabFlag,
    },
    {
      key: 'bankInfo',
      saveParamKey: getSaveParamKey({
        configName: SSLM_INVESTG_BANK_ACCOUNT,
        configNameList,
        isAllPlatform,
      }),
      tab: intl.get('sslm.supplierDetail.view.fixCatalog.bankInform').d('银行信息'),
      investgProps: getComponentInvestgProps({
        investgProps,
        configName: SSLM_INVESTG_BANK_ACCOUNT,
      }),
      hidden: !configNames.includes('bankInfo') && hiddenTabFlag,
    },
    {
      isForm: true,
      key: 'invoiceInfo',
      saveParamKey: isAllPlatform ? 'invoiceReq' : 'supInvoiceReq',
      tab: intl.get('sslm.supplierDetail.view.fixCatalog.invoiceInform').d('开票信息'),
      hidden: !configNames.includes('invoiceInfo') && hiddenTabFlag,
    },
    {
      key: 'financeInfo',
      saveParamKey: getSaveParamKey({
        configName: SSLM_INVESTG_FIN,
        configNameList,
        isAllPlatform,
      }),
      tab: intl.get('sslm.enterpriseInform.view.model.financialStatus.title').d('财务状况'),
      investgProps: getComponentInvestgProps({ investgProps, configName: SSLM_INVESTG_FIN }),
      hidden: !configNames.includes('financeInfo') && hiddenTabFlag,
    },
    {
      key: 'attachmentInfo',
      saveParamKey: getSaveParamKey({
        configName: SSLM_INVESTG_ATTACHMENT,
        configNameList,
        isAllPlatform,
      }),
      tab: intl.get('sslm.enterpriseInform.view.fixCatalog.attachmentInform').d('附件信息'),
      investgProps: getComponentInvestgProps({ investgProps, configName: SSLM_INVESTG_ATTACHMENT }),
      hidden: !configNames.includes('attachmentInfo') && hiddenTabFlag,
    },
    // 只有变更采购方才展示分类tab
    {
      key: 'changeCate',
      saveParamKey: 'sslmInvestgSupplierCate',
      tab: intl.get('sslm.enterpriseInform.view.fixCatalog.supplierClassify').d('供应商分类'),
      hidden: isAllPlatform || (!configNames.includes('changeCate') && hiddenTabFlag),
    },
    // 只有变更采购方才展示其他信息tab
    {
      isForm: true,
      key: 'changeOtherInfo',
      saveParamKey: 'supChangeOther',
      tab: intl.get('sslm.supplierInform.view.fixCatalog.otherInform').d('其他信息'),
      hidden: isAllPlatform || (!configNames.includes('changeOtherInfo') && hiddenTabFlag),
    },
  ]
    .map(item => {
      const { key, ...rest } = item;
      const code = getCustomizeUnitCode({ cusCodeSuorce, ...commonprops, key });
      const dataSet = getDs({ remote, cusCodeSuorce, code, commonprops, key, investgProps });
      const component = getComponent({
        key,
        configNameList,
        readOnlyFlag,
      });
      return { ...rest, key, code, dataSet, component };
    })
    .filter(panel => !panel.hidden);
  // 业务信息ds
  const businessDs = (panelList.find(panel => panel.key === 'businessInfo') || {}).dataSet;
  // 银行信息ds
  const bankInfoDs = (panelList.find(panel => panel.key === 'bankInfo') || {}).dataSet;
  // 平台级变更单的银行信息需取业务信息字段
  if (businessDs && bankInfoDs && isAllPlatform && cusCodeSuorce === 'function') {
    bankInfoDs.setState('businessDs', businessDs);
  }
  return panelList;
};

const getCustomizeUnitCode = ({
  personalFlag = false,
  isAllPlatform = false,
  key = '',
  cusCodeSuorce = 'function',
}) => {
  const functionCodeList = {
    basicInfo: personalFlag
      ? 'SSLM.ENTERPRISE_INFORM_CHANGE_NEW_DETAIL.REGISTRATION_PERSONAL'
      : 'SSLM.ENTERPRISE_INFORM_CHANGE_NEW_DETAIL.REGISTRATION_OVERSEAS',
    businessInfo: 'SSLM.ENTERPRISE_INFORM_CHANGE_NEW_DETAIL.BUSINESS_INFO',
    contactInfo: 'SSLM.ENTERPRISE_INFORM_CHANGE_NEW_DETAIL.CONTACT',
    addressInfo: 'SSLM.ENTERPRISE_INFORM_CHANGE_NEW_DETAIL.ADDRESS',
    bankInfo: 'SSLM.ENTERPRISE_INFORM_CHANGE_NEW_DETAIL.BANK',
    invoiceInfo: 'SSLM.ENTERPRISE_INFORM_CHANGE_NEW_DETAIL.INVOICE',
    financeInfo: 'SSLM.ENTERPRISE_INFORM_CHANGE_NEW_DETAIL.FINANCIAL',
    attachmentInfo: 'SSLM.ENTERPRISE_INFORM_CHANGE_NEW_DETAIL.ATTACHMENT',
    changeCate: 'SSLM.ENTERPRISE_INFORM_CHANGE_NEW_DETAIL.CLASSIFY',
    changeOtherInfo: 'SSLM.ENTERPRISE_INFORM_CHANGE_NEW_DETAIL.OTHER_INFO',
  };
  const approvalCodeList = {
    basicInfo: personalFlag
      ? 'SSLM.ENTERPRISE_TENANT_APPROVAL_DETAIL.APPROVAL.REGISTRATION_PERSONAL'
      : 'SSLM.ENTERPRISE_TENANT_APPROVAL_DETAIL.APPROVAL.REGISTRATION_OVERSEAS',
    businessInfo: 'SSLM.ENTERPRISE_TENANT_APPROVAL_DETAIL.APPROVAL.BUSINESS_INFO',
    contactInfo: 'SSLM.ENTERPRISE_TENANT_APPROVAL_DETAIL.APPROVAL.CONTACT',
    addressInfo: 'SSLM.ENTERPRISE_TENANT_APPROVAL_DETAIL.APPROVAL.ADDRESS',
    bankInfo: 'SSLM.ENTERPRISE_TENANT_APPROVAL_DETAIL.APPROVAL.BANK',
    invoiceInfo: 'SSLM.ENTERPRISE_TENANT_APPROVAL_DETAIL.APPROVAL.INVOICE',
    financeInfo: 'SSLM.ENTERPRISE_TENANT_APPROVAL_DETAIL.APPROVAL.FINANCIAL',
    attachmentInfo: 'SSLM.ENTERPRISE_TENANT_APPROVAL_DETAIL.APPROVAL.ATTA_INFO',
    changeCate: 'SSLM.ENTERPRISE_TENANT_APPROVAL_DETAIL.APPROVAL.CLASSIFY',
    changeOtherInfo: 'SSLM.ENTERPRISE_TENANT_APPROVAL_DETAIL.APPROVAL.OTHER_INFO',
  };
  const workFlowcodeList = {
    basicInfo: personalFlag
      ? 'SSLM.ENTERPRISE_TENANT_APPROVAL_DETAIL.WF.PERSONAL'
      : 'SSLM.ENTERPRISE_TENANT_APPROVAL_DETAIL.WF.OVERSEAS',
    businessInfo: 'SSLM.ENTERPRISE_TENANT_APPROVAL_DETAIL.WF.BUSINESS',
    contactInfo: 'SSLM.ENTERPRISE_TENANT_APPROVAL_DETAIL.WF.CONTACT',
    addressInfo: 'SSLM.ENTERPRISE_TENANT_APPROVAL_DETAIL.WF.ADDRESS',
    bankInfo: 'SSLM.ENTERPRISE_TENANT_APPROVAL_DETAIL.WF.BANK',
    invoiceInfo: 'SSLM.ENTERPRISE_TENANT_APPROVAL_DETAIL.WF.INVOICE',
    financeInfo: 'SSLM.ENTERPRISE_TENANT_APPROVAL_DETAIL.WF.FINANCIAL',
    attachmentInfo: 'SSLM.ENTERPRISE_TENANT_APPROVAL_DETAIL.WF.ATTA_INFO',
    changeCate: 'SSLM.ENTERPRISE_TENANT_APPROVAL_DETAIL.WF.CLASSIFY',
    changeOtherInfo: 'SSLM.ENTERPRISE_TENANT_APPROVAL_DETAIL.WF.OTHER',
  };
  const codeList =
    cusCodeSuorce === 'function'
      ? functionCodeList
      : cusCodeSuorce === 'approval'
      ? approvalCodeList
      : workFlowcodeList;
  return isAllPlatform ? '' : codeList[key];
};

const getComponent = ({ key = '', configNameList = [], readOnlyFlag = false }) => {
  const InvestgComponent = readOnlyFlag ? ViewTable : EditInvestgComponent;
  switch (key) {
    case 'contactInfo':
      return configNameList.includes(SSLM_INVESTG_CONTACT) ? InvestgComponent : Contact;
    case 'addressInfo':
      return configNameList.includes(SSLM_INVESTG_ADDRESS) ? InvestgComponent : Address;
    case 'bankInfo':
      return configNameList.includes(SSLM_INVESTG_BANK_ACCOUNT) ? InvestgComponent : Bank;
    case 'financeInfo':
      return configNameList.includes(SSLM_INVESTG_FIN) ? InvestgComponent : FinancialInform;
    case 'attachmentInfo':
      return configNameList.includes(SSLM_INVESTG_ATTACHMENT) ? InvestgComponent : Attachment;
    case 'basicInfo':
      return Register;
    case 'businessInfo':
      return Business;
    case 'invoiceInfo':
      return Invoice;
    case 'changeCate':
      return SupplierClassify;
    case 'changeOtherInfo':
      return OtherInfo;
    default:
      return null;
  }
};

const getDs = ({ remote, investgProps = {}, key = '', commonprops = {}, code = '' }) => {
  const { allInvestgDs = {}, configNameList = [] } = investgProps;
  const dsProps = {
    ...commonprops,
    key,
    code,
  };
  const bankDsProps = getBankDS(dsProps);
  const remoteBankDsProps = remote
    ? remote.process('SSLM_ENTERPRISE_INFO_NEW_DETAIL_BANK_DS_PROPS', bankDsProps)
    : bankDsProps;

  switch (key) {
    case 'contactInfo':
      return configNameList.includes(SSLM_INVESTG_CONTACT)
        ? allInvestgDs.sslmInvestgContact
        : new DataSet(getContactDS(dsProps));
    case 'addressInfo':
      return configNameList.includes(SSLM_INVESTG_ADDRESS)
        ? allInvestgDs.sslmInvestgAddress
        : new DataSet(getAddressDS(dsProps));
    case 'bankInfo':
      return configNameList.includes(SSLM_INVESTG_BANK_ACCOUNT)
        ? allInvestgDs.sslmInvestgBankAccount
        : new DataSet(remoteBankDsProps);
    case 'financeInfo':
      return configNameList.includes(SSLM_INVESTG_FIN)
        ? allInvestgDs.sslmInvestgFin
        : new DataSet(getFinancialDS(dsProps));
    case 'attachmentInfo':
      return configNameList.includes(SSLM_INVESTG_ATTACHMENT)
        ? allInvestgDs.sslmInvestgAttachment
        : new DataSet(getAttachmentDS(dsProps));
    case 'basicInfo':
      return new DataSet(getRegisterDS(dsProps));
    case 'businessInfo':
      return new DataSet(getBusinessDS(dsProps));
    case 'invoiceInfo':
      return new DataSet(getInvoiceDS(dsProps));
    case 'changeCate':
      return new DataSet(getSupplierClassifyDS(dsProps));
    case 'changeOtherInfo':
      return new DataSet(getOtherInfoDS(dsProps));
    default:
      return {};
  }
};

const getComponentInvestgProps = ({ investgProps = {}, configName = '' }) => {
  const { componentProps = {} } = investgProps;
  return componentProps[configName] || {};
};

const EditInvestgComponent = (props = {}) => {
  const { remote, registerDs, ...rest } = props;
  const otherRemoteProps = {
    registerDs,
  };
  return (
    <WrapperComponent>
      <ComposeTable {...rest} investgRemote={remote} otherRemoteProps={otherRemoteProps} />
    </WrapperComponent>
  );
};

const getSaveParamKey = ({ configName = '', configNameList = [], isAllPlatform }) => {
  switch (configName) {
    case SSLM_INVESTG_CONTACT:
      if (configNameList.includes(configName)) {
        return 'sslmInvestgContact';
      } else if (isAllPlatform) {
        return 'comContactsReqs';
      } else {
        return 'supContactsReqs';
      }
    case SSLM_INVESTG_ADDRESS:
      if (configNameList.includes(configName)) {
        return 'sslmInvestgAddress';
      } else if (isAllPlatform) {
        return 'comAddressReqs';
      } else {
        return 'supAddressReqs';
      }
    case SSLM_INVESTG_BANK_ACCOUNT:
      if (configNameList.includes(configName)) {
        return 'sslmInvestgBankAccount';
      } else if (isAllPlatform) {
        return 'comBankAccReqs';
      } else {
        return 'supBankAccReqs';
      }
    case SSLM_INVESTG_FIN:
      if (configNameList.includes(configName)) {
        return 'sslmInvestgFin';
      } else if (isAllPlatform) {
        return 'financeReqs';
      } else {
        return 'supFinanceReqs';
      }
    default:
      if (configNameList.includes(configName)) {
        return 'sslmInvestgAttachment';
      } else if (isAllPlatform) {
        return 'comAttachmentReqs';
      } else {
        return 'supAttachmentReqs';
      }
  }
};

// 获取平台页签隐藏标识
const getHiddenPlatformTabFlag = ({
  investTabList = [],
  hiddenPlatformTabs = [],
  configName = '',
} = {}) => {
  switch (configName) {
    case SSLM_INVESTG_CONTACT:
      if (investTabList.includes(configName)) {
        return false;
      } else if ((hiddenPlatformTabs || []).includes('spfmCompanyContacts')) {
        return true;
      } else {
        return false;
      }
    default:
      return false;
  }
};
