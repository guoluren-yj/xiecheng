import React, { useContext, useEffect, useState, useRef } from 'react';
import { Modal, Table, Output, Attachment, Tooltip } from 'choerodon-ui/pro';
import CollapseForm from '_components/CollapseForm';
import querystring from 'querystring';
import { observer } from 'mobx-react';
import { isEmpty } from 'lodash';

import intl from 'utils/intl';
import { PRIVATE_BUCKET } from '_utils/config';
import { yesOrNoRender } from 'utils/renderer';
import { getResponse } from 'utils/utils';
import { scoreIntervalRender, getZeroTrue, renderExpertPass } from '@/utils/renderer';

import Store from '../../store/index';
import styles from './index.less';

const { Column } = Table;

export default observer(function scoreResult() {
  const {
    routerParams: { sourceCategory, rfHeaderId },
    commonDs: { scoreResultDs, scoreDetailDs, scoringInfoDs },
    storeData: { scoreViewFlag },
    history,
    customizeCollapseForm,
  } = useContext(Store);

  const header = useRef({});
  const [techDynamicColumns, setTechDynamicColumns] = useState([]);
  const [busDynamicColumns, setBusDynamicColumns] = useState([]);
  const [noneDynamicColumns, setNoneDynamicColumns] = useState([]);

  useEffect(() => {
    queryScoreResult();
  }, []);

  // 查询
  const queryScoreResult = async () => {
    const result = getResponse(await scoreResultDs.query());
    if (result && !result.failed) {
      const { bidRuleType, evaluateSummaries } = result;
      header.current = result;
      // 区分商务技术
      if (bidRuleType === 'DIFF') {
        const busColumns = getDynamicColumn(evaluateSummaries, 'BUSINESS');
        const techColumns = getDynamicColumn(evaluateSummaries, 'TECHNOLOGY');
        setTechDynamicColumns(techColumns);
        setBusDynamicColumns(busColumns);
      } else if (bidRuleType === 'NONE') {
        // 不区分
        const noneColumns = getDynamicColumn(evaluateSummaries, 'NONE');
        setNoneDynamicColumns(noneColumns);
      }
      scoreResultDs.loadData(getData(evaluateSummaries, bidRuleType));
    }
  };

  // 渲染通过制列
  const renderPassColumns = (approvedCount, sumPassStatus, value) => {
    return sumPassStatus ? (
      <span style={{ color: getZeroTrue(approvedCount) ? 'red' : '' }}>{sumPassStatus}</span>
    ) : (
      value
    );
  };

  // 获取动态列
  const getDynamicColumn = (data = [], type) => {
    const { evaluateScoreMap = {} } = data?.[0] || {};
    const columns = [];
    // eslint-disable-next-line no-unused-expressions
    evaluateScoreMap?.[type]?.forEach((i) => {
      columns.push(
        <Column
          name={`${i.evaluateExpertId}${i.team}`}
          header={i.expertName}
          renderer={({ record, value }) =>
            scoreViewFlag ? (
              <a onClick={() => handleShowScoreDetail(record, i)}>
                {renderPassColumns(
                  record.get(`${i.evaluateExpertId}${i.team}approvedCount`),
                  record.get(`${i.evaluateExpertId}${i.team}sumPassStatus`),
                  value
                )}
              </a>
            ) : (
              value
            )
          }
        />
      );
    });
    return columns;
  };

  // 获取数据
  const getData = (data = [], type) => {
    if (isEmpty(data)) return;
    const newData = data.map((i) => {
      const { evaluateScoreMap = {}, ...others } = i;
      let dynamicData = {};
      if (type === 'DIFF') {
        (evaluateScoreMap.BUSINESS || []).forEach((n) => {
          dynamicData = {
            ...dynamicData,
            [`${n.evaluateExpertId}${n.team}`]: scoreViewFlag
              ? n.sumIndicScore
              : n.scoreStatusMeaning,
            [`${n.evaluateExpertId}${n.team}evaluateScoreId`]: n.evaluateScoreId,
            [`${n.evaluateExpertId}${n.team}sumPassStatus`]: n.sumPassStatusMeaning,
            [`${n.evaluateExpertId}${n.team}approvedCount`]: n.approvedCount,
          };
        });
        (evaluateScoreMap.TECHNOLOGY || []).forEach((n) => {
          dynamicData = {
            ...dynamicData,
            [`${n.evaluateExpertId}${n.team}`]: scoreViewFlag
              ? n.sumIndicScore
              : n.scoreStatusMeaning,
            [`${n.evaluateExpertId}${n.team}evaluateScoreId`]: n.evaluateScoreId,
            [`${n.evaluateExpertId}${n.team}sumPassStatus`]: n.sumPassStatusMeaning,
            [`${n.evaluateExpertId}${n.team}approvedCount`]: n.approvedCount,
          };
        });
      } else if (type === 'NONE') {
        (evaluateScoreMap.NONE || []).forEach((n) => {
          dynamicData = {
            ...dynamicData,
            [`${n.evaluateExpertId}${n.team}`]: scoreViewFlag
              ? n.sumIndicScore
              : n.scoreStatusMeaning,
            [`${n.evaluateExpertId}${n.team}evaluateScoreId`]: n.evaluateScoreId,
            [`${n.evaluateExpertId}${n.team}sumPassStatus`]: n.sumPassStatusMeaning,
            [`${n.evaluateExpertId}${n.team}approvedCount`]: n.approvedCount,
          };
        });
      }
      return {
        ...others,
        ...dynamicData,
      };
    });
    return newData;
  };

  // 评分明细弹框得分标题
  const renderModalTitle = (dataSet) => {
    const target = dataSet.find((i) => i.get('supplierScoreTitle'));
    if (!target) {
      return intl.get(`ssrc.rfDetail.model.rfDetail.supplierScore`).d('供应商分数');
    }

    switch (target.get('supplierScoreTitle')) {
      case 'SCORE':
        return intl.get(`ssrc.rfDetail.model.rfDetail.supplierScore`).d('供应商分数');
      case 'SCORE_PASS':
        return `${intl
          .get(`ssrc.rfDetail.model.rfDetail.supplierScore`)
          .d('供应商分数')}(${intl.get(`ssrc.rfDetail.model.rfDetail.passStatus`).d('是否通过')})`;
      case 'PASS':
        return intl.get(`ssrc.rfDetail.model.rfDetail.passStatus`).d('是否通过');
      default:
        return intl.get(`ssrc.rfDetail.model.rfDetail.supplierScore`).d('供应商分数');
    }
  };

  // 展示评分要素
  const handleShowScoreDetail = (rowData = {}, field = {}) => {
    const { quotationHeaderId, supplierCompanyId } = rowData.get([
      'quotationHeaderId',
      'supplierCompanyId',
    ]);
    scoringInfoDs.setQueryParameter('queryParams', {
      evaluateScoreIds: rowData.get(`${field.evaluateExpertId}${field.team}evaluateScoreId`),
      quotationHeaderId,
      supplierId: supplierCompanyId,
    });
    scoringInfoDs.query();

    scoreDetailDs.setQueryParameter(
      'evaluateScoreId',
      rowData.get(`${field.evaluateExpertId}${field.team}evaluateScoreId`)
    );
    if (['BUSINESS', 'TECHNOLOGY'].includes(field.team)) {
      scoreDetailDs.setQueryParameter('team', field.team);
    }
    scoreDetailDs.query();

    const title = `${field.expertName}${intl
      .get('ssrc.rfDetail.view.message.expertTo')
      .d('专家对')}${rowData.get('supplierCompanyName')}${intl
      .get('ssrc.rfDetail.view.message.score.details')
      .d('的评分明细')}`;

    Modal.open({
      title: (
        <div className={styles['card-title']}>
          <Tooltip title={title}>{title}</Tooltip>
        </div>
      ),
      style: {
        width: 742,
      },
      drawer: true,
      children: (
        <React.Fragment>
          <h3 className={styles['card-sub-title']} style={{ marginTop: '0' }}>
            <div className={styles['card-sub-title-line']} />
            {intl.get('ssrc.inquiryHall.view.tab.gradInformation').d('评分信息')}
          </h3>
          <div className={styles['scoring-attachment']}>
            {customizeCollapseForm(
              {
                code: `SSRC.INQUIRY_HALL_RF_DETAIL.SCORE_DETAIL_HEADER_${sourceCategory}`,
                dataSet: scoringInfoDs,
              },
              <CollapseForm
                dataSet={scoringInfoDs}
                columns={3}
                showLines={6}
                labelLayout="vertical"
                className="c7n-pro-vertical-form-display"
              >
                <Output name="suggestInvalidFlag" renderer={({ value }) => yesOrNoRender(value)} />
                <Output
                  name="expertSuggestion"
                  renderer={({ value }) => (
                    <Tooltip title={value}>
                      <div className={styles['expert-suggestion']}>{value || '-'}</div>
                    </Tooltip>
                  )}
                />
                <Output
                  name="attachmentUuid"
                  renderer={({ value }) =>
                    value ? (
                      <Attachment
                        readOnly
                        value={value}
                        bucketName={PRIVATE_BUCKET}
                        bucketDirectory="ssrc-expert-header"
                        viewMode="popup"
                      />
                    ) : (
                      '-'
                    )
                  }
                />
              </CollapseForm>
            )}
          </div>
          <h3 className={styles['card-sub-title']}>
            <div className={styles['card-sub-title-line']} />
            {intl.get('ssrc.inquiryHall.view.inquiryHall.scoreDetail').d('评分明细')}
          </h3>
          <Table dataSet={scoreDetailDs} mode="tree">
            <Column name="indicateName" />
            {['SCORE', 'SCORE_NEW'].includes(header.current?.scoreType) && [
              <Column
                name="scoringInterval"
                renderer={({ record }) =>
                  record.get('indicateType') === 'PASS' ||
                  (!record.get('minScore') && !record.get('maxScore'))
                    ? '-'
                    : scoreIntervalRender(record.get('minScore'), record.get('maxScore'))
                }
              />,
            ]}
            <Column
              name="indicScore"
              header={({ dataSet }) => renderModalTitle(dataSet)}
              renderer={({ record, value }) =>
                record.get('indicateType') === 'PASS'
                  ? record.get('passStatusMeaning')
                  : renderExpertPass(record) || value
              }
            />
            {header.current?.scoreType === 'WEIGHT' && [<Column name="weight" />]}
          </Table>
        </React.Fragment>
      ),
      afterClose: () => scoreDetailDs.loadData([]),
    });
  };

  /**
   * 跳转到回复详情
   *
   */
  const jumpReplyDetail = (record) => {
    const search = querystring.stringify({
      backRecommend: 'rfDetail',
      quotationHeaderId: record?.get('quotationHeaderId'),
    });
    history.push({
      pathname: `/ssrc/new-inquiry-hall/reply-detail/${sourceCategory}/${rfHeaderId}`,
      search,
    });
    const source = {
      label: 'recommend',
      url: `/ssrc/new-inquiry-hall/rf-detail/${sourceCategory}/${rfHeaderId}`,
    };
    sessionStorage.setItem('sourceRouter', JSON.stringify(source));
    sessionStorage.setItem('sourceRouter+/ssrc/new-inquiry-hall', JSON.stringify(source));
  };

  // 渲染评分结果标题
  const renderScoreTitle = (dataSet) => {
    const record = dataSet.current;
    if (!record) {
      return intl.get(`ssrc.rfDetail.model.rfDetail.score`).d('总分');
    }
    if (record.get('sumPassStatus')) {
      return intl.get(`ssrc.rfDetail.model.rfDetail.scoreResult`).d('打分结果');
    } else {
      return intl.get(`ssrc.rfDetail.model.rfDetail.score`).d('总分');
    }
  };

  return (
    <Table dataSet={scoreResultDs}>
      <Column name="supplierCompanyNum" />
      <Column name="supplierCompanyName" />
      {scoreViewFlag && (
        <Column
          header={intl.get(`ssrc.rfDetail.model.rfDetail.answerDetail`).d('回复详情')}
          renderer={({ record }) => (
            <a onClick={() => jumpReplyDetail(record)}>
              {intl.get(`ssrc.rfDetail.model.rfDetail.answerDetail`).d('回复详情')}
            </a>
          )}
        />
      )}
      {scoreViewFlag && [
        <Column name="candidateFlag" renderer={({ value }) => yesOrNoRender(value)} />,
        <Column name="candidateSuggestion" />,
        <Column
          name="score"
          header={({ dataSet }) => renderScoreTitle(dataSet)}
          renderer={({ value, record }) =>
            renderPassColumns(record.get('approvedCount'), record.get('sumPassStatus'), value)
          }
        />,
      ]}
      {header.current?.bidRuleType === 'DIFF' && [
        <Column
          header={
            header.current?.scoreType === 'SCORE_NEW'
              ? intl.get(`ssrc.rfDetail.model.rfDetail.technologyWeight`).d('技术组')
              : `${intl.get(`ssrc.rfDetail.model.rfDetail.technologyWeight`).d('技术组')}${
                  header.current?.technologyWeight
                }%`
          }
        >
          {techDynamicColumns || []}
        </Column>,
        <Column
          header={
            header.current?.scoreType === 'SCORE_NEW'
              ? intl.get(`ssrc.rfDetail.model.rfDetail.businessWeight`).d('商务组')
              : `${intl.get(`ssrc.rfDetail.model.rfDetail.businessWeight`).d('商务组')}${
                  header.current?.businessWeight
                }%`
          }
        >
          {busDynamicColumns || []}
        </Column>,
      ]}
      {header.current?.bidRuleType === 'NONE' && noneDynamicColumns}
      {scoreViewFlag && [
        <Column name="invalidFlag" renderer={({ value }) => yesOrNoRender(value)} />,
      ]}
      {scoreViewFlag && [<Column name="invalidReason" />]}
    </Table>
  );
});
