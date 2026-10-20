/*
 * PaneHadear - 风险信息头排序
 * @Date: 2025-03-10 10:19:06
 * @Author: CDJ
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { useState, useEffect, useCallback } from 'react';
import classnames from 'classnames';

import { Menu, Dropdown, Icon, CheckBox } from 'choerodon-ui/pro';
import intl from 'utils/intl';

import { getMenus } from './utils/utils';

import styles from './styles.less';

const PaneHeader = (props) => {
  const {
    defaultMenuKey = 'riskLevel',
    handleQueryRiskInfoBySort = () => {},
    hiddenIgnoreBtn = false,
  } = props;

  const [menuKey, setMenuKey] = useState(defaultMenuKey);
  const [ignoreValue, setIgnoreValue] = useState(0);
  const [reviewPassValue, setReviewPassValue] = useState(0);

  useEffect(() => {}, []);

  // 已忽略复选框切换
  const handleIgnoreValueChange = useCallback((value) => {
    setIgnoreValue(value);
    setReviewPassValue(0);
    const payload = {
      ignoreFlag: value,
      onlyPassFlag: 0,
    };
    handleQueryRiskInfoBySort(payload);
  }, []);

  // 已通过复选框切换
  const handleReviewPassChange = useCallback((value) => {
    setReviewPassValue(value);
    setIgnoreValue(0);
    let payload = {
      ignoreFlag: 0,
      onlyPassFlag: value,
    };
    // 在审批工作台勾选【查看已通过的内容】时，只显示已通过内容，
    // 否则显示不通过的和已忽略的。
    if (hiddenIgnoreBtn) {
      payload = {
        onlyPassFlag: value,
      };
    }
    handleQueryRiskInfoBySort(payload);
  }, []);

  // 菜单切换
  const handleMenuChange = useCallback(({ key } = {}) => {
    setMenuKey(key);
    const payload = {
      sortField: key,
    };
    handleQueryRiskInfoBySort(payload);
  }, []);

  // 下拉菜单
  const renderOverlayMenu = useCallback(() => {
    return (
      <Menu
        onClick={handleMenuChange}
        className={styles['spcm-workspace-review-risk-sort-menu']}
        defaultSelectedKeys={[menuKey]}
      >
        {getMenus().map((item) => (
          <Menu.Item key={item.key} className={styles['risk-sort-menu-item']}>
            {item.title}
          </Menu.Item>
        ))}
      </Menu>
    );
  }, [menuKey]);

  const currentMenu = getMenus().find((i) => i.key === menuKey);

  return (
    <div className={classnames(styles['review-risk-tabs-header'], 'spcm-review-risk-tabs-header')}>
      <div className={styles['review-risk-tabs-header-left']}>
        {!hiddenIgnoreBtn && (
          <CheckBox
            name="ignoreFlag"
            value={1}
            unCheckedValue={0}
            onChange={handleIgnoreValueChange}
            checked={ignoreValue}
          >
            {intl.get('spcm.workspace.view.title.viewIgnoreContent').d('查看已忽略内容')}
          </CheckBox>
        )}
        <CheckBox
          name="onlyPassFlag"
          value={1}
          unCheckedValue={0}
          onChange={handleReviewPassChange}
          checked={reviewPassValue}
        >
          {intl.get('spcm.common.view.title.viewPassedContent').d('查看已通过内容')}
        </CheckBox>
      </div>
      <Dropdown overlay={() => renderOverlayMenu()} trigger={['click']}>
        <span className={styles['review-risk-tabs-header-right']}>
          {currentMenu
            ? intl
                .get('spcm.workspace.view.title.orderBySelect', { name: currentMenu.title })
                .d(`${currentMenu.title}`)
            : intl.get('spcm.workspace.view.title.orderByRiskLevel').d('按风险等级排序')}
          <Icon type="expand_more" />
        </span>
      </Dropdown>
    </div>
  );
};

export default PaneHeader;
