import intl from 'utils/intl';
import { SRM_FINANCE } from '_utils/config';
import { BUCKET_NAME, MAX_QUAN_NUMBER } from '@/routes/components/utils/constant';

const modelPrompt = 'sodr.sendOrder.model.common';

export default ({ organizationId, associatedConfigFlag }) => {
  return {
    paging: false,
    cascadeParams(parentRecord) {
      return parentRecord.get(['poLineLocationId', 'displayLineNum']);
    },
    transport: {
      read: ({ data: { poLineLocationId, displayLineNum, displayPoNum } }) =>
        associatedConfigFlag
          ? {
              url: `/ssta/v1/${organizationId}/settle-lines/purchaser`,
              method: 'GET',
              params: {
                size: 0,
                poNumEquals: displayPoNum,
                poLineNum: displayLineNum,
              },
              data: null,
            }
          : {
              url: `${SRM_FINANCE}/v1/${organizationId}/invoice-line/po-line-location/${poLineLocationId}`,
              method: 'GET',
              data: null,
            },
    },
    fields: [
      {
        name: associatedConfigFlag ? 'settleHeaderNum' : 'invoiceNum',
        label: intl.get(`${modelPrompt}.invoiceNumOnline`).d('网上发票号'),
      },
      {
        name: associatedConfigFlag ? 'lineNum' : 'invoiceLineNum',
        label: intl.get(`${modelPrompt}.lineNum`).d('行号'),
      },
      {
        name: 'quantity',
        type: 'number',
        max: MAX_QUAN_NUMBER,
        label: intl.get(`${modelPrompt}.quantity`).d('数量'),
      },
      {
        name: associatedConfigFlag ? 'uom' : 'uomName',
        label: intl.get(`${modelPrompt}.uomName`).d('单位'),
      },
      {
        name: 'syncDate',
        type: 'date',
        label: intl.get(`${modelPrompt}.importDate`).d('导入日期'),
      },
      {
        name: associatedConfigFlag ? 'settleStatusMeaning' : 'invoiceStatusMeaning',
        label: intl.get(`hzero.common.status`).d('状态'),
      },
      {
        name: 'supplierRemark',
        label: intl.get(`${modelPrompt}.supplierRemark`).d('供应商备注'),
      },
      {
        name: 'netReceivedQuantity',
        type: 'number',
        max: MAX_QUAN_NUMBER,
        label: intl.get(`${modelPrompt}.netReceivedQuantitys`).d('净接收数量'),
      },
      {
        name: 'sendingQuantity',
        type: 'number',
        label: intl.get(`${modelPrompt}.sendingQuantity`).d('送货中数量'),
      },
      {
        name: 'attachmentUuid',
        type: 'attachment',
        label: intl.get('entity.attachment.tag').d('附件'),
        bucketName: BUCKET_NAME,
        bucketDirectory: 'sodr-order',
        readOnly: true,
      },
    ],
  };
};
