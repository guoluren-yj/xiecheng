import React from 'react';
import intl from 'utils/intl';
// import { Tag } from 'choerodon-ui';
import { Button } from 'components/Permission';
import { openApproveModal } from '_components/ApproveModal';
import ApproveRecordSimple from 'srm-front-boot/lib/components/ApproveRecordSimple';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';
import { vtBalanceSplit, rpBalanceSplit } from '@/services/rpExecuteProgramService';
import { colorRender } from '../RequisitionPlan/util';
import { revokeWorkFlow } from '@/routes/utils';
// import styles from './index.less';

const commonPrompt = 'srpm.common.model.common';

const viewDetail = ({ record, dataSet }) => {
  const simpleApprovalHistoryData = dataSet.getState('simpleApprovalHistoryData') || {};
  return (
    <ApproveRecordSimple data={simpleApprovalHistoryData[record.get('workflowBusinessKey')]} />
  );
};

function isEditor(record, name) {
  const editableList = record?.get('editableList') ?? [];
  if (editableList.indexOf(name) === -1) {
    return false;
  }
  return true;
}

function isEditorSplit(record, name, type) {
  if (type === 'pending' && record.get('submittedFlag') === 1) {
    return false;
  }
  if (type === 'ready' && record.get('releasedFlag') !== 0) {
    return false;
  }

  if (record.get('beSplitFlag') || record.get('parentVtLineId')) {
    return false;
  }
  const editableList = record?.get('editableList') ?? [];
  if (editableList.indexOf(name) === -1) {
    return false;
  }
  return true;
}

const split = ({ dataSet, record, containerId, type }) => {
  return new Promise(resolve => {
    const request = type === 'pending' ? vtBalanceSplit : rpBalanceSplit;
    request({
      selectedData: [record.toData()],
      containerId,
      splitAgainFlag: 1,
    })
      .then(res => {
        if (getResponse(res)) {
          notification.success();
          if (type === 'pending') {
            dataSet.setQueryParameter('vtLineId', res.beSplitVtLineId);
          } else {
            dataSet.setQueryParameter('blLineId', res.beSplitBlLineId);
          }
          dataSet.query();
        }
      })
      .finally(() => {
        resolve();
      });
  });
};

const getTodoColumns = () => {
  return [
    {
      name: 'prNumAndlineNum',
      width: 180,
      renderer: ({ record }) => {
        return (record && record.get('rpNum')) || record.get('displayLineNum')
          ? `${record.get('rpNum') ?? '-'}-${record.get('displayLineNum') ?? '-'}`
          : null;
      },
    },
    // {
    //   name: 'containerName',
    // },
    {
      name: 'invOrganizationName',
      width: 180,
    },
    {
      name: 'itemCode',
      width: 200,
    },
    {
      name: 'itemName',
      width: 200,
    },
    {
      name: 'uomName',
      width: 100,
    },
    {
      name: 'quantity',
      width: 100,
    },
    {
      name: 'neededDate',
      width: 100,
    },
    {
      name: 'taxRate',
      width: 100,
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
      name: 'unitPrice',
      width: 150,
    },
    {
      name: 'lineAmount',
      width: 150,
    },
    {
      name: 'unitName',
      width: 100,
    },
    // {
    //   name: 'rpStatusMeaning',
    // },
    {
      name: 'rpSourcePlatformMeaning',
      width: 100,
    },
    {
      name: 'returnReason',
      width: 120,
    },
  ];
};

