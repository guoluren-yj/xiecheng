/**
 * CA认证步骤
 */
import React, { useState } from 'react';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';
import { Button, Modal } from 'choerodon-ui/pro';

import { ReactComponent as CaAuthSvg } from '@/assets/sign/caAuth.svg';
import { companyVerify, commonCompanyVerify } from '@/services/supplierElecSignWorkplaceService';

import PrivacyStatement from './PrivacyStatement';
import styles from './index.less';

export default function CaAuth(props) {
  const { origin } = window.location;

  const {
    companyDetail = {},
    authType = '',
    onRefreshStatus = () => {},
    tenantId,
    detailDataSource,
  } = props;

  const [visible, setVisible] = useState(false);

  const handleToAuth = async () => {
    setVisible(true);
  };

  // 跳转详情页
  const pushToDetail = async () => {
    if (authType === 'FDD') {
      const res = companyVerify({
        ...companyDetail,
        ...detailDataSource,
        authType,
        redirectUrl: `${origin}/app/spfm/signature-workplace`,
        tenantId,
      });
      if (getResponse(res)) {
        try {
          const response = JSON.parse(res);
          if (response.failed) {
            notification.error({ message: response.message || response.code });
          }
        } catch (error) {
          window.open(res);
          setVisible(false);
          onRefreshStatus(companyDetail);
        }
      }
    } else {
      const res = await commonCompanyVerify({
        ...companyDetail,
        ...detailDataSource,
        authType,
        tenantId,
      });
      if (res) {
        try {
          const response = JSON.parse(res);
          if (response.failed) {
            notification.error({ message: response.message || response.code });
          }
        } catch (error) {
          window.open(res);
          setVisible(false);
          onRefreshStatus(companyDetail);
        }
      }
    }
  };

  return (
    <div
      style={{
        height: 'calc(100vh - 280px)',
        display: 'flex',
        justifyContent: 'center',
        flexDirection: 'column',
      }}
    >
      <div className={styles['real-ca-auth-block-panel']}>
        <CaAuthSvg style={{ width: '160px', height: '102px' }} />
      </div>

      <div className={styles['ca-auth-second-level-msg']} style={{ marginTop: '8px' }}>
        {intl
          .get('spfm.buyerElectronicSign.view.message.oldStep.refreshToNext')
          .d('请点击下方“去认证”按钮，跳转第三方平台完成认证')}
      </div>

      <div style={{ textAlign: 'center', marginTop: '16px' }}>
        <Button
          color="primary"
          style={{ width: '160px', marginRight: '8px' }}
          onClick={handleToAuth}
        >
          {intl.get('spfm.buyerElectronicSign.view.button.toAuth').d('去认证')}
        </Button>
      </div>

      {visible && (
        <Modal
          key={Modal.key()}
          width={600}
          visible={visible}
          className={styles['theme-config-protocol']}
          onCancel={() => setVisible(false)}
          destroyOnClose
          footer={null}
        >
          <PrivacyStatement
            onCancel={() => setVisible(false)}
            handleOk={pushToDetail}
            authType={authType}
          />
        </Modal>
      )}
    </div>
  );
}
