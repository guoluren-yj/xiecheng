import React from 'react';
import { Form, Output, DataSet, Spin } from 'choerodon-ui/pro';
import { Tabs, Card } from 'choerodon-ui';
import { DETAIL_CARD_CLASSNAME } from 'utils/constants';
import { yesOrNoRender } from 'utils/renderer';
import { compose } from 'lodash';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import Upload from '_components/Upload';
import uuidv4 from 'uuid/v4';
import intl from 'utils/intl';
import { amountLocalRender } from '@/utils/utils';
import { decimalPointAccuracy } from '@/routes/utils';
import { detailDS as detailDs, configDS as configDs } from '../../../stores/PurchaseSettlePoolDS';

const { TabPane } = Tabs;
const prefix = 'ssta.purchaseSettle';
const DetailDrawer = (props) => {
  const [activeKey, setActiveKey] = React.useState('main');

  const detailDS = React.useMemo(() => new DataSet(detailDs()), []);

  const configDS = React.useMemo(() => new DataSet(configDs()), []);

  const { record, documentType, customizeForm, type } = props;
  React.useEffect(() => {
    const {
      settleId,
      settleConfigId,
      settleConfigNum,
      settleBasePriceMeaning,
      settleMatchDimensionMeaning,
    } = record.toData();
    // 区分详情页的行详情与新增弹出框的行详情
    detailDS.setQueryParameter('settleId', settleId);
    detailDS.setQueryParameter('type', 'A');
    configDS.setQueryParameter('type', type);
    configDS.setQueryParameter('settleConfigId', settleConfigId);
    configDS.setQueryParameter('settleConfigNum', settleConfigNum);
    detailDS.query().then((res) => {
      if (res) {
        configDS.query().then((item) => {
          detailDS.loadData([
            {
              ...res,
              ...item,
              settleBasePriceMeaning,
              // settleModeMeaning,
              settleMatchDimensionMeaning,
            },
          ]);
        });
      }
    });
  }, []);

  const handleTabChange = (key) => {
    setActiveKey(key);
  };
  return (
    <Spin dataSet={detailDS}>
      <Tabs activeKey={activeKey} animated onChange={handleTabChange}>
        <TabPane
          tab={intl.get('ssta.purchaseSettle.view.title.settleMainInfo').d('结算主信息')}
          key="main"
        >
          <Card
            bordered={false}
            className={DETAIL_CARD_CLASSNAME}
            title={intl.get('ssta.purchaseSettle.view.title.transactionParty').d('交易方信息')}
          >
            {customizeForm(
              { code: 'SSTA.PURCHASE_SETTLE_DETAIL.TRADING_PARTY' },
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
            title={intl.get('ssta.purchaseSettle.view.title.transactionAmount').d('交易金额信息')}
          >
            {customizeForm(
              {
                code:
                  documentType === 'INVOICE'
                    ? 'SSTA.PURCHASE_SETTLE_DETAIL.MASTER_INFO_DETAIL'
                    : 'SSTA.PURCHASE_SETTLE_DETAIL.PAY_MASTER_INFO_DETAIL',
              },
              <Form dataSet={detailDS} columns={3} useColon={false} labelLayout="vertical">
                <Output name="itemCode" />
                <Output name="itemName" />
                <Output name="quantity" renderer={amountLocalRender} />
                <Output name="unitPriceBatch" renderer={amountLocalRender} />
                <Output name="netPrice" renderer={amountLocalRender} />
                <Output
                  name="netAmount"
                  renderer={({ value, record: currentRecord }) => {
                    return decimalPointAccuracy(value, currentRecord?.get('amountPrecision'), {
                      repair: true,
                      check: true,
                    });
                  }}
                />
                <Output name="taxIncludedPrice" renderer={amountLocalRender} />
                <Output
                  name="taxIncludedAmount"
                  renderer={({ value, record: currentRecord }) => {
                    return decimalPointAccuracy(value, currentRecord?.get('amountPrecision'), {
                      repair: true,
                      check: true,
                    });
                  }}
                />
                <Output name="taxRate" />
                <Output
                  name="taxAmount"
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
            title={intl.get('ssta.purchaseSettle.view.title.transactionAffair').d('交易事务信息')}
          >
            {customizeForm(
              {
                code: 'SSTA.PURCHASE_SETTLE_DETAIL.TRADING.AFFAIRSINFO',
              },
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
                <Output name="sourceParentSettleAndLineNum" />
                <Output name="freightFlag" renderer={({ value }) => yesOrNoRender(value)} />
                <Output name="ecPoNum" />
                <Output name="ecPoSubNum" />
                <Output name="deliverTime" />
                <Output name="deliverQuantity" />
                <Output name="invoiceMethodMeaning" />
                {/* <Output
                  name="invoiceInfo"
                  renderer={() => {
                    return <a>{intl.get('hzero.common.button.view').d('查看')}</a>;
                  }}
                /> */}
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
          tab={intl.get('ssta.purchaseSettle.view.title.settleRunInfo').d('结算执行信息')}
          key="run"
        >
          <Card
            bordered={false}
            className={DETAIL_CARD_CLASSNAME}
            title={intl.get('ssta.purchaseSettle.view.title.billInfo').d('对账信息')}
          >
            <Form dataSet={detailDS} columns={3} useColon={false} labelLayout="vertical">
              <Output name="billOccupiedQuantity" renderer={amountLocalRender} />
              <Output name="billOccupiedNetAmount" renderer={amountLocalRender} />
              <Output name="billOccupiedTaxAmount" renderer={amountLocalRender} />
              <Output name="billOccupiedAmount" renderer={amountLocalRender} />
              <Output name="billCompletedQuantity" renderer={amountLocalRender} />
              <Output name="billCompletedNetAmount" renderer={amountLocalRender} />
              <Output name="billCompletedTaxAmount" renderer={amountLocalRender} />
              <Output name="billCompletedAmount" renderer={amountLocalRender} />
              <Output name="billRemoveFlag" renderer={({ value }) => yesOrNoRender(value)} />
              <Output name="billLockQuantity" />
            </Form>
          </Card>
          <Card
            bordered={false}
            className={DETAIL_CARD_CLASSNAME}
            title={intl.get('ssta.purchaseSettle.view.title.invoiceInfo').d('开票信息')}
          >
            <Form dataSet={detailDS} columns={3} useColon={false} labelLayout="vertical">
              <Output name="invoiceOccupiedQuantity" renderer={amountLocalRender} />
              <Output name="invoiceOccupiedNetAmount" renderer={amountLocalRender} />
              <Output name="invoiceOccupiedTaxAmount" renderer={amountLocalRender} />
              <Output name="invoiceOccupiedAmount" renderer={amountLocalRender} />
              <Output name="invoiceCompletedQuantity" renderer={amountLocalRender} />
              <Output name="invoiceCompletedNetAmount" renderer={amountLocalRender} />
              <Output name="invoiceCompletedTaxAmount" renderer={amountLocalRender} />
              <Output name="invoiceCompletedAmount" renderer={amountLocalRender} />
              <Output name="invoiceRemoveFlag" renderer={({ value }) => yesOrNoRender(value)} />
              <Output name="invoiceLockQuantity" />
            </Form>
          </Card>
          <Card
            bordered={false}
            className={DETAIL_CARD_CLASSNAME}
            title={intl.get('ssta.purchaseSettle.view.title.paymentInfo').d('付款信息')}
          >
            <Form dataSet={detailDS} columns={3} useColon={false} labelLayout="vertical">
              <Output name="paymentOccupiedAmount" renderer={amountLocalRender} />
              <Output name="paymentCompletedAmount" renderer={amountLocalRender} />
              <Output name="paymentRemoveFlag" renderer={({ value }) => yesOrNoRender(value)} />
              <Output name="paymentLockQuantity" />
            </Form>
          </Card>
        </TabPane>
        <TabPane
          tab={intl.get('ssta.purchaseSettle.view.title.settleStrategyInfo').d('结算策略信息')}
          key="strategy"
        >
          <Card
            bordered={false}
            className={DETAIL_CARD_CLASSNAME}
            title={intl.get('ssta.purchaseSettle.view.title.settleDataRules').d('结算数据规则')}
          >
            <Form dataSet={detailDS} columns={3} useColon={false} labelLayout="vertical">
              <Output name="settleConfigNum" />
              <Output name="settleConfigName" />
              <Output name="versionNumber" />
            </Form>
            <Form dataSet={detailDS} columns={3} useColon={false} labelLayout="vertical">
              <Output name="settleBasePriceMeaning" />
              <Output name="settleModeMeaning" />
              <Output name="settleMatchDimensionMeaning" />
            </Form>
          </Card>
          <Card
            bordered={false}
            className={DETAIL_CARD_CLASSNAME}
            title={intl.get('ssta.purchaseSettle.view.title.billRules').d('结算单规则')}
          >
            <Form dataSet={detailDS} columns={3} useColon={false} labelLayout="vertical">
              <Output name="invoiceSettleCompanyCodeMeaning" />
              <Output name="paymentSettleCompanyCodeMeaning" />
              <Output name="invoiceSettleSupplierCodeMeaning" />
              <Output name="paymentSettleSupplierCodeMeaning" />
              <Output name="invoicePartMatchFlag" renderer={({ value }) => yesOrNoRender(value)} />
              <Output name="paymentPartMatchFlag" renderer={({ value }) => yesOrNoRender(value)} />
              <Output name="invoicePriceEditFlag" renderer={({ value }) => yesOrNoRender(value)} />
              <Output
                name="invoiceTaxRateEditFlag"
                renderer={({ value }) => yesOrNoRender(value)}
              />
              <Output
                name="invoiceTaxAmountEditFlag"
                renderer={({ value }) => yesOrNoRender(value)}
              />
              <Output name="taxAmountAllowanceRange" />
              <Output name="invoiceDependencyFlag" renderer={({ value }) => yesOrNoRender(value)} />
              <Output name="paymentDependencyFlag" renderer={({ value }) => yesOrNoRender(value)} />
            </Form>
          </Card>
        </TabPane>
      </Tabs>
    </Spin>
  );
};

export default compose(
  withCustomize({
    unitCode: [
      'SSTA.PURCHASE_SETTLE_DETAIL.MASTER_INFO_DETAIL',
      'SSTA.PURCHASE_SETTLE_DETAIL.PAY_MASTER_INFO_DETAIL',
      'SSTA.PURCHASE_SETTLE_DETAIL.TRADING_PARTY',
      'SSTA.PURCHASE_SETTLE_DETAIL.TRADING.AFFAIRSINFO',
    ],
  })
)(DetailDrawer);
