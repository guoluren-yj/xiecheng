import React, { PureComponent } from 'react';
import { Form, Input, DatePicker, Modal, Row, Col } from 'hzero-ui';
import moment from 'moment';
import { isEmpty } from 'lodash';
import BigNumber from 'bignumber.js';
import { Bind } from 'lodash-decorators';

import Lov from 'components/Lov';
import Switch from 'components/Switch';

import { getDateFormat } from 'utils/utils';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import intl from 'utils/intl';

const FormItem = Form.Item;
const formLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
};
@Form.create({ fieldNameProp: null })
export default class RateForm extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      rateMethodCode: '',
    };
  }
  // eslint-disable-next-line
  UNSAFE_componentWillReceiveProps(nextProps) {
    const { modalVisible } = nextProps;
    if (!modalVisible) {
      this.setState({
        rateMethodCode: '',
      });
    }
  }

  // 保存
  @Bind()
  saveBtn() {
    const { form, onHandleAdd } = this.props;
    form.validateFields((err, values) => {
      if (isEmpty(err)) {
        onHandleAdd(values);
      }
    });
  }

  render() {
    const {
      form,
      initData,
      title,
      anchor,
      modalVisible,
      onCancel,
      confirmLoading,
      customizeForm,
    } = this.props;
    const { getFieldDecorator } = form;
    const { rateMethodCode } = this.state;
    const {
      fromCurrencyCode,
      fromCurrencyName,
      toCurrencyCode,
      toCurrencyName,
      rateTypeCode,
      rateTypeName,
      rateDate,
      rate,
      enabledFlag = 1,
    } = initData;
    // const validStartDate = (_, date, callback) => {
    //   const end = form.getFieldsValue().endDate;
    //   const start = moment(date).format('YYYY-MM-DD');
    //   if (!!end && start > moment(end).format('YYYY-MM-DD')) {
    //     callback(
    //       intl.get('hzero.common.validation.date.after', {
    //         startDate: intl.get('smdm.rateOrg.modal.rateOrg.endDate').d('结束时间'),
    //         endDate: intl.get('smdm.rateOrg.modal.rateOrg.startDate').d('起始时间'),
    //       })
    //     );
    //   } else {
    //     callback();
    //   }
    // };
    // const validDate = (_, date, callback) => {
    //   const start = form.getFieldsValue().startDate;
    //   const end = moment(date).format('YYYY-MM-DD');
    //   if (!!start && end < moment(start).format('YYYY-MM-DD')) {
    //     callback(intl.get('smdm.rateOrg.view.validation.data').d('结束时间不能早于起始时间'));
    //   } else {
    //     callback();
    //   }
    // };
    return (
      <Modal
        destroyOnClose
        title={title}
        width={520}
        wrapClassName={`ant-modal-sidebar-${anchor}`}
        transitionName={`move-${anchor}`}
        visible={modalVisible}
        onOk={this.saveBtn}
        onCancel={onCancel}
        confirmLoading={confirmLoading}
        okText={intl.get('hzero.common.button.sure').d('确定')}
        cancelText={intl.get('hzero.common.button.cancel').d('取消')}
      >
        {customizeForm(
          {
            code: 'SMDM_RATE.EDIT_FORM',
            form,
            dataSource: initData,
          },
          <Form>
            <Row>
              <Col span={24}>
                <FormItem
                  {...formLayout}
                  label={intl.get('smdm.rateOrg.modal.rateOrg.fromCurrencyCode').d('币种代码')}
                >
                  {getFieldDecorator('fromCurrencyCode', {
                    initialValue: fromCurrencyCode,
                    rules: [
                      {
                        type: 'string',
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get('smdm.rateOrg.modal.rateOrg.fromCurrencyCode')
                            .d('币种代码'),
                        }),
                      },
                      {
                        validator: (rule, value, callback) => {
                          if (value && form.getFieldValue('toCurrencyCode') === value) {
                            callback(
                              new Error(
                                intl
                                  .get('smdm.rateOrg.view.validation.notSame')
                                  .d('不能选择相同的币种代码')
                              )
                            );
                          } else {
                            callback();
                          }
                        },
                      },
                    ],
                  })(
                    <Lov
                      disabled={!!fromCurrencyCode}
                      textValue={initData.fromCurrencyCode || ''}
                      code="SMDM.TENANT_CURRENCY"
                      queryParams={{ enabledFlag: '1' }}
                      lovOptions={{ displayField: 'currencyCode' }}
                      onChange={(text, record) => {
                        form.setFieldsValue({ fromCurrencyName: record && record.currencyName });
                      }}
                    />
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <FormItem
                  {...formLayout}
                  label={intl.get('smdm.rateOrg.modal.rateOrg.fromCurrencyName').d('币种名称')}
                >
                  {getFieldDecorator('fromCurrencyName', {
                    initialValue: fromCurrencyName,
                    rules: [
                      {
                        type: 'string',
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get('smdm.rateOrg.modal.rateOrg.fromCurrencyName')
                            .d('币种名称'),
                        }),
                      },
                    ],
                  })(<Input disabled />)}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <FormItem
                  {...formLayout}
                  label={intl.get('smdm.rateOrg.modal.rateOrg.toCurrencyCode').d('兑换币种代码')}
                >
                  {getFieldDecorator('toCurrencyCode', {
                    initialValue: toCurrencyCode,
                    rules: [
                      {
                        type: 'string',
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get('smdm.rateOrg.modal.rateOrg.toCurrencyCode')
                            .d('兑换币种代码'),
                        }),
                      },
                      {
                        validator: (rule, value, callback) => {
                          if (value && form.getFieldValue('fromCurrencyCode') === value) {
                            callback(
                              new Error(
                                intl
                                  .get('smdm.rateOrg.view.validation.notSame')
                                  .d('不能选择相同的币种代码')
                              )
                            );
                          } else {
                            callback();
                          }
                        },
                      },
                    ],
                  })(
                    <Lov
                      disabled={!!toCurrencyCode}
                      textValue={toCurrencyCode}
                      code="SMDM.TENANT_CURRENCY"
                      queryParams={{ enabledFlag: '1' }}
                      lovOptions={{ displayField: 'currencyCode' }}
                      onChange={(text, record) => {
                        form.setFieldsValue({ toCurrencyName: record.currencyName });
                      }}
                    />
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <FormItem
                  {...formLayout}
                  label={intl.get('smdm.rateOrg.modal.rateOrg.toCurrencyName').d('兑换币种名称')}
                >
                  {getFieldDecorator('toCurrencyName', {
                    initialValue: toCurrencyName,
                    rules: [
                      {
                        type: 'string',
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get('smdm.rateOrg.modal.rateOrg.toCurrencyName')
                            .d('兑换币种名称'),
                        }),
                      },
                    ],
                  })(<Input disabled />)}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <FormItem
                  {...formLayout}
                  label={intl.get('smdm.rateOrg.modal.rateOrg.rateTypeName').d('汇率类型')}
                >
                  {getFieldDecorator('rateTypeCode', {
                    initialValue: rateTypeCode,
                    rules: [
                      {
                        type: 'string',
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get('smdm.rateOrg.modal.rateOrg.rateTypeName').d('汇率类型'),
                        }),
                      },
                    ],
                  })(
                    <Lov
                      allowClear={false}
                      disabled={!!rateTypeCode}
                      queryParams={{ enabledFlag: '1' }}
                      textValue={rateTypeName}
                      code="SMDM.EXCHANGE_RATE_TYPE"
                      onChange={(text, record) => {
                        this.setState({
                          rateMethodCode: record.rateMethodCode,
                        });
                      }}
                    />
                  )}
                </FormItem>
              </Col>
            </Row>
            {form.getFieldValue('rateTypeCode') === 'Current Rate' ? (
              <Row>
                <Col span={24}>
                  <FormItem
                    {...formLayout}
                    label={intl.get('smdm.rateOrg.modal.rateOrg.rateValue').d('汇率')}
                  >
                    {getFieldDecorator('rateValue', {
                      rules: [
                        {
                          type: 'string',
                          required: true,
                          message: intl.get('hzero.common.validation.notNull', {
                            name: intl.get('smdm.rateOrg.modal.rateOrg.rateValue').d('汇率'),
                          }),
                        },
                      ],
                    })(<Input disabled />)}
                  </FormItem>
                </Col>
              </Row>
            ) : (
              ''
            )}
            {rateDate && (
              <Row>
                <Col span={24}>
                  <FormItem
                    {...formLayout}
                    label={intl.get('smdm.rateOrg.modal.rateOrg.rateDate').d('兑换日期')}
                  >
                    {getFieldDecorator('rateDate', {
                      initialValue: rateDate ? moment(rateDate, DEFAULT_DATE_FORMAT) : '',
                    })(
                      <DatePicker
                        placeholder=""
                        style={{ width: '100%' }}
                        disabled
                        format={getDateFormat()}
                      />
                    )}
                  </FormItem>
                </Col>
              </Row>
            )}
            {rateMethodCode === 'FR' ? (
              <Row>
                <Col span={24}>
                  <FormItem
                    {...formLayout}
                    label={intl.get('smdm.rateOrg.modal.rateOrg.startDate').d('起始时间')}
                  >
                    {getFieldDecorator('startDate', {
                      initialValue: rateDate ? moment(rateDate, DEFAULT_DATE_FORMAT) : null,
                      rules: [
                        {
                          type: 'object',
                          required: true,
                          message: intl.get('hzero.common.validation.notNull', {
                            name: intl.get('smdm.rateOrg.modal.rateOrg.startDate').d('起始时间'),
                          }),
                        },
                      ],
                    })(
                      <DatePicker
                        placeholder=""
                        style={{ width: '100%' }}
                        disabledDate={(current) => {
                          return (
                            (current &&
                              moment(current).subtract(-1, 'days') < moment().endOf('day')) ||
                            (form.getFieldValue('endDate') &&
                              moment(form.getFieldValue('endDate')).isBefore(current, 'day')) ||
                            (form.getFieldValue('endDate') &&
                              moment(form.getFieldValue('endDate'))
                                .subtract(-2, 'y')
                                .isAfter(current, 'day'))
                          );
                        }}
                        disabled={
                          form.getFieldValue('rateTypeCode') === 'Current Rate' || !!rateDate
                        }
                        format={getDateFormat()}
                      />
                    )}
                  </FormItem>
                </Col>
              </Row>
            ) : (
              ''
            )}
            {rateMethodCode === 'FR' && (
              <Row>
                <Col span={24}>
                  <FormItem
                    {...formLayout}
                    label={intl.get('smdm.rateOrg.modal.rateOrg.endDate').d('结束时间')}
                  >
                    {getFieldDecorator('endDate', {
                      initialValue: rateDate ? moment(rateDate, DEFAULT_DATE_FORMAT) : null,
                      rules: [
                        {
                          type: 'object',
                          required: true,
                          message: intl.get('hzero.common.validation.notNull', {
                            name: intl.get('smdm.rateOrg.modal.rateOrg.endDate').d('结束时间'),
                          }),
                        },
                        // {
                        //   validator: validDate,
                        // },
                      ],
                    })(
                      <DatePicker
                        placeholder=""
                        style={{ width: '100%' }}
                        disabled={
                          form.getFieldValue('rateTypeCode') === 'Current Rate' || !!rateDate
                        }
                        disabledDate={(current) => {
                          return (
                            form.getFieldValue('startDate') &&
                            (moment(form.getFieldValue('startDate')).isAfter(current, 'day') ||
                              moment(form.getFieldValue('startDate'))
                                .add(2, 'y')
                                .isBefore(current, 'day'))
                          );
                        }}
                        format={getDateFormat()}
                      />
                    )}
                  </FormItem>
                </Col>
              </Row>
            )}
            <Row>
              <Col span={24}>
                <FormItem
                  {...formLayout}
                  label={intl.get('smdm.rateOrg.modal.rateOrg.currencyNumber').d('货币数量')}
                >
                  {getFieldDecorator('currencyNumber', {
                    initialValue: rate ? '1' : '',
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get('smdm.rateOrg.modal.rateOrg.currencyNumber').d('货币数量'),
                        }),
                      },
                      {
                        pattern: /^[0-9]+?$/, // 匹配整数
                        message: intl.get('smdm.rateOrg.view.validation.integer').d('只能输入整数'),
                      },
                      {
                        validator: (_, value, callback) => {
                          if (value) {
                            if (value.split('.')[0].length > 20) {
                              callback(
                                intl
                                  .get(`smdm.rateOrg.message.integerToolong`)
                                  .d('整数位必须小于20位')
                              );
                            } else if (value.split('.')[1]?.length > 10) {
                              callback(
                                intl
                                  .get(`smdm.rateOrg.message.decimalToolong`)
                                  .d('小数位必须小于10位')
                              );
                            } else {
                              callback();
                            }
                          } else {
                            callback();
                          }
                        },
                      },
                    ],
                  })(<Input />)}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <FormItem
                  {...formLayout}
                  label={intl.get('smdm.rateOrg.modal.rateOrg.exchangeNumber').d('兑换数量')}
                >
                  {getFieldDecorator('exchangeNumber', {
                    initialValue: rate ? BigNumber(rate).toFixed(10) : '',
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get('smdm.rateOrg.modal.rateOrg.exchangeNumber').d('兑换数量'),
                        }),
                      },
                      {
                        pattern: /^[0-9]+(\.?[0-9]+)?$/, // 匹配整数或者小数
                        message: intl.get('smdm.rateOrg.view.validation.digital').d('只能输入数字'),
                      },
                      {
                        validator: (_, value, callback) => {
                          if (value) {
                            if (value.split('.')[0].length > 20) {
                              callback(
                                intl
                                  .get(`smdm.rateOrg.message.integerToolong`)
                                  .d('整数位必须小于20位')
                              );
                            } else if (value.split('.')[1]?.length > 10) {
                              callback(
                                intl
                                  .get(`smdm.rateOrg.message.decimalToolong`)
                                  .d('小数位必须小于10位')
                              );
                            } else {
                              callback();
                            }
                          } else {
                            callback();
                          }
                        },
                      },
                    ],
                  })(<Input />)}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <FormItem {...formLayout} label={intl.get('hzero.common.status.enable').d('启用')}>
                  {getFieldDecorator('enabledFlag', {
                    initialValue: enabledFlag,
                  })(<Switch />)}
                </FormItem>
              </Col>
            </Row>
          </Form>
        )}
      </Modal>
    );
  }
}
