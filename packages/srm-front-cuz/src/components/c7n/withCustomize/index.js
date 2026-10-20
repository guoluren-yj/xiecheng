/* eslint-disable no-param-reassign */
import React from 'react';
import { Bind } from 'lodash-decorators';
import { isArray, Bind as B } from 'lodash';
import { getResponse } from 'hzero-front/lib/utils/utils';
import { queryUnitCustConfigPost } from './customizeTool';
import custTable from './custX/custTable';
import custForm from './custX/custForm';
import custCollapseForm from './custX/custCollapseForm';
import custVTable from './custX/custVTable';
import custCollapse from './custX/custCollapse';
import custTabPane from './custX/custTabPane';
import { transformFieldCondition } from '../../../Customize';
import { uiQueryError } from '../../../common';

export default function withCustomize({ unitCode = [], query, manualQuery = false } = {}) {
  return (Component) => {
    class WrapIndividual extends React.Component {
      constructor(props, ...args) {
        super(props, ...args);
        this.state = {
          // eslint-disable-next-line react/no-unused-state
          custConfig: {},
          loading: true,
          cacheType: {},
          // eslint-disable-next-line react/no-unused-state
          cache: {},
          dataMap: new Map(),
          arrayDataMap: {},
          lastUpdateUnit: '',
        };
      }

      @Bind()
      setDataMap(code, value) {
        this.state.dataMap.set(code, value);
      }

      @Bind()
      getDataValue(code) {
        return this.state.dataMap.get(code) || {};
      }

      @Bind()
      setArrayDataMap(code, value, index) {
        const { arrayDataMap } = this.state;
        if (!arrayDataMap[code]) {
          arrayDataMap[code] = new Map();
        }
        arrayDataMap[code].set(index, value);
      }

      @Bind()
      getArrayDataValue(code, index) {
        const { arrayDataMap } = this.state;
        if (!arrayDataMap[code]) {
          return {};
        }
        return arrayDataMap[code].get(index) || {};
      }

      @Bind()
      getCacheType(code) {
        return this.state.cacheType[code];
      }

      @Bind()
      getToolFuns() {
        return {
          setArrayDataMap: this.setArrayDataMap,
          getArrayDataValue: this.getArrayDataValue,
          setDataMap: this.setDataMap,
          getDataValue: this.getDataValue,
          getCacheType: this.getCacheType,
        };
      }

      componentDidMount() {
        if (manualQuery) {
          return;
        }
        this.queryUnitConfig();
      }

      @Bind()
      queryUnitConfig(params = query, fn) {
        if (unitCode && isArray(unitCode) && unitCode.length > 0) {
          queryUnitCustConfigPost(unitCode, params, uiQueryError)
            .then((res) => {
              // eslint-disable-next-line no-unused-expressions
              typeof fn === 'function' && fn(res);
              if (getResponse(res)) {
                this.setState({
                  // eslint-disable-next-line react/no-unused-state
                  custConfig: res || {},
                });
                const showFieldSet = [];
                // 屏蔽旧版的默认值公式配置
                Object.keys(res).forEach((code) => {
                  const unitConfig = res[code];
                  if (!unitConfig) return;
                  // 屏蔽旧版的默认值公式配置
                  unitConfig.fields.forEach((field) => {
                    if (field.proDefaultFlag) {
                      // eslint-disable-next-line no-param-reassign
                      field.defaultValue = undefined;
                    }
                    if (field.showFieldFlag) {
                      showFieldSet.push(field.fieldCode);
                    }
                    transformFieldCondition(field);
                  });

                  unitConfig.showFieldSet = showFieldSet;
                });
              }
            })
            .finally(() => {
              this.setState({ loading: false });
            });
        } else {
          this.setState({ loading: false });
        }
      }

      customizeForm = B(custForm, this);

      customizeCollapseForm = B(custCollapseForm, this);

      custTable = B(custTable, this);

      customizeVTable = B(custVTable, this);

      customizeCollapse = B(custCollapse, this);

      customizeTabPane = B(custTabPane, this);

      @Bind()
      clearProperties(arg, args = []) {
        if (typeof arg === 'string') {
          this.cache[arg] = {};
        } else if (typeof arg === 'function') {
          if (!arg.prototype) throw new Error('callback can not be a arrow function!');
          arg.call(this, ...args);
        }
      }

      render() {
        const { loading = true, lastUpdateUnit } = this.state;
        const newProps = {
          ...this.props,
          custLoading: loading,
          lastUpdateUnit,
          customizeTable: this.custTable,
          customizeVTable: this.customizeVTable,
          customizeForm: this.customizeForm,
          customizeCollapseForm: this.customizeCollapseForm,
          customizeTabPane: this.customizeTabPane,
          clearProperties: this.clearProperties,
          queryUnitConfig: this.queryUnitConfig,
        };
        return <Component {...newProps} ref={this.props.forwardRef} />;
      }
    }

    return React.forwardRef((props, ref) => <WrapIndividual {...props} forwardRef={ref} />);
  };
}