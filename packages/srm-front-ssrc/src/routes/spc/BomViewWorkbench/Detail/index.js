/* eslint-disable no-unused-expressions */
import React, { useCallback, useState, useEffect, useMemo } from 'react';
import { Header, Content } from 'components/Page';
import classnames from 'classnames';
import notification from 'utils/notification';
import { useDataSet, Modal, DataSet, Dropdown, Icon } from 'choerodon-ui/pro';
import { DataSetSelection } from 'choerodon-ui/dataset/data-set/enum';
import PermissionButton from 'srm-front-boot/lib/components/PermissionButton';
import { isEmpty, compose, isNil, debounce } from 'lodash';
import { observer } from 'mobx-react-lite';
import qs from 'querystring';
import intl from 'utils/intl';
// import WithCustomizeC7N from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';
import DynamicButtons from '_components/DynamicButtons';
import { getResponse } from 'utils/utils';
import { yesOrNoRender } from 'utils/renderer';
import { DEBOUNCE_TIME } from 'utils/constants';

import { fetchBomLibHeaderConfig, release, editNew } from '@/services/bomViewWorkbenchService';
import ExportBtn from '@/routes/spc/components/OperationRecord/ExportBtn';
import { batchValidateData } from '@/routes/spc/FormulaManage/utils';
import { BusinessObject } from '@/routes/spc/BomDimConfig/enum';
import { WidgetFormTypeMap } from '@/routes/spc/BomViewWorkbench/enum';
import { renderHistoryVersion, renderFieldType, getDynamicProps } from '../utils';
import styles from '../index.less';
import { BasicInfo, DetailInfo } from './components';
import { BasicInfoDS, DetailInfoDS } from './components/DataSet';
import OperationRecord from '../../components/OperationRecord';
import { UnitPriceValue } from './modal';
import { FormDS } from './modal/UnitPriceValue/store';

// 新建时为动态增加列单独加的ds
let dynamicBasicInfoDS = new DataSet({});