const getPendingColumns = (flag = false) => {
  const splitColumns =
    flag === true
      ? [
          {
            name: 'splitFlagMeaning',
            width: 180,
          },
          {
            name: 'splitVtNumAndLineNum',
            width: 200,
          },
        ]
      : [];
  const defColumns = [
    {
      name: 'rpNumAndlineNum',
      width: 200,
      renderer: ({ record }) => {
        return record &&
          (record.get('mergeFlag') ||
            record.get('rpNum') ||
            record.get('vtNum') ||
            record.get('rpDisplayLineNum'))
          ? record.get('mergeFlag') || record.get('splitFlag')
            ? `${record.get('vtNum') ?? '-'}-${record.get('lineNum') ?? '-'}`
            : `${record.get('rpNum') ?? '-'}-${record.get('rpDisplayLineNum') ?? '-'}`
          : null;
      },
    },
    ...splitColumns,
    // {
    //   name: 'operatorRecord',
    //   renderer: ({ record }) => (
    //     <>
    //       <a
    //         onClick={() => {
    //           const index = record?.index;
    //           tableDs.create(record.data, index + 1);
    //           console.log('wwwwwwwwwwwwwwwwwwwww', record, index);
    //         }}
    //       >
    //         {intl.get(`${commonPrompt}.split`).d('拆分')}
    //       </a>
    //       <a onClick={() => {}}>{intl.get(`${commonPrompt}.save`).d('保存')}</a>
    //       <a onClick={() => {}}>{intl.get(`${commonPrompt}.cancel`).d('取消')}</a>
    //     </>
    //   ),
    // },
    // {
    //   name: 'containerCode',
    // },
    // {
    //   name: 'containerName',
    // },
    {
      name: 'invOrganizationName',
      width: 180,
    },
    {
      name: 'itemCode',
      width: 200,
    },
    {
      name: 'itemName',
      width: 200,
    },
    {
      name: 'uomName',
      width: 100,
    },
    {
      name: 'quantity',
      width: 100,
    },
    {
      name: 'mergeQuantity', // 平衡数量
      width: 100,
      editor: record =>
        !(
          record &&
          (record.get('parentVtLineId') || record.get('mergeFlag') || record.get('splitFlag'))
        ),
    },
    {
      name: 'remainQuantity',
      width: 100,
    },
    {
      name: 'neededDate',
      width: 100,
    },
    {
      name: 'taxRate',
      width: 100,
    },
    {
      name: 'currencyCode',
      width: 100,
    },
    {
      name: 'unitPrice',
      width: 150,
    },
    {
      name: 'unitName',
      width: 100,
    },
    // {
    //   name: 'rpStatusMeaning',
    // },
    {
      name: 'rpSourcePlatformMeaning',
      width: 100,
    },
    // {
    //   name: 'version',
    // },
    {
      name: 'rejectedReason',
      width: 100,
    },
  ];
  return defColumns;
};

const getSubmittedColumns = handleJumpDetail => {
  return [
    {
      name: 'blStatus',
      width: 120,
      renderer: ({ value, record }) => colorRender(value, record.get('blStatusMeaning')),
    },
    {
      name: 'blNum',
      width: 120,
      renderer: ({ value, record }) => <a onClick={() => handleJumpDetail(record)}>{value}</a>,
    },
    {
      name: 'workFlowApproveProcess',
      width: 150,
      renderer: viewDetail,
      tooltip: 'none',
    },
    {
      name: 'operatorRecord',
      width: 250,
      renderer: ({ record, dataSet }) => {
        const approvaFlags = dataSet.getState('approvaFlags');
        const operationFlags = dataSet.getState('operationFlags');
        const workFlowBusinessKey = record.get('workflowBusinessKey');
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
          </div>
        );
      },
    },
    {
      name: 'createdByName',
      width: 100,
    },
    {
      name: 'creationDate',
      width: 150,
    },

    // {
    //   name: 'rpStatus',
    // },
    {
      name: 'requestedBy',
      width: 100,
    },
    {
      name: 'requestDate',
      width: 150,
    },
    {
      name: 'originalCurrency',
      width: 100,
    },
    {
      name: 'amount',
      width: 100,
    },
    {
      name: 'localCurrency',
      width: 100,
    },
    {
      name: 'localCurrencyNoTaxSum',
      width: 150,
    },
    {
      name: 'localCurrencyTaxSum',
      width: 150,
    },
    {
      name: 'remark',
      width: 100,
    },
    {
      name: 'companyName',
      width: 200,
    },
    {
      name: 'ouName',
      width: 200,
    },
    {
      name: 'purchaseOrgName',
      width: 200,
    },
  ];
};

