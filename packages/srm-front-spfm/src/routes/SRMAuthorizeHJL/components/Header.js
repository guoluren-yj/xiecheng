import React, { useMemo, useEffect } from 'react';
import { connect } from 'dva';

import { getCurrentUser } from 'utils/utils';

import styles from '../index.less';

function Header(props) {
  const { querySupportLanguage } = props;

  const currentUser = useMemo(() => getCurrentUser(), []);

  useEffect(() => {
    querySupportLanguage();
  }, []);

  return (
    <div className={styles.header}>
      <div className={styles['header-topbar']}>
        <div className={styles['user-info']}>
          <span>{currentUser.realName || currentUser.currentRoleName || ''}</span>
        </div>
      </div>
    </div>
  );
}

export default connect(
  ({ global = {}, loading = { effects: {} } }) => ({
    supportLanguage: global.supportLanguage, // 可供切换的语言
    language: global.language, // 当前的语言
    loading:
      loading.effects['global/changeLanguage'] ||
      loading.effects['global/updateDefaultLanguage'] ||
      loading.effects['global/querySupportLanguage'],
  }),
  (dispatch) => ({
    onChangeLanguage: (payload) =>
      dispatch({
        type: 'global/changeLanguage',
        payload,
      }),
    onUpdateDefaultLanguage: (payload) =>
      dispatch({
        type: 'global/updateDefaultLanguage',
        payload,
      }),
    querySupportLanguage: () =>
      dispatch({
        type: 'global/querySupportLanguage',
      }),
  })
)(Header);
