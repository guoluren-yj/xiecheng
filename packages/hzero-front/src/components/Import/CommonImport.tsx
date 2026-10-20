import * as React from 'react';
import { DataSet } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import { toSafeInteger } from 'lodash';

import { getCurrentOrganizationId } from '@/utils/utils';
import { getEnvConfig } from '@/utils/iocUtils';

import Drawer from './Drawer';
import type { IObjectProps } from './stores';
import _store, { infoDS, EImportType } from './stores';

const { HZERO_IMP } = getEnvConfig();

interface ImportProps {
  // sync?: boolean; // 是否同步
  // auto?: boolean; // 是否自动(同步模式下生效)
  prefixPatch: string;
  /** 为true时会将prefixPatch应用到/business-object-import-templates/list接口 */
  changeServicePrefix?: boolean;
  args?: any; // JSON stringify
  autoExecute?: boolean;
  autoRefreshInterval?: number; // Integer
  tenantId?: number;
  action?: string; // 国际化编码(配合key使用)
  actionParams?: string; // 国际化编码参数
  buttonText?: string; // 按钮文字
  buttonProps?: IObjectProps; // 按钮属性
  modal?: any;
  businessObjectTemplateCode?: string;
  businessObjectTemplateCategory?: string;
  templateCode?: string;
  bindTemplateCode?: string;
  downloadTemplateCode?: string;
  refreshButton?: boolean;
  restoreShowAllButton?: boolean;
  auto?: boolean;
  modalProps?: any;
  successCallBack?: () => any; // 导入成功的回调函数
  errorCallBack?: () => any; // 导入失败的回调函数
  customeImportTemplate?: CustomeImportTemplateProps; // 自定义下载模板
  title?: string;
  afterDownloadTemplate?: () => void; // 下载模板后回调函数
}

export interface CustomeImportTemplateProps {
  templateCode: string;
  requestUrl: string;
  method?: 'GET' | 'POST' | 'get' | 'post';
  queryParams?: any; // 导出接口业务参数配置
  queryArea?: any; // 导出文件相关参数配置
  allBody?: boolean;
  skipQueryGetTplFile?: boolean;
  tplAsyncDownload?: boolean;
  queryColumnsParams?: any;
}

const List: React.FC<ImportProps> = observer(
  ({
    tenantId = getCurrentOrganizationId(),
    prefixPatch,
    changeServicePrefix,
    businessObjectTemplateCode,
    businessObjectTemplateCategory,
    templateCode = '',
    bindTemplateCode,
    downloadTemplateCode,
    args,
    autoRefreshInterval = 5000,
    modal,
    refreshButton = false,
    auto = true,
    restoreShowAllButton = false,
    modalProps = {},
    successCallBack = () => undefined,
    errorCallBack = () => undefined,
    customeImportTemplate,
    autoExecute = true,
    title,
    afterDownloadTemplate,
  }) => {
    const infoDs = React.useMemo(() => new DataSet(infoDS()), []);

    const { setDataSource } = React.useContext<any>(_store as any).store;
    // eslint-disable-next-line no-nested-ternary
    const importType = templateCode
    ? EImportType.templateCode
    : businessObjectTemplateCode
    ? EImportType.businessObjectTemplateCode
    : EImportType.businessObjectTemplateCategory;
    
    React.useEffect(() => {
      // eslint-disable-next-line no-nested-ternary

      setDataSource({
        tenantId,
        prefixPatch: prefixPatch || HZERO_IMP,
        servicePath: prefixPatch,
        importType,
        businessObjectTemplateCode,
        businessObjectTemplateCategory,
        templateCode,
        bindTemplateCode,
        downloadTemplateCode,
        code: templateCode || businessObjectTemplateCode || businessObjectTemplateCategory,
        autoRefreshInterval: toSafeInteger(autoRefreshInterval),
        refreshButton,
        restoreShowAllButton,
        auto,
        args,
        successCallBack,
        errorCallBack,
        autoExecute,
      });
    }, []);

    return (
      <>
        <Drawer
          infoDs={infoDs}
          importType={importType}
          code={templateCode || businessObjectTemplateCode || businessObjectTemplateCategory}
          tenantId={tenantId}
          prefixPatch={prefixPatch || HZERO_IMP}
          servicePath={prefixPatch}
          changeServicePrefix={changeServicePrefix}
          args={args}
          modal={modal}
          modalProps={modalProps}
          customeImportTemplate={customeImportTemplate}
          title={title}
          afterDownloadTemplate={afterDownloadTemplate}
        />
      </>
    );
  }
);

export default List;
