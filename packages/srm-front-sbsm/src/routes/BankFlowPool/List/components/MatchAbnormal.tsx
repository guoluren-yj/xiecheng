import React, { useMemo, useEffect, useCallback } from 'react';
import { Card } from 'choerodon-ui';
import { DETAIL_CARD_CLASSNAME } from 'utils/constants';
import intl from 'utils/intl';
import { DataSet } from 'choerodon-ui/pro';

import { observer } from 'mobx-react';

import RefundFlowInfo from './RefundFlowInfo';
import MatchExpendFlowInfo from './MatchExpendFlowInfo';
import { matchExpendFlowInfoDS } from '../stores/listDS';
import { MatchExpendFlowListCode } from '../../utils/type';

const MatchAbnormal = (props) => {
  const { abnormalRecord, modal, currentListDs, readOnly } = props;
  const serialId = abnormalRecord?.get('serialId');

  const matchExpendFlowInfoDs = useMemo(() => new DataSet(matchExpendFlowInfoDS({serialId, customizeUnitCode: MatchExpendFlowListCode}, 'matchExpend', abnormalRecord, readOnly)), [serialId, abnormalRecord, readOnly]);
  const cardList = useMemo(() => {
    return [{
      title: intl.get(`sbsm.bankFlow.model.bankFlow.refundFlowInfo`).d('退票收款流水信息'),
      content: <RefundFlowInfo readOnly={readOnly} abnormalRecord={abnormalRecord} />,
    }, {
      title: intl.get(`sbsm.bankFlow.model.bankFlow.matchExpendFlowInfo`).d('匹配支出流水信息'),
      content: <MatchExpendFlowInfo readOnly={readOnly} abnormalRecord={abnormalRecord} matchExpendFlowInfoDs={matchExpendFlowInfoDs} />,
    }];
  }, [matchExpendFlowInfoDs, abnormalRecord, readOnly]);

   const handleSave = useCallback(async() => {
    const abnormalData = abnormalRecord?.toData();
    const res = matchExpendFlowInfoDs.setState('abnormalData', abnormalData).submit();
    if (!res) return false;
    currentListDs.query();
    modal.close();
  }, [modal, matchExpendFlowInfoDs, abnormalRecord, currentListDs]);

  useEffect(() => {
    modal.handleOk(handleSave);
  }, [modal, handleSave]);

  return (
    <div>
      {
        cardList.map((item) => {
          const { title, content } = item;
          return (
            <Card
              bordered={false}
              className={DETAIL_CARD_CLASSNAME}
              title={title}
            >
              {content}
            </Card>
          );
        })
      }
    </div>
  );
};


export default observer(MatchAbnormal);
