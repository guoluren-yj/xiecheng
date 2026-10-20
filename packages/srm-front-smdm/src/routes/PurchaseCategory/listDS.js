/*
 * @Description: 采购品类列表数据源
 * @Date: 2025-10-13 10:34:49
 * @Author: MYT<yitian.mao@going-link.com>
 * @Version: 1.0.0
 * @Copyright: Copyright (c) 2021, ZhenYun
 */
import intl from 'utils/intl';
import { SRM_MDM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

export default function ListDS() {
  return {
    autoQuery: false,
    paging: 'server',
    idField: 'categoryId',
    parentField: 'parentCategoryId',
    primaryKey: 'categoryId',
    pageSize: 20,
    treeAsync: true,
    fields: [
      {
        label: intl.get('smdm.purchaseCategory.model.category.categoryCode').d('品类代码'),
        name: 'categoryCode',
      },
      {
        label: intl.get('smdm.common.model.project.companyName').d('公司'),
        name: 'companyName',
      },
      {
        label: intl.get('smdm.purchaseCategory.model.category.categoryName').d('品类名称'),
        name: 'categoryName',
      },
      {
        label: intl.get('smdm.purchaseCategory.model.category.ouName').d('业务实体'),
        name: 'ouName',
      },
      {
        label: intl.get('smdm.purchaseCategory.model.category.uomName').d('计量单位'),
        name: 'uomName',
      },
      {
        label: intl.get('smdm.paymentTerms.model.excessDeliveryFlag').d('允许超量送货'),
        name: 'excessDeliveryFlag',
      },
      {
        label: intl.get('hzero.common.status').d('状态'),
        name: 'enabledFlag',
      },
      {
        label: intl.get('smdm.purchaseCategory.model.category.impStandardMeaning').d('引入要求'),
        name: 'impStandardMeaning',
      },
      {
        label: intl.get('smdm.common.model.common.externalSystemCode').d('来源系统'),
        name: 'externalSystemCode',
      },
      {
        label: intl.get('smdm.purchaseCategory.model.category.assignAttribute').d('分配属性'),
        name: 'templateName',
      },
      {
        label: intl.get('smdm.purchaseCategory.model.category.rateTypeName').d('下级品类'),
        name: 'rateTypeName',
      },
      {
        label: intl.get('smdm.purchaseCategory.view.message.materiel').d('分类物料'),
        name: 'materiel',
      },
      {
        label: intl.get('smdm.purchaseCategory.view.message.assignBuyer').d('分配采购员'),
        name: 'assignPurchaser',
      },
      {
        label: intl.get('hzero.common.button.action').d('操作'),
        name: 'operator',
      },
    ],
    transport: {
      read: ({ data, params }) => {
        const { queryParams, ...other } = data;
        const { sort = 'categoryCode,asc' } = params;
        return {
          url: `${SRM_MDM}/v1/${organizationId}/item-categories/list-page`,
          method: 'GET',
          data: {
            customizeUnitCode:
              'SMDM.PURCHASE_CATEGORY_LIST.GRID,SMDM.PURCHASE_CATEGORY_LIST.EDIT,SMDM.PURCHASE_CATEGORY_LIST.SEARCH',
            ...queryParams,
            ...other,
            categoryCodeSortFlag: sort.includes('asc') ? 1 : 0,
          },
        };
      },
    },
  };
}
