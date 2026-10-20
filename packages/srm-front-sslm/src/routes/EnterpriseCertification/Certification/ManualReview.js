/* ManualReview - 人工审核
 * @Date: 2022-06-13 20:43:30
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import { Form, TextField, Output, Row, Col } from 'choerodon-ui/pro';
import classnames from 'classnames';

import intl from 'utils/intl';
import styles from '../index.less';
import portraitFace from '@/assets/icon-register-personal-face.png';
import nationalEmblem from '@/assets/icon-register-personal-national.png';
import FileCardByUuid from '../components/FileCardByUuid';

const ManualReview = ({ dataSet }) => {
  return (
    <Form dataSet={dataSet} labelLayout="float">
      <div className={styles['manual-review-title']}>
        <span />
        {intl.get('spfm.supplierRegister.view.manualReview.nameAndNums').d('姓名和证件号')}
      </div>
      <TextField name="name" />
      <TextField name="idCard" />
      <div className={classnames(styles['manual-review-title'], styles['manual-id-card-title'])}>
        <span />
        {intl
          .get('spfm.supplierRegister.view.manualReview.certificatePhoto')
          .d('证件人像面、国徽面')}
      </div>
      <Row className={styles['certificate-photo']}>
        <Col span={10}>
          <Output
            renderer={({ record }) => {
              const idFrontUuid = record?.get('idFrontUuid');
              return (
                <FileCardByUuid
                  requiredFlag
                  record={record}
                  label={intl
                    .get('spfm.supplierRegister.view.certificatePhoto.front')
                    .d('证件人像面')}
                  uuid={idFrontUuid}
                  fieldName="idFrontUuid"
                  pictureWidth={130}
                  pictureHeight={130}
                />
              );
            }}
          />
        </Col>
        <Col span={12}>
          <Output
            renderer={() => {
              return (
                <div className={styles['certificate-photo-example']}>
                  <div>{intl.get('spfm.supplierRegister.view.title.example').d('示例')}：</div>
                  <img
                    src={portraitFace}
                    alt={intl
                      .get('spfm.supplierRegister.view.certificatePhoto.front')
                      .d('证件人像面')}
                  />
                </div>
              );
            }}
          />
        </Col>
      </Row>
      <Row className={styles['certificate-photo']}>
        <Col span={10}>
          <Output
            style={{ height: 250 }}
            renderer={({ record }) => {
              const idBackUuid = record?.get('idBackUuid');
              return (
                <FileCardByUuid
                  requiredFlag
                  record={record}
                  label={intl
                    .get('spfm.supplierRegister.view.certificatePhoto.verso')
                    .d('证件国徽面')}
                  uuid={idBackUuid}
                  fieldName="idBackUuid"
                  pictureWidth={130}
                  pictureHeight={130}
                />
              );
            }}
          />
        </Col>
        <Col span={12}>
          <Output
            renderer={() => {
              return (
                <div className={styles['certificate-photo-example']}>
                  <div>{intl.get('spfm.supplierRegister.view.title.example').d('示例')}：</div>
                  <img
                    src={nationalEmblem}
                    alt={intl
                      .get('spfm.supplierRegister.view.certificatePhoto.verso')
                      .d('证件国徽面')}
                  />
                </div>
              );
            }}
          />
        </Col>
      </Row>
    </Form>
  );
};

export default ManualReview;
