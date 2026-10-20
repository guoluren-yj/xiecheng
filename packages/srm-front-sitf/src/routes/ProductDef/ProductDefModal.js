/**
 * ProductDefModal -产品线定义编辑
 * @date: 2018-9-13
 * @author DTM <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { Modal, Form, Input } from 'hzero-ui';
import { isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';

import Switch from 'components/Switch';

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
 * @reactProps {Function} onHandleSaveProduct -确认后保存数据
 * @reactProps {Function} onCancel - 取消模态框
 * @reactProps {Object} visible - 控制模态框显影
 * @reactProps {Object} tableRecord - 表格中信息的一条记录
 * @reactProps {String} anchor - 模态框弹出方向
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
export default class ProductDefModal extends PureComponent {
  /**
   * 确认后保存
   */
  @Bind()
  onOk() {
    const { form, onHandleSaveProduct, tableRecord = {} } = this.props;
    form.validateFields((err, values) => {
      if (isEmpty(err)) {
        onHandleSaveProduct({
          ...tableRecord,
          ...values,
        });
      }
    });
  }

  render() {
    const { modalVisible, onCancel, anchor, tableRecord = {}, loading } = this.props;
    const { getFieldDecorator } = this.props.form;
    return (
      <Modal
        destroyOnClose
        title={intl.get('sitf.productDef.view.productDef.editTitle').d('产品线定义维护')}
        width={520}
        onCancel={onCancel}
        onOk={this.onOk}
        visible={modalVisible}
        wrapClassName={`ant-modal-sidebar-${anchor}`}
        transitionName={`move-${anchor}`}
        confirmLoading={loading}
      >
        <Form>
          <FormItem
            label={intl.get('sitf.productDef.model.productDef.productLineCode').d('产品线代码')}
            {...formLayout}
          >
            {getFieldDecorator('productLineCode', {
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
                  message: intl
                    .get('sitf.productDef.model.productDef.productLineCode')
                    .d('产品线代码'),
                },
              ],
              initialValue: tableRecord.productLineCode,
            })(
              tableRecord.productLineCode === undefined ? (
                <Input typeCase="upper" trim inputChinese={false} />
              ) : (
                <Input typeCase="upper" trim inputChinese={false} disabled />
              )
            )}
          </FormItem>
          <FormItem
            label={intl.get('sitf.productDef.model.productDef.productLineName').d('产品线描述')}
            {...formLayout}
          >
            {getFieldDecorator('productLineName', {
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
                  message: intl
                    .get('sitf.productDef.model.productDef.productLineName')
                    .d('产品线描述'),
                },
              ],
              initialValue: tableRecord.productLineName,
            })(<Input />)}
          </FormItem>
          <FormItem label={intl.get('hzero.common.remark').d('备注')} {...formLayout}>
            {getFieldDecorator('remark', {
              initialValue: tableRecord.remark,
            })(<Input />)}
          </FormItem>
          <FormItem label={intl.get('hzero.common.status.enable').d('启用')} {...formLayout}>
            {getFieldDecorator('enabledFlag', {
              initialValue:
                tableRecord.enabledFlag === undefined ? 1 : tableRecord.enabledFlag ? 1 : 0,
            })(<Switch />)}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
