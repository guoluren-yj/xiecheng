import React, { PureComponent, Fragment } from 'react';
import { Table, Modal, Row, Col } from 'hzero-ui';
import { isNumber, sum } from 'lodash';
import { Bind } from 'lodash-decorators';

import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { yesOrNoRender } from 'utils/renderer';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';

@withCustomize({
  unitCode: ['SSLM.EVALUATION_QUERY_DETAIL.RATING_DETAILS'],
})
@formatterCollections({
  code: ['sslm.evaluationQuery'],
})
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
      granularityList = {},
      checkDetailFlag,
      checkLevelFlag,
      weightedFlag,
      onScorePartDetail,
      customizeTable,
      docStatus,
      openParamVauleModal = () => {},
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
        onCell: this.onCell,
        width: 120,
      },
      {
        title: intl.get(`sslm.evaluationQuery.model.indicator.benchmarkScore`).d('基准分值'),
        dataIndex: 'benchmarkScore',
        width: 100,
        render: (value, record) => (record.parentId === -1 ? value : ''),
      },
      weightedFlag && {
        title: intl.get(`sslm.evaluationQuery.model.index.weight`).d('指标权重%'),
        dataIndex: 'evalWeight',
        width: 100,
      },
      {
        title: intl.get(`sslm.evaluationQuery.model.indicator.scoreFrom`).d('分值从'),
        dataIndex: 'scoreFrom',
        width: 100,
      },
      {
        title: intl.get(`sslm.evaluationQuery.model.indicator.scoreTo`).d('分值至'),
        dataIndex: 'scoreTo',
        width: 100,
      },
      {
        title: intl.get(`sslm.evaluationQuery.score.method`).d('评分方式'),
        dataIndex: 'scoreTypeMeaning',
        width: 120,
        render: (val, record) => (record.leafFlag === 1 ? val : null),
      },
      {
        title: intl.get(`sslm.evaluationQuery.score.indicatorType`).d('指标类型'),
        dataIndex: 'indicatorTypeMeaning',
        width: 120,
      },
      {
        title: intl.get('sslm.evaluationQuery.model.docManage.vetoFlag').d('已否决'),
        dataIndex: 'vetoFlag',
        width: 100,
        render: yesOrNoRender,
      },
      {
        title: intl.get(`sslm.supplierDocManage.model.docManage.evaluationStatus`).d('评分状态'),
        dataIndex: 'completeFlagMeaning',
        width: 120,
        render: (val, record) => {
          if (docStatus === 'NEW') {
            return intl.get(`sslm.supplierDocManage.model.docManage.unScore`).d('尚未进行评分');
          }
          if (record.scoreType === 'SYSTEM') {
            if (record.processStatus === 'COMPLETE') {
              return (
                <a onClick={() => openParamVauleModal(record)}>{record.processStatusMeaning}</a>
              );
            } else {
              return record.processStatusMeaning;
            }
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get('sslm.evaluationQuery.model.docManage.processRemark').d('系统计算说明'),
        dataIndex: 'processRemark',
        width: 130,
      },
      {
        title: intl.get(`sslm.evaluationQuery.model.get.score`).d('得分'),
        dataIndex: 'finalScore',
        width: 80,
        render: (val, record) => {
          const { completeFlag, indicatorType } = record;
          const isVeto = indicatorType === 'VETO';
          if (record.leafFlag !== 0) {
            return completeFlag !== 1 ? (
              ''
            ) : (
              <a onClick={() => onScorePartDetail(record)}>{isVeto ? '-' : val}</a>
            );
          } else {
            return completeFlag !== 1 ? '' : isVeto ? '-' : val;
          }
        },
      },

      {
        title: intl.get(`sslm.evaluationQuery.model.archive.indicatorLevelCode`).d('指标等级'),
        dataIndex: 'indicatorLevelCode',
        width: 100,
        render: (val, record) => {
          const { completeFlag } = record;
          return completeFlag !== 1 ? '' : val;
        },
      },
      {
        title: intl.get(`sslm.evaluationQuery.model.archive.checkLevelIndDesc`).d('校准指标等级'),
        dataIndex: 'checkLevelDesc',
        width: 170,
        render: (val, record) => {
          const { completeFlag } = record;
          return completeFlag !== 1 ? '' : val;
        },
      },
      {
        title: intl.get(`sslm.evaluationQuery.model.score.standard`).d('评分标准'),
        dataIndex: 'evalStandard',
        width: 100,
      },
      weightedFlag && {
        title: intl.get(`sslm.evaluationQuery.model.score.evalWeightScore`).d('指标权重得分'),
        dataIndex: 'evalWeightScore',
        width: 130,
      },
      {
        title: intl.get(`sslm.evaluationQuery.model.score.feedbackDescription`).d('反馈说明'),
        dataIndex: 'respRemarks',
        width: 100,
        render: (val, record) => {
          const { completeFlag } = record;
          return completeFlag !== 1 ? '' : val;
        },
      },
    ].filter(Boolean);
    if (checkDetailFlag) {
      columns.splice(
        -1,
        0,
        {
          title: intl.get(`sslm.evaluationQuery.model.score.checkDetailScore`).d('校准明细得分'),
          dataIndex: 'checkDetailScore',
          width: 100,
          render: (val, record) => {
            const { completeFlag } = record;
            return completeFlag !== 1 ? '' : val;
          },
        },
        {
          title: intl.get(`sslm.evaluationQuery.model.score.dtlRemark`).d('说明'),
          dataIndex: 'dtlRemark',
          width: 100,
          render: (val, record) => {
            const { completeFlag } = record;
            return completeFlag !== 1 ? '' : val;
          },
        }
      );
    }

    if (checkLevelFlag) {
      columns.splice(columns.findIndex(item => item.dataIndex === 'indicatorLevelCode') + 1, 0, {
        title: intl
          .get(`sslm.supplierDocManage.model.docManage.checkLevelIndDesc`)
          .d('校准指标等级'),
        dataIndex: 'checkLevelDesc',
        width: 170,
        render: (val, record) => {
          const { completeFlag } = record;
          return completeFlag !== 1 ? '' : val;
        },
      });
    }

    const scrollX = sum(columns.map(n => (isNumber(n.width) ? n.width : 150)));
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
              : :
            </Col>
            {evalGranularity === 'SU' && <Col span={21}>{granularityList.supplierName || ''}</Col>}
            {(evalGranularity === 'SU+CA' || evalGranularity === 'SU+IT') && (
              <Col span={21}>
                {`${granularityList.supplierName}${
                  granularityList.categoryName ? `+${granularityList.categoryName}` : ''
                }` || ''}
              </Col>
            )}
          </Row>
          {customizeTable(
            {
              code: 'SSLM.EVALUATION_QUERY_DETAIL.RATING_DETAILS',
            },
            <Table
              columns={columns}
              dataSource={scoreDetailList}
              rowKey="evalDtlId"
              loading={loading}
              pagination={false}
              bordered
              scroll={{ x: scrollX, y: 350 }}
            />
          )}
        </Modal>
      </Fragment>
    );
  }
}
