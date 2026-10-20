/*
 * @Description: 优惠政策基础配置
 * @Author: yan.xie <yan.xie@gong-link.com>
 * @Date: 2023-02-17 12:57:20
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2023, Hand
 */
import React, { Fragment, useMemo, useContext, useCallback } from 'react';
import { Collapse, Alert } from 'choerodon-ui';
import { Button, Spin, Lov, Upload } from 'choerodon-ui/pro';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { ViewMode } from 'choerodon-ui/pro/lib/lov/enum';
import injectGuide from 'srm-front-boot/lib/components/Guide/injectGuideList';
import { observer } from 'mobx-react';

import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import { isTenantRoleLevel, getResponse } from 'utils/utils';

import commonStyles from '../common.less';
import StoreProvider from './stores';
import BasicConfig from './components/BasicConfig';
import BillDefinition from './components/BillDefinition';
import DimensionApplyConfig from './components/DimensionApplyConfig';
import DimensionReflexConfig from './components/DimensionReflexConfig';
import DimensionCumulativeConfig from './components/DimensionCumulativeConfig';
import Scene from './components/Scene';
import type { StoreValueType } from './stores';
import { Store } from './stores';
import { exportSceneApi, SceneFileUrls } from './utils/api';
import { getAttachmentUrlWithToken, parseFileError } from '../../utils/utils';
import style from './index.less';
import Styles from '../common.less';


const { Panel } = Collapse;
const defaultActiveKey = [
  'basic',
  'bill',
  'reflex-dimension',
  'apply-dimension',
  'cumulative-dimension',
  'scene',
];

const isTenant = isTenantRoleLevel();

const config = () =>
{
  return [
    {
      enable: true,
      code: 'SPFP_BASIC_CONFIGURATION_PLAT_CONFIG_BTN',
      type: 'strong',
      priority: 0,
      optionalSteps: true,
      steps: [
        {
          selector: '.injectGuide-plate-btn',
          title: intl.get('spfp.basicConfiguration.view.title.quotePlatConfig').d('引用平台级配置'),
          htmlText: intl
            .get('spfp.basicConfiguration.view.quotePlatConfig.info')
            .d('优惠政策基础配置支持快速引用，您可点击【引用平台级配置】后进行微调'),
          placement: 'bottom-right',
        },
      ],
    },
  ];
};

const ConfigAlert = () =>
{
  return (
    <Alert
      type="error"
      closable
      showIcon
      className={commonStyles['spfp-alert-error']}
      message={intl
        .get(`spfp.basicConfiguration.view.message.infoChangeWarning`)
        .d(
          '关联信息发生了调整，请注意检查相关配置，避免失效！'
        )}
    />
  );
};

