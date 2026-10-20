/*
 * @Description: 手机验证模态框
 * @Author: zhutian <tian.zhu@hand-china.com>
 * @Date: 2019-08-14 09:30:12
 * @LastEditTime: 2023-07-28 15:29:22
 */
import React, { Component } from 'react';
import { Modal, Input, Form, Button } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isFunction } from 'lodash';
import intl from 'utils/intl';

import styles from './index.less';

const modelPrompt = 'spcm.contractChapter.model.common';
const messagePrompt = 'spcm.contractChapter.view.message';
const buttonPrompt = 'spcm.contractChapter.view.button';
const formItemLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 20 },
};

@Form.create({ fieldNameProp: null })
export default class ValidateModal extends Component {
  constructor(props) {
    super(props);
    if (isFunction(props.onRef)) {
      props.onRef(this);
    }
    this.state = {
      verifyCodeFlag: false,
      remainingTime: 60,
    };
  }

  verifyInterval; // 倒计时定时器

  componentDidUpdate(prevProps) {
    const { mobileModalVisible } = this.props;
    if (prevProps.mobileModalVisible !== mobileModalVisible && !mobileModalVisible) {
      this.resetState(); // 查询数据
    }
  }

  /**
   * 数据重置
   */
  @Bind()
  resetState() {
    clearInterval(this.verifyInterval);
    this.props.form.resetFields();
    this.setState({
      verifyCodeFlag: false,
      remainingTime: 60,
    });
  }

  /**
   * handleCancel - 取消并关闭modal
   */
  @Bind()
  handleCancel() {
    const { onClose } = this.props;
    onClose();
  }

  /**
   * handleCancel - 点击获取验证码按钮
   */
  @Bind()
  handleClickCode() {
    const { form, getVerifyCode } = this.props;
    let remainingTime = 60;
    const _this = this;
    form.validateFields(['mobile'], (err) => {
      if (!err) {
        this.setState({ verifyCodeFlag: true });
        this.verifyInterval = setInterval(() => {
          remainingTime--;
          _this.setState({
            remainingTime,
          });
          if (remainingTime < 0) {
            clearInterval(this.verifyInterval);
            _this.setState({
              remainingTime: 60,
              verifyCodeFlag: false,
            });
          }
        }, 1000);
      }
    });
    getVerifyCode();
  }

  /**
   * handleOk - 保存 并关闭 modal
   */
  @Bind()
  handleOk() {
    const { form, onModalOk } = this.props;
    form.validateFields((err, values) => {
      if (!err) {
        onModalOk(values);
      }
    });
  }

  render() {
    const {
      mobileModalVisible,
      mobileChapterLoading,
      form: { getFieldDecorator },
      verifyPhoneNum,
    } = this.props;
    const { verifyCodeFlag, remainingTime } = this.state;
    const okButtonProps = {
      loading: mobileChapterLoading,
    };
    return (
      <Modal
        title={intl.get(`${messagePrompt}.title.noteVerification`).d('短信验证')}
        visible={mobileModalVisible}
        onCancel={this.handleCancel}
        onOk={this.handleOk}
        okText={intl.get('hzero.common.button.ok').d('确定')}
        okButtonProps={okButtonProps}
        cancelText={intl.get('hzero.common.button.cancel').d('取消')}
      >
        <div className={styles.mobileModal}>
          <Form.Item label={intl.get(`${modelPrompt}.mobile`).d('手机号码')} {...formItemLayout}>
            {getFieldDecorator('mobile', {
              initialValue: verifyPhoneNum,
              rules: [
                {
                  required: true,
                  message: intl
                    .get('hzero.common.validation.notNull', {
                      name: intl.get(`${modelPrompt}.mobile`).d('手机号码'),
                    })
                    .d(`${intl.get(`${modelPrompt}.mobile`).d('手机号码')}不能为空`),
                },
                {
                  pattern: /^134[0-8]\d{7}$|^13[^4]\d{8}$|^14[5-9]\d{8}$|^15[^4]\d{8}$|^16[2,5,6,7]\d{8}$|^17[0-8]\d{8}$|^18\d{9}$|^19[^4]\d{8}$/,
                  message: intl.get('hzero.common.validation.phone').d('手机格式不正确'),
                },
              ],
            })(<Input disabled={verifyCodeFlag || !!verifyPhoneNum} />)}
            {!verifyCodeFlag ? (
              <Button type="primary" onClick={this.handleClickCode}>
                {intl.get(`${buttonPrompt}.getVerificationCode`).d('获取验证码')}
              </Button>
            ) : (
              <Button type="primary" onClick={this.handleClickCode} disabled>
                {intl.get(`${buttonPrompt}.remainingTime`).d('剩余时间')}
                {remainingTime}s
              </Button>
            )}
          </Form.Item>
          <Form.Item
            label={intl.get(`${modelPrompt}.verificationCode`).d('验证码')}
            {...formItemLayout}
          >
            {getFieldDecorator('verifiCode', {
              rules: [
                {
                  required: true,
                  message: intl
                    .get('hzero.common.validation.notNull', {
                      name: intl.get(`${modelPrompt}.verificationCode`).d('验证码'),
                    })
                    .d(`${intl.get(`${modelPrompt}.verificationCode`).d('验证码')}不能为空`),
                },
              ],
            })(<Input />)}
          </Form.Item>
        </div>
      </Modal>
    );
  }
}
