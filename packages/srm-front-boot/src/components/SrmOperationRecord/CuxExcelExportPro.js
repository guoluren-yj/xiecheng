import React from 'react';
import intl from 'utils/intl';
import { observer } from 'mobx-react-lite';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';

const CuxExcelExportPro = ({ queryParms, templateCode, exportUrl, exportParams }) => {
  return (
    <ExcelExportPro
      buttonText={intl.get('hzero.common.button.export').d('导出')}
      templateCode={templateCode} // 导出模板编码
      otherButtonProps={{
        type: 'c7n-pro',
        icon: 'none',
      }}
      requestUrl={exportUrl}
      queryParams={{ ...queryParms, ...exportParams }}
      allBody
      method="POST"
    />
  );
};

export default observer(CuxExcelExportPro);
