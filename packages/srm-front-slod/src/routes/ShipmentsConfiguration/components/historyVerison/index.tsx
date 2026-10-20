
import React, {ReactNode, ReactElement, MouseEventHandler, cloneElement} from 'react';
import { Dropdown, Menu, Icon, Button } from 'choerodon-ui/pro';
import type { Commands } from 'choerodon-ui/pro/lib/table/Table';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { isObject, isEmpty } from 'lodash';
import classNames from 'classnames';
import intl from 'utils/intl';
import styles from "./index.less";

const { SubMenu, Item: MenuItem } = Menu;

interface ColumnBtnProps
{
  name: string,
  text?: ReactNode,
  wait?: number,
  group?: boolean,
  showFlag?: boolean, // 按钮展示逻辑
  mainFlag?: boolean, // 是否为主按钮，默认只有一个
  btnComp?: ReactElement,
  onClick?: MouseEventHandler<any>,
  children?: ReactNode,
  className?: string,
}


interface ColumnBtnGroupProps
{
  limit?: number,
  buttons: ColumnBtnProps[],
}

export const formatColumnCommand = (props: ColumnBtnGroupProps): Commands[] =>
{
  const { limit = 3, buttons = [] } = props;
  const showBtnList: ColumnBtnProps[] = [];
  buttons.forEach(item =>
  {
    if (item && isObject(item))
    {
      const { mainFlag, showFlag = true } = item;
      if (showFlag)
      {
        if (mainFlag)
        {
          showBtnList.unshift(item);
        } else
        {
          showBtnList.push(item);
        }
      }
    }
  });
  const showBtnsCount = showBtnList.length;
  const btnList = showBtnList
    .splice(0, showBtnsCount > limit ? limit - 1 : limit)
    .map(item =>
    {
      const { name, text, wait, group, children, onClick, btnComp, className } = item;
      if (btnComp)
      {
        return cloneElement(btnComp, { key: name });
      } else if (group)
      {
        return (
          <Dropdown key={name} overlay={children}>
            <Button funcType={FuncType.link} color={ButtonColor.primary} className={styles['ssta-command-btn']}>
              {text}
              <Icon type="expand_more" className={styles['ssta-command-more-icon']} />
            </Button>
          </Dropdown>
        );
      } else
      {
        return (
          <Button
            key={name}
            funcType={FuncType.link}
            color={ButtonColor.primary}
            wait={wait}
            onClick={onClick}
            className={classNames(styles['ssta-command-btn'], className)}
          >
            {text}
          </Button>
        );
      }
    });
  // if (isEmpty(btnList)) return ['-'] as any;
  if (!isEmpty(showBtnList))
  {
    btnList.push(
      <Dropdown
        overlay={() => (
          <Menu className={styles['ssta-command-menu']}>
            {showBtnList.map(item =>
            {
              const { name, text, group, children, onClick, btnComp } = item;
              if (group)
              {
                return (
                  <SubMenu key={name} title={<span style={{ paddingRight: 18 }}>{text}</span>}>
                    {children}
                  </SubMenu>
                );
              } else
              {
                return (
                  <MenuItem key={name} onClick={onClick}>{btnComp || text}</MenuItem>
                );
              }
            })}
          </Menu>
        )}
      >
        <Button funcType={FuncType.link} color={ButtonColor.primary} className={styles['ssta-command-btn']}>
          {intl.get('hzero.common.button.more').d('更多')}
          <Icon type="expand_more" className={styles['ssta-command-more-icon']} />
        </Button>
      </Dropdown>
    );
  }
  return btnList;
};