import React, { useMemo, useEffect, useState, useCallback, useRef } from 'react';
import { DataSet, Spin, Modal } from 'choerodon-ui/pro';
import { Content } from 'components/Page';
import { flow } from 'lodash';
import { observer } from 'mobx-react';
import querystring from 'querystring';

import hocRemote from 'hzero-front/lib/utils/remote';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { getResponse } from 'utils/utils';
import WithCustomize from 'srm-front-cuz/lib/c7nCustomize';
import DynamicButtons from '_components/DynamicButtons';

import { AFBasic, AFExtra } from 'srm-front-boot/lib/components/AFCards';
import { handleSave } from '@/services/priceAdjustmentWorkbenchService';

import { getRuleDefinition } from '@/routes/ssrc/PriceLibraryNew/util';

import Supplement from './Supplement';
import OperationRecord from '../../components/OperationRecord';
import PriceAdjustmentLine from '../Detail/components/PriceAdjustmentLine';

import { getBasicInfoDs, getLineDs } from '../stores/getDetailsDs';

import styles from './index.less';

const cusUnitCode = {
  lineCode: 'SPC.PRICEADJUSTMENTWORKBENCH.DETAIL_CUSTOM.LINE_TABLE_READONLY',
  searchCode: 'SPC.PRICEADJUSTMENTWORKBENCH.DETAIL_CUSTOM.LINE_SEARCH',
};

