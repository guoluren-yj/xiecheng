import React, { useState, useEffect } from 'react';
import crypto from 'crypto-js';
import { getHomeDefaultLanguage } from 'srm-front-boot/lib/utils/utils';
import { queryIntl } from '@/utils/publicUtils';
import styles from './index.less';

const queryToObj = str => {
  if (!str) {
    return {};
  }
  const result = {};
  const strToArray = str.split('&');
  strToArray.map(item => {
    // 由于是base64加密之后会出现=，只替换第一个=为@@，并通过@@切割
    const [key, value] = item.replace('=', '@@').split('@@');
    result[key] = value;
    return item;
  });
  return result;
};

const PageExpired = (props = {}) => {
  const {
    location: { search = '' },
  } = props;
  const { email = '' } = queryToObj(search.substr(1));

  const [intl, setIntl] = useState({});

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    const lang = await getHomeDefaultLanguage();
    queryIntl(lang || 'en_US', 'srm.portal', 'srm.oauth,smbl.common,hzero.common').then(res => {
      setIntl(res);
    });
  };

  const renderFooter = () => {
    const message =
      intl['srm.oauth.page.expired.footer'] ||
      'If you have any questions, please send email to {account} for help.';
    const messageArr = message.split('{account}');
    const account = crypto.enc.Utf16.stringify(crypto.enc.Base64.parse(email)) || '';
    return (
      <>
        {account && (
          <span>
            {messageArr[0] || ''}
            {/* <span>{account}</span> */}
            <a className={styles['footer-email']}>{account}</a>
            {messageArr[1] || ''}
          </span>
        )}
      </>
    );
  };

  return (
    <div className={styles['expired-content']}>
      <div className="expired-content-middle">
        <div>
          <h1>{intl['srm.oauth.page.expired.head'] || 'Page Expired'}...</h1>
          <p className="expired-content-middle-message">
            {intl['srm.oauth.page.expired.message'] ||
              'Sorry, this page is no longer valid, you need to reopen the email and click/copy the link to verify.'}
          </p>
        </div>
      </div>
      <div className="expired-content-footer">{renderFooter()}</div>
    </div>
  );
};

export default React.memo(PageExpired);
