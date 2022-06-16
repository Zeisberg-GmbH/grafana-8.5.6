import { css, cx } from '@emotion/css';
import { orderBy } from 'lodash';
import React from 'react';

import { DisplayValue, GrafanaTheme2 } from '@grafana/data';

import { useStyles2 } from '../../themes/ThemeContext';
import { Icon } from '../Icon/Icon';

import { LegendTableItem } from './VizLegendTableItem';
import { VizLegendTableProps } from './types';

/**
 * @internal
 */
export const VizLegendTable = <T extends unknown>({
  items,
  sortBy: sortKey,
  sortDesc,
  itemRenderer,
  className,
  onToggleSort,
  onLabelClick,
  onLabelMouseEnter,
  onLabelMouseOut,
  readonly,
}: VizLegendTableProps<T>): JSX.Element => {
  const styles = useStyles2(getStyles);
  const stats: Record<string, DisplayValue> = {};

  for (const item of items) {
    if (item.getDisplayValues) {
      for (const displayValue of item.getDisplayValues()) {
        stats[displayValue.title ?? '?'] = displayValue;
      }
    }
  }

  const sortedItems = sortKey
    ? orderBy(
        items,
        (item) => {
          if (item.getDisplayValues) {
            const stat = item.getDisplayValues().filter((stat) => stat.title === sortKey)[0];
            return stat && stat.numeric;
          }
          return undefined;
        },
        sortDesc ? 'desc' : 'asc'
      )
    : items;

  if (!itemRenderer) {
    /* eslint-disable-next-line react/display-name */
    itemRenderer = (item, index) => (
      <LegendTableItem
        key={`${item.label}-${index}`}
        item={item}
        onLabelClick={onLabelClick}
        onLabelMouseEnter={onLabelMouseEnter}
        onLabelMouseOut={onLabelMouseOut}
        readonly={readonly}
      />
    );
  }

  return (
    <table className={cx(styles.table, className)}>
      <thead>
        <tr>
          <th></th>
          {Object.keys(stats).map((columnTitle) => {
            const displayValue = stats[columnTitle];
            return (
              <th
                title={displayValue.description}
                key={columnTitle}
                className={cx(styles.header, onToggleSort && styles.headerSortable, {
                  [styles.withIcon]: sortKey === columnTitle,
                })}
                onClick={() => {
                  if (onToggleSort) {
                    onToggleSort(columnTitle);
                  }
                }}
              >
                {columnTitle}
                {sortKey === columnTitle && <Icon size="xs" name={sortDesc ? 'angle-down' : 'angle-up'} />}
              </th>
            );
          })}
        </tr>
      </thead>
      <tbody>{sortedItems.map(itemRenderer!)}</tbody>
    </table>
  );
};

const getStyles = (theme: GrafanaTheme2) => ({
  table: css`
    width: 100%;
    th:first-child {
      width: 100%;
      border-bottom: 1px solid ${theme.colors.border.weak};
    }
  `,
  header: css`
    color: ${theme.colors.primary.text};
    font-weight: ${theme.typography.fontWeightMedium};
    border-bottom: 1px solid ${theme.colors.border.weak};
    padding: ${theme.spacing(0.25, 2, 0.25, 1)};
    font-size: ${theme.typography.bodySmall.fontSize};
    text-align: left;
    white-space: nowrap;
  `,
  // This needs to be padding-right - icon size(xs==12) to avoid jumping
  withIcon: css`
    padding-right: 4px;
  `,
  headerSortable: css`
    cursor: pointer;
  `,
});
