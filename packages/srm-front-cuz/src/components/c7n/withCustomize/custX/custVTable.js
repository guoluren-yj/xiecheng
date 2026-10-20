/* eslint-disable react/display-name */
import React from 'react';
import { isEmpty, omit } from 'lodash';
import { Tooltip, Icon } from 'choerodon-ui/pro';
import { runInAction } from 'mobx';
import moment from "moment";
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
import { getFieldConfig, renderCheckBox } from './common';

function getColumnsConfig({ visible, fixed, width }) {
  const newColumnsConfig = {};
  if (visible !== -1) {
    newColumnsConfig.hidden = !visible;
  }
  if (fixed === 'L') {
    newColumnsConfig.fixed = 'left';
  } else if (fixed === 'R') {
    newColumnsConfig.fixed = 'right';
  } else if (fixed === 'N') {
    newColumnsConfig.fixed = undefined;
  }
  if (width !== undefined) {
    newColumnsConfig.width = width;
  }
  return newColumnsConfig;
}

export default function custVTable(options = {}, table) {
  const { custConfig = {}, loading = false, cacheType, cache } = this.state;
  const { code = '', dataSet = {}, readOnly: readOnly1 } = options;
  const { columns = [] } = table.props;
  const fieldMap = {}; // 记录已配置的字段
  if (!code || isEmpty(custConfig[code])) {
    return table;
  }
  if (loading) {
    return React.cloneElement(table, { loading });
  }
  const unitConfig = custConfig[code] || {};
  const { unitAlias = [], fields = [], readOnly: readOnly2 } = unitConfig;
  const tools = this.getToolFuns();
  const unitData = getFieldValueObject(unitAlias, tools);
  let updateColumns = false;
  if (!cacheType[code]) {
    cacheType[code] = 'table';
    (dataSet.toData() || []).forEach((item, index) => {
      this.setArrayDataMap(code, item, index);
    });
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
        this.setArrayDataMap(code, record.toData(), record.state.offset);
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
      'create',
      ({ record }) => {
        const index = record.state.offset;
        const data = record.toData();
        this.setArrayDataMap(code, data);
        fields.forEach((i) => {
          const { conditionHeaderDTOs = [], fieldCode } = i;
          const {
            required = i.required,
            editable = i.editable,
            visible = i.visible,
          } = coverConfig(conditionHeaderDTOs, { ...tools, index, code });
          if (visible === 0) return;
          const newFieldConfig = getFieldConfig({
            required,
            editable,
          });
          const { defaultValue } = defaultValueFx({ ...tools, code }, record);
          const oldFieldConfig = (record.getField(fieldCode) || {}).pristineProps || {};
          if (defaultValue !== undefined) {
            oldFieldConfig.defaultValue = defaultValue;
          }
          record.addField(fieldCode, {
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
        this.setState({ lastUpdateUnit: `load${code}` });
      },
      false
    );
  }
  if (!cache[code]) {
    cache[code] = {
      columns: [],
      hiddenFields: [],
    };
    updateColumns = true;
  } else {
    const hiddenFields = cache[code].columns;
    fields.forEach((item) => {
      const { fieldCode, conditionHeaderDTOs } = item;
      const { visible = item.visible } = coverConfig(conditionHeaderDTOs, { ...tools, code }, [
        'editable',
        'required',
      ]);
      if (visible === 0 && !hiddenFields.includes(fieldCode)) updateColumns = true;
    });
  }
  cache[code].unitData = unitData;
  columns.forEach((item) => {
    fieldMap[item.dataIndex] = item;
  });
  if (updateColumns) {
    const readOnly = readOnly1 | readOnly2;
    cache[code].hiddenFields = [];
    // 根据列顺序属性排序
    fields.sort((before, after) => (before.seq || 999) - (after.seq || 999));
    let newColumns = [];
    runInAction(() => {
      fields.forEach((item) => {
        const {
          width,
          fieldName,
          fieldCode,
          fixed,
          renderOptions,
          conditionHeaderDTOs,
          renderRule,
          fieldType,
          helpMessage,
        } = item;
        const oldCol = fieldMap[fieldCode];
        const field = dataSet.getField(fieldCode);
        const oldFieldConfig = (field || {}).pristineProps || {};
        const { visible = item.visible } = coverConfig(conditionHeaderDTOs, { ...tools, code }, [
          'editable',
          'required',
        ]);
        if (!oldCol && item.visible === -1) return;
        if (visible === 0) {
          field.set('ignore', 'always');
          field.set('custIgnore', true);
          cache[code].hiddenFields.push(fieldCode);
          delete fieldMap[fieldCode];
          return;
        }
        const newFieldConfig = getFieldConfig({
          visible,
        }); // ds配置覆盖
        if (fieldType === 'CHECKBOX' || fieldType === 'SWITCH') {
          newFieldConfig.trueValue = 1;
          newFieldConfig.falseValue = 0;
        }
        const { defaultValue } = defaultValueFx({ ...tools, code }, item);
        const newColumnsConfig = {
          dataIndex: fieldCode,
          key: fieldCode,
          resizable: true,
          ...getColumnsConfig({
            fixed,
            width,
            visible,
          }),
        };
        // 原表格columns配置覆盖
        if (fieldName !== undefined) {
          newFieldConfig.label = fieldName;
          newColumnsConfig.title = fieldName;
        }
        if (helpMessage) {
          newColumnsConfig.title = (
            <>
              {newColumnsConfig.title || oldCol.title}
              <Tooltip title={helpMessage}>
                <Icon type="help_outline" />
              </Tooltip>
            </>
          );
        }
        if (oldFieldConfig.custIgnore) {
          newFieldConfig.ignore = false;
          newFieldConfig.custConfig = false;
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
          const formFieldGen = ({ rowData, dataIndex }) => {
            if (rowData.record) {
              return getComponent(item.fieldType, { currentData: rowData })({
                ...transformCompProps({ ...item, enableHelp: false }),
                name: dataIndex,
                record: rowData.record,
              });
            }
            return rowData[`${dataIndex}Meaning`] || rowData[dataIndex];
          };
          const isExecptFieldType = item.fieldType === 'UPLOAD';
          if (!isExecptFieldType && (readOnly || renderOptions === 'TEXT')) {
            if (renderRule) {
              newColumnsConfig.render = ({ rowData }) => (
                // eslint-disable-next-line react/no-danger
                <span
                  // eslint-disable-next-line react/no-danger
                  dangerouslySetInnerHTML={{
                    __html: template.render_old(renderRule, {
                      ...cache[code].unitData,
                      self: rowData.record ? rowData.record.toData() : rowData,
                    }),
                  }}
                />
              );
            } else if (fieldType === 'DATE_PICKER') {
              newColumnsConfig.render = ({ rowData, dataIndex }) => {
                let data = rowData;
                if (rowData.record) {
                  data = rowData.record.toData();
                }
                return data[dataIndex] && moment(data[dataIndex]).format(item.dateFormat);
              };
            } else if (item.fieldType === 'CHECKBOX' || item.fieldType === 'SWITCH') {
              newColumnsConfig.render = ({ rowData, dataIndex }) => {
                let data = rowData;
                if (rowData.record) {
                  data = rowData.record.toData();
                }
                return renderCheckBox(data[dataIndex]);
              };
            } else {
              newColumnsConfig.render = ({ rowData, dataIndex }) => {
                let newDataIndex = dataIndex;
                if (/Lov$/.test(dataIndex)) {
                  const match = dataIndex.match(/([\S]+)Lov$/);
                  if (match) {
                    // eslint-disable-next-line prefer-destructuring
                    newDataIndex = match[1];
                  }
                }
                const visualValue = rowData[`${newDataIndex}Meaning`] || rowData[newDataIndex];
                if (visualValue instanceof Array) return visualValue.join('/');
                else if (typeof visualValue === 'object' && visualValue !== null) {
                  return Object.values(visualValue).join('/');
                }
                return visualValue;
              };
            }
          } else {
            newColumnsConfig.render = formFieldGen;
          }
        }

        delete fieldMap[fieldCode];
        newColumns.push({
          ...oldCol,
          ...newColumnsConfig,
        });
      });
    });
    // 代码中而配置中没有的字段
    newColumns = newColumns.concat(Object.values(fieldMap));
    // 左固定前置， 右固定后置
    const leftFixedColumns = [];
    const rightFixedColumns = [];
    const centerFixedColumns = [];
    newColumns.forEach((item) => {
      if (item.fixed === 'left' || item.fixed === true) {
        leftFixedColumns.push(item);
      } else if (item.fixed === 'right') {
        rightFixedColumns.push(item);
      } else {
        centerFixedColumns.push(item);
      }
    });
    cache[code].columns = leftFixedColumns.concat(centerFixedColumns).concat(rightFixedColumns);
  }
  // 也许能解决缓存造成的标题部分无法重新render的问题
  return React.cloneElement(table, { columns: cache[code].columns.map((i) => i) });
}
