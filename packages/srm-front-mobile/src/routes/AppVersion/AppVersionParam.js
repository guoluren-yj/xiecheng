/**
 * index.js -版本信息定义
 * @date: 2021-04-22
 * @author: longhui.zou@going-link.com
 * @version: 0.0.1
 * @copyright: Copyright (c) 2021, Hand
 */
import React, { Component } from 'react';
import {
  Button,
  DataSet,
  Form,
  Switch,
  Table,
  TextArea,
  TextField,
  Modal as ModalPro,
} from 'choerodon-ui/pro';
import { Content, Header } from 'components/Page';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { enableRender } from 'utils/renderer';
import { message, Modal, Spin } from 'choerodon-ui';
import { publicBucketName } from '@/utils/smblConstant';
import Upload from 'components/Upload/UploadButton';
import { Icon } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { appVersionParamDS } from './stores/appVersionParamDS';

const { Column } = Table;

@formatterCollections({ code: ['smbl.common', 'smbl.appVersion'] })
export default class ThirdPartyParam extends Component {
  tableDs = new DataSet(appVersionParamDS());

  state = {
    fieldEditFlag: true,
    loading: false,
    visible: false,
  };

  // 行操作栏
  @Bind
  operationActionCommands = ({ record }) => {
    const btns = [];
    btns.push(
      <a onClick={() => this.handleEdit(record)}>{intl.get('hzero.common.edit').d('编辑')}</a>
    );
    return [<span className="action-link">{btns}</span>];
  };

  // 编辑
  @Bind
  handleEdit = () => {
    this.state.fieldEditFlag = true;
    this.setState({ visible: true });
  };

  // 打开侧滑框
  @Bind
  openModalImg(value) {
    console.info(value, 'ppppppppp');
    ModalPro.open({
      autoCenter: true,
      closable: true,
      maskClosable: true,
      children: (
        <div style={{ textAlign: 'center' }}>
          <img src={value} alt="img" />
        </div>
      ),
      footer: null,
    });
  }

  // 提交
  @Bind
  async handleSubmit() {
    await this.tableDs.submit();
    this.setState({ visible: false });
  }

  @Bind
  handleSubmitCheck() {
    const record = this.tableDs.current;
    let minVersionCount = 0;
    let latestVersionCount = 0;
    let cMinVersion = 0;
    let cLatestVersion = 0;
    let dMinVersion = 0;
    let dLatestVersion = 0;
    const arr = [];
    record.dataSet.originalData.map((item) => arr.push(item.data));
    if (record.data) {
      if (record.data.minVersionFlag === 1) {
        cMinVersion = record.data.versionNum;
      }
      if (record.data.latestVersionFlag === 1) {
        cLatestVersion = record.data.versionNum;
      }
    }
    // eslint-disable-next-line array-callback-return
    arr.map((item) => {
      if (item.minVersionFlag === 1) {
        minVersionCount += 1;
        dMinVersion = item.versionNum;
      }
      if (item.latestVersionFlag === 1) {
        latestVersionCount += 1;
        dLatestVersion = item.versionNum;
      }
    });
    if (minVersionCount > 2) {
      message.warning(
        intl.get('smbl.appVersion.message.AppVersion.minVersionNumError').d('最低版本数量不能大于1')
      );
      return;
    }
    if (latestVersionCount > 2) {
      message.warning(
        intl
          .get('smbl.appVersion.message.AppVersion.latestVersionNumError')
          .d('最新版本数量不能大于1')
      );
      return;
    }
    if (cMinVersion > cLatestVersion || cMinVersion > dLatestVersion) {
      message.warning(
        intl
          .get('smbl.appVersion.message.AppVersion.minOverLatestVersionNumError')
          .d('最低版本不能高于最新版本')
      );
      return;
    }
    if (cLatestVersion < cMinVersion || cLatestVersion < dMinVersion) {
      message.warning(
        intl
          .get('smbl.appVersion.message.AppVersion.minOverLatestVersionNumError')
          .d('最低版本不能高于最新版本')
      );
      return;
    }
    this.handleSubmit();
  }

