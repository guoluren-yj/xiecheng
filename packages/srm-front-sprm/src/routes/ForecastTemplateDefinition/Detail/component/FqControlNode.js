import React, { useContext } from 'react';
import { SelectBox, Form, Row, Col } from 'choerodon-ui/pro';
import { Store } from '../stores';

const FqControlNode = function FqControlNode() {
  const { headerDs } = useContext(Store);

  return (
    <Row>
      <Col span={18}>
        <Form dataSet={headerDs} labelAlign="left" columns={1} useColon={false} labelWidth={260}>
          <SelectBox name="deliverControlType" style={{ width: 300 }} vertical showHelp="label" />
          {/* <SelectBox name="deliverControlNode" style={{ width: 300 }} vertical /> */}
        </Form>
      </Col>
    </Row>
  );
};

export default FqControlNode;
