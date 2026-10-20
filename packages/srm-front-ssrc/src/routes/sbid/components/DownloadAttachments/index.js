/* eslint-disable react/jsx-indent */
/**
 * bidHall - 招标大厅 - DownloadAttachments
 * @date: 2020.7.22
 * @author: zoukang <kang.zou@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */
import { connect } from 'dva';
import React, { Component } from 'react';
import { Modal, Table } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { sum, isNumber } from 'lodash';
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import UploadModal from 'srm-front-boot/lib/components/Upload/index';
import { PRIVATE_BUCKET } from '_utils/config';

@connect(({ bidHall, loading }) => ({
  bidHall,
  bidProcessAttachmentsLoading: loading.effects['bidHall/bidProcessAttachments'],
  organizationId: getCurrentOrganizationId(),
}))
export default class DownloadAttachments extends Component {
  componentDidMount() {
    this.fetchAttachments();
  }

  @Bind()
  fetchAttachments(page = {}) {
    const { dispatch, organizationId, bidHeaderId } = this.props;
    dispatch({
      type: 'bidHall/bidProcessAttachments',
      payload: {
        organizationId,
        bidHeaderId,
        page,
      },
    });
  }

  render() {
    const {
      processVisible,
      downloadAll,
      onCancel,
      organizationId,
      bidProcessAttachmentsLoading,
      bidHall: {
        bidProcessAttachments = [], // 招标过程附件
        bidProcessPagination = {},
      },
    } = this.props;
    const columns = [
      {
        title: intl.get(`ssrc.common.model.common.attachmentType`).d('附件类型'),
        dataIndex: 'attachmentTypeMeaning',
        width: 100,
        align: 'center',
      },
      {
        title: intl.get(`ssrc.common.model.common.uploadBy`).d('上传人'),
        dataIndex: 'uploadBy',
        width: 100,
        align: 'center',
      },
      {
        title: intl.get(`ssrc.common.model.common.operation`).d('操作'),
        dataIndex: 'attachmentUuid',
        width: 100,
        align: 'center',
        // render: val => {
        //   return (
        //     <a>
        //       {intl.get(`ssrc.bidHall.view.button.download`).d('下载')}
        //     </a>
        //   );
        // },
        render: (val) =>
          val ? (
            <UploadModal
              filePreview
              viewOnly
              // eslint-disable-next-line react/jsx-indent-props
              icon="download"
              bucketName={PRIVATE_BUCKET}
              attachmentUUID={val}
              tenantId={organizationId}
              btnText={intl.get(`ssrc.common.model.attachment.downLoadFile`).d('下载')}
            />
          ) : (
            ''
          ),
      },
    ];
    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0)));
    const tableProps = {
      columns,
      dataSource: bidProcessAttachments,
      pagination: bidProcessPagination,
      bordered: true,
      scroll: { x: scrollX },
      loading: bidProcessAttachmentsLoading,
      onChange: (page) => this.fetchAttachments(page),
    };
    return (
      <React.Fragment>
        <Modal
          title={intl.get(`ssrc.bidHall.view.message.title.downloadAttachments`).d('过程附件下载')}
          visible={processVisible}
          width={600}
          okText={intl.get(`ssrc.common.model.common.downloadAll`).d('下载全部文档')}
          cancelText={intl.get(`ssrc.common.model.common.return`).d('返回')}
          onOk={downloadAll}
          onCancel={onCancel}
        >
          <Table {...tableProps} />
        </Modal>
      </React.Fragment>
    );
  }
}
