/**
 * ExpressionEngine 规则引擎
 * @date: 2022-04-28
 * @author: lokya <kan.li01@going-link.com>
 * @copyright Copyright (c) 2018, Hand
 */

import React, { useEffect, useState } from 'react';
import { DataSet, Form, SelectBox, TextField, Button, Tooltip, Lov, Select, NumberField, DatePicker, DateTimePicker, Modal } from 'choerodon-ui/pro';
import { Icon, Spin } from 'choerodon-ui';
import type { DataSetSelection} from 'choerodon-ui/pro/lib/data-set/enum';
import { FieldType, RecordStatus } from 'choerodon-ui/pro/lib/data-set/enum';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';
import type { Record } from 'choerodon-ui/dataset';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { observer } from 'mobx-react-lite';
import classNames from 'classnames';

import formatterCollections from 'utils/intl/formatterCollections';
import { isTenantRoleLevel, getResponse, getCurrentOrganizationId } from 'utils/utils';
import notification from 'utils/notification';
import intl from 'utils/intl';
import { DEFAULT_DATE_FORMAT, DEFAULT_DATETIME_FORMAT } from 'utils/constants';

import type { DataSetProps } from 'choerodon-ui/dataset/data-set/DataSet';
import { getOperatorList, getC7nComponentType, isJSON } from './utils';
import { getExpressionEngine, saveExpressionEngine, deleteExpressionEngine} from './expressionEngineService';
import style from './index.less';

interface ExpressionEngineProps {
  code: string;
  dataSource: any;
  currentTenantId: number;
  childRef: any;
  leftValueLovQueryPara: any;
  leftValueCode?: string;
  dsConfigHook?: (config) => DataSetProps
  disabled: boolean;
  booleanTransformFlag: boolean;
  rightValueParaHook: (T: Record) => any;
}

interface ExpressionTermProps {
  dataSet: DataSet;
  controlDataSet: DataSet;
  disabled: boolean;
  booleanTransformFlag: boolean,
  deleteCurrentRule: (T: Record) => void;
}

interface AddExpressionRuleBtnProps {
  dataSet: DataSet;
}

interface CustomizeConditionCombinationProps {
  dataSet: DataSet;
  controlDataSet: DataSet;
}

const { Option } = Select;
const currentOrganizationId = getCurrentOrganizationId();

const ExpressionTerm = observer((propsParam: ExpressionTermProps) => {
  const { dataSet, deleteCurrentRule, controlDataSet, disabled, booleanTransformFlag } = propsParam;
  const controlFlag = controlDataSet && controlDataSet.current && controlDataSet.current.get('conditionType') !== 'TRUE';
  const renderOperator = (record) => {
    const {leftValue, rightValueType} = record.get(['leftValue', 'rightValueType']) || {};
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
    if (leftValue.lookupCode) {
      Component = <Select {...basicConfig} />;
    }
    if (leftValue.type && getC7nComponentType(leftValue.type) === 'date') {
      Component = <DatePicker {...basicConfig} />;
    }
    if (leftValue.type && getC7nComponentType(leftValue.type) === 'dateTime') {
      Component = <DateTimePicker {...basicConfig} />;
    }
    if (leftValue.type && getC7nComponentType(leftValue.type) === 'boolean') {
      Component = (
        <Select {...basicConfig}>
          <Option value={booleanTransformFlag ? '1' : true}>{intl.get('hzero.common.status.yes').d('是')}</Option>
          <Option value={booleanTransformFlag ? '0' : false}>{intl.get('hzero.common.status.no').d('否')}</Option>
        </Select>
      );
    }
    // 此处将 variable 的判断置为最后确保 rightValueType === 'variable' 渲染为lov
    if (leftValue.lovCode || rightValueType === 'variable') {
      Component = <Lov {...basicConfig} />;
    }
    return Component;
  };

  return (
    <div className='expression-engine-multiple-rule'>
      {
        controlFlag && dataSet.records && dataSet.records.length > 0 && dataSet.records.map(expression => {
          if(expression.status !== 'delete') {
            return (
              <Form record={expression} labelLayout={LabelLayout.float} columns={20} className='expression-engine-multiple-rule-row'>
                <div colSpan={1} style={{ height: '32px', lineHeight: '32px' }}>#{expression.index + 1}</div>
                <Lov
                  name="leftValue"
                  colSpan={5}
                />
                <Select name="rightValueType" colSpan={4} />
                <Select name="operator" colSpan={4}>
                  {renderOperator(expression)}
                </Select>
                {renderRightValue(expression, 'rightValue')}
                <Button
                  icon="delete"
                  funcType={FuncType.flat}
                  disabled={disabled}
                  className='rule-delete-icon'
                  onClick={() => deleteCurrentRule(expression)}
                />
              </Form>
            );
          } else {
            return null;
          }
        })
      }
    </div>
  );
});

