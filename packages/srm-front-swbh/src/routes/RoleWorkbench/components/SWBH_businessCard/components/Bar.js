import React, { Fragment, memo } from 'react';
import SearchBar from 'srm-front-boot/lib/components/SearchBarTable/SearchBar';
// import classNames from 'classnames';
import { isEmpty, isNil } from 'lodash';

import styles from './index.less';

export default memo((props) => {
  const { dataSet, customizerCode } = props;
  console.log(customizerCode);
  const onQuery = ({ params }) => {
    const { tempKey = '' } = params;
    const [supplierId, supplierCompanyId] = tempKey.split('-');
    const allParams = {
      ...params,
      supplierId,
      supplierCompanyId,
    };

    dataSet.queryDataSet.loadData([
      {
        ...allParams,
      },
    ]);
    dataSet.query();
  };
  return (
    <Fragment>
      <div className={styles['search-bar']}>
        <SearchBar
          virtual
          closeFilterSelector
          key={customizerCode}
          searchCode={customizerCode}
          // defaultExpand={false}
          dataSet={[dataSet]}
          onQuery={(e) => onQuery(e)}
        />
      </div>
    </Fragment>
  );
});
