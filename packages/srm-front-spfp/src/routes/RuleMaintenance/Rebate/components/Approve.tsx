import React, { useMemo, useContext, useEffect, useCallback } from 'react';
import { TextArea, DataSet } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

import { Store } from '../Detail/stores';
import type { CreateStoreValueType } from '../Detail/stores';
import EditorForm from '../../../Components/EditorForm';
import { checkInfoDS } from '../Detail/stores/mainDS';

const ApprovalModal = (props) => {
  const { modal, ruleDs, type } = props;
  const checkInfoDs = useMemo(() => new DataSet(checkInfoDS()), []);
  const { history } = useContext<CreateStoreValueType>(Store);

  const handleOk = useCallback(async () => {
    const res = await checkInfoDs.submit();
    if (!res) return false;
    history.push('/spfp/rule-maintenance/rebate/list');
  }, [checkInfoDs, history]);

  useEffect(() => {
    // eslint-disable-next-line no-unused-expressions
    checkInfoDs?.create({...ruleDs.current?.toData(), approvalResult: type});
    modal.handleOk(handleOk);
  }, [handleOk, checkInfoDs, modal, type, ruleDs]);

  const editorColumns = useMemo(() => {
    return [
      { name: 'approvedRemark', editor: TextArea },
    ];
  }, []);

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
