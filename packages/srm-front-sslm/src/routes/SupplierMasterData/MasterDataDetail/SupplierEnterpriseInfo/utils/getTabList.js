import intl from 'utils/intl';

import RegistrationInfo from '../components/RegistrationInfo'; // 登记信息
import BusinessInfo from '../components/BusinessInfo'; // 业务信息
import Contact from '../components/Contact'; // 联系人
import Address from '../components/Address'; // 地址
import BankAccount from '../components/BankAccount'; // 银行账户
import InvoiceInfo from '../components/InvoiceInfo'; // 开票信息
import Financial from '../components/Financial'; // 财务状况
import SupplierClassify from '../components/SupplierClassify'; // 供应商分类
import OtherInfo from '../components/OtherInfo'; // 其他信息
import Attachment from '../components/Attachment'; // 附件信息
import InvestigaTable from '../components/InvestigaTable'; // 重合调查表页签

// 企业基础信息 tab汇总
export const getBasicInfoTab = ({ platformCoincideConfigList = [] }) => {
  // 处理调查表页签
  return [
    {
      key: 'basic',
      lable: intl.get('sslm.supplierDetail.view.message.title.registrationInfo').d('登记信息'),
      component: RegistrationInfo,
    },
    {
      key: 'business',
      lable: intl.get('sslm.supplierDetail.view.message.basicBusinessInfo').d('基础业务信息'),
      component: BusinessInfo,
    },
    {
      key: 'contacts',
      lable: intl.get('sslm.supplierDetail.view.message.title.supplierContact').d('联系人'),
      component: Contact,
    },
    {
      key: 'address',
      lable: intl.get('sslm.supplierDetail.view.title.supplierAddress').d('地址'),
      component: Address,
    },
    {
      key: 'bankAccount',
      lable: intl.get('sslm.supplierDetail.view.message.bankInfo').d('银行信息'),
      component: BankAccount,
    },
    {
      key: 'invoice',
      lable: intl.get('sslm.supplierDetail.view.message.invoiceInfo').d('开票信息'),
      component: InvoiceInfo,
    },
    {
      key: 'finance',
      lable: intl.get('sslm.supplierDetail.view.message.financialStatus').d('财务状况'),
      component: Financial,
    },
    {
      key: 'attachment',
      lable: intl.get('sslm.supplierDetail.model.supplierDetail.attachmentMessage').d('附件信息'),
      component: Attachment,
    },
    {
      key: 'supplierClassify',
      lable: intl.get('sslm.supplierDetail.view.message.title.supplierClass').d('供应商分类'),
      component: SupplierClassify,
    },
    {
      key: 'otherInfo',
      lable: intl.get('sslm.supplierDetail.view.message.otherInfo').d('其他信息'),
      component: OtherInfo,
    },
  ].map(i => {
    const { key, component } = i;
    const investigaProps = handleInvestigaTab(key, component, platformCoincideConfigList);
    const { component: newComponent, investigaConfig } = investigaProps;
    return { ...i, component: newComponent, investigaConfig };
  });
};

// 处理调查表页签
const handleInvestigaTab = (key, component, platformCoincideConfigList = []) => {
  let investigaConfigName = '';
  switch (key) {
    case 'contacts': {
      investigaConfigName = 'sslmInvestgContact';
      break;
    }
    case 'address': {
      investigaConfigName = 'sslmInvestgAddress';
      break;
    }
    case 'bankAccount': {
      investigaConfigName = 'sslmInvestgBankAccount';
      break;
    }
    case 'finance': {
      investigaConfigName = 'sslmInvestgFin';
      break;
    }
    case 'attachment': {
      investigaConfigName = 'sslmInvestgAttachment';
      break;
    }
    default:
      break;
  }
  const investigaConfig = platformCoincideConfigList.find(
    n => n.configName === investigaConfigName
  );
  const newComponent = investigaConfig ? InvestigaTable : component;
  return { component: newComponent, investigaConfig };
};
