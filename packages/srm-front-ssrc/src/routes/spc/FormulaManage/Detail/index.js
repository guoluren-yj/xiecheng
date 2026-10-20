import React, { useCallback, useState, useEffect, useMemo } from 'react';
import { Header, Content } from 'components/Page';
import classnames from 'classnames';
import notification from 'utils/notification';
import { Modal, Output, Form, useDataSet, Dropdown, Icon } from 'choerodon-ui/pro';
import { DataSetSelection } from 'choerodon-ui/dataset/data-set/enum';
import PermissionButton from 'srm-front-boot/lib/components/PermissionButton';
import { isEmpty, compose } from 'lodash';
import { observer } from 'mobx-react-lite';
import qs from 'querystring';
import intl from 'utils/intl';
import WithCustomizeC7N from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';
import DynamicButtons from '_components/DynamicButtons';
import { getResponse } from 'utils/utils';
import { getFieldList, editNewFormula } from '@/services/formulaManageService';

import { batchValidateData, onRelease, renderHistoryVersion } from '../utils';
import styles from '../index.less';
import { BasicInfo, AssignItemBom, CalcFormula } from './components';

import FormulaLadderConfig from './modal/FormulaLadderConfig';
import { BasicInfoDS, AssignItemBomDS } from './components/DataSet';

