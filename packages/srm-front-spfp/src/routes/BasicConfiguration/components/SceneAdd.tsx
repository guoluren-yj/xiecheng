import React, { useMemo, useEffect, useCallback, useContext } from 'react';
import { observer } from 'mobx-react';
import { IntlField, DataSet, Select } from 'choerodon-ui/pro';
import { RecordStatus } from 'choerodon-ui/dataset/data-set/enum';

import { sceneMenuAddDS } from '../stores/indexDS';
import EditorForm from '../../Components/EditorForm';
import type { StoreValueType } from '../stores';
import { Store } from '../stores';

const SceneAdd = observer(props =>
{
  const { modal, data, onOk } = props;
  const { remoteProps, sceneMenuDs } = useContext<StoreValueType>(Store);
  const addSceneDs = useMemo(() => new DataSet(sceneMenuAddDS()), []);

  useEffect(() =>
  {
    addSceneDs.create(data || {});
    if (addSceneDs?.current)
    {
      // record为add状态，多语言组件不会调接口
      addSceneDs.current.status = RecordStatus.update;
    }

  }, [addSceneDs, data]);

  const handleOk = useCallback(
    async () =>
    {
      const validateFlag = await addSceneDs.validate();
      if (!validateFlag) return false;
      // 保存菜单
      const res = await addSceneDs
        .setState('submitParams',
          {
            submitData: addSceneDs.current?.toData(),
            submitType: data ? 'update' : 'create',
          })
        .submit();
      if (data)
      {
        // 修改信息后，重新查询场景菜单信息
        if (onOk) onOk();
      } else
      {
        // 新增信息后，重新查询场景菜单和字段信息
        // eslint-disable-next-line no-lonely-if
        if (res)
        {
          const { content } = res || {};
          const { scenarioConfigId } = content[0];
          // 新增菜单后重新查询字段信息，编辑不用
          if (onOk) onOk(scenarioConfigId);
        }
      }
    },
    [addSceneDs, data, onOk],
  );
  useEffect(() =>
  {
    modal.handleOk(handleOk);
  }, [handleOk, modal]);

  const editColumns = useMemo(() =>
  {
    return [
      {
        name: 'scenarioName',
        editor: IntlField,
        newLine: true,
      },
      {
        name: 'applicableBusiness',
      },
      {
        name: 'maintenanceInstructions',
      },
      { name: 'ruleType', editor: Select },
    ];
  }, []);


  return (
    // <Form dataSet={addSceneDs} labelLayout={LabelLayout.float} >
    //   <IntlField
    //     name="scenarioName"
    //     newLine
    //   />
    // </Form >
    <EditorForm
      dataSet={addSceneDs}
      editorColumns={remoteProps ? remoteProps.process('SPFP.BASIC_CONFIGURATION_DETAIL_CUX.SCENE_ADD_INFO', editColumns, {
        data,
        addSceneDs,
        sceneMenuDs,
      })
    : editColumns}
      editorFlag
    // columns={modal ? 2 : 3}
    />
  );

});

export default SceneAdd;
