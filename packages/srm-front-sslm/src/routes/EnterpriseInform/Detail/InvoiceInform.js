/**
 * InvoiceInform - 开票信息
 * @date: 2019-10-31
 * @author: LXM <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */

import React, { Component } from 'react';
import { Row, Col, Input, Form, Spin } from 'hzero-ui';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { EMAIL, NOT_CHINA_PHONE, PHONE } from 'utils/regExp';
import GlobalPhone from '@/routes/components/GlobalPhone';

const FormItem = Form.Item;
const { TextArea } = Input;
@connect(({ enterpriseInform, loading }) => ({
  enterpriseInform,
  queryLoading: loading.effects[`enterpriseInform/queryPlatformInvoice`],
}))
@Form.create({ fieldNameProp: null })
export default class InvoiceInform extends Component {
  constructor(props) {
    super(props);
    this.state = {
      platformInvoice: {},
    };
  }

  componentDidMount() {
    const { onRef } = this.props;
    if (onRef) onRef(this);
    this.queryPlatformInvoice();
  }

  /**
   * 校验数据
   */
  @Bind()
  checkData() {
    const {
      form: { validateFieldsAndScroll },
      source = '',
      isSubdomainsRegister = '',
    } = this.props;
    const { platformInvoice } = this.state;
    let invoiceReq = null;
    validateFieldsAndScroll((err, fieldsValue) => {
      if (err) {
        invoiceReq = null; // 校验不通过置空
        if (source === 'supplier') {
          // 供应商信息变更：只在单据类型为协同时提示以下信息
          if (isSubdomainsRegister === 0) {
            notification.warning({
              message: intl
                .get(`sslm.enterpriseInform.view.message.warn.synergyInvoiceWarn`)
                .d('根据采购方要求开票信息为必填项，请联系供应商进行平台级企业信息变更维护信息'),
            });
          } else {
            notification.warning({
              message: intl
                .get(`sslm.enterpriseInform.view.message.warn.uncoordinatedWarn`)
                .d('根据采购方要求开票信息为必填项，请继续完善信息'),
            });
          }
        } else {
          // 企业信息变更
          notification.warning({
            message: intl
              .get(`sslm.enterpriseInform.view.message.warn.invoiceWarn`)
              .d('根据采购方要求开票信息为必填项，请进行平台级企业信息变更维护发票信息'),
          });
        }
      } else {
        // 取个性化字段的值
        const cusFiled = fieldsValue;
        invoiceReq = {
          ...platformInvoice,
          ...cusFiled,
        };
      }
    });
    return invoiceReq;
  }

  /**
   * 查询平台级
   */
  @Bind()
  queryPlatformInvoice() {
    const {
      dispatch,
      changeReqId,
      companyId,
      supplierCompanyId,
      supplierFlag,
      source = '',
      customizeUnitCode,
      customizeTenantId = null,
    } = this.props;
    dispatch({
      type: 'enterpriseInform/queryPlatformInvoice',
      payload: {
        changeReqId,
        companyId,
        supplierCompanyId,
        supplierFlag,
        dataSource: source === 'enterprise' ? 1 : 2, // 1企业信息变更 2供应商信息变更
        customizeUnitCode,
        customizeTenantId,
        desensitize: false,
      },
    }).then(res => {
      if (res) {
        this.setState({ platformInvoice: res });
      }
    });
  }

