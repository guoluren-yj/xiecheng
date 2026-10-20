import intl from 'utils/intl';
import { PRIVATE_BUCKET } from '_utils/config';
import { Prefix } from '@/utils/globalVariable';
import { getCurrentOrganizationId } from 'utils/utils';

const closeRfxDS = (rfxHeaderId) => ({
  selection: false,
  autoCreate: true,
  fields: [
    {
      name: 'terminatedRemark',
      type: 'string',
      label: intl.get(`ssrc.inquiryHall.view.message.close.inquiryListReason`).d('关闭理由'),
      required: true,
    },
    {
      name: 'closeAttachmentUuid',
      type: 'attachment',
      label: intl.get(`ssrc.inquiryHall.view.message.close.attachment`).d('关闭附件'),
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: 'ssrc-rfx-rfxheader',
    },
  ],
  transport: {
    submit: ({ data, dataSet }) => {
      const datas = {
        ...dataSet.current.toData(),
        rfxHeaderIds: [rfxHeaderId],
        terminatedRemark: data[0].terminatedRemark,
        closeAttachmentUuid: data[0].closeAttachmentUuid ?? '',
        bidFileExpenseReturnFlag: dataSet.getQueryParameter('bidFileExpenseReturnFlag') || null,
      };

      return {
        url: `${Prefix}/${getCurrentOrganizationId()}/rfx/close`,
        method: 'POST',
        data: datas,
        params: {
          customizeUnitCode: `SSRC.${
            dataSet.getQueryParameter('sourceKey') || 'INQUIRY'
          }_HALL.CLOSE_MODAL.FORM`,
        },
      };
    },
  },
});

export { closeRfxDS };
