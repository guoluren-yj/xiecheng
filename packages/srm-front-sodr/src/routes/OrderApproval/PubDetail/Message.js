import React, { PureComponent } from 'react';
import { Button, Drawer, Spin, List, Avatar, Form, Input } from 'hzero-ui';
import intl from 'utils/intl';
// import { isEmpty, isNumber, pullAllBy, uniqBy } from 'lodash';
import { Content } from 'components/Page';

/**
 * 使用 Form.Item 组件
 */
const FormItem = Form.Item;
const { TextArea } = Input;

const viewButtonPrompt = 'sodr.orderApproval.view.button';
const viewMessagePrompt = 'sodr.orderApproval.view.message';
const commonPrompt = 'hzero.common';

const MessageBox = ({ form, value }) => {
  const { getFieldDecorator = (e) => e } = form;
  return (
    <Form>
      <FormItem>
        {getFieldDecorator('message', {
          initialValue: value,
        })(<TextArea rows={4} />)}
      </FormItem>
    </Form>
  );
};

const WrapperMessageBox = Form.create({ fieldNameProp: null })(MessageBox);

export default class Editor extends PureComponent {
  constructor(props) {
    super(props);
    this.handleFetchMessage = this.handleFetchMessage.bind(this);
  }

  state = {};

  getSnapshotBeforeUpdate() {
    const { visible } = this.props;
    return visible;
  }

  // applicationId !== prevProps.applicationId
  componentDidUpdate(prevProps, prevState, snapshot) {
    // If we have a snapshot value, we've just added new items.
    // Adjust scroll so these new items don't push the old ones out of view.
    // (snapshot here is the value returned from getSnapshotBeforeUpdate)
    if (snapshot) {
      this.handleFetchMessage();
    }
  }

  // 查询详，将详情数据、接口列表、接口分页设置到state中
  handleFetchMessage() {
    // const { fetchDetail = e => e, applicationId } = this.props;
    // fetchDetail(applicationId).then(res => {
    //   if (res) {
    //     const { interfaceServers } = res;
    //     this.setState({
    //       formDataSource: res,
    //       serviceListDataSource: interfaceServers || [],
    //       serviceListPagination: createPagination(interfaceServers),
    //     });
    //   }
    // });
  }

  handleSend() {}

  cancel() {
    const { onCancel = (e) => e } = this.props;
    // const { resetFields = e => e } = this.editorForm;
    // resetFields();
    // this.setState({
    //   formDataSource: {},
    //   serviceListSelectedRows: [],
    //   serviceListDataSource: [],
    //   serviceListPagination: createPagination({ number: 0, size: 10, totalElements: 0 }),
    // });
    onCancel();
  }

  render() {
    const { visible, processing = {} } = this.props;
    // const {
    // } = this.state;
    const drawerProps = {
      title: intl.get(`${viewMessagePrompt}.message`).d('留言板'),
      visible,
      mask: true,
      maskStyle: { backgroundColor: 'rgba(0,0,0,.85)' },
      placement: 'right',
      destroyOnClose: true,
      onClose: this.cancel.bind(this),
      width: 450,
    };

    const data = [
      {
        title: 'Ant Design Title 1',
      },
      {
        title: 'Ant Design Title 2',
      },
      {
        title: 'Ant Design Title 3',
      },
      {
        title: 'Ant Design Title 4',
      },
      {
        title: 'Ant Design Title 4',
      },
      {
        title: 'Ant Design Title 4',
      },
      {
        title: 'Ant Design Title 4',
      },
    ];

    return (
      <Drawer {...drawerProps}>
        <Content>
          <Spin spinning={processing.queryMessages || false}>
            <div
              style={{
                position: 'relative',
                height: 600,
                marginBottom: '15%',
                overflowY: 'scroll',
              }}
            >
              <List
                itemLayout="horizontal"
                dataSource={data}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <Avatar src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" />
                      }
                      title={item.title}
                      description="Ant Design, a design language for background applications, is refined by Ant UED Team"
                    />
                  </List.Item>
                )}
              />
            </div>
            <WrapperMessageBox value="1111" />
          </Spin>
        </Content>
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            width: '100%',
            borderTop: '1px solid #e8e8e8',
            padding: '10px 16px',
            textAlign: 'right',
            left: 0,
            background: '#fff',
            borderRadius: '0 0 4px 4px',
          }}
        >
          <Button onClick={this.cancel.bind(this)} style={{ marginRight: 8 }}>
            {intl.get(`${commonPrompt}.button.cancel`).d('取消')}
          </Button>
          <Button type="primary" loading={processing.send} onClick={this.handleSend.bind(this)}>
            {intl.get(`${viewButtonPrompt}.message`).d('留言')}
          </Button>
        </div>
      </Drawer>
    );
  }
}
