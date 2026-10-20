/**
 * DynamicTable - 动态配置表格
 * @date: 2019-4-11
 * @author: hulingfangzi <lingfangzi.hu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component, Fragment } from 'react';
import { Button, Col, Icon, Modal, Row, Table } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isEmpty, omit } from 'lodash';
import classNames from 'classnames';
import { getCurrentUserId, getResponse, tableScrollWidth } from 'utils/utils';
import notification from 'utils/notification';
import intl from 'utils/intl';
import {
  deleteTableConfig,
  getCurrentTableConfig,
  getUiTablesByScope,
  saveCurrentTableConfig,
} from '../utils';
import SliderWrapper from './SliderWrapper';
import ColumnTitleEditor from './ColumnTitleEditor';
import style from './index.less';

/**
 * @extends {Component} - React.Component
 * @reactProps {any} otherProps - 表格其他属性
 * @reactProps {string} tableKey - 表格标识key，建议取路由，如"scec-platform-banner-list",确保唯一性
 * @reactProps {func} onChangeColumns - 更新表格列配置的方法
 * @return React.element
 * @example
 * 组件提供删除配置信息的功能，可还原代码配置的columns
 */
export default class IndividuationTable extends Component {
  state = this.getInitialState();

  @Bind()
  getInitialState() {
    return {
      isShowConfigModal: false, // 是否显示配置模态框
      tableConfId: null, // 表格配置ID，只有配置过的表格才有该值
      objectVersionNumber: null,
      totalColumns: [], // 处理成个性化表格需要的数据
      tableColumns: [], // 页面上表格显示的列
      loading: false,
      deleteLoading: false,
    };
  }

  getSnapshotBeforeUpdate(prevProps) {
    const { visible } = this.props;
    return visible && visible !== prevProps.visible;
  }

  componentDidUpdate(...rest) {
    const snapshot = rest[2];
    if (snapshot) {
      this.handleGetConfig();
    }
  }

  // componentWillMount() {
  //   this.handleGetConfig();
  // }

  /**
   * 显示表格配置弹窗
   */
  @Bind()
  handleOpenConfigModal() {
    this.handleGetConfig();
    // this.setState({
    //   isShowConfigModal: true,
    // });
  }

  /**
   * 初始化UI表格配置所需的数据
   */
  @Bind()
  initTableConfig() {
    const { columns } = this.props;
    const totalColumns = columns.map(({ title, width, dataIndex, fixed, display, key }) => ({
      width,
      title,
      dataIndex: dataIndex || key || 'action',
      fixed,
      display: display !== false,
    }));
    this.setState({
      totalColumns, // 处理成个性化表格需要的数据
      tableConfId: null, // 表格配置ID，只有配置过的表格才有该值
      objectVersionNumber: null,
    });
  }

  /**
   * 获取当前表格的个性化配置
   */
  @Bind()
  handleGetConfig() {
    const { tableKey, permissionLevelKey } = this.props;
    let uiTableKeys = [];
    let flag = false;
    // 获取所有已配置的表格头信息
    return getUiTablesByScope(permissionLevelKey).then(res => {
      if (getResponse(res)) {
        uiTableKeys = res;
        if (uiTableKeys.length) {
          const targetTable = uiTableKeys.find(item => item.tableKey === tableKey);
          if (!isEmpty(targetTable)) {
            // 如果配置数组中包含当前tableKey,则先判断本地是否有该表格的最新配置，没有就查询，否则下一步
            const { tableConfId } = targetTable;
            this.setState({ tableConfId });
            // 判断本地是否有该表格的最新配置时，先判断本地是否有配置对象，
            // 没有就查询，否则下一步
            const localTableConfig = localStorage.getItem('tableConfig');
            if (localTableConfig) {
              // 如果本地有配置对象，在不为空的情况下，找到该表格的配置，否则查询
              const parsedLocalTableConfig = JSON.parse(localTableConfig);
              if (!isEmpty(parsedLocalTableConfig)) {
                const targetLocalTableConfig = JSON.parse(localTableConfig)[tableKey];
                if (!isEmpty(targetLocalTableConfig) && !isEmpty(targetLocalTableConfig.columns)) {
                  // 找到本地对应表格配置后，查看本地配置的时间戳和后台存的是否一致，不一致则查询，否则下一步。
                  if (targetLocalTableConfig.lastUpdateTime === targetTable.lastUpdateTime) {
                    const localColumns = targetLocalTableConfig.columns;
                    this.setState({
                      objectVersionNumber: targetLocalTableConfig.objectVersionNumber,
                    });
                    // 一致则将本地配置与当前表格代码中的配置合并
                    flag = true;
                    this.handleChangeTableColumns(localColumns);
                  }
                } else {
                  flag = true;
                  this.initTableConfig();
                }
              }
            }
            if (!flag) {
              this.getConfigDetail(tableConfId);
            }
          } else {
            this.initTableConfig();
          }
        } else {
          this.initTableConfig();
        }
      }
    });
  }

