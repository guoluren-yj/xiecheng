/**
 * 协议详情-文本共享管理
 */
import React, { useEffect, useCallback, useMemo } from 'react';

import { observer } from 'mobx-react-lite';
import { DataSet, Button, Modal } from 'choerodon-ui/pro';
import SearchBarTable from '_components/SearchBarTable';
import { compose, isEmpty } from 'lodash';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { yesOrNoRender } from 'utils/renderer';

import { shareObjeceDS, chooseShareObjectDS, shareRecordDS } from './store/ShareMangementDS';
import ChooseShareObjectModal from './ChooseShareObjectModal';
import ShareRecordModal from './ShareRecordModal';

const ShareMangement = (props) => {
  const {
    customizeTable,
    modal: { update, close },
    pcHeaderId,
  } = props;

  const shareObjeceDs = useMemo(() => new DataSet(shareObjeceDS(pcHeaderId)), [pcHeaderId]);

  const shareRecordDs = useMemo(() => new DataSet(shareRecordDS(pcHeaderId)), [pcHeaderId]);
  const columns = [
    {
      name: 'realName',
      width: 150,
    },
    {
      name: 'loginName',
      width: 150,
    },
    {
      name: 'roleName',
      width: 150,
    },
    {
      name: 'isShareContract',
      width: 150,
      editor: true,
    },
    {
      name: 'isFinish',
      width: 150,
      renderer: ({ value }) => yesOrNoRender(value === '1' ? 1 : 0),
    },
  ];

  useEffect(() => {
    updateFooter();
  }, []);

  const TableBtns = (dataSet) => {
    return [
      <Button
        color="primary"
        icon="playlist_add"
        onClick={() => {
          handleOpenModal('chooseShareObject');
        }}
      >
        {intl.get('hzero.common.button.add').d('新增')}
      </Button>,
      <DeleteButton dataSet={dataSet} />,
    ];
  };

  const FooterBtns = observer((btnProps) => {
    const isDisabled = !btnProps.dataSet.dirty;
    return [
      <Button color="primary" disabled={isDisabled} onClick={handleConfirm}>
        {intl.get('hzero.common.button.confirm').d('确定')}
      </Button>,
      <Button onClick={() => handleOpenModal('shareRecord')}>
        {intl.get('spcm.workspace.view.button.shareRecord').d('共享记录')}
      </Button>,
      <Button onClick={close}>{intl.get('hzero.common.button.close').d('关闭')}</Button>,
    ];
  });

  const handleConfirm = async () => {
    shareObjeceDs.submit(false).then((res) => {
      if (res) {
        close();
      }
    });
  };

  const handleQuery = () => {
    shareObjeceDs.query();
  };

  // 打开弹窗方法
  const handleOpenModal = (key) => {
    const modalKey = Modal.key();
    const modalTypeList = [
      {
        key: 'chooseShareObject',
        title: intl.get('spcm.workspace.view.modal.chooseShareObject').d('选择共享对象'),
        children: (
          <ChooseShareObjectModal
            dataSet={new DataSet(chooseShareObjectDS(pcHeaderId))}
            refreshData={handleQuery}
          />
        ),
      },
      {
        key: 'shareRecord',
        title: intl.get('spcm.workspace.view.modal.shareRecord').d('共享记录'),
        children: <ShareRecordModal dataSet={shareRecordDs} />,
      },
    ];
    const { title, children } = modalTypeList.find((item) => item.key === key);
    const modalProps =
      key === 'shareRecord'
        ? {
            okCancel: false,
            okText: intl.get('hzero.common.button.close').d('关闭'),
            bodyStyle: {
              padding: 0,
            },
          }
        : {
            drawer: false,
            style: { width: '800px' },
          };
    Modal.open({
      closable: true,
      key: modalKey,
      drawer: true,
      title,
      children,
      style: { width: '1090px' },
      ...modalProps,
    });
  };

  const DeleteButton = observer((deleteBtnProps) => {
    const selectedRows = deleteBtnProps.dataSet.selected || [];
    return (
      <Button
        icon="delete_sweep"
        color="primary"
        funcType="flat"
        disabled={isEmpty(selectedRows)}
        onClick={handleDelete}
      >
        {intl.get(`hzero.common.button.batchdelete`).d('批量删除')}
      </Button>
    );
  });

  const handleDelete = async () => {
    // 删除线上数据
    const res = await shareObjeceDs.delete(shareObjeceDs.selected, {
      title: intl.get(`hzero.common.message.confirm.title`).d('提示'),
      children: intl
        .get('hzero.c7nProUI.DataSet.delete_selected_row_confirm')
        .d('确认删除选中行？'),
    });
    if (res && !res.failed) {
      shareObjeceDs.query();
    }
  };

  const updateFooter = () => {
    update({
      footer: (
        <div>
          <FooterBtns dataSet={shareObjeceDs} />
        </div>
      ),
    });
  };

  const getTableRender = useCallback(() => {
    return customizeTable(
      {
        code: 'SPCM.WORKSPACE_DETAIL.SHARE_MANGEMENT.LIST',
        lovIgnore: false,
      },
      <SearchBarTable
        searchCode="SPCM.WORKSPACE_DETAIL.SHARE_MANGEMENT.LIST.FILTER"
        dataSet={shareObjeceDs}
        columns={columns}
        buttons={TableBtns(shareObjeceDs)}
        style={{ maxHeight: 'calc(100% - 22px)' }}
        searchBarConfig={{
          closeFilterSelector: true,
        }}
      />
    );
  });

  return getTableRender();
};

export default compose(
  formatterCollections({
    code: ['spcm.workspace', 'hzero.common'],
  }),
  withCustomize({
    unitCode: [
      'SPCM.WORKSPACE_DETAIL.SHARE_MANGEMENT.LIST',
      'SPCM.WORKSPACE_DETAIL.SHARE_MANGEMENT.LIST.FILTER',
    ],
  })
)(ShareMangement);
