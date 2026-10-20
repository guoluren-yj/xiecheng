import Record from 'choerodon-ui/pro/lib/data-set/Record';
import { isArrayLike } from 'mobx';
import { isArray, isNil, isPlainObject } from 'lodash';
import intl from 'hzero-front/lib/utils/intl';
import { FieldConfig } from '../interfaces';
import {
  computeConfig,
  fxComplex,
  getParams,
  preAdapterInitValue,
  selfValidator,
} from '../customizeTool';
import { statementToJs, innerFunctionMap } from '../utils/index.js';

export function extLovTransformResponse(
  fieldCode: string,
  lovInfo: { valueField: string; displayField: string, valueFieldType?: string } = {
    valueField: 'value',
    displayField: 'meaning',
    valueFieldType: undefined,
  },
  multiple
) {
  return function (value: object | string | object[] | undefined, _rowData: any) {
    let newValue = value;
    const rowData = _rowData || {};
    let meaning: string | object | string[] = rowData[`${fieldCode}Meaning`];
    if (isNil(value) || (isArray(value) && value.length === 0)) return multiple ? [] : undefined;
    // 如果value本身就是object，直接返回即可
    if (typeof value === 'object') {
      return newValue;
    }
    if (multiple) {
      if (typeof value === 'string') {
        if (value.indexOf(',') > 0) newValue = value.split(',');
        else newValue = [value];
      }
      let isObject = false;
      if (!meaning) meaning = {};
      if (typeof meaning === 'string') {
        // 经确定，多选时，功能侧数据接口返回的meaning字段一定是对象
        meaning = newValue && (newValue as string[]).length === 1 ? [meaning] : meaning.split(',');
      }
      else if(typeof meaning === 'object') isObject = true;
      return isArrayLike(newValue) ? ((newValue as unknown[]) as string[]).map((v, index) => {
        let processV: any = v;
        if (!isNil(processV)) {
          switch(lovInfo.valueFieldType) {
            case 'Number': processV = Number(v); break;
            case 'String': processV = String(v); break;
            default:;
          }
        }
        return {
          [lovInfo.valueField]: processV,
          // eslint-disable-next-line no-nested-ternary
          [lovInfo.displayField]: isArray(meaning) ? meaning[index] : isObject ? meaning[v] : meaning,
        };
      }) : [];
    }
    // 扩展字段先开启多选录入数据后再关闭，可能会产生脏数据，需要吧object的meaning强制序列化以不报错
    if (typeof meaning === "object") meaning = JSON.stringify(meaning);
    return {
      [lovInfo.displayField]: meaning,
      [lovInfo.valueField]: newValue,
    };
  };
}

export function extLovTransformRequest(lovInfo: { valueField: string; displayField: string }) {
  return function (value: object | string | object[] | undefined) {
    if (isNil(value) || isNil(lovInfo) || (isArrayLike(value) && value.length === 0)) return undefined;
    if (isArrayLike(value)) return value.map((v) => v[lovInfo.valueField]).join(',');
    else if (typeof value === 'object') return value[lovInfo.valueField];
    return value;
  };
}

export function lovPara({ lovParaDp, oldLovPara, paramList }, { cache, ctxParams, namespace }) {
  return function ({ dataSet, record, name }) {
    let stdPara = oldLovPara;
    let custPara;

    if (lovParaDp) {
      stdPara = lovParaDp({ dataSet, record, name });
    }
    if (paramList && paramList.length > 0) {
      custPara = getParams({ paramList, ctxParams, cache, rowKey: record.id, namespace });
    }
    return { ...stdPara, ...custPara };
  };
}

function interceptFx3Value(type: string, value: any) {
  switch (type) {
    case 'disabled':
      return !value;
    case 'required':
      return value === -1 ? false : !!value;
    default:
      return value;
  }
}

// eslint-disable-next-line no-unused-vars
export function visibleFunction(
  { configProp, oldDp, oldProp, fx },
  { cache, ctxParams, code, namespace }
) {
  return function ({ dataSet, record, name }) {
    let computeValue = configProp;
    if (fx) {
      // 表格的条件显示必须在配置页面中限制不可与行字段关联
      computeValue = computeConfig(fx, { ctxParams, cache, code, rowKey: record && record.id });
    }
    if (computeValue === -1) {
      if (oldDp) {
        return oldDp({ dataSet, record, name });
      } else if (oldProp !== undefined) {
        return oldProp;
      } else {
        return computeValue;
      }
    } else return computeValue;
  };
}

export function fx3Function(
  { configProp, oldDp, oldProp, fx },
  { cache, ctxParams, code, type, namespace }
) {
  if (type === 'required' && !oldProp && !oldDp && !fx && (!configProp || configProp === -1))
    return;
  return function ({ dataSet, record, name }) {
    let computeValue = configProp;
    // 行只读模式下，字段必输将会无效
    if (type === 'required' && (!(record && record.dataSet?.getField(name, record)?.get('visible')) || (record && record.getState("readOnly")))) {
      return false;
    }
    if (fx) {
      // 表格的条件显示必须在配置页面中限制不可与行字段关联
      computeValue = computeConfig(fx, { ctxParams, cache, code, rowKey: record.id, namespace });
    }
    if (computeValue === -1) {
      if (oldDp) {
        return oldDp({ dataSet, record, name });
      } else if (oldProp !== undefined) {
        return oldProp;
      } else {
        return interceptFx3Value(type, -1);
      }
    } else return interceptFx3Value(type, computeValue);
  };
}

