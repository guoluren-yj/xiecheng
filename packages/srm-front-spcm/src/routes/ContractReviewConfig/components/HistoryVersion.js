/*
 * @Date: 2025-03-12
 * @Author: CDJ
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import querystring from 'querystring';
import React, { useState, useEffect } from 'react';
import { routerRedux } from 'dva/router';
import { Menu } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { getResponse, filterNullValueObject } from 'utils/utils';

import {
  fetchReviewTemplateHistory,
 } from "@/services/contractReviewConfigService";
import styles from '../TemplateDetail/styles.less';

const HistoryVersion = ({
  type,
  record,
  dispatch,
  showSubMenuFlag,
  sourceReviewTemplateId,
}) => {
  const { reviewTemplateId, reviewTemplateCode } = record?.get(['reviewTemplateId', 'reviewTemplateCode']) || {};
  const [menuList, setMenuList] = useState([]);

  useEffect(() => {
    if (reviewTemplateId) {
      fetchReviewTemplateHistory({ reviewTemplateId, reviewTemplateCode }).then((res) => {
        if (getResponse(res)) {
          setMenuList(res);
        }
      });
    }
  }, [reviewTemplateId, reviewTemplateCode]);

  const handleItemClick = ({ item }) => {
    const { reviewTemplateId: newReviewTemplateId } = item.props?.data || {};
    const moreThenOneFlag = menuList.length > 1;

    dispatch(
      routerRedux.push({
        pathname: `/spcm/contract-review-config/template/detail/${newReviewTemplateId}/view`,
        search: querystring.stringify(
          filterNullValueObject({
            // 历史记录只有一条数据，就和点击单号进详情页一样，返回时直接返回列表页
            sourceReviewTemplateId: moreThenOneFlag ? sourceReviewTemplateId : null,
            sourceKey: moreThenOneFlag ? type : null,
          })
        ),
      })
    );
  };

  const menuContent = menuList.map((item) => (
    <Menu.Item key={item.strategyId} data={item}>
      <div className={styles['history-version-menu-item-wrap']}>
        <div className={styles['history-version-menu-title']}>
          {intl
            .get('spcm.common.model.version.versionv', {
              versionNumber: item.versionNumber,
            })
            .d(`版本v${item.versionNumber}`)}
        </div>
        <div className={styles['history-version-menu-person']}>
          <span>{`${item.createdByName}`}</span>
          <span style={{ marginLeft: 8 }}>{`${item.creationDate}`}</span>
        </div>
      </div>
    </Menu.Item>
  ));
  return (
    <Menu onClick={handleItemClick} className={styles['spcm-review-config-history-version-menu']}>
      {showSubMenuFlag ? (
        <Menu.SubMenu
          key="historyVersion"
          className={styles['spcm-review-config-history-version-submenu']}
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
