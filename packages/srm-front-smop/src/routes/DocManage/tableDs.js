import intl from 'utils/intl';

const initDs = () => ({
  selection: false,
  autoQuery: true,
  queryFields: [
    {
      name: 'title',
      type: 'string',
      label: intl.get('smop.common.model.menuTitle').d('菜单名称'),
    },
    {
      name: 'menuDeployId',
      type: 'string',
      label: intl.get('smop.common.model.menuDeployId').d('菜单编码'),
    },
  ],
  fields: [
    {
      name: 'menuDeployId',
      type: 'string',
      label: intl.get('smop.common.model.menuDeployId').d('菜单编码'),
    },
    {
      name: 'title',
      type: 'string',
      label: intl.get('smop.common.model.menuTitle').d('菜单名称'),
    },
    {
      name: 'level',
      type: 'string',
      label: intl.get('smop.common.model.menuLevel').d('菜单层级'),
    },
    {
      name: 'parentMenuDeployId',
      type: 'string',
      label: intl.get('smop.common.model.parentMenuDeployId').d('父级菜单'),
    },
    {
      name: 'status',
      type: 'number',
      label: intl.get('smop.common.model.status').d('状态'),
    },
    {
      name: 'operation',
      type: 'string',
      label: intl.get('smop.common.model.operation').d('操作'),
    },
  ],
  transport: {
    read({ data }) {
      return {
        url: `/sop/v1/menu-deploy/query`,
        method: 'GET',
        data: { ...data },
      };
    },
  },
});

const formDs = () => ({
  selection: false,
  autoQuery: false,
  fields: [
    {
      name: 'menuTitleId',
      // type: 'object',
      label: intl.get('smop.common.model.programa').d('栏目'),
      lookupCode: 'SOP.MENU_TITLE',
      valueField: 'menuTitleId',
      textField: 'name',
      required: true,
    },
    {
      name: 'title',
      type: 'string',
      label: intl.get('smop.common.model.menuTitle').d('菜单名称'),
      required: true,
    },
    {
      name: 'level',
      label: intl.get('smop.common.model.menuLevel').d('菜单层级'),
      lookupCode: 'SOP.MENU_LEVEL',
      required: true,
    },
    {
      name: 'parentMenuDeployId',
      // type: 'object',
      label: intl.get('smop.common.model.parentMenuDeployId').d('父级菜单'),
      lookupCode: 'SOP.MENU_PARENT',
      dynamicProps: {
        disabled: ({ record }) => {
          return !record.get('level');
        },
        lovPara: ({ record }) => ({ level: record?.get('level') - 1 }),
      },
      valueField: 'menuDeployId',
      textField: 'title',
    },
    {
      name: 'status',
      // type: 'number',
      label: intl.get('smop.common.model.yesOrnoOpen').d('是否开放'),
      lookupCode: 'SOP.MENU_STATUS',
      required: true,
    },
    {
      name: 'richTextId',
      type: 'string',
    },
  ],
});

export { initDs, formDs };
