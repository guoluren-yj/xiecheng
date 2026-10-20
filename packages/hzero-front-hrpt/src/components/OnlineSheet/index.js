import React from 'react';
import intl from 'hzero-front/lib/utils/intl';
import { getCurrentLanguage } from "hzero-front/lib/utils/utils";
import './spreadsheet/css/luckysheet.css';
import './spreadsheet/assets/iconfont/iconfont.css';
import './spreadsheet/luckysheet.umd';

import SiYuanBlack from '../../assets/siyuan-black.ttf';
import SiYuanSong from '../../assets/siyuan-song.ttf';
import TimesNewRoman from '../../assets/times-new-roman.ttf';
import lucksheetLangData from './lang';

export default class OnlineSheet extends React.Component {
  componentDidMount() {
    const { onRef, options } = this.props;
    const luckysheet = window.luckysheet;
    const lang = getCurrentLanguage();
    luckysheet.create({
      container: 'luckysheet',
      plugins: ['chart'],
      lang: lang === "zh_CN" ? 'zh' : 'en',
      langObj: lucksheetLangData(intl),
      showsheetbar: false,
      fontList: [
        {
          fontName: '思源黑体',
          url: SiYuanBlack,
        },
        {
          fontName: '思源宋体',
          url: SiYuanSong,
        },
        {
          fontName: 'Times New Roman',
          url: TimesNewRoman,
        },
      ],
      ...options,
    });
    onRef(luckysheet);
  }

  componentWillUnmount() {
    luckysheet.resetSheet();
  }

  render() {
    return (
      <div
        id="luckysheet"
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
        }}
      />
    );
  }
}
