import React, { useMemo, useEffect, useCallback } from 'react';
import { DataSet } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';
import { filterNullValueObject } from 'utils/utils';

import { checkInfoDS } from '../store/listDS';
import EditorForm from '../../../Components/EditorForm';

const FilledInfoModal = (props) => {
  const { modal, record, handleBtnMethods } = props;
  const checkInfoDs = useMemo<DataSet>(() => new DataSet(checkInfoDS()), []);

  const handleOk = useCallback(async () => {
    const res = await checkInfoDs.validate();
    if (!res) return false;
    const data = checkInfoDs.current?.toData();
    if (handleBtnMethods) handleBtnMethods(filterNullValueObject(data));
  }, [checkInfoDs, handleBtnMethods]);

  useEffect(() => {
    // eslint-disable-next-line no-unused-expressions
    checkInfoDs?.create(record?.toData());
    modal.handleOk(handleOk);
  }, [handleOk, checkInfoDs, modal, record]);

  const editorColumns = useMemo(() => {
    return [
      { name: 'recipientPhone' },
      { name: 'recipientEmail' },
    ];
  }, []);

  if (!checkInfoDs?.current) return null;

  return (
    <div>
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


export default observer(FilledInfoModal);
