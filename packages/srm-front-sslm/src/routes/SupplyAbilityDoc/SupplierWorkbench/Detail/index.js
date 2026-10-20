/**
 * index.js - 供货能力申请单（采）
 * @date: 2024-05-30
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */
import React, { useRef, Fragment, useCallback, useMemo, useEffect } from 'react';
import { compose } from 'lodash';
import { routerRedux } from 'dva/router';

import remote from 'utils/remote';
import { Modal, Spin, useDataSet } from 'choerodon-ui/pro';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';

import { useSetState } from '@/routes/components/utils';
import { operationRecordsModal } from '@/routes/components/OperationRecords';
import {
  submitAllAsSupplier,
  deleteAll,
  saveAllAsSupplier,
} from '@/services/supplyAbilityDocService';

import { getHeaderTitle } from '../../utils';
import HeaderInfo from '../../components/HeaderInfo';
import CategoryMaterial from '../../components/CategoryMaterial';
import AttachmentInfo from '../../components/AttachmentInfo';
import HeaderBtns from '../components/DetailHeaderBtns';
import { getHeaderDs } from './stores/getHeaderDS';
import { getCategoryMaterialDs } from './stores/getCategoryMaterialDS';

import styles from '../../index.less';

const headerCode = 'SSLM.SUPPLY_ABILITY_DOC.SUPPLIER_DETAIL.HEADER_INFO';
const categoryCodeList = [
  'SSLM.SUPPLY_ABILITY_DOC.SUPPLIER_DETAIL.CATEGORYS_SEARCH_BAR',
  'SSLM.SUPPLY_ABILITY_DOC.SUPPLIER_DETAIL.CATEGORYS_LIST',
];
const allCodeList = [headerCode, 'SSLM.SUPPLY_ABILITY_DOC.SUPPLIER_DETAIL.CATEGORYS_LIST'];

