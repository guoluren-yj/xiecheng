/**
 * ProcessorMonitor -前置机监控页面
 * @date: 2018-9-14
 * @author dengtingmin <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Table, Button, Icon, Tooltip, Modal } from 'hzero-ui';
import { connect } from 'dva';
import Debounce from 'lodash-decorators/debounce';
import { isUndefined, isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';

import uuidv4 from 'uuid/v4';

import { filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';
import { enableFlag } from 'utils/renderer';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';

import { Header, Content } from 'components/Page';
import CacheComponent from 'components/CacheComponent';

import ProcessorMonitorModal from './ProcessorMonitorModal';
import FilterForm from './FilterForm';

const { confirm } = Modal;

@connect(({ processorMonitor, loading }) => ({
  processorMonitor,
  loading: loading.effects['processorMonitor/queryProcessorMonitor'],
  loadingModel: loading.effects['processorMonitor/updateProcessorMonitor'],
  loadingDetail: loading.effects['processorMonitor/updateProcessorMonitorDetail'],
}))
@formatterCollections({ code: ['sitf.processorMonitor'] })
@CacheComponent({ cacheKey: '/sitf/processor-monitor' })
export default class ProcessorMonitor extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      selectedRows: [],
      modalVisible: false, // 编辑框是否显示
      changeMobile: true, // 手机号码填写框，默认显示手机
      changeEmail: false, // email选择框，默认显示邮箱
      checkboxValue: ['mobile'], // 多选框默认显示手机
      modelId: uuidv4(),
      tenantId: getCurrentOrganizationId(),
    };
    this.startOrEnd = this.startOrEnd.bind(this);
  }

  componentDidMount() {
    const { dispatch } = this.props;
    this.refreshData();
    // 查询值级
    dispatch({
      type: 'processorMonitor/batchIdpValue',
    });
  }

  form;

  @Bind()
  handleRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  @Bind()
  refreshData() {
    const { dispatch } = this.props;
    dispatch({
      type: 'processorMonitor/queryProcessorMonitor',
      payload: {
        page: {},
      },
    });
  }
  /**
   * 前置机监控列表
   * @param {object} params  查询参数
   */
  @Bind()
  queryProcessorMonitor(params = {}) {
    const {
      dispatch,
      processorMonitor: { pagination = {} },
    } = this.props;
    const fieldValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    dispatch({
      type: 'processorMonitor/queryProcessorMonitor',
      payload: {
        page: isEmpty(params) ? pagination : params,
        ...fieldValues,
      },
    });
  }

  /**
   * 新建前置机监控列表
   */
  @Bind()
  handleCreateProcessor() {
    const { dispatch } = this.props;
    const { tenantId } = this.state;
    dispatch({
      type: 'processorMonitor/getGroupList',
      payload: {
        lovCode: 'HSDR.JOB_GROUP',
        tenantId,
      },
    });
    this.setState({
      modalVisible: true,
      changeMobile: true,
      changeEmail: false,
    });
  }

  /**
   * 新增或者编辑
   * @param {object} record 新增修改参数
   * @memberof MessgeQueue
   */
  @Bind()
  handlerEdit(record = {}) {
    const { dispatch } = this.props;
    const { tenantId } = this.state;
    this.setState({
      modalVisible: true,
    });
    dispatch({
      type: 'processorMonitor/getGroupList',
      payload: {
        lovCode: 'HSDR.JOB_GROUP',
        tenantId,
      },
    }).then(
      dispatch({
        type: 'processorMonitor/updateProcessorMonitorDetail',
        payload: record.monitorId,
      }).then(() => {
        // 设置手机、邮箱勾选框初始值
        const {
          processorMonitor: { detail = {} },
        } = this.props;
        this.setState({
          changeMobile: !!detail.mobile,
          changeEmail: !!detail.email,
        });
      })
    );
  }

  /**
   * 邮箱或者手机选择
   * @param {object} values  勾选值（mobile,email）
   */
  @Bind()
  changeMobileOrEmail(values = {}) {
    if (values.length === 0) {
      this.setState({
        changeMobile: false,
        changeEmail: false,
      });
    } else if (values.length === 1) {
      const selectValue = values[0];
      if (selectValue === 'mobile') {
        this.setState({ changeMobile: true, changeEmail: false });
      } else {
        this.setState({ changeMobile: false, changeEmail: true });
      }
    } else if (values.length === 2) {
      this.setState({ changeMobile: true, changeEmail: true });
    }
  }

  /**
   * 取消编辑/新建状态
   */
  @Bind()
  handleCancle() {
    const { dispatch } = this.props;
    this.setState({
      modalVisible: false,
      changeMobile: true,
      changeEmail: false,
      checkboxValue: ['mobile'],
    });
    dispatch({
      type: 'processorMonitor/updateState',
      payload: {
        detail: {},
      },
    });
  }

  /**
   * 保存前置机监控
   * @param {object} values 保存参数
   */
  @Bind()
  handleSaveProcessor(values = {}) {
    const { dispatch } = this.props;
    const { frontEndSystemName, email, mobile, ...otherValues } = values;
    dispatch({
      type: 'processorMonitor/updateProcessorMonitor',
      payload: {
        body: {
          ...otherValues,
          email: this.state.changeEmail ? email : null,
          mobile: this.state.changeMobile ? mobile : null,
        },
      },
    }).then(res => {
      if (res) {
        notification.success();
        this.setState({
          modalVisible: false,
        });
        this.queryProcessorMonitor();
      }
    });
  }

  /**
   * 保存勾选框勾选数据
   * @param {object} selectedRows 勾选的当前行数据
   */
  @Bind()
  handleRowSelectChange(_, selectedRows) {
    this.setState({
      selectedRows,
    });
  }

  /**
   * 开始或者停止(包括批量)
   * @param {object} record  需操作的行数据
   * @param {number} flag    开始或停止标志
   * @returns
   */
  @Debounce(500)
  startOrEnd(record, flag) {
    const { dispatch } = this.props;
    if (this.state.selectedRows.length === 0 && record.frontEndSystemCode === undefined) {
      notification.warning({
        message: intl.get(' hzero.common.message.confirm.remove').d('请至少选择一条数据'),
      });
      return;
    }
    dispatch({
      type: 'processorMonitor/startOrEndProcessorMonitor',
      payload: {
        body: this.state.selectedRows.length > 0 ? this.state.selectedRows : [record],
        status: flag,
      },
    }).then(res => {
      if (res) {
        notification.success();
        this.queryProcessorMonitor();
        this.setState({
          selectedRows: [],
        });
      }
    });
  }

  /**
   * 删除
   */
  @Bind()
  deleteData() {
    const {
      dispatch,
      processorMonitor: { pagination = {} },
    } = this.props;
    const { selectedRows } = this.state;
    if (selectedRows.length < 1) {
      notification.warning({
        message: intl.get(' hzero.common.message.confirm.remove').d('请至少选择一条数据'),
      });
      return;
    }
    confirm({
      title: intl.get('hzero.common.message.confirm.title').d('提示框?'),
      content: intl.get('hzero.common.message.confirm.remove').d('确定删除选中数据?'),
      onOk() {
        dispatch({
          type: 'processorMonitor/deleteProcessorMonitor',
          payload: {
            body: selectedRows,
          },
        }).then(res => {
          if (res) {
            notification.success();
            dispatch({
              type: 'processorMonitor/queryProcessorMonitor',
              payload: {
                ...pagination,
              },
            });
          }
        });
      },
    });
  }

  render() {
    const { modalVisible, changeMobile, changeEmail, modelId } = this.state;
    const {
      processorMonitor: { list = {}, detail, code, pagination = {}, queryCode = [] },
      loading,
      loadingModel,
      loadingDetail,
    } = this.props;
    const columns = [
      {
        title: intl.get('sitf.processorMonitor.model.processorMonitor.status').d('状态'),
        dataIndex: 'status',
        align: 'left',
        width: 100,
        render: enableFlag,
      },
      {
        title: intl.get('sitf.common.frontEndSystem.code').d('前置机代码'),
        dataIndex: 'frontEndSystemCode',
        width: 120,
        align: 'left',
      },
      {
        title: intl.get('sitf.common.frontEndSystem.name').d('前置机名称'),
        dataIndex: 'frontEndSystemName',
        width: 120,
        align: 'left',
      },
      {
        title: intl
          .get('sitf.processorMonitor.model.processorMonitor.monitorInterval')
          .d('监控频率'),
        dataIndex: 'monitorInterval',
        width: 100,
        align: 'left',
      },
      {
        title: intl.get('sitf.common.product.name').d('产品线名称'),
        dataIndex: 'productLine',
        width: 120,
        align: 'left',
      },
      {
        title: intl.get('sitf.common.applicationGroup.name').d('应用组名称'),
        dataIndex: 'applicationGroup',
        width: 120,
        align: 'left',
      },
      {
        title: intl
          .get('sitf.processorMonitor.model.processorMonitor.lastResponseTime')
          .d('最后响应时间'),
        dataIndex: 'lastResponseTime',
        width: 150,
        align: 'left',
      },
      {
        title: intl
          .get('sitf.processorMonitor.model.processorMonitor.lastMonitorTime')
          .d('最后监控时间'),
        dataIndex: 'lastMonitorTime',
        width: 150,
        align: 'left',
      },
      {
        title: intl.get('sitf.processorMonitor.model.processorMonitor.monitorReport').d('监控报告'),
        dataIndex: 'monitorReport',
        align: 'left',
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        align: 'left',
        dataIndex: 'edit',
        fixed: 'right',
        width: 100,
        render: (val, record) => {
          return record.enabledFlag === 0 ? (
            <span className="action-link">
              <Tooltip
                title={intl.get('sitf.processorMonitor.model.processorMonitor.start').d('开启')}
              >
                <a onClick={() => this.startOrEnd(record, 1)}>
                  <Icon type={record ? 'caret-right' : 'loading'} />
                </a>
              </Tooltip>
              <Tooltip title={intl.get('hzero.common.button.edit').d('编辑')}>
                <a
                  onClick={() => {
                    this.handlerEdit(record);
                  }}
                >
                  <Icon type="edit" />
                </a>
              </Tooltip>
            </span>
          ) : (
            <span className="action-link">
              <Tooltip
                title={intl.get('sitf.processorMonitor.model.processorMonitor.stop').d('暂停')}
              >
                <a onClick={() => this.startOrEnd(record, 0)}>
                  <Icon type={record ? 'pause' : 'loading'} />
                </a>
              </Tooltip>
              <Tooltip title={intl.get('hzero.common.button.edit').d('编辑')}>
                <a
                  onClick={() => {
                    this.handlerEdit(record);
                  }}
                >
                  <Icon type="edit" />
                </a>
              </Tooltip>
            </span>
          );
        },
      },
    ];
    const rowSelection = {
      selectedRowKeys: this.state.selectedRows.map(n => n.monitorId),
      onChange: this.handleRowSelectChange,
    };
    const filterProps = {
      queryCode,
      onRef: this.handleRef,
      onFetchData: this.queryProcessorMonitor,
    };
    const detailProps = {
      modalVisible,
      changeMobile,
      changeEmail,
      tableRecord: detail,
      anchor: 'right',
      loadingModel,
      loadingDetail,
      code,
      checkboxValue: this.state.checkboxValue,
      onHanleSaveProcessor: this.handleSaveProcessor,
      onCancel: this.handleCancle,
      onChangeMobileOrEmail: this.changeMobileOrEmail,
    };
    return (
      <React.Fragment>
        <Header title={intl.get('sitf.processorMonitor.view.processorMonitor').d('前置机监控')}>
          <Button icon="plus" type="primary" onClick={this.handleCreateProcessor}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
          <Button icon="caret-right" onClick={() => this.startOrEnd({}, 1)}>
            {intl.get('sitf.processorMonitor.view.processorMonitor.batchStart').d('批量开启')}
          </Button>
          <Button icon="pause" onClick={() => this.startOrEnd({}, 0)}>
            {intl.get('sitf.processorMonitor.view.processorMonitor.batchStop').d('批量暂停')}
          </Button>
          <Button
            icon="delete"
            onClick={this.deleteData}
            disabled={this.state.selectedRows.length < 1}
          >
            {intl.get('hzero.commom.button.delete').d('删除')}
          </Button>
        </Header>
        <Content>
          <div className="table-list-search">
            <FilterForm {...filterProps} />
          </div>
          <Table
            bordered
            pagination={pagination}
            rowKey="monitorId"
            rowSelection={rowSelection}
            columns={columns}
            loading={loading}
            onChange={page => this.queryProcessorMonitor(page)}
            scroll={{ x: 1250 }}
            dataSource={list.content || []}
          />
        </Content>
        <ProcessorMonitorModal key={modelId} {...detailProps} />
      </React.Fragment>
    );
  }
}
