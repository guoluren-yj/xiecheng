/*
 * @Descripttion: 寻源过程控制--征询范围
 * @version:
 * @Author: yiping.liu<yiping.liu@going-link.com>
 * @Date: 2021-07-21 16:25:06
 * @LastEditors: Please set LastEditors
 */
import React, { useContext, useMemo } from 'react';
import { Table, Modal, Select, TextField, Tooltip } from 'choerodon-ui/pro';
import { Popover } from 'choerodon-ui';
import intl from 'utils/intl';
import { isEmpty } from 'lodash';
import querystring from 'querystring';
import { observer } from 'mobx-react';
import notification from 'utils/notification';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import SupplierLov from 'srm-front-boot/lib/components/SupplierLov';

import { TooltipButtonPro } from '@/routes/components/TooltipButton';
import {
  getSupExpirAttachment,
  batchAdd,
  fetchSourceRFSupplierRelativeConfig,
} from '@/services/inquiryHallNewService';
import Store from '../store';
import SupplierBatchAddExpiredModal from './SupplierBatchAddExpiredModal';
import { historyDiffRenderComp } from '../utils';
import styles from './index.less';

const organizationId = getCurrentOrganizationId();

const InquiryScope = (props) => {
  const { header } = props;
  const {
    remote,
    history,
    customizeTable,
    commonDs: { inquiryScopeDs, batchAddSupplierLovDs, supplierBulkExpiredModalDs, basicFormDs },
  } = useContext(Store);

  const formatListToString = (list = null) => {
    if (isEmpty(list)) {
      return null;
    }

    return list.join(',');
  };

  /**
   * @description: 供应商数据源
   * @param {*}
   */
  const fetchSourceSupplierRelativeConfigData = async () => {
    const {
      adjustRecordId,
      rfHeaderBaseInfoAdjustDTO: { rfHeaderId, sourceCategory },
    } = header;
    if (!rfHeaderId) {
      return;
    }

    const params = {
      organizationId,
      sourceHeaderId: rfHeaderId,
      sourceFrom: 'RF_ADJUST',
      sourceCategory,
      adjustRecordId,
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
        erpFlag = '',
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

      result = {
        defaultQueryItemCategoryIds: formatListToString(itemCategoryIds),
        supplyReviewStatus: formatListToString(reviewStatusList),
        sourceCode,
        erpFlag,
        stageIdList,
        excludeSupplierDetailDTOS: existSuppliers, // 维护，过程控制-反选供应商，线下正选供应商
      };
    } catch (e) {
      throw e;
    }

    return result || {};
  };

  // 关闭批量添加供应商
  const handleAddSupplierClose = () => {
    batchAddSupplierLovDs.clearCachedSelected();
    batchAddSupplierLovDs.unSelectAll();
    batchAddSupplierLovDs.reset();
  };

  // 供应商数据到期铺平处理
  const renderDataSource = (dataSource) => {
    const arrayItem = [];
    const attachmentsItem = dataSource.map((item) => {
      const { expirAttachmentsDtos = [], ...otherItem } = item;
      if (expirAttachmentsDtos && expirAttachmentsDtos.length) {
        const attachmentsElement = expirAttachmentsDtos.map((element, index) => {
          return {
            index,
            ...otherItem,
            ...element,
          };
        });
        return attachmentsElement;
      } else {
        return otherItem;
      }
    });
    attachmentsItem.forEach((item) => {
      if (Array.isArray(item)) {
        arrayItem.push(...item);
      } else {
        arrayItem.push(item);
      }
    });
    return arrayItem;
  };

  /**
   * @description: 批量添加供应商
   * @param {*}
   */
  const handleAddSupplier = async () => {
    const { selected } = batchAddSupplierLovDs.current?.getField('supplierLov')?.options;
    const {
      rfHeaderBaseInfoAdjustDTO: {
        rfHeaderId,
        companyId,
        rfHeaderAdjustId,
        sourceCategory,
        adjustRecordId,
      },
    } = header;
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
      });
      if (!remoteFlag) return false;
    }
    const selectLines = selected.map((select) => select.toJSONData());
    const newParams = selectLines.map((item) => {
      const { mail, mobilephone, name } = item || {};
      return {
        ...item,
        rfHeaderId,
        adjustRecordId,
        tenantId: organizationId,
        contactMail: mail,
        sourceFrom: sourceCategory,
        contactPhone: mobilephone,
        contactName: name,
      };
    });

    const params = {
      sourceLineSupplierDTOS: newParams,
      organizationId,
      companyId,
      rfHeaderId,
      adjustRecordId,
      rfHeaderAdjustId,
    };

    try {
      // 供应商校验
      const res = await getSupExpirAttachment(params);
      if (res && !res.failed) {
        batchAddSupplierLovDs.loadData([]);
        const supplierAttachments = res.filter((item) => item.expirAttachmentsDtosLen);
        // 供应商资质到期提醒
        if (!isEmpty(supplierAttachments)) {
          handleAddSupplierClose();
          const flatData = renderDataSource(res);
          setTimeout(() => {
            openSupplierQualification(flatData);
          }, 600);
          return;
        }
        inquiryScopeDs.query();
      } else {
        notification.warning({
          description: res.message,
        });
        return false;
      }
    } catch (e) {
      throw e;
    }
  };

  // 供应商存在资质过期时
  const openSupplierQualification = (data = []) => {
    const modalKey = Modal.key();
    supplierBulkExpiredModalDs.loadData(data);
    supplierBulkExpiredModalDs.selectAll();

    const modalProps = {
      organizationId,
      supplierBulkExpiredModalDs,
    };

    return new Promise(() =>
      Modal.open({
        key: modalKey,
        title: intl
          .get(`ssrc.inquiryHall.view.message.title.supplierQualification`)
          .d('供应商资质到期提醒'),
        children: <SupplierBatchAddExpiredModal {...modalProps} />,
        style: { width: '800px' },
        onOk: () => handleAddExpires(data),
        onCancel: () => handleClose(),
      })
    );
  };

  // 到期提醒弹框关闭
  const handleClose = () => {
    supplierBulkExpiredModalDs.reset();
  };

  // 资质提醒弹框确定
  const handleAddExpires = async (data) => {
    const {
      companyId,
      adjustRecordId,
      rfHeaderBaseInfoAdjustDTO: { rfHeaderAdjustId, rfHeaderId },
    } = header;
    const selectedRows = supplierBulkExpiredModalDs.toJSONData();
    let newParams = [];

    const companyArray = [...new Set(selectedRows.map((item) => item.companyId))];
    companyArray.forEach((companyItemId) => {
      const supplierQualificationList = data.filter(
        (element) => element.companyId === companyItemId
      );
      const newSupplierQualificationList = supplierQualificationList.map((supplierItem) => {
        return {
          ...supplierItem,
          rfHeaderId,
          adjustRecordId,
          tenantId: organizationId,
          contactMail: supplierItem.mail,
          contactMobilephone: supplierItem.mobilephone,
        };
      });
      newParams = [...newParams, ...newSupplierQualificationList];
    });

    try {
      const result = await batchAdd({
        sourceLineSupplierDTOS: newParams,
        organizationId,
        companyId,
        rfHeaderId,
        adjustRecordId,
        rfHeaderAdjustId,
      });
      if (result && !result.failed) {
        inquiryScopeDs.query();
        return true;
      }
      notification.warning({
        message: result.message,
      });
    } catch (e) {
      throw e;
    }
  };

  // 不可编辑列渲染
  const NotEditRender = ({ record, name }) => {
    return <Popover content={record.get(name)}>{record.get(name)}</Popover>;
  };

  // 跳转供应商生命周期管理
  const jumpSupplierLifeManagerDetail = (record) => {
    const {
      location: { pathname = null, search },
    } = history || {};
    const recordData = record.toData() || {};
    const companyId = header?.rfHeaderBaseInfoAdjustDTO?.companyId;
    const { sslmLifeCycleFlag } = props;
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
  };

  const columns = useMemo(
    () => [
      {
        name: 'supplierCompanyNum',
        width: 150,
        renderer: ({ record }) => (
          <Popover content={record.get('supplierCompanyNum')}>
            <a onClick={() => jumpSupplierLifeManagerDetail(record)}>
              {record.get('supplierCompanyNum')}
            </a>
          </Popover>
        ),
      },
      {
        name: 'supplierCompanyName',
        width: 200,
        renderer: ({ record }) =>
          record.get('addFlag') === 1 ? (
            <span style={{ color: 'red' }}>
              <NotEditRender record={record} name="supplierCompanyName" />
            </span>
          ) : (
            <NotEditRender record={record} name="supplierCompanyName" />
          ),
      },
      {
        name: 'stageDescription',
        renderer: ({ record, text }) => {
          const stageMismatchCnfFlag = record?.get('stageMismatchCnfFlag');
          const addFlag = record?.get('addFlag');
          return (
            <Tooltip
              title={
                stageMismatchCnfFlag
                  ? intl
                      .get(`ssrc.inquiryHall.model.inquiryHall.supplierNotQuotation`)
                      .d('该供应商当前所在的生命周期阶段不可进行报价')
                  : ''
              }
            >
              <div style={{ color: addFlag === 1 || stageMismatchCnfFlag ? 'red' : 'black' }}>
                {text || '-'}
              </div>
            </Tooltip>
          );
        },
      },
      {
        name: 'contactNameLov',
        editor: true,
        renderer: ({ record, dataSet }) =>
          historyDiffRenderComp(record, dataSet, 'rfLineSupplier', 'contactName'),
        // renderer: ({ record }) => (
        //   <ComponentDiffRender record={record} historyDTO="rfLineSupplier" name="contactName">
        //     <Lov
        //       record={record}
        //       name="contactNameLov"
        //       style={{
        //         width: '100%',
        //       }}
        //       renderer={({ text }) => text ? <div> {text} </div> : ''}
        //     />
        //   </ComponentDiffRender>
        // ),
      },
      {
        name: 'contactPhone',
        width: 350,
        editor: (record) => {
          const region = <Select clearButton={false} record={record} name="internationalTelCode" />;
          return (
            <TextField addonBefore={region} addonBeforeStyle={{ border: 'none', padding: 0 }} />
          );
        },
        renderer: ({ record, dataSet }) => (
          <div style={{ display: 'flex' }}>
            {historyDiffRenderComp(
              record,
              dataSet,
              'rfLineSupplier',
              'internationalTelCode',
              record.getField('internationalTelCode')?.getText(record.get('internationalTelCode'))
            )}
            <span>|</span>
            {historyDiffRenderComp(record, dataSet, 'rfLineSupplier', 'contactPhone')}
          </div>
        ),
        // renderer: ({ record }) => {
        //   return (
        //     <Form record={record}>
        //       <Row>
        //         <Col span={12}>
        //           <ComponentDiffRender
        //             record={record}
        //             historyDTO="rfLineSupplier"
        //             name="internationalTelCode"
        //           >
        //             <Select
        //               clearButton={false}
        //               name="internationalTelCode"
        //               style={{ width: '100%', marginTop: '-21px' }}
        //               renderer={({ text }) => text ? <div> {text} </div> : ''}
        //             />
        //           </ComponentDiffRender>
        //         </Col>
        //         <Col span={12}>
        //           <ComponentDiffRender
        //             record={record}
        //             historyDTO="rfLineSupplier"
        //             name="contactPhone"
        //           >
        //             <TextField
        //               name="contactPhone"
        //               style={{
        //                 width: '100%',
        //                 marginTop: '-21px',
        //               }}
        //               renderer={({ text }) => text ? <div> {text} </div> : ''}
        //             />
        //           </ComponentDiffRender>
        //         </Col>
        //       </Row>
        //     </Form>
        //   );
        // },
      },
      {
        name: 'contactMail',
        editor: true,
        renderer: ({ record, dataSet }) =>
          historyDiffRenderComp(record, dataSet, 'rfLineSupplier', 'contactMail'),
        // renderer: ({ record }) => (
        //   <ComponentDiffRender record={record} historyDTO="rfLineSupplier" name="contactMail">
        //     <TextField
        //       record={record}
        //       name="contactMail"
        //       style={{
        //         width: '100%',
        //       }}
        //       renderer={({ text }) => text ? <div> {text} </div> : ''}
        //     />
        //   </ComponentDiffRender>
        // ),
      },
    ],
    []
  );

  const handleDeleteItem = (ds) => {
    const data = ds.selected;
    const flag = (ds.selected || []).find((i) => i.status !== 'add');
    if (!flag) ds.remove(data);
    if (flag) {
      ds.delete(data, {
        title: intl.get('ssrc.common.message.tip').d('提示'),
        children: intl
          .get('hzero.c7nProUI.DataSet.delete_selected_row_confirm')
          .d('确认删除选中行？'),
      }).then((res) => {
        const result = getResponse(res);
        if (result && result.success) {
          ds.unSelectAll();
          ds.query();
        }
      });
    }
  };

  const getRenderButtons = () => {
    const renderButtons = [
      header.addSupplierFlag === 1 && (
        <SupplierLov
          dataSet={batchAddSupplierLovDs}
          name="supplierLov"
          mode="button"
          clearButton={false}
          icon="playlist_add"
          placeholder={intl.get('ssrc.rf.model.rf.button.bulkAddSupplier').d('添加供应商')}
          modalProps={{
            style: { maxWidth: '1500px', width: '1000px' },
            onOk: handleAddSupplier,
            okProps: {
              waitType: 'debounce',
              wait: 500,
            },
            onCancel: () => {
              batchAddSupplierLovDs.loadData([]);
            },
          }}
          beforeQuery={fetchSourceSupplierRelativeConfigData}
          queryData={{ companyId: basicFormDs?.current?.get('companyId') }}
        >
          {intl.get('ssrc.rf.model.rf.button.bulkAddSupplier').d('添加供应商')}
        </SupplierLov>
      ),
      header.addSupplierFlag === 1 && (
        <TooltipButtonPro
          name="delete"
          icon="delete_sweep"
          disabled={isEmpty(inquiryScopeDs.selected)}
          onClick={() => handleDeleteItem(inquiryScopeDs)}
          help={intl.get('ssrc.common.view.message.supplier-line.select.tip').d('请先勾选供应商行')}
        >
          {intl.get(`hzero.common.button.batchDelete`).d('批量删除')}
        </TooltipButtonPro>
      ),
      'save',
    ].filter(Boolean);
    return renderButtons;
  };

  return (
    <React.Fragment>
      <div className={styles['inquiryScope-table']}>
        {customizeTable(
          {
            code: 'SSRC.INQUIRY_HALL.RF_CONTROL.SUPPLIER',
          },
          <Table buttons={getRenderButtons()} dataSet={inquiryScopeDs} columns={columns} />
        )}
      </div>
    </React.Fragment>
  );
};

export default observer(InquiryScope);
