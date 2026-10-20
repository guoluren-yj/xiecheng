import React, { useMemo, useEffect, useState } from 'react';
import { DataSet, Radio } from 'choerodon-ui/pro';
import { isArray } from 'lodash';

import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import request from 'utils/request';
import { HZERO_PLATFORM } from 'utils/config';
import { SRM_MALL } from '_utils/config';

export default function FreightType(props) {
  const { record: recordData, valueType } = props;
  const [list, setList] = useState([]);
  const DS = useMemo(
    () =>
      new DataSet({
        fields: [
          { name: 'freightType', required: true },
          { name: 'valueName' },
          { name: 'valueCode' },
        ],
      }),
    []
  );

  const fetchData = () => {
    request(
      `${HZERO_PLATFORM}/v1/${getCurrentOrganizationId()}/lovs/data?lovCode=SMAL.EC_FREIGHT_TYPE`
    ).then((res) => {
      if(isArray(res)) {
        setList(res);
      }
    });
    request(
      `${SRM_MALL}/v1/${getCurrentOrganizationId()}/ec-client-values/by-condition?ecClientId=${
        recordData.ecClientId
      }&valueType=FREIGHT_TYPE`
    ).then((res) => {
      DS.loadData([
        {
          ecClientId: recordData.ecClientId,
          tenantId: getCurrentOrganizationId(),
          valueType,
          ...res?.[0],
          freightType: res?.[0]?.valueCode,
        },
      ]);
    });
  };

  useEffect(() => {
    props.onDSRef({ name: 'freightTypeDS', ref: DS });
    fetchData();
  }, []);

  return (
    <>
      <p style={{ marginBottom: 4, color: 'rgba(0,0,0,0.65)' }}>
        {intl.get('small.common.model.freightType.label').d('请选择与电商协议中所签订的运费类型')}
      </p>
      <div>
        {list.map((l) => (
          <Radio
            style={{ marginRight: 24 }}
            dataSet={DS}
            name="freightType"
            value={l.value}
            onChange={() => {
              DS.current.set('valueName', l.meaning);
              DS.current.set('valueCode', l.value);
            }}
          >
            {l.meaning}
          </Radio>
        ))}
      </div>
    </>
  );
}
