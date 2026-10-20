import { isNil } from 'lodash';
import React, { Fragment } from 'react';
import { Table } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';

import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';
import { TopSection, SecondSection } from '_components/Section';

import GeneralForm from '@/routes/components/GeneralForm';

const ControlRules = observer(({ formDs, isEdit, controlRulesDs }) => {
  const { manuallyModifyAmount, amountControlDimension } =
    formDs?.current?.get(['manuallyModifyAmount', 'amountControlDimension']) || {};

  // 控制维度
  const controlDimensionFields = [
    {
      name: 'amountControlDimension',
      componentType: 'SELECT',
      showHelp: isEdit ? 'tooltip' : 'label',
      help: (
        <Fragment>
          {intl
            .get('spcm.amountStrategy.model.controlDimension.notControlMsg')
            .d('不控制：不记录订单占用协议金额')}
          <br />
          {intl
            .get('spcm.amountStrategy.model.controlDimension.headerControlMsg')
            .d('按头维度控制：记录订单占用协议头金额')}
          <br />
          {intl
            .get('spcm.amountStrategy.model.controlDimension.lineControlMsg')
            .d('按行维度控制：记录订单占用协议行金额')}
        </Fragment>
      ),
    },
    {
      name: 'manuallyModifyAmount',
      componentType: 'SELECT',
      showHelp: isEdit ? 'tooltip' : 'label',
      help: (
        <Fragment>
          {intl
            .get('spcm.amountStrategy.model.manuallyModifyAmount.yesMsg')
            .d(
              '是：创建合同后，允许手工维护合同金额上限，由用户自行输入原币/本币/其他币种的含税/不含税金额，合同上限金额字段不做金额换算'
            )}
          <br />
          {intl
            .get('spcm.amountStrategy.model.manuallyModifyAmount.noMsg')
            .d('否：需要选择合同上限金额字段组织取值字段')}
        </Fragment>
      ),
      renderer: ({ value }) => (isNil(value) ? '-' : yesOrNoRender(+value)),
    },
    {
      name: 'limitAmountField',
      componentType: 'SELECT',
      showHelp: isEdit ? 'tooltip' : 'label',
      help: (
        <Fragment>
          {intl
            .get('spcm.amountStrategy.model.limitAmountField.oneMsg')
            .d(
              '1、选择按合同头维度控制，且不允许手工数据合同上限时，需选择合同上限金额是原币/本币含税/未税头总额；'
            )}
          <br />
          {intl
            .get('spcm.amountStrategy.model.limitAmountField.twoMsg')
            .d('2、选择按合同头维度控制，且不允许手工数据合同上限时，需选择合同行上限金额取值字段')}
        </Fragment>
      ),
      optionsFilter: (record) => {
        const value = record.get('value');
        if (amountControlDimension === 'HEAD') {
          if (manuallyModifyAmount === '1') {
            return value === 'maxContractAmount';
          } else {
            return [
              'amount',
              'originalAmount',
              'taxIncludeAmount',
              'originalTaxIncludeAmount',
            ].includes(value);
          }
        } else if (amountControlDimension === 'LINE') {
          if (manuallyModifyAmount === '1') {
            return value === 'lineMaxContractAmount';
          } else {
            return [
              'lineAmount',
              'purchaseLineAmount',
              'taxIncludedLineAmount',
              'purchaseTaxLineAmount',
            ].includes(value);
          }
        }
      },
    },
  ];
  // 取值规则
  const valueRulesFields = [
    {
      name: 'amountField',
      componentType: 'SELECT',
      showHelp: isEdit ? 'tooltip' : 'label',
      help: intl
        .get('spcm.amountStrategy.model.valueRules.amountFieldMsg')
        .d(
          '用以维护合同金额校验及占用时取值的金额类型，可选含税金额或不含税金额，默认取值含税金额。'
        ),
    },
    {
      name: 'amountControlCurrencyCode',
      componentType: 'LOV',
      showHelp: isEdit ? 'tooltip' : 'label',
      help: intl
        .get('spcm.amountStrategy.model.valueRules.amountControlCurrencyCodeMsg')
        .d(
          '用以维护金额控制币种，维护后，默认将业务模块传入的币种金额值转换成控制币种金额值，不维护则默认取值单据上的原币币种。'
        ),
    },
  ];
  // 控制规则
  const controlRulesColumns = [
    {
      name: 'node',
    },
    {
      name: 'amountControlType',
      editor: isEdit,
    },
    {
      name: 'insufficientBalanceReminder',
      editor: isEdit,
      renderer: ({ value }) => (isNil(value) ? '-' : yesOrNoRender(+value)),
    },
    {
      name: 'insufficientBalanceReminderRatio',
      width: 180,
      editor: isEdit,
    },
    {
      name: 'excessReminder',
      editor: isEdit,
      renderer: ({ value }) => (isNil(value) ? '-' : yesOrNoRender(+value)),
    },
    {
      name: 'excessReminderRatio',
      editor: isEdit,
    },
    {
      name: 'timeFieldValue',
      editor: isEdit,
    },
  ];

  return (
    <TopSection>
      <SecondSection
        title={intl.get('spcm.amountStrategy.model.title.controlDimension').d('控制维度')}
      >
        <GeneralForm
          dataSet={formDs}
          isEdit={isEdit}
          fields={controlDimensionFields}
          style={{ marginBottom: 32 }}
        />
      </SecondSection>
      <SecondSection title={intl.get('spcm.amountStrategy.model.title.valueRules').d('取值规则')}>
        <GeneralForm
          dataSet={formDs}
          isEdit={isEdit}
          fields={valueRulesFields}
          style={{ marginBottom: 32 }}
        />
      </SecondSection>
      <SecondSection title={intl.get('spcm.amountStrategy.model.title.controlRules').d('控制规则')}>
        <Table
          dataSet={controlRulesDs}
          columns={controlRulesColumns}
          customizedCode="SPCM.AMOUNT_STRATEGY.DETAIL_CONTROL_RULES"
        />
      </SecondSection>
    </TopSection>
  );
});

export default ControlRules;
