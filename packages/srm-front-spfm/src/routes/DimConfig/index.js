/**
 * index.js - 供应商管控维度配置
 * @date: 2018-10-26
 * @author: geekrainy <chao.zheng02@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */

/* eslint no-underscore-dangle: 0 */
import React, { Component } from 'react';
import { connect } from 'dva';
import { isEmpty } from 'lodash';
import { Table, Radio, Modal, Form, Row, Col, Select, Alert } from 'hzero-ui';
import { Header, Content } from 'components/Page';
import { Bind, Debounce } from 'lodash-decorators';
import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import CommonImport from 'components/Import';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import { getCurrentOrganizationId } from 'utils/utils';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';
import FilterForm from './FilterForm';
import styles from './index.less';

const RadioGroup = Radio.Group;
const { confirm } = Modal;
const { Option } = Select;
const FormItem = Form.Item;
const organizationId = getCurrentOrganizationId();

@Form.create({ fieldNameProp: null })
@connect(({ dimConfig, loading }) => ({
  dimConfig,
  loading: loading.effects['dimConfig/queryDimConfigSups'] || loading.effects['dimConfig/updateDimConfigSups'],
}))
@formatterCollections({
  code: 'sslm.dimConfig',
})
@Form.create({ fieldNameProp: null })
export default class TableList extends Component {
  constructor(props) {
    super(props);
    this.filterForm = {}; // 表单查询条件表单组件
    this.state = {
      visible: false,
      value: '',
      ablilityVisible: false,
    };
  }

  componentDidMount() {
    const {
      dimConfig: { pagination = {} },
    } = this.props;
    this.fetchDimension();
    this.handleSearch(pagination);
  }

  /**
   * 获取供应商管控维度
   */
  @Bind()
  fetchDimension() {
    const { dispatch } = this.props;
    dispatch({
      type: 'dimConfig/queryDimConfig',
    });
  }

  /**
   * 查询供应商列表
   * @param {Object} pagination - 分页查询参数
   */
  @Bind()
  handleSearch(page = {}) {
    const { dispatch } = this.props;
    const body = isEmpty(this.filterForm) ? {} : this.filterForm.props.form.getFieldsValue();

    const params = {
      body,
      page,
    };

    dispatch({
      type: 'dimConfig/queryDimConfigSups',
      payload: params,
    });
  }

  /**
   *
   * @param {object} ref - FilterForm子组件对象
   */
  @Bind()
  handleBindRef(ref = {}) {
    this.filterForm = ref;
  }


  @Bind()
  updateAblilityDim(params){
    confirm({
      title: intl
      .get('sslm.dimConfig.view.message.confirm.ablilityConfig')
      .d('请确认是否变更供货能力管控维度？变更维度将会触发所有历史数据合并至集团级或下发至公司级，请谨慎操作'),
      onOk: () => {
        this.updateDimConfigSups(params);
      },
    });
  }

  /**
   * 更新供应商管控维度配置
   * @param {Object} params - 供应商行数据
   */
  @Bind()
  @Debounce(500)
  updateDimConfigSups(params) {
    const {
      dispatch,
      dimConfig: { pagination = {} },
    } = this.props;
    dispatch({
      type: 'dimConfig/updateDimConfigSups',
      payload: params,
    }).then((res) => {
      if (res) {
        notification.success();
        this.handleSearch(pagination);
      }
    });
  }

  @Bind()
  @Debounce(500)
  updateLifecycleDim(params){
    const {form} = this.props;
    const isLifeCycleSameFlag = form.getFieldValue("isLifeCycleSameFlag");
    if(isLifeCycleSameFlag){
      confirm({
        title: intl
        .get('sslm.dimConfig.view.message.confirm.ablilityConfig')
        .d('请确认是否变更供货能力管控维度？变更维度将会触发所有历史数据合并至集团级或下发至公司级，请谨慎操作'),
        onOk: () => this.updateDimConfigSups(params),
      });
    }else{
      this.updateDimConfigSups(params);
    }
  }


