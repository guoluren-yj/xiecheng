import { SRM_SPUC } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
import moment from 'moment';

import { getHeaderAttachmentUuid } from '@/services/deliveryCreationService';

const organizationId = getCurrentOrganizationId();
// 发货信息
const headerFormDataSet = () => ({
  dataToJSON: 'dirty-field',
  paging: false,
  forceValidate: true,
  fields: [
    {
      name: 'asnNum',
      type: 'string',
      label: intl.get(`sinv.common.model.common.asnNum`).d('送货单号'),
    },
    {
      name: 'asnTypeCodeMeaning',
      type: 'string',
      label: intl.get(`sinv.common.model.common.asnTypeCode`).d('送货单类型'),
    },
    {
      name: 'supplierCompanyName',
      type: 'string',
      label: intl.get(`entity.supplier.tag`).d('供应商'),
    },
    {
      name: 'immedShippedFlag',
      type: 'number',
      label: intl.get(`sinv.common.model.common.immedShippedFlag`).d('是否直发'),
    },
    {
      name: 'supplierSiteName',
      type: 'string',
      label: intl.get(`sinv.common.model.common.shipAddress`).d('发货地点'),
    },
    {
      name: 'shipDate',
      type: 'date',
      label: intl.get(`sinv.common.model.common.shipDate`).d('发货日期'),
      required: true,
      max: 'expectedArriveDate',
    },
    {
      name: 'expectedArriveDate',
      type: 'date',
      label: intl.get(`sinv.common.model.common.expectedArriveTime`).d('预计到货时间'),
      required: true,
      min: 'shipDate',
    },
    {
      name: 'totalQuantity',
      type: 'number',
      label: intl.get(`sinv.common.model.common.shipmentsTotalQuantity`).d('发货总数'),
    },
    {
      name: 'transportType',
      type: 'string',
      label: intl.get(`sinv.common.model.common.transportType`).d('运输类型'),
      lookupCode: 'SINV.ASN_TRANSPORT_TYPE',
    },
    {
      name: 'taxIncludedAmount',
      type: 'number',
      label: intl.get(`sinv.common.model.common.taxIncludedAmount`).d('汇总金额'),
    },
    {
      name: 'remark',
      type: 'string',
      label: intl.get(`sinv.common.model.common.remark`).d('备注'),
    },
  ],
  transport: {
    read: ({ data }) => {
      const { asnHeaderId, ...other } = data.params || {};
      return {
        url: `${SRM_SPUC}/v1/${organizationId}/asn-header/${asnHeaderId}`,
        method: 'GET',
        data: other,
      };
    },
  },
  events: {
    load: ({ dataSet }) => {
      dataSet.forEach((record) => {
        // 给发货日期设置默认值，如果发货日期没有，就默认当天
        if (!record.get('shipDate')) {
          record.set('shipDate', moment().format('YYYY-MM-DD'));
        }
      });
    },
  },
});

// 收货信息
const shipmentFormDataSet = () => ({
  dataToJSON: 'dirty-field',
  paging: false,
  forceValidate: true,
  fields: [
    {
      name: 'companyName',
      type: 'string',
      label: intl.get(`entity.customer.tag`).d('客户'),
    },
    {
      name: 'organizationName',
      type: 'string',
      label: intl.get(`sinv.common.model.common.organizationName`).d('收货组织'),
    },
    {
      name: 'shipToLocationAddress',
      type: 'string',
      label: intl.get(`sinv.common.model.common.shipToLocationAddress`).d('收货地点'),
    },
    {
      name: 'actualReceiverName',
      type: 'string',
      label: intl.get(`sinv.common.model.common.actualReceiverName`).d('送达方'),
    },
    {
      name: 'contactInfo',
      type: 'string',
      label: intl.get(`sinv.common.model.common.contactor`).d('联系人'),
    },
  ],
  // transport: {
  //   read: ({ data }) => {
  //     const { asnHeaderId, customizeUnitCode, ...other } = data.params || {};
  //     return {
  //       url: `${SRM_SPUC}/v1/${organizationId}/asn-header/${asnHeaderId}`,
  //       method: 'GET',
  //       data: other,
  //     };
  //   },
  // },
});

const logisticsFormDataSet = () => ({
  dataToJSON: 'dirty-field',
  paging: false,
  forceValidate: true,
  fields: [
    {
      name: 'logisticsCompany',
      type: 'object',
      label: intl.get(`sinv.common.model.common.logisticsCompany`).d('物流公司'),
      lovCode: 'SINV.ASN_SHIPPER_NAME',
      textField: 'logisticsCompanyMeaning',
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
              logisticsCompany: object?.logisticsCompany,
            }
          : null,
    },
    {
      name: 'logisticsStaff',
      type: 'string',
      label: intl.get(`sinv.common.model.common.logisticsStaff`).d('配送人员'),
    },
    {
      name: 'shipToLocationAddress',
      type: 'string',
      label: intl.get(`sinv.common.model.common.logisticsContactInfo`).d('联系方式'),
    },
    {
      name: 'logisticsCost',
      type: 'string',
      label: intl.get(`sinv.common.model.common.logisticsCost`).d('物流费用'),
    },
    {
      name: 'expressNum',
      type: 'string',
      label: intl.get(`sinv.common.model.common.expressNum`).d('快递单号'),
    },
    {
      name: 'logisticsPhoneNum',
      type: 'string',
      label: intl.get(`sinv.common.model.common.logisticsPhoneNum`).d('收件人手机号'),
      dynamicProps: {
        required: ({ record, dataSet }) => {
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
    },
  ],
});

// 附件信息
const attachmentDataSet = (headerFormDs) => ({
  dataToJSON: 'dirty-field',
  paging: false,
  autoQuery: false,
  autoCreate: true,
  forceValidate: true,
  fields: [
    // {
    //   name: 'approveAttachmentUuid',
    //   type: 'string',
    //   label: intl.get(`sinv.common.purchasersAuditAttachment`).d('采购方审核附件'),
    // },
    // {
    //   name: 'reviewAttachmentUuid',
    //   type: 'string',
    //   label: intl.get(`sinv.common.view.purchaserReviewAttachment`).d('采购方复核附件'),
    // },
    {
      name: 'otherAttachmentUuid',
      type: 'string',
      label: intl.get(`sinv.common.view.otherAttachment`).d('采购方其他附件'),
    },
    {
      name: 'supplierAttachmentUuid',
      type: 'string',
      label: intl.get(`sinv.common.view.supplierAttachment`).d('供应商附件'),
    },
  ],
  events: {
    update: ({ record, name, value }) => {
      const headerRecord = headerFormDs.current;
      if (name === 'supplierAttachmentUuid') {
        if (record.get('asnHeaderId')) {
          const data = {
            asnHeaderId: record.get('asnHeaderId'),
            objectVersionNumber: record.get('objectVersionNumber'),
            _token: record.get('_token'),
            otherAttachmentUuid: record.get('otherAttachmentUuid'),
            approveAttachmentUuid: record.get('approveAttachmentUuid'),
            supplierAttachmentUuid: value,
            reviewAttachmentUuid: record.get('reviewAttachmentUuid'),
          };
          getHeaderAttachmentUuid(data).then((res) => {
            if (res && !res.failed) {
              headerRecord.init({
                supplierAttachmentUuid: res.supplierAttachmentUuid,
                objectVersionNumber: res.objectVersionNumber,
              });
            }
          });
        }
      }
    },
  },
});

export { headerFormDataSet, shipmentFormDataSet, logisticsFormDataSet, attachmentDataSet };
