/*
 * @Date: 2022-06-19 05:17:08
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
const getSupplierClassifyDS = ({ organizationId }) => ({
  dataToJSON: 'selected',
  autoCreate: true,
  fields: [
    {
      name: 'categoryLov',
      type: 'object',
      multiple: true,
      noCache: true,
      lovCode: 'SSLM.INVESTG_SUPP_CATE_TREE',
      lovPara: {
        tenantId: organizationId,
        enabledFlag: 1,
      },
      optionsProps: {
        paging: 'server',
        childrenField: 'children',
        record: {
          dynamicProps: {
            selectable: record => record.get('checkFlag'),
          },
        },
        events: {
          select: ({ dataSet, record }) => {
            const parentCategoryId = record.get('parentCategoryId');
            if (parentCategoryId) {
              const parentRecord = dataSet.find(rec => rec.get('categoryId') === parentCategoryId);
              if (parentRecord) {
                dataSet.select(parentRecord);
              }
            }
          },
        },
      },
    },
  ],
});

export { getSupplierClassifyDS };
