import React, { useState } from 'react';
import { Button } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';
import { Header } from 'components/Page';
import IntentList from './IntentList';
import IntentDetail from './IntentDetail';
import { confirmIntentLetter, rejectIntentLetter } from './api';
import styles from './index.less';

function BusiOpport() {
  const [letter, setLetter] = useState({});
  const [refresh, setRefresh] = useState(0);
  const [{ confirmLoading, rejectLoading }, setLoadings] = useState({
    confirmLoading: false,
    rejectLoading: false,
  });
  const toggleLoading = (key) => {
    setLoadings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  async function handleIntent(api, loadingKey) {
    toggleLoading(loadingKey);
    const res = getResponse(await api(letter));
    toggleLoading(loadingKey);
    if (res) {
      setRefresh((c) => c + 1);
      notification.success();
    }
  }

  const { letterId, letterStatus } = letter;

  return (
    <>
      <Header title={intl.get('smkt.busiOpport.view.title.discoverBusiOpport').d('发现商机')}>
        {letterId &&
          letterStatus === 'PENDING' && [
            <Button
              icon="check"
              color="primary"
              loading={confirmLoading}
              disabled={rejectLoading}
              onClick={() => handleIntent(confirmIntentLetter, 'confirmLoading')}
            >
              {intl.get('hzero.common.button.confrim').d('确认')}
            </Button>,
            <Button
              icon="close"
              funcType="flat"
              loading={rejectLoading}
              disabled={confirmLoading}
              onClick={() => handleIntent(rejectIntentLetter, 'rejectLoading')}
            >
              {intl.get('hzero.common.button.reject').d('拒绝')}
            </Button>,
          ]}
      </Header>
      <div className={styles['busi-page-content']}>
        <div className="busi-content-left">
          <IntentList
            loading={confirmLoading || rejectLoading}
            refresh={refresh}
            letterId={letterId}
            onSelect={(l) => setLetter(l)}
          />
        </div>
        <div className="busi-content-right">
          <IntentDetail refresh={refresh} letter={letter} />
        </div>
      </div>
    </>
  );
}

export default formatterCollections({
  code: ['smpc.product', 'smkt.supplierManage', 'smkt.busiOpport', 'smkt.selection'],
})(BusiOpport);
