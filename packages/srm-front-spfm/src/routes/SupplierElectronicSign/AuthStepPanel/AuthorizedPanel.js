/**
 * 授权步骤页
 */
import React from 'react';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import { Button } from 'choerodon-ui/pro';

import { ReactComponent as AuthorizedSvg } from '@/assets/sign/authorized.svg';
import {
  fetchAuthorizedUrl,
  fetchCancelAuthorized,
  // fetchRefreshAuth,
} from '@/services/supplierElecSignWorkplaceService';

import styles from './index.less';

export default function AuthorizedPanel(props) {
  const {
    companyDetail = {},
    redirectUrl = '',
    companyId = '',
    tenantId = '',
    authType = '',
    onRefreshStatus = () => {},
  } = props;

  const handleToAuth = async () => {
    if (companyId) {
      const res = await fetchAuthorizedUrl({
        companyId,
        tenantId,
        partnerCode: authType,
        redirectUrl: `${redirectUrl}&pageStep=finish`,
      });

      if (getResponse(res) && res.authUrl) {
        window.open(res.authUrl);
      }
      onRefreshStatus(companyDetail);
    }
  };

  const handleCancelAuth = async () => {
    if (companyId) {
      const res = await fetchCancelAuthorized({
        companyId,
        tenantId,
        orderTenantId: tenantId,
        sourceMenu: 'sel',
      });

      if (getResponse(res)) {
        onRefreshStatus(companyDetail);
      }
    }
  };

  // 刷新操作
  const handleRefresh = async () => {
    // if (companyId) {
    //   const res = await fetchRefreshAuth({
    //     companyId,
    //     tenantId,
    //   });
    //   if (getResponse(res)) {
    //     onRefreshStatus(companyDetail);
    //   }
    // }
    onRefreshStatus(companyDetail);
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
      {/* className={styles['real-ca-auth-block-panel']} */}
      <div style={{ textAlign: 'center' }}>
        <AuthorizedSvg style={{ width: '160px', height: '102px' }} />
      </div>
      <div className={styles['real-name-auth-first-level-msg']} style={{ marginTop: '20px' }}>
        {intl.get('spfm.buyerElectronicSign.view.message.authorized').d('授权')}
      </div>

      <div className={styles['ca-auth-second-level-msg']} style={{ marginTop: '8px' }}>
        {!(companyDetail && [3, '3'].includes(companyDetail.authorizeStatus))
          ? intl
              .get('spfm.buyerElectronicSign.view.message.toAuthMsg')
              .d('请点击下方“去授权”按钮跳转第三方平台完成授权')
          : intl
              .get('spfm.buyerElectronicSign.view.message.refreshToAuthorizeMsg')
              .d(
                '请点击下方“刷新”按钮进入下一步；或点击“取消授权”按钮，重新跳转第三方页面操作授权'
              )}
      </div>

      <div style={{ textAlign: 'center', marginTop: '16px' }}>
        {!(companyDetail && [3, '3'].includes(companyDetail.authorizeStatus)) ? (
          <span>
            <Button
              color="primary"
              style={{ width: '160px', marginRight: '8px' }}
              onClick={handleToAuth}
            >
              {intl.get('spfm.buyerElectronicSign.view.button.toAuthorized').d('去授权')}
            </Button>
          </span>
        ) : (
          <span>
            <Button style={{ width: '160px', marginRight: '8px' }} onClick={handleCancelAuth}>
              {intl.get('spfm.buyerElectronicSign.view.button.cancelAuthorized').d('取消授权')}
            </Button>
            <Button onClick={handleRefresh}>
              {intl.get('spfm.buyerElectronicSign.view.button.refresh').d('刷新')}
            </Button>
          </span>
        )}
      </div>
    </div>
  );
}
