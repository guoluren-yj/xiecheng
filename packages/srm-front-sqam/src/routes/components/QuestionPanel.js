/**
 * QuestionPanel - 问题描述
 * @date: 2018-11-27
 * @author: WH <heng.wei@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
// import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { Form, Row, Col } from 'hzero-ui';
import { isFunction } from 'lodash';
import intl from 'utils/intl';
import { dateTimeRender } from 'utils/renderer';
// import styles from './QuestionPanel.less';

const prefix = `sqam.common.model.qualityRectification`;
// eslint-disable-next-line react/no-redundant-should-component-update
@Form.create({
  fieldNameProp: null,
  onValuesChange: (props, changeValues) => {
    if (isFunction(props.onFormChange)) {
      props.onFormChange(changeValues);
    }
  },
})
// @withCustomize({
//   unitCode:code,
// })
export default class QuestionPanel extends PureComponent {
  constructor(props) {
    super(props);
    if (isFunction(props.onRef)) {
      props.onRef(this, 'c');
    }
  }

  shouldComponentUpdate(nextProps) {
    // 如果是工作流可编辑可能有编辑框，避免不更新无法输入
    if (this.props.isPubEdit) {
      return true;
    }
    if (nextProps.problemDesc !== this.props.problemDesc) {
      return true;
    }
    return true;
  }

  render() {
    const { problemDesc, customizeForm, form, code, noMeanFlag = false } = this.props;
    const { getFieldDecorator } = form;
    return customizeForm(
      {
        code,
        form,
        dataSource: problemDesc,
      },
      <Form>
        <Row className="read-row">
          <Col span={8}>
            {noMeanFlag ? (
              <Form.Item label={intl.get(`${prefix}.issue`).d('问题类型')}>
                {getFieldDecorator('problemTypeCode', {
                  initialValue: problemDesc.problemTypeCode,
                })(<span>{problemDesc.problemTypeCodeMeaning}</span>)}
              </Form.Item>
            ) : (
              <Form.Item label={intl.get(`${prefix}.issue`).d('问题类型')}>
                {getFieldDecorator('problemTypeCodeMeaning', {
                  initialValue: problemDesc.problemTypeCodeMeaning,
                })(<span>{problemDesc.problemTypeCodeMeaning}</span>)}
              </Form.Item>
            )}
          </Col>
          <Col span={8}>
            <Form.Item label={intl.get(`${prefix}.defectType`).d('缺陷类型')}>
              {getFieldDecorator('problemDefectTypeMeaning', {
                initialValue: problemDesc.problemDefectTypeMeaning,
              })(<span>{problemDesc.problemDefectTypeMeaning}</span>)}
            </Form.Item>
          </Col>
          <Col span={8}>
            {noMeanFlag ? (
              <Form.Item label={intl.get(`${prefix}.significance`).d('重视度')}>
                {getFieldDecorator('problemImportanceCode', {
                  initialValue: problemDesc.problemImportanceCode,
                })(<span>{problemDesc.problemImportanceCodeMeaning}</span>)}
              </Form.Item>
            ) : (
              <Form.Item label={intl.get(`${prefix}.significance`).d('重视度')}>
                {getFieldDecorator('problemImportanceCodeMeaning', {
                  initialValue: problemDesc.problemImportanceCodeMeaning,
                })(<span>{problemDesc.problemImportanceCodeMeaning}</span>)}
              </Form.Item>
            )}
          </Col>
        </Row>
        <Row className="read-row">
          <Col span={8}>
            {noMeanFlag ? (
              <Form.Item label={intl.get(`${prefix}.urgency`).d('紧急度')}>
                {getFieldDecorator('problemUrgencyCode', {
                  initialValue: problemDesc.problemUrgencyCode,
                })(<span>{problemDesc.problemUrgencyCodeMeaning}</span>)}
              </Form.Item>
            ) : (
              <Form.Item label={intl.get(`${prefix}.urgency`).d('紧急度')}>
                {getFieldDecorator('problemUrgencyCodeMeaning', {
                  initialValue: problemDesc.problemUrgencyCodeMeaning,
                })(<span>{problemDesc.problemUrgencyCodeMeaning}</span>)}
              </Form.Item>
            )}
          </Col>
          <Col span={8}>
            <Form.Item label={intl.get(`${prefix}.problemOccurredDate`).d('发生时间')}>
              {getFieldDecorator('problemOccurredDate', {
                initialValue: problemDesc.problemOccurredDate,
              })(<span>{dateTimeRender(problemDesc.problemOccurredDate)}</span>)}
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label={intl.get(`${prefix}.problemDiscoverBy`).d('发现人员')}>
              {getFieldDecorator('problemDiscoverBy', {
                initialValue: problemDesc.problemDiscoverBy,
              })(<span>{problemDesc.problemDiscoverBy}</span>)}
            </Form.Item>
          </Col>
        </Row>
        <Row className="read-row half-row">
          <Col span={24}>
            <Form.Item label={intl.get(`${prefix}.problemOccurredSite`).d('发生地点')}>
              {getFieldDecorator('problemOccurredSite', {
                initialValue: problemDesc.problemOccurredSite,
              })(<span>{problemDesc.problemOccurredSite}</span>)}
            </Form.Item>
          </Col>
        </Row>
        <Row className="read-row half-row">
          <Col span={24}>
            <Form.Item label={intl.get(`${prefix}.problemIdentifyCauses`).d('识别原因')}>
              {getFieldDecorator('problemIdentifyCauses', {
                initialValue: problemDesc.problemIdentifyCauses,
              })(<span>{problemDesc.problemIdentifyCauses}</span>)}
            </Form.Item>
          </Col>
        </Row>
        <Row className="read-row half-row">
          <Col span={24}>
            <Form.Item label={intl.get(`${prefix}.problemSketch`).d('问题简述')}>
              {getFieldDecorator('problemIdentification', {
                initialValue: problemDesc.problemIdentification,
              })(<span>{problemDesc.problemIdentification}</span>)}
            </Form.Item>
          </Col>
        </Row>
        <Row className="read-row half-row">
          <Col span={24}>
            <Form.Item label={intl.get(`${prefix}.detail`).d('问题详述')}>
              {getFieldDecorator('problemDetail', {
                initialValue: problemDesc.problemDetail,
              })(<span>{problemDesc.problemDetail}</span>)}
            </Form.Item>
          </Col>
        </Row>
        <Row className="read-row half-row">
          <Col span={24}>
            <Form.Item label={intl.get(`${prefix}.emergency`).d('紧急处理')}>
              {getFieldDecorator('problemEmergencyAction', {
                initialValue: problemDesc.problemEmergencyAction,
              })(<span>{problemDesc.problemEmergencyAction}</span>)}
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }
}
