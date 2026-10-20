/* eslint-disable react/no-array-index-key */
import React from 'react';
import { connect } from 'dva';
import { compose } from 'lodash';
import { Tooltip } from 'choerodon-ui';
import { Button, Modal, Form, DataSet, CheckBox } from 'choerodon-ui/pro';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import { fetchCustConfig } from '@/services/mallHomeConfigService';

import ComContent from '../../common/ComContent';
import styles from './index.less';

function Template(props) {
  const { role, dispatch, primaryColor} = props;

  async function handleOpenShowConfig() {
    const res = (await getResponse(fetchCustConfig())) || {};
    const formDs = new DataSet({
      fields: [
        {
          name: 'customBarShow',
          defaultValue: 'HIDE',
          trueValue: 'SHOW',
          falseValue: 'HIDE',
          required: true,
          label: intl.get('small.mallHomeConfig.view.customBarShowFlag').d('显示自定义栏'),
        },
      ],
    });
    formDs.create(res);
    const modal = Modal.open({
      title: intl.get('small.mallHomeConfig.view.customBarShowConfig').d('自定义栏显示设置'),
      drawer: true,
      size: 'small',
      okText: intl.get('small.common.button.save').d('保存'),
      children: (
        <Form labelLayout="float" dataSet={formDs} className="customBar-show-config">
          <p className='des'>
            {intl
              .get('small.mallHomeConfig.view.customShowConfigTitle')
              .d('可对没有商品权限的账户个性化配置自定义栏的显示方式')}
          </p>
          <CheckBox name="customBarShow" style={{height: 18}} />
        </Form>
      ),
      onOk: () => {
        dispatch({
          type: 'mallHomeConfig/saveCust',
          payload: formDs.toData()?.[0],
        }).then((resp) => {
          if (resp) {
            modal.close();
          }
        });
      },
    });
  }

  const tempList = [
    {
      key: 1,
      title: intl.get('small.common.view,template.moreProduct').d('多品模板'),
      className: 'more-product-img',
      tips: intl.get('small.common.view.apply.allType').d('适用所有类型'),
    },
    {
      key: 2,
      title: intl.get('small.common.view,template.one.moreProduct').d('一竖图多品模板'),
      className: 'onemore-product-img',
      tips: intl.get('small.common.view.apply.allType').d('适用所有类型'),
    },
    {
      key: 3,
      title: intl.get('small.common.view,template.onecome.moreProduct').d('一横图多品模板'),
      className: 'onecomemore-product-img',
      tips: intl.get('small.common.view.apply.allType').d('适用所有类型'),
    },
    {
      key: 4,
      title: intl.get('small.common.view,template.five.moreProduct').d('五图模板'),
      className: 'fivemore-product-img',
      tips: intl
        .get('small.common.view.fiveProduct.tips')
        .d('推荐使用于Logo墙的展示，通过点击Logo进入商品列表页，可自定义1-5个板块。'),
    },
  ];

  return (
    <div className={styles.content}>
      {role !== 'purchase' && (
        <ComContent
          title={intl.get('small.mallHomeConfig.view.zhuanqu').d('专区')}
          desc={intl
            .get('small.mallHomeConfig.view.zhuanqu.desc')
            .d('可直接鼠标悬停至专区的位置对其进行新增、修改、删除等操作')}
        >
          <div className="zhuanqu-img img-div" />
        </ComContent>
      )}
      <ComContent
        title="Banner"
        desc={intl
          .get('small.mallHomeConfig.view.tempBanner.desc')
          .d('可直接鼠标悬停到Banner的位置对其进行新增、修改、删除等操作')}
      >
        <div className="banner-img img-div" />
      </ComContent>
      {role !== 'purchase' && (
        <ComContent
          title={intl.get('small.mallHomeConfig.view.tempGonggao').d('公告栏')}
          desc={intl
            .get('small.mallHomeConfig.view.tempGonggao.desc')
            .d('可直接鼠标悬停至公告栏的位置对其进行新增、修改、删除等操作')}
        >
          <div className="gonggao-img img-div" />
        </ComContent>
      )}
      <ComContent
        titleStyle={{ display: 'flex' }}
        title={
          <>
            <span style={{ flex: 1 }}>{intl.get('small.common.view.customBar').d('自定义栏')}</span>
            {role === 'tenant' && (
              <Tooltip
                title={intl
                  .get('small.mallHomeConfig.view.customBarShowConfig')
                  .d('自定义栏显示设置')}
              >
                <Button
                  funcType="flat"
                  icon="predefine"
                  size="small"
                  onClick={() => handleOpenShowConfig()}
                />
              </Tooltip>
            )}
          </>
        }
        desc={intl
          .get('small.mallHomeConfig.view.tempCustom.desc')
          .d('可将模板拖拽至对应位置后，对其进行修改、删除')}
      >
        {tempList.map((tem, ind) => {
          return (
            <Droppable droppableId={tem.key}>
              {(provided) => (
                <div className="customBar-item">
                  <p className="p-label">
                    {tem.title}
                  </p>
                  <div {...provided.droppableProps} ref={provided.innerRef}>
                    <Draggable
                      key={`${tem.key}-${ind}`}
                      draggableId={`${tem.key}-${ind}`}
                      index={ind}
                    >
                      {(provide, snapsho) => {
                        return (
                          <div
                            ref={provide.innerRef}
                            {...provide.draggableProps}
                            {...provide.dragHandleProps}
                            style={{
                              border: '2px solid transparent',
                              borderColor: snapsho.isDragging ? primaryColor : 'transparent',
                              ...provide.draggableProps.style,
                            }}
                          >
                            <Tooltip title={tem.tips}>
                              <div className={`${tem.className} img-div`} />
                            </Tooltip>
                          </div>
                        );
                      }}
                    </Draggable>
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          );
        })}
      </ComContent>
    </div>
  );
}

export default compose(
  connect(({ mallHome }) => ({
    mallHome,
  })),
  connect(({ user = {} }) => {
    const { currentUser: { themeConfigVO = {} } = {} } = user;
    const {
      enableThemeConfig, // 是否开启了新主题
    colorCode, // 主题色
    fontFileId,
    } = themeConfigVO;
    if (enableThemeConfig) {
      return {
      primaryColor: colorCode,
      fontFamily: `font-${fontFileId}`, // 字体
    };
    }
    return {};
  })
)(Template);
