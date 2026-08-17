-- Rowshan Moving Company - No GST / Interac e-Transfer update
-- Run once in Supabase SQL Editor after deploying this website version.
-- The business is not charging GST at this time. Existing invoice/booking totals are normalized to pre-GST subtotals.

begin;

update public.settings
set gst_rate = 0,
    updated_at = now()
where id = 1;

update public.bookings
set gst_amount = 0,
    total_estimate = subtotal,
    updated_at = now()
where coalesce(gst_amount,0) <> 0
   or total_estimate is distinct from subtotal;

update public.invoices
set gst_rate = 0,
    gst_amount = 0,
    total_amount = subtotal,
    final_amount = subtotal,
    updated_at = now()
where coalesce(gst_rate,0) <> 0
   or coalesce(gst_amount,0) <> 0
   or total_amount is distinct from subtotal
   or final_amount is distinct from subtotal;

commit;
