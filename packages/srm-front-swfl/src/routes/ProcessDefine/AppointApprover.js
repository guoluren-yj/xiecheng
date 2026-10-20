import React from 'react';
import { Tag, Icon } from 'choerodon-ui';
import { observer } from 'mobx-react';
import { Lov } from 'choerodon-ui/pro';
import styles from './TodoRemind.less';

const fieldCode = 'approverResignDefaultEmp';
const namefieldCode = 'approverResignDefaultEmpName';
const lovFieldCode = 'approverResignDefaultEmpLov';

const AppointApprover = observer(({ record }) => {
  const currentApprover = record?.get(fieldCode);
  const currentApproverName = record?.get(namefieldCode);
  const handleClose = () => {
    if (record) {
      record.set(fieldCode, undefined);
    }
  };
  const handleChange = (value) => {
    record.set(fieldCode, value && value.employeeNum);
    record.set(namefieldCode, value && value.name);
  };

  return (
    <span style={{ marginLeft: '8px' }}>
      {currentApprover ? (
        <Tag closable onClose={handleClose}>
          {`${currentApproverName || ''}(${currentApprover})`}
        </Tag>
      ) : (
        <Lov
          className={styles['lov-button-mode']}
          mode="button"
          record={record}
          name={lovFieldCode}
          onChange={handleChange}
          clearButton={false}
        >
          <span>
            <Icon type="add" />
          </span>
        </Lov>
      )}
    </span>
  );
});

export default AppointApprover;
