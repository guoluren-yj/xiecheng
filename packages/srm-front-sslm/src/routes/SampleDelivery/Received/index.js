/**
 * index.js - 我收到的送样申请
 * @date: 2020-04-24
 * @author: LXM <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2020, Hand
 */
import querystring from 'querystring';
import { routerRedux } from 'dva/router';
import { DataSet } from 'choerodon-ui/pro';
import React, { Fragment, useCallback, useMemo, useState } from 'react';
import { compose, isEmpty } from 'lodash';

import intl from 'utils/intl';
import remotes from 'utils/remote';
import withProps from 'utils/withProps';
import { Header, Content } from 'components/Page';
import SearchBarTable from '_components/SearchBarTable';
import formatterCollections from 'utils/intl/formatterCollections';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';

import MultipleTextField from '@/routes/components/MultipleTextField';
import { renderStatus, tableMaxHeight, tableHeight } from '@/routes/components/utils';
import { indexDS } from './stores/indexDS';

let searchBarRef; // 筛选器ref

const Index = ({ remote, dispatch, tableDs, customizeTable, location }) => {
  const isPub = useMemo(() => location.pathname.match('/pub/'), [location]);
  const [pageChacheFlag, setPageChacheFlag] = useState(true);

  // 跳转详情页
  const handleJumpDetail = useCallback(
    record => {
      const {
        data: { reqId, reqStatus, isPurchaseFlag },
      } = record;
      dispatch(
        routerRedux.push({
          pathname: `${isPub ? '/pub' : ''}/sslm/supplier-apply-query/detail/${reqId}/${reqStatus}`,
          search: querystring.stringify({
            isSupplier: isPurchaseFlag,
          }),
        })
      );
    },
    [isPub]
  );

  const handleQuery = ({ params }) => {
    if (tableDs.queryDataSet?.current) {
      const clearParams = {}; // 清理
      const dataObj = tableDs.queryDataSet.current.toData();
      if (dataObj) {
        for (const key in dataObj) {
          if (!['multiSelectReqNums'].includes(key)) {
            // 排除掉自定义的查询条件
            if (!Object.prototype.hasOwnProperty.call(params, key)) {
              clearParams[key] = undefined;
            }
          }
        }
      }
      // 处理多单号
      const reqList = params.multiSelectReqNums;
      clearParams.multiSelectReqNums = isEmpty(reqList) ? null : reqList.join(',');
      tableDs.queryDataSet.current.set({
        ...params,
        ...clearParams,
      });
      if (pageChacheFlag) {
        tableDs.query(tableDs.currentPage);
      } else {
        tableDs.query();
      }
    } else {
      searchBarRef.handleQuery(true);
    }
  };

  // 筛选器左侧渲染
  const renderLeftSearchBar = useCallback((_, queryDataSet) => {
    return (
      <MultipleTextField
        dataSet={queryDataSet}
        name="multiSelectReqNums"
        placeholder={intl.get('sslm.common.modal.sample.multiSelectReqNums').d('请输入申请单号')}
      />
    );
  }, []);

  // 清空、重置回调
  const clearValues = useCallback(() => {
    // eslint-disable-next-line no-unused-expressions
    tableDs.queryDataSet?.current.reset();
  }, []);

  const cols = [
    {
      name: 'reqStatusMeaning',
      width: 120,
      lock: true,
      renderer: renderStatus,
    },
    {
      name: 'reqNum',
      width: 140,
      lock: true,
      renderer: ({ value, record }) => <a onClick={() => handleJumpDetail(record)}>{value}</a>,
    },
    {
      name: 'isPurchaseFlag',
      width: 100,
    },
    {
      name: 'companyName',
      width: 200,
    },
    {
      name: 'ouName',
      width: 150,
    },
    {
      name: 'organizationName',
      width: 150,
    },
    {
      name: 'supplierName',
      width: 200,
    },
    {
      name: 'typeCodeMeaning',
      width: 120,
    },
    {
      name: 'reqUserName',
      width: 100,
    },
    {
      name: 'reqUserPhone',
      width: 140,
    },
    {
      name: 'recUserName',
      width: 100,
    },
    {
      name: 'recUserPhone',
      width: 140,
    },
    {
      name: 'sampleSendAddress',
      width: 150,
    },
    {
      name: 'urgencyDegreeMeaning',
      width: 100,
    },
    {
      name: 'sendUserName',
      width: 100,
    },
    {
      name: 'sendUserPhone',
      width: 140,
    },
    {
      name: 'sendTypeCodeMeaning',
      width: 100,
    },
    {
      name: 'trackingNumber',
      width: 160,
    },
    {
      name: 'expectedDeliveryDate',
      width: 160,
    },
    {
      name: 'releaseDate',
      width: 160,
    },
    {
      name: 'remark',
      width: 120,
    },
  ];
  const columns = remote.process('SSLM_SAMPLE_DELIVERY_RECEIVED_LIST_TABLE_COLUMNS', cols, {
    tableDs,
  });
  return (
    <Fragment>
      <Header title={intl.get('sslm.sample.view.title.receivedSample').d('送样申请查询（供）')} />
      <Content>
        <div style={{ height: tableHeight.fixedHeight }}>
          {customizeTable(
            {
              code: 'SSLM.SAMPLE_DELIVERY_RECEIVED.LIST',
              __force_record_to_update__: true,
            },
            <SearchBarTable
              cacheState
              dataSet={tableDs}
              columns={columns}
              searchBarRef={ref => {
                searchBarRef = ref;
              }}
              searchCode="SSLM.SAMPLE_DELIVERY_RECEIVED.SEARCH_BAR"
              style={{ maxHeight: tableMaxHeight.fixedHeight }}
              searchBarConfig={{
                editorProps: {
                  reqStatus: {
                    optionsFilter: record => record.get('value') !== 'CANCEL_SUBMIT',
                  },
                },
                left: {
                  render: renderLeftSearchBar,
                },
                onQuery: handleQuery,
                onReset: clearValues,
                onClear: clearValues,
                onFieldChange: () => {
                  setPageChacheFlag(false);
                },
              }}
            />
          )}
        </div>
      </Content>
    </Fragment>
  );
};

export default compose(
  formatterCollections({
    code: ['sslm.sample', 'sslm.common'],
  }),
  remotes({
    code: 'SSLM_SAMPLE_DELIVERY_RECEIVED_LIST',
    name: 'remote',
  }),
  withProps(
    () => {
      const tableDs = new DataSet(indexDS());
      return { tableDs };
    },
    { cacheState: true }
  ),
  withCustomize({
    unitCode: ['SSLM.SAMPLE_DELIVERY_RECEIVED.LIST'],
  })
)(Index);
