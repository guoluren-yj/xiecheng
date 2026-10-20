## 滚动列表组件

### 调用方式
```
 <List
  dataSet={tableDs}
  stateFiled="enabled"
  stateRender={enabledRender}
  content={[
    {
      name: "loginName",
    },
    {
      name: 'realName',
    },
    {
      name: 'userTypeMeaning',
    },
  ]}
  renderSearchForm={renderSearchForm}
  onChange={handleClickListItem}
/>
```

### 参数说明
- dataSet 数据源
- stateFiled 状态标识
- stateRender 自定义状态渲染
- content 列表item显示字段
- renderSearchForm 条件删除框
- onChange 列表item选中时的回调
- autoLoadMore 自动触发或手动触发加载下一页
