/**
 * ExpertScoring/BidHall - 澄清单详情表格信息展示
 * @date: 2019-08-20
 * @author: zhangyongxuan <yongxuan.zhang@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */

import { Pagination } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import React, { Component } from 'react';

import intl from 'utils/intl';
import ReplyLine from './ReplyLine';

// import questionIcon from '@/assets/questionIcon.svg';

class TableList extends Component {
  renderList(dataSource = []) {
    if (dataSource.length > 0) {
      return dataSource.map((item) => {
        return <ReplyLine item={item} />;
      });
    } else {
      return (
        <div style={{ height: '32px', lineHeight: '32px', textAlign: 'center', color: '#aaa' }}>
          {intl.get(`ssrc.expertScoring.view.expertScoring.noData`).d('没有数据')}
        </div>
      );
    }
  }

  @Bind()
  onChange(page) {
    const { pagination, queryClarifyNotifyList } = this.props;
    pagination.current = page;
    queryClarifyNotifyList(pagination);
  }

  @Bind()
  onShowSizeChange(current, size) {
    const { pagination, queryClarifyNotifyList } = this.props;
    pagination.current = current;
    pagination.pageSize = size;
    queryClarifyNotifyList(pagination);
  }

  render() {
    const { dataSource, pagination } = this.props;
    return (
      <div>
        <div>{this.renderList(dataSource)}</div>
        {dataSource.length > 0 && (
          <div style={{ float: 'right' }}>
            <Pagination
              {...pagination}
              onChange={this.onChange}
              onShowSizeChange={this.onShowSizeChange}
              style={{ float: 'right' }}
            />
          </div>
        )}
      </div>
    );
  }
}

export default TableList;
