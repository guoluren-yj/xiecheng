import React, { useContext, useMemo } from 'react';
import { Output, Form, Modal } from 'choerodon-ui/pro';
import { Badge } from 'choerodon-ui';
import { observer } from 'mobx-react';

import intl from 'utils/intl';

import RulesDefinition from '@/routes/ssrc/components/RulesDefinition';

import Store from '../store/index';

const btnStyle = {
  padding: '0 8px',
  fontStyle: 'italic',
  fontWeight: 600,
  height: '30px',
};

const ApproveRule = ({ scoreFlag = false, bargainFlag = false, targetField = [] }) => {
  const {
    match: { params },
    commonDs: { approveRuleDs, baseInfoDs },
  } = useContext(Store);

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

  // 渲染fx
  const AddonAfter = observer(({ text, name }) => {
    const cnfMetaDefinition = baseInfoDs?.current?.get('cnfMetaDefinition') || [];
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

  return (
    <Form
      dataSet={approveRuleDs}
      columns={3}
      labelLayout="vertical"
      className="c7n-pro-vertical-form-display"
      labelAlign="left"
      useWidthPercent
    >
      <Output
        name="releaseApproveType"
        showHelp="label"
        renderer={({ text }) => {
          return <AddonAfter text={text} name="releaseApproveType" />;
        }}
      />
      <Output
        name="preApproveType"
        showHelp="label"
        hidden={!scoreFlag}
        renderer={({ text }) => {
          return <AddonAfter text={text} name="preApproveType" />;
        }}
      />
      <Output
        name="resultApproveType"
        showHelp="label"
        renderer={({ text }) => {
          return <AddonAfter text={text} name="resultApproveType" />;
        }}
      />
      <Output
        name="clarifyApproveType"
        showHelp="label"
        renderer={({ text }) => {
          return <AddonAfter text={text} name="clarifyApproveType" />;
        }}
      />
      <Output
        name="closeApproveMethod"
        showHelp="label"
        renderer={({ text }) => {
          return <AddonAfter text={text} name="closeApproveMethod" />;
        }}
      />
      <Output
        name="bargainApproveMethod"
        showHelp="label"
        hidden={!bargainFlag}
        renderer={({ text }) => {
          return <AddonAfter text={text} name="bargainApproveMethod" />;
        }}
      />
      <Output
        name="rollbackApproveType"
        showHelp="label"
        renderer={({ text }) => {
          return <AddonAfter text={text} name="rollbackApproveType" />;
        }}
      />
      {newTarget.map((item) => {
        return approveRuleDs.getField(item.targetField) ? (
          <Output
            name={item.targetField}
            renderer={({ text }) => {
              return <AddonAfter text={text} name={item.targetField} />;
            }}
          />
        ) : null;
      })}
    </Form>
  );
};

export default observer(ApproveRule);
