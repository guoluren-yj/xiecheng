import React from 'react';
import { isFunction, isUndefined } from 'lodash';

export default class AddressAWrapperComponent extends React.PureComponent {
  constructor(props) {
    super(props);
    this.handleRefEditComposeForm = this.handleRefEditComposeForm.bind(this);
    this.handleCountryChange = this.handleCountryChange.bind(this);
    this.handleRegionChange = this.handleRegionChange.bind(this);
    this.handleBankChange = this.handleBankChange.bind(this);
    this.handleLongEffectiveChange = this.handleLongEffectiveChange.bind(this);
    this.handleBankClear = this.handleBankClear.bind(this);
    this.handleBankFirmClear = this.handleBankFirmClear.bind(this);
    this.getBankFirmQueryParams = this.getBankFirmQueryParams.bind(this);
    this.getRegionQueryParams = this.getRegionQueryParams.bind(this);
    this.getCityQueryParams = this.getCityQueryParams.bind(this);
    this.getProductCategoryParams = this.getProductCategoryParams.bind(this);
    this.getItemParams = this.getItemParams.bind(this);

    this.handleProductCategoryChange = this.handleProductCategoryChange.bind(this);
    this.handleItemChange = this.handleItemChange.bind(this);

    // 获取级联清空字段
    this.handleRelationField = this.handleRelationField.bind(this);
    // 单选lov第一级
    this.handleAttrCountryChange = this.handleAttrCountryChange.bind(this);
    // 单选lov第二级
    this.handleAttrRegionChange = this.handleAttrRegionChange.bind(this);
    // 关闭弹窗时清空state缓存参数
    this.handleClearState = this.handleClearState.bind(this);
  }

  state = {
    // 国家
    countryId: undefined,
    // 地区
    regionId: undefined,
    // 银行代码
    bankId: undefined,
    // 品类
    productCategoryId: undefined,
    // 物料
    itemId: undefined,
  };

  firstRelationField = '';

  secondRelationField = '';

  handleClearState() {
    this.setState({
      // 国家
      countryId: undefined,
      // 地区
      regionId: undefined,
      // 银行代码
      bankId: undefined,
      // bankCode: undefined,
      productCategoryId: undefined,
      itemId: undefined,
    });
  }

  handleRefEditComposeForm(composeForm) {
    const { refEditComposeForm } = this.props;
    this.composeForm = composeForm;
    if (isFunction(refEditComposeForm)) {
      refEditComposeForm(composeForm);
    }
    this.handleRelationField();
  }

  handleCountryChange(countryId, lovRecord) {
    this.composeForm.props.form.setFieldsValue({
      regionId: undefined,
      cityId: undefined,
    });
    if (
      this.composeForm.props &&
      this.composeForm.props.configName &&
      this.composeForm.props.configName === 'sslmInvestgAddress'
    ) {
      this.composeForm.props.form.setFieldsValue({
        countryCode: lovRecord ? lovRecord.countryCode : null,
        quickIndex: lovRecord ? lovRecord.quickIndex : null,
      });
    }
    this.setState({ countryId });
  }

  // 清除银行代码时清除银行名称
  handleBankClear() {
    this.composeForm.props.form.setFieldsValue({
      bankName: undefined,
    });
  }

  // 清除联行行号时清除开户行名称
  handleBankFirmClear() {
    this.composeForm.props.form.setFieldsValue({
      depositBank: undefined,
      bankId: undefined,
      bankCode: undefined,
      bankName: undefined,
      bankBranchCode: undefined,
    });
  }

  // 点击银行代码lov时的触发事件
  handleBankChange(_, lovRecord) {
    this.composeForm.props.form.setFieldsValue({
      bankFirm: undefined,
      depositBank: undefined,
    });
    this.setState({ bankId: lovRecord && lovRecord.bankId });
  }

  handleRegionChange(regionId) {
    this.composeForm.props.form.setFieldsValue({
      cityId: undefined,
    });
    this.setState({ regionId });
  }

  handleProductCategoryChange(productCategoryId) {
    this.setState({ productCategoryId });
  }

  handleItemChange(itemId, lovRecords) {
    const { setFieldsValue } = this.composeForm && this.composeForm.props.form;
    this.setState({ itemId });
    if (itemId) {
      setFieldsValue({
        productCategoryId: lovRecords && lovRecords.categoryId,
        productCategoryIdMeaning: lovRecords && lovRecords.categoryName,
        itemIdMeaning: lovRecords && lovRecords.itemName,
      });
    } else {
      setFieldsValue({
        productCategoryId: undefined,
        productCategoryIdMeaning: undefined,
        itemIdMeaning: undefined,
      });
    }
  }

  getRegionQueryParams() {
    return {
      countryId: this.state.countryId,
    };
  }

  getProductCategoryParams(field) {
    const itemId = this.composeForm && this.composeForm.props.form.getFieldValue('itemId');
    return {
      itemId: itemId || this.state.itemId,
      tenantId: field.tenantId,
      hzeroUIFlag: 1,
      businessObjectCode: 'SRM_C_SRM_SSLM_INVESTG_PROSERVICE',
    };
  }

  getItemParams(field) {
    const productCategoryId =
      this.composeForm && this.composeForm.props.form.getFieldValue('productCategoryId');
    return {
      categoryId: productCategoryId || this.state.productCategoryId,
      tenantId: field.tenantId,
    };
  }

  // 获取银行代码LOV中银行code
  getBankFirmQueryParams(field = {}) {
    return {
      bankId: this.state.bankId,
      tenantId: field.tenantId,
    };
  }

  getCityQueryParams() {
    return {
      parentRegionId: this.state.regionId,
    };
  }

  // 点击附件信息长期有效时触发事件
  handleLongEffectiveChange(e) {
    setTimeout(() => {
      // 清空有效日期的必输提示
      if (!e.target.value) {
        this.composeForm.props.form.validateFields(['expirationDate'], {
          force: true,
        });
        this.composeForm.props.form.setFieldsValue({ expirationDate: undefined });
      }
    }, 300);
  }

  // 单选Lov第一级
  handleAttrCountryChange() {
    const firstField = this.firstRelationField;
    const secondField = this.secondRelationField;
    this.composeForm.props.form.setFieldsValue({
      [firstField]: undefined,
      [secondField]: undefined,
    });
  }

  // 单选lov第二级
  handleAttrRegionChange() {
    const secondField = this.secondRelationField;
    this.composeForm.props.form.setFieldsValue({
      [secondField]: undefined,
    });
  }

  // 获取级联清空字段
  handleRelationField() {
    if (
      this.composeForm.props
    ) {
      const fields = this.composeForm.props.fields || [];
      const allMultiLovField = fields.filter((item) => item.componentType === 'Lov') || [];
      allMultiLovField.forEach((item) => {
        const attributes = item.props;
        if (attributes && Array.isArray(attributes) && attributes.length !== 0) {
          const attribute = attributes.find(
            ({ attributeName }) => attributeName === 'relationField'
          );
          const attributeValue = isUndefined(attribute) ? '' : attribute.attributeValue;
          if (attributeValue) {
            const fieldArray = attributeValue.split(',') || [];
            if (fieldArray.length === 1) {
              this.secondRelationField = fieldArray[0].trim();
            } else if (fieldArray.length === 2) {
              this.firstRelationField = fieldArray[0].trim();
              this.secondRelationField = fieldArray[1].trim();
            }
          }
        }
      });
    }
  }

  render() {
    const { children } = this.props;
    return React.cloneElement(children, {
      context: this,
      ...this.props,
      refEditComposeForm: this.handleRefEditComposeForm,
    });
  }
}
