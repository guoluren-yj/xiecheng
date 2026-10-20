/**
 * index.js - 供货能力申请单（采）
 * @date: 2024-05-30
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */
import React, { useRef, Fragment, useCallback, useMemo, useEffect } from 'react';
import { compose, isEmpty } from 'lodash';
import { routerRedux } from 'dva/router';
import querystring from 'querystring';

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
  submitAll,
  deleteAll,
  saveAll,
  approveReq,
  rejectReq,
  submitCheck,
} from '@/services/supplyAbilityDocService';

import { getHeaderTitle } from '../../utils';
import HeaderInfo from '../../components/HeaderInfo';
import CategoryMaterial from '../../components/CategoryMaterial';
import AttachmentInfo from '../../components/AttachmentInfo';
import HeaderBtns from '../components/DetailHeaderBtns';
import { getHeaderDs } from './stores/getHeaderDS';
import { getCategoryMaterialDs } from './stores/getCategoryMaterialDS';

import styles from '../../index.less';

const headerCode = 'SUPPLY_ABILITY_DOC.PURCHASER_DETAIL.HEADER_INFO';

const categoryCodeList = [
  'SUPPLY_ABILITY_DOC.PURCHASER_DETAIL.CATEGORYS_SEARCH_BAR',
  'SUPPLY_ABILITY_DOC.PURCHASER_DETAIL.CATEGORYS_LIST',
];

