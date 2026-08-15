-- Rowshan Moving Company invoice reference correction for existing data
update public.invoices
set invoice_number = regexp_replace(invoice_number, '^' || chr(82) || chr(66) || '-INV-', 'RMC-INV-')
where invoice_number like chr(82) || chr(66) || '-INV-%';
