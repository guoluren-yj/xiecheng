/* eslint-disable no-nested-ternary */
import React, { createRef } from 'react';
import { Modal } from 'choerodon-ui/pro';
import intl from 'hzero-front/lib/utils/intl';
import RelatedConfig from '../../../../../components/RelatedConfig';

export default function openRelatedConfig(options = {} as any) {
  const { readOnly, record, subModalCommonParams, mode } = options;
  const conditionRef = createRef<RelatedConfig>();
  Modal.open({
    title: intl.get('hpfm.individual.view.message.title.relatedField').d('设置关联字段'),
    key: Modal.key(),
    style: {
      width: '848px',
    },
    maskClosable: false,
    children: (
      <RelatedConfig
        readOnly={readOnly}
        lovViewCode={record.get("widget.sourceCode")}
        ref={conditionRef}
        fieldLovMaps={record.get("fieldLovMaps") || []}
        relatedParams={subModalCommonParams}
        mode={mode}
      />
    ),
    footer: (ok, cancel) => [readOnly ? null : ok, cancel],
    onOk: async () => {
      const innerDs = conditionRef.current!.ds!;
      if (!await innerDs.validate()) return false;
      record.set("fieldLovMaps", innerDs.toJSONData());
    },
  });
}