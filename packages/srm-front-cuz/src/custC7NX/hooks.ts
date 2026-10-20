import { DataSet } from 'choerodon-ui/pro';
import { DynamicProps, FieldProps } from 'choerodon-ui/pro/lib/data-set/Field';
import { isArray, isNil, isPlainObject } from 'lodash';
import { useEffect, useMemo } from 'react';
import moment, { Moment } from 'moment';
import { FieldTrim, FieldType, RecordStatus } from 'choerodon-ui/pro/lib/data-set/enum';
import { Field, math } from 'choerodon-ui/dataset';
import { reaction, runInAction, computed, isObservable, toJS, isObservableObject } from 'mobx';
import Record from 'choerodon-ui/pro/lib/data-set/Record';
import { NOT_CHINA_PHONE } from 'hzero-front/lib/utils/regExp';
import intl from 'hzero-front/lib/utils/intl';
import { Cache } from '../Customize';
import { ConditionHeaderDTO, CtxParams, UnitConfig } from '../interfaces';
import { getComponentType, recordsInit } from './common';
import {
  defaultValueFxFunction,
  extLovTransformRequest,
  extLovTransformResponse,
  fx3Function,
  fxNormalFunction,
  lovPara,
  validatorFunction,
  visibleFunction,
} from './dsTools';
import { filterNull } from '../customizeTool';
import type { TagConfig } from './custCommon/tagConfigs/interface';

const PUBLIC_BUCKET = 'public-bucket';
type BaseOptions = {
  lovIgnore?: boolean;
  readOnlyMode?: 'disabled' | 'output';
  dataSet: DataSet;
  code: string;
  afterCustomizeDs?: (code: string, dataSet: DataSet) => void;
  namespace?: string;
};
type Ctx = {
  cache: { [code: string]: Cache };
  contextParams: CtxParams;
  custConfig: { [code: string]: UnitConfig };
};
const ReactionFieldsCacheKey = Symbol.for("ReactionFieldsCache");

