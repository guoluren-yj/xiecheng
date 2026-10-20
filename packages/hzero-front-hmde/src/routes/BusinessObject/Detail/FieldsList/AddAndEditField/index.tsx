/* eslint-disable no-unused-expressions */
import React, { useRef, useState, useMemo, useEffect } from 'react';
import intl from 'srm-front-boot/lib/utils/intl';
import notification from 'hzero-front/lib/utils/notification';
// import { Header, Content } from 'hzero-front/lib/components/Page';
import formatterCollections from 'srm-front-boot/lib/utils/intl/formatterCollections';
import { Button, Spin, TextField } from 'choerodon-ui/pro';
import { Row, Col } from 'choerodon-ui';
import { Observer } from 'mobx-react-lite';
// import qs from 'querystring';
import { isEmpty, omitBy, cloneDeep, isArray } from 'lodash';
import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import {
  getResponse,
  isTenantRoleLevel,
  getCurrentOrganizationId,
} from 'hzero-front/lib/utils/utils';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';
import { WaitType } from 'choerodon-ui/pro/lib/core/enum';

import IconPicker from '@/businessComponents/icon-picker';
// import { usePublicBusinessObjects } from '@/routes/BusinessObject/Detail';
import { SourceType } from '@/businessGlobalData/common';

import {
  createBusinessObjectField,
  updateBusinessObjectField,
  getBusinessObjectField,
  createPlateformExtensionBusinessObjectField,
  updatePlateformExtensionBusinessObjectField,
  getPlateformExtensionBusinessObjectField,
  createTenantExtensionBusinessObjectField,
  getTenantBusinessObjectFieldDetail,
  createDomainTemplateField,
} from '@/services/businessObjectService';

import { getDataSource, IChildren } from '@/businessComponents/icon-picker/enums';
import styles from './index.less';
import Select from '../FieldComponents/select';
import CodingRules from '../FieldComponents/CodingRules';
import Formula from '../FieldComponents/formula';
import CommonField from '../FieldComponents/CommonField';
import { FieldSourceType } from '../constants/constants';

const isTenant = isTenantRoleLevel();
/**
 * 从已有数据源中获取符合callback条件的字段类型信息
 * @param callback
 */
const getFieldItem = callback => {
  let childrenList: IChildren[] = [];
  getDataSource().forEach(item => {
    childrenList = [...childrenList, ...item.children];
  });
  const res = childrenList.find(callback);
  return res;
};

