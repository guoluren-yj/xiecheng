import React, { Fragment, useMemo, useContext, useCallback } from 'react';
import {
  DataSet,
  Table,
  Select,
  TextField,
  // Lov,
  Button,
  Modal,
  NumberField,
  Output,
  Attachment,
  Icon,
  Tooltip,
} from 'choerodon-ui/pro';
import { observer } from 'mobx-react';
import querystring from 'querystring';
import { isEmpty } from 'lodash';

import CollapseForm from '_components/CollapseForm';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import { SRM_SSRC, PUBLIC_BUCKET } from '_utils/config';
import CommonImport from 'hzero-front-himp/lib/components/CommonImport';
import CommonImportNew from 'hzero-front/lib/components/Import';
import SupplierLov from 'srm-front-boot/lib/components/SupplierLov';
import IntroducingSuppliers from '@/routes/ssrc/components/IntroducingSupplier';
import { openTab } from 'utils/menuTab';
import { TooltipButtonPro } from '@/routes/components/TooltipButton';
import { fetchSourceRFSupplierRelativeConfig } from '@/services/inquiryHallNewService';

import { FIlESIZE, ChunkUploadProps } from '@/utils/SsrcRegx';
import Store from '../store/index';

const organizationId = getCurrentOrganizationId();
// const userId = getCurrentUserId();

