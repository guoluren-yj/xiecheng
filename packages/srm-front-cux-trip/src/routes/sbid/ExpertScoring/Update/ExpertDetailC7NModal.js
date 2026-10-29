import React, { useMemo, useEffect } from 'react';
import { useRequest } from 'ahooks';
import intl from 'utils/intl';
import { isUndefined, noop } from 'lodash';
import { Popover } from 'choerodon-ui';
import {
  Output,
  TextArea,
  Attachment,
  Form,
  Table,
  Switch,
  Spin,
  NumberField,
  Select,
} from 'choerodon-ui/pro';

import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { yesOrNoRender } from 'utils/renderer';
import { getResponse } from 'utils/utils';

import { scoreIntervalRender, zeroAmountScoreRender } from 'srm-front-ssrc/lib/utils/renderer';
import { getContentScrollHeight } from 'srm-front-ssrc/lib/utils/utils';
import { fetchScoringIndic } from 'srm-front-ssrc/lib/services/expertScoringService';
import style from './index.less';

const ExpertDetailC7NModal = (props) => {
  const {
    customizeForm,
    customizeTable,
    scoreInfoDs,
    scoreTableDs,
    subjectMatterRule,
    scoreFlag = false,
    expertUserId,
    expertSequenceNum,
    sourceHeaderId,
    evaluateScoreIds,
    sourceFrom,
    viewScoreTeam = '',
    tabActiveKey = '',
    setTableList = noop,
    exportScoringBuss,
  } = props;

  const { loading, runAsync } = useRequest(fetchScoringIndic, {
    manual: true,
  });

  useEffect(() => {
    scoreInfoDs.query();
    queryTable();
  }, []);

  // 处理供应商数据源
  const renderDataSource = (dataSource = []) => {
    const arrayItem = [];
    let totalDataSource = {};
    const supplierDataSource = dataSource.map((item) => {
      const { detailEnabledFlag, evaluateScoreLineDetailS = [], ...otherItem } = item;
      const totalContent =
        item.sumPassStatus === 'ALL_PASS'
          ? item.sumPassStatusMeaning || ''
          : item.sumPassStatusMeaning
          ? `${item.sumPassStatusMeaning}${item.approvedCount}/${item.allExpertCount}`
          : '';
      totalDataSource = {
        ...totalDataSource,
        indicateNameFlag: 1,
        isEditing: false,
        redFlag: item.sumPassStatus === 'UN_PASS',
        supplierScore: item.supplierScoreTitle === 'PASS' ? totalContent : item.sumIndicScore,
        indicScore: item.supplierScoreTitle === 'PASS' ? totalContent : item.sumIndicScore,
        indicateName: intl.get('ssrc.inquiryHall.model.inquiryHall.summaryScore').d('汇总'),
      };
      if (detailEnabledFlag) {
        let subtotalDataSource = {};
        const elementItem = evaluateScoreLineDetailS.map((element) => {
          let elementDetail = {};
          const { remark: detail = '', ...other } = element;
          elementDetail = { detail, ...other, isEditing: false };
          subtotalDataSource = {
            ...subtotalDataSource,
            indicateNameFlag: 1,
            isEditing: false,
            supplierScore: item.indicScore,
            indicScore: item.indicScore,
            indicateName: intl.get('ssrc.expertScoring.view.message.subtotal').d('小计'),
          };
          return elementDetail;
        });
        elementItem.unshift({
          ...otherItem,
          isEditing: true,
          indicateNameFlag: 0,
          weight: otherItem.weight,
          indicateName: otherItem.indicateName,
        });
        elementItem.push(subtotalDataSource);
        return elementItem;
      } else {
        return { ...item, isEditing: true };
      }
    });
    supplierDataSource.forEach((item) => {
      if (Array.isArray(item)) {
        arrayItem.push(...item);
      } else {
        arrayItem.push(item);
      }
    });
    arrayItem.push(totalDataSource);
    return arrayItem;
  };

  const queryTable = () => {
    const params = {
      sourceHeaderId,
      expertUserId,
      expertSequenceNum,
      sourceFrom,
      evaluateScoreIds,
      viewScoreTeam: viewScoreTeam
        ? tabActiveKey && tabActiveKey === 'business'
          ? 'BUSINESS'
          : 'TECHNOLOGY'
        : undefined,
      viewScoreFlag: scoreFlag ? 1 : undefined,
      customizeUnitCode: scoreFlag
        ? 'SSRC.EXPERT_SCORE_SCORING.LINE_DETAIL_RFX'
        : 'SSRC.EXPERT_SCORE_SCORING.LINE_EDIT_RFX',
    };
    runAsync(params).then((res) => {
      if (getResponse(res)) {
        const data = renderDataSource(res);
        setTableList(res);
        scoreTableDs.loadData(data);
        scoreTableDs.setState('supplierScoreTitle', data[0].supplierScoreTitle);
        scoreTableDs.records.forEach((record) => {
          if (!record.get('isEditing')) {
            record.setState('readOnly', true);
          }
        });
      }
    });
  };

  const renderCell = (record, name) => {
    if (!isUndefined(record.get('indicateNameFlag'))) {
      if (record.get('indicateNameFlag')) {
        return {
          colSpan: name === 'indicateName' ? 2 : 1,
          hidden: name === 'detail',
        };
      } else {
        return {
          colSpan: name === 'indicateName' ? 4 : 1,
          hidden: name !== 'indicateName',
        };
      }
    }
    return {
      colSpan: 1,
      hidden: false,
    };
  };

  const columns = useMemo(() => {
    let tableColumns = [
      {
        name: 'indicateName',
        width: 100,
        onCell: ({ record }) => renderCell(record, 'indicateName'),
        renderer: ({ value, record }) => {
          return !isUndefined(record.get('indicateNameFlag')) && record.get('indicateNameFlag') ? (
            <span style={{ fontWeight: 'bold' }}>{value}</span>
          ) : (
            <span>
              {
                <Popover placement="topLeft" content={value}>
                  {value}
                </Popover>
              }
            </span>
          );
        },
      },
      {
        name: 'detail',
        width: 150,
        onCell: ({ record }) => renderCell(record, 'detail'),
        renderer: ({ value, record }) => {
          return !isUndefined(record.get('indicateNameFlag')) && !record.get('indicateNameFlag')
            ? ''
            : value;
        },
      },
      {
        name: 'betweenScore',
        width: 80,
        onCell: ({ record }) => renderCell(record, 'betweenScore'),
        renderer: ({ record }) =>
          record.get('indicateType') === 'SCORE'
            ? scoreIntervalRender(record.get('minScore'), record.get('maxScore'))
            : '',
      },
      {
        name: 'supplierScore',
        width: 180,
        className: style['indicate-table-cell'],
        onCell: ({ record }) => renderCell(record, 'supplierScore'),
        renderer: ({ record }) =>
          isUndefined(record.get('indicateNameFlag')) && !record.get('indicateNameFlag') ? (
            record.get('indicateType') === 'SCORE' ? (
              Number(record.get('zeroAmountScoreFlag')) ? (
                zeroAmountScoreRender()
              ) : (
                <NumberField name="indicScore" record={record} />
              )
            ) : (
              <Select name="passStatus" record={record} />
            )
          ) : (
            <span
              style={{
                fontWeight: 'bold',
                marginLeft: 8,
                color: record.get('redFlag') ? 'red' : '',
              }}
            >
              {record.get('supplierScore')}
            </span>
          ),
      },
      {
        name: 'weight',
        width: 80,
        renderer: ({ value }) => (value ? `${value}%` : ''),
      },
    ].filter(Boolean);

    tableColumns = exportScoringBuss
      ? exportScoringBuss.process(
          'SSRC_EXPERT_SCORING_BUSS_PROCESS_EXPERT_DETAIL_C7N_TABLE_COLUMNS',
          tableColumns,
          {
            pageProps: props,
          }
        )
      : tableColumns;
    return tableColumns;
  }, []);

  return (
    <React.Fragment>
      <Spin spinning={loading}>
        {customizeForm(
          {
            code:
              sourceFrom === 'RFI' || sourceFrom === 'RFP'
                ? scoreFlag
                  ? 'SSRC.EXPERT_SCORE_SCORING.HEADER_DETAIL_RFI '
                  : 'SSRC.EXPERT_SCORE_SCORING.HEADER_EDIT_RFI'
                : scoreFlag
                ? 'SSRC.EXPERT_SCORE_SCORING.HEADER_DETAIL_RFX'
                : 'SSRC.EXPERT_SCORE_SCORING.HEADER_EDIT_RFX',
            dataSet: scoreInfoDs,
          },
          <Form dataSet={scoreInfoDs} columns={3} labelLayout="horizontal">
            <Output name="sourceNum" />
            <Output name="sourceTitle" />
            {subjectMatterRule === 'PACK' ? <Output name="sectionNum" /> : null}
            <Output name="companyNum" />
            <Output name="companyName" />
            {subjectMatterRule === 'PACK' ? <Output name="sectionName" /> : null}
            {!scoreFlag ? (
              <Switch name="suggestInvalidFlag" />
            ) : (
              <Output name="suggestInvalidFlag" renderer={({ value }) => yesOrNoRender(value)} />
            )}
            <Attachment name="attachmentUuid" readOnly={scoreFlag} viewMode="popup" />
            {!scoreFlag ? (
              <TextArea name="expertSuggestion" newLine />
            ) : (
              <Output name="expertSuggestion" />
            )}
          </Form>
        )}
        {customizeTable(
          {
            code: scoreFlag
              ? 'SSRC.EXPERT_SCORE_SCORING.LINE_DETAIL_RFX'
              : 'SSRC.EXPERT_SCORE_SCORING.LINE_EDIT_RFX',
            dataSet: scoreTableDs,
          },
          <Table
            dataSet={scoreTableDs}
            columns={columns}
            style={{
              maxHeight: getContentScrollHeight(68, true),
            }}
          />
        )}
      </Spin>
    </React.Fragment>
  );
};

const HOCComponent = (Com) => {
  return withCustomize({
    unitCode: [
      'SSRC.EXPERT_SCORE_SCORING.HEADER_EDIT_RFX',
      'SSRC.EXPERT_SCORE_SCORING.LINE_EDIT_RFX',
      'SSRC.EXPERT_SCORE_SCORING.HEADER_DETAIL_RFI',
      'SSRC.EXPERT_SCORE_SCORING.HEADER_EDIT_RFI',
      'SSRC.EXPERT_SCORE_SCORING.HEADER_DETAIL_RFX',
      'SSRC.EXPERT_SCORE_SCORING.LINE_DETAIL_RFX',
    ],
  })(Com);
};

export default HOCComponent(ExpertDetailC7NModal);
