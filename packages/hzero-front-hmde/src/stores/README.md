- 所有dataSet配置项放在这，在对应页面再进行实例化（new DataSet）

- store的配置项必须写成函数形式，不然多语言会不生效
```
const subTableDS = () => ({
  autoQuery: false,
  autoQueryAfterSubmit: false,
  selection: false,
  paging: false,
  fields: [
    {
      name: 'tableName',
      type: 'string',
      label: intl.get('hiam.tenants.model.title.mainTable').d('主表名称'),
    },
  ],
  transport: {
    read: () => {
      return {
        url: 'xxx',
        method: 'xxx', // FIXME: method必须全大写 GET POST DELETE PUT
      };
    },
  }
});
```
