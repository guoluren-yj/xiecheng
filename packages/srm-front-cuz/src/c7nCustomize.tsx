import React from 'react';
import { Bind } from 'lodash-decorators';
import bind from 'lodash/bind';
import { observable } from 'mobx';
import PropTypes from 'prop-types';
import { isArray, isNil } from 'lodash';
import { Spin } from 'choerodon-ui/pro';
import { getResponse } from 'hzero-front/lib/utils/utils';
// @ts-ignore
import C7nCustomizeContext from 'srm-front-boot/lib/components/CustomizeContext/C7nCustomizeContext';
import { queryUnitCustConfigPost, queryTemplateConfig } from './services';
import custC7NForm from './custC7NX/custForm';
import custC7NTable from './custC7NX/custTable';
import Customize, { transformFieldCondition, transformFixExpDefaultValue } from './Customize';
import { getContext } from './customizeTool';
import custCollapseForm from './custC7NX/custCollapseForm';
import custVTable from './custC7NX/custVTable';
import custCollapse from './custC7NX/custCollapse';
import custTabPane from './custC7NX/custTabPane';
import { FieldConfig, UnitConfig } from './interfaces';
import custBtnGroup from './custC7NX/custBtnGroup';
import custDoubleTab from './custC7NX/custDoubleTab';
import custCommon from './custC7NX/custCommon';
import { parseUrlParams } from './utils';
import { uiQueryError } from './common';

interface DecoratorProps {
  unitCode: string[];
  query: any;
  manualQuery: boolean | "INCREMENT";
  /** 模版级个性化开关 */
  isTemplate?: boolean;
  /** @deprecated */
  autoSpread: boolean;
  /** @deprecated */
  queryMethod: 'POST' | 'GET';
}

