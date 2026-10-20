// 请求参数dataSet
export const paramEditDS = () => ({
  autoQuery: false,
  fields: [
    {
      name: 'value',
    },
  ],
});

export const executeJsEditDS = () => ({
  autoQuery: false,
  fields: [
    {
      name: 'executeJs',
    },
    {
      name: 'versionLov',
      type: 'object',
      lovCode: 'SMLB.ROBOT_JS_VERSION_VIEW',
      dynamicProps: {
        lovPara: ({ record }) => {
          return {
            uuid: record.get('uuid'),
          };
        },
      },
    },
  ],
});
