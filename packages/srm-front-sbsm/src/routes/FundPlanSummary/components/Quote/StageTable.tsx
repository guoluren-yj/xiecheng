import { stringify } from 'querystring';
import React, { useMemo, useEffect, useCallback } from 'react';
import { observer } from 'mobx-react';
import type { DataSet } from 'choerodon-ui/pro';
import { Button, Modal } from 'choerodon-ui/pro';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';

import intl from 'utils/intl';
import { openTab } from 'utils/menuTab';
import SearchBarTable from '_components/SearchBarTable';

import { CreateStageCode, LineAddStageCode } from '../../utils/type';
import StageDetail from '../../../FundPlanPrefabrication/Detail';
import styles from '../../../../common.less';
import MultiTextFilter from '../../../../components/MultiTextFilter';

interface StageTableProps {
  tableDs: DataSet;
  customizeTable: any;
  source: 'create' | 'addLine';
}

const StageTable = (props: StageTableProps) => {
  const { source, tableDs, customizeTable } = props;
  const addLineFlag = source === 'addLine';
  const CuszCode = addLineFlag ? LineAddStageCode : CreateStageCode;

  useEffect(() => {
    tableDs.setQueryParameter('customizeUnitCode', Object.values(CuszCode).join(','));
  }, [tableDs, CuszCode]);

  const handleClickNum = useCallback((record) => {
    Modal.open({
      drawer: true,
      closable: true,
      className: styles['sbsm-detailDrawer-modal'],
      style: {
        width: 1090,
      },
      children: <StageDetail recordInfo={record} viewType='STAGE' />,
      cancelButton: false,
    });
  }, []);

  const handleLinkDetail = useCallback((record) => {
    const { dataSource, documentNum, documentId } = record?.get(['dataSource', 'documentNum', 'documentId']) || {};
    if (!documentId) return;
    if (['ORDER', 'PO_LINE'].includes(dataSource)) {
      openTab({
        key: `/sodr/order-workspace/detail/all-orders/${documentId}`,
        title: intl.get('sbsm.common.view.title.orderWorkspace').d('订单工作台'),
        search: stringify({
          poSourcePlatform: documentNum,
          openFrom: 'settle',
          isBackFlag: 0,
        }),
      });
    }
  }, []);

  const columns: any = useMemo(() => {
    return [
      { name: 'companyName', width: 200 },
      { name: 'supplierCompanyName', width: 250 },
      {
        name: 'displayDocumentNum',
        width: 160,
        renderer: ({ value, record }) => {
          const { displaySourceDocNum = '', displaySourceDocLineNum = '' } = record?.get(['displaySourceDocNum', 'displaySourceDocLineNum']) || {};
          return (
            <Button
              funcType={FuncType.link}
              color={ButtonColor.primary}
              style={{ userSelect: 'text' }}
              onClick={() => handleLinkDetail(record)}
            >
              {displaySourceDocNum ? `${displaySourceDocNum}${displaySourceDocLineNum && '-'}${displaySourceDocLineNum || ''}` : value}
            </Button>
          );
        },
      },
      { name: 'currencyCode', width: 90 },
      {
        name: 'stageNum',
        width: 120,
        renderer: ({ value, record }) => (
          <Button
            funcType={FuncType.link}
            color={ButtonColor.primary}
            style={{ userSelect: 'text' }}
            onClick={() => handleClickNum(record)}
          >
            {value}
          </Button>
        ),
      },
      { name: 'stageDesc', width: 150 },
      { name: 'stageAmount', width: 150 },
      { name: 'prepOccupyPayAmount', width: 150 },
      { name: 'prepOccupyApplyAmount', width: 150 },
      { name: 'balEnablePayAmount', width: 150 },
      { name: 'balEnableApplyAmount', width: 150 },
      { name: 'prepPaymentDate', width: 150 },
      { name: 'prepPaymentDateLast', width: 150 },
    ];
  }, [handleClickNum, handleLinkDetail]);

  return customizeTable(
    { code: CuszCode.Grid },
    <SearchBarTable
      virtual
      virtualCell
      dataSet={tableDs}
      columns={columns}
      searchCode={CuszCode.Filter}
      style={{ maxHeight: `calc(100vh - 160px)` }}
      pagination={{ maxPageSize: 1000, pageSizeOptions: ['10', '20', '50', '100', '500', '1000'] }}
      searchBarConfig={{
        expandable: !addLineFlag,
        closeFilterSelector: addLineFlag,
        left: {
          render: (_, customizeDs) => (
            <MultiTextFilter
              name="documentNums"
              dataSet={customizeDs}
              placeholder={intl
                .get('sbsm.fundPlan.view.message.enterDocumentNumQuery')
                .d('请输入条款来源单据编号查询')}
            />
          ),
        },
      }}
    />
  );
};

export default observer(StageTable);
