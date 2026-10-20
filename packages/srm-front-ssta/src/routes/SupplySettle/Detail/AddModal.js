import React from 'react';
import { DataSet, Modal, Button } from 'choerodon-ui/pro';
import { Tag } from 'choerodon-ui';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { amountLocalRender, dateRangeTransform } from '@/utils/utils';
import { decimalPointAccuracy } from '@/routes/utils';
import SearchBarTable from '_components/SearchBarTable';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { compose, isNil } from 'lodash';
import { getCurrentOrganizationId } from 'utils/utils';
import DetailDrawer from './DetailDrawer';
import { addModalDS as tableDs } from '../../../stores/SupplySettleDS';
import Styles from '@/routes/common.less';
import MultiTextFilter from '@/routes/Components/MultiTextFilter';

const AddModal = (props) => {
  const { modal, addLine, headerData, documentType = 'INVOICE', customizeTable } = props;

  const [type, setType] = React.useState('A');

  const [loading, setLoading] = React.useState(false);

  const tableDS = React.useMemo(() => new DataSet(tableDs()), []);

  const tenantId = getCurrentOrganizationId();

  React.useEffect(() => {
    const param = documentType === 'INVOICE' ? 'C' : 'D';
    // 给查询表单添加监控事件
    setType(param);
    tableDS.setQueryParameter('type', param);
    tableDS.setQueryParameter('companyId', headerData.companyId);
    tableDS.setQueryParameter('supplierCompanyId', headerData.supplierCompanyId);
    tableDS.setQueryParameter('currencyCode', headerData.currencyCode);
  }, []);

  const handleFieldChange = ({ value, name, record }) => {
    if (name === 'dateRange') {
      record.set('trxDate', dateRangeTransform(value, true));
    }
  };

  /**
   * 头columns
   */
  const columns = [
    type !== 'E' && {
      name: 'settleNum',
      width: 210,
      renderer: ({ record, value }) => {
        return (
          <a
            onClick={() => {
              handleViewDetail(record);
            }}
          >
            {value}
          </a>
        );
      },
    },
    type === 'E' && {
      name: 'errorSettleNum',
      width: 210,
      renderer: ({ record, value }) => {
        return (
          <a
            onClick={() => {
              handleViewDetail(record);
            }}
          >
            {value}
          </a>
        );
      },
    },
    {
      name: 'souceSettleAndLineNum',
      width: 220,
    },
    {
      width: 220,
      name: 'companyName',
    },
    {
      width: 220,
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
      renderer: amountLocalRender,
    },
    {
      width: 120,
      name: 'invOrganizationName',
    },
    type === 'A' && {
      width: 120,
      name: 'taxIncludedAmount',
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
      renderer: amountLocalRender,
    },
    (type === 'B' || type === 'C') && {
      name: 'unitPriceBatch',
      width: 150,
      renderer: amountLocalRender,
    },
    (type === 'B' || type === 'C') && {
      name: 'netAmount',
      width: 150,
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
      renderer: ({ value, record }) => {
        return decimalPointAccuracy(value, record?.get('amountPrecision'), {
          repair: true,
          check: true,
        });
      },
    },
    (type === 'B' || type === 'C') && {
      width: 150,
      name: 'taxAmount',
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
      renderer: amountLocalRender,
    },
    (type === 'B' || type === 'C') && {
      width: 150,
      name: 'taxIncludedAmount',
      renderer: ({ value, record }) => {
        return decimalPointAccuracy(value, record?.get('amountPrecision'), {
          repair: true,
          check: true,
        });
      },
    },
    type === 'D' && {
      width: 150,
      name: 'invoiceCompletedAmount',
      renderer: ({ value, record }) => {
        return decimalPointAccuracy(value, record?.get('amountPrecision'), {
          repair: true,
          check: true,
        });
      },
    },
    type === 'D' && {
      width: 150,
      name: 'paymentOccupiedAmount',
      renderer: ({ value, record }) => {
        return decimalPointAccuracy(value, record?.get('amountPrecision'), {
          repair: true,
          check: true,
        });
      },
    },
    type === 'D' && {
      width: 150,
      name: 'ablePayAmount',
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
    type !== 'A' &&
      type !== 'E' && {
        width: 100,
        name: 'supplierSiteCode',
      },
  ];

  const handleViewDetail = (record) => {
    const title = intl.get('hzero.common.button.viewDetail').d('查看详情');
    Modal.open({
      drawer: true,
      key: Modal.key(),
      destroyOnClose: true,
      closable: true,
      title,
      className: Styles['ssta-large-second-modal'],
      children: <DetailDrawer record={record} />,
      okCancel: false,
      okText: intl.get('hzero.common.button.close').d('关闭'),
    });
  };

  const handleAdd = async () => {
    if (tableDS.selected.length) {
      setLoading(true);
      await addLine(
        tableDS.selected.map((item) => item.toData()),
        handleCancel
      );
      setLoading(false);
    } else {
      notification.warning({
        message: intl
          .get('ssta.supplySettle.view.notification.selectedEmpty')
          .d('请至少勾选一条数据'),
      });
    }
  };

  const handleCancel = () => {
    modal.close();
  };

  const code =
    documentType === 'INVOICE'
      ? 'SSTA.SUPPLY_SETTLE_DETAIL.ADD.INVOICE'
      : 'SSTA.SUPPLY_SETTLE_DETAIL.PAYMENT.ADD.LIST';
  const filterCode =
    documentType === 'INVOICE'
      ? 'SSTA.SUPPLY_SETTLE_DETAIL.SEARCH_ADD_INV'
      : 'SSTA.SUPPLY_SETTLE_DETAIL.SEARCH_ADD_PAY';

  return (
    <>
      {customizeTable(
        {
          code,
        },
        <SearchBarTable
          searchCode={filterCode}
          columns={columns}
          dataSet={tableDS}
          style={{ maxHeight: 521 }}
          maxPageSize={1000}
          pagination={{ pageSizeOptions: ['10', '50', '100', '500', '1000'] }}
          spin={loading ? { spinning: loading } : {}}
          searchBarConfig={{
            expandable: false,
            closeFilterSelector: true,
            onFieldChange: handleFieldChange,
            fieldProps: {
              settleConfigNum: { lovPara: { tenantId } },
              documentNumList: { lovPara: { tenantId, page: 0, size: 10, camp: 'SUPPLIER' } },
              trxDate: {
                defaultValue: ({ record }) => dateRangeTransform(record.get('dateRange'), true),
                dynamicProps: {
                  disabled: ({ record }) =>
                    record.get('dateRange') && record.get('dateRange') !== 'ALL TIME',
                },
              },
              supplierSiteId: {
                dynamicProps: {
                  disabled: () => isNil(headerData.supplierId),
                  lovPara: () => ({
                    supplierId: headerData.supplierId,
                    tenantId,
                  }),
                },
              },
              sourceSupplierSiteId: {
                dynamicProps: {
                  disabled: () => isNil(headerData.supplierId),
                  lovPara: () => ({
                    supplierId: headerData.supplierId,
                    tenantId,
                  }),
                },
              },
            },
            editorProps: {
              allRemoveFlag: { clearButton: false },
              billRemoveFlag: { clearButton: false },
              invoiceRemoveFlag: { clearButton: false },
              paymentRemoveFlag: { clearButton: false },
              displayReverseFlag: { clearButton: false },
              documentNumList: {
                noCache: true,
                searchable: true,
                searchMatcher: 'meaning',
              },
            },
            left: {
              render: (_, customizeDs) => (
                <MultiTextFilter
                  name={type === 'E' ? 'errorSettleNums' : 'settleNums'}
                  dataSet={customizeDs}
                  placeholder={intl
                    .get('ssta.purchaseSettlePool.modal.settleNum')
                    .d('请输入结算事务编号')}
                />
              ),
            },
          }}
        />
      )}
      <div className="ssta-body-footer">
        <Button onClick={handleAdd} color="primary" loading={loading}>
          {intl.get('hzero.common.button.add').d('新增')}
        </Button>
        <Button onClick={handleCancel}>{intl.get('hzero.common.button.cancel').d('取消')}</Button>
      </div>
    </>
  );
};

export default compose(
  withCustomize({
    unitCode: [
      'SSTA.SUPPLY_SETTLE_DETAIL.SEARCH_ADD_INV',
      'SSTA.SUPPLY_SETTLE_DETAIL.SEARCH_ADD_PAY',
      'SSTA.SUPPLY_SETTLE_DETAIL.PAYMENT.ADD.LIST',
      'SSTA.SUPPLY_SETTLE_DETAIL.ADD.INVOICE',
    ],
  })
)(AddModal);
