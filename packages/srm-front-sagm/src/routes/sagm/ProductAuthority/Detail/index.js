import React, { Component, Fragment } from 'react';
import { DataSet, Spin, Button } from 'choerodon-ui/pro';
import { Bind, Throttle } from 'lodash-decorators';
import { toJS } from 'mobx';
// import { observer } from 'mobx-react-lite';

import intl from 'utils/intl';
import notification from 'utils/notification';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import { queryUnifyIdpValue } from 'services/api';

import { isArray } from 'lodash';
import {
  fetchInfo,
  saveAuthority,
  //   savePriceStrategy,
  //   deleteDimension,
  //   joinAssignSku,
  //   deleteAssignSku,
} from './api';
import { isRepeat } from './utils';
import AuthorityInfo from './AuthorityInfo';
import AuthorityRange from './AuthorityRange';
import { formDs, tableDs, excludeUserDs } from './initDs';

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
/**
 * 采买权限管理-编辑权限
 * 商城协议工作台 - 新建权限入口
 */
export default class Detail extends Component {
  constructor(props) {
    super(props);

    const { modal, readOnly, type } = props;

    modal.handleOk(() => {
      return readOnly ? true : this.handleSave();
    });

    modal.update({
      okText: readOnly
        ? intl.get('hzero.common.button.close').d('关闭')
        : intl.get('sagm.common.btn.saveAndClose').d('保存并关闭'),
      okProps: {
        loading: this.initDs.getState('save_loading'),
      },
      footer: (okBtn, cancelBtn) => {
        return [
          okBtn,
          !readOnly && (
            <Button
              onClick={() => this.handleSave(true)}
              loading={this.initDs.getState('save_loading')}
            >
              {intl.get('hzero.common.btn.save').d('保存')}
            </Button>
          ),
          !readOnly && cancelBtn,
        ];
      },
    });

    this.state = {
      type,
      loading: false,
      isExcludeSku: false,
      isExcludeUser: false,
      dimensionCodes: [], // 对应频道和协议类型的所有维度（除去排除维度）
      agreementHeaderNum: null,
      // categoryFlatData: [],
    };
  }

  organizationId = getCurrentOrganizationId();

  initDs = new DataSet(formDs(this.props.readOnly));

  userDs = new DataSet(tableDs(this.props.readOnly));

  excludeUserDs = new DataSet(excludeUserDs(this.props.readOnly));

  skuDs = new DataSet(tableDs(this.props.readOnly));

  componentDidMount() {
    // __sourceFrom: 'agreement'(协议采买权限 传的context) 区分哪个入口的权限新建
    // 作用：1.采购协议维度过滤供应商 2.商品条件范围处的icon提示
    // type：'create' | id
    const { type = 'create', init = {}, __sourceFrom } = this.props;
    this.fetchCode();
    if (type === 'create') {
      this.initDs.create({ ...init, enableFlag: 1, __purManual: __sourceFrom === 'agreement' });
    } else {
      this.fetchData(type);
    }
  }

  allDimensionCodes = []; // 过滤排除用户、排除商品以及其他条件后的维度

  setDimensionCodes = (channel, callback = (e) => e) => {
    // 企业 ENTERPRISE 会员 PERSONAL
    const filterChannel = channel || 'ENTERPRISE';
    const dimensionCodes = this.allDimensionCodes.filter((f) =>
      ['NONE', filterChannel].includes(f.channel)
    );
    this.setState({ dimensionCodes }, callback);
  };

  handleRangeChange = (value, oldValue) => {
    if (value === 'MEMBER' || oldValue === 'MEMBER') {
      const channel = value === 'MEMBER' ? 'PERSONAL' : 'ENTERPRISE';
      this.setDimensionCodes(channel, () => {
        this.userDs.loadData([]);
      });
    }
  };

