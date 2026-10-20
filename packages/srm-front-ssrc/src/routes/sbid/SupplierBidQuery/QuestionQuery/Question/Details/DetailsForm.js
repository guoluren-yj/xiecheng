/**
 * DetailsForm - 问题详情form
 * @date: 2019-6-17
 * @author: LXM <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */

import React from 'react';
import intl from 'utils/intl';
import { Row, Col } from 'hzero-ui';
import { valueMapMeaning } from 'utils/renderer';
import styles from './index.less';

const promptCode = 'ssrc.supplierBidQuery';

export default class DetailsForm extends React.Component {
  render() {
    const { sourceNum, issueStatus, questionInformationHeader } = this.props;
    return (
      <div className={styles['information-container']}>
        <Row className={styles['information-item']}>
          <Col span={8}>
            <Row>
              <Col span={9}>
                {intl.get(`${promptCode}.model.supplierBidQuery.questionNum`).d('问题单号')}:
              </Col>
              <Col span={15}>{questionInformationHeader.issueNum}</Col>
            </Row>
          </Col>
          <Col span={8}>
            <Row>
              <Col span={9}>
                {intl.get(`${promptCode}.model.supplierBidQuery.supplier`).d('供应商')}
              </Col>
              <Col span={15}>{questionInformationHeader.supplierCompanyName}</Col>
            </Row>
          </Col>
          <Col span={8}>
            <Row>
              <Col span={9}>
                {intl.get(`${promptCode}.model.supplierBidQuery.clarifyStatus`).d('状态')}
              </Col>
              <Col span={15}>
                {valueMapMeaning(issueStatus, questionInformationHeader.issueStatus)}
              </Col>
            </Row>
          </Col>
        </Row>
        <Row className={styles['information-item']}>
          <Col span={8}>
            <Row>
              <Col span={9}>
                {intl.get(`${promptCode}.model.supplierBidQuery.sourceNo`).d('寻源单号')}
              </Col>
              <Col span={15}>{sourceNum}</Col>
            </Row>
          </Col>
          <Col span={8}>
            <Row>
              <Col span={9}>
                {intl.get(`${promptCode}.model.supplierBidQuery.submitPeople`).d('提交人')}
              </Col>
              <Col span={15}>{questionInformationHeader.submittedByUserName}</Col>
            </Row>
          </Col>
          <Col span={8}>
            <Row>
              <Col span={9}>
                {intl.get(`${promptCode}.model.supplierBidQuery.submitDate`).d('提交时间')}
              </Col>
              <Col span={15}>{questionInformationHeader.submittedDate}</Col>
            </Row>
          </Col>
        </Row>
        <Row className={styles['information-item']}>
          <Col span={24}>
            <Row>
              <Col span={3}>
                {intl.get(`${promptCode}.model.supplierBidQuery.questionHistory`).d('相关历史问题')}
                :
              </Col>
              <Col span={21}>{questionInformationHeader.relatedIssue}</Col>
            </Row>
          </Col>
        </Row>
        <Row className={styles['information-item']}>
          <Col span={24}>
            <Row>
              <Col span={3}>{intl.get(`hzero.common.remark`).d('备注')}:</Col>
              <Col span={21}>{questionInformationHeader.remark}</Col>
            </Row>
          </Col>
        </Row>
      </div>
    );
  }
}
