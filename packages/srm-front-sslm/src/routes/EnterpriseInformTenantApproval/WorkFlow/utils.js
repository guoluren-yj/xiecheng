/*
 * @Date: 2023-08-25
 * @Author: CDJ <dengji.chen@hand-china.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import intl from 'utils/intl';
import { DataSet } from 'choerodon-ui/pro';

import Bank from '@/routes/EnterpriseInformNew/Detail/EnterpriseBasicInfo/Bank';
import Invoice from '@/routes/EnterpriseInformNew/Detail/EnterpriseBasicInfo/Invoice';
import Address from '@/routes/EnterpriseInformNew/Detail/EnterpriseBasicInfo/Address';
import Contact from '@/routes/EnterpriseInformNew/Detail/EnterpriseBasicInfo/Contact';
import Business from '@/routes/EnterpriseInformNew/Detail/EnterpriseBasicInfo/Business';
import Register from '@/routes/EnterpriseInformNew/Detail/EnterpriseBasicInfo/Register';
import OtherInfo from '@/routes/EnterpriseInformNew/Detail/EnterpriseBasicInfo/OtherInfo';
import Attachment from '@/routes/EnterpriseInformNew/Detail/EnterpriseBasicInfo/Attachment';
import FinancialInform from '@/routes/EnterpriseInformNew/Detail/EnterpriseBasicInfo/FinancialInfo';
import SupplierClassify from '@/routes/EnterpriseInformNew/Detail/EnterpriseBasicInfo/SupplierClassify';

import { getBankDS } from '@/routes/EnterpriseInformNew/stores/getBankDS';
import { getContactDS } from '@/routes/EnterpriseInformNew/stores/getContactDS';
import { getAddressDS } from '@/routes/EnterpriseInformNew/stores/getAddressDS';
import { getInvoiceDS } from '@/routes/EnterpriseInformNew/stores/getInvoiceDS';
import { getRegisterDS } from '@/routes/EnterpriseInformNew/stores/getRegisterDS';
import { getBusinessDS } from '@/routes/EnterpriseInformNew/stores/getBusinessDS';
import { getOtherInfoDS } from '@/routes/EnterpriseInformNew/stores/getOtherInfoDS';
import { getAttachmentDS } from '@/routes/EnterpriseInformNew/stores/getAttachmentDS';
import { getFinancialDS } from '@/routes/EnterpriseInformNew/stores/getFinancialDS';
import { getSupplierClassifyDS } from '@/routes/EnterpriseInformNew/stores/getSupplierClassifyDS';

export const getPanelList = ({
  isAllPlatform = true,
  partnerTenantId = '-1',
  readOnlyFlag = false,
  operateType = '',
  configNames = [],
  personalFlag = false, // 个人认证标识
} = {}) => {
  const commonprops = {
    isAllPlatform,
    partnerTenantId,
    readOnlyFlag,
    operateType,
    personalFlag,
  };
  const hiddenTabFlag = operateType === 'MODIFY';

  return [
    {
      isForm: true,
      key: 'basicInfo',
      saveParamKey: isAllPlatform ? 'comBasicReq' : 'supBasicReq',
      tab: intl.get('sslm.supplierDetail.view.fixCatalog.registInform').d('登记信息'),
      component: Register,
      dataSet: new DataSet(
        getRegisterDS({
          ...commonprops,
          code: getCustomizeUnitCode({ ...commonprops, key: 'basicInfo' }),
          key: 'basicInfo',
        })
      ),
      code: getCustomizeUnitCode({ ...commonprops, key: 'basicInfo' }),
      hidden: !configNames.includes('basicInfo') && hiddenTabFlag,
    },
    {
      isForm: true,
      key: 'businessInfo',
      saveParamKey: isAllPlatform ? 'comBusinessReqDTO' : 'supBusinessReqDTO',
      tab: intl.get('sslm.supplierDetail.view.fixCatalog.businessInform').d('基础业务信息'),
      component: Business,
      dataSet: new DataSet(
        getBusinessDS({
          ...commonprops,
          code: getCustomizeUnitCode({ ...commonprops, key: 'businessInfo' }),
          key: 'businessInfo',
        })
      ),
      code: getCustomizeUnitCode({ ...commonprops, key: 'businessInfo' }),
      hidden: !configNames.includes('businessInfo') && hiddenTabFlag,
    },
    {
      key: 'contactInfo',
      saveParamKey: isAllPlatform ? 'comContactsReqs' : 'supContactsReqs',
      tab: intl.get('sslm.supplierDetail.view.fixCatalog.contactInform').d('联系人信息'),
      component: Contact,
      dataSet: new DataSet(
        getContactDS({
          ...commonprops,
          key: 'contactInfo',
          code: getCustomizeUnitCode({ ...commonprops, key: 'contactInfo' }),
        })
      ),
      code: getCustomizeUnitCode({ ...commonprops, key: 'contactInfo' }),
      hidden: !configNames.includes('contactInfo') && hiddenTabFlag,
    },
    {
      key: 'addressInfo',
      saveParamKey: isAllPlatform ? 'comAddressReqs' : 'supAddressReqs',
      tab: intl.get('sslm.supplierDetail.view.fixCatalog.addressInform').d('地址信息'),
      component: Address,
      dataSet: new DataSet(
        getAddressDS({
          ...commonprops,
          key: 'addressInfo',
          code: getCustomizeUnitCode({ ...commonprops, key: 'addressInfo' }),
        })
      ),
      code: getCustomizeUnitCode({ ...commonprops, key: 'addressInfo' }),
      hidden: !configNames.includes('addressInfo') && hiddenTabFlag,
    },
    {
      key: 'bankInfo',
      saveParamKey: isAllPlatform ? 'comBankAccReqs' : 'supBankAccReqs',
      tab: intl.get('sslm.supplierDetail.view.fixCatalog.bankInform').d('银行信息'),
      component: Bank,
      dataSet: new DataSet(
        getBankDS({
          ...commonprops,
          key: 'bankInfo',
          code: getCustomizeUnitCode({ ...commonprops, key: 'bankInfo' }),
        })
      ),
      code: getCustomizeUnitCode({ ...commonprops, key: 'bankInfo' }),
      hidden: !configNames.includes('bankInfo') && hiddenTabFlag,
    },
    {
      isForm: true,
      key: 'invoiceInfo',
      saveParamKey: isAllPlatform ? 'invoiceReq' : 'supInvoiceReq',
      tab: intl.get('sslm.supplierDetail.view.fixCatalog.invoiceInform').d('开票信息'),
      component: Invoice,
      dataSet: new DataSet(
        getInvoiceDS({
          ...commonprops,
          code: getCustomizeUnitCode({ ...commonprops, key: 'invoiceInfo' }),
          key: 'invoiceInfo',
        })
      ),
      code: getCustomizeUnitCode({ ...commonprops, key: 'invoiceInfo' }),
      hidden: !configNames.includes('invoiceInfo') && hiddenTabFlag,
    },
    {
      key: 'financeInfo',
      saveParamKey: isAllPlatform ? 'financeReqs' : 'supFinanceReqs',
      tab: intl.get('sslm.enterpriseInform.view.model.financialStatus.title').d('财务状况'),
      component: FinancialInform,
      dataSet: new DataSet(
        getFinancialDS({
          ...commonprops,
          key: 'financeInfo',
          code: getCustomizeUnitCode({ ...commonprops, key: 'financeInfo' }),
        })
      ),
      code: getCustomizeUnitCode({ ...commonprops, key: 'financeInfo' }),
      hidden: !configNames.includes('financeInfo') && hiddenTabFlag,
    },
    {
      key: 'attachmentInfo',
      saveParamKey: isAllPlatform ? 'comAttachmentReqs' : 'supAttachmentReqs',
      tab: intl.get('sslm.enterpriseInform.view.fixCatalog.attachmentInform').d('附件信息'),
      component: Attachment,
      dataSet: new DataSet(
        getAttachmentDS({
          ...commonprops,
          key: 'attachmentInfo',
          code: getCustomizeUnitCode({ ...commonprops, key: 'attachmentInfo' }),
        })
      ),
      code: getCustomizeUnitCode({ ...commonprops, key: 'attachmentInfo' }),
      hidden: !configNames.includes('attachmentInfo') && hiddenTabFlag,
    },
    // 只有变更采购方才展示分类tab
    {
      key: 'changeCate',
      saveParamKey: 'sslmInvestgSupplierCate',
      tab: intl.get('sslm.enterpriseInform.view.fixCatalog.supplierClassify').d('供应商分类'),
      component: SupplierClassify,
      dataSet: new DataSet(
        getSupplierClassifyDS({
          ...commonprops,
          code: getCustomizeUnitCode({ ...commonprops, key: 'changeCate' }),
          key: 'changeCate',
        })
      ),
      code: getCustomizeUnitCode({ ...commonprops, key: 'changeCate' }),
      hidden: isAllPlatform || (!configNames.includes('changeCate') && hiddenTabFlag),
    },
    // 只有变更采购方才展示其他信息tab
    {
      isForm: true,
      key: 'changeOtherInfo',
      saveParamKey: 'supChangeOther',
      tab: intl.get('sslm.supplierInform.view.fixCatalog.otherInform').d('其他信息'),
      component: OtherInfo,
      dataSet: new DataSet(
        getOtherInfoDS({
          ...commonprops,
          code: getCustomizeUnitCode({ ...commonprops, key: 'changeOtherInfo' }),
          key: 'changeOtherInfo',
        })
      ),
      code: getCustomizeUnitCode({ ...commonprops, key: 'changeOtherInfo' }),
      hidden: isAllPlatform || (!configNames.includes('changeOtherInfo') && hiddenTabFlag),
    },
  ].filter(panel => !panel.hidden);
};

const getCustomizeUnitCode = ({ personalFlag = false, isAllPlatform = false, key = '' }) => {
  const codeList = {
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
  return isAllPlatform ? '' : codeList[key];
};
