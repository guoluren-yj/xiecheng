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
      read({ dataSet }) {
        const service = dataSet.getState('serviceKey', service) || 'ssc';
        return {
          url: `/${service}/v1/helper-document`,
          method: 'GET',
        };
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
