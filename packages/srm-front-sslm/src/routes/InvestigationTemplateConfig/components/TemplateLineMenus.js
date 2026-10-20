/*
 * @Date: 2023-03-13 15:55:38
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import { Menu } from 'choerodon-ui/pro';
import intl from 'utils/intl';

// 行菜单
const TemplateLineMenus = ({ record, onClick = () => {} }) => {
  return (
    <Menu onClick={props => onClick({ ...props, record })}>
      <Menu.Item key="allocateCompany">
        {intl.get(`sslm.investTempConfig.view.button.allocateCompany`).d('分配公司')}
      </Menu.Item>
      {/* <Menu.Item key="conditionsConfig">
        {intl.get(`sslm.investDefOrg.model.investDefOrg.conditionsConfiguration`).d('发送条件配置')}
      </Menu.Item> */}
      <Menu.Item key="historyVersion">
        {intl.get('hzero.common.button.historyVersion').d('历史版本')}
      </Menu.Item>
    </Menu>
  );
};

export default TemplateLineMenus;
