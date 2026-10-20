import React, { Component } from 'react';
import { Modal } from 'hzero-ui';
import EditTable from 'components/EditTable';
import intl from 'utils/intl';

import { yesOrNoRender } from 'utils/renderer';

export default class ScoringElementModal extends Component {
  render() {
    const { loading, dataSource = [], visible = false, onCancel } = this.props;
    const columns = [
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.indicateCode`).d('要素编码'),
        dataIndex: 'indicateCode',
        width: 120,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.indicateName`).d('要素名称'),
        dataIndex: 'indicateName',
        width: 120,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.indicateType`).d('要素类型'),
        dataIndex: 'indicateTypeMeaning',
        width: 120,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.scoreFrom`).d('分值从'),
        dataIndex: 'minScore',
        width: 120,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.scoreTo`).d('分值至'),
        dataIndex: 'maxScore',
        width: 120,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.mustApprovedFlag`).d('必须通过/合格'),
        dataIndex: 'mustApprovedFlag',
        width: 150,
        render: (val) => yesOrNoRender(val),
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.qualifiedScore`).d('合格分值'),
        dataIndex: 'qualifiedScore',
        width: 120,
      },
    ];

    return (
      <Modal
        destroyOnClose
        width={800}
        visible={visible}
        onCancel={onCancel}
        footer={null}
        title={intl
          .get(`ssrc.bidHall.view.message.title.scoringElementDefinition`)
          .d('评分要素定义')}
      >
        <EditTable
          bordered
          rowKey="prequalScoreAssignId"
          loading={loading}
          columns={columns}
          dataSource={dataSource}
          pagination={false}
        />
      </Modal>
    );
  }
}
