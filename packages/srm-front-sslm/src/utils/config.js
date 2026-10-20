/**
 * 不要直接修改这个文件, 请修改 config/apiConfig 文件
 * Config - 全局统一配置
 * @date: 2018-6-20
 * @author: niujiaqing <njq.niu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

/*eslint-disable*/

// #region initConfig
let SRC_WEBSOCKET_HOST = `${window.$$env.SRC_WEBSOCKET_HOST}`;
let SRM_MDM = '/smdm';
let SRM_PLATFORM = '/spfm';
let SRM_INTERFACE_CONFIG = '/sifc';
let SRM_INTERFACE = '/sitf';
let SRM_SSLM = '/sslm';
let SRM_SPUC = '/spuc';
let SRM_SQAM = '/sqam';
let SRM_SSRC = '/ssrc';
let SRM_CREDIT = '/seci';
let SRM_SCEC = '/scec';
let SRM_SCEI = '/scei';
let SRM_SPCM = '/spcm';
let SRM_AMKT = '/amkt';
let SRM_MALL_HOST = `${window.$$env.SRM_MALL_HOST}`;
// #endregion

// #region changeConfig Funcs

// #endregion

// #region changeRoute
window.srmChangeRoute = function srmChangeRoute(key, value) {
  if (key && value) {
    switch (key) {
      case 'SRC_WEBSOCKET_HOST':
        SRC_WEBSOCKET_HOST = value;
        break;
      case 'SRM_MDM':
        SRM_MDM = value;
        break;
      case 'SRM_PLATFORM':
        SRM_PLATFORM = value;
        break;
      case 'SRM_INTERFACE_CONFIG':
        SRM_INTERFACE_CONFIG = value;
        break;
      case 'SRM_INTERFACE':
        SRM_INTERFACE = value;
        break;
      case 'SRM_SSLM':
        SRM_SSLM = value;
        break;
      case 'SRM_SPUC':
        SRM_SPUC = value;
        break;
      case 'SRM_SQAM':
        SRM_SQAM = value;
        break;
      case 'SRM_SSRC':
        SRM_SSRC = value;
        break;
      case 'SRM_CREDIT':
        SRM_CREDIT = value;
        break;
      case 'SRM_SCEC':
        SRM_SCEC = value;
        break;
      case 'SRM_SCEI':
        SRM_SCEI = value;
        break;
      case 'SRM_SPCM':
        SRM_SPCM = value;
        break;
      case 'SRM_AMKT':
        SRM_AMKT = value;
        break;
      case 'SRM_MALL_HOST':
        SRM_MALL_HOST = value;
        break;
    }
  } else {
    helpMethod(key);
  }
};
// #endregion

// #region helpMethod
const helpMethodAssist = {
  SRC_WEBSOCKET_HOST: { changeConfig: ['SRC_WEBSOCKET_HOST'], depBy: [] },
  SRM_MDM: { changeConfig: ['SRM_MDM'], depBy: [] },
  SRM_PLATFORM: { changeConfig: ['SRM_PLATFORM'], depBy: [] },
  SRM_INTERFACE_CONFIG: { changeConfig: ['SRM_INTERFACE_CONFIG'], depBy: [] },
  SRM_INTERFACE: { changeConfig: ['SRM_INTERFACE'], depBy: [] },
  SRM_SSLM: { changeConfig: ['SRM_SSLM'], depBy: [] },
  SRM_SPUC: { changeConfig: ['SRM_SPUC'], depBy: [] },
  SRM_SQAM: { changeConfig: ['SRM_SQAM'], depBy: [] },
  SRM_SSRC: { changeConfig: ['SRM_SSRC'], depBy: [] },
  SRM_CREDIT: { changeConfig: ['SRM_CREDIT'], depBy: [] },
  SRM_SCEC: { changeConfig: ['SRM_SCEC'], depBy: [] },
  SRM_SREQ: { changeConfig: ['SRM_SREQ'], depBy: [] },
  SRM_SCEI: { changeConfig: ['SRM_SCEI'], depBy: [] },
  SRM_SPCM: { changeConfig: ['SRM_SPCM'], depBy: [] },
  SRM_AMKT: { changeConfig: ['SRM_AMKT'], depBy: [] },
  SRM_MALL_HOST: { changeConfig: ['SRM_MALL_HOST'], depBy: [] },
};
function helpMethod(key) {
  if (key && helpMethodAssist[key]) {
    console.error(
      `${key} 会更改: [${helpMethodAssist[key].changeConfig.join(
        ', '
      )}], 被级连更改: [${helpMethodAssist[key].depBy.join(', ')}]`
    );
  } else {
    console.error('使用 changeRoute() 查看可以更改的参数');
    console.error('使用 changeRoute("参数") 查看具体改变');
    console.error('使用 changeRoute("参数", "参数值") 更改参数');
    console.error(`可以更改的配置: [${Object.keys(helpMethodAssist).join(', ')}]`);
  }
}
// #endregion

// #regioin exportsConfig
export {
  SRC_WEBSOCKET_HOST,
  SRM_MDM,
  SRM_PLATFORM,
  SRM_INTERFACE_CONFIG,
  SRM_INTERFACE,
  SRM_SSLM,
  SRM_SPUC,
  SRM_SQAM,
  SRM_SSRC,
  SRM_CREDIT,
  SRM_SCEC,
  SRM_SCEI,
  SRM_SPCM,
  SRM_AMKT,
  SRM_MALL_HOST,
};
// #endregion
