import React, { useEffect, useState } from 'react';
import { Spin } from 'choerodon-ui';
import { getResponse } from 'utils/utils';
import { queryChangeInfo, queryCompareContract } from '@/services/workspaceService';
import DsRender from './dsRender';

const ChangeCompare = props => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState('');
  const [contractList, setContractList] = useState([]);
  const { editable = false, rebateFlag } = props;
  const [mainContractId, setMainContractId] = useState(props.mainContractId);
  const [pcHeaderId, setPcHeaderId] = useState(props.pcHeaderId);
  const header = {
    queryPayload: {
      url: `pc-compare/compare-header?mainContractId=${mainContractId}&pcHeaderId=${pcHeaderId}`,
      customizeUnitCode: editable
        ? 'SPCM.WORKSPACE_DETAIL.HEADER'
        : 'SPCM.WORKSPACE_DETAIL.HEADER.READONLY',
    },
  };
  const subject = {
    queryPayload: {
      url: `pc-compare/compare-subject?mainContractId=${mainContractId}&pcHeaderId=${pcHeaderId}`,
      customizeUnitCode: editable
        ? 'SPCM.WORKSPACE_DETAIL.SUBJECT'
        : 'SPCM.WORKSPACE_DETAIL.SUBJECT.READONLY',
      pageFlag: true,
    },
  };
  const stage = {
    queryPayload: {
      url: `pc-compare/compare-stage?mainContractId=${mainContractId}&pcHeaderId=${pcHeaderId}`,
      customizeUnitCode: editable
        ? 'SPCM.WORKSPACE_DETAIL.STAGE'
        : 'SPCM.WORKSPACE_DETAIL.STAGE.READONLY',
      pageFlag: true,
    },
  };
  const rebates = {
    queryPayload: {
      url: `pc-compare/compare-rebates?mainContractId=${mainContractId}&pcHeaderId=${pcHeaderId}`,
      customizeUnitCode: editable
        ? 'SPCM.WORKSPACE_DETAIL.REBATE'
        : 'SPCM.WORKSPACE_DETAIL.REBATE.READONLY',
      pageFlag: true,
    },
  };
  const terms = {
    queryPayload: {
      url: `pc-compare/compare-terms?mainContractId=${mainContractId}&pcHeaderId=${pcHeaderId}`,
      customizeUnitCode: editable
        ? 'SPCM.WORKSPACE_DETAIL.BUSINESSTERMS'
        : 'SPCM.WORKSPACE_DETAIL.BUSINESSTERMS.READONLY',
    },
  };
  const partner = {
    queryPayload: {
      url: `pc-compare/compare-partner?mainContractId=${mainContractId}&pcHeaderId=${pcHeaderId}`,
      customizeUnitCode: editable
        ? 'SPCM.WORKSPACE_DETAIL.PARTNER'
        : 'SPCM.WORKSPACE_DETAIL.PARTNER.READONLY',
    },
  };

  const getCompareContract = async () => {
    const res = await queryCompareContract({ mainContractId });
    if (getResponse(res)) {
      setContractList(res);
    }
  };

  useEffect(() => {
    getCompareContract();
  }, []);

  useEffect(() => {
    let arr = [header, partner, subject, stage, terms];
    setLoading(true);
    if (rebateFlag) {
      arr = arr.concat(rebates);
    }
    Promise.all(
      arr.map(item => {
        return queryChangeInfo(item.queryPayload);
      })
    )
      .then(([h, p, sub, stageR, termsR, rebatesR]) => {
        const obj = {
          newPcHeader: h?.newPcHeader,
          oldPcHeader: h?.oldPcHeader,
          newPartneres: p?.newPartneres,
          oldPartneres: p?.oldPartneres,
          newSubjects: sub?.newSubjects?.content,
          oldSubjects: sub?.oldSubjects?.content,
          oldStages: stageR?.oldStages?.content,
          newStages: stageR?.newStages?.content,
          newRebates: rebatesR?.newRebates?.content,
          oldRebates: rebatesR?.oldRebates?.content,
          newTerms: termsR?.newTerms,
          oldTerms: termsR?.oldTerms,
          changeCount:
            h?.changeCount +
            p?.changeCount +
            sub?.changeCount +
            stageR?.changeCount +
            termsR?.changeCount,
        };
        setData(obj);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [mainContractId, pcHeaderId]);
  return (
    <Spin spinning={loading}>
      <div style={{ minHeight: 300 }}>
        {data && (
          <DsRender
            {...props}
            mainContractId={mainContractId}
            pcHeaderId={pcHeaderId}
            key={`${data.newPcHeader?.pcHeaderId}${data.oldPcHeader?.pcHeaderId}`}
            changeCompareData={data}
            editable={false}
            contractList={contractList}
            setMainContractId={setMainContractId}
            setPcHeaderId={setPcHeaderId}
          />
        )}
      </div>
    </Spin>
  );
};

export default ChangeCompare;
