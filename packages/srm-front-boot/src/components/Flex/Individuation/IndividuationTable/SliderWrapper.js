import React, { Component } from 'react';
import { Button, Slider, Table } from 'hzero-ui';
import { filter, xor } from 'lodash';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { DndProvider, DragSource, DropTarget } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import BodyRow from './BodyRow';

// 拖拽相关
const rowSource = {
  beginDrag(props) {
    return {
      index: props.index,
    };
  },
};

const rowTarget = {
  drop(props, monitor) {
    const dragIndex = monitor.getItem().index;
    const hoverIndex = props.index;

    // Don't replace items with themselves
    if (dragIndex === hoverIndex) {
      return;
    }

    // Time to actually perform the action
    props.moveRow(dragIndex, hoverIndex);

    // Note: we're mutating the monitor item here!
    // Generally it's better to avoid mutations,
    // but it's good here for the sake of performance
    // to avoid expensive index searches.
    //  eslint-disable-next-line
    monitor.getItem().index = hoverIndex;
  },
};

const DragableBodyRow = DropTarget('row', rowTarget, (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver(),
  sourceClientOffset: monitor.getSourceClientOffset(),
}))(
  DragSource('row', rowSource, (connect, monitor) => ({
    connectDragSource: connect.dragSource(),
    dragRow: monitor.getItem(),
    clientOffset: monitor.getClientOffset(),
    initialClientOffset: monitor.getInitialClientOffset(),
  }))(BodyRow)
);

/**
 * 动态表格配置-列属性配置
 * @extends {Component} - React.Component
 * @reactProps {string} direction - 表格中列的固定方向
 * @reactProps {Array} tableData - 表数据
 * @reactProps {Function} onChangeColWidth - 改变当前列宽度
 * @reactProps {Function} onFixed - 固定列
 * @reactProps {Function} onCancelFixed - 取消固定
 * @reactProps {Function} onChangeColVisibility - 显示或隐藏当前列
 * @reactProps {Function} onAdaptCol - 列宽自适应
 * @reactProps {Function} onCancelAdaptCol - 取消列宽自适应
 * @reactProps {Function} onDrag - 拖拽列
 * @return React.element
 */
// @DragDropContext(HTML5Backend)
export default class SliderWrapper extends Component {
  constructor(props) {
    super(props);
    const { tableData } = props;
    const totalRowKeys = [];
    const selectedRowKeys = [];
    if (tableData.length) {
      tableData.forEach(item => totalRowKeys.push(item.dataIndex));
      tableData.forEach(item => {
        if (item.display) {
          selectedRowKeys.push(item.dataIndex);
        }
      });
    }
    this.state = {
      tableData,
      selectedRowKeys,
      totalRowKeys,
    };
  }

  components = {
    body: {
      row: DragableBodyRow,
    },
  };

