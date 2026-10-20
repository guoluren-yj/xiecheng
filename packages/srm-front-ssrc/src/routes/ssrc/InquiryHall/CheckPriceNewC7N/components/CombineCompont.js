import React, { Fragment, useEffect, useState } from 'react';
import { noop, isNil } from 'lodash';

import intl from 'utils/intl';
import { Select } from 'choerodon-ui/pro';

import C7nPrecisionInputNumber from '@/routes/components/Precision/C7nPrecisionInputNumber';

// 联系人-电话
const CombineCompont = (props = {}) => {
  const { record, disabled, nameMethod, name, uom, handleQuantity = noop, hiddenCustMethod } =
    props || {};
  const handleChange = (value) => {
    record.set('allocationMethod', value);
    if (value === 'NO_ALLOCATED_QUANTITY_RATIO') {
      record.set('allottedQuantity', null);
      record.set('allottedSecondaryQuantity', null);
      record.set('allottedRatio', null);
    }
  };

  const [displayName, setDisplayName] = useState(null);

  useEffect(() => {
    let disName = '';
    if (disabled) {
      if (record.get(nameMethod) === 'NO_ALLOCATED_QUANTITY_RATIO') {
        disName =
          nameMethod === 'allocationMethodQuantity'
            ? intl.get('ssrc.inquiryHall.model.inquiryHall.noAllottedQuantity').d('无分配数量')
            : intl.get('ssrc.inquiryHall.model.inquiryHall.noDistributionRatio').d('无分配比例');
      } else {
        disName = isNil(record.get(name)) ? '-' : record.get(name);
      }
    }
    setDisplayName(disName);
  }, [nameMethod, disabled, name, record.get(nameMethod), record.get(name)]);

  return (
    <Fragment>
      {disabled ? (
        <span> {displayName} </span>
      ) : (
        <div style={{ display: 'flex', height: 'inherit', lineHeight: 'inherit' }}>
          <Select
            record={record}
            hidden={hiddenCustMethod}
            clearButton={false}
            name={nameMethod}
            disabled={disabled}
            onChange={handleChange}
            style={{ width: '50%', height: '26px' }}
          />
          <C7nPrecisionInputNumber
            name={name}
            record={record}
            uom={uom}
            disabled={disabled}
            onChange={(val) => handleQuantity(val, record)}
            style={{ width: hiddenCustMethod ? '100%' : '50%', height: '26px' }}
          />
        </div>
      )}
    </Fragment>
  );
};

export default CombineCompont;
