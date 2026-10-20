/* eslint-disable no-unused-expressions */
import React, { useEffect, useMemo, useState } from 'react';
import { observer } from 'mobx-react-lite';
import ExcelExportPro from 'components/ExcelExportPro';
import intl from 'utils/intl';
import { SRM_DATA_SDRP } from '@/utils/config';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import { isNil } from 'lodash';

const organizationId = getCurrentOrganizationId();

function ExportBtn(props) {
  const { ds, monthDs, defaultKey, quarterDs, onLoad } = props;
  const [key, setKey] = useState(defaultKey || '1');
  const config = useMemo(() => {
    return {
      1: { code: 'SRM_C_SUPPLIER_PERFORMANCE_MONTH_EXPORT', dataSet: monthDs, type: 'MONTH' },
      2: {
        code: 'SRM_C_SUPPLIER_PERFORMANCE_QUARTER_EXPORT',
        dataSet: quarterDs,
        type: 'QUARTER',
      },
      MONTH: {
        code: 'SRM_C_SUPPLIER_PERFORMANCE_MONTH_EXPORT',
        dataSet: ds,
        standardFlag: false,
      },
      QUARTER: {
        code: 'SRM_C_SUPPLIER_PERFORMANCE_MONTH_QUARTER_EXPORT',
        dataSet: ds,
        standardFlag: false,
      },
      'HALF-YEAR': {
        code: 'SRM_C_SUPPLIER_PERFORMANCE_MONTH_HALF_YEAR_EXPORT',
        dataSet: ds,
        standardFlag: false,
      },
      YEAR: {
        code: 'SRM_C_SUPPLIER_PERFORMANCE_MONTH_YEAR_EXPORT',
        dataSet: ds,
        standardFlag: false,
      },
    }[key];
  }, [key]);
  useEffect(() => {
    onLoad?.(setKey);
  }, []);
  return [
    <ExcelExportPro
      templateCode={config?.code ?? ''}
      exportAsync
      allBody
      otherButtonProps={{
        type: 'c7n-pro',
        funcType: 'flat',
      }}
      buttonText={
        config?.dataSet?.selected.length === 0
          ? intl.get('sdrp.common.button.export').d('导出')
          : intl.get('sdrp.common.button.selectExport').d('勾选导出')
      }
      method="POST"
      requestUrl={`${SRM_DATA_SDRP}/v1/${organizationId}/supplier/report/performance/export`}
      queryParams={() => {
        const selectList = config?.dataSet.selected.map((m) => m.toData());
        const evalLineIdList = [];
        selectList.forEach((item) => {
          if (['MONTH', '1'].includes(key)) {
            new Array(12).fill(1).forEach((_, index) => {
              const name = `evalLineId${index + 1}`;
              if (!isNil(item[name])) evalLineIdList.push(item[name]);
            });
          } else if (key === '2') {
            new Array(4).fill(1).forEach((_, index) => {
              const name = `evalLineIdQ${index + 1}`;
              if (!isNil(item[name])) evalLineIdList.push(item[name]);
            });
          }
        });
        // 筛选器参数
        const queryRecord = config?.dataSet?.queryDataSet?.current;
        const selectType = config?.type || ds.queryDataSet?.current.get('selectType');
        if (queryRecord) {
          const recordData = queryRecord.toJSONData();
          delete recordData.__id;
          delete recordData._status;
          delete recordData.__dirty;
          const queryParam = {};
          Object.keys(recordData).forEach((_key) => {
            const list = recordData[_key]?.split(',');
            queryParam[_key] = list.length === 1 ? recordData[_key] : list;
          });

          return {
            ...filterNullValueObject({
              ...queryParam,
              evalLineIdList,
              selectType,
              standardFlag: config?.standardFlag,
            }),
          };
        }
      }}
    />,
  ];
}

export default observer(ExportBtn);
