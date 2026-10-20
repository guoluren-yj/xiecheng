/**
 * InterfaceListDetail - 接口查询 - 接口表
 * @date: 2018-9-20
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Menu, Dropdown, Icon, Modal } from 'hzero-ui';
import qs from 'querystring';
import { withRouter } from 'react-router-dom';
import { Bind } from 'lodash-decorators';
import formatterCollections from 'utils/intl/formatterCollections';
import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import { yesOrNoRender, isErrorOrNoRender } from 'utils/renderer';
import 'codemirror/mode/clike/clike';
import CodeMirror from 'components/CodeMirror';
import DataTable from './DataTable';
import InterfaceChildList from './InterfaceChildList';

const ChildModal = props => {
  const {
    modalVisible,
    handleModal,
    modalConfig,
    modalDataSource,
    title,
    queryChildData,
    childLevelPath,
    patentParams,
    fetchId,
  } = props;
  return (
    <Modal
      title={title}
      visible={modalVisible}
      footer={null}
      maskClosable={false}
      width="100%"
      onCancel={() => handleModal(false)}
    >
      <InterfaceChildList
        modalConfig={modalConfig}
        fetchId={fetchId}
        patentParams={patentParams}
        modalDataSource={modalDataSource}
        queryChildData={queryChildData}
        childLevelPath={childLevelPath}
      />
    </Modal>
  );
};

/**
 * 接口查询 - 接口表
 * @extends {Component} - React.Component
 * @reactProps {Object} interfaceListDetail | interfaceListDetailOrg - 数据源
 * @reactProps {Object} [history={}]
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
@formatterCollections({
  code: ['sitf.interfaceSearch', 'entity.tenant'],
})
@Form.create({ fieldNameProp: null })
@withRouter
export default class InterfaceListDetail extends PureComponent {
  constructor(props) {
    super(props);
    const fetchId = qs.parse(props.history.location.search.substr(1));
    this.state = {
      fetchId, // 页面路径参数
      errorVisible: false,
      errorMessage: '',
      modalVisible: false,
      modalDataSource: {},
      modalConfig: {}, // 弹框配置
      modalTitle: '', // 弹框标题
      childLevelPath: '', // 子表等级路径
      patentParams: {}, // 父表参数
    };
  }

  /**
   * 挂载后方法
   */
  componentDidMount() {
    this.clearOldData();
    this.querySitfStatus();
    this.queryConfigData();
  }

  /**
   * 查询数据状态
   */
  @Bind()
  querySitfStatus() {
    const { dispatch, modelName = 'interfaceListDetail' } = this.props;
    dispatch({
      type: `${modelName}/fetchSitfStatus`,
      payload: {},
    });
  }

  /**
   * 清除model中旧数据
   */
  @Bind()
  clearOldData() {
    const { dispatch, modelName = 'interfaceListDetail' } = this.props;
    dispatch({
      type: `${modelName}/updateState`,
      payload: {
        configData: {},
        interfaecData: {},
      },
    });
  }

  /**
   * 查询配置数据
   */
  @Bind()
  queryConfigData() {
    const { dispatch, modelName = 'interfaceListDetail' } = this.props;
    const { fetchId } = this.state;
    dispatch({
      type: `${modelName}/fetchConfig`,
      payload: {
        ...fetchId,
      },
    });
  }

  /**
   * 查询数据
   * @param {Object} queryData 查询参数
   */
  @Bind()
  queryData(queryData = {}) {
    const { dispatch, modelName = 'interfaceListDetail' } = this.props;
    const { [modelName]: interfaceListDetail } = this.props;
    const { configData = {} } = interfaceListDetail;
    const { fetchId } = this.state;
    dispatch({
      type: `${modelName}/fetchData`,
      payload: {
        data: {
          ...fetchId,
          ...queryData,
        },
        url: configData.interfaceUrl,
      },
    });
  }

  /**
   * 查询子表数据
   * @param {Object} queryData 查询条件
   * @param {String} childLevelPath 子表等级路径
   * @param {String} title 标题
   * @param {Object} record 行数据
   */
  @Bind()
  queryChildData(queryData = {}, childLevelPath, title, record = {}) {
    const { dispatch, modelName = 'interfaceListDetail' } = this.props;
    const { [modelName]: interfaceListDetail } = this.props;
    const { configData = {} } = interfaceListDetail;
    const { fetchId } = this.state;
    const patentParams = {};
    if (configData && configData.keyColumns) {
      configData.keyColumns.forEach(column => {
        patentParams[column] = record[column];
      });
      this.setState({
        patentParams,
      });
    }
    if (title) {
      this.setState({
        modalTitle: title,
      });
    }
    if (childLevelPath) {
      this.setState({
        childLevelPath,
      });
    }
    dispatch({
      type: `${modelName}/fetchChildList`,
      payload: {
        interfaceId: configData.interfaceId,
        levelPath: childLevelPath,
        ...fetchId,
        ...patentParams,
        ...queryData,
      },
    }).then(response => {
      if (response) {
        this.setState({
          modalDataSource: response.dataSource,
          modalConfig: response.config,
        });
      }
    });
  }

  /**
   * 控制子表弹出框显示/隐藏
   * @param {Bollean} flag 显示/隐藏标记
   * @param {String} childLevelPath 子表等级路径
   * @param {String} title 标题
   * @param {Object} record 行数据
   */
  @Bind()
  handleModal(flag, childLevelPath, title, record = {}) {
    this.setState({
      modalVisible: !!flag,
    });
    if (flag) {
      this.queryChildData({}, childLevelPath, title, record);
    } else {
      this.setState({
        modalDataSource: {},
        modalConfig: {},
        modalTitle: '',
        childLevelPath: '',
      });
    }
  }

  /**
   * 显示错误信息弹框
   * @param {Object} record
   */
  @Bind()
  showErrorMessage(record = {}) {
    this.setState({
      errorVisible: true,
      errorMessage: record,
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
    const { fetchData, fetchConfig, match, modelName = 'interfaceListDetail' } = this.props;
    const { [modelName]: interfaceListDetail } = this.props;
    const {
      configData = {},
      interfaecData = {},
      code: { SitfStatus = [] },
    } = interfaceListDetail;
    const {
      modalVisible,
      modalDataSource,
      modalConfig,
      modalTitle,
      childLevelPath,
      errorMessage,
      errorVisible,
      patentParams,
      fetchId,
    } = this.state;
    const tableColumns =
      configData.columns &&
      configData.columns.map(column => {
        if (column.columnName === 'errorMessage') {
          return {
            title: column.columnComment,
            dataIndex: column.columnName,
            width: 140,
            align: 'left',
            render: (_, record) => {
              if (record.errorFlag) {
                return (
                  <a onClick={() => this.showErrorMessage(record.errorMessage)}>
                    {intl.get('sitf.common.error.errorMessage').d('错误信息')}
                  </a>
                );
              } else {
                return <div />;
              }
            },
          };
        } else if (column.columnName === 'enabledFlag') {
          return {
            title: column.columnComment,
            dataIndex: column.columnName,
            width: 100,
            align: 'left',
            render: (_, record) => (record.enabledFlag ? 'Y' : 'N'),
          };
        } else if (column.columnName === 'finishedFlag') {
          return {
            title: column.columnComment,
            dataIndex: column.columnName,
            width: 100,
            align: 'left',
            render: yesOrNoRender,
          };
        } else if (column.columnName === 'errorFlag') {
          return {
            title: column.columnComment,
            dataIndex: column.columnName,
            width: 100,
            align: 'left',
            render: isErrorOrNoRender,
          };
        } else {
          return {
            title: column.columnComment,
            dataIndex: column.columnName,
            width: 120,
          };
        }
      });
    const settingRow = configData.searchs && {
      title: intl.get('hzero.common.button.action').d('操作'),
      width: 100,
      align: 'left',
      fixed: 'right',
      render: (_, record) => {
        const menu = (
          <Menu>
            {configData.searchs.map(search => {
              return (
                <Menu.Item key={search.childLevelPath}>
                  <a
                    onClick={() =>
                      this.handleModal(true, search.childLevelPath, search.tableComment, record)
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
      fetchId,
      configData,
      codes: SitfStatus,
      rowKey: configData.keyColumns && configData.keyColumns[0],
      loading: fetchData || fetchConfig,
      columns: configData.searchs ? [...tableColumns, settingRow] : tableColumns,
      orderQuery: true,
      queryData: this.queryData,
      dataSource: interfaecData,
      scroll: configData.columns && configData.columns.length * 200,
    };
    const modalOptions = {
      fetchId,
      modalVisible,
      modalDataSource,
      modalConfig,
      patentParams,
      childLevelPath,
      title: modalTitle,
      queryChildData: this.queryChildData,
      handleModal: this.handleModal,
    };
    const basePath = match.path.substring(0, match.path.indexOf('/interface-list-detail'));
    return (
      <React.Fragment>
        <Header
          title={intl.get('sitf.interfaceSearch.view.title.head.interfaceDetail').d('接口表列表')}
          backPath={`${basePath}/list`}
        />
        <Content>
          <DataTable {...dataTableOptions} />
          <Modal
            title={intl.get('sitf.common.error.errorMessage').d('错误信息')}
            visible={errorVisible}
            width={800}
            destroyOnClose
            onCancel={this.hideErrorMessage}
            footer={false}
          >
            <CodeMirror
              codeMirrorProps={{
                value: errorMessage,
                options: {
                  mode: 'text/x-java',
                  autoFocus: false,
                  readOnly: true,
                  lineNumbers: true,
                },
              }}
            />
          </Modal>
          <ChildModal {...modalOptions} />
        </Content>
      </React.Fragment>
    );
  }
}
