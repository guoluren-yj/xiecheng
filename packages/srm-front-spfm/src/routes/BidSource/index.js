/* eslint-disable no-param-reassign */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Icon, Spin, DataSet, Modal } from 'choerodon-ui/pro';
import { Nav, Footer } from 'srm-front-boot/lib/components/PortalCard';
import request from 'hzero-front/lib/utils/request';
import qs from 'querystring';
import { compose } from 'lodash';
import { queryMapIdpValue } from 'hzero-front/lib/services/api';
import { getEnvConfig } from 'hzero-front/lib/utils/iocUtils';
import Cookies from 'universal-cookie';
import { getResponse, setSession, getAccessToken } from 'hzero-front/lib/utils/utils';
import { getHomeDefaultLanguage, setSecureCookie } from 'srm-front-boot/lib/utils/utils';
import FilterBarTable from '_components/FilterBarTable';
import remotes from 'utils/remote';
import Captcha from '@/components/Captcha';
import { changePublicTheme } from '@/utils/publicUtils';

import { getLayoutConfig } from '@/services/portalService';

import { getOrigin, getExpires } from '@/utils/utils';

import styles from './index.less';

const cookie = new Cookies();
const NEWSOURCEFROM = ['RFP', 'RFI'];
const NEWSOURCECATEGORY = ['RFA', 'RFQ'];
const NEW_BID = 'NEW_BID'; // 新招标
const ResourceCenter = (props) => {
  const {
    remote,
    location: { search = {} },
  } = props || {};
  const { tenantId: _urlTenantId = null } = qs.parse(search.substr(1));
  const [accessToken] = useState(getAccessToken());
  const [language, setLanguage] = useState();
  // 新增url参数，当cookie不存在tenantId时时，优先取这个参数
  const urlTenantId = isNaN(Number(_urlTenantId)) ? null : _urlTenantId;
  // const [userId] = useState(Number(cookie.get('tenantId')) || urlTenantId || 'NO_TENANT');
  const langInfoRef = useMemo(() => ({ current: {}, valueListMeaningMap: {} }), []);
  const [, setLangInfoLoaded] = useState({});
  const [init, setInit] = useState(false);
  const [sourceDs, setSourceDs] = useState(null);
  const [expires] = useState(getExpires(86400000));

  const langInfo = langInfoRef.current || {};

  const initDataSet = useCallback(
    (lang) => {
      const dsProps = {
        autoQuery: true,
        fields: [
          {
            name: 'bidTitle',
            label: langInfoRef.current['srm.oauth.resourceDownload.title'] || '标题',
          },
          {
            name: 'sourceCategoryMeaning',
            label: langInfoRef.current['srm.oauth.bidSource.sourceCategory'] || '寻源类型',
          },
          {
            name: 'companyName',
            label: langInfoRef.current['srm.oauth.bidNotice.purchasingCompany'] || '采购企业',
          },
          {
            name: 'approvedDate',
            label: langInfoRef.current['srm.oauth.platformNotice.releaseDate'] || '发布日期',
          },
        ],
        queryFields: [
          {
            name: 'rfxNum',
            display: true,
            label:
              langInfoRef.current['ssrc.inquiryHall.model.inquiryHall.sourceNum'] || '寻源单号',
          },
          {
            name: 'companyName',
            display: true,
            label: langInfoRef.current['srm.oauth.bidNotice.purchasingCompany'] || '采购企业',
          },
          {
            name: 'sourceCategory',
            lookupCode: 'SSRC.SOURCE_CATEGORY_NOTICE',
            display: true,
            label:
              langInfoRef.current['ssrc.inquiryHall.model.inquiryHall.sourcingCategory'] ||
              '寻源类别',
            lookupAxiosConfig: ({ lookupCode }) => {
              return {
                url: `/ssrc/v1/${getUserId()}/share/common/lov/public`,
                method: 'GET',
                params: { lovCode: lookupCode, lang },
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
            label:
              langInfoRef.current['ssrc.inquiryHall.model.inquiryHall.sourceTitle'] || '寻源标题',
          },
          {
            name: 'quotationStartTime',
            type: 'dateTime',
            range: true,
            label:
              langInfoRef.current['ssrc.inquiryHall.model.inquiryHall.quotationStartTime'] ||
              '报价开始时间',
          },
          {
            name: 'quotationEndTime',
            type: 'dateTime',
            range: true,
            label:
              langInfoRef.current['ssrc.inquiryHall.model.inquiryHall.quotationEndTime'] ||
              '报价截止时间',
          },
        ],
        transport: {
          read: ({ params }) => {
            // 获取招标寻源列表
            return {
              url: `${getOrigin()}/ssrc/v1/${getUserId()}/source-notices/br-list${
                accessToken ? '' : '/public'
              }`,
              method: 'get',
              params: {
                ...params,
                access_token: accessToken,
                lang,
              },
            };
          },
        },
      };
      const remoteDsProps = remote
        ? remote?.process('BID_SOURCE_SOURCE_DS_PROPS', dsProps, { langInfoRef })
        : dsProps;
      const ds = new DataSet(remoteDsProps);
      setSourceDs(ds);
    },
    [init, remote, language]
  );

  useEffect(() => {
    (async () => {
      await getTenantInfo();
    })();
    Promise.all([
      queryMapIdpValue({ category: 'SPFM.PORTAL.ATTACHMENT_CATEGORY', publicMode: true }).then(
        (res) => {
          if (getResponse(res) && res.category) {
            const lang = {};
            res.category.forEach((item) => {
              lang[item.value] = item.meaning;
            });
            langInfoRef.valueListMeaningMap = lang;
          }
        }
      ),
      queryIntl(),
    ]);
  }, []);

  // 获取租户id
  const getUserId = () => {
    const userId = Number(cookie.get('tenantId')) || urlTenantId || 'NO_TENANT';
    return userId;
  };

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
        setInit(true);
        initDataSet(lang);
      }
    });
  }, []);

  const searchCallback = useCallback(() => {
    const input = document.getElementById('resource-search');
    if (!sourceDs) return;
    sourceDs.setQueryParameter('bidTitle', input.value);
    sourceDs.query();
  }, [sourceDs]);

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
        initDataSet,
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
        sourceFrom,
        tenantId,
        sourceCategory,
        secondarySourceCategory,
      } = record.get([
        'sourceHeaderId',
        'sourceFrom',
        'tenantId',
        'sourceCategory',
        'secondarySourceCategory',
      ]);
      const hall = secondarySourceCategory === NEW_BID ? 'new-bid-hall' : 'new-inquiry-hall';
      const basePath = window.$$env.BASE_PATH || '/';

      if (NEWSOURCEFROM.includes(sourceFrom) || NEWSOURCECATEGORY.includes(sourceCategory)) {
        const href = `${basePath}public/ssrc/${hall}/tender-bid-notice-preview/${sourceFrom}/${tenantId}/${sourceHeaderId}?organizationId=${tenantId}&language=${language}`;
        return (
          <a onClick={(e) => handleClick(e, href)} target="_blank" rel="noopener noreferrer">
            {value}
          </a>
        );
      } else {
        const params = qs.stringify({
          sourceHeaderId,
          tenantId,
          language,
        });
        const href = `${basePath}public/ssrc/bid-hall/bid-notice?${params}`;
        return (
          <a onClick={(e) => handleClick(e, href)} target="_blank" rel="noopener noreferrer">
            {value}
          </a>
        );
      }
    },
    [language]
  );

  /**
   *  标签样式
   */
  const getSourceType = (type) => {
    let style = {};
    switch (type) {
      case 'RFQ':
        style = {
          color: '#3095f2',
          fontWeight: 600,
          background: '#eaf4fd',
          borderRadius: '0.02rem',
        };
        break;
      default:
        style = {
          color: '#47b881',
          fontWeight: 600,
          background: '#ecf7f2',
          borderRadius: '0.02rem',
        };
        break;
    }
    return style;
  };

  /**
   *  渲染类型
   */
  const renderSourceType = useCallback(({ record, value }) => {
    const style = getSourceType(record.get('sourceCategory'));
    return (
      <span className={styles['source-source-type']} style={style}>
        {value}
      </span>
    );
  }, []);

  const columns = useMemo(() => {
    const standard = [
      {
        name: 'bidTitle',
        renderer: renderTitle,
      },
      {
        name: 'sourceCategoryMeaning',
        renderer: renderSourceType,
      },
      {
        name: 'companyName',
      },
      { name: 'approvedDate' },
    ];
    return remote
      ? remote?.process?.('BID_SOURCE_TABLE_COLUMNS', standard, {
          sourceDs,
          renderTitle,
          renderSourceType,
        })
      : standard;
  }, [init, remote, sourceDs, renderTitle, renderSourceType]);

  const renderCuxDom = useCallback(() => {
    if (remote?.process) {
      return remote.process('BID_SOURCE_PROCESS_CUX_AFTER_SEARCH_DOM', "", {
        sourceDs,
        langInfo,
        pageProps: props,
      });
    }
    return "";
  }, [remote, sourceDs, langInfo, props]);

  let pageTitleIntl = langInfo['srm.oauth.platformNotice.title.bidSource'] || '招标寻源';
  pageTitleIntl = remote
    ? remote?.process?.('SPFM_BID_SOURCE_PROCESS_PAGE_TITLE_INTL', pageTitleIntl, {
        sourceDs,
        pageProps: props,
        langInfo,
      })
    : pageTitleIntl;

  return (
    <Spin spinning={!init}>
      <div className={styles['resource-center']}>
        {init && <Nav auto />}
        <section className="search-area">
          <header>{pageTitleIntl}</header>
          {renderCuxDom()}
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
                {langInfo['srm.oauth.platformNotice.title.bidSource'] || '招标寻源'}
              </span>
            </div>
          </header>
          <div>
            {sourceDs && (
              <section className="content-detail">
                {
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
                }
              </section>
            )}
          </div>
        </section>
        {init && <Footer auto />}
      </div>
    </Spin>
  );
};

export default compose(
  remotes(
    {
      code: 'SPFM_BID_SOURCE', // 对应二开模块暴露的Expose的编码， 命名规范：模块编码+功能编码
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

function interceptDefault(e) {
  e.stopPropagation();
  e.preventDefault();
}
