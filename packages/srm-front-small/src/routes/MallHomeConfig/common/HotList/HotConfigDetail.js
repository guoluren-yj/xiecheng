/* eslint-disable prefer-destructuring */
import React, { useMemo, useEffect } from 'react';
import {
  Button,
  Icon,
  Form,
  Select,
  ColorPicker,
  IntlField,
  TextField,
  DataSet,
  Lov,
  Modal,
} from 'choerodon-ui/pro';
import { connect } from 'dva';
import { Observer } from 'mobx-react';
import classNames from 'classnames';

import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { STRICT_URL } from 'utils/regExp';

import nodata from '@/assets/no_result.svg';
import ComContent from '../ComContent';
import styles from './index.less';

function HotConfigDetail({
  tableDs,
  dataSet,
  primaryColor,
  modal,
  groupAttribute,
  headerType,
  headerId,
  customType,
  mallHome: { currentRole, purchase },
}) {
  const hotDs = useMemo(() => new DataSet({
    forceValidate: true,
    dataToJSON: 'all',
    fields: [
      {
        name: 'hotZoneName',
        label: intl.get('small.common.model.hotName').d('热区名称'),
        type: 'intl',
        required: true,
      },
      {
        name: 'relationType',
        label: intl.get('small.common.model.relationType').d('关联类型'),
        required: true,
        type: 'number',
        lookupCode: 'SMAL.HOT_ZONE_TYPE',
      },
      {
        name: 'linkUrl',
        label: intl.get('small.mallHomeConfig.create.fileds.quick.links').d('快速链接'),
        pattern: STRICT_URL,
        dynamicProps: {
          required: ({ record }) => {
            return record.get('relationType') === 3;
          },
          pattern: ({ record }) => {
            return record.get('relationType') === 3 && STRICT_URL;
          },
        },
      },
      {
        name: 'productGroupLov',
        label: intl.get('small.mallHomeConfig.view.choose.productsRecom').d('选择商品推荐列表'),
        type: 'object',
        lovCode: 'SMAL.PRODUCT_GROUP_LIST',
        lovPara: {
          belongType: currentRole === 'purchase' ? 1 : 0,
          unitId: purchase.unitId,
          groupAttribute,
        },
        dynamicProps: {
          required: ({ record }) => {
            return record.get('relationType') === 4;
          },
        },
      },
      {
        name: 'productGroupId',
        bind: 'productGroupLov.groupId',
      },
      {
        name: 'productGroupName',
        bind: 'productGroupLov.groupName',
      },
      {
        name: 'hotZoneColor',
        label: intl.get('small.common.model.hotPointsColor').d('热区颜色'),
        required: true,
        defaultValue: '',
      },
      {
        name: 'xaxis',
        type: 'number',
      },
      {
        name: 'yaxis',
        type: 'number',
      },
      {
        name: 'hotZoneSize',
        required: true,
        label: intl.get('small.common.model.hotZoneSize').d('热区尺寸'),
        lookupCode: 'SMAL.HOT_ZONE_SIZE',
        transformResponse: (value) => {
          return value || 'default';
        },
        transformRequest: (value) => {
          return value || 'default';
        },
      },
    ],
  }), []);

  const SIZE_LIST = [
    {
      hotZoneSize: 'default',
      hotContainWidth: 72, // 容器宽
      sizeStep: 5, // 热点环距
      offset: 11, // 定位偏移量(宽度的一半)
    },
    {
      hotZoneSize: 'small',
      hotContainWidth: 48,
      sizeStep: 4,
      offset: 8,
    },
  ];

  useEffect(() => {
    modal.update({
      onOk: handleOK,
    });
    if(dataSet.current) {
      const hotZoneList = dataSet.current.get('hotZoneList') || [];
      const data = hotZoneList.filter(n => n.deleteFlag !== 1);
      hotDs.loadData(data);
    }
  }, [dataSet]);

  const hotPointStatusList = [
    {
      name: intl.get('small.common.view.hotStatus.selected').d('已选中'),
      background: 'rgba(0,184,204,0.10)',
      border: '1px dashed #00B8CC',
    },
    {
      name: intl.get('small.common.view.hotStatus.noSelecte').d('未选中'),
      background: 'rgba(29,33,41,0.10)',
      border: '1px dashed #868D9C',
    },
    {
      name: intl.get('small.common.view.hotStatus.error').d('报错'),
      background: ' rgba(230,67,34,0.10)',
      border: '1px dashed #E64322',
    },
  ];

  const { imgWidth, imgHeight } = [
    // banner
    {
      imgWidth: 810,
      imgHeight: 400,
      headerType: 1,
    },
    // 竖图
    {
      imgWidth: 230,
      imgHeight: 686,
      headerType: 2,
      customType: 2,
    },
    // 横图
    {
      imgWidth: 1190 * 0.65,
      imgHeight: 340 * 0.65,
      headerType: 2,
      customType: 3,
    },
  ].find(n => n.headerType === headerType && n.customType === customType);

  // 校验热区没有交叉
  function validaHotNotIntersect({currentX, currentY, type}) {
    const { hotContainWidth: currentHotWidth } = SIZE_LIST.find(n => n.hotZoneSize === hotDs.current?.get('hotZoneSize')) || {};
    const flag = hotDs.every(record => {
      const { xaxis, yaxis, hotZoneSize = 'default' } = record.get(['xaxis', 'yaxis', 'hotZoneSize']);
      const { hotContainWidth } = SIZE_LIST.find(n => n.hotZoneSize === hotZoneSize) || {};
      const minHotsOffset = (currentHotWidth + hotContainWidth) / 2;
      const offsetX = Math.abs(currentX - xaxis) - minHotsOffset; // 72是热区宽
      const offsetY = Math.abs(currentY - yaxis) - minHotsOffset;
      // 判断热区是否交叉并且热区需要在图片范围内。 如果不是新建,首先排除自己
      const min = hotContainWidth / 2;
      const maxX = imgWidth - min;
      const maxY = imgHeight - min;
      // 图片边界校验
      const borderValide = currentX > min && currentX < maxX && currentY > min && currentY < maxY;
      if(type === 'create') {
        return offsetX > 0 || offsetY > 0;
      } else {
        return record.isCurrent ? borderValide : offsetX > 0 || offsetY > 0;
      }
    });
    return flag;
  }

  // 新建热区
  function handleCreateHot() {
    // 图片中心点
    const flag = validaHotNotIntersect({currentX: imgWidth/2, currentY: imgHeight/2, type: 'create'});
    if (flag) {
      hotDs.create({
        hotZoneSize: 'default',
        hotZoneColor: primaryColor,
        xaxis: imgWidth / 2,
        yaxis: imgHeight / 2,
        groupAttribute,
        tenantId: getCurrentOrganizationId(),
        headerType,
        headerId,
      });
    }
  }

  // 按下鼠标选中
  function handleMouseDown(e) {
    const currentPointRecord = hotDs.find((record) => record.id === +e.target.id);
    if(currentPointRecord) {
      hotDs.current = currentPointRecord;
    }
  }

  // 拖动鼠标移动
  function handleMouseMove(e) {
    // 鼠标左键按下
    if(e.buttons === 1) {
      e.stopPropagation();
      const modalOffsetLeft = window.innerWidth - document.getElementById('hot-config-detail').clientWidth;
      const imgContainer = document.querySelector('.hot-img-container');
      const { clientX, clientY } = e;
      const { scrollTop, clientWidth, offsetWidth } = document.querySelector('.hot-config-modal .c7n-pro-modal-body');
      // y轴滚动条宽度
      const scrollYWidth = offsetWidth - clientWidth;
      const currentX = clientX - modalOffsetLeft - imgContainer.offsetLeft + scrollYWidth;
      const currentY = clientY - imgContainer.offsetTop + scrollTop;
      const flag = validaHotNotIntersect({currentX, currentY});
      if(flag) {
        hotDs.current.set({
          xaxis: currentX,
          yaxis: currentY,
        });
      }
    }
  }

  // 删除热点
  function handleHotDelete(record) {
    Modal.confirm({
      title: intl.get('small.common.model.tips').d('提示'),
      children: intl
        .get('small.common.view.hotDelete.confirm', {
          value: record.get('hotZoneName') || '',
        })
        .d(`确定要删除热区“${record.get('hotZoneName') || ''}”吗？`),
      onOk: () => {
        if (record.status !== 'add') {
          record.set('deleteFlag', 1);
        }
        hotDs.remove(record);
      },
      border: false,
    });
  }

  // 保存
  async function handleOK() {
    const flag = await hotDs.validate();
    if(flag) {
      const hotZoneList = hotDs.toJSONData();
      const tableData = hotZoneList.filter(n => n.deleteFlag !== 1);
      dataSet.current.set('hotZoneList', hotZoneList);
      tableDs.loadData(tableData);
    } else {
      // 重置报错状态
      hotDs.forEach(record => {
        record.setState('error', false);
      });
      const errorRecords = hotDs.getValidationErrors().map(n => n.record);
      hotDs.current = errorRecords[0];
      errorRecords.forEach(record => {
        record.setState('error', true);
      });
      return false;
    }
  }

  return (
    <div id="hot-config-detail" className={styles['hot-config-detail']}>
      <div className='hot-left'>
        <div className='hot-create-container'>
          <Button
            style={{ height: 24, marginRight: 4 }}
            icon='highlight_alt'
            color="primary"
            funcType="link"
            onClick={() => handleCreateHot()}
            help={intl.get('small.common.view.edit.help').d('点击后画布正中会出现对应热区，可拖拽热区到指定区域进行设置，请注意热区不支持重叠，当画布正中已出现热区，需拖拽此热区到其他区域后再新建')}
          >
            {intl.get('small.common.button.edit.createHot').d('新建热区')}
          </Button>
          <div className='hot-point-status'>
            {hotPointStatusList.map(n => (
              <div className='status-item'>
                <div className='status-item-color' style={{background: n.background, border: n.border}} />
                <span>{n.name}</span>
              </div>
            ))}
          </div>
        </div>
        <div className='hot-img-content'>
          <div className='hot-img-container'>
            <img style={{ width: imgWidth, height: imgHeight, pointerEvents: 'none' }} src={dataSet?.current?.get('imageUrl')} alt="" />
            <Observer>
              {() => (
              hotDs.map(record => {
                const { xaxis, yaxis, hotZoneColor, hotZoneSize } = record.get(['xaxis', 'yaxis', 'hotZoneColor', 'hotZoneSize']);
                const { sizeStep, offset } = SIZE_LIST.find(n => n.hotZoneSize === hotZoneSize) || {};
                return (
                  <div
                    id={record.id}
                    className={classNames({
                      'hot-point': true,
                      'hot-point-active': record.isCurrent,
                      'hot-point-error': record.getState('error'),
                      'hot-point-small': hotZoneSize === 'small',
                    })}
                    style={{
                      left: xaxis - offset,
                      top: yaxis - offset,
                      backgroundColor: hotZoneColor,
                      border: `${sizeStep}px solid ${hotZoneColor}59`,
                      outline: `${sizeStep}px solid ${hotZoneColor}26`,
                    }}
                    onMouseDown={(e) => handleMouseDown(e)}
                    onMouseMove={(e) => handleMouseMove(e)}
                  >
                    <div className='point-delete' onClick={() => handleHotDelete(record)} />
                    {record.getState('error') && <div className='point-error'><Icon type="warning" /></div>}
                  </div>
                );
              })
            )}
            </Observer>
          </div>
        </div>
      </div>
      <div className='hot-right'>
        <Observer>
          {() =>
            hotDs.current ? (
              <>
                <ComContent
                  title={intl.get('small.common.button.edit.hotConfig').d('热区设置')}
                  style={{ marginBottom: 16 }}
                />
                <Form dataSet={hotDs} labelLayout="float">
                  <IntlField name="hotZoneName" />
                  <Select name='relationType' />
                  {hotDs.current.get('relationType') === 3 && <TextField name="linkUrl" />}
                  {hotDs.current.get('relationType') === 4 && <Lov name="productGroupLov" />}
                  <ColorPicker name="hotZoneColor" />
                  <Select name="hotZoneSize" />
                </Form>
              </>
            ) : (
              <div className='no-data'>
                <img src={nodata} style={{width: 52, height: 58}} alt="" />
                <p>{intl.get(`small.common.view.hot.noData`).d('请在左侧画布新建/选中热区')}</p>
              </div>
            )
          }
        </Observer>

      </div>
    </div>
  );
}

export default connect(({ user = {}, mallHome }) => {
  const { currentUser: { themeConfigVO = {} } = {} } = user;
  const {
    colorCode, // 主题色
  } = themeConfigVO;
  return {primaryColor: colorCode || '#00B8CC', mallHome};
})(HotConfigDetail);