  @Bind
  async fetchCode() {
    const { init: { channel } = {}, agreementHeaderType } = this.props;
    // 平台级该租户维护的采买权限维度
    const res = getResponse(
      await queryUnifyIdpValue('SAGM.AUTH_CUSTOMIZE_DIMENSION', {
        // channel: channel || 'ENTERPRISE',
      })
    );
    if (res) {
      const noExclude = res.filter((f) => !['SKU_EXCLUDE', 'USER_EXCLUDE'].includes(f.value));
      // 领用协议，用户条件排除区域，商品条件只有商品
      this.allDimensionCodes = noExclude.filter((f) =>
        agreementHeaderType === 'RECEIVE'
          ? f.value === 'SKU' || (!['AREA'].includes(f.value) && f.dimensionType !== 'SKU')
          : noExclude
      );
      this.setDimensionCodes(channel, () => {
        // 此处逻辑似乎没必要
        // const ds = this.initDs.toData();
        // const data = ds[0] || {};
        // if (data.authorityListId) {
        //   this.initData(data);
        // }
      });
    }
  }

  @Bind
  async fetchData(authorityListId) {
    const { modal, init = {}, readOnly } = this.props;
    const { type } = this.state;
    // deleteFlag：协议采买权限props - 是否是已删除状态的协议
    const { agreementType, agreementHeaderId, deleteFlag } = init;
    this.setState({ loading: true });
    if (!readOnly) {
      modal.update({
        okProps: { loading: true },
      });
    }
    const res = await fetchInfo({
      agreementType,
      agreementHeaderId,
      authorityListId: authorityListId || type,
      deleteFlag,
    });
    this.setState({ loading: false });
    modal.update({
      okProps: { loading: false },
    });
    const result = getResponse(res);
    if (result) {
      this.initData(result);
    }
  }

  @Bind
  initData(data = {}) {
    const {
      authRangeDTOS = [], // 维护的维度集合（商品 + 用户范围）
      agreementHeaderNum,
      authorityListId,
      allUserEnable,
      allSkuEnable,
      automaticallyFlag,
      agreementType,
    } = data;
    // 有来源单号的手动创建的采购协议：过滤商品供应商维度
    const __purManual =
      agreementHeaderNum && agreementType === 'PUR_AGREEMENT' && !automaticallyFlag;
    this.initDs.removeAll();
    this.initDs.create({ ...data, __purManual });
    this.userDs.removeAll();
    this.skuDs.removeAll();
    // 是否维护了排除用户 | 商品
    const isExcludeSku = authRangeDTOS?.some((s) => s.authDimension === 'SKU_EXCLUDE');
    const isExcludeUser = authRangeDTOS?.some((s) => s.authDimension === 'USER_EXCLUDE');
    // 过滤排除用户、排除商品 两个维度
    const dimensions = (authRangeDTOS || []).filter(
      (f) => !['SKU_EXCLUDE', 'USER_EXCLUDE'].includes(f.authDimension)
    );
    // 获取 排除用户维度
    const excludeUser = (authRangeDTOS || []).find((f) => f.authDimension === 'USER_EXCLUDE') || {};
    // 加载两个范围 Table数据
    dimensions.forEach((f) => {
      const line = this.getDimensionLine(f);
      // 部分用户tab
      if (!allUserEnable && f.type === 'USER') {
        this.userDs.create(line);
        this.userDs.validate(); // 触发页面初次加载失效区域校验
      }
      // 部分商品tab
      if (!allSkuEnable && f.type === 'SKU') {
        this.skuDs.create(line);
      }
    });
    // 加载排除部分用户数据
    this.excludeUserDs.create({
      subAccount: excludeUser.data || [],
    });
    // 初始化自定义维度列属性
    this.updateDsFieldProps(this.userDs);
    this.updateDsFieldProps(this.skuDs);
    this.setState({ agreementHeaderNum, type: authorityListId, isExcludeSku, isExcludeUser });
  }

