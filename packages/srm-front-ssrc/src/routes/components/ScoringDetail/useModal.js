import React from 'react';
import { Modal, DataSet, Table, Output, Attachment, Tooltip } from 'choerodon-ui/pro';
import CollapseForm from '_components/CollapseForm';
import { Record } from 'choerodon-ui/dataset';

import intl from 'utils/intl';
import { noop } from 'lodash';
import { PRIVATE_BUCKET } from '_utils/config';
import { yesOrNoRender } from 'utils/renderer';

import { scoreIntervalRender, renderExpertPass, zeroAmountScoreRender } from '@/utils/renderer';
import { INQUIRY } from '@/utils/globalVariable';
import { scoreDetailDS, scoringInfoDS } from './store/storeDS';
import styles from './index.less';

const { Column } = Table;
const promptCode = 'ssrc.common';

const useModal = () => {
  const openModal = (props, modalProps) => {
    const {
      sourceKey = INQUIRY,
      useCustomize = true,
      customizeCollapseForm = noop,
      headerData, // 头相关数据
      recordData, // 行相关数据
      fieldData = {}, // 列相关数据,
      remote,
    } = props;

    const { team, evaluateExpertId, expertName } = fieldData || {};
    const { scoreType } = headerData instanceof Record ? headerData.get(['scoreType']) : headerData;
    const { supplierCompanyName, supplierCompanyId, sourceFrom = 'RFX', quotationHeaderId } =
      recordData instanceof Record
        ? recordData.get([
            'supplierCompanyName',
            'supplierCompanyId',
            'sourceFrom',
            'quotationHeaderId',
          ])
        : recordData;
    let evaluateScoreId = '';
    if (recordData instanceof Record) {
      evaluateScoreId = recordData.get(`${team}${evaluateExpertId}evaluateScoreId`);
    } else {
      evaluateScoreId = recordData[`${team}${evaluateExpertId}evaluateScoreId`];
    }
    const {
      title = `${intl
        .get(`${promptCode}.view.title.expertToSupplierScoringDetail`, {
          expertName,
          supplierCompanyName,
        })
        .d('{expertName}专家对{supplierCompanyName}的评分明细')}`,
    } = modalProps;
    /** ********* 万国二开单据明细评分查询-勿动!!! *********** */

    const scoreDetailDs = new DataSet(
      remote
        ? remote.process('SSRC_INQUIRY_HALL_DETAIL_PROCESS_SCORE_DETAIL_DS', scoreDetailDS(team))
        : scoreDetailDS(team)
    );

    const scoringInfoDs = new DataSet(
      remote
        ? remote.process(
            'SSRC_INQUIRY_HALL_DETAIL_PROCESS_SCORE_INFO_DS',
            scoringInfoDS({
              sourceKey,
              evaluateScoreIds: evaluateScoreId,
              supplierCompanyId,
              sourceFrom,
              quotationHeaderId,
            })
          )
        : scoringInfoDS({
            sourceKey,
            evaluateScoreIds: evaluateScoreId,
            supplierCompanyId,
            sourceFrom,
            quotationHeaderId,
          })
    );
    scoreDetailDs.setQueryParameter(
      'evaluateScoreId',
      recordData instanceof Record
        ? recordData.get(`${team}${evaluateExpertId}evaluateScoreId`)
        : recordData[`${team}${evaluateExpertId}evaluateScoreId`]
    );
    scoringInfoDs.query();
    scoreDetailDs.query();

    const renderCell = (record, dataSet, name) => {
      const { index } = record;
      if (index === dataSet.length - 1) {
        return {
          colSpan: name === 'indicateName' && !['SCORE_NEW'].includes(scoreType) ? 2 : 1,
          hidden: name !== 'indicateName',
        };
      }
      return {
        colSpan:
          name === 'indicateName' && !['SCORE', 'WEIGHT', 'SCORE_NEW'].includes(scoreType) ? 2 : 1,
        hidden: false,
      };
    };
    // 供应商分数标题
    const renderSupplierTitle = (ds) => {
      const record = ds.current;
      if (!record) {
        return intl.get(`ssrc.expertScoring.model.expertScoring.supplierScore`).d('供应商分数');
      }

      switch (record.get('supplierScoreTitle')) {
        case 'SCORE':
          return intl.get(`ssrc.expertScoring.model.expertScoring.supplierScore`).d('供应商分数');
        case 'SCORE_PASS':
          return `${intl
            .get(`ssrc.expertScoring.model.expertScoring.supplierScore`)
            .d('供应商分数')}(${intl
            .get(`ssrc.expertScoring.model.expertScoring.passStatus`)
            .d('是否通过')})`;
        case 'PASS':
          return intl.get(`ssrc.expertScoring.model.expertScoring.passStatus`).d('是否通过');
        default:
          return intl.get(`ssrc.expertScoring.model.expertScoring.supplierScore`).d('供应商分数');
      }
    };

    const renderProps = {
      evaluateScoreId,
      scoreDetailDs,
      scoringInfoDs,
    };
    const renderHeader = () => {
      return remote ? (
        remote.render(
          'SSRC_INQUIRY_HALL_DETAIL_RENDER_VERSION_LIST',
          <Tooltip title={title}>{title}</Tooltip>,
          renderProps
        )
      ) : (
        <Tooltip title={title}>{title}</Tooltip>
      );
    };
    const getColumns = () => {
      const columns = [
        <Column
          name="indicateName"
          onCell={({ record, dataSet }) => renderCell(record, dataSet, 'indicateName')}
          align="left"
        />,
        scoreType === 'SCORE' && [
          <Column
            name="scoringInterval"
            onCell={({ record, dataSet }) => renderCell(record, dataSet)}
            renderer={({ record }) =>
              record.get('indicateType') === 'PASS'
                ? '-'
                : scoreIntervalRender(record.get('minScore'), record.get('maxScore'))
            }
          />,
        ],
        scoreType === 'WEIGHT' && [
          <Column name="weight" onCell={({ record, dataSet }) => renderCell(record, dataSet)} />,
        ],
        <Column
          name="indicScore"
          header={({ dataSet }) => renderSupplierTitle(dataSet)}
          renderer={({ record, value }) =>
            Number(record.get('zeroAmountScoreFlag'))
              ? zeroAmountScoreRender()
              : record.get('indicateType') === 'PASS'
              ? record.get('passStatusMeaning')
              : renderExpertPass(record) || value
          }
          align="right"
        />,
      ];
      return remote
        ? remote.process(`SSRC_INQUIRY_HALL_DETAIL_PROCESS_SCORE_DETAIL_TABLE_COLUMNS`, columns, {
            sourceKey,
            scoreType,
            renderCell,
          })
        : columns;
    };


    const getBaseForm = () => {
      return (
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
      );
    };

    const modal = Modal.open({
      title: renderHeader(),
      drawer: true,
      style: {
        width: 742,
      },
      children: (
        <React.Fragment>
          <h3 className={styles['card-sub-title']} style={{ marginTop: '0' }}>
            <div className={styles['card-sub-title-line']} />
            {intl.get('ssrc.inquiryHall.view.tab.gradInformation').d('评分信息')}
          </h3>
          <div className={styles['scoring-attachment']}>
            {useCustomize ? customizeCollapseForm(
              {
                code: `SSRC.INQUIRY_${sourceKey === INQUIRY ? 'HALL' : 'BID'}_DETAIL.HEADER_RFX`,
                dataSet: scoringInfoDs,
              },
              getBaseForm(),
            ) : getBaseForm()}
          </div>
          <h3 className={styles['card-sub-title']}>
            <div className={styles['card-sub-title-line']} />
            {intl.get('ssrc.inquiryHall.view.inquiryHall.scoreDetail').d('评分明细')}
          </h3>
          <Table
            dataSet={scoreDetailDs}
            mode="tree"
            style={{ maxHeight: `calc(100vh - 400px)` }}
            customizedCode="SSRC.NEW_INQUIRY_HALL_DETAIL.SCORING_DETAIL"
          >
            {getColumns()}
          </Table>
        </React.Fragment>
      ),
      okText: intl.get('hzero.common.button.close').d('关闭'),
      footer: (okBtn) => okBtn,
      afterClose: () => scoreDetailDs.loadData(),
      ...modalProps,
    });
    return modal;
  };
  return {
    openModal,
  };
};

export default useModal;
