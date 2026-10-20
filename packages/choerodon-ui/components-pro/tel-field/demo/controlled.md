---
order: 1
title:
  zh-CN: 受控电话输入框
  en-US: Controlled TelField
---

## zh-CN

受控电话输入框

## en-US

Controlled TelField

````jsx
import { Row, Col, TelField } from 'choerodon-ui/pro';

const regionOptions = [
  {
    regionCode: '+86',
    pattern: /^1[3-9]\d{9}$/,
    regionName: '中国大陆',
  },
  {
    regionCode: '+886',
    pattern: /^1[3-9]\d{9}$/,
    regionName: '中国台湾',
  },
  {
    regionCode: '+852',
    pattern: /^1[3-9]\d{9}$/,
    regionName: '中国香港',
  }
];

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: '',
      region: regionOptions[2],
    };
  }

  handleChange = (value, oldValue) => {
    console.log('[newValue]', value, '[oldValue]', oldValue);
    this.setState({
      value,
    });
  }

  handleRegionChange = (region) => {
    console.log('[newRegion]', region);
    this.setState({
      region,
    });
  }

  handleInput = (e) => {
    console.log('[input]', e.target.value);
  }

  render() {
    const { value, region } = this.state;
    return (
      <TelField 
        placeholder="请输入手机号"
        value={value} 
        regionField={region.regionCode} 
        pattern={region.pattern} 
        regionOptions={regionOptions} 
        onChange={this.handleChange} 
        onRegionChange={this.handleRegionChange}
        onInput={this.handleInput} 
      />
    );
  }
}

ReactDOM.render(
  <App />,
  mountNode
);
````
