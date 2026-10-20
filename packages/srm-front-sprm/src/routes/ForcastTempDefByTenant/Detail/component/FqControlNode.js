/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2023-03-13 10:59:39
 * @LastEditors: yanglin
 * @LastEditTime: 2023-11-02 17:06:09
 */
import React, { useContext } from 'react';
import { SelectBox, Form, Row, Col } from 'choerodon-ui/pro';
import { Store } from '../stores';

const FqControlNode = function FqControlNode() {
  const { headerDs } = useContext(Store);

  return (
    <Row>
      <Col span={18}>
        <Form
          dataSet={headerDs}
          labelAlign="left"
          columns={1}
          useColon={false}
          useWidthPercent
          labelWidth={260}
          className="form-select-box"
        >
          <SelectBox name="deliverControlType" style={{ width: 300 }} vertical showHelp="label" />
          {/* <SelectBox name="deliverControlNode" style={{ width: 300 }} vertical /> */}
        </Form>
      </Col>
    </Row>
  );
};

export default FqControlNode;
