/* eslint-disable react/no-danger */
/**
 * 基于 TextField 的自动填充组件
 * 接收 [{value: xxx, ...}] 类型的数据
 */
import React, { useState, useEffect, useRef } from 'react';
import intl from 'utils/intl';
import { TextField } from 'choerodon-ui/pro'; // Spin
import classNames from 'classnames';
import useDebounce from './hooks/useDebounce';
import useClickOutside from './hooks/useClickOutside';
import './index.less';

const AutoComplete = (props) => {
  const {
    width = 200,
    value = '',
    fetchSuggestions,
    onSelect,
    onPromptSelect,
    onChange,
    renderOption,
    promptList = [], // 提示列表 接收 {value: 'xxx', key: 'xxx'} 的形式
    onKeyDownCallBack, // 键盘事件
    onFocusCallBack, // 获取焦点事件
    ...rest
  } = props;

  // 文本框的值
  const [inputValue, setInputValue] = useState('');
  // 下拉框中的值 - 数据源
  const [suggestions, setSuggestions] = useState([]);
  // 下拉框中的原始值
  const [originalList, setOriginalList] = useState([]);
  // 展示下拉框
  const [showDropDown, setShowDropDown] = useState(false);
  // 高亮的条目
  const [highlightIndex, setHighlightIndex] = useState(-1);

  // 控制选择数据后重复打开 dropDown
  const triggerSearch = useRef(false);
  const componentRef = useRef(null);

  // 使用 hooks 组件进行防抖
  const debouncedValue = useDebounce(inputValue, 200);
  useClickOutside(componentRef, () => {
    // setSuggestions([]);
    setShowDropDown(false);
  });

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    if (triggerSearch.current) {
      setSuggestions([]);
      const results = fetchSuggestions(debouncedValue);
      // 判断是否异步调用，异步需返回数组列表
      if (results instanceof Promise) {
        results.then((data) => {
          handleSetList(data);
          if (data.length > 0) {
            setShowDropDown(true);
          }
        });
      } else {
        handleSetList(results);
        setShowDropDown(true);
      }
    } else {
      setShowDropDown(false);
    }
    setHighlightIndex(-1);
  }, [debouncedValue, fetchSuggestions]);

  /**
   * 输入数据的回调
   */
  const handleChangeCallBack = (textValue) => {
    if (onChange && typeof onChange === 'function') {
      onChange(textValue);
    }
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
                .replaceAll(inputValue, `<span style='color: #36C2CF;'>${inputValue}</span>`)
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
    setInputValue(strVal);
    triggerSearch.current = true;
    handleChangeCallBack(strVal);
  };

  /**
   * 选择提示项，赋值，并清空列表 隐藏dropdown
   * @param item
   */
  const handleSelected = (item) => {
    setInputValue(getOriginalValue(item)?.value ?? '');
    setSuggestions([]); // 选择数据后清空列表
    setShowDropDown(false);
    if (onSelect && typeof onSelect === 'function') {
      onSelect(getOriginalValue(item));
    }
    handleChangeCallBack(getOriginalValue(item)?.value ?? '');
    triggerSearch.current = false;
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
        <span
          style={{
            display: 'inline-block',
            color: 'rgba(0,0,0,0.25)',
            float: 'right',
            marginRight: '32px',
          }}
        >
          {intl.get('spfm.wideArea.view.about.count', {
            name: item.count,
          })}
        </span>
      </>
    );
  };

  /**
   * 自动补全 dropDown 下拉列表
   * @returns
   */
  const renderDropdown = () => {
    return (
      <ul style={{ width: `${width}px` }} className="dropdown-ul">
        {suggestions.map((item, index) => {
          const classes = classNames('dropdown-li', {
            'is-active': index === highlightIndex,
          });
          return (
            <li className={classes} key={index.toString()} onClick={() => handleSelected(item)}>
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
        setShowDropDown(false);
        break;

      default:
        break;
    }

    if (onKeyDownCallBack && typeof onKeyDownCallBack === 'function') {
      onKeyDownCallBack(e);
    }
  };

  const handleFocus = (e) => {
    setInputValue(value);
    if (onFocusCallBack && typeof onFocusCallBack === 'function') {
      onFocusCallBack(e, inputValue);
    }
    setShowDropDown(true);
  };

  /**
   * 选择提示项
   * @param {*} item
   */
  const handleSetLabel = (item) => {
    setInputValue(item.value);
    handleChangeCallBack(item.value);

    if (onPromptSelect && typeof onPromptSelect === 'function') {
      onPromptSelect(item);
    }
  };

  /**
   * 渲染提示信息 列表
   * @param {array} dataList
   * @returns
   */
  const drawSearchLabel = (dataList = []) => {
    const labelList = dataList.map((item) => {
      return (
        <span
          onClick={() => handleSetLabel(item)}
          style={{ display: 'inline-block' }}
          key={item.key}
        >
          {item.value}
        </span>
      );
    });

    return labelList;
  };

  return (
    <div className="auto-complete" ref={componentRef}>
      <TextField
        style={{ width: `${width}px` }}
        value={inputValue}
        onInput={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        {...rest}
      />
      {showDropDown ? renderDropdown() : null}
      {promptList.length && (
        <div className="auto-complete-labels">{drawSearchLabel(promptList)}</div>
      )}
    </div>
  );
};

export default AutoComplete;
