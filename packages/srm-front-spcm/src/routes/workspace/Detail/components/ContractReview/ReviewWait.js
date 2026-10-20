/*
 * ReviewWait - 合同审查-等待页
 * @Date: 2025-05-08 10:19:06
 * @Author: CDJ
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { Fragment, useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { compose, isEmpty } from 'lodash';
import querystring from 'querystring';
import { routerRedux } from 'dva/router';
import classnames from 'classnames';

import { Button, Spin, Tooltip } from 'choerodon-ui/pro';
import { Icon } from 'choerodon-ui';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { Header, Content } from 'components/Page';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import notification from 'utils/notification';

import {
  fetchContractReviewType,
  fetchTaskIdOfExtract,
  fetchTaskIdOfCompare,
  getDocOnLineUrl, // 对比轮询
  generateSmartReview,
} from '@/services/contractCommonService';
import {
  queryEditShare,
  extractPollResult, // 提取轮询接口
  queryShareEditConfig,
} from '@/services/workspaceService';
import { submit } from '@/services/contractMaintainService';
import { useSetState } from '@/utils/util';
import { editCustomCode } from '@/utils/enum';

import { getWaitShowImgList, getImgSrcComponent, getStatusTag } from './utils/utils';
import styles from './styles.less';

const customizeUnitCode = `SPCM.WORKSPACE_DETAIL.HEADER,SPCM.WORKSPACE_DETAIL.SUBJECT,SPCM.WORKSPACE_DETAIL.STAGE,SPCM.WORKSPACE_DETAIL.PARTNER,SPCM.WORKSPACE_DETAIL.BUSINESSTERMS,SPCM.WORKSPACE_DETAIL.REBATE,${Object.values(
  editCustomCode
).toString()}`;

const ReviewWait = ({
  dispatch,
  match: {
    params: { pcHeaderId },
  },
  location,
}) => {
  const routerParams = useMemo(() => querystring.parse(location.search.substr(1)), [
    location.search,
  ]);
  const { itemKey, reviewSessionId, triggerType } = routerParams || {};
  const [loading, setLoading] = useState(false);
  // 提取state
  const [extractInfo, setExtractInfo] = useSetState({
    extractLoading: false, // 提取按钮loading
    extractStatus: '',
    extractTaskId: null,
    // extractFinishFlag: 0, // 暂时无用
  });
  // 对比state
  const [compareInfo, setCompareInfo] = useSetState({
    compareLoading: false, // 对比按钮loading
    compareStatus: '',
    compareTaskId: null,
    // compareFinishFlag: 0, // 暂时无用
  });
  const [state, setState] = useSetState({
    reviewSessionId, // `reviewSessionId` 由 `/smart-process` 首次通过编码规则 `SPCM_RS_GLOBAL_SESSION_NUM` 生成并返回，后续接口继续沿用
    showImgKeys: [],
    coordinatedFlag: null, // 完成协同标识
  });

  const extractTimer = useRef(null);
  const compareTimer = useRef(null);

  const { showImgKeys = [] } = state;
  const { extractStatus, extractTaskId } = extractInfo;
  const { compareStatus, compareTaskId } = compareInfo;

  useEffect(() => {
    queryAllInfo();
    return () => {
      clearExtractTimer();
      clearCompareTimer();
    };
  }, [pcHeaderId]);

  // 提取状态为提取中需轮询调用，提取结果接口
  useEffect(() => {
    // 执行轮询
    if (['working'].includes(extractStatus) && extractTaskId) {
      handleExtractPoll({ taskId: extractTaskId });
    }
  }, [extractStatus, extractTaskId, pcHeaderId]);

  // 对比状态为提取中需轮询调用，提取结果接口
  useEffect(() => {
    // 执行轮询
    if (['working'].includes(compareStatus) && compareTaskId) {
      handleComparePoll({ taskId: compareTaskId });
    }
  }, [compareStatus, compareTaskId, pcHeaderId]);

  // 状态为终止态时，清空轮询计时器，并且跳转页面
  useEffect(() => {
    handlePollEnd();
  }, [extractStatus, extractTaskId, compareStatus, compareTaskId, pcHeaderId]);

  // 查询所有
  const queryAllInfo = () => {
    setLoading(true);
    Promise.all([fetchShareEditConfig(), fetchReviewInfo()])
      .then((resList) => {
        if (resList) {
          // eslint-disable-next-line no-unused-vars
          const [res1, reviewInfo] = resList;
          if (reviewInfo) {
            handleReviewTypeInfo(reviewInfo);
          }
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // 在线编辑共享配置
  const fetchShareEditConfig = async () => {
    const config = await queryShareEditConfig();
    if (getResponse(config)) {
      const { enableEditShare } = config;
      if (enableEditShare === '1') {
        await handleCompleteCooperate();
      }
    }
  };

  // 查询审查信息
  const fetchReviewInfo = async () => {
    // 打上审查的标识，下次从列表进来的时候直接进入审查页
    const payload = { pcHeaderId, updateTaskFlag: 1, reviewSessionId, triggerType };
    const res = await fetchContractReviewType(payload);
    return getResponse(res);
  };

  // 处理审查类型
  const handleReviewTypeInfo = (params = {}) => {
    if (!isEmpty(params)) {
      const {
        // 对比
        // smartCompareFlag,
        smartCompareStatus,
        // 提取
        // smartFetchFlag,
        smartFetchStatus,
        smartFetchMsg,
        smartCompareMsg,
        reviewSessionId,
      } = params;
      // 不展示对比
      const hiddenCompareFlag = smartCompareStatus === 'NONE';
      // 不展示提取
      const hiddenExtractFlag = smartFetchStatus === 'NONE';
      let showImgKeys = ['waitReview'];
      if (!hiddenCompareFlag && !hiddenExtractFlag) {
        showImgKeys = ['extract', 'compare'];
      } else if (!hiddenCompareFlag && hiddenExtractFlag) {
        showImgKeys = ['compare'];
      } else if (hiddenCompareFlag && !hiddenExtractFlag) {
        showImgKeys = ['extract'];
      }
      // 状态是等待，把状态改成提取中自动触发轮询接口
      const extractInfo = {
        extractStatus: smartFetchStatus === 'wait' ? 'working' : smartFetchStatus,
        extractMsg: smartFetchMsg,
        // extractFinishFlag: smartFetchFlag,
      };
      const compareInfo = {
        compareStatus: smartCompareStatus === 'wait' ? 'working' : smartCompareStatus,
        compareMsg: smartCompareMsg,
        // compareFinishFlag: smartCompareFlag,
      };
      // 处理taskId
      handleUpdateTaskId({
        ...params,
        hiddenCompareFlag,
        hiddenExtractFlag,
      });
      // 先设置展示的卡片，在设置状态
      setState({ showImgKeys, reviewSessionId });
      setExtractInfo(extractInfo);
      setCompareInfo(compareInfo);
    }
  };

  // 处理taskId
  const handleUpdateTaskId = (params) => {
    const {
      // 对比
      compareTaskId,
      // 提取
      smartTaskId,
      hiddenExtractFlag = true,
      hiddenCompareFlag = true,
    } = params;
    // 获取提取taskId
    if (!smartTaskId && !hiddenExtractFlag) {
      handleGetTaskIdByExtract();
    } else {
      setExtractInfo({ extractTaskId: smartTaskId });
    }
    // 获取对比taskId
    if (!compareTaskId && !hiddenCompareFlag) {
      handleGetTaskIdByCompare();
    } else {
      setCompareInfo({ compareTaskId });
    }
  };

  // 查询是否完成协同
  const handleCompleteCooperate = async () => {
    const res = await queryEditShare({ pcHeaderId });
    if (getResponse(res)) {
      const { isFinish } = res;
      setState({
        coordinatedFlag: isFinish,
      });
    }
    return res;
  };

  // 处理不执行相关按钮
  const handleNotExecute = (key) => {
    if (key === 'extract') {
      setExtractInfo({
        extractStatus: 'noExecute',
        // extractFinishFlag: 0,
      });
    } else if (key === 'compare') {
      setCompareInfo({
        compareStatus: 'noExecute',
        // compareFinishFlag: 0,
      });
    }
  };

  // 重试按钮
  const handleRetry = (key) => {
    // 先判断是哪一种失败
    // 1. 获取taskId报错
    // 2.轮询接口报错
    if (key === 'extract') {
      // 先把状态改成提取中
      setExtractInfo({
        extractStatus: 'working',
        // extractFinishFlag: 0,
      });
      // 执行获取taskId接口
      if (!extractTaskId) {
        handleGetTaskIdByExtract();
      }
    } else if (key === 'compare') {
      setCompareInfo({
        compareStatus: 'working',
        // compareFinishFlag: 0,
      });
      // 执行获取taskId接口
      if (!compareTaskId) {
        handleGetTaskIdByCompare();
      }
    }
  };

  // 获取提取合同TaskId
  const handleGetTaskIdByExtract = () => {
    const { reviewSessionId } = state;
    const payload = { pcHeaderId, reviewSessionId };
    fetchTaskIdOfExtract(payload).then((res) => {
      if (getResponse(res)) {
        const { taskId } = res;
        setExtractInfo({
          extractTaskId: taskId,
        });
      } else {
        setExtractInfo({
          extractStatus: 'failed',
          extractMsg: res?.message,
        });
      }
    });
  };

  // 处理提取合同轮询
  const handleExtractPoll = (params = {}) => {
    clearExtractTimer();
    const { taskId } = params;
    if (!taskId) {
      return;
    }
    extractTimer.current = setInterval(() => {
      extractPollResult({ taskId }).then((res) => {
        if (getResponse(res)) {
          const { smartTaskFetchFlag } = res;
          if (Number(smartTaskFetchFlag) === 1) {
            clearExtractTimer();
            setExtractInfo({
              extractStatus: 'success',
              // extractFinishFlag: 1,
            });
          }
        } else {
          clearExtractTimer();
          setExtractInfo({
            extractStatus: 'failed',
            extractMsg: res?.message,
            // extractFinishFlag: 0,
          });
        }
      });
    }, 5000);
  };

  // 获取对比合同TaskId
  const handleGetTaskIdByCompare = () => {
    const { reviewSessionId } = state;
    const payload = { pcHeaderId, reviewSessionId };
    fetchTaskIdOfCompare(payload).then((res) => {
      if (getResponse(res)) {
        const { taskId } = res;
        setCompareInfo({
          compareTaskId: taskId,
        });
      } else {
        setCompareInfo({
          compareStatus: 'failed',
        });
      }
    });
  };

  // 处理对比合同轮询
  const handleComparePoll = (params = {}) => {
    clearCompareTimer();
    const { taskId } = params;
    if (!taskId) {
      return;
    }
    compareTimer.current = setInterval(() => {
      const payload = {
        taskId,
        pcHeaderId,
      };
      getDocOnLineUrl(payload).then((res) => {
        if (getResponse(res)) {
          const { smartTaskFetchFlag } = res;
          if (Number(smartTaskFetchFlag) === 1) {
            clearCompareTimer();
            setCompareInfo({
              compareStatus: 'success',
              // compareFinishFlag: 1,
            });
          }
        } else {
          clearCompareTimer();
          setCompareInfo({
            compareStatus: 'failed',
            // compareFinishFlag: 0,
          });
        }
      });
    }, 2500);
  };

  // 轮询结束
  const handlePollEnd = () => {
    const extractEndFlag =
      ['success', 'noExecute'].includes(extractStatus) || ['NONE'].includes(extractStatus);
    const compareEndFlag =
      ['success', 'noExecute'].includes(compareStatus) || ['NONE'].includes(compareStatus);
    if (extractEndFlag && compareEndFlag) {
      clearExtractTimer();
      clearCompareTimer();
      const showImgKeys = ['waitReview'];
      setState({ showImgKeys });
      // 进行智能审查
      const payload = {
        pcHeaderId,
        triggerType,
        reviewSessionId: state.reviewSessionId,
        ignoreSmartFlag: ['noExecute'].includes(extractStatus),
        ignoreSmartCompareFlag: ['noExecute'].includes(compareStatus),
      };
      generateSmartReview(payload).then((res) => {
        if (getResponse(res)) {
          // 跳转页面
          if (triggerType === 'SUBMIT_REVIEW') {
            contractSubmit();
          } else {
            handleGoToReviewDetail();
          }
        }
      });
    }
  };

  const contractSubmit = () => {
    const payload = {
      pcHeaderList: [{ pcHeaderId, tenantId: getCurrentOrganizationId(), workbenchFlag: '1' }],
      customizeUnitCode,
    };
    setLoading(true);
    return submit(payload)
      .then((res) => {
        if (getResponse(res)) {
          notification.success();
          if (itemKey) {
            // 清除session
            window.sessionStorage.removeItem(itemKey);
          }
          dispatch(
            routerRedux.push({
              pathname: '/spcm/contract-workspace/list',
            })
          );
        } else {
          handleGoToReviewDetail();
        }
      })
      .finally(() => setLoading(false));
  };

  // 跳转审查详情
  const handleGoToReviewDetail = () => {
    dispatch(
      routerRedux.push({
        pathname: `/spcm/contract-workspace/intelligent/${pcHeaderId}`,
      })
    );
    // dispatch(
    //   routerRedux.push({
    //     pathname: `/spcm/contract-workspace/review/${pcHeaderId}`,
    //     search: querystring.stringify(
    //       filterNullValueObject({
    //         pathParam,
    //         from,
    //         itemKey,
    //         coordinatedFlag,
    //         // 不执行提取标识
    //         notExtractFlag: ['noExecute'].includes(extractStatus) ? 1 : 0,
    //         // 不执行对比标识
    //         notCompareFlag: ['noExecute'].includes(compareStatus) ? 1 : 0,
    //       })
    //     ),
    //   })
    // );
  };

  // 清空提取轮询
  const clearExtractTimer = useCallback(() => {
    if (extractTimer.current) {
      clearInterval(extractTimer.current);
    }
  }, [extractTimer.current]);

  // 清空对比轮询
  const clearCompareTimer = useCallback(() => {
    if (compareTimer.current) {
      clearInterval(compareTimer.current);
    }
  }, [compareTimer.current]);

  const imgList = getWaitShowImgList().filter((i) => showImgKeys.includes(i.key));

  return (
    <Fragment>
      <Header
        backPath="/spcm/contract-workspace/list"
        title={intl.get('spcm.common.view.title.backToContractList').d('返回至合同列表页')}
      />
      <Content className={styles['spcm-contract-review-wait']}>
        <Spin spinning={loading}>
          <div className={styles['spcm-contract-review-wait-warpper']}>
            {imgList.map((i, index) => {
              const { key, help, notExecuteBtnText = '', retryBtnText = '' } = i;
              const processState = key === 'extract' ? extractInfo : compareInfo;
              return (
                <div
                  className={classnames(styles['review-wait-item'], {
                    [styles['review-wait-item-right']]: index,
                  })}
                >
                  <div>{getImgSrcComponent(key)}</div>
                  <div
                    className={classnames(styles['review-wait-item-help'], {
                      [styles['review-wait-item-reviewRule']]: key === 'waitReview',
                    })}
                  >
                    <span>{help}</span>
                    {key !== 'waitReview' && (
                      <span>
                        {getStatusTag(processState[`${key}Status`])}
                        {processState[`${key}Msg`] && (
                          <Tooltip title={processState[`${key}Msg`]}>
                            <Icon
                              style={{ color: 'gray' }}
                              type="help"
                              className={styles['row-agent-column-icon']}
                            />
                          </Tooltip>
                        )}
                      </span>
                    )}
                  </div>
                  {key !== 'waitReview' && (
                    <div>
                      <Button
                        loading={processState[`${key}Loading`]}
                        hidden={processState[`${key}Status`] !== 'failed'}
                        onClick={() => handleNotExecute(key)}
                      >
                        {notExecuteBtnText}
                      </Button>
                      <Button
                        loading={processState[`${key}Loading`]}
                        hidden={processState[`${key}Status`] !== 'failed'}
                        onClick={() => handleRetry(key)}
                      >
                        {retryBtnText}
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Spin>
      </Content>
    </Fragment>
  );
};

export default compose(
  formatterCollections({
    code: ['spcm.common', 'spcm.workspace'],
  })
)(ReviewWait);
