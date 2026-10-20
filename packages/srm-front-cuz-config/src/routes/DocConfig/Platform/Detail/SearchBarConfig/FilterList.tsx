import React from 'react';
import classnames from 'classnames';
import { isEmpty } from 'lodash';

import intl from 'hzero-front/lib/utils/intl';
import styles from './index.less';

interface FilterListProps {
  filterList: any[];
  currentFilter: any;
  onSelectFilter: (filter: any) => void;
}

export default function FilterList(props: FilterListProps) {
  const {
    filterList = [],
    currentFilter = {},
    onSelectFilter = () => { },
  } = props;
  
  return (
    <>
      <div className={styles['searchBar-container-left-title']}>
        <span>{intl.get('hpfm.searchBar.view.message.searchBarList').d('筛选器列表')}</span>
      </div>
      {!isEmpty(filterList) && (
        <div className={styles['searchBar-container-left-list']}>
          {filterList.map(filter => (
            <div
              className={classnames({
                [styles['searchBar-container-left-list-item']]: true,
                [styles['searchBar-container-left-list-item-current']]: filter.filterId === currentFilter.filterId,
              })}
              onClick={() => onSelectFilter(filter)}
            >
              <div>
                {filter.filterName}
                {filter.defaultFlag === 1 && (
                  <span className={styles['searchBar-tag']}>
                    {intl.get('hzero.common.status.default').d('默认')}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </>  
  );
}