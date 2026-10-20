import React, { useMemo, useContext, useEffect, useCallback } from 'react';
import { TextArea } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';
import { filterNullValueObject } from 'utils/utils';

import { Store } from '../stores';
import type { StoreValueType } from '../stores';
import EditorForm from '../../../components/EditorForm';

const ApprovalModal = (props) => {
  const { modal, isDocumentFlag, isProjectFlag, isStageFlag, handleBtnMethods, type } = props;
  const {
    checkInfoDs,
  } = useContext<StoreValueType>(Store);

  const handleOk = useCallback(async () => {
    const res = await checkInfoDs.validate();
    if (!res) return;
    const data = checkInfoDs.current?.toData();
    if (handleBtnMethods) handleBtnMethods(type, filterNullValueObject(data));
  }, [checkInfoDs, handleBtnMethods, type]);

  useEffect(() => {
    // eslint-disable-next-line no-unused-expressions
    checkInfoDs?.create({});
    modal.handleOk(handleOk);
  }, [handleOk, checkInfoDs, modal]);

  const editorColumns = useMemo(() => {
    return [
      { name: 'publishApproveRemark', editor: TextArea, visible: isProjectFlag && ['confirm', 'reject'].includes(type), resize: 'both' },
      { name: 'closeApproveRemark', editor: TextArea, visible: isProjectFlag && type === 'close', resize: 'both' },
      { name: 'stageApproveOpinion', editor: TextArea, visible: isStageFlag && type !== 'change', resize: 'both' },
      { name: 'approvedOpinion', editor: TextArea, visible: isDocumentFlag && type !== 'change', resize: 'both' },
      { name: 'alterRemark', editor: TextArea, visible: (isDocumentFlag || isStageFlag) && type === 'change', resize: 'both' },
    ];
  }, [isProjectFlag, isDocumentFlag, isStageFlag, type]);

  if (!checkInfoDs?.current) return null;

  return (
    <EditorForm
      columns={1}
      useColon={false}
      dataSet={checkInfoDs}
      editorFlag
      editorColumns={editorColumns}
    />
  );
};


export default observer(ApprovalModal);
