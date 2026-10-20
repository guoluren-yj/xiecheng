import { getConfig } from 'choerodon-ui';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';

import { HZERO_HMDE } from '@/utils/config';
import { lowcodeOrganizationURL } from '@/utils/common';

export default () =>
  ({
    paging: false,
    selection: false,
    fields: [
      { name: 'code', type: 'string', label: '角色编码' },
      { name: 'name', type: 'string', label: '角色名称' },
      {
        name: 'description',
        type: 'string',
        label:
          '数据表建模用于管理组织下的数据库模型，可以在这里查看系统内置的数据表，并为这些表维护扩展字段。',
      },
      { name: 'serviceCode', type: 'string', label: '数据库' },
      { name: 'tenantFlag', type: 'boolean', label: '模型可见' },
    ],
    transport: {
      read: () => ({
        url: `${lowcodeOrganizationURL({ route: HZERO_HMDE })}/tables`,
        method: 'get',
        transformResponse(response) {
          if (typeof response === 'string') {
            const serviceMap = {};
            let ret = JSON.parse(response);
            ret = { content: ret };
            const dataKey = getConfig('dataKey');
            if (ret[dataKey]) {
              // eslint-disable-next-line no-unused-expressions
              ret[dataKey]?.forEach?.((item) => {
                if (serviceMap[item.serviceCode] === undefined) {
                  serviceMap[item.serviceCode] = {
                    id: item.serviceCode,
                    // key: ``
                    serviceCode: item.serviceCode,
                    children: [item],
                  };
                } else {
                  serviceMap[item.serviceCode].children.push(item);
                }
              });
              const dbMap = {};
              Object.keys(serviceMap).forEach((key) => {
                serviceMap[key].children.forEach((ele) => {
                  const dbName = `${serviceMap[key].serviceCode}?${ele.schemaName}`;
                  if (dbMap[dbName] === undefined) {
                    dbMap[dbName] = {
                      serviceCode: serviceMap[key].serviceCode,
                      id: ele.schemaName,
                      schemaName: ele.schemaName,
                      dataSourceType: ele.dataSourceType,
                      children: [ele],
                    };
                  } else {
                    dbMap[dbName].children.push(ele);
                  }
                });
                serviceMap[key].children = [];
              });
              Object.keys(serviceMap).forEach((servicekey) => {
                Object.keys(dbMap).forEach((dbkey) => {
                  if (dbMap[dbkey].serviceCode === serviceMap[servicekey].serviceCode) {
                    serviceMap[servicekey].children.push(dbMap[dbkey]);
                  }
                });
              });
              ret[dataKey] = Object.keys(serviceMap).map((v) => ({
                dataSourceId: v,
                ...serviceMap[v],
              }));
              return ret;
            }
          }
        },
      }),
    },
  } as DataSetProps);
