/**
 * EcAcquirerAddress -收单地址
 * @date: 2019-1-25
 * @author zjx <jingxi.zhang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Bind } from 'lodash-decorators';
import { isUndefined, isEmpty } from 'lodash';
import { connect } from 'dva';
import { Button, Table, Badge, Modal } from 'hzero-ui';

import { filterNullValueObject, getResponse } from 'utils/utils';
import { queryMapIdpValue } from 'services/api';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';

import { Header, Content } from 'components/Page';

import FilterForm from './FilterForm';
import Drawer from './Drawer';
@connect(({ loading, oauthConfig = {} }) => ({
  oauthConfig,
  loading: loading.effects['oauthConfig/fetchOauthList'],
  saveLoading: loading.effects['oauthConfig/updateConfig'],
  addLoading: loading.effects['oauthConfig/addConfig'],
}))
@formatterCollections({
  code: ['spfm.oauthConfig', 'hzero.common', 'entity.tenant', 'spfm.configServer'],
})
export default class EcAcquirerAddress extends Component {
  form;

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      tableRecord: {},
      cityData: [],
      isChooseLastFlag: true,
      loginTypeOptions: [],
      supplierLoginOptions: [],
    };
  }

  componentDidMount() {
    this.fetchOauthList();
    this.queryLoginType();
  }

  @Bind()
  queryLoginType() {
    queryMapIdpValue({
      loginType: 'SPFM.LOGIN_RELATE_TYPE',
      supplierLogin: 'SPFM.SUPPLIER_SSO_LOGIN_CONTROL',
    }).then((res) => {
      const result = getResponse(res);
      if (result) {
        this.setState({
          loginTypeOptions: result.loginType || [],
          supplierLoginOptions: result.supplierLogin || [],
        });
      }
    });
  }

  // 绑定表单ref
  @Bind()
  handleRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  /**
   * 查询
   */
  @Bind()
  fetchOauthList(params) {
    const {
      dispatch,
      oauthConfig: { pagination = {} },
    } = this.props;
    const filterValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    dispatch({
      type: 'oauthConfig/fetchOauthList',
      payload: {
        page: isEmpty(params) ? pagination : params,
        ...filterValues,
      },
    });
  }

  /**
   * 保存数据
   */
  @Bind()
  handleSaveData(data = {}) {
    const { dispatch } = this.props;
    const { isChooseLastFlag } = this.state;
    if (isChooseLastFlag) {
      dispatch({
        type: 'oauthConfig/addConfig',
        payload: data,
      }).then((res) => {
        if (res) {
          notification.success();
          this.fetchOauthList();
          this.handleCancel();
        }
      });
    } else {
      dispatch({
        type: 'oauthConfig/saveConfig',
        payload: data,
      }).then((res) => {
        if (res) {
          notification.success();
          this.fetchOauthList();
          this.handleCancel();
        }
      });
    }
  }

  /**
   * 新建
   */
  @Bind()
  handleCreateData() {
    this.setState({
      visible: true,
      tableRecord: {},
      isChooseLastFlag: true,
    });
  }

  /**
   * 编辑
   */
  @Bind()
  handleEditData(record = {}) {
    this.setState({
      visible: true,
      tableRecord: record,
      isChooseLastFlag: false,
    });
  }

  @Bind()
  handleDeleteData(record = {}) {
    const { dispatch } = this.props;
    Modal.confirm({
      title: intl.get(`spfm.configServer.view.message.ifClean`).d('确认删除？'),
      onOk: () => {
        dispatch({
          type: 'oauthConfig/deleteItem',
          payload: record,
        }).then((res) => {
          if (res) {
            notification.success();
            this.fetchOauthList();
            this.handleCancel();
          }
        });
      },
    });
  }

  /**
   * 取消
   */
  @Bind()
  handleCancel() {
    this.setState({
      visible: false,
      tableRecord: {},
    });
  }

  render() {
    const {
      oauthConfig: { list = [], pagination = {} },
      loading,
      saveLoading,
      addLoading,
    } = this.props;
    const {
      visible,
      tableRecord,
      cityData = [],
      isChooseLastFlag = false,
      loginTypeOptions = [],
      supplierLoginOptions = [],
    } = this.state;

    const encryptMethodObj = {
      RSA: intl.get('spfm.oauthConfig.model.rsa').d('RSA'),
      CUSTOMIZE: intl.get('hzero.common.custom').d('自定义'),
      ADAPTOR: intl.get('hzero.common.adaptor').d('适配器'),
    };

    const columns = [
      {
        title: intl.get('entity.tenant.name').d('租户名称'),
        dataIndex: 'tenantName',
      },
      {
        title: intl.get(`spfm.oauthConfig.model.webUrl`).d('应用域名'),
        dataIndex: 'webUrl',
      },
      {
        title: intl.get(`spfm.oauthConfig.model.encryptMethod`).d('加密方式'),
        width: 120,
        dataIndex: 'encryptMethod',
        render: (_, record) => encryptMethodObj[record.encryptMethod],
      },
      {
        title: intl.get('hzero.common.status').d('状态'),
        width: 100,
        dataIndex: 'enabledFlg',
        render: (_, record) => (
          <Badge
            status={record.enabledFlg ? 'success' : 'error'}
            text={
              record.enabledFlg
                ? intl.get('hzero.common.status.enable').d('启用')
                : intl.get('hzero.common.status.disable').d('禁用')
            }
          />
        ),
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        width: 150,
        dataIndex: 'edit',
        render: (_, record) => {
          return (
            <>
              <a
                onClick={() => {
                  this.handleEditData(record);
                }}
              >
                {intl.get('hzero.common.button.edit').d('编辑')}
              </a>
              <a
                style={{ paddingLeft: '12px' }}
                onClick={() => {
                  this.handleDeleteData(record);
                }}
              >
                {intl.get('hzero.common.button.delete').d('删除')}
              </a>
            </>
          );
        },
      },
    ];
    const filterList = {
      onRef: this.handleRef,
      onFetchData: this.fetchOauthList,
    };
    const detailProps = {
      tableRecord,
      saveLoading,
      loginTypeOptions,
      supplierLoginOptions,
      addLoading,
      fetchLoading: loading,
      cityData,
      isChooseLastFlag,
      anchor: 'right',
      onCancel: this.handleCancel,
      onHandleSave: this.handleSaveData,
      onLoadData: this.handleQueryCity,
    };
    return (
      <React.Fragment>
        <Header title={intl.get('spfm.oauthConfig.view.title').d('免密登录配置')}>
          <Button type="primary" icon="plus" onClick={this.handleCreateData}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
        </Header>
        <Content>
          <div className="table-list-search">
            <FilterForm {...filterList} />
          </div>
          <Table
            pagination={pagination}
            columns={columns}
            loading={loading}
            bordered
            dataSource={list}
            rowKey="configId"
            onChange={(page) => this.fetchOauthList(page)}
          />
        </Content>
        {visible && <Drawer {...detailProps} />}
      </React.Fragment>
    );
  }
}
