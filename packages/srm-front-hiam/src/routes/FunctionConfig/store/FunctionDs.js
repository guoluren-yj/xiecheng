import { DataSet } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { HZERO_IAM } from 'utils/config';
import { getPlatformVersionApi, getCurrentOrganizationId } from 'utils/utils';
import { CODE } from 'utils/regExp';
import { checkMenuDirExists } from '@/services/menuConfigService';
import { platform } from '../../MenuGroup/SrmMenuGroup';

const enabledFlagDs = (enableIntl, disabledIntl) => ({
  autoQuery: false,
  data: [
    {
      label: enableIntl,
      value: 1,
    },
    {
      label: disabledIntl,
      value: 0,
    },
  ],
});

const queryPermission = (data, url, type) => {
  const body = data.map((item) => item[type]);
  return {
    url: `${HZERO_IAM}/hzero/v1/${getPlatformVersionApi(url)}`,
    method: 'post',
    data: body,
  };
};

function getFunctionDs() {
  return {
    paging: false,
    fields: [
      {
        name: 'id',
        type: 'number',
      },
      {
        name: 'code',
        type: 'string',
        label: 'code',
      },
      {
        name: 'name',
        type: 'intl',
        label: intl.get('hiam.menuConfig.model.module.name').d('模块名称'),
      },
      {
        name: 'tenantId',
        type: 'number',
        label: 'tenantId',
      },
    ],
    queryFields: [
      {
        name: 'name',
        type: 'string',
      },
    ],
    transport: {
      read: ({ data }) => {
        return {
          url: `${HZERO_IAM}/v1/${getPlatformVersionApi(`iam-menu-group/select/all`)}`,
          method: 'get',
          data: { ...data, type: platform },
        };
      },
      create: ({ data = [] }) => {
        return {
          url: `${HZERO_IAM}/v1/${getPlatformVersionApi(`iam-menu-group/insert`)}`,
          method: 'post',
          data: { ...data[0], fdLevel: platform },
        };
      },
      update: ({ data = [] }) => {
        return {
          url: `${HZERO_IAM}/v1/${getPlatformVersionApi(`iam-menu-group/update`)}`,
          method: 'post',
          data: data[0],
        };
      },
      destroy: ({ data = [] }) => {
        return {
          url: `${HZERO_IAM}/v1/${getPlatformVersionApi(`iam-menu-group/delete`)}`,
          method: 'post',
          data: data[0],
        };
      },
    },
  };
}

