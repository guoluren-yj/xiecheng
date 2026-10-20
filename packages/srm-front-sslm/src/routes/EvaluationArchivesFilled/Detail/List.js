import React, { Component } from 'react';
import { Table } from 'hzero-ui';
import { isNumber, sum } from 'lodash';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';
import Upload from 'srm-front-boot/lib/components/Upload/index';
import { PRIVATE_BUCKET } from '_utils/config';

/**
 * 考评档案填制列表组件
 * @export
 * @class List
 * @extends {Component} - React.Component
 * @reactProps {object} dataSource - table数据源
 * @reactProps {boolean} loading - 加载状态
 * @reactProps {object} pagination - 分页器
 * @reactProps {Function} onOk - 关闭Modal的方法
 * @returns React.element
 */
export default class List extends Component {
  /**
   * 关闭Modal
   */
  @Bind()
  handleOk() {
    const { onOk } = this.props;
    if (onOk) {
      onOk();
    }
  }

  @Bind()
  onCell() {
    return {
      style: {
        overflow: 'hidden',
        maxWidth: 180,
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      },
      onClick: e => {
        const { target } = e;
        if (target.style.whiteSpace === 'normal') {
          target.style.whiteSpace = 'nowrap';
        } else {
          target.style.whiteSpace = 'normal';
        }
      },
    };
  }

  /**
   * render
   * @return React.element
   */
  render() {
    const {
      dataSource,
      loading,
      onChange,
      evalGranularity,
      pagination,
      customizeTable,
      custLoading,
    } = this.props;
    const isSu = evalGranularity === 'SU';

    const completeColumns = [
      {
        title: intl.get(`sslm.common.view.supplier.code`).d('供应商编码'),
        dataIndex: 'supplierNum',
        width: 120,
      },
      {
        title: intl.get(`sslm.common.view.supplier.name`).d('供应商名称'),
        dataIndex: 'supplierName',
        width: 200,
      },
      {
        title: intl.get(`sslm.common.view.erpSupplier.code`).d('erp供应商编码'),
        dataIndex: 'erpSupplierNum',
        width: 120,
      },
      {
        title: intl.get(`sslm.common.view.erpSupplier.name`).d('erp供应商名称'),
        dataIndex: 'erpSupplierName',
        width: 200,
      },
      {
        title: intl.get(`sslm.common.model.archiveFilled.scoreItem`).d('评分细项'),
        dataIndex: 'indicatorName',
        onCell: this.onCell,
        width: 120,
      },
      {
        title: intl.get(`sslm.common.model.archiveFilled.scoreStandard`).d('评分标准'),
        dataIndex: 'evalStandard',
        width: 120,
        onCell: this.onCell,
      },
      {
        title: intl.get(`sslm.common.model.archiveFilled.completeFlag`).d('评分状态'),
        dataIndex: 'completeFlag',
        width: 120,
        render: (_, record) => record.completeFlagMeaning,
      },
      {
        title: intl.get(`sslm.common.model.supplierKpiIndicator.indicatorType`).d('指标类型'),
        dataIndex: 'indicatorType',
        width: 100,
        render: (_, record) => record.indicatorTypeMeaning,
      },
      {
        title: intl.get(`sslm.common.model.archiveFilled.score`).d('得分'),
        dataIndex: 'finalScore',
        width: 80,
        render: (value, record) => (record.indicatorType === 'VETO' ? '-' : value),
      },
      {
        title: intl.get(`sslm.common.model.archiveFilled.indexWeight`).d('指标权重%'),
        dataIndex: 'evalWeight',
        width: 100,
      },
      {
        title: intl.get(`sslm.common.model.archiveFilled.scoreFrom`).d('分值从'),
        dataIndex: 'scoreFrom',
        width: 80,
      },
      {
        title: intl.get(`sslm.common.model.archiveFilled.scoreTo`).d('分值至'),
        dataIndex: 'scoreTo',
        width: 80,
      },
      {
        title: intl.get(`sslm.common.model.archiveFilled.isStandard`).d('符合评分标准'),
        dataIndex: 'isStandard',
        width: 120,
        render: yesOrNoRender,
      },
      {
        title: intl.get('sslm.common.model.archiveFilled.isVeto').d('否决该项'),
        dataIndex: 'isVeto',
        width: 120,
        render: yesOrNoRender,
      },
      {
        title: intl.get('sslm.common.model.archiveFilled.indOptName').d('评分选项'),
        dataIndex: 'indOptName',
        width: 120,
      },
      {
        title: intl.get(`sslm.common.model.archiveFilled.feedbackRemark`).d('反馈说明'),
        dataIndex: 'remark',
        width: 200,
        onCell: () => ({
          style: {
            overflow: 'hidden',
            maxWidth: 200,
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          },
          onClick: e => {
            const { target } = e;
            if (target.style.whiteSpace === 'normal') {
              target.style.whiteSpace = 'nowrap';
            } else {
              target.style.whiteSpace = 'normal';
            }
          },
        }),
      },
      {
        width: 120,
        dataIndex: 'scorerAttachmentUuid',
        title: intl.get('sslm.common.model.attachment.upload').d('附件上传'),
        render: val => (
          <Upload viewOnly bucketName={PRIVATE_BUCKET} attachmentUUID={val} filePreview />
        ),
      },
    ];
    if (evalGranularity === 'SU+CA') {
      completeColumns.splice(2, 0, {
        title: intl.get(`sslm.common.model.archiveFilled.purchaseCategory`).d('采购品类'),
        dataIndex: 'categoryName',
        width: 200,
      });
    }
    if (evalGranularity === 'SU+IT') {
      completeColumns.splice(2, 0, {
        title: intl.get(`sslm.common.model.archiveFilled.item`).d('物料'),
        dataIndex: 'itemName',
        width: 200,
      });
    }
    const columns = isSu
      ? completeColumns.filter(
          ({ dataIndex }) => dataIndex !== 'categoryName' || dataIndex !== 'itemName'
        )
      : completeColumns;
    const scrollX = sum(columns.map(n => (isNumber(n.width) ? n.width : 150)));
    return customizeTable(
      {
        code: 'SSLM.ARCHIVE_FILLED_DETAIL.LIST_NEW',
      },
      <Table
        rowKey="evalDtlId"
        scroll={{ x: scrollX, y: 350 }}
        columns={columns}
        dataSource={dataSource}
        bordered
        loading={loading}
        pagination={pagination}
        onChange={onChange}
        custLoading={custLoading}
      />
    );
  }
}
