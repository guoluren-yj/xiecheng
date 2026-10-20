import { SRM_SPUC } from '_utils/config';
import intl from 'utils/intl';
import { MAX_QUAN_NUMBER } from '@/routes/components/utils/constant';

// 设置sodr国际化前缀 - common - model
const modelPrompt = 'sodr.sendOrder.model.common';

export default ({
  organizationId,
  poHeaderId,
  // itemCode, itemName,
  poLineId,
  poLineLocationId,
}) => {
  return {
    autoQuery: true,
    transport: {
      read: {
        url: `${SRM_SPUC}/v1/${organizationId}/po-item-boms`,
        method: 'GET',
        data: {
          poHeaderId,
          poLineId,
          poLineLocationId,
          // itemCode,
          // itemName,
          customizeUnitCode: 'SODR.SEND_ORDER_DETAIL.BOM_MODAL',
        },
      },
    },
    fields: [
      {
        name: 'orderSeq',
        label: intl.get(`${modelPrompt}.serialNum`).d('序号'),
      },
      {
        name: 'itemCode',
        label: intl.get(`entity.item.code`).d('物料编码'),
      },
      {
        name: 'itemName',
        label: intl.get(`entity.item.name`).d('物料名称'),
      },
      {
        name: 'categoryName',
        label: intl.get(`entity.item.type`).d('物料类型'),
      },
      {
        name: 'quantity',
        type: 'number',
        max: MAX_QUAN_NUMBER,
        label: intl.get(`sodr.common.model.common.needQuantity`).d('需求数量'),
      },
      {
        name: 'uomName',
        label: intl.get(`${modelPrompt}.uomName`).d('单位'),
      },
      {
        name: 'invOrganizationName',
        type: 'number',
        label: intl.get(`sodr.common.model.common.organizationName`).d('收货组织'),
      },
      {
        name: 'needByDate',
        type: 'date',
        label: intl.get(`${modelPrompt}.needByDate`).d('需求日期'),
      },
    ],
  };
};
