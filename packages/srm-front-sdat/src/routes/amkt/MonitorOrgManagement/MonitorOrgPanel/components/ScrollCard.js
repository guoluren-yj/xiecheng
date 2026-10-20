import React, { useState, useEffect, useRef } from 'react';
import { Spin } from 'choerodon-ui/pro';

import style from '../index.less';

let isQuery = false;

const ScrollCard = ({ stuffListDs = null, refreshKey = 0 }) => {
  const [dataList, setDataList] = useState([]);
  const scrollBoxRef = useRef();
  const longBoxRef = useRef();

  useEffect(() => {
    if (!stuffListDs) return;
    // eslint-disable-next-line no-unused-expressions
    stuffListDs?.query()?.then((res) => {
      setDataList(res?.content ?? []); // dataList变化会触发另一个副作用
    });
  }, [refreshKey]);

  useEffect(() => {
    // dataList变化时检查是否存在滚动条
    if (
      scrollBoxRef &&
      scrollBoxRef.current &&
      longBoxRef &&
      longBoxRef.current &&
      longBoxRef.current.clientHeight - 20 < scrollBoxRef.current.clientHeight &&
      dataList.length !== 0
    ) {
      queryMore();
    }
  }, [dataList]);

  /**
   * queryMore 查询更多的逻辑
   * @returns
   */
  const queryMore = () => {
    if (stuffListDs.currentPage >= stuffListDs.totalPage) return;
    stuffListDs.queryMore(stuffListDs.currentPage + 1).then((res) => {
      if (res && res?.content) {
        const newDataList = dataList.concat(res?.content ?? []);
        setDataList(newDataList); // dataList变化会触发另一个副作用，相当于递归
      }
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
    <div className={style['out-fixed-box']} ref={scrollBoxRef} onScroll={handleScroll}>
      <div className={style['inner-long-box']} ref={longBoxRef}>
        {dataList?.map((item) => {
          const { userName = '', loginName = '' } = item || {};
          return (
            userName && (
              <div className={style['line-box']}>
                <span className={style['span-name']}>{userName}</span>
                <span className={style['span-code']}>{loginName}</span>
              </div>
            )
          );
        })}
        {stuffListDs.currentPage !== stuffListDs.totalPage && <Spin />}
      </div>
    </div>
  );
};

export default ScrollCard;
