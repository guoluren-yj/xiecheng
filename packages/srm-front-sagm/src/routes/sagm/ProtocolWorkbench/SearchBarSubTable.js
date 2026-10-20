import React, { memo, useState, useRef, useMemo } from 'react';
import { withRouter } from 'react-router-dom';
import { flowRight, isEmpty } from 'lodash';
import qs from 'qs';
import { Button } from 'choerodon-ui/pro';
import { math } from 'choerodon-ui/dataset';
import { Icon } from 'choerodon-ui';

import intl from 'utils/intl';
import { dateRender } from 'utils/renderer';
import SearchBarTable from '_components/SearchBarTable';
import { getCurrentOrganizationId } from 'utils/utils';
import { Button as PermissionButton } from 'components/Permission';
import { openApproveModal } from '_components/ApproveModal';
import ApproveRecordSimple from '_components/ApproveRecordSimple';

import Image from '@/components/Image';
import QueryField from '@/components/QueryField';
import { openSkuDetail } from '@/utils/openCommonTab';
import { withCustomDimension, getCustDimColumns } from '@/utils/customDimension';
import DropdownMenus from './component/DropdownMenus';
import ViewFilter from './component/ViewFilter';
import {
  agreementStatusRender,
  effectiveFlagRender,
  taxPriceRender,
  regionRender,
  buyOrganizationRender,
  otherInfoRender,
  productStatusRender,
  openProductModal,
  openTransferModal,
} from './renderUtils';
import { handleRevokeApprove } from '../commonUtils';

import styles from './index.less';

const organizationId = getCurrentOrganizationId();

