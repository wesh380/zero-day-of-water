# Developer Notes

Cytoscape dynamically applies style attributes to nodes and edges as it renders the graph. A modern CSP must therefore allow inline `style` attributes, which is why the policy includes `style-src-attr 'unsafe-inline'`. Stylesheets themselves remain restricted to `style-src-elem 'self'` so only files we serve may be loaded.

Scripts stay strict with `script-src 'self'` and no `'unsafe-inline'` so that executable code is always delivered from trusted files and cannot be injected through markup.
