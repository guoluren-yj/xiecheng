import React, { Fragment, useEffect, useCallback, useContext, useMemo } from 'react';
import { isEmpty } from 'lodash';
import { DataSet, Select, DatePicker, TextArea } from 'choerodon-ui/pro';

import intl from 'utils/intl';

import { Store } from '../stores/index';
import { batchEditLineDS } from '../stores/indexDS';
import { DetailCustomizeCode } from '../../utils/type';
import EditorForm from '../../../../components/EditorForm';
import DynamicAlert from '../../../../components/DynamicAlert';

const LineBatchEdit = (props) => {
  const { modal } = props;
  const { lineDs, customizeForm } = useContext(Store);
  const { selected } = lineDs;
  const formDs = useMemo(() => new DataSet(batchEditLineDS(lineDs)), [lineDs]);

  const handleOk = useCallback(async () => {
    const res = await formDs.submit();
    if (!res) return false;
    const { parent } = lineDs;
    if (parent) parent.query();
  }, [formDs, lineDs]);

  useEffect(() => {
    if (modal) modal.handleOk(handleOk);
  }, [modal, handleOk]);

  const editorColumns = useMemo(() => {
    return [
      { name: 'balPaymentDate', editor: DatePicker },
      { name: 'remainAmountProcess', editor: Select },
      { name: 'lineRemark', editor: TextArea, resize: 'vertical' },
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
        customizeOptions={{ code: DetailCustomizeCode.LineBatchEditCode }}
      />
    </Fragment>
  );
};

export default LineBatchEdit;
