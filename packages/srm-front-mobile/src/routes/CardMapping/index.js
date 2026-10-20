import React, { Component } from 'react';
import { Button, DataSet, Form, Switch, Table, TextArea, TextField } from 'choerodon-ui/pro';
import { Modal, Tag } from 'choerodon-ui';
import { Content, Header } from 'components/Page';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { Bind } from 'lodash-decorators';
import { getCurrentOrganizationId } from 'utils/utils';
import { enableRender } from 'utils/renderer';
import { publicBucketName } from '@/utils/smblConstant';
import Upload from 'components/Upload/UploadButton';
import { Icon } from 'hzero-ui';
import { cardMappingDS } from './stores/CardMappingDS';

@formatterCollections({ code: ['smbl.cardMapping', 'smbl.common', 'hzero.common'] })
export default class CardMapping extends Component {
  tableDs = new DataSet(cardMappingDS());

  constructor(props) {
    super(props);
    this.state = {
      AlreadyUploadPicture: false,
      visible: false,
      canEdit: true,
    };
  }

  getColumns() {
    return [
      {
        name: 'tenantName',
        align: 'center',
        width: 200,
      },
      { name: 'cardCode' },
      { name: 'cardTitle' },
      {
        name: 'cardDesc',
      },
      {
        name: 'cardUrl',
      },
      {
        name: 'pcCardUrl',
      },
      {
        name: 'purchaseMobileCardUrl',
      },
      {
        name: 'purchasePcCardUrl',
      },
      {
        name: 'enabledFlag',
        align: 'left',
        width: 100,
        renderer: ({ value }) => enableRender(value),
      },
      { name: 'remark' },
      {
        name: 'source',
        align: 'center',
        width: 120,
        renderer: ({ record }) => {
          if (getCurrentOrganizationId() > record.get('tenantId')) {
            return <Tag color="orange">{intl.get('hzero.common.predefined').d('预定义')}</Tag>;
          } else {
            return <Tag color="green">{intl.get('hzero.common.custom').d('自定义')}</Tag>;
          }
        },
      },
      {
        header: intl.get('hzero.common.button.action').d('操作'),
        width: 150,
        command: ({ record }) => {
          // eslint-disable-next-line eqeqeq
          if (getCurrentOrganizationId() == record.get('tenantId')) {
            return [
              <Button key="edit-value" funcType="flat" onClick={() => this.handleEdit(true)}>
                {intl.get('hzero.common.button.editor').d('编辑')}
              </Button>,
              <Button key="del-value" funcType="flat" onClick={() => this.handleDelete(record)}>
                {intl.get('hzero.common.button.delete').d('删除')}
              </Button>,
            ];
          } else {
            return [
              // <Tag color="orange">{intl.get('hzero.common.predefined').d('预定义')}</Tag>,
              <Button key="edit-value" funcType="flat" onClick={() => this.handleEdit(false)}>
                {intl.get('hzero.common.view.title.view').d('查看')}
              </Button>,
              <Button key="copy-value" funcType="flat" onClick={() => this.copyRecord(record)}>
                {intl.get('hzero.common.button.copy').d('复制')}
              </Button>,
            ];
          }
        },
        lock: 'right',
        align: 'center',
      },
    ];
  }

  // 表格操作项
  tableButtons = [
    <Button icon="playlist_add" onClick={this.createHandler} key="add">
      {intl.get('hzero.common.button.add').d('新增')}
    </Button>,
  ];

  @Bind
  createHandler() {
    this.tableDs.create({}, 0);
    this.setState({
      visible: true,
      canEdit: true,
      AlreadyUploadPicture: false,
    });
  }

  @Bind
  handleCancel() {
    this.tableDs.reset();
    this.setState({ visible: false });
  }

  @Bind
  handleEdit(canEdit = true) {
    this.setState({ visible: true, canEdit });
    this.setState({ AlreadyUploadPicture: this.tableDs.current.get('cardLogo') });
  }

  @Bind
  handleDelete(record) {
    this.tableDs.delete(record);
  }

  @Bind
  copyRecord(record) {
    const recordNew = {
      tenantId: getCurrentOrganizationId(),
      cardCode: record.data.cardCode,
      cardTitle: record.data.cardTitle,
      cardDesc: record.data.cardDesc,
      cardLogo: record.data.cardLogo,
      cardUrl: record.data.cardUrl,
      pcCardUrl: record.data.pcCardUrl,
      purchaseMobileCardUrl: record.data.purchaseMobileCardUrl,
      purchasePcCardUrl: record.data.purchasePcCardUrl,
      enabledFlag: record.data.enabledFlag,
      remark: record.data.remark,
    };
    this.tableDs.create(recordNew, 0);
    this.tableDs
      .submit()
      .then((res) => {
        if (res || res === undefined) {
          this.setState({ visible: false });
          this.tableDs.query();
        }
      })
      .catch(() => {
        this.tableDs.query();
      });
  }

  @Bind
  handleOk() {
    this.tableDs.submit().then((res) => {
      if (res || res === undefined) {
        this.setState({ visible: false });
        this.tableDs.query();
      }
    });
  }

  @Bind
  async handleUploadSuccess(result) {
    this.tableDs.current.set('cardLogo', result);
    this.setState({ AlreadyUploadPicture: true });
  }

  @Bind
  handleRemoveFile() {
    this.props.dataSet.current.set('cardLogo', null);
    // this.setState({ imgUrl: null });
  }

  render() {
    return (
      <>
        <Header title={intl.get('smbl.cardMapping.view.title').d('消息卡片')} />
        <Content>
          <Table
            dataSet={this.tableDs}
            columns={this.getColumns()}
            queryFieldsLimit={3}
            buttons={this.tableButtons}
          />
          <Modal.Sidebar
            zIndex={900}
            title={intl.get('hzero.common.button.create').d('新建')}
            visible={this.state.visible}
            onOk={this.handleOk}
            onCancel={this.handleCancel}
            cancelText={intl.get('hzero.common.button.cancel').d('取消')}
            okText={intl.get('hzero.common.button.ok').d('确定')}
            width={500}
          >
            <Form
              dataSet={this.tableDs}
              columns={1}
              disabled={!this.state.canEdit}
              labelWidth={130}
            >
              <TextField name="cardCode" />
              <TextField name="cardTitle" />
              <TextArea name="cardDesc" />
              <Upload
                className="cardLogoUpload"
                multiple={false}
                onSuccess={this.handleUploadSuccess}
                bucketName={publicBucketName}
                name="cardLogo"
                accept="image/*"
                showUploadList={false}
                showUploadBtn={false}
              >
                {this.state.AlreadyUploadPicture ? (
                  // eslint-disable-next-line jsx-a11y/alt-text
                  <img width={60} height={90} src={this.tableDs.current.get('cardLogo')} />
                ) : (
                  <Icon type="plus" />
                )}
              </Upload>
              <TextArea name="cardUrl" />
              <TextArea name="pcCardUrl" />
              <TextArea name="purchaseMobileCardUrl" />
              <TextArea name="purchasePcCardUrl" />
              <Switch name="enabledFlag" />
              <TextArea name="remark" />
            </Form>
          </Modal.Sidebar>
        </Content>
      </>
    );
  }
}
