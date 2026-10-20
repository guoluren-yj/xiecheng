import React, { Component } from 'react';
import { Modal, Input, Form, Row, Col, Button } from 'hzero-ui';
import { PHONE } from 'utils/regExp';
import intl from 'utils/intl';
import {
  EDIT_FORM_ROW_LAYOUT,
  EDIT_FORM_ITEM_LAYOUT,
  FORM_COL_3_LAYOUT,
  FORM_COL_2_3_LAYOUT,
} from 'utils/constants';

const prefix = 'sodr.common.model.common';
const COUNT_NUM = 60;
// const READY_TEXT = intl.get(`${prefix}.getVerifyCode`).d(`获取验证码`);
const READY_TEXT = intl.get('hzero.common.components.login.captcha').d(`获取验证码`);
const FormItem = Form.Item;

@Form.create({ fieldNameProp: null })
export default class MessageVerification extends Component {
  constructor(props) {
    super(props);
    this.state = {
      countEnable: false,
      countText: READY_TEXT,
    };
  }

  countNum = COUNT_NUM;

  sendCode = () => {
    const { getVerifyCode, form } = this.props;
    form.validateFields(['phoneNum'], (err) => {
      if (!err) {
        this.setState({
          countText: `${intl.get(`${prefix}.rest`).d(`剩余`)}${this.countNum}s`,
          countEnable: true,
        });
        this.countTimer = setInterval(() => {
          if (this.countNum > 0) {
            this.countNum--;
            this.setState({
              countEnable: true,
              countText: `${intl.get(`${prefix}.rest`).d(`剩余`)}${this.countNum}s`,
            });
          } else {
            clearInterval(this.countTimer);
            this.countNum = COUNT_NUM;
            this.setState({
              countEnable: false,
              countText: READY_TEXT,
            });
          }
        }, 1000);
      }
    });
    getVerifyCode();
  };

  componentWillUnmount() {
    clearInterval(this.countTimer);
  }

  render() {
    const { countText, countEnable } = this.state;
    const {
      form = {},
      phoneNum,
      handleOk = () => {},
      handleCancel = () => {},
      smsVerifyVisible = false,
      confirmMobileChapterLoading,
    } = this.props;
    const { getFieldDecorator } = form;
    const content = (
      <Form>
        <Row {...EDIT_FORM_ROW_LAYOUT}>
          <Col {...FORM_COL_2_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`${prefix}.phoneNum`).d('手机号码')}
            >
              {getFieldDecorator('phoneNum', {
                initialValue: phoneNum,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${prefix}.phoneNum`).d('手机号码'),
                    }),
                  },
                  {
                    pattern: PHONE,
                    message: intl.get(`sodr.common.model.common.phoneErrMsg`).d('手机号格式不正确'),
                  },
                ],
              })(<Input disabled={!!phoneNum} />)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Button
              type="primary"
              disabled={countEnable}
              onClick={this.sendCode}
              style={{ width: '120px' }}
            >
              {countText}
            </Button>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT}>
          <Col {...FORM_COL_2_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`${prefix}.verifyCode`).d('验证码')}
            >
              {getFieldDecorator('verifyCode', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${prefix}.verifyCode`).d('验证码'),
                    }),
                  },
                ],
              })(<Input />)}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
    return (
      <Modal
        destroyOnClose
        onOk={handleOk}
        onCancel={handleCancel}
        visible={smsVerifyVisible}
        confirmLoading={confirmMobileChapterLoading}
        title={intl.get(`${prefix}.messageVerify`).d(`短信验证`)}
      >
        {content}
      </Modal>
    );
  }
}
