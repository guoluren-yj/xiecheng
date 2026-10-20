import React, { useMemo, useContext, Fragment } from 'react';
import { IntlField, TextArea, Select, CheckBox, NumberField, SelectBox, Icon, Tooltip } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { observer } from 'mobx-react-lite';
import { yesOrNoRender } from 'utils/renderer';

import { Store } from '../stores';
import type { StoreValueType } from '../stores';
import EditorForm from '../../components/EditorForm';
import { DetailCustomizeCode } from '../../utils/type';
import styles from '../index.less';
import { statusTagRender } from '../../components/StatusTag';

const getCtrlModeOptionHelp = (value: string) => {
  const helpMap = {
    '0': intl.get('smdm.payTermsCtrl.view.help.enableTermFlag0').d('该模式条款不会在订单生效时生成付款计划'),
    '1': intl.get('smdm.payTermsCtrl.view.help.enableTermFlag1').d('该模式条款可自定义付款阶段及管控规则，订单、预付款、付款启用付款计划管控后可按该条款模板生成的付款计划进行付款管控。由于超收允差、价格调整、金额计算公式差异等因素，订单金额与税务发票金额（即实际付款金额）存在允差，注意配置「付款计划已执行总额超额校验规则」或通过【付款计划台账-规则调整】按钮在对应计划执行过程中调整允差范围'),
    '2': intl.get('smdm.payTermsCtrl.view.help.enableTermFlag2').d('该模式条款下的付款计划会对应生成唯一一行阶段，阶段金额默认为订单金额，订单、预付款、付款启用付款计划管控后，可按订单总额管控付款超额。由于超收允差、价格调整、金额计算公式差异等因素，订单金额与税务发票金额（即实际付款金额）存在允差，注意配置「付款计划已执行总额超额校验规则」或通过【付款计划台账-规则调整】按钮在对应计划执行过程中调整允差范围'),
  };
  return helpMap[value];
};

const TermBasic = () => {
  const {
    viewFlag,
    termHeaderDs,
    customizeForm,
  } = useContext<StoreValueType>(Store);

  const { sourceCode, termStatus } = termHeaderDs.current?.get(['sourceCode', 'termStatus']) || {};
  const disabledFlag = sourceCode !== 'SRM';

  const editorColumns = useMemo(() => {
    return [
      { name: 'termNum' },
      { name: 'termName', editor: IntlField },
      'sourceCode',
      'versionNumber',
      { name: 'displayStatus', disabled: true, renderer: viewFlag ? statusTagRender : ({ text }) => text },
      { name: 'defaultFlag', editor: CheckBox, renderer: ({ value }) => yesOrNoRender(Number(value)) },
      { name: 'prepayFlag', editor: CheckBox, renderer: ({ value }) => yesOrNoRender(Number(value)) },
      { name: 'stageFlag', editor: CheckBox, renderer: ({ value }) => yesOrNoRender(Number(value)) },
      { name: 'accountPeriodType', editor: Select, help: intl.get('smdm.payTermsCtrl.view.help.accountPeriodType').d('工作日按星期一到星期五计算，不含法定节假日') },
      { name: 'priority', editor: NumberField },
      ['PUBLISHED', 'DISABLE'].includes(termStatus) && 'publishedByName',
      ['PUBLISHED', 'DISABLE'].includes(termStatus) && 'publishedDate',
      { name: 'termRemark', editor: TextArea, newLine: true, colSpan: 2 },
      {
        name: 'enableTermFlag',
        editor: SelectBox,
        newLine: true,
        colSpan: 3,
        showHelp: 'label',
        optionRenderer: ({ text, value }) => {
          const help = getCtrlModeOptionHelp(value);
          return (
            <Fragment>
              <span>{text}</span>
              <Tooltip title={help}>
                <Icon type="help" className={styles['smdm-payTermsCtrl-option-help']} />
              </Tooltip>
            </Fragment>
          );
        },
      },
    ];
  }, [viewFlag, termStatus]);

  return (
    <EditorForm
      useWidthPercent
      columns={3}
      useColon={false}
      dataSet={termHeaderDs}
      editorFlag={!viewFlag}
      disabledFlag={disabledFlag}
      customizeForm={customizeForm}
      editorColumns={editorColumns}
      customizeOptions={{ code: DetailCustomizeCode.BasicFormCode, readOnly: viewFlag }}
    />
  );
};


export default observer(TermBasic);