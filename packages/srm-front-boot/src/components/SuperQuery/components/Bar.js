import React, { Fragment, useContext, useEffect } from 'react';
import { observer } from 'mobx-react-lite';

import SearchBar from '../../SearchBarTable/SearchBar';
import { Store } from '../stores';

import styles from './index.less';

/**
 * 单据类型筛选器测试
 */

const Bar = (props) => {
  const { searchBarRef, initFlag, setInitFlag, linkType, dsQueryParams } = useContext(Store);
  const { dataSet, searchCode, style } = props;

  const onQuery = ({ params }) => {
    if (initFlag) {
      setInitFlag(false);
    }
    const { tempKey = '' } = params;
    let supplierParams = {};
    if (tempKey.includes('-')) {
      const [supplierId, supplierCompanyId] = tempKey.split('-');
      supplierParams = {
        supplierId,
        supplierCompanyId,
      };
    }

    if (params && dataSet.getQueryParameter('searchBarParams')) {
      dataSet.setQueryParameter('searchBarParams', null);
    }

    const allParams = {
      ...params,
      ...supplierParams,
      ...dsQueryParams,
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
      <div className={styles['search-bar']} style={style}>
        <SearchBar
          onRef={(ref) => {
            searchBarRef.current = ref;
          }}
          key={`${searchCode}${
            linkType === 'superQuery' && initFlag ? 'customizeFilterFields' : null
          }`}
          searchCode={searchCode}
          cacheState
          // closeFilterSelector
          closeMergeSearchInput
          onlyModelField
          onlySiteField
          autoQuery={false}
          defaultExpand={false}
          dataSet={[dataSet]}
          onQuery={(params) => onQuery(params)}
          parseUrlParamsType="decode"
          parseUrlParamsKey={linkType === 'superQuery' && initFlag ? 'customizeFilterFields' : null}
          // parseUrlParamsKey="customizeFilterFields"
        />
      </div>
    </Fragment>
  );
};
export default observer(Bar);
