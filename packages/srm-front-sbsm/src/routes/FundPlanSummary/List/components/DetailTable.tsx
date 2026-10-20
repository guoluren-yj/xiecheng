import React, { useContext, useMemo, useCallback } from 'react';
import { observer } from 'mobx-react';
import { Button, useModal } from 'choerodon-ui/pro';
import { FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { ColumnAlign } from 'choerodon-ui/pro/lib/table/enum';
import type { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';

import intl from 'utils/intl';
import SearchBarTable from '_components/SearchBarTable';

import { Store } from '../stores';
import { useModalOpen } from '../../../../hooks';
import type { ActiveKey } from '../../utils/type';
import { ListGridCode, ListFilterCode } from '../../utils/type';
import RelatedLine from '../../components/LineDetail/RelatedLine';
import { statusTagRender } from '../../../../components/StatusTag';
import MultiTextFilter from '../../../../components/MultiTextFilter';

interface DetailTableProps {
  activeKey: ActiveKey,
};

const DetailTable = (props: DetailTableProps) => {
  const { activeKey } = props;
  const { dsMap, customizeForm, customizeTable, handleToDetail } = useContext(Store);
  const tableDs = useMemo(() => dsMap[activeKey], [dsMap, activeKey]);
  const modalOpen = useModalOpen(useModal());

  const handleViewLineDetail = useCallback((record) => {
    modalOpen({
      size: 'large',
      editFlag: false,
      title: intl.get('sbsm.fundPlan.view.button.viewSummaryLineDetail').d('查看汇总单行明细'),
      children: <RelatedLine topRecord={record} customizeForm={customizeForm} customizeTable={customizeTable} />,
      cancelButton: false,
      okText: intl.get('hzero.common.button.close').d('关闭'),
    });
  }, [
    modalOpen,
    customizeForm,
    customizeTable,
  ]);

  const columns: ColumnProps[] = useMemo(() => {
    return [
        { name: 'balStatus', width: 120, renderer: statusTagRender },
        {
          name: 'balNumAndLineNum',
          width: 160,
          renderer: ({ value, record }) => {
            return (
              <Button
                funcType={FuncType.link}
                style={{ userSelect: 'text' }}
                onClick={() => handleToDetail(record?.get('balHeaderId'))}
              >
                {value}
              </Button>
            );
          },
        },
        { name: 'companyName', width: 200 },
        { name: 'supplierCompanyNum', width: 150 },
        { name: 'supplierCompanyName', width: 200 },
        { name: 'prepSourceMeaning', width: 150 },
        {
          name: 'documentNum',
          width: 160,
          renderer: ({ value, record }) => {
            const { displaySourceDocNum = '', displaySourceDocLineNum = '' } = record?.get(['displaySourceDocNum', 'displaySourceDocLineNum']) || {};
            return displaySourceDocNum ? `${displaySourceDocNum}${displaySourceDocLineNum && '-'}${displaySourceDocLineNum || ''}` : value;
          },
        },
        { name: 'documentAmount', width: 150 },
        {
          name: 'termSourceNumAndLine',
          width: 150,
          renderer: ({ value, record }) => {
            const { displaySourceDocNum = '', displaySourceDocLineNum = '' } = record?.get(['displaySourceDocNum', 'displaySourceDocLineNum']) || {};
            return displaySourceDocNum ? `${displaySourceDocNum}${displaySourceDocLineNum && '-'}${displaySourceDocLineNum || ''}` : value;
          },
        },
        { name: 'stageNum', width: 150 },
        { name: 'stageDesc', width: 150 },
        { name: 'stageAmount', width: 150 },
        { name: 'balPayAmount', width: 150 },
        { name: 'balApplyAmount', width: 150 },
        { name: 'balPaymentDate', width: 150 },
        { name: 'balPaymentDateLast', width: 150 },
        { name: 'remainAmountProcessMeaning', width: 150 },
        { name: 'lineRemark', width: 150 },
        {
          name: 'operation',
          width: 150,
          align: ColumnAlign.left,
          command: ({record }) => [
            <Button funcType={FuncType.link} onClick={() => handleViewLineDetail(record)}>
              {intl.get('sbsm.fundPlan.view.button.viewLineDetail').d('查看行明细')}
            </Button>,
          ],
         },
        { name: 'prepPayAmount', width: 150 },
        { name: 'balOccupyPayAmount', width: 150 },
        { name: 'balEnablePayAmount', width: 150 },
        { name: 'prepApplyAmount', width: 150 },
        { name: 'balOccupyApplyAmount', width: 150 },
        { name: 'balEnableApplyAmount', width: 150 },
        { name: 'prepPaymentDate', width: 150 },
        { name: 'prepPaymentDateLast', width: 150 },
    ];
  }, [
    handleToDetail,
    handleViewLineDetail,
  ]);

  return (
    <div style={{ height: 'calc(100vh - 254px)' }}>
      {customizeTable(
        { code: ListGridCode[activeKey] },
        <SearchBarTable
          virtual
          virtualCell
          cacheState
          customizable
          dataSet={tableDs}
          columns={columns}
          searchCode={ListFilterCode[activeKey]}
          style={{ maxHeight: 'calc(100% - 22px)' }}
          pagination={{ maxPageSize: 1000, pageSizeOptions: ['10', '20', '50', '100', '500', '1000'] }}
          searchBarConfig={{
            left: {
              render: (_, customizeDs) => (
                <MultiTextFilter
                  name="balNums"
                  dataSet={customizeDs}
                  placeholder={intl
                    .get('sbsm.fundPlan.view.message.enterBalNumsQuery')
                    .d('请输入资金计划汇总单号查询')}
                />
              ),
            },
          }}
        />
      )}
    </div>
  );
};

export default observer(DetailTable);
