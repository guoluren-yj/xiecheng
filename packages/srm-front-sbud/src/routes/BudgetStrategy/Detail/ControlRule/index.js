import React, { useEffect } from 'react';
import { Form, Table, CheckBox, Select, Row, Col, SelectBox, Lov } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { observer } from 'mobx-react-lite';

import ConditionModal from '../../components/conditionModal';

import styles from '../../index.less';
// 设置sbdm国际化前缀 - common - model
const commonPrompt = 'sbdm.common.model.common';
// const { Option } = SelectBox;
const { Option } = Select;
const Index = ({
  // containerId,
  headerDs,
  isMutlTemplate,
  baseInfoDs,
  controlRuleLineDs,
}) => {
  const header = baseInfoDs.current;

  const columns = () => {
    const allColumns = [
      {
        name: 'strategyNodeName',
        width: 150,
      },
      {
        name: 'cancelNode',
        width: 150,
        editor: true,
      },
      {
        name: 'controlType',
        width: 200,
        editor: true,
      },
      {
        name: 'overrunTolerance',
        width: 250,
        editor: true,
      },
      {
        name: 'balanceRemindFlag',
        width: 180,
        editor: true,
      },
      {
        name: 'balanceRemindNode',
        width: 180,
        editor: true,
      },
      // { name: 'amountField', editor: true },
      // { name: 'targetCurrency', editor: true },
      { name: 'dateField', editor: true },
    ];

    if (header?.get('budgetControlSelectBox') === 'externalBudgetFlag') {
      return allColumns.filter(ele => {
        return ['strategyNodeName', 'controlType', 'cancelNode'].includes(ele.name);
      });
    }

    return allColumns;
  };

  useEffect(() => {
    const handleUpdate = ({ name, value }) => {
      if (name === 'budgetControlSelectBox') {
        controlRuleLineDs.forEach(record => {
          record.set({
            overrunTolerance: 0,
            balanceRemindFlag: 0,
            balanceRemindNode: null,
          });
        });
        if (!isMutlTemplate) {
          if (value === 'internalBudgetFlag') {
            headerDs?.current?.init({
              externalBudgetFlag: 0,
              internalBudgetFlag: 1,
              budgetStrategyCond: null,
            });
          } else {
            headerDs?.current?.init({
              externalBudgetFlag: 1,
              internalBudgetFlag: 0,
              budgetStrategyCond: null,
            });
          }
        }
      }
    };
    baseInfoDs.addEventListener('update', handleUpdate);
    return () => {
      baseInfoDs.removeEventListener('update', handleUpdate);
    };
  }, [baseInfoDs, controlRuleLineDs]);

  return (
    <div className="config-right-content">
      <div className="config-chunk-content">
        <div className="config-right-content-two-title">
          <div className="config-right-content-two-title-ink" />
          {intl.get(`${commonPrompt}.budgetControl`).d('预算控制')}
        </div>

        <Form
          labelLayout="float"
          showLines={6}
          columns={3}
          dataSet={baseInfoDs}
          useColon={false}
          useWidthPercent
        >
          <Select
            name="budgetControlSelectBox"
            clearButton={false}
            disabled={isMutlTemplate}
            suffix={
              <ConditionModal
                dataSet={baseInfoDs}
                name="budgetStrategyTemplateCond"
                type="suffix"
              />
            }
          >
            <Option value="internalBudgetFlag">
              {intl.get(`${commonPrompt}.internalBudgetFlag`).d('启用内部预算控制')}
            </Option>
            <Option value="externalBudgetFlag">
              {intl.get(`${commonPrompt}.externalBudgetFlag`).d('启用外部预算控制')}
            </Option>
          </Select>
        </Form>
      </div>

      <div className="config-chunk-content">
        <div className="config-right-content-two-title">
          <div className="config-right-content-two-title-ink" />
          {intl.get(`${commonPrompt}.valueRules`).d('取值规则')}
        </div>

        <Form
          dataSet={baseInfoDs}
          showLines={6}
          columns={3}
          labelLayout="float"
          useColon={false}
          useWidthPercent
        >
          <Select name="amountField" clearButton={false} showHelp="tooltip" />
          {baseInfoDs?.current?.get('budgetControlSelectBox') === 'internalBudgetFlag' && (
            <Lov name="targetCurrency" showHelp="tooltip" />
          )}
        </Form>
      </div>

      <div className="config-chunk-content">
        <div className="config-right-content-two-title">
          <div className="config-right-content-two-title-ink" />
          {intl.get(`${commonPrompt}.controlRules`).d('控制规则')}
        </div>

        <Table
          dataSet={controlRuleLineDs}
          columns={columns()}
          buttons={[]}
          customizable
          customizedCode="SBUD_BUDGET_STRATEGY.CONTROLRULE_LIST"
        />
      </div>
    </div>
  );
};

export default observer(Index);
