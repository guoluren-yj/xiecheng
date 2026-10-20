/**
 * 默认值
 */
import React from 'react';
import { isEmpty } from 'lodash';
import { observer } from 'mobx-react-lite';
import { Badge } from 'choerodon-ui';
import {
  TextField,
  Select,
  NumberField,
  Lov,
  DatePicker,
  Switch,
  Modal,
  Output,
} from 'choerodon-ui/pro';
import intl from 'hzero-front/lib/utils/intl';
import ExpressionConfig from './ExpressionConfig';

function openExpressConfigModal({dataSet, record, dimensionType, templateId}) {
  Modal.open({
    title: intl.get('small.common.button.expressionConfig').d('公式配置'),
    style: {
      width: 1000,
    },
    children: <ExpressionConfig dataSet={dataSet} fxRecord={record} dimensionType={dimensionType} templateId={templateId} />,
  });
}

export default function DefaultComponent({
  isDefault,
  ds,
  fxComponent,
  disabled,
  record,
  dimensionType,
  templateId,
  readOnly,
}) {
  const { componentType, defaultType, proDefaultFlag } =
    ds?.current?.get(['componentType', 'defaultType', 'proDefaultFlag']) || {};

  const prop = {
    name: 'defaultValue_component',
    addonAfter: fxComponent && defaultType !== 1 && fxComponent('DEFAULT', disabled, true),
    // colSpan: 1,
    className: 'default-value-com',
  };
  let component = null;
  switch (componentType) {
    case 'INPUT_NUMBER':
      component = <NumberField {...prop} />;
      break;
    case 'SELECT':
      component = <Select {...prop} />;
      break;
    case 'LOV':
      prop.name = 'defaultValue_LOV';
      component = <Lov noCache {...prop} />;
      break;
    case 'DATE_PICKER':
      component = <DatePicker {...prop} useInvalidDate={false} />;
      break;
    case 'SWITCH':
      prop.style = {
        width: 50,
      };
      component = <Switch {...prop} />;
      break;
    default:
      component = <TextField {...prop} />;
  }
  // 特殊默认适配器
  if (defaultType === 1) {
    component = readOnly ? (
      <Output name="specialDefaultValue" />
    ) : (
      <Select name="specialDefaultValue" />
    );
    return isDefault && component;
  } else if (proDefaultFlag === 'FORMULA' && componentType === 'DATE_PICKER') {
    const formulaCondition = (record || ds.current)?.get('formulaCondition') || {};
    component = (
      <div className="default-value-com">
        <Badge dot={!isEmpty(formulaCondition.conditionLineList)}>
          <a
            onClick={() =>
              openExpressConfigModal({ dataSet: ds, record, disabled, dimensionType, templateId })
            }
          >
            {intl.get('small.common.button.expressionConfig').d('公式配置')}
          </a>
        </Badge>
        {fxComponent && <a style={{ marginLeft: 8 }}>{fxComponent('DEFAULT', disabled, true)}</a>}
      </div>
    );
    return isDefault && component;
  }
  return (
    isDefault &&
    (readOnly ? (
      <Output
        name="defaultValue"
        renderer={({ text }) => (
          <span>
            {text || '-'}
            <span style={{ paddingLeft: 8 }}>{prop.addonAfter}</span>
          </span>
        )}
      />
    ) : (
      component
    ))
  );
}
