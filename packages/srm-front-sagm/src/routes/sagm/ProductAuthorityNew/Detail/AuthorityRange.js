// 权限范围
import React, { memo, useState, useCallback, useContext } from 'react';
import {
  Button,
  DataSet,
  Lov,
  Table,
  Select,
  NumberField,
  Output,
  // Tooltip,
} from 'choerodon-ui/pro';
// import { Icon } from 'choerodon-ui';
import { observer, Observer } from 'mobx-react-lite';
import { flowRight } from 'lodash';

import intl from 'utils/intl';
import notification from 'utils/notification';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import c7nModal, { openImport, openList, openSelectList, confirm } from '@/utils/c7nModal';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { openUnitTree, openRegionTree, openCategoryTree, openCatalogTree } from '@/utils/tree';
import { precisionRender } from '@/utils/precision';
import { openSkuDetail } from '@/utils/openCommonTab';
import { SubContent, Card } from '@/components/Card';
import ImportButton from 'components/Import';

import SkuTransfer from '../../ProductAuthority/Detail/SkuTransfer';
import {
  openPriceInfo,
  openLadderPrice,
} from '../../ProductAuthority/Detail/SkuTransfer/openPrices';
import ProductAuthorityContext from '../ProductAuthorityContext';
import SwitchBox from './SwitchBox';
import getDimensionConfig from '../../ProductAuthority/Detail/getDimensionConfig';
import {
  joinAssignSku,
  deleteAssignSku,
  deleteDimension,
  joinExcludeSku,
  deleteExcludeSku,
} from '../../ProductAuthority/Detail/api';
import styles from './styles.less';

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
    <Button {...btnProps} {...props} icon="delete_sweep" disabled={disabled}>
      {intl.get('small.common.model.batchDelete').d('批量删除')}
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
function showTransfer(
  param = {},
  readOnly,
  viewSkuBackPath,
  record,
  onCloseDataChange = (e) => e,
  isExclude = false
) {
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
  const { isReceive, path = '', remote, routeState = {}, ...params } = param;
  // 采买权限管理 - 权限控制范围为采购时，不限制商品来源，
  // 但 协议添加采买权限时，采购范围只能选择目录化商品
  const onlyCate = !path.includes('/product-authority') && param.agreementType === 'PUR_AGREEMENT';
  const standardFields = [
    {
      name: 'skuName',
      label: intl.get('sagm.common.model.skuName').d('商品名称'),
      display: true,
    },
    {
      name: 'skuCode',
      label: intl.get('sagm.common.model.skuCode').d('商品编码'),
      display: true,
    },
    {
      name: 'categoryLov',
      label: intl.get('sagm.common.model.platformCategory').d('平台分类'),
      type: 'object',
      valueField: 'categoryId',
      lovCode: 'SMPC.CATEGORY',
      ignore: 'always',
      display: true,
      lovPara: {
        tenantId: organizationId,
      },
    },
    {
      name: 'cid',
      // bind: 'categoryLov.categoryId',
      forceQuery: true,
      visible: false,
      transformValue: (value, record) => record.get('categoryLov')?.categoryId,
    },
    {
      name: 'catalogLov',
      label: intl.get('sagm.common.model.catalog').d('目录'),
      display: true,
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
      // bind: 'catalogLov.catalogId',
      forceQuery: true,
      visible: false,
      transformValue: (value, record) => record.get('catalogLov')?.catalogId,
    },
    {
      name: 'shelfSku',
      label: intl.get('sagm.common.model.shelfSku').d('是否已上架'),
      type: 'string',
      lookupCode: 'HPFM.FLAG',
      display: true,
      show: isExclude,
    },
  ].filter((f) => f.show !== false);
  const queryFields = remote ? remote.process('SKU_TRANSFER', standardFields) : standardFields;
  c7nModal({
    style: { width: 1090 },
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
        tabState={routeState}
        params={{ authorityListId: params.authorityListId }}
        queryFieldsLimit={3}
        leftInfo={{
          url: isExclude
            ? `/sagm/v1/${organizationId}/auth-exclude-sku-details/sku`
            : `/sagm/v1/${organizationId}/auth-sku-details/sku`,
          params: { ...params },
        }}
        rightInfo={{
          url: isExclude
            ? `/sagm/v1/${organizationId}/auth-exclude-sku-details`
            : `/sagm/v1/${organizationId}/auth-sku-details`,
          params: { ...params },
          title: isExclude ? intl.get('sagm.common.view.hasExcludeSku').d('已排除商品') : '',
        }}
        queryDs={
          new DataSet({
            // autoCreate: true,
            queryFields,
          })
        }
        onJoin={isExclude ? joinExcludeSku : joinAssignSku}
        onDelete={isExclude ? deleteExcludeSku : deleteAssignSku}
        onSkuChange={skuChange}
      />
    ),
  });
}

