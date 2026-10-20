/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2022-05-24 17:10:43
 * @LastEditors: yanglin
 * @LastEditTime: 2023-11-03 15:45:41
 */
import React, { useMemo } from 'react';
import { Lov } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { observer } from 'mobx-react-lite';
import { isFunction } from 'lodash';
import { Button } from 'components/Permission';
import SearchBarTable from '@/routes/components/SearchBarTable';
import { colorRender } from '../hook';
import styles from '../index.less';
// 设置sbdm国际化前缀 - common - model
const commonPrompt = 'sbdm.common.model.common';

const Index = ({
  tableDs,
  lovDs,
  handleJumpDetail,
  templateFields,
  dispatch,
  type,
  setCuxColumns,
  setCuxColumnsOthers,
}) => {
  const lineColumns = useMemo(() => {
    const columns = [
      {
        name: 'budgetLineStatus',
        width: 150,
        renderer: ({ value, record }) => colorRender(value, record.get('budgetLineStatusMeaning')),
      },
      {
        name: 'lineNum',
        width: 150,
        renderer: ({ record, value }) => (
          <a onClick={() => handleJumpDetail(record)}>{`${record.get('budgetNum')}-${value}`}</a>
        ),
      },
      {
        name: 'budgetLineDesc',
        width: 150,
      },
      {
        name: 'origBudgetAmount',
        width: 150,
      },
      {
        name: 'occupiedAmount',
        width: 150,
      },
      {
        name: 'appliedAmount',
        width: 150,
      },
      {
        name: 'budgetBalanceAmount',
        width: 150,
      },
      {
        name: 'currencyCode',
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

    const cuxCols = isFunction(setCuxColumns) ? setCuxColumns({ dispatch, lovDs }) : [];
    if (type === 'effective') {
      columns.splice(2, 0, {
        name: 'operation',
        width: 120,
        renderer: ({ record }) => (
          <div>
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
          </div>
        ),
      });
    }

    columns.splice(3, 0, ...cuxCols);
    const cuxColsReplace = isFunction(setCuxColumnsOthers) ? setCuxColumnsOthers({ pubPathFlag, history, budgetHeaderStatus, headerDs, columns }) : columns;
    return cuxColsReplace;
  }, [templateFields]);

  return (
    <div style={{ height: 'calc(100vh - 260px)' }}>
      <SearchBarTable
        style={{ maxHeight: 'calc(100% - 22px)' }}
        dataSet={tableDs}
        columns={lineColumns}
        searchBarConfig={{
          fuzzyQueryMultipleFlag: true,
          fuzzyQueryCode: 'multiSelectBudgetNums',
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

export default observer(Index);
