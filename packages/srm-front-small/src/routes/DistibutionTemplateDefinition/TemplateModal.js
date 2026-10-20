import React, { Component } from 'react';
import { isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { connect } from 'dva';
import { withRouter } from 'react-router-dom';
import notification from 'utils/notification';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import { fetchLovViewInfo } from '@/services/templateDetail';
import request from 'utils/request';
import { DataSet, Modal, Button } from 'choerodon-ui/pro';
import { Alert } from 'choerodon-ui';
import arrow from '@/assets/double-arro-right.svg';
import { fxDS, expressionDS, fieldDS, associatDS } from './tableDS';
import LovConfig from './LovConfig';
import './index.less';
import DimCustomizeForm from './DimCustomizeForm';
import FxConfigList from './FxConfigList';
import BaseConfig from './BaseConfig';
import MapRelations from './MapRelations';
import FxListReadOnly from './FxListReadOnly';
import { flagNames, lovFieldSet } from './utils';

const organizationId = getCurrentOrganizationId();
const SRM_MALLCART = '/smct';

@connect(({ templateDetailInfo }) => ({
  templateDetailInfo,
}))
@withRouter
export default class TemplateModal extends Component {
  configlistArr = [];

  /* 值集参数ds */
  fieldParamsConfigDS = new DataSet(fieldDS(this.props.templateId));

  fieldAssociatConfigDS = new DataSet(
    associatDS(this.props.templateId, this.props.dimensionType, this.props.dataSet)
  );

  componentDidMount() {
    const { dataSet, dimensionType, isCreate, mappingTableDs } = this.props;
    this.fieldParamsConfigDS.setState('dimensionType', dimensionType);
    mappingTableDs.setState('dimensionType', dimensionType);
    let addFieldDefaultValue = {};
    if (dimensionType.startsWith('LINE')) {
      dataSet.addField('orderSeq', {
        label: intl.get(`small.common.table.view.sort`).d('排序'),
        required: true,
        type: 'number',
        step: 1,
        min: 1,
      });
      dataSet.addField('width', {
        label: intl.get(`small.common.table.view.width`).d('宽度'),
        required: true,
        type: 'number',
        step: 1,
        min: 1,
      });
      addFieldDefaultValue = {
        orderSeq: 1,
        width: 100,
      };
    } else {
      dataSet.addField('colSeq', {
        label: intl.get(`small.common.table.columns.col`).d('列'),
        required: true,
        type: 'number',
        max: 3,
        step: 1,
        min: 1,
      });
      dataSet.addField('rowSeq', {
        label: intl.get(`small.common.table.columns.row`).d('行'),
        required: true,
        type: 'number',
        step: 1,
        min: 1,
      });
      addFieldDefaultValue = {
        colSeq: 1,
        rowSeq: 1,
      };
    }
    if (dataSet.getField('orderSeq')) {
      dataSet.getField('orderSeq').set('required', dimensionType.startsWith('LINE'));
    }
    if (dataSet.getField('width')) {
      dataSet.getField('width').set('required', dimensionType.startsWith('LINE'));
    }
    if (dataSet.getField('colSeq')) {
      dataSet.getField('colSeq').set('required', !dimensionType.startsWith('LINE'));
    }
    if (dataSet.getField('rowSeq')) {
      dataSet.getField('rowSeq').set('required', !dimensionType.startsWith('LINE'));
    }

    if (isCreate) {
      dataSet.create(
        {
          enabledFlag: 1,
          necessaryFlag: 1,
          editFlag: 1,
          displayFlag: 1,
          splitFlag: 0,
          budgetFlag: 0,
          mergeFlag: 1,
          defaultType: 0,
          encryptFlag: 0,
          batchFlag: 1,
          ...addFieldDefaultValue,
        },
        0
      );
    }
  }

  /* 保存值集参数配置 */
  async saveFieldParamsConfig() {
    const { dataSet } = this.props;
    const flagPara = await this.fieldParamsConfigDS.validate();
    const flagAssoc = await this.fieldAssociatConfigDS.validate();
    if (flagPara && flagAssoc) {
      const { dimensionId, templateId } = dataSet.toData()[0];
      const paramsData = this.fieldParamsConfigDS.toData();
      const associatData = this.fieldAssociatConfigDS.toData();
      const dimensionParameterList = paramsData.map(n => ({
        ...n,
        dimensionId,
        templateId,
      }));
      const dimensionFieldRelationList = associatData.map(n => ({
        ...n,
        dimensionId,
        templateId,
      }));
      const latestParams = {
        ...dataSet.toData()[0],
        dimensionParameterList,
        dimensionFieldRelationList,
      };
      dataSet.loadData([latestParams]);
      this.fieldParamsConfigDS.loadData(paramsData);
      this.fieldAssociatConfigDS.loadData(associatData);
    } else {
      return false;
    }
  }

  /* 值集配置列表 */
  @Bind()
  showFieldPararamsConfig(oldData, currentData, editEnable, isCreate, dataSet) {
    const list = oldData === currentData ? oldData : currentData;
    const { dimensionFieldRelationList = [] } = dataSet.current?.data || {};
    this.fieldParamsConfigDS.loadData(list);
    this.fieldAssociatConfigDS.loadData(dimensionFieldRelationList);

    const modal = Modal.open({
      key: 'paramsConfig',
      title: intl.get('small.common.fx.field.config').d('值集配置'),
      drawer: true,
      destroyOnClose: true,
      style: { width: 742 },
      okText: intl.get('small.common.modal.button.save').d('保存'),
      cancelText: intl.get('small.common.modal.button.close').d('关闭'),
      onOk: () => this.saveFieldParamsConfig(),
      footer: (okBtn, cancelBtn) => (
        <>
          {!editEnable && !isCreate ? (
            <Button color="primary" onClick={() => modal.close()}>
              {intl.get('small.common.modal.button.close').d('关闭')}
            </Button>
          ) : (
            <>
              {okBtn}
              {cancelBtn}
            </>
          )}
        </>
      ),
      children: (
        <LovConfig
          dataSet={this.props.dataSet}
          fieldParamsConfigDS={this.fieldParamsConfigDS}
          fieldAssociatConfigDS={this.fieldAssociatConfigDS}
          editEnable={editEnable}
          isCreate={isCreate}
          deleteFieldRecord={this.deleteFieldRecord}
        />
      ),
    });
  }

  // 删除值集参数配置
  @Bind()
  deleteFieldRecord(records, type) {
    const { dispatch, templateId, dimensionId } = this.props;
    const isPara = type === 'lovPara';
    const key = isPara ? 'dimensionParameterId' : 'fieldRelationId';
    const ds = type === 'lovPara' ? this.fieldParamsConfigDS : this.fieldAssociatConfigDS;
    if(records.every(n => !n.get(key))) {
      ds.remove(records, true);
    } else {
      const action = type === 'lovPara' ? 'delteFieldParams' : 'delteLovAssociat';
      const payload = records.reduce((pre, curr) => {
        if(curr.get(key)) {
          pre.push({...curr.toData(), templateId});
        }
        return pre;
      }, []);
      dispatch({
        type: `templateDetailInfo/${action}`,
        payload,
      }).then(res => {
        if (res && !res.failed) {
          notification.success();
          request(
            `${SRM_MALLCART}/v1${
              organizationId === 0 ? '/' : `/${organizationId}`
            }/dimensions/${dimensionId}`
          ).then(resp => {
            const key =
              type === 'lovPara' ? 'dimensionParameterList' : 'dimensionFieldRelationList';
            const value = resp[key];
            this.props.dataSet.current.set(key, value);
            ds.loadData(value);
          });
        }
      });
    }
  }

  /* 条件配置模态框 */
  @Bind()
  async showConditionModal(dimensionType, _, conditionType, isDefault, disabled) {
    const { conditionList, defaultCondition, proDefaultFlag, formulaConditionFx = {} } = this.props.dataSet.current.toData();
    /* 自定义表达式 */
    const { templateId, dispatch, isCreate, editEnable, dataSet } = this.props;
    const fxds = new DataSet(fxDS(templateId)); // 头ds
    const customizeDS = new DataSet(expressionDS(fxds));
    fxds.setState('dimensionType', dimensionType);
    fxds.setState('conditionType', conditionType);
    const lovCode = this.props.dataSet.current.get('lovCode'); // 下面默认值的lovCode
    // 设置默认的时候
    if (isDefault) {
      let conditionLineList;
      let dimDefaultConditionList;
      // 默认值类型为公式
      if(proDefaultFlag === 'FORMULA') {
        ({ conditionLineList = [] } = formulaConditionFx || {});
        dimDefaultConditionList = formulaConditionFx.dimFormulaConditionList || [];
      } else {
        ({ conditionLineList = [], dimDefaultConditionList = [] } = defaultCondition || {});
      }
      if (isEmpty(conditionLineList)) {
        fxds.loadData([]);
        fxds.create({ isNew: 1 });
      } else {
        let needPreValidate = false;
        fxds.loadData(
          conditionLineList.map(p => {
            const { componentType, lovView = {}, lovCode: code } = p?.dimensionComponent || {};
            const { displayField = '', valueField = '', lovCode: code1 } =
              p.lovView || lovView || {};
            if (p.importCheckFlag === 1) {
              needPreValidate = true;
            }
            if ((p.componentType || componentType) === 'LOV') {
              return {
                ...p,
                componentType: p.componentType || componentType,
                lovView: p.lovView || lovView,
                lovCode: code1 || code,
                targetValueLov: {
                  [displayField]: p.targetValueMeaning,
                  [valueField]: p.targetValue,
                  [flagNames.importCheckFlag]: p.importCheckFlag,
                },
              };
            } else {
              return {
                ...p,
                lovCode: code,
                targetValueSelect: p.targetValue,
              };
            }
          })
        );

        if (needPreValidate) {
          fxds.forEach(record => {
            lovFieldSet({
              record,
              lovViewInfo: record.get('lovView'),
              lovFieldName: 'targetValueLov',
            });
          });
          fxds.validate();
        }
      }
      if (isEmpty(dimDefaultConditionList)) {
        customizeDS.create({
          componentType: this.props.dataSet.current.get('componentType'),
          lovCode,
          conditionType,
        });
      } else {
        window.smallCartLovViewInfoCache = window.smallCartLovViewInfoCache || {};
        let viewInfo = {};
        if (
          lovCode &&
          !window.smallCartLovViewInfoCache[lovCode] &&
          this.props.dataSet.current.get('componentType') === 'LOV'
        ) {
          viewInfo = getResponse(await fetchLovViewInfo(lovCode)) || {};
          window.smallCartLovViewInfoCache[lovCode] = viewInfo;
        } else {
          viewInfo = window.smallCartLovViewInfoCache[lovCode] || {};
        }
        let needValidateDefaultValue = false;
        customizeDS.loadData(
          dimDefaultConditionList.map(dim => {
            if (dim.importCheckFlag === 1) needValidateDefaultValue = true;
            return {
              ...dim,
              componentType: this.props.dataSet.current.get('componentType'),
              lovCode: this.props.dataSet.current.get('lovCode'),
              defaultValue_LOV: {
                [viewInfo.valueField]: dim.value,
                [viewInfo.displayField]: dim.valueName,
                [flagNames.importCheckFlag]: dim.importCheckFlag,
              },
              defaultValue_component: dim.value,
              defaultValue_componentMeaning: dim.valueName,
            };
          })
        );

        if (needValidateDefaultValue) {
          lovFieldSet({
            record: customizeDS,
            lovViewInfo: viewInfo,
          });
          customizeDS.validate();
        }
      }
    } else {
      const currenCondition =
        conditionList?.filter(c => c?.conditionHeader?.conditionType === conditionType)?.[0] || {};
      if (isEmpty(currenCondition)) {
        fxds.loadData([]);
        fxds.create({ isNew: 1 });
      } else {
        let needPreValidate = false;
        fxds.loadData(
          currenCondition.conditionLineList?.map(p => {
            if (p.importCheckFlag === 1) {
              needPreValidate = true;
            }
            if ((p.dimensionComponent || p)?.componentType === 'LOV') {
              return {
                ...p,
                componentType: (p.dimensionComponent || p)?.componentType,
                lovCode: (p.dimensionComponent || p)?.lovCode,
                lovView: (p.dimensionComponent || p)?.lovView,
                targetValueLov: {
                  [(p.dimensionComponent || p)?.lovView?.valueField]: p.targetValue,
                  [(p.dimensionComponent || p)?.lovView?.displayField]: p.targetValueMeaning,
                  [flagNames.importCheckFlag]: p.importCheckFlag,
                },
                targetValueSelect: p.targetValue,
              };
            } else {
              return {
                ...p,
                componentType: (p.dimensionComponent || p)?.componentType,
                lovCode: (p.dimensionComponent || p)?.lovCode,
                targetValueSelect: p.targetValue,
              };
            }
          })
        );

        if (needPreValidate) {
          fxds.forEach(record => {
            lovFieldSet({
              record,
              lovViewInfo: record.get('lovView'),
              lovFieldName: 'targetValueLov',
            });
          });
          fxds.validate();
        }
      }
      customizeDS.create(currenCondition.conditionHeader);
    }
    const detailParams = {
      dimensionId: this.props.dimensionId,
      editModalDataSet: this.props.dataSet,
      dataSet: fxds,
      dispatch,
      dimensionType,
      isCreate,
      editEnable,
      templateId,
      conditionType,
      isDefault,
      disabled,
    };
    const modal = Modal.open({
      title: intl.get('small.common.config.condition').d('条件配置'),
      key: 'conditionConfig',
      drawer: true,
      style: { width: 742 },
      destroyOnClose: true,
      okText: intl.get('small.common.modal.button.save').d('保存'),
      onOk: () =>
        this.saveConditionData(customizeDS, fxds, conditionList, conditionType, isDefault),
      children: this.props.readOnly ? <FxListReadOnly dataSet={fxds} customizeDS={customizeDS} /> : (
        <>
          <FxConfigList {...detailParams} />
          <div style={{ paddingLeft: 26, paddingRight: isDefault ? 52 : 42 }}>
            <div>
              <img src={arrow} alt="" style={{ width: 16, height: 16, margin: '8px 0 8px 8px' }} />
            </div>
            <div>
              <DimCustomizeForm
                templateId={this.props.templateId}
                customizeDS={customizeDS}
                disabled={(!editEnable && !isCreate) || disabled}
                columns={isDefault ? 4 : 1}
                dataSet={dataSet}
                isDefault={isDefault}
                ds={customizeDS}
                dimensionType={dimensionType}
                defaultCondition={defaultCondition}
              />
              <div style={{ color: 'rgba(0,0,0,.45)', marginTop: 8 }}>
                {intl
                  .get('small.common.desc.custom.expression')
                  .d('使用条件编号及AND、OR编写运算规则。示例：（1 AND 2）OR 3')}
              </div>
            </div>
          </div>
        </>
      ),
      footer:
          this.props.readOnly ? (
            <Button color="primary" onClick={() => modal.close()}>
              {intl.get('small.common.modal.buttom.button.close').d('关闭')}
            </Button>
          ) : (
            (okBtn, cancelBtn) => (
              <div>
                {okBtn}
                {cancelBtn}
              </div>
            )
          ),
    });
  }

  handleDimConditionLis({customizeDS, viewInfo}) {
    return customizeDS.toData().map((cus, i) => {
      if (cus.componentType === 'LOV') {
        return {
          ...cus,
          conditionCode: i + 1,
          value: cus.defaultValue_LOV?.[viewInfo?.valueField],
          valueName: cus.defaultValue_LOV?.[viewInfo?.displayField],
          importCheckFlag: cus.defaultValue_LOV?.[flagNames.importCheckFlag] || 0,
        };
      } else {
        return {
          ...cus,
          conditionCode: i + 1,
          value: cus.defaultValue_component,
          valueName: cus.defaultValue_componentMeaning || '',
        };
      }
    });
  }

  handleConditionLineList(fxds) {
    return fxds.toData().map((fx, i) => {
      if (fx.componentType === 'LOV' && fx.targetType === 'FIXED') {
        const view = fx.lovView || {};
        return {
          ...fx,
          conditionCode: i + 1,
          targetValue: fx.targetValueLov?.[view?.valueField],
          targetValueMeaning: fx.targetValueLov?.[view?.displayField],
          importCheckFlag: fx.targetValueLov?.[flagNames.importCheckFlag] || 0,
        };
      } else {
        return { ...fx, conditionCode: i + 1 };
      }
    });
  }

  // 处理默认值配置数据
  // @Bind()
  async setSaveDefaultConditionData({ customizeDS, fxds }) {
    const { dataSet } = this.props;
    const { lovCode, proDefaultFlag, formulaConditionFx: oldFormulaConditionFx } = dataSet.current.toData(); // 外面默认值的
    let viewInfo = {};
    window.smallCartLovViewInfoCache = window.smallCartLovViewInfoCache || {};
    if (lovCode && !window.smallCartLovViewInfoCache[lovCode]) {
      viewInfo = getResponse(await fetchLovViewInfo(lovCode)) || {};
      window.smallCartLovViewInfoCache[lovCode] = viewInfo;
    } else {
      viewInfo = window.smallCartLovViewInfoCache[lovCode] || {};
    }
      if (proDefaultFlag === 'FORMULA') {
      const formulaConditionFx = {};
      formulaConditionFx.dimFormulaConditionList = this.handleDimConditionLis({customizeDS, viewInfo});
      formulaConditionFx.conditionLineList = this.handleConditionLineList(fxds);
      formulaConditionFx.conditionHeader = oldFormulaConditionFx?.conditionHeader;
      dataSet.current.set({
        defaultCondition: {},
        formulaConditionFx,
      });
    } else {
      // 默认值的fx
      const defaultCondition = {
        ...dataSet.current.toData()?.defaultCondition,
        dimDefaultConditionList: this.handleDimConditionLis({customizeDS, viewInfo}),
        conditionLineList: this.handleConditionLineList(fxds),
      };
      dataSet.loadData([{ ...dataSet.current.toData(), defaultCondition }]);
    }
    dataSet.validate();
  }

  // 处理条件配置数据
  setSaveConditionData({ conditionList, conditionType, customizeDS, fxds }) {
    const { dataSet } = this.props;
    const newConditionList = [...(conditionList || [])];
    const newCondition = {
      conditionHeader: { ...(customizeDS.current.toData() || {}), conditionType },
      conditionLineList: fxds.records.map((p, i) => {
        const data = p.toData();
        if (data.componentType === 'LOV' && data.targetType === 'FIXED') {
          const view = data.lovView || {};
          return {
            ...data,
            conditionCode: i + 1,
            targetValue: data.targetValueLov?.[view?.valueField],
            targetValueMeaning: data.targetValueLov?.[view?.displayField],
            importCheckFlag: data.targetValueLov?.[flagNames.importCheckFlag] || 0,
          };
        } else {
          return {
            ...data,
            conditionCode: i + 1,
          };
        }
      }),
    };
    if (newConditionList.some(p => p.conditionHeader.conditionType === conditionType)) {
      newConditionList.forEach((item, idx) => {
        if (item.conditionHeader.conditionType === conditionType) {
          newConditionList[idx] = newCondition;
        }
      });
    } else {
      newConditionList.push(newCondition);
    }
    dataSet.loadData([
      {
        ...dataSet.current.toData(),
        conditionList: newConditionList,
      },
    ]);
    dataSet.validate();
  }

  // 条件配置保存
  @Bind()
  async saveConditionData(customizeDS, fxds, conditionList, conditionType, isDefault) {
    const flag1 = await customizeDS.validate();
    const flag2 = await fxds.validate();
    if (flag1 && flag2) {
      if (isDefault) {
        this.setSaveDefaultConditionData({ customizeDS, fxds });
      } else {
        this.setSaveConditionData({ conditionList, conditionType, customizeDS, fxds });
      }
    } else {
      return false;
    }
  }

  render() {
    const {
      dataSet,
      dimensionType,
      editEnable,
      isCreate,
      templateType,
      mappingTableDs,
      dimensionCode,
      fieldConfig,
      templateId,
      readOnly,
    } = this.props;
    const baseProps = {
      dataSet,
      dimensionType,
      editEnable,
      isCreate,
      templateType,
      dimensionCode,
      fieldConfig,
      templateId,
      readOnly,
      showConditionModal: this.showConditionModal,
      showFieldPararamsConfig: this.showFieldPararamsConfig,
    };
    const mapProps = {
      editEnable,
      dimensionType,
      isCreate,
      mappingTableDs,
      readOnly,
    };
    return (
      <div className="template-modal">
        { !dimensionType.startsWith('LINE') && dimensionCode === 'itemId' && (
          <Alert
            message={intl
              .get('small.cartTemplate.view.item.tip')
              .d('商品映射的物料已传给下游，如需在购物车修改物料并同步给下游请联系产品配置')}
            style={{
              position: 'relative',
              left: '-20px',
              top: '-20px',
              width: 'calc(100% + 40px)',
            }}
            type="info"
            showIcon
            closable
            banner
          />
        )}
        <BaseConfig {...baseProps} />
        <MapRelations {...mapProps} />
      </div>
    );
  }
}
