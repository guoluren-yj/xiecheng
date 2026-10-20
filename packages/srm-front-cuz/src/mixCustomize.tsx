import React from 'react';
import { Bind } from 'lodash-decorators';
import bind from 'lodash/bind';
import { observable } from 'mobx';
import { isArray } from 'lodash';
import { Spin } from 'choerodon-ui/pro';
import { getResponse } from 'hzero-front/lib/utils/utils';
import Customize, { transformFieldCondition, transformFixExpDefaultValue } from './Customize';
import { getContext } from './customizeTool';
import { queryUnitCustConfigPost } from './services';
import custC7NForm from './custC7NX/custForm';
import custC7NTable from './custC7NX/custTable';
import custCollapse from './custC7NX/custCollapse';
import custCollapseForm from './custC7NX/custCollapseForm';
import custTabPane from './custC7NX/custTabPane';
import custVTable from './custC7NX/custVTable';
import custFilterForm from './custH0X/custFilterForm';
import customizeForm from './custH0X/custForm';
import customizeTable from './custH0X/custTable';
import custBtnGroup1 from './custC7NX/custBtnGroup';
import custBtnGroup2 from './custH0X/custBtnGroup';
import custDoubleTab from './custC7NX/custDoubleTab';
import { FieldConfig, UnitConfig } from './interfaces';
import { parseUrlParams } from './utils';
import { uiQueryError } from './common';

interface DecoratorProps {
  unitCode: string[];
  query: any;
  manualQuery: boolean;
  c7nUnit: string[];
  // {[unitCode]: ['attribute1', 'attribute2']}
  // 临时方案，对特定的扩展字段添加queryUsePost: true属性，影响多选lov
  usePostMap: any;
}

