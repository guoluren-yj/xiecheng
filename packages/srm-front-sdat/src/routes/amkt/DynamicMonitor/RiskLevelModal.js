/* eslint-disable no-unused-expressions */
/**
 * 动态监控等级弹窗
 * @date: 2022-10-17
 * @author: Zip <zepeng.huang@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2022, Hand
 */

import React from 'react';
import { Table, Icon } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import './index.less';
import { Button as PermissionButton } from 'components/Permission';

const { Column } = Table;
const restoreDefSettingPmn =
  'srm.bg.manager.enterprise-control.monitor-overview.button.restore-default-setting'; // 恢复默认等级配置

export default function RiskLevelModal(props) {
  const { stuffRiskLevelDs } = props;

  const handleReset = () => {
    stuffRiskLevelDs.setQueryParameter('reset', true);
    stuffRiskLevelDs
      .query()
      .then(() => {
        stuffRiskLevelDs.forEach((rec) => {
          // eslint-disable-next-line no-param-reassign
          rec.status = 'update';
        });
      })
      .finally(() => {
        stuffRiskLevelDs.setQueryParameter('reset', false);
      });
  };

  return (
    <>
      <Table
        dataSet={stuffRiskLevelDs}
        border={false}
        pagination={false}
        highLightRow={false}
        columnResizable={false}
        queryBar="none"
      >
        <Column
          name="ruleDesc"
          headerStyle={{ backgroundColor: 'transparent', border: '0px solid transparent' }}
        />
        <Column
          name="arrow"
          width={50}
          renderer={() => <Icon type="arrow_forward" style={{ display: 'inline' }} />}
          headerStyle={{ backgroundColor: 'transparent', border: '0px solid transparent' }}
        />
        <Column
          name="eventLevel"
          width={200}
          headerStyle={{ backgroundColor: 'transparent', border: '0px solid transparent' }}
          editor
        />
      </Table>
      <PermissionButton
        permissionList={[{ code: restoreDefSettingPmn }]}
        type="c7n-pro"
        funcType="flat"
        color="primary"
        icon="refresh"
        onClick={handleReset}
      >
        {intl.get('sdat.dynamicMonitor.view.button.resetDefault').d('恢复默认设置')}
      </PermissionButton>
    </>
  );
}
