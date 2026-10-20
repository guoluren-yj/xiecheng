/**
 * PortalTabNotice - 基础卡片
 * @date: 2021-07-07
 * @author: Danica <ke.wang01@gonig-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Hand
 */

import React, { useMemo, useState } from 'react';
import { Tabs } from 'choerodon-ui';
import { Tooltip } from 'choerodon-ui/pro';

import Cookies from 'universal-cookie';
import Notice from '../Notice';

import styles from './index.less';

const { TabPane } = Tabs;
const cookies = new Cookies();

const PortalTabNotice: React.FC = () => {
  const [language] = useState(cookies.get('language') || 'zh_CN');
  const oauthIntl = useMemo(() => {
    const srmOauth = window.sessionStorage.getItem(`${language}-srm.portal`);
    if (srmOauth) {
      return JSON.parse(srmOauth);
    }
    return {};
  }, [language]);

  return (
    <div className={styles['portal-notice-tab-container']}>
      <Tabs tabBarGutter={0}>
        <TabPane
          tab={
            <Tooltip
              placement="topLeft"
              title={oauthIntl['srm.oauth.portalInfo.businessBulletin'] || '企业公告'}
            >
              {oauthIntl['srm.oauth.portalInfo.businessBulletin'] || '企业公告'}
            </Tooltip>
          }
          key="business"
        >
          <Notice cardTitleStatus={0} cardCode="SRM.NOTICE" footerMoreLink />
        </TabPane>
        <TabPane
          tab={
            <Tooltip
              placement="topLeft"
              title={oauthIntl['srm.oauth.platformNotice.platformAnnouncement'] || '平台公告'}
            >
              {oauthIntl['srm.oauth.platformNotice.platformAnnouncement'] || '平台公告'}
            </Tooltip>
          }
          key="platform"
        >
          <Notice cardTitleStatus={0} cardCode="SRM.BUSINESS.NOTICE" footerMoreLink />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default React.memo(PortalTabNotice);
