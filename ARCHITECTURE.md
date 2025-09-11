# Architecture Snapshot (A1)

هدف: خروج از MVP به ساختار Core/UI/Loader با تزریق یکنواخت به Cytoscape.

قانون طلایی تزریق: فقط cy.add(array) (هیچ cy.json({elements}) در سورس)

مرزها (هدف):
- core/: mapper, validator, layout, styles, facade(index)
- ui/: controls, legend, filters, search (فقط از Facade استفاده می‌کند)
- loader/: init/loader/defer (bootstrap + manifest/URLs)

E2E Smoke: صفحه test/water-cld.html باید رندر شود و تعداد node/edge > 0 باشد.

