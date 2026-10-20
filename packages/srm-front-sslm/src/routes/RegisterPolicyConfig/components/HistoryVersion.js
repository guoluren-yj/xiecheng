/*
 * @Date: 2023-12-06 09:32:28
 * @author: CDJ <dengji.chen@hand-china.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { useState, useEffect } from 'react';
import { Menu } from 'choerodon-ui/pro';
import { isFunction } from 'lodash';
import { routerRedux } from 'dva/router';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import { dateTimeRender } from 'utils/renderer';

import { fetchHistoryVersion } from '@/services/registerAuthenticationManageService';

import styles from '../index.less';

const HistoryVersion = ({
  record,
  showSubMenuFlag = true,
  filterData = false,
  dispatch,
  isPlatform = false,
  handleVersionClick,
  handleMenuHidden = () => {},
}) => {
  const currentData = isFunction(record?.get)
    ? record.get(['assignId', 'tenantId', 'strategyCfBasicId'])
    : record;
  const { assignId, tenantId, strategyCfBasicId } = currentData || {};
  const [menuList, setMenuList] = useState([]);
  useEffect(() => {
    fetchHistoryVersion({ assignId, tenantId, page: 0, size: 0, isPlatform }).then(res => {
      if (getResponse(res)) {
        const { content = [] } = res;
        let dataList = content;
        if (filterData) {
          dataList = content.filter(n => n.strategyCfBasicId !== strategyCfBasicId);
        }
        setMenuList(dataList);
      }
    });
  }, [assignId, tenantId, strategyCfBasicId]);

  const handleItemClick = ({ item }) => {
    const {
      assignId: itemAssignId,
      strategyCfBasicId: itemStrategyCfBasicId,
      tenantId: itemTenantId,
    } = item.props?.data || {};
    if (isPlatform) {
      dispatch(
        routerRedux.push({
          pathname: `/sslm/register-authentication-manage/detail/${itemAssignId}/${itemStrategyCfBasicId}/${itemTenantId}`,
        })
      );
    } else if (isFunction(handleVersionClick)) {
      handleMenuHidden(true);
      handleVersionClick(item.props?.data || {});
    }
  };

  const menuContent = menuList.map(item => {
    const {
      versionNum,
      publishUserName,
      publishDate,
      strategyCfBasicId: itemStrategyCfBasicId,
    } = item;

    return (
      <Menu.Item key={itemStrategyCfBasicId} data={item}>
        <div className={styles['history-version-menu-item-wrap']}>
          <div className={styles['history-version-menu-title']}>
            {intl
              .get('sslm.common.model.version.versionv', {
                versionNum,
              })
              .d(`版本v${versionNum}`)}
          </div>
          <div className={styles['history-version-menu-person']}>
            <span>{publishUserName}</span>
            <span style={{ marginLeft: 8 }}>{dateTimeRender(publishDate)}</span>
          </div>
        </div>
      </Menu.Item>
    );
  });

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