const getSubmittedLineColumns = (handleJumpDetail, handleBlLineSourceModal) => {
  return [
    {
      name: 'blStatus',
      width: 120,
      renderer: ({ value, record }) => colorRender(value, record.get('blStatusMeaning')),
    },
    {
      name: 'blNumAndlineNum',
      width: 150,
      renderer: ({ record }) => (
        <a onClick={() => handleJumpDetail(record)}>
          {record && (record.get('blNum') || record.get('lineNum'))
            ? `${record.get('blNum') ?? '-'}-${record.get('lineNum') ?? '-'}`
            : null}
        </a>
      ),
    },
    {
      name: 'rpNum',
      width: 100,
      renderer: ({ record }) => {
        return record.get('splitFlag') !== 1 && record.get('vtSplitFlag') !== 1 ? (
          <a onClick={() => handleBlLineSourceModal(record)}>
            {intl.get(`${commonPrompt}.check`).d('查看')}
          </a>
        ) : null;
      },
    },
    {
      name: 'invOrganizationName',
      width: 200,
    },
    {
      name: 'itemCode',
      width: 200,
    },
    {
      name: 'itemName',
      width: 200,
    },
    {
      name: 'uomName',
      width: 100,
    },
    {
      name: 'quantity',
      width: 100,
    },
    {
      name: 'neededDate',
      width: 100,
    },
    {
      name: 'taxRate',
      width: 100,
    },
    {
      name: 'currencyCode',
      width: 100,
    },
    {
      name: 'unitPrice',
      width: 150,
    },
    {
      name: 'lineAmount',
      width: 150,
    },
    {
      name: 'unitName',
      width: 100,
    },
    {
      name: 'rpSourcePlatformMeaning',
      width: 100,
    },
  ];
};

const getReadyColumns = (handleJumpDetail, handleBlLineSourceModal) => {
  return [
    {
      name: 'blNumAndlineNum',
      width: 150,
      renderer: ({ record }) => (
        <a onClick={() => handleJumpDetail(record, 1, 1)}>
          {record && (record.get('blNum') || record.get('lineNum'))
            ? `${record.get('blNum') ?? '-'}-${record.get('lineNum') ?? '-'}`
            : null}
        </a>
      ),
    },
    {
      name: 'splitFlagMeaning',
      width: 120,
    },
    {
      name: 'splitBlNumAndLineNum',
      width: 150,
    },
    {
      name: 'rpNum',
      width: 100,
      renderer: ({ record }) => {
        return record.get('splitFlag') !== 1 && record.get('vtSplitFlag') !== 1 ? (
          <a onClick={() => handleBlLineSourceModal(record)}>
            {intl.get(`${commonPrompt}.check`).d('查看')}
          </a>
        ) : null;
      },
    },
    {
      name: 'invOrganizationName',
      width: 200,
    },
    {
      name: 'itemCode',
      width: 200,
    },
    {
      name: 'itemName',
      width: 200,
    },
    {
      name: 'uomName',
      width: 100,
    },
    {
      name: 'quantity',
      width: 100,
    },
    {
      name: 'neededDate',
      width: 100,
    },
    {
      name: 'taxRate',
      width: 100,
    },
    {
      name: 'currencyCode',
      width: 100,
    },
    {
      name: 'unitPrice',
      width: 150,
    },
    {
      name: 'lineAmount',
      width: 150,
    },
    {
      name: 'unitName',
      width: 100,
    },
    {
      name: 'rpSourcePlatformMeaning',
      width: 100,
    },
  ];
};

