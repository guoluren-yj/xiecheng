import { routerRedux } from 'dva/router';
import React, { useCallback } from 'react'; // useEffect
import { yesOrNoRender } from 'utils/renderer';
import intl from 'utils/intl';
import { Button } from 'choerodon-ui/pro';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import { isFunction } from 'lodash';
import { openApproveModal } from '_components/ApproveModal';
import ApproveRecordSimple from '_components/ApproveRecordSimple';
import MutlTextFieldSearch from '@/routes/components/MutlTextFieldSearch';
import { UrgentFlag } from '../../components/UrgentFlag';
import { colorRender, aiApproveStatusRender } from './../util';
import '../index.less';
import { revokeWorkFlow } from '@/routes/utils';
import styles from './index.less';

const Index = ({ dispatch, lineDs, customizeTable, location, handleLinkOtherUrl, remote }) => {
  const [init, setInit] = React.useState(false);
  // 跳转详情
  const handleJumpDetail = useCallback((record) => {
    const pathCux = isFunction(handleLinkOtherUrl)
      ? handleLinkOtherUrl({ prHeaderId: record.get('prHeaderId'), type: 'query', location }) || {}
      : {};
    if (pathCux && pathCux?.pathname) {
      dispatch(
        routerRedux.push({
          pathname: pathCux?.pathname,
          search: pathCux?.search,
        })
      );
    } else {
      dispatch(
        routerRedux.push({
          pathname: `/sprm/purchase-platform/noerp-detail/${record.get('prHeaderId')}`,
          state: {
            prSourcePlatformCode: record.get('prSourcePlatform'),
            prSourcePlatformMeaning: record.get('prSourcePlatformMeaning'),
          },
        })
      );
    }
  }, []);

  const handleRevoke = async ({ record }) => {
    const res = await revokeWorkFlow(record.get('workflowBusinessKey'));
    if (res) {
      lineDs.query();
    }
  };

  const handleWorkFlowApprove = async ({ record }) => {
    const approvaFlags = lineDs.getState('approvaFlags');
    const workflowBusinessKey = record.get('workflowBusinessKey');
    const approvaFlag = approvaFlags?.[workflowBusinessKey];
    const { taskId, processInstanceId } = approvaFlag || {};
    openApproveModal({
      modalProps: {
        closable: true,
      },
      taskId,
      processInstanceId,
      onSuccess: () => {
        lineDs.query();
      },
    });
  };

  // 建议操作
  const renderAction = ({ record }) => {
    const { workflowBusinessKey } = record.get(['workflowBusinessKey']);
    const approvaFlags = lineDs?.getState('approvaFlags');
    const operationFlags = lineDs?.getState('operationFlags');
    const workflowApprovalFlag =
      workflowBusinessKey && approvaFlags ? approvaFlags[workflowBusinessKey] : false;
    const workflowRevokeFlag =
      workflowBusinessKey && operationFlags ? operationFlags[workflowBusinessKey]?.REVOKE : false;
    // 操作按钮
    return (
      workflowBusinessKey &&
      (workflowApprovalFlag || workflowRevokeFlag) && (
        <div>
          {workflowBusinessKey && workflowApprovalFlag && (
            <Button
              funcType="link"
              type="c7n-pro"
              onClick={() => handleWorkFlowApprove({ record })}
              className={styles['sprm-col-btn']}
            >
              {intl.get('hzero.common.button.approval').d('审批')}
            </Button>
          )}
          {workflowBusinessKey && workflowRevokeFlag && (
            <Button
              funcType="link"
              type="c7n-pro"
              onClick={() => handleRevoke({ record })}
              className={styles['sprm-col-btn']}
            >
              {intl.get(`hzero.common.button.revokeApproval`).d('撤销审批')}
            </Button>
          )}
        </div>
      )
    );
  };

  const viewDetail = ({ record, dataSet }) => {
    const simpleApprovalHistoryData = dataSet.getState('simpleApprovalHistoryData') || {};
    return (
      <ApproveRecordSimple data={simpleApprovalHistoryData[record.get('workflowBusinessKey')]} />
    );
  };

  const lineColumns = remote.process(
    'SPRM_PURCHASE_PLAFORM_PROCESS_COLUMNS',
    [
      {
        name: 'rpSourceFlag',
        width: 120,
        renderer: ({ value }) => yesOrNoRender(Number(value)),
      },
      {
        name: 'prStatusCode',
        width: 150,
        renderer: ({ value, record }) => colorRender(value, record.get('prStatusMeaning')),
      },
      {
        name: 'aiApproveStatus',
        width: 130,
        title: intl.get('sprm.common.button.aiCheck').d('智能审核'),
        renderer: aiApproveStatusRender,
      },
      {
        name: 'operatorRecord',
        width: 150,
        overflow: true,
        renderer: ({ record }) => renderAction({ record }),
      },
      {
        name: 'displayPrNum',
        width: 180,
        renderer: ({ value, record }) => (
          <div>
            <a onClick={() => handleJumpDetail(record)}>{value}</a>
            {record.get('urgentFlag') === 1 && <UrgentFlag />}
          </div>
        ),
      },
      {
        name: 'workFlowApproveProcess',
        width: 150,
        renderer: viewDetail,
        tooltip: 'none',
      },
      {
        name: 'title',
        width: 150,
        tooltip: 'overflow',
      },
      {
        name: 'prTypeName',
        width: 150,
        tooltip: 'overflow',
      },
      {
        name: 'prRequestedName',
        width: 120,
        renderer: ({ value, record }) =>
          record.get('prRequestedNum') ? `${record.get('prRequestedNum')}-${value}` : value,
      },
      {
        name: 'requestDate',
        width: 180,
      },
      {
        name: 'createByName',
        width: 120,
        tooltip: 'overflow',
      },
      {
        name: 'creationDate',
        width: 140,
      },
      {
        name: 'unitName',
        width: 100,
      },
      {
        name: 'companyName',
        width: 150,
        tooltip: 'overflow',
      },
      {
        name: 'ouName',
        width: 150,
        tooltip: 'overflow',
      },
      {
        name: 'purchaseOrgName',
        width: 150,
        tooltip: 'overflow',
      },
      {
        name: 'purchaseAgentName',
        width: 120,
        tooltip: 'overflow',
      },
      {
        name: 'originalCurrency',
        width: 100,
      },
      {
        name: 'amount',
        width: 150,
        renderer: ({ text, record }) =>
          record.get('headerPriceHiddenFlag') === 1 ? record.get('amountMeaning') : text,
      },
      {
        name: 'localCurrency',
        width: 100,
      },
      {
        name: 'localCurrencyNoTaxSum',
        width: 100,
      },
      {
        name: 'prSourcePlatformMeaning',
        width: 120,
      },
      {
        name: 'remark',
        width: 120,
        tooltip: 'overflow',
      },
      {
        name: 'prNum',
        width: 120,
      },
      {
        name: 'lotNum',
        width: 120,
      },
      {
        name: 'urgentFlag',
        width: 120,
        renderer: ({ value }) => yesOrNoRender(Number(value)),
      },
      {
        name: 'urgentDate',
        width: 120,
      },
      {
        name: 'changedFlag',
        renderer: ({ value }) => yesOrNoRender(Number(value)),
      },
      {
        name: 'closeStatusMeaning',
        width: 120,
        renderer: ({ value, record }) => colorRender(record.get('closeStatusCode'), value),
      },
      {
        name: 'cancelStatusMeaning',
        width: 120,
        renderer: ({ value, record }) => colorRender(record.get('cancelStatusCode'), value),
      },
    ],
    { currentType: 'underApproval' }
  );

  const cuxFieldProps = remote.process(
    'SPRM_PURCHASE_PLAFORM_PROCESS_FIELDPROPS',
    {},
    { currentType: 'underApproval' }
  );

  const handleQuery = ({ params = {} }) => {
    const clearParams = {}; // 清理
    const { _back } = location?.state || {};
    // eslint-disable-next-line no-unused-expressions
    const dataObj = lineDs.queryDataSet?.current?.toData() || {};
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
    lineDs.queryDataSet.current
      ? lineDs.queryDataSet.current.set({
          ...params,
          ...clearParams,
        })
      : lineDs.queryDataSet.loadData([
          {
            ...params,
            ...clearParams,
          },
        ]);
    if (_back === -1 && !init) {
      lineDs.query(lineDs.currentPage);
    } else {
      lineDs.query();
    }
    setInit(true);
  };

  const resetQueryDs = () => {
    // eslint-disable-next-line no-unused-expressions
    lineDs.queryDataSet?.current.reset();
  };

  return (
    <div style={{ height: 'calc(100vh - 254px)' }}>
      {customizeTable(
        {
          code: 'SPRM.PURCHASE_PLAFORM_UNDERAPPROVAL.LIST',
        },
        <SearchBarTable
          style={{ maxHeight: 'calc(100% - 22px)' }}
          searchCode="SPRM.PURCHASE_PLAFORM_UNDERAPPROVAL.SEARVHBAR"
          dataSet={lineDs}
          columns={lineColumns}
          data={[]}
          cacheState
          queryFieldsLimit={3}
          virtual
          virtualCell
          virtualSpin
          pagination={{
            pageSizeOptions: ['10', '20', '50', '100', '200'],
          }}
          searchBarConfig={{
            editorProps: {
              prStatusCode: {
                optionsFilter: (options) =>
                  ['SUBMITTED', 'WORKFLOW_APPROVAL'].includes(options.get('value')),
              },
            },
            fieldProps: cuxFieldProps,
            left: {
              render: () => (
                <MutlTextFieldSearch
                  name="multiSelectHeaderNums"
                  dataSet={lineDs}
                  placeholder={intl.get('sprm.common.modal.enterPrNum').d('请输入采购申请单号')}
                />
              ),
            },
            onClear: resetQueryDs,
            onReset: resetQueryDs,
            onQuery: handleQuery,
          }}
        />
      )}
    </div>
  );
};

export default Index;
