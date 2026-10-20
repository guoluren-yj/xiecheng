import React, { useState } from 'react';
import { Row, Col, Icon } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import LabelPreview, { AutoLabel } from './LabelPreview';

export default function LabelContainer(props) {
  const [expand, setExpand] = useState(false);
  const {
    labels,
    isLimit = true,
    limitLine = 4,
    lineCount = 1,
    aggregation = true,
    labelWidth,
    name = '',
  } = props;
  const labelList = labels || [];
  const maxCount = limitLine * lineCount;
  const maxLength = !isLimit || expand ? labelList.length : maxCount;
  const colSpan = 24 / lineCount;
  const showLabels = labelList.slice(0, maxLength);
  if (!aggregation) {
    return labelList.map((m) => (
      <AutoLabel value={m[name]} tooltip={false} wrapperStyle={{ display: 'inline-block' }} />
    ));
  }
  const defaultLabel = (
    <Row gutter={2}>
      {showLabels.map((l) => (
        <Col span={colSpan}>
          <LabelPreview value={l.labelName} />
          111
        </Col>
      ))}
    </Row>
  );

  const autoLabel = showLabels.map((m) => <AutoLabel value={m[name]} />);
  return (
    <div>
      {labelWidth === 'auto' ? autoLabel : defaultLabel}
      {isLimit && labelList.length > maxCount && (
        <div>
          <a
            onClick={() => {
              setExpand(!expand);
            }}
          >
            {expand
              ? intl.get('smpc.product.button.collapse').d('收起')
              : intl.get('smpc.product.button.expand').d('展开')}
            <Icon
              type={expand ? 'expand_less' : 'expand_more'}
              style={{ marginTop: -4, fontSize: '16px' }}
            />
          </a>
        </div>
      )}
    </div>
  );
}
