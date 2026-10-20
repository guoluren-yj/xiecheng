/**
 * PortalNotice - 中标/企业/平台公告
 * @date: 2021-07-06
 * @author: Danica <ke.wang01@gonig-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Hand
 */

import React, { useState, useMemo, useEffect } from 'react';
import { Icon } from 'choerodon-ui';
import { Modal, DataSet } from 'choerodon-ui/pro';
import { getAccessToken, getResponse } from 'hzero-front/lib/utils/utils';
import request from 'hzero-front/lib/utils/request';
import qs from 'querystring';
import Cookies from 'universal-cookie';
import Captcha from '@/components/Captcha';
import { getOrigin } from '@/utils/utils';
// import { SRM_SSRC } from '_utils/config';
// import { getToken } from '@/utils/utils';

import styles from './index.less';
import { monthToChinese } from '../util';

const cookies = new Cookies();
interface PortalNoticeProps {
  icon?: string;
  title?: string;
  cardCode: string;
  _tls?: any;
  cardTitleStatus?: number;
  footerMoreLink?: boolean;
}

interface OpLine {
  approvedDate: string;
  startDate: string;
  noticeDate: string;
  title: string;
  noticeBody: any;
  bidTitle: string;
  companyName: string;
  noticeTypeMeaning: string;
}

