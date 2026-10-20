import React, { useContext, useCallback, useState, useMemo, useEffect } from 'react';
import { Modal, Tooltip } from 'choerodon-ui/pro';
import { Icon, Tabs } from 'choerodon-ui';
import { omit } from 'lodash';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

import intl from 'utils/intl';
import styles from '../../index.less';
import ConditionEditor from './ConditionEditor';
import { transformStyle, getFormatValueType } from './store';
import Store from '../../store';

const ConditionFormat = ({ hidePaneContent, treeDs }) => {
  const { sheetPartRef, currentCell } = useContext(Store).store;

  const formatValueTypeMap = useMemo(() => {
    const map = {};
    getFormatValueType().forEach(i => {
      map[i.value] = i.meaning;
    });
    return map;
  }, []);
  const [tabKey, setTabKey] = useState('part'); 
  const [isEditing, setIsEditing] = useState(false);
  const [allConditionList, setAllConditionList] = useState([]);
  const [editItem, setEditItem] = useState();
  const partConditionList = useMemo(() => {
    if (!allConditionList.length) {
      return [];
    }
    let currentPosition = { c: 0, r: 0 };
    if (currentCell && currentCell.position) {
      currentPosition = {
        c: currentCell.position.c,
        r: currentCell.position.r,
      };
    }
    return allConditionList.filter(
      (i) =>
        i.range &&
        i.range.position &&
        i.range.position.c === currentPosition.c &&
        i.range.position.r === currentPosition.r
    );
  }, [allConditionList, allConditionList.length, currentCell]);

  useEffect(() => {
    if (
      sheetPartRef &&
      sheetPartRef.current &&
      sheetPartRef.current.sheetRef &&
      sheetPartRef.current.sheetRef.getConditionFormat
    ) {
      const conditionList = sheetPartRef.current.sheetRef.getConditionFormat() || [];
      setAllConditionList(conditionList);
    }
  }, []);

  useEffect(() => {
    if (
      sheetPartRef &&
      sheetPartRef.current &&
      sheetPartRef.current.sheetRef &&
      sheetPartRef.current.sheetRef.setConditionFormat
    ) {
      sheetPartRef.current.sheetRef.setConditionFormat(allConditionList);
    }
  }, [allConditionList, allConditionList.length]);

  const handleEditRule = useCallback((conditionItem) => {
    setEditItem(conditionItem);
    setIsEditing(true);
  }, []);
  const handleDeleteRule = useCallback(
    (conditionItem) => {
      Modal.confirm({
        title: intl.get('hrpt.reportDesign.view.confirm.delete').d('是否确认删除'),
        onOk: () => {
          const conditionList = allConditionList
            .filter((item) => item.id !== conditionItem.id)
            .map((item, index) => ({
              ...item,
              orderSeq: index,
            }));
          setAllConditionList(conditionList);
        },
      });
    },
    [allConditionList]
  );

  const handleAddRule = useCallback(() => {
    setEditItem(undefined);
    setIsEditing(true);
  }, []);

  const handleChangeTab = useCallback((tab) => {
    setTabKey(tab);
  }, []);

  const handleSubmitEdit = useCallback(
    (submitData) => {
      if (submitData._status === 'create') {
        const newAllConditionList = allConditionList;
        newAllConditionList.push({
          id: new Date().getTime(),
          orderSeq: allConditionList.length + 1,
          ...omit(submitData, ['_status']),
        });
        setAllConditionList(newAllConditionList);
      } else {
        setAllConditionList(
          allConditionList.map((item) => (item.id === submitData.id ? submitData : item))
        );
      }
      handleCancelEdit();
    },
    [allConditionList]
  );

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
    setEditItem(undefined);
  }, []);

  const onDragEnd = useCallback(
    ({ source, destination }) => {
      if (!destination || !source) {
        return;
      }
      if (source.index === destination.index) {
        return;
      }
      const sourceCondition = partConditionList[source.index];
      const destCondition = partConditionList[destination.index];
      if (!sourceCondition || !destCondition) return;
      let lower;
      let greater;
      if (source.index < destination.index) {
        lower = sourceCondition;
        greater = destCondition;
      } else {
        lower = destCondition;
        greater = sourceCondition;
      }
      // 以source和destination为界限，将allConditionList分为三部分，重新排序后将三个部分拼接即位新数组
      const part1 = [];
      const part2 = [];
      const part3 = [];
      let lowerFlag = false;
      let greaterFlag = false;
      allConditionList.forEach((condition) => {
        if (lower.id === condition.id) {
          lowerFlag = true;
          return;
        }
        if (greater.id === condition.id) {
          greaterFlag = true;
          return;
        }
        if (!lowerFlag) {
          part1.push(condition);
          return;
        }
        if (!greaterFlag) {
          part2.push(condition);
          return;
        }
        part3.push(condition);
      });

      if (source.index < destination.index) {
        // source将destination挤到自身新位置上方
        part2.push(destCondition);
        part2.push(sourceCondition);
      } else {
      // source将destination挤到自身新位置下方
        part1.push(sourceCondition);
        part1.push(destCondition);
      }
      setAllConditionList([...part1, ...part2, ...part3].map((item, index) => ({ ...item, orderSeq: index })));
    },
    [allConditionList, partConditionList]
  );

  const renderConditionItem = useCallback(
    (conditionItem, provided) => {
      const { id, style, range, conditionType } = conditionItem;
      const conditionDesc = formatValueTypeMap[conditionType];
      const { value: rangeValue } = range || {};
      const text = rangeValue && rangeValue.includes(':') ? rangeValue.split(':')[0] : rangeValue;
      return (
        <div key={id} className={styles['list-item']}>
          <div className={styles['left']}>
            {provided ? (
              <Icon
                type="baseline-drag_indicator"
                {...provided.dragHandleProps}
                style={{ cursor: 'move' }}
              />
            ) : (<div style={{ display: "inline-block", width: "22px" }} />)}
            <div className={styles['preview-box']} style={transformStyle(style || {})}>
              A
            </div>
          </div>
          <div className={styles['middle']}>
            <div className={styles['description']}>{conditionDesc}</div>
            <div className={styles['range']}>{text}</div>
          </div>
          <div className={styles['right']}>
            <div>
              <Tooltip title={intl.get('hzero.common.button.edit').d('编辑')}>
                <Icon
                  type="mode_edit"
                  className={styles['edit-icon']}
                  onClick={() => handleEditRule(conditionItem)}
                />
              </Tooltip>
            </div>
            <div>
              <Tooltip title={intl.get('hzero.common.button.delete').d('删除')}>
                <Icon type="delete_black-o" onClick={() => handleDeleteRule(conditionItem)} />
              </Tooltip>
            </div>
          </div>
        </div>
      );
    },
    [formatValueTypeMap, handleEditRule, handleDeleteRule]
  );

  const renderConditionList = useCallback(
    (conditionList, dragable) => {
      if (!conditionList.length) {
        return (
          <div className={styles['no-rule-tooltip']}>
            {intl.get('hrpt.reportDesign.view.title.noSetRule').d('当前未设置任何格式规则')}
          </div>
        );
      }
      return (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className={styles['list']}>
            <Droppable droppableId="droppable">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {conditionList.map((conditionItem, index) => {
                    if (!dragable) {
                      return renderConditionItem(conditionItem);
                    }
                    return (
                      <Draggable
                        key={conditionItem.id}
                        draggableId={String(conditionItem.id)}
                        index={index}
                      >
                        {(provided1) => (
                          <div
                            ref={provided1.innerRef}
                            {...provided1.draggableProps}
                            key={conditionItem.id}
                          >
                            {renderConditionItem(conditionItem, provided1)}
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        </DragDropContext>
      );
    },
    [onDragEnd, renderConditionItem]
  );

  return (
    <div className={styles['condition-format-content']}>
      <div className={styles['title']}>
        <span>
          {!isEditing
            ? intl.get('hrpt.reportDesign.view.title.conditionFormat').d('条件格式')
            : editItem
            ? intl.get('hrpt.reportDesign.view.title.editConditionFormat').d('编辑条件格式')
            : intl.get('hrpt.reportDesign.view.title.addConditionFormat').d('添加条件格式')}
        </span>
        <Icon type="close" onClick={hidePaneContent} />
      </div>
      {isEditing ? (
        <ConditionEditor
          initData={editItem}
          onSubmit={handleSubmitEdit}
          onCancel={handleCancelEdit}
          treeDs={treeDs}
        />
      ) : (
        <>
          <div className={styles['tabs']}>
            <Tabs activeKey={tabKey} onChange={handleChangeTab}>
              <Tabs.TabPane
                key="part"
                tab={intl
                  .get('hrpt.reportDesign.view.title.conditionFormat.currentArea')
                  .d('选中区域')}
              >
                {renderConditionList(partConditionList, true)}
              </Tabs.TabPane>
              <Tabs.TabPane
                key="all"
                tab={intl
                  .get('hrpt.reportDesign.view.title.conditionFormat.currentSheet')
                  .d('当前工作表')}
              >
                {renderConditionList(allConditionList)}
              </Tabs.TabPane>
            </Tabs>
          </div>
          <div className={styles['split']} />
          <div className={styles['footer']} onClick={handleAddRule}>
            <Icon type="control_point" />
            <span>{intl.get('hrpt.reportDesign.view.title.addNewRule').d('添加新规则')}</span>
          </div>
        </>
      )}
    </div>
  );
};

ConditionFormat.displayName = 'ConditionFormat';
export default ConditionFormat;
