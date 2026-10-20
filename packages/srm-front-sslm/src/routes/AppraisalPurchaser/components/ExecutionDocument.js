/*
 * ExecutionDocument - 执行单据
 * @Date: 2023-12-19 09:47:16
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import { isEmpty } from 'lodash';
import React, { useMemo } from 'react';
import { useObserver } from 'mobx-react-lite';
import { Tabs, Table, DataSet } from 'choerodon-ui/pro';

import intl from 'utils/intl';

import styles from '@/routes/index.less';
import { ReactComponent as NoData } from '@/assets/no-data.svg';
import {
  getRelegationDs,
  getRelegationColumns,
  getRectificationDs,
  getRectificationColumns,
} from '../stores/getExecutionDocumentDS';

const { TabPane } = Tabs;

// 执行单据list
export const getExecutionDocumentList = ({ supplierId, evalLineId, evalHeaderId }) => [
  {
    key: 'supplierRelegationDocs',
    columns: getRelegationColumns(),
    dataSet: new DataSet(getRelegationDs({ evalLineId })),
    customizedCode: 'SSLM.APPRAISAL_PURCHASER.RELEGATION_DOCS',
    tab: intl.get('sslm.common.view.title.supplierRelegationDocs').d('供应商升降级单据'),
  },
  {
    key: 'qualityRectification',
    columns: getRectificationColumns(),
    customizedCode: 'SSLM.APPRAISAL_PURCHASER.RECTIFICATION',
    dataSet: new DataSet(getRectificationDs({ supplierId, evalHeaderId })),
    tab: intl.get('sslm.common.view.title.qualityRectification').d('质量整改'),
  },
];

const ExecutionDocument = ({
  supplierId,
  evalLineId,
  evalHeaderId,
  executeLevelCount,
  executeRectifyCount,
}) => {
  const list = useMemo(() => getExecutionDocumentList({ supplierId, evalLineId, evalHeaderId }), [
    supplierId,
    evalLineId,
    evalHeaderId,
  ]);

  const countObj = {
    supplierRelegationDocs: executeLevelCount,
    qualityRectification: executeRectifyCount,
  };

  return (
    <Tabs tabPosition="left">
      {list.map(item => (
        <TabPane
          key={item.key}
          tab={item.tab}
          count={countObj[item.key]}
          countRenderer={({ count }) => count || 0}
        >
          {isEmpty(useObserver(() => item.dataSet?.toData())) ? (
            <div className={styles['modal-no-data']}>
              <NoData />
              <span>
                {intl
                  .get('sslm.appraisalPurchaser.view.message.noExecutionDocument')
                  .d('暂无执行单据')}
              </span>
            </div>
          ) : (
            <Table
              dataSet={item.dataSet}
              columns={item.columns}
              customizedCode={item.customizedCode}
              style={{ maxHeight: 'calc(100vh - 200px)' }}
            />
          )}
        </TabPane>
      ))}
    </Tabs>
  );
};

export default ExecutionDocument;
