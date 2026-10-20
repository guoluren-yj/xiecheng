import React, { useEffect, useMemo } from 'react';
import { Table, Button, Modal, DataSet, Tooltip } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';

import intl from 'utils/intl';

import ComContent from '../ComContent';
import HotConfigDetail from './HotConfigDetail';

const EditButton = observer(({
  dataSet,
  openHotConfigModal,
}) => (
  <Tooltip title={dataSet?.current?.get('imageUrl') ? null : intl.get('small.common.view.hotEditWarning').d('请上传图片后再编辑热区')}>
    <Button
      style={{ height: 24 }}
      icon="mode_edit"
      color="primary"
      funcType="flat"
      onClick={() => openHotConfigModal()}
      disabled={!dataSet?.current?.get('imageUrl')}
    >
      {intl.get('small.common.button.createHot').d('编辑')}
    </Button>
  </Tooltip>
));

function HotList({
  dataSet,
  groupAttribute,
  headerType,
  headerId,
  customType,
}) {
  const tableDs = useMemo(() => new DataSet({
    paging: false,
    selection: false,
  }), []);
  useEffect(() => {
    if(dataSet.current) {
      tableDs.loadData(dataSet.current?.get('hotZoneList'));
    }
  }, [dataSet.current]);

  const columns = [
    {
      header: intl.get('small.mallHomeConfig.view.hotList').d('热区列表'),
      name: 'hotZoneName',
    },
    {
      header: intl.get('small.mallHomeConfig.view.linkDetail').d('关联内容'),
      name: 'contentDetail',
      renderer: ({record}) => record.get('linkUrl') || record.get('productGroupName'),
    },
  ];

  function openHotConfigModal() {
    const detailProps = {
      dataSet,
      tableDs,
      groupAttribute,
      headerType,
      headerId,
      customType,
    };
    Modal.open({
      title: intl.get('small.mallHomeConfig.view.editHot.title').d('编辑热区'),
      className: 'hot-config-modal',
      drawer: true,
      style: { width: 1090 },
      bodyStyle: { padding: 0 },
      children: <HotConfigDetail {...detailProps} />,
      okText: intl.get('hzero.common.button.save').d('保存'),
    });
  }

  return (
    <ComContent
      title={intl.get('small.mallHomeConfig.view.hotList').d('热区列表')}
      style={{ marginBottom: 0 }}
      titleStyle={{ marginBottom: 16 }}
    >
      <Table
        dataSet={tableDs}
        columns={columns}
        buttons={[<EditButton dataSet={dataSet} openHotConfigModal={openHotConfigModal} />]}
        customizedCode="HOT_LIST_TABLE"
      />
    </ComContent>
  );
}

export default HotList;
