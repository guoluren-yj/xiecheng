import React from 'react';
import { Button } from 'choerodon-ui/pro';
import { Checkbox, Tooltip } from 'choerodon-ui';
import { FuncType } from 'choerodon-ui/pro/lib/button/enum';

import Distribute from './PermissionAssignmentModal';
import styles from '../index.less';

export default function DataSourceRow(props) {
  return (
    <tr className={styles['data-source-row']}>
      <td style={{ width: '35%' }}>
        <Tooltip title={`${props?.schemaName}(${props.dataSourceType})`}>
          {`${props?.schemaName}(${props.dataSourceType})`}
        </Tooltip>
      </td>
      <td style={{ width: '25%', textAlign: 'center' }}>
        <Checkbox
          style={{ margin: '0 4px' }}
          checked={[1].includes(props?.createTableFlag)}
          disabled={props?.createTableDisabled}
          onChange={props?.checkBoxOnChange.bind(null, props, 'createTableFlag')}
        />
        创建表
      </td>
      <td style={{ width: '25%', textAlign: 'center' }}>
        <Checkbox
          style={{ margin: '0 4px' }}
          checked={[1].includes(props?.allTableFlag)}
          disabled={props?.authorizationDisabled}
          onChange={props?.checkBoxOnChange.bind(null, props, 'allTableFlag')}
        />
        全部授权
      </td>
      <td style={{ width: '15%', textAlign: 'center' }}>
        {props?.allTableFlag ? (
          <Tooltip title="当前数据源的全部基础表已授权">
            <Button disabled funcType={FuncType.flat}>
              权限分配
            </Button>
          </Tooltip>
        ) : (
          <Distribute {...props} />
        )}
      </td>
    </tr>
  );
}
