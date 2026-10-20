import { DataSet } from 'choerodon-ui/pro/lib';

const formDs = () => ({
  autoCreate: true,
  // 测试数据
  data: [],
  // 测试数据
  fields: [
    {
      name: '1',
      type: 'string',
      options: new DataSet({
        data: [
          {
            businessObjectName: '1',
            businessObjectFieldName: '1',
            businessObjectFieldCode: '1',
          },
        ],
      }),
      textField: 'businessObjectFieldName',
      valueField: 'businessObjectFieldId',
    },
  ],
});

export { formDs };
