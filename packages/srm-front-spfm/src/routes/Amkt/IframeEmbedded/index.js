/**
 * IframeEmbedded - 应用商城内嵌页面
 * @date: 2019-08-07
 * @author: zjx <jingxi.zhang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import qs from 'querystring';

import {
  getCurrentUser,
  getCurrentOrganizationId,
  getCurrentLanguage,
  getTimeZone,
  getAccessToken,
} from 'utils/utils';
import style from './index.less';
import { SRM_AMKT_HOST } from '@/utils/config';
import { getUrlParam } from '@/utils/utils';

const organizationId = getCurrentOrganizationId();
@connect(({ loading, global, iframeEmbedded }) => ({
  loading: loading.effects['iframeEmbedded/fetchUrl'],
  antdLocale: global.hzeroUILocale,
  iframeEmbedded,
}))
export default class IframeEmbedded extends Component {
  componentDidMount() {
    const {
      dispatch,
      location: { pathname },
    } = this.props;
    const path = pathname.split('/spfm')[1];

    let realPath = path;

    if (path && path.includes('outlink')) {
      realPath = `/${path.split('/outlink-')[1]}`;
    }

    let servicePrefix = 'amkt';
    if (
      [
        '/price-center',
        '/monitor-business',
        '/business-risk-scan',
        '/risk-scan-report-download',
        '/dynamic-monitor',
        '/news-public-opinion',
        '/credit-log',
        '/monitor-stuff',
        '/monitor-org-management',
        '/supplier-risk-monitor-org',
        '/business-level',

        // 开放页面内嵌 关系挖掘、找关系
        '/outlink-supplier-relationship',
        '/outlink-supplier-relation-mining',
      ].includes(path)
    ) {
      servicePrefix = 'ambn';
    }
    dispatch({
      type: 'iframeEmbedded/fetchUrl',
      payload: {
        organizationId,
        deviceId: getAccessToken() || '',
        url: `${SRM_AMKT_HOST}/${servicePrefix}${realPath}`,
      },
    }).then(res => {
      this.handlePostMassage(res);
    });
  }

  /**
   * 与iframe内嵌页面传值
   */
  @Bind()
  handlePostMassage(data = {}) {
    const { antdLocale, location } = this.props;
    const { clientCode, tenantId, url, signature } = data;
    const currentUser = getCurrentUser();
    const {
      tenantName: groupName,
      tenantNum: groupNum,
      realName,
      id,
      loginName = '',
    } = currentUser;
    const token = url && url.split('#')[1];
    const { secret = '' } = getUrlParam() || {};

    // 接收页面通过 state 传来的参数 searchCompany， 公司列表 用 “ , ” 分隔
    const stateObj = location?.state ?? {};
    const { searchCompany } = stateObj;

    // 站内信传参
    const { search: searchStr = '' } = location ?? {};
    const { fromMsg = '' } = qs.parse(searchStr?.substr(1)); // 截取url上面传递参数

    if (this.iframeEmbedded) {
      if (this.iframeEmbedded.attachEvent) {
        // IE
        this.iframeEmbedded.attachEvent('onload', () => {
          this.iframeEmbedded.contentWindow.postMessage(
            {
              crmTenant: organizationId,
              clientCode,
              tenantId,
              groupName,
              groupNum,
              realName,
              token,
              antdLocale, // antd多语言
              currentLanguage: getCurrentLanguage(),
              timeZone: getTimeZone(),
              crmUserId: id,
              crmSignature: signature,
              crmTenantId: currentUser.tenantId,
              loginName,
              searchCompany,
              fromMsg,
              secret,
            },
            '*'
          );
        });
      } else {
        this.iframeEmbedded.onload = () => {
          this.iframeEmbedded.contentWindow.postMessage(
            {
              crmTenant: organizationId,
              clientCode,
              tenantId,
              groupName,
              groupNum,
              realName,
              token,
              antdLocale, // antd多语言
              currentLanguage: getCurrentLanguage(),
              timeZone: getTimeZone(),
              crmUserId: id,
              crmSignature: signature,
              crmTenantId: currentUser.tenantId,
              loginName,
              searchCompany,
              fromMsg,
              secret,
            },
            '*'
          );
        };
      }
    }
  }

  render() {
    const {
      iframeEmbedded: { clientData = {} },
      location: { pathname },
    } = this.props;
    const { url } = clientData;
    const embeddedPublicRouters = [
      '/amkt-appstore',
      '/amkt-servelog',
      '/shopping-cart',
      '/price-center',
      '/monitor-business',
      '/business-risk-scan',
      '/risk-scan-report-download',
      '/dynamic-monitor',
      '/news-public-opinion',
      '/credit-log',
      '/monitor-stuff',
      '/monitor-org-management',
      '/supplier-risk-monitor-org',
      '/business-level',

      // 开放页面内嵌 关系挖掘、找关系
      '/outlink-supplier-relationship',
      '/outlink-supplier-relation-mining',
    ];
    const embeddedPubRouters = [
      '/report-form/my-package-billing',
      '/amkt-module-manage',
      '/amkt-account-configuration',
    ];
    const path = pathname.split('/spfm')[1];

    let realPath = path;

    if (path && path.includes('outlink')) {
      realPath = `/${path.split('/outlink-')[1]}`;
    }

    const _DOMAIN = embeddedPublicRouters.includes(path)
      ? `${SRM_AMKT_HOST}/public`
      : embeddedPubRouters.includes(path)
      ? `${SRM_AMKT_HOST}/pub`
      : SRM_AMKT_HOST;
    const token = url && url.split('#')[1];

    let servicePrefix = 'amkt';
    if (
      [
        '/price-center',
        '/supplier-relationship',
        '/monitor-business',
        '/business-risk-scan',
        '/risk-scan-report-download',
        '/supplier-relation-mining',
        '/dynamic-monitor',
        '/news-public-opinion',
        '/credit-log',
        '/monitor-stuff',
        '/monitor-org-management',
        '/supplier-risk-monitor-org',
        '/business-level',

        // 开放页面内嵌 关系挖掘、找关系
        '/outlink-supplier-relationship',
        '/outlink-supplier-relation-mining',
      ].includes(path)
    ) {
      servicePrefix = 'ambn';
    }

    return (
      <React.Fragment>
        <div className={style['iframe-pub-embedded-box']}>
          {token && (
            <iframe
              ref={n => {
                this.iframeEmbedded = n;
              }}
              className={style['iframe-embedded']}
              title={`${_DOMAIN}/${servicePrefix}${realPath}#${token}`}
              src={`${_DOMAIN}/${servicePrefix}${realPath}#${token}`}
            />
          )}
        </div>
      </React.Fragment>
    );
  }
}
