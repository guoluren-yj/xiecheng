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
      const { dataSet, fields: propsFields } = props;
      const { fields } = initData;
      const fieldsConfig = {};
      const aggregationMap = new Map<string, string[]>();
      const aggregationFieldSource = new Map<string, string[]>();
      // 用于记录所有出现在标准代码中字段
      const stdFieldsRecord = new Set();
      (propsFields || []).forEach(name => stdFieldsRecord.add(name));
      Object.keys(oriConfig).forEach(k => {
        const v = oriConfig[k];
        fieldsConfig[k] = v;
        stdFieldsRecord.add(k);
        if (v.aggregationFields) {
          aggregationMap.set(k, v.aggregationFields);
          v.aggregationFields.forEach(f => {
            stdFieldsRecord.add(f);
            if (aggregationFieldSource.has(v)) {
              aggregationFieldSource.get(v)!.push(k);
            } else aggregationFieldSource.set(v, [k])
          });
        }
      });
      // 先行收集一下个性化配置中存在且标准代码不存在的的扩展聚合字段
      fields.forEach(({fieldCode, aggregationFlag}) => {
        if (aggregationFlag) {
          if (!aggregationMap.get(fieldCode)) aggregationMap.set(fieldCode, []);
        }
      });
      fields.forEach(item => {
        const {
          fieldCode,
          fieldNameConDTO,
          helpMessageConDTO,
          renderOptions,
          renderRule,
          aggregationFlag,
          aggregationCode,
          colSpan
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
        if (stdFieldsRecord.has(fieldCode) && visible === 1) newFieldConfig.hidden = false;
        let { fieldName, helpMessage } = item;
        if (fieldNameConDTO) {
          fieldName = fieldNameFx(tools, fieldNameConDTO) || fieldName;
        }
        if (helpMessageConDTO) {
          helpMessage = fieldNameFx(tools, helpMessageConDTO) || helpMessage;
        }
        if (colSpan) {
          newFieldConfig.widthRatio = colSpan >= 1 && colSpan <= 4 ? `${colSpan}x` : '1x';
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
          newFieldConfig.renderValue = line => {
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
        if (aggregationFlag) {
          newFieldConfig.aggregation = true;
        }

        if (aggregationCode === "__no_aggregation__") {
          // 如果是标准字段定义的聚合，会走接下来的取消聚合逻辑，如果是扩展字段，跳过处理即可
          if (aggregationFieldSource.has(fieldCode)) {
            aggregationFieldSource.get(fieldCode)!.forEach(k => {
              if (aggregationMap.has(k)) {
                aggregationMap.set(k, aggregationMap.get(k)!.filter(c => c !== fieldCode))
              }
            });
          }
        } else if (aggregationCode && aggregationMap.has(aggregationCode)) {
          aggregationMap.set(aggregationCode, aggregationMap.get(aggregationCode)!.filter(c => c !== fieldCode))
          aggregationMap.get(aggregationCode)!.push(fieldCode);
        }
        fieldsConfig[fieldCode] = newFieldConfig;
      });
      Array.from(aggregationMap.entries()).forEach(([k, v]) => {
        fieldsConfig[k].aggregationFields = v;
      });
      return fieldsConfig;
    }, "modifyFieldConfig"],
    ['fields', (oriConfig, newConfig, { initData }) => {
      const { fields } = initData;
      const newFields: string[] = [];
      fields.forEach(item => {
        const {
          fieldCode,
          aggregationCode,
        } = item;
        if (!aggregationCode) newFields.push(fieldCode);
      });
      const oriRemainFields = (oriConfig || []).filter(fieldCode => !newFields.includes(fieldCode));
      return newFields.concat(oriRemainFields);
    }, "processFields"],
    ["cardMaxCount", (oriConfig, newConfig, { initData }) => {
      if (initData.cardMaxCount !== undefined) return initData.cardMaxCount;
      return oriConfig;
    }, "processCardMaxCount"]
  ]
} as TagConfig