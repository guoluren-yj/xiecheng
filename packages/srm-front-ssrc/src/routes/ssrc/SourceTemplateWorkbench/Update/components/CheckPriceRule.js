import React, { useContext, useCallback } from 'react';
import { Badge } from 'choerodon-ui';
import { noop } from 'lodash';
import { Modal, Select, CheckBox, Form, Tooltip, Button } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';
import intl from 'utils/intl';

import RulesDefinition from '@/routes/ssrc/components/RulesDefinition';

import Store from '../store/index';

const btnStyle = {
  padding: '0 3px',
  fontStyle: 'italic',
  fontWeight: 600,
  height: '30px',
};

const CheckPriceRule = ({
  checkPriceUiIsNew = false,
  templateId = '',
  targetField = [],
  initQuery = noop,
}) => {
  const {
    commonDs: { checkPriceRuleDs, baseInfoDs },
    customizeForm = () => {},
    getCustomizeUnitCode = () => {},
  } = useContext(Store);

  // 点击fx
  const handleFx = useCallback(({ ds, name }) => {
    const modalProps = {
      targetName: name,
      type: !ds.getField(name).get('disabled') ? 'edit' : 'view', // 判断进入策略配置的列表页是编辑还是只读
      businessKey: templateId,
      targetRule: (targetField.find((item) => item.targetField === name) || {})
        .cnfMetaDefinitionObject,
      metaBusinessKey: (targetField.find((item) => item.targetField === name) || {})
        .metaBusinessKey,
      onQuery: initQuery, // 业务层查询接口
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
  });

  // 判断是否展示FX模式
  const getAddonAfter = ({ name }) => {
    return ((targetField || []).map((item) => item.targetField) || []).includes(name);
  };

  // 渲染fx
  const AddonAfter = observer(({ ds, name }) => {
    const cnfMetaDefinition = baseInfoDs?.current?.get('cnfMetaDefinition') || [];
    const badgeDot = cnfMetaDefinition.find((item) => item.targetField === name) || {};
    return (
      <Badge dot={badgeDot.count > 0}>
        <Tooltip
          title={
            !templateId || templateId === 'null'
              ? intl.get(`ssrc.sourceTemplate.model.template.fxTooltip`).d('请先保存寻源模板。')
              : ''
          }
        >
          <Button
            style={btnStyle}
            funcType="link"
            color="primary"
            disabled={!templateId || templateId === 'null'}
            onClick={() => handleFx({ ds, name })}
          >
            Fx
          </Button>
        </Tooltip>
      </Badge>
    );
  });

  const getFields = () => {
    const fields = [
      <Select name="budgetControlRule" clearButton={false} showHelp="tooltip" />,
      <CheckBox name="onlyAllowAllWinBids" showHelp="tooltip" />,
      <Select
        name="checkRecommendationStrategy"
        hidden={!checkPriceUiIsNew}
        clearButton={false}
        showHelp="tooltip"
      />,
      <Select name="checkSelectionDimension" hidden showHelp="tooltip" />,
      <Select
        name="selectionStrategy"
        hidden={checkPriceUiIsNew}
        clearButton={false}
        showHelp="tooltip"
      />,
      <Select
        name="checkItemQuantityCtrlMethod"
        clearButton={false}
        showHelp="tooltip"
        addonAfter={
          getAddonAfter({ name: 'checkItemQuantityCtrlMethod' }) ? (
            <AddonAfter ds={checkPriceRuleDs} name="checkItemQuantityCtrlMethod" />
          ) : null
        }
      />,
    ].filter(Boolean);

    return fields;
  };

  return customizeForm(
    {
      code: getCustomizeUnitCode('checkPriceRule'),
    },
    <Form dataSet={checkPriceRuleDs} columns={3} labelLayout="float" useWidthPercent>
      {getFields()}
    </Form>
  );
};

export default observer(CheckPriceRule);