const Detail = ({
  dispatch,
  custLoading,
  customizeForm,
  customizeTable,
  customizeBtnGroup,
  match: {
    params: { type = 'view', abilityReqId },
  },
  supplierSupplyDocRemote,
}) => {
  const isEdit = useMemo(() => type === 'edit', [type]);

  const headerDs = useDataSet(() => getHeaderDs(), []);
  const categoryMaterialDs = useDataSet(
    () =>
      supplierSupplyDocRemote.process(
        'SSLM_SUPPLY_ABILITY_DOC_SUPPLIER_CATEGORY_MATERIAL_DS_PROPS',
        getCategoryMaterialDs({ isEdit }),
        {}
      ),
    [isEdit]
  );

  const [state, setState] = useSetState({
    loading: false,
    headerInfo: {},
  });

  // usePurchaseItemFlag 1 允许供应商选择采购方物料/品类 0 不允许
  const { loading, headerInfo = {} } = state;

  const remoteRef = useRef({}); // 存储埋点增加的页签ref

  useEffect(() => {
    handleQuery({ firstOpenPage: true });
    handleBindHeaderDs();
  }, [abilityReqId, isEdit]);

  // 加载全部数据
  const handleQuery = useCallback(
    async (params = {}) => {
      const { firstOpenPage = false } = params || {};
      if (!abilityReqId) {
        return;
      }
      setState({ loading: true });
      // 设置查询参数
      headerDs.setQueryParameter('queryParam', {
        abilityReqId,
        customizeUnitCode: headerCode,
      });
      categoryMaterialDs.setQueryParameter('queryParam', {
        abilityReqId,
        customizeUnitCode: categoryCodeList.join(','),
        editPageFlag: isEdit ? 1 : 0,
      });
      // 查询数据
      try {
        setState({ loading: true });
        await Promise.all([
          headerDs.query().then(res => {
            if (res) {
              // usePurchaseItemFlag: 供应商创建的单据才有值； 采购方创建的单据没这个字段
              // 值为1 允许供应商选择采购方物料/品类;
              // 值为0 不允许供应商选择采购方物料/品类; 展示供方物料/品类字段;
              const { usePurchaseItemFlag: purchaserFlag = 0 } = res;
              categoryMaterialDs.setState('purchaserFlag', !!Number(purchaserFlag));
              setState({ headerInfo: res });
            }
          }),
          firstOpenPage ? null : categoryMaterialDs.query(),
        ]);
      } finally {
        setState({ loading: false });
      }
    },
    [abilityReqId, isEdit]
  );

  // c7n个性化配置链接拿不到其他单元数据，这里标准关联一下给二开使用
  const handleBindHeaderDs = () => {
    categoryMaterialDs.setState('headerDs', headerDs);
  };

  // 获取保存参数
  const getSaveParams = async () => {
    const headerValidateFlag = headerDs.current ? await headerDs.current.validate(true) : false;
    const lineValidateFlag = await categoryMaterialDs.validate();
    if (headerValidateFlag && lineValidateFlag) {
      const basicsInfo = headerDs.current?.toJSONData() || {};
      const supplyAbilityLines = categoryMaterialDs.toJSONData(); // 获取变更数据;
      const newParams = {
        ...basicsInfo,
        supplyAbilityChangeLineList: supplyAbilityLines,
        customizeUnitCode: allCodeList.join(','),
      };
      const params = await supplierSupplyDocRemote.process(
        'SSLM_SUPPLIER_SUPPLY_ABILITY_DOC_DETAIL_SAVE_PARAMS',
        newParams,
        { remoteRef }
      );
      return params;
    }
    return false;
  };

  // 保存
  const handleSave = () => {
    return new Promise(async resolve => {
      const payload = await getSaveParams();
      if (payload) {
        const executeSave = () => {
          setState({ loading: true });
          saveAllAsSupplier(payload)
            .then(res => {
              if (getResponse(res)) {
                handleQuery();
                notification.success();
                categoryMaterialDs.unSelectAll();
                categoryMaterialDs.clearCachedSelected();
                resolve(true);
              } else {
                resolve(false);
              }
            })
            .finally(() => {
              setState({ loading: false });
            });
        };
        const eventProps = {
          loading,
          setState,
          handleQuery,
          categoryMaterialDs,
          saveParam: payload,
          handleSave: executeSave,
        };
        const result = await supplierSupplyDocRemote.event.fireEvent('cuxHandleSave', eventProps);
        if (!result) {
          return resolve(false);
        }
        executeSave();
      } else {
        resolve(false);
      }
    });
  };

  // 提交
  const handleSubmit = () => {
    return new Promise(async resolve => {
      const payload = await getSaveParams();
      if (payload) {
        const executeSubmit = () => {
          setState({ loading: true });
          submitAllAsSupplier(payload)
            .then(res => {
              if (getResponse(res)) {
                notification.success();
                goToList();
              }
            })
            .finally(() => {
              resolve(true);
              setState({ loading: false });
            });
        };
        const eventProps = {
          loading,
          setState,
          goToList,
          saveParam: payload,
          handleSubmit: executeSubmit,
        };
        const result = await supplierSupplyDocRemote.event.fireEvent('cuxHandleSubmit', eventProps);
        if (!result) {
          return resolve(true);
        }
        executeSubmit();
      } else {
        resolve(true);
      }
    });
  };

  // 删除
  const handleDelete = () => {
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      children: intl.get('sslm.common.view.message.confirmDeleteReq').d('确认删除申请单？'),
      onOk: () => {
        setState({ loading: true });
        return deleteAll([abilityReqId])
          .then(res => {
            if (getResponse(res)) {
              notification.success();
              goToList();
            }
          })
          .finally(() => setState({ loading: false }));
      },
    });
  };

  // 操作记录回调
  const handleOperationRecord = useCallback(() => {
    operationRecordsModal({
      documentType: 'SUPPLY_ABILITY_CHANGE_REQ',
      documentId: abilityReqId,
    });
  }, [abilityReqId]);

  // 返回列表
  const goToList = useCallback(() => {
    dispatch(
      routerRedux.push({
        pathname: '/sslm/supply-ability-doc-supplier/list',
      })
    );
  }, []);

  // 跳转编辑页
  const handleEdit = () => {
    dispatch(
      routerRedux.push({
        pathname: `/sslm/supply-ability-doc-supplier/detail/${abilityReqId}/edit`,
      })
    );
  };

  // 二开附件页签隐藏标识
  const attachShowFlag = supplierSupplyDocRemote.process(
    'SSLM_SUPPLIER_SUPPLY_ABILITY_DOC_DETAIL_ATTACH_SHOW_FLAG',
    true
  );

  return (
    <Fragment>
      <Header title={getHeaderTitle(type)} backPath="/sslm/supply-ability-doc-supplier/list">
        <HeaderBtns
          isEdit={isEdit}
          dataSet={headerDs}
          headerInfo={headerInfo}
          customizeBtnGroup={customizeBtnGroup}
          loading={loading}
          handleSave={handleSave}
          handleDelete={handleDelete}
          handleSubmit={handleSubmit}
          handleOperationRecord={handleOperationRecord}
          handleEdit={handleEdit}
        />
      </Header>
      <Content wrapperClassName={styles['supply-ability-doc-detail-content']}>
        <Spin spinning={loading}>
          <div className="card-content-wrap">
            <HeaderInfo
              dataSet={headerDs}
              custLoading={custLoading}
              customizeForm={customizeForm}
              customizeUnitCode={headerCode}
              isEdit={isEdit}
            />
            {supplierSupplyDocRemote.process(
              'SSLM_SUPPLIER_SUPPLY_ABILITY_DOC_DETAIL_EXTRA_NODE',
              null,
              { isEdit, remoteRef, headerInfo, headerDs, categoryMaterialDs }
            )}
            <CategoryMaterial
              dataSet={categoryMaterialDs}
              headerInfo={headerInfo}
              customizeTable={customizeTable}
              customizeForm={customizeForm}
              customizeBtnGroup={customizeBtnGroup}
              custLoading={custLoading}
              isEdit={isEdit}
              customizeUnitCode={categoryCodeList[1]}
              customizeSearchCode={categoryCodeList[0]}
              pageSource="supplier"
              remote={supplierSupplyDocRemote}
              btnGroupCode="SSLM.SUPPLY_ABILITY_DOC.SUPPLIER_DETAIL.CATEGORYS_BTN"
              reqAttUnitCode="SSLM.SUPPLY_ABILITY_DOC.SUPPLIER_DETAIL.CATEGORYS_LINE_ATT"
              masterAttUnitCode="SSLM.SUPPLY_ABILITY_DOC.SUPPLIER_DETAIL.CATEGORYS_LINE_MASTER_ATT"
            />
            {attachShowFlag && <AttachmentInfo dataSet={headerDs} isEdit={isEdit} />}
          </div>
        </Spin>
      </Content>
    </Fragment>
  );
};