function ExpressionEngine (props: ExpressionEngineProps) {
  const {
    code,
    dataSource,
    currentTenantId = currentOrganizationId,
    childRef,
    leftValueLovQueryPara,
    disabled = false,
    leftValueCode,
    booleanTransformFlag = false,
    rightValueParaHook,
  } = props;
  const dsConfigHook = props.dsConfigHook || (c => c);
  const isTenant = isTenantRoleLevel();
  const [currentRecord, setCurrentRecord] = useState({});
  const [conditionTypeDs, setConditionTypeDs] = useState(new DataSet());
  const [expressionDs, setExpressionDs] = useState(new DataSet());
  const [customizeConditionCombinationDs, setCustomizeConditionCombinationDs] = useState(new DataSet());
  const [expressionEngineLoading, handleExpressionEngineLoading] = useState(true);

  const DS_CONFIG: {autoCreate: boolean; autoQuery: boolean; selection: false | DataSetSelection | undefined} = {
    autoCreate: false,
    selection: false,
    autoQuery: false,
  };

  useEffect(() => {
    queryAndSetDs(code);
  }, [code]);

  const queryAndSetDs = (primaryCode) => {
    if(primaryCode) {
      handleExpressionEngineLoading(true);
      getExpressionEngine({code: primaryCode, currentTenantId}).then(res => {
        if(getResponse(res)) {
          setCurrentRecord(res);
          setAllDs(res);
          handleExpressionEngineLoading(false);
        }
      });
    } else {
      setCurrentRecord(dataSource);
      setAllDs(dataSource);
    }
  };

  const setAllDs = (record) => {
    const { conditionType, conditionLines, customizeConditionCombination } = JSON.parse(record.conditionExpressionJson || "{}") ;
    setConditionTypeDs(createConditionTypeDs(conditionType));
    setExpressionDs(createExpressionDs(conditionLines));
    setCustomizeConditionCombinationDs(createCustomizeConditionCombinationDs(customizeConditionCombination));
  };

  const createConditionTypeDs = (conditionType) => {
    return new DataSet({
      ...DS_CONFIG,
      fields: [
        {
          name: 'conditionType',
          type: FieldType.string,
          label: intl.get('component.ExpressionEngine.model.expressionEngine.conditionType').d('策略逻辑'),
          required: true,
          disabled,
        },
      ],
      data: [{conditionType: conditionType || "TRUE"}],
    });
  };

  const createExpressionDs = (conditionLines: any[] = []) => {
    return new DataSet(dsConfigHook({
      ...DS_CONFIG,
      fields: [
        {
          name: 'leftValue',
          type: FieldType.object,
          label: intl.get('component.ExpressionEngine.model.expressionEngine.leftValue').d('特性'),
          disabled,
          required: true,
          lovCode: leftValueCode || (isTenant ? 'HWFP.ENGINE.PROCESS_VARIABLE_LOV_VIEW' : 'HWFP.ENGINE.PROCESS_VARIABLE_LOV_VIEW.SITE'),
          lovPara: leftValueLovQueryPara,
        },
        {
          name: 'rightValueType',
          type: FieldType.string,
          label: intl.get('component.ExpressionEngine.model.expressionEngine.rightValueType').d('常量/变量'),
          required: true,
          lookupCode: 'SDPS.EXPRESSION.RIGHT_VALUE_TYPE',
          dynamicProps: {
            disabled: ({record}) => {
              return disabled || !record.get('leftValue');
            },
          },
        },
        {
          name: 'operator',
          type: FieldType.string,
          label: intl.get('component.ExpressionEngine.model.expressionEngine.operator').d('特性条件'),
          required: true,
          dynamicProps: {
            disabled: ({record}) => {
              return disabled || !record.get('rightValueType');
            },
          },
        },
        {
          name: 'rightValue',
          type: FieldType.string,
          label: intl.get('component.ExpressionEngine.model.expressionEngine.rightValue').d('特性值'),
          required: true,
          transformRequest: (value, record) => {
            const isNeedJsonHandle = ['IN', 'NOT_IN'].includes(record.get('operator'));
            const { type } = record.get('leftValue') || {};
            const componentType = getC7nComponentType(type);
            if(isNeedJsonHandle || typeof(value) === 'object') {
              if(componentType === 'date') {
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
            if(isNeedJsonHandle || isJSON(value)) {
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
              if(rightValueType === 'variable') {
                return leftValueCode || (isTenant ? 'HWFP.ENGINE.PROCESS_VARIABLE_LOV_VIEW' : 'HWFP.ENGINE.PROCESS_VARIABLE_LOV_VIEW.SITE');
              } else {
                return lovCode;
              }
            },
            lovPara: ({ record }) => {
              const rightValueType = record.get('rightValueType');
              const leftValue = record.get('leftValue') || {};
              let externalRightValuePara;
              if(rightValueParaHook) externalRightValuePara = rightValueParaHook(record);
              return rightValueType === 'variable' ? {
                ...leftValueLovQueryPara,
                ...externalRightValuePara,
                type: leftValue.type,
              } : {
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
            disabled: ({record}) => {
              return disabled || !record.get('rightValueType') || ['EXISTS', 'NOT_EXISTS'].includes(record.get('operator'));
            },
            required: ({ record }) => {
              return !['EXISTS', 'NOT_EXISTS'].includes(record.get('operator'));
            },
            precision: ({ record }) => {
              const { type } = record.get('leftValue') || {};
              if(type === 'NUMBER_FIELD') {
                return 0;
              } else if(type === 'FLOAT') {
                return 6; // FLOAT类型最多保留6位小数
              } else {
                return undefined;
              }
            },
            min: ({ record }) => {
              const { type } = record.get('leftValue') || {};
              if(type === 'MONEY') {
                return 0;
              } else {
                return null;
              }
            },
            trueValue: ({ record }) => {
              const { type } = record.get('leftValue') || {};
              if(booleanTransformFlag) {
                if(type === 'BOOLEAN') {
                  return 1;
                } else {
                  return true;
                }
              } else{
                return undefined;
              }
            },
            falseValue: ({ record }) => {
              const { type } = record.get('leftValue') || {};
              if(booleanTransformFlag) {
                if(type === 'BOOLEAN') {
                  return 0;
                } else {
                  return false;
                }
              } else{
                return undefined;
              }
            },
          },
        },
      ],
      paging: false,
      data: conditionLines,
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
    }));
  };

  const createCustomizeConditionCombinationDs = (customizeConditionCombination) => {
    return new DataSet({
      ...DS_CONFIG,
      fields: [
        {
          name: 'customizeConditionCombination',
          type: FieldType.string,
          disabled,
          label: intl.get('component.ExpressionEngine.model.expressionEngine.customizeConditionCombination').d('自定义规则'),
          validator: (value) => {
            if (/[（）]/.test(value)) {
              return intl
                .get(`component.ExpressionEngine.validation.message.bracketsError`)
                .d('请输入英文括号');
            }
            return true;
          },
        },
      ],
      data: [{customizeConditionCombination}],
    });
  };

  const setCustomizeConditionCombination = () => {
    const conditionType = conditionTypeDs!.current!.get('conditionType');
    let formula;
    if (conditionType === 'OR' || conditionType === 'AND') {
      const effectiveCondition = expressionDs.records.filter(
        (record) => record.status !== 'delete'
      );
      if (effectiveCondition.length === 0) {
        formula = '';
      } else if (effectiveCondition.length === 1) {
        formula = '1';
      } else {
        formula = effectiveCondition
          .map((_, index) => index + 1)
          .join(` ${conditionType} `);
      }
    } else if(conditionType === 'TRUE'){
      formula = null;
    } else {
      formula = customizeConditionCombinationDs!.current!.get('customizeConditionCombination');
    }
    customizeConditionCombinationDs!.getField('customizeConditionCombination')!.set('required', conditionType !== 'TRUE');
    customizeConditionCombinationDs!.current!.set('customizeConditionCombination', formula );
  };

  const createExpressionRule = () => {
    if(disabled) {
      return;
    }
    expressionDs.create();
    expressionDs!.current!.status = RecordStatus.update;
    setCustomizeConditionCombination();
  };

  const deleteCurrentRule = (record: Record) => {
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm').d('提示'),
      children: intl.get('hzero.common.view.delete_selected_row_confirm').d('确认删除选中行？'),
      className: style['common-modal'],
      onOk: () => {
        expressionDs.delete(record, false).then(() => {
          setCustomizeConditionCombination();
        });
      },
    });
  };

  const getExpressionEngineJson = async () => {
    const customizeConditionCombination = customizeConditionCombinationDs!.current!.get('customizeConditionCombination');
    const conditionType = conditionTypeDs!.current!.get('conditionType');
    const conditionLines = conditionType === 'TRUE' ? [] : expressionDs.toData();
    const dsValidate = await expressionDs.validate();
    return dsValidate ? JSON.stringify({conditionType, conditionLines, customizeConditionCombination}) : false;
  };

  const resetExpressionEngineAllDs = () => {
    expressionDs.reset();
    conditionTypeDs.reset();
    customizeConditionCombinationDs.reset();
  };

  if(childRef) {
    childRef.current = {
      getExpressionEngineJson,
      resetExpressionEngineAllDs,
    };
  }

  const onSaveExpressionEngine = async () => {
    const conditionExpressionJson = await getExpressionEngineJson();
    if(conditionExpressionJson) {
      saveExpressionEngine({
        ...currentRecord,
        code,
        currentTenantId,
        conditionExpressionJson,
      }).then(res => {
        if(getResponse(res)) {
          queryAndSetDs(code);
          notification.success({});
        }
      });
    }
  };

  const onDeleteExpressionEngine = () => {
    getExpressionEngineJson().then(conditionExpressionJson => {
      deleteExpressionEngine({
        ...currentRecord,
        code,
        currentTenantId,
        conditionExpressionJson,
      }).then(res => {
        if(getResponse(res)) {
          queryAndSetDs(code);
          notification.success({});
        }
      });
    });
  };

  const changeConditionType = () => {
    setCustomizeConditionCombination();
  };

  const AddExpressionRuleBtn = observer((propsParam: AddExpressionRuleBtnProps) => {
    const { dataSet } = propsParam;
    return dataSet.current && dataSet.current.get('conditionType') !== 'TRUE' ? (
      <Tooltip
        title={intl.get('component.ExpressionEngine.view.button.create.ruleBtn').d('添加条件')}
      >
        <a
          className={classNames("expression-engine-multiple-rule-add-btn", {'rule-add-btn-disabled': disabled})}
          onClick={createExpressionRule}
        >
          <Icon type="control_point" />
        </a>
      </Tooltip>
    ) : null;
  });

  const CustomizeConditionCombination = observer((propsParam: CustomizeConditionCombinationProps) => {
    const {dataSet, controlDataSet} = propsParam;
    return (
      <Form
        columns={20}
        labelLayout={LabelLayout.float}
        dataSet={dataSet}
        hidden={controlDataSet && controlDataSet.current && controlDataSet.current.get('conditionType') === 'TRUE'}
        style={{ marginTop: '8px' }}
      >
        <TextField
          name="customizeConditionCombination"
          colSpan={20}
          disabled={controlDataSet && controlDataSet.current && controlDataSet.current.get('conditionType') !== 'CUSTOMIZE'}
          help={intl.get('component.ExpressionEngine.view.notice.help.customizeConditionCombination').d('使用 AND 和 OR 合并筛选器条件行。示例：(1 AND 2) OR 3')}
        />
      </Form>
    );
  });

  return (
    <Spin spinning={code ? expressionEngineLoading : false}>
      <div className={style['expression-engine']}>
        {code && (
          <div className="expression-engine-title">
            {intl.get('component.ExpressionEngine.view.title.expressionEngine').d('条件引擎')}
            {
              !disabled && (
                <div className="expression-engine-buttons">
                  <Button onClick={onDeleteExpressionEngine}>{intl.get('hzero.commom.button.delete').d('删除')}</Button>
                  <Button color={ButtonColor.primary} onClick={onSaveExpressionEngine}>{intl.get('hzero.commom.button.save').d('保存')}</Button>
                </div>
              )
            }
          </div>
        )}
        <Form columns={2} labelLayout={LabelLayout.float} dataSet={conditionTypeDs}>
          <SelectBox
            label={intl.get('component.ExpressionEngine.model.expressionEngine.conditionType').d('策略逻辑')}
            name="conditionType"
            colSpan={2}
            onChange={changeConditionType}
            className='condition-type-select'
          >
            <SelectBox.Option value="TRUE">
              {intl.get('component.ExpressionEngine.model.expressionEngine.conditionType.true').d('无条件限制')}
            </SelectBox.Option>
            <SelectBox.Option value="OR">
              {intl.get('component.ExpressionEngine.model.expressionEngine.conditionType.or').d('满足任一条件')}
            </SelectBox.Option>
            <SelectBox.Option value="AND">
              {intl.get('component.ExpressionEngine.model.expressionEngine.conditionType.and').d('满足所有条件')}
            </SelectBox.Option>
            <SelectBox.Option value="CUSTOMIZE">
              {intl.get('component.ExpressionEngine.model.expressionEngine.conditionType.customize').d('自定义组合规则')}
            </SelectBox.Option>
          </SelectBox>
        </Form>
        <ExpressionTerm dataSet={expressionDs} deleteCurrentRule={deleteCurrentRule} controlDataSet={conditionTypeDs} disabled={disabled} booleanTransformFlag={booleanTransformFlag} />
        <AddExpressionRuleBtn dataSet={conditionTypeDs} />
        <CustomizeConditionCombination dataSet={customizeConditionCombinationDs} controlDataSet={conditionTypeDs} />
      </div>
    </Spin>
  );
}

export default formatterCollections({
  code: ['component.ExpressionEngine'],
})(
  ExpressionEngine
);
