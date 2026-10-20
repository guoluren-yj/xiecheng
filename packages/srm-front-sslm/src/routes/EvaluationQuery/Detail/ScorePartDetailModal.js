import React, { Component } from 'react';
import { Modal, Table } from 'hzero-ui';
import { sum, isNumber } from 'lodash';
import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';
import formatterCollections from 'utils/intl/formatterCollections';
import Upload from 'srm-front-boot/lib/components/Upload/index';
import { PRIVATE_BUCKET } from '_utils/config';

/**
 *考评档案管理各个 modal 组件
 *
 * @export
 * @class DetailModal
 * @extends {Component} - React.element
 * @reactProps {boolean} visible - modal 是否可以
 * @reactProps {object} modalData - modal 中表格的数据源
 * @reactProps {object} pagination - modal 中表格的分页数据
 * @reactProps {function} onClose - 关闭 modal 的方法
 * @returns React.element
 */
@formatterCollections({
  code: ['sslm.supplierDocManage', 'sslm.common'],
})
export default class DetailModal extends Component {
  onCell() {
    return {
      style: {
        overflow: 'hidden',
        maxWidth: 120,
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
   * @return React.element
   */
  render() {
    const {
      visible,
      modalData,
      modalPagination,
      loading,
      closeModal,
      lineCurrentRecord,
    } = this.props;
    const columns = [
      {
        title: intl.get(`sslm.supplierDocManage.model.docManage.loginName`).d('评分人账户'),
        dataIndex: 'loginName',
        width: 120,
      },
      {
        title: intl.get(`sslm.supplierDocManage.model.docManage.graderDesc`).d('评分人描述'),
        dataIndex: 'userName',
        onCell: this.onCell,
        width: 120,
      },
      {
        title: intl.get(`sslm.supplierDocManage.model.docManage.completeFlag`).d('评分状态'),
        dataIndex: 'completeFlagMeaning',
        onCell: this.onCell,
        width: 120,
      },
      {
        title: intl.get(`sslm.supplierDocManage.model.docManage.scoreWeightPrec`).d('权重%'),
        dataIndex: 'respWeight',
        width: 100,
      },
      {
        title: intl.get(`sslm.supplierDocManage.model.docManage.defaultScore`).d('缺省分值'),
        dataIndex: 'defaultScore',
        width: 100,
      },
      {
        title: intl.get(`sslm.supplierDocManage.model.docManage.isStandard`).d('符合评分标准'),
        dataIndex: 'isStandard',
        width: 120,
        render: (val, record) => {
          const { completeFlag } = record;
          return completeFlag !== 1 ? '' : yesOrNoRender(val);
        },
      },
      {
        title: intl.get(`sslm.supplierDocManage.model.docManage.isVeto`).d('否决该项'),
        dataIndex: 'isVeto',
        width: 100,
        render: (val, record) => {
          const { completeFlag } = record;
          return completeFlag !== 1 ? '' : yesOrNoRender(val);
        },
      },
      {
        title: intl.get('sslm.evaluationQuery.model.archiveFilled.indOptName').d('评分选项'),
        dataIndex: 'indOptName',
        width: 120,
        render: (val, record) => {
          const { completeFlag } = record;
          return completeFlag !== 1 ? '' : val;
        },
      },
      {
        title: intl.get(`sslm.supplierDocManage.model.docManage.score`).d('得分'),
        dataIndex: 'score',
        width: 80,
        render: (val, record) => {
          const { completeFlag } = record;
          return completeFlag !== 1 || lineCurrentRecord?.indicatorType === 'VETO' ? '-' : val;
        },
      },
      {
        title: intl
          .get(`sslm.supplierDocManage.model.docManage.respWeightScore`)
          .d('评分人权重得分'),
        dataIndex: 'respWeightScore',
        width: 130,
        render: (val, record) => {
          const { completeFlag } = record;
          return completeFlag !== 1 ? '' : val;
        },
      },
      {
        title: intl.get(`sslm.supplierDocManage.model.docManage.feedbackDescription`).d('反馈备注'),
        dataIndex: 'feedback',
        width: 100,
        render: (val, record) => {
          const { completeFlag } = record;
          return completeFlag !== 1 ? '' : val;
        },
      },
      {
        width: 120,
        dataIndex: 'scorerAttachmentUuid',
        title: intl.get('sslm.common.model.attachment.upload').d('附件上传'),
        render: (val, record) => {
          const { completeFlag } = record;
          return completeFlag !== 1 ? (
            ''
          ) : (
            <Upload viewOnly bucketName={PRIVATE_BUCKET} attachmentUUID={val} filePreview />
          );
        },
      },
    ];
    const scrollX = sum(columns.map(n => (isNumber(n.width) ? n.width : 150)));
    return (
      <Modal
        title={intl
          .get(`sslm.supplierDocManage.model.docManage.evaluationStatusTitle`)
          .d('评分完成情况')}
        visible={visible}
        onCancel={() => closeModal(false)}
        footer={null}
        width={900}
      >
        <Table
          columns={columns}
          dataSource={modalData}
          bordered
          loading={loading}
          pagination={modalPagination}
          scroll={{ x: scrollX }}
        />
      </Modal>
    );
  }
}