const BasicConfiguration = observer(() =>
{
  injectGuide('/spfp/basic-configuration/detail', config as any);

  const { billDs,
    reflexDimensionDs,
    handlePlagFormConfig,
    dimensionDs,
    handleSave,
    isShowPlatFlag,
    loading,
    sceneMenuDs,
    querySceneInfo,
  } = useContext<StoreValueType>(Store);


  // 获取场景值集Ds
  const SceneExportLovDS = sceneMenuDs?.getField('scenarioConfigIdLov')?.getOptions(sceneMenuDs?.current);


  const
    [
      billIsEdit,
      reflexIsEdit,
      applyIsEdit,
    ] = [
        billDs.getState('isEditFlag'),
        reflexDimensionDs.getState('isEditFlag'),
        dimensionDs.getState('isEditFlag'),
      ];

  // 页面初始化时，编辑顺序自上而下
  const paneList = useMemo(() =>
  {
    return [
      billDs.length && {
        key: 'basic',
        header: intl.get(`spfp.basicConfiguration.view.title.basicConfig`).d('基础配置'),
        content: <BasicConfig />,
      } as any,
      {
        key: 'bill',
        header: intl.get(`spfp.basicConfiguration.view.title.billDefinition`).d('单据及字段定义'),
        content: <BillDefinition />,
      },
      billDs.length && {
        key: 'reflex-dimension',
        header: intl.get(`spfp.basicConfiguration.view.title.reflexDimensionConfiguration`).d('维度映射配置'),
        content: <Fragment>{billIsEdit && <ConfigAlert />}<DimensionReflexConfig /></Fragment>,
      } as any,
      billDs.length &&
      reflexDimensionDs.length &&
      {
        key: 'apply-dimension',
        header: intl.get(`spfp.basicConfiguration.view.title.applyDimensionConfiguration`).d('适用维度配置'),
        content: <Fragment>{(billIsEdit || reflexIsEdit) && <ConfigAlert />}<DimensionApplyConfig /></Fragment>,
      } as any,
      billDs.length &&
      reflexDimensionDs.length &&
      dimensionDs.length &&
      {
        key: 'cumulative-dimension',
        header: intl.get(`spfp.basicConfiguration.view.title.cumulativeDimensionConfiguration`).d('累计维度配置'),
        content: <Fragment>{(billIsEdit || reflexIsEdit || applyIsEdit) && <ConfigAlert />}<DimensionCumulativeConfig /></Fragment>,
      },
      {
        key: 'scene',
        header: '',
        content: <Scene />,
        className: style['spfp-basic-config-collapse-scene'],
      },
    ].filter((item) => item);
  }, [
    billDs.length,
    reflexDimensionDs.length,
    dimensionDs.length,
    billIsEdit,
    reflexIsEdit,
    applyIsEdit,
  ]);

  const handleExportLovOnOk = useCallback(async () =>
  {
    const selected = SceneExportLovDS?.selected || [];
    const ids = selected.map((item) => item?.get('scenarioConfigId'));
    const res = getResponse(await exportSceneApi(ids));
    if (!res) return false;
    getAttachmentUrlWithToken(res.fileUrl);
    return true;
  }, [SceneExportLovDS?.selected]);
  const uploadProps = useMemo(() =>
  {
    return {
      accept: ['.json', '.JSON'],
      fileList: [],
      name: 'file',
      action: SceneFileUrls.IMPORT,
      showUploadList: false,
      onUploadSuccess: (response, file) =>
      {
        parseFileError(file.response, querySceneInfo);
      },
    };
  }, [querySceneInfo]);

  if (!billDs) return <Spin />;
  return (
    <Fragment>
      <Header title={intl.get(`spfp.basicConfiguration.view.title.basicConfigurationInfo`).d('优惠政策基础配置')}>
        <Button
          color={ButtonColor.primary}
          icon="save"
          onClick={handleSave}
          loading={loading}
          wait={1500}
        >
          {intl.get('hzero.common.button.save').d('保存')}
        </Button>
        {isTenant && isShowPlatFlag && (
          <Button
            className='injectGuide-plate-btn'
            funcType={FuncType.flat}
            icon="filter_none"
            onClick={handlePlagFormConfig}
            loading={loading}
            wait={1500}
          >
            {intl
              .get(`spfp.basicConfiguration.view.basicConfiguration.platformConfig`)
              .d('引用平台级配置')}
          </Button>
        )}
        {isTenant && (
          <span className={Styles['spfp-btn-import']}>
            <Upload {...uploadProps}>
              <Button funcType={FuncType.flat} icon='archive' disabled={billDs.length === 0}>
                {intl.get(`spfp.common.view.button.importSceneJSONFile`).d('导入场景定义JSON文件')}
              </Button>
            </Upload>
          </span>
        )
        }
        {isTenant && (
          <Lov
            dataSet={sceneMenuDs}
            name="scenarioConfigIdLov"
            mode={ViewMode.button}
            clearButton={false}
            icon="unarchive"
            funcType={FuncType.flat}
            modalProps={{ onOk: handleExportLovOnOk }}
          >
            {intl.get(`spfp.common.view.button.exportSceneJSONFile`).d('导出场景定义JSON文件')}
          </Lov>
        )
        }
      </Header>
      <Content className={style['spfp-detail-content-basic-configuration']}>
        <Collapse
          ghost
          trigger="icon"
          expandIconPosition="text-right"
          defaultActiveKey={defaultActiveKey}
        >
          {paneList.map((item) =>
          {
            const { content, ...panelProps } = item;
            return (
              <Panel forceRender showArrow={false} {...panelProps}>
                {content}
              </Panel>
            );
          })}
        </Collapse>
      </Content>

    </Fragment>
  );
});


const BasicConfigurationComponent = (props) =>
{
  return (
    <StoreProvider {...props}>
      <BasicConfiguration />
    </StoreProvider>
  );
};


export default BasicConfigurationComponent;
