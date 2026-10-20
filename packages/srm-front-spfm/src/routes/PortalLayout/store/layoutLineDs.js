import intl from 'utils/intl';
import { SRM_PLATFORM } from '_utils/config';
import { getPlatformVersionApi, isTenantRoleLevel } from 'utils/utils';

const isTenant = isTenantRoleLevel();
const webUrlCode = isTenant ? 'SPFM.CHOOSE.URL.LIST.VIEW.ORG' : 'SPFM.CHOOSE.URL.LIST.VIEW';

export default function layoutLineDs() {
  return {
    pageSize: 20,
    primaryKey: 'assignId',
    cacheSelection: true,
    fields: [
      {
        name: 'index',
        type: 'string',
        label: intl.get('hptl.portalAssign.model.portalAssign.index').d('编号'),
      },
      {
        name: 'webUrlObject',
        type: 'object',
        label: intl.get('hptl.portalAssign.model.portalAssign.webUrl').d('企业门户域名'),
        lovCode: webUrlCode,
        textField: 'webUrl',
        valueFiled: 'assignId',
        required: true,
        lovPara: { enabledFlag: 1 },
        lovQueryAxiosConfig: (lovCode, data, lovPara) => {
          return {
            url: `${SRM_PLATFORM}/v1/${getPlatformVersionApi(
              `portal-layouts/choose-url-list/${lovPara.data.id}?lovCode=${webUrlCode}`
            )}`,
            method: 'GET',
          };
        },
        ignore: 'always',
      },
      {
        name: 'assignId',
        type: 'string',
        bind: 'webUrlObject.assignId',
      },
      {
        name: 'groupName',
        type: 'string',
        bind: 'webUrlObject.groupName',
      },
      {
        name: 'webUrl',
        type: 'string',
        label: intl.get('hptl.portalAssign.model.portalAssign.webUrl').d('企业门户域名'),
        bind: 'webUrlObject.webUrl',
      },
      {
        name: 'action',
        type: 'string',
        label: intl.get(`hzero.common.table.column.option`).d('操作'),
      },
      {
        name: 'oldValue',
        type: 'object',
      },
    ],
    transport: {
      read: ({ data }) => {
        return {
          url: `${SRM_PLATFORM}/v1/${getPlatformVersionApi(`portal-layouts/url-list/${data.id}`)}`,
          method: 'get',
        };
      },
      create: ({ data }) => {
        const params = {
          id: data[0].id,
          urlList: data,
        };
        return {
          url: `${SRM_PLATFORM}/v1/${getPlatformVersionApi(`portal-layouts/distribute`)}`,
          method: 'post',
          data: params,
        };
      },
      destroy: ({ data }) => {
        const params = {
          id: data[0].id,
          urlList: data.map((item) => {
            const res = { ...item, ...item.oldValue };
            delete res.oldValue;
            return res;
          }),
        };
        return {
          url: `${SRM_PLATFORM}/v1/${getPlatformVersionApi(`portal-layouts/distribute`)}`,
          method: 'post',
          data: params,
        };
      },
    },
    events: {
      update: ({ name, value, record, oldValue }) => {
        if (name === 'webUrlObject' && value) {
          record.set('objectVersionNumber', value.objectVersionNumber);
        }

        if (record.status === 'update' && !record.get('oldValue') && oldValue) {
          record.set('oldValue', {
            ...oldValue,
            objectVersionNumber: record.get('objectVersionNumber'),
          });
        }
      },
    },
  };
}
