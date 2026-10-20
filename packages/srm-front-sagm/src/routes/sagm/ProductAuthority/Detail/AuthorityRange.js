// 权限范围
import React, { memo, useState } from 'react';
import {
  Button,
  DataSet,
  Lov,
  Table,
  Select,
  NumberField,
  Output,
  Tooltip,
} from 'choerodon-ui/pro';
import { Icon } from 'choerodon-ui';
import { observer } from 'mobx-react-lite';
import { flowRight } from 'lodash';

import intl from 'utils/intl';
import notification from 'utils/notification';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import c7nModal, { openImport, openList, openSelectList } from '@/utils/c7nModal';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { openUnitTree, openRegionTree, openCategoryTree, openCatalogTree } from '@/utils/tree';
import ImportButton from 'components/Import';

import SkuTransfer from './SkuTransfer';
import SwitchBox from './SwitchBox';
import getDimensionConfig from './getDimensionConfig';
import {
  joinAssignSku,
  deleteAssignSku,
  deleteDimension,
  joinExcludeSku,
  deleteExcludeSku,
} from './api';
import styles from './style.less';

const organizationId = getCurrentOrganizationId();

const btnProps = {
  color: 'primary',
  funcType: 'flat',
  style: { marginRight: 8 },
};

const DeleteBtn = observer(({ dataSet, ...props }) => {
  const selects = dataSet.selected;
  const disabled = props.disabled || selects.length === 0;
  return (
    <Button {...btnProps} {...props} icon="delete" disabled={disabled}>
      {intl.get('hzero.common.button.delete').d('删除')}
    </Button>
  );
});

const CreateBtn = (props) => (
  <Button {...btnProps} {...props} icon="playlist_add" wait={1000}>
    {intl.get('hzero.common.button.add').d('新增')}
  </Button>
);

const ImportBtn = (props) => (
  <Button {...btnProps} {...props} icon="archive">
    {intl.get('hzero.common.viewtitle.batchImport').d('批量导入')}
  </Button>
);

const ImportBtnNew = (props) => {
  const { range, disabled, authorityListId, successCallBack, sourceSaleType } = props;
  const getImportCode = () => {
    if (range === 'USER') {
      if (sourceSaleType === 'RECEIVE') {
        return 'SRM_C_SRM_SAGM_AUTHORITY_LIST_USER_DISTRIBUTED';
      } else if (sourceSaleType === 'MEMBER') {
        return 'SRM_C_SRM_SAGM_AUTHORITY_LIST_USER_MEMBERS';
      }
      return 'SAMG.AUTHORITY_DIMENSION_USER';
    } else {
      if (sourceSaleType === 'RECEIVE') {
        return 'SRM_C_SRM_SAGM_AUTHORITY_LIST_SKU_DISTRIBUTED';
      }
      return 'SAMG.AUTHORITY_DIMENSION_SKU';
    }
  };
  const diffs =
    range === 'USER'
      ? {
          type: 'USER',
          templateCode: getImportCode(),
          action: intl.get('sagm.common.view.batchImportUser').d('批量导入用户条件'),
          permissionList: [
            {
              code: `sagm.purchase-authority.button.auth-user-dimension.import-new`,
              type: 'button',
              meaning: '采买权限用户条件-(新)导入',
            },
          ],
        }
      : {
          type: 'SKU',
          templateCode: getImportCode(),
          action: intl.get('sagm.common.view.batchImportSku').d('批量导入商品条件'),
          permissionList: [
            {
              code: `sagm.purchase-authority.button.auth-sku-dimension.import-new`,
              type: 'button',
              meaning: '采买权限商品条件-(新)导入',
            },
          ],
        };
  const { type, action, templateCode, permissionList } = diffs;
  return (
    <ImportButton
      businessObjectTemplateCode={templateCode}
      refreshButton
      buttonText={intl.get('sagm.common.button.bactImportNew').d('(新)批量导入')}
      prefixPatch="/sagm"
      action={action}
      args={{ authorityListId, type, templateCode }}
      successCallBack={successCallBack}
      buttonProps={{
        icon: 'archive',
        color: 'primary',
        funcType: 'flat',
        disabled,
        permissionList,
      }}
    />
  );
};

