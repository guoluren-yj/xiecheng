import { isArray, omit } from 'lodash';
import intl from 'utils/intl';
import { SRM_PLATFORM } from '_utils/config';

export const getTableDs = () => ({
  autoCreate: false,
  autoQuery: true,
  paging: false,
  selection: false,
  parentField: 'parentId',
  idField: 'id',
  queryFields: [
    {
      name: 'code',
      type: 'string',
      format: 'uppercase',
      label: intl.get('spfm.rulesCategory.mdoel.rulesCategory.code').d('编码'),
    },
    {
      name: 'name',
      type: 'string',
      label: intl.get('spfm.rulesCategory.mdoel.rulesCategory.name').d('名称'),
    },
  ],
  fields: getFormDs().fields,
  transport: {
    read: {
      url: `${SRM_PLATFORM}/v1/cnf-menu-trees`,
      method: 'GET',
      transformResponse: resp => {
        const data = [];
        try {
          const result = JSON.parse(resp);
          if (isArray(result) && result.length > 0) {
            result.forEach(item => {
              data.push(item);
              if (item.children?.length > 0) {
                data.push(...item.children);
              }
            });
          }
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error(e);
        } finally {
          // eslint-disable-next-line no-unsafe-finally
          return data;
        }
      },
    },
    destroy: ({ data }) => {
      let deleteData = data[0];
      if (
        !(
          deleteData.type === 'dir' &&
          deleteData.levelPath &&
          deleteData.levelPath.split('|').length === 3
        )
      ) {
        deleteData = omit(deleteData, ['menuList']);
      }
      return {
        url: `${SRM_PLATFORM}/v1/cnf-menu-trees`,
        method: 'DELETE',
        data: deleteData,
      };
    },
  },
});

export const getFormDs = () => ({
  autoCreate: false,
  fields: [
    {
      name: 'code',
      type: 'string',
      format: 'uppercase',
      pattern: /^[A-Z][A-Z0-9-_./]*$/,
      required: true,
      label: intl.get('spfm.rulesCategory.mdoel.rulesCategory.code').d('编码'),
    },
    {
      name: 'name',
      type: 'intl',
      required: true,
      label: intl.get('spfm.rulesCategory.mdoel.rulesCategory.name').d('名称'),
    },
    {
      name: 'description',
      type: 'string',
      label: intl.get('spfm.rulesCategory.mdoel.rulesCategory.description').d('描述'),
      required: true,
    },
    {
      name: 'type',
      type: 'string',
      required: true,
      label: intl.get('spfm.rulesCategory.mdoel.rulesCategory.type').d('类型'),
    },
    {
      name: 'sort',
      type: 'number',
      label: intl.get('spfm.rulesCategory.mdoel.rulesCategory.sort').d('排序号'),
    },
    // {
    //   name: 'menuList',
    //   type: 'object',
    //   lovCode: 'SPFM.ORGANIZATION_MENU_VIEW',
    //   label: intl.get('spfm.rulesCategory.mdoel.rulesCategory.visibleMenuCodes').d('可用菜单编码'),
    //   multiple: true,
    // },
    {
      name: 'enabledFlag',
      type: 'number',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 1,
      label: intl.get('spfm.rulesCategory.mdoel.rulesCategory.status').d('状态'),
    },
    {
      name: 'visibleMode',
      type: 'string',
      defaultValue: 'BLACK',
      dynamicProps: {
        required: ({ record }) => {
          return record.get('type') === 'menu';
        },
      },
      label: intl.get('spfm.rulesCategory.mdoel.rulesCategory.visibleMode').d('黑白策略'),
    },
  ],
});

export const getBlackListDs = () => ({
  autoQuery: false,
  fields: [
    {
      name: 'tenantObj',
      type: 'object',
      lovCode: 'HPFM.TENANT_ALL',
      required: true,
      label: intl.get('spfm.rulesCategory.mdoel.rulesCategory.tenantName').d('租户名称'),
      ignore: 'always',
    },
    {
      name: 'tenantNum',
      type: 'string',
      required: true,
      bind: 'tenantObj.tenantNum',
      label: intl.get('spfm.rulesCategory.mdoel.rulesCategory.tenantNum').d('租户编码'),
    },
    {
      name: 'tenantNumMeaning',
      type: 'string',
      bind: 'tenantObj.tenantName',
      label: intl.get('spfm.rulesCategory.mdoel.rulesCategory.tenantName').d('租户名称'),
      required: true,
    },
    {
      name: 'code',
      type: 'string',
      required: true,
    },
  ],
  transport: {
    read: () => {
      return {
        url: `${SRM_PLATFORM}/v1/rel-table-records/cnf_menu_disable/page`,
        method: 'POST',
      };
    },
    create: ({ data }) => {
      return {
        url: `${SRM_PLATFORM}/v1/rel-table-records/cnf_menu_disable`,
        method: 'POST',
        data: data[0],
      };
    },
    destroy: ({ data }) => {
      return {
        url:
          data.length > 1
            ? `${SRM_PLATFORM}/v1/rel-table-records/cnf_menu_disable/batch/remove`
            : `${SRM_PLATFORM}/v1/rel-table-records/cnf_menu_disable`,
        method: 'DELETE',
        data: data.length > 1 ? data : data[0],
      };
    },
  },
});

export const getMultiLanguageDs = () => ({
  autoQuery: false,
  fields: [
    {
      name: 'zh_CN',
      type: 'string',
      label: '简体中文',
    },
    {
      name: 'en_US',
      type: 'string',
      label: 'English',
    },
    {
      name: 'ja_JP',
      type: 'string',
      label: '日本語',
    },
    {
      name: 'ru_RU',
      type: 'string',
      label: 'Русский',
    },
  ],
});
