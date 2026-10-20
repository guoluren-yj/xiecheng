import React, { useMemo } from 'react';
import { Lov } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { isFunction } from 'lodash';
import { Button } from 'components/Permission';
import { openApproveModal } from '_components/ApproveModal';
import ApproveRecordSimple from 'srm-front-boot/lib/components/ApproveRecordSimple';
import SearchBarTable from '@/routes/components/SearchBarTable';
import { colorRender } from '../hook';
import { revokeWorkFlow } from '@/routes/utils';
import styles from '../index.less';
// 设置sbdm国际化前缀 - common - model
const commonPrompt = 'sbdm.common.model.common';

const Index = ({ tableDs, lovDs, handleJumpDetail, type, remote }) => {
  const viewDetail = ({ record, dataSet }) => {
    const simpleApprovalHistoryData = dataSet.getState('simpleApprovalHistoryData') || {};
    return <ApproveRecordSimple data={simpleApprovalHistoryData[record.get('businessKey')]} />;
  };

  const wholeColumns = useMemo(() => {

    const { setListCuxColumns } = remote.props.process;
    const columns = [
      {
        name: 'budgetHeaderStatus',
        width: 150,
        renderer: ({ value, record }) =>
          colorRender(value, record.get('budgetHeaderStatusMeaning')),
      },
      {
        name: 'budgetNum',
        width: 150,
        renderer: ({ record, value }) => <a onClick={() => handleJumpDetail(record)}>{value}</a>,
      },
      {
        name: 'workFlowApproveProcess',
        width: 150,
        renderer: viewDetail,
        tooltip: 'none',
      },
      {
        name: 'budgetHeaderDesc',
        width: 150,
      },
      {
        name: 'periodNum',
        width: 150,
      },
      {
        name: 'validityDate',
        width: 250,
      },
      {
        name: 'responsibleName',
        width: 150,
      },
      {
        name: 'createdByName',
        width: 150,
      },
      {
        name: 'version',
        width: 150,
      },
      {
        name: 'creationDate',
        width: 150,
      },
    ];

    if (type === 'effective') {
      columns.splice(2, 0, {
        name: 'operation',
        width: 120,
        renderer: ({ record, dataSet }) => {
          const approvaFlags = dataSet.getState('approvaFlags');
          const operationFlags = dataSet.getState('operationFlags');
          const workFlowBusinessKey = record.get('businessKey');
          const approvaFlag = approvaFlags?.[workFlowBusinessKey];
          const operationFlag = operationFlags?.[workFlowBusinessKey];
          const { taskId, processInstanceId } = approvaFlag || {};
          return (
            <div>
              {record.get('budgetHeaderStatus') !== 'EDIT_APPROVING' && (
                <Button
                  type="c7n-pro"
                  color="primary"
                  funcType="link"
                  onClick={() => {
                    handleJumpDetail(record, 'edit');
                  }}
                  disabled={!lovDs.current?.get('budgetTemplateCode')}
                  permissionList={[
                    {
                      code: 'srm.budget.manager.budget.button.ajust',
                      type: 'button',
                      meaning: '调整',
                    },
                  ]}
                >
                  {intl.get(`${commonPrompt}.adjustment`).d('调整')}
                </Button>
              )}
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
                        tableDs.query();
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
                      tableDs.unSelectAll();
                      tableDs.clearCachedRecords();
                      tableDs.query();
                    }
                  }}
                >
                  {intl.get(`hzero.common.button.revokeApproval`).d('撤销审批')}
                </Button>
              )}
            </div>
          );
        },
      });
    }

    if (type === 'editing') {
      columns.splice(2, 0, {
        name: 'operation',
        width: 120,
        renderer: ({ dataSet, record }) => {
          const approvaFlags = dataSet.getState('approvaFlags');
          const operationFlags = dataSet.getState('operationFlags');
          const workFlowBusinessKey = record.get('businessKey');
          const approvaFlag = approvaFlags?.[workFlowBusinessKey];
          const operationFlag = operationFlags?.[workFlowBusinessKey];
          const { taskId, processInstanceId } = approvaFlag || {};
          return (
            <div>
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
                        tableDs.query();
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
                      tableDs.unSelectAll();
                      tableDs.clearCachedRecords();
                      tableDs.query();
                    }
                  }}
                >
                  {intl.get(`hzero.common.button.revokeApproval`).d('撤销审批')}
                </Button>
              )}
            </div>
          );
        },
      });
    }

    if (isFunction(setListCuxColumns)) {
      return setListCuxColumns({ columns, type });
    }
    return columns;
  });

  return (
    <div style={{ height: 'calc(100vh - 260px)' }}>
      <SearchBarTable
        style={{ maxHeight: 'calc(100% - 22px)' }}
        dataSet={tableDs}
        columns={wholeColumns}
        searchBarConfig={{
          fuzzyQueryCode: 'multiSelectBudgetNums',
          fuzzyQueryMultipleFlag: true,
          fuzzyQueryName: intl.get(`${commonPrompt}.budgetNum`).d('预算编码'),
          left: {
            render: () => (
              <Lov
                dataSet={lovDs}
                name="budgetTemplateLov"
                viewMode="popup"
                className={styles['sbdm-lov-search']}
                placeholder={intl.get(`${commonPrompt}.budgetTemplate`).d('预算模板')}
                searchFieldProps={{ multiple: false }}
              />
            ),
          },
          cacheFlag: true,
        }}
      />
    </div>
  );
};

export default Index;
