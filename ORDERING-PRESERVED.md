# Big Zix ordering design

Ordering is paused, not removed. The original cart, quantity controls, extras, checkout, delivery/pickup and confirmation remain in index.html, scripts/menu.js and styles/menu.css.

The exact pre-change GitHub revision is bebeb1eecc86b105c64ad8037787485a42741701. A complete local backup is Big-Zix-Ordering-Backup.zip, saved with the November 13 deliverables.

Current flow: browse freely; Order opens a small login-required reminder with links to the separate LOGIN/LOGIN.html and LOGIN/register.html pages. Header Log in and Sign up go directly to those pages. No forms are embedded in the reminder. No account is authenticated, no passwords are saved or sent, and checkout stays paused. Existing guest-cart storage is ignored and retained.

Future work: connect real authentication and order handling before enabling ordering. The orderingEnabled flag in menu.js is a prototype feature switch, not authorization. Preserve the existing ordering design when reconnecting it.
