import React, { useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Icon } from 'choerodon-ui/pro';
import { compose, isEmpty } from 'lodash';
import { connect } from 'dva';
import { getCurrentOrganizationId } from 'utils/utils'; // 租户ID
import { Observer } from 'mobx-react-lite';
import styles from './index.less';

const organizationId = getCurrentOrganizationId();

const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

const getItemStyle = (isDragging, draggableStyle) => ({
  userSelect: 'none',
  height: 32,
  // hover时能有颜色
  background: isDragging ? '#F7F8FA' : '',
  ...draggableStyle,
});

function SortMallMenu({ dispatch, dataSet, mallHome: { lovBatch = {} } }) {
  const getList = data => {
    // 无配置时 默认
    const defaultList = lovBatch?.sortMenu?.map((p, i) => {
      return {
        orderSeq: i + 1,
        enabledFlag: 1,
        meaning: p.meaning,
        searchType: p.value,
        configType: 'MY_MALL_MENU',
        tenantId: organizationId,
      };
    });
    dataSet.current.set('sortMenuList', defaultList);
    // 有配置
    if (data.myMallMenuFlag) {
      const currentList = data.myMallMenuConfigList
        ?.map((p, i) => {
          return {
            ...p,
            meaning: lovBatch?.sortMenu?.find(o => o.value === p.searchType)?.meaning,
            configType: 'MY_MALL_MENU',
            tenantId: organizationId,
            orderSeq: i + 1,
          };
        })
        .sort((a, b) => a.orderSeq - b.orderSeq);
      dataSet.current.set('sortMenuList', currentList);
    }
  };

  useEffect(() => {
    if (!isEmpty(lovBatch?.sortMenu)) {
      dispatch({
        type: 'mallHome/fetchSortList',
      }).then(res => {
        getList(res);
      });
    }
  }, [lovBatch?.sortMenu]);

  return (
    <div>
      <Observer>
        {() => {
          const itemList = dataSet.current.get('sortMenuList') || [];
          return (
            <DragDropContext
              onDragEnd={result => {
                if (!result.destination) {
                  return;
                }
                const items = reorder(
                  dataSet.current.get('sortMenuList' ),
                  result.source.index,
                  result.destination.index
                ).map((p, index)=>({
                  ...p,
                  orderSeq: index + 1,
                }));
                dataSet.current.set('sortMenuList', items);
              }}
            >
              <Droppable droppableId="droppable">
                {provided => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={styles['drag-wrapper']}
                  >
                    {itemList.map((item, index) => (
                      <Draggable key={item.searchType} draggableId={item.searchType} index={index}>
                        {(provide, snapshot) => (
                          <div
                            ref={provide.innerRef}
                            {...provide.draggableProps}
                            {...provide.dragHandleProps}
                            style={getItemStyle(snapshot.isDragging, provide.draggableProps.style)}
                            className={styles['drag-item']}
                          >
                            <Icon
                              type="baseline-drag_indicator"
                              style={{ fontSize: 16, margin: '0 12px' }}
                            />
                            {item.meaning}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          );
        }}
      </Observer>
    </div>
  );
}

export default compose(
  connect(({ mallHome }) => ({
    mallHome,
  }))
)(SortMallMenu);