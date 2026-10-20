export default function getFooterDs(fields) {
  return {
    autoQuery: false,
    primaryKey: 'link',
    cacheSelection: true,
    fields: [
      {
        name: 'richTextObject',
        type: 'object',
      },
      ...fields,
    ],
  };
}
