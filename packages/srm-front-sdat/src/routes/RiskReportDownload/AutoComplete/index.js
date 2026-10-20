/* eslint-disable no-param-reassign */
/* eslint-disable react/no-danger */
/**
 * 基于 TextField 的自动填充组件
 * 接收 [{value: xxx, ...}] 类型的数据
 */
import React, { useState, useEffect, useRef } from 'react';
import intl from 'utils/intl';
import { TextField, Button } from 'choerodon-ui/pro'; // Spin
import { Icon, notification } from 'choerodon-ui';
import { getCurrentUser } from 'utils/utils';
import classNames from 'classnames';
// import notification from 'utils/notification';
import { fetGenerateReport } from '@/services/riskScan/reportDownloadService';

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

  const [showHistoryPanel, setShowHistoryPanel] = useState(false);

  // 控制选择数据后重复打开 dropDown
  // const triggerSearch = useRef(false);
  const componentRef = useRef(null);

  // 使用 hooks 组件进行防抖
  useClickOutside(componentRef, () => {
    setShowDropDown(false);
    setShowHistoryPanel(false);
  });

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  /**
   * 本地缓存添加历史记录
   * @param {*} item
   */
  const setLocalStore = (item) => {
    const localStore = localStorage.getItem('riskReportDownQueryHis') ?? '';
    let hisList = localStore ? JSON.parse(localStore) : [];

    if (hisList.length === 0) {
      hisList.push({
        ...item,
        _sort: 1,
      });
    } else {
      const sortArr = hisList.map((obj) => obj._sort);
      const maxSort = Math.max(...sortArr);
      const minSort = Math.min(...sortArr);

      const repeat = hisList.filter((obj) => obj.itemName === item.itemName);

      // 存在重复的数据，直接改变 _sort 值为最大值，即最新记录
      if (repeat && repeat.length) {
        hisList.forEach((rcd) => {
          if (rcd.itemName === item.itemName) {
            rcd._sort = maxSort + 1;
          }
        });
      } else if (hisList.length > 0 && hisList.length < 5) {
        // 新增数据
        hisList.push({
          ...item,
          _sort: maxSort + 1,
        });
      } else {
        const filterArr = hisList.filter((obj) => obj._sort !== minSort);
        filterArr.push({
          ...item,
          _sort: maxSort + 1,
        });
        hisList = [...filterArr];
      }
    }

    const saveList = hisList.map((rcd) => {
      return {
        itemName: rcd.itemName,
        _sort: rcd._sort,
      };
    });

    localStorage.setItem('riskReportDownQueryHis', JSON.stringify(saveList));
  };

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
        itemName: item.value,
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
    setShowHistoryPanel(false);
    if (onSelect && typeof onSelect === 'function') {
      onSelect(getOriginalValue(item));
    }
    handleChangeCallBack(getOriginalValue(item)?.value ?? '');
  };

  /**
   * 生成报告
   * @param {*} item
   * @param {*} type
   */
  const handleGenerate = (e, item, type = '') => {
    e.stopPropagation();
    e.preventDefault();

    setLocalStore(item); // 存储历史

    // 生成报告
    fetGenerateReport({
      searchKey: item?.itemName,
      reportType: type,
      userId: getCurrentUser()?.id ?? '',
      userName: getCurrentUser()?.realName ?? '',
    }).then((res) => {
      if (res?.orderNo) {
        setShowDropDown(false);
        setShowHistoryPanel(false);
        setLocalStore(item); // 存储历史
        notification.open({
          message: intl.get('sdat.riskScanReport.view.message.exportIng').d('正在后台执行导出'),
          description: intl
            .get('sdat.riskScanReport.view.message.exportMessage')
            .d('您的报告正在生成中，稍后可以到【风险报告查询】页面查看'),
          icon: <Icon type="download_for_offline" />,
        });
      } else {
        notification.error({
          message: res?.message ?? res?.msg ?? '',
        });
      }
    });
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
        <div>
          <a onClick={(e) => handleGenerate(e, item, 'DILIGENCE')} style={{ marginRight: '16px' }}>
            {intl.get('sdat.reportDownload.view.btn.generateReport').d('生成尽职调查报告')}
          </a>
          <a onClick={(e) => handleGenerate(e, item, 'DECISION')}>
            {intl.get('sdat.reportDownload.view.btn.generateCreditReport').d('生成信用决策报告')}
          </a>
        </div>
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

  const renderHisTemp = (item) => {
    return renderOption ? (
      renderOption(getOriginalValue(item))
    ) : (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Icon style={{ fontSize: '14px', color: '#868D9C' }} type="history_toggle_off" />
        <div
          style={{ display: 'inline-block', marginLeft: '8px', color: '#868D9C' }}
          dangerouslySetInnerHTML={{ __html: item.itemName }}
        />
      </div>
    );
  };

  /**
   * 选择历史列表
   */
  const handleSelectHistory = (item) => {
    setInputValue(item?.itemName ?? '');
    handleChangeCallBack(item?.itemName ?? '');
    setShowHistoryPanel(false);
  };

  const renderHistoryPanel = () => {
    const hisStore = localStorage?.getItem('riskReportDownQueryHis') ?? '';
    const hisList = hisStore ? JSON.parse(hisStore) : [];

    const sortList = hisList.sort((a, b) => b._sort - a._sort);

    return sortList.length ? (
      <ul style={{ width: `${width}px` }} className="dropdown-ul">
        {sortList.map((item) => {
          const classes = classNames('dropdown-li');
          return (
            <li className={classes} key={item.itemName} onClick={() => handleSelectHistory(item)}>
              {renderHisTemp(item)}
            </li>
          );
        })}
      </ul>
    ) : null;
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
    // 文本框没值，且查询列表没值，展示历史列表
    if (!inputValue) {
      setShowHistoryPanel(true);
      setShowDropDown(false);
    }
  };

  const handleQueryList = () => {
    setSuggestions([]);
    const results = fetchSuggestions();

    // 判断是否异步调用，异步需返回数组列表
    if (results instanceof Promise) {
      results.then((data) => {
        handleSetList(data || []);
        if (data.length > 0) {
          setShowHistoryPanel(false);
          setShowDropDown(true);
        }
      });
    } else {
      handleSetList(results);
      setShowDropDown(true);
      setShowHistoryPanel(false);
    }
    setHighlightIndex(-1);
  };

  return (
    <div>
      <div className="auto-complete" ref={componentRef}>
        <TextField
          style={{ width: `${width}px`, height: '48px' }}
          value={inputValue}
          onInput={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          {...rest}
        />
        {showDropDown ? renderDropdown() : null}
        {showHistoryPanel ? renderHistoryPanel() : null}
      </div>
      <Button color="primary" onClick={handleQueryList}>
        {intl.get('hzero.common.button.query').d('查询')}
      </Button>
    </div>
  );
};

export default AutoComplete;
