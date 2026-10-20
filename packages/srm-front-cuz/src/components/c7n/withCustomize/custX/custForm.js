/* eslint-disable react/display-name */
import React, { cloneElement } from 'react';
import { isEmpty, isArray, omit } from 'lodash';
import moment from "moment";
import { Output } from 'choerodon-ui/pro';
import { runInAction } from 'mobx';
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
import { extReg } from '../../../../utils/constConfig.js';
import { getFieldConfig, renderCheckBox } from './common';

export default function custForm(options = {}, form) {
  const proxyForm = form;
  const { custConfig = {}, loading = false, cacheType } = this.state;
  const {
    code = '',
    readOnly: readOnly1,
    enableCreate = true,
    disableOutput = false,
    labelLayout,
  } = options;
  const { dataSet = { data: [{}] } } = proxyForm.props;
  if (loading) {
    return cloneElement(form, { children: [] });
  }
  if (!code || isEmpty(custConfig[code])) return form;
  const fieldMap = new Map();
  const proxyFormProps = {};
  const formChildren = isArray(proxyForm.props.children)
    ? proxyForm.props.children
    : [proxyForm.props.children];
  formChildren.forEach((item, seq) => {
    if (item.props && item.props.name) {
      fieldMap.set(item.props.name, { item, seq });
    }
  });
  const tools = { ...this.getToolFuns(), code };
  // TODO: c7n不支持字段宽度配置
  const { maxCol = 3, fields = [], unitAlias = [], readOnly: readOnly2 } = custConfig[code];
  const readOnly = readOnly1 || readOnly2;
  const current = dataSet.current || { toData: () => ({}) };
  this.setDataMap(code, current.toData());
  const unitData = getFieldValueObject(unitAlias, this.getToolFuns(), code);
  if (!cacheType[code]) {
    // dataSet.tlsUrl = 'hpfm//v1/multi-language';
    cacheType[code] = 'form';
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
      ({ name, record, value }) => {
        const ds = dataSet.get(0) || { toData: () => ({}) };
        const data = ds.toData();
        this.setDataMap(code, data);
        fields.forEach((item) => {
          const { conditionHeaderDTOs = [], fieldCode, lovMappings = [] } = item;
          const newFieldConfig = getFieldConfig({
            required: item.required,
            editable: item.editable,
            ...coverConfig(conditionHeaderDTOs, tools, ['visible']),
          });
          const { defaultValue } = defaultValueFx({ ...tools, code }, item);
          const oldFieldConfig = (dataSet.getField(fieldCode) || {}).pristineProps || {};
          if (defaultValue !== undefined) {
            oldFieldConfig.defaultValue = defaultValue;
          }
          dataSet.addField(fieldCode, {
            ...parseProps(
              omit(item, [
                'width',
                'fieldName',
                'fieldCode',
                'fixed',
                'renderOptions',
                'conditionHeaderDTOs',
              ]),
              tools,
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
      () => {
        fields.forEach((item) => {
          if (item.fieldType === 'EMPTY') return;
          const { conditionHeaderDTOs = [], fieldCode } = item;
          const data = (dataSet.current && dataSet.current.toData()) || {};
          this.setDataMap(code, data);
          const newFieldConfig = getFieldConfig({
            required: item.required,
            editable: item.editable,
            visible: item.visible,
            ...coverConfig(conditionHeaderDTOs, tools),
          });
          if (!newFieldConfig.visible) return;
          const { defaultValue } = defaultValueFx({ ...tools, code }, item);
          const oldFieldConfig = (dataSet.getField(fieldCode) || {}).pristineProps || {};
          if (defaultValue !== undefined) {
            oldFieldConfig.defaultValue = defaultValue;
          }
          dataSet.addField(fieldCode, {
            ...parseProps(
              omit(item, [
                'width',
                'fieldName',
                'fieldCode',
                'fixed',
                'renderOptions',
                'conditionHeaderDTOs',
              ]),
              this.getToolFuns(),
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
  const proxyFields = [];
  const tempFields = fields.filter((i) => {
    const originSeq = fieldMap[i.fieldCode] && fieldMap[i.fieldCode].seq;
    if ((i.formRow === undefined || i.formCol === undefined) && originSeq === undefined) {
      return true;
    }
    const seq = i.formRow * maxCol + i.formCol;
    proxyFields.push({ ...i, seq: typeof seq === 'number' ? seq : originSeq });
    return false;
  });
  proxyFields.sort((p, n) => p.seq - n.seq);
  let newChildren = [];
  runInAction(() => {
    proxyFields.concat(tempFields).forEach((item) => {
      const {
        fieldCode,
        fieldName,
        renderOptions,
        conditionHeaderDTOs,
        renderRule,
        colSpan,
        rowSpan,
        ...otherProps
      } = item;
      const oldChild = fieldMap.get(fieldCode);
      const {
        visible = item.visible,
        required = item.required,
        editable = item.editable,
      } = coverConfig(conditionHeaderDTOs, tools);
      if (item.fieldType !== 'EMPTY') {
        const field = dataSet.getField(fieldCode);
        const oldConfig = (field || {}).pristineProps || {};
        let backProps = {};
        if (visible === 0) {
          if (!oldConfig.custIgnoreBak) {
            const custIgnoreBak = {
              required: oldConfig.required,
              validator: oldConfig.validator,
            };
            if (oldConfig.dynamicProps && oldConfig.dynamicProps.required) {
              custIgnoreBak.requiredDp = oldConfig.dynamicProps.required;
              oldConfig.dynamicProps.required = undefined;
            }
            const newProps = { ...oldConfig, required: false, validator: undefined, custIgnoreBak };
            if (field) {
              Object.keys(newProps).forEach((key) => {
                field.set(key, newProps[key]);
              });
            }
          }
          fieldMap.delete(fieldCode);
          return;
        } else if (oldConfig.custIgnoreBak) {
          // eslint-disable-next-line no-shadow
          const { required, validator, requiredDp } = oldConfig.custIgnoreBak;
          backProps = {
            ...oldConfig,
            dynamicProps: {
              ...oldConfig.dynamicProps,
              required: requiredDp,
            },
            required,
            validator,
            custIgnoreBak: undefined,
          };
        }
        const { defaultValue } = defaultValueFx({ ...tools, code }, item);
        const newFieldConfig = getFieldConfig({
          visible,
          required,
          editable,
        });
        if (disableOutput && (readOnly || renderOptions === 'TEXT')) {
          newFieldConfig.disabled = true;
        }
        if (item.fieldType === 'CHECKBOX' || item.fieldType === 'SWITCH') {
          newFieldConfig.trueValue = 1;
          newFieldConfig.falseValue = 0;
        }
        if (fieldName !== undefined) {
          newFieldConfig.label = fieldName;
        }
        if (oldConfig.custIgnore) {
          newFieldConfig.ignore = 'none';
          newFieldConfig.custConfig = false;
        }
        if (defaultValue !== undefined) {
          oldConfig.defaultValue = defaultValue;
        }
        const newProps = {
          ...parseProps(otherProps, tools, oldConfig, {
            viewOnly: readOnly || renderOptions === 'TEXT',
          }),
          ...newFieldConfig,
          ...backProps,
        };
        if (field) {
          Object.keys(newProps).forEach((key) => {
            field.set(key, newProps[key]);
          });
        }
      }
      if (visible !== undefined) {
        // 做新增扩展字段处理
        if (!oldChild && visible !== -1) {
          const fieldProps = {
            name: fieldCode,
            label: fieldName,
            colSpan,
            rowSpan,
          };
          if (item.fieldType === 'CHECKBOX' || item.fieldType === 'SWITCH') {
            fieldProps.renderer = ({ value }) => renderCheckBox(value);
          } else if (item.fieldType === 'DATE_PICKER') {
            fieldProps.renderer = ({ value }) => value && moment(value).format(item.dateFormat);
          } else {
            fieldProps.renderer = ({ name, record }) => {
              const matchRes = name.match(extReg);
              let preStr = name;
              if (matchRes) {
                // eslint-disable-next-line prefer-destructuring
                preStr = matchRes[1];
              }
              const data = record ? record.toJSONData() : {};
              const visualValue = data[`${preStr}Meaning`] || data[preStr];
              if (visualValue instanceof Array) return visualValue.join('/');
              else if (
                (visualValue === null || visualValue === undefined) &&
                labelLayout === 'vertical'
              ) {
                return '-';
              } else if (typeof visualValue === 'object' && visualValue !== null) {
                return Object.values(visualValue).join('/');
              }
              return visualValue;
            };
          }
          if (renderRule) {
            fieldProps.renderer = () => (
              // eslint-disable-next-line react/no-danger
              <span dangerouslySetInnerHTML={{ __html: template.render_old(renderRule, unitData) }} />
            );
            newChildren.push(<Output {...fieldProps} />);
            fieldMap.delete(fieldCode);
            return;
          }
          if (
            disableOutput ||
            (!readOnly && renderOptions !== 'TEXT') ||
            item.fieldType === 'UPLOAD'
          ) {
            delete fieldProps.renderer;
            newChildren.push(
              getComponent(item.fieldType, { currentData: dataSet.toData() })({
                ...fieldProps,
                ...transformCompProps(item),
              })
            );
          } else {
            newChildren.push(<Output {...fieldProps} />);
          }
        } else if (oldChild) {
          const newProps = {};
          if (item.helpMessage) {
            newProps.help = item.helpMessage;
            newProps.showHelp = 'tooltip';
          }
          if (item.editable !== -1) {
            newProps.disabled = !item.editable;
          }
          if (colSpan) {
            newProps.colSpan = colSpan;
          }
          if (rowSpan) {
            newProps.rowSpan = rowSpan;
          }
          if (item.placeholder !== undefined) {
            newProps.placeholder = item.placeholder;
          }
          newChildren.push(cloneElement(oldChild.item, newProps));
        }
      }
      fieldMap.delete(fieldCode);
    });
  });
  if (enableCreate && dataSet.all.length === 0) {
    dataSet.create();
  }
  newChildren = newChildren.concat(Array.from(fieldMap.values()).map((i) => i.item));
  proxyFormProps.children = newChildren;
  proxyFormProps.columns = maxCol;
  return cloneElement(form, proxyFormProps);
}
