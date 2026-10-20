import React, { PureComponent } from 'react';
import { Form, Button, Tooltip, Switch, Popconfirm, Modal } from 'hzero-ui';

import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import { isEmpty, isUndefined } from 'lodash';
import EditTable from 'components/EditTable';
import { tableScrollWidth, filterNullValueObject } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
// import { openTab } from 'utils/menuTab';
// import querystring from 'querystring';
import CommentImport from 'hzero-front-himp/lib/components/CommonImport';
// import qs from 'querystring';
import AddDataModal from './AddDataModal';

/**
 * 新建多选邮件接收用Modal
 * @extends {PureComponent} - React.PureComponent
 * @return React.element
 */
@formatterCollections({ code: ['spfm.notice', 'hzero.common'] })
@Form.create({ fieldNameProp: null })
export default class AddMailRecipient extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      selectedRows: [],
    };
  }

  componentDidMount() {
    this.handleTableChange();
  }

  /**
   * 重置
   */
  @Bind()
  handleFormReset() {
    this.props.form.resetFields();
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
   *点击加入全部后触发事件
   *
   * @param {*Boolean} checked switch的value值
   */
  @Bind()
  includeAllFlag(checked) {
    const { noticeDetail, dispatch } = this.props;
    dispatch({
      type: 'noticeSite/updateState',
      payload: { noticeDetail: { ...noticeDetail, includeAllFlag: checked ? 1 : 0 } },
    });
  }

  /**
   *分页change事件
   */
  @Bind()
  handleTableChange(page = {}) {
    const { dispatch, noticeId } = this.props;
    dispatch({
      type: 'noticeSite/fetchNoticeTenant',
      payload: {
        page,
        noticeId,
      },
    });
  }

  // 查询弹出框的数据
  @Bind()
  fetchModalData(fields = {}) {
    const { dispatch, noticeId } = this.props;
    const { form } = this.addDataModalRef.props;
    const fieldValues = isUndefined(form) ? {} : filterNullValueObject(form.getFieldsValue());
    dispatch({
      type: 'noticeSite/fetchUdtTenant',
      payload: {
        page: isEmpty(fields) ? {} : fields,
        ...fieldValues,
        noticeId,
      },
    });
  }

  // 添加租户
  @Bind()
  addTenant(data) {
    const { dispatch, noticeId } = this.props;
    dispatch({
      type: 'noticeSite/addTenant',
      payload: {
        data,
        noticeId,
      },
    }).then(() => {
      this.handleTableChange();
      notification.success();
      this.onHideAddModal();
    });
  }

  @Bind()
  removeTenant() {
    const { dispatch, noticeId } = this.props;
    const { selectedRows = [] } = this.state;
    dispatch({
      type: 'noticeSite/removeTenant',
      payload: {
        data: selectedRows,
        noticeId,
      },
    }).then(() => {
      this.setState(
        {
          selectedRows: [],
        },
        () => {
          this.handleTableChange();
          notification.success();
          this.onHideAddModal();
        }
      );
    });
  }

  /**
   * 展示弹出框
   */
  @Bind()
  onShowAddModal() {
    this.setState(
      {
        addModalVisible: true,
      },
      () => {
        this.fetchModalData();
      }
    );
  }

  /**
   *  隐藏弹出框
   */
  @Bind()
  onHideAddModal() {
    this.setState({
      addModalVisible: false,
    });
  }

  /**
   *
   * @param {object} ref - addModal子组件对象
   */
  @Bind()
  handleBindRef(ref = {}) {
    this.addDataModalRef = ref;
  }

  /**
   *导入
   */

  handleImport(noticeId) {
    const templateCode = 'SPFM.PORTAL_TENANT_IMPORT';
    this.importProps = {
      code: templateCode,
      sync: false,
      auto: false,
      refreshButton: 'true',
      historyButton: 'true',
      prefixPatch: undefined,
      args: JSON.stringify({
        noticeId,
      }),
      autoRefreshInterval: 5000,
      backPath: undefined,
      action: intl.get('hzero.common.button.import').d('导入'),
      key: `/spfm/noticeSite/import-component/${templateCode}`,
    };
    this.setState({
      importVisible: !this.state.importVisible,
    });
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      noticeDetail = {},
      list = [],
      pagination = {},
      switchLoading = false,
      fetchLoading = false,
      modalList = [],
      modalPagination = {},
      fetchModalLoading = false,
      removeLoading = false,
      addLoading = false,
    } = this.props;

    const { selectedRows = [], addModalVisible = false } = this.state;
    const rowSelection = {
      selectedRowKeys: selectedRows.map((n) => n.tenantId),
      onChange: this.onTableSelectedRowChange,
    };
    const columns = [
      {
        title: intl.get('spfm.notice.model.tenant.tenantNum').d('租户编码'),
        //   width: 300,
        dataIndex: 'tenantNum',
      },
      {
        title: intl.get('spfm.notice.model.tenant.tenantName').d('租户名称'),
        //   width: 300,
        dataIndex: 'tenantName',
      },
    ];

    const addModalOptions = {
      columns,
      rowKey: 'tenantId',
      loading: fetchModalLoading,
      confirmLoading: addLoading,
      title: intl.get('spfm.notice.view.message.mailRecipient').d('选择接收租户'),
      dataSource: modalList,
      pagination: modalPagination,
      modalVisible: addModalVisible,
      addData: this.addTenant,
      onHideAddModal: this.onHideAddModal,
      fetchModalData: this.fetchModalData,
      onRef: this.handleBindRef,
    };
    return (
      <div>
        <div style={{ textAlign: 'right' }}>
          {!noticeDetail.includeAllFlag && (
            <React.Fragment>
              <Button
                // icon="to-top"
                onClick={() => this.handleImport(noticeDetail.noticeId)}
                disabled={isUndefined(noticeDetail.noticeId)}
              >
                {intl.get('hzero.common.button.import').d('导入')}
              </Button>
              <Button
                type="primary"
                style={{ margin: '0 8px 16px 8px' }}
                onClick={() => this.onShowAddModal()}
              >
                {intl.get('spfm.notice.view.button.table.create').d('添加邮件接收租户')}
              </Button>
              <Popconfirm
                title={intl.get('spfm.notice.model.tenant.delete').d('是否删除所选用户？')}
                onConfirm={() => this.removeTenant()}
              >
                <Button
                  loading={removeLoading}
                  style={{ margin: '0 8px 16px 0' }}
                  disabled={selectedRows.length <= 0}
                >
                  {intl.get('spfm.notice.view.button.table.delete').d('删除')}
                </Button>
              </Popconfirm>
            </React.Fragment>
          )}
          <div style={{ display: 'inline-block', margin: '0 8px 16px 0' }}>
            <span style={{ marginRight: '8px' }}>
              {!noticeDetail.includeAllFlag
                ? intl.get('spfm.notice.view.message.includeAll').d('加入全部:')
                : intl.get('spfm.notice.view.message.includeNotAll').d('取消加入全部:')}
            </span>
            <Tooltip
              title={intl
                .get('spfm.notice.view.message.title.tooltip.includeAll')
                .d('“加入全部”即所有租户都可以接收邮件，无需再手工添加。')}
              placement="right"
            >
              <Switch
                loading={switchLoading}
                checked={!!noticeDetail.includeAllFlag}
                onChange={this.includeAllFlag}
              />
            </Tooltip>
          </div>
        </div>
        <EditTable
          bordered
          rowKey="tenantId"
          loading={fetchLoading}
          dataSource={list}
          rowSelection={rowSelection}
          pagination={pagination}
          columns={columns}
          scroll={{ x: tableScrollWidth(columns) }}
          onChange={this.handleTableChange}
        />
        <AddDataModal {...addModalOptions} />
        {this.state.importVisible && (
          <Modal
            width={1200}
            destroyOnClose
            visible={this.state.importVisible}
            closable={false}
            onCancel={() => {
              this.setState({ importVisible: false });
            }}
            footer={
              <Button
                onClick={() => {
                  this.handleTableChange();
                  this.setState({ importVisible: false });
                }}
                type="primary"
              >
                {intl.get('hzero.common.button.ok').d('确定')}
              </Button>
            }
          >
            <CommentImport {...this.importProps} />
          </Modal>
        )}
      </div>
    );
  }
}
