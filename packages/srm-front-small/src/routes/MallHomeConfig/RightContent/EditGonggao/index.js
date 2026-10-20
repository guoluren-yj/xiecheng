import React, { useMemo, useEffect } from 'react';
import { connect } from 'dva';
import { compose, isEmpty } from 'lodash';
import { Tooltip, Tag } from 'choerodon-ui';
import { Table, DataSet, Modal, Button } from 'choerodon-ui/pro';
// import { observer } from 'mobx-react-lite';

import { getResponse } from 'utils/utils';
import intl from 'utils/intl';
import { sortGonggao, saveGonggao } from '@/services/mallHomeConfigService';
import { dateRender } from 'utils/renderer';
import Gonggao from './Gonggao';
import { tableds } from './tableds';
import styles from './index.less';
import { DeleteButton } from '../../common/buttons';

function EditGonggao(props) {
  const {
    dispatch,
    mallHome: { currentRole, mallType, purchase, lovBatch },
  } = props;
  // 编辑banner
  function openBanner(record) {
    Modal.open({
      destroyOnClose: true,
      title: record ? intl.get(`small.mallHomePlate.view.gonggao.edit`).d('编辑公告') : intl.get('small.mallHomePlate.view.gonggao.create').d('新增公告'),
      mask: true,
      okText: intl.get('small.common.button.save').d('保存'),
      closable: true,
      style: { width: 742 },
      drawer: true,
      children: <Gonggao DS={tableDs} record={record} />,
    });
  }

  useEffect(() => {
    if (isEmpty(lovBatch?.enabledFlag)) {
      dispatch({
        type: 'mallHome/initQueryIdp',
      });
    }
    tableDs.setQueryParameter('belongType', currentRole === 'tenant' ? 0 : null);
    tableDs.setQueryParameter('unitId', purchase.unitId);
    tableDs.setQueryParameter('bulletinAttribute', mallType === 'sigl' ? 1 : 0);
    tableDs.setQueryParameter('isPreview', 1);
    tableDs.query();
  }, []);

  const tableDs = useMemo(() => {
    return new DataSet(tableds());
  }, []);

  const handleDisable = async (params) => {
    const resp = getResponse(await saveGonggao(params));
    if (resp) tableDs.query();
  };

  const columns = [
    {
      width: 100,
      name: 'enabledFlag',
      renderer: ({ value }) => (
        <Tag border={false} color={+value === 1 ? 'green' : 'red'}>
          {lovBatch.enabledFlag?.find((item) => +item.value === +value)?.meaning}
        </Tag>
      ),
    },
    {
      name: 'bulletinTitle',
      renderer: ({ value, record }) => {
        return (
          <span className="action-link">
            <Button
              funcType="link"
              color="primary"
              disabled={currentRole === 'purchase' && +record.get('belongType') === 0}
              onClick={() => openBanner(record)}
            >
              {value}
            </Button>
          </span>
        );
      },
    },
    {
      name: 'timer',
      renderer: ({ record }) => {
        return (
          <>
            {dateRender(record.get('startDate'))} ~ {dateRender(record.get('endDate') || '')}
          </>
        );
      },
    },
    {
      name: 'creationDate',
    },
    {
      name: 'operate',
      width: 136,
      renderer: ({ record }) => {
        return (
          <Tooltip
            title={
              currentRole === 'purchase' && +record.get('belongType') === 0
                ? intl
                    .get('small.mallHomeConfig.view.changeDelGonggao.warning')
                    .d('租户分配的公告不可修改、删除')
                : null
            }
          >
            <Button
              funcType="link"
              color="primary"
              onClick={() =>
                  handleDisable({
                    ...record.toData(),
                    enabledFlag: Number(!record.get('enabledFlag')),
                  })
                }
            >
              {+record.get('enabledFlag') === 1 ? intl.get('hzero.common.button.disable').d('禁用') : intl.get('hzero.common.button.enable').d('启用')}
            </Button>
          </Tooltip>
        );
      },
    },
  ];

  async function handleDragEnd() {
    tableDs.status = 'loading';
    const res = await getResponse(
      sortGonggao({
        page: tableDs.currentPage,
        size: tableDs.pageSize,
        pageSize: tableDs.totalPage,
        bulletinBoardSortList: tableDs.toData(),
      })
    );
    if (res) {
      tableDs.query();
    } else {
      tableDs.status = 'ready';
    }
  }

  function onDragEndBefore(dataSet, _, resultDrag) {
    if (!resultDrag.destination) return false;
    const data = dataSet.toData();
    const {
      source: { index },
      destination: { index: dindex },
    } = resultDrag;
    if (+data[index].belongType === 0 && currentRole === 'purchase') {
      return false;
    } else if (+data[dindex].bannerLevel === 0 && currentRole === 'purchase') {
      return false;
    } else {
      return true;
    }
  }

  return (
    <div className={styles.content}>
      <p className='des' style={{ marginBottom: 16 }}>
        {intl
          .get('small.mallHomeConfig.view.Gonggao.maxdesc')
          .d(
            '该模板可用于租户对系统公告的配置，若不进行配置，商城首页将不对该模块进行展示，若配置，则滚动显示所有公告，详情可在更多中进行查看。可拖拽对公告栏进行排序。'
          )}
      </p>
      <Table
        customizedCode='BULLETIN_LIST_TABLE'
        dragColumnAlign="left"
        dataSet={tableDs}
        columns={columns}
        rowDraggable
        onDragEnd={handleDragEnd}
        onDragEndBefore={onDragEndBefore}
        style={{maxHeight: 'calc(100vh - 270px)'}}
        buttons={[
          <Button
            color="primary"
            funcType="flat"
            onClick={() => openBanner()}
            icon="playlist_add"
          >
            {intl.get('hzero.common.button.add').d('新增')}
          </Button>,
          <DeleteButton dataSet={tableDs} onClick={() => tableDs.delete(tableDs.selected)} />,
        ]}
      />
    </div>
  );
}

export default compose(
  connect(({ mallHome }) => ({
    mallHome,
  }))
)(EditGonggao);
