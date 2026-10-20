import React, { useState, useEffect } from 'react';
import { Spin } from 'choerodon-ui/pro';
import { isEmpty, isPlainObject } from 'lodash';
import moment from 'moment';
import request from 'utils/request';
import { HZERO_HWFP } from 'utils/config';
import { getResponse, getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import ApproveRecord from '_components/ApproveRecord';

const fetchApprovalRecord = (params) => {
  const organizationId = getCurrentOrganizationId();
  return request(`${HZERO_HWFP}/v1/${organizationId}/activiti/task/historyApproval`, {
    method: 'POST',
    query: params,
  });
};

const fetchBatchApprovalRecord = (params) => {
  const organizationId = getCurrentOrganizationId();
  return request(`${HZERO_HWFP}/v1/${organizationId}/activiti/task/historyApproval-batch`, {
    method: 'POST',
    body: params,
  });
};

const fetchBusinessKeys = (params) => {
  return request(`/smpc/v1/${getCurrentOrganizationId()}/sku-operation-records/businessKey`, {
    method: 'GET',
    query: params,
  });
};

export default function RecordApproval(props) {
  const { businessKey, businessParams = {} } = props;
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      // 批量查询审批记录
      const isBatch = !businessKey;
      const api = isBatch ? fetchBatchApprovalRecord : fetchApprovalRecord;
      let businessKeys;
      if (isBatch) {
        // 无工作流返回 {}
        businessKeys = getResponse(await fetchBusinessKeys(filterNullValueObject(businessParams)));
      }
      if (!isEmpty(businessKeys) || businessKey) {
        const params = isBatch ? businessKeys : { businessKey };
        let res = getResponse(await api(params));
        if (res) {
          // res为对象->批量请求
          if (isPlainObject(res)) {
            // 所有有值的 流程审批集合
            // res: {'aa': []}
            res =
              (Object.values(res || {}) || [])
                .filter((f = []) => f.length > 0)
                .reduce((p, i) => p.concat(i), []) || [];
          }
          // res 为数组，单个请求
          const list = (res || []).reduce((p, c) => {
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
