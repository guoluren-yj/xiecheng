import React, { useState, useEffect } from 'react';
import { Dropdown, Tooltip } from 'choerodon-ui/pro';
import { Menu, Icon } from 'choerodon-ui';

import intl from 'utils/intl';

// import ascending from '@/assets/ascending.svg';
// import descending from '@/assets/descending.svg';
import { SortDescendingIcon, SortAscendingIcon } from './utils';

import styles from './index.less';

/**
 * 高级查询-排序
 */
export default function Sort(props) {
  const { selectList, onSearch, dataSet, handleChange } = props;
  const [order, setOrder] = useState();
  const [sortFieldCode, setSortFieldCode] = useState();
  useEffect(() => {
    dataSet.addEventListener('reset', handleFieldsValue);
    init();
  }, []);

  const init = () => {
    let initFieldCode = selectList[0].value;
    let initOrder = 'desc';
    if (dataSet.current) {
      if (dataSet.current.get('sortCode')) {
        initFieldCode = dataSet.current.get('sortCode');
      }
      if (dataSet.current.get('sortType')) {
        initOrder = dataSet.current.get('sortType');
      }
    }
    setSortFieldCode(initFieldCode);
    setOrder(initOrder);
  };

  const handleFieldsValue = () => {
    init();
    if (typeof handleChange === 'function') {
      handleChange();
    }
  };

  const handleSortFieldCode = ({ key }) => {
    setSortFieldCode(key);
    dataSet.current.set('sortCode', key);
    if (typeof handleChange === 'function') {
      handleChange();
    }
    onSearch();
  };

  const renderMenu = () => {
    return (
      <Menu onClick={handleSortFieldCode} defaultSelectedKeys={[sortFieldCode]}>
        {selectList.map((item) => (
          <Menu.Item key={item.value}>
            {intl
              .get('hwfp.common.approval.filter.according', {
                type: item.title,
              })
              .d('按{type}')}
          </Menu.Item>
        ))}
      </Menu>
    );
  };

  const handleOrder = () => {
    if (order === 'asc') {
      setOrder('desc');
      dataSet.current.set('sortType', 'desc');
    } else {
      setOrder('asc');
      dataSet.current.set('sortType', 'asc');
    }
    if (typeof handleChange === 'function') {
      handleChange();
    }
    onSearch();
  };

  const handleSelect = () => {
    const sortField =
      selectList.length < 1 || !sortFieldCode
        ? {}
        : selectList.find((item) => item.value === sortFieldCode) || {};
    return (
      <div className={styles['sort-condition']}>
        <Dropdown overlay={renderMenu} trigger="click">
          <span>
            {sortField.title
              ? `${intl
                  .get('hwfp.common.approval.filter.according', {
                    type: sortField.title,
                  })
                  .d('按{type}')}`
              : ''}
            <Icon type="expand_more" />
          </span>
        </Dropdown>
        <Tooltip
          title={
            order === 'asc'
              ? intl.get('hwfp.common.approval.filter.ascending').d('升序')
              : intl.get('hwfp.common.approval.filter.descending').d('降序')
          }
        >
          <div onClick={handleOrder} className={styles['sort-icon-div']}>
            {order === 'asc' ? <SortAscendingIcon /> : <SortDescendingIcon />}
          </div>
        </Tooltip>
      </div>
    );
  };

  return handleSelect();
}
