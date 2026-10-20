import React, { useMemo } from 'react';
import { Lov, DataSet } from 'choerodon-ui/pro';
import { HZERO_HMDE } from '@/utils/config';
import { lowcodeOrganizationURL } from '@/utils/common';
import { observer } from 'mobx-react-lite';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { lovDefineAxiosConfig } from 'srm-front-boot/lib/utils/c7nUiConfig';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';

interface IProps {
  record?: any;
}

const ValueList = observer((props: IProps) => {
  const { record } = props;
  const viewDS = useMemo(() => {
    return new DataSet({
      autoCreate: true,
      paging: false,
      fields: [
        {
          name: 'valueList',
          type: FieldType.object,
          lovCode: record.get('fieldCode'),
          valueField: 'id',
          defaultValue: record?.get('valueList') || {},
          lovDefineAxiosConfig: (code, dataSet) => {
            const lovConfig = lovDefineAxiosConfig(code, dataSet);
            const query = record?.toData()?.valueListData?.businessObjectOptionCode
              ? `dataObjectCode=${
                  record?.toData()?.valueListData?.masterBusinessObjectCode
                }&dataObjectOptionCode=${record?.toData()?.valueListData?.businessObjectOptionCode}`
              : `dataObjectCode=${record?.toData()?.valueListData?.masterBusinessObjectCode}`;
            return {
              ...lovConfig,
              method: 'GET',
              url: `${lowcodeOrganizationURL({
                route: HZERO_HMDE,
              })}/data-objects/view-info?${query}`,
            };
          },
        },
      ],
      events: {
        update: ({ value }) => {
          if (value && value?.id) {
            record.set('value', value?.id);
            record.set('valueList', value);
          } else {
            record.set('value', null);
            record.set('valueList', null);
          }
        },
      },
    } as DataSetProps);
  }, [record]);

  return <Lov name="valueList" dataSet={viewDS} />;
});

export default ValueList;
