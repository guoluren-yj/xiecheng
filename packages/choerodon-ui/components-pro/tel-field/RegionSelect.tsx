import { ReactNode } from 'react';
import { action, runInAction } from 'mobx';
import { observer } from 'mobx-react';
import isObject from 'lodash/isObject';
import omit from 'lodash/omit';
import { Select, SelectProps } from '../select/Select';
import autobind from '../_util/autobind';
import DataSet from '../data-set';
import { DataSetEvents } from '../data-set/enum';

export interface RegionSelectProps extends SelectProps {
  valueField?: string;
}

@observer
export default class RegionSelect extends Select<RegionSelectProps> {
  static displayName = 'RegionSelect';

  static defaultProps = {
    ...Select.defaultProps,
    clearButton: false,
    dropdownMatchSelectWidth: false,
  };

  constructor(props, context) {
    super(props, context);

    const { options, valueField } = props;
    if (options && valueField && !this.getValue()) {
      runInAction(() => {
        this.setValue(this.getValue() || options.length && options.get(0).get(valueField) || '+86');
      });
    }
  }

  getOtherProps() {
    const otherProps = super.getOtherProps();
    return omit(otherProps, ['valueField']);
  }


  componentDidMount() {
    super.componentDidMount();
    this.processDataSetListener(true);
  }

  componentWillUnmount() {
    this.processDataSetListener(false);
  }

  processDataSetListener(flag: boolean) {
    const { options, valueField } = this.props;
    if (options && valueField) {
      const handler = flag ? options.addEventListener : options.removeEventListener;
      handler.call(options, DataSetEvents.load, this.handleDataSetLoad);
    }
  }

  @action
  handleDataSetLoad({ dataSet }: { dataSet: DataSet }) {
    const record = dataSet.get(0);
    if (record) {
      const { valueField } = this.props;
      this.setValue(record.get(valueField));
    }
  }

  @autobind
  reset() {
    const { dataSet } = this;
    if (dataSet) {
      this.handleDataSetLoad({ dataSet });
    }
  }

  @autobind
  processRenderer(value?: any, repeat?: number): ReactNode {
    const {
      record,
      dataSet,
      props: { renderer = this.defaultRenderer, name, maxTagTextLength },
    } = this;
    const text = this.processText(isObject(value) ? value[this.valueField] : value);
    return renderer
      ? renderer({
        value,
        text,
        record,
        dataSet,
        name,
        repeat,
        maxTagTextLength,
      })
      : text;
  }
}