function getFunctionContentDs(group, fdLevel) {
  return {
    autoQuery: true,
    pageSize: 10,
    primaryKey: 'id',
    cacheSelection: true,
    queryFields: [
      {
        name: 'name',
        type: 'string',
        label: intl.get('hiam.menuConfig.model.function.name').d('功能名称'),
      },
      {
        name: 'code',
        type: 'string',
        label: intl.get('hiam.menuConfig.model.function.code').d('功能编码'),
      },
      {
        name: 'customFlag',
        type: 'boolean',
        label: intl.get('hiam.menuConfig.model.menuConfig.standardOrIndividual').d('标准/二开'),
        trueValue: 1,
        falseValue: 0,
        valueField: 'value',
        textField: 'label',
        options: new DataSet(
          enabledFlagDs(
            intl.get('hiam.menuConfig.model.menuConfig.individual').d('二开'),
            intl.get('hiam.menuConfig.model.menuConfig.standard').d('标准')
          )
        ),
      },
      {
        name: 'virtualFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        label: intl.get('hiam.menuConfig.model.menuConfig.virtualFlag').d('是否虚拟菜单'),
      },
      {
        name: 'enabledFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        valueField: 'value',
        textField: 'label',
        options: new DataSet(
          enabledFlagDs(
            intl.get(`hzero.common.status.enable`).d('启用'),
            intl.get(`hzero.common.status.disabled`).d('禁用')
          )
        ),
        label: intl.get('hzero.common.status').d('状态'),
      },
      {
        name: 'tenantNumObject',
        type: 'object',
        lovCode: 'HPFM.ASSIGN_TENANT',
        textField: 'tenantName',
        valueField: 'tenantId',
        label: intl.get('hptl.portalAssign.model.tenant.tenantCode').d('租户编码'),
        ignore: 'always',
      },
      {
        name: 'tenantId',
        type: 'number',
        bind: 'tenantNumObject.tenantId',
        hidden: true,
      },
      {
        name: 'description',
        type: 'string',
        label: intl.get('hiam.menuConfig.model.menuConfig.description').d('描述'),
      },
      {
        name: 'manager',
        type: 'string',
        label: intl.get('hiam.menuConfig.model.function.chargeName').d('责任人'),
      },
    ],
    fields: [
      {
        name: 'id',
        type: 'string',
      },
      {
        name: 'name',
        type: 'intl',
        label: intl.get('hiam.menuConfig.model.function.name').d('功能名称'),
        required: true,
      },
      {
        name: 'tenantNumObject',
        type: 'object',
        lovCode: 'HPFM.ASSIGN_TENANT',
        textField: 'tenantName',
        valueField: 'tenantNum',
        label: intl.get('hptl.portalAssign.model.tenant.tenantCode').d('租户编码'),
        ignore: 'always',
        defaultValue: {
          tenantId: 0,
          tenantNum: 'SRM',
        },
      },
      {
        name: 'tenantId',
        type: 'number',
        bind: 'tenantNumObject.tenantId',
      },
      {
        name: 'tenantNum',
        type: 'string',
        bind: 'tenantNumObject.tenantNum',
        ignore: 'always',
      },
      {
        name: 'tenantName',
        type: 'string',
        label: intl.get('hptl.portalAssign.model.tenant.tenantName').d('租户名称'),
        bind: 'tenantNumObject.tenantName',
        ignore: 'always',
      },
      {
        name: 'menuGroupObject',
        type: 'object',
        lovCode: 'SRM.IAM_MENU_GROUP_LIST_VIEW',
        valueFiled: 'menuGroup',
        textField: 'name',
        label: intl.get('hiam.menuConfig.model.associated.module').d('所属模块'),
        required: true,
        ignore: 'always',
        lovPara: { fdLevel: platform },
      },
      {
        name: 'menuGroup',
        type: 'string',
        bind: 'menuGroupObject.code',
        required: true,
      },
      {
        name: 'menuGroupName',
        type: 'string',
        bind: 'menuGroupObject.name',
        label: intl.get('hiam.menuConfig.model.associated.module').d('所属模块'),
        ignore: 'always',
      },
      {
        name: 'code',
        type: 'string',
        label: intl.get('hiam.menuConfig.model.function.code').d('功能编码'),
        required: true,
        validator: async (value, _, record) => {
          if (!CODE.test(value)) {
            return intl
              .get('hzero.common.validation.code')
              .d('大小写及数字，必须以字母、数字开头，可包含“-”、“_”、“.”、“/”');
          } else {
            try {
              if (record.status === 'add') {
                const res = await checkMenuDirExists({
                  code: value,
                  level: record.get('level'),
                  type: record.get('type'),
                  tenantId: getCurrentOrganizationId(),
                });
                if (res.failed) {
                  return res.message;
                }
              }
              return true;
            } catch (error) {
              return true;
            }
          }
        },
      },
      {
        name: 'route',
        type: 'string',
        label: intl.get('hiam.menuConfig.model.menuConfig.route').d('路由'),
        required: true,
      },
      {
        name: 'icon',
        type: 'string',
        label: intl.get('hiam.menuConfig.model.menuConfig.icon').d('图标'),
        required: true,
      },
      {
        name: 'quickIndex',
        type: 'string',
        label: intl.get('hiam.menuConfig.model.menuConfig.quickIndex').d('快速索引'),
      },
      {
        name: 'description',
        type: 'string',
        label: intl.get('hiam.menuConfig.model.menuConfig.description').d('描述'),
      },
      {
        name: 'enabledFlag',
        type: 'boolean',
        label: intl.get('hzero.common.status').d('状态'),
        trueValue: 1,
        falseValue: 0,
      },
      {
        name: 'virtualFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        defaultValue: 0,
      },
      {
        name: 'labelCode',
        type: 'string',
        lookupCode: 'HIAM_MENU_ROLE_LABEL',
        label: intl.get('hiam.menuConfig.model.menuConfig.menuUser').d('菜单使用方'),
      },
      {
        name: 'type',
        type: 'string',
        lookupCode: 'SRM.IAM.MENU.OPEN.TYPE',
        label: intl.get('hiam.menuConfig.model.menuConfig.openType').d('菜单打开方式'),
        required: true,
      },
      {
        name: 'customFlag',
        type: 'number',
        defaultValue: 0,
      },
      {
        name: 'manager',
        type: 'string',
        label: intl.get('hiam.menuConfig.model.function.chargeName').d('责任人'),
      },
      {
        name: 'action',
        type: 'string',
        label: intl.get(`hzero.common.table.column.option`).d('操作'),
      },
      {
        name: 'level',
        type: 'string',
      },
    ],
    transport: {
      read: ({ data, dataSet }) => {
        const menuGroup = dataSet.getQueryParameter('both') ? null : group;
        return {
          url: `${HZERO_IAM}/v1/${getPlatformVersionApi('iam-menus/query/menus')}`,
          method: 'get',
          data: { ...data, menuGroup, fdLevel: fdLevel === platform ? 'site' : 'organization' },
        };
      },
      create: ({ data }) => {
        return {
          url: `${HZERO_IAM}/hzero/v1/${getPlatformVersionApi('menus/create')}`,
          method: 'post',
          data: data[0],
        };
      },
      update: ({ data }) => {
        return {
          url: `${HZERO_IAM}/hzero/v1/${getPlatformVersionApi('menus/update')}`,
          method: 'post',
          data: data[0],
        };
      },
      destroy: ({ data = [] }) => {
        const { tenantId, id } = data[0];
        return {
          url: `${HZERO_IAM}/hzero/v1/${getPlatformVersionApi(
            `menus/function/${id}?tenantId=${tenantId}`
          )}`,
          method: 'delete',
        };
      },
    },
  };
}

