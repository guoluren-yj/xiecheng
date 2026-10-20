import React, { useMemo, useEffect, useState } from 'react';
import intl from 'utils/intl';
import { Tabs, Tag, Spin } from 'choerodon-ui';
import classnames from 'classnames';
import { Table, DataSet } from 'choerodon-ui/pro'; //  Output, Form, Modal
import formatterCollections from 'utils/intl/formatterCollections';
import { observer } from 'mobx-react-lite';
import { yesOrNoRender } from 'utils/renderer';
import { math } from 'choerodon-ui/dataset';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { byExcutionQuery } from '@/services/purchasePlatformService.js';
import {
  projectDs,
  contractDs,
  ordertDs,
  asnDs,
  rcvDs,
  settleDs,
  bidDs,
  rfxDs,
  invoiceDs,
  reconciliationDs,
  paymentDs,
  soldDs,
  siecProjectDs,
} from './indexDS';
import ExecuteNum from './ExecuteNum';
import '../index.less';

const { TabPane } = Tabs;
const ContectDoc = ({
  priceHiddenFlag,
  customizeTabPane,
  customizeTable,
  prLineId,
  activeTab: tab,
  record: currentRecord,
  originPage,
  cuxQueryParams,
}) => {
  const uomPrecision = currentRecord.get('uomPrecision');
  const financialPrecision = currentRecord.get('financialPrecision');
  const projectLineDs = useMemo(() => new DataSet(projectDs(prLineId, uomPrecision)), []);
  const asnLineDs = useMemo(() => new DataSet(asnDs(prLineId, uomPrecision)), []);
  const slodLineDs = useMemo(() => new DataSet(soldDs(prLineId, uomPrecision)), []);

  const projectSiecDs = useMemo(() => new DataSet(siecProjectDs(prLineId, uomPrecision)), []);
  const rcvLineDs = useMemo(
    () => new DataSet(rcvDs(prLineId, uomPrecision, financialPrecision)),
    []
  );
  const settleLineDs = useMemo(() => new DataSet(settleDs(prLineId, uomPrecision)), []);
  const ordertLineDs = useMemo(() => new DataSet(ordertDs(prLineId, uomPrecision)), []);
  const contractLineDs = useMemo(() => new DataSet(contractDs(prLineId, uomPrecision)), []);
  const bidLineDs = useMemo(() => new DataSet(bidDs(prLineId, uomPrecision)), []);
  const rfxLineDs = useMemo(() => new DataSet(rfxDs(prLineId, uomPrecision)), []);
  const invoiceLineDs = useMemo(() => new DataSet(invoiceDs(prLineId, uomPrecision)), []);
  const reconciliationLineDs = useMemo(
    () => new DataSet(reconciliationDs(prLineId, uomPrecision)),
    []
  );
  const paymentLineDs = useMemo(() => new DataSet(paymentDs(prLineId, uomPrecision)), []);
  const [billExit, setBillExit] = useState();
  const [currentLineData, setCurrentLineData] = useState({});
  const [activeTab, setActiveTab] = useState(tab);
  const [spinningLoading, setLoading] = useState(false);

  // 58项目二开
  const getCurrentPrLineId = () => {
    return prLineId;
  };

  const fetchTabTableData = (newActiveTab) => {
    const currentActiveTab = newActiveTab || activeTab;

    if (currentActiveTab?.includes('billStatus')) {
      invoiceLineDs.query().then(() => {
        if (invoiceLineDs.totalCount > 0) {
          setBillExit('old');
        } else {
          setBillExit('new');
        }
      });
    }
    if (currentActiveTab?.includes('projectStatus')) {
      projectLineDs.query();
    }
    if (currentActiveTab?.includes('rfxStatus')) {
      rfxLineDs.query();
    }
    if (currentActiveTab?.includes('bidStatus')) {
      bidLineDs.query();
    }
    if (
      currentActiveTab?.includes('contractStatus') ||
      currentActiveTab?.includes('contractFrameworkStatus') ||
      currentActiveTab?.includes('contractSimpleStatus')
    ) {
      contractLineDs.query();
    }
    if (currentActiveTab?.includes('orderStatus')) {
      ordertLineDs.query();
    }
    if (currentActiveTab?.includes('deliveryStatus')) {
      asnLineDs.query();
    }
    if (currentActiveTab?.includes('receiptStatus')) {
      rcvLineDs.query();
    }
    if (currentActiveTab?.includes('reconciliationStatus')) {
      reconciliationLineDs.query();
    }
    if (currentActiveTab?.includes('paymentStatus')) {
      paymentLineDs.query();
    }
    if (currentActiveTab?.includes('slodStatus')) {
      slodLineDs.query();
    }
    if (currentActiveTab?.includes('projectInfoStatus')) {
      projectSiecDs.query();
    }
  };

  const getCurrentExecuteNum = async () => {
    let record = null;

    const handleActiveTab = (recordValue) => {
      record = recordValue || currentRecord?.toData();
      setCurrentLineData(record);

      const amountActiveTab = {
        reconciliationStatus: record?.reconciliationAmount > 0,
        paymentStatus: record?.paymentAmount > 0,
      };
      const newActiveTab = record?.prExecutePointVOList
        ? record?.prExecutePointVOList
          ?.filter(
            (ele) =>
              (ele.executeStatus && ele.executeStatus !== 'NOT_STARTED') ||
              amountActiveTab[ele.executePoint]
          )
          ?.map((ele) => ele.executePoint)
        : [];
      // }
      setActiveTab(newActiveTab);
      fetchTabTableData(newActiveTab);
    };
    if (originPage === 'closeTab') {
      setLoading(true);
      const res = await byExcutionQuery({ prLineIds: prLineId, ...cuxQueryParams });
      if (res && !res?.failed) {
        record = res?.content?.[0];
        setLoading(false);
        handleActiveTab(record);
      } else {
        setLoading(false);
      }
    } else {
      handleActiveTab();
    }

    // });
  };

  const init = () => {
    if (prLineId) {
      getCurrentExecuteNum();
    }
  };

  useEffect(() => {
    window.purchasePlatformGetCurrentPrLineId = getCurrentPrLineId;
    init();
    return () => {
      window.purchasePlatformGetCurrentPrLineId = undefined;
    };
  }, []);

  const colorRender = (valueMeaning, value) => {
    if (
      [
        'CANCEL',
        'REFUSE',
        'CHANGE_REFUSE',
        'RELEASE_REJECTED',
        'PAUSED',
        'CLOSED',
        'CANCELED',
      ].includes(value)
    ) {
      return <Tag className={classnames('c7n-tag-has-color', 'danger-tag')}>{valueMeaning}</Tag>;
    } else if (
      ['FINISHED', 'APPROVED', 'OPENED', 'DELIVERED', 'CONFIRMED', 'PUBLISHED'].includes(value)
    ) {
      return <Tag className={classnames('c7n-tag-has-color', 'success-tag')}>{valueMeaning}</Tag>;
    } else {
      return <Tag className={classnames('c7n-tag-has-color', 'warning-tag')}> {valueMeaning}</Tag>;
    }
  };

  // 金额隐藏
  const renderAmount = ({ value, record, name }) => {
    if (priceHiddenFlag === 1 && record) {
      return record.get(`${name}Meaning`);
    }
    return value;
  };

  const projectLineCol = React.useMemo(() => {
    return [
      { name: 'displayPrNum' },
      { name: 'displayPrLineNum' },
      {
        name: 'sourceProjectNum',
        renderer: ({ value, record }) => `${value}|${record.get('projectLineItemNum')}`,
      },
      { name: 'projectLineItemNum', width: 70 },
      {
        name: 'sourceProjectStatusMeaning',
        width: 140,
        renderer: ({ value, record }) => colorRender(value, record.get('sourceProjectStatus')),
      },
      { name: 'creationDate' },
      { name: 'executeQuantity' },
      { name: 'sourceProjectName' },
      { name: 'companyName' },
      { name: 'sourceMethodMeaning' },
      { name: 'purAgent' },
      { name: 'contactMobilephone' },
      { name: 'contactMail' },
      { name: 'sourceDate' },
      { name: 'createdByName' },
      { name: 'unitName' },
    ];
  });

  const rcvLineCol = React.useMemo(() => {
    return [
      { name: 'displayPrNum' },
      { name: 'displayPrLineNum' },
      {
        name: 'displayTrxNum',
        renderer: ({ value, record }) => `${value}|${record.get('displayTrxLineNum')}`,
      },
      { name: 'displayTrxLineNum' },
      {
        name: 'rcvStatusCodeMeaning',
        renderer: ({ value, record }) => colorRender(value, record.get('rcvStatusCode')),
      },
      { name: 'creationDate' },
      { name: 'executeQuantity' },
      { name: 'executeAmount' },
      { name: 'rcvTypeName' },
      { name: 'companyName' },
      { name: 'supplierCompanyName' },
      { name: 'creationName' },
    ];
  });
  const asnLineCol = React.useMemo(() => {
    return [
      {
        name: 'displayPrNum',
      },
      { name: 'displayPrLineNum' },
      {
        name: 'asnNum',
        renderer: ({ value, record }) => `${value}|${record.get('displayAsnLineNum')}`,
      },
      { name: 'displayAsnLineNum' },
      {
        name: 'asnStatusMeaning',
        renderer: ({ value, record }) => colorRender(value, record.get('asnStatus')),
      },
      { name: 'creationDate' },
      { name: 'creationName' },
      { name: 'executeQuantity' },
      { name: 'shipDate' },
      { name: 'expectedArriveDate' },
    ];
  });

  const ordertLineCol = React.useMemo(() => {
    return [
      { name: 'displayPrNum' },
      { name: 'displayPrLineNum' },
      {
        name: 'displayPoNum',
        renderer: ({ value, record }) => `${value}|${record.get('displayLineNum')}`,
        // renderer: ({ value }) => (
        //   <a
        //     onClick={() =>
        //       Modal.open({
        //         drawer: true,
        //         closable: true,
        //         children: <OrderForm />,
        //         footer: null,
        //       })
        //     }
        //   >
        //     {value}
        //   </a>
        // ),
      },
      { name: 'displayLineNum' },
      {
        name: 'displayStatusMeaning',
        renderer: ({ value, record }) => colorRender(value, record.get('displayStatusCode')),
      },
      { name: 'creationDate' },
      { name: 'executeQuantity' },
      {
        name: 'taxIncludeAmount',
        renderer: renderAmount,
      },
      {
        name: 'amount',
        renderer: renderAmount,
      },
      { name: 'termsName' },
      { name: 'displayLineLocationNum' },
      { name: 'invOrganizationName' },
      { name: 'projectCategoryMeaning' },
      { name: 'creationName' },
      { name: 'promiseDeliveryDate' },
    ];
  });

  const contractLineCol = React.useMemo(() => {
    return [
      { name: 'displayPrNum' },
      { name: 'displayPrLineNum' },
      {
        name: 'pcNum',
        renderer: ({ value, record }) => `${value}|${record.get('displayLineNum')}`,
      }, // renderer: ({ value }) => TagRender(value, statusList),
      { name: 'displayLineNum' },
      {
        name: 'pcStatusCodeMeaning',
        renderer: ({ value, record }) => colorRender(value, record.get('pcStatusCode')),
      },
      { name: 'creationDate' },
      { name: 'executeQuantity' },
      { name: 'pcName' },
      { name: 'companyName' },
      { name: 'ouName' },
      { name: 'pcKindCodeMeaning' },
      { name: 'pcTypeName' },
      { name: 'amount' },
      { name: 'supplierName' },
      { name: 'mainPcName' },
      { name: 'contractPurposeMeaning' },
      { name: 'startDateActive' },
      { name: 'endDateActive' },
      { name: 'signDescription' },
      { name: 'signAddress' },
      { name: 'unitName' },
      { name: 'internalPostil' },
      { name: 'createByRealName' },
    ];
  });
  const settleLineCol = React.useMemo(() => {
    return [
      { name: 'displayPrNum' },
      { name: 'displayPrLineNum' },
      {
        name: 'settleHeaderNum',
        renderer: ({ value, record }) => `${value}|${record.get('lineNum')}`,
      },
      { name: 'lineNum' },
      {
        name: 'settleStatusMeaning',
        renderer: ({ value, record }) => colorRender(value, record.get('settleStatus')),
      },
      { name: 'creationDate' },
      { name: 'executeQuantity' },
      {
        name: 'netAmount',
        renderer: renderAmount,
      },
      {
        name: 'settleTaxAmount',
        renderer: renderAmount,
      },
      {
        name: 'settleTaxIncludedAmount',
        renderer: renderAmount,
      },
      {
        name: 'invoicedNetAmount',
        renderer: renderAmount,
      },
      {
        name: 'invoicedTaxAmount',
        renderer: renderAmount,
      },
      {
        name: 'invoicedTaxIncludedAmount',
        renderer: renderAmount,
      },
      { name: 'currencyCode' },
      { name: 'createdUserName' },
    ];
  });

  const invoiceCol = React.useMemo(() => {
    return [
      {
        name: 'displayPrNum',
      },
      { name: 'displayPrLineNum' },
      {
        name: 'invoiceNum',
        renderer: ({ value, record }) => `${value}|${record.get('invoiceLineNum')}`,
      },
      { name: 'invoiceLineNum' },
      {
        name: 'invoiceStatusMeaning',
        renderer: ({ value, record }) => colorRender(value, record.get('invoiceStatus')),
      },
      { name: 'creationDate' },
      { name: 'executeQuantity' },
      { name: 'taxInvoiceNum' },
      {
        name: 'taxWithoutAmount',
        renderer: renderAmount,
      },
      {
        name: 'taxIncludedAmount',
        renderer: renderAmount,
      },
      { name: 'supplierName' },
      { name: 'taxIncludedAmountSystemMeaning' },
      { name: 'taxAmount' },
      { name: 'taxAmountSystemMeaning' },
      { name: 'currencyCode' },
      { name: 'createName' },
      { name: 'invoiceTitle' },
    ];
  });

  const bidLineCol = React.useMemo(() => {
    return [
      { name: 'displayPrNum' },
      { name: 'displayPrLineNum' },
      {
        name: 'bidNum',
        renderer: ({ value, record }) => `${value}|${record.get('bidLineItemNum')}`,
      }, // renderer: ({ value }) => TagRender(value, statusList),
      { name: 'bidLineItemNum' },
      {
        name: 'bidStatusMeaning',
        renderer: ({ value, record }) => colorRender(value, record.get('bidStatus')),
      },
      { name: 'creationDate' },
      { name: 'executeQuantity' },
      { name: 'bidTitle' },
      { name: 'purOrganizationName' },
      { name: 'purchaserName' },
      { name: 'purName' },
      { name: 'purPhone' },
      { name: 'purEmail' },
      { name: 'quotationStartDate' },
      { name: 'quotationEndDate' },
      { name: 'bidOpenDate' },
      { name: 'createdByName' },
      { name: 'sourceMethodMeaning' },
      {
        name: 'executeBillTypeNewFlag',
        renderer: ({ record }) => {
          return record && record?.get('executeDocTypeVersionNum')
            ? record?.get('executeDocTypeVersionNum') === 2
              ? yesOrNoRender(1)
              : yesOrNoRender(0)
            : null;
        },
      },
    ];
  });
  const rfxLineCol = React.useMemo(() => {
    return [
      { name: 'displayPrNum' },
      { name: 'displayPrLineNum' },
      {
        name: 'rfxNum',
        renderer: ({ value, record }) => `${value}|${record.get('rfxLineItemNum')}`,
      },
      { name: 'rfxLineItemNum' },
      {
        name: 'rfxStatusMeaning',
        renderer: ({ value, record }) => colorRender(value, record.get('rfxStatus')),
      },
      { name: 'creationDate' },
      { name: 'executeQuantity' },
      { name: 'rfxTitle' },
      { name: 'templateName' },
      { name: 'purOrganizationName' },
      { name: 'purchaserName' },
      { name: 'purName' },
      { name: 'purPhone' },
      { name: 'purEmail' },
      { name: 'sourceMethodMeaning' },
      { name: 'createdByName' },
    ];
  });
  const paymentCol = React.useMemo(() => {
    return [
      {
        name: 'settleHeaderNum',
        renderer: ({ value, record }) => `${value}|${record.get('lineNum')}`,
      },
      {
        name: 'settleStatusMeaning',
        renderer: ({ value, record }) => colorRender(value, record.get('settleStatus')),
      },
      { name: 'settleHeaderCreationDate' },
      { name: 'quantity' },
      { name: 'createdUserName' },
      { name: 'companyNum' },
      { name: 'companyName' },
      { name: 'supplierCompanyName' },
      { name: 'campMeaning' },
      { name: 'settleHeaderPaymentAmount', renderer: renderAmount },
      { name: 'settleNum' },
      { name: 'sourceSettleNum' },
      { name: 'itemCode' },
      { name: 'itemName' },
      { name: 'sourceSettleHeaderNum' },
    ];
  });
  const reconciliationCol = React.useMemo(() => {
    return [
      {
        name: 'settleNum',
        renderer: ({ record }) => `${record.get('billNum')}|${record.get('lineNum')}`,
      },
      {
        name: 'billStatusMeaning',
        renderer: ({ value, record }) => colorRender(value, record.get('billStatus')),
      },
      { name: 'billHeaderCreationDate' },
      { name: 'quantity' },
      { name: 'companyNum' },
      { name: 'campMeaning' },
      { name: 'currencyCode' },
      { name: 'companyName' },
      { name: 'sourceSettleNum' },
      { name: 'sourceSettleLineNum' },
      { name: 'itemCode' },
      { name: 'itemName' },
      { name: 'createdUserName' },
      { name: 'netPrice', renderer: renderAmount },
      { name: 'unitPriceBatch', renderer: renderAmount },
      { name: 'taxIncludedAmount', renderer: renderAmount },
    ];
  });

  const soldCol = React.useMemo(() => {
    return [
      { name: 'displayAsnNum' },
      { name: 'displayAsnLineNum' },
      { name: 'creationName' },
      { name: 'creationDate' },
      { name: 'asnTypeCode', renderer: ({ record }) => record.get('asnTypeCodeMeaning') },
      { name: 'shipDate' },
      { name: 'expectedArriveDate' },
      { name: 'executeQuantity' },
      { name: 'expressNum' },
    ];
  });

  const projectCol = React.useMemo(() => {
    return [
      {
        name: 'projectNum',
        renderer: ({ value, record }) => `${value}|${record.get('projectLineNum')}`,
      },
      {
        name: 'projectStatus',
        renderer: ({ value, record }) => colorRender(record.get('projectStatusMeaning'), value),
      },
      { name: 'creationDate' },
      { name: 'executeQuantity' },
      { name: 'projectName' },
      { name: 'createdByName' },
    ];
  });

  const NumberItem = observer(({ ds }) => {
    return (
      <strong style={{ padding: '5px', fontWeight: 400 }}>
        {ds.totalCount > 99 ? '99+' : ds.totalCount || ''}
      </strong>
    );
  });

  const TotalCountItem = observer(({ ds, count, numberFalg }) => {
    return ds.totalCount > 0 ? (
      <ExecuteNum count={count} uomPrecision={uomPrecision} numberFalg={numberFalg} />
    ) : (
      ''
    );
  });
  return (
    <Spin spinning={spinningLoading}>
      {customizeTabPane(
        { code: 'SPRM.PURCHASE_PLAFORM_EXECUTION.TAB' },
        <Tabs
          tabPosition="left"
          defaultActiveKey={activeTab && activeTab[0] ? activeTab[0].replace('Status', '') : ''}
          className="contect-item"
          style={{ height: '100%' }}
          onChange={() => init()}
        >
          {activeTab?.includes('projectStatus') && (
            <TabPane
              tab={
                <span>
                  {intl.get('sprm.purchasePlatform.title.project').d('寻源立项')}
                  <NumberItem ds={projectLineDs} />
                </span>
              }
              key="project"
            >
              <div>
                <ExecuteNum
                  numberFalg
                  count={currentLineData?.projectQuantity}
                  uomPrecision={uomPrecision}
                />
                {customizeTable(
                  {
                    code: 'SPRM.PURCHASE_PLAFORM_EXECUTION.PROJECT_LIST',
                  },
                  <Table
                    dataSet={projectLineDs}
                    columns={projectLineCol}
                    style={{ maxHeight: `calc(100vh - 300px)` }}
                  />
                )}
              </div>
            </TabPane>
          )}
          {activeTab?.includes('rfxStatus') && (
            <TabPane
              tab={
                <span>
                  {intl.get('sprm.purchasePlatform.title.rfx').d('询报价')}
                  <NumberItem ds={rfxLineDs} />
                </span>
              }
              key="rfx"
            >
              <div>
                <ExecuteNum
                  numberFalg
                  count={currentLineData?.rfxQuantity}
                  uomPrecision={uomPrecision}
                />
                {customizeTable(
                  {
                    code: 'SPRM.PURCHASE_PLAFORM_EXECUTION.RFX_LIST',
                    dataSet: rfxLineDs,
                  },
                  <Table
                    dataSet={rfxLineDs}
                    columns={rfxLineCol}
                    style={{ maxHeight: `calc(100vh - 300px)` }}
                  />
                )}
              </div>
            </TabPane>
          )}
          {activeTab?.includes('bidStatus') && (
            <TabPane
              tab={
                <span>
                  {intl.get('sprm.purchasePlatform.title.bid').d('招投标')}
                  <NumberItem ds={bidLineDs} />
                </span>
              }
              key="bid"
            >
              <div>
                <ExecuteNum
                  numberFalg
                  count={currentLineData?.bidQuantity}
                  uomPrecision={uomPrecision}
                />
                {customizeTable(
                  {
                    code: 'SPRM.PURCHASE_PLAFORM_EXECUTION.BID_LIST',
                    dataSet: bidLineDs,
                  },
                  <Table
                    dataSet={bidLineDs}
                    columns={bidLineCol}
                    style={{ maxHeight: `calc(100vh - 300px)` }}
                  />
                )}
              </div>
            </TabPane>
          )}
          {(activeTab?.includes('contractStatus') ||
            activeTab?.includes('contractSimpleStatus') ||
            activeTab?.includes('contractFrameworkStatus')) && (
              <TabPane
                key="contract"
                tab={
                  <span>
                    {intl.get('sprm.purchasePlatform.title.contact').d('协议')}
                    <NumberItem ds={contractLineDs} />
                  </span>
                }
              >
                <div>
                  <ExecuteNum
                    numberFalg
                    count={
                      currentLineData?.contractFrameworkQuantity
                        ? math.plus(
                          currentLineData?.contractQuantity,
                          currentLineData?.contractFrameworkQuantity
                        )
                        : currentLineData?.contractQuantity
                    }
                    uomPrecision={uomPrecision}
                  />
                  {customizeTable(
                    {
                      code: 'SPRM.PURCHASE_PLAFORM_EXECUTION.CONTRACT_LIST',
                      dataSet: contractLineDs,
                    },
                    <Table
                      dataSet={contractLineDs}
                      columns={contractLineCol}
                      style={{ maxHeight: `calc(100vh - 300px)` }}
                    />
                  )}
                </div>
              </TabPane>
            )}
          {activeTab?.includes('orderStatus') && (
            <TabPane
              tab={
                <span>
                  {intl.get('sprm.purchasePlatform.title.order').d('订单')}
                  <NumberItem ds={ordertLineDs} />
                </span>
              }
              key="order"
            >
              <div>
                <ExecuteNum
                  numberFalg
                  count={currentLineData?.orderQuantity}
                  uomPrecision={uomPrecision}
                />
                {customizeTable(
                  {
                    code: 'SPRM.PURCHASE_PLAFORM_EXECUTION.ORDER_LIST',
                    dataSet: ordertLineDs,
                  },
                  <Table
                    dataSet={ordertLineDs}
                    columns={ordertLineCol}
                    style={{ maxHeight: `calc(100vh - 300px)` }}
                  />
                )}
              </div>
            </TabPane>
          )}
          {activeTab?.includes('deliveryStatus') && (
            <TabPane
              key="asn"
              tab={
                <span>
                  {intl.get('sprm.purchasePlatform.title.asn').d('送货')}
                  <NumberItem ds={asnLineDs} />
                </span>
              }
            >
              <div>
                <ExecuteNum
                  numberFalg
                  count={currentLineData?.deliveryQuantity}
                  uomPrecision={uomPrecision}
                />
                {customizeTable(
                  {
                    code: 'SPRM.PURCHASE_PLAFORM_EXECUTION.ASN_LINE',
                    dataSet: asnLineDs,
                  },
                  <Table
                    dataSet={asnLineDs}
                    columns={asnLineCol}
                    style={{ maxHeight: `calc(100vh - 300px)` }}
                  />
                )}
              </div>
            </TabPane>
          )}
          {activeTab?.includes('slodStatus') && (
            <TabPane
              tab={
                <span>
                  {intl.get('sprm.purchasePlatform.title.slod').d('发货')}
                  <NumberItem ds={slodLineDs} />
                </span>
              }
              key="sold"
            >
              <div>
                <ExecuteNum
                  numberFalg
                  count={currentLineData?.slodQuantity}
                  uomPrecision={uomPrecision}
                />
                {customizeTable(
                  {
                    code: 'SPRM.PURCHASE_PLAFORM_EXECUTION.SOLD.LIST',
                  },
                  <Table
                    dataSet={slodLineDs}
                    columns={soldCol}
                    style={{ maxHeight: `calc(100vh - 300px)` }}
                  />
                )}
              </div>
            </TabPane>
          )}
          {activeTab?.includes('projectInfoStatus') && (
            <TabPane
              tab={
                <span>
                  {intl.get('sprm.purchasePlatform.title.projectoIno').d('项目')}
                  <NumberItem ds={projectSiecDs} />
                </span>
              }
              key="seicProject"
            >
              <div>
                <ExecuteNum
                  numberFalg
                  count={currentLineData?.projectInfoQuantity}
                  uomPrecision={uomPrecision}
                />
                {customizeTable(
                  {
                    code: 'SPRM.PURCHASE_PLAFORM_EXECUTION.SIECPRO.LIST',
                  },
                  <Table
                    dataSet={projectSiecDs}
                    columns={projectCol}
                    style={{ maxHeight: `calc(100vh - 300px)` }}
                  />
                )}
              </div>
            </TabPane>
          )}
          {activeTab?.includes('receiptStatus') && (
            <TabPane
              tab={
                <span>
                  {intl.get('sprm.purchasePlatform.title.rcv').d('收货')}
                  <NumberItem ds={rcvLineDs} />
                </span>
              }
              key="rcv"
            >
              <div>
                <ExecuteNum
                  count={currentLineData?.receiptQuantity}
                  uomPrecision={uomPrecision}
                  numberFalg
                />
                <ExecuteNum
                  count={currentLineData?.receiptAmount}
                  type="AmountNumber"
                  uomPrecision={currentLineData?.financialPrecision}
                  numberFalg
                />
                {customizeTable(
                  {
                    code: 'SPRM.PURCHASE_PLAFORM_EXECUTION.REC_LINE',
                    dataSet: rcvLineDs,
                  },
                  <Table
                    dataSet={rcvLineDs}
                    columns={rcvLineCol}
                    style={{ maxHeight: `calc(100vh - 300px)` }}
                  />
                )}
              </div>
            </TabPane>
          )}
          {activeTab?.includes('billStatus') && billExit === 'new' && (
            <TabPane
              tab={
                <span>
                  {intl.get('sprm.purchasePlatform.title.settle').d('新开票')}
                  <NumberItem ds={settleLineDs} />
                </span>
              }
              key="settle"
            >
              <div>
                <TotalCountItem count={currentLineData?.billQuantity} ds={settleLineDs} numberFalg />
                {customizeTable(
                  {
                    code: 'SPRM.PURCHASE_PLAFORM_EXECUTION.SETTLE_LIST',
                    dataSet: settleLineDs,
                  },
                  <Table
                    dataSet={settleLineDs}
                    columns={settleLineCol}
                    style={{ maxHeight: `calc(100vh - 300px)` }}
                  />
                )}
              </div>
            </TabPane>
          )}
          {activeTab?.includes('billStatus') && billExit === 'old' && (
            <TabPane
              tab={
                <span>
                  {intl.get('sprm.purchasePlatform.title.invoice').d('旧开票')}
                  <NumberItem ds={invoiceLineDs} />
                </span>
              }
              key="invoice"
            >
              <div>
                <TotalCountItem count={currentLineData?.billQuantity} ds={invoiceLineDs} numberFalg />
                {customizeTable(
                  {
                    code: 'SPRM.PURCHASE_PLAFORM_EXECUTION.INVOICE_LIST',
                    dataSet: invoiceLineDs,
                  },
                  <Table
                    dataSet={invoiceLineDs}
                    columns={invoiceCol}
                    style={{ maxHeight: `calc(100vh - 300px)` }}
                  />
                )}
              </div>
            </TabPane>
          )}
          {activeTab?.includes('reconciliationStatus') && (
            <TabPane
              tab={
                <span>
                  {intl.get('sprm.purchasePlatform.title.reconciliation').d('对账')}
                  <NumberItem ds={reconciliationLineDs} />
                </span>
              }
              key="reconciliation"
            >
              <div>
                <TotalCountItem
                  numberFalg={currentLineData?.reconciliationQuantity > 0}
                  count={currentLineData?.reconciliationQuantity}
                  ds={reconciliationLineDs}
                />
                {customizeTable(
                  {
                    code: 'SPRM.PURCHASE_PLAFORM_EXECUTION.RECONCILIATION',
                    dataSet: reconciliationLineDs,
                  },
                  <Table
                    dataSet={reconciliationLineDs}
                    columns={reconciliationCol}
                    style={{ maxHeight: `calc(100vh - 300px)` }}
                  />
                )}
              </div>
            </TabPane>
          )}
          {activeTab?.includes('paymentStatus') && (
            <TabPane
              tab={
                <span>
                  {intl.get('sprm.purchasePlatform.title.payment').d('付款')}
                  <NumberItem ds={paymentLineDs} />
                </span>
              }
              key="payment"
            >
              <div>
                <TotalCountItem
                  count={currentLineData?.paymentQuantity}
                  ds={paymentLineDs}
                  numberFalg={currentLineData?.paymentQuantity > 0}
                />
                {customizeTable(
                  {
                    code: 'SPRM.PURCHASE_PLAFORM_EXECUTION.PAYMENT_LIST',
                    dataSet: paymentLineDs,
                  },
                  <Table
                    dataSet={paymentLineDs}
                    columns={paymentCol}
                    style={{ maxHeight: `calc(100vh - 300px)` }}
                  />
                )}
              </div>
            </TabPane>
          )}
        </Tabs>
      )
      }
    </Spin>
  );
};

