import { getHeaderAttachmentUuid } from '@/services/deliveryCreationService';
import { SRM_SPUC, PRIVATE_BUCKET } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
import moment from 'moment';

const organizationId = getCurrentOrganizationId();

// 发货信息/收货信息/物流信息/附件信息
const headInfoDataSet = () => ({
  dataToJSON: 'all',
  paging: false,
  forceValidate: true,
  fields: [
    // 发货字段
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
      max: 'expectedArriveDate',
    },
    {
      name: 'expectedArriveDate',
      type: 'date',
      label: intl.get(`sinv.common.model.common.expectedArriveTime`).d('预计到货时间'),
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
      name: 'remark',
      type: 'string',
      label: intl.get(`sinv.common.model.common.remark`).d('备注'),
    },
    {
      name: 'buyerRemark',
      type: 'string',
      label: intl.get('hzero.common.buyerRemark').d('采购方备注'),
    },
    // 收货字段
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
      name: 'erpAsnNum',
      type: 'string',
      label: intl.get(`sinv.common.model.common.erpAsnNum`).d('内向交货单'),
    },
    {
      name: 'contactInfo',
      type: 'string',
      label: intl.get(`sinv.common.model.common.contactor`).d('联系人'),
    },
    // 物流字段
    // {
    //   name: 'logisticsCompany',
    //   type: 'object',
    //   label: intl.get(`sinv.common.model.common.logisticsCompany`).d('物流公司'),
    //   lovCode: 'SINV.ASN_SHIPPER_NAME',
    //   textField: 'logisticsCompanyMeaning',
    //   dynamicProps: {
    //     lovPara() {
    //       return {
    //         tenantId: organizationId,
    //       };
    //     },
    //   },
    //   transformRequest: (value) => value && value.value,
    //   transformResponse: (value, object) =>
    //     object?.logisticsCompany
    //       ? {
    //           ...object,
    //           logisticsCompany: object?.logisticsCompany,
    //           logisticsCompanyMeaning: object?.logisticsCompanyMeaning,
    //         }
    //       : null,
    // },
    {
      name: 'logisticsCompany',
      type: 'string',
      label: intl.get(`sinv.common.model.common.logisticsCompany`).d('物流公司'),
    },
    {
      name: 'logisticsCompanyMeaning',
      type: 'string',
      label: intl.get(`sinv.common.model.common.logisticsCompanyMeaning`).d('物流公司描述'),
    },
    {
      name: 'logisticsStaff',
      type: 'string',
      label: intl.get(`sinv.common.model.common.logisticsStaff`).d('配送人员'),
    },
    {
      name: 'logisticsContactInfo',
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
        required: ({ record }) =>
          record?.get('logisticsCompany') === 'SF' ||
          record?.get('logisticsCompany')?.value === 'SF',
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
    // 附件字段
    {
      name: 'approveAttachmentUuid',
      type: 'attachment',
      bucketName: PRIVATE_BUCKET,
      label: intl.get(`sinv.common.view.purchaserAuditAttachment`).d('采购方审核附件'),
    },
    {
      name: 'supplierAttachmentUuid',
      type: 'attachment',
      bucketName: PRIVATE_BUCKET,
      label: intl.get(`sinv.common.view.supplierAttachmentUuid`).d('供应商附件'),
    },
    {
      name: 'reviewAttachmentUuid',
      type: 'attachment',
      bucketName: PRIVATE_BUCKET,
      label: intl.get(`sinv.common.view.reviewAttachmentUuid`).d('采购方复核附件'),
    },
    {
      name: 'supplierAttaUuid',
      type: 'attachment',
      bucketName: PRIVATE_BUCKET,
      label: intl.get(`sinv.common.view.supplierAttaUuid`).d('供应商其他附件'),
    },
    {
      name: 'otherAttachmentUuid',
      type: 'attachment',
      bucketName: PRIVATE_BUCKET,
      label: intl.get(`sinv.common.view.otherAttachmentUuid`).d('采购方其他附件'),
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
    update: ({ record, name, value }) => {
      const headerRecord = record.current;
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

export default headInfoDataSet;