function getJurisdictionDs() {
  return {
    paging: false,
    queryFields: [
      {
        name: 'code',
        type: 'string',
        label: intl.get('hiam.menuConfig.model.menuConfig.permissionCode').d('权限编码'),
      },
      {
        name: 'name',
        type: 'string',
        label: intl.get('hiam.menuConfig.model.menuConfig.permissionName').d('权限名称'),
      },
    ],
    fields: [
      {
        name: 'permissionType',
        type: 'string',
        label: intl.get('hiam.menuConfig.model.menuConfig.permissionType').d('权限类型'),
      },
      {
        name: 'code',
        type: 'string',
        label: intl.get('hiam.menuConfig.model.menuConfig.permissionSetCode').d('权限集编码'),
        required: true,
      },
      {
        name: 'viewCode',
        type: 'string',
      },
      {
        name: 'name',
        type: 'intl',
        label: intl.get('hiam.menuConfig.model.menuConfig.permissionSetName').d('权限集名称'),
        required: true,
      },
      {
        name: 'sort',
        type: 'number',
        step: 1,
        label: intl.get('hiam.menuConfig.model.menuConfig.sort').d('序号'),
      },
      {
        name: 'controllerType',
        type: 'string',
        lookupCode: 'HIAM.CONTROLLER_TYPE',
        value: 'value',
        label: intl
          .get('hiam.menuConfig.model.menuConfig.controllerTypeMeaning')
          .d('权限集控制类型'),
        required: true,
      },
      {
        name: 'description',
        type: 'string',
        label: intl.get('hiam.menuConfig.model.menuConfig.description').d('描述'),
      },
      {
        name: 'enabledFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        label: intl.get('hzero.common.status').d('状态'),
      },
      {
        name: 'action',
        type: 'string',
        label: intl.get(`hzero.common.table.column.option`).d('操作'),
        ignore: 'always',
      },
    ],
    transport: {
      read: ({ data }) => {
        const { id } = data;
        const params = data;
        delete params.id;
        return {
          url: `${HZERO_IAM}/hzero/v1/menus/${id}/permission-set`,
          method: 'get',
        };
      },
      create: ({ data = [], dataSet }) => {
        const { code } = data[0];
        const realCode = `${dataSet.getState('menuCode')}.${data[0].permissionType}.${code}`;
        return {
          url: `${HZERO_IAM}/hzero/v1/${getPlatformVersionApi(`menus/create`)}`,
          method: 'post',
          data: { ...data[0], viewCode: code, code: realCode },
        };
      },
      update: ({ data = [] }) => {
        return {
          url: `${HZERO_IAM}/hzero/v1/${getPlatformVersionApi(`menus/update`)}`,
          method: 'post',
          data: { ...data[0] },
        };
      },
    },
  };
}

