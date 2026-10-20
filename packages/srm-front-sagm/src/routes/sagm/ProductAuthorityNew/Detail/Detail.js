import React, { useEffect, useMemo, useState } from 'react';
import { DataSet, Spin } from 'choerodon-ui/pro';
import { Steps, Tabs } from 'choerodon-ui';
import { toJS } from 'mobx';
import { isArray, flowRight } from 'lodash';
import classnames from 'classnames';

import intl from 'utils/intl';
import notification from 'utils/notification';
import { getResponse } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import remoteFunc from 'hzero-front/lib/utils/remote';
import { queryUnifyIdpValue } from 'services/api';
import { Content } from 'components/Page';

import { SubContent, Card } from '@/components/Card';
import { confirm } from '@/utils/c7nModal';
// import { isRepeat } from '@/routes/sagm/ProductAuthority/Detail/utils';
import AuthorityInfo from './AuthorityInfo';
import AuthorityRange from './AuthorityRange.js';

import styles from './styles.less';

import { fetchInfo, saveAuthority } from '../../ProductAuthority/Detail/api.js';
import { publishAuthority } from '../../ProductAuthority/api.js';
import {
  formDs,
  tableDs,
  excludeUserDs as excludeUserDS,
} from '../../ProductAuthority/Detail/initDs.js';
import { excludeUserTableDS, excludeSkuTableDS } from './ds.js';

// interface IInitProps {
//   channel: 'PERSONAL' | 'ENTERPRISE' | 'NONE',
//   agreementType: 'MANUAL' | 'PUR_AGREEMENT' | 'SALE_AGREEMENT',
//   agreementHeaderId: string, // 协议 | 销售协议头id
//   agreementHeaderNum: string,
//   controlRange: 'MEMBER' | 'SALE',
//   deleteFlag: 1 | 0, // 协议采买权限props - 是否是已删除状态的协议
// }

// interface IAuthorityDetail {
//   readOnly: boolean,
//   authorityListId: string;
//   currentStep: number,
//   stepChange: (step: number) => {},
//   __sourceFrom: 'agreement' | '', // (协议采买权限 传的context) 区分哪个入口的权限新建 作用：1.采购协议维度过滤供应商 2.商品条件范围处的icon提示
//   init: IInitProps, // 基本信息表单初始默认值
//   // 保存、保存头、发布操作
//   agreementHeaderType: string, // 销售协议类型：领用 | 会员 | 以销定采 | 交易抽佣；控制用户、商品范围《导入按钮》相关 和 具体采买维度
//   viewSkuBackPath: string, // 商品详情返回路径
//   path: string, // 权限列表路由
// };

const { Step } = Steps;
const { TabPane } = Tabs;

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

const useUpdate = () => {
  const [flag, setFlag] = useState(1);
  const update = () => setFlag((pre) => pre + 1);
  return [flag, update];
};

