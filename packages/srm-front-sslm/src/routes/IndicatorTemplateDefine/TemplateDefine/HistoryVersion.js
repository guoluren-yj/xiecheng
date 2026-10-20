/*
 * @Date: 2023-12-06 09:32:28
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import querystring from 'querystring';
import React, { useState, useEffect } from 'react';
import { routerRedux } from 'dva/router';
import { Menu } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { dateTimeRender } from 'utils/renderer';
import { getResponse, filterNullValueObject } from 'utils/utils';

import { fetchHistoricalVersion } from '@/services/indicatorTemplateDefineService';
import styles from '../index.less';

const HistoryVersion = ({
  type,
  record,
  dispatch,
  editFlag,
  showSubMenuFlag,
  sourceEvalTplId,
  sourceEvalTplType,
  filterData = false, // 是否过滤当前数据
}) => {
  const { evalTplCode, evalTplId } = record?.get(['evalTplCode', 'evalTplId']) || {};
  const [menuList, setMenuList] = useState([]);

  useEffect(() => {
    if (evalTplCode) {
      fetchHistoricalVersion({ evalTplCode }).then(response => {
        const res = getResponse(response);
        if (res) {
          let dataList = res;
          if (filterData) {
            dataList = res.filter(n => n.evalTplId !== evalTplId);
          }
          setMenuList(dataList);
        }
      });
    }
  }, [evalTplCode, evalTplId]);

  const handleItemClick = ({ item }) => {
    const { evalTplId: newEvalTplId, evalTplType } = item.props?.data || {};
    dispatch(
      routerRedux.push({
        pathname: `/sslm/indicator-template-define/template-detail/${newEvalTplId}/${evalTplType}/view`,
        search: querystring.stringify(
          filterNullValueObject({
            editFlag,
            jumpSource: type,
            sourceEvalTplId,
            sourceEvalTplType,
            historyFlag: menuList.length > 1 ? 1 : 0,
          })
        ),
      })
    );
  };

  const menuContent = menuList.map(item => (
    <Menu.Item key={item.evalTplId} data={item}>
      <div className={styles['history-version-menu-item-wrap']}>
        <div className={styles['history-version-menu-title']}>
          {intl
            .get('sslm.common.model.version.versionv', {
              versionNum: item.versionNum,
            })
            .d(`版本v${item.versionNum}`)}
        </div>
        <div className={styles['history-version-menu-person']}>
          <span>{`${item.publishUserName || item.lastUpdatedUser}`}</span>
          <span style={{ marginLeft: 8 }}>
            {dateTimeRender(item.publishTime || item.lastUpdateDate)}
          </span>
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