export function useCustomizeDataSet(options: BaseOptions, ctx: Ctx, tagConfig?: Partial<TagConfig<any>>): string[] {
  const { dataSetProcess, fieldPostProcess, fieldPreProcess } = tagConfig || {};
  const { cache, contextParams: ctxParams, custConfig } = ctx;
  const { dataSet, code, readOnlyMode = 'output', namespace, afterCustomizeDs } = options;
  const { fields: fieldsConfig, unitType, pageSize } = custConfig[code];
  // 先生成所有已经存在的bind关系
  const allBindFields = {};
  dataSet.fields.forEach((field) => {
    const bind = field.get('bind');
    if (bind && /[_a-zA-Z][_a-zA-Z0-9]*\.[_a-zA-Z][_a-zA-Z0-9]*/.test(bind)) {
      const [sourceField, targetField] = bind.split('.');
      if (!allBindFields[sourceField]) {
        allBindFields[sourceField] = [targetField];
      } else {
        allBindFields[sourceField].push(targetField);
      }
    }
  });
  if (pageSize) {
    dataSet.pageSize = pageSize;
  }
  // 额外的需reaction处理的字段
  let reactionFields: string[] = [];
  runInAction(() => {
    const cacheMultipleLovField = {};
    fieldsConfig.forEach(({ fieldCode, fieldType, multipleFlag }) => {
      if (multipleFlag == 1 && fieldType === 'LOV') {
        cacheMultipleLovField[fieldCode] = true;
      }
    });
    fieldsConfig.forEach((fieldConfig) => {
      const {
        fieldCode,
        placeholder,
        fieldName,
        visible,
        required,
        editable,
        textMaxLength,
        textMinLength,
        areaMaxLine,
        numberMax,
        numberMin,
        numberPrecision,
        allowThousandth,
        defaultValue,
        defaultValueConDTO,
        dateFormat,
        includeNowDayFlag,
        bindField,
        isStandardField,
        lovCode,
        multipleFlag,
        lovInfo,
        paramList,
        isLovAutoExt, // 自动生成字段标识
        conValidDTO,
        fieldNameConDTO,
        conditionHeaderDTOs,
        bucketName,
        bucketDirectory,
        attachmentTemplate,
        attachmentTplConDTO,
        autoDisabledDate,
        breakpointResumeFlag,
        uploadRecordFlag,
        columnLength,
        autoCast,
        landlineNumFlag,
        supplementZero,
        trimFlag,
        attachmentLimitNum,
      } = fieldConfig;
      let { fieldType, renderOptions } = fieldConfig;
      let extraProps: FieldProps & {
        placeholder?: string;
        rows?: number;
        [x: string]: Function | string | number | undefined | boolean | null | {};
      } = {
        name: fieldCode,
        label: fieldName,
        maxLength: textMaxLength,
        keepOriginMaxLength: false,
        minLength: textMinLength,
        placeholder,
        /** 个性化添加的标志位属性，用于决定设置默认值时使用init还是set */
        __default_replace_flag__: fieldConfig.defaultValueReplaceFlag,
        trim: trimFlag === 1 ? FieldTrim.all : FieldTrim.both,
      };
      if (columnLength && (!textMaxLength || textMaxLength > columnLength)) {
        extraProps.maxLength = columnLength;
      }
      const field = dataSet.getField(fieldCode);
      if (fieldPreProcess) {
        extraProps = fieldPreProcess(field, extraProps, fieldConfig) as any;
      }
      if (bindField) {
        if (!/[_a-zA-Z][_a-zA-Z0-9]*\.[_a-zA-Z][_a-zA-Z0-9]*/.test(bindField)) {
          throw new Error(`${bindField} is not Correct`);
        }
        const [sourceField] = bindField.split('.');
        if (cacheMultipleLovField[sourceField]) extraProps.multiple = ',';
        extraProps.bind = bindField;
        // 若通过个性化配置字段绑定，屏蔽其字段类型和渲染方式，这类字段往往为隐藏字段
        fieldType = undefined;
        renderOptions = 'TEXT';
      }
      const conditionMap: { [k: string]: ConditionHeaderDTO } = {};
      // eslint-disable-next-line no-return-assign
      (conditionHeaderDTOs || []).forEach((i: ConditionHeaderDTO) => (conditionMap[i.conType] = i));
      const { editable: editableFx, required: requiredFx, visible: visibleFx } = conditionMap;
      const hasCustomize = field && (field as any).customize;
      // c7n查询单元过滤掉隐藏字段
      const ignoreFilter =
        ['FILTER', 'QUERYFORM'].includes(unitType || '') &&
        !isLovAutoExt &&
        !field &&
        (visible === 0 || visible === -1);
      if (hasCustomize || ignoreFilter) return;
      const pristineProps: FieldProps & { [k: string]: any } = (field && field.pristineProps) || {};
      const { dynamicProps } = pristineProps;
      if (dynamicProps !== undefined && typeof dynamicProps === 'function') {
        throw new Error('function dynamicProps not support ');
      }
      const {
        label: labelDp,
        required: requiredDp,
        disabled: disabledDp,
        visible: visibleDp,
        defaultValue: defaultValueDp,
        lovPara: lovParaDp,
        attachmentTemplate: attachmentTplDp,
      } = (dynamicProps as DynamicProps & { [x: string]: any }) || {};
      const {
        label: oldLabel,
        required: oldRequired,
        disabled: oldDisabled,
        visible: oldVisible,
        validator,
        defaultValue: oldDefaultValue,
        lovPara: oldLovPara,
      } = pristineProps;
      const newDynamicProps: any = {
        ...dynamicProps,
        visible: visibleFunction(
          { oldDp: visibleDp, oldProp: oldVisible, configProp: visible, fx: visibleFx },
          { ctxParams, code, cache, namespace }
        ),
        required: fx3Function(
          { oldDp: requiredDp, oldProp: oldRequired, configProp: required, fx: requiredFx },
          { type: 'required', ctxParams, code, cache, namespace }
        ),
        isCustomizeText: () => {return renderOptions === 'TEXT'},
      };
      if (conValidDTO || fieldType === 'UPLOAD' || validator) {
        extraProps.validator = validatorFunction(
          { oldProp: validator, fieldConfig },
          {
            cache,
            ctxParams,
            code,
            namespace,
          }
        );
      }
      // 对于使用bind的标准字段，采用visible === -1作为隐藏字段的鉴别条件
      if (!visibleFx && (visible === 0 || (visible === -1 && field && field.get('bind')))) {
        const newFieldProps = {
          ...pristineProps,
          dynamicProps: newDynamicProps,
          validator: extraProps.validator,
        };
        if (field && field.get('bind')) {
          newFieldProps.label = fieldName || newFieldProps.label;
          if (fieldNameConDTO) {
            newFieldProps.dynamicProps.label = fxNormalFunction(
              {
                oldDp: labelDp,
                oldProp: oldLabel,
                configProp: fieldName,
                fx: fieldNameConDTO,
              },
              { cache, ctxParams, code, namespace }
            );
          }
        }
        if (bindField) newFieldProps.bind = bindField;
        dataSet.addField(fieldCode, newFieldProps);
        return;
      }
      if (!field && fieldType !== undefined) {
        extraProps.type = getComponentType(fieldType);
      }
      switch (fieldType) {
        case 'INPUT':
          if (autoCast === "UPPER") extraProps.format = "uppercase";
          else if (autoCast === "LOWER") extraProps.format = "lowercase"
          break;
        case 'TEXT_AREA':
          extraProps.rows = areaMaxLine;
          break;
        case 'CURRENCY':
          extraProps.max = isNil(numberMax) ? undefined : Number(numberMax);
          extraProps.min = isNil(numberMin) ? undefined : Number(numberMin);
          extraProps.precision = typeof numberPrecision === 'number' ? numberPrecision : undefined;
          allowThousandth !== -1 && !isNil(allowThousandth) && (extraProps.numberGrouping = !!allowThousandth);
          break;
        case 'INPUT_NUMBER':
          extraProps.max = isNil(numberMax) ? undefined : Number(numberMax);
          extraProps.min = isNil(numberMin) ? undefined : Number(numberMin);
          extraProps.precision = typeof numberPrecision === 'number' ? numberPrecision : undefined;
          allowThousandth !== -1 && !isNil(allowThousandth) &&
            (extraProps.numberGrouping = !!allowThousandth);
          extraProps.padDecimalZeros = isNil(supplementZero) || supplementZero === 1;
          break;
        case 'LOV':
          // 只对扩展字段有效配置项
          if (!field) {
            extraProps.multiple = multipleFlag === 1;
            extraProps.transformResponse = extLovTransformResponse(
              fieldCode,
              lovInfo,
              multipleFlag === 1
            );
            extraProps.transformRequest = extLovTransformRequest(lovInfo);
            extraProps.optionsProps = {
              childrenField: "children",
              paging: "server",
            };
          }
          extraProps.lovCode = lovCode || pristineProps.lovCode;
          newDynamicProps.lovPara = lovPara(
            { lovParaDp, oldLovPara, paramList },
            { cache, ctxParams, namespace }
          );
          break;
        case 'SELECT':
        case 'RADIOGROUP':
          // 多选属性控制只对扩展字段有效
          if (!field && multipleFlag === 1) {
            extraProps.multiple = ',';
            extraProps.transformRequest = (value) => value === '' ? null : value;
            if (lovInfo) {
              extraProps.textField = lovInfo.displayField;
              extraProps.valueField = lovInfo.valueField;
            }
          }
          extraProps.lookupCode = lovCode || pristineProps.lookupCode;
          newDynamicProps.lovPara = lovPara(
            { lovParaDp, oldLovPara, paramList },
            { cache, ctxParams, namespace }
          );
          break;
        case 'DATE_PICKER':
          extraProps.format = dateFormat && dateFormat.replace(/hh/, 'HH');
          if (!field) {
            if (/hh|mm|ss|HH/g.test(dateFormat as string)) extraProps.type = FieldType.dateTime;
            else extraProps.type = FieldType.date;
          }
          if (dateFormat) {
            if (/^(YYYY)?[-/]?MM$/.test(dateFormat)) extraProps.dateMode = 'month' as any;
            else if (/hh|mm|ss|HH/g.test(dateFormat)) extraProps.dateMode = 'dateTime' as any;
            else extraProps.dateMode = 'date' as any;
          }
          if (includeNowDayFlag) {
            extraProps.processValue = (value: Moment, range?: 0 | 1) =>
              value && range !== 0 ? value.endOf('d') : value;
          }
          if (autoDisabledDate !== -1) {
            extraProps.autoDisabledDate = !!autoDisabledDate;
          }
          newDynamicProps.dateCode = (options) => lovPara(
            { lovParaDp: undefined, oldLovPara: undefined, paramList },
            { cache, ctxParams, namespace }
          )(options).dateCode;
          break;
        case 'CHECKBOX':
        case 'SWITCH':
          extraProps.trueValue = 1;
          extraProps.falseValue = 0;
          if (!field) {
            extraProps.transformResponse = (v) => (isNil(v) ? v : v == '1' ? 1 : 0);
          }
          break;
        case 'UPLOAD':
          if (!isNil(attachmentLimitNum)) {
            extraProps.max = attachmentLimitNum;
          }
          if (!field) {
            if (bucketName === PUBLIC_BUCKET) extraProps.isPublic = true;
          }
          if (attachmentTemplate) {
            extraProps.template = {
              attachmentUUID: attachmentTemplate,
              bucketName: 'private-bucket',
            } as any;
          }
          if (breakpointResumeFlag !== -1 && !isNil(breakpointResumeFlag)) {
            extraProps.useChunk = !!breakpointResumeFlag;
            extraProps.chunkSize = 100 * 1024 * 1024;
          }
          if (uploadRecordFlag !== -1 && !isNil(uploadRecordFlag)) {
            extraProps.showHistory = !!uploadRecordFlag;
          }
          extraProps.bucketName = bucketName;
          extraProps.bucketDirectory = bucketDirectory;
          break;
        case 'TEL_FIELD':
          const regionFieldName = `${fieldCode}TelCode`;
          dataSet.addField(regionFieldName, {
            lookupCode: 'HPFM.IDD',
            dynamicProps: {
              disabled: ({ record }) => {
                return record.getField(fieldCode) && record.getField(fieldCode).get('disabled')
              },
            },
            transformResponse: (v, record) => {
              if (!v && record[fieldCode] && record[fieldCode].includes('|')) {
                const [telCode] = record[fieldCode].split('|');
                return telCode;
              }
              return v;
            },
          });
          extraProps.defaultValidationMessages = {
            patternMismatch: intl.get('hzero.common.model.config.defaultValue.patternMismatch').d('手机号码格式有误'),
          },
          extraProps.regionField = regionFieldName;
          extraProps.transformRequest = (v, record) => {
            return v && record && record.get(regionFieldName) ? `${record.get(regionFieldName)}|${v}` : v;
          };
          extraProps.transformResponse = (v) => {
            if (v) {
              if (v.includes('|')) {
                const [_, phoneNum] = v.split('|');
                return phoneNum;
              } else {
                return v;
              }
            }
          };
          if (landlineNumFlag !== -1 && !isNil(landlineNumFlag)) {
            newDynamicProps.pattern = ({ record }) => {
              if (record.get(regionFieldName) === '+86') {
                return landlineNumFlag == '1' ? /^1\d{10}$|^(\d{2,5}-?|\(\d{2,5}\))?[1-9]\d{4,7}(-\d{1,8})?$/ : /^1\d{10}$/;
              }
              return NOT_CHINA_PHONE;
            };
          }
        default:;
      }
      if (readOnlyMode === 'disabled' && renderOptions === 'TEXT' && !isStandardField) {
        extraProps.disabled = true;
      } else if (editable !== -1 || editableFx) {
        newDynamicProps.disabled = fx3Function(
          { oldDp: disabledDp, oldProp: oldDisabled, configProp: editable, fx: editableFx },
          { type: 'disabled', ctxParams, code, cache, namespace }
        );
      }
      // c7n要求默认值仅在create时有效，故条件的默认值实现需另外处理
      if (defaultValue !== undefined || defaultValueConDTO) {
        reactionFields.push(fieldCode);
        // 必须置空，否则当dp返回undefined时依旧走该defaultValue
        extraProps.defaultValue = undefined;
        newDynamicProps.defaultValue = defaultValueFxFunction(
          {
            oldDp: defaultValueDp,
            oldProp: oldDefaultValue,
            fieldConfig,
          },
          { cache, ctxParams, code, namespace }
        );
      }
      if (fieldNameConDTO) {
        newDynamicProps.label = fxNormalFunction(
          {
            oldDp: labelDp,
            oldProp: oldLabel,
            configProp: fieldName,
            fx: fieldNameConDTO,
          },
          { cache, ctxParams, code, namespace }
        );
      }
      if (attachmentTplConDTO) {
        const _fxFunction = fxNormalFunction(
          {
            oldDp: attachmentTplDp,
            oldProp: attachmentTemplate,
            configProp: fieldName,
            fx: attachmentTplConDTO,
            fxUseFieldName: "value",
          },
          { cache, ctxParams, code, namespace }
        )
        newDynamicProps.template = (args) => {
          const fxValue = _fxFunction(args);
          if (!fxValue) return undefined;
          return {
            attachmentUUID: fxValue,
            bucketName: "private-bucket",
          }
        }
      }
      extraProps.dynamicProps = newDynamicProps;

      if (fieldPostProcess) {
        extraProps = fieldPostProcess(field, extraProps, fieldConfig) as any;
      }
      filterNull(extraProps, ['defaultValue']);
      const newField = dataSet.addField(fieldCode, { ...pristineProps, ...extraProps });
      // recordsInit(dataSet.records, fieldCode);
      (newField as any).customize = true;
    });
    const { customizeCodes } = dataSet as any
    // 处理同dataSet、多code且dataSet存在复用、缓存的场景下默认值计算问题
    const reactionFieldsCache = (dataSet as any)[ReactionFieldsCacheKey] = (dataSet as any)[ReactionFieldsCacheKey] || new Map<string, string[]>();
    if (!reactionFieldsCache.get(code)) {
      reactionFieldsCache.set(code, reactionFields);
    } else {
      reactionFields = reactionFieldsCache.get(code);
    }
    if (!customizeCodes) (dataSet as any).customizeCodes = [code];
    else {
      !customizeCodes.includes(code) && customizeCodes.push(code);
      return reactionFields;
    }
    recordsInit(dataSet);
    dataSet.addEventListener(
      'update',
      ({ name, record, value }) => {
        if(record[syncUpdate]) return;
        runInAction(() => {
          // eslint-disable-next-line no-shadow
          const { customizeCodes } = record.dataSet;

          customizeCodes.forEach((customizedCode) => {
            // eslint-disable-next-line no-shadow
            const { fields: fieldsConfig } = custConfig[customizedCode] || {};
            if (!fieldsConfig) return;
            fieldsConfig.forEach((item) => {
              const { fieldCode, lovMappings = [] } = item;
              if (name === fieldCode && lovMappings.length > 0 && typeof value === 'object') {
                record[syncUpdate] = true;
                lovMappings.forEach(({ sourceCode, targetCode, lovInfo, sourceDisplayField }) => {
                  const field = record.getField(targetCode) as Field;
                  let targetNewValue;
                  if (value) {
                    targetNewValue = value[sourceCode];
                    if (isArray(value)) {
                      targetNewValue = value.length > 0 ? value.map((v) => v[sourceCode]).join(',') : undefined
                    }
                    // 值集带值集，仅当value是对象时将value转换为lov对应的格式
                    if (lovInfo && field) {
                      const vf = field.get("valueField");
                      const tf = field.get("textField");
                      const displayField = sourceDisplayField || lovInfo.displayField
                      if (vf && tf) targetNewValue = isNil(targetNewValue) ? undefined : { [vf]: targetNewValue, [tf]: value[displayField] };
                    }
                  }
                  record.set(targetCode, targetNewValue);
                });
                record[syncUpdate] = false;
              }
            });
          });
        });
      },
      false
    );
  });
  if (afterCustomizeDs) {
    afterCustomizeDs(code, dataSet);
  }
  if (dataSetProcess) {
    dataSetProcess(dataSet);
  }
  return reactionFields;
}

