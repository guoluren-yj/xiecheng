/* eslint-disable jsx-a11y/alt-text */
import React, { useRef, useMemo, useState, useCallback } from 'react';
import classnames from 'classnames';
import { ColorPicker } from 'choerodon-ui/pro';
import { Popover, Icon, Tooltip } from 'choerodon-ui';


import intl from 'utils/intl';

import borderColorSvg from '@/assets/sheet/cellBgColor.svg';
import borderStyleSvg from '@/assets/sheet/borderStyle.svg';
import {
  FirstFontColor,
  SecondFontColor,
  borderStyleData,
  borderMap,
} from '../../utils/constant';
import { transformRGBColor } from '../../utils/utils';
import styles from '../../index.less';

const clsPrefix = 'sheet-toolbar-border';

export default function BgColor({ item, sheetRef, disabled }) {
  const colorPickerRef = useRef();
  const { title, options } = item;
  const [value, setValue] = useState(options[0].value);
  const [icon, setIcon] = useState(options[0].icon);
  const [colorPopupVisible, setColorPopupVisible] = useState(false);
  const [stylePopupVisible, setStylePopupVisible] = useState(false);
  const [borderColor, setBorderColor] = useState('rgba(0,0,0,1)');
  const [borderStyle, setBorderStyle] = useState('1');

  const setCellStyle = useCallback(
    (newBorder) => {
      const borderInfo = {
        rangeType: 'range',
        borderType: value,
        color: transformRGBColor(borderColor),
        style: borderStyle,
        // eslint-disable-next-line no-undef
        range: $.extend(true, [], sheetRef.current.getluckysheet_select_save()),
        ...newBorder,
      };
      sheetRef.current.setBorder(borderInfo);
    },
    [value, borderColor, borderStyle]
  );

  const changeBorderType = useCallback(
    (borderItem) => {
      setValue(borderItem.value);
      setIcon(borderItem.icon);
      setCellStyle({
        borderType: borderItem.value,
      });
    },
    [setCellStyle]
  );

  const changeBorderColor = useCallback(
    (color) => {
      setColorPopupVisible(false);
      setBorderColor(color);
      setCellStyle({
        color: transformRGBColor(color),
      });
    },
    [setCellStyle]
  );

  const changeBorderStyle = useCallback(
    (style) => {
      setBorderStyle(style);
      setCellStyle({
        style,
      });
    },
    [setCellStyle]
  );

  const renderSecordFontColorItem = useCallback(
    (index) => {
      return SecondFontColor.slice(index, index + 9).map((color) => (
        <div
          onClick={() => changeBorderColor(color)}
          className={styles['custome-color-item']}
          style={{
            backgroundColor: color,
            borderColor: 'rgba(0, 0, 0, 0.08)',
          }}
        />
      ));
    },
    [SecondFontColor, changeBorderColor]
  );

  const customeColorContent = useMemo(
    () => (
      <ColorPicker
        onChange={changeBorderColor}
        getPopupContainer={(that) => that}
        ref={colorPickerRef}
        autoFocus
      />
    ),
    [FirstFontColor, changeBorderColor, SecondFontColor, renderSecordFontColorItem]
  );

  const customeStyleContent = useMemo(
    () => (
      <div>
        {borderStyleData.map((b) => (
          <div className={styles['custome-style-item']} onClick={() => changeBorderStyle(b.value)}>
            <span>
              {Number(b.value) === Number(borderStyle) && (
                <Icon type="check" className={styles['dropdown-menu-item-check-icon']} />
              )}
            </span>
            {b.img}
          </div>
        ))}
      </div>
    ),
    [borderStyleData, changeBorderStyle]
  );

  const handleColorPopupVisibleChange = useCallback((newVisible) => {
    setColorPopupVisible(newVisible);
  }, []);

  const handleStylePopupVisibleChange = useCallback((newVisible) => {
    setStylePopupVisible(newVisible);
  }, []);

  const handleColorPopupVisibleBeforeChange = (popVisible) => {
    if (
      colorPickerRef.current &&
      colorPickerRef.current.setPopup &&
      !colorPickerRef.current.statePopup
    ) {
      colorPickerRef.current.setPopup(popVisible);
    }
  };

  const content = useMemo(
    () => (
      <div>
        <div className={styles[`${clsPrefix}-list`]}>
          <div>
            {options.slice(0, 4).map((option) => (
              <div
                onClick={() => changeBorderType(option)}
                className={classnames({
                  [styles[`${clsPrefix}-item`]]: true,
                  [styles[`${clsPrefix}-item-active`]]: value === option.value,
                })}
              >
                {borderMap[option.icon]}
              </div>
            ))}
          </div>
        </div>
        <div className={styles[`${clsPrefix}-list`]} style={{ marginBottom: '8px' }}>
          <div>
            {options.slice(4).map((option) => (
              <div
                onClick={() => changeBorderType(option)}
                className={classnames({
                  [styles[`${clsPrefix}-item`]]: true,
                  [styles[`${clsPrefix}-item-active`]]: value === option.value,
                })}
              >
                {borderMap[option.icon]}
              </div>
            ))}
          </div>
        </div>
        <Popover
          content={customeColorContent}
          visible={colorPopupVisible}
          onVisibleChange={handleColorPopupVisibleChange}
          placement="right"
          onVisibleBeforeChange={handleColorPopupVisibleBeforeChange}
          overlayClassName={styles[`${clsPrefix}-custome-overlay`]}
        >
          <div className={styles[`${clsPrefix}-item-has-more`]}>
            <span style={{ marginLeft: '10px' }}>
              <img src={borderColorSvg} width={20} alt="" />
              <span>{intl.get('hrpt.reportDesign.view.title.borderColor').d('边框颜色')}</span>
            </span>
            <span>
              <Icon type="keyboard_arrow_right" style={{ verticalAlign: 'text-bottom' }} />
            </span>
          </div>
        </Popover>
        <Popover
          content={customeStyleContent}
          visible={stylePopupVisible}
          onVisibleChange={handleStylePopupVisibleChange}
          placement="right"
          getPopupContainer={(that) => that}
          overlayClassName={styles[`${clsPrefix}-custome-style-overlay`]}
        >
          <div className={styles[`${clsPrefix}-item-has-more`]}>
            <span style={{ marginLeft: '14px' }}>
              <img src={borderStyleSvg} width={14} alt="" />
              <span style={{ marginLeft: '2px' }}>
                {intl.get('hrpt.reportDesign.view.title.borderStyle').d('边框样式')}
              </span>
            </span>
            <span>
              <Icon type="keyboard_arrow_right" style={{ verticalAlign: 'text-bottom' }} />
            </span>
          </div>
        </Popover>
      </div>
    ),
    [
      options,
      colorPopupVisible,
      stylePopupVisible,
      handleColorPopupVisibleBeforeChange,
      handleColorPopupVisibleChange,
      handleStylePopupVisibleChange,
      changeBorderType,
      value,
      customeColorContent,
      customeStyleContent,
    ]
  );

  return (
    <Tooltip title={title}>
      <div
        className={classnames(styles[`${clsPrefix}`], {
          [styles['sheet-toolbar-diabled']]: disabled,
        })}
      >
        <div onClick={() => setCellStyle()}>
          {borderMap[icon]}
        </div>
        <Popover
          content={content}
          trigger="click"
          disabled={disabled}
          placement="bottomLeft"
          overlayClassName={styles[`${clsPrefix}-overlay`]}
        >
          <div>
            <Icon type="arrow_drop_down" />
          </div>
        </Popover>
      </div>
    </Tooltip>
  );
}
