import React, { useContext, useEffect, useState } from 'react';
import { Table, Button, Attachment } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import intl from 'utils/intl';
import DocFlow from '_components/DocFlow';
import { getResponse, getCurrentTenant, getCurrentOrganizationId } from 'utils/utils';
import { isEmpty } from 'lodash';
import { Badge } from 'choerodon-ui';
import { SRM_SSRC } from '_utils/config';

import QuotationDetail from '@/routes/components/QuotationDetailNew/Detail';
import { fetchConfigSheet } from '@/services/inquiryHallService';

import { numberSeparatorRender } from '@/utils/renderer';

import { StoreContext } from '../store/StoreProvider';
import { renderChangeFieldsColor, renderFieldTag } from '../utils';
import { renderExecutingStatus } from '../../helpers';

// 物料详情卡片
const ItemLineDetailCmp = observer((props) => {
  const { changeType } = props;

  const {
    commonDs: { itemLineDs, headerDs } = {},
    onlyChangeCommonDs: { itemLineDs: onlyChangeItemLineDs, headerDs: onlyChangeHeaderDs } = {},
    doubleUnitFlag,
    customizeTable,
    getCustomizeUnitCode,
    organizationId,
    history,
    templateInfo,
  } = useContext(StoreContext);

  const {
    projectFrom, // 立项单来源
    subjectMatterRule, // 是否分标段
    lastValidSourceProjectDTO, // 上个版本历史数据
  } =
    changeType === 'onlyChange'
      ? onlyChangeHeaderDs.current?.get([
          'projectFrom',
          'subjectMatterRule',
          'lastValidSourceProjectDTO',
        ]) || {}
      : headerDs?.current?.get(['projectFrom', 'subjectMatterRule', 'lastValidSourceProjectDTO']) ||
        {};

  // 申请新老ui配置
  const [sprmOldUiConfig, setSprmOldUiConfig] = useState(false);

  useEffect(() => {
    fetchSprmUiConfig();
  }, []);

  // 查询配置表
  const fetchSprmUiConfig = async () => {
    let data = null;

    try {
      data = await fetchConfigSheet({
        configCode: 'sprm_old_ui_config',
        organizationId,
        data: {
          tenant: getCurrentTenant().tenantNum,
        },
      });
      data = getResponse(data);
      if (!data) {
        return;
      }
      setSprmOldUiConfig(!isEmpty(data));
    } catch (e) {
      throw e;
    }
  };

  // 采购申请行跳转
  const linkToPrNumDetail = (record = {}) => {
    const { prSourcePlatform, prHeaderId } = record.get(['prSourcePlatform', 'prHeaderId']) || {};
    const isErp = prSourcePlatform && prSourcePlatform.toLowerCase() === 'erp';
    let pathUrl = null;

    if (!sprmOldUiConfig) {
      // 记录一个标识, 实现跳转的采购申请工作台明细后,点击返回按钮，返回采购申请工作台主页面的【整单-全部】页签
      // 需要去采购申请工作台去适配此方案
      // NOTE window.ssrc.directionToPurchasePlatform = 'inquiryHallNewUpdate,inquiryHallNewDetail';
      window.ssrcDirectionToPurchasePlatformSymbol = 'inquiryHallNewUpdate';

      pathUrl = isErp
        ? `/sprm/purchase-platform/erp-detail/${prHeaderId}`
        : `/sprm/purchase-platform/noerp-detail/${prHeaderId}`;
    } else {
      pathUrl = isErp
        ? `/sprm/purchase-requisition-inquiry/erp-detail/${prHeaderId}`
        : `/sprm/purchase-requisition-inquiry/not-erp-detail/${prHeaderId}`;
    }

    if (window.top !== window) {
      window.parent.postMessage({
        type: 'link',
        data: JSON.stringify({
          pathname: pathUrl,
        }),
      });
    } else {
      history.push({
        pathname: pathUrl,
      });
    }
  };

  const columns = [
    {
      name: 'changeTypeMeaning',
      renderer: renderFieldTag,
    },
    {
      name: 'projectLineItemNum',
      renderer: ({ value, record }) =>
        renderChangeFieldsColor({ value, record, name: 'projectLineItemNum' }),
    },
    changeType === 'onlyChange'
      ? null
      : {
          title: intl.get('ssrc.inquiryHall.model.inquiryHall.docFlow').d('单据流'),
          name: 'docFlow',
          width: 80,
          renderer: ({ record }) => (
            <DocFlow
              tableName="ssrc_project_line_item"
              tablePk={record?.get('projectLineItemId')}
            />
          ),
        },
    {
      name: 'ouName',
      width: 180,
      renderer: ({ value, record }) => renderChangeFieldsColor({ value, record, name: 'ouId' }),
    },
    {
      name: 'invOrganizationName',
      width: 180,
      renderer: ({ value, record }) =>
        renderChangeFieldsColor({ value, record, name: 'invOrganizationId' }),
    },
    {
      name: 'itemCode',
      renderer: ({ value, record }) => renderChangeFieldsColor({ value, record, name: 'itemCode' }),
    },
    {
      name: 'itemName',
      renderer: ({ value, record }) => renderChangeFieldsColor({ value, record, name: 'itemName' }),
    },
    {
      name: 'itemCategoryName',
      renderer: ({ value, record }) =>
        renderChangeFieldsColor({ value, record, name: 'itemCategoryId' }),
    },
    {
      name: 'specifications',
      renderer: ({ value, record }) =>
        renderChangeFieldsColor({ value, record, name: 'specifications' }),
    },
    doubleUnitFlag
      ? {
          name: 'secondaryQuantity',
          align: 'right',
          renderer: ({ value, record }) =>
            renderChangeFieldsColor({ value, record, name: 'secondaryQuantity' }),
        }
      : null,
    {
      name: 'requiredQuantity',
      align: 'right',
      renderer: ({ value, record }) =>
        renderChangeFieldsColor({ value, record, name: 'requiredQuantity' }),
    },
    doubleUnitFlag
      ? {
          name: 'secondaryUomName',
          renderer: ({ value, record }) =>
            renderChangeFieldsColor({ value, record, name: 'secondaryUomId' }),
        }
      : null,
    {
      name: 'uomName',
      renderer: ({ value, record }) => renderChangeFieldsColor({ value, record, name: 'uomId' }),
    },
    {
      name: 'priceBatch',
      align: 'right',
      renderer: ({ value, record }) =>
        renderChangeFieldsColor({ value, record, name: 'priceBatch' }),
    },
    !doubleUnitFlag
      ? {
          name: 'costPrice',
          align: 'right',
          renderer: ({ value, record }) =>
            renderChangeFieldsColor({
              value: numberSeparatorRender(value),
              record,
              name: 'costPrice',
            }),
        }
      : null,
    !doubleUnitFlag
      ? {
          name: 'totalPrice',
          align: 'right',
          renderer: ({ value, record }) =>
            renderChangeFieldsColor({
              value: numberSeparatorRender(value),
              record,
              name: 'totalPrice',
            }),
        }
      : null,
    {
      name: 'estimatedPrice',
      align: 'right',
      renderer: ({ value, record }) =>
        renderChangeFieldsColor({
          value: numberSeparatorRender(value),
          record,
          name: 'estimatedPrice',
        }),
    },
    {
      name: 'estimatedAmount',
      align: 'right',
      renderer: ({ value, record }) =>
        renderChangeFieldsColor({
          value: numberSeparatorRender(value),
          record,
          name: 'estimatedAmount',
        }),
    },
    {
      name: 'templateName',
      renderer: ({ value, record }) =>
        renderChangeFieldsColor({ value, record, name: 'quotationTemplateId' }),
    },
    {
      name: 'quotationDetail',
      renderer: ({ record }) => {
        const { changeFields, changeType: recordChangeType } =
          record.get(['changeFields', 'changeType']) || {};
        let showRedDotFlag = false;
        if (
          ['ADD', 'DELETE'].includes(recordChangeType) ||
          (recordChangeType === 'MODIFY' && changeFields?.includes('quotationDetailFlag'))
        ) {
          showRedDotFlag = true;
        } else {
          showRedDotFlag = false;
        }
        if (!record?.get('quotationDetailFlag') && showRedDotFlag) {
          // 如果-，则不显示红点，显示红-
          return <span style={{ color: 'red' }}>-</span>;
        }
        return (
          <>
            <QuotationDetail
              rowData={record}
              uiType="c7n"
              sourceFrom="PROJECT"
              queryTableUrl={`${SRM_SSRC}/v1/${organizationId}/quotation-details/changing`}
              queryTableParams={{
                dataVersion: templateInfo?.dataVersion,
                sourceProjectHistoryId: templateInfo?.sourceProjectHistoryId,
              }}
            />
            {showRedDotFlag && <Badge style={{ marginLeft: '6px' }} status="error" />}
          </>
        );
      },
    },
    {
      name: 'itemRemark',
      renderer: ({ value, record }) =>
        renderChangeFieldsColor({ value, record, name: 'itemRemark' }),
    },
    {
      name: 'itemAttachmentUuid',
      renderer: ({ record }) =>
        renderChangeFieldsColor({
          value: (
            <Attachment
              name="itemAttachmentUuid"
              viewMode="popup"
              funcType="link"
              record={record}
              readOnly
              data={{
                tenantId: getCurrentOrganizationId(),
              }}
            />
          ),
          record,
          name: 'itemAttachmentUuid',
        }),
    },
    projectFrom === 'REFERENCE'
      ? {
          name: 'prNum',
          renderer: ({ value, record }) => {
            return (
              <Button funcType="link" onClick={() => linkToPrNumDetail(record)}>
                {value}
              </Button>
            );
          },
        }
      : null,
    projectFrom === 'REFERENCE'
      ? {
          name: 'prDisplayLineNum',
          renderer: ({ value, record }) =>
            renderChangeFieldsColor({ value, record, name: 'prDisplayLineNum' }),
        }
      : null,
    {
      name: 'requestUserName',
      renderer: ({ value, record }) =>
        renderChangeFieldsColor({ value, record, name: 'requestUserId' }),
    },
    {
      name: 'projectTaskName',
      renderer: ({ value, record }) =>
        renderChangeFieldsColor({ value, record, name: 'projectTaskId' }),
    },
    {
      name: 'executingStatusMeaning',
      renderer: ({ value, record }) =>
        renderChangeFieldsColor({
          value: renderExecutingStatus({ value, record }),
          record,
          name: 'executingStatus',
        }),
    },
    {
      name: 'occupiedQuantity',
      align: 'right',
      renderer: ({ value, record }) =>
        renderChangeFieldsColor({ value, record, name: 'occupiedQuantity' }),
    },
    {
      name: 'executableQuantity',
      align: 'right',
      renderer: ({ value, record }) =>
        renderChangeFieldsColor({ value, record, name: 'executableQuantity' }),
    },
    subjectMatterRule === 'PACK' || lastValidSourceProjectDTO?.subjectMatterRule === 'PACK'
      ? {
          name: 'sectionCode',
          renderer: ({ value, record }) =>
            renderChangeFieldsColor({ value, record, name: 'projectLineSectionId' }),
        }
      : null,
    subjectMatterRule === 'PACK' || lastValidSourceProjectDTO?.subjectMatterRule === 'PACK'
      ? {
          name: 'sectionName',
          renderer: ({ value, record }) =>
            renderChangeFieldsColor({ value, record, name: 'projectLineSectionId' }),
        }
      : null,
  ];

  if (changeType === 'onlyChange') {
    return (
      <Table dataSet={onlyChangeItemLineDs} columns={columns} style={{ maxHeight: '4.5rem' }} />
    );
  }
  return customizeTable(
    {
      code: getCustomizeUnitCode('itemLineTable'),
      dataSet: itemLineDs,
    },
    <Table dataSet={itemLineDs} columns={columns} style={{ maxHeight: '4.5rem' }} />
  );
});

export default ItemLineDetailCmp;
