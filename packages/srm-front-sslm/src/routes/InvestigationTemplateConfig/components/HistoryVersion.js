/*
 * @Date: 2023-12-06 09:32:28
 * @author: CDJ <dengji.chen@hand-china.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import querystring from 'querystring';
import React, { useState, useEffect } from 'react';
import { routerRedux } from 'dva/router';
import { Menu } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import { dateTimeRender } from 'utils/renderer';

import { fetchInvestigateList } from '@/services/orgInvestigateTemplateHistoryService';
import styles from '../index.less';

const HistoryVersion = ({
  record,
  dispatch,
  showSubMenuFlag = true,
  sourceNewTemplateId,
  sourceOldTemplateId,
}) => {
  const { templateCode, investigateTemplateId: sourceInvestigateTemplateId } =
    record?.get(['templateCode', 'investigateTemplateId']) || {};
  const [menuList, setMenuList] = useState([]);
  const [showHistoryBtnFlag, setShowHistoryBtnFlag] = useState('1');
  useEffect(() => {
    if (templateCode) {
      fetchInvestigateList({ investigateTemplateCode: templateCode, page: 0, size: 0 }).then(
        response => {
          const res = getResponse(response);
          if (res) {
            const { content = [] } = res;
            const newData = content.filter(
              item => item.investigateTemplateId !== sourceInvestigateTemplateId
            );
            setShowHistoryBtnFlag(newData.length === 1 ? '0' : '1');
            setMenuList(newData);
          }
        }
      );
    }
  }, [templateCode]);

  const handleItemClick = item => {
    const { key: investigateTemplateId } = item;
    // 跳转
    const search = querystring.stringify({
      jumpSource: 'historyVersion',
      showHistoryBtn: showHistoryBtnFlag,
      sourceNewTemplateId,
      sourceOldTemplateId,
    });
    dispatch(
      routerRedux.push({
        pathname: `/sslm/investigation-template-config/detail/${investigateTemplateId}/${investigateTemplateId}/view`,
        search,
      })
    );
  };

  const menuContent = menuList.map(item => (
    <Menu.Item key={item.investigateTemplateId}>
      <div className={styles['history-version-menu-item-wrap']}>
        <div className={styles['history-version-menu-title']}>
          {intl
            .get('sslm.common.model.version.versionv', {
              versionNum: item.versionNumber,
            })
            .d(`版本v${item.versionNumber}`)}
        </div>
        <div className={styles['history-version-menu-person']}>
          <span>{item.releaseName}</span>
          <span style={{ marginLeft: 8 }}>{dateTimeRender(item.releaseDate)}</span>
        </div>
      </div>
    </Menu.Item>
  ));
  return (
    <Menu onClick={handleItemClick} className={styles['history-version-menu']}>
      {showSubMenuFlag ? (
        <Menu.SubMenu
          key="historyVersion"
          className={styles['history-version-submenu']}
          title={intl.get('hzero.common.button.historyVersion').d('历史版本')}
        >
          {menuContent}
        </Menu.SubMenu>
      ) : (
        menuContent
      )}
    </Menu>
  );
};

export default HistoryVersion;
