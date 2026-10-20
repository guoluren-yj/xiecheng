import React, { PureComponent } from 'react';
import { Form, Button, Input, Modal, Table, Row, Col } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';

const FormItem = Form.Item;

const formItemLayout = {
  labelCol: {
    sm: { span: 8 },
  },
  wrapperCol: {
    sm: { span: 14 },
  },
};
/**
 * 新建多选邮件接收用Modal
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} onSearch - 表单查询
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
export default class UserModal extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    this.props.onRef(this);
  }

  /**
   * 查询
   */
  @Bind()
  handleSearch(page = {}) {
    const { onSearch, form } = this.props;
    if (onSearch) {
      form.validateFields((err) => {
        if (!err) {
          // 如果验证成功,则执行onSearch
          onSearch(page);
        }
      });
    }
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
   * render
   * @returns React.element
   */
  render() {
    const {
      form: { getFieldDecorator },
      loading = false,
      dataSource = [],
      visible = false,
      pagination = {},
      onOK,
      onCancel,
    } = this.props;

    const { selectedRows = [] } = this.state;
    const rowSelection = {
      selectedRowKeys: selectedRows.map((n) => n.id),
      onChange: this.onTableSelectedRowChange,
    };
    const columns = [
      {
        title: intl.get('spfm.emailReceiveUser.model.emailReceiveUser.loginName').d('账号'),
        width: 100,
        dataIndex: 'loginName',
      },
      {
        title: intl.get('spfm.emailReceiveUser.model.emailReceiveUser.realName').d('用户名'),
        width: 100,
        dataIndex: 'realName',
      },
      {
        title: intl.get('spfm.emailReceiveUser.model.emailReceiveUser.phone').d('手机号码'),
        width: 200,
        dataIndex: 'phone',
      },
      {
        title: intl.get('spfm.emailReceiveUser.model.emailReceiveUser.email').d('邮箱'),
        dataIndex: 'email',
        width: 200,
      },
      {
        title: intl.get('spfm.emailReceiveUser.model.emailReceiveUser.tenantName;').d('所属租户'),
        dataIndex: 'tenantName;',
        width: 200,
      },
    ];
    // 查询条件
    const queryFields = [
      {
        field: 'loginName',
        label: intl.get('spfm.emailReceiveUser.model.emailReceiveUser.loginName').d('账号'),
      },
      {
        field: 'phone',
        label: intl.get('spfm.emailReceiveUser.model.emailReceiveUser.phone').d('手机号码'),
      },
    ];
    const span = queryFields.length <= 1 ? 24 : 12;
    const queryCondition = queryFields.map((queryItem) => {
      return (
        <Col span={span} key={queryItem.field}>
          <FormItem {...formItemLayout} label={queryItem.label}>
            {getFieldDecorator(queryItem.field)(<Input onPressEnter={() => this.handleSearch()} />)}
          </FormItem>
        </Col>
      );
    });
    return (
      <Modal
        destroyOnClose
        visible={visible}
        onOk={() => onOK(selectedRows)}
        onCancel={onCancel}
        width={800}
        okText={intl.get('hzero.common.button.save').d('保存')}
        cancelText={intl.get('hzero.common.button.cancel').d('取消')}
        wrapClassName="lov-modal"
        title={intl.get('spfm.emailReceiveUser.model.emailReceiveUser.create').d('选择用户')}
      >
        <div style={{ display: 'flex', marginBottom: '5px', marginTop: '5px' }}>
          <Row style={{ flex: 'auto' }}>{queryCondition}</Row>
          <div style={{ width: '80px', padding: '5px 0 0 15px' }}>
            <Button onClick={this.handleFormReset}>
              {intl.get('hzero.common.button.reset').d('重置')}
            </Button>
          </div>
          <div style={{ width: '80px', padding: '5px 0 0 15px' }}>
            <Button type="primary" onClick={() => this.handleSearch()}>
              {intl.get('hzero.common.button.search').d('查询')}
            </Button>
          </div>
        </div>
        <Table
          bordered
          rowKey="id"
          loading={loading}
          dataSource={dataSource}
          columns={columns}
          onChange={(page) => this.handleSearch(page)}
          rowSelection={rowSelection}
          pagination={pagination}
        />
      </Modal>
    );
  }
}
