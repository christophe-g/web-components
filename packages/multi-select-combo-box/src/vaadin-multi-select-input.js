/**
 * @license
 * Copyright (c) 2017 - 2022 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */
import '@vaadin/input-container/src/vaadin-input-container.js';
import './vaadin-multi-select-combo-box-chip.js';
import { html, PolymerElement } from '@polymer/polymer';
import { ElementMixin } from '@vaadin/component-base/src/element-mixin.js';
import { InputController } from '@vaadin/field-base/src/input-controller.js';
import { InputFieldMixin } from '@vaadin/field-base/src/input-field-mixin.js';
import { LabelledInputController } from '@vaadin/field-base/src/labelled-input-controller.js';
import { PatternMixin } from '@vaadin/field-base/src/pattern-mixin.js';
import { inputFieldShared } from '@vaadin/field-base/src/styles/input-field-shared-styles.js';
import { registerStyles, ThemableMixin } from '@vaadin/vaadin-themable-mixin/vaadin-themable-mixin.js';
import adjustTextColor from './adjust-text-color.js';

registerStyles('multiselect-input', inputFieldShared, { moduleId: 'material-text-field-styles' });

/**
 * `<multiselect-input>` is a web component that allows the user to input chips as value.
 *
 * ```html
 * <multiselect-input label="First Name"></multiselect-input>
 * ```
 *
 * ### TODO
 * - upgrade from MD3 when available
 * - if MD3 lands too late - make this component accessible (navigate chips with arrow keys, clear on space)
 *
 * ### Styling
 *
 * The following custom properties are available for styling:
 *
 * Custom property                | Description                | Default
 * -------------------------------|----------------------------|---------
 * `--vaadin-field-default-width` | Default width of the field | `12em`
 *
 * The following shadow DOM parts are available for styling:
 *
 * Part name            | Description
 * ---------------------|----------------
 * `label`              | The label element
 * `input-field`        | The element that wraps prefix, value and suffix
 * `clear-button`       | The clear button
 * `error-message`      | The error message element
 * `helper-text`        | The helper text element wrapper
 * `required-indicator` | The `required` state indicator element
 *
 * The following state attributes are available for styling:
 *
 * Attribute           | Description | Part name
 * --------------------|-------------|------------
 * `disabled`          | Set to a disabled text field | :host
 * `has-value`         | Set when the element has a value | :host
 * `has-label`         | Set when the element has a label | :host
 * `has-helper`        | Set when the element has helper text or slot | :host
 * `has-error-message` | Set when the element has an error message | :host
 * `invalid`           | Set when the element is invalid | :host
 * `input-prevented`   | Temporarily set when invalid input is prevented | :host
 * `focused`           | Set when the element is focused | :host
 * `focus-ring`        | Set when the element is keyboard focused | :host
 * `readonly`          | Set to a readonly text field | :host
 *
 * See [Styling Components](https://vaadin.com/docs/latest/ds/customization/styling-components) documentation.
 *
 * @fires {Event} input - Fired when the value is changed by the user: on every typing keystroke, and the value is cleared using the clear button.
 * @fires {Event} change - Fired when the user commits a value change.
 * @fires {CustomEvent} invalid-changed - Fired when the `invalid` property changes.
 * @fires {CustomEvent} value-changed - Fired when the `value` property changes.
 *
 * @extends HTMLElement
 * @mixes ElementMixin
 * @mixes ThemableMixin
 * @mixes PatternMixin
 * @mixes InputFieldMixin
 */
