/**
 * @license
 * Copyright (c) 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */

/**
 * Cause a text string to be announced by screen readers.
 */
export function announce(text: string, options?: { mode?: 'polite' | 'assertive' | 'alert'; timeout?: number }): void;
