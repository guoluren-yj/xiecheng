import React, { useMemo, useCallback, useEffect } from 'react';
import { DataSet, IntlField, Select, Lov, TreeSelect } from 'choerodon-ui/pro';
import { RecordStatus } from 'choerodon-ui/dataset/data-set/enum';
import { observer } from 'mobx-react';
import { isNil } from 'lodash';

import { billAddDS, modelTreeOptionDS } from '../stores/indexDS';
import EditorForm from '../../Components/EditorForm';


const BillDefinitionAddModal = (props) =>
{

  const { type, data, modal, onOk, billDs } = props;


  const billAddDs = useMemo(() => new DataSet(billAddDS(type)), [type]);


  const handleUpdate = useCallback(
    async ({ record, name, value }) =>
    {
      const optionDS = new DataSet(modelTreeOptionDS());
      if (['combineDocumentCodeLov'].includes(name) && value && optionDS)
      {
        const documentCodeField = billAddDs.getField('documentCode');
        const combineDocumentCode = record.get('combineDocumentCode');
        optionDS.setState('combineDocumentCode', combineDocumentCode);
        await optionDS.query();
        // eslint-disable-next-line no-unused-expressions
        documentCodeField?.set('options', optionDS);
        // 给【应用单据】赋默认值
        if (optionDS.length)
        {
          record.set({ documentCode: optionDS.records[0]?.get('relateBusinessObjectCode') });
        }
      }
      // 应用单据发生变化，重新绑定字段值
      else if (['documentCode'].includes(name))
      {
        const optionDs = billAddDs.getField('documentCode')?.getOptions(record);
        const optionDatas = optionDs?.toData() || [];
        const curData = optionDatas.find((data) => (data as any)?.relateBusinessObjectCode === record.get('documentCode')) || {};
        const { relBusinessObjectName, businessObjectId, relBusinessObjectId } = curData as any;
        record.set({ businessObjectName: relBusinessObjectName, documentId: businessObjectId, relBusinessObjectId });
      }
      // 字段选择 发生变化，改变别名
      if (['fieldCodelLov', 'businessObjectName'].includes(name))
      {
        const { businessObjectName, fieldName } = record.get(['businessObjectName', 'fieldName']) || {};
        const newDisplayFieldName = !isNil(businessObjectName) && !isNil(fieldName)
          ? `${businessObjectName}-${fieldName}`
          : businessObjectName || fieldName;
        record.set('displayFieldName', newDisplayFieldName);
      }
    },
    [billAddDs],
  );
  useEffect(() =>
  {
    billAddDs.addEventListener('update', handleUpdate);
    return () =>
    {
      billAddDs.removeEventListener('update', handleUpdate);
    };
  }, [billAddDs, handleUpdate]);

  useEffect(() =>
  {
    billAddDs.create(data || {});
    if (billAddDs?.current)
    {
      billAddDs.current.status = RecordStatus.update;
      // 获取【应用单据】下拉框数据
      const documentCodeField = billAddDs.getField('documentCode');
      const combineDocumentCode = billAddDs?.current?.get('combineDocumentCode');
      if (combineDocumentCode)
      {
        const optionDS = new DataSet(modelTreeOptionDS());
        optionDS.setState('combineDocumentCode', combineDocumentCode);
        optionDS.query().then(() =>
        {
          // eslint-disable-next-line no-unused-expressions
          documentCodeField?.set('options', optionDS);
        });


      }
    }

  }, [data, billAddDs]);

  const handleOk = useCallback(
    async () =>
    {
      // 1. 校验
      const validateFlag = await billAddDs.validate();
      if (!validateFlag) return false;
      // 2.1提交
      // 需要给后端传返利参数

      const { enableFlag = 0, rebateEnableFlag = 0, discountEnableFlag = 0 } = billDs?.records?.[0]?.get([
        'enableFlag',
        'rebateEnableFlag',
        'discountEnableFlag',
      ]) || {};
      const paramsObj = { enableFlag, rebateEnableFlag, discountEnableFlag };
      const res = await billAddDs.setState('paramsObj', paramsObj).submit();
      if (res)
      {
        // 2.2 提交成功，重新查询行数据
        if (onOk)
        {
          await onOk();
        }
        return true;
      }
      return false;

    },
    [billAddDs, onOk, billDs]
  );
  useEffect(() =>
  {
    modal.handleOk(handleOk);
  }, [modal, handleOk]);



  const editorColumns = useMemo(() =>
  {
    return [
      { name: 'combineDocumentCodeLov', editor: Lov },
      { name: 'documentCode', editor: TreeSelect },
      { name: 'fieldCodelLov', editor: Lov },
      { name: 'displayFieldName', editor: IntlField },
      {
        name: 'fieldLabel', editor: Select,
      },
    ];
  }, []);

  return (
    <EditorForm
      dataSet={billAddDs}
      useColon={false}
      columns={1}
      editorFlag
      editorColumns={editorColumns} />
  );
};

export default observer(BillDefinitionAddModal);