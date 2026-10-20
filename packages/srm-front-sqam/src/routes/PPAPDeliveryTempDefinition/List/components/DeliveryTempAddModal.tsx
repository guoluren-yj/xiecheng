import { observer } from 'mobx-react';
import React, { useMemo, useEffect, useCallback } from 'react';
import { reaction } from 'mobx';
import { Select, Attachment, Lov, useDataSet, CheckBox, IntlField } from 'choerodon-ui/pro';

import EditorForm from '../../../components/EditorForm';
import { AddDS } from '../indexDS';
import { addCode } from '../type';

interface DeliveryTempAddProps {
  type: string;
  onQueryList: Function;
  data?: Object;
  modal?;
  customizeForm: any;
}

export default observer((props: DeliveryTempAddProps) => {
  const { onQueryList, data, modal, type, customizeForm } = props;

  const isView = useMemo(() => type === 'view', [type]);

  const addDs = useDataSet(() => AddDS(isView), [isView]);
  const { camp, documentSupplierFlag } = addDs.current?.get(['camp', 'documentSupplierFlag']) || {};

  useEffect(() => {
    modal.handleOk(async () => {
      const validateFlag = await addDs.validate();
      if (!validateFlag) return false;
      const res = await addDs.submit();
      if (res) onQueryList();
    });
    addDs.loadData([data || {}]);
  }, [addDs, modal, data, onQueryList]);

  useEffect(() => {
    const disposer = reaction(
      () => addDs.getField('employeeLov')?.get('textField'), // 解决动态显示字段时序问题
      () => {
        if (addDs.current) {
          addDs.loadData([data || {}]);
        }
      },
      { fireImmediately: false }
    );
    return () => disposer();
  }, [addDs, data]);

  const handleUpdateDocument = useCallback(({ record, name, value }) => {
    if (name === 'approveMethod' && value !== 'FUNCTION') {
      record.set({ approveType: null, roleNumLov: null });
    }
    if (name === 'approveType') {
      record.set({ roleNumLov: null });
    }
    if (name === 'camp') {
      if (value === 'PURCHASER') {
        record.set({ supplierVisibleFlag: 1, documentSupplierFlag: 1 });
      } else record.set({ supplierVisibleFlag: 0, appointorLov: null, documentSupplierFlag: 1 });
    }
    if (name === 'documentSupplierFlag' && Number(value) === 0) {
      record.set({ supplierVisibleFlag: 0 });
    }
  }, []);

  useEffect(() => {
    addDs.addEventListener('update', handleUpdateDocument);
    return () => {
      addDs.removeEventListener('update', handleUpdateDocument);
    };
  }, [addDs, handleUpdateDocument]);

  const formColumns = useMemo(
    () =>
      [
        { name: 'documentNum', disabled: isView },
        { name: 'documentName', disabled: isView, editor: IntlField },
        { name: 'camp', editor: Select, disabled: isView },
        {
          name: 'documentSupplierFlag',
          editor: Select,
          disabled: isView,
          visible: camp === 'PURCHASER',
        },
        { name: 'documentUploadPoint', editor: Select, disabled: isView },
        {
          name: 'supplierVisibleFlag',
          editor: Select,
          disabled: isView,
          visible: camp === 'PURCHASER' && Number(documentSupplierFlag) === 1,
        },
        {
          name: 'approveMethod',
          editor: Select,
          disabled: isView,
        },
        {
          name: 'approveType',
          editor: Select,
          disabled: isView,
        },
        {
          name: 'roleNumLov',
          editor: Lov,
          disabled: isView,
        },
        {
          name: 'appointorLov',
          editor: Lov,
          disabled: isView,
        },
        {
          name: 'roleVisibleLov',
          editor: Lov,
          disabled: isView,
        },
        {
          name: 'visibleEmployeeLov',
          editor: Lov,
          disabled: isView,
        },
        {
          name: 'documentAttachmentUuid',
          editor: Attachment,
          readOnly: isView,
        },
        {
          name: 'autoReferAttachmentFlag',
          editor: CheckBox,
          disabled: isView,
        },
      ].filter(item => item),
    [isView, camp, documentSupplierFlag]
  );

  return (
    <EditorForm
      columns={1}
      dataSet={addDs}
      editorColumns={formColumns}
      editorFlag={!isView}
      customizeForm={customizeForm}
      customizeOptions={{ code: addCode }}
    />
  );
});