  // eslint-disable-next-line camelcase
  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.tableData !== this.props.tableData) {
      const { tableData } = nextProps;
      this.updateData(tableData);
    }
  }

  /**
   * 更新表格数据
   * @param {Object[]} tableData 表格数据
   */
  @Bind()
  updateData(tableData = []) {
    const selectedRowKeys = [];
    const totalRowKeys = [];
    if (tableData.length) {
      tableData.forEach(item => totalRowKeys.push(item.dataIndex));
      tableData.forEach(item => {
        if (item.display === true) {
          selectedRowKeys.push(item.dataIndex);
        }
      });
    }
    this.setState({
      totalRowKeys,
      tableData,
      selectedRowKeys,
    });
  }

  /**
   * 改变当前列宽度
   * @param {string} dataIndex - 表格列dataIndex
   * @param {number} width - 改变后的宽度值
   */
  @Bind()
  handleChangeWidth(dataIndex, width) {
    this.props.onChangeColWidth(dataIndex, width);
  }

  /**
   * 固定列
   * @param {string} dataIndex - 表格列dataIndex
   * @param {string} position - 固定方向
   */
  @Bind()
  handleFixed(dataIndex, position) {
    this.props.onFixed(dataIndex, position);
  }

  /**
   * 取消固定
   * @param {string} dataIndex 表格列dataIndex
   */
  @Bind()
  handleCancelFixed(dataIndex) {
    this.props.onCancelFixed(dataIndex);
  }

  /**
   * 显示或隐藏当前列
   * @param {string[]} selectedRowKeys - 所有显示的列的dataIndex集合
   */
  @Bind()
  handleChangeRowKeys(selectedRowKeys) {
    const { totalRowKeys } = this.state;
    const hiddenKey = xor(totalRowKeys, selectedRowKeys);
    this.props.onChangeColVisibility(hiddenKey, selectedRowKeys);
  }

  /**
   * 列宽自适应
   * @param {string} dataIndex 表格列dataIndex
   */
  @Bind()
  handleAdptedCol(dataIndex) {
    this.props.onAdaptCol(dataIndex);
  }

  /**
   * 取消列宽自适应
   * @param {string} dataIndex 表格列dataIndex
   */
  @Bind
  handleCancelAdapted(dataIndex) {
    this.props.onCancelAdaptCol(dataIndex);
  }

  /**
   * 拖拽列
   * @param {number} dragIndex 拖拽的这条数据在表格数据中的下标
   * @param {number} hoverIndex 推拽到的数据在表格数据中的下标
   */
  @Bind()
  moveRow(dragIndex, hoverIndex) {
    const { tableData } = this.state;
    const dragRow = tableData[dragIndex];
    // 先删除拖动的那条数据，再在删除后的数组中的hoverIndex处插入拖动的那条数据
    const newData = filter(tableData, (item, index) => index !== dragIndex);
    newData.splice(hoverIndex, 0, dragRow);
    this.props.onDrag(newData, this.props.direction);
  }

  render() {
    const { tableData, selectedRowKeys } = this.state;
    const { fixedPosition = null, isFixed = null } = this.props;
    const columns = [
      {
        dataIndex: 'title',
        width: '85%',
        render: (text, { width, dataIndex }) => (
          <div>
            <span>{text}</span>
            {width && (
              <Slider
                value={width}
                max={1156}
                min={1}
                onChange={this.handleChangeWidth.bind(this, dataIndex)}
              />
            )}
            {!width && <Slider value={width} max={1156} min={1} disabled />}
          </div>
        ),
      },
      {
        key: 'action',
        align: 'right',
        render: (text, { dataIndex, fixed = null, width = null }) => {
          const iconDirection = fixed === 'left' ? 'right' : 'left';
          let actionBtns;
          if (fixed) {
            actionBtns = (
              <React.Fragment>
                <Button
                  shape="circle"
                  icon="unlock"
                  onClick={() => this.handleCancelFixed(dataIndex)}
                />
                <Button
                  shape="circle"
                  icon={iconDirection}
                  onClick={() => this.handleFixed(dataIndex, iconDirection)}
                />
              </React.Fragment>
            );
          } else {
            actionBtns = (
              <React.Fragment>
                <Button
                  shape="circle"
                  icon="left"
                  onClick={() => this.handleFixed(dataIndex, 'left')}
                />
                {!isFixed && (
                  <Button
                    shape="circle"
                    icon={!width ? 'pushpin' : 'pushpin-o'}
                    onClick={
                      width
                        ? this.handleAdptedCol.bind(this, dataIndex)
                        : this.handleCancelAdapted.bind(this, dataIndex)
                    }
                  />
                )}
                <Button
                  shape="circle"
                  icon="right"
                  onClick={() => this.handleFixed(dataIndex, 'right')}
                />
              </React.Fragment>
            );
          }

          return actionBtns;
        },
      },
    ];

    const rowSelection = {
      selectedRowKeys,
      onChange: this.handleChangeRowKeys,
    };

    return (
      <div>
        {fixedPosition && (
          <div className="custom-table-title">
            {fixedPosition === 'left'
              ? intl.get('hpfm.individuationTable.view.position.left').d('左固定')
              : intl.get('hpfm.individuationTable.view.position.right').d('右固定')}
          </div>
        )}
        {!fixedPosition && (
          <div className="custom-table-title">
            {intl.get('hpfm.individuationTable.view.title.middleColumns').d('中间列')}
          </div>
        )}
        {!!tableData.length && (
          <DndProvider backend={HTML5Backend}>
            <Table
              columns={columns}
              dataSource={tableData}
              pagination={false}
              style={{ marginBottom: '20px' }}
              rowKey="dataIndex"
              rowSelection={rowSelection}
              components={this.components}
              onRow={(record, index) => ({
                index,
                moveRow: this.moveRow,
              })}
            />
          </DndProvider>
        )}
        {!tableData.length && (
          <p>{intl.get('hpfm.individuationTable.view.title.nothing').d('暂时还没有列')}</p>
        )}
      </div>
    );
  }
}
