/**
 * DownloadAttachments - 寻源大厅
 * @date: 2020.12.29
 * @author:  <xiaomin.wang01@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2020, Hand
 */
import { connect } from 'dva';
import { sum, isNumber, isEmpty } from 'lodash';
import { Modal, Table, Icon, notification } from 'hzero-ui';
import { Popover } from 'choerodon-ui';
import { Picture } from 'choerodon-ui/pro';
import React, { Component, Fragment } from 'react';
import { Bind } from 'lodash-decorators';
import remotes from 'hzero-front/lib/utils/remote';

import { downloadFile } from 'hzero-front/lib/services/api';
import { SRM_SSRC } from '_utils/config';
import intl from 'utils/intl';
import {
  getCurrentOrganizationId,
  isTenantRoleLevel,
  getAccessToken,
  getAttachmentUrl,
} from 'utils/utils';
import { HZERO_FILE } from 'utils/config';
import formatterCollections from 'utils/intl/formatterCollections';
import style from './index.less';

const supportPreviewList = [
  '.doc',
  '.docx',
  '.docm',
  '.dot',
  '.dotx',
  '.dotm',
  '.odt',
  '.fodt',
  '.ott',
  '.rtf',
  '.txt',
  '.html',
  '.htm',
  '.mht',
  '.pdf',
  '.djvu',
  '.fb2',
  '.epub',
  '.xps',
  '.xls',
  '.xlsx',
  '.xlsm',
  '.xlt',
  '.xltx',
  '.xltm',
  '.ods',
  '.fods',
  '.ots',
  '.csv',
  '.pps',
  '.ppsx',
  '.ppsm',
  '.ppt',
  '.pptx',
  '.pptm',
  '.pot',
  '.potx',
  '.potm',
  '.odp',
  '.fodp',
  '.otp',
];

const newUrlPreviewList = [
  // ".doc", ".docx", ".docm",
  '.dot',
  '.dotx',
  '.dotm',
  '.odt',
  '.fodt',
  '.ott',
  '.rtf',
  '.txt',
  '.html',
  '.htm',
  '.mht',
  // ".pdf",
  '.djvu',
  '.fb2',
  '.epub',
  '.xps',
  '.xls',
  '.xlsx',
  '.xlsm',
  '.xlt',
  '.xltx',
  '.xltm',
  '.ods',
  '.fods',
  '.ots',
  '.csv',
  '.pps',
  '.ppsx',
  '.ppsm',
  '.ppt',
  '.pptx',
  '.pptm',
  '.pot',
  '.potx',
  '.potm',
  '.odp',
  '.fodp',
  '.otp',
];

@remotes(
  {
    code: 'SSRC_COMPONENT_DOWNLOADATTACHMENTS',
    name: 'remote',
  },
)
@formatterCollections({ code: ['ssrc.inquiryHall', 'ssrc.common'] })
@connect(({ inquiryHall, loading }) => ({
  inquiryHall,
  processAttachmentsLoading: loading.effects['inquiryHall/processAttachments'],
  viewAttachmentsLoading: loading.effects['inquiryHall/fetchDetailAttachments'],
  organizationId: getCurrentOrganizationId(),
}))
export default class DownloadAttachments extends Component {
  constructor(props) {
    super(props);
    this.state = {
      detailInfo: {}, // 暂存上一个Modal数据
      // previewVisible: false,
      // previewImage: '',
      // previewFileName: '',
    };
  }

  componentDidMount() {
    this.fetchAttachments();
  }

  @Bind()
  fetchAttachments(page = {}) {
    const { dispatch, organizationId, rfxHeaderId, pubRouterAddParams = () => {} } = this.props;
    dispatch({
      type: 'inquiryHall/processAttachments',
      payload: {
        organizationId,
        rfxHeaderId,
        page,
        ...pubRouterAddParams(),
      },
    });
  }

  @Bind()
  fetchDetailAttachments(page = {}, record = {}) {
    const { dispatch, organizationId, rfxHeaderId } = this.props;
    const { detailInfo = {} } = this.state;
    dispatch({
      type: 'inquiryHall/fetchDetailAttachments',
      payload: {
        organizationId,
        rfxHeaderId,
        page,
        createdBy: record.createdBy || detailInfo.createdBy,
        processAttachmentType: record.processAttachmentType || detailInfo.processAttachmentType,
      },
    });
  }

