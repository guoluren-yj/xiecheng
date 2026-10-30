import { isEmpty } from 'lodash';
import BussinessInfo from '../components/BussinessInfo';
import ContactInfo from '../components/ContactInfo';
import AddressInfo from '../components/AddressInfo';
import BankAccount from '../components/BankAccount';
import InvoiceInfo from '../components/InvoiceInfo';
import FinanceInfo from '../components/FinanceInfo';
import AttachmentInfo from '../components/AttachmentInfo';
import OtherInfo from '../components/OtherInfo';

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

export const getCardList = (params = {}) => {
  const { renderTabList = [] } = params;
  if (isEmpty(renderTabList)) {
    return [];
  }
  const allCardList = [
    {
      key: BUSSINESS,
      component: BussinessInfo,
    },
    {
      key: CONTANT,
      component: ContactInfo,
    },
    {
      key: ADDRESS,
      component: AddressInfo,
    },
    {
      key: BANK_ACCOUNT,
      component: BankAccount,
    },
    {
      key: INVOICE,
      component: InvoiceInfo,
    },
    {
      key: FIN,
      component: FinanceInfo,
    },
    {
      key: ATTACHMENT,
      component: AttachmentInfo,
    },
    {
      key: OTHERINFO,
      component: OtherInfo,
    },
  ];
  const tabList = renderTabList.map(tab => {
    const { configName } = tab;
    let component = null;
    const tabInfo = allCardList.find(i => i.key === configName);
    if (tabInfo) {
      const { component: com } = tabInfo;
      component = com;
    }
    return {
      ...tab,
      component,
    };
  });

  return tabList;
};
