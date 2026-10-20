/**
 * CreateForm - 问题基本信息
 * @date: 2019-6-14
 * @author: LXM <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */

import React from 'react';
import intl from 'utils/intl';
import { valueMapMeaning } from 'utils/renderer';
// import { getCurrentUser } from 'utils/utils';
import { Form, Row, Col, Input } from 'hzero-ui';
import styles from './index.less';

const { TextArea } = Input;
const FormItem = Form.Item;

const promptCode = 'ssrc.supplierBid';

@Form.create({ fieldNameProp: null })
export default class CreateForm extends React.Component {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      // supplier: getCurrentUser().realName,
    };
  }

  render() {
    const {
      sourceNum,
      issueStatus,
      form: { getFieldDecorator },
      questionInformationHeader,
    } = this.props;
    // const { supplier } = this.state;
    const formItemLayout = {
      labelCol: { span: 3 },
      wrapperCol: { span: 21 },
    };
    return (
      <Form className={styles['information-container']}>
        <Row className={styles['information-item']}>
          <Col span={8}>
            <Row>
              <Col span={9}>
                {intl.get(`${promptCode}.model.supplierBid.questionNum`).d('问题单号')}:
              </Col>
              <Col span={15}>{questionInformationHeader.issueNum}</Col>
            </Row>
          </Col>
          <Col span={8}>
            <Row>
              <Col span={9}>
                {intl.get(`${promptCode}.model.supplierBid.questionSupplier`).d('供应商')}:
              </Col>
              <Col span={15}>{questionInformationHeader.supplierCompanyName}</Col>
            </Row>
          </Col>
          <Col span={8}>
            <Row>
              <Col span={9}>
                {intl.get(`${promptCode}.model.supplierBid.questionState`).d('状态')}:
              </Col>
              <Col span={15}>
                {questionInformationHeader.issueStatus
                  ? valueMapMeaning(issueStatus, questionInformationHeader.issueStatus)
                  : questionInformationHeader.issueStatus}
              </Col>
            </Row>
          </Col>
        </Row>
        <Row className={styles['information-item']}>
          <Col span={8}>
            <Row>
              <Col span={9}>
                {intl.get(`${promptCode}.model.supplierBid.sourceNo`).d('寻源单号')}:
              </Col>
              <Col span={15}>{questionInformationHeader.sourceNum || sourceNum}</Col>
            </Row>
          </Col>
          <Col span={8}>
            <Row>
              <Col span={9}>
                {intl.get(`${promptCode}.model.supplierBid.questionSubmitter`).d('提交人')}:
              </Col>
              <Col span={15}>{questionInformationHeader.submittedByUserName}</Col>
            </Row>
          </Col>
          <Col span={8}>
            <Row>
              <Col span={9}>
                {intl.get(`${promptCode}.model.supplierBid.questionSubmitDate`).d('提交时间')}:
              </Col>
              <Col span={15}>{questionInformationHeader.submittedDate}</Col>
            </Row>
          </Col>
        </Row>
        <Row>
          <Col span={20}>
            <FormItem
              {...formItemLayout}
              label={intl.get(`${promptCode}.model.supplierBid.questionHistory`).d('相关历史问题')}
            >
              {getFieldDecorator('relatedIssue', {
                initialValue: questionInformationHeader.relatedIssue,
                rules: [
                  {
                    max: 480,
                    message: intl.get('hzero.common.validation.max', { max: 480 }),
                  },
                ],
              })(<TextArea rows={2} />)}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={20}>
            <FormItem {...formItemLayout} label={intl.get(`hzero.common.remark`).d('备注')}>
              {getFieldDecorator('remark', {
                initialValue: questionInformationHeader.remark,
                rules: [
                  {
                    max: 360,
                    message: intl.get('hzero.common.validation.max', { max: 360 }),
                  },
                ],
              })(<TextArea rows={2} />)}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}
