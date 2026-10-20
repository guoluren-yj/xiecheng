import React, { useContext } from 'react';
import { Table } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';

import { StoreContext } from '../store/StoreProvider';
import { renderChangeFieldsColor, renderFieldTag } from '../utils';

// 标段/包信息
const supplierLineTable = observer((props) => {
  const { changeType } = props;

  const {
    commonDs: { supplierLineTableDs, headerDs } = {},
    onlyChangeCommonDs: {
      supplierLineTableDs: onlyChangeSupplierLineTableDs,
      headerDs: onlyChangeHeaderDs,
    } = {},
    customizeTable,
    getCustomizeUnitCode,
  } = useContext(StoreContext);

  const {
    subjectMatterRule, // 是否分标段
    lastValidSourceProjectDTO, // 上个版本历史数据
  } =
    changeType === 'onlyChange'
      ? onlyChangeHeaderDs.current?.get(['subjectMatterRule', 'lastValidSourceProjectDTO']) || {}
      : headerDs?.current?.get(['subjectMatterRule', 'lastValidSourceProjectDTO']) || {};

  const columns = [
    {
      name: 'changeTypeMeaning',
      renderer: renderFieldTag,
    },
    {
      name: 'supplierCompanyNum',
      renderer: ({ value, record }) =>
        renderChangeFieldsColor({ value, record, name: 'supplierCompanyNum' }),
    },
    {
      name: 'supplierCompanyName',
      renderer: ({ value, record }) =>
        renderChangeFieldsColor({ value, record, name: 'supplierCompanyName' }),
    },
    {
      name: 'supplierCategoryDescription',
      renderer: ({ value, record }) =>
        renderChangeFieldsColor({ value, record, name: 'supplierCategoryDescription' }),
    },
    {
      name: 'stageDescription',
      renderer: ({ value, record }) =>
        renderChangeFieldsColor({ value, record, name: 'stageDescription' }),
    },
    {
      name: 'contactName',
      renderer: ({ value, record }) =>
        renderChangeFieldsColor({ value, record, name: 'contactName' }),
    },
    {
      name: 'contactMobilephone',
      renderer: ({ record }) =>
        renderChangeFieldsColor({
          value: record?.get('internationalTelCode')
            ? `${record?.get('internationalTelCode')} | ${record?.get('contactMobilephone') ?? ''}`
            : record?.get('contactMobilephone'),
          record,
          name: ['internationalTelCode', 'contactMobilephone'],
        }),
    },
    {
      name: 'contactMail',
      renderer: ({ value, record }) =>
        renderChangeFieldsColor({ value, record, name: 'contactMail' }),
    },
    (subjectMatterRule === 'PACK' || lastValidSourceProjectDTO?.subjectMatterRule === 'PACK') && {
      name: 'allocatedLot',
      renderer: ({ record }) =>
        renderChangeFieldsColor({
          value: record
            ?.get('supSectionAssignLovDTOS')
            ?.map((lot) => lot.sectionName)
            ?.join(','),
          record,
          name: 'allocatedLot',
        }),
    },
  ];

  if (changeType === 'onlyChange') {
    return (
      <Table
        dataSet={onlyChangeSupplierLineTableDs}
        columns={columns}
        style={{ maxHeight: '4.5rem' }}
      />
    );
  }
  return customizeTable(
    {
      code: getCustomizeUnitCode('supplierTable'),
      dataSet: supplierLineTableDs,
    },
    <Table dataSet={supplierLineTableDs} columns={columns} style={{ maxHeight: '4.5rem' }} />
  );
});

export default supplierLineTable;
