# Interac e-Transfer / No GST update

This version intentionally does not charge or display GST. Stripe/card checkout remains in the repository for future activation but is not part of the visible customer payment flow.

Authorized Interac e-Transfer emails:
- rowshan.1982@gmail.com
- lal@rowshanglobal.com

After deployment, run `supabase/rowshan_no_gst_interac_v7.sql` once in the Supabase SQL Editor so stored settings, existing booking estimates and invoices are normalized to 0 GST.

The Administration invoice list already includes **Copy link**, **Email**, **Text** and **View** actions. The public invoice now includes **Copy Invoice Link** and Interac payment instructions.