  /**
   * 切换当前租户供应商管控维度
   * @param {Object} params - 管控维度切换参数
   * @param {Object} flag - true-生命周期管控,false-供货能力管控
   */
  @Bind()
  @Debounce(500)
  updateDimConfig(params, flag = true) {
    const {
      form,
      dispatch,
      dimConfig: { pagination = {}, dimension = {} },
      form: { setFieldsValue },
    } = this.props;
    const isLifeCycleSameFlag = form.getFieldValue("isLifeCycleSameFlag");

    confirm({
      title: flag
        ? isLifeCycleSameFlag
          ?(
            <>
              {intl
          .get('sslm.dimConfig.view.message.confirm.updateDimConfig')
          .d('是否变更供应商生命周期管控维度？')}
              <br />
              {intl
            .get('sslm.dimConfig.view.message.confirm.ablilityConfig')
            .d('请确认是否变更供货能力管控维度？变更维度将会触发所有历史数据合并至集团级或下发至公司级，请谨慎操作')}
            </>
)
          :intl
              .get('sslm.dimConfig.view.message.confirm.updateDimConfig')
            .d('是否变更供应商生命周期管控维度？')
        : intl
            .get('sslm.dimConfig.view.message.confirm.ablilityConfig')
            .d('请确认是否变更供货能力管控维度？变更维度将会触发所有历史数据合并至集团级或下发至公司级，请谨慎操作'),
      onOk: () => {
        const newParams = {
          ...params,
        };
        dispatch({
          type: 'dimConfig/updateDimConfig',
          payload: newParams,
        }).then((res) => {
          if (res) {
            // 判断是否两者一致
            const sameFlag = params.isLifeCycleSameFlag === 1;
            const newDimensionCode =
              params.dimensionCode !== 'BOTH' ? params.dimensionCode : undefined;
            this.filterForm.props.form.setFieldsValue({
              dimensionCode: newDimensionCode,
              supplyListDimensionCode: sameFlag
                ? newDimensionCode
                : params.supplyListDimensionCode !== 'BOTH'
                ? params.supplyListDimensionCode
                : undefined,
            });
            notification.success();
            this.fetchDimension();
            this.handleSearch(pagination);
          } else {
            // todo
            setFieldsValue({
              dimensionCode: dimension.dimensionCode,
              isLifeCycleSameFlag: dimension.isLifeCycleSameFlag,
              supplyListDimensionCode: dimension.supplyListDimensionCode,
            });
          }
        });
      },
      onCancel: () => {
        setFieldsValue({
          dimensionCode: dimension.dimensionCode,
          isLifeCycleSameFlag: dimension.isLifeCycleSameFlag,
          supplyListDimensionCode: dimension.supplyListDimensionCode,
        });
      },
    });
  }

  @Bind()
  showInitDims(params) {
    if (params.dimensionCode === 'BOTH') {
      this.setState({ visible: true });
    } else {
      this.setState({ visible: false });
    }
  }

  @Bind()
  handleUpdateDimConfig(params = {}) {
    const {
      dispatch,
      dimConfig: { pagination = {} },
      form,
    } = this.props;
    dispatch({
      type: 'dimConfig/updateDimConfig',
      payload: params,
    }).then((res) => {
      if (res) {
        notification.success();
        this.fetchDimension();
        this.handleSearch(pagination);
      } else {
        form.resetFields(['defaultDimension', 'defaultSupplyListDimensionCode']);
      }
    });
  }

