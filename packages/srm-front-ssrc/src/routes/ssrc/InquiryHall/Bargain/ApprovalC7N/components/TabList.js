import React from 'react';
import { isEmpty, noop } from 'lodash';

import Style from './index.less';
import TabItem from './TabItem';

const TabList = (props) => {
  const {
    title,
    children,
    activateId = '',
    tabList = [],
    onClick = noop,
    primaryKey = 'quotationHeaderId',
  } = props;

  return (
    <React.Fragment>
      <div className={Style['tab-list-wrapper']}>
        <div className={Style['tab-list-section']}>
          <div className={Style['tab-list-section-content']}>
            {isEmpty(tabList)
              ? null
              : tabList.map((item) => {
                  const itemProps = {
                    title,
                    activateId,
                    onClick,
                    primaryKeyId: item[primaryKey],
                    tabItemName: item.supplierCompanyName,
                    tabItemAmount: item.supplierTotalAmount,
                  };
                  return <TabItem {...itemProps} />;
                })}
          </div>
        </div>
        <div className={Style['tab-list-content']}>{isEmpty(tabList) ? null : children}</div>
      </div>
    </React.Fragment>
  );
};

export default TabList;