const PortalNotice: React.FC<PortalNoticeProps> = ({
  icon,
  title,
  cardCode,
  _tls = {},
  cardTitleStatus = 0,
  footerMoreLink = false,
}) => {
  const [userId] = useState(cookies.get('tenantId') || '0');
  const [noticeList, setNoticeList] = useState<OpLine[]>([]);
  const [isLogin] = useState(!!getAccessToken()); // 登录 && 登录态有效
  const [language] = useState(cookies.get('language') || 'zh_CN');

  //
  const noticeDs = useMemo(
    () =>
      new DataSet({
        transport: {
          read: () => {
            // 获取招标寻源列表
            return {
              url: `${getOrigin()}/ssrc/v1/${
                userId === '0' ? 'NO_TENANT' : userId
              }/source-notices/${isLogin ? '' : 'pub/'}br-accepted-list?asyncCountFlag=Y`,
              method: 'get',
              access_token: getAccessToken(),
              lang: language,
              size: 100,
              asyncCountFlag: 'Y',
            };
          },
        },
      }),
    []
  );
  const basePath = window.$$env.BASE_PATH || '/';
  useEffect(() => {
    const referrerMeta = document.querySelector('meta[content="no-referrer"]');
    if (referrerMeta) {
      referrerMeta.setAttribute('content', 'no-referrer-when-downgrade');
    }
  }, []);
  const oauthIntl = useMemo(() => {
    const srmOauth = window.sessionStorage.getItem(`${language}-srm.portal`);
    if (srmOauth) {
      return JSON.parse(srmOauth);
    }
    return {};
  }, [language]);

  useEffect(() => {
    getNoticeList();
    if (cardCode === 'SRM.ANNOUNCEMENT') {
      noticeDs.query().then(res => {
        if (res && !res.failed) {
          setNoticeList(res ? res.content : []);
        }
      });
    }
  }, [cardCode, noticeDs]);

  /**
   *  区分请求地址和list的跳转地址
   */
  const noticeObject = useMemo((): {
    url: string | null;
    href: string;
    more: string;
  } | null => {
    const origin = getOrigin();
    const hasLogin = isLogin ? '-haslogin' : '';
    if (cardCode === 'SRM.BUSINESS.NOTICE') {
      return {
        url: `${origin}/spfm/v1/platform-notices${hasLogin}`,
        href: `/oauth/public/default/platform_notice_detail.html?type=PTGG&noticeId=`,
        more: `/oauth/public/default/platform_notice.html?type=PTGG`,
      };
    } else if (cardCode === 'SRM.NOTICE') {
      return {
        url: userId === '0' ? null : `${origin}/spfm/v1/${userId}/platform-notices${hasLogin}`,
        href: `/oauth/public/default/platform_notice_detail.html?type=GSTZ&noticeId=`,
        more: `/oauth/public/default/platform_notice.html?type=GSTZ`,
      };
    } else if (cardCode === 'SRM.ANNOUNCEMENT') {
      // const id = userId === '0' ? 'NO_TENANT' : userId;
      // const pub = isLogin ? '' : 'pub/';
      return {
        url: null, // 改从dataSet的transport，需要设置cookie
        href: `${basePath}public/ssrc/bid-hall/accept-bid-notice-detail`,
        more: `${window.$$env.BASE_PATH || '/'}public/win-bid-notice`,
      };
    } else {
      return null;
    }
  }, []);

  /**
   *  获取公告列表
   */
  const getNoticeList = () => {
    try {
      if (noticeObject && noticeObject.url) {
        request(noticeObject.url, {
          method: 'GET',
        }).then(res => {
          if (getResponse(res)) {
            setNoticeList(res ? res.content : []);
          }
        });
      }
    } catch (err) {
      console.log(err);
    }
  };

  /**
   *  获取每行跳转地址信息
   *  @param {object} record - 行信息
   */
  const getItemHref = record => {
    if (cardCode === 'SRM.ANNOUNCEMENT') {
      const { secondarySourceCategory, sourceHeaderId, tenantId, sourceCategory } = record;
      // 默认跳转方式
      if (sourceCategory === 'BID') {
        const params = qs.stringify({
          sourceHeaderId,
          tenantId,
          language,
        });
        const href = noticeObject ? `${noticeObject.href}?${params}` : '';
        return {
          href,
        };
      }
      const type = secondarySourceCategory === 'NEW_BID' ? 'new-bid-hall' : 'new-inquiry-hall';
      const href = `${basePath}public/ssrc/${type}/accept-rfx-notice-detail-preview/RFX/${userId}/${sourceHeaderId}?organizationId=${tenantId}&language=${language}`;
      return {
        href,
      };
    } else {
      const href = noticeObject ? noticeObject.href + record.noticeId : '';
      return {
        href,
      };
    }
  };

  const handleCaptchaModal = () => {
    return new Promise((resolve, reject) => {
      // eslint-disable-next-line
      let modal;
      // eslint-disable-next-line
      modal = Modal.open({
        key: Modal.key(),
        destroyOnClose: true,
        title: oauthIntl['srm.oauth.portalInfo.inputCaptcha'] || '请输入验证码',
        children: <Captcha modal={modal} resolve={resolve} reject={reject} language={language} />,
        style: { width: '460px' },
        closable: true,
      });
    });
  };

  const handleClick = async (e, link) => {
    e.preventDefault();
    if (cardCode === 'SRM.ANNOUNCEMENT') {
      const modalRes = await handleCaptchaModal();
      console.log('modalRes', modalRes);
      if (!modalRes) return false;
      window.open(link, '_blank');
    } else {
      window.open(link, '_blank');
    }
  };

  return (
    <div className={styles['portal-notice-container']}>
      {cardTitleStatus ? (
        <div className="notice-header">
          {icon ? <Icon type={icon} /> : null}
          <div>{(_tls.title && _tls.title[language]) || title}</div>
          {noticeObject && (
            <a
              className="notice-more-link"
              href={noticeObject.more}
              target="_blank"
              rel="noopener noreferrer"
            >
              {oauthIntl['srm.oauth.portalInfo.seeMore'] || '查看更多'}
            </a>
          )}
        </div>
      ) : null}
      {noticeList.length ? (
        <div className="notice-wrapper">
          {noticeList.map(item => {
            const {
              noticeDate,
              startDate,
              title: noticeTitle,
              bidTitle,
              companyName,
              noticeTypeMeaning,
            } = item;
            if (noticeDate || startDate) {
              const date =
                cardCode === 'SRM.ANNOUNCEMENT'
                  ? noticeDate.split(' ')[0].split('-')
                  : startDate.split('-');
              const { href } = getItemHref(item) || {};
              return (
                <a
                  className="notice-slide"
                  href={href || ''}
                  target="_blank"
                  onClick={e => handleClick(e, href)}
                  rel="noopener noreferrer"
                >
                  <div className="slide-left">
                    <p className="slide-tag slide-left-month">
                      {monthToChinese(date[1], oauthIntl)}
                    </p>
                    <p className="slide-tag slide-left-day">{date[2]}</p>
                  </div>
                  <div className="slide-right">
                    <div className="slide-right-title">{noticeTitle || bidTitle}</div>
                    <div className="slide-right-desc">{noticeTypeMeaning}</div>
                    {cardCode === 'SRM.ANNOUNCEMENT' ? (
                      <div
                        className="slide-right-desc"
                        dangerouslySetInnerHTML={{ __html: companyName }}
                      />
                    ) : null}
                  </div>
                </a>
              );
            }
            return null;
          })}
        </div>
      ) : (
        <div className="notice-wrapper notice-empty">
          <img
            src={`${getOrigin()}/oauth/static/default/img/no_notice_new.svg`}
            alt="no_notice_new"
          />
          <div className="source-empty-text">
            {oauthIntl['srm.oauth.portalInfo.noData'] || '暂无数据'}
          </div>
        </div>
      )}
      {footerMoreLink && noticeObject && (
        <a
          className="notice-footer-more-link"
          href={noticeObject.more}
          target="_blank"
          rel="noopener noreferrer"
        >
          {oauthIntl['srm.oauth.portalInfo.seeMore'] || '查看更多'}
        </a>
      )}
    </div>
  );
};

export default React.memo(PortalNotice);
