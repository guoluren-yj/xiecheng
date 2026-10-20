import React, { Component, Fragment } from 'react';
import { DataSet, Spin } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
// import { observer } from 'mobx-react-lite';

// import intl from 'utils/intl';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import { queryUnifyIdpValue } from 'services/api';

import { fetchInfo } from './api';
import AuthorityInfo from './AuthorityInfo';
import AuthorityRange from './AuthorityRange';
import { formDs, tableDs } from './initDs';

// 预定义维度
const preDimensions = [
  { code: 'SKU', type: 'SKU' },
  { code: 'CATALOG', type: 'SKU' },
  { code: 'PRICE_RANGE', type: 'SKU' },
  { code: 'SUPPLIER', type: 'SKU' },
  { code: 'DIRECTORY', type: 'SKU' },
  { code: 'ORG', type: 'USER' },
  { code: 'ROLE', type: 'USER' },
  { code: 'USER', type: 'USER' },
  { code: 'AREA', type: 'USER' },
  { code: 'MEMBER', type: 'USER' },
  { code: 'MEMBER_LABEL', type: 'USER' },
  { code: 'SKU_LABEL', type: 'SKU' },
  { code: 'COMMODITY_SOURCE', type: 'SKU' },
];

export default class Detail extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      dimensionCodes: [],
      allUserEnable: false,
      allSkuEnable: false,
      isExcludeSku: false,
      isExcludeUser: false,
      exCludeSubAccount: [],
      // categoryFlatData: [],
    };
  }

  organizationId = getCurrentOrganizationId();

  initDs = new DataSet(formDs());

  userDs = new DataSet(tableDs('user'));

  skuDs = new DataSet(tableDs('sku'));

  componentDidMount() {
    this.fetchCode();
    this.fetchData();
  }

  @Bind
  async fetchCode() {
    const res = getResponse(await queryUnifyIdpValue('SAGM.AUTH_CUSTOMIZE_DIMENSION'));
    if (res) {
      this.setState({ dimensionCodes: res }, () => {
        const ds = this.initDs.toData();
        const data = ds[0] || {};
        if (data.authorityListId) {
          this.initData(data);
        }
      });
    }
  }

  @Bind
  async fetchData() {
    const { queryParams } = this.props;
    this.setState({ loading: true });
    const res = await fetchInfo(queryParams);
    this.setState({ loading: false });
    const result = getResponse(res);
    if (result) {
      this.initData(result);
    }
  }

  @Bind
  initData(data = {}) {
    const { authRangeDTOS = [], allUserEnable, allSkuEnable } = data;

    // 重置
    this.initDs.loadData([]);
    this.userDs.loadData([]);
    this.skuDs.loadData([]);

    this.initDs.create(data);
    const isExcludeSku = authRangeDTOS?.some((s) => s.authDimension === 'SKU_EXCLUDE');
    const isExcludeUser = authRangeDTOS?.some((s) => s.authDimension === 'USER_EXCLUDE');
    const dimensions = (authRangeDTOS || []).filter(
      (f) => !['SKU_EXCLUDE', 'USER_EXCLUDE'].includes(f.authDimension)
    );
    const excludeUser = (authRangeDTOS || []).find((f) => f.authDimension === 'USER_EXCLUDE') || {};
    dimensions.forEach((f) => {
      const line = this.getDimensionLine(f);
      if (!allUserEnable && f.type === 'USER') {
        this.userDs.create(line);
      }
      if (!allSkuEnable && f.type === 'SKU') {
        this.skuDs.create(line);
      }
    });
    this.updateDsFieldProps(this.userDs);
    this.updateDsFieldProps(this.skuDs);
    this.setState({
      allUserEnable,
      allSkuEnable,
      isExcludeSku,
      isExcludeUser,
      exCludeSubAccount: excludeUser.data,
    });
  }

  getDimensionLine = (line) => {
    const { dimensionCodes } = this.state;
    const customDimension = this.getDimensionIsCustom(line.authDimension);
    let customSelect;
    let customDimensions;
    let columns;
    if (customDimension) {
      const { valueType, componentType } = customDimension;
      customDimensions = line.data;
      if (componentType === 'SELECT' && customDimensions) {
        customSelect = customDimensions.map((m) => m[`data${valueType}`]);
      }
      if (componentType === 'LOV' && customDimensions) {
        const { displayField, valueField, tableFields = [] } = line.lovViewDTO || {};
        customDimensions = customDimensions.map((m) => {
          const { lovValueDTO, [`data${valueType}`]: dataValue, ...other } = m;
          const { value, meaning, metadata } = lovValueDTO || {};
          const fieldValue = dataValue || (metadata ? metadata[valueField] : value);
          const fieldText = metadata ? metadata[displayField] : meaning;
          return {
            ...other,
            ...(metadata || {}),
            [valueField]: fieldValue,
            [displayField]: fieldText,
            [`data${valueType}`]: dataValue,
          };
        });
        columns = tableFields;
      }
    }
    const { dimensionName } =
      dimensionCodes.find((f) => f.dimensionCode === line.authDimension) || {};
    return {
      dimension: { value: line.authDimension, meaning: dimensionName || line.authDimensionMeaning },
      dimensionCode: line.authDimension,
      [line.authDimension]: !customDimension ? line.data : null,
      customSelect,
      customDimension: customDimensions,
      hasSku: line.authDimension === 'SKU' ? 1 : 0,
      columns,
      _status: 'update',
    };
  };

  initCustomFields = (code, record) => {
    const preField = record.getField(code);
    const customLovField = record.getField('customDimension');
    const customSelectField = record.getField('customSelect');
    if (preField) {
      preField.reset();
    }
    customLovField.reset(); // 重置属性
    customSelectField.reset(); // 重置属性
    // 值存在同时不属于预定义维度
    const customDimension = this.getDimensionIsCustom(code);
    if (code && customDimension) {
      // 获取自定义的维度
      if (customDimension.componentType === 'LOV') {
        customLovField.set('required', true);
        customLovField.set('lovCode', customDimension.lovCode);
        customLovField.set('label', customDimension.dimensionName);
      } else {
        customSelectField.set('required', true);
        customSelectField.set('lookupCode', customDimension.lovCode);
        customSelectField.set('label', customDimension.dimensionName);
      }
      record.setState('customDimension', customDimension);
    } else {
      record.setState('customDimension', undefined);
    }
  };

  updateDsFieldProps = (ds) => {
    ds.forEach((record) => {
      const code = record.get('dimensionCode');
      this.initCustomFields(code, record);
    });
  };

  // 维度是否为自定义维度
  getDimensionIsCustom = (code) => {
    const { dimensionCodes } = this.state;
    const preFlag = preDimensions.some((s) => s.code === code);
    const isDimensionPlat = dimensionCodes.some(
      (s) => s.dimensionCode === code && (s.tenantId === 0 || s.tenantId === '0')
    );
    const isPre = preFlag && isDimensionPlat;
    const customDimension = dimensionCodes.find((f) => f.dimensionCode === code);
    return isPre ? false : customDimension;
  };

  render() {
    const { viewSkuBackPath = '/s2-mall/sagm/product-authority' } = this.props;
    const {
      loading,
      allSkuEnable,
      allUserEnable,
      isExcludeSku,
      isExcludeUser,
      exCludeSubAccount,
    } = this.state;
    const rangeProps = {
      allSkuEnable,
      allUserEnable,
      isExcludeSku,
      isExcludeUser,
      viewSkuBackPath,
      initDs: this.initDs,
      userDs: this.userDs,
      skuDs: this.skuDs,
      exCludeSubAccount,
    };

    return (
      <Fragment>
        <Spin spinning={loading}>
          <AuthorityInfo initDs={this.initDs} />
          <AuthorityRange {...rangeProps} />
        </Spin>
      </Fragment>
    );
  }
}
