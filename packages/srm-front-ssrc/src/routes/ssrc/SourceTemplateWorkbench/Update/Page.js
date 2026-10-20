/* eslint-disable no-unused-expressions */
import React, { useContext, useCallback, useState, useMemo, useEffect } from 'react';
import { Header } from 'components/Page';
import { Spin, Tabs, Tag } from 'choerodon-ui';
import { Tooltip } from 'choerodon-ui/pro';
import { isEmpty, isArray, isNil } from 'lodash';
import { observer } from 'mobx-react';

import intl from 'utils/intl';
import DynamicButtons from '_components/DynamicButtons';
import { getResponse, getCurrentOrganizationId, getCurrentTenant } from 'utils/utils';
import notification from 'utils/notification';

import {
  queryNodes,
  templateSave,
  templateRelease,
  queryDetail,
  definitionQuery,
} from '@/services/sourceTemplateWorkbechService';
import { fetchConfigSheet } from '@/services/inquiryHallService';
import { queryCheckPriceUiDisplayConfig, queryH0OrC7N } from '@/services/commonService';

import Store from './store/index';
import Card from './components/Card';
import styles from '../index.less';
import BaseInfo from './components/BaseInfo';
import SourceCategory from './components/SourceCategory';
import ApproveRuleTab from './components/ApproveRuleTab';
import ReleaseRule from './components/ReleaseRule';
import QuotationRule from './components/QuotationRule';
import AuctionBidRule from './components/AuctionBidRule';
import OpenBidRule from './components/OpenBidRule';
import ScoreRule from './components/ScoreRule';
import BargainRule from './components/BargainRule';
import RoundQuotationRule from './components/RoundQuotationRule';
import CheckPriceRule from './components/CheckPriceRule';
import CheckPriceTab from './components/CheckPriceTab';
// RF组件
import RFApproveRule from './components/RFApproveRule';
import RFReleaseRule from './components/RFReleaseRule';
import RFQuotationRule from './components/RFQuotationRule';
import RFScoreRule from './components/RFScoreRule';
import ChooseSourceNode from './components/ChooseSourceNode';
// import ShowSourceNode from './components/ShowSourceNode';

const { TabPane } = Tabs;

const tagStyle = {
  border: 'none',
  height: '16px',
  lineHeight: '15.5px',
  padding: '0 3px',
  marginRight: '0',
};