// 用于存储当前字段的缓存信息
const store = {
  dataMap: new Map(),
  getItem: key => store.dataMap.get(key),
  setItem: (key, value) => {
    store.dataMap.set(key, value);
  },
  delete: key => {
    store.dataMap.delete(key);
  },
};
const Index = props => {
  const {
    // history,
    fieldType,
    published,
    boSourceType,
    inheritFieldId,
    businessObjectId,
    businessObjectCode,
    // setShowFieldDetail,
    // businessObjectName,
    customPrimaryKeyCode,
    businessObjectFieldId,

    // 领域 TODO
    level,
    domainId,
    templateFieldId,
    tenantId: domainTenantId,
    tenantName: domainTenantName,
    selectItemTenantId = '',

    // 公共属性
    // setShowDomain,
    // setShowFieldList,
    // fromKey,
    permissionFlag,
    modal,
    onRefresh,
  } = props;

  const saveSessionStorage = () => {
    sessionStorage.setItem(
      'domainInfo',
      JSON.stringify({
        level,
        tenantId: domainTenantId,
        tenantName: domainTenantName,
        domainId,
        selectItemTenantId,
      })
    );
  };

  const iconRef: any = useRef();
  const childrenComRef: any = useRef(); // 用于拿子组件的回调
  const [loading, setLoading] = useState<boolean>(false);
  const [detailData, setDetailData]: [any, any] = useState();
  // const [releaseLoading, setReleaseLoading] = useState(false);
  const [componentType, setComponentType] = useState<string>('');
  const [selectComponentName, setSelectComponentName] = useState<string>();
  const [selectedExampleInfo, setSelectedExampleInfo] = useState<IChildren>();

  const isEditMode = !!businessObjectFieldId || !!inheritFieldId || !!templateFieldId; // 是否为编辑
  const isEditCurField = isEditMode && detailData?.componentType === selectedExampleInfo?.value; // 编辑态 并且相信字段类型和当前选中字段类型一致
  const isExtensionField = [
    FieldSourceType.ElasticDomainField,
    FieldSourceType.ExtensionTableField,
  ].includes(fieldType); // 是否为扩展字段
  const isFromDomain = domainId && !businessObjectId; // 是否从领域入口跳转

  const allPlugin = useMemo(
    () => ({
      select: Select,
      CodingRules,
      formula: Formula,
      CommonField,
    }),
    [selectComponentName]
  );

  useEffect(() => {
    init();
    return () => {
      // 组件卸载清除缓存数据
      store.dataMap.clear();
    };
  }, []);

  // 编辑初始化查询
  const init = () => {
    if (isEditMode) {
      // 进入编辑态
      setLoading(true);
      // 扩展字段调用不同接口
      let getDetailName = isExtensionField
        ? getPlateformExtensionBusinessObjectField
        : getBusinessObjectField;
      if (isTenant) {
        getDetailName = getTenantBusinessObjectFieldDetail;
      }
      let query = {};
      if (isTenant) {
        query = {
          businessObjectFieldId,
          businessObjectId,
          inheritFieldId,
        };
      }
      getDetailName({ businessObjectFieldId, query })
        .then(res => {
          setLoading(false);
          if (res && !res.failed) {
            setDetailData(res); // 缓存详情数据
            setComponentType(res?.componentType);
            const obj = getFieldItem(item => item.value === res?.componentType);
            const currentDs = `${obj?.componentName}Ds`;
            // eslint-disable-next-line no-unused-expressions
            iconRef.current?.setValue(obj);
            setSelectComponentName(obj?.componentName);
            setSelectedExampleInfo(obj);
            setTimeout(() => {
              childrenComRef.current?.[currentDs]?.loadData([res]);
              childrenComRef?.current?.customInitChild?.(res);
              childrenComRef.current?.[currentDs]?.setState('tlsParams', {
                businessObjectFieldId,
                inheritFieldId,
              });
            }, 0);
          } else {
            notification.error({
              message: intl.get('hzero.common.message.errorMessage').d('错误信息:'),
              description: res.message,
            });
          }
        })
        .catch(err => {
          setLoading(false);
          notification.error({
            message: intl.get('hzero.common.message.errorMessage').d('错误信息:'),
            description: err.message,
          });
        });
    }
  };

  const editComponentTypeFilter = data => {
    const textType = [
      'TEXT_FIELD', // 文本
      'PHONE_NUMBER', // 手机号码
      'SINGLE_SELECT', // 下拉单选
      'MULTIPLE_SELECT', // 下拉多选
      'RADIO', // 单选框
      'CHECKBOX', // 复选
      'APPENDIX', // 附件
      'EMAIL', // 电子邮箱
      'LINK', // 超链接
      'CODE_RULE',
    ];
    // 不可修改
    const cannotChangeType = [
      // 'TEXT_AREA', // 多行文本
      // 'NUMBER_FIELD', // 整数
      'SWITCH', // 开关
      'FORMULA', // 公式
      'DATE_SELECTION_BOX', // 日期
      'DATETIME_SELECTION_BOX', // 日期时间
      'LINK_RELATION', // 关联关系
      'MASTER_RELATION', // 从主关系
      'REFERENCE_FIELD', // 引用关系
    ];
    // 浮点类型
    const floatType = ['FLOAT', 'PERCENTAGE', 'MONEY'];
    const intType = ['NUMBER_FIELD', 'LINK_RELATION', 'MASTER_RELATION']; // 整数
    const initComponentType = detailData?.componentType; // 编辑态初始字段类型
    const inheritFieldCode = detailData?.inheritFieldCode;
    if (isTenant && isExtensionField) {
      const filterTypeArr: any = [
        // 'MASTER_RELATION', // 从主关系
        // 'LINK_RELATION', // 关联关系
      ];
      if (isEditMode) {
        return data
          .map(item => ({
            ...item,
            children:
              item.children?.filter(({ value }) => {
                if (initComponentType === 'TEXT_FIELD' && inheritFieldCode && inheritFieldCode.includes('attributeLongtext')) {
                  return value === 'TEXT_AREA' || (textType.includes(value) && !filterTypeArr.includes(value));
                } else if (initComponentType && textType.includes(initComponentType)) {
                  return textType.includes(value) && !filterTypeArr.includes(value);
                } else if (initComponentType && cannotChangeType.includes(initComponentType)) {
                  return false;
                } else if (initComponentType && floatType.includes(initComponentType)) {
                  return floatType.includes(value) && !filterTypeArr.includes(value);
                } else if (initComponentType === 'NUMBER_FIELD') {
                  return intType.includes(value) && !filterTypeArr.includes(value);
                } else if (initComponentType === 'TEXT_AREA') {
                  return textType.includes(value) || value === 'TEXT_AREA';
                }
                return !filterTypeArr.includes(value);
              }) || [],
          }))
          .filter(({ children }) => children.length);
      } else {
        return data
          .map(item => ({
            ...item,
            children:
              item.children?.filter(({ value }) => {
                return !filterTypeArr.includes(value);
              }) || [],
          }))
          .filter(({ children }) => children.length);
      }
    }
    if (!isEditMode) {
      // 领域新建标准字段
      if (isFromDomain && !isExtensionField) {
        // 过滤 公式字段 引用 从主 自动编号
        const filterTypeArr = [
          'FORMULA', // 公式
          'MASTER_RELATION', // 从主关系
          'REFERENCE_FIELD', // 引用关系
          'CODE_RULE', // 自动编号
          'LINK_RELATION',
        ];
        return data
          .map(item => ({
            ...item,
            children: item.children?.filter(({ value }) => {
              return !filterTypeArr.includes(value);
            }),
          }))
          .filter(({ children }) => children.length);
      }
      // 平台新建扩展字段
      if (!isTenant && isExtensionField) {
        const platformCreateExtensionFilter = [
          'TEXT_FIELD',
          'TEXT_AREA',
          'NUMBER_FIELD',
          'FLOAT',
          'DATE_SELECTION_BOX',
          'DATETIME_SELECTION_BOX',
          'SWITCH',
        ];
        return data
          .map(item => ({
            ...item,
            children: item.children?.filter(({ value }) => {
              return platformCreateExtensionFilter.includes(value);
            }),
          }))
          .filter(({ children }) => children.length);
      }
    } else if (isEditMode) {
      // 编辑时需要根据保存的字段类型过滤
      // 文本
      return data
        .map(item => ({
          ...item,
          children:
            item.children?.filter(({ value }) => {
              if (initComponentType === 'TEXT_FIELD' && inheritFieldCode && inheritFieldCode.includes('attributeLongtext')) {
                return value === 'TEXT_AREA' || textType.includes(value);
              } else if (initComponentType && textType.includes(initComponentType)) {
                return textType.includes(value);
              } else if (initComponentType && cannotChangeType.includes(initComponentType)) {
                return false;
              } else if (initComponentType && floatType.includes(initComponentType)) {
                return floatType.includes(value);
              } else if (initComponentType === 'NUMBER_FIELD') {
                return intType.includes(value);
              } else if (initComponentType === 'TEXT_AREA') {
                return textType.includes(value) || value === 'TEXT_AREA';
              }
              return true;
            }) || [],
        }))
        ?.filter(({ children }) => children.length);
    }

    return data;
  };

  // 组件change回调
  const handleTypeChange = (obj = {} as any) => {
    const { value, componentName } = obj;
    if (value) {
      const currentDs = `${selectComponentName}Ds`;
      if (!isEditMode && childrenComRef.current) {
        // 缓存当前表单公共字段值
        const formValues = childrenComRef.current?.[currentDs]?.current?.toData() || {};
        store.setItem('commonFieldData', {
          inheritFieldName: formValues?.inheritFieldName,
          businessObjectFieldName: formValues?.businessObjectFieldName,
          inheritFieldCode: formValues?.inheritFieldCode,
          businessObjectFieldCode: formValues?.businessObjectFieldCode,
          helpText: cloneDeep(formValues?.helpText),
          remark: formValues?.remark,
          // attributeJson: formValues?.attributeJson,
        });
      }
      const nextDs = `${componentName}Ds`;
      setComponentType(value);
      setSelectedExampleInfo(obj);
      setSelectComponentName(componentName);
      if (!isEditMode) {
        setTimeout(() => {
          const catchObj = store.getItem('commonFieldData');
          if (catchObj) {
            for (const key in catchObj) {
              if (Object.prototype.hasOwnProperty.call(catchObj, key) && catchObj?.[key]) {
                // eslint-disable-next-line no-unused-expressions
                childrenComRef.current?.[nextDs]?.current?.set(`${key}`, catchObj?.[key]);
              }
            }
          }
        }, 0);
      }
      if (isEditMode) {
        setTimeout(() => {
          const initData = {
            ...detailData,
            attributeJson: {},
            ...(detailData?.attributeJson || {}),
          };
          const fields = [...(childrenComRef.current?.[nextDs]?.fields?.keys?.() || [])];
          const flagFields = [
            'creationDate',
            'createdBy',
            'lastUpdateDate',
            'lastUpdatedBy',
            '_token',
            'tenantId',
            'businessObjectFieldCode',
            'businessObjectFieldName',
            'businessObjectFieldId',
            'businessObjectId',
            'inheritFieldId',
            'objectVersionNumber',
            'extendFieldDigitalAccuracy',
          ];
          // 字段类型变更   属性匹配当前类型属性配置
          for (const key in initData) {
            // eslint-disable-next-line no-prototype-builtins
            if (initData?.hasOwnProperty(key)) {
              if (!fields.includes(key) && !flagFields.includes(key)) {
                delete initData[key];
              }
              // eslint-disable-next-line no-prototype-builtins
              if (detailData.attributeJson?.hasOwnProperty(key)) {
                Object.assign(initData.attributeJson, { [key]: initData[key] });
                delete initData[key];
              }
              initData.attributeJson = omitBy(initData.attributeJson, v => v === undefined);
            }
          }

          childrenComRef.current?.[nextDs]?.loadData([initData]);
          childrenComRef?.current?.customInitChild?.(initData);
          childrenComRef.current?.[nextDs]?.setState('tlsParams', {
            businessObjectFieldId,
            inheritFieldId,
          });
        }, 0);
      }
    } else {
      setSelectedExampleInfo(undefined);
      setSelectComponentName(undefined);
    }
  };

  /**
   * 保存|继续添加
   * @param type 标识 保存|继续添加
   */
  const handleSave = async type => {
    const currentDs = `${selectComponentName}Ds`;
    if (childrenComRef.current?.[currentDs]?.current) {
      childrenComRef.current[currentDs].current.status = 'update';
    }
    const res = await childrenComRef.current?.[currentDs]?.current?.validate();
    // let formValues = childrenComRef.current?.[currentDs]?.current?.toJSONData() || {}; toJSONData 用于拿增量数据 会把全部修改过的数据带过来 load的数据因为默认未修改不会被带出
    let formValues = childrenComRef.current?.[currentDs]?.current?.toData() || {};
    formValues = { ...detailData, ...formValues }; // 保存的时候需要把上次的数据也带上，防止有一些表单字段不显示，导致值丢失

    if (selectComponentName === 'CodingRules') {
      // 这个顺序不能动，必须放在最前面，否则后面会有BUG
      formValues = childrenComRef.current?.getFieldsValue(businessObjectFieldId, detailData);
    }
    if (['none', 'EXPRESSION'].indexOf(formValues.defaultValueType) === 0) {
      formValues.defaultValueType = 'none';
    }
    if (formValues) {
      // 自定义取数据方法
      formValues.attributeJson = { ...formValues?.attributeJson, componentType };
    }
    if (selectComponentName === 'select') {
      if (formValues.attributeJson?.optionSettings === '_custom') {
        formValues.attributeJson.customOptionList = formValues.customOptionList.map(item => ({
          value: item?.value,
          orderSeq: item?.orderSeq,
          meaning:
            item?._tls?.meaning ||
            window.dvaApp?._store
              ?.getState?.()
              ?.global?.supportLanguage?.map?.(({ value }) => ({ [value]: item?.meaning }))
              ?.reduce?.((obj, lang) => ({ ...obj, ...lang }), {}),
        }));
        delete formValues?.lovCode;
        delete formValues?.lovName;
        delete formValues?.valueList;
      } else {
        delete formValues?.attributeJson?.customOptionList;
      }

      delete formValues.customOptionList;
      delete formValues.attributeJson?.optionSettings;
    }
    if (componentType === 'DATE_SELECTION_BOX' && formValues?.defaultValueType === 'NORMAL') {
      // 修复组件的BUG，组件返回值会默认带上时间。比如："2021-12-23 00:00:00" 这样的格式
      // 日期类型，不要时间，所以在这里切一刀
      formValues = { ...formValues, defaultValue: formValues?.defaultValue?.split(' ')[0] };
    }
    if (
      (componentType === 'DATE_SELECTION_BOX' || componentType === 'DATETIME_SELECTION_BOX') &&
      formValues?.defaultValue === 'none'
    ) {
      delete formValues.defaultValue;
    }
    if (componentType === 'LINK_RELATION' || componentType === 'MASTER_RELATION') {
      delete formValues.masterBusinessObject;
    }
    if (componentType === 'REFERENCE_FIELD') {
      formValues = { ...formValues, formula: formValues?.newFormula };
    }
    if (componentType === 'SWITCH') {
      if (formValues.meaningConfig === 'selfConfig') {
        formValues.attributeJson = {
          ...formValues.values,
          componentType: 'SWITCH',
          customOptionList: [
            { value: '0', orderSeq: 10, meaning: formValues.falseMeaning },
            { value: '1', orderSeq: 20, meaning: formValues.trueMeaning },
          ],
        };
        delete formValues.valueList;
        delete formValues.lovCode;
        delete formValues.lovName;
      } else {
        delete formValues.attributeJson.customOptionList;
      }
    }
    if (componentType === 'APPENDIX') {
      // 这个后端做了校验，必须是一个数组，或则不传
      if (!isArray(formValues.fileTypes)) {
        delete formValues.fileTypes;
      }
      if (!isArray(formValues.attributeJson.fileTypes)) {
        delete formValues.attributeJson.fileTypes;
      }
    }
    // 构建提交的参数
    if (res && !isEmpty(formValues)) {
      let body = {
        ...formValues,
        componentType,
        inheritSourceType: !isExtensionField ? 'STANDARD' : 'EXTEND',
      };
      let query: { businessObjectId?: string } = {
        businessObjectId, // TODO: 待联调 需要父组件传递进来
      };
      // 平台标准字段新增编辑
      let serviceName = businessObjectFieldId
        ? updateBusinessObjectField
        : createBusinessObjectField;
      if (isFromDomain) {
        serviceName = createDomainTemplateField;
        query = {};
        body = {
          ...body,
          domainId,
          category: !isExtensionField ? 'STANDARD' : fieldType,
          inheritSourceType: undefined,
        };
      } else {
        if (!isTenant && !isEditMode && isExtensionField) {
          // 平台新增扩展字段
          serviceName = createPlateformExtensionBusinessObjectField;
          body = {
            ...body,
            extendCategory: fieldType,
            tenantId: getCurrentOrganizationId(),
            businessObjectId,
          };
        }
        if (!isTenant && isEditMode && isExtensionField) {
          // 平台编辑扩展字段（现在都是禁用的）
          serviceName = updatePlateformExtensionBusinessObjectField;
        }
        if (isTenant) {
          // 新增、更新 都是一个接口
          serviceName = createTenantExtensionBusinessObjectField;
          if (isEditMode && !isExtensionField) {
            // 编辑平台标准字段返回的是 businessObjectFieldCode | businessObjectFieldName
            body = {
              ...body,
              inheritFieldCode: body.businessObjectFieldCode,
              inheritFieldName: body.businessObjectFieldName,
              businessObjectFieldCode: undefined,
              businessObjectFieldName: undefined,
            };
          }
        }
      }
      if (body.valueList) {
        if (body.valueList.lovCode) {
          body.lovCode = body.valueList.lovCode;
        }
        if (body.valueList.lovTypeCode) {
          body.lovType = body.valueList.lovTypeCode;
        }
      }
      // 新建时 非日期时间类型字段去掉timeZoneConvertFlag标识
      if (!isEditMode && body.resultType !== "ZonedDateTime" && body.componentType !== "DATETIME_SELECTION_BOX") {
        body.timeZoneConvertFlag = false;
      }
      setLoading(true);
      serviceName({ body, query })
        .then(r => {
          if (getResponse(r)) {
            notification.success({
              message: intl.get('hzero.common.notification.success.save').d('保存成功'),
            } as any);
            if (type === 'continueAdd') {
              iconRef.current?.emitEmpty?.(); // 清空输入框
              // 清空数据
              setLoading(false);
              setSelectComponentName(undefined);
              setSelectedExampleInfo(undefined);
            } else {
              // 跳转回字段列表
              if (modal && modal.close) {
                modal.close();
              }
              onRefresh();
              if (isFromDomain) {
                saveSessionStorage();
              }
            }
            setLoading(false);
          } else {
            setLoading(false);
          }
        })
        .catch(err => {
          notification.error({
            message: intl.get('hzero.common.message.errorMessage').d('错误信息:'),
            description: err.message,
          });
        });
    }
  };

  // 取消
  const handleCancel = async () => {
    if (isFromDomain) {
      saveSessionStorage();
    }
    if (modal && modal.close) {
      modal.close();
    }
  };

  // 租户查看平台标准字段的时候 或者 平台层编辑扩展字段时 并且 编辑时未切换字段 或系统预置对象 统统禁用
  const disabledFlag =
    detailData?.standardFlag || // 标准字段一定不能编辑
    (!isTenant && isExtensionField && isEditCurField) || // 平台层扩展字段也不能编辑
    boSourceType === SourceType.PREDEFINE; // 系统预置不能编辑
  // TODO 租户层只能编辑部分字段 https://shimo.im/sheets/TDPwHgdTWWWhYjXc/dWDMa

  const storeData = {
    // 需要传给子组件的属性 待维护
    childrenComRef,
    selectedExampleInfo,
    // disabled: isEditMode, // 控制编码是否禁用
    disabled: disabledFlag,
    businessObjectId,
    isEditMode,
    isExtensionField, // 字段列表中扩展字段的tab !isExtensionField标准字段  目前业务对象就两类 要么标准字段要么扩展字段
    isFromDomain,
    businessObjectCode,
    parentInit: init, // 父组件的初始化方法传给子组件
    detailData,
    customPrimaryKeyCode, // 自定义主键编码
    inheritFieldId,
    businessObjectPublished: isEditMode && published && JSON.parse(published), // 业务对象是否发布
    boSourceType, // 业务对象来源类型
  };
  /**
   * 动态导入需要加载组件
   * @param _fieldName 维护的文件名和enums枚举中的value值对应
   */
  const renderFieldComponents = _fieldName => {
    const Component = allPlugin[_fieldName];
    return <Component {...storeData} />;
  };

  return (
    <Observer>
      {() => (
        <>
          <div className={styles.content}>
            <div className={styles.main}>
              <Spin spinning={loading}>
                <div className={styles.title} style={{ marginBottom: '24px' }}>{intl.get('hmde.bo.field.componentType').d('字段类型')}</div>
                <Row gutter={10}>
                  <Col span={12}>
                    <div style={{ display: 'flex', alignItems: 'center', height: 28 }}>
                      <IconPicker
                        // 租户不能对平台标准字段进行编辑  平台不能编辑扩展字段
                        disabled={
                          detailData?.standardFlag ||
                          (isTenant && isEditMode && !isExtensionField) ||
                          (!isTenant && isEditMode && isExtensionField)
                        }
                        showText={boSourceType === SourceType.PREDEFINE}
                        style={{ padding: '0 0.05rem', width: '100%'}}
                        dataSource={editComponentTypeFilter(getDataSource())}
                        onChange={handleTypeChange}
                        iconPickerRef={iconRef}
                      />
                    </div>
                  </Col>
                  <Col span={12}>
                    <div style={{ display: 'flex', alignItems: 'center', height: 28 }}>
                      <TextField
                        labelLayout={LabelLayout.float}
                        style={{ width: '100%' }}
                        label={intl.get('hmde.bo.field.sourceOrigin').d('字段来源：')}
                        value={isExtensionField
                          ? `${intl.get('hmde.bo.field.view.message.tab.extendField').d('扩展字段')}`
                          : `${intl
                            .get('hmde.bo.field.view.message.tab.standardField')
                            .d('标准字段')}`}
                        disabled
                      />
                    </div>
                  </Col>
                </Row>
                {selectComponentName && (
                  <>
                    <div className={styles.title} style={{ marginTop: '32px' }}>{intl.get('hmde.bo.field.props').d('字段属性')}</div>
                    <Row gutter={10}>
                      <Col span={24}>
                        {renderFieldComponents(selectComponentName)}
                      </Col>
                    </Row>
                  </>
                )}
              </Spin>
            </div>
            <div className={styles.footer}>
              {(isTenant || permissionFlag) && (
                <>
                  <Button
                    color={ButtonColor.primary}
                    hidden={isEditMode}
                    waitType={WaitType.debounce}
                    wait={300}
                    onClick={handleSave.bind(null, 'continueAdd')}
                  >
                    {intl.get('hmde.common.button.continueAdd').d('继续添加')}
                  </Button>
                  {boSourceType !== SourceType.PREDEFINE && (
                    <Button
                      color={isEditMode ? ButtonColor.primary : undefined}
                      onClick={handleSave.bind(null, 'save')}
                      waitType={WaitType.debounce}
                      wait={300}
                      // 平台不能编辑扩展字段
                      disabled={!isTenant && isEditMode && isExtensionField}
                    >
                      {intl.get('hzero.common.button.save').d('保存')}
                    </Button>
                  )}
                </>
              )}
              <Button onClick={handleCancel}>
                {intl.get('hzero.common.button.cancel').d('取消')}
              </Button>
            </div>
          </div>
        </>
      )}
    </Observer>
  );
};
export default formatterCollections({
  code: ['hmde.common', 'hzero.common', 'hmde.bo', 'hzero.c7nProUI', 'hzero.common', 'hmde.domainOwnBOList'],
})(Index);
