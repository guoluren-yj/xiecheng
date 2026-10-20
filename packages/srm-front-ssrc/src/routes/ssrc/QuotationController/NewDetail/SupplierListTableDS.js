import intl from 'utils/intl';
import { EMAIL, NOT_CHINA_PHONE, PHONE } from 'utils/regExp';
import { Prefix } from '@/utils/globalVariable';

const SupplierListTableDS = () => {
  return {
    autoQuery: false,
    // selection: false,
    primaryKey: 'rfxLineSupplierAdjustId',
    dataToJSON: 'all',
    fields: [
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierCode`).d('供应商编码'),
        name: 'supplierLov',
        type: 'object',
        ignore: 'always',
        lovCode: 'SSRC.SUPPLIER',
        textField: 'supplierCompanyNum',
        valueField: 'supplierCompanyId',
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
        name: 'rfxLineSupplierAdjustId',
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
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.priceCoefficient`).d('价格系数'),
        name: 'priceCoefficient',
        type: 'number',
        step: 0.0001,
        min: 0,
        max: 999999999,
        dynamicProps: {
          required({ record }) {
            return record.get('rankRule') === 'WEIGHT_PRICE';
          },
        },
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.riskLevel`).d('风险等级'),
        name: 'riskLevel',
        lookupCode: 'SDAT.WORKBENCH_EVENT_LEVEL',
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
          // required({ record }) {
          //   const supplierCompanyId = record.get('supplierCompanyId');
          //   return supplierCompanyId;
          // },
          lovPara({ dataSet = {}, record }) {
            const {
              queryParameter: { company = {} },
            } = dataSet;
            const { companyId = null } = company;
            const supplierCompanyId = record.get('supplierCompanyId');

            return {
              companyId,
              supplierCompanyId,
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
        name: 'contactMobilephoneContainer',
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.contactMethod').d('联系人及联系方式'),
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.tel`).d('联系电话'),
        name: 'contactMobilephone',
        width: 100,
        type: 'string',
        // required: true,
        dynamicProps: {
          pattern({ record }) {
            const patternFlag =
              (record.get('internationalTelCode') || '+86') === '+86' ? PHONE : NOT_CHINA_PHONE;
            return patternFlag;
          },
        },
      },
      {
        name: 'internationalTelCode',
        // required: true,
        type: 'string',
        lookupCode: 'HPFM.IDD',
        defaultValue: '+86',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.email`).d('电子邮件'),
        name: 'contactMail',
        width: 100,
        validator: (value, _, record) => {
          if (value && !EMAIL.test(record.get('contactMail'))) {
            return intl.get('hzero.common.validation.email').d('邮箱格式不正确');
          }
          return true;
        },
      },
      {
        label: intl.get(`ssrc.inquiryHall.view.message.button.allotItem`).d('分配物料'),
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
        name: 'rfxLineSupplierDTO',
        type: 'object',
      },
      {
        name: 'adjustFields',
        type: 'object',
        defaultValue: [],
      },
      {
        name: 'supplierId',
      },
      {
        name: 'supplierName',
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
        dataSet.query();
      },
      load: ({ dataSet }) => {
        dataSet.forEach((record) => {
          const currentRecord = record || {};
          if (currentRecord?.get('rfxLineSupplierDTO')) {
            currentRecord.selectable = false;
          }
        });
      },
    },
    transport: {
      read: ({ dataSet }) => {
        const {
          queryParameter: { commonProps = {} },
        } = dataSet;
        const { organizationId, adjustRecordId, customizeUnitCode = null } = commonProps;
        if (!adjustRecordId || adjustRecordId === 'null') {
          return;
        }

        return {
          url: `${Prefix}/${organizationId}/rfx/suppliers/adjust/details`,
          method: 'GET',
          data: {
            organizationId,
            adjustRecordId,
            customizeUnitCode,
          },
        };
      },
      submit: ({ data, dataSet }) => {
        const {
          queryParameter: { commonProps = {} },
        } = dataSet;
        const { organizationId, customizeUnitCode = null } = commonProps;
        return {
          url: `${Prefix}/${organizationId}/rfx/suppliers/adjust/save?customizeUnitCode=${customizeUnitCode}`,
          method: 'POST',
          data,
        };
      },
      destroy: ({ dataSet, data }) => {
        const {
          queryParameter: { commonProps = {} },
        } = dataSet;
        const { organizationId } = commonProps;

        return {
          url: `${Prefix}/${organizationId}/rfx/suppliers/adjust/delete`,
          method: 'DELETE',
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

export { SupplierLovDS };

export default SupplierListTableDS;