  getDimensionLine = (line) => {
    const { dimensionCodes } = this.state;
    // 维度 是否是自定义维度
    const customDimension = this.getDimensionIsCustom(line.authDimension);
    let customSelect;
    let customDimensions;
    let columns;
    if (customDimension) {
      // valueType： 自定义维度值类型： string | number ...
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
      dimension: { value: line.authDimension, meaning: dimensionName || line.authDimensionMeaning }, // 先取平台维护的维度名称，再去接口返回名称
      dimensionCode: line.authDimension,
      [line.authDimension]: !customDimension ? line.data : null, // 平台维度值
      customSelect, // select 自定义纬度值
      customDimension: customDimensions, // 自定义纬度值
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
      // 暂存，后续判断维度是否自定义
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

  // 刷新
  @Bind
  async handleAfterImport(dimensionType) {
    const { type } = this.state;
    const record = this.initDs.current;
    const { agreementType, agreementHeaderId } = record.toData();
    const tDs = dimensionType === 'USER' ? this.userDs : this.skuDs;
    tDs.status = 'loading';
    // 刷新头信息
    const res = getResponse(
      await fetchInfo({
        agreementType,
        agreementHeaderId,
        authorityListId: type,
      })
    );
    tDs.status = 'ready';
    if (res) {
      const { objectVersionNumber, authRangeDTOS } = res;
      record.set('objectVersionNumber', objectVersionNumber);
      tDs.removeAll();
      // 过滤排除维度
      const dimensions = (authRangeDTOS || []).filter(
        (f) =>
          f.type === dimensionType && !['SKU_EXCLUDE', 'USER_EXCLUDE'].includes(f.authDimension)
      );
      // 重新加载Table数据
      dimensions.forEach((f) => {
        const line = this.getDimensionLine(f);
        tDs.create(line);
      });
      // 再次初始化自定义维度列属性
      this.updateDsFieldProps(tDs);
    }
  }

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

  @Throttle(1000)
  @Bind
  async handleSave(refresh = false) {
    // onFetchList：外部list刷新方法； 保存之后回到列表页
    const { onFetchList = (e) => e, type } = this.props;
    this.initDs.setState('save_loading', true);
    const authorityInfo = this.initDs.current.toData(); // 除权限范围以外的权限配置信息
    const configInfoFlag = await this.initDs.validate(); // 配置信息校验
    const { allUserEnable, allSkuEnable } = authorityInfo;

    let userFlag = allUserEnable;
    let skuFlag = allSkuEnable;

    // 非全部范围触发Table校验
    if (!allUserEnable) userFlag = await this.userDs.validate();
    if (!allSkuEnable) skuFlag = await this.skuDs.validate();

    // 校验 + 处理接口数据
    if (configInfoFlag && userFlag && skuFlag) {
      const users = this.userDs.toData();
      const skus = this.skuDs.toData();
      const keyMap = {
        ORG: [
          ['unitId', 'orgId'],
          ['levelPath', 'orgLevelPath'],
        ],
        ROLE: [['id', 'roleId']],
        USER: [['id', 'userId']],
        AREA: [
          ['regionId', 'areaId'],
          ['levelPath', 'areaLevelPath'],
        ],
        CATALOG: [['categoryId', 'catalogId']],
        DIRECTORY: [['catalogId', 'directoryId']],
        SUPPLIER: [['supplierId', 'supplierCompanyId']],
        MEMBER_LABEL: [['labelId', 'memberLabelId']],
      };
      const getData = (m) => {
        const { dimensionCode } = m;
        const changeKeys = keyMap[dimensionCode];
        const value = m[dimensionCode];
        if (value && changeKeys && isArray(value)) {
          return value.map((l) => transformKeys(l, changeKeys));
        }
        if (dimensionCode === 'COMMODITY_SOURCE') {
          return { skuType: value };
        }
        return value;
      };

      const transformKeys = (l, changeKeys) => {
        const r = {};
        changeKeys.forEach((f) => {
          const [prevKey = 'prev', nextKey = 'next'] = f || [];
          r[nextKey] = l[nextKey] || l[prevKey];
        });
        return { ...l, ...r };
      };

      const getAuths = (list, t) => {
        return list.map((m) => {
          const { dimensionCode, customDimension } = m;
          const isCustom = this.getDimensionIsCustom(dimensionCode);
          return {
            type: t,
            authDimension: dimensionCode,
            data: isCustom ? customDimension : getData(m),
          };
        });
      };

      const getFixedAuths = (list, code, t) => {
        return {
          type: t,
          authDimension: code,
          data: list.map((m) => transformKeys(m, [['id', 'userId']])),
        };
      };

      if (!allUserEnable && users.length < 1) {
        notification.warning({
          message: intl.get('sagm.common.view.message.userDimensionNotNull').d('用户条件不能为空'),
        });
        this.initDs.setState('save_loading', false);
        return false;
      }

      // if (!allSkuEnable && skus.length < 1) {
      //   notification.warning({
      //     message: intl.get('sagm.common.view.message.skuDimensionNotNull').d('商品条件不能为空'),
      //   });
      //   return false;
      // }

      // 接口参数：排除用户
      const excludeUser = getFixedAuths(
        toJS(this.excludeUserDs.current.get('subAccount')),
        'USER_EXCLUDE',
        'USER'
      );
      // 清除空元素
      const userAuths = (allUserEnable
        ? [excludeUser]
        : [...getAuths(users, 'USER'), excludeUser]
      ).filter((f) => f);

      const skuAuths = allSkuEnable ? [] : getAuths(skus, 'SKUS');
      const authRangeDTOS = [...userAuths, ...skuAuths];
      const [isRepeatDimension] = isRepeat(authRangeDTOS, 'authDimension');
      const noSku = skus.some((s) => s.dimensionCode === 'SKU' && !s.hasSku);
      if (isRepeatDimension) {
        notification.warning({
          message: intl.get('sagm.common.view.deleteRepeatDimension').d('请删除重复条件'),
        });
        this.initDs.setState('save_loading', false);
        return false;
      }
      if (!allSkuEnable && noSku) {
        notification.warning({
          message: intl.get('sagm.common.view.skuDimensionAddSku').d('商品维度请加入商品'),
        });
        this.initDs.setState('save_loading', false);
        return false;
      }

      const params = {
        ...authorityInfo,
        authRangeDTOS: [...userAuths, ...skuAuths],
      };
      const res = await saveAuthority(params);
      const result = getResponse(res);
      if (result) {
        notification.success();
        this.initDs.setState('save_loading', false);
        if (refresh) {
          this.fetchData(result.authorityListId);
        }
        onFetchList(type);
        return true;
      }
    }
    this.initDs.setState('save_loading', false);
    return false;
  }

  render() {
    const {
      readOnly,
      agreementHeaderType,
      viewSkuBackPath = '/s2-mall/sagm/product-authority',
      path,
    } = this.props;
    const { loading, dimensionCodes, agreementHeaderNum, isExcludeSku, isExcludeUser } = this.state;
    const rangeProps = {
      readOnly,
      isExcludeSku,
      isExcludeUser,
      // preDimensions,
      dimensionCodes,
      viewSkuBackPath,
      agreementHeaderNum,
      agreementHeaderType,
      path,
      initDs: this.initDs,
      userDs: this.userDs,
      skuDs: this.skuDs,
      excludeUserDs: this.excludeUserDs,
      onRefresh: this.handleAfterImport,
      initCustomFields: this.initCustomFields,
      getDimensionIsCustom: this.getDimensionIsCustom,
    };

    return (
      <Fragment>
        <Spin spinning={loading}>
          <AuthorityInfo
            initDs={this.initDs}
            readOnly={readOnly}
            onRangeChange={this.handleRangeChange}
          />
          <AuthorityRange {...rangeProps} />
        </Spin>
      </Fragment>
    );
  }
}
