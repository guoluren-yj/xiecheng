import intl from 'utils/intl';
import { SRM_FINANCE } from '_utils/config';
import { BUCKET_NAME, MAX_QUAN_NUMBER } from '@/routes/components/utils/constant';

const modelPrompt = 'sodr.sendOrder.model.common';

export default ({ organizationId, associatedConfigFlag }) => {
  return {
    paging: false,
    pageSize: 0, // paging为false，pageSize默认20限制查询
    cascadeParams(parentRecord) {
      return parentRecord.get(['poLineLocationId', 'displayLineNum']);
    },
    transport: {
      read: ({ data: { poLineLocationId, displayLineNum, displayPoNum } }) =>
        associatedConfigFlag
          ? {
              url: `/ssta/v1/${organizationId}/bill-lines/purchaser`,
              method: 'GET',
              params: {
                size: 0,
                poNumEquals: displayPoNum,
                poLineNum: displayLineNum,
              },
              data: null,
            }
          : {
              url: `${SRM_FINANCE}/v1/${organizationId}/bill-lines/remote/po-line-location/detail/${poLineLocationId}`,
              method: 'GET',
              data: null,
            },
    },
    fields: [
      {
        name: 'billNum',
        label: intl.get(`${modelPrompt}.checkBillNum`).d('对账单号'),
      },
      {
        name: associatedConfigFlag ? 'lineNum' : 'billLineNum',
        label: intl.get(`${modelPrompt}.lineNum`).d('行号'),
      },
      {
        name: associatedConfigFlag ? 'sourceSettleNumAndLineNum' : 'trxAndLineNum',
        label: intl.get(`sodr.common.model.common.trxAndLineNum`).d('事务号-行号'),
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
        name: associatedConfigFlag ? 'confirmDate' : 'approvedDate',
        type: 'date',
        label: intl.get(`${modelPrompt}.confirmedDate`).d('确认日期'),
      },
      {
        name: 'billStatusMeaning',
        label: intl.get(`hzero.common.status`).d('状态'),
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
