import intl from 'utils/intl';
import { HZERO_IAM, HZERO_PLATFORM } from 'utils/config';
import { getPlatformVersionApi, isTenantRoleLevel } from 'utils/utils';
import { CODE } from 'utils/regExp';
import { lovDefineAxiosConfig } from '_utils/c7nUiConfig';
import { getCodePrefix } from '../MenuGroupList';

export const _SITE = isTenantRoleLevel() ? '' : 'site/';

// 获取修项的子集集合
export const getChildren = (data, container = []) => {
  if (data) {
    data.forEach((item) => {
      const { childFunctions, code, objectVersionNumber: version } = item;
      if (childFunctions) {
        getChildren(childFunctions, container);
      }
      container.push({ code, version });
    });
    return container;
  }
  return [];
};

function getMenuGroup(type) {
  return {
    pageSize: 10,
    primaryKey: 'id',
    autoQuery: true,
    queryFields: [
      {
        name: 'name',
        type: 'string',
        label: intl.get('hiam.menuConfig.modal.menu.name').d('菜单组名称'),
      },
      {
        name: 'code',
        type: 'string',
        label: intl.get('hiam.menuConfig.modal.menu.code').d('菜单组编码'),
      },
      type === 'TENANT' && {
        name: 'tenantLov',
        label: intl.get('hiam.subAccount.model.user.tenant').d('所属租户'),
        type: 'object',
        lovCode: 'HPFM.TENANT',
        ignore: 'always',
        noCache: true,
        required: true,
        defaultValue: {
          tenantId: 0,
          tenantName: intl.get('hzero.common.srm.platform').d('SRM平台'),
        },
        lovQueryAxiosConfig: () => {
          return {
            url: `${HZERO_PLATFORM}/v1/lovs/sql/data?lovCode=HPFM.TENANT_PAGING`,
            method: 'GET',
          };
        },
      },
      type === 'TENANT' && {
        name: 'tenantId',
        bind: 'tenantLov.tenantId',
      },
    ],
    fields: [
      { name: 'id', type: 'number' },
      {
        name: 'name',
        type: 'string',
        label: intl.get('hiam.menuConfig.modal.menu.name').d('菜单组名称'),
        required: true,
      },
      {
        name: 'code',
        type: 'string',
        label: intl.get('hiam.menuConfig.modal.menu.code').d('菜单组编码'),
        required: true,
        disabled: true,
      },
      {
        name: 'tenantId',
        type: 'string',
      },
      {
        name: 'tenantName',
        type: 'string',
        label: intl.get('hzero.common.model.common.tenanted').d('所属租户'),
        ignore: 'always',
        required: true,
        disabled: true,
      },
      {
        name: 'defaultFlag',
        label: intl.get('hiam.menuConfig.tenanted.menu.default.temp').d('租户目录组默认模板'),
      },
      {
        name: 'functionGroupTemplate',
        type: 'string',
        lookupCode: 'SRM.FUNCTION_GROUP_TEMPLATE_LIST',
        label: intl.get('hiam.menuConfig.menu.temp').d('目录组模板'),
        required: true,
      },
      {
        name: 'operator',
        width: 100,
        label: intl.get('hzero.common.button.action').d('操作'),
      },
    ],
    transport: {
      read: ({ data }) => {
        return {
          url: `${HZERO_IAM}/v1/function/site/group/list`,
          method: 'get',
          data: { ...data, type },
        };
      },
    },
  };
}