export default function withCustomize(decoratorProps: DecoratorProps) {
  const { unitCode = [], query, manualQuery = false, usePostMap, c7nUnit = [] } =
    decoratorProps || {};
  return (Com: React.ComponentClass) => {
    class WrapIndividual extends Customize {
      constructor(props, ...args) {
        // @ts-ignore
        super(props, ...args);
        this.state = {
          configModel: {},
          loading: true,
          cache: {},
        };

        const url = props.href ? props.href : window.location.search;
        this.manualQuery = manualQuery;
        this.contextParams = {
          ctx: getContext(),
          url: parseUrlParams(url),
          self: {}, // 自定义参数，留口备用
        };
        this.attachmentsCount = {};
      }

      updateUrlParams = () => {
        const url = this.props.href ? this.props.href : window.location.search;
        this.contextParams.url = parseUrlParams(url);
      }

      componentDidMount() {
        if (manualQuery) {
          return;
        }
        this.queryUnitConfig();
      }

      @Bind()
      queryUnitConfig(params = query, fn?: Function, unitCodes?: string[]) {
        let realUnitCodes = unitCode;
        if (unitCodes && unitCodes.length) realUnitCodes = unitCodes;
        this.setState({ loading: true });
        if (realUnitCodes && isArray(realUnitCodes) && realUnitCodes.length > 0) {
          queryUnitCustConfigPost(realUnitCodes, params, uiQueryError)
            .then((res) => {
              // eslint-disable-next-line no-unused-expressions
              typeof fn === 'function' && fn(res);
              if (getResponse(res)) {
                const newConfig = {};
                // 自动扩展出来的字段公共配置
                this.custConfig = res || {};
                this.cache = {};
                Object.keys(res).forEach((code) => {
                  // eslint-disable-next-line no-multi-assign
                  const unitConfig: UnitConfig = (newConfig[code] = res[code]);
                  if (!this.cache[code]) {
                    this.cache[code] = observable({init: false}) as any;
                  }
                  const lovToLovTargetField: string[] = [];
                  const lovField: string[] = [];
                  // 兼容扩展字段绑定扩展lov的场景
                  const lovList: string[] = [];
                  unitConfig.fields.forEach(field => {
                    if (field.fieldType === 'LOV') {
                      lovField.push(field.fieldCode);
                      if (!field.isStandardField) {
                        lovList.push(field.fieldCode);
                      }
                    }
                    if(field.lovMappings) {
                      field.lovMappings.forEach(({targetCode, lovInfo}) => {
                        if(lovInfo) lovToLovTargetField.push(targetCode);
                      });
                    }
                  });
                  if (c7nUnit.indexOf(code) > -1) {
                    const bindFieldList: FieldConfig[] = [];
                    const newFields: FieldConfig[] = [];
                    const showFieldSet: string[] = [];

                    unitConfig.fields.forEach((field) => {
                      const { fieldCode, showFieldFlag, bindField = '' } = field;
                      if(field.lovMappings) {
                        field.lovMappings.forEach((i) => {
                          if(!lovField.includes(i.targetCode)) i.lovInfo = undefined;
                        });
                      }
                      transformFieldCondition(field);
                      transformFixExpDefaultValue(field, this);
                      if (showFieldFlag) {
                        showFieldSet.push(fieldCode);
                      }
                      if (/[_a-zA-Z][_a-zA-Z0-9]*\.[_a-zA-Z][_a-zA-Z0-9]*/.test(bindField)) {
                        const [source, target] = bindField.split('.');
                        if (
                          !lovList.includes(source) &&
                          lovList.includes(source.replace('Lov', ''))
                        ) {
                          // eslint-disable-next-line no-param-reassign
                          field.bindField = `${source.replace(/Lov$/, '')}.${target}`;
                        }
                        bindFieldList.push(field);
                        return;
                      }
                      newFields.push(field);
                    });
                    unitConfig.fields = newFields.concat(bindFieldList);
                    unitConfig.showFieldSet = showFieldSet;
                  } else {
                    unitConfig.fields.forEach((field) => {
                      if(field.lovMappings) {
                        field.lovMappings.forEach((i) => {
                          if(!lovField.includes(i.targetCode)) i.lovInfo = undefined;
                        });
                      }
                      if(field.fieldType === "LOV" && lovToLovTargetField.includes(field.fieldCode)) field.hasLovToLov = true;
                      transformFieldCondition(field);
                      transformFixExpDefaultValue(field, this);
                    });
                    const { unitType, maxCol = 3 } = unitConfig;
                    if (unitType === 'FORM' || unitType === 'QUERYFORM') {
                      unitConfig.fields.sort(
                        (before: any, after: any) =>
                          (before.formRow || 0) * maxCol +
                          before.formCol -
                          (after.formRow || 0) * maxCol -
                          after.formCol
                      );
                    } else {
                      unitConfig.fields.sort(
                        (before, after) => (before.seq || 0) - (after.seq || 0)
                      );
                    }
                  }
                });
                if (usePostMap) {
                  Object.keys(usePostMap).forEach((code) => {
                    const unitConfig = res[code];
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
              }
            }, uiQueryError)
            .finally(() => {
              this.setState({ loading: false });
            });
        } else {
          this.setState({ loading: false });
        }
        // 每一次查询单元配置，便会重置window变量下的缓存对象，目前用于优化下拉框频繁调用查询接口，c7n暂时不需要
        (window as any).CUSTOMIZECACHE = {};
      }

      @Bind()
      clearProperties(arg: string | Function, args = []) {
        if (typeof arg === 'string') {
          this.cache[arg] = {} as any;
        } else if (typeof arg === 'function') {
          if (!arg.prototype) throw new Error('callback can not be a arrow function!');
          arg.call(this, ...args);
        }
      }

      /**
       * 设置个性化上下文参数
       * @param newParams 自定义上下文参数
       */
      @Bind()
      setCtxParams(newParams: any) {
        this.contextParams.self = newParams;
      }

      /**
       * 该API适用于provider无法使用情况
       * @returns HocInstance
       */
      @Bind()
      getHocInstance() {
        return this;
      }

      c7n = {
        customizeForm: bind(custC7NForm, this),
        custCollapseForm: bind(custCollapseForm, this),
        custTable: bind(custC7NTable, this),
        customizeVTable: bind(custVTable, this),
        customizeCollapse: bind(custCollapse, this),
        customizeTabPane: bind(custTabPane, this),
        customizeDoubleTab: bind(custDoubleTab, this),
        customizeBtnGroup: bind(custBtnGroup1, this),
      };

      h0 = {
        customizeForm: bind(customizeForm, this),
        customizeTable: bind(customizeTable, this),
        customizeCollapse: bind(custCollapse, this),
        customizeTabPane: bind(custTabPane, this),
        customizeFilterForm: bind(custFilterForm, this),
        customizeBtnGroup: bind(custBtnGroup2, this),
      };

      render() {
        const { loading } = this.state;
        const newProps = {
          ...this.props,
          custLoading: loading,
          custConfig: this.custConfig,
          c7n: this.c7n,
          h0: this.h0,
          lastUpdateUnit: this.state.lastUpdateUnit,
          clearProperties: this.clearProperties,
          queryUnitConfig: this.queryUnitConfig,
          setCtxParams: this.setCtxParams,
          getHocInstance: this.getHocInstance,
          updateUrlParams: this.updateUrlParams,
        };

        if (!manualQuery && loading) return <Spin />;
        return <Com {...newProps} ref={this.props.forwardRef} />;
      }
    }

    return React.forwardRef((props, ref) => <WrapIndividual {...props} forwardRef={ref} />);
  };
}