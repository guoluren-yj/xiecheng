/*
 * @Date: 2023-04-26 14:32:09
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import intl from 'utils/intl';

import Bank from './Bank';
import Invoice from './Invoice';
import Address from './Address';
import Contact from './Contact';
import Business from './Business';
import Register from './Register';
import OtherInfo from './OtherInfo';
import Attachment from './Attachment';
import LocationInfo from './LocationInfo';
import SupplyAbility from './SupplyAbility';
import PurchaseFinance from './PurchaseFinance';
import SupplierClassify from './SupplierClassify';

import { getBankDS } from '../../stores/getBankDS';
import { getContactDS } from '../../stores/getContactDS';
import { getAddressDS } from '../../stores/getAddressDS';
import { getInvoiceDS } from '../../stores/getInvoiceDS';
import { getRegisterDS } from '../../stores/getRegisterDS';
import { getBusinessDS } from '../../stores/getBusinessDS';
import { getOtherInfoDS } from '../../stores/getOtherInfoDS';
import { getLocationDS } from '../../stores/getLocationInfoDS';
import { getAttachmentDS } from '../../stores/getAttachmentDS';
import { getSupplyAbilityDS } from '../../stores/getSupplyAbilityDS';
import { getSupplierClassifyDS } from '../../stores/getSupplierClassifyDS';
import { getPurchaseHeaderDS, getPurchaseLineDS } from '../../stores/getPurchaseFinanceDS';
import { PLATFORM_TABS } from '../../Detail/utils';

export const getPanelList = ({ investigationTab, platformTabsHidden = [] }) => {
  const newPlatformTabsHidden = platformTabsHidden || [];

  return [
    {
      isForm: true,
      key: 'comBasicReq',
      tab: intl.get('sslm.supplierDetail.view.fixCatalog.registInform').d('登记信息'),
      component: Register,
    },
    {
      isForm: true,
      key: 'comBusinessReqDTO',
      tab: intl.get('sslm.supplierDetail.view.fixCatalog.businessInform').d('业务信息'),
      component: Business,
      customizeParam: {
        customizeUnitCode: 'SSLM.SUPPLIER_INFORM_CHANGE_NEW_DETAIL.BUSINESS',
      },
    },
    {
      key: 'comContactsReqs',
      tab: intl.get('sslm.supplierDetail.view.fixCatalog.contactInform').d('联系人信息'),
      component: Contact,
      hidden:
        investigationTab.includes('sslmInvestgContact') ||
        newPlatformTabsHidden.includes(PLATFORM_TABS.PLATFORM_CONTACTS),
      customizeParam: {
        customizeUnitCode: 'SSLM.SUPPLIER_INFORM_CHANGE_NEW_DETAIL.CONTACT',
      },
    },
    {
      key: 'comAddressReqs',
      hidden: investigationTab.includes('sslmInvestgAddress'),
      tab: intl.get('sslm.supplierDetail.view.fixCatalog.addressInform').d('地址信息'),
      component: Address,
      customizeParam: {
        customizeUnitCode: 'SSLM.SUPPLIER_INFORM_CHANGE_NEW_DETAIL.ADDRESS',
      },
    },
    {
      key: 'comBankAccReqs',
      hidden: investigationTab.includes('sslmInvestgBankAccount'),
      tab: intl.get('sslm.supplierDetail.view.fixCatalog.bankInform').d('银行信息'),
      component: Bank,
      customizeParam: {
        customizeUnitCode: 'SSLM.SUPPLIER_INFORM_CHANGE_NEW_DETAIL.BANK',
      },
    },
    {
      isForm: true,
      key: 'supInvoiceReq',
      tab: intl.get('sslm.supplierDetail.view.fixCatalog.invoiceInform').d('开票信息'),
      component: Invoice,
      customizeParam: {
        customizeUnitCode: 'SSLM.SUPPLIER_INFORM_CHANGE_NEW_DETAIL.INVOICE',
      },
    },
    {
      key: 'supAttachmentReqs',
      hidden: investigationTab.includes('sslmInvestgAttachment'),
      tab: intl.get('sslm.enterpriseInform.view.fixCatalog.attachmentInform').d('附件信息'),
      component: Attachment,
      customizeParam: {
        customizeUnitCode: 'SSLM.SUPPLIER_INFORM_CHANGE_NEW_DETAIL.ATTACHMENT',
      },
    },
    {
      key: 'supChangeAbilityLn',
      // hidden: investigationTab.includes('sslmInvestgProservice'),
      tab: intl.get('sslm.supplierDetail.view.fixCatalog.supplyCapacityList').d('供货能力清单'),
      component: SupplyAbility,
      customizeParam: {
        customizeUnitCode: 'SSLM.SUPPLIER_INFORM_CHANGE_NEW_DETAIL.SUPPLY_ABILITY',
      },
    },
    {
      key: 'supChangeCate',
      hidden: investigationTab.includes('sslmInvestgSupplierCate'),
      tab: intl.get('sslm.supplierInform.view.fixCatalog.supplierClassify').d('供应商分类'),
      component: SupplierClassify,
      customizeParam: {
        customizeUnitCode: 'SSLM.SUPPLIER_INFORM_CHANGE_NEW_DETAIL.SCLASSIFY',
      },
    },
    {
      key: 'purchaseInfo',
      tab: intl.get('sslm.supplierInform.view.fixCatalog.purchaseInform').d('采购/财务信息'),
      component: PurchaseFinance,
      customizeParam: {
        customizeUnitCode: 'SSLM.SUPPLIER_INFORM_CHANGE_NEW_DETAIL.PURCHASE_HEAD',
        customizeTableCode: 'SSLM.SUPPLIER_INFORM_CHANGE_NEW_DETAIL.PURCHASE_LINE',
      },
    },
    {
      key: 'supChangeEbsAdds',
      tab: intl.get('sslm.supplierInform.view.fixCatalog.locationInform').d('地点层信息'),
      component: LocationInfo,
      customizeParam: {
        customizeUnitCode: 'SSLM.SUPPLIER_INFORM_CHANGE_NEW_DETAIL.LOCATION',
      },
    },
    {
      isForm: true,
      key: 'supChangeOther',
      tab: intl.get('sslm.supplierInform.view.fixCatalog.otherInform').d('其他信息'),
      component: OtherInfo,
      customizeParam: {
        customizeUnitCode: 'SSLM.SUPPLIER_INFORM_CHANGE_NEW_DETAIL.OTHERS',
      },
    },
  ].filter(panel => !panel.hidden);
};

// 将获取ds的函数与对应页签绑定
export const dataSetFunc = {
  comBasicReq: getRegisterDS,
  comBusinessReqDTO: getBusinessDS,
  comContactsReqs: getContactDS,
  comAddressReqs: getAddressDS,
  comBankAccReqs: getBankDS,
  supInvoiceReq: getInvoiceDS,
  supAttachmentReqs: getAttachmentDS,
  supChangeAbilityLn: getSupplyAbilityDS,
  supChangeCate: getSupplierClassifyDS,
  supChangeEbsAdds: getLocationDS,
  supChangeOther: getOtherInfoDS,
  purchaseInfo: {
    supChangeSync: getPurchaseHeaderDS,
    supChangeSyncPf: getPurchaseLineDS,
  },
};

// 将tab的key与接口返回值的key进行映射
export const fieldAssociation = {
  comBasicReq: 'Basic',
  comBusinessReqDTO: 'Business',
  comContactsReqs: 'Contacts',
  comAddressReqs: 'Addresses',
  comBankAccReqs: 'BankAccounts',
  supInvoiceReq: 'Invoice',
  supAttachmentReqs: 'Attachments',
};

export const getToolTipPrefix = () =>
  intl.get('sslm.common.view.modifyBefore.toolTip').d('修改前：');
export const getInsertTip = () => intl.get('sslm.common.view.newLine.toolTip').d('新增行');
