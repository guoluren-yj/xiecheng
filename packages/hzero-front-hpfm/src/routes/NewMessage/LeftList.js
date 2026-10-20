import React, { useEffect, useState, useCallback, useImperativeHandle } from 'react';
import { TextField, Spin, Icon } from 'choerodon-ui/pro';
import { getResponse } from 'utils/utils';

import { getLeftList } from '@/services/messageService';
import intl from 'utils/intl';

import styles from './index.less';

const LeftList = (props) => {
  const { onModule, childRef } = props;
  const [state, setState] = useState({
    loading: false,
    list: [],
    moduleCode: '',
    allCount: 0,
    currentCount: 0,
    currentList: [],
  });
  useEffect(() => {
    queryList();
  }, []);

  // 查询左侧列
  const queryList = useCallback((value) => {
    setState((preState) => ({
      ...preState,
      loading: true,
    }));
    getLeftList(value)
      .then((res) => {
        const result = getResponse(res);
        if (result) {
          const listArr = result.filter((item) => item.issueModule);
          let count = 0;
          listArr.forEach((item) => {
            count += item.issueCount;
          });
          setState((preState) => ({
            ...preState,
            list: listArr,
            currentList: listArr,
            loading: false,
            allCount: count,
            currentCount: count,
          }));
        }
      })
      .catch(() => {
        setState((preState) => ({
          ...preState,
          loading: false,
        }));
      });
  }, []);

  const filterList = useCallback(
    (value) => {
      if (!value) {
        setState((preState) => ({
          ...preState,
          currentList: preState.list,
          currentCount: preState.allCount,
        }));
      } else {
        const newCurrentLsit = state.list.filter(
          (l) => l && l.issueModuleName && l.issueModuleName.includes(value)
        );
        const newCurrentCount = newCurrentLsit.reduce((a, b) => a + (b.issueCount || 0), 0);
        setState((preState) => ({
          ...preState,
          currentList: newCurrentLsit,
          currentCount: newCurrentCount,
        }));
      }
    },
    [state.list]
  );

  // 点击列表
  const handleClick = useCallback(
    (code) => {
      onModule(code);
      setState((preState) => ({ ...preState, moduleCode: code || '' }));
    },
    [state.list]
  );

  useImperativeHandle(
    childRef,
    () => ({
      queryList,
      moduleCode: state.moduleCode,
    }),
    [queryList, state.moduleCode]
  );

  return (
    <div className={styles['left-list']}>
      <TextField
        clearButton
        style={{ paddingRight: '0.16rem' }}
        prefix={<Icon type="search" style={{ fontSize: '0.14rem' }} />}
        placeholder={intl.get('hpfm.message.search.module.name').d('请输入模块名称进行检索')}
        onChange={filterList}
      />
      <Spin spinning={state.loading}>
        <div
          className={
            state.moduleCode === '' ? 'list-select left-list-content' : 'left-list-content'
          }
        >
          <div className="list-text" onClick={() => handleClick('')}>
            {intl.get('hzero.common.status.all').d('全部')}
          </div>
          <div className="list-count">{state.currentCount}</div>
        </div>
        {state.currentList.map((item) => (
          <div
            className={
              state.moduleCode === item.issueModule
                ? 'list-select left-list-content'
                : 'left-list-content'
            }
          >
            <div className="list-text" onClick={() => handleClick(item.issueModule)}>
              {item.issueModuleName}
            </div>
            <div className="list-count">{item.issueCount}</div>
          </div>
        ))}
      </Spin>
    </div>
  );
};

export default LeftList;
