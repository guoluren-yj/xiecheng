import React, { useState } from 'react';
import intl from 'utils/intl';
import { Button, Modal } from 'choerodon-ui/pro';
import { Header } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';

import OperationList from '../OperationList';
import LeftMenu from './LeftMenu';
import RightPanel from './RightPanel';
import styles from './index.less';

const recordKey = Modal.key();

const Detail = (props) => {
  const { match } = props;

  const tenantId = match?.params?.tenantId ?? '';
  const socialCode = match?.params?.socialCode ?? '';
  const client = match?.params?.client ?? '';
  const enterpriseName = match?.params?.enterpriseName ?? '';

  const [selected, setSelected] = useState(null);

  const handleSelectItem = (item) => {
    setSelected(item);
  };

  /**
   * 查看监控记录
   */
  const handleViewRecord = () => {
    let modal = null;

    const handleCloseModal = () => {
      if (modal) {
        modal.close();
      }
    };

    modal = Modal.open({
      title: intl.get(`sdat.riskControl.view.button.monitorRecord`).d('监控记录'),
      children: (
        <OperationList
          client={client}
          modalType="riskDetail"
          tenantId={tenantId}
          socialCode={socialCode}
          userId={selected?.userId}
          enterpriseName={enterpriseName}
        />
      ),
      key: recordKey,
      closable: false,
      drawer: true,
      mask: true,
      style: { width: '742px' },
      footer: (
        <div>
          <Button color="primary" onClick={handleCloseModal}>
            {intl.get(`hzero.common.button.close`).d('关闭')}
          </Button>
        </div>
      ),
    });
  };

  return (
    <>
      <Header
        title={intl
          .get('sdat.eventUpdateSummary.view.title.eventUpdateSummary')
          .d('事件更新汇总查询')}
        backPath="/sdat/event-update-summary/list"
      >
        <Button funcType="flat" icon="assignment" onClick={handleViewRecord}>
          {intl.get('sdat.eventUpdateSummary.view').d('监控记录')}
        </Button>
      </Header>
      <div className={styles['event-update-summary-detail-basic']}>
        <LeftMenu
          onSelect={handleSelectItem}
          tenantId={tenantId}
          socialCode={socialCode}
          client={client}
        />
        <RightPanel localRecord={selected} history={history} client={client} />
      </div>
    </>
  );
};

export default formatterCollections({
  code: [
    'sdat.eventUpdateSummary',
    'sdat.riskControl',
    'sdat.monitorBusiness',
    'sdat.riskDefinition',
    'sdat.monitorStuff',
    'sdat.common',
  ],
})(Detail);
