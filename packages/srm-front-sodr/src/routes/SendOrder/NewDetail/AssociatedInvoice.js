import React, { useContext } from 'react';
import intl from 'utils/intl';
import { Tabs } from 'choerodon-ui';
import { Store } from './stores';
import DscTable from './DscTable';
import AsnTable from './AsnTable';
import RcvTable from './RcvTable';
import BillTable from './BillTable';
import InvoiceTable from './InvoiceTable';

const { TabPane } = Tabs;
const modelPrompt = 'sodr.sendOrder.model.common';

const AssociatedInvoice = function AssociatedInvoice() {
  const { sourceFromCancel, dscDs, asnDs, rcvDs, billDs, invoiceDs } = useContext(Store);
  return (
    <Tabs animated={false} destroyInactiveTabPane>
      {!sourceFromCancel && (
        <TabPane
          key="dsc"
          title={intl.get(`${modelPrompt}.deliverySchedule`).d('交货计划')}
          count={() => dscDs.length}
        >
          <DscTable dataSet={dscDs} />
        </TabPane>
      )}
      <TabPane
        key="asn"
        title={intl.get(`${modelPrompt}.deliveryOrder`).d('送货单')}
        count={() => asnDs.length}
      >
        <AsnTable dataSet={asnDs} />
      </TabPane>
      <TabPane
        key="rcv"
        title={intl.get(`${modelPrompt}.receivingRecord`).d('收货记录')}
        count={() => rcvDs.length}
      >
        <RcvTable dataSet={rcvDs} />
      </TabPane>
      <TabPane
        key="bill"
        title={intl.get(`${modelPrompt}.statement`).d('对账单')}
        count={() => billDs.length}
      >
        <BillTable dataSet={billDs} />
      </TabPane>
      <TabPane
        key="invoice"
        title={intl.get(`${modelPrompt}.onlineInvoice`).d('网上发票')}
        count={() => invoiceDs.length}
      >
        <InvoiceTable dataSet={invoiceDs} />
      </TabPane>
    </Tabs>
  );
};

export default AssociatedInvoice;
