import React from 'react';

export default function getTheme(tenant) {
  if (tenant) {
    switch (tenant.tenantNum) {
      case 'SRM-STARBUCKS':
        return import('./starbucks');
      case 'SRM-BILIBILI':
        return import('./bilibili');
      default:
    }
  }
}
