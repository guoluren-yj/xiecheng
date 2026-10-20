import React, { PureComponent } from 'react';
import {
  Form,
  TextField,
  DataSet,
  Select,
  Lov,
  Switch,
  Password,
  Button,
  Upload,
} from 'choerodon-ui/pro';
import { isEmpty, isUndefined, isEqual } from 'lodash';
import { Bind } from 'lodash-decorators';
import {
  getCurrentOrganizationId,
  getResponse,
  isTenantRoleLevel,
  getAccessToken,
} from 'hzero-front/lib/utils/utils';
import { getMenuId } from 'hzero-front/lib/utils/menuTab';
import { API_HOST } from 'hzero-front/lib/utils/config';
import notification from 'hzero-front/lib/utils/notification';
import { fileConfigDS } from '@/stores/Services/interfaceDS';
import getLang from '@/langs/serviceLang';
import { testConnect } from '@/services/servicesService';
import CollapsePanel from '@/components/CollapsePanel';

export default class FileCard extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      isLocalFile: false,
      isSFTP: false,
      isPassword: true,
      archiveFlag: false,
      haveStoreType: false,
      isFileServer: false,
      testFileConnectLoading: false,
    };

    this.fileConfigDS = new DataSet(
      fileConfigDS({
        onFieldUpdate: this.handleFieldUpdate,
      })
    );
    props.onRef(this);
  }

  async componentDidMount() {
    const { interfaceId, fileConfig = {} } = this.props;
    if (interfaceId) {
      const {
        protocol = 'FTP',
        protocolJson = '{}',
        enableArchive = false,
        fileName,
        path,
        fileConfigId,
        archivePath = './archive',
        enableRepeatColumn = false,
      } = fileConfig;
      const protocolConfig = JSON.parse(protocolJson);
      const { authType = 'PASSWORD' } = protocolConfig;
      const config = {
        ...protocolConfig,
        enableArchive,
        protocol,
        fileName,
        path,
        fileConfigId,
        archivePath,
        enableRepeatColumn,
        authType,
      };
      this.fileConfigDS.loadData([config]);
      this.setState({
        isLocalFile: protocol === 'LOCAL_FILE',
        isSFTP: protocol === 'SFTP',
        isFileServer: protocol === 'FILE_SERVER',
        isPassword: protocol === 'FTP' || authType === 'PASSWORD',
        haveStoreType: !isEmpty(protocolConfig.storeType),
        archiveFlag: enableArchive,
      });
    }
  }

  static getDerivedStateFromProps(nextProps, prveState) {
    if (!isEqual(nextProps.fileConfig, prveState.prevFileConfig)) {
      const { fileConfig = {} } = nextProps;
      const { protocol = 'FTP', protocolJson = '{}', enableArchive } = fileConfig;
      const protocolConfig = JSON.parse(protocolJson);
      return {
        isLocalFile: protocol === 'LOCAL_FILE',
        isSFTP: protocol === 'SFTP',
        isFileServer: protocol === 'FILE_SERVER',
        isPassword: protocol === 'FTP' || protocolConfig.authType === 'PASSWORD',
        haveStoreType: !isEmpty(protocolConfig.storeType),
        archiveFlag: enableArchive,
        prevFileConfig: nextProps.fileConfig,
      };
    }
    return null;
  }

  componentDidUpdate(prevProps) {
    if (!isEqual(this.props.fileConfig, prevProps.fileConfig)) {
      const { fileConfig = {} } = this.props;
      const {
        protocol,
        protocolJson = '{}',
        enableArchive,
        fileName,
        path,
        fileConfigId,
        archivePath,
        enableRepeatColumn,
      } = fileConfig;
      const protocolConfig = JSON.parse(protocolJson);
      const config = {
        ...protocolConfig,
        enableArchive,
        protocol,
        fileName,
        path,
        fileConfigId,
        archivePath,
        enableRepeatColumn,
      };
      this.fileConfigDS.loadData([config]);
    }
  }

  async _validate() {
    const validate = await this.fileConfigDS.validate();
    return validate;
  }

  @Bind()
  _toData() {
    let fileConfig = this.fileConfigDS.current.toData();
    const { protocol } = fileConfig;
    if (protocol !== 'LOCAL_FILE') {
      const {
        authType,
        host,
        port,
        username,
        password,
        privateKey,
        passphrase,
        bucketName,
        batchId,
        storeType,
        storeCode,
      } = fileConfig;
      let protocolConfig = {};
      if (protocol === 'FTP') {
        protocolConfig = {
          host,
          port,
          username,
          password,
        };
      } else if (protocol === 'SFTP' && authType === 'PASSWORD') {
        protocolConfig = {
          authType,
          host,
          port,
          username,
          password,
        };
      } else if (protocol === 'SFTP' && authType === 'PRIVATE_KEY') {
        protocolConfig = {
          authType,
          host,
          port,
          username,
          privateKey,
          passphrase,
        };
      } else if (protocol === 'FILE_SERVER') {
        protocolConfig = {
          bucketName,
          batchId,
          storeType,
          storeCode,
        };
      }
      fileConfig = { ...fileConfig, protocolJson: JSON.stringify(protocolConfig) };
    }
    return fileConfig;
  }

  @Bind()
  handleFieldUpdate({ name, value }) {
    if (name === 'protocol') {
      this.setState({
        isLocalFile: value === 'LOCAL_FILE',
        isSFTP: value === 'SFTP',
        isFileServer: value === 'FILE_SERVER',
      });
      if (value === 'FTP') {
        this.fileConfigDS.current.set('port', 21);
      }
      if (value === 'SFTP') {
        this.fileConfigDS.current.set('port', 22);
      }
    }
    if (name === 'storeType') {
      this.setState({ haveStoreType: !isEmpty(value) });
    }
    if (name === 'enableArchive') {
      this.setState({ archiveFlag: value });
    }
    if (name === 'authType') {
      this.setState({ isPassword: value === 'PASSWORD' });
    }
  }

  /**
   * 文件链接测试
   */
  @Bind()
  async testFileConnect() {
    const validateFile = await this.fileConfigDS.validate();
    if (!validateFile) {
      notification.error({
        message: getLang('SAVE_VALIDATE'),
      });
      this.setState({ testFileConnectLoading: false });
      return;
    }
    const { tenantId } = this.props;
    const {
      protocol,
      host,
      port,
      authType,
      username,
      password,
      privateKey,
      passphrase,
      fileConfigId,
    } = this.fileConfigDS.current.toData();
    const params =
      isUndefined(authType) || authType === 'PASSWORD'
        ? {
            protocol,
            host,
            port,
            username,
            password,
            tenantId,
            fileConfigId,
            authType,
          }
        : {
            protocol,
            host,
            port,
            username,
            privateKey,
            passphrase,
            tenantId,
            fileConfigId,
            authType,
          };
    testConnect(params).then((res) => {
      this.setState({ testFileConnectLoading: false });
      if (res) {
        const { status = false } = res;
        if (status) {
          return notification.success({ message: getLang('CONNECT_SUCCESS') });
        } else {
          return notification.error({
            message: getLang('CONNECT_FAILED'),
          });
        }
      }
    });
  }

  render() {
    const { disabledFlag, tenantId, interfaceListActionRow = {} } = this.props;
    const {
      isLocalFile,
      isSFTP,
      isPassword,
      archiveFlag,
      isFileServer,
      haveStoreType,
    } = this.state;

    const uploadProps = {
      headers: {
        'Access-Control-Allow-Origin': '*',
        Authorization: `bearer ${getAccessToken()}`,
        'H-Menu-Id': `${getMenuId()}`,
      },
      data: isTenantRoleLevel()
        ? {}
        : {
            tenantId,
          },
      action: ''
        .concat(API_HOST, '/hitf/v1')
        .concat(
          isTenantRoleLevel() ? `/${getCurrentOrganizationId()}` : '',
          '/interfaces/upload-file'
        ),
      multiple: true,
      accept: [''],
      name: 'file',
      uploadImmediately: true,
      onUploadSuccess: (response) => {
        try {
          getResponse(JSON.parse(response));
        } catch (error) {
          this.fileConfigDS.current.set('privateKey', response);
          notification.success({
            message: getLang('UPLOAD_SUCCESS'),
          });
        }
      },
    };

    const { interfaceId } = interfaceListActionRow;
    const isNew = isUndefined(interfaceId);
    return (
      <CollapsePanel
        eles={[
          {
            key: 'FILE_PROTOCOL_CONFIG',
            title: getLang('FILE_PROTOCOL_CONFIG'),
            ele: (
              <>
                <div style={{ textAlign: 'right' }}>
                  {!isLocalFile && !isFileServer && (
                    <Button
                      color="primary"
                      onClick={() => {
                        this.setState({ testFileConnectLoading: true });
                        this.testFileConnect();
                      }}
                      loading={this.state.testFileConnectLoading}
                    >
                      {getLang('TEST_CONNECT')}
                    </Button>
                  )}
                </div>
                <Form
                  dataSet={this.fileConfigDS}
                  columns={2}
                  labelWidth={130}
                  disabled={disabledFlag}
                >
                  <Select name="protocol" />
                  {isFileServer && <TextField newLine name="bucketName" />}
                  {isFileServer && <Select name="storeType" />}
                  {isFileServer && <Lov disabled={!haveStoreType} name="storeCodeLov" />}
                  {isFileServer && <TextField name="batchId" />}
                  <TextField name="path" />
                  <TextField name="fileName" />
                  {!isFileServer && <Switch name="enableArchive" />}
                  {!isFileServer && archiveFlag && <TextField name="archivePath" />}
                  <Switch name="enableRepeatColumn" />
                  {isSFTP && <Select newLine name="authType" />}
                  {!isLocalFile && !isFileServer && <TextField newLine name="host" />}
                  {!isLocalFile && !isFileServer && <TextField name="port" />}
                  {!isLocalFile && !isFileServer && <TextField name="username" />}
                  {isSFTP && !isPassword && <Upload {...uploadProps} required />}
                  {isSFTP && !isPassword && (
                    <Password placeholder={isNew ? '' : getLang('UNCHANGE')} name="passphrase" />
                  )}
                  {!isLocalFile && !isFileServer && (!isSFTP || isPassword) && (
                    <Password placeholder={isNew ? '' : getLang('UNCHANGE')} name="password" />
                  )}
                </Form>
              </>
            ),
          },
        ]}
      />
    );
  }
}
