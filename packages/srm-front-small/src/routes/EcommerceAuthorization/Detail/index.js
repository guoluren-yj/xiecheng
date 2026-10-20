import React, { Component } from 'react';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { Button, Form, Table, Popconfirm } from 'hzero-ui';
import { withRouter } from 'react-router-dom';
import { isEmpty } from 'lodash';

import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { Header, Content } from 'components/Page';
import notification from 'utils/notification';

import EditModal from './EditModal';

@withRouter
@connect(({ ecommerceAuthorization, loading }) => ({
  ecommerceAuthorization,
  whiteLoading: loading.effects['ecommerceAuthorization/fetchWhiteList'],
  blackLoading: loading.effects['ecommerceAuthorization/fetchBlackList'],
}))
@Form.create({ fieldNameProp: null })
@formatterCollections({ code: ['small.ecommerceAuthorization', 'small.common'] })
export default class Detail extends Component {
  constructor(props) {
    super(props);
    const { accountId, type } = this.props.match.params;
    this.state = {
      visible: false,
      editData: {},
      accountId,
      type,
    };
  }

  componentDidMount() {
    this.handleSearch();
  }

  @Bind()
  handleSearch(page = {}) {
    const { dispatch } = this.props;
    const { type, accountId } = this.state;
    if (type === 'white') {
      dispatch({
        type: 'ecommerceAuthorization/fetchWhiteList',
        payload: { accountId, page: isEmpty(page) ? {} : page },
      });
    }
    if (type === 'black') {
      dispatch({
        type: 'ecommerceAuthorization/fetchBlackList',
        payload: { accountId },
      });
    }
  }

  @Bind()
  handleEdit(record = {}) {
    this.setState({
      visible: true,
      editData: record,
    });
  }

  @Bind()
  handleAdd() {
    this.setState({
      visible: true,
      editData: {},
    });
  }

  @Bind()
  handleClose() {
    this.setState({
      visible: false,
    });
  }

  /**
   * 删除
   * @param {Object} record - 行数据
   */
  @Bind()
  handleDelete(record) {
    const { dispatch } = this.props;
    const { type, accountId } = this.state;
    if (type === 'white') {
      dispatch({
        type: 'ecommerceAuthorization/deleteAdjust',
        payload: { id: record.id },
      }).then((res) => {
        if (!res.success) {
          notification.error({
            message: res.resultMsg,
          });
        } else {
          notification.success();
          dispatch({
            type: 'ecommerceAuthorization/fetchWhiteList',
            payload: { accountId },
          });
        }
      });
    } else {
      dispatch({
        type: 'ecommerceAuthorization/deleteAdjust',
        payload: { id: record.id },
      }).then((res) => {
        if (!res.success) {
          notification.error({
            message: res.resultMsg,
          });
        } else {
          notification.success();
          dispatch({
            type: 'ecommerceAuthorization/fetchBlackList',
            payload: { accountId },
          });
        }
      });
    }
  }

  /**
   * 添加
   */
  @Bind()
  handleSave(fieldsValue = {}) {
    const { type, editData, accountId } = this.state;
    const { dispatch } = this.props;
    dispatch({
      type: 'ecommerceAuthorization/saveWhiteList',
      payload: {
        ...editData,
        ...fieldsValue,
        type: type === 'white' ? 'IPWHITE' : 'IPBLACK',
        accountId,
      },
    }).then((res) => {
      if (!res.success) {
        notification.error({
          message: res.resultMsg,
        });
      } else {
        notification.success();
        this.setState({ visible: false });
        this.handleSearch();
      }
    });
  }

  render() {
    const { visible, editData, type } = this.state;
    const {
      ecommerceAuthorization: { whiteList, blackList, whitePagination = {}, blackPagination = {} },
      whiteLoading,
      blackLoading,
    } = this.props;
    const columns = [
      {
        title: intl.get('small.common.model.num').d('序号'),
        dataIndex: 'id',
      },
      {
        title: intl.get('small.common.model.ipAddr').d('IP地址'),
        dataIndex: 'ipAddress',
      },
      {
        title: intl.get('small.common.model.operation').d('操作'),
        render: (record) => (
          <span className="action-link">
            <a onClick={() => this.handleEdit(record)}>
              {intl.get('hzero.common.button.edit').d('编辑')}
            </a>
            <Popconfirm
              placement="topRight"
              title={intl.get('small.common.view.confirmDelete').d('确认删除？')}
              onConfirm={() => this.handleDelete(record)}
            >
              <a>{intl.get('hzero.common.button.delete').d('删除')}</a>
            </Popconfirm>
          </span>
        ),
      },
    ];
    return (
      <React.Fragment>
        <Header
          title={
            type === 'white'
              ? intl.get('small.common.model.whiteList').d('白名单')
              : intl.get('small.common.model.blackList').d('黑名单')
          }
          backPath="/small/ecommerce-authorization/list"
        >
          <Button onClick={this.handleAdd}>
            {intl.get('small.ecommerceAuthorization.view.ecommerceAuthorization.new').d('新建')}
          </Button>
        </Header>
        <Content>
          <Table
            className="small-table-all-space"
            bordered
            columns={columns}
            rowKey="id"
            loading={whiteLoading || blackLoading}
            dataSource={type === 'white' ? whiteList : blackList}
            pagination={type === 'white' ? whitePagination : blackPagination}
            onChange={(page) => this.handleSearch(page)}
          />
          {visible && (
            <EditModal
              editData={editData}
              visible={visible}
              onClose={this.handleClose}
              onHandleOK={this.handleSave}
              type={type}
            />
          )}
        </Content>
      </React.Fragment>
    );
  }
}
