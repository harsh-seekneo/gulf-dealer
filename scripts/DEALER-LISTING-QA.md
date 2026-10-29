# Dealer listing flow

The dealer add/edit route now composes the existing section components on one
page. Section validation and payload builders are reused through registered save
callbacks. Publishing validates every section before making save/upload requests.
Saving a draft explicitly persists valid sections. Opening a new form makes only
a read-only request for its existing quota and media limits. Category changes and
input changes stay in React memory: Back and refresh discard all unsaved inputs
and files, including edits made after saving a draft. Existing manually saved
drafts still load their last saved server values. Consent is never restored automatically.

Single-value selectors use a searchable modal and advance in form order. Back,
close, keyboard focus containment, dependent model/variant loading and the Other
entry paths are supported. Multiple-feature groups use the admin design.

No category configuration, required-field definition, price rule, media-size
limit, gallery limit, subscription quota or personal-listing approval rule was
changed. Dealer-business drafts publish directly only after server verification
of their approved dealer profile and linked active subscription. Quota and listing
publication writes share the existing transaction. Existing pending listings are
not migrated, and published full-edit restrictions are retained.

## Performance changes

- Concurrent identical catalog requests share one promise; settled responses are
  discarded so later loads fetch current admin configuration.
- Initial form limits are read without creating a draft, and Strict Mode reads share one request.
- A listing is created only for an explicit Save Draft or Publish action, with
  one in-flight creation promise and a per-mount request key for safe retries.
- Unchanged sections are not saved again on a retry within the same form session.
- Successful file uploads are reused on retry, keeping existing concurrency.
- Upload completion ignores already-attached S3 image keys before checking limits.
- Section/media saves populate the document already saved, avoiding another root
  listing query while keeping the response's populated fields.

## Verification

- Dealer build: `npm run build` with production-shaped URL environment overrides
  (`VITE_API_BASE_URL` must end in `/api/v1`). No environment files were edited.
- Dealer lint: `npm run lint` (existing unrelated warnings remain).
- Client request tests: `node --test scripts/requestDeduplication.test.mjs`.
- Server tests: `node --test tests/dealerDirectPublish.test.js tests/listingPrice.test.js tests/searchPerformance.test.js`.
- Local browser fixture: run dealer Vite and open
  `/scripts/listing-form-fixture.html`. It uses synthetic data and Axios adapters,
  so no real listing, user account, storage upload or payment is touched.

Browser checks cover Brand → Model → Variant auto-advance, replacing dependent
options, Electric field visibility, Sale/Rent pricing, required consent, invalid
publish blocking, draft saving, feature selection payload preservation, special
number conditions, success rendering and a 390 px mobile viewport.

Real database/S3 integration and deployment are outside this local verification.

Use `?new=1` on the fixture URL to verify no automatic writes on a new form;
`?new=1&complete=1` seeds complete in-memory details for publication testing.
The fixture navigation links allow leaving the form and reopening its manually
saved backend fixture record without persisting unsaved form state in storage.
