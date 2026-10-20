import React, { useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { Tabs } from 'choerodon-ui';
import intl from 'utils/intl';
import Evaluation from './Evaluation';
// import CustomSpecModal from '@/routes/QuotePurchaseRequisition/components/CustomSpecModal';
import { Store } from './stores';
import BasicTable from './BasicTable';
import OtherTable from './OtherTable';
import AssociatedTable from './AssociatedTable';
import PartnerTable from './PartnerTable';

const { TabPane } = Tabs;

// 设置sodr国际化前缀 - common - message
const titlePrompt = 'sodr.sendOrder.view.title';

const List = function List(props) {
  const { header } = props;
  const {
    handRadioGroupValueChange,
    customizeTabPane,
    sourceFromCancel,
    settingsDs,
    listDs,
  } = useContext(Store);
  return (
    <>
      {customizeTabPane(
        {
          code: sourceFromCancel
            ? 'SODR.ORDER_PROCESS_CONTROL_DETAIL.TAB'
            : 'SODR.SEND_ORDER_DETAIL.TAB',
        },
        <Tabs onChange={handRadioGroupValueChange} className="detail-list" animated={false}>
          <TabPane key="basic" tab={intl.get(`${titlePrompt}.basicInfo`).d('基础信息')}>
            <BasicTable header={header} />
          </TabPane>
          <TabPane key="others" tab={intl.get(`${titlePrompt}.otherInfo`).d('其他信息')}>
            <OtherTable />
          </TabPane>
          <TabPane
            disabled={listDs.status !== 'ready'}
            key="invoice"
            tab={intl.get(`${titlePrompt}.docRelate`).d('关联单据')}
          >
            <AssociatedTable />
          </TabPane>
          <TabPane key="partners" tab={intl.get(`${titlePrompt}.partners`).d('合作方')}>
            <PartnerTable />
          </TabPane>
          {settingsDs.current?.get('010217') === '1' && (
            <TabPane key="evaluation" tab={intl.get(`sodr.common.view.message.evaluate`).d('评价')}>
              <Evaluation />
            </TabPane>
          )}
        </Tabs>
      )}
      {/* {customVisable && <CustomSpecModal {...CustomSpecProps} />} */}
    </>
  );
};

export default observer(List);
