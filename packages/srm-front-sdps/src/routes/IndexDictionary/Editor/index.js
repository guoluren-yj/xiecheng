import React, { useEffect } from 'react';
import intl from 'utils/intl';
import { Modal } from 'choerodon-ui';
import { Form, TextField, Row, Col, NumberField, Select, IntlField } from 'choerodon-ui/pro';

import styles from './index.less';

const { Sidebar } = Modal;

export default function Editor(props) {
  const { visible, dataSet, rowData, onCreate = () => {}, onCancel = () => {} } = props;

  useEffect(() => {
    return () => {
      dataSet.data = [];
      dataSet.reset();
    };
  }, []);

  useEffect(() => {
    if (rowData && rowData.get('indexId')) {
      dataSet.setQueryParameter('indexId', rowData.get('indexId'));
      dataSet.query();
    }
  }, [rowData]);

  return (
    <>
      <Sidebar
        title={intl.get('sdps.indexDictionary.view.title.indexDetail').d('指标详情')}
        visible={visible}
        onOk={onCreate}
        onCancel={onCancel}
        width={362}
        closable
        contentStyle={{ height: '100%' }}
        bodyStyle={{ height: '100%' }}
        zIndex={2}
      >
        <div className={styles['sdps-index-dictionary-editor-basic']}>
          <Form dataSet={dataSet} labelLayout="float">
            <div className={styles['index-drawer-form-title']} style={{ marginBottom: '8px' }}>
              {intl.get('sdps.indexDictionary.view.title.basicInfo').d('基本信息')}
            </div>
            <Row gutter={12}>
              <Col span={24}>
                <Form.Item>
                  <TextField name="indexCode" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={12}>
              <Col span={24}>
                <Form.Item>
                  <IntlField name="indexName" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={12}>
              <Col span={24}>
                <Form.Item>
                  <Select name="indexType" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={12}>
              <Col span={24}>
                <Form.Item>
                  <Select name="dataType" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={12}>
              <Col span={24}>
                <Form.Item>
                  <NumberField name="sort" />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </div>
      </Sidebar>
    </>
  );
}
