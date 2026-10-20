/*
 * @Date: 2023-10-10
 * @Author: zlh
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import intl from 'utils/intl';

import Bank from '../../Compare/SupplierBasic/Bank';
import Invoice from '../../Compare/SupplierBasic/Invoice';
import Address from '../../Compare/SupplierBasic/Address';
import Contact from '../../Compare/SupplierBasic/Contact';
import Business from '../../Compare/SupplierBasic/Business';
import Register from '../../Compare/SupplierBasic/Register';
import OtherInfo from '../../Compare/SupplierBasic/OtherInfo';
import Attachment from '../../Compare/SupplierBasic/Attachment';
import LocationInfo from '../../Compare/SupplierBasic/LocationInfo';
import SupplyAbility from '../../Compare/SupplierBasic/SupplyAbility';
import PurchaseFinance from '../../Compare/SupplierBasic/PurchaseFinance';
import SupplierClassify from '../../Compare/SupplierBasic/SupplierClassify';

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

export const getToolTipPrefix = () =>
  intl.get('sslm.common.view.modifyBefore.toolTip').d('修改前：');

export const getInsertTip = () => intl.get('sslm.supplierDetail.toolTip.newLine').d('新增行');

export const getPanelList = ({
  investigationTab = [],
  configNames = [],
  operateType = '',
  domesticForeignRelation,
  platformTabsHidden = [],
}) => {
  const hiddenTabFlag = operateType === 'MODIFY';
  const newPlatformTabsHidden = platformTabsHidden || [];
  return [
    {
      isForm: true,
      key: 'comBasicReq',
      tab: intl.get('sslm.supplierDetail.view.fixCatalog.registInform').d('登记信息'),
      component: Register,
      hidden: !configNames.includes('comBasicReq') && hiddenTabFlag,
      customizeParam: {
        customizeUnitCode:
          domesticForeignRelation !== 2
            ? 'SSLM.SUPPLIER_INFORM_CHANGE_CUSTOM.REGISTRATION_OVERSEAS'
            : 'SSLM.SUPPLIER_INFORM_CHANGE_CUSTOM.REGISTRATION_PERSONAL',
      },
    },
    {
      isForm: true,
      key: 'comBusinessReqDTO',
      tab: intl.get('sslm.supplierDetail.view.fixCatalog.businessInform').d('基础业务信息'),
      component: Business,
      hidden: !configNames.includes('comBusinessReqDTO') && hiddenTabFlag,
      customizeParam: {
        customizeUnitCode: 'SSLM.SUPPLIER_INFORM_CHANGE_CUSTOM.BUSINESS',
      },
    },
    {
      key: 'comContactsReqs',
      tab: intl.get('sslm.supplierDetail.view.fixCatalog.contactInform').d('联系人信息'),
      component: Contact,
      hidden:
        investigationTab.includes('sslmInvestgContact') ||
        (!configNames.includes('comContactsReqs') && hiddenTabFlag) ||
        newPlatformTabsHidden.includes(PLATFORM_TABS.PLATFORM_CONTACTS),
      customizeParam: {
        customizeUnitCode: 'SSLM.SUPPLIER_INFORM_CHANGE_CUSTOM.CONTACT',
      },
    },
    {
      key: 'comAddressReqs',
      hidden:
        investigationTab.includes('sslmInvestgAddress') ||
        (!configNames.includes('comAddressReqs') && hiddenTabFlag),
      tab: intl.get('sslm.supplierDetail.view.fixCatalog.addressInform').d('地址信息'),
      component: Address,
      customizeParam: {
        customizeUnitCode: 'SSLM.SUPPLIER_INFORM_CHANGE_CUSTOM.ADDRESS',
      },
    },
    {
      key: 'comBankAccReqs',
      hidden:
        investigationTab.includes('sslmInvestgBankAccount') ||
        (!configNames.includes('comBankAccReqs') && hiddenTabFlag),
      tab: intl.get('sslm.supplierDetail.view.fixCatalog.bankInform').d('银行信息'),
      component: Bank,
      customizeParam: {
        customizeUnitCode: 'SSLM.SUPPLIER_INFORM_CHANGE_CUSTOM.BANK',
      },
    },
    {
      isForm: true,
      key: 'supInvoiceReq',
      tab: intl.get('sslm.supplierDetail.view.fixCatalog.invoiceInform').d('开票信息'),
      component: Invoice,
      hidden: !configNames.includes('supInvoiceReq') && hiddenTabFlag,
      customizeParam: {
        customizeUnitCode: 'SSLM.SUPPLIER_INFORM_CHANGE_CUSTOM.INVOICE',
      },
    },
    {
      key: 'supAttachmentReqs',
      hidden:
        investigationTab.includes('sslmInvestgAttachment') ||
        (!configNames.includes('supAttachmentReqs') && hiddenTabFlag),
      tab: intl.get('sslm.enterpriseInform.view.fixCatalog.attachmentInform').d('附件信息'),
      component: Attachment,
      customizeParam: {
        customizeUnitCode: 'SSLM.SUPPLIER_INFORM_CHANGE_CUSTOM.ATTACHMENT',
      },
    },
    {
      key: 'supChangeAbilityLn',
      hidden:
        investigationTab.includes('sslmInvestgProservice') ||
        (!configNames.includes('supChangeAbilityLn') && hiddenTabFlag),
      tab: intl.get('sslm.supplierDetail.view.fixCatalog.supplyCapacityList').d('供货能力清单'),
      component: SupplyAbility,
      // customizeUnitCode: 'SSLM.SUPPLIER_INFORM_CHANGE_CUSTOM.ABILITY_LINE_ATTACHMENT'; // 供货能力清单-附件
      customizeParam: {
        customizeUnitCode: 'SSLM.SUPPLIER_INFORM_CHANGE_CUSTOM.SUPPLY_ABILITY',
      },
    },
    {
      key: 'supChangeCate',
      hidden:
        investigationTab.includes('sslmInvestgSupplierCate') ||
        (!configNames.includes('supChangeCate') && hiddenTabFlag),
      tab: intl.get('sslm.supplierInform.view.fixCatalog.supplierClassify').d('供应商分类'),
      component: SupplierClassify,
      customizeParam: {
        customizeUnitCode: 'SSLM.SUPPLIER_INFORM_CHANGE_CUSTOM.SCLASSIFY',
      },
    },
    {
      key: 'purchaseInfo',
      tab: intl.get('sslm.supplierInform.view.fixCatalog.purchaseInform').d('采购/财务信息'),
      component: PurchaseFinance,
      hidden: !configNames.includes('purchaseInfo') && hiddenTabFlag,
      customizeParam: {
        customizeUnitCode: 'SSLM.SUPPLIER_INFORM_CHANGE_CUSTOM.PURCHASE_HEAD',
        customizeTableCode: 'SSLM.SUPPLIER_INFORM_CHANGE_CUSTOM.PURCHASE_LINE',
      },
    },
    {
      key: 'supChangeEbsAdds',
      tab: intl.get('sslm.supplierInform.view.fixCatalog.locationInform').d('地点层信息'),
      component: LocationInfo,
      hidden: !configNames.includes('supChangeEbsAdds') && hiddenTabFlag,
      customizeParam: {
        customizeUnitCode: 'SSLM.SUPPLIER_INFORM_CHANGE_CUSTOM.LOCATION',
      },
    },
    {
      isForm: true,
      key: 'supChangeOther',
      tab: intl.get('sslm.supplierInform.view.fixCatalog.otherInform').d('其他信息'),
      component: OtherInfo,
      hidden: !configNames.includes('supChangeOther') && hiddenTabFlag,
      customizeParam: {
        customizeUnitCode: 'SSLM.SUPPLIER_INFORM_CHANGE_CUSTOM.OTHERS',
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

// 将tab的key与接口返回值的隐藏configNames进行映射
export const fieldReflection = {
  // 标准页签
  comBasicReq: 'basicInfo', // 登记信息
  comBusinessReqDTO: 'businessInfo', // 注册业务信息
  comContactsReqs: 'contactInfo', // 联系人
  comAddressReqs: 'addressInfo', // 地址
  comBankAccReqs: 'bankInfo', // 银行
  supInvoiceReq: 'invoiceInfo', // 开票信息
  supAttachmentReqs: 'attachmentInfo', // 附件
  supChangeAbilityLn: 'abilityInfo', // 供货能力清单
  supChangeCate: 'changeCate', // 供应商分类,
  purchaseInfo: 'pfInfo', // 采购/财务信息
  // supChangeEbsAdds
  supChangeOther: 'changeOtherInfo', // 其他信息
  // 调查表页签
  sslmInvestgBasic: 'sslmInvestgBasic', // 基本信息
  sslmInvestgBusiness: 'sslmInvestgBusiness', // 业务信息
  sslmInvestgRd: 'sslmInvestgRd', // 研发能力
  sslmInvestgProduce: 'sslmInvestgProduce', // 生产能力
  sslmInvestgQa: 'sslmInvestgQa', // 质保能力
  sslmInvestgCustservice: 'sslmInvestgCustservice', // 售后服务
  sslmInvestgReserve3: 'sslmInvestgReserve3', // 预留表单1
  sslmInvestgReserve4: 'sslmInvestgReserve4', // 预留表单2
  sslmInvestgReserve10: 'sslmInvestgReserve10', // 预留表单3
  sslmInvestgReserve11: 'sslmInvestgReserve11', // 预留表单4
  sslmInvestgReserve12: 'sslmInvestgReserve12', // 预留表单5
  sslmInvestgReserve13: 'sslmInvestgReserve13', // 预留表单6
  sslmInvestgReserve14: 'sslmInvestgReserve14', // 预留表单7
  sslmInvestgProservice: 'sslmInvestgProservice', // 产品及服务
  sslmInvestgSupplierCate: 'sslmInvestgSupplierCate', // 供应商分类
  sslmInvestgFin: 'sslmInvestgFin', // 近三年财务状况
  sslmInvestgFinBranch: 'sslmInvestgFinBranch', // 分支机构
  sslmInvestgAuth: 'sslmInvestgAuth', // 资质信息
  sslmInvestgContact: 'sslmInvestgContact', // 联系人信息
  sslmInvestgAddress: 'sslmInvestgAddress', // 地址信息
  sslmInvestgBankAccount: 'sslmInvestgBankAccount', // 开户行信息
  sslmInvestgCustomer: 'sslmInvestgCustomer', // 主要客户情况
  sslmInvestgSubSupplier: 'sslmInvestgSubSupplier', // 分供方情况
  sslmInvestgEquipment: 'sslmInvestgEquipment', // 设备信息
  sslmInvestgAttachment: 'sslmInvestgAttachment', // 附件信息
  sslmInvestgReserve1: 'sslmInvestgReserve1', // 预留表格1
  sslmInvestgReserve2: 'sslmInvestgReserve2', // 预留表格2
  sslmInvestgReserve5: 'sslmInvestgReserve5', // 预留表格3
  sslmInvestgReserve6: 'sslmInvestgReserve6', // 预留表格4
  sslmInvestgReserve7: 'sslmInvestgReserve7', // 预留表格5
  sslmInvestgReserve8: 'sslmInvestgReserve8', // 预留表格6
  sslmInvestgReserve9: 'sslmInvestgReserve9', // 预留表格7
};

// 标准和调查表重合页签
export const fieldReflectionCom = {
  sslmInvestgContact: 'contactInfo', // 联系人
  sslmInvestgAddress: 'addressInfo', // 地址
  sslmInvestgBankAccount: 'bankInfo', // 银行
  sslmInvestgAttachment: 'attachmentInfo', // 附件
  // supChangeAbilityLn: 'abilityInfo', // 供货能力清单
  sslmInvestgSupplierCate: 'changeCate', // 供应商分类,
};
