import React, { useState, useCallback } from 'react';
import { observer } from 'mobx-react-lite';

import { Icon } from 'choerodon-ui';
import { DataSet, Form, TextField, Select, Lov, Row, Col } from 'choerodon-ui/pro';

import formatterCollections from 'srm-front-boot/lib/utils/intl/formatterCollections';

import intl from 'hzero-front/lib/utils/intl';

import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';

import dataStore from '../dataStore';

import styles from './index.less';

interface BasicInfoProps {
  formDs: DataSet,
  serviceType: String,
}

const BasicInfo: React.FC<BasicInfoProps> = ({ formDs, serviceType }) => {
  const [flag, setFlag] = useState(false);
  const { setExportType } = dataStore;

  const changeExportType = useCallback((value) => {
    if (formDs.current) {
      if (value === 'EXPORT') {
        if(serviceType === 'inside') {
          formDs.current.set('exportType', 'EXTERNAL_QUERY');
        } else {
          formDs.current.set('exportType', 'ACTIVE_PUSH');
          setExportType(1);
        }
      } else {
        formDs.current.set('exportType', '');
        setExportType(0);
      }
    }
  }, []);

  return (
    <div className={styles['basic-info']}>
      <Form labelLayout={LabelLayout.float} dataSet={formDs}>
        <Row gutter={16}>
          <Col span={6}>
            <TextField name="interfaceCode" restrict={/[\u4e00-\u9fa5]/g} />
          </Col>
          <Col span={6}>
            <TextField name="interfaceName" />
          </Col>
          <Col span={6}>
            <Lov name="tenantLov" />
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={6}>
            <Select
              name="interfaceType"
              onChange={changeExportType}
            />
          </Col>
          <Col span={6}>
            <Lov
              name="interfaceCategoryLov"
            />
          </Col>
          <Col span={6}>
            <Select
              name="applicationType"
            />
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={6}>
            <Select name="publishType" />
          </Col>
          <Col span={6}>
            <Select
              name="requestMethod"
            />
          </Col>
          <Col span={6}>
            <Select
              name="interactiveMethod"
            />
          </Col>
        </Row>
        <Row gutter={16}>
          {/* <Col span={12}>
            <TextArea name="remark" />
          </Col> */}
          <Col span={6}>
            <Select name="status" />
          </Col>
        </Row>
        {
          flag && (
            <>
              {serviceType === 'inside' && (
                <Row gutter={16}>
                  <Col span={12}>
                    <TextField name="publishUrl" />
                  </Col>
                </Row>
              )}
              {serviceType === 'inside' && (
                <Row gutter={16}>
                  <Col span={12}>
                    <TextField name="interfaceUrl" />
                  </Col>
                  <Col span={6}>
                    <TextField name="interfaceStandardType" />
                  </Col>
                </Row>
              )}
              <Row gutter={16}>
                {serviceType === 'inside' ? (
                  <Col span={6}>
                    <TextField name="serviceCode" />
                  </Col>
                ) :
                  (
                    <Col span={6}>
                      <TextField name="interfaceStandardType" />
                    </Col>
                  )
                }
                <Col span={6}>
                  <TextField name="serviceType" />
                </Col>
                <Col span={6}>
                  <TextField name="creationName" />
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={6}>
                  <TextField name="creationDate" />
                </Col>
                <Col span={6}>
                  <TextField name="updateName" />
                </Col>
                <Col span={6}>
                  <TextField name="lastUpdateDate" />
                </Col>
              </Row>
            </>
          )
        }
        <div className={styles['expand-icon']}>
          {!flag ? (
            <span onClick={() => setFlag(!flag)}>
              {intl.get('hzero.common.button.expand').d('展开')}
              <Icon type="expand_more" />
            </span>
          ) : (
            <span onClick={() => setFlag(!flag)}>
              {intl.get('hzero.common.button.export.collected').d('收起')}
              <Icon type="expand_less" />
            </span>
            )}
        </div>
      </Form>
    </div>
  );
};

export default React.memo(formatterCollections({
  code: ['hzero.common', 'hitf.common', 'hitf.application'],
})(observer(BasicInfo)));
