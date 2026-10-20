import React, { useMemo, useState } from 'react';
import intl from 'utils/intl';
import { Button } from 'components/Permission';
import { copyItemReq } from '@/services/materialCertificationPoolService.js';
import SearchBarTable from '_components/SearchBarTable';
import { getResponse } from 'utils/utils';
import ApproveRecordSimple from '_components/ApproveRecordSimple';
import { openApproveModal } from 'srm-front-boot/lib/components/ApproveModal';
import { colorRender } from './hook';
import StatusFlowList from '../components/StatusFlowList';
import NewStatusFlowList from '../components/NewStatusFlowList';
import Process from '../components/Process';
import RenderNode from '../components/RenderNode';
import ViewFilter from '../components/ViewFilter';
import ProcessStep from '../components/ProcessStep';

import { revokeWorkFlow } from '../util.js';
import MutlTextFieldSearch from '@/routes/components/MutlTextFieldSearch';

const Index = function Index({
  type,
  wholeListDs,
  linelListDs,
  customizeTable,
  updateType,
  handleJumpDetail,
}) {
  const [init, setInit] = useState(false);

  const [copyLoading, setCopyLoading] = useState(false);
  const handleCopy = async (record) => {
    setCopyLoading(true);
    const list = record.toData();
    const data = getResponse(await copyItemReq({ list }));
    setCopyLoading(false);
    if (data) {
      handleJumpDetail(data);
    }
  };

  const viewDetail = ({ record, dataSet }) => {
    const simpleApprovalHistoryData = dataSet.getState('simpleApprovalHistoryData') || {};
    return (
      <ApproveRecordSimple
        data={
          simpleApprovalHistoryData[
            record?.get('feeWorkflowBusinessKey') || record?.get('workflowBusinessKey')
          ]
        }
      />
    );
  };

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
        name: 'authReqStatusCode',
        width: 200,
        renderer: ({ value, text, record }) => (
          <StatusFlowList record={record}>{colorRender(value, text)}</StatusFlowList>
        ),
      },
      {
        name: 'reqHeaderNum',
        width: 150,
        renderer: ({ value, record }) => (
          <div className="row-agent-column">
            <a
              onClick={() => handleJumpDetail(record.toData(), 'all')}
              style={{ paddingRight: '8px' }}
            >
              {value}
            </a>
          </div>
        ),
      },
      {
        name: 'viewDetail',
        width: 150,
        renderer: viewDetail,
        tooltip: 'none',
      },
      {
        name: 'action',
        renderer: ({ record, dataSet }) => {
          const approvaFlags = dataSet.getState('approvaFlags');
          const operationFlags = dataSet.getState('operationFlags');
          const workFlowBusinessKey =
            record?.get('feeWorkflowBusinessKey') || record?.get('workflowBusinessKey');
          const approvaFlag = approvaFlags?.[workFlowBusinessKey];
          const operationFlag = operationFlags?.[workFlowBusinessKey];
          const { taskId, processInstanceId } = approvaFlag || {};
          return (
            <>
              <Button
                type="c7n-pro"
                funcType="link"
                onClick={() => handleCopy(record)}
                loading={copyLoading}
                wait={300}
                permissionList={[
                  {
                    code: `srm.smdm.material.certification.pool.button.copy`,
                    type: 'button',
                    meaning: '复制',
                  },
                ]}
              >
                {intl.get('hzero.common.button.copy').d('复制')}
              </Button>
              {approvaFlags && approvaFlag && (
                <Button
                  wait={500}
                  type="c7n-pro"
                  funcType="link"
                  color="primary"
                  onClick={() => {
                    openApproveModal({
                      modalProps: {
                        closable: true,
                      },
                      taskId,
                      processInstanceId,
                      onSuccess: () => {
                        dataSet.query();
                      },
                    });
                  }}
                >
                  {intl.get('hzero.common.button.approval').d('审批')}
                </Button>
              )}
              {operationFlags && operationFlag?.REVOKE && (
                <Button
                  wait={500}
                  type="c7n-pro"
                  funcType="link"
                  color="primary"
                  onClick={async () => {
                    const res = await revokeWorkFlow(workFlowBusinessKey);
                    if (res) {
                      dataSet.unSelectAll();
                      dataSet.clearCachedRecords();
                      dataSet.query();
                    }
                  }}
                >
                  {intl.get(`hzero.common.button.revokeApproval`).d('撤销审批')}
                </Button>
              )}
            </>
          );
        },
        width: 150,
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
      {
        name: 'createdByName',
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
        name: 'authReqStatusCode',
        width: 200,
        renderer: ({ record }) => (
          <NewStatusFlowList record={record} key={record.get('itemAuthReqHeaderId')} />
        ),
      },
      {
        name: 'reqHeaderNumAndLineNum',
        width: 150,
        renderer: ({ record }) => (
          <div className="row-agent-column">
            <a
              onClick={() => handleJumpDetail(record.toData(), 'all')}
              style={{ paddingRight: '8px' }}
            >
              {`${record.get('reqHeaderNum')}-${record.get('reqLineNum')}`}
            </a>
          </div>
        ),
      },
      {
        name: 'process',
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
        width: 150,
      },
      {
        name: 'formalItemName',
        width: 150,
      },
      {
        name: 'neededDate',
        width: 200,
      },
      {
        name: 'syncDate',
        width: 150,
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
      {
        name: 'createdByName',
        width: 150,
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
          if (!['reqHeaderNumQueryList'].includes(key)) {
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
        code: 'SMDM.ITEM_ALL.WHOLE_LIST',
      },
      <SearchBarTable
        style={{ maxHeight: 'calc(100% - 22px)' }}
        searchCode="SMDM.ITEM_ALL.WHOLE_SEARCH"
        dataSet={wholeListDs}
        columns={wholeColumns}
        data={[]}
        key="certifiedWhole"
        searchBarConfig={{
          right: {
            render: () => (
              <ViewFilter updateType={updateType} type={type} sourceType="allTabType" />
            ),
          },
          fieldProps: {
            supplierCompanyId: { lovPara: { enabledFlag: 1 } },
          },
          left: {
            render: () => (
              <MutlTextFieldSearch
                name="reqHeaderNumQueryList"
                dataSet={wholeListDs}
                placeholder={intl.get('smdm.common.modal.enteReqHeaderNum').d('请输入物料认证单号')}
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
      const dataObj = linelListDs.queryDataSet?.current?.toData() || {};
      if (dataObj) {
        for (const key in dataObj) {
          if (!['reqHeaderNumQueryList'].includes(key)) {
            // 排除掉自定义的查询条件
            if (!Object.prototype.hasOwnProperty.call(params, key)) {
              clearParams[key] = undefined;
            }
          }
        }
      }
      // eslint-disable-next-line no-unused-expressions
      linelListDs.queryDataSet.current
        ? linelListDs.queryDataSet.current.set({
            ...params,
            ...clearParams,
          })
        : linelListDs.queryDataSet.loadData([
            {
              ...params,
              ...clearParams,
            },
          ]);

      if (_back === -1 && !init) {
        linelListDs.query(linelListDs.currentPage);
      } else {
        linelListDs.query();
      }

      setInit(true);
    };

    const resetQueryDs = () => {
      // eslint-disable-next-line no-unused-expressions
      linelListDs.queryDataSet?.current.reset();
    };

    return customizeTable(
      {
        code: 'SMDM.ITEM_ALL.LINE_TABLE',
      },
      <SearchBarTable
        style={{ maxHeight: 'calc(100% - 22px)' }}
        searchCode="SMDM.ITEM_ALL.LINE_SEARCH"
        dataSet={linelListDs}
        columns={lineColumns}
        key="certifiedLine"
        data={[]}
        searchBarConfig={{
          right: {
            render: () => (
              <ViewFilter updateType={updateType} type={type} sourceType="allTabType" />
            ),
          },
          fieldProps: {
            supplierCompanyId: { lovPara: { enabledFlag: 1 } },
          },
          left: {
            render: () => (
              <MutlTextFieldSearch
                name="reqHeaderNumQueryList"
                dataSet={linelListDs}
                placeholder={intl
                  .get('smdm.common.modal.enteReqHeaderNumAndLineNum')
                  .d('请输入物料认证单号-行号')}
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