const DimensionRange = observer((props) => {
  const {
    readOnly,
    rangeType,
    setTitle = {},
    switchProps = {},
    tableProps = {},
    excludeTableProps = {},
    customizeTable,
    isModal,
  } = props;
  const BaseTitleComp = isModal ? SubContent : Card;
  const { rangeSetTitle, excludeSetTitle, excludeSetSubTitle } = setTitle;
  const { hiddenOldImport, ...others } = tableProps;
  const { controlRange, ...otherProps } = excludeTableProps;
  const { value, options, valueField = 'value', textField = 'meaning' } = switchProps;
  const { [textField]: text } = options?.find((f) => f[valueField] === value) || {};
  const buttonCode = readOnly
    ? ''
    : hiddenOldImport
    ? 'SAGM.AUTHORITY_RANGE.SPECIAL.BTNS'
    : 'SAGM.AUTHORITY_RANGE.BTNS';
  return (
    <div className="dimension-range-wrapper">
      <div style={{ marginBottom: 32 }}>
        <SwitchBox {...switchProps} readOnly={readOnly} readText={text} />
      </div>
      {!value && (
        <BaseTitleComp title={rangeSetTitle} thirdCard={isModal}>
          {/* 只读切换成编辑页，按钮组个性化报错，故分开处理 */}
          {!buttonCode ? (
            <Table {...others} />
          ) : (
            customizeTable(
              {
                code: 'SAGM.AUTHORITY_RANGE.TABLE',
                // 个性化配置了代码本不应该展示的按钮， 会出现按钮空白，应将code置空
                buttonCode,
              },
              <Table {...others} />
            )
          )}
        </BaseTitleComp>
      )}
      {/* 控制范围为会员， 无子账户维度 */}
      {((rangeType === 'USER' && controlRange !== 'MEMBER') || rangeType === 'SKU') && (
        <BaseTitleComp
          title={excludeSetTitle}
          subTitle={excludeSetSubTitle}
          thirdCard={isModal}
          style={isModal ? { padding: 0, marginTop: 32 } : {}}
        >
          <Table {...otherProps} style={{ maxHeight: 400 }} />
        </BaseTitleComp>
      )}
    </div>
  );
});

