import * as React from 'react';
import classNames from 'classnames';
// import scrollIntoView from 'scroll-into-view-if-needed';

import { sortedIndex, throttle, isEmpty } from 'lodash';
import styles from './index.less';
import Node from './Node';

interface ListProps {
  pageNodes: Array<React.ReactNode>;
  className?: string;
  style?: any;
}

const List: React.FC<ListProps> = ({ className = '', style = {}, pageNodes = [] }) => {
  const contentRef = React.useRef<HTMLIFrameElement>(null);
  // FIXME: ReactDOM.findDOMNode ???
  // 数组？
  const [refObj] = React.useState({});
  const [scrollTop, setScrollTop] = React.useState<Number>(0);
  const [currentIndex, setCurrentIndex] = React.useState<string>('0');

  const handleObserveCallback = React.useCallback(
    (mutationsList) => {
      for (const mutation of mutationsList) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
          const containerElement = contentRef.current;
          const heightArr = Object.keys(refObj)
            .map((i) => refObj[i].current?.clientHeight)
            .filter(Boolean);
          const arr = heightArr.map((_, index) => {
            return heightArr.slice(0, index + 1).reduce((t, n) => t + n);
          });
          const index = sortedIndex(arr, scrollTop);
          if (containerElement) {
            containerElement.scrollTop = arr[index - 1];
          }
        }
      }
    },
    [scrollTop]
  );

  // FIXME:是不是该用React.useRef
  const observer = React.useMemo(() => new MutationObserver(handleObserveCallback), [scrollTop]);

  const handleObserve = React.useCallback(
    (targetNode) => {
      // MutationObserver 监听切换tab
      observer.observe(targetNode, { attributes: true });
    },
    [scrollTop]
  );

  const handleScroll = React.useCallback(
    throttle(() => {
      const containerElement = contentRef.current;
      const newScrollTop = containerElement?.scrollTop || 0;
      const heightArr = Object.keys(refObj)
        .map((i) => refObj[i].current?.clientHeight)
        .filter(Boolean);
      const arr = heightArr.map((_, index) => {
        return heightArr.slice(0, index + 1).reduce((t, n) => t + n);
      });
      // 往下滚
      const index = sortedIndex(arr, newScrollTop);
      setCurrentIndex(String(index));
      const numberCurrentIndex = Number(currentIndex);
      if (scrollTop < newScrollTop) {
        // 顶部在哪块里
        const tabsElement = refObj[index].current?.querySelector(
          '.c7n-tabs.c7n-tabs-top .c7n-tabs-bar'
        );

        if (newScrollTop > (arr[index - 1] || 0)) {
          if (numberCurrentIndex < index) {
            const oldElement = refObj[numberCurrentIndex].current?.querySelector(
              '.c7n-tabs.c7n-tabs-top .c7n-tabs-bar'
            );
            const oldTabObj = {
              position: '',
              top: '',
            };
            if (oldElement?.style === 'fixed') {
              Object.assign(tabsElement.style, oldTabObj);
            }
          }
          if (tabsElement) {
            const { top = 0 } = containerElement?.getBoundingClientRect() || {};
            const originMarginTop = containerElement?.style.marginTop || '0px';
            const offset = Number(originMarginTop.substring(0, originMarginTop.length - 2));
            const tabObj = {
              position: 'fixed',
              top: `${top - offset}px`,
            };
            const conObj = {
              marginTop: `${tabsElement.clientHeight}px`,
              height: `calc( 100% - ${tabsElement.clientHeight}px )`,
            };
            if (
              tabsElement.style.position !== tabObj.position ||
              tabsElement.style.top !== tabObj.top
            ) {
              Object.assign(tabsElement.style, tabObj);
            }
            if (
              containerElement?.style.height !== conObj.height ||
              containerElement?.style.marginTop !== conObj.marginTop
            ) {
              Object.assign(containerElement?.style, conObj);
            }
            const tabsContentElement = refObj[index].current?.querySelector(
              '.c7n-tabs.c7n-tabs-top .c7n-tabs-content'
            );
            observer.disconnect();
            handleObserve(tabsContentElement);
          }
        }
      } else if (numberCurrentIndex > index) {
        const oldElement = refObj[currentIndex].current?.querySelector(
          '.c7n-tabs.c7n-tabs-top .c7n-tabs-bar'
        );
        if (oldElement) {
          const oldTabObj = {
            position: '',
            top: '',
          };
          const oldConObj = {
            marginTop: '',
            height: '',
          };
          if (oldElement?.style.position === 'fixed') {
            Object.assign(oldElement.style, oldTabObj);
          }
          if (
            containerElement?.style.height !== oldConObj.height ||
            containerElement?.style.marginTop !== oldConObj.marginTop
          ) {
            Object.assign(containerElement?.style, oldConObj);
          }
        }

        const tabsElement = refObj[index].current?.querySelector(
          '.c7n-tabs.c7n-tabs-top .c7n-tabs-bar'
        );
        if (tabsElement) {
          const { top = 0 } = containerElement?.getBoundingClientRect() || {};
          const originMarginTop = containerElement?.style.marginTop || '0px';
          const offset = Number(originMarginTop.substring(0, originMarginTop.length - 2));
          const tabObj = {
            position: 'fixed',
            top: `${top - offset}px`,
          };
          const conObj = {
            marginTop: `${tabsElement.clientHeight}px`,
            height: `calc( 100% - ${tabsElement.clientHeight}px )`,
          };
          if (
            tabsElement.style.position !== tabObj.position ||
            tabsElement.style.top !== tabObj.top
          ) {
            Object.assign(tabsElement.style, tabObj);
          }
          if (
            containerElement?.style.height !== conObj.height ||
            containerElement?.style.marginTop !== conObj.marginTop
          ) {
            Object.assign(containerElement?.style, conObj);
          }
          const tabsContentElement = refObj[index].current?.querySelector(
            '.c7n-tabs.c7n-tabs-top .c7n-tabs-content'
          );
          observer.disconnect();
          handleObserve(tabsContentElement);
        }
      }
      setScrollTop(newScrollTop);
    }, 500),
    [scrollTop, currentIndex]
  );

  return (
    <div
      ref={contentRef}
      className={classNames(styles['content-left'], className)}
      style={style}
      onScroll={handleScroll}
    >
      {isEmpty(pageNodes)
        ? null
        : pageNodes.map((item, index) => (
          <Node refObj={refObj} index={String(index)}>
            {item}
          </Node>
          ))}
    </div>
  );
};

export default List;
