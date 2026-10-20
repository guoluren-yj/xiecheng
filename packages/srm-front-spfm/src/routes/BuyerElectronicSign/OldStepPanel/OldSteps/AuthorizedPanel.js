/**
 * 授权步骤页
 */
import React, { useState } from 'react';
import intl from 'utils/intl';
// import { getResponse } from 'utils/utils';
import { Button, Modal } from 'choerodon-ui/pro';

import { ReactComponent as AuthorizedSvg } from '@/assets/sign/authorized.svg';
// import { } from '@/services/supplierElecSignWorkplaceService';

import ElectronicSignatureLov from '../../ElectronicSignatureLov';

import PrivacyStatement from './PrivacyStatement';
import styles from './index.less';

export default function AuthorizedPanel(props) {
  const {
    companyDetail = {},
    // redirectUrl = '',
    // companyId = '',
    tenantId = '',
    authType = '',
    onRefreshStatus = () => {},
  } = props;

  const [visible, setVisible] = useState(false);

  const handleToAuth = async () => {
    setVisible(true);
  };

  const { origin } = window.location;

  const redirectUrl = `${origin}/app/spfm/signature-workplace`;

  // 跳转详情页
  const pushToDetail = () => {};

  return (
    <div
      style={{
        height: 'calc(100vh - 280px)',
        display: 'flex',
        justifyContent: 'center',
        flexDirection: 'column',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <AuthorizedSvg style={{ width: '160px', height: '102px' }} />
      </div>

      <div className={styles['ca-auth-second-level-msg']} style={{ marginTop: '8px' }}>
        {intl
          .get('spfm.buyerElectronicSign.view.message.oldStep.toAuthSign')
          .d(
            '请点击下方“开通电子签章服务”按钮，跳转第三方平台完成企业授权，只有授权完成才可以在SRM平台使用印章管理、印章授权功能'
          )}
      </div>

      <div style={{ textAlign: 'center', marginTop: '16px' }}>
        {authType === 'FDD' ? (
          <ElectronicSignatureLov
            queryParams={{ tenantId }}
            companyDetail={companyDetail}
            redirectUrl={redirectUrl}
            authType={authType}
            tenantId={tenantId}
            onRefresh={() => onRefreshStatus()}
          />
        ) : (
          <Button
            color="primary"
            style={{ width: '160px', marginRight: '8px' }}
            onClick={handleToAuth}
          >
            {intl.get('spfm.buyerElectronicSign.view.button.openSignService').d('开通电子签章服务')}
          </Button>
        )}
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
