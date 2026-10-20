/*
 * @Description: ContractExtractWait - 重新提取等待页面
 * @Date: 2025-11-17 11:33:19
 * @Author: MYT<yitian.mao@going-link.com>
 * @Version: 1.0.0
 * @Copyright: Copyright (c) 2021, ZhenYun
 */
import React, { Fragment, useCallback, useEffect, useMemo, useRef } from 'react';
import { compose } from 'lodash';
import querystring from 'querystring';
import { routerRedux } from 'dva/router';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import { Header, Content } from 'components/Page';
import { getResponse } from 'utils/utils';
import {
  extractPollResult, // 提取轮询接口
  smartContractTaskCancel,
} from '@/services/workspaceService';
import { useSetState } from '@/utils/util';
import ExtractWait from '../../../Component/ExtractWait';

import styles from './index.less';

const ContractExtractWait = ({
  dispatch,
  match: {
    params: { pcHeaderId },
  },
}) => {
  const routerParams = useMemo(() => querystring.parse(location.search.substr(1)), [
    location.search,
  ]);
  const { pathParam, smartTaskId } = routerParams || {};
  // 提取state
  const [extractInfo, setExtractInfo] = useSetState({
    extractStatus: '',
    status: 'ready',
  });

  const extractTimer = useRef(null);
  const { extractStatus, extractTaskId } = extractInfo;

  useEffect(() => {
    return () => {
      clearExtractTimer();
    };
  }, [pcHeaderId]);

  // 提取状态为提取中需轮询调用，提取结果接口
  useEffect(() => {
    handleExtractPoll();
  }, [extractStatus, smartTaskId, pcHeaderId]);

  // 状态为终止态时，清空轮询计时器，并且跳转页面
  useEffect(() => {
    handlePollEnd();
  }, [extractStatus, extractTaskId, pcHeaderId]);

  const getExtractResult = async () => {
    if (extractStatus === 'success') {
      clearExtractTimer();
      return false;
    }
    const res = await extractPollResult({ taskId: smartTaskId });
    if (getResponse(res)) {
      const { smartTaskFetchFlag } = res;
      if (Number(smartTaskFetchFlag) === 1) {
        clearExtractTimer();
        setExtractInfo({
          extractStatus: 'success',
          status: 'ready',
        });
      }
    } else {
      clearExtractTimer();
      setExtractInfo({
        extractStatus: 'failed',
        status: 'ready',
      });
    }
  };

  // 处理提取合同轮询
  const handleExtractPoll = async () => {
    clearExtractTimer();
    if (!smartTaskId) {
      return;
    }
    setExtractInfo({ status: 'done' });
    await getExtractResult(); // 此处为了立即执行
    extractTimer.current = setInterval(async () => {
      await getExtractResult();
    }, 5000);
  };

  // 轮询结束
  const handlePollEnd = () => {
    if (extractStatus === 'success') {
      clearExtractTimer();
      handleGoToDetail();
    }
  };

  // 跳转到协议详情
  const handleGoToDetail = () => {
    dispatch(
      routerRedux.push({
        pathname: `/spcm/contract-workspace/${pathParam}/${pcHeaderId}`,
      })
    );
  };

  // 清空提取轮询
  const clearExtractTimer = useCallback(() => {
    if (extractTimer.current) {
      clearInterval(extractTimer.current);
      extractTimer.current = null;
    }
  }, [extractTimer.current]);

  const handleCancelExtract = async () => {
    const res = await smartContractTaskCancel({ taskId: smartTaskId });
    if (res?.failed) {
      if (res?.code === 'error.spcm_smart_element_fill_data_ing') {
        notification.warning({
          message: intl
            .get(`spcm.workspace.msg.cannotCancel`)
            .d('数据处理中无法中断。为确保数据完整性，请在页面耐心等待，请勿刷新或离开。'),
          description: intl
            .get('spcm.workspace.msg.dataComplete')
            .d('提示：当系统自动返回编辑页面时，即表示数据提取已完成。'),
        });
      } else {
        getResponse(res);
      }
    } else {
      handleGoToDetail();
    }
  };

  return (
    <Fragment>
      <Header
        backPath="/spcm/contract-workspace/list"
        title={intl.get('spcm.common.view.title.backToContractList').d('返回至合同列表页')}
      />
      <Content className={styles['spcm-contract-extract-wait']}>
        <div className={styles['spcm-contract-extract-wait-wrapper']}>
          { extractInfo?.status === 'ready' ? null : (
            <ExtractWait dataSet={extractInfo} handleCancelExtract={handleCancelExtract} />
          )}
        </div>
      </Content>
    </Fragment>
  );
};

export default compose(
  formatterCollections({
    code: ['spcm.common', 'spcm.workspace'],
  })
)(ContractExtractWait);
