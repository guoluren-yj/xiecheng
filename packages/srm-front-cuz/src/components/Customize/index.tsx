/**
 * 个性化组件
 * @date: 2019-12-15
 * @version: 0.0.1
 * @author: zhaotong <tong.zhao@hand-china.com>
 * @copyright Copyright (c) 2019, Hands
 */

import React, { cloneElement, ReactNode } from 'react';
import { Row, Col } from 'hzero-ui';
import { isArray, isEmpty } from 'lodash';
import bind from 'lodash/bind';
import { Bind } from 'lodash-decorators';
import { getResponse } from 'hzero-front/lib/utils/utils';
import { queryUnitCustConfigPost, coverConfig, getFieldValueObject } from './customizeTool';
import { generateFilterForm } from './customizeGenerate';
import { UnitConfig } from './interfaces';
import customizeForm from './custX/custForm';
import customizeTable from './custX/custTable';
import { transformFieldCondition } from '../../Customize';
import { uiQueryError } from '../../common';

interface DecoratorProps {
  unitCode: string[];
  query: any;
  manualQuery: boolean;
  // {[unitCode]: ['attribute1', 'attribute2']}
  // 临时方案，对特定的扩展字段添加queryUsePost: true属性，影响多选lov
  usePostMap: any;
}

export default function withCustomize(decoratorProps: DecoratorProps) {
  const { unitCode = [], query, manualQuery = false, usePostMap } = decoratorProps || {};
  return (Component) => {
    // eslint-disable-next-line react/no-redundant-should-component-update
    class WrapIndividual extends React.PureComponent<any> {
      state: {
        configModel: { [unitcode: string]: UnitConfig };
        loading: boolean;
        cache: any;
      };

      cacheKeyMap = {};

      constructor(props, ...args) {
        // @ts-ignore
        super(props, ...args);
        this.state = {
          configModel: {},
          loading: true,
          cache: {},
        };
      }

      componentDidMount() {
        if (manualQuery) {
          return;
        }
        this.queryUnitConfig();
      }

      @Bind()
      queryUnitConfig(params = query, fn?: Function) {
        if (unitCode && isArray(unitCode) && unitCode.length > 0) {
          queryUnitCustConfigPost(unitCode, params, uiQueryError)
            .then((res) => {
              // eslint-disable-next-line no-unused-expressions
              typeof fn === 'function' && fn(res);
              if (getResponse(res)) {
                Object.keys(res).forEach((code) => {
                  const unitConfig = res[code];
                  if (!unitConfig) return;
                  const { unitType, maxCol = 3 } = unitConfig;
                  if (unitType === 'FORM' || unitType === 'QUERYFORM') {
                    unitConfig.fields.sort(
                      (before, after) =>
                        (before.formRow || 0) * maxCol +
                        before.formCol -
                        (after.formRow || 0) * maxCol -
                        after.formCol
                    );
                  } else {
                    unitConfig.fields.sort((before, after) => (before.seq || 0) - (after.seq || 0));
                  }
                  // 屏蔽旧版的默认值公式配置
                  unitConfig.fields.forEach((field) => {
                    if (field.proDefaultFlag) {
                      // eslint-disable-next-line no-param-reassign
                      field.defaultValue = undefined;
                    }
                    transformFieldCondition(field);
                  });
                });
                if (usePostMap) {
                  Object.keys(usePostMap).forEach((code) => {
                    const unitConfig = res[code];
                    if (!unitConfig) return;
                    const usePostList = usePostMap[code];
                    unitConfig.fields = unitConfig.fields.map((field) =>
                      usePostList.includes(field.fieldCode)
                        ? {
                            ...field,
                            queryUsePost: true,
                          }
                        : field
                    );
                  });
                }
                this.setState({
                  configModel: res,
                });
              }
            })
            .finally(() => {
              this.setState({ loading: false });
            });
        } else {
          this.setState({ loading: false });
        }
        // 每一次查询单元配置，便会重置window变量下的缓存对象，目前用于优化下拉框频繁调用查询接口，c7n暂时不需要
        (window as any).CUSTOMIZECACHE = {};
      }

      customizeForm = bind(customizeForm, this);

      customizeTable = bind(customizeTable, this);

      @Bind()
      customizeFilterForm(options: any = {}, formComponent) {
        const { code, form, expand } = options;
        const { configModel: config, loading } = this.state;
        if (loading) return null;
        if (!code || isEmpty(config[code])) return formComponent;
        const { unitAlias = [] } = config[code];
        const unitData = getFieldValueObject(unitAlias, this.getCache, code); // 获取当前单元的关联单元数据
        return filterFormCompatible(formComponent, config[code], {
          form,
          expand,
          unitData,
          code,
          getValueFromCache: this.getValueFromCache,
        });
      }

      @Bind()
      customizeCollapse(options: any = {}, collapse) {
        const { code } = options;
        const { configModel: config, loading } = this.state;
        if (loading) return null;
        if (!code || isEmpty(config[code])) return collapse;
        const { fields = [] } = config[code];
        fields.sort((p, n) => (p.seq === undefined || n.seq === undefined ? -1 : p.seq - n.seq));
        const childrenMap = {};
        const newChildren: Array<ReactNode> = [];
        const refTabs = collapse;
        const newProps: any = {};
        const refChildren = refTabs.props.children;
        if (isArray(refChildren)) {
          refChildren.forEach((i) => {
            // 适配部分使用JSX，另一部分使用数组的情况
            if (isArray(i)) {
              i.forEach((j) => {
                if (j && j.props && j.key !== undefined) {
                  childrenMap[j.key] = j;
                }
              });
            } else if (i && i.props && i.key !== undefined) {
              childrenMap[i.key] = i;
            }
          });
        } else if (refChildren && refChildren.props && refChildren.key) {
          childrenMap[refChildren.key] = refChildren;
        }
        const defaultActive: string[] = [];
        const originDefaultActive: string[] = [...(refTabs.props.defaultActiveKey || [])];
        fields.forEach((field) => {
          if (
            field.defaultActive === 1 ||
            (field.defaultActive === -1 && originDefaultActive.includes(field.fieldCode))
          ) {
            defaultActive.push(field.fieldCode);
          }
        });
        newProps.defaultActiveKey = defaultActive;
        fields.forEach((i) => {
          const { fieldName, fieldCode, conditionHeaderDTOs } = i;
          const { visible } = coverConfig({ visible: i.visible }, conditionHeaderDTOs, {
            getValueFromCache: this.getValueFromCache,
          });
          const targetPane = childrenMap[fieldCode];
          if (!targetPane) return;
          const paneProps: any = {};
          if (targetPane.props) {
            const oldHeader = targetPane.props.header;
            if (typeof oldHeader === 'function') {
              paneProps.header = oldHeader(fieldName);
            } else if (fieldName !== undefined) {
              paneProps.header = <h3>{fieldName}</h3>;
            }
          }
          if (visible !== 0) {
            newChildren.push(cloneElement(targetPane, paneProps));
          }
          delete childrenMap[fieldCode];
        });
        Object.keys(childrenMap).forEach((i) => newChildren.push(childrenMap[i]));
        newProps.children = newChildren;
        return cloneElement(collapse, newProps);
      }

      @Bind()
      customizeTabPane(options: any = {}, tabs) {
        const { code } = options;
        const { configModel: config, loading } = this.state;
        if (loading) return null;
        if (!code || isEmpty(config[code])) return tabs;
        const { fields = [] } = config[code];
        fields.sort((p, n) => (p.seq === undefined || n.seq === undefined ? -1 : p.seq - n.seq));
        const childrenMap = {};
        const newChildren: Array<ReactNode> = [];
        const refTabs = tabs;
        const newProps: any = {};
        const refChildren = refTabs.props.children;
        if (isArray(refChildren)) {
          refChildren.forEach((i) => {
            // 适配部分使用JSX，另一部分使用数组的情况
            if (isArray(i)) {
              i.forEach((j) => {
                if (j && j.props && j.key !== undefined) {
                  childrenMap[j.key] = j;
                }
              });
            } else if (i && i.props && i.key !== undefined) {
              childrenMap[i.key] = i;
            }
          });
        } else if (refChildren && refChildren.props && refChildren.key) {
          childrenMap[refChildren.key] = refChildren;
        }
        const defaultActive = fields.find((field) => field.defaultActive === 1);
        if (defaultActive) {
          newProps.defaultActiveKey = defaultActive.fieldCode;
        }
        fields.forEach((i) => {
          const { fieldName, fieldCode, conditionHeaderDTOs } = i;
          const { visible } = coverConfig({ visible: i.visible }, conditionHeaderDTOs, {
            getValueFromCache: this.getValueFromCache,
          });
          const targetPane = childrenMap[fieldCode];
          if (!targetPane) return;
          const paneProps: any = {};
          if (fieldName !== undefined && targetPane.props) {
            paneProps.tab = fieldName;
          }
          if (visible !== 0) {
            newChildren.push(cloneElement(targetPane, paneProps));
          }
          delete childrenMap[fieldCode];
        });
        Object.keys(childrenMap).forEach((i) => newChildren.push(childrenMap[i]));
        newProps.children = newChildren;
        return cloneElement(tabs, newProps);
      }

      @Bind()
      getCache(code) {
        return this.state.cache[code] || {};
      }

      @Bind()
      getValueFromCache(uCode, fieldCode) {
        const { cache } = this.state;
        const cacheKey = this.cacheKeyMap[uCode] || uCode;
        if (!cache[cacheKey]) return {};
        const { form, dataSource = {} } = cache[cacheKey];
        const allValue = {
          ...dataSource,
          ...(form ? form.getFieldsValue() : {}),
        };
        return allValue[fieldCode];
      }

      @Bind()
      clearProperties(arg: string | Function, args = []) {
        if (arg && typeof arg === 'string') {
          this.setState({
            cache: { ...this.state.cache, [arg]: {} },
          });
        } else if (typeof arg === 'function') {
          if (!arg.prototype) throw new Error('callback can not be a arrow function!');
          arg.call(this, ...args);
        }
      }

      render() {
        const newProps = {
          ...this.props,
          customizeForm: this.customizeForm,
          customizeTable: this.customizeTable,
          customizeFilterForm: this.customizeFilterForm,
          customizeTabPane: this.customizeTabPane,
          customizeCollapse: this.customizeCollapse,
          queryUnitConfig: this.queryUnitConfig,
          clearProperties: this.clearProperties,
          custLoading: this.state.loading, // 解决页面偶尔不刷新的问题
        };

        return <Component {...newProps} ref={this.props.forwardRef} />;
      }
    }

    return React.forwardRef((props, ref) => <WrapIndividual {...props} forwardRef={ref} />);
  };
}

