import React, { useState, useEffect } from 'react';
import { Spin } from 'choerodon-ui/pro';
import moment from 'moment';
import request from 'utils/request';
import { HZERO_HWFP } from 'utils/config';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import ApproveRecord from '_components/ApproveRecord';

const fetchBatchApprovalRecord = params => {
  const organizationId = getCurrentOrganizationId();
  return request(
    `${HZERO_HWFP}/v1/${organizationId}/activiti/task/historyApproval-batch?commentRecordFlag=1&commentStartFlag=1&needMerge=1`,
    {
      method: 'POST',
      body: params,
    }
  );
};

export default function RecordApproval(props) {
  const { businessKeys = [] } = props;
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      let res = getResponse(await fetchBatchApprovalRecord(businessKeys));
      if (res) {
        // 所有有值的 流程审批集合
        // res: {'aa': []}
        res =
          (Object.values(res || {}) || [])
            .filter((f = []) => f.length > 0)
            .reduce((p, i) => p.concat(i), []) || [];
        const list = res.reduce((p, c) => {
          const { historicTaskExtList, historicTaskList } = c;
          return p.concat(historicTaskExtList || []).concat(historicTaskList || []);
        }, []);
        // 时间降序
        setData(
          list.sort((a, b) => {
            const v = moment(a.endTime).isBefore(b.endTime);
            return v ? +v : +v - 1;
          })
        );
      }
    } finally {
      setLoading(false);
    }
  }
  return (
    <Spin spinning={loading}>
      <ApproveRecord data={data} />
    </Spin>
  );
}
