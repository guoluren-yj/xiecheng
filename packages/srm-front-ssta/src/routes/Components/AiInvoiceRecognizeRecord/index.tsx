import React, { useMemo, useContext } from 'react';
import { Modal } from 'choerodon-ui/pro';
import { Tabs } from 'choerodon-ui';
import { observer } from 'mobx-react';

import intl from 'utils/intl';

import RecordTable from './components/RecordTable';
import StoreProvider, { Store } from './stores';
import type { StoreValueType } from './stores';
import { AiRecognizeStatus } from './utils/type';
import commonStyles from '../../common.less';

const { TabPane } = Tabs;

const AiInvoiceRecognizeRecordContent = observer(() => {
  const { dsMap, activeKey, handleTabChange } = useContext<StoreValueType>(Store);

  const tabList = useMemo(() => [
    {
      key: AiRecognizeStatus.Pending,
      title: intl.get('ssta.aiRecognizeRecord.view.title.recognizeing').d('识别中'),
    },
    {
      key: AiRecognizeStatus.Success,
      title: intl.get('ssta.aiRecognizeRecord.view.title.recognizeSuccess').d('识别成功'),
    },
    {
      key: AiRecognizeStatus.Fail,
      title: intl.get('ssta.aiRecognizeRecord.view.title.recognizeFail').d('识别失败'),
    },
  ], []);

  return (
    <Tabs animated={false} activeKey={activeKey} onChange={handleTabChange}>
      {tabList.map(({ key, title }) => (
        <TabPane key={key} tab={title} count={dsMap[key].getState('totalCount') || 0}>
          <RecordTable activeKey={key} />
        </TabPane>
      ))}
    </Tabs>
  );
});

const AiInvoiceRecognizeRecord = (props) => {
  return (
    <StoreProvider {...props}>
      <AiInvoiceRecognizeRecordContent />
    </StoreProvider>
  );
};

export const openAiInvoiceRecognizeRecord = ({
  isSupplier = false,
  history,
}: {
  isSupplier?: boolean;
  history?: any;
} = {}) => {
  Modal.open({
    drawer: true,
    closable: true,
    destroyOnClose: true,
    className: commonStyles['ssta-large-modal'],
    title: intl.get('ssta.common.view.title.aiRecoginzeRecord').d('AI识别记录'),
    children: <AiInvoiceRecognizeRecord isSupplier={isSupplier} history={history} />,
    okCancel: false,
    okText: intl.get('hzero.common.button.close').d('关闭'),
  });
};

export default AiInvoiceRecognizeRecord;
