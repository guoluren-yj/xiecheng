/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2021-11-23 18:59:51
 * @LastEditors: yanglin
 * @LastEditTime: 2022-03-03 15:26:14
 */
import React, { Component } from 'react';
import { DatePicker } from 'hzero-ui';
import intl from 'utils/intl';

const promptCode = 'sodr.demandForecast';

export default class extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isopen: false,
    };
  }

  render() {
    const { isopen } = this.state;
    const { onDateChange, value, form } = this.props;
    const { name } = this.props['data-__field'] || {};
    return (
      <div>
        <DatePicker
          value={value}
          open={isopen}
          showTime={false}
          c7nMode="year"
          mode="year"
          format="YYYY"
          allowClear={false}
          onOpenChange={(status) => {
            if (status) {
              this.setState({ isopen: true });
            } else {
              this.setState({ isopen: false });
            }
          }}
          onChange={(v) => {
            this.setState({
              isopen: false,
            });
            onDateChange(v);
            if (form) {
              form.setFieldsValue({ [name]: v });
            }
          }}
          onPanelChange={(v) => {
            this.setState({
              isopen: false,
            });
            if (form) {
              form.setFieldsValue({ [name]: v });
            }
            onDateChange(v);
          }}
          placeholder={intl.get(`${promptCode}.view.message.model.selectYear`).d('请选择年份')}
        />
      </div>
    );
  }
}
