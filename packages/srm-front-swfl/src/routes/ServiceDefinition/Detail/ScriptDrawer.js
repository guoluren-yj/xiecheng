import React from 'react';
import { Form, Input, Modal, Select } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import Lov from 'components/Lov';
import intl from 'utils/intl';

const FormItem = Form.Item;

const formLayout = {
  labelCol: { span: 5 },
  wrapperCol: { span: 17 },
};

let uid = Date.now();
@Form.create({ fieldNameProp: null })
export default class ScriptDrawer extends React.Component {
  createUid = () => {
    return (uid++).toString(36);
  };

  /**
   * 保存
   */
  @Bind()
  handleOK() {
    const { form, onOk } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (!err) {
        onOk({
          ...fieldsValue,
          parameterCreateId: this.createUid(),
          parameterSource: 'CONSTANT',
        });
      }
    });
  }

  @Bind()
  handleCancel() {
    const { onCancel = (e) => e } = this.props;
    onCancel();
  }

  @Bind()
  handleChangeType() {
    const { form } = this.props;
    const { setFieldsValue } = form;
    setFieldsValue({
      parameterValue: undefined,
    });
  }

  render() {
    const {
      form,
      initData,
      modalVisible,
      paramSaving,
      parameterList,
      serviceType,
      serviceMode,
    } = this.props;
    const { getFieldDecorator, getFieldValue } = form;
    const {
      parameterName,
      parameterDescription,
      parameterValue,
      parameterId,
      scriptParameterType,
    } = initData;
    // 动态参数只能维护一个
    const dynamicFlag =
      !parameterList || serviceType !== 'APPROVAL_CANDIDATE_RULE' || serviceMode !== 'SCRIPT'
        ? false
        : parameterList.filter(
            (i) => i.scriptParameterType === 'DYNAMIC' && i.parameterName !== parameterName
          ).length === 0;
    return (
      <Modal
        destroyOnClose
        wrapClassName="ant-modal-sidebar-right"
        transitionName="move-right"
        title={intl.get('hwfp.serviceDefinition.view.title.editParams').d('编辑参数')}
        visible={modalVisible}
        confirmLoading={paramSaving}
        onCancel={this.handleCancel}
        onOk={this.handleOK}
      >
        <Form>
          <FormItem
            {...formLayout}
            label={intl.get('hwfp.serviceDefinition.model.scriptParam.name').d('参数编码')}
          >
            {getFieldDecorator('parameterName', {
              initialValue: parameterName,
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('hwfp.serviceDefinition.model.scriptParam.name').d('参数编码'),
                  }),
                },
              ],
            })(<Input inputChinese={false} disabled={parameterId} />)}
          </FormItem>
          <FormItem
            {...formLayout}
            label={intl.get('hwfp.serviceDefinition.model.scriptParam.description').d('参数名称')}
          >
            {getFieldDecorator('parameterDescription', {
              initialValue: parameterDescription,
              rules: [
                {
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl
                      .get('hwfp.serviceDefinition.model.scriptParam.description')
                      .d('参数名称'),
                  }),
                },
              ],
            })(<Input />)}
          </FormItem>
          <FormItem
            {...formLayout}
            label={intl
              .get('hwfp.serviceDefinition.model.scriptParam.scriptParameterType')
              .d('参数类型')}
          >
            {getFieldDecorator('scriptParameterType', {
              initialValue: scriptParameterType || 'CONSTANT',
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl
                      .get('hwfp.serviceDefinition.model.scriptParam.scriptParameterType')
                      .d('参数类型'),
                  }),
                },
              ],
            })(
              <Select onChange={this.handleChangeType}>
                <Select.Option value="CONSTANT">
                  {intl.get('hwfp.serviceDefinition.model.scriptParam.constant').d('固定值')}
                </Select.Option>
                {dynamicFlag && (
                  <Select.Option value="DYNAMIC">
                    {intl.get('hwfp.serviceDefinition.model.scriptParam.dynamic').d('动态参数')}
                  </Select.Option>
                )}
              </Select>
            )}
            <div style={{ color: '#868d9c', lineHeight: 1.5, marginTop: '8px' }}>
              {getFieldValue('scriptParameterType') === 'DYNAMIC'
                ? intl
                    .get('hwfp.serviceDefinition.view.message.constant.help')
                    .d('固定值:维护固定参数值')
                : intl
                    .get('hwfp.serviceDefinition.view.message.dynamic.help')
                    .d(
                      '动态参数： 流程定义节点通过"参数值集"选择具体值，执行动态脚本时，脚本中可获取到节点选择的参数值'
                    )}
            </div>
          </FormItem>
          <FormItem
            {...formLayout}
            label={intl.get('hwfp.serviceDefinition.model.scriptParam.value').d('参数值')}
          >
            {getFieldDecorator('parameterValue', {
              initialValue: parameterValue,
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('hwfp.serviceDefinition.model.scriptParam.value').d('参数值'),
                  }),
                },
              ],
            })(
              getFieldValue('scriptParameterType') === 'DYNAMIC' ? (
                <Lov code="HPFM.LOV.VIEW.ORG" />
              ) : (
                <Input />
              )
            )}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