const getReleasedingColumns = handleJumpReleasedingDetail => {
  return [
    {
      name: 'blNumAndlineNum',
      width: 150,
      renderer: ({ record }) => (
        <a onClick={() => handleJumpReleasedingDetail(record, 1, 1)}>
          {record && (record.get('blNum') || record.get('lineNum'))
            ? `${record.get('blNum') ?? '-'}-${record.get('lineNum') ?? '-'}`
            : null}
        </a>
      ),
    },
    // {
    //   name: 'rpNum',
    //   width: 100,
    //   renderer: ({ record }) => {
    //     return record.get('splitFlag') !== 1 && record.get('vtSplitFlag') !== 1 ? (
    //       <a onClick={() => handleBlLineSourceModal(record)}>
    //         {intl.get(`${commonPrompt}.check`).d('查看')}
    //       </a>
    //     ) : null;
    //   },
    // },
    {
      name: 'prNum',
      width: 200,
      renderer: ({ record }) => {
        const obj = record.get('prHeaderMap') || {};
        // console.log(obj);

        return Object.keys(obj)
          .map(key => {
            const value = obj[key]?.replace('[', '')?.replace(']', '');
            return value;
          })
          .join(',');
      },
    },
    {
      name: 'invOrganizationName',
      width: 200,
    },
    {
      name: 'itemCode',
      width: 200,
    },
    {
      name: 'itemName',
      width: 200,
    },
    {
      name: 'uomName',
      width: 100,
    },
    {
      name: 'quantity',
      width: 100,
    },
    {
      name: 'neededDate',
      width: 100,
    },
    {
      name: 'taxRate',
      width: 100,
    },
    {
      name: 'currencyCode',
      width: 100,
    },
    {
      name: 'unitPrice',
      width: 150,
    },
    {
      name: 'lineAmount',
      width: 150,
    },
    {
      name: 'unitName',
      width: 100,
    },
    {
      name: 'rpSourcePlatformMeaning',
      width: 100,
    },
  ];
};

const getReleasedColumns = (handleBlLineSourceModal, handleJumpPrDetail) => {
  return [
    {
      name: 'blNumAndlineNum',
      width: 180,
      renderer: ({ record }) => {
        return `${record.get('blNum') ?? '-'}-${record.get('lineNum') ?? '-'}`;
      },
    },
    {
      name: 'prNum',
      width: 200,
      renderer: ({ record }) => {
        const obj = record.get('prHeaderMap') || {};
        // console.log(obj);

        return Object.keys(obj).map(key => {
          const value = obj[key]?.replace('[', '')?.replace(']', '');
          return (
            <Button type="c7n-pro" onClick={() => handleJumpPrDetail(key)} funcType="link">
              {value}
            </Button>
          );
        });
      },
    },
    {
      name: 'splitFlagMeaning',
      width: 120,
    },
    {
      name: 'splitBlNumAndLineNum',
      width: 150,
    },
    {
      name: 'rpNum',
      width: 100,
      renderer: ({ record }) => {
        return record.get('splitFlag') !== 1 && record.get('vtSplitFlag') !== 1 ? (
          <a onClick={() => handleBlLineSourceModal(record)}>
            {intl.get(`${commonPrompt}.check`).d('查看')}
          </a>
        ) : null;
      },
    },
    {
      name: 'invOrganizationName',
      width: 200,
    },
    {
      name: 'itemCode',
      width: 200,
    },
    {
      name: 'itemName',
      width: 200,
    },
    {
      name: 'uomName',
      width: 100,
    },
    {
      name: 'quantity',
      width: 100,
    },
    {
      name: 'neededDate',
      width: 100,
    },
    {
      name: 'taxRate',
      width: 100,
    },
    {
      name: 'currencyCode',
      width: 100,
    },
    {
      name: 'unitPrice',
      width: 150,
    },
    {
      name: 'lineAmount',
      width: 150,
    },
    {
      name: 'unitName',
      width: 100,
    },
    {
      name: 'rpSourcePlatformMeaning',
      width: 100,
    },
  ];
};

