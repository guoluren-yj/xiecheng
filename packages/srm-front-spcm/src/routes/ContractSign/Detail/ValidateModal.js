/*
 * @Description: 手机验证模态框
 * @Author: zhutian <tian.zhu@hand-china.com>
 * @Date: 2019-08-14 09:30:12
 * @LastEditTime: 2023-07-31 11:18:49
 */
import React, { Component, Fragment } from 'react';
import { Modal, Input, Form, Button } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { isFunction } from 'lodash';

import styles from './index.less';

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
      remainingTime: 60,
      getCheckCode: true,
    };
  }

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
    clearInterval(this.validateModal);
    this.props.form.resetFields();
    this.setState({
      getCheckCode: true,
      remainingTime: 60,
    });
  }

  @Bind()
  handleCancel() {
    const {
      onClose,
    } = this.props;
    onClose();
    clearInterval(this.validateModal);
  }

  validateModal;

  /**
   *
   *  手机验证码获取并进行倒计时
   * @memberof ValidateModal
   */
  @Bind()
  handleCheckCode() {
    const { form, onGetCheckCode } = this.props;
    const mobile = form.getFieldValue('mobile');
    onGetCheckCode(mobile);
    const that = this;
    form.validateFields(['mobile'], (err) => {
      if (!err) {
        that.setState({ getCheckCode: false });
        let remainingTime = 60;
        this.validateModal = setInterval(() => {
          remainingTime--;
          that.setState({ remainingTime });
          if (remainingTime === -1) {
            clearInterval(that.validateModal);
            that.setState({ getCheckCode: true, remainingTime: 60 });
          }
        }, 1000);
      }
    });
  }

  /**
   * 保存 modal 数据，并且关闭 modal
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
      contractLoading,
      form: { getFieldDecorator },
      verifyPhoneNum,
    } = this.props;
    const { getCheckCode, remainingTime } = this.state;
    return (
      <Modal
        title={intl.get(`spcm.contractChapter.view.message.title.noteVerification`).d('短信验证')}
        visible={mobileModalVisible}
        onCancel={this.handleCancel}
        onOk={this.handleOk}
        footer={
          <Fragment>
            <Button onClick={this.handleCancel}>
              {intl.get(`hzero.common.button.cancel`).d('取消')}
            </Button>
            <Button type="primary" onClick={this.handleOk} loading={contractLoading}>
              {intl.get(`hzero.common.button.ok`).d('确定')}
            </Button>
          </Fragment>
        }
      >
        <div className={styles.mobileModal}>
          <Form.Item
            label={intl.get(`spcm.contractChapter.model.common.mobileNumber`).d('手机号码')}
            {...formItemLayout}
            onSubmit={this.afterCheckNumber}
          >
            {getFieldDecorator('mobile', {
              initialValue: verifyPhoneNum,
              rules: [
                {
                  required: true,
                  message: intl
                    .get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`spcm.contractChapter.model.common.mobileNumber`)
                        .d('手机号码'),
                    })
                    .d(
                      `${intl
                        .get(`spcm.contractChapter.model.common.mobileNumber`)
                        .d('手机号码')}不能为空`
                    ),
                },
                {
                  pattern: /^134[0-8]\d{7}$|^13[^4]\d{8}$|^14[5-9]\d{8}$|^15[^4]\d{8}$|^16[2,5,6,7]\d{8}$|^17[0-8]\d{8}$|^18\d{9}$|^19[^4]\d{8}$/,
                  message: intl.get('hzero.common.validation.phone').d('手机格式不正确'),
                },
              ],
            })(<Input onChange={this.afterNumber} disabled={!getCheckCode || !!verifyPhoneNum} />)}
            {getCheckCode ? (
              <Button type="primary" onClick={this.handleCheckCode}>
                {intl.get(`spcm.contractChapter.model.common.getVerificationCode`).d('获取验证码')}
              </Button>
            ) : (
              <Button type="primary" disabled>
                {intl.get(`spcm.contractChapter.model.common.remainingTime`).d('剩余时间')}
                {remainingTime}s
              </Button>
            )}
          </Form.Item>
          <Form.Item
            label={intl.get(`spcm.contractChapter.model.common.verificationCode`).d('验证码')}
            {...formItemLayout}
          >
            {getFieldDecorator('verifiCode', {
              rules: [
                {
                  required: true,
                  message: intl
                    .get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`spcm.contractChapter.model.common.verificationCode`)
                        .d('验证码'),
                    })
                    .d(
                      `${intl
                        .get(`spcm.contractChapter.model.common.verificationCode`)
                        .d('验证码')}不能为空`
                    ),
                },
              ],
            })(<Input />)}
          </Form.Item>
        </div>
      </Modal>
    );
  }
}
