/*
 * EmailCheck - 企业邮箱验证
 * @Date: 2022-06-15 20:13:47
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import { Form, TextField, Row, Col } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import CountDown from '../components/CountDown';

const EmailCheck = ({ dataSet, params }) => {
  return (
    <Form dataSet={dataSet} labelLayout="float">
      <TextField
        name="email"
        addonAfter={intl
          .get('spfm.enterpriseCertification.modal.email.addonAfter')
          .d('例如 @going-link.com')}
      />
      <Row style={{ marginBottom: -6 }}>
        <Col span={16}>
          <TextField name="captcha" style={{ width: '100%' }} />
        </Col>
        <Col span={8}>
          <CountDown dataSet={dataSet} type="EMAIL" params={params} />
        </Col>
      </Row>
    </Form>
  );
};

export default EmailCheck;
