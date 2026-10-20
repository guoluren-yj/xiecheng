import React, { useContext, useMemo } from 'react';
import intl from 'utils/intl';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/interface';
import { Form, TextArea, TextField, Select } from 'choerodon-ui/pro';

import { UpdateCustomizeCode } from '../../utils/constant';
import type { StoreValueType} from '../stores/StoreProvider';
import { Store } from '../stores/StoreProvider';

const { Option } = Select;

const BasicForm = () => {
  const {
    headerDS,
    customizeForm,
  } = useContext(Store) as StoreValueType;

  const editorColumns = useMemo(() => () => {
    return [
      <TextField name='displaySubRelationNum' />,
      <TextField name='subRelationName' />,
      <TextField name='versionNumber' />,
      <Select name='enabledFlag'>
        <Option value={1}>{intl.get('hzero.common.status.yes').d('是')}</Option>
        <Option value={0}>{intl.get('hzero.common.status.no').d('否')}</Option>
      </Select>,
      <TextArea name='remark' newLine colSpan={2} />,
    ];
  }, []);

  return customizeForm(
    {
      code: UpdateCustomizeCode.BaseInfoCode,
      dataSet: headerDS,
    },
    <Form dataSet={headerDS} labelLayout={LabelLayout.float} columns={3} useColon={false}>
      {editorColumns()}
    </Form>
  );
};

export default BasicForm;