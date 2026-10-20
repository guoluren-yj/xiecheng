/* eslint-disable no-unused-expressions */
import React, { useCallback, useState, useEffect, useMemo } from 'react';
import { Header, Content } from 'components/Page';
import classnames from 'classnames';
import notification from 'utils/notification';
import { useDataSet, Icon, Dropdown } from 'choerodon-ui/pro';
import PermissionButton from 'srm-front-boot/lib/components/PermissionButton';
import { isEmpty, compose } from 'lodash';
import { observer } from 'mobx-react-lite';
import qs from 'querystring';
import intl from 'utils/intl';
import WithCustomizeC7N from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';
import DynamicButtons from '_components/DynamicButtons';
import { getResponse } from 'utils/utils';
import { release, editNew } from '@/services/bomDimConfigService';
import { batchValidateData } from '@/routes/spc/FormulaManage/utils';
import { renderHistoryVersion } from '../utils';
import styles from '../index.less';
import { BasicInfo, DimConfig } from './components';

import { BasicInfoDS, DimConfigDS } from './components/DataSet';

const Index = (props) => {
  const {
    customizeTable,
    customizeBtnGroup,
    history,
    match: { params },
    location: { search },
  } = props;

  const { bomTemplateId, type = 'create' } = params;
  const { sourceId, sourceType } = useMemo(() => qs.parse(search.substr(1)), [search]);

  const isEdit = !['view', 'history'].includes(type);
  const isHisFlag = type === 'history';

  const basicInfoDS = useDataSet(
    () => ({
      ...BasicInfoDS(bomTemplateId, isEdit),
    }),
    [bomTemplateId, isEdit]
  );

  const dimConfigDS = useDataSet(
    () => ({
      ...DimConfigDS(bomTemplateId),
      selection: false,
      queryParameter: {
        bomTemplateId,
      },
    }),
    [bomTemplateId]
  );

  const [loading, setLoading] = useState(false); // spin的loading

  useEffect(() => {
    initQuery();
  }, [bomTemplateId, isEdit]);

  // 查询
  const initQuery = async () => {
    if (bomTemplateId) {
      handleRefresh();
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    Promise.all([basicInfoDS.query(), dimConfigDS.query()]).finally(() => {
      setLoading(false);
    });
  };

  const saveData = useCallback(async () => {
    setLoading(true);
    const res = getResponse(
      await basicInfoDS.submit().finally(() => {
        setLoading(false);
      })
    );
    if (res) return res;
  });

  const releaseData = useCallback(async () => {
    setLoading(true);
    const res = getResponse(
      await release(basicInfoDS?.toData()).finally(() => {
        setLoading(false);
      })
    );
    if (res) {
      history.push({
        pathname: `/spc/bom-dim-config/list`,
      });
    }
  });

  const handleSaveDetail = async (operate = 'save') => {
    if (!bomTemplateId) {
      const validateFlag = await batchValidateData([basicInfoDS]);
      if (validateFlag) {
        const res = await saveData();
        const { content } = res;
        if (isEmpty(content)) return;
        // notification.success();
        history.push({
          pathname: `/spc/bom-dim-config/detail/${content[0].bomTemplateId}`,
        });
      }
    } else {
      const validateFlag = await batchValidateData([basicInfoDS, dimConfigDS]);
      if (!validateFlag) return;
      basicInfoDS.current.set({
        ssrcBomDimensionConfigs: dimConfigDS.toData(),
      });

      // 发布按钮
      if (operate === 'release') {
        await releaseData();
      } else {
        const res = await saveData();
        if (!res) return;
        handleRefresh();
      }
    }
  };

  // 跳转历史版本
  const handleViewHistory = (item) => {
    history.push({
      pathname: `/spc/bom-dim-config/history/${item.bomTemplateId}`,
      search: qs.stringify({
        sourceType,
        sourceId: sourceId || bomTemplateId,
      }),
    });
  };

  const handleEdit = async () => {
    const record = basicInfoDS.current;
    let resBomTemplateId = '';
    // 状态已发布、禁用，生成新版本
    if (['DISABLE', 'RELEASED'].includes(record.get('bomTemplateStatus'))) {
      setLoading(true);
      const res = await editNew(record.toData());
      setLoading(false);
      if (!getResponse(res)) return;
      notification.success();
      // eslint-disable-next-line prefer-destructuring
      resBomTemplateId = res?.bomTemplateId;
    }
    history.push({
      pathname: `/spc/bom-dim-config/detail/${resBomTemplateId || bomTemplateId}`,
    });
  };

  const getBackPath = useCallback(() => {
    // 来源单据有值，并且不是从列表进入，返回上一层页面
    if (sourceId && !sourceType) {
      return `/spc/bom-dim-config/view/${sourceId}`;
    }
    return '/spc/bom-dim-config/list';
  }, [sourceId]);

  const dynamicTitle = useMemo(
    () =>
      intl
        .get(`spc.bomDimConfig.view.title.${isHisFlag ? 'view' : type}BomDimConfigDetail`)
        .d('BOM结构配置明细'),
    [type, isHisFlag]
  );

  const HeaderButtons = observer(({ dataSet }) => {
    if (!basicInfoDS?.current) {
      return;
    }
    const onlySaveFlag = !bomTemplateId;
    const { versionList = [], bomTemplateLatestFlag, bomTemplateVersion, bomBeferStatus } =
      basicInfoDS.current.toData() || {};
    const showVersionList = versionList.filter(
      (item) => item.bomTemplateVersion !== bomTemplateVersion
    );
    // 已删除的不显示编辑按钮
    const deleteStatus = bomBeferStatus === 'DELETE';

    const buttons = [
      {
        name: 'edit',
        btnType: 'c7n-pro',
        hidden: isHisFlag || isEdit || bomTemplateLatestFlag !== 'P' || deleteStatus,
        child: intl.get('hzero.common.button.edit').d('编辑'),
        btnProps: {
          loading,
          icon: 'mode_edit',
          funcType: 'flat',
          onClick: handleEdit,
        },
      },
      {
        name: 'historyVersion',
        btnType: 'c7n-pro',
        hidden: isEdit || isEmpty(showVersionList),
        child: () => (
          <Dropdown
            overlay={() => renderHistoryVersion(showVersionList, handleViewHistory)}
            trigger={['hover']}
            placement="bottomRight"
          >
            <a
              style={{
                color: 'inherit',
              }}
            >
              {intl.get('ssrc.inquiryHall.view.inquiryHall.historyMode').d('历史版本')}
              <Icon
                type="expand_more"
                style={{ marginTop: '-2px', marginLeft: '4px', fontSize: '16px' }}
              />
            </a>
          </Dropdown>
        ),
        btnProps: {
          loading,
          icon: 'schedule',
          funcType: 'flat',
        },
      },
      {
        name: 'release',
        hidden: !isEdit || !bomTemplateId,
        btnType: 'c7n-pro',
        btnComp: PermissionButton,
        btnProps: {
          loading,
          wait: 500,
          icon: 'publish2',
          color: 'primary',
          type: 'c7n-pro',
          disabled: dataSet?.length === 0,
          // permissionList: [
          //   {
          //     code: 'srm.pc-admin.pc-purchaser.workspace2.ps.delete.button',
          //     type: 'button',
          //     meaning: '删除',
          //   },
          // ],
          onClick: () => handleSaveDetail('release'),
        },
        child: intl.get('hzero.common.button.release').d('发布'),
      },
      {
        name: 'save',
        hidden: !isEdit,
        btnType: 'c7n-pro',
        btnComp: PermissionButton,
        btnProps: {
          loading,
          wait: 500,
          icon: 'save',
          type: 'c7n-pro',
          color: onlySaveFlag ? 'primary' : '',
          funcType: onlySaveFlag ? 'raised' : 'flat',
          // permissionList: [
          //   {
          //     code: 'srm.pc-admin.pc-purchaser.workspace2.ps.delete.button',
          //     type: 'button',
          //     meaning: '删除',
          //   },
          // ],
          onClick: handleSaveDetail,
        },
        child: intl.get('hzero.common.button.save').d('保存'),
      },
    ];
    return <DynamicButtons buttons={buttons} />;
  });

  const commonProps = {
    isEdit,
    bomTemplateId,
    customizeTable,
    customizeBtnGroup,
    dataSet: basicInfoDS,
    record: basicInfoDS?.current,
  };

  return (
    <React.Fragment>
      <Header backPath={getBackPath()} title={dynamicTitle}>
        <HeaderButtons dataSet={dimConfigDS} />
      </Header>
      {!bomTemplateId && (
        <Content style={{ padding: '20px' }}>
          <h3 id="rfxBasicInfo" className={styles['create-base']}>
            {intl.get('spc.bomDimConfig.view.message.basicInfos').d('基础信息')}
          </h3>
          <BasicInfo {...commonProps} />
        </Content>
      )}
      {bomTemplateId && (
        <Content className={classnames('ued-detail-wrapper', styles['update-container'])}>
          <div className={styles['rfx-detail-list-card']}>
            <div className={styles['custom-page-content']}>
              <h3 id="rfxBasicInfo" className={styles['rfx-card-item-title']}>
                {intl.get('spc.bomDimConfig.view.message.basicInfos').d('基础信息')}
              </h3>
              <BasicInfo {...commonProps} />
            </div>
            <div className={styles['custom-page-content']}>
              <h3 id="rfxBasicInfo" className={styles['rfx-card-item-title']}>
                {intl.get('spc.bomDimConfig.view.title.dimManage').d(`维度管理`)}
              </h3>
              <DimConfig {...commonProps} dataSet={dimConfigDS} />
            </div>
          </div>
        </Content>
      )}
    </React.Fragment>
  );
};

export default compose(
  WithCustomizeC7N({
    unitCode: [],
  }),
  formatterCollections({
    code: [
      'ssrc.sourceTemplate',
      'ssrc.common',
      'entity.roles',
      'ssrc.inquiryHall',
      'ssrc.rulesDefinition',
      'hzero.common',
      'hpfm.individual',
      'ssrc.priceLibDimension',
      'spc.bomDimConfig',
      'spc.bomViewWorkbench',
    ],
  })
)(Index);
