import React, {
  FunctionComponent,
  ReactElement,
  cloneElement,
  useContext,
  useMemo,
  useState,
} from 'react';
import { isEmpty, isPlainObject, property } from 'lodash';
import { observer } from 'mobx-react';
import Customize, { CustomizeContext } from '../../Customize';
import getTagConfig from './tagConfigs';
import type DataSet from 'choerodon-ui/dataset';
import { isObservableObject } from 'mobx';
import moment from 'moment';
import { useComputed, useCustomizeDataSet } from '../hooks';
import type { InitData, TagConfig } from './tagConfigs/interface';
import type { FieldConfig } from '../../interfaces';

type Options = {
  code: string;
  processUnitTag?: string;
};
export default function custCommon(
  this: Customize,
  options: Options,
  reactNode: ReactElement
) {
  const { code = '' } = options;
  const { cache, custConfig, contextParams } = this;
  const isIncrement = this.manualQuery === "INCREMENT";
  if (
    isIncrement && (this.state.willUpdateCode || []).includes(code) ||
    !isIncrement && this.manualQuery && this.state.loading
  ) return reactNode;
  if (!code || isEmpty(custConfig[code]) || !reactNode || !reactNode.props.dataSet) return reactNode;

  return (
    <CustomizeContext.Provider value={{ cache, custConfig, contextParams }}>
      <ObserverWrapper component={reactNode} options={options} />
    </CustomizeContext.Provider>
  );
}

const ObserverWrapper: FunctionComponent<{
  component: ReactElement;
  options: Options;
}> = observer(({options, component}) => {
  const { processUnitTag, code } = options || {};
  const customize = useContext(CustomizeContext);
  const { cache, contextParams: ctxParams, custConfig } = customize;
  const { dataSet } = component.props as {
    dataSet: DataSet;
  };
  const [uTagCfg, setUtCfg] = useState<TagConfig>();
  useMemo(() => {
    getTagConfig(processUnitTag).then((res: any) => res && res.default && setUtCfg(res.default || {}));
  }, [processUnitTag]);
  const initData = useMemo((): InitData | undefined => {
    if (!uTagCfg) return;
    const {
      readOnly: readOnly2,
      fields = [],
      unitAlias = [],
      cardMaxCount,
    } = custConfig[code];
    const fieldsMap = new Map<string, FieldConfig>();
    const newFields = [...fields].sort((before, after) => {
      if (before.seq === undefined && after.seq === undefined) return 0;
      if (before.seq === undefined) return 1;
      if (after.seq === undefined) return -1;
      return before.seq - after.seq;
    })
    newFields.forEach(field => {
      fieldsMap.set(field.name, field);
    });
    cache[code].init = true;
    cache[code].type = 'common@' + processUnitTag;
    cache[code].dataSet = dataSet;
    // eslint-disable-next-line func-names
    cache[code].getValue = function(fieldCode,  _r, _n, options) {
      if (this.createData) {
        return this.createData[fieldCode];
      }
      const { getPristineValue } = options || {};
      if (this.dataSet.current) {
        const field = this.dataSet.getField(fieldCode);
        const value = this.dataSet.current.get(fieldCode);
        if (field && value) {
          const multiple = field.get('multiple');
          const valueField = field.get('valueField') || '__notconfig__';
          if (multiple && typeof value === 'object' && value.toJS) {
            if (getPristineValue) {
              return value.toJS();
            }
            return value
              .toJS()
              .map(i => (typeof i === 'object' ? i[valueField] || '' : i))
              .join(',');
          }
          if (isPlainObject(value) || isObservableObject(value)) {
            if (getPristineValue) {
              return value;
            }
            return value[valueField];
          }
          if (moment.isMoment(value)) {
            switch (field.type) {
              case 'dateTime':
                return value.format('YYYY-MM-DD HH:mm:ss');
              case 'date':
              default:
                return value.format('YYYY-MM-DD');
            }
          }
        }
        return value;
      }
    };
    cache[code].getAllValue = function() {
      if (this.createData) {
        return this.createData;
      }
      return this.dataSet.current ? this.dataSet.current.toData() : {};
    };
    // eslint-disable-next-line no-shadow
    const reactionFields = useCustomizeDataSet({ dataSet, ...options }, customize, uTagCfg);

    return {
      unitAlias,
      readOnly2,
      fields: newFields,
      fieldsMap,
      reactionFields,
      cardMaxCount,
    };
  }, [code, dataSet, cache && cache[code], uTagCfg]);


  const deps = Object.keys(component.props).map(k => component.props[k]);
  const nConfig = useComputed(() => {
    if (!uTagCfg || !initData) return component;
    const { propsProcess } = uTagCfg;
    const tools = { cache, code, ctxParams };
    const newConfig = {};
    propsProcess.forEach(([propName, callback]) => {
      const returnValue = callback(component.props[propName], newConfig, { initData, props: component.props, tools });
      if (propName !== "_") {
        newConfig[propName] = returnValue;
      }
    });
    return newConfig;
  }, [uTagCfg, initData].concat(deps))

  return cloneElement(component, nConfig);
});
