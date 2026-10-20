import notification from 'utils/notification';
import { isEmpty } from 'lodash';

/**
 * 合并原始与表白季 dataSource 为一个
 * @param {Array} sourceData - 原始 dataSource
 * @param {Array} editData - 编辑 dataSource
 */

export function mergeScorerDataSource(sourceData, editData) {
  const key = 'respUserId';
  const newSourceData = [...sourceData].map(item => {
    const index = editData.findIndex(e => e[key] === item[key]);
    return index === -1 ? item : editData[index];
  });

  return [
    ...newSourceData,
    ...editData.filter(e => newSourceData.findIndex(i => i.respUserId === e.respUserId) === -1),
  ];
}

/**
 * 查询评分信息
 * @param {Object} evalTplId - 评分要素模版id
 */
export function queryScoreInfo(dispatch, evalTplId, customizeUnitCode = '') {
  dispatch({
    type: 'commonApplication/queryQualifiedScoreInfo',
    payload: {
      evalTplId,
      customizeUnitCode,
    },
  });
}

/**
 * 查询评分人列表
 * @param {Object} params - 查询评分人参数
 */
export function queryScorer(params) {
  const { dispatch, ...payload } = params;

  dispatch({
    type: 'commonApplication/queryScorer',
    payload,
  });
}

/**
 * 更新评分人行信息
 * @param {Object} params - 评分人行信息
 */
export function addScorerInfo(params) {
  const { dispatch, scorerList, editScorerList, ...others } = params;
  const index = scorerList.findIndex(e => e.respUserId === others.respUserId);
  const editIndex = editScorerList.findIndex(e => e.respUserId === others.respUserId);

  if (index === -1 || others.objectVersionNumber) {
    // 过滤掉重复添加
    dispatch({
      type: 'commonApplication/updateState',
      payload: {
        editScorerList:
          editIndex === -1
            ? [...editScorerList, others]
            : [
                ...editScorerList.slice(0, editIndex),
                others,
                ...editScorerList.slice(editIndex + 1),
              ],
      },
    });
  }
}

/**
 * 关闭申请单清空状态
 */
export function cleanState(dispatch) {
  dispatch({
    type: 'commonApplication/updateState',
    payload: {
      scorerList: [],
      editScorerList: [],
    },
  });
}

/**
 * 清空评分模板
 */
export function emptyTemplate(dispatch) {
  dispatch({
    type: 'commonApplication/updateState',
    payload: {
      scoreInfo: [],
    },
  });
}

/**
 * 批量维护评分人
 */
export function batchMaintainGrader(params) {
  const {
    dispatch,
    scorerList,
    editScorerList,
    requisitionId,
    stageCode,
    indicateLineIds,
    scoreInfoTable,
  } = params;
  const payload = {
    stageCode,
    requisitionId,
    indicateLineIds,
    kpiEvalTplIndRespList: mergeScorerDataSource(scorerList, editScorerList),
  };

  dispatch({
    type: 'commonApplication/batchMaintainGrader',
    payload,
  }).then(res => {
    if (res) {
      scoreInfoTable.onClose();
      notification.success();
    }
  });
}

/**
 * 保存评分人信息
 * @param {Nunber} indicateLineId - 评分人信息行 id
 */
export function saveScorerInfo(params) {
  const {
    dispatch,
    requisitionId,
    indicateLineId,
    scorerList,
    editScorerList,
    scoreInfoTable,
    stageCode,
    customizeUnitCode,
  } = params;

  const payload = {
    indicateLineId,
    requisitionId,
    kpiEvalTplIndRespList: mergeScorerDataSource(scorerList, editScorerList),
    stageCode,
  };
  dispatch({
    type: 'commonApplication/saveScorer',
    payload,
  }).then(res => {
    if (res) {
      scoreInfoTable.setState({
        drawerVisible: false,
      });
      cleanState(dispatch);
      notification.success();
      if (customizeUnitCode) {
        // 查询合格申请详情
        dispatch({
          type: 'qualifiedApplication/queryQualifiedDetail',
          payload: {
            requisitionId,
            customizeUnitCode,
          },
        });
      }
    }
  });
}

/**
 * 删除评分人人
 * @param {Array} params - 要删除的 respUserId List
 */
