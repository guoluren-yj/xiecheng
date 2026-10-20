import React from 'react';
import { Row, Col } from 'hzero-ui';

import intl from 'utils/intl';
import { valueMapMeaning } from 'utils/renderer';

import styles from './index.less';

export default class DetailsForm extends React.Component {
  render() {
    const { issueHeader = [], issueStatus = [], issueDetailsRemote } = this.props;

    let infoFields = [
      <Row className={styles['information-item']} name="rowBasic">
        <Col span={8} name="issueNum">
          <Row>
            <Col span={9}>{intl.get(`ssrc.question.view.question.questionOdd`).d('问题单号')}</Col>
            <Col span={15}>{issueHeader.issueNum}</Col>
          </Row>
        </Col>
        <Col span={8} name="supplierCompanyName">
          <Row>
            <Col span={9}>
              {intl.get(`ssrc.question.view.question.questionSupplier`).d('供应商')}
            </Col>
            <Col span={15}>{issueHeader.supplierCompanyName}</Col>
          </Row>
        </Col>
        <Col span={8} name="issueStatus">
          <Row>
            <Col span={9}>{intl.get(`hzero.common.status`).d('状态')}:</Col>
            <Col span={15}>{valueMapMeaning(issueStatus, issueHeader.issueStatus)}</Col>
          </Row>
        </Col>
      </Row>,
      <Row className={styles['information-item']} name="rowSource">
        <Col span={8} name="sourceNum">
          <Row>
            <Col span={9}>{intl.get(`ssrc.question.view.question.sourceNo`).d('寻源单号')}:</Col>
            <Col span={15}>{issueHeader.sourceNum}</Col>
          </Row>
        </Col>
        <Col span={8} name="submittedByUserName">
          <Row>
            <Col span={9}>
              {intl.get(`ssrc.question.view.question.questionSubmitter`).d('提交人')}:
            </Col>
            <Col span={15}>{issueHeader.submittedByUserName}</Col>
          </Row>
        </Col>
        <Col span={8} name="submittedDate">
          <Row>
            <Col span={9}>
              {intl.get(`ssrc.question.view.question.questionSubmitDate`).d('提交时间')}:
            </Col>
            <Col span={15}>{issueHeader.submittedDate}</Col>
          </Row>
        </Col>
      </Row>,
      <Row className={styles['information-item']} name="rowRelation">
        <Col span={24} name="relatedIssue">
          <Row>
            <Col span={3}>
              {intl.get(`ssrc.question.view.question.questionHistory`).d('相关历史问题')}:
            </Col>
            <Col span={21}>{issueHeader.relatedIssue}</Col>
          </Row>
        </Col>
      </Row>,
      <Row className={styles['information-item']} name="rowRemark">
        <Col span={24} name="remark">
          <Row>
            <Col span={3}>{intl.get('hzero.common.remark').d('备注')}:</Col>
            <Col span={21}>{issueHeader.remark}</Col>
          </Row>
        </Col>
      </Row>,
    ];

    infoFields = issueDetailsRemote
      ? issueDetailsRemote.process(
          'SSRC_INQUIRY_HALL_QUESTION_ISSUE_DETAILS_PROCESS_DETAILS_FORM_INFOFIELDS',
          infoFields,
          {
            that: this,
          }
        )
      : infoFields;

    return <div className={styles['information-container']}>{infoFields}</div>;
  }
}
