/*
 * @Date: 2023-08-25
 * @Author: CDJ <dengji.chen@hand-china.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import intl from 'utils/intl';
import { SRM_SSLM, SRM_PLATFORM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import { PHONE, NOT_CHINA_PHONE } from 'utils/regExp';

import { getReadTransport } from '../utils';

const organizationId = getCurrentOrganizationId();

// 处理必输
const getRequired = ({ dataSet, isAllPlatform = false } = {}) => {
  const { reqStatus } = dataSet.getState('dsState') || {};
  return ['NEW', 'REJECTED', 'CONFIRM_REJECTED'].includes(reqStatus) && isAllPlatform;
};

// 认证地区，0-境外，1-境内，2-个人
const getDomesticForeignRelation = ({ dataSet }) => {
  const { domesticForeignRelation } = dataSet.getState('dsState') || {};
  return domesticForeignRelation;
};

export const getInvoiceDS = ({
  isAllPlatform,
  partnerTenantId,
  readOnlyFlag = false,
  code = '',
  ...rest
} = {}) => ({
  forceValidate: true,
  paging: false,
  dataKey: readOnlyFlag && isAllPlatform ? 'newInvoice' : null,
  fields: [
    {
      name: 'invoiceHeader',
      label: intl.get('sslm.enterpriseInform.view.model.invoice.invoiceHeader').d('发票头'),
      dynamicProps: {
        required: ({ dataSet }) => getRequired({ dataSet, isAllPlatform }),
        disabled: ({ dataSet }) => !getRequired({ dataSet, isAllPlatform }),
      },
    },
    {
      name: 'taxRegistrationNumber',
      label: intl.get('sslm.enterpriseInform.view.model.invoice.taxNumber').d('税务登记号'),
      dynamicProps: {
        disabled: ({ dataSet }) => !getRequired({ dataSet, isAllPlatform }),
        required: ({ dataSet }) =>
          getRequired({ dataSet }) && getDomesticForeignRelation({ dataSet }) === 1,
      },
    },
    {
      name: 'depositBank',
      label: intl.get('sslm.enterpriseInform.view.model.invoice.depositBank').d('开户行'),
      dynamicProps: {
        disabled: ({ dataSet }) => !getRequired({ dataSet, isAllPlatform }),
      },
    },
    {
      name: 'bankAccountNum',
      label: intl.get('sslm.enterpriseInform.view.model.invoice.bankAccountNum').d('开户行账号'),
      dynamicProps: {
        disabled: ({ dataSet }) => !getRequired({ dataSet, isAllPlatform }),
      },
    },
    {
      name: 'taxRegistrationAddress',
      label: intl.get('sslm.enterpriseInform.view.model.invoice.taxAddress').d('税务登记地址'),
      dynamicProps: {
        disabled: ({ dataSet }) => !getRequired({ dataSet, isAllPlatform }),
      },
    },
    {
      name: 'taxRegistrationPhone',
      label: intl.get('sslm.enterpriseInform.view.model.invoice.taxPhone').d('税务登记电话'),
      dynamicProps: {
        disabled: ({ dataSet }) => !getRequired({ dataSet, isAllPlatform }),
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
      lovPara: { tenantId: isAllPlatform ? 0 : partnerTenantId },
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
      const readUrlProps = getReadTransport({ dataSet, code, ...rest });
      const { companyId, changeReqId, supplierCompanyId } = dataSet.getState('dsState') || {};
      const url = isAllPlatform
        ? `${SRM_PLATFORM}/v1/${organizationId}/com-invoice-reqs/all`
        : `${SRM_SSLM}/v1/${organizationId}/sup-invoice-reqs/all`;
      return !readOnlyFlag
        ? {
            url,
            method: 'GET',
            params: {},
            data: {
              changeReqId,
              companyId,
              supplierCompanyId,
              supplierFlag: isAllPlatform ? 0 : 1,
              dataSource: 1,
              customizeUnitCode: isAllPlatform ? null : code,
              customizeTenantId: isAllPlatform ? null : partnerTenantId,
              desensitize: false,
            },
          }
        : readUrlProps;
    },
  },
});
