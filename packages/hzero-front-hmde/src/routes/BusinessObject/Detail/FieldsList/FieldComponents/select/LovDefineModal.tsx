import React, { useEffect, useMemo } from 'react';
// import intl from 'srm-front-boot/lib/utils/intl';
import formatterCollections from 'srm-front-boot/lib/utils/intl/formatterCollections';
import { observer } from 'mobx-react-lite';
import { DataSet, Form, IntlField, TextField } from 'choerodon-ui/pro';
import { LabelAlign } from 'choerodon-ui/pro/lib/form/enum';

import LovValuesList from './LovValuesList';
import { lovDefineDS, lovValuesDS } from './SelectDS';

const Index = ({ modal, valueList = [], businessObjectCode, selectDs }) => {
  const lovDefineDs = useMemo(
    () =>
      new DataSet({
        ...lovDefineDS({ businessObjectCode }),
        children: {
          lovValues: new DataSet(lovValuesDS()),
        },
      }),
    []
  );

  useEffect(() => {
    lovDefineDs.children.lovValues.loadData(valueList);
  }, []);

  modal.handleOk(async () => {
    const res = await lovDefineDs.submit();
    if (!res?.failed) {
      selectDs.current.set('valueList', res?.content?.[0]);
      selectDs.current.set('optionSettings', '_valueList');
      selectDs.children.customOptionList.removeAll();
    } else {
      return false;
    }
  });

  return (
    <>
      <Form dataSet={lovDefineDs} columns={2} useColon={false} labelAlign={LabelAlign.center}>
        <IntlField name="lovName" />
        <TextField name="lovCode" />
      </Form>
      <LovValuesList valueListDs={lovDefineDs.children.lovValues} operateHeaderFlag />
    </>
  );
};
export default formatterCollections({ code: ['hmde.bo', 'hmde.common', 'hzero.common'] })(
  observer(Index)
);
