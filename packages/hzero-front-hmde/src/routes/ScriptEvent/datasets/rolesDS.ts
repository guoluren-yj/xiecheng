import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { getResponse } from 'utils/utils';
import { getRole } from '@/services/scriptEventService';

const rolesDS = () =>
  ({
    autoQuery: false,
    autoCreate: true,
    selection: false,
    paging: false,
    fields: [
      {
        name: 'roleId',
        type: 'string',
        textField: 'name',
        valueField: 'id',
        computedProps: {
          lookupAxiosConfig: ({ record }) => {
            return {
              url: `/iam/hzero/v1/roles/self/assigned-roles?tenantId=${record?.get(
                'tenantId'
              )}&page=0&size=100`,
              method: 'GET',
            };
          },
        },
      },
      {
        name: 'tenantId',
        type: 'number',
        lookupAxiosConfig: () => {
          return {
            url: `/iam/hzero/v1/users/self-tenants`,
            method: 'GET',
          };
        },
        textField: 'tenantName',
        valueField: 'tenantId',
      },
    ],
    events: {
      update: ({ record, name, value }) => {
        if (name === 'tenantId') {
          if (value !== undefined && value !== null) {
            record.set('roleId', null);
            getRole(value).then((res) => {
              if (getResponse(res)) {
                record.set('roleId', res?.content?.[0]?.id);
              }
            });
          } else {
            record.set('roleId', null);
          }
        }
      },
    },
  } as DataSetProps);

export { rolesDS };
