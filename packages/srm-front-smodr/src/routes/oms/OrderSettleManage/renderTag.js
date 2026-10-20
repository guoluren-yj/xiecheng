function renderColorInvoice(recordStatus = '') {
  if (['PROCESSING'].includes(recordStatus)) {
    return {
      backgroundColor: 'rgba(252,160,0,0.1)',
      color: '#F88D10',
      padding: '2px 4px',
      borderRadius: '2px',
      fontWeight: 600,
      border: 'none', // 黄
    };
  } else if (recordStatus === 'FAILED') {
    return {
      color: '#F56649',
      backgroundColor: 'rgba(245,99,73,0.10)',
      padding: '2px 4px',
      borderRadius: '2px',
      fontWeight: 600,
      border: 'none', // 红
    };
  } else if (recordStatus === 'NON_INVOICE') {
    return {
      color: 'rgba(0,0,0,0.65)',
      backgroundColor: 'rgba(0,0,0,0.06)',
      padding: '2px 4px',
      borderRadius: '2px',
      fontWeight: 600,
      border: 'none', // 灰
    };
  } else {
    return {
      backgroundColor: 'rgba(71,184,129,0.10)',
      color: '#47B881', // 绿
      padding: '2px 4px',
      borderRadius: '2px',
      fontWeight: 600,
      border: 'none',
    };
  }
}

function renderColorStatement(recordStatus = '') {
  if (['TO_CONFIRM', 'PART_STATEMENTS', 'DIFFERENT'].includes(recordStatus)) {
    return {
      backgroundColor: 'rgba(252,160,0,0.1)',
      color: '#F88D10',
      padding: '2px 4px',
      borderRadius: '2px',
      fontWeight: 600,
      border: 'none', // 黄
    };
  } else if (recordStatus === 'STATEMENTED') {
    return {
      backgroundColor: 'rgba(71,184,129,0.10)',
      color: '#47B881', // 绿
      padding: '2px 4px',
      borderRadius: '2px',
      fontWeight: 600,
      border: 'none',
    };
  } else {
    return {
      color: 'rgba(0,0,0,0.65)',
      backgroundColor: 'rgba(0,0,0,0.06)',
      padding: '2px 4px',
      borderRadius: '2px',
      fontWeight: 600,
      border: 'none', // 灰
    };
  }
}

function renderColorRequest(recordStatus = '') {
  if (['NEW', 'SUBMITTED'].includes(recordStatus)) {
    return {
      backgroundColor: 'rgba(252,160,0,0.1)',
      color: '#F88D10',
      padding: '2px 4px',
      borderRadius: '2px',
      fontWeight: 600,
      border: 'none', // 黄
    };
  } else if (recordStatus === 'PASS') {
    return {
      backgroundColor: 'rgba(71,184,129,0.10)',
      color: '#47B881', // 绿
      padding: '2px 4px',
      borderRadius: '2px',
      fontWeight: 600,
      border: 'none',
    };
  } else if (recordStatus === 'REJECT') {
    return {
      color: '#F56649',
      backgroundColor: 'rgba(245,99,73,0.10)',
      padding: '2px 4px',
      borderRadius: '2px',
      fontWeight: 600,
      border: 'none', // 红
    };
  } else {
    return {
      color: 'rgba(0,0,0,0.65)',
      backgroundColor: 'rgba(0,0,0,0.06)',
      padding: '2px 4px',
      borderRadius: '2px',
      fontWeight: 600,
      border: 'none', // 灰
    };
  }
}

function renderColorValidity(recordStatus = '') {
  if (recordStatus === 'VALID') {
    return {
      backgroundColor: 'rgba(71,184,129,0.10)',
      color: '#47B881', // 绿
      padding: '2px 4px',
      borderRadius: '2px',
      fontWeight: 600,
      border: 'none',
    };
  } else if (recordStatus === 'ABNORMAL') {
    return {
      color: '#F56649',
      backgroundColor: 'rgba(245,99,73,0.10)',
      padding: '2px 4px',
      borderRadius: '2px',
      fontWeight: 600,
      border: 'none', // 红
    };
  } else {
    return {
      color: 'rgba(0,0,0,0.65)',
      backgroundColor: 'rgba(0,0,0,0.06)',
      padding: '2px 4px',
      borderRadius: '2px',
      fontWeight: 600,
      border: 'none', // 灰
    };
  }
}

export { renderColorInvoice, renderColorStatement, renderColorRequest, renderColorValidity };
