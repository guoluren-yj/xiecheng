/*
 * @Date: 2023-04-11 10:17:25
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import { PHONE, NOT_CHINA_PHONE } from 'utils/regExp';

const organizationId = getCurrentOrganizationId();

// 是否根据采购方二级域名注册并且勾选了不允许其他企业看到我
const getIsSubdomainsRegister = ({ dataSet }) => {
  const { isSubdomainsRegister } = dataSet.getState('dsState') || {};
  return isSubdomainsRegister;
};

// 认证地区，0-境外，1-境内，2-个人
const getDomesticForeignRelation = ({ dataSet }) => {
  const { domesticForeignRelation } = dataSet.getState('dsState') || {};
  return domesticForeignRelation;
};

export const getInvoiceDS = () => ({
  forceValidate: true,
  fields: [
    {
      name: 'invoiceHeader',
      label: intl.get('sslm.enterpriseInform.view.model.invoice.invoiceHeader').d('发票头'),
      dynamicProps: {
        required: ({ dataSet }) => getIsSubdomainsRegister({ dataSet }),
        disabled: ({ dataSet }) => !getIsSubdomainsRegister({ dataSet }),
      },
    },
    {
      name: 'taxRegistrationNumber',
      label: intl.get('sslm.enterpriseInform.view.model.invoice.taxNumber').d('税务登记号'),
      dynamicProps: {
        disabled: ({ dataSet }) => !getIsSubdomainsRegister({ dataSet }),
        required: ({ dataSet }) =>
          getIsSubdomainsRegister({ dataSet }) && getDomesticForeignRelation({ dataSet }) === 1,
      },
    },
    {
      name: 'depositBank',
      label: intl.get('sslm.enterpriseInform.view.model.invoice.depositBank').d('开户行'),
      dynamicProps: {
        disabled: ({ dataSet }) => !getIsSubdomainsRegister({ dataSet }),
      },
    },
    {
      name: 'bankAccountNum',
      type: 'secret',
      label: intl.get('sslm.enterpriseInform.view.model.invoice.bankAccountNum').d('开户行账号'),
      dynamicProps: {
        readOnly: ({ dataSet }) => !getIsSubdomainsRegister({ dataSet }),
      },
    },
    {
      name: 'taxRegistrationAddress',
      label: intl.get('sslm.enterpriseInform.view.model.invoice.taxAddress').d('税务登记地址'),
      dynamicProps: {
        disabled: ({ dataSet }) => !getIsSubdomainsRegister({ dataSet }),
      },
    },
    {
      name: 'taxRegistrationPhone',
      label: intl.get('sslm.enterpriseInform.view.model.invoice.taxPhone').d('税务登记电话'),
      dynamicProps: {
        disabled: ({ dataSet }) => !getIsSubdomainsRegister({ dataSet }),
      },
    },
    {
      name: 'receiver',
      label: intl.get('sslm.common.model.invoice.taker').d('收票人'),
    },
    {
      name: 'receiveMail',
      type: 'email',
      label: intl.get('sslm.enterpriseInform.view.model.invoice.receiveMail').d('收票人邮箱'),
    },
    {
      name: 'internationalTelCode',
      defaultValue: '+86',
      lookupCode: 'HPFM.IDD',
    },
    {
      name: 'receivePhone',
      type: 'tel',
      regionField: 'internationalTelCode',
      label: intl.get('sslm.enterpriseInform.view.model.invoice.receivePhone').d('收票人手机号'),
      dynamicProps: {
        pattern: ({ record }) =>
          record.get('internationalTelCode') === '+86' ? PHONE : NOT_CHINA_PHONE,
      },
    },
    {
      name: 'receiveAddress',
      label: intl.get('sslm.common.model.invoice.ticketAddress').d('收票地址'),
    },
  ],
  transport: {
    read: ({ dataSet }) => {
      const { companyId, changeReqId, supplierCompanyId } = dataSet.getState('dsState') || {};
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/sup-invoice-reqs/all`,
        method: 'GET',
        params: {},
        data: {
          companyId,
          changeReqId,
          dataSource: 2,
          supplierFlag: 1,
          supplierCompanyId,
          customizeUnitCode: 'SSLM.SUPPLIER_INFORM_CHANGE_NEW_DETAIL.INVOICE',
        },
      };
    },
  },
});
