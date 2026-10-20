import React, { useMemo, useState, useCallback, useEffect } from 'react';
import classnames from 'classnames';
import { Dropdown, DataSet, Button, Menu, NumberField } from 'choerodon-ui/pro';
import { Popover, Icon, Tooltip } from 'choerodon-ui';
import { isNil } from 'lodash';
import PaperRotationSvg from '@/assets/sheet/paperRotation.svg';
import intl from 'utils/intl';

import { ToolBarType } from '../../utils/constant';
import styles from '../../index.less';

const clsPrefix = 'sheet-toolbar-paper-rotation';

export default function PaperRotation({ sheetRef, item, disabled }) {
  const { name, type, title, options } = item;
  const [value, setValue] = useState('vertical');

  useEffect(() => {
    const initConfig = sheetRef.current.getPrintConfig();
    if (initConfig && !isNil(initConfig.rotation)) {
      //  rotation 为1是横向 0是纵向
      setValue(initConfig.rotation === 0 ? 'vertical' : 'horizontal');
    }
  }, []);

  const handleClick = useCallback((type) => {
    setValue(type);
    if (sheetRef.current) {
      const { height, width, rotation: r = 0 } = sheetRef.current.getPrintConfig();
      let newWidth = width;
      let newHeight = height;
      const rotation = type === 'vertical' ? 0 : 1;
      if (Number(r) !== Number(rotation)) {
        newWidth = height;
        newHeight = width;
      }
      sheetRef.current.setPrintConfig({
        rotation,
        width: newWidth,
        height: newHeight,
      });
    }
  }, []);

  const content = useMemo(
    () => (
      <div className={styles[`${clsPrefix}-menu`]}>
        {options.map((option) => (
          <div
            key={option.value}
            className={styles[`${clsPrefix}-menu-item`]}
            onClick={() => handleClick(option.value)}
          >
            <span style={{ width: '20px', display: 'inline-block' }}>
              {value === option.value && (
                <Icon type="check" className={styles['dropdown-menu-item-check-icon']} />
              )}
            </span>
            {option.text}
          </div>
        ))}
      </div>
    ),
    [options, handleClick, value]
  );

  return (
    <Popover
      trigger={'click'}
      placement="bottomLeft"
      overlayClassName={styles[`${clsPrefix}-overlay`]}
      disabled={disabled}
      content={content}
    >
      <Button
        funcType="flat"
        className={classnames(styles[clsPrefix], { [styles['sheet-toolbar-diabled']]: disabled })}
        // disabled={disabled}
      >
        <img src={PaperRotationSvg} />
        <span>{title} </span>
        <Icon type="arrow_drop_down" />
      </Button>
    </Popover>
  );
}
