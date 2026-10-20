/**
 * 模板明细定义头信息
 * @date: 2018-8-16
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import { Row, Col } from 'hzero-ui';
import intl from 'utils/intl';
import { dateTimeRender } from 'utils/renderer';

import styles from '../index.less';

export default class HeaderInfo extends React.PureComponent {
  render() {
    const { headerInfo } = this.props;
    return (
      <React.Fragment>
        <Row className={styles['information-container']}>
          <Row className={styles['information-item']} gutter={48}>
            <Col span={8}>
              <Row>
                <Col span={9} className={styles['information-item-label']}>
                  {intl
                    .get(`spfm.investigationDefinition.view.message.templateCode`)
                    .d('预置模板代码')}
                </Col>
                <Col span={15} className={styles['information-item-children']}>
                  {headerInfo.templateCode}
                </Col>
              </Row>
            </Col>
            <Col span={8}>
              <Row>
                <Col span={9} className={styles['information-item-label']}>
                  {intl
                    .get(`spfm.investigationDefinition.view.message.templateName`)
                    .d('预置模板描述')}
                </Col>
                <Col span={15} className={styles['information-item-children']}>
                  {headerInfo.templateName}
                </Col>
              </Row>
            </Col>
            <Col span={8}>
              <Row>
                <Col span={9} className={styles['information-item-label']}>
                  {intl
                    .get(`spfm.investigationDefinition.view.message.investigateType`)
                    .d('调查表类型')}
                </Col>
                <Col span={15} className={styles['information-item-children']}>
                  {headerInfo.investigateTypeMeaning}
                </Col>
              </Row>
            </Col>
          </Row>
          <Row className={styles['information-item']} gutter={48} style={{ marginBottom: '24px' }}>
            <Col span={8}>
              <Row>
                <Col span={9} className={styles['information-item-label']}>
                  {intl
                    .get(`spfm.investigationDefinition.view.message.industryMeaning`)
                    .d('行业类型')}
                </Col>
                <Col span={15} className={styles['information-item-children']}>
                  {headerInfo.industryMeaning}
                </Col>
              </Row>
            </Col>
            <Col span={8}>
              <Row>
                <Col span={9} className={styles['information-item-label']}>
                  {intl.get(`hzero.common.date.creation`).d('创建日期')}
                </Col>
                <Col span={15} className={styles['information-item-children']}>
                  {dateTimeRender(headerInfo.creationDate)}
                </Col>
              </Row>
            </Col>
            <Col span={8}>
              <Row>
                <Col span={9} className={styles['information-item-label']}>
                  {intl.get(`hzero.common.remark`).d('备注')}
                </Col>
                <Col span={15} className={styles['information-item-children']}>
                  {headerInfo.remark}
                </Col>
              </Row>
            </Col>
          </Row>
        </Row>
      </React.Fragment>
    );
  }
}
