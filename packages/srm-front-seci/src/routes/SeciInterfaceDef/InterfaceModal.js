/**
 * InterfaceModal - 接口定义 - 弹出框
 * @date: 2019-01-02
 * @author: lokya <kan.li01@hand-china.com>
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
 * @reactProps {Function} onHandleSaveInterface - 编辑确定后回调函数以保存数据
 * @reactProps {Function} onCancel - 取消模态框
 * @reactProps {Object} visible - 控制模态框显影
 * @reactProps {Object} tableRecord - 表格中信息的一条记录
 * @reactProps {String} anchor - 模态框弹出方向
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
export default class InterfaceModal extends PureComponent {
  // 点击确认回调
  @Bind()
  onOk() {
    const { form, onHandleSaveInterface, tableRecord } = this.props;
    form.validateFields((err, values) => {
      if (isEmpty(err)) {
        onHandleSaveInterface({
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
        title={intl.get('seci.seciInterfaceDef.view.message.title.modal').d('接口定义维护')}
        width={520}
        onCancel={onCancel}
        onOk={this.onOk}
        visible={modalVisible}
        wrapClassName={`ant-modal-sidebar-${anchor}`}
        transitionName={`move-${anchor}`}
        confirmLoading={loading}
      >
        <Form>
          <FormItem label={intl.get('entity.interface.code').d('接口代码')} {...formLayout}>
            {getFieldDecorator('interfaceCode', {
              rules: [
                {
                  max: 40,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`hzero.common.validation.max`, {
                      max: 40,
                    }),
                  }),
                },
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('entity.interface.code').d('接口代码'),
                  }),
                },
              ],
              initialValue: tableRecord.interfaceCode,
            })(
              <Input
                typeCase="upper"
                trim
                inputChinese={false}
                disabled={tableRecord.interfaceCode}
              />
            )}
          </FormItem>
          <FormItem label={intl.get('entity.interface.name').d('接口名称')} {...formLayout}>
            {getFieldDecorator('interfaceName', {
              rules: [
                {
                  max: 40,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`hzero.common.validation.max`, {
                      max: 40,
                    }),
                  }),
                },
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('entity.interface.name').d('接口名称'),
                  }),
                },
              ],
              initialValue: tableRecord.interfaceName,
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
