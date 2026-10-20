import React from 'react';
import { Form, Output, DataSet, Spin } from 'choerodon-ui/pro';
import { Tabs, Card } from 'choerodon-ui';
import { DETAIL_CARD_CLASSNAME } from 'utils/constants';
import { yesOrNoRender } from 'utils/renderer';
import Upload from '_components/Upload';
import uuidv4 from 'uuid/v4';
import intl from 'utils/intl';
import { amountLocalRender } from '@/utils/utils';
import { getBillLineDetail } from '@/services/reconciliationWorkbenchService';
import { decimalPointAccuracy } from '@/routes/utils';
import { compose } from 'lodash';
import withCustomize from 'srm-front-cuz/lib/components/c7n/withCustomize';

import { formDs, strategyDs } from './mainDS';

const prefix = 'ssta.reconciliationWorkbenchSup';
const { TabPane } = Tabs;
const camp = 'SUPPLIER';

const FilterDrawer = (props) => {
  const { customizeForm } = props;
  const [activeKey, setActiveKey] = React.useState('main');
  const [loadingData, setLoadingData] = React.useState(false);

  const detailDS = React.useMemo(() => new DataSet(formDs()), []);
  const strategyDS = React.useMemo(() => new DataSet(strategyDs()), []);
  const { record = {}, type } = props;
  const {
    settleId,
    settleConfigId,
    settleConfigNum,
    billHeaderId,
    settleBasePriceMeaning,
    settleModeMeaning,
    settleMatchDimensionMeaning,
  } = record.toData();
  strategyDS.setQueryParameter('type', type);
  strategyDS.setQueryParameter('settleConfigId', settleConfigId);
  strategyDS.setQueryParameter('settleConfigNum', settleConfigNum);
  React.useEffect(() => {
    setLoadingData(true);
    getBillLineDetail(settleId, camp, billHeaderId).then((res) => {
      if (res) {
        detailDS.loadData([{ ...record.toData(), ...res }]);
        setLoadingData(false);
      }
    });
    strategyDS.query().then((strRes) => {
      if (strRes) {
        strategyDS.loadData([
          {
            ...strRes,
            settleBasePriceMeaning,
            settleModeMeaning,
            settleMatchDimensionMeaning,
          },
        ]);
      }
    });
  }, []);

  const handleTabChange = (key) => {
    setActiveKey(key);
  };
  return (
    <Spin spinning={loadingData}>
      <Tabs activeKey={activeKey} animated onChange={handleTabChange}>
        <TabPane
          tab={intl.get('ssta.reconciliationWorkbenchSup.view.title.main').d('结算主信息')}
          key="main"
        >
          <Card
            bordered={false}
            className={DETAIL_CARD_CLASSNAME}
            title={intl
              .get('ssta.reconciliationWorkbenchSup.view.title.tradingPartyInformation')
              .d('交易方信息')}
          >
            {customizeForm(
              { code: 'SSTA.SUPPLIER_BILL_DETAIL_DRAWER.TRADING_PARTY' },
              <Form dataSet={detailDS} columns={3} useColon={false} labelLayout="vertical">
                <Output name="sourceCompanyNum" />
                <Output name="sourceCompanyName" />
                <Output name="sourceSupplierCompanyNum" />
                <Output name="sourceSupplierCompanyName" />
                <Output name="companyNum" />
                <Output name="companyName" />
                <Output name="supplierCompanyNum" />
                <Output name="supplierCompanyName" />
                <Output name="supplierSiteCode" />
                <Output name="sourceSupplierSiteCode" />
              </Form>
            )}
          </Card>
          <Card
            bordered={false}
            className={DETAIL_CARD_CLASSNAME}
            title={intl
              .get('ssta.reconciliationWorkbenchSup.view.title.transactionAmountInformation')
              .d('交易金额信息')}
          >
            {customizeForm(
              { code: 'SSTA.SUPPLIER_BILL_DETAIL_DRAWER.TRANSACTION_AMOUNT' },
              <Form dataSet={detailDS} columns={3} useColon={false} labelLayout="vertical">
                <Output name="itemCode" />
                <Output name="itemName" />
                <Output name="quantity" renderer={amountLocalRender} />
                <Output name="unitPriceBatch" renderer={amountLocalRender} />
                <Output name="netPriceMeaning" renderer={amountLocalRender} />
                <Output
                  name="netAmountMeaning"
                  renderer={({ value, record: currentRecord }) => {
                    return decimalPointAccuracy(value, currentRecord?.get('amountPrecision'), {
                      repair: true,
                      check: true,
                    });
                  }}
                />
                <Output name="taxIncludedPriceMeaning" renderer={amountLocalRender} />
                <Output
                  name="taxIncludedAmountMeaning"
                  renderer={({ value, record: currentRecord }) => {
                    return decimalPointAccuracy(value, currentRecord?.get('amountPrecision'), {
                      repair: true,
                      check: true,
                    });
                  }}
                />
                <Output name="taxRate" />
                <Output
                  name="taxAmountMeaning"
                  renderer={({ value, record: currentRecord }) => {
                    return decimalPointAccuracy(value, currentRecord?.get('amountPrecision'), {
                      repair: true,
                      check: true,
                    });
                  }}
                />
                <Output name="currencyCode" />
                <Output name="uom" />
                <Output name="specificationsModel" />
                <Output name="srmItemCode" />
                <Output name="categoryName" />
              </Form>
            )}
          </Card>
          <Card
            bordered={false}
            className={DETAIL_CARD_CLASSNAME}
            title={intl
              .get('ssta.reconciliationWorkbenchSup.view.title.transactionAffairInfo')
              .d('交易事务信息')}
          >
            {customizeForm(
              { code: 'SSTA.SUPPLIER_BILL_DETAIL_DRAWER.TRANSACTION_AFFAIR' },
              <Form dataSet={detailDS} columns={3} useColon={false} labelLayout="vertical">
                <Output name="settleNum" />
                <Output name="sourceSettleNum" />
                <Output name="sourceSettleLineNum" />
                <Output name="dataSourceMeaning" />
                <Output name="trxDate" />
                <Output name="trxYear" />
                <Output name="contractAndLineNum" />
                <Output name="poAndLineNum" />
                <Output name="asnAndLineNum" />
                <Output name="poLineLocation" />
                <Output name="releaseNum" />
                <Output name="orderType" />
                <Output name="purOrganizationName" />
                <Output name="invOrganizationName" />
                <Output name="inventoryName" />
                <Output name="trxTypeCode" />
                <Output name="trxTypeCodeMeaning" />
                <Output name="createdByName" />
                <Output name="purchaseAgentName" />
                <Output name="sourceParentSettleLineNum" />
                <Output
                  name="freightFlag"
                  renderer={({ value }) => {
                    return <>{yesOrNoRender(Number(value))}</>;
                  }}
                />
                <Output name="ecPoNum" />
                <Output name="ecPoSubNum" />
                <Output name="deliverTime" />
                <Output name="deliverQuantity" />
                <Output name="invoiceMethodMeaning" />
                <Output name="elecInvoiceView" />
                <Output name="afterSalesStatusMeaning" />
                <Output name="invoiceTypeMeaning" />
                <Output name="termCode" />
                <Output name="costName" />
                <Output
                  name="settleAttach"
                  renderer={({ record: currenrRecord }) => {
                    const uploadview = {
                      btnText: intl.get(`${prefix}.view.button.uploadView`).d('附件查看'),
                      showFilesNumber: true,
                      attachmentUUID: currenrRecord?.get('sinvLineAttachmentUuid') || uuidv4(),
                      bucketName: window.$$env.PRIVATE_BUCKET || 'private-bucket',
                      viewOnly: true,
                    };
                    return <Upload {...uploadview} />;
                  }}
                />
                <Output name="multiDealTrxNum" />
                <Output name="multiDealTrxLineNum" />
                <Output name="multiDealPoNum" />
                <Output name="multiDealPoLineNum" />
                <Output name="pcSubjectLineNum" />
                <Output name="poClosedFlagMeaning" />
                <Output name="unitName" />
              </Form>
            )}
          </Card>
        </TabPane>
        <TabPane
          tab={intl.get('ssta.reconciliationWorkbenchSup.view.title.run').d('结算执行信息')}
          key="run"
        >
          <Card
            bordered={false}
            className={DETAIL_CARD_CLASSNAME}
            title={intl
              .get('ssta.reconciliationWorkbenchSup.view.title.billHeaderInfo')
              .d('对账信息')}
          >
            {customizeForm(
              { code: 'SSTA.SUPPLIER_BILL_DETAIL_DRAWER.BILL_INFO' },
              <Form dataSet={detailDS} columns={3} useColon={false} labelLayout="vertical">
                <Output name="billOccupiedQuantity" renderer={amountLocalRender} />
                <Output name="billOccupiedNetAmountMeaning" renderer={amountLocalRender} />
                <Output name="billOccupiedTaxAmountMeaning" renderer={amountLocalRender} />
                <Output name="billOccupiedAmountMeaning" renderer={amountLocalRender} />
                <Output name="billCompletedQuantity" renderer={amountLocalRender} />
                <Output name="billCompletedNetAmountMeaning" renderer={amountLocalRender} />
                <Output name="billCompletedTaxAmountMeaning" renderer={amountLocalRender} />
                <Output name="billCompletedAmountMeaning" renderer={amountLocalRender} />
                <Output
                  name="billRemoveFlag"
                  renderer={({ value }) => {
                    return <>{yesOrNoRender(Number(value))}</>;
                  }}
                />
                <Output name="billLockQuantity" />
              </Form>
            )}
          </Card>
          <Card
            bordered={false}
            className={DETAIL_CARD_CLASSNAME}
            title={intl
              .get('ssta.reconciliationWorkbenchSup.view.title.invoiceHeaderInfo')
              .d('开票信息')}
          >
            {customizeForm(
              { code: 'SSTA.SUPPLIER_BILL_DETAIL_DRAWER.INVOICE_INFO' },
              <Form dataSet={detailDS} columns={3} useColon={false} labelLayout="vertical">
                <Output name="invoiceOccupiedQuantity" renderer={amountLocalRender} />
                <Output name="invoiceOccupiedNetAmountMeaning" renderer={amountLocalRender} />
                <Output name="invoiceOccupiedTaxAmountMeaning" renderer={amountLocalRender} />
                <Output name="invoiceOccupiedAmountMeaning" renderer={amountLocalRender} />
                <Output name="invoiceCompletedQuantity" renderer={amountLocalRender} />
                <Output name="invoiceCompletedNetAmountMeaning" renderer={amountLocalRender} />
                <Output name="invoiceCompletedTaxAmountMeaning" renderer={amountLocalRender} />
                <Output name="invoiceCompletedAmountMeaning" renderer={amountLocalRender} />
                <Output
                  name="invoiceRemoveFlag"
                  renderer={({ value }) => {
                    return <>{yesOrNoRender(Number(value))}</>;
                  }}
                />
                <Output name="invoiceLockQuantity" />
              </Form>
            )}
          </Card>
          <Card
            bordered={false}
            className={DETAIL_CARD_CLASSNAME}
            title={intl
              .get('ssta.reconciliationWorkbenchSup.view.title.collectionHeaderInfo')
              .d('收款信息')}
          >
            {customizeForm(
              { code: 'SSTA.SUPPLIER_BILL_DETAIL_DRAWER.PAYMENT_INFO' },
              <Form dataSet={detailDS} columns={3} useColon={false} labelLayout="vertical">
                <Output name="paymentOccupiedAmountMeaning" renderer={amountLocalRender} />
                <Output name="paymentCompletedAmountMeaning" renderer={amountLocalRender} />
                <Output
                  name="paymentRemoveFlag"
                  renderer={({ value }) => {
                    return <>{yesOrNoRender(Number(value))}</>;
                  }}
                />
                <Output name="paymentLockQuantity" />
              </Form>
            )}
          </Card>
        </TabPane>
        <TabPane
          tab={intl.get('ssta.reconciliationWorkbenchSup.view.title.strategy').d('结算策略信息')}
          key="strategy"
        >
          <Card
            bordered={false}
            className={DETAIL_CARD_CLASSNAME}
            title={intl
              .get('ssta.reconciliationWorkbenchSup.view.title.settleDataRule')
              .d('结算数据规则')}
          >
            {customizeForm(
              { code: 'SSTA.SUPPLIER_BILL_DETAIL_DRAWER.SETTLE_DATA_RULE' },
              <Form dataSet={strategyDS} columns={3} useColon={false} labelLayout="vertical">
                <Output name="settleConfigNum" />
                <Output name="settleConfigName" />
                <Output name="versionNumber" />
                <Output name="settleBasePriceMeaning" />
                <Output name="settleModeMeaning" />
                <Output name="settleMatchDimensionMeaning" />
              </Form>
            )}
          </Card>
          <Card
            bordered={false}
            className={DETAIL_CARD_CLASSNAME}
            title={intl.get('ssta.reconciliationWorkbenchSup.view.title.billRule').d('对账单规则')}
          >
            {customizeForm(
              { code: 'SSTA.SUPPLIER_BILL_DETAIL_DRAWER.BILL_RULE' },
              <Form dataSet={strategyDS} columns={3} useColon={false} labelLayout="vertical">
                <Output name="billCompanyMeaning" />
                <Output name="billSupplierMeaning" />
                <Output
                  name="billPartMatchFlag"
                  renderer={({ value }) => {
                    return <>{yesOrNoRender(Number(value))}</>;
                  }}
                />
                <Output
                  name="priceAdjustFlag"
                  renderer={({ value }) => {
                    return <>{yesOrNoRender(Number(value))}</>;
                  }}
                />
                <Output
                  name="billDependencyFlag"
                  renderer={({ value }) => {
                    return <>{yesOrNoRender(Number(value))}</>;
                  }}
                />
              </Form>
            )}
          </Card>
        </TabPane>
      </Tabs>
    </Spin>
  );
};

export default compose(
  // formatterCollections({ code: ['ssta.reconciliationWorkbench'] }),
  withCustomize({
    unitCode: [
      'SSTA.SUPPLIER_BILL_DETAIL_DRAWER.BILL_INFO',
      'SSTA.SUPPLIER_BILL_DETAIL_DRAWER.BILL_RULE',
      'SSTA.SUPPLIER_BILL_DETAIL_DRAWER.INVOICE_INFO',
      'SSTA.SUPPLIER_BILL_DETAIL_DRAWER.PAYMENT_INFO',
      'SSTA.SUPPLIER_BILL_DETAIL_DRAWER.SETTLE_DATA_RULE',
      'SSTA.SUPPLIER_BILL_DETAIL_DRAWER.TRADING_PARTY',
      'SSTA.SUPPLIER_BILL_DETAIL_DRAWER.TRANSACTION_AFFAIR',
      'SSTA.SUPPLIER_BILL_DETAIL_DRAWER.TRANSACTION_AMOUNT',
    ],
  })
)(FilterDrawer);
