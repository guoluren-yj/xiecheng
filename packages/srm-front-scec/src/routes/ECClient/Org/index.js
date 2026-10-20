/**
 * ECClient - 电商账号管理
 * @date: 2019-2-23
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import { connect } from 'dva';
import { isEmpty, filter } from 'lodash';
import { Bind } from 'lodash-decorators';
import { withRouter } from 'react-router-dom';
import { Button, Table, Modal } from 'hzero-ui';

import intl from 'utils/intl';
import uuidv4 from 'uuid/v4';
import notification from 'utils/notification';
import { getEditTableData } from 'utils/utils';
import { Header, Content } from 'components/Page';
import { enableRender, activateRender } from 'utils/renderer';
import formatterCollections from 'utils/intl/formatterCollections';

import EditForm from './EditForm';
import CommonModal from './CommonModal';
import InitDataModal from './InitDataModal';
import ChangePwdForm from './ChangePwdForm';

/**
 * 电商账号管理
 * @extends {Component} - React.Component
 * @reactProps {Object} ecClient - 数据源
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */

@connect(({ ecClient, loading }) => ({
  ecClient,
  saveLoading: loading.effects['ecClient/saveECClient'],
  fetchLoading: loading.effects['ecClient/fetchECClient'],
  fetchInitDataLoading: loading.effects['ecClient/fetchInitDataStatus'],
  initSyncDataLoading: loading.effects['ecClient/initSyncData'],
  fetchCommonDataLoading: loading.effects['ecClient/fetchCommonData'],
}))
@withRouter
@formatterCollections({ code: ['scec.ecClient', 'scec.common'] })
export default class ECClient extends React.Component {
  /**
   * 内部状态
   */
  state = {
    modalVisible: false, // 编辑弹框显示/隐藏标记
    initDataModalVisible: false, // 数据同步弹框显示/隐藏标记
    changePwdModalVisible: false, // 密码修改弹框显示/隐藏标记
    editRowData: {}, // 编辑时存取的值
    currentEcClientId: '', // 当前的主键
    initStatus: [], // 初始化数据
    commonSelectedRowKeys: [], // 公共modal选中id
    commonSelectedRows: [], // 公共modal选中行
    commonModalVisible: false, // 公共modal显示/隐藏标记
    modalProps: {
      modalTitle: '', // 模态框标题
      record: {}, // 行数据
      valueType: '', // 数据类型
    },
  };

  /**
   * 组件挂载后执行方法
   */
  componentDidMount() {
    this.fetchECClient();
  }

  /**
   * 查询数据
   * @param {Object} pageData 页面信息数据
   */
  @Bind()
  fetchECClient() {
    const { dispatch } = this.props;
    dispatch({
      type: 'ecClient/fetchECClient',
      payload: {},
    });
  }

  /**
   * 新增应用配置
   * @param {Object} fieldsValue 传递的filedvalue
   * @param {Object} form 表单
   */
  @Bind()
  handleAddECClient(fieldsValue, form) {
    const { dispatch } = this.props;
    const { editRowData } = this.state;
    dispatch({
      type:
        editRowData.ecClientId === undefined ? 'ecClient/saveECClient' : 'ecClient/editECClient',
      payload: [
        {
          ...editRowData,
          ...fieldsValue,
        },
      ],
    }).then(response => {
      if (response) {
        notification.success();
        form.resetFields();
        this.showEditModal(false);
        this.refreshValue();
      }
    });
  }

  /**
   * 编辑账户信息
   * @param {Boolean} flag 显示/隐藏标记
   * @param {Object} record 行数据
   */
  @Bind()
  editEcClient(flag, record = {}) {
    const { dispatch } = this.props;
    dispatch({
      type: 'ecClient/fetchDetailData',
      payload: {
        ecClientId: record.ecClientId,
      },
    }).then(res => {
      if (res) {
        this.setState({
          modalVisible: !!flag,
          editRowData: res,
        });
      }
    });
  }

