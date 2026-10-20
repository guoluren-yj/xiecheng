/**
 * ExpressionEngine 规则引擎
 * @date: 2022-04-28
 * @author: lokya <kan.li01@going-link.com>
 * @copyright Copyright (c) 2022, Hand
 */

import React, { Fragment, useEffect, useState } from 'react';
import {
  DataSet,
  Form,
  SelectBox,
  TextField,
  Button,
  Tooltip,
  Lov,
  Select,
  NumberField,
  Output,
  CheckBox,
  DatePicker,
  DateTimePicker,
} from 'choerodon-ui/pro';
import { Icon, Spin } from 'choerodon-ui';
import { observer } from 'mobx-react-lite';
import formatterCollections from 'utils/intl/formatterCollections';
import { getResponse, isTenantRoleLevel, getCurrentOrganizationId } from 'utils/utils';
// import notification from 'utils/notification';
import { DEFAULT_DATE_FORMAT, DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import intl from 'utils/intl';
import { getOperatorList, getC7nComponentType, isJSON } from './utils';
import { getDynamicDetail, getToDoDetail } from './expressionEngineService';
import style from './index.less';

const { Option } = Select;
const currentOrganizationId = getCurrentOrganizationId();
// 条件引擎
const ExpressionTerm = observer((propsParam) => {
  const { dataSet, deleteCurrentRule, controlDataSet, cuszFlag = 1 } = propsParam;
  const controlFlag =
    controlDataSet && controlDataSet.current && controlDataSet.current.get('conditionType') !== 'TRUE';
  const renderOperator = (record) => {
    const { leftValue, rightValueType } = record.get(['leftValue', 'rightValueType']) || {};
    const { type } = leftValue || {};
    const optionList = getOperatorList(type, rightValueType === 'variable');
    return optionList.map((item) => <Option value={item.value}>{item.meaning}</Option>);
  };

  const renderRightValue = (record, name) => {
    const leftValue = record.get('leftValue') || {};
    const rightValueType = record.get('rightValueType');
    const basicConfig = {
      colSpan: 5,
      name,
    };
    let Component = <TextField {...basicConfig} />;
    if (leftValue.type && getC7nComponentType(leftValue.type) === 'number') {
      Component = <NumberField {...basicConfig} />;
    }
    if (
      leftValue.lookupCode ||
      leftValue.type === 'SWITCH' ||
      leftValue.type === 'RADIO' ||
      leftValue.type === 'CHECKBOX'
    ) {
      Component = <Select {...basicConfig} />;
    }
    if (leftValue.type && getC7nComponentType(leftValue.type) === 'date') {
      Component = <DatePicker {...basicConfig} />;
    }
    if (leftValue.type && getC7nComponentType(leftValue.type) === 'dateTime') {
      Component = <DateTimePicker {...basicConfig} />;
    }
    // 此处将 variable 的判断置为最后确保 rightValueType === 'variable' 渲染为lov
    if (leftValue.lovCode || rightValueType === 'variable') {
      Component = <Lov {...basicConfig} />;
    }
    return Component;
  };

  return (
    <div className="expression-engine-multiple-rule">
      {controlFlag &&
        dataSet.records &&
        dataSet.records.length > 0 &&
        dataSet.records.map((expression) => {
          if (expression.status !== 'delete') {
            return (
              <Form
                record={expression}
                labelLayout="float"
                columns={20}
                className="expression-engine-multiple-rule-row"
                disabled={isTenantRoleLevel() && cuszFlag}
              >
                <div colSpan={1}>#{expression.index + 1}</div>
                <Lov name="leftValue" colSpan={5} />
                <Select name="rightValueType" colSpan={4} />
                <Select name="operator" colSpan={4}>
                  {renderOperator(expression)}
                </Select>
                {renderRightValue(expression, 'rightValue')}
                <Button
                  icon="delete"
                  colSpan={1}
                  shape="circle"
                  funcType="flat"
                  onClick={() => deleteCurrentRule(expression)}
                />
              </Form>
            );
          } else {
            return null;
          }
        })}
    </div>
  );
});
// 订阅对象
const SubExpressionTerm = observer((propsParam) => {
  const { dataSet, deleteCurrentRule, controlDataSet } = propsParam;
  const controlFlag =
    controlDataSet && controlDataSet.current && controlDataSet.current.get('conditionType') !== 'TRUE';
  const renderRightValue = (record, name) => {
    const leftValue = record.get('leftValue') || {};
    const basicConfig = {
      colSpan: 4,
      name,
    };
    let Component = <Lov {...basicConfig} />;
    if (leftValue) {
      Component = <Lov {...basicConfig} />;
    }
    return Component;
  };

  return (
    <div className="expression-engine-multiple-rule">
      {controlFlag &&
        dataSet.records &&
        dataSet.records.length > 0 &&
        dataSet.records.map((expression) => {
          if (expression.status !== 'delete') {
            return (
              <Form
                record={expression}
                labelLayout="float"
                columns={20}
                className="expression-engine-multiple-rule-row"
              >
                <div colSpan={1}>#{expression.index + 1}</div>
                <Select name="leftValue" colSpan={4} />
                {renderRightValue(expression, 'rightValueLov')}
                <Button
                  icon="delete"
                  colSpan={1}
                  shape="circle"
                  funcType="flat"
                  onClick={() => deleteCurrentRule(expression)}
                />
              </Form>
            );
          } else {
            return null;
          }
        })}
    </div>
  );
});
function ExpressionEngine(props) {
  const {
    currentRecord,
    triggerRuleDs,
    activeKey,
    childRef,
    // booleanTransformFlag = true,
  } = props;
  const isTenant = isTenantRoleLevel();
  const [conditionTypeDs, setConditionTypeDs] = useState(new DataSet());
  const [expressionDs, setExpressionDs] = useState(new DataSet());
  const [customizeConditionCombinationDs, setCustomizeConditionCombinationDs] = useState(new DataSet());

  const [expressionEngineLoading, handleExpressionEngineLoading] = useState(true);
  // 订阅对象
  const [ruleTypeDs, setRuleTypeDs] = useState(new DataSet());
  const [subExpressionDs, setSubExpressionDs] = useState(new DataSet());
  const [customRuleCombinationDs, setCustomRuleCombinationDs] = useState(new DataSet());
  const DS_CONFIG = {
    autoCreate: false,
    selection: false,
    autoQuery: false,
  };
  const { actionId, todoId, combineCode, generateType, cuszFlag } = currentRecord.get([
    'actionId',
    'todoId',
    'combineCode',
    'generateType',
    'cuszFlag',
  ]);
  useEffect(() => {
    queryAndSetDs();
    triggerRuleDs.loadData([currentRecord]);
  }, [triggerRuleDs]);

  /**
   * 动态定义详情查询
   * 判断是关注还是待办接口
   * @actionId --关注定义主键ID
   * @todoId   --待办定义主键ID
   */
  const queryAndSetDs = () => {
    if (actionId) {
      handleExpressionEngineLoading(true);
      getDynamicDetail({ actionId }).then((res) => {
        if (getResponse(res)) {
          setAllDs(res);
          setSubObject(res);
          handleExpressionEngineLoading(false);
        }
      });
    } else {
      handleExpressionEngineLoading(true);
      getToDoDetail({ todoId }).then((res) => {
        if (getResponse(res)) {
          setAllDs(res);
          setSubObject(res);
          handleExpressionEngineLoading(false);
        }
      });
    }
  };

  /**
   * 订阅对象- 对象定义
   */
  const setSubObject = (res) => {
    const { conditionType, conditionLines, customizeConditionCombination } = JSON.parse(res.subscriberJson || '{}');
    setRuleTypeDs(createRuleTypeDs(conditionType));
    setSubExpressionDs(createSubExpressionDs(conditionLines));
    setCustomRuleCombinationDs(createCustomRuleCombinationDs(customizeConditionCombination));
  };
  /**
   * 条件引擎- 对象定义
   */
  const setAllDs = (res) => {
    const { conditionType, conditionLines, customizeConditionCombination, rightValue } = JSON.parse(
      res.generateCondJson || '{}'
    );
    setConditionTypeDs(createConditionTypeDs(conditionType));
    setExpressionDs(createExpressionDs(conditionLines));
    setCustomizeConditionCombinationDs(createCustomizeConditionCombinationDs(customizeConditionCombination));
  };
  // 条件引擎
  const createConditionTypeDs = (conditionType) => {
    return new DataSet({
      ...DS_CONFIG,
      fields: [
        {
          name: 'conditionType',
          type: 'string',
          dynamicProps: {
            required: ({ record }) => {
              return record.get('generateType') === 'FIELD';
            },
          },
        },
      ],
      data: [
        {
          conditionType: conditionType || 'TRUE',
        },
      ],
    });
  };
  // 订阅对象
  const createRuleTypeDs = (conditionType) => {
    return new DataSet({
      ...DS_CONFIG,
      fields: [
        {
          name: 'conditionType',
          type: 'string',
          label: intl.get('swbh.common.model.common.ConfigRule').d('配置推送规则'),
          required: true,
        },
      ],
      data: [{ conditionType: conditionType || 'TRUE' }],
    });
  };
  const createExpressionDs = (conditionLines) => {
    return new DataSet({
      ...DS_CONFIG,
      fields: [
        {
          name: 'leftValue',
          type: 'object',
          label: intl.get('swbh.common.model.common.leftValue').d('特性'),
          required: true,
          textField: 'label',
          lovCode: isTenant ? 'SWBH.OBJECT_CONDITION_FIELD' : 'SWBH.OBJECT_COND_FIELD_SITE',
          lovPara: { combineCode },
        },
        {
          name: 'rightValueType',
          type: 'string',
          label: intl.get('swbh.common.model.common.constantVariable').d('常量/变量'),
          required: true,
          lookupCode: 'SDPS.EXPRESSION.RIGHT_VALUE_TYPE',
          dynamicProps: {
            disabled: ({ record }) => {
              return !record.get('leftValue');
            },
          },
        },
        {
          name: 'operator',
          type: 'string',
          label: intl.get('swbh.common.model.common.operator').d('特性条件'),
          required: true,
          dynamicProps: {
            disabled: ({ record }) => {
              return !record.get('rightValueType');
            },
          },
        },
        {
          name: 'rightValue',
          type: 'string',
          label: intl.get('swbh.common.model.common.rightValue').d('特性值'),
          required: true,
          lookupCode: 'HPFM.FLAG',
          transformRequest: (value, record) => {
            const isNeedJsonHandle = ['IN', 'NOT_IN'].includes(record.get('operator'));
            const { type } = record.get('leftValue') || {};
            const componentType = getC7nComponentType(type);
            if (isNeedJsonHandle || typeof value === 'object') {
              if (componentType === 'date') {
                return value.format(DEFAULT_DATE_FORMAT);
              } else if (componentType === 'dateTime') {
                return value.format(DEFAULT_DATETIME_FORMAT);
              } else {
                return JSON.stringify(value);
              }
            } else {
              return value;
            }
          },
          transformResponse: (value, object) => {
            const isNeedJsonHandle = ['IN', 'NOT_IN'].includes(object.operator);
            if (isNeedJsonHandle || isJSON(value)) {
              return JSON.parse(value);
            } else {
              return value;
            }
          },
          dynamicProps: {
            type: ({ record }) => {
              const { type } = record.get('leftValue') || {};
              const rightValueType = record.get('rightValueType');
              return getC7nComponentType(rightValueType === 'variable' ? 'SINGLE_LOV' : type);
            },
            lovCode: ({ record }) => {
              const { lovCode } = record.get('leftValue') || {};
              const rightValueType = record.get('rightValueType');
              if (rightValueType === 'variable') {
                return isTenant ? 'SWBH.OBJECT_CONDITION_FIELD' : 'SWBH.OBJECT_COND_FIELD_SITE';
              } else {
                return lovCode;
              }
            },
            lovPara: ({ record }) => {
              const rightValueType = record.get('rightValueType');
              const leftValue = record.get('leftValue') || {};
              return rightValueType === 'variable'
                ? {
                    combineCode,
                    type: leftValue.type,
                  }
                : {
                    type: leftValue.type,
                  };
            },
            lookupCode: ({ record }) => {
              const { lookupCode } = record.get('leftValue') || {};
              return lookupCode || null;
            },
            multiple: ({ record }) => {
              const rightValueType = record.get('rightValueType');
              const isMultiple = ['IN', 'NOT_IN'].includes(record.get('operator'));
              return !(rightValueType === 'variable' || !isMultiple);
            },
            disabled: ({ record }) => {
              return !record.get('rightValueType') || ['EXISTS', 'NOT_EXISTS'].includes(record.get('operator'));
            },
            required: ({ record }) => {
              return !['EXISTS', 'NOT_EXISTS'].includes(record.get('operator'));
            },
            precision: ({ record }) => {
              const { type } = record.get('leftValue') || {};
              if (type === 'NUMBER_FIELD') {
                return 0;
              } else if (type === 'FLOAT') {
                return 6; // FLOAT类型最多保留6位小数
              } else {
                return null;
              }
            },
            min: ({ record }) => {
              const { type } = record.get('leftValue') || {};
              if (type === 'MONEY') {
                return 0;
              } else {
                return null;
              }
            },
            // trueValue: ({ record }) => {
            //   const { type } = record.get('leftValue') || {};
            //   if (booleanTransformFlag) {
            //     if (type === 'SWITCH') {
            //       return 1;
            //     } else {
            //       return true;
            //     }
            //   } else {
            //     return undefined;
            //   }
            // },
            // falseValue: ({ record }) => {
            //   const { type } = record.get('leftValue') || {};
            //   if (booleanTransformFlag) {
            //     if (type === 'SWITCH') {
            //       return 0;
            //     } else {
            //       return false;
            //     }
            //   } else {
            //     return undefined;
            //   }
            // },
          },
        },
      ],
      data: conditionLines || [],
      events: {
        update: ({ record, name }) => {
          if (name === 'leftValue') {
            record.set('operator', undefined);
            record.init('rightValue', undefined);
            record.set('rightValueType', undefined);
          }
          if (name === 'rightValueType') {
            record.init('rightValue', undefined);
            record.set('operator', undefined);
          }
          if (name === 'operator') {
            record.init('rightValue', undefined);
          }
        },
      },
    });
  };

  /**
   * 订阅对象-- 条件配置
   * @param {*} conditionLines
   * @returns
   */
  const createSubExpressionDs = (conditionLines) => {
    return new DataSet({
      ...DS_CONFIG,
      fields: [
        {
          name: 'leftValue',
          type: 'string',
          label: intl.get('swbh.common.model.common.subscriptionType').d('订阅类型'),
          required: true,
          lookupCode: 'SWBH.SUBSCRIPTION_TYPE',
        },
        {
          name: 'rightValueLov',
          type: 'object',
          label: intl.get('swbh.common.model.common.menuPermissions').d('菜单权限'),
          required: true,
          transformRequest: (value) => {
            if (typeof value === 'object') {
              return JSON.stringify(value);
            } else {
              return value;
            }
          },
          transformResponse: (value) => {
            if (isJSON(value)) {
              return JSON.parse(value);
            } else {
              return value;
            }
          },
          dynamicProps: {
            // type: ({ record }) => {
            //   const { type } = record.get('leftValue') || {};
            //   return getC7nComponentType(type);
            // },
            label: ({ record }) => {
              const leftValue = record.get('leftValue') || {};
              if (leftValue === 'menuPermission') {
                return intl.get('swbh.common.model.common.menuPermissions').d('菜单权限');
              } else if (leftValue === 'assignRole') {
                return intl.get('swbh.common.model.common.role').d('角色');
              } else if (leftValue === 'assignUserField') {
                return intl.get('swbh.common.model.common.compositeObject').d('组合业务对象');
              } else if (leftValue === 'assignUser') {
                return intl.get('swbh.common.model.common.subaccount').d('子账号');
              }
            },
            lovCode: ({ record }) => {
              const leftValue = record.get('leftValue') || {};
              if (leftValue === 'menuPermission') {
                return 'SWBH.MENU_PERMISSION';
              } else if (leftValue === 'assignRole') {
                return 'LOV_ROLE';
              } else if (leftValue === 'assignUserField') {
                return 'SWBH.OBJECT_FIELD';
              } else if (leftValue === 'assignUser') {
                return 'SSLM.KPI_USER';
              }
            },
            lovPara: ({ record }) => {
              const leftValue = record.get('leftValue') || {};
              if (leftValue === 'assignUserField') {
                return { combineCode };
              } else if (leftValue === 'assignUser') {
                return { tenantId: currentOrganizationId };
              }
            },
            disabled: ({ record }) => {
              return !record.get('leftValue');
            },
          },
        },
        {
          name: 'rightValue',
          bind: 'rightValueLov.psCode',
        },
        {
          name: 'rightValueCode',
          bind: 'rightValueLov.id',
        },
        {
          name: 'rightValueFieldCode',
          bind: 'rightValueLov.fieldCode',
        },
        {
          name: 'rightValueLoginName',
          bind: 'rightValueLov.userId',
        },
      ],
      data: conditionLines,
      events: {
        update: ({ record, name }) => {
          if (name === 'leftValue') {
            record.init('rightValue', undefined);
          }
        },
      },
    });
  };
  const createCustomizeConditionCombinationDs = (customizeConditionCombination) => {
    return new DataSet({
      ...DS_CONFIG,
      fields: [
        {
          name: 'customizeConditionCombination',
          disabled: isTenantRoleLevel() && cuszFlag,
          type: 'string',
          label: intl.get('swbh.common.view.select.customize').d('自定义规则'),
        },
      ],
      data: [{ customizeConditionCombination }],
    });
  };
  // 订阅对象
  const createCustomRuleCombinationDs = (customizeConditionCombination) => {
    return new DataSet({
      ...DS_CONFIG,
      fields: [
        {
          name: 'customizeConditionCombination',
          type: 'string',
          label: intl.get('swbh.common.view.select.customize').d('自定义规则'),
        },
      ],
      data: [{ customizeConditionCombination }],
    });
  };
  const setCustomizeConditionCombination = () => {
    const conditionType = conditionTypeDs.current.get('conditionType');
    let formula = '';
    if (conditionType === 'OR' || conditionType === 'AND') {
      const effectiveCondition = expressionDs.records.filter((record) => record.status !== 'delete');
      if (effectiveCondition.length === 0) {
        formula = '';
      } else if (effectiveCondition.length === 1) {
        formula = '1';
      } else {
        formula = effectiveCondition.map((_, index) => index + 1).join(` ${conditionType} `);
      }
    } else if (conditionType === 'TRUE') {
      formula = null;
    } else {
      formula = customizeConditionCombinationDs.current.get('customizeConditionCombination');
    }
    customizeConditionCombinationDs.getField('customizeConditionCombination').set('required', conditionType !== 'TRUE');
    customizeConditionCombinationDs.current.set('customizeConditionCombination', formula);
  };
  const setSubCustomizeConditionCombination = () => {
    const conditionType = ruleTypeDs.current.get('conditionType');
    let formula = '';
    if (conditionType === 'OR' || conditionType === 'AND') {
      const effectiveCondition = subExpressionDs.records.filter((record) => record.status !== 'delete');
      if (effectiveCondition.length === 0) {
        formula = '';
      } else if (effectiveCondition.length === 1) {
        formula = '1';
      } else {
        formula = effectiveCondition.map((_, index) => index + 1).join(` ${conditionType} `);
      }
    } else if (conditionType === 'TRUE') {
      formula = null;
    } else {
      formula = customRuleCombinationDs.current.get('customizeConditionCombination');
    }
    customRuleCombinationDs.getField('customizeConditionCombination').set('required', conditionType !== 'TRUE');
    customRuleCombinationDs.current.set('customizeConditionCombination', formula);
  };
  /**
   * 新建 --条件引擎规则定义
   */
  const createExpressionRule = () => {
    expressionDs.create();
    expressionDs.current.status = 'update';
    setCustomizeConditionCombination();
  };
  /**
   * 新建 --订阅对象规则定义
   */
  const createSubExpressionRule = () => {
    subExpressionDs.create();
    subExpressionDs.current.status = 'update';
    setSubCustomizeConditionCombination();
  };
  /**
   * 删除 --条件引擎规则定义
   */
  const deleteCurrentRule = (record) => {
    expressionDs.delete(record).then(() => {
      setCustomizeConditionCombination();
    });
  };
  /**
   * 删除 --订阅对象规则定义
   */
  const deleteSubCurrentRule = (record) => {
    subExpressionDs.delete(record).then(() => {
      setSubCustomizeConditionCombination();
    });
  };
  /**
   *
   * 保存--条件引擎规则定义 json数据
   * @returns
   */
  const getExpressionEngineJson = async () => {
    const customizeConditionCombination = customizeConditionCombinationDs.current.get('customizeConditionCombination');
    const conditionType = conditionTypeDs.current.get('conditionType');
    const conditionLines = conditionType === 'TRUE' ? [] : expressionDs.toData();
    const dsValidate = await expressionDs.validate();
    return dsValidate ? JSON.stringify({ conditionType, conditionLines, customizeConditionCombination }) : false;
  };
  /**
   * 保存--订阅对象规则定义 json数据
   * @returns
   */
  const getSubExpressionEngineJson = async () => {
    const customizeConditionCombination = customRuleCombinationDs?.current?.get('customizeConditionCombination');
    const conditionType = ruleTypeDs?.current?.get('conditionType');
    const conditionLines = conditionType === 'TRUE' ? [] : subExpressionDs.toData();

    const dsValidate = await subExpressionDs.validate();
    const _conditionLines = conditionLines.map((item) => {
      const target = {
        menuPermission: 'rightValue',
        assignRole: 'rightValueCode',
        assignUserField: 'rightValueFieldCode',
        assignUser: 'rightValueLoginName',
      };
      const leftValue = ['menuPermission', 'assignRole', 'assignUserField', 'assignUser'];
      if (leftValue.includes(item.leftValue)) {
        const targetKey = target[item.leftValue];
        return {
          ...item,
          rightValue: item[targetKey],
          rightValueCode: undefined,
          rightValueFieldCode: undefined,
          rightValueLoginName: undefined,
        };
      }
      return item;
    });
    return dsValidate
      ? JSON.stringify({
          conditionType,
          conditionLines: _conditionLines,
          customizeConditionCombination,
        })
      : false;
  };
  const resetExpressionEngineAllDs = () => {
    expressionDs.reset();
    conditionTypeDs.reset();
    customizeConditionCombinationDs.reset();
  };
  const resetSubExpressionEngineAllDs = () => {
    subExpressionDs.reset();
    ruleTypeDs.reset();
    customRuleCombinationDs.reset();
  };
  if (childRef) {
    childRef.current = {
      getExpressionEngineJson,
      resetExpressionEngineAllDs,
      getSubExpressionEngineJson,
      resetSubExpressionEngineAllDs,
    };
  }
  const changeConditionType = () => {
    setCustomizeConditionCombination();
  };
  const changeSubConditionType = () => {
    setCustomizeConditionCombination();
  };
  const AddExpressionRuleBtn = observer((propsParam) => {
    const { dataSet } = propsParam;
    return (
      dataSet.current &&
      dataSet.current.get('conditionType') !== 'TRUE' && (
        <Tooltip title={intl.get('swbh.common.view.card.button.add').d('新建条件规则')}>
          <a
            className="expression-engine-multiple-rule-add-btn"
            onClick={createExpressionRule}
            disabled={isTenantRoleLevel() && cuszFlag}
          >
            <Icon type="control_point" />
          </a>
        </Tooltip>
      )
    );
  });
  const AddSubExpressionRuleBtn = observer((propsParam) => {
    const { dataSet } = propsParam;
    return (
      dataSet.current &&
      dataSet.current.get('conditionType') !== 'TRUE' && (
        <Tooltip title={intl.get('swbh.common.view.card.button.add').d('新建条件规则')}>
          <a className="expression-engine-multiple-rule-add-btn" onClick={createSubExpressionRule}>
            <Icon type="control_point" />
          </a>
        </Tooltip>
      )
    );
  });
  const CustomizeConditionCombination = observer((propsParam) => {
    const { dataSet, controlDataSet } = propsParam;
    return (
      <Form columns={20} labelLayout="float" dataSet={dataSet}>
        <TextField
          name="customizeConditionCombination"
          colSpan={20}
          disabled={
            controlDataSet && controlDataSet.current && controlDataSet.current.get('conditionType') !== 'CUSTOMIZE'
          }
          help={intl
            .get('swbh.common.view.help.customizeConditionCombination')
            .d('使用 AND 和 OR 合并筛选器条件行。示例：(1 AND 2) OR 3')}
        />
      </Form>
    );
  });
  const SubCustomizeConditionCombination = observer((propsParam) => {
    const { dataSet, controlDataSet } = propsParam;
    return (
      <Form columns={20} labelLayout="float" dataSet={dataSet}>
        <TextField
          name="customizeConditionCombination"
          colSpan={20}
          disabled={
            controlDataSet && controlDataSet.current && controlDataSet.current.get('conditionType') !== 'CUSTOMIZE'
          }
          help={intl
            .get('swbh.common.view.help.customizeConditionCombination')
            .d('使用 AND 和 OR 合并筛选器条件行。示例：(1 AND 2) OR 3')}
        />
      </Form>
    );
  });
  return (
    <Fragment>
      <Spin spinning={expressionEngineLoading}>
        {/* <div className={style['base-info']}> */}
        <Form dataSet={triggerRuleDs} columns={3}>
          {/* 动态定义基础信息 */}
          {activeKey === 'dynamicDefine' && <Output name="tenantName" columns={3} />}
          {activeKey === 'dynamicDefine' && <Output name="combineName" colSpan={1} />}
          {activeKey === 'dynamicDefine' && <Output name="actionTitle" colSpan={1} />}
          {activeKey === 'dynamicDefine' && <Output name="triggerMethodMeaning" colSpan={1} />}
          {activeKey === 'dynamicDefine' && <Output name="executeFrequencyMeaning" colSpan={1} />}
          {activeKey === 'dynamicDefine' && <Output name="actionDesc" colSpan={1} />}
          {/* 待办定义基础信息 */}
          {activeKey === 'toDoDefine' && <Output name="tenantName" colSpan={1} />}
          {activeKey === 'toDoDefine' && <Output name="combineName" colSpan={1} />}
          {activeKey === 'toDoDefine' && <Output name="todoTitle" colSpan={1} />}
          {activeKey === 'toDoDefine' && <Output name="type" colSpan={1} />}
        </Form>
        {/* </div> */}
        <div className={style['expression-engine']}>
          <div className="expression-engine-title">
            {intl.get('swbh.common.view.card.conditionEngine').d('条件引擎 ')}
          </div>
          <Form dataSet={triggerRuleDs} columns={3} disabled={isTenant && cuszFlag}>
            <Select name="generateType" colSpan={1} />
          </Form>
          {generateType !== 'FIELD' && (
            <Form
              dataSet={triggerRuleDs}
              labelLayout="float"
              columns={3}
              className="expression-engine-api"
              disabled={isTenant && cuszFlag}
            >
              {generateType === 'API' && <TextField name="generateApi" colSpan={2} />}
              {generateType === 'ADAPTER' && <TextField name="generateAdapter" colSpan={2} />}
            </Form>
          )}
          {generateType === 'FIELD' && [
            <Form columns={2} labelLayout="float" dataSet={conditionTypeDs} disabled={isTenant && cuszFlag}>
              <SelectBox name="conditionType" colSpan={2} onChange={changeConditionType}>
                <SelectBox.Option value="TRUE">
                  {intl.get('swbh.common.view.select.true').d('无条件限制')}
                </SelectBox.Option>
                <SelectBox.Option value="OR">
                  {intl.get('swbh.common.view.select.or').d('满足任一条件')}
                </SelectBox.Option>
                <SelectBox.Option value="AND">
                  {intl.get('swbh.common.view.select.and').d('满足所有条件')}
                </SelectBox.Option>
                <SelectBox.Option value="CUSTOMIZE">
                  {intl.get('swbh.common.view.select.customizeRule').d('自定义组合规则')}
                </SelectBox.Option>
              </SelectBox>
            </Form>,

            <ExpressionTerm
              dataSet={expressionDs}
              deleteCurrentRule={deleteCurrentRule}
              controlDataSet={conditionTypeDs}
              cuszFlag={cuszFlag}
            />,
            <AddExpressionRuleBtn dataSet={conditionTypeDs} />,
            <CustomizeConditionCombination
              dataSet={customizeConditionCombinationDs}
              controlDataSet={conditionTypeDs}
            />,
          ]}
          <CheckBox dataSet={triggerRuleDs} name="defaultClearFlag" style={{ float: 'right' }}>
            {intl.get(`swbh.common.view.message.header.defaultClearFlag`).d('默认生成消除规则')}
          </CheckBox>
        </div>
        {/* 订阅对象 */}
        <div className={style['expression-engine']}>
          <Form columns={3} labelLayout="float" dataSet={ruleTypeDs}>
            <div className="expression-engine-title" colSpan={2}>
              {intl.get('swbh.common.view.modal.subscriptObject').d('订阅对象')}
            </div>
            <span className="expression-engine-help">
              <Tooltip
                title={intl
                  .get('swbh.common.view.modal.configDynamicObject')
                  .d(
                    '配置动态订阅对象的推送规则。其中，①角色菜单权限：拥有指定菜单权限的角色可接收动态；②单据相关用户：指定单据字段值为动态接收用户，如指定字段为采购员时需勾选“是否采购员”标记。注：订阅对象的匹配均结合单据权限。'
                  )}
              >
                <Icon type="help" />
              </Tooltip>
            </span>
            <SelectBox name="conditionType" colSpan={2} onChange={changeSubConditionType} disabled>
              <SelectBox.Option value="TRUE">
                {intl.get('swbh.common.view.select.true').d('无条件限制')}
              </SelectBox.Option>
              <SelectBox.Option value="OR">{intl.get('swbh.common.view.select.or').d('满足任一条件')}</SelectBox.Option>
              <SelectBox.Option value="AND">
                {intl.get('swbh.common.view.select.and').d('满足所有条件')}
              </SelectBox.Option>
              <SelectBox.Option value="CUSTOMIZE">
                {intl.get('swbh.common.view.select.customizeCondition').d('自定义组合条件')}
              </SelectBox.Option>
            </SelectBox>
          </Form>
          <SubExpressionTerm
            dataSet={subExpressionDs}
            deleteCurrentRule={deleteSubCurrentRule}
            controlDataSet={ruleTypeDs}
          />
          <AddSubExpressionRuleBtn dataSet={ruleTypeDs} />
          <SubCustomizeConditionCombination dataSet={customRuleCombinationDs} controlDataSet={ruleTypeDs} />
        </div>
      </Spin>
    </Fragment>
  );
}

export default formatterCollections({
  code: ['swbh.common'],
})(observer(ExpressionEngine));