  /**
   * @param {Object} params - 管控维度切换参数
   * @param {Object} flag - true-生命周期管控,false-供货能力管控
   */
  @Bind()
  showInitDim(params, flag = true) {
    const {
      dispatch,
      dimConfig: {
        pagination = {},
        dimension: {
          dimensionCode: oldDimensionCode,
          supplyListDimensionCode: oldSupplyListDimensionCode,
          defaultDimension,
          defaultSupplyListDimensionCode,
        } = {},
      },
    } = this.props;
    const bothFlag = flag
      ? params.dimensionCode === 'BOTH'
      : params.supplyListDimensionCode === 'BOTH';
    if (bothFlag) {
      const newParams = {
        ...params,
        defaultDimension: defaultDimension || oldDimensionCode,
        defaultSupplyListDimensionCode:
          defaultSupplyListDimensionCode || oldSupplyListDimensionCode,
      };
      confirm({
        title: flag
          ? intl
              .get('sslm.dimConfig.view.message.confirm.updateBoth')
              .d('是否变更供应商生命周期管控维度为[两者都有]？')
          : intl
              .get('sslm.dimConfig.view.message.confirm.ablilityBoth')
              .d('是否变更供货能力管控维度为[两者都有]？'),
        onOk: () => {
          dispatch({
            type: 'dimConfig/updateDimConfig',
            payload: newParams,
          }).then((res) => {
            if (res) {
              if (flag) {
                this.setState({ visible: true });
              }
              this.filterForm.props.form.setFieldsValue({
                dimensionCode: params.dimensionCode !== 'BOTH' ? params.dimensionCode : undefined,
                supplyListDimensionCode:
                  params.supplyListDimensionCode !== 'BOTH'
                    ? params.supplyListDimensionCode
                    : undefined,
              });
              notification.success();
              this.fetchDimension();
              this.handleSearch(pagination);
            } else {
              this.props.form.setFieldsValue({
                dimensionCode: oldDimensionCode,
                supplyListDimensionCode: oldSupplyListDimensionCode,
              });
            }
          });
        },
        onCancel: () => {
          this.props.form.setFieldsValue({
            defaultDimension: undefined,
            dimensionCode: oldDimensionCode,
            defaultSupplyListDimensionCode: undefined,
            supplyListDimensionCode: oldSupplyListDimensionCode,
          });
          this.props.form.validateFields((err) => {
            if (err) {
              // this.handleTip();
            }
          });
        },
      });
    } else {
      this.setState({ visible: false });
    }
  }

  @Bind()
  updateInitDimConfig(params) {
    const {
      dispatch,
      dimConfig: { pagination = {} },
    } = this.props;
    if (params.defaultDimension === 'GROUP') {
      confirm({
        title: intl
          .get('sslm.dimConfig.view.message.confirm.updateInitGroups')
          .d('是否变更供应商生命周期管控维度为[两者都有]，且默认值为[集团]？'),
        onOk: () => {
          const { defaultDimension } = params;
          this.filterForm.props.form.setFieldsValue({
            defaultDimension: defaultDimension !== 'BOTH' ? defaultDimension : '',
          });
          dispatch({
            type: 'dimConfig/updateDimConfig',
            payload: params,
          }).then((res) => {
            if (res) {
              notification.success();
              this.fetchDimension();
              this.handleSearch(pagination);
            }
          });
        },
      });
    } else {
      confirm({
        title: intl
          .get('sslm.dimConfig.view.message.confirm.updateInitCompanys')
          .d('是否变更供应商生命周期管控维度为[两者都有]，且默认值为[公司]？'),
        onOk: () => {
          const { defaultDimension } = params;
          this.filterForm.props.form.setFieldsValue({
            defaultDimension: defaultDimension !== 'BOTH' ? defaultDimension : '',
          });
          dispatch({
            type: 'dimConfig/updateDimConfig',
            payload: params,
          }).then((res) => {
            if (res) {
              notification.success();
              this.fetchDimension();
              this.handleSearch(pagination);
            }
          });
        },
      });
    }
  }

