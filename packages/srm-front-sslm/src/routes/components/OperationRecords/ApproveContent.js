/*
 * @Date: 2022-04-24 11:23:11
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { useEffect, useState } from 'react';
import { Spin } from 'choerodon-ui';
import { isEmpty } from 'lodash';

import intl from 'utils/intl';
import ApproveRecord from '_components/ApproveRecord';
import ApproveRecordGroup from '_components/ApproveRecordGroup';

import { getResponse } from 'utils/utils';

import { ReactComponent as NoData } from '@/assets/no-data.svg';
import { queryApproveRecords } from '@/services/commonService';
import styles from './index.less';

const ApproveContent = params => {
  const [dataSource, setDataSource] = useState([]);
  const [spinning, setSpinning] = useState(false);
  const [groupFlag, setGroupFlag] = useState(false); // 是否分组审批

  useEffect(() => {
    // 查询审批记录
    setSpinning(true);
    queryApproveRecords(params)
      .then(res => {
        if (getResponse(res)) {
          const list = res
            .map(item => {
              return {
                children: []
                  .concat(
                    ...((item.approvalHistories &&
                      typeof item.approvalHistories.map === 'function' &&
                      item.approvalHistories.map(hisItem => hisItem.historicTaskExtList)) ||
                      [])
                  )
                  .reverse(),
                title: item.nodeNameMeaning,
              };
            })
            .reverse();
          if (res.length > 1) {
            setGroupFlag(true);
          }
          setDataSource(list);
        }
      })
      .finally(() => setSpinning(false));
  }, []);

  return (
    <Spin spinning={spinning}>
      {!isEmpty(dataSource) ? (
        groupFlag ? (
          <ApproveRecordGroup group={dataSource} />
        ) : (
          <ApproveRecord data={dataSource[0]?.children} />
        )
      ) : (
        <div className={styles['no-data']}>
          <NoData />
          <span>{intl.get('sslm.common.view.message.noData').d('暂无数据')}</span>
        </div>
      )}
    </Spin>
  );
};

export default ApproveContent;
