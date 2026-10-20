import React, { useContext, useMemo, useEffect, useCallback } from 'react';
import { observer } from 'mobx-react';
import { DataSet, Output, Lov } from 'choerodon-ui/pro';
// import notification from 'utils/notification';

import EditorForm from '../../../Components/EditorForm';
import { Store } from '../Detail/stores';
import { computationDS } from '../Detail/stores/mainDS';
import { setNewColumnsProps } from '../../../utils';

const Computation = observer((props) => {
  const { modal } = props;
  const { ruleDs, configFieldsArr } = useContext(Store);
  const { ruleId, cumulativeRule, calculateTaxRateType, sourceFieldLabel, cumulativeNature } = ruleDs.current?.get(['ruleId', 'cumulativeRule', 'calculateTaxRateType', 'sourceFieldLabel', 'cumulativeNature']);
  const showGift = useMemo(() => {
    return ['GIFT'].includes(cumulativeRule) || (cumulativeRule === 'FIXED_REBATES' && sourceFieldLabel === 'QUANTITY') || (cumulativeRule === 'LADDER_REBATES' && cumulativeNature === 'REACH_VOLUME');
  }, [cumulativeRule, sourceFieldLabel, cumulativeNature]);
  const showRate = useMemo(() => {
    return ['COMMODITY_TAX_RATE'].includes(calculateTaxRateType) || ((cumulativeRule === 'FIXED_REBATES' && sourceFieldLabel === 'QUANTITY') || (cumulativeRule === 'LADDER_REBATES' && cumulativeNature === 'REACH_VOLUME')) && !['FIXED_TAX_RATE'].includes(calculateTaxRateType);
  }, [calculateTaxRateType, cumulativeRule, sourceFieldLabel, cumulativeNature]);

  const computationDs = useMemo(() => new DataSet(computationDS(showGift, showRate)), [showGift, showRate]);
  const { simulationFailedReason } = computationDs.current?.get(['simulationFailedReason']) || {};

  const editorColumns = useMemo(() => {
    const colums: any = [
      {
        name: 'simulationBaseValue',
      },
      showGift && {
        name: 'simulationGiftPrice',
      },
      showRate && {
        name: 'simulationBaseRateLov',
        editor: Lov,
      },
      {
        name: 'simulationTaxIncludedAmount',
      },
      simulationFailedReason && {
        name: 'simulationFailedReason',
        editor: Output,
        renderer: ({ value }) => <span style={{color: 'red'}}>{value}</span>,
      },
    ].filter((v) => v);
    return setNewColumnsProps(colums, computationDs, configFieldsArr);
  }, [simulationFailedReason, showRate, showGift, configFieldsArr, computationDs]);

  const handleOk = useCallback(async () => {
    if (computationDs.current) computationDs.current.set('simulationFailedReason', '');
    const res = await computationDs.submit();
    if (!res) return false;
    const { content } = res || {};
    const { simulationFailedReason, errorFlag, simulationTaxIncludedAmount } = content[0] || {};
    if (computationDs.current) {
      computationDs.current.set('simulationTaxIncludedAmount', simulationTaxIncludedAmount);
      if (errorFlag) computationDs.current.set('simulationFailedReason', simulationFailedReason);
    }
    return false;
  }, [computationDs]);

  useEffect(() => {
    if(computationDs) computationDs.create({ ruleId });
  }, [computationDs, ruleId]);

  useEffect(() => {
    modal.handleOk(handleOk);
  }, [handleOk, modal]);
  return (
    <EditorForm
      dataSet={computationDs}
      useColon={false}
      columns={1}
      editorFlag
      editorColumns={editorColumns}
    />
  );
});

export default Computation;
