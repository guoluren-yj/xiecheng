/**
 *HistoryModal - 商品图片导入记录
 * @date: 2020-05-12
 * @author zjx <jingxi.zhang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */

import React, { Component } from 'react';
import { Table, Modal } from 'hzero-ui';
import intl from 'utils/intl';

export default class HistoryModal extends Component {
  render() {
    const { visible, loading, onCancel, pagination, dataSource, onChange } = this.props;

    const columns = [
      {
        title: intl.get('small.productManage.model.productImgImport.importBatch').d('导入批次'),
        dataIndex: 'batchNum',
      },
      // {
      //   title: intl.get('small.productManage.model.productImgImport.firstFile').d('一级文件夹名称'),
      //   dataIndex: 'dataPath',
      // },
      {
        title: intl.get('small.productManage.model.productImgImport.fileNum').d('文件数量'),
        dataIndex: 'fileNum',
        render: () => 1,
      },
      {
        title: intl.get('small.productManage.model.productImgImport.fileSize').d('文件大小'),
        dataIndex: 'dataSize',
        render: (val) => {
          const sizeKb = val / 1000;
          return `${sizeKb.toFixed(2)}KB`;
        },
      },
      {
        title: intl.get('small.productManage.model.productImgImport.createDate').d('创建日期'),
        dataIndex: 'creationDate',
      },
      {
        title: intl.get('small.productManage.model.productImgImport.importResult').d('导入结果'),
        dataIndex: 'importStatusMeaning',
      },
    ];
    return (
      <Modal
        destroyOnClose
        title={intl.get('small.common.button.operateRecord').d('操作记录')}
        visible={visible}
        onCancel={onCancel}
        footer={null}
        width={800}
      >
        <Table
          bordered
          columns={columns}
          loading={loading}
          dataSource={dataSource}
          pagination={pagination}
          rowKey="dataId"
          onChange={(page) => onChange(page)}
        />
      </Modal>
    );
  }
}
