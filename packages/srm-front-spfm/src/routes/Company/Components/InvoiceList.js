/**
 * 企业信息 - 开票信息
 * @date: 2018-7-15
 * @author: chenjing <jing.chen05@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Input, Button, Spin } from 'hzero-ui';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { EMAIL, NOT_CHINA_PHONE } from 'utils/regExp';
import intl from 'utils/intl';

const { Item: FormItem } = Form;

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

const submitFormLayout = {
  wrapperCol: { span: 18, offset: 6 },
};

@connect(({ invoiceInfo, loading }) => ({
  invoiceInfo,
  fetchLoading: loading.effects['invoiceInfo/queryCompanyInvoice'],
}))
@Form.create({ fieldNameProp: null })
export default class InvoiceList extends PureComponent {
  /**
   * 挂载后执行方法
   */
  componentDidMount() {
    const { dispatch, companyId, onRef } = this.props;
    if (onRef) onRef(this);
    const data = {
      companyId,
    };
    dispatch({
      type: 'invoiceInfo/queryCompanyInvoice',
      payload: data,
    });
  }

  /**
   * 进行下一步时保存当前页面数据
   */
  @Bind()
  saveAndNext() {
    const { invoiceInfo = {}, companyId, form, dispatch, callback } = this.props;
    const { companyInvoiceId } = invoiceInfo;
    form.validateFields((err, fieldsValue) => {
      if (err) return;

      const payload = {
        ...invoiceInfo,
        companyId,
        invoiceHeader: fieldsValue.invoiceHeader,
        taxRegistrationNumber: fieldsValue.taxRegistrationNumber,
        depositBank: fieldsValue.depositBank,
        bankAccountNum: fieldsValue.bankAccountNum,
        taxRegistrationAddress: fieldsValue.taxRegistrationAddress,
        taxRegistrationPhone: fieldsValue.taxRegistrationPhone,
        receiveMail: fieldsValue.receiveMail,
        receivePhone: fieldsValue.receivePhone,
        objectVersionNumber: fieldsValue.objectVersionNumber,
      };
      dispatch({
        type: companyInvoiceId ? 'invoiceInfo/updateInvoiceInfo' : 'invoiceInfo/createInvoiceInfo',
        payload,
      }).then((res) => {
        if (res) {
          dispatch({
            type: 'invoiceInfo/updateState',
            payload: {
              ...res,
            },
          });
          if (callback) {
            callback(res);
          }
        }
      });
    });
  }

  /**
   * 返回上一步
   */
  @Bind()
  handlePrevious() {
    const { previousCallback } = this.props;
    if (previousCallback) {
      previousCallback();
    }
  }

  /**
   * 渲染方法
   * @returns
   */
  render() {
    const {
      updating,
      saving,
      fetchLoading,
      queryCompanyLoading,
      buttonText = intl.get('hzero.common.button.save').d('保存'),
      backBtnText = intl.get('hzero.common.button.previous').d('上一步'),
      previousCallback,
      companyName,
      invoiceInfo = {},
      invoiceInfo: { invoiceHeader, taxRegistrationNumber },
      form: { getFieldDecorator },
      unifiedSocialCode,
      statusNotPendingReject = false,
    } = this.props;

    return (
      <Spin spinning={queryCompanyLoading || fetchLoading}>
        <Form style={{ marginTop: 8, width: '720px' }}>
          <FormItem
            {...formItemLayout}
            label={intl.get('spfm.enterprise.model.invoice.invoiceHeader').d('发票头')}
          >
            {statusNotPendingReject
              ? invoiceHeader || companyName
              : getFieldDecorator('invoiceHeader', {
                  initialValue: invoiceHeader || companyName,
                  rules: [
                    {
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get('spfm.enterprise.model.invoice.invoiceHeader').d('发票头'),
                      }),
                    },
                  ],
                })(<Input disabled />)}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={intl.get('spfm.enterprise.model.invoice.taxRegistrationNumber').d('税务登记号')}
          >
            {statusNotPendingReject
              ? taxRegistrationNumber || unifiedSocialCode
              : getFieldDecorator('taxRegistrationNumber', {
                  initialValue: taxRegistrationNumber || unifiedSocialCode,
                  rules: [
                    {
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get('spfm.enterprise.model.invoice.taxRegistrationNumber')
                          .d('税务登记号'),
                      }),
                    },
                  ],
                })(<Input style={{ width: '200px' }} disabled />)}
          </FormItem>

          <FormItem
            {...formItemLayout}
            label={intl.get('spfm.enterprise.model.invoice.depositBank').d('开户行')}
          >
            {statusNotPendingReject
              ? invoiceInfo.depositBank
              : getFieldDecorator('depositBank', {
                  initialValue: invoiceInfo.depositBank,
                  // rules: [
                  //   {
                  //     required: true,
                  //     message: intl.get('hzero.common.validation.notNull', {
                  //       name: intl.get('spfm.enterprise.model.invoice.depositBank').d('开户行'),
                  //     }),
                  //   },
                  // ],
                })(<Input />)}
          </FormItem>

          <FormItem
            {...formItemLayout}
            label={intl.get('spfm.enterprise.model.invoice.bankAccountNum').d('开户行账号')}
          >
            {statusNotPendingReject
              ? invoiceInfo.bankAccountNum
              : getFieldDecorator('bankAccountNum', {
                  initialValue: invoiceInfo.bankAccountNum,
                  // rules: [
                  //   {
                  //     required: true,
                  //     message: intl.get('hzero.common.validation.notNull', {
                  //       name: intl.get('spfm.enterprise.model.invoice.bankAccountNum').d('开户行账号'),
                  //     }),
                  //   },
                  // ],
                })(<Input style={{ width: '240px' }} />)}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={intl
              .get('spfm.enterprise.model.invoice.taxRegistrationAddress')
              .d('税务登记地址')}
          >
            {statusNotPendingReject
              ? invoiceInfo.taxRegistrationAddress
              : getFieldDecorator('taxRegistrationAddress', {
                  initialValue: invoiceInfo.taxRegistrationAddress,
                  // rules: [
                  //   {
                  //     required: true,
                  //     message: intl.get('hzero.common.validation.notNull', {
                  //       name: intl
                  //         .get('spfm.enterprise.model.invoice.taxRegistrationAddress')
                  //         .d('税务登记地址'),
                  //     }),
                  //   },
                  // ],
                })(<Input />)}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={intl.get('spfm.enterprise.model.invoice.taxRegistrationPhone').d('税务登记电话')}
          >
            {statusNotPendingReject
              ? invoiceInfo.taxRegistrationPhone
              : getFieldDecorator('taxRegistrationPhone', {
                  initialValue: invoiceInfo.taxRegistrationPhone,
                  // rules: [
                  //   {
                  //     required: true,
                  //     message: intl.get('hzero.common.validation.notNull', {
                  //       name: intl
                  //         .get('spfm.enterprise.model.invoice.taxRegistrationPhone')
                  //         .d('税务登记电话'),
                  //     }),
                  //   },
                  // ],
                })(<Input style={{ width: '180px' }} />)}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={intl.get('spfm.enterprise.model.invoice.receiveMail').d('收票人邮箱')}
          >
            {statusNotPendingReject
              ? invoiceInfo.receiveMail
              : getFieldDecorator('receiveMail', {
                  initialValue: invoiceInfo.receiveMail,
                  rules: [
                    // {
                    //   required: true,
                    //   message: intl.get('hzero.common.validation.notNull', {
                    //     name: intl.get('spfm.enterprise.model.invoice.receiveMail').d('收票人邮箱'),
                    //   }),
                    // },
                    {
                      pattern: EMAIL,
                      message: intl.get('hzero.common.validation.email').d('邮箱格式不正确'),
                    },
                  ],
                })(<Input style={{ width: '200px' }} />)}
          </FormItem>
          {getFieldDecorator('objectVersionNumber', {
            initialValue: invoiceInfo.objectVersionNumber,
          })(<div />)}
          <FormItem
            {...formItemLayout}
            label={intl.get('spfm.enterprise.model.invoice.receivePhone').d('收票人手机号')}
          >
            {statusNotPendingReject
              ? invoiceInfo.receivePhone
              : getFieldDecorator('receivePhone', {
                  initialValue: invoiceInfo.receivePhone,
                  rules: [
                    // {
                    //   required: true,
                    //   message: intl.get('hzero.common.validation.notNull', {
                    //     name: intl.get('spfm.enterprise.model.invoice.receivePhone').d('收票人手机号'),
                    //   }),
                    // },
                    {
                      pattern: NOT_CHINA_PHONE,
                      message: intl.get('hzero.common.validation.phone').d('手机格式不正确'),
                    },
                  ],
                })(<Input style={{ width: '180px' }} />)}
          </FormItem>
          <FormItem {...submitFormLayout} style={{ marginTop: 40, textAlign: 'right' }}>
            {previousCallback && (
              <Button
                type="primary"
                ghost
                onClick={this.handlePrevious}
                style={{ marginRight: 16 }}
              >
                {backBtnText}
              </Button>
            )}
            {statusNotPendingReject ? (
              ''
            ) : (
              <Button type="primary" onClick={this.saveAndNext} loading={updating || saving}>
                {buttonText}
              </Button>
            )}
          </FormItem>
        </Form>
      </Spin>
    );
  }
}