export function withCustomize(decoratorProps: DecoratorProps) {
  const { unitCode = [], query, manualQuery = false, autoSpread = true, isTemplate } =
    decoratorProps || {};
  return (Com: React.ComponentClass | React.FC) => {
    class WrapIndividual extends Customize {
      static contextTypes = {
        h0CutomizeUtils: PropTypes.object,
        c7nCutomizeUtils: PropTypes.object,
        setH0CutomizeUtils: PropTypes.func,
        setC7nCutomizeUtils: PropTypes.func,
        c7nCutomizeCache: PropTypes.object,
        setC7nCutomizeCache: PropTypes.func,
      };

      public manualQuery: boolean | "INCREMENT";

      constructor(props, ...args: []) {
        super(props, ...args);
        this.state = {
          loading: true,
          willUpdateCode: [],
        };

        const url = props.href ? props.href : window.location.search;
        this.manualQuery = manualQuery;
        this.contextParams = {
          ctx: getContext(),
          url: parseUrlParams(url),
          self: {}, // 自定义参数，留口备用
        };
      }

      updateUrlParams = () => {
        const url = this.props.href ? this.props.href : window.location.search;
        this.contextParams.url = parseUrlParams(url);
      }

      componentDidMount() {
        if (manualQuery || isTemplate) {
          return;
        }
        this.queryUnitConfig();
        this.initCustomizeContext();
      }

      @Bind()
      queryUnitConfig(params = query, fn?: Function, unitCodes?: string[]) {
        let promise;
        let realUnitCodes = unitCode;
        if (unitCodes && unitCodes.length) realUnitCodes = unitCodes;
        const isIncrement = this.manualQuery === "INCREMENT";
        const preState: any = { loading: true };
        if (isIncrement) preState.willUpdateCode = unitCodes || [];
        this.setState(preState);
        if (realUnitCodes && isArray(realUnitCodes) && realUnitCodes.length > 0) {
          promise = queryUnitCustConfigPost(realUnitCodes, params, uiQueryError);
        } else if (isTemplate) {
          promise = queryTemplateConfig(params, uiQueryError);
        } else {
          this.setState({ loading: false });
          return;
        }
        return promise
          .then((res) => {
            // eslint-disable-next-line no-unused-expressions
            typeof fn === 'function' && fn(res);
            if (getResponse(res)) {
              if (!isIncrement) this.cache = {};
              if (!autoSpread) {
                // 此处暂不考虑assign的副作用，因为后端返回的单元配置不会是undefined
                this.custConfig = Object.assign(isIncrement ? this.custConfig : {}, res || {});
                Object.keys(res).forEach((code) => {
                  // 调整，每次重新查询单元配置，直接丢弃旧缓存
                  this.cache[code] = observable({init: false}) as any;
                });
                return;
              }
              const newConfig = {};

              // 自动扩展出来的字段公共配置
              Object.keys(res).forEach((code) => {
                // 调整，每次重新查询单元配置，直接丢弃旧缓存
                this.cache[code] = observable({init: false}) as any;
                // 给单元配置增加默认值
                const unitConfig: UnitConfig = {
                  fields: [],
                  unitAlias: [],
                  unitType: '',
                  unitCode,
                  ...res[code],
                };
                if (!unitConfig) return;
                // 兼容扩展字段绑定扩展lov的场景
                const extLovList: string[] = [];
                const bindFieldList: FieldConfig[] = [];
                const lovField: string[] = [];
                unitConfig.fields.forEach((field) => {
                  if (field.fieldType === 'LOV') {
                    lovField.push(field.fieldCode);
                    if (!field.isStandardField) {
                      extLovList.push(field.fieldCode);
                    }
                  }
                });
                const newFields: FieldConfig[] = [];
                const showFieldSet: string[] = [];
                unitConfig.fields.forEach((field) => {
                  const { fieldCode, showFieldFlag, bindField = '' } = field;
                  if (field.lovMappings) {
                    field.lovMappings.forEach((i) => {
                      if (!lovField.includes(i.targetCode)) i.lovInfo = undefined;
                    });
                  }
                  transformFieldCondition(field);
                  transformFixExpDefaultValue(field, this);
                  if (showFieldFlag) {
                    showFieldSet.push(fieldCode);
                  }
                  if (/[_a-zA-Z][_a-zA-Z0-9]*\.[_a-zA-Z][_a-zA-Z0-9]*/.test(bindField)) {
                    const [source, target] = bindField.split('.');
                    if (!extLovList.includes(source) && extLovList.includes(source.replace('Lov', ''))) {
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
                newConfig[code] = unitConfig;
              });
              // 此处暂不考虑assign的副作用，因为后端返回的单元配置不会是undefined
              this.custConfig = Object.assign(isIncrement ? this.custConfig : {}, newConfig);
            }
          }, uiQueryError)
          .finally(() => {
            this.setState({ loading: false, willUpdateCode: [] });
          });
      }

      @Bind()
      async queryTemplateConfig(
        preFetch: Promise<{ templateCode: string; templateVersion: string }>,
        uiParams
      ) {
        const { templateCode, templateVersion } = await preFetch;
        if (templateCode && !isNil(templateVersion))
          return this.queryUnitConfig({ templateCode, templateVersion, ...uiParams });
        else {
          this.setState({ loading: false });
          this.cache = {};
          return Promise.resolve();
        }
      }

      customizeForm = bind(custC7NForm, this);

      custCollapseForm = bind(custCollapseForm, this);

      custTable = bind(custC7NTable, this);

      customizeVTable = bind(custVTable, this);

      customizeCollapse = bind(custCollapse, this);

      customizeTabPane = bind(custTabPane, this);

      customizeBtnGroup = bind(custBtnGroup, this);

      customizeDoubleTab = bind(custDoubleTab, this);

      customizeCommon = bind(custCommon, this);

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
      initCustomizeContext() {
        const { c7nCutomizeUtils, setC7nCutomizeUtils, setC7nCutomizeCache } = this.context || {};
        if (!c7nCutomizeUtils && setC7nCutomizeUtils) {
          setC7nCutomizeUtils({ withCustomize });
        }
        if (setC7nCutomizeCache) {
          setC7nCutomizeCache(this.cache)
        }
      }

      render() {
        const { loading } = this.state;
        const newProps = {
          ...this.props,
          custLoading: loading,
          lastUpdateUnit: this.state.lastUpdateUnit,
          custConfig: this.custConfig,
          customizeTable: this.custTable,
          customizeForm: this.customizeForm,
          customizeCollapse: this.customizeCollapse,
          customizeCollapseForm: this.custCollapseForm,
          customizeVTable: this.customizeVTable,
          customizeTabPane: this.customizeTabPane,
          customizeDoubleTab: this.customizeDoubleTab,
          customizeBtnGroup: this.customizeBtnGroup,
          customizeCommon: this.customizeCommon,
          clearProperties: this.clearProperties,
          queryUnitConfig: this.queryUnitConfig,
          queryTemplateConfig: this.queryTemplateConfig,
          setCtxParams: this.setCtxParams,
          getHocInstance: this.getHocInstance,
          updateUrlParams: this.updateUrlParams,
          ref: this.props.forwardRef,
        };
        if (!(manualQuery || isTemplate) && loading) return <Spin />;
        return (
          <C7nCustomizeContext.Provider value={{ cache: this.cache }}>
            <Com {...newProps} />
          </C7nCustomizeContext.Provider>
        );
      }
    }

    return React.forwardRef((props, ref) => <WrapIndividual {...props} forwardRef={ref} />);
  };
}
export default withCustomize;
