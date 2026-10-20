import React, { useMemo, useEffect, useContext, useCallback, useRef } from 'react';
import { useModal } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import SearchBarTable from '_components/SearchBarTable';
import { math } from 'choerodon-ui/dataset';

import { useModalOpen } from '../hooks';
import { Store } from '../Detail/StoreProvider';
import { dateRangeTransform } from '@/utils/utils';
import PrePayWriteOffModal from './PrePayWriteOffModal';
import { statusTagRender } from '@/routes/Components/StatusTag';
import MultiTextFilter from '@/routes/Components/MultiTextFilter';

const tenantId = getCurrentOrganizationId();

const QuoteInvoice = () => {
  const { quoteInvoiceDs, customizeTable } = useContext(Store);
  const modal = useModal();
  const modalOpen = useModalOpen(modal);
  const searchBarRef = useRef({});

  useEffect(() => {
    quoteInvoiceDs.addEventListener('update', handleUpdate);
    return () => {
      quoteInvoiceDs.removeEventListener('update', handleUpdate);
    };
  }, [quoteInvoiceDs]);

  const handleUpdate = ({ value, record, name }) => {
    if (name === 'paymentAmount' && (value || value === 0)) {
      record.set('paymentAmount', math.toFixed(value, Number(record.get('amountPrecision'))));
    }
  };

  const handleFieldChange = ({ value, name, record }) => {
    if (name === 'creationDateRange') {
      record.set('creationDate', dateRangeTransform(value, true));
    }
  };

  const columns = useMemo(
    () => [
      {
        name: 'settleNum',
        width: 180,
      },
      {
        width: 120,
        name: 'settleTypeMeaning',
      },
      {
        name: 'companyName',
        width: 250,
      },
      {
        name: 'supplierCompanyName',
        width: 250,
      },
      {
        name: 'currencyCode',
        width: 120,
      },
      {
        name: 'netAmount',
        width: 120,
      },
      {
        name: 'taxAmount',
        width: 120,
      },
      {
        name: 'taxIncludedAmount',
        width: 120,
      },
      {
        name: 'paidAmount',
        width: 120,
      },
      {
        name: 'remainingPaymentAmount',
        width: 120,
      },
      {
        width: 120,
        name: 'paymentAmount',
        editor: true,
      },
      {
        width: 150,
        name: 'applyAmount',
      },
      {
        name: 'creationDate',
        width: 150,
      },
      {
        name: 'createdUserName',
        width: 120,
      },
      {
        name: 'campMeaning',
        width: 120,
      },
      {
        name: 'preColWriteOff',
        title: intl.get(`ssta.supplySettle.button.preColWriteOff`).d('预收款核销'),
        width: 120,
        renderer: ({ record }) =>
          record.get('taxIncludedAmount') > 0 ? (
            <a onClick={() => handlePrePayWriteOff(record)}>
              {intl.get(`ssta.supplySettle.button.preColWriteOff`).d('预收款核销')}
            </a>
          ) : null,
      },
      {
        name: 'predictExpectPaymentDate',
        width: 150,
      },
      {
        name: 'predictExpectPaymentDateCalculateStatus',
        width: 180,
        renderer: statusTagRender,
      },
      {
        name: 'predictExpectPaymentDateTriggerAction',
        width: 180,
      },
      {
        name: 'predictExpectPaymentDateCalculateTime',
        width: 180,
      },
      {
        name: 'predictExpectPaymentDateCalculateErrorMsg',
        width: 200,
      },
    ],
    [handlePrePayWriteOff]
  );

  const handlePrePayWriteOff = useCallback(
    (record) => {
      modalOpen({
        size: 'large',
        editFlag: true,
        title: intl.get(`ssta.supplySettle.view.title.preColWriteOff`).d('预收款核销'),
        children: <PrePayWriteOffModal topRecord={record} isModalEdit source="quoteInvoice" />,
      });
    },
    [modalOpen]
  );

  return (
    <div style={{ height: 'calc(100vh - 220px)' }}>
      {customizeTable(
        {
          code: 'SSTA.SUPPLY_SETTLE_LIST.BASE_INVOICE_CREATE',
        },
        <SearchBarTable
          searchCode="SSTA.SUPPLY_SETTLE_LIST.SEARCH_BASE_INV"
          dataSet={quoteInvoiceDs}
          columns={columns}
          queryBar="none"
          searchBarRef={(ref) => {
            searchBarRef.current = ref;
          }}
          searchBarConfig={{
            onFieldChange: handleFieldChange,
            fieldProps: {
              supplierCompanyId: { lovPara: { tenantId } },
              currencyCode: { lovPara: { tenantId } },
              settleConfigNum: { lovPara: { tenantId } },
              creationDate: {
                defaultValue: ({ record }) =>
                  dateRangeTransform(record.get('creationDateRange'), true),
                dynamicProps: {
                  disabled: ({ record }) =>
                    record.get('creationDateRange') &&
                    record.get('creationDateRange') !== 'ALL TIME',
                },
              },
            },
            left: {
              render: (_, customizeDs) => (
                <div>
                  <MultiTextFilter
                    name="settleNums"
                    dataSet={customizeDs}
                    placeholder={intl
                      .get('ssta.supplySettle.modal.settleNum')
                      .d('请输入结算单编号查询')}
                  />
                </div>
              ),
            },
          }}
          style={{ maxHeight: `calc(100% - 20px)` }}
        />
      )}
    </div>
  );
};

export default QuoteInvoice;
