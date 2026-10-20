import { isArray, omit, isEmpty, isNil } from 'lodash';
import generateForm from './generateForm';
import { getFieldValueObject } from '../../customizeTool';

export default function customizeForm(this: any, options: any = {}, formComponent) {
  const {
    code,
    form,
    gutter = 48,
    dataSource,
    dataSourceKey,
    transformDataSource,
    readOnly = false,
    cacheKey = code,
    isCreate = false,
    // dataSourceLoading, // 解决在dataSource查询完成前缓存dataSource的问题
  } = options;
  const { configModel: config, loading, cache } = this.state;
  if (loading) return null;
  if (!code || isEmpty(config[code])) return formComponent;
  const dataSourceLoading = !isCreate && isEmpty(dataSource);
  this.cacheKeyMap[code] = cacheKey;
  if (!cache[code] && !dataSourceLoading) {
    cache[code] = { dataSource, dataSourceKey };
    this.setState({
      cache,
    });
  }
  if (cache[code]) {
    cache[code].form = form;
    cache[code].dataSource = dataSource;
  }
  if (!dataSourceLoading && dataSourceKey !== cache[code].dataSourceKey && form) {
    const oldFormFields = form.getFieldsValue();
    const newFields = {};
    Object.keys(oldFormFields).forEach((field) => {
      if (typeof transformDataSource === 'function') {
        newFields[field] = transformDataSource(field, dataSource[field]);
      }
      newFields[field] = dataSource[field];
    });
    form.setFieldsValue(newFields);
    cache[code].dataSourceKey = dataSourceKey;
  }

  const { unitAlias = [] } = config[code];
  const unitData = getFieldValueObject(unitAlias, this.getCache, code); // 获取当前单元的关联单元数据
  return customizeFormCompatible(formComponent, config[code], {
    form,
    cache: cache[cacheKey],
    code,
    gutter,
    dataSource,
    dataSourceLoading,
    unitData,
    readOnly,
    getValueFromCache: this.getValueFromCache,
  });
}

function customizeFormCompatible(formComponent: any, config, options) {
  const {
    props: { children: rowChildren, className = '' } = { children: undefined },
  } = formComponent;
  const formItemObj = {};
  // eslint-disable-next-line no-param-reassign
  options.className = className;
  if (isArray(rowChildren)) {
    rowChildren.forEach((row, index) => {
      if (!isNil(row) && typeof row === 'object') {
        traversalStandardForm(
          row.props.children,
          formItemObj,
          index,
          0,
          omit(row.props, ['children'])
        );
      }
    });
  } else {
    traversalStandardForm(
      (rowChildren.props || {}).children,
      formItemObj,
      0,
      0,
      omit(rowChildren.props, ['children'])
    );
  }
  return generateForm(formItemObj, config, options);
}

function traversalStandardForm(reactElement, formObj = {}, row, col = 0, rowProps) {
  if (!reactElement) return;
  if (isArray(reactElement)) {
    reactElement.forEach((i, _index) => traversalStandardForm(i, formObj, row, _index, rowProps));
  } else if (reactElement.props.span) {
    const { children: singleFormItem } = reactElement.props;
    let fieldCode;
    if (!singleFormItem || !singleFormItem.props || !singleFormItem.props.children) return;
    const formChildren = singleFormItem.props.children;
    if (isArray(formChildren)) {
      for (let i = 0; i < formChildren.length; i++) {
        if (formChildren[i].props && formChildren[i].props['data-__field'] !== undefined) {
          fieldCode = formChildren[i].props['data-__field'].name;
          break;
        }
      }
    } else if (formChildren.props && formChildren.props['data-__field']) {
      fieldCode = formChildren.props['data-__field'].name;
    }
    // eslint-disable-next-line no-param-reassign
    formObj[fieldCode] = {
      formItem: singleFormItem,
      row: row + 1,
      col: col + 1,
      rowProps,
      colProps: reactElement.props,
    };
  }
}
