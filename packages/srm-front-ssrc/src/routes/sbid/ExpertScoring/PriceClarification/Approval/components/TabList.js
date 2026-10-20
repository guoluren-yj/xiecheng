import React from 'react';
import { isEmpty, noop } from 'lodash';

import intl from 'utils/intl';

import Style from './index.less';
import TabItem from './TabItem';

const TabList = (props) => {
  const {
    title,
    children,
    activateId = '',
    tabList = [],
    tabTitle = '',
    tabDescription = '',
    onClick = noop,
    key = 'quotationHeaderId',
  } = props;

  return (
    <React.Fragment>
      <div className={Style['tab-list-wrapper']}>
        <div className={Style['tab-list-section']}>
          <div className={Style['tab-list-section-title']}>
            <div className={Style['tab-list-section-title-first']}>
              {tabTitle ||
                intl
                  .get('ssrc.inquiryHall.view.inquiryHall.priceClarificationDetail')
                  .d('价格澄清详情')}
            </div>
            <div className={Style['tab-list-section-title-second']}>
              {tabDescription ||
                intl.get(`ssrc.inquiryHall.view.message.tab.switchQuickly`).d('可以快速切换')}
            </div>
          </div>
          <div className={Style['tab-list-section-content']}>
            {isEmpty(tabList)
              ? null
              : tabList.map((item) => {
                  const itemProps = {
                    title,
                    activateId,
                    onClick,
                    primaryKeyId: item[key],
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
