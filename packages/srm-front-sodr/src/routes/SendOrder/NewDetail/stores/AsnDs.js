import intl from 'utils/intl';
import { SRM_SPUC, SRM_SLOD } from '_utils/config';
import { BUCKET_NAME } from '@/routes/components/utils/constant';

const modelPrompt = 'sodr.sendOrder.model.common';

export default ({ organizationId }) => {
  return {
    paging: false,
    cascadeParams(parentRecord) {
      return parentRecord.get(['poLineLocationId', 'deliveryStrategyId']);
    },
    transport: {
      read: ({ data: { poLineLocationId, deliveryStrategyId } }) => ({
        url: deliveryStrategyId
          ? `${SRM_SLOD}/v1/${organizationId}/delivery/asn/link-line/po/${poLineLocationId}`
          : `${SRM_SPUC}/v1/${organizationId}/asn-lines/${poLineLocationId}/es-asn-lines`,
        method: 'GET',
        data: null,
        transformResponse: (data) => {
          let formatData = [];
          try {
            formatData = JSON.parse(data);
          } catch {
            formatData = data;
          }
          return formatData?.asnDetailLineVOS || formatData;
        },
      }),
    },
    fields: [
      {
        name: 'asnNum',
        label: intl.get(`${modelPrompt}.asnNum`).d('送货单号'),
      },
      {
        name: 'displayAsnLineNum',
        label: intl.get(`${modelPrompt}.lineNum`).d('行号'),
      },
      {
        name: 'shipQuantity',
        type: 'number',
        label: intl.get(`${modelPrompt}.shipQuantity`).d('发运数量'),
      },
      {
        name: 'uomName',
        label: intl.get(`${modelPrompt}.uomName`).d('单位'),
      },
      {
        name: 'shipDate',
        type: 'date',
        label: intl.get(`${modelPrompt}.shipDate`).d('发货日期'),
      },
      {
        name: 'asnStatusMeaning',
        label: intl.get(`hzero.common.status`).d('状态'),
      },
      {
        name: 'approveAttachmentUuid',
        type: 'attachment',
        label: intl.get(`sodr.common.view.purchaserAuditAttachment`).d('采购方附件'),
        bucketName: BUCKET_NAME,
        bucketDirectory: 'sodr-order',
        readOnly: true,
      },
      {
        name: 'supplierAttaUuid',
        type: 'attachment',
        label: intl.get(`sodr.common.model.common.supplierAttachmentId`).d('供应商附件'),
        bucketName: BUCKET_NAME,
        bucketDirectory: 'sodr-order',
        readOnly: true,
      },
      {
        name: 'reviewAttachmentUuid',
        type: 'attachment',
        label: intl.get(`sodr.common.view.purchaserReviewAttachment`).d('采购方复核附件'),
        bucketName: BUCKET_NAME,
        bucketDirectory: 'sodr-order',
        readOnly: true,
      },
      {
        name: 'supplierAttachmentUuid',
        type: 'attachment',
        label: intl.get(`sodr.common.model.sendOrder.supplierOtherAttachment`).d('供应商其它附件'),
        bucketName: BUCKET_NAME,
        bucketDirectory: 'sodr-order',
        readOnly: true,
      },
      {
        name: 'otherAttachmentUuid',
        type: 'attachment',
        label: intl.get(`sodr.common.view.purchaserOtherAttachment`).d('采购方其它附件'),
        bucketName: BUCKET_NAME,
        bucketDirectory: 'sodr-order',
        readOnly: true,
      },
    ],
  };
};