function getMenuDs(code, id, fdLevel) {
  return {
    pageSize: 10,
    cacheSelection: true,
    paging: false,
    childrenField: 'childFunctions',
    expandField: 'expand',
    primaryKey: 'id',
    autoQuery: true,
    queryFields: [
      isTenantRoleLevel() && {
        name: 'queryName',
        type: 'string',
        merge: true,
        label: intl.get('hiam.menuConfig.modal.menu.dir.codeAndSub').d('目录编码、菜单名称'),
      },
      {
        name: 'code',
        type: 'string',
        label: intl.get('hiam.menuConfig.modal.menu.dir.code').d('目录编码'),
      },
      {
        name: 'name',
        type: 'string',
        label: intl.get('hiam.menuConfig.modal.menu.name.sub').d('菜单名称'),
      },
      {
        name: 'quickIndex',
        type: 'string',
        label: intl.get('hiam.menuConfig.modal.menu.quickIndex').d('快速索引'),
      },
      {
        name: 'enabledFlag',
        label: intl.get('hiam.menuConfig.modal.menu.enabledFlag').d('状态'),
        lookupCode: 'HPFM.ENABLED_FLAG',
        defaultValue: '1',
        display: true,
        defaultValueMeaning: intl.get('hzero.common.status.enable').d('启用'),
      },
    ],
    fields: [
      { name: 'expand', type: 'boolean' },
      {
        name: 'description',
        type: 'string',
        label: intl.get('hzero.common.view.description').d('描述'),
      },
      {
        name: 'enabledFlag',
        type: 'boolean',
        label: intl.get('hiam.menuConfig.modal.menu.enabledFlag').d('状态'),
        trueValue: 1,
        falseValue: 0,
        defaultValue: 1,
      },
      {
        name: 'tenantId',
        type: 'number',
      },
      {
        name: 'groupCode',
        type: 'string',
      },
      {
        name: 'code',
        type: 'string',
        required: true,
        pattern: CODE,
        help: intl
          .get('hzero.common.validation.code')
          .d('大小写及数字，必须以字母、数字开头，可包含“-”、“_”、“.”、“/”'),
        dynamicProps: {
          label: ({ record }) =>
            record.get('type') === 'dir'
              ? intl.get('hiam.menuConfig.modal.menu.dir.code').d('目录编码')
              : intl.get('hiam.menuConfig.model.menuCode').d('菜单编码'),
        },
      },
      {
        name: 'name',
        type: 'intl',
        label: intl.get('hiam.menuConfig.modal.menu.dir.name').d('目录名称'),
        required: true,
        dynamicProps: {
          label: ({ record }) =>
            record.get('type') === 'dir'
              ? intl.get('hiam.menuConfig.modal.menu.dir.name').d('目录名称')
              : intl.get('hiam.menuConfig.modal.menu.name.sub').d('菜单名称'),
        },
      },
      {
        name: 'menuCodeObject',
        type: 'object',
        lovCode: 'HPFM.MENU.SELECT',
        label: intl.get('hiam.menuConfig.modal.menu.menu.code').d('功能编码'),
        valueField: 'menuCode',
        textField: 'menuName',
        ignore: 'always',
        lovQueryAxiosConfig: (lovCode, _, { data }) => {
          return {
            url: `${HZERO_IAM}/v1/${getPlatformVersionApi(`function/${_SITE}menu/list`)}`,
            method: 'GET',
            data: {
              ...data,
              lovCode,
              fdLevel,
              tenantId: id,
              functionRelated: true,
            },
          };
        },
        dynamicProps: {
          required: ({ record }) => record.get('type') === 'menu',
          lovPara: ({ record }) => {
            return {
              functionGroup: record.get('groupCode'),
            };
          },
        },
      },
      {
        name: 'menuName',
        type: 'string',
        bind: 'menuCodeObject.name',
      },
      {
        name: 'menuTenantId',
        type: 'number',
        bind: 'menuCodeObject.tenantId',
      },
      {
        name: 'menuFdLevel',
        type: 'string',
        bind: 'menuCodeObject.fdLevel',
      },
      {
        name: 'menuQuickIndex',
        type: 'string',
        label: intl.get('hiam.menuConfig.modal.menu.quickIndex').d('快速索引'),
        // bind: 'menuCodeObject.hQuickIndex',
      },
      {
        name: 'icon',
        type: 'string',
        label: intl.get('hiam.menuConfig.modal.menu.icon').d('图标'),
        // bind: 'menuCodeObject.icon',
        required: true,
      },
      {
        name: 'menuCode',
        type: 'string',
        bind: 'menuCodeObject.code',
        label: intl.get('hiam.menuConfig.modal.menu.functionCode').d('功能编码'),
        disabled: true,
      },
      {
        name: 'type',
        lookupCode: 'SRM.IAM.FUNCTION.TYPE',
        type: 'string', // dir menu
        label: intl.get('hzero.common.model.type').d('类型'),
        // textField: 'meaning',
      },
      {
        name: 'parentObject',
        type: 'object',
        lovCode: 'HPFM.FUNCTION.SELECT',
        label: intl.get('hiam.menuConfig.modal.dir.parent').d('上级目录'),
        textField: 'name',
        valueField: 'code',
        dynamicProps: {
          lovPara: ({ record }) => {
            return {
              tenantId: record.get('tenantId'),
              groupCode: record.get('groupCode'),
              currentFunctionCode: record.get('type') === 'dir' ? record.get('code') : '',
            };
          },
        },
        lovDefineAxiosConfig: (lovCode) => {
          const lovConfig = lovDefineAxiosConfig(lovCode);
          return {
            ...lovConfig,
            transformResponse: [
              ...lovConfig.transformResponse,
              (data) => {
                return {
                  ...data,
                  dataSetProps: {
                    paging: false,
                    childrenField: 'childFunctions',
                    parentField: 'parentCode',
                    idField: 'code',
                  },
                };
              },
            ],
          };
        },
        lovQueryAxiosConfig: (lovCode, _, { data }) => {
          return {
            url: `${HZERO_IAM}/v1/${getPlatformVersionApi(`function/${_SITE}parent/list`)}`,
            method: 'GET',
            data: { lovCode, ...data },
          };
        },
        ignore: 'always',
      },
      {
        name: 'parentName',
        type: 'string',
        bind: 'parentObject.name',
        ignore: 'always',
      },
      {
        name: 'parentCode',
        type: 'string',
        bind: 'parentObject.code',
      },
      {
        name: 'targetFunctionVersion',
        type: 'number',
        bind: 'parentObject.objectVersionNumber',
      },
      {
        name: 'action',
        type: 'string',
        label: intl.get(`hzero.common.table.column.option`).d('操作'),
      },
    ],
    transport: {
      read: ({ data }) => {
        return {
          url: `${HZERO_IAM}/v1/${getPlatformVersionApi(`function/${_SITE}query`)}`,
          method: 'get',
          data: { ...data, groupCode: code, tenantId: id },
        };
      },
      create: ({ data }) => {
        const params = data[0];
        const { tenantId, groupCode } = params;
        const codePrefix = `${getCodePrefix(fdLevel, id)}${params.code}`;
        return {
          url: `${HZERO_IAM}/v1/${getPlatformVersionApi(`function/${_SITE}create`)}`,
          method: 'post',
          data: { ...params, code: codePrefix },
          params: { tenantId, groupCode },
        };
      },
      destroy: ({ data }) => {
        const { tenantId, groupCode } = data[0];
        return {
          url: `${HZERO_IAM}/v1/${getPlatformVersionApi(`function/${_SITE}del`)}`,
          method: 'post',
          data: data[0],
          params: { tenantId, groupCode },
        };
      },
    },
    events: {
      update: ({ record, name, value }) => {
        if (name === 'menuCodeObject' && value) {
          console.log(value, record.status, record.get('icon'));
          const isAdd = record.status === 'add';
          record.set({
            name: isAdd ? value.name : record.get('name'),
            code: isAdd ? value.code : record.get('code'),
            icon: value.icon || record.get('icon'), // 更新
            menuQuickIndex: value.hQuickIndex || record.get('menuQuickIndex'),
            menuCodeObject: { ...value, menuName: value.name },
            _tls: value._tls || {},
          });
        }
      },
    },
  };
}

export { getMenuGroup, getMenuDs };
