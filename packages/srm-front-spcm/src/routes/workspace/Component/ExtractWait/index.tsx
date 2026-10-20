/*
 * @Description: 重新提取等待组建
 * @Date: 2025-11-19 11:19:45
 * @Author: MYT<yitian.mao@going-link.com>
 * @Version: 1.0.0
 * @Copyright: Copyright (c) 2021, ZhenYun
 */
import React, { useState, useCallback, useEffect, useRef } from 'react';

import { Progress } from 'choerodon-ui/pro';
import intl from 'utils/intl';

import { queryIdpValue } from 'services/api';

import { ReactComponent as IntelExtract } from '@/assets/intel_extract.svg';

import styles from './index.less';


export interface DataSetType {
  status: 'done' | 'loading' | 'submitting' | 'ready';
}


export interface StoreValueType {
  handleCancelExtract: () => void;
  dataSet: DataSetType;
};

const ExtractWait = ({
  handleCancelExtract,
  dataSet,
}: StoreValueType) => {

  const [extractPercent, setExtractPercent] = useState(0);
  const [totalTime, setTotalTime] = useState(90);
  const percentTimer = useRef<any>(null);
  const MAX_PROGRESS = 99;

  const fetchTotalTime = useCallback(async () => {
    try {
      const data = await queryIdpValue('SPCM_INTELLIGENT_EXTRACTION_PROGRESS');
      setTotalTime((data || []).find((item) => item.value === 'DEFAULT_TOTAL_TIME')?.meaning || 90);
    } catch (error) {
      setTotalTime(90);
    }
  }, []);

  const rollFun = async () => {
    const increment = Math.round(100 / totalTime);

    setExtractPercent((prev) => {
      const newValue = prev + increment;
      if (newValue >= MAX_PROGRESS) {
        clearInterval(percentTimer.current);
        percentTimer.current = null;
        return MAX_PROGRESS;
      }
      return newValue;
    });
  };

  const startProgress = useCallback(async () => {
    await fetchTotalTime();
    if (percentTimer.current || dataSet?.status !== 'done') {
      if (percentTimer.current) {
        clearInterval(percentTimer.current);
        percentTimer.current = null;
      }
      setExtractPercent(0);
      return;
    }

    rollFun();
    percentTimer.current = setInterval(rollFun, 1000);
  }, [dataSet?.status, fetchTotalTime]);

  useEffect(() => {
    startProgress();
    return () => {
      setExtractPercent(100);
      if (percentTimer.current) {
        clearInterval(percentTimer.current);
        percentTimer.current = null;
      }
    };
  }, []);

  return (
    <div className={styles.extractContract}>
      <div>
        <IntelExtract />
      </div>
      <div className={styles.extractText}>
        <Progress percent={extractPercent} />
        <p className={styles.extracting}>
          {intl.get('spcm.workspace.msg.extractingContract').d('正在提取合同内容')}
        </p>
        <p>
          {intl.get('spcm.workspace.msg.minimumWait').d('预计等待时间：1~2分钟')}
          <br />
          {intl
            .get('spcm.workspace.msg.extractingTips')
            .d('请耐心等候，或点击「取消」按钮转为手动创建')}
        </p>
        <a onClick={handleCancelExtract}>{intl.get('hzero.common.button.cancel').d('取消')}</a>
      </div>
    </div>
  );
};

export default ExtractWait;
