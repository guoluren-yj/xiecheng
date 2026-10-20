/* eslint-disable no-nested-ternary */
import React, { ReactElement } from 'react';
import { Modal } from 'choerodon-ui/pro';
import intl from 'hzero-front/lib/utils/intl';



export default function openComputeRule(options = {} as any, ComputeRuleImpl) {
  const { readOnly, subModalCommonParams, record, unitInfoFun } = options;
  const { id: unitId, unitCode, unitAlias = [] } = unitInfoFun();
  const relatedParams: any = subModalCommonParams;
  let ruleRef: ReactElement;
  Modal.open({
    title: intl.get('hpfm.individual.view.message.title.virtualConfig').d('计算规则配置'),
    key: Modal.key(),
    style: {
      width: '848px',
    },
    className: "compute-modal-container",
    maskClosable: false,
    children: (
      <ComputeRuleImpl
        onRef={(instance) => {
          ruleRef = instance;
        }}
        readOnly={readOnly}
        relatedParams={relatedParams}
        unitId={unitId}
        unitCode={unitCode}
        unitAlias={unitAlias}
        rule={record.get("renderRule")}
      />
    ),
    footer: (ok, cancel) => [readOnly ? null : ok, cancel],
    onOk: async () => {
      return new Promise<void>((res, rej) => {
        ruleRef.props.form.validateFields((err, values) => {
          if (err) {
            rej();
            return;
          }
          record.set("renderRule", values.renderRule);
          res();
        });
      });
    },
  });
}