const Page = (props) => {
  const {
    history,
    commonDs: {
      baseInfoDs,
      approveRuleDs,
      attachRequirementDs, // 询价全局规则-附件要求DS
      releaseRuleDs,
      quotationRuleDs,
      auctionBidDs,
      openBidDs,
      scoreRuleDs,
      bargainRuleDs,
      roundQuotationRuleDs,
      checkPriceRuleDs,
      winBidRuleDs, // 中标规则DS
      bidAnnouncementRuleDs, // 唱标规则DS

      // RF
      rfApproveRuleDs,
      rfReleaseDs,
      rfQuotationDs,
      rfExpertScoreDs,
    },
    routerParams: { templateId, type },
    getCustomizeUnitCode = () => {},
  } = useContext(Store);

  const [status, setStatus] = useState(type === 'create' ? 'chooseNode' : 'fillInfo');
  const [nodes, setNodes] = useState([]);
  const [serviceChargeFlag, setServiceChargeFlag] = useState(false); // 是否开启费用工作台
  const [checkPriceUiIsNew, setCheckPriceUiIsNew] = useState(false); // 是否启用新核价
  const [activeKey, setActiveKey] = useState('approveRule');
  const [loading, setLoading] = useState(false); // spin的loading
  const [targetField, setTargetField] = useState([]); // 渲染fx
  const [tagStatus, setTagStatus] = useState({}); // tab页标签状态
  const statusTagsMap = useMemo(
    () => ({
      gray: intl.get('ssrc.sourceTemplate.view.message.title.nextStep.default').d('预设'),
      orange: intl.get('ssrc.sourceTemplate.view.message.title.nextStep.uncompleted').d('未完成'),
      green: intl.get('ssrc.sourceTemplate.view.message.title.nextStep.completed').d('完成'),
    }),
    []
  );

  useEffect(() => {
    querySheet();
    queryNewScoreSheetConfig();
    fetchApproveConfig();
    queryFileTemplateManageSheetConfig();
    if (status === 'chooseNode') {
      queryDefinition();
    }
    initNode({}).then(() => {
      if (status === 'fillInfo') {
        initQuery().then(() => {
          queryDefinition();
        });
      }
    });
  }, []);

  // 查询配置表
  const fetchApproveConfig = async () => {
    const res = await queryH0OrC7N();
    if (!isEmpty(res)) {
      const resultApproveObj =
        res.find(
          (item) => item.function === 'NEW_TEMPLATE_RESULT_APPROVE' && item.whiteFlag === '0'
        ) || {}; // 结果审批标识
      approveRuleDs.setState('resultApproveFlag', !isEmpty(resultApproveObj));
    }
  };

  // 过滤node
  const filterNode = (params) => {
    let result = {};
    for (const key in params) {
      if (
        ![
          'approveRuleNode',
          'releaseNode',
          'biddingNode',
          'delayBiddingNode',
          'quotationNode',
          'checkPriceNode',
          'openBidNode',
          'expertScoreNode',
          'preTrialNode',
          'bargainNode',
          'preQualificationNode',
          'signInNode',
          'trialBiddingNode',
          'roundQuotationNode',
          // RF的load
          'rfApproveRuleNode',
          'rfReleaseNode',
          'rfQuotationNode',
          'rfExpertScoreNode',
          'rfConfirmSuppliersNode',
        ].includes(key)
      ) {
        result = {
          ...result,
          [key]: params[key],
        };
      }
    }
    return result;
  };

  // 获取中标规则节点数据
  const getRuleNode = (node, nodeType = '') => {
    let winBidRule = {};
    let checkPriceRule = {};
    let bidAnnouncementRule = {};
    const keys = Object.keys(node);
    for (const key in keys) {
      if (winBidRuleDs.getField(keys[key])) {
        winBidRule = {
          ...winBidRule,
          [keys[key]]: node[keys[key]],
        };
      } else if (bidAnnouncementRuleDs.getField(keys[key])) {
        bidAnnouncementRule = {
          ...bidAnnouncementRule,
          [keys[key]]: node[keys[key]],
        };
      } else {
        checkPriceRule = {
          ...checkPriceRule,
          [keys[key]]: node[keys[key]],
        };
      }
    }

    if (nodeType === 'checkPrice') {
      return checkPriceRule;
    } else if (nodeType === 'bidAnnouncement') {
      return bidAnnouncementRule;
    } else {
      return winBidRule;
    }
  };

  // 设置页面loading
  const setPageLoading = (pageLoading) => {
    if (isNil(pageLoading)) {
      setLoading(!loading);
      return;
    }
    setLoading(pageLoading);
  };

  // 查询
  const initQuery = async (_templateId = '') => {
    let statusMap = {};
    setLoading(true);
    attachRequirementDs.setQueryParameter('templateId', _templateId || templateId);
    const res = await queryDetail({
      templateId: _templateId || templateId,
      requestFrom: 'EDIT', // 值：EDIT/编辑页｜DETAIL/明细页
      query: {
        customizeUnitCode: getCustomizeUnitCode([
          'baseInfo',
          'quotationRule',
          'checkPriceRule',
          'delayedPriceBiddingRule',
          'scoreRule',
          'rfScoreRule',
          'releaseRule',
          'rfApproveRule',
        ]),
      },
    });
    if (getResponse(res)) {
      // 询价招标和征询区分开
      if (['RFI', 'RFP'].includes(res.secondarySourceCategory || res.sourceCategory)) {
        statusMap = {
          ...statusMap,
          RF_APPROVE: res.progressStatus === 'FINALIZED' ? 'green' : 'gray',
          RF_RELEASE: res.progressStatus === 'FINALIZED' ? 'green' : 'gray',
          RF_QUOTATION: res.progressStatus === 'FINALIZED' ? 'green' : 'gray',
          RF_CONFIRM_SUPPLIERS: res.progressStatus === 'FINALIZED' ? 'green' : 'gray',
        };
        baseInfoDs.loadData([filterNode(res)]);
        rfApproveRuleDs.loadData([res?.rfApproveRuleNode]);
        rfReleaseDs.loadData([res?.rfReleaseNode]);
        rfQuotationDs.loadData([res?.rfQuotationNode]);
        if (!isEmpty(res?.rfExpertScoreNode)) {
          rfExpertScoreDs.loadData([res?.rfExpertScoreNode]);
          statusMap = {
            ...statusMap,
            RF_EXPERT_SCORE: res.progressStatus === 'FINALIZED' ? 'green' : 'gray',
          };
        }
      } else {
        statusMap = {
          ...statusMap,
          APPROVE: res.progressStatus === 'FINALIZED' ? 'green' : 'gray',
          RELEASE: res.progressStatus === 'FINALIZED' ? 'green' : 'gray',
          [res.sourceCategory === 'RFA' ? 'BIDDING' : 'QUOTATION']:
            res.progressStatus === 'FINALIZED' ? 'green' : 'gray',
          CHECK_PRICE: res.progressStatus === 'FINALIZED' ? 'green' : 'gray',
          WIN_BID: res.progressStatus === 'FINALIZED' ? 'green' : 'gray',
          BID_ANNOUNCEMENT: res.progressStatus === 'FINALIZED' ? 'green' : 'gray',
        };
        baseInfoDs.loadData([filterNode(res)]);
        approveRuleDs.loadData([res?.approveRuleNode]);
        ((templateId && templateId !== 'null') || (_templateId && _templateId !== 'null')) &&
        attachRequirementDs?.getState('fileTemplateManageFlag') === 1
          ? attachRequirementDs.query()
          : '';
        releaseRuleDs.loadData([res?.releaseNode]);
        quotationRuleDs.loadData([
          res.sourceCategory === 'RFA' ? res?.biddingNode : res?.quotationNode,
        ]);
        if (!isEmpty(res?.delayBiddingNode)) {
          auctionBidDs.loadData([res?.delayBiddingNode]);
          statusMap = {
            ...statusMap,
            DELAY_BIDDING: res.progressStatus === 'FINALIZED' ? 'green' : 'gray',
          };
        }
        const checkPrice = getRuleNode(res?.checkPriceNode, 'checkPrice');
        checkPriceRuleDs.loadData([checkPrice]);
        const winBidNode = getRuleNode(res?.checkPriceNode);
        winBidRuleDs.loadData([winBidNode]); // 中标规则
        const bidAnnouncementNode = getRuleNode(res?.checkPriceNode, 'bidAnnouncement');
        bidAnnouncementRuleDs.loadData([bidAnnouncementNode]);
        if (!isEmpty(res?.delayBiddingNode)) {
          auctionBidDs.loadData([res?.delayBiddingNode]);
          statusMap = {
            ...statusMap,
            DELAY_BIDDING: res.progressStatus === 'FINALIZED' ? 'green' : 'gray',
          };
        }
        if (!isEmpty(res?.openBidNode)) {
          openBidDs.loadData([res?.openBidNode]);
          statusMap = {
            ...statusMap,
            OPEN_BID: res.progressStatus === 'FINALIZED' ? 'green' : 'gray',
          };
        }
        if (!isEmpty(res?.expertScoreNode)) {
          scoreRuleDs.loadData([res?.expertScoreNode]);
          statusMap = {
            ...statusMap,
            EXPERT_SCORE: res.progressStatus === 'FINALIZED' ? 'green' : 'gray',
          };
        }
        if (!isEmpty(res?.roundQuotationNode)) {
          roundQuotationRuleDs.loadData([res?.roundQuotationNode]);
          statusMap = {
            ...statusMap,
            ROUND_QUOTATION: res.progressStatus === 'FINALIZED' ? 'green' : 'gray',
          };
        }
        if (!isEmpty(res?.bargainNode)) {
          bargainRuleDs.loadData([res?.bargainNode]);
          statusMap = {
            ...statusMap,
            BARGAIN: res.progressStatus === 'FINALIZED' ? 'green' : 'gray',
          };
        }
      }
      setTagStatus(statusMap);
    }
    setLoading(false);
    return getResponse(res);
  };

  // 查询配置表是否开启费用工作台
  const querySheet = async () => {
    const res = getResponse(
      await fetchConfigSheet({
        organizationId: getCurrentOrganizationId(),
        configCode: 'ssrc_expenses_online_payment_blacklist',
        data: {
          tenantNum: getCurrentTenant().tenantNum,
        },
      })
    );
    const result = getResponse(await queryCheckPriceUiDisplayConfig());
    if (result) {
      checkPriceRuleDs.setState('checkPriceUiIsNew', !isEmpty(result));
      approveRuleDs.setState('checkPriceUiIsNew', !isEmpty(result));
      setCheckPriceUiIsNew(!isEmpty(result));
    }
    if (!(!isEmpty(res) && isArray(res) && res[0].id)) {
      quotationRuleDs.setState('serviceChargeFlag', true);
      setServiceChargeFlag(true);
    }
  };

  // 查询新分值法配置表
  const queryNewScoreSheetConfig = async () => {
    let data = null;

    try {
      data = await fetchConfigSheet({
        configCode: 'ssrc_new_score_type_config',
        organizationId: getCurrentOrganizationId(),
        data: {
          tenant: getCurrentTenant().tenantNum,
        },
      });
      data = getResponse(data);
      if (isEmpty(data)) {
        // 设置默认值为新分值法
        scoreRuleDs?.current?.set('templateScoreType', 'SCORE_NEW');
        scoreRuleDs?.setState('newScoreFlag', true);
        // 征询 设置默认值为新分值法
        rfExpertScoreDs?.current?.set('scoreType', 'SCORE_NEW');
        rfExpertScoreDs?.setState('newScoreFlag', true);
      }
    } catch (e) {
      throw e;
    }
  };

  // 查询招标文件模板管理配置
  const queryFileTemplateManageSheetConfig = async () => {
    let data = null;
    try {
      data = await fetchConfigSheet({
        configCode: 'ssrc_file_template_cnf',
        organizationId: getCurrentOrganizationId(),
        data: {
          tenantNum: getCurrentTenant().tenantNum,
        },
      });
      data = getResponse(data);
      if (!isEmpty(data)) {
        // 黑名单
        attachRequirementDs?.setState('fileTemplateManageFlag', 0);
      } else {
        attachRequirementDs?.setState('fileTemplateManageFlag', 1);
      }
    } catch (e) {
      throw e;
    }
  };

  // 查询业务规则定义
  const queryDefinition = async () => {
    const sourceCategory =
      baseInfoDs?.current?.get('secondarySourceCategory') ||
      baseInfoDs?.current?.get('sourceCategory');
    const res = await definitionQuery({
      fullPathCode: ['RFI', 'RFP'].includes(sourceCategory)
        ? 'SSRC.RF_TEMPLSTE_DEFINE_V2'
        : 'SSRC.SOURCE_TEMPLATE_DEFINE_V2',
      metaBusinessKey: sourceCategory,
    });
    if (getResponse(res)) {
      setTargetField(res);
    }
  };

  // 初始化节点
  const initNode = async ({ sourceCategory = 'RFQ', biddingMode = undefined }) => {
    setLoading(true);
    const res = await queryNodes({
      sourceCategory: templateId === 'null' ? sourceCategory : undefined,
      templateId: templateId === 'null' ? undefined : templateId,
      biddingMode,
    });
    if (getResponse(res)) {
      setNodes(res);
    }
    setLoading(false);
  };

  // 寻源类别改变
  const handleChange = useCallback(
    (value) => {
      if (value) {
        initNode({ sourceCategory: value, biddingMode: value === 'RFA' ? getBiddingMode() : null });
        queryDefinition();
      }
      if (
        value &&
        value === 'RFA' &&
        ['OFFLINE', 'ON_OFF'].includes(quotationRuleDs?.current?.get('quotationType'))
      ) {
        quotationRuleDs?.current?.set('quotationType', undefined);
      }
      baseInfoDs?.current?.set('sourceCategory', value);
    },
    [initNode, queryDefinition, quotationRuleDs?.current]
  );

  /**
   * 竞价模式
   */
  const changeBiddingMode = useCallback(
    (value) => {
      initNode({ biddingMode: value, sourceCategory: 'RFA' });
      queryDefinition();

      // const { current: baseInfoCurrent, } = baseInfoDs || {};
      const { current: quotationRuleCurrent } = quotationRuleDs || {};

      if (value === 'JAPANESE_BIDDING' || value === 'DUTCH_BIDDING') {
        quotationRuleCurrent?.set({
          'biddingTarget': 'TOTAL_PRICE',
          biddingAllowAdjustTimeFlag: 0,
        });
        releaseRuleDs?.current?.set('sourceMethod', 'INVITE');
      }

      if (value === 'JAPANESE_BIDDING') {
        quotationRuleCurrent?.set({
          biddingEndType: [
            'TO_MIN_SUPPLER_NUMBER',
            'TO_TARGET_PRICE',
            'NO_SUPPLIER_QUOTED',
          ],
      });
      }

      if (value === 'DUTCH_BIDDING') {
        quotationRuleCurrent?.set('biddingEndType', ['TO_TARGET_PRICE', 'ANY_SUPPLIER_QUOTED']);
      }
    },
    [initNode, queryDefinition]
  );

  // sourceCategory
  const getBiddingFlag = useCallback(() => {
    return baseInfoDs?.current?.get('sourceCategory') === 'RFA';
  }, [baseInfoDs]);

  // biddingMode
  const getBiddingMode = useCallback(() => {
    const { current } = baseInfoDs || {};

    const { biddingMode } = current ? current.get(['biddingMode']) : {};

    return biddingMode;
  }, [baseInfoDs]);

  const japanBiddingFlag = () => {
    const biddingMode = getBiddingMode();

    const flag = biddingMode === 'JAPANESE_BIDDING' && getBiddingFlag();
    return flag;
  };

  // JAPANESE_BIDDING or DUTCH_BIDDING 日式/荷兰
  const japOrDutchBidding = () => {
    const biddingMode = getBiddingMode();

    const flag =
      (biddingMode === 'JAPANESE_BIDDING' || biddingMode === 'DUTCH_BIDDING') && getBiddingFlag();
    return flag;
  };

  // BRITISH_BIDDING
  const britishBidding = () => {
    const biddingMode = getBiddingMode();

    const flag = biddingMode === 'BRITISH_BIDDING' && getBiddingFlag();
    return flag;
  };

  // 上一步下一步
  const handleStep = useCallback((params = 'nextStep') => {
    if (params === 'nextStep') {
      setStatus('fillInfo');
    } else {
      setStatus('chooseNode');
    }
  }, []);

  // 清空根据节点隐藏内容
  const clearNodeContent = () => {
    if (!isShowNodeCard('EXPERT_SCORE')) {
      approveRuleDs?.current?.set('preApproveType', undefined);
    }
    if (!isShowNodeCard('BARGAIN')) {
      approveRuleDs?.current?.set('bargainApproveMethod', undefined);
    }
    if (baseInfoDs?.current?.get('sourceCategory') !== 'RFA') {
      quotationRuleDs?.current?.set({
        biddingQuotationMethod: undefined,
        biddingMode: undefined,
        biddingTarget: undefined,
        biddingQuotationOrder: undefined,
        biddingStrategy: undefined,
        openRule: undefined,
        auctionRule: undefined,
        rankRule: undefined,
        // autoDeferFlag: undefined,
        // autoDeferPeriod: undefined,
        // autoDeferType: undefined,
        // autoDeferTimeRule: undefined,
        // autoDeferDuration: undefined,
        // maxDeferCount: undefined,
        biddingAllowedQuotationCount: undefined,
        biddingAnonymousQuotesFlag: undefined,
      });
    }
    if (baseInfoDs?.current?.get('sourceCategory') === 'RFA') {
      quotationRuleDs?.current?.set({
        auctionDirection: undefined,
        continuousQuotationFlag: undefined,
        multiCurrencyFlag: undefined,
        diyLadderQuotationFlag: undefined,
        detailPriceControlRule: undefined,
        quotationScope: undefined,
      });
    }
    if (!isShowNodeCard('OPEN_BID')) {
      scoreRuleDs?.current?.set('scoreIndicFlag', undefined);
    }
    if (!checkPriceUiIsNew) {
      checkPriceRuleDs?.current?.set({
        checkRecommendationStrategy: undefined,
      });
    }
    if (checkPriceUiIsNew) {
      checkPriceRuleDs?.current?.set({
        selectionStrategy: undefined,
      });
    }
  };

  // 校验tag标签
  const validateTag = () => {
    const sourceCategory =
      baseInfoDs?.current?.get('secondarySourceCategory') ||
      baseInfoDs?.current?.get('sourceCategory');
    let statusMap = {};
    // 将征询和询价校验tag区分
    if (['RFI', 'RFP'].includes(sourceCategory)) {
      statusMap = {
        RF_APPROVE: rfApproveRuleDs.getValidationErrors()?.length ? 'orange' : 'green',
        RF_RELEASE: rfReleaseDs.getValidationErrors()?.length ? 'orange' : 'green',
        RF_QUOTATION: rfQuotationDs.getValidationErrors()?.length ? 'orange' : 'green',
      };
      nodes.forEach((node) => {
        if (node.checkFlag) {
          switch (node.value) {
            case 'RF_EXPERT_SCORE':
              statusMap = {
                ...statusMap,
                RF_EXPERT_SCORE: rfExpertScoreDs.getValidationErrors()?.length ? 'orange' : 'green',
              };
              break;
            default:
              break;
          }
        }
      });
    } else {
      statusMap = {
        APPROVE: approveRuleDs.getValidationErrors()?.length ? 'orange' : 'green',
        RELEASE: releaseRuleDs.getValidationErrors()?.length ? 'orange' : 'green',
        [baseInfoDs?.current?.get('sourceCategory') === 'RFA'
          ? 'BIDDING'
          : 'QUOTATION']: quotationRuleDs.getValidationErrors()?.length ? 'orange' : 'green',
        CHECK_PRICE: checkPriceRuleDs.getValidationErrors()?.length ? 'orange' : 'green',
        WIN_BID: winBidRuleDs.getValidationErrors()?.length ? 'orange' : 'green',
        BID_ANNOUNCEMENT: bidAnnouncementRuleDs.getValidationErrors()?.length ? 'orange' : 'green',
      };
      nodes.forEach((node) => {
        if (node.checkFlag) {
          switch (node.value) {
            case 'DELAY_BIDDING':
              statusMap = {
                ...statusMap,
                DELAY_BIDDING: auctionBidDs.getValidationErrors()?.length ? 'orange' : 'green',
              };
              break;
            case 'OPEN_BID':
              statusMap = {
                ...statusMap,
                OPEN_BID: openBidDs.getValidationErrors()?.length ? 'orange' : 'green',
              };
              break;
            case 'EXPERT_SCORE':
              statusMap = {
                ...statusMap,
                EXPERT_SCORE: scoreRuleDs.getValidationErrors()?.length ? 'orange' : 'green',
              };
              break;
            case 'ROUND_QUOTATION':
              statusMap = {
                ...statusMap,
                ROUND_QUOTATION: roundQuotationRuleDs.getValidationErrors()?.length
                  ? 'orange'
                  : 'green',
              };
              break;
            case 'BARGAIN':
              statusMap = {
                ...statusMap,
                BARGAIN: bargainRuleDs.getValidationErrors()?.length ? 'orange' : 'green',
              };
              break;
            default:
              break;
          }
        }
      });
    }

    // 找到对象的key
    const key = Object.keys(statusMap).find((item) => statusMap[item] === 'orange');
    // 将tab定位到必填没填的位置
    switch (key) {
      case 'APPROVE':
        setActiveKey('approveRule');
        break;
      case 'RELEASE':
        setActiveKey('releaseRule');
        break;
      case 'BIDDING':
      case 'QUOTATION':
        setActiveKey('quotationRule');
        break;
      case 'DELAY_BIDDING':
        setActiveKey('auctionBidRule');
        break;
      case 'OPEN_BID':
        setActiveKey('openBidRule');
        break;
      case 'EXPERT_SCORE':
        setActiveKey('scoreRule');
        break;
      case 'ROUND_QUOTATION':
        setActiveKey('roundQuotationRule');
        break;
      case 'BARGAIN':
        setActiveKey('bargainRule');
        break;
      case 'CHECK_PRICE':
      case 'WIN_BID':
      case 'BID_ANNOUNCEMENT':
        setActiveKey('checkPriceRule');
        break;

      // RF定位
      case 'RF_APPROVE':
        setActiveKey('approveRule');
        break;
      case 'RF_RELEASE':
        setActiveKey('rfReleaseRule');
        break;
      case 'RF_QUOTATION':
        setActiveKey('rfQuotationRule');
        break;
      case 'RF_EXPERT_SCORE':
        setActiveKey('rfScoreRule');
        break;
      default:
        break;
    }
    setTagStatus(statusMap);
  };

  // 必输校验
  const validateForm = () => {
    const list = [];
    const sourceCategory =
      baseInfoDs?.current?.get('secondarySourceCategory') ||
      baseInfoDs?.current?.get('sourceCategory');
    list.push(baseInfoDs.validate());
    // 将征询询价必输校验区分
    if (['RFI', 'RFP'].includes(sourceCategory)) {
      list.push(rfApproveRuleDs.validate());
      list.push(rfReleaseDs.validate());
      list.push(rfQuotationDs.validate());
      nodes.forEach((node) => {
        if (node.checkFlag) {
          switch (node.value) {
            case 'RF_EXPERT_SCORE':
              list.push(rfExpertScoreDs.validate());
              break;
            default:
              break;
          }
        }
      });
    } else {
      list.push(approveRuleDs.validate());
      list.push(releaseRuleDs.validate());
      list.push(quotationRuleDs.validate());
      list.push(checkPriceRuleDs.validate());
      list.push(winBidRuleDs.validate()); // 中标规则校验
      list.push(bidAnnouncementRuleDs.validate()); // 唱标规则校验
      if (attachRequirementDs.getState('fileTemplateManageFlag')) {
        list.push(attachRequirementDs.validate());
      }
      list.push(openBidDs.validate());
      nodes.forEach((node) => {
        if (node.checkFlag) {
          switch (node.value) {
            case 'DELAY_BIDDING':
              list.push(auctionBidDs.validate());
              break;
            case 'OPEN_BID':
              list.push(openBidDs.validate());
              break;
            case 'EXPERT_SCORE':
              list.push(scoreRuleDs.validate());
              break;
            case 'BARGAIN':
              list.push(bargainRuleDs.validate());
              break;
            case 'ROUND_QUOTATION':
              list.push(roundQuotationRuleDs.validate());
              break;
            default:
              break;
          }
        }
      });
    }
    return Promise.all(list).then((res) => res.every((ele) => ele));
  };

  // 获取完整数据
  const getData = () => {
    let params = {};
    const sourceCategory =
      baseInfoDs?.current?.get('secondarySourceCategory') ||
      baseInfoDs?.current?.get('sourceCategory');
    if (['RFI', 'RFP'].includes(sourceCategory)) {
      params = {
        ...baseInfoDs?.current?.toData(),
        sourceNodeInfo: nodes
          ?.filter((node) => node.checkFlag)
          ?.map((node) => node.value)
          ?.join(','),
        rfApproveRuleNode: rfApproveRuleDs?.current?.toData(),
        rfReleaseNode: rfReleaseDs?.current?.toData(),
        rfQuotationNode: rfQuotationDs?.current?.toData(),
      };
      nodes.forEach((node) => {
        if (node.checkFlag) {
          switch (node.value) {
            case 'RF_EXPERT_SCORE':
              params = {
                ...params,
                rfExpertScoreNode: rfExpertScoreDs?.current?.toData(),
              };
              break;
            default:
              break;
          }
        }
      });
    } else {
      clearNodeContent();
      params = {
        ...baseInfoDs?.current?.toData(),
        sourceNodeInfo: nodes
          ?.filter((node) => node.checkFlag)
          ?.map((node) => node.value)
          ?.join(','),
        approveRuleNode: approveRuleDs?.current?.toData(),
        templateAttachmentLineList:
          attachRequirementDs?.getState('fileTemplateManageFlag') === 1
            ? attachRequirementDs?.toData()
            : [],
        releaseNode: releaseRuleDs?.current?.toData(),
        [baseInfoDs?.current?.get('sourceCategory') === 'RFA'
          ? 'biddingNode'
          : 'quotationNode']: quotationRuleDs?.current?.toData(),
        checkPriceNode: {
          ...checkPriceRuleDs?.current?.toData(),
          ...winBidRuleDs?.current?.toData(),
          ...bidAnnouncementRuleDs?.current?.toData(),
        },
        query: {
          customizeUnitCode: getCustomizeUnitCode([
            'baseInfo',
            'quotationRule',
            'checkPriceRule',
            'delayedPriceBiddingRule',
            'scoreRule',
            'rfScoreRule',
            'releaseRule',
            'rfApproveRule',
            'attachmentRequirements',
          ]),
        },
      };
      nodes.forEach((node) => {
        if (node.checkFlag) {
          switch (node.value) {
            case 'DELAY_BIDDING':
              params = {
                ...params,
                delayBiddingNode: auctionBidDs?.current?.toData(),
              };
              break;
            case 'OPEN_BID':
              params = {
                ...params,
                openBidNode: openBidDs?.current?.toData(),
              };
              break;
            case 'EXPERT_SCORE':
              params = {
                ...params,
                expertScoreNode: scoreRuleDs?.current?.toData(),
              };
              break;
            case 'BARGAIN':
              params = {
                ...params,
                bargainNode: bargainRuleDs?.current?.toData(),
              };
              break;
            case 'ROUND_QUOTATION':
              params = {
                ...params,
                roundQuotationNode: roundQuotationRuleDs?.current?.toData(),
              };
              break;
            default:
              break;
          }
        }
      });
    }
    return params;
  };

  // 保存
  const handleSave = async () => {
    const flag = await validateForm();
    validateTag();
    if (!flag) {
      notification.warning({
        message: intl.get('ssrc.sourceTemplate.view.message.title.filler').d('请填写完整相关信息'),
      });
      return;
    }
    setLoading(true);
    const params = getData();
    const res = await templateSave(params);
    if (getResponse(res)) {
      notification.success();
      if (type === 'create') {
        history.push({
          pathname: `/ssrc/source-template-workbench/update/edit/${res.templateId}`,
        });
        await initQuery(res.templateId);
        queryDefinition();
      } else {
        await initQuery();
      }
    }
    setLoading(false);
  };

  // 发布
  const handleRelease = async () => {
    const flag = await validateForm();
    validateTag();
    if (!flag) {
      notification.warning({
        message: intl.get('ssrc.sourceTemplate.view.message.title.filler').d('请填写完整相关信息'),
      });
      return;
    }
    setLoading(true);
    const params = getData();
    const res = await templateRelease(params);
    if (getResponse(res)) {
      notification.success();
      history.push({
        pathname: '/ssrc/source-template-workbench/list',
      });
    }
    setLoading(false);
  };

  // 按钮组
  const getButtons = useCallback(() => {
    return [
      {
        name: 'nextStep',
        btnType: 'c7n-pro',
        child: intl.get('ssrc.sourceTemplate.view.message.title.nextStep').d('下一步'),
        btnProps: {
          icon: 'arrow_forward',
          hidden: status === 'fillInfo',
          color: 'primary',
          onClick: () => handleStep('nextStep'),
        },
      },
      {
        name: 'publish',
        btnType: 'c7n-pro',
        child: intl.get('hzero.common.button.release').d('发布'),
        btnProps: {
          icon: 'near_me',
          color: 'primary',
          hidden: status === 'chooseNode',
          loading,
          waitType: 'throttle',
          onClick: handleRelease,
        },
      },
      {
        name: 'save',
        btnType: 'c7n-pro',
        child: intl.get('hzero.common.button.save').d('保存'),
        btnProps: {
          icon: 'save',
          hidden: status === 'chooseNode',
          onClick: handleSave,
          funcType: 'flat',
          loading,
          waitType: 'throttle',
        },
      },
      {
        name: 'topStep',
        btnType: 'c7n-pro',
        child: intl.get('ssrc.sourceTemplate.view.message.title.topStep').d('上一步'),
        btnProps: {
          funcType: 'flat',
          icon: 'arrow_back',
          hidden: status === 'chooseNode',
          onClick: () => handleStep('topStep'),
        },
      },
    ];
  }, [status, loading]);

  // 节点的开关
  const handleChangeSwitch = useCallback(
    (node = {}) => {
      const data = nodes.map((item) => {
        // 专家和初审节点互斥
        if (node.value === 'EXPERT_SCORE' && item.value === 'PRE_TRIAL') {
          if (!node.checkFlag) {
            return {
              ...item,
              editFlag: 0,
              checkFlag: 0,
            };
          } else {
            return {
              ...item,
              editFlag: 1,
            };
          }
        }
        // 专家和初审节点互斥
        if (node.value === 'PRE_TRIAL' && item.value === 'EXPERT_SCORE') {
          if (!node.checkFlag) {
            return {
              ...item,
              editFlag: 0,
              checkFlag: 0,
            };
          } else {
            return {
              ...item,
              editFlag: 1,
            };
          }
        }
        if (item.value === node.value) {
          return {
            ...item,
            checkFlag: !node.checkFlag,
          };
        }
        return item;
      });
      setNodes(data);
    },
    [nodes]
  );

  useEffect(() => {
    // 有专家评分节点时
    if (nodes.find((item) => item.value === 'EXPERT_SCORE' && item.checkFlag)) {
      checkPriceRuleDs.setState('scoreFlag', true);
      approveRuleDs.setState('scoreFlag', true);
      if (['SCORE', 'ALL'].includes(bargainRuleDs?.current?.get('bargainRule'))) {
        bargainRuleDs?.current?.set('bargainRule', undefined);
      }
      if (
        ['SCORE', 'AUTO_SCORE'].includes(roundQuotationRuleDs?.current?.get('roundQuotationRule'))
      ) {
        roundQuotationRuleDs?.current?.set('roundQuotationRule', undefined);
      }
    } else {
      checkPriceRuleDs.setState('scoreFlag', false);
      if (checkPriceUiIsNew) {
        checkPriceRuleDs?.current?.set('checkRecommendationStrategy', 'PRICE');
      }
      approveRuleDs.setState('scoreFlag', false);
      if (['SCORE', 'ALL'].includes(bargainRuleDs?.current?.get('bargainRule'))) {
        bargainRuleDs?.current?.set('bargainRule', undefined);
      }
      if (
        ['SCORE', 'AUTO_SCORE'].includes(roundQuotationRuleDs?.current?.get('roundQuotationRule'))
      ) {
        roundQuotationRuleDs?.current?.set('roundQuotationRule', undefined);
      }
      if (winBidRuleDs?.current?.get('expertVisibleType')) {
        winBidRuleDs?.current?.set('expertVisibleType', undefined);
      }
    }
    // 有议价节点时
    if (nodes.find((item) => item.value === 'BARGAIN' && item.checkFlag)) {
      approveRuleDs.setState('bargainFlag', true);
    } else {
      approveRuleDs.setState('bargainFlag', false);
    }
    // 有开标节点时
    if (nodes.find((item) => item.value === 'OPEN_BID' && item.checkFlag)) {
      quotationRuleDs.setState('openBidFlag', true);
      quotationRuleDs?.current?.set('sealedQuotationFlag', 1);
      scoreRuleDs.setState('openBidFlag', true);
    } else {
      quotationRuleDs.setState('openBidFlag', false);
      quotationRuleDs?.current?.set('sealedQuotationFlag', 0);
      scoreRuleDs.setState('openBidFlag', false);
      scoreRuleDs?.current?.set('noneExpertFlag', 0);
      scoreRuleDs?.current?.set('noneIndicateFlag', 0);
    }

    // 存在延时节点时
    if (nodes.find((item) => item.value === 'DELAY_BIDDING' && item.checkFlag)) {
      if (quotationRuleDs?.current?.get('biddingQuotationOrder') === 'SEQUENCE') {
        quotationRuleDs?.current?.set('biddingQuotationOrder', undefined);
      }
    }
  }, [nodes, checkPriceRuleDs, approveRuleDs, quotationRuleDs, scoreRuleDs, winBidRuleDs]);

  // 展示选中的节点
  // const showNodes = useMemo(() => {
  //   return nodes.filter((item) => item.checkFlag);
  // }, [nodes]);

  // 判断是否展示卡片
  const isShowNodeCard = (value) => {
    const showNode = nodes.filter((item) => item.checkFlag);
    return !!showNode.find((item) => item.value === value);
  };

  // 全局规则属性
  const approveProps = useMemo(() => {
    const {
      match: {
        params: { templateId: _templateId },
      },
    } = props;
    return {
      targetField,
      scoreFlag: isShowNodeCard('EXPERT_SCORE'),
      bargainFlag: isShowNodeCard('BARGAIN'),
      initQuery,
      templateId: _templateId,
      setPageLoading,
    };
  }, [targetField, nodes, initQuery, isShowNodeCard, props.match, setPageLoading]);

  // rf全局规则属性
  const rfApproveProps = useMemo(() => {
    const {
      match: {
        params: { templateId: _templateId },
      },
    } = props;
    return {
      targetField,
      initQuery,
      templateId: _templateId,
    };
  }, [targetField, nodes, initQuery, props.match]);

  // 渲染标题
  const Title = useCallback(() => {
    const {
      match: {
        params: { type: _type },
      },
    } = props;
    return _type === 'create'
      ? intl.get('ssrc.sourceTemplate.view.message.title.createSourceTemplate').d('新建寻源模板')
      : intl.get('ssrc.sourceTemplate.view.message.title.sourceTmpEdit').d('编辑寻源模板');
  }, [props.match]);

  // 渲染面板的规则
  const getTabRuleConfig = useCallback(() => {
    const data = [];
    // 判断是否是RF单据
    const rfFlag = ['RFI', 'RFP'].includes(
      baseInfoDs?.current?.get('secondarySourceCategory') ||
        baseInfoDs?.current?.get('sourceCategory')
    );
    if (rfFlag) {
      data.push({
        value: 'RF_APPROVE',
        key: 'approveRule',
        title: intl.get('ssrc.sourceTemplate.view.message.title.approveRule').d('全局规则'),
        component: <RFApproveRule {...rfApproveProps} />,
        disabled: false,
      });
      nodes.forEach((node) => {
        switch (node.value) {
          case 'RF_RELEASE':
            if (node.checkFlag) {
              data.push({
                value: node.value,
                key: 'rfReleaseRule',
                title: intl
                  .get('ssrc.sourceTemplate.view.message.title.commonRule', {
                    ruleType: node.meaning,
                  })
                  .d('{ruleType}规则'),
                component: <RFReleaseRule />,
                disabled: !node.clickableFlag,
              });
            }
            break;
          case 'RF_QUOTATION':
            if (node.checkFlag) {
              data.push({
                value: node.value,
                key: 'rfQuotationRule',
                title: intl.get('ssrc.sourceTemplate.view.message.title.replyRule').d('回复规则'),
                component: <RFQuotationRule />,
                disabled: !node.clickableFlag,
              });
            }
            break;
          case 'RF_EXPERT_SCORE':
            if (node.checkFlag) {
              data.push({
                value: node.value,
                key: 'rfScoreRule',
                title: intl
                  .get('ssrc.sourceTemplate.view.message.title.commonRule', {
                    ruleType: node.meaning,
                  })
                  .d('{ruleType}规则'),
                component: <RFScoreRule />,
                disabled: !node.clickableFlag,
              });
            }
            break;
          case 'RF_CONFIRM_SUPPLIERS':
            if (node.checkFlag) {
              data.push({
                value: node.value,
                key: 'rfCheckPriceRule',
                title: intl
                  .get('ssrc.sourceTemplate.view.message.title.commonRule', {
                    ruleType: node.meaning,
                  })
                  .d('{ruleType}规则'),
                component: null,
                disabled: !node.clickableFlag,
              });
            }
            break;
          default:
            break;
        }
      });
    } else {
      data.push({
        value: 'APPROVE',
        key: 'approveRule',
        title: intl.get('ssrc.sourceTemplate.view.message.title.approveRule').d('全局规则'),
        component: <ApproveRuleTab {...approveProps} />,
        disabled: false,
        hasSecondLevel: true,
      });
      nodes.forEach((node) => {
        switch (node.value) {
          case 'RELEASE':
            if (node.checkFlag) {
              data.push({
                value: node.value,
                key: 'releaseRule',
                title: intl
                  .get('ssrc.sourceTemplate.view.message.title.commonRule', {
                    ruleType: node.meaning,
                  })
                  .d('{ruleType}规则'),
                component: <ReleaseRule />,
                disabled: !node.clickableFlag,
              });
            }
            break;
          case 'PREQUALIFICATION':
            if (node.checkFlag) {
              data.push({
                value: node.value,
                key: 'prequalificationRule',
                title: intl
                  .get('ssrc.sourceTemplate.view.message.title.commonRule', {
                    ruleType: node.meaning,
                  })
                  .d('{ruleType}规则'),
                component: null,
                disabled: !node.clickableFlag,
              });
            }
            break;
          case 'SIGN_IN':
            if (node.checkFlag) {
              data.push({
                value: node.value,
                key: 'signRule',
                title: intl
                  .get('ssrc.sourceTemplate.view.message.title.commonRule', {
                    ruleType: node.meaning,
                  })
                  .d('{ruleType}规则'),
                component: null,
                disabled: !node.clickableFlag,
              });
            }
            break;
          case 'TRIAL_BIDDING':
            if (node.checkFlag) {
              data.push({
                value: node.value,
                key: 'trialBiddingRule',
                title: intl
                  .get('ssrc.sourceTemplate.view.message.title.commonRule', {
                    ruleType: node.meaning,
                  })
                  .d('{ruleType}规则'),
                component: null,
                disabled: !node.clickableFlag,
              });
            }
            break;
          case 'BIDDING':
          case 'QUOTATION':
            if (node.checkFlag) {
              data.push({
                value: node.value,
                key: 'quotationRule',
                title: intl
                  .get('ssrc.sourceTemplate.view.message.title.commonRule', {
                    ruleType:
                      (baseInfoDs?.current?.get('secondarySourceCategory') ||
                        baseInfoDs?.current?.get('sourceCategory')) === 'NEW_BID'
                        ? intl.get('ssrc.common.model.common.tender').d('投标')
                        : node.meaning,
                  })
                  .d('{ruleType}规则'),
                component: (
                  <QuotationRule
                    serviceChargeFlag={serviceChargeFlag}
                    openBidFlag={isShowNodeCard('OPEN_BID')}
                    delayBidFlag={isShowNodeCard('DELAY_BIDDING')}
                    nodeValue={node.value}
                    britishBidding={britishBidding}
                    japOrDutchBidding={japOrDutchBidding}
                    japanBiddingFlag={japanBiddingFlag}
                  />
                ),
                disabled: !node.clickableFlag,
              });
            }
            break;
          case 'DELAY_BIDDING':
            if (node.checkFlag) {
              data.push({
                value: node.value,
                key: 'auctionBidRule',
                title: intl
                  .get('ssrc.sourceTemplate.view.message.title.commonRule', {
                    ruleType: node.meaning,
                  })
                  .d('{ruleType}规则'),
                component: <AuctionBidRule />,
                disabled: !node.clickableFlag,
              });
            }
            break;
          case 'OPEN_BID':
            if (node.checkFlag) {
              data.push({
                value: node.value,
                key: 'openBidRule',
                title: intl
                  .get('ssrc.sourceTemplate.view.message.title.commonRule', {
                    ruleType: node.meaning,
                  })
                  .d('{ruleType}规则'),
                component: <OpenBidRule />,
                disabled: !node.clickableFlag,
              });
            }
            break;
          case 'EXPERT_SCORE':
            if (node.checkFlag) {
              data.push({
                value: node.value,
                key: 'scoreRule',
                title: intl
                  .get('ssrc.sourceTemplate.view.message.title.commonRule', {
                    ruleType: node.meaning,
                  })
                  .d('{ruleType}规则'),
                component: <ScoreRule openBidFlag={isShowNodeCard('OPEN_BID')} />,
                disabled: !node.clickableFlag,
              });
            }
            break;
          case 'PRE_TRIAL':
            if (node.checkFlag) {
              data.push({
                value: node.value,
                key: 'scoreRule',
                title: intl
                  .get('ssrc.sourceTemplate.view.message.title.commonRule', {
                    ruleType: node.meaning,
                  })
                  .d('{ruleType}规则'),
                component: null,
                disabled: !node.clickableFlag,
              });
            }
            break;
          case 'ROUND_QUOTATION':
            if (node.checkFlag) {
              data.push({
                value: node.value,
                key: 'roundQuotationRule',
                title: intl
                  .get('ssrc.sourceTemplate.view.message.title.commonRule', {
                    ruleType: node.meaning,
                  })
                  .d('{ruleType}规则'),
                component: <RoundQuotationRule scoreFlag={isShowNodeCard('EXPERT_SCORE')} />,
                disabled: !node.clickableFlag,
              });
            }
            break;
          case 'BARGAIN':
            if (node.checkFlag) {
              data.push({
                value: node.value,
                key: 'bargainRule',
                title: intl
                  .get('ssrc.sourceTemplate.view.message.title.commonRule', {
                    ruleType: node.meaning,
                  })
                  .d('{ruleType}规则'),
                component: <BargainRule scoreFlag={isShowNodeCard('EXPERT_SCORE')} />,
                disabled: !node.clickableFlag,
              });
            }
            break;
          case 'CHECK_PRICE':
            if (node.checkFlag) {
              const {
                match: {
                  params: { templateId: _templateId },
                },
              } = props;
              data.push({
                value: node.value,
                key: 'checkPriceRule',
                title: intl
                  .get('ssrc.sourceTemplate.view.message.title.commonRule', {
                    ruleType:
                      (baseInfoDs?.current?.get('secondarySourceCategory') ||
                        baseInfoDs?.current?.get('sourceCategory')) === 'NEW_BID'
                        ? intl.get('ssrc.common.view.message.target').d('定标')
                        : node.meaning,
                  })
                  .d('{ruleType}规则'),
                component: (
                  <CheckPriceRule
                    targetField={targetField}
                    initQuery={initQuery}
                    templateId={_templateId}
                    checkPriceUiIsNew={checkPriceUiIsNew}
                    scoreFlag={isShowNodeCard('EXPERT_SCORE')}
                  />
                ),
                disabled: !node.clickableFlag,
              });
            }
            break;
          default:
            break;
        }
      });
    }
    return data;
  }, [
    nodes,
    approveProps,
    rfApproveProps,
    checkPriceUiIsNew,
    isShowNodeCard,
    serviceChargeFlag,
    baseInfoDs?.current,
  ]);

  // 点击面板
  const handleSetActiveKey = useCallback((value) => setActiveKey(value), [setActiveKey]);

  useEffect(() => {
    if (status === 'fillInfo') {
      const key = (getTabRuleConfig() || []).map((item) => item.key);
      if (!key.includes(activeKey)) {
        setActiveKey('approveRule');
      }
    }
  }, [status]);

  // 气泡显示鼠标进入
  const handleEnter = (e, item) => {
    if (e.target.scrollWidth > e.target.clientWidth) {
      Tooltip.show(e.target, {
        title: item.title,
      });
    }
  };

  // 鼠标移出
  const handleLeave = () => {
    Tooltip.hide();
  };

  // 对标签类型进行处理
  const getColor = useCallback(
    (config) => {
      if (config.value === 'CHECK_PRICE') {
        // 核价节点单独处理包括中标规则
        if (
          tagStatus[config.value] &&
          tagStatus.WIN_BID &&
          tagStatus[config.value] === tagStatus.WIN_BID &&
          tagStatus.BID_ANNOUNCEMENT &&
          tagStatus[config.value] === tagStatus.BID_ANNOUNCEMENT
        ) {
          return tagStatus[config.value];
        } else if (
          tagStatus[config.value] &&
          tagStatus.WIN_BID &&
          tagStatus.BID_ANNOUNCEMENT &&
          (tagStatus[config.value] !== tagStatus.WIN_BID ||
            tagStatus[config.value] !== tagStatus.BID_ANNOUNCEMENT)
        ) {
          return 'orange';
        } else {
          return 'gray';
        }
      }
      return tagStatus[config.value] || 'gray';
    },
    [tagStatus]
  );

  // 对tab组件进行渲染
  const renderTabPane = useCallback(
    (config) => {
      if (config.value === 'CHECK_PRICE') {
        return (
          <CheckPriceTab
            config={config}
            statusTagsMap={statusTagsMap}
            getColor={getColor}
            tagStatus={tagStatus}
            scoreFlag={isShowNodeCard('EXPERT_SCORE')}
          />
        );
      }
      return config.hasSecondLevel ? (
        config.component
      ) : (
        <>
          <div style={{ display: 'flex', margin: '20px 0 16px 0' }} />
          <div>{config.component}</div>
        </>
      );
    },
    [statusTagsMap, getColor, tagStatus, isShowNodeCard]
  );

  const visible = isEmpty(nodes) ? null : status === 'chooseNode'; // 改为样式隐藏，解决保存/发布 首次进入无法校验基础信息个性化问题

  const sourceCategoryProps = {
    changeBiddingMode,
    britishBidding,
  };

  return (
    <React.Fragment>
      <Header title={Title()} backPath="/ssrc/source-template-workbench/list">
        <DynamicButtons buttons={getButtons()} />
      </Header>
      <div className={styles['source-template-spin']}>
        <div className={styles['source-template-spin-wrapper']}>
          <Spin spinning={loading}>
            <div className={styles['source-template-update-content']}>
              <div
                className={styles['source-template-update-content-form']}
                style={{ display: visible ? 'block' : 'none' }}
              >
                <Card
                  title={intl.get('ssrc.sourceTemplate.view.message.panel.baseInfos').d('基本信息')}
                  allowArrow={false}
                >
                  <BaseInfo handleSourceCategoryChange={handleChange} />
                </Card>
                <Card
                  title={intl
                    .get(`ssrc.sourceTemplate.model.template.sourcingCategory`)
                    .d('寻源类别')}
                  allowArrow={false}
                >
                  <SourceCategory onChange={handleChange} {...sourceCategoryProps} />
                  <ChooseSourceNode
                    nodes={nodes}
                    onChangeSwitch={handleChangeSwitch}
                    sourceCategory={
                      baseInfoDs?.current?.get('secondarySourceCategory') ||
                      baseInfoDs?.current?.get('sourceCategory')
                    }
                  />
                </Card>
                {['RFI', 'RFP'].includes(
                  baseInfoDs?.current?.get('secondarySourceCategory') ||
                    baseInfoDs?.current?.get('sourceCategory')
                ) ? null : (
                  <div className={styles['bottom-line']} />
                )}
              </div>
              <div
                className={styles['source-template-update-content-forms']}
                style={{ display: !visible ? 'block' : 'none' }}
              >
                <Tabs tabPosition="left" activeKey={activeKey} onChange={handleSetActiveKey}>
                  {(getTabRuleConfig() || [])?.map((config) => {
                    return (
                      <TabPane
                        key={config.key}
                        disabled={config.disabled}
                        tab={
                          <div className={styles['source-template-update-content-forms-tab']}>
                            <div
                              className={styles['source-template-update-content-forms-title']}
                              onMouseLeave={handleLeave}
                              onMouseEnter={(e) => handleEnter(e, config)}
                            >
                              {config.title}
                            </div>
                            <div className={styles['source-template-update-content-forms-tag']}>
                              <Tag
                                style={tagStyle}
                                color={config.disabled ? 'gray' : getColor(config)}
                              >
                                {config.disabled
                                  ? intl
                                      .get(
                                        'ssrc.sourceTemplate.view.message.title.nextStep.noConfig'
                                      )
                                      .d('无配置项')
                                  : statusTagsMap[getColor(config)]}
                              </Tag>
                            </div>
                          </div>
                        }
                      >
                        {renderTabPane(config)}
                      </TabPane>
                    );
                  })}
                </Tabs>
              </div>
            </div>
          </Spin>
        </div>
      </div>
    </React.Fragment>
  );
};

export default observer(Page);
