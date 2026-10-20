/**
 *
 * @date: 2020/7/21
 * @author: zhanghao <hao.zhang07@hand-china.com>
 * @version: 0.0.1,
 * @copyright: Copyright 2019, Hand
 */
import React from 'react';
import { routerRedux } from 'dva/router';

import SearchBarTable from '_components/SearchBarTable';

import { tableHeight, tableMaxHeight, renderStatus } from '@/routes/components/utils';

const List = ({ dataSet, dispatch, customizeTable }) => {
  /**
   * 页面跳转处理函数
   * @param {object} record
   */
  const handleJump = record => {
    dispatch(routerRedux.push(`/sslm/event-record/detail/${record.get('evalEventHeaderId')}`));
  };
  const columns = [
    {
      name: 'eventStatus',
      width: 100,
      renderer: renderStatus,
    },
    {
      name: 'evalEventNumber',
      width: 130,
      renderer: ({ value, record }) => <a onClick={() => handleJump(record)}>{value}</a>,
    },
    {
      name: 'eventDesc',
      width: 130,
    },
    {
      name: 'companyName',
      width: 160,
    },
    {
      name: 'supplierCompanyName',
      width: 160,
    },
    {
      name: 'eventType',
      width: 130,
    },
    {
      name: 'eventDate',
      width: 160,
    },
    {
      name: 'creationDate',
      width: 160,
    },
    {
      name: 'createUserName',
      width: 130,
    },
  ];

  return (
    <div style={{ height: tableHeight.fixedHeight }}>
      {customizeTable(
        {
          code: 'SSLM.EVALUATION_EVENT_RECORD.LIST.LIST_TABLE',
        },
        <SearchBarTable
          cacheState
          dataSet={dataSet}
          columns={columns}
          style={{ maxHeight: tableMaxHeight.fixedHeight }}
          searchCode="SSLM.EVALUATION_EVENT_RECORD.LIST.SEARCH_BAR"
        />
      )}
    </div>
  );
};

export default List;
