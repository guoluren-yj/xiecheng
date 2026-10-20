### 字段属性组件开发规范

#### 子组件命名规范
开发的字段组件名称和此路径
`packages/hzero-front-hmde/src/businessComponents/icon-picker/enums.ts`
下的枚举对象中的 componentName 保持一致 
如下一个完整的枚举对象：
```js
    {
        title: '日期时间选择框',
        value: 'DATETIME_SELECTION_BOX',
        iconName: 'dateTimeSelectionBox.svg',
        componentName: 'CommonField', // 字段属性组件和此名称保持一致
        key: 'DATETIME_SELECTION_BOX',
        description: '允许用户选择开启/关闭，对应值为true/false',
        exampleIconName: 'shili-time@2X.png',
        style: {
          height: 372,
          width: '100%',
        },
      },
```
#### 子组件暴露给父组件的api写法规范
```js
 useImperativeHandle(props?.childrenComRef, () => ({
    radioDs, // 暴露出去的ds名称: 组件名称+Ds
  }));
```
***注意事项：别把逻辑写到useImperativeHandle回调内***

错误❌示例：
```js
 useImperativeHandle(props?.childrenComRef, () => ({
    attributeJson: {
      // 传给后端数据库中不存在的字段信息
      readOnly: selectDs.current?.get('readOnly'),
      help: selectDs.current?.get('help'),
      returnType: selectDs.current?.get('returnType'),
      paiXu: selectDs.current?.get('paiXu'),
      valueList: selectDs.current?.get('valueList'),
    },
  }));
```

正确✅示例：
```js
// 维护需要暴露给父组件的api 一般是ds
  useImperativeHandle(props?.childrenComRef, () => ({
    selectDs, // 务必维护和组件名称一致后缀加Ds 方便父组件调用
    getAttributeJson,
  }));

  // 获取后端数据库中不存在的字段属性
  const getAttributeJson = () => {
    return {
      // 传给后端数据库中不存在的字段信息
      readOnly: selectDs.current?.get('readOnly'),
      help: selectDs.current?.get('help'),
      returnType: selectDs.current?.get('returnType'),
      paiXu: selectDs.current?.get('paiXu'),
      valueList: selectDs.current?.get('valueList'),
    };
  };
```

示例 FieldComponents/`select`.tsx 组件