/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */
import React, { useEffect, useState } from 'react';
import { Tooltip } from 'hzero-ui';
import { Icon, Modal, Button } from 'choerodon-ui/pro';
import { connect } from 'dva';
import { compose, isEmpty } from 'lodash';
import classnames from 'classnames';
import { Droppable, Draggable } from 'react-beautiful-dnd';

import intl from 'utils/intl';

import LOGO from '@/assets/MallHomeConfig/logo-zy.svg';
import iconCatalogList from '@/assets/MallHomeConfig/icon_cataloglist.png';
// import gonggao from '@/assets/MallHomeConfig/gonggao.png';
import gonggaoEmpty from '@/assets/MallHomeConfig/gonggao_empty.png';
import userInfoTop from '@/assets/MallHomeConfig/userInfoTop.png';
import userinfo from '@/assets/MallHomeConfig/userinfo.png';
import userInfoBottom from '@/assets/MallHomeConfig/userInfoBottom.png';
import bannerPreview from '@/assets/MallHomeConfig/banner_preview.png';
import moreproductempty from '@/assets/MallHomeConfig/moreproduct_empty_preview.png';
import moreproduct from '@/assets/MallHomeConfig/moreproduct_preview.png';
import onemoreproductempty from '@/assets/MallHomeConfig/onemoreproduct_empty_preview.png';
import onemoreproduct from '@/assets/MallHomeConfig/onemoreproduct_preview.png';
import onecomemoreproductempty from '@/assets/MallHomeConfig/onecomemoreproduct_empty_preview.png';
import onecomemoreproduct from '@/assets/MallHomeConfig/onecomemoreproduct_preview.png';
import fivemoreproductempty from '@/assets/MallHomeConfig/fivemoreproduct_empty_preview.png';
import fivemoreproduct from '@/assets/MallHomeConfig/fivemoreproduct_preview.png';
import EmptyBottomInfoImg from '@/assets/MallHomeConfig/EmptyBottomInfoImg.png';
import BottomInfoImg0 from '@/assets/MallHomeConfig/BottomInfoImg0.png';
import BottomInfoImg1 from '@/assets/MallHomeConfig/BottomInfoImg1.png';
import CopyRight from '@/assets/MallHomeConfig/CopyRight.png';
import EmptyCopyRight from '@/assets/MallHomeConfig/EmptyCopyRight.png';

import colors from '../GlobalSetting/ColorConfig/colors';
import styles from './index.less';
import EditCustomBar from './EditCustomBar';
import EditBanner from './EditBanner';
import EditGonggao from './EditGonggao';
import EditZhuanqu from './EditZhuanqu';
import { deleteCofirmModal } from '../common/modals';

