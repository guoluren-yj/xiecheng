import intl from 'utils/intl';
import { Prefix } from '@/utils/globalVariable';

const TableDS = (config = {}) => {
  const { readOnly = false } = config || {};
  return {
    primaryKey: 'dataId',
    selection: readOnly ? false : 'multiple',
    catchSelection: true,
    autoQuery: false,
    cacheSelection: true,
    pageSize: 20,
    fields: [
      {
        name: 'dataName',
        type: 'string',
      },
      {
        name: 'dataCode',
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.dataCode').d('编码'),
        type: 'string',
      },
    ],
    events: {
      load: ({ dataSet }) => {
        dataSet.forEach((record) => {
          if (record.data.checkedFlag === 1) {
            dataSet.select(record);
          }
        });
      },
    },
    transport: {
      read: ({ dataSet }) => {
        const {
          queryParameter: { commonProps = {} },
        } = dataSet;
        const { organizationId, sourceAppScopeId, ...others } = commonProps;

        return {
          url: `${Prefix}/${organizationId}/source-app-scopes/${sourceAppScopeId}/line`,
          method: 'GET',
          data: others,
        };
      },
    },
  };
};

// 适应范围勾选的行
const SelectedTableDS = (config = {}) => {
  const { readOnly = false } = config || {};
  return {
    primaryKey: 'dataId',
    selection: readOnly ? false : 'multiple',
    autoQuery: false,
    paging: false,
    fields: [
      {
        name: 'dataName',
        type: 'string',
      },
      {
        name: 'dataCode',
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.dataCode').d('编码'),
        type: 'string',
      },
    ],
    events: {
      load: ({ dataSet }) => {
        dataSet.forEach((record) => {
          dataSet.select(record);
        });
      },
    },
    transport: {
      read: ({ dataSet }) => {
        const {
          queryParameter: { commonProps = {} },
        } = dataSet;
        const { organizationId, sourceAppScopeId, ...others } = commonProps;

        return {
          url: `${Prefix}/${organizationId}/source-app-scope-lines/${sourceAppScopeId}/exists/line`,
          method: 'GET',
          data: others,
        };
      },
    },
  };
};

const QueryTableDS = () => {
  return {
    autoQuery: false,
    name: 'user',
    pageSize: 1,
    fields: [],
  };
};

export { TableDS, QueryTableDS, SelectedTableDS };