export default compose(
  formatterCollections({
    code: ['sslm.common', 'sslm.supplyAbilityDoc', 'sslm.supplyAbility'],
  }),
  remote(
    {
      code: 'SSLM_SUPPLIER_SUPPLY_ABILITY_DOC', // 对应二开模块暴露的Expose的编码
      name: 'supplierSupplyDocRemote', // 默认 'remote'， 如有属性冲突可以改此属性
    },
    {
      events: {
        cuxHandleSave() {}, // 二开保存
        cuxHandleSubmit() {}, // 二开提交
      },
    }
  ),
  withCustomize({
    unitCode: [
      'SSLM.SUPPLY_ABILITY_DOC.SUPPLIER_DETAIL.CATEGORYS_LIST',
      'SSLM.SUPPLY_ABILITY_DOC.SUPPLIER_DETAIL.CHANGE_EXIST_TABLE',
      'SSLM.SUPPLY_ABILITY_DOC.SUPPLIER_DETAIL.HEADER_BTNS',
      'SSLM.SUPPLY_ABILITY_DOC.SUPPLIER_DETAIL.HEADER_INFO',
      'SSLM.SUPPLY_ABILITY_DOC.SUPPLIER_DETAIL.BATCH_EDIT',
      'SSLM.SUPPLY_ABILITY_DOC.SUPPLIER_DETAIL.CATEGORYS_BTN', // 推荐物料/品类行按钮
      'SSLM.SUPPLY_ABILITY_DOC.SUPPLIER_DETAIL.CATEGORYS_LINE_ATT',
      'SSLM.SUPPLY_ABILITY_DOC.SUPPLIER_DETAIL.CATEGORYS_LINE_MASTER_ATT',
    ],
  })
)(Detail);
