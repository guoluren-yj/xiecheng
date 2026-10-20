/**
 * index.js - 平台邮件接收用户定义
 * @date: 2020-11-5
 * @author: yanglin <lin.yang05@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */

/* eslint no-underscore-dangle: 0 */
import React, { Component } from 'react';
import { connect } from 'dva';
import { isEmpty, isUndefined } from 'lodash';
import { Table, Button, Modal, Popconfirm } from 'hzero-ui';
import { Header, Content } from 'components/Page';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import { enableRender } from 'utils/renderer';
import { filterNullValueObject } from 'utils/utils';
import FilterForm from './FilterForm';
import UserModal from './UserModal';

@connect(({ emailReceiveUser, loading }) => ({
  emailReceiveUser,
  loading: loading.effects['emailReceiveUser/queryNoticeUser'],
  userLoading: loading.effects['emailReceiveUser/queryUdtUser'],
  deleteLoding: loading.effects['emailReceiveUser/removeNoticeUser'],
  addLoading: loading.effects['emailReceiveUser/addNoticeUser'],
}))
@formatterCollections({
  code: 'spfm.emailReceiveUser',
})
export default class TableList extends Component {
  constructor(props) {
    super(props);
    this.filterForm = {}; // 表单查询条件表单组件
    this.userModalForm = {};
    this.state = {
      userModalVisable: false,
      selectedRows: [],
    };
  }

  componentDidMount() {
    this.handleSearch();
  }

  // 查询平台邮件接收用户列表
  @Bind()
  handleSearch(fields = {}) {
    const { dispatch } = this.props;
    const { form } = this.filterForm.props;
    const fieldValues = isUndefined(form) ? {} : filterNullValueObject(form.getFieldsValue());
    dispatch({
      type: 'emailReceiveUser/queryNoticeUser',
      payload: {
        page: isEmpty(fields) ? {} : fields,
        ...fieldValues,
      },
    });
  }

  // 查询选择用户的列表
  @Bind()
  handleUserSearch(fields = {}) {
    const { dispatch } = this.props;
    const { form } = this.userModalForm.props;
    const fieldValues = isUndefined(form) ? {} : filterNullValueObject(form.getFieldsValue());
    dispatch({
      type: 'emailReceiveUser/queryUdtUser',
      payload: {
        page: isEmpty(fields) ? {} : fields,
        ...fieldValues,
      },
    });
  }

  // 创建平台邮件接收用户
  @Bind()
  handleCreate(payload) {
    const { dispatch } = this.props;
    dispatch({
      type: 'emailReceiveUser/addNoticeUser',
      payload,
    }).then(() => {
      this.handleSearch();
      this.handleCloseModal();
      notification.success();
    });
  }

  // 删除平台邮件接收用户
  @Bind()
  handleRemove(payload) {
    const { dispatch } = this.props;
    Modal.confirm({
      title: intl.get(`hzero.common.message.confirm.title`).d('提示'),
      content: intl.get(`spfm.emailReceiveUser.view.confirm.message`).d('是否确定删除选中数据'),
      onOk: () => {
        dispatch({
          type: 'emailReceiveUser/removeNoticeUser',
          payload,
        }).then(() => {
          this.setState(
            {
              selectedRows: [],
            },
            () => {
              this.handleSearch();
              notification.success();
            }
          );
        });
      },
    });
  }

  // 更新平台邮件接收用户
  @Bind()
  handleUpdate(payload = {}) {
    const { enabledFlag } = payload;
    const { dispatch } = this.props;
    dispatch({
      type: 'emailReceiveUser/updateNoticeUser',
      payload: {
        ...payload,
        enabledFlag: enabledFlag ? 0 : 1,
      },
    }).then(() => {
      this.handleSearch();
      notification.success();
    });
  }

  // 打开选择用户的模态框
  @Bind()
  handleOpenUserModal() {
    this.setState(
      {
        userModalVisable: true,
      },
      () => {
        this.handleUserSearch();
      }
    );
  }

  // 关闭选择用户的模态框
  @Bind()
  handleCloseModal() {
    this.setState({
      userModalVisable: false,
    });
  }

