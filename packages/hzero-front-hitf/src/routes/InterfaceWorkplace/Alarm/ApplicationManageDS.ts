import { HZERO_HITF } from 'hzero-front/lib/utils/config';
import intl from 'hzero-front/lib/utils/intl';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { filterNullValueObject, getCurrentOrganizationId } from 'hzero-front/lib/utils/utils';
import { lovQueryAxiosConfig } from 'srm-front-boot/lib/utils/c7nUiConfig';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';

const organizationId = getCurrentOrganizationId();

export const getLovQueryAxiosConfig = (code, config, options) => {
  const axiosConfig = lovQueryAxiosConfig(code, config);
  return {
    ...axiosConfig,
    headers: {
      ...axiosConfig.headers,
      ...options.headers,
    },
  };
};

// 应用管理列表页-表格
export const listTableDS = (): DataSetProps => {
  return {
    autoQuery: true,
    fields: [
      {
        name: 'status',
        type: FieldType.string,
        label: intl.get('hzero.common.status').d('状态'),
      },
      {
        name: 'warnCode',
        type: FieldType.string,
        label: intl.get('hitf.application.warnCode').d('告警代码'),
      },
      {
        name: 'warnName',
        type: FieldType.string,
        label: intl.get('hitf.application.warnName').d('告警名称'),
      },
      {
        name: 'applicationHeaders',
        type: FieldType.string,
        label: intl.get('hitf.application.applicationIds').d('关联应用'),
        transformResponse: (value) => {
          let arr = [];
          if (value) {
            arr = value.map(item => item.applicationName);
          }
          return arr.join(',');
        },
      },
      {
        name: 'remark',
        type: FieldType.string,
        label: intl.get('hitf.application.remark').d('备注'),
      },
    ],
    transport: {
      read: ({ data, params }) => {
        const { page, size } = params;
        const { queryParams = {} } = data;
        const queryParam = filterNullValueObject(queryParams);
        return {
          url: `${HZERO_HITF}/v1/${organizationId}/open-warn-rules`,
          method: 'GET',
          data: {
            page,
            size,
            ...queryParam,
          },
        };
      },
    },
  };
};
