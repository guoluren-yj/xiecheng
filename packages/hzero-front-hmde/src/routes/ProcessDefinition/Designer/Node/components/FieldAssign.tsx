import React, { useMemo, useState, useEffect } from 'react';
import {
  DataSet,
  Form,
  Row,
  Col,
  TextField,
  Select,
  Output,
  TreeSelect,
  Modal,
  DatePicker,
  DateTimePicker,
  Switch,
  // NumberField,
} from 'choerodon-ui/pro';
import { getResponse } from 'utils/utils';
import moment from 'moment';
import { LabelAlign } from 'choerodon-ui/pro/lib/form/enum';
import ImgIcon from '@/utils/ImgIcon';
import DrillComponent, { EDrillMainKeyType } from '@/components/DrillComponent';
import { drill } from '@/services/businessObjectService';
import { getCustomVariable, getExpression } from '@/services/processDefinition';
import { getUrlParamHref } from '@/utils/common';
import { DataSetSelection, FieldIgnore, FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import { isArray, isString } from 'lodash';

import ValueList from './ValueList';
import { fieldsMap, fieldsObjMap } from '../constant';
import Expression from './Expression';
import styles from '../index.less';

const { Option } = Select;
const { TreeNode } = TreeSelect;

interface ICustomVariable {
  parentId: number;
  commonType: string;
  code: string;
  type: string;
  remark: string;
}

export default function FieldAssign(props) {
  const flowId = getUrlParamHref('flowId');
  const {
    category = '',
    cols = 4,
    curRecord,
    // notRequiredFields = [],
    delBtnFlag = false,
    parentDataSet,
    formValidate,
    deleteField,
    index,
    // setNotRequiredFields,
    businessObjectFields,
    allBusinessObjectFields,
    expressionList,
    setExpressionList,
    optionDs,
    inputParameterData,
    inputParameterOriginData,
    selectField = [],
    setSelectField = () => {},
    nodeArr,
    graph,
    versionDisabled,
    viewType,
  } = props;
  const [sourceType, setSourceType] = useState('');
  const [inputParameterId, setInputParameterId] = useState('' as any);
  const [customVariableList, setCustomVariableList] = useState([] as ICustomVariable[]);
  const [operatorType, setOperatorType] = useState();
  const [all, setAll] = useState([] as any);
  const [filterField, setField] = useState([] as any);
  const [currentValue, setValue] = useState('');
  const { language } = window.dvaApp._store.getState().global || {};
  console.log('optionDs', optionDs.toData());
  const fieldsArray = fieldsMap.get(category) || [];
  let fields = fieldsArray.map(item => fieldsObjMap.get(item));
  // 脚本节点的值值类型和值都要改成非必输
  if (category === 'SCRIPT-FieldAssign') {
    fields = JSON.parse(JSON.stringify(fields)); // eslint-disable-line
    fields.forEach(item => {
      if (
        item.name === 'sourceType' ||
        item.name === 'inputParameterId' ||
        item.name === 'value' ||
        item.name === 'inputParameter' ||
        item.name === 'customVariable' ||
        item.name === 'expression'
      ) {
        item.required = false; // eslint-disable-line
        item.computedProps = {}; // eslint-disable-line
      }
    });
  }
  console.log('file: FieldAssign.tsx ~ line 49 ~ FieldAssign ~ fields', fields);
  const buildTreeData = item => {
    if (item.children.length) {
      return React.createElement(
        TreeNode,
        {
          value: item.id,
          title: item.businessObjectFieldName || item.businessObjectName || item.code,
          disabled: category !== 'SCRIPT-FieldAssign',
        },
        [item.children.map(i => buildTreeData(i))]
      );
    } else {
      // const value =
      return React.createElement(TreeNode, {
        value:
          item?.parentId?.toString() === '1'
            ? `${item.id}`
            : `${item.parentId}.${item.code || item.id}`,
        title: item.businessObjectFieldName || item.businessObjectName || item.code,
      });
    }
  };
  const treeData = originData => {
    return originData.map(item => buildTreeData(item));
  };

  useEffect(() => {
    setAll(allBusinessObjectFields);
  }, [allBusinessObjectFields, selectField.length, currentValue]);
  // 筛选得到可选字段
  useEffect(() => {
    const BOfields: any[] = [];
    all
      .filter(
        i =>
          !selectField.includes(i.businessObjectFieldCode) ||
          i.businessObjectFieldCode === currentValue
      )
      .forEach(item => {
        if (category !== 'VA-FieldAssign') {
          if (
            businessObjectFields.findIndex(
              i => i.businessObjectFieldCode === item.businessObjectFieldCode
            ) === -1
          ) {
            BOfields.push(item);
          }
        } else if (businessObjectFields.findIndex(i => i.code === item.code) === -1) {
          BOfields.push(item);
        }
      });
    setField(BOfields);
  }, [all.length, selectField.length, currentValue]);

  const setInputParameterIdFunc = id => {
    let splitArray = [];
    if (id) {
      splitArray = id.split('.');
    }
    if (splitArray.length) {
      id = splitArray[splitArray.length - 1]; // eslint-disable-line
    }
    const curData = ds?.current?.get('inputParameterOriginData')?.find(item => item.id === id);
    if (curData && curData.parentId && curData.parentId === 1 && !curData?.formattedObject) {
      // 说明是头字段
      if (category === 'SCRIPT-FieldAssign' && curData.partFlag?.toString() === '1') {
        setInputParameterId('');
      } else {
        // setInputParameterId(curData.businessObjectCode);
        setInputParameterId('');
      }
    } else if (
      curData &&
      curData.componentType &&
      curData.componentType.indexOf('RELATION') !== -1
    ) {
      const parentData = ds?.current
        ?.get('inputParameterOriginData')
        ?.find(item => item.id === curData.parentId);
      drill({
        query: { businessObjectCode: parentData.businessObjectCode, drillMainKeyFlag: false },
      }).then(res => {
        const businessObjectField = res.businessObjectFields.find(
          item => item.businessObjectFieldCode === curData.businessObjectFieldCode
        );
        if (businessObjectField.masterBusinessObjectCode) {
          setInputParameterId(businessObjectField.masterBusinessObjectCode);
        } else {
          setInputParameterId(parentData.businessObjectCode);
        }
      });
    } else {
      setInputParameterId('');
    }
  };

  // 清空配置，比如fieldCode变化，后面的字段都要重新选择
  const clearMap = new Map([
    [
      'fieldCode',
      [
        'sourceType',
        'componentType',
        'inputParameterId',
        'value',
        'inputParameter',
        'refField',
        'customVariable',
        'expression',
        'expressionId',
        'operatorType',
        'time',
      ],
    ],
  ]);

  const ds = useMemo(
    () =>
      new DataSet({
        autoCreate: true,
        fields: [
          ...fields,
          {
            name: 'time',
            type: 'date',
            range: true,
          },
          { name: 'inputParameterOriginData', type: FieldType.object, ignore: FieldIgnore.always },
          { name: 'expressionId', type: FieldType.number },
          { name: 'expressionList', type: FieldType.object, ignore: FieldIgnore.always },
          { name: 'valueListData', type: FieldType.object },
          { name: 'valueList', type: FieldType.object },
        ],
        events: {
          update({ name, value, record, oldValue }) {
            if (name === 'expressionId') {
              if (value) {
                const cur = ds?.current?.get('expressionList')?.filter(i => i?.id === value)?.[0]
                  ?.value;
                console.log(cur);
                // eslint-disable-next-line no-unused-expressions
                ds?.current?.set('expression', cur);
              } else {
                // eslint-disable-next-line no-unused-expressions
                ds?.current?.set('expression', null);
              }
            }
            if (name === 'fieldCode') {
              const buildData = dataSet => {
                return [...(dataSet as any).childrenDs.values()].map(item => {
                  delete item?.inputParameterOriginData; // eslint-disable-line
                  return item.toData()[0];
                });
              };
              const BOfields: any[] = [];
              allBusinessObjectFields.forEach(item => {
                if (category !== 'VA-FieldAssign') {
                  if (
                    businessObjectFields.findIndex(
                      i => i.businessObjectFieldCode === item.businessObjectFieldCode
                    ) === -1
                  ) {
                    BOfields.push(item);
                  }
                } else if (businessObjectFields.findIndex(i => i.code === item.code) === -1) {
                  BOfields.push(item);
                }
              });
              const otherFields = clearMap.get('fieldCode');
              // 更改fieldCode时，需要清空其他字段
              if (otherFields) {
                otherFields.forEach(item => {
                  record.set(item, '');
                });
              }
              if (value) {
                const item = BOfields.find(i => i.businessObjectFieldCode === value);
                record.set('componentType', item?.componentType);
                record.set('valueListData', item);
              }
              const build = buildData(parentDataSet); // eslint-disable-line
              const data = build.map(i => i?.fieldCode && i?.fieldCode).filter(i => i);
              setSelectField(data);
              setValue(value);
              setAll(
                BOfields.filter(
                  i =>
                    !data.includes(i.businessObjectFieldCode) || i.businessObjectFieldCode === value
                )
              );
            }
            if (name === 'sourceType') {
              const sourceTypeArray = [
                'fixedValue',
                'inputParameter',
                'customVariable',
                'expression',
              ];
              // 选中一种类型，其他类型赋空
              sourceTypeArray
                .filter(item => item !== value)
                .forEach(item => {
                  record.set(item === 'fixedValue' ? 'value' : item, '');
                });
              setSourceType(value);
              if (value === 'customVariable') {
                getCustomVariable(flowId).then(res => {
                  console.log('res', res);
                  // 如果字段类型是string，则只能显示string类型的自定义变量
                  // 如果是number，则显示number类型的
                  // 如果是boolean,则显示boolean类型的
                  if (getResponse(res)) {
                    if (category === 'SCRIPT-FieldAssign') {
                      if (record.get('type') === 'string') {
                        setCustomVariableList(res.filter(item => item.type === 'Text'));
                      }
                      if (record.get('type') === 'number') {
                        setCustomVariableList(res.filter(item => item.type === 'Number'));
                      }
                      if (record.get('type') === 'boolean') {
                        setCustomVariableList(res.filter(item => item.type === 'Boolean'));
                      }
                      if (record.get('type') === 'any') {
                        setCustomVariableList(res);
                      }
                    } else {
                      setCustomVariableList(res);
                    }
                  } else {
                    setCustomVariableList([]);
                  }
                });
              }
            }
            if (name === 'inputParameterId') {
              if (value) {
                setInputParameterIdFunc(value);
                if (value !== oldValue) {
                  record.set('inputParameter', '');
                }
              } else {
                // 清空入参的同时，清空字段钻取
                setInputParameterIdFunc('');
                record.set('inputParameter', '');
              }
            }
            // 如果操作符是为空或不为空，后续字段都不用填
            if (name === 'operatorType') {
              setOperatorType(value);
            }
            console.log('当前record', record.toData());
          },
          load: ({ dataSet }) => {
            const buildData = dataset => {
              return [...(dataset as any).childrenDs.values()].map(item => {
                delete item?.inputParameterOriginData; // eslint-disable-line
                return item.toData()[0];
              });
            };
            const BOfields: any[] = [];
            allBusinessObjectFields.forEach(item => {
              if (category !== 'VA-FieldAssign') {
                if (
                  businessObjectFields.findIndex(
                    i => i.businessObjectFieldCode === item.businessObjectFieldCode
                  ) === -1
                ) {
                  BOfields.push(item);
                }
              } else if (businessObjectFields.findIndex(i => i.code === item.code) === -1) {
                BOfields.push(item);
              }
            });
            const build = buildData(parentDataSet); // eslint-disable-line
            const buildArr = build.map(i => i?.fieldCode && i?.fieldCode).filter(i => i);
            setSelectField(buildArr);
            setValue(dataSet.current.get('fieldCode'));
            setAll(
              BOfields.filter(
                i =>
                  !buildArr.includes(i.businessObjectFieldCode) ||
                  i.businessObjectFieldCode === dataSet.current.get('fieldCode')
              )
            );

            const data = dataSet.current.toData();
            const item = allBusinessObjectFields.find(
              i => i.businessObjectFieldCode === data?.fieldCode
            );
            dataSet.current.set('valueListData', item);
            setSourceType(data.sourceType);
            if (data.operatorType) {
              setOperatorType(data.operatorType);
            }
          },
        },
        data: [{ ...curRecord, inputParameterOriginData }],
      }),
    []
  );

  const handleOk = params => {
    const { value } = params;
    console.log('file: FieldAssign.tsx ~ line 121 ~ handleOk ~ params', params);
    if (ds.current) {
      // ds.current.set('componentType', result.componentType);
      ds.current.set('inputParameter', value);
      // ds.current.set('refField', value);
    }
    drill({
      query: { businessObjectCode: inputParameterId, drillMainKeyFlag: true },
    }).then(res => {
      if (getResponse(res)) {
        if (ds.current) {
          // eslint-disable-next-line no-unused-expressions
          ds?.current.set('customPrimaryKeyCode', res?.customPrimaryKeyCode);
        }
      }
    });
  };
  const drillRenderer = () => {
    return (
      <DrillComponent
        onOk={handleOk}
        onClear={() => ds?.current?.set('inputParameter', '')}
        name="inputParameter"
        initValue={curRecord?.inputParameter}
        businessObjectCode={inputParameterId}
        drillMainKeyType={EDrillMainKeyType.ALL}
      />
    );
  };

  const fn = (resolve, reject) => {
    ds.validate().then(r => {
      if (r) {
        resolve();
      } else {
        reject();
      }
    });
  };

  useEffect(() => {
    // eslint-disable-next-line no-unused-expressions
    ds?.current?.set('inputParameterOriginData', inputParameterOriginData);
    const data = ds?.current?.toData();
    if (data.sourceType === 'inputParameter') {
      setInputParameterIdFunc(data.inputParameterId);
    }
  }, [inputParameterOriginData]);

  useEffect(() => {
    formValidate.remove('validate', fn);
    formValidate.listen('validate', fn);
  }, [index]);

  useEffect(() => {
    parentDataSet.childrenDs.set(index, ds);
    return () => {
      parentDataSet.childrenDs.delete(index);
      formValidate.remove('validate', fn);
    };
  }, [index]);

  useEffect(() => {
    const data = ds?.current?.toData();
    // eslint-disable-next-line no-unused-expressions
    ds?.current?.set('expressionList', expressionList);
    if (!data?.expressionId && data?.expression) {
      const curId = expressionList.filter(i => i?.value === data?.expression)?.[0]?.id;
      // eslint-disable-next-line no-unused-expressions
      ds?.current?.set('expressionId', curId);
    }
  }, [expressionList]);

  const OptionMap = new Map([
    ['fixedValue', <Option value="fixedValue">固定值</Option>],
    ['inputParameter', <Option value="inputParameter">入参</Option>],
    // ['customVariable', <Option value="customVariable">自定义变量</Option>],
    ['expression', <Option value="expression">表达式</Option>],
  ]);

  const optionsMap = new Map([
    ['any', ['fixedValue', 'inputParameter', 'customVariable', 'expression']],
    ['string', ['fixedValue', 'inputParameter', 'customVariable', 'expression']],
    ['number', ['fixedValue', 'inputParameter', 'customVariable', 'expression']],
    ['Array<Object>', ['inputParameter', 'expression']],
    ['Array<string>', ['inputParameter', 'expression']],
    ['Object', ['inputParameter', 'expression']],
    ['boolean', ['fixedValue', 'inputParameter', 'customVariable', 'expression']],
  ]);

  const renderMap = new Map<string, any>([
    [
      'code',
      () => (
        <Select name="code" defaultValue={curRecord.code} disabled={!!curRecord.requiredFlag}>
          {filterField.map(item => (
            <Option value={item.code}>{item.code}</Option>
          ))}
        </Select>
      ),
    ],
    [
      'fieldCode',
      () => (
        <Select
          name="fieldCode"
          defaultValue={curRecord.businessObjectFieldCode}
          disabled={!!curRecord.requiredFlag}
        >
          {curRecord.requiredFlag && (
            <Option value={curRecord.businessObjectFieldCode}>
              {`*${curRecord.businessObjectFieldName}`}
            </Option>
          )}
          {!curRecord.requiredFlag &&
            filterField.map(item => (
              <Option value={item.businessObjectFieldCode}>{item.businessObjectFieldName}</Option>
            ))}
        </Select>
      ),
    ],
    [
      'sourceType',
      () => (
        <Select name="sourceType">
          {category === 'SCRIPT-FieldAssign' && (
            <>
              {ds.current &&
                ds?.current?.get('type') &&
                optionsMap.get(ds?.current?.get('type'))?.map(item => OptionMap.get(item))}
            </>
          )}
          {category !== 'SCRIPT-FieldAssign' && (
            <>
              {<Option value="fixedValue">固定值</Option>}
              <Option value="inputParameter">入参</Option>
              {/* <Option value="customVariable">自定义变量</Option> */}
              <Option value="expression">表达式</Option>
            </>
          )}
        </Select>
      ),
    ],
    [
      'inputParameterId',
      () => <TreeSelect name="inputParameterId">{treeData(inputParameterData)}</TreeSelect>,
    ],
    [
      'value',
      () => {
        const _field = allBusinessObjectFields.find(
          item => item.businessObjectFieldCode === ds?.current?.get('fieldCode')
        );
        console.log('_field', _field);
        let _ds: any = '';
        if (_field && _field?.attributeJson?.customOptionList) {
          const data = _field?.attributeJson?.customOptionList?.map(item => {
            return {
              ...item,
              meaning: item?.meaning?.[language],
            };
          });
          _ds = new DataSet({
            fields: [
              {
                name: 'value',
                type: FieldType.string,
                textField: 'meaning',
                valueField: 'value',
                options: (() => {
                  return new DataSet({
                    selection: DataSetSelection.single,
                    data: data || [],
                  });
                })(),
              },
            ],
            events: {
              update: ({ value }) => {
                if (value) {
                  if (ds.current) {
                    if (isArray(value)) {
                      ds.current.set('value', value?.filter(i => i)?.join(','));
                    } else {
                      ds.current.set('value', value);
                    }
                  }
                } else {
                  // eslint-disable-next-line no-unused-expressions
                  ds.current?.set('value', null);
                }
              },
              load: ({ dataSet }) => {
                const { value: curData } = dataSet.current.toData();
                if (isArray(curData)) {
                  // eslint-disable-next-line no-unused-expressions
                  ds.current?.set('value', curData?.join(','));
                }
              },
            },
            data: [
              {
                value: isString(ds?.current?.get('value'))
                  ? ds?.current?.get('value')?.split(',')
                  : ds?.current?.get('value'),
              },
            ],
          });
        } else if (_field && _field.lovCode) {
          _ds = new DataSet({
            fields: [
              {
                name: 'value',
                type: FieldType.string,
                textField: 'meaning',
                valueField: 'value',
                lookupCode: _field.lovCode,
              },
            ],
            events: {
              update: ({ value }) => {
                if (ds.current) {
                  ds.current.set('value', value);
                }
              },
            },
            data: [
              {
                value: ds?.current?.get('value'),
              },
            ],
          });
        }
        switch (ds?.current?.get('componentType')) {
          case 'DATE_SELECTION_BOX':
            return operatorType === 'RANGE' ? (
              <DatePicker
                name="time"
                style={{ width: '205px' }}
                onChange={value => {
                  if (value) {
                    // eslint-disable-next-line no-unused-expressions
                    ds?.current?.set(
                      'value',
                      value
                        ?.map(item => {
                          return moment(item).format('YYYY-MM-DD');
                        })
                        ?.join(',')
                    );
                  } else {
                    // eslint-disable-next-line no-unused-expressions
                    ds?.current?.set('value', null);
                  }
                }}
              />
            ) : (
              <DatePicker name="value" />
            );
          case 'DATETIME_SELECTION_BOX':
            return operatorType === 'RANGE' ? (
              // eslint-disable-next-line no-unused-expressions
              <DateTimePicker
                name="time"
                style={{ width: '205px' }}
                onChange={value => {
                  if (value) {
                    // eslint-disable-next-line no-unused-expressions
                    ds?.current?.set(
                      'value',
                      value
                        ?.map(item => {
                          return moment(item).format('YYYY-MM-DD HH:mm:ss');
                        })
                        ?.join(',')
                    );
                  } else {
                    // eslint-disable-next-line no-unused-expressions
                    ds?.current?.set('value', null);
                  }
                }}
              />
            ) : (
              <DateTimePicker name="value" />
            );
          case 'FLOAT':
          case 'NUMBER_FIELD':
          case 'MONEY':
            return <TextField name="value" />;
          case 'RADIO':
          case 'SINGLE_SELECT':
            if (_field) {
              return operatorType === 'IN' || operatorType === 'NOT_IN' ? (
                <Select name="value" dataSet={_ds} multiple />
              ) : (
                <Select name="value" dataSet={_ds} />
              );
            } else {
              return <Select name="value" />;
            }
          case 'CHECKBOX':
          case 'MULTIPLE_SELECT':
            if (_field) {
              return <Select name="value" dataSet={_ds} multiple />;
            } else {
              return <Select name="value" multiple />;
            }
          case 'SWITCH':
            if (_field) {
              return <Select name="value" dataSet={_ds} />;
            } else {
              return <Switch name="value" />;
            }
          case 'LINK_RELATION':
            return <ValueList record={ds?.current} />;
          case 'MASTER_RELATION':
            return <ValueList record={ds?.current} />;
          default:
            return <TextField name="value" />;
        }
      },
    ],
    ['inputParameter', () => <Output name="inputParameter" renderer={() => drillRenderer()} />],
    [
      'customVariable',
      () => (
        <Select name="customVariable">
          {customVariableList.map(item => (
            <Option value={item.code}>{item.code}</Option>
          ))}
        </Select>
      ),
    ],
    [
      'expression',
      () => (
        <div style={{ display: 'flex' }}>
          <Select name="expressionId">
            {expressionList.map(item => (
              <Option value={item.id}>{item.name}</Option>
            ))}
          </Select>
          <ImgIcon
            name="goujian.svg"
            size={16}
            style={{ marginTop: '6px', marginLeft: '5px' }}
            onClick={() => buildExpression()}
          />
        </div>
      ),
    ],
    ['type', () => <TextField name="type" disabled />],
    [
      'operatorType',
      () => (
        <Select
          name="operatorType"
          defaultValue=""
          optionsFilter={obj => {
            const item = obj?.get('value') || '';
            const arr = [
              {
                componentType: ['DATE_SELECTION_BOX'],
                operatorType: [
                  'EQUAL',
                  'NOT_EQUAL',
                  'GREATER_THAN',
                  'GREATER_THAN_OR_EQUAL_TO',
                  'LESS_THAN',
                  'LESS_THAN_OR_EQUAL_TO',
                  'IS_NULL',
                  'IS_NOT_NULL',
                  'RANGE',
                ],
              },
              {
                componentType: ['DATETIME_SELECTION_BOX'],
                operatorType: [
                  'EQUAL',
                  'NOT_EQUAL',
                  'GREATER_THAN',
                  'GREATER_THAN_OR_EQUAL_TO',
                  'LESS_THAN',
                  'LESS_THAN_OR_EQUAL_TO',
                  'IS_NULL',
                  'IS_NOT_NULL',
                  'RANGE',
                ],
              },
              {
                componentType: ['NUMBER_FIELD', 'FLOAT', 'PERCENTAGE', 'MONEY'],
                operatorType: [
                  'EQUAL',
                  'NOT_EQUAL',
                  'LESS_THAN',
                  'LESS_THAN_OR_EQUAL_TO',
                  'GREATER_THAN',
                  'GREATER_THAN_OR_EQUAL_TO',
                  'IS_NULL',
                  'IS_NOT_NULL',
                ],
              },
              {
                componentType: ['RADIO', 'SINGLE_SELECT'],
                operatorType: [
                  'EQUAL',
                  'NOT_EQUAL',
                  'WHEREIN',
                  'NOT_WHEREIN',
                  'IS_NULL',
                  'IS_NOT_NULL',
                  'IN',
                  'NOT_IN',
                ],
              },
              {
                componentType: ['CHECKBOX', 'MULTIPLE_SELECT'],
                // operatorType: ['IS_NULL', 'IS_NOT_NULL', 'IN', 'NOT_IN'],
                operatorType: ['IS_NULL', 'IS_NOT_NULL'],
              },
              {
                componentType: ['SWITCH'],
                operatorType: [
                  'EQUAL',
                  'NOT_EQUAL',
                  'IS_NULL',
                  'IS_NOT_NULL',
                  'IS_TRUE',
                  'IS_FALSE',
                ],
              },
              {
                componentType: [
                  'TEXT_FIELD',
                  'TEXT_AREA',
                  'SWITCH',
                  'PHONE_NUMBER',
                  'EMAIL',
                  'APPENDIX',
                  'LINK',
                  'FORMULA',
                  'REFERENCE_FIELD',
                ],
                operatorType: [
                  'EQUAL',
                  'NOT_EQUAL',
                  'IS_NULL',
                  'IS_NOT_NULL',
                  // 'IN',
                  // 'NOT_IN',
                  'BEFORE_FUZZY',
                  'AFTER_FUZZY',
                  'FULLY_FUZZY',
                ],
              },
              {
                componentType: ['LINK_RELATION', 'MASTER_RELATION'],
                operatorType: ['EQUAL', 'NOT_EQUAL', 'IS_NULL', 'IS_NOT_NULL'],
              },
            ];
            for (const { componentType, operatorType: _operatorType } of arr) {
              if (ds.current) {
                if (componentType.includes(ds.current.get('componentType'))) {
                  return _operatorType.includes(item);
                }
              }
            }
            return false;
          }}
        />
      ),
    ],
  ]);

  // 构建表达式
  const buildExpression = () => {
    Modal.open({
      title: '构建表达式',
      children: (
        <Expression
          modal={props.modal}
          nodeArr={nodeArr}
          graph={graph}
          versionDisabled={versionDisabled}
          viewType={viewType}
        />
      ),
      drawer: false,
      onOk: () => {
        setTimeout(() => {
          getExpression(flowId).then(res => {
            if (res.expression) {
              const data = JSON.parse(res.expression) || [];
              const cur = data?.filter(i => i?.id === ds?.current?.get('expressionId'))?.[0]?.value;
              setExpressionList(JSON.parse(res.expression));
              // eslint-disable-next-line no-unused-expressions
              ds?.current?.set('expression', cur);
            }
          });
        }, 100);
      },
      style: {
        width: 957,
      },
    });
  };

  return (
    <Row className={styles['field-assign']}>
      <Col span={22}>
        <Form
          dataSet={ds}
          labelAlign={LabelAlign.left}
          disabled={versionDisabled || viewType !== 'detail'}
        >
          {cols === 4 && (
            <Row gutter={10}>
              <Col span={6}>
                {(category === 'SCRIPT-FieldAssign' || category === 'VA-FieldAssign') &&
                  renderMap.get('code')()}
                {category !== 'SCRIPT-FieldAssign' &&
                  category !== 'VA-FieldAssign' &&
                  renderMap.get('fieldCode')()}
              </Col>
              <Col span={6}>{renderMap.get('sourceType')()}</Col>
              {/* 固定值没有入参字段 */}
              {sourceType === 'inputParameter' && (
                <Col span={6}>{renderMap.get('inputParameterId')()}</Col>
              )}
              <Col span={6}>
                {sourceType === 'fixedValue' && renderMap.get('value')()}
                {sourceType === 'inputParameter' &&
                  inputParameterId &&
                  renderMap.get('inputParameter')()}
                {sourceType === 'customVariable' && renderMap.get('customVariable')()}
                {sourceType === 'expression' && renderMap.get('expression')()}
                {/* {renderMap.get(sourceType === 'fixedValue' ? 'value' : sourceType)} */}
              </Col>
              {/* {sourceType === 'expression' && (
                <Col span={6} onClick={() => buildExpression()}>
                  构建表达式
                </Col>
              )} */}
            </Row>
          )}
          {cols === 5 && (
            <div className={styles['form-area']}>
              {(category === 'SCRIPT-FieldAssign' || category === 'VA-FieldAssign') &&
                renderMap.get('code')()}
              {category !== 'SCRIPT-FieldAssign' &&
                category !== 'VA-FieldAssign' &&
                renderMap.get('fieldCode')()}
              {category === 'SCRIPT-FieldAssign' && renderMap.get('type')()}
              {category !== 'SCRIPT-FieldAssign' &&
                category !== 'VA-FieldAssign' &&
                renderMap.get('operatorType')()}
              {operatorType !== 'IS_NULL' && operatorType !== 'IS_NOT_NULL' && (
                <>
                  {renderMap.get('sourceType')()}
                  {sourceType === 'inputParameter' && renderMap.get('inputParameterId')()}
                  {/* {renderMap.get(sourceType === 'fixedValue' ? 'value' : sourceType)} */}
                  <>
                    {sourceType === 'fixedValue' && renderMap.get('value')()}
                    {sourceType === 'inputParameter' &&
                      inputParameterId &&
                      renderMap.get('inputParameter')()}
                    {sourceType === 'customVariable' && renderMap.get('customVariable')()}
                    {sourceType === 'expression' && renderMap.get('expression')()}
                  </>
                </>
              )}
            </div>
          )}
        </Form>
      </Col>
      <Col span={2} className={styles['btn-area']}>
        {!versionDisabled && viewType === 'detail' && delBtnFlag && !curRecord.requiredFlag && (
          <ImgIcon
            name="B16-delet@1x.svg"
            size={16}
            style={{ margin: '0px' }}
            onClick={() => {
              // // eslint-disable-next-line no-unused-expressions
              // ds?.deleteAll(false);
              deleteField(index);
            }}
          />
        )}
      </Col>
    </Row>
  );
}