const getBalanceListColumns = () => {
  return [
    {
      name: 'rpNumAndlineNum',
      width: 200,
      renderer: ({ record }) => {
        return record &&
          (record.get('mergeFlag') ||
            record.get('rpNum') ||
            record.get('vtNum') ||
            record.get('rpDisplayLineNum'))
          ? record.get('mergeFlag') || record.get('splitFlag')
            ? `${record.get('vtNum') ?? '-'}-${record.get('lineNum') ?? '-'}`
            : `${record.get('rpNum') ?? '-'}-${record.get('rpDisplayLineNum') ?? '-'}`
          : null;
      },
    },
    {
      name: 'rpTypeId',
      width: 120,
      editor: record => isEditor(record, 'rpTypeId'),
    },
    {
      name: 'originalCurrency',
      width: 100,
      editor: record => isEditor(record, 'originalCurrency'),
    },
    {
      name: 'localCurrency',
      width: 100,
      editor: record => isEditor(record, 'localCurrency'),
    },
    {
      name: 'requestedBy',
      width: 100,
      editor: record => isEditor(record, 'requestedBy'),
    },
    {
      name: 'requestDate',
      width: 150,
      editor: record => isEditor(record, 'requestDate'),
    },
    {
      name: 'companyId',
      width: 200,
      editor: record => isEditor(record, 'companyId'),
    },
    {
      name: 'ouId',
      width: 200,
      editor: record => isEditor(record, 'ouId'),
    },
    {
      name: 'purchaseOrgId',
      width: 200,
      editor: record => isEditor(record, 'purchaseOrgId'),
    },
    {
      name: 'unitId',
      width: 100,
      editor: record => isEditor(record, 'unitId'),
    },
    {
      name: 'purchaseAgentId',
      width: 100,
      editor: record => isEditor(record, 'purchaseAgentId'),
    },
    {
      name: 'invOrganizationId',
      width: 200,
      editor: record => isEditor(record, 'invOrganizationId'),
    },
    {
      name: 'itemCode',
      width: 200,
      editor: record => isEditor(record, 'itemCode'),
    },
    {
      name: 'itemName',
      width: 200,
      editor: record => isEditor(record, 'itemName'),
    },
    {
      name: 'categoryId',
      width: 100,
      editor: record => isEditor(record, 'categoryId'),
    },
    {
      name: 'itemModel',
      width: 100,
      // editor: record => isEditor(record, 'itemModel'),
    },
    {
      name: 'itemSpecs',
      width: 100,
      // editor: record => isEditor(record, 'itemSpecs'),
    },
    {
      name: 'uomId',
      width: 100,
      editor: record => isEditor(record, 'uomId'),
    },
    {
      name: 'quantity',
      width: 100,
    },
    {
      name: 'mergeQuantity',
      width: 100,
      editor: true,
      // renderer: ({ record }) =>
      //   record && (record?.get('mergeQuantity') || record?.get('mergeQuantity') === 0)
      //     ? record?.get('mergeQuantity')
      //     : record?.get('remainQuantity') ?? null,
    },
    {
      name: 'remainQuantity',
      width: 100,
    },

    {
      name: 'neededDate',
      width: 100,
      editor: record => isEditor(record, 'neededDate'),
    },
    {
      name: 'taxId',
      width: 100,
      editor: record => isEditor(record, 'taxId'),
    },
    {
      name: 'taxRate',
      width: 100,
      // editor: (record) => isEditor(record, 'taxRate'),
    },
    {
      name: 'taxIncludedUnitPrice',
      width: 120,
      editor: record => isEditor(record, 'taxIncludedUnitPrice'),
    },
    {
      name: 'remark',
      width: 100,
      editor: record => isEditor(record, 'remark'),
    },
  ];
};

