import React, { useState, useContext, useCallback, useEffect, useMemo } from 'react';
import { Form, Output, Table, Attachment } from 'choerodon-ui/pro';
import { yesOrNoRender } from 'utils/renderer';
import { getResponse } from 'hzero-front/lib/utils/utils';
import { observer } from 'mobx-react-lite';

import { queryParamsAll } from '@/services/priceModelService';
import { numberSeparatorRender } from '@/utils/renderer';

import { codeTransfer } from '../../../utils/utils';
import Store from '../store/index';

const CountFormula = () => {
  const {
    commonDs: { headerDs, priceLibTableDs },
    routerParams: { modelId },
  } = useContext(Store);

  const [paramList, setParamList] = useState([]);

  useEffect(() => {
    init();
  }, []);

  const init = () => {
    queryParamsAll({ modelId }).then((res) => {
      const result = getResponse(res);
      if (result) {
        setParamList(result);
      }
    });
  };

  // 计算公式预览
  const handlePreviewFormula = useCallback(() => {
    if (!headerDs.current) return;
    const calculateFormula = headerDs.current.get('calculateFormula') || '';
    return codeTransfer(calculateFormula, paramList);
  }, [headerDs.current?.get('calculateFormula'), paramList]);

  const columns = useMemo(() => {
    return [
      {
        name: 'dimensionName',
        width: 150,
      },
      {
        name: 'dimensionCode',
        width: 150,
      },
      {
        name: 'fieldRequired',
        width: 100,
        renderer: ({ value }) => yesOrNoRender(value),
      },
      {
        name: 'fieldWidgetMeaning',
        width: 120,
      },
      {
        name: 'sourceCode',
        width: 180,
      },
      {
        name: 'writeLogic',
        width: 150,
      },
      {
        name: 'logicDetail',
        width: 200,
        renderer: ({ record, value }) => {
          const { fieldWidget, logicDetailMeaning, writeLogic, dimensionCode } = record.get([
            'fieldWidget',
            'logicDetailMeaning',
            'writeLogic',
            'dimensionCode',
          ]);
          if (writeLogic === 'DEFAULT') {
            if (fieldWidget === 'SELECT' || fieldWidget === 'LOV') {
              return logicDetailMeaning;
            } else if (fieldWidget === 'SWITCH') {
              return yesOrNoRender(Number(value));
            } else if (fieldWidget === 'UPLOAD') {
              return <Attachment name="logicDetail" record={record} readOnly viewMode="popup" />;
            } else if (fieldWidget === 'INPUT_NUMBER') {
              // 含税单价未税单价，千分位分割
              return [
                'taxIncludedPrice',
                'netPrice',
                'perTaxIncludedPrice',
                'perNetPrice',
              ].includes(dimensionCode)
                ? numberSeparatorRender(value)
                : value;
            }
            return value;
          }
          return value;
        },
      },
    ];
  }, []);

  return (
    <>
      <div
        style={{ fontWeight: 600 }}
        dangerouslySetInnerHTML={{ __html: handlePreviewFormula() }}
      />
      <div className="card-content-form">
        <Form
          dataSet={headerDs}
          columns={3}
          labelLayout="vertical"
          labelAlign="left"
          className="c7n-pro-vertical-form-display"
          style={{ marginTop: '32px', marginBottom: '12px' }}
        >
          <Output name="targetPriceTemplateCodeMeaning" />
        </Form>
      </div>
      <Table
        dataSet={priceLibTableDs}
        columns={columns}
        style={{ maxHeight: '430px' }}
        customizable
        customizedCode="SRC.PRICE_MODEL.DETAIL.PRICE_LIBRARY"
      />
    </>
  );
};
export default observer(CountFormula);
