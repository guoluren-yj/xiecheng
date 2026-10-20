import React, { useContext, useMemo, useEffect } from 'react';

import uuid from 'uuid/v4';
import intl from 'utils/intl';
import { isFunction } from 'lodash';
import { observer } from 'mobx-react-lite';
import notification from 'utils/notification';
// import { yesOrNoRender } from 'utils/renderer';
import { getResponse } from 'utils/utils';

import { Tooltip, Icon, Modal } from 'choerodon-ui/pro';
import { Button } from 'components/Permission';
import { batchLineDetele, batchLineVoid } from '@/services/budgetService';
import SearchBarTable from '@/routes/components/SearchBarTable';
import ActionRender from '../components/ActionRender';

import { colorRender } from '../hook';
import { Store } from '../stores/storeProvider';
// 设置sbdm国际化前缀 - common - model
const commonPrompt = 'sbdm.common.model.common';
// 行table按钮
const TableButton = observer(() => {
  const { getCuxBudgetBtn, listDs, commonUpdate, budgetHeaderStatus, getCuxInit, headerDs } = useContext(Store);

  const { selected } = listDs;
  const { disabledLintBtn } = headerDs.getState('lineAddValue') || {}; // 二开五菱逻辑，
  console.log(disabledLintBtn, headerDs.getState('lineAddValue'));

  // 新增
  const handleCreate = async () => {
    let cuxAddData = {};
    if (!headerDs.getState('lineAddValue') && isFunction(getCuxInit)) {
      cuxAddData = await getCuxInit({ headerDs });
    }
    const cuxInitData = headerDs.getState('lineAddValue') || cuxAddData || {};
    listDs.create(
      {
        ...cuxInitData,
        primaryKey: uuid(),
      },
      0
    );
  };

  // 删除
  const handleLineDelete = () => {
    const deleUpdateArr = selected.filter(ele => ele.get('budgetLineStatus'));
    return new Promise(resolve => {
      if (deleUpdateArr.length > 0) {
        const data = deleUpdateArr.map(record => record.toData());
        listDs
          .delete(deleUpdateArr, {
            title: intl.get(`hzero.common.message.confirm.title`).d('提示'),
            children: (
              <div>
                {intl
                  .get('hzero.c7nProUI.DataSet.delete_selected_row_confirm')
                  .d('确认删除选中行？')}
              </div>
            ),
          })
          .then(() => {
            resolve();
          });
      } else {
        listDs.remove(selected);
        resolve();
      }
    });
  };

  // 作废
  const handleLineVoid = () => {
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      children: (
        <div>{intl.get(`${commonPrompt}.budgetLineVoidTip`).d(`确认要作废选中的预算行`)}</div>
      ),
    }).then(button => {
      if (button === 'ok') {
        return new Promise(resolve => {
          const data = selected.map(record => record.toData());
          batchLineVoid(data)
            .then(res => {
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

  const deleteDisabled =
    selected?.length &&
    selected.every(
      record =>
        ['NEW', 'REJECT'].includes(record.get('budgetLineStatus')) || record.status === 'add'
    );

  const voidDisabled =
    selected?.length &&
    selected.every(
      record =>
        ['APPROVED', 'EDIT', 'EDIT_REJECT'].includes(record.get('budgetLineStatus')) &&
        !record.get('occupiedAmount')
    );
  const budgetShowFlag = !['NEW', 'REJECT'].includes(budgetHeaderStatus);
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
  ? getCuxBudgetBtn(_budgetBtn, { budgetShowFlag, handleLineVoid, voidDisabled, listDs, source: 'detail' })
  : _budgetBtn;

  const _button = (
    [
      <Button
        key="create"
        funcType="flat"
        icon="playlist_add"
        color="primary"
        type="c7n-pro"
        hidden={disabledLintBtn}
        onClick={() => handleCreate()}
        permissionList={[
          {
            code: 'srm.budget.manager.budget.button.line-new',
            type: 'button',
          },
        ]}
      >
        {intl.get(`${commonPrompt}.budgetAddLine`).d('新增预算行')}
      </Button>,
      <Button
        key="delete"
        funcType="flat"
        icon="delete"
        color="primary"
        hidden={disabledLintBtn}
        type="c7n-pro"
        onClick={() => handleLineDelete()}
        disabled={!deleteDisabled}
        permissionList={[
          {
            code: 'srm.budget.manager.budget.button.line-delete',
            type: 'button',
          },
        ]}
      >
        {intl.get(`${commonPrompt}.budgetDeleteLine`).d('删除预算行')}
      </Button>,
      budgetBtn,
    ].filter(Boolean)
  );
  return _button;
});

const PurchaseLineInfo = function PurchaseLineInfo() {
  const {
    listDs,
    templateFields = [],
    isArchived,
    canResetAcionsFlag,
    budgetHeaderStatus,
    getTemplateFieldsAllowEdit,
    setCuxColumns,
    setCuxColumnsOthers,
    pubPathFlag,
    headerDs,
    history,
  } = useContext(Store);

  const allowEdit = ({ record = {}, name }) => {
    if (['APPROVING', 'EDIT_APPROVING'].includes(budgetHeaderStatus)) {
      return false;
    }

    if (isFunction(getTemplateFieldsAllowEdit)) {
      if (templateFields?.map(ele => ele.budgetItemCode).includes(name)) {
        return getTemplateFieldsAllowEdit({ headerDs, dataSet: listDs, record, name });
      }
    }

    if (name === 'adjustAmount') {
      return ['APPROVED', 'EDIT', 'EDIT_REJECT'].includes(record.get('budgetLineStatus'));
    } else if (name === 'budgetLineDesc') {
      return (
        ['NEW', 'REJECT', 'APPROVED', 'EDIT', 'EDIT_REJECT'].includes(
          record.get('budgetLineStatus')
        ) || record.status === 'add'
      );
    } else {
      return ['NEW', 'REJECT'].includes(record.get('budgetLineStatus')) || record.status === 'add';
    }
  };

  useEffect(() => {
    const createLine = headerDs.getState('createLine') || [];
    if (createLine) {
      createLine.forEach(e => {
        listDs.create(e, 0);
      });
    }
  }, [headerDs.getState('createLine')]);

  const lineColumns = useMemo(() => {
    const cuxCols = isFunction(setCuxColumns)
      ? setCuxColumns({ pubPathFlag, history, budgetHeaderStatus, headerDs })
      : [];
    const djustColumns = !['NEW', 'REJECT', 'APPROVING'].includes(budgetHeaderStatus)
      ? [
        {
          name: 'adjustAmount',
          width: 200,
          editor: record => allowEdit({ record, name: 'adjustAmount' }),
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
        name: 'errorFlag',
        width: 80,
        renderer: ({ value, record }) => {
          if (
            ['NEW', 'REJECT'].includes(record.get('budgetLineStatus')) ||
            record.status === 'add'
          ) {
            if (value && Number(value) === 1) {
              return (
                <Tooltip title={record.get('errorMessage')}>
                  <Icon type="cancel" style={{ color: '#f56649' }} />
                </Tooltip>
              );
            } else {
              return <Icon type="check_circle" style={{ color: '#47b883' }} />;
            }
          }
        },
      },
      {
        name: 'budgetLineStatus',
        width: 150,
        renderer: ({ value, record }) => colorRender(value, record.get('budgetLineStatusMeaning')),
      },
      {
        name: 'lineNum',
        width: 150,
      },
      {
        name: 'budgetLineDesc',
        editor: record => allowEdit({ record, name: 'budgetLineDesc' }),
        width: 200,
      },
      {
        name: 'origBudgetAmount',
        editor: record => allowEdit({ record, name: 'origBudgetAmount' }),
        width: 200,
      },
      ...djustColumns,
      ...occupyOrappyColumns,
      {
        name: 'currencyCode',
        width: 200,
        editor: record => allowEdit({ record, name: 'currencyCode' }),
      },
      ...operationColumns,
    ];

    if (templateFields) {
      const dynamicColumns = templateFields
        .map(item => {
          return {
            name: item.budgetItemCode,
            width: item.gridWidth,
            editor: record => allowEdit({ record, name: item.budgetItemCode }),
            gridSeq: Number(item.gridSeq) !== -1 ? item.gridSeq : Infinity,
          };
        })
        .sort((a, b) => a.gridSeq - b.gridSeq);

      columns.splice(4, 0, ...dynamicColumns);
    }
    columns.splice(4, 0, ...cuxCols);

    const cuxColsReplace = isFunction(setCuxColumnsOthers) ? setCuxColumnsOthers({ pubPathFlag, history, budgetHeaderStatus, headerDs, columns }) : columns;
    return cuxColsReplace;
  }, [templateFields, budgetHeaderStatus]);

  const table = (
    <SearchBarTable
      style={{ maxHeight: '480px' }}
      dataSet={listDs}
      columns={lineColumns}
      buttons={
        (isArchived && !canResetAcionsFlag) || ['APPROVING', 'EDIT_APPROVING'].includes(budgetHeaderStatus)
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

export default observer(PurchaseLineInfo);
