import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

const SRM_AGM = '/sagm';
const organizationId = getCurrentOrganizationId();

const productTransferDs = (params = {}) => {
  const { agreementLineId } = params;
  return {
    autoQuery: true,
    pageSize: 20,
    primaryKey: 'skuId',
    queryFields: [
      {
        name: 'skuName',
        label: intl.get('sagm.common.model.product').d('商品'),
      },
      {
        name: 'category',
        type: 'object',
        label: intl.get('sagm.common.model.platformCategory').d('平台分类'),
        lovCode: 'SMPC.CATEGORY',
        valueField: 'categoryId',
        textField: 'categoryCodeName',
        lovPara: {
          tenantId: organizationId,
        },
        ignore: 'always',
      },
      {
        name: 'categoryId',
        bind: 'category.categoryId',
      },
    ],
    fields: [
      {
        name: 'skuCode',
        label: intl.get('small.common.model.productNum').d('商品编码'),
      },
      {
        name: 'skuName',
        label: intl.get('small.common.model.productName').d('商品名称'),
      },
      {
        name: 'categoryName',
        label: intl.get('small.common.model.platformCategory').d('平台分类'),
      },
    ],
    transport: {
      read({ data }) {
        return {
          url: `${SRM_AGM}/v1/${organizationId}/agreement-details/${agreementLineId}/off-line`,
          method: 'GET',
          data: { ...data, ...params },
        };
      },
    },
  };
};

const historyProductDs = (params = {}) => {
  const { agreementLineId } = params;
  return {
    autoQuery: true,
    selection: false,
    queryFields: [
      {
        name: 'skuName',
        label: intl.get('sagm.common.model.product').d('商品'),
      },
      {
        name: 'category',
        type: 'object',
        label: intl.get('sagm.common.model.platformCategory').d('平台分类'),
        lovCode: 'SMPC.CATEGORY',
        valueField: 'categoryId',
        textField: 'categoryCodeName',
        lovPara: {
          tenantId: organizationId,
        },
        ignore: 'always',
      },
      {
        name: 'categoryId',
        bind: 'category.categoryId',
      },
    ],
    fields: [
      {
        name: 'skuCode',
        label: intl.get('small.common.model.productNum').d('商品编码'),
      },
      {
        name: 'skuName',
        label: intl.get('small.common.model.productName').d('商品名称'),
      },
      {
        name: 'categoryName',
        label: intl.get('small.common.model.platformCategory').d('平台分类'),
      },
    ],
    transport: {
      read({ data }) {
        return {
          url: `${SRM_AGM}/v1/${organizationId}/agreement-detail-hiss/${agreementLineId}`,
          method: 'GET',
          data: { ...data, ...params },
        };
      },
    },
  };
};

const productDs = (params = {}) => {
  const { agreementLineId } = params;
  return {
    autoQuery: true,
    selection: false,
    queryFields: [
      {
        name: 'skuName',
        label: intl.get('sagm.common.model.product').d('商品'),
      },
      {
        name: 'category',
        type: 'object',
        label: intl.get('sagm.common.model.platformCategory').d('平台分类'),
        lovCode: 'SMPC.CATEGORY',
        valueField: 'categoryId',
        textField: 'categoryCodeName',
        lovPara: {
          tenantId: organizationId,
        },
        ignore: 'always',
      },
      {
        name: 'categoryId',
        bind: 'category.categoryId',
      },
    ],
    fields: [
      {
        name: 'skuCode',
        label: intl.get('small.common.model.productNum').d('商品编码'),
      },
      {
        name: 'skuName',
        label: intl.get('small.common.model.productName').d('商品名称'),
      },
      {
        name: 'categoryName',
        label: intl.get('small.common.model.platformCategory').d('平台分类'),
      },
    ],
    transport: {
      read({ data }) {
        return {
          url: `${SRM_AGM}/v1/${organizationId}/agreement-details/${agreementLineId}`,
          method: 'GET',
          data: { ...data },
        };
      },
    },
  };
};

export { productTransferDs, historyProductDs, productDs };
