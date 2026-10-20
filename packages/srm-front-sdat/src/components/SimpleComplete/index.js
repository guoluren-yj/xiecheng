/* eslint-disable react/no-danger */
/**
 * 基于 TextField 的自动填充组件
 * 接收 [{value: xxx, ...}] 类型的数据
 */
import React, { useState, useEffect, useRef } from 'react';
import { TextField } from 'choerodon-ui/pro'; // Spin
import classNames from 'classnames';
import { debounce } from 'lodash';

import useClickOutside from './hooks/useClickOutside';
import styles from './index.less';

let inputValue = '';

const AutoComplete = (props) => {
  const {
    value = '',
    primaryColor = '#36C2CF',
    fetchSuggestions,
    onSelect,
    onPromptSelect,
    onChange,
    renderOption,
    onKeyDownCallBack, // 键盘事件
    onFocusCallBack, // 获取焦点事件
    ...rest
  } = props;

  // 下拉框中的值 - 数据源
  const [suggestions, setSuggestions] = useState([]);
  // 下拉框中的原始值
  const [originalList, setOriginalList] = useState([]);
  // 展示下拉框
  const [showDropDown, setShowDropDown] = useState(false);

  const [hoverIndex, setHoverIndex] = useState(-1);

  const componentRef = useRef(null);

  useClickOutside(componentRef, () => {
    setShowDropDown(false);
  });

  useEffect(() => {
    return () => {
      inputValue = '';
    };
  }, []);

  useEffect(() => {
    inputValue = value;
  }, [value]);

  /**
   * 输入数据的回调
   */
  const handleChangeCallBack = (textValue) => {
    if (onChange && typeof onChange === 'function') {
      onChange(textValue);
    }
  };

  const hexToRgba = (hex, alpha = 0) => {
    if (!hex) return '';
    let r = 0;
    let g = 0;
    let b = 0;

    if (hex.length === 4) {
      r = `0x${hex[1]}${hex[1]}`;
      g = `0x${hex[2]}${hex[2]}`;
      b = `0x${hex[3]}${hex[3]}`;
    } else if (hex.length === 7) {
      r = `0x${hex[1]}${hex[2]}`;
      g = `0x${hex[3]}${hex[3]}`;
      b = `0x${hex[5]}${hex[6]}`;
    }

    return `rgba(${+r}, ${+g}, ${+b}, ${alpha})`;
  };

  /**
   * 匹配到的字符 高亮
   */
  const handleSetList = (dataArr = []) => {
    const originalArr = dataArr.map((item, index) => {
      return {
        _id: `_${index}`,
        ...item,
      };
    });

    setOriginalList(originalArr);
    const list = originalArr.map((item) => {
      return {
        ...item,
        value:
          item.value && inputValue
            ? item.value
                .toString()
                .replaceAll(
                  inputValue,
                  `<span style='color: ${primaryColor};'>${inputValue}</span>`
                )
            : '',
      };
    });

    setSuggestions(list);
  };

  /**
   * 通过选到的 item 获取原始值
   * @param {record} record
   */
  const getOriginalValue = (record = {}) => {
    let rtnObj = {};
    if (originalList.length) {
      originalList.forEach((item) => {
        if (record._id && item._id === record._id) {
          rtnObj = item;
        }
      });
    }
    return rtnObj;
  };

  /**
   * 输入值，查询提示项
   * @param e
   */
  const handleChange = (e) => {
    const strVal = e?.target?.value?.trim() ?? '';
    // setInputValue(strVal);
    inputValue = strVal;
    handleChangeCallBack(strVal);

    handleQueryList(strVal);
  };

  /**
   * 选择提示项，赋值，并清空列表 隐藏dropdown
   * @param item
   */
  const handleSelected = (item) => {
    // setInputValue(getOriginalValue(item)?.value ?? '');
    inputValue = getOriginalValue(item)?.value ?? '';
    setSuggestions([]); // 选择数据后清空列表
    setShowDropDown(false);
    if (onSelect && typeof onSelect === 'function') {
      onSelect(getOriginalValue(item));
    }
    handleChangeCallBack(getOriginalValue(item)?.value ?? '');
  };

  /**
   * 自定义展示模板
   * @param item
   * @returns
   */
  const renderTemp = (item) => {
    return renderOption ? (
      renderOption(getOriginalValue(item))
    ) : (
      <>
        <div style={{ display: 'inline-block' }} dangerouslySetInnerHTML={{ __html: item.value }} />
      </>
    );
  };

  /**
   * 自动补全 dropDown 下拉列表
   * @returns
   */
  const renderDropdown = () => {
    return (
      <ul className={styles['dropdown-ul']} onMouseLeave={() => setHoverIndex(-1)}>
        {suggestions.map((item, index) => {
          const classes = classNames(
            styles['dropdown-li']
            // index === hoverIndex ? styles['is-hover'] : ''
          );
          return (
            <li
              className={classes}
              key={index.toString()}
              onClick={() => handleSelected(item)}
              onMouseEnter={() => setHoverIndex(index)}
              style={{ background: index === hoverIndex ? hexToRgba(primaryColor, 0.1) : '' }}
            >
              {renderTemp(item)}
            </li>
          );
        })}
      </ul>
    );
  };

  const handleKeyDown = (e) => {
    switch (e.keyCode) {
      case 13:
        handleQueryList();
        break;

      default:
        break;
    }

    if (onKeyDownCallBack && typeof onKeyDownCallBack === 'function') {
      onKeyDownCallBack(e);
    }
  };

  const handleFocus = () => {
    setShowDropDown(true);
  };

  const handleQueryList = React.useCallback(
    debounce((str) => {
      setSuggestions([]);

      const results = fetchSuggestions(str);

      // 判断是否异步调用，异步需返回数组列表
      if (results && results instanceof Promise) {
        results.then((data) => {
          handleSetList(data);
          if (data && data?.length > 0) {
            setShowDropDown(true);
          }
        });
      } else {
        handleSetList(results);
        setShowDropDown(true);
      }
    }, 1000),
    []
  );

  return (
    <div>
      <div className={styles['auto-complete']} ref={componentRef}>
        <TextField
          style={{ height: '30px', width: '100%' }}
          value={inputValue}
          onInput={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          {...rest}
        />
        {showDropDown ? renderDropdown() : null}
      </div>
    </div>
  );
};

export default AutoComplete;
