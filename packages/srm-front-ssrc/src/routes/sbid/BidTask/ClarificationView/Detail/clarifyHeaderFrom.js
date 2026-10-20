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
    const { organizationId, dataSource = {}, clarifyStatusLov = [] } = this.props;
    const {
      title,
      clarifyNum,
      companyName,
      clarifyStatus,
      submittedByUserName,
      sourceNum,
      submittedDate,
      attachmentUuid,
    } = dataSource;
    return (
      <Form>
        <div className={styles['information-container']}>
          <Row className={styles['information-item']}>
            <Col span={3}>{intl.get(`ssrc.bidTask.model.clarify.title`).d('标题')}</Col>
            <Col span={21}>{title}</Col>
          </Row>
          <Row className={styles['information-item']}>
            <Col span={8}>
              <Row>
                <Col span={9}>
                  {intl.get(`ssrc.bidTask.model.clarify.clarifyNum`).d('澄清单号')}:
                </Col>
                <Col span={15}>{clarifyNum}</Col>
              </Row>
            </Col>
            <Col span={8}>
              <Row>
                <Col span={9}>{intl.get('ssrc.common.company').d('公司')}:</Col>
                <Col span={15}>{companyName}</Col>
              </Row>
            </Col>
            <Col span={8}>
              <Row>
                <Col span={9}>{intl.get(`hzero.common.status`).d('状态')}:</Col>
                <Col span={15}>{valueMapMeaning(clarifyStatusLov, clarifyStatus)}</Col>
              </Row>
            </Col>
          </Row>
          <Row className={styles['information-item']}>
            <Col span={8}>
              <Row>
                <Col span={9}>
                  {intl.get(`ssrc.bidTask.model.clarify.submittedByUserName`).d('发布人')}:
                </Col>
                <Col span={15}>{submittedByUserName}</Col>
              </Row>
            </Col>
            <Col span={8}>
              <Row>
                <Col span={9}>
                  {intl.get(`ssrc.bidTask.model.clarify.sourceNum`).d('寻源单号')}:
                </Col>
                <Col span={15}>{sourceNum}</Col>
              </Row>
            </Col>
            <Col span={8}>
              <Row>
                <Col span={9}>
                  {intl.get(`ssrc.bidTask.model.clarify.submittedDate`).d('发布时间')}:
                </Col>
                <Col span={15}>{submittedDate}</Col>
              </Row>
            </Col>
          </Row>
          <Row>
            <Col span={3}>
              {intl.get(`ssrc.bidTask.model.clarify.clarifyAttachment`).d('澄清函附件')}:
            </Col>
            <Col span={21}>
              {
                <Upload
                  bucketName={PRIVATE_BUCKET}
                  bucketDirectory="ssrc-bid-header"
                  attachmentUUID={attachmentUuid}
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
