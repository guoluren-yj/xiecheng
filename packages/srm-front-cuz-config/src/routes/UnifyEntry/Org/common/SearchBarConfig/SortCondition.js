/* eslint-disable react/no-unused-state */
/* eslint-disable no-shadow */
/* eslint-disable react/no-unknown-property */
import React, { Component } from 'react';
import { Select, Button } from 'choerodon-ui/pro';
import { Icon } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';
import { isEmpty } from 'lodash';

import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

import intl from 'utils/intl';
import { getSortUpIcon, getSortDownIcon } from '../../../../../utils/util';
import styles from './index.less';

const SORT_MODE = {
  SINGLE: 'single',
  MULTIPLE: 'multiple',
};

export default class SortCondition extends Component {
  constructor(props) {
    super(props);
    this.state = {
      multConditions: !isEmpty(props.multConditions) ? props.multConditions : [{ id: 1 }],
      mode: props.mode || SORT_MODE.SINGLE,
    };
  }

  @Bind()
  onDragEnd({ source, destination }) {
    if (!destination || !source || !destination) {
      return;
    }
    if (source.index === destination.index) {
      return;
    }
    const { multConditions } = this.state;
    const newMultConditions = [];
    multConditions.forEach((condition, index) => {
      if (index === source.index) {
        newMultConditions.push(multConditions[destination.index]);
      } else if (index === destination.index) {
        newMultConditions.push(multConditions[source.index]);
      } else {
        newMultConditions.push(condition);
      }
    });
    this.setState({
      multConditions: newMultConditions,
    });
  }

  @Bind()
  handleMultipleConditionSortBy(condition) {
    // eslint-disable-next-line no-param-reassign
    condition.fieldSortBy = condition.fieldSortBy === 'desc' ? 'asc' : 'desc';
    this.setState({
      multConditions: this.state.multConditions.map((c) => (c.id === condition.id ? condition : c)),
    });
  }

  @Bind()
  getSortableFields(fields) {
    if (!fields || fields.length < 1) {
      return [];
    }
    return fields
      .filter((field) => {
        const { custType, unitSortedFlag, sortedFlag } = field.get([
          'custType',
          'unitSortedFlag',
          'sortedFlag',
        ]);
        // 标准字段
        if (custType === 'STD') {
          return unitSortedFlag !== 0 && sortedFlag !== 0;
        } else {
          return sortedFlag === 1;
        }
      })
      .map((i) => i.toData());
  }

  @Bind()
  getSelectFields(condition) {
    const { multConditions } = this.state;
    const { originFields = [] } = this.props;
    const fields = this.getSortableFields(originFields);
    let filterFieldCodes = multConditions.map((i) => i.fieldCode);
    if (condition.fieldCode) {
      filterFieldCodes = filterFieldCodes.filter((i) => i !== condition.fieldCode);
    }
    return fields.filter((i) => !filterFieldCodes.includes(i.fieldAlias));
  }

  @Bind()
  handleMultipleConditionFieldChange(value, condition) {
    const { originFields = [] } = this.props;
    const fields = this.getSortableFields(originFields);
    // eslint-disable-next-line no-param-reassign
    condition.fieldCode = value;
    // eslint-disable-next-line no-param-reassign
    condition.fieldName = (fields.find((f) => f.fieldAlias === value) || {}).fieldName;
    this.setState({
      mode: SORT_MODE.MULTIPLE,
      multConditions: this.state.multConditions.map((c) => (c.id === condition.id ? condition : c)),
    });
  }

  @Bind()
  handleChangePopverVisible(visible) {
    if (!visible) {
      setTimeout(() => {
        this.handleMultpleQuery();
      }, 0);
    }
  }

  @Bind()
  handleAddCondition() {
    const { multConditions } = this.state;
    let maxId = multConditions[0].id;
    multConditions.forEach((condition) => {
      if (maxId < condition.id) {
        maxId = condition.id;
      }
    });
    this.setState({
      multConditions: multConditions.concat({ id: maxId + 1 }),
    });
  }

  @Bind()
  handleRemoveCondition(condition) {
    const { id: conditionId } = condition;
    const { multConditions } = this.state;
    let neMultConditions = multConditions.filter((condition) => condition.id !== conditionId);
    if (neMultConditions.length === 0) {
      neMultConditions = [{ id: 1 }];
    }
    this.setState({
      multConditions: neMultConditions,
    });
  }

  render() {
    const { multConditions } = this.state;
    const { unitInfo = {} } = this.props;
    const { orderCount = 1 } = unitInfo;
    return (
      <div className={styles['sort-multi']} onClick={(event) => event.stopPropagation()}>
        <div className={styles['sort-multi-title']}>
          {intl.get('hpfm.searchBar.view.label.multiConditionSorting').d('多条件排序')}
        </div>
        <DragDropContext onDragEnd={this.onDragEnd}>
          <div className={styles['sort-list']}>
            <Droppable droppableId="droppable">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {multConditions.map((condition, index) => (
                    <Draggable key={condition.id} draggableId={String(condition.id)} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          key={condition.id}
                        >
                          <div className={styles['sort-list-item']}>
                            <span className={styles['sort-list-item-drag-icon']}>
                              <Icon
                                type="baseline-drag_indicator"
                                {...provided.dragHandleProps}
                                style={{ cursor: 'move' }}
                              />
                            </span>
                            <span className={styles['sort-list-item-select']}>
                              <Select
                                clearButton={false}
                                value={condition.fieldCode}
                                onChange={(value) =>
                                  this.handleMultipleConditionFieldChange(value, condition)
                                }
                              >
                                {this.getSelectFields(condition).map((item) => (
                                  <Select.Option
                                    value={item.fieldAlias}
                                    className={styles['sort-menu-item']}
                                  >
                                    {item.fieldName}
                                  </Select.Option>
                                ))}
                              </Select>
                            </span>
                            <span
                              className={styles['sort-list-item-sort-icon']}
                              onClick={() => this.handleMultipleConditionSortBy(condition)}
                            >
                              {condition.fieldSortBy === 'desc'
                                ? getSortDownIcon(18)
                                : getSortUpIcon(18)}
                            </span>
                            <span className={styles['sort-list-item-close-icon']}>
                              <Icon
                                type="close"
                                onClick={() => this.handleRemoveCondition(condition)}
                              />
                            </span>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        </DragDropContext>
        <Button
          funcType="link"
          color="primary"
          disabled={multConditions.length === orderCount}
          className={styles['sort-add']}
          onClick={this.handleAddCondition}
        >
          <Icon type="add" />
          <span className={styles['sort-add-text']}>
            {intl.get('hpfm.searchBar.view.label.addCondition').d('添加排序')}
          </span>
          <span>
            {multConditions.length}/{orderCount}
          </span>
        </Button>
      </div>
    );
  }
}
