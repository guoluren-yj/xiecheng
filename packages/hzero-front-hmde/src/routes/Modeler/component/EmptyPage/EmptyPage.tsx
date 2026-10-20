/*
 * @空tab页
 * @Date: 2021-04-01
 * @Author: 汪渊  <yuan.wang07@hand-china.com>
 * @version: 1.0.0
 * @copyright: copyright: HAND ® 2020
 */
import React, { useEffect, useState, FC } from 'react';
import ImgIcon from '@/utils/ImgIcon';

interface IStyle {
  // imgWrapperHeight: number;
  imgWrapperWidth: number;
  imgWrapperMargin: string;
  marginLeft: number;
  helpFontSize?: string;
  helpColor?: string;
  messageFontSize: string;
  messageMarginTop?: number;
  color?: string;
}
interface IIndex {
  help?: string;
  message: string;
  styles?: IStyle;
}
const defaultStyles = {
  // imgWrapperHeight: 250,
  imgWrapperWidth: 572,
  imgWrapperMargin: '0px auto',
  marginLeft: 40,
  helpFontSize: '16px',
  helpColor: 'rgba(0,0,0,0.65)',
  messageFontSize: '22px',
  messageMarginTop: 10,
};
const Index: FC<IIndex> = ({ help, message, styles = {} }) => {
  const [emptyStyle, setEmptyStyle] = useState<IStyle>({} as any);
  useEffect(() => {
    const newStyle: IStyle = { ...defaultStyles, ...styles };
    setEmptyStyle(newStyle);
  }, []);
  return (
    <div
      style={{
        textAlign: 'center',
        // height: emptyStyle.imgWrapperHeight,
        margin: emptyStyle.imgWrapperMargin,
        width: emptyStyle.imgWrapperWidth,
      }}
    >
      {/* <img src={noModel} alt="" style={{ maxWidth: '100%', maxHeight: '100%' }} /> */}
      <ImgIcon name="no-model@2x.png" size={250} />
      <div style={{ marginLeft: emptyStyle.marginLeft }}>
        <div style={{ fontSize: emptyStyle.helpFontSize, color: emptyStyle.color }}>{help}</div>
        <div
          style={{ fontSize: emptyStyle.messageFontSize, marginTop: emptyStyle.messageMarginTop }}
        >
          {message}
        </div>
      </div>
    </div>
  );
};
export default Index;
