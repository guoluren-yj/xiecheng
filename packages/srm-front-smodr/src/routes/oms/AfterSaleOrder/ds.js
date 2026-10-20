import intl from 'utils/intl';
import { SMALL_ORDER } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const productDs = () => ({
  selection: false,
  paging: false,
  fields: [
    {
      name: 'entryCode',
      type: 'string',
      label: intl.get('smodr.afterSaleOrder.model.proEntryCode').d('行号'),
    },
    {
      name: 'skuCode',
      type: 'string',
      label: intl.get('smodr.afterSaleOrder.model.skuCode').d('商品编码'),
    },
    {
      name: 'skuName',
      type: 'string',
      label: intl.get('smodr.afterSaleOrder.model.skuName').d('商品名称'),
    },
    {
      name: 'skuTypeMeaning',
      type: 'string',
      label: intl.get('smodr.afterSaleOrder.model.skuTypeMeaning').d('商品类型'),
    },
    {
      name: 'applyQuantityMeaning',
      type: 'string',
      label: intl.get('smodr.afterSaleManage.model.afsForApplyQuantity').d('申请数量'),
    },
    // {
    //   name: 'returnReasonMeaning',
    //   type: 'string',
    //   label: intl.get('smodr.afterSaleOrder.model.reason').d('售后原因'),
    // },
    // {
    //   name: 'reason',
    //   type: 'string',
    //   label: intl.get('smodr.afterSaleOrder.model.problem').d('问题描述'),
    // },
  ],
  // transport: {
  //   read({ data }) {
  //     return {
  //       url: `${SMALL_ORDER}/v1/${organizationId}/aftersales/detail`,
  //       method: 'GET',
  //       data: { ...data },
  //       transformResponse: (result) => {
  //         const res = JSON.parse(result);
  //         const { afterSaleEntryList = [] } = res;
  //         afterSaleEntryList.
  //         return list;
  //       },
  //     };
  //   },
  // },
});

export { productDs };
