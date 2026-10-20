import React from 'react';
import { Form, Table, CheckBox, Row, Col, Select, SelectBox, Output } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { observer } from 'mobx-react-lite';
import { yesOrNoRender } from 'utils/renderer';
import ConditionModal from '../../components/conditionModal';

import styles from '../../index.less';
// 设置sbdm国际化前缀 - common - model
const commonPrompt = 'sbdm.common.model.common';
const { Option } = Select;

const Index = ({
  // containerId,
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
      },
      {
        name: 'controlType',
        width: 200,
      },
      {
        name: 'overrunTolerance',
        width: 250,
      },
      {
        name: 'balanceRemindFlag',
        width: 180,
        renderer: ({ value }) => yesOrNoRender(value),
      },
      {
        name: 'balanceRemindNode',
        width: 180,
      },
      // { name: 'amountField' },
      // { name: 'targetCurrency' },
      { name: 'dateField' },
    ];

    if (header?.get('budgetControlSelectBox') === 'externalBudgetFlag') {
      return allColumns.filter(ele => {
        return ['strategyNodeName', 'controlType', 'cancelNode'].includes(ele.name);
      });
    }

    return allColumns;
  };

  return (
    <div className="config-right-content">
      <div className="config-chunk-content">
        <div className="config-right-content-two-title">
          <div className="config-right-content-two-title-ink" />
          {intl.get(`${commonPrompt}.budgetControl`).d('预算控制')}
        </div>

        {/* <Row gutter={24}> */}
        {/* <Col span={2}>
            <div>{intl.get(`${commonPrompt}.budgetControl`).d('预算控制')}：</div>
          </Col>
          <Col span={22}> */}
        <Form
          useWidthPercent
          showLines={6}
          columns={3}
          useColon={false}
          dataSet={baseInfoDs}
          labelLayout="vertical"
          labelAlign="left"
          className="c7n-pro-vertical-form-display"
        >
          <Output
            name="budgetControlSelectBox"
            renderer={({ value }) => (
              <div>
                {value === 'internalBudgetFlag'
                  ? intl.get(`${commonPrompt}.internalBudgetFlag`).d('启用内部预算控制')
                  : intl.get(`${commonPrompt}.externalBudgetFlag`).d('启用外部预算控制')}
                {baseInfoDs?.current?.get('budgetStrategyTemplateCond')?.conditionLines?.length && (
                  <ConditionModal dataSet={baseInfoDs} name="budgetStrategyTemplateCond" disabled />
                )}
              </div>
            )}
          />
        </Form>
      </div>

      <div className="config-chunk-content">
        <div className="config-right-content-two-title">
          <div className="config-right-content-two-title-ink" />
          {intl.get(`${commonPrompt}.valueRules`).d('取值规则')}
        </div>

        <Form
          useWidthPercent
          dataSet={baseInfoDs}
          showLines={6}
          columns={3}
          useColon={false}
          labelLayout="vertical"
          labelAlign="left"
          className="c7n-pro-vertical-form-display"
        >
          <Output
            name="amountField"
            clearButton={false}
            showHelp="label"
            // renderer={({ text }) => (
            //   <Tooltip
            //     title={intl
            //       .get(`${commonPrompt}.amountFieldHelp`)
            //       .d(
            //         '用以维护预算校验及占用使用的金额类型，为含税或不含税金额，默认取值含税金额。'
            //       )}
            //   >
            //     {text}
            //   </Tooltip>
            // )}
          />
          {baseInfoDs?.current?.get('budgetControlSelectBox') === 'internalBudgetFlag' && (
            <Output
              name="targetCurrency"
              showHelp="label"
              // renderer={({ text }) => (
              //   <Tooltip
              //     title={intl
              //       .get(`${commonPrompt}.targetCurrencyHelp`)
              //       .d(
              //         '用以维护预算币种，维护后，默认将业务模块传入的币种金额值转换成预算币种金额值，不维护则默认取值单据上的原币币种。'
              //       )}
              //   >
              //     {text}
              //   </Tooltip>
              // )}
            />
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
