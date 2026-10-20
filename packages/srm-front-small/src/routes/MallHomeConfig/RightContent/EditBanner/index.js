import React, { useMemo, useState, useEffect } from 'react';
import { connect } from 'dva';
import { compose, isEmpty } from 'lodash';
import { Tooltip, Spin } from 'choerodon-ui';
import { Table, DataSet, Modal, Button, Form, NumberField } from 'choerodon-ui/pro';
import analyze from 'rgbaster';

import { getCurrentOrganizationId, getResponse, getCurrentTenant } from 'utils/utils';
import intl from 'utils/intl';
import { saveBannerListService, saveBannerSpeed } from '@/services/mallHomeConfigService';

import ComContent from '../../common/ComContent';
import { DeleteButton } from '../../common/buttons';
import Banner from './Banner';
import { tableds, configFormDs } from './tableds';
import styles from './index.less';
import { deleteCofirmModal } from '../../common/modals';

function EditCustomBar(props) {
  const {
    dispatch,
    mallHome: { currentRole, mallType, purchase, lovBatch, bannerSpeedObj },
    modal,
    fetchListLoading,
  } = props;
  const [bannerList, setBannerList] = useState([]);
  // 编辑banner
  function openBanner(record) {
    Modal.open({
      destroyOnClose: true,
      title: intl.get(`small.mallHomePlate.view.banner.edit`).d('编辑Banner'),
      mask: true,
      okText: intl.get('small.common.button.save').d('保存'),
      closable: true,
      style: { width: 380 },
      drawer: true,
      children: (
        <Banner
          getBackgroundColor={getBackgroundColor}
          validateColor={validateColor}
          setBannerList={setBannerList}
          record={record}
        />
      ),
    });
  }

  const formDs = useMemo(() => {
    return new DataSet(configFormDs());
  }, []);

  useEffect(() => {
    if (isEmpty(lovBatch?.bannerType)) {
      dispatch({
        type: 'mallHome/initQueryIdp',
      });
    }
    dispatch({
      type: 'mallHome/fetchBannerSpeed',
      payload: {
        tenantNum: getCurrentTenant().tenantNum,
        channel: mallType === 'sigl' ? 'PERSONAL' : 'ENTERPRISE',
      },
    }).then((res) => {
      if (isEmpty(res)) {
        formDs.current.set('speed', 3);
      } else {
        formDs.current.set('speed', res?.[0]?.bannerSpeed);
      }
    });
  }, []);

  modal.handleOk(() => {
    return handleSave();
  });

  async function handleSave() {
    let newList = [];
    if (currentRole === 'purchase') {
      newList = [
        ...bannerList.filter((p) => +p.bannerLevel === 0 && +p.groupAttribute === 0), // 租户级 企业购
        ...bannerList.filter((p) => +p.bannerLevel === 0 && +p.groupAttribute !== 0), // 租户级 会员购
      ];
      if (mallType === 'sigl') {
        // 会员购
        newList.push(
          ...bannerList.filter((p) => +p.bannerLevel !== 0 && +p.groupAttribute === 0), // 采买组织 企业购,
          ...tableDs
            .toData()
            .filter((p) => +p.bannerLevel !== 0 && +p.groupAttribute !== 0)
            .map((p, i) => ({ ...p, orderSeq: i, updateFlag: 1 })), // 采买组织 会员购,
          ...bannerList.filter(
            (p) => +p.bannerLevel !== 0 && +p.groupAttribute !== 0 && p.deleteFlag === 1
          )
        );
      } else {
        newList.push(
          ...bannerList.filter((p) => +p.bannerLevel !== 0 && +p.groupAttribute !== 0), // 采买组织 会员购,
          ...tableDs
            .toData()
            .filter((p) => +p.bannerLevel !== 0 && +p.groupAttribute === 0)
            .map((p, i) => ({ ...p, orderSeq: i, updateFlag: 1 })), // 采买组织 企业购,
          ...bannerList.filter(
            (p) => +p.bannerLevel !== 0 && +p.groupAttribute === 0 && p.deleteFlag === 1
          )
        );
      }
    } else {
      newList = [];
      if (mallType === 'sigl') {
        // 会员购
        newList.push(
          ...bannerList.filter((p) => +p.groupAttribute === 0), // 租户 企业购,
          ...tableDs
            .toData()
            .filter((p) => +p.groupAttribute !== 0)
            .map((p, i) => ({ ...p, orderSeq: i, updateFlag: 1 })), // 租户 会员购,
          ...bannerList.filter((p) => +p.groupAttribute !== 0 && p.deleteFlag === 1)
        );
      } else {
        newList.push(
          ...bannerList.filter((p) => +p.groupAttribute !== 0), // 租户 会员购,
          ...tableDs
            .toData()
            .filter((p) => +p.groupAttribute === 0)
            .map((p, i) => ({ ...p, orderSeq: i, updateFlag: 1 })), // 租户 企业购,
          ...bannerList.filter((p) => +p.groupAttribute === 0 && p.deleteFlag === 1)
        );
      }
    }
    getResponse(
      await saveBannerSpeed({
        ...bannerSpeedObj,
        tenantNum: getCurrentTenant().tenantNum,
        channel: mallType === 'sigl' ? 'PERSONAL' : 'ENTERPRISE',
        bannerSpeed: formDs.current.get('speed'),
      })
    );
    const res = getResponse(await saveBannerListService(newList));
    return res;
  }

  const tableDs = useMemo(() => {
    return new DataSet(tableds({currentRole}));
  }, []);

  useEffect(() => {
    fetchList();
  }, []);

  useEffect(() => {
    // let list = [];
    // list = [
    //   ...bannerList.filter(p => +p.bannerLevel === 0 && +p.groupAttribute === 0), // 租户级 企业购
    //   ...bannerList.filter(p => +p.bannerLevel === 0 && +p.groupAttribute !== 0), // 租户级 会员购
    //   ...bannerList.filter(p => +p.bannerLevel !== 0 && +p.groupAttribute === 0), // 采买组织 企业购
    //   ...bannerList.filter(p => +p.bannerLevel !== 0 && +p.groupAttribute !== 0), // 采买组织 会员购
    // ];
    tableDs.loadData(
      bannerList
        .filter((p) => p.deleteFlag !== 1 && p.groupAttribute === (mallType === 'sigl' ? 1 : 0))
        .map((p, i) => ({ ...p, lineNum: i + 1 }))
    );
    tableDs.forEach((p) => {
      if (!p.get('defaultBackgroundColor') && p.get('imageUrl')) {
        getBackgroundColor(p.get('imageUrl')).then((color) => {
          p.set('defaultBackgroundColor', validateColor(color));
        });
      }
    });
  }, [bannerList]);

  function validateColor(r) {
    if (r[0].color === 'rgb(255,255,255)' && Math.abs(r[0].count - r[1].count) < 3100) {
      return r[1].color;
    } else {
      return r[0].color;
    }
  }

  function getBackgroundColor(url) {
    return analyze(`${url}?t=${new Date().getTime()}`, {
      scale: 0.6,
      ignore: [],
    });
  }

  function fetchList() {
    dispatch({
      type: 'mallHome/fetchBanner',
      payload: {
        bannerLevel: currentRole === 'tenant' ? '0' : null,
        isPreview: 1,
        tenantId: getCurrentOrganizationId(),
        unitId: purchase.unitId,
        filterFlag: 1,
      },
    }).then((res) => {
      if (res) {
        setBannerList(res);
      }
    });
  }

  // 批量删除
  function handleDelete() {
    deleteCofirmModal({
      onOk: () => {
        const data = tableDs.map(record => {
          if(record.isSelected) {
            return {...record.toData(), deleteFlag: 1};
          }
          return record.toData();
        });
        setBannerList(data);
      },
    });
  }

  const columns = [
    {
      name: 'lineNum',
      width: 60,
    },
    {
      name: 'bannerName',
      renderer: ({ record, value }) => (
        <Tooltip
          title={
              currentRole === 'purchase' && record.get('bannerLevel') === '0'
                ? intl
                    .get('small.mallHomeConfig.view.changeDelBanner.warning')
                    .d('租户分配的Banner不可修改、删除')
                : null
            }
        >
          <Button

            funcType='link'
            onClick={() => openBanner(record)}
            disabled={currentRole === 'purchase' && record.get('bannerLevel') === '0'}
          >
            {value}
          </Button>
        </Tooltip>
      ),
    },
    {
      name: 'bannerLevel',
      renderer: ({ record }) =>
        record.get('bannerLevel') === '0'
          ? intl.get('small.common.edit.banner.tenant').d('租户')
          : intl.get('small.common.edit.banner.purchase.orgnization').d('采买组织'),
    },
    {
      name: 'productGroupName',
      width: 178,
      renderer: ({ record }) => {
        return lovBatch?.bannerType?.find(r => +r.value === +record.get('bannerType'))?.meaning;
      },
    },
    // {
    //   name: 'operate',
    //   width: 136,
    //   renderer: ({ record }) => {
    //     return (
    //       <Tooltip
    //         title={
    //           currentRole === 'purchase' && record.get('bannerLevel') === '0'
    //             ? intl
    //                 .get('small.mallHomeConfig.view.changeDelBanner.warning')
    //                 .d('租户分配的Banner不可修改、删除')
    //             : null
    //         }
    //       >
    //         <div className="operate">
    //           <a
    //             onClick={() => openBanner(record)}
    //             disabled={currentRole === 'purchase' && record.get('bannerLevel') === '0'}
    //           >
    //             {intl.get('hzero.common.button.edit').d('编辑')}
    //           </a>

    //           <Popconfirm
    //             placement="topRight"
    //             title={intl.get('small.common.view.confirmDelete').d('确认删除？')}
    //             onConfirm={() => {
    //               const data = record.toData();
    //               setBannerList(list => {
    //                 return list.map(p => {
    //                   if ((p.bannerId || p.uuid) === (data.bannerId || data.uuid)) {
    //                     return { ...p, deleteFlag: 1 };
    //                   } else {
    //                     return p;
    //                   }
    //                 });
    //               });
    //             }}
    //           >
    //             <a disabled={currentRole === 'purchase' && record.get('bannerLevel') === '0'}>
    //               {intl.get('hzero.common.btn.delete').d('删除')}
    //             </a>
    //           </Popconfirm>
    //         </div>
    //       </Tooltip>
    //     );
    //   },
    // },
  ];

  function createBanner() {
    Modal.open({
      title: intl.get(`small.mallHomePlate.view.banner.create`).d('新建Banner'),
      drawer: true,
      okText: intl.get('small.common.button.save').d('保存'),
      children: (
        <Banner
          getBackgroundColor={getBackgroundColor}
          validateColor={validateColor}
          setBannerList={setBannerList}
          dataSet={tableDs}
        />
      ),
      style: { width: 380 },
    });
  }

  function handleDragEnd() {}

  function onDragEndBefore(dataSet, _, resultDrag) {
    if (!resultDrag.destination) return false;
    const data = dataSet.toData();
    const {
      source: { index },
      destination: { index: dindex },
    } = resultDrag;
    if (data[index].bannerLevel === '0' && currentRole === 'purchase') {
      return false;
    } else if (data[dindex].bannerLevel === '0' && currentRole === 'purchase') {
      return false;
    } else {
      return true;
    }
  }

  return (
    <>
      {currentRole === 'tenant' ? (
        <>
          <ComContent
            title={intl.get('small.mallHomeConfig.view.banner.title1').d('Banner滚动速度')}
            desc={intl
              .get('small.mallHomeConfig.view.banner.desc1')
              .d('可对Banner的滚动播报速度进行配置，默认3s')}
          >
            <Form columns={2} dataSet={formDs} labelWidth="auto" labelLayout="float">
              <NumberField name="speed" />
            </Form>
          </ComContent>
          <ComContent
            title={intl.get('small.mallHomeConfig.view.banner.title2').d('Banner列表')}
            desc={intl
              .get('small.mallHomeConfig.view.tenantBanner.max')
              .d(
                '可用于租户对Banner内容进行配置,租户级banner最多可创建10条,可拖拽对Banner进行排序。'
              )}
          >
            <div className={styles.content}>
              <Spin spinning={fetchListLoading}>
                <Table
                  customizedCode='BANNER_LIST_TABLE'
                  dragColumnAlign="left"
                  dataSet={tableDs}
                  columns={columns}
                  rowDraggable
                  onDragEnd={handleDragEnd}
                  onDragEndBefore={onDragEndBefore}
                  buttons={[
                    <Button
                      color="primary"
                      funcType="flat"
                      onClick={() => createBanner()}
                      icon="playlist_add"
                    >
                      {intl.get('hzero.common.button.add').d('新增')}
                    </Button>,
                    <DeleteButton dataSet={tableDs} onClick={() => handleDelete()} />,
                  ]}
                />
              </Spin>
            </div>
          </ComContent>
        </>
      ) : (
        <div className={styles.content}>
          <p className='des'>
            {intl
              .get('small.mallHomeConfig.view.Banner.max')
              .d(
                '商城主站仅展示前10条banner信息，租户分配的banner信息优先级大于采买组织,可拖拽对Banner进行排序。'
              )}
          </p>
          <Spin spinning={fetchListLoading}>
            <Table
              customizedCode='BANNER_LIST_TABLE'
              dragColumnAlign="left"
              dataSet={tableDs}
              columns={columns}
              rowDraggable
              onDragEnd={handleDragEnd}
              onDragEndBefore={onDragEndBefore}
              buttons={[
                <Button
                  color="primary"
                  funcType="flat"
                  onClick={() => createBanner()}
                  icon="playlist_add"
                >
                  {intl.get('hzero.common.button.add').d('新增')}
                </Button>,
                <DeleteButton dataSet={tableDs} onClick={() => handleDelete()} />,
              ]}
            />
          </Spin>
        </div>
      )}
    </>
  );
}

export default compose(
  connect(({ mallHome, loading }) => ({
    mallHome,
    fetchListLoading: loading.effects['mallHome/fetchBanner'],
  }))
)(EditCustomBar);
