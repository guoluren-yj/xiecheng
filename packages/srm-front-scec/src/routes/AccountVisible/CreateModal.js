/**
 * AccountVisible - 账号目录可见配置 - 新建弹框
 * @date: 2019-12-12
 * @author: ZZ <qizheng.wu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import React, { PureComponent } from 'react';
import { Modal, Form, Input } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import Lov from 'components/Lov';
import intl from 'utils/intl';
import Switch from 'components/Switch';

const otherProps = {
  wrapClassName: 'ant-modal-sidebar-right',
  transitionName: 'move-right',
};

const formLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
};

@Form.create({ fieldNameProp: null })
export default class CreateModal extends PureComponent {
  @Bind()
  HandleOk() {
    const { form, onHandleOk } = this.props;
    form.validateFields((err, values) => {
      if (!err) {
        onHandleOk(values);
      }
    });
  }

  render() {
    const {
      initData,
      modalVisible,
      currentCompany,
      form: { getFieldDecorator },
      onHandleCancel,
    } = this.props;
    return (
      <Modal
        title="新建模版"
        visible={modalVisible}
        onCancel={onHandleCancel}
        {...otherProps}
        onOk={this.HandleOk}
      >
        <Form>
          <Form.Item label="目录可见模版名称" {...formLayout}>
            {getFieldDecorator('configName', {
              initialValue: initData.configName,
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: '目录可见模版名称',
                  }),
                },
              ],
            })(<Input />)}
          </Form.Item>
          <Form.Item label="所属公司" {...formLayout}>
            {getFieldDecorator('companyId', {
              initialValue: initData.companyId,
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: '所属公司',
                  }),
                },
              ],
            })(
              <Lov
                allowClear={false}
                textField="companyName"
                textValue={currentCompany && currentCompany[0] && currentCompany[0].companyName}
                code="SPFM.USER_AUTHORITY_COMPANY"
                onChange={this.handleOnChange}
              />
            )}
          </Form.Item>
          <Form.Item label={intl.get('hzero.common.status').d('状态')} {...formLayout}>
            {getFieldDecorator('enabledFlag', {
              initialValue: initData.enabledFlag === undefined ? 1 : initData.enabledFlag,
            })(<Switch />)}
          </Form.Item>
        </Form>
      </Modal>
    );
  }
}
