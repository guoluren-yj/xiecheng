import React from 'react';
import { DataSet, ModalContainer, Button } from 'choerodon-ui/pro';
import { Tag } from 'choerodon-ui';
import intl from 'utils/intl';
import { observer } from 'mobx-react-lite';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { compose } from 'lodash';
import notification from 'utils/notification';
import { decimalPointAccuracy } from '@/routes/utils';
import { getResponse, amountLocalRender, dateRangeTransform } from '@/utils/utils';
import { flagRender } from '@/utils/renderer';
import SearchBarTable from '_components/SearchBarTable';
import { getCurrentOrganizationId } from 'utils/utils';
import { addModalDs as tableDs } from './mainDS';
import { addLines } from '@/services/reconciliationWorkbenchService';

const SettlePool = (props) => {
  const { modal, afterAddLines, viewLineDetail, headerInfo, customizeTable } = props;

  const [type, setType] = React.useState('A');
  const [isRemoveTrue, setRemoveTrue] = React.useState({}); // 默认租户不更改暂挂默认值

  const [addLoading, setAddLoading] = React.useState(false);

  const tenantId = getCurrentOrganizationId();

  const tableDS = React.useMemo(
    () =>
      new DataSet({
        ...tableDs(),
      }),
    []
  );

  React.useEffect(() => {
    // 给查询表单添加监控事件
    setType('B');
    // tableDS.queryDataSet.addEventListener('update', changeQueryData);
    tableDS.setQueryParameter('type', 'B');
    tableDS.setQueryParameter('companyId', headerInfo.companyId);
    tableDS.setQueryParameter('supplierCompanyId', headerInfo.supplierCompanyId);
    tableDS.setQueryParameter('currencyCode', headerInfo.currencyCode);
  }, []);

  // React.useEffect(() => {
  //   if (tableRef) {
  //     tableRef.tableStore.width = document.body.clientWidth;
  //     // tableRef.forceUpdate();
  //   }
  // }, [type]);

  /**
   * 头columns
   */
  const columns = [
    type !== 'E' && {
      name: 'settleNum',
      width: 200,
      renderer: ({ record, value }) => {
        return (
          <a
            onClick={() => {
              viewLineDetail(record);
            }}
          >
            {value}
          </a>
        );
      },
    },
    type === 'E' && {
      name: 'errorSettleNum',
      width: 200,
      renderer: ({ record, value }) => {
        return (
          <a
            onClick={() => {
              viewLineDetail(record);
            }}
          >
            {value}
          </a>
        );
      },
    },
    {
      name: 'souceSettleAndLineNum',
      width: 180,
    },
    {
      width: 180,
      name: 'companyName',
    },
    {
      width: 150,
      name: 'supplierCompanyName',
    },
    {
      width: 120,
      name: 'currencyCode',
    },
    {
      width: 120,
      name: 'itemName',
    },
    {
      name: 'quantity',
      width: 120,
      align: 'right',
      renderer: amountLocalRender,
    },
    type === 'A' && {
      width: 120,
      name: 'taxIncludedAmount',
      align: 'right',
      renderer: ({ value, record }) => {
        return decimalPointAccuracy(value, record?.get('amountPrecision'), {
          repair: true,
          check: true,
        });
      },
    },
    type === 'A' && {
      width: 120,
      name: 'billStatusMeaning',
      renderer: ({ record, value }) => {
        return (
          <Tag
            color={
              record.get('billStatus') === 'NO_BILL'
                ? '#cac5c5'
                : record.get('billStatus') === 'BILLING'
                ? '#29bece'
                : 'orange'
            }
          >
            {value}
          </Tag>
        );
      },
    },
    type === 'A' && {
      width: 120,
      name: 'invoiceStatusMeaning',
      renderer: ({ record, value }) => {
        return (
          <Tag
            color={
              record.get('invoiceStatus') === 'NO_INVOICE'
                ? '#cac5c5'
                : record.get('invoiceStatus') === 'INVOICING'
                ? '#29bece'
                : 'orange'
            }
          >
            {value}
          </Tag>
        );
      },
    },
    type === 'A' && {
      width: 120,
      name: 'paymentStatusMeaning',
      renderer: ({ record, value }) => {
        return (
          <Tag
            color={
              record.get('paymentStatus') === 'UNPAID'
                ? '#cac5c5'
                : record.get('paymentStatus') === 'PAYING'
                ? '#29bece'
                : 'orange'
            }
          >
            {value}
          </Tag>
        );
      },
    },
    (type === 'B' || type === 'C') && {
      width: 150,
      name: 'netPrice',
      align: 'right',
      renderer: amountLocalRender,
    },
    (type === 'B' || type === 'C') && {
      name: 'unitPriceBatch',
      width: 150,
      align: 'right',
      renderer: amountLocalRender,
    },
    (type === 'B' || type === 'C') && {
      name: 'netAmount',
      width: 150,
      align: 'right',
      renderer: ({ value, record }) => {
        return decimalPointAccuracy(value, record?.get('amountPrecision'), {
          repair: true,
          check: true,
        });
      },
    },
    (type === 'B' || type === 'C') && {
      width: 150,
      name: 'taxRate',
      align: 'right',
    },
    (type === 'B' || type === 'C') && {
      width: 150,
      name: 'taxAmount',
      align: 'right',
      renderer: ({ value, record }) => {
        return decimalPointAccuracy(value, record?.get('amountPrecision'), {
          repair: true,
          check: true,
        });
      },
    },
    (type === 'B' || type === 'C') && {
      width: 150,
      name: 'taxIncludedPrice',
      align: 'right',
      renderer: amountLocalRender,
    },
    (type === 'B' || type === 'C') && {
      width: 150,
      name: 'taxIncludedAmount',
      align: 'right',
      renderer: ({ value, record }) => {
        return decimalPointAccuracy(value, record?.get('amountPrecision'), {
          repair: true,
          check: true,
        });
      },
    },
    type === 'D' && {
      width: 150,
      name: 'receivedAmount',
      align: 'right',
      renderer: ({ value, record }) => {
        return decimalPointAccuracy(value, record?.get('amountPrecision'), {
          repair: true,
          check: true,
        });
      },
    },
    type === 'D' && {
      width: 150,
      name: 'receivableAmount',
      align: 'right',
      renderer: ({ value, record }) => {
        return decimalPointAccuracy(value, record?.get('amountPrecision'), {
          repair: true,
          check: true,
        });
      },
    },
    type === 'E' && {
      width: 150,
      name: 'errorTypeMeaning',
    },
    type === 'E' && {
      width: 150,
      name: 'errorMsg',
    },
    type === 'B' && {
      width: 100,
      name: 'priceSourceMeaning',
    },
    type === 'B' && {
      width: 100,
      name: 'sourceUnitPriceBatch',
      align: 'right',
    },
    type === 'B' && {
      width: 100,
      name: 'libPrice',
      align: 'right',
    },
    type === 'B' && {
      width: 100,
      name: 'priceActionMeaning',
    },
    type === 'B' && {
      width: 100,
      name: 'priceTime',
    },
    type === 'B' && {
      width: 100,
      name: 'sourceNetPrice',
      align: 'right',
      renderer: amountLocalRender,
    },
    type === 'B' && {
      width: 100,
      name: 'sourceTaxIncludedPrice',
      align: 'right',
      renderer: amountLocalRender,
    },
    type === 'B' && {
      width: 100,
      name: 'libUnitPriceBatch',
      align: 'right',
    },
    type === 'B' && {
      width: 100,
      name: 'libPriceFlag',
      renderer: ({ record }) => flagRender(record.get('libPriceFlag')),
    },
    type !== 'A' &&
      type !== 'E' && {
        width: 100,
        name: 'supplierSiteCode',
      },
  ];

  const handleAdd = async () => {
    setAddLoading(true);
    const { billHeaderId } = headerInfo;
    const res = await addLines({ list: tableDS.toJSONData(), billHeaderId, camp: 'SUPPLIER' });
    setAddLoading(false);
    if (getResponse(res)) {
      notification.success();
      modal.close();
      afterAddLines();
    }
  };

  const handleReset = () => {
    tableDS.reParams = {};
    setRemoveTrue({});
  };

  const handleFieldChange = ({ value, name, record }) => {
    if (name === 'dateRange') {
      record.set('trxDate', dateRangeTransform(value, true));
    } else if (name === 'billRemoveFlag') {
      setRemoveTrue({
        ...isRemoveTrue,
        B: Number(value) === 1,
      });
    } else if (name === 'purOrganizationId') {
      record.set('purOrganizationId', value?.purchaseOrgId);
      tableDS.reParams = {
        purchaseOrgId: value?.purchaseOrgId,
      };
    }
  };

  /**
   * 筛选器查询回调
   */
  const handleQuery = ({ params }) => {
    const reParams = tableDS.reParams || {};
    tableDS.queryDataSet.loadData([{ ...params, ...reParams }]);
    tableDS.query();
  };

  const Btns = observer(({ ds }) => {
    const { selected } = ds;
    return (
      <div className="ssta-body-footer">
        <Button
          disabled={selected && selected.length === 0}
          onClick={handleAdd}
          color="primary"
          loading={addLoading}
        >
          {intl.get('hzero.common.button.add').d('新增')}
        </Button>
        <Button onClick={modal.close}>{intl.get('hzero.common.button.cancel').d('取消')}</Button>
      </div>
    );
  });

  return (
    <>
      {customizeTable(
        {
          code: 'SSTA.SUPPLY_POOL_LIST.BILL_GRID',
        },
        <SearchBarTable
          searchCode="SSTA.SUPPLIER_BILL_DETAIL.ADD"
          columns={columns}
          dataSet={tableDS}
          style={{ maxHeight: 360 }}
          maxPageSize={1000}
          pagination={{ pageSizeOptions: ['10', '50', '100', '500', '1000'] }}
          spin={addLoading ? { spinning: addLoading } : {}}
          searchBarConfig={{
            closeFilterSelector: true,
            expandable: false,
            onQuery: handleQuery,
            onReset: handleReset,
            onFieldChange: handleFieldChange,
            fieldProps: {
              settleConfigNum: { lovPara: { tenantId } },
              trxDate: {
                defaultValue: ({ record }) => dateRangeTransform(record.get('dateRange'), true),
                dynamicProps: {
                  disabled: ({ record }) =>
                    record.get('dateRange') && record.get('dateRange') !== 'ALL TIME',
                },
              },
              supplierSiteId: {
                dynamicProps: {
                  disabled: () => !headerInfo.supplierCompanyId,
                  lovPara: () => ({
                    supplierId: headerInfo.supplierCompanyId,
                    tenantId,
                  }),
                },
              },
            },
            editorProps: {
              billRemoveFlag: { clearButton: false },
              displayReverseFlag: { clearButton: false },
            },
          }}
        />
      )}
      <Btns ds={tableDS} />
      <ModalContainer location={location} />
    </>
  );
};

export default compose(
  withCustomize({
    unitCode: ['SSTA.SUPPLY_POOL_LIST.BILL_GRID', 'SSTA.SUPPLIER_BILL_DETAIL.ADD'],
  })
)(SettlePool);