  // flag = true, 生命周期管控维度, false 供货能力管控维度
  @Bind()
  handleChangeType(val, flag = true) {
    const {
      form,
      dimConfig: { dimension = {} },
    } = this.props;
    const isLifeCycleSameFlag = form.getFieldValue("isLifeCycleSameFlag");
    const payload = flag
      ? {
          defaultDimension: val,
          dimensionCode: 'BOTH',
        }
      : {
          defaultSupplyListDimensionCode: val,
          supplyListDimensionCode: 'BOTH',
        };
    const fieldValue = flag
      ? {
          defaultDimension: dimension.defaultDimension,
        }
      : {
          defaultSupplyListDimensionCode: dimension.defaultSupplyListDimensionCode,
        };
    let title = null;
    if(val === 'GROUP'){
      title= flag
          ? isLifeCycleSameFlag
            ?(
              <>
                {intl
              .get('sslm.dimConfig.view.message.confirm.updateInitGroups')
              .d('是否变更供应商生命周期管控维度为[两者都有]，且默认值为[集团]？')}
                <br />
                {intl
            .get('sslm.dimConfig.view.message.confirm.ablilityConfig')
            .d('请确认是否变更供货能力管控维度？变更维度将会触发所有历史数据合并至集团级或下发至公司级，请谨慎操作')}
              </>
)
            :intl
              .get('sslm.dimConfig.view.message.confirm.updateInitGroups')
              .d('是否变更供应商生命周期管控维度为[两者都有]，且默认值为[集团]？')
          : intl
          .get('sslm.dimConfig.view.message.confirm.ablilityInitGroups')
          .d('是否变更供货能力管控维度为[两者都有]，且默认值为[集团]？变更维度将会触发所有历史数据合并至集团级或下发至公司级，请谨慎操作');
    }else if (val === 'COMPANY') {
      title= flag
      ? isLifeCycleSameFlag?(
        <>
          {intl
          .get('sslm.dimConfig.view.message.confirm.updateInitCompanys')
          .d('是否变更供应商生命周期管控维度为[两者都有]，且默认值为[公司]？')}
          <br />
          {intl
            .get('sslm.dimConfig.view.message.confirm.ablilityConfig')
            .d('请确认是否变更供货能力管控维度？变更维度将会触发所有历史数据合并至集团级或下发至公司级，请谨慎操作')}
        </>
):intl
          .get('sslm.dimConfig.view.message.confirm.updateInitCompanys')
          .d('是否变更供应商生命周期管控维度为[两者都有]，且默认值为[公司]？')
      : intl
          .get('sslm.dimConfig.view.message.confirm.ablilityInitCompanys')
          .d('是否变更供货能力管控维度为[两者都有]，且默认值为[公司]？变更维度将会触发所有历史数据合并至集团级或下发至公司级，请谨慎操作');
    }else if (val === 'INVITE') {
      title= flag
      ? isLifeCycleSameFlag?(
        <>
          {intl
      .get('sslm.dimConfig.view.message.confirm.updateInitInvite')
      .d('是否变更供应商生命周期管控维度为[两者都有]，且默认值为[与邀约维度一致]？')}
          <br />
          {intl
            .get('sslm.dimConfig.view.message.confirm.ablilityConfig')
            .d('请确认是否变更供货能力管控维度？变更维度将会触发所有历史数据合并至集团级或下发至公司级，请谨慎操作')}
        </>
):intl
      .get('sslm.dimConfig.view.message.confirm.updateInitInvite')
      .d('是否变更供应商生命周期管控维度为[两者都有]，且默认值为[与邀约维度一致]？')
      : intl
          .get('sslm.dimConfig.view.message.confirm.ablilityInitInvite')
          .d('是否变更供货能力管控维度为[两者都有]，且默认值为[与邀约维度一致]？变更维度将会触发所有历史数据合并至集团级或下发至公司级，请谨慎操作');
    }
    if(title){
      confirm({
        title,
        onOk: () => {
          const params = {
            ...dimension,
            ...payload,
          };
          this.handleUpdateDimConfig(params);
        },
        onCancel: () => {
          this.props.form.setFieldsValue(fieldValue);
          this.props.form.validateFields((err) => {
            if (err) {
              // this.handleTip();
            }
          });
        },
      });
    }
  }

  renderDim() {
    const {
      dimConfig: { dimensionType = {}, dimension = {} },
      form: { getFieldDecorator },
    } = this.props;
    return (
      <div
        style={{
          marginBottom: 20,
          fontSize: 14,
        }}
      >
        <FormItem label={intl.get('sslm.dimConfig.view.title.chooseDim').d('选择生命周期管控维度')}>
          {getFieldDecorator('dimensionCode', {
            initialValue: this.state.value ? this.state.value : dimension.dimensionCode, // dimension.dimensionCode,
          })(
            <RadioGroup
              value={this.state.value ? this.state.value : dimension.dimensionCode}
              style={{
                marginLeft: 10,
              }}
              onChange={(e) => {
                const params = {
                  ...dimension,
                  dimensionCode: e.target.value,
                };
                if (params.dimensionCode === 'COMPANY' || params.dimensionCode === 'GROUP') {
                  // params.defaultDimension = null;
                  this.setState({ visible: false });
                  this.updateDimConfig(params, true);
                } else {
                  this.showInitDim(params, true);
                }
              }}
            >
              {dimensionType.map((m) => {
                return (
                  <Radio key={m.value} value={m.value}>
                    {m.meaning}
                  </Radio>
                );
              })}
            </RadioGroup>
          )}
        </FormItem>
      </div>
    );
  }

