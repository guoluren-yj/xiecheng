import React, { useState, useEffect } from 'react';
import { Dropdown, Tooltip } from 'choerodon-ui/pro';
import { Menu, Icon } from 'choerodon-ui';

import ascending from '@/assets/icons/ascending.svg';
import descending from '@/assets/icons/descending.svg';
import intl from 'hzero-front/lib/utils/intl';
import styles from './index.less';

/**
 * 高级查询-排序
 */
export default function Sort(props) {
  const { selectList, onSearch, dataSet } = props;
  const [order, setOrder] = useState('desc');
  const [sortFieldCode, setSortFieldCode] = useState(selectList[0].value);

  useEffect(() => {
    dataSet.addEventListener('reset', handleFieldsValue);
  }, []);

  const handleFieldsValue = () => {
    setOrder('desc');
    setSortFieldCode(selectList[0].value);
  };

  const handleSortFieldCode = ({ key }) => {
    setSortFieldCode(key);
    dataSet.current.set('sortCode', key);
    onSearch();
  };

  const renderMenu = () => {
    return (
      <Menu onClick={handleSortFieldCode} defaultSelectedKeys={[sortFieldCode]}>
        {selectList.map((item) => (
          <Menu.Item key={item.value}>
            {intl.get('hitf.common.by').d('按')}
            {item.title}
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
            {sortField.title ? `${intl.get('hitf.common.by').d('按')}${sortField.title}` : ''}
            <Icon type="expand_more" />
          </span>
        </Dropdown>
        <Tooltip
          theme="light"
          title={
            order === 'asc'
              ? intl.get('hitf.common.asc').d('升序')
              : intl.get('hitf.common.desc').d('降序')
          }
        >
          <img src={order === 'asc' ? ascending : descending} alt="" onClick={handleOrder} />
        </Tooltip>
      </div>
    );
  };

  return handleSelect();
}
