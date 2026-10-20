import React, { useMemo } from 'react';
import classnames from 'classnames';
import { DataSet, Button, Modal, Form, TextField } from 'choerodon-ui/pro';
import { Icon, Tooltip } from 'choerodon-ui';
import TemplatePrintPicSvg from '@/assets/sheet/templatePrintPic.svg';
import intl from 'utils/intl';

import { ToolBarType } from '../../utils/constant';
import styles from '../../index.less';

const clsPrefix = 'sheet-toolbar-templatePrintPic';

export default function PaperRotation({ item, disabled }) {
  const { name, type, title, options } = item;

  return (
    <Button
      funcType="flat"
      className={classnames(styles[clsPrefix], {
        // [styles['sheet-toolbar-diabled']]: disabled
        [styles['sheet-toolbar-diabled']]: true,
      })}
      disabled
    >
      <img src={TemplatePrintPicSvg} />
      <span>{title} </span>
    </Button>
  );
}