const Index = (props) => {
  const {
    history,
    match: { params },
    location: { search },
  } = props;

  const { bomViewId, type = 'create' } = params;
  const { sourceId, sourceType } = useMemo(() => qs.parse(search.substr(1)), [search]);

  const isEdit = !['view', 'history'].includes(type);
  const isHisFlag = type === 'history';

  const [dynamicColumns, setDynamicColumns] = useState([]);
  const [headerDynamicColumns, setHeaderDynamicColumns] = useState([]);

  const basicInfoDS = useDataSet(
    () => ({
      ...BasicInfoDS(bomViewId, isEdit),
    }),
    [bomViewId, isEdit]
  );

  const detailInfoDS = useDataSet(
    () => ({
      ...DetailInfoDS(bomViewId),
      selection: isEdit && DataSetSelection.multiple,
    }),
    [bomViewId]
  );

  const [loading, setLoading] = useState(false); // spin的loading

  useEffect(() => {
    initQuery();
  }, [bomViewId, isEdit]);

  // 查询
  const initQuery = async () => {
    if (bomViewId) {
      handleRefresh(true);
    }
  };

  const handleRefresh = async (initFlag) => {
    setLoading(true);
    // 不为初始化，直接查询头行表
    if (initFlag) {
      // 初始化先查行表配置，再查行表数据
      await basicInfoDS.query();
      handleFetchBomLibHeaderConfig();
    } else {
      Promise.all([basicInfoDS.query(), detailInfoDS.query()]).finally(() => {
        setLoading(false);
      });
    }
  };

  const handleFetchBomLibHeaderConfig = async () => {
    const { bomTemplateId, bomTemplateCode } = basicInfoDS.current?.toData();
    const res = await fetchBomLibHeaderConfig({ bomTemplateId, bomTemplateCode });
    if (getResponse(res)) {
      addDsEvents(res, basicInfoDS);
      addDsEvents(res, detailInfoDS);

      transformColumns(res);
      await detailInfoDS.query().finally(() => {
        setLoading(false);
      });
    }
    setLoading(false);
  };

  const updateEvent = ({ record, value, name }, fields) => {
    fields.forEach((item) => {
      const { bomDimensionCode, lovMappings = [] } = item;
      if (lovMappings.length > 0 && name === bomDimensionCode) {
        lovMappings.forEach((i) => {
          record.set(
            i.targetFieldCode,
            typeof value === 'object' && value ? value[i.sourceFieldCode] : null
          );
        });
      }
    });
  };

  const addDsEvents = (fields, dataSet) => {
    dataSet.addEventListener('update', (param) => updateEvent(param, fields), false);
  };

  const extraFieldProps = (field) => {
    const { conHeaders, bomDimensionRequired, bomDimensionCode } = field;
    // 处理特殊字段，比如主物料
    switch (bomDimensionCode) {
      case 'bomViewItemId':
        return {
          dynamicProps: {
            disabled: ({ record }) => (record?.get('bomViewVersion') || 1) !== 1,
          },
        };
      default:
        break;
    }

    if (conHeaders) {
      return {
        dynamicProps: {
          required: ({ record }) => {
            return !!bomDimensionRequired && getDynamicProps(conHeaders, record, 'required');
          },
        },
      };
    }
  };

  const extraColumnProps = (field) => {
    const { bomDimensionWidget, bomDimensionCode, bomDimensionEditable } = field;
    if (bomDimensionWidget === 'LINK') {
      switch (bomDimensionCode) {
        case 'unitPrice':
          return {
            editor: false,
            renderer: ({ record }) => {
              return record.get('bomDetailsLineId') ? (
                <a
                  disabled={bomDimensionEditable === 0}
                  onClick={() => handleOpenUnitPrice(record, detailInfoDS)}
                >
                  {isEdit
                    ? intl.get('hzero.common.button.edit').d('编辑')
                    : intl.get(`hzero.common.button.view`).d('查看')}
                </a>
              ) : (
                '-'
              );
            },
          };
        default:
          return '-';
      }
    }
    if (bomDimensionWidget === 'CHECKBOX') {
      return {
        renderer: ({ value }) => (isNil(value) ? '-' : yesOrNoRender(value)),
      };
    }
  };

  const transformColumns = (data, transformType) => {
    const columns = [];
    const headerColumns = [];
    data
      .filter((item) => Number(item.bomDimensionVisible))
      .forEach((item) => {
        const {
          bomDimensionCode,
          bomDimensionName,
          bomDimensionRequired,
          bomDimensionWidth,
          bomDimensionEditable,
          bomDimensionWidget,
          businessObject,
        } = item;

        const dsFiedld = {
          name: bomDimensionCode,
          label: bomDimensionName,
          required: !!bomDimensionRequired,
          ...renderFieldType(item),
          ...extraFieldProps(item),
        };
        if (businessObject === BusinessObject.HEADER) {
          // 修改bom时，用动态ds，方便后续切换价格BOM，清空ds
          if (transformType === 'changeBom') {
            dynamicBasicInfoDS.addField(bomDimensionCode, dsFiedld);
          } else {
            basicInfoDS.addField(bomDimensionCode, dsFiedld);
            if (bomDimensionCode === 'bomViewItemId') {
              // bomViewItemId要求显示为物料编码
              basicInfoDS.addField('bomViewItemCode', {
                name: 'bomViewItemCode',
                bind: 'bomViewItemId.itemCode',
              });
            }
          }
          headerColumns.push({
            name: bomDimensionCode,
            formType: WidgetFormTypeMap[bomDimensionWidget],
            disabled: !bomDimensionEditable,
          });
        } else {
          // 单价如果是链接不管是否是必输都给后端做校验
          if (bomDimensionCode === 'unitPrice' && bomDimensionWidget === 'LINK') {
            dsFiedld.required = false;
          }
          // 默认放入表格中
          detailInfoDS.addField(bomDimensionCode, dsFiedld);
          columns.push({
            name: bomDimensionCode,
            width: bomDimensionWidth || 120,
            editor: !!bomDimensionEditable && isEdit,
            ...extraColumnProps(item),
          });
        }
      });
    setDynamicColumns([...columns]);
    setHeaderDynamicColumns([...headerColumns]);
  };

  const handleOpenUnitPrice = async (record) => {
    const bomDetailsLineId = record.get('bomDetailsLineId');
    const formDS = new DataSet(FormDS(bomDetailsLineId, isEdit));
    const modalProps = {
      isEdit,
      bomDetailsLineId,
      formDS,
    };

    Modal.open({
      title: isEdit
        ? intl.get('spc.bomViewWorkbench.view.title.editUnitPrice').d('编辑单价')
        : intl.get('spc.bomViewWorkbench.view.title.unitPrice').d('查看单价'),
      destroyOnClose: true,
      style: { width: '742px' },
      drawer: true,
      closable: true,
      children: <UnitPriceValue {...modalProps} />,
    });
  };

  const saveData = useCallback(async () => {
    setLoading(true);
    if (!bomViewId) {
      basicInfoDS.current.set(...(dynamicBasicInfoDS?.toJSONData() || {}));
    }
    const res = getResponse(
      await basicInfoDS.submit().finally(() => {
        setLoading(false);
      })
    );
    if (res) return res;
  });

  const handleSaveDetail = async (operate = 'save') => {
    if (!bomViewId) {
      const validateFlag = await batchValidateData([basicInfoDS, dynamicBasicInfoDS]);
      if (validateFlag) {
        const res = await saveData();
        const { content } = res || {};
        if (isEmpty(content) || isNil(res)) return;
        // notification.success();
        history.push({
          pathname: `/spc/bom-view-workbench/detail/${content[0].bomViewId}`,
        });
      }
    } else {
      const validateFlag = await batchValidateData([basicInfoDS, detailInfoDS]);
      if (!validateFlag) return;
      basicInfoDS.current.set({
        bomViewDetailsLineList: detailInfoDS?.toData(),
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

  // 变更物料BOM
  const handleChangeBomTemplate = debounce(async (val) => {
    setLoading(true);
    // 重置ds
    dynamicBasicInfoDS = new DataSet();
    dynamicBasicInfoDS.create({});
    setHeaderDynamicColumns([]);
    if (val) {
      const { bomTemplateId, bomTemplateCode } = val;
      const res = await fetchBomLibHeaderConfig({ bomTemplateId, bomTemplateCode });
      if (getResponse(res)) {
        addDsEvents(res, dynamicBasicInfoDS);
        transformColumns(res, 'changeBom');
      }
    }
    setLoading(false);
  }, DEBOUNCE_TIME);

  const releaseData = useCallback(async () => {
    setLoading(true);
    const res = getResponse(
      await release(basicInfoDS?.toData()).finally(() => {
        setLoading(false);
      })
    );
    if (res) {
      history.push({
        pathname: `/spc/bom-view-workbench/list`,
      });
    }
  });

  // 跳转历史版本
  const handleViewHistory = (item) => {
    history.push({
      pathname: `/spc/bom-view-workbench/history/${item.bomViewId}`,
      search: qs.stringify({
        sourceType,
        sourceId: sourceId || bomViewId,
      }),
    });
  };

  const handleEdit = async () => {
    const record = basicInfoDS.current;
    let resbomViewId = '';
    // 状态已发布、禁用，生成新版本
    if (['DISABLE', 'RELEASED'].includes(record.get('bomViewStatus'))) {
      setLoading(true);
      const res = await editNew(record.toData());
      setLoading(false);
      if (!getResponse(res)) return;
      notification.success();
      // eslint-disable-next-line prefer-destructuring
      resbomViewId = res?.bomViewId;
    }
    history.push({
      pathname: `/spc/bom-view-workbench/detail/${resbomViewId || bomViewId}`,
    });
  };

  const getBackPath = useCallback(() => {
    // 来源单据有值，并且不是从列表进入，返回上一层页面
    if (sourceId && !sourceType) {
      return `/spc/bom-view-workbench/view/${sourceId}`;
    }
    return '/spc/bom-view-workbench/list';
  }, [sourceId]);

  const dynamicTitle = useMemo(
    () =>
      intl
        .get(`spc.bomViewWorkbench.view.title.${isHisFlag ? 'view' : type}BomViewWorkbenchDetail`)
        .d('价格BOM明细'),
    [type, isHisFlag]
  );

  const operateHistory = async () => {
    const businessKey = basicInfoDS?.current?.get('businessKey');
    if (!bomViewId) return;
    let filterBarRef = null;
    const modalProps = {
      businessKey,
      showFlag: true,
      onlyOperation: true,
      operateParams: { docId: bomViewId, docType: 'BOMVIEW' },
      title: `【${intl.get('spc.bomViewWorkbench.view.title.priceBOM').d('价格BOM')}】`,
    };
    Modal.open({
      key: Modal.key(),
      title: intl.get('hzero.common.view.message.operateHistory').d('操作记录'),
      style: {
        width: '742px',
      },
      drawer: true,
      children: (
        <OperationRecord
          {...modalProps}
          onRef={(ref) => {
            filterBarRef = ref;
          }}
        />
      ),
      okText: intl.get('ssrc.common.view.button.close').d('关闭'),
      footer: (okButton) => {
        return (
          <>
            {okButton}
            <ExportBtn documentId={bomViewId} documentType="BOMVIEW" getRef={() => filterBarRef} />
          </>
        );
      },
    });
  };

  const HeaderButtons = observer(({ dataSet }) => {
    if (!basicInfoDS?.current) {
      return;
    }
    const onlySaveFlag = !bomViewId;
    const { versionList = [], bomViewLatestFlag, bomViewVersion, bomViewStatus } =
      basicInfoDS.current.toData() || {};
    const showVersionList = versionList.filter((item) => item.bomViewVersion !== bomViewVersion);
    // 已删除的不显示编辑按钮
    const deleteStatus = bomViewStatus === 'DELETE';
    const buttons = [
      {
        name: 'edit',
        btnType: 'c7n-pro',
        hidden: isHisFlag || isEdit || bomViewLatestFlag !== 'P' || deleteStatus,
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
        hidden: !isEdit || !bomViewId,
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
      {
        name: 'operateHistory',
        child: intl.get('hzero.common.view.message.operateHistory').d('操作记录'),
        btnType: 'c7n-pro',
        btnProps: {
          funcType: 'flat',
          icon: 'operation_service_request',
          onClick: operateHistory,
        },
      },
    ];
    return <DynamicButtons buttons={buttons} />;
  });

  const commonProps = {
    isEdit,
    bomViewId,
    dataSet: basicInfoDS,
    record: basicInfoDS?.current,
  };

  const extraProps = {
    dynamicBasicInfoDS,
    dynamicColumns: headerDynamicColumns,
    onChangeBomTemplate: handleChangeBomTemplate,
  };

  return (
    <React.Fragment>
      <Header backPath={getBackPath()} title={dynamicTitle}>
        <HeaderButtons dataSet={detailInfoDS} />
      </Header>
      {!bomViewId && (
        <Content style={{ padding: '20px' }}>
          <h3 id="rfxBasicInfo" className={styles['create-base']}>
            {intl.get('spc.bomDimConfig.view.message.basicInfos').d('基础信息')}
          </h3>
          <BasicInfo {...commonProps} {...extraProps} />
        </Content>
      )}
      {bomViewId && (
        <Content className={classnames('ued-detail-wrapper', styles['update-container'])}>
          <div className={styles['rfx-detail-list-card']}>
            <div className={styles['custom-page-content']}>
              <h3 id="rfxBasicInfo" className={styles['rfx-card-item-title']}>
                {intl.get('spc.bomDimConfig.view.message.basicInfos').d('基础信息')}
              </h3>
              <BasicInfo {...commonProps} dynamicColumns={headerDynamicColumns} />
            </div>
            <div className={styles['custom-page-content']}>
              <h3 id="rfxBasicInfo" className={styles['rfx-card-item-title']}>
                {intl.get('spc.bomViewWorkbench.view.title.detailInfo').d(`明细信息`)}
              </h3>
              <DetailInfo {...commonProps} dynamicColumns={dynamicColumns} dataSet={detailInfoDS} />
            </div>
          </div>
        </Content>
      )}
    </React.Fragment>
  );
};

export default compose(
  formatterCollections({
    code: [
      'ssrc.sourceTemplate',
      'ssrc.common',
      'ssrc.inquiryHall',
      'ssrc.rulesDefinition',
      'hzero.common',
      'ssrc.priceLibDimension',
      'ssrc.priceLibrary',
      'ssrc.priceService',
      'spc.bomDimConfig',
      'spc.bomViewWorkbench',
      'spc.formulaManage',
      'entity.roles',
      'hzero.c7nProUI',
    ],
  })
)(Index);
