import React, { useContext, useEffect } from 'react';
import { Spin } from 'choerodon-ui/pro';
import { Collapse } from 'choerodon-ui';

import intl from 'utils/intl';
import { TopSection } from '_components/Section';

import type { StoreValueType } from './stores';
import StoreProvider, { Store } from './stores';
import styles from '../index.less';

import {
    ExtraCard,
    HeaderInfo,
    Summary,
    PayRecord,
    TransferOutRecord,
  } from './CardList';

const { Panel } = Collapse;

const Detail = () => {

  const {
    remote,

    loading,
    depositHeaderDs,
    onLoad,
    onFormLoaded,
    getHocInstance,
    getCustomizeUnitCode,
  } = useContext<StoreValueType>(Store);

  useEffect(() => {
    if (remote?.event) {
      remote.event.fireEvent('onLoad', {
        depositHeaderDs,
        onLoad,
      });
    }
  }, []);

  useEffect(() => {
    if (onFormLoaded && depositHeaderDs?.current?.get('depositId')) {
      onFormLoaded(true);
    }
  }, [depositHeaderDs?.current, onFormLoaded])


  return (
    <div className={styles['ssta-deposit-approval-wrapper']}>
    <Spin spinning={loading}>
      <TopSection
          getHocInstance={getHocInstance}
          className={`${styles['approval-common-top-section-card']} ${styles['ssta-deposit-approval-af-basic-card']}`}
          titleProps={{ style: { display: 'none' } }} code={''} title={undefined}      >
        <HeaderInfo />
      </TopSection>
      <TopSection
          getHocInstance={getHocInstance}
          titleProps={{ style: { display: 'none' } }}
          className={`${styles['ssta-deposit-approval-af-extra-card']}`} 
          code={''} 
          title={undefined}        >
         <ExtraCard />
      </TopSection>
      <TopSection
          getHocInstance={getHocInstance}
          className={styles['approval-common-top-section-card']} 
          code={''} 
          title={undefined} 
          titleProps={{ style: { display: 'none' } }}  
          >
        <Summary/>
      </TopSection>
      <TopSection
          getHocInstance={getHocInstance}
          code={getCustomizeUnitCode('payRecordCard')}
          className={styles['approval-common-top-section-card']}
          title={intl.get(`ssta.sourcingCost.view.title.payRecord`).d('缴纳记录')} titleProps={undefined}      >
        <Collapse defaultActiveKey={['pay']} >
          <Panel 
            key='pay'  
            header={null}
            className={intl.get(`ssta.sourcingCost.view.title.payRecord`).d('缴纳记录').length > 10 ? 'pay-record-panel-15' : 'pay-record-panel-10'}
           > 
            <PayRecord/>
          </Panel>
        </Collapse>
      </TopSection>
      <TopSection
          getHocInstance={getHocInstance}
          code={getCustomizeUnitCode('transferOutRecordCard')}
          className={styles['approval-common-top-section-card']}
          title={intl.get(`ssta.sourcingCost.view.title.transferOutRecord`).d('转出记录')} titleProps={undefined}      >
        <Collapse defaultActiveKey={['transferOut']}>
          <Panel 
            header={null}
            key='transferOut'  
            className={intl.get(`ssta.sourcingCost.view.title.transferOutRecord`).d('转出记录').length > 15 ? 'transfer-out-panel-20' : 'transfer-out-panel-10'}
           > 
            <TransferOutRecord/>
          </Panel>
        </Collapse>
      </TopSection>
    </Spin>
  </div>
  )
};

const DepositDetail = (props) => <StoreProvider {...props}><Detail /></StoreProvider>;

export default DepositDetail;