const SubmitApprove = (props) => {
  const {
    customizeBtnGroup,
    customizeCommon,
    customizeTable,
    queryTemplateConfig,
    location,
    remote,
  } = props;

  const { priceAdjustmentHeaderId, ...routerParams } =
    useMemo(() => querystring.parse(location?.search?.substr(1)), [location?.search]) || {};

  const BasicInfoDs = useMemo(() => new DataSet(getBasicInfoDs(priceAdjustmentHeaderId, false)), [
    priceAdjustmentHeaderId,
  ]);

  const LineDs = useMemo(() => new DataSet(getLineDs(priceAdjustmentHeaderId, false)), [
    priceAdjustmentHeaderId,
  ]);

  const cuxProps = remote ? remote.process('SSRC_PRICE_ADJUSTMENT_WORKBENCH_SUBMIT_APPROVE_CUXPROPS', {}, { props }) : {};

  const [queryLoading, setQueryLoading] = useState(false);
  const [ruleDefinition, setRuleDefinition] = useState([]);

  // 调价单弹框内容ref
  const priceAdjustmentModalRef = useRef(null);

  const templateInfo = useMemo(() => {
    return {
      cuszTplTemplateCode: routerParams?.templateCode,
      cuszTplVersion: routerParams?.templateVersion,
      cuszTplStageCode: routerParams?.stageCode || 'SUBMIT', // 默认SUBMIT
      cuszTplPageCode: 'SUBMIT_DETAIL', // 默认SUBMIT_DETAIL
    };
  }, [routerParams]);

  useEffect(() => {
    initFetchService();
    queryRuleDefinition();
  }, [priceAdjustmentHeaderId]);

  const initFetchService = useCallback(async () => {
    setQueryLoading(true);
    const queryParams = new Promise((resolve) => {
      resolve({
        templateCode: templateInfo?.cuszTplTemplateCode,
        templateVersion: templateInfo?.cuszTplVersion,
      });
    });
    await queryTemplateConfig(queryParams, {
      // 阶段编码，页面编码
      stageCode: templateInfo?.cuszTplStageCode,
      pageCode: templateInfo?.cuszTplPageCode,
    }).catch(() => {
      setQueryLoading(false);
    });
    if (priceAdjustmentHeaderId) {
      refreshData();
    }
  }, [priceAdjustmentHeaderId, templateInfo]);

  const refreshData = () => {
    setQueryLoading(true);
    Promise.all([BasicInfoDs.query(), LineDs.query()]).finally(() => {
      setQueryLoading(false);
    });
  };

  useEffect(() => {
    LineDs.setState('ruleDefinition', ruleDefinition);
  }, [ruleDefinition]);

  // 查询基准价维护的对应规则
  const queryRuleDefinition = () => {
    return getRuleDefinition().then((res) => {
      setRuleDefinition(res);
    });
  };

  /**
   * 操作记录
   * @returns
   */
  const operateHistory = async () => {
    const businessKey = BasicInfoDs?.current?.get('businessKey');
    if (!priceAdjustmentHeaderId) return;
    const modalProps = {
      operateParams: { priceAdjustmentHeaderId },
      businessKey,
      onlyOperation: !businessKey,
      fieldParam: {
        realName: 'processUserName',
        actionCode: 'processTypeCode',
        actionId: 'priceAdjustmentActionId',
      },
    };
    Modal.open({
      key: Modal.key(),
      title: intl.get('hzero.common.view.message.operateHistory').d('操作记录'),
      style: {
        width: '742px',
      },
      drawer: true,
      children: <OperationRecord {...modalProps} />,
      footer: (_okBtn) => _okBtn,
      closable: true,
      okText: intl.get('ssrc.common.view.button.close').d('关闭'),
    });
  };

  // 信息补录弹框
  const handleSupplement = async () => {
    const params = {
      priceAdjustmentHeaderId,
      isModal: true,
      showHeader: false,
      basicEditFlag: true, // 基础信息是否可编辑
      lineEditFlag: true, // 行是否可编辑
      cusUnitCode: {
        headerCode: 'SPC.PRICEADJUSTMENTWORKBENCH.DETAIL_CUSTOM.HEADER_FORM',
        lineCode: 'SPC.PRICEADJUSTMENTWORKBENCH.DETAIL_CUSTOM.LINE_EDIT_TABLE',
        searchCode: 'SPC.PRICEADJUSTMENTWORKBENCH.DETAIL_CUSTOM.LINE_SEARCH',
      },
    };
    Modal.open({
      drawer: true,
      key: Modal.key(),
      style: { width: 1090 },
      title: intl.get('ssrc.common.model.field.infoSupplement').d('信息补录'),
      children: (
        <Supplement
          {...routerParams}
          priceAdjustmentModalRef={priceAdjustmentModalRef}
          extraParams={params}
        />
      ),
      onOk: handleOkPriceAdjustModal,
    });
  };

  const handleOkPriceAdjustModal = async () => {
    const { BasicInfoDs: basicInfoDs, LineDs: lineDs } = priceAdjustmentModalRef?.current || {};
    const basicinfoFlag = await basicInfoDs.validate();
    const lineInfoFlag = await lineDs.validate();
    const param = {
      ...basicInfoDs.current?.toData(),
      priceAdjustmentLineList: lineDs.toData(),
    };
    // 此处应该用单据样式的个性化，但是需要后端接口也支持，9.27迭代先用功能页面的个性化单元代替。
    const customizeUnitCode =
      'SPC.PRICEADJUSTMENTWORKBENCH.DETAIL_CUSTOM.LINE_SEARCH,SPC.PRICEADJUSTMENTWORKBENCH.DETAIL.LINE_SEARCH,SPC.PRICEADJUSTMENTWORKBENCH.DETAIL.LINE_EDIT_TABLE';
    if (basicinfoFlag && lineInfoFlag) {
      setQueryLoading(true);
      return handleSave(param, customizeUnitCode)
        .then(async (res) => {
          if (getResponse(res)) {
            // 新建
            await BasicInfoDs.query();
            await LineDs.query();
            notification.success();
          }
        })
        .finally(() => {
          setQueryLoading(false);
        });
    }
  };

  const renderButton = () => {
    const btns = [
      {
        name: 'infoSupplement',
        child: intl.get('ssrc.common.model.field.infoSupplement').d('信息补录'),
        btnType: 'c7n-pro',
        btnProps: {
          type: 'c7n-pro',
          loading: queryLoading,
          color: 'primary',
          icon: 'mode_edit',
          onClick: handleSupplement,
        },
      },
      {
        name: 'operation',
        child: intl.get(`hzero.common.button.operating`).d('操作记录'),
        btnType: 'c7n-pro',
        btnProps: {
          type: 'c7n-pro',
          icon: 'operation_service_request',
          funcType: 'flat',
          loading: queryLoading,
          onClick: operateHistory,
        },
      },
    ];
    return customizeBtnGroup(
      {
        code: 'SPC.PRICEADJUSTMENTWORKBENCH.DETAIL_CUSTOM.BUTTONS',
        pro: true,
      },
      <DynamicButtons defaultBtnType="c7n-pro" buttons={btns} />
    );
  };

  const gotoCalcDetail = (recordLineId) => {
    history.push({
      pathname: `/spc/advanced-pricing-record/detail/${recordLineId}/true`,
    });
  };

  const priceAdjustmentLineProps = {
    customizeBtnGroup,
    customizeTable,
    gotoCalcDetail,
    ruleDefinition,
    priceAdjustmentHeaderId,
    refreshData,
    isEdit: false,
    basicInfoDs: BasicInfoDs,
    dataSet: LineDs,
    cusUnitCode,
  };

  return (
    <Spin spinning={queryLoading}>
      <div className={styles.approval}>
        <div className={styles['basic-box']}>
          {customizeCommon(
            {
              code: 'SPC.PRICEADJUSTMENTWORKBENCH.DETAIL_CUSTOM.AF_BASIC',
              processUnitTag: 'AF-BASIC',
            },
            <AFBasic
              dataSet={BasicInfoDs}
              titleField="priceAdjustmentName"
              tagFields={['priceAdjustmentTypeMeaning', 'sourceFromMeaning']}
              normalFields={['creationDate', 'createdByName', 'priceAdjustmentCode']}
              contentBottomRender={renderButton}
              {...(cuxProps?.AFBasicProps || {})}
            />
          )}
        </div>
        <div className={styles['basic-afextra']}>
          {customizeCommon(
            {
              code: `SPC.PRICEADJUSTMENTWORKBENCH.DETAIL_CUSTOM.AF_EXTRA`,
              processUnitTag: 'AF-EXTRA',
            },
            <AFExtra
              dataSet={BasicInfoDs}
              fields={['remark']}
              {...(cuxProps?.AFExtraProps || {})}
            />
          )}
        </div>
        <Content>
          <div className={styles['custom-page-content']}>
            <h3>
              {intl.get('ssrc.priceAdjustmentWorkBench.content.cardTitle.line').d('调价单明细信息')}
            </h3>
            <PriceAdjustmentLine {...priceAdjustmentLineProps} />
          </div>
          {remote
            ? remote.render('SSRC_PRICE_ADJUSTMENT_WORKBENCH_SUBMIT_APPROVE_CONTENT', null, {
                props,
                styles,
              })
            : null}
        </Content>
      </div>
    </Spin>
  );
};

export default flow(
  observer,
  WithCustomize({
    isTemplate: true,
  }),
  formatterCollections({
    code: [
      'ssrc.priceAdjustmentWorkBench',
      'spcm.common',
      'spc.advancedPricingRecord',
      'ssrc.priceLibraryNew',
      'ssrc.inquiryHall',
      'ssrc.common',
      'hzero.common',
    ],
  }),
  hocRemote({
    code: 'SSRC_PRICE_ADJUSTMENT_WORKBENCH_SUBMIT_APPROVE',
    name: 'remote',
  })
)(SubmitApprove);
