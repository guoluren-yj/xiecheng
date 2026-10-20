import intl from 'utils/intl';

import { Prefix } from '@/utils/globalVariable';
import { EMAIL, NOT_CHINA_PHONE, PHONE } from 'utils/regExp';

const supplierLineDS = (options = {}) => {
  const {
    rfxHeaderId,
    customizeUnitCode,
    organizationId,
    companyId,
    allowInputSupplierNameFlag = 0,
  } = options || {};

  return {
    autoQuery: false,
    primaryKey: 'rfxLineSupplierId',
    cacheSelection: true,
    autoQueryAfterSubmit: true,
    forceValidate: true,
    fields: [
      {
        name: 'supplierCompanyId',
        type: 'object',
        label: intl.get('ssrc.common.supplierNum').d('供应商编码'),
        lovCode: 'SSLM.SUPPLIER',
        valueField: 'businesskey',
        textField: 'supplierCompanyNum',
        transformRequest: (value) => (value ? value?.supplierCompanyId : null),
        transformResponse: (value, data) => {
          const { supplierCompanyNum = null } = data || {};
          const supplierLovObj =
            value || supplierCompanyNum
              ? {
                  supplierCompanyId: value,
                  supplierCompanyNum,
                }
              : null;
          return supplierLovObj;
        },
        dynamicProps: {
          disabled({ record }) {
            const { rfxLineSupplierId, existQuotationFlag } = record.get([
              'existQuotationFlag',
              'rfxLineSupplierId',
            ]); // 已生成报价行标识
            const flag = !companyId || existQuotationFlag || rfxLineSupplierId;
            return flag;
          },
          required({ record }) {
            const { existQuotationFlag } = record.get([
              'existQuotationFlag', // 已生成报价行标识
            ]);

            const flag = companyId && !existQuotationFlag && !allowInputSupplierNameFlag;
            return flag;
          },
        },
      },
      {
        name: 'supplierCompanyNum',
        bind: 'supplierCompanyId.supplierCompanyNum',
      },
      {
        name: 'companyId',
        type: 'string',
      },
      {
        name: 'supplierTenantId',
      },
      {
        name: 'supplierCompanyName', // 配置表配置了使用新供应商lov,这里渲染新的lov组件SupplierLov, 使用新的赋值逻辑处理
        type: 'object',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierName`).d('供应商名称'),
        maxLength: 360,
        lovCode: 'SSRC.SUPPLIER',
        // valueField: 'supplierCompanyName',
        textField: 'supplierCompanyName',
        transformRequest: (value) => value?.supplierCompanyName || null,
        transformResponse: (value) => {
          return value ? { supplierCompanyName: value } : null;
        },
        dynamicProps: {
          disabled({ record }) {
            const { rfxLineSupplierId, supplierCompanyId, existQuotationFlag } = record.get([
              'rfxLineSupplierId',
              'supplierCompanyId',
              'existQuotationFlag',
            ]);
            const { supplierCompanyNum } = supplierCompanyId || {};

            const flag =
              !companyId ||
              !!supplierCompanyNum ||
              existQuotationFlag ||
              rfxLineSupplierId ||
              !allowInputSupplierNameFlag;
            return flag;
          },
          required({ record }) {
            const { supplierCompanyNum } = record.get('supplierCompanyId') || {};
            const { rfxLineSupplierId, existQuotationFlag } = record.get([
              'rfxLineSupplierId',
              'existQuotationFlag', // 已生成报价行标识
            ]);

            const flag =
              companyId &&
              !supplierCompanyNum &&
              !existQuotationFlag &&
              !rfxLineSupplierId &&
              allowInputSupplierNameFlag;
            return flag;
          },
        },
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.contacts`).d('联系人'),
        name: 'supplierContactId',
        type: 'object',
        lovCode: 'SSRC.SUPPLIER_CONTANCTS',
        textField: 'contactName',
        valueField: 'supplierContactId',
        transformRequest: (value) => value?.supplierContactId || null,
        transformResponse: (value, data) => {
          return value ? { supplierContactId: value, contactName: data?.contactName } : null;
        },
        dynamicProps: {
          // disabled({ record }) {
          //   const { supplierCompanyNum } = record.get('supplierCompanyId') || {};
          //   return supplierCompanyNum;
          // },
          lovPara({ record }) {
            const { supplierCompanyId } = record.get('supplierCompanyId') || {};

            return {
              companyId,
              supplierCompanyId,
              tenantId: organizationId,
            };
          },
        },
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.contacts`).d('联系人'),
        name: 'contactName',
        type: 'string',
        maxLength: 360,
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.tel`).d('联系电话'),
        name: 'contactMobilephone',
        width: 100,
        type: 'string',
        dynamicProps: {
          pattern({ record }) {
            const patternFlag =
              (record.get('internationalTelCode') || '+86') === '+86' ? PHONE : NOT_CHINA_PHONE;
            return patternFlag;
          },
          // disabled({ record }) {
          //   const { supplierCompanyNum } = record.get('supplierCompanyId') || {};
          //   return supplierCompanyNum;
          // },
        },
      },
      // {
      //   name: 'internationalTelCode',
      //   type: 'string',
      //   lookupCode: 'HPFM.IDD',
      //   defaultValue: '+86',
      //   dynamicProps: {
      //     disabled({ record }) {
      //       const supplierCompanyId = record.get('supplierCompanyId');
      //       return !supplierCompanyId;
      //     },
      //   },
      // },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.email`).d('电子邮件'),
        name: 'contactMail',
        validator: (value, _, record) => {
          if (value && !EMAIL.test(record.get('contactMail'))) {
            return intl.get('hzero.common.validation.email').d('邮箱格式不正确');
          }
          return true;
        },
      },
    ],
    events: {
      submitSuccess: ({ dataSet }) => {
        dataSet.query(undefined, undefined, true);
      },
    },
    transport: {
      read: ({ data }) => {
        if (!rfxHeaderId) {
          return;
        }

        return {
          url: `${Prefix}/${organizationId}/rfx/offline-whole/suppliers`,
          method: 'GET',
          data: {
            tenantId: organizationId,
            organizationId,
            rfxHeaderId,
            customizeUnitCode,
            ...data,
          },
        };
      },
      destroy: ({ data }) => {
        return {
          url: `${Prefix}/${organizationId}/rfx/offline-whole/suppliers`,
          method: 'DELETE',
          params: { customizeUnitCode },
          data,
        };
      },
      submit: ({ data }) => {
        return {
          url: `${Prefix}/${organizationId}/rfx/offline-whole/suppliers`,
          method: 'POST',
          params: {
            rfxHeaderId,
            tenantId: organizationId,
            customizeUnitCode,
          },
          data,
        };
      },
    },
  };
};

// 新配置添加供应商DS
const SupplierLovDS = () => {
  return {
    autoCreate: true,
    fields: [
      {
        name: 'supplierLovList',
        type: 'object',
        lovCode: 'SSLM.SUPPLIER', // 固定值, 不可更改
        multiple: true,
      },
    ],
  };
};

export { supplierLineDS, SupplierLovDS };