  // 供货能力管控维度与邀约一致/不一致
  renderSupplierAblility() {
    const {
      dimConfig: { supplierAblilityList = [], dimension = {} },
      form: { getFieldDecorator },
    } = this.props;
    return (
      <div
        style={{
          marginBottom: 20,
          fontSize: 14,
        }}
      >
        <FormItem
          label={intl
            .get('sslm.dimConfig.model.dimConfig.supplierAblility')
            .d('选择供货能力管控维度')}
        >
          {getFieldDecorator('isLifeCycleSameFlag', {
            initialValue: dimension.isLifeCycleSameFlag,
          })(
            <RadioGroup
              value={dimension.isLifeCycleSameFlag}
              style={{
                marginLeft: 10,
              }}
              onChange={(e) => {
                const newIsLifeCycleSameFlag = e.target.value;
                const params = {
                  ...dimension,
                  isLifeCycleSameFlag: newIsLifeCycleSameFlag,
                };
                if (newIsLifeCycleSameFlag === 1) {
                  params.supplyListDimensionCode = dimension.dimensionCode;
                  this.setState({ ablilityVisible: false });
                  this.updateDimConfig(params, false);
                } else {
                  this.updateDimConfig(params, false);
                }
              }}
            >
              {supplierAblilityList.map((m) => {
                return (
                  <Radio key={Number(m.value)} value={Number(m.value)}>
                    {m.meaning}
                  </Radio>
                );
              })}
            </RadioGroup>
          )}
        </FormItem>
      </div>
    );
  }

  // 供货能力管控维度选择公司/集团/两者都有
  renderSelectAblilityDimension() {
    const {
      dimConfig: { dimensionType = {}, dimension = {} },
      form: { getFieldDecorator },
    } = this.props;
    return (
      <div
        style={{
          marginBottom: 20,
          fontSize: 14,
        }}
      >
        <FormItem
          label={intl
            .get('sslm.dimConfig.model.dimConfig.supplierAblility')
            .d('选择供货能力管控维度')}
        >
          {getFieldDecorator('supplyListDimensionCode', {
            initialValue: dimension.supplyListDimensionCode,
          })(
            <RadioGroup
              value={dimension.supplyListDimensionCode}
              style={{
                marginLeft: 10,
              }}
              onChange={(e) => {
                const newSupplyListDimensionCode = e.target.value;
                const params = {
                  ...dimension,
                  supplyListDimensionCode: newSupplyListDimensionCode,
                };
                if (
                  newSupplyListDimensionCode === 'COMPANY' ||
                  newSupplyListDimensionCode === 'GROUP'
                ) {
                  this.updateDimConfig(params, false);
                } else {
                  this.showInitDim(params, false);
                }
              }}
            >
              {dimensionType.map((m) => {
                return (
                  <Radio key={m.value} value={m.value}>
                    {m.meaning}
                  </Radio>
                );
              })}
            </RadioGroup>
          )}
        </FormItem>
      </div>
    );
  }

