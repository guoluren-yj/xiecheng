/* eslint-disable react/display-name */
import React, { cloneElement } from 'react';
import { isEmpty, omit } from 'lodash';
import moment from "moment";
import { DataSet, Table, Output } from 'choerodon-ui/pro';
import { Spin } from 'choerodon-ui';
import { observable, runInAction } from 'mobx';
import {
  getComponent,
  coverConfig,
  parseProps,
  transformCompProps,
  getFieldValueObject,
  selfValidator,
  fetchFileList,
  defaultValueFx,
} from '../customizeTool';
import template from '../../../../utils/template';
import { getFieldConfig, getColumnsConfig, renderCheckBox } from './common';

export default function custTable(options = {}, table) {
  const { custConfig = {}, loading = false, cacheType, cache } = this.state;
  const { code = '', filterCode = '', readOnly: readOnly1 } = options;
  const { dataSet } = table.props;
  let { columns = [] } = table.props;
  const fieldMap = new Map(); // 记录已配置的字段
  columns.forEach((item) => {
    fieldMap.set(item.name, item);
  });
  if (loading) {
    return (
      <Spin spinning={this.state.loading}>
        <Table dataSet={new DataSet()} columns={[]} />
      </Spin>
    );
  }
  if (!code || isEmpty(custConfig[code])) {
    return cloneElement(table, { customizedCode: code });
  }
  const unitConfig = custConfig[code] || {};
  const { unitAlias = [], pageSize, fields = [], readOnly: readOnly2 } = unitConfig;
  const readOnly = readOnly1 | readOnly2;
  const proxyTableProps = { ...table.props };
  let queryFieldsLimit;
  const tools = this.getToolFuns();
  const unitData = getFieldValueObject(unitAlias, tools);
  if (filterCode && !isEmpty(custConfig[filterCode]) && !cacheType[filterCode]) {
    cacheType[filterCode] = 'form';
    cache[filterCode] = initTableFilter({
      dataSet,
      filterCode,
      unitConfig: custConfig[filterCode],
      tablePropsQueryFields: table.props.queryFields,
      parentThis: this,
      proxyTableProps,
    });
    queryFieldsLimit = cache[filterCode].maxCol;
  }
  if (queryFieldsLimit !== undefined) {
    proxyTableProps.queryFieldsLimit = queryFieldsLimit;
  }
  if (cache[filterCode] && cache[filterCode].queryFields) {
    proxyTableProps.queryFields = cache[filterCode].queryFields;
  }
  if (!cacheType[code]) {
    cacheType[code] = 'table';
    const newData = dataSet.toData() || [];
    newData.forEach((item, index) => {
      this.setArrayDataMap(code, item, index);
    });
    if (pageSize) {
      dataSet.pageSize = pageSize;
    }
    fields.forEach((field) => {
      const dsField = dataSet.getField(field.fieldCode);
      const oldValidator = dsField && dsField.pristineProps.validator;
      const custProps = {};
      let conValidator;
      if (field.conValidDTO) {
        conValidator = (value, name, record) => {
          let dsValidator;
          if (oldValidator) {
            dsValidator = oldValidator(value, name, record);
          }
          if (dsValidator === false || dsValidator) return dsValidator;
          return selfValidator(field.conValidDTO, tools);
        };
      }
      if (field.fieldType === 'UPLOAD') {
        custProps.validator = async (value, name, record) => {
          let dsValidator;
          if (conValidator || oldValidator) {
            dsValidator = (conValidator || oldValidator)(value, name, record);
          }
          if (dsValidator === false || dsValidator) return dsValidator;
          if (value) {
            return fetchFileList(value, name, record);
          }
          return true;
        };
      }
      if (!('validator' in custProps) && conValidator) {
        custProps.validator = conValidator;
      }
      dataSet.addField(field.fieldCode, {
        ...(dsField && dsField.pristineProps),
        ...custProps,
      });
    });
    dataSet.addEventListener(
      'update',
      ({ record, value, name }) => {
        this.setArrayDataMap(code, record.toData(), record.index);
        fields.forEach((item) => {
          const { conditionHeaderDTOs = [], fieldCode, lovMappings = [] } = item;
          const {
            required = item.required,
            editable = item.editable,
          } = coverConfig(conditionHeaderDTOs, { ...tools, index: record.index, code }, [
            'visible',
          ]);
          const newFieldConfig = getFieldConfig({
            required,
            editable,
          });
          const { defaultValue } = defaultValueFx({ ...tools, code }, item);
          const oldFieldConfig = (record.getField(fieldCode) || {}).pristineProps || {};
          if (defaultValue !== undefined) {
            oldFieldConfig.defaultValue = defaultValue;
          }
          record.addField(fieldCode, {
            ...parseProps(
              omit(item, [
                'width',
                'fieldName',
                'fieldCode',
                'fixed',
                'renderOptions',
                'conditionHeaderDTOs',
              ]),
              { ...tools, index: record.index, code },
              oldFieldConfig
            ),
            ...newFieldConfig,
          });
          if (lovMappings.length > 0 && name === fieldCode && typeof value === 'object') {
            lovMappings.forEach((i) => {
              record.set(i.targetCode, value[i.sourceCode]);
            });
          }
        });
        this.setState({ lastUpdateUnit: `${code}${name}` });
      },
      false
    );

    dataSet.addEventListener(
      'load',
      ({ dataSet: ds }) => {
        (ds.records || []).forEach((item, index) => {
          this.setArrayDataMap(code, item.toData(), item.index);
          fields.forEach((i) => {
            const { conditionHeaderDTOs = [], fieldCode } = i;
            const {
              required = i.required,
              editable = i.editable,
            } = coverConfig(conditionHeaderDTOs, { ...tools, index, code }, ['visible']);
            const newFieldConfig = getFieldConfig({
              required,
              editable,
            });
            const { defaultValue } = defaultValueFx({ ...tools, code }, item);
            const oldFieldConfig = (item.getField(fieldCode) || {}).pristineProps || {};
            if (defaultValue !== undefined) {
              oldFieldConfig.defaultValue = defaultValue;
            }
            item.addField(fieldCode, {
              ...parseProps(
                omit(i, [
                  'width',
                  'fieldName',
                  'fieldCode',
                  'fixed',
                  'renderOptions',
                  'conditionHeaderDTOs',
                ]),
                { ...tools, index, code },
                oldFieldConfig
              ),
              ...newFieldConfig,
            });
          });
        });
        this.setState({ lastUpdateUnit: `load${code}` });
      },
      false
    );
  }
  if (fields && fields.length > 0) {
    // 根据列顺序属性排序
    fields.sort((before, after) => (before.seq || 999) - (after.seq || 999));
    // 左固定前置， 右固定后置
    const leftFixedColumns = fields.filter((item) => item.fixed === 'L');
    const rightFixedColumns = fields.filter((item) => item.fixed === 'R');
    const centerFixedColumns = fields.filter((item) => item.fixed !== 'L' && item.fixed !== 'R');
    const newFields = leftFixedColumns.concat(centerFixedColumns).concat(rightFixedColumns);
    const newColumns = [];
    runInAction(() => {
      newFields.forEach((item) => {
        const {
          width,
          fieldName,
          fieldCode,
          fixed,
          renderOptions,
          conditionHeaderDTOs,
          renderRule,
          fieldType,
        } = item;
        const oldCol = fieldMap.get(fieldCode);
        const field = dataSet.getField(fieldCode);
        const oldFieldConfig = (field || {}).pristineProps || {};
        if (!oldCol && item.visible === -1) return;
        const {
          visible = item.visible,
          required = item.required,
          editable = item.editable,
        } = coverConfig(conditionHeaderDTOs, { ...tools, code }, ['editable', 'required']);
        const newFieldConfig = getFieldConfig({
          visible,
          required,
          editable,
        }); // ds配置覆盖
        if (fieldType === 'CHECKBOX' || fieldType === 'SWITCH') {
          newFieldConfig.trueValue = 1;
          newFieldConfig.falseValue = 0;
        }
        const { defaultValue } = defaultValueFx({ ...tools, code }, item);
        const newColumnsConfig = {
          name: fieldCode,
          ...getColumnsConfig({
            fixed,
            width,
            visible,
          }),
        };
        if (item.helpMessage) {
          newColumnsConfig.help = item.helpMessage;
          newColumnsConfig.showHelp = 'tooltip';
        }
        // 原表格columns配置覆盖
        if (fieldName !== undefined) {
          newFieldConfig.label = fieldName;
          newColumnsConfig.header = fieldName;
        }
        if (oldCol && oldCol.header) {
          if (typeof oldCol.header === 'function') {
            newColumnsConfig.header = (records, name) => oldCol.header(records, fieldName, name);
          } else if (typeof oldCol.header === 'object') {
            newColumnsConfig.header = oldCol.header;
          }
        }
        if (defaultValue !== undefined) {
          oldFieldConfig.defaultValue = defaultValue;
        }
        const newProps = {
          ...parseProps(item, tools, oldFieldConfig, {
            viewOnly: readOnly || renderOptions === 'TEXT',
          }),
          ...newFieldConfig,
        };
        if (field) {
          Object.keys(newProps).forEach((key) => {
            field.set(key, newProps[key]);
          });
        }
        if (!oldCol) {
          const formFieldGen = (record) =>
            getComponent(item.fieldType, { currentData: record.toData() })(
              transformCompProps({ ...item, record, enableHelp: false })
            );
          newColumnsConfig.editor = false;
          if (readOnly || renderOptions === 'TEXT') {
            if (renderRule) {
              newColumnsConfig.renderer = (line) => (
                // eslint-disable-next-line react/no-danger
                <span
                  // eslint-disable-next-line react/no-danger
                  dangerouslySetInnerHTML={{
                    __html: template.render_old(renderRule, {
                      ...unitData,
                      self: line.record.toData(),
                    }),
                  }}
                />
              );
            } else if (fieldType === 'DATE_PICKER') {
              newColumnsConfig.renderer = ({ value }) =>
                value && moment(value).format(item.dateFormat);
            } else if (item.fieldType === 'CHECKBOX' || item.fieldType === 'SWITCH') {
              newColumnsConfig.renderer = ({ value }) => renderCheckBox(value);
            } else {
              newColumnsConfig.renderer = ({ name, record }) => {
                const data = record.toData();
                const visualValue = data[`${name}Meaning`] || data[name];
                if (visualValue instanceof Array) return visualValue.join('/');
                else if (typeof visualValue === 'object' && visualValue !== null) {
                  return Object.values(visualValue).join('/');
                }
                return visualValue;
              };
            }
          } else if (fieldType === 'LINK' || fieldType === 'UPLOAD') {
            newColumnsConfig.renderer = (line) => formFieldGen(line.record);
          } else {
            newColumnsConfig.editor = formFieldGen;
          }
        }
        fieldMap.delete(fieldCode);
        newColumns.push({
          ...oldCol,
          ...newColumnsConfig,
        });
      });
    });
    // 代码中而配置中没有的字段
    columns = newColumns.concat(Array.from(fieldMap.values()));
  }
  proxyTableProps.columns = columns;
  proxyTableProps.customizedCode = code;
  return cloneElement(table, proxyTableProps);
}

