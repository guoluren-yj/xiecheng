import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import { SMALL_ORDER } from '_utils/config';
import intl from 'utils/intl';

import { queryBatchApprovaFlag, queryBatchSimpleApprovalHistory } from '_utils/utils';

const organizationId = getCurrentOrganizationId();

const tableDs = () => ({
  autoQuery: false,
  pageSize: 20,
  cachedSelected: true,
  primaryKey: 'afterSaleCode',
  fields: [
    {
      label: intl.get('smodr.afterSaleManage.model.manageStatusName').d('售后状态'),
      type: 'string',
      name: 'afterSaleStatusMeaning',
    },
    {
      label: intl.get('smodr.afterSaleManage.model.options').d('操作'),
      type: 'string',
      name: 'options',
    },
    {
      label: intl.get('smodr.afterSaleManage.model.afSaleNum').d('售后申请单号'),
      type: 'string',
      name: 'afterSaleCode',
    },
    {
      label: intl.get('smodr.afterSaleManage.model.mallPoNumNew').d('商城订单编号-行号'),
      type: 'string',
      name: 'orderCodeLineNum',
    },
    {
      name: 'srmOrderCode',
      type: 'string',
      label: intl.get('smodr.afterSaleManage.model.malSrmNum').d('采购订单号'),
    },
    {
      name: 'cecAfterSaleCode',
      type: 'string',
      label: intl.get('smodr.afterSaleManage.model.cecAfterSaleCode').d('电商售后单号'),
    },
    {
      name: 'ecConsignmentCode',
      type: 'string',
      label: intl.get('smodr.afterSaleManage.model.ecConsignmentCode').d('电商子订单号'),
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
      label: intl.get('smodr.afterSaleManage.model.afsForApplyQuantity').d('申请数量'),
      type: 'number',
      name: 'quantity',
    },
    {
      label: intl.get('smodr.afterSaleManage.model.afterSaleTypeMeaning').d('售后类型'),
      type: 'string',
      name: 'afterSaleTypeMeaning',
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
      label: intl.get('smodr.afterSaleManage.model.realName').d('申请人'),
      type: 'string',
      name: 'ownerName',
    },
    {
      label: intl.get('smodr.afterSaleManage.model.applicationTime').d('申请时间'),
      type: 'dateTime',
      name: 'applyTime',
    },
  ],
  transport: {
    read: ({ data }) => {
      const { filterParams, ...rest } = data;
      return {
        url: `${SMALL_ORDER}/v1/${organizationId}/aftersales/purchase-list`,
        method: 'GET',
        data: {
          ...filterParams,
          ...rest,
          customizeUnitCode: 'SMODR.AFTERSALE_PURCHASE.SELECT',
        },
      };
    },
  },
  events: {
    load: async ({dataSet}) => {
      const keys = dataSet.reduce((pre, record) => {
        const { approveType, afterSaleCode } = record.get(["approveType", "afterSaleCode"]);
        if(approveType === 'WORKFLOW_APPROVAL') {
          pre.push(afterSaleCode);
        }
        return pre;
      }, []);
      if (keys.length > 0) {
        // 查询是否可以审批businessKey的对象
        const map = getResponse(await queryBatchApprovaFlag(keys));
        // 查询简易审批进度
        const historyMap = getResponse(await queryBatchSimpleApprovalHistory(keys));
        dataSet.forEach(r => {
          const _businessKey = r.get('afterSaleCode');
          r.init({
            wflApproveFlag: Number(!!map[_businessKey]),
            ...(map[_businessKey] || {}),
            simpleApprovalHistory: historyMap[_businessKey] || [],
          });
        });
      }
    },
  },
});

export { tableDs };