function getPermissionDs(tenantId) {
  return {
    pageSize: 10,
    autoQuery: false,
    queryFields: [
      {
        name: 'code',
        type: 'string',
        label: intl.get('hiam.menuConfig.model.menuConfig.dirCode').d('目录编码'),
      },
      {
        name: 'condition',
        type: 'string',
        label: intl.get('hiam.menuConfig.model.menuConfig.conditionPermission').d('描述/路径'),
      },
    ],
    fields: [
      {
        name: 'code',
        type: 'string',
        label: intl.get('hiam.menuConfig.model.menuConfig.permissionCode').d('权限编码'),
      },
      {
        name: 'description',
        type: 'string',
        label: intl.get('hiam.menuConfig.model.menuConfig.description').d('描述'),
      },
      {
        name: 'path',
        type: 'string',
        label: intl.get('hiam.menuConfig.model.menuConfig.path').d('路径'),
      },
      {
        name: 'method',
        type: 'string',
        label: intl.get('hiam.menuConfig.model.menuConfig.method').d('方法'),
      },
      {
        name: 'levelMeaning',
        type: 'string',
        label: intl.get('hiam.menuConfig.model.menuConfig.level').d('层级'),
      },
      {
        name: 'labelCode',
        type: 'string',
        label: intl.get('hiam.menuConfig.model.menuConfig.labelCode').d('API使用方'),
        lookupCode: 'AUTH_LABEL',
        help: intl.get('hiam.menuConfig.model.menuConfig.labelCode.help').d('API使用方'),
      },
      {
        name: 'permission',
        type: 'object',
        lovCode: 'SRN.FUNCTION.PS.LIST.SITE',
        textField: 'description',
        valueField: 'code',
        multiple: true,
        dynamicProps: {
          lovPara: ({ record }) => {
            return {
              permissionSetId: record.dataSet.getQueryParameter('id'),
            };
          },
        },
        lovQueryAxiosConfig: (code, config, { data }) => {
          const { permissionSetId } = data;
          return {
            url: `${HZERO_IAM}/hzero/v1/${getPlatformVersionApi(
              `menus/${permissionSetId}/assignable-permissions`
            )}`,
            method: 'GET',
            data: { ...data, tenantId },
          };
        },
        ignore: 'always',
      },
    ],
    transport: {
      read: ({ data }) => {
        const { id } = data;
        return {
          url: `${HZERO_IAM}/hzero/v1/${getPlatformVersionApi(
            `menus/permission-set/${id}/permissions`
          )}`,
          method: 'get',
          data: { ...data, tenantId },
        };
      },
      destroy: ({ data = [], dataSet }) => {
        return queryPermission(
          data,
          `menus/${dataSet.getQueryParameter(
            'id'
          )}/permission-set/recycle-permissions?permissionType=LOV&tenantId=${tenantId}`,
          'code'
        );
      },
    },
  };
}

