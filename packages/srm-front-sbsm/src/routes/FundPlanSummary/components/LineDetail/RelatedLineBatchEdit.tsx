import React, { Fragment, useEffect, useCallback, useMemo } from 'react';
import { isEmpty } from 'lodash';
import type { Record as DSRecord} from 'choerodon-ui/dataset';
import { DataSet, DatePicker, TextArea } from 'choerodon-ui/pro';

import intl from 'utils/intl';

import { relateLineBatchEditDS } from './storeDS';
import { LineDetailCuszCode } from '../../utils/type';
import EditorForm from '../../../../components/EditorForm';
import DynamicAlert from '../../../../components/DynamicAlert';

interface RelatedLineBatchEditProps {
  modal?: any;
  lineDs: DataSet;
  topRecord: DSRecord
  customizeForm: Function;
};

const RelatedLineBatchEdit = (props: RelatedLineBatchEditProps) => {
  const { modal, lineDs, customizeForm } = props;
  const { selected } = lineDs;
  const formDs = useMemo(() => new DataSet(relateLineBatchEditDS(lineDs)), [lineDs]);

  const handleOk = useCallback(async () => {
    const res = await formDs.submit();
    if (!res) return false;
    const lineDetailDs = lineDs.parent;
    if (lineDetailDs) lineDetailDs.commitData(res.content);
  }, [formDs, lineDs]);

  useEffect(() => {
    if (modal) modal.handleOk(handleOk);
  }, [modal, handleOk]);

  const editorColumns = useMemo(() => {
    return [
      { name: 'balPaymentDate', editor: DatePicker },
      { name: 'remark', editor: TextArea, resize: 'vertical' },
    ];
  }, []);

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
        editorFlag
        columns={1}
        useColon={false}
        dataSet={formDs}
        customizeForm={customizeForm}
        editorColumns={editorColumns}
        customizeOptions={{ code: LineDetailCuszCode.RelatedBatchEdit }}
      />
    </Fragment>
  );
};

export default RelatedLineBatchEdit;
