import React, { useMemo, useEffect } from 'react';
import classNames from 'classnames';
import { withRouter } from 'dva/router';
import { Select } from 'hzero-ui';
import { connect } from 'dva';

import intl from 'utils/intl';
import { getCurrentUser } from 'utils/utils';

import styles from '../index.less';

function Header(props) {
  const {
    language,
    supportLanguage = [],
    loading = false,
    querySupportLanguage,
    onChangeLanguage,
    onUpdateDefaultLanguage,
    history,
  } = props;

  const currentUser = useMemo(() => getCurrentUser(), []);

  useEffect(() => {
    querySupportLanguage();
  }, []);

  const handleLanguageSelectChange = (newLanguage) => {
    Promise.all([onChangeLanguage(newLanguage), onUpdateDefaultLanguage({ newLanguage })]).then(
      () => {
        window.location.reload();
      }
    );
  };

  const handleBack = () => {
    history.goBack();
  };

  return (
    <div className={styles.header}>
      <div className={styles['header-topbar']}>
        <div className={styles['header-topbar-container']}>
          <Select
            size="small"
            className={classNames('select-no-border')}
            value={language}
            onChange={handleLanguageSelectChange}
            disabled={loading}
          >
            {supportLanguage.map((locale) => (
              <Select.Option
                key={locale.code}
                value={locale.code}
                className="hzero-normal-header-container-language"
              >
                {locale.name}
              </Select.Option>
            ))}
          </Select>
        </div>
        <div className={styles['user-info']}>
          <a onClick={handleBack}>{intl.get('hzero.common.button.back').d('返回')}</a>
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
)(withRouter(Header));
