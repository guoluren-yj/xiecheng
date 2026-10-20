import React, { useContext, useEffect, useState } from 'react';
import { Table, Button } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import { isEmpty } from 'lodash';

import notification from 'utils/notification';
import { getResponse, getCurrentTenant } from 'utils/utils';
import DocFlow from '_components/DocFlow';
import intl from 'utils/intl';

import QuotationDetail from '@/routes/components/QuotationDetailNew/Detail';
import { fetchConfigSheet } from '@/services/inquiryHallService';
import { releaseApplyApi } from '@/services/projectSetupService';

import { numberSeparatorRender } from '@/utils/renderer';

import { StoreContext } from '../store/StoreProvider';
import { renderExecutingStatus } from '../../helpers';

// 物料详情卡片
const ItemLineDetailCmp = observer(() => {
  const {
    commonDs: { itemLineDs, headerDs } = {},
    doubleUnitFlag,
    organizationId,
    history,
    customizeTable,
    getCustomizeUnitCode,
    pageSourceCategory,
  } = useContext(StoreContext);

  const {
    projectFrom, // 立项单来源
    subjectMatterRule, // 是否分标段
    sourceProjectStatus, // 立项单状态
  } = headerDs?.current?.get(['projectFrom', 'subjectMatterRule', 'sourceProjectStatus']) || {};

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

  // 释放申请
  const handleReleaseApply = (record) => {
    if (!record) return;
    return releaseApplyApi([record.toData()]).then((res) => {
      if (getResponse(res)) {
        notification.success();
        itemLineDs.query(itemLineDs.currentPage);
      }
    });
  };

  // 明细审批才显示的字段
  const detailShowColumns =
    pageSourceCategory === 'version'
      ? []
      : [
          {
            name: 'executingStatusMeaning',
            renderer: renderExecutingStatus,
          },
          {
            name: 'occupiedQuantity',
            align: 'right',
          },
          {
            name: 'executableQuantity',
            align: 'right',
          },
        ];

  const columns = [
    {
      name: 'projectLineItemNum',
    },
    {
      title: intl.get('ssrc.inquiryHall.model.inquiryHall.docFlow').d('单据流'),
      name: 'docFlow',
      hidden: pageSourceCategory === 'version',
      width: 80,
      renderer: ({ record }) => (
        <DocFlow tableName="ssrc_project_line_item" tablePk={record?.get('projectLineItemId')} />
      ),
    },
    {
      name: 'ouName',
      width: 180,
    },
    {
      name: 'invOrganizationName',
      width: 180,
    },
    {
      name: 'itemCode',
    },
    {
      name: 'itemName',
    },
    {
      name: 'itemCategoryName',
    },
    {
      name: 'specifications',
    },
    doubleUnitFlag
      ? {
          name: 'secondaryQuantity',
          align: 'right',
        }
      : null,
    {
      name: 'requiredQuantity',
      align: 'right',
    },
    doubleUnitFlag
      ? {
          name: 'secondaryUomName',
        }
      : null,
    {
      name: 'uomName',
    },
    {
      name: 'priceBatch',
      align: 'right',
    },
    !doubleUnitFlag
      ? {
          name: 'costPrice',
          align: 'right',
          renderer: ({ value }) => numberSeparatorRender(value),
        }
      : null,
    !doubleUnitFlag
      ? {
          name: 'totalPrice',
          align: 'right',
          renderer: ({ value }) => numberSeparatorRender(value),
        }
      : null,
    {
      name: 'estimatedPrice',
      align: 'right',
      renderer: ({ value }) => numberSeparatorRender(value),
    },
    {
      name: 'estimatedAmount',
      align: 'right',
      renderer: ({ value }) => numberSeparatorRender(value),
    },
    {
      name: 'templateName',
    },
    {
      name: 'quotationDetail',
      renderer: ({ record }) => (
        <QuotationDetail rowData={record} uiType="c7n" sourceFrom="PROJECT" />
      ),
    },
    {
      name: 'itemRemark',
    },
    {
      name: 'itemAttachmentUuid',
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
        }
      : null,
    {
      name: 'requestUserName',
    },
    {
      name: 'projectTaskName',
    },
    ...detailShowColumns,
    subjectMatterRule === 'PACK'
      ? {
          name: 'sectionCode',
        }
      : null,
    subjectMatterRule === 'PACK'
      ? {
          name: 'sectionName',
        }
      : null,
    pageSourceCategory === 'detail' && {
      header: intl.get('hzero.common.button.action').d('操作'),
      name: 'action',
      width: 150,
      renderer: ({ record }) => {
        const { executingStatus, prLineId, isShowReleaseButton } =
          record.get(['executingStatus', 'prLineId', 'isShowReleaseButton']) || {};
        // 【释放申请】按钮显示逻辑：
        // 【立项头状态】= 【完成】 && 【立项行执行状态】= 【未寻源】 ||【部分寻源】 && 当前行为申请转的行
        const isShowReleaseFlag =
          sourceProjectStatus === 'FINISHED' &&
          ['UNSOURCED', 'PARTIALLY_SOURCED'].includes(executingStatus) &&
          !!prLineId &&
          isShowReleaseButton !== 0;

        return isShowReleaseFlag ? (
          <Button onClick={() => handleReleaseApply(record)} funcType="link" wait={1200}>
            {intl.get(`ssrc.inquiryHall.model.inquiryHall.releaseApply`).d('释放申请')}
          </Button>
        ) : null;
      },
    },
  ];

  return customizeTable(
    {
      code: getCustomizeUnitCode('itemLineTable'),
      dataSet: itemLineDs,
    },
    <Table dataSet={itemLineDs} columns={columns} style={{ maxHeight: '4.5rem' }} />
  );
});

export default ItemLineDetailCmp;