function AuthorityRange(props) {
  const {
    initDs,
    userDs,
    skuDs,
    excludeUserDs,
    excludeUserTableDs,
    excludeSkuTableDs,
    readOnly,
    path,
    type,
    dimensionCodes = [], // 用户、商品所有维度集合
    viewSkuBackPath,
    onRefresh = (e) => e,
    initCustomFields = (e) => e,
    getDimensionIsCustom = (e) => e,
    agreementHeaderType: saleType,
    customizeTable,
    remote,
    isModal,
  } = props;
  const [delSkuLoading, setDelSkuLoading] = useState(false);
  const [delUserLoading, setDelUserLoading] = useState(false);
  const { routeState = {} } = useContext(ProductAuthorityContext);
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

  const getBtns = (range, dataSet, disabled) => {
    if (readOnly) return [];
    // 会员协议用户条件 || 领用协议 老导入强行隐藏
    const hiddenOldImport =
      (range === 'USER' && sourceSaleType === 'MEMBER') || sourceSaleType === 'RECEIVE';
    const optionalBtns = hiddenOldImport
      ? []
      : [
          <ImportBtn
            name="oldImport"
            // disabled={disabled || !authorityListId}
            onClick={() => handleBtnEvents(range, 'import')}
          />,
        ];
    const btns = [
      // <ConfigDropdown
      //   name='createGroup'
      //   overlay={[
      //     {
      //       name: 'create',
      //       children: <CreateBtn
      //         name="create"
      //         disabled={disabled}
      //         onClick={() => handleBtnEvents(range, 'create')}
      //       />,
      //     },
      //     {
      //       name: 'oldImport',
      //       show: !hiddenOldImport,
      //       children: <ImportBtn
      //         name="oldImport"
      //         onClick={() => handleBtnEvents(range, 'import')}
      //       />,
      //     },
      //     {
      //       name: 'newImport',
      //       children: <ImportBtnNew
      //         name="newImport"
      //         sourceSaleType={sourceSaleType}
      //         range={range}
      //         authorityListId={authorityListId}
      //         successCallBack={() => onRefresh(range)}
      //         path={path}
      //       />,
      //     },
      //   ].filter(f => f.show !== false)}
      // >
      //   <DropdownBtn
      //     text={intl.get('hzero.common.button.add').d('新增')}
      //     icon="playlist_add"
      //     funcType="flat"
      //   />
      // </ConfigDropdown>,
      // <DeleteBtn
      //   name="delete"
      //   dataSet={dataSet}
      //   loading={range === 'USER' ? delUserLoading : delSkuLoading}
      //   onClick={() => handleBtnEvents(range, 'delete')}
      // />,
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
        authorityListId={authorityListId}
        successCallBack={() => onRefresh(range)}
        path={path}
      />,
    ];
    return btns;
  };

  const userRangeBtns = [...getBtns('USER', userDs, allUserEnable)];
  const skuRangeBtns = [...getBtns('SKU', skuDs, allSkuEnable)];

  const getColumns = (rangeType) => [
    {
      name: 'dimension',
      width: 200,
      tooltip: 'none',
      renderer: ({ record }) => {
        return readOnly
          ? (record.get('dimension') || {}).meaning
          : renderDimensionSelect(record, rangeType);
      },
    },
    {
      name: 'dimensionValue',
      tooltip: 'none',
      renderer: readOnly ? renderDimensionRead : renderDimensionEditor,
    },
  ];

  const getExcludeColumns = useCallback(
    (rangeType) => {
      const isReceive = sourceSaleType === 'RECEIVE';

      const rendererPrices = ({ name, record }) => {
        const priceList = record.get('productPoolList') || [];
        const priceInfo = priceList[0] || {};
        // 价格信息不为一或者为类型为阶梯价格，含税单价不展示
        if (name !== 'nakedPrice' && (priceList.length !== 1 || priceInfo.ladderEnableFlag)) {
          return undefined;
        }
        // 价格信息小于二，同时类型不为阶梯价格
        if (priceList.length < 2 && !priceInfo.ladderEnableFlag) {
          return precisionRender({ name, recordData: priceInfo });
        } else if (priceList.length < 2 && priceInfo.ladderEnableFlag) {
          return (
            <a onClick={() => openLadderPrice(priceInfo.productPoolLadderList)}>
              {intl.get('sagm.common.model.ladderPrice').d('阶梯价格')}
            </a>
          );
        }
        return (
          <a onClick={() => openPriceInfo(priceList)}>
            {intl.get('sagm.common.model.priceInfo').d('价格信息')}
          </a>
        );
      };

      const renderAgreementLineOrNumber = ({ record }) => {
        const priceList = record.get('productPoolList') || [];
        const num = (priceList[0] || {}).agreementNumber;
        const lineNum = (priceList[0] || {}).agreementLineNumber;
        if (!num && !lineNum) {
          return '-';
        }
        return priceList.length > 1 ? '-' : `${num || '-'}-${lineNum || '-'}`;
      };

      switch (rangeType) {
        case 'USER':
          return [
            {
              name: 'loginName',
              width: 250,
            },
            {
              name: 'realName',
            },
          ];
        case 'SKU':
          return [
            {
              name: 'skuCode',
              width: 120,
              renderer: ({ value, record }) =>
                record.get('sourceFrom') === 'EC' ? (
                  value
                ) : (
                  <a
                    onClick={() => {
                      openSkuDetail({
                        record,
                        backPath: viewSkuBackPath,
                        tabState: routeState,
                      });
                    }}
                  >
                    {value}
                  </a>
                ),
            },
            { name: 'skuName', width: 200 },
            { name: 'categoryName', width: 120 },
            {
              name: 'catalogName',
              width: 150,
              label: intl.get('sagm.common.model.catalog').d('目录'),
              tooltip: 'overflow',
            },
            {
              name: 'uomName',
              width: 80,
              renderer: ({ record }) => {
                const priceList = record.get('productPoolList') || [];
                const { uomName } = priceList[0] || {};
                return priceList.length > 1 ? undefined : uomName;
              },
            },
            { name: 'nakedPrice', width: 120, renderer: rendererPrices },
            { name: 'agreementPrice', width: 120, renderer: rendererPrices },
            {
              name: 'agreementNumber',
              title: intl.get('sagm.common.model.agreementNumAndLine').d('协议号-行号'),
              width: 150,
              show: !isReceive,
              renderer: renderAgreementLineOrNumber,
            },
          ].filter((f) => f.show !== false);
        default:
          return [];
      }
    },
    [sourceSaleType]
  );

  const excludeTableBtns = useCallback(
    (rangeType) => {
      if (readOnly) return [];
      switch (rangeType) {
        case 'USER':
          return [
            <Lov
              mode="button"
              icon="playlist_add"
              funcType="flat"
              name="subAccount"
              dataSet={excludeUserDs}
              viewMode="drawer"
              clearButton={false}
              tableProps={{ style: { maxHeight: 'calc(100vh - 152px)' } }}
              modalProps={{
                title: intl.get('sagm.common.view.lov.subAccount').d('子账户'),
              }}
              onBeforeSelect={(records) => {
                records.forEach((r) => {
                  excludeUserTableDs.create(r.toData());
                });
              }}
              // 再次打开弹窗，清除之前勾选记录
              onChange={() => {
                excludeUserDs.reset();
              }}
            >
              {intl.get('hzero.common.button.add').d('新增')}
            </Lov>,
            <Observer>
              {() => (
                <Button
                  icon="delete_sweep"
                  funcType="flat"
                  disabled={excludeUserTableDs.selected.length < 1}
                  onClick={() => {
                    confirm({
                      content: intl.get('smpc.common.view.confirm.delete').d('确认删除选中行'),
                      onOk: () => {
                        excludeUserTableDs.remove(excludeUserTableDs.selected);
                      },
                    });
                  }}
                >
                  {intl.get('small.common.model.batchDelete').d('批量删除')}
                </Button>
              )}
            </Observer>,
          ];
        case 'SKU':
          return [
            <Button
              icon="settings"
              funcType="flat"
              onClick={() =>
                showTransfer(
                  {
                    agreementHeaderId,
                    authorityListId,
                    agreementType,
                    path,
                    isReceive: initDs.current.get('agreementHeaderType') === 'RECEIVE',
                    remote,
                    routeState,
                  },
                  false,
                  viewSkuBackPath,
                  null,
                  (versionNum) => {
                    updateObjectVersionNumber(versionNum);
                    excludeSkuTableDs.query();
                  },
                  true
                )
              }
            >
              {intl.get('sagm.common.model.batchManageSku').d('管理商品')}
            </Button>,
          ];
        default:
          return [];
      }
    },
    [readOnly]
  );

  function handleBtnEvents(range, option) {
    if (!['USER', 'SKU'].includes(range)) return;
    const ds = range === 'USER' ? userDs : skuDs;
    const loadingChange = range === 'USER' ? setDelUserLoading : setDelSkuLoading;
    const eventMap = {
      delete: async () => {
        if (authorityListId) {
          // 初始化加载数据_status = update
          const createRecords = ds.selected.filter(
            (f) => f.get('_status') !== 'update' && !f.get('hasSku')
          );
          ds.remove(createRecords);
          // 添加商品后，页面不会刷新，商品维度 是新建状态， 但其实已经存表了
          const updateRecords = ds.selected.filter(
            (f) =>
              f.get('_status') === 'update' || (f.get('_status') !== 'update' && f.get('hasSku'))
          );
          if (updateRecords.length > 0) {
            // 弹窗提示
            confirm({
              content: intl.get('smpc.common.view.confirm.delete').d('确认删除选中行'),
              onOk: async () => {
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
              },
            });
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
        // eslint-disable-next-line no-shadow
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
    const ds = rangeType === 'USER' ? userDs : skuDs;
    const otherDimensions = ds
      .filter((r) => r.index !== record.index)
      .map((m) => m.get('dimensionCode'));
    return (
      <Select
        showValidation="tooltip"
        record={record}
        name="dimensionCode"
        onChange={(value, oldValue) => handleSelectChange({ value, oldValue, record })}
        // 已选维度不能再选
        optionsFilter={(r) => {
          return !otherDimensions.includes(r.get('value'));
        }}
        disabled={!!(record.get('dimensionCode') === 'SKU' && record.get('hasSku'))}
      >
        {sortRes.map((m) => {
          return (
            // m.value === 'SKU' && !authorityListId && !getDimensionIsCustom('SKU') ? (
            //   <Select.Option value={m.value} key={m.value} disabled>
            //     <Tooltip
            //       title={intl
            //         .get('sagm.common.view.dimensionRequireSave')
            //         .d('请保存权限配置后再选择该维度')}
            //     >
            //       {m.meaning}
            //     </Tooltip>
            //   </Select.Option>
            // ) : (
            <Select.Option value={m.value} key={m.value}>
              {m.meaning}
            </Select.Option>
            // )
          );
        })}
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
          showValidation="tooltip"
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
      ROLE: <Lov showValidation="tooltip" record={record} name="ROLE" maxTagCount={3} />,
      USER: <Lov showValidation="tooltip" record={record} name="USER" maxTagCount={3} />,
      AREA: (
        <Lov
          showValidation="tooltip"
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
            showTransfer(
              {
                agreementHeaderId,
                authorityListId,
                agreementType,
                path,
                isReceive: initDs.current.get('agreementHeaderType') === 'RECEIVE',
                routeState,
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
          showValidation="tooltip"
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
          showValidation="tooltip"
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
          showValidation="tooltip"
          record={record}
          name="PRICE_RANGE"
          placeholder={[
            intl.get('sagm.common.view.priceFrom').d('价格从'),
            intl.get('sagm.common.view.priceTo').d('价格至'),
          ]}
        />
      ),
      SUPPLIER: <Lov showValidation="tooltip" record={record} name="SUPPLIER" maxTagCount={3} />,
      SKU_LABEL: <Lov showValidation="tooltip" record={record} name="SKU_LABEL" maxTagCount={3} />,
      MEMBER: <Lov showValidation="tooltip" record={record} name="MEMBER" maxTagCount={3} />,
      MEMBER_LABEL: (
        <Lov showValidation="tooltip" record={record} name="MEMBER_LABEL" maxTagCount={3} />
      ),
      COMMODITY_SOURCE: <Select showValidation="tooltip" record={record} name="COMMODITY_SOURCE" />,
    };

    return record.getState('customDimension')
      ? getCustomEditor(dimensionCode, record)
      : preEditorMap[dimensionCode];
  }

  function getCustomEditor(dimensionCode, record, onlyRead = false) {
    const customDimension = record.getState('customDimension');
    if (customDimension) {
      const { componentType } = customDimension;
      const components = {
        LOV: (
          <Lov
            showValidation="tooltip"
            record={record}
            name="customDimension"
            readOnly={onlyRead}
            onChange={(value, oldValue) => handleEditorLovChange({ value, oldValue, record })}
          />
        ),
        SELECT: (
          <Select
            showValidation="tooltip"
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
  const BaseTitleComp = isModal ? Card : SubContent;
  const rangeTitle =
    type === 'USER'
      ? intl.get('sagm.productAuthority.view.step.userRange').d('用户条件范围')
      : intl.get('sagm.productAuthority.view.step.skuRange').d('商品条件范围');
  const switchTitle =
    type === 'USER'
      ? intl.get('sagm.productAuthority.view.step.userRange1').d('用户范围')
      : intl.get('sagm.productAuthority.view.step.skuRange1').d('商品范围');
  return (
    <BaseTitleComp
      title={rangeTitle}
      subTitle={
        type === 'USER'
          ? intl.get('sagm.productAuthority.view.step.userRange.relation').d('多个条件间为且的关系')
          : initDs.current?.get('__purManual')
          ? intl
              .get('sagm.productAuthority.view.step.skuRange.relation')
              .d('多个条件间为且的关系，商品范围为来源协议管理的商品')
          : intl.get('sagm.productAuthority.view.step.userRange.relation').d('多个条件间为且的关系')
      }
    >
      <div className={styles['authority-range']}>
        {type === 'USER' && (
          <DimensionRange
            customizeTable={customizeTable}
            readOnly={readOnly}
            rangeType={type}
            isModal={isModal}
            setTitle={{
              rangeSetTitle: intl
                .get('sagm.productAuthority.view.step.setUserRange')
                .d('用户条件设置'),
              excludeSetTitle: intl
                .get('sagm.common.view.button.excludeSomeUser')
                .d('排除部分用户'),
              excludeSetSubTitle: intl
                .get('sagm.common.view.message.excludeSomeUserOpt')
                .d('在用户条件范围为全部用户或部分用户的基础上，再排除一部分用户'),
            }}
            switchProps={{
              value: allUserEnable || 0,
              title: switchTitle,
              options: [
                { value: 1, meaning: intl.get('sagm.common.model.allUser').d('全部用户') },
                { value: 0, meaning: intl.get('sagm.common.model.someUser').d('部分用户') },
              ],
              onChange: (val) => {
                if (initDs.current) initDs.current.set('allUserEnable', val);
                // handleSwitchChange(val, allSkuEnable, 'allSkuEnable');
              },
            }}
            tableProps={{
              dataSet: userDs,
              columns: getColumns('USER'),
              buttons: userRangeBtns,
              // 会员协议用户条件 || 领用协议 无老导入
              hiddenOldImport: sourceSaleType === 'MEMBER' || sourceSaleType === 'RECEIVE',
            }}
            excludeTableProps={{
              controlRange,
              dataSet: excludeUserTableDs,
              customizedCode: 'EXCLUDE_USER_TABLE',
              columns: getExcludeColumns('USER'),
              buttons: excludeTableBtns('USER'),
            }}
          />
        )}
        {type === 'SKU' && (
          <DimensionRange
            customizeTable={customizeTable}
            readOnly={readOnly}
            rangeType={type}
            isModal={isModal}
            setTitle={{
              rangeSetTitle: intl
                .get('sagm.productAuthority.view.step.skuSetRange')
                .d('商品条件设置'),
              excludeSetTitle: intl.get('sagm.common.view.button.excludeSomeSku').d('排除部分商品'),
              excludeSetSubTitle: intl
                .get('sagm.common.view.message.excludeSomeSkuOpt')
                .d('在商品条件范围为全部商品或部分商品的基础上，再排除一部分商品'),
            }}
            switchProps={{
              value: allSkuEnable || 0,
              title: switchTitle,
              disabled: !agreementHeaderId,
              options: [
                { value: 1, meaning: intl.get('sagm.common.model.allSku').d('全部商品') },
                { value: 0, meaning: intl.get('sagm.common.model.someSku').d('部分商品') },
              ],
              onChange: (val) => {
                if (initDs.current) initDs.current.set('allSkuEnable', val);
                // handleSwitchChange(val, allUserEnable, 'allUserEnable');
              },
            }}
            tableProps={{
              dataSet: skuDs,
              columns: getColumns('SKU'),
              buttons: skuRangeBtns,
              // 领用协议 无老导入
              hiddenOldImport: sourceSaleType === 'RECEIVE',
            }}
            excludeTableProps={{
              controlRange,
              // style: { maxHeight: readOnly ? 110 : 78 },
              dataSet: excludeSkuTableDs,
              customizedCode: 'EXCLUDE_SKU.TABLE',
              columns: getExcludeColumns('SKU'),
              buttons: excludeTableBtns('SKU'),
            }}
          />
        )}
      </div>
    </BaseTitleComp>
  );
}

export default flowRight(
  withCustomize({
    unitCode: [
      'SAGM.AUTHORITY_RANGE.BTNS',
      'SAGM.AUTHORITY_RANGE.TABLE',
      'SAGM.AUTHORITY_RANGE.SPECIAL.BTNS',
    ],
  })
)(memo(observer(AuthorityRange)));
