import React, { useRef, useMemo, useEffect } from 'react';
import { Form, Switch, TextArea, TextField, DataSet, Select, Tooltip, Attachment, Button, NumberField, Modal } from 'choerodon-ui/pro';
import { Icon, Alert } from 'choerodon-ui';
import { observer } from 'mobx-react';
import { isEmpty } from 'lodash';
import intl from 'hzero-front/lib/utils/intl';
import { isTenantRoleLevel } from 'hzero-front/lib/utils/utils';
import notification from 'hzero-front/lib/utils/notification';
import { ShowValidation } from 'choerodon-ui/pro/lib/form/enum';

import LateralSelect from '@/components/LateralSelect'
import PictureUpload from '@/components/PictureUpload';
import styles from './index.less';
import WaterMaskContent from './WaterMaskContent';
import { Density, TEXT_SIZE, IMAGE_SIZE, MarkClassName, checkIsSingleType, checkIsImgType, createWatermark, MarkContentItemType, parseExpressionParams } from './util';
import { filterHeaderNodeFields, parsePxToMm } from '../../utils/utils';

const { ItemGroup } = Form;

function WaterMask({ hidePaneContent, sheet, enablePreview = true, treeDs }) {
  const templateFields = useMemo(() => treeDs ? filterHeaderNodeFields(treeDs.toData()) : [],[treeDs]);

  const contentRef = useRef();
  const pictureRef = useRef();
  const formDs = useMemo(() => {
    return new DataSet({
      fields: [
        {
          name: 'enableFlag',
          label: intl.get('hrpt.reportDesign.model.waterMask.enabled').d('开启水印'),
          defaultValue: false,
        },
        {
          name: 'type',
          label: intl.get('hrpt.reportDesign.model.waterMask.type').d('水印类型'),
          lookupCode: 'HRPT.WATER_MASK_TYPE',
        },
        {
          name: 'value',
        },
        {
          name: 'expression',
          dynamicProps: {
            required: ({ record }) => {
              return record && record.get('enableFlag') && !checkIsImgType(record.get('type'))
            },
          },
        },
        {
          name: 'expression_format',
          dynamicProps: {
            required: ({ record }) => {
              return record && record.get('enableFlag') && !checkIsImgType(record.get('type'))
            },
          },
        },
        {
          name: 'density',
          label: intl.get('hrpt.reportDesign.model.waterMask.density').d('水印密度'),
        },
        {
          name: 'size',
        },
        {
          name: 'alpha',
          label: intl.get('hrpt.reportDesign.model.waterMask.alpha').d('不透明度'),
        },
        {
          name: 'position',
          label: intl.get('hrpt.reportDesign.model.waterMask.position').d('水印位置'),
        },
        {
          name: 'direction',
          label: intl.get('hrpt.reportDesign.model.waterMask.tiltDirection').d('倾斜方向'),
        },
      ],
      events: {
        update: ({ name, record, value, oldValue }) => {
          if (name === 'enableFlag') {
            record.init('type', value ? 'TILE_TEXT' : undefined);
            record.init('expression', undefined);
            record.init('expression_format', undefined);
            record.init('value', undefined);
            record.init('density', value ? 'STANDARD' : undefined);
            record.init('size', value ? 'STANDARD' : undefined);
            record.init('alpha', value ? 'SOFT' : undefined);
            record.init('position', undefined);
            record.init('direction', 'RIGHT_UP');
          } else if (name === 'type') {
            const isImgType = checkIsImgType(value);
            const isImgTypeOld = checkIsImgType(oldValue);
            const isSingleType = checkIsSingleType(value);
            if (isImgType !== isImgTypeOld) {
              record.init('expression', undefined);
              record.init('expression_format', undefined);
              record.init('value', undefined);
            }
            record.init('position',  isSingleType ? 'CENTER' : undefined);
            record.init('direction', isSingleType ? undefined : 'RIGHT_UP');
          }
          // 加延时是为了处理图片类水印的宽高
          setTimeout(() => calcWatermark(record), 500);
        },
      }
    });
  }, []);

  useEffect(() => {
    if (sheet && sheet.getWaterMarkConfig) {
      const waterMarkConfig = sheet.getWaterMarkConfig() || {};
      const record = formDs.create(waterMarkConfig);
      const { expression } = waterMarkConfig;
      if (expression) {
        const expressionParams = parseExpressionParams(expression, { templateFields });
        record.init('expression', expressionParams);
        record.init('expression_format',
            expressionParams.length
              ? expressionParams.map(item => item.type === MarkContentItemType.FIX ? item.value : item.meaning).join('')
              : undefined
        );
      }
      record.status = 'update';
      // 加延时是为了处理图片类水印的宽高
      setTimeout(() => calcWatermark(record), 500);
    }
  }, [templateFields]);

  const isImageType = formDs.current && checkIsImgType(formDs.current.get('type'));
  const isSingleType = formDs.current && ['TEXT', 'IMAGE'].includes(formDs.current.get('type'));

  const calcWatermark = (record) => {
    const {
      enableFlag,
      type,
      expression_format,
      value,
      density,
      size,
      alpha,
      position,
      direction,
    } = record.get([
      'enableFlag', 'type', 'expression_format', 'density',
      'value', 'size', 'alpha',
      'position', 'direction',
    ]);
    const isImg = checkIsImgType(type);
    const content = isImg ? value : expression_format;
    let imageRatio = 1;
    const container = createWatermarkContainer();
    if (isImg) {
      const img = document.createElement('img');
      img.src = content;
      img.style.display = 'none';
      img.onload = () => {
        imageRatio = img.width / img.height;
        createWatermark(
          container,
         { enableFlag, type, content, density, size, alpha, position, direction, scale: 1, imageRatio },
       );
        img.remove();
      };
      document.body.appendChild(img);
    } else {
      createWatermark(
        container,
       { enableFlag, type, content, density, size, alpha, position, direction, scale: 1, imageRatio },
     );
    }
  };

  const createWatermarkContainer = () => {
    const sheetContainer = document.querySelector('.luckysheet-cell-main');
    if (!sheetContainer) return;
    const clsName = 'luckysheet-watermark';
    const waterMarkContainer = sheetContainer.querySelector(`.${clsName}`);
    if (waterMarkContainer) {
      waterMarkContainer.remove();
    }
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.pointerEvents = 'none';
    container.className = clsName;
    const printConfig = sheet.getPrintConfig();
    const { width: widthMm, height: heightMm, margin } = printConfig;
    const { top: topMm, bottom: bottomMm, left: leftMm, right: rightMm } = margin || {};
    const onePxMm = parsePxToMm(1);
    const width = widthMm ? (widthMm - (leftMm || 0) - (rightMm || 0))/ onePxMm : 0;
    const height = heightMm ? (heightMm - (topMm || 0) - (bottomMm || 0)) / onePxMm : 0;
    container.style.left = 0;
    container.style.top = 0;
    container.style.width = `${width}px`;
    container.style.height = `${height}px`;
    container.style.zIndex = 100000;
    container.style.pointerEvents = 'none';
    sheetContainer.appendChild(container);
    return container;
  };

  const handleEditContent = () => {
    const record = formDs.current;
    Modal.open({
      title: intl.get('hrpt.reportDesign.model.waterMask.content').d('水印内容'),
      bodyStyle: { padding: 0, height: 'calc(100vh - 2.06rem)' },
      style: { width: '800px' },
      children: (
        <WaterMaskContent record={record} name='expression' contentRef={contentRef} templateFields={templateFields} />
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
          record.set('expression', !content || !content.length ? undefined : content);
          record.set('expression_format', result || undefined);
        }
      }
    });
  };

  const handleSave = async() => {
    if (!formDs.current) {
      return;
    }
    const flag = await formDs.current.validate();
    if (!flag) {
      return;
    }
    const { enableFlag, type, expression, value, density, size, alpha, position, direction } = formDs.current.get([
      'enableFlag', 'type', 'expression', 'value', 'density', 'size', 'alpha', 'position', 'direction',
    ]);
    const isImg = checkIsImgType(type);
    if (isImg && !value) {
      notification.error({
        message: intl.get("hrpt.common.model.field.uploadImage").d("请上传图片！"),
      });
      return;
    }
    let formatExpression = expression;
    if (formatExpression && formatExpression.length) {
      // CONCAT至少需要两个参数
      if (formatExpression.length < 2) {
        formatExpression.push({
          type: MarkContentItemType.FIX,
          value: '',
        });
      }
      formatExpression =
        expression
          .map(item => item.type === MarkContentItemType.FIX ? `'${item.value}'` : item.value)
          .join(',');
      formatExpression = `CONCAT(${formatExpression})`;    
    }
    const waterMarkConfig = {
      enableFlag, type, expression: formatExpression, value, density, size, alpha, position, direction
    };
    sheet.setWaterMarkConfig(waterMarkConfig);
    hidePaneContent();
  };

  const handleReset = () => {
    sheet.setWaterMarkConfig(null);
    const record = formDs.create({ enableFlag: false });
    record.status = 'update';
    // 加延时是为了处理图片类水印的宽高
    setTimeout(() => calcWatermark(record), 500);
    hidePaneContent();
  };

  const handleCancel = () => {
    const waterMarkConfig = sheet.getWaterMarkConfig() || {};
    const record = formDs.create(waterMarkConfig);
    const { expression } = waterMarkConfig;
    if (expression) {
      const expressionParams = parseExpressionParams(expression, { templateFields });
      record.init('expression', expressionParams);
      record.init('expression_format',
          expressionParams.length
            ? expressionParams.map(item => item.type === MarkContentItemType.FIX ? item.value : item.meaning).join('')
            : undefined
      );
    }
    record.status = 'update';
    // 加延时是为了处理图片类水印的宽高
    setTimeout(() => calcWatermark(record), 500);
    hidePaneContent();
  };

  return (
    <div className={styles['water-mask-pane']}>
      <div className="water-mask-title">
        {intl.get('hrpt.reportDesign.view.title.watermarkSetting').d('水印设置')}
        <span className="water-mask-close" onClick={hidePaneContent}>
          <Icon type="close" />
        </span>
      </div>
      <div className='water-mask-content'>
        {isTenantRoleLevel() && sheet.getWaterMarkConfig && isEmpty(sheet.getWaterMarkConfig()) && (!formDs.current || !formDs.current.get('enableFlag')) && (
          <Alert
            type="info"
            showIcon
            className={'water-mask-content-alert'}
            description={intl.get('hrpt.reportDesign.view.title.watermarkSetting.alert').d('当前模板应用全局水印')}
          />
        )}
        <Form dataSet={formDs} columns={1} labelLayout='float' style={{ padding: '0 16px' }}>
          <Switch name='enableFlag' />
          {formDs.current && formDs.current.get('enableFlag') && (
            <>
              <Select name='type' clearButton={false} />
              <PictureUpload
                hidden={!isImageType}
                name='value'
                label={(
                  <>
                    {intl.get('hrpt.reportDesign.model.waterMask.content').d('水印内容')}
                    <Tooltip title={intl.get('hrpt.reportDesign.model.waterMask.image.help').d('支持选择.jpg、.png 的图片')}>
                      <Icon type='help' style={{ marginLeft: '4px', verticalAlign: 'text-bottom', fontSize: '14px' }} />
                    </Tooltip>
                  </>  
                )}
                dataSet={formDs}
              />
              <ItemGroup compact className='water-mask-item-group' hidden={isImageType}>
                <TextArea
                  style={{ pointerEvents: 'none' }}
                  readOnly
                  showValidation={ShowValidation.tooltip}
                  name='expression_format'
                  resize="vertical"
                  label={intl.get('hrpt.reportDesign.model.waterMask.content').d('水印内容')}
                />
                <Tooltip title={intl.get('hrpt.reportDesign.view.title.watermarkContentEdit').d('放大编辑，支持引用变量')}>
                  <Icon
                    type='zoom_out_map'
                    style={{ cursor: 'pointer' }}
                    onClick={handleEditContent}
                  />
                </Tooltip>
              </ItemGroup>
              <Select name='position' clearButton={false} hidden={!isSingleType}>
                <Select.Option value='CENTER'>{intl.get('hrpt.reportDesign.watermark.position.center').d('居中')}</Select.Option>
                <Select.Option value='TOP'>{intl.get('hrpt.reportDesign.watermark.position.top').d('顶部')}</Select.Option>
                <Select.Option value='BOTTOM'>{intl.get('hrpt.reportDesign.watermark.position.bottom').d('底部')}</Select.Option>
                <Select.Option value='LEFT'>{intl.get('hrpt.reportDesign.watermark.position.left').d('左侧')}</Select.Option>
                <Select.Option value='RIGHT'>{intl.get('hrpt.reportDesign.watermark.position.right').d('右侧')}</Select.Option>
              </Select>
              <LateralSelect
                name='density'
                dataSet={formDs}
                options={[
                  { value: 'COMPACT', meaning: intl.get('hrpt.reportDesign.watermark.density.compact').d('紧凑') },
                  { value: 'STANDARD', meaning: intl.get('hrpt.reportDesign.watermark.density.standard').d('标准') },
                  { value: 'LOOSE', meaning: intl.get('hrpt.reportDesign.watermark.density.loose').d('宽松') }
                ]}
              />
              <LateralSelect
                name='size'
                dataSet={formDs}
                label={isImageType ? intl.get('hrpt.reportDesign.model.waterMask.imageSize').d('图片大小') : intl.get('hrpt.reportDesign.model.waterMask.fontSize').d('字体大小')}
                options={[
                  { value: 'SMALLER', meaning: intl.get('hrpt.reportDesign.watermark.fontSize.small').d('更小') },
                  { value: 'STANDARD', meaning: intl.get('hrpt.reportDesign.watermark.fontSize.standard').d('标准') },
                  { value: 'BIGGER', meaning: intl.get('hrpt.reportDesign.watermark.fontSize.large').d('更大') }
                ]}
              />
              <LateralSelect
                name='alpha'
                dataSet={formDs}
                options={[
                  { value: 'LIGHT', meaning: '10%' },
                  { value: 'SOFT', meaning: '15%' },
                  { value: 'TRANSLUCENT', meaning: '20%' }
                ]}
              />
              {!isSingleType && (
                <Select name='direction' clearButton={false}>
                  <Select.Option value='RIGHT_UP'>{intl.get('hrpt.reportDesign.watermark.tiltDirection.right').d('斜向右上')}</Select.Option>
                  <Select.Option value='LEFT_UP'>{intl.get('hrpt.reportDesign.watermark.tiltDirection.left').d('斜向左上')}</Select.Option>
                </Select>
              )}
              {isImageType && (
                <img
                  src={formDs.current ? formDs.current.get('value') : undefined}
                  alt=''
                  ref={pictureRef}
                  style={{ display: 'none' }}
                />
              )}
            </>
          )}  
        </Form>
      </div>
      <div className='water-mask-footer'>
        <Button color='primary' onClick={handleSave}>{intl.get('hzero.common.button.save').d('保存')}</Button>
        {isTenantRoleLevel() && sheet.getPrintConfig && !isEmpty(sheet.getWaterMarkConfig()) && (!formDs.current || !formDs.current.get('enableFlag')) && (
          <Tooltip title={intl.get('hrpt.reportDesign.watermark.reset.tip').d('关闭模板水印，重置为全局水印配置')}>
            <Button color='primary' onClick={handleReset}>{intl.get('hzero.common.button.reset').d('重置')}</Button>
          </Tooltip>
        )}
        <Button onClick={handleCancel}>{intl.get('hzero.common.button.cancel').d('取消')}</Button>
      </div>
    </div>
  )
}

export default observer(WaterMask);