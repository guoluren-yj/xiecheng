import React from 'react';
import { observer } from 'mobx-react-lite';

import { DataSet, Form, Select, NumberField, Row, Col } from 'choerodon-ui/pro';

import formatterCollections from 'srm-front-boot/lib/utils/intl/formatterCollections';

import intl from 'hzero-front/lib/utils/intl';

import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';

import dataStore from '../dataStore';

import styles from './index.less';

interface ExtendedInfoProps {
  formDs: DataSet,
  serviceType: String,
}

const ExtendedInfo: React.FC<ExtendedInfoProps> = ({ formDs, serviceType }) => {
  const { exportType } = dataStore;

  return (
    <div className={styles['extended-info']}>
      <Form labelLayout={LabelLayout.float} dataSet={formDs}>
        <div className={styles['extended-info-header']}>
          <span className={styles['extended-info-header-border']} />
          <span>{intl.get('hitf.common.data.transport.limit').d('数据传输限制')}</span>
        </div>
        <Row gutter={16}>
          <Col span={6}>
            <Select
              name="exportType"
              disabled={(serviceType === 'inside' || !exportType)}
            />
          </Col>
          {serviceType === 'inside' ? (
            <Col span={6}>
              <NumberField name="maxBatchAmount" />
            </Col>
          ) : (
            <Col span={6}>
              <Select
                name="limitFlag"
              />
            </Col>
            )
          }
          {serviceType === 'inside' ? (
            <Col span={6}>
              <NumberField name="maxBatchSize" />
            </Col>
          ) : (
            <Col span={6}>
              <NumberField name="limitSize" />
            </Col>
            )
          }
        </Row>
        {
          serviceType === 'inside' && (
            <>
              <Row gutter={16}>
                <Col span={6}>
                  <Select
                    name="limitFlag"
                  />
                </Col>
                <Col span={6}>
                  <NumberField name="limitSize" />
                </Col>
              </Row>
            </>
          )
        }
        <div className={styles['extended-info-header']} style={{ marginTop: '32px' }}>
          <span className={styles['extended-info-header-border']} />
          <span>{intl.get('hitf.common.fail.rerun').d('失败重跑')}</span>
        </div>
        <Row gutter={16}>
          <Col span={6}>
            <Select name="retryFlag" />
          </Col>
          <Col span={6}>
            <NumberField name="retryCount" />
          </Col>
          <Col span={6}>
            <NumberField name="retryInterval" />
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default React.memo(formatterCollections({
  code: ['hzero.common', 'hitf.common', 'hitf.application'],
})(observer(ExtendedInfo)));
