/**
 * CA认证步骤
 */
import React from 'react';
import intl from 'utils/intl';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import notification from 'utils/notification';
import { Button } from 'choerodon-ui/pro';

import { ReactComponent as CaAuthSvg } from '@/assets/sign/caAuth.svg';
import {
  fetchCompanyAuthUrl,
  fetchCancelAuth,
  // fetchRefreshAuth,
} from '@/services/electronicSignWorkplaceService';

import styles from './index.less';

export default function CaAuth(props) {
  const { companyDetail = {}, redirectUrl = '', onRefreshStatus = () => {} } = props;

  const handleToAuth = async () => {
    if (companyDetail.companyId) {
      const res = await fetchCompanyAuthUrl({
        companyId: companyDetail.companyId,
        redirectUrl,
      });

      if (getResponse(res)) {
        if (!res) return;
        if (res.finish) {
          notification.info({
            message: intl.get('hzero.common.message.confirm.title').d('提示'),
            description: intl
              .get('spfm.buyerElectronicSign.view.message.doneAlert')
              .d(
                '该企业此前已完成实名认证，已帮您同步实名结果，当前还需完成企业授权，请继续授权操作。'
              ),
          });
        } else if (res.authUrl) {
          window.open(res.authUrl);
        }

        onRefreshStatus(companyDetail);
      }
    }
  };

  /**
   * 取消认证
   */
  const handleCancelAuth = async () => {
    if (companyDetail.companyId) {
      const res = await fetchCancelAuth({
        companyId: companyDetail.companyId,
        redirectUrl,
        orderTenantId: getCurrentOrganizationId(),
        sourceMenu: 'pur',
      });
      if (getResponse(res)) {
        onRefreshStatus(companyDetail);
      }
    }
  };

  // 刷新操作
  const handleRefresh = async () => {
    // if (companyDetail.companyId) {
    //   const res = await fetchRefreshAuth({
    //     companyId: companyDetail?.companyId ?? '',
    //   });
    //   if (getResponse(res)) {
    //     onRefreshStatus(companyDetail);
    //   }
    // }
    return onRefreshStatus(companyDetail);
  };

  return (
    <div
      style={{
        height: 'calc(100vh - 244px)',
        display: 'flex',
        justifyContent: 'center',
        flexDirection: 'column',
      }}
    >
      <div className={styles['real-ca-auth-block-panel']}>
        <CaAuthSvg style={{ width: '160px', height: '102px' }} />
      </div>
      <div className={styles['real-name-auth-first-level-msg']} style={{ marginTop: '20px' }}>
        {intl.get('spfm.buyerElectronicSign.view.message.caAuth').d('CA认证')}
      </div>

      <div className={styles['ca-auth-second-level-msg']} style={{ marginTop: '8px' }}>
        {!(companyDetail && [3, '3'].includes(companyDetail.authStatus))
          ? intl.get('spfm.buyerElectronicSign.view.message.oldStep.refreshToNext')
          : intl.get('spfm.buyerElectronicSign.view.message.refreshToNext')}
      </div>

      <div style={{ textAlign: 'center', marginTop: '16px' }}>
        {!(companyDetail && [3, '3'].includes(companyDetail.authStatus)) ? (
          <span>
            <Button
              color="primary"
              style={{ width: '160px', marginRight: '8px' }}
              onClick={handleToAuth}
            >
              {intl.get('spfm.buyerElectronicSign.view.button.toAuth').d('去认证')}
            </Button>
          </span>
        ) : (
          <span>
            <Button
              color="primary"
              style={{ width: '80px', marginRight: '8px' }}
              onClick={handleToAuth}
            >
              {intl.get('spfm.buyerElectronicSign.view.button.continueAuth').d('继续认证')}
            </Button>
            <Button style={{ width: '80px', marginRight: '8px' }} onClick={handleCancelAuth}>
              {intl.get('spfm.buyerElectronicSign.view.button.cancelAuth').d('取消认证')}
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
