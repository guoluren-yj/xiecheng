/**
 * PortalFooter - 门户页尾
 * @date: 2021-07-08
 * @author: Danica <ke.wang01@gonig-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Hand
 */

import React, { useMemo, useState, useEffect } from 'react';
import { RichText } from 'choerodon-ui/pro';
import Cookies from 'universal-cookie';
import request from 'utils/request';
import { SRM_PLATFORM } from '@/utils/config';
import styles from './index.less';

import { userAgreement, privacyAgreement } from '../util';

const cookies = new Cookies();

const { RichTextViewer } = RichText;
interface PortalFooterProps {
  footerList?: Array<any>;
  footerRemarks?: any;
  _tls?: any;
  auto?: boolean;
  h?: number;
}

const getLayoutFooterConfig = () => {
  return request(`${SRM_PLATFORM}/v1/portal-layouts/layout-footer`, {
    method: 'GET',
  });
};

const minHeight = 82;

const intl = (language) => {
  const srmOauth = window.sessionStorage.getItem(`${language}-srm.portal`);
  if (srmOauth) {
    return JSON.parse(srmOauth);
  }
  return {};
};

const FooterContent: React.FC<PortalFooterProps> = ({
  footerList = [],
  footerRemarks,
  _tls = {},
  auto = false,
  h = 1,
}) => {
  const [language, setLanguage] = useState('');
  const oauthIntl = useMemo(() => intl(language), [language]);
  const computeStyle = useMemo(() => {
    const borderTop = footerList.length ? '1px solid #dcdcdc' : 'none';
    if (auto) {
      const { offsetWidth } = document.body;
      return {
        height: footerList.length || !auto ? Math.min(offsetWidth, 1180) / 24 * h : minHeight,
        marginTop: 15,
        borderTop,
      };
    }
    return { minHeight, borderTop };
  }, [h, footerList]);
  const remarks = _tls.footerRemarks && _tls.footerRemarks[language] || footerRemarks;

  // 定时器调用次数
  const [count, setCount] = useState(0);

  let timer: any = null;
  const startTimer = () => {
    clearInterval(timer);
    timer = setInterval(() => {
      setLanguage(cookies.get('language'));
      setCount(count + 1);
    }, 300);
  };

  useEffect(() => {
    if (!language) {
      startTimer();
    }
    // 一直拿不到cookie的值，在执行定时器3次后清空定时器
    if(count > 2){
      clearInterval(timer);
    }
    return () => {
      clearInterval(timer);
    };
  }, [language, count]);

  return (
    <div className={styles['portal-footer-container']} style={computeStyle}>
      <div className="portal-footer-content">
        {footerList.length ? (
          <div className="portal-footer-wrapper">
            {footerList.map((item) => (
              <RichTextViewer className="portal-footer-slide" deltaOps={item[language]} />
            ))}
          </div>
        ) : null}
        <div
          className="portal-footer-remarks"
          style={{ height: minHeight }}
        >
          <div className="remarks-terms">
            <a href={userAgreement} target="_blank'">{oauthIntl['srm.oauth.register.agreement.user'] || '注册协议'}</a>
            <a href={privacyAgreement} target="_blank">{oauthIntl['srm.oauth.register.agreement.privacy'] || '隐私政策说明'}</a>
          </div>
          <div className="remarks-txt">
            {auto ? remarks : (remarks || oauthIntl['srm.oauth.view.copyRight'] || 'CopyRight©2023 上海甄云信息科技有限公司 | 沪ICP备18039109号-4')}
          </div>
        </div>
      </div>
    </div>
  );
};

const PortalFooter: React.FC<PortalFooterProps> = (props) => {
  const [data, setData] = useState(props);
  const [language, setLanguage] = useState('');
  // 定时器调用次数
  const [count, setCount] = useState(0);
  const oauthIntl = useMemo(() => intl(language), [language]);

  let timer: any = null;
  const startTimer = () => {
    clearInterval(timer);
    timer = setInterval(() => {
      setLanguage(cookies.get('language'));
      setCount(count + 1);
    }, 300);
  };

  useEffect(() => {
    if (!language) {
      startTimer();
    }
    // 一直拿不到cookie的值，在执行定时器3次后清空定时器，给默认中文
    if(count > 2 && !language){
      clearInterval(timer);
      setLanguage('zh_CN');
    }
    return () => {
      clearInterval(timer);
    };
  }, [language, count]);

  useEffect(() => {
    if (props.auto && language) {
      getLayoutFooterConfig().then(res => {
        if (res && res.cardCategory === 'Footer') {
          res = JSON.parse(JSON.stringify(res).replace(/\\\\n/g, '\\n'));
          const { cardContent = {}, h } = res;
          setData({
            ...props,
            footerList: cardContent.footerList,
            footerRemarks: cardContent.footerRemarks || oauthIntl['srm.oauth.view.copyRight'] || 'CopyRight©2023 上海甄云信息科技有限公司 | 沪ICP备18039109号-4',
            _tls: cardContent._tls,
            h,
          });
        } else {
          setData({
            footerRemarks: oauthIntl['srm.oauth.view.copyRight'] || 'CopyRight©2023 上海甄云信息科技有限公司 | 沪ICP备18039109号-4',
            ...props,
          });
        }
      });
    }
  }, [props.auto, language]);

  return useMemo(() => {
    if (props.auto) {
      return <FooterContent {...data} />;
    }
    return <FooterContent {...props} />;
  }, [props, data]);
};

export default React.memo(PortalFooter);
