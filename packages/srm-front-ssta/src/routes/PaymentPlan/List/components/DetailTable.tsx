import React, { useContext, useMemo, useEffect, useCallback } from 'react';
import { Button, useModal } from 'choerodon-ui/pro';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import type { ColumnProps } from 'choerodon-ui/pro/lib/table/interface';

import intl from 'utils/intl';
import SearchBarTable from '_components/SearchBarTable';
import MultiTextFilter from '../../../Components/MultiTextFilter';

import { useModalOpen } from '../../../../hooks';
import { Store } from '../stores';
import type { StoreValueType } from '../stores';
import type { ActiveKey } from '../../utils/type';
import { DetailGridCustCode, DetailSearchCustCode } from '../../utils/type';
import PlanLineDetail from '../../Detail/components/PlanLineDetail';
import StatusTag, { getTagColor } from '../../../Components/StatusTag';

interface DetailTableProps {
  activeKey: ActiveKey,
};

const DetailTable = (props: DetailTableProps) => {
  const { activeKey } = props;
  const { dsMap, customizeTable, handleRecordInit, handleToDetail } = useContext(Store) as StoreValueType;
  const c7nModal = useModal();
  const modalOpen = useModalOpen(c7nModal);
  const tableDs = useMemo(() => dsMap[activeKey], [dsMap, activeKey]);

  useEffect(() => {
    handleRecordInit(activeKey);
  }, [activeKey, handleRecordInit]);

  const handleViewLineDetail = useCallback((record) => {
    const stageNum = record.get('stageNum') || '';
    modalOpen({
      size: 'large',
      title: `${stageNum} ${intl.get('ssta.paymentPlan.view.title.paymentStageDetail').d('付款阶段详情')}`,
      children: <PlanLineDetail record={record} />,
    });
  }, [modalOpen]);

  const columns: ColumnProps[] = useMemo(() => {
    return [
      {
        name: 'operation',
        width: 200,
        renderer: ({ record }) => (
          <Button
            funcType={FuncType.link}
            color={ButtonColor.primary}
            onClick={() => handleViewLineDetail(record)}
          >
            {intl.get('ssta.paymentPlan.view.button.viewDetail').d('查看详情')}
          </Button>
        ),
      },
      {
        name: 'planStatus',
        width: 120,
        renderer: ({ text, dataSet, record, name }) => (
          <StatusTag text={text} color={getTagColor(dataSet, record, name)} />
        ),
      },
      {
        name: 'lineStatus',
        width: 120,
        renderer: ({ text, dataSet, record, name }) => (
          <StatusTag text={text} color={getTagColor(dataSet, record, name)} />
        ),
      },
      {
        name: 'planNum',
        width: 150,
        renderer: ({ value, record }) => (
          <Button
            funcType={FuncType.link}
            color={ButtonColor.primary}
            style={{ userSelect: 'text' }}
            onClick={() => handleToDetail(record?.get('planHeaderId'), 'view')}
          >
            {value}
          </Button>
        ),
      },
      {
        name: 'planDesc',
        width: 180,
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
        name: 'versionNumber',
        width: 100,
      },
      {
        name: 'lineNum',
        width: 100,
      },
      {
        name: 'stageNum',
        width: 120,
      },
      {
        name: 'stageDesc',
        width: 150,
      },
      {
        name: 'stagePercent',
        width: 120,
      },
      {
        name: 'stageAmount',
        width: 120,
      },
      {
        name: 'executedStageAmount',
        width: 120,
      },
      {
        name: 'stageBalance',
        width: 120,
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
  }, [handleToDetail, handleViewLineDetail]);

  return customizeTable(
    { code: DetailGridCustCode[activeKey] },
    <SearchBarTable
      cacheState
      customizable
      dataSet={tableDs}
      columns={columns}
      searchCode={DetailSearchCustCode[activeKey]}
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

export default DetailTable;
