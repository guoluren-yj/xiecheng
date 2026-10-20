// import moment from 'moment';
import intl from 'utils/intl';
import { HZERO_IAM } from 'utils/config';
import { getCurrentOrganizationId, filterNullValueObject, isTenantRoleLevel } from 'utils/utils';

const organizationId = getCurrentOrganizationId();
const commonPrompt = 'hiam.common.model.common';

const listDs = () => ({
  autoQuery: false,
  pageSize: 20,
  primaryKey: 'id',
  dataToJSON: 'dirty',
  selection: isTenantRoleLevel() ? 'multiple' : false,
  autoLocateFirst: false,
  cacheSelection: true,
  fields: [
    {
      name: 'type',
      type: 'string',
      label: '操作类型',
      required: true,
      lookupCode: 'HIAM.MENU_INNER_ASSGIN_TYPE',
    },
    {
      name: 'status',
      type: 'string',
      label: '状态',
      lookupCode: 'HIAM.MENU_INNER_ASSGIN_STATSU',
    },
    {
      name: 'execStatus',
      type: 'string',
      label: '执行状态',
      lookupCode: 'HIAM.MENU_ASSIGN_EXEC_STATUS',
    },
    {
      name: 'errorMsg',
      type: 'string',
      label: '异常信息',
    },
    {
      name: 'tenantName',
      type: 'string',
      label: '所属租户',
    },
    {
      name: 'creator',
      type: 'string',
      label: '提报人',
    },
    {
      name: 'menuId',
      type: 'object',
      label: '菜单名称',
      required: true,
      lovCode: 'HIAM.SITE_MENU_LIST',
      lovPara: { type: 'menu' },
      valueField: 'menuId',
      textField: 'name',
      dynamicProps: {
        lovPara: ({ record }) => ({
          type: 'menu',
        }),
      },
      transformRequest: (value) => value?.menuId,
      transformResponse(value, data) {
        if (value) {
          return {
            code: data?.functionCode,
            menuId: value,
            name: data?.functionName,
          };
        } else {
          return null;
        }
      },
    },
    {
      name: 'functionCode',
      bind: 'menuId.code',
    },
    {
      name: 'functionName',
      bind: 'menuId.name',
    },
    {
      name: 'permissionId',
      type: 'object',
      label: '权限名称',
      multiple: true,
      required: true,
      lovCode: 'HIAM.SITE_MENU_PERMISSION',
      dynamicProps: {
        disabled: ({ record }) => !record?.get('menuId')?.menuId,
        lovPara: ({ record }) => ({
          menuId: record?.get('menuId')?.menuId,
        }),
      },
      transformRequest: (value) => value?.map((i) => i['id']).join(','),
      transformResponse: (value, object) => {
        if (value) {
          return (value?.split(',') || []).map((v, index) => {
            return {
              name: (object[`permissionName`]?.split(',') || [])[index],
              id: +v,
            };
          });
        } else {
          return null;
        }
      },
    },
    {
      name: 'action',
      label: '操作',
    },
  ],
  queryFields: isTenantRoleLevel()
    ? [
        {
          name: 'type',
          type: 'string',
          label: '操作类型',
          lookupCode: 'HIAM.MENU_INNER_ASSGIN_TYPE',
        },
        {
          name: 'status',
          type: 'string',
          label: '状态',
          lookupCode: 'HIAM.MENU_INNER_ASSGIN_STATSU',
        },
        {
          name: 'execStatus',
          type: 'string',
          label: '执行状态',
          lookupCode: 'HIAM.MENU_ASSIGN_EXEC_STATUS',
        },
      ]
    : [
        {
          name: 'type',
          type: 'string',
          label: '操作类型',
          lookupCode: 'HIAM.MENU_INNER_ASSGIN_TYPE',
        },
        {
          name: 'tenantId',
          type: 'object',
          label: '所属租户',
          lovCode: 'HPFM.TENANT',
          transformRequest: (value) => value?.tenantId,
        },
        {
          name: 'status',
          type: 'string',
          label: '状态',
          lookupCode: 'HIAM.MENU_INNER_ASSGIN_STATSU',
        },
        {
          name: 'execStatus',
          type: 'string',
          label: '执行状态',
          lookupCode: 'HIAM.MENU_ASSIGN_EXEC_STATUS',
        },
      ],
  transport: {
    read: ({ data, dataSet }) => {
      return {
        url: `${HZERO_IAM}/v1/${organizationId}/inner-menu-assign`,
        method: 'GET',
        data: filterNullValueObject({
          ...data,
        }),
      };
    },
  },
  events: {
    update: ({ name, record }) => {

      if (name === 'menuId') {
        record.set({
          permissionId: null,
          permissionName: null,
        });
      }
    },
  },
  record: {
    dynamicProps: {
      selectable: (record) => record.get('status') === 'NEW',
    },
  },
});

export { listDs };