  /**
   * 获取后台表格配置详情并保存至本地
   * @param {number} tableConfId - 配置过的UI表格的ID
   */
  @Bind()
  getConfigDetail(tableConfId) {
    return getCurrentTableConfig(tableConfId).then(res => {
      if (getResponse(res)) {
        let tableConfiguration;
        const filteredColumns = res.uiTableConfLineList.map(
          ({
            dataIndex,
            display,
            fixedType,
            width,
            tableConfLineId,
            objectVersionNumber,
            description,
          }) => {
            const column = {
              dataIndex,
              display: display === 1,
              width,
              tableConfLineId,
              objectVersionNumber,
              description,
            };
            if (fixedType !== 'NONE') {
              column.fixed = fixedType.toLowerCase();
            }
            return column;
          }
        );
        // this.handleHeaderTableChange(filteredColumns);
        this.setState({ objectVersionNumber: res.objectVersionNumber });

        const newTableConfig = {
          objectVersionNumber: res.objectVersionNumber,
          lastUpdateTime: res.lastUpdateTime,
          columns: filteredColumns,
        };

        if (localStorage.getItem('tableConfig')) {
          tableConfiguration = JSON.parse(localStorage.getItem('tableConfig'));
          tableConfiguration[res.tableKey] = newTableConfig;
        } else {
          tableConfiguration = {
            [res.tableKey]: newTableConfig,
          };
        }
        localStorage.setItem('tableConfig', JSON.stringify(tableConfiguration));
        // TODO 可以考虑改为模态框显示才调用
        this.handleChangeTableColumns(newTableConfig.columns);
      }
    });
  }

  /**
   * 改变页面表格列配置
   * @param {Object[]} newTableColumns - 表格的最新列配置
   */
  @Bind()
  handleChangeTableColumns(newTableColumns) {
    this.handleHeaderTableChange(newTableColumns);
    const { columns } = this.props;
    // 过滤出要显示的列，之后删除它们的display属性
    const displayColumns = newTableColumns.filter(item => item.display);
    // 将每一列原来未变的属性与新的属性合并
    const mergedNewColumns = displayColumns.map(item => {
      const tempItem = { ...item };
      const targetItem = columns.find(col => col.dataIndex === tempItem.dataIndex);
      if (!isEmpty(targetItem) && 'fixed' in targetItem) {
        delete targetItem.fixed;
      }
      const finalItem = {
        ...targetItem,
        ...tempItem,
        title: tempItem.description || targetItem.title,
      };
      return finalItem;
    });
    this.setState({ tableColumns: mergedNewColumns });
  }

  /**
   * 修改组件头部展示表格
   * @param {object} newTableColumns - 表表格的最新列配置
   */
  @Bind()
  handleHeaderTableChange(newTableColumns) {
    const { columns } = this.props;
    const newTotalColumns = newTableColumns.map(item => {
      const tempItem = { ...item };
      const targetItem = columns.find(col => col.dataIndex === item.dataIndex);
      if (!isEmpty(targetItem) && 'fixed' in targetItem) {
        delete targetItem.fixed;
      }
      const finalItem = {
        ...targetItem,
        ...tempItem,
      };
      return finalItem;
    });

    const totalUiTableColumns = newTotalColumns.map(
      ({
        title,
        width,
        dataIndex,
        fixed,
        display,
        tableConfLineId,
        objectVersionNumber,
        description,
      }) => ({
        width,
        title: description || title,
        dataIndex,
        fixed,
        display,
        tableConfLineId,
        objectVersionNumber,
      })
    );
    this.setState({
      totalColumns: totalUiTableColumns,
    });
  }