const getBlLineSourceColumns = ({ releaseFlagCtrl }) => {
  const cols = [
    {
      name: 'sourcePrNumsAndlineNum',
      width: 150,
      renderer: ({ record }) => {
        return (record && record.get('rpNum')) || record.get('rpDisplayLineNum')
          ? `${record.get('rpNum') ?? '-'}-${record.get('rpDisplayLineNum') ?? '-'}`
          : null;
      },
    },
    {
      name: 'releaseFlag',
      width: 150,
      renderer: ({ value, text }) => colorRender(value, text),
    },
    {
      name: 'invOrganizationName',
      width: 200,
    },
    {
      name: 'itemCode',
      width: 200,
    },
    {
      name: 'itemName',
      width: 200,
    },
    {
      name: 'categoryName',
      width: 200,
    },
    {
      name: 'itemModel',
      width: 200,
    },
    {
      name: 'itemSpecs',
      width: 200,
    },
    {
      name: 'uomName',
      width: 100,
    },
    {
      name: 'quantity',
      width: 100,
    },
    {
      name: 'mergeQuantity',
      width: 100,
      renderer: ({ record }) =>
        record && (record?.get('mergeQuantity') || record?.get('mergeQuantity') === 0)
          ? record?.get('mergeQuantity')
          : record?.get('remainQuantity') ?? null,
    },
    {
      name: 'remainQuantity',
      width: 100,
    },
    {
      name: 'neededDate',
      width: 100,
    },
    {
      name: 'taxRate',
      width: 100,
    },
    {
      name: 'currencyCode',
      width: 100,
    },
    {
      name: 'unitPrice',
      width: 150,
    },
    {
      name: 'taxIncludedUnitPrice',
      width: 100,
    },
    {
      name: 'taxIncludedLineAmount',
      width: 100,
    },
    {
      name: 'lineAmount',
      width: 100,
    },
    {
      name: 'localCurrencyNoTaxUnit',
      width: 100,
    },
    {
      name: 'localCurrencyTaxUnit',
      width: 100,
    },
    {
      name: 'localCurrencyTaxSum',
      width: 100,
    },
    {
      name: 'localCurrencyNoTaxSum',
      width: 100,
    },
    {
      name: 'remark',
      width: 100,
    },
    {
      name: 'unitName',
      width: 100,
    },
    {
      name: 'companyId',
      width: 200,
      renderer: ({ record }) => record.get('companyName'),
    },
    {
      name: 'ouId',
      width: 200,
      renderer: ({ record }) => record.get('ouName'),
    },
    {
      name: 'purchaseOrgId',
      width: 200,
      renderer: ({ record }) => record.get('purchaseOrgName'),
    },
    {
      name: 'purchaseAgentId',
      renderer: ({ record }) => record.get('purchaseAgentName'),
    },
    {
      name: 'rpSourcePlatformMeaning',
      width: 100,
    },
  ];
  return releaseFlagCtrl !== 'ORIGINAL_LINE_RELEASE'
    ? cols.filter(item => item.name !== 'releaseFlag')
    : cols;
};