export function defaultValueFxFunction(
  { fieldConfig, oldDp, oldProp },
  { cache, ctxParams, code, namespace }
) {
  return function ({ dataSet, record, name }) {
    // 延迟个性化配置的默认值触发时机到reaction中
    if (!record || !record.__cust_default_init__) {
      return undefined;
    }
    const {
      proDefaultFlag,
      defaultValue,
      fieldType,
      defaultValueConDTO,
      lovInfo,
      defaultValueMetadata,
      defaultValueMeaning,
      multipleFlag,
    } = fieldConfig as FieldConfig;
    let finalValue,
      finalValueMeaning,
      notModifiedFinalValue = false;
    let { value: computeValue, valueMeaning: computeValueMeaning } = fxComplex(
      { ctxParams, cache, code, rowKey: record && record.id, namespace },
      defaultValueConDTO
    );
    if (proDefaultFlag && computeValue) {
      const str = computeValue;
      try {
        const getPristineValue = fieldType === 'LOV';  
        // eslint-disable-next-line no-new-func
        computeValue = new Function('ctx,cache,innerFunctionMap', statementToJs(str, { getPristineValue }).join('\r\n'))(
          ctxParams,
          cache,
          innerFunctionMap
        );
      } catch (error) {
        console.log(error);
      }
    }
    if (computeValue !== undefined) {
      finalValue = computeValue;
      finalValueMeaning = computeValueMeaning;
    } else if (defaultValue !== undefined) {
      finalValue = defaultValue;
      finalValueMeaning = defaultValueMeaning;
    } else if (oldDp) {
      finalValue = oldDp({ dataSet, record, name });
      notModifiedFinalValue = true;
    } else {
      finalValue = oldProp;
      notModifiedFinalValue = true;
    }
    if (!notModifiedFinalValue && fieldType === 'LOV' && lovInfo && finalValue) {
      let resValue = isNil(computeValue) && defaultValueMetadata || {
        [lovInfo.valueField]: finalValue,
        [lovInfo.displayField]: finalValueMeaning,
      };
      // 多选待定，可能不支持
      if (multipleFlag === 1) {
        resValue = [];
        if (typeof finalValue === 'string' && finalValue.indexOf(',') > 0) {
          resValue = finalValue.split(',').map((v) => ({
            [lovInfo.valueField]: v,
            [lovInfo.displayField]: finalValueMeaning[v],
          }));
        } else {
          resValue = [
            {
              [lovInfo.valueField]: finalValue,
              [lovInfo.displayField]: isPlainObject(finalValueMeaning)
                ? finalValueMeaning[finalValue]
                : finalValueMeaning,
            },
          ];
        }
      }
      finalValue = resValue;
    }
    if (proDefaultFlag) {
      if (fieldType === 'LOV' && lovInfo) {
        if (multipleFlag === 1 && finalValue && finalValue[0] && typeof finalValue[0][lovInfo.valueField] === 'function') {
          return  preAdapterInitValue(fieldConfig, finalValue[0][lovInfo.valueField](record && record.id, namespace));
        } else if (multipleFlag !== 1 && finalValue && typeof finalValue[lovInfo.valueField] === 'function') {
          const val =  preAdapterInitValue(fieldConfig, finalValue[lovInfo.valueField](record && record.id, namespace));
          return {
            [lovInfo.valueField]: val && val[lovInfo.valueField] || undefined,
            [lovInfo.displayField]: val && val[lovInfo.displayField] || undefined,
          };
        } else if (typeof finalValue === 'function') {
          return preAdapterInitValue(fieldConfig, finalValue(record && record.id, namespace));
        } 
      } else if (typeof finalValue === 'function') {
        return preAdapterInitValue(fieldConfig, finalValue(record && record.id, namespace));
      } else {
        return preAdapterInitValue(fieldConfig, finalValue);
      }
    } else {
      return preAdapterInitValue(fieldConfig, finalValue);
    }
  };
}
export function validatorFunction({ fieldConfig, oldProp }, { cache, ctxParams, code, namespace }) {
  return async function (value, name, record) {
    if (!record.dataSet.getField(name).get('visible', record)) {
      return true;
    }
    if (fieldConfig.fieldType === 'UPLOAD') {
      const field = record.getField(name);
      if (field) {
        const count = field.getAttachmentCount();
        if (!isNil(fieldConfig.attachmentLimitNum) && !isNaN(Number(fieldConfig.attachmentLimitNum)) && Number(fieldConfig.attachmentLimitNum) < (count || 0)) {
          return intl.get("hzero.common.attachmentLimitNumError").d("附件数量超出限制");
        }
      }
    }
    const { conValidDTO } = fieldConfig;
    let dsValidator;
    if (oldProp) {
      dsValidator = oldProp(value, name, record);
    }
    if (dsValidator === false || dsValidator && dsValidator !== true) return dsValidator;
    let custRes;
    if (conValidDTO) {
      custRes = selfValidator(conValidDTO, {
        ctxParams,
        cache,
        code,
        rowKey: (record as Record).id,
        namespace,
      });
    }
    if (custRes) return custRes;
    return true;
  };
}

export function fxNormalFunction(
  { configProp, oldDp, oldProp, fx, fxUseFieldName = "errorMessage" },
  { cache, ctxParams, code, namespace }
) {
  return function ({ dataSet, record, name }) {
    let finalValue;
    const fxResult = fxComplex({ cache, ctxParams, code, namespace }, fx);
    const computeValue = fxResult[fxUseFieldName]
    if (computeValue !== undefined) {
      finalValue = computeValue;
    } else if (configProp !== undefined) {
      finalValue = configProp;
    } else if (oldDp) {
      finalValue = oldDp({ dataSet, record, name });
    } else {
      finalValue = oldProp;
    }
    return finalValue;
  };
}
