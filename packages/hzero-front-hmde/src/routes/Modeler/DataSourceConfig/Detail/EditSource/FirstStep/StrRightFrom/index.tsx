/* eslint-disable no-unused-expressions */
/* eslint-disable arrow-body-style */
import React, {
  forwardRef,
  useState,
  useMemo,
  useImperativeHandle,
  useEffect,
  useRef,
  useContext,
} from 'react';
import moment from 'moment';
import {
  Select,
  Form,
  Tooltip,
  Switch,
  Input,
  Icon,
  DatePicker,
  InputNumber,
  Radio,
  Row,
  Col,
} from 'hzero-ui';
import { Collapse } from 'choerodon-ui';
import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import { isEmpty, isNil } from 'lodash';

import { treeToArr } from '@/utils/treeUtils';
import Modal from '@/components/LowcodeModal/HzeroModal';
import { DataSet, Button } from 'choerodon-ui/pro';
import notification from 'utils/notification';
import uuid from 'uuid/v4';
import ImgIcon from '@/utils/ImgIcon';

import { querySourceFieldsService } from '@/services/modelDataSourceService';
import _store, { ISourceManagerStore } from '@/routes/Modeler/DataSourceConfig/stores';
import { isBracketsValid, getFieldValueType } from '@/routes/Modeler/ModelDesigner/utils/utils';

import { SqlDataSet, SqlForm } from '../SqlModal/OpenSQLModal';
import styles from './index.less';

const [STRING, NUMBER, DATE, BOOLEAN, TIME, TIMESTAMP] = [
  'STRING',
  'NUMBER',
  'LOCALDATE',
  'BOOLEAN',
  'TIME',
  'ZONEDDATETIME',
]; // 第四个框的状态
let keyId = 0;
let customKeyId = 0;
const [
  // 空    非空         等于   不等于      大于          大于等于                  小于        小于等于               全模糊        前模糊        后模糊       包含 不包含
  // eslint-disable-next-line no-unused-vars
  IS_NULL,
  IS_NOT_NULL,
  FULLY_FUZZY,
  BEFORE_FUZZY,
  AFTER_FUZZY,
] = ['IS_NULL', 'IS_NOT_NULL', 'FULLY_FUZZY', 'BEFORE_FUZZY', 'AFTER_FUZZY']; // 第四个框的状态
const [FIXED, URLPAEAM, FIELD, SQL] = ['fixed', 'urlParam', 'field', 'sql']; // 第三个框
const { Option, OptGroup }: { Option: any; OptGroup: any } = Select;

const sqlDataSet = new DataSet(SqlDataSet());

