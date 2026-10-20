/**
 * ProductImgImport - 商品图片导入
 * @date: 2020-05-11
 * @author: zjx <jingxi.zhang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { Upload, Icon } from 'hzero-ui';
import { DataSet, Button, Spin, Progress, Icon as C7nIcon } from 'choerodon-ui/pro';
import { Tag, Alert } from 'choerodon-ui';
import qs from 'qs';

import { observer } from 'mobx-react-lite';

import { Bind } from 'lodash-decorators';
import notification from 'utils/notification';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { Header, Content } from 'components/Page';
import ExcelExport from 'components/ExcelExport';
import { getAccessToken, getCurrentOrganizationId, getResponse } from 'utils/utils';
import intl from 'utils/intl';
import SearchBarTable from '_components/SearchBarTable';
import formatterCollections from 'utils/intl/formatterCollections';
import { API_HOST } from 'utils/config';
import { showRecordModal } from '@/utils/c7nModal';

// import Icons from '@/components/Icons';
import { importImages, fetchProgress, fetchImportList } from './api';
import { tableDs } from './ds';
import styles from './index.less';

const organizationId = getCurrentOrganizationId();

const unitCodes = ['SMPC.WORKBENCH_SUP.IMPORT.IMAGE', 'SMPC.WORKBENCH_PUR.IMPORT.IMAGE'];

const UploadBtn = observer(({ dataSet, customDisabled = false, ...props }) => {
  const data = dataSet.toData();
  const disabled = data.length === 0 || customDisabled;
  return (
    <Button icon="archive" color="primary" disabled={disabled} {...props}>
      {intl.get('smpc.import.view.imgImport').d('图片导入')}
    </Button>
  );
});

@formatterCollections({
  code: ['smpc.import', 'smpc.product'],
})
@withCustomize({ unitCode: unitCodes })
export default class ProductImgImport extends Component {
  constructor(props) {
    super(props);
    const {
      location: { pathname, search = '' },
    } = props;
    const { skuType } = qs.parse(search.substr(1));
    const isSup = pathname.includes('product-publish-sup');
    const backPath = `${pathname.split('/img-import')[0]}/list`;
    this.state = {
      isSup,
      backPath,
      batchNum: '',
      uploadStatus: false,
      uploadSpining: false,
      importStatus: '',
      batchType: skuType,
      // 导入进度
      progress: {
        value: 0,
        status: '',
        showProgress: false,
      },
    };

    this.tableDs = new DataSet(tableDs(isSup ? unitCodes[0] : unitCodes[1]));
  }

  componentWillUnmount() {
    this.handleClearImgs();
  }

  @Bind()
  uploadData(file) {
    const { batchType } = this.state;
    return {
      fileName: file.name,
      batchType,
    };
  }

  @Bind()
  queryProgress() {
    const { uploadStatus, batchNum, progress } = this.state;
    if (uploadStatus && batchNum) {
      this.progressTimer = setInterval(async () => {
        const res = getResponse(await fetchProgress(batchNum));
        if (res) {
          // totalImport 不可能为0
          try {
            const { totalImport, successImport = 0, errorImport = 0 } = res || {};
            const successPV = Math.round(((successImport + errorImport) * 100) / totalImport);
            const allFail = totalImport === errorImport;
            this.setState(
              {
                progress: {
                  ...progress,
                  value: successPV,
                  status: allFail ? 'exception' : 'success',
                },
              },
              () => {
                // 刷新列表
                const needRefresh = this.tableDs.find(
                  (r) => r.get('importStatus') === 'CHECK_SUCCESS'
                );
                if (needRefresh) {
                  // this.handleFetchFileList();
                  // quey有loading，频繁刷新影响视觉
                  fetchImportList({
                    page: this.tableDs.currentPage - 1,
                    size: this.tableDs.pageSize,
                    batchNum,
                  }).then((res1) => {
                    this.tableDs.loadData(res1.content);
                  });
                }
                // 图片已全部导入
                if (successImport + errorImport === totalImport) {
                  clearInterval(this.progressTimer);
                }
              }
            );
          } catch (err) {
            console.log(err);
          }
        } else {
          clearInterval(this.progressTimer);
        }
      }, 5000);
    }
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
          this.setState({ batchNum: response, uploadStatus: true }, async () => {
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
    const { batchNum, progress = {} } = this.state;
    this.toggleLoading('importLoading');
    const res = getResponse(await importImages(batchNum));
    this.toggleLoading('importLoading');
    if (res) {
      this.setState({
        progress: {
          ...progress,
          showProgress: true,
        },
      });
      notification.success();
      await this.tableDs.query(this.tableDs.currentPage);
      this.queryProgress();
    }
  }

  @Bind()
  handleClearImgs() {
    this.tableDs.loadData([]);
    this.setState({
      uploadStatus: false,
      progress: {
        value: 0,
        status: '',
        showProgress: false,
      },
    });
    if (this.progressTimer) {
      clearInterval(this.progressTimer);
    }
  }

  handleImportRecord = (batchNum) => {
    this.setState({ batchNum, uploadStatus: true }, () => {
      if (this.recordModal) this.recordModal.close();
      this.handleFetchFileList();
    });
  };

  handleHistory = () => {
    const { batchType } = this.state;
    const fieldColumns = [
      {
        name: 'batchNum',
        label: intl.get('smpc.import.model.importBatch').d('导入批次'),
        width: 216,
        renderer: ({ value }) => <a onClick={() => this.handleImportRecord(value)}>{value}</a>,
      },
      {
        name: 'batchCount',
        label: intl.get('smpc.import.model.importNum').d('导入文件数量'),
        type: 'number',
      },
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
      url: `/smpc/v1/${organizationId}/sku-image-imports/history-batch`,
      fields: fieldColumns,
      columns: fieldColumns,
      width: 742,
      title: intl.get('smpc.import.view.record').d('导入记录'),
      params: {
        batchType,
      },
    });
  };

  @Bind()
  getProgress() {
    const { value, status } = this.state.progress;
    if (status === 'exception') {
      return <C7nIcon type="cancel" />;
    }
    if (value === 100 && status === 'success') {
      return <C7nIcon type="check_circle" />;
    }
    if (value === 0) {
      return <span style={{ color: '#e8e8e8' }}>{value}%</span>;
    }
    return `${value}%`;
  }

  render() {
    const {
      backPath,
      uploadStatus,
      importLoading,
      uploadSpining,
      importStatus,
      batchNum,
      isSup,
      progress: { value, status, showProgress },
    } = this.state;
    const {
      location: { pathname, search = '' },
    } = this.props;
    const columns = [
      {
        name: 'importStatusMeaning',
        renderer: ({ record, text }) => {
          const color = ['CHECK_SUCCESS', 'IMPORT_SUCCESS'].includes(record.get('importStatus'))
            ? 'green'
            : ['CHECK_ERROR', 'IMPORT_ERROR'].includes(record.get('importStatus'))
            ? 'red'
            : 'gray';
          return (
            <Tag color={color} style={{ border: 'none' }} className={styles['agm-tag']}>
              {text}
            </Tag>
          );
        },
      },
      {
        name: 'batchNum',
      },
      {
        name: 'skuCode',
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
        name: 'errorMsg',
      },
    ];
    return (
      <React.Fragment>
        <Header
          title={intl.get('smpc.import.view.productManage.imgImport').d('商品图片导入')}
          backPath={uploadStatus ? `${pathname}${search}` : backPath}
          onBack={this.handleClearImgs}
        >
          {uploadStatus && (
            <React.Fragment>
              <UploadBtn
                dataSet={this.tableDs}
                customDisabled={showProgress && value !== 100}
                loading={importLoading}
                onClick={() => this.handleImgImport()}
              />
              <Button onClick={() => this.handleHistory()} funcType="flat" icon="assignment">
                {intl.get('smpc.import.view.imgImportHistory').d('查看导入记录')}
              </Button>
              <ExcelExport
                buttonText={intl.get('smpc.import.view.button.dataxImport').d('数据导出')}
                requestUrl={`/smpc/v1/${organizationId}/sku-image-imports/export`}
                fileName={intl.get('smpc.import.view.imageImportRes').d('图片导入结果')}
                queryParams={{ importStatus, batchNum }}
                otherButtonProps={{
                  type: 'c7n-pro',
                  funcType: 'flat',
                  icon: 'unarchive',
                }}
              />
            </React.Fragment>
          )}
        </Header>
        <Content>
          {uploadStatus ? (
            <>
              <SearchBarTable
                className={styles['table-gap']}
                columns={columns}
                dataSet={this.tableDs}
                searchCode={isSup ? unitCodes[0] : unitCodes[1]}
                customizedCode="SKU_IMAGE_IMPORT.LIST"
                style={{ maxHeight: 'calc(100vh - 190px)' }}
                searchBarConfig={{
                  closeFilterSelector: true,
                  expandable: false,
                  right: {
                    render: () =>
                      showProgress ? (
                        <div className={styles['progress-wraper']}>
                          <span className={styles['progress-label']}>
                            {intl.get('smpc.import.view.process.imgImport').d('图片导入：')}
                          </span>
                          <Progress value={value} format={this.getProgress} status={status} />
                        </div>
                      ) : (
                        ''
                      ),
                  },
                }}
              />
            </>
          ) : (
            <Spin spinning={uploadSpining}>
              <Alert
                type="warning"
                showIcon
                iconType="lightbulb_outline"
                className={styles['import-alert-message']}
                message={intl
                  .get('smpc.import.view.importInfoMessage')
                  .d(
                    '将要导入的图片放入一个文件夹，再将文件夹压缩为ZIP格式，压缩包最大支持512MB。'
                  )}
                description={
                  <>
                    <p className={styles['import-rule-title']}>
                      {intl.get('smpc.import.view.importRuleTitle').d('规则：')}
                    </p>
                    <p className={styles['import-rule-item']}>
                      {intl
                        .get('smpc.import.view.importRuleItemFirst')
                        .d(
                          '1、单张图片不可超过30MB,支持.jpg/.png等格式，一个商品单次最多上传9张图片。'
                        )}
                      <br />
                      {intl
                        .get('smpc.import.view.importRuleItemSecond')
                        .d('2、图片命名规则:“商品编码_xxx.图片后缀或者物料编码_xxx.图片后缀”。')}
                      <br />
                      {intl
                        .get('smpc.import.view.importRuleItemThird')
                        .d(
                          '3、主图命名为“编码_1.图片后缀”，若商品没有主图，也不存在 xxx_1 的图片，则默认取最后一张图片作为主图。'
                        )}
                    </p>
                  </>
                }
              />
              <div className={styles['import-img-box']}>
                <Upload
                  className={styles['import-img-upload']}
                  showUploadList={false}
                  action={`${API_HOST}/smpc/v1/${organizationId}/sku-image-imports/upload`}
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