  render() {
    const {
      form,
      pubEdit,
      custLoading,
      form: { getFieldDecorator, getFieldValue },
      queryLoading,
      changFlag,
      isEdit = false,
      customizeForm,
      customizeUnitCode,
      supplierFlag,
      source = '',
      // mustCompanyTab = '',
      savePermissionFlag = true,
      domesticForeignRelation,
    } = this.props;
    const { platformInvoice } = this.state;
    const formItemLayout = {
      labelCol: { span: 9 },
      wrapperCol: { span: 15 },
    };
    const disableFlag =
      changFlag || isEdit || (supplierFlag && source === 'enterprise') || !savePermissionFlag;
    const requiredFlag = false;
    // supplierFlag &&
    // (source === 'enterprise' || source === 'supplier') &&
    // mustCompanyTab.includes('INVOICE');

    return (
      <Spin spinning={queryLoading}>
        {customizeForm(
          {
            code: customizeUnitCode,
            form,
            dataSource: platformInvoice,
            readOnly: pubEdit ? false : disableFlag,
          },
          <Form>
            <Row gutter={48} className="writable-row" custLoading={custLoading}>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl
                    .get('sslm.enterpriseInform.view.model.invoice.invoiceHeader')
                    .d('发票头')}
                >
                  {getFieldDecorator('invoiceHeader', {
                    initialValue: platformInvoice.invoiceHeader,
                    rules: [
                      {
                        required: !disableFlag,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get('sslm.enterpriseInform.view.model.invoice.invoiceHeader')
                            .d('发票头'),
                        }),
                      },
                    ],
                  })(<Input dbc2sbc={false} disabled={disableFlag} />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl
                    .get('sslm.enterpriseInform.view.model.invoice.taxNumber')
                    .d('税务登记号')}
                >
                  {getFieldDecorator('taxRegistrationNumber', {
                    initialValue: platformInvoice.taxRegistrationNumber,
                    rules: [
                      {
                        required: !disableFlag && domesticForeignRelation === 1,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get('sslm.enterpriseInform.view.model.invoice.taxNumber')
                            .d('税务登记号'),
                        }),
                      },
                    ],
                  })(<Input disabled={disableFlag} />)}
                </FormItem>
              </Col>
            </Row>
            <Row gutter={48} className="writable-row">
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl
                    .get('sslm.enterpriseInform.view.model.invoice.depositBank')
                    .d('开户行')}
                >
                  {getFieldDecorator('depositBank', {
                    initialValue: platformInvoice.depositBank,
                    rules: [
                      {
                        required: requiredFlag,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get('sslm.enterpriseInform.view.model.invoice.depositBank')
                            .d('开户行'),
                        }),
                      },
                    ],
                  })(<Input disabled={disableFlag} />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl
                    .get('sslm.enterpriseInform.view.model.invoice.bankAccountNum')
                    .d('开户行账号')}
                >
                  {getFieldDecorator('bankAccountNum', {
                    initialValue: platformInvoice.bankAccountNum,
                    rules: [
                      {
                        required: requiredFlag,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get('sslm.enterpriseInform.view.model.invoice.bankAccountNum')
                            .d('开户行账号'),
                        }),
                      },
                    ],
                  })(<Input disabled={disableFlag} />)}
                </FormItem>
              </Col>
            </Row>
            <Row gutter={48} className="half-row">
              <Col span={12}>
                <FormItem
                  label={intl
                    .get('sslm.enterpriseInform.view.model.invoice.taxAddress')
                    .d('税务登记地址')}
                >
                  {getFieldDecorator('taxRegistrationAddress', {
                    initialValue: platformInvoice.taxRegistrationAddress,
                    rules: [
                      {
                        required: requiredFlag,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get('sslm.enterpriseInform.view.model.invoice.taxAddress')
                            .d('税务登记地址'),
                        }),
                      },
                    ],
                  })(<TextArea rows={2} style={{ resize: 'none' }} disabled={disableFlag} />)}
                </FormItem>
              </Col>
            </Row>
            <Row gutter={48} className="writable-row">
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl
                    .get('sslm.enterpriseInform.view.model.invoice.taxPhone')
                    .d('税务登记电话')}
                >
                  {getFieldDecorator('taxRegistrationPhone', {
                    initialValue: platformInvoice.taxRegistrationPhone,
                    rules: [
                      {
                        required: !disableFlag && requiredFlag,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get('sslm.enterpriseInform.view.model.invoice.taxPhone')
                            .d('税务登记电话'),
                        }),
                      },
                    ],
                  })(<Input inputChinese={false} disabled={disableFlag} />)}
                </FormItem>
              </Col>
            </Row>
            <Row gutter={48} className="writable-row">
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get('sslm.common.model.invoice.taker').d('收票人')}
                >
                  {getFieldDecorator('receiver', {
                    initialValue: platformInvoice.receiver,
                  })(<Input disabled={changFlag || !savePermissionFlag} />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl
                    .get('sslm.enterpriseInform.view.model.invoice.receiveMail')
                    .d('收票人邮箱')}
                >
                  {getFieldDecorator('receiveMail', {
                    initialValue: platformInvoice.receiveMail,
                    rules: [
                      {
                        required: requiredFlag,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get('sslm.enterpriseInform.view.model.invoice.receiveMail')
                            .d('收票人邮箱'),
                        }),
                      },
                      {
                        pattern: EMAIL,
                        message: intl.get('hzero.common.validation.email').d('邮箱格式不正确'),
                      },
                    ],
                  })(<Input disabled={changFlag || !savePermissionFlag} />)}
                </FormItem>
              </Col>
            </Row>
            <Row gutter={48} className="half-row">
              <Col span={12}>
                <FormItem
                  label={intl
                    .get('sslm.enterpriseInform.view.model.invoice.receivePhone')
                    .d('收票人手机号')}
                >
                  {getFieldDecorator('receivePhone', {
                    initialValue: platformInvoice.receivePhone,
                    rules: [
                      {
                        required: requiredFlag,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get('sslm.enterpriseInform.view.model.invoice.receivePhone')
                            .d('收票人手机号'),
                        }),
                      },
                      {
                        pattern:
                          getFieldValue('internationalTelCode') === '+86' ? PHONE : NOT_CHINA_PHONE,
                        message: intl.get('hzero.common.validation.phone').d('手机格式不正确'),
                      },
                    ],
                  })(
                    <GlobalPhone
                      form={form}
                      disabled={changFlag || !savePermissionFlag}
                      phoneField="receivePhone"
                      telCodeField="internationalTelCode"
                      initialValue={platformInvoice.internationalTelCode}
                    />
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row gutter={48} className="half-row">
              <Col span={12}>
                <FormItem label={intl.get('sslm.common.model.invoice.ticketAddress').d('收票地址')}>
                  {getFieldDecorator('receiveAddress', {
                    initialValue: platformInvoice.receiveAddress,
                  })(
                    <TextArea
                      disabled={changFlag || !savePermissionFlag}
                      style={{ resize: 'none' }}
                    />
                  )}
                </FormItem>
              </Col>
            </Row>
          </Form>
        )}
      </Spin>
    );
  }
}
