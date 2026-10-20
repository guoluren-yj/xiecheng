// PPAP详情
import React, { Fragment, useMemo, useCallback, useContext } from 'react';
import { Button, Icon, Spin, Dropdown, Tabs } from 'choerodon-ui/pro';
import { Placements } from 'choerodon-ui/pro/lib/dropdown/enum';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
// import { DataToJSON } from 'choerodon-ui/dataset/data-set/enum';
import { TabsPosition } from 'choerodon-ui/lib/tabs/enum';
import { observer } from 'mobx-react';
import intl from 'utils/intl';
import { Header, Content } from 'components/Page';
import { getResponse, filterNullValueObject } from 'utils/utils';
import { throttle } from 'lodash';
import { getActiveTabKey, updateTab } from 'utils/menuTab';
import { stringify } from 'querystring';

import { confirmHandleEnable } from '../../../utils/utils';
import type { StoreValueType } from './stores/StoreProvider';
import { Store, DetailStore } from './stores/StoreProvider';
import BasicInfo from './component/BasicInfo';
import ApprovalList from './component/ApprovalList';
import DeliverableList from './component/DeliverableList';
import StageList from './component/StageList';
import HistoryVersion from '../components/HistoryVersion';
import { notifyValidErrors } from '../utils/utils';
import type { Operate, SubmitType } from '../utils/type';
import { editTemplate } from './stores/api';
import styles from './index.less';

const { TabPane } = Tabs;


