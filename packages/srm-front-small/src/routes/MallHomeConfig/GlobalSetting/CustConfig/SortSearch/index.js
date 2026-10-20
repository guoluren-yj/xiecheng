import React, { useMemo, useState, useEffect } from 'react';
import { isEmpty, compose } from 'lodash';
import { connect } from 'dva';
import { Icon } from 'choerodon-ui/pro';
import classNames from 'classnames';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import styles from './index.less';

const iconMapping = {
  0: 'looks_one-o',
  1: 'looks_two-o',
  2: 'looks_3-o',
};

const organizationId = getCurrentOrganizationId(); // 租户ID

const SortSearch = ({ dispatch, mallHome: { lovBatch }, dataSet }) => {
  useEffect(() => {
    if (isEmpty(lovBatch?.searchType)) {
      dispatch({
        type: 'mallHome/initQueryIdp',
      });
    }
  }, []);

  useEffect(() => {
    if (!isEmpty(lovBatch?.searchType)) {
      dispatch({
        type: 'mallHome/fetchSortList',
      }).then((res) => {
        getList(res);
      });
    }
  }, [lovBatch?.searchType]);

  function getList(data) {
    const defaultList = lovBatch?.searchType?.map((p, i) => {
      return {
        orderSeq: i + 1,
        enabledFlag: 1,
        searchType: p.value,
        meaning: p.meaning,
        tenantId: organizationId,
      };
    });
    if (data.searchTypeFlag) {
      // 已存数据
      const currentList = data.productSearchTypeConfigList
        ?.map((p) => {
          return {
            ...p,
            meaning: lovBatch?.searchType?.find((o) => o.value === p.searchType)?.meaning,
          };
        })
        .sort((a, b) => a.orderSeq - b.orderSeq);
      // 未存数据，enabledFlag：0
      const needList = defaultList
        .filter((p) => !currentList.some((c) => c.searchType === p.searchType))
        ?.map((p) => ({ ...p, enabledFlag: 0 }));
      setList([...currentList, ...needList].map((p, i) => ({ ...p, orderSeq: i + 1 })));
    } else {
      setList(defaultList);
    }
  }

  const [list, setList] = useState([]);

  const enabledFlagList = useMemo(() => {
    return list.filter((p) => p.enabledFlag === 1);
  }, [list]);

  const disableList = useMemo(() => {
    return list.filter((p) => p.enabledFlag !== 1);
  }, [list]);

  useEffect(() => {
    dataSet.current.set(
      'sortSearchList',
      list?.map((p, i) => ({ ...p, orderSeq: i + 1 }))
    );
  }, [list]);

  const RenderItem = ({ item, type, index, hanleClick }) => {
    return (
      <div className="sort-search-content-item">
        <span
          className={classNames([
            'sort-search-content-item-icon',
            { 'sort-search-content-item-icon-disabled': type === 'disable' },
          ])}
        >
          <Icon
            type="baseline-drag_indicator"
          />
        </span>
        <div
          onClick={hanleClick}
          className={classNames([
            'sort-search-content-item-name',
            { active: type === 'enabledFlag' },
          ])}
        >
          {type === 'enabledFlag' ? (
            <Icon className="sort-search-content-item-name-icon" type={iconMapping[index]} />
          ) : (
            <Icon
              className="sort-search-content-item-name-icon empty-icon"
              type="check_box_outline_blank"
            />
          )}
          {item.meaning}
        </div>
      </div>
    );
  };

  const hanleClick = ({ item }) => {
    if (item.searchType === 'COMPLAX') return;
    setList((data) => {
      const newData = [...data];
      newData.forEach((p, i) => {
        if (p.searchType === item.searchType) {
          newData[i].enabledFlag = newData[i].enabledFlag === 1 ? 0 : 1;
        }
      });
      return [
        ...newData.filter((p) => p.enabledFlag === 1),
        ...newData.filter((p) => p.enabledFlag !== 1),
      ];
    });
  };

  return (
    <div className={styles['sort-search-content']}>
      <DragDropContext
        onDragEnd={(result) => {
          const { destination, source } = result;
          if (!destination) {
            return;
          }
          if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
          ) {
            return;
          }
          const newList = [].concat(enabledFlagList);
          newList.splice(source.index, 1);
          newList.splice(destination.index, 0, enabledFlagList[source.index]);
          setList([...newList, ...disableList]);
        }}
      >
        <Droppable droppableId="content">
          {(provided) => (
            <div
              style={{ flex: 1 }}
              // provided.droppableProps应用的相同元素.
              {...provided.droppableProps}
              // 为了使 droppable 能够正常工作必须 绑定到最高可能的DOM节点中provided.innerRef.
              ref={provided.innerRef}
            >
              {enabledFlagList.map((item, index) => (
                <Draggable key={item.searchType} draggableId={`${item.searchType}`} index={index}>
                  {(provide) => (
                    <div
                      className="catalog-item"
                      ref={provide.innerRef}
                      {...provide.draggableProps}
                      {...provide.dragHandleProps}
                    >
                      <div
                        style={{
                          marginBottom:
                            enabledFlagList.length === index + 1 && disableList.length === 0
                              ? 0
                              : 16,
                        }}
                      >
                        <RenderItem
                          item={item}
                          index={index}
                          type="enabledFlag"
                          hanleClick={() => hanleClick({ item })}
                        />
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      {!isEmpty(disableList) && (
        <p className="hidden-area-line" style={{ marginTop: isEmpty(enabledFlagList) ? 0 : 24 }}>
          <span>{intl.get('small.mallHomeConfig.view.common.hiddenArea').d('隐藏区域')}</span>
        </p>
      )}
      {disableList.map((item, index) => (
        <div style={{ marginBottom: disableList.length === index + 1 ? 0 : 16 }}>
          <RenderItem
            item={item}
            index={index}
            type="disable"
            hanleClick={() => hanleClick({ item })}
          />
        </div>
      ))}
    </div>
  );
};

export default compose(
  connect(({ mallHome }) => ({
    mallHome,
  }))
)(SortSearch);