  /**
   * 控制弹出框显示隐藏
   * @param {boolean} flag 显/隐标记
   * @param {Object} record 行数据
   */
  @Bind()
  showEditModal(flag) {
    this.setState({
      modalVisible: !!flag,
      editRowData: {},
    });
  }

  /**
   * 刷新
   */
  @Bind()
  refreshValue() {
    this.fetchECClient();
    this.setState({
      editRowData: {},
    });
  }

  /**
   * 激活账户
   * @param {Object} record
   */
  @Bind()
  onActivate(record) {
    const { dispatch } = this.props;
    dispatch({
      type: 'ecClient/activateAccount',
      payload: {
        ecClientId: record.ecClientId,
      },
    }).then(res => {
      if (res) {
        this.fetchECClient();
        notification.success();
      }
    });
  }

  /**
   * 查询数据初始化状态
   * @param {Boolean} flag 显示/隐藏标记
   * @param {Object} record 行数据
   */
  @Bind()
  fetchInitStatus(flag, record = {}) {
    const { dispatch } = this.props;
    dispatch({
      type: 'ecClient/fetchInitDataStatus',
      payload: {
        ecClientId: record.ecClientId,
      },
    }).then(res => {
      if (res) {
        this.setState({
          initDataModalVisible: !!flag,
          initStatus: res,
          editRowData: record,
        });
      }
    });
  }

  /**
   * 控制数据同步弹出框
   * @param {Boolean} flag 显示/隐藏标记
   * @param {Object} record 行数据
   */
  @Bind()
  handleInitDataModal(flag, record = {}) {
    if (flag) {
      this.fetchInitStatus(flag, record);
    } else {
      this.setState({
        initDataModalVisible: !!flag,
        editRowData: {},
      });
    }
  }

  /**
   * 数据初始化
   */
  @Bind()
  onInitSyncData() {
    const { dispatch } = this.props;
    const { editRowData } = this.state;
    dispatch({
      type: 'ecClient/initSyncData',
      payload: {
        ecClientId: editRowData.ecClientId,
        ecPlatform: editRowData.ecPlatform,
      },
    }).then(res => {
      if (res) {
        this.fetchInitStatus(true, editRowData);
        notification.success();
      }
    });
  }

  /**
   * 单条同步数据
   * @param {当前步骤} step
   */
  @Bind()
  onInitSingleData(step) {
    const { dispatch } = this.props;
    const { editRowData } = this.state;

    dispatch({
      type: 'ecClient/singleInit',
      payload: {
        step,
        ecClientId: editRowData.ecClientId,
        ecPlatform: editRowData.ecPlatform,
      },
    }).then(res => {
      if (res) {
        this.fetchInitStatus(true, editRowData);
        notification.success();
      }
    });
  }

  /**
   * 保存新密码
   * @param {Object} value
   */
  @Bind()
  onSaveNewPwd(value) {
    const { dispatch } = this.props;
    const { currentEcClientId } = this.state;
    dispatch({
      type: 'ecClient/changePwd',
      payload: {
        ...value,
        ecClientId: currentEcClientId,
      },
    }).then(res => {
      if (res) {
        notification.success();
        this.onShowChangePwdModal(false);
        this.fetchECClient();
      }
    });
  }

  /**
   * 显示密码修改弹出框
   * @param {Boolean} flag 显示/隐藏标记
   * @param {Object} record 行数据
   */
  @Bind()
  onShowChangePwdModal(flag, record = {}) {
    this.setState({
      changePwdModalVisible: !!flag,
      currentEcClientId: record.ecClientId || '',
    });
  }

  /**
   * 关闭公共模态框
   */

  @Bind()
  closeCommonModal() {
    this.setState({
      commonModalVisible: false,
    });
  }

