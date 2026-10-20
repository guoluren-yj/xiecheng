import React, { useState, useCallback, useEffect, useMemo } from 'react';
import classnames from 'classnames';
import { Tabs } from 'choerodon-ui';
import { DataSet, Form, TextField, Select, Row, Col, Spin, CheckBox } from 'choerodon-ui/pro';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';
import formatterCollections from 'srm-front-boot/lib/utils/intl/formatterCollections';
import intl from 'hzero-front/lib/utils/intl';
import { getResponse } from 'hzero-front/lib/utils/utils';
import notification from 'hzero-front/lib/utils/notification';

import { getEncryKey, getEncryConfig } from '@/services/InterfaceWorkplaceService';

import styles from './index.less';

const { TabPane } = Tabs;

interface ConfigProps {
  inFormDs: DataSet,
  outFormDs: DataSet,
  tenantInterfaceId: number,
  editHeaderId: string,
  childRef: any,
  appStatus: boolean,
}

const Config: React.FC<ConfigProps> = ({ inFormDs, outFormDs, tenantInterfaceId, editHeaderId, childRef, appStatus }) => {
  const [loading, setLoading] = useState(false);
  const [tabKey, setTabKey] = useState('push');
  const [inMethod, setInMethod] = useState(inFormDs.current?.get('encryMethod'));
  const [outMethod, setOutMethod] = useState(outFormDs.current?.get('encryMethod'));

  useEffect(() => {
    setLoading(true);
    getEncryConfig(tenantInterfaceId).then(res => {
      const result = getResponse(res);
      if (result) {
        if (inFormDs.current) {
          const { status } = result[0];
          inFormDs.current.set({...result[0], inStatus: Boolean(status)});
        }
        if (outFormDs.current) {
          const { status } = result[1];
          outFormDs.current.set({...result[1], outStatus: Boolean(status)});
        }
      }
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  if (childRef) {
    // eslint-disable-next-line no-param-reassign
    childRef.current = {
      lineTabKey: tabKey,
    };
  }

  const handleTabs = useCallback((key) => {
    setTabKey(key);
  }, []);

  // 获取密钥
  const handleEncryKey = useCallback(() => {
    const method = tabKey === 'push' ? inMethod : outMethod;
    if (!method || method === 'BASE64' || !appStatus) {
      // 未选择加密算法或加密算法为base64时，不获取密钥
      // 应用已发布，不获取密钥
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
  }, [tabKey, inMethod, outMethod]);

  const handleMethod = useCallback((value) => {
    if (tabKey === 'push') {
      setInMethod(value);
    } else {
      setOutMethod(value);
    }
  }, [tabKey]);

  const formRender = useMemo(() => {
    const method = tabKey === 'push' ? inMethod : outMethod;
    return (
      <Form labelLayout={LabelLayout.float} dataSet={tabKey === 'push' ? inFormDs : outFormDs}>
        <Row gutter={16}>
          <Col span={10}>
            <Select name="encryDirection" disabled />
          </Col>
          <Col span={10}>
            <Select name="encryMethod" onChange={handleMethod} disabled={!appStatus} />
          </Col>
          <Col span={4}>
            <div
              className={classnames({
                [styles['encry-config-key']]: true,
                [styles['encry-config-key-disable']]: !method || method === 'BASE64' || !appStatus,
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
        <Row gutter={16}>
          <Col span={10}>
            <CheckBox name={tabKey === 'push' ? 'inStatus' : 'outStatus'} disabled={!appStatus} />
          </Col>
        </Row>
      </Form>
    );
  }, [inMethod, outMethod, tabKey, inFormDs, outFormDs]);

  return (
    <Spin spinning={loading}>
      <Tabs activeKey={tabKey} onChange={handleTabs}>
        <TabPane tab={intl.get('hitf.services.view.title.in').d('入站')} key="push">
          {formRender}
        </TabPane>
        <TabPane tab={intl.get('hitf.services.view.title.out').d('出站')} key="out">
          {formRender}
        </TabPane>
      </Tabs>
    </Spin>
  );
};

export default React.memo(formatterCollections({
  code: ['hzero.common', 'hitf.common', 'hitf.interface', 'hitf.services'],
})(Config));
