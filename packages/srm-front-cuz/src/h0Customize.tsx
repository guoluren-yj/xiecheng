/**
 * 个性化组件
 * @date: 2020-12-3
 * @version: 0.0.1
 * @author: zhaotong <tong.zhao@hand-china.com>
 * @copyright Copyright (c) 2019, Hands
 */

import React from 'react';
import PropTypes from 'prop-types';
import { isArray } from 'lodash';
import bind from 'lodash/bind';
import { Bind } from 'lodash-decorators';
import { getResponse } from 'hzero-front/lib/utils/utils';
import { queryUnitCustConfigPost } from './services';
import { getContext } from './customizeTool';
import Customize, { transformFieldCondition, transformFixExpDefaultValue } from './Customize';
import customizeForm from './custH0X/custForm';
import customizeTable from './custH0X/custTable';
import custCollapse from './custH0X/custCollapse';
import custTabPane from './custH0X/custTabPane';
import custFilterForm from './custH0X/custFilterForm';
import custBtnGroup from './custH0X/custBtnGroup';
import { parseUrlParams } from './utils';
import { uiQueryError } from './common';

interface DecoratorProps {
  unitCode: string[];
  query: any;
  manualQuery: boolean;
  // {[unitCode]: ['attribute1', 'attribute2']}
  // 临时方案，对特定的扩展字段添加queryUsePost: true属性，影响多选lov
  usePostMap: any;
  /** @deprecated */
  queryMethod: 'POST' | 'GET';
}

export default function withCustomize(decoratorProps: DecoratorProps) {
  const { unitCode = [], query, manualQuery = false, usePostMap } = decoratorProps || {};
  return (Com: React.ComponentClass) => {
    class WrapIndividual extends Customize {
      static contextTypes = {
        h0CutomizeUtils: PropTypes.object,
        c7nCutomizeUtils: PropTypes.object,
        setH0CutomizeUtils: PropTypes.func,
        setC7nCutomizeUtils: PropTypes.func,
      };
      cacheKeyMap = {};
      constructor(props, ...args) {
        // @ts-ignore
        super(props, ...args);
        this.state = {
          loading: true,
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
        this.initCustomizeUtils();
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
                this.custConfig = res || {};
                this.cache = {};
                Object.keys(res).forEach((code) => {
                  const unitConfig = res[code];
                  if (!unitConfig) return;
                  if (!this.cache[code]) {
                    this.cache[code] = {init: false} as any;
                  }
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
                  const lovToLovTargetField: string[] = [];
                  const lovField: string[] = [];
                  unitConfig.fields.forEach(field => {
                    if (field.fieldType === 'LOV') {
                      lovField.push(field.fieldCode);
                    }
                    if(field.lovMappings) {
                      field.lovMappings.forEach(({targetCode, lovInfo}) => {
                        if(lovInfo) lovToLovTargetField.push(targetCode);
                      });
                    }
                  });
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

      customizeForm = bind(customizeForm, this);

      customizeTable = bind(customizeTable, this);

      customizeCollapse = bind(custCollapse, this);

      customizeTabPane = bind(custTabPane, this);

      customizeFilterForm = bind(custFilterForm, this);

      customizeBtnGroup = bind(custBtnGroup, this);

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

      @Bind()
      initCustomizeUtils() {
        const { h0CutomizeUtils, setH0CutomizeUtils } = this.context || {};
        if (!h0CutomizeUtils && setH0CutomizeUtils) {
          setH0CutomizeUtils({
            withCustomize,
            attachmentsCount: this.attachmentsCount,
            setAttachmentsCount: count => this.attachmentsCount = count,
          });
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
          customizeBtnGroup: this.customizeBtnGroup,
          queryUnitConfig: this.queryUnitConfig,
          clearProperties: this.clearProperties,
          custLoading: this.state.loading, // 解决页面偶尔不刷新的问题
          custConfig: this.custConfig,
          setCtxParams: this.setCtxParams,
          getHocInstance: this.getHocInstance,
          updateUrlParams: this.updateUrlParams,
          attachmentsCount: this.attachmentsCount,
        };

        return <Com {...newProps} ref={this.props.forwardRef} />;
      }
    }

    return React.forwardRef((props, ref) => <WrapIndividual {...props} forwardRef={ref} />);
  };
}