const allCode = [headerCode, 'SUPPLY_ABILITY_DOC.PURCHASER_DETAIL.CATEGORYS_LIST'];
const Detail = ({
  dispatch,
  custLoading,
  customizeForm,
  customizeTable,
  customizeBtnGroup,
  match: {
    params: { type = 'view', abilityReqId },
  },
  location,
  purchaserSupplyDocRemote,
}) => {
  // routerType解决工作流，include表单type未配置成流程变量导致match.params拿不到值问题
  const { type: routerType, sourceType } = querystring.parse(location.search.substr(1));
  const isPub = useMemo(() => location.pathname.includes('/pub/'), [location.pathname]);
  const isEdit = useMemo(() => type === 'edit' || routerType === 'edit', [type, routerType]);

  const headerDs = useDataSet(() => getHeaderDs(), []);
  const categoryMaterialDsProps = getCategoryMaterialDs({ isEdit });
  const lineDsProps = purchaserSupplyDocRemote
    ? purchaserSupplyDocRemote.process(
        'SSLM_PURCHASER_SUPPLY_ABILITY_DOC_LINE_DS',
        categoryMaterialDsProps,
        {}
      )
    : categoryMaterialDsProps;

  const categoryMaterialDs = useDataSet(() => lineDsProps, [isEdit]);

  const remoteRef = useRef({}); // 存储埋点增加的页签ref

  const [state, setState] = useSetState({
    loading: false,
    headerInfo: {},
  });

  const { loading, headerInfo = {} } = state;

  useEffect(() => {
    handleQuery({ firstOpenPage: true });
    handleBindHeaderDs();
  }, [abilityReqId, isEdit]);

  // c7n个性化配置链接拿不到其他单元数据，这里标准关联一下给二开使用
  const handleBindHeaderDs = () => {
    categoryMaterialDs.setState('headerDs', headerDs);
  };

  // 加载全部数据
  const handleQuery = useCallback(
    async (params = {}) => {
      const { firstOpenPage = false } = params || {};
      if (!abilityReqId) {
        return;
      }
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
              // initiateCamp 0 采购方创建，1 供应商创建
              const { usePurchaseItemFlag = 1, initiateCamp = '0' } = res;
              const purchaserFlag = !Number(initiateCamp) ? true : !!Number(usePurchaseItemFlag);
              categoryMaterialDs.setState('purchaserFlag', purchaserFlag);
              setState({ headerInfo: res });
            }
          }),
          firstOpenPage ? null : categoryMaterialDs.query(1, {}, false),
        ]);
      } finally {
        setState({ loading: false });
      }
    },
    [abilityReqId, isEdit]
  );

  // 提交前的数据校验(适用于指定审批人的工作流)
  const submitValidate = async () => {
    const payload = await getSaveParams();
    if (payload) {
      setState({ loading: true });
      return submitCheck(payload)
        .then(response => {
          const res = getResponse(response);
          if (res) {
            return true;
          }
          return false;
        })
        .finally(() => {
          setState({ loading: false });
        });
    }
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
        customizeUnitCode: allCode.join(','),
      };
      const params = await purchaserSupplyDocRemote.process(
        'SSLM_PURCHASER_SUPPLY_ABILITY_DOC_DETAIL_SAVE_PARAMS',
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
          saveAll(payload)
            .then(async res => {
              if (getResponse(res)) {
                notification.success();
                await handleQuery();
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
          handleQuery,
          saveParam: payload,
          handleSave: executeSave,
          setLoading: flag => {
            setState({ loading: flag });
          },
        };
        const result = await purchaserSupplyDocRemote.event.fireEvent('cuxHandleSave', eventProps);
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
          submitAll(payload)
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
          goToList,
          saveParam: payload,
          handleSubmit: executeSubmit,
          setLoading: flag => {
            setState({ loading: flag });
          },
        };
        const result = await purchaserSupplyDocRemote.event.fireEvent(
          'cuxHandleSubmit',
          eventProps
        );
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
        return deleteAll([abilityReqId]).then(res => {
          if (getResponse(res)) {
            notification.success();
            setState({ loading: false });
            goToList();
          } else {
            setState({ loading: false });
          }
        });
      },
    });
  };

  // 审批通过
  const handleApproved = async () => {
    const result = await purchaserSupplyDocRemote.event.fireEvent('cuxHandleApprovedBefore', {
      setState,
      getSaveParams,
    });
    if (!result) {
      return;
    }
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      children: intl.get('sslm.common.view.message.confirmApprove').d('确认审批通过？'),
      onOk: () => {
        return new Promise(async resolve => {
          const payload = await getSaveParams();
          if (payload) {
            setState({ loading: true });
            approveReq(payload)
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
          } else {
            resolve(true);
          }
        });
      },
    });
  };

  // 审批拒绝
  const handleRefused = () => {
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      children: intl.get('sslm.common.view.message.confirmReject').d('确认审批拒绝？'),
      onOk: () => {
        return new Promise(async resolve => {
          const payload = headerDs.current?.toJSONData() || {};
          if (!isEmpty(payload)) {
            setState({ loading: true });
            rejectReq(payload)
              .then(async res => {
                if (getResponse(res)) {
                  notification.success();
                  goToList();
                }
              })
              .finally(() => {
                resolve(true);
                setState({ loading: false });
              });
          } else {
            resolve(true);
          }
        });
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
        pathname: '/sslm/supply-ability-doc-purchaser/list',
      })
    );
  }, []);

  // 跳转编辑页
  const handleEdit = () => {
    dispatch(
      routerRedux.push({
        pathname: `/sslm/supply-ability-doc-purchaser/detail/${abilityReqId}/edit`,
      })
    );
  };

  const remoteParams = {
    headerDs,
    categoryMaterialDs,
    setState,
  };

  return (
    <Fragment>
      <Header title={getHeaderTitle(type)} backPath="/sslm/supply-ability-doc-purchaser/list">
        <HeaderBtns
          headerInfo={headerInfo}
          isEdit={isEdit}
          isPub={isPub}
          sourceType={sourceType}
          customizeBtnGroup={customizeBtnGroup}
          loading={loading}
          handleSave={handleSave}
          handleDelete={handleDelete}
          handleSubmit={handleSubmit}
          handleApproved={handleApproved}
          handleRefused={handleRefused}
          handleOperationRecord={handleOperationRecord}
          handleEdit={handleEdit}
          submitValidate={submitValidate}
        />
        {/* 按钮埋点 */}
        {purchaserSupplyDocRemote &&
          purchaserSupplyDocRemote.render(
            'SSLM_PURCHASER_SUPPLY_ABILITY_DOC_BUTTONS',
            <></>,
            remoteParams
          )}
      </Header>
      <Content wrapperClassName={styles['supply-ability-doc-detail-content']}>
        <Spin spinning={loading}>
          <div className="card-content-wrap">
            <HeaderInfo
              isPub={isPub}
              dataSet={headerDs}
              headerInfo={headerInfo}
              custLoading={custLoading}
              customizeForm={customizeForm}
              customizeUnitCode={headerCode}
              isEdit={isEdit}
              remote={purchaserSupplyDocRemote}
            />
            {purchaserSupplyDocRemote.process(
              'SSLM_PURCHASER_SUPPLY_ABILITY_DOC_DETAIL_EXTRA_NODE',
              null,
              { isEdit, remoteRef, headerInfo, headerDs, categoryMaterialDs }
            )}
            <CategoryMaterial
              location={location}
              dataSet={categoryMaterialDs}
              headerInfo={headerInfo}
              customizeTable={customizeTable}
              customizeUnitCode={categoryCodeList[1]}
              customizeSearchCode={categoryCodeList[0]}
              customizeForm={customizeForm}
              customizeBtnGroup={customizeBtnGroup}
              custLoading={custLoading}
              isEdit={isEdit}
              remote={purchaserSupplyDocRemote}
              pageSource="purchaser"
              btnGroupCode="SUPPLY_ABILITY_DOC.PURCHASER_DETAIL.CATEGORYS_BTN"
              reqAttUnitCode="SUPPLY_ABILITY_DOC.PURCHASER_DETAIL.CATEGORYS_LINE_ATT"
              masterAttUnitCode="SUPPLY_ABILITY_DOC.PURCHASER_DETAIL.CATEGORYS_LINE_MASTER_ATT"
            />
            <AttachmentInfo dataSet={headerDs} isEdit={isEdit} />
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
      code: 'SSLM_PURCHASER_SUPPLY_ABILITY_DOC', // 对应二开模块暴露的Expose的编码
      name: 'purchaserSupplyDocRemote', // 默认 'remote'， 如有属性冲突可以改此属性
    },
    {
      events: {
        cuxHandleSave() {}, // 二开保存
        cuxHandleSubmit() {}, // 二开提交
        cuxHandleFieldChange() {}, // 变更已有供货能力-筛选器onFieldChange回调
        cuxHandleApprovedBefore() {}, // 审批通过前回调
      },
    }
  ),
  withCustomize({
    unitCode: [
      'SUPPLY_ABILITY_DOC.PURCHASER_DETAIL.CATEGORYS_LIST',
      'SUPPLY_ABILITY_DOC.PURCHASER_DETAIL.CHANGE_EXIST_TABLE',
      'SUPPLY_ABILITY_DOC.PURCHASER_DETAIL.HEADER_BTNS',
      'SUPPLY_ABILITY_DOC.PURCHASER_DETAIL.HEADER_INFO',
      'SUPPLY_ABILITY_DOC.PURCHASER_DETAIL.BATCH_EDIT',
      'SUPPLY_ABILITY_DOC.PURCHASER_DETAIL.CATEGORYS_BTN', // 推荐物料/品类行按钮
      'SUPPLY_ABILITY_DOC.PURCHASER_DETAIL.CATEGORYS_LINE_ATT',
      'SUPPLY_ABILITY_DOC.PURCHASER_DETAIL.CATEGORYS_LINE_MASTER_ATT',
    ],
  })
)(Detail);
