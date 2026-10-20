import React, { useContext, useMemo } from 'react';
import { Table, useModal, Button } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import intl from 'utils/intl';

import { StoreContext } from '../store/StoreProvider';

// 标段/包信息
const SecAndPacketTableCmp = observer(() => {
  const Modal = useModal();

  const {
    commonDs: { sectionOrPacketInfoDs, viewMaterialDs } = {},
    doubleUnitFlag,
    customizeTable,
    getCustomizeUnitCode,
  } = useContext(StoreContext);

  // 标段查看物料字段
  const viewItemLineColumns = useMemo(
    () => [
      {
        name: 'projectLineItemNum',
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
      doubleUnitFlag
        ? {
            name: 'secondaryUomName',
          }
        : null,
      {
        name: 'uomName',
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
    ],
    [doubleUnitFlag]
  );

  // 打开物料详情
  const handleOpenItemDetailInfo = (record) => {
    const projectLineSectionId = record.get('projectLineSectionId');
    viewMaterialDs.setQueryParameter('projectLineSectionId', projectLineSectionId);
    viewMaterialDs.query();

    return Modal.open({
      title: intl.get(`ssrc.projectSetup.model.projectSetup.viewMaterial`).d('查看物料'),
      drawer: true,
      children: customizeTable(
        {
          code: getCustomizeUnitCode('viewItemLineTable'),
          dataSet: viewMaterialDs,
        },
        <Table
          dataSet={viewMaterialDs}
          columns={viewItemLineColumns}
          style={{ maxHeight: 'calc(100vh - 2.2rem)' }}
        />
      ),
      okButton: false,
      cancelText: intl.get('hzero.common.button.close').d('关闭'),
      style: { width: 1050 },
      cancelProps: {
        color: 'primary',
      },
    });
  };

  const columns = [
    {
      name: 'sectionNum',
    },
    {
      name: 'sectionCode',
    },
    {
      name: 'sectionName',
    },
    {
      name: 'viewMaterial',
      renderer: ({ record }) => {
        const itemCount = record.get('projectItemCount');
        if (!itemCount) return null;
        return (
          <Button funcType="link" onClick={() => handleOpenItemDetailInfo(record)}>
            {`${intl.get(`hzero.common.button.view`).d('查看')}(${itemCount})`}
          </Button>
        );
      },
    },
    {
      name: 'sectionRemark',
    },
    {
      name: 'sectionAttachmentUuid',
    },
  ];

  return customizeTable(
    {
      code: getCustomizeUnitCode('secAndPacketTable'),
      dataSet: sectionOrPacketInfoDs,
    },
    <Table dataSet={sectionOrPacketInfoDs} columns={columns} style={{ maxHeight: '4.5rem' }} />
  );
});

export default SecAndPacketTableCmp;
