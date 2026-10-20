import React, { memo } from 'react';
import { observer } from 'mobx-react-lite';

import PriceClarificationButtons from '@/routes/sbid/ExpertScoring/Update/PriceClarificationButtons';

export default memo(
  observer((props) => {
    const { basicInfoDs, ...rest } = props;
    const { current } = basicInfoDs;
    const priceRepliedCount = current?.get('priceRepliedCount');
    const newProps = {
      ...rest,
      priceRepliedCount,
    };
    return <PriceClarificationButtons {...newProps} />;
  })
);
