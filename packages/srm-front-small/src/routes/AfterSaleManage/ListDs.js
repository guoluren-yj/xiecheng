import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_MALL } from '_utils/config';
import intl from 'utils/intl';

const organizationId = getCurrentOrganizationId();

const tableDs = () => ({
  autoQuery: false,
  selection: false,
  queryFields: [
    {
      name: 'afterSaleNum',
      type: 'string',
      label: intl.get('small.afterSaleManage.model.afterSaleNum').d('售后申请单号'),
    },
    {
      name: 'poNum',
      type: 'string',
      label: intl.get('small.afterSaleManage.model.mallPoNum').d('商城订单号'),
    },
    {
      name: 'productNum',
      type: 'string',
      label: intl.get('small.afterSaleManage.model.productNum').d('商品编码'),
    },
    {
      name: 'productName',
      type: 'string',
      label: intl.get('small.afterSaleManage.model.productName').d('商品名称'),
    },
    {
      name: 'afsType',
      type: 'string',
      label: intl.get('small.afterSaleManage.model.afsType').d('服务类型'),
      lookupCode: 'SMAL.AFTER_SALE_TYPE',
    },
    {
      name: 'manageAfterSaleStatus',
      type: 'string',
      label: intl.get('small.afterSaleManage.model.manageAfterSaleStatus').d('售后状态'),
      lookupCode: 'SMAL.MANAGE_AFTER_SALE_STATUS',
    },
    {
      name: 'realName',
      type: 'string',
      label: intl.get('small.afterSaleManage.model.realName').d('申请人'),
    },
    {
      name: 'beginTime',
      type: 'dateTime',
      label: intl.get('small.afterSaleManage.model.beginTime').d('开始时间'),
      max: 'endTime',
    },
    {
      name: 'endTime',
      type: 'dateTime',
      label: intl.get('small.afterSaleManage.model.endTime').d('截止时间'),
      min: 'beginTime',
    },
  ],
  fields: [
    {
      label: intl.get('small.afterSaleManage.model.afterSaleNum').d('售后申请单号'),
      type: 'string',
      name: 'afterSaleNum',
    },
    {
      label: intl.get('small.afterSaleManage.model.mallPoNum').d('商城订单号'),
      type: 'string',
      name: 'poNum',
    },
    {
      label: intl.get('small.afterSaleManage.model.productNum').d('商品编码'),
      type: 'string',
      name: 'productNum',
    },
    {
      label: intl.get('small.afterSaleManage.model.productName').d('商品名称'),
      type: 'string',
      name: 'productName',
    },
    {
      label: intl.get('small.afterSaleManage.model.applyQuantity').d('售后数量'),
      type: 'number',
      name: 'applyQuantity',
    },
    {
      label: intl.get('small.afterSaleManage.model.afsTypeName').d('售后类型'),
      type: 'string',
      name: 'afsTypeName',
    },
    {
      label: intl.get('small.afterSaleManage.model.applicationTime').d('申请时间'),
      type: 'string',
      name: 'applicationTime',
    },
    {
      label: intl.get('small.afterSaleManage.model.manageStatusName').d('售后状态'),
      type: 'string',
      name: 'manageStatusName',
    },
    {
      label: intl.get('small.afterSaleManage.model.realName').d('申请人'),
      type: 'string',
      name: 'realName',
    },
    {
      label: intl.get('small.afterSaleManage.model.options').d('操作'),
      type: 'string',
      name: 'options',
    },
  ],
  transport: {
    read: ({ data }) => {
      return {
        url: `${SRM_MALL}/v1/${organizationId}/after-sales/list`,
        method: 'GET',
        data,
      };
    },
  },
});

const historyDs = () => ({
  selection: false,
  fields: [
    {
      name: 'operatedName',
      type: 'string',
      label: intl.get('small.afterSaleManage.model.operatedName').d('操作人'),
    },
    {
      name: 'operatedDate',
      type: 'string',
      label: intl.get('small.afterSaleManage.model.operatedDate').d('时间'),
    },
    {
      name: 'operatedRemark',
      type: 'string',
      label: intl.get('small.afterSaleManage.model.operatedRemark').d('内容'),
    },
  ],
  transport: {
    read() {
      return {
        url: `${SRM_MALL}/v1/${organizationId}/after-sale-records`,
        method: 'GET',
      };
    },
  },
});

export { tableDs, historyDs };
