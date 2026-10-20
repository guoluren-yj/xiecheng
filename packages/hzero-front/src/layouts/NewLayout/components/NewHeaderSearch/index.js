/**
 * 搜索框
 */
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { Icon, Menu } from 'choerodon-ui';
import { Dropdown, TextField } from 'choerodon-ui/pro';
import intl from 'utils/intl';

import { getClassName } from '../../utils';

function getNewSearchClassName(...paths) {
  return getClassName('search', ...paths);
}

const prefix = <Icon type="search" />;
const trigger = ['focus'];
const NewHeaderSearch = function NewHeaderSearch(props) {
  const {
    recentlyVisitedInline,
    recentlyVisited,
    itemRenderer,
    searchText,
    onRecentlyVisitedChange,
    onSearch,
    dropDownHidden,
    onDropDownHiddenChange,
    onActiveChange,
  } = props;
  const containerRef = useRef();
  const options = useMemo(() => {
    const label = intl.get('hzero.common.basicLayout.recentlyVisited').d('最近访问');
    const Cmp = recentlyVisitedInline ? 'li' : Menu.Item;
    const items = recentlyVisited.reduce((list, d) => d.path && d.title ? list.concat(
      <Cmp key={d.id}>
        {itemRenderer(d, d.title, true)}
        {!recentlyVisitedInline && <Icon type="close" onClick={() => onRecentlyVisitedChange(recentlyVisited.filter(item => item.id !== d.id))} />}
      </Cmp>,
    ) : list, recentlyVisitedInline ? [] : [
      <Cmp key="__clear_all__" className={getNewSearchClassName('menu', 'item', 'clear')}>
        {label}
        <Icon type="delete_black-o" onClick={() => onRecentlyVisitedChange([])} />
      </Cmp>,
    ]);
    if (items.length > (recentlyVisitedInline ? 0 : 1)) {
      return recentlyVisitedInline ? (
        <div className={getNewSearchClassName('recently')}>
          <span className={getNewSearchClassName('menu', 'item', 'clear')}>{label}:</span>
          <ul>
            {items}
          </ul>
          <Icon className={getNewSearchClassName('clear', 'icon')} type="delete_black-o" onClick={() => onRecentlyVisitedChange([])} />
        </div>
      ) : (
        <Menu selectedKeys={[]} className={getNewSearchClassName('menu')}>
          {items}
        </Menu>
      );
    }
  }, [recentlyVisited, recentlyVisitedInline]);
  const getPopupContainer = useCallback(() => containerRef.current, []);
  useEffect(() => () => onActiveChange(false), []);
  const input = (
    <TextField
      prefix={prefix}
      size="small"
      placeholder={intl.get('hzero.common.basicLayout.menuSelect').d('菜单搜索')}
      className={getNewSearchClassName('search')}
      onChange={onSearch}
      onFocus={() => onActiveChange(true)}
      onBlur={() => onActiveChange(false)}
      value={searchText}
      valueChangeAction="input"
      clearButton
      trim="none"
    />
  );
  return (
    <div className={getNewSearchClassName('container')} ref={containerRef}>
      {
        recentlyVisitedInline ? (
          <>
            {input}
            {options}
          </>
        ) : (
          <Dropdown
            hidden={dropDownHidden}
            onHiddenChange={onDropDownHiddenChange}
            overlay={options}
            trigger={trigger}
            getPopupContainer={getPopupContainer}
          >
            {input}
          </Dropdown>
        )
      }
    </div>
  );
};

export default NewHeaderSearch;
