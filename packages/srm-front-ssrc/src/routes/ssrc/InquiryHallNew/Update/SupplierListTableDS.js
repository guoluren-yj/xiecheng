import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { EMAIL, NOT_CHINA_PHONE, PHONE } from 'utils/regExp';

import { Prefix } from '@/utils/globalVariable';
import { commonValidationRules } from './utils/dsUtils';

const SupplierListTableDS = (options = {}) => {
  const { rfxInfoDS = null } = options;

  const getSourceMethod = () => {
    const { current: rfxInfoRecord } = rfxInfoDS || {};
    if (rfxInfoRecord) {
      return rfxInfoRecord.get('sourceMethod');
    }
    return null;
  };

  return {
    autoQuery: false,
    primaryKey: 'rfxLineSupplierId',
    dataToJSON: 'all',
    validationRules: commonValidationRules('minLength')(),
    fields: [
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.selectSupplier`).d('供应商选择'),
        name: 'selectSupplier',
        type: 'object',
        ignore: 'always',
        lovCode: 'SSRC.SUPPLIER',
        textField: 'supplierCompanyNum',
        valueField: 'supplierCompanyId',
        transformRequest: () => null,
        transformResponse: (value, data) => {
          const { supplierCompanyNum } = data || {};
          return value || supplierCompanyNum
            ? { supplierCompanyId: value, supplierCompanyNum }
            : null;
        },
        dynamicProps: {
          // required({ dataSet = {}, record = {} }) {
          //   const {
          //     queryParameter: { headers = {} },
          //   } = dataSet;
          //   const { sourceMethod = null, allowChangeSupplyFlag } = headers || {};
          //   return sourceMethod === 'INVITE' && record.status === 'add' && !allowChangeSupplyFlag;
          // },
          // lovPara({ dataSet = {} }) {
          //   const {
          //     queryParameter: {
          //       company = {},
          //       commonProps: { organizationId = null, userId = null },
          //     },
          //   } = dataSet;
          //   const { companyId = null } = company || {};

          //   return {
          //     organizationId,
          //     userId,
          //     companyId,
          //   };
          // },
          disabled({ dataSet = {} }) {
            const {
              queryParameter: { headers = {} },
            } = dataSet;
            const { allowChangeSupplyFlag } = headers || {};
            const sourceMethod = getSourceMethod();
            return sourceMethod !== 'INVITE' || allowChangeSupplyFlag;
          },
        },
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierCode`).d('供应商编码'),
        name: 'supplierLov',
        type: 'object',
        ignore: 'always',
        lovCode: 'SSRC.SUPPLIER',
        textField: 'supplierCompanyNum',
        valueField: 'supplierCompanyId',
        // dynamicProps: {
        //   required({ dataSet = {}, record = {} }) {
        //     const {
        //       queryParameter: { headers = {} },
        //     } = dataSet;
        //     const { sourceMethod = null, allowChangeSupplyFlag } = headers || {};
        //     return sourceMethod === 'INVITE' && record.status === 'add' && !allowChangeSupplyFlag;
        //   },
        //   lovPara({ dataSet = {} }) {
        //     const {
        //       queryParameter: {
        //         company = {},
        //         commonProps: { organizationId = null, userId = null },
        //       },
        //     } = dataSet;
        //     const { companyId = null } = company || {};

        //     return {
        //       organizationId,
        //       userId,
        //       companyId,
        //     };
        //   },
        //   disabled({ dataSet = {}, record }) {
        //     const {
        //       queryParameter: { headers = {} },
        //     } = dataSet;
        //     const { sourceMethod = null, allowChangeSupplyFlag } = headers || {};
        //     return sourceMethod !== 'INVITE' || record.status !== 'add' || allowChangeSupplyFlag;
        //   },
        // },
      },
      {
        name: 'supplierCompanyId',
        bind: 'supplierLov.supplierCompanyId',
      },
      {
        name: 'supplierCompanyNum',
        bind: 'supplierLov.supplierCompanyNum',
      },
      {
        name: 'companyId',
        type: 'string',
      },
      {
        name: 'supplierTenantId',
        type: 'string',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierName`).d('供应商名称'),
        name: 'supplierCompanyName',
        type: 'string',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierCategory`).d('供应商分类'),
        name: 'supplierCategoryDescription',
        type: 'string',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.priceCoefficient`).d('价格系数'),
        name: 'priceCoefficient',
        type: 'number',
        step: 0,
        min: 0,
        max: 999999999,
        dynamicProps: {
          required({ record }) {
            return record.get('rankRule') === 'WEIGHT_PRICE';
          },
        },
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.lifeCycle`).d('生命周期阶段'),
        name: 'stageDescription',
        type: 'string',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.riskLevel`).d('风险等级'),
        name: 'riskLevel',
        lookupCode: 'SDAT.WORKBENCH_EVENT_LEVEL',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.riskScan`).d('风险扫描'),
        type: 'string',
        name: 'riskScan',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.contacts`).d('联系人'),
        name: 'contactNameLov',
        type: 'object',
        ignore: 'always',
        lovCode: 'SSRC.SUPPLIER_CONTANCTS',
        textField: 'contactName',
        valueField: 'supplierContactId',
        dynamicProps: {
          // required({ dataSet, record }) {
          //   const {
          //     queryParameter: { headers = {} },
          //   } = dataSet;
          //   const { sourceMethod = null } = headers;
          //   const supplierCompanyId = record.get('supplierCompanyId');
          //   return supplierCompanyId && sourceMethod === 'INVITE';
          // },
          disabled({ record }) {
            const sourceMethod = getSourceMethod();
            const supplierCompanyId = record.get('supplierCompanyId');
            return !supplierCompanyId || sourceMethod !== 'INVITE';
          },
          lovPara({ dataSet = {}, record }) {
            const {
              queryParameter: { company = {} },
            } = dataSet;
            const { companyId = null } = company;
            const supplierCompanyId = record.get('supplierCompanyId');

            return {
              companyId,
              supplierCompanyId,
              tenantId: getCurrentOrganizationId(),
            };
          },
        },
      },
      {
        name: 'supplierContactId',
        bind: 'contactNameLov.supplierContactId',
      },
      {
        name: 'contactName',
        bind: 'contactNameLov.contactName',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.tel`).d('联系电话'),
        name: 'contactMobilephone',
        type: 'string',
        dynamicProps: {
          pattern({ record }) {
            const patternFlag =
              (record.get('internationalTelCode') || '+86') === '+86' ? PHONE : NOT_CHINA_PHONE;
            return patternFlag;
          },
          disabled({ record }) {
            const sourceMethod = getSourceMethod();
            const supplierCompanyId = record.get('supplierCompanyId');
            return !supplierCompanyId || sourceMethod !== 'INVITE';
          },
        },
      },
      {
        name: 'internationalTelCode',
        type: 'string',
        lookupCode: 'HPFM.IDD',
        defaultValue: '+86',
        dynamicProps: {
          disabled({ record }) {
            const sourceMethod = getSourceMethod();
            const supplierCompanyId = record.get('supplierCompanyId');
            return !supplierCompanyId || sourceMethod !== 'INVITE';
          },
        },
      },
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
      {
        // label: intl.get('hzero.common.button.action').d('操作'),
        name: 'allotItem',
      },
      {
        name: 'isMonitor',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
      },
      {
        name: 'isShowScan',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
      },
      {
        name: 'objectVersionNumber',
        type: 'number',
      },
      {
        name: 'supplierId',
      },
      {
        name: 'supplierName',
      },
      {
        name: 'bidFileExpensePaymentRule',
        label: intl
          .get('ssrc.inquiryHall.model.inquiryHall.paymentTypeOfTender')
          .d('招标文件费缴纳类型'),
        type: 'string',
        lookupCode: 'SDEP.DEPOSIT_PAYMENT_RULE',
        // dynamicProps: {
        //   required({ record, dataSet }) {
        //     const { queryParameter: { headers = {} } = {} } = dataSet;
        //     const { tenderFeeFlag = null } = headers;
        //     const serviceChargeFlag = dataSet?.getState('serviceChargeFlag');
        //     const { sourceMethod } = record.get(['sourceMethod']);

        //     const flag = sourceMethod === 'INVITE' && tenderFeeFlag === 1 && serviceChargeFlag;
        //     return flag;
        //   },
        // },
      },
      {
        name: 'depositPaymentRule',
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.marginPaymentType').d('保证金缴纳类型'),
        type: 'string',
        lookupCode: 'SDEP.DEPOSIT_PAYMENT_RULE',
        // dynamicProps: {
        //   required({ record, dataSet }) {
        //     const { queryParameter: { headers = {} } = {} } = dataSet;
        //     const { bidBondFlag = null } = headers;
        //     const serviceChargeFlag = dataSet?.getState('serviceChargeFlag');
        //     const { sourceMethod } = record.get(['sourceMethod']);

        //     const flag = sourceMethod === 'INVITE' && bidBondFlag === 1 && serviceChargeFlag;
        //     return flag;
        //   },
        // },
      },
    ],
    events: {
      update: ({ name, record = {}, value = {} }) => {
        if (name === 'supplierLov') {
          const {
            supplierCompanyName,
            supplierCompanyId,
            supplierCompanyNum,
            supplierTenantId,
            supplierContactId,
            companyId,
            contactName,
            mobilephone,
            mail,
            stageDescription,
            internationalTelCode,
            supplierCategoryDescription,
          } = value || {};
          record.set('supplierCompanyName', supplierCompanyName);
          record.set('supplierCompanyNum', supplierCompanyNum);
          record.set('supplierCompanyId', supplierCompanyId);
          record.set('supplierTenantId', supplierTenantId);
          record.set('supplierContactId', supplierContactId);
          record.set('companyId', companyId);
          record.set('contactName', contactName);
          record.set('contactMobilephone', mobilephone);
          record.set('internationalTelCode', internationalTelCode);
          record.set('contactMail', mail);
          record.set('stageDescription', stageDescription);
          record.set('supplierCategoryDescription', supplierCategoryDescription);
        }
        if (name === 'contactNameLov') {
          const {
            mobilephone = null,
            mail = null,
            name: contactName = null,
            companyContactId = null,
            internationalTelCode = null,
          } = value || {};
          record.set('contactMobilephone', mobilephone);
          record.set('internationalTelCode', internationalTelCode);
          record.set('contactMail', mail);
          record.set('contactName', contactName);
          record.set('supplierContactId', companyContactId);
        }
      },
      submitSuccess: ({ dataSet }) => {
        dataSet.query(undefined, undefined, true);
      },
    },
    transport: {
      read: ({ dataSet }) => {
        const {
          queryParameter: { commonProps = {} },
        } = dataSet;
        const { organizationId, rfxHeaderId, customizeUnitCode = null } = commonProps;
        if (!rfxHeaderId || rfxHeaderId === 'null') {
          return;
        }

        return {
          url: `${Prefix}/${organizationId}/rfx/${rfxHeaderId}/suppliers`,
          method: 'GET',
          data: {
            tenantId: organizationId,
            organizationId,
            rfxHeaderId,
            customizeUnitCode,
          },
        };
      },
      destroy: ({ dataSet, data }) => {
        const {
          queryParameter: { commonProps = {} },
        } = dataSet;
        const { organizationId = null, customizeUnitCode = null } = commonProps;

        return {
          url: `${Prefix}/${organizationId}/rfx/suppliers`,
          method: 'DELETE',
          params: customizeUnitCode,
          data,
        };
      },
      submit: ({ dataSet, data }) => {
        const {
          queryParameter: { commonProps = {} },
        } = dataSet;
        const { organizationId, rfxHeaderId, customizeUnitCode = null } = commonProps;

        const newData = data.map((item) => {
          return {
            ...item,
            sourceFrom: 'RFX',
            tenantId: organizationId,
            rfxHeaderId,
          };
        });

        return {
          url: `${Prefix}/${organizationId}/rfx/suppliers`,
          method: 'POST',
          params: {
            rfxHeaderId,
            tenantId: organizationId,
            customizeUnitCode,
          },
          data: newData,
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

export default SupplierListTableDS;
export { SupplierLovDS };