const getVtBalanceSplitListColumns = (containerId, type = 'pending') => {
  return [
    {
      name: 'operation',
      renderer: ({ dataSet, record }) =>
        record.get('beSplitFlag') === 1 ? (
          <Button
            type="c7n-pro"
            funcType="link"
            color="primary"
            onClick={() => split({ dataSet, record, containerId, type })}
          >
            {intl.get(`${commonPrompt}.split`).d('拆分')}
          </Button>
        ) : null,
    },
    {
      name: 'rpNumAndlineNum',
      width: 200,
      renderer: ({ record }) => {
        return record &&
          (record.get('mergeFlag') ||
            record.get('rpNum') ||
            record.get('vtNum') ||
            record.get('rpDisplayLineNum'))
          ? record.get('mergeFlag') || record.get('splitFlag')
            ? `${record.get('vtNum') ?? '-'}-${record.get('lineNum') ?? '-'}`
            : `${record.get('rpNum') ?? '-'}-${record.get('rpDisplayLineNum') ?? '-'}`
          : null;
      },
    },
    {
      name: 'splitFlagMeaning',
      width: 180,
    },
    {
      name: 'splitVtNumAndLineNum',
      width: 200,
    },
    {
      name: 'rpTypeId',
      width: 120,
      editor: record => isEditorSplit(record, 'rpTypeId', type),
    },
    {
      name: 'originalCurrency',
      width: 100,
      editor: record => isEditorSplit(record, 'originalCurrency', type),
    },
    {
      name: 'localCurrency',
      width: 100,
      editor: record => isEditorSplit(record, 'localCurrency', type),
    },
    {
      name: 'requestedBy',
      width: 100,
      editor: record => isEditorSplit(record, 'requestedBy', type),
    },
    {
      name: 'requestDate',
      width: 150,
      editor: record => isEditorSplit(record, 'requestDate', type),
    },
    {
      name: 'companyId',
      width: 200,
      editor: record => isEditorSplit(record, 'companyId', type),
    },
    {
      name: 'ouId',
      width: 200,
      editor: record => isEditorSplit(record, 'ouId', type),
    },
    {
      name: 'purchaseOrgId',
      width: 200,
      editor: record => isEditorSplit(record, 'purchaseOrgId', type),
    },
    {
      name: 'unitId',
      width: 100,
      editor: record => isEditorSplit(record, 'unitId', type),
    },
    {
      name: 'purchaseAgentId',
      width: 100,
      editor: record => isEditorSplit(record, 'purchaseAgentId', type),
    },
    {
      name: 'invOrganizationId',
      width: 200,
      editor: record => isEditorSplit(record, 'invOrganizationId', type),
    },
    {
      name: 'itemCode',
      width: 200,
      editor: record => isEditorSplit(record, 'itemCode', type),
    },
    {
      name: 'itemName',
      width: 200,
      editor: record => isEditorSplit(record, 'itemName', type),
    },
    {
      name: 'categoryId',
      width: 100,
      editor: record => isEditorSplit(record, 'categoryId', type),
    },
    {
      name: 'itemModel',
      width: 100,
      // editor: record => isEditor(record, 'itemModel'),
    },
    {
      name: 'itemSpecs',
      width: 100,
      // editor: record => isEditor(record, 'itemSpecs'),
    },
    {
      name: 'uomId',
      width: 100,
      editor: record => isEditorSplit(record, 'uomId', type),
    },
    {
      name: 'quantity',
      width: 100,
    },
    {
      name: 'mergeQuantity',
      width: 100,
      editor: record =>
        !(record && (record.get('parentVtLineId') || record.get('submittedFlag') === 1)),
    },
    {
      name: 'totalSplitQuantity',
      width: 100,
    },
    {
      name: 'remainQuantity',
      width: 100,
    },
    {
      name: 'neededDate',
      width: 100,
      editor: record => isEditorSplit(record, 'neededDate', type),
    },
    {
      name: 'taxId',
      width: 100,
      editor: record => isEditorSplit(record, 'taxId', type),
    },
    {
      name: 'taxRate',
      width: 100,
      // editor: (record) => isEditor(record, 'taxRate'),
    },
    {
      name: 'taxIncludedUnitPrice',
      width: 120,
      editor: record => isEditorSplit(record, 'taxIncludedUnitPrice', type),
    },
    {
      name: 'remark',
      width: 100,
      editor: record => isEditorSplit(record, 'remark', type),
    },
    {
      name: 'blNumAndLineNum',
      with: 150,
    },
  ];
};

