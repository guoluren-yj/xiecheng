import React from 'react';
import classnames from 'classnames';
import { Dropdown, Button, Menu } from 'choerodon-ui/pro';
import { Icon, Tooltip } from 'choerodon-ui';
import FloatPicSvg from '@/assets/sheet/floatPic.svg';
import CellPicSvg from '@/assets/sheet/cellPic.svg';

import intl from 'utils/intl';

import { ToolBarType } from '../../utils/constant';
import styles from '../../index.less';

export default function TextButton({ item, disabled }) {
  const { name, type, title, options } = item;

  return (
    <Button
      funcType="flat"
      className={classnames(styles['sheet-toolbar-text-button'], {
        // [styles['sheet-toolbar-text-button-disabled']]: disabled,
        [styles['sheet-toolbar-text-button-disabled']]: true,
      })}
      //disabled={disabled}
      disabled
    >
      {title}
    </Button>
  );
}
