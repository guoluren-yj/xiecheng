import intl from 'utils/intl';

function getExportDs(props = {}) {
  return {
    id: 'id',
    autoQuery: false,
    idField: 'id',
    parentField: 'parentId',
    checkField: 'checked',
    selection: false,
    expandField: 'expand',
    fields: [
      {
        name: 'title',
        type: 'string',
      },
      {
        name: 'id',
        type: 'number',
      },
      {
        name: 'expand',
        type: 'boolean',
        transformResponse: () => {
          return true;
        },
      },
      {
        name: 'checked',
        type: 'boolean',
        transformResponse: () => {
          return true;
        },
      },
    ],
    transport: {
      read: () => {
        const { requestUrl, method } = props;
        return {
          url: requestUrl,
          method,
        };
      },
    },
  };
}

function getQueryDs() {
  return {
    autoQuery: false,
    fields: [
      {
        name: 'fileName',
        label: intl.get(`hzero.common.components.export.file`).d('自定义文件名'),
        type: 'string',
      },
    ],
  };
}

export { getExportDs, getQueryDs };
