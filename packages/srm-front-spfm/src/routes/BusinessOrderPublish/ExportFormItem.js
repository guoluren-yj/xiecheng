/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2022-02-16 21:25:38
 * @LastEditors: yanglin
 * @LastEditTime: 2022-06-07 21:25:26
 */
import React, { useEffect } from 'react';
import { Select, Form, Row, Col, useDataSet } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { isFunction } from 'lodash';

const Index = function BaseInfo({ onChange }) {
  const formDs = useDataSet(
    () => ({
      autoCreate: true,
      dataToJSON: 'all',
      selection: false,
      fields: [
        {
          name: 'notificationFlag',
          type: 'string',
          lookupCode: 'HPFM.FLAG',
          label: intl.get(`spfm.businessOrder.view.model.notificationFlag`).d('是否签收'),
        },
      ],
      events: {
        update: ({ name, value }) => {
          if (name === 'notificationFlag') {
            if (isFunction(onChange)) {
              onChange(value);
            }
          }
        },
      },
    }),
    []
  );

  useEffect(() => {
    if (isFunction(onChange)) {
      onChange(undefined);
    }
  }, []);

  const form = (
    <Form dataSet={formDs} showLines={6} columns={3} labelLayout="float" useColon={false}>
      <Select name="notificationFlag" />
    </Form>
  );

  return (
    <Row>
      <Col span={18}>{form}</Col>
    </Row>
  );
};

export default Index;