export class MultiselectInput extends PatternMixin(InputFieldMixin(ThemableMixin(ElementMixin(PolymerElement)))
) {
  static get is() {
    return 'vaadin-multi-select-input';
  }

  static get template() {
    return html`
      <style>
        [part='input-field'] {
          flex-grow: 0;
        }

        /* This is to allow chips to wrap and input element to still be aligned */
        :host {
          align-items: center;
        }
        [part='input-field'] {
          flex: 1;
          flex-wrap: wrap;
        }
        [part='input-field'] ::slotted(:is(input, textarea)) {
          flex: 1;
          min-width: 100px;
        }
      </style>

      <div class="vaadin-field-container">
        <div part="label">
          <slot name="label"></slot>
          <span part="required-indicator" aria-hidden="true" on-click="focus"></span>
        </div>

        <vaadin-input-container
          _on-value-changed="_onValueChanged"
          on-key-down="onKeyDown"
          part="input-field"
          readonly="[[readonly]]"
          disabled="[[disabled]]"
          invalid="[[invalid]]"
          theme$="[[_theme]]"
        >
          <template id="repeat" is="dom-repeat" items="[[items]]">
            <multiselect-combo-box-chip
              tabindex="0"
              slot="prefix"
              style$="[[_getChipStyle(item, itemColorPath)]]"
              slot="prefix"
              part="chip"
              item="[[item]]"
              label="[[_getItemLabel(item, itemLabelPath)]]"
              on-item-removed="_onItemRemoved"
              on-focus="_onChipFocus"
              on-blur="_onChipBlur"
            ></multiselect-combo-box-chip>
          </template>

          <slot name="prefix" slot="prefix"></slot>

          <slot name="input"></slot>
          <slot name="suffix" slot="suffix"></slot>
          <div id="clearButton" part="clear-button" slot="suffix" aria-hidden="true"></div>
        </vaadin-input-container>

        <div part="helper-text">
          <slot name="helper"></slot>
        </div>

        <div part="error-message">
          <slot name="error-message"></slot>
        </div>
      </div>
    `;
  }

  static get properties() {
    return {
      /**
       * A full set of items to filter the visible options from.
       * The items can be of either `String` or `Object` type.
       */
      items: {
        type: Array,
      },

      /**
       * The item property used for a visual representation of the item.
       * @attr {string} item-label-path
       */
      itemLabelPath: {
        type: String,
        value: 'label',
      },

      /**
       * The item property used for a background color of the item.
       * @attr {string} item-label-path
       */
      itemColorPath: {
        type: String
      },

      /**
       * Path for the value of the item. If `items` is an array of objects,
       * this property is used as a string value for the selected item.
       * @attr {string} item-value-path
       */
      itemValuePath: {
        type: String,
        value: 'value',
      },


      /**
       * Maximum number of characters (in Unicode code points) that the user can enter.
       */
      maxlength: {
        type: Number
      },

      /**
       * Minimum number of characters (in Unicode code points) that the user can enter.
       */
      minlength: {
        type: Number
      },

      /**
       * `showCounter` display a paper-badge with `showCounter` as textContent
       */
      showCounter: {
        type: Boolean
      },

      /**
       * `maxTags` The maximum allowed number of tags (yet to be implemented)
       */
      maxTags: {
        type: Number
      },

      /**
       * `minTags` The minimum allowed number of tags (yet to be implemented)
       */
      minTags: {
        type: Number
      }
    };
  }

  static get delegateAttrs() {
    return [...super.delegateAttrs, 'maxlength', 'minlength'];
  }

  static get constraints() {
    return [...super.constraints, 'maxlength', 'minlength'];
  }

  get hasDuplicate() {
    const value = this.inputElement?.value;
    if (!value) {
      return false;
    }
    return this.items.some((item) => {
      return this.get(this.itemValuePath, item) === value || item === value;
    });
  }

  checkValidity() {
    this.invalid = false;
    const valid = super.checkValidity();
    if (!valid) {
      return valid;
    }
    if (this.hasDuplicate) {
      this.invalid = true;
      this.errorMessage = 'Duplicate value';
      return false;
    }
    if (this.maxTags && this.items.length > this.maxTags) {
      this.invalid = true;
      this.errorMessage = 'Too many values. Maximum allowed is ' + this.maxTags;
      return false;
    }
    // const event = new CustomEvent('validity-check', { detail: { value: this.inputElement?.value } });
    // this.dispatchEvent(event);
    // if (event.detail.valid === false) {
    //   this.invalid = true;
    //   this.errorMessage = event.detail.message;
    //   return false;
    // }
    return true;
  }

  constructor() {
    super();
    this._setType('text');
  }


  static get observers() {
    return [
      '_itemsChanged(items)',
    ];
  }


	_itemsChanged(items) {
		this._checkHasValue()
	}
  /** @protected */
  get clearElement() {
    return this.$.clearButton;
  }

  /** @protected */
  ready() {
    super.ready();

    this.addController(
      new InputController(this, (input) => {
        this._setInputElement(input);
        this._setFocusElement(input);
        this.stateTarget = input;
        this.ariaTarget = input;
      })
    );
    this.addController(new LabelledInputController(this.inputElement, this._labelController));
  }

  connectedCallback() {
    super.connectedCallback();
    this._checkHasValue();
  }

  _checkHasValue() {
    this.toggleAttribute('has-value', Boolean(this.inputElement.value || this.items?.length));
  }

  _dispatchItemsChanged(items) {
    this.dispatchEvent(new CustomEvent('items-changed', { detail: { value: items }, bubbles: true, composed: true }));
  }

  _dispatchItemAdded(item) {
    this.dispatchEvent(new CustomEvent('item-added', { detail: { value: item }, bubbles: true, composed: true }));
  }

  _dispatchItemRemoved(item) {
    this.dispatchEvent(new CustomEvent('item-removed', { detail: { value: item }, bubbles: true, composed: true }));
  }

  _onChipFocus(e) {
    this._focusedChip = e.target;
    
  }

  _onChipBlur(e) {
    this._focusedChip = null;
    
  }

  _onKeyDown(e) {
    if (e.key === 'Enter') {
      const valid = this.checkValidity();
      if (!valid) {
        this.errorMessage = this.inputElement.validationMessage;
        return;
      }

      const value = e.target.value;
      const item =
        this.itemLabelPath && this.itemValuePath
          ? { [this.itemLabelPath]: e.target.value, [this.itemValuePath]: value }
          : value;

      // TODO: check if maxTags is reached
      // TODO: check if pattern is matched

      this.items = [...this.items, item];
      e.target.value = '';
      this._dispatchItemsChanged(this.items);
      this._dispatchItemAdded(item);
      this._checkHasValue();
      return;
    }

    if (e.key === 'Backspace') {
			let removedItem ;
      if (!this._focusedChip && e.target.value === '') {
        removedItem = this.items.pop();
        this.items = [...this.items];
				
      }
      if (this._focusedChip) {
				removedItem = this._focusedChip.item;
				this.items = this.items.filter((item) => item !== this._focusedChip.item);
				
      }
      this._checkHasValue();
			if (removedItem) {
				this._dispatchItemsChanged(this.items);
				this._dispatchItemRemoved(removedItem);

			}
			this._focusedChip = null;
    }
    // if (e.key === 'arrow-left') {
    // 	if (this._focusedChip) {
    // 		this._focusedChip.focus();
    // 	} else {
    // 		this.inputElement.focus();
    // 	}
    // }
  }

  /** @private */
  _onItemRemoved(event) {
    const item = event.detail.item;
    this.items = this.items.filter((i) => i !== item);
    this._dispatchItemsChanged(this.items);
    this._dispatchItemRemoved(item);
    this._checkHasValue();
  }


  /** @private */
  _getItemLabel(item) {
    return item && Object.prototype.hasOwnProperty.call(item, this.itemLabelPath) ? item[this.itemLabelPath] : item;
  }


  /**
   * Returns the item backgroundColor.
   * @protected
   */
    _getItemColor(item, itemColorPath) {
    return item && Object.prototype.hasOwnProperty.call(item, itemColorPath) ? item[itemColorPath] : '';
  }

  /**
   * Returns the item backgroundColor.
   * @protected
   */
  _getItemValue(item, itemValuePath) {
    return item && Object.prototype.hasOwnProperty.call(item, itemValuePath) ? item[itemValuePath] : '';
  }

  /** @private */
  _getChipStyle(item, itemColorPath) {
    if(itemColorPath) {
      const color = this._getItemColor(item, itemColorPath)
      if(color) {
        return `--chip-text-color: ${adjustTextColor(color)};--chip-background-color: ${color};`
      }
    }
    return ''
  }


}

customElements.define(MultiselectInput.is, MultiselectInput);
