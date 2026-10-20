import intl from 'utils/intl';
import { NOT_CHINA_PHONE, PHONE } from 'utils/regExp';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const logisticsDataSet = () => ({
  forceValidate: true,
  dataToJSON: 'all',
  fields: [
    {
      name: 'logisticsCompany',
      type: 'object',
      label: intl.get(`sinv.common.model.common.logisticsCompany`).d('物流公司'),
      lovCode: 'SINV.ASN_SHIPPER_NAME',
      dynamicProps: {
        lovPara() {
          return {
            tenantId: organizationId,
          };
        },
      },
      transformRequest: (value) => value && value.value,
      transformResponse: (value, object) =>
        object?.logisticsCompany
          ? {
              ...object,
              logisticsCompany: object.logisticsCompany,
              logisticsCompanyMeaning: object.logisticsCompanyMeaning,
              meaning: object.logisticsCompanyMeaning,
              value: object.logisticsCompany,
            }
          : null,
    },
    {
      name: 'logisticsContactInfo',
      type: 'string',
      label: intl.get(`sinv.common.model.common.logisticsContactInfo`).d('联系方式'),
      maxLength: 240,
    },

    {
      name: 'logisticsCost',
      type: 'string',
      label: intl.get(`sinv.common.model.common.logisticsCost`).d('物流费用'),
      maxLength: 240,
    },
    {
      name: 'expressNum',
      type: 'string',
      label: intl.get(`sinv.common.model.common.expressNum`).d('快递单号'),
      maxLength: 150,
    },
    {
      name: 'logisticsPhoneNum',
      type: 'string',
      label: intl.get(`sinv.common.model.common.logisticsPhoneNum`).d('收件人手机号'),
      dynamicProps: {
        required: ({ dataSet, record }) => {
          const configSheetFlag = dataSet.getState('configSheetFlag');
          if (configSheetFlag) {
            return (
              record?.get('logisticsCompany') === 'SF' ||
              record?.get('logisticsCompany')?.value === 'SF'
            );
          }
          return (
            record?.get('logisticsCompany') ||
            record?.get('logisticsCompany')?.value ||
            record?.get('expressNum')
          );
        },
        pattern: ({ record }) =>
          record.get('internationalTelCode') === '+86' ? PHONE : NOT_CHINA_PHONE,
      },
    },
    {
      name: 'internationalTelCode',
      type: 'string',
      lookupCode: 'HPFM.IDD',
      label: intl.get(`sinv.common.model.common.internationalTelCode`).d('区号'),
    },
    {
      name: 'logisticsStaff',
      type: 'string',
      label: intl.get(`sinv.common.model.common.logisticsStaff`).d('配送人员'),
    },
    {
      name: 'carNumber',
      type: 'string',
      label: intl.get(`sinv.common.model.common.carNumber`).d('车牌号'),
      maxLength: 20,
      trim: 'both',
    },
    {
      name: 'logisticsReceiptStatus',
      type: 'object',
      lookupCode: 'SINV.ASN_LOGISTICS_STATUS',
      label: intl.get(`sinv.common.model.common.logisticsReceiptStatus`).d('物流签收状态'),
      transformRequest: (value) => value && value.value,
    },
  ],
  events: {
    load: ({ dataSet }) => {
      dataSet.forEach((i) => {
        Object.assign(i, { status: 'update' });
      });
    },
  },
});

export default logisticsDataSet;
