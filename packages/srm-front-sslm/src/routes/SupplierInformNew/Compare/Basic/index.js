/*
 * Basic - 基础信息对比
 * @Date: 2023-04-06 10:19:06
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { useEffect } from 'react';
import { useDataSet } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';

import { fetchBasicInfo } from '@/services/supplierInformCompareService';

import Detail from './Detail';
import styles from '../styles.less';
import { getBasicDS } from '../../stores/getBasicDS';

const CompareBasic = ({ changeReqId, custLoading, customizeForm, setLoading, changeLevel }) => {
  const newDs = useDataSet(() => getBasicDS(), []);
  const oldDs = useDataSet(() => getBasicDS(), []);

  useEffect(() => {
    setLoading(true);
    fetchBasicInfo({
      changeReqId,
      customizeUnitCode: 'SSLM.SUPPLIER_INFORM_CHANGE_NEW_DETAIL.BASIC',
    })
      .then(response => {
        const res = getResponse(response);
        if (res) {
          const { newHeader, oldHeader } = res;
          newDs.create(newHeader);
          oldDs.create(oldHeader);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className={styles['compare-container']}>
      <div className={styles['compare-header']}>
        <div>{intl.get('sslm.common.view.compare.currentVersion').d('当前版本')}</div>
        <div>{intl.get('sslm.common.view.compare.historyVersion').d('历史版本')}</div>
      </div>
      <div className={styles['compare-content']}>
        <div>
          <div className={styles['compare-content-detail']}>
            <Detail
              dataSet={newDs}
              custLoading={custLoading}
              customizeForm={customizeForm}
              changeLevel={changeLevel}
            />
          </div>
        </div>
        <div>
          <Detail
            dataSet={oldDs}
            custLoading={custLoading}
            customizeForm={customizeForm}
            changeLevel={changeLevel}
          />
        </div>
      </div>
    </div>
  );
};

export default CompareBasic;
