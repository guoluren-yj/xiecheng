/**
 * ProductImgImport - 索赔图片导入
 * @date: 2022-08-13
 * @author: yan.xie <yan.xie@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2022, Hand
 */
import React, { Component } from 'react';
import { Upload, Icon } from 'hzero-ui';
import { DataSet, Table, Button, Select, Spin } from 'choerodon-ui/pro';
import { Row, Col } from 'choerodon-ui';
import { observer } from 'mobx-react-lite';
import { SRM_SQAM } from '_utils/config';
import { Bind } from 'lodash-decorators';
import notification from 'utils/notification';
import { Header, Content } from 'components/Page';
// import ExcelExport from 'components/ExcelExport';
import {
  getAccessToken,
  getCurrentOrganizationId,
  getResponse,
  filterNullValueObject,
} from 'utils/utils';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { API_HOST } from 'utils/config';
import { queryUnifyIdpValue } from 'services/api';
// import { showRecordModal } from './c7nModal';

import Icons from '@/components/Icons';
import { importImages } from './api';
import { tableDs, filterDs } from './ds';
import styles from './index.less';

const organizationId = getCurrentOrganizationId();

const UploadBtn = observer(({ dataSet, ...props }) => (
  <Button icon="get_app" color="primary" disabled={dataSet.totalCount === 0} {...props}>
    {intl.get('sqam.import.view.imgImport').d('图片导入')}
  </Button>
));

@formatterCollections({
  code: ['sqam.import', 'hzero.common', 'sqam.common'],
})
export default class ProductImgImport extends Component {
  constructor(props) {
    super(props);
    this.state = {
      uploadStatus: false,
      uploadSpining: false,
      importStatus: '',
      importDatas: [], // 导入的列表数据
      statusMap: new Map(), // 导入结果值集
    };

    this.tableDs = new DataSet(tableDs());
    this.filterDs = new DataSet(filterDs());
  }

  async componentDidMount() {
    const statusMap = new Map();
    const res = await queryUnifyIdpValue('QAM_SUCCESS_OR_FAIL');
    (res || []).forEach(({ value, meaning }) => {
      statusMap[value] = meaning;
    });
    this.setState({ statusMap });
  }

  @Bind()
  uploadData(file) {
    return {
      fileName: file.name,
    };
  }

