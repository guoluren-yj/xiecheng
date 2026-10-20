/**
 * 主题配置-自定义颜色Select
 * @author: ke.wang01 <ke.wang01@gonig-link.com>
 * @since: 2022-8-19 14:23:03
 * @description: 主题配置-自定义颜色
 * @copyright: Copyright (c) 2022, Hand
 */

import React, { useState, memo, useRef, useCallback, useEffect, useMemo } from 'react';
import { Select, Icon, ColorPicker, Tooltip } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { DEFAULT_BACKGROUND, DEFAULT_LINK, getDefaultValue } from './util';
import styles from './index.less';

const { Option } = Select;
const optionClassName = 'c7n-pro-select-dropdown-menu-item';
const optionActiveClassName = `${optionClassName}-active`;

export default formatterCollections({
  code: ['hiam.theme'],
})(
  memo((props) => {
    const {
      setThemeConfigInfo,
      colorCode,
      componentColor,
      componentCode,
      label,
      tempTheme,
      svg,
      saveComponentColorList,
    } = props;
    const defaultValue = useMemo(() => getDefaultValue(componentCode, colorCode), [colorCode]);
    const [customColor, setCustomColor] = useState(
      componentColor === colorCode || componentColor === defaultValue ? '' : componentColor
    );
    const containerRef = useRef({});
    // 为主题色时，同步主题色变化
    useEffect(() => {
      const { colorCode: tempNewCode, oldCode: tempOldCode } = tempTheme;
      if (tempNewCode && tempOldCode) {
        if (componentColor !== tempNewCode && componentColor !== customColor) {
          saveColor(tempNewCode);
        }
      } else if (
        componentColor !== customColor &&
        componentColor !== defaultValue &&
        componentColor !== colorCode
      ) {
        saveColor(colorCode);
      }
    }, [componentColor, colorCode, tempTheme]);

    const saveColor = (color) => {
      if (componentCode === 'navColor') {
        const current = {};
        current[componentCode] = color;
        setThemeConfigInfo((preState) => ({
          ...preState,
          ...current,
        }));
      } else {
        saveComponentColorList(componentCode, color);
      }
    };

    const onBeforeChange = useCallback((value) => {
      setCustomColor(value);
      saveColor(value);
      return value;
    }, []);

    const onMouseEnter = useCallback((e) => {
      if (e.currentTarget && e.currentTarget.parentNode) {
        const node = [...e.currentTarget.parentNode.getElementsByClassName(optionClassName)].slice(-1)[0];
        if (node && ![...node.classList].includes(optionActiveClassName)) {
          node.classList.add(optionActiveClassName);
        }
      }
    }, [containerRef]);

    const onMouseLeave = useCallback((e) => {
      if (e.currentTarget && e.currentTarget.parentNode) {
        const node = [...e.currentTarget.parentNode.getElementsByClassName(optionClassName)].slice(-1)[0];
        if (node && [...node.classList].includes(optionActiveClassName)) {
          node.classList.remove(optionActiveClassName);
        }
      }
    }, []);

    const renderPopupContent = useCallback(
      ({ content }) => {
        return (
          <div style={{ position: 'relative' }}>
            {content}
            <div onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
              <ColorPicker
                border={false}
                preset
                defaultValue={customColor}
                mode="button"
                className={styles['select-color-picker']}
                onBeforeChange={onBeforeChange}
                suffix={<Icon type="navigate_next" />}
                popupCls={styles['theme-col-popup']}
                renderer={() => (
                  <span className="custom-text">
                    {intl.get('hzero.common.date.cron.self').d('自定义')}
                  </span>
                )}
              />
            </div>
          </div>
        );
      },
      [customColor, componentColor]
    );
    const [tooltipHidden, setTooltipHidden] = useState(true);

    return (
      <div className={styles['select-color-container']}>
        <Tooltip
          placement="left"
          theme="light"
          onHiddenChange={setTooltipHidden}
          title={svg ? (
            <div className={styles["select-component"]}>
              <p>{label}</p>
              {!tooltipHidden && svg(componentColor)}
            </div>
          ) : null}
        >
          <Select
            name={componentCode}
            label={label}
            clearButton={false}
            defaultValue={defaultValue}
            value={componentColor}
            onChange={saveColor}
            className={styles['select-color-component']}
            ref={containerRef}
            popupContent={renderPopupContent}
            key={componentCode}
          >
            {componentCode === 'navColor' &&
              colorCode !== DEFAULT_BACKGROUND &&
              customColor !== DEFAULT_BACKGROUND ? (
                <Option value={DEFAULT_BACKGROUND} key={DEFAULT_BACKGROUND}>
                  <span
                    className={styles['option-color-block']}
                    style={{ backgroundColor: DEFAULT_BACKGROUND }}
                  />
                  {intl.get('hzero.common.status.default').d('默认')}
                </Option>
            ) : null}
            {componentCode === 'LINK' &&
              colorCode !== DEFAULT_LINK &&
              customColor !== DEFAULT_LINK ? (
                <Option value={DEFAULT_LINK} key={DEFAULT_LINK}>
                  <span
                    className={styles['option-color-block']}
                    style={{ backgroundColor: DEFAULT_LINK }}
                  />
                  {intl.get('hiam.theme.view.link.color.blue').d('蓝色')}
                </Option>
            ) : null}
            <Option value={colorCode} key={colorCode}>
              <span className={styles['option-color-block']} style={{ backgroundColor: colorCode }} />
              {intl.get('hiam.theme.view.title.config.theme.color').d('主题色')}
            </Option>
            <Option value={customColor} disabled={!customColor} key={customColor}>
              <span
                className={styles['option-color-block']}
                style={{ backgroundColor: customColor }}
              />
              {intl.get('hzero.common.date.cron.self').d('自定义')}
            </Option>
          </Select>
        </Tooltip>
      </div>
    );
  })
);
