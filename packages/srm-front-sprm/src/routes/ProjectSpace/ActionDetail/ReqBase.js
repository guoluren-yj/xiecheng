/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2022-02-16 21:25:38
 * @LastEditors: yanglin
 * @LastEditTime: 2022-03-10 16:37:41
 */
import React, { useContext } from 'react';
import { Output, Form, Row, Col } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { colorTagRender } from '../commonDetail/util.js';
import { Store } from '../commonDetail/sotreProvider';
import './../ReadDetail/index.less';

const BaseInfo = function BaseInfo() {
  const { detailReqDs } = useContext(Store);

  return (
    <div className="content-padding">
      <h3 className="content-title">
        {intl.get('sprm.purchaseRequest.title.reqBaseInfo').d('申请单基本信息')}
      </h3>
      <Row>
        <Col span={18}>
          <Form
            dataSet={detailReqDs}
            showLines={6}
            columns={3}
            useColon={false}
            labelLayout="vertical"
            className="c7n-pro-vertical-form-display"
            style={{ height: '100%' }}
          >
            <Output name="reqNum" />
            <Output name="reqType" />
            <Output name="createdByName" />
            <Output name="creationDate" />
            <Output name="reqStatus" renderer={colorTagRender} />
            <Output name="reqReason" />
          </Form>
        </Col>
      </Row>
    </div>
  );
};

export default BaseInfo;