function filterFormCompatible(
  formComponent,
  config: UnitConfig = {},
  { expand = false, form, unitData, getValueFromCache, code }
) {
  const {
    maxCol = 3,
    fields,
    labelCol: unitLabelCol = 10,
    wrapperCol: unitWrapperCol = 14,
  } = config;
  const {
    props: { children: wrapRow },
  } = formComponent;
  const filter = wrapRow.props ? wrapRow.props.children : [];
  if (filter.length < 2) return formComponent;
  if (
    !filter[0].props ||
    !filter[1].props ||
    !filter[0].props.children ||
    !filter[1].props.children ||
    !(filter[1].props.children.props || {}).children
  ) {
    return formComponent;
  }
  const fieldRows = isArray(filter[0].props.children)
    ? [...filter[0].props.children]
    : [filter[0].props.children];
  const controller = filter[1].props.children;
  const formItemObj = {};
  const order = [];
  fieldRows.forEach(({ props }) => {
    traversalFilterForm(props.children, formItemObj, order);
  });
  const newFormItem = generateFilterForm(formItemObj, fields, {
    form,
    unitLabelCol,
    unitWrapperCol,
    unitData,
    code,
    getValueFromCache,
  });
  fieldRows[0] = [];
  if (newFormItem.length > maxCol) {
    fieldRows[1] = [];
  } else {
    [filter[0].props.children] = fieldRows;
    controller.props.children = (controller.props.children || []).slice(1);
  }
  newFormItem.forEach((i, index) => {
    let target = -1;
    if (index > 2) {
      target = 1;
    } else {
      target = 0;
    }
    fieldRows[target].push(<Col span={Math.floor(24 / maxCol)}>{i}</Col>);
  });
  return cloneElement(formComponent, {
    children: [
      cloneElement(wrapRow, {
        children: [
          cloneElement(filter[0], {
            children: [
              <Row>{fieldRows[0]}</Row>,
              <Row style={{ display: expand ? 'block' : 'none' }}>{fieldRows[1]}</Row>,
            ],
          }),
          cloneElement(filter[1]),
        ],
      }),
    ],
  });
}

function traversalFilterForm(reactElement, formObj = {}, order: string[] = []) {
  if (!reactElement) return;
  if (isArray(reactElement)) {
    reactElement.forEach((i) => traversalFilterForm(i, formObj, order));
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
    formObj[fieldCode] = singleFormItem;
    order.push(fieldCode);
  }
}