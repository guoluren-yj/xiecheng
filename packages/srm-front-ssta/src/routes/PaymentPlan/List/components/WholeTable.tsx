import React, { useContext, useMemo, useEffect } from 'react';
import { Button, Dropdown, Icon } from 'choerodon-ui/pro';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import type { ColumnProps } from 'choerodon-ui/pro/lib/table/interface';
import { ColumnAlign } from 'choerodon-ui/pro/lib/table/interface';

import intl from 'utils/intl';
import SearchBarTable from '_components/SearchBarTable';
import MultiTextFilter from '../../../Components/MultiTextFilter';
import StatusTag, { getTagColor } from '../../../Components/StatusTag';

import { Store } from '../stores';
import type { StoreValueType } from '../stores';
import type { ActiveKey } from '../../utils/type';
import HistoryVersion from '../components/HistoryVersion';
import { WholeGridCustCode, WholeSearchCustCode } from '../../utils/type';

interface WholeTableProps {
  activeKey: ActiveKey,
};

const WholeTable = (props: WholeTableProps) => {
  const { activeKey } = props;
  const { dsMap, history, customizeTable, handleRecordInit, handleToDetail } = useContext<StoreValueType>(Store);
  const tableDs = useMemo(() => dsMap[activeKey], [dsMap, activeKey]);

  useEffect(() => {
    handleRecordInit(activeKey);
  }, [activeKey, handleRecordInit]);

  const columns: ColumnProps[] = useMemo(() => {
    return [
      {
        name: 'planStatus',
        width: 120,
        renderer: ({ text, dataSet, record, name }) => (
          <StatusTag text={text} color={getTagColor(dataSet, record, name)} />
        ),
      },
      {
        name: 'operation',
        width: 180,
        align: ColumnAlign.left,
        command: ({ record }) => {
          const {
            planNum,
            planHeaderId,
            versionNumber,
          } = record.get([
            'planNum',
            'planHeaderId',
            'versionNumber',
          ]) || {};
          return [
            Number(versionNumber) > 1 && (
              <Dropdown
                overlay={
                  <HistoryVersion
                    history={history}
                    planNum={planNum}
                    planHeaderId={planHeaderId}
                  />
                }
              >
                <Button funcType={FuncType.link} color={ButtonColor.primary}>
                  {intl.get('hzero.common.button.historyVersion').d('历史版本')}
                  <Icon type="expand_more" />
                </Button>
              </Dropdown>
            ) as any,
          ];
        },
      },
      {
        name: 'planNum',
        width: 150,
        renderer: ({ value, record }) => (
          <a onClick={() => handleToDetail(record?.get('planHeaderId'), 'all')}>
            {value}
          </a>
        ),
      },
      {
        name: 'planDesc',
        width: 180,
      },
      {
        name: 'versionNumber',
        width: 100,
      },
      {
        name: 'sourceCode',
        width: 120,
      },
      {
        name: 'sourceDisplayNum',
        width: 150,
      },
      {
        name: 'paymentAmount',
        width: 120,
      },
      {
        name: 'executedAmount',
        width: 120,
      },
      {
        name: 'planLineNums',
        width: 180,
      },
      {
        name: 'companyName',
        width: 200,
      },
      {
        name: 'displaySupplierName',
        width: 200,
      },
    ];
  }, [history, handleToDetail]);

  return customizeTable(
    { code: WholeGridCustCode[activeKey] },
    <SearchBarTable
      cacheState
      customizable
      dataSet={tableDs}
      columns={columns}
      searchCode={WholeSearchCustCode[activeKey]}
      style={{ maxHeight: 'calc(100vh - 260px)' }}
      searchBarConfig={{
        left: {
          render: (_, customizeDs) => (
            <MultiTextFilter
              name="planNums"
              dataSet={customizeDs}
              placeholder={intl
                .get('ssta.paymentPlan.view.placeholder.enterPayPlanNumToQuery')
                .d('请输入付款计划编号查询')}
            />
          ),
        },
      }}
    />
  );
};

export default WholeTable;
