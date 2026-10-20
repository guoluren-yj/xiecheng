import React, {
  cloneElement,
  useMemo,
  useContext,
} from 'react';
import moment from "moment";
import { isPlainObject } from 'lodash';
import { DataSet, Output } from 'choerodon-ui/pro';
import { observable, runInAction, isObservableObject } from 'mobx';
import { CustomizeContext } from '../../Customize';
import { getFieldValueObject } from '../../customizeTool';
import template from '../../utils/template';
import {
  transformCompProps,
} from '../common';
import getComponent from '../getComponent';
import { useCustomizeDataSet, useDefaultValueReaction } from '../hooks';

/** 表格头查询 */
export function useTableFilter(options) {
  const { code, table, customize, proxyQueryDsCreate, namespace } = options;
  if (!code) return;
  const { cache, contextParams: ctxParams, custConfig } = useContext(CustomizeContext);
  const {
    queryFields: oldFieldsWidget = {},
    dataSet: tableDs,
    queryFieldsLimit: oldLimit,
    sortQueryFieldsByCustomize
  } = table.props;
  const unitConfig = custConfig[code];
  const ds =
    (tableDs as DataSet).queryDataSet ||
    (tableDs.queryDataSet = new DataSet({
      autoCreate: true,
      fields: [],
    }));
  if (sortQueryFieldsByCustomize && ds) {
    ds.setState('sortQueryFieldsByCustomize', true);  
  }
  useMemo(() => {
    if (!code || !unitConfig) return;
    cache[code].init = true;
    const { fields = [], unitAlias = [], maxCol = oldLimit || 3 } = unitConfig;
    const queryFields = {};
    let dsQueryFields = ds.fields.toJSON();
    // 根据列顺序属性排序
    const newFields = [...fields].sort((before, after) => {
      if (before.seq === undefined && after.seq === undefined) return 0;
      if (before.seq === undefined) return 1;
      if (after.seq === undefined) return -1;
      return before.seq - after.seq;
    });
    cache[code].reactionFields = useCustomizeDataSet({ dataSet: ds, code }, customize);
    const noConfigFields = Object.keys(dsQueryFields).filter(
      k => !newFields.find(({ fieldCode }) => fieldCode === k)
    );
    dsQueryFields = ds.fields.toJSON();
    const newQueryFields = {};
    newFields.forEach(({ fieldCode, visible }) => {
      if (visible !== 0 && dsQueryFields[fieldCode]) {
        newQueryFields[fieldCode] = dsQueryFields[fieldCode];
      }
    });
    noConfigFields.forEach(fieldCode => {
      newQueryFields[fieldCode] = dsQueryFields[fieldCode];
    });
    runInAction(() => {
      (ds as DataSet).fields = observable.map(newQueryFields);
    });
    if (!cache[code]._DSs) cache[code]._DSs = {};
    if (namespace) {
      cache[code]._DSs[namespace] = ds;
    } else cache[code].dataSet = ds;
    cache[code].stdFieldCustProps = {};
    // eslint-disable-next-line no-shadow
    cache[code].getValue = function (fieldCode, _, namespace, options) {
      let dataSet: DataSet | undefined;
      const { getPristineValue } = options || {};
      if (namespace) dataSet = this._DSs[namespace];
      // eslint-disable-next-line prefer-destructuring
      else dataSet = this.dataSet;
      if (!dataSet) return;
      if (dataSet.current) {
        const field = dataSet.getField(fieldCode);
        const value = dataSet.current.get(fieldCode);
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
    // eslint-disable-next-line no-shadow
    cache[code].getAllValue = function (_, namespace) {
      let dataSet: DataSet | undefined;
      if (namespace) dataSet = this._DSs[namespace];
      // eslint-disable-next-line prefer-destructuring
      else dataSet = this.dataSet;
      if (!dataSet) return {};
      return this.dataSet.current ? this.dataSet.current.toData() : {};
    };
    newFields.forEach(item => {
      const { fieldCode, fieldType, fieldName, renderOptions, visible, renderRule } = item;
      // 做新增扩展字段处理
      if (!dsQueryFields[fieldCode] && visible !== -1) {
        if (renderOptions === 'TEXT') {
          const outputProps: any = {
            name: fieldCode,
            label: fieldName,
          };
          if (fieldType === 'DATE_PICKER') {
            outputProps.renderer = ({ value }) => value && moment(value).format(item.dateFormat);
          }
          if (renderRule) {
            const dataGets = getFieldValueObject({
              relatedList: unitAlias,
              cache,
              code,
              ctxParams,
              namespace,
            });
            const renderer = () => {
              return (
                // eslint-disable-next-line react/no-danger
                <span dangerouslySetInnerHTML={{ __html: template.render(renderRule, dataGets) }} />
              );
            };
            queryFields[fieldCode] = <Output {...outputProps} renderer={renderer} />;
          } else {
            queryFields[fieldCode] = <Output {...outputProps} />;
          }
        } else {
          queryFields[fieldCode] = getComponent(fieldType)(transformCompProps(item, { ctxParams }));
        }
      } else if (oldFieldsWidget[fieldCode]) {
        // eslint-disable-next-line no-multi-assign
        const newProps: any = (cache[code].stdFieldCustProps[fieldCode] = {});
        if (item.editable !== -1) {
          newProps.disabled = !item.editable;
        }
        if (item.placeholder !== undefined) {
          newProps.placeholder = item.placeholder;
        }
      }
    });
    cache[code].filterProps = {
      queryFields: {
        ...queryFields,
      },
      queryFieldsLimit: maxCol,
    };
    if (proxyQueryDsCreate && proxyQueryDsCreate.createNow) {
      const { createData } = proxyQueryDsCreate;
      ds.loadData([]);
      ds.create(createData);
      proxyQueryDsCreate.createNow = false;
    }
  }, [code, ds, cache && cache[code]]);
  const { queryFields: custQueryFields, queryFieldsLimit } = cache[code].filterProps || {};
  const newStdFieldsWidget = useMemo(() => {
    const newFieldsWidget = {};
    // eslint-disable-next-line array-callback-return
    Object.keys(oldFieldsWidget || {}).map(field => {
      const newProps = (cache[code].stdFieldCustProps || {})[field];
      if (newProps) {
        newFieldsWidget[field] = cloneElement(oldFieldsWidget[field], newProps);
      }
      newFieldsWidget[field] = oldFieldsWidget[field];
    });
    return newFieldsWidget;
  }, [oldFieldsWidget, cache[code].stdFieldCustProps]);

  useDefaultValueReaction(ds, cache[code].reactionFields || [], code);
  return useMemo(
    () => ({
      queryFields: {
        ...newStdFieldsWidget,
        ...custQueryFields,
      },
      queryFieldsLimit,
    }),
    [custQueryFields, newStdFieldsWidget]
  );
}
