/**
 * 策略配置弹框
 * @date: 2020-06-23
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { useContext } from 'react';
import { Form, TextField, NumberField, SelectBox, Table, TextArea } from 'choerodon-ui/pro';
import { Modal, Card } from 'choerodon-ui';
import intl from 'utils/intl';
import Context from '../../components/Context';
import RuleCard from '../../components/RuleCard';

const { Option } = SelectBox;
const { Column } = Table;
const { Sidebar } = Modal;

function PolicyConfigModal(props = {}) {
  const {
    visible,
    cancel,
    title,
    onOk,
    conditionVisible,
    handleConditionVisible,
    conditionTypeDisabled,
  } = props;
  const {
    policyConfigDataDs,
    conditionJsonDs,
    paramTableDs,
    returnValueDs,
    returnFieldDs,
  } = useContext(Context);

  /**
   * SelectBox onChange 改变方法，如果 value === true 将条件规则隐藏
   * @param {String} value
   */
  const handleChange = (value) => {
    if (value === 'TRUE') {
      handleConditionVisible(false);
    } else {
      handleConditionVisible(true);
    }
  };

  const renderRuleColumns = () => {
    const fieldData = returnValueDs.toData() || [];
    return fieldData.map((item) => <Column name={item.name} editor />);
  };

  return (
    <Sidebar
      visible={visible}
      zIndex={1}
      maskStyle={{
        zIndex: 1,
      }}
      style={{ zIndex: 1 }}
      title={title}
      width={800}
      closable
      onOk={() => onOk()}
      onCancel={() => cancel()}
      wrapClassName="ant-modal-sidebar-right"
      transitionName="move-right"
      maskClosable={false}
      destroyOnClose
      mask
      drawer
    >
      <Form dataSet={policyConfigDataDs} columns={2}>
        <TextField name="actionName" autoFocus colSpan={1} />
        <NumberField name="priority" colSpan={1} min={1} step={1} />
        <TextArea name="description" colSpan={2} />
        <TextArea name="conditionExpression" colSpan={2} />
        <SelectBox
          label={intl.get('spfm.rulesDefinition.model.rulesDefinition.conditionType').d('策略逻辑')}
          name="conditionType"
          onChange={handleChange}
          colSpan={2}
          disabled={conditionTypeDisabled}
        >
          <Option value="OR">
            {intl.get('spfm.rulesDefinition.view.select.or').d('满足任一条件')}
          </Option>
          <Option value="AND">
            {intl.get('spfm.rulesDefinition.view.select.and').d('满足所有条件')}
          </Option>
          <Option value="TRUE">
            {intl.get('spfm.rulesDefinition.view.select.true').d('无条件限制')}
          </Option>
        </SelectBox>
      </Form>
      {conditionVisible && (
        <RuleCard
          title={intl.get('spfm.rulesDefinition.view.card.condition').d('条件规则')}
          conditionDataSet={conditionJsonDs}
          selectorDataSet={paramTableDs}
        />
      )}
      <Card
        title={intl.get('spfm.rulesDefinition.view.card.policyConfig').d('执行规则')}
        style={{ marginTop: '20px' }}
      >
        <Table dataSet={returnFieldDs} style={{ marginTop: '20px' }}>
          {renderRuleColumns()}
        </Table>
      </Card>
    </Sidebar>
  );
}

export default PolicyConfigModal;
