import React, { useMemo } from 'react';
import { observer } from 'mobx-react';
import { Form, CheckBox, Spin, Modal } from "choerodon-ui/pro";
import { Text } from "choerodon-ui";
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';
import intl from 'hzero-front/lib/utils/intl';
import notification from 'hzero-front/lib/utils/notification';
import Watermark from './Watermark';
import { checkIsImgType, MarkContentItemType } from './Watermark/util';

function Setting({ dataSet }) {
  const globalWatermarkDiv: any = useMemo(() => document.querySelectorAll('.mask_mark'), []);
  const globalWatermarkOpactiy = useMemo(() => 
    globalWatermarkDiv && globalWatermarkDiv[0] && (globalWatermarkDiv[0] as any).style.opacity,
  []);

  const resetGlobalWatermarkOpactiy = () => {
    if (globalWatermarkDiv && globalWatermarkDiv.length && globalWatermarkOpactiy) {
      const timer = setInterval(() => {
        let flag = true;
        globalWatermarkDiv.forEach(el => {
          if (el.style.opacity !== globalWatermarkOpactiy) {
            flag = false;
          }
          el.style.opacity = globalWatermarkOpactiy;
        });
        if (flag) {
          clearInterval(timer);
        }
      }, 200);
    }
  };

  const hideGlobalWatermarkOpactiy = () => {
    if (globalWatermarkDiv && globalWatermarkDiv.length && globalWatermarkOpactiy) {
      globalWatermarkDiv.forEach(el =>  (el as any).style.opacity = '0');
    }
  };

  const resetConfig = () => {
    const record = dataSet.current;
    if (record) {
      record.set('watermarkConfig_.type', record.get('watermarkConfig.type'));
      record.set('watermarkConfig_.expression', record.get('watermarkConfig.expression'));
      record.set('watermarkConfig_.expression_format', record.get('watermarkConfig.expression'));
      record.set('watermarkConfig_.value', record.get('watermarkConfig.value'));
      record.set('watermarkConfig_.density', record.get('watermarkConfig.density'));
      record.set('watermarkConfig_.size', record.get('watermarkConfig.size'));
      record.set('watermarkConfig_.alpha', record.get('watermarkConfig.alpha'));
      record.set('watermarkConfig_.position', record.get('watermarkConfig.position'));
      record.set('watermarkConfig_.direction', record.get('watermarkConfig.direction'));
    }
  };

  const handleClose = () => {
    resetConfig();
    resetGlobalWatermarkOpactiy();
  };

  const handleConfigWatermark = (event) => {
    event.stopPropagation();
    event.preventDefault();
    // 打开弹窗时隐藏系统水印，防止和打印水印混淆
    hideGlobalWatermarkOpactiy();
    Modal.open({
      drawer: true,
      title: intl.get("hrpt.common.model.field.configWatermark").d("配置水印"),
      style: { width: '580px' },
      children: <Watermark dataSet={dataSet} />,
      // 关闭弹窗时还原系统水印
      onClose: handleClose,
      onCancel: handleClose,
      onOk: async() => {
        const record = dataSet.current;
        if (!record) {
          return false;
        }
        const flag = await dataSet.current.validate();
        if (!flag
          && ['watermarkConfig_.expression', 'watermarkConfig_.expression_format'].some(field => dataSet.current.getField(field) && !dataSet.current.getField(field).isValid())
        ) {
          return false;
        }
        const {
          'watermarkConfig_.type': type,
          'watermarkConfig_.expression': expression,
          'watermarkConfig_.value': value,
        } = record.get([
          'watermarkConfig_.type', 'watermarkConfig_.expression', 'watermarkConfig_.value',
        ]);
        const isImg = checkIsImgType(type);
        if (isImg && !value) {
          notification.error({
            message: intl.get("hrpt.common.model.field.uploadImage").d("请上传图片！"),
          });
          return false;
        }
        if (!isImg && expression && expression.length) {
          const formatExpression =
            expression
              .map(item => item.type === MarkContentItemType.FIX ? `'${item.value}'` : item.value)
              .join(',');
          record.set('watermarkConfig_.expression', formatExpression);
        }
        record.set('watermarkConfig.type', record.get('watermarkConfig_.type'));
        record.set('watermarkConfig.expression', record.get('watermarkConfig_.expression'));
        record.set('watermarkConfig.value', record.get('watermarkConfig_.value'));
        record.set('watermarkConfig.density', record.get('watermarkConfig_.density'));
        record.set('watermarkConfig.size', record.get('watermarkConfig_.size'));
        record.set('watermarkConfig.alpha', record.get('watermarkConfig_.alpha'));
        record.set('watermarkConfig.position', record.get('watermarkConfig_.position'));
        record.set('watermarkConfig.direction', record.get('watermarkConfig_.direction'));
      },
    });
  };  

  return (
    <Spin dataSet={dataSet}>
      <Form dataSet={dataSet} labelLayout={LabelLayout.float}>
        <CheckBox name="selectTemplateFlag" />
        <CheckBox
          name="watermarkConfig.enableFlag"
          label={(
            <> 
              <Text style={{ maxWidth: '150px' }}>{intl.get("hrpt.common.model.field.enableWatermark").d("是否启用水印")}</Text>
              <a style={{ marginLeft: '16px' }} onClick={handleConfigWatermark}>
                {intl.get("hrpt.common.model.field.configWatermark").d("配置水印")}
              </a>
            </>
          )}
        />
      </Form>
    </Spin>
  );
}

export default observer(Setting);