const Detail = observer(() => {
  const {
    history,
    operate,
    editFlag,
    viewFlag,
    headerDs,
    handleBackList,
    handleToDetail,
    copyFlag,
    approvalLineDs,
    deliverableLineDs,
    stageLineDs,
    noBackFlag,
    activeTabKey,
    viewVersion,
    handleTabChange,
    location,
    permissionMap,
  } = useContext<StoreValueType>(Store);
  const { state, pathname, search } = location;
  const {
    templateNum,
    versionNumber,
    templateId,
    parentDisplayStatus,
    templateStatus,
    snapshotFlag,
  } = headerDs.current?.get(['templateNum', 'versionNumber', 'templateId', 'parentDisplayStatus', 'templateStatus', 'snapshotFlag']) || {};
  const loading = headerDs.status !== 'ready';

  const titlePrefixMap: Record<Operate, string> = useMemo(() => {
    return {
      edit: intl.get('hzero.common.button.edit').d('编辑'),
      view: intl.get('hzero.common.button.query').d('查询'),
      copy: intl.get('hzero.common.button.copy').d('复制'),
    };
  }, []);

  const tltle: string = useMemo(() => {
    const titlePrefix = !templateId ? intl.get('hzero.common.model.creation').d('新建') : titlePrefixMap[operate] || '';
    const titleSuffix = templateNum && versionNumber ? ` ${templateNum}-${versionNumber}` : '';
    const titleContent = intl.get('sqam.ppap.view.title.ppapTemplate').d('PPAP项目模板');
    return titlePrefix + titleContent + titleSuffix;
  }, [templateNum, versionNumber, titlePrefixMap, operate, templateId]);

  const tabList = useMemo(() => {
    return [
      {
        key: 'basic',
        header: intl.get(`sqam.ppap.model.template.baseInfo`).d('基本信息'),
        content: <BasicInfo />,
      },
      {
        key: 'approval',
        header: intl.get(`sqam.ppap.model.template.projectApprovalWay`).d('项目审批方式'),
        content: <ApprovalList />,
      },
      {
        key: 'deliverable',
        header: intl.get(`sqam.ppap.model.template.deliverableConfig`).d('交付物配置'),
        content: <DeliverableList />,
      },
      {
        key: 'stage',
        header: intl.get(`sqam.ppap.model.template.stageConfig`).d('阶段配置'),
        content: <StageList />,
      },
    ];
  }, []);

  /**
   * @description: DataSet提交方法
   * @param {SubmitType} submitType 提交类型
   * @return {object | undefined} 提交方法返回
   */
  const handleSubmit = useCallback(async (submitType: SubmitType) => {
    // 校验
    const validRes = await headerDs.validate();
    // 校验失败，通知校验内容
    if (!validRes) {
      notifyValidErrors(headerDs);
      return undefined;
    };
    const res = await headerDs.setState('submitType', submitType).forceSubmit();
    return res;
  }, [headerDs]);

  // 保存按钮响应
  const handleSave = useCallback(async () => {
    if (!templateId) {
      // 新建
      const res = await handleSubmit('create');
      if (!res) return;
      const { templateId: id } = res.content[0] || {};
      handleToDetail(id, 'edit', 'approval');
      return;
    }
    if (editFlag) {
      const res = await handleSubmit('save');
      if (!res) return;
      // 需要更新列表数据(列表有分页)
      headerDs.loadData(res.content);
      approvalLineDs.query(undefined, undefined, true);
      deliverableLineDs.query(undefined, undefined, true);
      stageLineDs.query(undefined, undefined, true);
    } else if (copyFlag) {
      const res = await handleSubmit('copy');
      if (!res) return;
      const { templateId: id } = res.content[0] || {};
      handleToDetail(id, 'edit');
    }
  }, [editFlag, headerDs, handleSubmit, handleToDetail, approvalLineDs, deliverableLineDs, stageLineDs, copyFlag, templateId]);

  // 发布按钮响应
  const handleRelease = useCallback(async () => {
    const res = await handleSubmit('release');
    if (!res) return;
    handleBackList();
  }, [handleSubmit, handleBackList]);

  const handleReleaseBefore = useCallback(async () => {
    if (parentDisplayStatus === 'DISABLE') {
      const res = await confirmHandleEnable();
      if (res) handleRelease();
    } else handleRelease();
  }, [handleRelease, parentDisplayStatus]);

  const updateTabLink = useCallback((searchInfo, stateKey) => {
    updateTab({
      key: getActiveTabKey(),
      search: searchInfo,
      state: stateKey,
    });
  }, []);

  const handleEdit = useCallback(async () => {
    const res = getResponse(await editTemplate({ templateId }));
    if (!res) return;
    updateTabLink(stringify(filterNullValueObject({ operate: 'edit'})), {
      backPath: `${pathname}${search}`,
    });
    history.push({
      pathname: `/sqam/PPAPTemplate/detail/${res.templateId}`,
      search: stringify(filterNullValueObject({ operate: 'edit' })),
      state: {
        backPath: `${pathname}${search}`,
      },
    });
  }, [updateTabLink, history, search, pathname, templateId]);

  const backPath = useMemo(() => {
    return state?.backPath || '/sqam/PPAPTemplate/list';
  }, [state]);

  return (
    <Fragment>
      <Header title={tltle} backPath={!noBackFlag && backPath}>
        {!viewFlag && [
          editFlag && permissionMap?.get('publish') && (
            <Button icon="publish2" color={ButtonColor.primary} onClick={throttle(handleReleaseBefore, 1500, { trailing: false })} loading={loading}>
              {intl.get('hzero.common.button.publish').d('发布')}
            </Button>
          ),
          permissionMap?.get('edit') && (
            <Button
              icon="save"
              loading={loading}
              color={editFlag ? ButtonColor.default : ButtonColor.primary}
              funcType={editFlag ? FuncType.flat : FuncType.raised}
              onClick={throttle(handleSave, 1500, { trailing: false })}
            >
              {intl.get('hzero.common.button.save').d('保存')}
            </Button>
          ),
        ]}
        {!noBackFlag && viewFlag && !viewVersion && Number(snapshotFlag) === 1 && permissionMap?.get('edit') && [
          <Button icon="mode_edit" color={ButtonColor.default} funcType={FuncType.flat} onClick={throttle(handleEdit, 1500, { trailing: false })} loading={loading}>
            {intl.get('hzero.common.button.edit').d('编辑')}
          </Button>,
        ]}
        {
          templateId && viewFlag && templateStatus === 'PUBLISHED' && (
            <Dropdown
              placement={Placements.bottomRight}
              overlay={<HistoryVersion templateNum={templateNum} currentTemplateId={templateId} history={history} />}
            >
              <Button funcType={FuncType.flat} icon="schedule" loading={loading}>
                <span>{intl.get('hzero.common.button.historyVerison').d('历史版本')}</span>
                <Icon type="expand_more" />
              </Button>
            </Dropdown>
          )
        }
      </Header>
      <div className={styles['sqam-ppap-content']}>
        <Content>
          <div className={styles['sqam-ppap-detail']}>
            <Spin spinning={loading} wrapperClassName="full-height-spinning">
              {
                !templateId ? (
                  <div style={{padding: '20px'}}>
                    <div className={styles['sqam-ppap-header']}>
                      {intl.get(`sqam.ppap.model.template.baseInfo`).d('基本信息')}
                    </div>
                    <BasicInfo />
                  </div>
                ) : (
                  <Tabs tabPosition={TabsPosition.left} onChange={handleTabChange} activeKey={activeTabKey}>
                    {tabList.map((item) => {
                      const { content, key, header } = item;
                      return (
                        <TabPane key={key} tab={header}>
                          {content}
                        </TabPane>
                      );
                    })}
                  </Tabs>
                )
              }
            </Spin>
          </div>
        </Content>
      </div>
    </Fragment>
  );
});

const PPAPTemplateDetail = (props) => {
  return <DetailStore {...props}><Detail /></DetailStore>;
};

export default PPAPTemplateDetail;