  // flag = true, 生命周期管控维度, false 供货能力管控维度
  renderInitDims(flag = true) {
    const {
      dimConfig: { defaultDimensionList = {}, dimension = {} },
      form: { getFieldDecorator },
    } = this.props;
    return (
      <div
        style={{
          marginBottom: 20,
          fontSize: 14,
        }}
      >
        {flag ? (
          <FormItem label={intl.get('sslm.dimConfig.view.title.chooseInitDim').d('默认值')}>
            {getFieldDecorator('defaultDimension', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`sslm.dimConfig.model.dimConfig.chooseInitDim`).d('默认值'),
                  }),
                },
              ],
              initialValue: dimension.defaultDimension,
            })(
              <Select
                style={{ width: 150 }}
                allowClear
                placeholder={intl
                  .get('sslm.dimConfig.model.dimConfig.initDimension')
                  .d('请维护初始管控维度')}
                onChange={(value) => this.handleChangeType(value, flag)}
              >
                {defaultDimensionList.map((m) => {
                  return (
                    <Option key={m.value} value={m.value}>
                      {m.meaning}
                    </Option>
                  );
                })}
              </Select>
            )}
          </FormItem>
        ) : (
          <FormItem label={intl.get('sslm.dimConfig.view.title.chooseInitDim').d('默认值')}>
            {getFieldDecorator('defaultSupplyListDimensionCode', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`sslm.dimConfig.model.dimConfig.chooseInitDim`).d('默认值'),
                  }),
                },
              ],
              initialValue: dimension.defaultSupplyListDimensionCode,
            })(
              <Select
                style={{ width: 150 }}
                allowClear
                placeholder={intl
                  .get('sslm.dimConfig.model.dimConfig.initDimension')
                  .d('请维护初始管控维度')}
                onChange={(value) => this.handleChangeType(value, flag)}
              >
                {defaultDimensionList.map((m) => {
                  return (
                    <Option key={m.value} value={m.value}>
                      {m.meaning}
                    </Option>
                  );
                })}
              </Select>
            )}
          </FormItem>
        )}
      </div>
    );
  }

  @Bind()
  handleTip() {
    Modal.warning({
      content: intl.get('sslm.dimConfig.model.dimConfig.initDimension').d('请维护初始管控维度'),
    });
  }

  @Bind()
  getExportParams() {
    if (this.filterForm.props) {
      const {
        form: { getFieldsValue },
      } = this.filterForm.props;
      return getFieldsValue();
    } else {
      return {};
    }
  }

  render() {
    const {
      dimConfig = {},
      dimConfig: { supsList = [], dimensionType = [], dimension = {}, pagination = {} },
      loading,
    } = this.props;
    const { visible, ablilityVisible } = this.state;
    const filterProps = {
      dimConfig,
      onSearch: this.handleSearch,
      onRef: this.handleBindRef,
    };
    const columns = [
      {
        title: intl.get('sslm.dimConfig.model.dimConfig.supplierCompanyNum').d('供应商编码'),
        width: 200,
        align: 'left',
        dataIndex: 'supplierCompanyNum',
      },
      {
        title: intl.get('sslm.dimConfig.model.dimConfig.supplierCompanyName').d('供应商名称'),
        align: 'left',
        dataIndex: 'supplierCompanyName',
      },
      {
        title: intl.get('sslm.dimConfig.model.dimConfig.dimensionCode').d('生命周期管控维度'),
        width: 200,
        dataIndex: 'dimensionCode',
        render: (value, record) => {
          return (
            <RadioGroup
              disabled={dimension.dimensionCode !== 'BOTH'}
              onChange={(e) => {
                const params = {
                  ...record,
                  dimensionCode: e.target.value,
                  supplyListDimensionCode:
                    dimension.isLifeCycleSameFlag === 1
                      ? e.target.value
                      : record.supplyListDimensionCode,
                };
                this.updateLifecycleDim(params);
              }}
              value={value}
            >
              {dimensionType
                .filter((m) => m.value !== 'BOTH')
                .map((m) => {
                  return (
                    <Radio key={m.value} value={m.value}>
                      {m.meaning}
                    </Radio>
                  );
                })}
            </RadioGroup>
          );
        },
      },
      {
        title: intl.get('sslm.dimConfig.model.dimConfig.ablilityDimension').d('供货能力管控维度'),
        width: 200,
        dataIndex: 'supplyListDimensionCode',
        render: (value, record) => {
          return (
            <RadioGroup
              disabled={
                dimension.supplyListDimensionCode !== 'BOTH' || dimension.isLifeCycleSameFlag === 1
              }
              onChange={(e) => {
                const params = {
                  ...record,
                  supplyListDimensionCode: e.target.value,
                };
                this.updateAblilityDim(params);
              }}
              value={value}
            >
              {dimensionType
                .filter((m) => m.value !== 'BOTH')
                .map((m) => {
                  return (
                    <Radio key={m.value} value={m.value}>
                      {m.meaning}
                    </Radio>
                  );
                })}
            </RadioGroup>
          );
        },
      },
    ];

    return (
      <React.Fragment>
        <Header
          title={intl.get('sslm.dimConfig.view.title.supplierDimConfig').d('供应商管控维度配置')}
          backPath="/spfm/config-server/main"
        >
          <CommonImport
            refreshButton
            prefixPatch={SRM_SSLM}
            businessObjectTemplateCode="SRM_C_SRM_SSLM_LIFE_CYCLE_DIM_CONFIG"
            buttonText={intl
              .get('sslm.dimConfig.view.title.dimensionImport')
              .d('生命周期管控维度导入')}
            buttonProps={{
              icon: 'archive',
              type: 'c7n-pro',
              disabled: dimension.dimensionCode !== 'BOTH',
              permissionList: [
                {
                  code: 'srm.bg.sys.config.api.supplier-manager.life-cycle.import.model',
                  type: 'button',
                  meaning: '生命周期管控维度导入',
                },
              ],
            }}
          />
          <CommonImport
            refreshButton
            prefixPatch={SRM_SSLM}
            businessObjectTemplateCode="SRM_C_SRM_SSLM_SUPPLY_ABILITY_DIM_CONFIG"
            buttonText={intl
              .get('sslm.dimConfig.view.title.abilityImport')
              .d('供货能力管控维度导入')}
            buttonProps={{
              icon: 'archive',
              type: 'c7n-pro',
              disabled:
                dimension.supplyListDimensionCode !== 'BOTH' || !!dimension.isLifeCycleSameFlag,
              permissionList: [
                {
                  code: 'srm.bg.sys.config.api.supplier-manager.supply-ability.import.model',
                  type: 'button',
                  meaning: '供货能力管控维度导入',
                },
              ],
            }}
          />
          <ExcelExportPro
            templateCode="SRM_C_SRM_SSLM_LIFE_CYCLE_DIM_CONFIG_EXPORT"
            buttonText={intl.get('hzero.common.export').d('导出')}
            requestUrl={`${SRM_SSLM}/v1/${organizationId}/life-cycle-dim-sups/export`}
            queryParams={() => this.getExportParams()}
            otherButtonProps={{
              permissionList: [
                {
                  code: 'srm.bg.sys.config.api.supplier-manager.dimension.export',
                  type: 'button',
                },
              ],
            }}
          />
        </Header>
        <Content>
          <Form layout="inline" className="more-fields-form">
            <Row>
              <Col span={8}>{this.renderDim()}</Col>
              <Col span={16}>
                {visible || dimension.dimensionCode === 'BOTH' ? this.renderInitDims(true) : null}
              </Col>
            </Row>
            <Row>
              <Col span={9}>{this.renderSupplierAblility()}</Col>
            </Row>
            {(ablilityVisible || dimension.isLifeCycleSameFlag === 0) && (
              <Row>
                <Col span={8}>{this.renderSelectAblilityDimension()}</Col>
                <Col span={16}>
                  {dimension.supplyListDimensionCode === 'BOTH' ? this.renderInitDims(false) : null}
                </Col>
              </Row>
            )}
          </Form>
          <Alert
            closable
            showIcon
            type="info"
            iconType="help"
            className={styles['ablility-alert']}
            message={intl.get("sslm.dimConfig.model.dimConfig.supplierAblilityMsg").d("供货能力管控维度从集团级切换至公司级时，集团级数据将复制给所有公司；从公司级切换至集团级时，所有公司下的数据将去重合并至集团级。请谨慎操作，反复切换可能导致数据冗余")}
          />
          <div className="table-list-search">
            <FilterForm {...filterProps} />
          </div>
          <Table
            bordered
            rowKey="dimensionSupplierId"
            loading={loading || false}
            dataSource={supsList}
            columns={columns}
            onChange={(page) => this.handleSearch(page)}
            pagination={pagination}
          />
        </Content>
      </React.Fragment>
    );
  }
}
