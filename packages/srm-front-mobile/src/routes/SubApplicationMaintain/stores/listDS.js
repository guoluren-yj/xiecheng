import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
import { SRM_SMBL } from '@/utils/config.js';
// import { lovDefineAxiosConfig } from 'srm-front-boot/lib/utils/c7nUiConfig';

const organizationId = getCurrentOrganizationId();

function listLineDS() {
  return {
    primaryKey: 'supAppId',
    selection: 'multiple',
    autoQuery: true,
    autoCreate: false,
    fields: [
      {
        name: 'iconUrl',
        type: 'string',
        label: intl.get('smbl.subApplication.model.SubApplication.iconUrl').d('子应用图标'),
        required: true,
      },
      {
        name: 'subAppCode',
        type: 'string',
        label: intl.get('smbl.subApplication.model.SubApplication.subAppCode').d('子应用编码'),
        required: true,
      },
      {
        name: 'subAppName',
        type: 'intl',
        label: intl.get('smbl.subApplication.model.SubApplication.subAppName').d('子应用名称'),
        required: true,
      },
      {
        name: 'redirectUrl',
        type: 'string',
        label: intl.get('smbl.subApplication.model.SubApplication.redirectUrl').d('子应用地址'),
        required: true,
      },
      {
        name: 'subAppDesc',
        type: 'intl',
        label: intl.get('smbl.subApplication.model.SubApplication.subAppDesc').d('子应用描述'),
      },
      {
        name: 'permissionList',
        type: 'object',
        label: intl.get('smbl.common.model.roleAssign').d('授权角色'),
        noCache: true,
        lovCode: 'HIAM.USER_ROLE_MANAGER',
        lovPara: { tenantId: organizationId },
        multiple: true,
        transformRequest: (value) => value && value.map((item) => ({ ...item, roleId: item.id })),
      },
      {
        name: 'subAppGroup',
        type: 'object',
        label: intl.get('smbl.subApplicationGp.model.subApplicationGp.name').d('分组名称'),
        noCache: true,
        lovCode: 'SMBL.SUB_APPLICATION_GP.VIEW',
        lovPara: { tenantId: organizationId },
        required: true,
      },
      {
        name: 'subAppGroupId',
        bind: 'subAppGroup.subAppGroupId',
      },
      {
        label: intl.get('smbl.subApplicationGp.model.subApplicationGp.name').d('分组名称'),
        name: 'subAppGroupName',
        bind: 'subAppGroup.subAppGroupName',
      },
      // &asyncCountFlag=DEFAULT&lovCode=HPFM.MENU.SELECT&fdLevel=organization&tenantId=30
      {
        name: 'menu',
        label: intl.get('smbl.subApplication.model.menu').d('关联菜单'),
        type: 'object',
        lovCode: 'HPFM.MENU.SELECT',
        ignore: 'always',
        lovPara: {
          // unionLabel: false,
          asyncCountFlag: 'DEFAULT',
          enabledFlag: 1,
          tenantId: organizationId,
          fdLevel: 'organization',
        },
        // optionsProps: {
        //   childrenField: 'childFunctions',
        // },
      },
      {
        name: 'menuId',
        bind: 'menu.id',
      },
      {
        name: 'menuCode',
        bind: 'menu.code',
      },
      {
        name: 'menuName',
        label: intl.get('smbl.subApplication.model.menu').d('关联菜单'),
        bind: 'menu.name',
      },
      {
        name: 'application',
        type: 'object',
        label: intl.get('smbl.application.model.Application.application').d('应用'),
        noCache: true,
        lovCode: 'SMBL.APPLICATION.VIEW',
        lovPara: { tenantId: organizationId },
        required: true,
      },
      {
        name: 'applicationCode',
        bind: 'application.applicationCode',
      },
      {
        label: intl.get('smbl.application.model.Application.applicationName').d('应用名称'),
        name: 'applicationName',
        bind: 'application.applicationName',
      },

      {
        name: 'subApp',
        type: 'object',
        label: intl.get('smbl.subApplication.model.SubApplication.subApp').d('子应用'),
        placeholder: '',
        noCache: true,
        lovCode: 'SMBL.SUB_APPLICATION_PFM.VIEW',
        lovPara: { tenantId: organizationId },
        transformRequest: (value) => value && value.subAppCode,
      },

      {
        name: 'sequence',
        type: 'number',
        label: intl.get('smbl.common.model.sequence').d('排序'),
        required: true,
      },
      {
        name: 'hotFlag',
        type: 'boolean',
        label: intl.get('smbl.subApplication.model.SubApplication.hotFlag').d('是否热门'),
        trueValue: 1,
        falseValue: 0,
      },
      {
        name: 'outerApplicationFlag',
        type: 'boolean',
        label: intl
          .get('smbl.subApplication.model.SubApplication.outerApplicationFlag')
          .d('是否外部应用'),
        trueValue: 1,
        falseValue: 0,
      },
      {
        name: 'hotSeq',
        type: 'number',
        label: intl.get('smbl.subApplication.model.SubApplication.hotSeq').d('热门排序'),
      },
      {
        name: 'navBarFlag',
        type: 'boolean',
        label: intl.get('smbl.subApplication.model.SubApplication.navBarFlag').d('显示导航栏'),
        trueValue: 1,
        falseValue: 0,
      },
      {
        name: 'enabledFlag',
        type: 'boolean',
        label: intl.get('hzero.common.status.enabled').d('启用'),
        trueValue: 1,
        falseValue: 0,
      },
      {
        // 引用标识
        name: 'quoteFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        defaultValue: 0,
      },
    ],

    // 查询表单字段
    queryFields: [
      {
        name: 'subAppCode',
        type: 'string',
        label: intl.get('smbl.subApplication.model.SubApplication.subAppCode').d('子应用编码'),
      },
      {
        name: 'subAppName',
        type: 'string',
        label: intl.get('smbl.subApplication.model.SubApplication.subAppName').d('子应用名称'),
      },
      {
        name: 'applicationCode',
        type: 'object',
        label: intl.get('smbl.application.model.Application.application').d('应用'),
        placeholder: '',
        lovCode: 'SMBL.APPLICATION.VIEW',
        lovPara: { tenantId: organizationId },
        noCache: true,
        transformRequest: (value) => value && value.applicationCode,
      },
    ],

    // 事件
    events: {
      // 提交成功后在做一次查询，指定查第一页最新数据,一般如果后端没有在执行动作后没有返回数据给前端，需要在做一次查询
      submitSuccess: ({ dataSet }) => dataSet.query(1),
    },
    transport: {
      read: {
        url: `${SRM_SMBL}/v1/${organizationId}/sub-application/manage`,
        method: 'GET',
      },
      create: ({ data }) => ({
        url: `${SRM_SMBL}/v1/${organizationId}/sub-application`,
        data,
        method: 'put',
      }),
      update: ({ data }) => ({
        url: `${SRM_SMBL}/v1/${organizationId}/sub-application`,
        data,
        method: 'put',
      }),
      destroy: ({ data }) => ({
        url: `${SRM_SMBL}/v1/${organizationId}/sub-application`,
        data,
        method: 'delete',
      }),
    },
  };
}

export { listLineDS };
