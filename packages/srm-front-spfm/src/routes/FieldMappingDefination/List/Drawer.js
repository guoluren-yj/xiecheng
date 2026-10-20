import React, { useEffect, useState } from 'react';
import { Form, TextField, Lov, IntlField } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

import { getResponse } from 'utils/utils';
import { queryAdaptorEntityStructures } from '@/services/fieldMappingDefinationService';

function Drawer(props) {
  const { formDs } = props;
  const [scene, setScene] = useState(null);

  useEffect(
    () => () => {
      // 组件卸载时清除state
      setScene(null);
    },
    []
  );

  const handleChangeScene = sceneValue => {
    const record = formDs.current;
    if (!record) {
      return;
    }
    record.set('sourcePriceDatabase', undefined);
    record.set('sourcePriceDatabase', undefined);
    if (sceneValue) {
      const {
        sourceDocement,
        sourceDocementMeaning,
        targetDocument,
        targetDocumentMeaning,
      } = sceneValue;
      record.set('sourceLov', {
        entityCode: sourceDocement,
        entityName: sourceDocementMeaning,
      });
      record.set('targetLov', {
        entityCode: targetDocument,
        entityName: targetDocumentMeaning,
      });
      Promise.all([
        queryAdaptorEntityStructures(sourceDocement),
        queryAdaptorEntityStructures(targetDocument),
      ]).then(res => {
        if (getResponse(res[0]) && res[0]) {
          record.set('sourceFieldSource', res[0].fieldSource || 'CONFIGURATION');
        }
        if (getResponse(res[1]) && res[1]) {
          record.set('targetFieldSource', res[1].fieldSource || 'CONFIGURATION');
        }
      });
    }
    setScene(sceneValue);
  };

  return (
    <Form dataSet={formDs} labelLayout="float">
      <TextField name="templateCode" />
      <IntlField name="templateName" />
      <Lov name="sceneLov" onChange={value => handleChangeScene(value)} />
      {scene && <Lov name="sourceLov" />}
      {scene && <Lov name="targetLov" />}
      {scene && formDs.current && formDs.current.get('sourceFieldSource') === 'INTERFACE' && (
        <Lov name="sourcePriceDatabaseLov" />
      )}
      {scene && formDs.current && formDs.current.get('targetFieldSource') === 'INTERFACE' && (
        <Lov name="transferPriceDatabaseLov" />
      )}
    </Form>
  );
}

export default observer(Drawer);
