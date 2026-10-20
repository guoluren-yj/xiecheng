import React, { useContext } from 'react';
import { Badge } from 'choerodon-ui';
import { Output, Form, Modal } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';
import RulesDefinition from '@/routes/ssrc/components/RulesDefinition';

import Store from '../store/index';

const btnStyle = {
  padding: '0 8px',
  fontStyle: 'italic',
  fontWeight: 600,
  height: '30px',
};

const CheckPriceRule = ({ checkPriceUiIsNew = false, targetField = [] }) => {
  const {
    match: { params },
    commonDs: { checkPriceRuleDs },
    customizeForm = () => {},
    getCustomizeUnitCode = () => {},
  } = useContext(Store);

  // 渲染fx
  const AddonAfter = observer(({ text, name }) => {
    const cnfMetaDefinition = checkPriceRuleDs?.current?.get('cnfMetaDefinition') || [];
    const badgeDot = cnfMetaDefinition.find((item) => item.targetField === name) || {};
    return (
      <div>
        {text}
        {((targetField || []).map((item) => item.targetField) || []).includes(name) ? (
          <a style={btnStyle} funcType="link" color="primary" onClick={() => handleFx({ name })}>
            <Badge dot={badgeDot.count > 0}>fx</Badge>
          </a>
        ) : null}
      </div>
    );
  });

  // 点击fx
  const handleFx = ({ name }) => {
    const modalProps = {
      targetName: name,
      type: 'view', // 判断进入策略配置的列表页是编辑还是只读
      businessKey: params.templateId,
      targetRule: (targetField.find((item) => item.targetField === name) || {})
        .cnfMetaDefinitionObject,
      metaBusinessKey: (targetField.find((item) => item.targetField === name) || {})
        .metaBusinessKey,
    };
    return Modal.open({
      key: Modal.key(),
      style: {
        width: '742px',
      },
      title: intl.get(`ssrc.sourceTemplate.model.template.rulesDefinition`).d('策略配置'),
      children: <RulesDefinition {...modalProps} />,
      drawer: true,
      closable: true,
      okButton: false,
      cancelProps: {
        color: 'primary',
      },
      cancelText: intl.get(`hzero.common.button.close`).d('关闭'),
    });
  };

  const getFields = () => {
    const fields = [
      <Output name="budgetControlRule" showHelp="label" />,
      <Output
        name="onlyAllowAllWinBids"
        showHelp="label"
        renderer={({ value }) => yesOrNoRender(value)}
      />,
      <Output name="checkRecommendationStrategy" showHelp="label" hidden={!checkPriceUiIsNew} />,
      <Output name="checkSelectionDimension" showHelp="label" hidden />,
      <Output name="selectionStrategy" showHelp="label" hidden={checkPriceUiIsNew} />,
      <Output
        name="checkItemQuantityCtrlMethod"
        showHelp="label"
        renderer={({ text }) => {
          return <AddonAfter text={text} name="checkItemQuantityCtrlMethod" />;
        }}
      />,
    ].filter(Boolean);

    return fields;
  };

  return customizeForm(
    {
      code: getCustomizeUnitCode('checkPriceRule'),
    },
    <Form
      dataSet={checkPriceRuleDs}
      columns={3}
      labelLayout="vertical"
      className="c7n-pro-vertical-form-display"
      labelAlign="left"
      useWidthPercent
    >
      {getFields()}
    </Form>
  );
};

export default observer(CheckPriceRule);
