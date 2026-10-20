import intl from 'utils/intl';
import { SRM_SPUC } from '_utils/config';
import { BUCKET_NAME, MAX_QUAN_NUMBER } from '@/routes/components/utils/constant';

const modelPrompt = 'sodr.sendOrder.model.common';

export default ({ organizationId }) => {
  return {
    paging: false,
    transport: {
      read: ({ data }) => ({
        url: `${SRM_SPUC}/v1/${organizationId}/rcv-trx-line/po-rcv-records`,
        method: 'POST',
        params: {
          poLineLocationId: data.poLineLocationId,
        },
      }),
    },
    fields: [
      {
        name: 'rcvTrxTypeName',
        label: intl.get(`${modelPrompt}.transactionType`).d('事务类型'),
      },
      {
        name: 'displayTrxNum',
        label: intl.get(`${modelPrompt}.transactionNum`).d('事务编号'),
      },
      {
        name: 'trxLineNum',
        label: intl.get(`${modelPrompt}.lineNum`).d('行号'),
      },
      {
        name: 'quantity',
        type: 'number',
        max: MAX_QUAN_NUMBER,
        label: intl.get(`${modelPrompt}.quantity`).d('数量'),
      },
      {
        name: 'uomName',
        label: intl.get(`${modelPrompt}.uomName`).d('单位'),
      },
      {
        name: 'trxDate',
        type: 'date',
        label: intl.get(`${modelPrompt}.transactionDate`).d('事务日期'),
      },
      {
        name: 'sinvHeaderAttachmentUuid',
        type: 'attachment',
        label: intl.get('entity.attachment.tag').d('附件'),
        bucketName: BUCKET_NAME,
        bucketDirectory: 'sodr-order',
        readOnly: true,
      },
    ],
  };
};
