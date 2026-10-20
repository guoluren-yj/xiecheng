/*
 * @Date: 2024-01-08
 * @Author: zlh
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { useState, useEffect } from 'react';
import querystring from 'querystring';
import { routerRedux } from 'dva/router';
import { Menu } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { getResponse, filterNullValueObject } from 'utils/utils';

import { queryHistoryList } from '@/services/supplierQuotaService';
import styles from './index.less';

const HistoryVersion = ({
  type,
  entranceSource, // 入口来源
  source,
  record,
  dispatch,
  showSubMenuFlag,
  sourceQuotaHeaderId,
}) => {
  const { quotaAgreementNum, quotaHeaderId } =
    record?.get(['quotaAgreementNum', 'quotaHeaderId']) || {};
  const [menuList, setMenuList] = useState([]);

  useEffect(() => {
    queryHistoryList({ quotaAgreementNum }).then(response => {
      const res = getResponse(response);
      if (res) {
        const dataList = res.content.filter(n => n.quotaHeaderId !== quotaHeaderId) || [];
        setMenuList(dataList);
      }
    });
  }, [quotaAgreementNum, quotaHeaderId]);

  const handleItemClick = ({ item }) => {
    const { quotaHeaderId: curQuotaHeaderId, versionNum } = item.props?.data || {};
    if (curQuotaHeaderId) {
      dispatch(
        routerRedux.push({
          pathname: `/sslm/supplier-quota-master-data/detail/${curQuotaHeaderId}`,
          search: querystring.stringify(
            filterNullValueObject({
              type,
              source,
              entranceSource,
              versionNum,
              sourceQuotaHeaderId,
            })
          ),
        })
      );
    }
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
          <span>{`${item.createName || item.createdBy}`}</span>
          <span style={{ marginLeft: 8 }}>{`${item.creationDate}`}</span>
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
