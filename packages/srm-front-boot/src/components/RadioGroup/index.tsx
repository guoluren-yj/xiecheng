import React from 'react';
import { isString, isNil } from 'lodash';
import type { RadioChangeEvent } from 'choerodon-ui/lib/radio';
import { queryUnifyIdpValue } from 'hzero-front/lib/services/api';
import { Radio } from 'choerodon-ui';

const RadioGroup = Radio.Group;

export default class RadioGroupBox extends React.Component<{
  // eslint-disable-next-line no-unused-vars
  onChange: (e: RadioChangeEvent) => void;
  lovCode?: string;
  options?: string[] | Array<{ label: string, value: string, disabled?: boolean }>
  name?: string;
  value?: string | number;
  params?: any;
  mode?: 'default' | 'text';
  disabled?: boolean;
  valueField?: string;
  displayField?: string;
  /** 是否将通过lovCode查出的options转换为数字类型 */
  optionValueToNum?: boolean;
  defaultValue?: string | number;
}> {

  state: {
    options: string | any[];
    loading: boolean;
  } = {
    options: 'loading',
    loading: false,
  };

  cacheKey: string = 'default';

  notValueData?: boolean;

  constructor(props) {
    super(props);
    if (!(window as any).CUSTOMIZECACHE) {
      (window as any).CUSTOMIZECACHE = {};
    }
    if (props.options) {
      this.notValueData = true;
    }
  }

  componentDidMount() {
    const { lovCode, params = {} } = this.props;
    if (this.notValueData) return;
    const updateTriggers = [lovCode].concat(Object.keys(params), Object.values(params)).join(',');
    this.cacheKey = updateTriggers;
    this.setOptions();
  }

  componentDidUpdate(prevProps) {
    const { lovCode: lovCode1, params: params1 = {} } = prevProps;
    const { lovCode, params = {} } = this.props;
    if (this.notValueData) return;
    const updateTriggers = [lovCode].concat(Object.keys(params), Object.values(params)).join(',');
    const oldUpdateTriggers = [lovCode1].concat(Object.keys(params1), Object.values(params1)).join(',');
    if (updateTriggers !== oldUpdateTriggers) {
      this.cacheKey = updateTriggers;
      this.setOptions();
    }
  }

  setOptions = () => {
    const { lovCode, params, optionValueToNum, valueField = 'value', displayField = 'meaning' } = this.props;
    if (!lovCode) return;
    const cache = (window as any).CUSTOMIZECACHE;
    const cacheOptions = lovCode && (cache[lovCode] || {})[this.cacheKey];
    if (!cacheOptions) {
      this.setState({ loading: true });
      if (!(window as any).CUSTOMIZECACHE[lovCode]) {
        (window as any).CUSTOMIZECACHE[lovCode] = {};
      }
      (window as any).CUSTOMIZECACHE[lovCode][this.cacheKey] = new Promise((r, rej) => {
        queryUnifyIdpValue(lovCode, params)
          .then((res: any = {}) => {
            const options = (!res.failed && res) || [];
            this.setState({ options: options.map(i => ({ value: optionValueToNum ? Number(i.value) : i[valueField], label: i[displayField] })) });
            r(options);
          }, () => {
            rej();
          })
          .catch(() => {
            rej();
          })
          .finally(() => {
            this.setState({ loading: false });
          });
      });
    } else if (cacheOptions instanceof Promise) {
      cacheOptions.then(options => {
        this.setState({ options: options.map(i => ({ value: optionValueToNum ? Number(i.value) : i[valueField], label: i[displayField] })) });
      });
    }
  };

  onChange = (e: RadioChangeEvent) => {
    const { onChange: parentOnChange, optionValueToNum } = this.props;
    if (parentOnChange) {
      parentOnChange(optionValueToNum ? Number(e.target.value) : e.target.value);
    }
  };

  render() {
    const { options: stateOptions, loading } = this.state;
    let { value, defaultValue } = this.props;
    const { options = stateOptions, name, disabled, optionValueToNum, mode = 'default' } = this.props;
    if (loading || isString(options)) {
      return (
        <span style={{ color: '#999' }}>Loading</span>
      );
    }
    if (optionValueToNum) {
      value = isNil(value) ? undefined : Number(value);
      defaultValue = isNil(defaultValue) ? undefined : Number(defaultValue);
    }
    if (mode === 'text') {
      // eslint-disable-next-line eqeqeq
      const curValue = options.find(({ value: v }) => v == value);
      return curValue && (curValue.label || curValue.value) || null;
    }
    return (
      <RadioGroup onChange={this.onChange} options={options} value={value} defaultValue={defaultValue} name={name} disabled={disabled} />
    );
  }
}
