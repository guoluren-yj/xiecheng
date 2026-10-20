// eslint-disable

declare global {
  declare module '*.css';
  declare module '*.less';
  declare module '*.scss';
  declare module '*.sass';
  declare module '*.svg';
  declare module '*.png';
  declare module '*.jpg';
  declare module '*.jpeg';
  declare module '*.gif';
  declare module '*.bmp';
  declare module '*.tiff';
  declare module 'omit.js';
  declare module 'react-copy-to-clipboard';
  declare module 'nzh/cn';
  declare module 'webpack-theme-color-replacer';
  declare module 'webpack-theme-color-replacer/client';

  // google analytics interface
  interface GAFieldsObject {
    eventCategory: string;
    eventAction: string;
    eventLabel?: string;
    eventValue?: number;
    nonInteraction?: boolean;
  }

  interface Window {
    ga: (
      command: 'send',
      hitType: 'event' | 'pageview'
    ) => // fieldsObject: GAFieldsObject | string,
    void;
    dvaApp: DvaInstance;
    microModuleScriptMap: any;
  }

  namespace React {
    interface AnchorHTMLAttributes {
      disabled?: boolean;
    }
  }

  let ga: Function;

  // eslint-disable-next-line camelcase
  let __webpack_public_path__: string;

  // preview.pro.ant.design only do not use in your production ;
  // preview.pro.ant.design 专用环境变量，请不要在你的项目中使用它。
  let ANT_DESIGN_PRO_ONLY_DO_NOT_USE_IN_YOUR_PRODUCTION: 'site' | undefined;
}
//========== ↓曾强↓ ==========

//========== ↓詹明镇↓ ==========
/// <reference path="./modelService/querySourceLeftTreeService.d.ts" />

//========== ↓崔佳旭↓ ==========
/// <reference path="./authorityManageService/cancelDistributionsApplicationService.d.ts" />
/// <reference path="./authorityManageService/createNewApplicationService.d.ts" />
/// <reference path="./authorityManageService/deleteAccountService.d.ts" />
/// <reference path="./authorityManageService/distributionsApplicationService.d.ts" />
/// <reference path="./authorityManageService/queryAppModelerServiceTree.d.ts" />
/// <reference path="./authorityManageService/submitAppVisibleService.d.ts" />
/// <reference path="./authorityManageService/queryPageListService.d.ts" />

//========== ↓高见↓ ==========
/// <reference path="./modelBaseService/modelBase.d.ts" />

//========== ↓陈文驰↓ ==========
/// <reference path="./modelDataSourceService/modeler.d.ts" />
/// <reference path="./modelListService/createRedTableService.d.ts" />
/// <reference path="./modelListService/apiModel.d.ts" />
/// <reference path="./modelListService/queryModelList.d.ts" />
/// <reference path="./modelListService/refreshModelService.d.ts" />

//========== ↓汪渊↓ ==========
/// <reference path="./businessObjectService/fieldInformation.d.ts" />

export {};
