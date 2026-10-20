import type { ReactNode } from 'react';
import * as React from 'react';
import classnames from 'classnames';
import { observer } from 'mobx-react-lite';
import { toSafeInteger } from 'lodash';
import { Tooltip } from 'choerodon-ui/pro';
import { ButtonTooltip } from 'choerodon-ui/pro/lib/button/enum';
import { RenderFunction } from 'choerodon-ui/lib/trigger/Trigger';

import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import Button from '@/components/PermissionButton';

import './index.less';
import { useModal } from './index';
import type { IObjectProps } from './stores';

interface CustomeImportTemplateProps {
  templateCode: string;
  requestUrl: string;
  method?: 'GET' | 'POST' | 'get' | 'post';
  queryParams?: any; // 导出接口业务参数配置
  queryArea?: any; // 导出文件相关参数配置
  allBody?: boolean;
}

interface ImportProps {
  // sync?: boolean; // 是否同步
  // auto?: boolean; // 是否自动(同步模式下生效)
  /** 为true时会将prefixPatch应用到/business-object-import-templates/list接口 */
  changeServicePrefix?: boolean;
  prefixPatch: string;
  args?: any; // JSON stringify
  autoExecute?: boolean;
  autoRefreshInterval?: number; // Integer
  tenantId?: number;
  action?: string; // 国际化编码(配合key使用)
  actionParams?: string; // 国际化编码参数
  buttonText?: string; // 按钮文字
  buttonTooltip?: ReactNode | RenderFunction;
  buttonProps?: IObjectProps; // 按钮属性
  businessObjectTemplateCode?: string;
  businessObjectTemplateCategory?: string;
  templateCode?: string;
  bindTemplateCode?: string;
  downloadTemplateCode?: string;
  restoreShowAllButton?: boolean;
  refreshButton?: boolean;
  auto?: boolean;
  modalProps?: any;
  successCallBack?: () => any;
  errorCallBack?: () => any;
  customeImportTemplate?: CustomeImportTemplateProps; // 自定义下载模板
  getModal?: () => any;
  inMenuItem?: boolean;
  afterDownloadTemplate?: () => void; // 下载模板后回调函数
}

const List: React.FC<ImportProps> = observer(
  ({
    action = 'hzero.common.button.import',
    actionParams = {},
    buttonText = intl.get('hzero.common.button.import').d('导入'),
    buttonTooltip,
    buttonProps = {},
    tenantId = getCurrentOrganizationId(),
    prefixPatch,
    changeServicePrefix,
    businessObjectTemplateCode,
    businessObjectTemplateCategory,
    templateCode,
    bindTemplateCode,
    downloadTemplateCode,
    args = {},
    autoRefreshInterval = 5000,
    refreshButton = false,
    restoreShowAllButton = false,
    auto = true,
    modalProps = {},
    successCallBack = () => undefined,
    errorCallBack = () => undefined,
    customeImportTemplate,
    autoExecute = true,
    getModal,
    inMenuItem,
    afterDownloadTemplate,
  }) => {
    const handleClick = React.useCallback(() => {
      const { openModal } = useModal();
      openModal(
        {
          businessObjectTemplateCode,
          businessObjectTemplateCategory,
          templateCode,
          bindTemplateCode,
          downloadTemplateCode,
          tenantId,
          prefixPatch,
          changeServicePrefix,
          autoRefreshInterval: toSafeInteger(autoRefreshInterval),
          refreshButton,
          auto,
          args,
          restoreShowAllButton,
          successCallBack,
          errorCallBack,
          customeImportTemplate,
          autoExecute,
          getModal,
          afterDownloadTemplate,
        },
        modalProps
      );
    }, [
      businessObjectTemplateCode,
      businessObjectTemplateCategory,
      templateCode,
      bindTemplateCode,
      downloadTemplateCode,
      tenantId,
      prefixPatch,
      action,
      actionParams,
      args,
      restoreShowAllButton,
      successCallBack,
      errorCallBack,
      customeImportTemplate,
      autoExecute,
      getModal,
    ]);

    const clsName = classnames('srm-common-import-button', (buttonProps || {}).className);

    const newBtnProps: any = { icon: "archive", ...buttonProps };
    if (inMenuItem) newBtnProps.icon = undefined;
    return (
      <Tooltip title={buttonTooltip}>
        <Button
          type="c7n-pro"
          // tooltip="none"
          {...newBtnProps}
          onClick={handleClick}
          className={clsName}
          tooltip={ButtonTooltip.none}
        >
          {buttonText}
          <span className="srm-common-import-button-tag">NEW</span>
        </Button>
      </Tooltip>
    );
  }
);

export default List;
