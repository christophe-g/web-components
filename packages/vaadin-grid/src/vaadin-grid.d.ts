/**
 * @license
 * Copyright (c) 2016 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */
import { GridDefaultItem } from '@vaadin/grid/src/vaadin-grid.js';
import { Grid } from '@vaadin/grid/src/vaadin-grid.js';

/**
 * @deprecated Import `Grid` from `@vaadin/grid` instead.
 */
export type GridElement<TItem = GridDefaultItem> = Grid<TItem>;

/**
 * @deprecated Import `Grid` from `@vaadin/grid` instead.
 */
export const GridElement: typeof Grid;

export * from '@vaadin/grid/src/vaadin-grid.js';
