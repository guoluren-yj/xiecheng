import intl from 'utils/intl';

export default function getAddCardDs() {
  return {
    // autoCreate: true,
    fields: [
      {
        name: 'title',
        type: 'intl',
        label: intl.get('hptl.portalAssign.model.protalConfig.cardTitle').d('卡片标题'),
      },
      {
        name: 'content',
        type: 'object',
        required: true,
        trim: 'none',
      },
      {
        name: 'type',
        type: 'string',
        label: intl.get('hptl.portalAssign.model.protalConfig.cardContentType').d('卡片内容类型'),
        defaultValue: 'richText',
      },
    ],
    events: {
      update: ({ record, name }) => {
        if (name === 'type') {
          record.init('content', undefined);
        }
      },
    },
  };
}
