import intl from 'utils/intl';
import { SRM_SPUC } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const allDataSet = () => ({
  autoQuery: false,
  // 主键字段名
  primaryKey: 'asnHeaderId',
  // 缓存选中字段 与 primaryKey 同时使用
  cacheSelection: true,
  pageSize: 20,
  queryParameter: {
    unReadMessageFlag: 1,
    customizeUnitCode:
      'SINV.PURCHASER_DELIVERY_LIST.GRID,SINV.PURCHASER_DELIVERY.SEARCH.ALL_SEARCH',
  },
  fields: [
    {
      label: intl.get('hzero.common.status').d('状态'),
      name: 'asnStatusMeaning',
      fixed: 'left',
      width: 90,
    },
    {
      label: intl.get(`sinv.common.model.common.asnNum`).d('送货单号'),
      name: 'asnNum',
      fixed: 'left',
      width: 170,
    },
    {
      label: intl.get(`sinv.common.model.common.cancelStatus`).d('取消状态'),
      name: 'cancelStatusMeaning',
      width: 120,
    },
    {
      label: intl.get(`sinv.common.model.common.asnTypeCode`).d('送货单类型'),
      name: 'asnTypeCodeMeaning',
      width: 120,
    },
    {
      label: intl.get('entity.supplier.tag').d('供应商'),
      name: 'supplierCompanyName',
      width: 180,
    },
    {
      label: intl.get('entity.company.tag').d('公司'),
      name: 'companyName',
      width: 180,
    },
    {
      label: intl.get(`sinv.common.model.common.creationDate`).d('创建日期'),
      name: 'creationDate',
      width: 150,
    },
    {
      label: intl.get(`sinv.common.model.common.shipDate`).d('发货日期'),
      name: 'shipDate',
      width: 150,
    },
    {
      label: intl.get(`sinv.common.model.common.expectedArriveTime`).d('预计到货时间'),
      name: 'expectedArriveDate',
      width: 180,
    },
    {
      label: intl.get(`sinv.common.model.common.organizationName`).d('收货组织'),
      name: 'organizationName',
      width: 150,
    },
    {
      label: intl.get(`sinv.common.model.common.shipToLocationAddress`).d('收货地点'),
      name: 'shipToLocationAddress',
      width: 150,
    },
    {
      label: intl.get(`sinv.common.model.common.actualReceiverName`).d('送达方'),
      name: 'actualReceiverName',
      width: 150,
    },
    {
      label: intl.get(`sinv.common.model.common.purchaseAgentName`).d('采购员'),
      name: 'purchaseAgentName',
      width: 100,
    },
    {
      label: intl.get(`sinv.common.model.common.createByName`).d('创建人'),
      name: 'createByName',
      width: 100,
    },
    {
      label: intl.get(`sinv.purchaserDelivery.model.purchaserDelivery.submitStatus`).d('导入状态'),
      name: 'submitSyncStatusMeaning',
      width: 150,
    },
    {
      label: intl.get(`sinv.deliveryClosed.model.closeSyncResponseMsg`).d('反馈信息'),
      name: 'erpAsnNum',
      width: 150,
    },
    {
      label: intl.get('sinv.common.model.common.operationRecord').d('操作记录'),
      name: 'dataSourceCode',
      width: 100,
    },
    {
      label: intl.get(`sinv.supplierDelivery.model.common.expressNum`).d('物流单号'),
      name: 'expressNum',
      width: 150,
    },
  ],
  transport: {
    // 查询
    read: () => {
      return {
        url: `${SRM_SPUC}/v1/${organizationId}/asn-header/for-purchase`,
        method: 'GET',
      };
    },
  },
});

export { allDataSet };