  // 取消
  @Bind
  handleCancel() {
    console.info('######', this.tableDs);
    if (this.tableDs.current.status === 'add') {
      this.tableDs.remove(this.tableDs.current);
    } else {
      this.tableDs.current.reset();
    }
    this.setState({ visible: false });
  }

  // 生命周期函数，第一个执行
  componentDidMount() {
    this.tableDs.setQueryParameter('appVersionId', this.props.match.params.appVersionId);
    this.tableDs.query();
  }

  // 新增
  @Bind
  handleAdd() {
    this.state.fieldEditFlag = false;
    this.tableDs.create({ appVersionId: this.props.match.params.appVersionId }, 0);
    this.setState({ visible: true });
  }

  // 表格操作项
  tableButtons = [
    <Button icon="playlist_add" onClick={this.handleAdd} key="add">
      {intl.get('hzero.common.button.add').d('新增')}
    </Button>,
    'delete',
    'query',
  ];

  render() {
    return (
      <>
        <Header
          backPath="/smbl/appVersion/def"
          title={intl.get('smbl.common.title.versionInfoDefine').d('版本信息定义')}
        />
        <Content>
          <Table
            dataSet={this.tableDs}
            queryFieldsLimit={4}
            data={[]}
            buttons={this.tableButtons}
            autoMaxWidth
          >
            <Column name="versionNum" width={120} />
            <Column
              name="downloadQrCodeUrl"
              width={120}
              align="center"
              renderer={({ value }) => {
                return (
                  <img height={30} src={value} onClick={() => this.openModalImg(value)} alt="img" />
                );
              }}
            />
            <Column name="downloadUrl" width={400} />
            <Column
              name="minVersionFlag"
              width={150}
              renderer={({ value }) => enableRender(value)}
            />
            <Column
              name="latestVersionFlag"
              width={150}
              renderer={({ value }) => enableRender(value)}
            />
            <Column name="remark" />
            <Column name="operationAction" width={80} command={this.operationActionCommands} />
          </Table>
          <Modal.Sidebar
            zIndex={900}
            title={intl.get('hzero.common.button.create').d('新建')}
            visible={this.state.visible}
            onOk={this.handleSubmitCheck}
            onCancel={this.handleCancel}
            cancelText={intl.get('hzero.common.button.cancel').d('取消')}
            okText={intl.get('hzero.common.button.ok').d('确定')}
            width={500}
          >
            <Spin spinning={this.state.loading}>
              <Form dataSet={this.tableDs} id="formOne" useColon>
                <TextField name="versionNum" disabled={this.state.fieldEditFlag} clearButton />
                <Upload
                  className="avatar-uploader"
                  multiple={false}
                  onRemove={() => {
                    this.tableDs.current.set('downloadUrl', null);
                  }}
                  onSuccess={(result) => {
                    this.tableDs.current.set('downloadUrl', result);
                    this.setState({ loading: false });
                  }}
                  beforeUpload={() => {
                    this.setState({ loading: true });
                  }}
                  bucketName={publicBucketName}
                  accept={['.apk', '.ipa']}
                  name="appPackage"
                  showUploadList={false}
                  disabled={this.state.fieldEditFlag}
                >
                  {this.tableDs.current && this.tableDs.current.get('downloadUrl') ? (
                    <span
                      style={{
                        display: 'inline-block',
                        width: '300px',
                        whiteSpace: 'pre-line',
                      }}
                    >
                      {this.tableDs.current.data.downloadUrl.substr(
                        this.tableDs.current.data.downloadUrl.lastIndexOf('/') + 1
                      )}
                    </span>
                  ) : (
                    <Icon type="plus" />
                  )}
                </Upload>
                <TextField name="downloadUrl" disabled={this.state.fieldEditFlag} clearButton />
                <Switch name="minVersionFlag" />
                <Switch name="latestVersionFlag" />
                <TextArea name="remark" />
              </Form>
            </Spin>
          </Modal.Sidebar>
        </Content>
      </>
    );
  }
}
