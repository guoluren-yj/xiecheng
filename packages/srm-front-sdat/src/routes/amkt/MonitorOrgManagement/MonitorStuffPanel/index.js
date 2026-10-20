/**
 * MonitorStuffPanel：监控员工
 * @date: 2022-09-13
 * @author: Zip <zepeng.huang@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2022, Hand
 */

import React, { useState, useEffect, useRef } from 'react';
import { TextField, Spin } from 'choerodon-ui/pro';
import { Icon, Result } from 'choerodon-ui';
import intl from 'utils/intl';
import classNames from 'classnames';
import MonitorDetail from './MonitorDetail';

import style from './index.less';

// const { Item } = Menu;
let searchKeyWord = ''; // 搜索关键字
let isQuery = false; // 查询时起防抖作用的变量

export default function MonitorStuffPanel(props = {}) {
  const {
    stuffListDs,
    defaultItem = null,
    setDs = () => {},
    setSelectStuff = () => {},
    onSelectedItem = () => {},
  } = props;

  const [selectRecord, setSelectRecord] = useState(null);
  const [dataList, setDataList] = useState([]);
  const [error, setError] = useState(false); // 标识查询过程是否出错

  const scrollBoxRef = useRef();
  const textRef = useRef();
  const listBoxRef = useRef();

  useEffect(() => {
    stuffListDs
      .query()
      .then((res) => {
        setError(false);
        setDataList(res?.content ?? []); // dataList变化会触发另一个副作用
        setSelectRecord(res && res.content && res.content.length ? res.content[0] : null);
        onSelectedItem(res && res.content && res.content.length ? res.content[0] : null);
      })
      .catch(() => {
        setError(true); // 出错则置true对应的值
      });
  }, []);

  useEffect(() => {
    if (defaultItem) {
      stuffListDs
        .query()
        .then((res) => {
          setError(false);
          setDataList(res?.content ?? []); // dataList变化会触发另一个副作用
          setSelectRecord(defaultItem);
          onSelectedItem(defaultItem);
          setSelectStuff(true);
        })
        .catch(() => {
          setError(true); // 出错则置true对应的值
        });
    }
  }, [defaultItem]);

  useEffect(() => {
    // 初始化检查是否存在滚动条
    if (
      textRef &&
      textRef.current &&
      textRef.current.clientHeight + listBoxRef.current.clientHeight <
        scrollBoxRef.current.clientHeight
    ) {
      initQueryMore();
    }
  }, [dataList]);

  /**
   * initQueryMore 第一次查询后的逻辑
   * @returns
   */
  const initQueryMore = () => {
    if (stuffListDs.currentPage >= stuffListDs.totalPage) return;
    stuffListDs.queryMore(stuffListDs.currentPage + 1).then((res) => {
      if (res && res?.content) {
        const newDataList = dataList.concat(res?.content ?? []);
        setDataList(newDataList); // dataList变化会触发另一个副作用，相当于递归
      }
    });
  };

  const handleSelect = (recordObj) => {
    setSelectStuff(true);
    setSelectRecord(recordObj);
    onSelectedItem(recordObj);
  };

  const handleSearch = () => {
    stuffListDs.setQueryParameter('userName', searchKeyWord);
    stuffListDs.query().then((res) => {
      setDataList(res?.content ?? []); // dataList变化会触发另一个副作用
    });
  };

  const handleScroll = (e) => {
    if (stuffListDs.currentPage >= stuffListDs.totalPage) return;
    const { scrollHeight, clientHeight, scrollTop } = e.target;
    // 如果滚动到底部
    if (scrollHeight - scrollTop - clientHeight < clientHeight / 10 && !isQuery) {
      isQuery = true;
      stuffListDs
        .queryMore(stuffListDs.currentPage + 1)
        .then((res) => {
          if (res && res?.content) {
            const newDataList = dataList.concat(res?.content ?? []);
            setDataList(newDataList);
          }
        })
        .finally(() => {
          isQuery = false;
        });
    }
  };

  return (
    <div className={style['out-box']}>
      <div className={style['left-panel']} ref={scrollBoxRef} onScroll={handleScroll}>
        <div ref={textRef} className={style['text-box']}>
          <TextField
            clearButton
            className={style['query-bar']}
            suffix={<Icon type="search" />}
            placeholder={intl
              .get('sdat.monitorOrgManagement.monitorStuff.placeholder.pleaseTypeAccountCodeOrName')
              .d('请输入账户编码、监控人名称查询')}
            value={searchKeyWord}
            onInput={(e) => {
              searchKeyWord = e?.target?.value?.trim() ?? '';
            }}
            onClear={() => {
              searchKeyWord = '';
              handleSearch();
            }}
            onEnterDown={() => handleSearch()}
          />
        </div>
        <div ref={listBoxRef} className={style['scroll-code-box']}>
          {(dataList?.length ?? 0) === 0 && (
            <Result
              className={style['no-data-result']}
              icon={<Icon className={style['no-data-icon']} />}
              title={
                <span>
                  {intl.get('sdat.monitorOrgManagement.view.notification.noData').d('暂无查询结果')}
                </span>
              }
            />
          )}
          <div style={{ border: 'transparent 0px solid' }}>
            {dataList.map((item) => {
              const { userName = '', loginName = '', userId } = item || {};

              const classes =
                String(selectRecord?.userId) === String(userId)
                  ? style['menu-item-choose']
                  : style['menu-item'];
              return (
                <div
                  key={userId}
                  onClick={() => handleSelect(item)}
                  className={classNames(style['user-menu-item'], classes)}
                >
                  {userName}
                  &nbsp;&nbsp;&nbsp;&nbsp;
                  {loginName}
                  {/* <span className={style['span-name']}>{userName}</span>
                  <span className={style['span-code']}>{loginName}</span> */}
                </div>
              );
            })}
          </div>
        </div>
        {!error &&
          (dataList?.length ?? 0) !== 0 &&
          stuffListDs.currentPage !== stuffListDs.totalPage && <Spin />}
      </div>
      <div className={style['right-panel']}>
        <MonitorDetail selectRecord={selectRecord} setDs={setDs} />
      </div>
    </div>
  );
}
