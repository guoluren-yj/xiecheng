/**
 * SupplierWarehouse - 简易供应商入库
 * @date: 2020-12-29
 * @author: lvxiaomei <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */

import React, { Fragment, useEffect, useState, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { compose, isEmpty } from 'lodash';
import { routerRedux } from 'dva/router';
import { Button, DataSet, Table, Modal, Form, Select, Lov, Spin } from 'choerodon-ui/pro';
import querystring from 'querystring';

import remote from 'utils/remote';
import intl from 'utils/intl';
import withProps from 'utils/withProps';
import { SRM_SSLM } from '_utils/config';
import CommonImport from 'components/Import';
import notification from 'utils/notification';
import {
  getCurrentUserId,
  getResponse,
  getCurrentOrganizationId,
  filterNullValueObject,
} from 'utils/utils';
import { Header, Content } from 'components/Page';
import { Button as PermissionButton } from 'components/Permission';
import formatterCollections from 'utils/intl/formatterCollections';
import WithCustomize from 'srm-front-cuz/lib/c7nCustomize';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import ExcelExportPro from 'components/ExcelExportPro';

import { verifySupplierUpdate, batchSubmit } from '@/services/supplierWarehouseService';
import {
  queryAllApprovalData,
  ApprovalBtn,
  RevokeApprovalBtn,
  renderApproveProgress,
} from '@/routes/components/WorkFlowApproval';
import MoreButton from '@/routes/components/MoreButton';
import { getNotPermissionBtns } from '@/routes/components/utils/utils';

import HistoryChildren from './HistoryChildren';
import { renderStatus, tableMaxHeight, tableHeight } from '../components/utils';
import { getIndexDS, getHistoryRecordDS, getNewModalDS } from './stores/indexDS';
import {
  getHeaderInfoDS,
  getContactDS,
  getAddressDS,
  getBankAccountDS,
  getAttachmentDS,
  getPurchaseHeaderDS,
  getPurchaseLineDS,
} from './stores/detailDS';

const currentUserId = getCurrentUserId();
const tenantId = getCurrentOrganizationId();

let currentSearchBarRef = null;

const Index = ({
  history,
  indexDs,
  historyRecordDs,
  headerInfoDs,
  contactDs,
  addressDs,
  bankAccountDs,
  attachmentDs,
  purchaseHeaderDs,
  purchaseLineDs,
  dispatch,
  customizeForm,
  customizeTable,
  custLoading,
  getHocInstance,
  supplierWarehouseListRemote,
}) => {
  contactDs.bind(headerInfoDs, 'extSupplierContactReqs');
  addressDs.bind(headerInfoDs, 'extSupplierAddressReqs');
  bankAccountDs.bind(headerInfoDs, 'extSupBkAccountReqs');
  attachmentDs.bind(headerInfoDs, 'extSupplierAttachmentReqs');
  purchaseHeaderDs.bind(headerInfoDs, 'extSupplierPfReq');
  purchaseLineDs.bind(headerInfoDs, 'extSupplierPfLineReqs');

  let _modal;

  const [spinning, setSpinning] = useState(false);
  const [approvalInfo, setApprovalInfo] = useState({});
  const [notPermissionBtns, setNotPermissionBtns] = useState([]);

  useEffect(() => {
    indexDs.unSelectAll();
    indexDs.clearCachedSelected();
    indexDs.query(indexDs.currentPage);
    indexDs.addEventListener('load', handleDsLoadAfter);
    handleBtnPermissionBtn();
    return () => {
      indexDs.removeEventListener('load', handleDsLoadAfter);
    };
  }, []);

  const handleDsLoadAfter = (dataSetProps = {}) => {
    const { dataSet } = dataSetProps;
    const businessKeys = dataSet.filter(r => r.get('businessKey')).map(r => r.get('businessKey'));
    queryAllApprovalData({ businessKeys }).then(response => {
      if (response) {
        const { approvalDataMap, revokeDataMap, approvalHistoryMap } = response;
        setApprovalInfo({
          approvalDataMap,
          revokeDataMap,
          approvalHistoryMap,
        });
      }
    });
  };

  // 处理按钮权限集
  const handleBtnPermissionBtn = async () => {
    const codeList = [
      {
        code: 'srm.partner.my-partner.supplier-warehouse.button.list.approval',
        name: 'approval',
      },
      {
        code: 'srm.partner.my-partner.supplier-warehouse.button.list.repeal-approval',
        name: 'revokeApproval',
      },
    ];
    const notPermissionBtnList = await getNotPermissionBtns(codeList);
    if (notPermissionBtnList) {
      setNotPermissionBtns(notPermissionBtnList);
    }
  };

  // 新建
  const handleAdd = useCallback(() => {
    const newModalDS = new DataSet(getNewModalDS());
    Modal.open({
      key: Modal.key(),
      closable: true,
      movable: false,
      destroyOnClose: true,
      drawer: true,
      style: { width: 480 },
      title: intl.get('hzero.common.button.create').d('新建'),
      children: (
        <Form dataSet={newModalDS} labelLayout="float">
          <Select name="reqTypeCode" />,
          <Lov name="supplierLov" noCache />
        </Form>
      ),
      onOk: async () => {
        const validateFlag = await newModalDS.current.validate();
        const currentData = newModalDS.current.toData();
        if (validateFlag) {
          const { reqTypeCode, supplierNum, supplierId } = currentData;
          if (reqTypeCode === 'SUP_NEW_REQ') {
            dispatch(
              routerRedux.push({
                pathname: `/sslm/supplier-warehouse/create/${currentUserId}`,
              })
            );
          } else if (reqTypeCode === 'SUP_UPDATE_REQ') {
            // 先校验所选供应商在当前租户下有没有【新建、已提交、审批拒绝】（非审批通过）状态的单据
            const response = await verifySupplierUpdate({ supplierId });
            const res = getResponse(response);
            if (res) {
              // 默认返回true,当返回false时走二开逻辑不走标准逻辑
              const eventProps = {
                dataSet: newModalDS,
              };
              const result = await supplierWarehouseListRemote.event.fireEvent(
                'cuxHandleCreate',
                eventProps
              );
              if (!result) {
                return;
              }
              dispatch(
                routerRedux.push({
                  pathname: `/sslm/supplier-warehouse/create/${currentUserId}`,
                  search: querystring.stringify({
                    supplierId,
                    supplierNum,
                  }),
                })
              );
            } else {
              return false;
            }
          }
        } else {
          return false;
        }
      },
    });
  }, []);

  // 行上删除回调
  const handldLineDelete = useCallback(record => {
    indexDs.delete(record);
  }, []);

  // 列表删除回调
  const handleAllDelete = useCallback(() => {
    indexDs.delete(indexDs.selected);
  }, []);

  // 列表提交回调
  const handleSubmit = useCallback(() => {
    const selectedData = indexDs.toJSONData();
    setSpinning(true);
    batchSubmit(selectedData)
      .then(response => {
        const res = getResponse(response);
        if (res) {
          // 清空勾选
          indexDs.unSelectAll();
          indexDs.clearCachedSelected();
          notification.success();
          indexDs.query(indexDs.currentPage);
        }
      })
      .finally(() => setSpinning(false));
  }, []);

  // 查看历史单据
  const handleHistoryReq = useCallback(extSupplierReqId => {
    headerInfoDs.setQueryParameter('extSupplierReqId', extSupplierReqId);
    headerInfoDs.query();
    _modal.update({
      title: intl.get('sslm.supplierWarehouse.view.title.supplierDetails').d('供应商详情'),
      children: (
        <HistoryChildren
          headerInfoDs={headerInfoDs}
          contactDs={contactDs}
          addressDs={addressDs}
          bankAccountDs={bankAccountDs}
          attachmentDs={attachmentDs}
          purchaseHeaderDs={purchaseHeaderDs}
          purchaseLineDs={purchaseLineDs}
          customizeTable={customizeTable}
          customizeForm={customizeForm}
          custLoading={custLoading}
          extSupplierReqId={extSupplierReqId}
          getHocInstance={getHocInstance}
        />
      ),
      onOk: () => {
        _modal.open();
        return false;
      },
    });
  }, []);

  // 处理编辑
  const handleEdit = useCallback(async record => {
    const { extSupplierReqId, reqStatus, createdBy } = record.get([
      'extSupplierReqId',
      'reqStatus',
      'createdBy',
    ]);
    const eventProps = {
      record,
    };
    // 默认返回true,当返回false时走二开逻辑不走标准逻辑
    const res = await supplierWarehouseListRemote.event.fireEvent('cuxHandleJump', eventProps);
    if (!res) {
      return;
    }
    dispatch(
      routerRedux.push({
        pathname: `/sslm/supplier-warehouse/detail/${extSupplierReqId}/${reqStatus}/${createdBy}`,
      })
    );
  }, []);

  // 变更信息
  const handleChangeInfo = useCallback(async record => {
    const { data: { supplierId, supplierNum, linkId } = {} } = record;
    if (!linkId) {
      history.push({
        pathname: `/sslm/supplier-warehouse/create/${currentUserId}`,
        search: querystring.stringify({
          supplierId,
          supplierNum,
        }),
      });
    } else {
      const eventProps = {
        record,
      };
      // 默认返回true,当返回false时走二开逻辑不走标准逻辑
      const res = await supplierWarehouseListRemote.event.fireEvent('cuxHandleUpdate', eventProps);
      if (!res) {
        return;
      }
      notification.warning({
        message: intl
          .get('sslm.common.view.message.changeInfoWarning')
          .d('该供应商已在平台注册，如需修改信息请联系供应商发起信息变更'),
      });
    }
  }, []);

  // 历史记录
  const handleHistoryRecords = useCallback(record => {
    const { data: { supplierId } = {} } = record;
    historyRecordDs.setQueryParameter('supplierId', supplierId);
    historyRecordDs.query();
    const columns = [
      {
        name: 'reqNumber',
        renderer: ({ value, record: historyRecord }) => {
          const {
            data: { extSupplierReqId },
          } = historyRecord;
          return <a onClick={() => handleHistoryReq(extSupplierReqId)}>{value}</a>;
        },
      },
      {
        name: 'creator',
      },
      {
        name: 'lastUpdateDate',
      },
    ];
    _modal = Modal.open({
      drawer: true,
      okCancel: false,
      key: Modal.key(),
      style: { width: 800 },
      title: intl.get('sslm.supplierWarehouse.view.title.historyRecords').d('历史记录'),
      children: <Table dataSet={historyRecordDs} columns={columns} />,
      okText: intl.get('hzero.common.button.close').d('关闭'),
    });
  }, []);

  // 跳转我的合作伙伴
  const handleJumpPage = useCallback(() => {
    dispatch(
      routerRedux.push({
        pathname: `/spfm/partner-list/supplier`,
        search: querystring.stringify({
          activeKey: 'erp',
        }),
      })
    );
  }, []);

  // 绑定筛选器的ref
  const onSearchBarRef = useCallback(ref => {
    currentSearchBarRef = ref;
  }, []);

  // 获取导出参数
  const getExportParams = useCallback(() => {
    const queryParams = currentSearchBarRef.getQueryParameter();
    return filterNullValueObject(queryParams);
  }, [currentSearchBarRef]);

  // 操作按钮集合
  const OperationButtons = observer(props => {
    const isDisabled = isEmpty(props.dataSet.selected);
    return (
      <Fragment>
        <Button
          type="primary"
          icon="add"
          color="primary"
          onClick={handleAdd}
          loading={spinning}
          wait={500}
          waitType="throttle"
        >
          {intl.get('hzero.common.button.create').d('新建')}
        </Button>
        <Button
          icon="delete"
          disabled={isDisabled}
          funcType="flat"
          onClick={handleAllDelete}
          loading={spinning}
          wait={500}
          waitType="throttle"
        >
          {intl.get('hzero.common.button.delete').d('删除')}
        </Button>
        <Button
          icon="check"
          disabled={isDisabled}
          funcType="flat"
          onClick={handleSubmit}
          loading={spinning}
          wait={500}
          waitType="throttle"
        >
          {intl.get('hzero.common.button.submit').d('提交')}
        </Button>
        <PermissionButton
          icon="supervisor_account"
          type="c7n-pro"
          funcType="flat"
          onClick={handleJumpPage}
          permissionList={[
            {
              code: 'srm.partner.my-partner.supplier-warehouse.ps.button.my-partner',
              type: 'button',
              meaning: '本地供应商-导入',
            },
          ]}
        >
          {intl.get('sslm.supplierWarehouse.view.warehous.myPartner').d('我的合作伙伴')}
        </PermissionButton>
        <ExcelExportPro
          data-name="exportPro"
          templateCode="SRM_C_SRM_SSLM_EXTERNAL_SUPPLIER_REQ_LIST_EXPORT"
          requestUrl={`${SRM_SSLM}/v1/${tenantId}/external-supplier-reqs/export`}
          queryParams={() => getExportParams()}
          otherButtonProps={{
            funcType: 'flat',
            type: 'c7n-pro',
            permissionList: [
              {
                code: 'srm.partner.my-partner.supplier-warehouse.button.external.supplier.export',
                type: 'button',
                meaning: '本地供应商-导入',
              },
            ],
          }}
          buttonText={intl.get('hzero.common.button.newExport').d('(新)导出')}
        />
        <CommonImport
          refreshButton
          prefixPatch={SRM_SSLM}
          buttonText={intl.get('hzero.common.button.newImport').d('(新)导入')}
          businessObjectTemplateCode="SRM_C_SRM_SSLM_EXTERNAL_SUPPLIER_REQ_BATCH_IMPORT"
          buttonProps={{
            funcType: 'flat',
            permissionList: [
              {
                code: 'srm.partner.my-partner.supplier-warehouse.button.external.supplier.import',
                type: 'button',
                meaning: '本地供应商-导入',
              },
            ],
          }}
        />
      </Fragment>
    );
  });

  // 操作按钮
  const getButtons = ({ record, dataSet } = {}) => {
    if (!record) {
      return [];
    }
    const { reqStatus, createdBy, businessKey, historyReqCount } =
      record.get(['reqStatus', 'createdBy', 'businessKey', 'historyReqCount']) || {};
    const showEditAndDeleteFlag =
      ['NEW', 'REJECTED'].includes(reqStatus) && currentUserId === createdBy;
    const showUpdateAndHistoryRecordsFlag = ['APPROVED'].includes(reqStatus);
    const { approvalDataMap, revokeDataMap } = approvalInfo || {};
    // 审批按钮
    const approvalBtnProps = approvalDataMap ? approvalDataMap[businessKey] : {};
    // 撤销审批按钮
    const revokeBtnProps = revokeDataMap ? revokeDataMap[businessKey] : {};
    return [
      {
        name: 'edit',
        hidden: !showEditAndDeleteFlag,
        child: intl.get('hzero.common.button.edit').d('编辑'),
        onClick: () => handleEdit(record),
      },
      {
        name: 'delete',
        hidden: !showEditAndDeleteFlag,
        child: intl.get('hzero.common.button.delete').d('删除'),
        onClick: () => handldLineDelete(record),
      },
      {
        name: 'changeInfo',
        hidden: !showUpdateAndHistoryRecordsFlag,
        child: intl.get('sslm.supplierWarehouse.view.btn.changeInfo').d('变更信息'),
        onClick: () => handleChangeInfo(record),
      },
      {
        name: 'historyRecord',
        hidden: !historyReqCount,
        child: intl.get('sslm.supplierWarehouse.view.btn.historyRecords').d('历史记录'),
        onClick: () => handleHistoryRecords(record),
      },
      {
        name: 'approval',
        hidden: isEmpty(approvalBtnProps) || notPermissionBtns.includes('approval'),
        btnComp: <ApprovalBtn />,
        approveProps: {
          ...approvalBtnProps,
          onSuccess: () => dataSet.query(),
        },
        showIcon: false,
      },
      {
        name: 'revokeApproval',
        hidden: isEmpty(revokeBtnProps) || notPermissionBtns.includes('revokeApproval'),
        btnComp: <RevokeApprovalBtn />,
        showIcon: false,
        approveProps: {
          businessKey,
          onSuccess: () => dataSet.query(),
        },
      },
    ].filter(i => !i.hidden);
  };

  // 列表Columns
  const listColumns = [
    {
      name: 'reqStatusMeaning',
      width: 120,
      renderer: renderStatus,
    },
    {
      name: 'operating',
      width: 160,
      renderer: ({ record, dataSet }) => {
        const buttons = getButtons({ record, dataSet });
        return isEmpty(buttons) ? '-' : <MoreButton buttons={buttons} />;
      },
    },
    {
      name: 'reqNumber',
      width: 170,
      renderer: ({ value, record }) => <a onClick={() => handleEdit(record)}>{value}</a>,
    },
    {
      name: 'reqTypeCodeMeaning',
      width: 140,
    },
    {
      name: 'supplierName',
      tooltip: 'overflow',
    },
    {
      name: 'creator',
      width: 120,
      tooltip: 'overflow',
    },
    {
      name: 'creationDate',
      width: 180,
    },
    {
      name: 'approvalProgress',
      width: 160,
      title: intl.get('sslm.common.view.title.approvalProgress').d('审批进度'),
      renderer: ({ record }) => {
        const { approvalHistoryMap } = approvalInfo || {};
        return renderApproveProgress({ approvalHistoryMap, record });
      },
    },
  ];

  return (
    <Fragment>
      <Spin spinning={spinning}>
        <Header
          title={intl
            .get('sslm.supplierWarehouse.view.title.simpleSupplierWarehouse')
            .d('简易供应商入库')}
        >
          <OperationButtons dataSet={indexDs} />
        </Header>
        <Content>
          <div style={{ height: tableHeight.fixedHeight }}>
            {customizeTable(
              {
                code: 'SSLM.EASY_SUPPLIER_WAREHOUSE.LIST',
              },
              <SearchBarTable
                cacheState
                columns={listColumns}
                custLoading={custLoading}
                dataSet={indexDs}
                style={{ maxHeight: tableMaxHeight.fixedHeight }}
                searchBarRef={onSearchBarRef}
                searchCode="SSLM.EASY_SUPPLIER_WAREHOUSE.SEARCH_BAR"
                searchBarConfig={{
                  editorProps: {
                    reqStatus: {
                      optionsFilter: options => !['WITHDRAW'].includes(options.get('value')),
                    },
                  },
                }}
              />
            )}
          </div>
        </Content>
      </Spin>
    </Fragment>
  );
};

export default compose(
  formatterCollections({
    code: [
      'sslm.supplierWarehouse',
      'sslm.common',
      'sslm.supplierInform',
      'spfm.importErp',
      'spfm.bank',
    ],
  }),
  WithCustomize({
    unitCode: [
      'SSLM.EASY_SUPPLIER_WAREHOUSE.BASIC_INFO',
      'SSLM.EASY_SUPPLIER_WAREHOUSE.LIST',
      'SSLM.EASY_SUPPLIER_WAREHOUSE.SEARCH_BAR',
      'SSLM.EASY_SUPPLIER_WAREHOUSE.CONTACT_INFO',
      'SSLM.EASY_SUPPLIER_WAREHOUSE.BANK_ACCOUNT',
      'SSLM.EASY_SUPPLIER_WAREHOUSE.ATTACHMENT',
      'SSLM.EASY_SUPPLIER_WAREHOUSE.ADDRESS_INFO',
      'SSLM.EASY_SUPPLIER_WAREHOUSE.PURCHASE_HEADER',
      'SSLM.EASY_SUPPLIER_WAREHOUSE.PURCHASE_LINE',
      'SSLM.EASY_SUPPLIER_WAREHOUSE.CARDS',
    ],
  }),
  withProps(
    () => {
      const indexDs = new DataSet(getIndexDS());
      const historyRecordDs = new DataSet(getHistoryRecordDS());
      const headerInfoDs = new DataSet(
        getHeaderInfoDS({
          isEdit: false,
          customizeUnitCode: 'SSLM.EASY_SUPPLIER_WAREHOUSE.BASIC_INFO',
        })
      );
      const contactDs = new DataSet(
        getContactDS({
          isEdit: false,
          customizeUnitCode: 'SSLM.EASY_SUPPLIER_WAREHOUSE.CONTACT_INFO',
        })
      );
      const addressDs = new DataSet(
        getAddressDS({
          isEdit: false,
          customizeUnitCode: 'SSLM.EASY_SUPPLIER_WAREHOUSE.ADDRESS_INFO',
        })
      );
      const bankAccountDs = new DataSet(
        getBankAccountDS({
          isEdit: false,
          customizeUnitCode: 'SSLM.EASY_SUPPLIER_WAREHOUSE.BANK_ACCOUNT',
        })
      );
      const attachmentDs = new DataSet(
        getAttachmentDS({
          isEdit: false,
          customizeUnitCode: 'SSLM.EASY_SUPPLIER_WAREHOUSE.ATTACHMENT',
        })
      );
      const purchaseHeaderDs = new DataSet(
        getPurchaseHeaderDS({ customizeUnitCode: 'SSLM.EASY_SUPPLIER_WAREHOUSE.PURCHASE_HEADER' })
      );
      const purchaseLineDs = new DataSet(
        getPurchaseLineDS({
          isEdit: false,
          customizeUnitCode: 'SSLM.EASY_SUPPLIER_WAREHOUSE.PURCHASE_LINE',
        })
      );
      return {
        indexDs,
        historyRecordDs,
        headerInfoDs,
        contactDs,
        addressDs,
        bankAccountDs,
        attachmentDs,
        purchaseHeaderDs,
        purchaseLineDs,
      };
    },
    { cacheState: true, keepOriginDataSet: true }
  ),
  remote(
    {
      code: 'SSLM_SUPPLIER_WAREHOUSE_LIST',
      name: 'supplierWarehouseListRemote',
    },
    {
      events: {
        cuxHandleUpdate() {}, // 二开变更信息
        cuxHandleCreate() {}, // 二开新建单据信息
        cuxHandleJump() {}, // 二开跳转
      },
    }
  )
)(Index);
