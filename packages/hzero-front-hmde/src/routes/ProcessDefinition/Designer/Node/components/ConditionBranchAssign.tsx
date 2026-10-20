import React, { useState, useMemo, useEffect } from 'react';
import {
  Form,
  DataSet,
  Select,
  Col,
  TextField,
  Output,
  Row,
  TreeSelect,
  Modal,
} from 'choerodon-ui/pro';
import { FieldType, FieldIgnore } from 'choerodon-ui/pro/lib/data-set/enum';
import { LabelAlign } from 'choerodon-ui/pro/lib/form/enum';
import { getResponse } from 'utils/utils';

import DrillComponent, { EDrillMainKeyType } from '@/components/DrillComponent';
import { drill } from '@/services/businessObjectService';
import { getCustomVariable, getExpression } from '@/services/processDefinition';
import { getUrlParamHref } from '@/utils/common';
import ImgIcon from '@/utils/ImgIcon';
// import { useForceUpdate } from '@/hooks/debug';

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

const ConditionBranchAssign = props => {
  const flowId = getUrlParamHref('flowId');
  const {
    parentDataSet,
    formValidate,
    inputParameterData,
    inputParameterOriginData,
    curRecord = {},
    expressionList,
    setExpressionList,
    index,
    nodeArr,
    graph,
    versionDisabled,
    viewType,
  } = props;
  const [sourceType, setSourceType] = useState('');
  const [sourceTypeRight, setSourceTypeRight] = useState('');
  const [customVariableList, setCustomVariableList] = useState([] as ICustomVariable[]);
  const [inputParameterId, setInputParameterId] = useState('' as any);
  const [inputParameterIdRight, setInputParameterIdRight] = useState('' as any);
  const [operatorType, setOperatorType] = useState();
  const buildTreeData = item => {
    if (item.children.length) {
      return React.createElement(
        TreeNode,
        {
          value: item.id,
          title: item.businessObjectFieldName || item.businessObjectName || item.code,
          disabled: !!item.children.length,
        },
        [item.children.map(i => buildTreeData(i))]
      );
    } else {
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
  const setInputParameterIdFunc = (id, record?) => {
    let splitArray = [];
    if (id) {
      splitArray = id?.split('.');
    }
    if (splitArray.length) {
      id = splitArray[splitArray.length - 1]; // eslint-disable-line
    }
    const curData = record?.get('inputParameterOriginData')?.find(item => item.id === id);
    if (!curData) {
      const customData = ds?.current
        ?.get('inputParameterOriginData')
        ?.find(item => item.code === id);
      if (customData) {
        if (customData?.type === 'number') {
          // eslint-disable-next-line no-unused-expressions
          record?.set('componentType', 'NUMBER_FIELD');
        }
        if (customData?.type === 'string') {
          // eslint-disable-next-line no-unused-expressions
          record?.set('componentType', 'TEXT_FIELD');
        }
        if (customData?.type === 'boolean') {
          // eslint-disable-next-line no-unused-expressions
          record?.set('componentType', 'SWITCH');
        }
      }
    } else if (curData && curData.parentId && curData.parentId === 1 && !curData?.formattedObject) {
      // 说明是头字段
      setInputParameterId(curData.businessObjectCode);
    } else if (
      curData &&
      curData.componentType &&
      curData.componentType.indexOf('RELATION') !== -1
    ) {
      const parentData = record
        ?.get('inputParameterOriginData')
        ?.find(item => item.id === curData.parentId);
      drill({
        query: { businessObjectCode: parentData.businessObjectCode, drillMainKeyFlag: true },
      }).then(res => {
        const businessObjectField = res?.businessObjectFields?.find(
          item => item.businessObjectFieldCode === curData.businessObjectFieldCode
        );
        if (businessObjectField.masterBusinessObjectCode) {
          setInputParameterId(businessObjectField.masterBusinessObjectCode);
        } else {
          setInputParameterId(parentData.businessObjectCode);
        }
      });
    } else {
      if (record && curData?.componentType) {
        record.set('componentType', curData.componentType);
      }
      setInputParameterId('');
    }
  };
  const setInputParameterIdRightFunc = id => {
    let splitArray = [];
    if (id) {
      splitArray = id.split('.');
    }
    if (splitArray.length) {
      id = splitArray[splitArray.length - 1]; // eslint-disable-line
    }
    const curData = ds?.current?.get('inputParameterOriginData')?.find(item => item.id === id);
    if (curData && curData.parentId && curData.parentId === 1) {
      // 说明是头字段
      setInputParameterIdRight(curData.businessObjectCode);
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
          setInputParameterIdRight(businessObjectField.masterBusinessObjectCode);
        } else {
          setInputParameterIdRight(parentData.businessObjectCode);
        }
      });
    } else {
      setInputParameterIdRight('');
    }
  };
  const ds = useMemo(
    () =>
      new DataSet({
        fields: [
          { name: 'inputParameterOriginData', type: FieldType.object, ignore: FieldIgnore.always },
          { name: 'sourceType', type: FieldType.string, label: '来源', required: true },
          { name: 'componentType', type: FieldType.string, label: '字段类型' },
          {
            name: 'operatorType',
            type: FieldType.string,
            textField: 'meaning',
            valueField: 'value',
            lookupCode: 'HMDE.FILTER_CONDITION',
            label: '操作类型',
            required: true,
          },
          {
            name: 'inputParameterId',
            type: FieldType.string,
            label: '业务对象code',
            computedProps: {
              required: ({ record }) => record.get('sourceType') === 'inputParameter',
            },
          },
          {
            name: 'inputParameter',
            type: FieldType.string,
            label: '入参值',
            computedProps: {
              required: () => {
                return false;
                // const theInputParameterOriginData = record.get('inputParameterOriginData');
                // const theInputParameterId = record.get('inputParameterId');
                // const data = theInputParameterOriginData.find(
                //   (item) => item.id === theInputParameterId
                // );
                // if (record.get('sourceType') === 'inputParameter') {
                //   if (record.get('type') && record.get('type') === 'any') {
                //     return false;
                //   }
                //   return data?.parentId === 1 || data?.componentType?.indexOf('RELATION') !== -1;
                // } else {
                //   return false;
                // }
              },
            },
          },
          {
            name: 'refField',
            type: FieldType.string,
          },
          {
            name: 'customVariable',
            type: FieldType.string,
            label: '自定义变量值',
            computedProps: {
              required: ({ record }) => record.get('sourceType') === 'customVariable',
            },
          },
          {
            name: 'expression',
            type: FieldType.string,
            label: '表达式值',
            computedProps: {
              required: ({ record }) => record.get('sourceType') === 'expression',
            },
          },
          { name: 'expressionId', type: FieldType.number },
          { name: 'expressionRightId', type: FieldType.number },
          { name: 'expressionList', type: FieldType.object, ignore: FieldIgnore.always },
          {
            name: 'sourceTypeRight',
            type: FieldType.string,
            label: '来源',
            computedProps: {
              required: ({ record }) => {
                if (record.get('operatorType')) {
                  return (
                    record.get('operatorType') !== 'IS_NULL' &&
                    record.get('operatorType') !== 'IS_NOT_NULL'
                  );
                } else {
                  return true;
                }
              },
            },
          },
          {
            name: 'inputParameterIdRight',
            type: FieldType.string,
            label: '业务对象code',
            computedProps: {
              required: ({ record }) => {
                const theInputParameterOriginData = record.get('inputParameterOriginData');
                const theInputParameterId = record.get('inputParameterIdRight');
                const data = theInputParameterOriginData?.find(
                  item => item.id === theInputParameterId
                );
                if (record.get('sourceTypeRight') === 'inputParameter') {
                  if (record.get('operatorType')) {
                    return (
                      record.get('operatorType') !== 'IS_NULL' &&
                      record.get('operatorType') !== 'IS_NOT_NULL'
                    );
                  }
                  if (record.get('type') && record.get('type') === 'any') {
                    return false;
                  }
                  return data?.parentId === 1 || data?.componentType?.indexOf('RELATION') !== -1;
                } else {
                  return false;
                }
              },
            },
          },
          {
            name: 'valueRight',
            type: FieldType.string,
            label: '右字段值',
            computedProps: {
              required: ({ record }) => {
                if (record.get('sourceTypeRight') === 'fixedValue') {
                  if (record.get('operatorType')) {
                    return (
                      record.get('operatorType') !== 'IS_NULL' &&
                      record.get('operatorType') !== 'IS_NOT_NULL'
                    );
                  } else {
                    return true;
                  }
                } else {
                  return false;
                }
              },
            },
          },
          {
            name: 'inputParameterRight',
            type: FieldType.string,
            label: '右入参值',
            computedProps: {
              required: ({ record }) => {
                const theInputParameterOriginData = record.get('inputParameterOriginData');
                const theInputParameterIdRight = record.get('inputParameterIdRight');
                const data = theInputParameterOriginData.find(
                  item => item.id === theInputParameterIdRight
                );
                if (record.get('sourceTypeRight') === 'inputParameter') {
                  if (record.get('type') && record.get('type') === 'any') {
                    return false;
                  }
                  if (data?.parentId === 1 || data.componentType.indexOf('RELATION') !== -1) {
                    if (record.get('operatorType')) {
                      return (
                        record.get('operatorType') !== 'IS_NULL' &&
                        record.get('operatorType') !== 'IS_NOT_NULL'
                      );
                    } else {
                      return true;
                    }
                  } else {
                    return false;
                  }
                } else {
                  return false;
                }
              },
            },
          },
          {
            name: 'refFieldRight',
            type: FieldType.string,
          },
          {
            name: 'customVariableRight',
            type: FieldType.string,
            label: '右变量值',
            computedProps: {
              required: ({ record }) => {
                if (record.get('sourceTypeRight') === 'customVariable') {
                  if (record.get('operatorType')) {
                    return (
                      record.get('operatorType') !== 'IS_NULL' &&
                      record.get('operatorType') !== 'IS_NOT_NULL'
                    );
                  } else {
                    return true;
                  }
                } else {
                  return false;
                }
              },
            },
          },
          {
            name: 'expressionRight',
            type: FieldType.string,
            label: '右表单式值',
            computedProps: {
              required: ({ record }) => {
                if (record.get('sourceTypeRight') === 'expression') {
                  if (record.get('operatorType')) {
                    return (
                      record.get('operatorType') !== 'IS_NULL' &&
                      record.get('operatorType') !== 'IS_NOT_NULL'
                    );
                  } else {
                    return true;
                  }
                } else {
                  return false;
                }
              },
            },
          },
        ],
        events: {
          update({ name, value, record, oldValue }) {
            if (name === 'expressionId') {
              if (value) {
                const cur = ds?.current?.get('expressionList').filter(i => i?.id === value)?.[0]
                  ?.value;
                console.log(cur);
                // eslint-disable-next-line no-unused-expressions
                ds?.current?.set('expression', cur);
              } else {
                // eslint-disable-next-line no-unused-expressions
                ds?.current?.set('expression', null);
              }
            }
            if (name === 'expressionRightId') {
              if (value) {
                const cur = ds?.current?.get('expressionList').filter(i => i?.id === value)?.[0]
                  ?.value;
                console.log(cur);
                // eslint-disable-next-line no-unused-expressions
                ds?.current?.set('expressionRight', cur);
              } else {
                // eslint-disable-next-line no-unused-expressions
                ds?.current?.set('expressionRight', null);
              }
            }
            if (name === 'sourceType') {
              const sourceTypeArray = ['inputParameter', 'customVariable', 'expression'];
              // 选中一种类型，其他类型赋空
              sourceTypeArray
                .filter(item => item !== value)
                .forEach(item => {
                  record.set(item, '');
                });
              setSourceType(value);
              if (value === 'customVariable') {
                getCustomVariable(flowId).then(res => {
                  if (getResponse(res)) {
                    setCustomVariableList(res);
                  } else {
                    setCustomVariableList([]);
                  }
                });
              }
            }
            if (name === 'sourceTypeRight') {
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
                  const mapObj = {
                    fixedValue: 'valueRight',
                    inputParameter: 'inputParameterRight',
                    customVariable: 'customVariableRight',
                    expression: 'expressionRight',
                  };
                  record.set(mapObj[item], '');
                });
              setSourceTypeRight(value);
              if (value === 'customVariable') {
                getCustomVariable(flowId).then(res => {
                  if (getResponse(res)) {
                    setCustomVariableList(res);
                  } else {
                    setCustomVariableList([]);
                  }
                });
              }
            }
            if (name === 'inputParameterId') {
              if (value) {
                setInputParameterIdFunc(value, record);
                if (value !== oldValue) {
                  record.set('inputParameter', '');
                }
              } else {
                record.set('componentType', null);
                record.set('inputParameter', null);
              }
            }
            if (name === 'inputParameterIdRight') {
              if (value) {
                setInputParameterIdRightFunc(value);
                if (value !== oldValue) {
                  record.set('inputParameterRight', '');
                }
              } else {
                record.set('inputParameterRight', null);
              }
            }
            // 如果操作符是为空或不为空，后续字段都不用填
            if (name === 'operatorType') {
              setOperatorType(value);
            }
            // // 当选择是自定义变量时，根据type转换成componentType
            // if(name === 'customVariable') {
            //   console.log('value', value);
            //   const selectedData = customVariableList.find(item => item.code === value);
            //   if(selectedData) {
            //     if(selectedData?.type?.toLowerCase() === 'number') {
            //       record.set('componentType', 'NUMBER_FIELD');
            //     }
            //     if(selectedData?.type?.toLowerCase() === 'string') {
            //       record.set('componentType', 'TEXT_FIELD');
            //     }
            //     if(selectedData?.type?.toLowerCase() === 'boolean') {
            //       record.set('componentType', 'SWITCH');
            //     }
            //   };
            //   useForceUpdate();
            // }
          },
          load: ({ dataSet }) => {
            const data = dataSet.current.toData();
            console.log('file: FieldAssign.tsx ~ line 274 ~ FieldAssign ~ data', data);
            setSourceType(data.sourceType);
            setSourceTypeRight(data.sourceTypeRight);
            if (data.operatorType) {
              setOperatorType(data.operatorType);
            }
            // if (data.sourceType === 'inputParameter') {
            //   setInputParameterIdFunc(data.inputParameterId);
            // }
            // if (data.sourceTypeRight === 'inputParameter') {
            //   setInputParameterIdRightFunc(data.inputParameterIdRight);
            // }
          },
        },
        data: [{ ...curRecord, inputParameterOriginData }],
      }),
    []
  );

  useEffect(() => {
    parentDataSet.childrenDs.set(index, ds);
    return () => {
      parentDataSet.childrenDs.delete(index);
      formValidate.remove('validate', fn);
    };
  }, []);

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
    const data = ds?.current?.toData();
    // eslint-disable-next-line no-unused-expressions
    ds?.current?.set('inputParameterOriginData', inputParameterOriginData);
    if (data.sourceType === 'inputParameter') {
      setInputParameterIdFunc(data.inputParameterId);
    }
    if (data.sourceTypeRight === 'inputParameter') {
      setInputParameterIdRightFunc(data.inputParameterIdRight);
    }
  }, [inputParameterOriginData]);

  useEffect(() => {
    formValidate.remove('validate', fn);
    formValidate.listen('validate', fn);
  }, []);

  useEffect(() => {
    const data = ds?.current?.toData();
    // eslint-disable-next-line no-unused-expressions
    ds?.current?.set('expressionList', expressionList);
    if (!data?.expressionId && data?.expression) {
      const curId = expressionList.filter(i => i?.value === data?.expression)?.[0]?.id;
      // eslint-disable-next-line no-unused-expressions
      ds?.current?.set('expressionId', curId);
    }
    if (!data?.expressionRightId && data?.expressionRight) {
      const curId = expressionList.filter(i => i?.value === data?.expressionRight)?.[0]?.id;
      // eslint-disable-next-line no-unused-expressions
      ds?.current?.set('expressionRightId', curId);
    }
  }, [expressionList]);

  const handleOk = (params, businessObjectCode) => {
    const { result, value } = params;
    if (ds.current) {
      ds.current.set('componentType', result.componentType);
      ds.current.set('inputParameter', value);
      // ds.current.set('refField', value);
    }
    console.log('file: ConditionBranchAssign.tsx ~ line 15 ~ handleOk ~ params', params);
    drill({
      query: { businessObjectCode, drillMainKeyFlag: true },
    }).then(res => {
      if (getResponse(res)) {
        if (ds.current) {
          // eslint-disable-next-line no-unused-expressions
          ds?.current.set('customPrimaryKeyCode', res?.customPrimaryKeyCode);
        }
      }
    });
  };

  const handleOkRight = (params, businessObjectCode) => {
    const { value } = params;
    if (ds.current) {
      ds.current.set('inputParameterRight', value);
      ds.current.set('refFieldRight', value);
    }
    drill({
      query: { businessObjectCode, drillMainKeyFlag: true },
    }).then(res => {
      if (getResponse(res)) {
        if (ds.current) {
          // eslint-disable-next-line no-unused-expressions
          ds?.current.set('customPrimaryKeyCodeRight', res?.customPrimaryKeyCode);
        }
      }
    });
  };

  const drillRenderer = (businessObjectCode, flag = 'left') => {
    return (
      <DrillComponent
        onOk={
          flag === 'left'
            ? params => {
                handleOk(params, businessObjectCode);
              }
            : params => {
                handleOkRight(params, businessObjectCode);
              }
        }
        onClear={() =>
          flag === 'left'
            ? ds?.current?.set('inputParameter', '')
            : ds?.current?.set('inputParameterRight', '')
        }
        name={flag === 'left' ? 'inputParameter' : 'inputParameterRight'}
        initValue={flag === 'left' ? curRecord?.inputParameter : curRecord?.inputParameterRight}
        businessObjectCode={businessObjectCode}
        drillMainKeyType={EDrillMainKeyType.ALL}
      />
    );
  };

  // 构建表达式
  const buildExpression = flag => {
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
              setExpressionList(JSON.parse(res.expression));
              if (flag === 'left') {
                const data = JSON.parse(res.expression) || [];
                const cur = data.filter(i => i?.id === ds?.current?.get('expressionId'))?.[0]
                  ?.value;
                // eslint-disable-next-line no-unused-expressions
                ds?.current?.set('expression', cur);
                console.log(cur);
              } else {
                const data = JSON.parse(res.expression) || [];
                const cur = data.filter(i => i?.id === ds?.current?.get('expressionRightId'))?.[0]
                  ?.value;
                console.log(cur);
                // eslint-disable-next-line no-unused-expressions
                ds?.current?.set('expressionRight', cur);
              }
            }
          });
        }, 100);
      },
      style: {
        width: 957,
      },
    });
  };

  const selectCustomVariable = value => {
    const selectedData = customVariableList.find(item => item.code === value);
    if (selectedData && ds.current) {
      if (selectedData?.type?.toLowerCase() === 'number') {
        ds.current.set('componentType', 'NUMBER_FIELD');
      }
      if (selectedData?.type?.toLowerCase() === 'text') {
        ds.current.set('componentType', 'TEXT_FIELD');
      }
      if (selectedData?.type?.toLowerCase() === 'boolean') {
        ds.current.set('componentType', 'SWITCH');
      }
    }
  };

  const selectExpression = () => {
    if (ds.current) {
      ds.current.set('componentType', 'TEXT_FIELD');
    }
  };

  return (
    <div className={styles['field-assign']}>
      <Form
        dataSet={ds}
        labelAlign={LabelAlign.left}
        disabled={versionDisabled || viewType !== 'detail'}
      >
        <Row gutter={10}>
          <Col span={6}>
            <Select name="sourceType">
              <Option value="inputParameter">入参</Option>
              {/* <Option value="customVariable">自定义变量</Option> */}
              <Option value="expression">表达式</Option>
            </Select>
          </Col>
          {sourceType === 'inputParameter' && (
            <Col span={6}>
              <TreeSelect name="inputParameterId">{treeData(inputParameterData)}</TreeSelect>
            </Col>
          )}
          <Col span={6}>
            {sourceType === 'inputParameter' && inputParameterId && (
              <Output
                name="inputParameter"
                renderer={() => drillRenderer(inputParameterId, 'left')}
              />
            )}
            {sourceType === 'customVariable' && (
              <Select name="customVariable" onChange={value => selectCustomVariable(value)}>
                {customVariableList.map(item => (
                  <Option value={item.code}>{item.code}</Option>
                ))}
              </Select>
            )}
            {sourceType === 'expression' && (
              <div style={{ display: 'flex' }}>
                <Select name="expressionId" onChange={() => selectExpression()}>
                  {expressionList.map(item => (
                    <Option value={item.id}>{item.name}</Option>
                  ))}
                </Select>
                <ImgIcon
                  name="goujian.svg"
                  size={16}
                  style={{ marginTop: '6px' }}
                  onClick={() => buildExpression('left')}
                />
              </div>
            )}
          </Col>
        </Row>
        <Row gutter={10}>
          <Col span={6}>
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
                      'BEFORE',
                      'AFTER',
                      'NOT_BEFORE',
                      'NOT_AFTER',
                      'IS_NULL',
                      'IS_NOT_NULL',
                      'BETWEEN',
                      'NOT_BETWEEN',
                    ],
                  },
                  {
                    componentType: ['DATETIME_SELECTION_BOX'],
                    operatorType: [
                      'EQUAL',
                      'NOT_EQUAL',
                      'BEFORE',
                      'AFTER',
                      'NOT_BEFORE',
                      'NOT_AFTER',
                      'IS_NULL',
                      'IS_NOT_NULL',
                      'BETWEEN',
                      'NOT_BETWEEN',
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
                    ],
                  },
                  {
                    componentType: ['CHECKBOX', 'MULTIPLE_SELECT'],
                    operatorType: ['IS_NULL', 'IS_NOT_NULL', 'IN', 'NOT_IN'],
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
                      'LINK_RELATION',
                      'MASTER_RELATION',
                      'REFERENCE_FIELD',
                      'custom',
                    ],
                    operatorType: [
                      'EQUAL',
                      'NOT_EQUAL',
                      'IS_NULL',
                      'IS_NOT_NULL',
                      'IN',
                      'NOT_IN',
                      'BEFORE_FUZZY',
                      'AFTER_FUZZY',
                    ],
                  },
                ];
                for (const { componentType, operatorType: _operatorType } of arr) {
                  if (componentType.includes(ds?.current?.get('componentType'))) {
                    return _operatorType.includes(item);
                  }
                }
                return false;
              }}
            />
          </Col>
        </Row>
        {operatorType !== 'IS_NULL' && operatorType !== 'IS_NOT_NULL' && (
          <Row gutter={10}>
            <Col span={6}>
              <Select name="sourceTypeRight">
                <Option value="fixedValue">固定值</Option>
                <Option value="inputParameter">入参</Option>
                {/* <Option value="customVariable">自定义变量</Option> */}
                <Option value="expression">表达式</Option>
                {/* <Option value="fieldRef">字段引用</Option> */}
              </Select>
            </Col>
            {sourceTypeRight === 'inputParameter' && (
              <Col span={6}>
                <TreeSelect name="inputParameterIdRight">{treeData(inputParameterData)}</TreeSelect>
              </Col>
            )}
            <Col span={6}>
              {sourceTypeRight === 'fixedValue' && <TextField name="valueRight" />}
              {sourceTypeRight === 'inputParameter' && inputParameterIdRight && (
                <Output
                  name="inputParameterRight"
                  renderer={() => drillRenderer(inputParameterIdRight, 'right')}
                />
              )}
              {sourceTypeRight === 'customVariable' && (
                <Select name="customVariableRight">
                  {customVariableList.map(item => (
                    <Option value={item.code}>{item.code}</Option>
                  ))}
                </Select>
              )}
              {sourceTypeRight === 'expression' && (
                <div style={{ display: 'flex' }}>
                  <Select name="expressionRightId">
                    {expressionList.map(item => (
                      <Option value={item.id}>{item.name}</Option>
                    ))}
                  </Select>
                  <ImgIcon
                    name="goujian.svg"
                    size={16}
                    style={{ marginTop: '6px' }}
                    onClick={() => buildExpression('right')}
                  />
                </div>
              )}
            </Col>
          </Row>
        )}
      </Form>
    </div>
  );
};

export default ConditionBranchAssign;
