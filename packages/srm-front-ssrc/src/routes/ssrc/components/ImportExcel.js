/**
 * ImportExcel - Excel导入
 * @date: 2019-4-23
 * @author: ZT <tong.zhao@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import React from 'react';
import { Upload, Tabs, Button, Table, Popover, Icon } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import classNames from 'classnames';
import { Content } from 'components/Page';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { API_HOST, HZERO_IMP } from 'utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import notification from 'utils/notification';
import { downloadFile } from 'services/api';

import styles from './importExcel.less';

const { TabPane } = Tabs;
const organizationId = getCurrentOrganizationId();

@formatterCollections({
  code: ['ssrc.supplierQuotation', 'ssrc.bidHall', 'ssrc.common', 'ssrc.inquiryHall', 'sscux.ssrc',],
})
/**
 * 接收属性
 * @columns - 渲染列，错误信息页签列会自动生成
 * @onBack - 头部箭头返回功能回调
 * @extraParams - 校验和导入时传递的额外参数
 * @title - 头部页签显示的标题
 * @templateCode - 模板编码，务必传入
 * @namespace - importExcel的model数据
 * @dispatch - 务必传入，内部需要和model交换数据
 * @importDataLoading - 导入loading
 * @queryPrefixPatchLoading - 服务前缀查询loading
 * @uploadExcelLoading - 上传loading
 * @loadDataSourceLoading - 数据加载loading
 * @queryStatusLoading - 状态查询loading
 * @validateDataLoading - 校验loading
 */
export default class ImportExcel extends React.Component {
  constructor(props) {
    super(props);
    const { columns } = this.props;
    const errColumns = [];
    if (columns && columns.length > 0) {
      // 根据state中的columns为错误信息tab页新增错误信息列
      errColumns.push(columns[0]);
      errColumns.push({
        title: intl.get(`ssrc.inquiryHall.view.message.tab.errorMessage`).d('错误信息'),
        dataIndex: 'errorMsg',
        width: 120,
        render: value => {
          return value ? (
            <Popover placement="topLeft" content={value}>
              {value}
            </Popover>
          ) : (
            ''
          );
        },
      });
      for (let i = 1; i < columns.length; i++) {
        errColumns.push(columns[i]);
      }
    }
    // uniqueKey用于从namespace中拿到自己的数据
    this.state = {
      errColumns,
      uniqueKey: Math.floor(Math.random() * 100000),
    };
  }

  /**
   * 组件挂载后查询服务前缀
   */
  componentDidMount() {
    const { dispatch, templateCode } = this.props;
    dispatch({
      type: 'importExcel/queryPrefixPatch',
      payload: {
        uniqueKey: this.state.uniqueKey,
        organizationId,
        templateCode,
      },
    });
  }

