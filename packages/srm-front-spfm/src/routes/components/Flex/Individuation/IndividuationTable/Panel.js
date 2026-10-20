import React, { Component, Fragment } from 'react';
import { Table, Button, Icon, Card, Divider, Slider } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isEmpty, omit, isNumber, isUndefined } from 'lodash';
import { DndProvider, DragSource, DropTarget } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import intl from 'utils/intl';
import { DETAIL_CARD_CLASSNAME } from 'utils/constants';
import BodyRow from './BodyRow';
import ColumnTitleEditor from './ColumnTitleEditor';

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

// @DragDropContext(HTML5Backend)
export default class Panel extends Component {
  components = {
    body: {
      row: DragableBodyRow,
    },
  };

  @Bind()
  enableColumn(...rest) {
    const [record, selected] = rest;
    const { enableTableColumn } = this.props;
    enableTableColumn(record.dataIndex, selected);
  }

  /**
   * 拖拽列
   * @param {number} dragIndex 拖拽的这条数据在表格数据中的下标
   * @param {number} hoverIndex 推拽到的数据在表格数据中的下标
   */
  @Bind()
  moveRow(dragIndex, hoverIndex) {
    // const { tableData } = this.state;
    // const dragRow = tableData[dragIndex];
    const { onTableRowDragger = () => {} } = this.props;
    onTableRowDragger(dragIndex, hoverIndex);
    // 先删除拖动的那条数据，再在删除后的数组中的hoverIndex处插入拖动的那条数据
    // const newData = filter(tableData, (item, index) => index !== dragIndex);
    // newData.splice(hoverIndex, 0, dragRow);
    // this.props.onDrag(newData, this.props.direction);
  }