  // 附件下载
  @Bind()
  downLineData(record) {
    const { rfxHeaderId, organizationId, pubRouterAddParams = () => {} } = this.props;
    const { permissionFilterFlag = 0 } = pubRouterAddParams() || {};
    const api = `${SRM_SSRC}/v1/${organizationId}/rfx/${rfxHeaderId}/process-attachment/download-all`;
    downloadFile({
      requestUrl: api,
      queryParams: [
        { name: 'node', value: record.node },
        { name: 'realName', value: record.realName },
        { name: 'permissionFilterFlag', value: permissionFilterFlag || 0 },
      ],
    });
  }

  @Bind()
  handlePreviewFile(item) {
    const { bucketName } = item;
    const fileExtMatch = item?.fileName?.match(/(.[^.]+)$/);
    const fileExt = fileExtMatch ? fileExtMatch[1].toLowerCase() : '';
    const fileUrl = encodeURIComponent(item.fileUrl);
    if (!supportPreviewList.includes(fileExt)) {
      notification.error({
        message: intl.get('hzero.common.title.noPreview').d('该文件不支持预览'),
        description: '',
      });
      return;
    }
    let url;
    if (!newUrlPreviewList.includes(fileExt)) {
      url = `${HZERO_FILE}/v1/${getCurrentOrganizationId()}/file-preview/by-url`;
    } else if (isTenantRoleLevel()) {
      url = `${HZERO_FILE}/v1/${getCurrentOrganizationId()}/file/preview`;
    } else {
      url = `${HZERO_FILE}/v1/file/preview`;
    }
    const openUrl = `${url}?url=${fileUrl}&bucketName=${bucketName}&access_token=${getAccessToken()}`;
    window.open(openUrl);
  }

  /**
   * 预览-图片
   */
  @Bind()
  handlePreviewImage(item) {
    const { organizationId, cuxHandlePreviewImage } = this.props;
    if (cuxHandlePreviewImage) {
      cuxHandlePreviewImage(
        getAttachmentUrl(item.fileUrl, item.bucketName, organizationId, item.bucketDirectory)
      );
    }
  }

  @Bind()
  extname(url) {
    if (!url) {
      return '';
    }
    const temp = url.split('/');
    const filename = temp[temp.length - 1];
    // 解决文件名中带 # 的文件被当成图片处理的问题
    // const filenameWithoutSuffix = filename.split(/#|\?/)[0];
    return (/\.[^./\\]*$/.exec(filename) || [''])[0];
  }

  @Bind()
  isImageUrl(file) {
    const url = file.fileUrl;
    const extension = this.extname(url);
    if (/^data:image\//.test(url) || /(webp|svg|png|gif|jpg|jpeg|bmp)$/i.test(extension)) {
      return true;
    } else if (/^data:/.test(url)) {
      // other file types of base64
      return false;
    } else if (extension) {
      // other file types which have extension
      return false;
    }
    return true;
  }

  /**
   * 预览
   */
  @Bind()
  handlePreview(item) {
    const { cuxHandlePreviewImage } = this.props;
    // 图片预览
    if (this.isImageUrl(item) && cuxHandlePreviewImage) {
      this.handlePreviewImage(item);
    } else {
      // 文档预览
      this.handlePreviewFile(item);
    }
  }

  @Bind()
  previewIcon(imgFlag, item) {
    const { cuxHandlePreviewImage } = this.props;
    return (
      <Icon
        title={intl.get('hzero.common.upload.previewFile').d('预览附件')}
        onClick={() => (!imgFlag || cuxHandlePreviewImage) && this.handlePreview(item)}
        className={style.preview}
        type="eye-o"
      />
    );
  }