// 商品穿梭框组件
function showTransfer(param = {}, readOnly, viewSkuBackPath, record, onCloseDataChange = (e) => e) {
  let hasSku;
  let objectVersionNumber;
  const title = readOnly
    ? intl.get('sagm.common.view.assignedSku').d('已分配商品')
    : intl.get('sagm.common.view.assignSku').d('分配商品');
  const skuChange = (res, _hasSku) => {
    const { objectVersionNumber: n } = res || {};
    objectVersionNumber = n;
    hasSku = _hasSku;
  };
  const { isReceive, path = '', ...params } = param;
  // 采买权限管理 - 权限控制范围为采购时，不限制商品来源，
  // 但 协议添加采买权限时，采购范围只能选择目录化商品
  const onlyCate = !path.includes('/product-authority') && param.agreementType === 'PUR_AGREEMENT';
  c7nModal({
    style: { width: 1100 },
    drawer: true,
    okCancel: false,
    okText: intl.get('hzero.common.button.close').d('关闭'),
    title,
    afterClose: () => {
      if (objectVersionNumber) {
        onCloseDataChange(objectVersionNumber);
        objectVersionNumber = undefined;
      }
      if (record && typeof hasSku === 'number') {
        record.set('hasSku', hasSku);
        hasSku = undefined;
      }
    },
    children: (
      <SkuTransfer
        isReceive={isReceive}
        onlyCate={onlyCate}
        readOnly={readOnly}
        backPath={viewSkuBackPath}
        params={{ authorityListId: params.authorityListId }}
        queryFieldsLimit={3}
        leftInfo={{
          url: `/sagm/v1/${organizationId}/auth-sku-details/sku`,
          params: { ...params },
        }}
        rightInfo={{
          url: `/sagm/v1/${organizationId}/auth-sku-details`,
          params: { ...params },
        }}
        queryDs={
          new DataSet({
            autoCreate: true,
            fields: [
              {
                name: 'skuName',
                label: intl.get('sagm.common.model.skuName').d('商品名称'),
              },
              {
                name: 'skuCode',
                label: intl.get('sagm.common.model.skuCode').d('商品编码'),
              },
              {
                name: 'categoryLov',
                label: intl.get('sagm.common.model.platformCategory').d('平台分类'),
                type: 'object',
                valueField: 'categoryId',
                lovCode: 'SMPC.CATEGORY',
                ignore: 'always',
                lovPara: {
                  tenantId: organizationId,
                },
              },
              {
                name: 'cid',
                bind: 'categoryLov.categoryId',
              },
              {
                name: 'catalogLov',
                label: intl.get('sagm.common.model.catalog').d('目录'),
                type: 'object',
                ignore: 'always',
                valueField: 'catalogId',
                lovCode: 'SMPC.CATALOG_THREE',
                lovPara: {
                  tenantId: organizationId,
                },
              },
              {
                name: 'catalogId',
                bind: 'catalogLov.catalogId',
              },
            ],
          })
        }
        queryFields={[
          { name: 'skuName' },
          { name: 'skuCode' },
          { name: 'categoryLov', fieldType: 'Lov' },
          { name: 'catalogLov', fieldType: 'Lov' },
        ]}
        onJoin={joinAssignSku}
        onDelete={deleteAssignSku}
        onSkuChange={skuChange}
      />
    ),
  });
}

