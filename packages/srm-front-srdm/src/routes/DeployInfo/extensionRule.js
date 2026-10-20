/**
 * @Description: 页面组件功能扩展配置模板
 * configRule()函数用于对页面元素的属性扩展，支持对应key所属组件的全部属性扩展，在该函数中可以获取当前页面this作用域，既该函数执行在render生命周期
 * xxxKey.props配置代表对当前key对应的组件进行功能扩展，例如Form表单控件的布局模式等;xxxKey.children配置代表向当前key对应的组件进行插入子组件
 * xxxDsConfig()函数用于对某个dataSet数据源的扩展配置，这个函数会根据页面中dataSet的数量存在多个
 * Eg: formDsConfig(),tableDsConfig(),...，这个函数的参数可以获取默认的dataSet配置，因此可以进行扩展、覆盖、删除配置等操作
 * 如不需要扩展，请勿随意删除函数定义。
 */
export function configRule() {
  /* Return JSON:
    Button_1a2b3c: {
      props: {
        style: { backgroundColor: 'gray' },
        disable: this.state.status === "CREATE",
      },
    },
  */
  return {};
}
export function deployInfoDSConfig(dataSetConfig) {
  return dataSetConfig;
}
