import React, { useCallback, useContext, useMemo } from 'react';
import Context, { IStore } from '@/routes/ScriptEvent/store';
import { observer } from 'mobx-react-lite';
import { Button, Form, Lov, Output } from 'choerodon-ui/pro/lib';
import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import constructInsertReferenceFieldDataSet from '../datasets/constructInsertReferenceFieldDataSet';

export default observer(function (props: { onInsertReferenceField: Function }) {
  const { store } = useContext<{ store: IStore }>(Context as any);

  // on: init //
  const insertReferenceFieldDataSet = useMemo(() => {
    return constructInsertReferenceFieldDataSet();
  }, []);

  const insertRefrenceField = useCallback(() => {
    store.setState('showInsertRefrenceFieldPopover', false);
    const referenceFieldData = insertReferenceFieldDataSet.toData();
    store.setState('selectedReferenceField', constructReferenceFieldString(referenceFieldData[0]));
    props.onInsertReferenceField(constructReferenceFieldString(referenceFieldData[0]));
    insertReferenceFieldDataSet.loadData([]);
  }, []);

  // on: update //

  return (
    <>
      <Form dataSet={insertReferenceFieldDataSet}>
        <Lov name="businessObject" noCache placeholder="请选择" />
        <Lov name="field" noCache placeholder="请选择" />
        <Output
          label="对象/字段编码"
          renderer={(args) => {
            if (!args.record) {
              return '';
            } else {
              return constructReferenceFieldString(args.record.data as any);
            }
          }}
        />
      </Form>
      <div className="footer" style={{ display: 'flex', flexDirection: 'row-reverse' }}>
        <Button
          color={ButtonColor.primary}
          onClick={() => insertRefrenceField()}
          disabled={!(insertReferenceFieldDataSet.toData()[0] as any)?.businessObject}
        >
          插入
        </Button>
      </div>
    </>
  );
});

function constructReferenceFieldString(recordData: any) {
  const businessObjectCodeDisplay = recordData?.businessObject
    ? `${recordData?.businessObject?.businessObjectCode || ''}#${
        recordData?.businessObject?.physicalModelName || ''
      }`
    : '';
  const fieldCodeDisplay = recordData?.field
    ? `.${recordData?.field?.businessObjectFieldCode || ''}`
    : '';

  return `${businessObjectCodeDisplay}${fieldCodeDisplay}`;
}
