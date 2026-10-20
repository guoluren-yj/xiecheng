import React, { Component } from 'react';
import { Form, Col, Row, Input, Select } from 'hzero-ui';
import { map } from 'lodash';

import Switch from 'components/Switch';
import Lov from 'components/Lov';

import { EMAIL, PHONE, NOT_CHINA_PHONE } from 'utils/regExp';

import {
  FORM_COL_3_LAYOUT,
  EDIT_FORM_ITEM_LAYOUT,
  FORM_COL_2_LAYOUT,
  EDIT_FORM_ROW_LAYOUT,
  EDIT_FORM_ITEM_LAYOUT_COL_2,
} from 'utils/constants';
import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';

// import { withFormDataSourceFlex } from '@/routes/components/Flex/FlexFields/utils';
// import withFlexFieldsTriggers from '@/components/FlexFields/withFlexFieldsTriggers';
// import withIndividuationForm from '@/components/Individuation/withIndividuationForm';
import styles from './index.less';

Input.displayName = 'Input';

/**
 * 员工基本信息表单
 * @extends {Component} - React.Component
 * @reactProps {!Object} employeeInfo - 数据源
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */
// @withIndividuationForm({
//   formIndividuationCode: 'EMPLOYEE_DETAIL_FORM',
//   permissionCode: {
//     tenant: [{ code: 'hzero.personality.form.ps.tenant', type: 'Button'}],
//     user: [{ code: 'hzero.personality.form.ps.user', type: 'Button'}],
//     role: [{ code: 'hzero.personality.form.ps.role', type: 'Button'}],
//   },
// })
// @withFlexFieldsTriggers()
export default class DataForm extends Component {
  /**
   *
   * 区号改变 需要 重置手机号的校验状态
   */
  reValidationPhone = (value) => {
    const { form } = this.props;
    const prevInternationalTelCode = form.getFieldValue('internationalTelCode');
    if (value === '+86' || prevInternationalTelCode === '+86') {
      // 只要 +86 出现在 中间态 就需要重新手动校验 phone
      const curPhone = form.getFieldValue('mobile');
      let errors = null;
      if (curPhone) {
        const testReg = value === '+86' ? PHONE : NOT_CHINA_PHONE;
        if (!testReg.test(curPhone)) {
          errors = [new Error(intl.get('hzero.common.validation.phone').d('手机格式不正确'))];
        }
      } else {
        errors = [
          new Error(
            intl.get('hzero.common.validation.notNull', {
              name: intl.get('hiam.subAccount.model.user.phone').d('手机号码'),
            })
          ),
        ];
      }
      form.setFields({
        mobile: {
          value: curPhone,
          errors,
        },
      });
    }
  };

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      customizeForm,
      employeeStatus = [],
      employeeGender = [],
      idd = [],
      employeeInfo = {},
      // flexFieldsMiddleware = {},
      form,
      // withIndividuationFormObject,
      // individuationFormTriggerButton,
      // withFlexFieldsForm,
      // flexFieldsButtonRender,
    } = this.props;
    const { getFieldDecorator, setFieldsValue } = this.props.form;
    // const { flexFieldsTriggers, getFieldDecoratorWithFlex = () => {} } = flexFieldsMiddleware;
    // const flexFieldFormItems = getFlexFieldFormItems(flexFieldsTriggers, form);
    return customizeForm(
      { code: 'HPFM.EMPLOYEE_DETAIL.HEADER', form, dataSource: employeeInfo },
      <Form className={styles['hpfm-employee-detail-item']}>
        <Row {...EDIT_FORM_ROW_LAYOUT}>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get('entity.employee.code').d('员工编码')}
            >
              {getFieldDecorator('employeeNum', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('entity.employee.code').d('员工编码'),
                    }),
                  },
                ],
                initialValue: employeeInfo.employeeNum,
              })(<Input disabled />)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get('entity.employee.name').d('员工姓名')}
            >
              {getFieldDecorator('name', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('entity.employee.name').d('员工姓名'),
                    }),
                  },
                  {
                    max: 60,
                    message: intl.get('hzero.common.validation.max', {
                      max: 60,
                    }),
                  },
                ],
                initialValue: employeeInfo.name,
              })(<Input />)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get('hpfm.employee.model.employee.superiorEmployeeNum').d('员工上级编码')}
            >
              {getFieldDecorator('superiorEmployeeId', {
                initialValue: employeeInfo.superiorEmployeeId,
              })}
              {getFieldDecorator(`superiorEmployeeNum`, {
                initialValue: employeeInfo.superiorEmployeeNum,
              })(
                <Lov
                  code="LOV_EMPLOYEE"
                  queryParams={{
                    tenantId: getCurrentOrganizationId(),
                    excludeEmployeeId: employeeInfo.employeeId,
                  }}
                  lovOptions={{ displayField: 'employeeNum', valueField: 'employeeNum' }}
                  onChange={(_, value) => {
                    const { employeeName, employeeId } = value || {};
                    setFieldsValue({
                      superiorEmployeeName: employeeName,
                      superiorEmployeeId: employeeId,
                    });
                  }}
                />
              )}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl
                .get('hpfm.employee.model.employee.superiorEmployeeName')
                .d('员工上级名称')}
            >
              {getFieldDecorator(`superiorEmployeeName`, {
                initialValue: employeeInfo.superiorEmployeeName,
                rules: [
                  {
                    max: 60,
                    message: intl.get('hzero.common.validation.max', {
                      max: 60,
                    }),
                  },
                ],
              })(<Input />)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get('hpfm.employee.model.employee.gender').d('性别')}
            >
              {getFieldDecorator('gender', {
                initialValue: employeeInfo.gender,
                dataSource: employeeGender,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('entity.employee.gender').d('性别'),
                    }),
                  },
                ],
              })(
                <Select className={styles['full-width']} allowClear>
                  {employeeGender.map((item) => {
                    return (
                      <Select.Option key={item.value} value={Number(item.value)}>
                        {item.meaning}
                      </Select.Option>
                    );
                  })}
                </Select>
              )}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get('hpfm.employee.model.employee.phoneticize').d('拼音')}
            >
              {getFieldDecorator('phoneticize', {
                initialValue: employeeInfo.phoneticize,
                rules: [
                  {
                    max: 240,
                    message: intl.get('hzero.common.validation.max', {
                      max: 240,
                    }),
                  },
                ],
              })(<Input />)}
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={48}>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get('hpfm.employee.model.employee.quickIndex').d('快速索引')}
            >
              {getFieldDecorator('quickIndex', {
                initialValue: employeeInfo.quickIndex,
                rules: [
                  {
                    max: 240,
                    message: intl.get('hzero.common.validation.max', {
                      max: 240,
                    }),
                  },
                ],
              })(<Input trim typeCase="upper" inputChinese={false} />)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get('hpfm.employee.model.employee.status').d('员工状态')}
            >
              {getFieldDecorator('status', {
                initialValue: employeeInfo.status,
                dataSource: employeeStatus,
              })(
                <Select className={styles['full-width']} allowClear>
                  {employeeStatus.map((item) => {
                    return (
                      <Select.Option key={item.value} value={item.value}>
                        {item.meaning}
                      </Select.Option>
                    );
                  })}
                </Select>
              )}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get('hzero.common.status.enable').d('启用')}
            >
              {getFieldDecorator('enabledFlag', {
                initialValue: employeeInfo.enabledFlag,
              })(<Switch />)}
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={48}>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item {...EDIT_FORM_ITEM_LAYOUT} label={intl.get('hzero.common.email').d('邮箱')}>
              {getFieldDecorator('email', {
                initialValue: employeeInfo.email,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('hzero.common.email').d('邮箱'),
                    }),
                  },
                  {
                    pattern: EMAIL,
                    message: intl.get('hzero.common.validation.email').d('邮箱格式不正确'),
                  },
                  {
                    max: 60,
                    message: intl.get('hzero.common.validation.max', {
                      max: 60,
                    }),
                  },
                ],
              })(<Input />)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_2_LAYOUT}>
            <Form.Item
              {...EDIT_FORM_ITEM_LAYOUT_COL_2}
              label={intl.get('hzero.common.cellphone').d('手机号')}
            >
              {getFieldDecorator('mobile', {
                initialValue: employeeInfo.mobile,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('hzero.common.cellphone').d('手机号'),
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
                    initialValue: employeeInfo.internationalTelCode || '+86',
                  })(
                    <Select onChange={this.reValidationPhone}>
                      {map(idd, (r) => {
                        return (
                          <Select.Option key={r.value} value={r.value}>
                            {r.meaning}
                          </Select.Option>
                        );
                      })}
                    </Select>
                  )}
                />
              )}
            </Form.Item>
          </Col>
        </Row>
        {/* <Row gutter={48}>
              {flexFieldFormItems.map(o => (
                <Col key={o.key} {...FORM_COL_3_LAYOUT}>
                  {o.component({
                    formItemProps: { ...EDIT_FORM_ITEM_LAYOUT, ...{} },
                    fieldDecoratorOptions: { initialValue: employeeInfo[o.key] },
                  })}
                </Col>
              ))}
            </Row> */}
      </Form>
    );
  }
}
