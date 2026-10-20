import intl from 'utils/intl';
import { SRM_SPUC } from '_utils/config';
import { MAX_QUAN_NUMBER } from '@/routes/components/utils/constant';

const modelPrompt = 'sodr.sendOrder.model.common';

export default ({ organizationId }) => {
  return {
    paging: false,
    transport: {
      read: ({ data }) => ({
        url: `${SRM_SPUC}/v1/${organizationId}/plans/from-supplier/poLineLocationId`,
        method: 'GET',
        params: {
          poLineLocationId: data.poLineLocationId,
          customizeUnitCode: 'SODR.SEND_ORDER_DETAIL.DOCRELATE_DSC',
        },
        data: null,
      }),
    },
    fields: [
      {
        name: 'displayPoNum',
        label: intl.get(`${modelPrompt}.displayPoNum.line`).d('订单号/行号'),
      },
      {
        name: 'planStatusMeaning',
        label: intl.get(`${modelPrompt}.planStatusMeaning`).d('状态'),
      },
      {
        name: 'planQuantity',
        type: 'number',
        label: intl.get(`${modelPrompt}.planQuantity`).d('本次计划数量'),
      },
      {
        name: 'planDate',
        type: 'date',
        label: intl.get(`${modelPrompt}.planDate`).d('本次计划到货日期'),
      },
      {
        name: 'purchaserRemark',
        label: intl.get(`${modelPrompt}.purchaserRemark`).d('采购方行备注'),
      },
      {
        name: 'supplierConfirmQuantity',
        type: 'number',
        label: intl.get(`${modelPrompt}.supplierConfirmQuantity`).d('供应方确认数量'),
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
    ],
  };
};
