import React from 'react';
import { compose, isArray } from 'lodash';
import queryString from 'querystring';
import { useObserver } from 'mobx-react';
import { DataSet, Tabs, Modal, Button } from 'choerodon-ui/pro';
import moment from 'moment';

import intl from 'utils/intl';
import { Content, Header } from 'components/Page';
// import ExcelExport from 'components/ExcelExport';
import ExcelExportPro from 'components/ExcelExportPro';
import formatterCollections from 'utils/intl/formatterCollections';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import DynamicButtons from '_components/DynamicButtons';
import SearchBarTable from '_components/SearchBarTable';
import { filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';
import notification from 'utils/notification';
import { queryIdpValue } from 'services/api';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';

import {
  btnsFormat,
  dateRangeTransform,
  getResponse,
  transformQselectDate,
  transformSupplierData,
} from '@/utils/utils'; // 添加了单词内换行的自定义 getResponse
import { tableDS as tableDs, errorTableDS as errorTableDs } from '../../stores/DirectPoolSupplyDS';
import Styles from '@/routes/common.less';
import { deleteInvoice, directInvoice, getNumber } from '../../services/directPoolSupplyService';
import { getPermissions } from '@/routes/Components/Permission';
import { statusTagRender } from '@/utils/renderer';
import { operationDS as operationDs } from '../pubDS/operationDS';
import DirectPoolOperation from '@/routes/Components/DirectPoolOperation';

const tableUnitCodes = {
  A: 'SDIM.POOL_SUPPLY.TAB_ALL.GRID',
  B: 'SDIM.POOL_SUPPLY.TAB_INVOICE.GRID',
  C: 'SDIM.POOL_SUPPLY.TAB_INVOICED.GRID',
  D: 'SDIM.POOL_SUPPLY.TAB_TRASH.GRID',
};

const filterUnitCodes = {
  A: 'SDIM.POOL_SUPPLY.TAB_ALL.SEARCH_BAR',
  B: 'SDIM.POOL_SUPPLY.TAB_INVOICE.SEARCH_BAR',
  C: 'SDIM.POOL_SUPPLY.TAB_INVOICED.SEARCH_BAR',
  D: 'SDIM.POOL_SUPPLY.TAB_TRASH.SEARCH_BAR',
};
const detailExportModelCode = {
  A: 'SDIM_POOL_SUPPLIER_ALL_EXPORT',
  B: 'SDIM_POOL_SUPPLIER_INVOICE_EXPORT',
  C: 'SDIM_POOL_SUPPLIER_INVOICED_EXPORT',
  D: 'SDIM_POOL_ERROR_SUPPLIER_EXPORT',
};

const prefix = 'ssta.directPoolSupply';

const permPrefix = 'srm.settle-account.direct-pool.supply.ps';

const { TabPane } = Tabs;

const DirectPool = (props) => {
  const {
    location: { search },
    customizeBtnGroup,
    customizeTabPane,
    customizeTable,
    history,
  } = props;

  const { type: propsType } = queryString.parse(search.substring(1));

  const [type, setType] = React.useState(propsType || 'A');

  // const [initTypes, setInitTypes] = React.useState([propsType || 'A']);

  const [ids, setIds] = React.useState(null);

  const [select, setSelect] = React.useState([]);

  const tenantId = getCurrentOrganizationId();

  const [permsMap, setPermsMap] = React.useState(new Map());

  const [itemCount, setItemCount] = React.useState({});

  const [btnLoading, setBtnLoading] = React.useState(false);
  const [statusData, setStatusData] = React.useState({});

  const dsWriter = (ds, tabKey) => {
    return new DataSet({
      ...ds(),
      events: {
        select: () => handleSelect(tabKey),
        unSelect: () => handleSelect(tabKey),
        selectAll: () => handleSelect(tabKey),
        unSelectAll: () => handleSelect(tabKey),
      },
    });
  };

  const tableADS = React.useMemo(() => dsWriter(tableDs, 'A'), []);

  const tableBDS = React.useMemo(() => dsWriter(tableDs, 'B'), []);

  const tableCDS = React.useMemo(() => dsWriter(tableDs, 'C'), []);

  const errorTableDS = React.useMemo(() => dsWriter(errorTableDs, 'D'), []);

  const dsObj = {
    A: tableADS,
    B: tableBDS,
    C: tableCDS,
    D: errorTableDS,
  };

  const tableDS = React.useMemo(() => dsObj[type], [type]);
  const operationDS = React.useMemo(
    () =>
      new DataSet(
        operationDs({
          url: `/ssta/v1/${getCurrentOrganizationId()}/direct-pool-actions/list`,
          pk: 'poolId',
        })
      ),
    []
  );

  React.useEffect(() => {
    Object.entries(dsObj).forEach(([key, value]) => {
      value.setQueryParameter('type', key);
      // eslint-disable-next-line no-param-reassign
      value.type = type;
    });
    fetchCount();
    fetchPermissions();
    fetchLov();
  }, []);

  React.useEffect(() => {
    if (propsType) {
      setType(propsType);
    }
  }, [propsType]);

  /**
   * 手动查询权限集
   */
  const fetchPermissions = async () => {
    const res = getResponse(
      await getPermissions([
        `${permPrefix}.radio.button.cancel`,
        `${permPrefix}.radio.button.direct`,
        `${permPrefix}.radio.button.create`,
        `${permPrefix}.radio.button.export`,
      ])
    );
    if (res) {
      setPermsMap(res);
    }
  };
  /**
   * 查询状态值集
   */
  const fetchLov = async () => {
    const data = await queryIdpValue('SDIM.POOL_STATUS');
    const statusData1 = {};
    if (data) {
      data.forEach(({ value, tag }) => {
        statusData1[value] = tag;
      });
      setStatusData(statusData1);
    }
  };

  /**
   * 监控勾选,
   */
  const handleSelect = (tabKey) => {
    const ds = dsObj[tabKey];
    const rowKey = tabKey === 'D' ? 'errorId' : 'poolId';
    const selected = ds.selected.map((item) => item.get(rowKey)).join(',');
    setSelect(ds.selected);
    setIds(selected);
  };

  /**
   * 获取tab数据条数
   */
  const fetchCount = () => {
    Promise.all([
      getNumber('invoice'),
      getNumber('invoiced'),
      getNumber('trash'),
      getNumber('all'),
    ]).then((res) => {
      const itemCountDate = {
        invoice: res[0] ? res[0].totalElements : 0,
        invoiced: res[1] ? res[1].totalElements : 0,
        trash: res[2] ? res[2].totalElements : 0,
        all: res[3] ? res[3].totalElements : 0,
      };
      setItemCount(itemCountDate);
    });
  };

  const itemCountFun = (count) => (count >= 99 ? '99+' : count);

  const handleToInvoiceDetail = (param = { pk: 'applyHeaderId' }) => {
    const { pk, [pk]: pkv } = param;
    history.push({
      pathname: '/ssta/direct-pool-supply/detail',
      search: queryString.stringify({ [pk]: pkv }),
    });
  };

  // 操作记录
  const openOprationModal = (record) => {
    const poolId = record.get('poolId');
    operationDS.setQueryParameter('poolId', poolId);
    operationDS.setQueryParameter('size', 999);
    // this.operationDs.query();
    const recordModal = Modal.open({
      title: intl.get('hzero.common.button.operating').d('操作记录'),
      drawer: true,
      destroyOnClose: true,
      style: {
        width: '742px',
      },
      className: 'ssta-medium-modal',
      children: <DirectPoolOperation record={record} poolId={poolId} operationDs={operationDS} />,
      footer: () => (
        <div className="footerContainer">
          <div className="close">
            <Button onClick={() => recordModal.close()} color="primary">
              {intl.get('hzero.common.button.close').d('关闭')}
            </Button>
          </div>
        </div>
      ),
    });
  };

  /**
   * 头columns
   */
  const columns = React.useMemo(
    () => [
      {
        width: 150,
        name: 'poolNum',
      },
      {
        width: 100,
        name: 'poolStatusMeaning',
        renderer: ({ value, record }) =>
          record.get('poolStatus')
            ? statusTagRender(value, statusData[record.get('poolStatus')])
            : '-',
      },
      {
        width: 150,
        name: 'ruleNum',
      },
      {
        width: 150,
        name: 'netPrice',
        align: 'rignt',
      },
      {
        width: 150,
        name: 'taxAmount',
        align: 'rignt',
      },
      {
        width: 150,
        name: 'amountInvoice',
        align: 'rignt',
      },
      {
        width: 150,
        name: 'trxDate',
        renderer: ({ value }) => value && moment(value).format(DEFAULT_DATE_FORMAT),
      },
      {
        width: 150,
        name: 'refDocNumListStr',
        renderer: ({ value }) => {
          let refArr = [];
          if (value) {
            try {
              refArr = JSON.parse(value);
              if (!isArray(refArr)) {
                refArr = [];
              }
            } catch (e) {
              refArr = [];
            }
          }

          return (
            <>
              {value
                ? refArr.map((obj, index) => {
                    const { applyHeaderId, applyHeaderNum } = obj;
                    return (
                      <a
                        onClick={() =>
                          handleToInvoiceDetail({
                            pk: 'applyHeaderId',
                            applyHeaderId,
                          })
                        }
                      >
                        {applyHeaderNum}
                        {index === refArr.length - 1 ? '' : ','}
                      </a>
                    );
                  })
                : '-'}
            </>
          );
        },
      },

      {
        width: 150,
        name: 'defaultInvoiceTypeMeaning',
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
        width: 210,
        name: 'commodityNum',
      },
      {
        width: 210,
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
        width: 200,
        name: 'errorNum',
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
        title: intl.get(`${prefix}.view.title.operationRecord`).d('操作记录'),
        name: 'action',
        renderer: ({ record }) => (
          <a onClick={() => openOprationModal(record)}>
            {intl.get(`${prefix}.view.title.watch`).d('查看')}
          </a>
        ),
      },
    ],
    [type]
  );

  // 取消勾选
  const cancelAllSelected = (ds) => {
    const { selected } = ds;
    if (selected.length > 0) {
      selected.forEach((record) => {
        ds.unSelect(record);
      });
    }
  };

  const handleChangeType = (typeKey) => {
    const key = typeKey.toUpperCase();
    const ds = dsObj[key];
    cancelAllSelected(ds);
    setType(key);
    const rowKey = key === 'D' ? 'errorId' : 'poolId';
    const selected = ds.selected.map((item) => item.get(rowKey)).join(',');
    setSelect(ds.selected);
    setIds(selected);
    ds.query();
    fetchCount();
    // if (initTypes.includes(key)) {
    //   ds.query();
    // } else {
    //   setInitTypes([...initTypes, key]);
    // }
  };

  /**
   * 筛选器查询回调
   */
  const handleQuery = ({ params }) => {
    tableDS.queryDataSet.loadData([params]);
    tableDS.query();
    if (tableDS.selected.length !== 0) {
      cancelAllSelected(tableDS);
    }
  };

  // 数组去重
  const unique = (arr) => {
    const res = new Map();
    return arr.filter((item) => !res.has(item.applyHeaderId) && res.set(item.applyHeaderId, 1));
  };
  const handleFieldChange = ({ value, name, record }) => {
    if (name === 'dateRange') {
      record.set('trxDate', dateRangeTransform(value, true));
    }
  };

  // 直连开票
  const handleDirectInvoice = async () => {
    setBtnLoading(true);
    const datas = select.map((record) => record.toData());
    const res = getResponse(await directInvoice(datas));
    if (res) {
      // 进入开票申请单
      const refDocNumList = res.reduce((prev, item) => {
        const { refDocNumListStr = '[]' } = item;
        let refDocNums = [];
        try {
          refDocNums = JSON.parse(refDocNumListStr);
          if (!isArray(refDocNums)) {
            refDocNums = [];
          }
        } catch (e) {
          refDocNums = [];
        }
        return prev.concat(refDocNums);
      }, []);
      const applyHeaderList = unique(refDocNumList);
      handleToInvoiceDetail({
        pk: 'applyHeaderList',
        applyHeaderList: JSON.stringify(applyHeaderList),
      });
      await tableDS.query();
      fetchCount();
      setBtnLoading(false);
    } else {
      setBtnLoading(false);
    }
  };
  // 放弃开票
  const handleAbandonInvoice = async () => {
    setBtnLoading(true);
    const datas = select.map((record) => record.toData());
    const res = getResponse(await deleteInvoice(datas));
    if (res) {
      notification.success();
      setSelect([]);
      fetchCount();
      await tableDS.query();
      tableDS.clearCachedSelected();
      setBtnLoading(false);
    } else {
      setBtnLoading(false);
    }
  };

  const invoiceTableRender = (key) => {
    return (
      <div style={{ height: 'calc(100vh - 252px)' }}>
        {customizeTable(
          {
            code: tableUnitCodes[key],
          },
          <SearchBarTable
            searchCode={filterUnitCodes[key]}
            columns={columns}
            dataSet={dsObj[key]}
            style={{ maxHeight: 'calc(100% - 22px)' }}
            searchBarConfig={{
              onQuery: handleQuery,
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
      </div>
    );
  };

  const getQueryData = () => {
    const queryData = tableDS.queryDataSet?.current?.toData() || {};
    const customizeUnitCode = [tableUnitCodes[type], filterUnitCodes[type]]
      .filter((item) => item)
      .join();
    return filterNullValueObject({
      ...queryData,
      ...transformQselectDate(queryData, { dateRange: 'trxDate' }),
      ...transformSupplierData(queryData.supplierCompanyId),
      customizeUnitCode,
    });
  };

  const getSelectedKeys = () => {
    const idsObj = type === 'D' ? { errorIds: ids } : { poolIds: ids };
    const customizeUnitCode = [tableUnitCodes[type], filterUnitCodes[type]]
      .filter((item) => item)
      .join();
    return {
      ...idsObj,
      customizeUnitCode,
    };
  };
  const requestUrl = () => {
    switch (type) {
      case 'A':
        return `/ssta/v1/${tenantId}/direct-pools/excel-export/all`;
      case 'B':
        return `/ssta/v1/${tenantId}/direct-pools/excel-export/invoice`;
      case 'C':
        return `/ssta/v1/${tenantId}/direct-pools/excel-export/invoiced`;
      case 'D':
        return `/ssta/v1/${tenantId}/direct-pool-errors/excel-export`;
      default:
        return `/ssta/v1/${tenantId}/direct-pools/excel-export/all`;
    }
  };
  const useHeaderBtns = () => {
    const allBtns = useObserver(() => [
      permsMap.get(`${permPrefix}.radio.button.create`) &&
        ['A'].includes(type) && {
          name: 'create',
          child: intl.get(`ssta.common.button.createInvoicing`).d('新建开票申请单'),
          btnProps: {
            icon: 'add',
            onClick: () =>
              history.push({
                pathname: '/ssta/direct-pool-supply/create',
                search: queryString.stringify({ type: 'CREATE' }),
              }),
          },
        },
      permsMap.get(`${permPrefix}.radio.button.direct`) &&
        ['B'].includes(type) && {
          name: 'direct',
          child: intl.get(`ssta.common.button.directInvoicing`).d('直连开票'),
          btnProps: {
            icon: 'check',
            disabled: select && select.length === 0,
            onClick: handleDirectInvoice,
            loading: btnLoading,
          },
        },
      permsMap.get(`${permPrefix}.radio.button.cancel`) &&
        ['B', 'D'].includes(type) && {
          name: 'abandon',
          child: intl.get(`ssta.common.button.abandonInvoicing`).d('放弃开票'),
          btnProps: {
            icon: 'cancel',
            disabled: select && select.length === 0,
            onClick: handleAbandonInvoice,
            loading: btnLoading,
          },
        },
      // permsMap.get(`${permPrefix}.radio.button.export`) && {
      //   name: 'export',
      //   btnComp: ExcelExport,
      //   childFor: 'buttonText',
      //  child: intl.get(`ssta.common.button.export`).d('导出'),
      //   btnProps: {
      //     method: 'POST',
      //     otherButtonProps: { type: 'c7n-pro', funcType: 'flat', icon: 'unarchive' },
      //     requestUrl: requestUrl(),
      //     queryParams: select.length === 0 ? getQueryData() : getSelectedKeys(),
      //   },
      // },
      permsMap.get(`${permPrefix}.radio.button.export`) && {
        name: 'exports',
        btnComp: ExcelExportPro,
        childFor: 'buttonText',
        child:
          select.length === 0
            ? intl.get('ssta.costSheet.button.export').d('导出')
            : intl.get('ssta.costSheet.button.tickExport').d('勾选导出'),
        btnProps: {
          method: 'POST',
          otherButtonProps: { type: 'c7n-pro', funcType: 'flat', icon: 'unarchive' },
          requestUrl: requestUrl(),
          queryParams: select.length === 0 ? getQueryData() : getSelectedKeys(),
          templateCode: detailExportModelCode[type],
        },
      },
    ]);
    return btnsFormat(allBtns);
  };

  const headerBtns = useHeaderBtns();

  return (
    <>
      <Header title={intl.get(`${prefix}.view.title.directPoolSupply`).d('销售方待开票池')}>
        {customizeBtnGroup(
          { code: 'SDIM.POOL_SUPPLY.BTNS.LIST_HEADER', pro: true },
          <DynamicButtons buttons={headerBtns} />
        )}
      </Header>
      <Content className={Styles['ssta-list-content']}>
        {customizeTabPane(
          {
            code: 'SDIM.POOL_SUPPLY.TABS.LIST',
          },
          <Tabs animated={false} activeKey={type.toLowerCase()} onChange={handleChangeType}>
            <TabPane
              key="b"
              tab={intl.get(`${prefix}.view.button.billing`).d('待开票')}
              count={itemCountFun(itemCount.invoice)}
            >
              {invoiceTableRender('B')}
            </TabPane>
            <TabPane
              key="c"
              tab={intl.get(`${prefix}.view.button.billed`).d('已开票')}
              count={itemCountFun(itemCount.invoiced)}
            >
              {invoiceTableRender('C')}
            </TabPane>
            <TabPane
              key="d"
              tab={intl.get(`${prefix}.view.button.dustbin`).d('垃圾箱')}
              count={itemCountFun(itemCount.trash)}
            >
              {invoiceTableRender('D')}
            </TabPane>
            <TabPane
              key="a"
              tab={intl.get(`${prefix}.view.button.all`).d('全部')}
              count={itemCountFun(itemCount.all)}
            >
              {invoiceTableRender('A')}
            </TabPane>
          </Tabs>
        )}
      </Content>
    </>
  );
};

export default compose(
  formatterCollections({
    code: ['hzero.common', 'ssta.common', 'ssta.directPoolSupply'],
  }),
  withCustomize({
    unitCode: [
      'SDIM.POOL_SUPPLY.BTNS.LIST_HEADER',
      'SDIM.POOL_SUPPLY.TABS.LIST',
      'SDIM.POOL_SUPPLY.TAB_ALL.GRID',
      'SDIM.POOL_SUPPLY.TAB_ALL.SEARCH_BAR',
      'SDIM.POOL_SUPPLY.TAB_INVOICE.GRID',
      'SDIM.POOL_SUPPLY.TAB_INVOICE.SEARCH_BAR',
      'SDIM.POOL_SUPPLY.TAB_INVOICED.GRID',
      'SDIM.POOL_SUPPLY.TAB_INVOICED.SEARCH_BAR',
      'SDIM.POOL_SUPPLY.TAB_TRASH.GRID',
      'SDIM.POOL_SUPPLY.TAB_TRASH.SEARCH_BAR',
    ],
  })
)(DirectPool);
