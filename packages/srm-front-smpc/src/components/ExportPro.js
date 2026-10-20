import React from 'react';
import intl from 'utils/intl';
import { filterNullValueObject } from 'utils/utils';
import ExcelExportPro from 'components/ExcelExportPro';

export default function ExportPro(props) {
  const { dataSet, color, ...exportProps } = props;
  return (
    <ExcelExportPro
      buttonText={intl.get('smpc.product.button.exportNew').d('(新)导出')}
      otherButtonProps={{
        type: 'c7n-pro',
        funcType: 'flat',
        icon: 'unarchive',
        color,
      }}
      queryParams={() => {
        const queryRecord = dataSet?.queryDataSet?.current;
        if (queryRecord) {
          const queryParam = queryRecord.toJSONData();
          delete queryParam.__id;
          delete queryParam._status;
          delete queryParam.__dirty;
          return { ...filterNullValueObject(queryParam) };
        }
      }}
      {...exportProps}
    />
  );
}
