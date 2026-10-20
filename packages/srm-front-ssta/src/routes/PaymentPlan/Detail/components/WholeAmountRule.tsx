import React, { useContext, useMemo, useEffect } from 'react';
import { Card } from 'choerodon-ui';
import { observer } from 'mobx-react';
import { CheckBox, NumberField, Select } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';
import { DETAIL_CARD_CLASSNAME } from 'utils/constants';

import type { StoreValueType } from '../stores';
import { Store } from '../stores';
import { DetailCustomizeCode } from '../../utils/type';
import EditorForm from '../../../Components/EditorForm';

const getExcessToleranceHelp = (tolControlType) => {
  if (tolControlType === 'AMOUNT') {
    return intl.get('ssta.paymentPlan.view.help.wholeExcessToleranceWithAmount').d('超额允差=付款计划已执行总额-付款计划总额');
  } else if (tolControlType === 'RATIO') {
    return intl.get('ssta.paymentPlan.view.help.wholeExcessToleranceWithRatio').d('超额允差（%）=（付款计划已执行总额-付款计划总额）/付款计划总额 *100%，保留2位小数后，四舍五入');
  }
};

const onRecordUpdate = ({ name, value, record }) => {
  if (name === 'enableFlag') {
    if (Number(value) === 1) {
      record.set({
        excessCheckLevel: 'BAN',
        tolControlType: 'AMOUNT',
        excessTolerance: 0,
      });
    }
    else {
      record.set({
        excessCheckLevel: undefined,
        tolControlType: undefined,
        excessTolerance: undefined,
      });
    }
  }
  if (name === 'tolControlType') record.set('excessTolerance', 0);
};

const WholeRule = observer(() => {
  const {
    editFlag,
    changeFlag,
    customizeForm,
    wholeAmountRuleDs,
  } = useContext<StoreValueType>(Store);

  const editorFlag = editFlag || changeFlag;

  const tolControlType = wholeAmountRuleDs.current?.get('tolControlType');

  useEffect(() => {
    wholeAmountRuleDs.addEventListener('update', onRecordUpdate);
    return () => {
      wholeAmountRuleDs.removeEventListener('update', onRecordUpdate);
    };
  }, [wholeAmountRuleDs]);

  const editorColumns = useMemo(() => {
    return [
      { name: 'enableFlag', editor: CheckBox, renderer: ({ value }) => yesOrNoRender(Number(value)) },
      { name: 'excessCheckLevel', editor: Select, help: intl.get('ssta.paymentPlan.view.help.wholeExcessCheckLevel').d('警告：在预付款、付款页面报错形式为中心弹窗提示，用户可选是否继续提交单据；禁止，在预付款、付款页面报错形式为右下角报错弹窗，禁止继续提交单据') },
      { name: 'tolControlType', editor: Select },
      { name: 'excessTolerance', editor: NumberField, help: getExcessToleranceHelp(tolControlType) },
    ];
  }, [tolControlType]);

  return (
    <Card
      bordered={false}
      className={DETAIL_CARD_CLASSNAME}
      title={intl.get('ssta.paymentPlan.view.title.payPlanExeTotalAmountExcVerRule').d('付款计划已执行总额超额校验规则')}
    >
      <EditorForm
        useWidthPercent
        columns={3}
        useColon={false}
        editorFlag={editorFlag}
        dataSet={wholeAmountRuleDs}
        customizeForm={customizeForm}
        editorColumns={editorColumns}
        customizeOptions={{ code: DetailCustomizeCode.WholeAmountCode, readOnly: !editorFlag }}
      />
    </Card>
  );
});

export default WholeRule;