const AuthorityDetail = (props) => {
  const {
    authorityListId,
    __sourceFrom,
    init = {},
    readOnly,
    currentStep,
    stepChange = () => null,
    agreementHeaderType,
    viewSkuBackPath = '/s2-mall/sagm/product-authority/list',
    path = '/s2-mall/sagm/product-authority/list',
    onRef,
    type,
    versionFlag,
    remote,
    // publishConfirmFlag,
  } = props;

  const [dimensionCodes, setDimensionCodes] = useState([]); // 对应频道和协议类型的所有维度（除去排除维度）
  const [loading, setLoading] = useState(false);
  const [stepInfo, setStepInfo] = useState({
    isExcludeSku: false,
    isExcludeUser: false,
    agreementHeaderNum: '',
  });
  // const [{ authorityListId: id, sateInit }, setData] = useState({ authorityListId, sateInit });

  const [refreshFlag, update] = useUpdate();

  const {
    initDs,
    userDs,
    skuDs,
    excludeUserDs,
    excludeUserTableDs,
    excludeSkuTableDs,
  } = useMemo(() => {
    return {
      initDs: new DataSet(formDs(readOnly)),
      userDs: new DataSet(tableDs(readOnly)),
      skuDs: new DataSet(tableDs(readOnly)),
      excludeUserDs: new DataSet(excludeUserDS(false)),
      excludeUserTableDs: new DataSet(excludeUserTableDS(readOnly)),
      excludeSkuTableDs: new DataSet(excludeSkuTableDS()),
    };
  }, [readOnly]);

  useEffect(() => {
    fetchCode();
  }, [authorityListId]); // 新建保存并下一步后， 需刷新维度

  useEffect(() => {
    // 新建
    if (!authorityListId) {
      initDs.create({ ...init, enableFlag: 1, __purManual: __sourceFrom === 'agreement' });
    } else {
      fetchData(authorityListId);
    }
  }, [type, versionFlag, refreshFlag]);

  useEffect(() => {
    if (onRef) {
      onRef({ handleSave, handleEdit });
    }
  }, [currentStep]);

  // 查询平台维度编码
  async function fetchCode() {
    const { channel = 'ENTERPRISE' } = init || {};
    // 平台级该租户维护的采买权限维度
    const res = getResponse(await queryUnifyIdpValue('SAGM.AUTH_CUSTOMIZE_DIMENSION'));
    if (res) {
      const noExclude = res.filter((f) => !['SKU_EXCLUDE', 'USER_EXCLUDE'].includes(f.value));
      // 领用协议，用户条件排除区域，商品条件只有商品
      const filterDimensionCodes = noExclude.filter((f) =>
        agreementHeaderType === 'RECEIVE'
          ? f.value === 'SKU' || (!['AREA'].includes(f.value) && f.dimensionType !== 'SKU')
          : true
      );
      setDimensionCodesFc(filterDimensionCodes, channel, update);
    }
  }

  const setDimensionCodesFc = (codes, channel, callback = () => {}) => {
    // 企业 ENTERPRISE 会员 PERSONAL
    const filterChannel = channel || 'ENTERPRISE';
    const _dimensionCodes = (codes || dimensionCodes).filter((f) =>
      ['NONE', filterChannel].includes(f.channel)
    );
    setDimensionCodes(_dimensionCodes);
    callback();
  };

  // 基本信息控制范围字段由会员-> 其他 | 其他 -> 会员
  // const handleRangeChange = (value, oldValue) => {
  //   if (value === 'MEMBER' || oldValue === 'MEMBER') {
  //     const channel = value === 'MEMBER' ? 'PERSONAL' : 'ENTERPRISE';
  //     setDimensionCodesFc(null, channel, () => {
  //       userDs.loadData([]);
  //     });
  //   }
  // };

  async function fetchData(_authorityListId) {
    // deleteFlag：协议采买权限props - 是否是已删除状态的协议
    const { agreementType, agreementHeaderId, deleteFlag } = init || {};
    // this.setState({ loading: true });
    // if (!readOnly) {
    //   modal.update({
    //     okProps: { loading: true },
    //   });
    // }
    setLoading(true);
    const res = await fetchInfo({
      agreementType,
      agreementHeaderId,
      authorityListId: _authorityListId,
      deleteFlag,
    });
    setLoading(false);
    // this.setState({ loading: false });
    // modal.update({
    //   okProps: { loading: false },
    // });
    const result = getResponse(res);
    if (result) {
      initData(result);
    }
  }

  async function initData(data) {
    const {
      authRangeDTOS = [], // 维护的维度集合（商品 + 用户范围）
      agreementHeaderNum,
      // authorityListId,
      allUserEnable,
      allSkuEnable,
      automaticallyFlag,
      agreementType,
      agreementHeaderId,
    } = data;

    // 有来源单号的手动创建的采购协议：过滤商品供应商维度
    const __purManual =
      agreementHeaderNum && agreementType === 'PUR_AGREEMENT' && !automaticallyFlag;
    // removeAll: 防止多次渲染重复加载数据
    initDs.removeAll();
    initDs.create({ ...data, __purManual });
    userDs.removeAll();
    skuDs.removeAll();
    excludeUserTableDs.removeAll();
    excludeSkuTableDs.removeAll();
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
      const line = getDimensionLine(f);
      // 部分用户tab
      if (!allUserEnable && f.type === 'USER') {
        userDs.create(line);
        userDs.validate(); // 触发页面初次加载失效区域校验
      }
      // 部分商品tab
      if (!allSkuEnable && f.type === 'SKU') {
        skuDs.create(line);
      }
    });
    // 加载排除部分用户数据
    (excludeUser.data || []).forEach((r) => {
      excludeUserTableDs.create(r);
    });
    // 加载排除商品
    const params = { agreementHeaderId, authorityListId, agreementType };
    Object.keys(params).forEach((key) => {
      excludeSkuTableDs.setQueryParameter(key, params[key]);
    });
    excludeSkuTableDs.query();
    // const res = await fetchAuthorityBindSku(params);
    // if (getResponse(res)) {
    //   const { content = [] } = res;
    //   content.forEach(f => {
    //     excludeSkuTableDs.create(f, 0);
    //   });
    // }
    // 初始化自定义维度列属性
    updateDsFieldProps(userDs);
    updateDsFieldProps(skuDs);
    setStepInfo({ agreementHeaderNum, isExcludeSku, isExcludeUser });
  }

  const getDimensionLine = (line) => {
    // 维度 是否是自定义维度
    const customDimension = getDimensionIsCustom(line.authDimension);
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

  // 维度是否为自定义维度
  const getDimensionIsCustom = (code) => {
    // const { dimensionCodes } = this.state;
    const preFlag = preDimensions.some((s) => s.code === code);
    const isDimensionPlat = dimensionCodes.some(
      (s) => s.dimensionCode === code && (s.tenantId === 0 || s.tenantId === '0')
    );
    const isPre = preFlag && isDimensionPlat;
    const customDimension = dimensionCodes.find((f) => f.dimensionCode === code);
    return isPre ? false : customDimension;
  };

  const updateDsFieldProps = (ds) => {
    ds.forEach((record) => {
      const code = record.get('dimensionCode');
      initCustomFields(code, record);
    });
  };

  const initCustomFields = (code, record) => {
    const preField = record.getField(code);
    const customLovField = record.getField('customDimension');
    const customSelectField = record.getField('customSelect');
    if (preField) {
      preField.reset();
    }
    customLovField.reset(); // 重置属性
    customSelectField.reset(); // 重置属性
    // 值存在同时不属于预定义维度
    const customDimension = getDimensionIsCustom(code);

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

  async function handleAfterImport(dimensionType) {
    const record = initDs.current;
    const { agreementType, agreementHeaderId } = record?.toData();
    const tDs = dimensionType === 'USER' ? userDs : skuDs;
    tDs.status = 'loading';
    // 刷新头信息
    const res = getResponse(
      await fetchInfo({
        agreementType,
        agreementHeaderId,
        authorityListId,
      })
    );
    tDs.status = 'ready';
    if (res) {
      const { objectVersionNumber, authRangeDTOS } = res;
      // eslint-disable-next-line no-unused-expressions
      record?.set('objectVersionNumber', objectVersionNumber);
      tDs.removeAll();
      // 过滤排除维度
      const dimensions = (authRangeDTOS || []).filter(
        (f) =>
          f.type === dimensionType && !['SKU_EXCLUDE', 'USER_EXCLUDE'].includes(f.authDimension)
      );
      // 重新加载Table数据
      dimensions.forEach((f) => {
        const line = getDimensionLine(f);
        tDs.create(line);
      });
      // 再次初始化自定义维度列属性
      updateDsFieldProps(tDs);
    }
  }

  // 路由页面编辑（提供给外部用）
  const handleEdit = (callback = () => null) => {
    const data = initDs.current.get([
      'authorityListId',
      'agreementHeaderType',
      'statusCode',
      'channel',
      'controlRange',
      'agreementType',
      'agreementHeaderId',
      'agreementHeaderNum',
    ]);
    callback(data);
  };

  // 弹窗 || 路由头部
  const handleSave = async (
    onlyHeadSave = false,
    saveCallback = () => null,
    type = 'save',
    refresh = true
  ) => {
    return new Promise(async (resolve) => {
      const authorityInfo = initDs.current.toData(); // 除权限范围以外的权限配置信息
      const configInfoFlag = await initDs.current.validate(); // 配置信息校验
      const { allUserEnable, allSkuEnable } = authorityInfo;
      // 头信息未校验通过
      if (!configInfoFlag) {
        resolve();
        return false;
      }
      // step 1： 保存头信息: 默认部分范围
      if (onlyHeadSave && configInfoFlag) {
        const params = {
          ...authorityInfo,
          authRangeDTOS: [],
        };
        const res = await saveAuthority(params);
        const result = getResponse(res);
        if (result) {
          saveCallback(res);
          notification.success();
          resolve();
          return true;
        }
        resolve();
        return false;
      }
      let userFlag = allUserEnable;
      let skuFlag = allSkuEnable;
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
          const isCustom = getDimensionIsCustom(dimensionCode);
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

      // step 2: 校验用户信息
      // 非全部范围触发Table校验
      if (!allUserEnable) {
        userFlag = await userDs.validate();
      }
      if (!userFlag) {
        resolve();
        return false;
      }
      const users = userDs.toData();
      const excludeUser = getFixedAuths(toJS(excludeUserTableDs.toData()), 'USER_EXCLUDE', 'USER');
      // 清除空元素
      const userAuths = (allUserEnable
        ? [excludeUser]
        : [...getAuths(users, 'USER'), excludeUser]
      ).filter((f) => f);

      // 用户信息表单校验通过
      if (userFlag) {
        // 发布需额外校验
        if (type === 'publish') {
          if (!allUserEnable && users.length < 1) {
            notification.warning({
              message: intl
                .get('sagm.common.view.message.userDimensionNotNull')
                .d('用户条件不能为空'),
            });
            resolve();
            return false;
          }
        }
        // const authRangeDTOS = [...userAuths];
        // const [isRepeatDimension] = isRepeat(authRangeDTOS, 'authDimension');
        // if (isRepeatDimension) {
        //   notification.warning({
        //     message: intl.get('sagm.common.view.deleteRepeatDimension').d('请删除重复条件'),
        //   });
        //   resolve();
        //   return false;
        // }
      }
      // 下一步
      if (type === 'next') {
        saveCallback();
        resolve();
        // 当前为操作用户条件， 点击下一步，后续无需执行
        if (currentStep === 1) {
          return;
        }
      }

      // step3: 校验商品信息
      if (!allSkuEnable) skuFlag = await skuDs.validate();
      if (!skuFlag) {
        resolve();
        return false;
      }
      // 商品信息校验通过
      if (skuFlag) {
        const skus = skuDs.toData();
        const skuAuths = allSkuEnable ? [] : getAuths(skus, 'SKUS');
        // const authRangeDTOS = [...skuAuths];
        // const [isRepeatDimension] = isRepeat(authRangeDTOS, 'authDimension');
        const noSku = skus.some((s) => s.dimensionCode === 'SKU' && !s.hasSku);
        // if (isRepeatDimension) {
        //   notification.warning({
        //     message: intl.get('sagm.common.view.deleteRepeatDimension').d('请删除重复条件'),
        //   });
        //   resolve();
        //   return false;
        // }
        if (!allSkuEnable && noSku) {
          notification.warning({
            message: intl.get('sagm.common.view.skuDimensionAddSku').d('商品维度请加入商品'),
          });
          resolve();
          return false;
        }
        if (type === 'publish') {
          if (!allSkuEnable && skus.length < 1) {
            notification.warning({
              message: intl
                .get('sagm.common.view.message.skuDimensionNotNull')
                .d('商品条件不能为空'),
            });
            resolve();
            return false;
          }
        }
        const params = {
          ...authorityInfo,
          authRangeDTOS: [...userAuths, ...skuAuths],
        };

        // 保存
        if (type === 'save') {
          save(params, refresh, saveCallback);
          resolve();
          return true;
        }
        // 发布
        publish(params, saveCallback);

        resolve();
        return true;
      }
      resolve();
      return false;
    });
  };

  const save = async (params, refresh, callback) => {
    setLoading(true);
    const res = await saveAuthority(params);
    setLoading(false);
    const result = getResponse(res);
    if (result) {
      // 保存
      notification.success();
      if (refresh) {
        fetchData(result.authorityListId);
      } else {
        callback();
      }
    }
  };

  async function publish(saveParams, callback) {
    confirm({
      content: intl
        .get('sagm.productAuthority.view.confirm.publishInfoTip')
        .d(
          '权限发布可能占用大量系统资源并持续数小时，请务必在夜间或休息日发布。若发布报错请联系管理员处理。是否继续？'
        ),
      onOk: async () => {
        return new Promise(async (resolve) => {
          const publishParams = initDs.current.toData();
          // 先保存
          const result1 = getResponse(await saveAuthority(saveParams));
          if (result1) {
            // 更新版本
            fetchData(result1.authorityListId);
            // 再发布
            const result2 = getResponse(await publishAuthority(publishParams));
            if (result2) {
              notification.success({
                description: intl
                  .get('sagm.common.view.publishHelp')
                  .d('当数据量较大时执行可能耗时数个小时，请耐心等待'),
              });
              callback();
              resolve();
            }
            resolve();
          }
          resolve();
        });
      },
    });
  }

  const isModal = __sourceFrom;
  const rangeProps = {
    readOnly,
    isExcludeSku: stepInfo.isExcludeSku,
    isExcludeUser: stepInfo.isExcludeUser,
    dimensionCodes,
    viewSkuBackPath,
    agreementHeaderNum: stepInfo.agreementHeaderNum,
    agreementHeaderType,
    path,
    initDs,
    userDs,
    skuDs,
    excludeUserDs,
    excludeUserTableDs,
    excludeSkuTableDs,
    onRefresh: handleAfterImport,
    initCustomFields,
    getDimensionIsCustom,
    type: currentStep === 1 ? 'USER' : 'SKU',
    remote,
    isModal,
  };
  const BaseTitleComp = isModal ? Card : SubContent;
  return (
    <Spin spinning={loading}>
      {!authorityListId || type === 'create' ? (
        <div
          className={classnames(styles['authority-step-wrapper'], {
            [styles['authority-step-modal']]: isModal, // 弹窗、路由页面样式不同
          })}
        >
          <div className="authority-step">
            <Steps current={currentStep}>
              <Step title={intl.get('sagm.productAuthority.view.step.baseInfo').d('基础信息')} />
              <Step
                title={intl.get('sagm.productAuthority.view.step.userRange').d('用户条件范围')}
              />
              <Step
                title={intl.get('sagm.productAuthority.view.step.skuRange').d('商品条件范围')}
              />
            </Steps>
          </div>
          {!isModal && <div className="divider" />}
          <div className="authority-step-content">
            {currentStep === 0 && (
              <Content style={{ padding: 0 }}>
                <BaseTitleComp
                  title={intl.get('sagm.productAuthority.view.step.baseInfo').d('基础信息')}
                >
                  <AuthorityInfo
                    initDs={initDs}
                    readOnly={readOnly}
                    useWidthPercent={!isModal} // 弹窗页面
                  />
                </BaseTitleComp>
              </Content>
            )}
            {currentStep === 1 && (
              <Content style={{ padding: 0 }}>
                <AuthorityRange {...rangeProps} />
              </Content>
            )}
            {currentStep === 2 && (
              <Content style={{ padding: 0 }}>
                <AuthorityRange {...rangeProps} />
              </Content>
            )}
          </div>
        </div>
      ) : (
        <>
          <div
            className={classnames(styles['authority-tab-content'], {
              [styles['authority-tab-modal']]: isModal,
            })}
          >
            <Tabs
              defaultActiveKey="0"
              tabPosition="left"
              onChange={(current) => stepChange(Number(current))}
            >
              <TabPane
                tab={intl.get('sagm.productAuthority.view.step.baseInfo').d('基础信息')}
                key="0"
              >
                <BaseTitleComp
                  title={intl.get('sagm.productAuthority.view.step.baseInfo').d('基础信息')}
                >
                  <AuthorityInfo
                    initDs={initDs}
                    readOnly={readOnly}
                    useWidthPercent={!isModal} // 弹窗页面
                  />
                </BaseTitleComp>
              </TabPane>
              <TabPane
                tab={intl.get('sagm.productAuthority.view.step.userRange').d('用户条件范围')}
                key="1"
              >
                <AuthorityRange {...rangeProps} />
              </TabPane>
              <TabPane
                tab={intl.get('sagm.productAuthority.view.step.skuRange').d('商品条件范围')}
                key="2"
              >
                <AuthorityRange {...rangeProps} />
              </TabPane>
            </Tabs>
          </div>
        </>
      )}
    </Spin>
  );
};
export default flowRight(
  // 【新希望六和】 mall-8707: 排除商品 筛选条件 【是否已上架】 默认值 是
  remoteFunc({ code: 'AUTHORITY_DETAIL', name: 'remote' }),
  formatterCollections({
    code: ['sagm.common', 'sagm.productAuthority', 'small.common', 'hzero.common', 'smpc.common'],
  })
)(AuthorityDetail);
