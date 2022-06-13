/**
 * @license
 * Copyright (c) 2021 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */
import { ComboBoxPlaceholder } from '@vaadin/combo-box/src/vaadin-combo-box-placeholder.js';
import { ComboBoxScroller } from '@vaadin/combo-box/src/vaadin-combo-box-scroller.js';
import adjustTextColor from './adjust-text-color';

/**
 * An element used internally by `<vaadin-multi-select-combo-box>`. Not intended to be used separately.
 *
 * @extends ComboBoxScroller
 * @private
 */
class MultiSelectComboBoxScroller extends ComboBoxScroller {
  static get is() {
    return 'vaadin-multi-select-combo-box-scroller';
  }

  /** @protected */
  ready() {
    super.ready();

    this.setAttribute('aria-multiselectable', 'true');
  }
  /** @private */
  __updateElement(el, index) {
    super.__updateElement(el, index);
    const comboBox = this.comboBox;
    let background;
    
    if(comboBox && (background = comboBox._getItemColor(el.item, comboBox.itemColorPath))) {
      el.style.backgroundColor = background;
      el.style.color = adjustTextColor(background);
      // we add a class so that the checkbox can inherit the color
      el.classList.add('custom-color');
    } else {
      el.classList.remove('custom-color');
    }
    el.toggleAttribute('readonly', this.comboBox.readonly);
    
  }

  /** @private */
  __getAriaSelected(_focusedIndex, itemIndex) {
    const item = this.items[itemIndex];
    return this.__isItemSelected(item, null, this.itemIdPath).toString();
  }

  /** @private */
  __isItemSelected(item, _selectedItem, itemIdPath) {
    if (item instanceof ComboBoxPlaceholder) {
      return false;
    }

    if (this.comboBox.readonly) {
      return false;
    }

    return this.comboBox._findIndex(item, this.comboBox.selectedItems, itemIdPath) > -1;
  }

}

customElements.define(MultiSelectComboBoxScroller.is, MultiSelectComboBoxScroller);
