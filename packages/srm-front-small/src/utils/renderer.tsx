import React, { MouseEventHandler, ReactNode } from 'react';
import { Menu, Button, Dropdown, Icon, Tooltip } from 'choerodon-ui/pro';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { Placements } from 'choerodon-ui/pro/lib/dropdown/enum';

import intl from 'utils/intl';

interface OperationProps {
  buttonList: {
    key: string;
    name?: string,
    disabled?: boolean,
    children?: ReactNode,
    tooltipTitle?: string,
    onClick?: MouseEventHandler<any>,
    [extProp: string]: any;
  }[];
  maxNum?: number;
  [extProp: string]: any;
};

export function operationRender(props: OperationProps) {
  const { buttonList, maxNum = 3 } = props;
  const isHaveMore = buttonList.length > maxNum;
  const endIndex = maxNum -1;
  const buttons = isHaveMore ? buttonList.slice(0, endIndex) : buttonList;
  const menu = (
    <Menu style={{ width: 96 }}>
      {buttonList.slice(endIndex).map((m) => m.type === 'subMenu' ? (
        <Menu.SubMenu title={m.subTitle} onClick={m.onClick}>
          {m.children}
        </Menu.SubMenu>
      ) : (
        <Menu.Item onClick={m.onClick}>
          {m.name || m.children}
        </Menu.Item>
      ))}
    </Menu>
  );
  return (
    <span className="action-link">
      {buttons.map((btn, index) => (
        <Tooltip title={btn.tooltipTitle || null}>
          <Button disabled={btn.disabled} color={ButtonColor.primary} funcType={FuncType.link} onClick={btn.onClick} style={{ marginLeft: index ? '16px' : 'unset' }}>
            {btn.name || btn.children}
          </Button>
        </Tooltip>
      ))}
      {isHaveMore && (
        <Dropdown overlay={menu} placement={Placements.bottomLeft}>
          <Button color={ButtonColor.primary} funcType={FuncType.link} style={{ marginLeft: '16px' }}>
            {intl.get('hzero.common.button.more').d('更多')}
            <Icon type="expand_more" style={{ fontSize: 14, marginLeft: 4, marginBottom: 2 }} />
          </Button>
        </Dropdown>
      )}
    </span>
  );
}
