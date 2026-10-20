/**
 * Config - 全局统一配置
 * @date: 2018-6-20
 * @author: niujiaqing <njq.niu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
/*eslint-disable*/
const {
  $$env = {
    SRC_WEBSOCKET_HOST: window.$$env.SRC_WEBSOCKET_HOST,
    SRM_MALL_HOST: window.$$env.SRM_MALL_HOST,
    PUBLIC_BUCKET: window.$$env.PUBLIC_BUCKET,
    PRIVATE_BUCKET: window.$$env.PRIVATE_BUCKET,
    PROMPT_INSERT: window.$$env.PROMPT_INSERT,
    HELPROBOT_WECHAT_ICON: window.$$env.HELPROBOT_WECHAT_ICON,
  },
} = window;
// #region initConfig
let SRC_WEBSOCKET_HOST = `${$$env.SRC_WEBSOCKET_HOST}`;
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
let SRM_CUSTOMIZATION = '/scux';
let SRM_SMBL = '/smbl';
let SRM_MALL_HOST = `${$$env.SRM_MALL_HOST}`;
let SRM_SQUIRRELS_MDM = '/smdm-squirrels'; // 三只松鼠，二开smdm
const PUBLIC_BUCKET = $$env.PUBLIC_BUCKET || 'public-bucket';
const PRIVATE_BUCKET = $$env.PRIVATE_BUCKET || 'private-bucket';
let SRM_MALL = '/smal';
const PROMPT_INSERT = $$env.PROMPT_INSERT || false;
const SRM_SCUX = '/scux';
const SMALL_ORDER = '/smodr';
const SRM_ADAPTOR = '/sada';
const SRM_SIEC = '/siec';
const SRM_SDAP = '/sdap';
const SRM_SAGM = '/sagm';
const SRM_SMPC = '/smpc';
const SRM_SIGL = '/sigl';
const SRM_DATA_PROCESS = '/sdps';
const SRM_SRPM = '/srpm';
const SRM_HPFM = '/hpfm';
const SRM_SPRM = '/sprm';
const SRM_SLOD = '/slod';
const SRM_SPC = '/spc';
const SRM_SOP = '/sop';
const SRM_SSTA = '/ssta';
const HELPROBOT_WECHAT_ICON = $$env.HELPROBOT_WECHAT_ICON || false;
const SRM_SCUX_2 = '/scux2';
const SRM_MARMOT = '/marmot';
const SRM_SMKT = '/smkt';
const SRM_FINANCE = '/sfin';
const SRM_SWBH = '/swbh';
const SRM_SBDM = '/sbdm';
const SRM_SMND = '/smnd';
const SRM_SDRP = '/sdrp';
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
      case 'SRM_SQUIRRELS_MDM':
        SRM_SQUIRRELS_MDM = value;
        break;
      case 'SRM_MALL':
        SRM_MALL = value;
        break;
      case 'SRM_CUSTOMIZATION':
        SRM_CUSTOMIZATION = value;
        break;
      case 'SRM_SMBL':
        SRM_SMBL = value;
        break;
      case 'SRM_SCUX':
        SRM_SCUX = value;
        break;
      case 'SMALL_ORDER':
        SMALL_ORDER = value;
        break;
      case 'SRM_ADAPTOR':
        SRM_ADAPTOR = value;
        break;
      case 'SRM_DATA_PROCESS':
        SRM_DATA_PROCESS = value;
        break;
      case 'SRM_SRPM':
        SRM_SRPM = value;
        break;
      case 'SRM_HPFM':
        SRM_HPFM = value;
      case 'SRM_SPRM':
        SRM_SPRM = value;
      case 'SRM_SLOD':
        SRM_SLOD = value;
      case 'SRM_SPC':
        SRM_SPC = value;
      case 'SRM_SOP':
        SRM_SOP = value;
      case 'SRM_SSTA':
        SRM_SSTA = value;
      case 'SRM_SCUX_2':
        SRM_SCUX_2 = value;
      case 'SRM_MARMOT':
        SRM_MARMOT = value;
      case 'SRM_SMKT':
        SRM_SMKT = value;
      case 'SRM_FINANCE':
        SRM_FINANCE = value;
      case 'SRM_SBDM':
        SRM_SBDM = value;
      case 'SRM_SMND':
        SRM_SMND = value;
      case 'SRM_SDRP':
        SRM_SDRP = value;
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
  SRM_SQUIRRELS_MDM: { changeConfig: ['SRM_SQUIRRELS_MDM'], depBy: [] },
  SRM_MALL: { changeConfig: ['SRM_MALL'], depBy: [] },
  SRM_CUSTOMIZATION: { changeConfig: ['SRM_CUSTOMIZATION'], depBy: [] },
  SRM_SMBL: { changeConfig: ['SRM_SMBL'], depBy: [] },
  SRM_SCUX: { changeConfig: ['SRM_SCUX'], depBy: [] },
  SMALL_ORDER: { changeConfig: ['SMALL_ORDER'], depBy: [] },
  SRM_ADAPTOR: { changeConfig: ['SRM_ADAPTOR'], depBy: [] },
  SRM_DATA_PROCESS: { changeConfig: ['SRM_DATA_PROCESS'], depBy: [] },
  SRM_SRPM: { changeConfig: ['SRM_SRPM'], depBy: [] },
  SRM_HPFM: { changeConfig: ['SRM_HPFM'], depBy: [] },
  SRM_SPRM: { changeConfig: ['SRM_SPRM'], depBy: [] },
  SRM_SLOD: { changeConfig: ['SRM_SLOD'], depBy: [] },
  SRM_SPC: { changeConfig: ['SRM_SPC'], depBy: [] },
  SRM_SOP: { changeConfig: ['SRM_SOP'], depBy: [] },
  SRM_SSTA: { changeConfig: ['SRM_SSTA'], depBy: [] },
  SRM_SCUX_2: { changeConfig: ['SRM_SCUX_2'], depBy: [] },
  SRM_MARMOT: { changeConfig: ['SRM_MARMOT'], depBy: [] },
  SRM_SMKT: { changeConfig: ['SRM_SMKT'], depBy: [] },
  SRM_FINANCE: { changeConfig: ['SRM_FINANCE'], depBy: [] },
  SRM_SBDM: { changeConfig: ['SRM_SBDM'], depBy: [] },
  SRM_SMND: { changeConfig: ['SRM_SMND'], depBy: [] },
  SRM_SDRP: { changeConfig: ['SRM_SDRP'], depBy: [] },
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
  SRM_SQUIRRELS_MDM,
  PUBLIC_BUCKET,
  PRIVATE_BUCKET,
  SRM_MALL,
  PROMPT_INSERT,
  SRM_CUSTOMIZATION,
  SRM_SMBL,
  SRM_SCUX,
  SMALL_ORDER,
  SRM_ADAPTOR,
  SRM_SIEC,
  SRM_SDAP,
  SRM_SAGM,
  SRM_SMPC,
  SRM_SIGL,
  HELPROBOT_WECHAT_ICON,
  SRM_DATA_PROCESS,
  SRM_SRPM,
  SRM_HPFM,
  SRM_SPRM,
  SRM_SLOD,
  SRM_SPC,
  SRM_SOP,
  SRM_SSTA,
  SRM_SCUX_2,
  SRM_MARMOT,
  SRM_SMKT,
  SRM_FINANCE,
  SRM_SWBH,
  SRM_SBDM,
  SRM_SMND,
  SRM_SDRP,
};
// #endregion
