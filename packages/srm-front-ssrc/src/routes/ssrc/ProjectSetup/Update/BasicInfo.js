/**
 * routes 寻源立项-维护／详情／基本头信息
 * @date: 2020-2-24
 * @author: zoukang <kang.zou@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { map, noop } from 'lodash';
import { Bind } from 'lodash-decorators';
import LovMulti from 'srm-front-cuz/lib/custH0X/LovMulti';
import { Form, Row, Col, Input, Select, DatePicker, Radio, Tooltip, Icon } from 'hzero-ui';
import moment from 'moment';
import {
  dateRender, // 日期格式化
  dateTimeRender, // 日期时间格式化
} from 'utils/renderer';

import Lov from 'components/Lov';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { EMAIL, NOT_CHINA_PHONE, PHONE } from 'utils/regExp';
import { getDateTimeFormat, getDateFormat, getCurrentUser, getResponse } from 'utils/utils';
import {
  EDIT_FORM_ITEM_LAYOUT,
  EDIT_FORM_ITEM_LAYOUT_COL_3,
  SEARCH_FORM_ITEM_LAYOUT,
} from 'utils/constants';
import TLEditor from 'components/TLEditor';
import { phoneRender, numberSeparatorRender } from '@/utils/renderer';
import { fetchRFContentConfig } from '@/services/inquiryHallService';

import PrecisionInputNumber from '@/routes/components/Precision/PrecisionInputNumber';
import { isJSON } from '@/utils/utils';

const { Option } = Select;
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const CustomFormLayout = { labelCol: { span: 3 }, wrapperCol: { span: 20 } };

@formatterCollections({ code: ['ssrc.bidHall', 'ssrc.inquiryHall', 'ssrc.common'] })
export default class BidInfoForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      useRF: false, // 是否展示RF
      useRFContent: 'ALL', // 展示RFI/RFP
    };
  }

  componentDidMount() {
    this.init();
  }

  async init() {
    const res = await fetchRFContentConfig();
    if (!isJSON(res)) {
      if (res) {
        this.setState({
          useRF: true,
        });
        if (res === 'RFI') {
          this.setState({
            useRFContent: 'RFI',
          });
        } else if (res === 'RFP') {
          this.setState({
            useRFContent: 'RFP',
          });
        } else {
          this.setState({
            useRFContent: 'ALL',
          });
        }
      } else {
        this.setState({
          useRF: false,
        });
      }
    } else {
      getResponse(JSON.parse(res));
    }
  }

  // change company lov
  @Bind()
  changeCompany(val = null, record = {}) {
    const { form, changeCompanyLov = noop } = this.props;
    const { companyName = null, currencyCode = null } = record;
    if (val && form.getFieldValue('companyId') !== val) {
      changeCompanyLov(val, companyName);
    }

    form.setFieldsValue({
      companyId: val,
      companyName,
      currencyCode,
    });
  }

  // change purchase contact lov
  @Bind()
  changePurchaseContct(val = null, record = {}) {
    const { form } = this.props;
    const { phone = null, email = null } = record;

    form.setFieldsValue({
      contactUserId: val,
      contactMobilephone: phone,
      contactMail: email,
    });
  }

  // 改变评标办法
  @Bind()
  changeEvaluateMethod(_, record = {}) {
    const { form } = this.props;
    const { remark } = record;

    form.setFieldsValue({
      methodRemark: remark,
    });
  }

  // 渲染编辑OR展示表单
  renderHeaderFormItem(formNode = null, key = null, options = {}) {
    if (!key) {
      throw new TypeError('key is must be a property!');
    }

    const {
      header = {},
      detailFlag = false,
      form: { getFieldDecorator },
    } = this.props;
    if (!detailFlag) {
      return formNode;
    }

    const { label } = formNode.props || {};
    let showValue = header[key] || null;
    if (key === 'estimatedDate') {
      showValue = showValue ? dateRender(showValue) : null;
    }
    if (key === 'sourceDate') {
      showValue = showValue ? dateTimeRender(showValue) : null;
    }
    const { FormLayout = null } = options;
    const Layouts = FormLayout || EDIT_FORM_ITEM_LAYOUT;

    return (
      <FormItem label={label} {...Layouts}>
        {/* {showValue} */}
        {getFieldDecorator(key)(
          <span>{key === 'budgetAmount' ? numberSeparatorRender(showValue) : showValue}</span>
        )}
      </FormItem>
    );
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

  // 对RFX节点配置进行过滤
  renderRFXSetting = (rfxConfig) => {
    const { useRFContent } = this.state;
    let config = [];
    if (useRFContent === 'ALL') {
      return rfxConfig;
    } else if (useRFContent === 'RFI') {
      config = [...rfxConfig.filter((item) => item.value.indexOf('RFP') <= -1)];
      return config;
    } else if (useRFContent === 'RFP') {
      config = [...rfxConfig.filter((item) => item.value.indexOf('RFI') <= -1)];
      return config;
    } else {
      return [];
    }
  };

  renderFields = () => {
    const {
      isBid,
      isAll,
      form = {},
      form: { getFieldDecorator, getFieldValue },
      organizationId,
      header = {},
      rfxConfig = [],
      sourceFrom = '',
      sourceMethods = [],
      sourceCategorys = [],
      bidSourceCategorys = [],
      allSourceCategorys = [],
      subjectMater = [],
      idd = [],
      changeSourceCategory,
      changeSubjectMatterRule,
      detailFlag = false,
      changeSourceMethod,
      ssrcRemote,
      sourceProjectId,
      isPubPage = false,
      history,
    } = this.props;
    const { useRF } = this.state;
    const user = getCurrentUser() || {};
    const { id, realName = null, phone = null, email = null } = user;

    const sourceMember = header.sourceMember?.split(',') || [];
    const sourceMemberMeaning = header.sourceMemberMeaning?.split('/') || [];
    const translateData = {};
    sourceMember.forEach((item, index) => {
      translateData[item] = sourceMemberMeaning[index];
    });
    const fields = [
      <Row gutter={48}>
        <Col span={8}>
          {this.renderHeaderFormItem(
            <FormItem
              label={intl.get('ssrc.projectSetup.model.projectSetup.projectCode').d('项目编号')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('sourceProjectNum', {
                initialValue: header.sourceProjectNum,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get('ssrc.projectSetup.model.projectSetup.projectCode')
                        .d('项目编号'),
                    }),
                  },
                ],
              })(<Input typeCase="upper" inputChinese={false} />)}
            </FormItem>,
            'sourceProjectNum'
          )}
        </Col>
        <Col span={8}>
          {!detailFlag ? (
            <FormItem
              label={intl.get('ssrc.projectSetup.model.projectSetup.projectName').d('项目名称')}
              {...CustomFormLayout}
            >
              {getFieldDecorator('sourceProjectName', {
                initialValue: header.sourceProjectName,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get('ssrc.projectSetup.model.projectSetup.projectName')
                        .d('项目名称'),
                    }),
                  },
                ],
              })(
                <TLEditor
                  label={intl.get('ssrc.projectSetup.model.projectSetup.projectName').d('项目名称')}
                  field="sourceProjectName"
                  token={header._token}
                />
              )}
            </FormItem>
          ) : (
            <FormItem
              label={intl.get('ssrc.projectSetup.model.projectSetup.projectName').d('项目名称')}
              {...CustomFormLayout}
            >
              {getFieldDecorator('sourceProjectName')(<span>{header.sourceProjectName}</span>)}
            </FormItem>
          )}
        </Col>
        <Col span={8}>
          {this.renderHeaderFormItem(
            <FormItem
              label={intl.get('ssrc.inquiryHall.model.inquiryHall.sourcingCategory').d('寻源类别')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator(isBid ? 'secondarySourceCategory' : 'sourceCategory', {
                initialValue: header.secondarySourceCategory || header.sourceCategory || undefined,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get('ssrc.inquiryHall.model.inquiryHall.sourcingCategory')
                        .d('寻源类别'),
                    }),
                  },
                ],
              })(
                <Select allowClear onChange={changeSourceCategory}>
                  {(isAll ? allSourceCategorys : isBid ? bidSourceCategorys : sourceCategorys) &&
                    (isAll ? allSourceCategorys : isBid ? bidSourceCategorys : sourceCategorys).map(
                      (item) => (
                        <Option key={item.value} value={item.value}>
                          {item.meaning}
                        </Option>
                      )
                    )}
                </Select>
              )}
            </FormItem>,
            isBid ? 'secondarySourceCategoryMeaning' : 'sourceCategoryMeaning'
          )}
        </Col>
      </Row>,
      <Row gutter={48}>
        <Col span={8}>
          {this.renderHeaderFormItem(
            <Form.Item
              label={intl.get(`ssrc.sourceTemplate.model.template.subjectMatterRule`).d('标的规则')}
              {...SEARCH_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('subjectMatterRule', {
                initialValue: header.subjectMatterRule || 'NONE',
              })(
                <RadioGroup onChange={changeSubjectMatterRule}>
                  {subjectMater &&
                    subjectMater.map((item) => (
                      <Radio value={item.value} key={item.value}>
                        {item.meaning}
                      </Radio>
                    ))}
                </RadioGroup>
              )}
            </Form.Item>,
            'subjectMatterRuleMeaning'
          )}
        </Col>
        <Col span={8}>
          {this.renderHeaderFormItem(
            <FormItem label={intl.get(`ssrc.common.company`).d('公司')} {...EDIT_FORM_ITEM_LAYOUT}>
              {getFieldDecorator('companyId', {
                initialValue: header.companyId,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('ssrc.common.company').d('公司'),
                    }),
                  },
                ],
              })(
                <Lov
                  code="SPFM.USER_AUTHORITY_COMPANY"
                  textValue={header.companyName}
                  textField="companyName"
                  onChange={(val, record) => this.changeCompany(val, record)}
                />
              )}
            </FormItem>,
            'companyName'
          )}
          {/* <FormItem style={{ display: 'none' }}>
            {getFieldDecorator('companyName', {
              initialValue: header.companyName,
            })(<div />)}
          </FormItem> */}
        </Col>
        <Col span={8}>
          {this.renderHeaderFormItem(
            <FormItem
              label={intl.get(`ssrc.common.currencyCode`).d('币种')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('currencyCode', {
                initialValue: header.currencyCode,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('ssrc.common.currencyCode').d('币种'),
                    }),
                  },
                ],
              })(
                <Lov
                  code="SMDM.EXCHANGE_RATE.CURRENCY"
                  textValue={header.currencyCode}
                  textField="currencyCode"
                />
              )}
            </FormItem>,
            'currencyCode'
          )}
        </Col>
      </Row>,
      <Row gutter={48}>
        <Col span={8}>
          {this.renderHeaderFormItem(
            <FormItem
              label={
                <span>
                  {intl.get('ssrc.inquiryHall.model.inquiryHall.sourcingApproach').d('寻源方式')}
                  &nbsp;
                  {['OPEN', 'ALL_OPEN'].includes(getFieldValue('sourceMethod')) && !detailFlag ? (
                    <Tooltip
                      title={intl
                        .get('ssrc.common.validate.sourceMethod')
                        .d(
                          '为保护您的个人信息，建议使用您的商务联系方式（如办公电话、商业邮箱，办公室地址等），而非私人联系信息。'
                        )}
                    >
                      <Icon type="question-circle-o" />
                    </Tooltip>
                  ) : null}
                </span>
              }
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('sourceMethod', {
                initialValue: header.sourceMethod,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get('ssrc.inquiryHall.model.inquiryHall.sourcingApproach')
                        .d('寻源方式'),
                    }),
                  },
                ],
              })(
                <Select allowClear onChange={changeSourceMethod}>
                  {sourceMethods &&
                    sourceMethods.map((item) => (
                      <Option key={item.value} value={item.value}>
                        {item.meaning}
                      </Option>
                    ))}
                </Select>
              )}
            </FormItem>,
            'sourceMethodMeaning'
          )}
        </Col>
        <Col span={8}>
          {this.renderHeaderFormItem(
            <FormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.purchOrgName`).d('采购组织名称')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('purOrganizationId', {
                initialValue: header.purOrganizationId,
              })(
                <Lov code="SPFM.USER_AUTH.PURORG" textValue={header.purOrganizationName || null} />
              )}
            </FormItem>,
            'purOrganizationName'
          )}
        </Col>
        <Col span={8}>
          {this.renderHeaderFormItem(
            <FormItem
              label={intl.get('ssrc.projectSetup.model.projectSetup.purchaseLov').d('采购员')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('purchaserId', {
                initialValue: header.purchaserId,
              })(
                <Lov
                  code="SPFM.USER_AUTH.PURCHASE_AGENT"
                  queryParams={{
                    organizationId,
                  }}
                  // textValue={header.purchaserName || null}
                  lovOptions={{
                    displayField: 'purchaseAgentName',
                    valueField: 'purchaseAgentId',
                  }}
                  textValue={header.purchaserName || form.getFieldValue('purchaserName')}
                />
              )}
            </FormItem>,
            'purchaserName'
          )}
        </Col>
        <Col span={8}>
          {this.renderHeaderFormItem(
            <FormItem
              label={intl.get('ssrc.projectSetup.model.projectSetup.purchaseCont').d('采购联系人')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('contactUserId', {
                initialValue: header.contactUserId || id || null,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get('ssrc.projectSetup.model.projectSetup.purchaseCont')
                        .d('采购联系人'),
                    }),
                  },
                ],
              })(
                <Lov
                  code="HIAM.PUBLIC.TENANT.USER" // todo: 临时替换不脱敏值集，后续需要整改
                  queryParams={{
                    organizationId,
                  }}
                  textValue={header.purAgent || realName || null}
                  textField="realName"
                  lovOptions={{
                    displayField: 'realName',
                  }}
                  onChange={(val, record) => this.changePurchaseContct(val, record)}
                />
              )}
            </FormItem>,
            'purAgent'
          )}
        </Col>
        {detailFlag ? (
          <Col span={8}>
            <FormItem
              label={intl
                .get(`ssrc.projectSetup.model.projectSetup.contactMobilephone`)
                .d('联系人电话')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('contactMobilephone')(
                <Tooltip
                  title={phoneRender(header.internationalTelCodeMeaning, header.contactMobilephone)}
                >
                  {phoneRender(header.internationalTelCodeMeaning, header.contactMobilephone)}
                </Tooltip>
              )}
            </FormItem>
          </Col>
        ) : (
          <Col span={8}>
            {this.renderHeaderFormItem(
              <FormItem
                label={intl
                  .get(`ssrc.projectSetup.model.projectSetup.contactMobilephone`)
                  .d('联系人电话')}
                {...EDIT_FORM_ITEM_LAYOUT}
              >
                {getFieldDecorator('contactMobilephone', {
                  initialValue: header.contactMobilephone || phone || null,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`ssrc.projectSetup.model.projectSetup.contactMobilephone`)
                          .d('联系人电话'),
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
                      initialValue:
                        (idd[0] && idd[0].value) || getCurrentUser().internationalTelCode,
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
              </FormItem>,
              'contactMobilephone'
            )}
          </Col>
        )}
        <Col span={8}>
          {this.renderHeaderFormItem(
            <FormItem
              label={intl.get('ssrc.projectSetup.model.projectSetup.contactMail').d('联系人邮箱')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('contactMail', {
                initialValue: header.contactMail || email || null,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get('ssrc.projectSetup.model.projectSetup.contactMail')
                        .d('联系人邮箱'),
                    }),
                  },
                  {
                    pattern: EMAIL,
                    message: intl.get('hzero.common.validation.email').d('邮箱格式不正确'),
                  },
                ],
              })(<Input />)}
            </FormItem>,
            'contactMail'
          )}
        </Col>
        <Col span={8}>
          {this.renderHeaderFormItem(
            <FormItem
              label={intl.get('ssrc.projectSetup.model.projectSetup.budgetAmount').d('预算金额')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('budgetAmount', {
                initialValue: header.budgetAmount,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`ssrc.projectSetup.model.projectSetup.budgetAmount`)
                        .d('预算金额'),
                    }),
                  },
                ],
              })(
                <PrecisionInputNumber
                  type="hzero"
                  financial={form.getFieldValue('currencyCode')}
                  min={0}
                  max="99999999999999999999"
                  renderHandler={() => null}
                  style={{ width: '100%' }}
                />
              )}
            </FormItem>,
            'budgetAmount'
          )}
        </Col>
        <Col span={8}>
          {this.renderHeaderFormItem(
            <FormItem
              label={intl
                .get(`ssrc.inquiryHall.model.inquiryHall.totalEstimatedAmount`)
                .d('预估金额')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('totalEstimatedAmount', {
                initialValue: header.totalEstimatedAmount,
              })(
                <PrecisionInputNumber
                  financial={form.getFieldValue('currencyCode')}
                  type="hzero"
                  disabled
                  style={{ width: '100%' }}
                  renderHandler={() => null} // 去掉步距
                  min={0}
                  max="99999999999999999999"
                />
              )}
            </FormItem>,
            'totalEstimatedAmount'
          )}
        </Col>
        <Col span={8}>
          {this.renderHeaderFormItem(
            <FormItem
              label={intl.get('ssrc.projectSetup.model.projectSetup.depositAmount').d('保证金')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('depositAmount', {
                initialValue: header.depositAmount,
              })(
                <PrecisionInputNumber
                  type="hzero"
                  financial={form.getFieldValue('currencyCode')}
                  renderHandler={() => null}
                  min={0}
                  max="99999999999999999999"
                  style={{ width: '100%' }}
                />
              )}
            </FormItem>,
            'depositAmount'
          )}
        </Col>
      </Row>,
      <Row gutter={48}>
        <Col span={8}>
          {this.renderHeaderFormItem(
            <FormItem
              label={intl
                .get('ssrc.projectSetup.model.projectSetup.estimatedDate')
                .d('预计完成日期')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('estimatedDate', {
                initialValue: header.estimatedDate ? moment(header.estimatedDate) : null,
                rules: [
                  {
                    required: false,
                  },
                ],
              })(
                <DatePicker
                  style={{ width: '100%' }}
                  placeholder=""
                  format={getDateFormat()}
                  disabledDate={(currentDate) => moment(new Date()).isAfter(currentDate, 'day')}
                />
              )}
            </FormItem>,
            'estimatedDate'
          )}
        </Col>
        <Col span={8}>
          {this.renderHeaderFormItem(
            <FormItem
              label={intl.get('ssrc.projectSetup.model.projectSetup.sourceDate').d('寻源时间')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('sourceDate', {
                initialValue: header.sourceDate ? moment(header.sourceDate) : undefined,
                rules: [
                  {
                    required: false,
                  },
                ],
              })(<DatePicker style={{ width: '100%' }} showTime format={getDateTimeFormat()} />)}
            </FormItem>,
            'sourceDate'
          )}
        </Col>
        <Col span={8}>
          {this.renderHeaderFormItem(
            <FormItem
              label={intl.get(`ssrc.projectSetup.model.projectSetup.creator`).d('创建人')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('createdByName', {
                initialValue: header.createdByName || realName,
              })(<Input style={{ width: '100%' }} disabled />)}
            </FormItem>,
            'createdByName'
          )}
        </Col>
      </Row>,
      <Row gutter={48}>
        <Col span={8}>
          {this.renderHeaderFormItem(
            <FormItem
              label={intl.get('ssrc.inquiryHall.model.inquiryHall.unitName').d('需求部门')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('unitId', {
                initialValue: header.unitId,
              })(
                <Lov
                  code="SSRC.DEMAND.UNIT"
                  lovOptions={{
                    displayField: 'unitName',
                    valueField: 'unitId',
                  }}
                  textValue={header.unitName || form.getFieldValue('unitName')}
                  queryParams={{
                    sourceFrom,
                    tenantId: organizationId,
                  }}
                />
              )}
            </FormItem>,
            'unitName'
          )}
        </Col>
        <Col span={8}>
          {this.renderHeaderFormItem(
            <FormItem
              label={intl.get('ssrc.projectSetup.model.projectSetup.evaluatMethod').d('评标办法')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('methodId', {
                initialValue: header.methodId,
              })(
                <Lov
                  code="SSRC.BID_EVAL_METHOD"
                  textValue={header.evalMethodName || null}
                  textField="evalMethodName"
                  onChange={this.changeEvaluateMethod}
                  queryParams={{
                    sourceFrom,
                    tenantId: organizationId,
                    enabledFlag: 1, // 仅仅查启用的
                  }}
                />
              )}
            </FormItem>,
            'evalMethodName'
          )}
        </Col>
        <Col span={8}>
          {this.renderHeaderFormItem(
            <FormItem
              label={intl.get('ssrc.projectSetup.model.projectSetup.paymentType').d('付款方式')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('paymentTypeId', {
                initialValue: header.paymentTypeId,
              })(
                <Lov
                  code="SMDM.PAYMENTTYPE"
                  textValue={header.paymentTypeName || null}
                  queryParams={{
                    sourceFrom,
                    tenantId: organizationId,
                  }}
                />
              )}
            </FormItem>,
            'paymentTypeName'
          )}
        </Col>
      </Row>,
      <Row gutter={48}>
        <Col span={8}>
          {this.renderHeaderFormItem(
            <FormItem
              label={intl.get('ssrc.projectSetup.model.projectSetup.paymentTerm').d('付款条款')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('paymentTermId', {
                initialValue: header.paymentTermId,
              })(
                <Lov
                  code="SMDM.PAYMENT.TERM"
                  textValue={header.paymentTermName}
                  queryParams={{
                    enabledFlag: 1,
                  }}
                />
              )}
            </FormItem>,
            'paymentTermName'
          )}
        </Col>
        {((getFieldValue('sourceCategory') !== 'BID' && !isBid) ||
          (isBid && !['NEW_BID', 'BID'].includes(getFieldValue('secondarySourceCategory')))) &&
          useRF && (
            <Col span={8}>
              {this.renderHeaderFormItem(
                <FormItem
                  label={intl
                    .get('ssrc.projectSetup.model.projectSetup.RFXNodeConfig')
                    .d('RFX节点配置')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('sourceConfig', {
                    initialValue: header.sourceConfig,
                  })(
                    <Select allowClear>
                      {rfxConfig &&
                        this.renderRFXSetting(rfxConfig).map((item) => {
                          return (
                            <Option key={item.value} value={item.value}>
                              {item.meaning}
                            </Option>
                          );
                        })}
                    </Select>
                  )}
                </FormItem>,
                'sourceConfig'
              )}
            </Col>
          )}
        {((getFieldValue('sourceCategory') !== 'BID' && !isBid) ||
          (isBid && !['BID'].includes(getFieldValue('secondarySourceCategory')))) &&
          useRF && (
            <Col span={8}>
              {this.renderHeaderFormItem(
                <FormItem
                  label={intl
                    .get('ssrc.projectSetup.model.projectSetup.projectMember')
                    .d('项目成员')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('sourceMember', {
                    initialValue: header.sourceMember,
                  })(<LovMulti code="SSRC.PROJECT.TENANT.USER" translateData={translateData} />)}
                </FormItem>,
                'sourceMemberMeaning'
              )}
            </Col>
          )}
      </Row>,
      <Row gutter={48} className="half-row">
        <Col span={24}>
          {!detailFlag ? (
            <FormItem
              label={intl
                .get(`ssrc.projectSetup.model.projectSetup.methodRemark`)
                .d('评标办法说明')}
              {...EDIT_FORM_ITEM_LAYOUT_COL_3}
              style={{ marginRight: '-12px' }}
            >
              {getFieldDecorator('methodRemark', {
                initialValue: header.methodRemark,
                rules: [
                  {
                    max: 500,
                    message: intl.get('hzero.common.validation.max', {
                      max: 500,
                    }),
                  },
                ],
              })(
                <Input.TextArea
                  style={{ marginLeft: '-10px', marginRight: '-10px' }}
                  // maxLength={500}
                />
              )}
            </FormItem>
          ) : (
            <FormItem
              label={intl
                .get(`ssrc.projectSetup.model.projectSetup.methodRemark`)
                .d('评标办法说明')}
              {...EDIT_FORM_ITEM_LAYOUT_COL_3}
              className="no-text-ellipsis"
            >
              {getFieldDecorator('methodRemark')(<span>{header.methodRemark}</span>)}
            </FormItem>
          )}
        </Col>
      </Row>,
      <Row gutter={48} className="half-row">
        <Col span={24}>
          {!detailFlag ? (
            <FormItem
              label={intl.get(`ssrc.projectSetup.model.projectSetup.prejectRemark`).d('项目说明')}
              {...EDIT_FORM_ITEM_LAYOUT_COL_3}
              style={{ marginRight: '-12px' }}
            >
              {getFieldDecorator('sourceProjectRemark', {
                initialValue: header.sourceProjectRemark,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`ssrc.projectSetup.model.projectSetup.prejectRemark`)
                        .d('项目说明'),
                    }),
                  },
                  {
                    max: 1000,
                    message: intl.get('hzero.common.validation.max', {
                      max: 1000,
                    }),
                  },
                ],
              })(
                <Input.TextArea
                  style={{ marginLeft: '-10px', marginRight: '-10px' }}
                  // maxLength={1000}
                />
              )}
            </FormItem>
          ) : (
            <FormItem
              label={intl.get(`ssrc.projectSetup.model.projectSetup.prejectRemark`).d('项目说明')}
              {...EDIT_FORM_ITEM_LAYOUT_COL_3}
              className="no-text-ellipsis"
            >
              {getFieldDecorator('sourceProjectRemark', {
                initialValue: header.sourceProjectRemark,
              })(<span>{header.sourceProjectRemark}</span>)}
            </FormItem>
          )}
        </Col>
      </Row>,
      <Row gutter={48}>
        <Col span={8}>
          {ssrcRemote ? (
            ssrcRemote.render('SSRC_PROJECT_SETUP_UPDATE_RENDER_MORE_FIELD_FIRST', <></>, {
              getFieldDecorator,
              sourceProjectId,
              isPubPage,
              history,
              detailFlag,
              that: this,
              header,
              form,
            })
          ) : (
            <></>
          )}
        </Col>
      </Row>,
    ];

    if (!ssrcRemote) return fields;

    return ssrcRemote.process('SSRC_PROJECT_SETUP_UPDATE_PROCESS_BASIC_FORM_FIELDS', fields, {
      getFieldDecorator,
      detailFlag,
      header,
      that: this,
      form,
    });
  };

  render() {
    const { header = {}, detailFlag = false, customizeForm, custLoading = false } = this.props;

    return customizeForm(
      {
        code: detailFlag
          ? 'SSRC.PROJECT_SETUP_DETAIL.BASEINFOS'
          : 'SSRC.PROJECT_SETUP_EDIT.BASEINFOS',
        form: this.props.form,
        dataSource: header,
      },
      <Form className="writable-row-custom" custLoading={custLoading}>
        {this.renderFields()}
      </Form>
    );
  }
}
