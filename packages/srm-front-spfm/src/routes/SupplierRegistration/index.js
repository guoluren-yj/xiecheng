/**
 * @Author: 杨一昊 yihao.yang@going-link.com
 * @Date: 2022-07-04 13:44:59
 * @FilePath: /srm-front-spfm/src/routes/SupplierRegistration/index.js
 * @Copyright (c) 2022 by ZhenYun, All Rights Reserved.
 */
import React, { useState, useEffect, useCallback } from 'react';
import qs from 'querystring';
import Cookies from 'universal-cookie';
import { Spin } from 'choerodon-ui';
import { isEmpty, isNil } from 'lodash';

import { Nav, Footer } from 'srm-front-boot/lib/components/PortalCard';

import { getResponse } from 'utils/utils';
import { getHomeDefaultLanguage, setSecureCookie } from 'srm-front-boot/lib/utils/utils';
import { queryIntl, changePublicTheme, getPortalLayout } from '@/utils/publicUtils';
import {
  getInternationalTelCode,
  getCurrentLanguageByCode,
} from '@/services/supplierRegistrationService';
import { getExpires } from '@/utils/utils';

import { VERIFY_METHOD_VALUE } from './utils';
import styles from './index.less';
// eslint-disable-next-line import/no-named-as-default-member
import RegisterContent from './Content';

const { PHONE, EMAIL } = VERIFY_METHOD_VALUE || {};

const cookies = new Cookies();
const SupplierRegistration = ({ history, location: { search } }) => {
  const [intl, setIntl] = useState('');
  const [internationalTelCode, serInternationalTelCode] = useState([]);
  const [loading, setLoading] = useState(true);
  const [portalConfig, setPortalConfig] = useState({});
  const [expires] = useState(getExpires(86400000));
  const [passwordDefaultFlag, setPasswordDefaultFlag] = useState(false);

  const [verifyConfig, serVerifyConfig] = useState({
    defaultVerifyMethod: PHONE,
    verifyMethods: [PHONE, EMAIL],
  });

  const [currentLang, setCurrentLang] = useState();

  const queryParams = qs.parse(search.substr(1));

  const { code } = queryParams || {};

  const { hostname } = window.location;

  useEffect(() => {
    // 查询主题
    (async () => {
      try {
        let currentLanguage = '';
        let currentTenantId = 0;
        const [invitatResp, layoutResp] = await Promise.all([
          getCurrentLanguageByCode({ invitationCode: code, webUrl: hostname }),
          // 接口请求获取模板信息
          getPortalLayout(),
        ]);
        // 获取邀请
        setPortalConfig(layoutResp);
        // 开启新主题
        if (layoutResp.themeConfigVO) {
          await changePublicTheme(false, layoutResp.themeConfigVO || {});
          const { tenantId } = layoutResp;
          currentTenantId = tenantId;
        } else if (getResponse(layoutResp)) {
          // 没开启新主题
          // 处理门户模版默认语言
          const { tenantId } = layoutResp;
          currentTenantId = tenantId;
        }
        if (getResponse(invitatResp)) {
          const {
            inviteRegisterLang,
            emailReceiveFlag,
            phoneReceiveFlag,
            defaultReceiveCodeType,
            passwordDefaultFlag: defaultFlag,
          } = invitatResp;
          // 邀请注册的场景，以采购方发邀约的语言环境为主
          if (code && inviteRegisterLang) {
            if (isNil(cookies.get('language'))) {
              setSecureCookie('language', inviteRegisterLang, { path: '/', expires });
            }
          }
          // getHomeDefaultLanguage 这里里边会从判断cooke没值，就重新设置，所以邀请注册先设置cookie
          currentLanguage = await getHomeDefaultLanguage();

          currentLanguage = inviteRegisterLang || currentLanguage;
          // 处理注册策略配置验证方式
          serVerifyConfig({
            defaultVerifyMethod: defaultReceiveCodeType,
            verifyMethods: [phoneReceiveFlag ? PHONE : '', emailReceiveFlag ? EMAIL : ''],
          });
          setPasswordDefaultFlag(Boolean(defaultFlag));
        }
        // 初始化
        await init({
          initLanguage: currentLanguage,
          tenantId: currentTenantId,
        });
        // 处理
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    })();
  }, [code]);

  // 初始化多语言
  const init = async ({ initLanguage = '', tenantId } = {}) => {
    const lang = cookies.get('language') || initLanguage || 'zh_CN';
    if (!isNil(tenantId)) {
      setSecureCookie('tenantId', tenantId, { path: '/', expires });
    }
    setCurrentLang(lang);
    // 查询页面多语言
    await handleIntl(lang);
    // 页面初始化查询国别码
    handleInternationalTelCode(lang);
  };

  // 页面初始化查询国别码
  const handleInternationalTelCode = useCallback((lang) => {
    getInternationalTelCode({ language: lang }).then((res) => {
      if (getResponse(res)) {
        serInternationalTelCode(res);
      }
    });
  }, []);

  const handleIntl = useCallback(async (lang) => {
    await queryIntl(lang, 'srm.portal', 'srm.oauth,smbl.common,hzero.common').then((res) => {
      if (getResponse(res)) {
        setIntl(res);
      }
    });
  }, []);

  if (loading) {
    return <Spin spinning={loading} />;
  }

  return (
    <div className={styles.container}>
      {/* 头部导航 */}
      {isEmpty(intl) ? null : <Nav auto />}
      {/* 页面注册区域 */}
      <div className={styles.containerContent}>
        <RegisterContent
          intl={intl}
          history={history}
          cookies={cookies}
          internationalTelCodes={internationalTelCode}
          queryParams={queryParams}
          portalConfig={portalConfig}
          language={currentLang}
          verifyConfig={verifyConfig}
          passwordDefaultFlag={passwordDefaultFlag}
        />
      </div>
      {/* 页脚 */}
      <div className={styles.footer}>
        <Footer auto />
      </div>
    </div>
  );
};
export default SupplierRegistration;
