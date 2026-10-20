import React, { Fragment, useMemo } from 'react';
import { flowRight } from 'lodash';
import { DataSet } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import { Header, Content } from 'components/Page';
import SearchBarTable from '_components/SearchBarTable';

import { agreementStatusRender } from './renderUtils';
import { protocolDs } from './subTableDs';

const organizationId = getCurrentOrganizationId();
const searchBarcode = 'SAGM.WORKBENCH.HISTORY_PRO.SEARCH_BAR';

function HistoryTable(props) {
  const dataSet = useMemo(
    () =>
      new DataSet(
        protocolDs({
          queryParams: { customizeUnitCode: searchBarcode },
          historyUrl: '/agreement-hiss',
        })
      )
  );

  const handleToDetail = (record) => {
    const { agreementId, versionNum } = record.get(['agreementId', 'versionNum']);
    props.history.push(
      `/sagm/sagm-protocol-workbench/detail/read?agreementId=${agreementId}&sourceType=history&versionNum=${versionNum}`
    );
  };

  const getColumns = () => {
    return [
      {
        name: 'agreementStatusMeaning',
        width: 100,
        renderer: agreementStatusRender,
      },
      {
        name: 'agreementNumber',
        width: 200,
        renderer: ({ text, record }) => <a onClick={() => handleToDetail(record)}>{text}</a>,
      },
      {
        name: 'agreementName',
        width: 200,
      },
      {
        name: 'versionNum',
        width: 80,
      },
      {
        name: 'creationDate',
        width: 150,
      },
      {
        name: 'companyName',
        width: 200,
      },
      {
        name: 'supplierCompanyName',
        width: 200,
      },
      {
        name: 'sourceFromMeaning',
        width: 100,
      },
    ];
  };

  const searchBarProps = {
    searchBarConfig: {
      fieldProps: {
        companyId: { lovPara: { tenantId: organizationId } },
        supplierCompanyId: { lovPara: { tenantId: organizationId } },
      },
    },
    cacheState: true,
    searchCode: searchBarcode,
  };
  return (
    <Fragment>
      <Header
        title={intl.get('small.common.view.mallProtocolWorkbench.hostory').d('商城协议历史版本')}
        backPath="/sagm/sagm-protocol-workbench/list"
      />
      <Content>
        <SearchBarTable dataSet={dataSet} columns={getColumns()} {...searchBarProps} />
      </Content>
    </Fragment>
  );
}

export default flowRight(
  formatterCollections({
    code: ['small.common'],
  })
)(HistoryTable);
