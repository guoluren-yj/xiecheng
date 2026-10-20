import intl from 'utils/intl';
import { NOT_CHINA_PHONE, PHONE } from 'utils/regExp';
import { Prefix } from '@/utils/globalVariable';

const SupplierListTableDS = (config) => {
  return {
    autoQuery: false,
    selection: false,
    primaryKey: 'rfxLineSupplierId',
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
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.contactMethod').d('联系人及联系方式'),
        name: 'contactMobilephoneContainer',
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
          required({ dataSet, record }) {
            const {
              queryParameter: { headers = {} },
            } = dataSet;
            const { sourceMethod = null } = headers;
            const supplierCompanyId = record.get('supplierCompanyId');
            return supplierCompanyId && sourceMethod === 'INVITE';
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
        width: 100,
        type: 'string',
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
        type: 'string',
        lookupCode: 'HPFM.IDD',
        defaultValue: '+86',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.email`).d('电子邮件'),
        name: 'contactMail',
        width: 100,
        type: 'email',
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
        name: 'addFlag',
        type: 'number',
      },
    ],
    transport: {
      read: ({ dataSet }) => {
        const {
          queryParameter: { commonProps = {} },
        } = dataSet;
        const { organizationId, adjustRecordId, customizeUnitCode = null } = commonProps;
        if (!adjustRecordId || adjustRecordId === 'null') {
          return;
        }
        let url;
        if (config.currentMode === 'preview') {
          url = `${Prefix}/${organizationId}/rfx/suppliers/adjust/preview`;
        } else if (config.currentMode === 'history') {
          url = `${Prefix}/${organizationId}/rfx/suppliers/adjust/before-query`;
        } else {
          url = `${Prefix}/${organizationId}/rfx/suppliers/adjust/after-query`;
        }
        return {
          url,
          method: 'GET',
          data: {
            organizationId,
            adjustRecordId,
            customizeUnitCode,
            rfxHeaderId: config.currentMode === 'preview' ? config.rfxHeaderId : null,
          },
        };
      },
    },
  };
};

export default SupplierListTableDS;
