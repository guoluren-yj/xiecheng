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

export default class HeadInfo extends React.PureComponent {
  render() {
    const { headInfo } = this.props;
    return (
      <div>
        <Row
          style={{ borderBottom: '1px dashed #dcdcdc', paddingBottom: 4, marginBottom: 20 }}
          type="flex"
          justify="space-between"
          align="bottom"
        >
          <Col md={8}>
            <Row>
              <Col md={6} style={{ color: '#999' }}>
                {intl.get(`spfm.investigation.model.investigation.templateCode`).d('预置模板代码')}:
              </Col>
              <Col md={18}>{headInfo.templateCode}</Col>
            </Row>
          </Col>
          <Col md={8}>
            <Row>
              <Col md={6} style={{ color: '#999' }}>
                {intl
                  .get(`spfm.investigation.model.questionnairePreset.description`)
                  .d('预置模板描述')}
                :
              </Col>
              <Col md={18}> {headInfo.templateName}</Col>
            </Row>
          </Col>
          <Col md={8}>
            <Row>
              <Col md={6} style={{ color: '#999' }}>
                {intl.get(`spfm.investigation.model.investigation.investigateType`).d('调查表类型')}
                :
              </Col>
              <Col md={18}> {headInfo.investigateTypeMeaning}</Col>
            </Row>
          </Col>
        </Row>
        <Row
          style={{ borderBottom: '1px dashed #dcdcdc', paddingBottom: 4, marginBottom: 20 }}
          type="flex"
          justify="space-between"
          align="bottom"
        >
          <Col md={8}>
            <Row>
              <Col md={6} style={{ color: '#999' }}>
                {intl.get(`spfm.investigation.model.questionnairePreset.industry`).d('行业类型')}:
              </Col>
              <Col md={18}>{headInfo.industryMeaning}</Col>
            </Row>
          </Col>
          <Col md={8}>
            <Row>
              <Col md={6} style={{ color: '#999' }}>
                {intl.get(`hzero.common.date.creation`).d('创建日期')}:
              </Col>
              <Col md={18}> {dateTimeRender(headInfo.creationDate)}</Col>
            </Row>
          </Col>
          <Col md={8}>
            <Row>
              <Col md={6} style={{ color: '#999' }}>
                {intl.get(`spfm.investigation.model.questionnairePreset.remark`).d('说明')}:
              </Col>
              <Col md={18}> {headInfo.remark}</Col>
            </Row>
          </Col>
        </Row>
      </div>
    );
  }
}
