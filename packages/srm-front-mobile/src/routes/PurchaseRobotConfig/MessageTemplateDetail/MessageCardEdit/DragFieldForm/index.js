import React from 'react';
import intl from 'utils/intl';
import { Form, Icon, Output, TextField } from 'choerodon-ui/pro';
import formatterCollections from 'utils/intl/formatterCollections';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

import './index.less';

function DragFieldForm(props) {
  const {
    fields = [],
    readOnly = false,
    cardEditDataSet = {},
    setFields = () => {},
    deleteField = () => {},
  } = props;

  /**
   * 拖拽结束回调
   * @param {*} result
   * @returns
   */
  const onDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination || source?.index === destination?.index) {
      return;
    }
    const arr = Array.from(fields);
    const [remove] = arr.splice(source.index, 1);
    arr.splice(destination.index, 0, remove);
    setFields(arr);
  };

  /**
   * 设置样式
   * @param {*} isDragging
   * @param {*} draggableStyle
   * @returns
   */
  const getItemStyle = (isDragging, draggableStyle) => ({
    position: 'relative',
    ...draggableStyle,
  });

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div style={{ marginTop: '18px' }}>
        <div className="field-title-tag">
          {intl.get('smbl.purchaseRobotConfig.view.field.feildTitle').d('字段')}
        </div>
        <Droppable droppableId="droppable">
          {(provideds) => (
            <div {...provideds.droppableProps} ref={provideds.innerRef}>
              <Form
                dataSet={cardEditDataSet}
                columns={1}
                labelLayout={readOnly ? 'vertical' : 'float'}
                className={readOnly ? 'c7n-pro-vertical-form-display' : ''}
                useColon={false}
              >
                <div>
                  {fields.map((field, index) =>
                    field.type === 'object' ? (
                      <Draggable
                        isDragDisabled={readOnly}
                        draggableId={field.name}
                        index={index}
                        key={field.name}
                      >
                        {(provided, snapshot) => (
                          <div
                            className="field-item"
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={getItemStyle(snapshot.isDragging, provided.draggableProps.style)}
                          >
                            {!readOnly && (
                              <div className="edit-button-form-drag-container">
                                <Icon
                                  type="baseline-drag_indicator"
                                  className="edit-button-form-drag"
                                />
                              </div>
                            )}
                            {!readOnly ? (
                              // <Lov style={{ width: '100%' }} name={field.name} />
                              <div className="drag-field-cards">
                                <div className="drag-field-card">
                                  <TextField
                                    style={{ width: '100%' }}
                                    name={`${field.name}_fieldCode`}
                                  />
                                </div>
                                <div className="drag-field-card">
                                  <TextField
                                    style={{ width: '100%' }}
                                    name={`${field.name}_fieldName`}
                                  />
                                </div>
                              </div>
                            ) : (
                              <div style={{ width: '100%' }}>
                                <Output
                                  style={{ width: '100%' }}
                                  name={`${field.name}_fieldCode`}
                                />
                                <Output
                                  style={{ width: '100%' }}
                                  name={`${field.name}_fieldName`}
                                />
                              </div>
                              // <Output style={{ width: '100%' }} name={field.name} />
                            )}

                            {!readOnly && (
                              <div className="del-icon-container">
                                <Icon
                                  type="delete"
                                  className="del-icon"
                                  onClick={() => deleteField(field)}
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ) : null
                  )}
                </div>
              </Form>
              {provideds.placeholder}
            </div>
          )}
        </Droppable>
      </div>
    </DragDropContext>
  );
}

export default formatterCollections({
  code: ['smbl.purchaseRobotConfig'],
})(DragFieldForm);
