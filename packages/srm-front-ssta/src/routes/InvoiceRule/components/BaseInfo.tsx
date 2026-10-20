import React, { useMemo, useCallback } from 'react';
import { observer } from 'mobx-react';
import type { DataSet } from 'choerodon-ui/pro';
import { CheckBox } from 'choerodon-ui/pro';
import { Select } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';

import EditorForm from '../../Components/EditorForm';
import { statusTagRender } from '../../Components/StatusTag';

interface BaseInfoProps {
  formDs: DataSet;
  loading: boolean;
  isView: boolean;
}

const BaseInfo = observer((props: BaseInfoProps) => {
  const { formDs, isView } = props;

  // 适用票种改变时
  const changeScopeInvoiceType = useCallback(() => {
    // eslint-disable-next-line no-unused-expressions
    formDs.current?.set('defaultInvoiceType', undefined);
  }, [formDs]);

  const baseColumns = useMemo(() => {
    return [
      'ruleNum',
      { name: 'ruleName' },
      {
        name: 'displayStatus',
        renderer: isView ? statusTagRender : ({ text }) => text,
      },
      'versionNumber',
      'publishedByName',
      'publishedDate',
      {
        name: 'scopeInvoiceType',
        editor: Select,
        onChange: changeScopeInvoiceType,
        help: intl
          .get('ssta.invoiceRule.view.help.scopeInvoiceType')
          .d(
            '控制本开票规则可应用的发票类型；配置时，注意与【业务规则定义--直连开票-开票规则映射】结合，保证业务场景正常流转'
          ),
        colSpan: 2,
      },
      {
        name: 'previewFlag',
        editor: CheckBox,
        help: intl
          .get('ssta.invoiceRule.view.help.previewFlag')
          .d(
            '启用后，在用户创建发票申请单，系统自动生成开票申请单后，开票申请单将不会自动提交，需用户确认后手工提交至第三方服务商开票'
          ),
        renderer: ({ value }) => yesOrNoRender(value),
      },
    ];
  }, [changeScopeInvoiceType, isView]);

  return (
    <div className="strategy-panel-wrapper">
      <EditorForm
        useWidthPercent
        columns={3}
        useColon={false}
        dataSet={formDs}
        editorFlag={!isView}
        editorColumns={baseColumns}
      />
    </div>
  );
});

export default BaseInfo;