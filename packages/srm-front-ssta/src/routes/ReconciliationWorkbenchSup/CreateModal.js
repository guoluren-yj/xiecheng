/* eslint-disable camelcase */
import React, { useRef, Fragment, useMemo, useCallback } from 'react';
import { DataSet, Modal } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';
import { compose, isNil } from 'lodash';
import queryString from 'querystring';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { Header, Content } from 'components/Page';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import SearchBarTable from '_components/SearchBarTable';
import DynamicButtons from '_components/DynamicButtons';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import { flagRender } from '@/utils/renderer';
import { getPermissions } from '@/routes/Components/Permission';
import CommonImport from 'components/Import';
import formatterCollections from 'utils/intl/formatterCollections';
import {
  dateRangeTransform,
  getResponse,
  transformQselectDate,
  transformSupplierData,
} from '@/utils/utils';
import { tableDS } from '@/stores/SupplySettlePoolDS';
import MultiTextFilter from '../Components/MultiTextFilter';
import {
  createSupplyBill,
  allCreate,
  getPriceAndcreateSupplierBill,
} from '../../services/settlePoolServices';

const prefix = 'ssta.supplySettlePool';
const customizeUnitCode = 'SSTA.SUPPLY_POOL_LIST.BILL_GRID,SSTA.SUPPLY_POOL_LIST.SEARCH_BAR_BILL';
const permPrefix = 'srm.settle-account.settle-pool.supply.ps';
const AddModal = (props) => {
  const {
    customizeTable,
    modal,
    ds,
    history,
    cuxProps, // 供二开埋点使用
    location: { pathname },
    customizeBtnGroup,
    remote,
  } = props;
  const isNew = pathname.indexOf('new') > -1;
  const isPage = pathname === '/ssta/new-reconciliation-workbench-supplier/create-steps';
  const detailUrl = isNew
    ? '/ssta/new-reconciliation-workbench-supplier/detail'
    : '/ssta/reconciliation-workbench-supplier/detail';

  const [isRemoveTrue, setRemoveTrue] = React.useState({});
  const [permsMap, setPermsMap] = React.useState(new Map());

  const tableDs = React.useMemo(() => new DataSet(tableDS()), []);
  const tenantId = getCurrentOrganizationId();

  const searchBarRef = useRef({});

  React.useEffect(() => {
    tableDs.setQueryParameter('type', 'B');
    tableDs.setQueryParameter('customizeUnitCode', customizeUnitCode);
    fetchPermissions();
  }, [tableDs]);

  React.useEffect(() => {
    if (remote) {
      remote.event.fireEvent('onInit', { tableDs, cuxProps });
    }
  }, [remote, tableDs, cuxProps]);

  /**
   * 手动查询权限集
   */
  const fetchPermissions = async () => {
    const res = getResponse(
      await getPermissions([
        `${permPrefix}.batch.import`,
        `${permPrefix}.newimport`,
        'srm.settle-account.reconciliation-workbench.ux-supplier.ps.allcreate',
        `srm.settle-account.reconciliation-workbench.ux-supplier.button.priceAndcreate`,
      ])
    );
    if (res) {
      setPermsMap(res);
    }
  };

  const handleAdd = async () => {
    if (tableDs.selected.length > 0) {
      // 埋点校验通过之后的操作
      const handleContinueAddAfterValidate = async () => {
        const selectData = tableDs.toJSONData();
        tableDs.status = 'loading';
        const res = getResponse(await createSupplyBill(selectData));
        tableDs.status = 'ready';
        if (!res) return;
        notification.success();
        const billList = res.map((item) => {
          return {
            billHeaderId: item.billHeaderId,
            billNum: item.billNum,
          };
        });
        history.push({
          pathname: detailUrl,
          search: queryString.stringify({
            editFlag: 1,
            billList: JSON.stringify(billList),
            action: 'UPDATE',
            source: 'create',
          }),
        });
        tableDs.clearCachedSelected();
        handleCancel();
      };
      if (remote?.event) {
        const beforeCreateBillRes = await remote.event.fireEvent('beforeCreateBillSup', {
          tableDs,
          cuxProps,
          handleContinueAddAfterValidate,
        });
        if (beforeCreateBillRes === false) return false;
      }
      await handleContinueAddAfterValidate();
    } else {
      const confirmRes = await Modal.confirm({
        title: intl.get('ssta.common.view.title.tip').d('提示'),
        children: intl
          .get(`ssta.common.view.confirm.selectTotalCountSettleAffairToCreate`, {
            count: tableDs.totalCount > 1000 ? '1000+' : tableDs.totalCount,
          })
          .d('您已选择全部结算事务，共 {count} 条，请确认是否新建'),
      });
      if (confirmRes !== 'ok') return;
      const queryData = getQueryData() || {};
      const { supplierCompanyId } = queryData;
      tableDs.status = 'loading';
      if (remote?.event) {
        const beforeCreateBillRes = await remote.event.fireEvent('beforeAllCreateBill', {
          queryData,
          cuxProps,
        });
        if (beforeCreateBillRes === false) return false;
      }
      const res = getResponse(
        await allCreate({
          type: 'B',
          role: 'supplier',
          query: {
            ...queryData,
            ...transformSupplierData(supplierCompanyId),
          },
        })
      );
      tableDs.status = 'ready';
      if (res) {
        notification.success({
          message: intl
            .get('ssta.common.create.all.success')
            .d(
              '单据后台处理中，操作失败的单据，将通过系统消息展示失败原因，并重新展示在维护列表中'
            ),
        });
        handleCancel();
        if (ds) ds.query();
      }
    }
  };
  const getPriceAndCreate = async () => {
    const queryData = getQueryData() || {};
    const { supplierCompanyId } = queryData;
    let selectData = [];
    if (tableDs.selected.length > 0) {
      selectData = tableDs.toJSONData();
    }
    tableDs.status = 'loading';
    const res = getResponse(
      await getPriceAndcreateSupplierBill(selectData, {
        ...queryData,
        ...transformSupplierData(supplierCompanyId),
      })
    );
    tableDs.status = 'ready';
    if (res) {
      if (res.length > 0) {
        notification.success();
        const billList = res.map((item) => {
          return {
            billHeaderId: item.billHeaderId,
            billNum: item.billNum,
          };
        });
        history.push({
          pathname: detailUrl,
          search: queryString.stringify({
            editFlag: 1,
            billList: JSON.stringify(billList),
            action: 'UPDATE',
            source: 'create',
          }),
        });
        tableDs.clearCachedSelected();
        handleCancel();
      } else {
        notification.info({
          message: intl
            .get(`ssta.billSheet.view.message.syncTips`)
            .d(
              '后台取价及创建中，操作失败的单据，将通过系统消息展示失败原因，并重新展示在维护列表中。'
            ),
        });
        handleCancel();
      }
    } else {
      // 如果报错也需要刷新，后端会把取价报错信息写入字段里
      await tableDs.query();
    }
  };
  const getQueryData = () => {
    const queryDsData = tableDs.queryDataSet.current?.toData() || {};
    const { companyId_range: companyIdRange } = queryDsData || {};
    return filterNullValueObject({
      ...queryDsData,
      companyIdsStr: companyIdRange,
      customizeUnitCode,
      ...transformQselectDate(queryDsData, { dateRange: 'trxDate' }),
    });
  };

  const handleCancel = () => {
    modal.close();
  };

  const columns = React.useMemo(() => {
    const normalColumns = [
      {
        name: 'settleNum',
        width: 200,
      },
      {
        name: 'souceSettleAndLineNum',
        width: 180,
      },
      {
        width: 160,
        name: 'companyName',
        title: intl.get(`${prefix}.model.supplySettlePool.accountClientCompany`).d('对账客户公司'),
      },
      {
        width: 160,
        name: 'invOrganizationName',
      },
      {
        width: 220,
        name: 'supplierCompanyName',
        title: intl
          .get(`${prefix}.model.supplySettlePool.accountSupplierCompany`)
          .d('对账供应商公司'),
      },
      {
        width: 80,
        name: 'currencyCode',
      },
      {
        width: 120,
        name: 'itemName',
      },
      {
        width: 120,
        name: 'quantity',
        title: intl.get(`${prefix}.model.supplySettlePool.accountQuantity`).d('可对账数量'),
      },
      {
        width: 150,
        name: 'netPrice',
      },
      {
        name: 'unitPriceBatch',
        width: 150,
      },
      {
        name: 'netAmount',
        width: 150,
        title: intl
          .get(`${prefix}.model.supplySettlePool.accountAmountExcludingTax`)
          .d('可对账金额(不含税)'),
      },
      {
        width: 150,
        name: 'taxCode',
      },
      {
        width: 150,
        name: 'taxRate',
      },
      {
        width: 150,
        name: 'taxAmount',
        align: 'right',
      },
      {
        width: 150,
        name: 'taxIncludedPrice',
      },
      {
        width: 150,
        name: 'taxIncludedAmount',
        align: 'right',
        title: intl
          .get(`${prefix}.model.supplySettlePool.accountAmountIncludingTax`)
          .d('可对账金额(含税)'),
      },
      {
        width: 100,
        name: 'priceSourceMeaning',
      },
      {
        width: 100,
        name: 'sourceUnitPriceBatch',
      },
      {
        width: 100,
        name: 'libPrice',
      },
      {
        width: 100,
        name: 'priceActionMeaning',
      },
      {
        width: 100,
        name: 'priceTime',
      },
      {
        width: 100,
        name: 'sourceNetPrice',
      },
      {
        width: 100,
        name: 'sourceTaxIncludedPrice',
      },
      {
        width: 100,
        name: 'libUnitPriceBatch',
      },
      {
        width: 100,
        name: 'takePriceStatusMeaning',
      },
      {
        width: 100,
        name: 'libPriceFlag',
        renderer: ({ record }) => flagRender(record.get('libPriceFlag')),
      },
      {
        width: 100,
        name: 'collaborativeModeCode',
        renderer: (records) => {
          const { record } = records;
          return record.get('collaborativeModeCodeMeaning')
            ? record.get('collaborativeModeCodeMeaning')
            : '-';
        },
      },
      {
        width: 100,
        name: 'supplierSiteCode',
      },
      {
        width: 100,
        name: 'ouName',
      },
      {
        width: 100,
        name: 'multiDealTrxNum',
      },
      {
        width: 100,
        name: 'multiDealPoNum',
      },
      {
        width: 100,
        name: 'multiDealTrxLineNum',
      },
      {
        width: 100,
        name: 'multiDealPoLineNum',
      },
    ];
    return remote
      ? remote.process('SSTA.SUPPLIER_BILL_LIST_CUX.CREATE_COLUMNS', normalColumns, {
          cuxProps,
        })
      : normalColumns;
  }, [cuxProps, remote]);

  const handleReset = useCallback(() => {
    // eslint-disable-next-line no-unused-expressions
    tableDs.queryDataSet?.current?.reset();
    setRemoveTrue({});
  }, [tableDs, setRemoveTrue]);

  const handleFieldChange = useCallback(
    ({ value, name, record }) => {
      if (name === 'dateRange') {
        record.set('trxDate', dateRangeTransform(value, true));
      } else if (name === 'billRemoveFlag') {
        setRemoveTrue({
          ...isRemoveTrue,
          B: Number(value) === 1,
        });
      }
    },
    [isRemoveTrue]
  );

  /**
   * 筛选器查询回调
   */
  const handleQuery = useCallback(
    ({ params }) => {
      // eslint-disable-next-line no-unused-expressions
      tableDs.queryDataSet.loadData([params]);
      tableDs.query();
    },
    [tableDs]
  );

  const searchBarConfig = useMemo(() => {
    const normalConfig = {
      onQuery: handleQuery,
      onReset: handleReset,
      onFieldChange: handleFieldChange,
      onClear: handleReset,
      fieldProps: {
        supplierCompanyId: { lovPara: { tenantId } },
        currencyCode: { lovPara: { organizationId: tenantId } },
        settleConfigNum: { lovPara: { tenantId } },
        documentNumList: { lovPara: { tenantId, page: 0, size: 10 } },
        trxDate: {
          defaultValue: ({ record }) => dateRangeTransform(record.get('dateRange'), true),
          dynamicProps: {
            disabled: ({ record }) =>
              record.get('dateRange') && record.get('dateRange') !== 'ALL TIME',
          },
        },
        supplierSiteId: {
          dynamicProps: {
            disabled: ({ record }) => isNil(record.get('supplierCompanyId')?.supplierId),
            lovPara: ({ record }) => ({
              supplierId: record.get('supplierCompanyId')?.supplierId,
              tenantId,
            }),
          },
        },
        sourceSupplierSiteId: {
          dynamicProps: {
            disabled: ({ record }) => isNil(record.get('supplierCompanyId')?.supplierId),
            lovPara: ({ record }) => ({
              supplierId: record.get('supplierCompanyId')?.supplierId,
              tenantId,
            }),
          },
        },
      },
      editorProps: {
        billRemoveFlag: { clearButton: false },
        documentNumList: {
          noCache: true,
          searchable: true,
          searchMatcher: 'meaning',
        },
      },
      left: {
        render: (_, customizeDs) => (
          <MultiTextFilter
            name="settleNums"
            dataSet={customizeDs}
            placeholder={intl
              .get('ssta.purchaseSettlePool.modal.settleNum')
              .d('请输入结算事务编号')}
          />
        ),
      },
    };
    return remote
      ? remote.process('SSTA.SUPPLIER_BILL_LIST_CUX.CREATE_SEARCH_BAR_CONFIG', normalConfig, {
          cuxProps,
        })
      : normalConfig;
  }, [remote, cuxProps, tenantId, handleReset, handleQuery, handleFieldChange]);

  const trxTableRender = () => {
    return customizeTable(
      {
        code: 'SSTA.SUPPLY_POOL_LIST.BILL_GRID',
      },
      <SearchBarTable
        searchCode="SSTA.SUPPLY_POOL_LIST.SEARCH_BAR_BILL"
        columns={columns}
        dataSet={tableDs}
        style={{ maxHeight: `calc(100% - 20px)` }}
        searchBarRef={(ref) => {
          searchBarRef.current = ref;
        }}
        searchBarConfig={searchBarConfig}
      />
    );
  };
  const handleRoleImport = () => {
    const perCode = 'SSTA.SETTLE_POOL_BILL_CREATE';
    const url = isNew
      ? '/ssta/new-reconciliation-workbench-supplier/data-import-create'
      : '/ssta/reconciliation-workbench-supplier/data-import-create';
    history.push({
      pathname: `${url}/${perCode}`,
      search: queryString.stringify({
        backPath: isNew
          ? `/ssta/new-reconciliation-workbench-supplier/list`
          : `/ssta/reconciliation-workbench-supplier/list`,
        action: intl.get('ssta.common.title.batchImport').d('批量导入'),
        historyButton: false,
        args: JSON.stringify({
          camp: 'SUPPLIER',
          templateCode: perCode,
          tenantId,
        }),
      }),
    });
  };

  const btns = () => {
    const loading = tableDs.status !== 'ready';
    return [
      {
        name: 'selectedCreate',
        child: intl.get(`ssta.common.button.selectedCreate`).d('勾选新建'),
        btnProps: {
          color: 'primary',
          disabled: tableDs.selected.length === 0,
          onClick: () => handleAdd(),
          loading,
          wait: 1500,
        },
      },
      permsMap.get(`srm.settle-account.reconciliation-workbench.ux-supplier.ps.allcreate`) && {
        name: 'allCreate',
        child: intl.get(`ssta.common.button.allCreate`).d('全选新建'),
        btnProps: {
          onClick: () => handleAdd(),
          loading,
          funcType: 'raised',
          wait: 1500,
        },
      },
      permsMap.get(
        `srm.settle-account.reconciliation-workbench.ux-supplier.button.priceAndcreate`
      ) && {
        name: 'priceAndcreate',
        child: intl.get(`ssta.common.button.price.create`).d('取价并创建'),
        btnProps: {
          onClick: () => getPriceAndCreate(),
          loading,
          funcType: 'raised',
          wait: 1500,
        },
      },
      permsMap.get(`${permPrefix}.batch.import`) && {
        name: 'importCreate',
        child: intl.get(`ssta.common.button.importCreate`).d('导入新建'),
        btnProps: {
          onClick: () => handleRoleImport(),
          loading,
          funcType: 'raised',
        },
      },
      permsMap.get(`${permPrefix}.newimport`) && {
        name: 'newimportCreate',
        btnComp: CommonImport,
        btnProps: {
          buttonText: intl.get(`ssta.common.button.newimportCreate`).d('(新)导入新建'),
          businessObjectTemplateCode: 'SSTA.SETTLE_POOL_BILL_CREATE',
          buttonProps: {
            type: 'c7n-pro',
            icon: '',
            funcType: 'raised',
            loading,
          },
          prefixPatch: '/ssta',
          args: {
            camp: 'SUPPLIER',
            templateCode: 'SSTA.SETTLE_POOL_BILL_CREATE',
            tenantId,
          },
          successCallBack: () => tableDs.query(),
        },
      },
      {
        name: 'cancel',
        child: intl.get('hzero.common.button.cancel').d('取消'),
        btnProps: {
          onClick: handleCancel,
          loading,
          funcType: 'raised',
        },
      },
    ];
  };

  const createContent = (
    <Fragment>
      <div style={{ height: 'calc(100vh - 164px)' }}>{trxTableRender()}</div>
      <div className="ssta-body-footer">
        {customizeBtnGroup(
          { code: 'SSTA.SUPPLIER_BILL_LIST.CREATE.HEADER_BTNS', pro: true },
          <DynamicButtons defaultBtnType="c7n-pro" buttons={btns()} />
        )}
      </div>
    </Fragment>
  );

  return isPage ? (
    <Fragment>
      <Header title={intl.get('ssta.common.view.title.billCreate').d('对账单新建')} />
      <Content>{createContent}</Content>
    </Fragment>
  ) : (
    createContent
  );
};

export default compose(
  formatterCollections({
    code: [
      'ssta.reconciliationWorkbench',
      'ssta.supplySettlePool',
      'ssta.reconciliationWorkbenchSup',
      'hzero.c7nProU',
      'hzero.c7nProUI',
      'ssta.settlePool',
      'sbud.budgeting',
      'ssta.costSheet',
      'entity.attachment',
      'hwfp.common',
      'ssta.common',
      'ssta.purchaseSettle',
      'ssta.supplySettlePool',
      'ssta.purchaseSettlePool',
      'spcm.common',
      'component.docFlow',
    ],
  }),
  withCustomize({
    unitCode: [
      'SSTA.SUPPLY_POOL_LIST.BILL_GRID',
      'SSTA.SUPPLY_POOL_LIST.SEARCH_BAR_BILL',
      'SSTA.SUPPLY_POOL_LIST.HEADER_BTNS',
      'SSTA.SUPPLIER_BILL_LIST.CREATE.HEADER_BTNS',
    ],
  }),
  observer
)(AddModal);
