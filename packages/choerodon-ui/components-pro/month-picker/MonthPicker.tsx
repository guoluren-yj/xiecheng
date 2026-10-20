import { Moment } from 'moment';
import DatePicker from '../date-picker/DatePicker';
import { ViewMode } from '../date-picker/enum';

export default class MonthPicker extends DatePicker {
  static displayName = 'MonthPicker';

  static defaultProps = {
    ...DatePicker.defaultProps,
    mode: ViewMode.month,
  };

  getWrapperClassNames() {
    const { prefixCls } = this;
    return super.getWrapperClassNames(`${prefixCls}-month-picker-wrapper`);
  }

  getLimitWithType(limit: Moment, minOrMax: 'min' | 'max'): Moment {
    if (minOrMax === 'min') {
      return limit.startOf('M');
    }
    return limit.endOf('M');
  }
}