function excludeSku({ readOnly, params = {}, viewSkuBackPath, updateObjectVersionNumber }) {
  let objectVersionNumber;
  const title = readOnly
    ? intl.get('sagm.common.view.hasExcludeSku').d('已排除商品')
    : intl.get('sagm.common.view.excludeSku').d('排除商品');
  const skuChange = (res) => {
    const { objectVersionNumber: n } = res || {};
    objectVersionNumber = n;
  };
  c7nModal({
    style: { width: 1100 },
    drawer: true,
    okCancel: false,
    okText: intl.get('hzero.common.button.close').d('关闭'),
    title,
    afterClose: () => {
      if (objectVersionNumber) {
        updateObjectVersionNumber(objectVersionNumber);
        objectVersionNumber = undefined;
      }
    },
    children: (
      <SkuTransfer
        // 采买权限管理 - 权限控制范围为采购时，不限制商品来源，
        // 但 协议添加采买权限时，采购范围只能选择目录化商品
        onlyCate={
          !params.path.includes('/product-authority') && params.agreementType === 'PUR_AGREEMENT'
        }
        queryRequired={false}
        readOnly={readOnly}
        backPath={viewSkuBackPath}
        params={{ authorityListId: params.authorityListId }}
        queryFieldsLimit={3}
        leftInfo={{
          url: `/sagm/v1/${organizationId}/auth-exclude-sku-details/sku`,
          params: { ...params },
        }}
        rightInfo={{
          url: `/sagm/v1/${organizationId}/auth-exclude-sku-details`,
          params: { ...params },
          title: intl.get('sagm.common.view.hasExcludeSku').d('已排除商品'),
        }}
        queryDs={
          new DataSet({
            autoCreate: true,
            fields: [
              {
                name: 'skuName',
                label: intl.get('sagm.common.model.skuName').d('商品名称'),
              },
              {
                name: 'skuCode',
                label: intl.get('sagm.common.model.skuCode').d('商品编码'),
              },
              {
                name: 'categoryLov',
                label: intl.get('sagm.common.model.platformCategory').d('平台分类'),
                type: 'object',
                valueField: 'categoryId',
                lovCode: 'SMPC.CATEGORY',
                ignore: 'always',
                lovPara: {
                  tenantId: organizationId,
                },
              },
              {
                name: 'cid',
                bind: 'categoryLov.categoryId',
              },
              {
                name: 'catalogLov',
                label: intl.get('sagm.common.model.catalog').d('目录'),
                type: 'object',
                ignore: 'always',
                valueField: 'catalogId',
                lovCode: 'SMPC.CATALOG_THREE',
                lovPara: {
                  tenantId: organizationId,
                },
              },
              {
                name: 'catalogId',
                bind: 'catalogLov.catalogId',
              },
            ],
          })
        }
        queryFields={[
          { name: 'skuName' },
          { name: 'skuCode' },
          { name: 'categoryLov', fieldType: 'Lov' },
          { name: 'catalogLov', fieldType: 'Lov' },
        ]}
        onJoin={joinExcludeSku}
        onDelete={deleteExcludeSku}
        onSkuChange={skuChange}
      />
    ),
  });
}

// 强行渲染函数组件
const useUpdate = () => {
  const [, setUpdate] = useState(0);
  return () => setUpdate((prev) => prev + 1);
};

const DimensionRange = (props) => {
  const {
    title,
    readOnly,
    showHelp,
    helpMsg,
    switchProps = {},
    tableProps = {},
    customizeTable,
  } = props;
  const { hiddenOldImport, ...others } = tableProps;
  const { value, options, valueField = 'value', textField = 'meaning' } = switchProps;
  const { [textField]: text } = options?.find((f) => f[valueField] === value) || {};
  return (
    <div className="dimension-range-wrapper">
      <div className="dimension-range-title">
        {title}
        {showHelp && (
          <Tooltip title={helpMsg}>
            <Icon type="help" />
          </Tooltip>
        )}
      </div>
      {!readOnly && (
        <div style={{ marginBottom: value ? 0 : 16 }}>
          <SwitchBox {...switchProps} />
        </div>
      )}
      {!!value && readOnly && <span className="dimension-all-read">{text}</span>}
      {!value &&
        customizeTable(
          {
            code: 'SAGM.AUTHORITY_RANGE.TABLE',
            // 个性化配置了代码本不应该展示的按钮， 会出现按钮空白，应将code置空
            buttonCode: readOnly
              ? ''
              : hiddenOldImport
              ? 'SAGM.AUTHORITY_RANGE.SPECIAL.BTNS'
              : 'SAGM.AUTHORITY_RANGE.BTNS',
          },
          <Table {...others} />
        )}
    </div>
  );
};

