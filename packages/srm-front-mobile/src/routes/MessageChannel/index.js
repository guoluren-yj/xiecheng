import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import {
  Button,
  DataSet,
  Form,
  IntlField,
  Select,
  Switch,
  Table,
  TextArea,
} from 'choerodon-ui/pro';
import { Modal } from 'choerodon-ui';
import { Icon } from 'hzero-ui';
import Upload from 'components/Upload/UploadButton';

import { Content, Header } from 'components/Page';
import SrmImg from '@/components/SrmImg';
import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import MessageChannelDS from './stores/MessageChannelDS';
import './index.less';
import { bucketName } from '@/utils/smblConstant';

@connect(() => ({
  organizationId: getCurrentOrganizationId(),
}))
@formatterCollections({ code: ['smbl.messageChannel', 'hzero.c7nUI'] })
export default class MessageChannelManageList extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      sideBarVisible: false,
      imgUrl: null,
      dataSet: new DataSet({
        ...MessageChannelDS(intl),
        autoQuery: false,
      }),
    };
  }

  componentDidMount() {
    const { dataSet } = this.state;
    dataSet.query();
  }

  getColumns() {
    return [
      {
        name: 'channelIcon',
        renderer: ({ record }) => {
          return <SrmImg src={record.get('channelIcon')} bucketName={bucketName} />;
        },
        align: 'center',
      },
      { name: 'channelCode' },
      { name: 'channelName' },
      { name: 'mustSubscribeFlag' },
      { name: 'enabledFlag' },
      // { name: 'sequence' },
      { name: 'channelDesc' },
      {
        header: intl.get('hzero.common.button.action').d('操作'),
        width: 150,
        command: ({ record }) => {
          return [
            <Button key="edit-value" funcType="flat" onClick={() => this.handleEdit(record)}>
              {intl.get('hzero.common.button.editor').d('编辑')}
            </Button>,
          ];
        },
        lock: 'right',
        align: 'center',
      },
    ];
  }

  @Bind
  handleEdit() {
    this.setState({
      imgUrl: this.state.dataSet.current.get('channelIcon'),
      sideBarVisible: true,
    });
  }

  @Bind
  handleCreate() {
    this.state.dataSet.create({ tenantId: getCurrentOrganizationId() }, 0);
    this.setState({ sideBarVisible: true });
  }

  getButtons() {
    return [
      <Button key="edit-value" funcType="flat" onClick={() => this.handleCreate()}>
        {intl.get('hzero.common.button.new').d('新建')}
      </Button>,
    ];
  }

  @Bind
  handleOk() {
    this.state.dataSet.submit().then(res => {
      if (res || res === undefined) {
        this.setState({ sideBarVisible: false, imgUrl: null });
      }
    });
  }

  @Bind
  handleCancel() {
    this.state.dataSet.reset();
    this.setState({ sideBarVisible: false, imgUrl: null });
  }

  @Bind
  handleUploadSuccess(result) {
    this.state.dataSet.current.set('channelIcon', result);
    this.setState({ imgUrl: result });
  }

  @Bind
  handleRemoveFile() {
    this.state.dataSet.current.set('channelIcon', null);
    this.setState({ imgUrl: null });
  }

  render() {
    const { dataSet } = this.state;
    return (
      <>
        <Header
          title={intl.get('smbl.messageChannel.view.messageChannel.manageTitle').d('消息频道管理')}
        />
        <Content>
          <Table
            queryFieldsLimit={4}
            dataSet={dataSet}
            columns={this.getColumns()}
            buttons={this.getButtons()}
          />
          <Modal.Sidebar
            title={intl.get('hzero.common.edit').d('编辑')}
            visible={this.state.sideBarVisible}
            onOk={this.handleOk}
            onCancel={this.handleCancel}
            cancelText={intl.get('hzero.c7nUI.Modal.cancelText').d('取消')}
            okText={intl.get('hzero.c7nUI.Modal.okText').d('确定')}
            width={500}
            zIndex={900}
          >
            <Form dataSet={this.state.dataSet}>
              <Upload
                className="avatar-uploader"
                multiple={false}
                onRemove={this.handleRemoveFile}
                onSuccess={this.handleUploadSuccess}
                bucketName={bucketName}
                name="channelIcon"
                showUploadList={false}
              >
                {this.state.imgUrl ? (
                  <SrmImg src={this.state.imgUrl} bucketName={bucketName} />
                ) : (
                  <Icon type="plus" />
                )}
              </Upload>
              <Select restrict="A-Za-z0-9." name="channelCode" />
              <IntlField name="channelName" />
              <Switch name="mustSubscribeFlag" />
              <Switch name="enabledFlag" />
              <TextArea name="channelDesc" />
            </Form>
          </Modal.Sidebar>
        </Content>
      </>
    );
  }
}
