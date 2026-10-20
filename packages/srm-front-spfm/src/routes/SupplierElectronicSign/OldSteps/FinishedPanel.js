/**
 * 完成步骤页
 */
import React from 'react';
import intl from 'utils/intl';
import { Button } from 'choerodon-ui/pro';

import { ReactComponent as FinishedStepSvg } from '@/assets/sign/finishStep.svg';

import styles from './index.less';

export default function FinishedPanel(props) {
  const { onRefreshToManage = () => {} } = props;

  // 刷新认证状态 进入认证完成页面
  const handleToManage = () => {
    onRefreshToManage();
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
      <div style={{ textAlign: 'center' }}>
        <FinishedStepSvg style={{ width: '160px', height: '102px' }} />
      </div>
      <div className={styles['real-name-auth-first-level-msg']} style={{ marginTop: '20px' }}>
        {intl
          .get('spfm.buyerElectronicSign.view.message.finishedAuth')
          .d('恭喜你！已完成用章前认证事项')}
      </div>

      <div className={styles['ca-auth-second-level-msg']} style={{ marginTop: '8px' }}>
        {intl
          .get('spfm.buyerElectronicSign.view.message.finishedAlert')
          .d('请点击下方按钮开始管理用印人员与印章')}
      </div>

      <div style={{ textAlign: 'center', marginTop: '16px' }}>
        <Button
          color="primary"
          style={{ width: '160px', marginRight: '8px' }}
          onClick={handleToManage}
        >
          {intl.get('spfm.buyerElectronicSign.view.button.toManagePeople').d('管理人员与用章')}
        </Button>
      </div>
    </div>
  );
}