function AuthorityRange(props) {
  const {
    // type,
    initDs,
    userDs,
    skuDs,
    excludeUserDs,
    readOnly,
    path,
    isExcludeSku,
    isExcludeUser,
    dimensionCodes = [], // 用户、商品所有维度集合
    viewSkuBackPath,
    onRefresh = (e) => e,
    initCustomFields = (e) => e,
    getDimensionIsCustom = (e) => e,
    // agreementHeaderNum,
    agreementHeaderType: saleType,
    customizeTable,
  } = props;
  const setUp = useUpdate();
  const [delSkuLoading, setDelSkuLoading] = useState(false);
  const [delUserLoading, setDelUserLoading] = useState(false);
  const {
    allUserEnable,
    allSkuEnable,
    agreementHeaderId,
    authorityListId,
    agreementType,
    controlRange,
    agreementHeaderType,
    agreementHeaderNum,
  } = initDs.current ? initDs.current.toData() : {};

  const sourceSaleType = saleType || agreementHeaderType;

  const updateObjectVersionNumber = (n) => {
    if (initDs.current) {
      initDs.current.set('objectVersionNumber', n);
    }
  };

  const handleSwitchChange = (checked, otherValue, otherKey) => {
    if (!agreementHeaderId && initDs.current && checked && otherValue) {
      initDs.current.set(otherKey, 0);
    }
    setUp();
  };

  const getBtns = (range, dataSet, disabled) => {
    // 会员协议用户条件 || 领用协议 老导入强行隐藏
    const hiddenOldImport =
      (range === 'USER' && sourceSaleType === 'MEMBER') || sourceSaleType === 'RECEIVE';
    const optionalBtns = hiddenOldImport
      ? []
      : [
          <ImportBtn
            name="oldImport"
            disabled={disabled || !authorityListId}
            onClick={() => handleBtnEvents(range, 'import')}
          />,
        ];
    const btns = [
      <CreateBtn
        name="create"
        disabled={disabled}
        onClick={() => handleBtnEvents(range, 'create')}
      />,
      <DeleteBtn
        name="delete"
        dataSet={dataSet}
        disabled={disabled}
        loading={range === 'USER' ? delUserLoading : delSkuLoading}
        onClick={() => handleBtnEvents(range, 'delete')}
      />,
      ...optionalBtns,
      <ImportBtnNew
        name="newImport"
        sourceSaleType={sourceSaleType}
        range={range}
        disabled={disabled || !authorityListId}
        authorityListId={authorityListId}
        successCallBack={() => onRefresh(range)}
        path={path}
      />,
    ];
    return readOnly ? [] : btns;
  };

  const userRangeBtns = [...getBtns('USER', userDs, allUserEnable)];
  const skuRangeBtns = [...getBtns('SKU', skuDs, allSkuEnable)];

  const getColumns = (rangeType) => [
    {
      name: 'dimension',
      width: 150,
      tooltip: 'none',
      renderer: ({ record }) =>
        readOnly
          ? (record.get('dimension') || {}).meaning
          : renderDimensionSelect(record, rangeType),
    },
    {
      name: 'dimensionValue',
      tooltip: 'none',
      renderer: readOnly ? renderDimensionRead : renderDimensionEditor,
    },
  ];

  function handleBtnEvents(range, option) {
    if (!['USER', 'SKU'].includes(range)) return;
    const ds = range === 'USER' ? userDs : skuDs;
    const loadingChange = range === 'USER' ? setDelUserLoading : setDelSkuLoading;
    const eventMap = {
      delete: async () => {
        if (authorityListId) {
          const createRecords = ds.selected.filter(
            (f) => f.get('_status') !== 'update' && f.get('dimensionCode') !== 'SKU'
          );
          ds.remove(createRecords);
          const updateRecords = ds.selected.filter(
            (f) => f.get('_status') === 'update' || f.get('dimensionCode') === 'SKU'
          );
          if (updateRecords.length > 0) {
            const updateData = updateRecords.map((m) => ({
              authDimension: m.get('dimensionCode'),
            }));
            const deleteParams = { authorityListId, authRangeDTOS: updateData };
            loadingChange(true);
            const res = getResponse(await deleteDimension(deleteParams));
            loadingChange(false);
            if (res) {
              updateObjectVersionNumber(res.objectVersionNumber);
              ds.remove(updateRecords);
              notification.success();
            }
          }
        } else {
          ds.remove(ds.selected);
        }
      },
      create: () => ds.create({}, 0),
      import: () => {
        const diffs =
          range === 'USER'
            ? {
                type: 'USER',
                templateCode: 'SAMG.AUTHORITY_DIMENSION_USER',
                action: intl.get('sagm.common.view.batchImportUser').d('批量导入用户条件'),
              }
            : {
                type: 'SKU',
                templateCode: 'SAMG.AUTHORITY_DIMENSION_SKU',
                action: intl.get('sagm.common.view.batchImportSku').d('批量导入商品条件'),
              };
        const { action, type, templateCode } = diffs;
        openImport(
          {
            afterClose: () => onRefresh(type),
          },
          {
            key: '/sagm/product-authority/data-import',
            action,
            code: templateCode,
            args: { authorityListId, type, templateCode },
          }
        );
      },
    };
    const { [option]: event = (e) => e } = eventMap;
    event();
  }

  // 升序排序
  function sortDimension(_list) {
    const list = [..._list];
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length - 1; j++) {
        let tmp;
        if (list[i].orderSeq > list[j].orderSeq) {
          tmp = list[i];
          list[i] = list[j];
          list[j] = tmp;
        }
      }
    }
    return list;
  }

  // 维度列
  function renderDimensionSelect(record, rangeType) {
    let dimensions = dimensionCodes.filter((f) => f.dimensionType === rangeType);
    // dimensions: 平台采买权限维度 租户自定义 维度 会 覆盖 、平台级自定义维度
    // 过滤供应商
    if (rangeType === 'SKU') {
      // 控制范围为协议采购过滤商品来源
      if (controlRange === 'PUR' && agreementHeaderNum) {
        dimensions = dimensions.filter(
          (f) => f.dimensionCode !== 'COMMODITY_SOURCE' && !getDimensionIsCustom('COMMODITY_SOURCE')
        );
        // 切换控制范围清空维度值
        if (record.get('dimensionCode') === 'COMMODITY_SOURCE') {
          record.set('dimensionCode', null);
        }
      }
      // 协议上手动创建的权限
      if (initDs.current?.get('__purManual')) {
        dimensions = dimensions.filter(
          (f) => f.dimensionCode !== 'SUPPLIER' && !getDimensionIsCustom('SUPPLIER')
        );
      }
    }
    const sortRes = sortDimension(dimensions);
    return (
      <Select
        record={record}
        name="dimensionCode"
        onChange={(value, oldValue) => handleSelectChange({ value, oldValue, record })}
      >
        {sortRes.map((m) =>
          m.value === 'SKU' && !authorityListId && !getDimensionIsCustom('SKU') ? (
            <Select.Option value={m.value} key={m.value} disabled>
              <Tooltip
                title={intl
                  .get('sagm.common.view.dimensionRequireSave')
                  .d('请保存权限配置后再选择该维度')}
              >
                {m.meaning}
              </Tooltip>
            </Select.Option>
          ) : (
            <Select.Option value={m.value} key={m.value}>
              {m.meaning}
            </Select.Option>
          )
        )}
      </Select>
    );
  }

  function handleSelectChange({ value, record }) {
    initCustomFields(value, record);
  }

  // 纬度值编辑状态列
  function renderDimensionEditor({ record }) {
    const dimensionCode = record.get('dimensionCode');

    const preEditorMap = {
      ORG: (
        <Lov
          name="ORG"
          record={record}
          clearButton={false}
          maxTagCount={3}
          onClick={() =>
            openUnitTree({
              name: 'ORG',
              record,
              whole: false,
              title: intl.get('sagm.common.model.selectOrg').d('选择组织'),
            })
          }
        />
      ),
      ROLE: <Lov record={record} name="ROLE" maxTagCount={3} />,
      USER: <Lov record={record} name="USER" maxTagCount={3} />,
      AREA: (
        <Lov
          record={record}
          name="AREA"
          clearButton={false}
          maxTagCount={3}
          onClick={() =>
            openRegionTree({
              name: 'AREA',
              record,
              whole: false,
              title: intl.get('sagm.common.model.selectRegion').d('选择区域'),
            })
          }
        />
      ),
      SKU: (
        <a
          disabled={!authorityListId}
          onClick={() => {
            // if (!authorityListId) {
            //   notification.info({
            //     message: intl
            //       .get('sagm.common.view.message.skuRequireAfterSave')
            //       .d('请保存权限配置后再选择商品'),
            //   });
            //   return false;
            // }
            showTransfer(
              {
                agreementHeaderId,
                authorityListId,
                agreementType,
                path,
                isReceive: initDs.current.get('agreementHeaderType') === 'RECEIVE',
              },
              false,
              viewSkuBackPath,
              record,
              updateObjectVersionNumber
            );
          }}
        >
          {intl.get('sagm.common.model.product').d('商品')}
        </a>
      ),
      CATALOG: (
        <Lov
          record={record}
          name="CATALOG"
          clearButton={false}
          maxTagCount={3}
          onClick={() =>
            openCategoryTree({
              name: 'CATALOG',
              record,
              whole: false,
              nodeType: 'last',
              title: intl.get('sagm.common.model.selectCategory').d('选择分类'),
            })
          }
        />
      ),
      DIRECTORY: (
        <Lov
          record={record}
          name="DIRECTORY"
          clearButton={false}
          maxTagCount={3}
          onClick={() =>
            openCatalogTree({
              name: 'DIRECTORY',
              record,
              whole: false,
              title: intl.get('sagm.common.model.selectCatalog').d('选择目录'),
            })
          }
        />
      ),
      PRICE_RANGE: (
        <NumberField
          record={record}
          name="PRICE_RANGE"
          placeholder={[
            intl.get('sagm.common.view.priceFrom').d('价格从'),
            intl.get('sagm.common.view.priceTo').d('价格至'),
          ]}
        />
      ),
      SUPPLIER: <Lov record={record} name="SUPPLIER" maxTagCount={3} />,
      SKU_LABEL: <Lov record={record} name="SKU_LABEL" maxTagCount={3} />,
      MEMBER: <Lov record={record} name="MEMBER" maxTagCount={3} />,
      MEMBER_LABEL: <Lov record={record} name="MEMBER_LABEL" maxTagCount={3} />,
      COMMODITY_SOURCE: <Select record={record} name="COMMODITY_SOURCE" />,
    };

    const customEditor = getCustomEditor(dimensionCode, record);
    return record.getState('customDimension') ? customEditor : preEditorMap[dimensionCode];
  }

  function getCustomEditor(dimensionCode, record, onlyRead = false) {
    const customDimension = record.getState('customDimension');
    if (customDimension) {
      const { componentType } = customDimension;
      const components = {
        LOV: (
          <Lov
            record={record}
            name="customDimension"
            readOnly={onlyRead}
            onChange={(value, oldValue) => handleEditorLovChange({ value, oldValue, record })}
          />
        ),
        SELECT: (
          <Select
            name="customSelect"
            record={record}
            readOnly={onlyRead}
            onChange={(value, oldValue) => handleEditorSelectChange({ value, oldValue, record })}
          />
        ),
      };
      return components[componentType];
    }
  }

  function handleEditorLovChange({ value, record }) {
    const customField = record.getField('customDimension');
    const { valueType } = record.getState('customDimension');
    if (value && value.length > 0) {
      const valueField = customField.get('valueField');
      const newValue = value.map((m) => ({ ...m, [`data${valueType}`]: m[valueField] }));
      record.set('customDimension', newValue);
    }
  }

  function handleEditorSelectChange({ value, record }) {
    const { valueType } = record.getState('customDimension');
    if (value && value.length > 0) {
      const newValue = value.map((m) => ({ [`data${valueType}`]: m }));
      record.set('customDimension', newValue);
    }
  }

  function renderDimensionRead({ record }) {
    const code = record.get('dimensionCode');
    let data = record.get(code) || [];
    const isCustom = record.getState('customDimension');
    const baseConfigs = getDimensionConfig();

    const dimensionConfigs = {
      ...baseConfigs,
      SKU: {
        comp: (
          <a
            onClick={() =>
              showTransfer(
                { agreementHeaderId, authorityListId, agreementType },
                true,
                viewSkuBackPath
              )
            }
          >
            {intl.get('sagm.common.model.product').d('商品')}
          </a>
        ),
      },
      PRICE_RANGE: {
        comp: <Output record={record} name="PRICE_RANGE" />,
      },
      COMMODITY_SOURCE: {
        comp: <Output record={record} name="COMMODITY_SOURCE" />,
      },
    };

    const baseConfig = dimensionConfigs[code];

    let config = baseConfig;
    if (isCustom) {
      data = record.get('customDimension') || [];
      const { lovCode, componentType, dimensionName } = isCustom;
      config = {
        columns: record.get('columns') || [],
        title: dimensionName,
      };
      if (componentType === 'SELECT') {
        config.comp = (
          <a
            onClick={() =>
              openSelectList({
                data: record.get('customSelect'),
                title: dimensionName,
                code: lovCode,
              })
            }
          >
            {dimensionName}
          </a>
        );
      }
    }

    if (!config) return '-';
    const { comp, title, columns } = config;
    return comp || <a onClick={() => openList({ data, title, columns })}>{title}</a>;
  }

  const viewExcludeUser = () => {
    const title = intl.get('sagm.common.view.button.viewExcludeUser').d('查看排除用户');
    const baseConfigs = getDimensionConfig();
    const { columns } = baseConfigs.USER;
    openList({ data: excludeUserDs?.current?.get('subAccount'), title, columns });
  };

  return (
    <div className={styles['authority-range']}>
      <DimensionRange
        customizeTable={customizeTable}
        readOnly={readOnly}
        title={intl
          .get('sagm.common.view.title.userRange')
          .d('用户条件范围（多个条件间为且的关系）')}
        switchProps={{
          value: allUserEnable || 0,
          options: [
            { value: 1, meaning: intl.get('sagm.common.model.allUser').d('全部用户') },
            { value: 0, meaning: intl.get('sagm.common.model.someUser').d('部分用户') },
          ],
          onChange: (val) => {
            if (initDs.current) initDs.current.set('allUserEnable', val);
            handleSwitchChange(val, allSkuEnable, 'allSkuEnable');
          },
        }}
        tableProps={{
          dataSet: userDs,
          columns: getColumns('USER'),
          buttons: userRangeBtns,
          // 会员协议用户条件 || 领用协议 无老导入
          hiddenOldImport: sourceSaleType === 'MEMBER' || sourceSaleType === 'RECEIVE',
        }}
      />
      {/* 控制范围为会员， 无用户维度 */}.
      {/* 编辑状态始终可维护排除用户； 查看时有排除用户才显示 */}
      {(!readOnly || isExcludeUser) && controlRange !== 'MEMBER' && (
        <Tooltip
          title={
            authorityListId
              ? intl
                  .get('sagm.common.view.message.excludeSomeUserOpt')
                  .d('在用户条件范围为全部用户或部分用户的基础上，再排除一部分用户')
              : intl.get('sagm.common.view.message.configAfterSave').d('请保存后再进行配置')
          }
        >
          {readOnly ? (
            <Button
              funcType="link"
              color="primary"
              className={styles['exclude-user-lov-btn']}
              onClick={viewExcludeUser}
            >
              {intl.get('sagm.common.view.button.viewExcludeUser').d('查看排除用户')}
            </Button>
          ) : (
            <Lov
              mode="button"
              funcType="link"
              color="primary"
              name="subAccount"
              className={styles['exclude-user-lov-btn']}
              dataSet={excludeUserDs}
              viewMode="drawer"
              clearButton={false}
              disabled={!authorityListId}
              tableProps={{ style: { maxHeight: 'calc(100vh - 152px)' } }}
              modalProps={{
                title: intl.get('sagm.common.view.lov.subAccount').d('子账户'),
              }}
            >
              {readOnly
                ? intl.get('sagm.common.view.button.viewExcludeUser').d('查看排除用户')
                : intl.get('sagm.common.view.button.excludeSomeUser').d('排除部分用户')}
            </Lov>
          )}
        </Tooltip>
      )}
      <DimensionRange
        customizeTable={customizeTable}
        readOnly={readOnly}
        showHelp={initDs.current?.get('__purManual')}
        helpMsg={intl.get('sagm.common.view.help.skuRange').d('商品范围为来源协议管理的商品')}
        title={intl
          .get('sagm.common.view.title.skuRange')
          .d('商品条件范围（多个条件间为且的关系）')}
        switchProps={{
          value: allSkuEnable || 0,
          // 未绑定协议的采买权限不可控制全部商品
          disabled: !agreementHeaderId,
          options: [
            { value: 1, meaning: intl.get('sagm.common.model.allSku').d('全部商品') },
            { value: 0, meaning: intl.get('sagm.common.model.someSku').d('部分商品') },
          ],
          onChange: (val) => {
            if (initDs.current) initDs.current.set('allSkuEnable', val);
            handleSwitchChange(val, allUserEnable, 'allUserEnable');
          },
        }}
        tableProps={{
          dataSet: skuDs,
          columns: getColumns('SKU'),
          buttons: skuRangeBtns,
          // 领用协议 无老导入
          hiddenOldImport: sourceSaleType === 'RECEIVE',
        }}
      />

      {(!readOnly || isExcludeSku) && (
        <Tooltip
          title={
            authorityListId
              ? intl
                  .get('sagm.common.view.message.excludeSomeSkuOpt')
                  .d('在商品条件范围为全部商品或部分商品的基础上，再排除一部分商品')
              : intl.get('sagm.common.view.message.configAfterSave').d('请保存后再进行配置')
          }
        >
          <Button
            className={styles['exclude-user-lov-btn']}
            funcType="link"
            color="primary"
            disabled={!authorityListId}
            onClick={() => {
              if (authorityListId) {
                excludeSku({
                  params: { agreementHeaderId, authorityListId, agreementType, path },
                  readOnly,
                  viewSkuBackPath,
                  updateObjectVersionNumber,
                });
              }
            }}
          >
            {readOnly
              ? intl.get('sagm.common.view.button.viewExcludeSku').d('查看排除商品')
              : intl.get('sagm.common.view.button.excludeSomeSku').d('排除部分商品')}
          </Button>
        </Tooltip>
      )}
    </div>
  );
}

export default flowRight(
  withCustomize({ unitCode: ['SAGM.AUTHORITY_RANGE.BTNS', 'SAGM.AUTHORITY_RANGE.TABLE'] })
)(memo(observer(AuthorityRange)));
