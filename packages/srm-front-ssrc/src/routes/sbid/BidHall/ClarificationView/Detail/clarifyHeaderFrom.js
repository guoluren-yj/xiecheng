/**
 * BaseInfo- 澄清函详情基本信息展示
 * @date: 2019-6-19
 * @author: LvShuo <shuo.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Row, Col } from 'hzero-ui';
import intl from 'utils/intl';
import Upload from 'srm-front-boot/lib/components/Upload';
import { valueMapMeaning } from 'utils/renderer';
import { PRIVATE_BUCKET } from '_utils/config';
import styles from './index.less';

@Form.create({ fieldNameProp: null })
export default class ClarifyHeaderFrom extends PureComponent {
  /**
   * render
   * @returns React.element
   */
  render() {
    const { organizationId, clarificationDetails = {}, clarifyStatus = [] } = this.props;
    return (
      <Form>
        <div className={styles['information-container']}>
          <Row className={styles['information-item']}>
            <Col span={3}>{intl.get(`ssrc.clarify.model.clarificationView.title`).d('标题')}</Col>
            <Col span={21}>{clarificationDetails.title}</Col>
          </Row>
          <Row className={styles['information-item']}>
            <Col span={8}>
              <Row>
                <Col span={9}>
                  {intl.get(`ssrc.clarify.model.clarificationView.clarifyNum`).d('澄清单号')}:
                </Col>
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
                <Col span={9}>
                  {intl.get(`ssrc.clarify.model.clarificationView.clarifyStatus`).d('状态')}:
                </Col>
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
                  {intl.get(`ssrc.clarify.model.clarificationView.submittedByUserName`).d('发布人')}
                  :
                </Col>
                <Col span={15}>{clarificationDetails.submittedByUserName}</Col>
              </Row>
            </Col>
            <Col span={8}>
              <Row>
                <Col span={9}>
                  {intl.get(`ssrc.clarify.model.clarificationView.sourceNum`).d('寻源单号')}:
                </Col>
                <Col span={15}>{clarificationDetails.sourceNum}</Col>
              </Row>
            </Col>
            <Col span={8}>
              <Row>
                <Col span={9}>
                  {intl.get(`ssrc.clarify.model.clarificationView.submittedDate`).d('发布时间')}:
                </Col>
                <Col span={15}>{clarificationDetails.submittedDate}</Col>
              </Row>
            </Col>
          </Row>
          <Row>
            <Col span={3}>
              {intl.get(`ssrc.clarify.model.clarificationView.clarifyAttachment`).d('澄清函附件')}:
            </Col>
            <Col span={21}>
              {
                <Upload
                  bucketName={PRIVATE_BUCKET}
                  bucketDirectory="ssrc-bid-header"
                  attachmentUUID={clarificationDetails.attachmentUuid}
                  tenantId={organizationId}
                  icon="download"
                  viewOnly
                  filePreview
                />
              }
            </Col>
          </Row>
        </div>
      </Form>
    );
  }
}
