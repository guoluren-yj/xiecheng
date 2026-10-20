/*
 * LaneView - 泳道视图
 * @Date: 2022-12-02 17:29:30
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import classNames from 'classnames';
import { toString, isEmpty } from 'lodash';
import React, { useCallback, useContext } from 'react';
import { Tooltip, Icon, Pagination } from 'choerodon-ui/pro';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

import intl from 'utils/intl';

import { ReactComponent as DegradedIcon } from '@/assets/lifeCycle/degraded.svg';
import { ReactComponent as UpgradeIcon } from '@/assets/lifeCycle/upgrade.svg';
import { ReactComponent as NoSupplier } from '@/assets/lifeCycle/no-supplier.svg';
import { ReactComponent as ArrowRight } from '@/assets/lifeCycle/arrow-right.svg';

import { handleSupplierDetail } from '@/routes/components/utils/utils';
import styles from '../index.less';
import { Context } from '../Context';
import { getStageTitle } from '../utils';

const defaultPageSize = 10;

const LaneView = () => {
  const {
    stageLane,
    onSearch,
    onDragEnd,
    primaryColor,
    renderOperateLink,
    lifeCycleManageRemote,
  } = useContext(Context);

  // 拖拽中样式
  const getItemStyle = useCallback((isDragging, draggableStyle) => {
    const borderColor = primaryColor || '#00B8CC';
    return {
      userSelect: 'none',
      border: isDragging ? `1px solid ${borderColor}` : 'none',
      ...draggableStyle,
    };
  }, []);

  // 渲染升降级中icon
  const renderOperateIcon = useCallback(data => {
    const { gradeType, toStageDescription } = data;
    if (['UPGRADE', 'DEGRADE'].includes(gradeType)) {
      const isUpgrade = gradeType === 'UPGRADE'; // 升级
      return (
        <div className={classNames(styles['relegation-wrap'])}>
          {isUpgrade ? <UpgradeIcon /> : <DegradedIcon />}
          <Tooltip title={getStageTitle(toStageDescription)}>{toStageDescription}</Tooltip>
        </div>
      );
    } else {
      return (
        <Tooltip
          title={intl
            .get('sslm.lifeCycleManage.view.title.statusIconMsg')
            .d('可拖拽至目标阶段发起申请')}
        >
          <Icon
            type="baseline-drag_indicator"
            className={classNames(styles['droppable-draggable-supplier-status-icon'])}
          />
        </Tooltip>
      );
    }
  }, []);

  // 分页参数改变时的回调
  const handlePaginationChange = useCallback(
    (stageId, current, pageSize) => {
      const page = { current, pageSize };
      const params = { stageId, page };
      onSearch({ params });
    },
    [stageLane]
  );

  return (
    <div className={classNames(styles['supplier-content'])}>
      <DragDropContext onDragEnd={onDragEnd}>
        {stageLane.map(stage => (
          <div className={classNames(styles['droppable-content'])} key={stage?.stageId}>
            <Droppable droppableId={stage?.stageId}>
              {provided => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={classNames(styles['droppable-section'])}
                >
                  <div className={classNames(styles['droppable-top'])}>
                    <span
                      className={classNames(styles['droppable-top-title'])}
                      title={stage?.stageDescription}
                    >
                      {stage?.stageDescription}
                    </span>
                    <span className={classNames(styles['droppable-top-title-count'])}>
                      （{stage?.stageLifeCycles.totalElements}）
                    </span>
                  </div>
                  <div className={classNames(styles['droppable-middle'])}>
                    {isEmpty(stage?.stageLifeCycles.content) ? (
                      <div className={classNames(styles['droppable-middle-no-supplier'])}>
                        <div style={{ textAlign: 'center' }}>
                          <NoSupplier />
                          <div style={{ color: '#868D9C', marginTop: 14 }}>
                            {intl
                              .get('sslm.lifeCycleManage.view.message.noSupplier')
                              .d('暂无供应商')}
                          </div>
                        </div>
                      </div>
                    ) : (
                      stage?.stageLifeCycles.content.map((item, index) => (
                        <Draggable
                          index={index}
                          key={item.supplierCompanyId}
                          isDragDisabled={item.gradeType !== 'NO'}
                          draggableId={toString(item.supplierCompanyId)}
                        >
                          {(pro, snap) => (
                            <div
                              ref={pro.innerRef}
                              {...pro.draggableProps}
                              {...pro.dragHandleProps}
                              style={getItemStyle(snap.isDragging, pro.draggableProps.style)}
                              className={classNames(styles['droppable-draggable'])}
                            >
                              <div className={classNames(styles['droppable-draggable-supplier'])}>
                                <a
                                  onClick={() => handleSupplierDetail(item)}
                                  className={classNames(
                                    styles['droppable-draggable-supplier-name']
                                  )}
                                >
                                  {item.supplierCompanyName}
                                </a>
                                <span className={styles['droppable-draggable-supplier-icon']}>
                                  <ArrowRight />
                                </span>
                                <span
                                  className={classNames(
                                    styles['droppable-draggable-supplier-status']
                                  )}
                                >
                                  {renderOperateIcon(item)}
                                </span>
                              </div>
                              <span className={classNames(styles['droppable-draggable-link'])}>
                                {item.supplierCompanyNum}
                              </span>
                              {lifeCycleManageRemote.render(
                                'SSLM_LIFE_CYCLE_MANAGE_LANE_SUPPLIER',
                                null,
                                { item }
                              )}
                              <div className={classNames(styles['droppable-operation-link'])}>
                                {renderOperateLink(item)}
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))
                    )}
                  </div>
                  <div className={classNames(styles['droppable-bottom'])}>
                    {(stage?.stageLifeCycles.content || []).length === 0 ? (
                      <div style={{ height: 42 }} />
                    ) : (
                      <Pagination
                        showSizeChanger={false}
                        pageSize={defaultPageSize}
                        page={stage?.stageLifeCycles.number + 1}
                        total={stage?.stageLifeCycles.totalElements}
                        className={classNames(styles['droppable-pagination'])}
                        onChange={(current, pageSize) =>
                          handlePaginationChange(stage?.stageId, current, pageSize)
                        }
                      />
                    )}
                  </div>
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </DragDropContext>
    </div>
  );
};

export default LaneView;
