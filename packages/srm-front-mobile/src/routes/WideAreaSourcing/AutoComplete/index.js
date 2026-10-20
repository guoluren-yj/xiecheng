/* eslint-disable react/no-danger */
/**
 * 基于 TextField 的自动填充组件
 */
import React, { useState, useEffect, useRef } from 'react';
import intl from 'utils/intl';
import { TextField } from 'choerodon-ui/pro'; // Spin
import classNames from 'classnames';
// import useDebounce from './hooks/useDebounce';
import useClickOutside from './hooks/useClickOutside';
import './index.less';

const AutoComplete = (props) => {
  const {
    width = 80,
    value = '',
    fetchSuggestions,
    onSelect,
    onChange = () => {},
    historyWord = [],
    updateHistoryWord = () => {},
    onFocusCallBack, // 获取焦点事件
    ...rest
  } = props;

  // 文本框的值
  const [inputValue, setInputValue] = useState('');
  // 下拉框中的值 - 数据源
  const [suggestions, setSuggestions] = useState([]);
  // 展示下拉框
  const [showDropDown, setShowDropDown] = useState(false);
  // 高亮的条目
  // eslint-disable-next-line no-unused-vars
  const [highlightIndex, setHighlightIndex] = useState(-1);

  // 控制选择数据后重复打开 dropDown
  const triggerSearch = useRef(false);
  const componentRef = useRef(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useClickOutside(componentRef, () => {
    setShowDropDown(false);
  });

  // 使用 hooks 组件进行防抖
  // const debouncedValue = useDebounce(inputValue, 200);
  // useEffect(() => {
  //   if (triggerSearch.current) {
  //     setSuggestions([]);
  //     const results = fetchSuggestions(debouncedValue);
  //     if (results instanceof Promise) {
  //       results.then((data) => {
  //         handleSetList(data);
  //         if (data.length > 0) {
  //           setShowDropDown(true);
  //         }
  //       });
  //     } else {
  //       handleSetList(results);
  //       setShowDropDown(true);
  //     }
  //   } else {
  //     setShowDropDown(false);
  //   }
  //   setHighlightIndex(-1);
  // }, [debouncedValue, fetchSuggestions]);

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
  // const handleSetList = (dataArr = []) => {
  //   const list = dataArr.map((item) => {
  //     return {
  //       ...item,
  //       itemName: item.item_name.replace(
  //         new RegExp(inputValue, 'g'),
  //         `<span style="color: #36C2CF">${inputValue}</span>`
  //       ),
  //     };
  //   });
  //   setSuggestions(list);
  // };

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
    setInputValue(item?.item_name ?? item);
    setSuggestions([]); // 选择数据后清空列表
    setShowDropDown(false);
    if (onSelect && typeof onSelect === 'function') {
      onSelect(item);
    }
    handleChangeCallBack(item?.item_name ?? '');
    triggerSearch.current = false;
  };

  /**
   * 自定义展示模板
   * @param item
   * @returns
   */
  const renderTemp = (item, index) => {
    return inputValue ? (
      <div
        style={{ display: 'inline-block' }}
        dangerouslySetInnerHTML={{ __html: item.itemName }}
      />
    ) : (
      <>
        <div style={{ display: 'inline-block' }} dangerouslySetInnerHTML={{ __html: item }} />
        <span className="history-delete-icon" onClick={(e) => updateHistoryWord(item, index, e)}>
          {/* {intl.get('smbl.wideAreaSourcing.view.about.count', {
              name: item.count,
            })} */}
          {intl.get('hzero.common.button.delete').d('删除')}
        </span>
      </>
    );
  };

  /**
   * 自动补全 dropDown 下拉列表
   * @returns
   */
  const renderDropdown = () => {
    const selectData = inputValue ? suggestions : historyWord;
    return (
      <div style={{ width: `${width}vw`, maxWidth: '860px' }} className="dropdown-ul">
        {!inputValue && !!historyWord.length && (
          <div className="history-search-tit">
            {intl.get('smbl.wideAreaSourcing.button.history.search').d('历史搜索')}
            <span className="history-clear" onClick={() => updateHistoryWord()}>
              {intl.get('smbl.wideAreaSourcing.button.history.clear').d('清空')}
            </span>
          </div>
        )}
        {selectData.map((item, index) => {
          const classes = classNames('dropdown-li', {
            'is-active': index === highlightIndex,
          });
          return (
            <div className={classes} key={index.toString()} onClick={() => handleSelected(item)}>
              {renderTemp(item, index)}
            </div>
          );
        })}
      </div>
    );
  };

  const handleKeyDown = (e) => {
    switch (e.keyCode) {
      case 13:
        enterKeyCallback();
        break;

      default:
        break;
    }
  };

  const handleFocus = (e) => {
    if (onFocusCallBack && typeof onFocusCallBack === 'function') {
      onFocusCallBack(e, inputValue);
    }
    setShowDropDown(true);
  };

  /**
   * 回车查询
   */
  const enterKeyCallback = () => {
    setShowDropDown(false);
    onSelect(inputValue);
  };

  return (
    <div className="auto-complete" ref={componentRef}>
      <TextField
        style={{ width: `${width}vw`, maxWidth: '860px' }}
        value={inputValue}
        onInput={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        {...rest}
      />
      {showDropDown ? renderDropdown() : null}
    </div>
  );
};

export default AutoComplete;
