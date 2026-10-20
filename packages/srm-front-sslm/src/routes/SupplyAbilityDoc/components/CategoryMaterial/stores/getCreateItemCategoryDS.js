/*
 * @Date: 2024-05-30 13:38:15
 * @author: CDJ <dengji.chen@hand-china.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import intl from 'utils/intl';

export const getItemDs = () => ({
  forceValidate: true,
  fields: [
    {
      name: 'itemLov',
      label: intl.get('sslm.supplyAbility.model.supplyAbility.itemName').d('物料描述'),
      type: 'object',
      lovCode: 'SSLM.RELATED_CATEGORY_ITEM2',
      ignore: 'always',
      multiple: true,
      noCache: true,
    },
    {
      name: 'itemId',
      bind: 'itemLov.itemId',
    },
    {
      name: 'itemCode',
      bind: 'itemLov.itemCode',
    },
    {
      name: 'itemName',
      bind: 'itemLov.itemName',
    },
  ],
});

export const getCategoryDs = () => ({
  forceValidate: true,
  fields: [
    {
      label: intl.get(`sslm.supplyAbility.model.supplyAbility.itemCategory`).d('品类'),
      name: 'itemCategoryLov',
      type: 'object',
      lovCode: 'SSLM.CATEGORY.LEVEL_CONTROL_TREE',
      ignore: 'always',
      multiple: true,
      dynamicProps: {
        lovPara: () => {
          return {
            enabledFlag: 1,
            businessObjectCode: 'SRM_C_SRM_SSLM_SUPPLY_ABILITY',
          };
        },
      },
      optionsProps: {
        paging: 'server',
        idField: 'categoryId',
        parentIdField: 'parentCategoryId',
        record: {
          dynamicProps: {
            selectable: record => record.get('isCheck') !== false,
          },
        },
      },
    },
    {
      name: 'itemCategoryCode',
      bind: 'itemCategoryLov.categoryCode',
    },
    {
      name: 'itemCategoryId',
      bind: 'itemCategoryLov.categoryId',
    },
    {
      name: 'itemCategoryName',
      bind: 'itemCategoryLov.categoryName',
    },
  ],
});
