// 状态hover信息
import React, { useCallback } from 'react';
import { Tooltip } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { math } from 'choerodon-ui/dataset';
import { Icon } from 'choerodon-ui';

import { formatNumber } from '../../../../utils/utils';
import StatusTag from '../../../../components/StatusTag';
import styles from '../index.less';

interface StatusInfoProps {
  children?: React.ReactNode;
  record: any;
  field: string;
  source: string,
}

const StatusInfo = (props: StatusInfoProps) => {
  const { children, field, record, source } = props;
  const { prepLockQuantity, balLockQuantity } = record?.get(['prepLockQuantity', 'balLockQuantity']) || {};

  const formatToolTip = useCallback((val, hideFlag?: boolean) => {
    const financialPrecision = record?.get('financialPrecision');
    if (hideFlag) return <div className={styles['prefab-status-row-amount']}>-</div>;
    return (<div className={styles['prefab-status-row-amount']}><Tooltip title={formatNumber(val, financialPrecision)}>{formatNumber(val, financialPrecision)}</Tooltip></div>);
  }, [record]);

  const titleRender = useCallback((hideApplyFlag?: boolean) => {
    return (
      <div className={styles['prefab-status-row']}>
        <div className={styles['prefab-status-row-title']} />
        <div className={styles['prefab-status-row-amount']}>{intl.get('sbsm.common.view.message.paymentAmount').d('付款')}</div>
        {!hideApplyFlag && <div className={styles['prefab-status-row-amount']}>{intl.get('sbsm.common.view.message.applyAmount').d('核销')}</div>}
      </div>
    );
  }, []);

  const poStatusRender = useCallback(() => {
    const { displayDocumentNum, poClosedFlag } = record?.get(['displayDocumentNum', 'poClosedFlag']) || {};
    if (!['stage'].includes(source)) return null;
    return (
      <div className={styles['po-status']}>
        <div>{displayDocumentNum}</div>
        <div>{Number(poClosedFlag) === 1 && <StatusTag value={intl.get('sbsm.common.view.message.poClosedFlag').d('订单关闭')} color="gray" />}</div>
      </div>
    );
  }, [record, source]);

  const isNaNNumber = useCallback((num) => {
    if (math.isNaN(num)) return 0;
    return num;
  }, []);

  const handleRenderToolTip = useCallback(() => {
    const {
      balCompleteApplyAmount,
      balCompletePayAmount,
      balOccupyApplyAmount,
      balOccupyPayAmount,
      prepOccupyPayAmount,
      prepOccupyApplyAmount,
      stageAmount,
      prepSourceAmount,
      prefabApplyAmount,
      stageType,
      prefabPayAmount,
      prepSource,
      prepCompletePayAmount,
      prepCompleteApplyAmount,
      prepProcess,
    } = record?.get([
      'balCompleteApplyAmount',
      'balCompletePayAmount',
      'balOccupyApplyAmount',
      'balOccupyPayAmount',
      'prepOccupyPayAmount',
      'prepOccupyApplyAmount',
      'prepOccupyApplyAmount',
      'prepOccupyPayAmount',
      'stageAmount',
      'prepSourceAmount',
      'prefabApplyAmount',
      'stageType',
      'prefabPayAmount',
      'prepSource',
      'prepCompletePayAmount',
      'prepCompleteApplyAmount',
      'prepProcess',
    ]) || {};
    const onlyPrepFlag = prepProcess === 'ONLY_PREP'; // 仅提报
    const onlyPrefabFlag = prepProcess === 'ONLY_PREFAB'; // 仅预制
    const hideApplyFlag = (stageType !== 'PREPAYMENT' && source === 'stage') || (['ORDER_PRE_STAGE', 'PRE_STAGE'].includes(prepSource) && source === 'source');
    if (field === 'prefabStatus') {
      // 预制状态
      const totalAmount = source === 'source' ? prepSourceAmount : stageAmount;
      return (
        <div>
          {poStatusRender()}
          <div className={styles['prefab-status-info']}>
            {titleRender(hideApplyFlag)}
            <div className={styles['prefab-status-row']}>
              <div className={`${styles['prefab-status-row-title']} ${styles['prefab-status-finish']}`}>{intl.get('sbsm.common.view.message.PreComplete').d('已预制')}</div>
              {formatToolTip(prefabPayAmount)}
              {!hideApplyFlag && formatToolTip(prefabApplyAmount)}
            </div>
            <div className={styles['prefab-status-row']}>
              <div className={`${styles['prefab-status-row-title']} ${styles['prefab-status-not']}`}>{intl.get('sbsm.common.view.message.unPreComplete').d('未预制')}</div>
              {formatToolTip(math.minus(isNaNNumber(totalAmount), isNaNNumber(prefabPayAmount)))}
              {!hideApplyFlag && formatToolTip(math.minus(isNaNNumber(totalAmount), isNaNNumber(prefabApplyAmount)))}
            </div>
          </div>
        </div>
      );
    } else if (field === 'prepStatus') {
      // 编制状态
      const totalPayAmount = source === 'source' ? prefabPayAmount : stageAmount;
      const totalPayApplyAmount = source === 'source' ? prefabApplyAmount : stageAmount;
      return (
        <div>
          {poStatusRender()}
          <div className={styles['prefab-status-info']}>
            {titleRender(hideApplyFlag)}
            <div className={styles['prefab-status-row']}>
              <div className={`${styles['prefab-status-row-title']} ${styles['prefab-status-finish']}`}>{intl.get('sbsm.common.view.message.PrepComplete').d('已编制')}</div>
              {formatToolTip(prepCompletePayAmount)}
              {!hideApplyFlag && formatToolTip(prepCompleteApplyAmount)}
            </div>
            <div className={styles['prefab-status-row']}>
              <div className={`${styles['prefab-status-row-title']} ${styles['prefab-status-ing']}`}>{intl.get('sbsm.common.view.message.prepIng').d('编制中')}</div>
              {formatToolTip(math.minus(isNaNNumber(prepOccupyPayAmount), isNaNNumber(prepCompletePayAmount)))}
              {!hideApplyFlag && formatToolTip(math.minus(isNaNNumber(prepOccupyApplyAmount), isNaNNumber(prepCompleteApplyAmount)))}
            </div>
            <div className={styles['prefab-status-row']}>
              <div className={`${styles['prefab-status-row-title']} ${styles['prefab-status-not']}`}>{intl.get('sbsm.common.view.message.unPrep').d('未编制')}</div>
              {formatToolTip(onlyPrefabFlag && source === 'stage' ? 0 : math.minus(isNaNNumber(totalPayAmount), isNaNNumber(prepOccupyPayAmount)))}
              {!hideApplyFlag && formatToolTip(onlyPrefabFlag && source === 'stage' ? 0 : math.minus(isNaNNumber(totalPayApplyAmount), isNaNNumber(prepOccupyApplyAmount)))}
            </div>
          </div>
        </div>
      );
    } else if (field === 'balStatus') {
      // 汇总状态
      const totalPayAmount = source === 'source' ? prefabPayAmount : stageAmount;
      const totalPayApplyAmount = source === 'source' ? prefabApplyAmount : stageAmount;
      return (
        <div>
          {poStatusRender()}
          <div className={styles['prefab-status-info']}>
            {titleRender(hideApplyFlag)}
            <div className={styles['prefab-status-row']}>
              <div className={`${styles['prefab-status-row-title']} ${styles['prefab-status-finish']}`}>{intl.get('sbsm.common.view.message.balComplete').d('已汇总')}</div>
              {formatToolTip(balCompletePayAmount)}
              {!hideApplyFlag && formatToolTip(balCompleteApplyAmount)}
            </div>
            <div className={styles['prefab-status-row']}>
              <div className={`${styles['prefab-status-row-title']} ${styles['prefab-status-ing']}`}>{intl.get('sbsm.common.view.message.balIng').d('汇总中')}</div>
              {formatToolTip(math.minus(isNaNNumber(balOccupyPayAmount), isNaNNumber(balCompletePayAmount)))}
              {!hideApplyFlag && formatToolTip(math.minus(isNaNNumber(balOccupyApplyAmount), isNaNNumber(balCompleteApplyAmount)))}
            </div>
            <div className={styles['prefab-status-row']}>
              <div className={`${styles['prefab-status-row-title']} ${styles['prefab-status-not']}`}>{intl.get('sbsm.common.view.message.unBal').d('未汇总')}</div>
              {formatToolTip((onlyPrefabFlag || onlyPrepFlag) && source === 'stage' ? 0 : math.minus(isNaNNumber(totalPayAmount), isNaNNumber(balOccupyPayAmount)))}
              {!hideApplyFlag && formatToolTip((onlyPrefabFlag || onlyPrepFlag) && source === 'stage' ? 0 : math.minus(isNaNNumber(totalPayApplyAmount), isNaNNumber(balOccupyApplyAmount)))}
            </div>
          </div>
        </div>
      );
    }
  }, [field, formatToolTip, titleRender, record, isNaNNumber, source, poStatusRender]);

  return (
    <div>
      <Tooltip
        title={handleRenderToolTip()}
        theme="light"
        placement="bottom"
        popupClassName={styles['prefab-tooltip']}
      >
        {children}
      </Tooltip>
      {((field === 'prepStatus' && Number(prepLockQuantity) > 0) ||( field === 'balStatus' && Number(balLockQuantity) > 0)) && (
        <Tooltip title={source === 'source' ? intl.get('sbsm.common.view.message.sourcesLock').d('编制来源单据已锁定，存在新建/已退回状态的单据，详请点击「执行情况」链接查看执行情况') : intl.get('sbsm.common.view.message.stageLock').d('阶段已锁定，存在新建/已退回状态的单据，详请点击「阶段编码」链接查看执行情况')}>
          <Icon type="lock" className={styles['sbsm-table-cell-error-icon']} />
        </Tooltip>
      )}
    </div>
  );
};


export default StatusInfo;
