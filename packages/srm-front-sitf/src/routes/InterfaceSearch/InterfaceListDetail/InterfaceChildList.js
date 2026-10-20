/**
 * InterfaceChildList - 接口查询 - 接口表 - 接口查询字表组件
 * @date: 2018-10-10
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { Menu, Dropdown, Icon, Modal } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { connect } from 'dva';
import intl from 'utils/intl';
import DataTable from './DataTable';
import InterfaceChildModal from './InterfaceChildModal';

/**
 * 接口查询 - 接口表 - 接口查询字表组件
 * @extends {Component} - React.Component
 * @reactProps {Object} interfaceListDetail | interfaceListDetailOrg - 数据源
 * @reactProps {Object} [history={}]
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
@connect(({ interfaceListDetail, interfaceListDetailOrg, loading }) => ({
  interfaceListDetail,
  interfaceListDetailOrg,
  fetchData:
    loading.effects[
      `${interfaceListDetailOrg ? 'interfaceListDetailOrg' : 'interfaceListDetail'}/fetchData`
    ],
  fetchChildList:
    loading.effects[
      `${interfaceListDetailOrg ? 'interfaceListDetailOrg' : 'interfaceListDetail'}/fetchChildList`
    ],
  fetchConfig:
    loading.effects[
      `${interfaceListDetailOrg ? 'interfaceListDetailOrg' : 'interfaceListDetail'}/fetchConfig`
    ],
  fetchChildData:
    loading.effects[
      `${interfaceListDetailOrg ? 'interfaceListDetailOrg' : 'interfaceListDetail'}/fetchChildData`
    ],
}))
export default class InterfaceChildList extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      modelName: this.props.interfaceListDetailOrg // model名称
        ? 'interfaceListDetailOrg'
        : 'interfaceListDetail',
      errorVisible: false, // 错误弹框显示/隐藏标记
      errorMessage: '', // 错误信息
      dataSource: {},
      configData: {}, // 配置
      modalVisible: false,
      modalTitle: '',
      levelPath: '', // 等级路径
      childParams: {}, // 子数据参数
    };
  }

  /**
   * 查询子表的数据
   * @param {Object} queryData 查询条件
   * @param {String} childLevelPath 等级路径
   * @param {String} title 标题
   * @param {Object} record 行数据
   */
  @Bind()
  queryChildData(queryData = {}, childLevelPath, title, record = {}) {
    const { dispatch, modalConfig = {}, fetchId } = this.props;
    const { modelName } = this.state;
    if (title) {
      this.setState({
        modalTitle: title,
      });
    }
    const childParams = {};
    if (modalConfig && modalConfig.keyColumns) {
      modalConfig.keyColumns.forEach((column) => {
        childParams[column] = record[column];
      });
      this.setState({
        childParams,
      });
    }
    if (childLevelPath) {
      this.setState({
        levelPath: childLevelPath,
      });
    }
    dispatch({
      type: `${modelName}/fetchChildList`,
      payload: {
        interfaceId: modalConfig.interfaceId,
        levelPath: childLevelPath,
        ...fetchId,
        ...queryData,
        ...childParams,
      },
    }).then((response) => {
      if (response) {
        this.setState({
          dataSource: response.dataSource,
          configData: response.config,
        });
      }
    });
  }

  /**
   * 控制子表弹框显示隐藏
   * @param {Bollean} flag 显示/隐藏标记
   * @param {String} childLevelPath 子表等级路径
   * @param {String} title 标题
   * @param {Object} record 行数据
   */
  @Bind()
  handleVisible(flag, childLevelPath, title, record) {
    this.setState({
      modalVisible: !!flag,
    });
    if (flag) {
      this.queryChildData({}, childLevelPath, title, record);
    } else {
      this.setState({
        dataSource: {},
        configData: {},
        modalVisible: false,
        modalTitle: '',
      });
    }
  }

  /**
   * 查询数据
   * @param {Object} queryData 查询参数
   */
  @Bind()
  queryData(queryData) {
    const { modalConfig = {}, dispatch, fetchId } = this.props;
    const { modelName } = this.state;
    dispatch({
      type: `${modelName}/fetchChildData`,
      payload: {
        data: {
          ...fetchId,
          ...queryData,
        },
        url: modalConfig.interfaceUrl,
      },
    }).then((response) => {
      if (response) {
        this.setState({
          dataSource: response.dataSource,
        });
      }
    });
  }

  /**
   * 显示错误信息弹框
   * @param {Object} record 行数据
   */
  @Bind()
  showErrorMessage(record = {}) {
    this.setState({
      errorVisible: true,
      errorMessage: record.errorMessage,
    });
  }

  /**
   * 隐藏错误信息弹框
   */
  @Bind()
  hideErrorMessage() {
    this.setState({
      errorVisible: false,
      errorMessage: '',
    });
  }

  render() {
    const {
      fetchData,
      fetchChildList,
      fetchChildData,
      fetchConfig,
      modalConfig = {},
      modalDataSource = {},
      queryChildData,
      childLevelPath,
      patentParams,
      fetchId,
    } = this.props;
    const {
      modalVisible,
      dataSource,
      configData,
      modalTitle,
      levelPath,
      errorVisible,
      errorMessage,
      childParams,
    } = this.state;
    const tableColumns =
      modalConfig.columns &&
      modalConfig.columns.map((column) => {
        if (column.columnName === 'errorMessage') {
          return {
            title: column.columnComment,
            dataIndex: column.columnName,
            width: 100,
            align: 'left',
            render: (_, record) => (
              <a onClick={() => this.showErrorMessage(record)}>
                {intl.get('sitf.common.error.errorMessage').d('错误信息')}
              </a>
            ),
          };
        } else {
          return {
            title: column.columnComment,
            dataIndex: column.columnName,
            width: 120,
          };
        }
      });
    const settingRow = modalConfig.searchs && {
      title: intl.get('hzero.common.button.action').d('操作'),
      width: 100,
      align: 'left',
      fixed: 'right',
      render: (_, record) => {
        const menu = (
          <Menu>
            {modalConfig.searchs.map((search) => {
              return (
                <Menu.Item key={search.childLevelPath}>
                  <a
                    onClick={() =>
                      this.handleVisible(true, search.childLevelPath, search.tableComment, record)
                    }
                  >
                    {search.tableComment}
                  </a>
                </Menu.Item>
              );
            })}
          </Menu>
        );
        return (
          <Dropdown overlay={menu} placement="bottomRight" trigger={['click']}>
            <a className="ant-dropdown-link">
              {intl.get('hzero.common.button.action').d('操作')} <Icon type="down" />
            </a>
          </Dropdown>
        );
      },
    };
    const dataTableOptions = {
      rowKey: modalConfig.keyColumns && modalConfig.keyColumns[0],
      modalConfig,
      patentParams,
      orderQuery: false,
      childLevelPath,
      loading: fetchConfig || fetchData || fetchChildList || fetchChildData,
      columns:
        modalConfig.searchs && modalConfig.searchs.length > 0
          ? [...tableColumns, settingRow]
          : tableColumns,
      queryData: queryChildData,
      dataSource: modalDataSource,
      scroll: modalConfig.columns && modalConfig.columns.length * 120,
    };
    const modalOptions = {
      fetchId,
      modalVisible,
      childParams,
      dataSource,
      configData,
      title: modalTitle,
      childLevelPath: levelPath,
      handleVisible: this.handleVisible,
      queryChildData: this.queryChildData,
    };
    return (
      <div>
        <DataTable {...dataTableOptions} />
        <Modal
          title={intl.get('sitf.common.error.errorMessage').d('错误信息')}
          visible={errorVisible}
          width={800}
          onCancel={this.hideErrorMessage}
          footer={false}
        >
          <span>{errorMessage}</span>
        </Modal>
        <InterfaceChildModal {...modalOptions} />
      </div>
    );
  }
}