  render() {
    const {
      tableProps = {},
      TableComponent,
      assignTableConfig = () => {},
      tableConfigDataSource = {},
      setTableColumnTitle = () => {},
      changeColumnWidth = () => {},
      setColumnFixed = () => {},
      setAdaptedWidth = () => {},
    } = this.props;
    const defaultColumns = tableProps.columns || [];

    const flatTableConfigColumns = {};
    if (!isEmpty(tableConfigDataSource.uiTableConfLineList)) {
      tableConfigDataSource.uiTableConfLineList.forEach((n) => {
        flatTableConfigColumns[n.dataIndex] = n;
      });
    }
    const defaultTablePanelColumns = [
      {
        dataIndex: 'title',
        width: '85%',
        render: (text, { width, dataIndex }) => (
          <div>
            <ColumnTitleEditor
              value={text}
              onDescriptionChange={(value) => setTableColumnTitle(dataIndex, value.description)}
            />
            <Slider
              value={width}
              max={1156}
              min={!isNumber(width) ? 0 : 1}
              disabled={!isNumber(width)}
              onChange={(value) => changeColumnWidth(dataIndex, value)}
            />
          </div>
        ),
      },
      {
        key: 'action',
        align: 'right',
        render: (text, { dataIndex, fixed = null, width = null }) => {
          const iconDirection = fixed === 'left' ? 'right' : 'left';
          let actionBtns;
          if (['left', 'right'].indexOf(fixed) > -1) {
            actionBtns = (
              <React.Fragment>
                <Button
                  shape="circle"
                  icon="unlock"
                  style={{ marginRight: 8 }}
                  onClick={() => setColumnFixed(dataIndex)}
                />
                <Button
                  shape="circle"
                  icon={iconDirection}
                  onClick={() => setColumnFixed(dataIndex, iconDirection)}
                />
              </React.Fragment>
            );
          } else {
            actionBtns = (
              <React.Fragment>
                <Button
                  shape="circle"
                  icon="left"
                  style={{ marginRight: 8 }}
                  onClick={() => setColumnFixed(dataIndex, 'left')}
                />
                {
                  // !isFixed && (
                  <Button
                    shape="circle"
                    style={{ marginRight: 8 }}
                    icon={!isNumber(width) ? 'pushpin' : 'pushpin-o'}
                    onClick={() => setAdaptedWidth(dataIndex)}
                  />
                  // )
                }
                <Button
                  shape="circle"
                  icon="right"
                  onClick={() => setColumnFixed(dataIndex, 'right')}
                />
              </React.Fragment>
            );
          }

          return actionBtns;
        },
      },
    ];
    const cusTablePanelPropsMap = {
      leftFixedColumnsTableProps: {
        columns: defaultTablePanelColumns,
        dataSource: [],
      },
      middleColumnsTableProps: {
        columns: defaultTablePanelColumns,
        dataSource: [],
      },
      rightFixedColumnsTableProps: {
        columns: defaultTablePanelColumns,
        dataSource: [],
      },
    };

    defaultColumns.forEach((n) => {
      const itemConfig = flatTableConfigColumns[n.dataIndex] || {};
      const fixedType = (itemConfig.fixedType || '').toLowerCase();
      const item = {
        key: n.dataIndex,
        dataIndex: n.dataIndex,
        width: isUndefined(itemConfig.width) ? n.width : itemConfig.width,
        title: itemConfig.description || n.title,
        orderSeq: itemConfig.orderSeq,
      };
      if (['left', 'right'].indexOf(fixedType) > -1) {
        item.fixed = fixedType;
        cusTablePanelPropsMap[`${fixedType}FixedColumnsTableProps`].dataSource.push(item);
      } else {
        cusTablePanelPropsMap.middleColumnsTableProps.dataSource.push(item);
      }
    });

    const rowSelection = {
      selectedRowKeys: defaultColumns.reduce((collection = [], current) => {
        if ((flatTableConfigColumns[current.dataIndex] || {}).display === 1) {
          collection.push(current.dataIndex);
        }
        return collection;
      }, []),
      onSelect: this.enableColumn,
    };

    return (
      <Fragment>
        <Card
          bordered={false}
          className={DETAIL_CARD_CLASSNAME}
          // loading={queryListLoading}
          bodyStyle={{ paddingBottom: 12 }}
          title={
            <h4>{intl.get(`hpfm.individuationTable.view.title.preview`).d('自定义效果预览')}</h4>
          }
        >
          <div className="individuation-table-preview">
            <TableComponent
              {...assignTableConfig(omit(tableProps, ['dataSource']), tableConfigDataSource)}
            />
          </div>
          <div style={{ marginTop: 8 }}>
            <p>{intl.get(`hpfm.individuationTable.view.title.prompt`).d('提示:')}</p>
            <p>
              {intl
                .get(`hpfm.individuationTable.view.title.descrition01-a`)
                .d(`1、上下拖动可排序，点击 `)}
              <Icon type="left" />
              {` 、`}
              <Icon type="right" />
              {intl
                .get(`hpfm.individuationTable.view.title.descrition01-b`)
                .d(` 可将列固定在最左/最右，点击 `)}
              <Icon type="unlock" />
              {intl.get(`hpfm.individuationTable.view.title.cancel`).d(`可取消固定。`)}
            </p>
            <p>
              {intl.get(`hpfm.individuationTable.view.title.click`).d(`2、点击`)}{' '}
              <Icon type="pushpin-o" />{' '}
              {intl
                .get(`hpfm.individuationTable.view.title.autoCancel`)
                .d(`可将列的宽度设置为自动（均分剩余宽度）,再次点击取消自动。`)}
            </p>
          </div>
        </Card>
        <Divider style={{ marginTop: 0, marginBottom: 16 }} />
        <div style={{ maxHeight: '45vh', overflow: 'scroll' }}>
          <Card
            bordered={false}
            className={DETAIL_CARD_CLASSNAME}
            // loading={queryListLoading}
            bodyStyle={{ paddingBottom: 12 }}
            title={
              <h4>
                {intl.get(`hpfm.individuationTable.view.title.leftFixedColumns`).d('左固定列')}
              </h4>
            }
          >
            {isEmpty(cusTablePanelPropsMap.leftFixedColumnsTableProps.dataSource) ? (
              <span style={{ color: '#c5c5c5' }}>
                {intl.get(`hpfm.individuationTable.view.title.noFixedColumns`).d('暂无固定列')}
              </span>
            ) : (
              <DndProvider backend={HTML5Backend}>
                <Table
                  columns={cusTablePanelPropsMap.leftFixedColumnsTableProps.columns}
                  dataSource={cusTablePanelPropsMap.leftFixedColumnsTableProps.dataSource.sort(
                    (a, b) => a.orderSeq - b.orderSeq
                  )}
                  pagination={false}
                  showHeader={false}
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
          </Card>
          <Card
            bordered={false}
            className={DETAIL_CARD_CLASSNAME}
            // loading={queryListLoading}
            bodyStyle={{ paddingBottom: 12 }}
            title={
              <h4>{intl.get(`hpfm.individuationTable.view.title.middleColumns`).d('中间列')}</h4>
            }
          >
            <DndProvider backend={HTML5Backend}>
              <Table
                columns={cusTablePanelPropsMap.middleColumnsTableProps.columns}
                dataSource={cusTablePanelPropsMap.middleColumnsTableProps.dataSource.sort(
                  (a, b) => a.orderSeq - b.orderSeq
                )}
                pagination={false}
                style={{ marginBottom: '20px' }}
                rowKey="dataIndex"
                showHeader={false}
                rowSelection={rowSelection}
                components={this.components}
                onRow={(record, index) => ({
                  index,
                  moveRow: this.moveRow,
                })}
              />
            </DndProvider>
          </Card>
          <Card
            bordered={false}
            className={DETAIL_CARD_CLASSNAME}
            // loading={queryListLoading}
            bodyStyle={{ paddingBottom: 12 }}
            title={
              <h4>
                {intl.get(`hpfm.individuationTable.view.title.rightFixedColumns`).d('右固定列')}
              </h4>
            }
          >
            {isEmpty(cusTablePanelPropsMap.rightFixedColumnsTableProps.dataSource) ? (
              <span style={{ color: '#c5c5c5' }}>
                {intl.get(`hpfm.individuationTable.view.title.noFixedColumns`).d('暂无固定列')}
              </span>
            ) : (
              <DndProvider backend={HTML5Backend}>
                <Table
                  columns={cusTablePanelPropsMap.rightFixedColumnsTableProps.columns}
                  dataSource={cusTablePanelPropsMap.rightFixedColumnsTableProps.dataSource.sort(
                    (a, b) => a.orderSeq - b.orderSeq
                  )}
                  pagination={false}
                  showHeader={false}
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
          </Card>
        </div>
      </Fragment>
    );
  }
}
