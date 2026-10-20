/* eslint-disable jsx-a11y/alt-text */
import React, { useState, useCallback, useEffect } from 'react';
import classnames from 'classnames';
import { DataSet, Button, Form, Modal, NumberField } from 'choerodon-ui/pro';
import { Popover, Icon } from 'choerodon-ui';

import WaterMaskSvg from '@/assets/sheet/waterMask.svg';
import intl from 'utils/intl';

import styles from '../../index.less';
import { exitEditMode } from '../../utils/utils';

const clsPrefix = 'sheet-toolbar-water-mask';

export default function WaterMask({ sheetRef, item, disabled, setRightPaneVisible, setRightPaneKey }) {
  const { title, name } = item;

  const handleClick = () => {
    setRightPaneVisible(true);
    setRightPaneKey(name);
    if (sheetRef.current && sheetRef.current.resize) {
      setTimeout(() => {
        sheetRef.current.resize();
      }, 0);
    }
  };

  return (
    <Button
      funcType="flat"
      onClick={handleClick}
      disabled={disabled}
      className={classnames(styles[clsPrefix], { [styles['sheet-toolbar-diabled']]: disabled })}
    >
      <img src={WaterMaskSvg} />
      <span>{title} </span>
    </Button>
  );
}
