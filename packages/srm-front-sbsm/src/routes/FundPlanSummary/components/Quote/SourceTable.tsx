import { stringify } from 'querystring';
import React, { useMemo, useCallback, useEffect } from 'react';
import { observer } from 'mobx-react';
import type { DataSet } from 'choerodon-ui/pro';
import { Button, Modal } from 'choerodon-ui/pro';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';

import intl from 'utils/intl';
import { openTab } from 'utils/menuTab';
import SearchBarTable from '_components/SearchBarTable';

import { CreateSourceCode, LineAddSourceCode } from '../../utils/type';
import Detail from '../../../FundPlanPrefabrication/Detail';
import styles from '../../../../common.less';
import MultiTextFilter from '../../../../components/MultiTextFilter';

interface SourceTableProps {
  tableDs: DataSet;
  customizeTable: any;
  source: 'create' | 'addLine';
}

const SourceTable = (props: SourceTableProps) => {
  const { source, tableDs, customizeTable } = props;

  const addLineFlag = source === 'addLine';
  const CuszCode = addLineFlag ? LineAddSourceCode : CreateSourceCode;

  useEffect(() => {
    tableDs.setQueryParameter('customizeUnitCode', Object.values(CuszCode).join(','));
  }, [tableDs, CuszCode]);

  const handleClickExecute = useCallback((record) => {
    Modal.open({
      drawer: true,
      closable: true,
      className: styles['sbsm-detailDrawer-modal'],
      style: {
        width: 1090,
      },
      children: <Detail recordInfo={record} viewType='SOURCE_DOCUMENT' />,
      cancelButton: false,
    });
  }, []);

  const handleLinkDetail = useCallback((record) => {
    const { prepSource, documentNum, documentId } = record?.get(['prepSource', 'documentNum', 'documentId']) || {};
    if (!documentId) return;
    if (['PRE_STAGE', 'ORDER_PRE_STAGE'].includes(prepSource)) {
      const num = (documentNum?.split('-') || [])[0] || documentNum;
      openTab({
        key: `/sodr/order-workspace/detail/all-orders/${documentId}`,
        title: intl.get('sbsm.common.view.title.orderWorkspace').d('订单工作台'),
        search: stringify({
          poSourcePlatform: num,
          openFrom: 'settle',
          isBackFlag: 0,
        }),
      });
    } else if (['INVOICE'].includes(prepSource)) {
      openTab({
        key: `/ssta/new-purchase-settle/invoice/${documentId}`,
        title: intl.get('sbsm.common.view.title.settleWorkspace').d('采购方结算单工作台'),
        search: stringify({
          source: 'sbsm',
          type: 'all',
        }),
      });
    } else if (['RCV_TRX'].includes(prepSource)) {
      openTab({
        key: `/sinv/receipt-workbench/return-detail/${documentId}`,
        title: intl.get('sbsm.common.view.title.receiptWorkspace').d('收货工作台'),
        search: stringify({
          viewType: 'flat',
        }),
      });
    }
  }, []);

  const columns: any = useMemo(() => {
    return [
      { name: 'companyName', width: 200 },
      { name: 'supplierCompanyName', width: 250 },
      { name: 'prepSource', width: 150 },
      {
        name: 'documentNum',
        width: 150,
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
      { name: 'prepSourceAmount', width: 150 },
      { name: 'prepOccupyPayAmount', width: 150 },
      { name: 'prepOccupyApplyAmount', width: 150 },
      { name: 'balEnablePayAmount', width: 150 },
      { name: 'balEnableApplyAmount', width: 150 },
      { name: 'prepPaymentDate', width: 150 },
      { name: 'prepPaymentDateLast', width: 150 },
      {
        name: 'operate',
        width: 140,
        renderer: ({ record }) => (
          <Button
            funcType={FuncType.link}
            color={ButtonColor.primary}
            style={{ userSelect: 'text' }}
            onClick={() => handleClickExecute(record)}
          >
            {intl.get('hzero.common.button.view').d('查看')}
          </Button>
        ),
      },
    ];
  }, [handleLinkDetail, handleClickExecute]);

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
                .get('sbsm.fundPlan.view.message.enterSourceNumQuery')
                .d('请输入编制来源单据编号查询')}
            />
          ),
        },
      }}
    />
  );
};

export default observer(SourceTable);
