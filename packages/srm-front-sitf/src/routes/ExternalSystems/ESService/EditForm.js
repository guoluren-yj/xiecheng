/**
 * ESService - 外部系统定义 - 关联服务 - 编辑弹框
 * @date: 2018-9-26
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Input, Modal } from 'hzero-ui';
import lodash from 'lodash';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import Lov from 'components/Lov';

/**
 * 使用 Form.Item 组件
 */
const FormItem = Form.Item;

/**
 * modal侧滑属性
 */
const otherProps = {
  wrapClassName: 'ant-modal-sidebar-right',
  transitionName: 'move-right',
};

/**
 * Form.Item 组件label、wrapper长度比例划分
 */
const formLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
};

/**
 * EditForm - 编辑form
 * @extends {Component} - React.Component
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
export default class EditForm extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      interfaceCode: '',
    };
  }

  /**
   * 确认
   */
  @Bind()
  okHandle() {
    const { form, onHandleAddESService, editRowData = {} } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (!err) {
        onHandleAddESService(
          {
            ...fieldsValue,
            applicationCode: lodash.trim(fieldsValue.applicationCode),
            interfaceCode:
              editRowData.interfaceName === fieldsValue.interfaceCode
                ? editRowData.interfaceCode
                : this.state.interfaceCode,
          },
          form
        );
      }
    });
  }

  /**
   *取消
   * @memberof EditForm
   */
  @Bind()
  cancelHandle() {
    const { form, showEditModal } = this.props;
    showEditModal(false);
    form.resetFields();
  }

  /**
   * 选择接口
   * @param {object} record 行记录
   * @memberof EditForm
   */
  @Bind()
  changeInterface(record) {
    this.setState({
      interfaceCode: record.interfaceCode,
    });
  }

  render() {
    const { form, modalVisible, editRowData, loading, parentParams = {} } = this.props;
    const { interfaceName, applicationCode, applicationName, serviceName, path } = editRowData;
    return (
      <Modal
        title={intl.get('entity.application.edit').d('应用维护')}
        {...otherProps}
        confirmLoading={loading}
        visible={modalVisible}
        destroyOnClose
        onOk={this.okHandle}
        width={520}
        onCancel={this.cancelHandle}
      >
        <React.Fragment>
          <FormItem label={intl.get('entity.application.tag').d('应用')} {...formLayout}>
            {form.getFieldDecorator('applicationCode', {
              initialValue: applicationCode,
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('entity.application.tag').d('应用'),
                  }),
                },
              ],
            })(
              <Lov
                code="SIFC.APPLICATIONS"
                queryParams={{
                  applicationGroupCode: parentParams && parentParams.applicationGroupCode,
                }}
                textValue={applicationName}
              />
            )}
          </FormItem>
          <FormItem label={intl.get('entity.interface.name').d('接口名称')} {...formLayout}>
            {form.getFieldDecorator('interfaceCode', {
              initialValue: interfaceName,
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('entity.interface.name').d('接口名称'),
                  }),
                },
              ],
            })(
              <Lov
                code="SITF.INTERFACE"
                textValue={interfaceName}
                queryParams={{
                  applicationGroupCode: parentParams && parentParams.applicationGroupCode,
                }}
                onChange={(_, record) => {
                  this.changeInterface(record);
                }}
              />
            )}
          </FormItem>
          <FormItem
            label={intl.get('sitf.externalSystems.model.externalSystems.serviceName').d('服务名称')}
            {...formLayout}
          >
            {form.getFieldDecorator('serviceName', {
              initialValue: serviceName,
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl
                      .get('sitf.externalSystems.model.model.externalSystems.serviceName')
                      .d('服务名称'),
                  }),
                },
                {
                  max: 70,
                  message: intl.get('hzero.common.validation.max', {
                    max: 70,
                  }),
                },
              ],
            })(<Input />)}
          </FormItem>
          <FormItem
            label={intl.get('sitf.externalSystems.model.externalSystems.path').d('服务路径')}
            {...formLayout}
          >
            {form.getFieldDecorator('path', {
              initialValue: path,
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('sitf.externalSystems.model.externalSystems.path').d('服务路径'),
                  }),
                },
                {
                  max: 70,
                  message: intl.get('hzero.common.validation.max', {
                    max: 70,
                  }),
                },
              ],
            })(<Input />)}
          </FormItem>
        </React.Fragment>
      </Modal>
    );
  }
}