function getLovDs(tenantId) {
  return {
    pageSize: 10,
    autoQuery: false,
    queryFields: [
      {
        name: 'condition',
        type: 'string',
        label: intl.get('hiam.menuConfig.model.menuConfig.conditionLov').d('编码/名称'),
      },
    ],
    fields: [
      {
        name: 'lovCode',
        type: 'string',
        label: intl.get('hiam.menuConfig.model.menuConfig.lovCode').d('编码'),
      },
      {
        name: 'lovName',
        type: 'string',
        label: intl.get('hiam.menuConfig.model.menuConfig.lovName').d('名称'),
      },
      {
        name: 'lovTypeCode',
        type: 'string',
        label: intl.get('hiam.menuConfig.model.menuConfig.lovTypeCode').d('类型'),
      },
      {
        name: 'labelCode',
        type: 'string',
        label: intl.get('hiam.menuConfig.model.menuConfig.labelCode').d('API使用方'),
        lookupCode: 'AUTH_LABEL',
        help: intl.get('hiam.menuConfig.model.menuConfig.labelCode.help').d('API使用方'),
      },
      {
        name: 'tenantName',
        type: 'string',
        label: intl.get('hiam.menuConfig.model.menuConfig.tenantName').d('所属租户'),
      },
      {
        name: 'lov',
        multiple: true,
        type: 'object',
        lovCode: 'SRM.FUNCTION.LOV.LIST.SITE',
        textField: 'lovName',
        valueField: 'lovCode',
        dynamicProps: {
          lovPara: ({ record }) => {
            return {
              permissionSetId: record.dataSet.getQueryParameter('id'),
            };
          },
        },
        lovQueryAxiosConfig: (code, config, { data }) => {
          const { permissionSetId } = data;
          return {
            url: `${HZERO_IAM}/hzero/v1/${getPlatformVersionApi(
              `menus/${permissionSetId}/assignable-lovs`
            )}`,
            method: 'GET',
            data: { ...data, tenantId },
          };
        },
        ignore: 'always',
      },
    ],
    transport: {
      read: ({ data }) => {
        const { id } = data;
        return {
          url: `${HZERO_IAM}/hzero/v1/${getPlatformVersionApi(`menus/permission-set/${id}/lovs`)}`,
          method: 'get',
          data: { ...data, tenantId },
        };
      },
      destroy: ({ data = [], dataSet }) => {
        return queryPermission(
          data,
          `menus/${dataSet.getQueryParameter(
            'id'
          )}/permission-set/recycle-permissions?permissionType=LOV&tenantId=${tenantId}`,
          'lovCode'
        );
      },
    },
  };
}

function getCopyMenuDs() {
  return {
    paging: false,
    autoQuery: false,
    parentField: 'parentId',
    childrenField: 'subMenus',
    fields: [
      {
        name: 'name',
        type: 'intl',
        label: intl.get(`hiam.tenantMenu.model.tenantMenu.name`).d('目录/菜单'),
      },
      {
        name: 'parentName',
        type: 'string',
        label: intl.get(`hiam.tenantMenu.model.tenantMenu.parentName`).d('上级目录'),
      },
      {
        name: 'quickIndex',
        type: 'string',
        label: intl.get(`hiam.tenantMenu.model.tenantMenu.quickIndex`).d('快速索引'),
      },
      {
        name: 'icon',
        type: 'string',
        label: intl.get(`hiam.tenantMenu.model.tenantMenu.icon`).d('图标'),
      },
      {
        name: 'code',
        type: 'string',
        label: intl.get(`hiam.tenantMenu.model.tenantMenu.code`).d('编码'),
      },
      {
        name: 'menuType',
        type: 'string',
        label: intl.get(`hiam.tenantMenu.model.tenantMenu.menuType`).d('类型'),
      },
      {
        name: 'sort',
        type: 'string',
        label: intl.get(`hiam.tenantMenu.model.tenantMenu.sort`).d('序号'),
      },
      {
        name: 'description',
        type: 'string',
        label: intl.get(`hiam.tenantMenu.model.tenantMenu.description`).d('描述'),
      },
    ],
    transport: {
      read: ({ data }) => {
        return {
          url: `${HZERO_IAM}/hzero/v1/${getPlatformVersionApi('menus/copy')}`,
          method: 'get',
          data: { ...data.data },
        };
      },
    },
    events: {
      load: ({ dataSet }) => {
        dataSet.selectAll();
      },
    },
  };
}

export {
  getFunctionDs,
  getFunctionContentDs,
  getJurisdictionDs,
  getPermissionDs,
  getLovDs,
  getCopyMenuDs,
};
