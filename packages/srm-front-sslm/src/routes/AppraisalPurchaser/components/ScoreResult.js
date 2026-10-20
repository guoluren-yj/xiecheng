/*
 * ScoreResult - 评分结果
 * @Date: 2023-12-07 11:07:00
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import { isEmpty } from 'lodash';
import { Modal, DataSet } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';

import { publishComplaint } from '@/services/appraisalPurchaserService';

import ScoreCombineTable from './ScoreCombineTable';
import { getScoreCombineTableDs } from '../stores/getScoreCombineTableDS';

const ScoreResult = ({
  remote,
  dataSet,
  onRefresh,
  dispatch,
  basicDs,
  searchCode,
  wfParams = {},
  custLoading,
  combineRef,
  readOnlyFlag,
  workflowFlag,
  evalHeaderId,
  customizeTable,
  evalGranularity,
  detailLineCode,
  customizeUnitCode,
}) => {
  // 发布申诉
  const handlePublishComplaint = (publishData, resolve) => {
    publishComplaint({
      publishData,
      customizeUnitCode,
    })
      .then(response => {
        const res = getResponse(response);
        if (res) {
          notification.success();
          dataSet.unSelectAll();
          dataSet.clearCachedSelected();
          resolve();
          Modal.destroyAll();
          onRefresh();
        }
      })
      .finally(() => {
        resolve(false);
      });
  };

  // 处理申诉
  const handleAppeal = () => {
    const appealDs = new DataSet(getScoreCombineTableDs({ evalHeaderId, isAppeal: true }));
    const dataList = dataSet.selected.map(record => record.toData()); // 需转换，否则视为引用，结果和申诉子级互相影响
    const noAppealData = dataList.filter(
      n => !['appealing', 'appealApprovaRejected'].includes(n.lineStatus)
    );
    if (!isEmpty(noAppealData)) {
      notification.warning({
        message: intl
          .get('sslm.appraisalPurchaser.view.messgae.appealWarningMsg')
          .d('勾选数据中存在未申诉，请检查'),
      });
      return false;
    }
    appealDs.loadData(dataList);
    Modal.open({
      drawer: true,
      key: Modal.key(),
      style: { width: 1090 },
      okText: intl.get(`hzero.common.button.release`).d('发布'),
      title: intl.get('sslm.common.view.button.dealAppeals').d('处理申诉'),
      children: (
        <ScoreCombineTable
          basicDs={basicDs}
          dataSet={appealDs}
          sourceKey="APPEAL"
          custLoading={custLoading}
          customizeTable={customizeTable}
          evalGranularity={evalGranularity}
          searchCode="SSLM.APPRAISAL_PURCHASER_DETAIL.SCORE_RESULT_SEARCH"
          customizeUnitCode="SSLM.APPRAISAL_PURCHASER_DETAIL.SCORE_RESULT_LIST"
        />
      ),
      onOk: () => {
        return new Promise(async resolve => {
          const validateFlag = await appealDs.validate();
          if (validateFlag) {
            const publishData = appealDs.toData();
            // 判断【申诉说明】，【采购方回复】是否填写
            let isMaintain = false;
            publishData.forEach(n => {
              if (!n.appealCheckCollectScore || !n.appealReply) {
                isMaintain = true;
                return false;
              }
            });
            if (isMaintain) {
              Modal.confirm({
                title: intl.get('hzero.common.message.confirm.title').d('提示'),
                children: intl
                  .get('sslm.supplierDocManage.view.title.complaintPublishMsg')
                  .d('未修改分数或未给出采购方回复意见，请确认是否继续发布'),
                onOk: () => {
                  return new Promise(publishResolve => {
                    handlePublishComplaint(publishData, publishResolve);
                  });
                },
              });
            } else {
              handlePublishComplaint(publishData, resolve);
            }
          } else {
            resolve(false);
          }
        });
      },
    });
  };

  return (
    <ScoreCombineTable
      remote={remote}
      basicDs={basicDs}
      dispatch={dispatch}
      dataSet={dataSet}
      ref={combineRef}
      wfParams={wfParams}
      searchCode={searchCode}
      sourceKey="SCORE_RESULT"
      custLoading={custLoading}
      evalHeaderId={evalHeaderId}
      readOnlyFlag={readOnlyFlag}
      workflowFlag={workflowFlag}
      detailLineCode={detailLineCode}
      customizeTable={customizeTable}
      evalGranularity={evalGranularity}
      customizeUnitCode={customizeUnitCode}
      onAppeal={handleAppeal}
    />
  );
};

export default ScoreResult;
