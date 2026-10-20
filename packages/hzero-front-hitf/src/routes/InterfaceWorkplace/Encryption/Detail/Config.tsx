import React, { useState, useCallback } from 'react';
import classnames from 'classnames';
import { DataSet, Form, TextField, Select, Row, Col, Spin } from 'choerodon-ui/pro';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';
import formatterCollections from 'srm-front-boot/lib/utils/intl/formatterCollections';
import intl from 'hzero-front/lib/utils/intl';
import { getResponse } from 'hzero-front/lib/utils/utils';
import notification from 'hzero-front/lib/utils/notification';

import { getEncryKey } from '@/services/InterfaceWorkplaceService';

import styles from './index.less';

interface ConfigProps {
  formDs: DataSet,
  editHeaderId: string,
  appStatus: boolean,
}

const Config: React.FC<ConfigProps> = ({ formDs, editHeaderId, appStatus }) => {
  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState(formDs.current?.get('encryMethod'));

  // 获取密钥
  const handleEncryKey = useCallback(() => {
    if (!method || method === 'BASE64') {
      // 未选择加密算法或加密算法为base64时，不获取密钥
      return;
    }
    setLoading(true);
    getEncryKey(editHeaderId).then(res => {
      const result = getResponse(res);
      if (result) {
        notification.success({});
      }
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  const handleMethod = useCallback((value) => {
    setMethod(value);
  }, []);

  return (
    <Spin spinning={loading}>
      <Form labelLayout={LabelLayout.float} dataSet={formDs}>
        <Row gutter={16}>
          <Col span={10}>
            <Select name="encryDirection" disabled={!appStatus} />
          </Col>
          <Col span={10}>
            <Select name="encryMethod" onChange={handleMethod} disabled={!appStatus} />
          </Col>
          <Col span={4}>
            <div
              className={classnames({
                [styles['encry-config-key']]: true,
                [styles['encry-config-key-disable']]: !method || method === 'BASE64',
              })}
              onClick={handleEncryKey}
            >
              {intl.get('hitf.services.view.button.getEncryptKey').d('获取密钥')}
            </div>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={10}>
            <TextField name="publicKey" disabled />
          </Col>
          <Col span={10}>
            <TextField name="privateKey" disabled />
          </Col>
        </Row>
      </Form>
    </Spin>
  );
};

export default React.memo(formatterCollections({
  code: ['hzero.common', 'hitf.common', 'hitf.interface', 'hitf.services'],
})(Config));
