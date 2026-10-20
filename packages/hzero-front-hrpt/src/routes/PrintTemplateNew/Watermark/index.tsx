import React, { useRef, useEffect, useMemo } from 'react';
import { observer } from 'mobx-react';
import { Form, Select, TextArea, Tooltip, Output, Modal } from 'choerodon-ui/pro';
import { Icon } from 'choerodon-ui';
import { LabelLayout, ShowValidation } from 'choerodon-ui/pro/lib/form/enum';
import { ResizeType } from 'choerodon-ui/pro/lib/text-area/enum';
import intl from 'hzero-front/lib/utils/intl';
import notification from 'hzero-front/lib/utils/notification';

import LateralSelect from '../../../components/LateralSelect';
import PictureUpload from '../../../components/PictureUpload';
import styles from '../index.less';
import { createWatermark, checkIsImgType, checkIsSingleType, MarkContentItemType, parseExpressionParams } from './util';
import WaterMaskContent from './WaterMaskContent';

const { ItemGroup } = Form;

const Watermark = ({ dataSet }) => {
  const pictureRef = useRef<any>();
  const contentRef = useRef<any>();
  const previewContainer = useRef<any>();
  const previewFullScreenContainer = useRef<any>();
  const record = dataSet.current;
  const isImageType = record && ['TILE_IMAGE', 'IMAGE'].includes(record.get('watermarkConfig_.type'));
  const isSingleType = record && ['TEXT', 'IMAGE'].includes(record.get('watermarkConfig_.type'));
  const globalWatermarkDiv: any = useMemo(() => document.querySelectorAll('.mask_mark'), []);
  const globalWatermarkOpactiy = useMemo(() => 
    globalWatermarkDiv && globalWatermarkDiv[0] && globalWatermarkDiv[0].style.opacity,
  []);

  useEffect(() => {
    if (record) {
      record.set('watermarkConfig_.type', record.get('watermarkConfig.type'));
      record.set('watermarkConfig_.expression', record.get('watermarkConfig.expression'));
      record.set('watermarkConfig_.value', record.get('watermarkConfig.value'));
      record.set('watermarkConfig_.density', record.get('watermarkConfig.density'));
      record.set('watermarkConfig_.size', record.get('watermarkConfig.size'));
      record.set('watermarkConfig_.alpha', record.get('watermarkConfig.alpha'));
      record.set('watermarkConfig_.position', record.get('watermarkConfig.position'));
      record.set('watermarkConfig_.direction', record.get('watermarkConfig.direction'));
      if (!record.get('watermarkConfig_.type')) {
        record.set('watermarkConfig_.type', 'TILE_TEXT');
        record.set('watermarkConfig_.density', 'STANDARD');
        record.set('watermarkConfig_.size', 'STANDARD');
        record.set('watermarkConfig_.alpha', 'SOFT');
        record.set('watermarkConfig_.direction', 'RIGHT_UP');
      }
      if (record.get('watermarkConfig_.expression')) {
        const expression = record.get('watermarkConfig_.expression');
        const expressionParams = parseExpressionParams(expression)
        record.set('watermarkConfig_.expression', expressionParams);
        record.set('watermarkConfig_.expression_format',
            expressionParams.length
              ? expressionParams.map(item => item.type === MarkContentItemType.FIX ? item.value : item.meaning).join('')
              : undefined
        );
      } else {
        record.set('watermarkConfig_.expression_format', undefined);
      }
      // 加延时是为了处理图片类水印的宽高
      setTimeout(() => calcWatermark(record, false), 500);
    }
    dataSet.addEventListener('update', handleDsUpdate);

    const timer = setInterval(() => {
      if (globalWatermarkDiv && globalWatermarkDiv[0] && globalWatermarkDiv[0].style.opacity !== '0') {
        hideGlobalWatermarkOpactiy();
      }
    }, 50);
    return () => {
      clearInterval(timer);
      dataSet.removeEventListener('update', handleDsUpdate);
    };
  }, []);

  const hideGlobalWatermarkOpactiy = () => {
    if (globalWatermarkDiv && globalWatermarkDiv.length && globalWatermarkOpactiy) {
      globalWatermarkDiv.forEach(el =>  el.style.opacity = '0');
    }
  };

  const handleDsUpdate = ({ record, name, value, oldValue }) => {
    if (name === 'watermarkConfig_.type') {
      const isImgType = checkIsImgType(value);
      const isImgTypeOld = checkIsImgType(oldValue);
      const isSingleType = checkIsSingleType(value);
      record.init('watermarkConfig_.direction', isSingleType ? undefined : 'RIGHT_UP');
      record.init('watermarkConfig_.position', isSingleType ? 'CENTER' : undefined);
      if (isImgType !== isImgTypeOld) {
        record.init('watermarkConfig_.expression', undefined);
        record.init('watermarkConfig_.expression_format', undefined);
        record.init('watermarkConfig_.value', undefined);
      }
    }
    // 加延时是为了处理图片类水印的宽高
    setTimeout(() => calcWatermark(record, false), 500);
  };

  const calcWatermark = (record, fullScreen) => {
    const {
      'watermarkConfig_.type': type,
      'watermarkConfig_.expression_format': expression,
      'watermarkConfig_.value': value,
      'watermarkConfig_.density': density,
      'watermarkConfig_.size': size,
      'watermarkConfig_.alpha': alpha,
      'watermarkConfig_.position': position,
      'watermarkConfig_.direction': direction,
    } = record.get([
      'watermarkConfig_.type', 'watermarkConfig_.expression_format', 'watermarkConfig_.density',
      'watermarkConfig_.value', 'watermarkConfig_.size', 'watermarkConfig_.alpha',
      'watermarkConfig_.position', 'watermarkConfig_.direction',
    ]);
    const content = checkIsImgType(type) ? value : expression;
    let imageRatio = 1;
    if (pictureRef.current) {
      imageRatio = pictureRef.current.width / pictureRef.current.height;
    }
    createWatermark(
      fullScreen ? previewFullScreenContainer.current : previewContainer.current,
      { type, content, density, size, alpha, position, direction, scale: fullScreen ? 1 : 500 / window.innerWidth, imageRatio },
    );
  };

  const handleEditContent = () => {
    Modal.open({
      title: intl.get('hrpt.reportDesign.model.waterMask.content').d('水印内容'),
      bodyStyle: { padding: 0, height: 'calc(100vh - 2.06rem)' },
      style: { width: '800px' },
      children: (
        <WaterMaskContent record={record} name='watermarkConfig_.expression' contentRef={contentRef} />
      ),
      onOk: () => {
        if (contentRef.current && contentRef.current.submit) {
          let content = contentRef.current.submit();
          let result = '';
          if (content && content.length) {
            content = content.filter(item => item && item.value);
            if (content.length > 20) {
              notification.warning({
                message: intl.get('hrpt.reportDesign.model.waterMask.content.tooLong').d('变量字段与连续固定字符组合，最多支持20个，超出限制无法添加')
              });
              return false;
            }
            result =
              content  
                .map(item => item.type === MarkContentItemType.VAR ? item.meaning : item.value)
                .join('')
          }
          record.set('watermarkConfig_.expression', !content || !content.length ? undefined : content);
          record.set('watermarkConfig_.expression_format', result || undefined);
        }
      }
    });
  };

  const handleFullScreenPreview = () => {
    Modal.open({
      fullScreen: true,
      title: intl.get('hrpt.reportDesign.view.title.fullScreenPreview').d('全屏预览'),
      children: <FullScreenPreview containerRef={previewFullScreenContainer} record={record} onLoad={calcWatermark} />,
      footer: okBtn => okBtn,
    });
  };

  const previewRenderer = () => {
    return (
      <div className={styles['preview-container']}>
        <div ref={previewContainer} />
        <div>
          <Tooltip title={intl.get('hrpt.reportDesign.view.title.fullScreenPreview').d('全屏预览')}>
            <Icon
              type='zoom_out_map'
              style={{ cursor: 'pointer' }}
              onClick={handleFullScreenPreview}
            />
          </Tooltip>
        </div>
      </div>
    )
  };

  return (
    <Form dataSet={dataSet} columns={1} labelLayout={LabelLayout.float}>
      <Select name='watermarkConfig_.type' clearButton={false} getPopupContainer={() => document.querySelector('#root') as HTMLElement} />
      <ItemGroup compact className={styles['water-mask-item-group']} hidden={isImageType}>
        <TextArea
          readOnly
          style={{ pointerEvents: 'none' }}
          showValidation={ShowValidation.tooltip}
          name='watermarkConfig_.expression_format'
          label={intl.get('hrpt.reportDesign.model.waterMask.content').d('水印内容')}
          resize={ResizeType.vertical}
        />
        <Tooltip title={intl.get('hrpt.reportDesign.view.title.watermarkContentEdit').d('放大编辑，支持引用变量')}>
          <Icon
            type='zoom_out_map'
            style={{ cursor: 'pointer' }}
            onClick={handleEditContent}
          />
        </Tooltip>
      </ItemGroup>
      <PictureUpload
        name='watermarkConfig_.value'
        dataSet={dataSet}
        hidden={!isImageType}
        required
        label={(
          <>
            {intl.get('hrpt.reportDesign.model.waterMask.content').d('水印内容')}
            <Tooltip title={intl.get('hrpt.reportDesign.model.waterMask.image.help').d('支持选择.jpg、.png 的图片')}>
              <Icon type='help' style={{ marginLeft: '4px', verticalAlign: 'text-bottom', fontSize: '14px' }} />
            </Tooltip>
          </>  
        )}
      />
      {isSingleType && (
        <Select name='watermarkConfig_.position' clearButton={false}>
          <Select.Option value='CENTER'>{intl.get('hrpt.reportDesign.watermark.position.center').d('居中')}</Select.Option>
          <Select.Option value='TOP'>{intl.get('hrpt.reportDesign.watermark.position.top').d('顶部')}</Select.Option>
          <Select.Option value='BOTTOM'>{intl.get('hrpt.reportDesign.watermark.position.bottom').d('底部')}</Select.Option>
          <Select.Option value='LEFT'>{intl.get('hrpt.reportDesign.watermark.position.left').d('左侧')}</Select.Option>
          <Select.Option value='RIGHT'>{intl.get('hrpt.reportDesign.watermark.position.right').d('右侧')}</Select.Option>
        </Select>
      )}
      <LateralSelect
        name='watermarkConfig_.density'
        dataSet={dataSet}
        options={[
          { value: 'COMPACT', meaning: intl.get('hrpt.reportDesign.watermark.density.compact').d('紧凑') },
          { value: 'STANDARD', meaning: intl.get('hrpt.reportDesign.watermark.density.standard').d('标准') },
          { value: 'LOOSE', meaning: intl.get('hrpt.reportDesign.watermark.density.loose').d('宽松') }
        ]}
      />
      <LateralSelect
        name='watermarkConfig_.size'
        dataSet={dataSet}
        label={isImageType ? intl.get('hrpt.reportDesign.model.waterMask.imageSize').d('图片大小') : intl.get('hrpt.reportDesign.model.waterMask.fontSize').d('字体大小')}
        options={[
          { value: 'SMALLER', meaning: intl.get('hrpt.reportDesign.watermark.fontSize.small').d('更小') },
          { value: 'STANDARD', meaning: intl.get('hrpt.reportDesign.watermark.fontSize.standard').d('标准') },
          { value: 'BIGGER', meaning: intl.get('hrpt.reportDesign.watermark.fontSize.large').d('更大') }
        ]}
      />
      <LateralSelect
        name='watermarkConfig_.alpha'
        dataSet={dataSet}
        options={[
          { value: 'LIGHT', meaning: '10%' },
          { value: 'SOFT', meaning: '15%' },
          { value: 'TRANSLUCENT', meaning: '20%' }
        ]}
      />
      {!isSingleType && (
        <Select name='watermarkConfig_.direction' clearButton={false}>
          <Select.Option value='RIGHT_UP'>{intl.get('hrpt.reportDesign.watermark.tiltDirection.right').d('斜向右上')}</Select.Option>
          <Select.Option value='LEFT_UP'>{intl.get('hrpt.reportDesign.watermark.tiltDirection.left').d('斜向左上')}</Select.Option>
        </Select>
      )}
      <Output
        label={intl.get('hrpt.reportDesign.model.waterMask.preview').d('预览水印')}
        renderer={previewRenderer as any}
      />
      {isImageType && (
        <img
          src={dataSet.current ? dataSet.current.get('watermarkConfig_.value') : undefined}
          alt=''
          ref={pictureRef}
          style={{ display: 'none' }}
        />
      )}
    </Form>
  );
};

const FullScreenPreview = ({ containerRef, onLoad, record }) => {

  useEffect(() => {
    const timer = setInterval(() => {
      const height = containerRef.current.offsetHeight;
      if (height) {
        onLoad(record, true);
        clearInterval(timer);
      }
    }, 500);
  }, []);

  return (
    <div ref={containerRef} style={{ position: 'relative', height: '100%', width: '100%', userSelect: 'none', overflow: 'hidden' }} />
  )
};



export default observer(Watermark);