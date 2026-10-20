import React, { useContext } from 'react';
import { Table, Button, Modal, Attachment } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

import { numberSeparatorRender } from '@/utils/renderer';

import { StoreContext } from '../store/StoreProvider';
import { renderChangeFieldsColor, renderFieldTag } from '../utils';

// 标段/包信息
const SecAndPacketTableCmp = observer((props) => {
  const { changeType } = props;

  const {
    commonDs: { sectionOrPacketInfoDs, viewMaterialDs } = {},
    onlyChangeCommonDs: {
      sectionOrPacketInfoDs: onlyChangeSecOrPacketInfoDs,
      viewMaterialDs: onlyChangeViewMaterialDs,
    } = {},
    doubleUnitFlag,
    customizeTable,
    getCustomizeUnitCode,
  } = useContext(StoreContext);

  // 查看物料表格
  const getViewItemLineTable = (ds) => {
    const columns = [
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
            renderer: ({ value }) => numberSeparatorRender(value),
          }
        : null,
      {
        name: 'requiredQuantity',
        renderer: ({ value }) => numberSeparatorRender(value),
      },
    ];
    return <Table dataSet={ds} columns={columns} style={{ maxHeight: 'calc(100vh - 250px)' }} />;
  };

  // 打开物料详情
  const handleOpenItemDetailInfo = (secLineRecord) => {
    const projectLineSectionId = secLineRecord.get('projectLineSectionId');
    if (changeType === 'onlyChange') {
      onlyChangeViewMaterialDs.setQueryParameter('projectLineSectionId', projectLineSectionId);
      onlyChangeViewMaterialDs.query();
    } else {
      viewMaterialDs.setQueryParameter('projectLineSectionId', projectLineSectionId);
      viewMaterialDs.query();
    }

    return Modal.open({
      title: intl.get(`ssrc.projectSetup.model.projectSetup.viewMaterial`).d('查看物料'),
      drawer: true,
      children:
        changeType === 'onlyChange'
          ? getViewItemLineTable(onlyChangeViewMaterialDs)
          : customizeTable(
              {
                code: getCustomizeUnitCode('viewItemLineTable'),
                dataSet: viewMaterialDs,
              },
              getViewItemLineTable(viewMaterialDs)
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
      name: 'changeTypeMeaning',
      renderer: renderFieldTag,
    },
    {
      name: 'sectionNum',
      renderer: ({ value, record }) =>
        renderChangeFieldsColor({ value, record, name: 'sectionNum' }),
    },
    {
      name: 'sectionCode',
      renderer: ({ value, record }) =>
        renderChangeFieldsColor({ value, record, name: 'sectionCode' }),
    },
    {
      name: 'sectionName',
      renderer: ({ value, record }) =>
        renderChangeFieldsColor({ value, record, name: 'sectionName' }),
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
      renderer: ({ value, record }) =>
        renderChangeFieldsColor({ value, record, name: 'sectionRemark' }),
    },
    {
      name: 'sectionAttachmentUuid',
      renderer: ({ record }) =>
        renderChangeFieldsColor({
          value: (
            <Attachment
              name="sectionAttachmentUuid"
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
          name: 'sectionAttachmentUuid',
        }),
    },
  ];

  if (changeType === 'onlyChange') {
    return (
      <Table
        dataSet={onlyChangeSecOrPacketInfoDs}
        columns={columns}
        style={{ maxHeight: '4.5rem' }}
      />
    );
  }

  return customizeTable(
    {
      code: getCustomizeUnitCode('secAndPacketTable'),
      dataSet: sectionOrPacketInfoDs,
    },
    <Table dataSet={sectionOrPacketInfoDs} columns={columns} style={{ maxHeight: '4.5rem' }} />
  );
});

export default SecAndPacketTableCmp;
