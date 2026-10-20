import React, { Fragment, memo } from 'react';
import intl from 'utils/intl';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { Icon, Tooltip } from 'choerodon-ui';
import { getCurrentOrganizationId } from 'utils/utils';

import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import MutlTextFieldSearch from '@/routes/components/MutlTextFieldSearch';
import { colorRender } from '../util';

const organizationId = getCurrentOrganizationId();
const Index = ({ customizeTable, lineDs, handleJumpDetail, queryCount, location }) => {
  const [init, setInit] = React.useState(false);
  const lineColumns = [
    {
      name: 'rpStatus',
      width: 120,
      renderer: ({ value, record }) => colorRender(value, record.get('rpStatusMeaning')),
    },
    {
      name: 'displayRpNum',
      width: 180,
      renderer: ({ value, record }) => (
        <div className="row-agent-column">
          <a onClick={() => handleJumpDetail(record)} style={{ paddingRight: '8px' }}>
            {value}
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
      ),
    },
    // {
    //   name: 'templateCode',
    //   width: 150,
    //   tooltip: 'overflow',
    // },
    // {
    //   name: 'templateName',
    //   width: 150,
    //   tooltip: 'overflow',
    // },
    // {
    //   name: 'templateType',
    //   width: 150,
    //   tooltip: 'overflow',
    // },
    {
      name: 'companyName',
      width: 250,
      tooltip: 'overflow',
    },
    {
      name: 'ouName',
      width: 250,
      tooltip: 'overflow',
    },
    {
      name: 'purchaseOrgName',
      width: 250,
      tooltip: 'overflow',
    },
    {
      name: 'originalCurrency',
      width: 100,
      tooltip: 'overflow',
    },
    {
      name: 'purchaseAgentName',
      width: 180,
      tooltip: 'overflow',
    },
    {
      name: 'createdByName',
      width: 100,
    },
    {
      name: 'creationDate',
      width: 150,
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
            code: 'SRPM.RP_PLATFORM.BEFORESUBMIT.LIST',
          },
          <SearchBarTable
            style={{ maxHeight: `calc(100% - 22px)` }}
            searchCode="SRPM.RP_PLATFORM.BEFORESUBMIT_SEARCHBAR"
            dataSet={lineDs}
            columns={lineColumns}
            data={[]}
            cacheState
            searchBarConfig={{
              editorProps: {
                rpStatus: {
                  optionsFilter: (options) => ['NEW', 'REJECTED'].includes(options.get('value')),
                },
              },
              fieldProps: {
                companyId: { lovPara: { tenantId: organizationId } },
                ouId: { lovPara: { tenantId: organizationId } },
              },
              left: {
                render: () => (
                  <MutlTextFieldSearch
                    name="multiSelectHeaderNums"
                    callbackFuc={queryCount}
                    dataSet={lineDs}
                    placeholder={intl
                      .get('srpm.common.modal.enterPrNumSearch')
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
    unitCode: ['SRPM.RP_PLATFORM.BEFORESUBMIT.LIST'],
  })(Index)
);
