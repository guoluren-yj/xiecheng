/**
 * 专家评分
 * 代码来自
 * src/routes/ssrc/InquiryHall/Detail/ExpertScoring/ExpertScoringNew.js
 *
 */
import React, { useState, useEffect, useContext } from 'react';
import { Table, Modal } from 'choerodon-ui/pro';
import { Tag } from 'choerodon-ui';
import { toJS } from 'mobx';
import { observer } from 'mobx-react';
import { isEmpty, orderBy } from 'lodash';
import querystring from 'querystring';
import EmbedPage from '_components/EmbedPage';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';

import CPopover from '@/routes/components/CPopover/';
import { yesOrNoRender } from 'utils/renderer';
import ScoringDetail from '@/routes/components/ScoringDetail';

import ScoreDetailModal from '@/routes/ssrc/InquiryHall/ConfirmCandidate/ScoreDetailModal';
import { fetchExpertScoreDetails } from '@/services/expertScoringService';
import { fetchEvaluateSummary, fetchScoreDetail } from '@/services/inquiryHallService';
import { StoreContext } from '../../store/StoreProvider';

const QuotationQueryKey = Modal.key();

const ExpertScore = () => {
  const {
    commonDs: { expertScoreHeadDS, expertScoreDS },
    headerInfo = {},
    rfxHeaderId = '',
    organizationId = '',
    quotationName = '',
    bidFlag,
  } = useContext(StoreContext);

  const { newQuotationFlag } = headerInfo || {};

  const { current: headerCurrent } = expertScoreHeadDS || {};
  const { currentUserIsOnlyTechnologyExpertFlag } = headerCurrent
    ? headerCurrent.get(['currentUserIsOnlyTechnologyExpertFlag'])
    : {};

  const [scoreDetailModalVisible, setScoreDetailModalVisible] = useState(false);
  const [scoreData, setScoreData] = useState({});

  useEffect(() => {
    fetchHeaderInfo();
    // fetchTable();
  }, [rfxHeaderId]);

  const getLineDtoFromLineData = (item, mapData) => {
    const { supplierCompanyId } = item;

    let data = {};
    Object.keys(mapData).forEach((key) => {
      const value = mapData[key] || [];

      if (!isEmpty(value)) {
        data = value.find((line) => line.supplierCompanyId === supplierCompanyId);
      }
    });

    return data;
  };

  const generateNewTableList = (list, lineData) => {
    if (isEmpty(list)) {
      return {};
    }

    const newList = orderBy(list, ['summaryScore'], ['desc']);

    const mapData = lineData?.evaluateSummaryMap || {};
    // 打平分数细项 到供应商行上
    const NewSupplierList = newList.map((item = {}) => {
      const { scoreDetails = [] } = item || {};
      const matchLineSupplierDto = getLineDtoFromLineData(item, mapData);
      if (isEmpty(matchLineSupplierDto)) {
        return null;
      }

      if (!scoreDetails) {
        return {
          ...item,
          ...matchLineSupplierDto,
        };
      }

      const scoreDetailCollect = {};
      const NewScoreDetails = scoreDetails.map((scoreItem = {}) => {
        const {
          team = null,
          evaluateExpertId = null,
          sumScore = null,
          sumScoreMeaning = null,
          evaluateScoreId,
        } = scoreItem;
        scoreDetailCollect[`${team}${evaluateExpertId}Score`] = sumScore;
        scoreDetailCollect[`${team}${evaluateExpertId}`] = sumScoreMeaning;
        scoreDetailCollect[`${team}${evaluateExpertId}evaluateScoreId`] = evaluateScoreId;

        return {
          ...scoreItem,
        };
      });

      return {
        ...matchLineSupplierDto,
        ...item,
        ...scoreDetailCollect,
        scoreDetails: NewScoreDetails,
      };
    });

    return {
      newSupplierList: NewSupplierList.filter(Boolean),
    };
  };

  const fetchHeaderInfo = async () => {
    if (!rfxHeaderId || !expertScoreHeadDS) {
      return;
    }

    try {
      let data = await fetchExpertScoreDetails({
        organizationId,
        sourceHeaderId: rfxHeaderId,
        sourceFrom: 'RFX',
      });
      const lineData = await fetchEvaluateSummary({
        organizationId,
        sourceHeaderId: rfxHeaderId,
        sourceFrom: 'RFX',
      });
      data = getResponse(data);
      if (!data) {
        return;
      }

      const { supplierList } = data || {};
      const { newSupplierList } = generateNewTableList(supplierList, lineData);
      expertScoreHeadDS.loadData([data || {}]);
      expertScoreDS.loadData(newSupplierList || []);
    } catch (e) {
      throw e;
    }
  };

  // const fetchTable = async () => {
  //   if (!rfxHeaderId || !expertScoreDS) {
  //     return;
  //   }

  //   try {
  //     let data = await fetchEvaluateSummary({
  //       organizationId,
  //       sourceHeaderId: rfxHeaderId,
  //       sourceFrom: 'RFX',
  //     });
  //     data = getResponse(data);
  //     if (!data) {
  //       return;
  //     }

  //     data = addDataStateForBidSectionList(data);
  //     const { supplierList } = data || {};
  //     expertScoreDS.loadData(supplierList || []);
  //   } catch (e) {
  //     throw e;
  //   }
  // };

  // 整合动态列
  const generateDynamicColumns = (evaluateExpertsColumnsData = []) => {
    const { current } = expertScoreHeadDS;
    if (!Array.isArray(evaluateExpertsColumnsData) || isEmpty(evaluateExpertsColumnsData)) {
      return [];
    }

    const RelativeColumns = evaluateExpertsColumnsData.map((item) => {
      const { evaluateExpertId = null, expertName = null, team = '' } = item || {};
      const scoringDetailProps = {
        // sourceKey,
        displayType: 'text',
        headerData: current,
        fieldData: {
          team,
          expertName,
          evaluateExpertId,
        },
      };
      return {
        title: expertName,
        name: `${team}${evaluateExpertId}`,
        width: 150,
        align: 'right',
        renderer: ({ value, record }) => {
          const { sumPassStatus } = record.get(['sumPassStatus']);

          const onlyShowValue =
            !['ALL_PASS', 'PART_PASS', 'UN_PASS'].includes(sumPassStatus) && isNaN(Number(value));

          return onlyShowValue ? value : renderScoringDetail(scoringDetailProps, record, value);
        },
      };
    });

    return RelativeColumns;
  };

  const renderScoringDetail = (scoringDetailProps = {}, record, val) => {
    const { sumPassStatus } = record.get(['sumPassStatus']);

    return (
      <ScoringDetail
        {...scoringDetailProps}
        recordData={record}
        text={val}
        redFlag={sumPassStatus === 'UN_PASS'}
      />
    );
  };

  // 评分明细动态列 eg: 区分商务技术 - 商务组/技术组; 不区分商务技术
  const scoringDetaiDynamiclColumns = () => {
    const { current } = expertScoreHeadDS || {};
    const { evaluateExperts = {}, firstTeam = null } = current
      ? current.get(['evaluateExperts', 'firstTeam'])
      : {};
    const evaluateExpertsData = toJS(evaluateExperts);

    if (isEmpty(evaluateExpertsData)) {
      return [];
    }

    const { BUSINESS_TECHNOLOGY = [], BUSINESS = [], TECHNOLOGY = [] } = evaluateExpertsData;

    let NoneColumns = generateDynamicColumns(BUSINESS_TECHNOLOGY);
    let BusinessColumns = generateDynamicColumns(BUSINESS);
    let TechnologyColumns = generateDynamicColumns(TECHNOLOGY);

    // 不区分商务技术组
    NoneColumns = !isEmpty(NoneColumns) ? NoneColumns : null;

    // 区分商务技术组
    BusinessColumns = !isEmpty(BusinessColumns)
      ? {
          title: intl.get(`ssrc.inquiryHall.model.inquiryHall.businessTeam`).d('商务组'),
          children: BusinessColumns,
        }
      : null;
    TechnologyColumns = !isEmpty(TechnologyColumns)
      ? {
          title: intl.get(`ssrc.inquiryHall.model.inquiryHall.technologyTeam`).d('技术组'),
          children: TechnologyColumns,
        }
      : null;
    const DiffColumns =
      firstTeam === 'TECHNOLOGY'
        ? [].concat(TechnologyColumns, BusinessColumns)
        : [].concat(BusinessColumns, TechnologyColumns);

    return [].concat(NoneColumns, DiffColumns).filter(Boolean);
  };

  // 报价查询
  const directorQuotationDetail = (record = {}) => {
    const { supplierCompanyId, quotationHeaderId } = record.toData() || {};

    if (!rfxHeaderId || !supplierCompanyId) {
      return;
    }

    const currentAction = bidFlag
      ? intl.get('ssrc.inquiryHall.model.inquiryHall.bidDetail').d('投标详情')
      : intl.get('ssrc.inquiryHall.model.inquiryHall.quotationParticularss').d('报价详情');

    let path = null;
    let searchObj = null;

    searchObj = {
      rfxHeaderId,
      noBackFlag: 1, // openTab 不需要返回
      pageType: 'SUPPLIER_DETAIL_QUERY',
      quotationHeaderId,
      supplierCompanyId,
      switchUrl: 2,
      externalModalFlag: 1,
    };

    // 新报价
    if (newQuotationFlag) {
      searchObj = {
        rfxHeaderId,
        quotationHeaderId,
        supplierCompanyId,
        switchUrl: 2,
        externalModalFlag: 1,
      };

      path = `/pub/ssrc/supplier-reply/query/${quotationHeaderId}`;
      if (bidFlag) {
        path = `/pub/ssrc/bid-supplier-reply/query/${quotationHeaderId}`;
      }
    } else {
      // path = `/pub/ssrc/query-quotation/detail/${rfxHeaderId}/${supplierCompanyId}`;
      path = null; // 老报价查询不支持外部打开
    }

    if (!path) {
      return;
    }

    Modal.open({
      key: QuotationQueryKey,
      title: currentAction,
      style: {
        width: '80%',
      },
      drawer: true,
      closable: true,
      children: (
        <div>
          <EmbedPage
            href={path}
            location={{
              search: `?${querystring.stringify(searchObj)}`,
            }}
          />
        </div>
      ),
      footer: null,
    });
  };

  // 总分
  const fetchScoreDetailOfTotalPoints = async (record = {}) => {
    const evaluateSummaryId = record.get('evaluateSummaryId');
    if (!evaluateSummaryId) {
      return;
    }

    let data = null;
    try {
      data = await fetchScoreDetail({
        organizationId,
        evaluateSummaryId,
      });
      data = getResponse(data);
      if (!data) {
        return;
      }

      setScoreData(data);
    } catch (e) {
      throw e;
    }
  };

  // score
  const openScoreDetailModal = (record) => {
    fetchScoreDetailOfTotalPoints(record);
    setScoreDetailModalVisible(true);
  };

  const cancelScoreDetailModal = () => {
    setScoreData({});
    setScoreDetailModalVisible(false);
  };

  const getTableColumns = () => {
    let columns = [
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierCompanyCode`).d('供应商编码'),
        name: 'supplierCompanyNum',
        width: 140,
        lock: 'left',
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierName`).d('供应商名称'),
        name: 'supplierCompanyName',
        width: 200,
        renderer: ({ value, record }) => {
          const { eliminateFlag } = record.get(['eliminateFlag']);

          return (
            <div style={{ display: 'flex' }}>
              <CPopover content={value}>{value}</CPopover>
              {eliminateFlag === 1 ? (
                <Tag
                  style={{
                    background: '#868D9C',
                    color: 'white',
                    marginLeft: '10px',
                    borderRadius: '5px',
                  }}
                >
                  {intl.get(`ssrc.common.view.status.allEliminate`).d('全部淘汰')}
                </Tag>
              ) : null}
            </div>
          );
        },
      },
      {
        title: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.commonQuotationParticulars`, {
            quotationName,
          })
          .d('{quotationName}详情'),
        name: 'quotationNum',
        hidden: currentUserIsOnlyTechnologyExpertFlag || !newQuotationFlag,
        width: 100,
        renderer: ({ record }) => {
          return (
            <a onClick={() => directorQuotationDetail(record)}>
              {intl
                .get(`ssrc.inquiryHall.model.inquiryHall.commonQuotationParticulars`, {
                  quotationName,
                })
                .d('{quotationName}详情')}
            </a>
          );
        },
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.recommend`).d('推荐'),
        name: 'candidateFlag',
        width: 80,
        renderer: ({ value }) => yesOrNoRender(value),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.candidateReason`).d('推荐理由'),
        name: 'candidateSuggestion',
        width: 280,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.totalScore`).d('总分'),
        name: 'summaryScore',
        width: 120,
        align: 'right',
        renderer: ({ value, record }) => {
          const { summaryScoreMeaning } = record.get(['summaryScoreMeaning']);
          return <a onClick={() => openScoreDetailModal(record)}>{summaryScoreMeaning || value}</a>;
        },
      },
      ...scoringDetaiDynamiclColumns(),
      {
        title: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.commonInvalidQuotation`, { quotationName })
          .d('无效{quotationName}'),
        name: 'invalidFlag',
        width: 100,
        renderer: ({ value }) => {
          return value ? intl.get(`ssrc.inquiryHall.model.inquiryHall.invalid`).d('无效') : '-';
        },
      },
      {
        title: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.commonInvalidQuotationReason`, { quotationName })
          .d('无效{quotationName}原因'),
        name: 'invalidReason',
        width: 180,
      },
    ].filter(Boolean);

    columns = columns.filter(Boolean);
    return columns;
  };

  // 专家评分step,评分明细Modal props
  const scoreDetailProps = {
    scoreDetailList: scoreData,
    scoreDetailModalVisible,
    cancelScoreDetailModal,
  };

  return (
    <div>
      <Table dataSet={expertScoreDS} columns={getTableColumns()} pagination={false} />
      <ScoreDetailModal {...scoreDetailProps} />
    </div>
  );
};

export default observer(ExpertScore);
