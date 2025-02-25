import { expect } from '@esm-bundle/chai';
import { aTimeout, fixtureSync, nextFrame, oneEvent } from '@vaadin/testing-helpers';
import sinon from 'sinon';
import '@vaadin/vaadin-text-field/vaadin-text-field.js';
import { FieldHighlighter } from '../src/vaadin-field-highlighter.js';

describe('field highlighter', () => {
  let field;
  let highlighter;
  let outline;
  let wrapper;
  let overlay;

  const getTags = () => {
    return overlay.content.querySelectorAll('vaadin-user-tag');
  };

  beforeEach(() => {
    field = fixtureSync(`<vaadin-text-field></vaadin-text-field>`);
    highlighter = FieldHighlighter.init(field);
    outline = field.shadowRoot.querySelector('[part="outline"]');
    wrapper = field.shadowRoot.querySelector('vaadin-user-tags');
    overlay = wrapper.$.overlay;
  });

  describe('initialization', () => {
    it('should create field highlighter instance', () => {
      expect(highlighter).to.be.ok;
    });

    it('should create field outline instance', () => {
      expect(outline).to.be.ok;
    });

    it('should set field as the field highlighter host', () => {
      expect(highlighter.host).to.equal(field);
    });

    it('should set has-highlighter attribute on the field', () => {
      expect(field.hasAttribute('has-highlighter')).to.be.true;
    });

    it('should position the outline based on the field', () => {
      const { position, top, left, right, bottom } = getComputedStyle(outline);
      expect(position).to.equal('absolute');
      expect(top).to.equal('0px');
      expect(left).to.equal('0px');
      expect(right).to.equal('0px');
      expect(bottom).to.equal('0px');
    });

    it('should not show outline by default', () => {
      expect(getComputedStyle(outline).opacity).to.equal('0');
    });

    it('should set pointer-events on the outline to none', () => {
      expect(getComputedStyle(outline).pointerEvents).to.equal('none');
    });
  });

  describe('users', () => {
    const user1 = { id: 'a', name: 'foo', colorIndex: 0 };
    const user2 = { id: 'b', name: 'var', colorIndex: 1 };
    const user3 = { id: 'c', name: 'baz', colorIndex: 2 };

    const addUser = (user) => {
      FieldHighlighter.addUser(field, user);
      wrapper.requestContentUpdate();
    };

    const removeUser = (user) => {
      FieldHighlighter.removeUser(field, user);
      wrapper.requestContentUpdate();
    };

    const setUsers = (users) => {
      FieldHighlighter.setUsers(field, users);
      wrapper.requestContentUpdate();
    };

    describe('adding and removing', () => {
      it('should add users to the highlighter', () => {
        addUser(user1);
        expect(highlighter.users).to.deep.equal([user1]);

        addUser(user2);
        expect(highlighter.users).to.deep.equal([user1, user2]);
      });

      it('should remove users from the highlighter', () => {
        addUser(user1);
        removeUser(user1);
        expect(highlighter.users).to.deep.equal([]);
      });

      it('should add multiple users at a time', () => {
        setUsers([user1, user2]);
        expect(highlighter.users).to.deep.equal([user1, user2]);
      });

      it('should remove users if empty array is passed', () => {
        setUsers([user1, user2]);
        setUsers([]);
        expect(highlighter.users).to.deep.equal([]);
      });

      it('should not add user if empty value is passed', () => {
        addUser(user1);
        addUser(null);
        expect(highlighter.users).to.deep.equal([user1]);
      });

      it('should not remove user if no value is passed', () => {
        addUser(user1);
        removeUser();
        expect(highlighter.users).to.deep.equal([user1]);
      });
    });

    describe('active user', () => {
      it('should set active user on the highlighter', () => {
        addUser(user1);
        expect(highlighter.user).to.deep.equal(user1);
      });

      it('should set last added user as active', () => {
        setUsers([user1, user2]);
        expect(highlighter.user).to.deep.equal(user2);
      });

      it('should set attribute on the outline when user is added', () => {
        addUser(user1);
        expect(outline.hasAttribute('has-active-user')).to.be.true;
      });

      it('should show highlighter when user is added', async () => {
        addUser(user1);
        await nextFrame();
        expect(getComputedStyle(outline).opacity).to.equal('1');
      });

      it('should remove attribute when user is removed', () => {
        addUser(user1);
        removeUser(user1);
        expect(outline.hasAttribute('has-active-user')).to.be.false;
      });

      it('should make previous user active when user is removed', () => {
        addUser(user1);
        addUser(user2);
        removeUser(user2);
        expect(highlighter.user).to.deep.equal(user1);
      });

      it('should reset user when all the users are removed', () => {
        addUser(user1);
        addUser(user2);
        removeUser(user2);
        removeUser(user1);
        expect(highlighter.user).to.equal(null);
      });

      it('should reset user when multiple users are removed', () => {
        setUsers([user1, user2]);
        setUsers([]);
        expect(highlighter.user).to.equal(null);
      });
    });

    describe('overlay', () => {
      afterEach(() => {
        if (overlay.opened) {
          overlay.opened = false;
        }
      });

      it('should open overlay on field focusin', async () => {
        addUser(user1);
        await nextFrame();
        field.dispatchEvent(new CustomEvent('focusin'));
        expect(overlay.opened).to.equal(true);
      });

      it('should close overlay on field focusout', async () => {
        addUser(user1);
        await nextFrame();
        field.dispatchEvent(new CustomEvent('focusin'));
        field.dispatchEvent(new CustomEvent('focusout'));
        await aTimeout(1);
        expect(overlay.opened).to.equal(false);
      });

      it('should open overlay on field mouseenter', async () => {
        addUser(user1);
        await nextFrame();
        field.dispatchEvent(new CustomEvent('mouseenter'));
        highlighter.observer._mouseDebouncer.flush();
        expect(overlay.opened).to.equal(true);
      });

      it('should close overlay on field mouseleave', async () => {
        addUser(user1);
        await nextFrame();
        field.dispatchEvent(new CustomEvent('mouseenter'));
        highlighter.observer._mouseDebouncer.flush();
        field.dispatchEvent(new CustomEvent('mouseleave'));
        expect(overlay.opened).to.equal(false);
      });

      it('should not close overlay on field mouseleave after focusin', async () => {
        addUser(user1);
        await nextFrame();
        field.dispatchEvent(new CustomEvent('mouseenter'));
        highlighter.observer._mouseDebouncer.flush();
        field.dispatchEvent(new CustomEvent('focusin'));
        field.dispatchEvent(new CustomEvent('mouseleave'));
        expect(overlay.opened).to.equal(true);
      });

      it('should not close overlay on field focusout after mouseenter', async () => {
        addUser(user1);
        await nextFrame();
        field.dispatchEvent(new CustomEvent('focusin'));
        field.dispatchEvent(new CustomEvent('mouseenter'));
        highlighter.observer._mouseDebouncer.flush();
        field.dispatchEvent(new CustomEvent('focusout'));
        expect(overlay.opened).to.equal(true);
      });

      it('should not close overlay on field mouseleave to overlay', async () => {
        addUser(user1);
        await nextFrame();
        field.dispatchEvent(new CustomEvent('mouseenter'));
        highlighter.observer._mouseDebouncer.flush();
        const leave = new CustomEvent('mouseleave');
        leave.relatedTarget = overlay;
        field.dispatchEvent(leave);
        expect(overlay.opened).to.equal(true);
      });

      it('should close overlay on overlay mouseleave', async () => {
        addUser(user1);
        await nextFrame();
        field.dispatchEvent(new CustomEvent('mouseenter'));
        highlighter.observer._mouseDebouncer.flush();
        overlay.dispatchEvent(new CustomEvent('mouseleave'));
        expect(overlay.opened).to.equal(false);
      });

      it('should not close overlay on overlay mouseleave to field', async () => {
        addUser(user1);
        await nextFrame();
        field.dispatchEvent(new CustomEvent('mouseenter'));
        highlighter.observer._mouseDebouncer.flush();
        const leave = new CustomEvent('mouseleave');
        leave.relatedTarget = field;
        overlay.dispatchEvent(leave);
        expect(overlay.opened).to.equal(true);
      });

      it('should set position on tags overlay when opened', async () => {
        const spy = sinon.spy(wrapper, '_setPosition');
        addUser(user1);
        await nextFrame();
        field.dispatchEvent(new CustomEvent('mouseenter'));
        highlighter.observer._mouseDebouncer.flush();
        expect(spy.callCount).to.equal(1);
      });

      it('should not re-position overlay on mouseenter from overlay', async () => {
        const spy = sinon.spy(wrapper, '_setPosition');
        addUser(user1);
        await nextFrame();
        field.dispatchEvent(new CustomEvent('mouseenter'));
        highlighter.observer._mouseDebouncer.flush();
        // Emulate second mouseenter from overlay
        const enter = new CustomEvent('mouseenter');
        enter.relatedTarget = overlay;
        field.dispatchEvent(enter);
        expect(spy.callCount).to.equal(1);
      });

      it('should close overlay when users set to empty while opened', async () => {
        field.dispatchEvent(new CustomEvent('focusin'));
        setUsers([user1, user2]);
        await nextFrame();
        expect(overlay.opened).to.equal(true);
        setUsers([]);
        await nextFrame();
        expect(overlay.opened).to.equal(false);
      });
    });

    describe('user tags opened', () => {
      let tags;

      beforeEach(() => {
        wrapper.show();
      });

      afterEach(() => {
        if (overlay.opened) {
          overlay.opened = false;
        }
      });

      it('should create user tags for each added user', () => {
        addUser(user1);
        addUser(user2);
        tags = getTags();
        expect(tags.length).to.equal(2);
      });

      it('should remove user tag when user is removed', () => {
        addUser(user1);
        addUser(user2);
        removeUser(user2);
        tags = getTags();
        expect(tags.length).to.equal(1);
      });

      it('should set tag background color based on user index', () => {
        setUsers([user1, user2]);
        tags = getTags();
        document.documentElement.style.setProperty('--vaadin-user-color-0', 'red');
        document.documentElement.style.setProperty('--vaadin-user-color-1', 'blue');
        expect(getComputedStyle(tags[0]).backgroundColor).to.equal('rgb(0, 0, 255)');
        expect(getComputedStyle(tags[1]).backgroundColor).to.equal('rgb(255, 0, 0)');
      });

      it('should not set custom property if index is null', () => {
        addUser({ name: 'xyz', colorIndex: null });
        tags = getTags();
        expect(getComputedStyle(tags[0]).getPropertyValue('--vaadin-user-tag-color')).to.equal('');
      });

      it('should dispatch event on tag mousedown', () => {
        addUser(user1);
        const tag = getTags()[0];
        const spy = sinon.spy();
        tag.addEventListener('user-tag-click', spy);
        tag.dispatchEvent(new Event('mousedown'));
        expect(spy.callCount).to.equal(1);
      });

      it('should reuse existing user tag when user is moved', () => {
        setUsers([user3, user2]);
        const oldTags = getTags();
        setUsers([user1, user2, user3]);
        const newTags = getTags();
        // ['b', 'c'] -> ['a', 'b', 'c']
        expect(newTags[1].id).to.deep.equal(oldTags[0].id);
        expect(newTags[2].id).to.deep.equal(oldTags[1].id);
      });

      it('should handle pending changes properly', () => {
        FieldHighlighter.setUsers(field, [user3, user2]);
        field.dispatchEvent(new CustomEvent('focusin'));
        FieldHighlighter.setUsers(field, []);
        wrapper.requestContentUpdate();
        expect(getTags().length).to.equal(0);
      });
    });

    describe('user tags closed', () => {
      let tags;

      beforeEach(async () => {
        wrapper.show();
        setUsers([user2, user3]);
        wrapper.hide();
        overlay._flushAnimation('closing');
        await nextFrame();
        tags = overlay.content.querySelector('[part="tags"]');
      });

      it('should render and hide all tags except new ones', async () => {
        FieldHighlighter.setUsers(field, [user1, user2, user3]);
        await oneEvent(overlay, 'vaadin-overlay-open');
        const allTags = tags.querySelectorAll('vaadin-user-tag');
        expect(tags.querySelectorAll('vaadin-user-tag').length).to.equal(3);
        expect(getComputedStyle(allTags[0]).display).to.equal('block');
        expect(getComputedStyle(allTags[1]).display).to.equal('none');
        expect(getComputedStyle(allTags[2]).display).to.equal('none');
      });

      it('should close overlay and restore tags after a timeout', async () => {
        FieldHighlighter.addUser(field, user1);
        await oneEvent(overlay, 'vaadin-overlay-open');
        await wrapper.flashPromise;
        expect(wrapper.opened).to.equal(false);
      });

      it('should not flash tags when reordering same users', async () => {
        const spy = sinon.spy(wrapper, 'flashTags');
        FieldHighlighter.setUsers(field, [user3, user2]);
        await nextFrame();
        expect(spy.called).to.be.false;
      });

      it('should not update tags when reordering same users', async () => {
        const spy = sinon.spy(wrapper, 'updateTagsSync');
        FieldHighlighter.setUsers(field, [user3, user2]);
        await nextFrame();
        expect(spy.called).to.be.false;
      });
    });

    describe('announcements', () => {
      let clock;
      let region;

      before(() => {
        region = document.querySelector('[aria-live]');
      });

      beforeEach(() => {
        clock = sinon.useFakeTimers();
      });

      afterEach(() => {
        clock.restore();
      });

      it('should announce adding a new user', () => {
        addUser(user1);

        clock.tick(150);

        expect(region.textContent).to.equal(`${user1.name} started editing`);
      });

      it('should announce field label, if any', () => {
        field.label = 'Username';
        addUser(user1);

        clock.tick(150);

        expect(region.textContent).to.equal(`${user1.name} started editing ${field.label}`);
      });
    });
  });
});
