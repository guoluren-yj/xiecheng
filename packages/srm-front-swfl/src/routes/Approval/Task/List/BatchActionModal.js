import React, { useEffect } from 'react';

import intl from 'utils/intl';
import ContactLov from 'srm-front-boot/lib/components/ContactLov';

import QuickReply from '@/components/QuickReply';
import styles from './index.less';

function BatchActionModal(props) {
  const { operatorDs, selectLabel, selectMultiple } = props;

  useEffect(() => {
    operatorDs
      .getField('batchSelected')
      .setLovPara('extraParam', JSON.stringify({ startUser: 'invalid' }));
  }, []);

  const renderBatchDelegate = () => {
    return (
      <>
        <div className={styles['contact-lov']}>
          <ContactLov
            modalProps={{
              style: {
                maxWidth: '900px',
              },
            }}
            className={styles['contact-lov-select-multiple']}
            dataSet={operatorDs}
            labelLayout="float"
            label={selectLabel}
            name="batchSelected"
            viewMode="drawer"
            multiple={selectMultiple}
            selectionProps={{
              placeholder: intl.get('hzero.common.select.people').d('请从左侧选择人员'),
            }}
          />
        </div>
      </>
    );
  };

  const renderComment = () => {
    return (
      <QuickReply
        width="100%"
        margin="0"
        dataSetValue={operatorDs}
        dataSetName="approvalOpinion"
        isShowAllScreenIcon={false}
        inDrawer
      />
    );
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <div>{renderBatchDelegate()}</div>
      </div>
      <div style={{ marginBottom: '24px' }}>{renderComment()}</div>
    </div>
  );
}

export default BatchActionModal;
