/**
 * 补充物料
 */
import React, { useMemo, useCallback, useRef, useState } from 'react';
import { Button, Icon, Lov, TextField } from 'choerodon-ui/pro';
import { Spin } from 'choerodon-ui';

import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import { useModal } from 'components/Import';

import styles from './index.less';
import SectionPanel from './SectionPanel/detail';
import HelpMessageSection from './HelpMessageSection';

const promptCode = 'ssrc.inquiryHall';
const organizationId = getCurrentOrganizationId();

export default function SupplementaryItemDrawer(props) {
  const {
    dataSet,
    rfxHeaderId,
    createItemFlag,
    sourceKey = 'INQUIRY',
    projectLineSectionList,
    rfxHeaderIds,
    batchImportProps = () => {},
    customizeTable = () => {},
    pageLoading = false,
  } = props;

  const [sectionHeaderId, setSectionHeaderId] = useState(rfxHeaderId);
  const [showFlag, setShowFlag] = useState(true);

  const excelImportModal = useModal()?.openModal;

  const searchBarRef = useRef({});

  /**
   * 切换分页前保存
   */
  // const handleChangePagination = useCallback(async (page, size) => {
  //   const validateFlag = await dataSet.validate();
  //   // if (validateFlag) {
  //   //   getResponse(await dataSet.submit());
  //   // }
  // }, [dataSet]);
  const columns = useMemo(() => {
    return [
      {
        name: 'rfxLineItemNum',
        width: 70,
      },
      {
        name: 'itemCode',
        width: 130,
        editor: () =>
          createItemFlag === 1 ? <TextField name="itemCode" /> : <Lov name="itemCode" />,
      },
      {
        name: 'itemName',
        width: 150,
        editor: createItemFlag !== 1,
      },
      {
        name: 'itemCategoryName',
        width: 150,
        editor: createItemFlag !== 1,
      },
      {
        name: 'ouName',
        width: 150,
      },
      {
        name: 'invOrganizationName',
        width: 150,
      },
    ];
  }, [createItemFlag]);

  const handleBindRef = useCallback((vnode) => {
    searchBarRef.current = vnode;
  }, []);

  const handleSearch = useCallback(() => {
    const queryParams = searchBarRef.current?.getQueryParameter() || {};
    dataSet.setQueryParameter('queryParams', queryParams);
    dataSet.query();
  }, [dataSet]);

  const sectionProps = {
    showFlag,
    setShowFlag,
    className: styles['help-message-section-wrap'],
    leftIcon: 'help',
    helpMessage:
      createItemFlag === 1
        ? intl
            .get(`${promptCode}.view.message.createItemTips`)
            .d('请确认要创建编码的物料, 勾选后提交, 且提交后不可更改!')
        : intl
            .get(`${promptCode}.view.message.supplementaryItemTips`)
            .d('请确认要补充编码的物料, 勾选后提交, 且提交后不可更改!'),
  };

  const fieldProps = useMemo(
    () => ({
      itemCategoryId: {
        lovPara: { tenantId: organizationId, rfxHeaderId: sectionHeaderId },
      },
      ouId: {
        lovPara: { tenantId: organizationId, rfxHeaderId: sectionHeaderId },
      },
      invOrganizationId: {
        lovPara: { tenantId: organizationId, rfxHeaderId: sectionHeaderId },
      },
    }),
    [sectionHeaderId]
  );

  const afterOpenSection = useCallback(
    async (curHeaderId, validate) => {
      const res = getResponse(await dataSet.forceSubmit());
      if (res || res === undefined || !validate) {
        setSectionHeaderId(curHeaderId);
        dataSet.setQueryParameter('sectionHeaderId', curHeaderId);
        if (searchBarRef.current) {
          searchBarRef.current.queryDs.reset();
          searchBarRef.current.fetchFilters();
        }
        dataSet.query();
      }
    },
    [dataSet]
  );

  const beforeOpenSection = useCallback(async () => {
    return true;
  }, [dataSet]);

  const SectionPanelProps = {
    sectionList: projectLineSectionList,
    rfxHeaderIds,
    parentPage: {
      name: 'addItem',
      queryParams: {
        rfxHeaderId: sectionHeaderId,
      },
    },
    queryParams: {
      rfxHeaderId: sectionHeaderId,
    },
    isSection: projectLineSectionList?.length,
    sourceKey,
    // onRef: getSectionRef,
    beforeOpenSection,
    afterOpenSection,
    switchNotification: intl
      .get('ssrc.inquiryHall.model.inquiryHall.requiredItemsNotFilledIn')
      .d('有必填项未填，无法保存当前页面信息，是否确认切换页面?'),
  };

  const handleExcelImport = useCallback(() => {
    excelImportModal(batchImportProps({ sectionHeaderId }));
  }, [sectionHeaderId]);

  return (
    <div className={styles['supplementary-item-drawer-container']}>
      <HelpMessageSection {...sectionProps} />
      <Spin spinning={pageLoading}>
        <SectionPanel {...SectionPanelProps}>
          {customizeTable(
            {
              code: `SSRC.${sourceKey}_HALL_CHECK_PRICE_NEW.ITEM_LINE_ADD`,
              dataSet,
            },
            <SearchBarTable
              searchBarRef={handleBindRef}
              searchCode={`SSRC.${sourceKey}_HALL_CHECK_PRICE_NEW.ITEM_FILTER_BAR`}
              dataSet={dataSet}
              searchBarConfig={{
                fieldProps,
                autoQuery: false,
                closeFilterSelector: true,
                onQuery: handleSearch,
              }}
              columns={columns}
              buttons={[
                <Button onClick={handleExcelImport} funcType="flat">
                  <Icon type="archive" /> {intl.get(`${promptCode}.view.button.import`).d('导入')}
                </Button>,
              ]}
            />
          )}
        </SectionPanel>
      </Spin>
    </div>
  );
}
