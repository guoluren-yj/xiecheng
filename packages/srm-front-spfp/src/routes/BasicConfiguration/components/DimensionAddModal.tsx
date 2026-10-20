/*
 * @Description: 适用/累计维度 新增/编辑弹窗
 * @Author: yan.xie <yan.xie@gong-link.com>
 * @Date: 2023-02-17 12:57:20
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2023, Hand
 */
import React, { useMemo, useCallback, useEffect } from 'react';
import { DataSet, IntlField, Lov, Select } from 'choerodon-ui/pro';
import { RecordStatus } from 'choerodon-ui/dataset/data-set/enum';

import { dimensionAddDS } from '../stores/indexDS';
import EditorForm from '../../Components/EditorForm';

const DimensionAddModal = (props) =>
{
  const { type, data, modal, dimensionType, onOk } = props;

  const dimensionAddDs = useMemo(() => new DataSet(dimensionAddDS(type, dimensionType)), [type, dimensionType]);

  useEffect(() =>
  {
    dimensionAddDs.create(data || {});
    if (dimensionAddDs?.current)
    {
      dimensionAddDs.current.status = RecordStatus.update;
    }

  }, [dimensionAddDs, data]);

  const handleUpdate = useCallback(({ record, name }) =>
  {
    if (name === 'documentCodeLov')
    {
      record.set({
        dimensionName: undefined,
        dimensionDefCombinationLov: undefined,
      });
    }
    if (name === 'ruleType')
    {
      record.set({
        dimensionDefCombinationLov: undefined,
        dimensionName: undefined,
        documentCodeLov: undefined,
      });
    }
  }, []);

  useEffect(() =>
  {
    dimensionAddDs.addEventListener('update', handleUpdate);
    return () =>
    {
      dimensionAddDs.removeEventListener('update', handleUpdate);
    };
  }, [dimensionAddDs, handleUpdate]);


  const handleOk = useCallback(
    async () =>
    {
      // 1. 校验
      const validateFlag = await dimensionAddDs.validate();
      if (!validateFlag) return false;
      // 2.1提交
      const res = await dimensionAddDs.submit();
      if (res)
      {
        // 2.2 提交成功，重新查询行数据（累计/适用维度）
        if (onOk)
        {
          await onOk();
          return true;
        }
        return true;
      } else
      {
        return false;
      }
    },
    [
      dimensionAddDs,
      onOk,
    ]
  );
  useEffect(() =>
  {
    modal.handleOk(handleOk);


  }, [modal, handleOk]);




  const editorColumns = useMemo(() =>
  {
    return [
      { name: 'ruleType', editor: Select },
      { name: 'documentCodeLov', editor: Lov },
      { name: 'dimensionName', editor: IntlField },
      { name: 'dimensionDefCombinationLov', editor: Lov },
    ];
  }, []);

  return (
    <EditorForm
      dataSet={dimensionAddDs}
      useColon={false}
      columns={1}
      editorFlag
      editorColumns={editorColumns} />
  );
};

export default DimensionAddModal;