function RightContent(props) {
  const {
    mallHomeConfig: {
      topicColor,
      logoUrl,
      bottomEnable, // 底部栏
      pageBottomList,
      recordEnable, // 备案号
      bottomType,
      recordInformation,
    },
    mallHome,
    mallHome: { mallType, currentRole },
    dispatch,
  } = props;

  const customBarList = mallHome[`${mallType}customBarList`];
  const zhuanquList = mallHome[`${mallType}zhuanquList`];
  // const gonggaoList = mallHome[`${mallType}gonggaoList`];

  const primaryColor = colors[topicColor || 'A']['primary-color'];
  const [logoHeight, setLogoHeight] = useState(
    () => document.getElementById('small-top-bar')?.clientHeight
  );
  const resizeFn = () => {
    setLogoHeight(document.getElementById('small-top-bar')?.clientHeight);
  };

  useEffect(() => {
    window.addEventListener('resize', resizeFn);
    return () => {
      window.removeEventListener('resize', resizeFn);
    };
  }, []);

  useEffect(() => {
    // 需要提前加载专区的显示
    if (currentRole !== 'purchase') {
      dispatch({
        type: 'mallHome/fetchZhuanqu',
        payload: {
          belongType: 0,
          channel: mallType === 'sigl' ? 1 : 0,
          isPreview: 1,
        },
      });
    }
  }, []);

  function getCustomBarImg(customBar) {
    let img = moreproductempty;
    switch (customBar.customType) {
      case 1:
        img = isEmpty(customBar.customTagLineList) ? moreproductempty : moreproduct;
        break;
      case 2:
        img = isEmpty(customBar.customTagLineList) ? onemoreproductempty : onemoreproduct;
        break;
      case 3:
        img = isEmpty(customBar.customTagLineList) ? onecomemoreproductempty : onecomemoreproduct;
        break;
      case 4:
        img = isEmpty(customBar.customTagLineList) ? fivemoreproductempty : fivemoreproduct;
        break;
      default:
        break;
    }
    return img;
  }

  // 删除自定义栏
  function handleDeleteCustomBar(customBar) {
    const notChange = currentRole === 'purchase' && customBar.customLevel === '0';
    if (notChange) return;
    dispatch({
      type: 'mallHome/updateState',
      payload: {
        [`${mallType}customBarList`]: customBarList.map((c) => {
          if ((c.uuid || c.customId) === (customBar.uuid || customBar.customId)) {
            return { ...c, deleteFlag: 1 };
          } else {
            return c;
          }
        }),
      },
    });
  }

  // 编辑自定义栏
  function openEditCustomBar(customBar) {
    const notChange = currentRole === 'purchase' && customBar.customLevel === '0';
    if (notChange) return;
    Modal.open({
      destroyOnClose: true,
      title: intl.get(`small.mallHomePlate.view.customBar.edit`).d('编辑自定义栏'),
      mask: true,
      closable: true,
      style: { width: customBar?.customType === 4 ? 1090 : 380 },
      drawer: true,
      children: <EditCustomBar customBar={customBar} />,
    });
  }

  // 编辑banner
  function openBanner() {
    Modal.open({
      destroyOnClose: true,
      title: intl.get(`small.mallHomePlate.view.banner.list`).d('Banner列表'),
      mask: true,
      closable: true,
      style: { width: 742 },
      drawer: true,
      okText: intl.get('small.common.button.save').d('保存'),
      children: <EditBanner />,
    });
  }

  // 编辑gonggao
  function openGonggao() {
    const modal = Modal.open({
      destroyOnClose: true,
      title: intl.get(`small.mallHomePlate.view.gonggao.list`).d('公告列表'),
      mask: true,
      closable: true,
      style: { width: 1090 },
      drawer: true,
      footer: [
        <Button color="primary" onClick={() => modal.close()}>
          {intl.get('hzero.common.status.closed').d('关闭')}
        </Button>,
      ],
      children: <EditGonggao />,
    });
  }

  function openZhuanqu() {
    const modal = Modal.open({
      destroyOnClose: true,
      title: intl.get(`small.mallHomePlate.view.zhuanqu.list`).d('专区列表'),
      mask: true,
      closable: true,
      style: { width: 742 },
      drawer: true,
      footer: [
        <Button color="primary" onClick={() => modal.close()}>
          {intl.get('hzero.common.status.closed').d('关闭')}
        </Button>,
      ],
      children: <EditZhuanqu />,
    });
  }

  function getCustomBar(customBar) {
    const notChange = currentRole === 'purchase' && customBar.customLevel === '0';
    return (
      <div className="custom-bar-item" style={{ padding: `${logoHeight * 0.3 * 0.5}px 20px` }}>
        <p
          className="custom-bar-title"
          style={{ textAlign: customBar.location === '2' ? 'center' : 'left' }}
        >
          {customBar.location !== '2' && (
            <span
              style={{
                display: 'inline-block',
                backgroundColor: primaryColor,
                width: logoHeight * 0.3 * 0.3 * 0.3,
                height: logoHeight * 0.3 * 0.5,
                marginRight: 4,
              }}
            />
          )}
          {customBar.customName ? (
            <span
              style={{
                fontSize: logoHeight * 0.3 * 0.5,
                verticalAlign: 'text-bottom',
              }}
            >
              {customBar.customName}
            </span>
          ) : (
            <span
              style={{
                display: 'inline-block',
                backgroundColor: '#f0f0f0',
                width: logoHeight * 0.5,
                height: logoHeight * 0.3 * 0.5,
              }}
            />
          )}
          <Tooltip
            title={
              notChange
                ? intl
                  .get('small.mallHomeConfig.view.changeDel.warning')
                  .d('租户分配的自定义栏不可修改、删除')
                : null
            }
          >
            {notChange ? (
              <Icon
                className={classnames(['title-icon', { disabled: notChange }])}
                type="delete"
                style={{ right: 8 }}
              />
            ) : (
              <Icon
                className={classnames(['title-icon', { disabled: notChange }])}
                type="delete"
                style={{ right: 8 }}
                onClick={() => {
                    deleteCofirmModal({
                      onOk: () => {
                        handleDeleteCustomBar(customBar);
                      },
                    });
                  }}
              />
            )}
          </Tooltip>
          <Tooltip
            title={
              notChange
                ? intl
                  .get('small.mallHomeConfig.view.changeDel.warning')
                  .d('租户分配的自定义栏不可修改、删除')
                : null
            }
          >
            <Icon
              style={{ marginRight: 16, right: 24 }}
              className={classnames(['title-icon', { disabled: notChange }])}
              type="mode_edit"
              onClick={() => openEditCustomBar(customBar)}
            />
          </Tooltip>
        </p>
        <img style={{ width: '100%' }} alt="" src={getCustomBarImg(customBar)} />
      </div>
    );
  }

  return (
    <div className={styles.content}>
      <div id="small-top-bar" className="top-bar container">
        {!!logoHeight && (
          <img
            className="logo"
            alt=""
            src={logoUrl || LOGO}
            style={{ height: logoHeight * 0.22, top: logoHeight * 0.3 }}
          />
        )}
        <img
          onLoad={() => {
            setLogoHeight(document.getElementById('small-top-bar')?.clientHeight);
          }}
          className="bg-content"
          alt=""
          src={require(`@/assets/MallHomeConfig/search_${topicColor}.png`)}
        />
        {currentRole !== 'purchase' && (
          <div
            className="zhuanqu-content"
            style={{
              height: logoHeight * 0.4,
              width: logoHeight * 4.65,
              bottom: -logoHeight * 0.1,
              left: logoHeight * 1.25,
            }}
          >
            <img
              style={{ height: logoHeight * 0.16 }}
              className="zhuanqu-content-img"
              alt=""
              src={require(`@/assets/MallHomeConfig/zhuanqu-${zhuanquList?.length >= 7 ? 7 : zhuanquList?.length || 0
                }.png`)}
            />
            <Icon className="zhuanqu-edit-icon" type="mode_edit" onClick={openZhuanqu} />
          </div>
        )}
      </div>
      <div className="banner-bar">
        <div className="banner-bar-content container">
          <div className="banner-bar-left">
            <img style={{ width: '100%' }} alt="" src={iconCatalogList} />
          </div>
          <div className="banner-bar-center">
            <img style={{ width: '100%' }} alt="" src={bannerPreview} />
            <Icon
              style={{ marginRight: 8 }}
              className="edit-icon"
              type="mode_edit"
              onClick={openBanner}
            />
          </div>
          <div className="banner-bar-right">
            {currentRole === 'purchase' ? (
              <img src={userinfo} alt="" style={{ width: '100%' }} />
            ) : (
              <>
                <img style={{ width: '100%' }} alt="" src={userInfoTop} />
                <div className="gonggao">
                  <img
                    style={{ width: '100%' }}
                    alt=""
                    // src={isEmpty(gonggaoList) ? gonggaoEmpty : gonggao}
                    src={gonggaoEmpty}
                  />
                  <Icon className="gonggao-edit-icon" type="mode_edit" onClick={openGonggao} />
                </div>
                <img style={{ width: '100%' }} alt="" src={userInfoBottom} />
              </>
            )}
          </div>
        </div>
      </div>
      <Droppable droppableId="custom-bar">
        {(provided, snapsho) => {
          return (
            <div
              style={{
                borderWidth: snapsho.isDraggingOver ? '2px': 'none',
                borderStyle: snapsho.isDraggingOver ?'dashed': 'none',
                borderColor: primaryColor,
                // border: snapsho.isDraggingOver ? '2px dashed' : 'none',
                padding: isEmpty(customBarList) ? 50 : 0,
              }}
              className={classnames([
                'custom-bar',
                'container',
                { isDragging: snapsho.isDragging },
              ])}
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {currentRole === 'purchase' &&
                customBarList
                  .filter((c) => c.deleteFlag !== 1 && c.customLevel === '0')
                  .map((customBar) => {
                    return getCustomBar(customBar);
                  })}
              {customBarList
                .filter((c) => {
                  if (currentRole === 'purchase') {
                    return c.deleteFlag !== 1 && c.customLevel !== '0';
                  } else {
                    return c.deleteFlag !== 1;
                  }
                })
                .map((customBar, index) => {
                  return (
                    <>
                      <Draggable
                        key={customBar.uuid || customBar.customId}
                        draggableId={customBar.uuid || `${customBar.customId}`}
                        index={index}
                      >
                        {(provide) => {
                          return (
                            <div
                              ref={provide.innerRef}
                              {...provide.draggableProps}
                              {...provide.dragHandleProps}
                            >
                              {getCustomBar(customBar)}
                            </div>
                          );
                        }}
                      </Draggable>
                      {provided.placeholder}
                    </>
                  );
                })}
            </div>
          );
        }}
      </Droppable>
      {bottomEnable === 1 && (
        <div className="bottom-info-bar container">
          <img
            className="bottom-info"
            alt=""
            src={
              isEmpty(pageBottomList)
                ? EmptyBottomInfoImg
                : bottomType === 1
                  ? BottomInfoImg1
                  : BottomInfoImg0
            }
            style={{ height: logoHeight * 1.5 }}
          />
        </div>
      )}
      {recordEnable === 1 && (
        <div className="copy-right-bar container">
          <img
            className="bottom-info"
            alt=""
            src={isEmpty(recordInformation) ? EmptyCopyRight : CopyRight}
            style={{ height: logoHeight * 0.5 }}
          />
        </div>
      )}
    </div>
  );
}

export default compose(
  connect(({ mallHomeConfig, mallHome, loading }) => ({
    mallHomeConfig,
    mallHome,
    loading: loading.effects['mallHomeConfig/save'],
  }))
)(RightContent);

