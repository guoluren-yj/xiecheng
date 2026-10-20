/**
 * BasicInfoForm - 问题描述表单
 * @date: 2018-11-23
 * @author: WH <heng.wei@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Input, Select, Row, Col, DatePicker } from 'hzero-ui';
import classNames from 'classnames';
import intl from 'utils/intl';
import moment from 'moment';
import {
  EDIT_FORM_ITEM_LAYOUT,
  FORM_COL_3_LAYOUT,
  EDIT_FORM_ROW_LAYOUT,
  FORM_COL_2_LAYOUT,
  DEFAULT_DATETIME_FORMAT,
} from 'utils/constants';

const prefix = `sqam.common.model.qualityRectification`;
// 编辑表单 span=16时，label:wrapper = 1:5

export default class QuestionForm extends PureComponent {
  render() {
    const {
      form = {},
      dataSource,
      issueType,
      significance,
      urgency,
      defectType,
      customizeForm,
      onSelectChange = (e) => e,
    } = this.props;
    const { getFieldDecorator = (e) => e } = form;
    return customizeForm(
      { code: 'SQAM.CREATE_8D_DETAIL.PROBLEM', dataSource, form },
      <Form>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="writable-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item label={intl.get(`${prefix}.issue`).d('问题类型')} {...EDIT_FORM_ITEM_LAYOUT}>
              {getFieldDecorator('problemTypeCode', {
                initialValue: dataSource.problemTypeCode,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${prefix}.issue`).d('问题类型'),
                    }),
                  },
                ],
              })(
                <Select allowClear onChange={onSelectChange}>
                  {issueType.map((item, index) => (
                    <Select.Option value={item.value} key={String(index)}>
                      {item.meaning}
                    </Select.Option>
                  ))}
                </Select>
              )}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`${prefix}.defectType`).d('缺陷类型')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('problemDefectType', {
                initialValue: dataSource.problemDefectType,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${prefix}.defectType`).d('缺陷类型'),
                    }),
                  },
                ],
              })(
                <Select allowClear>
                  {defectType.map((item, index) => (
                    <Select.Option value={item.value} key={String(index)}>
                      {item.meaning}
                    </Select.Option>
                  ))}
                </Select>
              )}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`${prefix}.significance`).d('重视度')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('problemImportanceCode', {
                initialValue: dataSource.problemImportanceCode,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${prefix}.significance`).d('重视度'),
                    }),
                  },
                ],
              })(
                <Select allowClear>
                  {significance.map((item, index) => (
                    <Select.Option value={item.value} key={String(index)}>
                      {item.meaning}
                    </Select.Option>
                  ))}
                </Select>
              )}
            </Form.Item>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="writable-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item label={intl.get(`${prefix}.urgency`).d('紧急度')} {...EDIT_FORM_ITEM_LAYOUT}>
              {getFieldDecorator('problemUrgencyCode', {
                initialValue: dataSource.problemUrgencyCode,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${prefix}.urgency`).d('紧急度'),
                    }),
                  },
                ],
              })(
                <Select allowClear>
                  {urgency.map((item, index) => (
                    <Select.Option value={item.value} key={String(index)}>
                      {item.meaning}
                    </Select.Option>
                  ))}
                </Select>
              )}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`${prefix}.problemOccurredDate`).d('发生时间')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('problemOccurredDate', {
                initialValue: dataSource.problemOccurredDate
                  ? moment(dataSource.problemOccurredDate)
                  : null,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${prefix}.problemOccurredDate`).d('发生时间'),
                    }),
                  },
                ],
              })(
                <DatePicker
                  showTime
                  format={DEFAULT_DATETIME_FORMAT}
                  disabledDate={(date) => moment().isBefore(date, 'day')}
                />
              )}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`${prefix}.problemDiscoverBy`).d('发现人员')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('problemDiscoverBy', {
                initialValue: dataSource.problemDiscoverBy,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${prefix}.problemDiscoverBy`).d('发现人员'),
                    }),
                  },
                ],
              })(<Input />)}
            </Form.Item>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="half-row">
          <Col {...FORM_COL_2_LAYOUT}>
            <Form.Item
              label={intl.get(`${prefix}.problemOccurredSite`).d('发生地点')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('problemOccurredSite', {
                initialValue: dataSource.problemOccurredSite,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${prefix}.problemOccurredSite`).d('发生地点'),
                    }),
                  },
                ],
              })(<Input />)}
            </Form.Item>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="half-row">
          <Col {...FORM_COL_2_LAYOUT}>
            <Form.Item
              label={intl.get(`${prefix}.problemIdentifyCauses`).d('识别原因')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('problemIdentifyCauses', {
                initialValue: dataSource.problemIdentifyCauses,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${prefix}.problemIdentifyCauses`).d('识别原因'),
                    }),
                  },
                ],
              })(<Input />)}
            </Form.Item>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="half-row">
          <Col {...FORM_COL_2_LAYOUT}>
            <Form.Item
              label={intl.get(`${prefix}.problemSketch`).d('问题简述')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('problemIdentification', {
                initialValue: dataSource.problemIdentification,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${prefix}.problemSketch`).d('问题简述'),
                    }),
                  },
                ],
              })(<Input />)}
            </Form.Item>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="half-row">
          <Col {...FORM_COL_2_LAYOUT}>
            <Form.Item
              label={intl.get(`${prefix}.detail`).d('问题详述')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('problemDetail', {
                initialValue: dataSource.problemDetail,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${prefix}.detail`).d('问题详述'),
                    }),
                  },
                ],
              })(<Input.TextArea rows={2} style={{ height: '56px' }} />)}
            </Form.Item>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className={classNames('half-row', 'last-form-item')}>
          <Col {...FORM_COL_2_LAYOUT}>
            <Form.Item label={intl.get(`${prefix}.emergency`).d('紧急处理')}>
              {getFieldDecorator('problemEmergencyAction', {
                initialValue: dataSource.problemEmergencyAction,
              })(<Input.TextArea rows={2} style={{ height: '56px' }} />)}
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }
}
