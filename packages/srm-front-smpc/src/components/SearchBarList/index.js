import React, { createContext, useContext, useRef } from 'react';
import classNames from 'classnames';
import { Pagination, Spin } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';

import SearchBar from '_components/SearchBarTable/SearchBar';
import useVirtualList from '@/hooks/useVirtualList';
import useEventListener from '@/hooks/useEventListener';
import styles from './index.less';

const SearchBarListContext = createContext({
  rowHeight: 20, // 行高
  onRow: () => ({}), // 动态设置行上的属性
  itemRenderer: () => {}, // 行渲染
});

const ListItem = observer(({ record, dataSet }) => {
  const { onRow, rowHeight, itemRenderer } = useContext(SearchBarListContext);
  const rowAttrs = onRow({ record, dataSet }) || {};
  const style = {
    ...(rowAttrs.style || {}),
    height: rowHeight,
  };
  return (
    <div className={styles['c7n-search-bar-item']} style={style} {...rowAttrs}>
      {itemRenderer({ record, dataSet })}
    </div>
  );
});

const ListContent = observer(({ dataSet }) => {
  const containerRef = useRef();
  const contentRef = useRef();
  const { rowHeight, emptyRenderer } = useContext(SearchBarListContext);
  const [showList, handleScrollTo] = useVirtualList(dataSet.records, {
    rowHeight,
    containerRef,
    contentRef,
  });

  useEventListener(
    'load',
    () => {
      handleScrollTo(0);
    },
    { target: dataSet }
  );

  return dataSet.length > 0 ? (
    <div className={styles['c7n-search-bar-content-wrapper']} ref={containerRef}>
      <div className={styles['c7n-search-bar-content']} ref={contentRef}>
        {showList.map(([record, index]) => (
          <ListItem record={record} dataSet={dataSet} key={index} />
        ))}
      </div>
    </div>
  ) : (
    <div className={styles['c7n-search-bar-empty']}>{emptyRenderer()}</div>
  );
});

export default function SearchBarList(props) {
  const {
    dataSet,
    searchCode,
    rowHeight,
    onRow = () => ({}),
    itemRenderer = () => {},
    emptyRenderer = () => {},
    searchBarConfig = {},
    wrapperStyle = {},
    // contentStyle = {},
  } = props;

  return (
    <Spin dataSet={dataSet}>
      <div className={classNames({ [styles['c7n-search-bar-list']]: true })} style={wrapperStyle}>
        <SearchBar searchCode={searchCode} dataSet={[dataSet]} {...searchBarConfig} />
        <SearchBarListContext.Provider value={{ rowHeight, onRow, itemRenderer, emptyRenderer }}>
          <ListContent dataSet={dataSet} />
        </SearchBarListContext.Provider>
        <div className={styles['c7n-search-bar-list-pagination']}>
          <Pagination dataSet={dataSet} showQuickJumper />
        </div>
      </div>
    </Spin>
  );
}