const Index = (props) => {
  const functionList = [
    {
      id: '1',
      langStr: intl.get('spc.formulaManage.view.title.mathFunction').d('数学函数'),
      parentId: null,
      expand: true,
    },
    {
      dtoCode: 'ROUND(,)',
      id: '1-1',
      isEnd: null,
      langStr: 'ROUND()',
      parentId: '1',
      tooltip: intl
        .get('spc.formulaManage.view.title.roundFunctionTips')
        .d('函数说明：ROUND(x,y)，x四舍五入保留y位小数。'),
    },
    {
      dtoCode: 'SUM()',
      id: '1-2',
      isEnd: null,
      langStr: 'SUM()',
      parentId: '1',
      tooltip: intl
        .get('spc.formulaManage.view.title.sumFunctionTips')
        .d('函数说明：SUM(x)，加总x的值。'),
    },
    {
      dtoCode: 'ROUNDDOWN(,)',
      id: '1-4',
      isEnd: null,
      langStr: 'ROUNDDOWN()',
      parentId: '1',
      tooltip: intl
        .get('spc.formulaManage.view.title.roundDownFunctionTips')
        .d('函数说明：ROUNDDOWN(x,y)，x向下取整保留y位小数。'),
    },
    {
      dtoCode: 'DIV(,,)',
      id: '1-5',
      isEnd: null,
      langStr: 'DIV()',
      parentId: '1',
      tooltip: intl
        .get('spc.formulaManage.view.title.divFunctionTips')
        .d('函数说明：DIV(x,y,z) ，计算x除以y四舍五入保留z位小数。'),
    },
  ];
  const {
    customizeTable,
    customizeForm,
    customizeBtnGroup,
    history,
    match: { params },
    location: { search },
  } = props;

  const { formulaId, type = 'create' } = params;
  const { sourceId, sourceType } = useMemo(() => qs.parse(search.substr(1)), [search]);

  const isEdit = !['view', 'assign-item-bom', 'history'].includes(type);
  const isAssign = type === 'assign-item-bom';
  const assignItemBomEdit = isEdit || isAssign;
  const isHisFlag = type === 'history';
  const assignItemBomCustCode = assignItemBomEdit
    ? 'SPC.PRICE_FORMULA_MANAGE.DETAIL.ASSIGNBOM'
    : 'SPC.PRICE_FORMULA_MANAGE.DETAIL.ASSIGNBOM.READONLY';

  const basicInfoDS = useDataSet(
    () => ({
      ...BasicInfoDS(isEdit),
      queryParameter: {
        formulaId,
      },
    }),
    [formulaId, isEdit]
  );

  const assignItemBomDS = useDataSet(
    () => ({
      ...AssignItemBomDS(formulaId, basicInfoDS, assignItemBomCustCode),
      selection: assignItemBomEdit && DataSetSelection.multiple,
      queryParameter: {
        formulaId,
      },
    }),
    [formulaId]
  );

  const [loading, setLoading] = useState(false); // spin的loading
  const [saveloading, setSaveLoading] = useState(false); // btnLoading
  const [fieldList, setFieldList] = useState([]);
  const [tempFormulaInfo, setTempFormulaInfo] = useState({});

  const btnLoading = loading || saveloading;

  useEffect(() => {
    initQuery();
  }, [formulaId, isEdit]);

  // 查询
  const initQuery = async () => {
    if (formulaId) {
      handleRefresh();
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    await Promise.all([basicInfoDS.query(), assignItemBomDS.query()])
      .finally(() => {
        setLoading(false);
      })
      .then(() => {
        handleGetFieldList();
      });
  };

  // 获取公式左边参数列表
  const handleGetFieldList = async () => {
    const { bomTemplateId, bomTemplateCode } = basicInfoDS?.current?.get('bomStructureId') || {};
    if (bomTemplateId) {
      const res = getResponse(
        await getFieldList({ bomStructureId: bomTemplateId, bomTemplateCode })
      );
      if (res) {
        setFieldList(res);
      }
    }
  };

  // 保存数据
  const saveData = useCallback(async (operate) => {
    setLoading(true);
    const res = getResponse(
      await basicInfoDS.submit().finally(() => {
        setLoading(false);
      })
    );
    if (res) {
      if (operate !== 'release') {
        notification.success();
      }
      return res;
    }
  });

  const handleSaveDetail = async (operate = 'save') => {
    if (!formulaId) {
      const validateFlag = await batchValidateData([basicInfoDS]);
      if (validateFlag) {
        const res = await saveData();
        const { content } = res;
        if (isEmpty(content)) return;
        // notification.success();
        history.push({
          pathname: `/spc/formula-manage/detail/${content[0].formulaId}`,
        });
      }
    } else {
      // 公式校验不通过
      if (isEmpty(tempFormulaInfo)) return;
      // 将临时存储的公式放入ds
      basicInfoDS.current.set(tempFormulaInfo);
      try {
        setSaveLoading(true);
        const validateFlag = await batchValidateData([basicInfoDS, assignItemBomDS]);
        if (!validateFlag) {
          setSaveLoading(false);
          return;
        }
        basicInfoDS.current.set({
          priceFormulaBomRelList: assignItemBomDS.toJSONData(),
        });
        const res = await saveData(operate);
        if (!res) {
          return;
        }
        await handleRefresh();
        // 发布按钮
        if (operate === 'release') {
          // 公式调价单独弹窗，取消loading
          // if (basicInfoDS.current.get('formulaTypeCode') === 'FORMULA_ADJUSTMENT') {
          //   setLoading(false);
          // }
          await onRelease(basicInfoDS.current, afterRelease);
        }
      } finally {
        setSaveLoading(false);
      }
    }
  };

  // 发布分配数据
  const handleReleaseAssign = async () => {
    setSaveLoading(true);
    const validateFlag = await batchValidateData([assignItemBomDS]);
    if (!validateFlag) {
      setSaveLoading(false);
      return;
    }
    const deleteLines = assignItemBomDS.getState('deleteLines');
    const releaseData = assignItemBomDS.toJSONData() || [];
    if (deleteLines) {
      deleteLines.forEach((rec) => {
        releaseData.push({ ...rec.toJSONData(), _status: 'delete' });
      });
    }
    basicInfoDS.current.set({
      priceFormulaBomRelList: releaseData,
    });
    await onRelease(basicInfoDS.current, afterRelease);
    setSaveLoading(false);
  };

  const afterRelease = () => {
    history.push({
      pathname: `/spc/formula-manage/list`,
    });
  };

  // 跳转历史版本
  const handleViewHistory = (item) => {
    history.push({
      pathname: `/spc/formula-manage/history/${item.formulaId}`,
      search: qs.stringify({
        sourceType,
        sourceId: sourceId || formulaId,
      }),
    });
  };

  const handleEdit = async () => {
    const record = basicInfoDS.current;
    let resFormulaId = '';
    // 状态已发布、禁用，生成新版本
    if (['DISABLE', 'RELEASED'].includes(record.get('formulaStatusCode'))) {
      setLoading(true);
      const res = await editNewFormula([record.toData()]);
      setLoading(false);
      if (!getResponse(res)) return;
      notification.success();
      // eslint-disable-next-line prefer-destructuring
      resFormulaId = res[0].formulaId;
    }
    history.push({
      pathname: `/spc/formula-manage/detail/${resFormulaId || formulaId}`,
    });
  };

  const getBackPath = useCallback(() => {
    // 来源单据有值，并且不是从列表进入，返回上一层页面
    if (sourceId && !sourceType) {
      return `/spc/formula-manage/view/${sourceId}`;
    }
    return '/spc/formula-manage/list';
  }, [sourceId]);

  const dynamicTitle = useMemo(
    () =>
      intl
        .get(`spc.formulaManage.view.title.${isHisFlag ? 'view' : type}FormulaManageDetail`)
        .d('公式详情配置'),
    [type, isHisFlag]
  );

  const HeaderButtons = observer(({ dataSet }) => {
    if (!basicInfoDS?.current) {
      return;
    }
    // 新建或者分配物料bom时，只有保存按钮
    const onlySaveFlag = !formulaId || isAssign;
    const { versionList = [], latestFlag, versionNum } = basicInfoDS.current.toData() || {};
    const showVersionList = versionList.filter((item) => item.versionNum !== versionNum);

    const buttons = [
      {
        name: 'edit',
        btnType: 'c7n-pro',
        btnComp: PermissionButton,
        hidden: isHisFlag || latestFlag !== 'P' || assignItemBomEdit,
        child: intl.get('hzero.common.button.edit').d('编辑'),
        btnProps: {
          loading: btnLoading,
          icon: 'mode_edit',
          funcType: 'flat',
          onClick: handleEdit,
          permissionList: [
            {
              code: 'srm.ssrc.price.model.formula-manage.button.edit',
              type: 'button',
              meaning: '编辑',
            },
          ],
        },
      },
      {
        name: 'historyVersion',
        btnType: 'c7n-pro',
        hidden: assignItemBomEdit || isEmpty(versionList),
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
          loading: btnLoading,
          icon: 'schedule',
          funcType: 'flat',
        },
      },
      {
        name: 'release',
        hidden: !assignItemBomEdit || !formulaId,
        btnType: 'c7n-pro',
        btnComp: PermissionButton,
        btnProps: {
          loading: btnLoading,
          icon: 'publish2',
          color: 'primary',
          type: 'c7n-pro',
          disabled: dataSet?.length === 0,
          permissionList: [
            {
              code: 'srm.ssrc.price.model.formula-manage.button.release',
              type: 'button',
              meaning: '发布',
            },
          ],
          onClick: () => {
            if (isAssign) {
              return handleReleaseAssign();
            }
            return handleSaveDetail('release');
          },
        },
        child: intl.get('hzero.common.button.release').d('发布'),
      },
      {
        name: 'save',
        hidden: !isEdit,
        btnType: 'c7n-pro',
        btnComp: PermissionButton,
        btnProps: {
          loading: btnLoading,
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
    isAssign,
    formulaId,
    customizeForm,
    customizeTable,
    customizeBtnGroup,
    record: basicInfoDS?.current,
    dataSet: basicInfoDS,
  };

  const calcFormulaProps = {
    functionList,
    fieldList,
    onBlur: (formulaInfo) => {
      setTempFormulaInfo(formulaInfo);
    },
  };

  // 展示阶梯公式
  const FormulaLdder = observer(({ dataSet }) => {
    const { bomFlag = 0, operationalFormula, formulaLadderCount } =
      dataSet?.current?.toData() || {};
    return (
      <div className={styles['config-ladder']}>
        <Form
          labelLayout={isEdit ? 'float' : 'vertical'}
          className={isEdit ? styles['float-output'] : 'c7n-pro-vertical-form-display'}
          dataSet={dataSet}
          columns={3}
        >
          <Output
            name="configLadder"
            style={{ fontWeight: 400 }}
            renderer={() => (
              <a disabled={!operationalFormula || bomFlag === 0} onClick={handleOpenFormulaLadder}>
                {assignItemBomEdit
                  ? intl.get('hzero.common.button.edit').d('编辑')
                  : intl.get(`hzero.common.button.view`).d('查看')}
                {formulaLadderCount ? `（${formulaLadderCount}）` : ''}
              </a>
            )}
          />
        </Form>
      </div>
    );
  });

  // 展示阶梯弹窗
  const handleOpenFormulaLadder = () => {
    Modal.open({
      title: assignItemBomEdit
        ? intl.get('spc.formulaManage.view.title.formulaLadderConfig').d('公式阶梯配置')
        : intl.get('spc.formulaManage.view.title.viewLadderConfig').d('查看阶梯配置'),
      destroyOnClose: true,
      style: { width: '1090px' },
      bodyStyle: {
        padding: 0,
        overflow: 'hidden',
      },
      drawer: true,
      closable: true,
      children: (
        <FormulaLadderConfig
          assignItemBomDS={assignItemBomDS}
          {...commonProps}
          {...calcFormulaProps}
        />
      ),
      afterClose: () => {
        if (isEdit) {
          setLoading(true);
          basicInfoDS.query().then(() => {
            setLoading(false);
          });
        }
      },
    });
  };

  return (
    <React.Fragment>
      <Header backPath={getBackPath()} title={dynamicTitle}>
        <HeaderButtons dataSet={assignItemBomDS} />
      </Header>
      {!formulaId && (
        <Content style={{ padding: '20px' }}>
          <h3 id="rfxBasicInfo" className={styles['create-base']}>
            {intl.get('ssrc.common.view.message.basicInfos').d('基础信息')}
          </h3>
          <BasicInfo {...commonProps} />
        </Content>
      )}
      {formulaId && (
        <Content className={classnames('ued-detail-wrapper', styles['update-container'])}>
          <div className={styles['rfx-detail-list-card']}>
            <div className={styles['custom-page-content']}>
              <h3 id="rfxBasicInfo" className={styles['rfx-card-item-title']}>
                {intl.get('ssrc.common.view.message.basicInfos').d('基础信息')}
              </h3>
              <BasicInfo {...commonProps} />
            </div>
            <div className={styles['custom-page-content']}>
              <h3 id="rfxBasicInfo" className={styles['rfx-card-item-title']}>
                {intl.get('spc.formulaManage.view.title.assignItemBom').d(`分配物料BOM`)}
              </h3>
              <AssignItemBom
                {...commonProps}
                dataSet={assignItemBomDS}
                headerDS={basicInfoDS}
                isEdit={assignItemBomEdit}
                assignItemBomCustCode={assignItemBomCustCode}
              />
            </div>
            <div className={styles['custom-page-content']}>
              <h3 id="rfxBasicInfo" className={styles['rfx-card-item-title']}>
                {intl.get('spc.formulaManage.view.title.calcFormula').d(`计算公式`)}
              </h3>
              <CalcFormula {...commonProps} {...calcFormulaProps} />
              <FormulaLdder dataSet={basicInfoDS} lineDS={assignItemBomDS} />
            </div>
          </div>
        </Content>
      )}
    </React.Fragment>
  );
};

export default compose(
  WithCustomizeC7N({
    unitCode: [
      'SPC.PRICE_FORMULA_MANAGE.DETAIL.ASSIGNBOM',
      'SPC.PRICE_FORMULA_MANAGE.DETAIL.ASSIGNBOM.READONLY',
    ],
  }),
  formatterCollections({
    code: [
      'ssrc.sourceTemplate',
      'ssrc.common',
      'ssrc.inquiryHall',
      'ssrc.rulesDefinition',
      'hzero.common',
      'entity.roles',
      'hzero.c7nProUI',
      'spc.formulaManage',
    ],
  })
)(Index);
