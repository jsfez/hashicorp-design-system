import { argosScreenshot } from '@argos-ci/playwright';
import { test } from '@playwright/test';
import type { Page } from '@playwright/test';
import { fileURLToPath } from 'node:url';

/**
 * The snapshots below are the ones `showcase/tests/acceptance/percy-test.js`
 * takes, in the same order, under the same names, with the same interactions.
 * The two files describe the same surface: this one drives the built showcase
 * with Playwright instead of driving it through the Ember test container, so
 * the pages are captured at the size a visitor sees them.
 */
type Snapshot = {
  name: string;
  path: string;
  prepare?: (page: Page) => Promise<void>;
};

const SNAPSHOTS: Snapshot[] = [
  { name: 'Typography', path: '/foundations/typography' },
  { name: 'Elevation', path: '/foundations/elevation' },
  { name: 'FocusRing', path: '/foundations/focus-ring' },

  // The translation page renders from a locale picker, so each of the three
  // snapshots is the same route with a different selection.
  { name: 'Translation - English', path: '/internationalization/translation' },
  {
    name: 'Translation - Spanish',
    path: '/internationalization/translation',
    prepare: (page) => page.selectOption('.hds-form-select', 'es-es'),
  },
  {
    name: 'Translation - None (Fallback)',
    path: '/internationalization/translation',
    prepare: (page) => page.selectOption('.hds-form-select', ''),
  },

  // Breakpoints are shown on a frameless page.
  {
    name: 'Breakpoints',
    path: '/foundations/breakpoints/frameless/demo-viewport-breakpoints-visualization',
  },

  { name: 'Accordion', path: '/components/accordion' },
  { name: 'AdvancedTable', path: '/components/advanced-table' },
  { name: 'Alert', path: '/components/alert' },
  { name: 'AppFooter', path: '/components/app-footer' },
  { name: 'AppHeader', path: '/components/app-header' },
  { name: 'AppSideNav', path: '/components/app-side-nav' },
  { name: 'ApplicationState', path: '/components/application-state' },
  { name: 'Badge', path: '/components/badge' },
  { name: 'BadgeCount', path: '/components/badge-count' },
  { name: 'Breadcrumb', path: '/components/breadcrumb' },
  { name: 'Button', path: '/components/button' },
  { name: 'ButtonSet', path: '/components/button-set' },
  { name: 'Card', path: '/components/card' },
  { name: 'CodeBlock', path: '/components/code-block' },
  {
    name: 'CodeEditor',
    path: '/components/code-editor',
    // CodeMirror is loaded lazily; the loaders leaving the DOM is the signal
    // the editors have taken over, the same one the Percy test waits on.
    prepare: (page) =>
      page.waitForFunction(
        () => document.querySelectorAll('.hds-code-editor__loader').length === 0,
      ),
  },
  { name: 'CopyButton', path: '/components/copy/button' },
  { name: 'CopySnippet', path: '/components/copy/snippet' },
  { name: 'Dropdown', path: '/components/dropdown' },
  { name: 'FilterBar', path: '/components/filter-bar' },
  { name: 'Flyout', path: '/components/flyout' },
  { name: 'Form - Layout', path: '/components/form/layout' },
  {
    name: 'Form - Base elements',
    path: '/components/form/base-elements',
    prepare: (page) => page.click('button#dummy-toggle-highlight'),
  },
  { name: 'Form - Checkbox', path: '/components/form/checkbox' },
  { name: 'Form - FileInput', path: '/components/form/file-input' },
  { name: 'Form - KeyValueInputs', path: '/components/form/key-value-inputs' },
  { name: 'Form - MaskedInput', path: '/components/form/masked-input' },
  { name: 'Form - Radio', path: '/components/form/radio' },
  { name: 'Form - RadioCard', path: '/components/form/radio-card' },
  { name: 'Form - Select', path: '/components/form/select' },
  { name: 'Form - SuperSelect', path: '/components/form/super-select' },
  { name: 'Form - TextInput', path: '/components/form/text-input' },
  { name: 'Form - Textarea', path: '/components/form/textarea' },
  { name: 'Form - Toggle', path: '/components/form/toggle' },
  { name: 'Icon', path: '/components/icon' },
  { name: 'IconTile', path: '/components/icon-tile' },
  { name: 'Link Inline', path: '/components/link/inline' },
  { name: 'Link Standalone', path: '/components/link/standalone' },
  { name: 'Modal', path: '/components/modal' },
  {
    name: 'PageHeader',
    path: '/components/page-header',
    prepare: (page) => page.click('button#shw-component-toggle-highlight'),
  },
  { name: 'Pagination', path: '/components/pagination' },
  { name: 'Reveal', path: '/components/reveal' },
  { name: 'RichTooltip', path: '/components/rich-tooltip' },
  { name: 'Segmented Group', path: '/components/segmented-group' },
  { name: 'Separator', path: '/components/separator' },
  { name: 'Stepper Indicator', path: '/components/stepper/indicator' },
  { name: 'Stepper List', path: '/components/stepper/list' },
  { name: 'Stepper Nav', path: '/components/stepper/nav' },
  { name: 'Table', path: '/components/table' },
  { name: 'Tabs', path: '/components/tabs' },
  { name: 'Tag', path: '/components/tag' },
  { name: 'Text', path: '/components/text' },

  // `Time` is left out here for the same reason it is left out of the Percy
  // test: its dynamic rendering triggers an invalidation error.

  { name: 'Toast', path: '/components/toast' },
  { name: 'Tooltip', path: '/components/tooltip' },
  { name: 'AppFrame', path: '/layouts/app-frame' },
  { name: 'Flex', path: '/layouts/flex' },
  { name: 'Grid', path: '/layouts/grid' },
  { name: 'PowerSelect', path: '/overrides/power-select' },
  { name: 'DialogPrimitive', path: '/utilities/dialog-primitive' },
  { name: 'DismissButton', path: '/utilities/dismiss-button' },
  { name: 'PopoverPrimitive', path: '/utilities/popover-primitive' },
];