function initTableFilter({
  dataSet,
  filterCode,
  unitConfig,
  tools,
  tablePropsQueryFields,
  parentThis,
}) {
  const { fields: filterFields = [], unitAlias: unitFilterAlias = [], maxCol = 3 } = unitConfig;
  const cache = {};
  const queryFields = {};
  filterFields.sort((before, after) => (before.seq || 999) - (after.seq || 999));
  let { queryDataSet } = dataSet;
  if (!dataSet.queryDataSet) {
    // eslint-disable-next-line no-multi-assign,no-param-reassign
    queryDataSet = dataSet.queryDataSet = new DataSet({ fields: [] });
    // eslint-disable-next-line no-param-reassign
    dataSet.queryDataSet.reCreateDs = true;
  }
  queryDataSet.addEventListener(
    'load',
    ({ record, value, name }) => {
      parentThis.setDataMap(filterCode, record.toData());
      filterFields.forEach((item) => {
        const { fieldCode, lovMappings = [] } = item;
        if (lovMappings.length > 0 && name === fieldCode && typeof value === 'object') {
          lovMappings.forEach((i) => {
            record.set(i.targetCode, value[i.sourceCode]);
          });
        }
      });
      parentThis.setState({ lastUpdateUnit: `${filterCode}${name}` });
    },
    false
  );
  queryDataSet.addEventListener('update', ({ record, value, name }) => {
    parentThis.setDataMap(filterCode, record.toData());
    filterFields.forEach((item) => {
      const { fieldCode, lovMappings = [] } = item;
      if (lovMappings.length > 0 && name === fieldCode && typeof value === 'object') {
        lovMappings.forEach((i) => {
          record.set(i.targetCode, value[i.sourceCode]);
        });
      }
    });
    parentThis.setState({ lastUpdateUnit: `${filterCode}${name}` });
  });
  let dsQueryFields = queryDataSet.fields.toJSON();
  filterFields.forEach((item) => {
    const { fieldCode, fieldName, renderOptions, visible, renderRule, ...others } = item;
    const oldConfig = (dsQueryFields[fieldCode] || {}).pristineProps;
    const config = { name: fieldCode };
    Object.assign(config, parseProps(item, tools, oldConfig), getFieldConfig(item));
    if (fieldName !== undefined) {
      config.label = fieldName;
    }
    const noOldElement = !oldConfig && visible === 1;
    // 排除代码中不存在且显示属性为-1的情况
    const updateConfig = (oldConfig && visible !== 0) || noOldElement;
    if (updateConfig) {
      queryDataSet.addField(fieldCode, config);
    }
    if (noOldElement) {
      if (renderOptions === 'TEXT') {
        if (renderRule) {
          const renderer = () => {
            const unitFilterData = getFieldValueObject(unitFilterAlias, tools, filterCode);
            // eslint-disable-next-line react/no-danger
            return (
              <span
                dangerouslySetInnerHTML={{
                  __html: template.render_old(renderRule, unitFilterData),
                }}
              />
            );
          };
          queryFields[fieldCode] = (
            <Output name={fieldCode} label={fieldName} renderer={renderer} />
          );
        } else {
          queryFields[fieldCode] = <Output name={fieldCode} label={fieldName} />;
        }
      } else {
        queryFields[fieldCode] = getComponent(item.fieldType, {
          currentData: queryDataSet.toData(),
        })(transformCompProps(others));
      }
      // eslint-disable-next-line no-param-reassign
      cache.queryFields = { ...tablePropsQueryFields, ...queryFields };
    }
  });
  dsQueryFields = queryDataSet.fields.toJSON();
  const noConfigFields = Object.keys(dsQueryFields).filter(
    (k) => !filterFields.find(({ fieldCode }) => fieldCode === k)
  );
  const newQueryFields = {};
  filterFields.forEach(({ fieldCode, visible }) => {
    if (visible !== 0 && dsQueryFields[fieldCode]) {
      newQueryFields[fieldCode] = dsQueryFields[fieldCode];
    }
  });
  noConfigFields.forEach((fieldCode) => {
    newQueryFields[fieldCode] = dsQueryFields[fieldCode];
  });
  runInAction(() => {
    queryDataSet.fields = observable.map(newQueryFields);
  });
  cache.queryFieldsLimit = maxCol;
  if (dataSet.queryDataSet.all.length === 0) {
    dataSet.queryDataSet.create();
  }
  if (!dataSet.queryDataSet.customize) {
    dataSet.queryDataSet.reset();
    dataSet.queryDataSet.create();
  }
  // eslint-disable-next-line no-param-reassign
  dataSet.queryDataSet.customize = true;
  return cache;
}
