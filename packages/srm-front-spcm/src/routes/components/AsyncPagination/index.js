/*
 * @Description: 异步分页
 * @Date: 2022-11-21 14:50:22
 * @Author: MYT<yitian.mao@going-link.com>
 * @Version: 1.0.0
 * @Copyright: Copyright (c) 2021, ZhenYun
 */
import React from 'react';
import { Pagination, Spin } from 'hzero-ui';
import { isNumber } from 'lodash';

const AsyncPagination = props => {
  const { loading, current, onCustChange = e => e, ...pagination } = props;
  return isNumber(current) ? ( // 考虑未开启异步分页查询的时候，current, pageSize, total为undefined或者NaN的情况
    <div style={{ display: 'flex', justifyContent: 'end' }}>
      <div style={{ display: 'inline-block' }}>
        <Spin size="small" spinning={loading}>
          <Pagination
            {...(pagination || {})}
            onChange={onCustChange}
            onShowSizeChange={onCustChange}
            current={isNumber(current) ? current : 1}
          />
        </Spin>
      </div>
    </div>
  ) : null;
};

export default AsyncPagination;
