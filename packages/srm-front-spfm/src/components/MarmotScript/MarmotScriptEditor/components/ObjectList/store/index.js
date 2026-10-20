import intl from 'utils/intl';

function getObjectListDs() {
  return {
    selection: 'multiple',
    pageSize: 50,
    fields: [
      {
        name: 'paramName',
        type: 'string',
        label: intl.get('spfm.adaptorTaskDetail.objectList.store.paramName').d('编码'),
      },
      {
        name: 'paramDescription',
        type: 'string',
        label: intl.get('spfm.adaptorTaskDetail.objectList.store.paramDescription').d('描述'),
      },
    ],
  };
}

function getQueryFormDs() {
  return {
    fields: [
      {
        name: 'description',
        type: 'string',
      },
    ],
  };
}

export { getObjectListDs, getQueryFormDs };
