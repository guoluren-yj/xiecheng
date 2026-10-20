import React, { Fragment, memo } from 'react';
import intl from 'utils/intl';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { Icon, Tooltip } from 'choerodon-ui';

import { getCurrentOrganizationId } from 'utils/utils';

import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import MutlTextFieldSearch from '@/routes/components/MutlTextFieldSearch';
import { lineStatusColorRender } from '../util';

const organizationId = getCurrentOrganizationId();

const Index = ({ customizeTable, lineDs, handleJumpDetail, queryCount, location }) => {
  const [init, setInit] = React.useState(false);
  const lineColumns = [
    {
      name: 'rpLineStatus',
      width: 100,
      renderer: ({ value, record }) =>
        lineStatusColorRender(value, record.get('rpLineStatusMeaning')),
    },
    {
      name: 'rpNumAndlineNum',
      width: 180,
      renderer: ({ record }) => {
        const val =
          (record && record?.get('disPlayRpNum')) || record?.get('displayLineNum')
            ? `${record?.get('disPlayRpNum') ?? '-'}-${record?.get('displayLineNum') ?? '-'}`
            : null;

        return (
          <div className="row-agent-column">
            <a onClick={() => handleJumpDetail(record)} style={{ paddingRight: '8px' }}>
              {val}
            </a>

            {record.get('urgentFlag') === 1 ? (
              <Tooltip title={intl.get(`srpm.common.model.common.urgent`).d('需求计划加急')}>
                <Icon
                  type="priority"
                  style={{ color: 'red', fontSize: '14px', paddingBottom: '5px' }}
                />
              </Tooltip>
            ) : null}
          </div>
        );
      },
    },
    {
      name: 'companyName',
      width: 200,
      tooltip: 'overflow',
    },
    {
      name: 'ouName',
      width: 200,
      tooltip: 'overflow',
    },
    {
      name: 'purchaseOrgName',
      width: 200,
      tooltip: 'overflow',
    },
    {
      name: 'unitName',
      width: 150,
      tooltip: 'overflow',
    },
    {
      name: 'purchaseAgentName',
      width: 180,
      tooltip: 'overflow',
    },
    {
      name: 'createdByName',
      width: 140,
    },
    {
      name: 'creationDate',
      width: 150,
    },
    {
      name: 'invOrganizationName',
      width: 200,
    },
    {
      name: 'item',
      width: 180,
      renderer: ({ record }) => {
        // return record && record?.get('itemCode') && record?.get('itemName')
        //   ? `${record?.get('itemCode')} | ${record?.get('itemName')}`
        //   : (record?.get('itemCode') || record?.get('itemName')) ?? null;
        return (record && record?.get('itemCode')) || record?.get('itemName')
          ? `${record?.get('itemCode') ?? '-'} | ${record?.get('itemName') ?? '-'}`
          : null;
      },
    },
    {
      name: 'categoryName',
      width: 180,
    },
    {
      name: 'uomName',
      width: 150,
    },
    {
      name: 'neededDate',
      width: 120,
    },
    {
      name: 'quantity',
      width: 120,
    },
    {
      name: 'taxIncludedUnitPrice',
      width: 120,
    },
    {
      name: 'taxIncludedLineAmount',
      width: 120,
    },
    {
      name: 'remark',
      width: 180,
    },
  ];

  const handleQuery = ({ params = {} }) => {
    const { state: { _back } = {} } = location;
    const clearParams = {}; // 清理
    // eslint-disable-next-line no-unused-expressions
    const dataObj = lineDs.queryDataSet?.current?.toData();
    if (dataObj) {
      for (const key in dataObj) {
        if (!['multiSelectHeaderNums', 'multiSelectHeaderAndLineNums'].includes(key)) {
          // 排除掉自定义的查询条件
          if (!Object.prototype.hasOwnProperty.call(params, key)) {
            clearParams[key] = undefined;
          }
        }
      }
    }
    // eslint-disable-next-line no-unused-expressions
    lineDs.queryDataSet?.current?.set({
      ...params,
      ...clearParams,
    });
    lineDs.setQueryParameter('advancedData', params);
    if (_back === -1 && !init) {
      lineDs.query(lineDs.currentPage);
    } else {
      lineDs.query();
    }
    setInit(true);
    queryCount();
  };

  const resetQueryDs = () => {
    // eslint-disable-next-line no-unused-expressions
    lineDs.queryDataSet?.current?.reset();
  };
  return (
    <Fragment>
      <div style={{ height: 'calc(100vh - 253px)' }}>
        {customizeTable(
          {
            code: 'SRPM.RP_PLATFORM.DETAIL_HOLD.LIST',
          },
          <SearchBarTable
            style={{ maxHeight: `calc(100% - 22px)` }}
            searchCode="SRPM.RP_PLATFORM.DETAIL_HOLD.SEARCHBAR"
            dataSet={lineDs}
            columns={lineColumns}
            data={[]}
            cacheState
            searchBarConfig={{
              fieldProps: {
                companyId: { lovPara: { tenantId: organizationId } },
                ouId: { lovPara: { tenantId: organizationId } },
              },
              left: {
                render: () => (
                  <MutlTextFieldSearch
                    name="multiSelectHeaderAndLineNums"
                    callbackFuc={queryCount}
                    dataSet={lineDs}
                    placeholder={intl
                      .get('srpm.common.modal.enterPrNumAndLineNumSearch')
                      .d('请输入需求计划单号查询')}
                  />
                ),
              },
              onQuery: handleQuery,
              onClear: resetQueryDs,
              onReset: resetQueryDs,
            }}
          />
        )}
      </div>
    </Fragment>
  );
};

export default memo(
  withCustomize({
    unitCode: ['SRPM.RP_PLATFORM.DETAIL_HOLD.LIST'],
  })(Index)
);