const SearchBarSubTable = props => {
  // const [productVisible, setProductVisible] =useState(false);
  const queryRef = useRef();
  const {
    customizeTable,
    customizeUnitCode,
    dataSet = [],
    searchBarCode,
    componentKey = '',
    uomFlag,
    // onDeleteSku,
    skuApprove,
    custDimensions,
  } = props;
  const [prefix, suffix] = componentKey.split('_');
  const _key = !suffix ? 'protocol' : prefix === 'protocol' ? 'protocol_detail' : 'product_detail';
  const show = suffix;
  // 聚合
  const [aggregation, setAggregation] = useState(!!suffix);

  const custDimColumns = useMemo(
    () =>
      getCustDimColumns(dataSet, custDimensions, {
        sort: _key === 'product_detail' ? 290 : 48,
        readOnly: true,
      }),
    [_key, custDimensions]
  );

  const handleToNew = record => {
    const { agreementId, versionNum } = record.get(['agreementId', 'versionNum']);
    const {
      history: { push },
    } = props;
    let status = record.get('agreementStatus') === 'NEW' ? 'edit' : 'read';
    const { wflApproveFlag, wflRevokeApproveFlag, taskId, processInstanceId, workflowBusinessKey } =
      record?.get([
        'wflApproveFlag',
        'wflRevokeApproveFlag',
        'taskId',
        'processInstanceId',
        'workflowBusinessKey',
      ]) || {};
    if (['all', 'deleted', 'protocol_detail', 'product_detail'].includes(componentKey)) {
      status = 'read';
    }
    push({
      pathname: `/sagm/sagm-protocol-workbench/detail/${status}`,
      search: qs.stringify({
        agreementId,
        versionNum,
        wflApproveFlag,
        wflRevokeApproveFlag,
        taskId,
        processInstanceId,
        businessKey: workflowBusinessKey?.[0],
      }),
    });
  };

  /**
   *商品预览
   */
  const handleGoodsPreview = record => {
    // setProductVisible(false);
    openSkuDetail({
      record,
      backPath: '/sagm/sagm-protocol-workbench/list',
    });
  };

  // 操作列
  const renderOptions = ({ record, aggregation: _aggregation }) => {
    const actions = [
      // {
      //   text: intl.get('small.common.model.look').d('查看'),
      //   event: () => handleGoodsPreview(record),
      // },
      // {
      //   text: intl.get('sagm.protocolManagement.view.btn.addPlusProduct').d('追加商品'),
      //   event: () => openProductModal(record.toData(), dataSet, 'add'),
      // },
      {
        text: intl.get('sagm.protocolManagement.view.btn.changeProduct').d('变更商品'),
        event: () => openProductModal(record.toData(), dataSet, 'replace'),
        permission: true,
        permissionList: [
          {
            code: `sagm-protocol-workbench.button.skuNumber`,
            type: 'button',
            meaning: '商城协议工作台-协议商品数量',
          },
        ],
      },
      // {
      //   text: intl.get('sagm.protocolManagement.view.btn.remove').d('移除'),
      //   event: () => onDeleteSku([record]),
      //   permission: true,
      //   permissionList: [
      //     {
      //       code: `sagm-protocol-workbench.button.skuNumber`,
      //       type: 'button',
      //       meaning: '商城协议工作台-协议商品数量',
      //     },
      //   ],
      // },
    ];
    const maxLength = _aggregation ? 4 : 3;
    return getOptions(actions, maxLength);
  };

  const getOptions = (actions = [], maxLength = 4) => {
    const filterActions = actions.filter(f => {
      const { _show = true } = f;
      return _show;
    });
    const viewActions =
      filterActions.length > maxLength ? filterActions.slice(0, maxLength - 1) : filterActions;
    // 更多操作
    const menuActions = filterActions.slice(maxLength - 1, filterActions.length);
    const command = viewActions.map(m => {
      const { text, disabled, permission = false, event = e => e, ...others } = m;
      const ButtonRef = permission ? PermissionButton : Button;
      return (
        <ButtonRef disabled={disabled} onClick={event} funcType="link" type="c7n-pro" {...others}>
          {text}
        </ButtonRef>
      );
    });
    if (filterActions.length > maxLength) {
      command.push(
        <DropdownMenus menus={menuActions} placement="bottomLeft">
          <Button funcType="link" color="primary">
            {intl.get('hzero.common.button.more').d('更多')}
            <Icon type="expand_more" style={{ fontSize: 14, marginLeft: 4, marginTop: -2 }} />
          </Button>
        </DropdownMenus>
      );
    }
    return command;
  };

  // 协议各个tab
  const getProtocolColumns = () => {
    return [
      {
        name: 'agreementStatusMeaning',
        width: 100,
        tooltip: 'none',
        renderer: agreementStatusRender,
      },
      {
        name: 'action',
        width: 180,
        align: 'left',
        show: componentKey === 'submitted', // 待审批
        header: intl.get('hzero.common.action').d('操作'),
        command: ({ record }) => [
          !!record.get('wflApproveFlag') && (
            <Button
              funcType="link"
              className="action-link-btn"
              onClick={() => {
                openApproveModal({
                  modalProps: {
                    closable: true,
                  },
                  taskId: record.get('taskId'),
                  processInstanceId: record.get('processInstanceId'),
                  onSuccess: () => dataSet.query(dataSet.currentPage),
                });
              }}
            >
              {intl.get('hzero.common.button.approval').d('审批')}
            </Button>
          ),
          !!record.get('wflRevokeApproveFlag') && (
            <Button
              className="action-link-btn"
              funcType="link"
              onClick={() =>
                handleRevokeApprove(record.get('workflowBusinessKey')?.[0], () =>
                  dataSet.query(dataSet.currentPage)
                )
              }
            >
              {intl.get('hzero.common.button.revokeApproval').d('撤销审批')}
            </Button>
          ),
        ],
      },
      {
        name: 'agreementNumber',
        width: 200,
        renderer: ({ text, record }) => <a onClick={() => handleToNew(record)}>{text}</a>,
      },
      {
        name: 'agreementName',
        width: 200,
      },
      {
        name: 'approvalProgress',
        width: 180,
        show: componentKey === 'submitted',
        header: intl.get('sagm.common.view.approvalProgress').d('审批进度'),
        renderer: ({ record }) =>
          isEmpty(record.get('simpleApprovalHistory')) ? (
            '-'
          ) : (
            <ApproveRecordSimple data={record.get('simpleApprovalHistory') || []} />
          ),
      },
      {
        name: 'versionNum',
        align: 'right',
        width: 80,
        renderer: ({ text }) => text || '-',
      },
      {
        name: 'creationDate',
        width: 120,
        renderer: ({ text }) => dateRender(text),
      },
      {
        name: 'companyName',
        minWidth: 180,
      },
      {
        name: 'supplierCompanyName',
        minWidth: 180,
      },
      {
        name: 'sourceFromMeaning',
        width: 100,
      },
      {
        name: 'createdByName',
        width: 100,
      },
      // {
      //   name: 'operate',
      //   title: intl.get('hzero.common.button.historyVersion').d('历史版本'),
      //   width: 80,
      //   align: 'left',
      //   lock: 'right',
      //   renderer: ({ record }) =>
      //     record.get('versionNum') !== 1 ? (
      //       <Button
      //         funcType="link"
      //         color="primary"
      //         onClick={() => viewHistory(record, recordCallBack)}
      //       >
      //         {intl.get('hzero.common	button.viewDetails').d('查看详情')}
      //       </Button>
      //     ) : (
      //       '-'
      //     ),
      // },
    ].filter(n => n.show || !('show' in n));
  };

  // 协议明细
  const getProtocolDetailColumns = () => {
    const columns = [
      {
        key: 'statusMeaning',
        width: 120,
        aggregation: true,
        header: intl.get('small.common.model.status').d('状态'),
        children: [
          {
            name: 'agreementStatusMeaning',
            renderer: agreementStatusRender,
          },
          {
            name: 'effectiveFlagMeaning',
            renderer: effectiveFlagRender,
          },
        ],
      },
      {
        key: 'protocolInfo',
        minWidth: 250,
        aggregation: true,
        align: 'left',
        header: intl.get('sagm.protocolManagement.view.protocolInfo').d('协议信息'),
        children: [
          {
            name: 'agreementNumber',
            minWidth: 170,
            header: aggregation
              ? undefined
              : intl.get('sagm.common.view.agreementCodeAndLineNum').d('协议编码-行号'),
            renderer: ({ text, record }) => (
              <a onClick={() => handleToNew(record)}>
                {aggregation ? text : `${text}-${record.get('lineNum')}`}
              </a>
            ),
          },
          {
            name: 'agreementName',
            minWidth: 180,
            // renderer: rendererCompare,
          },
          {
            name: 'versionNum',
            width: 80,
            renderer: ({ text }) => text || '-',
          },
          {
            name: 'lineNum',
            width: 80,
            align: 'right',
            show: aggregation,
          },
          {
            name: 'creationDate',
            width: 150,
          },
        ],
      },
      {
        key: 'companyInfo',
        width: 220,
        aggregation: true,
        align: 'left',
        header: intl.get('sagm.protocolManagement.view.companyInfo').d('供采公司'),
        children: [
          {
            name: 'companyName',
            minWidth: 180,
          },
          {
            name: 'supplierCompanyName',
            minWidth: 180,
          },
        ],
      },
      {
        key: 'itemInfo',
        width: 180,
        aggregation: true,
        align: 'left',
        header: intl.get('sagm.protocolManagement.view.itemInfo').d('物料信息'),
        children: [
          {
            name: 'itemCode',
            width: 120,
          },
          {
            name: 'itemName',
            minWidth: 180,
          },
          {
            name: 'itemCategoryName',
            width: 120,
          },
          {
            name: 'uomName',
            width: 100,
          },
        ],
      },
      {
        key: 'priceInfo',
        width: 200,
        aggregation: true,
        align: 'left',
        header: intl.get('sagm.protocolManagement.view.priceInfo').d('价格信息'),
        children: [
          {
            name: 'taxPrice',
            width: 120,
            renderer: taxPriceRender,
          },
          {
            name: 'currencyName',
            width: 120,
          },
          {
            name: 'tax',
            width: 120,
            renderer: ({ value }) => value && math.floor(value),
          },
          {
            name: 'validDate',
            title: intl.get('sagm.common.view.validDate').d('有效期'),
            width: 150,
            renderer: ({ record }) => {
              const from = record.get('validDateFrom');
              const to = record.get('validDateTo');
              return (
                <span>
                  {dateRender(from)}~{dateRender(to)}
                </span>
              );
            },
          },
        ],
      },
      {
        key: 'saleInfo',
        width: 180,
        aggregation: true,
        align: 'left',
        header: intl.get('sagm.protocolManagement.view.saleInfo').d('可售信息'),
        children: [
          {
            name: 'saleRegion',
            width: 120,
            title: intl.get('sagm.protocolManagement.view.saleRegion').d('可售区域'),
            renderer: regionRender,
          },
          {
            name: 'buyOrganization',
            width: 120,
            title: intl.get('sagm.protocolManagement.view.buyOrganization').d('可采买组织'),
            renderer: buyOrganizationRender,
          },
          ...custDimColumns,
          {
            name: 'otherInfo',
            width: 120,
            title: intl.get('sagm.protocolManagement.view.otherInfo').d('其他信息'),
            renderer: otherInfoRender,
          },
        ],
      },
      {
        name: 'product',
        title: intl.get('sagm.protocolManagement.view.productInfo').d('添加商品'),
        width: 110,
        renderer: ({ record }) => (
          <a
            onClick={() =>
              openTransferModal(
                record.toData(),
                '/sagm/sagm-protocol-workbench/list?tabKey=protocol_detail',
                undefined,
                skuApprove
              )
            }
          >
            {intl
              .get('small.common.model.productManage', { value: record.get('detailsFlag') })
              .d(`商品管理(${record.get('detailsFlag')})`)}
          </a>
        ),
      },
      {
        name: 'sourceFromMeaning',
        width: 100,
      },
    ];
    return columns
      .filter(c => c.show !== false)
      .map(m =>
        m.children?.length ? { ...m, children: m.children.filter(f => f.show !== false) } : m
      );
  };

  // 商品明细
  const getProductDetailColumns = () => {
    const columns = [
      {
        name: 'purSkuStatusMeaning',
        width: 100,
        renderer: productStatusRender,
        tooltip: false,
      },
      {
        name: 'operate',
        title: intl.get('sagm.protocolManagement.view.operate').d('操作'),
        width: 100,
        align: 'left',
        command: renderOptions,
        tooltip: 'none',
      },
      {
        name: 'imagePath',
        width: 100,
        show: !aggregation,
        renderer: ({ record }) => {
          const imagePath = record.get('imagePath');
          return <Image className="sku-img" value={imagePath} width={32} height={32} />;
        },
      },
      {
        key: 'productInfo',
        minWidth: 220,
        aggregation: true,
        align: 'left',
        header: intl.get('sagm.protocolManagement.view.productInfo').d('商品信息'),
        // aggregationLimit: 3,
        children: [
          {
            name: 'skuCode',
            minWidth: 150,
            renderer: ({ record, value }) => (
              <a onClick={() => handleGoodsPreview(record)}>{value}</a>
            ),
          },
          {
            name: 'skuName',
            minWidth: 180,
          },
          {
            name: 'skuUom',
            width: 80,
            hidden: !uomFlag,
          },
          {
            name: 'skuBrand',
            minWidth: 150,
          },
        ],
        renderer: ({ text, record }) => {
          const imagePath = record.get('imagePath');
          return (
            <div className={styles['sku-container']}>
              <div className="sku-info">
                <Image className="sku-img" value={imagePath} width={64} height={64} />
                <div className="sku-content">{text}</div>
              </div>
            </div>
          );
        },
      },
      {
        name: 'status',
        width: 130,
        header: intl.get('sagm.protocolManagement.view.protocolBothStatus').d('协议状态/明细状态'),
        renderer: ({ record }) => (
          <>
            {agreementStatusRender({ text: record.get('agreementStatusMeaning'), record })}
            <span style={{ margin: '0 4px 0 -1px' }}>/</span>
            {effectiveFlagRender({ text: record.get('effectiveFlagMeaning'), record })}
          </>
        ),
        show: !aggregation,
      },
      {
        key: 'protocolInfo',
        minWidth: 220,
        aggregation: true,
        align: 'left',
        header: intl.get('sagm.protocolManagement.view.protocolInfo').d('协议信息'),
        children: [
          {
            name: 'agreementNumber',
            minWidth: 170,
            title: intl.get('sagm.common.view.agreementCodeAndLineNum').d('协议编码-行号'),
            renderer: ({ text, record }) => (
              <a onClick={() => handleToNew(record)}>{`${text}-${record.get('lineNum')}`}</a>
            ),
          },
          {
            name: 'agreementName',
            minWidth: 180,
          },
          {
            key: 'agreementStatusMeaning',
            minWidth: 120,
            renderer: agreementStatusRender,
            show: aggregation,
          },
          {
            key: 'effectiveFlagMeaning',
            minWidth: 120,
            renderer: effectiveFlagRender,
            show: aggregation,
          },
          {
            name: 'versionNum',
            width: 80,
            align: 'right',
            renderer: ({ text }) => text || '-',
          },
          // {
          //   name: 'lineNum',
          //   width: 80,
          //   show: aggregation,
          // },
        ],
      },
      {
        key: 'companyInfo',
        width: 220,
        aggregation: true,
        align: 'left',
        header: intl.get('sagm.protocolManagement.view.companyInfo').d('供采公司'),
        children: [
          {
            name: 'companyName',
            minWidth: 180,
          },
          {
            name: 'supplierCompanyName',
            minWidth: 180,
          },
        ],
      },
      {
        key: 'itemInfo',
        width: 220,
        aggregation: true,
        align: 'left',
        header: intl.get('sagm.protocolManagement.view.itemInfo').d('物料信息'),
        children: [
          {
            name: 'itemCode',
            width: 120,
          },
          {
            name: 'itemName',
            minWidth: 180,
          },
          {
            name: 'itemCategoryName',
            width: 120,
          },
          {
            name: 'uomName',
            width: 100,
          },
        ],
      },
      {
        key: 'priceInfo',
        width: 180,
        aggregation: true,
        align: 'left',
        header: intl.get('sagm.protocolManagement.view.priceInfo').d('价格信息'),
        children: [
          {
            name: 'taxPrice',
            width: 120,
            renderer: taxPriceRender,
          },
          {
            name: 'currencyName',
            width: 120,
          },
          {
            name: 'tax',
            width: 120,
            renderer: ({ value }) => value && math.floor(value),
          },
        ],
      },
      {
        key: 'saleInfo',
        width: 180,
        aggregation: true,
        align: 'left',
        header: intl.get('sagm.protocolManagement.view.saleInfo').d('可售信息'),
        children: [
          {
            name: 'saleRegion',
            width: 120,
            title: intl.get('sagm.protocolManagement.view.saleRegion').d('可售区域'),
            renderer: regionRender,
          },
          {
            name: 'buyOrganization',
            width: 120,
            title: intl.get('sagm.protocolManagement.view.saleOrganization').d('可售组织'),
            renderer: buyOrganizationRender,
          },
          ...custDimColumns,
        ],
      },
    ];
    return columns
      .filter(c => c.show !== false)
      .map(m =>
        m.children?.length ? { ...m, children: m.children.filter(f => f.show !== false) } : m
      );
  };

  const columnMap = {
    protocol: getProtocolColumns,
    protocol_detail: getProtocolDetailColumns,
    product_detail: getProductDetailColumns,
  };

  const searchBarProps = {
    aggregation,
    style: { maxHeight: 'calc(100% - 22px)' },
    searchBarConfig: {
      fieldProps: {
        companyId: { lovPara: { tenantId: organizationId } },
        supplierCompanyId: { lovPara: { tenantId: organizationId } },
        skuId: { lovPara: { tenantId: organizationId } },
        createdByIds: { lovPara: { organizationId } },
      },
      // editorProps: {
      //   agreementStatus: {
      //     optionsFilter: (r) => r.get('value') !== 'DELETED',
      //   },
      // },
      onReset: () => {
        if (queryRef.current) queryRef.current.handleClear();
      },
      onClear: () => {
        if (queryRef.current) queryRef.current.handleClear();
      },
      left: {
        render: () => (
          <QueryField
            name="agreementNumbers"
            dataSet={dataSet}
            onRef={ref => {
              queryRef.current = ref;
            }}
            placeholder={
              show
                ? intl
                    .get('sagm.common.view.queryMsg.agreementCodeAndLineNo')
                    .d('请输入协议编码-行号查询')
                : intl.get('sagm.common.view.queryMsg.agreementCode').d('请输入协议编码查询')
            }
          />
        ),
      },
      right: show
        ? {
            render: () => (
              <ViewFilter
                aggregation={aggregation}
                onAggregationChange={_aggregation => {
                  setAggregation(_aggregation);
                }}
              />
            ),
          }
        : {},
    },
    cacheState: true,
    searchCode: searchBarCode,
    onAggregationChange: setAggregation,
  };

  if (!aggregation) {
    searchBarProps.rowHeight = 32;
  }
  return customizeTable(
    { code: customizeUnitCode },
    <SearchBarTable dataSet={dataSet} columns={columnMap[_key]()} {...searchBarProps} />
  );
};

export default flowRight(
  withRouter,
  withCustomDimension(false)
)(memo(SearchBarSubTable));