export function deleteScorerInfo(params) {
  const {
    dispatch,
    requisitionId,
    templateId,
    rows,
    indicateLineId,
    evalTplIndId,
    scorerList,
    editScorerList,
    scoreInfoTable,
    stageCode,
    customizeUnitCode,
  } = params;
  let localDeleteKeys = []; // 要本地更新状态删除的评分人列表
  let remoteDeleteKeys = []; // 要远程删除的评分人行 id 列表

  rows.forEach(scorer => {
    const isLocal =
      editScorerList.findIndex(item => String(item.respUserId) === String(scorer.respUserId)) !==
      -1;
    const isRemote =
      scorerList.findIndex(item => String(item.respUserId) === String(scorer.respUserId)) !== -1;
    if (isLocal) {
      localDeleteKeys = [...localDeleteKeys, scorer.respUserId];
    }
    if (isRemote) {
      remoteDeleteKeys = [...remoteDeleteKeys, scorer.scorerLineId];
    }
  });

  // 执行本地状态删除
  if (!isEmpty(localDeleteKeys)) {
    dispatch({
      type: 'commonApplication/updateState',
      payload: {
        editScorerList: editScorerList.filter(
          item => localDeleteKeys.findIndex(e => e === item.respUserId) === -1
        ),
      },
    });
    if (isEmpty(remoteDeleteKeys)) {
      notification.success();
    }
  }

  // 执行远程删除
  if (!isEmpty(remoteDeleteKeys)) {
    dispatch({
      type: 'commonApplication/deleteScorer',
      payload: {
        requisitionId,
        indicateLineId,
        ids: remoteDeleteKeys,
        stageCode,
      },
    }).then(res => {
      if (res) {
        queryScorer({
          dispatch,
          templateId,
          requisitionId,
          indicateLineId,
          evalTplIndId,
          stageCode,
        });
        if (customizeUnitCode) {
          // 查询合格申请详情
          dispatch({
            type: 'qualifiedApplication/queryQualifiedDetail',
            payload: {
              requisitionId,
              customizeUnitCode,
            },
          });
        }
        notification.success();
      }
    });
  }
  scoreInfoTable.setState({
    selectedRows: [],
  });
}

/**
 * 查询”供应商分类“历史数据
 */
export function querySupplierClassification(params) {
  const { dispatch, ...others } = params;
  dispatch({
    type: 'commonApplication/querySupplierClassification',
    payload: {
      ...others,
      page: 0,
      size: 0,
      customizeUnitCode: 'SSLM.SUPPLIER_LIFE_CYCLE.SUP_CAT_LIST',
    },
  });
}

/**
 * 删除”供应商分类“
 */
export function deleteClassify(params) {
  const { dispatch, remoteRows } = params;
  dispatch({
    type: 'commonApplication/deleteClassify',
    payload: remoteRows,
  }).then(res => {
    if (res) {
      notification.success();
    }
  });
}

/**
 * 查询”采购/财务“历史数据
 */
export function queryPurchaseHistory(params) {
  const { dispatch, ...others } = params;
  dispatch({
    type: 'commonApplication/queryPurchaseData',
    payload: {
      ...others,
      customizeUnitCode: [
        'SSLM.SUPPLIER_LIFE_MANAGE.PURCHASE_HEADER',
        'SSLM.SUPPLIER_LIFE_MANAGE.PURCHASE_LINES',
        'SSLM.SUPPLIER_LIFE_CYCLE.PURCHASE_HEADER',
        'SSLM.SUPPLIER_LIFE_CYCLE.PURCHASE_INFO',
      ],
    },
  });
}

/**
 * 查询”采购/财务“头信息
 */
export function queryPurchaseHeader(params) {
  const { dispatch, ...others } = params;
  dispatch({
    type: 'commonApplication/queryPurchaseHeader',
    payload: {
      ...others,
      customizeUnitCode: 'SSLM.SUPPLIER_LIFE_MANAGE.PURCHASE_HEADER',
    },
  });
}

/**
 * 查询”采购/财务“行信息
 */
export function queryPurchaseLines(params) {
  const { dispatch, ...others } = params;
  dispatch({
    type: 'commonApplication/queryPurchaseLines',
    payload: {
      ...others,
      customizeUnitCode: 'SSLM.SUPPLIER_LIFE_MANAGE.PURCHASE_LINES',
    },
  });
}

// 退回评分确认回调
export async function backScoreSave(params) {
  const { dispatch, dataSet, requisitionId, stageCode, onRefresh } = params;
  // 获取勾选数据
  const checkData = dataSet.toJSONData();
  // 是否跨页全选
  const checkAll = dataSet.isAllPageSelection;
  // 获取查询条件
  const queryData = dataSet.queryDataSet?.current.toJSONData();
  const { indicateId, userId } = queryData;
  // 未选中的值
  const unCheckData = dataSet.unSelected.map(record => record.toData());

  const payload = {
    userId,
    indicateId,
    requisitionId,
    stageCode,
    selectAllFlag: checkAll ? 1 : 0,
    scorerLineIds: checkAll ? [] : checkData.map(n => n.scorerLineId),
    unChooseScorerLineIds: unCheckData.map(n => n.scorerLineId),
  };

  if (!isEmpty(checkData)) {
    await dispatch({
      type: 'commonApplication/backScore',
      payload,
    }).then(res => {
      if (res) {
        notification.success();
        onRefresh();
      }
    });
  }
}

export const stageSourceKey = {
  register: 'REGISTER', // 注册
  recommend: 'RECOMMEND', // 推荐
  potential: 'POTENTIAL', // 潜在
  qualified: 'QUALIFIED', // 合格
  prepare: 'RESERVED', // 预留
  eliminate: 'ELIMINATED', // 淘汰
};
