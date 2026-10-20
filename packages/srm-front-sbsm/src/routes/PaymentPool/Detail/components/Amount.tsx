import React, { useMemo, useContext } from 'react';
import { isNil } from 'lodash';

import { Store } from '../stores';
import EditorForm from '../../../../components/EditorForm';
import { HeadCustCodeMap } from '../../utils/type';

const Amount = () => {
  const {
    headerDs,
    customizeForm,
  } = useContext(Store);

  const currencyCode = headerDs.current?.get('currencyCode');

  const editorColumns = useMemo(() => {
    return [
      'payAmount',
      'paySavedAmount',
      'payOccupyAmount',
      'payCompleteAmount',
      'payingAmount',
      'paidAmount',
    ].map(name => {
      return {
        name,
        disabled: true,
        renderer: ({ value, text }) => isNil(value) ? text : `${text} ${currencyCode || ''}`,
      };
    });
  }, [currencyCode]);

  return (
    <EditorForm
      useWidthPercent
      columns={3}
      useColon={false}
      dataSet={headerDs}
      customizeForm={customizeForm}
      editorColumns={editorColumns}
      customizeOptions={{ code: HeadCustCodeMap.Amount }}
    />
  );
};

export default Amount;