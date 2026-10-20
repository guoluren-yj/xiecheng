import React, { useEffect } from 'react';
import { Table } from 'choerodon-ui/pro';
import { throttle } from 'lodash';

import { getResponse, filterNullValueObject } from 'utils/utils';

import './index.less';

export default function RealTimeLoadTable(props) {
  const {
    query: { api, params = {} },
    dataSet,
    columns,
    queryFieldsLimit = 3,
  } = props;
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    if (!dataSet.getState('noMore')) {
      dataSet.status = 'loading';
      const res = await api(
        filterNullValueObject({
          ...params,
          ...(dataSet.getState('reqParams') || {}), // 加载更多需传
        })
      );
      dataSet.status = 'ready';
      if (getResponse(res)) {
        const { resultList = [], currentYear, noMore, currentRow, offset } = res || {};
        dataSet.appendData(resultList || []);
        dataSet.setState('reqParams', {
          currentYear,
          noMore,
          currentRow,
          offset,
        });
        dataSet.setState('noMore', noMore);
      }
    }
    handleScrollLoad();
  };

  const handleScrollLoad = () => {
    const contentElm = document.querySelector('.c7n-pro-modal-container #real-time-load-table');
    if (contentElm) {
      contentElm.onscroll = throttle(function scroll() {
        // 滑到底部， 请求数据
        // scrollTop 可能为小数
        if (Math.abs(this.scrollHeight - this.scrollTop - this.clientHeight) < 1) {
          fetchData();
        }
      }, 300);
    }
  };
  return (
    <Table
      dataSet={dataSet}
      columns={columns}
      queryFieldsLimit={queryFieldsLimit}
      id="real-time-load-table"
    />
  );
}