const getBlBalanceSplitListColumns = (containerId, type = 'ready') => {
  return [
    {
      name: 'operation',
      renderer: ({ dataSet, record }) =>
        record.get('beSplitFlag') === 1 ? (
          <Button
            type="c7n-pro"
            funcType="link"
            color="primary"
            onClick={() => split({ dataSet, record, containerId, type })}
          >
            {intl.get(`${commonPrompt}.split`).d('拆分')}
          </Button>
        ) : null,
    },
    {
      name: 'blNumAndlineNum',
      width: 150,
      renderer: ({ record }) => (
        <span>
          {record && (record.get('blNum') || record.get('lineNum'))
            ? `${record.get('blNum') ?? '-'}-${record.get('lineNum') ?? '-'}`
            : null}
        </span>
      ),
    },
    {
      name: 'splitFlagMeaning',
      width: 120,
    },
    {
      name: 'splitBlNumAndLineNum',
      width: 150,
    },
    {
      name: 'rpTypeId',
      width: 120,
      editor: record => isEditorSplit(record, 'rpTypeId', type),
    },
    {
      name: 'currencyCode',
      width: 100,
      editor: record => isEditorSplit(record, 'currencyCode', type),
    },
    {
      name: 'localCurrency',
      width: 100,
      editor: record => isEditorSplit(record, 'localCurrency', type),
    },
    {
      name: 'requestedBy',
      width: 100,
      editor: record => isEditorSplit(record, 'requestedBy', type),
    },
    {
      name: 'requestDate',
      width: 150,
      editor: record => isEditorSplit(record, 'requestDate', type),
    },
    {
      name: 'companyId',
      width: 200,
      editor: record => isEditorSplit(record, 'companyId', type),
    },
    {
      name: 'ouId',
      width: 100,
      editor: record => isEditorSplit(record, 'ouId', type),
    },
    {
      name: 'purchaseOrgId',
      width: 100,
      editor: record => isEditorSplit(record, 'purchaseOrgId', type),
    },
    {
      name: 'unitId',
      width: 100,
      editor: record => isEditorSplit(record, 'unitId', type),
    },
    {
      name: 'purchaseAgentId',
      width: 100,
      editor: record => isEditorSplit(record, 'purchaseAgentId', type),
    },
    {
      name: 'invOrganizationId',
      width: 120,
      editor: record => isEditorSplit(record, 'invOrganizationId', type),
    },
    {
      name: 'itemCode',
      width: 200,
      editor: record => isEditorSplit(record, 'itemCode', type),
    },
    {
      name: 'itemName',
      width: 200,
      editor: record => isEditorSplit(record, 'itemName', type),
    },
    {
      name: 'categoryId',
      width: 100,
      editor: record => isEditorSplit(record, 'categoryId'),
    },
    {
      name: 'itemModel',
      width: 100,
      // editor: record => isEditor(record, 'itemModel'),
    },
    {
      name: 'itemSpecs',
      width: 100,
      // editor: record => isEditor(record, 'itemSpecs'),
    },
    {
      name: 'uomId',
      width: 100,
      editor: record => isEditorSplit(record, 'uomId', type),
    },
    {
      name: 'quantity',
      width: 100,
      editor: record => record.get('releasedFlag') === 0,
    },
    {
      name: 'totalSplitQuantity',
      width: 100,
    },
    {
      name: 'neededDate',
      width: 100,
      editor: record => isEditorSplit(record, 'neededDate', type),
    },
    {
      name: 'taxId',
      width: 100,
      editor: record => isEditorSplit(record, 'taxId', type),
    },
    {
      name: 'taxRate',
      width: 100,
      // editor: (record) => isEditor(record, 'taxRate'),
    },
    {
      name: 'taxIncludedUnitPrice',
      width: 120,
      editor: record => isEditorSplit(record, 'taxIncludedUnitPrice', type),
    },
    {
      name: 'remark',
      width: 100,
      editor: record => isEditorSplit(record, 'remark', type),
    },
  ];
};

export {
  getTodoColumns,
  getPendingColumns,
  getSubmittedColumns,
  getSubmittedLineColumns,
  getReadyColumns,
  getReleasedColumns,
  getReleasedingColumns,
  getBalanceListColumns,
  getBlLineSourceColumns,
  getVtBalanceSplitListColumns,
  getBlBalanceSplitListColumns,
};
