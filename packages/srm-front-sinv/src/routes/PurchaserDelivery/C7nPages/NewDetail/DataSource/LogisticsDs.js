// import { SRM_SPUC } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import { NOT_CHINA_PHONE, PHONE } from 'utils/regExp';
import intl from 'utils/intl';

const organizationId = getCurrentOrganizationId();

const logisticsDataSet = () => ({
  dataToJSON: 'all',
  paging: false,
  modifiedCheck: false,
  forceValidate: true,
  fields: [
    // 物流字段
    {
      name: 'logisticsCompany',
      type: 'object',
      label: intl.get(`sinv.common.model.common.logisticsCompany`).d('物流公司'),
      lovCode: 'SINV.ASN_SHIPPER_NAME',
      // textField: 'logisticsCompanyMeaning',
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
      name: 'logisticsStaff',
      type: 'string',
      label: intl.get(`sinv.common.model.common.logisticsStaff`).d('配送人员'),
      maxLength: 240,
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
      name: 'carNumber',
      type: 'string',
      label: intl.get(`sinv.common.model.common.carNumber`).d('车牌号'),
      maxLength: 20,
      trim: 'both',
    },
    {
      name: 'logisticsReceiptStatus',
      type: 'string',
      lookupCode: 'SINV.ASN_LOGISTICS_STATUS',
      label: intl.get(`sinv.common.model.common.logisticsReceiptStatus`).d('物流签收状态'),
    },
  ],
  events: {
    load: ({ dataSet }) => {
      dataSet.forEach((i) => {
        Object.assign(i, { status: 'update' });
      });
    },
  },
  // transport: {
  //   read: ({ data }) => {
  //     const { asnHeaderId, ...other } = data.params || {};
  //     return {
  //       url: `${SRM_SPUC}/v1/${organizationId}/asn-header/${asnHeaderId}/logistics/details`,
  //       method: 'GET',
  //       data: other,
  //     };
  //   },
  // },
});

export default logisticsDataSet;
