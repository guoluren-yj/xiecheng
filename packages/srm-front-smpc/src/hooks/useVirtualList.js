// 虚拟列表
import { useRef, useState, useEffect, useCallback } from 'react';
import useLatest from './useLatest';
import useEventListener from './useEventListener';

export default function useVirtualList(
  list,
  { containerRef, contentRef, rowHeight = 20, bufferSize = 5 }
) {
  const isScrollTo = useRef();
  const rowHeightRef = useLatest(rowHeight);
  const [showList, setShowList] = useState([]);

  useEffect(() => {
    calcRange();
  }, [list]);

  useEventListener(
    'scroll',
    (e) => {
      if (isScrollTo.current) {
        isScrollTo.current = false;
        return;
      }
      calcRange();
      e.preventDefault();
    },
    { target: containerRef.current }
  );

  function calcRange() {
    const container = containerRef.current;
    const content = contentRef.current;
    const itemHeight = rowHeightRef.current;
    if (container && content) {
      const { scrollTop, clientHeight } = container;
      // 视窗显示个数
      const showSize = Math.ceil(clientHeight / itemHeight);
      // 当前滚动位置
      const scrollInd = Math.floor(scrollTop / itemHeight) + 1;
      // 起始位置
      const start = Math.max(0, scrollInd - bufferSize);
      // 结束位置
      const end = Math.min(list.length, scrollInd + showSize + bufferSize);
      // 距离上面的距离
      const startMargin = start * itemHeight;
      // 内容高度
      const contentHeight = itemHeight * list.length;

      content.style.height = `${contentHeight - startMargin}px`;
      content.style.marginTop = `${startMargin}px`;

      const _showList = list.slice(start, end).map((item, index) => [item, index]);

      setShowList(_showList);
    }
  }

  const scrollTo = useCallback((index) => {
    const container = containerRef.current;
    if (container) {
      isScrollTo.current = true;
      container.scrollTop = rowHeightRef.current * index;
      calcRange();
    }
  }, []);

  return [showList, scrollTo];
}