// The widths Percy uses for this project. There is no `.percy.yml`, so the
// snapshots go out at the CLI defaults.
const WIDTHS = [375, 1280];
const MIN_HEIGHT = 1024;

// On CI the reporter uploads the captures and this is unused. On a local run
// with no token they are written to disk instead, and the default relative
// folder resolves against the working directory: name it outright so `pnpm
// test:argos` leaves its output next to this spec wherever it is called from.
const SCREENSHOT_ROOT = fileURLToPath(new URL('screenshots', import.meta.url));

// `ARGOS_ONLY=Accordion,Badge` narrows a local run to the pages being looked
// at rather than the whole showcase.
const only = process.env.ARGOS_ONLY?.split(',').map((name) => name.trim());
const snapshots = SNAPSHOTS.filter(
  (snapshot) => !only || only.includes(snapshot.name),
);

// Walk the page once from top to bottom before capturing it.
//
// `hds-code-editor` mounts CodeMirror from an `IntersectionObserver` unless
// `isTesting()` is true, so outside the Ember test container the editors below
// the fold stay on their spinner. A full-page screenshot does not scroll, so
// without this pass the tall pages are captured half-loaded.
const revealLazyContent = (page: Page) =>
  page.evaluate(async () => {
    const step = Math.max(window.innerHeight, 200);
    const nextFrame = () =>
      new Promise((resolve) => {
        requestAnimationFrame(() => setTimeout(resolve, 50));
      });

    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await nextFrame();
    }

    window.scrollTo(0, 0);
    await nextFrame();
  });

const settle = async (page: Page) => {
  await page.evaluate(() => document.fonts.ready);

  // Hold until the markup stops changing, capped so a page with a running
  // animation still gets captured.
  let previousMarkup = '';
  let stableSamples = 0;

  for (let i = 0; i < 40 && stableSamples < 2; i++) {
    const markup = await page.evaluate(() => document.body.innerHTML);

    stableSamples = markup === previousMarkup ? stableSamples + 1 : 0;
    previousMarkup = markup;
    if (stableSamples < 2) {
      await page.waitForTimeout(250);
    }
  }

  // Settled markup is not a settled picture: a disclosure animates its panel
  // through a CSS transition without ever touching `innerHTML`. Let every
  // animation that has an end reach it, and leave the endless ones alone.
  await page.evaluate(async () => {
    const finite = document.getAnimations().filter((animation) => {
      const { endTime } = animation.effect?.getComputedTiming() ?? {};

      return (
        animation.playState === 'running' &&
        typeof endTime === 'number' &&
        Number.isFinite(endTime)
      );
    });

    await Promise.race([
      Promise.all(
        finite.map((animation) => animation.finished.catch(() => undefined)),
      ),
      new Promise((resolve) => {
        setTimeout(resolve, 2000);
      }),
    ]);
  });

  // Overflowing containers (tab bars, tables, side navs) can settle on an
  // arbitrary offset: pin every scroll position before capturing.
  await page.evaluate(() => {
    for (const element of Array.from(document.querySelectorAll('*'))) {
      if (element.scrollLeft !== 0) element.scrollLeft = 0;
      if (element.scrollTop !== 0) element.scrollTop = 0;
    }
  });
};

for (const snapshot of snapshots) {
  test(snapshot.name, async ({ page }) => {
    for (const width of WIDTHS) {
      await page.setViewportSize({ width, height: MIN_HEIGHT });
      await page.goto(snapshot.path, { waitUntil: 'networkidle' });
      await revealLazyContent(page);
      await snapshot.prepare?.(page);
      await settle(page);

      // Some pages show a loader or a progress indicator on purpose and stay
      // `aria-busy` for as long as they are mounted. Read that off the DOM
      // rather than guessing from the page name; the markup has already held
      // still above, so anything still busy is the intended state.
      const staysBusy = await page.evaluate(
        () => document.querySelector('[aria-busy="true"]') !== null,
      );

      await argosScreenshot(page, `${snapshot.name} - ${width}`, {
        root: SCREENSHOT_ROOT,
        fullPage: true,
        stabilize: { waitForAriaBusy: !staysBusy },
      });
    }
  });
}