const syncUpdate = Symbol("SyncUpdate");
const initialStatus = Symbol("InitialStatus");
export function useDefaultValueReaction(
  dataSet: DataSet,
  reactionFields: string[],
  code: string,
  otherConfig: any = {}
) {
  useEffect(() => {
    const cacheDefaultValues = new Map<number, Map<string, [any, any, any]>>();
    const firstRecordStatus = new WeakSet();
    return reaction(
      () => {
        const res: [Record, { name: string; value: any; replaceValue?: boolean }[]][] = [];
        reactionFields.forEach((fieldCode) => {
          const dsField = dataSet.getField(fieldCode);
          if (!dsField) return;
          const valueField = dsField.get('valueField');
          const replaceValue = dsField.get('__default_replace_flag__');
          (dataSet.records || []).forEach((record) => {
            if (record.status === RecordStatus.sync && otherConfig.__force_record_to_update__)
              record.status = RecordStatus.update;
            if (
              !replaceValue &&
              (record.status === RecordStatus.sync ||
                record.status === RecordStatus.delete ||
                firstRecordStatus.has(record))
            ) {
              firstRecordStatus.add(record);
              return;
            }
            if (!replaceValue && dsField.isDirty(record)) return;
            /** 所有字段默认值在经过此处处理前，全被拦截，统一作为undefined */
            // @ts-ignore
            record.__cust_default_init__ = true;
            let cacheDefaultValue = cacheDefaultValues.get(record.id);
            if (cacheDefaultValue === undefined) {
              cacheDefaultValue = new Map<string, [any, any, any]>();
              cacheDefaultValues.set(record.id, cacheDefaultValue);
            }
            const changeFields: { name: string; value: any; replaceValue?: boolean }[] = [];
            const [oldDefaultValue, oldUnusedDefaultValue, oldValue] = cacheDefaultValue.get(fieldCode) || [];
            const newDefaultValue = dsField.get('defaultValue', record);
            let pristineValue = record.getPristineValue(fieldCode);
            // 获取可以放到缓存内的当前值，方便后续比对逻辑
            const currentCacheValue = getCacheValue(record.get(fieldCode), { valueField });
            if (isObservable(pristineValue)) pristineValue = toJS(pristineValue);
            if (
              replaceValue
              && (oldUnusedDefaultValue !== initialStatus)
              && (isArray(pristineValue) ? pristineValue.length : !isNil(pristineValue))
              && (!cacheDefaultValue.has(fieldCode) || isEqualValue(oldUnusedDefaultValue, newDefaultValue, { valueField }))
            ) {
              cacheDefaultValue.set(fieldCode, [initialStatus, newDefaultValue, initialStatus]);
              return;
            }
            /**
             * replaceValue 开启默认值替换已有值功能后，不提前返回
             * cacheDefaultValue 将计算范围限于首次计算的字段清单
             * isArray(pristineValue) && pristineValue.length 排除长度非空的多选字段。
             * !isNil(pristineValue) 排除初始数据非空的字段
             */
            if (
              !replaceValue &&
              !cacheDefaultValue.has(fieldCode) &&
              (isArray(pristineValue) ? pristineValue.length : !isNil(pristineValue))
            ) {
              return;
            }
            let diffValue1 = oldDefaultValue,
              diffValue2 = newDefaultValue;
            if (!isEqualValue(diffValue1, diffValue2, { valueField })) {
              (cacheDefaultValue as Map<string, any>).set(fieldCode, [newDefaultValue, initialStatus, currentCacheValue]);
              if (dsField.get('type') === 'tel' && dsField.get('regionField') && newDefaultValue.includes('|')) {
                changeFields.push({
                  name: `${fieldCode}TelCode`,
                  value: newDefaultValue.split('|')[0] || '+86',
                  replaceValue,
                });
                changeFields.push({
                  name: fieldCode,
                  value: newDefaultValue.split('|')[1],
                  replaceValue,
                });
              } else {
                changeFields.push({
                  name: fieldCode,
                  value: newDefaultValue,
                  replaceValue,
                });
              }
            }
            if (changeFields.length > 0) {
              res.push([record, changeFields]);
            }
          });
        });
        return res;
      },
      (changeRecords) => {
        runInAction(() => {
          changeRecords.forEach(([record, changeFields]) => {
            changeFields.forEach(({ name, value, replaceValue }) => {
              if (replaceValue) record.set(name, value);
              else record.init(name, value);
            });
          });
        });
      },
      { fireImmediately: true }
    );
  }, [code, dataSet, reactionFields]);
}