  /**
   * 关闭表格配置弹窗
   */
  @Bind()
  handleCloseModal() {
    // const initState = this.getInitialState();
    // const { tableColumns } = this.state;
    // this.setState({
    //   ...initState,
    //   tableColumns,
    // });
    const { cancel = () => {} } = this.props;
    // this.setState({
    //   isShowConfigModal: false,
    // });
    cancel();
  }

  /**
   * 保存表格配置
   */
  @Bind()
  handleSubmitTableConfig() {
    this.setState({ loading: true });
    const { totalColumns, tableConfId } = this.state;
    const { tableKey, permissionLevelKey } = this.props;
    const currentColumns = [...totalColumns];
    const uiTableConfLineList = currentColumns.map(
      (
        { dataIndex, display, fixed, width, tableConfLineId, objectVersionNumber, description },
        index
      ) => {
        const currentItem = {
          dataIndex,
          display: display ? 1 : 0,
          fixedType: fixed ? (fixed === 'true' ? 'LEFT' : fixed.toUpperCase()) : 'NONE',
          orderSeq: index,
          remark: '',
          uiTableConfExtraList: [],
          width,
          tableConfLineId,
          objectVersionNumber,
          description,
        };
        if (tableConfId) {
          currentItem.tableConfId = tableConfId;
        }
        return currentItem;
      }
    );
    const showColumns = totalColumns.filter(column => column.display || !('display' in column));
    const isHasFixedCol = uiTableConfLineList.some(item => item.fixedType !== 'NONE');
    const tableConfig = {
      fixedType: isHasFixedCol ? 'LEFT' : 'NONE',
      remark: '',
      scrollx: tableScrollWidth(showColumns),
      scrolly: 0,
      sourceId: getCurrentUserId(),
      sourceType: 'USER',
      tableKey,
      uiTableConfLineList,
    };

    if (this.state.objectVersionNumber) {
      tableConfig.objectVersionNumber = this.state.objectVersionNumber;
    }

    if (tableConfId) {
      tableConfig.tableConfId = tableConfId;
    }

    return saveCurrentTableConfig(tableConfig, permissionLevelKey).then(res => {
      if (getResponse(res)) {
        notification.success();
        this.setState(
          {
            objectVersionNumber: res.objectVersionNumber,
            tableConfId: res.tableConfId,
          },
          () => {
            this.handleSaveConfigInLocal(res);
          }
        );
      } else {
        this.setState({ loading: false });
      }
    });
  }

  /**
   * 保存表格配置到本地
   * @param {Object[]} uiTableConfLineList 表格列的配置
   * @param {string} tableKey 表格的key
   * @param {string} lastUpdateTime 配置保存至后台时的时间戳
   */
  handleSaveConfigInLocal = ({ uiTableConfLineList, tableKey, tableConfId, lastUpdateTime }) => {
    // 选择响应结果中的部分需要的内容，再保存至本地
    let filteredColList = [...uiTableConfLineList]; // 这里后端命名不规范，应该是列的配置
    filteredColList = filteredColList.map(
      ({ dataIndex, display, fixedType, width, tableConfLineId, objectVersionNumber }) => {
        const colConf = {
          dataIndex,
          width,
          tableConfLineId,
          objectVersionNumber,
          display: display === 1,
        };
        if (fixedType !== 'NONE') {
          colConf.fixed = fixedType.toLowerCase();
        }
        return colConf;
      }
    );

    const localTableConfig = {
      lastUpdateTime,
      objectVersionNumber: this.state.objectVersionNumber,
      columns: filteredColList,
      tableConfId,
    };
    let tableConfig;
    // 判断本地是否有该表格的配置，有则替换，无则添加
    if (localStorage.getItem('tableConfig')) {
      tableConfig = JSON.parse(localStorage.getItem('tableConfig'));
      tableConfig[tableKey] = localTableConfig;
    } else {
      tableConfig = {
        [tableKey]: localTableConfig,
      };
    }
    localStorage.setItem('tableConfig', JSON.stringify(tableConfig));
    this.handleChangeTableColumns(localTableConfig.columns);
    this.setState({ loading: false }, () => {
      this.handleCloseModal();
    });
  };

