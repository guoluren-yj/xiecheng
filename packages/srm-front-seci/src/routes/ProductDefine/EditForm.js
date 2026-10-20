/**
 * EditForm - 产品定义 - 数据维护表单
 * @date: 2018-12-26
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Input, Modal } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import Lov from 'components/Lov';
import Switch from 'components/Switch';

/**
 * 使用 Form.Item 组件
 */
const FormItem = Form.Item;

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
    const { form, onHandleAddProduct } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (!err) {
        onHandleAddProduct(fieldsValue, form);
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

  render() {
    const { form, modalVisible, editRowData, loading } = this.props;
    const {
      productId,
      productCode,
      productName,
      interfaceId,
      interfaceName,
      enabledFlag,
    } = editRowData;

    return (
      <Modal
        destroyOnClose
        {...otherProps}
        confirmLoading={loading}
        title={intl.get(`seci.productDefine.view.message.title.modal`).d('产品定义维护')}
        visible={modalVisible}
        onOk={this.okHandle}
        width={520}
        onCancel={this.cancelHandle}
      >
        <React.Fragment>
          <FormItem
            label={intl.get(`seci.productDefine.model.productDefine.productCode`).d('产品代码')}
            {...formLayout}
          >
            {form.getFieldDecorator('productCode', {
              initialValue: productCode,
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl
                      .get(`seci.productDefine.model.productDefine.productCode`)
                      .d('产品代码'),
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
                disabled={!!productId}
              />
            )}
          </FormItem>
          <FormItem
            label={intl.get(`seci.productDefine.model.productDefine.productName`).d('产品名称')}
            {...formLayout}
          >
            {form.getFieldDecorator('productName', {
              initialValue: productName,
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl
                      .get(`seci.productDefine.model.productDefine.productName`)
                      .d('产品名称'),
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
            label={intl.get(`seci.productDefine.model.productDefine.interfaceName`).d('接口名称')}
            {...formLayout}
          >
            {form.getFieldDecorator('interfaceId', {
              initialValue: interfaceId,
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl
                      .get(`seci.productDefine.model.productDefine.interfaceName`)
                      .d('接口名称'),
                  }),
                },
              ],
            })(<Lov textValue={interfaceName} code="SECI.INTERFACE" />)}
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