  @Bind()
  beforeUpload(file) {
    const { fileSize = 300 * 1024 * 1024 } = this.props;
    const fileType = 'zip';
    this.setState({ uploadSpining: true });
    if (file.type.indexOf(fileType) === -1) {
      notification.warning({
        message: intl.get('sqam.import.view.uploadFileTypeBeZip').d('上传文件类型必须是: zip'),
      });
      return false;
    }
    if (file.size > fileSize) {
      notification.warning({
        message: intl
          .get('sqam.common.view.message.uploadFileSizeLimit', {
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
          this.setState({ importDatas: response, uploadStatus: true }, () => {
            // this.handleFetchFileList();
            // 获取列表数据
            this.tableDs.loadData(response || []);
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

  /**
   *
   * @param {string} importStatus 校验结果code
   * @returns Array 满足条件的数组
   */
  @Bind()
  getListByImportResult(importStatus) {
    const { importDatas } = this.state;
    return importDatas.filter(record => record.importStatus === importStatus);
  }

  // @Bind()
  // async handleFetchFileList() {
  //   const { batchNum } = this.state;
  //   this.tableDs.setQueryParameter('batchNum', batchNum);

  //   this.tableDs.query();
  // }

  toggleLoading = (key, flag) => {
    if (typeof flag === 'boolean') {
      this.setState({ [key]: flag });
    } else {
      this.setState({ [key]: !this.state[key] });
    }
  };

  @Bind()
  async handleImgImport() {
    const { importDatas } = this.state;
    this.toggleLoading('importLoading');
    const res = getResponse(
      await importImages(
        importDatas.map(record => filterNullValueObject({ ...record, fileContent: undefined }))
      )
    );
    this.toggleLoading('importLoading');
    if (res) {
      notification.success();
      this.setState({ importDatas: res }, () => {
        this.tableDs.loadData(res);
      });
    }
  }

  @Bind()
  async handleClearImgs() {
    // const { batchNum } = this.state;
    // this.toggleLoading('clearLoading');
    // const res = getResponse(await clearImages(batchNum));
    // this.toggleLoading('clearLoading');
    // if (res) {
    //   // notification.success();
    //   this.tableDs.loadData([]);
    //   this.setState({ uploadStatus: false });
    // }
    this.tableDs.loadData([]);
    this.setState({ uploadStatus: false, importDatas: [] });
  }

  // @Bind()
  // handleImportRecord(batchNum) {
  //   this.setState({ batchNum, uploadStatus: true }, () => {
  //     if (this.recordModal) this.recordModal.close();
  //     this.handleFetchFileList();
  //   });
  // }

  // handleHistory = () => {
  //   const fieldColumns = [
  //     {
  //       name: 'batchNum',
  //       label: intl.get('sqam.import.model.importBatch').d('导入批次'),
  //       renderer: ({ value }) => <a onClick={() => this.handleImportRecord(value)}>{value}</a>,
  //     },
  //     { name: 'batchCount', label: intl.get('sqam.import.model.importNum').d('导入文件数量') },
  //     {
  //       name: 'batchSize',
  //       label: intl.get('sqam.import.model.importSize').d('导入文件大小'),
  //       renderer: ({ value }) => {
  //         const sizeKb = value / 1000;
  //         return `${sizeKb.toFixed(2)}KB`;
  //       },
  //     },
  //     { name: 'creationDate', label: intl.get('sqam.import.model.importDate').d('导入日期') },
  //     { name: 'userName', label: intl.get('sqam.import.model.operator').d('操作人') },
  //   ];
  //   this.recordModal = showRecordModal({
  //     url: `/smpc/v1/${organizationId}/sku-image-imports/history-batch`,
  //     fields: fieldColumns,
  //     columns: fieldColumns,
  //     width: 800,
  //     title: intl.get('sqam.import.view.record').d('导入记录'),
  //   });
  // };

  @Bind()
  handleResultChange(value) {
    // 获取数据
    this.tableDs.loadData(this.getListByImportResult(value));
  }

  render() {
    const { uploadStatus, importLoading, clearLoading, uploadSpining, statusMap } = this.state;
    const columns = [
      {
        name: 'claimNum',
      },
      // {
      //   name: 'skuCode',
      // },
      {
        name: 'fileName',
      },
      {
        name: 'fileSize',
        renderer: ({ record }) => {
          const sizeKb = record.get('fileSize') / 1000;
          return `${sizeKb.toFixed(2)}KB`;
        },
      },
      {
        name: 'importStatus',
        renderer: ({ value, record }) => {
          const vailStatus = record.get('vailStatus');
          const prefix = value
            ? intl.get('sqam.import.view.productManage.importPrefix').d('导入')
            : intl.get('sqam.import.view.productManage.validatePrefix').d('校验');
          return prefix + statusMap[value || vailStatus];
        },
      },
      {
        name: 'exportErrorMsg',
      },
    ];
    return (
      <React.Fragment>
        <Header
          title={intl.get('sqam.import.view.productManage.imgImport').d('索赔图片导入')}
          backPath={uploadStatus ? undefined : '/sqam/createClaim/list'}
        >
          {uploadStatus && (
            <React.Fragment>
              <Button
                funcType="flat"
                icon="return"
                loading={clearLoading}
                onClick={this.handleClearImgs}
              >
                {intl.get('sqam.import.view.backImgImport').d('返回图片导入')}
              </Button>
              <UploadBtn
                dataSet={this.tableDs}
                loading={importLoading}
                onClick={() => this.handleImgImport()}
              />
              {/* <Button onClick={() => this.handleHistory()} funcType="flat" icon="sync_records">
                {intl.get('sqam.import.view.imgImportHistory').d('查看导入记录')}
              </Button> */}
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
                      {intl.get('sqam.import.model.importStatus').d('导入结果')}:
                    </span>
                    <Select
                      onChange={this.handleResultChange}
                      dataSet={this.filterDs}
                      name="importStatus"
                    />
                  </div>
                </Col>
                {/* <Col span={4}>
                  <ExcelExport
                    buttonText={intl.get('sqam.import.view.button.dataxImport').d('数据导出')}
                    requestUrl={`/smpc/v1/${organizationId}/sku-image-imports/export`}
                    fileName={intl.get('sqam.import.view.imageImportRes').d('图片导入结果')}
                    queryParams={{ importStatus, batchNum }}
                  />
                </Col> */}
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
                    .get('sqam.import.view.importInfoMessage')
                    .d(
                      '将要导入的图片压缩为ZIP格式，压缩包最大支持300MB，图片支持.jpg/.png/.jpeg等格式。'
                    )}
                </span>
                <p className="import-rule-title">
                  {intl.get('sqam.import.view.importRuleTitle').d('文件夹及图片命名规则：')}
                </p>
                <p className="import-rule-item">
                  {intl
                    .get('sqam.import.view.importRuleItemFirst')
                    .d(
                      '1、文件夹：文件夹有且仅有二级，第二级文件夹以「索赔单编号」创建文件夹，所有导入的索赔图片放入对应的文件夹中，一个文件夹最多支持9张图片'
                    )}
                  <br />
                  {intl
                    .get('sqam.import.view.importRuleItemThird')
                    .d('2、只能导入已有索赔单编号的图片附件')}
                  {/* <br />
                  {intl
                    .get('smpc.import.view.importRuleItemFourth')
                    .d('4、已上架商品不能导入图片，需下架后才能导入。')} */}
                </p>
              </div>
              <div className={styles['import-img-box']}>
                <Upload
                  name="multipartFile"
                  className={styles['import-img-upload']}
                  showUploadList={false}
                  action={`${API_HOST}${SRM_SQAM}/v1/${organizationId}/claim-form/picture-import-validate`}
                  headers={{
                    Authorization: `bearer ${getAccessToken()}`,
                  }}
                  data={this.uploadData}
                  onChange={this.handleChange}
                  beforeUpload={this.beforeUpload}
                >
                  <Icon type="plus" className={styles['upload-plus']} />
                </Upload>
                <p>{intl.get('sqam.import.view.upload-message').d('点击此处上传图片压缩包')}</p>
                <p>
                  {intl
                    .get('sqam.import.view.upload-message-rule')
                    .d('文件仅支持.ZIP格式，最大支持300MB')}
                </p>
              </div>
            </Spin>
          )}
        </Content>
      </React.Fragment>
    );
  }
}
