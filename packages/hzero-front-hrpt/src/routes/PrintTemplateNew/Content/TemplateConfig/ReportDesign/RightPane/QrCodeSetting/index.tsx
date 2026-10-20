/* eslint-disable react/jsx-filename-extension */
import React, { useContext, useMemo, useEffect } from 'react';
import { runInAction } from 'mobx';
import { Tooltip, Form, TextField, NumberField, Select, DataSet, Icon } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

import intl from 'hzero-front/lib/utils/intl';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';
import { ValueChangeAction } from 'choerodon-ui/pro/lib/text-field/enum';
import { FieldType } from 'choerodon-ui/dataset/data-set/enum';
import { qrCodeDefaultConfig } from "../../utils/constant";
import Store from '../../store';
import styles from './style.less';

const versionArr = Array(40)
  .fill(1)
  .map((_, index) => {
    const v = index + 1;
    const matrixCount = index * 4 + 21;
    return [v, `${v} (${matrixCount} * ${matrixCount})`];
  });
const QrCodeSetting = ({ hidePaneContent, sheet }) => {
  const { currentCell } = useContext<any>(Store).store;
  const cellRef = useMemo((): any => ({ current: null }), []);
  cellRef.current = currentCell;
  const ds = useMemo(() => {
    let data = {};
    if (currentCell && currentCell.value && currentCell.value.qrCodeAdvancedConfig) {
      data = currentCell.value.qrCodeAdvancedConfig;
    } else {
      data = qrCodeDefaultConfig;
    }
    return new DataSet({
      data: [{...data}],
      fields: [
        { name: "codeFormat", label: intl.get("hrpt.reportDesign.model.field.qrtype").d("码制"), lookupCode: 'HRPT.QRCODE_FORMAT', defaultValue: 'QR_CODE' },
        { name: "cellContent", label: intl.get("hrpt.reportDesign.model.field.cellContent").d("内容") },
        { name: "size", label: intl.get("hrpt.reportDesign.model.field.size").d("尺寸(PX)") },
        { name: "level", label: intl.get("hrpt.reportDesign.model.field.level").d("纠错级别") },
        { name: "version", label: intl.get("hrpt.reportDesign.model.field.version").d("版本") },
        { name: "imageType", label: intl.get("hrpt.reportDesign.model.field.imageType").d("颜色通道") },
        { name: "margin", label: intl.get("hrpt.reportDesign.model.field.margin").d("码边距"), type: FieldType.number, min: 0 },
      ],
      events: {
        update: ({ record, name, value }) => {
          const {codeFormat, cellContent, __dirty, ...others } = record.toData();
          if (sheet && cellRef.current && cellRef.current.position && cellRef.current.value) {
            const { position } = cellRef.current;
            const qrCodeAdvancedConfig = {
              ...others,
              codeFormat: codeFormat || 'QR_CODE',
            };
            sheet.setCellValue(position.r, position.c, { ...cellRef.current.value, qrCodeAdvancedConfig });
            if (name === 'codeFormat') {
              sheet.insertQrcode({
                isCell: true,
                content: cellRef.current.value.v || 'zhenyun',
                isQrcode: true,
                format: codeFormat || 'QR_CODE',
              });
            }
          }
        },
      },
    });
  }, [currentCell]);
  useEffect(() => {
    const { value } = currentCell || {};
    runInAction(() => {
      // 注意，这里是为了从单元格数据中初始化表单，请勿使用set;
      if (value && ds.current) {
        if (value.v) {
          ds.current.init('cellContent', value.v);
        }
        if (value.qrCodeAdvancedConfig) {
          ds.current.init('size', value.qrCodeAdvancedConfig.size);
          ds.current.init('codeFormat', value.qrCodeAdvancedConfig.codeFormat || 'QR_CODE');
          ds.current.init('level', value.qrCodeAdvancedConfig.level);
          ds.current.init('version', value.qrCodeAdvancedConfig.version);
          ds.current.init('imageType', value.qrCodeAdvancedConfig.imageType);
        }
      }
    });
  }, [currentCell]);
  return (
    <div className={styles['qrcode-pane']}>
      <div className="qrcode-pane-title">
        {intl.get('hrpt.reportDesign.view.title.setQrCde').d('设置二维码')}
        <span className="qrcode-pane-close" onClick={hidePaneContent}>
          <Icon type="close" />
        </span>
      </div>
      <Form labelLayout={LabelLayout.float} className="qrcode-pane-config" dataSet={ds}>
        <Select name="codeFormat" clearButton={false} />
        <TextField name="cellContent" disabled />
        {(!ds.current || ds.current.get('codeFormat') !== 'PDF417') && (
          <>
            <NumberField
              name="size"
              clearButton={false}
              placeholder=""
              valueChangeAction={ValueChangeAction.input}
              addonAfter={
                <Tooltip
                  title={intl
                    .get('hrpt.reportDesign.model.field.sizeHelp')
                    .d('二维码的大小，通常用长度和宽度来表示。不同版本的二维码有不同的尺寸。最小尺寸是21×21，最大尺寸为177×177。')}
                >
                  <Icon
                    type="help"
                    style={{ fontSize: '14px', lineHeight: '30px', verticalAlign: 'bottom' }}
                  />
                </Tooltip>
              }
            />
            <Select
              name="level"
              clearButton={false}
              addonAfter={
                <Tooltip
                  title={
                    <>
                      <p>{intl.get("hrpt.reportDesign.model.field.levelHelp.p1").d("二维码在识别过程中对损坏或模糊的二维码的容错能力。")}</p>
                      <p>{intl.get("hrpt.reportDesign.model.field.levelHelp.p2").d("纠错级别通常分为四个等级：L级、M级、Q级和H级。L级（低）可以纠正约7%的错误，M级（中）可以纠正约15%的错误，Q级（高）可以纠正约25%的错误，H级（最高）可以纠正约30%的错误。")}</p>
                      <p>{intl.get("hrpt.reportDesign.model.field.levelHelp.p3").d("一般来说，纠错级别越高，生成的二维码越大，但其容错能力也越强。")}</p>
                    </>
                  }
                >
                  <Icon type="help" style={{ fontSize: "14px", lineHeight: "30px", verticalAlign: "bottom" }} />
                </Tooltip>
              }
            >
              <Select.Option value="L">7%</Select.Option>
              <Select.Option value="M">15%</Select.Option>
              <Select.Option value="Q">25%</Select.Option>
              <Select.Option value="H">30%</Select.Option>
            </Select>
            <Select
              name="version"
              addonAfter={
                <Tooltip title={intl.get("hrpt.reportDesign.model.field.versionHelp").d("二维码一行或一列中包含的码点数量，数字越大，码点密度越高")}>
                  <Icon type="help" style={{ fontSize: "14px", lineHeight: "30px", verticalAlign: "bottom" }} />
                </Tooltip>
              }
              clearButton={false}
            >
              {versionArr.map(([v, m]) => (
                <Select.Option value={v}>{m}</Select.Option>
              ))}
            </Select>
            <Select
              name="imageType"
              addonAfter={
                <Tooltip title={intl.get("hrpt.reportDesign.model.field.imageTypeHelp").d("若打印效果出现模糊、喷墨等情况，可尝试RGB模式")}>
                  <Icon type="help" style={{ fontSize: "14px", lineHeight: "30px", verticalAlign: "bottom" }} />
                </Tooltip>
              }
              clearButton={false}
            >
              <Select.Option value={1}>{intl.get("hrpt.reportDesign.model.field.imageTypeRGB").d("RGB模式")}</Select.Option>
              <Select.Option value={12}>{intl.get("hrpt.reportDesign.model.field.imageTypeBlack").d("黑白模式")}</Select.Option>
            </Select>
            <NumberField name="margin" />
          </>
        )}
      </Form>
      {(!ds.current || ds.current.get('codeFormat') !== 'PDF417') && (
        <div className="qrcode-pane-example">
          <div className="qrcode-pane-example-title">{intl.get("hrpt.reportDesign.view.title.example").d("密度示例")}</div>
          <div className="qrcode-pane-example-pic-container">
            <div className="qrcode-pane-example-pic">
              <div className="qrcode-pane-example-pic-1" />
              <div className="qrcode-pane-example-pic-text">
                {intl.get("hrpt.reportDesign.model.field.version").d("版本")}&nbsp;1
              </div>
            </div>
            <div className="qrcode-pane-example-pic">
              <div className="qrcode-pane-example-pic-20" />
              <div className="qrcode-pane-example-pic-text">
                {intl.get("hrpt.reportDesign.model.field.version").d("版本")}&nbsp;20
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

QrCodeSetting.displayName = 'QrCodeSetting';
export default observer(QrCodeSetting);
