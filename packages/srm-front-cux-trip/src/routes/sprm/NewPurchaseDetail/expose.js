import { Expose } from 'utils/remote';

export default new Expose({
  process: {
    SPRM_PRDETAIL_REMOTE_PROCESS_HEADER_DS_CONFIG: (sourceConfig) => {
      return {
        ...(sourceConfig || {}),
        fields: [
          ...(sourceConfig?.fields || []),
          {
            label: '采购项目品类',
            name: 'categoryId',
            type: 'object',
            ignore: 'always',
            lovCode: 'SMDM.CATEGORY.LEVEL_CONTROL_TREE',
            optionsProps: {
              paging: 'server',
              idField: 'categoryId',
              parentField: 'parentCategoryId',
              record: {
                dynamicProps: {
                  selectable: (record) => record.get('isCheck') !== false,
                },
              },
            },
            transformRequest: (value) => value && value.categoryId,
            transformResponse: (value, data) => {
              return value ? {
                categoryId: value,
                categoryName: data?.categoryName,
              } : null;
            },
          },
        ],
      };
    },
  },
});