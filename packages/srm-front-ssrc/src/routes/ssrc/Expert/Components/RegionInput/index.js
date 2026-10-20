import React from 'react';
import { Bind } from 'lodash-decorators';
import { last, isEmpty } from 'lodash';
import { Input, Cascader, Icon } from 'hzero-ui';

import { loadProvinceCityData } from '@/services/expertService';

import { dealProvinceData, dealCityRegionData } from '../../utils/utils';

export default class RegionInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      cityData: [], // 省市数据
    };
  }

  @Bind()
  handleCascader(record, config, inputDisabled) {
    const { cityData = [] } = this.state;
    const {
      form: { getFieldValue },
    } = this.props;
    const countryId = getFieldValue('countryId');
    return (
      <Cascader
        // className={styles['registlnform-cascader']}
        onClick={() => this.fetchProvinceCity(countryId, inputDisabled)}
        changeOnSelect
        showSearch={false}
        style={{ width: '100%' }}
        placeholder=""
        fieldNames={{ label: 'regionName', value: 'regionId' }}
        options={cityData || []}
        onChange={(value, selectedOptions) =>
          this.handleSelectRegion(value, selectedOptions, record)
        }
        loadData={this.handleQueryCity}
        disabled={inputDisabled}
      >
        <Icon type="down" />
      </Cascader>
    );
  }

  /**
   * 选择地区拼接
   */
  @Bind()
  handleSelectRegion(value = [], selectedOptions = []) {
    const {
      form: { setFieldsValue },
    } = this.props;
    const regionList = selectedOptions.map((region) => {
      const { regionName } = region;
      return regionName;
    });
    const region = regionList.join('|');
    const lastRecord = last(selectedOptions);
    const { isLeaf } = lastRecord || {};
    setFieldsValue({
      provinceId:
        value.length > 0 && value.length === 2 ? value[value.length - 2] : value[value.length - 1],
      cityId: value.length === 2 ? value[value.length - 1] : null,
      provinceCityName: region,
      isLeaf,
    });
  }

  /**
   *  查询地址列表
   */
  @Bind()
  fetchProvinceCity(value, inputDisabled) {
    if (inputDisabled) return;
    this.setState(
      {
        cityData: [],
      },
      () => {
        loadProvinceCityData({ countryId: value }).then((res) => {
          if (res && !res.failed) {
            const result = dealProvinceData(res);
            this.setState({
              cityData: result,
            });
          }
        });
      }
    );
  }

  /**
   * 地区级联下拉框动态加载数据
   */
  @Bind()
  handleQueryCity(selectedOptions) {
    const lastOption = selectedOptions[selectedOptions.length - 1] || [];
    const { regionId, countryId } = lastOption;
    lastOption.loading = true;
    loadProvinceCityData({ countryId, regionId }).then((res) => {
      if (res && !res.failed) {
        const result = dealCityRegionData(res);
        if (result) {
          const { cityData } = this.state;
          lastOption.loading = false;
          // 是否是最后一级地区
          if (!isEmpty(res)) {
            lastOption.children = result;
          }
          this.setState({
            cityData: [...cityData],
          });
        }
      }
    });
  }

  render() {
    const { form = {}, disabled, formData, ...otherProps } = this.props;
    const { getFieldDecorator } = form;
    const newInputProps = {
      style: {
        verticalAlign: 'middle',
        position: 'relative',
        top: '-1px',
      },
      readOnly: true,
      disabled,
      ...otherProps,
    };

    newInputProps.addonAfter = this.handleCascader(formData, [], disabled);
    getFieldDecorator('provinceId', {
      initialValue: formData.provinceId,
    });
    getFieldDecorator('cityId', {
      initialValue: formData.cityId,
    });
    getFieldDecorator('isLeaf', {
      initialValue: true,
    });
    getFieldDecorator('countryCode', {
      initialValue: formData.countryCode,
    });
    return <Input {...newInputProps} />;
  }
}
