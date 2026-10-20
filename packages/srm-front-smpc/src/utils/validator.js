import { math } from 'choerodon-ui/dataset';
import intl from 'utils/intl';

export function maxSMPCMessageValidator(val) {
  if (math.gte(val, '100000000000000000000')) {
    return intl.get('smpc.product.view.maxMessage').d('值必须小于100000000000000000000');
  }
}
