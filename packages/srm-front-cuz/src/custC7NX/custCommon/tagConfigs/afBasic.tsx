import React from "react";
import type { TagConfig } from "./interface";
import { useComputed } from "../../hooks";
import { fieldNameFx, getFieldValueObject } from "../../../customizeTool";
import template from "../../../utils/template";

export default {
  fieldPreProcess(field, fieldProps) {
    return fieldProps;
  },
  propsProcess: [
    ['fieldsConfig', (oriConfig = {}, newConfig, { initData, props, tools }) => {
      const { dataSet, titleField, tagFields, normalFields } = props;
      const { fields } = initData;
      const fieldsConfig = {};
      // 用于记录所有出现在标准代码中字段
      const stdFieldsRecord = new Set();
      if (titleField) stdFieldsRecord.add(titleField);
      (tagFields || []).forEach(name => stdFieldsRecord.add(name));
      (normalFields || []).forEach(name => stdFieldsRecord.add(name));
      Object.keys(oriConfig).forEach(k => {
        const v = oriConfig[k];
        fieldsConfig[k] = v;
        stdFieldsRecord.add(k);
      });
      fields.forEach(item => {
        const {
          fieldCode,
          fieldNameConDTO,
          helpMessageConDTO,
          renderOptions,
          renderRule,
        } = item;
        const fieldConfig = oriConfig[fieldCode];
        const newFieldConfig = { ...fieldConfig };
        const field = dataSet.getField(fieldCode);
        let visible = field ? field.get('visible') : item.visible;
        if (visible === undefined) visible = -1;
        if ((!stdFieldsRecord.has(fieldCode) && visible === -1) || visible === 0) {
          newFieldConfig.hidden = true;
          fieldsConfig[fieldCode] = newFieldConfig;
          return;
        }
        if (fieldConfig && visible === 1) newFieldConfig.hidden = false;
        let { fieldName, helpMessage } = item;
        if (fieldNameConDTO) {
          fieldName = fieldNameFx(tools, fieldNameConDTO) || fieldName;
        }
        if (helpMessageConDTO) {
          helpMessage = fieldNameFx(tools, helpMessageConDTO) || helpMessage;
        }
        if (fieldName) newFieldConfig.label = fieldName;
        if (helpMessage) newFieldConfig.help = helpMessage;
        if (renderOptions === 'TEXT' && renderRule) {
          const dataGets = getFieldValueObject({
            relatedList: initData.unitAlias || [],
            cache: tools.cache,
            code: tools.code,
            // rowKey: line.record.id,
            ctxParams: tools.ctxParams,
          });
          newFieldConfig.render = line => {
            const node = (
              <span
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{
                  __html: template.render(renderRule, dataGets, line.record.id),
                }}
              />
            );
            return node;
          };
        }
        fieldsConfig[fieldCode] = newFieldConfig;
      });
      return fieldsConfig;
    }, "modifyFieldConfig"],
    ['_', (oriConfig, newConfig, { initData, props, tools }) => {
      const { fields } = initData;
      const newTagFields: string[] = [];
      const newNormalFields: string[] = [];
      fields.forEach(item => {
        const {
          fieldCode,
          uiFeature,
        } = item;
        const spSet = new Set();
        (uiFeature || '').split(",").forEach(v => spSet.add(v));
        if (spSet.has("AF-B-TITLE")) {
          newConfig.titleField = fieldCode;
          return;
        }
        if (spSet.has("AF-B-TAG")) {
          newTagFields.push(fieldCode);
        }
        if (spSet.has("AF-B-NOR")) {
          newNormalFields.push(fieldCode);
        }
      });
      const oriRemainTagFields = (newTagFields || []).filter(fieldCode => !newTagFields.includes(fieldCode));
      const oriRemainNorFields = (newNormalFields || []).filter(fieldCode => !newNormalFields.includes(fieldCode));
      newConfig.tagFields = newTagFields.concat(oriRemainTagFields);
      newConfig.normalFields = newNormalFields.concat(oriRemainNorFields);
      return undefined;
    }, "processFields"],
  ]
} as TagConfig