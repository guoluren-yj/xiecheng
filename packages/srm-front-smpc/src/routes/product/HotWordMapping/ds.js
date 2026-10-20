import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SMPC } from '_utils/config';

const organizationId = getCurrentOrganizationId();

const commonField = {
  CATEGORY: (filedProps = {}) => [
    {
      label: intl.get('smpc.product.model.platformCategory').d('平台分类'),
      name: 'categoryLov',
      type: 'object',
      textField: 'categoryName',
      valueField: 'categoryId',
      ignore: 'always',
      required: true,
      lovPara: { tenantId: organizationId },
      ...filedProps,
    },
    {
      name: 'categoryId',
      bind: 'categoryLov.categoryId',
    },
    {
      name: 'categoryName',
      type: 'string',
      bind: 'categoryLov.categoryName',
    },
    // {
    //   name: 'categoryPath',
    //   bind: 'categoryLov.categoryPath',
    // },
  ],
  CATALOG: (filedProps = {}) => [
    {
      label: intl.get('smpc.product.model.mallCatalog').d('商城目录'),
      name: 'catalogLov',
      type: 'object',
      textField: 'catalogName',
      valueField: 'catalogId',
      ignore: 'always',
      required: true,
      lovPara: { tenantId: organizationId },
      ...filedProps,
    },
    {
      name: 'catalogId',
      bind: 'catalogLov.catalogId',
    },
    {
      name: 'catalogName',
      bind: 'catalogLov.catalogName',
    },
  ],
};

const fieldMap = {
  CATEGORY: {
    LovName: 'categoryLov',
    textField: 'categoryName',
    valueField: 'categoryId',
  },
  CATALOG: {
    LovName: 'catalogLov',
    textField: 'catalogName',
    valueField: 'categoryName',
  },
};

const listDS = ({ queryParams = {} }) => ({
  pageSize: 20,
  autoQuery: false,
  primaryKey: 'hotWordMappingId',
  cacheSelection: true,
  fields: [
    {
      label: intl.get('smpc.hotWordMapping.model.hotWord').d('搜索热词'),
      name: 'hotWord',
    },
    {
      label: intl.get('smpc.product.view.categoryCode').d('分类编码'),
      name: 'categoryCode',
    },
    {
      label: intl.get('smpc.product.view.categoryName').d('分类名称'),
      name: 'categoryName',
    },
    {
      label: intl.get('smpc.product.model.catalogCode').d('目录编码'),
      name: 'catalogCode',
    },
    {
      label: intl.get('smpc.product.model.catalogName').d('目录名称'),
      name: 'catalogName',
    },
    {
      label: intl.get('smpc.hotWordMapping.view.dateSource').d('数据来源'),
      name: 'creationTypeMeaningField',
    },
    {
      label: intl.get('smpc.product.view.createByName').d('创建人'),
      name: 'realName',
    },
    {
      name: 'option',
      label: intl.get('hzero.common.action').d('操作'),
    },
  ],
  transport: {
    read({ data }) {
      return {
        url: `${SRM_SMPC}/v1/${organizationId}/hot-word-mappings`,
        method: 'GET',
        data: { ...data, ...queryParams },
      };
    },
    destroy: ({ data }) => {
      return {
        url: `${SRM_SMPC}/v1/${organizationId}/hot-word-mappings`,
        method: 'DELETE',
        data,
      };
    },
  },
});

const editDS = (tabKey) => {
  return {
    autoCreate: true,
    fields: [
      {
        label: intl.get('smpc.hotWordMapping.model.hotWord').d('搜索热词'),
        name: 'hotWord',
        required: true,
        maxLength: 200,
      },
      ...commonField[tabKey](),
    ].filter((f) => f.show !== false),
  };
};

export { listDS, editDS, commonField, fieldMap };
