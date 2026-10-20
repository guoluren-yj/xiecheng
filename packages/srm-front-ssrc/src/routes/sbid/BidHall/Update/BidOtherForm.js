/**
 * bidHall - 寻源服务/招标维护 - 其他信息表单
 * @date: 2019-06-27
 * @author: zoukang <kang.zou@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Form, Row, Col, Input, Select } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { map, isNil } from 'lodash';
import Lov from 'components/Lov';
import Checkbox from 'components/Checkbox';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { getCurrentUser } from 'utils/utils';
import { EDIT_FORM_ITEM_LAYOUT } from 'utils/constants';
import { EMAIL, NOT_CHINA_PHONE, PHONE } from 'utils/regExp';

import PrecisionInputNumber from '@/routes/components/Precision/PrecisionInputNumber';

const FormItem = Form.Item;

@Form.create({ fieldNameProp: null })
@formatterCollections({ code: ['ssrc.bidHall'] })
export default class BidOtherForm extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  /**
   * 保证金字段失焦
   * @param {Object} event - 事件源 (InputNumber在失焦后, 自动格式化value, 所以需要重写此方法)
   */
  @Bind()
  handleRfxBondBlur(event, field) {
    const { form } = this.props;
    const {
      target: { value },
    } = event;
    if (!isNil(value) && value !== '' && Number(value) === 0) {
      form.setFieldsValue({ [field]: intl.get(`ssrc.bidHall.model.bidHall.free`).d('免费') });
    }
  }

  @Bind()
  changePaymentTermId(record) {
    const {
      form: { setFieldsValue },
    } = this.props;
    setFieldsValue({
      paymentTerm: record.termName,
    });
  }

  /**
   * 区号改变 需要 重置手机号的校验状态
   */
  @Bind()
  reValidationPhone(value) {
    const { form } = this.props;
    const prevInternationalTelCode = form.getFieldValue('internationalTelCode');
    if (value === '+86' || prevInternationalTelCode === '+86') {
      // 只要 +86 出现在 中间态 就需要重新手动校验 phone
      const curPhone = form.getFieldValue('purPhone');
      let errors = null;
      if (curPhone) {
        const testReg = value === '+86' ? PHONE : NOT_CHINA_PHONE;
        if (!testReg.test(curPhone)) {
          errors = [new Error(intl.get('hzero.common.validation.phone').d('手机格式不正确'))];
        }
        form.setFields({
          purPhone: {
            value: curPhone,
            errors,
          },
        });
      }
    }
  }

  // 对数字框格式化
  @Bind()
  bidBoundFormatter(value = null) {
    const isZero = !isNil(value) && value !== '' && Number(value) === 0;
    const FREE = intl.get(`ssrc.bidHall.model.bidHall.free`).d('免费');
    if (isZero) {
      return FREE;
    }
    return value;
  }

  render() {
    const {
      idd = [],
      form,
      customizeForm,
      form: { getFieldDecorator, getFieldValue },
      header,
      organizationId,
      changeBidSourcePlan,
      changeProjectInfo,
      setValue,
      changePaymentType,
    } = this.props;
    return customizeForm(
      { code: 'SSRC.BID_HALL_EDIT.OTHER.INFO', form, dataSource: header },
      <Form className="writable-row-custom">
        <React.Fragment>
          <FormItem style={{ display: 'none' }}>
            {getFieldDecorator('bidPlanLineName', {
              initialValue: header.bidPlanLineName,
            })(<div />)}
          </FormItem>
          <FormItem style={{ display: 'none' }}>
            {getFieldDecorator('projectNum', {
              initialValue: header.projectNum,
            })(<div />)}
          </FormItem>
          <FormItem style={{ display: 'none' }}>
            {getFieldDecorator('currencyId', {
              initialValue: header.currencyId,
            })(<Input />)}
          </FormItem>
          <FormItem style={{ display: 'none' }}>
            {getFieldDecorator('paymentTypeName', {
              initialValue: header.paymentTypeName,
            })(<div />)}
          </FormItem>
          <FormItem style={{ display: 'none' }}>
            {getFieldDecorator('paymentTerm', { initialValue: header.paymentTerm })(<div />)}
          </FormItem>
        </React.Fragment>
        <Row gutter={48}>
          <Col span={8}>
            <FormItem
              label={intl.get(`ssrc.bidHall.model.bidHall.bidPlanName`).d('寻源计划')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('bidPlanId', {
                initialValue: header.bidPlanId,
              })(
                <Lov
                  code="SSRC.SOURCE_PLAN"
                  queryParams={{
                    tenantId: organizationId,
                    companyId: header.companyId,
                  }}
                  textField="bidPlanLineName"
                  onChange={(val, record) => changeBidSourcePlan(val, record)}
                  disabled={!getFieldDecorator('bidPlanId')}
                />
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label={intl.get(`ssrc.bidHall.model.bidHall.projectNum`).d('项目编码')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('projectId', {
                initialValue: header.projectId,
              })(
                <Lov
                  code="SSRC.PROJECT"
                  textField="projectNum"
                  queryParams={{
                    tenantId: header.tenantId,
                    companyId: header.companyId,
                  }}
                  onChange={(val, record) => changeProjectInfo(val, record)}
                  disabled={getFieldValue('bidPlanId') && getFieldValue('bidPlanLineName')}
                />
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label={intl.get(`ssrc.bidHall.model.bidHall.projectName`).d('项目名称')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('projectName', {
                initialValue: header.projectName,
              })(<Input disabled />)}
            </FormItem>
          </Col>
        </Row>

        <Row gutter={48}>
          <Col span={8}>
            <FormItem
              label={intl.get(`ssrc.bidHall.model.bidHall.bidLocation`).d('项目地点')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('bidLocation', {
                initialValue: header.bidLocation,
              })(<Input maxLength={30} />)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label={intl.get(`ssrc.bidHall.model.bidHall.currencyType`).d('币种')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('currencyCode', {
                initialValue: header.currencyCode,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`ssrc.bidHall.model.bidHall.currencyType`).d('币种'),
                    }),
                  },
                ],
              })(
                <Lov
                  code="SMDM.EXCHANGE_RATE.CURRENCY"
                  textValue={header.currencyCode}
                  onChange={(val, record) => setValue(val, record)}
                />
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label={intl.get('ssrc.bidHall.model.bidHall.allowMuitiCurQuo').d('允许多币种报价')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('multiCurrencyFlag', {
                initialValue: header.multiCurrencyFlag,
              })(<Checkbox />)}
            </FormItem>
          </Col>
        </Row>

        <Row gutter={48}>
          <Col span={8}>
            <FormItem
              label={intl.get(`ssrc.bidHall.model.bidHall.roundNumber`).d('轮次')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('roundNumber', {
                initialValue: header.roundNumber,
              })(<Input disabled />)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label={intl.get(`hzero.common.components.dataAudit.version`).d('版本')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('versionNumber', {
                initialValue: header.versionNumber,
              })(<Input disabled />)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label={intl.get(`ssrc.bidHall.model.bidHall.creationDate`).d('创建时间')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('creationDate', {
                initialValue: header.creationDate,
              })(<Input disabled />)}
            </FormItem>
          </Col>
        </Row>

        <Row gutter={48}>
          <Col span={8}>
            <FormItem
              label={intl.get(`ssrc.bidHall.model.bidHall.paymentTypeId`).d('付款方式')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('paymentTypeId', {
                initialValue: header.paymentTypeId,
              })(
                <Lov
                  code="SMDM.PAYMENTTYPE"
                  onChange={(val, record) => changePaymentType(val, record)}
                  queryParams={{
                    paymentTypeId: 'paymentTypeId',
                  }}
                  textValue={header.paymentTypeName}
                />
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label={intl.get(`ssrc.bidHall.model.bidHall.paymentTerm`).d('付款条款')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('paymentTermId', {
                initialValue: header.paymentTermId,
              })(
                <Lov
                  textValue={header.paymentTerm}
                  code="SMDM.PAYMENT.TERM"
                  onChange={(_, record) => this.changePaymentTermId(record)}
                />
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label={intl.get(`ssrc.bidHall.model.bidHall.bidOpenLocation`).d('开标地点')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('bidOpenLocation', {
                initialValue: header.bidOpenLocation,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`ssrc.bidHall.model.bidHall.bidOpenLocation`).d('开标地点'),
                    }),
                  },
                ],
              })(<Input />)}
            </FormItem>
          </Col>
        </Row>

        <Row gutter={48}>
          <Col span={8}>
            <FormItem
              label={intl.get(`ssrc.bidHall.model.bidHall.purchasingContact`).d('采购联系人')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('purName', {
                initialValue: header.purName || getCurrentUser().realName,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`ssrc.bidHall.model.bidHall.purName`).d('采购联系人'),
                    }),
                  },
                ],
              })(<Input />)}
            </FormItem>
          </Col>
          <Col span={8}>
            <Form.Item
              label={intl.get(`ssrc.bidHall.model.bidHall.contactPhone`).d('联系人电话')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {form.getFieldDecorator('purPhone', {
                initialValue: header.purPhone || getCurrentUser().phone,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`ssrc.bidHall.model.bidHall.contactPhone`).d('联系人电话'),
                    }),
                  },
                  {
                    pattern:
                      form.getFieldValue('internationalTelCode') === '+86'
                        ? PHONE
                        : NOT_CHINA_PHONE,
                    message: intl.get('hzero.common.validation.phone').d('手机格式不正确'),
                  },
                ],
              })(
                <Input
                  addonBefore={form.getFieldDecorator('internationalTelCode', {
                    initialValue: (idd[0] && idd[0].value) || getCurrentUser().internationalTelCode,
                  })(
                    <Select onChange={this.reValidationPhone}>
                      {map(idd, (r) => (
                        <Select.Option key={r.value} value={r.value}>
                          {r.meaning}
                        </Select.Option>
                      ))}
                    </Select>
                  )}
                />
              )}
            </Form.Item>
          </Col>
          <Col span={8}>
            <FormItem
              label={intl.get(`ssrc.bidHall.model.bidHall.contactMail`).d('联系人邮箱')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('purEmail', {
                initialValue: header.purEmail || getCurrentUser().email,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`ssrc.bidHall.model.bidHall.contactMail`).d('联系人邮箱'),
                    }),
                  },
                  {
                    pattern: EMAIL,
                    message: intl.get(`hzero.common.validation.email`).d('邮箱格式不正确'),
                  },
                ],
              })(<Input />)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48}>
          <Col span={8}>
            <FormItem
              label={intl.get(`ssrc.bidHall.model.bidHall.bidFileExpense`).d('招标文件费(元)')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('bidFileExpense', {
                initialValue:
                  header.bidFileExpense || intl.get(`ssrc.bidHall.model.bidHall.free`).d('免费'),
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`ssrc.bidHall.model.bidHall.bidFileExpense`)
                        .d('招标文件费(元)'),
                    }),
                  },
                ],
              })(
                <PrecisionInputNumber
                  type="hzero"
                  financial={form.getFieldValue('currencyCode')}
                  formatter={this.bidBoundFormatter}
                  onBlur={(e) => this.handleRfxBondBlur(e, 'bidFileExpense')}
                  min={0}
                  max="99999999999999999999"
                  style={{ width: '100%' }}
                />
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label={`${intl.get(`ssrc.bidHall.model.bidHall.bidBond`).d('保证金(元)')}`}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('bidBond', {
                initialValue:
                  header.bidBond || intl.get(`ssrc.bidHall.model.bidHall.free`).d('免费'),
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`ssrc.bidHall.model.bidHall.bidBond`).d('保证金(元)'),
                    }),
                  },
                ],
              })(
                <PrecisionInputNumber
                  type="hzero"
                  financial={form.getFieldValue('currencyCode')}
                  onBlur={(e) => this.handleRfxBondBlur(e, 'bidBond')}
                  min={0}
                  max="99999999999999999999"
                  formatter={this.bidBoundFormatter}
                  style={{ width: '100%' }}
                />
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label={intl.get('ssrc.common.explorationFlag').d('是否需要现场踏勘')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('explorationFlag', {
                initialValue: header.explorationFlag,
              })(<Checkbox />)}
            </FormItem>
          </Col>
          {getFieldValue('explorationFlag') && (
            <Col span={8}>
              <FormItem
                label={intl.get(`ssrc.common.explorationDate`).d('踏勘时间')}
                {...EDIT_FORM_ITEM_LAYOUT}
              >
                {getFieldDecorator('explorationDate', {
                  initialValue: header.explorationDate,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`ssrc.common.explorationDate`).d('踏勘时间'),
                      }),
                    },
                  ],
                })(<Input />)}
              </FormItem>
            </Col>
          )}
          <Col span={8}>
            <FormItem
              label={intl
                .get('ssrc.common.model.common.allowChangePayWayFlag')
                .d('是否允许供应商修改付款条款&方式')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('paymentTermFlag', {
                initialValue: header.paymentTermFlag || 0,
              })(<Checkbox />)}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}
