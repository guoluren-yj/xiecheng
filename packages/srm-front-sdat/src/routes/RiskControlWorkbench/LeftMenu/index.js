/* eslint-disable no-param-reassign */
import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import intl from 'utils/intl';
// import uuid from 'uuid/v4';
import { Collapse } from 'choerodon-ui';
import { CheckBox, Icon } from 'choerodon-ui/pro';

import styles from './index.less';

const { Panel } = Collapse;

const LeftMenu = forwardRef((props, ref) => {
  const { statusList = [], levelList = [], eventList = [], onChangeFilter = () => {} } = props;

  const [cacheStatusList, setCacheStatus] = useState([]);
  const [cacheLevelList, setCacheLevel] = useState([]);
  const [eventTree, setEventTree] = useState([]);
  const [cacheCodeList, setCacheCode] = useState([]);
  const [defaultOpens, setDefaultOpens] = useState([]);

  const [refresh, setRefresh] = useState(false);

  // 初始化 默认选中除已关闭外的所有数据
  useEffect(() => {
    if (statusList.length && levelList.length) {
      const statusArr = [];
      const levelArr = [];
      const defaultCheck = [];
      let defaultOpen = [];

      const arr = [...eventList];

      if (statusList.length) {
        statusList.forEach((item) => {
          if (item.value !== 'FINISH') {
            statusArr.push(item.value);
          }
        });
      }

      if (levelList.length) {
        levelList.forEach((item) => {
          levelArr.push(item.value);
        });
      }

      const loopTree = (data = []) => {
        data.forEach((item) => {
          item.checked = true;
          if (item.childList && item.childList.length) {
            loopTree(item.childList);
          } else {
            defaultCheck.push(item.themeCode);
          }
        });
      };

      if (arr && arr.length) {
        defaultOpen = arr.map((item) => item.themeCode);
        loopTree(arr);
      }

      onChangeFilter({
        statusList: [...new Set(statusArr)],
        levelList: [...new Set(levelArr)],
        codeList: [...new Set(defaultCheck)],
      });

      // 缓存
      setDefaultOpens(defaultOpen);
      setCacheLevel([...new Set(levelArr)]);
      setCacheStatus([...new Set(statusArr)]);
      setCacheCode([...new Set(defaultCheck)]);
      setEventTree(arr);
    }
  }, [statusList, levelList, eventList]);

  useEffect(() => {
    if (refresh) {
      setRefresh(true);
    }
  }, [refresh]);

  /**
   * 选择风险状态
   * @param {*} e
   * @param {*} value
   */
  const handleChange = (e, value) => {
    const arr = [...cacheStatusList];
    if (e) arr.push(value);
    if (!e) {
      const index = arr.indexOf(value);
      if (index >= 0) {
        arr.splice(index, 1);
      }
    }

    onChangeFilter({
      statusList: [...new Set(arr)],
      levelList: [...new Set(cacheLevelList)],
      codeList: [...new Set(cacheCodeList)],
    });
    setCacheStatus([...new Set(arr)]);
  };

  /**
   * 选择风险等级
   * @param {*} e
   * @param {*} value
   */
  const handleChangeLevel = (e, value) => {
    const arr = [...cacheLevelList];
    if (e) arr.push(value);
    if (!e) {
      const index = arr.indexOf(value);
      if (index >= 0) {
        arr.splice(index, 1);
      }
    }

    onChangeFilter({
      statusList: [...new Set(cacheStatusList)],
      levelList: [...new Set(arr)],
      codeList: [...new Set(cacheCodeList)],
    });
    setCacheLevel([...new Set(arr)]);
  };

  /**
   * 切换事件选择
   * @param {*} e
   * @param {*} code
   */
  const handleChangeEvent = (e, codeStr = '') => {
    const cacheCodes = [...cacheCodeList];
    const arr = [...eventTree];

    // 修改下层级的所有数据
    const changeTree = (data = [], check) => {
      data.forEach((item) => {
        item.checked = !!check;

        if (check && (!item.childList || !item.childList.length)) cacheCodes.push(item.themeCode);
        if (!check && (!item.childList || !item.childList.length)) {
          const index = cacheCodes.indexOf(item.themeCode);
          if (index >= 0) {
            cacheCodes.splice(index, 1);
          }
        }

        if (item.childList && item.childList.length) {
          changeTree(item.childList);
        }
      });
    };

    // 找到选择的数据 更改状态
    const loopTree = (list, check, code) => {
      list.forEach((item) => {
        if (item.themeCode === code) {
          item.checked = !!check; // 改变当前数据选择状态

          if (check && (!item.childList || !item.childList.length)) cacheCodes.push(item.themeCode);
          if (!check && (!item.childList || !item.childList.length)) {
            const index = cacheCodes.indexOf(item.themeCode);
            if (index >= 0) {
              cacheCodes.splice(index, 1);
            }
          }

          if (item.parentThemeId) {
            changeParent(arr, item.parentThemeId, check);
          }

          // 如果是中间级的数据 需修改下层级的所有数据
          if (item.childList && item.childList.length) {
            changeTree(item.childList, check);
          }
        } else if (item.childList && item.childList.length) {
          loopTree(item.childList, check, code);
        }
      });
    };

    // 改变父级数据
    const changeParent = (list, parentId, check) => {
      if (list && list.length) {
        list.forEach((item) => {
          if (item.themeId === parentId) {
            item.checked = check;
          } else if (item.childList && item.childList.length) {
            changeParent(item.childList, parentId, check);
          }
        });
      }
    };

    const changeStatus = (list) => {
      list.forEach((item) => {
        // 判断当前节点的下一级 是否都选中
        if (item.childList && item.childList.length) {
          const checkedList = item.childList.filter((item2) => item2.checked); // 选中的列表

          if (checkedList.length) {
            if (checkedList.length === item.childList.length) {
              // 全部选中
              item.checked = true;
              item.indeterminate = false;
            } else {
              item.checked = false;
              item.indeterminate = true;
            }
          } else {
            item.checked = false;
            item.indeterminate = false;
          }

          // 递归遍历下级数据
          changeStatus(item.childList);
        }
      });
    };

    if (arr.length) {
      // 修改状态
      loopTree(arr, e, codeStr);
      changeStatus(arr);
    }

    onChangeFilter({
      statusList: [...new Set(cacheStatusList)],
      levelList: [...new Set(cacheLevelList)],
      codeList: [...new Set(cacheCodes)],
    });

    setCacheCode([...new Set(cacheCodes)]);
    setEventTree(arr);
  };

  /**
   * 绘制状态选择列表
   */
  const drawStatusList = (list) => {
    return (list || []).map((item) => {
      return (
        <div key={item.value} style={{ color: '#1D2129', margin: '16px 0' }}>
          <CheckBox
            onChange={(e) => handleChange(e, item.value)}
            checked={cacheStatusList.indexOf(item.value) !== -1}
          >
            {item.meaning}
          </CheckBox>
        </div>
      );
    });
  };

  /**
   * 绘制等级选择列表
   */
  const drawLevelList = (list) => {
    return (list || []).map((item) => {
      return (
        <div key={item.value} style={{ color: '#1D2129', margin: '16px 0' }}>
          <CheckBox
            onChange={(e) => handleChangeLevel(e, item.value)}
            checked={cacheLevelList.indexOf(item.value) !== -1}
          >
            {item.meaning}
          </CheckBox>
        </div>
      );
    });
  };

  /**
   * 绘制风险类型
   * @param {*} list
   * @returns
   */
  const drawEventTree = (list) => {
    return (list || []).map((item) => {
      return (
        <Panel
          header={
            <span>
              <CheckBox
                indeterminate={item.indeterminate}
                checked={item.checked}
                onChange={(e) => handleChangeEvent(e, item.themeCode)}
              >
                {item.themeName}
              </CheckBox>
            </span>
          }
          key={item.themeCode}
        >
          {item.childList && item.childList.length ? drawSubTree(item.childList) : null}
        </Panel>
      );
    });
  };

  /**
   * 次级风险类型
   * @param {*} list
   */
  const drawSubTree = (list) => {
    return (list || []).map((item) => {
      if (item.childList && item.childList.length) {
        return (
          <Collapse
            key={item.id}
            defaultActiveKey={[]}
            trigger="icon"
            expandIconPosition="right"
            expandIcon={() => <Icon type="expand_more" />}
            ghost
            style={{ marginTop: '20px' }}
          >
            {drawEventTree([item])}
          </Collapse>
        );
      } else {
        return (
          <div key={item.themeCode} style={{ padding: '8px 0' }}>
            {/* <Tooltip title={item.themeName}> */}
            <CheckBox onChange={(e) => handleChangeEvent(e, item.themeCode)} checked={item.checked}>
              <span className={styles['menu-item-panel']}>{item.themeName}</span>
            </CheckBox>
            {/* </Tooltip> */}
          </div>
        );
      }
    });
  };

  useImperativeHandle(ref, () => ({
    resetFilter: () => resetFilter(),
  }));

  const resetFilter = () => {
    setCacheStatus(['PENDING', 'HANDLING']);
    onChangeFilter({
      statusList: ['PENDING', 'HANDLING'],
      levelList: [...new Set(cacheLevelList)],
      codeList: [...new Set(cacheCodeList)],
    });
  };

  const handleToggle = (e) => {
    setDefaultOpens(e);
  };

  return (
    <div ref={ref} className={styles['risk-control-left-menu']}>
      <div className={styles['risk-control-menu-card']}>
        <div className={styles['risk-control-menu-title']}>
          {intl.get('sdat.riskControl.view.title.riskStatus').d('风险状态')}
        </div>
        {drawStatusList(statusList)}
      </div>

      <div className={styles['risk-control-menu-card']} style={{ marginTop: '32px' }}>
        <div className={styles['risk-control-menu-title']}>
          {intl.get('sdat.riskControl.view.title.riskLevelDistribution').d('风险级别')}
        </div>
        {drawLevelList(levelList)}
      </div>

      <div className={styles['risk-control-menu-card']} style={{ marginTop: '32px' }}>
        <div className={styles['risk-control-menu-title']}>
          {intl.get('sdat.riskControl.view.title.riskType').d('风险类型')}
        </div>
        <div className={styles['risk-control-menu-collapse']}>
          <Collapse
            activeKey={[...defaultOpens]}
            trigger="icon"
            onChange={handleToggle}
            expandIconPosition="right"
            expandIcon={() => <Icon type="expand_more" />}
            ghost
          >
            {drawEventTree(eventTree)}
          </Collapse>
        </div>
      </div>
    </div>
  );
});

export default LeftMenu;
