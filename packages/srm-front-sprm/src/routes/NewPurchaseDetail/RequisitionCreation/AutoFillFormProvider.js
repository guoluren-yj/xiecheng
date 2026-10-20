/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2022-02-14 15:36:50
 * @LastEditors: yanglin
 * @LastEditTime: 2024-03-12 15:49:22
 */

import React, { createContext, useEffect, useState, useMemo, useContext, useCallback } from 'react';

import intl from 'utils/intl';
import { isArray, isFunction } from 'lodash';
import { observer } from 'mobx-react-lite';
// import { DEFAULT_DATETIME_FORMAT, DEFAULT_DATE_FORMAT } from 'utils/constants';

import {
  dynamicDoc,
  fetchDoExecute,
  dynamicDocTemplate,
} from '@/services/purchaseRequisitionCreationService';

import { Store } from '../stores';

export const AutoFillForm = createContext();

// 设置sprm国际化前缀 - common - model
const commonPrompt = 'sprm.common.model.common';

let delayId = 0;
// 头部触发字段队列
const queueHeader = new Set();

// 行部分触发字段队列
const queueLine = new Set();

// 收集触发record 批量编辑时候 不触发自动填单
const collectRecord = new Set();

const DELAY = 500;

const AutoFillFormProvider = function AutoFillFormProvider(props) {
  const { headerDs, listDs, prSourcePlatform } = useContext(Store);

  const { current } = headerDs;
  const { children } = props;
  const [formFields, setFormFields] = useState([]); // 头触发自动填单的埋点字段
  const [listFields, setListFields] = useState(['null']); // 行触发自动填单的埋点字段
  const [templateCode, setTemplateCode] = useState(null);

  // 查询业务规则定义模版
  const fetchAutoTemplateCode = async () => {
    const res = await fetchDoExecute([{ fullPathCode: 'SITE.SPUC.PR.CREATION.AUTO_FORM_FILL' }]);

    if (res && res[0]) {
      setTemplateCode(res[0]);
    }
  };

  // 根据模版获取，获取自动填单的埋点字段
  const fetchFillFormFields = async () => {
    const res = await dynamicDocTemplate({ templateCode });
    if (res && res.fields) {
      const newFormFields = [];
      const newListFields = ['null'];

      res.fields.forEach(item => {
        if (item.indexOf('prLine.') === -1) {
          newFormFields.push(item);

          const field = headerDs.getField(item);

          // 判断是不是值集的关联字段
          if (field && field.get('bind')) {
            const key = field.get('bind').split('.')[0];

            if (!newFormFields.includes(key)) {
              newFormFields.push(key);
            }
          }
        } else {
          newListFields.push(item.split('.')[1]);

          const field = listDs.getField(item.split('.')[1]);

          // 判断是不是值集的关联字段
          if (field && field.get('bind')) {
            const key = field.get('bind').split('.')[0];
            if (!newListFields.includes(key)) {
              newListFields.push(key);
            }
          }
        }
      });

      setFormFields(newFormFields);
      setListFields(newListFields);
    }
  };

  // 处理ds 让自动填单的字段高亮展示
  const setHighlight = useCallback(
    ({ name, renderer }, dataSet) => {
      if (prSourcePlatform === 'SRM') {
        const field = dataSet.getField(name);
        if (field) {
          if (!field.get('dynamicProps') || !field.get('dynamicProps').highlight) {
            field.set('dynamicProps', {
              ...field.get('dynamicProps'),
              highlight: ({ record }) => {
                if (record && record.getState('tipFields')) {
                  if (record.getState('tipFields')[name]) {
                    let text = '';

                    if (isFunction(renderer)) {
                      const value = record.get(name);
                      text = renderer({
                        record,
                        dataSet,
                        value,
                        name,
                        text: record.getField(name).getText(),
                      });
                    } else if (record.get(name)) {
                      // const value = record.get(name);
                      // // 日期选择框
                      // if (['date', 'dateTime'].includes(field.type)) {
                      // const format = field.get('format')
                      //     ? field.get('format')
                      //     : field.type === 'date'
                      //     ? DEFAULT_DATE_FORMAT
                      //     : DEFAULT_DATETIME_FORMAT;
                      // if (!field.get('range')) {
                      //     text = value.format(format);
                      // } else {
                      //     text = `${
                      //     value[field.get('range')[0]]
                      //         ? value[field.get('range')[0]].format(format)
                      //         : ''
                      //     }～${
                      //     value[field.get('range')[1]]
                      //         ? value[field.get('range')[1]].format(format)
                      //         : ''
                      //     }`;
                      // }
                      // } else {
                      text = record.getField(name).getText() || '';
                      // }
                    }

                    return (
                      <>
                        {intl.get(`${commonPrompt}.autoForm`).d(`自动填单： `)}
                        {text}
                      </>
                    );
                  } else {
                    return null;
                  }
                }
              },
            });
          }
        }
      }
    },
    [prSourcePlatform]
  );

  // 渲染自动填单提示
  const renderAutoFillTip = (data = {}) => {
    const { dataSet, columns, children: curChildren } = data;
    // 表单
    if (curChildren && isArray(curChildren)) {
      curChildren.forEach(ele => {
        if (ele && ele.props) {
          setHighlight(ele.props, dataSet);
        }
      });
    }
    // 表格
    if (columns && isArray(columns)) {
      columns.forEach(ele => {
        if (ele) {
          setHighlight(ele, dataSet);
        }
      });
    }
  };

  // 设置手动改变字段和自动填单显示的字段
  const changeFieldsState = ({ record, name }) => {
    if (record) {
      const alreadyFields = record.getState('alreadyFields') || {};
      alreadyFields[name] = true;
      const field = record.getField(name);

      if (field && field.get('bind')) {
        alreadyFields[field.get('bind').split('.')[0]] = true;
      }

      record.setState({
        alreadyFields,
      });
    }
  };

  // 给 record 设计初识的字段状态
  const setRecordInitFieldsState = record => {
    const recordData = record.toData();

    const newAlreadyFields = {};

    for (const key in recordData) {
      if ({}.hasOwnProperty.call(recordData, key)) {
        // 判断是否有值, 非空值则为已手动更新字段
        if (recordData[key] && Object.keys(recordData[key]).length !== 0) {
          const field = record.getField(key);

          newAlreadyFields[key] = true;

          if (field && field.get('bind')) {
            newAlreadyFields[field.get('bind').split('.')[0]] = true;
          }
        }
      }
    }

    record.setState({
      alreadyFields: newAlreadyFields,
      tipFields: {},
    });
  };

  // ds 初始化加载的时候设置已经改变的字段的值
  const setInitAlreadyFieldsState = ({ dataSet }) => {
    if (prSourcePlatform === 'SRM') {
      dataSet.forEach(record => {
        setRecordInitFieldsState(record);
      });
    }
  };

  // 自动填单
  const autoFillFrom = async (type, record) => {
    if (!templateCode) return;

    // 每次触发填单先清掉上次的提示
    // eslint-disable-next-line no-unused-expressions
    current?.setState('tipFields', {});

    if (listDs && listDs.length > 0) {
      listDs.forEach(curRecord => {
        curRecord.setState({
          tipFields: {},
        });
      });
    }

    // 批量编辑行，不进行自动填单
    if (collectRecord.size > 1) return;

    // 判断是否阔以进行自动填单，获取自动填单的数据
    if (
      formFields.some(value => queueHeader.has(value)) ||
      listFields.some(value => queueLine.has(value))
    ) {
      const formTip = {}; // 头部填单提示字段 key
      const formMap = {}; // 头部填单映射字段 key-vlaue
      const lineTip = {}; // 行自动填单提示字段 key
      const lineMap = {}; // 行自动填单映射字段 key-vlaue

      const prLine = type === 'listFields' ? record.toData() : listDs.toData()[0] || {};

      const data = {
        ...current?.toData(),
        prLine,
      };

      const alreadyFormFields = {
        ...(current?.getState('alreadyFields') || {}),
      };

      const res = await dynamicDoc({
        query: { templateCode },
        body: data,
      });

      if (res && !res.failed) {
        for (const key in res) {
          if (!alreadyFormFields[key] && key !== 'prLine') {
            if (res[key] && Object.keys(res[key]).length !== 0) {
              formTip[key] = true;
              formMap[key] = res[key];
              const field = current?.getField(key);

              // 判断Lov值集的情况
              if (field && field.get('bind')) {
                const lovKey = field.get('bind').split('.')[0];
                if (!alreadyFormFields[lovKey]) {
                  formTip[lovKey] = true;
                }
              }
            }
          }
        }

        //  头信息填单 并加载提示字段
        // eslint-disable-next-line no-unused-expressions
        current?.init({
          ...current?.toData(),
          ...formMap,
        });

        // eslint-disable-next-line no-unused-expressions
        current?.setState({
          tipFields: formTip,
        });

        // 行数据填单 并加载提示字段
        if (listDs.toData()[0]) {
          // 默认第一行
          let lineRecord = listDs.current;

          // 字段改变触发行
          if (type === 'listFields' && record) {
            lineRecord = record;
          }

          const alreadylineFields = lineRecord.getState('alreadyFields') || {};

          for (const key in res.prLine) {
            if (key.includes('attribute') && alreadylineFields[key]) {
              const field = lineRecord.getField(key);
              if (field.get('type') === 'object' && field.get('valueField')) {
                // 判断接口返回数据是否与表格数据是否一致
                const valueField = field.get('valueField');
                const attributeValue = lineRecord.get(key);
                if (res.prLine[key] === attributeValue[valueField]) {
                  lineMap[key] = attributeValue;
                }
              }
            } else if (!alreadylineFields[key]) {
              // 判断是否有值, 非空值则设置提示
              if (res.prLine[key] && Object.keys(res.prLine[key]).length !== 0) {
                lineTip[key] = true;
                lineMap[key] = res.prLine[key];
                const field = lineRecord.getField(key);

                // 判断Lov值集的情况
                if (field && field.get('bind')) {
                  const lovKey = field.get('bind').split('.')[0];
                  if (!alreadylineFields[lovKey]) {
                    lineTip[lovKey] = true;
                  }
                }
              }
            }
          }

          lineRecord.init({
            ...lineRecord.toData(),
            secondaryUomId: lineRecord.get('secondaryUomId'),
            ...lineMap,
          });

          lineRecord.setState({
            tipFields: lineTip,
          });
        }
      }
    }
  };

  // 行ds 更新的时候触发自动填单
  const handleUpdateLine = ({ record, name }) => {
    if (delayId) {
      clearTimeout(delayId);
    }

    collectRecord.add(record);

    if (name) {
      changeFieldsState({ record, name });
      queueLine.add(name);
    } else {
      // 行新建
      setRecordInitFieldsState(record);
      queueLine.add(`null`);
    }

    delayId = setTimeout(() => {
      autoFillFrom('listFields', record);
      queueHeader.clear();
      queueLine.clear();
      collectRecord.clear();
    }, DELAY);
  };

  // 头ds 更新的时候触发自动填单
  const handleUpdateHeader = ({ record, name }) => {
    if (delayId) {
      clearTimeout(delayId);
    }

    changeFieldsState({ record, name });
    queueHeader.add(name);

    delayId = setTimeout(() => {
      autoFillFrom('formFields', record);
      queueHeader.clear();
      queueLine.clear();
      collectRecord.clear();
    }, DELAY);
  };

  const value = useMemo(() => {
    return {
      renderAutoFillTip,
    };
  }, [renderAutoFillTip]);

  // 来源SRM 才阔以进行自动填单
  useEffect(() => {
    if (prSourcePlatform === 'SRM') {
      fetchAutoTemplateCode();
    }
  }, [prSourcePlatform]);

  useEffect(() => {
    if (templateCode) {
      fetchFillFormFields();
    }
  }, [templateCode]);

  // 对事件进行监听处理并初始化AlreadyFields的状态
  useEffect(() => {
    if (prSourcePlatform === 'SRM') {
      if (current) {
        setInitAlreadyFieldsState({ dataSet: headerDs });
      }

      listDs.addEventListener('load', setInitAlreadyFieldsState);
      listDs.addEventListener('create', handleUpdateLine);
      headerDs.addEventListener('update', handleUpdateHeader);
      listDs.addEventListener('update', handleUpdateLine);

      return () => {
        listDs.removeEventListener('load', setInitAlreadyFieldsState);
        listDs.removeEventListener('create', handleUpdateLine);
        headerDs.removeEventListener('update', handleUpdateHeader);
        listDs.removeEventListener('update', handleUpdateLine);
      };
    }
  }, [headerDs, listDs, prSourcePlatform, current, templateCode, formFields, listFields]);

  return <AutoFillForm.Provider value={value}>{children}</AutoFillForm.Provider>;
};

export default observer(AutoFillFormProvider);
