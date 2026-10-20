/**
 * InterfaceMappingModal -IDoc接口映射配置-modal 编辑
 * @date: 2018-10-18
 * @author dengtingmin <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { Modal, Form, Input } from 'hzero-ui';
import { isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';

import Lov from 'components/Lov';

import intl from 'utils/intl';

const FormItem = Form.Item;
/**
 * Form.Item 组件label、wrapper长度比例划分
 */
const formLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
};

/**
 * 编辑模态框数据展示
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} onCancel - 取消模态框
 * @reactProps {Object} visible - 控制模态框显影
 * @reactProps {Object} tableRecord - 表格中信息的一条记录
 * @reactProps {String} anchor - 模态框弹出方向
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
export default class InterfaceMappingModal extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      interfaceId: '',
    };
  }
  /**
   * 确认后保存
   */
  @Bind()
  onOk() {
    const { form, onHandleSaveInterface, tableRecord } = this.props;
    const { interfaceId } = this.state;

    form.validateFields((err, values) => {
      if (isEmpty(err)) {
        onHandleSaveInterface({
          ...tableRecord,
          ...values,
          applicationGroupCode:
            tableRecord.applicationGroupName === values.applicationGroupCode
              ? tableRecord.applicationGroupCode
              : values.applicationGroupCode,
          interfaceId: interfaceId === '' ? tableRecord.interfaceId : interfaceId,
        });
      }
    });
  }

  render() {
    const { visible, onCancel, anchor, tableRecord = {}, loading } = this.props;
    const { getFieldDecorator } = this.props.form;
    return (
      <Modal
        destroyOnClose
        title={intl
          .get('sitf.interfaceMappingConfig.view.interfaceMappingConfig.modelTitler')
          .d('IDoc接口映射配置维护')}
        width={520}
        onCancel={onCancel}
        onOk={this.onOk}
        visible={visible}
        wrapClassName={`ant-modal-sidebar-${anchor}`}
        transitionName={`move-${anchor}`}
        confirmLoading={loading}
      >
        <Form>
          <FormItem label={intl.get('entity.application.group').d('应用组')} {...formLayout}>
            {getFieldDecorator('applicationGroupCode', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`entity.application.group`).d('应用组'),
                  }),
                },
              ],
              initialValue: tableRecord.applicationGroupName,
            })(<Lov code="SIFC.APPLICATION_GROUPS" textValue={tableRecord.applicationGroupName} />)}
          </FormItem>
          <FormItem label={intl.get('entity.interface.tag').d('接口')} {...formLayout}>
            {getFieldDecorator('interfaceCode', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`entity.interface.tag`).d('接口'),
                  }),
                },
              ],
              initialValue: tableRecord.interfaceCode,
            })(<Input />)}
          </FormItem>
          <FormItem
            label={intl
              .get('sitf.interfaceMappingConfig.model.interfaceMappingConfig.idocType')
              .d('IDoc类别')}
            {...formLayout}
          >
            {getFieldDecorator('idocType', {
              rules: [
                {
                  max: 30,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`hzero.common.validation.max`, {
                      max: 30,
                    }),
                  }),
                },
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl
                      .get(`sitf.interfaceMappingConfig.model.interfaceMappingConfig.idocType`)
                      .d('IDoc类别'),
                  }),
                },
              ],
              initialValue: tableRecord.idocType,
            })(<Input />)}
          </FormItem>
          <FormItem
            label={intl
              .get(`sitf.interfaceSegment.model.interfaceSegment.parentIdocType`)
              .d('父IDOC类别')}
            {...formLayout}
          >
            {getFieldDecorator('parentIdocType', {
              initialValue: tableRecord.parentIdocType,
            })(<Input />)}
          </FormItem>
          <FormItem
            label={intl
              .get('sitf.interfaceMappingConfig.model.interfaceMappingConfig.idocTypeDesc')
              .d('IDoc描述')}
            {...formLayout}
          >
            {getFieldDecorator('idocTypeDesc', {
              rules: [
                {
                  max: 100,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`hzero.common.validation.max`, {
                      max: 100,
                    }),
                  }),
                },
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl
                      .get(`sitf.interfaceMappingConfig.model.interfaceMappingConfig.idocTypeDesc`)
                      .d('IDoc描述'),
                  }),
                },
              ],
              initialValue: tableRecord.idocTypeDesc,
            })(<Input />)}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
