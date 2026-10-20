import React, { useCallback, useState } from 'react';
import { Select } from 'choerodon-ui/pro';
import { queryUnifyIdpValue } from 'services/api';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';

const { Option } = Select;
const organizationId = getCurrentOrganizationId();

const IndOptSelect = ({ name, record }) => {
  const [optionList, setOptionList] = useState([]);

  const handlePopupHiddenChange = useCallback(hidden => {
    if (!hidden) {
      queryUnifyIdpValue('SSLM.KPI.INDICATOR.OPT.CFG', {
        tenantId: organizationId,
        evalTplIndId: record?.get('indicatorId'),
      }).then(response => {
        const res = getResponse(response);
        if (res) {
          setOptionList(res);
        }
      });
    }
  });

  // 值改变时的回调
  const hanldeSelectChange = useCallback(
    value => {
      let currentOption = {};
      if (value) {
        currentOption = { ...value, ...(value.__OTHER_OPTION_PROPS__ || {}) };
      }
      record.set({
        score: currentOption.score,
        evalTplIndOptId: currentOption.value,
        indOptName: currentOption.meaning,
      });
    },
    [record]
  );

  return (
    <Select
      name={name}
      record={record}
      onChange={hanldeSelectChange}
      onPopupHiddenChange={handlePopupHiddenChange}
    >
      {optionList.map(option => (
        <Option {...option}>{option.meaning}</Option>
      ))}
    </Select>
  );
};

export default IndOptSelect;