  /**
   * 还原初始配置
   */
  @Bind()
  handleReset() {
    const { tableKey, columns } = this.props;
    const { totalColumns, tableConfId } = this.state;
    const currentColumns = [...totalColumns];
    const uiTableConfLineList = currentColumns.map(
      ({ dataIndex, display, fixed, width, tableConfLineId, objectVersionNumber }, index) => {
        const currentItem = {
          dataIndex,
          display: display ? 1 : 0,
          fixedType: fixed ? (fixed === 'true' ? 'LEFT' : fixed.toUpperCase()) : 'NONE',
          orderSeq: index,
          remark: '',
          uiTableConfExtraList: [],
          width,
          tableConfLineId,
          objectVersionNumber,
        };
        if (tableConfId) {
          currentItem.tableConfId = tableConfId;
        }
        return currentItem;
      }
    );
    const showColumns = totalColumns.filter(column => column.display || !('display' in column));
    const isHasFixedCol = uiTableConfLineList.some(item => item.fixedType !== 'NONE');
    const tableConfig = {
      tableConfId,
      fixedType: isHasFixedCol ? 'LEFT' : 'NONE',
      remark: '',
      scrollx: tableScrollWidth(showColumns),
      scrolly: 0,
      sourceId: getCurrentUserId(),
      sourceType: 'USER',
      tableKey,
      uiTableConfLineList,
    };
    if (tableConfId) {
      this.setState({ deleteLoading: true });
      return deleteTableConfig(tableConfig).then(res => {
        if (getResponse(res)) {
          notification.success();
          if (localStorage.getItem('tableConfig')) {
            const localTableConfig = JSON.parse(localStorage.getItem('tableConfig'));
            let tempTableConfig = localTableConfig;
            tempTableConfig = omit(tempTableConfig, [tableKey]);
            if (isEmpty(tempTableConfig)) {
              localStorage.removeItem('tableConfig');
            } else {
              localStorage.setItem('tableConfig', JSON.stringify(tempTableConfig));
            }
          }
          this.setState({
            deleteLoading: false,
            tableColumns: columns,
          });
        } else {
          this.setState({ deleteLoading: false });
        }
      });
    } else {
      notification.warning({
        message: intl.get('hpfm.individuationTable.view.title.oriConfig').d('已是原始配置'),
      });
    }
  }

  @Bind()
  getPartColumns() {
    const { totalColumns } = this.state;
    // antd规定fixed指定为’left‘或’true‘都为左固定
    const leftFixedColumns = totalColumns.filter(
      column => column.fixed === 'left' || column.fixed === true
    );
    const rightFixedColumns = totalColumns.filter(column => column.fixed === 'right');
    const centerColumns = totalColumns.filter(column => !column.fixed);
    const isFixed = totalColumns.some(column => !!column.fixed);
    return { leftFixedColumns, rightFixedColumns, centerColumns, isFixed };
  }

  /**
   * 改变列宽
   * @param {string} dataIndex - 表格列的dataIndex
   * @param {number} value - 列宽
   */
  @Bind()
  // @Debounce(50)
  handleChangeColumnWidth(dataIndex, width) {
    const targetColumnIndex = this.state.totalColumns.findIndex(
      item => item.dataIndex === dataIndex
    );
    this.setState(({ totalColumns }) => {
      const nextColumns = [...totalColumns];
      nextColumns[targetColumnIndex] = {
        ...nextColumns[targetColumnIndex],
        width,
      };
      return { totalColumns: nextColumns };
    });
  }

  /**
   * 固定列
   * @param {string} dataIndex -表格列的dataIndex
   * @param {string} position - 固定类型 left/right
   */
  @Bind()
  handleFixed(dataIndex, position) {
    const targetColumnIndex = this.state.totalColumns.findIndex(
      item => item.dataIndex === dataIndex
    );
    this.setState(({ totalColumns }) => {
      const nextColumns = [...totalColumns];
      nextColumns[targetColumnIndex] = {
        ...nextColumns[targetColumnIndex],
        fixed: position,
      };
      const tempObj = nextColumns.splice(targetColumnIndex, 1);
      // 左固定列在列数据的头部，右固定列在列数据的尾部
      const handledColumns =
        position === 'right' ? [...nextColumns, ...tempObj] : [...tempObj, ...nextColumns];
      return { totalColumns: handledColumns };
    });
  }

