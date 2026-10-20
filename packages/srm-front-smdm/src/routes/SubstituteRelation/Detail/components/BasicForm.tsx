import React, { useContext, useMemo } from 'react';
import intl from 'utils/intl';
import { Form, Output } from 'choerodon-ui/pro'
import { LabelLayout } from 'choerodon-ui/pro/lib/form/interface';

import type { StoreValueType} from '../stores/StoreProvider';
import { Store } from '../stores/StoreProvider';
import { DetailCustomizeCode } from '../../utils/constant';

const BasicForm = () => {
  const {
    headerDS,
    customizeForm,
  } = useContext(Store) as StoreValueType;

  const viewColumns = useMemo(() => () => {
    return [
      <Output name='displaySubRelationNum' />,
      <Output name='subRelationName' />,
      <Output name='versionNumber' />,
      <Output
        name='enabledFlag'
        renderer={({value}) => value === 1 ? intl.get('hzero.common.status.yes').d('是') : intl.get('hzero.common.status.no').d('否')}
      />,
      <Output name='remark' newLine colSpan={2} />,
    ];
  }, []);

  return customizeForm(
    {
      code: DetailCustomizeCode.BaseInfoCode,
      dataSet: headerDS,
    },
    <Form
      dataSet={headerDS}
      labelLayout={LabelLayout.vertical}
      columns={3}
      useColon={false}
      className="c7n-pro-vertical-form-display"
    >
      {viewColumns()}
    </Form>
  );
};

export default BasicForm;