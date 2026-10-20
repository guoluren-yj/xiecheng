import React, { useContext, useCallback, useMemo } from 'react';
import { Badge } from 'choerodon-ui';
import { Select, Button, Modal, Form, Lov, Tooltip } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';
import { noop } from 'lodash';

import intl from 'utils/intl';

import RulesDefinition from '@/routes/ssrc/components/RulesDefinition';

import Store from '../store/index';

const btnStyle = {
  padding: '0 3px',
  fontStyle: 'italic',
  fontWeight: 600,
  height: '30px',
};

const ApproveRule = ({
  scoreFlag = false,
  bargainFlag = false,
  targetField = [],
  templateId = '',
  initQuery = noop,
}) => {
  const {
    match: { params },
    commonDs: { approveRuleDs, baseInfoDs },
  } = useContext(Store);

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

  // 点击fx
  const handleFx = useCallback(({ ds, name }) => {
    const modalProps = {
      targetName: name,
      type: !ds.getField(name).get('disabled') ? 'edit' : 'view', // 判断进入策略配置的列表页是编辑还是只读
      businessKey: params.templateId,
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

  // 发布/评审审批过滤不需要选项
  const renderApproveType = (optionRecord) => {
    const optionValue = optionRecord.get('value') || null;
    return !['WFL_ALLOW', 'EXT_ALLOW'].includes(optionValue);
  };

  // 结果审批去掉
  const renderResultType = (optionRecord) => {
    const optionValue = optionRecord.get('value') || null;
    const resultApproveFlag = approveRuleDs.getState('resultApproveFlag');
    const checkPriceUiIsNew = approveRuleDs.getState('checkPriceUiIsNew');
    console.log(resultApproveFlag, checkPriceUiIsNew, 'aaaa');
    if (checkPriceUiIsNew) {
      if (resultApproveFlag) {
        return !['WFL_ALLOW', 'EXT_ALLOW'].includes(optionValue);
      }
      return !['WFL_ALLOW_UF_DK_CHECK', 'EXT_ALLOW_UF_DK_CHECK'].includes(optionValue);
    }

    return optionValue;
  };

  // 将标准字段过滤
  const newTarget = useMemo(() => {
    return targetField.filter(
      (item) =>
        ![
          'releaseApproveType',
          'preApproveType',
          'resultApproveType',
          'closeApproveMethod',
          'bargainApproveMethod',
          'clarifyApproveType',
          'rollbackApproveType',
        ].includes(item.targetField)
    );
  }, [targetField]);

  // 判断是否展示FX模式
  const getAddonAfter = ({ name }) => {
    return ((targetField || []).map((item) => item.targetField) || []).includes(name);
  };

  return (
    <Form dataSet={approveRuleDs} columns={3} labelLayout="float" useWidthPercent>
      <Select
        name="releaseApproveType"
        addonAfter={
          getAddonAfter({ name: 'releaseApproveType' }) ? (
            <AddonAfter ds={approveRuleDs} name="releaseApproveType" />
          ) : null
        }
        clearButton={false}
        // optionsFilter={renderApproveType}
        showHelp="tooltip"
      />
      <Select
        name="preApproveType"
        hidden={!scoreFlag}
        optionsFilter={renderApproveType}
        addonAfter={
          getAddonAfter({ name: 'preApproveType' }) ? (
            <AddonAfter ds={approveRuleDs} name="preApproveType" />
          ) : null
        }
        clearButton={false}
        showHelp="tooltip"
      />
      <Select
        name="resultApproveType"
        addonAfter={
          getAddonAfter({ name: 'resultApproveType' }) ? (
            <AddonAfter ds={approveRuleDs} name="resultApproveType" />
          ) : null
        }
        clearButton={false}
        showHelp="tooltip"
        optionsFilter={renderResultType}
      />
      <Select
        name="clarifyApproveType"
        addonAfter={
          getAddonAfter({ name: 'clarifyApproveType' }) ? (
            <AddonAfter ds={approveRuleDs} name="clarifyApproveType" />
          ) : null
        }
        clearButton={false}
        showHelp="tooltip"
      />
      <Select
        name="closeApproveMethod"
        addonAfter={
          getAddonAfter({ name: 'closeApproveMethod' }) ? (
            <AddonAfter ds={approveRuleDs} name="closeApproveMethod" />
          ) : null
        }
        clearButton={false}
        showHelp="tooltip"
      />
      <Select
        name="bargainApproveMethod"
        hidden={!bargainFlag}
        addonAfter={
          getAddonAfter({ name: 'bargainApproveMethod' }) ? (
            <AddonAfter ds={approveRuleDs} name="bargainApproveMethod" />
          ) : null
        }
        clearButton={false}
        showHelp="tooltip"
      />
      <Select
        name="rollbackApproveType"
        addonAfter={
          getAddonAfter({ name: 'rollbackApproveType' }) ? (
            <AddonAfter ds={approveRuleDs} name="rollbackApproveType" />
          ) : null
        }
        clearButton={false}
        showHelp="tooltip"
      />
      {newTarget.map((item) => {
        if (approveRuleDs.getField(item.targetField)) {
          const cnfMetaDefinition = item.cnfMetaDefinitionObject || {};
          const { ret } = cnfMetaDefinition;
          if (ret.indexOf('lookupCode') > -1) {
            return (
              <Select
                name={item.targetField}
                clearButton={false}
                addonAfter={<AddonAfter ds={approveRuleDs} name={item.targetField} />}
              />
            );
          }
          if (ret.indexOf('lovCode') > -1) {
            return (
              <Lov
                name={item.targetField}
                clearButton={false}
                addonAfter={<AddonAfter ds={approveRuleDs} name={item.targetField} />}
              />
            );
          }
          return null;
        }
        return null;
      })}
    </Form>
  );
};

export default observer(ApproveRule);