  /**
   * 取消固定列
   * @param {string} dataIndex - 表格列的dataIndex
   */
  @Bind()
  handleCancelFixed(dataIndex) {
    const targetColumnIndex = this.state.totalColumns.findIndex(
      item => item.dataIndex === dataIndex
    );
    this.setState(({ totalColumns }) => {
      const nextColumns = [...totalColumns];
      const { fixed, ...rest } = nextColumns[targetColumnIndex];
      nextColumns[targetColumnIndex] = { ...rest };
      return { totalColumns: nextColumns };
    });
  }

  /**
   * 隐藏或显示列
   * @param {string[]} hiddenKey - 隐藏的列的dataIndex集合
   * @param {string[]} showKeys - 显示的列的dataIndex集合
   */
  @Bind()
  handleChangeColumnVisibility(hiddenKey, showKeys) {
    const { totalColumns } = this.state;
    let nextColumns = [...totalColumns];
    nextColumns = nextColumns.map(column => {
      const nextColumn = { ...column };
      if (hiddenKey.includes(nextColumn.dataIndex)) {
        nextColumn.display = false;
      }
      if (showKeys.includes(nextColumn.dataIndex)) {
        nextColumn.display = true;
      }
      return nextColumn;
    });
    this.setState({ totalColumns: nextColumns });
  }

  /**
   * 列宽自适应
   * @param {number} dataIndex - 表格列的dataIndex
   */
  @Bind()
  handleAdptedCol(dataIndex) {
    const targetColumnIndex = this.state.totalColumns.findIndex(
      item => item.dataIndex === dataIndex
    );
    this.setState(({ totalColumns }) => {
      const nextColumns = [...totalColumns];
      const { width, ...rest } = nextColumns[targetColumnIndex] || {};
      nextColumns[targetColumnIndex] = { ...rest };
      return { totalColumns: nextColumns };
    });
  }

  /**
   * 列宽取消自适应
   * @param {number} dataIndex - 表格列的dataIndex
   */
  @Bind()
  handleCancelAdaptCol(dataIndex) {
    const targetColumnIndex = this.state.totalColumns.findIndex(
      item => item.dataIndex === dataIndex
    );
    this.setState(({ totalColumns }) => {
      const nextColumns = [...totalColumns];
      nextColumns[targetColumnIndex] = {
        ...nextColumns[targetColumnIndex],
        width: 80,
      };
      return { totalColumns: nextColumns };
    });
  }

  /**
   * 拖拽
   * @param {Object[]} newPartData 某一表格的拖拽后的最新数据（左固定表格/中间列表格/右固定表格）
   * @param {string} direction 数据来自哪个表格 左/中/右
   */
  @Bind()
  handleDrag(newPartData, direction) {
    const { totalColumns } = this.state;
    const { leftFixedColumns, rightFixedColumns, centerColumns } = this.getPartColumns();
    let nextColumns = [...totalColumns];
    switch (direction) {
      case 'left':
        nextColumns = [...newPartData, ...centerColumns, ...rightFixedColumns];
        break;
      case 'center':
        nextColumns = [...leftFixedColumns, ...newPartData, ...rightFixedColumns];
        break;
      case 'right':
        nextColumns = [...leftFixedColumns, ...centerColumns, ...newPartData];
        break;
      default:
        break;
    }
    this.setState({ totalColumns: nextColumns });
  }

  @Bind()
  onDescriptionChange(dataIndex, value) {
    const { totalColumns } = this.state;
    this.setState({
      totalColumns: totalColumns.map(o => (o.dataIndex === dataIndex ? { ...o, ...value } : o)),
    });
  }

