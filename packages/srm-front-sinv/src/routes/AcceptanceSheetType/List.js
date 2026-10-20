import React, { Component } from 'react';
import { sum, isNumber } from 'lodash';
import { Table } from 'hzero-ui';
// import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';
import { Bind } from 'lodash-decorators';
import UploadModal from '_components/Upload/index';

export default class List extends Component {
  @Bind()
  handleOperationRecord(record) {
    const { hideModal, updateState } = this.props;
    hideModal();
    updateState(record);
  }

  /**
   * upTemplate - 上传文件render方法
   * @param {object} record - 行数据
   */
  @Bind()
  upTemplate(text, record) {
    const { handleUpdateRecord } = this.props;
    const uploadProps = {
      icon: false,
      attachmentUUID: record.templateAttachmentUuid,
      btnText: intl.get(`sinv.acceptanceSheetCreate.model.upload`).d('附件模板'),
      showFilesNumber: true,
      bucketName: 'private-bucket',
      bucketDirectory: 'sinv-acceptance',
      contractTypeFlag: true,
      // uploadSuccess: () => uploadSuccessFile(record),
      afterOpenUploadModal: (templateAttachmentUuid) =>
        handleUpdateRecord(record, templateAttachmentUuid),
    };
    return <UploadModal {...uploadProps} />;
  }

  render() {
    const { dataSource, pagination, onSearch, loading } = this.props;
    const columns = [
      {
        title: intl.get(`sinv.acceptanceSheetType.common.acceptListTypeCode`).d('验收单类型编码'),
        dataIndex: 'acceptListTypeCode',
        width: 150,
      },
      {
        title: intl.get(`sinv.acceptanceSheetType.common.acceptListTypeName`).d('验收单类型名称'),
        dataIndex: 'acceptListTypeName',
        width: 150,
      },
      {
        title: intl.get(`sinv.acceptanceSheetType.common.templateFileUrl`).d('验收单附件模板'),
        dataIndex: 'templateFileUrl',
        width: 110,
        render: this.upTemplate,
      },
      {
        title: intl.get(`sinv.acceptanceSheetType.common.enabled`).d('启用'),
        dataIndex: 'enabledFlag',
        width: 150,
        render: (val) => yesOrNoRender(val),
      },
      {
        title: intl.get(`sinv.acceptanceSheetType.common.operation`).d('操作'),
        width: 120,
        render: (value, record) => (
          <a onClick={() => this.handleOperationRecord(record)}>
            {intl.get(`sinv.acceptanceSheetType.common.edit`).d('编辑')}
          </a>
        ),
      },
    ];
    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0)));
    return (
      <Table
        bordered
        rowKey="acceptListTypeId"
        columns={columns}
        dataSource={dataSource}
        pagination={pagination}
        onChange={onSearch}
        scroll={{ x: scrollX }}
        loading={loading}
      />
    );
  }
}
