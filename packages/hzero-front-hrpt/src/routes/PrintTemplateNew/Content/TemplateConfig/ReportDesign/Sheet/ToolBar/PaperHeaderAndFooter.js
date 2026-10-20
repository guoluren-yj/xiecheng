import React, { useMemo, useCallback } from 'react';
import classnames from 'classnames';
import { DataSet, Button, Modal, Form, TextField } from 'choerodon-ui/pro';
import PaperRotationSvg from '@/assets/sheet/paperRotation.svg';
import intl from 'utils/intl';

import styles from '../../index.less';
import { exitEditMode } from '../../utils/utils';

const clsPrefix = 'sheet-toolbar-paper-header-footer';

export default function PaperRotation({ item, disabled }) {
  const { name, type, title, options } = item;
  const formDs = useMemo(
    () =>
      new DataSet({
        fields: [
          {
            name: 'header',
            label: intl.get('hrpt.reportDesign.view.button.paperHeader').d('页眉'),
          },
          {
            name: 'footer',
            label: intl.get('hrpt.reportDesign.view.button.paperFooter').d('页脚'),
          },
        ],
      }),
    []
  );

  const openModal = useCallback(() => {
    exitEditMode();
    Modal.open({
      title,
      children: (
        <Form dataSet={formDs}>
          <TextField name="header" />
          <TextField name="footer" />
        </Form>
      ),
    });
  }, [formDs]);

  return (
    <Button
      funcType="flat"
      className={classnames(styles[clsPrefix], {
        // [styles['sheet-toolbar-diabled']]: disabled
        [styles['sheet-toolbar-diabled']]: true,
      })}
      // disabled={disabled}
      disabled
      onClick={openModal}
    >
      <img src={PaperRotationSvg} />
      <span>{title} </span>
    </Button>
  );
}
