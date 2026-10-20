import React, { PureComponent, Fragment } from 'react';
import { Table, Modal, Row, Col } from 'hzero-ui';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';

@formatterCollections({
  code: ['sslm.evaluationQuery'],
})
export default class ScoreDetail extends PureComponent {
  render() {
    const {
      loading,
      visible,
      closeModal,
      scoreDetailList,
      evalGranularity,
      granularityList = [],
    } = this.props;
    const columns = [
      {
        title: intl.get(`sslm.evaluationQuery.model.indicator.code`).d('指标编码'),
        dataIndex: 'indicatorCode',
        width: 120,
      },
      {
        title: intl.get(`sslm.evaluationQuery.model.indicator.desc`).d('指标描述'),
        dataIndex: 'indicatorName',
        width: 120,
      },
      {
        title: intl.get(`sslm.evaluationQuery.model.index.weight`).d('指标权重%'),
        dataIndex: 'evalWeight',
        width: 80,
      },
      {
        title: intl.get(`sslm.evaluationQuery.score.method`).d('评分方式'),
        dataIndex: 'scoreTypeMeaning',
        width: 120,
        render: (val, record) => (record.leafFlag === 1 ? val : null),
      },
      {
        title: intl.get(`sslm.evaluationQuery.model.get.score`).d('得分'),
        dataIndex: 'finalScore',
        width: 80,
      },
      {
        title: intl.get(`sslm.evaluationQuery.model.score.standard`).d('评分标准'),
        dataIndex: 'evalStandard',
        width: 80,
      },
    ];
    return (
      <Fragment>
        <Modal
          title={intl.get(`sslm.evaluationQuery.model.score.detail`).d('评分明细')}
          destroyOnClose
          visible={visible}
          onCancel={() => closeModal(false)}
          width={850}
          footer={null}
        >
          <Row style={{ marginBottom: '24px' }}>
            <Col span={3}>
              {intl
                .get('sslm.supplierDocManage.model.docManage.choseEvalGranularity')
                .d('考评颗粒度')}
              :
            </Col>
            {evalGranularity === 'SU' && <Col span={21}>{granularityList.supplierName || ''}</Col>}
            {(evalGranularity === 'SU+CA' || evalGranularity === 'SU+IT') && (
              <Col span={21}>
                {`${granularityList.supplierName}+${granularityList.categoryName}` || ''}
              </Col>
            )}
          </Row>
          <Table
            columns={columns}
            dataSource={scoreDetailList}
            rowKey="evalDtlId"
            loading={loading}
            pagination={false}
            bordered
          />
        </Modal>
      </Fragment>
    );
  }
}