function isEqualValue(_diffValue1, _diffValue2, options) {
  const { valueField } = options;
  let diffValue1 = _diffValue1,
    diffValue2 = _diffValue2;
  if (
    typeof diffValue1 === 'number' &&
    typeof diffValue2 === 'number' &&
    (isNaN(diffValue1) && isNaN(diffValue2)) || math.eq(diffValue1, diffValue2)
  )
    return true;
  if (isArray(diffValue1) && isArray(diffValue2)) {
    diffValue1 = diffValue1.map((v) => (isPlainObject(v) && valueField ? v[valueField] : v)).join();
    diffValue2 = diffValue2.map((v) => (isPlainObject(v) && valueField ? v[valueField] : v)).join();
  } else if (isPlainObject(diffValue1) && isPlainObject(diffValue2)) {
    diffValue1 = valueField ? diffValue1[valueField] : diffValue1;
    diffValue2 = valueField ? diffValue2[valueField] : diffValue2;
  } else if (moment.isMoment(diffValue1) && moment.isMoment(diffValue2)) {
    diffValue1 = diffValue1.valueOf();
    diffValue2 = diffValue2.valueOf();
  }
  return diffValue1 === diffValue2;
}

function getCacheValue(value, options) {
  const { valueField } = options;
  if (typeof value === 'number') {
    if (isNaN(value)) return 'NaN';
    if (math.isBigNumber(value)) return value.toString();
    return value;
  }
  if (isArray(value)) {
    return value.map((v) => (isPlainObject(v) && valueField ? v[valueField] : v)).join();
  }
  if (isPlainObject(value) || isObservableObject(value)) {
    return valueField ? value[valueField] : value;
  }
  if (moment.isMoment(value)) return value.valueOf();
}

export function useComputed(func, inputs?: any[]) {
  // eslint-disable-next-line no-void
  if (inputs === void 0) {
    // eslint-disable-next-line no-param-reassign
    inputs = [];
  }
  const computedValues = useMemo(function () {
    return computed(func);
  }, inputs);
  return computedValues.get();
}
