import React, { useContext, useMemo, useEffect } from 'react';
import { Button } from 'choerodon-ui/pro';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import type { ColumnProps } from 'choerodon-ui/pro/lib/table/interface';

import SearchBarTable from '_components/SearchBarTable';
import { statusTagRender } from '../../Components/StatusTag';

import { Store } from '../List/stores';
import { ActiveKey } from '../utils/type';
import type { StoreValueType } from '../List/stores';
import { ServiceListGridCustCode, ServiceListSearchCustCode } from '../utils/type';

interface TenderTableProps {
  privateKey: ActiveKey,
};

const ServiceTable = (props: TenderTableProps) => {
  const { privateKey } = props;
  const {
    dsMap,
    activeKey,
    handleToDetail,
    customizeTable,
    handleRecordInit,
    handleViewSyncRecord,
  } = useContext<StoreValueType>(Store);
  const tableDs = useMemo(() => dsMap[privateKey], [dsMap, privateKey]);

  useEffect(() => {
    handleRecordInit(privateKey);
  }, [privateKey, handleRecordInit]);

  const diffColumns = useMemo<Record<string, ColumnProps[]>>(() => {
    const statusProps: ColumnProps = {
      name: 'serverFeesStatus',
      width: 120,
      renderer: statusTagRender,
    };
    const paymentStatusProps: ColumnProps = {
      name: 'serverFeesPaymentStatus',
      width: 150,
      renderer: statusTagRender,
    };
    const invoiceStatusProps: ColumnProps = {
      name: 'serverFeesInvoiceStatus',
      width: 150,
      renderer: statusTagRender,
    };
    const serviceNumProps: ColumnProps = {
      name: 'serverFeesNum',
      width: 180,
      renderer: ({ value, record }) => (
        <Button
          funcType={FuncType.link}
          color={ButtonColor.primary}
          style={{ userSelect: 'text' }}
          onClick={() => handleToDetail(record?.get('serverFeesId'), 'service')}
        >
          {value}
        </Button>
      ),
    };
    return {
      [ActiveKey.ServiceAll]: [
        statusProps,
        serviceNumProps,
        paymentStatusProps,
        invoiceStatusProps,
      ],
      // [ActiveKey.ServicePay]: [paymentStatusProps, serviceNumProps],
      // [ActiveKey.ServiceInv]: [invoiceStatusProps, serviceNumProps],
    };
  }, [handleToDetail]);

  const columns = useMemo<ColumnProps[]>(() => {
    return [
      ...(diffColumns[activeKey] || diffColumns[ActiveKey.ServiceAll]),
      {
        name: 'sourceDocumentTypeMeaning',
        width: 120,
      },
      {
        name: 'sourceDocumentNum',
        width: 180,
      },
      {
        name: 'sourceDocumentTitle',
        width: 180,
      },
      {
        name: 'companyName',
        width: 180,
      },
      {
        name: 'supplierCompanyName',
        width: 180,
      },
      {
        name: 'currencyCode',
        width: 80,
      },
      {
        name: 'amount',
        width: 120,
      },
      {
        name: 'paidAmount',
        width: 120,
      },
      (activeKey === ActiveKey.ServiceAll && {
        name: 'syncStatus',
        width: 100,
        renderer: (rendererProps) => {
          const { record } = rendererProps;
          return statusTagRender({
            ...rendererProps,
            icon: 'wysiwyg',
            onClick: () => handleViewSyncRecord(record, 'service'),
          });
        },
      }) as any,
    ];
  }, [activeKey, diffColumns, handleViewSyncRecord]);

  return (
    <div style={{ height: 'calc(100vh - 260px)' }}>
      {customizeTable(
        { code: ServiceListGridCustCode[privateKey] },
        <SearchBarTable
          cacheState
          customizable
          dataSet={tableDs}
          columns={columns}
          searchCode={ServiceListSearchCustCode[privateKey]}
          style={{ maxHeight: 'calc(100% - 22px)' }}
        />
      )}
    </div>
  );
};

export default ServiceTable;
