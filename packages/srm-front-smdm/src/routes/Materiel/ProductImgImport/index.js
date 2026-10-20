/**
 * ProductImgImport - 商品图片导入
 * @date: 2020-05-11
 * @author: zjx <jingxi.zhang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import intl from 'utils/intl';
import { Button, Upload, Icon, Table } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import notification from 'utils/notification';
import { Header, Content } from 'components/Page';
import { getAccessToken, getCurrentOrganizationId } from 'utils/utils';
import { SRM_MDM } from '_utils/config';
import { API_HOST } from 'utils/config';
import formatterCollections from 'utils/intl/formatterCollections';
// import Icons from '../../components/Icons';
import styles from './index.less';

@connect(({ materiel, loading }) => ({
  materiel,
  fetchListLoading: loading.effects['materiel/fetchFileList'],
  importLoading: loading.effects['materiel/imgImport'],
}))
@formatterCollections({
  code: ['smdm.materiel', 'smdm.common', 'hptl.common'],
})
export default class ProductImgImport extends Component {
  constructor(props) {
    super(props);
    this.state = {
      uploadStatus: false,
      batchNum: '',
    };
  }

  componentDidMount() {}

  @Bind()
  uploadData(file) {
    return {
      // directory: 'small-product-imgImport',
      fileName: file.name,
    };
  }

  @Bind()
  beforeUpload(file) {
    const { fileSize = 100 * 1024 * 1024 } = this.props;
    const fileType = 'zip';
    if (file.type.indexOf(fileType) === -1) {
      file.status = 'error'; // eslint-disable-line
      notification.warning({
        message: intl.get('smdm.materiel.view.uploadFileTypeBeZip').d('上传文件类型必须是: zip'),
      });
      return false;
    }
    if (file.size > fileSize) {
      file.status = 'error'; // eslint-disable-line
      notification.warning({
        message: intl
          .get('hptl.common.view.message.uploadFileSizeLimit', {
            size: fileSize / (1024 * 1024),
          })
          .d(`上传文件大小不能超过: ${fileSize / (1024 * 1024)} MB`),
      });
      return false;
    }
    return true;
  }

  @Bind()
  async handleChange({ file }) {
    switch (file.status) {
      case 'error':
        notification.warning({
          message: intl.get('hzero.common.upload.status.error').d('上传失败'),
        });
        break;
      case 'done':
        if (file.response.failed) {
          notification.error({ message: file.response.message });
          return;
        }
        await this.setState({ uploadStatus: true }, () => {
          // 解压
          this.handleUnpack(file);
        });
        break;
      default:
        break;
    }
  }

  @Bind()
  handleUnpack(file) {
    const { dispatch } = this.props;
    const { response } = file;
    dispatch({
      type: 'materiel/updateState',
      payload: {
        uploadDataSource: [],
        uploadPagination: {},
      },
    });
    if (response) {
      const { batchNum } = response;
      this.setState({
        batchNum,
      });
      dispatch({
        type: 'materiel/validateFile',
        payload: {
          batchNum,
        },
      }).then(() => {
        this.handleFetchFileList();
      });
    }
  }

  @Bind()
  handleFetchFileList(page = {}) {
    const { dispatch } = this.props;
    const { batchNum } = this.state;
    dispatch({
      type: 'materiel/fetchFileList',
      payload: {
        batchNum,
        page,
      },
    });
  }

  @Bind()
  handleImgImport() {
    const { dispatch } = this.props;
    const { batchNum } = this.state;
    dispatch({
      type: 'materiel/imgImport',
      payload: {
        batchNum,
      },
    }).then((res) => {
      if (!res) {
        notification.success();
        this.handleFetchFileList();
      } else {
        this.handleFetchFileList();
      }
    });
  }

  render() {
    const {
      materiel: { uploadDataSource = [], uploadPagination = {} },
      fetchListLoading,
      importLoading,
    } = this.props;
    const { uploadStatus } = this.state;
    const columns = [
      {
        title: intl.get('smdm.materiel.model.productImgImport.firstFile').d('一级文件夹名称'),
        dataIndex: 'dataPath',
      },
      {
        title: intl.get('smdm.materiel.model.productImgImport.fileNum').d('文件数量'),
        dataIndex: 'fileNum',
        render: () => 1,
      },
      {
        title: intl.get('smdm.materiel.model.productImgImport.fileSize').d('文件大小'),
        dataIndex: 'dataSize',
        render: (val) => {
          const sizeKb = val / 1000;
          return `${sizeKb.toFixed(2)}KB`;
        },
      },
      {
        title: intl.get('smdm.materiel.model.productImgImport.importResult').d('导入结果'),
        dataIndex: 'dataStatusMeaning',
      },
      {
        title: intl.get('smdm.materiel.model.productImgImport.importErrorMsg').d('导入报错信息'),
        dataIndex: 'errorMessage',
      },
    ];
    return (
      <React.Fragment>
        <Header
          title={intl.get('smdm.materiel.view.option.imgImport').d('物料图片导入')}
          backPath="/smdm/materiel/list"
        >
          {uploadStatus && (
            <React.Fragment>
              <Button onClick={() => this.setState({ uploadStatus: false })}>
                {intl.get('smdm.materiel.view.backImgImport').d('返回图片导入')}
              </Button>
              <Button
                loading={importLoading}
                disabled={
                  !uploadDataSource.every((n) => n.dataStatus === 'VALID_SUCCESS') ||
                  uploadDataSource.length === 0
                }
                onClick={() => this.handleImgImport()}
              >
                {intl.get('smdm.materiel.view.imgImport').d('图片导入')}
              </Button>
            </React.Fragment>
          )}
        </Header>
        <Content>
          {uploadStatus ? (
            <Table
              bordered
              columns={columns}
              loading={fetchListLoading}
              dataSource={uploadDataSource}
              pagination={uploadPagination}
              rowKey="dataId"
              onChange={(page) => this.handleFetchFileList(page)}
            />
          ) : (
            <React.Fragment>
              <div className={styles['import-message']}>
                {/* <Icons type="tishi" style={{ color: '#FFBD02' }} /> */}
                <span>
                  {intl
                    .get('smdm.materiel.view.importInfoMessage')
                    .d(
                      '将要导入的图片压缩为ZIP格式，压缩包最大支持100MB，图片支持.jpg/.png/.jpeg等格式。'
                    )}
                </span>
                <p className="import-rule-title">
                  {intl.get('smdm.materiel.view.importRuleTitle').d('文件夹及图片命名规则：')}
                </p>
                <p className="import-rule-item">
                  {intl
                    .get('smdm.materiel.view.importRuleItemFirst')
                    .d(
                      '1、文件夹：文件夹有且仅有二级，第二级文件夹以物料的云平台物料编码创建文件夹，所有导入的物料图片放入对应的文件夹中，一个文件夹最多支持9张图片。'
                    )}
                  <br />
                  {intl
                    .get('smdm.materiel.view.importRuleItemSecond')
                    .d(
                      '2、商品图：单张商品图大小控制在1M以内，命名规范：1.图片格式，2.图片格式…，系统默认取1.图片格式为主图。'
                    )}
                  <br />
                  {intl
                    .get('smdm.materiel.view.importRuleItemThird')
                    .d('3、只能导入已有云平台物料编码的物料图片')}
                </p>
              </div>
              <div className={styles['import-img-box']}>
                <Upload
                  accept=".ZIP,.zip"
                  className={styles['import-img-upload']}
                  showUploadList={false}
                  action={`${API_HOST}${SRM_MDM}/v1/image-import-data/${getCurrentOrganizationId()}/upload`}
                  headers={{ Authorization: `bearer ${getAccessToken()}` }}
                  data={this.uploadData}
                  onChange={this.handleChange}
                  beforeUpload={this.beforeUpload}
                >
                  <Icon type="plus" className={styles['upload-plus']} />
                </Upload>
                <p>{intl.get('smdm.materiel.view.upload-message').d('点击此处上传图片压缩包')}</p>
                <p>
                  {intl
                    .get('smdm.materiel.view.upload-message-rule')
                    .d('文件仅支持.ZIP格式，最大支持512MB')}
                </p>
              </div>
            </React.Fragment>
          )}
        </Content>
      </React.Fragment>
    );
  }
}
