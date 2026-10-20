/**
 * DetailsForm - 澄清函详情form
 * @date: 2019-6-19
 * @author: LXM <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */

import React from 'react';
import intl from 'utils/intl';
import { Row, Col } from 'hzero-ui';
import { valueMapMeaning } from 'utils/renderer';
import styles from './index.less';

const promptCode = 'ssrc.supplierQuotation';

export default class DetailsForm extends React.Component {
  render() {
    const { clarifyStatus, clarificationDetails = {} } = this.props;
    return (
      <div className={styles['information-container']}>
        <Row className={styles['information-item']}>
          <Col span={3}>{intl.get(`${promptCode}.model.supQuo.title`).d('标题')}</Col>
          <Col span={21}>{clarificationDetails.title}</Col>
        </Row>
        <Row className={styles['information-item']}>
          <Col span={8}>
            <Row>
              <Col span={9}>{intl.get(`${promptCode}.model.supQuo.clarifyNum`).d('澄清单号')}:</Col>
              <Col span={15}>{clarificationDetails.clarifyNum}</Col>
            </Row>
          </Col>
          <Col span={8}>
            <Row>
              <Col span={9}>{intl.get('ssrc.common.company').d('公司')}:</Col>
              <Col span={15}>{clarificationDetails.companyName}</Col>
            </Row>
          </Col>
          <Col span={8}>
            <Row>
              <Col span={9}>{intl.get(`${promptCode}.model.supQuo.clarifyStatus`).d('状态')}:</Col>
              <Col span={15}>
                {valueMapMeaning(clarifyStatus, clarificationDetails.clarifyStatus)}
              </Col>
            </Row>
          </Col>
        </Row>
        <Row className={styles['information-item']}>
          <Col span={8}>
            <Row>
              <Col span={9}>
                {intl.get(`${promptCode}.model.supQuo.submittedByUserName`).d('发布人')}:
              </Col>
              <Col span={15}>{clarificationDetails.submittedByUserName}</Col>
            </Row>
          </Col>
          <Col span={8}>
            <Row>
              <Col span={9}>{intl.get(`${promptCode}.model.supQuo.sourceNum`).d('寻源单号')}:</Col>
              <Col span={15}>{clarificationDetails.sourceNum}</Col>
            </Row>
          </Col>
          <Col span={8}>
            <Row>
              <Col span={9}>
                {intl.get(`${promptCode}.model.supQuo.submittedDate`).d('发布时间')}:
              </Col>
              <Col span={15}>{clarificationDetails.submittedDate}</Col>
            </Row>
          </Col>
        </Row>
      </div>
    );
  }
}
