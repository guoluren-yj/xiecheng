import React, { useContext, useMemo } from 'react';
import { Badge } from 'choerodon-ui';
import { Output, Modal, Form } from 'choerodon-ui/pro';
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

const RFApproveRule = ({ targetField = [] }) => {
  const {
    customizeForm,
    match: { params },
    getCustomizeUnitCode = () => {},
    commonDs: { rfApproveRuleDs, baseInfoDs },
  } = useContext(Store);

  // 将标准字段过滤
  const newTarget = useMemo(() => {
    return targetField.filter(
      (item) =>
        !['releaseApproveType', 'resultApproveType', 'clarifyApproveType'].includes(
          item.targetField
        )
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
    const sourceCategory =
      baseInfoDs?.current?.get('secondarySourceCategory') ||
      baseInfoDs?.current?.get('sourceCategory');
    const modalProps = {
      targetName: name,
      type: 'view', // 判断进入策略配置的列表页是编辑还是只读
      businessKey: params.templateId,
      targetRule: (targetField.find((item) => item.targetField === name) || {})
        .cnfMetaDefinitionObject,
      metaBusinessKey: (targetField.find((item) => item.targetField === name) || {})
        .metaBusinessKey,
      documentType: sourceCategory,
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
    return [
      <Output
        name="releaseApproveType"
        showHelp="label"
        renderer={({ text }) => {
          return <AddonAfter text={text} name="releaseApproveType" />;
        }}
      />,
      <Output
        name="resultApproveType"
        showHelp="label"
        renderer={({ text }) => {
          return <AddonAfter text={text} name="resultApproveType" />;
        }}
      />,
      <Output
        name="clarifyApproveType"
        showHelp="label"
        renderer={({ text }) => {
          return <AddonAfter text={text} name="clarifyApproveType" />;
        }}
      />,
      newTarget.map((item) => {
        return rfApproveRuleDs.getField(item.targetField) ? (
          <Output
            name={item.targetField}
            renderer={({ text }) => {
              return <AddonAfter text={text} name={item.targetField} />;
            }}
          />
        ) : null;
      }),
    ];
  };

  return customizeForm(
    {
      code: getCustomizeUnitCode('rfApproveRule'),
    },
    <Form
      dataSet={rfApproveRuleDs}
      columns={3}
      useWidthPercent
      labelAlign="left"
      labelLayout="vertical"
      className="c7n-pro-vertical-form-display"
    >
      {getFields()}
    </Form>
  );
};

export default observer(RFApproveRule);
