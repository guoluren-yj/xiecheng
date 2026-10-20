import React from 'react';
import { observer } from 'mobx-react-lite';
import { Row, Col, Form, Button, TextField, Icon } from 'choerodon-ui/pro';

import intl from 'utils/intl';

import EditAttrForm from './EditAttrForm';

// import styles from './index.less';

const SpecAttrsForm = observer(({ dataSet }) => {
  return (
    <div>
      {dataSet.map((record, ind) => (
        <Form record={record} labelAlign="left" labelLayout="float">
          {record.get('isDel') ? (
            <Row className="spec-attr-row" gutter={12}>
              <Col span={11}>
                <TextField name="attrName" />
              </Col>
              <Col span={11}>
                <TextField name="attrValue" />
              </Col>
              <Col span={2} style={{ lineHeight: '28px' }}>
                <Icon type="delete" onClick={() => dataSet.remove(record)} />
              </Col>
            </Row>
          ) : (
            <EditAttrForm record={record} id={`spec_attr_${ind}`} />
          )}
        </Form>
      ))}
      <div style={{ marginBottom: 16 }}>
        <Button
          funcType="flat"
          color="primary"
          icon="playlist_add"
          onClick={() => dataSet.create({ isDel: true, attrType: 3 })}
        >
          {intl.get('smpc.product.model.addNewSpecs').d('新增新规格')}
        </Button>
      </div>
    </div>
  );
});

export default SpecAttrsForm;
