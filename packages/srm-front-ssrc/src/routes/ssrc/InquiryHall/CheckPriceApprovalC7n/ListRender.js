import React, { memo, useRef, useEffect } from 'react';
import { Collapse } from 'hzero-ui';
import { compose, isEmpty } from 'lodash';
import { useVirtualList } from 'ahooks';

const { Panel } = Collapse;
const ListRender = (props) => {
  const {
    headerList = [],
    renderHeaderInfo,
    styles,
    tableProps,
    form,
    remote,
    renderLineTable,
    activePanel = [],
    changeCollapse,
    pagesize,
    lineKey,
    batchSearchData,
    batchSearchDataKeys,
    tableMap,
    openExpandAllFlag,
    getContainerRef,
    renderInvalidHeaderInfo,
  } = props;

  const containerRef = useRef(null);
  const wrapperRef = useRef(null);
  const start = useRef(null);
  const end = useRef(null);
  const cacheKeys = useRef([]);

  const openVirtualFlag = openExpandAllFlag && pagesize > 10 && headerList.length > 10;

  const [renderListMap, scrollTo] = useVirtualList(headerList, {
    containerTarget: containerRef,
    wrapperTarget: wrapperRef,
    itemHeight: (index, data) => {
      if (activePanel.includes(data[lineKey]) && batchSearchData.length === headerList.length) {
        const listNum = batchSearchData[index]?.content?.length;
        if (listNum) {
          return 545 - 39 * (10 - listNum > 0 ? 10 - listNum : 0);
        } else {
          return 60;
        }
      }
      return 60;
    },
    overscan: 2,
  });

  const renderList = [];
  const indexList = [];
  if (renderListMap.length) {
    renderListMap.forEach((item, index) => {
      if (index === 0) {
        start.current = item.index;
      }
      if (index === renderListMap.length - 1) {
        end.current = item.index;
      }
      renderList.push(item.data);
      indexList.push(item.index);
    });
  }

  useEffect(() => {
    getContainerRef(containerRef);
  }, [containerRef.current]);

  useEffect(() => {
    if (!openVirtualFlag || !batchSearchDataKeys.length) {
      return;
    }

    const keys = batchSearchDataKeys.slice(start.current, end.current + 1);

    keys.forEach((item) => {
      if (cacheKeys.current.includes(item)) {
        return;
      }
      const tarIndex = batchSearchDataKeys.findIndex((idx) => idx === item);
      if (!isEmpty(tableMap)) {
        const targetDS = tableMap[item];
        if (targetDS) {
          targetDS.status = 'loading';
          targetDS.loadData(
            batchSearchData[tarIndex].content,
            batchSearchData[tarIndex].totalElements,
            true
          );
          targetDS.status = 'ready';
        }
      }
      cacheKeys.current = [...cacheKeys.current, item];
    });
  }, [start.current, end.current, batchSearchData, batchSearchDataKeys, tableMap]);

  const render = (list) => (
    <Collapse bordered={false} activeKey={activePanel} onChange={changeCollapse}>
      {list &&
        list.map((item) => {
          return (
            <Panel
              header={
                lineKey === 'rfxLineSupplierId' &&
                (item.invalidFlag || item.summaryReviewResult === 'NO_APPROVED')
                  ? renderInvalidHeaderInfo(item, openVirtualFlag ? scrollTo : null)
                  : renderHeaderInfo(item, openVirtualFlag ? scrollTo : null)
              }
              key={String(item[lineKey])}
              className={styles.arrowStyle}
              showArrow={false}
            >
              {renderLineTable(
                tableProps,
                item[lineKey],
                form.getFieldValue(`value#${item[lineKey]}`),
                remote
              )}
            </Panel>
          );
        })}
    </Collapse>
  );

  return openVirtualFlag ? (
    <div
      ref={containerRef}
      style={{ height: `calc(100vh - 200px)`, overflow: 'auto', overflowAnchor: 'none' }}
    >
      <div ref={wrapperRef}>{render(renderList)}</div>
    </div>
  ) : (
    render(headerList)
  );
};

const hocDynamicConfiguration = (Comp) => {
  return compose(memo)(Comp);
};

export default hocDynamicConfiguration(ListRender);
