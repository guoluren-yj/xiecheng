/*
 * @Description: 公司关联列表
 * @Date: 2023-09-12 11:46:55
 * @Author: MYT<yitian.mao@going-link.com>
 * @Version: 1.0.0
 * @Copyright: Copyright (c) 2021, ZhenYun
 */
import React, { useMemo, useEffect } from 'react';
import { Table, Modal, useDataSet } from 'choerodon-ui/pro';
import FilterBarTable from '_components/FilterBarTable';
import { yesOrNoRender } from 'utils/renderer';

import intl from 'utils/intl';
import { AffiliatedCompanyDS, AddCompanyDS } from './AffiliatedCompanyDS';

const AffiliatedCompany = (props) => {
  const {
    rebateInformationId,
    editable,
    modal: { update },
  } = props;
  const affiliatedCompanyDs = useDataSet(
    () => AffiliatedCompanyDS({ rebateInformationId, editable }),
    [rebateInformationId, editable]
  );
  const addCompanyDs = useDataSet(() => AddCompanyDS(), []);

  useEffect(() => {
    update({
      onOk: () => affiliatedCompanyDs.submit(),
    });
  }, []);

  /**
   * 公司选定确认
   * @returns boolean
   */
  const handleSureAddCompany = () => {
    if (addCompanyDs.selected.length) {
      (addCompanyDs.selected || []).forEach((record) =>
        affiliatedCompanyDs.create(record.toData(), affiliatedCompanyDs.length)
      );
      return true;
    } else {
      return false;
    }
  };

  const addColumns = useMemo(
    () => [
      { name: 'companyNum', width: 150 },
      { name: 'companyName', width: 300 },
    ],
    []
  );

  /**
   * 打开公司弹框
   */
  const fetchAddCompany = async () => {
    const companyIds = (affiliatedCompanyDs?.map((record) => record.get('companyId')) || []).join(
      ','
    );
    addCompanyDs.setQueryParameter('companyIds', companyIds);
    await addCompanyDs.query();
    Modal.open({
      closable: true,
      key: Modal.key(),
      drawer: false,
      title: intl.get(`spcm.common.model.companyList`).d('公司列表'),
      children: <Table queryFieldsLimit={2} dataSet={addCompanyDs} columns={addColumns} />,
      style: { width: 742 },
      onOk: handleSureAddCompany,
    });
  };

  const columns = useMemo(
    () => [
      {
        name: 'companyNum',
        width: 200,
      },
      {
        name: 'companyName',
        width: 300,
      },
      {
        name: 'enabledFlag',
        width: 100,
        editor: editable,
        renderer: ({ value }) => yesOrNoRender(value),
      },
    ],
    []
  );

  const getButtons = useMemo(() => {
    return editable
      ? [
          ['add', { onClick: fetchAddCompany }],
          [
            'delete',
            {
              icon: 'delete_sweep',
              children: intl.get(`hzero.common.button.batchdelete`).d('批量删除'),
            },
          ],
        ]
      : [];
  }, [editable]);

  return (
    <FilterBarTable
      style={{ maxHeight: 'calc(100vh - 160px)' }}
      buttons={getButtons}
      dataSet={affiliatedCompanyDs}
      columns={columns}
    />
  );
};

const showAffiliatedCompany = (props = {}) => {
  const { editable } = props;

  const isViewProps = !editable && {
    okButton: false,
    cancelText: intl.get('hzero.common.button.close').d('关闭'),
    cancelProps: {
      color: 'primary',
    },
  };

  Modal.open({
    closable: true,
    movable: false,
    drawer: true,
    key: Modal.key(),
    title: intl.get(`spcm.common.model.companyList`).d('公司列表'),
    style: {
      width: 742,
    },
    children: <AffiliatedCompany {...props} />,
    ...isViewProps,
  });
};

export { showAffiliatedCompany, AffiliatedCompany };
