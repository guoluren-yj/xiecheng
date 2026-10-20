/*
 * @Date: 2023-10-18 15:13:47
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import querystring from 'querystring';

import intl from 'utils/intl';

import Basic from './components/Basic';
import Scorer from './components/Scorer';
import SummaryRule from './components/SummaryRule';
import ScoreResult from './components/ScoreResult';
import EvaluationCycle from './components/EvaluationCycle';
import SubsequentAction from './components/SubsequentAction';
import EvaluationObject from './components/EvaluationObject';
import EvaluationIndicator from './components/EvaluationIndicator';

// 页面状态
const docStatus = {
  create: intl.get('hzero.common.button.create').d('新建'),
  edit: intl.get('hzero.common.button.edit').d('编辑'),
  view: intl.get('hzero.common.button.view').d('查看'),
  copy: intl.get('hzero.common.button.copy').d('复制'),
};

// 详情页title
export const getHeaderTitle = (status, jumpSource, versionNum) => {
  const curStatus = docStatus[status];
  if (['LIST_HISTORY', 'DETAIL_HISTORY'].includes(jumpSource)) {
    return intl
      .get('sslm.indicatorTemplate.view.title.viewTemplateVersion', {
        version: versionNum,
      })
      .d(`查看模板-版本v${versionNum}`);
  }
  return intl
    .get('sslm.common.view.title.template', {
      status: curStatus,
    })
    .d(`${curStatus}模板`);
};

// 详情页返回路径
export const getBackPath = ({ jumpSource, sourceEvalTplId, sourceEvalTplType, editFlag }) => {
  switch (jumpSource) {
    case 'DETAIL_HISTORY': {
      // 从明细历史记录跳转过来，返回到明细页
      const search = querystring.stringify({
        sourceEvalTplId,
        sourceEvalTplType,
        editFlag,
      });
      return `/sslm/indicator-template-define/template-detail/${sourceEvalTplId}/${sourceEvalTplType}/view?${search}`;
    }
    default:
      return '/sslm/indicator-template-define/list';
  }
};

// 评分人表格保存时传的key
export const scorerTableKey = {
  INDICATOR: 'assignKpiEvalTplIndList',
  SUPPLIER: 'kpiEvalTplDataList',
  CATEGORY: 'kpiEvalTplDataList',
  ITEM: 'kpiEvalTplDataList',
  RATER: 'kpiEvalTplRespDmsList',
  'SUPPLIER+INDICATOR': 'kpiEvalTplDataList',
  'SU+CA+IN': 'kpiEvalTplDataList',
  'SU+IT+IN': 'kpiEvalTplDataList',
};

// 获取TabPane集合
export const getTabPaneList = ({ evalTplType }) =>
  [
    {
      key: 'baseInfo',
      component: Basic,
      isForm: true,
      label: intl.get('sslm.common.view.title.baseInfo').d('基础信息'),
    },
    {
      key: 'kpiAutoConfig',
      isForm: true,
      component: EvaluationCycle,
      hidden: ['BDKPI_EVAL', 'GYSKP_XC', 'GYSKP_ORDER'].includes(evalTplType),
      label: intl.get(`sslm.common.model.archive.evaluation.cycle`).d('考评周期'),
    },
    {
      key: 'evaluationObject',
      label: intl.get('sslm.common.model.archive.evaluation.object').d('考评对象'),
      component: EvaluationObject,
      hidden: ['GYSKP_XC', 'GYSKP_ORDER'].includes(evalTplType),
    },
    {
      key: 'kpiEvalTplIndList',
      label: intl.get(`sslm.common.model.archiveFilled.evaluationIndex`).d('考评指标'),
      component: EvaluationIndicator,
    },
    {
      key: 'scorer',
      label: intl.get(`sslm.common.view.scorer`).d('评分人'),
      component: Scorer,
      hidden: ['GYSKP_ORDER'].includes(evalTplType),
    },
    {
      key: 'summaryRule',
      isForm: true,
      label: intl.get('sslm.common.model.field.summaryRule').d('汇总规则'),
      component: SummaryRule,
      hidden: ['GYSKP_ORDER'].includes(evalTplType),
    },
    {
      key: 'scoreResult',
      isForm: true,
      label: intl.get('sslm.common.model.field.scoreResult').d('评分结果'),
      component: ScoreResult,
      hidden: ['GYSKP_ORDER'].includes(evalTplType),
    },
    {
      key: 'subsequentAction',
      isForm: true,
      label: intl.get('sslm.common.model.field.subsequentAction').d('后续动作'),
      component: SubsequentAction,
      hidden: ['GYSKP_XC', 'GYSKP_ORDER'].includes(evalTplType),
    },
  ].filter(n => !n.hidden);

// 评分人SearcCode
export const scorerSearchCode = {
  INDICATOR: 'SSLM.TEMPLATE_DEFINE.SCORER_INDICATOR_SEARCH',
  SUPPLIER: 'SSLM.TEMPLATE_DEFINE.SCORER_SUPPLIER_SEARCH',
  CATEGORY: 'SSLM.TEMPLATE_DEFINE.SCORER_CATEGORY_SEARCH',
  ITEM: 'SSLM.TEMPLATE_DEFINE.SCORER_ITEM_SEARCH',
  RATER: 'SSLM.TEMPLATE_DEFINE.SCORER_DESIGNATED_SEARCH',
  'SUPPLIER+INDICATOR': 'SSLM.TEMPLATE_DEFINE.SCORER_SUPPLIER_INDICATOR_SEARCH',
  'SU+CA+IN': 'SSLM.TEMPLATE_DEFINE.SCORER_SU_CA_IN_SEARCH',
  'SU+IT+IN': 'SSLM.TEMPLATE_DEFINE.SCORER_SU_IT_IN_SEARCH',
};
