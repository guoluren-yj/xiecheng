import React, { useMemo, useState } from 'react';
import intl from 'utils/intl';
import SearchBarTable from '_components/SearchBarTable';
import { colorRender } from './hook';
import RenderNode from '../components/RenderNode';
import ViewFilter from '../components/ViewFilter';

import MutlTextFieldSearch from '@/routes/components/MutlTextFieldSearch';

const Index = function Index({
  type,
  wholeListDs,
  lineListDs,
  customizeTable,
  updateType,
  handleJumpDetail,
}) {
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
        renderer: ({ value, text }) => colorRender(value, text),
      },
      {
        name: 'feeHeaderNum',
        width: 150,
        renderer: ({ value, record }) => (
          <div className="row-agent-column">
            <a onClick={() => handleJumpDetail(record)} style={{ paddingRight: '8px' }}>
              {value}
            </a>
          </div>
        ),
      },
      // {
      //   name: 'authenticateNum',
      //   width: 200,
      // },
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
      // {
      //   name: 'sourceDocumentsNumAndLineNum',
      //   width: 250,
      //   renderer: ({ record }) => `${record.get('sourceDocumentsNum')||''}-${record.get("sourceDocumentsLineNum")||''}`,
      // },
      // {
      //   name: 'executorName',
      //   width: 250,
      // },
      {
        name: 'exportExternalStatusCode',
        width: 150,
        renderer: ({ value, text, record }) =>
          colorRender(value, record?.get('exportExternalStatusCodeMeaning') || text, false),
      },
      {
        name: 'exportExternalErrorReason',
        width: 150,
      },
    ];
  }, [handleJumpDetail]);

  const lineColumns = useMemo(() => {
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
        renderer: ({ value, text }) => colorRender(value, text),
      },
      {
        name: 'feeHeaderNumAndLineNum',
        width: 150,
        renderer: ({ record }) => (
          <div className="row-agent-column">
            <a onClick={() => handleJumpDetail(record)} style={{ paddingRight: '8px' }}>
              {`${record.get('feeHeaderNum')}-${record.get('feeLineNum')}`}
            </a>
          </div>
        ),
      },
      {
        name: 'authenticateNum',
        width: 200,
      },
      {
        name: 'categoryName',
        width: 200,
      },
      {
        name: 'itemCode',
        width: 200,
      },
      {
        name: 'itemName',
        width: 150,
      },
      {
        name: 'formalItemCode',
        width: 200,
      },
      {
        name: 'formalItemName',
        width: 150,
      },
      {
        name: 'feedbackDate',
        width: 200,
      },
      {
        name: 'neededDate',
        width: 200,
      },
      {
        name: 'sourceDocumentsNumAndLineNum',
        width: 250,
        renderer: ({ record }) =>
          `${record.get('sourceDocumentsNum') || ''}-${record.get('sourceDocumentsLineNum') || ''}`,
      },
      {
        name: 'poNum',
        width: 150,
      },
      {
        name: 'sourceNum',
        width: 200,
      },
      {
        name: 'sourcePrice',
        width: 200,
      },
      {
        name: 'executorName',
        width: 250,
      },
    ];
  }, [handleJumpDetail]);

  const renderWholeTable = () => {
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

    return customizeTable(
      {
        code: 'SMDM_ITEM_FEEDBACK_ALL.LIST',
      },
      <SearchBarTable
        style={{ maxHeight: 'calc(100% - 22px)' }}
        searchCode="SMDM_ITEM_FEEDBACK_ALL.SEARCH"
        dataSet={wholeListDs}
        columns={wholeColumns}
        data={[]}
        key="wholeAll"
        searchBarConfig={{
          right: {
            render: () => <ViewFilter updateType={updateType} type={type} sourceType="allType" />,
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

  const renderLineTable = () => {
    const handleQuery = ({ params = {} }) => {
      const clearParams = {}; // 清理
      const { state: { _back } = {} } = location;
      // eslint-disable-next-line no-unused-expressions
      const dataObj = lineListDs.queryDataSet?.current?.toData() || {};
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
      lineListDs.queryDataSet.current
        ? lineListDs.queryDataSet.current.set({
            ...params,
            ...clearParams,
          })
        : lineListDs.queryDataSet.loadData([
            {
              ...params,
              ...clearParams,
            },
          ]);

      if (_back === -1 && !init) {
        lineListDs.query(lineListDs.currentPage);
      } else {
        lineListDs.query();
      }

      setInit(true);
    };

    const resetQueryDs = () => {
      // eslint-disable-next-line no-unused-expressions
      lineListDs.queryDataSet?.current.reset();
    };

    return customizeTable(
      {
        code: 'SMDM_ITEM_FEEDBACK_ALL.LINE_LIST',
      },
      <SearchBarTable
        style={{ maxHeight: 'calc(100% - 22px)' }}
        searchCode="SMDM_ITEM_FEEDBACK_ALL.LINE_SEARCH"
        dataSet={lineListDs}
        columns={lineColumns}
        data={[]}
        key="lineAll"
        searchBarConfig={{
          right: {
            render: () => <ViewFilter updateType={updateType} type={type} sourceType="allType" />,
          },
          fieldProps: {
            supplierCompanyId: { lovPara: { enabledFlag: 1 } },
          },
          left: {
            render: () => (
              <MutlTextFieldSearch
                name="feeHeaderNumQueryList"
                dataSet={lineListDs}
                placeholder={intl
                  .get('smdm.common.modal.enteFeeHeaderNumAndLineNum')
                  .d('请输入物料反馈单号-行号')}
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

  return (
    <div style={{ height: 'calc(100vh - 252px)' }}>
      {type === 'whole' ? renderWholeTable() : renderLineTable()}
    </div>
  );
};

export default Index;
