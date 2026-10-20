/* PhoneVerification - 证件&手机验证
 * @Date: 2022-06-13 16:13:35
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */

import React, { useState, useCallback } from 'react';
import { Row, Col } from 'choerodon-ui';
import { Form, TextField, Select } from 'choerodon-ui/pro';

import CountDown from '../components/CountDown';

const PhoneVerification = ({ dataSet, modal }) => {
  // 当证件类型不为空时显示 证件号码、银行卡号 字段
  const [isShowFlag, setIsShowFlag] = useState(true);
  const handleDomesticChange = useCallback(value => {
    if (value) {
      setIsShowFlag(false);
    } else {
      setIsShowFlag(true);
    }
  }, []);
  return (
    <Form dataSet={dataSet} labelLayout="float">
      <TextField name="name" />
      <Select name="idType" onChange={handleDomesticChange} />
      <TextField name="idCard" hidden={isShowFlag} />
      <TextField name="bankNum" hidden={isShowFlag} />
      <Row style={{ marginBottom: -6 }}>
        <Col span={9}>
          <Select name="internationalTelCode" style={{ width: '100%' }} clearButton={false} />
        </Col>
        <Col span={15}>
          <TextField name="phone" style={{ width: '100%' }} />
        </Col>
      </Row>
      <Row>
        <Col span={16}>
          <TextField required name="authCode" style={{ width: '100%' }} />
        </Col>
        <Col span={8}>
          <CountDown dataSet={dataSet} type="PHONE" modal={modal} />
        </Col>
      </Row>
    </Form>
  );
};

export default PhoneVerification;
