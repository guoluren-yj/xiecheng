import React from 'react';
import { DataSet, ModalContainer, Button } from 'choerodon-ui/pro';
import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
import { observer } from 'mobx-react-lite';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { compose } from 'lodash';
import notification from 'utils/notification';
import { getResponse, dateRangeTransform } from '@/utils/utils';
import SearchBarTable from '_components/SearchBarTable';
import { addModalDs } from './mainDS';
import { addLines } from '@/services/directPoolSupplyService';
// import './index.less';

const tenantId = getCurrentOrganizationId();
const SettlePool = (props) => {
  const { modal, afterAddLines, headerInfo, customizeTable } = props;

  const [isRemoveTrue, setRemoveTrue] = React.useState({}); // 默认租户不更改暂挂默认值

  const [addLoading, setAddLoading] = React.useState(false);

  // const [select, setSelect] = React.useState([]);

  const [type, setType] = React.useState('A');
  const tableDS = React.useMemo(
    () =>
      new DataSet({
        ...addModalDs(headerInfo),
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

  /**
   * 头columns
   */
  const columns = [
    {
      width: 150,
      name: 'poolNum',
    },
    {
      width: 100,
      name: 'poolStatusMeaning',
    },
    {
      width: 150,
      name: 'ruleNum',
    },
    {
      width: 150,
      name: 'netPrice',
    },
    {
      width: 150,
      name: 'amountInvoicing',
    },
    {
      width: 150,
      name: 'amountInvoice',
    },
    {
      width: 150,
      name: 'trxDate',
    },
    {
      width: 150,
      name: 'refDocNumListStr',
    },
    {
      width: 150,
      name: 'defaultInvoiceType',
    },
    {
      width: 200,
      name: 'refInvoiceNumListStr',
    },
    {
      width: 150,
      name: 'companyName',
    },
    {
      width: 150,
      name: 'supplierCompanyName',
    },
    {
      width: 150,
      name: 'item',
    },
    {
      width: 150,
      name: 'commodityNum',
    },
    {
      width: 150,
      name: 'commodityName',
    },
    {
      width: 150,
      name: 'quantity',
    },
    {
      width: 150,
      name: 'sourceDocNum',
    },
    {
      width: 150,
      name: 'sourceDocLineNum',
    },
    ['D'].includes(type) && {
      width: 150,
      name: 'errorTypeMeaning',
    },
    ['D'].includes(type) && {
      width: 150,
      name: 'errorMsg',
    },
    !['D'].includes(type) && {
      width: 120,
      title: intl.get(`ssta.directPoolSupply.view.title.operationRecord`).d('操作记录'),
      name: 'action',
      renderer: () => <a>{intl.get(`ssta.directPoolSupply.view.title.watch`).d('查看')}</a>,
    },
  ];

  const handleAdd = async () => {
    setAddLoading(true);
    const list = tableDS.selected.map((item) => item.toData());
    const res = await addLines({ list });
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
          code: 'SDIM.POOL_SUPPLY.TAB_INVOICE.GRID',
        },
        <SearchBarTable
          // ref={(ref) => {
          //   tableRef = ref;
          // }}
          searchCode="SDIM.POOL_SUPPLY.TAB_INVOICE.SEARCH_BAR"
          columns={columns}
          dataSet={tableDS}
          cacheState
          searchBarConfig={{
            closeFilterSelector: true,
            expandable: false,
            onQuery: handleQuery,
            onReset: handleReset,
            onFieldChange: handleFieldChange,
            fieldProps: {
              supplierCompanyId: { lovPara: { tenantId } },
              companyId: { lovPara: { tenantId } },
              refDocNumListStr: { lovPara: { tenantId } },
              ruleNum: { lovPara: { tenantId } },
              trxDate: {
                defaultValue: ({ record }) => dateRangeTransform(record.get('dateRange'), true),
                dynamicProps: {
                  disabled: ({ record }) =>
                    record.get('dateRange') && record.get('dateRange') !== 'ALL TIME',
                },
              },
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
    unitCode: ['SSTA.PURCHASE_POOL_LIST.BILL_GRID', 'SSTA.PURCHASER_BILL_DETAIL.ADD'],
  })
)(SettlePool);
