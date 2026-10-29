// Makes the _ □ × buttons on every window work.
//   _  Minimise: collapse the window down to its title bar (press again to open it)
//   □  Maximise: show the window over the top of the page (press again or Esc to restore)
//   ×  Close: hide the window and add it to the taskbar at the bottom of the screen.
//      Clicking it there puts the window back where it was and jumps to it.
// Works with the main site's <div class="title-bar"> windows and the revision
// guide's <h2> title bars. Nothing is saved: every window is back on reload.
// Load this after the page's other scripts.

(function () {
    let maximised = null;

    // Taskbar for closed windows, fixed to the bottom of the screen
    const dock = document.createElement('nav');
    dock.className = 'win-dock';
    dock.setAttribute('aria-label', 'Closed windows');
    dock.hidden = true;
    const dockLabel = document.createElement('span');
    dockLabel.className = 'win-dock-label';
    dockLabel.textContent = 'Closed windows:';
    dock.appendChild(dockLabel);
    document.body.appendChild(dock);

    function titleOf(win) {
        const heading = win.querySelector(':scope > .title-bar h2, :scope > .title-bar .title-bar-text, :scope > h2');
        return heading ? heading.textContent.trim() : 'Window';
    }

    function makeButton(glyph, label, onClick) {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = glyph;
        button.setAttribute('aria-label', label);
        button.title = label;
        button.addEventListener('click', onClick);
        return button;
    }

    function setMinimised(win, on) {
        const { min } = win.winControls;
        if (on && win === maximised) setMaximised(win, false);
        win.classList.toggle('win-minimised', on);
        min.setAttribute('aria-expanded', String(!on));
        min.title = on ? 'Open' : 'Minimise';
        min.setAttribute('aria-label', `${on ? 'Open' : 'Minimise'} ${win.winControls.title}`);
    }

    function setMaximised(win, on) {
        const { max } = win.winControls;
        if (on) {
            if (maximised && maximised !== win) setMaximised(maximised, false);
            setMinimised(win, false);
            maximised = win;
        } else if (maximised === win) {
            maximised = null;
        }
        win.classList.toggle('win-maximised', on);
        document.body.classList.toggle('win-has-maximised', Boolean(maximised));
        max.textContent = on ? '❐' : '□';
        max.title = on ? 'Restore' : 'Maximise';
        max.setAttribute('aria-label', `${on ? 'Restore' : 'Maximise'} ${win.winControls.title}`);
        max.setAttribute('aria-pressed', String(on));
    }

    function closeWindow(win) {
        if (win === maximised) setMaximised(win, false);
        win.classList.add('win-closed');

        const item = document.createElement('button');
        item.type = 'button';
        item.className = 'win-dock-item';
        item.textContent = win.winControls.title;
        item.title = `Open ${win.winControls.title}`;
        item.addEventListener('click', () => {
            openWindow(win);
            jumpTo(win);
        });
        win.winControls.dockItem = item;
        dock.appendChild(item);
        updateDock();
        // Keep keyboard users somewhere sensible
        item.focus();
    }

    function openWindow(win) {
        if (!win.classList.contains('win-closed')) return;
        win.classList.remove('win-closed');
        win.winControls.dockItem.remove();
        win.winControls.dockItem = null;
        updateDock();
    }

    function jumpTo(win) {
        win.scrollIntoView({ behavior: 'smooth', block: 'start' });
        win.winControls.min.focus({ preventScroll: true });
    }

    function updateDock() {
        dock.hidden = !dock.querySelector('.win-dock-item');
        document.body.classList.toggle('win-dock-open', !dock.hidden);
    }

    function enhance(win) {
        if (win.winControls) return;
        const bar = win.querySelector(':scope > .title-bar');
        const heading = win.querySelector(':scope > h2');
        if (!bar && !heading) return;

        const title = titleOf(win);
        const controls = document.createElement('div');
        controls.className = 'title-bar-controls';
        const min = makeButton('_', `Minimise ${title}`, () => setMinimised(win, !win.classList.contains('win-minimised')));
        const max = makeButton('□', `Maximise ${title}`, () => setMaximised(win, win !== maximised));
        const close = makeButton('×', `Close ${title}`, () => closeWindow(win));
        min.setAttribute('aria-expanded', 'true');
        max.setAttribute('aria-pressed', 'false');
        controls.append(min, max, close);
        win.winControls = { title, min, max, close, dockItem: null };

        if (bar) {
            // Swap the decorative spans for real buttons
            const old = bar.querySelector('.title-bar-controls');
            if (old) old.replaceWith(controls);
            else bar.appendChild(controls);
        } else {
            // Revision guide: the buttons sit over the right of the <h2>, outside it,
            // so the heading text (used for the page contents list) stays the same
            controls.classList.add('title-bar-controls-float');
            heading.after(controls);
        }
    }

    // Following a link into a closed or minimised window opens it first
    function reveal(target) {
        const win = target && target.closest('.window');
        if (!win || !win.winControls) return;
        const wasHidden = win.classList.contains('win-closed') || win.classList.contains('win-minimised');
        openWindow(win);
        setMinimised(win, false);
        if (wasHidden) target.scrollIntoView({ block: 'start' });
    }

    function revealHash() {
        if (location.hash.length < 2) return;
        try {
            reveal(document.getElementById(decodeURIComponent(location.hash.slice(1))));
        } catch (error) {
            // Not a valid id: nothing to reveal
        }
    }

    window.addEventListener('hashchange', revealHash);
    // Neocities serves ca1.html as /ca1 and index.html as /, so compare without those
    function samePage(path) {
        const tidy = p => p.replace(/(index)?\.html$/, '').replace(/\/$/, '');
        return tidy(path) === tidy(location.pathname);
    }

    // Clicking a link to the hash you're already on doesn't fire hashchange
    document.addEventListener('click', event => {
        const link = event.target.closest('a[href*="#"]');
        if (link && samePage(link.pathname)) setTimeout(revealHash);
    });

    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && maximised) {
            const win = maximised;
            setMaximised(win, false);
            win.winControls.max.focus();
        }
    });

    // For windows added later (e.g. the knowledge organisers page)
    window.enhanceWindows = function (root) {
        (root || document).querySelectorAll('.window').forEach(enhance);
    };

    window.enhanceWindows();
    revealHash();
})();
