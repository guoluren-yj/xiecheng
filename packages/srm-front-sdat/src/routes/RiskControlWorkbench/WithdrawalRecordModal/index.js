/**
 * 处置事件操作记录
 */
import React, { useState, useEffect } from 'react';
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { Tabs } from 'choerodon-ui/pro';
import ApproveRecordNew from '_components/ApproveRecord';
// import ApproveRecordGroup from "srm-front-boot/lib/components/ApproveRecordGroup";

import { getResponse } from '@/utils/utils';
import { fetchApproveRecord } from '@/services/riskWorkPlaceService';

import OperationRecord from '../OperationRecord';
import styles from './index.less';

const { TabPane } = Tabs;

export default function WithdrawalRecordModal(props) {
  const { localRecord } = props;

  const [forecastLoading, setLoading] = useState(false);
  const [detailArray, setApproveData] = useState([]);

  useEffect(() => {
    setLoading(true);
    // 查询审批记录
    fetchApproveRecord({
      // riskProcessId: localRecord.riskProcessId,
      organizationId: getCurrentOrganizationId(),
      businessKey: localRecord?.businessId,
      commentRecordFlag: true,
      commentStartFlag: true,
      needMerge: true,
    }).then((res) => {
      setLoading(false);
      if (getResponse(res)) {
        setApproveData(Array.isArray(res) && res.length ? res : []);
      } else {
        setApproveData([]);
      }
    });
  }, [localRecord]);

  const filterList = (historyApprovalRecords = [], detail) => {
    const historyList = [].concat(
      ...historyApprovalRecords.map((item) => item.historicTaskExtList || [])
    );

    const detailList = detail.historicTaskExtList ? detail.historicTaskExtList : [];
    const list = historyList.concat(detailList);
    let result = [];

    if (historyList.length > 0 && detailList.length > 0) {
      // detail是要显示在顶部的记录 但是历史记录中会存在日期比detail晚的记录 要过滤掉
      let minStartTime = detailList[0].startTime || '';
      detailList.forEach((res) => {
        if (res.startTime) {
          if (minStartTime) {
            const currentTime = new Date(res.startTime);
            const minStartTimeD = new Date(minStartTime);
            if (currentTime < minStartTimeD) {
              minStartTime = res.startTime;
            }
          } else {
            minStartTime = res.startTime;
          }
        }
      });
      if (minStartTime) {
        const endTimeData = new Date(minStartTime);
        result = list.filter(
          (item, index) =>
            !(new Date(item.endTime) > endTimeData && index <= list.length - detailList.length)
        );
      } else {
        result = list;
      }
    } else {
      result = list;
    }
    return result;
  };

  const approveRecordData = forecastLoading ? [] : filterList(detailArray, detailArray);

  return (
    <div className={styles['withdrawal-modal-basic-tabs']}>
      <Tabs defaultActiveKey="1">
        <TabPane
          tab={intl.get(`sdat.riskControl.view.button.operationRecord`).d('操作记录')}
          key="1"
        >
          <OperationRecord queryProcess localRecord={localRecord} modalType="withdrawal" />
        </TabPane>
        {approveRecordData.length ? (
          <TabPane
            tab={intl.get(`sdat.riskControl.view.title.approvalRecord`).d('审批记录')}
            key="2"
          >
            <ApproveRecordNew
              data={approveRecordData.reverse()}
              // group={[
              //   {
              //     title: '测试',
              //     children: approveRecordData.reverse(),
              //   },
              // ]}
              forecastData={[]}
              forecastLoading={forecastLoading}
              showForecastBtnFlag={false}
            />
          </TabPane>
        ) : null}
      </Tabs>
    </div>
  );
}
