/*
 * @Date: 2023-04-26 14:32:09
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import intl from 'utils/intl';
import { DataSet } from 'choerodon-ui/pro';

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
import { PLATFORM_TABS } from '../utils';

export const getPanelList = ({
  remote,
  basicDs,
  investigationTab = [],
  platformTabsHidden = [],
} = {}) => {
  const newPlatformTabsHidden = platformTabsHidden || [];
  // 地址信息
  const addressDsProps = getAddressDS();
  const remoteAddressDsProps = remote
    ? remote.process('SSLM_SUPPLIER_INFORM_NEW_ADDRESS_DS_PROPS', addressDsProps, { basicDs })
    : addressDsProps;
  // 供应商分类
  const classfiyDsProps = getSupplierClassifyDS();
  const remoteClassfiyDsProps = remote
    ? remote.process('SSLM_SUPPLIER_INFORM_NEW_CLASSFIY_DS_PROPS', classfiyDsProps)
    : classfiyDsProps;
  // 采购财务头
  const purchaseHeaderDsProps = remote
    ? remote.process('SSLM_SUPPLIER_INFORM_NEW_PURCHASE_HEADER_DS_PROPS', getPurchaseHeaderDS(), {
        basicDs,
      })
    : getPurchaseHeaderDS();
  // 采购财务行
  const purchaseLineDsProps = remote
    ? remote.process('SSLM_SUPPLIER_INFORM_NEW_PURCHASE_LINE_DS_PROPS', getPurchaseLineDS(), {
        basicDs,
      })
    : getPurchaseLineDS();
  // 其他信息
  const otherDsProps = getOtherInfoDS();
  const remoteOtherDsProps = remote
    ? remote.process('SSLM_SUPPLIER_INFORM_NEW_OTHER_DS_PROPS', otherDsProps, { basicDs })
    : otherDsProps;
  const otherDs = new DataSet(remoteOtherDsProps);
  // 地点层信息
  const locationDsProps = getLocationDS();
  const remoteLocationDsProps = remote
    ? remote.process('SSLM_SUPPLIER_INFORM_NEW_LOCATION_DS_PROPS', locationDsProps, {
        basicDs,
        otherDs,
      })
    : locationDsProps;
  const locationDs = new DataSet(remoteLocationDsProps);
  // 银行信息
  const bankDsProps = getBankDS();
  const remoteBankDsProps = remote
    ? remote.process('SSLM_SUPPLIER_INFORM_NEW_BANK_DS_PROPS', bankDsProps, { basicDs, locationDs })
    : bankDsProps;
  const bankDs = new DataSet(remoteBankDsProps);
  return [
    {
      isForm: true,
      key: 'comBasicReq',
      tab: intl.get('sslm.supplierDetail.view.fixCatalog.registInform').d('登记信息'),
      component: Register,
      dataSet: new DataSet(getRegisterDS()),
    },
    {
      isForm: true,
      key: 'comBusinessReqDTO',
      tab: intl.get('sslm.supplierDetail.view.fixCatalog.businessInform').d('基础业务信息'),
      component: Business,
      dataSet: new DataSet(getBusinessDS()),
    },
    {
      key: 'comContactsReqs',
      tab: intl.get('sslm.supplierDetail.view.fixCatalog.contactInform').d('联系人信息'),
      component: Contact,
      dataSet: new DataSet(getContactDS()),
      hidden:
        investigationTab.includes('sslmInvestgContact') ||
        newPlatformTabsHidden.includes(PLATFORM_TABS.PLATFORM_CONTACTS),
    },
    {
      key: 'comAddressReqs',
      hidden: investigationTab.includes('sslmInvestgAddress'),
      tab: intl.get('sslm.supplierDetail.view.fixCatalog.addressInform').d('地址信息'),
      component: Address,
      dataSet: new DataSet(remoteAddressDsProps),
    },
    {
      key: 'comBankAccReqs',
      hidden: investigationTab.includes('sslmInvestgBankAccount'),
      tab: intl.get('sslm.supplierDetail.view.fixCatalog.bankInform').d('银行信息'),
      component: Bank,
      dataSet: bankDs,
    },
    {
      isForm: true,
      key: 'supInvoiceReq',
      tab: intl.get('sslm.supplierDetail.view.fixCatalog.invoiceInform').d('开票信息'),
      component: Invoice,
      dataSet: new DataSet(getInvoiceDS()),
    },
    {
      key: 'supAttachmentReqs',
      hidden: investigationTab.includes('sslmInvestgAttachment'),
      tab: intl.get('sslm.enterpriseInform.view.fixCatalog.attachmentInform').d('附件信息'),
      component: Attachment,
      dataSet: new DataSet(getAttachmentDS()),
    },
    {
      key: 'supChangeAbilityLn',
      tab: intl.get('sslm.supplierDetail.view.fixCatalog.supplyCapacityList').d('供货能力清单'),
      component: SupplyAbility,
      dataSet: new DataSet(getSupplyAbilityDS()),
    },
    {
      key: 'supChangeCate',
      hidden: investigationTab.includes('sslmInvestgSupplierCate'),
      tab: intl.get('sslm.supplierInform.view.fixCatalog.supplierClassify').d('供应商分类'),
      component: SupplierClassify,
      dataSet: new DataSet(remoteClassfiyDsProps),
    },
    {
      key: 'purchaseInfo',
      tab: intl.get('sslm.supplierInform.view.fixCatalog.purchaseInform').d('采购/财务信息'),
      component: PurchaseFinance,
      dataSet: [
        {
          isForm: true,
          key: 'supChangeSync',
          dataSet: new DataSet(purchaseHeaderDsProps),
        },
        {
          key: 'supChangeSyncPf',
          dataSet: new DataSet(purchaseLineDsProps),
        },
      ],
    },
    {
      key: 'supChangeEbsAdds',
      tab: intl.get('sslm.supplierInform.view.fixCatalog.locationInform').d('地点层信息'),
      component: LocationInfo,
      dataSet: locationDs,
    },
    {
      isForm: true,
      key: 'supChangeOther',
      tab: intl.get('sslm.supplierInform.view.fixCatalog.otherInform').d('其他信息'),
      component: OtherInfo,
      dataSet: otherDs,
    },
  ].filter((panel) => !panel.hidden);
};
