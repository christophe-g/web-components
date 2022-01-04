import { expect } from '@esm-bundle/chai';
import { aTimeout, fixtureSync, nextFrame, nextRender } from '@vaadin/testing-helpers';
import './not-animated-styles.js';
import '../vaadin-date-picker.js';
import { activateScroller, getDefaultI18n, open } from './common.js';

describe('WAI-ARIA', () => {
  describe('date picker', () => {
    let datepicker, toggleButton, input, label, helper, error;

    beforeEach(() => {
      datepicker = fixtureSync(`<vaadin-date-picker helper-text="Week day" label="Date"></vaadin-date-picker>`);
      toggleButton = datepicker.shadowRoot.querySelector('[part="toggle-button"]');
      input = datepicker.inputElement;
      label = datepicker.querySelector('[slot=label]');
      error = datepicker.querySelector('[slot=error-message]');
      helper = datepicker.querySelector('[slot=helper]');
    });

    it('should set role attribute on the native input', () => {
      expect(input.getAttribute('role')).to.equal('combobox');
    });

    it('should disable browser autocomplete on the native input', () => {
      expect(input.getAttribute('autocomplete')).to.equal('off');
    });

    it('should set aria-labelledby attribute on the native input', () => {
      expect(input.getAttribute('aria-labelledby')).to.equal(label.id);
    });

    it('should set aria-describedby with helper text ID when valid', () => {
      const aria = input.getAttribute('aria-describedby');
      expect(aria).to.include(helper.id);
      expect(aria).to.not.include(error.id);
    });

    it('should add error message ID to aria-describedby when invalid', async () => {
      datepicker.invalid = true;
      await aTimeout(0);
      const aria = input.getAttribute('aria-describedby');
      expect(aria).to.include(helper.id);
      expect(aria).to.include(error.id);
    });

    it('should have button roles on buttons', () => {
      // Indicate icon buttons as clickable. Especially helpful on touch devices.
      expect(toggleButton.getAttribute('role')).to.equal('button');
    });

    // TODO: clarify if this is still needed
    it.skip('should have label properties on buttons', () => {
      // Give spoken names for the icon buttons.
      expect(toggleButton.getAttribute('aria-label')).to.equal('Calendar');
    });

    // TODO: clarify if this is still needed
    it.skip('should have label properties on buttons in correct locale', () => {
      datepicker.set('i18n.calendar', 'kalenteri');
      expect(toggleButton.getAttribute('aria-label')).to.equal('kalenteri');
    });

    it('should have expanded state false on the input', () => {
      // Indicate that there is a collapsible calendar, closed by default.
      expect(input.getAttribute('aria-expanded')).to.equal('false');
    });

    it('should have expanded state true on the input when opened', () => {
      datepicker.open();

      expect(input.getAttribute('aria-expanded')).to.equal('true');
    });

    it('should set aria-hidden on all calendars except focused one', async () => {
      await open(datepicker);
      await nextRender(datepicker);
      const calendars = datepicker._overlayContent.querySelectorAll('vaadin-month-calendar');
      calendars.forEach((calendar) => {
        const focused = calendar.shadowRoot.querySelector('[part="date"][focused]');
        expect(calendar.getAttribute('aria-hidden')).to.equal(focused ? null : 'true');
      });
    });
  });

  describe('overlay contents', () => {
    var overlay;

    beforeEach(async () => {
      overlay = fixtureSync(`<vaadin-date-picker-overlay-content></vaadin-date-picker-overlay-content>`);
      overlay.$.monthScroller.bufferSize = 0;
      overlay.$.yearScroller.bufferSize = 1;
      overlay.i18n = getDefaultI18n();
      await nextFrame();
    });

    describe('year scroller contents', () => {
      let scroller, yearScrollerContents;

      beforeEach(async () => {
        scroller = overlay.$.yearScroller;
        await activateScroller(scroller);
        yearScrollerContents = scroller.querySelectorAll('div > [part="year-number"]');
      });

      it('should set aria-hidden on the year scroller', () => {
        expect(scroller.getAttribute('aria-hidden')).to.equal('true');
      });

      it('should contain button role for years', () => {
        // Indicate years as clickable.
        const years = Array.from(yearScrollerContents).filter((el) => /\d+/.test(el.textContent));

        expect(years).to.not.be.empty;
        years.forEach((year) => {
          expect(year.getAttribute('role')).to.equal('button');
        });
      });

      it('should have hidden state for dots', () => {
        // Do not speak dots between years.
        const dots = Array.from(yearScrollerContents).map((el) => el.nextElementSibling);

        expect(dots).to.not.be.empty;
        dots.forEach((dot) => {
          expect(dot.getAttribute('aria-hidden')).to.equal('true');
        });
      });
    });
  });

  describe('month calendar contents', () => {
    let monthCalendar;

    beforeEach(async () => {
      monthCalendar = fixtureSync(`<vaadin-month-calendar></vaadin-month-calendar>`);
      monthCalendar.i18n = getDefaultI18n();
      monthCalendar.month = new Date(2016, 1, 1);
      await nextFrame();
      await aTimeout(1);
    });

    it('should set aria-hidden on the month header', () => {
      const monthHeader = monthCalendar.shadowRoot.querySelector('[part="month-header"]');
      expect(monthHeader.getAttribute('aria-hidden')).to.equal('true');
    });

    it('should have columnheader roles on the weekdays', () => {
      const weekdays = monthCalendar.shadowRoot.querySelectorAll('[part="weekday"]:not(:empty)');
      Array.from(weekdays).forEach((weekday) => {
        expect(weekday.getAttribute('role')).to.equal('columnheader');
      });
    });

    it('should have gridcell roles on date cells', () => {
      // The date cells should be spoken with a full date.
      const dateElements = monthCalendar.shadowRoot.querySelectorAll('[part="date"]:not(:empty)');
      expect(dateElements).to.not.be.empty;

      Array.from(dateElements).forEach((dateElement) => {
        expect(dateElement.getAttribute('role')).to.equal('gridcell');
      });
    });

    it('should have disabled state on disabled date cells', () => {
      // just [disabled] attribute is not enough for screen readers, should
      // also contain aria-disabled="true".
      monthCalendar.maxDate = new Date(2016, 1, 10); // 10 February 2016

      const dateElements = monthCalendar.shadowRoot.querySelectorAll('[part="date"]:not(:empty)');
      expect(dateElements[9].getAttribute('aria-disabled')).to.not.equal('true');
      expect(dateElements[10].getAttribute('aria-disabled')).to.equal('true');
    });

    describe('week numbers', () => {
      beforeEach(async () => {
        monthCalendar.showWeekNumbers = true;
        monthCalendar.set('i18n.firstDayOfWeek', 1);
        await nextFrame();
      });

      it('should set aria-hidden on the week numbers', () => {
        const weekNumberElements = monthCalendar.shadowRoot.querySelectorAll('[part="week-number"]');

        Array.from(weekNumberElements).forEach((weekNumberElement) => {
          expect(weekNumberElement.getAttribute('aria-hidden')).to.equal('true');
        });
      });
    });
  });
});
