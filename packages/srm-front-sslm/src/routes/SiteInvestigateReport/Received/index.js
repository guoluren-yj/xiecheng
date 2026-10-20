/**
 * index -
 * @date: 2020/11/24
 * @author: zhanghao <hao.zhang07@hand-china.com>
 * @version: 0.0.1,
 * @copyright: Copyright 2019, Hand
 */
import querystring from 'querystring';
import React, { Fragment, memo, useMemo, useCallback } from 'react';
import { DataSet, Table } from 'choerodon-ui/pro';

import { routerRedux } from 'dva/router';
import withProps from 'utils/withProps';
import intl from 'utils/intl';
import { Header, Content } from 'components/Page';
import remotes from 'utils/remote';
import formatterCollections from 'utils/intl/formatterCollections';

import indexDS from './store/indexDS';

const Index = memo(({ dataSet, dispatch, remote }) => {
  const jumpDetail = useCallback(record => {
    const { evalHeaderId, evalType, supplierTenantId } = record.get([
      'evalHeaderId',
      'evalType',
      'supplierTenantId',
    ]);
    dispatch(
      routerRedux.push({
        pathname: `/sslm/site-investigate-report/received/detail/${evalHeaderId}/${evalType}`,
        search: querystring.stringify({ purchaserId: supplierTenantId }),
      })
    );
  }, []);

  const columns = useMemo(() => [
    {
      name: 'evalStatusMeaning',
    },
    {
      name: 'evalNum',
      renderer: ({ record, text }) => <a onClick={() => jumpDetail(record)}>{text}</a>,
    },
    {
      name: 'evalDescription',
    },
    {
      name: 'companyName',
    },
    {
      name: 'supplierName',
    },
    {
      name: 'evalTplName',
    },
    {
      name: 'creationDate',
    },
    {
      name: 'realName',
    },
  ]);
  const remoteColumns = remote.process('SSLM_SUPPLIER_SITE_REPORT_LIST_COLUMNS', columns, {
    dataSet,
    dispatch,
  });
  return (
    <Fragment>
      <Header
        title={intl.get('sslm.siteInvestigateReport.view.received.title').d('我收到的现场考察报告')}
      />
      <Content>
        <Table dataSet={dataSet} columns={remoteColumns} queryFieldsLimit={3} />
      </Content>
    </Fragment>
  );
});

export default remotes({
  code: 'SSLM_SUPPLIER_SITE_REPORT_LIST',
  name: 'remote',
})(
  formatterCollections({ code: ['sslm.siteInvestigateReport'] })(
    withProps(
      ({ remote }) => {
        const dsProps = indexDS();
        const remoteDsProps = remote.process('SSLM_SUPPLIER_SITE_REPORT_LIST_DS_PROPS', dsProps);
        const dataSet = new DataSet(remoteDsProps);
        return { dataSet };
      },
      { cacheState: true }
    )(Index)
  )
);
