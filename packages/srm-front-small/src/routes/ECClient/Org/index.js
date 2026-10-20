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
import { enableRender } from 'utils/renderer';
import formatterCollections from 'utils/intl/formatterCollections';

import EditForm from './EditForm';
import CommonModal from './CommonModal';
import ChangePwdForm from './ChangePwdForm';
import FreightTypeModal from './FreightTypeModal';

/**
 * 电商账号管理
 * @extends {Component} - React.Component
 * @reactProps {Object} smallEcClient - 数据源
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */

@connect(({ smallEcClient, loading }) => ({
  smallEcClient,
  saveLoading: loading.effects['smallEcClient/saveECClient'],
  editLoading: loading.effects['smallEcClient/editECClient'],
  fetchLoading: loading.effects['smallEcClient/fetchECClient'],
  fetchInitDataLoading: loading.effects['smallEcClient/fetchInitDataStatus'],
  initSyncDataLoading: loading.effects['smallEcClient/initSyncData'],
  fetchCommonDataLoading: loading.effects['smallEcClient/fetchCommonData'],
}))
@withRouter
@formatterCollections({ code: ['small.ecClient', 'small.common', 'small.ecClientSite'] })
export default class ECClient extends React.Component {
  /**
   * 内部状态
   */
  state = {
    modalVisible: false, // 编辑弹框显示/隐藏标记
    changePwdModalVisible: false, // 密码修改弹框显示/隐藏标记
    editRowData: {}, // 编辑时存取的值
    currentEcClientId: '', // 当前的主键
    commonSelectedRowKeys: [], // 公共modal选中id
    commonSelectedRows: [], // 公共modal选中行
    commonModalVisible: false, // 公共modal显示/隐藏标记
    freightModalVisible: false,
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
      type: 'smallEcClient/fetchECClient',
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
        editRowData.ecClientId === undefined
          ? 'smallEcClient/saveECClient'
          : 'smallEcClient/editECClient',
      payload: [
        {
          ...editRowData,
          ...fieldsValue,
        },
      ],
    }).then((response) => {
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
      type: 'smallEcClient/fetchDetailData',
      payload: {
        ecClientId: record.ecClientId,
      },
    }).then((res) => {
      if (res) {
        this.setState({
          modalVisible: !!flag,
          editRowData: { ...record, customerCode: record.customerCode },
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
      type: 'smallEcClient/activateAccount',
      payload: {
        ecClientId: record.ecClientId,
      },
    }).then((res) => {
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
      type: 'smallEcClient/fetchInitDataStatus',
      payload: {
        ecClientId: record.ecClientId,
      },
    }).then((res) => {
      if (res) {
        this.setState({
          editRowData: record,
        });
      }
    });
  }

  /**
   * 数据初始化
   */
  @Bind()
  onInitSyncData() {
    const { dispatch } = this.props;
    const { editRowData } = this.state;
    dispatch({
      type: 'smallEcClient/initSyncData',
      payload: {
        ecClientId: editRowData.ecClientId,
      },
    }).then((res) => {
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
      type: 'smallEcClient/singleInit',
      payload: {
        step,
        ecClientId: editRowData.ecClientId,
      },
    }).then((res) => {
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
      type: 'smallEcClient/changePwd',
      payload: {
        ...value,
        ecClientId: currentEcClientId,
      },
    }).then((res) => {
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
      freightModalVisible: false,
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
      [valueType === 'FREIGHT_TYPE' ? 'freightModalVisible' : 'commonModalVisible']: true,
      modalProps: {
        modalTitle: title,
        record,
        valueType,
      },
    });
    const { dispatch } = this.props;
    if (name) {
      dispatch({
        type: 'smallEcClient/fetchCommonData',
        payload: {
          ecClientId: record.ecClientId,
          valueType,
        },
      });
    }
    dispatch({
      type: 'smallEcClient/queryMapParentStatusList',
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
      smallEcClient: { commonData = [] },
    } = this.props;
    dispatch({
      type: 'smallEcClient/updateState',
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
  commonSave(param, type) {
    const {
      dispatch,
      smallEcClient: { commonData = [] },
    } = this.props;
    const {
      modalProps: { record, valueType },
    } = this.state;
    let newParams;
    if (type !== 'freightType') {
      newParams = getEditTableData(commonData, ['valueId']);
      newParams.map((item) => {
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
    } else {
      newParams = param;
    }
    if (!isEmpty(newParams)) {
      dispatch({
        type: 'smallEcClient/saveModalData',
        payload: newParams,
      }).then((res) => {
        if (res) {
          dispatch({
            type: 'smallEcClient/fetchCommonData',
            payload: {
              ecClientId: record.ecClientId,
              valueType,
            },
          });
          this.setState({
            [valueType === 'FREIGHT_TYPE' ? 'freightModalVisible' : 'commonModalVisible']: false,
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
      smallEcClient: { commonData = [] },
    } = this.props;
    const { commonSelectedRowKeys } = this.state;
    // 过滤出勾选数据
    const newParameters = filter(commonData, (item) => {
      return commonSelectedRowKeys.indexOf(item.valueId) >= 0;
    });
    // 过滤出勾选数据的剩下数据
    const newData = filter(commonData, (item) => {
      return commonSelectedRowKeys.indexOf(item.valueId) < 0;
    });
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.remove').d('确定删除选中数据?'),
      onOk: () => {
        const remoteDelete = [];
        const localDelete = [];
        newParameters.forEach((item) => {
          if (item._status === 'create') {
            localDelete.push(item);
          } else if (item._status === 'update') {
            remoteDelete.push(item);
          }
        });
        if (isEmpty(remoteDelete)) {
          dispatch({
            type: 'smallEcClient/updateState',
            payload: {
              commonData: newData,
            },
          });
          this.setState({ commonSelectedRowKeys: [], commonSelectedRows: [] });
        } else {
          dispatch({
            type: 'smallEcClient/deleteModalData',
            payload: {
              remoteDelete,
            },
          }).then((res) => {
            if (res) {
              notification.success();
              dispatch({
                type: 'smallEcClient/updateState',
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
      smallEcClient: { data = [], commonData = [], mapStatusList = [] },
      saveLoading,
      editLoading,
      fetchLoading,
      fetchInitDataLoading,
      fetchCommonDataLoading,
      history,
      activateLoading,
    } = this.props;
    const {
      modalVisible,
      editRowData,
      changePwdModalVisible,
      commonModalVisible,
      freightModalVisible,
      modalProps,
      commonSelectedRowKeys = [],
      commonSelectedRows = [],
    } = this.state;
    const commonRowSelection = {
      selectedRowKeys: commonSelectedRowKeys,
      onChange: this.commonRowSelectChange,
    };
    const columns = [
      {
        title: intl.get('small.ecClient.model.ecClient.ecPlatform.code').d('电商平台代码'),
        dataIndex: 'ecPlatform',
        width: 120,
      },
      {
        title: intl.get('small.common.model.ecPlatformName').d('电商名称'),
        dataIndex: 'ecPlatformName',
        width: 120,
      },
      {
        title: intl.get('small.ecClient.model.ecClient.code').d('电商公司编码'),
        dataIndex: 'ecCompanyNum',
        width: 120,
      },
      {
        title: intl.get('small.common.model.ecCompanyName').d('电商公司名称'),
        dataIndex: 'ecCompanyName',
      },
      {
        title: intl.get('small.ecClient.model.ecClient.userName').d('账户名'),
        dataIndex: 'userName',
        width: 120,
      },
      {
        title: intl.get('hzero.common.button.status').d('状态'),
        dataIndex: 'enabledFlag',
        render: enableRender,
        width: 80,
      },
      {
        title: intl.get('small.common.model.invoiceMethod').d('开票方式'),
        dataIndex: 'invoiceMethod',
        width: 120,
        render: (index, record) => (
          <a
            onClick={() =>
              this.handleVisible(
                record,
                intl.get('small.common.model.invoiceMethod').d('开票方式'),
                'SMAL.INVOICE_METHOD',
                'INVOICE_METHOD'
              )
            }
          >
            {intl.get('small.common.model.invoiceMethod').d('开票方式')}
          </a>
        ),
      },
      {
        title: intl.get('small.common.model.invoiceForm').d('发票形式'),
        dataIndex: 'invoiceTitle',
        width: 120,
        render: (index, record) => (
          <a
            onClick={() =>
              this.handleVisible(
                record,
                intl.get('small.common.model.invoiceForm').d('发票形式'),
                'SMAL.INVOICE_TITLE',
                'INVOICE_TITLE'
              )
            }
          >
            {intl.get('small.common.model.invoiceForm').d('发票形式')}
          </a>
        ),
      },
      {
        title: intl.get('small.common.model.invoiceTypes').d('发票类型'),
        dataIndex: 'invoiceType',
        width: 120,
        render: (index, record) => (
          <a
            onClick={() =>
              this.handleVisible(
                record,
                intl.get('small.common.model.invoiceTypes').d('发票类型'),
                'SMAL.INVOICE_TYPE',
                'INVOICE_TYPE'
              )
            }
          >
            {intl.get('small.common.model.invoiceTypes').d('发票类型')}
          </a>
        ),
      },
      {
        title: intl.get('small.common.model.invoiceDetails').d('发票明细'),
        dataIndex: 'invoiceDetail',
        width: 120,
        render: (index, record) => (
          <a
            onClick={() =>
              this.handleVisible(
                record,
                intl.get('small.common.model.invoiceDetails').d('发票明细'),
                'SMAL.INVOICE_DETAIL',
                'INVOICE_DETAIL'
              )
            }
          >
            {intl.get('small.common.model.invoiceDetails').d('发票明细')}
          </a>
        ),
      },
      {
        title: intl.get('small.common.model.paymentMethod').d('支付方式'),
        dataIndex: 'paymentMethod',
        width: 100,
        render: (index, record) => (
          <a
            onClick={() =>
              this.handleVisible(
                record,
                intl.get('small.common.model.paymentMethod').d('支付方式'),
                'SMAL.PAYMENT_METHOD',
                'PAYMENT_TYPE'
              )
            }
          >
            {intl.get('small.common.model.paymentMethod').d('支付方式')}
          </a>
        ),
      },
      {
        title: intl.get('small.common.model.freightType').d('运费类型'),
        dataIndex: 'freightType',
        width: 100,
        render: (index, record) => (
          <a
            onClick={() =>
              this.handleVisible(
                record,
                intl.get('small.common.model.freightType').d('运费类型'),
                'SMAL.EC_FREIGHT_TYPE',
                'FREIGHT_TYPE'
              )
            }
          >
            {intl.get('small.common.model.freightType').d('运费类型')}
          </a>
        ),
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        width: 250,
        render: (_, record) => (
          <span className="action-link">
            {!+record.activateFlag ? (
              <a
                onClick={() => {
                  this.onActivate(record);
                }}
              >
                {intl.get('small.ecClient.view.option.accountActivation').d('账户激活')}
              </a>
            ) : (
              <a
                onClick={() => {
                  this.onShowChangePwdModal(true, record);
                }}
              >
                {intl.get('small.ecClient.view.option.changePwd').d('修改密码')}
              </a>
            )}
            <a
              onClick={() => {
                this.editEcClient(true, record);
              }}
            >
              {intl.get('hzero.common.button.edit').d('编辑')}
            </a>
            <a
              onClick={() => {
                history.push(`/small/ec-client/assign?ecClientId=${record.ecClientId}`);
              }}
            >
              {intl.get('small.ecClient.view.ecClient.assignmentSet').d('分配设置')}
            </a>
          </span>
        ),
      },
    ];
    const editFormOptions = {
      modalVisible,
      editRowData,
      loading: saveLoading || editLoading,
      activateLoading,
      onHandleAddECClient: this.handleAddECClient,
      showEditModal: this.showEditModal,
      onFetchECClient: this.fetchECClient,
      onActivate: this.onActivate,
    };
    return (
      <React.Fragment>
        <Header title={intl.get('small.ecClient.view.message.title').d('电商账号管理')}>
          <Button icon="plus" type="primary" onClick={() => this.showEditModal(true)}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
        </Header>
        <Content>
          <Table
            className="small-table-all-space"
            bordered
            loading={fetchLoading || fetchInitDataLoading}
            rowKey="ecClientId"
            dataSource={data}
            columns={columns}
            pagination={false}
          />
          <EditForm {...editFormOptions} />
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
          <FreightTypeModal
            {...modalProps}
            loading={fetchCommonDataLoading}
            commonModalVisible={freightModalVisible}
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
