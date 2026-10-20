import React, { PureComponent, Fragment } from 'react';
import { Table, Modal, Row, Col } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { yesOrNoRender } from 'utils/renderer';

@formatterCollections({ code: ['sslm.common', 'sslm.receivedEvaluationResult'] })
export default class ScoreDetail extends PureComponent {
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

  render() {
    const {
      loading,
      visible,
      closeModal,
      scoreDetailList,
      evalGranularity,
      checkDetailFlag,
      checkLevelFlag,
      weightedFlag,
      granularityList = [],
      customizeTable,
      custLoading,
      openParamVauleModal = () => {},
    } = this.props;

    const columns = [
      {
        title: intl.get(`sslm.common.model.indicator.code`).d('指标编码'),
        dataIndex: 'indicatorCode',
        width: 120,
      },
      {
        title: intl.get(`sslm.common.model.indicator.desc`).d('指标描述'),
        dataIndex: 'indicatorName',
        width: 120,
        onCell: this.onCell,
      },
      weightedFlag && {
        title: intl.get(`sslm.common.model.archiveFilled.indexWeight`).d('指标权重%'),
        dataIndex: 'evalWeight',
        width: 100,
      },
      weightedFlag && {
        title: intl.get(`sslm.supplierDocManage.model.docManage.evalWeightScore`).d('指标权重得分'),
        dataIndex: 'evalWeightScore',
        width: 120,
      },
      {
        title: intl.get(`sslm.common.model.score.method`).d('评分方式'),
        dataIndex: 'scoreTypeMeaning',
        width: 120,
        render: (val, record) => (record.leafFlag === 1 ? val : null),
      },
      {
        title: intl.get(`sslm.supplierDocManage.model.docManage.evaluationStatus`).d('评分状态'),
        dataIndex: 'processStatus',
        width: 120,
        render: (_val, record) => {
          if (record.scoreType === 'SYSTEM') {
            return <a onClick={() => openParamVauleModal(record)}>{record.processStatusMeaning}</a>;
          }
        },
      },
      {
        title: intl.get(`sslm.common.model.supplierKpiIndicator.indicatorType`).d('指标类型'),
        dataIndex: 'indicatorTypeMeaning',
        width: 120,
      },
      {
        title: intl.get('sslm.receivedEvaluationResult.model.docManage.vetoFlag').d('已否决'),
        dataIndex: 'vetoFlag',
        width: 100,
        render: yesOrNoRender,
      },
      {
        title: intl.get(`sslm.common.model.archiveFilled.score`).d('得分'),
        dataIndex: 'finalScore',
        width: 80,
        render: (val, record) => {
          const { indicatorType } = record;
          return indicatorType === 'VETO' ? '-' : val;
        },
      },
      {
        title: intl.get(`sslm.common.model.archiveFilled.indicatorLevelCode`).d('指标等级'),
        dataIndex: 'indicatorLevelCode',
        width: 100,
      },
      {
        title: intl.get(`sslm.common.model.archiveFilled.scoreStandard`).d('评分标准'),
        dataIndex: 'evalStandard',
        width: 100,
      },
      {
        title: intl
          .get(`sslm.receivedEvaluationResult.model.score.feedbackDescription`)
          .d('反馈说明'),
        dataIndex: 'respRemarks',
        onCell: this.onCell,
        width: 100,
      },
    ].filter(Boolean);

    if (checkDetailFlag) {
      columns.splice(-1, 0, {
        title: intl.get(`sslm.common.model.archiveFilled.checkDetailScore`).d('校准明细得分'),
        dataIndex: 'checkDetailScore',
        width: 150,
      });
    }

    if (checkLevelFlag) {
      columns.splice(columns.findIndex(item => item.dataIndex === 'indicatorLevelCode') + 1, 0, {
        title: intl.get(`sslm.common.model.archiveFilled.checkLevelIndDesc`).d('校准指标等级'),
        dataIndex: 'checkLevelDesc',
        width: 100,
      });
    }
    return (
      <Fragment>
        <Modal
          title={intl.get(`sslm.common.model.score.detail`).d('评分明细')}
          destroyOnClose
          visible={visible}
          onCancel={() => closeModal(false)}
          width={850}
          footer={null}
        >
          <Row style={{ marginTop: '-10px', marginBottom: '10px' }}>
            <Col span={3}>
              {intl
                .get('sslm.receivedEvaluationResult.model.docManage.granularity')
                .d('考评颗粒度')}
              :
            </Col>
            {evalGranularity === 'SU' && <Col span={21}>{granularityList.supplierName || ''}</Col>}
            {evalGranularity === 'SU+CA' && (
              <Col span={21}>
                {`${granularityList.supplierName}+${granularityList.categoryName}` || ''}
              </Col>
            )}
            {evalGranularity === 'SU+IT' && (
              <Col span={21}>
                {`${granularityList.supplierName}+${granularityList.itemName}` || ''}
              </Col>
            )}
          </Row>
          {customizeTable(
            {
              code: 'SSLM.EVALUATION_RECEIVED_DETAIL.RATING_DETAILS',
            },
            <Table
              columns={columns}
              dataSource={scoreDetailList}
              rowKey="evalDtlId"
              loading={loading}
              pagination={false}
              bordered
              custLoading={custLoading}
            />
          )}
        </Modal>
      </Fragment>
    );
  }
}
