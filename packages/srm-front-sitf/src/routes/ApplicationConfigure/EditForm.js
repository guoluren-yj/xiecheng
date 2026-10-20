/**
 * EditForm - 应用配置 - 数据维护表单
 * @date: 2018-9-11
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Input, Modal, Select } from 'hzero-ui';
import lodash from 'lodash';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import Lov from 'components/Lov';
import Switch from 'components/Switch';

/**
 * 使用 Form.Item 组件
 */
const FormItem = Form.Item;

/**
 * 下拉选择框组件
 */
const { Option } = Select;

/**
 * 侧滑modal样式属性
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
 * 数据维护表单
 * @extends {Component} - React.Component
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
export default class EditForm extends PureComponent {
  /**
   * 点击确定触发事件
   */
  @Bind()
  okHandle() {
    const { form, onHandleAddApplication } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (!err) {
        onHandleAddApplication(
          { ...fieldsValue, applicationCode: lodash.trim(fieldsValue.applicationCode) },
          form
        );
      }
    });
  }

  /**
   * 点击取消触发事件
   */
  @Bind()
  cancelHandle() {
    const { form, showEditModal } = this.props;
    showEditModal(false);
    form.resetFields();
  }

  /**
   * lov的change方法设置产品线
   * @param {Nmuber} index 索引
   * @param {Object} record 行数据
   */
  @Bind()
  setProductLine(index, record) {
    const { form } = this.props;
    form.setFieldsValue({
      productLineCode: record.productLineCode,
      productLineName: record.productLineName,
    });
  }

  render() {
    const { form, modalVisible, editRowData, loading, ApplicationType = [] } = this.props;
    const {
      applicationId,
      applicationCode,
      applicationName,
      productLineCode,
      applicationType,
      enabledFlag,
      applicationGroupCode,
      applicationGroupName,
      productLineName,
      remark,
    } = editRowData;
    return (
      <Modal
        destroyOnClose
        {...otherProps}
        confirmLoading={loading}
        title={intl.get('entity.definition.edit').d('应用维护')}
        visible={modalVisible}
        onOk={this.okHandle}
        width={520}
        onCancel={this.cancelHandle}
      >
        <React.Fragment>
          <FormItem label={intl.get('entity.definition.code').d('应用代码')} {...formLayout}>
            {form.getFieldDecorator('applicationCode', {
              initialValue: applicationCode,
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('entity.definition.code').d('应用代码'),
                  }),
                },
                {
                  max: 30,
                  message: intl.get('hzero.common.validation.max', {
                    max: 30,
                  }),
                },
              ],
            })(
              <Input
                typeCase="upper"
                trim
                inputChinese={false}
                maxLength={30}
                disabled={!!applicationId}
              />
            )}
          </FormItem>
          <FormItem label={intl.get('entity.definition.name').d('应用名称')} {...formLayout}>
            {form.getFieldDecorator('applicationName', {
              initialValue: applicationName,
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('entity.definition.name').d('应用名称'),
                  }),
                },
                {
                  max: 100,
                  message: intl.get('hzero.common.validation.max', {
                    max: 100,
                  }),
                },
              ],
            })(<Input />)}
          </FormItem>
          <FormItem
            label={intl.get('sitf.common.applicationGroup.name').d('应用组名称')}
            {...formLayout}
          >
            {form.getFieldDecorator('applicationGroupCode', {
              initialValue: applicationGroupCode,
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('sitf.common.applicationGroup.name').d('应用组名称'),
                  }),
                },
              ],
            })(
              <Lov
                textValue={applicationGroupName}
                onChange={this.setProductLine}
                code="SIFC.APPLICATIONS_GROUP_LINE"
                disabled={!!applicationId}
              />
            )}
          </FormItem>
          <FormItem label={intl.get('sitf.common.product.name').d('产品线名称')} {...formLayout}>
            {form.getFieldDecorator('productLineName', {
              initialValue: productLineName,
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('sitf.common.product.name').d('产品线名称'),
                  }),
                },
              ],
            })(<Input disabled />)}
          </FormItem>
          <FormItem style={{ display: 'none' }}>
            {form.getFieldDecorator('productLineCode', {
              initialValue: productLineCode,
            })(<Input disabled />)}
          </FormItem>
          <FormItem
            label={intl.get('entity.definition.type').d('应用类型')}
            {...formLayout}
            style={{ width: '100%' }}
          >
            {form.getFieldDecorator('applicationType', {
              initialValue: applicationType,
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('entity.definition.type').d('应用类型'),
                  }),
                },
              ],
            })(
              <Select allowClear style={{ width: '100%' }}>
                {ApplicationType &&
                  ApplicationType.map(type => {
                    return (
                      <Option value={type.value} key={type.value}>
                        {type.meaning}
                      </Option>
                    );
                  })}
              </Select>
            )}
          </FormItem>
          <FormItem label={intl.get('hzero.common.remark').d('备注')} {...formLayout}>
            {form.getFieldDecorator('remark', {
              initialValue: remark,
            })(<Input />)}
          </FormItem>
          <FormItem label={intl.get('hzero.common.status.enable').d('启用')} {...formLayout}>
            {form.getFieldDecorator('enabledFlag', {
              initialValue: enabledFlag === undefined ? 1 : enabledFlag,
            })(<Switch />)}
          </FormItem>
        </React.Fragment>
      </Modal>
    );
  }
}