  /**
   * 组件卸载删除命名空间中的数据
   */
  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'importExcel/deleteNamespace',
      payload: {
        uniqueKey: this.state.uniqueKey,
      },
    });
  }

  /**
   * 导入数据分页
   */
  @Bind()
  onHandlePagination(page = {}) {
    const {
      dispatch,
      importExcel: { namespace },
      templateCode,
    } = this.props;
    const { uniqueKey } = this.state;
    const { batch } = namespace[uniqueKey] || {};
    if (batch) {
      dispatch({
        type: 'importExcel/loadDataSource',
        payload: {
          uniqueKey,
          organizationId,
          templateCode,
          page,
        },
      });
    } else {
      notification.warning({
        message: intl.get(`ssrc.inquiryHall.model.inquiryHall.pleaseUploadData`).d('请先上传数据'),
      });
    }
  }

  @Bind()
  scrollWidth(columns, fixWidth) {
    const total = columns.reduce((prev, current) => prev + (current.width ? current.width : 0), 0);
    return total + fixWidth + 1;
  }

  /**
   * 下载模板
   * 调用downloadFile的Api
   */
  @Bind()
  exportOption() {
    const { templateCode } = this.props;
    const api = `${API_HOST}${HZERO_IMP}/v1/${organizationId}/template/${templateCode}/excel`;
    downloadFile({ requestUrl: api });
  }

  /**
   * upload上传文件组件回调
   * @param(File) file
   */
  @Bind()
  beforeUpload(file) {
    const { dispatch, templateCode } = this.props;
    const { uniqueKey } = this.state;
    const formData = new FormData();
    formData.append('excel', file, file.name);
    dispatch({
      type: 'importExcel/uploadExcel',
      payload: {
        uniqueKey,
        organizationId,
        templateCode,
        formData,
      },
    });
    // 关闭upload默认的上传功能
    return false;
  }

  /**
   * 刷新当前数据源和状态
   */
  @Bind()
  refreshData() {
    const { dispatch, templateCode } = this.props;
    const { uniqueKey } = this.state;
    dispatch({
      type: 'importExcel/queryStatus',
      payload: {
        uniqueKey,
        organizationId,
        templateCode,
      },
    });
    dispatch({
      type: 'importExcel/loadDataSource',
      payload: {
        uniqueKey,
        organizationId,
        templateCode,
      },
    });
    return false;
  }

  /**
   * 校验已上传的数据
   */
  @Bind()
  validateData() {
    const { dispatch, templateCode, extraParams } = this.props;
    const { uniqueKey } = this.state;
    dispatch({
      type: 'importExcel/validateData',
      payload: {
        uniqueKey,
        organizationId,
        templateCode,
        ...extraParams,
      },
    });
    return false;
  }

  /**
   * 将数据导入到正式表
   */
  @Bind()
  importData() {
    const { dispatch, templateCode, extraParams } = this.props;
    const { uniqueKey } = this.state;
    dispatch({
      type: 'importExcel/importData',
      payload: {
        uniqueKey,
        organizationId,
        templateCode,
        ...extraParams,
      },
    });
    return false;
  }

  render() {
    const {
      title,
      columns,
      namespace,
      onBack,
      rowKey = '_lineNo',
      uploadExcelLoading,
      loadDataSourceLoading,
      queryStatusLoading,
      queryPrefixPatchLoading,
      validateDataLoading,
      importDataLoading,
    } = this.props;
    const { errColumns, uniqueKey } = this.state;
    const { status = '', dataSource = [], errData = [], pagination = {} } =
      namespace[uniqueKey] || {};
    const uploadProps = {
      accept: '.xls,.xlsx',
      beforeUpload: this.beforeUpload,
      showUploadList: false,
    };
    const scrollWidth = this.scrollWidth(errColumns, 280);
    return (
      <React.Fragment>
        <div className="page-head">
          <div key="page-head-back-btn" className="page-head-back-btn">
            <Icon type="arrow-left" className="back-btn" onClick={onBack} />
          </div>
          {title && (
            <span key="page-head-title" className="page-head-title">
              {title}
            </span>
          )}
          <div
            key="page-head-operator"
            className={classNames(styles['upload-fix-height'], 'page-head-operator')}
          >
            <Button
              type="primary"
              icon="save"
              loading={importDataLoading}
              disabled={status !== 'CHECKED' || (errData && errData.length > 0)}
              onClick={this.importData}
            >
              {intl.get('hzero.common.button.submit').d('提交')}
            </Button>
            <Button
              type="default"
              icon="check-square-o"
              onClick={this.validateData}
              disabled={status !== 'UPLOADED' && status !== 'CHECKED'}
              loading={validateDataLoading}
            >
              {intl.get(`ssrc.inquiryHall.view.message.button.check`).d('核对')}
            </Button>
            <Upload {...uploadProps}>
              <Button
                type="default"
                icon="upload"
                loading={uploadExcelLoading || queryPrefixPatchLoading}
                disabled={queryPrefixPatchLoading}
              >
                {intl.get(`ssrc.inquiryHall.view.message.button.importData`).d('导入数据')}
              </Button>
            </Upload>
            <Button
              type="default"
              icon="reload"
              onClick={this.refreshData}
              disabled={status === ''}
              loading={queryStatusLoading || loadDataSourceLoading}
            >
              {intl.get('hzero.common.button.refresh').d('刷新')}
            </Button>
            <Button
              type="default"
              icon="download"
              onClick={this.exportOption}
              loading={queryPrefixPatchLoading}
              disabled={queryPrefixPatchLoading}
            >
              {intl
                .get(`ssrc.inquiryHall.view.message.button.DownloadImpTemplate`)
                .d('下载导入模板')}
            </Button>
          </div>
        </div>
        <Content className={styles['padding-top-3']}>
          <Tabs defaultActiveKey="dataPane" onChange={this.onChangeTabs} animated={false}>
            <TabPane
              tab={intl.get(`ssrc.inquiryHall.view.message.button.importData`).d('导入数据')}
              key="dataPane"
            >
              <Table
                bordered
                columns={columns}
                rowKey={rowKey}
                scroll={{ x: scrollWidth }}
                dataSource={dataSource}
                onChange={this.onHandlePagination}
                pagination={pagination}
              />
            </TabPane>
            <TabPane
              tab={intl.get(`ssrc.inquiryHall.view.message.tab.errorMessage`).d('错误信息')}
              key="errPane"
            >
              <Table
                columns={errColumns}
                rowKey={rowKey}
                scroll={{ x: scrollWidth + 40 }}
                dataSource={errData}
                bordered
                pagination={false}
              />
            </TabPane>
          </Tabs>
        </Content>
      </React.Fragment>
    );
  }
}
