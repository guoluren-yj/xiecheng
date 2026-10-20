/**
 * ESRelations - 外部系统定义 - 租户关联 - 数据维护表单
 * @date: 2018-9-11
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Modal, Select, Input } from 'hzero-ui';
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
 * Form.Item 组件label、wrapper长度比例划分
 */
const formLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
  width: { width: '100%' },
};

/**
 * 弹出modal侧滑属性
 */
const otherProps = {
  wrapClassName: 'ant-modal-sidebar-right',
  transitionName: 'move-right',
};

/**
 * EditForm - 编辑form
 * @extends {Component} - React.Component
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
export default class EditForm extends PureComponent {
  state = {
    relationTypeCode: '',
  };

  /**
   * 确认按钮
   * @memberof EditForm
   */
  @Bind()
  okHandle() {
    const { form, onHandleAddExternal } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (!err) {
        onHandleAddExternal(fieldsValue, form);
      }
    });
  }

  /**
   * 确认取消
   * @memberof EditForm
   */
  @Bind()
  cancelHandle() {
    const { form, onShowEditModal } = this.props;
    this.setState({
      relationTypeCode: '',
    });
    onShowEditModal(false);
    form.resetFields();
  }

  /**
   * 选择关联类型
   * @param {String} value 当前所选值
   * @memberof EditForm
   */
  @Bind()
  changeRelationCode(value) {
    this.setState({
      relationTypeCode: value,
    });
  }

  /**
   * 选择关系数据代码
   * @param {string} index  当前所选值
   * @param {object} record 当前行记录
   * @memberof EditForm
   */
  @Bind()
  setRelationDataId(index, record) {
    const { form } = this.props;
    const { relationTypeCode } = this.state;
    if (relationTypeCode === 'TENANT') {
      form.setFieldsValue({
        relationDataId: record.tenantId,
      });
    } else if (relationTypeCode === 'BUSINESS_GROUP') {
      form.setFieldsValue({
        relationDataId: record.businessGroupId,
      });
    } else {
      form.setFieldsValue({
        relationDataId: '',
      });
    }
  }

  render() {
    const {
      form,
      modalVisible,
      editRowData,
      loading,
      parentParams,
      ESRelationType = [],
    } = this.props;
    const {
      relationDataId,
      relationDataCode,
      interfaceEnabledFlag,
      interfaceControlFlag,
      applicationCode,
      applicationName,
      relationType,
    } = editRowData;
    const { relationTypeCode } = this.state;
    return (
      <Modal
        title={intl
          .get('sitf.externalSystems.view.message.title.esralations.modal.head')
          .d('租户关联数据维护')}
        {...otherProps}
        width={520}
        confirmLoading={loading}
        visible={modalVisible}
        destroyOnClose
        onOk={this.okHandle}
        onCancel={this.cancelHandle}
      >
        <React.Fragment>
          <FormItem label={intl.get('entity.application.name').d('应用名称')} {...formLayout}>
            {form.getFieldDecorator('applicationCode', {
              initialValue: applicationCode,
              rules: [
                {
                  required: true,
                  message: intl.get('entity.application.name').d('应用名称'),
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
          <FormItem
            label={intl
              .get('sitf.externalSystems.model.externalSystems.relationTypeMeaning')
              .d('关联类型')}
            {...formLayout}
          >
            {form.getFieldDecorator('relationType', {
              initialValue: relationType,
              rules: [
                {
                  required: true,
                  message: intl
                    .get('sitf.externalSystems.model.externalSystems.relationTypeMeaning')
                    .d('关联类型'),
                },
              ],
            })(
              <Select style={{ width: '100%' }} onChange={this.changeRelationCode}>
                {ESRelationType &&
                  ESRelationType.map(type => {
                    return (
                      <Option value={type.value} key={type.value}>
                        {type.meaning}
                      </Option>
                    );
                  })}
              </Select>
            )}
          </FormItem>
          <FormItem
            label={intl
              .get('sitf.externalSystems.model.externalSystems.relationDataCode')
              .d('关系数据代码')}
            {...formLayout}
          >
            {form.getFieldDecorator('relationDataCode', {
              initialValue: relationDataCode,
              rules: [
                {
                  required: true,
                  message: intl
                    .get('sitf.externalSystems.model.externalSystems.relationDataCode')
                    .d('关系数据代码'),
                },
              ],
            })(
              <Lov
                code={relationTypeCode === 'TENANT' ? 'SITF.TENANT' : 'SITF.BUSINESS_GROUP'}
                textValue={relationDataCode}
                disabled={!relationTypeCode}
                onChange={this.setRelationDataId}
              />
            )}
          </FormItem>
          <FormItem
            {...formLayout}
            label={intl
              .get('sitf.externalSystems.model.externalSystems.interfaceEnabledFlag')
              .d('启用接口')}
          >
            {form.getFieldDecorator('interfaceEnabledFlag', {
              initialValue: interfaceEnabledFlag === undefined ? 1 : interfaceEnabledFlag,
            })(<Switch />)}
          </FormItem>
          <FormItem
            {...formLayout}
            label={intl
              .get('sitf.externalSystems.model.externalSystems.interfaceControlFlag')
              .d('接口管控')}
          >
            {form.getFieldDecorator('interfaceControlFlag', {
              initialValue: interfaceControlFlag === undefined ? 1 : interfaceControlFlag,
            })(<Switch />)}
          </FormItem>
          <FormItem style={{ display: 'none' }}>
            {form.getFieldDecorator('relationDataId', {
              initialValue: relationDataId,
            })(<Input />)}
          </FormItem>
        </React.Fragment>
      </Modal>
    );
  }
}
