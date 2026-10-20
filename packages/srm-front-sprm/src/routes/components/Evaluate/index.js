import React from 'react';
import { Modal } from 'choerodon-ui/pro';
import intl from 'utils/intl';

import EvaluteForm from './evaluteForm';

const modelPrompt = 'sprm.purchaseRequisitionInquiry.model.common';

export const Evaluate = ({ currentRecord, dataSet }) => {
  const openModal = async () => {
    const formProps = {
      currentRecord,
      dataSet,
      prHeaderId: currentRecord.get('prHeaderId'),
      hideModal,
    };

    const EvaluateModal = Modal.open({
      key: Modal.key(),
      drawer: true,
      style: { width: 380 },
      title: intl.get(`${modelPrompt}.happy`).d('满意度调查'),
      children: <EvaluteForm {...formProps} />,
      closable: true,
      movable: false,
      destroyOnClose: true,
      footer: null,
    });

    function hideModal() {
      EvaluateModal.close(true);
    }
  };

  return (
    <a onClick={openModal}>
      {currentRecord.get('evaluateFlag')
        ? intl.get(`sprm.purchaseRequisitionInquiry.model.common.viewComments`).d('查看评价')
        : intl.get(`sprm.purchaseRequisitionInquiry.model.common.evaluate`).d('评价')}
    </a>
  );
};
