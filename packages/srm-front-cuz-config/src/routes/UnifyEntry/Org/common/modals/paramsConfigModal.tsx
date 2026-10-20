/* eslint-disable no-nested-ternary */
import React, { createRef } from 'react';
import { Modal } from 'choerodon-ui/pro';
import intl from 'hzero-front/lib/utils/intl';
import styles from "../../../style.less";

export default function openParamsConfig(options = {} as any, ParamsConfigImpl) {
  const { readOnly, subModalCommonParams, record, unitInfoFun } = options;
  const { id: unitId } = unitInfoFun();
  const relatedParams: any = subModalCommonParams;
  const conditionRef = createRef<any>();
  Modal.open({
    title: intl.get('hpfm.individual.view.message.title.valueParamsConfig').d('值集参数配置'),
    key: Modal.key(),
    style: {
      width: '848px',
    },
    maskClosable: false,
    className: styles["table-cell-no-overflow-fix"],
    children: (
      <ParamsConfigImpl
        readOnly={readOnly}
        relatedParams={relatedParams}
        ref={conditionRef}
        paramList={record.get("paramList") || []}
        unitId={unitId}
      />
    ),
    footer: (ok, cancel) => [readOnly ? null : ok, cancel],
    onOk: async () => {
      const innerDs = conditionRef.current!.ds!;
      if (!await innerDs.validate()) return false;
      const sourceType = record.get("widget.fieldWidget") || "DEFAULT";
      const data = innerDs.toJSONData().map(d => {
        // eslint-disable-next-line no-param-reassign
        d.sourceType = sourceType;
        return d;
      });
      record.set("paramList", data);
    },
  });
}