  renderContent(record) {
    const { organizationId } = this.props;
    const { rfxProcessAttachmentDTOS = [] } = record;
    if (isEmpty(rfxProcessAttachmentDTOS)) return;

    let currentCount;
    let visible = false;
    let isUploadTimes = false;
    const reverseRfxProcessAttachmentDTOS = [...rfxProcessAttachmentDTOS].reverse();
    const children = reverseRfxProcessAttachmentDTOS.map((item) => {
      if (item.uploadCount && currentCount !== item.uploadCount) {
        currentCount = item.uploadCount;
        visible = true;
        isUploadTimes = true;
      } else {
        visible = false;
      }
      return (
        <Fragment>
          {visible && (
            <h5
              style={{
                'font-size': '12px',
                color: 'rgba(0,0,0,0.45)',
                'line-height': '18px',
                'font-weight': 400,
                marginTop: '8px',
              }}
            >
              {intl
                .get('ssrc.common.view.uploadTimes', {
                  currentCount,
                })
                .d(`第${currentCount}次上传`)}
            </h5>
          )}
          <div style={{ display: 'flex' }}>
            <span
              style={{
                maxWidth: '232px',
                display: 'inline-block',
                'white-space': 'nowrap',
                overflow: 'hidden',
                'text-overflow': 'ellipsis',
                marginLeft: isUploadTimes ? '12px' : 0,
              }}
            >
              {item.processAttachmentTypeMeaning}-{item.fileName}
            </span>
            {this.isImageUrl(item) ? (
              <Picture
                src={getAttachmentUrl(
                  item.fileUrl,
                  item.bucketName,
                  organizationId,
                  item.bucketDirectory
                )}
                className="aaaa"
                style={{ margin: '4px 8px' }}
                width={16}
                height={8}
                objectFit="contain"
                objectPosition="center"
              >
                {this.previewIcon(true, item)}
              </Picture>
            ) : (
              this.previewIcon(false, item)
            )}
          </div>
        </Fragment>
      );
    });

    const tmpl = <div>{children}</div>;

    return tmpl;
  }

  render() {
    const {
      processVisible,
      downloadAll,
      onCancel,
      processAttachmentsLoading,
      inquiryHall: {
        processAttachments = [], // 招标过程附件
        processPagination = {},
      },
      from,
      remote,
    } = this.props;
    // const { previewVisible, previewImage } = this.state;

    let columns = [
      {
        title: intl.get(`ssrc.common.model.common.node`).d('节点'),
        dataIndex: 'nodeMeaning',
        width: 120,
        render: (val, record) => (
          <Popover placement="right" content={record.roundNumber}>
            {val}
          </Popover>
        ),
      },
      {
        title: intl.get(`ssrc.common.model.common.attachmentType`).d('附件类型'),
        dataIndex: 'type',
        width: 250,
        render: (val, record) => (
          <React.Fragment>
            {val}
            <Popover placement="rightTop" content={this.renderContent(record)}>
              <Icon type="paper-clip" style={{ color: '#29BECE', marginLeft: '4px' }} />
            </Popover>
          </React.Fragment>
        ),
      },
      {
        title: intl.get(`ssrc.common.model.common.uploadBy`).d('上传人'),
        dataIndex: 'realName',
        width: 100,
      },
      {
        title: intl.get(`ssrc.common.model.common.creationDate`).d('上传时间'),
        dataIndex: 'creationDate',
        width: 150,
        align: 'center',
      },
      {
        title: intl.get(`ssrc.common.model.common.operation`).d('操作'),
        dataIndex: 'rfxProcessAttachmentDTOS',
        width: 80,
        align: 'center',
        render: (val, record) =>
          val ? (
            <a onClick={() => this.downLineData(record)}>
              {intl.get(`ssrc.common.model.attachment.downLoadFile`).d('下载')}
            </a>
          ) : (
            ''
          ),
      },
    ];

    columns = remote ? remote.process(
      'SSRC_COMPONENT_DOWNLOADATTACHMENTS_PROCESS_TABLE_COLUMNS',
      columns,
      { that: this }
    )
    : columns;

    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0)));
    const tableProps = {
      columns,
      dataSource: processAttachments,
      pagination: processPagination,
      bordered: true,
      scroll: { x: scrollX },
      loading: processAttachmentsLoading,
      onChange: (page) => this.fetchAttachments(page),
    };
    return (
      <div>
        <Modal
          title={
            from === 'examine'
              ? intl.get('ssrc.inquiryHall.view.button.examine').d('过程附件查看')
              : intl.get('hzero.common.button.open').d('过程附件下载')
          }
          visible={processVisible}
          width={800}
          wrapClassName="ant-modal-sidebar-right"
          transitionName="move-right"
          maskClassName={style.maskStyle}
          okButtonProps={{ disabled: processAttachments.length === 0 }}
          okText={intl.get(`ssrc.common.model.common.downloadAll`).d('下载全部文档')}
          cancelText={intl.get(`ssrc.common.model.common.return`).d('返回')}
          onOk={downloadAll}
          onCancel={onCancel}
        >
          <Table {...tableProps} />
        </Modal>
      </div>
    );
  }
}