  /**
   * 勾选行
   */
  @Bind()
  onTableSelectedRowChange(_, selectedRows) {
    this.setState({
      selectedRows,
    });
  }

  /**
   *
   * @param {object} ref - FilterForm子组件对象
   */
  @Bind()
  handleBindRef(ref = {}) {
    this.filterForm = ref;
  }

  render() {
    const {
      emailReceiveUser: { data = [], pagination = [], userList = [], userPagination = {} },
      loading,
      userLoading,
      deleteLoding,
      addLoading,
    } = this.props;
    const { userModalVisable, selectedRows = [] } = this.state;
    const rowSelection = {
      selectedRowKeys: selectedRows.map((n) => n.userId),
      onChange: this.onTableSelectedRowChange,
    };
    const filterProps = {
      onSearch: this.handleSearch,
      onRef: this.handleBindRef,
    };
    const userModalProps = {
      dataSource: userList,
      loading: userLoading,
      pagination: userPagination,
      visible: userModalVisable,
      onOK: this.handleCreate,
      onRef: (ref) => {
        this.userModalForm = ref;
      },
      onCancel: this.handleCloseModal,
      onSearch: this.handleUserSearch,
    };
    const columns = [
      {
        title: intl.get('spfm.emailReceiveUser.model.emailReceiveUser.loginName').d('账号'),
        width: 200,
        dataIndex: 'loginName',
      },
      {
        title: intl.get('spfm.emailReceiveUser.model.emailReceiveUser.realName').d('用户名'),
        width: 200,
        dataIndex: 'realName',
      },
      {
        title: intl.get('spfm.emailReceiveUser.model.emailReceiveUser.phone').d('手机号码'),
        width: 400,
        dataIndex: 'phone',
      },
      {
        title: intl.get('spfm.emailReceiveUser.model.emailReceiveUser.email').d('邮箱'),
        dataIndex: 'email',
      },
      {
        title: intl.get('spfm.emailReceiveUser.model.emailReceiveUser.enabledFlag').d('状态'),
        width: 150,
        dataIndex: 'enabledFlag',
        render: enableRender,
      },
      {
        title: intl.get('spfm.emailReceiveUser.model.emailReceiveUser.option').d('操作'),
        width: 150,
        dataIndex: 'action',
        render: (_, record) => (
          <React.Fragment>
            <Popconfirm
              title={
                record.enabledFlag === 0
                  ? intl.get('spfm.emailReceiveUser.model.option.enabledFlag').d('是否启用该用户？')
                  : intl.get('spfm.emailReceiveUser.model.option.disable').d('是否禁用该用户？')
              }
              onConfirm={() => this.handleUpdate(record)}
            >
              <a>
                {record.enabledFlag === 1
                  ? intl.get('hzero.common.status.disable').d('禁用')
                  : intl.get('hzero.common.status.enableFlag').d('启用')}
              </a>
            </Popconfirm>
          </React.Fragment>
        ),
      },
    ];

    return (
      <React.Fragment>
        <Header
          title={intl
            .get('spfm.emailReceiveUser.view.title.emailReceiveUser')
            .d('平台邮件接收用户定义')}
        >
          <Button
            loading={deleteLoding || addLoading}
            icon="plus"
            type="primary"
            onClick={() => this.handleOpenUserModal()}
          >
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
          <Button
            loading={deleteLoding || addLoading}
            icon="delete"
            onClick={() => this.handleRemove(selectedRows)}
            disabled={!selectedRows.length}
          >
            {intl.get('hzero.common.button.delete').d('删除')}
          </Button>
        </Header>
        <Content>
          <div className="table-list-search">
            <FilterForm {...filterProps} />
          </div>
          <Table
            bordered
            rowKey="userId"
            loading={loading}
            dataSource={data}
            columns={columns}
            rowSelection={rowSelection}
            onChange={(page) => this.handleSearch(page)}
            pagination={pagination}
          />
          <UserModal {...userModalProps} />
        </Content>
      </React.Fragment>
    );
  }
}
