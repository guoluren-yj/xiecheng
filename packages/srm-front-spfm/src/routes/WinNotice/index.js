/**
 * 中标公告
 *
 */

/* eslint-disable no-param-reassign */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Icon, Spin, DataSet, Modal } from 'choerodon-ui/pro';
import { Nav, Footer } from 'srm-front-boot/lib/components/PortalCard';
import { getHomeDefaultLanguage, setSecureCookie } from 'srm-front-boot/lib/utils/utils';
import request from 'hzero-front/lib/utils/request';
import qs from 'querystring';
import { compose } from 'lodash';
import { getEnvConfig } from 'hzero-front/lib/utils/iocUtils';
import Cookies from 'universal-cookie';
import { getResponse, setSession, getAccessToken } from 'hzero-front/lib/utils/utils';
import remotes from 'utils/remote';
import { changePublicTheme } from '@/utils/publicUtils';

import FilterBarTable from '_components/FilterBarTable';
import Captcha from '@/components/Captcha';

import { getOrigin, getExpires } from '@/utils/utils';

import { getLayoutConfig } from '@/services/portalService';

import styles from './index.less';

const cookie = new Cookies();
const ResourceCenter = (props) => {
  const {
    location: { search = '' },
    remote,
  } = props || {};
  const { tenantId: _urlTenantId = null } = qs.parse(search.substr(1)) || {};
  const [accessToken] = useState(getAccessToken());
  const [language, setLanguage] = useState();
  // 新增url参数，当cookie不存在tenantId时时，优先取这个参数
  const urlTenantId = isNaN(Number(_urlTenantId)) ? null : _urlTenantId;
  // const [userId] = useState(Number(cookie.get('tenantId')) || 'NO_TENANT');
  const langInfoRef = useMemo(() => ({ current: {}, valueListMeaningMap: {} }), []);
  const [, setLangInfoLoaded] = useState({});
  const [init, setInit] = useState(false);
  const langInfo = langInfoRef.current || {};
  const [expires] = useState(getExpires(86400000));

  const basePath = window.$$env.BASE_PATH || '/';

  // 获取租户id
  const getUserId = () => {
    const userId = Number(cookie.get('tenantId')) || urlTenantId || 'NO_TENANT';
    return userId;
  };

  const sourceDs = useMemo(() => {
    const preDSProps = {
      autoQuery: false,
      fields: [
        {
          name: 'bidTitle',
          label: langInfoRef.current['srm.oauth.bidNotice.bidWinningProject'] || '中标项目',
        },
        {
          name: 'companyName',
          label: langInfoRef.current['srm.oauth.bidNotice.purchasingCompany'] || '采购企业',
        },
        {
          name: 'noticeDate',
          label: langInfoRef.current['srm.oauth.noticeDetails.postDate'] || '发布时间',
        },
      ],
      queryFields: [
        {
          name: 'rfxNum',
          display: true,
          label: langInfoRef.current['ssrc.inquiryHall.model.inquiryHall.sourceNum'] || '寻源单号',
        },
        {
          name: 'companyName',
          display: true,
          label: langInfoRef.current['srm.oauth.bidNotice.purchasingCompany'] || '采购企业',
        },
        {
          name: 'sourceCategory',
          lookupCode: 'SSRC.SOURCE_CATEGORY',
          display: true,
          label:
            langInfoRef.current['ssrc.inquiryHall.model.inquiryHall.sourcingCategory'] ||
            '寻源类别',
          lookupAxiosConfig: ({ lookupCode }) => {
            return {
              url: `/ssrc/v1/${getUserId()}/share/common/lov/public`,
              method: 'GET',
              params: { lovCode: lookupCode, lang: language },
            };
          },
        },
        {
          name: 'releasedTime',
          display: true,
          type: 'dateTime',
          range: true,
          label: langInfoRef.current['srm.oauth.noticeDetails.postDate'] || '发布时间',
        },
        // {
        //   name: 'templateNameParam',
        //   display: true,
        //   label: langInfoRef.current['ssrc.common.view.templateName'] || '模板名称',
        // },
        {
          name: 'sourceTitle',
          label: langInfoRef.current['srm.oauth.bidNotice.bidWinningProject'] || '中标项目',
        },
      ],
      transport: {
        read: () => {
          // 获取招标寻源列表
          return {
            url: `${getOrigin()}/ssrc/v1/${getUserId()}/source-notices/${
              accessToken ? '' : 'pub/'
            }br-accepted-list`,
            method: 'get',
          };
        },
      },
    };

    const dsProps = remote
      ? remote.process('SPFM_WIN_NOTICE_PROCESS_SOURCE_DS_PROPS', preDSProps, {
          pageProps: props,
          cookie,
          search,
        })
      : preDSProps;

    return new DataSet(dsProps);
  }, [init, language, cookie, search, remote]);

  useEffect(() => {
    getTenantInfo();
    queryIntl().then(() => {
      setInit(true);
      sourceDs.query();
    });
  }, []);

  // 获取租户信息
  const getTenantInfo = async () => {
    const res = await getLayoutConfig();
    const { tenantId: organizationId } = res;
    await changePublicTheme(false, res?.themeConfigVO || {});
    setSecureCookie('tenantId', organizationId, { path: '/', expires });
  };

  const queryIntl = useCallback(async () => {
    const { HZERO_PLATFORM } = getEnvConfig();
    const lang = await getHomeDefaultLanguage();

    if (lang) {
      setLanguage(lang);
    }

    let intlPath = `${HZERO_PLATFORM}/v1/prompt/${lang}`;
    const tenantId = Number(cookie.get('tenantId')) || urlTenantId;

    if (accessToken && tenantId) {
      intlPath = `${HZERO_PLATFORM}/v1/${tenantId}/prompt/${lang}`;
    }

    return request(intlPath, {
      method: 'GET',
      query: {
        promptKey: 'spfm.source,hzero.common,srm.common,srm.oauth,ssrc.inquiryHall,ssrc.common',
      },
    }).then((res) => {
      if (getResponse(res)) {
        langInfoRef.current = res;
        setSession(`${lang}-srm.portal`, res);
        setLangInfoLoaded(true);
      }
    });
  }, []);

  const searchCallback = useCallback(() => {
    const input = document.getElementById('resource-search');
    sourceDs.setQueryParameter('bidTitle', input.value);
    sourceDs.query();
  }, [sourceDs, language]);

  const handleCaptchaModal = () => {
    return new Promise((resolve, reject) => {
      // eslint-disable-next-line no-unused-vars
      let modal;
      // eslint-disable-next-line prefer-const
      modal = Modal.open({
        key: Modal.key(),
        destroyOnClose: true,
        title: langInfoRef.current['srm.oauth.portalInfo.inputCaptcha'] || '请输入验证码',
        children: (
          <Captcha
            modal={modal}
            resolve={resolve}
            reject={reject}
            langIntl={langInfoRef.current}
            language={language}
          />
        ),
        style: { width: '460px' },
        closable: true,
      });
    });
  };

  const handleClick = async (e, link) => {
    e.preventDefault();

    const handleBidNotice = async () => {
      const modalRes = await handleCaptchaModal();
      console.log('modalRes', modalRes);
      if (!modalRes) return false;
      window.open(link, '_blank');
    };

    if (remote?.event) {
      remote.event.fireEvent('remoteBidSourceOpenDetail', {
        handleBidNotice,
        link,
        pageProps: props,
        sourceDs,
      });
    } else {
      handleBidNotice();
    }
  };

  /**
   *  跳转地址
   */
  const renderTitle = useCallback(
    ({ value, record }) => {
      const {
        sourceHeaderId,
        tenantId,
        sourceCategory,
        secondarySourceCategory,
        noticeTitle,
      } = record.get([
        'sourceHeaderId',
        'tenantId',
        'sourceCategory',
        'secondarySourceCategory',
        'noticeTitle',
      ]);
      let href = '';
      if (sourceCategory === 'BID') {
        const params = qs.stringify({
          sourceHeaderId,
          tenantId,
          language,
        });
        href = `${basePath}public/ssrc/bid-hall/accept-bid-notice-detail?${params}`;
      } else {
        const type = secondarySourceCategory === 'NEW_BID' ? 'new-bid-hall' : 'new-inquiry-hall';
        href = `${basePath}public/ssrc/${type}/accept-rfx-notice-detail-preview/RFX/${
          cookie.get('tenantId') || '0'
        }/${sourceHeaderId}?organizationId=${tenantId}&language=${language}`;
      }

      return (
        <a onClick={(e) => handleClick(e, href)} target="_blank" rel="noopener noreferrer">
          {noticeTitle || value}
        </a>
      );
    },
    [language]
  );

  const columns = useMemo(() => {
    const preColumns = [
      {
        name: 'bidTitle',
        renderer: renderTitle,
      },
      {
        name: 'companyName',
      },
      { name: 'noticeDate' },
    ];

    const newColumns = remote
      ? remote.process('SPFM_WIN_NOTICE_PROCESS_COLUMNS', preColumns, {
          pageProps: props,
          cookie,
          search,
          sourceDs,
        })
      : preColumns;

    return (newColumns || []).filter(Boolean);
  }, [init, language, remote]);

  let pageTitleIntl = langInfo['srm.oauth.noticeDetails.bidWinningNotice'] || '中标公告';
  pageTitleIntl = remote
    ? remote?.process?.('SPFM_WIN_NOTICE_PROCESS_PAGE_TITLE_INTL', pageTitleIntl, {
        sourceDs,
        pageProps: props,
        langInfo,
      })
    : pageTitleIntl;

  return (
    <Spin spinning={!init}>
      <div className={styles['win-bid-center']}>
        {init && <Nav auto />}
        <section className="search-area">
          <header>{pageTitleIntl}</header>
          <form>
            <div className="search-input" onClick={interceptDefault}>
              <Icon type="search" />
              <input
                autoComplete="off"
                type="text"
                name="search"
                id="resource-search"
                placeholder={
                  langInfo['srm.oauth.platformNotice.enterWantQuery'] || '请输入您要查询的内容'
                }
              />
              <Button type="submit" color="primary" onClick={searchCallback}>
                {langInfo['srm.common.view.title.search'] || '搜索'}
              </Button>
            </div>
          </form>
        </section>
        <section className="content">
          <header>
            <div className="path-info">
              <span
                data-id="-1"
                className={['path-item', 'unselectable'].filter(Boolean).join(' ')}
              >
                {langInfo['srm.oauth.noticeDetails.bidWinningNotice'] || '中标公告'}
              </span>
            </div>
          </header>
          <div>
            <section className="content-detail">
              <FilterBarTable
                border={false}
                className="table-wrap-resource"
                selectionMode="none"
                dataSet={sourceDs}
                columns={columns}
                style={{ maxHeight: 471 }}
                headerRowHeight={18}
                rowHeight="auto"
                cacheState
                flterBarConfig={{
                  expandable: false,
                  cacheKey: 'ssrc-win-notice',
                }}
              />
            </section>
          </div>
        </section>
        {init && <Footer auto />}
      </div>
    </Spin>
  );
};

function interceptDefault(e) {
  e.stopPropagation();
  e.preventDefault();
}

export default compose(
  remotes(
    {
      code: 'SPFM_WIN_NOTICE', // 对应二开模块暴露的Expose的编码， 命名规范：模块编码+功能编码
      name: 'remote', // 默认 'remote'， 如有属性冲突可以改此属性
    },
    {
      events: {
        remoteBidSourceOpenDetail: (eventProps) => {
          const { handleBidNotice } = eventProps || {};
          handleBidNotice();
        },
      },
    }
  )
)(ResourceCenter);
