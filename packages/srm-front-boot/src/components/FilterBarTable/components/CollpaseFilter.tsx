import React from 'react';
import { Icon } from 'choerodon-ui';

import intl from '../../../utils/intl';

import { stylePrefix } from '../util';

interface ICollpaseFilter {
  collpase: boolean;
  handleCollpase: () => void;
}

const CollpaseFilter = ({ collpase, handleCollpase }: ICollpaseFilter) => {
  return (
    <div onClick={handleCollpase} className={`${stylePrefix}-collpase-filter`}>
      <span>
        <Icon type="filter_list" style={{ fontWeight: 600, color: '#000', fontSize: '16px' }} />
      </span>
      <span className={`${stylePrefix}-filter-text`}>
        {collpase
          ? intl.get('srm.filterBar.view.message.collapseFilter').d('收起筛选')
          : intl.get('srm.filterBar.view.message.expandFilter').d('展开筛选')}
      </span>
      <span>
        <Icon type={collpase ? 'expand_less' : 'expand_more'} />
      </span>
    </div>
  );
};

export default CollpaseFilter;
