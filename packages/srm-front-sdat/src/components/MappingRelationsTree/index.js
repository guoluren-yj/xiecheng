/* eslint-disable no-unused-expressions */
import React, { useState, useEffect, useRef } from 'react';
import { getResponse } from 'hzero-front/lib/utils/utils';
import { Spin } from 'choerodon-ui';
import formatterCollections from 'srm-front-boot/lib/utils/intl/formatterCollections';
import intl from 'srm-front-boot/lib/utils/intl';

import ImgIcon from '@/utils/ImgIcon';
import { getCombinationBOList } from '@/services/sdpsTransfer/businessObjectService';

import TreeShow from './TreeShow';
import styles from './index.less';

const MappingRelationsTree = params => {
  const { tableName, fetchUrl, pageType, initRefresh = () => {} } = params;

  const treeShowRef = useRef();
  const [dataSource, setDataSource] = useState([]);
  const [loading, setLoading] = useState(false);

  // 初始化
  const init = tagVal => {
    if (tagVal) {
      setLoading(true);
      getCombinationBOList({
        tableName: tagVal,
        url: fetchUrl,
      }).then(res => {
        setLoading(false);
        if (getResponse(res)) {
          setDataSource(res);
          treeShowRef.current?.handleSelectSource({ element: res, init: true });
        }
      });
    }
  };

  const refreshMap = () => {
    if (tableName) {
      init(tableName);
    }
  };

  useEffect(() => {
    initRefresh(refreshMap);
    if (tableName) {
      init(tableName);
    }
  }, [tableName]);

  const treeShowProps = {
    dataSource,
    tableName,
    pageType,
    models: {
      label: 'businessObjectCombineName',
      value: 'businessObjectId',
      label2: 'referenceTableName',
    },
    treeShowRef,
  };

  return (
    <Spin spinning={loading}>
      <div className={styles['left-wrapper']}>
        <div className={styles['left-tips']}>
          <div className={styles['tips-wrapper']}>
            {pageType !== 'platform' ? (
              <>
                <div className={styles['tips-1-1']}>
                  <span
                    style={{
                      display: 'inline-block',
                      borderRadius: '5px',
                      border: '1px solid #D8D8D8',
                      backgroundColor: '#fff',
                      width: '25px',
                      height: '15px',
                    }}
                  />
                  &nbsp;&nbsp;
                  <span>{intl.get('sdps.dataDictionary.view.title.subscribed').d('已订阅')}</span>
                </div>

                <span style={{ color: '#D8D8D8', marginRight: '12px' }}>|</span>

                <div className={styles['tips-1-1']}>
                  <span
                    style={{
                      display: 'inline-block',
                      borderRadius: '5px',
                      border: '1px solid #D8D8D8',
                      backgroundColor: 'f8f8f8',
                      width: '25px',
                      height: '15px',
                    }}
                  />
                  &nbsp;&nbsp;
                  <span>
                    {intl.get('sdps.dataDictionary.view.title.notSubscribed').d('未订阅')}
                  </span>
                </div>

                <span style={{ color: '#D8D8D8', marginRight: '12px' }}>|</span>
              </>
            ) : null}
            <div className={styles['tips-1-1']}>
              <ImgIcon
                name="onetoone.svg"
                size={27}
                style={{ width: 27, height: 11, marginRight: 6 }}
              />
              <span>1 - 1</span>
            </div>

            <span style={{ color: '#D8D8D8' }}>|</span>

            <div className={styles['tips-1-n']}>
              <ImgIcon
                name="oneton.svg"
                size={27}
                style={{ width: 27, height: 11, marginRight: 6 }}
              />
              <span>1 - N</span>
            </div>
          </div>
        </div>
        <div style={{ marginLeft: '16px', overflow: 'auto', display: 'flex' }}>
          <TreeShow {...treeShowProps} />
        </div>
      </div>
    </Spin>
  );
};
export default formatterCollections({ code: ['sdps.boComposition'] })(MappingRelationsTree);
