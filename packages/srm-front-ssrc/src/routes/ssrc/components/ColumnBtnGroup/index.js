import React, { cloneElement } from 'react';
import { Button, Dropdown, Menu, Icon } from 'choerodon-ui/pro';
import { isObject, isEmpty } from 'lodash';
import classNames from 'classnames';

import intl from 'utils/intl';

import styles from './index.less';

const { SubMenu, Item: MenuItem } = Menu;

export const formatColumnCommand = (props) => {
  const { limit = 3, buttons = [] } = props;
  const showBtnList = [];
  buttons.forEach((item) => {
    if (item && isObject(item)) {
      const { mainFlag, showFlag = true } = item;
      if (showFlag) {
        if (mainFlag) {
          showBtnList.unshift(item);
        } else {
          showBtnList.push(item);
        }
      }
    }
  });
  const showBtnsCount = showBtnList.length;
  const btnList = showBtnList.splice(0, showBtnsCount > limit ? limit - 1 : limit).map((item) => {
    const { name, text, wait, group, children, onClick, btnComp, className } = item;
    if (btnComp) {
      return cloneElement(btnComp, { key: name });
    } else if (group) {
      return (
        <Dropdown key={name} overlay={children}>
          <Button funcType="link" color="primary" className={styles['ssrc-command-btn']}>
            {text}
            <Icon type="expand_more" className={styles['ssrc-command-more-icon']} />
          </Button>
        </Dropdown>
      );
    } else {
      return (
        <Button
          key={name}
          funcType="link"
          color="primary"
          wait={wait}
          onClick={onClick}
          className={classNames(styles['ssrc-command-btn'], className)}
        >
          {text}
        </Button>
      );
    }
  });

  if (!isEmpty(showBtnList)) {
    btnList.push(
      <Dropdown
        overlay={() => (
          <Menu className={styles['ssrc-command-menu']}>
            {showBtnList.map((item) => {
              const { name, text, group, children, onClick, btnComp } = item;
              if (group) {
                return (
                  <SubMenu key={name} title={<span style={{ paddingRight: 18 }}>{text}</span>}>
                    {children}
                  </SubMenu>
                );
              } else {
                return (
                  <MenuItem key={name} onClick={onClick}>
                    {btnComp || text}
                  </MenuItem>
                );
              }
            })}
          </Menu>
        )}
      >
        <Button funcType="link" color="primary" className={styles['ssrc-command-btn']}>
          {intl.get('hzero.common.button.more').d('更多')}
          <Icon type="expand_more" className={styles['ssrc-command-more-icon']} />
        </Button>
      </Dropdown>
    );
  }
  return btnList;
};

const renderMainBtns = ({ mainOperations, btnsMap }) => {
  return mainOperations
    .filter((item) => item.approve)
    .map((btnItem) => {
      const { controllerType = '', operation, operationMeaning } = btnItem;
      const isDisabled = controllerType === 'disabled';
      const { btnCamp, className, onClick, ...otherSelfProps } = btnsMap[operation] || {};
      if (btnCamp)
        {return cloneElement(btnCamp, {
          key: operation,
          disabled: isDisabled,
          ...btnItem,
        });}
      return (
        <Button
          funcType="link"
          color="primary"
          key={operation}
          disabled={isDisabled}
          className={classNames(styles['ssrc-command-btn'], className)}
          onClick={onClick}
          {...otherSelfProps}
        >
          {operationMeaning}
        </Button>
      );
    });
};

const renderMoreBtns = ({ moreOperations, btnsMap, isAggregation }) => {
  if (!moreOperations?.length) return [];
  const moreList = moreOperations.filter((item) => item.approve);
  if (isEmpty(moreList)) return [];

  return [
    <Dropdown
      overlay={() => (
        <Menu className={styles['ssrc-command-menu']}>
          {moreList.map((btnItem) => {
            const { controllerType = '', operation, operationMeaning } = btnItem;
            const isDisabled = controllerType === 'disabled';
            const { btnComp, className, onClick, ...otherSelfProps } = btnsMap[operation] || {};
            const menuItem = btnComp ? cloneElement(btnComp, { ...btnItem }) : operationMeaning;
            return (
              <MenuItem key={operation} onClick={onClick} disabled={isDisabled} {...otherSelfProps}>
                {menuItem}
              </MenuItem>
            );
          })}
        </Menu>
      )}
    >
      <Button
        funcType="link"
        color="primary"
        className={styles['ssrc-command-btn']}
        style={isAggregation ? { marginLeft: 0, marginTop: -8 } : {}}
      >
        {intl.get('hzero.common.button.more').d('更多')}
        <Icon type="expand_more" className={styles['ssrc-command-more-icon']} />
      </Button>
    </Dropdown>,
  ];
};

export const formatColumnCommandNew = ({ record, btnsMap, isAggregation = false }) => {
  const { mainOperations, moreOperations } = record.get(['mainOperations', 'moreOperations']);

  if (!mainOperations?.length) return [];
  return [
    ...renderMainBtns({ mainOperations, btnsMap }),
    ...renderMoreBtns({ moreOperations, btnsMap, isAggregation }),
  ];
};
