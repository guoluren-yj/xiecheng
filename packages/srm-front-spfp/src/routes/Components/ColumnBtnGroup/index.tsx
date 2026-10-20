import type { ReactNode, ReactElement, MouseEventHandler } from 'react';
import React, { memo, useEffect, useState, cloneElement } from 'react';
import { Button, Dropdown, Menu, Icon } from 'choerodon-ui/pro';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { isObject, isEmpty } from 'lodash';
import classNames from 'classnames';

import intl from 'utils/intl';

import type { Commands } from 'choerodon-ui/pro/lib/table/Table';
import styles from './index.less';

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
  className?: string,
  children?: ReactNode,
}

interface ColumnBtnGroupProps
{
  limit?: number,
  buttons: ColumnBtnProps[],
}

const ColumnBtnGroup = memo((props: ColumnBtnGroupProps) =>
{

  const {
    limit = 3,
    buttons,
  } = props;

  const [btnsData, setBtnsData] = useState<any>({ btnList: [], menuItemList: [] });

  useEffect(() =>
  {
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
    const btnList = showBtnList.splice(0, showBtnsCount > limit ? limit - 1 : limit);
    setBtnsData({ btnList, menuItemList: showBtnList });
  }, [buttons, limit]);

  const { btnList, menuItemList } = btnsData;

  if (isEmpty(btnList)) return <span>-</span>;

  return (
    <div className={styles['spfp-columnBtnGroup-wrapper']}>
      {btnList.map(item =>
      {
        const { name, text, wait, onClick, btnComp } = item;
        return btnComp ? cloneElement(btnComp, { key: name }) : (
          <Button key={name} funcType={FuncType.link} color={ButtonColor.primary} wait={wait} onClick={onClick}>
            {text}
          </Button>
        );
      })}
      {!isEmpty(menuItemList) && (
        <Dropdown
          overlay={() => (
            <Menu className={styles['spfp-columnBtnGroup-menu']}>
              {menuItemList.map(item =>
              {
                const { name, text, onClick, btnComp } = item;
                return (
                  <MenuItem key={name} onClick={onClick}>{btnComp || text}</MenuItem>
                );
              })}
            </Menu>
          )}
        >
          <Button funcType={FuncType.link} color={ButtonColor.primary}>
            {intl.get('hzero.common.button.more').d('更多')}
            <Icon type="expand_more" className={styles['spfp-columnBtnGroup-more-icon']} />
          </Button>
        </Dropdown>
      )}
    </div>
  );
});

export default ColumnBtnGroup;

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
            <Button funcType={FuncType.link} color={ButtonColor.primary} className={styles['spfp-command-btn']}>
              {text}
              <Icon type="expand_more" className={styles['spfp-command-more-icon']} />
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
            className={classNames(styles['spfp-command-btn'], className)}
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
          <Menu className={styles['spfp-command-menu']}>
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
        <Button funcType={FuncType.link} color={ButtonColor.primary} className={styles['spfp-command-btn']}>
          {intl.get('hzero.common.button.more').d('更多')}
          <Icon type="expand_more" className={styles['spfp-command-more-icon']} />
        </Button>
      </Dropdown>
    );
  }
  return btnList;
};