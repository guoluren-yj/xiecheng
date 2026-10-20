/*
 * @Descripttion: 领域管理页面
 * @Date: 2021-08-04 13:39:58
 * @Author: ZHIWEI.DENG@HAND-CHINA.COM
 * @version: 0.0.1
 * @copyright: Copyright (c) 2021, Hand
 */
import React, { useMemo, useEffect, useReducer, useState, useRef } from 'react';
import {
  Button,
  DataSet,
  Icon,
  Form,
  Output,
  // Lov,
  Spin,
  Modal,
  IntlField,
  Switch,
  TextArea,
  Table,
  Select,
  SelectBox,
} from 'choerodon-ui/pro';
import { Tag, Tooltip, Radio, Popconfirm, Collapse } from 'choerodon-ui';
import { observer } from 'mobx-react-lite';
import { isNil, isNull } from 'lodash';
// import qs from 'querystring';
import { Header } from 'components/Page';
import { ButtonColor, ButtonType, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import { ColumnAlign, ColumnLock } from 'choerodon-ui/pro/lib/table/enum';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';
import { operatorRender, yesOrNoRender } from 'utils/renderer';
import notification from 'utils/notification';
import {
  isTenantRoleLevel,
  getCurrentOrganizationId,
  getCurrentTenant,
  getResponse,
} from 'utils/utils';
import intl from 'srm-front-boot/lib/utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { openTab } from 'utils/menuTab';

import {
  DomainListDataSetConfig,
  CreateAndEditDataSetConfig,
  DomainFieldsDataSetConfig,
} from '@/stores/Domain/DomainListDS';
import { SelectedListDS } from '@/stores/Domain/ObjectSelectDS';
import { generateHZERODataSource } from '@/services/businessObjectService';
import { Operators, SourceType } from '@/businessGlobalData/common';
import ImgIcon from '@/utils/ImgIcon';
import AddAndEditField from '@/routes/BusinessObject/Detail/FieldsList/AddAndEditField';
import TrueOrFalseRender from '@/businessComponents/TrueOrFalseRender';

import ModalContent from './ModalContent';
import List from './List';
import HeadSelect from './HeadSelect';
import ObjectSelectModal from './ObjectSelectModal';
import TagRender from './TagRender';
// import EditListModal from './EditListModal';
// import LovDS from './store/LovDS';
import sourceStore from './store';

import styles from './index.less';

const isTenant = isTenantRoleLevel();
const currentTenantId = getCurrentOrganizationId();
const { tenantName: currentTenantName } = getCurrentTenant();

interface IDomainItem extends Object {
  domainId: string;
  domainCode?: string;
  domainName?: string;
  icon?: string;
  remark?: string;
  serviceCode?: string;
  serviceState?: number;
  datasourceId?: string;
  tenantId?: string | number;
}

const { Option } = Select;

enum LevelType {
  PLATFORM = 'platform',
  TENANT = 'tenant',
}

enum BusinessSourceCategory {
  StandardField = 'STANDARD', // 标准
  FlexField = 'FLEX_FIELD', // 弹性域
  ExtensionTableField = 'EXTEND_TABLE', // 扩展表字段
}

const sourceTypeMap = {
  PREDEFINE: '系统标准领域',
  PLATFORM: '平台标准领域',
  TENANT: '租户自定义领域',
};

export const LabelTitleRender = ({ value, help }: { value: any; help?: any }) => {
  return (
    <span className={styles['label-contain']}>
      <span>
        {value}
        {help && (
          <Tooltip title={help}>
            <Icon type="help_outline" />
          </Tooltip>
        )}
      </span>
    </span>
  );
};

interface IDomainPropInfo {
  level?: string;
  tenantId?: string;
  tenantName?: string;
  domainId?: string;
  selectItemTenantId?: string;
}

const Domain = observer(() => {
  // const { history } = props;
  let domainPropInfo: IDomainPropInfo = {};
  try {
    domainPropInfo = JSON.parse(sessionStorage.getItem('domainInfo') || `{}`);
  } catch (err) {
    console.error(err);
  }

  const {
    level: initLevel,
    tenantId: initTenantId,
    tenantName: initTenantName,
    domainId: initDomainId,
    selectItemTenantId,
  } = domainPropInfo;
  const { permissionFlag, queryPermission } = React.useContext<any>(sourceStore as any).store;

  const [activeKey, setActiveKey] = useState(BusinessSourceCategory.StandardField);
  const [selectItem, setSelectItem] = useState<IDomainItem | null>(null);
  const [selectTenant, setSelectTenant] = useState<boolean>(false);
  const [showFieldDetail, setShowFieldDetail] = useState(false); // 是否展示字段详情
  const [saveDisabled, setDisabled] = useState(true);
  const [curStrategy, setCurStrategy] = useState('');
  const [stateObj, dispatch] = useReducer(
    (state, action) => ({ ...state, ...action }),
    initDomainId
      ? {
          level: initLevel,
          tenantId: initTenantId,
          tenantName: initTenantName,
        }
      : {
          level: isTenant ? LevelType.TENANT : LevelType.PLATFORM,
          tenantId: isTenant ? currentTenantId : null,
          tenantName: isTenant ? currentTenantName : null,
        }
  );

  const { level, tenantId } = stateObj;
  const { domainId, domainCode } = selectItem || {};

  const listComRef = useRef<any>(null);
  const tenantInfoRef = useRef<any>(null);
  tenantInfoRef.current = tenantId;

  const createAndEditDataSet: DataSet = useMemo(
    () => new DataSet(CreateAndEditDataSetConfig(true, tenantInfoRef) as DataSetProps),
    []
  );

  const detailDataSet = useMemo(
    () => new DataSet(CreateAndEditDataSetConfig(false, tenantInfoRef, domainId) as DataSetProps),
    [domainId]
  );

  const leftListDataSet: DataSet = useMemo(
    () => new DataSet(DomainListDataSetConfig() as DataSetProps),
    [level, tenantId]
  );

  const domainFieldsDataSet: DataSet = useMemo(
    () => new DataSet(DomainFieldsDataSetConfig() as DataSetProps),
    [level, tenantId]
  );

  const selectedDS: DataSet = useMemo(
    () =>
      new DataSet(
        SelectedListDS() as DataSetProps
        // domainId,
        // detailDataSet.current?.get('physicsPublishStrategy') === 'VERIFY'
      ),
    [domainId]
  );

  // 初始化左边菜单
  const init = () => {
    if (level === LevelType.TENANT && tenantId) {
      leftListDataSet.setQueryParameter('tenantId', tenantId);
      leftListDataSet.query();
    } else if (level === LevelType.PLATFORM) {
      leftListDataSet.setQueryParameter('tenantId', undefined);
      leftListDataSet.query();
    }
  };

  useEffect(() => {
    if (!isTenant && isNull(permissionFlag)) {
      queryPermission();
    }
  }, []);

  useEffect(() => {
    init();
  }, [level, tenantId]);

  const initDetail = () => {
    if (selectItem) {
      detailDataSet.reset();
      const { tenantId: itemTenantId } = selectItem;
      detailDataSet.setQueryParameter('tenantId', itemTenantId);
      detailDataSet.query().then(() => {
        setCurStrategy(detailDataSet.current?.get('physicsPublishStrategy'));
      });
      setDisabled(true);
      domainFieldsDataSet.setQueryParameter('domainId', selectItem?.domainId);
      domainFieldsDataSet.setQueryParameter('category', activeKey);
      domainFieldsDataSet.query();
    } else {
      detailDataSet.removeAll();
      detailDataSet.create();
    }
  };

  useEffect(() => {
    if (!showFieldDetail) {
      initDetail();
    }
  }, [selectItem, detailDataSet, showFieldDetail]);

  useEffect(() => {
    selectedDS.loadData(detailDataSet.current?.get('blockOrWhiteBusinessObjects'));
  }, [detailDataSet.current?.get('blockOrWhiteBusinessObjects')]);

  const handleCreateDomain = () => {
    createAndEditDataSet.create({});

    const handleOk = async () => {
      const flag = await createAndEditDataSet.validate();
      if (!flag) return false;
      const res = await createAndEditDataSet.submit();
      if (!res?.failed) {
        await leftListDataSet.query();
        return true;
      }
    };

    Modal.open({
      title: <div style={{ fontSize: '.18rem', fontWeight: 'bold' }}>创建领域</div>,
      key: Modal.key(),
      destroyOnClose: true, // 关闭时是否销毁
      closable: true, // 显示右上角关闭按钮
      children: <ModalContent dataSet={createAndEditDataSet} />,
      // okText: '确认',
      // cancelText: '取消',
      // 默认就是【取消，确定】
      onOk: handleOk,
      style: { width: 540 },
      afterClose: () => createAndEditDataSet.reset(),
    });
  };

  const handleSelectItem = ({ record }) => {
    const currentItem = record.toData();
    setShowFieldDetail(false);
    setSelectItem(currentItem);
    setActiveKey(BusinessSourceCategory.StandardField);
  };

  const titleRender = ({ value, record }) => {
    const icon = record.icon || 'project_filled';
    return (
      <div className={styles['item-title']}>
        {<Icon type={icon} style={{ marginRight: 4, fontSize: 14 }} />}
        <div>{value}</div>
      </div>
    );
  };

  // tag渲染函数
  const enabledRender = (flag, isActive = false) => {
    const enableColor = isActive ? '#20D489' : '#E4F9EF';
    const disableColor = isActive ? '#F55E70' : '#FDEAEC';
    let _flag = flag;
    if (typeof flag === 'string') {
      _flag = flag === 'true' || flag === '1';
    }

    if (typeof flag === 'number') {
      _flag = !!flag;
    }

    if (_flag) {
      return (
        <Tag className={!isActive && styles['enable-tag']} color={enableColor}>
          {intl.get('hmde.domain.enable').d('可用')}
        </Tag>
      );
    } else {
      return (
        <Tag
          className={!isActive ? styles['disable-tag'] : styles['disable-active-tag']}
          color={disableColor}
        >
          {intl.get('hmde.domain.disable').d('不可用')}
        </Tag>
      );
    }
  };

  const itemRender = (record, currentId) => {
    const itemClassName = currentId === record.domainId ? 'list-item-active' : '';
    return (
      <div className={`${styles['list-item-base']} ${styles[itemClassName]}`}>
        <div className={styles['item-header']}>
          <span>{titleRender({ value: record.domainName, record })}</span>
          {enabledRender(record.serviceState, currentId === record.domainId)}
        </div>
        <div className={styles['item-content']}>{record.domainCode}</div>
        <div className={styles['item-content']}>{record.remark}</div>
      </div>
    );
  };

  const handelLevelChange: (props: any) => void = ({ name, value, record }) => {
    setSelectItem(null);
    if (name === 'level') {
      dispatch({
        level: value,
        tenantId: isTenant ? currentTenantId : null,
        tenantName: isTenant ? currentTenantName : null,
      });
      record.set('tenant', undefined);
      if (value === 'platform') {
        setSelectTenant(false);
      }
    } else {
      dispatch({
        tenantId: value?.tenantId,
        tenantName: value?.tenantName,
      });
      setSelectTenant(!!value?.tenantId);
    }
  };

  const handleDirectToBO = () => {
    const { domainId: selectDomainId } = selectItem || {};
    // 先 清除缓存 防止定位到其他 components 页面
    window.dvaApp._store
      .dispatch({
        type: 'global/removeTab',
        payload: '/hmde/business-object',
      })
      .then(() => {
        openTab({
          key: `/hmde/business-object`, // 打开 tab 的 key
          path: `/hmde/business-object/list`, // 打开页面的path
          title: intl.get('hmde.bo.tab.title').d('业务对象'), // tab的标题
          icon: null, // 图标的值,antd 的 Icon
          closable: true, // tab 是否可以关闭
          type: 'menu', // tab 类型
        });
        location.hash = selectDomainId || '';
      });
  };

  const handleEditDomainInfo = async () => {
    const flag = await detailDataSet.validate();
    if (flag) {
      // eslint-disable-next-line no-unused-expressions
      detailDataSet?.current?.set('blockOrWhiteBusinessObjects', selectedDS.toData() || []);
      const res = await detailDataSet.submit();
      if (!res || (res && !res.failed)) {
        await detailDataSet.query();
        setCurStrategy(detailDataSet.current?.get('physicsPublishStrategy'));
        setDisabled(true);
      }
    }
  };

  // 系统预置领域禁用 租户查看平台领域时禁用
  const formDisabled =
    ![SourceType.PLATFORM, SourceType.TENANT].includes(detailDataSet.current?.get('sourceType')) || // 非平台和租户(系统预置)
    (isTenant && +detailDataSet.current?.get('tenantId') !== currentTenantId) || // 租户角色 且登录租户Id和创建当前领域租户id不一致
    (selectTenant && [SourceType.PLATFORM].includes(detailDataSet.current?.get('sourceType'))); // 通过HeadSelect组件选了租户id

  const columns = useMemo((): ColumnProps[] => {
    return [
      activeKey === BusinessSourceCategory.StandardField && {
        name: 'templateFieldName',
        // renderer: ({ value }) => <a onClick={() => {}}>{value}</a>,
      },
      {
        name: 'templateFieldCode',
      },
      {
        name: 'componentType',
        renderer: ({ text }) => text,
      },
      activeKey === BusinessSourceCategory.StandardField && {
        name: 'requiredFlag',
        renderer: ({ value }) => yesOrNoRender(value),
        align: ColumnAlign.left,
      },
      {
        name: 'remark',
      },
      activeKey === BusinessSourceCategory.StandardField && {
        name: 'businessObjectName',
      },
      !isTenant && {
        header: intl.get('hzero.common.table.column.option').d('操作'),
        width: 120,
        renderer: ({ record }) => {
          const isPredefine = record.get('category') === 'PREDEFINED';
          const operators: Operators = [
            {
              key: 'delete',
              ele: (
                <Popconfirm
                  onConfirm={() => domainFieldsDataSet.delete(record, false)}
                  placement="top"
                  title={intl
                    .get('hmde.domain.button.view.message.deleteConfirm')
                    .d('领域模板字段删除后不会对已经创建的业务对象生效，请确认是否删除？')}
                >
                  <a>{intl.get('hzero.common.button.delete').d('删除')}</a>
                </Popconfirm>
              ),
              len: 2, // ele里面的中文长度是多少就写多少
              title: intl.get('hzero.common.button.delete').d('删除'), // title写国际化
            },
          ];
          return isPredefine ? [] : operatorRender(operators, record, { limit: 3 });
        },
        lock: ColumnLock.right,
      },
    ].filter(Boolean) as ColumnProps[];
  }, [activeKey]);

  /**
   * 跳转到新增字段详情页面
   */
  const handleAddField = () => {
    setShowFieldDetail(true);
    // history.push({
    //   pathname: `/hmde/domain/field/create`,
    //   search: qs.stringify({
    //     fieldType: fieldType === BusinessSourceCategory.StandardField ? 'StandardField' : fieldType,
    //     domainId: selectItem?.domainId,
    //     ...stateObj,
    //     selectItemTenantId: selectItem?.tenantId,
    //   }),
    // });
  };

  useEffect(() => {
    if (!selectItem?.domainId) return;
    domainFieldsDataSet.setQueryParameter('domainId', selectItem?.domainId);
    domainFieldsDataSet.setQueryParameter('category', activeKey);
    domainFieldsDataSet.query();
  }, [activeKey, selectItem?.domainId]);

  const generateDataSource = async () => {
    if (!selectItem?.domainCode) return;
    const res = await generateHZERODataSource({ body: detailDataSet.current?.toData() });
    if (getResponse(res)) {
      notification.success({
        message: '生成成功',
      });
    }
  };

  const firstLoad = ({ dataSet, setCurrentId }) => {
    if (!initDomainId) return false;
    const findRecord = dataSet.data.find(record => record.get('domainId') === initDomainId);
    if (findRecord) {
      setSelectItem(findRecord.toData());
    } else {
      setSelectItem({ domainId: initDomainId, tenantId: selectItemTenantId });
    }
    setCurrentId(initDomainId);
    sessionStorage.removeItem('domainInfo');
    return true;
  };

  // const lovDs = useMemo(() => new DataSet(LovDS(domainId, tenantInfoRef)), [
  //   domainId,
  //   tenantInfoRef.current,
  // ]);

  const openEditList = flag => {
    return Modal.open({
      style: { width: '1000px' },
      title: intl.get('hmde.domain.model.syncList').d('同步列表'),
      destroyOnClose: true,
      closable: true,
      children: (
        <ObjectSelectModal
          flag={flag}
          domainId={domainId}
          selectedDS={selectedDS}
          domainCode={domainCode}
        />
      ),
      okText: intl.get('hzero.common.button.sure').d('确定'),
      onOk: () => {
        setDisabled(false);
      },
      onCancel: () => {
        if (curStrategy === detailDataSet.current?.get('physicsPublishStrategy')) {
          selectedDS.loadData(detailDataSet.current?.get('blockOrWhiteBusinessObjects'));
        } else {
          selectedDS.removeAll();
        }
      },
    });
  };

  const addAndEditFieldProps = {
    fieldType: activeKey,
    domainId: selectItem?.domainId,
    selectItemTenantId: selectItem?.tenantId,
    ...stateObj,
    fromKey: 'domain',
    initDetail,
    setShowFieldDetail,
    sourceStore,
  };

  const getContent = () => {
    if (showFieldDetail) {
      return <AddAndEditField {...addAndEditFieldProps} />;
    }
    return (
      <Spin dataSet={detailDataSet}>
        <div>
          <div className={styles['domain-title']}>
            <div>
              <Icon
                style={{ fontSize: 14 }}
                type={detailDataSet?.current?.get('icon') || 'project_filled'}
              />
              {detailDataSet?.current?.get('domainName')}
              {[SourceType.PREDEFINE].includes(detailDataSet.current?.get('sourceType')) && (
                <div className={styles['header-tip-contain']} style={{ marginLeft: 4 }}>
                  <Icon type="info" />
                  <span>系统标准领域仅允许查看</span>
                </div>
              )}
            </div>
            <div>
              {[SourceType.PLATFORM, SourceType.TENANT].includes(
                detailDataSet.current?.get('sourceType')
              ) &&
                level === LevelType.PLATFORM && (
                  <Button onClick={generateDataSource}>
                    {intl.get('hmde.common.button.title.generateDataSource').d('生成 HZERO 数据源')}
                  </Button>
                )}
              <Button
                disabled={!selectItem}
                // icon="skipped_a"
                // color={ButtonColor.primary}
                onClick={handleDirectToBO}
              >
                {intl.get('hmde.domain.button.viewBusinessObject').d('查看业务对象')}
              </Button>
              {[SourceType.PLATFORM, SourceType.TENANT].includes(
                detailDataSet.current?.get('sourceType')
              ) && (
                <Button
                  type={ButtonType.submit}
                  disabled={!detailDataSet.dirty && saveDisabled}
                  onClick={handleEditDomainInfo}
                >
                  {intl.get('hzero.common.button.save').d('保存')}
                </Button>
              )}
            </div>
          </div>
          <div className={styles['domain-info']}>
            <Form
              useColon={false}
              columns={3}
              dataSet={detailDataSet}
              labelAlign={'left' as any}
              labelWidth={[74, 74, 74]}
              disabled={formDisabled}
            >
              <IntlField
                name="domainName"
                style={{ width: '90%' }}
                suffix={<Icon type="language" />}
              />
              <Output name="domainCode" />
              <Output name="serviceCode" />
            </Form>
            <Form
              useColon={false}
              columns={3}
              dataSet={detailDataSet}
              labelAlign={'left' as any}
              labelWidth={[84, 74, 74]}
              disabled={formDisabled}
            >
              <Output
                name="serviceState"
                renderer={({ value }) => enabledRender(value === null ? 1 : value)}
              />
              <Output name="tenantName" />
              <IntlField
                name="remark"
                rowSpan={2}
                style={{ height: '80px' }}
                suffix={<Icon type="language" />}
              />
              <Output
                name="sourceType"
                renderer={({ value }) => (
                  <Tag className={styles['enable-tag']} color="#E4F9EF">
                    {sourceTypeMap[value]}
                  </Tag>
                )}
              />
            </Form>
          </div>
        </div>
        <div style={{ marginLeft: '-0.16rem' }}>
          <Collapse defaultActiveKey={['1']} bordered={false}>
            <Collapse.Panel
              header={
                <span style={{ fontSize: 16, minHeight: 24, color: '#1e1e1e', fontWeight: 600 }}>
                  {intl.get('hmde.common.view.title.advancedProps').d('高级属性')}
                </span>
              }
              key="1"
            >
              <div className={styles['more-property-contain']}>
                <div className={styles['mode-expression']}>
                  {intl.get('hmde.domain.standardObject.extensionPattern').d('标准对象扩展模式')}
                </div>
                <div className={styles['tip-contain']}>
                  <div>
                    <Icon type="info" />
                    <span>
                      {intl
                        .get('hmde.domain.standardObject.extensionPattern.tip')
                        .d('扩展模式启用且创建扩展字段后将不允许关闭，请谨慎操作')}
                    </span>
                  </div>
                  <ImgIcon name="blue@3x.png" style={{ width: '195px', height: '28px' }} />
                </div>
                <Form
                  useColon={false}
                  columns={3}
                  dataSet={detailDataSet}
                  labelAlign={'left' as any}
                  labelWidth={[110, 84]}
                  disabled={formDisabled}
                >
                  {formDisabled ? (
                    <Output
                      name="flexFieldEnabledFlag"
                      label={
                        <LabelTitleRender
                          value={intl
                            .get('hmde.domain.view.message.title.flexModel')
                            .d('弹性域模式')}
                        />
                      }
                      renderer={({ record }) => (
                        <TrueOrFalseRender trueOrFalse={record?.get('flexFieldEnabledFlag')} />
                      )}
                    />
                  ) : (
                    <Switch
                      name="flexFieldEnabledFlag"
                      onChange={() => {
                        setActiveKey(BusinessSourceCategory.StandardField);
                      }}
                      label={
                        <LabelTitleRender
                          value={intl
                            .get('hmde.domain.view.message.title.flexModel')
                            .d('弹性域模式')}
                        />
                      }
                    />
                  )}
                  {detailDataSet?.current?.get('flexFieldEnabledFlag') && (
                    <TextArea
                      name="flexFieldRecognizeRegularExpression"
                      rowSpan={2}
                      colSpan={2}
                      label={
                        <LabelTitleRender
                          value={intl
                            .get('hmde.domain.view.message.title.extendFieldIdentify')
                            .d('标准弹性域字段识别方法')}
                          help={intl
                            .get('hmde.domain.view.message.title.extendFieldIdentify.help')
                            .d(
                              '对象引用物理模型时自动将字段标识为扩展字段，可配置字段满足的表达式规则'
                            )}
                        />
                      }
                    />
                  )}
                  {formDisabled ? (
                    <Output
                      name="extendTableEnabledFlag"
                      label={
                        <LabelTitleRender
                          value={intl
                            .get('hmde.domain.view.message.title.extendMode')
                            .d('扩展表模式')}
                          help={intl
                            .get('hmde.domain.view.message.title.extendMode.help')
                            .d(
                              '勾选此选项，平台标准对象关联扩展物理模型，若租户在标准对象想启用扩展字段进行使用'
                            )}
                        />
                      }
                      renderer={({ record }) => (
                        <TrueOrFalseRender trueOrFalse={record?.get('extendTableEnabledFlag')} />
                      )}
                    />
                  ) : (
                    <Switch
                      name="extendTableEnabledFlag"
                      newLine
                      onChange={() => {
                        setActiveKey(BusinessSourceCategory.StandardField);
                      }}
                      label={
                        <LabelTitleRender
                          value={intl
                            .get('hmde.domain.view.message.title.extendMode')
                            .d('扩展表模式')}
                          help={intl
                            .get('hmde.domain.view.message.title.extendMode.help')
                            .d(
                              '勾选此选项，平台标准对象关联扩展物理模型，若租户在标准对象想启用扩展字段进行使用'
                            )}
                        />
                      }
                    />
                  )}
                </Form>
                <div className={styles['mode-expression']} style={{ margin: 0 }}>
                  {intl
                    .get('hmde.domain.standardObject.physicsPublishStrategy')
                    .d('业务对象发布模式')}
                </div>
                <div className={styles['tip-contain']} style={{ marginTop: 10 }}>
                  <div>
                    <Icon type="info" />
                    <span>
                      {intl
                        .get('hmde.domain.standardObject.physicsPublishStrategy.tip')
                        .d('扩展表模式下，黑/白名单模式不对扩展表起作用')}
                    </span>
                  </div>
                  <ImgIcon name="blue@3x.png" style={{ width: '195px', height: '28px' }} />
                </div>
                <Form
                  labelLayout={LabelLayout.horizontal}
                  useColon={false}
                  columns={1}
                  dataSet={detailDataSet}
                  labelAlign={'left' as any}
                  labelWidth={[190]}
                  disabled={formDisabled}
                >
                  <SelectBox
                    name="physicsPublishStrategy"
                    onChange={value => {
                      if (curStrategy === value) {
                        selectedDS.loadData(
                          detailDataSet.current?.get('blockOrWhiteBusinessObjects')
                        );
                      } else {
                        selectedDS.removeAll();
                      }
                    }}
                  >
                    <Option value="VERIFY">
                      {intl.get('hmde.domain.model.allowUpdate').d('白名单')}
                      <Tooltip
                        placement="top"
                        title={intl
                          .get('hmde.domain.model.allowUpdateHelp')
                          .d(
                            '仅下列选择的业务对象允许更新物理模型，其它业务对象均不允许更新物理模型'
                          )}
                      >
                        <Icon
                          type="help_outline"
                          style={{ fontSize: 14, marginBottom: '4px', marginLeft: '3px' }}
                        />
                      </Tooltip>
                    </Option>
                    {/* <Option value="SYNC_ALLOWED">
                      {intl.get('hmde.domain.model.allowPartUpdate').d('部分允许更新')}
                    </Option> */}
                    <Option value="SYNC">
                      {intl.get('hmde.domain.model.notAllAllowUpdate').d('黑名单')}
                      <Tooltip
                        placement="top"
                        title={intl
                          .get('hmde.domain.model.notAllowUpdateHelp')
                          .d(
                            '仅下列选择的业务对象不允许更新物理模型，其它业务对象均可更新物理模型'
                          )}
                      >
                        <Icon
                          type="help_outline"
                          style={{ fontSize: 14, marginBottom: '4px', marginLeft: '3px' }}
                        />
                      </Tooltip>
                    </Option>
                  </SelectBox>
                  {detailDataSet.current?.get('physicsPublishStrategy') === 'VERIFY' ? (
                    <Output
                      name="allow"
                      renderer={() => (
                        <Button
                          disabled={formDisabled}
                          onClick={() => {
                            openEditList(
                              detailDataSet.current?.get('physicsPublishStrategy') === 'VERIFY'
                            );
                          }}
                          icon="settings-o"
                        >
                          {intl.get('hmde.common.button.title.configObject').d('配置对象')}
                        </Button>
                      )}
                    />
                  ) : (
                    <Output
                      name="notAllow"
                      renderer={() => (
                        <Button
                          disabled={formDisabled}
                          onClick={() => {
                            openEditList(
                              detailDataSet.current?.get('physicsPublishStrategy') === 'VERIFY'
                            );
                          }}
                          icon="settings-o"
                        >
                          {intl.get('hmde.common.button.title.configObject').d('配置对象')}
                        </Button>
                      )}
                    />
                  )}
                </Form>

                {!!selectedDS?.toData()?.length && <TagRender data={selectedDS?.toData()} />}
              </div>
            </Collapse.Panel>
          </Collapse>
          {[SourceType.PLATFORM, SourceType.TENANT].includes(
            detailDataSet.current?.get('sourceType')
          ) && (
            <Collapse defaultActiveKey={['1']} bordered={false}>
              <Collapse.Panel
                header={
                  <span
                    style={{
                      fontSize: 16,
                      minHeight: 24,
                      color: '#1e1e1e',
                      fontWeight: 600,
                    }}
                  >
                    {intl.get('hmde.common.view.title.templateFields').d('模板字段')}
                  </span>
                }
                key="1"
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Radio.Group
                    onChange={e => setActiveKey(e.target.value)}
                    value={activeKey}
                    style={{ marginBottom: 8 }}
                  >
                    <Radio.Button value={BusinessSourceCategory.StandardField}>
                      {intl.get('hmde.common.view.title.standardBusinessField').d('标准业务字段')}
                    </Radio.Button>
                    {detailDataSet.current?.get('flexFieldEnabledFlag') && (
                      <Radio.Button value={BusinessSourceCategory.FlexField}>
                        {intl.get('hmde.common.view.title.standardFlexField').d('标准弹性域字段')}
                      </Radio.Button>
                    )}
                    {detailDataSet.current?.get('extendTableEnabledFlag') && (
                      <Radio.Button value={BusinessSourceCategory.ExtensionTableField}>
                        {intl.get('hmde.common.view.title.standardExtendedField').d('标准扩展字段')}
                      </Radio.Button>
                    )}
                  </Radio.Group>
                  {[SourceType.PLATFORM, SourceType.TENANT].includes(
                    detailDataSet.current?.get('sourceType')
                  ) &&
                    !isTenant && (
                      <div>
                        <Button
                          funcType={FuncType.flat}
                          color={ButtonColor.primary}
                          icon="add"
                          onClick={() => handleAddField()}
                        >
                          {intl.get('hzero.common.button.create').d('新建')}
                        </Button>
                        <Popconfirm
                          onConfirm={() =>
                            domainFieldsDataSet.delete(domainFieldsDataSet.selected, false)
                          }
                          placement="top"
                          title={intl
                            .get('hmde.domain.button.view.message.deleteConfirm')
                            .d('领域模板字段删除后不会对已经创建的业务对象生效，请确认是否删除？')}
                        >
                          <Button
                            funcType={FuncType.flat}
                            color={ButtonColor.primary}
                            icon="delete"
                            disabled={!domainFieldsDataSet.selected.length}
                          >
                            {intl.get('hmde.domain.button.batchDelete').d('批量删除')}
                          </Button>
                        </Popconfirm>
                      </div>
                    )}
                </div>
                <Table dataSet={domainFieldsDataSet} columns={columns} />
              </Collapse.Panel>
            </Collapse>
          )}
        </div>
      </Spin>
    );
  };

  return (
    <>
      <Header title={intl.get('hmde.domain.view.message.title.domainManage').d('领域管理')}>
        {!isTenant ? (
          <Button
            disabled={level === LevelType.TENANT && isNil(tenantId)}
            icon="add"
            color={ButtonColor.primary}
            onClick={handleCreateDomain}
          >
            {intl.get('hmde.domain.button.create').d('创建领域')}
          </Button>
        ) : null}
        <HeadSelect onChange={handelLevelChange} initObj={stateObj} />
      </Header>
      <div className={styles['scope-manage-contain']}>
        <div className={styles['wrapper-contain']}>
          <div className={styles['left-list-contain']}>
            <List
              listRef={listComRef}
              title="domainName"
              dataSet={leftListDataSet}
              itemRender={itemRender}
              stateFiled="serviceState"
              showMore={false}
              content={[]}
              listKey="domainId"
              onChange={handleSelectItem}
              searchProps={{
                placeholder: intl.get('hmde.domain.search.message').d('搜索名称/编码'),
                prefix: null,
                suffix: (
                  <Icon
                    type="search"
                    style={{ color: '#D0D0D0' }}
                    onClick={() => listComRef.current?.handleListSearch()}
                  />
                ),
                onTextChange: () => setSelectItem(null),
              }}
              firstLoad={firstLoad}
            />
          </div>
          <div className={styles['right-detail-contain']} style={{ flex: 1 }}>
            {!selectItem ? (
              <div className={styles['empty-content']} style={{ marginTop: 140 }}>
                <ImgIcon name="noData.svg" style={{ width: '256px', height: '200px' }} />
                <div className={styles['empty-font']}>
                  {intl.get('hmde.common.view.message.nodata').d('暂无数据')}
                </div>
              </div>
            ) : (
              getContent()
            )}
          </div>
        </div>
      </div>
    </>
  );
});

export default formatterCollections({
  code: ['hmde.domain', 'hmde.common', 'hmde.bo', 'hzero.common'],
})(Domain);
