import React, { useContext, useMemo } from 'react';

import intl from 'utils/intl';
import { observer } from 'mobx-react-lite';
import notification from 'utils/notification';
import { isFunction } from 'lodash';
// import { yesOrNoRender } from 'utils/renderer';
import { getResponse } from 'utils/utils';
import moment from 'moment';
import { Tooltip, Modal } from 'choerodon-ui/pro';
import { Button } from 'components/Permission';
import { batchLineVoid } from '@/services/budgetService';
import SearchBarTable from '@/routes/components/SearchBarTable';
import ActionRender from '../components/ActionRender';
import { colorRender } from '../hook';
import { Store } from '../stores/storeProvider';
import budget from '../../../models/budget';
// 设置sbdm国际化前缀 - common - model
const commonPrompt = 'sbdm.common.model.common';
// 行table按钮
const TableButton = observer(() => {
  const { getCuxBudgetBtn, getCuxLineButtons, listDs, commonUpdate, isArchived, budgetHeaderStatus, header } = useContext(Store);

  const { selected } = listDs;

  // 作废
  const handleLineVoid = () => {
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      children: (
        <div>{intl.get(`${commonPrompt}.budgetLineVoidTip`).d(`确认要作废选中的预算行`)}</div>
      ),
    }).then((button) => {
      if (button === 'ok') {
        return new Promise((resolve) => {
          const data = selected.map((record) => record.toData());
          batchLineVoid(data)
            .then((res) => {
              if (getResponse(res)) {
                listDs.unSelectAll();
                listDs.clearCachedSelected();
                commonUpdate(true);
                notification.success();
              }
            })
            .finally(() => {
              resolve();
            });
        });
      }
    });
  };

  const voidDisabled =
    selected?.length &&
    selected.every(
      (record) =>
        ['APPROVED', 'EDIT', 'EDIT_REJECT'].includes(record.get('budgetLineStatus')) &&
        !record.get('occupiedAmount')
    );

  const budgetShowFlag =
    (!isArchived || moment().isBefore(header?.get('startDate'))) &&
    !['NEW', 'REJECT'].includes(budgetHeaderStatus);

  const _budgetBtn = budgetShowFlag && (
    <Tooltip
      title={intl.get(`${commonPrompt}.budgetVoidTip`).d('仅已生效未使用状态的预算允许作废')}
      key="cancel"
    >
      <Button
        funcType="flat"
        icon="cancel"
        color="primary"
        type="c7n-pro"
        onClick={() => handleLineVoid()}
        disabled={!voidDisabled}
        permissionList={[
          {
            code: 'srm.budget.manager.budget.button.line-abolished',
            type: 'button',
          },
        ]}
      >
        {intl.get(`${commonPrompt}.budgetLineVoid`).d('作废预算行')}
      </Button>
    </Tooltip>
  );

  const budgetBtn = getCuxBudgetBtn
    ? getCuxBudgetBtn(_budgetBtn, { budgetShowFlag, handleLineVoid, voidDisabled, listDs, source: 'readOnly' })
    : _budgetBtn;
  const buttons = [budgetBtn];
  return getCuxLineButtons ? getCuxLineButtons(buttons) : buttons;
});

const PurchaseLineInfo = function PurchaseLineInfo() {
  const {
    listDs,
    templateFields,
    pubPathFlag,
    budgetHeaderStatus,
    isArchived,
    setCuxColumns,
    setCuxColumnsOthers,
    headerDs,
    header,
    history,
  } = useContext(Store);

  const lineColumns = useMemo(() => {
    const cuxCols = isFunction(setCuxColumns)
      ? setCuxColumns({ pubPathFlag, history, budgetHeaderStatus, headerDs })
      : [];
    const djustColumns = !['NEW', 'REJECT', 'APPROVING', 'APPROVED'].includes(budgetHeaderStatus)
      ? [
        {
          name: 'adjustAmount',
          width: 200,
        },
        {
          name: 'adjustedAmount',
          width: 200,
        },
      ]
      : [];
    const occupyOrappyColumns = !['NEW', 'REJECT', 'APPROVING'].includes(budgetHeaderStatus)
      ? [
        {
          name: 'budgetBalanceAmount',
          width: 200,
        },
        {
          name: 'occupiedAmount',
          width: 200,
        },
        {
          name: 'appliedAmount',
          width: 200,
        },
      ]
      : [];

    const operationColumns = !['NEW', 'REJECT', 'APPROVING'].includes(budgetHeaderStatus)
      ? [
        {
          name: 'operation',
          width: 200,
          renderer: ({ record }) => (
            <ActionRender record={record} budgetHeaderStatus={budgetHeaderStatus} />
          ),
        },
      ]
      : [];
    const columns = [
      {
        name: 'budgetLineStatus',
        width: 150,
        renderer: ({ value, record }) => colorRender(value, record.get('budgetLineStatusMeaning')),
      },
      {
        name: 'lineNum',
        width: 150,
        renderer: ({ value, record }) => (
          <>
            {record.get('budgetLineStatus') === 'EDIT_APPROVING' && pubPathFlag ? (
              <>
                <Tooltip title={intl.get(`${commonPrompt}.adjustedLine`).d('本行已调整')}>
                  <a style={{ color: 'red' }}>{value}</a>
                </Tooltip>
              </>
            ) : (
              value
            )}
          </>
        ),
      },
      {
        name: 'budgetLineDesc',
        width: 200,
      },
      {
        name: 'origBudgetAmount',
        width: 200,
      },
      ...djustColumns,
      ...occupyOrappyColumns,
      {
        name: 'currencyCode',
        width: 200,
      },
      ...operationColumns,
    ];

    if (templateFields) {
      const dynamicColumns = templateFields
        .map(item => {
          return {
            name: item.budgetItemCode,
            width: item.gridWidth,
            gridSeq: Number(item.gridSeq) !== -1 ? item.gridSeq : Infinity,
          };
        })
        .sort((a, b) => a.gridSeq - b.gridSeq);

      columns.splice(3, 0, ...dynamicColumns);
    }
    columns.splice(3, 0, ...cuxCols);
    const cuxColsReplace = isFunction(setCuxColumnsOthers) ? setCuxColumnsOthers({ pubPathFlag, history, budgetHeaderStatus, headerDs, columns }) : columns;
    return cuxColsReplace;
  }, [templateFields, budgetHeaderStatus, pubPathFlag]);

  const table = (
    <SearchBarTable
      style={{ maxHeight: '450px' }}
      dataSet={listDs}
      columns={lineColumns}
      buttons={
        pubPathFlag || (isArchived && !moment().isBefore(header?.get('startDate'))) || ['APPROVING', 'EDIT_APPROVING'].includes(budgetHeaderStatus)
          ? []
          : [<TableButton />]
      }
      autoValidationLocate={false}
      searchBarConfig={{
        fuzzyQueryCode: 'budgetLineDesc',
        fuzzyQueryName: intl.get(`${commonPrompt}.budgetDesc`).d('预算说明'),
      }}
    />
  );

  return table;
};

export default PurchaseLineInfo;
