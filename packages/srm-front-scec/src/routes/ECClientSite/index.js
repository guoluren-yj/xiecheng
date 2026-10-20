/**
 * ecClientSite- 平台电商-账号管理
 * @date: 2019-3-06
 * @author: Wu <qizheng.wu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import { connect } from 'dva';
import { Button, Table } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import { Content, Header } from 'components/Page';
import { enableRender, activateRender } from 'utils/renderer';
import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';

import EditForm from './EditForm';
import ChangePwdForm from './ChangePwdForm';
import PaymentTypeModal from './PaymentTypeModal';
import InitDataModal from './InitDataModal';

/**
 * 电商账号管理
 * @extends {Component} - React.Component
 * @reactProps {Object} ecClient - 数据源
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
const prompt = 'scec.ecClientSite';
@connect(({ ecClientSite, loading }) => ({
  ecClientSite,
  tenantId: getCurrentOrganizationId(),
  saveLoading: loading.effects['ecClientSite/saveECClientSite'],
  fetchLoading: loading.effects['ecClientSite/fetchECClientSite'],
  paymentTypeLoading: loading.effects['ecClientSite/fetchPaymentType'],
  fetchInitStatusLoading: loading.effects['ecClientSite/fetchInitDataStatus'],
  initSyncDataLoading: loading.effects['ecClientSite/initSyncData'],
}))
@formatterCollections({
  code: ['scec.ecClientSite', 'scec.companyBanner', 'scec.common', 'scec.ecClient'],
})
export default class ECClientSite extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      initStatus: [],
      editRowData: {},
      currentEcClientId: '',
      modalVisible: false,
      paymentTypeVisible: false,
      initDataModalVisible: false,
      changePwdModalVisible: false,
    };
  }

  componentDidMount() {
    this.fetchECClientSite();
  }

  /**
   * 获取数据
   */
  @Bind()
  fetchECClientSite() {
    const { dispatch, tenantId } = this.props;
    dispatch({
      type: 'ecClientSite/fetchECClientSite',
      payload: { tenantId },
    });
  }

  /**
   * 新建应用配置
   * @param {Object} fieldsValue 传递的fieldValue
   * @param {Object} form 表单
   */
  @Bind()
  handleAddECClientSite(fieldsValue = {}, form) {
    const { dispatch, tenantId } = this.props;
    const { editRowData } = this.state;
    dispatch({
      type:
        editRowData.ecClientId === undefined
          ? 'ecClientSite/saveECClientSite'
          : 'ecClientSite/editECClientSite',
      payload: [
        {
          tenantId,
          ...editRowData,
          ...fieldsValue,
        },
      ],
    }).then(res => {
      if (res) {
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
  editECClientSite(flag, record = {}) {
    this.setState({
      modalVisible: !!flag,
      editRowData: record,
    });
  }

  /**
   * 控制弹出框的显示隐藏
   * @param {Boolean} flag 显示/隐藏标记
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
    this.fetchECClientSite();
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
    const { dispatch, tenantId } = this.props;
    dispatch({
      type: 'ecClientSite/activateAccount',
      payload: {
        tenantId,
        ecClientId: record.ecClientId,
      },
    }).then(res => {
      if (res) {
        this.fetchECClientSite();
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
  fetchInitDataStatus(flag, record = {}) {
    const { dispatch } = this.props;
    dispatch({
      type: 'ecClientSite/fetchInitDataStatus',
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
      this.fetchInitDataStatus(flag, record);
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
      type: 'ecClientSite/initSyncData',
      payload: {
        ecClientId: editRowData.ecClientId,
      },
    }).then(res => {
      if (res) {
        this.fetchInitDataStatus(true, editRowData);
        notification.success();
      }
    });
  }

  /**
   * 单条数据同步
   * @param {当前步骤} step
   */
  @Bind()
  onInitSingleData(step) {
    const { dispatch } = this.props;
    const { editRowData } = this.state;
    dispatch({
      type: 'ecClientSite/singleInit',
      payload: {
        step,
        ecClientId: editRowData.ecClientId,
      },
    }).then(res => {
      if (res) {
        this.fetchInitDataStatus(true, editRowData);
        notification.success();
      }
    });
  }

  /**
   * 保存新密码
   * @param {Object} value
   */
  @Bind()
  onSaveNewPwd(value = {}) {
    const { dispatch, tenantId } = this.props;
    const { currentEcClientId } = this.state;
    dispatch({
      type: 'ecClientSite/changePwd',
      payload: {
        tenantId,
        ...value,
        ecClientId: currentEcClientId,
      },
    }).then(res => {
      if (res) {
        notification.success();
        this.onShowChangePwdModal(false);
        this.fetchECClientSite();
      }
    });
  }

  /**
   * 显示密码修改弹出框、
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
   * 控制支付方式弹框
   * @param {Boolean} flag 显示/隐藏标记
   * @param {Object} record 行数据
   */
  @Bind()
  onHandlePaymentVisible(flag, record = {}) {
    const { dispatch, tenantId } = this.props;
    if (flag) {
      dispatch({
        type: 'ecClientSite/fetchPaymentType',
        payload: {
          tenantId,
          ecClientId: record.ecClientId,
        },
      });
    } else {
      dispatch({
        type: 'ecClientSite/updateState',
        payload: {
          paymentType: [],
        },
      });
    }
    this.setState({
      paymentTypeVisible: !!flag,
    });
  }

  /**
   * 渲染方法
   * @returns
   */
  render() {
    const {
      fetchLoading,
      paymentTypeLoading,
      fetchInitStatusLoading,
      ecClientSite: { data = [], paymentType = [] },
    } = this.props;
    const {
      initStatus,
      editRowData,
      modalVisible,
      paymentTypeVisible,
      initDataModalVisible,
      changePwdModalVisible,
    } = this.state;
    const columns = [
      {
        title: intl.get(`${prompt}.model.ecClientSite.ecplatformCode`).d('电商平台代码'),
        width: 120,

        dataIndex: 'ecPlatform',
      },
      {
        title: intl.get(`${prompt}.model.ecClientSite.ecPlatformName`).d('电商名称'),
        width: 120,
        dataIndex: 'ecPlatformName',
      },
      {
        title: intl.get(`${prompt}.model.ecClientSite.ecCompanyNum`).d('电商公司编码'),
        width: 120,
        dataIndex: 'ecCompanyNum',
      },
      {
        title: intl.get(`${prompt}.model.ecClientSite.ecCompanyName`).d('电商公司名称'),
        dataIndex: 'ecCompanyName',
      },
      {
        title: intl.get(`${prompt}.model.ecClientSite.paymentMethod`).d('支付方式'),
        dataIndex: 'paymentMethod',
        align: 'center',
        wdith: 120,
        render: (index, record) => (
          <a onClick={() => this.onHandlePaymentVisible(true, record)}>
            {intl.get(`${prompt}.model.ecClientSite.paymentMethod`).d('支付方式')}
          </a>
        ),
      },
      {
        title: intl.get(`${prompt}.model.ecClientSite.userName`).d('账号名'),
        dataIndex: 'userName',
        width: 120,
      },
      {
        title: intl.get(`${prompt}.model.ecClientSite.enabledFlag`).d('状态'),
        dataIndex: 'enabledFlag',
        render: enableRender,
        width: 80,
      },
      {
        title: intl.get(`${prompt}.model.ecClientSite.activateFlag`).d('激活状态'),
        dataIndex: 'activateFlag',
        render: activateRender,
        width: 90,
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        width: 300,
        render: (_, record) => (
          <span className="action-link">
            {record.activateFlag ? (
              <React.Fragment>
                <a onClick={() => this.handleInitDataModal(true, record)}>
                  {intl.get(`${prompt}.model.ecClientSite.dataSyn`).d('数据同步')}
                </a>
              </React.Fragment>
            ) : (
              <a onClick={() => this.onActivate(record)}>
                {intl.get(`${prompt}.model.ecClientSite.accountActivation`).d('账户激活')}
              </a>
            )}
            <a onClick={() => this.onShowChangePwdModal(true, record)}>
              {intl.get(`${prompt}.model.ecClientSite.changePassword`).d('修改密码')}
            </a>
            <a onClick={() => this.editECClientSite(true, record)}>
              {intl.get('hzero.common.button.edit').d('编辑')}
            </a>
          </span>
        ),
      },
    ];
    const editFormOptions = {
      modalVisible,
      editRowData,
      onHandleAddECClient: this.handleAddECClientSite,
      showEditModal: this.showEditModal,
      onFetchECClient: this.fetchECClient,
      onActivate: this.onActivate,
    };
    const initDataModalOptions = {
      initStatus,
      initDataModalVisible,
      loading: this.fetchInitStatusLoading,
      onInitSingleData: this.onInitSingleData,
      onInitSyncData: this.onInitSyncData,
      handleInitDataModal: this.handleInitDataModal,
    };
    const changePwdFormOptions = {
      changePwdModalVisible,
      saveNewPwd: this.onSaveNewPwd,
      showChangePwdModal: this.onShowChangePwdModal,
    };
    const paymentTypeModalOptions = {
      paymentType,
      paymentTypeVisible,
      loading: paymentTypeLoading,
      onHandlePaymentVisible: this.onHandlePaymentVisible,
    };

    return (
      <React.Fragment>
        <Header title={intl.get(`scec.ecClient.view.message.title`).d('电商账号管理')}>
          <Button icon="plus" type="primary" onClick={() => this.showEditModal(true)}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
        </Header>
        <Content>
          <Table
            bordered
            rowKey="ecClientId"
            dataSource={data}
            columns={columns}
            loading={fetchLoading || fetchInitStatusLoading}
          />
          <EditForm {...editFormOptions} />
          <InitDataModal {...initDataModalOptions} />
          <ChangePwdForm {...changePwdFormOptions} />
          <PaymentTypeModal {...paymentTypeModalOptions} />
        </Content>
      </React.Fragment>
    );
  }
}
