import React from 'react';
import { Form, Output, DataSet, Spin } from 'choerodon-ui/pro';
import { Tabs, Card } from 'choerodon-ui';
import intl from 'utils/intl';
import { DETAIL_CARD_CLASSNAME } from 'utils/constants';
import { yesOrNoRender } from 'utils/renderer';
import { amountLocalRender } from '@/utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';

import { getBillLineDetail } from '@/services/ecAutoBillService';
import { settleDetailDS as settleDetailDs, strategyDS as strategyDs } from '@/stores/EcAutoBillDS';

const { TabPane } = Tabs;

const promptCode = 'ssta.ecAutoBill';

const DetailDrawer = (props) => {
  const [activeKey, setActiveKey] = React.useState('main');
  const [loadingData, setLoadingData] = React.useState(false);

  const settleDetailDS = React.useMemo(() => new DataSet(settleDetailDs()), []);
  const strategyDS = React.useMemo(() => new DataSet(strategyDs()), []);

  const { record = {} } = props;
  const { settleId, settleConfigNum } = record.toData();
  strategyDS.setQueryParameter('settleConfigNum', settleConfigNum);
  React.useEffect(() => {
    setLoadingData(true);
    getBillLineDetail(settleId).then((res) => {
      if (res) {
        settleDetailDS.loadData([{ ...record.toData(), ...res }]);
        setLoadingData(false);
      }
    });
    strategyDS.query().then((strRes) => {
      if (strRes) {
        strategyDS.loadData([
          {
            ...strRes,
            settleBasePriceMeaning: record.get('settleBasePriceMeaning'),
            settleModeMeaning: record.get('settleModeMeaning'),
            settleMatchDimensionMeaning: record.get('settleMatchDimensionMeaning'),
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
          tab={intl.get(`${promptCode}.view.title.settleMainInfo`).d('结算主信息')}
          key="main"
        >
          <Card
            bordered={false}
            className={DETAIL_CARD_CLASSNAME}
            title={intl.get(`${promptCode}.view.title.transactionParty`).d('交易方信息')}
          >
            <Form dataSet={settleDetailDS} columns={3} labelWidth={130}>
              <Output name="sourceCompanyNum" />
              <Output name="sourceCompanyName" />
              <Output name="sourceSupplierCompanyNum" />
              <Output name="sourceSupplierCompanyName" />
              <Output name="companyNum" />
              <Output name="companyName" />
              <Output name="supplierCompanyNum" />
              <Output name="supplierCompanyName" />
            </Form>
          </Card>
          <Card
            bordered={false}
            className={DETAIL_CARD_CLASSNAME}
            title={intl.get(`${promptCode}.view.title.transactionAmount`).d('交易金额信息')}
          >
            <Form dataSet={settleDetailDS} columns={3} labelWidth={130}>
              <Output name="itemCode" />
              <Output name="itemName" />
              <Output name="quantity" renderer={amountLocalRender} />
              <Output name="unitPriceBatch" renderer={amountLocalRender} />
              <Output name="netPriceMeaning" renderer={amountLocalRender} />
              <Output name="netAmountMeaning" renderer={amountLocalRender} />
              <Output name="netPrice" renderer={amountLocalRender} />
              <Output name="taxIncludedPrice" renderer={amountLocalRender} />
              <Output name="taxRate" />
              <Output name="taxAmount" renderer={amountLocalRender} />
              <Output name="currencyCode" />
              <Output name="uom" />
              <Output name="specificationsModel" />
              <Output name="srmItemCode" />
              <Output name="categoryName" />
            </Form>
          </Card>
          <Card
            bordered={false}
            className={DETAIL_CARD_CLASSNAME}
            title={intl.get(`${promptCode}.view.title.transactionAffair`).d('交易事务信息')}
          >
            <Form dataSet={settleDetailDS} columns={3} labelWidth={130}>
              <Output name="settleNum" />
              <Output name="sourceSettleNum" />
              <Output name="sourceSettleLineNum" />
              <Output name="dataSource" />
              <Output name="trxDate" />
              <Output name="trxYear" />
              <Output name="contractLineNum" />
              <Output name="poLineNum" />
              <Output name="asnLineNum" />
              <Output name="poLineLocation" />
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
            </Form>
          </Card>
        </TabPane>
        <TabPane
          tab={intl.get(`${promptCode}.view.title.settleRunInfo`).d('结算执行信息')}
          key="run"
        >
          <Card
            bordered={false}
            className={DETAIL_CARD_CLASSNAME}
            title={intl.get(`${promptCode}.view.title.billInfo`).d('对账信息')}
          >
            <Form dataSet={settleDetailDS} columns={3} labelWidth={130}>
              <Output name="billOccupiedQuantity" renderer={amountLocalRender} />
              <Output name="billOccupiedNetAmount" renderer={amountLocalRender} />
              <Output name="billOccupiedTaxAmount" renderer={amountLocalRender} />
              <Output name="billOccupiedAmountMeaning" renderer={amountLocalRender} />
              <Output name="billCompletedQuantity" renderer={amountLocalRender} />
              <Output name="billCompletedNetAmount" renderer={amountLocalRender} />
              <Output name="billCompletedTaxAmount" renderer={amountLocalRender} />
              <Output name="billCompletedAmountMeaning" renderer={amountLocalRender} />
              <Output
                name="billRemoveFlag"
                renderer={({ value }) => {
                  return <>{yesOrNoRender(Number(value))}</>;
                }}
              />
              <Output name="billLockQuantity" />
            </Form>
          </Card>
          <Card
            bordered={false}
            className={DETAIL_CARD_CLASSNAME}
            title={intl.get(`${promptCode}.view.title.invoiceInfo`).d('开票信息')}
          >
            <Form dataSet={settleDetailDS} columns={3} labelWidth={130}>
              <Output name="invoiceOccupiedQuantity" renderer={amountLocalRender} />
              <Output name="invoiceOccupiedNetAmount" renderer={amountLocalRender} />
              <Output name="invoiceOccupiedTaxAmount" renderer={amountLocalRender} />
              <Output name="invoiceOccupiedAmount" renderer={amountLocalRender} />
              <Output name="invoiceCompletedQuantity" renderer={amountLocalRender} />
              <Output name="invoiceCompletedNetAmountMeaning" renderer={amountLocalRender} />
              <Output name="invoiceCompletedTaxAmountMeaning" renderer={amountLocalRender} />
              <Output name="invoiceCompletedAmount" />
              <Output
                name="invoiceRemoveFlag"
                renderer={({ value }) => {
                  return <>{yesOrNoRender(Number(value))}</>;
                }}
              />
              <Output name="invoiceLockQuantity" />
            </Form>
          </Card>
          <Card
            bordered={false}
            className={DETAIL_CARD_CLASSNAME}
            title={intl.get(`${promptCode}.view.title.paymentInfo`).d('付款开票')}
          >
            <Form dataSet={settleDetailDS} columns={3} labelWidth={130}>
              <Output name="paymentOccupiedAmount" renderer={amountLocalRender} />
              <Output name="paymentCompletedAmount" renderer={amountLocalRender} />
              <Output
                name="paymentRemoveFlag"
                renderer={({ value }) => {
                  return <>{yesOrNoRender(Number(value))}</>;
                }}
              />
              <Output name="paymentLockQuantity" />
            </Form>
          </Card>
        </TabPane>
        <TabPane
          tab={intl.get(`${promptCode}.view.title.settleStrategyInfo`).d('结算策略信息')}
          key="strategy"
        >
          <Card
            bordered={false}
            className={DETAIL_CARD_CLASSNAME}
            title={intl.get(`${promptCode}.view.title.settleDataRules`).d('结算数据规则')}
          >
            <Form dataSet={strategyDS} columns={3} labelWidth={130}>
              <Output name="settleConfigNum" />
              <Output name="settleConfigName" />
              <Output name="versionNumber" />
              <Output name="settleBasePriceMeaning" />
              <Output name="settleModeMeaning" />
              <Output name="settleMatchDimensionMeaning" />
            </Form>
          </Card>
          <Card
            bordered={false}
            className={DETAIL_CARD_CLASSNAME}
            title={intl.get(`${promptCode}.view.title.billRules`).d('对账单规则')}
          >
            <Form dataSet={strategyDS} columns={3} labelWidth={130}>
              <Output name="billCompanyMeaning" />
              <Output name="billSupplierMeaning" />
              <Output
                name="partMatchFlag"
                renderer={({ value }) => {
                  return <>{yesOrNoRender(Number(value))}</>;
                }}
              />
              <Output
                name="priceUpdFlag"
                renderer={({ value }) => {
                  return <>{yesOrNoRender(Number(value))}</>;
                }}
              />
              <Output
                name="dependencyFlag"
                renderer={({ value }) => {
                  return <>{yesOrNoRender(Number(value))}</>;
                }}
              />
            </Form>
          </Card>
        </TabPane>
      </Tabs>
    </Spin>
  );
};

export default formatterCollections({ code: [promptCode] })(DetailDrawer);
