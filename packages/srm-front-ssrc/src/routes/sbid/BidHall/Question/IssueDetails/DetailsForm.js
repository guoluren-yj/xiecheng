import React from 'react';
import intl from 'utils/intl';
import { Row, Col } from 'hzero-ui';
import { valueMapMeaning } from 'utils/renderer';
import styles from './index.less';

export default class DetailsForm extends React.Component {
  render() {
    const { issueHeader = [], issueStatus = [] } = this.props;
    return (
      <div className={styles['information-container']}>
        <Row className={styles['information-item']}>
          <Col span={8}>
            <Row>
              <Col span={9}>
                {intl.get(`ssrc.question.view.question.questionOdd`).d('问题单号')}
              </Col>
              <Col span={15}>{issueHeader.issueNum}</Col>
            </Row>
          </Col>
          <Col span={8}>
            <Row>
              <Col span={9}>
                {intl.get(`ssrc.question.view.question.questionSupplier`).d('供应商')}
              </Col>
              <Col span={15}>{issueHeader.supplierCompanyName}</Col>
            </Row>
          </Col>
          <Col span={8}>
            <Row>
              <Col span={9}>{intl.get(`hzero.common.status`).d('状态')}:</Col>
              <Col span={15}>{valueMapMeaning(issueStatus, issueHeader.issueStatus)}</Col>
            </Row>
          </Col>
        </Row>
        <Row className={styles['information-item']}>
          <Col span={8}>
            <Row>
              <Col span={9}>{intl.get(`ssrc.question.view.question.sourceNo`).d('寻源单号')}:</Col>
              <Col span={15}>{issueHeader.sourceNum}</Col>
            </Row>
          </Col>
          <Col span={8}>
            <Row>
              <Col span={9}>
                {intl.get(`ssrc.question.view.question.questionSubmitter`).d('提交人')}:
              </Col>
              <Col span={15}>{issueHeader.submittedByUserName}</Col>
            </Row>
          </Col>
          <Col span={8}>
            <Row>
              <Col span={9}>
                {intl.get(`ssrc.question.view.question.questionSubmitDate`).d('提交时间')}:
              </Col>
              <Col span={15}>{issueHeader.submittedDate}</Col>
            </Row>
          </Col>
        </Row>
        <Row className={styles['information-item']}>
          <Col span={24}>
            <Row>
              <Col span={3}>
                {intl.get(`ssrc.question.view.question.questionHistory`).d('相关历史问题')}:
              </Col>
              <Col span={21}>{issueHeader.relatedIssue}</Col>
            </Row>
          </Col>
        </Row>
        <Row className={styles['information-item']}>
          <Col span={24}>
            <Row>
              <Col span={3}>{intl.get('hzero.common.remark').d('备注')}:</Col>
              <Col span={21}>{issueHeader.remark}</Col>
            </Row>
          </Col>
        </Row>
      </div>
    );
  }
}