  /**
   * 渲染模态框头部
   */
  @Bind()
  renderHeader() {
    const { totalColumns } = this.state;
    const showColumns =
      totalColumns && totalColumns.filter(column => column.display || !('display' in column));
    // const targetCenterColIndex = showColumns.findIndex(column => column.fixed === undefined || !('fixed' in column));
    // const isFixed = showColumns.some(column => !!column.fixed);
    // // 如果有固定列，将没有固定属性的列中的第一列的宽度删掉
    // if (targetCenterColIndex !== -1 && isFixed) {
    //   const { width, ...rest } = showColumns[targetCenterColIndex];
    //   showColumns[targetCenterColIndex] = { ...rest };
    // }

    return (
      <div>
        <div className={classNames(style['header-title'])}>
          {intl.get('hpfm.individuationForm.view.title.preview').d('自定义效果预览')}
        </div>
        <Table
          bordered
          columns={showColumns.map(o => ({
            ...o,
            title: (
              <ColumnTitleEditor
                value={o.description || o.title}
                onDescriptionChange={value => this.onDescriptionChange(o.dataIndex, value)}
              />
            ),
          }))}
          scroll={{ x: tableScrollWidth(showColumns) }}
        />
        <Row className={classNames(style['header-tips'])}>
          <Col span={1}>{intl.get('hzero.common.message.confirm.title').d('提示')}</Col>
          <Col span={23}>
            <div>
              {intl
                .get('hpfm.individuationTable.view.title.descrition01-a')
                .d('1、上下拖动可排序，点击 ')}
              <Icon type="left" />
              {` 、`}
              <Icon type="right" />
              {intl
                .get('hpfm.individuationTable.view.title.descrition01-b')
                .d('可将列固定在最左/最右，点击')}
              <Icon type="unlock" />
              {intl.get('hpfm.individuationTable.view.title.cancel').d('可取消固定。')}
            </div>
            <div>
              {intl.get('hpfm.individuationTable.view.title.click').d('2、点击 ')}
              <Icon type="pushpin-o" />{' '}
              {intl
                .get('hpfm.individuationTable.view.title.autoCancel')
                .d('可将列的宽度设置为自动（均分剩余宽度）,再次点击取消自动。')}
            </div>
          </Col>
        </Row>
      </div>
    );
  }

  /**
   * 渲染模态框内容
   */
  @Bind()
  renderContent = () => {
    const { leftFixedColumns, rightFixedColumns, centerColumns, isFixed } = this.getPartColumns();
    const basicProps = {
      onChangeColWidth: this.handleChangeColumnWidth,
      onChangeColVisibility: this.handleChangeColumnVisibility,
      onFixed: this.handleFixed,
      onCancelFixed: this.handleCancelFixed,
      onAdaptCol: this.handleAdptedCol,
      onCancelAdaptCol: this.handleCancelAdaptCol,
      onDrag: this.handleDrag,
    };
    const leftFixedColumnsProps = Object.assign({}, basicProps, {
      direction: 'left',
      tableData: leftFixedColumns,
      fixedPosition: 'left',
    });
    const rightFixedColumnsProps = Object.assign({}, basicProps, {
      direction: 'right',
      tableData: rightFixedColumns,
      fixedPosition: 'right',
    });
    const centerColumnsProps = Object.assign({}, basicProps, {
      direction: 'center',
      tableData: centerColumns,
      isFixed,
    });
    return (
      <div className={classNames(style.content)}>
        <SliderWrapper {...leftFixedColumnsProps} />
        <SliderWrapper {...centerColumnsProps} />
        <SliderWrapper {...rightFixedColumnsProps} />
      </div>
    );
  };

  render() {
    const {
      tableKey,
      onChangeColumns,
      columns,
      TableComponent,
      visible,
      ...otherProps
    } = this.props;
    const { loading, deleteLoading, tableColumns } = this.state;
    const tableProps = {
      columns: tableColumns.length ? tableColumns : columns,
      ...otherProps,
    };

    return (
      <Fragment>
        <div className={classNames(style.wrapper)}>
          <TableComponent {...tableProps} />
          {/* <Button shape="circle" className={classNames(style['setting-button'])} icon="setting" onClick={this.handleOpenConfigModal} /> */}
        </div>
        <Modal
          title={this.renderHeader()}
          visible={visible}
          destroyOnClose
          width="80%"
          className={classNames(style['modal-wrapper'])}
          closable={false}
          maskClosable={false}
          confirmLoading={loading}
          footer={[
            <Button key="reset" loading={deleteLoading} onClick={this.handleReset}>
              {intl.get('hzero.common.button.oriConfig').d('还原原始配置')}
            </Button>,
            <Button key="back" onClick={this.handleCloseModal}>
              {' '}
              {intl.get('hzero.common.button.cancel').d('取消')}
            </Button>,
            <Button
              key="submit"
              type="primary"
              loading={loading}
              onClick={this.handleSubmitTableConfig}
            >
              {intl.get('hzero.common.button.ok').d('确定')}
            </Button>,
          ]}
        >
          <div>{this.renderContent()}</div>
        </Modal>
      </Fragment>
    );
  }
}
