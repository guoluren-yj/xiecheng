import React, { useContext } from 'react';
import { Table, useModal, Button } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import intl from 'utils/intl';

import { StoreContext } from '../store/StoreProvider';
import ItemLineDetail from './ItemLineDetail';

// 标段/包信息
const SecAndPacketTableCmp = observer(() => {
  const Modal = useModal();

  const {
    commonDs: { sectionOrPacketInfoDs, itemLineDetailDs, headerDs } = {},
    doubleUnitFlag,
    customizeTable,
    getCustomizeUnitCode,
  } = useContext(StoreContext);

  // 打开物料详情
  const handleOpenItemDetailInfo = (record) => {
    const projectLineSectionId = record.get('projectLineSectionId');
    itemLineDetailDs.setQueryParameter('projectLineSectionId', projectLineSectionId);
    itemLineDetailDs.query();

    // 子组件传参
    const itemDetailTableProps = {
      ds: itemLineDetailDs,
      headerDs,
      doubleUnitFlag,
      customizeTable,
      getCustomizeUnitCode,
    };
    return Modal.open({
      title: intl.get(`ssrc.projectSetup.model.projectSetup.viewMaterial`).d('查看物料'),
      drawer: true,
      children: <ItemLineDetail {...itemDetailTableProps} />,
      okButton: false,
      cancelText: intl.get('hzero.common.button.close').d('关闭'),
      style: { width: 1050, zIndex: 3 },
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
    <Table dataSet={sectionOrPacketInfoDs} columns={columns} />
  );
});

export default SecAndPacketTableCmp;
