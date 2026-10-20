/**
 * bidHall - 确认中标候选人 - 评分明细Modal
 * @date: 2019-07-02
 * @author: zoukang <kang.zou@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Form, Row, Col, Modal } from 'hzero-ui';
import { sum, isNumber } from 'lodash';

import CPopover from '@/routes/sbid/components/CPopover';
import EditTable from 'components/EditTable';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';

@formatterCollections({ code: ['ssrc.bidHall'] })
export default class ScoreDetailModal extends Component {
  render() {
    const {
      loading,
      scoreDetailModalVisible,
      cancelScoreDetailModal,
      scoreDetailList = [],
      modalSupplierCompanyName = '',
      modalSectionName = '',
      scoreDetailPagination,
      fetchScoreDetil,
    } = this.props;

    const columns = [
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.elementName`).d('要素名称'),
        dataIndex: 'indicateName',
        render: val => <CPopover content={val}>{val}</CPopover>,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.team`).d('所属组别'),
        dataIndex: 'teamMeaning',
        width: 120,
        render: val => <CPopover content={val}>{val}</CPopover>,
      },
      {
        title: <div>{intl.get(`ssrc.bidHall.model.bidHall.weight`).d(`权重`)}%</div>,
        dataIndex: 'weight',
        width: 100,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.averageScore`).d('平均分'),
        dataIndex: 'averageScore',
        width: 100,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.passStatus`).d('是否通过'),
        dataIndex: 'passStatusMeaning',
        width: 120,
      },
    ];

    const scrollX = sum(columns.map(n => (isNumber(n.width) ? n.width : 0)));

    return (
      <Modal
        width="70%"
        visible={scoreDetailModalVisible}
        title={<h4>{intl.get(`ssrc.bidHall.model.bidHall.scoringDetail`).d('评分明细')}</h4>}
        footer={false}
        onCancel={cancelScoreDetailModal}
      >
        <Row style={{ marginBottom: '10px' }}>
          <Col gutter={12} span={12}>
            {intl.get(`ssrc.bidHall.model.bidHall.supplierName`).d('供应商名称')} :{' '}
            {modalSupplierCompanyName}
          </Col>
          <Col gutter={12} span={12}>
            {intl.get(`ssrc.bidHall.model.bidHall.itemLineName`).d('标段名称')} : {modalSectionName}
          </Col>
        </Row>
        <Form>
          <EditTable
            bordered
            loading={loading}
            columns={columns}
            rowKey="evaluateIndicId"
            dataSource={scoreDetailList}
            srcoll={{ x: scrollX }}
            onChange={page => fetchScoreDetil(page)}
            pagination={scoreDetailPagination}
          />
        </Form>
      </Modal>
    );
  }
}
