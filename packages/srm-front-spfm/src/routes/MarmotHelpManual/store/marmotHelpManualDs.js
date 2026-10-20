function getDocFlowPermissionDs() {
  return {
    autoQuery: true,
    selection: false,
    parentField: 'parentCode',
    idField: 'code',
    expandField: 'expand',
    fields: [
      { name: 'parentCode', type: 'string' },
      { name: 'code', type: 'string' },
      { name: 'docKey', type: 'string' },
    ],
    transport: {
      read: {
        url: `/ssc/v1/document`,
        method: 'GET',
      },
    },
  };
}

function getQueryFormDs() {
  return {
    autoQuery: false,
    selection: false,
    fields: [{ name: 'searchContent', type: 'string' }],
  };
}

export { getDocFlowPermissionDs, getQueryFormDs };
