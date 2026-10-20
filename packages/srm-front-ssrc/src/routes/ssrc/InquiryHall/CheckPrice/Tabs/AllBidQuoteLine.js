import { memo } from 'react';
import { compose } from 'lodash';
import { observer } from 'mobx-react';

import { AllQuoteLine } from './AllQuoteLine';

export default compose(memo, observer)(AllQuoteLine);