  /**
   * 控制公共模态框
   * @param {Object} record 行数据
   * @param {String} title 模态框标题
   * @param {String} name 字段名
   * @param {String} valueType 数据类型
   */
  @Bind()
  handleVisible(record = {}, title, name, valueType) {
    this.setState({
      commonModalVisible: true,
      modalProps: {
        modalTitle: title,
        record,
        valueType,
      },
    });
    const { dispatch } = this.props;
    if (name) {
      dispatch({
        type: 'ecClient/fetchCommonData',
        payload: {
          ecClientId: record.ecClientId,
          valueType,
        },
      });
    }
    dispatch({
      type: 'ecClient/queryMapParentStatusList',
      payload: {
        lovCode: name,
        parentValue: record.ecPlatform,
      },
    });
  }

  /**
   * 公共模态框-新增行
   */
  @Bind()
  commonCreate() {
    const {
      dispatch,
      ecClient: { commonData = [] },
    } = this.props;
    dispatch({
      type: 'ecClient/updateState',
      payload: {
        commonData: [
          ...commonData,
          {
            enabledFlag: 1,
            valueId: uuidv4(),
            _status: 'create',
          },
        ],
      },
    });
  }

  /**
   * 公共模态框-保存
   */
  @Bind()
  commonSave() {
    const {
      dispatch,
      ecClient: { commonData = [] },
    } = this.props;
    const {
      modalProps: { record, valueType },
    } = this.state;
    const newParams = getEditTableData(commonData, ['valueId']);
    newParams.map(item => {
      // eslint-disable-next-line no-param-reassign
      item.ecClientId = record.ecClientId;
      // eslint-disable-next-line no-param-reassign
      item.tenantId = record.tenantId;
      // eslint-disable-next-line no-param-reassign
      item.valueType = valueType;
      // eslint-disable-next-line no-param-reassign
      delete item.name;
      return item;
    });
    if (!isEmpty(newParams)) {
      dispatch({
        type: 'ecClient/saveModalData',
        payload: newParams,
      }).then(res => {
        if (res) {
          dispatch({
            type: 'ecClient/fetchCommonData',
            payload: {
              ecClientId: record.ecClientId,
              valueType,
            },
          });
          notification.success();
        }
      });
    }
  }

