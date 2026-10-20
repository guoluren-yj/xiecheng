import React from 'react';
import { Form, Input, Modal, Select, Icon } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
// import { isEmpty } from 'lodash';
import Lov from 'components/Lov';
import intl from 'utils/intl';
import { isTenantRoleLevel } from 'utils/utils';

const FormItem = Form.Item;
const { Option } = Select;

const formLayout = {
  labelCol: { span: 5 },
  wrapperCol: { span: 17 },
};

let uid = Date.now();
@Form.create({ fieldNameProp: null })
export default class ExpressionDrawer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      serviceOperatorList: props.serviceOperatorList,
    };
  }

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
          parameterSource: fieldsValue.parameterSource.key,
          parameterSourceMeaning: fieldsValue.parameterSource.label,
          rightParameterSource: fieldsValue.rightParameterSource
            ? fieldsValue.rightParameterSource.key
            : undefined,
          rightParameterSourceMeaning: fieldsValue.rightParameterSource
            ? fieldsValue.rightParameterSource.label
            : undefined,
        });
      }
    });
  }

  @Bind()
  handleSource(value = {}) {
    const { onChangeSource = (e) => e } = this.props;
    // if (isEmpty(value)) {
    //   this.props.form.setFieldsValue({ rightParameterValue: '' });
    // }
    if (value.key === 'VARIABLE') {
      onChangeSource(value.key);
    }
  }

  @Bind()
  handleCancel() {
    const { onCancel = (e) => e } = this.props;
    onCancel();
  }

  @Bind()
  emitEmpty(event, field) {
    event.stopPropagation();
    event.preventDefault();
    this.props.form.setFieldsValue({ [field]: null });
  }

  changeLeftParameterValue = (value, item) => {
    const {
      form: { setFieldsValue },
      serviceOperatorList,
    } = this.props;
    const { description, variableType } = item;
    if (item.variableType === 'string') {
      // string类型，去掉这四种操作符
      const arr = ['>', '<', '>=', '<='];
      this.setState({
        serviceOperatorList: serviceOperatorList.filter((i) => !arr.includes(i.value)),
      });
    } else {
      this.setState({
        serviceOperatorList,
      });
    }
    setFieldsValue({
      parameterDescription: description,
      parameterType: variableType,
      operator: '',
    });
  };

  changeRightParameterValue = (value, item) => {
    const {
      form: { setFieldsValue },
    } = this.props;
    const { description, variableType } = item;
    setFieldsValue({ rightParameterDescription: description, rightParameterType: variableType });
  };

  selectChangeValue = (value) => {
    const {
      form: { setFieldsValue },
    } = this.props;
    if (value === 'parameterSource') {
      setFieldsValue({ parameterDescription: '', parameterValue: '' });
    } else {
      setFieldsValue({ rightParameterDescription: '', rightParameterValue: '' });
    }
  };

  changeOperator = (value) => {
    const {
      form: { setFieldsValue },
      paramterSourceList,
    } = this.props;
    if (value === 'CONTAIN' || value === 'NOT_CONTAIN') {
      const filterArr = paramterSourceList.filter((item) => item.value === 'CONSTANT');
      const label = filterArr.length > 0 ? filterArr[0].meaning : null;
      setFieldsValue({
        rightParameterSource: { key: 'CONSTANT', label },
        rightParameterDescription: null,
        rightParameterValue: null,
      });
    } else if (!value) {
      setFieldsValue({
        rightParameterSource: { key: null, label: null },
        rightParameterDescription: null,
        rightParameterValue: null,
      });
    }
  };

  render() {
    const {
      form,
      initData,
      lovParam,
      modalVisible,
      paramSaving,
      // serviceOperatorList = [],
      paramterSourceList = [],
      // variableList = [],
    } = this.props;
    const { serviceOperatorList = [] } = this.state;
    const { getFieldDecorator, getFieldValue } = form;
    const { categoryId, documentId } = lovParam;
    const {
      parameterName,
      parameterSource,
      parameterSourceMeaning,
      defaultValue,
      parameterValue,
      operator,
      rightParameterSource,
      rightParameterSourceMeaning,
      rightParameterValue,
      parameterId,
      parameterDescription,
      rightParameterDescription,
      parameterType,
      rightParameterType,
      parameterRemark,
    } = initData;
    const isSiteFlag = !isTenantRoleLevel();
    getFieldDecorator('parameterType', {
      initialValue: parameterType,
    });
    getFieldDecorator('rightParameterType', {
      initialValue: rightParameterType || '',
    });
    const arr = ['>', '<', '>=', '<='];
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
            label={intl.get('hwfp.serviceDefinition.model.param.orderNumber').d('序号')}
          >
            {getFieldDecorator('parameterName', {
              initialValue: parameterName,
              rules: [
                {
                  required: !defaultValue,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('hwfp.serviceDefinition.model.param.orderNumber').d('序号'),
                  }),
                },
              ],
            })(<Input disabled={parameterId} />)}
          </FormItem>
          <FormItem
            {...formLayout}
            label={intl
              .get('hwfp.serviceDefinition.model.param.leftParameterSource')
              .d('左参数来源')}
          >
            {getFieldDecorator('parameterSource', {
              initialValue: { key: parameterSource, label: parameterSourceMeaning },
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl
                      .get('hwfp.serviceDefinition.model.param.leftParameterSource')
                      .d('左参数来源'),
                  }),
                },
              ],
            })(
              <Select labelInValue onChange={() => this.selectChangeValue('parameterSource')}>
                {paramterSourceList.map((item) => (
                  <Option key={item.value} value={item.value}>
                    {item.meaning}
                  </Option>
                ))}
              </Select>
            )}
          </FormItem>
          {form.getFieldValue('parameterSource').key === 'VARIABLE' ? (
            <FormItem
              {...formLayout}
              label={intl
                .get('hwfp.serviceDefinition.model.param.leftParameterValue')
                .d('左参数值')}
            >
              {getFieldDecorator('parameterValue', {
                initialValue: parameterValue,
                rules: [
                  {
                    required: !defaultValue,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get('hwfp.serviceDefinition.model.param.leftParameterValue')
                        .d('左参数值'),
                    }),
                  },
                ],
              })(
                <Lov
                  code={
                    isSiteFlag
                      ? 'HWFP.PROCESS_VARIABLE_LOV_VIEW.SITE'
                      : 'HWFP.PROCESS_VARIABLE_LOV_VIEW'
                  }
                  onChange={this.changeLeftParameterValue}
                  lovOptions={{
                    displayField: 'variableName',
                    valueField: 'variableName',
                  }}
                  queryParams={{ categoryId, documentId }}
                />
              )}
            </FormItem>
          ) : (
            <FormItem
              {...formLayout}
              label={intl
                .get('hwfp.serviceDefinition.model.param.leftParameterValue')
                .d('左参数值')}
            >
              {getFieldDecorator('parameterValue', {
                initialValue: parameterValue,
                rules: [
                  {
                    required: !defaultValue,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get('hwfp.serviceDefinition.model.param.leftParameterValue')
                        .d('左参数值'),
                    }),
                  },
                ],
              })(<Input />)}
            </FormItem>
          )}
          <FormItem
            {...formLayout}
            label={intl
              .get('hwfp.serviceDefinition.model.param.parameterDescription')
              .d('左参数名称')}
          >
            {getFieldDecorator('parameterDescription', {
              initialValue: parameterDescription,
            })(<Input disabled />)}
          </FormItem>
          <FormItem
            {...formLayout}
            label={intl.get('hwfp.serviceDefinition.model.param.operator').d('操作符')}
          >
            {getFieldDecorator('operator', {
              initialValue: operator,
            })(
              <Select allowClear onChange={this.changeOperator}>
                {parameterType === 'string'
                  ? serviceOperatorList
                      .filter((i) => !arr.includes(i.value))
                      .map((item) => (
                        <Option key={item.value} value={item.value}>
                          {item.meaning}
                        </Option>
                      ))
                  : serviceOperatorList.map((item) => (
                    <Option key={item.value} value={item.value}>
                      {item.meaning}
                    </Option>
                    ))}
              </Select>
            )}
          </FormItem>
          <FormItem
            {...formLayout}
            label={intl
              .get('hwfp.serviceDefinition.model.param.rightParameterSource')
              .d('右参数来源')}
          >
            {getFieldDecorator('rightParameterSource', {
              initialValue: { key: rightParameterSource, label: rightParameterSourceMeaning },
            })(
              <Select
                allowClear
                labelInValue
                onChange={() => this.selectChangeValue()}
                disabled={
                  !form.getFieldValue('operator') ||
                  form.getFieldValue('operator') === 'CONTAIN' ||
                  form.getFieldValue('operator') === 'NOT_CONTAIN'
                }
              >
                {paramterSourceList.map((item) => (
                  <Option key={item.value} value={item.value}>
                    {item.meaning}
                  </Option>
                ))}
              </Select>
            )}
          </FormItem>
          {(form.getFieldValue('rightParameterSource') &&
            form.getFieldValue('rightParameterSource').key === 'VARIABLE') ||
          (!form.getFieldValue('rightParameterSource') && rightParameterSource === 'VARIABLE') ? (
            <FormItem
              {...formLayout}
              label={intl
                .get('hwfp.serviceDefinition.model.param.rightParameterValue')
                .d('右参数值')}
            >
              {getFieldDecorator('rightParameterValue', {
                initialValue: rightParameterValue,
              })(
                <Lov
                  disabled={!form.getFieldValue('operator')}
                  code={
                    isSiteFlag
                      ? 'HWFP.PROCESS_VARIABLE_LOV_VIEW.SITE'
                      : 'HWFP.PROCESS_VARIABLE_LOV_VIEW'
                  }
                  onChange={this.changeRightParameterValue}
                  lovOptions={{
                    displayField: 'variableName',
                    valueField: 'variableName',
                  }}
                  queryParams={{ categoryId, documentId }}
                />
              )}
            </FormItem>
          ) : (
            <FormItem
              {...formLayout}
              label={intl
                .get('hwfp.serviceDefinition.model.param.rightParameterValue')
                .d('右参数值')}
            >
              {getFieldDecorator('rightParameterValue', {
                initialValue: rightParameterValue,
                rules: [
                  {
                    required:
                      form.getFieldValue('operator') === 'CONTAIN' ||
                      form.getFieldValue('operator') === 'NOT_CONTAIN',
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get('hwfp.serviceDefinition.model.param.rightParameterValue')
                        .d('右参数值'),
                    }),
                  },
                ],
              })(
                <Input
                  disabled={
                    (form.getFieldValue('rightParameterSource') &&
                      !form.getFieldValue('rightParameterSource').key) ||
                    !form.getFieldValue('rightParameterSource')
                  }
                  suffix={
                    <Icon
                      key="clear-description"
                      style={{
                        cursor: 'pointer',
                        color: 'rgba(0,0,0,.25)',
                        display: getFieldValue('rightParameterValue') ? 'block' : 'none',
                      }}
                      type="close-circle"
                      onClick={(e) => this.emitEmpty(e, 'rightParameterValue')}
                    />
                  }
                />
              )}
            </FormItem>
          )}
          <FormItem
            {...formLayout}
            label={intl
              .get('hwfp.serviceDefinition.model.param.rightParameterDescription')
              .d('右参数名称')}
          >
            {getFieldDecorator('rightParameterDescription', {
              initialValue: rightParameterDescription,
            })(<Input disabled />)}
          </FormItem>
          <FormItem
            {...formLayout}
            label={intl.get('hwfp.serviceDefinition.model.param.description').d('参数描述')}
          >
            {getFieldDecorator('parameterRemark', {
              initialValue: parameterRemark,
              rules: [
                {
                  max: 500,
                  message: intl.get('hzero.common.validation.max', {
                    max: 500,
                  }),
                },
              ],
            })(<Input />)}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
