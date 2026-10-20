/**
 * 配置界面
 */
import intl from 'utils/intl';

export const formDs = () => ({
  autoCreate: true,
  fields: [
    {
      label: intl.get('spfm.managePage.modal.label.code').d('原编码'),
      name: 'sourcePermission',
      required: true,
    },
    {
      label: intl.get('spfm.managePage.modal.label.newAddCode').d('新增编码'),
      name: 'addPermission',
      required: true,
    },
    {
      label: intl.get('spfm.managePage.model.label.onlyAdmin').d('指定租户管理员角色'),
      name: 'onlyAdmin',
      type: 'boolean',
      defaultValue: false,
    },
    {
      label: intl.get('spfm.managePage.model.label.onlyRefreshCore').d('指定核企'),
      name: 'filterFlag',
      type: 'boolean',
      defaultValue: false,
    },
    {
      label: intl.get('spfm.managePage.model.label.designated.tenant').d('指定租户'),
      name: 'tenantLov',
      lovCode: 'HPFM.TENANT',
      type: 'object',
      textField: 'tenantName',
      ignore: 'always',
      multiple: true,
    },
    {
      name: 'tenantIds',
      bind: 'tenantLov.tenantId',
    },
  ],
});

export const roleTplDelMenuDs = () => ({
  autoCreate: true,
  fields: [
    {
      label: intl.get('spfm.managePage.modal.label.rolePath').d('角色路径'),
      name: 'roleLevelPath',
      required: true,
    },
    {
      label: intl.get('spfm.managePage.modal.label.deleteMenuCode').d('删除菜单编码'),
      name: 'revertMenus',
    },
    {
      label: intl.get('spfm.managePage.model.label.deletePermissionCode').d('删除权限集编码'),
      name: 'revertPermissions',
    },
  ],
});

export const roleTplAddMenuDs = () => ({
  autoCreate: true,
  fields: [
    {
      label: intl.get('spfm.managePage.modal.label.rolePath').d('角色路径'),
      name: 'roleLevelPath',
      required: true,
    },
    {
      label: intl.get('spfm.managePage.modal.label.addMenuCode').d('新增菜单编码'),
      name: 'assignMenus',
    },
    {
      label: intl.get('spfm.managePage.model.label.addPermissionCode').d('新增权限集编码'),
      name: 'assignPermissions',
    },
  ],
});