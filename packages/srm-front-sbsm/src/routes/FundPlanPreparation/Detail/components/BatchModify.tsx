import React, { Fragment, useEffect, useCallback, useContext, useMemo } from 'react';
import { DatePicker, DataSet, TextArea } from 'choerodon-ui/pro';

import { isEmpty } from 'lodash';
import intl from 'utils/intl';
import { batchModifyDS } from '../stores/indexDS';
import { Store } from '../stores/index';
import DynamicAlert from '../../../../components/DynamicAlert';
import { DetailCustomizeCode } from '../../utils/type';
import EditorForm from '../../../../components/EditorForm';

interface BatchModifyProps {
    modal?: any,
    batchEditType: string,
    lineDs: DataSet,
    recordData?: any, // 如果是调整明细行弹框时，是最外面的行数据, 是编制行时，是头信息
    onSuccess: (content?: any) => void,
}

const BatchModifyModal = (props: BatchModifyProps) => {
  const { customizeForm } = useContext(Store);
  const { modal, batchEditType, lineDs, recordData, onSuccess } = props;
  const { selected } = lineDs;
  const batchModifyDs = useMemo(() => new DataSet(batchModifyDS(selected, batchEditType)), [selected, batchEditType]);

  const handleOk = useCallback(async () => {
    const res = await batchModifyDs.setState('recordData', recordData).setState('submitType', batchEditType).submit();
    if (!res) return false;
    const content = res?.content[0];
    modal.close();
    if (onSuccess) onSuccess(content);
  }, [batchModifyDs, modal, batchEditType, recordData, onSuccess]);

  useEffect(() => {
    if (modal) modal.handleOk(handleOk);
  }, [modal, handleOk]);

  const editorColumns = useMemo(() => {
    return [
      batchEditType === 'relationsLine' && { name: 'prepPaymentDate', editor: DatePicker },
      batchEditType === 'line' && { name: 'lineRemark', editor: TextArea, resize: "both" },
      batchEditType === 'relationsLine' && { name: 'remark', editor: TextArea, resize: "both" },
    ];
  }, [batchEditType]);

  return (
    <Fragment>
      <DynamicAlert
        placement="modal-top"
        message={
          isEmpty(selected)
            ? intl.get('sbsm.common.view.alert.batchAllMaintain').d('针对全部数据进行批量编辑')
            : intl
                .get(`sbsm.common.view.alert.batchAllMaintainData`, { num: selected.length })
                .d(`已勾选{num}条数据进行批量编辑`)
        }
      />
      <EditorForm
        columns={1}
        useColon={false}
        dataSet={batchModifyDs}
        editorFlag
        customizeForm={customizeForm}
        editorColumns={editorColumns}
        customizeOptions={{ code: batchEditType === 'line' ? DetailCustomizeCode.LineBatchCode : DetailCustomizeCode.PreStageBatchCode }}
      />
    </Fragment>
  );
};

export default BatchModifyModal;
