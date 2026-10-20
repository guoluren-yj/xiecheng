import React, { useContext } from 'react';
import { Form, Row, Col, SelectBox } from 'choerodon-ui/pro';
import { Store } from '../../Detail/stores';

const FqControlNode = function FqControlNode() {
  const { headerDs } = useContext(Store);

  return (
    <Row>
      <Col span={18}>
        <Form dataSet={headerDs} labelAlign="left" columns={1} useColon={false} labelWidth={260}>
          <SelectBox name="deliverControlType" disabled vertical showHelp="label" />
          {/* <SelectBox name="deliverControlNode" disabled vertical /> */}
        </Form>
      </Col>
    </Row>
  );
};

export default FqControlNode;
