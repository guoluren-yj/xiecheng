/**
 * ProductImgImport - 图片导入
 * @date: 2020-05-11
 * @author: zjx <jingxi.zhang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { Upload, Icon } from 'hzero-ui';
import { DataSet, Table, Button, Select, Spin } from 'choerodon-ui/pro';
import { Row, Col } from 'choerodon-ui';

import { observer } from 'mobx-react-lite';

import { Bind } from 'lodash-decorators';
import notification from 'utils/notification';
import { Header, Content } from 'components/Page';
import ExcelExport from 'components/ExcelExport';
import { getAccessToken, getCurrentOrganizationId, getResponse } from 'utils/utils';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { API_HOST } from 'utils/config';
import { SRM_SMPC } from '_utils/config';
import { showRecordModal } from '@/utils/c7nModal';

import Icons from '@/components/Icons';
import { clearImages, importImages } from './api';
import { tableDs, filterDs } from './ds';
import styles from './index.less';

const organizationId = getCurrentOrganizationId();

const UploadBtn = observer(({ dataSet, ...props }) => {
  const data = dataSet.toData();
  const disabled = data.length === 0;
  return (
    <Button icon="get_app" color="primary" disabled={disabled} {...props}>
      {intl.get('smpc.import.view.imgImport').d('图片导入')}
    </Button>
  );
});

@formatterCollections({
  code: ['smpc.import', 'smpc.product'],
})
export default class ProductImgImport extends Component {
  constructor(props) {
    super(props);
    const {
      location: { pathname },
    } = props;
    const isSup = pathname.includes('product-publish-sup');
    this.state = {
      isSup,
      batchNum: '',
      uploadStatus: false,
      uploadSpining: false,
      importStatus: '',
    };

    this.tableDs = new DataSet(tableDs());
    this.filterDs = new DataSet(filterDs());
    // this.tableDs.setQueryParameter('companyType', 'PURCHASER');
  }

  @Bind()
  uploadData(file) {
    return {
      fileName: file.name,
    };
  }

  @Bind()
  beforeUpload(file) {
    const { fileSize = 512 * 1024 * 1024 } = this.props;
    const fileType = 'zip';
    this.setState({ uploadSpining: true });
    if (file.type.indexOf(fileType) === -1) {
      notification.warning({
        message: intl.get('smpc.import.view.uploadFileTypeBeZip').d('上传文件类型必须是: zip'),
      });
      return false;
    }
    if (file.size > fileSize) {
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
    const { status, response } = file;
    switch (status) {
      case 'error':
        notification.warning({
          message: intl.get('hzero.common.upload.status.error').d('上传失败'),
        });
        this.setState({ uploadSpining: false });
        break;
      case 'done':
        this.setState({ uploadSpining: false });
        if (response.failed) {
          notification.error({ message: response.message });
        } else {
          this.setState({ batchNum: response, uploadStatus: true }, () => {
            this.handleFetchFileList();
          });
        }
        break;
      case 'uploading':
        // this.setState({ uploadSpining: true });
        break;
      default:
        this.setState({ uploadSpining: false });
        break;
    }
  }

  @Bind()
  handleFetchFileList() {
    const { batchNum } = this.state;
    this.tableDs.setQueryParameter('batchNum', batchNum);
    this.tableDs.query();
  }

  toggleLoading = (key, flag) => {
    if (typeof flag === 'boolean') {
      this.setState({ [key]: flag });
    } else {
      this.setState({ [key]: !this.state[key] });
    }
  };

  @Bind()
  async handleImgImport() {
    const { batchNum } = this.state;
    this.toggleLoading('importLoading');
    const res = getResponse(await importImages(batchNum));
    this.toggleLoading('importLoading');
    if (res) {
      notification.success();
      this.tableDs.query(this.tableDs.currentPage);
    }
  }

  @Bind()
  async handleClearImgs() {
    const { batchNum } = this.state;
    this.toggleLoading('clearLoading');
    const res = getResponse(await clearImages(batchNum));
    this.toggleLoading('clearLoading');
    if (res) {
      // notification.success();
      this.tableDs.loadData([]);
      this.setState({ uploadStatus: false });
    }
  }

  handleImportRecord = (batchNum) => {
    this.setState({ batchNum, uploadStatus: true }, () => {
      if (this.recordModal) this.recordModal.close();
      this.handleFetchFileList();
    });
  };

  handleHistory = () => {
    const fieldColumns = [
      {
        name: 'batchNum',
        label: intl.get('smpc.import.model.importBatch').d('导入批次'),
        renderer: ({ value }) => <a onClick={() => this.handleImportRecord(value)}>{value}</a>,
      },
      { name: 'batchCount', label: intl.get('smpc.import.model.importNum').d('导入文件数量') },
      {
        name: 'batchSize',
        label: intl.get('smpc.import.model.importSize').d('导入文件大小'),
        renderer: ({ value }) => {
          const sizeKb = value / 1000;
          return `${sizeKb.toFixed(2)}KB`;
        },
      },
      { name: 'creationDate', label: intl.get('smpc.import.model.importDate').d('导入日期') },
      { name: 'userName', label: intl.get('smpc.import.model.operator').d('操作人') },
    ];
    this.recordModal = showRecordModal({
      url: `${SRM_SMPC}/v1/${organizationId}/catalog-icon-imports/history-batch`,
      fields: fieldColumns,
      columns: fieldColumns,
      width: 800,
      title: intl.get('smpc.import.view.record').d('导入记录'),
    });
  };

  handleResultChange = (value) => {
    this.tableDs.setQueryParameter('importStatus', value);
    this.tableDs.query();
  };

  importData = () => {};

  render() {
    const {
      uploadStatus,
      importLoading,
      clearLoading,
      uploadSpining,
      importStatus,
      batchNum,
    } = this.state;
    const columns = [
      {
        name: 'batchNum',
      },
      {
        name: 'catalogCode',
      },
      {
        name: 'imageName',
      },
      {
        name: 'imageSize',
        renderer: ({ record }) => {
          const sizeKb = record.get('imageSize') / 1000;
          return `${sizeKb.toFixed(2)}KB`;
        },
      },
      {
        name: 'importStatusMeaning',
      },
      {
        name: 'errorMsg',
      },
    ];
    return (
      <React.Fragment>
        <Header
          title={intl.get('smpc.product.view.mobileIconImport').d('移动端ICON导入')}
          backPath={uploadStatus ? undefined : '/s2-mall/product/catalog-manage/list'}
        >
          {uploadStatus && (
            <React.Fragment>
              <Button
                funcType="flat"
                icon="return"
                loading={clearLoading}
                onClick={this.handleClearImgs}
              >
                {intl.get('smpc.import.view.backImgImport').d('返回图片导入')}
              </Button>
              <UploadBtn
                dataSet={this.tableDs}
                loading={importLoading}
                onClick={() => this.handleImgImport()}
              />
              <Button onClick={() => this.handleHistory()} funcType="flat" icon="sync_records">
                {intl.get('smpc.import.view.imgImportHistory').d('查看导入记录')}
              </Button>
            </React.Fragment>
          )}
        </Header>
        <Content>
          {uploadStatus ? (
            <>
              <Row gutter={8} className={styles['import-content']}>
                <Col span={6}>
                  <div className={styles['filter-select']}>
                    <span className={styles['filter-label']}>
                      {intl.get('smpc.import.model.importStatus').d('导入结果')}:
                    </span>
                    <Select
                      onChange={this.handleResultChange}
                      dataSet={this.filterDs}
                      name="importStatus"
                    />
                  </div>
                </Col>
                <Col span={4}>
                  <ExcelExport
                    buttonText={intl.get('smpc.import.view.button.dataxImport').d('数据导出')}
                    requestUrl={`${SRM_SMPC}/v1/${organizationId}/catalog-icon-imports/export`}
                    fileName={intl.get('smpc.import.view.imageImportRes').d('图片导入结果')}
                    queryParams={{ importStatus, batchNum }}
                  />
                </Col>
                <Col span={24}>
                  <Table className={styles['table-gap']} columns={columns} dataSet={this.tableDs} />
                </Col>
              </Row>
            </>
          ) : (
            <Spin spinning={uploadSpining}>
              <div className={styles['import-message']}>
                <Icons type="tishi" style={{ color: '#FFBD02' }} />
                <span>
                  {intl
                    .get('smpc.import.view.importInfoMessage')
                    .d(
                      '将要导入的图片放入一个文件夹，再将文件夹压缩为ZIP格式，压缩包最大支持512MB。'
                    )}
                </span>
                <p className="import-rule-title">
                  {intl.get('smpc.import.view.importRuleTitle').d('规则：')}
                </p>
                <p className="import-rule-item">
                  {intl
                    .get('smpc.import.view.importCatalogIconRuleItemFirst')
                    .d('1、图片格式支持：*.png;*.jpeg;*jpg，图片最大支持：5MB。')}
                  <br />
                  {intl
                    .get('smpc.import.view.importCatalogIconRuleItemSecond')
                    .d('2、图片名称必须是要导入的三级目录编码。')}
                  <br />
                  {intl
                    .get('smpc.import.view.importCatalogIconRuleItemThird')
                    .d(
                      '3、上传比例为1:1正方形且像素为56X56的图片效果最佳，其他尺寸的图片可能经系统处理后清晰度不佳。'
                    )}
                </p>
              </div>
              <div className={styles['import-img-box']}>
                <Upload
                  className={styles['import-img-upload']}
                  showUploadList={false}
                  action={`${API_HOST}${SRM_SMPC}/v1/${organizationId}/catalog-icon-imports/upload`}
                  headers={{ Authorization: `bearer ${getAccessToken()}` }}
                  data={this.uploadData}
                  onChange={this.handleChange}
                  beforeUpload={this.beforeUpload}
                >
                  <Icon type="plus" className={styles['upload-plus']} />
                </Upload>
                <p>{intl.get('smpc.import.view.upload-message').d('点击此处上传图片压缩包')}</p>
                <p>
                  {intl
                    .get('smpc.import.view.upload-message-rule')
                    .d('文件仅支持.ZIP格式，最大支持512MB')}
                </p>
              </div>
            </Spin>
          )}
        </Content>
      </React.Fragment>
    );
  }
}
