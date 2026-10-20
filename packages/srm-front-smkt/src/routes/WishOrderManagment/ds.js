import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
// import { SRM_SAGM, SRM_SMPC } from '_utils/config';

const organizationId = getCurrentOrganizationId();

const wishOrderDs = () => {
  return {
    autoQuery: false,
    pageSize: 20,
    selection: false,
    fields: [
      {
        name: 'primaryMediaPath',
        label: intl.get('smkt.wishOder.modal.primaryMediaPath').d('商品图片'),
      },
      {
        name: 'skuCode',
        label: intl.get('smkt.wishOder.modal.skuCode').d('商品编码'),
      },
      {
        name: 'skuName',
        label: intl.get('smkt.wishOder.modal.skuName').d('商品名称'),
      },
      {
        name: 'catalogName',
        label: intl.get('smkt.wishOder.modal.catalogName').d('商品目录'),
      },
      {
        name: 'proposedPrice',
        label: intl.get('smkt.wishOder.modal.proposedPrice').d('参考价格'),
      },
      {
        name: 'supplierCompanyName',
        label: intl.get('smkt.wishOder.modal.supplierCompanyName').d('供应商'),
      },
      {
        name: 'nums',
        label: intl.get('smkt.wishOder.modal.nums').d('心愿人次'),
      },
    ],
    transport: {
      read: ({ data }) => ({
        url: `/smkt/v1/${organizationId}/wish-orders`,
        method: 'GET',
        data: {
          customizeUnitCode: 'SMKT.WISH_ORDER_MANAGE.SEARCHBAR',
          ...data,
        },
      }),
    },
  };
};

const accountDetailDs = () => {
  return {
    autoQuery: false,
    pageSize: 20,
    selection: false,
    fields: [
      // 用户头像
      {
        name: 'imageUrl',
      },
      // 用户名称
      {
        name: 'realName',
      },
      {
        name: 'creationDate',
      },
    ],
    transport: {
      read: {
        url: `/smkt/v1/${organizationId}/wish-orders/details`,
        method: 'GET',
      },
    },
  };
};

export { wishOrderDs, accountDetailDs };