export default observer(function InviteRangeCard(props) {
  const {
    routerParams: { rfHeaderId, sourceCategory },
    commonDs: { basicFormDs, supplierTableDs, noticeDs, ruleFormDs },
    ref: { inviteRangeRef },
    remote,
    history,
    customizeCollapseForm,
    customizeTable,
  } = useContext(Store);

  const { allOpenSelectable, sslmLifeCycleFlag } = props;
  const { current } = basicFormDs;
  const bulkAddSupplierLovDs = useMemo(
    () =>
      new DataSet({
        autoCreate: true,
        fields: [
          {
            name: 'supplierLov',
            type: 'object',
            lovCode: 'SSLM.SUPPLIER', // 固定值, 不可更改
            multiple: true,
          },
        ],
      }),
    [supplierTableDs, basicFormDs]
  );
  // 跳转供应商生命周期管理
  const jumpSupplierLifeManagerDetail = useCallback(
    (record) => {
      const {
        location: { pathname = null, search },
      } = history || {};
      const recordData = record.toData() || {};
      const companyId = basicFormDs?.current?.get('companyId');
      const {
        tenantId,
        partnerCompanyId,
        partnerTenantId,
        spfmSupplierCompanyId,
        spfmCompanyId,
        supplierCompanyId,
      } = recordData;
      if (
        !companyId ||
        !partnerCompanyId ||
        !partnerTenantId ||
        !spfmSupplierCompanyId ||
        !supplierCompanyId
      ) {
        return;
      }
      const params = {
        tenantId,
        companyId,
        partnerCompanyId,
        partnerTenantId,
        spfmPartnerCompanyId: spfmSupplierCompanyId,
        spfmCompanyId,
        supplierCompanyId,
      };
      const searchParams = querystring.stringify(params);
      if (sslmLifeCycleFlag) {
        history.push({
          pathname: '/sslm/supplier-detail-new',
          search: searchParams,
          state: {
            historyBack: pathname + search,
            ...params,
          },
        });
      } else {
        history.push({
          pathname: '/sslm/include/supplier-manager/supplier-detail',
          search: searchParams,
          state: {
            historyBack: pathname + search,
            ...params,
          },
        });
      }
    },
    [sslmLifeCycleFlag]
  );
  /**
   * 批量导入
   */
  const handleBatchExport = () => {
    const Props = {
      code: 'SSRC.RF_LINE_SUPPLIER',
      organizationId,
      prefixPatch: SRM_SSRC,
      args: JSON.stringify({
        tenantId: organizationId,
        organizationId,
        rfHeaderId,
        templateCode: 'SSRC.RF_LINE_SUPPLIER',
        companyId: basicFormDs?.current?.get('companyId'),
      }),
      autoRefreshInterval: 5000,
      backPath: undefined,
      tenantId: organizationId,
      action: 'hzero.common.title.batchImport',
      key: '/ssrc/inquiry-hall/rfx-update/comment-import/SSRC.RF_LINE_SUPPLIER',
    };

    Modal.open({
      destroyOnClose: true,
      closable: true,
      key: Modal.key(),
      title: intl.get(`ssrc.rf.view.message.tab.vendorList`).d('供应商列表'),
      children: <CommonImport {...Props} />,
      style: { width: '80%' },
      onOk: () => supplierTableDs.query(),
    });
  };

  const formatListToString = (list = null) => {
    if (isEmpty(list)) {
      return null;
    }

    return list.join(',');
  };

  const fetchSourceSupplierRelativeConfigData = async () => {
    if (!rfHeaderId) {
      return;
    }

    const params = {
      organizationId,
      sourceHeaderId: rfHeaderId,
      sourceFrom: 'RF',
      sourceCategory,
    };
    let result = {};
    try {
      result = await fetchSourceRFSupplierRelativeConfig(params);
      result = getResponse(result);
      if (!result) {
        return;
      }

      const {
        reviewStatusList = [],
        existSuppliers = [],
        itemCategoryIds = [],
        sourceCode = null,
        stageAllMismatchFlag = '',
        stageIdList = [],
      } = result;
      if (stageAllMismatchFlag === 1) {
        notification.warning({
          message:
            sourceCategory === 'RFI'
              ? intl
                  .get(`ssrc.inquiryHall.model.inquiryHall.batchAddRFISupplierMsg`)
                  .d(
                    '操作失败，失败原因是业务规则定义"可参与信息征询供应商设置"导致没有供应商可参与，请检查'
                  )
              : intl
                  .get(`ssrc.inquiryHall.model.inquiryHall.batchAddRFPSupplierMsg`)
                  .d(
                    '操作失败，失败原因是业务规则定义"可参与方案征询供应商设置"导致没有供应商可参与，请检查'
                  ),
        });
      }

      const supplierTableIds = supplierTableDs?.created?.map((item) => item.toData()) || [];

      const existSupplierIds = existSuppliers.concat(supplierTableIds);

      const quotationType = ruleFormDs?.current?.get('replyType') || null;

      result = {
        defaultQueryItemCategoryIds: formatListToString(itemCategoryIds),
        supplyReviewStatus: formatListToString(reviewStatusList),
        sourceCode,
        erpFlag: quotationType === 'ONLINE' ? 0 : null,
        stageIdList,
        excludeSupplierDetailDTOS: existSupplierIds, // 维护，过程控制-反选供应商，线下正选供应商
      };
    } catch (e) {
      throw e;
    }

    return result || {};
  };

  // 批量添加供应商确定
  const handleOkSupplier = async () => {
    const { selected } = bulkAddSupplierLovDs.current?.getField('supplierLov')?.options;
    if (isEmpty(selected)) {
      notification.warning({
        message: intl.get('ssrc.rf.view.notification.atLeastSingle').d('至少勾选一条数据'),
      });
      return false;
    }
    if (remote?.event) {
      const remoteFlag = await remote.event.fireEvent('remoteHandleOkSupplier', {
        selected,
        sourceCategory,
        bulkAddSupplierLovDs,
      });
      if (!remoteFlag) return false;
    }
    // 创建
    selected.forEach((i, index) => {
      const data = {
        ...i.toData(),
        supplierCompanyName: i.get('supplierCompanyName') || i.get('supplierName'),
        supplierCompanyNum: i.get('supplierCompanyNum') || i.get('supplierNum'),
        contactName: i.get('name'),
        contactPhone: i.get('mobilephone'),
        contactMail: i.get('mail'),
        stageDescription: i.get('stageName'),
      };
      supplierTableDs.create(data, index);
    });
    bulkAddSupplierLovDs.loadData([]);
  };

  const handleDeleteItem = () => {
    const data = supplierTableDs.selected;
    supplierTableDs.delete(data, {
      title: intl.get('ssrc.common.message.tip').d('提示'),
      children: intl
        .get('hzero.c7nProUI.DataSet.delete_selected_row_confirm')
        .d('确认删除选中行？'),
    });
  };

  const addSupplier = () => {
    const selectList = introSupplier?.tableDS?.selected;
    if (isEmpty(selectList)) {
      notification.warning({
        message: intl.get('ssrc.rf.view.notification.atLeastSingle').d('至少勾选一条数据'),
      });
      return false;
    }
    const selected = selectList.map((item) => item.toData()?.supplierDTOList).flat();
    // 创建
    selected.forEach((data, index) => {
      supplierTableDs.create(data, index);
    });
  };

  let introSupplier = {};

  const sourceProjectId = basicFormDs?.current?.get('sourceProjectId');

  const getIntroSupplier = (ref) => {
    introSupplier = ref || {};
  };

  const introducingSuppliers = () => {
    const modalKey = Modal.key();
    Modal.open({
      destroyOnClose: true,
      closable: true,
      key: modalKey,
      title: intl.get('ssrc.inquiryHall.view.message.button.introducingSuppliers').d('引入供应商'),
      children: (
        <IntroducingSuppliers
          onRef={getIntroSupplier}
          sourceProjectId={sourceProjectId}
          targetSourceCategory="RFP"
          companyId={basicFormDs?.current?.get('companyId')}
        />
      ),
      style: { width: '1000px' },
      onOk: addSupplier,
      drawer: true,
    });
  };

  // 招标公告预览
  const previewNotice = () => {
    const noticeId = noticeDs?.current?.get('noticeId');

    if (!rfHeaderId || !noticeId) {
      notification.warning({
        message: intl
          .get('ssrc.rf.view.warning.saveRfAndNoticeToPreview')
          .d('请先保存征询单和公告信息'),
      });
      return;
    }

    openTab({
      key: `/ssrc/new-inquiry-hall/tender-bid-notice-preview/${sourceCategory}/${basicFormDs?.current?.get(
        'tenantId'
      )}/${rfHeaderId}`,
      path: `/ssrc/new-inquiry-hall/tender-bid-notice-preview/${sourceCategory}/${basicFormDs?.current?.get(
        'tenantId'
      )}/${rfHeaderId}`,
      title: 'srm.common.tab.title.ssrc.tenderNotice',
      action: 'ssrc.rf.view.title.tenderBidNotice',
      closable: true,
    });
  };

  const columns = useMemo(
    () => [
      {
        name: 'supplierCompanyNum',
        width: 150,
        renderer: ({ record, text }) => {
          const companyId = basicFormDs?.current?.get('companyId');
          const {
            partnerCompanyId,
            partnerTenantId,
            spfmSupplierCompanyId,
            supplierCompanyId,
          } = record.get([
            'partnerCompanyId',
            'partnerTenantId',
            'spfmSupplierCompanyId',
            'supplierCompanyId',
          ]);
          return record.status === 'add' ||
            !companyId ||
            !partnerCompanyId ||
            !partnerTenantId ||
            !spfmSupplierCompanyId ||
            !supplierCompanyId ? (
            text
          ) : (
            <a onClick={() => jumpSupplierLifeManagerDetail(record)}>{text}</a>
          );
        },
      },
      {
        name: 'supplierCompanyName',
      },
      {
        name: 'stageDescription',
        width: 120,
        renderer: ({ record, text }) => {
          const stageMismatchCnfFlag = record?.get('stageMismatchCnfFlag');
          return text ? (
            <Tooltip
              title={
                stageMismatchCnfFlag
                  ? intl
                      .get(`ssrc.inquiryHall.model.inquiryHall.supplierNotQuotation`)
                      .d('该供应商当前所在的生命周期阶段不可进行报价')
                  : ''
              }
            >
              <div style={{ color: stageMismatchCnfFlag ? 'red' : 'black' }}>{text}</div>
            </Tooltip>
          ) : null;
        },
      },
      {
        name: 'contactNameLov',
        width: 180,
        editor: true,
      },
      {
        name: 'contactPhone',
        width: 300,
        editor: true,
      },
      {
        name: 'contactMail',
        width: 200,
        editor: true,
      },
    ],
    [basicFormDs?.current, sslmLifeCycleFlag]
  );

  const buttons = useMemo(
    () => [
      <SupplierLov
        dataSet={bulkAddSupplierLovDs}
        name="supplierLov"
        mode="button"
        clearButton={false}
        icon="playlist_add"
        placeholder={intl.get('ssrc.rf.model.rf.button.addSupplier').d('新增供应商')}
        modalProps={{
          style: { maxWidth: '1500px', width: '1000px' },
          onOk: handleOkSupplier,
          onCancel: () => {
            bulkAddSupplierLovDs.loadData([]);
          },
        }}
        beforeQuery={fetchSourceSupplierRelativeConfigData}
        queryData={{ companyId: basicFormDs?.current?.get('companyId') }}
      >
        {intl.get('ssrc.rf.model.rf.button.addSupplier').d('新增供应商')}
      </SupplierLov>,
      // ['delete', { onClick: () => handleDeleteItem(), name: 'delete' }],
      <TooltipButtonPro
        name="delete"
        icon="delete_sweep"
        disabled={isEmpty(supplierTableDs.selected)}
        onClick={() => handleDeleteItem()}
        help={intl.get('ssrc.common.view.message.supplier-line.select.tip').d('请先勾选供应商行')}
      >
        {intl.get(`hzero.common.button.batchDelete`).d('批量删除')}
      </TooltipButtonPro>,
      ['save', { name: 'save' }],
      <Button onClick={handleBatchExport} icon="archive" name="supplierImport">
        {intl.get(`ssrc.inquiryHall.view.button.import`).d('导入')}
      </Button>,
      <CommonImportNew
        businessObjectTemplateCode="SSRC.RF_LINE_SUPPLIER"
        prefixPatch={SRM_SSRC}
        args={{
          tenantId: organizationId,
          organizationId,
          rfHeaderId,
          templateCode: 'SSRC.RF_LINE_SUPPLIER',
          companyId: basicFormDs?.current?.get('companyId'),
        }}
        buttonText={intl.get(`ssrc.inquiryHall.view.button.import`).d('导入')}
        buttonProps={{
          icon: 'archive',
          funcType: 'flat',
          color: 'primary',
          permissionList: [
            {
              code: `ssrc.new-inquiry-hall.rf-update.button.supplier-import-new`,
              type: 'button',
              meaning:
                intl.get(`ssrc.inquiryHall.view.message.title.inquiryHall`).d('询价工作台') -
                intl.get(`ssrc.inquiryHall.view.button.import`).d('导入'),
            },
          ],
        }}
        tenantId={organizationId}
        autoRefreshInterval={5000}
        successCallBack={() => supplierTableDs.query()}
        name="supplierImportNew"
      />,
      basicFormDs?.current?.get('sourceProjectId') && (
        <Button onClick={introducingSuppliers} icon="root" name="introducingSuppliers">
          {intl.get('ssrc.inquiryHall.view.message.button.introducingSuppliers').d('引入供应商')}
        </Button>
      ),
    ],
    [
      basicFormDs?.current?.get('sourceFrom'),
      basicFormDs?.current?.get('companyId'),
      supplierTableDs?.selected,
    ]
  );

  // 过滤下拉框选项
  const handleOptionsFilter = useCallback(
    (record) => {
      return record.get('value') !== 'ALL_OPEN' || allOpenSelectable;
    },
    [allOpenSelectable]
  );

  return (
    <Fragment>
      {customizeCollapseForm(
        {
          code: `SSRC.INQUIRY_HALL.RF_EDIT.INVITE_RANGE_${sourceCategory}`,
          dataSet: basicFormDs,
        },
        <CollapseForm
          dataSet={basicFormDs}
          columns={3}
          labelLayout="float"
          formRef={(ref) => {
            inviteRangeRef.current = ref;
          }}
          useWidthPercent
        >
          <Select
            name="sourceMethod"
            clearButton={false}
            optionsFilter={handleOptionsFilter}
            showHelp="tooltip"
          />
          <TextField name="allowSourceSupplierStages" />
        </CollapseForm>
      )}
      {current?.get('sourceMethod') === 'INVITE' &&
        customizeTable(
          {
            code: `SSRC.INQUIRY_HALL.RF_EDIT.LINE_SUPPLIER_${sourceCategory}`,
            buttonCode: `SSRC.INQUIRY_HALL.RF_EDIT.INVITE_HEADER_BUTTONS_${sourceCategory}`,
          },
          <Table
            dataSet={supplierTableDs}
            columns={columns}
            buttons={buttons}
            style={{ marginTop: '16px' }}
          />
        )}
      {(current?.get('sourceMethod') === 'OPEN' || current?.get('sourceMethod') === 'ALL_OPEN') &&
        customizeCollapseForm(
          {
            code: `SSRC.INQUIRY_HALL.RF_EDIT.NOTICES_${sourceCategory}`,
            dataSet: noticeDs,
          },
          <CollapseForm
            dataSet={noticeDs}
            columns={3}
            labelLayout="float"
            useWidthPercent
            style={{ marginTop: '16px' }}
          >
            <TextField name="noticeTitle" clearButton={false} />
            <NumberField name="noticeDays" />
            <Attachment
              name="noticeAttachmentUuid"
              fileSize={FIlESIZE}
              label={intl.get(`ssrc.rf.model.rf.noticeAttachment`).d('公告附件')}
              bucketName={PUBLIC_BUCKET}
              bucketDirectory="ssrc-rf-tender-notice"
              style={{ paddingLeft: '10px' }}
              newLine
              {...ChunkUploadProps}
            />
            <Output
              name="noticePreview"
              renderer={() => (
                <a onClick={previewNotice}>
                  <Icon type="find_in_page" style={{ paddingRight: '3px', fontSize: 14 }} />
                  {intl.get('ssrc.inquiryHall.model.inquiryHall.noticePreview').d('公告预览')}
                </a>
              )}
            />
          </CollapseForm>
        )}
    </Fragment>
  );
});
