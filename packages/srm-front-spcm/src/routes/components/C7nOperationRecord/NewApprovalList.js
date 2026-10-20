/*
 * @Description: 审批记录
 * @Date: 2022-04-24 09:56:33
 * @Author: MYT<yitian.mao@going-link.com>
 * @Version: 1.0.0
 * @Copyright: Copyright (c) 2021, ZhenYun
 */
import React, { useState, useEffect } from 'react';
import { Spin } from 'choerodon-ui';
import { isEmpty } from 'lodash';
import ApproveRecordGroup from '_components/ApproveRecordGroup';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import { fetchApprovalRecords } from './service';
import styles from './index.less';

export default function NewApprovalList(props) {
  const {
    pageData: { detailFlag, currentNodeId, ...others } = {},
    approveRecordData: paramRecordData,
  } = props;
  const [approveRecordData, setApproveRecordData] = useState(paramRecordData || []);
  const [fetchApprovalLoading, setApprovalLoading] = useState(false);
  useEffect(() => {
    if (!paramRecordData) {
      getApprovalRecords(others);
    }
  }, []);

  useEffect(() => {
    if (detailFlag && approveRecordData.length > 0) {
      setTimeout(() => {
        const currentNode = document.getElementById(currentNodeId);
        const scrollElement = document.querySelector('.c7n-pro-modal-body');
        scrollElement.scrollTo({
          top: currentNode?.offsetTop,
          behavior: 'smooth',
        });
      }, 300);
    }
  }, [detailFlag, approveRecordData]);

  // 获取审批记录数据
  const getApprovalRecords = (params) => {
    setApprovalLoading(true);
    fetchApprovalRecords(params)
      .then((res) => {
        const activeKeyArr = [];
        const result = getResponse(res);
        if (result) {
          // 按需对接口返回的审批记录数据进行处理
          const approveRecordDataResult = [].concat(
            result.map((item) => {
              activeKeyArr.push(item.processType);
              return {
                children: [].concat(
                  ...(item.approvalHistories.map(
                    (hisItem, index) =>
                      item.approvalHistories[item.approvalHistories.length - index - 1]
                        .historicTaskExtList
                  ) || [])
                ),
                title: item.processTypeMeaning,
              };
            })
          );
          setApproveRecordData(approveRecordDataResult);
        }
      })
      .finally(() => {
        setApprovalLoading(false);
      });
  };
  return (
    <Spin spinning={fetchApprovalLoading}>
      <div className={styles['approval-list-wrap']}>
        {isEmpty(approveRecordData) ? (
          <div className="empty-wrapper">
            <span>{intl.get('hzero.common.message.data.none').d('暂无数据')}</span>
          </div>
        ) : (
          <ApproveRecordGroup group={approveRecordData} />
        )}
      </div>
    </Spin>
  );
}
