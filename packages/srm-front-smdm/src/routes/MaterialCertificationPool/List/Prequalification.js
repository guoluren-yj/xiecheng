import React, { useMemo, useState } from 'react';
import intl from 'utils/intl';
import SearchBarTable from '_components/SearchBarTable';
import { colorRender } from './hook';
import StatusFlowList from '../components/StatusFlowList';
// import NewStatusFlowList from '../components/NewStatusFlowList';
import Process from '../components/Process';
import RenderNode from '../components/RenderNode';
import ProcessStep from '../components/ProcessStep';

import MutlTextFieldSearch from '@/routes/components/MutlTextFieldSearch';

const Index = function Index({ wholeListDs, customizeTable, handleJumpDetail }) {
  const [init, setInit] = useState(false);

  const wholeColumns = useMemo(() => {
    return [
      {
        name: 'nodeCodeMeaning',
        width: 150,
        tooltip: 'none',
        renderer: ({ record }) => (
          <RenderNode record={record} key={record.get('itemAuthReqHeaderId')} />
        ),
      },
      {
        name: 'authFeeStatusCode',
        width: 200,
        renderer: ({ value, text, record }) => (
          <StatusFlowList record={record}>{colorRender(value, text)}</StatusFlowList>
        ),
      },
      {
        name: 'feeHeaderNum',
        width: 150,
        renderer: ({ value, record }) => (
          <div className="row-agent-column">
            <a
              onClick={() => handleJumpDetail(record.toData(), 'prequalification')}
              style={{ paddingRight: '8px' }}
            >
              {value}
            </a>
          </div>
        ),
      },
      {
        name: 'process',
        tooltip: 'none',
        renderer: ({ record }) => (
          <Process record={record} key={record.get('itemAuthReqHeaderId')} />
        ),
        width: 350,
      },
      {
        name: 'processStep',
        // tooltip: 'none',
        renderer: ({ record }) => (
          <ProcessStep record={record} key={record.get('itemAuthReqHeaderId')} />
        ),
        width: 350,
      },
      {
        name: 'categoryName',
        width: 200,
      },
      {
        name: 'companyName',
        width: 200,
      },
      {
        name: 'supplierCode',
        width: 150,
        renderer: ({ record, value }) => value || record.get('supplierCompanyCode'),
      },
      {
        name: 'supplierName',
        width: 200,
        renderer: ({ record }) => record.get('displaySupplierName'),
      },
      {
        name: 'sourcePlatform',
        width: 150,
      },
      {
        name: 'createdByName',
        width: 150,
      },
    ];
  }, [handleJumpDetail]);

  const handleQuery = ({ params = {} }) => {
    const clearParams = {}; // 清理
    const { state: { _back } = {} } = location;
    // eslint-disable-next-line no-unused-expressions
    const dataObj = wholeListDs.queryDataSet?.current?.toData() || {};
    if (dataObj) {
      for (const key in dataObj) {
        if (!['feeHeaderNumQueryList'].includes(key)) {
          // 排除掉自定义的查询条件
          if (!Object.prototype.hasOwnProperty.call(params, key)) {
            clearParams[key] = undefined;
          }
        }
      }
    }
    // eslint-disable-next-line no-unused-expressions
    wholeListDs.queryDataSet.current
      ? wholeListDs.queryDataSet.current.set({
          ...params,
          ...clearParams,
        })
      : wholeListDs.queryDataSet.loadData([
          {
            ...params,
            ...clearParams,
          },
        ]);

    if (_back === -1 && !init) {
      wholeListDs.query(wholeListDs.currentPage);
    } else {
      wholeListDs.query();
    }

    setInit(true);
  };

  const resetQueryDs = () => {
    // eslint-disable-next-line no-unused-expressions
    wholeListDs.queryDataSet?.current.reset();
  };

  const renderWholeTable = () => {
    return customizeTable(
      {
        code: 'SMDM.ITEM_PREQUALIFICATION.TABLE',
      },
      <SearchBarTable
        style={{ maxHeight: 'calc(100% - 22px)' }}
        searchCode="SMDM.ITEM_PREQUALIFICATION.FILTER"
        dataSet={wholeListDs}
        columns={wholeColumns}
        data={[]}
        key="prequalification"
        searchBarConfig={{
          editorProps: {
            authFeeStatusCode: {
              optionsFilter: (options) => ['PREAPPROVAL'].includes(options.get('value')),
            },
          },
          fieldProps: {
            supplierCompanyId: { lovPara: { enabledFlag: 1 } },
          },
          left: {
            render: () => (
              <MutlTextFieldSearch
                name="feeHeaderNumQueryList"
                dataSet={wholeListDs}
                placeholder={intl.get('smdm.common.modal.enteFeeHeaderNum').d('请输入物料反馈单号')}
              />
            ),
          },
          onClear: resetQueryDs,
          onReset: resetQueryDs,
          onQuery: handleQuery,
        }}
        queryFieldsLimit={3}
        cacheState
      />
    );
  };

  return <div style={{ height: 'calc(100vh - 252px)' }}>{renderWholeTable()}</div>;
};

export default Index;
