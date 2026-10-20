import React from 'react';
import intl from 'utils/intl';
import { observer } from 'mobx-react-lite';
import formatterCollections from 'utils/intl/formatterCollections';
import { Lov, Form, TextField, Select, Icon, IntlField } from 'choerodon-ui/pro';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

import styles from './index.less';

function DragButtonForm(props) {
  const {
    readOnly = false,
    buttonFields = [],
    cardButtonEditDataSet,
    deleteButtonField = () => {},
    setButtonField = () => {},
  } = props;

  const colorMap = {
    1: 'primary',
    2: 'info',
    3: 'plain',
  };

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
    const arr = Array.from(buttonFields);
    const [remove] = arr.splice(source.index, 1);
    arr.splice(destination.index, 0, remove);
    const [removeRecord] = cardButtonEditDataSet.splice(source.index, 1);
    cardButtonEditDataSet.splice(destination.index, 0, removeRecord);
    setButtonField(arr);
  };

  /**
   * 设置样式
   * @param {*} isDragging
   * @param {*} draggableStyle
   * @returns
   */
  const getItemStyle = (isDragging, draggableStyle) => ({
    position: 'relative',
    paddingTop: '8px',
    ...draggableStyle,
  });

  /**
   * 张开/收起
   * @param {*} record
   */
  const toggleCollect = (record) => {
    const oldValue = record.getState('collect') || false;
    record.setState('collect', !oldValue);
  };

  /**
   * 下拉自定义渲染
   * @param {} param0
   * @returns
   */
  const optionRenderer = ({ text, value }) => (
    <div className="select-render-item">
      <span className={`select-render-item-txt select-render-item-${colorMap[value]}`}>{text}</span>
    </div>
  );

  /**
   * 渲染字段
   * @param {} prop
   * @returns
   */
  const RenderField = (prop) => {
    const { fieldName } = prop;
    if (fieldName === 'buttonName') {
      return <IntlField style={{ width: '100%' }} name={fieldName} />;
    } else if (fieldName === 'buttonStyle') {
      return (
        <Select
          name={fieldName}
          style={{ width: '100%' }}
          defaultActiveFirstOption={false}
          dropdownMatchSelectWidth={false}
          optionRenderer={optionRenderer}
        />
      );
    } else if (fieldName === 'buttonUrl') {
      return <TextField style={{ width: '100%' }} name={fieldName} />;
    } else {
      return <Lov style={{ width: '100%' }} name={fieldName} />;
    }
  };

  /**
   *
   * @returns 按钮组
   */
  const ButtonItem = observer((prop) => {
    const { buttonItem = [], dataIndex = 0, record = {} } = prop;
    return (
      <div className={styles['edit-buton-form']}>
        {!readOnly && <Icon type="baseline-drag_indicator" className="edit-button-form-drag" />}
        <div className="edit-buton-form-head">
          <div className="edit-buton-form-head-left" onClick={() => toggleCollect(record)}>
            #{buttonItem.index}{' '}
            <Icon
              type={record.getState('collect') ? 'arrow_drop_up' : 'arrow_drop_down'}
              className="direction-icon"
            />
          </div>
          {!readOnly && (
            <Icon type="delete" className="del-icon" onClick={() => deleteButtonField(dataIndex)} />
          )}
        </div>
        <Form record={record} disabled={readOnly} columns={1} labelLayout="float" useColon={false}>
          {buttonItem.name
            .filter((_, index) => (record.getState('collect') ? index < 1 : true))
            .map((field) => (
              <RenderField fieldName={field} />
            ))}
        </Form>
      </div>
    );
  });

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div style={{ marginTop: '18px', padding: '0 20px' }}>
        <div className={styles['field-title-tag']}>
          {intl.get('smbl.purchaseRobotConfig.view.button.feildTitle').d('按钮')}
        </div>
        <Droppable droppableId="butonDroppable">
          {(provideds) => (
            <div {...provideds.droppableProps} ref={provideds.innerRef}>
              {buttonFields.map((item, index) => (
                <Draggable
                  isDragDisabled={readOnly}
                  draggableId={item.id}
                  index={index}
                  key={item.id}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={getItemStyle(snapshot.isDragging, provided.draggableProps.style)}
                    >
                      <ButtonItem
                        buttonItem={item}
                        dataIndex={index}
                        record={cardButtonEditDataSet.records[index]}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
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
})(DragButtonForm);