interface IListView {
  form: any;
  rightFormData: model.data.DataObjectModel | undefined;
  dataList: model.data.BaseDataObject;
  virtualFields: model.data.DataVirtualField[];
  isTenant: boolean;
  tenantId: string | number;
  dataObjectDetailType: string;
  extendsParentName: string;
}
const ListView = Form.create({
  mapPropsToFields: ({
    isTenant,
    tenantId,
    rightFormData = {} as any,
    dataObjectDetailType,
    extendsParentName,
  }: // dataObjectDetailType,
  // extendsParentName,
  {
    isTenant: boolean;
    tenantId: string | number;
    rightFormData: model.data.DataObjectModel;
    dataObjectDetailType;
    extendsParentName;
  }): any => {
    keyId = 0;
    customKeyId = 0;
    const {
      conditions: allConditions = [],
      // logicModelId,
      joinType,
      masterFlag = 0,
    } = rightFormData;
    let conditions: model.data.DataObjectModelConditions[] = allConditions;
    let customConditions: model.data.DataObjectModelConditions[] = [];
    if (isTenant) {
      if (
        (extendsParentName && dataObjectDetailType === 'edit') ||
        dataObjectDetailType === 'inherit'
      ) {
        // 对比 tenantId 来区分平台层和租户层的过滤条件
        conditions = allConditions.filter(
          (item) => !isNil(item.tenantId) && String(item.tenantId) !== String(tenantId)
        );
        customConditions = allConditions.filter(
          (item) => isNil(item.tenantId) || String(item.tenantId) === String(tenantId)
        );
      }
    }
    let nextKeys = Form.createFormField({
      value: (conditions?.[0]?.detailList || []).map(() => keyId++),
    });
    let nextCustomKeys = Form.createFormField({
      value: (customConditions?.[0]?.detailList || []).map(() => customKeyId++),
    });
    if (!joinType && masterFlag !== 1) {
      // 新加的模型
      nextKeys = Form.createFormField({ value: [] });
      nextCustomKeys = Form.createFormField({ value: [] });
      // keyId = 2;
    }
    const formFields = {
      keys: nextKeys,
      customKeys: nextCustomKeys,
    };
    conditions?.forEach((condition, index) => {
      condition?.detailList?.forEach((detail, _index) => {
        for (const key in detail) {
          if (
            [
              'fieldCode',
              'operatorType',
              'valueType',
              'leftHeaderRelationCode',
              'rightHeaderRelationCode',
            ].includes(key)
          ) {
            formFields[`conditions[${index}].detailList[${_index}].${key}`] = Form.createFormField({
              value: detail[key],
            });
          }
        }
      });
    });
    if (isTenant) {
      customConditions?.forEach((condition, index) => {
        condition?.detailList?.forEach((detail, _index) => {
          for (const key in detail) {
            if (
              [
                'fieldCode',
                'operatorType',
                'valueType',
                'leftHeaderRelationCode',
                'rightHeaderRelationCode',
              ].includes(key)
            ) {
              formFields[
                `customConditions[${index}].detailList[${_index}].${key}`
              ] = Form.createFormField({
                value: detail[key],
              });
            }
          }
        });
      });
    }
    return formFields;
  },
})(
  forwardRef(
    (
      {
        form,
        rightFormData = {} as model.data.DataObjectModel,
        dataList = {} as model.data.BaseDataObject,
        virtualFields = [],
        isTenant = false,
        tenantId,
        dataObjectDetailType,
        extendsParentName,
      }: IListView,
      ref
    ) => {
      const { getDataObjectDetailType = () => {} }: ISourceManagerStore = useContext<
        ISourceManagerStore
      >(_store as any).store;

      // 暴露子级的函数
      useImperativeHandle(ref, () => ({
        handleRightFromSubmit, // 提交数据
      }));

      const { getFieldDecorator, getFieldValue, getFieldsValue } = form;
      useMemo(() => {
        getFieldDecorator('keys', { initialValue: [] });
        getFieldDecorator('customKeys', { initialValue: [] });
        getFieldDecorator(`joinType`, { initialValue: 'left_join' });
        getFieldDecorator(`relationArr`, { initialValue: '' });
        getFieldDecorator(`logicFormula`, { initialValue: '' });
        getFieldDecorator(`customLogicFormula`, { initialValue: '' });
      }, [rightFormData]);

      // 注册没有展现出来组件（后两个框）
      const keys = getFieldValue('keys');
      const customKeys = getFieldValue('customKeys');
      const [fieldCodesType, setFieldCodesType] = useState<string[]>([]); // 第1个框type
      const [customFieldCodesType, setCustomFieldCodesType] = useState<string[]>([]); // 第1个框type
      const [showValuesField, setShowValuesField] = useState<string[]>([]); // 第四个框显示哪一个
      const [customShowValuesField, setCustomShowValuesField] = useState<string[]>([]); // 第四个框显示哪一个
      const [fieldOptionData, setFieldOptionData] = useState<model.data.DataObjectFieldVO[]>([]);
      const [fieldOptionData2, setFieldOptionData2] = useState<model.data.DataObjectFieldVO[]>([]);

      // 设置初始值
      const [modalVisible, setModalVisible] = useState<boolean>(false); // 模态框显示隐藏
      const [currentKey, setCurrentKey] = useState<number>(0);
      const thisCondition: any = useRef([]);
      const thisCustomCondition: any = useRef([]);

      useEffect(() => {
        init(rightFormData);
      }, [rightFormData, dataList]);

      // 下拉框数据请求条件
      const getSourceFieldArr = (modelDataItem: model.data.DataObjectModel, typeNum: number) => {
        const dataListArr = treeToArr([dataList.masterModel] || []);
        if (modelDataItem && modelDataItem.masterFlag === 1) {
          // 主模型
          return dataListArr;
        }
        if (typeNum === 1) {
          return [modelDataItem];
        }
        if (typeNum === 2) {
          const _sourceList: model.data.BaseDataObject[] = [];
          const _getSourceField = (data) => {
            if (data) {
              _sourceList.push(data);
              if (data.parentId) {
                const _parenData = dataListArr.find(
                  (item) => item?.id === data?.parentId && item?.parentId !== data?.id
                );
                _getSourceField(_parenData);
              }
            }
          };
          _getSourceField(modelDataItem);
          return _sourceList;
        }
      };

      // 获取下拉字段
      const getFields = async (rightItemObj: model.data.DataObjectModel) => {
        const { masterFlag } = rightItemObj;
        const body1 = getSourceFieldArr(rightItemObj, 1);
        const body2 = getSourceFieldArr(rightItemObj, 2);
        const res: model.data.DataObjectFieldVO[] = await querySourceFieldsService({
          body: body1,
          query: {
            extendsParentDataObjectCode: dataList?.extendsParentCode,
          },
        });
        const res2: model.data.DataObjectFieldVO[] = await querySourceFieldsService({
          body: body2,
          query: {
            extendsParentDataObjectCode: dataList?.extendsParentCode,
          },
        }); // 第四个框的下拉数据
        if ((res && (res as any).failed) || (res2 && (res2 as any).failed)) {
          // 错误
          notification.error({
            message: '警告',
            description: (res as any).message,
          });
          return [];
        } else {
          if (masterFlag) {
            let code = uuid();
            code = code.replace(/[-]/g, '');
            // 虚拟字段 如果开始为空 则从选中数据中过滤 否则从状态树中取
            res.push({
              masterFlag: 1,
              logicModelCode: code, // 作为分组key
              logicModelName: '虚拟字段',
              modelFields: virtualFields.filter(
                (item) => item.virtualFieldType !== 'ROW_AGGREGATION'
              ), // 列聚合虚拟字段过滤掉
            } as any);
          }
          setFieldOptionData(res);
          setFieldOptionData2(res2);
        }
        return res;
      };

      // 通过字段code找到字段类型
      const fieldCodeToType = (fieldOptData, code) => {
        const obj: any = {};
        const fieldItem =
          fieldOptData
            .reduce((total, itme) => [...total, ...itme.modelFields], [])
            .find((item) => item.code === code || item.modelFieldCode === code) || {};
        if ([DATE, TIME, TIMESTAMP].includes(fieldItem?.dataType?.toUpperCase())) {
          Object.assign(obj, { dateOrTime: fieldItem.dataType.toUpperCase() });
        }
        const dataType = getFieldValueType(fieldItem.dataType);
        Object.assign(obj, { fieldType: dataType });
        return obj;
      };

      const init = async (rightItemObj: model.data.DataObjectModel = {} as any) => {
        if (!rightFormData.logicModelId) {
          return;
        }
        // 初始化
        const { conditions: allConditions = [] } = rightItemObj; // FIXME: logicModelId
        let conditions: model.data.DataObjectModelConditions[] = allConditions;
        if (!conditions[0]) {
          conditions.push({
            detailList: [],
            groupCode: 'default',
            logicFormula: '',
          } as any);
        }
        let customConditions: model.data.DataObjectModelConditions[] = [
          {
            detailList: [],
            groupCode: 'default',
            logicFormula: '',
          } as any,
        ];
        if (isTenant) {
          if (
            (extendsParentName && dataObjectDetailType === 'edit') ||
            dataObjectDetailType === 'inherit'
          ) {
            // 对比 tenantId 来区分平台层和租户层的过滤条件
            conditions = allConditions.filter(
              (item) => !isNil(item.tenantId) && String(item.tenantId) !== String(tenantId)
            );
            customConditions = allConditions.filter(
              (item) => isNil(item.tenantId) || String(item.tenantId) === String(tenantId)
            );
          }
        }

        thisCondition.current = [...(conditions[0]?.detailList || [])]; // TODO: 应该是指明细，但是该处为数组套数组
        thisCustomCondition.current = [...(customConditions[0]?.detailList || [])];
        const res = await getFields(rightItemObj);
        const _fieldCodesType: string[] = [];
        const _showValuesField: string[] = [];
        const _customFieldCodesType: string[] = [];
        const _customShowValuesField: string[] = [];
        let obj: any = null;
        const newConditions: model.data.DataObjectConditionDetail[] = thisCondition.current;
        const newCustomConditions: model.data.DataObjectConditionDetail[] =
          thisCustomCondition.current;
        newConditions?.forEach((item) => {
          obj = fieldCodeToType(res, item.fieldCode);
          const { dateOrTime, fieldType } = obj;
          Object.assign(item, { dateOrTime });
          // 设置内部参数(fieldOptionData下拉框源)
          _fieldCodesType.push(fieldType);
          if (item.valueType === FIXED) {
            _showValuesField.push(fieldType);
          } else {
            _showValuesField.push(item.valueType);
          }
        });
        setFieldCodesType(_fieldCodesType);
        setShowValuesField(_showValuesField);
        if (isTenant) {
          newCustomConditions?.forEach((item) => {
            obj = fieldCodeToType(res, item.fieldCode);
            const { dateOrTime, fieldType } = obj;
            Object.assign(item, { dateOrTime });
            // 设置内部参数(fieldOptionData下拉框源)
            _customFieldCodesType.push(fieldType);
            if (item.valueType === FIXED) {
              _customShowValuesField.push(fieldType);
            } else {
              _customShowValuesField.push(item.valueType);
            }
          });
          setCustomFieldCodesType(_customFieldCodesType);
          setCustomShowValuesField(_customShowValuesField);
        }
        // 补丁，设置第四个框的值
        const formFields = {};
        (newConditions || []).forEach((condition: any, index) => {
          for (const key in condition) {
            if (['value', 'rightFieldUniqueKey'].includes(key)) {
              if (_showValuesField[index] === DATE) {
                formFields[`conditions[${index}].dateOrTime`] = condition.dateOrTime; // 设置dateOrTime 用于判断过滤条件行第一个下拉框选的是日期/时间
                if (
                  ['IN', 'NOT_IN'].includes(condition.operatorType) &&
                  condition.valueType === 'fixed'
                ) {
                  // 时间日期类型 包含不包含 固定值 最后一位是文本框 故不需要moment格式化
                  formFields[`conditions[${index}].value`] = condition.value;
                } else {
                  formFields[`conditions[${index}].value`] = moment(condition.value);
                }
              } else {
                formFields[`conditions[${index}].value`] = condition.value;
                formFields[`conditions[${index}].rightFieldUniqueKey`] =
                  condition.rightFieldUniqueKey;
              }
            }
          }
        });
        if (isTenant) {
          (newCustomConditions || []).forEach((condition: any, index) => {
            for (const key in condition) {
              if (['value', 'rightFieldUniqueKey'].includes(key)) {
                if (_customShowValuesField[index] === DATE) {
                  formFields[`customConditions[${index}].dateOrTime`] = condition.dateOrTime; // 设置dateOrTime 用于判断过滤条件行第一个下拉框选的是日期/时间
                  if (
                    ['IN', 'NOT_IN'].includes(condition.operatorType) &&
                    condition.valueType === 'fixed'
                  ) {
                    // 时间日期类型 包含不包含 固定值 最后一位是文本框 故不需要moment格式化
                    formFields[`customConditions[${index}].value`] = condition.value;
                  } else {
                    formFields[`customConditions[${index}].value`] = moment(condition.value);
                  }
                } else {
                  formFields[`customConditions[${index}].value`] = condition.value;
                  formFields[`customConditions[${index}].rightFieldUniqueKey`] =
                    condition.rightFieldUniqueKey;
                }
              }
            }
          });
        }
        // 设置值
        form.setFieldsValue({
          logicFormula: conditions.length ? conditions[0].logicFormula : '', // 自定义
          customLogicFormula: customConditions.length ? customConditions[0].logicFormula : '', // 自定义
          ...formFields,
        });
      };

      /**
       * 获取conditions数据补丁
       * @param key
       */
      const getFieldValueFix = (key) => getFieldsValue()[key];

      /**
       * 添加
       * @param k
       */
      const add = () => {
        // 可以使用数据绑定来获取
        const nextKeys = keys.concat(keyId++);
        // 设置自定义筛选逻辑字段
        const logicFormula = nextKeys.map((_, i) => i + 1).join(' AND ');
        // 可以使用数据绑定来设置
        // 重要!通知表单以检测更改
        form.setFieldsValue({
          logicFormula,
          keys: nextKeys,
        });
      };

      /**
       * 添加
       * @param k
       */
      const addCustom = () => {
        // 可以使用数据绑定来获取
        const nextKeys = customKeys.concat(customKeyId++);
        // 设置自定义筛选逻辑字段
        const customLogicFormula = nextKeys.map((_, i) => i + 1).join(' AND ');
        // 可以使用数据绑定来设置
        // 重要!通知表单以检测更改
        form.setFieldsValue({
          customLogicFormula,
          customKeys: nextKeys,
        });
      };

      /**
       * 删除
       * @param k
       */
      const remove = (k: number) => {
        // if (keys.length === 1) {
        //   return;
        // }
        const nextKeys = keys.filter((key) => key !== k);
        // 设置自定义筛选逻辑字段
        const logicFormula = nextKeys.map((_, i) => i + 1).join(' AND ');
        // can use data-binding to set
        form.setFieldsValue({
          logicFormula,
          keys: nextKeys,
        });
      };

      /**
       * 删除
       * @param k
       */
      const removeCustom = (k: number) => {
        // if (keys.length === 1) {
        //   return;
        // }
        const nextKeys = customKeys.filter((key) => key !== k);
        // 设置自定义筛选逻辑字段
        const customLogicFormula = nextKeys.map((_, i) => i + 1).join(' AND ');
        // can use data-binding to set
        form.setFieldsValue({
          customLogicFormula,
          customKeys: nextKeys,
        });
      };

      /**
       * 提交：返回值以 headerId 作唯一标识，赋给左侧模型
       * @param e
       */
      const handleRightFromSubmit = () => {
        let _data: any = true;
        form.validateFields((err) => {
          if (err) {
            _data = false;
          }
        });
        if (!_data) return false;
        const {
          joinType = '',
          logicFormula = '',
          customLogicFormula = '',
          conditions = {},
          customConditions = {},
          strongRelationFlag = false,
        } = form.getFieldsValue();
        let tempConditions = transformCondition(conditions, logicFormula);
        if (!(isTenant && dataObjectDetailType === 'edit')) {
          tempConditions = tempConditions.map((item) => ({
            ...item,
            headerId: rightFormData.logicModelId,
          }));
        }
        let tempCustomConditions: any[] = [];
        if (isTenant) {
          tempCustomConditions = transformCondition(customConditions, customLogicFormula);
        }
        _data = {
          ...rightFormData,
          joinType,
          strongRelationFlag: strongRelationFlag ? 1 : 0,
        };

        if (
          isTenant &&
          ((extendsParentName && dataObjectDetailType === 'edit') ||
            dataObjectDetailType === 'inherit')
        ) {
          const { conditions: originConditions = [] } = rightFormData;
          // 平台过滤条件
          const condListItem = originConditions.filter(
            (item) => !isNil(item.tenantId) && String(item.tenantId) !== String(tenantId)
          )?.[0];
          // 租户过滤条件
          const customCondListItem = originConditions.filter(
            (item) => isNil(item.tenantId) || String(item.tenantId) === String(tenantId)
          )?.[0];
          const resultConditions = [] as any;
          if (condListItem) {
            resultConditions.push(condListItem);
          }
          if (customLogicFormula) {
            // 有租户过滤条件
            resultConditions.push({
              ...(customCondListItem || {}),
              logicFormula: customLogicFormula,
              detailList: [...tempCustomConditions],
            });
          }
          _data.conditions = resultConditions;
          return _data;
        } else {
          _data.conditions[0].logicFormula = logicFormula;
          _data.conditions[0].detailList = [...tempConditions, ...tempCustomConditions];
          return _data;
        }
      };

      const transformCondition = (conditions, logicFormula) => {
        if (isEmpty(conditions)) {
          return [];
        }
        const tempConditions = Object.keys(conditions)
          .filter((key) => key)
          .map((key, index) =>
            moment.isMoment(conditions[key].value)
              ? {
                  ...conditions[key],
                  value: moment(conditions[key].value).format('YYYY-MM-DD HH:mm:ss'),
                  orderSeq: index + 1,
                  logicFormula,
                  customLogicFormula: logicFormula,
                }
              : {
                  ...conditions[key],
                  orderSeq: index + 1,
                  logicFormula,
                  customLogicFormula: logicFormula,
                }
          );
        return tempConditions;
      };

      /**
       * 自定义校验
       * @param rule
       * @param value
       * @param callback
       */
      const logicFormulaVal = (
        rule: any,
        value: string,
        callback: (arg0?: string | undefined) => any,
        isCustom: boolean = false
      ) => {
        // eslint-disable-next-line no-useless-escape
        const regNum = new RegExp('[0-9]+', 'g');
        const regBrackets = new RegExp('[()]', 'g');
        const regStr = new RegExp('[A-Z ]+', 'g');
        const regBracketsPro = new RegExp('[{[}]|]', 'g');
        const target = isCustom ? customKeys : keys;
        if (value && value?.match?.(regNum)?.some((_key) => Number(_key) > target.length)) {
          return callback('校验不通过，请按照参考示例输写筛选逻辑！');
        }
        if (
          value.match(regStr) &&
          !value?.match?.(regStr)?.every((str) => str === ' AND ' || str === ' OR ')
        ) {
          return callback('校验不通过，请按照参考示例输写筛选逻辑！');
          // return callback('校验不通过，你输入的逻辑符错误！(请查看是否有多余空格或未输入正确的AND或OR逻辑符)');
        }
        if (regBracketsPro.test(value)) {
          return callback('校验不通过，请按照参考示例输写，当前仅支持“()”');
        }
        if (
          value?.match?.(regBrackets) &&
          !isBracketsValid(value?.match?.(regBrackets)?.join() as string)
        ) {
          return callback('校验不通过，你输入的括号匹配错误！');
        }
        return callback();
      };

      /**
       * 选择字段,第一个框
       */
      const eventFieldCodeUpData = (_, k: number, { props }: any, isCustom: boolean = false) => {
        const conditionKey = isCustom ? 'customConditions' : 'conditions';
        const conditions = getFieldValueFix(conditionKey) || {};
        // 当前第一个框的type值
        const _fieldCodesType = isCustom ? [...customFieldCodesType] : [...fieldCodesType];
        _fieldCodesType[k] = getFieldValueType(props.type);
        if (isCustom) {
          setCustomFieldCodesType(_fieldCodesType);
        } else {
          setFieldCodesType(_fieldCodesType);
        }
        // 是否改变第四个框得状态
        if (conditions[k].valueType === FIXED) {
          const _showValuesField = isCustom ? [...customShowValuesField] : [...showValuesField];
          _showValuesField[k] = getFieldValueType(props.type);
          if (isCustom) {
            setCustomShowValuesField(_showValuesField);
          } else {
            setShowValuesField(_showValuesField);
          }
        }
        let dateOrTime: string = '';
        if (props?.type === 'ZonedDateTime') {
          dateOrTime = TIME;
        } else if (props?.type === 'LocalDate') {
          dateOrTime = DATE;
        }
        // 清空第二个框
        const formObj = {};
        formObj[`${conditionKey}[${k}].dateOrTime`] = dateOrTime; // 设置dateOrTime 用于判断过滤条件行第一个下拉框选的是日期/时间
        formObj[`${conditionKey}[${k}].fieldCode`] = props?.fieldCode; // 设置fieldCode
        formObj[`${conditionKey}[${k}].leftFieldType`] = props?.leftFieldType; // 设置leftFieldType
        formObj[`${conditionKey}[${k}].leftHeaderRelationCode`] = props?.leftHeaderRelationCode; // 设置leftHeaderRelationCode
        formObj[`${conditionKey}[${k}].operatorType`] = null; // 第二个框清空
        formObj[`${conditionKey}[${k}].rightFieldUniqueKey`] = null; // 第四个框唯一键清空
        formObj[`${conditionKey}[${k}].value`] = null; // 第四个框值清空
        form.setFieldsValue(formObj);
      };

      /**
       * 第二个框updata
       * */
      const eventOperatorTypeUpData = (
        val: string | number,
        k: number,
        isCustom: boolean = false
      ) => {
        const conditionKey = isCustom ? 'customConditions' : 'conditions';
        const conditions = getFieldValueFix(conditionKey) || {};
        const obj = {
          operatorType: val,
        };
        // 清空第三个框
        if (
          conditions[k].operatorType !== FULLY_FUZZY &&
          conditions[k].operatorType !== BEFORE_FUZZY &&
          conditions[k].operatorType !== AFTER_FUZZY &&
          conditions[k].valueType === FIELD
        ) {
          const formObj = {};
          formObj[`${conditionKey}|[${k}].valueType`] = null;
          formObj[`${conditionKey}[${k}].rightFieldUniqueKey`] = null; // 第四个框清空
          form.setFieldsValue(formObj);
          // obj = { ...obj, valueType: null };
          Object.assign(obj, { valueType: null });
        }
        // 清空第四个框
        const formObj = {};
        formObj[`${conditionKey}[${k}].value`] = null; // 第四个框清空
        form.setFieldsValue(formObj);
        const conditionArr = isCustom ? thisCustomCondition : thisCondition;
        if (conditions[k]) {
          conditionArr.current[k] = { ...conditions[k], ...obj };
        } else {
          conditionArr.current[k] = obj;
        }
      };
      /**
       * 第三个框
       * */
      const eventValueTypeUpData = (val: string, k: number, isCustom: boolean = false) => {
        const _showValuesField = isCustom ? [...customShowValuesField] : [...showValuesField];
        const conditionArr = isCustom ? thisCustomCondition : thisCondition;
        const conditionKey = isCustom ? 'customConditions' : 'conditions';
        conditionArr.current[k] = { ...conditionArr.current[k], valueType: val };
        if (val === FIXED) {
          _showValuesField[k] = isCustom ? customFieldCodesType[k] : fieldCodesType[k];
        } else {
          _showValuesField[k] = val;
        }
        if (isCustom) {
          setCustomShowValuesField(_showValuesField);
        } else {
          setShowValuesField(_showValuesField);
        }
        // 第四个框清空
        const formObj = {};
        formObj[`${conditionKey}[${k}].value`] = null;
        form.setFieldsValue(formObj);
      };

      /**
       * 选择字段,第四个框
       */
      const valueUpData = (_, k: number, { props }: any, isCustom: boolean = false) => {
        const formObj = {};
        const conditionKey = isCustom ? 'customConditions' : 'conditions';
        formObj[`${conditionKey}[${k}].rightFieldUniqueKey`] = props?.value; // 设置_value
        formObj[`${conditionKey}[${k}].value`] = props?._value; // 设置_value
        formObj[`${conditionKey}[${k}].rightHeaderRelationCode`] = props?.rightHeaderRelationCode; // 设置leftHeaderRelationCode
        form.setFieldsValue(formObj);
      };
      const {
        relation = null,
        modelRelation = {},
        // conditions: conditionsInit = [],
      } = rightFormData as any; // fixme modelRelation在新建时有故接口中无 relation查询时有
      const {
        relationFields = [],
        masterDataSourceType = '??',
        relationDataSourceType = '??',
        masterSchemaName = '??',
        relationSchemaName = '??',
        masterTable = '??',
        relationTable = '??',
      } = relation || modelRelation || {};

      /**
       * 展示sql模态框
       * @param {number} k 当前条件索引
       */
      const handleShowSqlModal = (k: number, isCustom: boolean = false) => {
        const { conditions: originConditions = [], customConditions } = form.getFieldsValue();
        const copyConditions = isCustom ? customConditions : originConditions;
        if (Array.isArray(copyConditions) && copyConditions.length !== 0) {
          sqlDataSet.create({
            sql: copyConditions[k].value,
          });
        } else {
          sqlDataSet.create({});
        }
        setCurrentKey(k);
        setModalVisible(true);
      };

      /**
       * 获取填写的sql值
       * @param {*} k
       */
      const getSqlValue = (k: number, isCustom: boolean = false) => {
        const { conditions: originConditions = [], customConditions } = form.getFieldsValue();
        const copyConditions = isCustom ? customConditions : originConditions;
        if (Array.isArray(copyConditions) && copyConditions.length !== 0) {
          return copyConditions[k].value;
        }
        return undefined;
      };

      const formItems = keys.map((k: number, i: number) => {
        const { operatorType = null, valueType = null } = thisCondition.current[k] || {};
        const disabledFlag = isTenant && dataObjectDetailType !== 'create';
        return (
          <Row gutter={8} key={k} className={styles['filter-condition-item']}>
            <Col span={2}>
              <span className={styles['sort-num']}>
                <i>{i + 1}</i>
              </span>
            </Col>
            {/* 隐藏字段 用于后端存储 */}
            <Col hidden>
              {isTenant && dataObjectDetailType === 'edit' && (
                <Form.Item>
                  {getFieldDecorator(`conditions[${k}].headerId`, {
                    initialValue: thisCondition.current[k]?.headerId,
                  })(<Input />)}
                </Form.Item>
              )}
              <Form.Item>
                {getFieldDecorator(`conditions[${k}].leftFieldType`, {
                  initialValue: thisCondition.current[k]?.leftFieldType,
                })(<Input />)}
              </Form.Item>
              <Form.Item>
                {getFieldDecorator(`conditions[${k}].leftHeaderRelationCode`, {
                  initialValue: thisCondition.current[k]?.leftHeaderRelationCode,
                })(<Input />)}
              </Form.Item>
              <Form.Item>
                {getFieldDecorator(`conditions[${k}].fieldCode`, {
                  initialValue: thisCondition.current[k]?.fieldCode,
                })(<Input />)}
              </Form.Item>
              <Form.Item>
                {getFieldDecorator(`conditions[${k}].dateOrTime`, {
                  initialValue: thisCondition.current[k]?.dateOrTime,
                })(<Input />)}
              </Form.Item>
            </Col>
            <Col span={5}>
              <Form.Item>
                {getFieldDecorator(`conditions[${k}].leftFieldUniqueKey`, {
                  initialValue: thisCondition.current[k]?.leftFieldUniqueKey,
                  validateTrigger: ['onChange', 'onBlur'],
                  rules: [
                    {
                      required: true,
                      message: '请填写字段',
                    },
                  ],
                })(
                  <Select
                    disabled={disabledFlag}
                    placeholder="请选择字段"
                    showSearch
                    filterOption={(input, option) =>
                      (option?.props?.children as any)
                        ?.toLowerCase()
                        ?.indexOf(input.toLowerCase()) >= 0
                    }
                    onChange={(e, _nodeData) => eventFieldCodeUpData(e, k, _nodeData)}
                    optionLabelProp="name"
                  >
                    {fieldOptionData.map((groupData) => {
                      return (
                        <OptGroup
                          key={`${groupData.logicModelCode}${groupData.relationCode}`}
                          label={
                            <div
                              style={{
                                whiteSpace: 'nowrap',
                                textOverflow: 'ellipsis',
                                overflow: 'hidden',
                              }}
                            >
                              {groupData.logicModelName}
                              {groupData.relationCode && !groupData.masterFlag && (
                                <Tooltip
                                  placement="top"
                                  title={`关系名：${
                                    groupData.relationName || '当前数据已丢失，请检查！'
                                  }`}
                                >
                                  <ImgIcon
                                    name="modelRelation.svg"
                                    size={14}
                                    style={{ marginLeft: '4px' }}
                                  />
                                </Tooltip>
                              )}
                              {!groupData.relationCode && groupData.masterFlag && (
                                <Tooltip placement="top" title="主模型">
                                  <ImgIcon
                                    name="main-icon.svg"
                                    size={16}
                                    style={{ margin: '0px 4px' }}
                                  />
                                </Tooltip>
                              )}
                            </div>
                          }
                        >
                          {groupData.modelFields.map((optData: any) => (
                            <Option
                              fieldCode={optData?.fieldCode || optData.code} // 模型字段取code 虚拟字段属于数据对象字段只有fieldCodeCode 因为在穿梭框那一步模型字段转可用字段把code删掉了
                              leftFieldType={optData.fieldType}
                              leftHeaderRelationCode={groupData.relationCode}
                              key={optData.leftFieldUniqueKey}
                              value={optData.leftFieldUniqueKey}
                              type={optData.dataType}
                              name={
                                <>
                                  {`${optData.displayName}`}
                                  {groupData.relationCode && !groupData.masterFlag && (
                                    <Tooltip
                                      placement="top"
                                      title={`关系名：${
                                        groupData.relationName || '当前数据已丢失，请检查！'
                                      }`}
                                    >
                                      <ImgIcon
                                        name="modelRelation.svg"
                                        size={14}
                                        style={{ marginLeft: '4px' }}
                                      />
                                    </Tooltip>
                                  )}
                                  {!groupData.relationCode && groupData.masterFlag && (
                                    <Tooltip placement="top" title="主模型">
                                      <ImgIcon
                                        name="main-icon.svg"
                                        size={16}
                                        style={{ margin: '0px 4px' }}
                                      />
                                    </Tooltip>
                                  )}
                                </>
                              }
                            >
                              {optData.displayName}
                            </Option>
                          ))}
                        </OptGroup>
                      );
                    })}
                  </Select>
                )}
              </Form.Item>
            </Col>
            <Col span={5}>
              <Form.Item>
                {getFieldDecorator(`conditions[${k}].operatorType`, {
                  initialValue: thisCondition.current[k]?.operatorType,
                  validateTrigger: ['onChange', 'onBlur'],
                  rules: [
                    {
                      required: true,
                      whitespace: true,
                      message: '请填写判定条件',
                    },
                  ],
                })(
                  <Select
                    placeholder="请选择判断条件"
                    onChange={(val: any) => eventOperatorTypeUpData(val, k)}
                    disabled={!fieldCodesType[k] || disabledFlag}
                  >
                    {[STRING, NUMBER, BOOLEAN, DATE].includes(fieldCodesType[k]) && (
                      <Option value="IS_NULL">空</Option>
                    )}
                    {[STRING, NUMBER, BOOLEAN, DATE].includes(fieldCodesType[k]) && (
                      <Option value="IS_NOT_NULL">非空</Option>
                    )}
                    {[STRING, NUMBER, BOOLEAN, DATE].includes(fieldCodesType[k]) && (
                      <Option value="EQUAL">等于</Option>
                    )}
                    {[STRING, NUMBER, BOOLEAN, DATE].includes(fieldCodesType[k]) && (
                      <Option value="NOT_EQUAL">不等于</Option>
                    )}
                    {[NUMBER, DATE].includes(fieldCodesType[k]) && (
                      <Option value="GREATER_THAN">大于</Option>
                    )}
                    {[NUMBER, DATE].includes(fieldCodesType[k]) && (
                      <Option value="GREATER_THAN_OR_EQUAL_TO">大于等于</Option>
                    )}
                    {[NUMBER, DATE].includes(fieldCodesType[k]) && (
                      <Option value="LESS_THAN">小于</Option>
                    )}
                    {[NUMBER, DATE].includes(fieldCodesType[k]) && (
                      <Option value="LESS_THAN_OR_EQUAL_TO">小于等于</Option>
                    )}
                    {[STRING].includes(fieldCodesType[k]) && (
                      <Option value="FULLY_FUZZY">全模糊</Option>
                    )}
                    {[STRING].includes(fieldCodesType[k]) && (
                      <Option value="BEFORE_FUZZY">前模糊</Option>
                    )}
                    {[STRING].includes(fieldCodesType[k]) && (
                      <Option value="AFTER_FUZZY">后模糊</Option>
                    )}
                    {[STRING, NUMBER, DATE].includes(fieldCodesType[k]) && (
                      <Option value="IN">包含</Option>
                    )}
                    {[STRING, NUMBER, DATE].includes(fieldCodesType[k]) && (
                      <Option value="NOT_IN">不包含</Option>
                    )}
                  </Select>
                )}
              </Form.Item>
            </Col>
            <Col span={5}>
              {operatorType !== IS_NULL && operatorType !== IS_NOT_NULL && (
                <div>
                  {fieldCodesType[k] && operatorType ? (
                    <Form.Item>
                      {getFieldDecorator(`conditions[${k}].valueType`, {
                        initialValue: thisCondition.current[k].valueType,
                        validateTrigger: ['onChange', 'onBlur'],
                        rules: [
                          {
                            required: true,
                            message: '请填写判定类型',
                          },
                        ],
                      })(
                        <Select
                          disabled={disabledFlag}
                          placeholder="请选择过滤方式"
                          onChange={(val: any) => eventValueTypeUpData(val, k)}
                        >
                          <Option value={FIXED}>固定值</Option>
                          {operatorType !== 'FULLY_FUZZY' &&
                            operatorType !== 'BEFORE_FUZZY' &&
                            operatorType !== 'AFTER_FUZZY' && (
                              <Option value={FIELD}>模型字段</Option>
                            )}
                          <Option value={SQL}>自定义sql</Option>
                        </Select>
                      )}
                    </Form.Item>
                  ) : (
                    <Form.Item>
                      <Select disabled placeholder="请选择过滤方式">
                        <Option value={FIXED}>固定值</Option>
                        <Option value={FIELD}>模型字段</Option>
                        <Option value={SQL}>自定义sql</Option>
                      </Select>
                    </Form.Item>
                  )}
                </div>
              )}
            </Col>
            <Col span={5}>
              {operatorType !== IS_NULL && operatorType !== IS_NOT_NULL && (
                <div>
                  {fieldCodesType[k] && valueType && operatorType ? (
                    <div>
                      {/* // 字符串 操作符等于包含不包含且固定值 */}
                      {(showValuesField[k] === STRING ||
                        (['NOT_IN', 'IN'].includes(thisCondition?.current[k]?.operatorType) &&
                          thisCondition?.current[k]?.valueType === FIXED)) && (
                          <Form.Item>
                            {getFieldDecorator(`conditions[${k}].value`, {
                            initialValue: thisCondition.current[k].value,
                            rules: [
                              {
                                required: true,
                                message: '请填写判定内容',
                              },
                            ],
                          })(<Input placeholder="请输入固定值" disabled={disabledFlag} />)}
                          </Form.Item>
                      )}
                      {/* 时间 区分日期时间 */}
                      {showValuesField[k] === DATE &&
                        thisCondition.current[k].dateOrTime === DATE &&
                        !(
                          ['NOT_IN', 'IN'].includes(thisCondition?.current[k]?.operatorType) &&
                          thisCondition?.current[k]?.valueType === FIXED
                        ) && (
                          <Form.Item>
                            {getFieldDecorator(`conditions[${k}].value`, {
                              rules: [
                                {
                                  required: true,
                                  message: '请填写判定内容',
                                },
                              ],
                            })(
                              <DatePicker
                                disabled={disabledFlag}
                                format="YYYY-MM-DD"
                                style={{ width: '100%' }}
                              />
                            )}
                          </Form.Item>
                        )}
                      {showValuesField[k] === DATE &&
                        [TIME, TIMESTAMP].includes(thisCondition.current[k].dateOrTime) &&
                        !(
                          ['NOT_IN', 'IN'].includes(thisCondition?.current[k]?.operatorType) &&
                          thisCondition?.current[k]?.valueType === FIXED
                        ) && (
                          <Form.Item>
                            {getFieldDecorator(`conditions[${k}].value`, {
                              rules: [
                                {
                                  required: true,
                                  message: '请填写判定内容',
                                },
                              ],
                            })(
                              <DatePicker
                                disabled={disabledFlag}
                                showTime={{ format: 'HH:mm:ss' }}
                                format="YYYY-MM-DD HH:mm:ss"
                                style={{ width: '100%' }}
                              />
                            )}
                          </Form.Item>
                        )}
                      {/* 数字 */}
                      {showValuesField[k] === NUMBER &&
                        !(
                          ['NOT_IN', 'IN'].includes(thisCondition?.current[k]?.operatorType) &&
                          thisCondition?.current[k]?.valueType === FIXED
                        ) && (
                          <Form.Item>
                            {getFieldDecorator(`conditions[${k}].value`, {
                              rules: [
                                {
                                  required: true,
                                  message: '请填写判定内容',
                                },
                              ],
                            })(<InputNumber disabled={disabledFlag} placeholder="请输入数字" />)}
                          </Form.Item>
                        )}
                      {/* url */}
                      {showValuesField[k] === URLPAEAM && (
                        <Form.Item>
                          {getFieldDecorator(`conditions[${k}].value`, {
                            rules: [
                              {
                                required: true,
                                message: '请填写判定内容',
                              },
                            ],
                          })(
                            <Input disabled={disabledFlag} addonBefore="[query:" addonAfter="]" />
                          )}
                        </Form.Item>
                      )}
                      {/* 是否下拉框 */}
                      {showValuesField[k] === BOOLEAN && (
                        <Form.Item>
                          {getFieldDecorator(`conditions[${k}].value`, {
                            rules: [
                              {
                                required: true,
                                message: '请填写判定内容',
                              },
                            ],
                          })(
                            <Select disabled={disabledFlag}>
                              <Option value="1">是</Option>
                              <Option value="0">否</Option>
                            </Select>
                          )}
                        </Form.Item>
                      )}
                      {/* 字段选择 */}
                      {/* 隐藏字段 用于后端存储 */}
                      {showValuesField[k] === FIELD && (
                        <Col hidden>
                          <Form.Item>
                            {getFieldDecorator(`conditions[${k}].rightHeaderRelationCode`, {
                              initialValue: thisCondition.current[k]?.rightHeaderRelationCode,
                            })(<Input />)}
                          </Form.Item>
                          <Form.Item>
                            {getFieldDecorator(`conditions[${k}].value`, {
                              initialValue: thisCondition.current[k]?.value,
                            })(<Input />)}
                          </Form.Item>
                        </Col>
                      )}
                      {showValuesField[k] === FIELD && (
                        <Form.Item>
                          {getFieldDecorator(`conditions[${k}].rightFieldUniqueKey`, {
                            rules: [
                              {
                                required: true,
                                message: '请填写模型字段',
                              },
                            ],
                          })(
                            <Select
                              disabled={disabledFlag}
                              placeholder="请选择模型字段"
                              showSearch
                              filterOption={(input, option) =>
                                (option?.props?.children as any)
                                  ?.toLowerCase()
                                  ?.indexOf(input.toLowerCase()) >= 0
                              }
                              onChange={(e, _nodeData) => valueUpData(e, k, _nodeData)}
                              optionLabelProp="name"
                            >
                              {fieldOptionData2.map((groupData) => (
                                <OptGroup
                                  key={`${groupData.logicModelCode}${groupData.relationCode}`}
                                  // label={groupData.name}
                                  label={
                                    <div
                                      style={{
                                        whiteSpace: 'nowrap',
                                        textOverflow: 'ellipsis',
                                        overflow: 'hidden',
                                      }}
                                    >
                                      {groupData.logicModelName}
                                      {groupData.relationCode && !groupData.masterFlag && (
                                        <Tooltip
                                          placement="top"
                                          title={`关系名：${
                                            groupData.relationName || '当前数据已丢失，请检查！'
                                          }`}
                                        >
                                          <ImgIcon
                                            name="modelRelation.svg"
                                            size={14}
                                            style={{ marginLeft: '4px' }}
                                          />
                                        </Tooltip>
                                      )}
                                      {!groupData.relationCode && groupData.masterFlag && (
                                        <Tooltip placement="top" title="主模型">
                                          <ImgIcon
                                            name="main-icon.svg"
                                            size={16}
                                            style={{ margin: '0px 4px' }}
                                          />
                                        </Tooltip>
                                      )}
                                    </div>
                                  }
                                >
                                  {groupData.modelFields.map((optData) => (
                                    <Option
                                      _value={optData.code} // fieldList接口没有
                                      rightHeaderRelationCode={groupData.relationCode}
                                      key={optData.rightFieldUniqueKey}
                                      value={optData.rightFieldUniqueKey}
                                      type={optData.dataType}
                                      name={
                                        <>
                                          {`${optData.displayName}`}
                                          {groupData.relationCode && !groupData.masterFlag && (
                                            <Tooltip
                                              placement="top"
                                              title={`关系名：${
                                                groupData.relationName || '当前数据已丢失，请检查！'
                                              }`}
                                            >
                                              <ImgIcon
                                                name="modelRelation.svg"
                                                size={14}
                                                style={{ marginLeft: '4px' }}
                                              />
                                            </Tooltip>
                                          )}
                                          {!groupData.relationCode && groupData.masterFlag && (
                                            <Tooltip placement="top" title="主模型">
                                              <ImgIcon
                                                name="main-icon.svg"
                                                size={16}
                                                style={{ margin: '0px 4px' }}
                                              />
                                            </Tooltip>
                                          )}
                                        </>
                                      }
                                    >
                                      {optData.displayName}
                                    </Option>
                                  ))}
                                </OptGroup>
                              ))}
                            </Select>
                          )}
                        </Form.Item>
                      )}
                      {/* 自定义sql */}
                      {showValuesField[k] === SQL && (
                        <Form.Item>
                          {getFieldDecorator(`conditions[${k}].value`, {
                            // initialValue: (conditionsInit[k] || {}).value,
                            rules: [
                              {
                                required: true,
                                message: '请填写自定义sql',
                              },
                            ],
                          })(
                            <div
                              className={styles['sql-input']}
                              onClick={() => handleShowSqlModal(k)}
                            >
                              <Input
                                disabled={disabledFlag}
                                value={getSqlValue(k)}
                                style={{ cursor: 'pointer' }}
                                // disabled={editPer || masterFlag !== 1}
                                readOnly
                                placeholder="请填写自定义sql"
                              />
                            </div>
                          )}
                        </Form.Item>
                      )}
                    </div>
                  ) : (
                    <Form.Item>
                      <Input disabled placeholder="请选择或进行填写" />
                    </Form.Item>
                  )}
                </div>
              )}
            </Col>
            <Col span={1} style={{ display: disabledFlag ? 'none' : 'block' }}>
              <Icon
                style={{ fontSize: '20px', color: '#f75e5e', marginTop: '8px', cursor: 'pointer' }}
                type="delete"
                onClick={() => remove(k)}
              />
            </Col>
          </Row>
        );
      });

      const customFormItems = customKeys.map((k: number, i: number) => {
        const { operatorType = null, valueType = null } = thisCustomCondition.current[k] || {};
        return (
          <Row gutter={8} key={k} className={styles['filter-condition-item']}>
            <Col span={2}>
              <span className={styles['sort-num']}>
                <i>{i + 1}</i>
              </span>
            </Col>
            {/* 隐藏字段 用于后端存储 */}
            <Col hidden>
              {isTenant && dataObjectDetailType === 'edit' && (
                <Form.Item>
                  {getFieldDecorator(`customConditions[${k}].headerId`, {
                    initialValue: thisCustomCondition.current[k]?.headerId,
                  })(<Input />)}
                </Form.Item>
              )}
              <Form.Item>
                {getFieldDecorator(`customConditions[${k}].leftFieldType`, {
                  initialValue: thisCustomCondition.current[k]?.leftFieldType,
                })(<Input />)}
              </Form.Item>
              <Form.Item>
                {getFieldDecorator(`customConditions[${k}].leftHeaderRelationCode`, {
                  initialValue: thisCustomCondition.current[k]?.leftHeaderRelationCode,
                })(<Input />)}
              </Form.Item>
              <Form.Item>
                {getFieldDecorator(`customConditions[${k}].fieldCode`, {
                  initialValue: thisCustomCondition.current[k]?.fieldCode,
                })(<Input />)}
              </Form.Item>
              <Form.Item>
                {getFieldDecorator(`customConditions[${k}].dateOrTime`, {
                  initialValue: thisCustomCondition.current[k]?.dateOrTime,
                })(<Input />)}
              </Form.Item>
            </Col>
            <Col span={5}>
              <Form.Item>
                {getFieldDecorator(`customConditions[${k}].leftFieldUniqueKey`, {
                  initialValue: thisCustomCondition.current[k]?.leftFieldUniqueKey,
                  validateTrigger: ['onChange', 'onBlur'],
                  rules: [
                    {
                      required: true,
                      message: '请填写字段',
                    },
                  ],
                })(
                  <Select
                    placeholder="请选择字段"
                    showSearch
                    filterOption={(input, option) =>
                      (option?.props?.children as any)
                        ?.toLowerCase()
                        ?.indexOf(input.toLowerCase()) >= 0
                    }
                    onChange={(e, _nodeData) => eventFieldCodeUpData(e, k, _nodeData, true)}
                    optionLabelProp="name"
                  >
                    {fieldOptionData.map((groupData) => {
                      return (
                        <OptGroup
                          key={`${groupData.logicModelCode}${groupData.relationCode}`}
                          label={
                            <div
                              style={{
                                whiteSpace: 'nowrap',
                                textOverflow: 'ellipsis',
                                overflow: 'hidden',
                              }}
                            >
                              {groupData.logicModelName}
                              {groupData.relationCode ? (
                                <Tooltip
                                  placement="top"
                                  title={`关系名：${groupData.relationName}`}
                                >
                                  <ImgIcon
                                    name="modelRelation.svg"
                                    size={14}
                                    style={{ marginLeft: '4px' }}
                                  />
                                </Tooltip>
                              ) : (
                                <Tooltip placement="top" title="主模型">
                                  <ImgIcon
                                    name="main-icon.svg"
                                    size={16}
                                    style={{ margin: '0px 4px' }}
                                  />
                                </Tooltip>
                              )}
                            </div>
                          }
                        >
                          {groupData.modelFields.map((optData: any) => (
                            <Option
                              fieldCode={optData?.fieldCode || optData.code} // 模型字段取code 虚拟字段属于数据对象字段只有fieldCodeCode 因为在穿梭框那一步模型字段转可用字段把code删掉了
                              leftFieldType={optData.fieldType}
                              leftHeaderRelationCode={groupData.relationCode}
                              key={optData.leftFieldUniqueKey}
                              value={optData.leftFieldUniqueKey}
                              type={optData.dataType}
                              name={
                                <>
                                  {`${optData.displayName}`}
                                  {groupData.relationName ? (
                                    <Tooltip
                                      placement="top"
                                      title={`关系名：${groupData.relationName}`}
                                    >
                                      <ImgIcon
                                        name="modelRelation.svg"
                                        size={14}
                                        style={{ marginLeft: '4px' }}
                                      />
                                    </Tooltip>
                                  ) : (
                                    <Tooltip placement="top" title="主模型">
                                      <ImgIcon
                                        name="main-icon.svg"
                                        size={16}
                                        style={{ margin: '0px 4px' }}
                                      />
                                    </Tooltip>
                                  )}
                                </>
                              }
                            >
                              {optData.displayName}
                            </Option>
                          ))}
                        </OptGroup>
                      );
                    })}
                  </Select>
                )}
              </Form.Item>
            </Col>
            <Col span={5}>
              <Form.Item>
                {getFieldDecorator(`customConditions[${k}].operatorType`, {
                  initialValue: thisCustomCondition.current[k]?.operatorType,
                  validateTrigger: ['onChange', 'onBlur'],
                  rules: [
                    {
                      required: true,
                      whitespace: true,
                      message: '请填写判定条件',
                    },
                  ],
                })(
                  <Select
                    placeholder="请选择判断条件"
                    onChange={(val: any) => eventOperatorTypeUpData(val, k, true)}
                    disabled={!customFieldCodesType[k]}
                  >
                    {[STRING, NUMBER, BOOLEAN, DATE].includes(customFieldCodesType[k]) && (
                      <Option value="IS_NULL">空</Option>
                    )}
                    {[STRING, NUMBER, BOOLEAN, DATE].includes(customFieldCodesType[k]) && (
                      <Option value="IS_NOT_NULL">非空</Option>
                    )}
                    {[STRING, NUMBER, BOOLEAN, DATE].includes(customFieldCodesType[k]) && (
                      <Option value="EQUAL">等于</Option>
                    )}
                    {[STRING, NUMBER, BOOLEAN, DATE].includes(customFieldCodesType[k]) && (
                      <Option value="NOT_EQUAL">不等于</Option>
                    )}
                    {[NUMBER, DATE].includes(customFieldCodesType[k]) && (
                      <Option value="GREATER_THAN">大于</Option>
                    )}
                    {[NUMBER, DATE].includes(customFieldCodesType[k]) && (
                      <Option value="GREATER_THAN_OR_EQUAL_TO">大于等于</Option>
                    )}
                    {[NUMBER, DATE].includes(customFieldCodesType[k]) && (
                      <Option value="LESS_THAN">小于</Option>
                    )}
                    {[NUMBER, DATE].includes(customFieldCodesType[k]) && (
                      <Option value="LESS_THAN_OR_EQUAL_TO">小于等于</Option>
                    )}
                    {[STRING].includes(customFieldCodesType[k]) && (
                      <Option value="FULLY_FUZZY">全模糊</Option>
                    )}
                    {[STRING].includes(customFieldCodesType[k]) && (
                      <Option value="BEFORE_FUZZY">前模糊</Option>
                    )}
                    {[STRING].includes(customFieldCodesType[k]) && (
                      <Option value="AFTER_FUZZY">后模糊</Option>
                    )}
                    {[STRING, NUMBER, DATE].includes(customFieldCodesType[k]) && (
                      <Option value="IN">包含</Option>
                    )}
                    {[STRING, NUMBER, DATE].includes(customFieldCodesType[k]) && (
                      <Option value="NOT_IN">不包含</Option>
                    )}
                  </Select>
                )}
              </Form.Item>
            </Col>
            <Col span={5}>
              {operatorType !== IS_NULL && operatorType !== IS_NOT_NULL && (
                <div>
                  {customFieldCodesType[k] && operatorType ? (
                    <Form.Item>
                      {getFieldDecorator(`customConditions[${k}].valueType`, {
                        initialValue: thisCustomCondition.current[k].valueType,
                        validateTrigger: ['onChange', 'onBlur'],
                        rules: [
                          {
                            required: true,
                            message: '请填写判定类型',
                          },
                        ],
                      })(
                        <Select
                          placeholder="请选择过滤方式"
                          onChange={(val: any) => eventValueTypeUpData(val, k, true)}
                        >
                          <Option value={FIXED}>固定值</Option>
                          {operatorType !== 'FULLY_FUZZY' &&
                            operatorType !== 'BEFORE_FUZZY' &&
                            operatorType !== 'AFTER_FUZZY' && (
                              <Option value={FIELD}>模型字段</Option>
                            )}
                          <Option value={SQL}>自定义sql</Option>
                        </Select>
                      )}
                    </Form.Item>
                  ) : (
                    <Form.Item>
                      <Select disabled placeholder="请选择过滤方式">
                        <Option value={FIXED}>固定值</Option>
                        <Option value={FIELD}>模型字段</Option>
                        <Option value={SQL}>自定义sql</Option>
                      </Select>
                    </Form.Item>
                  )}
                </div>
              )}
            </Col>
            <Col span={5}>
              {operatorType !== IS_NULL && operatorType !== IS_NOT_NULL && (
                <div>
                  {customFieldCodesType[k] && valueType && operatorType ? (
                    <div>
                      {/* // 字符串 操作符等于包含不包含且固定值 */}
                      {(customShowValuesField[k] === STRING ||
                        (['NOT_IN', 'IN'].includes(thisCustomCondition?.current[k]?.operatorType) &&
                          thisCustomCondition?.current[k]?.valueType === FIXED)) && (
                          <Form.Item>
                            {getFieldDecorator(`customConditions[${k}].value`, {
                            initialValue: thisCustomCondition.current[k].value,
                            rules: [
                              {
                                required: true,
                                message: '请填写判定内容',
                              },
                            ],
                          })(<Input placeholder="请输入固定值" />)}
                          </Form.Item>
                      )}
                      {/* 时间 区分日期时间 */}
                      {customShowValuesField[k] === DATE &&
                        thisCustomCondition.current[k].dateOrTime === DATE &&
                        !(
                          ['NOT_IN', 'IN'].includes(
                            thisCustomCondition?.current[k]?.operatorType
                          ) && thisCustomCondition?.current[k]?.valueType === FIXED
                        ) && (
                          <Form.Item>
                            {getFieldDecorator(`customConditions[${k}].value`, {
                              rules: [
                                {
                                  required: true,
                                  message: '请填写判定内容',
                                },
                              ],
                            })(<DatePicker format="YYYY-MM-DD" style={{ width: '100%' }} />)}
                          </Form.Item>
                        )}
                      {customShowValuesField[k] === DATE &&
                        [TIME, TIMESTAMP].includes(thisCustomCondition.current[k].dateOrTime) &&
                        !(
                          ['NOT_IN', 'IN'].includes(
                            thisCustomCondition?.current[k]?.operatorType
                          ) && thisCustomCondition?.current[k]?.valueType === FIXED
                        ) && (
                          <Form.Item>
                            {getFieldDecorator(`customConditions[${k}].value`, {
                              rules: [
                                {
                                  required: true,
                                  message: '请填写判定内容',
                                },
                              ],
                            })(
                              <DatePicker
                                showTime={{ format: 'HH:mm:ss' }}
                                format="YYYY-MM-DD HH:mm:ss"
                                style={{ width: '100%' }}
                              />
                            )}
                          </Form.Item>
                        )}
                      {/* 数字 */}
                      {customShowValuesField[k] === NUMBER &&
                        !(
                          ['NOT_IN', 'IN'].includes(
                            thisCustomCondition?.current[k]?.operatorType
                          ) && thisCustomCondition?.current[k]?.valueType === FIXED
                        ) && (
                          <Form.Item>
                            {getFieldDecorator(`customConditions[${k}].value`, {
                              rules: [
                                {
                                  required: true,
                                  message: '请填写判定内容',
                                },
                              ],
                            })(<InputNumber placeholder="请输入数字" />)}
                          </Form.Item>
                        )}
                      {/* url */}
                      {customShowValuesField[k] === URLPAEAM && (
                        <Form.Item>
                          {getFieldDecorator(`customConditions[${k}].value`, {
                            rules: [
                              {
                                required: true,
                                message: '请填写判定内容',
                              },
                            ],
                          })(<Input addonBefore="[query:" addonAfter="]" />)}
                        </Form.Item>
                      )}
                      {/* 是否下拉框 */}
                      {customShowValuesField[k] === BOOLEAN && (
                        <Form.Item>
                          {getFieldDecorator(`customConditions[${k}].value`, {
                            rules: [
                              {
                                required: true,
                                message: '请填写判定内容',
                              },
                            ],
                          })(
                            <Select>
                              <Option value="1">是</Option>
                              <Option value="0">否</Option>
                            </Select>
                          )}
                        </Form.Item>
                      )}
                      {/* 字段选择 */}
                      {/* 隐藏字段 用于后端存储 */}
                      {customShowValuesField[k] === FIELD && (
                        <Col hidden>
                          <Form.Item>
                            {getFieldDecorator(`customConditions[${k}].rightHeaderRelationCode`, {
                              initialValue: thisCustomCondition.current[k]?.rightHeaderRelationCode,
                            })(<Input />)}
                          </Form.Item>
                          <Form.Item>
                            {getFieldDecorator(`customConditions[${k}].value`, {
                              initialValue: thisCustomCondition.current[k]?.value,
                            })(<Input />)}
                          </Form.Item>
                        </Col>
                      )}
                      {customShowValuesField[k] === FIELD && (
                        <Form.Item>
                          {getFieldDecorator(`customConditions[${k}].rightFieldUniqueKey`, {
                            rules: [
                              {
                                required: true,
                                message: '请填写模型字段',
                              },
                            ],
                          })(
                            <Select
                              placeholder="请选择模型字段"
                              showSearch
                              filterOption={(input, option) =>
                                (option?.props?.children as any)
                                  ?.toLowerCase()
                                  ?.indexOf(input.toLowerCase()) >= 0
                              }
                              onChange={(e, _nodeData) => valueUpData(e, k, _nodeData, true)}
                              optionLabelProp="name"
                            >
                              {fieldOptionData2.map((groupData) => (
                                <OptGroup
                                  key={`${groupData.logicModelCode}${groupData.relationCode}`}
                                  // label={groupData.name}
                                  label={
                                    <div
                                      style={{
                                        whiteSpace: 'nowrap',
                                        textOverflow: 'ellipsis',
                                        overflow: 'hidden',
                                      }}
                                    >
                                      {groupData.logicModelName}
                                      {groupData.relationCode ? (
                                        <Tooltip
                                          placement="top"
                                          title={`关系名：${groupData.relationName}`}
                                        >
                                          <ImgIcon
                                            name="modelRelation.svg"
                                            size={14}
                                            style={{ marginLeft: '4px' }}
                                          />
                                        </Tooltip>
                                      ) : (
                                        <Tooltip placement="top" title="主模型">
                                          <ImgIcon
                                            name="main-icon.svg"
                                            size={16}
                                            style={{ margin: '0px 4px' }}
                                          />
                                        </Tooltip>
                                      )}
                                    </div>
                                  }
                                >
                                  {groupData.modelFields.map((optData) => (
                                    <Option
                                      _value={optData.code} // fieldList接口没有
                                      rightHeaderRelationCode={groupData.relationCode}
                                      key={optData.rightFieldUniqueKey}
                                      value={optData.rightFieldUniqueKey}
                                      type={optData.dataType}
                                      name={
                                        <>
                                          {`${optData.displayName}`}
                                          {groupData.relationName ? (
                                            <Tooltip
                                              placement="top"
                                              title={`关系名：${groupData.relationName}`}
                                            >
                                              <ImgIcon
                                                name="modelRelation.svg"
                                                size={14}
                                                style={{ marginLeft: '4px' }}
                                              />
                                            </Tooltip>
                                          ) : (
                                            <Tooltip placement="top" title="主模型">
                                              <ImgIcon
                                                name="main-icon.svg"
                                                size={16}
                                                style={{ margin: '0px 4px' }}
                                              />
                                            </Tooltip>
                                          )}
                                        </>
                                      }
                                    >
                                      {optData.displayName}
                                    </Option>
                                  ))}
                                </OptGroup>
                              ))}
                            </Select>
                          )}
                        </Form.Item>
                      )}
                      {/* 自定义sql */}
                      {customShowValuesField[k] === SQL && (
                        <Form.Item>
                          {getFieldDecorator(`customConditions[${k}].value`, {
                            // initialValue: (conditionsInit[k] || {}).value,
                            rules: [
                              {
                                required: true,
                                message: '请填写自定义sql',
                              },
                            ],
                          })(
                            <div
                              className={styles['sql-input']}
                              onClick={() => handleShowSqlModal(k, true)}
                            >
                              <Input
                                value={getSqlValue(k, true)}
                                style={{ cursor: 'pointer' }}
                                // disabled={editPer || masterFlag !== 1}
                                readOnly
                                placeholder="请填写自定义sql"
                              />
                            </div>
                          )}
                        </Form.Item>
                      )}
                    </div>
                  ) : (
                    <Form.Item>
                      <Input disabled placeholder="请选择或进行填写" />
                    </Form.Item>
                  )}
                </div>
              )}
            </Col>
            <Col span={1}>
              <Icon
                style={{ fontSize: '20px', color: '#f75e5e', marginTop: '8px', cursor: 'pointer' }}
                type="delete"
                onClick={() => removeCustom(k)}
              />
            </Col>
          </Row>
        );
      });

      // 模态框取消
      const handleModalCancel = () => {
        setModalVisible(false);
        // sqlDataSet.reset();
      };

      // 模态框保存
      const handleModalSave = async () => {
        const conditionsKey = isTenant ? 'customConditions' : 'conditions';
        const flag = await sqlDataSet.validate();
        if (!flag) return;
        const value = sqlDataSet?.current?.get('sql');
        form.setFieldsValue({
          [`${conditionsKey}[${currentKey}].value`]: value,
        });
        setModalVisible(false);
      };

      // 模态框底部按钮
      const footer = [
        <Button onClick={handleModalCancel}>取消</Button>,
        <Button
          color={ButtonColor.blue}
          onClick={handleModalSave}
          style={{ backgroundColor: '#29bece', color: '#fff' }}
        >
          保存
        </Button>,
      ];

      /**
       * 关系名称拼接
       * @param {*} str
       */
      const relationTitle = (str) => {
        let str1: string = '';
        let str2: string = '';
        if (masterDataSourceType) {
          str1 = `${masterSchemaName}(${masterDataSourceType}).${masterTable}.${
            str.masterModelFieldName || '??'
          }`;
        } else {
          str1 = `${masterSchemaName}.${masterTable}.${str.masterModelFieldName || '??'}`;
        }
        if (relationDataSourceType) {
          str2 = `${relationSchemaName}(${relationDataSourceType}).${relationTable}.${
            str.relationModelFieldName || '??'
          }`;
        } else {
          str2 = `${relationSchemaName}.${relationTable}.${str.relationModelFieldName || '??'}`;
        }
        return `${str1}=${str2}`;
      };

      return (
        <Form className={`${styles['model-data-source']} ${styles.input}`}>
          <div hidden={rightFormData.masterFlag === 1}>
            <h4 className={styles['label-4']}>关联属性</h4>
            <Form.Item label="关联方式" required={false}>
              {getFieldDecorator(`joinType`, {
                // validateTrigger: ['onChange', 'onBlur'],
                initialValue: rightFormData.joinType || 'left_join',
                rules: [
                  {
                    required: true,
                    message: '请填写关联方式',
                  },
                ],
              })(
                <Radio.Group
                  disabled={
                    (extendsParentName && getDataObjectDetailType('sourceDetailType') === 'edit') ||
                    getDataObjectDetailType('sourceDetailType') === 'inherit'
                  }
                >
                  <Radio value="inner_join">
                    Inner Join
                    <Tooltip
                      placement="bottom"
                      overlayClassName={styles['tooltip-contain-override']}
                      overlayStyle={{ width: '300px' }}
                      title={
                        <div className={`${styles['img-contain']} ${styles['inner-join-img']}`} />
                      }
                    >
                      <Icon type="question-circle-o" />
                    </Tooltip>
                  </Radio>
                  <Radio value="left_join">
                    Left Join
                    <Tooltip
                      placement="bottom"
                      overlayClassName={styles['tooltip-contain-override']}
                      overlayStyle={{ width: '300px' }}
                      title={
                        <div className={`${styles['img-contain']} ${styles['left-join-img']}`} />
                      }
                    >
                      <Icon type="question-circle-o" />
                    </Tooltip>
                  </Radio>
                  <Radio value="right_join">
                    Right Join
                    <Tooltip
                      placement="bottom"
                      overlayClassName={styles['tooltip-contain-override']}
                      overlayStyle={{ width: '300px' }}
                      title={
                        <div className={`${styles['img-contain']} ${styles['right-join-img']}`} />
                      }
                    >
                      <Icon type="question-circle-o" />
                    </Tooltip>
                  </Radio>
                </Radio.Group>
              )}
            </Form.Item>
            <Form.Item
              label="关联关系" // relationCode
              // style={{
              //   display: relationFields && relationFields.length !== 0 ? 'block' : 'none',
              // }}
            >
              {relationFields.length !== 0 ? (
                <ul className={styles.correlation}>
                  {relationFields?.map((str, i) => (
                    // eslint-disable-next-line react/no-array-index-key
                    <li key={i} className={styles['relation-fields']}>
                      <Tooltip placement="topLeft" title={relationTitle(str)}>
                        {relationTitle(str)}
                      </Tooltip>
                    </li>
                  ))}
                </ul>
              ) : (
                '当前数据已丢失，请检查！'
              )}
            </Form.Item>
            <Form.Item
              className={!rightFormData.operateFlag && styles['ant-disabled']}
              colon={false}
              label={
                <span>
                  <span>是否强关联:</span>
                  <Tooltip
                    placement="top"
                    title="当启用层级的模型关系为双向1-1时，可开启强关联。启用强关联后，主模型执行增删改操作时，关联模型数据将会一起随之变化。"
                  >
                    <Icon type="question-circle-o" />
                  </Tooltip>
                </span>
              }
              required={false}
            >
              {getFieldDecorator(`strongRelationFlag`, {
                // validateTrigger: ['onChange', 'onBlur'],
                initialValue: rightFormData.strongRelationFlag === 1,
                rules: [
                  {
                    required: true,
                    message: '请填写关联方式',
                  },
                ],
              })(
                <Switch
                  disabled={
                    !rightFormData.operateFlag ||
                    (extendsParentName && getDataObjectDetailType('sourceDetailType') === 'edit') ||
                    getDataObjectDetailType('sourceDetailType') === 'inherit'
                  }
                />
              )}
            </Form.Item>
          </div>
          <h4 className={styles['label-4']}>
            过滤条件
            <Tooltip
              placement="top"
              title={
                rightFormData.masterFlag === 1
                  ? '主模型过滤条件适用于所有已使用模型的字段，用于where条件过滤数据权限。'
                  : '关联模型的过滤条件仅适用于关联模型的字段，用于on条件过滤数据权限。'
              }
            >
              <Icon type="question-circle-o" />
            </Tooltip>
          </h4>
          {isTenant &&
          (getDataObjectDetailType('dataObjectDetailType') === 'inherit' ||
            (extendsParentName && getDataObjectDetailType('dataObjectDetailType') === 'edit')) ? (
              <Collapse bordered={false} className={styles['filter-condition-collapse']}>
                <Collapse.Panel header="平台层筛选逻辑" key="platform">
                  {formItems}
                  <h4 className={styles['label-4']}>
                  自定义筛选逻辑
                    <Tooltip
                      placement="top"
                      title="默认筛选逻辑按照过滤条件全部进行AND运算，可自定义连接条件，优先执行自定义筛选逻辑。"
                    >
                      <Icon type="question-circle-o" />
                    </Tooltip>
                  </h4>
                  <Form.Item label="" extra="使用 AND 和 OR 合并筛选器条件行。示例：(1 AND 2) OR 3">
                    {getFieldDecorator(`logicFormula`, {
                    validateTrigger: ['onChange', 'onBlur'],
                    initialValue: rightFormData?.conditions?.[0]?.logicFormula || '',
                    rules: [
                      {
                        // required: true,
                        // whitespace: true,
                        message: '请填写自定义筛选逻辑',
                      },
                      {
                        validator: (rule, value, callback) =>
                          logicFormulaVal(rule, value, callback),
                      },
                    ],
                  })(<Input placeholder="自定义筛选逻辑" disabled />)}
                  </Form.Item>
                </Collapse.Panel>
                <Collapse.Panel header="租户层筛选逻辑" key="tenant">
                  {customFormItems}
                  <Form.Item>
                    <a type="dashed" onClick={addCustom} style={{ width: '60%', color: '#012492' }}>
                      <Icon type="plus" /> 添加条件
                    </a>
                  </Form.Item>
                  <h4 className={styles['label-4']}>
                  自定义筛选逻辑
                    <Tooltip
                      placement="top"
                      title="默认筛选逻辑按照过滤条件全部进行AND运算，可自定义连接条件，优先执行自定义筛选逻辑。"
                    >
                      <Icon type="question-circle-o" />
                    </Tooltip>
                  </h4>
                  <Form.Item label="" extra="使用 AND 和 OR 合并筛选器条件行。示例：(1 AND 2) OR 3">
                    {getFieldDecorator(`customLogicFormula`, {
                    validateTrigger: ['onChange', 'onBlur'],
                    // initialValue: rightFormData.logicFormula || '',
                    // initialValue: () =>
                    // rightFormData &&
                    // rightFormData.conditions &&
                    // rightFormData.conditions[0] &&
                    // rightFormData.conditions[0].logicFormula
                    //   ? rightFormData.conditions[0].logicFormula
                    //   : '',
                    rules: [
                      {
                        // required: true,
                        // whitespace: true,
                        message: '请填写自定义筛选逻辑',
                      },
                      {
                        validator: (rule, value, callback) =>
                          logicFormulaVal(rule, value, callback, true),
                      },
                    ],
                  })(<Input placeholder="自定义筛选逻辑" />)}
                  </Form.Item>
                </Collapse.Panel>
              </Collapse>
          ) : (
            <>
              {formItems}
              <Form.Item>
                <a type="dashed" onClick={add} style={{ width: '60%', color: '#012492' }}>
                  <Icon type="plus" /> 添加条件
                </a>
              </Form.Item>
              <h4 className={styles['label-4']}>
                自定义筛选逻辑
                <Tooltip
                  placement="top"
                  title="默认筛选逻辑按照过滤条件全部进行AND运算，可自定义连接条件，优先执行自定义筛选逻辑。"
                >
                  <Icon type="question-circle-o" />
                </Tooltip>
              </h4>
              <Form.Item label="" extra="使用 AND 和 OR 合并筛选器条件行。示例：(1 AND 2) OR 3">
                {getFieldDecorator(`logicFormula`, {
                  validateTrigger: ['onChange', 'onBlur'],
                  initialValue: rightFormData?.conditions?.[0]?.logicFormula || '',
                  rules: [
                    {
                      // required: true,
                      // whitespace: true,
                      message: '请填写自定义筛选逻辑',
                    },
                    {
                      validator: (rule, value, callback) => logicFormulaVal(rule, value, callback),
                    },
                  ],
                })(<Input placeholder="自定义筛选逻辑" />)}
              </Form.Item>
            </>
          )}
          <div>
            <Modal
              title={
                <div style={{ fontSize: '16px', color: '#333435', fontWeight: 'bold' }}>
                  自定义Sql
                </div>
              }
              visible={modalVisible}
              footer={footer}
              width={790}
              style={{ top: 20, height: '576px' }}
              // onOk={this.handleOk}
              onCancel={handleModalCancel}
              afterClose={() => sqlDataSet.reset()}
            >
              <SqlForm dataSet={sqlDataSet} />
            </Modal>
          </div>
        </Form>
      );
    }
  )
);
export default ListView;
