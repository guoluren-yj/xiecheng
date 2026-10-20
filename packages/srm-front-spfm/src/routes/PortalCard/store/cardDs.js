import intl from 'utils/intl';
import { SRM_PLATFORM } from '_utils/config';

export default function getCardDs() {
  return {
    // autoQuery: true,
    primaryKey: 'cardId',
    cacheSelection: true,
    pageSize: 10,
    fields: [
      {
        name: 'cardId',
        type: 'string',
      },
      {
        name: 'cardName',
        type: 'intl',
        label: intl.get('hptl.portalAssign.model.portalAssign.cardName').d('卡片名称'),
        required: true,
      },
      {
        name: 'cardCode',
        type: 'string',
        label: intl.get('hptl.portalAssign.model.portalAssign.cardCode').d('卡片编码'),
        required: true,
      },
      {
        name: 'description',
        type: 'intl',
        label: intl.get('hptl.portalAssign.model.portalAssign.cardDesc').d('卡片描述'),
      },
      {
        name: 'cardTypeObject',
        type: 'object',
        lookupCode: 'SPFM.LAYOUT.CARD.TYPE',
        textField: 'meaning',
        valueField: 'orderSeq',
        label: intl.get('hptl.portalAssign.model.portalAssign.cardType').d('卡片类型'),
        required: true,
      },
      {
        name: 'cardTypeMeaning',
        type: 'string',
        bind: 'cardTypeObject.meaning',
        label: intl.get('hptl.portalAssign.model.portalAssign.cardType').d('卡片类型'),
      },
      {
        name: 'cardType',
        type: 'number',
        bind: 'cardTypeObject.orderSeq',
      },
      {
        name: 'defaultHeigth',
        type: 'number',
        label: intl.get('hptl.portalAssign.model.portalAssign.heigth').d('高度'),
        required: true,
      },
      {
        name: 'defaultWidth',
        type: 'number',
        label: intl.get('hptl.portalAssign.model.portalAssign.width').d('宽度'),
        required: true,
      },
      {
        name: 'enabledFlag',
        type: 'boolean',
        label: intl.get('hzero.common.status.enable').d('启用'),
        trueValue: 1,
        falseValue: 0,
        defaultValue: 1,
      },
      {
        name: 'cardLevel',
        type: 'boolean',
        label: intl.get('hptl.portalAssign.model.portalAssign.tenant.card').d('租户级卡片'),
        trueValue: 1,
        falseValue: 0,
        defaultValue: 0,
      },
      {
        name: 'action',
        type: 'string',
        label: intl.get(`hzero.common.table.column.option`).d('操作'),
      },
    ],
    transport: {
      read: ({ data }) => {
        return {
          url: `${SRM_PLATFORM}/v1/layout-card`,
          method: 'get',
          // data,
          data: {
            ...data,
            customizeUnitCode: 'PORTAL.LAYOUT_CARD.SEARCH_BAR', // 筛选器个性化单元编码
          },
        };
      },
      create: ({ data }) => {
        return {
          url: `${SRM_PLATFORM}/v1/layout-card`,
          method: 'post',
          data: data[0],
        };
      },
      update: ({ data }) => {
        return {
          url: `${SRM_PLATFORM}/v1/layout-card`,
          method: 'put',
          data: data[0],
        };
      },
    },
  };
}
