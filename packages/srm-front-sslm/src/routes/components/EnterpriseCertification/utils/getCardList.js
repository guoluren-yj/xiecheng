import { isEmpty } from 'lodash';

import intl from 'utils/intl';

import BusinessInfo from '../components/BusinessInfo';
import ContactInfo from '../components/ContactInfo';
import AttachmentInfo from '../components/AttachmentInfo';
import AddressInfo from '../components/AddressInfo';
import BankAccount from '../components/BankAccount';
import InvoiceInfo from '../components/InvoiceInfo';
import FinanceInfo from '../components/FinanceInfo';

export const REGISTER_IN = 'spfm_company_basic_in'; // 境内
export const REGISTER_OUT = 'spfm_company_basic_out'; // 境外
export const BUSSINESS = 'spfm_company_business';
export const BANK_ACCOUNT = 'spfm_company_bank_account';
export const CONTANT = 'spfm_company_contact';
export const ADDRESS = 'spfm_company_address';
export const INVOICE = 'spfm_company_invoice';
export const FIN = 'spfm_company_fin';
export const ATTACHMENT = 'spfm_company_attachment';
export const OTHERINFO = 'sslm_sup_change_other';

// 获取页签配置映射
export const getConfigKeyByconfigName = (configName = '') => {
  const keys = {
    [BUSSINESS]: 'bussinessInfoConfig',
    [CONTANT]: 'contactInfo',
    [ADDRESS]: 'addressInfo',
    [BANK_ACCOUNT]: 'bankInfo',
    [INVOICE]: 'invoiceInfo',
    [FIN]: 'finInfo',
    [ATTACHMENT]: 'attachmentInfo',
    [OTHERINFO]: 'configInfo',
  };
  return keys[configName] || '';
};

export const renderPlatformCardList = (params = {}) => {
  const { renderTabList = [] } = params;
  if (isEmpty(renderTabList)) {
    return [];
  }
  const allCardList = getPlatformCardList();
  const tabList = renderTabList
    .map(tab => {
      const { configName } = tab;
      let tabProps = {};
      const tabInfo = allCardList.find(i => i.key === configName);
      if (!tabInfo) {
        return false;
      }
      tabProps = tabInfo;
      return {
        ...tab,
        ...tabProps,
      };
    })
    .filter(Boolean);

  return tabList;
};

// 平台页签集合
export const getPlatformCardList = () => {
  const allCardList = [
    {
      key: BUSSINESS,
      component: BusinessInfo,
      label: intl.get(`spfm.enterprise.view.message.business`).d('基础业务信息'),
    },
    {
      key: CONTANT,
      component: ContactInfo,
      label: intl.get(`spfm.enterprise.view.message.contact`).d('联系人信息'),
    },
    {
      key: ADDRESS,
      component: AddressInfo,
      label: intl.get(`spfm.enterprise.view.message.page.addressInfo`).d('地址信息'),
    },
    {
      key: BANK_ACCOUNT,
      component: BankAccount,
      label: intl.get('spfm.enterprise.view.message.page.bankInfo').d('银行信息'),
    },
    {
      key: INVOICE,
      component: InvoiceInfo,
      label: intl.get('spfm.enterprise.view.message.page.invoiceInfo').d('开票信息'),
    },
    {
      key: FIN,
      component: FinanceInfo,
      label: intl.get('spfm.enterprise.view.message.page.financeInfo').d('财务信息'),
    },
    {
      key: ATTACHMENT,
      component: AttachmentInfo,
      label: intl.get(`spfm.enterprise.view.message.attachment`).d('附件信息'),
    },
  ];
  return allCardList;
};