  /**
   * 公共模态框-批量删除
   */
  @Bind()
  commonDelete() {
    const {
      dispatch,
      ecClient: { commonData = [] },
    } = this.props;
    const { commonSelectedRowKeys } = this.state;
    // 过滤出勾选数据
    const newParameters = filter(commonData, item => {
      return commonSelectedRowKeys.indexOf(item.valueId) >= 0;
    });
    // 过滤出勾选数据的剩下数据
    const newData = filter(commonData, item => {
      return commonSelectedRowKeys.indexOf(item.valueId) < 0;
    });
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.remove').d('确定删除选中数据?'),
      onOk: () => {
        const remoteDelete = [];
        const localDelete = [];
        newParameters.forEach(item => {
          if (item._status === 'create') {
            localDelete.push(item);
          } else if (item._status === 'update') {
            remoteDelete.push(item);
          }
        });
        if (isEmpty(remoteDelete)) {
          dispatch({
            type: 'ecClient/updateState',
            payload: {
              commonData: newData,
            },
          });
          this.setState({ commonSelectedRowKeys: [], commonSelectedRows: [] });
        } else {
          dispatch({
            type: 'ecClient/deleteModalData',
            payload: {
              remoteDelete,
            },
          }).then(res => {
            if (res) {
              notification.success();
              dispatch({
                type: 'ecClient/updateState',
                payload: {
                  commonData: newData,
                },
              });
              this.setState({ commonSelectedRowKeys: [], commonSelectedRows: [] });
            }
          });
        }
      },
    });
  }

  /**
   * 公共模态框-获取删除选中行
   * @param {*} selectedRowKeys
   */
  @Bind()
  commonRowSelectChange(selectedRowKeys, selectedRows) {
    this.setState({
      commonSelectedRowKeys: selectedRowKeys,
      commonSelectedRows: selectedRows,
    });
  }

  /**
   * 渲染方法
   * @returns
   */
  render() {
    const {
      ecClient: { data = [], commonData = [], mapStatusList = [] },
      saveLoading,
      fetchLoading,
      fetchInitDataLoading,
      fetchCommonDataLoading,
      history,
      activateLoading,
    } = this.props;
    const {
      modalVisible,
      editRowData,
      initDataModalVisible,
      changePwdModalVisible,
      commonModalVisible,
      modalProps,
      initStatus,
      commonSelectedRowKeys = [],
      commonSelectedRows = [],
    } = this.state;
    const commonRowSelection = {
      selectedRowKeys: commonSelectedRowKeys,
      onChange: this.commonRowSelectChange,
    };
    const columns = [
      {
        title: intl.get('scec.ecClient.model.ecClient.ecPlatform').d('电商平台代码'),
        dataIndex: 'ecPlatform',
        width: 130,
      },
      {
        title: intl.get('scec.common.model.ecPlatformName').d('电商名称'),
        dataIndex: 'ecPlatformName',
        width: 130,
      },
      {
        title: intl.get('scec.ecClient.model.ecClient.code').d('电商公司编码'),
        dataIndex: 'ecCompanyNum',
        width: 120,
      },
      {
        title: intl.get('scec.common.model.ecClientName').d('电商公司名称'),
        dataIndex: 'ecCompanyName',
      },
      {
        title: intl.get('scec.ecClient.model.ecClient.userName').d('账户名'),
        dataIndex: 'userName',
        width: 120,
      },
      {
        title: intl.get('scec.common.model.productStatus').d('状态'),
        dataIndex: 'enabledFlag',
        render: enableRender,
        width: 80,
      },
      {
        title: intl.get('scec.ecClient.model.ecClient.activateStatus').d('激活状态'),
        dataIndex: 'activateFlag',
        render: activateRender,
        width: 100,
      },
      {
        title: intl.get('scec.ecClient.model.ecClient.invoiceMethod').d('开票方式'),
        dataIndex: 'invoiceMethod',
        width: 100,
        render: (index, record) => (
          <a
            onClick={() =>
              this.handleVisible(
                record,
                intl.get('scec.common.model.invoiceMethod').d('开票方式'),
                'SCEC.INVOICE_METHOD',
                'INVOICE_METHOD'
              )
            }
          >
            {intl.get('scec.common.model.invoiceMethod').d('开票方式')}
          </a>
        ),
      },
      {
        title: intl.get('scec.ecClient.model.ecClient.invoiceTitles').d('发票形式'),
        dataIndex: 'invoiceTitle',
        width: 120,
        render: (index, record) => (
          <a
            onClick={() =>
              this.handleVisible(
                record,
                intl.get('scec.ecClient.model.ecClient.invoiceTitles').d('发票形式'),
                'SCEC.INVOICE_TITLE',
                'INVOICE_TITLE'
              )
            }
          >
            {intl.get('scec.common.model.invoiceTitles').d('发票形式')}
          </a>
        ),
      },
      {
        title: intl.get('scec.ecClient.model.ecClient.invoiceTypes').d('发票类型'),
        dataIndex: 'invoiceType',
        width: 100,
        render: (index, record) => (
          <a
            onClick={() =>
              this.handleVisible(
                record,
                intl.get('scec.ecClient.model.ecClient.invoiceTypes').d('发票类型'),
                'SCEC.INVOICE_TYPE',
                'INVOICE_TYPE'
              )
            }
          >
            {intl.get('scec.common.model.invoiceTypes').d('发票类型')}
          </a>
        ),
      },
      {
        title: intl.get('scec.ecClient.model.ecClient.invoiceDetails').d('发票明细'),
        dataIndex: 'invoiceDetail',
        width: 120,
        render: (index, record) => (
          <a
            onClick={() =>
              this.handleVisible(
                record,
                intl.get('scec.ecClient.model.ecClient.invoiceDetails').d('发票明细'),
                'SCEC.INVOICE_DETAIL',
                'INVOICE_DETAIL'
              )
            }
          >
            {intl.get('scec.common.model.invoiceDetails').d('发票明细')}
          </a>
        ),
      },
      {
        title: intl.get('scec.common.model.paymentMethods').d('支付方式'),
        dataIndex: 'paymentMethod',
        width: 100,
        render: (index, record) => (
          <a
            onClick={() =>
              this.handleVisible(
                record,
                intl.get('scec.common.model.paymentMethods').d('支付方式'),
                'SCEC.PAYMENT_METHODS',
                'PAYMENT_TYPE'
              )
            }
          >
            {intl.get('scec.common.model.paymentMethods').d('支付方式')}
          </a>
        ),
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        width: 300,
        render: (_, record) => (
          <span className="action-link">
            {!+record.activateFlag ? (
              <a
                onClick={() => {
                  this.onActivate(record);
                }}
              >
                {intl.get('scec.ecClient.view.option.accountActivation').d('账户激活')}
              </a>
            ) : (
              <React.Fragment>
                <a
                  onClick={() => {
                    this.handleInitDataModal(true, record);
                  }}
                >
                  {intl.get('scec.common.model.dataSync').d('数据同步')}
                </a>
              </React.Fragment>
            )}
            <a
              onClick={() => {
                this.onShowChangePwdModal(true, record);
              }}
            >
              {intl.get('scec.ecClient.view.option.changePwd').d('修改密码')}
            </a>
            <a
              onClick={() => {
                this.editEcClient(true, record);
              }}
            >
              {intl.get('hzero.common.button.edit').d('编辑')}
            </a>
            <a
              onClick={() => {
                history.push(`/scec/ec-client/assign?ecClientId=${record.ecClientId}`);
              }}
            >
              {intl.get('scec.ecClient.view.ecClient.assignmentSet').d('分配设置')}
            </a>
          </span>
        ),
      },
    ];
    const editFormOptions = {
      modalVisible,
      editRowData,
      loading: saveLoading,
      activateLoading,
      onHandleAddECClient: this.handleAddECClient,
      showEditModal: this.showEditModal,
      onFetchECClient: this.fetchECClient,
      onActivate: this.onActivate,
    };
    return (
      <React.Fragment>
        <Header title={intl.get('scec.ecClient.view.message.title').d('电商账号管理')}>
          <Button icon="plus" type="primary" onClick={() => this.showEditModal(true)}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
        </Header>
        <Content>
          <Table
            bordered
            loading={fetchLoading || fetchInitDataLoading}
            rowKey="ecClientId"
            dataSource={data}
            columns={columns}
            pagination={false}
            scroll={{ x: 1500 }}
          />
          <EditForm {...editFormOptions} />
          <InitDataModal
            loading={fetchInitDataLoading}
            initStatus={initStatus}
            onInitSingleData={this.onInitSingleData}
            initDataModalVisible={initDataModalVisible}
            handleInitDataModal={this.handleInitDataModal}
            onInitSyncData={this.onInitSyncData}
          />
          <ChangePwdForm
            changePwdModalVisible={changePwdModalVisible}
            showChangePwdModal={this.onShowChangePwdModal}
            saveNewPwd={this.onSaveNewPwd}
          />
          <CommonModal
            {...modalProps}
            loading={fetchCommonDataLoading}
            commonModalVisible={commonModalVisible}
            commonData={commonData}
            mapStatusList={mapStatusList}
            onHandleVisible={this.handleVisible}
            onCloseCommonModal={this.closeCommonModal}
            onCreate={this.commonCreate}
            onDelete={this.commonDelete}
            onSave={this.commonSave}
            commonRowSelection={commonRowSelection}
            commonSelectedRows={commonSelectedRows}
            commonSelectedRowKeys={commonSelectedRowKeys}
          />
        </Content>
      </React.Fragment>
    );
  }
}
