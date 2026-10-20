import { getCurrentOrganizationId, getUserOrganizationId } from 'utils/utils';
import { SMALL_ORDER } from '_utils/config';
import intl from 'utils/intl';

const organizationId = getCurrentOrganizationId();
const userOrganizationId = getUserOrganizationId();

const tableDs = () => ({
  autoQuery: false,
  selection: false,
  pageSize: 20,
  fields: [
    {
      label: intl.get('smodr.afterSaleManage.model.afSaleNum').d('售后申请单号'),
      type: 'string',
      name: 'afterSaleCode',
    },
    {
      label: intl.get('smodr.afterSaleManage.model.mallPoNumber').d('商城订单编码'),
      type: 'string',
      name: 'orderCode',
    },
    {
      name: 'srmOrderCode',
      type: 'string',
      label: intl.get('smodr.afterSaleManage.model.malSrmNum').d('采购订单号'),
    },
    {
      label: intl.get('smodr.afterSaleManage.model.manageStatusName').d('售后状态'),
      type: 'string',
      name: 'afterSaleStatusMeaning',
    },
    {
      label: intl.get('smodr.afterSaleManage.model.productNum').d('商品编码'),
      type: 'string',
      name: 'skuCode',
    },
    {
      label: intl.get('smodr.afterSaleManage.model.productName').d('商品名称'),
      type: 'string',
      name: 'skuName',
    },
    {
      label: intl.get('smodr.afterSaleManage.model.quantity').d('数量'),
      type: 'number',
      name: 'quantity',
    },
    {
      label: intl.get('smodr.afterSaleManage.model.afterSaleTypeMeaning').d('售后类型'),
      type: 'string',
      name: 'afterSaleTypeMeaning',
    },
    {
      label: intl.get('smodr.afterSaleManage.model.applicationTime').d('申请时间'),
      type: 'dateTime',
      name: 'applyTime',
    },
    {
      label: intl.get('smodr.afterSaleManage.model.realName').d('申请人'),
      type: 'string',
      name: 'ownerName',
    },
    {
      name: 'purchaseCompanyName',
      type: 'string',
      label: intl.get('smodr.afterSaleManage.model.purchaser').d('采购方'),
    },
    {
      name: 'supplierCompanyName',
      type: 'string',
      label: intl.get('smodr.afterSaleManage.model.supplier').d('供应商'),
    },
    {
      label: intl.get('smodr.afterSaleManage.model.options').d('操作'),
      type: 'string',
      name: 'options',
    },
  ],
  transport: {
    read: ({ data }) => {
      const { filterParams = {}, ...otherParmas } = data;
      const { params = {} } = filterParams;
      return {
        url: `${SMALL_ORDER}/v1/${organizationId}/aftersales/${userOrganizationId}/supplier-list`,
        method: 'GET',
        data: {
          ...params,
          ...otherParmas,
          customizeUnitCode: 'SMODR.AFTERSALE_NEW.SELECT,SMODR.AFTERSALE_NEW.QUERY',
        },
      };
    },
  },
});

const historyDs = () => ({
  selection: false,
  fields: [
    {
      name: 'userName',
      type: 'string',
      label: intl.get('smodr.afterSaleManage.model.operatedName').d('操作人'),
    },
    {
      name: 'operationTime',
      type: 'string',
      label: intl.get('smodr.afterSaleManage.model.creationDate').d('日期时间'),
    },
    {
      name: 'description',
      type: 'string',
      label: intl.get('smodr.afterSaleManage.model.operatedRemark').d('内容'),
    },
    {
      name: 'sourceSystemMeaning',
      type: 'string',
      label: intl.get('smodr.afterSaleManage.model.sourceSystem').d('操作系统'),
    },
  ],
  transport: {
    read({ data }) {
      const { queryParams, ...others } = data;
      return {
        url: `${SMALL_ORDER}/v1/${organizationId}/after-sale-records`,
        method: 'GET',
        data: { ...queryParams, ...others },
      };
    },
  },
});

export { tableDs, historyDs };
