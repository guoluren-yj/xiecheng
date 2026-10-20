/**
 * Create - 评标方法 新建
 * @date: 2019-5-16
 * @author: LXM <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */

import React, { Component } from 'react';
import { Drawer, Form, Input, Button, Row } from 'hzero-ui';
import Switch from 'components/Switch';
import { isEmpty } from 'lodash';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import TLEditor from 'components/TLEditor';

const FormItem = Form.Item;
const { TextArea } = Input;
const promptCode = 'ssrc.evaluation';

const notModifyMethodOne = intl
  .get(`${promptCode}.view.evaluation.notModifyMethodOne`)
  .d('最低价法');
const notModifyMethodTwo = intl
  .get(`${promptCode}.view.evaluation.notModifyMethodTwo`)
  .d('综合评标法');

@Form.create({ fieldNameProp: null })
export default class Create extends Component {
  /**
   * renderForm - 渲染表单
   */
  renderForm() {
    const { form, initDrawerData = {}, drawerStatus } = this.props;
    const { getFieldDecorator } = form;
    const { evalMethodCode, evalMethodName, remark, enabledFlag, _token } = initDrawerData;

    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 16 },
    };

    return (
      <Form>
        <Row gutter={24}>
          <FormItem
            {...formItemLayout}
            label={intl.get(`${promptCode}.view.evaluation.evalMethodCode`).d('评标方法编码')}
          >
            {getFieldDecorator('evalMethodCode', {
              initialValue: evalMethodCode,
              rules: [
                {
                  required: true,
                  message: intl.get(`hzero.common.validation.notNull`, {
                    name: intl
                      .get(`${promptCode}.view.evaluation.evalMethodCode`)
                      .d('评标方法编码'),
                  }),
                },
                {
                  max: 60,
                  message: intl.get('hzero.common.validation.max', { max: 60 }),
                },
                {
                  pattern: /^[a-zA-Z0-9]+$/,
                  message: intl
                    .get(`${promptCode}.view.evaluation.digital`)
                    .d('只能输入字母或数字'),
                },
              ],
            })(<Input disabled={drawerStatus === 'EDIT'} />)}
          </FormItem>
        </Row>
        <Row gutter={24}>
          <FormItem
            {...formItemLayout}
            label={intl.get(`${promptCode}.view.evaluation.evalMethodName`).d('评标方法名称')}
          >
            {getFieldDecorator('evalMethodName', {
              initialValue: evalMethodName,
              rules: [
                {
                  required: true,
                  message: intl.get(`hzero.common.validation.notNull`, {
                    name: intl
                      .get(`${promptCode}.view.evaluation.evalMethodName`)
                      .d('评标方法名称'),
                  }),
                },
                {
                  max: 300,
                  message: intl.get('hzero.common.validation.max', { max: 300 }),
                },
                {
                  pattern: /^[a-zA-Z0-9\u4e00-\u9fa5]+$/,
                  message: intl
                    .get(`${promptCode}.view.evaluation.digitalTip`)
                    .d('只能输入中文、字母或数字'),
                },
              ],
            })(
              <TLEditor
                label={intl.get(`${promptCode}.view.evaluation.evalMethodName`).d('评标方法名称')}
                field="evalMethodName"
                token={_token}
                disabled={
                  evalMethodName === notModifyMethodOne || evalMethodName === notModifyMethodTwo
                }
              />
            )}
          </FormItem>
        </Row>
        <Row gutter={24}>
          <FormItem
            {...formItemLayout}
            label={intl.get(`${promptCode}.view.evaluation.remark`).d('描述')}
          >
            {getFieldDecorator('remark', {
              initialValue: remark,
              rules: [
                {
                  required: true,
                  message: intl.get(`hzero.common.validation.notNull`, {
                    name: intl.get(`${promptCode}.view.evaluation.remark`).d('描述'),
                  }),
                },
                {
                  max: 2000,
                  message: intl.get('hzero.common.validation.max', { max: 2000 }),
                },
              ],
            })(<TextArea style={{ marginBottom: 5, marginTop: 5 }} />)}
          </FormItem>
        </Row>
        <Row gutter={24}>
          <FormItem
            {...formItemLayout}
            label={intl.get(`${promptCode}.view.evaluation.enable`).d('启用')}
          >
            {getFieldDecorator('enabledFlag', {
              initialValue: enabledFlag === 0 ? 0 : 1,
            })(<Switch />)}
          </FormItem>
        </Row>
      </Form>
    );
  }

  /**
   * onCancle - 取消
   */
  @Bind()
  onCancle() {
    const {
      form: { resetFields = (e) => e },
      onClose,
    } = this.props;
    resetFields();
    onClose();
  }

  /**
   * onSave - 确定
   */
  @Bind()
  onSave() {
    const { form, createEvaluation, initDrawerData, drawerStatus } = this.props;
    form.validateFields((error, value) => {
      if (isEmpty(error)) {
        if (drawerStatus === 'Create') {
          createEvaluation(value, this.onCancle);
        } else {
          createEvaluation(
            {
              ...value,
              evalMethodId: initDrawerData.evalMethodId,
              objectVersionNumber: initDrawerData.objectVersionNumber,
            },
            this.onCancle
          );
        }
      }
    });
  }

  render() {
    const { visible, drawerLoading } = this.props;

    const drawerProps = {
      visible,
      width: 520,
      onClose: this.onCancle,
      title: intl.get(`${promptCode}.view.evaluation.drawerTitle`).d('评标方法维护'),
      maskStyle: { backgroundColor: 'rgba(0,0,0,.85)' },
      destroyOnClose: true,
    };

    return (
      <Drawer {...drawerProps}>
        {this.renderForm()}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            width: '100%',
            borderTop: '1px solid #e8e8e8',
            padding: '16px 24px',
            textAlign: 'right',
            left: 0,
            background: '#fff',
            borderRadius: '0 0 4px 4px',
            zIndex: 1,
          }}
        >
          <Button style={{ marginRight: 8 }} onClick={this.onCancle}>
            {intl.get('hzero.common.button.cancel').d('取消')}
          </Button>
          <Button type="primary" htmlType="submit" onClick={this.onSave} loading={drawerLoading}>
            {intl.get('hzero.common.button.confirm').d('确认')}
          </Button>
        </div>
      </Drawer>
    );
  }
}
