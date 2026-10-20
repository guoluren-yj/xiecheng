import React, { useMemo, useContext, useEffect, useCallback } from 'react';
import { TextArea } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';
import { filterNullValueObject } from 'utils/utils';
import { Alert } from 'choerodon-ui';
import intl from 'utils/intl';

import { Store } from '../stores';
import type { StoreValueType } from '../stores';
import EditorForm from '../../../components/EditorForm';
import styles from '../index.less';

const ApprovalModal = (props) => {
  const { modal, isDocumentFlag, isProjectFlag, isStageFlag, handleBtnMethods, type, isDocumentCancel } = props;
  const {
    checkInfoDs,
  } = useContext<StoreValueType>(Store);

  const handleOk = useCallback(async () => {
    const res = await checkInfoDs.validate();
    if (!res) return false;
    const data = checkInfoDs.current?.toData();
    if (handleBtnMethods) handleBtnMethods(type, filterNullValueObject(data));
  }, [checkInfoDs, handleBtnMethods, type]);

  useEffect(() => {
    // eslint-disable-next-line no-unused-expressions
    checkInfoDs?.create({});
    modal.handleOk(handleOk);
  }, [handleOk, checkInfoDs, modal]);

  useEffect(() => {
    const cancelReasonField = checkInfoDs.getField('cancelReason');
    // 如果取消 取消原因必输
    if (cancelReasonField) {
      cancelReasonField.set('dynamicProps', {
        ...(cancelReasonField.get('dynamicProps') || {}),
        required: () => !!(isDocumentCancel),
      });
    }
  }, [checkInfoDs, isDocumentCancel]);

  const editorColumns = useMemo(() => {
    return [
      { name: 'publishApproveRemark', editor: TextArea, visible: !!(isProjectFlag && ['confirm', 'reject'].includes(type)), resize: 'both' },
      { name: 'closeApproveRemark', editor: TextArea, visible: !!(isProjectFlag && type === 'close'), resize: 'both' },
      { name: 'stageApproveOpinion', editor: TextArea, visible: !!(isStageFlag && type !== 'change'), resize: 'both' },
      { name: 'approvedOpinion', editor: TextArea, visible: !!(isDocumentFlag && type !== 'change'), resize: 'both' },
      { name: 'alterRemark', editor: TextArea, visible: !!((isDocumentFlag || isStageFlag) && type === 'change'), resize: 'both' },
      { name: 'cancelReason', editor: TextArea, visible: !!(isDocumentCancel), resize: 'both' },
    ];
  }, [isProjectFlag, isDocumentFlag, isStageFlag, type, isDocumentCancel]);

  if (!checkInfoDs?.current) return null;

  return (
    <div>
      {
        !!isDocumentCancel && (
          <Alert
            showIcon
            message={intl.get(`sqam.ppap.view.model.cancelModalTips`).d('批量删除后交付物状态会更新为【已取消】且无法恢复，请谨慎操作。')}
            className={styles['sqam-alert-top']}
          />
        )
      }
      <EditorForm
        columns={1}
        useColon={false}
        dataSet={checkInfoDs}
        editorFlag
        editorColumns={editorColumns}
      />
    </div>
  );
};


export default observer(ApprovalModal);