export default formatterCollections({
  code: [
    'sprm.common',
    'sprm.purchasePlatform',
    'hzero.common',
    'hzero.c7nProUI',
    'entity.company',
    'entity.business',
    'entity.organization',
    'entity.roles',
    'entity.item',
    'sprm.purchaseRequisitionInquiry',
    'sprm.purchaseReqCreation',
    'sprm.purchaseRequisitionAssign',
    'sodr.sendOrder',
    'sodr.workspace',
  ],
})(
  withCustomize({
    unitCode: [
      'SPRM.PURCHASE_PLAFORM_EXECUTION.TAB',
      'SPRM.PURCHASE_PLAFORM_EXECUTION.PAYMENT_LIST',
      'SPRM.PURCHASE_PLAFORM_EXECUTION.RECONCILIATION',
      'SPRM.PURCHASE_PLAFORM_EXECUTION.INVOICE_LIST',
      'SPRM.PURCHASE_PLAFORM_EXECUTION.SETTLE_LIST',
      'SPRM.PURCHASE_PLAFORM_EXECUTION.REC_LINE',
      'SPRM.PURCHASE_PLAFORM_EXECUTION.SIECPRO.LIST',
      'SPRM.PURCHASE_PLAFORM_EXECUTION.SOLD.LIST',
      'SPRM.PURCHASE_PLAFORM_EXECUTION.ASN_LINE',
      'SPRM.PURCHASE_PLAFORM_EXECUTION.ORDER_LIST',
      'SPRM.PURCHASE_PLAFORM_EXECUTION.CONTRACT_LIST',
      'SPRM.PURCHASE_PLAFORM_EXECUTION.BID_LIST',
      'SPRM.PURCHASE_PLAFORM_EXECUTION.RFX_LIST',
      'SPRM.PURCHASE_PLAFORM_EXECUTION.PROJECT_LIST',
    ],
  })(ContectDoc)
);
