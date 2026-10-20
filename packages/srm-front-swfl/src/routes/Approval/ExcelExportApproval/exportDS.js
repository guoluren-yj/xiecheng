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
      read: ({ dataSet }) => {
        const { requestUrl, method, unMergeRequestUrl } = props;
        return {
          url: dataSet.getState('merge') === '0' ? unMergeRequestUrl : requestUrl,
          method,
        };
      },
    },
  };
}

function getQueryDs() {
  return {
    autoQuery: false,
    autoCreate: true,
    fields: [
      {
        name: 'fileName',
        label: intl.get(`hzero.common.components.export.file`).d('自定义文件名'),
        type: 'string',
      },
      {
        name: 'merge',
        label: intl.get(`hwfp.common.components.export.merge`).d('是否合并'),
        type: 'string',
        defaultValue: '1',
        lookupCode: 'HPFM.FLAG',
      },
    ],
  };
}

export { getExportDs, getQueryDs };
