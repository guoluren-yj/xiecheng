import React, { useEffect, useState } from 'react';
import { Progress, Pagination, Spin } from 'choerodon-ui/pro';

import { fetchDetailData } from '@/services/skuTask';
import { getResponse } from 'utils/utils';
import intl from 'utils/intl';

import styles from './detail.less';

export default function Detail(props) {
  const { record } = props;
  const [list, setList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchDetail(currentPage, 10);
  }, []);

  async function fetchDetail(page, pageSize) {
    setLoading(true);
    const data = getResponse(
      await fetchDetailData({
        taskId: record.get('taskId'),
        page: page - 1,
        size: pageSize || 10,
      })
    );
    if (data) {
      const { content = [], totalElements } = data;
      setTotalCount(totalElements);
      setList(content);
      setLoading(false);
    }
  }

  function handleChange(page, pageSize) {
    setCurrentPage(page);
    fetchDetail(page, pageSize);
  }

  return (
    <div className={styles['box-container']}>
      <div className="box-content">
        <Spin spinning={loading}>
          {list.length > 0 &&
            list.map((item) => {
              return (
                <div className="box-item">
                  <div className="item-name">{item.pageName}</div>
                  <div style={{ marginBottom: '4px' }}>
                    <span style={{ color: 'rgba(0,0,0,0.65)' }}>
                      {intl.get('smep.skuTask.model.init').d('初始化')}：
                    </span>
                    <span style={{ color: '#000', fontWeight: 500, marginRight: '16px' }}>
                      {item.initCount}
                    </span>
                    <span style={{ color: 'rgba(0,0,0,0.65)' }}>
                      {intl.get('smep.skuTask.model.residue').d('剩余')}：
                    </span>
                    <span style={{ color: '#F88D10', fontWeight: 500 }}>{item.remainCount}</span>
                  </div>
                  <Progress
                    value={item.processRate}
                    status={item.processRate === 100 ? 'success' : 'active'}
                  />
                </div>
              );
            })}
        </Spin>
      </div>
      <Pagination
        style={{ marginTop: '4px', textAlign: 'end' }}
        total={totalCount}
        onChange={handleChange}
        showSizeChanger={false}
        sizeChangerPosition="right"
        page={currentPage}
        pageSize={10}
      />
    </div>
  );
}
